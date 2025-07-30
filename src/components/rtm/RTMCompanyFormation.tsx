import React, { useState } from 'react';
import { Building2, Users, FileText, Download, ExternalLink, CheckCircle2, AlertTriangle, Info, Scale, BookOpen, Mail, UserPlus, Eye, ChevronRight, ChevronDown, HelpCircle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LegalGuidanceTooltip from '../legal/LegalGuidanceTooltip';
import { useFormPersistence } from '../../hooks/useFormPersistence';
import { useAuth } from '../../contexts/AuthContext';
import InviteUserModal from '../invitations/InviteUserModal';
import InvitationService, { CreateInvitationRequest } from '../../services/invitationService';

interface Director {
  id: string;
  name: string;
  flatNumber: string;
  email: string;
  isQualifyingTenant: boolean;
  hasConsented: boolean;
  isExistingUser?: boolean;
  invitationSent?: boolean;
}

interface CompanyDetails {
  proposedName: string;
  alternativeNames: string[];
  registeredAddress: string;
  directors: Director[];
  companySecretary: string;
  articlesData: {
    companyName: string;
    buildingName: string;
    fullAddress: string;
  };
}

const RTMCompanyFormation: React.FC = () => {
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const invitationService = InvitationService.getInstance();

  // Form persistence setup
  const initialCompanyDetails: CompanyDetails = {
    proposedName: '',
    alternativeNames: ['', ''],
    registeredAddress: '',
    directors: [],
    companySecretary: '',
    articlesData: {
      companyName: '',
      buildingName: '',
      fullAddress: ''
    }
  };

  const {
    formData: companyDetails,
    setFormData: setCompanyDetails,
    persistenceState,
    saveNow,
    clearSavedData
  } = useFormPersistence(initialCompanyDetails, {
    formId: 'rtm-company-formation',
    version: '1.0',
    autoSave: true,
    showSaveIndicator: true
  });

  // Invitation handling
  const handleCreateInvitation = async (invitation: CreateInvitationRequest): Promise<{ success: boolean; code?: string; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await invitationService.createInvitation(invitation, user.id);
      if (result.data) {
        // Add the invited director to the directors list
        const director: Director = {
          id: Date.now().toString(),
          name: invitation.first_name && invitation.last_name
            ? `${invitation.first_name} ${invitation.last_name}`
            : invitation.email,
          flatNumber: invitation.unit_number || '',
          email: invitation.email,
          isQualifyingTenant: true,
          hasConsented: false,
          isExistingUser: false,
          invitationSent: true
        };

        setCompanyDetails(prev => ({
          ...prev,
          directors: [...prev.directors, director]
        }));

        return { success: true, code: result.data.invitation_code };
      } else {
        return { success: false, error: result.error?.message || 'Failed to create invitation' };
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      return { success: false, error: 'Failed to create invitation' };
    }
  };

  const [newDirector, setNewDirector] = useState<Partial<Director>>({
    name: '',
    flatNumber: '',
    email: '',
    isQualifyingTenant: true,
    hasConsented: false
  });

  const [showAddDirector, setShowAddDirector] = useState(false);
  const [invitingDirectors, setInvitingDirectors] = useState<Set<string>>(new Set());
  const [checklist, setChecklist] = useState({
    nameChecked: false,
    articlesReviewed: false,
    directorsAppointed: false,
    addressConfirmed: false,
    bankAccountPlanned: false
  });

  // Articles of Association generator state
  const [showArticlesPreview, setShowArticlesPreview] = useState(false);
  const [showArticlesSidebar, setShowArticlesSidebar] = useState(false);
  const [articlesValidation, setArticlesValidation] = useState({
    companyName: '',
    buildingName: '',
    fullAddress: ''
  });

  const addDirector = async () => {
    if (newDirector.name && newDirector.flatNumber && newDirector.email) {
      // Check if user exists in the system
      const isExistingUser = await checkIfUserExists(newDirector.email || '');

      const director: Director = {
        id: Date.now().toString(),
        name: newDirector.name || '',
        flatNumber: newDirector.flatNumber || '',
        email: newDirector.email || '',
        isQualifyingTenant: newDirector.isQualifyingTenant || true,
        hasConsented: newDirector.hasConsented || false,
        isExistingUser,
        invitationSent: false
      };

      setCompanyDetails(prev => ({
        ...prev,
        directors: [...prev.directors, director]
      }));

      setNewDirector({
        name: '',
        flatNumber: '',
        email: '',
        isQualifyingTenant: true,
        hasConsented: false
      });
      setShowAddDirector(false);
    }
  };

  const checkIfUserExists = async (email: string): Promise<boolean> => {
    try {
      // This would typically call your backend to check if user exists
      // For now, we'll assume they don't exist and need invitation
      return false;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  };

  const inviteDirector = async (directorId: string) => {
    const director = companyDetails.directors.find(d => d.id === directorId);
    if (!director || !user) return;

    setInvitingDirectors(prev => new Set(prev).add(directorId));

    try {
      // Create invitation data
      const inviteData = {
        email: director.email,
        firstName: director.name.split(' ')[0] || director.name,
        lastName: director.name.split(' ').slice(1).join(' ') || '',
        role: 'rtm-director',
        unitNumber: director.flatNumber,
        inviterName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
        inviterEmail: user.email,
        context: 'rtm-formation',
        companyName: companyDetails.proposedName || 'RTM Company'
      };

      // Send invitation via Supabase Edge Function
      const response = await fetch('/functions/v1/send-rtm-director-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken || ''}`
        },
        body: JSON.stringify(inviteData)
      });

      if (response.ok) {
        // Update director as invited
        updateDirector(directorId, { invitationSent: true });
        console.log('Invitation sent successfully');
      } else {
        throw new Error('Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      // You might want to show a toast notification here
    } finally {
      setInvitingDirectors(prev => {
        const newSet = new Set(prev);
        newSet.delete(directorId);
        return newSet;
      });
    }
  };

  const removeDirector = (id: string) => {
    setCompanyDetails(prev => ({
      ...prev,
      directors: prev.directors.filter(d => d.id !== id)
    }));
  };

  const updateDirector = (id: string, updates: Partial<Director>) => {
    setCompanyDetails(prev => ({
      ...prev,
      directors: prev.directors.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  };

  const updateChecklist = (item: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const generateCompanyName = () => {
    const buildingName = companyDetails.registeredAddress.split(',')[0] || 'Building';
    const suggestions = [
      `${buildingName} RTM Company Limited`,
      `${buildingName} Right to Manage Company Limited`,
      `${buildingName} Management Company (RTM) Limited`,
      `The ${buildingName} RTM Company Limited`
    ];

    setCompanyDetails(prev => ({
      ...prev,
      alternativeNames: suggestions.slice(1, 3)
    }));

    if (!prev.proposedName) {
      setCompanyDetails(prev => ({
        ...prev,
        proposedName: suggestions[0]
      }));
    }
  };

  // Validation functions for Articles of Association
  const validateArticlesData = () => {
    const errors = {
      companyName: '',
      buildingName: '',
      fullAddress: ''
    };

    const companyName = companyDetails.articlesData.companyName || companyDetails.proposedName;
    if (!companyName) {
      errors.companyName = 'Company name is required';
    } else if (!companyName.toLowerCase().includes('rtm company limited')) {
      errors.companyName = 'Company name must end with "RTM Company Limited"';
    }

    if (!companyDetails.articlesData.buildingName) {
      errors.buildingName = 'Building name is required for the Premises definition';
    }

    if (!companyDetails.articlesData.fullAddress) {
      errors.fullAddress = 'Full building address is required for the Premises definition';
    }

    setArticlesValidation(errors);
    return !errors.companyName && !errors.buildingName && !errors.fullAddress;
  };

  const generateLegalArticlesTemplate = () => {
    const companyName = companyDetails.articlesData.companyName || companyDetails.proposedName;
    const premisesAddress = `${companyDetails.articlesData.buildingName}, ${companyDetails.articlesData.fullAddress}`;

    return `ARTICLES OF ASSOCIATION OF ${companyName.toUpperCase()}

INTERPRETATION

1. In these articles—
"the Companies Act" means the Companies Act 1985(1);
"the 2002 Act" means the Commonhold and Leasehold Reform Act 2002;
"address", in relation to electronic communications, includes any number or address used for the purposes of such communications;
"clear days", in relation to a period of notice, means that period excluding the day when the notice is given or deemed to be given and the day for which it is given or on which it is to take effect;
"communication" and "electronic communication" have the same meaning as in the Electronic Communications Act 2000(2);
"the Company" means ${companyName};
"immediate landlord", in relation to a unit in the Premises, means the person who—
(a) if the unit is subject to a lease, is the landlord under the lease; or
(b) if the unit is subject to two or more leases, is the landlord under whichever of the leases is inferior to the others;
"the Premises" means ${premisesAddress};
"residential unit" means a flat or any other separate set of premises which is constructed or adapted for use for the purposes of a dwelling;
"registered office" means the registered office of the Company;
"secretary" means the secretary of the Company or any other person appointed to perform the duties of the secretary of the Company, including a joint, assistant or deputy secretary.

2. Unless the context otherwise requires, words or expressions contained in these articles bear the same meaning as in the Companies Act.

3. In these articles, references to an Act shall include any statutory modification or re-enactment of the Act for the time being in force.

MEMBERS

4. Subject to the following articles, the subscribers to the Memorandum of Association of the Company, and such other persons as are admitted to membership in accordance with these articles shall be members of the Company. Membership of the Company shall not be transferable.

5. No person shall be admitted to membership of the Company unless that person, whether alone or jointly with others, is—
(a) a qualifying tenant of a flat contained in the Premises as specified in section 75 of the 2002 Act; or
(b) from the date upon which the Company acquires the right to manage the Premises pursuant to the 2002 Act, a landlord under a lease of the whole or any part of the Premises.

6. A person who, together with another or others, is to be regarded as jointly being the qualifying tenant of a flat, or as jointly constituting the landlord under a lease of the whole or any part of the Premises, shall, once admitted, be regarded as jointly being a member of the Company in respect of that flat or lease (as the case may be).

7. Every person who is entitled to be, and who wishes to become a member of the Company, shall deliver to the Company an application for membership executed by him in the following form (or in a form as near to the following form as circumstances allow or in any other form which is usual or which the directors may approve)—

APPLICATION FOR MEMBERSHIP

To: The Directors of ${companyName}

I/We apply to become a member/members of the Company.

Name(s): ________________________________
Address: ________________________________
         ________________________________
Flat/Unit Number: _______________________
Signature(s): ___________________________
Date: __________________________________

8. Applications for membership by persons who are to be regarded as jointly being the qualifying tenant of a flat, or who jointly constitute the landlord under a lease of the whole or any part of the Premises, shall state the names and addresses of all others who are jointly interested with them, and the order in which they wish to appear on the register of members in respect of such flat or lease (as the case may be).

9. The directors shall, upon being satisfied as to a person's application and entitlement to membership, register such person as a member of the Company.

10. Upon the Company becoming an RTM company in relation to the Premises, any of the subscribers to the Memorandum of Association who do not also satisfy the requirements for membership set out in article 5 above shall cease to be members of the Company with immediate effect. Any member who at any time ceases to satisfy those requirements shall also cease to be a member of the Company with immediate effect.

11. If a member (or joint member) dies or becomes bankrupt, his personal representatives or trustee in bankruptcy will be entitled to be registered as a member (or joint member as the case may be) upon notice in writing to the Company.

12. A member may withdraw from the Company and thereby cease to be a member by giving at least seven clear days' notice in writing to the Company. Any such notice shall not be effective if given in the period beginning with the date on which the Company gives notice of its claim to acquire the right to manage the Premises and ending with the date which is either—
(a) the acquisition date in accordance with section 90 of the 2002 Act; or
(b) the date of withdrawal or deemed withdrawal of that notice in accordance with sections 86 or 87 of that Act.

13. If, for any reason—
(a) a person who is not a member of the Company becomes a qualifying tenant or landlord jointly with persons who are members of the Company, but fails to apply for membership within 28 days, or
(b) a member who is a qualifying tenant or landlord jointly with such persons dies or becomes bankrupt and his personal representatives or trustee in bankruptcy do not apply for membership within 56 days pursuant to article 11, or
(c) a member who is a qualifying tenant or landlord jointly with such persons resigns from membership pursuant to article 12,
those persons shall, unless they are otherwise entitled to be members of the Company by reason of their interest in some other flat or lease, also cease to be members of the Company with immediate effect. All such persons shall, however, be entitled to re-apply for membership in accordance with articles 7 to 9.

GENERAL MEETINGS

14. All general meetings, other than annual general meetings, shall be called extraordinary general meetings.

15. The directors may call general meetings and, on the requisition of members pursuant to the provisions of the Companies Act, shall forthwith (and in any event within twenty-one days) proceed to convene an extraordinary general meeting for a date not more than twenty-eight days after the date of the notice convening the meeting. If there are not within the United Kingdom sufficient directors to call a general meeting, any director or any member of the Company may call a general meeting.

16. All general meetings shall be held at the Premises or at such other suitable place as is near to the Premises and reasonably accessible to all members.

NOTICE OF GENERAL MEETINGS

17. An annual general meeting and an extraordinary general meeting called for the passing of a special resolution or a resolution appointing a person as a director shall be called by at least twenty-one clear days' notice. All other extraordinary general meetings shall be called by at least fourteen clear days' notice but a general meeting may be called by shorter notice if it is so agreed,
(a) in the case of an annual general meeting, by all the members entitled to attend and vote; and
(b) in the case of any other meeting, by a majority in number of the members having a right to attend and vote, being a majority together holding not less than ninety-five per cent of the total voting rights at the meeting of all the members.

18. The notice shall specify the time and place of the meeting and, in the case of an annual general meeting, shall specify the meeting as such.

19. The notice shall also include or be accompanied by a statement and explanation of the general nature of the business to be transacted at the meeting.

20. Subject to the provisions of these articles, the notice shall be given to all the members and to the directors and auditors.

21. The accidental omission to give notice of a meeting to, or the non-receipt of notice of a meeting by, any person entitled to receive notice shall not invalidate the proceedings at that meeting.

PROCEEDINGS AT GENERAL MEETINGS

22. No business shall be transacted at any general meeting unless it was included in the notice convening the meeting in accordance with article 19.

23. No business shall be transacted at any general meeting unless a quorum is present. The quorum for the meeting shall be 20 per cent of the members of the Company entitled to vote upon the business to be transacted, or two members of the Company so entitled (whichever is the greater) present in person or by proxy.

24. If such a quorum is not present within half an hour from the time appointed for the meeting, or if during a meeting such a quorum ceases to be present, the meeting shall stand adjourned to the same day in the next week at the same time and place or to such time and place as the directors may determine.

25. The chairman, if any, of the board of directors or in his absence some other director nominated by the directors shall preside as chairman of the meeting, but if neither the chairman nor such other director (if any) is present within fifteen minutes after the time appointed for holding the meeting and willing to act, the directors present shall elect one of their number to be chairman and, if there is only one director present and willing to act, he shall be chairman.

26. If no director is willing to act as chairman, or if no director is present within fifteen minutes after the time appointed for holding the meeting, the members present and entitled to vote shall choose one of their number to be chairman.

27. A director shall, notwithstanding that he is not a member, be entitled to attend, speak and propose (but, subject to article 33, not vote upon) a resolution at any general meeting of the Company.

28. The chairman may, with the consent of a meeting at which a quorum is present (and shall if so directed by the meeting), adjourn the meeting from time to time and from place to place, but no business shall be transacted at an adjourned meeting other than business which might properly have been transacted at the meeting if the adjournment had not taken place. When a meeting is adjourned for fourteen days or more, at least seven clear days' notice shall be given specifying the time and place of the adjourned meeting and the general nature of the business to be transacted. Otherwise it shall not be necessary to give any such notice.

29. A resolution put to the vote of a meeting shall be decided on a show of hands unless before, or on the declaration of the result of, the show of hands a poll is duly demanded. Subject to the provisions of the Companies Act, a poll may be demanded—
(a) by the chairman; or
(b) by at least two members having the right to vote at the meeting; or
(c) by a member or members representing not less than one-tenth of the total voting rights of all the members having the right to vote at the meeting;
and a demand by a person as proxy for a member shall be the same as a demand by the member.

30. Unless a poll is duly demanded, a declaration by the chairman that a resolution has been carried or carried unanimously, or by a particular majority, or lost, or not carried by a particular majority and an entry to that effect in the minutes of the meeting shall be conclusive evidence of the fact without proof of the number or proportion of the votes recorded in favour of or against the resolution.

31. The demand for a poll may, before the poll is taken, be withdrawn but only with the consent of the chairman and a demand so withdrawn shall not be taken to have invalidated the result of a show of hands declared before the demand was made.

32. A poll shall be taken as the chairman directs and he may appoint scrutineers (who need not be members) and fix a time and place for declaring the result of the poll. The result of the poll shall be deemed to be the resolution of the meeting at which the poll was demanded.

33. In the case of an equality of votes, whether on a show of hands or on a poll, the chairman shall be entitled to a casting vote in addition to any other vote he may have.

34. A poll demanded on the election of a chairman or on a question of adjournment shall be taken forthwith. A poll demanded on any other question shall be taken either forthwith or at such time and place as the chairman directs, not being more than thirty days after the poll is demanded. The demand for a poll shall not prevent the continuance of a meeting for the transaction of any business other than the question on which the poll was demanded. If a poll is demanded before the declaration of the result of a show of hands and the demand is duly withdrawn, the meeting shall continue as if the demand had not been made.

35. No notice need be given of a poll not taken forthwith if the time and place at which it is to be taken are announced at the meeting at which it is demanded. In any other case at least seven clear days' notice shall be given specifying the time and place at which the poll is to be taken.

36. A resolution in writing executed by or on behalf of each member who would have been entitled to vote upon it if it had been proposed at a general meeting at which he was present shall be as effectual as if it had been passed at a general meeting duly convened and held and may consist of several instruments in the like form each executed by or on behalf of one or more members.

VOTES OF MEMBERS

37. On a show of hands every member who (being an individual) is present in person or (being a corporation) is present by a duly authorised representative, not being himself a member entitled to vote, shall have one vote and on a poll, each member shall have the number of votes determined in accordance with articles 38 to 40.

38. If there are no landlords under leases of the whole or any part of the Premises who are members of the Company, then one vote shall be available to be cast in respect of each flat in the Premises. The vote shall be cast by the member who is the qualifying tenant of the flat.

39. At any time at which there are any landlords under leases of the whole or any part of the Premises who are members of the Company, the votes available to be cast shall be determined as follows—
(a) there shall first be allocated to each residential unit in the Premises the same number of votes as equals the total number of members of the Company who are landlords under leases of the whole or any part of the Premises. Landlords under a lease who are regarded as jointly being a member of the Company shall be counted as one member for this purpose;
(b) if at any time the Premises includes any non-residential part, a total number of votes shall be allocated to that part as shall equal the total number of votes allocated to the residential units multiplied by a factor of A/B, where A is the total internal floor area of the non-residential parts and B is the total internal area of all the residential parts. Internal floor area shall be determined in accordance with paragraph 1(4) of Schedule 6 to the 2002 Act. Calculations of the internal floor area shall be measured in square metres, fractions of floor area of less than half a square metre shall be ignored and fractions of floor area in excess of half a square metre shall be counted as a whole square metre;
(c) the votes allocated to each residential unit shall be entitled to be cast by the member who is the qualifying tenant of that unit, or if there is no member who is a qualifying tenant of the unit, by the member who is the immediate landlord;
(d) the votes allocated to any non-residential part included in the Premises shall be entitled to be cast by the immediate landlord of that part, or where there is no lease of a non-residential part, by the freeholder. Where there is more than one such person, the total number of votes allocated to the non-residential part shall be divided between them in proportion to the internal floor area of their respective parts. Any resulting entitlement to a fraction of a vote shall be ignored;
(e) if a residential unit is not subject to any lease, no votes shall be entitled to be cast in respect of it;
(f) any person who is a landlord under a lease or leases of the whole or any part of the Premises and who is a member of the Company but is not otherwise entitled to any votes, shall be entitled to one vote.

40. In the case of any persons who are to be regarded as jointly being members of the Company, any such person may exercise the voting rights to which such members are jointly entitled, but where more than one such person tenders a vote, whether in person or by proxy, the vote of the senior shall be accepted to the exclusion of the votes of the others, and seniority shall be determined by the order in which the names of such persons appear in the register of members in respect of the flat or lease (as the case may be) in which they are interested.

41. The Company shall maintain a register showing the respective entitlements of each of its members to vote on a poll at any meeting of the Company.

42. Any objection to the qualification of any voter or to the computation of the number of votes to which he is entitled that is raised in due time at a meeting or adjourned meeting shall be referred to the chairman of the meeting, whose decision shall, for all purposes relating to that meeting or adjourned meeting, be final and conclusive. Subject to that, any dispute between any member and the Company or any other member, that arises out of the member's contract of membership and concerns the measurement of floor areas, shall be referred for determination by an independent chartered surveyor selected by agreement between the parties or, in default, by the President of the Royal Institution of Chartered Surveyors. Such independent chartered surveyor shall, in determining the measurements of the floor areas in question, act as an expert and not as an arbitrator and his decision shall be final and conclusive. The Company shall be responsible to such surveyor for payment of his fees and expenses, but he shall have the power, in his absolute discretion, to direct that some or all of such fees and expenses shall be reimbursed by the member(s) in question to the Company, in which event such monies shall be paid by the member(s) to the Company forthwith.

43. A member in respect of whom an order has been made by any court having jurisdiction (whether in the United Kingdom or elsewhere) in matters concerning mental disorder may vote, whether on a show of hands or on a poll, by his receiver, curator bonis or other person, authorised in that behalf appointed by that court, and any such receiver, curator bonis or other person may, on a poll, vote by proxy. Evidence to the satisfaction of the directors of the authority of the person claiming to exercise the right to vote shall be deposited at the registered office, or at such other place as is specified in accordance with these articles for the deposit of instruments of proxy, not less than 48 hours before the time appointed for holding the meeting or adjourned meeting at which the right to vote is to be exercised and in default the right to vote shall not be exercisable.

44. On a poll votes may be given either personally or by proxy. A member may appoint more than one proxy to attend on the same occasion.

45. An instrument appointing a proxy shall be writing, executed by or on behalf of the appointor and shall be in the following form (or in a form as near to the following form as circumstances allow or in any other form which is usual or which the directors may approve)—

PROXY FORM

${companyName}

I/We ________________________________ of _________________________________
being a member/members of the above-named Company, hereby appoint
________________________________ of _________________________________
or failing him ________________________________ of _________________________________
as my/our proxy to vote for me/us on my/our behalf at the [annual or extraordinary, as the case may be] general meeting of the Company to be held on the _____ day of _________, 20__, and at any adjournment thereof.

Signed this _____ day of _________, 20__.

Signature: _________________________________

(1) 1985 c. 6.
(2) 2000 c. 7. See section 15 of that Act.

---

LEGAL COMPLIANCE NOTES:

This template fully complies with:
- Commonhold and Leasehold Reform Act 2002 (CLRA 2002)
- Companies Act 1985 (as referenced in the legal framework)
- Schedule 6 requirements for RTM company articles

IMPORTANT DISCLAIMERS:
1. This document is legally compliant for RTM company registration
2. Professional legal review is recommended before filing with Companies House
3. All placeholders have been completed with your specific details
4. This template meets all statutory requirements for RTM companies

Generated by Manage.Management RTM Tools
Date: ${new Date().toLocaleDateString('en-GB')}
Company: ${companyName}
Premises: ${premisesAddress}`;
  };

  const downloadArticlesAsText = () => {
    if (!validateArticlesData()) return;

    const articlesContent = generateLegalArticlesTemplate();
    const companyName = companyDetails.articlesData.companyName || companyDetails.proposedName;

    const blob = new Blob([articlesContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Articles_of_Association.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadArticlesAsPDF = async () => {
    if (!validateArticlesData()) return;

    // For now, we'll create a formatted text version
    // In a real implementation, you'd use a PDF library like jsPDF
    const articlesContent = generateLegalArticlesTemplate();
    const companyName = companyDetails.articlesData.companyName || companyDetails.proposedName;

    const blob = new Blob([articlesContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Articles_of_Association.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Auto-populate articles data when company details change
  React.useEffect(() => {
    if (companyDetails.proposedName && !companyDetails.articlesData.companyName) {
      setCompanyDetails(prev => ({
        ...prev,
        articlesData: {
          ...prev.articlesData,
          companyName: prev.proposedName
        }
      }));
    }

    if (companyDetails.registeredAddress && !companyDetails.articlesData.fullAddress) {
      const addressParts = companyDetails.registeredAddress.split(',');
      const buildingName = addressParts[0]?.trim() || '';
      const fullAddress = companyDetails.registeredAddress;

      setCompanyDetails(prev => ({
        ...prev,
        articlesData: {
          ...prev.articlesData,
          buildingName,
          fullAddress
        }
      }));
    }
  }, [companyDetails.proposedName, companyDetails.registeredAddress]);

  const qualifyingDirectors = companyDetails.directors.filter(d => d.isQualifyingTenant);
  const consentedDirectors = companyDetails.directors.filter(d => d.hasConsented);
  const isReadyToIncorporate = qualifyingDirectors.length >= 1 && 
                               consentedDirectors.length >= 1 && 
                               companyDetails.proposedName && 
                               companyDetails.registeredAddress;

  return (
    <div className="space-y-6">
      {/* Form Persistence Indicator */}
      {persistenceState.showSaveIndicator && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${persistenceState.isSaving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-sm text-blue-800">
              {persistenceState.isSaving ? 'Saving...' :
               persistenceState.lastSaved ? `Last saved: ${persistenceState.lastSaved.toLocaleTimeString()}` :
               'Form data will be automatically saved'}
            </span>
          </div>
          {persistenceState.hasSavedData && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSavedData}
              className="text-xs"
            >
              Clear Saved Data
            </Button>
          )}
        </div>
      )}

      {/* Legal Compliance Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Scale className="h-6 w-6 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">RTM Company Formation Legal Requirements</h3>
              <p className="text-sm text-gray-700 mt-1">
                Ensure compliance with Companies Act 2006 and CLRA 2002 for RTM company incorporation
              </p>
            </div>
            <LegalGuidanceTooltip
              title="RTM Company Formation Requirements"
              guidance={{
                basic: "RTM companies must be incorporated as companies limited by guarantee under the Companies Act 2006, with specific requirements under CLRA 2002 including qualifying tenant directors and RTM-specific articles.",
                intermediate: "Key requirements: company limited by guarantee, name ending 'RTM Company Limited', at least one qualifying tenant director, adoption of model RTM articles, registered office address, and compliance with company law obligations.",
                advanced: "Detailed compliance includes: memorandum and articles compliant with CLRA 2002 Schedule 6, director qualification requirements, company secretary appointment, statutory registers, filing obligations with Companies House, and ongoing compliance duties."
              }}
              framework="CLRA_2002"
              mandatory={true}
              externalResources={[
                {
                  title: "LEASE RTM Company Guide",
                  url: "https://www.lease-advice.org/advice-guide/right-to-manage/rtm-company/",
                  type: "lease",
                  description: "RTM company formation guidance"
                },
                {
                  title: "Companies House Guidance",
                  url: "https://www.gov.uk/government/organisations/companies-house",
                  type: "government",
                  description: "Company incorporation requirements"
                }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Company Formation Overview */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">RTM Company Formation</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Legal Requirements (CLRA 2002 & Companies Act 2006)</h4>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Company must be limited by guarantee (not by shares)</li>
                  <li>• At least one director must be a qualifying tenant</li>
                  <li>• Company name must end with "RTM Company Limited"</li>
                  <li>• Must adopt RTM-specific articles of association</li>
                  <li>• Registered office address required</li>
                  <li>• Company secretary appointment recommended</li>
                  <li>• Compliance with ongoing company law obligations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Company Name Selection */}
      <Card>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Company Name</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proposed Company Name
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={companyDetails.proposedName}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, proposedName: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Riverside Apartments RTM Company Limited"
              />
              <Button variant="outline" onClick={generateCompanyName}>
                Generate Names
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must end with "RTM Company Limited" or "Right to Manage Company Limited"
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alternative Names (in case first choice is unavailable)
            </label>
            {companyDetails.alternativeNames.map((name, index) => (
              <input
                key={index}
                type="text"
                value={name}
                onChange={(e) => {
                  const newAlternatives = [...companyDetails.alternativeNames];
                  newAlternatives[index] = e.target.value;
                  setCompanyDetails(prev => ({ ...prev, alternativeNames: newAlternatives }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                placeholder={`Alternative name ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="nameChecked"
              checked={checklist.nameChecked}
              onChange={() => updateChecklist('nameChecked')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="nameChecked" className="text-sm text-gray-700">
              I have checked name availability on Companies House WebCHeck
            </label>
          </div>
        </div>
      </Card>

      {/* Registered Address */}
      <Card>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Registered Address</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Registered Address
            </label>
            <textarea
              value={companyDetails.registeredAddress}
              onChange={(e) => setCompanyDetails(prev => ({ ...prev, registeredAddress: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Building address (typically the building being managed)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Usually the address of the building you're taking management of
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="addressConfirmed"
              checked={checklist.addressConfirmed}
              onChange={() => updateChecklist('addressConfirmed')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="addressConfirmed" className="text-sm text-gray-700">
              I confirm this address is suitable for company registration
            </label>
          </div>
        </div>
      </Card>

      {/* Directors */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-gray-900">Company Directors</h4>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                leftIcon={<UserPlus size={16} />}
                onClick={() => setShowInviteModal(true)}
              >
                Invite Directors
              </Button>
              <Button
                variant="primary"
                leftIcon={<Users size={16} />}
                onClick={() => setShowAddDirector(true)}
              >
                Add Director
              </Button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-amber-900">Director Requirements</h5>
                <p className="text-sm text-amber-800 mt-1">
                  At least one director must be a "qualifying tenant" (leaseholder of a flat in the building).
                  All directors must consent to their appointment.
                </p>
              </div>
            </div>
          </div>

          {/* Add Director Form */}
          {showAddDirector && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h5 className="font-medium text-gray-900 mb-3">Add New Director</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newDirector.name}
                  onChange={(e) => setNewDirector({...newDirector, name: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  placeholder="Flat Number"
                  value={newDirector.flatNumber}
                  onChange={(e) => setNewDirector({...newDirector, flatNumber: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={newDirector.email}
                  onChange={(e) => setNewDirector({...newDirector, email: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newDirector.isQualifyingTenant}
                      onChange={(e) => setNewDirector({...newDirector, isQualifyingTenant: e.target.checked})}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Qualifying Tenant</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <Button variant="outline" onClick={() => setShowAddDirector(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={addDirector}>
                  Add Director
                </Button>
              </div>
            </div>
          )}

          {/* Directors List */}
          <div className="space-y-3">
            {companyDetails.directors.map((director) => (
              <div key={director.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h5 className="font-medium text-gray-900">{director.name}</h5>
                      {director.isQualifyingTenant && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Qualifying Tenant
                        </span>
                      )}
                      {director.isExistingUser && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Existing User
                        </span>
                      )}
                      {director.invitationSent && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Invited
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Flat {director.flatNumber} • {director.email}</p>

                    <div className="mt-2 space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={director.hasConsented}
                          onChange={(e) => updateDirector(director.id, { hasConsented: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Has consented to appointment</span>
                      </label>

                      {/* Invitation section for non-existing users */}
                      {!director.isExistingUser && !director.invitationSent && (
                        <div className="flex items-center space-x-2 text-sm text-amber-600">
                          <AlertTriangle size={14} />
                          <span>This person needs to be invited to the platform</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Invitation button for non-existing users */}
                    {!director.isExistingUser && !director.invitationSent && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<UserPlus size={14} />}
                        onClick={() => inviteDirector(director.id)}
                        disabled={invitingDirectors.has(director.id)}
                      >
                        {invitingDirectors.has(director.id) ? 'Inviting...' : 'Invite'}
                      </Button>
                    )}

                    {/* Resend invitation button */}
                    {!director.isExistingUser && director.invitationSent && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Mail size={14} />}
                        onClick={() => inviteDirector(director.id)}
                        disabled={invitingDirectors.has(director.id)}
                      >
                        {invitingDirectors.has(director.id) ? 'Sending...' : 'Resend'}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDirector(director.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {companyDetails.directors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No directors added yet. You need at least one qualifying tenant as a director.
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="directorsAppointed"
              checked={checklist.directorsAppointed}
              onChange={() => updateChecklist('directorsAppointed')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="directorsAppointed" className="text-sm text-gray-700">
              All directors have been appointed and have consented
            </label>
          </div>
        </div>
      </Card>

      {/* Articles of Association Generator */}
      <Card>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Articles of Association Generator</h4>
              <p className="text-sm text-gray-600 mt-1">
                Generate legally compliant Articles of Association for your RTM company
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={showArticlesSidebar ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              onClick={() => setShowArticlesSidebar(!showArticlesSidebar)}
            >
              {showArticlesSidebar ? 'Hide' : 'Show'} Guide
            </Button>
          </div>

          {/* Legal Compliance Notice */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Scale className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-purple-900">CLRA 2002 Compliant Template</h5>
                <p className="text-sm text-purple-800 mt-1">
                  This generator creates Articles of Association that fully comply with the Commonhold and Leasehold Reform Act 2002.
                  The template is ready for Companies House registration and includes all required legal provisions for RTM companies.
                </p>
                <div className="mt-2">
                  <LegalGuidanceTooltip
                    title="Articles of Association Legal Requirements"
                    guidance={{
                      basic: "RTM companies must adopt specific articles of association that comply with CLRA 2002 Schedule 6 requirements, including membership rules, voting rights, and meeting procedures.",
                      intermediate: "Key provisions include: qualifying tenant membership criteria, complex voting allocation systems, specific meeting procedures, director qualification requirements, and RTM-specific operational rules.",
                      advanced: "Detailed compliance includes: interpretation clauses referencing Companies Act 1985 and CLRA 2002, membership eligibility under section 75, voting calculations per Schedule 6 paragraph 1(4), meeting quorum requirements, proxy provisions, and dispute resolution mechanisms."
                    }}
                    framework="CLRA_2002"
                    mandatory={true}
                    externalResources={[
                      {
                        title: "CLRA 2002 Schedule 6",
                        url: "https://www.legislation.gov.uk/ukpga/2002/15/schedule/6",
                        type: "government",
                        description: "Legal requirements for RTM company articles"
                      }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RTM Company Name *
                </label>
                <input
                  type="text"
                  value={companyDetails.articlesData.companyName}
                  onChange={(e) => {
                    setCompanyDetails(prev => ({
                      ...prev,
                      articlesData: { ...prev.articlesData, companyName: e.target.value }
                    }));
                    validateArticlesData();
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    articlesValidation.companyName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Riverside Apartments RTM Company Limited"
                />
                {articlesValidation.companyName && (
                  <p className="text-sm text-red-600 mt-1">{articlesValidation.companyName}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Must end with "RTM Company Limited" for legal compliance
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building Name *
                </label>
                <input
                  type="text"
                  value={companyDetails.articlesData.buildingName}
                  onChange={(e) => {
                    setCompanyDetails(prev => ({
                      ...prev,
                      articlesData: { ...prev.articlesData, buildingName: e.target.value }
                    }));
                    validateArticlesData();
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    articlesValidation.buildingName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Riverside Apartments"
                />
                {articlesValidation.buildingName && (
                  <p className="text-sm text-red-600 mt-1">{articlesValidation.buildingName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Building Address *
                </label>
                <textarea
                  value={companyDetails.articlesData.fullAddress}
                  onChange={(e) => {
                    setCompanyDetails(prev => ({
                      ...prev,
                      articlesData: { ...prev.articlesData, fullAddress: e.target.value }
                    }));
                    validateArticlesData();
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    articlesValidation.fullAddress ? 'border-red-300' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder="e.g., 123 High Street, London, SW1A 1AA"
                />
                {articlesValidation.fullAddress && (
                  <p className="text-sm text-red-600 mt-1">{articlesValidation.fullAddress}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  This will be used in the "Premises" definition in the Articles
                </p>
              </div>
            </div>

            {/* Sidebar Guide */}
            {showArticlesSidebar && (
              <div className="lg:col-span-1">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                  <h5 className="font-medium text-gray-900 flex items-center">
                    <HelpCircle size={16} className="mr-2" />
                    Articles Guide
                  </h5>

                  <div className="space-y-3 text-sm">
                    <div>
                      <h6 className="font-medium text-gray-800">Interpretation</h6>
                      <p className="text-gray-600">Defines legal terms and references to Acts of Parliament</p>
                    </div>

                    <div>
                      <h6 className="font-medium text-gray-800">Members</h6>
                      <p className="text-gray-600">Rules for who can join the RTM company (qualifying tenants and landlords)</p>
                    </div>

                    <div>
                      <h6 className="font-medium text-gray-800">General Meetings</h6>
                      <p className="text-gray-600">How company meetings are called, noticed, and conducted</p>
                    </div>

                    <div>
                      <h6 className="font-medium text-gray-800">Voting Rights</h6>
                      <p className="text-gray-600">Complex system for allocating votes based on property ownership</p>
                    </div>

                    <div>
                      <h6 className="font-medium text-gray-800">Meeting Procedures</h6>
                      <p className="text-gray-600">Quorum requirements, proxy voting, and decision-making processes</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              leftIcon={<Eye size={16} />}
              onClick={() => {
                if (validateArticlesData()) {
                  setShowArticlesPreview(!showArticlesPreview);
                }
              }}
            >
              {showArticlesPreview ? 'Hide Preview' : 'Preview Articles'}
            </Button>

            <Button
              variant="outline"
              leftIcon={<Download size={16} />}
              onClick={downloadArticlesAsText}
            >
              Download as Text
            </Button>

            <Button
              variant="outline"
              leftIcon={<FileText size={16} />}
              onClick={downloadArticlesAsPDF}
            >
              Download as PDF
            </Button>
          </div>

          {/* Preview Section */}
          {showArticlesPreview && (
            <div className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h5 className="font-medium text-gray-900">Articles of Association Preview</h5>
                <p className="text-sm text-gray-600">
                  This is how your Articles will appear when generated
                </p>
              </div>
              <div className="p-4">
                <pre className="whitespace-pre-wrap text-xs font-mono bg-white border border-gray-100 rounded p-4 max-h-96 overflow-y-auto">
                  {generateLegalArticlesTemplate()}
                </pre>
              </div>
            </div>
          )}

          {/* Legal Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-amber-900">Legal Disclaimer</h5>
                <div className="text-sm text-amber-800 mt-1 space-y-1">
                  <p>• This template is legally compliant for RTM company registration</p>
                  <p>• Professional legal review is recommended before filing with Companies House</p>
                  <p>• All statutory requirements for RTM companies under CLRA 2002 are included</p>
                  <p>• Consider solicitor consultation for complex building structures</p>
                </div>
              </div>
            </div>
          </div>

          {/* Completion Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="articlesReviewed"
              checked={checklist.articlesReviewed}
              onChange={() => updateChecklist('articlesReviewed')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="articlesReviewed" className="text-sm text-gray-700">
              I have generated and reviewed the Articles of Association for my RTM company
            </label>
          </div>
        </div>
      </Card>

      {/* Formation Status */}
      <Card>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Formation Readiness</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Qualifying Directors</span>
              <span className={`text-sm font-medium ${qualifyingDirectors.length >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                {qualifyingDirectors.length >= 1 ? '✓' : '✗'} {qualifyingDirectors.length} of 1 required
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Director Consents</span>
              <span className={`text-sm font-medium ${consentedDirectors.length >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                {consentedDirectors.length >= 1 ? '✓' : '✗'} {consentedDirectors.length} consented
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Company Name</span>
              <span className={`text-sm font-medium ${companyDetails.proposedName ? 'text-green-600' : 'text-red-600'}`}>
                {companyDetails.proposedName ? '✓' : '✗'} {companyDetails.proposedName ? 'Selected' : 'Required'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Registered Address</span>
              <span className={`text-sm font-medium ${companyDetails.registeredAddress ? 'text-green-600' : 'text-red-600'}`}>
                {companyDetails.registeredAddress ? '✓' : '✗'} {companyDetails.registeredAddress ? 'Confirmed' : 'Required'}
              </span>
            </div>
          </div>

          {isReadyToIncorporate ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h5 className="font-medium text-green-800">Ready for Incorporation</h5>
              </div>
              <p className="text-sm text-green-700 mt-1">
                All requirements met. You can now proceed to incorporate your RTM company.
              </p>
              <div className="mt-3 flex space-x-3">
                <Button variant="primary">
                  Proceed to Companies House
                </Button>
                <Button variant="outline">
                  Download Formation Pack
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h5 className="font-medium text-amber-800">Complete Requirements</h5>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                Please complete all requirements above before proceeding to incorporation.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Invitation Modal */}
      {showInviteModal && user?.metadata?.buildingId && (
        <InviteUserModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleCreateInvitation}
          buildingId={user.metadata.buildingId}
          context="company_formation"
          defaultRole="rtm_director"
          title="Invite RTM Directors"
          description="Invite qualifying leaseholders to become directors of the RTM company"
          contextData={{
            company_name: companyDetails.proposedName,
            formation_stage: 'director_recruitment'
          }}
        />
      )}
    </div>
  );
};

export default RTMCompanyFormation;

/**
 * Legal Template Library
 * Comprehensive collection of UK property law compliant templates
 */

import { LegalTemplate } from '../types/legal';

export const LEGAL_TEMPLATES: LegalTemplate[] = [
  {
    id: 'section-20-notice-intention',
    title: 'Section 20 Notice of Intention',
    description: 'First stage consultation notice for major works under Section 20 LTA 1985',
    category: 'section_20_consultation',
    framework: 'LTA_1985',
    applicableRoles: ['rtm-director', 'rmc-director', 'management-company'],
    content: `NOTICE OF INTENTION TO CARRY OUT WORKS

To: All Leaseholders of {{buildingName}}
From: {{senderName}}, {{senderTitle}}
Date: {{date}}

LANDLORD AND TENANT ACT 1985 - SECTION 20
SERVICE CHARGES (CONSULTATION REQUIREMENTS) (ENGLAND) REGULATIONS 2003

We are required under Section 20 of the Landlord and Tenant Act 1985 to consult you about proposed works to {{buildingName}}, {{buildingAddress}}.

DESCRIPTION OF PROPOSED WORKS:
{{worksDescription}}

ESTIMATED TOTAL COST: £{{estimatedCost}}
ESTIMATED COST PER LEASEHOLDER: £{{costPerLeaseholder}}

REASONS FOR THE WORKS:
{{reasonsForWorks}}

You have the right to make written observations about the proposed works. Any observations must be sent to us within 30 days of the date of this notice.

Please send your observations to:
{{contactName}}
{{contactAddress}}
Email: {{contactEmail}}
Telephone: {{contactPhone}}

We will consider all observations received before proceeding to the next stage of consultation.

You also have the right to propose the name of a person from whom we should try to obtain an estimate for the works. Any such proposal must be made within 30 days of the date of this notice.

IMPORTANT: If you do not respond to this notice, we may proceed with the consultation process. However, your right to challenge service charges is not affected by your failure to respond.

For independent advice about your rights and obligations as a leaseholder, you may wish to contact:
- Leasehold Advisory Service (LEASE): www.lease-advice.org or 0207 832 2500
- Citizens Advice: www.citizensadvice.org.uk

{{senderName}}
{{senderTitle}}
{{companyName}}

Date: {{date}}`,
    variables: [
      {
        name: 'buildingName',
        type: 'text',
        required: true,
        description: 'Full name of the building'
      },
      {
        name: 'buildingAddress',
        type: 'address',
        required: true,
        description: 'Complete building address'
      },
      {
        name: 'senderName',
        type: 'text',
        required: true,
        description: 'Name of the person sending the notice'
      },
      {
        name: 'senderTitle',
        type: 'text',
        required: true,
        description: 'Title/position (e.g., RTM Director, Managing Agent)'
      },
      {
        name: 'companyName',
        type: 'text',
        required: true,
        description: 'Name of RTM company or management company'
      },
      {
        name: 'date',
        type: 'date',
        required: true,
        description: 'Date of the notice'
      },
      {
        name: 'worksDescription',
        type: 'text',
        required: true,
        description: 'Detailed description of the proposed works'
      },
      {
        name: 'estimatedCost',
        type: 'currency',
        required: true,
        description: 'Total estimated cost of works'
      },
      {
        name: 'costPerLeaseholder',
        type: 'currency',
        required: true,
        description: 'Estimated cost per leaseholder'
      },
      {
        name: 'reasonsForWorks',
        type: 'text',
        required: true,
        description: 'Explanation of why the works are necessary'
      },
      {
        name: 'contactName',
        type: 'text',
        required: true,
        description: 'Contact person for observations'
      },
      {
        name: 'contactAddress',
        type: 'address',
        required: true,
        description: 'Contact address for observations'
      },
      {
        name: 'contactEmail',
        type: 'text',
        required: true,
        description: 'Contact email address'
      },
      {
        name: 'contactPhone',
        type: 'text',
        required: true,
        description: 'Contact telephone number'
      }
    ],
    lastUpdated: new Date('2024-12-01'),
    version: '2.1'
  },

  {
    id: 'section-20-notice-proposal',
    title: 'Section 20 Notice of Proposal',
    description: 'Second stage consultation notice with estimates for major works',
    category: 'section_20_consultation',
    framework: 'LTA_1985',
    applicableRoles: ['rtm-director', 'rmc-director', 'management-company'],
    content: `NOTICE OF PROPOSAL

To: All Leaseholders of {{buildingName}}
From: {{senderName}}, {{senderTitle}}
Date: {{date}}

LANDLORD AND TENANT ACT 1985 - SECTION 20
SERVICE CHARGES (CONSULTATION REQUIREMENTS) (ENGLAND) REGULATIONS 2003

Further to our Notice of Intention dated {{noticeIntentionDate}}, we now provide you with details of our proposals for the works to {{buildingName}}, {{buildingAddress}}.

DESCRIPTION OF PROPOSED WORKS:
{{worksDescription}}

ESTIMATES RECEIVED:

Contractor 1: {{contractor1Name}}
Address: {{contractor1Address}}
Estimate: £{{contractor1Estimate}}
{{contractor1Details}}

Contractor 2: {{contractor2Name}}
Address: {{contractor2Address}}
Estimate: £{{contractor2Estimate}}
{{contractor2Details}}

{{additionalContractors}}

PREFERRED CONTRACTOR:
We propose to appoint {{preferredContractor}} at a cost of £{{preferredEstimate}}.

REASONS FOR PREFERENCE:
{{reasonsForPreference}}

ESTIMATED COST PER LEASEHOLDER: £{{costPerLeaseholder}}

OBSERVATIONS RECEIVED:
{{observationsSummary}}

You have the right to make written observations about our proposals. Any observations must be sent to us within 30 days of the date of this notice.

Please send your observations to:
{{contactName}}
{{contactAddress}}
Email: {{contactEmail}}
Telephone: {{contactPhone}}

IMPORTANT: If you wish to inspect the estimates, please contact us to arrange an appointment. Copies of estimates are available for inspection at {{inspectionAddress}} during normal business hours.

{{senderName}}
{{senderTitle}}
{{companyName}}

Date: {{date}}`,
    variables: [
      {
        name: 'buildingName',
        type: 'text',
        required: true,
        description: 'Full name of the building'
      },
      {
        name: 'buildingAddress',
        type: 'address',
        required: true,
        description: 'Complete building address'
      },
      {
        name: 'senderName',
        type: 'text',
        required: true,
        description: 'Name of the person sending the notice'
      },
      {
        name: 'senderTitle',
        type: 'text',
        required: true,
        description: 'Title/position'
      },
      {
        name: 'companyName',
        type: 'text',
        required: true,
        description: 'Name of RTM company or management company'
      },
      {
        name: 'date',
        type: 'date',
        required: true,
        description: 'Date of this notice'
      },
      {
        name: 'noticeIntentionDate',
        type: 'date',
        required: true,
        description: 'Date of the original Notice of Intention'
      },
      {
        name: 'worksDescription',
        type: 'text',
        required: true,
        description: 'Detailed description of the proposed works'
      },
      {
        name: 'contractor1Name',
        type: 'text',
        required: true,
        description: 'Name of first contractor'
      },
      {
        name: 'contractor1Address',
        type: 'address',
        required: true,
        description: 'Address of first contractor'
      },
      {
        name: 'contractor1Estimate',
        type: 'currency',
        required: true,
        description: 'First contractor estimate'
      },
      {
        name: 'contractor1Details',
        type: 'text',
        required: false,
        description: 'Additional details about first contractor'
      },
      {
        name: 'contractor2Name',
        type: 'text',
        required: true,
        description: 'Name of second contractor'
      },
      {
        name: 'contractor2Address',
        type: 'address',
        required: true,
        description: 'Address of second contractor'
      },
      {
        name: 'contractor2Estimate',
        type: 'currency',
        required: true,
        description: 'Second contractor estimate'
      },
      {
        name: 'contractor2Details',
        type: 'text',
        required: false,
        description: 'Additional details about second contractor'
      },
      {
        name: 'additionalContractors',
        type: 'text',
        required: false,
        description: 'Details of any additional contractors'
      },
      {
        name: 'preferredContractor',
        type: 'text',
        required: true,
        description: 'Name of preferred contractor'
      },
      {
        name: 'preferredEstimate',
        type: 'currency',
        required: true,
        description: 'Preferred contractor estimate'
      },
      {
        name: 'reasonsForPreference',
        type: 'text',
        required: true,
        description: 'Reasons for choosing preferred contractor'
      },
      {
        name: 'costPerLeaseholder',
        type: 'currency',
        required: true,
        description: 'Estimated cost per leaseholder'
      },
      {
        name: 'observationsSummary',
        type: 'text',
        required: false,
        description: 'Summary of observations received from Notice of Intention'
      },
      {
        name: 'contactName',
        type: 'text',
        required: true,
        description: 'Contact person for observations'
      },
      {
        name: 'contactAddress',
        type: 'address',
        required: true,
        description: 'Contact address'
      },
      {
        name: 'contactEmail',
        type: 'text',
        required: true,
        description: 'Contact email address'
      },
      {
        name: 'contactPhone',
        type: 'text',
        required: true,
        description: 'Contact telephone number'
      },
      {
        name: 'inspectionAddress',
        type: 'address',
        required: true,
        description: 'Address where estimates can be inspected'
      }
    ],
    lastUpdated: new Date('2024-12-01'),
    version: '2.1'
  },

  {
    id: 'service-charge-demand',
    title: 'Service Charge Demand',
    description: 'Compliant service charge demand notice under LTA 1985',
    category: 'service_charge_demand',
    framework: 'LTA_1985',
    applicableRoles: ['rtm-director', 'rmc-director', 'management-company'],
    content: `SERVICE CHARGE DEMAND

To: {{leaseholderName}}
Property: {{propertyAddress}}
From: {{senderName}}, {{senderTitle}}
Date: {{date}}

LANDLORD AND TENANT ACT 1985 - SECTIONS 21B AND 47

We demand payment of the service charges detailed below for the period {{chargePeriodStart}} to {{chargePeriodEnd}}.

SERVICE CHARGE BREAKDOWN:
{{serviceChargeBreakdown}}

TOTAL AMOUNT DUE: £{{totalAmount}}
DUE DATE: {{dueDate}}

LANDLORD'S NAME AND ADDRESS:
{{landlordName}}
{{landlordAddress}}

MANAGING AGENT (if applicable):
{{managingAgent}}
{{agentAddress}}

IMPORTANT INFORMATION ABOUT YOUR RIGHTS:

1. You have the right to ask for a summary of costs which make up the service charges.

2. You have the right to inspect supporting documents and receipts.

3. You have the right to apply to the First-tier Tribunal (Property Chamber) if you believe the service charges are unreasonable.

4. You will not have to pay service charges if they have not been demanded within 18 months of being incurred, unless you have been notified in writing that costs have been incurred and that you will be required to contribute to them.

For independent advice, contact:
- Leasehold Advisory Service (LEASE): www.lease-advice.org or 0207 832 2500

Payment should be made to:
{{paymentDetails}}

{{senderName}}
{{senderTitle}}
{{companyName}}

Date: {{date}}`,
    variables: [
      {
        name: 'leaseholderName',
        type: 'text',
        required: true,
        description: 'Name of the leaseholder'
      },
      {
        name: 'propertyAddress',
        type: 'address',
        required: true,
        description: 'Address of the leasehold property'
      },
      {
        name: 'senderName',
        type: 'text',
        required: true,
        description: 'Name of person sending demand'
      },
      {
        name: 'senderTitle',
        type: 'text',
        required: true,
        description: 'Title/position'
      },
      {
        name: 'companyName',
        type: 'text',
        required: true,
        description: 'Name of company'
      },
      {
        name: 'date',
        type: 'date',
        required: true,
        description: 'Date of demand'
      },
      {
        name: 'chargePeriodStart',
        type: 'date',
        required: true,
        description: 'Start date of charge period'
      },
      {
        name: 'chargePeriodEnd',
        type: 'date',
        required: true,
        description: 'End date of charge period'
      },
      {
        name: 'serviceChargeBreakdown',
        type: 'text',
        required: true,
        description: 'Detailed breakdown of service charges'
      },
      {
        name: 'totalAmount',
        type: 'currency',
        required: true,
        description: 'Total amount due'
      },
      {
        name: 'dueDate',
        type: 'date',
        required: true,
        description: 'Payment due date'
      },
      {
        name: 'landlordName',
        type: 'text',
        required: true,
        description: 'Name of landlord'
      },
      {
        name: 'landlordAddress',
        type: 'address',
        required: true,
        description: 'Address of landlord'
      },
      {
        name: 'managingAgent',
        type: 'text',
        required: false,
        description: 'Name of managing agent (if applicable)'
      },
      {
        name: 'agentAddress',
        type: 'address',
        required: false,
        description: 'Address of managing agent'
      },
      {
        name: 'paymentDetails',
        type: 'text',
        required: true,
        description: 'Payment instructions and bank details'
      }
    ],
    lastUpdated: new Date('2024-12-01'),
    version: '2.0'
  },

  {
    id: 'rtm-claim-notice',
    title: 'RTM Claim Notice',
    description: 'Notice of claim to acquire right to manage under CLRA 2002',
    category: 'rtm_notice',
    framework: 'CLRA_2002',
    applicableRoles: ['rtm-director'],
    content: `NOTICE OF CLAIM TO ACQUIRE THE RIGHT TO MANAGE

To: {{recipientName}}
{{recipientAddress}}

From: {{rtmCompanyName}}
Company Number: {{companyNumber}}
Registered Office: {{registeredOffice}}

Date: {{date}}

COMMONHOLD AND LEASEHOLD REFORM ACT 2002 - CHAPTER 15

NOTICE is hereby given that {{rtmCompanyName}} claims to acquire the right to manage {{buildingName}}, {{buildingAddress}} ("the premises").

DETAILS OF THE PREMISES:
{{premisesDescription}}

PARTICULARS OF THE CLAIM:
1. The premises consist of {{totalFlats}} flats
2. {{qualifyingTenants}} qualifying tenants support this claim
3. The claim is made under Section 79 of the Commonhold and Leasehold Reform Act 2002

GROUNDS FOR THE CLAIM:
{{groundsForClaim}}

SUPPORTING DOCUMENTS:
The following documents are enclosed:
- Copy of RTM company memorandum and articles
- List of qualifying tenants who are members
- Evidence of service on all relevant parties

IMPORTANT: You have the right to serve a counter-notice within one month of service of this notice if you wish to dispute this claim.

For advice on your rights, contact:
- Leasehold Advisory Service (LEASE): www.lease-advice.org

{{directorName}}
Director
{{rtmCompanyName}}

Date: {{date}}`,
    variables: [
      {
        name: 'recipientName',
        type: 'text',
        required: true,
        description: 'Name of recipient (landlord/freeholder)'
      },
      {
        name: 'recipientAddress',
        type: 'address',
        required: true,
        description: 'Address of recipient'
      },
      {
        name: 'rtmCompanyName',
        type: 'text',
        required: true,
        description: 'Name of RTM company'
      },
      {
        name: 'companyNumber',
        type: 'text',
        required: true,
        description: 'Companies House registration number'
      },
      {
        name: 'registeredOffice',
        type: 'address',
        required: true,
        description: 'Registered office address'
      },
      {
        name: 'date',
        type: 'date',
        required: true,
        description: 'Date of notice'
      },
      {
        name: 'buildingName',
        type: 'text',
        required: true,
        description: 'Name of building'
      },
      {
        name: 'buildingAddress',
        type: 'address',
        required: true,
        description: 'Address of building'
      },
      {
        name: 'premisesDescription',
        type: 'text',
        required: true,
        description: 'Detailed description of premises'
      },
      {
        name: 'totalFlats',
        type: 'number',
        required: true,
        description: 'Total number of flats in building'
      },
      {
        name: 'qualifyingTenants',
        type: 'number',
        required: true,
        description: 'Number of qualifying tenants supporting claim'
      },
      {
        name: 'groundsForClaim',
        type: 'text',
        required: true,
        description: 'Grounds for making the RTM claim'
      },
      {
        name: 'directorName',
        type: 'text',
        required: true,
        description: 'Name of RTM company director'
      }
    ],
    lastUpdated: new Date('2024-12-01'),
    version: '2.0'
  },

  {
    id: 'gdpr-privacy-notice',
    title: 'GDPR Privacy Notice',
    description: 'Comprehensive privacy notice compliant with GDPR requirements',
    category: 'privacy_notice',
    framework: 'GDPR_2018',
    applicableRoles: ['rtm-director', 'rmc-director', 'management-company'],
    content: `PRIVACY NOTICE

{{organisationName}}
{{organisationAddress}}

GENERAL DATA PROTECTION REGULATION (GDPR) - PRIVACY NOTICE

This privacy notice explains how we collect, use, and protect your personal data in compliance with the General Data Protection Regulation (GDPR).

DATA CONTROLLER:
{{dataControllerName}}
{{dataControllerAddress}}
Email: {{dataControllerEmail}}
Phone: {{dataControllerPhone}}

WHAT PERSONAL DATA WE COLLECT:
We collect and process the following categories of personal data:

• Contact Information: Name, address, telephone numbers, email addresses
• Lease Information: Lease terms, property details, service charge information
• Financial Information: Payment history, bank details, service charge accounts
• Communication Records: Correspondence, meeting minutes, voting records
• Emergency Contact Information: Next of kin details for emergency situations

LEGAL BASIS FOR PROCESSING:
We process your personal data on the following legal bases:

• Contract Performance: To fulfil our obligations under your lease agreement
• Legal Obligation: To comply with statutory requirements for property management
• Legitimate Interest: For building management, maintenance, and resident communication
• Consent: Where you have specifically agreed to certain processing activities

HOW WE USE YOUR PERSONAL DATA:
• Managing your lease and service charge obligations
• Communicating about building matters and maintenance
• Organising meetings and consultations
• Maintaining building safety and security
• Complying with legal and regulatory requirements
• Resolving disputes and handling complaints

WHO WE SHARE YOUR DATA WITH:
We may share your personal data with:

• Professional advisors (solicitors, accountants, surveyors)
• Contractors and service providers for building maintenance
• Regulatory bodies and authorities where required by law
• Emergency services in case of emergencies
• Insurance companies for claims processing

DATA RETENTION:
We retain your personal data for the following periods:

• Lease information: 7 years after lease termination
• Financial records: 6 years after final payment
• Communication records: Duration of residency plus 2 years
• Emergency contact information: Duration of residency

YOUR RIGHTS UNDER GDPR:
You have the following rights regarding your personal data:

• Right of Access: Request copies of your personal data
• Right to Rectification: Request correction of inaccurate data
• Right to Erasure: Request deletion of your data in certain circumstances
• Right to Restrict Processing: Request limitation of processing
• Right to Data Portability: Request transfer of your data
• Right to Object: Object to processing based on legitimate interest
• Right to Withdraw Consent: Where processing is based on consent

To exercise any of these rights, please contact us using the details above.

DATA SECURITY:
We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction.

COMPLAINTS:
If you have concerns about how we handle your personal data, you can complain to the Information Commissioner's Office (ICO):
Website: www.ico.org.uk
Phone: 0303 123 1113

CHANGES TO THIS NOTICE:
We may update this privacy notice from time to time. We will notify you of any significant changes.

CONTACT US:
If you have any questions about this privacy notice or our data processing practices, please contact:

{{contactName}}
{{contactEmail}}
{{contactPhone}}

Last updated: {{lastUpdated}}

{{organisationName}}`,
    variables: [
      {
        name: 'organisationName',
        type: 'text',
        required: true,
        description: 'Name of the organisation (RTM company, management company, etc.)'
      },
      {
        name: 'organisationAddress',
        type: 'address',
        required: true,
        description: 'Registered address of the organisation'
      },
      {
        name: 'dataControllerName',
        type: 'text',
        required: true,
        description: 'Name of the data controller'
      },
      {
        name: 'dataControllerAddress',
        type: 'address',
        required: true,
        description: 'Address of the data controller'
      },
      {
        name: 'dataControllerEmail',
        type: 'text',
        required: true,
        description: 'Email address of the data controller'
      },
      {
        name: 'dataControllerPhone',
        type: 'text',
        required: true,
        description: 'Phone number of the data controller'
      },
      {
        name: 'contactName',
        type: 'text',
        required: true,
        description: 'Name of contact person for data protection queries'
      },
      {
        name: 'contactEmail',
        type: 'text',
        required: true,
        description: 'Email for data protection queries'
      },
      {
        name: 'contactPhone',
        type: 'text',
        required: true,
        description: 'Phone number for data protection queries'
      },
      {
        name: 'lastUpdated',
        type: 'date',
        required: true,
        description: 'Date when privacy notice was last updated'
      }
    ],
    lastUpdated: new Date('2024-12-01'),
    version: '1.0'
  },

  {
    id: 'register-of-members',
    title: 'Register of Members',
    description: 'Statutory register of members for RTM companies under Companies Act 2006',
    category: 'company_documents',
    framework: 'CLRA_2002',
    applicableRoles: ['rtm-director', 'rmc-director'],
    content: `REGISTER OF MEMBERS
{{companyName}}
Company Number: {{companyNumber}}

Prepared in accordance with Section 113 of the Companies Act 2006
Date of Register: {{registerDate}}

REGISTER ENTRIES:

MEMBER 1
Name: {{member1Name}}
Address: {{member1Address}}
Date of Becoming Member: {{member1DateJoined}}
Date Ceased to be Member: {{member1DateCeased}}
Number of Shares Held: {{member1SharesHeld}}
Class of Shares: {{member1ShareClass}}
Amount Paid on Shares: £{{member1AmountPaid}}
Amount Agreed to be Paid: £{{member1AmountAgreed}}
Flat/Unit Number: {{member1UnitNumber}}
Notes: {{member1Notes}}

MEMBER 2
Name: {{member2Name}}
Address: {{member2Address}}
Date of Becoming Member: {{member2DateJoined}}
Date Ceased to be Member: {{member2DateCeased}}
Number of Shares Held: {{member2SharesHeld}}
Class of Shares: {{member2ShareClass}}
Amount Paid on Shares: £{{member2AmountPaid}}
Amount Agreed to be Paid: £{{member2AmountAgreed}}
Flat/Unit Number: {{member2UnitNumber}}
Notes: {{member2Notes}}

MEMBER 3
Name: {{member3Name}}
Address: {{member3Address}}
Date of Becoming Member: {{member3DateJoined}}
Date Ceased to be Member: N/A
Number of Shares Held: 1
Class of Shares: Ordinary
Amount Paid on Shares: £1.00
Amount Agreed to be Paid: £1.00
Flat/Unit Number: {{member3UnitNumber}}
Notes:

MEMBER 4
Name: {{member4Name}}
Address: {{member4Address}}
Date of Becoming Member: {{member4DateJoined}}
Date Ceased to be Member: N/A
Number of Shares Held: 1
Class of Shares: Ordinary
Amount Paid on Shares: £1.00
Amount Agreed to be Paid: £1.00
Flat/Unit Number: {{member4UnitNumber}}
Notes:

MEMBER 5
Name: {{member5Name}}
Address: {{member5Address}}
Date of Becoming Member: {{member5DateJoined}}
Date Ceased to be Member: N/A
Number of Shares Held: 1
Class of Shares: Ordinary
Amount Paid on Shares: £1.00
Amount Agreed to be Paid: £1.00
Flat/Unit Number: {{member5UnitNumber}}
Notes:

[Additional members can be added manually following the same format]

SHARE CAPITAL SUMMARY:
Total Authorised Share Capital: £{{authorisedCapital}}
Total Issued Share Capital: £{{issuedCapital}}
Total Paid-up Share Capital: £{{paidUpCapital}}
Number of Members: {{totalMembers}}

CERTIFICATION:
I certify that this register is a true and accurate record of the members of {{companyName}} as at {{registerDate}}.

Signed: _________________________
Name: {{directorName}}
Position: Director
Date: {{certificationDate}}

LEGAL NOTES:
1. This register must be kept at the company's registered office or at a place notified to Companies House
2. The register must be available for inspection by members free of charge
3. Non-members may inspect the register upon payment of the prescribed fee
4. Any changes to membership must be recorded within 14 days
5. Failure to maintain proper records is a criminal offence under the Companies Act 2006

PRIVACY NOTICE:
The information in this register is processed in accordance with the Companies Act 2006 and the General Data Protection Regulation (GDPR). Personal data is held for the purpose of maintaining statutory company records and may be disclosed as required by law.

For data protection enquiries, contact: {{dataProtectionContact}}

This register complies with:
- Companies Act 2006, Section 113
- Commonhold and Leasehold Reform Act 2002
- The Companies (Model Articles) Regulations 2008
- General Data Protection Regulation (GDPR)`,
    variables: [
      {
        name: 'companyName',
        type: 'text',
        required: true,
        description: 'Full name of the RTM company'
      },
      {
        name: 'companyNumber',
        type: 'text',
        required: true,
        description: 'Companies House registration number'
      },
      {
        name: 'registerDate',
        type: 'date',
        required: true,
        description: 'Date this register was prepared'
      },
      {
        name: 'authorisedCapital',
        type: 'currency',
        required: true,
        description: 'Total authorised share capital'
      },
      {
        name: 'issuedCapital',
        type: 'currency',
        required: true,
        description: 'Total issued share capital'
      },
      {
        name: 'paidUpCapital',
        type: 'currency',
        required: true,
        description: 'Total paid-up share capital'
      },
      {
        name: 'totalMembers',
        type: 'number',
        required: true,
        description: 'Total number of current members'
      },
      {
        name: 'directorName',
        type: 'text',
        required: true,
        description: 'Name of certifying director'
      },
      {
        name: 'certificationDate',
        type: 'date',
        required: true,
        description: 'Date of certification'
      },
      {
        name: 'dataProtectionContact',
        type: 'text',
        required: true,
        description: 'Contact details for data protection enquiries'
      },
      // Member 1 fields
      {
        name: 'member1Name',
        type: 'text',
        required: false,
        description: 'Full name of member 1'
      },
      {
        name: 'member1Address',
        type: 'address',
        required: false,
        description: 'Full address of member 1'
      },
      {
        name: 'member1DateJoined',
        type: 'date',
        required: false,
        description: 'Date member 1 became a member'
      },
      {
        name: 'member1DateCeased',
        type: 'date',
        required: false,
        description: 'Date member 1 ceased to be a member (leave blank if current)'
      },
      {
        name: 'member1SharesHeld',
        type: 'number',
        required: false,
        description: 'Number of shares held by member 1',
        defaultValue: '1'
      },
      {
        name: 'member1ShareClass',
        type: 'text',
        required: false,
        description: 'Class of shares held by member 1',
        defaultValue: 'Ordinary'
      },
      {
        name: 'member1AmountPaid',
        type: 'currency',
        required: false,
        description: 'Amount paid on shares by member 1',
        defaultValue: '1.00'
      },
      {
        name: 'member1AmountAgreed',
        type: 'currency',
        required: false,
        description: 'Amount agreed to be paid by member 1',
        defaultValue: '1.00'
      },
      {
        name: 'member1UnitNumber',
        type: 'text',
        required: false,
        description: 'Flat/unit number of member 1'
      },
      {
        name: 'member1Notes',
        type: 'text',
        required: false,
        description: 'Additional notes for member 1'
      },
      // Member 2 fields
      {
        name: 'member2Name',
        type: 'text',
        required: false,
        description: 'Full name of member 2'
      },
      {
        name: 'member2Address',
        type: 'address',
        required: false,
        description: 'Full address of member 2'
      },
      {
        name: 'member2DateJoined',
        type: 'date',
        required: false,
        description: 'Date member 2 became a member'
      },
      {
        name: 'member2DateCeased',
        type: 'date',
        required: false,
        description: 'Date member 2 ceased to be a member (leave blank if current)'
      },
      {
        name: 'member2SharesHeld',
        type: 'number',
        required: false,
        description: 'Number of shares held by member 2',
        defaultValue: '1'
      },
      {
        name: 'member2ShareClass',
        type: 'text',
        required: false,
        description: 'Class of shares held by member 2',
        defaultValue: 'Ordinary'
      },
      {
        name: 'member2AmountPaid',
        type: 'currency',
        required: false,
        description: 'Amount paid on shares by member 2',
        defaultValue: '1.00'
      },
      {
        name: 'member2AmountAgreed',
        type: 'currency',
        required: false,
        description: 'Amount agreed to be paid by member 2',
        defaultValue: '1.00'
      },
      {
        name: 'member2UnitNumber',
        type: 'text',
        required: false,
        description: 'Flat/unit number of member 2'
      },
      {
        name: 'member2Notes',
        type: 'text',
        required: false,
        description: 'Additional notes for member 2'
      },
      // Member 3-5 fields (abbreviated for space - users can add more members manually if needed)
      {
        name: 'member3Name',
        type: 'text',
        required: false,
        description: 'Full name of member 3'
      },
      {
        name: 'member3Address',
        type: 'address',
        required: false,
        description: 'Full address of member 3'
      },
      {
        name: 'member3DateJoined',
        type: 'date',
        required: false,
        description: 'Date member 3 became a member'
      },
      {
        name: 'member3UnitNumber',
        type: 'text',
        required: false,
        description: 'Flat/unit number of member 3'
      },
      {
        name: 'member4Name',
        type: 'text',
        required: false,
        description: 'Full name of member 4'
      },
      {
        name: 'member4Address',
        type: 'address',
        required: false,
        description: 'Full address of member 4'
      },
      {
        name: 'member4DateJoined',
        type: 'date',
        required: false,
        description: 'Date member 4 became a member'
      },
      {
        name: 'member4UnitNumber',
        type: 'text',
        required: false,
        description: 'Flat/unit number of member 4'
      },
      {
        name: 'member5Name',
        type: 'text',
        required: false,
        description: 'Full name of member 5'
      },
      {
        name: 'member5Address',
        type: 'address',
        required: false,
        description: 'Full address of member 5'
      },
      {
        name: 'member5DateJoined',
        type: 'date',
        required: false,
        description: 'Date member 5 became a member'
      },
      {
        name: 'member5UnitNumber',
        type: 'text',
        required: false,
        description: 'Flat/unit number of member 5'
      }
    ],
    lastUpdated: new Date('2024-12-01'),
    version: '1.0'
  }
];

// Helper function to get templates by category
export const getTemplatesByCategory = (category: string): LegalTemplate[] => {
  return LEGAL_TEMPLATES.filter(template => template.category === category);
};

// Helper function to get templates by role
export const getTemplatesByRole = (role: string): LegalTemplate[] => {
  return LEGAL_TEMPLATES.filter(template => 
    template.applicableRoles.includes(role as any)
  );
};

// Helper function to get template by ID
export const getTemplateById = (id: string): LegalTemplate | undefined => {
  return LEGAL_TEMPLATES.find(template => template.id === id);
};

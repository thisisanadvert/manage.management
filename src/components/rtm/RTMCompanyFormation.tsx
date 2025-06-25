import React, { useState } from 'react';
import { Building2, Users, FileText, Download, ExternalLink, CheckCircle2, AlertTriangle, Info, Scale, BookOpen } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LegalGuidanceTooltip from '../legal/LegalGuidanceTooltip';

interface Director {
  id: string;
  name: string;
  flatNumber: string;
  email: string;
  isQualifyingTenant: boolean;
  hasConsented: boolean;
}

interface CompanyDetails {
  proposedName: string;
  alternativeNames: string[];
  registeredAddress: string;
  directors: Director[];
  companySecretary: string;
}

const RTMCompanyFormation: React.FC = () => {
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    proposedName: '',
    alternativeNames: ['', ''],
    registeredAddress: '',
    directors: [],
    companySecretary: ''
  });

  const [newDirector, setNewDirector] = useState<Partial<Director>>({
    name: '',
    flatNumber: '',
    email: '',
    isQualifyingTenant: true,
    hasConsented: false
  });

  const [showAddDirector, setShowAddDirector] = useState(false);
  const [checklist, setChecklist] = useState({
    nameChecked: false,
    articlesReviewed: false,
    directorsAppointed: false,
    addressConfirmed: false,
    bankAccountPlanned: false
  });

  const addDirector = () => {
    if (newDirector.name && newDirector.flatNumber && newDirector.email) {
      const director: Director = {
        id: Date.now().toString(),
        name: newDirector.name || '',
        flatNumber: newDirector.flatNumber || '',
        email: newDirector.email || '',
        isQualifyingTenant: newDirector.isQualifyingTenant || true,
        hasConsented: newDirector.hasConsented || false
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

  const generateRTMArticlesTemplate = () => {
    const companyName = companyDetails.proposedName || '[COMPANY NAME]';
    const buildingAddress = companyDetails.registeredAddress || '[BUILDING ADDRESS]';
    const currentDate = new Date().toLocaleDateString('en-GB');

    const articlesTemplate = `
ARTICLES OF ASSOCIATION
OF
${companyName.toUpperCase()}

A COMPANY LIMITED BY GUARANTEE

Adopted: ${currentDate}

INTERPRETATION

1. In these Articles:
   "the Act" means the Companies Act 2006
   "the Articles" means these Articles of Association
   "the Company" means ${companyName}
   "the Directors" means the directors of the Company
   "the Premises" means ${buildingAddress}
   "RTM Company" means a company which has acquired the right to manage premises under Chapter 1 of Part 2 of the Commonhold and Leasehold Reform Act 2002

OBJECTS

2. The Company's objects are restricted to the management of the Premises in accordance with the provisions of Chapter 1 of Part 2 of the Commonhold and Leasehold Reform Act 2002.

MEMBERSHIP

3. The members of the Company shall be:
   (a) qualifying tenants of flats contained in the Premises; and
   (b) such other persons as may be admitted to membership in accordance with these Articles.

4. No person shall be admitted as a member unless they are a qualifying tenant of a flat contained in the Premises or the landlord of the Premises.

5. Every member shall have one vote regardless of the number of flats they own or lease.

DIRECTORS

6. The Company shall have not less than three directors.

7. The first directors shall be those persons named in the statement delivered to the Registrar of Companies.

8. A director must be:
   (a) a member of the Company; or
   (b) a person nominated by a member of the Company who is not an individual.

9. The directors shall manage the business of the Company and may exercise all the powers of the Company.

GENERAL MEETINGS

10. The Company shall hold an Annual General Meeting each year.

11. All members shall be entitled to receive notice of general meetings.

12. The quorum for general meetings shall be two members present in person or by proxy.

ACCOUNTS

13. The Company shall keep proper accounting records and prepare annual accounts in accordance with the Act.

14. The accounts shall be audited if required by the Act.

SERVICE CHARGES

15. The Company may demand and recover service charges from the tenants of flats contained in the Premises in accordance with the terms of their leases.

16. All service charge monies shall be held in a designated service charge account.

INSURANCE

17. The Company shall effect and maintain appropriate insurance for the Premises.

DISSOLUTION

18. The Company may be dissolved in accordance with the provisions of the Act.

19. On dissolution, any surplus assets shall be distributed among the members in proportion to their respective interests in the Premises.

INDEMNITY

20. Subject to the provisions of the Act, every director and officer of the Company shall be indemnified by the Company against all costs, charges, losses, expenses and liabilities incurred in the execution of their duties.

---

NOTES FOR COMPLETION:

1. This template must be customised for your specific building and circumstances.
2. Legal advice should be sought before adopting these Articles.
3. The Articles must comply with the Commonhold and Leasehold Reform Act 2002.
4. File these Articles with Companies House when incorporating your RTM company.
5. Ensure all qualifying tenants are aware of the company formation.

IMPORTANT: This is a template only. Professional legal advice is recommended before using these Articles of Association.

Generated by Manage.Management RTM Tools
Date: ${currentDate}
    `.trim();

    // Create and download the file
    const blob = new Blob([articlesTemplate], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Articles_of_Association.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const qualifyingDirectors = companyDetails.directors.filter(d => d.isQualifyingTenant);
  const consentedDirectors = companyDetails.directors.filter(d => d.hasConsented);
  const isReadyToIncorporate = qualifyingDirectors.length >= 1 && 
                               consentedDirectors.length >= 1 && 
                               companyDetails.proposedName && 
                               companyDetails.registeredAddress;

  return (
    <div className="space-y-6">
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
            <Button 
              variant="primary" 
              leftIcon={<Users size={16} />}
              onClick={() => setShowAddDirector(true)}
            >
              Add Director
            </Button>
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
                    </div>
                    <p className="text-sm text-gray-600">Flat {director.flatNumber} • {director.email}</p>
                    
                    <div className="mt-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={director.hasConsented}
                          onChange={(e) => updateDirector(director.id, { hasConsented: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Has consented to appointment</span>
                      </label>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeDirector(director.id)}
                  >
                    Remove
                  </Button>
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

      {/* Articles of Association */}
      <Card>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Articles of Association</h4>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900">RTM Articles Template</h5>
                <p className="text-sm text-blue-800 mt-1">
                  RTM companies must use specific articles of association. We provide a template that complies with legal requirements.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              leftIcon={<Download size={16} />}
              onClick={generateRTMArticlesTemplate}
            >
              Download RTM Articles Template
            </Button>
            <Button variant="outline" leftIcon={<ExternalLink size={16} />}>
              View Sample Articles
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="articlesReviewed"
              checked={checklist.articlesReviewed}
              onChange={() => updateChecklist('articlesReviewed')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="articlesReviewed" className="text-sm text-gray-700">
              I have reviewed and customised the articles of association
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
    </div>
  );
};

export default RTMCompanyFormation;

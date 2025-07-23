import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Clock, FileText, Users, Building2, Flame } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import LegalGuidanceTooltip from '../legal/LegalGuidanceTooltip';
import ComplianceStatusIndicator from '../legal/ComplianceStatusIndicator';

interface BuildingSafetyData {
  buildingHeight: number;
  numberOfStoreys: number;
  isHighRise: boolean;
  hasAccountablePerson: boolean;
  hasBuildingSafetyManager: boolean;
  hasResidentEngagementStrategy: boolean;
  hasGoldenThread: boolean;
  lastSafetyAssessment?: Date;
  nextSafetyAssessment?: Date;
}

interface BuildingSafetyComplianceProps {
  buildingData?: BuildingSafetyData;
  onUpdate?: (data: BuildingSafetyData) => void;
}

const BuildingSafetyCompliance: React.FC<BuildingSafetyComplianceProps> = ({ 
  buildingData, 
  onUpdate 
}) => {
  const [data, setData] = useState<BuildingSafetyData>(buildingData || {
    buildingHeight: 0,
    numberOfStoreys: 0,
    isHighRise: false,
    hasAccountablePerson: false,
    hasBuildingSafetyManager: false,
    hasResidentEngagementStrategy: false,
    hasGoldenThread: false
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'accountable-person' | 'safety-manager' | 'residents' | 'golden-thread'>('overview');

  const isHighRise = data.buildingHeight >= 11 || data.numberOfStoreys >= 5;

  const handleDataUpdate = (updates: Partial<BuildingSafetyData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    if (onUpdate) {
      onUpdate(newData);
    }
  };

  const getComplianceStatus = () => {
    if (!isHighRise) return 'not_applicable';
    
    const requirements = [
      data.hasAccountablePerson,
      data.hasBuildingSafetyManager,
      data.hasResidentEngagementStrategy,
      data.hasGoldenThread
    ];
    
    const completedRequirements = requirements.filter(Boolean).length;
    
    if (completedRequirements === requirements.length) return 'compliant';
    if (completedRequirements >= requirements.length * 0.7) return 'at_risk';
    return 'non_compliant';
  };

  const renderAccountablePerson = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Accountable Person Details</h3>
          <LegalGuidanceTooltip
            title="Accountable Person Requirements"
            guidance={{
              basic: "The Accountable Person is the legal entity responsible for building safety compliance under BSA 2022.",
              intermediate: "Must be registered with the Building Safety Regulator and demonstrate competence in building safety management.",
              advanced: "Responsible for safety case reports, mandatory occurrence reporting, and ongoing compliance monitoring. Must have appropriate insurance and financial resources."
            }}
            framework="BSA_2022"
            mandatory={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organisation Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter organisation name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Number
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="BSR registration number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Primary contact name"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="contact@organisation.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Contact phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Status
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="">Select status</option>
                <option value="registered">Registered</option>
                <option value="pending">Registration Pending</option>
                <option value="not-registered">Not Registered</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Key Responsibilities</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Register the building with the Building Safety Regulator</li>
            <li>• Prepare and maintain safety case reports</li>
            <li>• Report mandatory occurrences to the regulator</li>
            <li>• Engage with residents on building safety matters</li>
            <li>• Ensure competent Building Safety Manager is appointed</li>
          </ul>
        </div>

        <div className="mt-6 flex space-x-3">
          <Button
            variant="primary"
            onClick={() => handleDataUpdate({ hasAccountablePerson: true })}
          >
            Save Details
          </Button>
          <Button variant="outline">
            View BSR Registration
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderSafetyManager = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Building Safety Manager</h3>
          <LegalGuidanceTooltip
            title="Building Safety Manager Requirements"
            guidance={{
              basic: "A competent person appointed to manage day-to-day building safety under BSA 2022.",
              intermediate: "Must have appropriate qualifications, experience, and ongoing professional development in building safety.",
              advanced: "Responsible for implementing safety management systems, conducting risk assessments, and ensuring ongoing compliance with safety case requirements."
            }}
            framework="BSA_2022"
            mandatory={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Qualifications
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="List relevant qualifications and certifications"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Years in building safety"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="manager@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="24/7 contact number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Core Competencies Required</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
            <ul className="space-y-1">
              <li>• Building safety risk assessment</li>
              <li>• Fire safety management</li>
              <li>• Structural safety knowledge</li>
              <li>• Emergency planning and response</li>
            </ul>
            <ul className="space-y-1">
              <li>• Regulatory compliance</li>
              <li>• Resident engagement</li>
              <li>• Incident investigation</li>
              <li>• Safety management systems</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <Button
            variant="primary"
            onClick={() => handleDataUpdate({ hasBuildingSafetyManager: true })}
          >
            Save Manager Details
          </Button>
          <Button variant="outline">
            View Competency Framework
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Building Classification */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Building2 className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Building Classification</h3>
          <LegalGuidanceTooltip
            title="Building Safety Act 2022 Scope"
            guidance={{
              basic: "The Building Safety Act 2022 applies to 'higher-risk buildings' - residential buildings of 11m+ height or 5+ storeys with specific safety requirements.",
              intermediate: "Higher-risk buildings require an Accountable Person, Building Safety Manager, resident engagement strategy, and 'golden thread' of building information.",
              advanced: "Detailed requirements include registration with Building Safety Regulator, safety case reports, mandatory occurrence reporting, and ongoing compliance monitoring under BSA 2022."
            }}
            framework="BSA_2022"
            mandatory={isHighRise}
            externalResources={[
              {
                title: "Building Safety Regulator Guidance",
                url: "https://www.hse.gov.uk/building-safety/",
                type: "government",
                description: "Official BSA 2022 guidance"
              }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Building Height (metres)
            </label>
            <input
              type="number"
              value={data.buildingHeight}
              onChange={(e) => handleDataUpdate({ 
                buildingHeight: parseFloat(e.target.value) || 0,
                isHighRise: parseFloat(e.target.value) >= 11 || data.numberOfStoreys >= 5
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Storeys
            </label>
            <input
              type="number"
              value={data.numberOfStoreys}
              onChange={(e) => handleDataUpdate({ 
                numberOfStoreys: parseInt(e.target.value) || 0,
                isHighRise: data.buildingHeight >= 11 || parseInt(e.target.value) >= 5
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0"
            />
          </div>

          <div className="flex items-end">
            <div className={`w-full p-3 rounded-lg border-2 ${
              isHighRise 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center space-x-2">
                {isHighRise ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                <div>
                  <div className={`font-medium ${
                    isHighRise ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {isHighRise ? 'Higher-Risk Building' : 'Standard Building'}
                  </div>
                  <div className={`text-sm ${
                    isHighRise ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {isHighRise ? 'BSA 2022 applies' : 'BSA 2022 does not apply'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Compliance Status */}
      {isHighRise && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">BSA 2022 Compliance Status</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ComplianceStatusIndicator
              status={data.hasAccountablePerson ? 'compliant' : 'non_compliant'}
              title="Accountable Person"
              description="Appointed and registered"
              size="sm"
            />
            <ComplianceStatusIndicator
              status={data.hasBuildingSafetyManager ? 'compliant' : 'non_compliant'}
              title="Building Safety Manager"
              description="Competent person appointed"
              size="sm"
            />
            <ComplianceStatusIndicator
              status={data.hasResidentEngagementStrategy ? 'compliant' : 'non_compliant'}
              title="Resident Engagement"
              description="Strategy in place"
              size="sm"
            />
            <ComplianceStatusIndicator
              status={data.hasGoldenThread ? 'compliant' : 'non_compliant'}
              title="Golden Thread"
              description="Information management"
              size="sm"
            />
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Overall Compliance:</span>
              <ComplianceStatusIndicator
                status={getComplianceStatus()}
                title=""
                description=""
                size="sm"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Key Requirements */}
      {isHighRise && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key BSA 2022 Requirements</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  data.hasAccountablePerson ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {data.hasAccountablePerson ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Accountable Person</h4>
                  <p className="text-sm text-gray-600">
                    Legal entity responsible for building safety compliance
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setActiveTab('accountable-person')}
                  >
                    {data.hasAccountablePerson ? 'Manage' : 'Set Up'}
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  data.hasBuildingSafetyManager ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {data.hasBuildingSafetyManager ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Building Safety Manager</h4>
                  <p className="text-sm text-gray-600">
                    Competent person to manage day-to-day building safety
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setActiveTab('safety-manager')}
                  >
                    {data.hasBuildingSafetyManager ? 'Manage' : 'Appoint'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  data.hasResidentEngagementStrategy ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {data.hasResidentEngagementStrategy ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Resident Engagement</h4>
                  <p className="text-sm text-gray-600">
                    Strategy for involving residents in building safety
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setActiveTab('residents')}
                  >
                    {data.hasResidentEngagementStrategy ? 'Manage' : 'Create'}
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  data.hasGoldenThread ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {data.hasGoldenThread ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Golden Thread</h4>
                  <p className="text-sm text-gray-600">
                    Structured approach to information management
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setActiveTab('golden-thread')}
                  >
                    {data.hasGoldenThread ? 'Manage' : 'Implement'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Non-High-Rise Information */}
      {!isHighRise && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Standard Building</h3>
              <p className="text-green-700 mt-1">
                Your building does not meet the criteria for a higher-risk building under the Building Safety Act 2022. 
                Standard building regulations and fire safety requirements still apply.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderResidentEngagement = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Resident Engagement Strategy</h3>
          <LegalGuidanceTooltip
            title="Resident Engagement Requirements"
            guidance={{
              basic: "Accountable Persons must have a strategy for engaging with residents on building safety matters.",
              intermediate: "Must include regular communication, consultation on safety matters, and mechanisms for residents to raise concerns.",
              advanced: "Strategy should cover information sharing, resident participation in safety decisions, complaint procedures, and annual engagement reviews."
            }}
            framework="BSA_2022"
            mandatory={true}
          />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Communication Channels</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Regular newsletters</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Building notice boards</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Digital portal/app</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Resident meetings</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Email updates</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Engagement Activities</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Annual safety briefings</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Fire safety training</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Building tours</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Safety surveys</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Consultation meetings</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Complaint and Concern Procedures</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Contact Method
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option value="">Select method</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="online-form">Online Form</option>
                  <option value="in-person">In Person</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Time Target
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option value="">Select timeframe</option>
                  <option value="24-hours">24 hours</option>
                  <option value="48-hours">48 hours</option>
                  <option value="5-days">5 working days</option>
                  <option value="10-days">10 working days</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Annual Review Requirements</h4>
            <p className="text-sm text-yellow-800 mb-3">
              The engagement strategy must be reviewed annually and updated based on resident feedback and changing circumstances.
            </p>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-yellow-900 mb-1">
                  Last Review Date
                </label>
                <input
                  type="date"
                  className="px-3 py-2 border border-yellow-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-900 mb-1">
                  Next Review Due
                </label>
                <input
                  type="date"
                  className="px-3 py-2 border border-yellow-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <Button
            variant="primary"
            onClick={() => handleDataUpdate({ hasResidentEngagementStrategy: true })}
          >
            Save Strategy
          </Button>
          <Button variant="outline">
            Download Template
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderGoldenThread = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Golden Thread Information Management</h3>
          <LegalGuidanceTooltip
            title="Golden Thread Requirements"
            guidance={{
              basic: "A structured approach to creating, maintaining, and sharing building information throughout the building's lifecycle.",
              intermediate: "Must include design information, construction records, maintenance history, and safety-related documentation.",
              advanced: "Information must be accurate, up-to-date, accessible to relevant parties, and maintained in a structured format that supports building safety decisions."
            }}
            framework="BSA_2022"
            mandatory={true}
          />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Design Information</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Architectural drawings</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Structural calculations</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Fire strategy reports</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Building control approvals</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Material specifications</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Operational Information</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Maintenance schedules</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Inspection records</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Incident reports</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Risk assessments</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Change documentation</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Information Management System</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Storage System
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option value="">Select system</option>
                  <option value="cloud-based">Cloud-based platform</option>
                  <option value="on-premise">On-premise system</option>
                  <option value="hybrid">Hybrid approach</option>
                  <option value="paper-based">Paper-based filing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Control Level
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option value="">Select level</option>
                  <option value="role-based">Role-based access</option>
                  <option value="document-level">Document-level permissions</option>
                  <option value="open-access">Open access</option>
                  <option value="restricted">Restricted access</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Information Sharing Requirements</h4>
            <p className="text-sm text-blue-800 mb-3">
              Relevant building information must be shared with residents, emergency services, and other stakeholders as required.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">
                  Resident Access Portal
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Portal URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">
                  Emergency Services Contact
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Emergency contact email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">
                  Regulator Access
                </label>
                <select className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option value="">Select status</option>
                  <option value="configured">Configured</option>
                  <option value="pending">Pending setup</option>
                  <option value="not-configured">Not configured</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <Button
            variant="primary"
            onClick={() => handleDataUpdate({ hasGoldenThread: true })}
          >
            Save Configuration
          </Button>
          <Button variant="outline">
            View Information Map
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Flame className="h-8 w-8 text-red-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Building Safety Compliance</h2>
          <p className="text-gray-600 mt-1">
            Building Safety Act 2022 compliance monitoring and management
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'accountable-person', label: 'Accountable Person', disabled: !isHighRise },
            { id: 'safety-manager', label: 'Safety Manager', disabled: !isHighRise },
            { id: 'residents', label: 'Resident Engagement', disabled: !isHighRise },
            { id: 'golden-thread', label: 'Golden Thread', disabled: !isHighRise }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
              disabled={tab.disabled}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : tab.disabled
                    ? 'border-transparent text-gray-300 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'accountable-person' && renderAccountablePerson()}
      {activeTab === 'safety-manager' && renderSafetyManager()}
      {activeTab === 'residents' && renderResidentEngagement()}
      {activeTab === 'golden-thread' && renderGoldenThread()}
    </div>
  );
};

export default BuildingSafetyCompliance;

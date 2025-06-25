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
      {/* Other tabs would be implemented here */}
    </div>
  );
};

export default BuildingSafetyCompliance;

import React, { useState } from 'react';
import { Shield, Eye, Download, Trash2, Settings, AlertTriangle, CheckCircle2, FileText, Users, Lock } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import LegalGuidanceTooltip from '../legal/LegalGuidanceTooltip';
import ComplianceStatusIndicator from '../legal/ComplianceStatusIndicator';

interface GDPRComplianceProps {
  userRole?: string;
}

interface DataProcessingActivity {
  id: string;
  purpose: string;
  dataTypes: string[];
  legalBasis: string;
  retention: string;
  recipients: string[];
  status: 'compliant' | 'review_needed' | 'non_compliant';
}

interface DataSubjectRequest {
  id: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
  requestDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  deadline: Date;
  requester: string;
}

const GDPRCompliance: React.FC<GDPRComplianceProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'data-mapping' | 'requests' | 'policies' | 'training'>('overview');

  const dataProcessingActivities: DataProcessingActivity[] = [
    {
      id: '1',
      purpose: 'Leaseholder Management',
      dataTypes: ['Name', 'Address', 'Email', 'Phone', 'Lease Details'],
      legalBasis: 'Contract Performance',
      retention: '7 years after lease end',
      recipients: ['Property Management', 'Legal Advisors'],
      status: 'compliant'
    },
    {
      id: '2',
      purpose: 'Service Charge Administration',
      dataTypes: ['Financial Records', 'Payment History', 'Bank Details'],
      legalBasis: 'Contract Performance',
      retention: '6 years after payment',
      recipients: ['Accountants', 'Auditors'],
      status: 'compliant'
    },
    {
      id: '3',
      purpose: 'Building Maintenance Communications',
      dataTypes: ['Contact Details', 'Communication Preferences'],
      legalBasis: 'Legitimate Interest',
      retention: 'Duration of residency + 1 year',
      recipients: ['Maintenance Contractors', 'Emergency Services'],
      status: 'review_needed'
    }
  ];

  const dataSubjectRequests: DataSubjectRequest[] = [
    {
      id: '1',
      type: 'access',
      requestDate: new Date('2024-11-15'),
      status: 'pending',
      deadline: new Date('2024-12-15'),
      requester: 'J. Smith - Flat 12'
    },
    {
      id: '2',
      type: 'erasure',
      requestDate: new Date('2024-11-10'),
      status: 'in_progress',
      deadline: new Date('2024-12-10'),
      requester: 'M. Johnson - Former Leaseholder'
    }
  ];

  const getComplianceOverview = () => {
    const totalActivities = dataProcessingActivities.length;
    const compliantActivities = dataProcessingActivities.filter(a => a.status === 'compliant').length;
    const pendingRequests = dataSubjectRequests.filter(r => r.status === 'pending').length;
    const overdueRequests = dataSubjectRequests.filter(r => r.deadline < new Date() && r.status !== 'completed').length;

    return {
      dataProcessingCompliance: Math.round((compliantActivities / totalActivities) * 100),
      pendingRequests,
      overdueRequests,
      hasPrivacyPolicy: true,
      hasDataProtectionOfficer: userRole === 'management-company',
      conductedDPIA: false
    };
  };

  const overview = getComplianceOverview();

  const renderOverview = () => (
    <div className="space-y-6">
      {/* GDPR Compliance Status */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">GDPR Compliance Overview</h3>
          <LegalGuidanceTooltip
            title="GDPR Compliance Requirements"
            guidance={{
              basic: "GDPR requires property managers to protect personal data, provide transparency about data processing, and respect data subject rights including access, rectification, and erasure.",
              intermediate: "Key obligations include lawful basis for processing, data minimisation, retention limits, security measures, breach notification, and responding to data subject requests within 30 days.",
              advanced: "Detailed compliance includes data protection impact assessments for high-risk processing, appointment of DPO where required, privacy by design, international transfer safeguards, and comprehensive documentation."
            }}
            framework="GDPR_2018"
            mandatory={true}
            externalResources={[
              {
                title: "ICO GDPR Guidance",
                url: "https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/",
                type: "government",
                description: "Official UK GDPR guidance"
              }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ComplianceStatusIndicator
            status={overview.dataProcessingCompliance >= 90 ? 'compliant' : overview.dataProcessingCompliance >= 70 ? 'at_risk' : 'non_compliant'}
            title="Data Processing"
            description={`${overview.dataProcessingCompliance}% compliant`}
            size="sm"
          />
          <ComplianceStatusIndicator
            status={overview.pendingRequests === 0 ? 'compliant' : overview.pendingRequests <= 2 ? 'at_risk' : 'non_compliant'}
            title="Data Subject Requests"
            description={`${overview.pendingRequests} pending`}
            size="sm"
          />
          <ComplianceStatusIndicator
            status={overview.hasPrivacyPolicy ? 'compliant' : 'non_compliant'}
            title="Privacy Policy"
            description={overview.hasPrivacyPolicy ? 'In place' : 'Missing'}
            size="sm"
          />
          <ComplianceStatusIndicator
            status={overview.hasDataProtectionOfficer ? 'compliant' : 'unknown'}
            title="Data Protection Officer"
            description={overview.hasDataProtectionOfficer ? 'Appointed' : 'Not required'}
            size="sm"
          />
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('requests')}>
          <div className="flex items-center space-x-3">
            <Eye className="h-8 w-8 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">Data Subject Requests</h4>
              <p className="text-sm text-gray-600">Manage access, rectification, and erasure requests</p>
              {overview.pendingRequests > 0 && (
                <Badge variant="warning" className="mt-2">
                  {overview.pendingRequests} pending
                </Badge>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('data-mapping')}>
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-green-600" />
            <div>
              <h4 className="font-medium text-gray-900">Data Processing Activities</h4>
              <p className="text-sm text-gray-600">Review and update data processing records</p>
              <Badge variant="success" className="mt-2">
                {overview.dataProcessingCompliance}% compliant
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('policies')}>
          <div className="flex items-center space-x-3">
            <Lock className="h-8 w-8 text-purple-600" />
            <div>
              <h4 className="font-medium text-gray-900">Privacy Policies</h4>
              <p className="text-sm text-gray-600">Manage privacy notices and policies</p>
              <Badge variant="success" className="mt-2">
                Up to date
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent GDPR Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Data Access Request</p>
                <p className="text-sm text-blue-700">J. Smith requested access to personal data</p>
              </div>
            </div>
            <Badge variant="warning">Pending</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Privacy Policy Updated</p>
                <p className="text-sm text-green-700">Updated to reflect new data processing activities</p>
              </div>
            </div>
            <Badge variant="success">Completed</Badge>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDataSubjectRequests = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Data Subject Requests</h3>
          <Button variant="primary" leftIcon={<FileText className="h-4 w-4" />}>
            New Request
          </Button>
        </div>

        <div className="space-y-4">
          {dataSubjectRequests.map((request) => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">
                      {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Request
                    </h4>
                    <Badge variant={
                      request.status === 'completed' ? 'success' :
                      request.status === 'pending' ? 'warning' :
                      request.status === 'rejected' ? 'error' : 'info'
                    }>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{request.requester}</p>
                  <p className="text-xs text-gray-500">
                    Requested: {request.requestDate.toLocaleDateString('en-GB')} | 
                    Deadline: {request.deadline.toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {request.status === 'pending' && (
                    <Button variant="primary" size="sm">
                      Process
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">GDPR Compliance</h2>
          <p className="text-gray-600 mt-1">
            Data protection and privacy compliance management
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'data-mapping', label: 'Data Processing' },
            { id: 'requests', label: 'Data Subject Requests' },
            { id: 'policies', label: 'Privacy Policies' },
            { id: 'training', label: 'Training & Awareness' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
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
      {activeTab === 'requests' && renderDataSubjectRequests()}
      {/* Other tabs would be implemented here */}
    </div>
  );
};

export default GDPRCompliance;

import React, { useState } from 'react';
import { Users, BookOpen, Calendar, Scale, Shield, FileText, Award, HelpCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import DirectorOnboarding from '../components/director-support/DirectorOnboarding';
import MeetingManagement from '../components/director-support/MeetingManagement';
import LegalGuidanceTooltip from '../components/legal/LegalGuidanceTooltip';

const DirectorSupport: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'onboarding' | 'meetings' | 'succession' | 'resources'>('overview');

  const isDirector = user?.role === 'rtm-director' || user?.role === 'rmc-director';

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Award className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Director Support Centre</h2>
              <p className="text-gray-700 mt-1">
                Comprehensive support and resources for {user?.role === 'rtm-director' ? 'RTM' : 'RMC'} directors
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('onboarding')}>
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-medium text-gray-900">Director Onboarding</h3>
              <p className="text-sm text-gray-600">Complete your director training programme</p>
              <Badge variant="info" className="mt-2">
                Essential
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('meetings')}>
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Meeting Management</h3>
              <p className="text-sm text-gray-600">Schedule and manage board meetings and AGMs</p>
              <Badge variant="warning" className="mt-2">
                2 upcoming
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('succession')}>
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="font-medium text-gray-900">Succession Planning</h3>
              <p className="text-sm text-gray-600">Plan for director transitions and recruitment</p>
              <Badge variant="info" className="mt-2">
                Planning
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Legal Obligations Summary */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Scale className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Key Legal Obligations</h3>
          <LegalGuidanceTooltip
            title="Director Legal Duties"
            guidance={{
              basic: "Directors must act in the company's best interests, exercise reasonable care and skill, and avoid conflicts of interest under the Companies Act 2006.",
              intermediate: "Key duties include promoting company success, exercising independent judgment, maintaining proper records, and ensuring statutory compliance.",
              advanced: "Detailed obligations include fiduciary duties under sections 171-177 of Companies Act 2006, potential personal liability, and sector-specific requirements."
            }}
            framework="CLRA_2002"
            mandatory={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Core Duties</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Act in the company's best interests</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Exercise reasonable care, skill and diligence</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Avoid conflicts of interest</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Exercise independent judgment</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Compliance Requirements</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Maintain proper company records</span>
              </li>
              <li className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>File annual returns and accounts</span>
              </li>
              <li className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Conduct regular board meetings</span>
              </li>
              <li className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Ensure AGM compliance</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Board Meeting Scheduled</p>
                <p className="text-sm text-blue-700">Monthly board meeting for December 15th</p>
              </div>
            </div>
            <Badge variant="info">Upcoming</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Training Module Completed</p>
                <p className="text-sm text-green-700">Financial Management Basics</p>
              </div>
            </div>
            <Badge variant="success">Completed</Badge>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSuccessionPlanning = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Director Succession Planning</h3>
          <LegalGuidanceTooltip
            title="Director Succession Requirements"
            guidance={{
              basic: "Companies must maintain adequate director numbers and plan for succession to ensure continuity of governance and compliance with statutory requirements.",
              intermediate: "Consider director skills matrix, succession timeline, recruitment processes, and handover procedures to maintain effective governance.",
              advanced: "Detailed planning includes director competency requirements, regulatory compliance during transitions, and risk management for governance continuity."
            }}
            framework="CLRA_2002"
            mandatory={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Current Directors</h4>
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">John Smith</p>
                    <p className="text-sm text-gray-600">Chairman - Appointed 2020</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Sarah Johnson</p>
                    <p className="text-sm text-gray-600">Secretary - Appointed 2021</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Mike Brown</p>
                    <p className="text-sm text-gray-600">Treasurer - Appointed 2022</p>
                  </div>
                  <Badge variant="warning">Term Ending 2025</Badge>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Succession Planning</h4>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-medium text-yellow-800">Action Required</p>
                <p className="text-sm text-yellow-700">Plan succession for Treasurer role (term ending 2025)</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-800">Skills Gap Analysis</p>
                <p className="text-sm text-blue-700">Consider financial expertise for incoming directors</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-800">Recruitment Timeline</p>
                <p className="text-sm text-green-700">Begin recruitment process 6 months before term end</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <Button variant="primary">
            Start Recruitment Process
          </Button>
          <Button variant="outline">
            Download Succession Plan Template
          </Button>
        </div>
      </Card>
    </div>
  );

  if (!isDirector) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Director Access Required</h2>
        <p className="text-gray-600">
          This section is only available to RTM and RMC directors. Please contact your building administrator if you believe you should have access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Award className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Director Support</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive support and resources for company directors
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'onboarding', label: 'Onboarding' },
            { id: 'meetings', label: 'Meetings' },
            { id: 'succession', label: 'Succession Planning' },
            { id: 'resources', label: 'Resources' }
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
      {activeTab === 'onboarding' && (
        <DirectorOnboarding 
          userRole={user?.role as 'rtm-director' | 'rmc-director'} 
        />
      )}
      {activeTab === 'meetings' && (
        <MeetingManagement 
          userRole={user?.role as 'rtm-director' | 'rmc-director'} 
        />
      )}
      {activeTab === 'succession' && renderSuccessionPlanning()}
      {/* Resources tab would be implemented here */}
    </div>
  );
};

export default DirectorSupport;

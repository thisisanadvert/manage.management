import React, { useState } from 'react';
import {
  Building2,
  Users,
  CheckCircle2,
  FileText,
  Calendar,
  HelpCircle,
  MessageSquare,
  ChevronRight,
  ArrowRight,
  Settings
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

// Import RTM Formation Components
import EligibilityChecker from '../components/rtm/EligibilityChecker';
import LeaseholderSurvey from '../components/rtm/LeaseholderSurvey';
import RTMCompanyFormation from '../components/rtm/RTMCompanyFormation';
import NoticeGenerator from '../components/rtm/NoticeGenerator';
import AcquisitionPlanner from '../components/rtm/AcquisitionPlanner';
import RTMTimeline from '../components/rtm/RTMTimeline';
import RTMFeedback from '../components/rtm/RTMFeedback';
import RTMHelpCenter from '../components/rtm/RTMHelpCenter';

const RTMManagement = () => {
  const [activeView, setActiveView] = useState<'overview' | 'eligibility' | 'survey' | 'formation' | 'notices' | 'acquisition' | 'timeline' | 'help' | 'feedback'>('overview');
  const [currentStep, setCurrentStep] = useState('eligibility');
  
  const rtmTools = [
    {
      id: 'eligibility',
      title: 'Eligibility Checker',
      description: 'Verify if your building qualifies for RTM',
      icon: <CheckCircle2 className="h-6 w-6" />,
      status: 'available',
      category: 'Assessment'
    },
    {
      id: 'survey',
      title: 'Leaseholder Survey',
      description: 'Gauge interest and collect participant information',
      icon: <Users className="h-6 w-6" />,
      status: 'available',
      category: 'Planning'
    },
    {
      id: 'formation',
      title: 'Company Formation',
      description: 'Form your RTM company with guided assistance',
      icon: <Building2 className="h-6 w-6" />,
      status: 'available',
      category: 'Legal'
    },
    {
      id: 'notices',
      title: 'Notice Generator',
      description: 'Create and manage formal RTM claim notices',
      icon: <FileText className="h-6 w-6" />,
      status: 'available',
      category: 'Legal'
    },
    {
      id: 'acquisition',
      title: 'Acquisition Planner',
      description: 'Plan and track the management acquisition process',
      icon: <Calendar className="h-6 w-6" />,
      status: 'available',
      category: 'Management'
    },
    {
      id: 'timeline',
      title: 'Process Timeline',
      description: 'Visual timeline of your RTM formation progress',
      icon: <Calendar className="h-6 w-6" />,
      status: 'available',
      category: 'Planning'
    }
  ];
  
  const handleStepClick = (stepId: string) => {
    setCurrentStep(stepId);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'eligibility':
        return <EligibilityChecker />;
      case 'survey':
        return <LeaseholderSurvey />;
      case 'formation':
        return <RTMCompanyFormation />;
      case 'notices':
        return <NoticeGenerator />;
      case 'acquisition':
        return <AcquisitionPlanner />;
      case 'timeline':
        return <RTMTimeline currentStep={currentStep} onStepClick={handleStepClick} />;
      case 'help':
        return <RTMHelpCenter />;
      case 'feedback':
        return <RTMFeedback />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* RTM Formation Tools Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">RTM Formation Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rtmTools.map((tool) => (
            <Card
              key={tool.id}
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary-200"
              onClick={() => setActiveView(tool.id as any)}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary-100 rounded-lg text-primary-600">
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{tool.title}</h3>
                    <Badge variant="secondary" size="sm">{tool.category}</Badge>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{tool.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-green-600 font-medium">✓ Available</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">View Process Timeline</h3>
                <p className="text-sm text-gray-600">Track your RTM formation progress</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveView('timeline')}
              >
                View Timeline
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <HelpCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Get Help & Support</h3>
                <p className="text-sm text-gray-600">Access guides and expert assistance</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveView('help')}
              >
                Get Help
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );


  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RTM Formation Tools</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive tools to guide you through the Right to Manage formation process
          </p>
        </div>
        <div className="flex space-x-2">
          {activeView !== 'overview' && (
            <Button
              variant="outline"
              onClick={() => setActiveView('overview')}
              leftIcon={<ArrowRight className="h-4 w-4 rotate-180" />}
            >
              Back to Overview
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setActiveView('help')}
            leftIcon={<HelpCircle size={16} />}
          >
            Help Center
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveView('feedback')}
            leftIcon={<MessageSquare size={16} />}
          >
            Feedback
          </Button>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      {activeView !== 'overview' && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <button
            onClick={() => setActiveView('overview')}
            className="hover:text-primary-600"
          >
            RTM Tools
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-900">
            {rtmTools.find(tool => tool.id === activeView)?.title ||
             (activeView === 'help' ? 'Help Center' :
              activeView === 'feedback' ? 'Feedback' :
              activeView === 'timeline' ? 'Process Timeline' : 'Tool')}
          </span>
        </div>
      )}

      {/* Main Content */}
      {renderActiveView()}
    </div>
  );
};

export default RTMManagement;
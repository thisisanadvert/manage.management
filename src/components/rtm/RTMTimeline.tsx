import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, AlertTriangle, Calendar, FileText, Users, Building2 } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending' | 'blocked';
  estimatedDuration: string;
  keyTasks: string[];
  documents: string[];
  deadline?: string;
  icon: React.ReactNode;
}

interface RTMTimelineProps {
  currentStep?: string;
  onStepClick?: (stepId: string) => void;
}

const RTMTimeline: React.FC<RTMTimelineProps> = ({ 
  currentStep = 'eligibility', 
  onStepClick 
}) => {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const timelineSteps: TimelineStep[] = [
    {
      id: 'eligibility',
      title: 'Eligibility Assessment',
      description: 'Verify building qualifies for RTM and assess leaseholder interest',
      status: currentStep === 'eligibility' ? 'active' : 'completed',
      estimatedDuration: '2-4 weeks',
      keyTasks: [
        'Check building meets RTM criteria',
        'Survey leaseholder interest',
        'Identify potential participants',
        'Assess current management issues'
      ],
      documents: [
        'Building lease documents',
        'Current management agreement',
        'Service charge accounts',
        'Leaseholder contact list'
      ],
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 'formation',
      title: 'RTM Company Formation',
      description: 'Establish the RTM company and appoint directors',
      status: currentStep === 'formation' ? 'active' : 
              ['eligibility'].includes(currentStep) ? 'pending' : 'completed',
      estimatedDuration: '1-2 weeks',
      keyTasks: [
        'Choose company name and register with Companies House',
        'Appoint qualifying leaseholder directors',
        'Adopt RTM company articles of association',
        'Open company bank account'
      ],
      documents: [
        'Companies House incorporation certificate',
        'RTM company articles of association',
        'Director appointment forms',
        'Bank account opening documents'
      ],
      icon: <Building2 className="h-5 w-5" />
    },
    {
      id: 'notice',
      title: 'Claim Notice Service',
      description: 'Serve formal RTM claim notice to landlord and qualifying tenants',
      status: currentStep === 'notice' ? 'active' : 
              ['eligibility', 'formation'].includes(currentStep) ? 'pending' : 'completed',
      estimatedDuration: '1 week',
      keyTasks: [
        'Prepare claim notice with all required information',
        'Serve notice to landlord/managing agent',
        'Serve notice to all qualifying tenants',
        'Obtain proof of service for all notices'
      ],
      documents: [
        'RTM claim notice',
        'Proof of service certificates',
        'List of qualifying tenants',
        'Landlord/managing agent details'
      ],
      deadline: 'Must be served correctly to avoid delays',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'acquisition',
      title: 'Management Acquisition',
      description: 'Complete the transfer of management responsibilities',
      status: currentStep === 'acquisition' ? 'active' : 
              ['eligibility', 'formation', 'notice'].includes(currentStep) ? 'pending' : 'completed',
      estimatedDuration: '3-6 months',
      keyTasks: [
        'Wait for counter-notice period (1 month)',
        'Respond to any counter-notices',
        'Arrange handover of management',
        'Take control of service charge accounts'
      ],
      documents: [
        'Management handover documents',
        'Service charge account transfers',
        'Insurance policy transfers',
        'Contractor contact details'
      ],
      deadline: 'Acquisition date: 3 months after claim notice',
      icon: <CheckCircle2 className="h-5 w-5" />
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case 'active':
        return <Clock className="h-6 w-6 text-blue-600" />;
      case 'blocked':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'active':
        return 'border-blue-200 bg-blue-50';
      case 'blocked':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const toggleExpanded = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const handleStepClick = (stepId: string) => {
    if (onStepClick) {
      onStepClick(stepId);
    }
    toggleExpanded(stepId);
  };

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">RTM Process Timeline</h3>
          <p className="text-gray-600 mt-1">
            Track your progress through the Right to Manage formation process
          </p>
        </div>

        <div className="space-y-4">
          {timelineSteps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connector Line */}
              {index < timelineSteps.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200" />
              )}

              {/* Step Card */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${getStatusColor(step.status)}`}
                onClick={() => handleStepClick(step.id)}
              >
                <div className="flex items-start space-x-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(step.status)}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-gray-600">
                          {step.icon}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {step.title}
                        </h4>
                        {step.status === 'active' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Current Step
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{step.estimatedDuration}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 mt-1">{step.description}</p>

                    {step.deadline && (
                      <div className="mt-2 flex items-center space-x-2 text-sm text-amber-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{step.deadline}</span>
                      </div>
                    )}

                    {/* Expanded Content */}
                    {expandedStep === step.id && (
                      <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                        {/* Key Tasks */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Key Tasks</h5>
                          <ul className="space-y-1">
                            {step.keyTasks.map((task, taskIndex) => (
                              <li key={taskIndex} className="flex items-start space-x-2">
                                <Circle className="h-3 w-3 text-gray-400 mt-1.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{task}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Required Documents */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Required Documents</h5>
                          <ul className="space-y-1">
                            {step.documents.map((doc, docIndex) => (
                              <li key={docIndex} className="flex items-start space-x-2">
                                <FileText className="h-3 w-3 text-gray-400 mt-1.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{doc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Action Buttons */}
                        {step.status === 'active' && (
                          <div className="flex space-x-3 pt-2">
                            <Button variant="primary" size="sm">
                              Start This Step
                            </Button>
                            <Button variant="outline" size="sm">
                              Get Help
                            </Button>
                          </div>
                        )}

                        {step.status === 'pending' && (
                          <div className="flex space-x-3 pt-2">
                            <Button variant="outline" size="sm" disabled>
                              Complete Previous Steps First
                            </Button>
                          </div>
                        )}

                        {step.status === 'completed' && (
                          <div className="flex space-x-3 pt-2">
                            <Button variant="outline" size="sm">
                              Review Completed Work
                            </Button>
                            <Button variant="outline" size="sm">
                              Download Documents
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Progress */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">
              {timelineSteps.filter(step => step.status === 'completed').length} of {timelineSteps.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(timelineSteps.filter(step => step.status === 'completed').length / timelineSteps.length) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Estimated Completion */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-blue-900">Estimated Timeline</h4>
          </div>
          <p className="text-blue-800 text-sm mt-1">
            The complete RTM process typically takes 6-12 months from start to finish, 
            depending on complexity and any challenges from the current managing agent.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default RTMTimeline;

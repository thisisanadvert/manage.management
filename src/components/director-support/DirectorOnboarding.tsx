import React, { useState } from 'react';
import { CheckCircle2, Clock, FileText, Users, Scale, BookOpen, AlertTriangle, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import LegalGuidanceTooltip from '../legal/LegalGuidanceTooltip';
import ComplianceStatusIndicator from '../legal/ComplianceStatusIndicator';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  category: 'legal' | 'practical' | 'governance' | 'financial';
  mandatory: boolean;
  estimatedTime: string;
  status: 'not_started' | 'in_progress' | 'completed';
  resources: Array<{
    title: string;
    type: 'document' | 'video' | 'checklist' | 'template';
    url?: string;
  }>;
}

interface DirectorOnboardingProps {
  userRole: 'rtm-director' | 'rmc-director' | 'management-company';
  onStepComplete?: (stepId: string) => void;
}

const DirectorOnboarding: React.FC<DirectorOnboardingProps> = ({ userRole, onStepComplete }) => {
  const [activeStep, setActiveStep] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const getOnboardingSteps = (): OnboardingStep[] => {
    const commonSteps: OnboardingStep[] = [
      {
        id: 'legal-obligations',
        title: 'Understanding Legal Obligations',
        description: 'Learn about your duties and responsibilities as a director',
        category: 'legal',
        mandatory: true,
        estimatedTime: '2 hours',
        status: 'not_started',
        resources: [
          { title: 'Director Duties Overview', type: 'document' },
          { title: 'Legal Framework Guide', type: 'document' },
          { title: 'Liability and Insurance', type: 'document' }
        ]
      },
      {
        id: 'company-structure',
        title: 'Company Structure and Governance',
        description: 'Understand the company structure, articles of association, and governance framework',
        category: 'governance',
        mandatory: true,
        estimatedTime: '1.5 hours',
        status: 'not_started',
        resources: [
          { title: 'Articles of Association', type: 'document' },
          { title: 'Board Meeting Procedures', type: 'checklist' },
          { title: 'Decision Making Framework', type: 'template' }
        ]
      },
      {
        id: 'financial-management',
        title: 'Financial Management Basics',
        description: 'Learn about budgets, service charges, and financial reporting',
        category: 'financial',
        mandatory: true,
        estimatedTime: '2 hours',
        status: 'not_started',
        resources: [
          { title: 'Service Charge Guide', type: 'document' },
          { title: 'Budget Planning Template', type: 'template' },
          { title: 'Financial Reporting Requirements', type: 'document' }
        ]
      },
      {
        id: 'resident-engagement',
        title: 'Resident Communication and Engagement',
        description: 'Best practices for communicating with leaseholders and managing relationships',
        category: 'practical',
        mandatory: false,
        estimatedTime: '1 hour',
        status: 'not_started',
        resources: [
          { title: 'Communication Best Practices', type: 'document' },
          { title: 'Meeting Management Guide', type: 'checklist' },
          { title: 'Conflict Resolution Tips', type: 'document' }
        ]
      }
    ];

    // Add role-specific steps
    if (userRole === 'rtm-director') {
      commonSteps.push({
        id: 'rtm-specific',
        title: 'RTM-Specific Responsibilities',
        description: 'Understanding Right to Manage specific duties and procedures',
        category: 'legal',
        mandatory: true,
        estimatedTime: '1.5 hours',
        status: 'not_started',
        resources: [
          { title: 'RTM Company Obligations', type: 'document' },
          { title: 'Management Transfer Process', type: 'checklist' },
          { title: 'Ongoing Compliance Requirements', type: 'document' }
        ]
      });
    }

    if (userRole === 'rmc-director') {
      commonSteps.push({
        id: 'rmc-specific',
        title: 'RMC Director Responsibilities',
        description: 'Understanding share ownership and freehold management duties',
        category: 'legal',
        mandatory: true,
        estimatedTime: '1.5 hours',
        status: 'not_started',
        resources: [
          { title: 'Share Certificate Management', type: 'document' },
          { title: 'Freehold Responsibilities', type: 'document' },
          { title: 'Shareholder Rights and Duties', type: 'document' }
        ]
      });
    }

    return commonSteps;
  };

  const steps = getOnboardingSteps();
  const completionRate = (completedSteps.size / steps.length) * 100;

  const handleStepComplete = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepId);
    setCompletedSteps(newCompleted);
    if (onStepComplete) {
      onStepComplete(stepId);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'legal': return 'bg-red-100 text-red-800';
      case 'practical': return 'bg-blue-100 text-blue-800';
      case 'governance': return 'bg-purple-100 text-purple-800';
      case 'financial': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Scale className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Director Onboarding Programme</h2>
              <p className="text-sm text-gray-700 mt-1">
                Comprehensive training to ensure you understand your legal obligations and responsibilities
              </p>
            </div>
            <LegalGuidanceTooltip
              title="Director Legal Obligations"
              guidance={{
                basic: "As a company director, you have legal duties under the Companies Act 2006 including acting in the company's best interests, exercising reasonable care and skill, and avoiding conflicts of interest.",
                intermediate: "Key duties include promoting company success, exercising independent judgment, maintaining proper records, and ensuring compliance with statutory requirements including filing obligations.",
                advanced: "Detailed obligations include fiduciary duties, duty of care, statutory duties under Companies Act 2006 sections 171-177, potential personal liability, and specific sector requirements for property management."
              }}
              framework="CLRA_2002"
              mandatory={true}
              externalResources={[
                {
                  title: "Companies House Director Guidance",
                  url: "https://www.gov.uk/government/organisations/companies-house",
                  type: "government",
                  description: "Official director duties guidance"
                }
              ]}
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress:</span>
            <span className="text-lg font-bold text-blue-600">{Math.round(completionRate)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-600">
            {completedSteps.size} of {steps.length} steps completed
          </div>
        </div>
      </Card>

      {/* Onboarding Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={step.id} className="p-6">
            <div className="flex items-start space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                completedSteps.has(step.id) 
                  ? 'bg-green-500 text-white' 
                  : activeStep === step.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {completedSteps.has(step.id) ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  <Badge className={getCategoryColor(step.category)}>
                    {step.category}
                  </Badge>
                  {step.mandatory && (
                    <Badge variant="error">Mandatory</Badge>
                  )}
                </div>

                <p className="text-gray-600 mb-3">{step.description}</p>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{step.estimatedTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{step.resources.length} resources</span>
                  </div>
                </div>

                {/* Resources */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {step.resources.map((resource, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{resource.title}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{resource.type}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-3">
                  {!completedSteps.has(step.id) && (
                    <>
                      <Button
                        variant={activeStep === step.id ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setActiveStep(activeStep === step.id ? '' : step.id)}
                      >
                        {activeStep === step.id ? 'Hide Details' : 'Start Step'}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStepComplete(step.id)}
                      >
                        Mark Complete
                      </Button>
                    </>
                  )}
                  {completedSteps.has(step.id) && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Completion Summary */}
      {completionRate === 100 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Onboarding Complete!</h3>
              <p className="text-green-700 mt-1">
                Congratulations! You have completed all onboarding steps. You're now ready to fulfil your director duties with confidence.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DirectorOnboarding;

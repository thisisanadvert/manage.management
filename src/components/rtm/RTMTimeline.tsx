import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, AlertTriangle, Calendar, FileText, Users, Building2, Scale, BookOpen, Upload, Target, Shield, Eye } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import LegalGuidanceTooltip from '../legal/LegalGuidanceTooltip';
import RTMTimelineService, { RTMTimelineOverview } from '../../services/rtmTimelineService';
import EvidenceUploadModal from './EvidenceUploadModal';
import EvidenceList from './EvidenceList';
import { useAuth } from '../../contexts/AuthContext';

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
  evidenceRequired?: string[];
  legalRequirements?: string[];
  riskFactors?: string[];
  completionCriteria?: string[];
  actualStartDate?: string;
  actualEndDate?: string;
  notes?: string;
  progress?: number;
}

interface RTMTimelineProps {
  currentStep?: string;
  onStepClick?: (stepId: string) => void;
}

const RTMTimeline: React.FC<RTMTimelineProps> = ({
  currentStep = 'eligibility',
  onStepClick
}) => {
  const { user } = useAuth();
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [timelineData, setTimelineData] = useState<RTMTimelineOverview | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedStepForEvidence, setSelectedStepForEvidence] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadTimelineData();
    }
  }, [user?.id]);

  const loadTimelineData = async () => {
    try {
      const data = await RTMTimelineService.getTimelineOverview(user!.id);
      setTimelineData(data);
    } catch (error) {
      console.error('Failed to load timeline data:', error);
    }
  };

  const handleUploadEvidence = (stepId: string) => {
    setSelectedStepForEvidence(stepId);
    setShowEvidenceModal(true);
  };

  const handleEvidenceUploaded = () => {
    setShowEvidenceModal(false);
    setSelectedStepForEvidence(null);
    loadTimelineData();
  };

  const handleUpdateProgress = async (stepId: string, progress: number, notes?: string) => {
    try {
      await RTMTimelineService.updateStepProgress(user!.id, stepId, progress, notes);
      loadTimelineData();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const calculateOverallProgress = () => {
    if (!timelineData) return 0;
    const totalSteps = timelineSteps.length;
    const completedSteps = timelineSteps.filter(step => {
      const stepData = timelineData.steps.find(s => s.stepId === step.id);
      return stepData?.progress === 100;
    }).length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

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
      evidenceRequired: [
        'Lease documents showing qualifying criteria',
        'Leaseholder survey responses',
        'Building ownership structure',
        'Current management performance issues'
      ],
      legalRequirements: [
        'Building must contain at least 2 flats',
        'At least 2/3 of flats must be held on long leases',
        'Building must not be excluded under CLRA 2002'
      ],
      riskFactors: [
        'Insufficient leaseholder support',
        'Complex ownership structure',
        'Existing management disputes'
      ],
      completionCriteria: [
        'Eligibility confirmed',
        'Minimum 50% leaseholder interest',
        'Participant list compiled'
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
      evidenceRequired: [
        'Companies House incorporation certificate',
        'Signed articles of association',
        'Director consent forms',
        'Bank account confirmation'
      ],
      legalRequirements: [
        'Company name must end with RTM Ltd',
        'At least 2 qualifying leaseholder directors',
        'Articles must comply with CLRA 2002',
        'Company registered address in England/Wales'
      ],
      riskFactors: [
        'Name rejection by Companies House',
        'Director eligibility issues',
        'Banking requirements not met'
      ],
      completionCriteria: [
        'Company incorporated',
        'Directors appointed',
        'Bank account opened'
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
      evidenceRequired: [
        'Completed claim notice form',
        'Proof of service certificates',
        'Recorded delivery receipts',
        'Service acknowledgements'
      ],
      legalRequirements: [
        'Notice must be in prescribed form',
        'Served on all qualifying tenants',
        'Served on landlord/managing agent',
        'Minimum 14 days notice period'
      ],
      riskFactors: [
        'Incorrect service addresses',
        'Missing qualifying tenants',
        'Defective notice content',
        'Service method challenges'
      ],
      completionCriteria: [
        'All notices served correctly',
        'Proof of service obtained',
        'No service challenges received'
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
      evidenceRequired: [
        'Management handover checklist',
        'Account transfer confirmations',
        'Insurance policy assignments',
        'Key and access transfers'
      ],
      legalRequirements: [
        'Acquisition date 3 months after notice',
        'Counter-notice period compliance',
        'Proper account transfers',
        'Insurance continuity maintained'
      ],
      riskFactors: [
        'Counter-notice challenges',
        'Handover disputes',
        'Account transfer delays',
        'Insurance coverage gaps'
      ],
      completionCriteria: [
        'Management rights acquired',
        'All accounts transferred',
        'Insurance policies assigned',
        'Handover completed'
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
    <div className="space-y-6">
      {/* Legal Compliance Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Scale className="h-6 w-6 text-indigo-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">RTM Process Legal Timeline</h3>
              <p className="text-sm text-gray-700 mt-1">
                Follow the statutory process under CLRA 2002 with mandatory timelines and notice periods
              </p>
            </div>
            <LegalGuidanceTooltip
              title="RTM Process Legal Requirements"
              guidance={{
                basic: "The RTM process follows strict statutory timelines under CLRA 2002. Key stages include eligibility assessment, company formation, claim notice service, and acquisition of management rights.",
                intermediate: "Critical timelines: claim notice must specify acquisition date (minimum 3 months), counter-notice period (1 month), and various notice requirements throughout the process with specific statutory periods.",
                advanced: "Detailed process compliance: CLRA 2002 sections 78-95 govern the claim process, including notice requirements, counter-notice procedures, tribunal applications, and acquisition date calculations with specific timing obligations."
              }}
              framework="CLRA_2002"
              mandatory={true}
              externalResources={[
                {
                  title: "LEASE RTM Process Guide",
                  url: "https://www.lease-advice.org/advice-guide/right-to-manage/rtm-process/",
                  type: "lease",
                  description: "Step-by-step RTM process guidance"
                }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Enhanced Progress Overview */}
      <Card>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">RTM Process Timeline</h3>
              <p className="text-gray-600 mt-1">
                Track your progress through the Right to Manage formation process
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDemo(!showDemo)}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>{showDemo ? 'Hide Demo' : 'Demo Mode'}</span>
              </Button>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{calculateOverallProgress()}%</div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${calculateOverallProgress()}%` }}
            />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">
                {timelineSteps.filter(s => {
                  const stepData = timelineData?.steps.find(sd => sd.stepId === s.id);
                  return stepData?.progress === 100;
                }).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-semibold text-yellow-600">
                {timelineSteps.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-600">
                {timelineSteps.filter(s => s.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-600">
                {timelineData?.estimatedCompletionDate ?
                  new Date(timelineData.estimatedCompletionDate).toLocaleDateString('en-GB') :
                  'TBD'
                }
              </div>
              <div className="text-sm text-gray-600">Est. Completion</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>

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
                      <div className="mt-4 space-y-6 border-t border-gray-200 pt-4">
                        {/* Progress Tracking */}
                        {timelineData?.steps.find(s => s.stepId === step.id) && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">Progress</h5>
                              <span className="text-sm font-medium text-blue-600">
                                {timelineData.steps.find(s => s.stepId === step.id)?.progress || 0}%
                              </span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${timelineData.steps.find(s => s.stepId === step.id)?.progress || 0}%` }}
                              />
                            </div>
                            {timelineData.steps.find(s => s.stepId === step.id)?.notes && (
                              <p className="text-sm text-gray-600 mt-2">
                                {timelineData.steps.find(s => s.stepId === step.id)?.notes}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Enhanced Sections Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Key Tasks */}
                          <div>
                            <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                              <Target className="h-4 w-4 mr-2 text-blue-600" />
                              Key Tasks
                            </h5>
                            <ul className="space-y-2">
                              {step.keyTasks.map((task, taskIndex) => (
                                <li key={taskIndex} className="flex items-start space-x-2">
                                  <Circle className="h-3 w-3 text-gray-400 mt-1.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Legal Requirements */}
                          {step.legalRequirements && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                                <Scale className="h-4 w-4 mr-2 text-purple-600" />
                                Legal Requirements
                              </h5>
                              <ul className="space-y-2">
                                {step.legalRequirements.map((req, reqIndex) => (
                                  <li key={reqIndex} className="flex items-start space-x-2">
                                    <Shield className="h-3 w-3 text-purple-600 mt-1.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Evidence Required */}
                          {step.evidenceRequired && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-green-600" />
                                Evidence Required
                              </h5>
                              <ul className="space-y-2">
                                {step.evidenceRequired.map((evidence, evidenceIndex) => (
                                  <li key={evidenceIndex} className="flex items-start space-x-2">
                                    <FileText className="h-3 w-3 text-green-600 mt-1.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{evidence}</span>
                                  </li>
                                ))}
                              </ul>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUploadEvidence(step.id)}
                                className="mt-3 flex items-center space-x-2"
                              >
                                <Upload className="h-4 w-4" />
                                <span>Upload Evidence</span>
                              </Button>
                            </div>
                          )}

                          {/* Risk Factors */}
                          {step.riskFactors && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                                Risk Factors
                              </h5>
                              <ul className="space-y-2">
                                {step.riskFactors.map((risk, riskIndex) => (
                                  <li key={riskIndex} className="flex items-start space-x-2">
                                    <AlertTriangle className="h-3 w-3 text-red-600 mt-1.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{risk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Evidence List */}
                        {timelineData?.steps.find(s => s.stepId === step.id) && (
                          <EvidenceList
                            stepId={step.id}
                            evidence={timelineData.steps.find(s => s.stepId === step.id)?.evidence || []}
                            onEvidenceUpdate={loadTimelineData}
                          />
                        )}

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

        {/* Enhanced Timeline Summary */}
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Timeline Summary</h4>
                <p className="text-sm text-gray-600">
                  {timelineSteps.filter(step => step.status === 'completed').length} of {timelineSteps.length} steps completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{calculateOverallProgress()}%</div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>

            <div className="w-full bg-blue-200 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${calculateOverallProgress()}%` }}
              />
            </div>

            {timelineData?.estimatedCompletionDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Estimated completion:</span>
                <span className="font-medium text-gray-900">
                  {new Date(timelineData.estimatedCompletionDate).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Estimated Timeline */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Estimated Timeline</h4>
          </div>
          <p className="text-sm text-gray-700">
            The complete RTM process typically takes 6-12 months from start to finish, depending on complexity and any challenges from the current managing agent.
          </p>
        </div>
        </div>
      </Card>

      {/* Evidence Upload Modal */}
      {showEvidenceModal && selectedStepForEvidence && (
        <EvidenceUploadModal
          stepId={selectedStepForEvidence}
          stepTitle={timelineSteps.find(s => s.id === selectedStepForEvidence)?.title || ''}
          onClose={() => setShowEvidenceModal(false)}
          onUploadComplete={handleEvidenceUploaded}
        />
      )}
    </div>
  );
};

export default RTMTimeline;

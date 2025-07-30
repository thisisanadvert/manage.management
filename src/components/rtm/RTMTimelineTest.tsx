import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar,
  FileText,
  Upload,
  Target
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

/**
 * Test component to demonstrate the enhanced RTM timeline functionality
 * This shows how the system would work with real data
 */
const RTMTimelineTest: React.FC = () => {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [completedMilestones, setCompletedMilestones] = useState<Set<string>>(new Set());

  // Mock data representing the enhanced timeline
  const mockTimelineData = {
    progress: {
      overall_status: 'notice_phase',
      total_milestones: 5,
      completed_milestones: 2,
      progress_percentage: 40,
      claim_notice_served_date: '2024-01-15',
      counter_notice_deadline: '2024-02-15',
      acquisition_date: '2024-04-15',
      next_action_required: 'Upload proof of service for claim notice',
      days_until_next_deadline: 12
    },
    milestones: [
      {
        id: '1',
        milestone_type: 'eligibility_assessment',
        milestone_title: 'Eligibility Assessment',
        milestone_description: 'Verify building qualifies for RTM and assess leaseholder interest',
        status: 'completed',
        completed_date: '2023-12-01',
        evidence_required: true,
        evidence_description: 'Building lease documents, current management agreement, service charge accounts',
        milestone_order: 1,
        is_critical: true
      },
      {
        id: '2',
        milestone_type: 'company_formation',
        milestone_title: 'RTM Company Formation',
        milestone_description: 'Establish the RTM company and appoint directors',
        status: 'completed',
        completed_date: '2023-12-20',
        evidence_required: true,
        evidence_description: 'Companies House incorporation certificate, articles of association',
        milestone_order: 2,
        is_critical: true
      },
      {
        id: '3',
        milestone_type: 'claim_notice_served',
        milestone_title: 'Claim Notice Service',
        milestone_description: 'Serve formal RTM claim notice to landlord and qualifying tenants',
        status: 'completed',
        completed_date: '2024-01-15',
        calculated_deadline: '2024-01-20',
        evidence_required: true,
        evidence_description: 'Proof of service certificates, claim notice copies, recipient lists',
        milestone_order: 3,
        is_critical: true
      },
      {
        id: '4',
        milestone_type: 'counter_notice_period',
        milestone_title: 'Counter-Notice Period',
        milestone_description: 'Wait for counter-notice period (1 month) and respond to any counter-notices',
        status: 'in_progress',
        calculated_deadline: '2024-02-15',
        evidence_required: false,
        evidence_description: 'Any counter-notices received, responses to counter-notices',
        milestone_order: 4,
        is_critical: true
      },
      {
        id: '5',
        milestone_type: 'acquisition_complete',
        milestone_title: 'Management Acquisition',
        milestone_description: 'Complete the transfer of management responsibilities',
        status: 'pending',
        calculated_deadline: '2024-04-15',
        evidence_required: true,
        evidence_description: 'Management handover documents, service charge account transfers',
        milestone_order: 5,
        is_critical: true
      }
    ],
    nextDeadline: {
      date: '2024-02-15',
      description: 'Counter-notice deadline expires',
      daysRemaining: 12,
      isUrgent: true
    },
    recentEvidence: [
      {
        id: 'e1',
        document_title: 'Claim Notice - Landlord Service',
        document_type: 'proof_of_postage',
        service_date: '2024-01-15',
        verified: true,
        created_at: '2024-01-15'
      },
      {
        id: 'e2',
        document_title: 'Companies House Certificate',
        document_type: 'companies_house_certificate',
        verified: true,
        created_at: '2023-12-20'
      }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'in_progress':
        return 'bg-blue-100 border-blue-300';
      case 'overdue':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDaysRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCompleteMilestone = (milestoneId: string) => {
    setCompletedMilestones(prev => new Set([...prev, milestoneId]));
    alert(`Milestone ${milestoneId} marked as complete! In the real system, this would update the database and recalculate deadlines.`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">RTM Timeline Enhancement Demo</h2>
        <p className="text-blue-700">
          This demonstrates the enhanced RTM timeline with date tracking, evidence uploads, and automated deadline calculations.
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">RTM Process Timeline</h3>
            <Badge variant="primary" className="text-sm">
              {mockTimelineData.progress.overall_status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>
                {mockTimelineData.progress.completed_milestones} of {mockTimelineData.progress.total_milestones} milestones completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${mockTimelineData.progress.progress_percentage}%` }}
              />
            </div>
            <div className="text-right text-sm text-gray-600">
              {Math.round(mockTimelineData.progress.progress_percentage)}% complete
            </div>
          </div>

          {/* Next Deadline Alert */}
          <div className="p-4 rounded-lg border bg-red-50 border-red-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-red-800">Urgent Action Required</h4>
                <p className="text-sm text-red-600">
                  {mockTimelineData.nextDeadline.description} - {mockTimelineData.nextDeadline.daysRemaining} days remaining
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">
                  {mockTimelineData.nextDeadline.daysRemaining}
                </div>
                <div className="text-xs text-red-500">days left</div>
              </div>
            </div>
          </div>

          {/* Key Dates Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-sm text-gray-500">Claim Notice Served</div>
              <div className="font-medium text-gray-900">
                {formatDate(mockTimelineData.progress.claim_notice_served_date)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Counter-Notice Deadline</div>
              <div className="font-medium text-gray-900">
                {formatDate(mockTimelineData.progress.counter_notice_deadline)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Acquisition Date</div>
              <div className="font-medium text-gray-900">
                {formatDate(mockTimelineData.progress.acquisition_date)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Milestones Timeline */}
      <Card>
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">Milestones with Smart Tracking</h4>
          
          <div className="space-y-6">
            {mockTimelineData.milestones.map((milestone, index) => {
              const daysRemaining = milestone.calculated_deadline ? calculateDaysRemaining(milestone.calculated_deadline) : null;
              const isOverdue = daysRemaining !== null && daysRemaining < 0;
              const isUrgent = daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;
              
              return (
                <div key={milestone.id} className="relative">
                  {/* Connector Line */}
                  {index < mockTimelineData.milestones.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200" />
                  )}
                  
                  <div className={`flex items-start space-x-4 p-4 rounded-lg border-2 ${getStatusColor(milestone.status)}`}>
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(milestone.status)}
                    </div>
                    
                    {/* Milestone Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Target className="h-5 w-5" />
                          <h5 className="text-lg font-medium text-gray-900">
                            {milestone.milestone_title}
                          </h5>
                          <Badge variant={milestone.is_critical ? 'warning' : 'secondary'}>
                            {milestone.is_critical ? 'Critical' : 'Standard'}
                          </Badge>
                        </div>
                        
                        {milestone.status !== 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteMilestone(milestone.id)}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{milestone.milestone_description}</p>
                      
                      {/* Dates and Deadlines */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {milestone.completed_date && (
                          <div>
                            <span className="text-gray-500">Completed:</span>
                            <div className="font-medium text-green-600">{formatDate(milestone.completed_date)}</div>
                          </div>
                        )}
                        
                        {milestone.calculated_deadline && milestone.status !== 'completed' && (
                          <div>
                            <span className="text-gray-500">Deadline:</span>
                            <div className={`font-medium ${
                              isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-gray-900'
                            }`}>
                              {formatDate(milestone.calculated_deadline)}
                              {daysRemaining !== null && (
                                <span className="ml-2 text-xs">
                                  ({daysRemaining > 0 ? `${daysRemaining} days left` : `${Math.abs(daysRemaining)} days overdue`})
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Evidence Section */}
                      {milestone.evidence_required && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Evidence Required</span>
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<Upload className="h-4 w-4" />}
                              onClick={() => alert('Evidence upload modal would open here')}
                            >
                              Upload Evidence
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{milestone.evidence_description}</p>
                          
                          {/* Mock Evidence List */}
                          <div className="space-y-2">
                            {mockTimelineData.recentEvidence
                              .filter(evidence => 
                                (milestone.milestone_type === 'claim_notice_served' && evidence.document_type === 'proof_of_postage') ||
                                (milestone.milestone_type === 'company_formation' && evidence.document_type === 'companies_house_certificate')
                              )
                              .map(evidence => (
                                <div key={evidence.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                                  <FileText className="h-4 w-4 text-gray-600" />
                                  <span className="text-sm font-medium">{evidence.document_title}</span>
                                  {evidence.verified && (
                                    <Badge variant="success" className="text-xs">Verified</Badge>
                                  )}
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="text-center py-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Enhanced RTM Timeline Features Demonstrated</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-green-700">
          <div>📅 <strong>Date Tracking:</strong> Completion dates recorded</div>
          <div>📄 <strong>Evidence Collection:</strong> Document upload system</div>
          <div>⏰ <strong>Deadline Calculation:</strong> Auto-calculated statutory deadlines</div>
          <div>📊 <strong>Progress Monitoring:</strong> Real-time progress tracking</div>
        </div>
      </div>
    </div>
  );
};

export default RTMTimelineTest;

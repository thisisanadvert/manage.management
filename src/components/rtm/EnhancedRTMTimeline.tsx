import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Upload, 
  FileText, 
  Calendar,
  Target,
  Users,
  Building2,
  Shield,
  Eye,
  Download,
  Plus,
  X
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import RTMTimelineService, { RTMTimelineOverview, RTMMilestone, RTMEvidence } from '../../services/rtmTimelineService';
import { useAuth } from '../../contexts/AuthContext';
import EvidenceUploadModal from './EvidenceUploadModal';
import EvidenceList from './EvidenceList';

interface EnhancedRTMTimelineProps {
  buildingId: string;
  onMilestoneComplete?: (milestoneId: string) => void;
}

const EnhancedRTMTimeline: React.FC<EnhancedRTMTimelineProps> = ({
  buildingId,
  onMilestoneComplete
}) => {
  const { user } = useAuth();
  const [timelineData, setTimelineData] = useState<RTMTimelineOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState<RTMMilestone | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [completionNotes, setCompletionNotes] = useState('');

  const timelineService = RTMTimelineService.getInstance();

  useEffect(() => {
    loadTimelineData();
  }, [buildingId]);

  const loadTimelineData = async () => {
    setLoading(true);
    try {
      // Initialize timeline if it doesn't exist
      await timelineService.initializeRTMTimeline(buildingId, user?.id || '');
      
      // Load timeline data
      const data = await timelineService.getTimelineOverview(buildingId);
      setTimelineData(data);
    } catch (error) {
      console.error('Error loading timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMilestone = async () => {
    if (!selectedMilestone) return;

    try {
      const result = await timelineService.completeMilestone(
        selectedMilestone.id!,
        completionDate,
        completionNotes
      );

      if (result.success) {
        setShowCompletionModal(false);
        setSelectedMilestone(null);
        setCompletionNotes('');
        await loadTimelineData();
        onMilestoneComplete?.(selectedMilestone.id!);
      } else {
        alert(`Error completing milestone: ${result.error}`);
      }
    } catch (error) {
      console.error('Error completing milestone:', error);
      alert('Failed to complete milestone');
    }
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDaysRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'eligibility_assessment':
        return <Users className="h-5 w-5" />;
      case 'company_formation':
        return <Building2 className="h-5 w-5" />;
      case 'claim_notice_served':
        return <FileText className="h-5 w-5" />;
      case 'counter_notice_period':
        return <Clock className="h-5 w-5" />;
      case 'acquisition_complete':
        return <Shield className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!timelineData) {
    return (
      <Card>
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline Not Available</h3>
          <p className="text-gray-600">Unable to load RTM timeline data.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">RTM Process Timeline</h3>
            <Badge 
              variant={timelineData.progress.overall_status === 'completed' ? 'success' : 'primary'}
              className="text-sm"
            >
              {timelineData.progress.overall_status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>
                {timelineData.progress.completed_milestones} of {timelineData.progress.total_milestones} milestones completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${timelineData.progress.progress_percentage}%` }}
              />
            </div>
            <div className="text-right text-sm text-gray-600">
              {Math.round(timelineData.progress.progress_percentage)}% complete
            </div>
          </div>

          {/* Next Deadline Alert */}
          {timelineData.nextDeadline && (
            <div className={`p-4 rounded-lg border ${
              timelineData.nextDeadline.isUrgent 
                ? 'bg-red-50 border-red-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  timelineData.nextDeadline.isUrgent ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {timelineData.nextDeadline.isUrgent ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    timelineData.nextDeadline.isUrgent ? 'text-red-800' : 'text-blue-800'
                  }`}>
                    {timelineData.nextDeadline.isUrgent ? 'Urgent Action Required' : 'Upcoming Deadline'}
                  </h4>
                  <p className={`text-sm ${
                    timelineData.nextDeadline.isUrgent ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {timelineData.nextDeadline.description} - {timelineData.nextDeadline.daysRemaining} days remaining
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    timelineData.nextDeadline.isUrgent ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {timelineData.nextDeadline.daysRemaining}
                  </div>
                  <div className={`text-xs ${
                    timelineData.nextDeadline.isUrgent ? 'text-red-500' : 'text-blue-500'
                  }`}>
                    days left
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Dates Summary */}
          {(timelineData.progress.claim_notice_served_date || timelineData.progress.acquisition_date) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {timelineData.progress.claim_notice_served_date && (
                <div className="text-center">
                  <div className="text-sm text-gray-500">Claim Notice Served</div>
                  <div className="font-medium text-gray-900">
                    {formatDate(timelineData.progress.claim_notice_served_date)}
                  </div>
                </div>
              )}
              {timelineData.progress.counter_notice_deadline && (
                <div className="text-center">
                  <div className="text-sm text-gray-500">Counter-Notice Deadline</div>
                  <div className="font-medium text-gray-900">
                    {formatDate(timelineData.progress.counter_notice_deadline)}
                  </div>
                </div>
              )}
              {timelineData.progress.acquisition_date && (
                <div className="text-center">
                  <div className="text-sm text-gray-500">Acquisition Date</div>
                  <div className="font-medium text-gray-900">
                    {formatDate(timelineData.progress.acquisition_date)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Milestones Timeline */}
      <Card>
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">Milestones</h4>
          
          <div className="space-y-6">
            {timelineData.milestones.map((milestone, index) => {
              const daysRemaining = calculateDaysRemaining(milestone.calculated_deadline);
              const isOverdue = daysRemaining !== null && daysRemaining < 0;
              const isUrgent = daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;
              
              return (
                <div key={milestone.id} className="relative">
                  {/* Connector Line */}
                  {index < timelineData.milestones.length - 1 && (
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
                          {getMilestoneIcon(milestone.milestone_type)}
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
                            onClick={() => {
                              setSelectedMilestone(milestone);
                              setShowCompletionModal(true);
                            }}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{milestone.milestone_description}</p>
                      
                      {/* Dates and Deadlines */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {milestone.started_date && (
                          <div>
                            <span className="text-gray-500">Started:</span>
                            <div className="font-medium">{formatDate(milestone.started_date)}</div>
                          </div>
                        )}
                        
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
                              onClick={() => {
                                setSelectedMilestone(milestone);
                                setShowEvidenceModal(true);
                              }}
                            >
                              Upload Evidence
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{milestone.evidence_description}</p>

                          {/* Evidence List */}
                          <EvidenceList
                            milestoneId={milestone.id!}
                            buildingId={buildingId}
                            canVerify={true}
                            onEvidenceVerified={loadTimelineData}
                          />
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

      {/* Completion Modal */}
      {showCompletionModal && selectedMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Complete Milestone</h3>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{selectedMilestone.milestone_title}</h4>
                <p className="text-sm text-gray-600">{selectedMilestone.milestone_description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Date
                </label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add any notes about this milestone completion..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="primary"
                  onClick={handleCompleteMilestone}
                  className="flex-1"
                >
                  Complete Milestone
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCompletionModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Upload Modal */}
      {showEvidenceModal && selectedMilestone && (
        <EvidenceUploadModal
          milestone={selectedMilestone}
          buildingId={buildingId}
          userId={user?.id || ''}
          onClose={() => setShowEvidenceModal(false)}
          onEvidenceUploaded={loadTimelineData}
        />
      )}
    </div>
  );
};

export default EnhancedRTMTimeline;

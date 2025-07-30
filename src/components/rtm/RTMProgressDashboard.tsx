import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  FileText,
  Target,
  Users,
  Building2,
  Shield,
  ArrowRight,
  Bell
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import RTMTimelineService, { RTMTimelineOverview } from '../../services/rtmTimelineService';
import EnhancedRTMTimeline from './EnhancedRTMTimeline';
import RTMDeadlineCalculator from './RTMDeadlineCalculator';

interface RTMProgressDashboardProps {
  buildingId: string;
  buildingName?: string;
}

interface ProgressStats {
  totalMilestones: number;
  completedMilestones: number;
  progressPercentage: number;
  daysInProcess: number;
  nextDeadline?: {
    title: string;
    date: string;
    daysRemaining: number;
    isUrgent: boolean;
  };
  recentActivity: Array<{
    type: 'milestone_completed' | 'evidence_uploaded' | 'deadline_approaching';
    title: string;
    description: string;
    date: string;
  }>;
}

const RTMProgressDashboard: React.FC<RTMProgressDashboardProps> = ({
  buildingId,
  buildingName
}) => {
  const [timelineData, setTimelineData] = useState<RTMTimelineOverview | null>(null);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'deadlines'>('overview');

  const timelineService = RTMTimelineService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, [buildingId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await timelineService.getTimelineOverview(buildingId);
      if (data) {
        setTimelineData(data);
        
        // Calculate progress stats
        const processStartDate = new Date(data.progress.process_started_date || new Date());
        const now = new Date();
        const daysInProcess = Math.ceil((now.getTime() - processStartDate.getTime()) / (1000 * 60 * 60 * 24));

        const stats: ProgressStats = {
          totalMilestones: data.progress.total_milestones,
          completedMilestones: data.progress.completed_milestones,
          progressPercentage: data.progress.progress_percentage,
          daysInProcess,
          nextDeadline: data.nextDeadline ? {
            title: data.nextDeadline.description,
            date: data.nextDeadline.date,
            daysRemaining: data.nextDeadline.daysRemaining,
            isUrgent: data.nextDeadline.isUrgent
          } : undefined,
          recentActivity: [
            // This would be populated from actual activity logs
            {
              type: 'milestone_completed',
              title: 'Eligibility Assessment Completed',
              description: 'Building qualifies for RTM with sufficient leaseholder support',
              date: new Date().toISOString()
            }
          ]
        };

        setProgressStats(stats);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'eligibility_phase':
        return <Users className="h-5 w-5" />;
      case 'formation_phase':
        return <Building2 className="h-5 w-5" />;
      case 'notice_phase':
        return <FileText className="h-5 w-5" />;
      case 'waiting_period':
        return <Clock className="h-5 w-5" />;
      case 'acquisition_phase':
        return <Shield className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getPhaseLabel = (phase: string) => {
    const labels: Record<string, string> = {
      'not_started': 'Not Started',
      'eligibility_phase': 'Eligibility Assessment',
      'formation_phase': 'Company Formation',
      'notice_phase': 'Notice Service',
      'waiting_period': 'Waiting Period',
      'acquisition_phase': 'Acquisition',
      'completed': 'Completed',
      'disputed': 'Disputed',
      'abandoned': 'Abandoned'
    };
    return labels[phase] || phase;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateLong = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!timelineData || !progressStats) {
    return (
      <Card>
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No RTM Process Found</h3>
          <p className="text-gray-600">Start your RTM process to see progress tracking.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">RTM Progress Dashboard</h2>
          {buildingName && (
            <p className="text-gray-600 mt-1">{buildingName}</p>
          )}
        </div>
        <Badge 
          variant={timelineData.progress.overall_status === 'completed' ? 'success' : 'primary'}
          className="text-sm px-3 py-1"
        >
          {getPhaseLabel(timelineData.progress.overall_status)}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(progressStats.progressPercentage)}%
              </div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {progressStats.completedMilestones}/{progressStats.totalMilestones}
              </div>
              <div className="text-sm text-gray-600">Milestones</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {progressStats.daysInProcess}
              </div>
              <div className="text-sm text-gray-600">Days in Process</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              progressStats.nextDeadline?.isUrgent ? 'bg-red-100' : 'bg-orange-100'
            }`}>
              <Clock className={`h-6 w-6 ${
                progressStats.nextDeadline?.isUrgent ? 'text-red-600' : 'text-orange-600'
              }`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${
                progressStats.nextDeadline?.isUrgent ? 'text-red-600' : 'text-gray-900'
              }`}>
                {progressStats.nextDeadline?.daysRemaining || 0}
              </div>
              <div className="text-sm text-gray-600">Days to Deadline</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Next Action Alert */}
      {progressStats.nextDeadline && (
        <Card>
          <div className={`p-4 rounded-lg border-l-4 ${
            progressStats.nextDeadline.isUrgent 
              ? 'bg-red-50 border-red-400' 
              : 'bg-blue-50 border-blue-400'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                progressStats.nextDeadline.isUrgent ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {progressStats.nextDeadline.isUrgent ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <Bell className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${
                  progressStats.nextDeadline.isUrgent ? 'text-red-800' : 'text-blue-800'
                }`}>
                  {progressStats.nextDeadline.isUrgent ? 'Urgent Action Required' : 'Upcoming Deadline'}
                </h4>
                <p className={`text-sm ${
                  progressStats.nextDeadline.isUrgent ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {progressStats.nextDeadline.title} - Due {formatDateLong(progressStats.nextDeadline.date)}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  progressStats.nextDeadline.isUrgent ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {progressStats.nextDeadline.daysRemaining}
                </div>
                <div className={`text-xs ${
                  progressStats.nextDeadline.isUrgent ? 'text-red-500' : 'text-blue-500'
                }`}>
                  days left
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Key Dates Summary */}
      {(timelineData.progress.claim_notice_served_date || timelineData.progress.acquisition_date) && (
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Key Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {timelineData.progress.claim_notice_served_date && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 font-medium mb-1">Claim Notice Served</div>
                  <div className="text-lg font-bold text-green-800">
                    {formatDate(timelineData.progress.claim_notice_served_date)}
                  </div>
                </div>
              )}
              {timelineData.progress.counter_notice_deadline && (
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm text-orange-600 font-medium mb-1">Counter-Notice Deadline</div>
                  <div className="text-lg font-bold text-orange-800">
                    {formatDate(timelineData.progress.counter_notice_deadline)}
                  </div>
                </div>
              )}
              {timelineData.progress.acquisition_date && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium mb-1">Acquisition Date</div>
                  <div className="text-lg font-bold text-blue-800">
                    {formatDate(timelineData.progress.acquisition_date)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'timeline', label: 'Timeline', icon: Clock },
            { id: 'deadlines', label: 'Deadlines', icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Phase */}
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Phase</h3>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-primary-100 rounded-lg">
                  {getPhaseIcon(timelineData.progress.overall_status)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {getPhaseLabel(timelineData.progress.overall_status)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {timelineData.progress.next_action_required}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Evidence */}
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Evidence</h3>
              {timelineData.recentEvidence.length > 0 ? (
                <div className="space-y-3">
                  {timelineData.recentEvidence.slice(0, 3).map((evidence) => (
                    <div key={evidence.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {evidence.document_title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(evidence.created_at!)}
                        </div>
                      </div>
                      {evidence.verified && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No evidence uploaded yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'timeline' && (
        <EnhancedRTMTimeline
          buildingId={buildingId}
          onMilestoneComplete={loadDashboardData}
        />
      )}

      {activeTab === 'deadlines' && (
        <RTMDeadlineCalculator
          buildingId={buildingId}
          onDateCalculated={loadDashboardData}
        />
      )}
    </div>
  );
};

export default RTMProgressDashboard;

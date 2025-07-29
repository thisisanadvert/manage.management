import React from 'react';
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  MessageSquare,
  MapPin,
  PenTool as Tool,
  Building2,
  Wrench,
  Zap,
  Droplet,
  Shield,
  Brush,
  Link,
  User,
  Vote,
  History,
  Flame
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import CreateIssueModal from '../components/modals/CreateIssueModal';
import IssueDetail from '../components/issue/IssueDetail';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBuilding, useEffectiveBuildingId } from '../contexts/BuildingContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import BuildingSafetyCompliance from '../components/building-safety/BuildingSafetyCompliance';
import BuildingSelector from '../components/management/BuildingSelector';
import { useFeatures } from '../hooks/useFeatures';

const IssuesManagement = () => {
  const [activeTab, setActiveTab] = useState('issues');
  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    critical: 0,
    inProgress: 0,
    scheduled: 0,
    completed: 0
  });

  const { user } = useAuth();
  const { isManagementCompany } = useBuilding();
  const effectiveBuildingId = useEffectiveBuildingId();
  const { isDevelopmentEnvironment } = useFeatures();
  const navigate = useNavigate();



  useEffect(() => {
    if (effectiveBuildingId) {
      fetchIssues();
    }
  }, [effectiveBuildingId, selectedFilter, searchQuery]);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      if (!effectiveBuildingId) {
        console.log('No effective building ID, skipping fetch');
        setIsLoading(false);
        return;
      }

      console.log('Fetching issues for building ID:', effectiveBuildingId);

      // First, fetch issues without user relationships to avoid foreign key error
      let query = supabase
        .from('issues')
        .select('*')
        .eq('building_id', effectiveBuildingId);

      // Apply filters
      if (selectedFilter !== 'all') {
        if (selectedFilter === 'critical') {
          query = query.eq('priority', 'Critical');
        } else if (selectedFilter === 'high') {
          query = query.eq('priority', 'High');
        } else if (selectedFilter === 'in-progress') {
          query = query.eq('status', 'In Progress');
        } else if (selectedFilter === 'scheduled') {
          query = query.eq('status', 'Scheduled');
        }
      }

      // Apply search
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      console.log('Issues fetch result:', { data, error, count: data?.length });

      if (error) {
        console.error('Error fetching issues:', error);
        throw error;
      }

      if (data) {
        console.log('Sample issue data:', data[0]);

        // Validate that we have proper UUIDs
        const validIssues = data.filter(issue => {
          const isValidUUID = issue.id && typeof issue.id === 'string' && issue.id.length === 36;
          if (!isValidUUID) {
            console.error('Invalid issue ID found:', issue.id, issue);
          }
          return isValidUUID;
        });

        console.log('Valid issues count:', validIssues.length, 'out of', data.length);

        // For now, just show issues without user details to avoid the foreign key error
        setIssues(validIssues.map(issue => ({
          ...issue,
          id: `ISS-${issue.id.substring(0, 4)}`,
          fullId: issue.id, // Store the full UUID for detail view
          reportedBy: 'User', // Simplified for now
          reportedAt: new Date(issue.created_at).toLocaleDateString()
        })));

        // Calculate stats
        const criticalCount = validIssues.filter(i => i.priority === 'Critical').length;
        const inProgressCount = validIssues.filter(i => i.status === 'In Progress').length;
        const scheduledCount = validIssues.filter(i => i.status === 'Scheduled').length;
        const completedCount = validIssues.filter(i => i.status === 'Completed').length;

        setStats({ critical: criticalCount, inProgress: inProgressCount, scheduled: scheduledCount, completed: completedCount });
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIssueCreated = () => {
    fetchIssues();
  };
  
  const viewIssueDetails = (issueId: string) => {
    setSelectedIssueId(issueId);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'plumbing':
        return <Droplet size={20} />;
      case 'electrical':
        return <Zap size={20} />;
      case 'mechanical':
        return <Wrench size={20} />;
      case 'security':
        return <Shield size={20} />;
      case 'cleaning':
        return <Brush size={20} />;
      default:
        return <Tool size={20} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'accent';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'warning';
      case 'scheduled':
        return 'accent';
      default:
        return 'gray';
    }
  };

  const tabs = [
    { id: 'issues', label: 'Issues Management', icon: <Tool className="h-4 w-4" /> },
    { id: 'building-safety', label: 'Building Safety', icon: <Flame className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issues & Safety Management</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'management-company'
              ? 'Track maintenance issues and safety compliance across your portfolio'
              : 'Track building maintenance issues and safety compliance'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            leftIcon={<Plus size={16} />}
            variant="primary"
            onClick={() => setIsCreateIssueModalOpen(true)}
            disabled={isManagementCompany && !effectiveBuildingId}
          >
            Report New Issue
          </Button>
        </div>
      </div>

      {/* Building Selector for Management Companies */}
      <BuildingSelector />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'issues' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-error-50">
          <div className="flex items-center">
            <div className="p-3 bg-error-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-error-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-error-600">Critical Issues</p>
              <h3 className="text-xl font-bold text-error-900">{stats.critical}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-warning-50">
          <div className="flex items-center">
            <div className="p-3 bg-warning-100 rounded-lg">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-warning-600">In Progress</p>
              <h3 className="text-xl font-bold text-warning-900">{stats.inProgress}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-accent-50">
          <div className="flex items-center">
            <div className="p-3 bg-accent-100 rounded-lg">
              <Calendar className="h-6 w-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-accent-600">Scheduled</p>
              <h3 className="text-xl font-bold text-accent-900">{stats.scheduled}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-success-50">
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-success-600">Completed</p>
              <h3 className="text-xl font-bold text-success-900">{stats.completed}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search issues..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
            />
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            >
              <option value="all">All Issues</option>
              <option value="critical">Critical</option>
              <option value="high">High Priority</option>
              <option value="in-progress">In Progress</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <Button 
              variant="outline"
              leftIcon={<Filter size={16} />}
            >
              More Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 min-h-[200px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : isManagementCompany && !effectiveBuildingId ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Select a Building</h3>
            <p className="mt-1 text-sm text-gray-500">
              Choose a building from your portfolio to view and manage its issues
            </p>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No issues found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedFilter !== 'all'
                ? 'Try changing your search or filter criteria'
                : 'Get started by reporting your first issue'}
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={() => setIsCreateIssueModalOpen(true)}
                disabled={isManagementCompany && !effectiveBuildingId}
              >
                Report New Issue
              </Button>
            </div>
          </div>
        ) : issues.map((issue) => (
          <Card key={issue.id} hoverable className="animate-slide-up">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg bg-${getPriorityColor(issue.priority)}-100`}>
                {getCategoryIcon(issue.category)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getPriorityColor(issue.priority)} size="sm">{issue.priority}</Badge>
                  <Badge variant={getStatusColor(issue.status)} size="sm">{issue.status}</Badge>
                  <span className="text-sm text-gray-500">{issue.id}</span>
                </div>

                <h3 className="text-lg font-medium">{issue.title}</h3>
                <p className="mt-1 text-gray-600">{issue.description}</p>

                {/* Location and Assignment Info */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{issue.location?.unit ? `Unit ${issue.location.unit} - ${issue.location.area}` : issue.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>Reported by {issue.reportedBy?.name || issue.reportedBy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{issue.reportedAt}</span>
                  </div>
                </div>

                {/* Updates and Related Items */}
                {issue.updates && Array.isArray(issue.updates) && issue.updates.length > 0 && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Recent Updates</h4>
                      <span className="text-sm text-gray-500">{issue.updates.length} updates</span>
                    </div>
                    <div className="space-y-2">
                      {issue.updates.slice(0, 2).map((update, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                          <div>
                            <p className="text-gray-900">{update.content}</p>
                            <p className="text-xs text-gray-500">
                              {update.author} - {update.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Items */}
                {issue.relatedItems && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {issue.relatedItems.poll && (
                      <div className="flex items-center gap-2 text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded-full">
                        <Vote size={14} />
                        <span>Related Poll: {issue.relatedItems.poll.title}</span>
                      </div>
                    )}
                    {issue.assignedTo && (
                      <div className="flex items-center gap-2 text-sm bg-success-50 text-success-700 px-3 py-1 rounded-full">
                        <Link size={14} />
                        <span>Assigned: {typeof issue.assignedTo === 'string' ? issue.assignedTo : issue.assignedTo.name}</span>
                        {typeof issue.assignedTo !== 'string' && issue.assignedTo.verified && (
                          <CheckCircle2 size={14} className="text-success-500" />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline Preview */}
                {issue.timeline && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <History size={14} />
                    <span>Latest: {issue.timeline[issue.timeline.length - 1].event}</span>
                  </div>
                )}
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => viewIssueDetails(issue.fullId)}
              >View Details</Button>
            </div>
          </Card>
        ))}
      </div>

          <CreateIssueModal
            isOpen={isCreateIssueModalOpen}
            onClose={() => setIsCreateIssueModalOpen(false)}
            buildingId={effectiveBuildingId || ''}
            onIssueCreated={handleIssueCreated}
          />

          {selectedIssueId && (
            <IssueDetail
              issueId={selectedIssueId}
              onClose={() => setSelectedIssueId(null)}
              onStatusChange={fetchIssues}
            />
          )}
        </div>
      )}

      {/* Building Safety Tab */}
      {activeTab === 'building-safety' && (
        <BuildingSafetyCompliance />
      )}
    </div>
  );
};

export default IssuesManagement;
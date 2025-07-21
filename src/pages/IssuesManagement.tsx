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
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import BuildingSafetyCompliance from '../components/building-safety/BuildingSafetyCompliance';
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

  // Building selector for management companies
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [isBuildingsLoading, setIsBuildingsLoading] = useState(false);

  const { user } = useAuth();
  const { isDevelopmentEnvironment } = useFeatures();
  const navigate = useNavigate();

  // Fetch buildings for management companies
  const fetchBuildings = async () => {
    if (user?.role !== 'management-company') return;

    setIsBuildingsLoading(true);
    try {
      console.log('🔍 DEBUG: Fetching buildings for user:', {
        userId: user.id,
        userEmail: user.email,
        userRole: user.role
      });

      // Get buildings where the user is a management company
      const { data: buildingUsers, error: buildingUsersError } = await supabase
        .from('building_users')
        .select('building_id, role, user_id')
        .eq('user_id', user.id)
        .eq('role', 'management-company');

      console.log('🔍 DEBUG: Building users query result:', {
        buildingUsers,
        buildingUsersError,
        queryUserId: user.id
      });

      if (buildingUsersError) throw buildingUsersError;

      // Also check what building_users exist for this email
      const { data: allUserBuildings, error: allUserError } = await supabase
        .from('building_users')
        .select('building_id, role, user_id, buildings(name)')
        .eq('user_id', user.id);

      console.log('🔍 DEBUG: All buildings for this user:', {
        allUserBuildings,
        allUserError
      });

      // Check if management@demo.com user exists in auth.users and get their ID
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('id, email')
        .eq('email', 'management@demo.com');

      console.log('🔍 DEBUG: Auth users check:', {
        authUsers,
        authError,
        currentUserMatches: authUsers?.some(u => u.id === user.id)
      });

      if (buildingUsers && buildingUsers.length > 0) {
        const buildingIds = buildingUsers.map(bu => bu.building_id);
        console.log('🔍 DEBUG: Building IDs found:', buildingIds);

        const { data: buildingsData, error: buildingsError } = await supabase
          .from('buildings')
          .select('id, name, address')
          .in('id', buildingIds)
          .order('name');

        console.log('🔍 DEBUG: Buildings data result:', {
          buildingsData,
          buildingsError
        });

        if (buildingsError) throw buildingsError;

        setBuildings(buildingsData || []);

        // Auto-select first building if none selected
        if (buildingsData && buildingsData.length > 0 && !selectedBuildingId) {
          setSelectedBuildingId(buildingsData[0].id);
        }
      } else {
        console.log('🔍 DEBUG: No building_users found with management-company role');
      }
    } catch (error) {
      console.error('🔍 DEBUG: Error fetching buildings:', error);
    } finally {
      setIsBuildingsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'management-company') {
      fetchBuildings();
    }
  }, [user]);

  useEffect(() => {
    const buildingId = user?.role === 'management-company' ? selectedBuildingId : user?.metadata?.buildingId;
    if (buildingId) {
      fetchIssues();
    }
  }, [user?.metadata?.buildingId, selectedBuildingId, selectedFilter, searchQuery]);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      // Determine which building ID to use
      const buildingId = user?.role === 'management-company' ? selectedBuildingId : user?.metadata?.buildingId;

      if (!buildingId) {
        setIsLoading(false);
        return;
      }

      // First, fetch issues without user relationships to avoid foreign key error
      let query = supabase
        .from('issues')
        .select('*')
        .eq('building_id', buildingId);
      
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

      if (error) throw error;

      if (data) {
        // For now, just show issues without user details to avoid the foreign key error
        setIssues(data.map(issue => ({
          ...issue,
          id: `ISS-${issue.id.substring(0, 4)}`,
          reportedBy: 'User', // Simplified for now
          reportedAt: new Date(issue.created_at).toLocaleDateString()
        })));
        
        // Calculate stats
        const criticalCount = data.filter(i => i.priority === 'Critical').length;
        const inProgressCount = data.filter(i => i.status === 'In Progress').length;
        const scheduledCount = data.filter(i => i.status === 'Scheduled').length;
        const completedCount = data.filter(i => i.status === 'Completed').length;
        
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
            disabled={user?.role === 'management-company' && !selectedBuildingId}
          >
            Report New Issue
          </Button>
        </div>
      </div>

      {/* Building Selector for Management Companies */}
      {user?.role === 'management-company' && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 size={20} className="text-primary-600" />
              <label className="text-sm font-medium text-gray-700">
                Select Building:
              </label>
            </div>
            <div className="flex-1 max-w-md">
              {isBuildingsLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  Loading buildings...
                </div>
              ) : buildings.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No buildings found. <a href="/management/building-setup" className="text-primary-600 hover:underline">Add a building</a> to get started.
                </div>
              ) : (
                <select
                  value={selectedBuildingId}
                  onChange={(e) => setSelectedBuildingId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                >
                  <option value="">Select a building...</option>
                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name} - {building.address}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {selectedBuildingId && (
              <div className="text-sm text-gray-500">
                Viewing issues for selected building
              </div>
            )}
          </div>
        </Card>
      )}

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
        ) : user?.role === 'management-company' && !selectedBuildingId ? (
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
                disabled={user?.role === 'management-company' && !selectedBuildingId}
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
                onClick={() => viewIssueDetails(issue.id)}
              >View Details</Button>
            </div>
          </Card>
        ))}
      </div>

          <CreateIssueModal
            isOpen={isCreateIssueModalOpen}
            onClose={() => setIsCreateIssueModalOpen(false)}
            buildingId={user?.role === 'management-company' ? selectedBuildingId : (user?.metadata?.buildingId || '')}
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
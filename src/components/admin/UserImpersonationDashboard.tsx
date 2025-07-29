import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  Shield, 
  AlertTriangle, 
  Clock, 
  Eye,
  UserCheck,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserSearchFilters, 
  UserSearchResult, 
  ImpersonationReason,
  ActiveImpersonationSession 
} from '../../types/impersonation';
import ImpersonationService from '../../services/impersonationService';
import ImpersonationAuditService from '../../services/impersonationAuditService';

interface UserImpersonationDashboardProps {
  onImpersonationStart?: (userId: string) => void;
}

const UserImpersonationDashboard: React.FC<UserImpersonationDashboardProps> = ({
  onImpersonationStart
}) => {
  console.log('UserImpersonationDashboard component loaded');

  const { user, canImpersonate, startImpersonation, isImpersonating } = useAuth();
  const [activeTab, setActiveTab] = useState<'search' | 'active' | 'audit'>('search');
  
  // Search state
  const [searchFilters, setSearchFilters] = useState<UserSearchFilters>({});
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Active sessions state
  const [activeSessions, setActiveSessions] = useState<ActiveImpersonationSession[]>([]);
  const [activeSessionsLoading, setActiveSessionsLoading] = useState(false);

  // Impersonation modal state
  const [showImpersonationModal, setShowImpersonationModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [impersonationReason, setImpersonationReason] = useState<ImpersonationReason>('Customer Support');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [impersonationLoading, setImpersonationLoading] = useState(false);

  const impersonationService = React.useMemo(() => {
    try {
      return ImpersonationService.getInstance();
    } catch (error) {
      console.error('Failed to initialize ImpersonationService:', error);
      return null;
    }
  }, []);

  const auditService = React.useMemo(() => {
    try {
      return ImpersonationAuditService.getInstance();
    } catch (error) {
      console.error('Failed to initialize ImpersonationAuditService:', error);
      return null;
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    if (canImpersonate) {
      loadActiveSessions();
      performSearch();
    }
  }, [canImpersonate]);

  const performSearch = async (page: number = 1) => {
    if (!user?.id || !impersonationService) {
      console.warn('Cannot perform search: missing user ID or impersonation service');
      return;
    }

    setSearchLoading(true);
    try {
      const result = await impersonationService.searchUsers(
        searchFilters,
        page,
        20,
        user.id
      );

      if (page === 1) {
        setSearchResults(result.users);
      } else {
        setSearchResults(prev => [...prev, ...result.users]);
      }

      setTotalResults(result.total);
      setHasMore(result.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error searching users:', error);
      // Set some dummy data for testing
      setSearchResults([
        {
          id: 'test-user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'homeowner',
          account_status: 'active',
          can_impersonate: true,
          created_at: new Date().toISOString()
        }
      ]);
      setTotalResults(1);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadActiveSessions = async () => {
    if (!user?.id || !auditService) {
      console.warn('Cannot load active sessions: missing user ID or audit service');
      return;
    }

    setActiveSessionsLoading(true);
    try {
      const sessions = await auditService.getActiveSessions(user.id);
      setActiveSessions(sessions);
    } catch (error) {
      console.error('Error loading active sessions:', error);
      setActiveSessions([]); // Set empty array on error
    } finally {
      setActiveSessionsLoading(false);
    }
  };

  const handleSearchFilterChange = (key: keyof UserSearchFilters, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    performSearch(1);
  };

  const handleLoadMore = () => {
    if (hasMore && !searchLoading) {
      performSearch(currentPage + 1);
    }
  };

  const handleImpersonateClick = (user: UserSearchResult) => {
    setSelectedUser(user);
    setShowImpersonationModal(true);
  };

  const handleStartImpersonation = async () => {
    if (!selectedUser || !user?.id) return;

    setImpersonationLoading(true);
    try {
      const result = await startImpersonation(
        selectedUser.id,
        impersonationReason,
        additionalNotes
      );

      if (result.success) {
        setShowImpersonationModal(false);
        setSelectedUser(null);
        setAdditionalNotes('');
        onImpersonationStart?.(selectedUser.id);
        
        // Refresh active sessions
        loadActiveSessions();
      } else {
        alert(`Failed to start impersonation: ${result.error}`);
      }
    } catch (error) {
      console.error('Error starting impersonation:', error);
      alert('Failed to start impersonation session');
    } finally {
      setImpersonationLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'rtm-director': return 'bg-blue-100 text-blue-800';
      case 'rmc-director': return 'bg-purple-100 text-purple-800';
      case 'management-company': return 'bg-green-100 text-green-800';
      case 'homeowner': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Debug information for troubleshooting
  console.log('UserImpersonationDashboard Debug:', {
    user: user,
    userRole: user?.role,
    canImpersonate: canImpersonate,
    isImpersonating: isImpersonating
  });

  if (!canImpersonate) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600">
          You don't have permission to access the user impersonation dashboard.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          <p>User: {user?.email}</p>
          <p>Role: {user?.role}</p>
          <p>Can Impersonate: {canImpersonate ? 'Yes' : 'No'}</p>
        </div>
      </div>
    );
  }

  const renderSearchTab = () => (
    <div className="space-y-6">
      {/* Search Filters */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Users</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={searchFilters.email || ''}
              onChange={(e) => handleSearchFilterChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={searchFilters.role || ''}
              onChange={(e) => handleSearchFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Roles</option>
              <option value="homeowner">Homeowner</option>
              <option value="rtm-director">RTM Director</option>
              <option value="rmc-director">RMC Director</option>
              <option value="management-company">Management Company</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
            <input
              type="text"
              placeholder="Building name"
              value={searchFilters.buildingName || ''}
              onChange={(e) => handleSearchFilterChange('buildingName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
            <select
              value={searchFilters.accountStatus || ''}
              onChange={(e) => handleSearchFilterChange('accountStatus', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="primary"
            leftIcon={<Search className="h-4 w-4" />}
            onClick={handleSearch}
            isLoading={searchLoading}
          >
            Search Users
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              setSearchFilters({});
              setCurrentPage(1);
              performSearch(1);
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Search Results */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Search Results ({totalResults} users)
          </h3>
        </div>

        {searchResults.length === 0 && !searchLoading ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users found matching your criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {searchResults.map((searchUser) => (
              <div
                key={searchUser.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">
                      {searchUser.name || searchUser.email}
                    </h4>
                    <Badge className={getRoleColor(searchUser.role)}>
                      {searchUser.role}
                    </Badge>
                    <Badge className={getStatusColor(searchUser.account_status)}>
                      {searchUser.account_status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{searchUser.email}</span>
                    {searchUser.building_name && (
                      <span className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1" />
                        {searchUser.building_name}
                      </span>
                    )}
                    {searchUser.last_login && (
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Last login: {new Date(searchUser.last_login).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  {searchUser.impersonation_restrictions && searchUser.impersonation_restrictions.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-700">
                          Restrictions: {searchUser.impersonation_restrictions.join(', ')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye className="h-4 w-4" />}
                    onClick={() => {
                      // Could open user details modal
                      console.log('View user details:', searchUser.id);
                    }}
                  >
                    View
                  </Button>
                  
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<UserCheck className="h-4 w-4" />}
                    onClick={() => handleImpersonateClick(searchUser)}
                    disabled={!searchUser.can_impersonate}
                  >
                    Impersonate
                  </Button>
                </div>
              </div>
            ))}
            
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  isLoading={searchLoading}
                >
                  Load More Users
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );

  const renderActiveSessionsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Impersonation Sessions</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={loadActiveSessions}
            isLoading={activeSessionsLoading}
          >
            Refresh
          </Button>
        </div>

        {activeSessions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No active impersonation sessions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div
                key={session.session_id}
                className={`p-4 border rounded-lg ${
                  session.is_expired ? 'border-red-200 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {session.target_email}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleColor(session.target_role)}>
                      {session.target_role}
                    </Badge>
                    {session.is_expired && (
                      <Badge variant="error">Expired</Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Reason:</span> {session.reason}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {Math.round(session.duration_minutes)}m
                  </div>
                  <div>
                    <span className="font-medium">Started:</span> {new Date(session.started_at).toLocaleTimeString()}
                  </div>
                  <div>
                    <span className="font-medium">Remaining:</span> {Math.max(0, session.max_session_duration_minutes - session.duration_minutes)}m
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Impersonation</h2>
          <p className="text-gray-600 mt-1">
            Securely impersonate users for customer support and administrative purposes
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'search', label: 'Search Users', icon: Search },
            { id: 'active', label: 'Active Sessions', icon: Clock },
            { id: 'audit', label: 'Audit Log', icon: Shield }
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
                {tab.id === 'active' && activeSessions.length > 0 && (
                  <Badge variant="primary" className="ml-2">
                    {activeSessions.length}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'search' && renderSearchTab()}
      {activeTab === 'active' && renderActiveSessionsTab()}
      {activeTab === 'audit' && (
        <div className="text-center py-12">
          <p className="text-gray-600">Audit log functionality coming soon...</p>
        </div>
      )}

      {/* Impersonation Confirmation Modal */}
      {showImpersonationModal && selectedUser && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Impersonation
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                You are about to impersonate:
              </p>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedUser.name || selectedUser.email}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <p className="text-sm text-gray-600">Role: {selectedUser.role}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Impersonation *
              </label>
              <select
                value={impersonationReason}
                onChange={(e) => setImpersonationReason(e.target.value as ImpersonationReason)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Customer Support">Customer Support</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Data Investigation">Data Investigation</option>
                <option value="Account Recovery">Account Recovery</option>
                <option value="Compliance Review">Compliance Review</option>
                <option value="Bug Investigation">Bug Investigation</option>
                <option value="Training/Demo">Training/Demo</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Optional: Provide additional context for this impersonation session..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImpersonationModal(false);
                  setSelectedUser(null);
                  setAdditionalNotes('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStartImpersonation}
                isLoading={impersonationLoading}
              >
                Start Impersonation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserImpersonationDashboard;

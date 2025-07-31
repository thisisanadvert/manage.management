/**
 * User Management List Component
 * Displays building users and pending invitations with management actions
 */

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Clock, CheckCircle, XCircle, MoreVertical, Shield, Eye, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import InvitationService, { BuildingInvitation, UserBuildingRole } from '../../services/invitationService';
import { useAuth } from '../../contexts/AuthContext';

interface UserManagementListProps {
  buildingId: string;
  onInviteUser: () => void;
  refreshTrigger?: number;
}

interface BuildingUser {
  id: string;
  user_id: string;
  role: UserBuildingRole;
  unit_number?: string;
  is_primary_contact: boolean;
  can_invite_users: boolean;
  can_manage_finances: boolean;
  can_manage_maintenance: boolean;
  can_view_documents: boolean;
  joined_at: string;
  user: {
    id: string;
    email: string;
    raw_user_meta_data: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  };
}

const UserManagementList: React.FC<UserManagementListProps> = ({
  buildingId,
  onInviteUser,
  refreshTrigger = 0
}) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<BuildingUser[]>([]);
  const [invitations, setInvitations] = useState<BuildingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const invitationService = InvitationService.getInstance();

  useEffect(() => {
    loadData();
  }, [buildingId, refreshTrigger]);

  const loadData = async () => {
    if (!buildingId || !user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Load building users
      const { data: usersData, error: usersError } = await invitationService.getBuildingUsers(buildingId);
      if (usersError && usersError.message !== 'No user data found. This might be the first user for this building.') {
        console.error('Error loading users:', usersError);
        console.log('Full error details:', usersError);

        // Provide more specific error messages
        if (usersError.message?.includes('permission denied')) {
          setError('Permission denied. You may not have access to view building users.');
        } else if (usersError.message?.includes('relation') && usersError.message?.includes('does not exist')) {
          setError('Database tables not properly configured. Please contact support.');
        } else {
          setError(`Failed to load building users: ${usersError.message || 'Unknown error'}`);
        }
      } else {
        // Set users data (could be empty array for new buildings)
        setUsers(usersData || []);

        // If we got the "first user" message, log it but don't show as error
        if (usersError?.message === 'No user data found. This might be the first user for this building.') {
          console.log('This appears to be a new building with no users yet');
        }
      }

      // Load pending invitations
      const { data: invitationsData, error: invitationsError } = await invitationService.getBuildingInvitations(buildingId, user.id);
      if (invitationsError) {
        console.error('Error loading invitations:', invitationsError);
        // Don't set error for invitations failure if users loaded successfully
        if (!usersData) {
          setError(prev => prev || 'Failed to load invitations');
        }
      } else {
        setInvitations(invitationsData?.filter(inv => inv.status === 'pending') || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(`Failed to load user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!user?.id) return;

    if (!confirm('Are you sure you want to revoke this invitation?')) return;

    try {
      const result = await invitationService.revokeInvitation(invitationId, user.id);
      if (result.success) {
        loadData(); // Refresh data
      } else {
        alert(result.error || 'Failed to revoke invitation');
      }
    } catch (error) {
      console.error('Error revoking invitation:', error);
      alert('Failed to revoke invitation');
    }
  };

  const getRoleDisplay = (role: UserBuildingRole) => {
    const roleMap = {
      rtm_director: { label: 'RTM Director', color: 'bg-purple-100 text-purple-800' },
      rmc_director: { label: 'RMC Director', color: 'bg-purple-100 text-purple-800' },
      leaseholder: { label: 'Leaseholder', color: 'bg-blue-100 text-blue-800' },
      freeholder: { label: 'Freeholder', color: 'bg-green-100 text-green-800' },
      stakeholder: { label: 'Stakeholder', color: 'bg-gray-100 text-gray-800' },
      management_company: { label: 'Management Co.', color: 'bg-orange-100 text-orange-800' },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' }
    };
    return roleMap[role] || { label: role, color: 'bg-gray-100 text-gray-800' };
  };

  const getContextDisplay = (context: string) => {
    const contextMap = {
      general: 'General Invitation',
      leaseholder_survey: 'Survey Invitation',
      company_formation: 'Director Invitation',
      director_invitation: 'Director Invitation',
      building_setup: 'Building Setup'
    };
    return contextMap[context as keyof typeof contextMap] || context;
  };

  const formatUserName = (user: BuildingUser['user']) => {
    const meta = user.raw_user_meta_data;
    if (meta?.firstName && meta?.lastName) {
      return `${meta.firstName} ${meta.lastName}`;
    }
    return user.email;
  };

  const formatInvitationName = (invitation: BuildingInvitation) => {
    if (invitation.first_name && invitation.last_name) {
      return `${invitation.first_name} ${invitation.last_name}`;
    }
    return invitation.email;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        {/* Header with invite button even when there's an error */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">User Management</h3>
            <p className="text-sm text-gray-600">Manage building users and send invitations</p>
          </div>
          <Button
            onClick={onInviteUser}
            className="flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite User</span>
          </Button>
        </div>

        {/* Error display */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 mb-1">Failed to Load Users</h4>
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-3 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Show invitations even if users failed to load */}
        {invitations.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Pending Invitations</h4>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {invitation.first_name && invitation.last_name
                              ? `${invitation.first_name} ${invitation.last_name}`
                              : invitation.email}
                          </p>
                          <p className="text-sm text-gray-500">{invitation.email}</p>
                          {invitation.unit_number && (
                            <p className="text-xs text-gray-400">Unit: {invitation.unit_number}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="warning">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                        <button
                          onClick={() => handleRevokeInvitation(invitation.id!)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Revoke invitation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Building Users</h3>
          <p className="text-sm text-gray-600">
            Manage users and invitations for this building ({users.length} users, {invitations.length} pending)
          </p>
        </div>
        <Button
          onClick={onInviteUser}
          className="flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite User</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Active Users</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Pending Invitations</span>
          </div>
          <p className="text-2xl font-bold text-orange-900 mt-1">{invitations.length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Directors</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {users.filter(u => u.role?.includes('director')).length}
          </p>
        </div>
      </div>

      {/* Active Users */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Active Users ({users.length})
        </h4>
        
        {users.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h4>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              This building doesn't have any users yet. Start by inviting leaseholders, directors, or other stakeholders to join.
            </p>
            <Button
              onClick={onInviteUser}
              className="flex items-center space-x-2 mx-auto"
            >
              <UserPlus className="h-4 w-4" />
              <span>Send Your First Invitation</span>
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {users.map((buildingUser) => {
                const roleDisplay = getRoleDisplay(buildingUser.role);
                return (
                  <div key={buildingUser.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {formatUserName(buildingUser.user).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatUserName(buildingUser.user)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {buildingUser.user.email}
                            {buildingUser.unit_number && ` • Unit ${buildingUser.unit_number}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={roleDisplay.color}>
                          {roleDisplay.label}
                        </Badge>
                        {buildingUser.is_primary_contact && (
                          <Badge className="bg-green-100 text-green-800">
                            Primary Contact
                          </Badge>
                        )}
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          {buildingUser.can_invite_users && <Shield className="h-3 w-3" />}
                          {buildingUser.can_manage_finances && <span>£</span>}
                          {buildingUser.can_view_documents && <Eye className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pending Invitations */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Pending Invitations ({invitations.length})
        </h4>
        
        {invitations.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Mail className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No pending invitations</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {invitations.map((invitation) => {
                const roleDisplay = getRoleDisplay(invitation.invited_role);
                const expiresAt = new Date(invitation.expires_at);
                const isExpiringSoon = expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000; // 24 hours
                
                return (
                  <div key={invitation.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatInvitationName(invitation)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invitation.email}
                            {invitation.unit_number && ` • Unit ${invitation.unit_number}`}
                          </div>
                          <div className="text-xs text-gray-400">
                            {getContextDisplay(invitation.context)} • 
                            Expires {expiresAt.toLocaleDateString('en-GB')}
                            {isExpiringSoon && (
                              <span className="text-orange-600 ml-1">(Soon)</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={roleDisplay.color}>
                          {roleDisplay.label}
                        </Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeInvitation(invitation.id!)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementList;

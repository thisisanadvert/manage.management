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
      if (usersError) {
        console.error('Error loading users:', usersError);
        setError('Failed to load building users');
      } else {
        setUsers(usersData || []);
      }

      // Load pending invitations
      const { data: invitationsData, error: invitationsError } = await invitationService.getBuildingInvitations(buildingId, user.id);
      if (invitationsError) {
        console.error('Error loading invitations:', invitationsError);
      } else {
        setInvitations(invitationsData?.filter(inv => inv.status === 'pending') || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load user data');
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          className="mt-2"
        >
          Try Again
        </Button>
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
            Manage users and invitations for this building
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
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{users.length}</div>
          <div className="text-sm text-blue-700">Active Users</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{invitations.length}</div>
          <div className="text-sm text-yellow-700">Pending Invitations</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.role.includes('director')).length}
          </div>
          <div className="text-sm text-purple-700">Directors</div>
        </div>
      </div>

      {/* Active Users */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Active Users ({users.length})
        </h4>
        
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No users found</p>
            <p className="text-sm">Invite users to get started</p>
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

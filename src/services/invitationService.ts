/**
 * Comprehensive User Invitation Service
 * Handles invitation code generation, validation, and management
 */

import { supabase } from '../lib/supabase';

// Types
export type UserBuildingRole = 
  | 'rtm_director'
  | 'rmc_director' 
  | 'leaseholder'
  | 'freeholder'
  | 'stakeholder'
  | 'management_company'
  | 'pending';

export type InvitationContext = 
  | 'general'
  | 'leaseholder_survey'
  | 'company_formation'
  | 'director_invitation'
  | 'building_setup';

export type InvitationStatus = 
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'revoked';

export interface BuildingInvitation {
  id?: string;
  building_id: string;
  created_by: string;
  invitation_code: string;
  email: string;
  invited_role: UserBuildingRole;
  context: InvitationContext;
  first_name?: string;
  last_name?: string;
  unit_number?: string;
  phone?: string;
  context_data?: Record<string, any>;
  status: InvitationStatus;
  expires_at: string;
  accepted_at?: string;
  accepted_by?: string;
  invitation_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserBuildingRoleRecord {
  id?: string;
  user_id: string;
  building_id: string;
  role: UserBuildingRole;
  unit_number?: string;
  is_primary_contact?: boolean;
  can_invite_users?: boolean;
  can_manage_finances?: boolean;
  can_manage_maintenance?: boolean;
  can_view_documents?: boolean;
  invited_by?: string;
  invitation_id?: string;
  joined_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvitationResponse {
  id?: string;
  invitation_id: string;
  user_id?: string;
  response_type: 'accepted' | 'rejected';
  response_message?: string;
  ip_address?: string;
  user_agent?: string;
  responded_at?: string;
}

export interface CreateInvitationRequest {
  building_id: string;
  email: string;
  invited_role: UserBuildingRole;
  context: InvitationContext;
  first_name?: string;
  last_name?: string;
  unit_number?: string;
  phone?: string;
  context_data?: Record<string, any>;
  invitation_message?: string;
  expires_in_days?: number;
}

export interface InvitationValidationResult {
  valid: boolean;
  invitation?: BuildingInvitation;
  error?: string;
  building_name?: string;
  inviter_name?: string;
}

class InvitationService {
  private static instance: InvitationService;

  public static getInstance(): InvitationService {
    if (!InvitationService.instance) {
      InvitationService.instance = new InvitationService();
    }
    return InvitationService.instance;
  }

  /**
   * Create a new invitation
   */
  async createInvitation(request: CreateInvitationRequest, created_by: string): Promise<{ data: BuildingInvitation | null; error: any }> {
    try {
      // Check if user has permission to create invitations
      const { data: userRole, error: roleError } = await supabase
        .from('user_building_roles')
        .select('role, can_invite_users')
        .eq('user_id', created_by)
        .eq('building_id', request.building_id)
        .single();

      if (roleError || !userRole?.can_invite_users) {
        return { 
          data: null, 
          error: { message: 'You do not have permission to create invitations for this building' }
        };
      }

      // Check if invitation already exists for this email and building
      const { data: existingInvitation } = await supabase
        .from('building_invitations')
        .select('id, status')
        .eq('building_id', request.building_id)
        .eq('email', request.email)
        .eq('status', 'pending')
        .single();

      if (existingInvitation) {
        return { 
          data: null, 
          error: { message: 'An active invitation already exists for this email address' }
        };
      }

      // Generate unique invitation code
      const { data: codeResult, error: codeError } = await supabase
        .rpc('generate_invitation_code');

      if (codeError || !codeResult) {
        return { data: null, error: codeError || { message: 'Failed to generate invitation code' } };
      }

      // Calculate expiration date
      const expiresInDays = request.expires_in_days || 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      // Create invitation
      const invitationData: Omit<BuildingInvitation, 'id' | 'created_at' | 'updated_at'> = {
        building_id: request.building_id,
        created_by,
        invitation_code: codeResult,
        email: request.email,
        invited_role: request.invited_role,
        context: request.context,
        first_name: request.first_name,
        last_name: request.last_name,
        unit_number: request.unit_number,
        phone: request.phone,
        context_data: request.context_data || {},
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        invitation_message: request.invitation_message
      };

      const { data, error } = await supabase
        .from('building_invitations')
        .insert([invitationData])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating invitation:', error);
      return { data: null, error };
    }
  }

  /**
   * Validate an invitation code
   */
  async validateInvitation(code: string): Promise<InvitationValidationResult> {
    try {
      // First expire any old invitations
      await supabase.rpc('expire_old_invitations');

      // Get invitation with building and inviter details
      const { data: invitation, error } = await supabase
        .from('building_invitations')
        .select(`
          *,
          buildings!inner(name),
          created_by_user:auth.users!building_invitations_created_by_fkey(
            raw_user_meta_data
          )
        `)
        .eq('invitation_code', code)
        .eq('status', 'pending')
        .single();

      if (error || !invitation) {
        return {
          valid: false,
          error: 'Invalid or expired invitation code'
        };
      }

      // Check if invitation has expired
      if (new Date(invitation.expires_at) < new Date()) {
        // Mark as expired
        await supabase
          .from('building_invitations')
          .update({ status: 'expired' })
          .eq('id', invitation.id);

        return {
          valid: false,
          error: 'This invitation has expired'
        };
      }

      // Extract inviter name
      const inviterMeta = invitation.created_by_user?.raw_user_meta_data;
      const inviterName = inviterMeta?.firstName && inviterMeta?.lastName 
        ? `${inviterMeta.firstName} ${inviterMeta.lastName}`
        : inviterMeta?.email || 'Unknown';

      return {
        valid: true,
        invitation: invitation as BuildingInvitation,
        building_name: invitation.buildings?.name,
        inviter_name: inviterName
      };
    } catch (error) {
      console.error('Error validating invitation:', error);
      return {
        valid: false,
        error: 'Failed to validate invitation code'
      };
    }
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(code: string, user_id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate invitation first
      const validation = await this.validateInvitation(code);
      if (!validation.valid || !validation.invitation) {
        return { success: false, error: validation.error };
      }

      const invitation = validation.invitation;

      // Check if user is already associated with this building
      const { data: existingRole } = await supabase
        .from('user_building_roles')
        .select('id')
        .eq('user_id', user_id)
        .eq('building_id', invitation.building_id)
        .single();

      if (existingRole) {
        return { success: false, error: 'You are already associated with this building' };
      }

      // Start transaction-like operations
      const now = new Date().toISOString();

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('building_invitations')
        .update({
          status: 'accepted',
          accepted_at: now,
          accepted_by: user_id
        })
        .eq('id', invitation.id);

      if (updateError) {
        return { success: false, error: 'Failed to accept invitation' };
      }

      // Create user building role
      const rolePermissions = this.getRolePermissions(invitation.invited_role);
      const userRole: Omit<UserBuildingRoleRecord, 'id' | 'created_at' | 'updated_at'> = {
        user_id,
        building_id: invitation.building_id,
        role: invitation.invited_role,
        unit_number: invitation.unit_number,
        is_primary_contact: false,
        invited_by: invitation.created_by,
        invitation_id: invitation.id,
        joined_at: now,
        ...rolePermissions
      };

      const { error: roleError } = await supabase
        .from('user_building_roles')
        .insert([userRole]);

      if (roleError) {
        // Rollback invitation acceptance
        await supabase
          .from('building_invitations')
          .update({
            status: 'pending',
            accepted_at: null,
            accepted_by: null
          })
          .eq('id', invitation.id);

        return { success: false, error: 'Failed to create user role' };
      }

      // Update user metadata with building ID
      await supabase.auth.updateUser({
        data: {
          buildingId: invitation.building_id
        }
      });

      // Record invitation response
      await this.recordInvitationResponse(invitation.id, user_id, 'accepted');

      return { success: true };
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return { success: false, error: 'Failed to accept invitation' };
    }
  }

  /**
   * Get role permissions based on role type
   */
  private getRolePermissions(role: UserBuildingRole) {
    switch (role) {
      case 'rtm_director':
      case 'rmc_director':
        return {
          can_invite_users: true,
          can_manage_finances: true,
          can_manage_maintenance: true,
          can_view_documents: true
        };
      case 'management_company':
        return {
          can_invite_users: true,
          can_manage_finances: true,
          can_manage_maintenance: true,
          can_view_documents: true
        };
      case 'freeholder':
        return {
          can_invite_users: false,
          can_manage_finances: false,
          can_manage_maintenance: true,
          can_view_documents: true
        };
      default: // leaseholder, stakeholder, pending
        return {
          can_invite_users: false,
          can_manage_finances: false,
          can_manage_maintenance: false,
          can_view_documents: true
        };
    }
  }

  /**
   * Record invitation response for audit trail
   */
  private async recordInvitationResponse(
    invitation_id: string, 
    user_id: string, 
    response_type: 'accepted' | 'rejected',
    response_message?: string
  ) {
    try {
      const response: Omit<InvitationResponse, 'id' | 'responded_at'> = {
        invitation_id,
        user_id,
        response_type,
        response_message
      };

      await supabase
        .from('invitation_responses')
        .insert([response]);
    } catch (error) {
      console.error('Error recording invitation response:', error);
      // Don't throw error as this is for audit trail only
    }
  }

  /**
   * Get invitations for a building
   */
  async getBuildingInvitations(building_id: string, user_id: string): Promise<{ data: BuildingInvitation[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('building_invitations')
        .select('*')
        .eq('building_id', building_id)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error getting building invitations:', error);
      return { data: null, error };
    }
  }

  /**
   * Revoke an invitation
   */
  async revokeInvitation(invitation_id: string, user_id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('building_invitations')
        .update({ status: 'revoked' })
        .eq('id', invitation_id)
        .eq('created_by', user_id);

      if (error) {
        return { success: false, error: 'Failed to revoke invitation' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error revoking invitation:', error);
      return { success: false, error: 'Failed to revoke invitation' };
    }
  }

  /**
   * Get building users with their roles
   */
  async getBuildingUsers(building_id: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_building_roles')
        .select(`
          *,
          user:auth.users!user_building_roles_user_id_fkey(
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq('building_id', building_id)
        .order('joined_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error getting building users:', error);
      return { data: null, error };
    }
  }
}

export default InvitationService;

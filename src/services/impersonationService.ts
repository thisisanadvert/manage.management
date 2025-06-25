/**
 * Impersonation Service
 * Handles secure user impersonation with comprehensive security checks and user management
 */

import { supabase } from '../lib/supabase';
import {
  UserSearchFilters,
  UserSearchResult,
  ImpersonationStartRequest,
  ImpersonationStartResponse,
  ImpersonationEndRequest,
  ImpersonationEndResponse,
  ImpersonationPermissions,
  ImpersonationSecurityAlert,
  ImpersonationActionType
} from '../types/impersonation';
import ImpersonationAuditService from './impersonationAuditService';

class ImpersonationService {
  private static instance: ImpersonationService;
  private auditService: ImpersonationAuditService;

  private constructor() {
    this.auditService = ImpersonationAuditService.getInstance();
  }

  public static getInstance(): ImpersonationService {
    if (!ImpersonationService.instance) {
      ImpersonationService.instance = new ImpersonationService();
    }
    return ImpersonationService.instance;
  }

  /**
   * Search users available for impersonation
   */
  async searchUsers(
    filters: UserSearchFilters,
    page: number = 1,
    limit: number = 20,
    adminUserId: string
  ): Promise<{ users: UserSearchResult[]; total: number; hasMore: boolean }> {
    try {
      // Get admin permissions first
      const permissions = await this.auditService.getUserPermissions(adminUserId);
      if (!permissions || !permissions.is_active) {
        throw new Error('No active impersonation permissions');
      }

      // Build query
      let query = supabase
        .from('auth.users')
        .select(`
          id,
          email,
          raw_user_meta_data,
          created_at,
          last_sign_in_at,
          building_users!inner(
            building_id,
            buildings(name)
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }

      if (filters.role) {
        query = query.eq('raw_user_meta_data->>role', filters.role);
      }

      // Filter by roles admin can impersonate
      query = query.in('raw_user_meta_data->>role', permissions.can_impersonate_roles);

      // Exclude super-admin users
      query = query.neq('raw_user_meta_data->>role', 'super-admin');

      // Filter by building if specified
      if (filters.buildingName) {
        query = query.ilike('building_users.buildings.name', `%${filters.buildingName}%`);
      }

      // Filter by building permissions if admin has restrictions
      if (permissions.can_impersonate_buildings && permissions.can_impersonate_buildings.length > 0) {
        query = query.in('building_users.building_id', permissions.can_impersonate_buildings);
      }

      // Date filters
      if (filters.registrationDateFrom) {
        query = query.gte('created_at', filters.registrationDateFrom);
      }
      if (filters.registrationDateTo) {
        query = query.lte('created_at', filters.registrationDateTo);
      }
      if (filters.lastLoginFrom) {
        query = query.gte('last_sign_in_at', filters.lastLoginFrom);
      }
      if (filters.lastLoginTo) {
        query = query.lte('last_sign_in_at', filters.lastLoginTo);
      }

      // Pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error searching users:', error);
        throw new Error('Failed to search users');
      }

      // Transform data to UserSearchResult format
      const users: UserSearchResult[] = (data || []).map(user => ({
        id: user.id,
        email: user.email,
        name: user.raw_user_meta_data?.firstName && user.raw_user_meta_data?.lastName 
          ? `${user.raw_user_meta_data.firstName} ${user.raw_user_meta_data.lastName}`
          : undefined,
        role: user.raw_user_meta_data?.role || 'unknown',
        building_name: user.building_users?.[0]?.buildings?.name,
        building_id: user.building_users?.[0]?.building_id,
        last_login: user.last_sign_in_at,
        created_at: user.created_at,
        account_status: this.determineAccountStatus(user),
        can_impersonate: this.canImpersonateUser(user, permissions),
        impersonation_restrictions: this.getImpersonationRestrictions(user, permissions)
      }));

      return {
        users,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      };
    } catch (error) {
      console.error('Error in searchUsers:', error);
      throw error;
    }
  }

  /**
   * Validate impersonation request with comprehensive security checks
   */
  async validateImpersonationRequest(
    request: ImpersonationStartRequest,
    adminUserId: string
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check admin permissions
      const permissions = await this.auditService.getUserPermissions(adminUserId);
      if (!permissions || !permissions.is_active) {
        errors.push('No active impersonation permissions');
        return { valid: false, errors, warnings };
      }

      // Check if permissions have expired
      if (permissions.expires_at && new Date(permissions.expires_at) < new Date()) {
        errors.push('Impersonation permissions have expired');
        return { valid: false, errors, warnings };
      }

      // Get target user
      const { data: targetUser, error: userError } = await supabase.auth.admin.getUserById(request.targetUserId);
      if (userError || !targetUser) {
        errors.push('Target user not found');
        return { valid: false, errors, warnings };
      }

      // Check if target user is super-admin
      if (targetUser.user.user_metadata?.role === 'super-admin') {
        errors.push('Cannot impersonate super-admin users');
        return { valid: false, errors, warnings };
      }

      // Check role permissions
      const targetRole = targetUser.user.user_metadata?.role;
      if (!targetRole || !permissions.can_impersonate_roles.includes(targetRole)) {
        errors.push(`Not authorized to impersonate users with role: ${targetRole}`);
        return { valid: false, errors, warnings };
      }

      // Check building permissions
      const targetBuildingId = targetUser.user.user_metadata?.buildingId;
      if (permissions.can_impersonate_buildings && 
          permissions.can_impersonate_buildings.length > 0 && 
          targetBuildingId &&
          !permissions.can_impersonate_buildings.includes(targetBuildingId)) {
        errors.push('Not authorized to impersonate users in this building');
        return { valid: false, errors, warnings };
      }

      // Check concurrent session limits
      const activeSessions = await this.auditService.getActiveSessions(adminUserId);
      if (activeSessions.length >= permissions.max_concurrent_sessions) {
        errors.push(`Maximum concurrent sessions reached (${permissions.max_concurrent_sessions})`);
        return { valid: false, errors, warnings };
      }

      // Check daily session limits
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = await this.auditService.getAuditLog(undefined, adminUserId);
      const todaySessionCount = todaySessions.filter(session => 
        session.started_at.startsWith(today)
      ).length;

      if (todaySessionCount >= permissions.max_daily_sessions) {
        errors.push(`Daily session limit reached (${permissions.max_daily_sessions})`);
        return { valid: false, errors, warnings };
      }

      // Add warnings for approaching limits
      if (activeSessions.length >= permissions.max_concurrent_sessions - 1) {
        warnings.push('Approaching concurrent session limit');
      }

      if (todaySessionCount >= permissions.max_daily_sessions - 2) {
        warnings.push('Approaching daily session limit');
      }

      // Check if user account is active
      if (targetUser.user.banned_until) {
        errors.push('Target user account is suspended');
        return { valid: false, errors, warnings };
      }

      // Check for recent suspicious activity
      const recentSessions = await this.auditService.getAuditLog(undefined, adminUserId, undefined, 10);
      const recentFailures = recentSessions.filter(session => 
        session.status === 'ended_security' || session.status === 'ended_error'
      );

      if (recentFailures.length >= 3) {
        warnings.push('Recent security incidents detected. Proceed with caution.');
      }

      return { valid: errors.length === 0, errors, warnings };
    } catch (error) {
      console.error('Error validating impersonation request:', error);
      errors.push('Failed to validate impersonation request');
      return { valid: false, errors, warnings };
    }
  }

  /**
   * Start impersonation with full security validation
   */
  async startImpersonation(
    request: ImpersonationStartRequest,
    adminUserId: string,
    adminEmail: string
  ): Promise<ImpersonationStartResponse> {
    try {
      // Validate request
      const validation = await this.validateImpersonationRequest(request, adminUserId);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join('; ')
        };
      }

      // Get target user details
      const { data: targetUser, error: userError } = await supabase.auth.admin.getUserById(request.targetUserId);
      if (userError || !targetUser) {
        return {
          success: false,
          error: 'Target user not found'
        };
      }

      // Get permissions for session limits
      const permissions = await this.auditService.getUserPermissions(adminUserId);
      if (!permissions) {
        return {
          success: false,
          error: 'No permissions found'
        };
      }

      // Start audit session
      const { sessionId } = await this.auditService.startImpersonationSession(
        adminUserId,
        adminEmail,
        request.targetUserId,
        targetUser.user.email!,
        targetUser.user.user_metadata?.role || 'unknown',
        request.reason,
        request.additionalNotes,
        targetUser.user.user_metadata?.buildingId
      );

      // Log the impersonation start
      await this.auditService.logAction(sessionId, adminUserId, request.targetUserId, {
        action_type: 'page_visit',
        action_description: `Impersonation started with reason: ${request.reason}`,
        component_name: 'ImpersonationService',
        risk_level: 'medium'
      });

      return {
        success: true,
        sessionId,
        targetUser: {
          id: targetUser.user.id,
          email: targetUser.user.email,
          role: targetUser.user.user_metadata?.role,
          metadata: targetUser.user.user_metadata
        },
        maxDuration: permissions.max_session_duration_minutes,
        restrictions: validation.warnings
      };
    } catch (error) {
      console.error('Error starting impersonation:', error);
      return {
        success: false,
        error: 'Failed to start impersonation session'
      };
    }
  }

  /**
   * End impersonation session
   */
  async endImpersonation(request: ImpersonationEndRequest): Promise<ImpersonationEndResponse> {
    try {
      // Get session details for response
      const sessions = await this.auditService.getAuditLog(request.sessionId);
      const session = sessions[0];

      if (!session) {
        return {
          success: false,
          error: 'Session not found'
        };
      }

      // Get session actions count
      const actions = await this.auditService.getSessionActions(request.sessionId);

      // End the session
      await this.auditService.endImpersonationSession(
        request.sessionId,
        request.reason === 'manual' ? 'ended_manually' : 
        request.reason === 'timeout' ? 'ended_timeout' :
        request.reason === 'inactivity' ? 'ended_inactivity' :
        request.reason === 'security' ? 'ended_security' : 'ended_error',
        request.additionalNotes
      );

      // Calculate session duration
      const startTime = new Date(session.started_at);
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      return {
        success: true,
        sessionDuration: duration,
        actionsPerformed: actions.length
      };
    } catch (error) {
      console.error('Error ending impersonation:', error);
      return {
        success: false,
        error: 'Failed to end impersonation session'
      };
    }
  }

  /**
   * Log action during impersonation
   */
  async logImpersonationAction(
    sessionId: string,
    adminUserId: string,
    targetUserId: string,
    actionType: ImpersonationActionType,
    description: string,
    additionalData?: {
      componentName?: string;
      affectedDataType?: string;
      affectedRecordId?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      await this.auditService.logAction(sessionId, adminUserId, targetUserId, {
        action_type: actionType,
        action_description: description,
        component_name: additionalData?.componentName,
        affected_data_type: additionalData?.affectedDataType,
        affected_record_id: additionalData?.affectedRecordId,
        old_values: additionalData?.oldValues,
        new_values: additionalData?.newValues,
        risk_level: this.assessActionRisk(actionType)
      });
    } catch (error) {
      console.error('Error logging impersonation action:', error);
    }
  }

  /**
   * Helper methods
   */
  private determineAccountStatus(user: any): 'active' | 'inactive' | 'suspended' {
    if (user.banned_until) return 'suspended';
    if (!user.last_sign_in_at) return 'inactive';
    
    const lastLogin = new Date(user.last_sign_in_at);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return lastLogin > thirtyDaysAgo ? 'active' : 'inactive';
  }

  private canImpersonateUser(user: any, permissions: ImpersonationPermissions): boolean {
    const userRole = user.raw_user_meta_data?.role;
    if (!userRole || userRole === 'super-admin') return false;
    
    return permissions.can_impersonate_roles.includes(userRole);
  }

  private getImpersonationRestrictions(user: any, permissions: ImpersonationPermissions): string[] {
    const restrictions: string[] = [];
    
    if (permissions.restricted_actions.length > 0) {
      restrictions.push(`Restricted actions: ${permissions.restricted_actions.join(', ')}`);
    }
    
    if (permissions.can_impersonate_buildings && permissions.can_impersonate_buildings.length > 0) {
      restrictions.push('Limited to specific buildings');
    }
    
    return restrictions;
  }

  private assessActionRisk(actionType: ImpersonationActionType): 'low' | 'medium' | 'high' | 'critical' {
    const riskMap: Record<ImpersonationActionType, 'low' | 'medium' | 'high' | 'critical'> = {
      'page_visit': 'low',
      'data_view': 'low',
      'data_modification': 'medium',
      'document_upload': 'medium',
      'document_download': 'low',
      'document_delete': 'high',
      'financial_transaction': 'critical',
      'user_data_change': 'high',
      'voting_action': 'high',
      'meeting_action': 'medium',
      'compliance_action': 'medium',
      'settings_change': 'medium',
      'password_reset': 'critical',
      'email_change': 'critical',
      'role_change': 'critical'
    };

    return riskMap[actionType] || 'medium';
  }
}

export default ImpersonationService;

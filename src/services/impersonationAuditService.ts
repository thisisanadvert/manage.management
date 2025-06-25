/**
 * Impersonation Audit Service
 * Handles comprehensive audit logging for user impersonation activities
 */

import { supabase } from '../lib/supabase';
import {
  ImpersonationLog,
  ImpersonationAction,
  ImpersonationPermissions,
  ImpersonationReason,
  ImpersonationStatus,
  ImpersonationActionType,
  RiskLevel,
  ImpersonationAuditSummary,
  ImpersonationSecurityAlert,
  ActiveImpersonationSession
} from '../types/impersonation';

class ImpersonationAuditService {
  private static instance: ImpersonationAuditService;

  private constructor() {}

  public static getInstance(): ImpersonationAuditService {
    if (!ImpersonationAuditService.instance) {
      ImpersonationAuditService.instance = new ImpersonationAuditService();
    }
    return ImpersonationAuditService.instance;
  }

  /**
   * Start an impersonation session with comprehensive logging
   */
  async startImpersonationSession(
    adminUserId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    targetRole: string,
    reason: ImpersonationReason,
    additionalNotes?: string,
    targetBuildingId?: string
  ): Promise<{ sessionId: string; log: ImpersonationLog }> {
    try {
      // Get client IP and user agent
      const ipAddress = await this.getClientIP();
      const userAgent = navigator.userAgent;

      // Generate session ID
      const sessionId = crypto.randomUUID();

      // Create impersonation log
      const logData = {
        admin_user_id: adminUserId,
        admin_email: adminEmail,
        admin_ip_address: ipAddress,
        admin_user_agent: userAgent,
        target_user_id: targetUserId,
        target_email: targetEmail,
        target_role: targetRole,
        target_building_id: targetBuildingId,
        session_id: sessionId,
        reason,
        additional_notes: additionalNotes,
        status: 'active' as ImpersonationStatus
      };

      const { data, error } = await supabase
        .from('user_impersonation_logs')
        .insert(logData)
        .select()
        .single();

      if (error) {
        console.error('Failed to create impersonation log:', error);
        throw new Error('Failed to start impersonation session');
      }

      // Log the session start action
      await this.logAction(sessionId, adminUserId, targetUserId, {
        action_type: 'page_visit',
        action_description: `Started impersonation session for reason: ${reason}`,
        page_url: window.location.href,
        component_name: 'ImpersonationService',
        risk_level: 'medium'
      });

      return { sessionId, log: data };
    } catch (error) {
      console.error('Error starting impersonation session:', error);
      throw error;
    }
  }

  /**
   * End an impersonation session
   */
  async endImpersonationSession(
    sessionId: string,
    status: ImpersonationStatus = 'ended_manually',
    additionalNotes?: string
  ): Promise<ImpersonationLog> {
    try {
      const { data, error } = await supabase
        .from('user_impersonation_logs')
        .update({
          ended_at: new Date().toISOString(),
          status,
          additional_notes: additionalNotes
        })
        .eq('session_id', sessionId)
        .eq('status', 'active')
        .select()
        .single();

      if (error) {
        console.error('Failed to end impersonation session:', error);
        throw new Error('Failed to end impersonation session');
      }

      // Log the session end action
      if (data) {
        await this.logAction(sessionId, data.admin_user_id, data.target_user_id, {
          action_type: 'page_visit',
          action_description: `Ended impersonation session with status: ${status}`,
          page_url: window.location.href,
          component_name: 'ImpersonationService',
          risk_level: 'low'
        });
      }

      return data;
    } catch (error) {
      console.error('Error ending impersonation session:', error);
      throw error;
    }
  }

  /**
   * Log an action performed during impersonation
   */
  async logAction(
    sessionId: string,
    adminUserId: string,
    targetUserId: string,
    actionData: {
      action_type: ImpersonationActionType;
      action_description: string;
      page_url?: string;
      component_name?: string;
      affected_data_type?: string;
      affected_record_id?: string;
      old_values?: Record<string, any>;
      new_values?: Record<string, any>;
      risk_level?: RiskLevel;
      requires_approval?: boolean;
    }
  ): Promise<ImpersonationAction> {
    try {
      const ipAddress = await this.getClientIP();
      const userAgent = navigator.userAgent;

      const actionLogData = {
        session_id: sessionId,
        admin_user_id: adminUserId,
        target_user_id: targetUserId,
        action_type: actionData.action_type,
        action_description: actionData.action_description,
        page_url: actionData.page_url || window.location.href,
        component_name: actionData.component_name,
        affected_data_type: actionData.affected_data_type,
        affected_record_id: actionData.affected_record_id,
        old_values: actionData.old_values,
        new_values: actionData.new_values,
        ip_address: ipAddress,
        user_agent: userAgent,
        risk_level: actionData.risk_level || 'low',
        requires_approval: actionData.requires_approval || false
      };

      const { data, error } = await supabase
        .from('user_impersonation_actions')
        .insert(actionLogData)
        .select()
        .single();

      if (error) {
        console.error('Failed to log impersonation action:', error);
        throw new Error('Failed to log action');
      }

      // Check for security alerts based on action
      await this.checkForSecurityAlerts(sessionId, adminUserId, actionData);

      return data;
    } catch (error) {
      console.error('Error logging impersonation action:', error);
      throw error;
    }
  }

  /**
   * Get impersonation permissions for a user
   */
  async getUserPermissions(adminUserId: string): Promise<ImpersonationPermissions | null> {
    try {
      const { data, error } = await supabase
        .from('user_impersonation_permissions')
        .select('*')
        .eq('admin_user_id', adminUserId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to get user permissions:', error);
        throw new Error('Failed to get permissions');
      }

      return data;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return null;
    }
  }

  /**
   * Get active impersonation sessions
   */
  async getActiveSessions(adminUserId?: string): Promise<ActiveImpersonationSession[]> {
    try {
      let query = supabase
        .from('active_impersonation_sessions')
        .select('*');

      if (adminUserId) {
        query = query.eq('admin_user_id', adminUserId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to get active sessions:', error);
        throw new Error('Failed to get active sessions');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  /**
   * Get audit log for a session or user
   */
  async getAuditLog(
    sessionId?: string,
    adminUserId?: string,
    targetUserId?: string,
    limit: number = 100
  ): Promise<ImpersonationLog[]> {
    try {
      let query = supabase
        .from('user_impersonation_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }
      if (adminUserId) {
        query = query.eq('admin_user_id', adminUserId);
      }
      if (targetUserId) {
        query = query.eq('target_user_id', targetUserId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to get audit log:', error);
        throw new Error('Failed to get audit log');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting audit log:', error);
      return [];
    }
  }

  /**
   * Get detailed actions for a session
   */
  async getSessionActions(sessionId: string): Promise<ImpersonationAction[]> {
    try {
      const { data, error } = await supabase
        .from('user_impersonation_actions')
        .select('*')
        .eq('session_id', sessionId)
        .order('performed_at', { ascending: true });

      if (error) {
        console.error('Failed to get session actions:', error);
        throw new Error('Failed to get session actions');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting session actions:', error);
      return [];
    }
  }

  /**
   * Get audit summary for reporting
   */
  async getAuditSummary(
    dateFrom?: string,
    dateTo?: string,
    adminUserId?: string
  ): Promise<ImpersonationAuditSummary> {
    try {
      // Build date filter
      let dateFilter = '';
      if (dateFrom && dateTo) {
        dateFilter = `and(started_at.gte.${dateFrom},started_at.lte.${dateTo})`;
      } else if (dateFrom) {
        dateFilter = `started_at.gte.${dateFrom}`;
      } else if (dateTo) {
        dateFilter = `started_at.lte.${dateTo}`;
      }

      // Get session summary
      let sessionQuery = supabase
        .from('user_impersonation_logs')
        .select('*');

      if (dateFilter) {
        sessionQuery = sessionQuery.or(dateFilter);
      }
      if (adminUserId) {
        sessionQuery = sessionQuery.eq('admin_user_id', adminUserId);
      }

      const { data: sessions, error: sessionError } = await sessionQuery;

      if (sessionError) {
        throw sessionError;
      }

      // Get action summary
      let actionQuery = supabase
        .from('user_impersonation_actions')
        .select('action_type, risk_level');

      if (dateFilter) {
        actionQuery = actionQuery.or(dateFilter.replace('started_at', 'performed_at'));
      }
      if (adminUserId) {
        actionQuery = actionQuery.eq('admin_user_id', adminUserId);
      }

      const { data: actions, error: actionError } = await actionQuery;

      if (actionError) {
        throw actionError;
      }

      // Calculate summary statistics
      const totalSessions = sessions?.length || 0;
      const activeSessions = sessions?.filter(s => s.status === 'active').length || 0;
      const totalDuration = sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;
      const averageSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

      // Count actions by type
      const actionsCounts = actions?.reduce((counts, action) => {
        counts[action.action_type] = (counts[action.action_type] || 0) + 1;
        return counts;
      }, {} as Record<ImpersonationActionType, number>) || {};

      // Count by risk level
      const riskLevelCounts = actions?.reduce((counts, action) => {
        counts[action.risk_level] = (counts[action.risk_level] || 0) + 1;
        return counts;
      }, {} as Record<RiskLevel, number>) || {};

      // Most impersonated users
      const userCounts = sessions?.reduce((counts, session) => {
        const key = `${session.target_user_id}:${session.target_email}`;
        counts[key] = (counts[key] || 0) + 1;
        return counts;
      }, {} as Record<string, number>) || {};

      const mostImpersonatedUsers = Object.entries(userCounts)
        .map(([key, count]) => {
          const [user_id, email] = key.split(':');
          return { user_id, email, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Recent sessions
      const recentSessions = sessions?.slice(0, 10) || [];

      return {
        totalSessions,
        activeSessions,
        totalDuration,
        averageSessionDuration,
        actionsCounts,
        riskLevelCounts,
        mostImpersonatedUsers,
        recentSessions
      };
    } catch (error) {
      console.error('Error getting audit summary:', error);
      throw error;
    }
  }

  /**
   * Check for security alerts based on actions
   */
  private async checkForSecurityAlerts(
    sessionId: string,
    adminUserId: string,
    actionData: { action_type: ImpersonationActionType; risk_level?: RiskLevel }
  ): Promise<void> {
    try {
      // Check for high-risk actions
      if (actionData.risk_level === 'high' || actionData.risk_level === 'critical') {
        await this.createSecurityAlert({
          type: 'suspicious_activity',
          severity: actionData.risk_level === 'critical' ? 'critical' : 'high',
          message: `High-risk action performed during impersonation: ${actionData.action_type}`,
          session_id: sessionId,
          admin_user_id: adminUserId
        });
      }

      // Check for unauthorized actions
      const permissions = await this.getUserPermissions(adminUserId);
      if (permissions && permissions.restricted_actions.includes(actionData.action_type)) {
        await this.createSecurityAlert({
          type: 'unauthorized_action',
          severity: 'high',
          message: `Unauthorized action attempted: ${actionData.action_type}`,
          session_id: sessionId,
          admin_user_id: adminUserId
        });
      }
    } catch (error) {
      console.error('Error checking security alerts:', error);
    }
  }

  /**
   * Create a security alert
   */
  private async createSecurityAlert(alertData: Omit<ImpersonationSecurityAlert, 'id' | 'detected_at' | 'resolved'>): Promise<void> {
    try {
      await supabase
        .from('impersonation_security_alerts')
        .insert({
          ...alertData,
          detected_at: new Date().toISOString(),
          resolved: false
        });
    } catch (error) {
      console.error('Error creating security alert:', error);
    }
  }

  /**
   * Get client IP address (best effort)
   */
  private async getClientIP(): Promise<string | null> {
    try {
      // In production, this would typically be handled by the server
      // For now, we'll return null and let the server handle IP detection
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate session is still active and within limits
   */
  async validateSession(sessionId: string): Promise<{ valid: boolean; timeRemaining: number; warnings: string[] }> {
    try {
      const { data: session, error } = await supabase
        .from('active_impersonation_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error || !session) {
        return { valid: false, timeRemaining: 0, warnings: ['Session not found or expired'] };
      }

      const warnings: string[] = [];
      
      if (session.is_expired) {
        warnings.push('Session has exceeded maximum duration');
        return { valid: false, timeRemaining: 0, warnings };
      }

      const timeRemaining = session.max_session_duration_minutes - session.duration_minutes;
      
      if (timeRemaining <= 5) {
        warnings.push('Session will expire in less than 5 minutes');
      } else if (timeRemaining <= 15) {
        warnings.push('Session will expire in less than 15 minutes');
      }

      return { valid: true, timeRemaining, warnings };
    } catch (error) {
      console.error('Error validating session:', error);
      return { valid: false, timeRemaining: 0, warnings: ['Error validating session'] };
    }
  }

  /**
   * Force end all active sessions for a user (emergency)
   */
  async forceEndAllSessions(adminUserId: string, reason: string = 'Security measure'): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_impersonation_logs')
        .update({
          ended_at: new Date().toISOString(),
          status: 'ended_security',
          additional_notes: reason
        })
        .eq('admin_user_id', adminUserId)
        .eq('status', 'active')
        .select();

      if (error) {
        throw error;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error force ending sessions:', error);
      throw error;
    }
  }
}

export default ImpersonationAuditService;

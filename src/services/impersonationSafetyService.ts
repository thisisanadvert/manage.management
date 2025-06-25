/**
 * Impersonation Safety Service
 * Handles session limits, automatic timeouts, and edge case safety measures
 */

import { supabase } from '../lib/supabase';
import ImpersonationAuditService from './impersonationAuditService';
import { ImpersonationSecurityAlert } from '../types/impersonation';

interface SessionLimits {
  maxDurationMinutes: number;
  maxDailySessions: number;
  maxConcurrentSessions: number;
  warningAtMinutes: number;
  inactivityTimeoutMinutes: number;
}

interface SafetyCheck {
  passed: boolean;
  warnings: string[];
  errors: string[];
  blockers: string[];
}

class ImpersonationSafetyService {
  private static instance: ImpersonationSafetyService;
  private auditService: ImpersonationAuditService;
  private activityTimers: Map<string, NodeJS.Timeout> = new Map();
  private warningTimers: Map<string, NodeJS.Timeout> = new Map();
  private sessionTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.auditService = ImpersonationAuditService.getInstance();
    this.initializeActivityMonitoring();
  }

  public static getInstance(): ImpersonationSafetyService {
    if (!ImpersonationSafetyService.instance) {
      ImpersonationSafetyService.instance = new ImpersonationSafetyService();
    }
    return ImpersonationSafetyService.instance;
  }

  /**
   * Initialize activity monitoring for all active sessions
   */
  private initializeActivityMonitoring(): void {
    // Monitor mouse movement, keyboard activity, and page visibility
    document.addEventListener('mousemove', this.recordActivity.bind(this));
    document.addEventListener('keydown', this.recordActivity.bind(this));
    document.addEventListener('click', this.recordActivity.bind(this));
    document.addEventListener('scroll', this.recordActivity.bind(this));
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Record user activity to reset inactivity timer
   */
  private recordActivity(): void {
    const sessionId = sessionStorage.getItem('impersonation_session_id');
    if (!sessionId) return;

    // Reset inactivity timer
    this.resetInactivityTimer(sessionId);
    
    // Update last activity timestamp
    sessionStorage.setItem('last_activity', new Date().toISOString());
  }

  /**
   * Handle page visibility changes (tab switching, minimizing)
   */
  private handleVisibilityChange(): void {
    const sessionId = sessionStorage.getItem('impersonation_session_id');
    if (!sessionId) return;

    if (document.hidden) {
      // Page is hidden, start stricter inactivity monitoring
      this.startStrictInactivityMonitoring(sessionId);
    } else {
      // Page is visible again, resume normal monitoring
      this.recordActivity();
    }
  }

  /**
   * Start session safety monitoring
   */
  async startSessionMonitoring(
    sessionId: string,
    adminUserId: string,
    limits: SessionLimits
  ): Promise<void> {
    try {
      // Store session info for monitoring
      sessionStorage.setItem('impersonation_session_id', sessionId);
      sessionStorage.setItem('impersonation_admin_id', adminUserId);
      sessionStorage.setItem('session_limits', JSON.stringify(limits));
      sessionStorage.setItem('session_start_time', new Date().toISOString());

      // Set up warning timer
      const warningTime = (limits.maxDurationMinutes - limits.warningAtMinutes) * 60 * 1000;
      const warningTimer = setTimeout(() => {
        this.showSessionWarning(sessionId, limits.warningAtMinutes);
      }, warningTime);
      this.warningTimers.set(sessionId, warningTimer);

      // Set up session timeout timer
      const sessionTimeout = limits.maxDurationMinutes * 60 * 1000;
      const sessionTimer = setTimeout(() => {
        this.forceEndSession(sessionId, 'timeout');
      }, sessionTimeout);
      this.sessionTimers.set(sessionId, sessionTimer);

      // Set up inactivity monitoring
      this.resetInactivityTimer(sessionId);

      // Log session monitoring start
      await this.auditService.logAction(sessionId, adminUserId, '', {
        action_type: 'page_visit',
        action_description: 'Session safety monitoring started',
        component_name: 'ImpersonationSafetyService',
        risk_level: 'low'
      });
    } catch (error) {
      console.error('Error starting session monitoring:', error);
    }
  }

  /**
   * Stop session safety monitoring
   */
  stopSessionMonitoring(sessionId: string): void {
    // Clear all timers
    const warningTimer = this.warningTimers.get(sessionId);
    if (warningTimer) {
      clearTimeout(warningTimer);
      this.warningTimers.delete(sessionId);
    }

    const sessionTimer = this.sessionTimers.get(sessionId);
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      this.sessionTimers.delete(sessionId);
    }

    const activityTimer = this.activityTimers.get(sessionId);
    if (activityTimer) {
      clearTimeout(activityTimer);
      this.activityTimers.delete(sessionId);
    }

    // Clear session storage
    sessionStorage.removeItem('impersonation_session_id');
    sessionStorage.removeItem('impersonation_admin_id');
    sessionStorage.removeItem('session_limits');
    sessionStorage.removeItem('session_start_time');
    sessionStorage.removeItem('last_activity');
  }

  /**
   * Reset inactivity timer
   */
  private resetInactivityTimer(sessionId: string): void {
    const existingTimer = this.activityTimers.get(sessionId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const limitsStr = sessionStorage.getItem('session_limits');
    if (!limitsStr) return;

    const limits: SessionLimits = JSON.parse(limitsStr);
    const inactivityTimeout = limits.inactivityTimeoutMinutes * 60 * 1000;

    const timer = setTimeout(() => {
      this.handleInactivityTimeout(sessionId);
    }, inactivityTimeout);

    this.activityTimers.set(sessionId, timer);
  }

  /**
   * Start strict inactivity monitoring when page is hidden
   */
  private startStrictInactivityMonitoring(sessionId: string): void {
    const existingTimer = this.activityTimers.get(sessionId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Shorter timeout when page is hidden (5 minutes)
    const timer = setTimeout(() => {
      this.handleInactivityTimeout(sessionId);
    }, 5 * 60 * 1000);

    this.activityTimers.set(sessionId, timer);
  }

  /**
   * Handle inactivity timeout
   */
  private async handleInactivityTimeout(sessionId: string): Promise<void> {
    try {
      const adminUserId = sessionStorage.getItem('impersonation_admin_id');
      if (!adminUserId) return;

      // Log inactivity timeout
      await this.auditService.logAction(sessionId, adminUserId, '', {
        action_type: 'page_visit',
        action_description: 'Session ended due to inactivity',
        component_name: 'ImpersonationSafetyService',
        risk_level: 'medium'
      });

      // Force end session
      await this.forceEndSession(sessionId, 'inactivity');
    } catch (error) {
      console.error('Error handling inactivity timeout:', error);
    }
  }

  /**
   * Show session warning
   */
  private showSessionWarning(sessionId: string, minutesRemaining: number): void {
    const message = `⚠️ Impersonation Session Warning\n\nYour impersonation session will expire in ${minutesRemaining} minutes.\n\nWould you like to extend the session?`;
    
    if (confirm(message)) {
      this.requestSessionExtension(sessionId);
    }
  }

  /**
   * Request session extension
   */
  private async requestSessionExtension(sessionId: string): Promise<void> {
    try {
      const adminUserId = sessionStorage.getItem('impersonation_admin_id');
      if (!adminUserId) return;

      // Check if extension is allowed
      const permissions = await this.auditService.getUserPermissions(adminUserId);
      if (!permissions) return;

      // Log extension request
      await this.auditService.logAction(sessionId, adminUserId, '', {
        action_type: 'settings_change',
        action_description: 'Session extension requested',
        component_name: 'ImpersonationSafetyService',
        risk_level: 'medium'
      });

      // Extend session by 30 minutes (or max allowed)
      const extensionMinutes = Math.min(30, permissions.max_session_duration_minutes - 120);
      if (extensionMinutes > 0) {
        this.extendSession(sessionId, extensionMinutes);
        alert(`Session extended by ${extensionMinutes} minutes.`);
      } else {
        alert('Maximum session duration reached. Cannot extend further.');
      }
    } catch (error) {
      console.error('Error requesting session extension:', error);
    }
  }

  /**
   * Extend session duration
   */
  private extendSession(sessionId: string, additionalMinutes: number): void {
    const limitsStr = sessionStorage.getItem('session_limits');
    if (!limitsStr) return;

    const limits: SessionLimits = JSON.parse(limitsStr);
    limits.maxDurationMinutes += additionalMinutes;
    
    sessionStorage.setItem('session_limits', JSON.stringify(limits));

    // Update session timer
    const sessionTimer = this.sessionTimers.get(sessionId);
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }

    const newSessionTimeout = additionalMinutes * 60 * 1000;
    const newSessionTimer = setTimeout(() => {
      this.forceEndSession(sessionId, 'timeout');
    }, newSessionTimeout);
    this.sessionTimers.set(sessionId, newSessionTimer);
  }

  /**
   * Force end session
   */
  private async forceEndSession(sessionId: string, reason: 'timeout' | 'inactivity' | 'security'): Promise<void> {
    try {
      const adminUserId = sessionStorage.getItem('impersonation_admin_id');
      if (!adminUserId) return;

      // Log forced session end
      await this.auditService.logAction(sessionId, adminUserId, '', {
        action_type: 'page_visit',
        action_description: `Session forcibly ended: ${reason}`,
        component_name: 'ImpersonationSafetyService',
        risk_level: 'high'
      });

      // End the session in audit log
      await this.auditService.endImpersonationSession(
        sessionId,
        reason === 'timeout' ? 'ended_timeout' : 
        reason === 'inactivity' ? 'ended_inactivity' : 'ended_security',
        `Session automatically ended due to ${reason}`
      );

      // Stop monitoring
      this.stopSessionMonitoring(sessionId);

      // Notify user and redirect
      alert(`Impersonation session has been automatically ended due to ${reason}.`);
      window.location.href = '/rtm'; // Redirect to admin dashboard
    } catch (error) {
      console.error('Error force ending session:', error);
    }
  }

  /**
   * Perform comprehensive safety checks before allowing impersonation
   */
  async performSafetyChecks(
    adminUserId: string,
    targetUserId: string
  ): Promise<SafetyCheck> {
    const warnings: string[] = [];
    const errors: string[] = [];
    const blockers: string[] = [];

    try {
      // Check 1: Verify admin permissions
      const permissions = await this.auditService.getUserPermissions(adminUserId);
      if (!permissions || !permissions.is_active) {
        blockers.push('No active impersonation permissions found');
        return { passed: false, warnings, errors, blockers };
      }

      // Check 2: Verify admin is not already impersonating
      const activeSessions = await this.auditService.getActiveSessions(adminUserId);
      if (activeSessions.length >= permissions.max_concurrent_sessions) {
        blockers.push(`Maximum concurrent sessions reached (${permissions.max_concurrent_sessions})`);
      }

      // Check 3: Check daily session limits
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = await this.auditService.getAuditLog(undefined, adminUserId);
      const todaySessionCount = todaySessions.filter(session => 
        session.started_at.startsWith(today)
      ).length;

      if (todaySessionCount >= permissions.max_daily_sessions) {
        blockers.push(`Daily session limit reached (${permissions.max_daily_sessions})`);
      } else if (todaySessionCount >= permissions.max_daily_sessions - 2) {
        warnings.push('Approaching daily session limit');
      }

      // Check 4: Verify target user exists and is not super-admin
      const { data: targetUser, error: userError } = await supabase.auth.admin.getUserById(targetUserId);
      if (userError || !targetUser) {
        blockers.push('Target user not found');
        return { passed: false, warnings, errors, blockers };
      }

      if (targetUser.user.user_metadata?.role === 'super-admin') {
        blockers.push('Cannot impersonate super-admin users');
      }

      // Check 5: Verify target user role is allowed
      const targetRole = targetUser.user.user_metadata?.role;
      if (!targetRole || !permissions.can_impersonate_roles.includes(targetRole)) {
        blockers.push(`Not authorized to impersonate users with role: ${targetRole}`);
      }

      // Check 6: Check for recent security incidents
      const recentSessions = await this.auditService.getAuditLog(undefined, adminUserId, undefined, 10);
      const recentFailures = recentSessions.filter(session => 
        session.status === 'ended_security' || session.status === 'ended_error'
      );

      if (recentFailures.length >= 3) {
        warnings.push('Recent security incidents detected. Proceed with caution.');
      }

      // Check 7: Verify system health
      const systemHealth = await this.checkSystemHealth();
      if (!systemHealth.healthy) {
        warnings.push('System health issues detected. Impersonation may be unstable.');
      }

      // Check 8: Verify no conflicting sessions
      const conflictingSessions = activeSessions.filter(session => 
        session.target_user_id === targetUserId
      );
      if (conflictingSessions.length > 0) {
        errors.push('Another admin is already impersonating this user');
      }

      return {
        passed: blockers.length === 0,
        warnings,
        errors,
        blockers
      };
    } catch (error) {
      console.error('Error performing safety checks:', error);
      blockers.push('Failed to perform safety checks');
      return { passed: false, warnings, errors, blockers };
    }
  }

  /**
   * Check system health for impersonation readiness
   */
  private async checkSystemHealth(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check database connectivity
      const { error: dbError } = await supabase.from('user_impersonation_logs').select('id').limit(1);
      if (dbError) {
        issues.push('Database connectivity issues');
      }

      // Check audit service availability
      try {
        await this.auditService.getActiveSessions();
      } catch (error) {
        issues.push('Audit service unavailable');
      }

      // Check session storage availability
      try {
        sessionStorage.setItem('health_check', 'test');
        sessionStorage.removeItem('health_check');
      } catch (error) {
        issues.push('Session storage unavailable');
      }

      return {
        healthy: issues.length === 0,
        issues
      };
    } catch (error) {
      issues.push('System health check failed');
      return { healthy: false, issues };
    }
  }

  /**
   * Create security alert
   */
  async createSecurityAlert(
    type: ImpersonationSecurityAlert['type'],
    severity: ImpersonationSecurityAlert['severity'],
    message: string,
    sessionId?: string,
    adminUserId?: string,
    targetUserId?: string
  ): Promise<void> {
    try {
      // In a real implementation, this would create an alert in the database
      console.warn('IMPERSONATION SECURITY ALERT:', {
        type,
        severity,
        message,
        sessionId,
        adminUserId,
        targetUserId,
        timestamp: new Date().toISOString()
      });

      // For critical alerts, immediately notify administrators
      if (severity === 'critical') {
        // In production, this would send notifications to other admins
        console.error('CRITICAL IMPERSONATION SECURITY ALERT:', message);
      }
    } catch (error) {
      console.error('Error creating security alert:', error);
    }
  }

  /**
   * Emergency shutdown of all impersonation sessions
   */
  async emergencyShutdown(reason: string): Promise<number> {
    try {
      console.warn('EMERGENCY IMPERSONATION SHUTDOWN:', reason);

      // Force end all active sessions
      const sessionsEnded = await this.auditService.forceEndAllSessions('system', reason);

      // Clear all local monitoring
      this.activityTimers.clear();
      this.warningTimers.clear();
      this.sessionTimers.clear();

      // Clear session storage
      sessionStorage.removeItem('impersonation_session_id');
      sessionStorage.removeItem('impersonation_admin_id');
      sessionStorage.removeItem('session_limits');
      sessionStorage.removeItem('session_start_time');
      sessionStorage.removeItem('last_activity');

      // Create critical security alert
      await this.createSecurityAlert(
        'session_timeout',
        'critical',
        `Emergency shutdown: ${reason}`,
        undefined,
        'system'
      );

      return sessionsEnded;
    } catch (error) {
      console.error('Error during emergency shutdown:', error);
      return 0;
    }
  }
}

export default ImpersonationSafetyService;

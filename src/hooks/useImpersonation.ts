/**
 * useImpersonation Hook
 * Comprehensive hook for managing user impersonation with full security and audit compliance
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserSearchFilters,
  UserSearchResult,
  ImpersonationStartRequest,
  ImpersonationStartResponse,
  ImpersonationEndRequest,
  ImpersonationEndResponse,
  ImpersonationPermissions,
  ImpersonationActionType,
  UseImpersonationReturn
} from '../types/impersonation';
import ImpersonationService from '../services/impersonationService';
import ImpersonationAuditService from '../services/impersonationAuditService';
import ImpersonationSafetyService from '../services/impersonationSafetyService';
import { validateImpersonationSecurity } from '../utils/impersonationSecurityTests';

export const useImpersonation = (): UseImpersonationReturn => {
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);

  const impersonationService = ImpersonationService.getInstance();
  const auditService = ImpersonationAuditService.getInstance();
  const safetyService = ImpersonationSafetyService.getInstance();

  // Update last activity
  const updateLastActivity = useCallback(() => {
    setLastActivity(new Date());
  }, []);

  // Activity monitoring
  useEffect(() => {
    if (auth.isImpersonating) {
      const handleActivity = () => updateLastActivity();
      
      document.addEventListener('mousemove', handleActivity);
      document.addEventListener('keydown', handleActivity);
      document.addEventListener('click', handleActivity);
      
      return () => {
        document.removeEventListener('mousemove', handleActivity);
        document.removeEventListener('keydown', handleActivity);
        document.removeEventListener('click', handleActivity);
      };
    }
  }, [auth.isImpersonating, updateLastActivity]);

  // Search users for impersonation
  const searchUsers = useCallback(async (
    filters: UserSearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ users: UserSearchResult[]; total: number; }> => {
    if (!auth.user?.id) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    try {
      const result = await impersonationService.searchUsers(filters, page, limit, auth.user.id);
      return { users: result.users, total: result.total };
    } finally {
      setIsLoading(false);
    }
  }, [auth.user?.id, impersonationService]);

  // Start impersonation with comprehensive security checks
  const startImpersonation = useCallback(async (
    request: ImpersonationStartRequest
  ): Promise<ImpersonationStartResponse> => {
    if (!auth.user?.id || !auth.user?.email) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsStarting(true);
    try {
      // Run security validation first
      const securityCheck = await validateImpersonationSecurity(auth.user.id);
      if (!securityCheck.isSecure) {
        return {
          success: false,
          error: `Security validation failed: ${securityCheck.criticalIssues.join(', ')}`
        };
      }

      // Perform safety checks
      const safetyCheck = await safetyService.performSafetyChecks(
        auth.user.id,
        request.targetUserId
      );

      if (!safetyCheck.passed) {
        return {
          success: false,
          error: safetyCheck.blockers.join('; ')
        };
      }

      // Start impersonation through auth context
      const result = await auth.startImpersonation(
        request.targetUserId,
        request.reason,
        request.additionalNotes
      );

      if (result.success) {
        // Start safety monitoring
        const permissions = await auditService.getUserPermissions(auth.user.id);
        if (permissions && auth.impersonationState.sessionId) {
          await safetyService.startSessionMonitoring(
            auth.impersonationState.sessionId,
            auth.user.id,
            {
              maxDurationMinutes: permissions.max_session_duration_minutes,
              maxDailySessions: permissions.max_daily_sessions,
              maxConcurrentSessions: permissions.max_concurrent_sessions,
              warningAtMinutes: 25,
              inactivityTimeoutMinutes: 30
            }
          );
        }
      }

      return {
        success: result.success,
        error: result.error,
        restrictions: safetyCheck.warnings
      };
    } finally {
      setIsStarting(false);
    }
  }, [auth, auditService, safetyService]);

  // End impersonation
  const endImpersonation = useCallback(async (
    reason: string = 'manual'
  ): Promise<ImpersonationEndResponse> => {
    if (!auth.impersonationState.sessionId) {
      return { success: false, error: 'No active impersonation session' };
    }

    setIsEnding(true);
    try {
      // Stop safety monitoring
      safetyService.stopSessionMonitoring(auth.impersonationState.sessionId);

      // End impersonation through auth context
      const result = await auth.endImpersonation(reason);

      return {
        success: result.success,
        error: result.error
      };
    } finally {
      setIsEnding(false);
    }
  }, [auth, safetyService]);

  // Log action during impersonation
  const logAction = useCallback(async (
    action: Omit<any, 'id' | 'session_id' | 'admin_user_id' | 'target_user_id' | 'performed_at'>
  ): Promise<void> => {
    if (!auth.isImpersonating || !auth.impersonationState.sessionId || !auth.user?.id) {
      return;
    }

    const effectiveUser = auth.getEffectiveUser();
    if (!effectiveUser?.id) return;

    await impersonationService.logImpersonationAction(
      auth.impersonationState.sessionId,
      auth.user.id,
      effectiveUser.id,
      action.action_type,
      action.action_description,
      {
        componentName: action.component_name,
        affectedDataType: action.affected_data_type,
        affectedRecordId: action.affected_record_id,
        oldValues: action.old_values,
        newValues: action.new_values
      }
    );

    updateLastActivity();
  }, [auth, impersonationService, updateLastActivity]);

  // Get audit log
  const getAuditLog = useCallback(async (
    sessionId?: string
  ): Promise<any[]> => {
    if (!auth.user?.id) return [];

    return await auditService.getAuditLog(sessionId, auth.user.id);
  }, [auth.user?.id, auditService]);

  // Get audit summary
  const getAuditSummary = useCallback(async (
    dateFrom?: string,
    dateTo?: string
  ): Promise<any> => {
    if (!auth.user?.id) return null;

    return await auditService.getAuditSummary(dateFrom, dateTo, auth.user.id);
  }, [auth.user?.id, auditService]);

  // Extend session
  const extendSession = useCallback(async (
    additionalMinutes: number
  ): Promise<boolean> => {
    // This would be implemented to extend the current session
    // For now, return false as extension requires additional security checks
    return false;
  }, []);

  // Check session status
  const checkSessionStatus = useCallback(async (): Promise<{
    valid: boolean;
    timeRemaining: number;
  }> => {
    if (!auth.isImpersonating || !auth.impersonationState.sessionId) {
      return { valid: false, timeRemaining: 0 };
    }

    const validation = await auditService.validateSession(auth.impersonationState.sessionId);
    return {
      valid: validation.valid,
      timeRemaining: validation.timeRemaining
    };
  }, [auth, auditService]);

  // Get user permissions
  const getUserPermissions = useCallback(async (): Promise<ImpersonationPermissions | null> => {
    if (!auth.user?.id) return null;

    return await auditService.getUserPermissions(auth.user.id);
  }, [auth.user?.id, auditService]);

  // Check if user can perform specific action
  const canPerformAction = useCallback((
    actionType: ImpersonationActionType
  ): boolean => {
    if (!auth.isImpersonating) return true; // Normal user actions are allowed

    // During impersonation, check against restricted actions
    // This would be implemented based on user permissions
    const restrictedActions: ImpersonationActionType[] = [
      'password_reset',
      'email_change',
      'role_change'
    ];

    return !restrictedActions.includes(actionType);
  }, [auth.isImpersonating]);

  return {
    // State
    impersonationState: auth.impersonationState,
    isImpersonating: auth.isImpersonating,
    canImpersonate: auth.canImpersonate,

    // Actions
    startImpersonation,
    endImpersonation,
    logAction,

    // Data
    searchUsers,
    getAuditLog,
    getAuditSummary,

    // Session management
    extendSession,
    checkSessionStatus,

    // Permissions
    getUserPermissions,
    canPerformAction,

    // Loading states
    isLoading,
    isStarting,
    isEnding
  };
};

export default useImpersonation;

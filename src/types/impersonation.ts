/**
 * TypeScript types for secure user impersonation system
 */

export type ImpersonationReason = 
  | 'Customer Support'
  | 'Technical Issue'
  | 'Data Investigation'
  | 'Account Recovery'
  | 'Compliance Review'
  | 'Bug Investigation'
  | 'Training/Demo';

export type ImpersonationStatus = 
  | 'active'
  | 'ended_manually'
  | 'ended_timeout'
  | 'ended_inactivity'
  | 'ended_security'
  | 'ended_error';

export type ImpersonationActionType = 
  | 'page_visit'
  | 'data_view'
  | 'data_modification'
  | 'document_upload'
  | 'document_download'
  | 'document_delete'
  | 'financial_transaction'
  | 'user_data_change'
  | 'voting_action'
  | 'meeting_action'
  | 'compliance_action'
  | 'settings_change'
  | 'password_reset'
  | 'email_change'
  | 'role_change';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ImpersonationLog {
  id: string;
  
  // Admin user performing the impersonation
  admin_user_id: string;
  admin_email: string;
  admin_ip_address?: string;
  admin_user_agent?: string;
  
  // Target user being impersonated
  target_user_id: string;
  target_email: string;
  target_role: string;
  target_building_id?: string;
  
  // Session details
  session_id: string;
  reason: ImpersonationReason;
  additional_notes?: string;
  
  // Timing
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  
  // Status
  status: ImpersonationStatus;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface ImpersonationAction {
  id: string;
  
  // Session context
  session_id: string;
  admin_user_id: string;
  target_user_id: string;
  
  // Action details
  action_type: ImpersonationActionType;
  page_url?: string;
  component_name?: string;
  action_description: string;
  
  // Data context
  affected_data_type?: string;
  affected_record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  
  // Security context
  ip_address?: string;
  user_agent?: string;
  
  // Timing
  performed_at: string;
  
  // Risk assessment
  risk_level: RiskLevel;
  requires_approval: boolean;
  approved_by?: string;
  approved_at?: string;
}

export interface ImpersonationPermissions {
  id: string;
  
  // Admin user
  admin_user_id: string;
  
  // Permission scope
  can_impersonate_roles: string[];
  can_impersonate_buildings?: string[];
  
  // Session limits
  max_session_duration_minutes: number;
  max_daily_sessions: number;
  max_concurrent_sessions: number;
  
  // Action permissions
  allowed_actions: ImpersonationActionType[];
  restricted_actions: ImpersonationActionType[];
  
  // Metadata
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface ActiveImpersonationSession {
  session_id: string;
  admin_user_id: string;
  admin_email: string;
  target_user_id: string;
  target_email: string;
  target_role: string;
  reason: ImpersonationReason;
  started_at: string;
  duration_minutes: number;
  max_session_duration_minutes: number;
  is_expired: boolean;
}

export interface ImpersonationState {
  isImpersonating: boolean;
  originalUser: any | null;
  impersonatedUser: any | null;
  sessionId: string | null;
  reason: ImpersonationReason | null;
  startTime: Date | null;
  maxDuration: number; // minutes
  warningShown: boolean;
}

export interface ImpersonationSessionLimits {
  maxDurationMinutes: number;
  maxDailySessions: number;
  maxConcurrentSessions: number;
  warningAtMinutes: number;
  inactivityTimeoutMinutes: number;
}

export interface UserSearchFilters {
  email?: string;
  name?: string;
  role?: string;
  buildingName?: string;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;
  accountStatus?: 'active' | 'inactive' | 'suspended';
}

export interface UserSearchResult {
  id: string;
  email: string;
  name?: string;
  role: string;
  building_name?: string;
  building_id?: string;
  last_login?: string;
  created_at: string;
  account_status: 'active' | 'inactive' | 'suspended';
  can_impersonate: boolean;
  impersonation_restrictions?: string[];
}

export interface ImpersonationStartRequest {
  targetUserId: string;
  reason: ImpersonationReason;
  additionalNotes?: string;
  expectedDurationMinutes?: number;
}

export interface ImpersonationStartResponse {
  success: boolean;
  sessionId?: string;
  targetUser?: any;
  maxDuration?: number;
  error?: string;
  restrictions?: string[];
}

export interface ImpersonationEndRequest {
  sessionId: string;
  reason?: 'manual' | 'timeout' | 'inactivity' | 'security' | 'error';
  additionalNotes?: string;
}

export interface ImpersonationEndResponse {
  success: boolean;
  sessionDuration?: number;
  actionsPerformed?: number;
  error?: string;
}

export interface ImpersonationAuditSummary {
  totalSessions: number;
  activeSessions: number;
  totalDuration: number; // minutes
  averageSessionDuration: number; // minutes
  actionsCounts: Record<ImpersonationActionType, number>;
  riskLevelCounts: Record<RiskLevel, number>;
  mostImpersonatedUsers: Array<{
    user_id: string;
    email: string;
    count: number;
  }>;
  recentSessions: ImpersonationLog[];
}

export interface ImpersonationSecurityAlert {
  id: string;
  type: 'session_limit_exceeded' | 'suspicious_activity' | 'unauthorized_action' | 'session_timeout' | 'concurrent_sessions';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  session_id?: string;
  admin_user_id: string;
  target_user_id?: string;
  detected_at: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

// Extended User type for impersonation context
export interface ImpersonationUser {
  id: string;
  email: string;
  role: string;
  metadata: {
    buildingId?: string;
    buildingName?: string;
    firstName?: string;
    lastName?: string;
    [key: string]: any;
  };
  created_at: string;
  last_sign_in_at?: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
  user_metadata: {
    [key: string]: any;
  };
}

// Hook return type for useImpersonation
export interface UseImpersonationReturn {
  // State
  impersonationState: ImpersonationState;
  isImpersonating: boolean;
  canImpersonate: boolean;
  
  // Actions
  startImpersonation: (request: ImpersonationStartRequest) => Promise<ImpersonationStartResponse>;
  endImpersonation: (reason?: string) => Promise<ImpersonationEndResponse>;
  logAction: (action: Omit<ImpersonationAction, 'id' | 'session_id' | 'admin_user_id' | 'target_user_id' | 'performed_at'>) => Promise<void>;
  
  // Data
  searchUsers: (filters: UserSearchFilters, page?: number, limit?: number) => Promise<{ users: UserSearchResult[]; total: number; }>;
  getAuditLog: (sessionId?: string) => Promise<ImpersonationLog[]>;
  getAuditSummary: (dateFrom?: string, dateTo?: string) => Promise<ImpersonationAuditSummary>;
  
  // Session management
  extendSession: (additionalMinutes: number) => Promise<boolean>;
  checkSessionStatus: () => Promise<{ valid: boolean; timeRemaining: number; }>;
  
  // Permissions
  getUserPermissions: () => Promise<ImpersonationPermissions | null>;
  canPerformAction: (actionType: ImpersonationActionType) => boolean;
  
  // Loading states
  isLoading: boolean;
  isStarting: boolean;
  isEnding: boolean;
}

export interface ImpersonationContextType extends UseImpersonationReturn {
  // Additional context-specific properties
  sessionLimits: ImpersonationSessionLimits;
  securityAlerts: ImpersonationSecurityAlert[];
  lastActivity: Date | null;
  
  // Internal methods (not exposed to components)
  _updateLastActivity: () => void;
  _checkInactivity: () => void;
  _handleSessionTimeout: () => void;
}

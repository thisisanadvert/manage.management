import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { sonicBranding } from '../utils/audioUtils';
import { ImpersonationState, ImpersonationReason } from '../types/impersonation';
import ImpersonationAuditService from '../services/impersonationAuditService';

type UserRole =
  | 'rtm-director'
  | 'rmc-director'
  | 'leaseholder'
  | 'shareholder'
  | 'management-company'
  | 'super-admin';

type BuildingType = 'rtm' | 'share-of-freehold' | 'landlord-managed';

interface AuthUser extends User {
  role?: UserRole;
  metadata?: {
    firstName?: string;
    lastName?: string;
    buildingId?: string;
    buildingName?: string;
    buildingAddress?: string;
    unitNumber?: string;
    onboardingComplete?: boolean;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: { message: string } }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: { message: string } }>;
  signInWithMagicLink: (email: string) => Promise<{ error?: { message: string } }>;

  // Impersonation functionality
  impersonationState: ImpersonationState;
  isImpersonating: boolean;
  canImpersonate: boolean;
  startImpersonation: (targetUserId: string, reason: ImpersonationReason, additionalNotes?: string) => Promise<{ success: boolean; error?: string }>;
  endImpersonation: (reason?: string) => Promise<{ success: boolean; error?: string }>;
  getEffectiveUser: () => AuthUser | null;
  getOriginalUser: () => AuthUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Impersonation state
  const [impersonationState, setImpersonationState] = useState<ImpersonationState>({
    isImpersonating: false,
    originalUser: null,
    impersonatedUser: null,
    sessionId: null,
    reason: null,
    startTime: null,
    maxDuration: 120, // 2 hours default
    warningShown: false
  });

  const auditService = ImpersonationAuditService.getInstance();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const userWithRole = {
          ...session.user,
          role: session.user.user_metadata?.role,
          metadata: session.user.user_metadata
        };
        setUser(userWithRole);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change event:', event, 'Session:', !!session);
      setSession(session);
      if (session?.user) {
        // Create a user object with metadata from the session
        const userWithRole: AuthUser = {
          ...session.user,
          role: session.user.user_metadata?.role,
          metadata: session.user.user_metadata
        };
        console.log('Auth state change - User with role:', userWithRole.role, 'Metadata:', userWithRole.metadata);
        
        // If we don't have a buildingId in metadata, try to fetch it
        if (!userWithRole.metadata?.buildingId) {
          // Fetch the building ID from building_users table
          // Handle potential infinite recursion gracefully
          supabase
            .from('building_users')
            .select('building_id')
            .eq('user_id', session.user.id)
            .limit(1)
            .maybeSingle()
            .then(({ data, error }) => {
              if (error) {
                console.error('Error fetching building ID:', error);
                // If it's a recursion error, just continue without the building ID
                if (!error.message?.includes('infinite recursion')) {
                  console.error('Non-recursion error:', error);
                }
              } else if (data) {
                // Update user metadata with the building ID
                const buildingId = data.building_id;

                // Update local user state
                userWithRole.metadata = {
                  ...userWithRole.metadata,
                  buildingId
                };
                setUser(userWithRole);
                
                // Also update the user metadata in Supabase
                supabase.auth.updateUser({
                  data: { 
                    ...session.user.user_metadata,
                    buildingId 
                  }
                }).catch(err => {
                  console.error('Error updating user metadata:', err);
                });
              }
            });
        }
        
        setUser(userWithRole);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      console.log('Current URL before login:', window.location.href);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        // Play login error sound
        try {
          await sonicBranding.playLoginError();
        } catch (audioError) {
          console.warn('Failed to play login error sound:', audioError);
        }
        return { error };
      }

      if (data.session && data.user) {
        setSession(data.session);
        const userWithRole = {
          ...data.user,
          role: data.user.user_metadata?.role,
          metadata: data.user.user_metadata
        };
        setUser(userWithRole);

        // Play login success sound
        const isNewUser = data.user.user_metadata?.needsBuildingSetup || data.user.user_metadata?.needsPasswordSetup;
        try {
          if (isNewUser) {
            await sonicBranding.playWelcome();
          } else {
            await sonicBranding.playLoginSuccess();
          }
        } catch (error) {
          console.warn('Failed to play login sound:', error);
        }

        // Check if user needs to set up password
        if (data.user.user_metadata?.needsPasswordSetup) {
          navigate('/setup-password');
        } else if (data.user.user_metadata?.needsBuildingSetup) {
          // New users need to complete building setup
          navigate('/building-setup');
        } else {
          // Handle navigation based on user role with proper fallbacks
          const userRole = data.user.user_metadata?.role;
          console.log('User role after login:', userRole, 'Full metadata:', data.user.user_metadata);

          if (!userRole) {
            console.warn('No role found for user, redirecting to building setup');
            navigate('/building-setup');
            return {};
          }

          let basePath: string;
          switch (userRole) {
            case 'rtm-director':
              basePath = '/rtm';
              break;
            case 'rmc-director':
              basePath = '/rmc';
              break;
            case 'leaseholder':
              basePath = '/leaseholder';
              break;
            case 'shareholder':
              basePath = '/shareholder';
              break;
            case 'management-company':
              basePath = '/management';
              break;
            case 'super-admin':
              basePath = '/rtm'; // Default for super admin
              break;
            default:
              console.warn('Unknown role:', userRole, 'redirecting to building setup');
              navigate('/building-setup');
              return {};
          }

          console.log('About to navigate to:', basePath);
          console.log('Current location before navigate:', window.location.pathname);

          // Use a small delay to ensure auth state is fully updated
          setTimeout(() => {
            console.log('Executing navigation to:', basePath);
            navigate(basePath, { replace: true });
          }, 100);
        }
      }

      return {};
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }

      console.log('Supabase signOut successful, clearing state...');
      setUser(null);
      setSession(null);

      console.log('Navigating to login...');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('SignOut error:', error);
      // Even if there's an error, clear the local state and redirect
      setUser(null);
      setSession(null);
      navigate('/login', { replace: true });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Use the current origin for the redirect URL with proper hash handling
      const redirectUrl = `${window.location.origin}/reset-password`;
      console.log('Sending password reset with redirect URL:', redirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('Reset password error:', error);
        return { error };
      }

      console.log('Password reset email sent successfully');
      return {};
    } catch (error: any) {
      console.error('Reset password exception:', error);
      return { error };
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/login`;
      console.log('Sending magic link with redirect URL:', redirectUrl);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return { error };
      }

      return {};
    } catch (error: any) {
      return { error };
    }
  };

  // Impersonation functionality
  const canImpersonate = user?.role === 'super-admin' && !impersonationState.isImpersonating;

  const startImpersonation = async (
    targetUserId: string,
    reason: ImpersonationReason,
    additionalNotes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!canImpersonate) {
        return { success: false, error: 'Insufficient permissions to impersonate users' };
      }

      if (impersonationState.isImpersonating) {
        return { success: false, error: 'Already impersonating a user. End current session first.' };
      }

      // Get target user details
      const { data: targetUser, error: userError } = await supabase.auth.admin.getUserById(targetUserId);
      if (userError || !targetUser) {
        return { success: false, error: 'Target user not found' };
      }

      // Check if target user is also a super-admin (prevent impersonating other admins)
      if (targetUser.user.user_metadata?.role === 'super-admin') {
        return { success: false, error: 'Cannot impersonate other super-admin users' };
      }

      // Get user permissions
      const permissions = await auditService.getUserPermissions(user!.id);
      if (!permissions || !permissions.is_active) {
        return { success: false, error: 'No active impersonation permissions found' };
      }

      // Check if user can impersonate this role
      if (!permissions.can_impersonate_roles.includes(targetUser.user.user_metadata?.role || '')) {
        return { success: false, error: 'Not authorized to impersonate users with this role' };
      }

      // Check daily session limits
      const activeSessions = await auditService.getActiveSessions(user!.id);
      if (activeSessions.length >= permissions.max_concurrent_sessions) {
        return { success: false, error: 'Maximum concurrent sessions reached' };
      }

      // Start audit logging
      const { sessionId } = await auditService.startImpersonationSession(
        user!.id,
        user!.email!,
        targetUserId,
        targetUser.user.email!,
        targetUser.user.user_metadata?.role || 'unknown',
        reason,
        additionalNotes,
        targetUser.user.user_metadata?.buildingId
      );

      // Create impersonated user object
      const impersonatedUser: AuthUser = {
        ...targetUser.user,
        role: targetUser.user.user_metadata?.role,
        metadata: targetUser.user.user_metadata
      };

      // Update impersonation state
      setImpersonationState({
        isImpersonating: true,
        originalUser: user,
        impersonatedUser,
        sessionId,
        reason,
        startTime: new Date(),
        maxDuration: permissions.max_session_duration_minutes,
        warningShown: false
      });

      // Update current user to impersonated user
      setUser(impersonatedUser);

      // Store impersonation state in session storage (not localStorage for security)
      sessionStorage.setItem('impersonation_state', JSON.stringify({
        sessionId,
        originalUserId: user!.id,
        targetUserId,
        startTime: new Date().toISOString(),
        maxDuration: permissions.max_session_duration_minutes
      }));

      return { success: true };
    } catch (error) {
      console.error('Error starting impersonation:', error);
      return { success: false, error: 'Failed to start impersonation session' };
    }
  };

  const endImpersonation = async (reason: string = 'manual'): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!impersonationState.isImpersonating || !impersonationState.sessionId) {
        return { success: false, error: 'No active impersonation session' };
      }

      // End audit logging
      await auditService.endImpersonationSession(
        impersonationState.sessionId,
        reason === 'manual' ? 'ended_manually' : 'ended_timeout',
        `Session ended: ${reason}`
      );

      // Restore original user
      if (impersonationState.originalUser) {
        setUser(impersonationState.originalUser);
      }

      // Clear impersonation state
      setImpersonationState({
        isImpersonating: false,
        originalUser: null,
        impersonatedUser: null,
        sessionId: null,
        reason: null,
        startTime: null,
        maxDuration: 120,
        warningShown: false
      });

      // Clear session storage
      sessionStorage.removeItem('impersonation_state');

      return { success: true };
    } catch (error) {
      console.error('Error ending impersonation:', error);
      return { success: false, error: 'Failed to end impersonation session' };
    }
  };

  const getEffectiveUser = (): AuthUser | null => {
    return impersonationState.isImpersonating ? impersonationState.impersonatedUser : user;
  };

  const getOriginalUser = (): AuthUser | null => {
    return impersonationState.isImpersonating ? impersonationState.originalUser : user;
  };

  // Session timeout and warning management
  useEffect(() => {
    if (!impersonationState.isImpersonating || !impersonationState.startTime) return;

    const checkSessionTimeout = () => {
      const now = new Date();
      const elapsed = (now.getTime() - impersonationState.startTime!.getTime()) / (1000 * 60); // minutes

      // Show warning at 25 minutes before timeout
      if (elapsed >= impersonationState.maxDuration - 25 && !impersonationState.warningShown) {
        setImpersonationState(prev => ({ ...prev, warningShown: true }));
        // You could show a toast notification here
        console.warn('Impersonation session will expire in 25 minutes');
      }

      // Auto-end session if exceeded max duration
      if (elapsed >= impersonationState.maxDuration) {
        endImpersonation('timeout');
      }
    };

    const interval = setInterval(checkSessionTimeout, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [impersonationState.isImpersonating, impersonationState.startTime, impersonationState.maxDuration, impersonationState.warningShown]);

  // Restore impersonation state on page refresh
  useEffect(() => {
    const storedState = sessionStorage.getItem('impersonation_state');
    if (storedState && user?.role === 'super-admin') {
      try {
        const parsed = JSON.parse(storedState);
        const startTime = new Date(parsed.startTime);
        const elapsed = (new Date().getTime() - startTime.getTime()) / (1000 * 60);

        // If session hasn't expired, restore it
        if (elapsed < parsed.maxDuration) {
          // Re-fetch target user and restore state
          supabase.auth.admin.getUserById(parsed.targetUserId).then(({ data: targetUser }) => {
            if (targetUser) {
              const impersonatedUser: AuthUser = {
                ...targetUser.user,
                role: targetUser.user.user_metadata?.role,
                metadata: targetUser.user.user_metadata
              };

              setImpersonationState({
                isImpersonating: true,
                originalUser: user,
                impersonatedUser,
                sessionId: parsed.sessionId,
                reason: 'Customer Support', // Default reason for restored sessions
                startTime,
                maxDuration: parsed.maxDuration,
                warningShown: false
              });

              setUser(impersonatedUser);
            }
          });
        } else {
          // Session expired, clean up
          sessionStorage.removeItem('impersonation_state');
        }
      } catch (error) {
        console.error('Error restoring impersonation state:', error);
        sessionStorage.removeItem('impersonation_state');
      }
    }
  }, [user?.id, user?.role]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signOut,
      resetPassword,
      signInWithMagicLink,

      // Impersonation functionality
      impersonationState,
      isImpersonating: impersonationState.isImpersonating,
      canImpersonate,
      startImpersonation,
      endImpersonation,
      getEffectiveUser,
      getOriginalUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
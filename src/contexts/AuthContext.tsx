import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    setUser(null);
    setSession(null);
    navigate('/login');
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

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signOut,
      resetPassword,
      signInWithMagicLink
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
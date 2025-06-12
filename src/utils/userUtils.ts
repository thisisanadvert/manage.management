import { AuthUser } from '../contexts/AuthContext';

/**
 * Utility functions for user management and demo detection
 */

/**
 * Check if a user is a demo user
 * Demo users are identified by:
 * 1. Email ending with @demo.com
 * 2. isDemo flag in user metadata
 * 3. Being in dev mode (for super admin switching)
 */
export const isDemoUser = (user: AuthUser | null): boolean => {
  if (!user) return false;
  
  return (
    user.email?.endsWith('@demo.com') ||
    user.user_metadata?.isDemo === true ||
    user.user_metadata?.devMode === true
  );
};

/**
 * Check if a user has completed building setup
 */
export const hasBuildingSetup = (user: AuthUser | null): boolean => {
  if (!user) return false;
  
  return !!(
    user.user_metadata?.buildingId &&
    user.user_metadata?.buildingId !== 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' // Not demo building
  );
};

/**
 * Check if a user needs onboarding
 */
export const needsOnboarding = (user: AuthUser | null): boolean => {
  if (!user) return false;
  
  // Demo users don't need onboarding
  if (isDemoUser(user)) return false;
  
  // Check if onboarding is complete
  if (user.user_metadata?.onboardingComplete === true) return false;
  
  // Check if user needs building setup
  if (user.user_metadata?.needsBuildingSetup === true) return true;
  
  // Check if user has building setup
  if (!hasBuildingSetup(user)) return true;
  
  return false;
};

/**
 * Get the appropriate dashboard path for a user
 */
export const getDashboardPath = (user: AuthUser | null): string => {
  if (!user?.role) return '/';
  
  const basePath = user.role.split('-')[0];
  return `/${basePath}`;
};

/**
 * Check if user should see demo data
 */
export const shouldShowDemoData = (user: AuthUser | null): boolean => {
  return isDemoUser(user);
};

/**
 * Clean up localStorage for real users who might have demo data
 */
export const cleanupDemoDataFromStorage = (userId: string): void => {
  if (!userId) return;
  
  // Remove any demo notifications
  const notificationsKey = `notifications_${userId}`;
  const savedNotifications = localStorage.getItem(notificationsKey);
  
  if (savedNotifications) {
    try {
      const notifications = JSON.parse(savedNotifications);
      // Filter out any demo-looking notifications
      const cleanNotifications = notifications.filter((notification: any) => {
        // Remove notifications that look like demo data
        const isDemoNotification = 
          notification.message?.includes('Unit 4B') ||
          notification.message?.includes('AGM scheduled') ||
          notification.message?.includes('cleaning service provider') ||
          notification.message?.includes('Q4 service charge') ||
          notification.message?.includes('Insurance certificate');
        
        return !isDemoNotification;
      });
      
      if (cleanNotifications.length !== notifications.length) {
        localStorage.setItem(notificationsKey, JSON.stringify(cleanNotifications));
      }
    } catch (error) {
      console.error('Error cleaning notifications:', error);
      // If there's an error, just remove the item
      localStorage.removeItem(notificationsKey);
    }
  }
};

/**
 * Get user display name
 */
export const getUserDisplayName = (user: AuthUser | null): string => {
  if (!user) return 'User';
  
  const firstName = user.user_metadata?.firstName;
  const lastName = user.user_metadata?.lastName;
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  if (firstName) {
    return firstName;
  }
  
  return user.email?.split('@')[0] || 'User';
};

/**
 * Get user role display name
 */
export const getRoleDisplayName = (role: string | undefined): string => {
  if (!role) return 'User';
  
  const roleMap: Record<string, string> = {
    'rtm-director': 'RTM Director',
    'sof-director': 'SOF Director',
    'leaseholder': 'Leaseholder',
    'shareholder': 'Shareholder',
    'management-company': 'Management Company',
    'super-admin': 'Super Admin'
  };
  
  return roleMap[role] || role;
};

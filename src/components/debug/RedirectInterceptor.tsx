/**
 * Redirect Interceptor Component
 * Intercepts and logs all navigation attempts to debug redirect issues
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RedirectInterceptor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Store original navigate function
    const originalNavigate = navigate;

    // Override navigate function to log all navigation attempts
    const interceptedNavigate = (...args: any[]) => {
      console.log('🚨 NAVIGATION INTERCEPTED:', {
        from: location.pathname,
        to: args[0],
        user: user?.email,
        role: user?.role,
        timestamp: new Date().toISOString(),
        stackTrace: new Error().stack
      });

      // For frankie@manage.management, block redirects to /rtm if trying to access settings
      if (user?.email === 'frankie@manage.management') {
        const targetPath = args[0];
        const currentPath = location.pathname;
        
        if (targetPath === '/rtm' && currentPath.includes('/settings')) {
          console.log('🛑 BLOCKING REDIRECT from settings to /rtm for frankie@manage.management');
          alert(`BLOCKED REDIRECT: Attempted to redirect from ${currentPath} to ${targetPath}`);
          return;
        }
      }

      // Call original navigate
      return originalNavigate(...args);
    };

    // Override window.location.href assignments
    const originalLocationHref = window.location.href;
    let locationHrefValue = originalLocationHref;

    Object.defineProperty(window.location, 'href', {
      get: () => locationHrefValue,
      set: (value) => {
        console.log('🚨 WINDOW.LOCATION.HREF CHANGE:', {
          from: locationHrefValue,
          to: value,
          user: user?.email,
          role: user?.role,
          timestamp: new Date().toISOString(),
          stackTrace: new Error().stack
        });

        // For frankie@manage.management, block redirects to /rtm
        if (user?.email === 'frankie@manage.management' && value.includes('/rtm')) {
          console.log('🛑 BLOCKING WINDOW.LOCATION.HREF REDIRECT to /rtm for frankie@manage.management');
          alert(`BLOCKED WINDOW REDIRECT: Attempted to redirect to ${value}`);
          return;
        }

        locationHrefValue = value;
        window.location.assign(value);
      }
    });

    // Override history.pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      console.log('🚨 HISTORY.PUSHSTATE:', {
        args,
        user: user?.email,
        role: user?.role,
        timestamp: new Date().toISOString()
      });
      return originalPushState.apply(this, args);
    };

    history.replaceState = function(...args) {
      console.log('🚨 HISTORY.REPLACESTATE:', {
        args,
        user: user?.email,
        role: user?.role,
        timestamp: new Date().toISOString()
      });
      return originalReplaceState.apply(this, args);
    };

    // Log current state
    console.log('🔍 REDIRECT INTERCEPTOR INITIALIZED:', {
      currentPath: location.pathname,
      user: user?.email,
      role: user?.role,
      timestamp: new Date().toISOString()
    });

    // Cleanup function
    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [navigate, location.pathname, user?.email, user?.role]);

  // Log every render
  useEffect(() => {
    console.log('🔄 REDIRECT INTERCEPTOR RENDER:', {
      path: location.pathname,
      user: user?.email,
      role: user?.role,
      timestamp: new Date().toISOString()
    });
  });

  return <>{children}</>;
};

export default RedirectInterceptor;

import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ImpersonationStyleProviderProps {
  children: React.ReactNode;
}

const ImpersonationStyleProvider: React.FC<ImpersonationStyleProviderProps> = ({ children }) => {
  const { isImpersonating, impersonationState } = useAuth();

  useEffect(() => {
    const root = document.documentElement;
    
    if (isImpersonating) {
      // Apply impersonation styling
      root.style.setProperty('--impersonation-active', '1');
      root.style.setProperty('--sidebar-bg', '#fef3c7'); // Yellow-100
      root.style.setProperty('--sidebar-border', '#f59e0b'); // Yellow-500
      root.style.setProperty('--sidebar-text', '#92400e'); // Yellow-800
      root.style.setProperty('--sidebar-hover-bg', '#fde68a'); // Yellow-200
      root.style.setProperty('--header-bg', '#fef3c7'); // Yellow-100
      root.style.setProperty('--header-border', '#f59e0b'); // Yellow-500
      
      // Add impersonation class to body
      document.body.classList.add('impersonation-active');
      
      // Add custom CSS for impersonation mode
      const style = document.createElement('style');
      style.id = 'impersonation-styles';
      style.textContent = `
        .impersonation-active .sidebar {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-right: 2px solid #f59e0b;
        }
        
        .impersonation-active .sidebar .nav-item {
          color: #92400e;
        }
        
        .impersonation-active .sidebar .nav-item:hover {
          background-color: #fde68a;
          color: #78350f;
        }
        
        .impersonation-active .sidebar .nav-item.active {
          background-color: #f59e0b;
          color: white;
        }
        
        .impersonation-active .header {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-bottom: 2px solid #f59e0b;
        }
        
        .impersonation-active .main-content {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          min-height: 100vh;
        }
        
        .impersonation-active .card {
          border: 1px solid #f59e0b;
          box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.1);
        }
        
        .impersonation-active .breadcrumb {
          background-color: #fde68a;
          color: #92400e;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        
        .impersonation-active .breadcrumb::before {
          content: "🔒 Admin Dashboard > Impersonating > ";
          font-weight: 600;
        }
        
        /* Pulse animation for critical actions */
        .impersonation-active .critical-action {
          animation: impersonation-pulse 2s infinite;
        }
        
        @keyframes impersonation-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(245, 158, 11, 0);
          }
        }
        
        /* Warning overlay for sensitive actions */
        .impersonation-active .sensitive-action::before {
          content: "⚠️ Impersonation Mode";
          position: absolute;
          top: -2rem;
          left: 0;
          right: 0;
          background: #f59e0b;
          color: white;
          text-align: center;
          padding: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 0.25rem;
          z-index: 10;
        }
        
        .impersonation-active .sensitive-action {
          position: relative;
          margin-top: 2rem;
        }
      `;
      document.head.appendChild(style);
      
    } else {
      // Remove impersonation styling
      root.style.removeProperty('--impersonation-active');
      root.style.removeProperty('--sidebar-bg');
      root.style.removeProperty('--sidebar-border');
      root.style.removeProperty('--sidebar-text');
      root.style.removeProperty('--sidebar-hover-bg');
      root.style.removeProperty('--header-bg');
      root.style.removeProperty('--header-border');
      
      // Remove impersonation class from body
      document.body.classList.remove('impersonation-active');
      
      // Remove custom CSS
      const existingStyle = document.getElementById('impersonation-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
    
    return () => {
      // Cleanup on unmount
      const existingStyle = document.getElementById('impersonation-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
      document.body.classList.remove('impersonation-active');
    };
  }, [isImpersonating]);

  return <>{children}</>;
};

export default ImpersonationStyleProvider;

// Hook for impersonation-aware confirmations
export const useImpersonationConfirmation = () => {
  const { isImpersonating, getEffectiveUser, getOriginalUser } = useAuth();

  const confirmSensitiveAction = (
    actionDescription: string,
    riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!isImpersonating) {
        resolve(true);
        return;
      }

      const effectiveUser = getEffectiveUser();
      const originalUser = getOriginalUser();

      const riskColors = {
        low: 'text-blue-600',
        medium: 'text-yellow-600',
        high: 'text-orange-600',
        critical: 'text-red-600'
      };

      const riskLabels = {
        low: 'Low Risk',
        medium: 'Medium Risk',
        high: 'High Risk',
        critical: 'Critical Risk'
      };

      const confirmed = window.confirm(
        `🔒 IMPERSONATION MODE CONFIRMATION\n\n` +
        `You are currently impersonating:\n` +
        `${effectiveUser?.email} (${effectiveUser?.role})\n\n` +
        `Action: ${actionDescription}\n` +
        `Risk Level: ${riskLabels[riskLevel]}\n\n` +
        `This action will be logged and audited.\n\n` +
        `Do you want to proceed?`
      );

      resolve(confirmed);
    });
  };

  return { confirmSensitiveAction, isImpersonating };
};

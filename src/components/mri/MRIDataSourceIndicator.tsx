/**
 * MRI Data Source Indicator Component
 * Shows when data comes from MRI Qube with sync information
 */

import React from 'react';
import { Database, Clock, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import Badge from '../ui/Badge';

interface MRIDataSourceIndicatorProps {
  /** Whether this data comes from MRI Qube */
  isMRIData: boolean;
  /** Last sync timestamp */
  lastSynced?: string;
  /** Sync status */
  syncStatus?: 'success' | 'error' | 'pending' | 'in_progress';
  /** Error message if sync failed */
  errorMessage?: string;
  /** Show detailed sync info */
  showDetails?: boolean;
  /** Custom className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Position variant */
  position?: 'inline' | 'corner' | 'header';
}

const MRIDataSourceIndicator: React.FC<MRIDataSourceIndicatorProps> = ({
  isMRIData,
  lastSynced,
  syncStatus = 'success',
  errorMessage,
  showDetails = false,
  className = '',
  size = 'md',
  position = 'inline'
}) => {
  if (!isMRIData) {
    return null;
  }

  const formatLastSynced = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'success':
        return <Database className={`${getSizeClasses().icon} text-primary-600`} />;
      case 'error':
        return <AlertTriangle className={`${getSizeClasses().icon} text-error-600`} />;
      case 'in_progress':
        return <RefreshCw className={`${getSizeClasses().icon} text-primary-600 animate-spin`} />;
      default:
        return <Clock className={`${getSizeClasses().icon} text-gray-400`} />;
    }
  };

  const getSyncBadge = () => {
    switch (syncStatus) {
      case 'success':
        return <Badge variant="primary" size="xs">MRI</Badge>;
      case 'error':
        return <Badge variant="error" size="xs">MRI Error</Badge>;
      case 'in_progress':
        return <Badge variant="primary" size="xs">Syncing</Badge>;
      default:
        return <Badge variant="gray" size="xs">MRI Pending</Badge>;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          icon: 'h-3 w-3',
          text: 'text-xs',
          container: 'gap-1'
        };
      case 'lg':
        return {
          icon: 'h-5 w-5',
          text: 'text-sm',
          container: 'gap-2'
        };
      default:
        return {
          icon: 'h-4 w-4',
          text: 'text-xs',
          container: 'gap-1.5'
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'corner':
        return 'absolute top-2 right-2';
      case 'header':
        return 'flex items-center justify-end';
      default:
        return 'inline-flex items-center';
    }
  };

  const sizeClasses = getSizeClasses();
  const positionClasses = getPositionClasses();

  // Simple badge version for compact display
  if (!showDetails) {
    return (
      <div className={`${positionClasses} ${sizeClasses.container} ${className}`}>
        {getSyncBadge()}
        {lastSynced && (
          <span className={`${sizeClasses.text} text-gray-500`}>
            {formatLastSynced(lastSynced)}
          </span>
        )}
      </div>
    );
  }

  // Detailed version with full sync information
  return (
    <div className={`${positionClasses} ${className}`}>
      <div className={`flex items-center ${sizeClasses.container} bg-gray-50 rounded-lg px-2 py-1 border border-gray-200`}>
        {getSyncIcon()}
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`${sizeClasses.text} font-medium text-gray-700`}>
              MRI Qube Data
            </span>
            {getSyncBadge()}
          </div>
          
          {lastSynced && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                Synced {formatLastSynced(lastSynced)}
              </span>
            </div>
          )}
          
          {syncStatus === 'error' && errorMessage && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3 text-error-500" />
              <span className="text-xs text-error-600 truncate max-w-48">
                {errorMessage}
              </span>
            </div>
          )}
        </div>
        
        <ExternalLink className="h-3 w-3 text-gray-400 ml-1" />
      </div>
    </div>
  );
};

// Utility component for table cells
export const MRITableIndicator: React.FC<{
  isMRIData: boolean;
  lastSynced?: string;
  syncStatus?: 'success' | 'error' | 'pending' | 'in_progress';
}> = ({ isMRIData, lastSynced, syncStatus }) => {
  if (!isMRIData) return null;
  
  return (
    <MRIDataSourceIndicator
      isMRIData={isMRIData}
      lastSynced={lastSynced}
      syncStatus={syncStatus}
      size="sm"
      position="inline"
    />
  );
};

// Utility component for card headers
export const MRICardIndicator: React.FC<{
  isMRIData: boolean;
  lastSynced?: string;
  syncStatus?: 'success' | 'error' | 'pending' | 'in_progress';
  errorMessage?: string;
}> = ({ isMRIData, lastSynced, syncStatus, errorMessage }) => {
  if (!isMRIData) return null;
  
  return (
    <MRIDataSourceIndicator
      isMRIData={isMRIData}
      lastSynced={lastSynced}
      syncStatus={syncStatus}
      errorMessage={errorMessage}
      showDetails={true}
      size="md"
      position="header"
    />
  );
};

// Utility component for corner positioning
export const MRICornerIndicator: React.FC<{
  isMRIData: boolean;
  lastSynced?: string;
  syncStatus?: 'success' | 'error' | 'pending' | 'in_progress';
}> = ({ isMRIData, lastSynced, syncStatus }) => {
  if (!isMRIData) return null;
  
  return (
    <MRIDataSourceIndicator
      isMRIData={isMRIData}
      lastSynced={lastSynced}
      syncStatus={syncStatus}
      size="sm"
      position="corner"
    />
  );
};

export default MRIDataSourceIndicator;

/**
 * Form Persistence Indicator
 * Visual feedback component for form save states and data restoration
 */

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Check, 
  AlertCircle, 
  Clock, 
  RotateCcw, 
  Trash2,
  Loader2,
  Info
} from 'lucide-react';
import Button from './Button';
import { FormPersistenceState } from '../../hooks/useFormPersistence';

export interface FormPersistenceIndicatorProps {
  persistenceState: FormPersistenceState;
  onSaveNow?: () => void;
  onRestoreData?: () => void;
  onClearSavedData?: () => void;
  className?: string;
  showActions?: boolean;
  compact?: boolean;
}

const FormPersistenceIndicator: React.FC<FormPersistenceIndicatorProps> = ({
  persistenceState,
  onSaveNow,
  onRestoreData,
  onClearSavedData,
  className = '',
  showActions = true,
  compact = false
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const {
    isSaving,
    isRestoring,
    lastSaved,
    hasUnsavedChanges,
    hasSavedData
  } = persistenceState;

  // Show "just saved" indicator briefly after saving
  useEffect(() => {
    if (!isSaving && lastSaved) {
      setJustSaved(true);
      const timer = setTimeout(() => setJustSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaved]);

  // Get status info
  const getStatusInfo = () => {
    if (isRestoring) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin text-blue-600" />,
        text: 'Restoring data...',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }

    if (isSaving) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin text-blue-600" />,
        text: 'Saving...',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }

    if (justSaved) {
      return {
        icon: <Check className="h-4 w-4 text-green-600" />,
        text: 'Saved',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }

    if (hasUnsavedChanges) {
      return {
        icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
        text: 'Unsaved changes',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200'
      };
    }

    if (hasSavedData && lastSaved) {
      const timeAgo = getTimeAgo(lastSaved);
      return {
        icon: <Clock className="h-4 w-4 text-gray-500" />,
        text: `Saved ${timeAgo}`,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
    }

    return null;
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const statusInfo = getStatusInfo();

  if (!statusInfo && !hasSavedData) {
    return null; // Don't show anything if there's no relevant state
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        {statusInfo && (
          <div className="flex items-center space-x-1">
            {statusInfo.icon}
            <span className={`text-xs ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Main Status Bar */}
      {statusInfo && (
        <div 
          className={`
            flex items-center justify-between p-3 rounded-lg border
            ${statusInfo.bgColor} ${statusInfo.borderColor}
          `}
        >
          <div className="flex items-center space-x-2">
            {statusInfo.icon}
            <span className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
            {hasSavedData && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                {showDetails ? 'Hide details' : 'Show details'}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex items-center space-x-2">
              {hasUnsavedChanges && onSaveNow && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSaveNow}
                  leftIcon={<Save className="h-3 w-3" />}
                  disabled={isSaving}
                >
                  Save Now
                </Button>
              )}
              
              {hasSavedData && onRestoreData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRestoreData}
                  leftIcon={<RotateCcw className="h-3 w-3" />}
                  disabled={isRestoring}
                >
                  Restore
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Detailed Information */}
      {showDetails && hasSavedData && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Saved Data Available
                </span>
              </div>
              
              {lastSaved && (
                <div className="text-xs text-gray-600">
                  Last saved: {lastSaved.toLocaleString()}
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                Your form data is automatically saved as you type and will be restored if you navigate away and return.
              </div>
            </div>

            {/* Clear Data Button */}
            {onClearSavedData && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear saved data? This cannot be undone.')) {
                    onClearSavedData();
                    setShowDetails(false);
                  }
                }}
                leftIcon={<Trash2 className="h-3 w-3" />}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                Clear Saved Data
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Restoration Notice */}
      {hasSavedData && !hasUnsavedChanges && !isRestoring && !isSaving && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Previously saved data was restored automatically.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormPersistenceIndicator;

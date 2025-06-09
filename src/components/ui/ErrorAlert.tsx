import React from 'react';
import { AlertTriangle, X, RefreshCw, ExternalLink } from 'lucide-react';
import Button from './Button';

export interface ErrorAlertProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  onRetry?: () => void;
  showDetails?: boolean;
  details?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title,
  message,
  type = 'error',
  dismissible = true,
  onDismiss,
  onRetry,
  showDetails = false,
  details,
  actionLabel,
  onAction,
  className = ''
}) => {
  const [showFullDetails, setShowFullDetails] = React.useState(false);

  const typeStyles = {
    error: {
      container: 'bg-error-50 border-error-200',
      icon: 'text-error-400',
      title: 'text-error-800',
      message: 'text-error-700',
      button: 'text-error-600 hover:text-error-500'
    },
    warning: {
      container: 'bg-warning-50 border-warning-200',
      icon: 'text-warning-400',
      title: 'text-warning-800',
      message: 'text-warning-700',
      button: 'text-warning-600 hover:text-warning-500'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-400',
      title: 'text-blue-800',
      message: 'text-blue-700',
      button: 'text-blue-600 hover:text-blue-500'
    }
  };

  const styles = typeStyles[type];

  return (
    <div className={`rounded-md border p-4 ${styles.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {title}
            </h3>
          )}
          <div className={`${title ? 'mt-2' : ''} text-sm ${styles.message}`}>
            <p>{message}</p>
            
            {showDetails && details && (
              <div className="mt-3">
                <button
                  onClick={() => setShowFullDetails(!showFullDetails)}
                  className={`text-sm underline ${styles.button}`}
                >
                  {showFullDetails ? 'Hide' : 'Show'} details
                </button>
                {showFullDetails && (
                  <div className="mt-2 p-3 bg-white bg-opacity-50 rounded border text-xs font-mono whitespace-pre-wrap">
                    {details}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {(onRetry || onAction) && (
            <div className="mt-4 flex space-x-3">
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  leftIcon={<RefreshCw size={14} />}
                >
                  Try Again
                </Button>
              )}
              {onAction && actionLabel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAction}
                  leftIcon={<ExternalLink size={14} />}
                >
                  {actionLabel}
                </Button>
              )}
            </div>
          )}
        </div>
        
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.button}`}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;

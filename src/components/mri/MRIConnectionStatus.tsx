/**
 * MRI Connection Status Component
 * Displays the current connection status to MRI Qube API
 */

import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Settings,
  Clock
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { mriQubeService } from '../../services/mriQubeService';

interface ConnectionStatus {
  isConnected: boolean;
  lastChecked: Date;
  message: string;
  details?: any;
  isLoading: boolean;
}

interface MRIConnectionStatusProps {
  showDetails?: boolean;
  onConfigureClick?: () => void;
  className?: string;
}

const MRIConnectionStatus: React.FC<MRIConnectionStatusProps> = ({
  showDetails = false,
  onConfigureClick,
  className = ''
}) => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastChecked: new Date(),
    message: 'Checking connection...',
    isLoading: true
  });

  const checkConnection = async () => {
    setStatus(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await mriQubeService.testConnection();
      
      setStatus({
        isConnected: result.success,
        lastChecked: new Date(),
        message: result.message,
        details: result.details,
        isLoading: false
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        lastChecked: new Date(),
        message: 'Connection test failed',
        details: error,
        isLoading: false
      });
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 5 minutes
    const interval = setInterval(checkConnection, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (status.isLoading) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    
    if (status.isConnected) {
      return <CheckCircle2 className="h-4 w-4 text-success-600" />;
    }
    
    return <AlertTriangle className="h-4 w-4 text-error-600" />;
  };

  const getStatusBadge = () => {
    if (status.isLoading) {
      return <Badge variant="gray" size="sm">Checking...</Badge>;
    }
    
    if (status.isConnected) {
      return <Badge variant="success" size="sm">Connected</Badge>;
    }
    
    return <Badge variant="error" size="sm">Disconnected</Badge>;
  };

  const formatLastChecked = (date: Date) => {
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

  if (!showDetails) {
    // Compact header version
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getStatusIcon()}
        <span className="text-sm text-gray-600">MRI Qube</span>
        {getStatusBadge()}
      </div>
    );
  }

  // Detailed version for settings/admin pages
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            {status.isConnected ? (
              <Wifi className="h-6 w-6 text-primary-600" />
            ) : (
              <WifiOff className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">MRI Qube Integration</h3>
            <p className="text-sm text-gray-600">Property management system connection</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {onConfigureClick && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Settings size={16} />}
              onClick={onConfigureClick}
            >
              Configure
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium text-gray-900">Connection Status</span>
          </div>
          <span className="text-sm text-gray-600">{status.message}</span>
        </div>

        {/* Last Checked */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">Last Checked</span>
          </div>
          <span className="text-sm text-gray-600">{formatLastChecked(status.lastChecked)}</span>
        </div>

        {/* Configuration Status */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">Configuration</span>
          </div>
          <span className="text-sm text-gray-600">
            {mriQubeService.isConfigured() ? 'Configured' : 'Not configured'}
          </span>
        </div>

        {/* Error Details */}
        {!status.isConnected && !status.isLoading && (
          <div className="mt-4 p-4 bg-error-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-error-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-error-800">Connection Issue</h4>
                <p className="text-sm text-error-700 mt-1">{status.message}</p>
                {status.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-error-600 cursor-pointer">
                      Show technical details
                    </summary>
                    <pre className="text-xs text-error-600 mt-1 whitespace-pre-wrap">
                      {JSON.stringify(status.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Details */}
        {status.isConnected && status.details && (
          <div className="mt-4 p-4 bg-success-50 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-success-800">Connection Successful</h4>
                <p className="text-sm text-success-700 mt-1">
                  Successfully connected to MRI Qube API
                </p>
                {status.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-success-600 cursor-pointer">
                      Show connection details
                    </summary>
                    <pre className="text-xs text-success-600 mt-1 whitespace-pre-wrap">
                      {JSON.stringify(status.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={16} />}
            onClick={checkConnection}
            disabled={status.isLoading}
          >
            Test Connection
          </Button>
          
          {!mriQubeService.isConfigured() && onConfigureClick && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Settings size={16} />}
              onClick={onConfigureClick}
            >
              Configure Integration
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MRIConnectionStatus;

/**
 * MRI Quick Setup Dashboard Widget
 * Shows MRI integration status and provides quick setup access
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  Settings,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Key,
  Zap
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getUserBuildingId } from '../../utils/buildingUtils';
import MRICredentialManager from '../mri/MRICredentialManager';

interface MRIStatus {
  hasCredentials: boolean;
  isConfigured: boolean;
  lastSync?: string;
  syncStatus?: 'success' | 'error' | 'pending';
}

interface MRIQuickSetupProps {
  className?: string;
}

const MRIQuickSetup: React.FC<MRIQuickSetupProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [buildingId, setBuildingId] = useState<string>('');
  const [status, setStatus] = useState<MRIStatus>({
    hasCredentials: false,
    isConfigured: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showCredentialManager, setShowCredentialManager] = useState(false);

  useEffect(() => {
    loadMRIStatus();
  }, [user]);

  const loadMRIStatus = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get building ID
      const id = await getUserBuildingId(user);
      if (!id) return;
      
      setBuildingId(id);

      // Check if credentials exist
      const { data: credentialsData } = await supabase
        .from('mri_credentials')
        .select('id, client_id, client_secret')
        .eq('building_id', id)
        .eq('is_active', true)
        .single();

      const hasCredentials = !!(credentialsData?.client_id && credentialsData?.client_secret);

      // Check sync status if credentials exist
      let lastSync, syncStatus;
      if (hasCredentials) {
        const { data: syncData } = await supabase
          .from('mri_sync_status')
          .select('last_sync_date, status')
          .eq('building_id', id)
          .order('last_sync_date', { ascending: false })
          .limit(1)
          .single();

        lastSync = syncData?.last_sync_date;
        syncStatus = syncData?.status;
      }

      setStatus({
        hasCredentials,
        isConfigured: hasCredentials,
        lastSync,
        syncStatus
      });

    } catch (error) {
      console.error('Error loading MRI status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsUpdated = () => {
    setShowCredentialManager(false);
    loadMRIStatus();
  };

  const canManageCredentials = user?.email === 'frankie@manage.management' || 
                              user?.metadata?.role === 'rtm-director' || 
                              user?.metadata?.role === 'rmc-director';

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!buildingId) {
    return null;
  }

  // Show credential manager if requested
  if (showCredentialManager) {
    return (
      <div className={className}>
        <MRICredentialManager
          buildingId={buildingId}
          onCredentialsUpdated={handleCredentialsUpdated}
        />
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => setShowCredentialManager(false)}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            status.isConfigured ? 'bg-success-50' : 'bg-amber-50'
          }`}>
            <Database className={`h-6 w-6 ${
              status.isConfigured ? 'text-success-600' : 'text-amber-600'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">MRI Qube Integration</h3>
            <p className="text-sm text-gray-600">Property management system connection</p>
          </div>
        </div>
        
        <Badge variant={status.isConfigured ? 'success' : 'error'} size="sm">
          {status.isConfigured ? 'Connected' : 'Not Setup'}
        </Badge>
      </div>

      {/* Status Information */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">API Credentials</span>
          </div>
          <div className="flex items-center gap-1">
            {status.hasCredentials ? (
              <CheckCircle2 className="h-4 w-4 text-success-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
            <span className="text-sm font-medium">
              {status.hasCredentials ? 'Configured' : 'Missing'}
            </span>
          </div>
        </div>

        {status.lastSync && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Last Sync</span>
            </div>
            <div className="flex items-center gap-1">
              {status.syncStatus === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-success-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-error-600" />
              )}
              <span className="text-sm font-medium">
                {new Date(status.lastSync).toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {!status.hasCredentials && canManageCredentials && (
          <Button
            variant="primary"
            className="w-full"
            leftIcon={<Key size={16} />}
            rightIcon={<ArrowRight size={16} />}
            onClick={() => setShowCredentialManager(true)}
          >
            Setup MRI Credentials
          </Button>
        )}

        {status.hasCredentials && (
          <Button
            variant="outline"
            className="w-full"
            leftIcon={<Settings size={16} />}
            rightIcon={<ArrowRight size={16} />}
            onClick={() => window.location.href = '/settings/mri-integration'}
          >
            Manage MRI Integration
          </Button>
        )}

        {!canManageCredentials && !status.hasCredentials && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Setup Required</p>
                <p className="text-sm text-amber-700 mt-1">
                  Contact your building director to configure MRI Qube integration.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Benefits/Features Preview */}
      {!status.isConfigured && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-700 mb-2">With MRI Integration:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Automatic financial data synchronisation</li>
            <li>• Real-time transaction updates</li>
            <li>• Integrated budget vs actual reporting</li>
            <li>• Section 20 compliance tracking</li>
          </ul>
        </div>
      )}
    </Card>
  );
};

export default MRIQuickSetup;

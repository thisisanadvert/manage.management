/**
 * Attio CRM Settings Component
 * Allows users to configure Attio CRM integration settings
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  TestTube,
  BarChart3,
  Clock,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { attioService, AttioSettings, AttioSyncLog } from '../../services/attioService';
import AttioTestButton from './AttioTestButton';
import AttioDiagnostics from './AttioDiagnostics';

const AttioSettingsComponent: React.FC = () => {
  const { user } = useAuth();

  // Only allow super-admin users to access Attio integration
  if (user?.role !== 'super-admin') {
    return (
      <Card>
        <div className="p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">
            Attio CRM integration is only available to super-admin users for centralized lead management across all buildings.
          </p>
        </div>
      </Card>
    );
  }
  const [settings, setSettings] = useState<AttioSettings>({
    building_id: 'global', // Global settings for manage.management company
    auto_sync_enabled: true,
    sync_on_signup: true,
    sync_on_qualification: true,
    default_person_tags: ['RTM Lead', 'manage.management'],
    default_company_category: 'Residential Building'
  });
  const [syncLogs, setSyncLogs] = useState<AttioSyncLog[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0,
    last_sync: undefined as string | undefined
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load global settings for manage.management
      const { data: settingsData } = await attioService.getAttioSettings('global');
      if (settingsData) {
        setSettings(settingsData);
      }

      // Load recent sync logs across all buildings
      const { data: logsData } = await attioService.getSyncLogs(undefined, 20);
      if (logsData) {
        setSyncLogs(logsData);
      }

      // Load statistics across all buildings
      const stats = await attioService.getSyncStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading Attio data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const result = await attioService.updateAttioSettings('global', settings);
      if (result.success) {
        setTestResult({ success: true, message: 'Global settings saved successfully!' });
        setTimeout(() => setTestResult(null), 3000);
      } else {
        setTestResult({ success: false, message: result.error || 'Failed to save settings' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Error saving settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await attioService.testAttioConnection();
      setTestResult({
        success: result.success,
        message: result.success ? 'Connection successful!' : result.error || 'Connection failed'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection test failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRetrySync = async (syncLogId: string) => {
    try {
      const result = await attioService.retrySyncToAttio(syncLogId);
      if (result.success) {
        await loadData(); // Refresh data
        setTestResult({ success: true, message: 'Sync retry successful!' });
      } else {
        setTestResult({ success: false, message: result.error || 'Retry failed' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Error retrying sync' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Success</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'retry':
        return <Badge variant="info">Retrying</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="animate-spin mr-2" size={20} />
          Loading Attio settings...
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attio CRM Integration</h2>
          <p className="text-gray-600 mt-1">
            Centralized lead management for manage.management - automatically sync RTM qualification leads and building data across all properties to your Attio CRM
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <AttioTestButton />
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveSettings}
            disabled={isSaving}
            icon={isSaving ? RefreshCw : Settings}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Diagnostics Section */}
      <AttioDiagnostics />

      {/* Test Result */}
      {testResult && (
        <div className={`p-4 rounded-lg border ${
          testResult.success 
            ? 'bg-success-50 border-success-200 text-success-700' 
            : 'bg-error-50 border-error-200 text-error-700'
        }`}>
          <div className="flex items-center">
            {testResult.success ? (
              <CheckCircle2 size={20} className="mr-2" />
            ) : (
              <AlertTriangle size={20} className="mr-2" />
            )}
            {testResult.message}
          </div>
        </div>
      )}

      {/* Statistics */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 size={20} className="mr-2" />
            Sync Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
              <div className="text-sm text-gray-600">Total Syncs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.successful}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statistics.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
          {statistics.last_sync && (
            <div className="mt-4 text-sm text-gray-600 flex items-center">
              <Clock size={16} className="mr-1" />
              Last sync: {formatDate(statistics.last_sync)}
            </div>
          )}
        </div>
      </Card>

      {/* Settings */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Settings size={20} className="mr-2" />
            Sync Settings
          </h3>
          
          <div className="space-y-4">
            {/* Auto Sync Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Auto Sync Enabled</label>
                <p className="text-sm text-gray-600">Automatically sync new leads to Attio</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.auto_sync_enabled}
                  onChange={(e) => setSettings({ ...settings, auto_sync_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Sync on Signup */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Sync on User Signup</label>
                <p className="text-sm text-gray-600">Sync users who sign up from RTM qualification</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sync_on_signup}
                  onChange={(e) => setSettings({ ...settings, sync_on_signup: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Sync on Qualification */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Sync on RTM Qualification</label>
                <p className="text-sm text-gray-600">Sync leads from RTM qualification tool</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sync_on_qualification}
                  onChange={(e) => setSettings({ ...settings, sync_on_qualification: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Sync Logs */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users size={20} className="mr-2" />
            Recent Syncs
          </h3>
          
          {syncLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle size={48} className="mx-auto mb-2 opacity-50" />
              <p>No sync logs found</p>
              <p className="text-sm">Syncs will appear here once you start using the RTM qualification tool</p>
            </div>
          ) : (
            <div className="space-y-3">
              {syncLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{log.email}</span>
                      {getSyncStatusBadge(log.sync_status)}
                      <span className="text-sm text-gray-500 capitalize">{log.source.replace('-', ' ')}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatDate(log.created_at)}
                      {log.building_info?.name && (
                        <span className="ml-2">• {log.building_info.name}</span>
                      )}
                    </div>
                    {log.error_message && (
                      <div className="text-sm text-red-600 mt-1">{log.error_message}</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {log.attio_person_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://app.attio.com/people/${log.attio_person_id}`, '_blank')}
                        icon={ExternalLink}
                      >
                        View in Attio
                      </Button>
                    )}
                    {log.sync_status === 'failed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetrySync(log.id)}
                        icon={RefreshCw}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AttioSettingsComponent;

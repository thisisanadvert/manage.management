/**
 * MRI Configuration Modal Component
 * Allows users to configure MRI Qube integration settings
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Database,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Save,
  TestTube
} from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { mriSyncService } from '../../services/mriSyncService';
import { mriQubeService } from '../../services/mriQubeService';
import { MRISyncConfig } from '../../types/mri';

interface MRIConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingId: string;
  onConfigurationSaved?: () => void;
}

const MRIConfigurationModal: React.FC<MRIConfigurationModalProps> = ({
  isOpen,
  onClose,
  buildingId,
  onConfigurationSaved
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [config, setConfig] = useState<Partial<MRISyncConfig>>({
    mri_property_id: '',
    is_enabled: true,
    sync_frequency: {
      properties: 'daily',
      tenancies: 'daily',
      transactions: 'hourly',
      budgets: 'weekly',
      invoices: 'hourly',
      maintenance: 'daily',
      documents: 'weekly'
    }
  });

  const frequencyOptions = [
    { value: 'realtime', label: 'Real-time (15 minutes)', description: 'For critical data like transactions' },
    { value: 'hourly', label: 'Hourly', description: 'For frequently changing data' },
    { value: 'daily', label: 'Daily', description: 'For regular updates' },
    { value: 'weekly', label: 'Weekly', description: 'For less critical data' },
    { value: 'monthly', label: 'Monthly', description: 'For static data' },
    { value: 'manual', label: 'Manual only', description: 'Sync only when triggered manually' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadExistingConfig();
    }
  }, [isOpen, buildingId]);

  const loadExistingConfig = async () => {
    setIsLoading(true);
    try {
      const existingConfig = await mriSyncService.getSyncConfig(buildingId);
      if (existingConfig) {
        setConfig(existingConfig);
      }
    } catch (error) {
      console.error('Error loading MRI config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await mriQubeService.testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await mriSyncService.updateSyncConfig(buildingId, config);
      
      if (result.success) {
        onConfigurationSaved?.();
        onClose();
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Failed to save configuration'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save configuration'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSyncFrequency = (entityType: string, frequency: string) => {
    setConfig(prev => ({
      ...prev,
      sync_frequency: {
        ...prev.sync_frequency,
        [entityType]: frequency
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 9999 }}>
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4" onClick={onClose}>
        <div 
          className="relative w-full max-w-4xl rounded-lg bg-white shadow-xl" 
          style={{ zIndex: 10000 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Settings className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">MRI Qube Configuration</h2>
                <p className="text-sm text-gray-600">Configure integration settings and sync frequencies</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Connection Test */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">Connection Test</h3>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<TestTube size={16} />}
                  onClick={handleTestConnection}
                  disabled={isTesting}
                >
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
              
              {testResult && (
                <div className={`p-3 rounded-lg ${
                  testResult.success ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
                }`}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{testResult.message}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Basic Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MRI Property ID
                  </label>
                  <input
                    type="text"
                    value={config.mri_property_id || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, mri_property_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter MRI Property ID"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The unique property identifier in MRI Qube system
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Integration Status
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.is_enabled || false}
                        onChange={(e) => setConfig(prev => ({ ...prev, is_enabled: e.target.checked }))}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable MRI sync</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    When enabled, data will sync according to the frequencies below
                  </p>
                </div>
              </div>
            </div>

            {/* Sync Frequency Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Sync Frequencies</h3>
              <p className="text-sm text-gray-600">
                Configure how often different types of data should be synchronised from MRI Qube
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(config.sync_frequency || {}).map(([entityType, frequency]) => (
                  <div key={entityType} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-4 w-4 text-gray-400" />
                      <h4 className="font-medium text-gray-900 capitalize">{entityType}</h4>
                    </div>
                    
                    <select
                      value={frequency}
                      onChange={(e) => updateSyncFrequency(entityType, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {frequencyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {frequencyOptions.find(opt => opt.value === frequency)?.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning for Real-time Sync */}
            {Object.values(config.sync_frequency || {}).includes('realtime') && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-800">Real-time Sync Notice</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Real-time synchronisation will check for updates every 15 minutes. This may increase 
                      API usage and should only be used for critical data like transactions and invoices.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              leftIcon={<Save size={16} />}
              onClick={handleSave}
              disabled={isSaving || !config.mri_property_id}
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MRIConfigurationModal;

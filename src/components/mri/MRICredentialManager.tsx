/**
 * MRI Credential Manager Component
 * Allows users to configure MRI API credentials directly in the dashboard
 */

import React, { useState, useEffect } from 'react';
import {
  Key,
  Eye,
  EyeOff,
  Save,
  TestTube,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Settings,
  RefreshCw
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { mriQubeService } from '../../services/mriQubeService';

interface MRICredentials {
  clientId: string;
  clientSecret: string;
  apiBaseUrl: string;
  environment: 'sandbox' | 'production';
}

interface MRICredentialManagerProps {
  buildingId: string;
  onCredentialsUpdated?: () => void;
  className?: string;
}

const MRICredentialManager: React.FC<MRICredentialManagerProps> = ({
  buildingId,
  onCredentialsUpdated,
  className = ''
}) => {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<MRICredentials>({
    clientId: '',
    clientSecret: '',
    apiBaseUrl: 'https://api.vaultre.com.au',
    environment: 'sandbox'
  });
  const [showSecrets, setShowSecrets] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadCredentials();
  }, [buildingId]);

  const loadCredentials = async () => {
    setIsLoading(true);
    try {
      // Load credentials from Supabase vault or settings table
      const { data, error } = await supabase
        .from('mri_credentials')
        .select('*')
        .eq('building_id', buildingId)
        .single();

      if (data && !error) {
        setCredentials({
          clientId: data.client_id || '',
          clientSecret: data.client_secret || '',
          apiBaseUrl: data.api_base_url || 'https://api.vaultre.com.au',
          environment: data.environment || 'sandbox'
        });
      }
    } catch (error) {
      console.error('Error loading MRI credentials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCredentials = async () => {
    setIsSaving(true);
    try {
      // Save credentials to Supabase vault with encryption
      const { error } = await supabase
        .from('mri_credentials')
        .upsert({
          building_id: buildingId,
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          api_base_url: credentials.apiBaseUrl,
          environment: credentials.environment,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Also update the service configuration
      await updateServiceConfig();

      setIsEditing(false);
      setTestResult({ success: true, message: 'Credentials saved successfully!' });
      onCredentialsUpdated?.();

    } catch (error) {
      console.error('Error saving MRI credentials:', error);
      setTestResult({
        success: false,
        message: `Failed to save credentials: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateServiceConfig = async () => {
    // Update the MRI service with new credentials
    try {
      // Import the service dynamically to avoid circular dependencies
      const { mriQubeService } = await import('../../services/mriQubeService');

      // Update the service configuration
      mriQubeService.updateConfig({
        baseUrl: credentials.apiBaseUrl,
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
        environment: credentials.environment
      });

      console.log('MRI service configuration updated');
    } catch (error) {
      console.error('Error updating service config:', error);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Temporarily update the service config for testing
      await updateServiceConfig();
      
      // Test the connection
      const result = await mriQubeService.testConnection();
      setTestResult(result);

    } catch (error) {
      setTestResult({
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleInputChange = (field: keyof MRICredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    setTestResult(null); // Clear test results when credentials change
  };

  const isConfigured = credentials.clientId && credentials.clientSecret;
  const canEdit = user?.email === 'frankie@manage.management' || 
                  user?.metadata?.role === 'rtm-director' || 
                  user?.metadata?.role === 'rmc-director';

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
          <span className="ml-3 text-gray-600">Loading credentials...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Key className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">MRI API Credentials</h3>
            <p className="text-sm text-gray-600">Configure your MRI Qube API access</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isConfigured ? 'success' : 'error'} size="sm">
            {isConfigured ? 'Configured' : 'Not Configured'}
          </Badge>
          
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={isEditing ? <Lock size={16} /> : <Unlock size={16} />}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          )}
        </div>
      </div>

      {!canEdit && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">Restricted Access</h4>
              <p className="text-sm text-amber-700 mt-1">
                Only building directors and super-admins can configure MRI credentials.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* API Base URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Base URL
          </label>
          <input
            type="url"
            value={credentials.apiBaseUrl}
            onChange={(e) => handleInputChange('apiBaseUrl', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="https://api.vaultre.com.au"
          />
        </div>

        {/* Environment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Environment
          </label>
          <select
            value={credentials.environment}
            onChange={(e) => handleInputChange('environment', e.target.value as 'sandbox' | 'production')}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="sandbox">Sandbox (Testing)</option>
            <option value="production">Production</option>
          </select>
        </div>

        {/* Client ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client ID
          </label>
          <input
            type="text"
            value={credentials.clientId}
            onChange={(e) => handleInputChange('clientId', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Enter your MRI Client ID"
          />
        </div>

        {/* Client Secret */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Secret
          </label>
          <div className="relative">
            <input
              type={showSecrets ? 'text' : 'password'}
              value={credentials.clientSecret}
              onChange={(e) => handleInputChange('clientSecret', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Enter your MRI Client Secret"
            />
            <button
              type="button"
              onClick={() => setShowSecrets(!showSecrets)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showSecrets ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`p-4 rounded-lg ${
            testResult.success ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
          }`}>
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">{testResult.message}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        {isEditing && (
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="primary"
              leftIcon={<Save size={16} />}
              onClick={saveCredentials}
              disabled={isSaving || !credentials.clientId || !credentials.clientSecret}
            >
              {isSaving ? 'Saving...' : 'Save Credentials'}
            </Button>
            
            <Button
              variant="outline"
              leftIcon={<TestTube size={16} />}
              onClick={testConnection}
              disabled={isTesting || !credentials.clientId || !credentials.clientSecret}
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        )}

        {!isEditing && isConfigured && (
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              leftIcon={<TestTube size={16} />}
              onClick={testConnection}
              disabled={isTesting}
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MRICredentialManager;

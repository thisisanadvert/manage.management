/**
 * MRI Integration Settings Page
 * Comprehensive settings page for MRI Qube integration configuration
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Key,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Save,
  TestTube,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { getUserBuildingId } from '../utils/buildingUtils';
import MRIConnectionStatus from '../components/mri/MRIConnectionStatus';
import MRISyncDashboard from '../components/mri/MRISyncDashboard';
import MRIConfigurationModal from '../components/mri/MRIConfigurationModal';
import MRICredentialManager from '../components/mri/MRICredentialManager';
import { mriQubeService } from '../services/mriQubeService';
import { mriSyncService } from '../services/mriSyncService';

const MRIIntegrationSettings: React.FC = () => {
  const { user } = useAuth();
  const [buildingId, setBuildingId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sync' | 'security' | 'advanced'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Database },
    { id: 'sync', label: 'Sync Settings', icon: RefreshCw },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'advanced', label: 'Advanced', icon: Settings }
  ];

  useEffect(() => {
    loadBuildingId();
  }, [user]);

  const loadBuildingId = async () => {
    if (user) {
      try {
        const id = await getUserBuildingId(user);
        if (id) {
          setBuildingId(id);
        }
      } catch (error) {
        console.error('Error loading building ID:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleConfigurationSaved = () => {
    // Refresh the page data after configuration is saved
    window.location.reload();
  };

  const handleCredentialsUpdated = async () => {
    // Reload MRI service configuration from database
    await mriQubeService.loadConfigFromDatabase(buildingId);
    // Refresh the page data
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
          <span className="text-gray-600">Loading MRI settings...</span>
        </div>
      </div>
    );
  }

  if (!buildingId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Building Access</h2>
          <p className="text-gray-600">
            You need to be associated with a building to configure MRI integration settings.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Database className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MRI Qube Integration</h1>
              <p className="text-gray-600">Configure and manage your property management system integration</p>
            </div>
          </div>
          
          {/* Quick Status */}
          <div className="flex items-center gap-4 mt-4">
            <MRIConnectionStatus showDetails={false} />
            <Badge variant={mriQubeService.isConfigured() ? 'success' : 'error'} size="sm">
              {mriQubeService.isConfigured() ? 'Configured' : 'Not Configured'}
            </Badge>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* API Credentials */}
              <MRICredentialManager
                buildingId={buildingId}
                onCredentialsUpdated={handleCredentialsUpdated}
              />

              {/* Connection Status */}
              <MRIConnectionStatus
                showDetails={true}
                onConfigureClick={() => setShowConfigModal(true)}
              />

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start"
                    leftIcon={<Settings size={16} />}
                    onClick={() => setShowConfigModal(true)}
                  >
                    Configure Integration
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    leftIcon={<RefreshCw size={16} />}
                    onClick={() => setActiveTab('sync')}
                  >
                    Sync Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    leftIcon={<TestTube size={16} />}
                    onClick={async () => {
                      const result = await mriQubeService.testConnection();
                      alert(result.message);
                    }}
                  >
                    Test Connection
                  </Button>
                </div>
              </Card>

              {/* Integration Status */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">API Credentials</span>
                    </div>
                    <Badge variant={mriQubeService.isConfigured() ? 'success' : 'error'} size="sm">
                      {mriQubeService.isConfigured() ? 'Configured' : 'Missing'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">Database Schema</span>
                    </div>
                    <Badge variant="success" size="sm">Ready</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">Security Policies</span>
                    </div>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                </div>
              </Card>
            </>
          )}

          {activeTab === 'sync' && (
            <MRISyncDashboard
              buildingId={buildingId}
              onConfigureClick={() => setShowConfigModal(true)}
            />
          )}

          {activeTab === 'security' && (
            <>
              {/* Security Overview */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Compliance</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-success-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-success-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-success-800">OAuth 2.0 Authentication</h4>
                      <p className="text-sm text-success-700 mt-1">
                        Secure token-based authentication with automatic refresh
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-success-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-success-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-success-800">Row Level Security</h4>
                      <p className="text-sm text-success-700 mt-1">
                        Building-based access control with role-based permissions
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-success-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-success-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-success-800">Audit Logging</h4>
                      <p className="text-sm text-success-700 mt-1">
                        Complete audit trail of all MRI data changes and API calls
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-success-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-success-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-success-800">Data Encryption</h4>
                      <p className="text-sm text-success-700 mt-1">
                        API credentials stored securely with encryption at rest
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* API Credentials */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">API Credentials</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={showCredentials ? <EyeOff size={16} /> : <Eye size={16} />}
                    onClick={() => setShowCredentials(!showCredentials)}
                  >
                    {showCredentials ? 'Hide' : 'Show'} Credentials
                  </Button>
                </div>
                
                {showCredentials ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client ID
                      </label>
                      <div className="font-mono text-sm bg-gray-50 p-3 rounded border">
                        {import.meta.env.VITE_MRI_CLIENT_ID || 'Not configured'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Environment
                      </label>
                      <div className="font-mono text-sm bg-gray-50 p-3 rounded border">
                        {import.meta.env.VITE_MRI_ENVIRONMENT || 'sandbox'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Base URL
                      </label>
                      <div className="font-mono text-sm bg-gray-50 p-3 rounded border">
                        {import.meta.env.VITE_MRI_API_BASE_URL || 'https://api.vaultre.com.au'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Key className="h-8 w-8 mx-auto mb-2" />
                    <p>Click "Show Credentials" to view API configuration</p>
                  </div>
                )}
              </Card>
            </>
          )}

          {activeTab === 'advanced' && (
            <>
              {/* Rate Limiting */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Limiting & Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">60</p>
                    <p className="text-sm text-gray-600">Requests per minute</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">1000</p>
                    <p className="text-sm text-gray-600">Requests per hour</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">3</p>
                    <p className="text-sm text-gray-600">Max retries</p>
                  </div>
                </div>
              </Card>

              {/* Data Mapping */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Mapping Configuration</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Automatic Field Mapping</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        MRI Qube fields are automatically mapped to our database schema. 
                        Custom field mapping will be available in a future update.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Troubleshooting */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Troubleshooting</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw size={16} className="mr-2" />
                    Clear API Token Cache
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database size={16} className="mr-2" />
                    Reset Sync Status
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TestTube size={16} className="mr-2" />
                    Run Connection Diagnostics
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Configuration Modal */}
      <MRIConfigurationModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        buildingId={buildingId}
        onConfigurationSaved={handleConfigurationSaved}
      />
    </div>
  );
};

export default MRIIntegrationSettings;

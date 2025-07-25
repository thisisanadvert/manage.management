/**
 * MRI Sync Dashboard Component
 * Displays sync status, controls, and history for MRI Qube integration
 */

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  Settings,
  Download,
  Upload,
  Database,
  TrendingUp,
  Calendar
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { mriSyncService } from '../../services/mriSyncService';
import { MRISyncStatus, MRISyncError } from '../../types/mri';

interface MRISyncDashboardProps {
  buildingId: string;
  onConfigureClick?: () => void;
}

const MRISyncDashboard: React.FC<MRISyncDashboardProps> = ({
  buildingId,
  onConfigureClick
}) => {
  const { user } = useAuth();
  const [syncStatuses, setSyncStatuses] = useState<MRISyncStatus[]>([]);
  const [syncErrors, setSyncErrors] = useState<MRISyncError[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('all');

  const entityTypes = [
    { key: 'all', label: 'All Data', icon: Database },
    { key: 'properties', label: 'Properties', icon: Database },
    { key: 'transactions', label: 'Transactions', icon: TrendingUp },
    { key: 'budgets', label: 'Budgets', icon: Calendar },
    { key: 'invoices', label: 'Invoices', icon: Upload },
    { key: 'maintenance', label: 'Maintenance', icon: Settings },
    { key: 'documents', label: 'Documents', icon: Download }
  ];

  useEffect(() => {
    loadSyncData();
  }, [buildingId]);

  const loadSyncData = async () => {
    setIsLoading(true);
    try {
      const [statuses, errors] = await Promise.all([
        mriSyncService.getSyncStatus(buildingId),
        mriSyncService.getSyncErrors(buildingId, false)
      ]);
      
      setSyncStatuses(statuses);
      setSyncErrors(errors);
    } catch (error) {
      console.error('Error loading sync data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async (entityType: string = 'all') => {
    setIsSyncing(true);
    try {
      if (entityType === 'all') {
        await mriSyncService.syncBuilding(buildingId);
      } else {
        // Sync specific entity type
        switch (entityType) {
          case 'properties':
            await mriSyncService.syncProperties(buildingId);
            break;
          case 'transactions':
            await mriSyncService.syncTransactions(buildingId);
            break;
          // Add other entity types as needed
        }
      }
      
      // Reload sync data after sync completes
      await loadSyncData();
    } catch (error) {
      console.error('Error during manual sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-success-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-error-600" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-primary-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="success" size="sm">Success</Badge>;
      case 'error':
        return <Badge variant="error" size="sm">Error</Badge>;
      case 'in_progress':
        return <Badge variant="primary" size="sm">In Progress</Badge>;
      default:
        return <Badge variant="gray" size="sm">Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const filteredStatuses = selectedEntityType === 'all' 
    ? syncStatuses 
    : syncStatuses.filter(status => status.entityType === selectedEntityType);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading sync status...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">MRI Qube Sync Status</h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitor and control data synchronisation with MRI Qube
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={16} />}
            onClick={loadSyncData}
            disabled={isLoading}
          >
            Refresh
          </Button>
          
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
          
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Play size={16} />}
            onClick={() => handleManualSync(selectedEntityType)}
            disabled={isSyncing}
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </div>

      {/* Entity Type Filter */}
      <div className="flex flex-wrap gap-2">
        {entityTypes.map((entityType) => {
          const Icon = entityType.icon;
          const isSelected = selectedEntityType === entityType.key;
          
          return (
            <button
              key={entityType.key}
              onClick={() => setSelectedEntityType(entityType.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon size={16} />
              {entityType.label}
            </button>
          );
        })}
      </div>

      {/* Sync Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStatuses.map((status) => (
          <Card key={`${status.entityType}-${status.id}`} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.status)}
                <h3 className="font-medium text-gray-900 capitalize">
                  {status.entityType}
                </h3>
              </div>
              {getStatusBadge(status.status)}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Last Sync:</span>
                <span className="text-gray-900">{formatDate(status.lastSyncDate)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Next Sync:</span>
                <span className="text-gray-900">{formatDate(status.nextSyncDate)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Records:</span>
                <span className="text-gray-900">
                  {status.recordsProcessed} processed
                </span>
              </div>
              
              {status.syncDuration && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-gray-900">{formatDuration(status.syncDuration)}</span>
                </div>
              )}
              
              {status.errorMessage && (
                <div className="mt-2 p-2 bg-error-50 rounded text-xs text-error-700">
                  {status.errorMessage}
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Created: {status.recordsCreated}</span>
                <span>Updated: {status.recordsUpdated}</span>
                <span>Skipped: {status.recordsSkipped}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Error Summary */}
      {syncErrors.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-error-600" />
            <h3 className="font-medium text-gray-900">Recent Sync Errors</h3>
            <Badge variant="error" size="sm">{syncErrors.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {syncErrors.slice(0, 5).map((error) => (
              <div key={error.id} className="flex items-start gap-3 p-3 bg-error-50 rounded-lg">
                <XCircle className="h-4 w-4 text-error-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-error-800 capitalize">
                      {error.entityType}
                    </span>
                    <Badge variant="error" size="xs">{error.errorType}</Badge>
                  </div>
                  <p className="text-sm text-error-700">{error.errorMessage}</p>
                  <p className="text-xs text-error-600 mt-1">
                    Entity ID: {error.entityId} • {formatDate(error.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            
            {syncErrors.length > 5 && (
              <div className="text-center">
                <Button variant="outline" size="sm">
                  View All Errors ({syncErrors.length})
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {filteredStatuses.length === 0 && (
        <Card className="p-8 text-center">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sync Data</h3>
          <p className="text-gray-600 mb-4">
            No synchronisation data found for this building. Start by configuring the MRI integration.
          </p>
          {onConfigureClick && (
            <Button
              variant="primary"
              leftIcon={<Settings size={16} />}
              onClick={onConfigureClick}
            >
              Configure MRI Integration
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default MRISyncDashboard;

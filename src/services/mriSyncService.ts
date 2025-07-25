/**
 * MRI Qube Synchronization Service
 * Handles scheduled synchronization of data between MRI Qube and our platform
 */

import { supabase } from '../lib/supabase';
import { mriQubeService } from './mriQubeService';
import {
  MRIProperty,
  MRIUnit,
  MRITenancy,
  MRIContact,
  MRITransaction,
  MRIBudget,
  MRIInvoice,
  MRIWorkOrder,
  MRIDocument,
  MRISyncStatus,
  MRISyncConfig,
  MRISyncError
} from '../types/mri';

interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsUpdated: number;
  recordsCreated: number;
  recordsSkipped: number;
  errors: string[];
  duration: number;
}

interface ConflictResolution {
  strategy: 'mri_wins' | 'local_wins' | 'merge' | 'manual';
  field?: string;
  resolution?: any;
}

class MRISyncService {
  private isRunning = false;
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();

  // ============================================================================
  // Sync Configuration Management
  // ============================================================================

  public async getSyncConfig(buildingId: string): Promise<MRISyncConfig | null> {
    try {
      const { data, error } = await supabase
        .from('mri_sync_configs')
        .select('*')
        .eq('building_id', buildingId)
        .single();

      if (error) {
        console.warn('No MRI sync config found for building:', buildingId);
        return null;
      }

      return data as MRISyncConfig;
    } catch (error) {
      console.error('Error fetching MRI sync config:', error);
      return null;
    }
  }

  public async updateSyncConfig(
    buildingId: string,
    config: Partial<MRISyncConfig>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('mri_sync_configs')
        .upsert({
          building_id: buildingId,
          ...config,
          last_config_update: new Date().toISOString()
        });

      if (error) throw error;

      // Restart sync schedules for this building
      await this.restartSyncSchedules(buildingId);

      return { success: true };
    } catch (error) {
      console.error('Error updating MRI sync config:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ============================================================================
  // Sync Status Management
  // ============================================================================

  public async getSyncStatus(buildingId: string): Promise<MRISyncStatus[]> {
    try {
      const { data, error } = await supabase
        .from('mri_sync_status')
        .select('*')
        .eq('building_id', buildingId)
        .order('last_sync_date', { ascending: false });

      if (error) throw error;
      return data as MRISyncStatus[];
    } catch (error) {
      console.error('Error fetching MRI sync status:', error);
      return [];
    }
  }

  private async updateSyncStatus(
    buildingId: string,
    entityType: string,
    result: SyncResult
  ): Promise<void> {
    try {
      const status: Partial<MRISyncStatus> = {
        building_id: buildingId,
        entity_type: entityType as any,
        last_sync_date: new Date().toISOString(),
        status: result.success ? 'success' : 'error',
        records_processed: result.recordsProcessed,
        records_updated: result.recordsUpdated,
        records_created: result.recordsCreated,
        records_skipped: result.recordsSkipped,
        error_message: result.errors.length > 0 ? result.errors.join('; ') : null,
        sync_duration: result.duration
      };

      // Calculate next sync date based on frequency
      const config = await this.getSyncConfig(buildingId);
      if (config) {
        const frequency = config.syncFrequency[entityType as keyof typeof config.syncFrequency];
        status.next_sync_date = this.calculateNextSyncDate(frequency).toISOString();
      }

      const { error } = await supabase
        .from('mri_sync_status')
        .upsert(status);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  }

  private calculateNextSyncDate(frequency: string): Date {
    const now = new Date();
    switch (frequency) {
      case 'realtime':
        return new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to daily
    }
  }

  // ============================================================================
  // Error Management
  // ============================================================================

  private async logSyncError(
    buildingId: string,
    entityType: string,
    entityId: string,
    errorType: string,
    errorMessage: string,
    errorDetails?: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('mri_sync_errors')
        .insert({
          building_id: buildingId,
          entity_type: entityType,
          entity_id: entityId,
          error_type: errorType,
          error_message: errorMessage,
          error_details: errorDetails
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging sync error:', error);
    }
  }

  public async getSyncErrors(buildingId: string, resolved: boolean = false): Promise<MRISyncError[]> {
    try {
      const { data, error } = await supabase
        .from('mri_sync_errors')
        .select('*')
        .eq('building_id', buildingId)
        .eq('resolved', resolved)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MRISyncError[];
    } catch (error) {
      console.error('Error fetching sync errors:', error);
      return [];
    }
  }

  // ============================================================================
  // Manual Sync Operations
  // ============================================================================

  public async syncProperties(buildingId: string): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      recordsProcessed: 0,
      recordsUpdated: 0,
      recordsCreated: 0,
      recordsSkipped: 0,
      errors: [],
      duration: 0
    };

    try {
      const config = await this.getSyncConfig(buildingId);
      if (!config || !config.is_enabled) {
        result.errors.push('MRI sync not configured or disabled for this building');
        result.success = false;
        return result;
      }

      // Fetch properties from MRI
      const propertiesResponse = await mriQubeService.getProperties();
      if (!propertiesResponse.success || !propertiesResponse.data) {
        result.errors.push(`Failed to fetch properties: ${propertiesResponse.error}`);
        result.success = false;
        return result;
      }

      const properties = propertiesResponse.data;
      result.recordsProcessed = properties.length;

      for (const property of properties) {
        try {
          // Check if property already exists
          const { data: existingProperty } = await supabase
            .from('mri_properties')
            .select('id, mri_last_modified')
            .eq('id', property.id)
            .eq('building_id', buildingId)
            .single();

          const propertyData = {
            id: property.id,
            building_id: buildingId,
            name: property.name,
            address: property.address,
            property_type: property.propertyType,
            total_units: property.totalUnits,
            management_type: property.managementType,
            status: property.status,
            portfolio: property.portfolio,
            manager: property.manager,
            mri_created_date: property.createdDate,
            mri_last_modified: property.lastModified,
            synced_at: new Date().toISOString()
          };

          if (existingProperty) {
            // Check if update is needed
            if (new Date(property.lastModified) > new Date(existingProperty.mri_last_modified)) {
              const { error } = await supabase
                .from('mri_properties')
                .update(propertyData)
                .eq('id', property.id)
                .eq('building_id', buildingId);

              if (error) throw error;
              result.recordsUpdated++;
            } else {
              result.recordsSkipped++;
            }
          } else {
            // Create new property
            const { error } = await supabase
              .from('mri_properties')
              .insert(propertyData);

            if (error) throw error;
            result.recordsCreated++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Property ${property.id}: ${errorMessage}`);
          await this.logSyncError(buildingId, 'properties', property.id, 'database', errorMessage);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Sync failed: ${errorMessage}`);
      result.success = false;
    }

    result.duration = Date.now() - startTime;
    await this.updateSyncStatus(buildingId, 'properties', result);
    return result;
  }

  public async syncTransactions(buildingId: string, startDate?: string, endDate?: string): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      recordsProcessed: 0,
      recordsUpdated: 0,
      recordsCreated: 0,
      recordsSkipped: 0,
      errors: [],
      duration: 0
    };

    try {
      const config = await this.getSyncConfig(buildingId);
      if (!config || !config.is_enabled) {
        result.errors.push('MRI sync not configured or disabled for this building');
        result.success = false;
        return result;
      }

      // Get MRI property ID for this building
      const { data: mriProperty } = await supabase
        .from('mri_properties')
        .select('id')
        .eq('building_id', buildingId)
        .single();

      if (!mriProperty) {
        result.errors.push('No MRI property found for this building');
        result.success = false;
        return result;
      }

      // Fetch transactions from MRI
      const transactionsResponse = await mriQubeService.getTransactions(
        mriProperty.id,
        startDate,
        endDate
      );

      if (!transactionsResponse.success || !transactionsResponse.data) {
        result.errors.push(`Failed to fetch transactions: ${transactionsResponse.error}`);
        result.success = false;
        return result;
      }

      const transactions = transactionsResponse.data;
      result.recordsProcessed = transactions.length;

      for (const transaction of transactions) {
        try {
          // Check if transaction already exists
          const { data: existingTransaction } = await supabase
            .from('mri_transactions')
            .select('id, mri_last_modified')
            .eq('id', transaction.id)
            .eq('building_id', buildingId)
            .single();

          const transactionData = {
            id: transaction.id,
            mri_property_id: transaction.propertyId,
            mri_unit_id: transaction.unitId,
            mri_tenancy_id: transaction.tenancyId,
            building_id: buildingId,
            transaction_type: transaction.type,
            category: transaction.category,
            description: transaction.description,
            amount: transaction.amount,
            currency: transaction.currency,
            transaction_date: transaction.transactionDate,
            due_date: transaction.dueDate,
            status: transaction.status,
            reference: transaction.reference,
            payment_method: transaction.paymentMethod,
            mri_created_date: transaction.createdDate,
            mri_last_modified: transaction.lastModified,
            synced_at: new Date().toISOString()
          };

          if (existingTransaction) {
            // Check if update is needed
            if (new Date(transaction.lastModified) > new Date(existingTransaction.mri_last_modified)) {
              const { error } = await supabase
                .from('mri_transactions')
                .update(transactionData)
                .eq('id', transaction.id)
                .eq('building_id', buildingId);

              if (error) throw error;
              result.recordsUpdated++;
            } else {
              result.recordsSkipped++;
            }
          } else {
            // Create new transaction
            const { error } = await supabase
              .from('mri_transactions')
              .insert(transactionData);

            if (error) throw error;
            result.recordsCreated++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Transaction ${transaction.id}: ${errorMessage}`);
          await this.logSyncError(buildingId, 'transactions', transaction.id, 'database', errorMessage);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Sync failed: ${errorMessage}`);
      result.success = false;
    }

    result.duration = Date.now() - startTime;
    await this.updateSyncStatus(buildingId, 'transactions', result);
    return result;
  }

  // ============================================================================
  // Full Building Sync
  // ============================================================================

  public async syncBuilding(buildingId: string): Promise<{ [key: string]: SyncResult }> {
    const results: { [key: string]: SyncResult } = {};

    console.log(`Starting full MRI sync for building: ${buildingId}`);

    // Sync in order of dependencies
    results.properties = await this.syncProperties(buildingId);
    
    if (results.properties.success) {
      // Only continue if properties sync succeeded
      results.units = await this.syncUnits(buildingId);
      results.tenancies = await this.syncTenancies(buildingId);
      results.contacts = await this.syncContacts(buildingId);
      results.transactions = await this.syncTransactions(buildingId);
      results.budgets = await this.syncBudgets(buildingId);
      results.invoices = await this.syncInvoices(buildingId);
      results.maintenance = await this.syncMaintenance(buildingId);
      results.documents = await this.syncDocuments(buildingId);
    }

    console.log(`Completed full MRI sync for building: ${buildingId}`, results);
    return results;
  }

  // ============================================================================
  // Placeholder methods for other entity types
  // ============================================================================

  private async syncUnits(buildingId: string): Promise<SyncResult> {
    // Implementation similar to syncProperties but for units
    return { success: true, recordsProcessed: 0, recordsUpdated: 0, recordsCreated: 0, recordsSkipped: 0, errors: [], duration: 0 };
  }

  private async syncTenancies(buildingId: string): Promise<SyncResult> {
    // Implementation for tenancies
    return { success: true, recordsProcessed: 0, recordsUpdated: 0, recordsCreated: 0, recordsSkipped: 0, errors: [], duration: 0 };
  }

  private async syncContacts(buildingId: string): Promise<SyncResult> {
    // Implementation for contacts
    return { success: true, recordsProcessed: 0, recordsUpdated: 0, recordsCreated: 0, recordsSkipped: 0, errors: [], duration: 0 };
  }

  private async syncBudgets(buildingId: string): Promise<SyncResult> {
    // Implementation for budgets
    return { success: true, recordsProcessed: 0, recordsUpdated: 0, recordsCreated: 0, recordsSkipped: 0, errors: [], duration: 0 };
  }

  private async syncInvoices(buildingId: string): Promise<SyncResult> {
    // Implementation for invoices
    return { success: true, recordsProcessed: 0, recordsUpdated: 0, recordsCreated: 0, recordsSkipped: 0, errors: [], duration: 0 };
  }

  private async syncMaintenance(buildingId: string): Promise<SyncResult> {
    // Implementation for maintenance
    return { success: true, recordsProcessed: 0, recordsUpdated: 0, recordsCreated: 0, recordsSkipped: 0, errors: [], duration: 0 };
  }

  private async syncDocuments(buildingId: string): Promise<SyncResult> {
    // Implementation for documents
    return { success: true, recordsProcessed: 0, recordsUpdated: 0, recordsCreated: 0, recordsSkipped: 0, errors: [], duration: 0 };
  }

  // ============================================================================
  // Scheduled Sync Management
  // ============================================================================

  private async restartSyncSchedules(buildingId: string): Promise<void> {
    // Clear existing intervals for this building
    const intervalKey = `sync_${buildingId}`;
    if (this.syncIntervals.has(intervalKey)) {
      clearInterval(this.syncIntervals.get(intervalKey)!);
      this.syncIntervals.delete(intervalKey);
    }

    // Start new scheduled syncs based on configuration
    const config = await this.getSyncConfig(buildingId);
    if (config && config.is_enabled) {
      // This would typically be handled by a background job service
      console.log(`Sync schedules updated for building: ${buildingId}`);
    }
  }
}

// Export singleton instance
export const mriSyncService = new MRISyncService();
export default mriSyncService;

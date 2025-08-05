/**
 * Attio CRM Integration Service
 * Handles synchronization of leads and user data with Attio CRM
 */

import { supabase } from '../lib/supabase';

export interface AttioSyncLog {
  id: string;
  email: string;
  attio_person_id?: string;
  attio_company_id?: string;
  source: 'rtm-qualify' | 'signup' | 'manual' | 'interest-registration';
  sync_status: 'pending' | 'success' | 'failed' | 'retry';
  error_message?: string;
  qualification_data?: any;
  building_info?: {
    name?: string;
    address?: string;
    unit_number?: string;
    company_name?: string;
  };
  user_id?: string;
  building_id?: string;
  created_at: string;
  updated_at: string;
  retry_count: number;
  last_retry_at?: string;
}

export interface AttioSettings {
  id?: string;
  building_id: string;
  api_key_encrypted?: string;
  auto_sync_enabled: boolean;
  sync_on_signup: boolean;
  sync_on_qualification: boolean;
  default_person_tags: string[];
  default_company_category: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface SyncToAttioRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
  buildingName?: string;
  buildingAddress?: string;
  unitNumber?: string;
  companyName?: string;
  qualificationData?: any;
  source?: string;
}

class AttioService {
  
  /**
   * Manually sync a user to Attio CRM
   */
  async syncUserToAttio(userData: SyncToAttioRequest): Promise<{ success: boolean; error?: string; person_id?: string; company_id?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-to-attio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync to Attio');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error syncing to Attio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get Attio sync logs for a building
   */
  async getSyncLogs(buildingId?: string, limit: number = 50): Promise<{ data: AttioSyncLog[] | null; error: any }> {
    try {
      let query = supabase
        .from('attio_sync_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (buildingId) {
        query = query.eq('building_id', buildingId);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Error fetching Attio sync logs:', error);
      return { data: null, error };
    }
  }

  /**
   * Get sync logs for a specific email
   */
  async getSyncLogsByEmail(email: string): Promise<{ data: AttioSyncLog[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('attio_sync_log')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching sync logs by email:', error);
      return { data: null, error };
    }
  }

  /**
   * Retry failed sync
   */
  async retrySyncToAttio(syncLogId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the original sync log
      const { data: syncLog, error: fetchError } = await supabase
        .from('attio_sync_log')
        .select('*')
        .eq('id', syncLogId)
        .single();

      if (fetchError || !syncLog) {
        throw new Error('Sync log not found');
      }

      // Prepare retry data
      const retryData: SyncToAttioRequest = {
        email: syncLog.email,
        firstName: syncLog.building_info?.name?.split(' ')[0] || 'Unknown',
        lastName: syncLog.building_info?.name?.split(' ').slice(1).join(' ') || '',
        phone: syncLog.qualification_data?.contactInfo?.phone,
        role: syncLog.qualification_data?.contactInfo?.role,
        buildingName: syncLog.building_info?.name,
        buildingAddress: syncLog.building_info?.address,
        unitNumber: syncLog.building_info?.unit_number,
        companyName: syncLog.building_info?.company_name,
        qualificationData: syncLog.qualification_data,
        source: `${syncLog.source}-retry`
      };

      // Update retry count
      await supabase
        .from('attio_sync_log')
        .update({
          retry_count: (syncLog.retry_count || 0) + 1,
          last_retry_at: new Date().toISOString(),
          sync_status: 'retry'
        })
        .eq('id', syncLogId);

      // Attempt sync
      const result = await this.syncUserToAttio(retryData);
      
      // Update sync log with result
      await supabase
        .from('attio_sync_log')
        .update({
          sync_status: result.success ? 'success' : 'failed',
          error_message: result.error,
          attio_person_id: result.person_id,
          attio_company_id: result.company_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', syncLogId);

      return result;
    } catch (error) {
      console.error('Error retrying sync to Attio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get Attio settings for a building
   */
  async getAttioSettings(buildingId: string): Promise<{ data: AttioSettings | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('attio_settings')
        .select('*')
        .eq('building_id', buildingId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching Attio settings:', error);
      return { data: null, error };
    }
  }

  /**
   * Update Attio settings for a building
   */
  async updateAttioSettings(buildingId: string, settings: Partial<AttioSettings>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('attio_settings')
        .upsert({
          building_id: buildingId,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error updating Attio settings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test Attio connection
   */
  async testAttioConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test with a minimal sync request
      const testData: SyncToAttioRequest = {
        email: 'test@manage.management',
        firstName: 'Test',
        lastName: 'Connection',
        source: 'connection-test'
      };

      const result = await this.syncUserToAttio(testData);
      return result;
    } catch (error) {
      console.error('Error testing Attio connection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStatistics(buildingId?: string): Promise<{
    total: number;
    successful: number;
    failed: number;
    pending: number;
    last_sync?: string;
  }> {
    try {
      let query = supabase
        .from('attio_sync_log')
        .select('sync_status, created_at');

      if (buildingId) {
        query = query.eq('building_id', buildingId);
      }

      const { data, error } = await query;

      if (error || !data) {
        return { total: 0, successful: 0, failed: 0, pending: 0 };
      }

      const stats = data.reduce((acc, log) => {
        acc.total++;
        switch (log.sync_status) {
          case 'success':
            acc.successful++;
            break;
          case 'failed':
            acc.failed++;
            break;
          case 'pending':
          case 'retry':
            acc.pending++;
            break;
        }
        return acc;
      }, { total: 0, successful: 0, failed: 0, pending: 0 });

      // Get last sync date
      const lastSync = data.length > 0 ? 
        data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at :
        undefined;

      return { ...stats, last_sync: lastSync };
    } catch (error) {
      console.error('Error getting sync statistics:', error);
      return { total: 0, successful: 0, failed: 0, pending: 0 };
    }
  }
}

export const attioService = new AttioService();

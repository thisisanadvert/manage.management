/**
 * MRI Qube Integration Test Suite
 * Comprehensive tests for MRI Qube API integration and synchronization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mriQubeService } from '../services/mriQubeService';
import { mriSyncService } from '../services/mriSyncService';
import { supabase } from '../lib/supabase';

// Mock environment variables
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            limit: vi.fn()
          }))
        })),
        insert: vi.fn(),
        update: vi.fn(() => ({
          eq: vi.fn()
        })),
        upsert: vi.fn()
      }))
    }))
  }
}));

// Mock fetch for API calls
global.fetch = vi.fn();

describe('MRI Qube Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up environment variables
    import.meta.env.VITE_MRI_CLIENT_ID = 'test_client_id';
    import.meta.env.VITE_MRI_CLIENT_SECRET = 'test_client_secret';
    import.meta.env.VITE_MRI_API_BASE_URL = 'https://api.test.vaultre.com.au';
    import.meta.env.VITE_MRI_ENVIRONMENT = 'sandbox';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Configuration', () => {
    it('should validate configuration correctly', () => {
      expect(mriQubeService.isConfigured()).toBe(true);
    });

    it('should handle missing credentials', () => {
      import.meta.env.VITE_MRI_CLIENT_ID = '';
      import.meta.env.VITE_MRI_CLIENT_SECRET = '';
      
      expect(mriQubeService.isConfigured()).toBe(false);
    });
  });

  describe('Authentication', () => {
    it('should authenticate successfully with valid credentials', async () => {
      const mockTokenResponse = {
        access_token: 'test_access_token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'read write'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse)
      });

      const mockSupabaseResponse = { error: null };
      (supabase.from as any)().upsert.mockResolvedValue(mockSupabaseResponse);

      const result = await mriQubeService.testConnection();
      
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.vaultre.com.au/oauth/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded'
          })
        })
      );
    });

    it('should handle authentication failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      const result = await mriQubeService.testConnection();
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Connection failed');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await mriQubeService.testConnection();
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Connection test failed');
    });
  });

  describe('API Requests', () => {
    beforeEach(() => {
      // Mock successful authentication
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            access_token: 'test_token',
            token_type: 'Bearer',
            expires_in: 3600
          })
        });
    });

    it('should fetch properties successfully', async () => {
      const mockProperties = [
        {
          id: 'prop_1',
          name: 'Test Building',
          address: {
            line1: '123 Test Street',
            city: 'London',
            postcode: 'SW1A 1AA',
            country: 'UK'
          },
          propertyType: 'residential',
          totalUnits: 10,
          status: 'active'
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProperties)
      });

      const result = await mriQubeService.getProperties();
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProperties);
    });

    it('should handle API rate limiting', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          status: 429,
          headers: new Map([['Retry-After', '60']])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        });

      const result = await mriQubeService.getProperties();
      
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(3); // Auth + 2 property requests
    });

    it('should retry on token expiration', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          status: 401
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            access_token: 'new_token',
            token_type: 'Bearer',
            expires_in: 3600
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        });

      const result = await mriQubeService.getProperties();
      
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(4); // Auth + 401 + Re-auth + Retry
    });
  });
});

describe('MRI Sync Service', () => {
  const mockBuildingId = 'building_123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sync Configuration', () => {
    it('should get sync configuration', async () => {
      const mockConfig = {
        id: 'config_1',
        building_id: mockBuildingId,
        mri_property_id: 'prop_1',
        is_enabled: true,
        sync_frequency: {
          properties: 'daily',
          transactions: 'hourly'
        }
      };

      (supabase.from as any)().select().eq().single.mockResolvedValue({
        data: mockConfig,
        error: null
      });

      const result = await mriSyncService.getSyncConfig(mockBuildingId);
      
      expect(result).toEqual(mockConfig);
      expect(supabase.from).toHaveBeenCalledWith('mri_sync_configs');
    });

    it('should handle missing sync configuration', async () => {
      (supabase.from as any)().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'No rows returned' }
      });

      const result = await mriSyncService.getSyncConfig(mockBuildingId);
      
      expect(result).toBeNull();
    });

    it('should update sync configuration', async () => {
      const mockConfig = {
        mri_property_id: 'prop_1',
        is_enabled: true,
        sync_frequency: {
          properties: 'weekly',
          transactions: 'daily'
        }
      };

      (supabase.from as any)().upsert.mockResolvedValue({
        error: null
      });

      const result = await mriSyncService.updateSyncConfig(mockBuildingId, mockConfig);
      
      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('mri_sync_configs');
    });
  });

  describe('Sync Status', () => {
    it('should get sync status for building', async () => {
      const mockStatuses = [
        {
          id: 'status_1',
          building_id: mockBuildingId,
          entity_type: 'properties',
          last_sync_date: '2024-01-25T10:00:00Z',
          status: 'success',
          records_processed: 5
        }
      ];

      (supabase.from as any)().select().eq().order.mockResolvedValue({
        data: mockStatuses,
        error: null
      });

      const result = await mriSyncService.getSyncStatus(mockBuildingId);
      
      expect(result).toEqual(mockStatuses);
      expect(supabase.from).toHaveBeenCalledWith('mri_sync_status');
    });

    it('should handle sync status errors', async () => {
      (supabase.from as any)().select().eq().order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await mriSyncService.getSyncStatus(mockBuildingId);
      
      expect(result).toEqual([]);
    });
  });

  describe('Property Synchronization', () => {
    it('should sync properties successfully', async () => {
      // Mock sync config
      (supabase.from as any)().select().eq().single
        .mockResolvedValueOnce({
          data: {
            building_id: mockBuildingId,
            mri_property_id: 'prop_1',
            is_enabled: true
          },
          error: null
        });

      // Mock MRI API response
      vi.spyOn(mriQubeService, 'getProperties').mockResolvedValue({
        success: true,
        data: [
          {
            id: 'prop_1',
            name: 'Test Building',
            address: {
              line1: '123 Test Street',
              city: 'London',
              postcode: 'SW1A 1AA',
              country: 'UK'
            },
            propertyType: 'residential',
            totalUnits: 10,
            managementType: 'rtm',
            status: 'active',
            createdDate: '2024-01-01T00:00:00Z',
            lastModified: '2024-01-25T10:00:00Z'
          }
        ]
      });

      // Mock database operations
      (supabase.from as any)().select().eq().single
        .mockResolvedValueOnce({ data: null, error: null }); // No existing property
      
      (supabase.from as any)().insert.mockResolvedValue({ error: null });
      (supabase.from as any)().upsert.mockResolvedValue({ error: null });

      const result = await mriSyncService.syncProperties(mockBuildingId);
      
      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBe(1);
      expect(result.recordsCreated).toBe(1);
      expect(result.recordsUpdated).toBe(0);
    });

    it('should handle sync configuration disabled', async () => {
      (supabase.from as any)().select().eq().single.mockResolvedValue({
        data: {
          building_id: mockBuildingId,
          is_enabled: false
        },
        error: null
      });

      const result = await mriSyncService.syncProperties(mockBuildingId);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('MRI sync not configured or disabled for this building');
    });

    it('should handle MRI API errors during sync', async () => {
      (supabase.from as any)().select().eq().single.mockResolvedValue({
        data: {
          building_id: mockBuildingId,
          mri_property_id: 'prop_1',
          is_enabled: true
        },
        error: null
      });

      vi.spyOn(mriQubeService, 'getProperties').mockResolvedValue({
        success: false,
        error: 'API connection failed'
      });

      const result = await mriSyncService.syncProperties(mockBuildingId);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Failed to fetch properties: API connection failed');
    });
  });

  describe('Error Handling', () => {
    it('should get sync errors for building', async () => {
      const mockErrors = [
        {
          id: 'error_1',
          building_id: mockBuildingId,
          entity_type: 'properties',
          entity_id: 'prop_1',
          error_type: 'validation',
          error_message: 'Invalid property data',
          resolved: false,
          created_at: '2024-01-25T10:00:00Z'
        }
      ];

      (supabase.from as any)().select().eq().order.mockResolvedValue({
        data: mockErrors,
        error: null
      });

      const result = await mriSyncService.getSyncErrors(mockBuildingId, false);
      
      expect(result).toEqual(mockErrors);
      expect(supabase.from).toHaveBeenCalledWith('mri_sync_errors');
    });
  });
});

describe('Integration Tests', () => {
  it('should perform full building sync workflow', async () => {
    const mockBuildingId = 'building_123';
    
    // Mock all required dependencies
    vi.spyOn(mriSyncService, 'getSyncConfig').mockResolvedValue({
      id: 'config_1',
      building_id: mockBuildingId,
      mri_property_id: 'prop_1',
      is_enabled: true,
      sync_frequency: {
        properties: 'daily',
        tenancies: 'daily',
        transactions: 'hourly',
        budgets: 'weekly',
        invoices: 'hourly',
        maintenance: 'daily',
        documents: 'weekly'
      },
      last_config_update: '2024-01-25T10:00:00Z',
      created_by: 'user_1',
      created_date: '2024-01-01T00:00:00Z'
    });

    vi.spyOn(mriSyncService, 'syncProperties').mockResolvedValue({
      success: true,
      recordsProcessed: 1,
      recordsUpdated: 0,
      recordsCreated: 1,
      recordsSkipped: 0,
      errors: [],
      duration: 1000
    });

    const result = await mriSyncService.syncBuilding(mockBuildingId);
    
    expect(result.properties.success).toBe(true);
    expect(result.properties.recordsCreated).toBe(1);
  });

  it('should handle partial sync failures gracefully', async () => {
    const mockBuildingId = 'building_123';
    
    vi.spyOn(mriSyncService, 'syncProperties').mockResolvedValue({
      success: false,
      recordsProcessed: 0,
      recordsUpdated: 0,
      recordsCreated: 0,
      recordsSkipped: 0,
      errors: ['API connection failed'],
      duration: 500
    });

    const result = await mriSyncService.syncBuilding(mockBuildingId);
    
    expect(result.properties.success).toBe(false);
    expect(result.properties.errors).toContain('API connection failed');
    
    // Should not proceed with other syncs if properties fail
    expect(result.units).toBeUndefined();
    expect(result.transactions).toBeUndefined();
  });
});

/**
 * MRI Qube Integration Service
 * Handles OAuth 2.0 authentication, API calls, and data synchronization with MRI Qube via Vaultre API
 */

import { supabase } from '../lib/supabase';
import {
  MRIConfig,
  MRIOAuthToken,
  MRIApiResponse,
  MRIProperty,
  MRIUnit,
  MRITenancy,
  MRIContact,
  MRITransaction,
  MRIBudget,
  MRIInvoice,
  MRIWorkOrder,
  MRIDocument,
  MRIServiceConfig
} from '../types/mri';

class MRIQubeService {
  private config: MRIConfig;
  private serviceConfig: MRIServiceConfig;
  private token: MRIOAuthToken | null = null;
  private rateLimitQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  constructor() {
    this.config = {
      baseUrl: 'https://api.vaultre.com.au',
      clientId: '',
      clientSecret: '',
      scope: 'read write',
      environment: 'sandbox'
    };

    // Initialize with environment variables as fallback
    this.loadConfigFromEnvironment();

    this.serviceConfig = {
      rateLimiting: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        burstLimit: 10
      },
      retry: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2
      },
      timeout: {
        connectionTimeout: 10000,
        requestTimeout: 30000
      },
      logging: {
        level: import.meta.env.DEV ? 'debug' : 'info',
        enableApiLogging: true,
        enablePerformanceLogging: true
      }
    };

    this.validateConfig();
  }

  // ============================================================================
  // Configuration & Validation
  // ============================================================================

  private loadConfigFromEnvironment(): void {
    // Load from environment variables as fallback
    this.config.baseUrl = import.meta.env.VITE_MRI_API_BASE_URL || this.config.baseUrl;
    this.config.clientId = import.meta.env.VITE_MRI_CLIENT_ID || this.config.clientId;
    this.config.clientSecret = import.meta.env.VITE_MRI_CLIENT_SECRET || this.config.clientSecret;
    this.config.environment = (import.meta.env.VITE_MRI_ENVIRONMENT as 'sandbox' | 'production') || this.config.environment;
  }

  public async loadConfigFromDatabase(buildingId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('mri_credentials')
        .select('client_id, client_secret, api_base_url, environment')
        .eq('building_id', buildingId)
        .eq('is_active', true)
        .single();

      if (data && !error) {
        this.config.clientId = data.client_id || '';
        this.config.clientSecret = data.client_secret || '';
        this.config.baseUrl = data.api_base_url || 'https://api.vaultre.com.au';
        this.config.environment = data.environment || 'sandbox';

        this.log('info', 'MRI configuration loaded from database');
      } else {
        this.log('warn', 'No MRI credentials found in database, using environment variables');
      }
    } catch (error) {
      this.log('error', 'Failed to load MRI credentials from database', error);
    }
  }

  public updateConfig(config: Partial<MRIConfig>): void {
    this.config = { ...this.config, ...config };
    this.token = null; // Clear existing token when config changes
    this.log('info', 'MRI configuration updated');
  }

  private validateConfig(): void {
    if (!this.config.clientId || !this.config.clientSecret) {
      console.warn('MRI Qube: Missing API credentials. Integration will be disabled.');
    }

    if (!this.config.baseUrl) {
      throw new Error('MRI Qube: Base URL is required');
    }
  }

  public isConfigured(): boolean {
    return !!(this.config.clientId && this.config.clientSecret && this.config.baseUrl);
  }

  // ============================================================================
  // OAuth 2.0 Authentication
  // ============================================================================

  private async authenticate(): Promise<MRIOAuthToken> {
    if (this.token && this.isTokenValid(this.token)) {
      return this.token;
    }

    try {
      this.log('info', 'Authenticating with MRI Qube API');

      const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          scope: this.config.scope
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const tokenData = await response.json();
      this.token = {
        ...tokenData,
        obtained_at: Date.now()
      };

      // Store token securely in Supabase
      await this.storeTokenSecurely(this.token);

      this.log('info', 'Successfully authenticated with MRI Qube API');
      return this.token;

    } catch (error) {
      this.log('error', 'Failed to authenticate with MRI Qube API', error);
      throw new Error(`MRI Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private isTokenValid(token: MRIOAuthToken): boolean {
    const expiryTime = token.obtained_at + (token.expires_in * 1000);
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    return Date.now() < (expiryTime - bufferTime);
  }

  private async storeTokenSecurely(token: MRIOAuthToken): Promise<void> {
    try {
      // Store in Supabase vault or encrypted storage
      const { error } = await supabase
        .from('mri_auth_tokens')
        .upsert({
          id: 'current',
          token_data: token,
          expires_at: new Date(token.obtained_at + (token.expires_in * 1000)).toISOString(),
          created_at: new Date().toISOString()
        });

      if (error) {
        this.log('warn', 'Failed to store MRI token securely', error);
      }
    } catch (error) {
      this.log('warn', 'Failed to store MRI token', error);
    }
  }

  private async retrieveStoredToken(): Promise<MRIOAuthToken | null> {
    try {
      const { data, error } = await supabase
        .from('mri_auth_tokens')
        .select('token_data, expires_at')
        .eq('id', 'current')
        .single();

      if (error || !data) {
        return null;
      }

      const token = data.token_data as MRIOAuthToken;
      if (this.isTokenValid(token)) {
        return token;
      }

      return null;
    } catch (error) {
      this.log('warn', 'Failed to retrieve stored MRI token', error);
      return null;
    }
  }

  // ============================================================================
  // Rate Limiting & Request Management
  // ============================================================================

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<MRIApiResponse<T>> {
    return new Promise((resolve, reject) => {
      this.rateLimitQueue.push(async () => {
        try {
          const result = await this.executeRequest<T>(endpoint, options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.rateLimitQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.rateLimitQueue.length > 0) {
      const request = this.rateLimitQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          this.log('error', 'Request failed in queue', error);
        }

        // Rate limiting delay
        await this.delay(1000 / (this.serviceConfig.rateLimiting.requestsPerMinute / 60));
      }
    }

    this.isProcessingQueue = false;
  }

  private async executeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<MRIApiResponse<T>> {
    const startTime = Date.now();
    let retryCount = 0;

    while (retryCount <= this.serviceConfig.retry.maxRetries) {
      try {
        // Ensure we have a valid token
        const token = await this.authenticate();

        const url = `${this.config.baseUrl}${endpoint}`;
        const requestOptions: RequestInit = {
          ...options,
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
          },
          signal: AbortSignal.timeout(this.serviceConfig.timeout.requestTimeout)
        };

        this.log('debug', `Making request to ${url}`, { options: requestOptions });

        const response = await fetch(url, requestOptions);

        if (response.status === 429) {
          // Rate limited - wait and retry
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
          await this.delay(retryAfter * 1000);
          retryCount++;
          continue;
        }

        if (response.status === 401) {
          // Token expired - clear and retry
          this.token = null;
          retryCount++;
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const duration = Date.now() - startTime;

        this.log('debug', `Request completed in ${duration}ms`, { endpoint, status: response.status });

        return {
          success: true,
          data: data as T
        };

      } catch (error) {
        retryCount++;
        const isLastRetry = retryCount > this.serviceConfig.retry.maxRetries;

        this.log('warn', `Request failed (attempt ${retryCount})`, { endpoint, error });

        if (isLastRetry) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }

        // Exponential backoff
        const delay = Math.min(
          this.serviceConfig.retry.baseDelay * Math.pow(this.serviceConfig.retry.backoffMultiplier, retryCount - 1),
          this.serviceConfig.retry.maxDelay
        );
        await this.delay(delay);
      }
    }

    return {
      success: false,
      error: 'Max retries exceeded'
    };
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (!this.serviceConfig.logging.enableApiLogging) return;

    const logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = logLevels[this.serviceConfig.logging.level];
    const messageLevel = logLevels[level];

    if (messageLevel >= currentLevel) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] MRI Qube ${level.toUpperCase()}: ${message}`;
      
      if (data) {
        console[level](logMessage, data);
      } else {
        console[level](logMessage);
      }
    }
  }

  // ============================================================================
  // Connection Testing
  // ============================================================================

  public async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          message: 'MRI Qube integration is not configured. Please check your API credentials.'
        };
      }

      const response = await this.makeRequest('/api/v1/health');

      if (response.success) {
        return {
          success: true,
          message: 'Successfully connected to MRI Qube API',
          details: response.data
        };
      } else {
        return {
          success: false,
          message: `Connection failed: ${response.error}`,
          details: response
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      };
    }
  }

  // ============================================================================
  // Property & Building Data API
  // ============================================================================

  public async getProperties(page: number = 1, limit: number = 50): Promise<MRIApiResponse<MRIProperty[]>> {
    return this.makeRequest<MRIProperty[]>(`/api/v1/properties?page=${page}&limit=${limit}`);
  }

  public async getProperty(propertyId: string): Promise<MRIApiResponse<MRIProperty>> {
    return this.makeRequest<MRIProperty>(`/api/v1/properties/${propertyId}`);
  }

  public async getUnits(propertyId: string): Promise<MRIApiResponse<MRIUnit[]>> {
    return this.makeRequest<MRIUnit[]>(`/api/v1/properties/${propertyId}/units`);
  }

  public async getUnit(propertyId: string, unitId: string): Promise<MRIApiResponse<MRIUnit>> {
    return this.makeRequest<MRIUnit>(`/api/v1/properties/${propertyId}/units/${unitId}`);
  }

  // ============================================================================
  // Tenancy & Contact Data API
  // ============================================================================

  public async getTenancies(propertyId: string): Promise<MRIApiResponse<MRITenancy[]>> {
    return this.makeRequest<MRITenancy[]>(`/api/v1/properties/${propertyId}/tenancies`);
  }

  public async getTenancy(tenancyId: string): Promise<MRIApiResponse<MRITenancy>> {
    return this.makeRequest<MRITenancy>(`/api/v1/tenancies/${tenancyId}`);
  }

  public async getContacts(type?: string): Promise<MRIApiResponse<MRIContact[]>> {
    const query = type ? `?type=${type}` : '';
    return this.makeRequest<MRIContact[]>(`/api/v1/contacts${query}`);
  }

  public async getContact(contactId: string): Promise<MRIApiResponse<MRIContact>> {
    return this.makeRequest<MRIContact>(`/api/v1/contacts/${contactId}`);
  }

  // ============================================================================
  // Financial Data API
  // ============================================================================

  public async getTransactions(
    propertyId: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 100
  ): Promise<MRIApiResponse<MRITransaction[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    return this.makeRequest<MRITransaction[]>(`/api/v1/properties/${propertyId}/transactions?${params}`);
  }

  public async getBudgets(propertyId: string, year?: number): Promise<MRIApiResponse<MRIBudget[]>> {
    const query = year ? `?year=${year}` : '';
    return this.makeRequest<MRIBudget[]>(`/api/v1/properties/${propertyId}/budgets${query}`);
  }

  public async getInvoices(
    propertyId: string,
    status?: string,
    page: number = 1,
    limit: number = 50
  ): Promise<MRIApiResponse<MRIInvoice[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (status) params.append('status', status);

    return this.makeRequest<MRIInvoice[]>(`/api/v1/properties/${propertyId}/invoices?${params}`);
  }

  // ============================================================================
  // Maintenance & Work Orders API
  // ============================================================================

  public async getWorkOrders(
    propertyId: string,
    status?: string,
    page: number = 1,
    limit: number = 50
  ): Promise<MRIApiResponse<MRIWorkOrder[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (status) params.append('status', status);

    return this.makeRequest<MRIWorkOrder[]>(`/api/v1/properties/${propertyId}/work-orders?${params}`);
  }

  public async getWorkOrder(workOrderId: string): Promise<MRIApiResponse<MRIWorkOrder>> {
    return this.makeRequest<MRIWorkOrder>(`/api/v1/work-orders/${workOrderId}`);
  }

  // ============================================================================
  // Documents & Compliance API
  // ============================================================================

  public async getDocuments(
    propertyId: string,
    category?: string,
    page: number = 1,
    limit: number = 50
  ): Promise<MRIApiResponse<MRIDocument[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (category) params.append('category', category);

    return this.makeRequest<MRIDocument[]>(`/api/v1/properties/${propertyId}/documents?${params}`);
  }

  public async getDocument(documentId: string): Promise<MRIApiResponse<MRIDocument>> {
    return this.makeRequest<MRIDocument>(`/api/v1/documents/${documentId}`);
  }

  public async downloadDocument(documentId: string): Promise<MRIApiResponse<Blob>> {
    return this.makeRequest<Blob>(`/api/v1/documents/${documentId}/download`, {
      headers: { 'Accept': 'application/octet-stream' }
    });
  }
}

// Export singleton instance
export const mriQubeService = new MRIQubeService();
export default mriQubeService;

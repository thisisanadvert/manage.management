/**
 * Form Persistence Service
 * Handles automatic saving and restoration of form data across the platform
 */

export interface FormPersistenceConfig {
  formId: string;
  userId?: string;
  storageType?: 'localStorage' | 'sessionStorage';
  debounceMs?: number;
  maxAge?: number; // in milliseconds
  excludeFields?: string[];
  encryptSensitive?: boolean;
}

export interface PersistedFormData {
  data: Record<string, any>;
  timestamp: number;
  version: string;
  userId?: string;
  formId: string;
}

export interface FormPersistenceOptions {
  onSave?: (data: any) => void;
  onRestore?: (data: any) => void;
  onError?: (error: Error) => void;
  onClear?: () => void;
}

class FormPersistenceService {
  private static instance: FormPersistenceService;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly VERSION = '1.0.0';

  static getInstance(): FormPersistenceService {
    if (!FormPersistenceService.instance) {
      FormPersistenceService.instance = new FormPersistenceService();
    }
    return FormPersistenceService.instance;
  }

  /**
   * Generate storage key for form data
   */
  private getStorageKey(config: FormPersistenceConfig): string {
    const { formId, userId } = config;
    return `form_data_${formId}${userId ? `_${userId}` : ''}`;
  }

  /**
   * Get storage interface based on config
   */
  private getStorage(config: FormPersistenceConfig): Storage {
    return config.storageType === 'sessionStorage' ? sessionStorage : localStorage;
  }

  /**
   * Check if stored data is still valid
   */
  private isDataValid(persistedData: PersistedFormData, maxAge?: number): boolean {
    if (!maxAge) return true;
    
    const now = Date.now();
    const age = now - persistedData.timestamp;
    return age <= maxAge;
  }

  /**
   * Filter out excluded fields from data
   */
  private filterData(data: Record<string, any>, excludeFields: string[] = []): Record<string, any> {
    const filtered = { ...data };
    excludeFields.forEach(field => {
      delete filtered[field];
    });
    return filtered;
  }

  /**
   * Save form data with debouncing
   */
  saveFormData(
    data: Record<string, any>,
    config: FormPersistenceConfig,
    options: FormPersistenceOptions = {}
  ): void {
    const { formId, debounceMs = 500 } = config;
    const { onSave, onError } = options;

    // Clear existing timer
    const existingTimer = this.debounceTimers.get(formId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounced timer
    const timer = setTimeout(() => {
      try {
        const storage = this.getStorage(config);
        const storageKey = this.getStorageKey(config);
        
        // Filter out excluded fields
        const filteredData = this.filterData(data, config.excludeFields);
        
        const persistedData: PersistedFormData = {
          data: filteredData,
          timestamp: Date.now(),
          version: this.VERSION,
          userId: config.userId,
          formId: config.formId
        };

        storage.setItem(storageKey, JSON.stringify(persistedData));

        if (onSave) {
          onSave(filteredData);
        }
      } catch (error) {
        // Handle storage quota exceeded
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          this.handleStorageQuotaExceeded(config);
          // Try saving again after cleanup
          try {
            storage.setItem(storageKey, JSON.stringify(persistedData));
            if (onSave) {
              onSave(filteredData);
            }
          } catch (retryError) {
            console.error('Error saving form data after cleanup:', retryError);
            if (onError) {
              onError(retryError as Error);
            }
          }
        } else {
          console.error('Error saving form data:', error);
          if (onError) {
            onError(error as Error);
          }
        }
      } finally {
        this.debounceTimers.delete(formId);
      }
    }, debounceMs);

    this.debounceTimers.set(formId, timer);
  }

  /**
   * Restore form data from storage
   */
  restoreFormData(
    config: FormPersistenceConfig,
    options: FormPersistenceOptions = {}
  ): Record<string, any> | null {
    const { onRestore, onError } = options;

    try {
      const storage = this.getStorage(config);
      const storageKey = this.getStorageKey(config);
      const stored = storage.getItem(storageKey);

      if (!stored) {
        return null;
      }

      const persistedData: PersistedFormData = JSON.parse(stored);

      // Validate data age
      if (!this.isDataValid(persistedData, config.maxAge)) {
        this.clearFormData(config);
        return null;
      }

      // Validate user ID if provided
      if (config.userId && persistedData.userId !== config.userId) {
        return null;
      }

      if (onRestore) {
        onRestore(persistedData.data);
      }

      return persistedData.data;
    } catch (error) {
      console.error('Error restoring form data:', error);
      if (onError) {
        onError(error as Error);
      }
      return null;
    }
  }

  /**
   * Clear form data from storage
   */
  clearFormData(config: FormPersistenceConfig, options: FormPersistenceOptions = {}): void {
    const { onClear, onError } = options;

    try {
      const storage = this.getStorage(config);
      const storageKey = this.getStorageKey(config);
      storage.removeItem(storageKey);

      // Clear any pending debounced saves
      const timer = this.debounceTimers.get(config.formId);
      if (timer) {
        clearTimeout(timer);
        this.debounceTimers.delete(config.formId);
      }

      if (onClear) {
        onClear();
      }
    } catch (error) {
      console.error('Error clearing form data:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  }

  /**
   * Check if form has saved data
   */
  hasFormData(config: FormPersistenceConfig): boolean {
    try {
      const storage = this.getStorage(config);
      const storageKey = this.getStorageKey(config);
      const stored = storage.getItem(storageKey);
      
      if (!stored) return false;

      const persistedData: PersistedFormData = JSON.parse(stored);
      return this.isDataValid(persistedData, config.maxAge);
    } catch (error) {
      console.error('Error checking form data:', error);
      return false;
    }
  }

  /**
   * Get metadata about saved form data
   */
  getFormDataMetadata(config: FormPersistenceConfig): {
    exists: boolean;
    timestamp?: number;
    age?: number;
    fieldCount?: number;
  } {
    try {
      const storage = this.getStorage(config);
      const storageKey = this.getStorageKey(config);
      const stored = storage.getItem(storageKey);
      
      if (!stored) {
        return { exists: false };
      }

      const persistedData: PersistedFormData = JSON.parse(stored);
      const now = Date.now();
      
      return {
        exists: true,
        timestamp: persistedData.timestamp,
        age: now - persistedData.timestamp,
        fieldCount: Object.keys(persistedData.data).length
      };
    } catch (error) {
      console.error('Error getting form data metadata:', error);
      return { exists: false };
    }
  }

  /**
   * Clean up expired form data across all forms
   */
  cleanupExpiredData(maxAge: number = 7 * 24 * 60 * 60 * 1000): void { // 7 days default
    try {
      const now = Date.now();

      // Check localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith('form_data_')) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const persistedData: PersistedFormData = JSON.parse(stored);
              if (now - persistedData.timestamp > maxAge) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // Remove corrupted data
            localStorage.removeItem(key);
          }
        }
      }

      // Check sessionStorage
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key?.startsWith('form_data_')) {
          try {
            const stored = sessionStorage.getItem(key);
            if (stored) {
              const persistedData: PersistedFormData = JSON.parse(stored);
              if (now - persistedData.timestamp > maxAge) {
                sessionStorage.removeItem(key);
              }
            }
          } catch (error) {
            // Remove corrupted data
            sessionStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired form data:', error);
    }
  }

  /**
   * Clean up all form data for a specific user
   */
  cleanupUserData(userId: string): void {
    try {
      const userPrefix = `form_data_`;
      const userSuffix = `_${userId}`;

      // Clean localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith(userPrefix) && key.endsWith(userSuffix)) {
          localStorage.removeItem(key);
        }
      }

      // Clean sessionStorage
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(userPrefix) && key.endsWith(userSuffix)) {
          sessionStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error cleaning up user form data:', error);
    }
  }

  /**
   * Get all saved forms for a user
   */
  getUserSavedForms(userId: string): Array<{
    formId: string;
    timestamp: number;
    fieldCount: number;
    storageType: 'localStorage' | 'sessionStorage';
  }> {
    const savedForms: Array<{
      formId: string;
      timestamp: number;
      fieldCount: number;
      storageType: 'localStorage' | 'sessionStorage';
    }> = [];

    try {
      const userPrefix = `form_data_`;
      const userSuffix = `_${userId}`;

      // Check localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(userPrefix) && key.endsWith(userSuffix)) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const persistedData: PersistedFormData = JSON.parse(stored);
              const formId = key.replace(userPrefix, '').replace(userSuffix, '');
              savedForms.push({
                formId,
                timestamp: persistedData.timestamp,
                fieldCount: Object.keys(persistedData.data).length,
                storageType: 'localStorage'
              });
            }
          } catch (error) {
            // Skip corrupted data
            continue;
          }
        }
      }

      // Check sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(userPrefix) && key.endsWith(userSuffix)) {
          try {
            const stored = sessionStorage.getItem(key);
            if (stored) {
              const persistedData: PersistedFormData = JSON.parse(stored);
              const formId = key.replace(userPrefix, '').replace(userSuffix, '');
              savedForms.push({
                formId,
                timestamp: persistedData.timestamp,
                fieldCount: Object.keys(persistedData.data).length,
                storageType: 'sessionStorage'
              });
            }
          } catch (error) {
            // Skip corrupted data
            continue;
          }
        }
      }
    } catch (error) {
      console.error('Error getting user saved forms:', error);
    }

    return savedForms.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Handle storage quota exceeded errors
   */
  private handleStorageQuotaExceeded(config: FormPersistenceConfig): void {
    try {
      console.warn('Storage quota exceeded, attempting cleanup...');

      // Clean up expired data first
      this.cleanupExpiredData();

      // If still having issues, clean up oldest form data
      const storage = this.getStorage(config);
      const formKeys: Array<{ key: string; timestamp: number }> = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith('form_data_')) {
          try {
            const stored = storage.getItem(key);
            if (stored) {
              const persistedData: PersistedFormData = JSON.parse(stored);
              formKeys.push({ key, timestamp: persistedData.timestamp });
            }
          } catch (error) {
            // Remove corrupted data
            storage.removeItem(key);
          }
        }
      }

      // Remove oldest 25% of form data
      formKeys.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = Math.ceil(formKeys.length * 0.25);
      for (let i = 0; i < toRemove; i++) {
        storage.removeItem(formKeys[i].key);
      }
    } catch (error) {
      console.error('Error handling storage quota exceeded:', error);
    }
  }

  /**
   * Initialize the service and perform cleanup
   */
  initialize(): void {
    try {
      // Clean up expired data on initialization
      this.cleanupExpiredData();

      // Set up periodic cleanup (every hour)
      setInterval(() => {
        this.cleanupExpiredData();
      }, 60 * 60 * 1000);

    } catch (error) {
      console.error('Error initializing form persistence service:', error);
    }
  }
}

export default FormPersistenceService;

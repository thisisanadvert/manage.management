/**
 * React Hook for Form Persistence
 * Provides easy integration of form data persistence into React components
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FormPersistenceService, { FormPersistenceConfig, FormPersistenceOptions } from '../services/formPersistenceService';

export interface UseFormPersistenceConfig extends Omit<FormPersistenceConfig, 'userId'> {
  autoSave?: boolean;
  autoRestore?: boolean;
  clearOnSubmit?: boolean;
  showSaveIndicator?: boolean;
}

export interface FormPersistenceState {
  isSaving: boolean;
  isRestoring: boolean;
  lastSaved?: Date;
  hasUnsavedChanges: boolean;
  hasSavedData: boolean;
}

export interface UseFormPersistenceReturn<T> {
  // State management
  formData: T;
  setFormData: (data: T | ((prev: T) => T)) => void;
  updateField: (field: keyof T, value: any) => void;
  
  // Persistence actions
  saveNow: () => void;
  restoreData: () => void;
  clearSavedData: () => void;
  
  // State information
  persistenceState: FormPersistenceState;
  
  // Utility functions
  hasChanges: () => boolean;
  resetToSaved: () => void;
}

export function useFormPersistence<T extends Record<string, any>>(
  initialData: T,
  config: UseFormPersistenceConfig
): UseFormPersistenceReturn<T> {
  const { user } = useAuth();
  const persistenceService = FormPersistenceService.getInstance();
  
  const [formData, setFormDataState] = useState<T>(initialData);
  const [persistenceState, setPersistenceState] = useState<FormPersistenceState>({
    isSaving: false,
    isRestoring: false,
    hasUnsavedChanges: false,
    hasSavedData: false
  });
  
  const initialDataRef = useRef<T>(initialData);
  const savedDataRef = useRef<T | null>(null);
  const isRestoringRef = useRef(false);

  // Create full config with user ID
  const fullConfig: FormPersistenceConfig = {
    ...config,
    userId: user?.id,
    debounceMs: config.debounceMs ?? 1000,
    storageType: config.storageType ?? 'localStorage',
    maxAge: config.maxAge ?? 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  // Persistence options
  const persistenceOptions: FormPersistenceOptions = {
    onSave: (data) => {
      setPersistenceState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false
      }));
      savedDataRef.current = data;
    },
    onRestore: (data) => {
      setPersistenceState(prev => ({
        ...prev,
        isRestoring: false
      }));
    },
    onError: (error) => {
      console.error('Form persistence error:', error);
      setPersistenceState(prev => ({
        ...prev,
        isSaving: false,
        isRestoring: false
      }));
    },
    onClear: () => {
      setPersistenceState(prev => ({
        ...prev,
        hasSavedData: false,
        hasUnsavedChanges: false,
        lastSaved: undefined
      }));
      savedDataRef.current = null;
    }
  };

  // Check if form has saved data
  const checkSavedData = useCallback(() => {
    const hasSaved = persistenceService.hasFormData(fullConfig);
    setPersistenceState(prev => ({
      ...prev,
      hasSavedData: hasSaved
    }));
    return hasSaved;
  }, [fullConfig, persistenceService]);

  // Save form data
  const saveNow = useCallback(() => {
    if (!config.autoSave && !formData) return;
    
    setPersistenceState(prev => ({ ...prev, isSaving: true }));
    persistenceService.saveFormData(formData, fullConfig, persistenceOptions);
  }, [formData, fullConfig, persistenceOptions, persistenceService, config.autoSave]);

  // Restore form data
  const restoreData = useCallback(() => {
    setPersistenceState(prev => ({ ...prev, isRestoring: true }));
    isRestoringRef.current = true;
    
    const restored = persistenceService.restoreFormData(fullConfig, persistenceOptions);
    if (restored) {
      setFormDataState(restored as T);
      savedDataRef.current = restored as T;
      setPersistenceState(prev => ({
        ...prev,
        isRestoring: false,
        hasUnsavedChanges: false,
        hasSavedData: true
      }));
    } else {
      setPersistenceState(prev => ({ ...prev, isRestoring: false }));
    }
    
    isRestoringRef.current = false;
  }, [fullConfig, persistenceOptions, persistenceService]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    persistenceService.clearFormData(fullConfig, persistenceOptions);
  }, [fullConfig, persistenceOptions, persistenceService]);

  // Update form data with persistence
  const setFormData = useCallback((data: T | ((prev: T) => T)) => {
    setFormDataState(prevData => {
      const newData = typeof data === 'function' ? data(prevData) : data;
      
      // Don't trigger save during restoration
      if (!isRestoringRef.current) {
        // Mark as having unsaved changes
        setPersistenceState(prev => ({ ...prev, hasUnsavedChanges: true }));
        
        // Auto-save if enabled
        if (config.autoSave !== false) {
          setPersistenceState(prev => ({ ...prev, isSaving: true }));
          persistenceService.saveFormData(newData, fullConfig, persistenceOptions);
        }
      }
      
      return newData;
    });
  }, [config.autoSave, fullConfig, persistenceOptions, persistenceService]);

  // Update a single field
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  // Check if form has changes from initial state
  const hasChanges = useCallback(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialDataRef.current);
  }, [formData]);

  // Reset to saved data
  const resetToSaved = useCallback(() => {
    if (savedDataRef.current) {
      isRestoringRef.current = true;
      setFormDataState(savedDataRef.current);
      setPersistenceState(prev => ({ ...prev, hasUnsavedChanges: false }));
      isRestoringRef.current = false;
    }
  }, []);

  // Auto-restore on mount
  useEffect(() => {
    if (config.autoRestore !== false && user?.id) {
      checkSavedData();
      if (persistenceService.hasFormData(fullConfig)) {
        restoreData();
      }
    }
  }, [config.autoRestore, user?.id, fullConfig, persistenceService, restoreData, checkSavedData]);

  // Update initial data reference when it changes
  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending saves
      const timer = (persistenceService as any).debounceTimers?.get(config.formId);
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [config.formId, persistenceService]);

  // Clear data on successful submit if configured
  useEffect(() => {
    if (config.clearOnSubmit && !persistenceState.hasUnsavedChanges && savedDataRef.current) {
      // This would be triggered by parent component after successful submission
      // The parent should call clearSavedData() after successful form submission
    }
  }, [config.clearOnSubmit, persistenceState.hasUnsavedChanges]);

  return {
    formData,
    setFormData,
    updateField,
    saveNow,
    restoreData,
    clearSavedData,
    persistenceState,
    hasChanges,
    resetToSaved
  };
}

export default useFormPersistence;

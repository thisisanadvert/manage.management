/**
 * Higher-Order Component for Form Persistence
 * Wraps existing form components to add automatic data persistence
 */

import React, { ComponentType, forwardRef } from 'react';
import useFormPersistence, { UseFormPersistenceConfig } from '../../hooks/useFormPersistence';
import FormPersistenceIndicator from '../ui/FormPersistenceIndicator';

export interface WithFormPersistenceProps {
  formPersistenceConfig?: UseFormPersistenceConfig;
  showPersistenceIndicator?: boolean;
  persistenceIndicatorProps?: {
    className?: string;
    showActions?: boolean;
    compact?: boolean;
  };
}

export interface FormPersistenceInjectedProps<T = any> {
  formData: T;
  setFormData: (data: T | ((prev: T) => T)) => void;
  updateField: (field: keyof T, value: any) => void;
  persistenceState: any;
  saveNow: () => void;
  restoreData: () => void;
  clearSavedData: () => void;
  hasChanges: () => boolean;
  resetToSaved: () => void;
}

/**
 * HOC that adds form persistence to any component
 */
function withFormPersistence<P extends object, T extends Record<string, any>>(
  WrappedComponent: ComponentType<P & FormPersistenceInjectedProps<T>>,
  defaultConfig: UseFormPersistenceConfig,
  initialData: T
) {
  const WithFormPersistenceComponent = forwardRef<
    any,
    P & WithFormPersistenceProps
  >((props, ref) => {
    const {
      formPersistenceConfig,
      showPersistenceIndicator = true,
      persistenceIndicatorProps = {},
      ...restProps
    } = props;

    // Merge default config with provided config
    const config = {
      ...defaultConfig,
      ...formPersistenceConfig
    };

    // Use the form persistence hook
    const {
      formData,
      setFormData,
      updateField,
      persistenceState,
      saveNow,
      restoreData,
      clearSavedData,
      hasChanges,
      resetToSaved
    } = useFormPersistence<T>(initialData, config);

    // Prepare props for the wrapped component
    const injectedProps: FormPersistenceInjectedProps<T> = {
      formData,
      setFormData,
      updateField,
      persistenceState,
      saveNow,
      restoreData,
      clearSavedData,
      hasChanges,
      resetToSaved
    };

    return (
      <div className="space-y-4">
        {/* Persistence Indicator */}
        {showPersistenceIndicator && (
          <FormPersistenceIndicator
            persistenceState={persistenceState}
            onSaveNow={saveNow}
            onRestoreData={restoreData}
            onClearSavedData={clearSavedData}
            {...persistenceIndicatorProps}
          />
        )}

        {/* Wrapped Component */}
        <WrappedComponent
          ref={ref}
          {...(restProps as P)}
          {...injectedProps}
        />
      </div>
    );
  });

  WithFormPersistenceComponent.displayName = `withFormPersistence(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithFormPersistenceComponent;
}

/**
 * Utility function to create a form persistence HOC with specific configuration
 */
export function createFormPersistenceHOC<T extends Record<string, any>>(
  formId: string,
  initialData: T,
  config: Partial<UseFormPersistenceConfig> = {}
) {
  const defaultConfig: UseFormPersistenceConfig = {
    formId,
    autoSave: true,
    autoRestore: true,
    clearOnSubmit: false,
    showSaveIndicator: true,
    debounceMs: 1000,
    storageType: 'localStorage',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    ...config
  };

  return function<P extends object>(
    WrappedComponent: ComponentType<P & FormPersistenceInjectedProps<T>>
  ) {
    return withFormPersistence(WrappedComponent, defaultConfig, initialData);
  };
}

/**
 * Simple wrapper component for adding persistence to forms without HOC
 */
export interface FormPersistenceWrapperProps<T> extends WithFormPersistenceProps {
  formId: string;
  initialData: T;
  children: (props: FormPersistenceInjectedProps<T>) => React.ReactNode;
  config?: Partial<UseFormPersistenceConfig>;
}

export function FormPersistenceWrapper<T extends Record<string, any>>({
  formId,
  initialData,
  children,
  config = {},
  showPersistenceIndicator = true,
  persistenceIndicatorProps = {}
}: FormPersistenceWrapperProps<T>) {
  const fullConfig: UseFormPersistenceConfig = {
    formId,
    autoSave: true,
    autoRestore: true,
    clearOnSubmit: false,
    showSaveIndicator: true,
    debounceMs: 1000,
    storageType: 'localStorage',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    ...config
  };

  const persistenceProps = useFormPersistence<T>(initialData, fullConfig);

  return (
    <div className="space-y-4">
      {/* Persistence Indicator */}
      {showPersistenceIndicator && (
        <FormPersistenceIndicator
          persistenceState={persistenceProps.persistenceState}
          onSaveNow={persistenceProps.saveNow}
          onRestoreData={persistenceProps.restoreData}
          onClearSavedData={persistenceProps.clearSavedData}
          {...persistenceIndicatorProps}
        />
      )}

      {/* Render children with persistence props */}
      {children(persistenceProps)}
    </div>
  );
}

export default withFormPersistence;

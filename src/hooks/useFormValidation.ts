import { useState, useCallback, useEffect } from 'react';
import { ValidationRules, ValidationErrors, validateForm } from '../utils/validation';

export interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

export interface UseFormValidationReturn<T> {
  values: T;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearErrors: () => void;
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (e: React.FormEvent) => Promise<void>;
  reset: (newValues?: Partial<T>) => void;
  validate: () => boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules,
  options: UseFormValidationOptions = {}
): UseFormValidationReturn<T> {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true
  } = options;

  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form and return if it's valid
  const validate = useCallback(() => {
    const newErrors = validateForm(values, validationRules);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  // Set a single field value
  const setValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    
    if (validateOnChange && touched[field as string]) {
      // Validate only this field
      const fieldRules = { [field as string]: validationRules[field as string] };
      const fieldErrors = validateForm({ [field]: value }, fieldRules);
      
      setErrors(prev => ({
        ...prev,
        [field]: fieldErrors[field as string] || undefined
      }));
    }
  }, [validateOnChange, touched, validationRules]);

  // Set multiple field values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
    
    if (validateOnChange) {
      // Validate all changed fields
      const changedFields = Object.keys(newValues);
      const fieldRules = changedFields.reduce((acc, field) => {
        if (validationRules[field]) {
          acc[field] = validationRules[field];
        }
        return acc;
      }, {} as ValidationRules);
      
      const fieldErrors = validateForm({ ...values, ...newValues }, fieldRules);
      
      setErrors(prev => {
        const newErrors = { ...prev };
        changedFields.forEach(field => {
          if (fieldErrors[field]) {
            newErrors[field] = fieldErrors[field];
          } else {
            delete newErrors[field];
          }
        });
        return newErrors;
      });
    }
  }, [values, validateOnChange, validationRules]);

  // Set a specific error
  const setError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Clear a specific error
  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Handle input change
  const handleChange = useCallback((field: keyof T) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : e.target.value;
      setValue(field, value);
    };
  }, [setValue]);

  // Handle input blur
  const handleBlur = useCallback((field: keyof T) => {
    return () => {
      setTouched(prev => ({ ...prev, [field as string]: true }));
      
      if (validateOnBlur) {
        // Validate only this field
        const fieldRules = { [field as string]: validationRules[field as string] };
        const fieldErrors = validateForm({ [field]: values[field] }, fieldRules);
        
        setErrors(prev => ({
          ...prev,
          [field]: fieldErrors[field as string] || undefined
        }));
      }
    };
  }, [validateOnBlur, validationRules, values]);

  // Handle form submission
  const handleSubmit = useCallback((onSubmit: (values: T) => Promise<void> | void) => {
    return async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (isSubmitting) return;
      
      setIsSubmitting(true);
      
      try {
        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {} as Record<string, boolean>);
        setTouched(allTouched);
        
        // Validate if required
        if (validateOnSubmit) {
          const isFormValid = validate();
          if (!isFormValid) {
            return;
          }
        }
        
        // Call the submit handler
        await onSubmit(values);
        
      } catch (error) {
        console.error('Form submission error:', error);
        // You might want to set a general form error here
        if (error instanceof Error) {
          setError('_form', error.message);
        }
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [values, isSubmitting, validateOnSubmit, validate, setError]);

  // Reset form
  const reset = useCallback((newValues?: Partial<T>) => {
    const resetValues = newValues ? { ...initialValues, ...newValues } : initialValues;
    setValuesState(resetValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Validate on mount if there are initial values
  useEffect(() => {
    if (validateOnChange) {
      validate();
    }
  }, []); // Only run on mount

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setValues,
    setError,
    clearError,
    clearErrors,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validate
  };
}

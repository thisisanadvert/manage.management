import React, { InputHTMLAttributes, forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'error' | 'success';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helpText,
  leftIcon,
  rightIcon,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm';
  
  const variantClasses = {
    default: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
    error: 'border-error-300 text-error-900 placeholder-error-300 focus:border-error-500 focus:ring-error-500',
    success: 'border-success-300 focus:border-success-500 focus:ring-success-500'
  };

  const currentVariant = error ? 'error' : variant;
  const inputClasses = `${baseClasses} ${variantClasses[currentVariant]} ${className}`;
  
  const paddingClasses = leftIcon && rightIcon 
    ? 'pl-10 pr-10' 
    : leftIcon 
    ? 'pl-10 pr-3' 
    : rightIcon 
    ? 'pl-3 pr-10' 
    : 'px-3';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative rounded-md shadow-sm">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={error ? 'text-error-400' : 'text-gray-400'}>
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          className={`${inputClasses} ${paddingClasses} py-2`}
          {...props}
        />
        
        {rightIcon && !error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">
              {rightIcon}
            </span>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-error-500" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error-600" id={`${props.id}-error`}>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500" id={`${props.id}-description`}>
          {helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

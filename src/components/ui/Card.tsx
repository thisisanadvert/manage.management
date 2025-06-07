import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  badge?: {
    text: string;
    variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  };
  onClick?: () => void;
  hoverable?: boolean;
}

const Card = ({ 
  children, 
  className = '', 
  title, 
  subtitle,
  footer,
  badge,
  onClick,
  hoverable = false
}: CardProps) => {
  const badgeVariantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    accent: 'bg-accent-100 text-accent-800',
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-700',
    error: 'bg-error-50 text-error-700',
  };

  return (
    <div 
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden
        ${hoverable ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {(title || subtitle || badge) && (
        <div className="p-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {badge && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              badgeVariantClasses[badge.variant || 'primary']
            }`}>
              {badge.text}
            </span>
          )}
        </div>
      )}
      
      <div className="p-4">
        {children}
      </div>
      
      {footer && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
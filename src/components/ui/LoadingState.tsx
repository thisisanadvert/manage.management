import React from 'react';
import { Building2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export interface LoadingStateProps {
  type?: 'page' | 'section' | 'inline' | 'overlay';
  message?: string;
  showLogo?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: React.ReactNode;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'section',
  message = 'Loading...',
  showLogo = false,
  size = 'md',
  className = '',
  children
}) => {
  const renderContent = () => (
    <>
      {showLogo && (
        <div className="flex items-center space-x-2 mb-6">
          <div className="bg-primary-600 text-white p-2 rounded">
            <Building2 size={24} />
          </div>
          <span className="text-2xl font-bold text-primary-800 pixel-font">
            Manage.Management
          </span>
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <LoadingSpinner size={size} />
        {message && (
          <p className="mt-4 text-gray-600 text-center text-sm">
            {message}
          </p>
        )}
        {children}
      </div>
    </>
  );

  switch (type) {
    case 'page':
      return (
        <div className={`min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 ${className}`}>
          {renderContent()}
        </div>
      );

    case 'overlay':
      return (
        <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center ${className}`}>
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
            {renderContent()}
          </div>
        </div>
      );

    case 'inline':
      return (
        <div className={`flex items-center space-x-2 ${className}`}>
          <LoadingSpinner size={size} />
          {message && (
            <span className="text-gray-600 text-sm">{message}</span>
          )}
        </div>
      );

    case 'section':
    default:
      return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
          {renderContent()}
        </div>
      );
  }
};

export default LoadingState;

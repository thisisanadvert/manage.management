import React from 'react';
import { Building2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoaderProps {
  message?: string;
  showLogo?: boolean;
}

const PageLoader = ({ 
  message = 'Loading...', 
  showLogo = true 
}: PageLoaderProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      {showLogo && (
        <div className="flex items-center space-x-2 mb-8">
          <div className="bg-primary-600 text-white p-2 rounded">
            <Building2 size={24} />
          </div>
          <span className="text-2xl font-bold text-primary-800 pixel-font">
            Manage.Management
          </span>
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 text-center">{message}</p>
      </div>
    </div>
  );
};

export default PageLoader;

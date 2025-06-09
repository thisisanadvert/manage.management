import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import Logo from './Logo';

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
        <div className="mb-8">
          <Logo size="xl" showText={true} />
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

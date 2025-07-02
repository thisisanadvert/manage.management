import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Building2 } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white p-2 rounded">
              <Building2 size={24} />
            </div>
            <span className="text-2xl font-bold text-primary-800 pixel-font">Manage.Management</span>
          </div>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
            <p className="text-gray-600">
              Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate(-1)}
              variant="primary"
              className="w-full"
              leftIcon={<ArrowLeft size={16} />}
            >
              Go Back
            </Button>
            <Button
              onClick={() => window.location.href = 'https://app.manage.management'}
              variant="outline"
              className="w-full"
              leftIcon={<Home size={16} />}
            >
              Go to App
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

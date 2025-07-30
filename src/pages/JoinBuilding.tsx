/**
 * Join Building Page
 * Standalone page for users to accept building invitations
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Building, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import InvitationAcceptance from '../components/invitations/InvitationAcceptance';
import { useAuth } from '../contexts/AuthContext';

const JoinBuilding: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [initialCode, setInitialCode] = useState('');

  useEffect(() => {
    // Get invitation code from URL parameters
    const code = searchParams.get('code');
    if (code) {
      setInitialCode(code.toUpperCase());
    }
  }, [searchParams]);

  const handleAcceptanceComplete = (buildingId: string) => {
    // Redirect to appropriate dashboard based on user role
    const userRole = user?.role;
    if (userRole) {
      const basePath = userRole.split('-')[0];
      navigate(`/${basePath}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoBack = () => {
    if (user) {
      // User is logged in, go to their dashboard
      const userRole = user.role;
      if (userRole) {
        const basePath = userRole.split('-')[0];
        navigate(`/${basePath}`);
      } else {
        navigate('/dashboard');
      }
    } else {
      // User is not logged in, go to home page
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Join Building
                </h1>
                <p className="text-sm text-gray-600">
                  Enter your invitation code to join a building
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          // User not logged in - show login prompt
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be signed in to accept a building invitation. 
              Please sign in or create an account to continue.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate('/login')}
                className="flex-1 sm:flex-none"
              >
                Sign In
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/signup')}
                className="flex-1 sm:flex-none"
              >
                Create Account
              </Button>
            </div>
            
            {initialCode && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Your invitation code:</strong> {initialCode}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  This code will be automatically filled in after you sign in.
                </p>
              </div>
            )}
          </div>
        ) : (
          // User logged in - show invitation acceptance
          <InvitationAcceptance
            onAcceptanceComplete={handleAcceptanceComplete}
            initialCode={initialCode}
          />
        )}

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Need Help?
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                Don't have an invitation code?
              </h4>
              <p className="text-sm text-gray-600">
                Contact your building manager, RTM director, or the person who invited you. 
                They can provide you with a valid invitation code.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                Code not working?
              </h4>
              <p className="text-sm text-gray-600">
                Invitation codes expire after a certain period. If your code isn't working, 
                it may have expired. Ask for a new invitation code.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                What happens after I join?
              </h4>
              <p className="text-sm text-gray-600">
                Once you accept the invitation, you'll have access to building information, 
                documents, announcements, and other features based on your role in the building.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Made in Bournemouth with ❤️ for homeowners across the UK
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinBuilding;

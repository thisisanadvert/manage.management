import React, { useState } from 'react';
import { Settings, User, Crown, Building2, Users, Briefcase, Home, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface DevUser {
  email: string;
  role: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const DEV_USERS: DevUser[] = [
  // Real Frankie's Central Park Building
  {
    email: 'frankie@manage.management',
    role: 'rtm-director',
    name: 'Frankie (Central Park)',
    icon: <Crown className="h-4 w-4 text-blue-600" />,
    description: 'Your real Central Park building account'
  },
  // Demo Users for Testing
  {
    email: 'rtm@demo.com',
    role: 'rtm-director',
    name: 'RTM Director (Demo)',
    icon: <Crown className="h-4 w-4" />,
    description: 'Right to Manage Director - Full building control'
  },
  {
    email: 'sof@demo.com',
    role: 'sof-director',
    name: 'SOF Director (Demo)',
    icon: <Building2 className="h-4 w-4" />,
    description: 'Share of Freehold Director - Ownership management'
  },
  {
    email: 'leaseholder@demo.com',
    role: 'leaseholder',
    name: 'Leaseholder (Demo)',
    icon: <Home className="h-4 w-4" />,
    description: 'Leaseholder - Resident with lease'
  },
  {
    email: 'shareholder@demo.com',
    role: 'shareholder',
    name: 'Shareholder (Demo)',
    icon: <Users className="h-4 w-4" />,
    description: 'Shareholder - Owns share of freehold'
  },
  {
    email: 'management@demo.com',
    role: 'management-company',
    name: 'Management Company (Demo)',
    icon: <Briefcase className="h-4 w-4" />,
    description: 'Professional management company'
  }
];

const DevUserSwitcher: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Only show for super user
  if (user?.email !== 'frankie@manage.management') {
    return null;
  }

  const switchToUser = async (devUser: DevUser) => {
    console.log('Switching to user:', devUser);
    setIsSwitching(true);

    try {
      // Determine building info based on user
      const isRealFrankie = devUser.email === 'frankie@manage.management';
      const buildingInfo = isRealFrankie ? {
        buildingId: 'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6', // Central Park building ID
        buildingName: 'Central Park',
        buildingAddress: 'Central Park, London',
        unitNumber: 'Penthouse'
      } : {
        buildingId: 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
        buildingName: 'Riverside Gardens',
        buildingAddress: '123 River Street, London SW1A 1AA',
        unitNumber: devUser.role.includes('director') ? 'Director' : '101'
      };

      // Update the current user's metadata to simulate being the target user
      console.log('Updating user metadata...');
      const { data, error } = await supabase.auth.updateUser({
        data: {
          role: devUser.role,
          firstName: isRealFrankie ? 'Frankie' : devUser.name.split(' ')[0],
          lastName: isRealFrankie ? 'Baeza' : (devUser.name.split(' ')[1] || ''),
          ...buildingInfo,
          onboardingComplete: true,
          devMode: !isRealFrankie, // Real Frankie is not in dev mode
          originalEmail: isRealFrankie ? null : 'frankie@manage.management',
          simulatedEmail: isRealFrankie ? null : devUser.email
        }
      });

      console.log('Update result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        alert(`Error switching user: ${error.message}`);
        return;
      }

      console.log('User metadata updated successfully, reloading page...');
      // Force a page reload to apply the new user context
      window.location.reload();

    } catch (error: any) {
      console.error('Error switching user:', error);
      alert(`Error switching user: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSwitching(false);
    }
  };

  const resetToSuperUser = async () => {
    setIsSwitching(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          role: 'super-admin',
          firstName: 'Frankie',
          lastName: 'Baeza',
          buildingId: 'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6', // Central Park building ID
          buildingName: 'Central Park',
          buildingAddress: 'Central Park, London',
          unitNumber: 'Super Admin',
          onboardingComplete: true,
          devMode: false,
          originalEmail: null,
          simulatedEmail: null
        }
      });

      if (error) throw error;
      window.location.reload();

    } catch (error) {
      console.error('Error resetting to super user:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  const currentSimulatedUser = user?.metadata?.simulatedEmail;

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {/* Dev Mode Indicator */}
      {user?.metadata?.devMode && (
        <div className="mb-2 rounded-lg bg-yellow-100 border border-yellow-300 px-3 py-2 text-xs text-yellow-800">
          <div className="flex items-center gap-2">
            <Settings className="h-3 w-3" />
            <span>DEV MODE: {currentSimulatedUser}</span>
            <button
              onClick={resetToSuperUser}
              className="ml-2 text-yellow-600 hover:text-yellow-800 underline"
              disabled={isSwitching}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* User Switcher Button */}
      <div className="relative">
        <Button
          variant="primary"
          size="sm"
          leftIcon={<User className="h-4 w-4" />}
          onClick={() => setIsOpen(!isOpen)}
          className="shadow-lg"
          disabled={isSwitching}
        >
          Dev Users
        </Button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-80 rounded-lg bg-white shadow-xl border border-gray-200 overflow-hidden z-[9999]">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Developer User Switcher</h3>
              <p className="text-xs text-gray-500 mt-1">Switch between user roles for testing</p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {DEV_USERS.map((devUser) => (
                <button
                  key={devUser.email}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Button clicked for:', devUser.name);
                    switchToUser(devUser);
                  }}
                  disabled={isSwitching}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer ${
                    isSwitching ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                      {devUser.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{devUser.name}</span>
                        {currentSimulatedUser === devUser.email && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                        {isSwitching && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{devUser.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{devUser.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default DevUserSwitcher;

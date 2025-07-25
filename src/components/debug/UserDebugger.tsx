/**
 * User Debugger Component
 * Comprehensive debugging for user authentication and role issues
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { RefreshCw, User, Database, AlertTriangle } from 'lucide-react';

interface DatabaseUserData {
  id: string;
  email: string;
  user_metadata: any;
  raw_user_meta_data: any;
  role: string;
  created_at: string;
}

interface BuildingUserData {
  building_id: string;
  role: string;
  building_name?: string;
}

const UserDebugger: React.FC = () => {
  const { user } = useAuth();
  const [dbUserData, setDbUserData] = useState<DatabaseUserData | null>(null);
  const [buildingUserData, setBuildingUserData] = useState<BuildingUserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get user data from auth.users table
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('id, email, user_metadata, raw_user_meta_data, role, created_at')
        .eq('email', user.email)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        setError(`Failed to fetch user data: ${userError.message}`);
      } else {
        setDbUserData(userData);
      }

      // Get building associations
      const { data: buildingData, error: buildingError } = await supabase
        .from('building_users')
        .select(`
          building_id,
          role,
          buildings (
            name
          )
        `)
        .eq('user_id', user.id);

      if (buildingError) {
        console.error('Error fetching building data:', buildingError);
      } else {
        setBuildingUserData(buildingData?.map(item => ({
          building_id: item.building_id,
          role: item.role,
          building_name: (item as any).buildings?.name
        })) || []);
      }

    } catch (err) {
      console.error('Error in loadUserData:', err);
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fixUserRole = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      // Update user metadata to ensure super-admin role is set
      const { error } = await supabase.auth.updateUser({
        data: {
          role: 'super-admin',
          firstName: 'Frankie',
          lastName: 'Baeza'
        }
      });

      if (error) {
        setError(`Failed to update user role: ${error.message}`);
      } else {
        alert('User role updated! Please refresh the page.');
        await loadUserData();
      }
    } catch (err) {
      setError(`Error updating role: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user?.email]);

  if (!user) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">No user logged in</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
            <User className="h-5 w-5" />
            User Debug Information
          </h3>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={16} />}
            onClick={loadUserData}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Auth Context Data */}
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Auth Context Data:</h4>
            <div className="bg-blue-100 p-3 rounded text-sm space-y-1">
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Role:</strong> <span className="font-mono bg-white px-1 rounded">{user.role || 'undefined'}</span></div>
              <div><strong>Metadata:</strong></div>
              <pre className="bg-white p-2 rounded text-xs overflow-auto">
                {JSON.stringify(user.metadata || {}, null, 2)}
              </pre>
            </div>
          </div>

          {/* Database User Data */}
          {dbUserData && (
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Database User Data:</h4>
              <div className="bg-blue-100 p-3 rounded text-sm space-y-1">
                <div><strong>Email:</strong> {dbUserData.email}</div>
                <div><strong>Role:</strong> <span className="font-mono bg-white px-1 rounded">{dbUserData.role || 'null'}</span></div>
                <div><strong>User Metadata:</strong></div>
                <pre className="bg-white p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(dbUserData.user_metadata || {}, null, 2)}
                </pre>
                <div><strong>Raw User Meta Data:</strong></div>
                <pre className="bg-white p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(dbUserData.raw_user_meta_data || {}, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Building Associations */}
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Building Associations:</h4>
            <div className="bg-blue-100 p-3 rounded text-sm">
              {buildingUserData.length > 0 ? (
                <div className="space-y-2">
                  {buildingUserData.map((building, index) => (
                    <div key={index} className="bg-white p-2 rounded">
                      <div><strong>Building:</strong> {building.building_name || 'Unknown'}</div>
                      <div><strong>Building ID:</strong> <span className="font-mono text-xs">{building.building_id}</span></div>
                      <div><strong>Role:</strong> <span className="font-mono bg-blue-50 px-1 rounded">{building.role}</span></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-600">No building associations found</div>
              )}
            </div>
          </div>

          {/* Quick Fixes */}
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Quick Fixes:</h4>
            <div className="space-y-2">
              {user.email === 'frankie@manage.management' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={fixUserRole}
                  disabled={isLoading}
                >
                  Fix Super Admin Role
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('=== USER DEBUG INFO ===');
                  console.log('Auth Context User:', user);
                  console.log('Database User Data:', dbUserData);
                  console.log('Building User Data:', buildingUserData);
                  console.log('========================');
                }}
              >
                Log Debug Info to Console
              </Button>
            </div>
          </div>

          {/* Expected vs Actual */}
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Analysis:</h4>
            <div className="bg-blue-100 p-3 rounded text-sm space-y-1">
              <div>
                <strong>Expected for frankie@manage.management:</strong>
                <ul className="ml-4 mt-1 list-disc">
                  <li>Role: super-admin</li>
                  <li>Access to all routes</li>
                  <li>Building associations (optional)</li>
                </ul>
              </div>
              <div className="mt-2">
                <strong>Issues Detected:</strong>
                <ul className="ml-4 mt-1 list-disc text-red-700">
                  {!user.role && <li>No role set in auth context</li>}
                  {user.role && user.role !== 'super-admin' && <li>Role is '{user.role}' instead of 'super-admin'</li>}
                  {!dbUserData?.raw_user_meta_data?.role && <li>No role in database metadata</li>}
                  {buildingUserData.length === 0 && <li>No building associations (may be normal for super-admin)</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserDebugger;

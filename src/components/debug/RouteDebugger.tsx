/**
 * Route Debugger Component
 * Helps debug routing and role-based access issues
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';

const RouteDebugger: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <Card className="p-6 bg-blue-50 border-blue-200">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">🔍 Route Debug Info</h3>
      
      <div className="space-y-3 text-sm">
        <div>
          <strong className="text-blue-800">Current Path:</strong>
          <span className="ml-2 font-mono bg-blue-100 px-2 py-1 rounded">
            {location.pathname}
          </span>
        </div>
        
        <div>
          <strong className="text-blue-800">User Email:</strong>
          <span className="ml-2">{user?.email || 'Not logged in'}</span>
        </div>
        
        <div>
          <strong className="text-blue-800">User Role:</strong>
          <span className="ml-2 font-mono bg-blue-100 px-2 py-1 rounded">
            {user?.role || 'No role'}
          </span>
        </div>
        
        <div>
          <strong className="text-blue-800">User Metadata:</strong>
          <pre className="ml-2 mt-1 bg-blue-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(user?.metadata || {}, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong className="text-blue-800">Required Roles for MRI Settings:</strong>
          <span className="ml-2">rtm-director, rmc-director, super-admin</span>
        </div>
        
        <div>
          <strong className="text-blue-800">Access Allowed:</strong>
          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
            user?.role && ['rtm-director', 'rmc-director', 'super-admin'].includes(user.role)
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {user?.role && ['rtm-director', 'rmc-director', 'super-admin'].includes(user.role) ? 'YES' : 'NO'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default RouteDebugger;

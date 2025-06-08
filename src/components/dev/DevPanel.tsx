import React, { useState } from 'react';
import { Code, Database, User, Building2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DevPanel: React.FC = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  // Only show for super user
  if (user?.email !== 'frankie@manage.management') {
    return null;
  }

  const devInfo = {
    currentUser: {
      id: user?.id,
      email: user?.email,
      role: user?.metadata?.role,
      buildingId: user?.metadata?.buildingId,
      buildingName: user?.metadata?.buildingName,
      devMode: user?.metadata?.devMode,
      simulatedEmail: user?.metadata?.simulatedEmail
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      supabaseUrl: process.env.REACT_APP_SUPABASE_URL?.substring(0, 30) + '...',
      buildTime: new Date().toISOString()
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="p-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
          title="Show Dev Panel"
        >
          <Code className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 w-80 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          <span className="text-sm font-medium">Dev Panel</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
          title="Hide Dev Panel"
        >
          <EyeOff className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Current User Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Current User</span>
          </div>
          <div className="text-xs space-y-1 pl-6">
            <div><span className="text-gray-400">Email:</span> {devInfo.currentUser.email}</div>
            <div><span className="text-gray-400">Role:</span> {devInfo.currentUser.role}</div>
            <div><span className="text-gray-400">ID:</span> {devInfo.currentUser.id?.substring(0, 8)}...</div>
            {devInfo.currentUser.devMode && (
              <div className="text-yellow-400">
                <span className="text-gray-400">Simulating:</span> {devInfo.currentUser.simulatedEmail}
              </div>
            )}
          </div>
        </div>

        {/* Building Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Building Context</span>
          </div>
          <div className="text-xs space-y-1 pl-6">
            <div><span className="text-gray-400">Name:</span> {devInfo.currentUser.buildingName}</div>
            <div><span className="text-gray-400">ID:</span> {devInfo.currentUser.buildingId?.substring(0, 8)}...</div>
          </div>
        </div>

        {/* Environment Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">Environment</span>
          </div>
          <div className="text-xs space-y-1 pl-6">
            <div><span className="text-gray-400">Mode:</span> {devInfo.environment.nodeEnv}</div>
            <div><span className="text-gray-400">Supabase:</span> {devInfo.environment.supabaseUrl}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="text-sm font-medium text-orange-400 mb-2">Quick Actions</div>
          <div className="space-y-2">
            <button
              onClick={() => {
                console.log('Current User Context:', devInfo.currentUser);
                console.log('Full User Object:', user);
              }}
              className="w-full text-left text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded transition-colors"
            >
              Log User Context
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                console.log('Storage cleared');
              }}
              className="w-full text-left text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded transition-colors"
            >
              Clear Storage
            </button>
            <button
              onClick={() => {
                window.location.href = '/rtm';
              }}
              className="w-full text-left text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded transition-colors"
            >
              Go to RTM Dashboard
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div>
          <div className="text-sm font-medium text-gray-400 mb-2">Status</div>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
              devInfo.currentUser.devMode 
                ? 'bg-yellow-900 text-yellow-200' 
                : 'bg-green-900 text-green-200'
            }`}>
              {devInfo.currentUser.devMode ? 'DEV MODE' : 'NORMAL'}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-900 text-blue-200">
              SUPER USER
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
              devInfo.environment.nodeEnv === 'development'
                ? 'bg-orange-900 text-orange-200'
                : 'bg-red-900 text-red-200'
            }`}>
              {devInfo.environment.nodeEnv?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevPanel;

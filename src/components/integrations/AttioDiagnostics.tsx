/**
 * Attio Diagnostics Component
 * Helps diagnose Attio integration issues
 */

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, Settings, ExternalLink } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const AttioDiagnostics: React.FC = () => {
  const { user } = useAuth();
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      checks: []
    };

    try {
      // Check 1: User Role
      results.checks.push({
        name: 'User Role Check',
        status: user?.role === 'super-admin' ? 'pass' : 'fail',
        message: user?.role === 'super-admin' 
          ? `✅ User has super-admin role: ${user.role}`
          : `❌ User role is '${user?.role}', expected 'super-admin'`,
        details: {
          currentRole: user?.role,
          expectedRole: 'super-admin',
          userEmail: user?.email
        }
      });

      // Check 2: Environment Variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      results.checks.push({
        name: 'Environment Variables',
        status: (supabaseUrl && supabaseKey) ? 'pass' : 'fail',
        message: (supabaseUrl && supabaseKey) 
          ? '✅ Supabase environment variables are configured'
          : '❌ Missing Supabase environment variables',
        details: {
          supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Missing',
          supabaseKey: supabaseKey ? 'Present' : 'Missing'
        }
      });

      // Check 3: Edge Function Connectivity
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/sync-to-attio`, {
          method: 'OPTIONS', // Use OPTIONS to test connectivity without triggering the function
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
          },
        });

        results.checks.push({
          name: 'Edge Function Connectivity',
          status: response.status < 500 ? 'pass' : 'fail',
          message: response.status < 500 
            ? `✅ Edge Function is accessible (Status: ${response.status})`
            : `❌ Edge Function error (Status: ${response.status})`,
          details: {
            status: response.status,
            statusText: response.statusText,
            url: `${supabaseUrl}/functions/v1/sync-to-attio`
          }
        });
      } catch (error) {
        results.checks.push({
          name: 'Edge Function Connectivity',
          status: 'fail',
          message: `❌ Cannot reach Edge Function: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
            url: `${supabaseUrl}/functions/v1/sync-to-attio`
          }
        });
      }

      // Check 4: Test API Call
      try {
        const testResponse = await fetch(`${supabaseUrl}/functions/v1/sync-to-attio`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'diagnostic@manage.management',
            firstName: 'Diagnostic',
            lastName: 'Test',
            source: 'diagnostic-test'
          }),
        });

        const responseText = await testResponse.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText;
        }

        results.checks.push({
          name: 'Test API Call',
          status: testResponse.ok ? 'pass' : 'warn',
          message: testResponse.ok 
            ? '✅ API call successful'
            : `⚠️ API call failed but function responded (Status: ${testResponse.status})`,
          details: {
            status: testResponse.status,
            response: responseData,
            headers: Object.fromEntries(testResponse.headers.entries())
          }
        });
      } catch (error) {
        results.checks.push({
          name: 'Test API Call',
          status: 'fail',
          message: `❌ API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }

      setDiagnostics(results);
    } catch (error) {
      console.error('Diagnostics error:', error);
      setDiagnostics({
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: []
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warn': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'fail': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Settings className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Attio Integration Diagnostics</h3>
            <p className="text-gray-600 text-sm mt-1">
              Run diagnostics to identify and resolve integration issues
            </p>
          </div>
          <Button
            variant="outline"
            onClick={runDiagnostics}
            disabled={isRunning}
            icon={isRunning ? RefreshCw : Settings}
            className={isRunning ? 'animate-pulse' : ''}
          >
            {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
          </Button>
        </div>

        {diagnostics && (
          <div className="space-y-4">
            <div className="text-xs text-gray-500">
              Last run: {new Date(diagnostics.timestamp).toLocaleString()}
            </div>

            {diagnostics.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-medium">Diagnostics Error</span>
                </div>
                <p className="text-red-700 text-sm mt-1">{diagnostics.error}</p>
              </div>
            )}

            {diagnostics.checks.map((check: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getStatusIcon(check.status)}
                    <span className="ml-2 font-medium text-gray-900">{check.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    check.status === 'pass' ? 'bg-green-100 text-green-800' :
                    check.status === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {check.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{check.message}</p>
                {check.details && (
                  <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer hover:text-gray-800">View Details</summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
                      {JSON.stringify(check.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• If Edge Function connectivity fails, check Supabase project status</li>
                <li>• If API calls fail, verify Attio API key is set in Supabase Edge Function secrets</li>
                <li>• If user role check fails, ensure you're logged in as super-admin</li>
                <li>• Check browser console for additional error details</li>
              </ul>
              <div className="mt-3">
                <Button
                  variant="link"
                  size="sm"
                  rightIcon={<ExternalLink className="h-4 w-4" />}
                  onClick={() => window.open('https://supabase.com/dashboard/project/ncjyndwehkwbjrlewbmf/functions', '_blank')}
                >
                  Open Supabase Functions Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AttioDiagnostics;

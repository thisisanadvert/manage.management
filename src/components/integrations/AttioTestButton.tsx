/**
 * Attio Test Button Component
 * Simple component to test Attio CRM integration
 */

import React, { useState } from 'react';
import { TestTube, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { attioService } from '../../services/attioService';

const AttioTestButton: React.FC = () => {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const userToken = session?.access_token;
      if (!userToken) {
        throw new Error('No user session token available');
      }

      // First, test if the Edge Function is accessible
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-to-attio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@manage.management',
          firstName: 'Test',
          lastName: 'User',
          phone: '07123456789',
          role: 'rtm-director',
          buildingName: 'Test Building',
          buildingAddress: '123 Test Street, London',
          unitNumber: 'Flat 1',
          source: 'integration-test',
          qualificationData: {
            eligibilityScore: 0.85,
            issues: [],
            recommendations: ['Consider RTM formation']
          }
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Success response:', result);

      setResult({
        success: result.success,
        message: result.success
          ? `Success! Person created in Attio with ID: ${result.person_id}`
          : result.error || 'Test failed'
      });
    } catch (error) {
      console.error('Test error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={handleTest}
        disabled={isLoading}
        icon={isLoading ? RefreshCw : TestTube}
        className={isLoading ? 'animate-pulse' : ''}
      >
        {isLoading ? 'Testing Attio Integration...' : 'Test Attio Integration'}
      </Button>

      {result && (
        <div className={`p-4 rounded-lg border ${
          result.success 
            ? 'bg-success-50 border-success-200 text-success-700' 
            : 'bg-error-50 border-error-200 text-error-700'
        }`}>
          <div className="flex items-center">
            {result.success ? (
              <CheckCircle2 size={20} className="mr-2" />
            ) : (
              <AlertTriangle size={20} className="mr-2" />
            )}
            <div>
              <p className="font-medium">
                {result.success ? 'Integration Test Successful!' : 'Integration Test Failed'}
              </p>
              <p className="text-sm mt-1">{result.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttioTestButton;

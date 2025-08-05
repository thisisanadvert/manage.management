/**
 * Attio Test Button Component
 * Simple component to test Attio CRM integration
 */

import React, { useState } from 'react';
import { TestTube, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';
import { attioService } from '../../services/attioService';

const AttioTestButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Test with sample data
      const testResult = await attioService.syncUserToAttio({
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
      });

      setResult({
        success: testResult.success,
        message: testResult.success 
          ? `Success! Person created in Attio with ID: ${testResult.person_id}`
          : testResult.error || 'Test failed'
      });
    } catch (error) {
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

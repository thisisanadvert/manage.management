/**
 * Button Debugger Component
 * Helps debug button click issues
 */

import React from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { AlertTriangle, CheckCircle2, MousePointer } from 'lucide-react';

const ButtonDebugger: React.FC = () => {
  const handleTestClick = (buttonName: string) => {
    console.log(`✅ Button click working: ${buttonName}`);
    alert(`Button "${buttonName}" clicked successfully!`);
  };

  const handleTestClickWithError = () => {
    console.log('❌ Testing button with error');
    throw new Error('Test error in button click');
  };

  const handleTestNavigation = () => {
    console.log('🔄 Testing navigation');
    try {
      window.location.href = '/settings/mri-integration-debug';
    } catch (error) {
      console.error('Navigation error:', error);
      alert(`Navigation error: ${error}`);
    }
  };

  return (
    <Card className="p-6 bg-yellow-50 border-yellow-200">
      <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
        <MousePointer className="h-5 w-5" />
        Button Click Debugger
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-yellow-800 mb-2">Test Basic Button Functionality:</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleTestClick('Primary Button')}
            >
              Test Primary Button
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestClick('Outline Button')}
            >
              Test Outline Button
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleTestClick('Secondary Button')}
            >
              Test Secondary Button
            </Button>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-yellow-800 mb-2">Test Navigation:</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleTestNavigation}
            >
              Test Navigation to MRI Settings
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Testing window.location.href');
                window.location.href = '/rtm';
              }}
            >
              Test Navigation to RTM Dashboard
            </Button>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-yellow-800 mb-2">Test Error Handling:</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              try {
                handleTestClickWithError();
              } catch (error) {
                console.error('Caught error:', error);
                alert(`Caught error: ${error}`);
              }
            }}
          >
            Test Error Handling
          </Button>
        </div>

        <div>
          <h4 className="font-medium text-yellow-800 mb-2">Console Debugging:</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('=== BUTTON DEBUG INFO ===');
              console.log('Current URL:', window.location.href);
              console.log('User Agent:', navigator.userAgent);
              console.log('Document Ready State:', document.readyState);
              console.log('Active Element:', document.activeElement);
              console.log('Event Listeners:', {
                hasJQuery: typeof (window as any).$ !== 'undefined',
                hasReact: typeof React !== 'undefined'
              });
              console.log('========================');
            }}
          >
            Log Debug Info
          </Button>
        </div>

        <div className="mt-4 p-3 bg-yellow-100 rounded text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-yellow-800">Instructions:</strong>
              <ul className="mt-1 text-yellow-700 list-disc list-inside">
                <li>Click each test button above</li>
                <li>Check the browser console for logs</li>
                <li>Note any buttons that don't respond</li>
                <li>Check for JavaScript errors in the console</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ButtonDebugger;

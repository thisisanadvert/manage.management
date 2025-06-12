import React, { useState } from 'react';
import { Building2, Mail, AlertTriangle, CheckCircle2, Clock, Send } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';

const EmailDiagnostic = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isTestingSignup, setIsTestingSignup] = useState(false);
  const [isTestingReset, setIsTestingReset] = useState(false);
  const [signupResult, setSignupResult] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const testSignupEmail = async () => {
    if (!testEmail) return;
    
    setIsTestingSignup(true);
    setSignupResult(null);
    setSignupError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!',
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            firstName: 'Test',
            lastName: 'User',
            role: 'leaseholder'
          }
        }
      });

      if (error) {
        setSignupError(error.message);
      } else {
        setSignupResult('Signup email sent successfully! Check your inbox.');
        // Clean up the test user
        if (data.user) {
          console.log('Test user created, you may want to delete it from Supabase dashboard');
        }
      }
    } catch (error: any) {
      setSignupError(error.message || 'Unknown error occurred');
    } finally {
      setIsTestingSignup(false);
    }
  };

  const testResetEmail = async () => {
    if (!testEmail) return;
    
    setIsTestingReset(true);
    setResetResult(null);
    setResetError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        setResetError(error.message);
      } else {
        setResetResult('Password reset email sent successfully! Check your inbox.');
      }
    } catch (error: any) {
      setResetError(error.message || 'Unknown error occurred');
    } finally {
      setIsTestingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white p-2 rounded">
                <Building2 size={24} />
              </div>
              <span className="text-2xl font-bold text-primary-800 pixel-font">Manage.Management</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Email Diagnostic Tool</h1>
          <p className="text-gray-600 mt-2">Test signup and password reset emails</p>
        </div>

        <div className="space-y-6">
          {/* Test Email Input */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Test Email Configuration</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="test-email" className="block text-sm font-medium text-gray-900 mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  id="test-email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 shadow-sm text-base"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Use your own email address to test if emails are being sent
                </p>
              </div>
            </div>
          </Card>

          {/* Signup Email Test */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Test Signup Email
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                This will attempt to create a test account and send a confirmation email.
              </p>
              
              <Button
                onClick={testSignupEmail}
                disabled={!testEmail || isTestingSignup}
                isLoading={isTestingSignup}
                leftIcon={<Send className="h-4 w-4" />}
              >
                {isTestingSignup ? 'Testing Signup Email...' : 'Test Signup Email'}
              </Button>

              {signupResult && (
                <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-medium">Success!</p>
                    <p className="text-green-700 text-sm">{signupResult}</p>
                  </div>
                </div>
              )}

              {signupError && (
                <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-700 text-sm">{signupError}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Password Reset Email Test */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Test Password Reset Email
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                This will send a password reset email to the test address.
              </p>
              
              <Button
                onClick={testResetEmail}
                disabled={!testEmail || isTestingReset}
                isLoading={isTestingReset}
                leftIcon={<Send className="h-4 w-4" />}
                variant="secondary"
              >
                {isTestingReset ? 'Testing Reset Email...' : 'Test Reset Email'}
              </Button>

              {resetResult && (
                <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-medium">Success!</p>
                    <p className="text-green-700 text-sm">{resetResult}</p>
                  </div>
                </div>
              )}

              {resetError && (
                <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-700 text-sm">{resetError}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Common Issues */}
          <Card className="bg-yellow-50 border-yellow-200">
            <h2 className="text-xl font-semibold mb-4 text-yellow-900">Common Issues & Solutions</h2>
            <div className="space-y-4 text-yellow-800">
              <div>
                <h3 className="font-medium">If emails aren't being sent:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Check Supabase SMTP configuration</li>
                  <li>Verify redirect URLs are correct</li>
                  <li>Check email templates have proper variables</li>
                  <li>Ensure you're not hitting rate limits</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium">If you get rate limit errors:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Wait 60 seconds between attempts</li>
                  <li>Check if the same email was used recently</li>
                  <li>Try with a different email address</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Navigation */}
          <div className="text-center space-x-4">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/login'}
            >
              Back to Login
            </Button>
            <Button
              variant="primary"
              onClick={() => window.open('https://supabase.com/dashboard/project/ncjyndwehkwbjrlewbmf/auth/url-configuration', '_blank')}
            >
              Open Supabase Config
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDiagnostic;

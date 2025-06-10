import React from 'react';
import { Building2, ExternalLink, Copy, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const SupabaseConfig = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const currentOrigin = window.location.origin;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const requiredUrls = [
    `${currentOrigin}/reset-password`,
    `${currentOrigin}/login`,
    `${currentOrigin}/auth/callback`,
    currentOrigin
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Supabase Configuration Guide</h1>
          <p className="text-gray-600 mt-2">Required settings for password reset and authentication</p>
        </div>

        <div className="space-y-6">
          {/* Current Issue */}
          <Card className="border-red-200 bg-red-50">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-red-900">Password Reset Not Working</h2>
                <p className="text-red-700 mt-1">
                  The password reset emails are not including the required authentication tokens. 
                  This is because the redirect URLs are not properly configured in your Supabase project.
                </p>
              </div>
            </div>
          </Card>

          {/* Step 1: Access Supabase Dashboard */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Step 1: Access Supabase Dashboard</h2>
            <div className="space-y-3">
              <p className="text-gray-700">
                Go to your Supabase project dashboard and navigate to the Authentication settings.
              </p>
              <Button
                variant="outline"
                leftIcon={<ExternalLink className="h-4 w-4" />}
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              >
                Open Supabase Dashboard
              </Button>
            </div>
          </Card>

          {/* Step 2: URL Configuration */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Step 2: Configure Redirect URLs</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                In your Supabase project, go to: <strong>Authentication → URL Configuration</strong>
              </p>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Site URL</h3>
                <p className="text-sm text-gray-600 mb-2">Set this as your main site URL:</p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 p-3 bg-gray-100 rounded border text-sm font-mono">
                    {currentOrigin}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(currentOrigin, 'site')}
                  >
                    {copied === 'site' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Redirect URLs</h3>
                <p className="text-sm text-gray-600 mb-2">Add these URLs to the "Redirect URLs" list:</p>
                <div className="space-y-2">
                  {requiredUrls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <code className="flex-1 p-2 bg-gray-100 rounded border text-sm font-mono">
                        {url}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(url, `url-${index}`)}
                      >
                        {copied === `url-${index}` ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Step 3: Email Templates */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Step 3: Verify Email Templates</h2>
            <div className="space-y-3">
              <p className="text-gray-700">
                Go to: <strong>Authentication → Email Templates</strong>
              </p>
              <p className="text-gray-700">
                Ensure the "Reset Password" template includes the ConfirmationURL variable
                and that it's properly formatted.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Default Template Should Include:</h4>
                <code className="text-sm text-blue-800 block">
                  {'<a href="{{ .ConfirmationURL }}">Reset Password</a>'}
                </code>
              </div>
            </div>
          </Card>

          {/* Step 4: Test Configuration */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Step 4: Test the Configuration</h2>
            <div className="space-y-3">
              <p className="text-gray-700">
                After updating the configuration:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Wait a few minutes for the changes to propagate</li>
                <li>Try requesting a password reset again</li>
                <li>Check that the email contains a proper reset link</li>
                <li>Verify the link includes authentication tokens</li>
              </ol>
              
              <div className="flex space-x-3 mt-4">
                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/forgot-password'}
                >
                  Test Password Reset
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/debug-reset'}
                >
                  Debug Reset Link
                </Button>
              </div>
            </div>
          </Card>

          {/* Troubleshooting */}
          <Card className="bg-yellow-50 border-yellow-200">
            <h2 className="text-xl font-semibold mb-4 text-yellow-900">Troubleshooting</h2>
            <div className="space-y-3 text-yellow-800">
              <div>
                <h3 className="font-medium">Still not working?</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Double-check all URLs are exactly correct (no trailing slashes)</li>
                  <li>Ensure you're editing the correct Supabase project</li>
                  <li>Try clearing your browser cache and cookies</li>
                  <li>Check your email spam folder</li>
                  <li>Wait 5-10 minutes after making changes</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium">Common Issues:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li><strong>Wrong project:</strong> Make sure you're in the correct Supabase project</li>
                  <li><strong>Case sensitivity:</strong> URLs must match exactly</li>
                  <li><strong>HTTPS vs HTTP:</strong> Production must use HTTPS</li>
                  <li><strong>Subdomain mismatch:</strong> Ensure the domain matches exactly</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Current Environment Info */}
          <Card className="bg-blue-50 border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">Current Environment</h2>
            <div className="space-y-2 text-blue-800">
              <div className="flex justify-between">
                <span className="font-medium">Current Origin:</span>
                <code className="text-sm">{currentOrigin}</code>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Environment:</span>
                <code className="text-sm">{currentOrigin.includes('localhost') ? 'Development' : 'Production'}</code>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Protocol:</span>
                <code className="text-sm">{window.location.protocol}</code>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center space-x-4">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/login'}
          >
            Back to Login
          </Button>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/forgot-password'}
          >
            Try Password Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupabaseConfig;

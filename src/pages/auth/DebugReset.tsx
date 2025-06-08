import React from 'react';
import { Building2, Info, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button';

const DebugReset = () => {
  const [copied, setCopied] = useState(false);

  const urlInfo = {
    fullUrl: window.location.href,
    hash: window.location.hash,
    search: window.location.search,
    pathname: window.location.pathname,
    origin: window.location.origin
  };

  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const searchParams = new URLSearchParams(window.location.search);

  const extractedParams = {
    accessToken: hashParams.get('access_token') || searchParams.get('access_token'),
    refreshToken: hashParams.get('refresh_token') || searchParams.get('refresh_token'),
    type: hashParams.get('type') || searchParams.get('type'),
    redirectTo: hashParams.get('redirect_to') || searchParams.get('redirect_to')
  };

  const copyToClipboard = () => {
    const debugInfo = JSON.stringify({ urlInfo, extractedParams }, null, 2);
    navigator.clipboard.writeText(debugInfo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white p-2 rounded">
              <Building2 size={24} />
            </div>
            <span className="text-2xl font-bold text-primary-800 pixel-font">Manage.Management</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Password Reset Debug
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Debug information for password reset flow
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Info className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-blue-900">URL Information</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Full URL:</span>
                  <div className="mt-1 p-2 bg-gray-100 rounded text-xs break-all font-mono">
                    {urlInfo.fullUrl}
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Hash:</span>
                  <div className="mt-1 p-2 bg-gray-100 rounded text-xs break-all font-mono">
                    {urlInfo.hash || '(empty)'}
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Search:</span>
                  <div className="mt-1 p-2 bg-gray-100 rounded text-xs break-all font-mono">
                    {urlInfo.search || '(empty)'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-900 mb-3">Extracted Parameters</h3>
              
              <div className="space-y-3 text-sm">
                {Object.entries(extractedParams).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <div className={`mt-1 p-2 rounded text-xs font-mono ${
                      value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {value || '(missing)'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-yellow-900 mb-3">Validation Status</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    extractedParams.accessToken ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span>Access Token: {extractedParams.accessToken ? 'Present' : 'Missing'}</span>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    extractedParams.type === 'recovery' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span>Type: {extractedParams.type || 'Missing'} {extractedParams.type === 'recovery' ? '✓' : '✗'}</span>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    extractedParams.refreshToken ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span>Refresh Token: {extractedParams.refreshToken ? 'Present' : 'Missing (optional)'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Expected URL Format</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>The password reset URL should contain these parameters:</p>
                <div className="p-3 bg-white rounded border text-xs font-mono break-all">
                  {urlInfo.origin}/reset-password#access_token=TOKEN&type=recovery&refresh_token=TOKEN
                </div>
                <p className="text-xs text-gray-500">
                  Or as query parameters: ?access_token=TOKEN&type=recovery&refresh_token=TOKEN
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                leftIcon={copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                className="flex-1"
              >
                {copied ? 'Copied!' : 'Copy Debug Info'}
              </Button>
              
              <Button
                variant="primary"
                onClick={() => window.location.href = '/forgot-password'}
                className="flex-1"
              >
                Request New Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugReset;

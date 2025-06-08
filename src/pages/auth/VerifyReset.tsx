import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const VerifyReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your password reset request...');

  useEffect(() => {
    const verifyAndRedirect = async () => {
      try {
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        console.log('Verify reset params:', { token: !!token, type });

        if (!token || type !== 'recovery') {
          setStatus('error');
          setMessage('Invalid verification link. Please request a new password reset.');
          return;
        }

        // Call the Supabase verification endpoint
        const response = await fetch(
          `https://ncjyndwehkwbjrlewbmf.supabase.co/auth/v1/verify?token=${token}&type=recovery`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (response.ok) {
          // Get the session data from the response
          const data = await response.json();
          console.log('Verification response:', data);

          if (data.access_token) {
            // Set the session in Supabase
            const { error } = await supabase.auth.setSession({
              access_token: data.access_token,
              refresh_token: data.refresh_token || '',
            });

            if (error) {
              console.error('Error setting session:', error);
              setStatus('error');
              setMessage('Failed to verify session. Please try again.');
            } else {
              setStatus('success');
              setMessage('Verification successful! Redirecting to password reset...');
              
              // Redirect to reset password page with the tokens in the URL
              const resetUrl = `/reset-password#access_token=${data.access_token}&type=recovery&refresh_token=${data.refresh_token || ''}`;
              setTimeout(() => {
                navigate(resetUrl);
              }, 2000);
            }
          } else {
            setStatus('error');
            setMessage('Invalid verification response. Please request a new password reset.');
          }
        } else {
          console.error('Verification failed:', response.status, response.statusText);
          setStatus('error');
          setMessage('Verification failed. The link may be expired or invalid.');
        }
      } catch (error) {
        console.error('Error during verification:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyAndRedirect();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white p-2 rounded">
              <Building2 size={24} />
            </div>
            <span className="text-2xl font-bold text-primary-800 pixel-font">Manage.Management</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Password Reset Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Verifying...</h3>
                <p className="mt-1 text-sm text-gray-500">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100">
                  <CheckCircle2 className="h-6 w-6 text-success-600" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Verification Successful</h3>
                <p className="mt-1 text-sm text-gray-500">{message}</p>
              </div>
            )}

            {status === 'error' && (
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error-100">
                  <AlertTriangle className="h-6 w-6 text-error-600" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Verification Failed</h3>
                <p className="mt-1 text-sm text-gray-500">{message}</p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    Request a new password reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyReset;

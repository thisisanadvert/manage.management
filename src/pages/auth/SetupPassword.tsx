import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
import Button from '../../components/ui/Button';
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator';
import { supabase } from '../../lib/supabase';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

const SetupPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const passwordRequirements: PasswordRequirement[] = [
    {
      label: 'At least 8 characters long',
      test: (pwd) => pwd.length >= 8,
      met: password.length >= 8
    },
    {
      label: 'Contains uppercase letter',
      test: (pwd) => /[A-Z]/.test(pwd),
      met: /[A-Z]/.test(password)
    },
    {
      label: 'Contains lowercase letter',
      test: (pwd) => /[a-z]/.test(pwd),
      met: /[a-z]/.test(password)
    },
    {
      label: 'Contains number',
      test: (pwd) => /\d/.test(pwd),
      met: /\d/.test(password)
    },
    {
      label: 'Contains special character',
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  ];

  const isPasswordValid = passwordRequirements.every(req => req.met);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  useEffect(() => {
    // Check if user is coming from email verification or first-time setup
    const checkUserSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setError('Unable to verify your session. Please try again.');
        return;
      }

      if (session?.user) {
        setUserEmail(session.user.email || '');
        
        // Check if this is a first-time setup (user has temp password)
        const isFirstTime = session.user.user_metadata?.needsPasswordSetup;
        if (!isFirstTime) {
          // User already has a password set up, redirect to login
          navigate('/login');
        }
      } else {
        // No session, redirect to login
        navigate('/login');
      }
    };

    checkUserSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords
    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: {
          needsPasswordSetup: false,
          passwordSetupComplete: true
        }
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      
      // Redirect to appropriate dashboard after 2 seconds
      setTimeout(() => {
        const { data: { session } } = supabase.auth.getSession();
        session.then(({ data: { session } }) => {
          if (session?.user) {
            const role = session.user.user_metadata?.role;
            const basePath = role?.split('-')[0] || 'dashboard';
            navigate(`/${basePath}`);
          } else {
            navigate('/login');
          }
        });
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to set up password');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Set up your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Welcome! Please create a secure password for your account
          {userEmail && (
            <span className="block font-medium text-primary-600 mt-1">{userEmail}</span>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100">
                <CheckCircle2 className="h-6 w-6 text-success-600" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Password set up successfully!</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your password has been created. Redirecting you to your dashboard...
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-error-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-error-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-error-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter your new password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Confirm your new password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-4">
                <PasswordStrengthIndicator password={password} />

                {confirmPassword && (
                  <div className="mt-4 flex items-center">
                    <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                      passwordsMatch ? 'bg-success-100' : 'bg-error-100'
                    }`}>
                      {passwordsMatch && <CheckCircle2 className="w-3 h-3 text-success-600" />}
                    </div>
                    <span className={`ml-2 text-sm ${
                      passwordsMatch ? 'text-success-700' : 'text-error-700'
                    }`}>
                      Passwords match
                    </span>
                  </div>
                )}
              </div>

              <div>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full"
                  disabled={!isPasswordValid || !passwordsMatch || isSubmitting}
                  isLoading={isSubmitting}
                >
                  Set Up Password
                </Button>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupPassword;

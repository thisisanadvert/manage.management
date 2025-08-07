import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Lock, Mail } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useSonicBranding } from '../../hooks/useSonicBranding';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [isNewUser, setIsNewUser] = useState(false);
  const { signIn, user } = useAuth();
  const { playLoginSuccess, playWelcome } = useSonicBranding();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is a new user from signup
    const newUser = searchParams.get('newUser');
    if (newUser === 'true') {
      setIsNewUser(true);
    }
  }, [searchParams]);

  // Handle redirect after successful login
  useEffect(() => {
    if (user) {
      console.log('Login component detected user, redirecting...');
      const getRoleBasePath = (role?: string): string => {
        switch (role) {
          case 'rtm-director':
            return '/rtm';
          case 'sof-director':
            return '/sof';
          case 'leaseholder':
            return '/leaseholder';
          case 'shareholder':
            return '/shareholder';
          case 'management-company':
            return '/management';
          case 'super-admin':
            return '/rtm';
          default:
            return '/building-setup';
        }
      };

      const redirectPath = getRoleBasePath(user.role);
      console.log('Login component redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Login form submitted for:', email);
      const { error } = await signIn(email, password);
      if (error) {
        console.error('Login form error:', error);
        // Provide helpful error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else {
          setError(error.message);
        }
      } else {
        console.log('Login form - no error returned, login should be successful');
        // Play login success sound immediately while we have user activation
        try {
          console.log('🎵 Playing login sound from form submission...');

          // Direct approach - bypass the hook system for now
          const audio = new Audio('/audio/login-success.mp3');
          audio.volume = 0.6;
          await audio.play();
          console.log('🎵 Direct login sound played from form!');

        } catch (audioError) {
          console.warn('🎵 Failed to play login sound from form:', audioError);
        }
      }
    } catch (err: any) {
      console.error('Login form catch error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
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
          {isNewUser ? 'Welcome! Sign in to continue' : 'Sign in to your account'}
        </h2>
        {isNewUser ? (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-center text-sm text-green-800">
              <strong>Account created successfully!</strong><br />
              Please sign in with the email and password you just created to complete your setup.
            </p>
          </div>
        ) : (
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              create an account
            </Link>
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-50 text-error-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full"
                disabled={loading}
                isLoading={loading}
              >
                Sign in
              </Button>
            </div>

            <div className="text-center mt-4">
              <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
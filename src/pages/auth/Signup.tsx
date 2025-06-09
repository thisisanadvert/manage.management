import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, UserPlus, Building, Users, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

type SignupType = 'rtm-director' | 'sof-director' | 'homeowner' | 'management-company';

interface WaitlistFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: SignupType;
  buildingName?: string;
  buildingAddress?: string;
  unitNumber?: string;
  companyName?: string;
  phone?: string;
}

const signupOptions = [
  {
    id: 'rtm-director',
    title: 'Right to Manage Director',
    description: 'Join as an RTM director or express interest in becoming one',
    icon: UserPlus,
    color: 'bg-primary-100 text-primary-600',
    available: true,
    fields: ['buildingName', 'buildingAddress', 'unitNumber', 'phone']
  },
  {
    id: 'sof-director',
    title: 'Share of Freehold Director',
    description: 'Manage your Share of Freehold company and building',
    icon: Building,
    color: 'bg-blue-100 text-blue-600',
    available: true,
    fields: ['buildingName', 'buildingAddress', 'unitNumber', 'phone']
  },
  {
    id: 'homeowner',
    title: 'Homeowner',
    description: 'Access your building\'s management platform and participate in decisions',
    icon: Users,
    color: 'bg-green-100 text-green-600',
    subtypes: [
      { id: 'leaseholder', label: 'Leaseholder' },
      { id: 'shareholder', label: 'Share of Freeholder' }
    ],
    fields: ['buildingName', 'unitNumber', 'phone'],
    available: false
  },
  {
    id: 'management-company',
    title: 'Management Company',
    description: 'Manage multiple properties with transparency and efficiency',
    icon: Shield,
    color: 'bg-yellow-100 text-yellow-600',
    fields: ['companyName', 'phone'],
    available: false
  }
];

const Signup = () => {
  const [searchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState<SignupType>('rtm-director');
  const [selectedSubtype, setSelectedSubtype] = useState<string>('');
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isInvitation, setIsInvitation] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState<WaitlistFormData>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'rtm-director'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check for invitation parameters on component mount
  useEffect(() => {
    const inviteParam = searchParams.get('invite');
    if (inviteParam) {
      try {
        const inviteData = JSON.parse(decodeURIComponent(inviteParam));
        setIsInvitation(true);
        setInvitationData(inviteData);
        setFormData({
          email: inviteData.email || '',
          firstName: inviteData.firstName || '',
          lastName: inviteData.lastName || '',
          role: inviteData.role || 'leaseholder',
          buildingName: inviteData.buildingName || '',
          unitNumber: inviteData.unitNumber || ''
        });
        setSelectedType(inviteData.role || 'homeowner');
        setShowWaitlistForm(true);
      } catch (error) {
        console.error('Error parsing invitation data:', error);
        setError('Invalid invitation link. Please contact the person who invited you.');
      }
    }
  }, [searchParams]);

  const handleOptionClick = (type: SignupType) => {
    setSelectedType(type);
    const option = signupOptions.find(opt => opt.id === type);
    setFormData(prev => ({ ...prev, role: type }));
    setShowWaitlistForm(true);
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isInvitation) {
        // Handle invitation signup
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: password,
          options: {
            data: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              role: formData.role,
              buildingId: invitationData.buildingId,
              buildingName: invitationData.buildingName,
              unitNumber: formData.unitNumber,
              invitedBy: invitationData.inviterName
            }
          }
        });

        if (authError) {
          throw authError;
        }

        // If successful, add user to building_users table
        if (authData.user) {
          const { error: buildingUserError } = await supabase
            .from('building_users')
            .insert({
              building_id: invitationData.buildingId,
              user_id: authData.user.id,
              role: formData.role,
              unit_id: null // We'll handle unit assignment later
            });

          if (buildingUserError) {
            console.error('Error adding user to building:', buildingUserError);
            // Don't throw here as the user account was created successfully
          }
        }
      } else {
        // Handle regular waitlist signup - create account but don't auto-login
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: 'temp123', // Temporary password - user will be prompted to set up their own
          options: {
            data: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              role: formData.role,
              buildingName: formData.buildingName,
              buildingAddress: formData.buildingAddress,
              unitNumber: formData.unitNumber,
              phone: formData.phone,
              needsPasswordSetup: true // Flag to indicate password setup is needed
            }
          }
        });

        if (authError) {
          throw authError;
        }

        // Sign out immediately after signup to prevent auto-login
        // User will need to manually login with temp password and get redirected to setup
        if (authData.session) {
          console.log('Signing out after signup to prevent auto-login');
          await supabase.auth.signOut();
        }

        console.log('Regular signup completed successfully');
      }

      console.log('Setting formSubmitted to true');
      setFormSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(typeof error === 'object' && error !== null ? (error as Error).message : 'Failed to register interest');
      setFormSubmitted(false); // Make sure we don't show success on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOption = signupOptions.find(opt => opt.id === selectedType);

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
          {isInvitation ? 'Accept Your Invitation' : 'Create your account'}
        </h2>
        {isInvitation && invitationData ? (
          <p className="mt-2 text-center text-sm text-gray-600">
            You've been invited to join <strong>{invitationData.buildingName}</strong>
          </p>
        ) : (
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {isInvitation && invitationData ? (
              // Show invitation details
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">Invitation Details</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Building:</strong> {invitationData.buildingName}</p>
                  <p><strong>Your Role:</strong> {invitationData.role.charAt(0).toUpperCase() + invitationData.role.slice(1)}</p>
                  <p><strong>Unit:</strong> {invitationData.unitNumber}</p>
                  <p><strong>Invited by:</strong> {invitationData.inviterName}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {signupOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id as SignupType)}
                  className={`relative p-6 border-2 rounded-lg text-left transition-all ${
                    selectedType === option.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${option.color}`}>
                      <option.icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{option.title}</h3>
                        {!option.available && (
                          <Badge variant="secondary">Coming Soon</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-gray-600">{option.description}</p>
                      
                      {option.subtypes && selectedType === option.id && (
                        <div className="mt-4 space-x-4">
                          {option.subtypes.map(subtype => (
                            <button
                              key={subtype.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSubtype(subtype.id);
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedSubtype === subtype.id
                                  ? 'bg-primary-100 text-primary-800'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {subtype.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              </div>
            )}

            {showWaitlistForm && !formSubmitted ? (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {isInvitation ? 'Complete Your Account' : (selectedOption?.available ? 'Register Interest' : 'Join the Waitlist')}
                </h3>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 shadow-sm text-base"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 shadow-sm text-base"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 shadow-sm text-base"
                      required
                      disabled={isInvitation}
                    />
                  </div>

                  {isInvitation && (
                    <>
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 shadow-sm text-base"
                          required
                          minLength={8}
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 shadow-sm text-base"
                          required
                          minLength={8}
                        />
                      </div>
                    </>
                  )}

                  {selectedOption?.fields?.includes('buildingName') && (
                    <div>
                      <label htmlFor="buildingName" className="block text-sm font-medium text-gray-900 mb-2">
                        Building Name
                      </label>
                      <input
                        type="text"
                        id="buildingName"
                        value={formData.buildingName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, buildingName: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 shadow-sm text-base"
                        required
                      />
                    </div>
                  )}

                  {selectedOption?.fields?.includes('buildingAddress') && (
                    <div>
                      <label htmlFor="buildingAddress" className="block text-sm font-medium text-gray-900 mb-2">
                        Building Address
                      </label>
                      <input
                        type="text"
                        id="buildingAddress"
                        value={formData.buildingAddress || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, buildingAddress: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 shadow-sm text-base"
                        required
                      />
                    </div>
                  )}

                  {selectedOption?.fields?.includes('unitNumber') && (
                    <div>
                      <label htmlFor="unitNumber" className="block text-sm font-medium text-gray-900 mb-2">
                        Unit Number
                      </label>
                      <input
                        type="text"
                        id="unitNumber"
                        value={formData.unitNumber || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, unitNumber: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 shadow-sm text-base"
                      />
                    </div>
                  )}

                  {selectedOption?.fields?.includes('phone') && (
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 shadow-sm text-base"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3 text-base"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isInvitation ? 'Create Account' : (selectedOption?.available ? 'Register Interest' : 'Join Waitlist')}
                  </Button>
                </form>
              </div>
            ) : formSubmitted ? (
              <div className="mt-8 p-6 bg-green-50 rounded-lg text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-lg font-medium text-green-900 mb-2">
                  {isInvitation ? 'Welcome!' : 'Thank you!'}
                </h3>
                <p className="text-green-700">
                  {isInvitation
                    ? 'Your account has been created successfully. You can now access your building\'s management platform.'
                    : 'Your account has been created! Please sign in with the temporary password "temp123" to set up your secure password.'
                  }
                </p>
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => navigate('/login')}
                >
                  {isInvitation ? 'Sign In' : 'Sign In to Set Up Password'}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
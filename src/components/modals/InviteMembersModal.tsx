import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Mail, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  UserPlus,
  Send
} from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface MemberInvite {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'leaseholder' | 'shareholder';
  unitNumber: string;
}

const InviteMembersModal = ({ isOpen, onClose, onComplete }: InviteMembersModalProps) => {
  const { user } = useAuth();
  const [invites, setInvites] = useState<MemberInvite[]>([
    { id: '1', email: '', firstName: '', lastName: '', role: 'leaseholder', unitNumber: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [buildingId, setBuildingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.metadata?.buildingId) {
      setBuildingId(user.metadata.buildingId);
    }
  }, [user]);

  const addInvite = () => {
    const newInvite: MemberInvite = {
      id: Date.now().toString(),
      email: '',
      firstName: '',
      lastName: '',
      role: 'leaseholder',
      unitNumber: ''
    };
    setInvites([...invites, newInvite]);
  };

  const removeInvite = (id: string) => {
    if (invites.length > 1) {
      setInvites(invites.filter(invite => invite.id !== id));
    }
  };

  const updateInvite = (id: string, field: keyof MemberInvite, value: string) => {
    setInvites(invites.map(invite => 
      invite.id === id ? { ...invite, [field]: value } : invite
    ));
  };

  const validateInvites = () => {
    const errors: string[] = [];
    const emails = new Set();

    invites.forEach((invite, index) => {
      if (!invite.email.trim()) {
        errors.push(`Email is required for invite ${index + 1}`);
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email)) {
        errors.push(`Invalid email format for invite ${index + 1}`);
      } else if (emails.has(invite.email.toLowerCase())) {
        errors.push(`Duplicate email: ${invite.email}`);
      } else {
        emails.add(invite.email.toLowerCase());
      }

      if (!invite.firstName.trim()) {
        errors.push(`First name is required for invite ${index + 1}`);
      }
      if (!invite.lastName.trim()) {
        errors.push(`Last name is required for invite ${index + 1}`);
      }
      if (!invite.unitNumber.trim()) {
        errors.push(`Unit number is required for invite ${index + 1}`);
      }
    });

    return errors;
  };

  const handleSendInvites = async () => {
    setError(null);
    setSuccess(null);
    
    const validationErrors = validateInvites();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    if (!buildingId) {
      setError('Building ID not found. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send invitations via Supabase Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-member-invites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invites,
          buildingId,
          inviterName: `${user?.metadata?.firstName || ''} ${user?.metadata?.lastName || ''}`.trim(),
          inviterEmail: user?.email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invitations');
      }

      setSuccess(`Successfully sent ${invites.length} invitation${invites.length > 1 ? 's' : ''}!`);
      
      // Mark the onboarding step as complete
      onComplete();
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error('Error sending invites:', err);
      setError(err.message || 'Failed to send invitations. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Mark the step as complete even when skipping
    onComplete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 9999 }}>
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4" onClick={onClose}>
        <div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl"
          style={{ zIndex: 10000 }}
          onClick={(e) => e.stopPropagation()}
        >
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="mr-3 h-6 w-6 text-primary-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Invite Members</h2>
              <p className="text-sm text-gray-600">Add other residents to your building</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-md bg-error-50 p-4 text-sm text-error-500 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md bg-success-50 p-4 text-sm text-success-500 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
              {success}
            </div>
          )}

          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">About Member Invitations</p>
                <p>
                  Invite leaseholders and shareholders to join your building's management platform. 
                  They'll receive an email with instructions to create their account and access the system.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {invites.map((invite, index) => (
              <div key={invite.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Invite {index + 1}</h3>
                  {invites.length > 1 && (
                    <button
                      onClick={() => removeInvite(invite.id)}
                      className="text-error-500 hover:text-error-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={invite.email}
                      onChange={(e) => updateInvite(invite.id, 'email', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="member@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={invite.firstName}
                      onChange={(e) => updateInvite(invite.id, 'firstName', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={invite.lastName}
                      onChange={(e) => updateInvite(invite.id, 'lastName', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Number *
                    </label>
                    <input
                      type="text"
                      value={invite.unitNumber}
                      onChange={(e) => updateInvite(invite.id, 'unitNumber', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="1A"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={invite.role}
                    onChange={(e) => updateInvite(invite.id, 'role', e.target.value)}
                    className="w-full md:w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="leaseholder">Leaseholder</option>
                    <option value="shareholder">Shareholder</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={addInvite}
              leftIcon={<Plus size={16} />}
            >
              Add Another Invite
            </Button>
          </div>

          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip for Now
            </Button>
            
            <Button
              onClick={handleSendInvites}
              disabled={isSubmitting}
              leftIcon={<Send size={16} />}
            >
              {isSubmitting ? 'Sending...' : `Send ${invites.length} Invitation${invites.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteMembersModal;

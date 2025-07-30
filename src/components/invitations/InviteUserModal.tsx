/**
 * Invite User Modal Component
 * Reusable modal for inviting users to buildings with context-specific options
 */

import React, { useState, useEffect } from 'react';
import { X, Mail, User, Building, UserPlus, Copy, Check } from 'lucide-react';
import Button from '../ui/Button';
import { UserBuildingRole, InvitationContext, CreateInvitationRequest } from '../../services/invitationService';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (invitation: CreateInvitationRequest) => Promise<{ success: boolean; code?: string; error?: string }>;
  buildingId: string;
  context: InvitationContext;
  defaultRole?: UserBuildingRole;
  title?: string;
  description?: string;
  contextData?: Record<string, any>;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  buildingId,
  context,
  defaultRole = 'leaseholder',
  title = 'Invite User',
  description = 'Send an invitation to join this building',
  contextData = {}
}) => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    unit_number: '',
    phone: '',
    invited_role: defaultRole,
    invitation_message: '',
    expires_in_days: 7
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const roleOptions: { value: UserBuildingRole; label: string; description: string }[] = [
    { value: 'leaseholder', label: 'Leaseholder', description: 'Standard building resident with basic access' },
    { value: 'freeholder', label: 'Freeholder', description: 'Building owner with maintenance permissions' },
    { value: 'rtm_director', label: 'RTM Director', description: 'Right to Manage director with full permissions' },
    { value: 'rmc_director', label: 'RMC Director', description: 'Resident Management Company director' },
    { value: 'stakeholder', label: 'Stakeholder', description: 'Other interested party with limited access' },
    { value: 'management_company', label: 'Management Company', description: 'Professional management company' }
  ];

  const contextTitles = {
    general: 'Invite User to Building',
    leaseholder_survey: 'Invite Leaseholder to Survey',
    company_formation: 'Invite Director to RTM Company',
    director_invitation: 'Invite Building Director',
    building_setup: 'Invite User to Building'
  };

  const contextDescriptions = {
    general: 'Send an invitation to join this building',
    leaseholder_survey: 'Invite leaseholders to participate in the RTM eligibility survey',
    company_formation: 'Invite qualifying leaseholders to become directors of the RTM company',
    director_invitation: 'Invite experienced individuals to become building directors',
    building_setup: 'Add users to your building during initial setup'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const invitation: CreateInvitationRequest = {
        building_id: buildingId,
        email: formData.email.trim(),
        invited_role: formData.invited_role,
        context,
        first_name: formData.first_name.trim() || undefined,
        last_name: formData.last_name.trim() || undefined,
        unit_number: formData.unit_number.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        invitation_message: formData.invitation_message.trim() || undefined,
        expires_in_days: formData.expires_in_days,
        context_data: contextData
      };

      const result = await onInvite(invitation);

      if (result.success && result.code) {
        setInvitationCode(result.code);
        // Reset form but keep modal open to show code
        setFormData({
          email: '',
          first_name: '',
          last_name: '',
          unit_number: '',
          phone: '',
          invited_role: defaultRole,
          invitation_message: '',
          expires_in_days: 7
        });
      } else {
        setError(result.error || 'Failed to create invitation');
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      setError('Failed to create invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInvitationCode = async () => {
    if (invitationCode) {
      try {
        await navigator.clipboard.writeText(invitationCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy code:', error);
      }
    }
  };

  const handleClose = () => {
    setInvitationCode(null);
    setCopied(false);
    setError(null);
    setIsSubmitting(false);
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      unit_number: '',
      phone: '',
      invited_role: defaultRole,
      invitation_message: '',
      expires_in_days: 7
    });
    onClose();
  };

  if (!isOpen) return null;

  // Add inline styles to ensure modal works properly
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 10000,
    pointerEvents: 'auto'
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    width: '100%',
    maxWidth: '32rem',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    pointerEvents: 'auto'
  };

  return (
    <div
      className="invitation-modal-overlay"
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="invitation-modal-content"
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {title || contextTitles[context]}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {description || contextDescriptions[context]}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {invitationCode ? (
            // Success state - show invitation code
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Invitation Created Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                Share this invitation code with the user. They can use it to join the building.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invitation Code
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={invitationCode}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white font-mono text-lg text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyInvitationCode}
                    className="flex items-center space-x-1"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Instructions for the user:</strong><br />
                  1. Visit the platform and click "Join Building"<br />
                  2. Enter the invitation code above<br />
                  3. Complete their profile setup<br />
                  4. They'll automatically be added to this building
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setInvitationCode(null)}
                  className="flex-1"
                >
                  Create Another Invitation
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            // Form state
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setError(null);
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                    }}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="user@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="John"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Smith"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              {/* Unit and Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Number
                  </label>
                  <input
                    type="text"
                    value={formData.unit_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Flat 1A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="+44 7XXX XXXXXX"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.invited_role}
                  onChange={(e) => setFormData(prev => ({ ...prev, invited_role: e.target.value as UserBuildingRole }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Invitation Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={formData.invitation_message}
                  onChange={(e) => setFormData(prev => ({ ...prev, invitation_message: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  placeholder="Add a personal message..."
                />
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires In
                </label>
                <select
                  value={formData.expires_in_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_in_days: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value={1}>1 day</option>
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-2 border-t border-gray-200 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.email.trim()}
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  <span>{isSubmitting ? 'Creating...' : 'Create Invitation'}</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteUserModal;

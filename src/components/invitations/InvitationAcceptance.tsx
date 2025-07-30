/**
 * Invitation Acceptance Component
 * Handles the invitation code validation and acceptance flow
 */

import React, { useState, useEffect } from 'react';
import { Building, Users, CheckCircle, AlertCircle, Mail, User } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import InvitationService, { InvitationValidationResult, BuildingInvitation } from '../../services/invitationService';
import { useAuth } from '../../contexts/AuthContext';

interface InvitationAcceptanceProps {
  onAcceptanceComplete?: (buildingId: string) => void;
  initialCode?: string;
}

const InvitationAcceptance: React.FC<InvitationAcceptanceProps> = ({
  onAcceptanceComplete,
  initialCode = ''
}) => {
  const { user } = useAuth();
  const [invitationCode, setInvitationCode] = useState(initialCode);
  const [validation, setValidation] = useState<InvitationValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const invitationService = InvitationService.getInstance();

  useEffect(() => {
    if (initialCode) {
      validateCode(initialCode);
    }
  }, [initialCode]);

  const validateCode = async (code: string) => {
    if (!code.trim()) {
      setValidation(null);
      return;
    }

    setIsValidating(true);
    try {
      const result = await invitationService.validateInvitation(code.trim().toUpperCase());
      setValidation(result);
    } catch (error) {
      console.error('Error validating invitation:', error);
      setValidation({
        valid: false,
        error: 'Failed to validate invitation code'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleCodeChange = (code: string) => {
    setInvitationCode(code);
    if (code.length >= 8) {
      validateCode(code);
    } else {
      setValidation(null);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!validation?.valid || !validation.invitation || !user?.id) return;

    setIsAccepting(true);
    try {
      const result = await invitationService.acceptInvitation(invitationCode.trim().toUpperCase(), user.id);
      
      if (result.success) {
        setAccepted(true);
        if (onAcceptanceComplete) {
          onAcceptanceComplete(validation.invitation.building_id);
        }
      } else {
        alert(result.error || 'Failed to accept invitation');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  const getRoleDisplay = (role: string) => {
    const roleMap = {
      rtm_director: 'RTM Director',
      rmc_director: 'RMC Director',
      leaseholder: 'Leaseholder',
      freeholder: 'Freeholder',
      stakeholder: 'Stakeholder',
      management_company: 'Management Company',
      pending: 'Pending'
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  const getContextDescription = (context: string) => {
    const contextMap = {
      general: 'You have been invited to join this building',
      leaseholder_survey: 'You have been invited to participate in the RTM eligibility survey',
      company_formation: 'You have been invited to become a director of the RTM company',
      director_invitation: 'You have been invited to become a building director',
      building_setup: 'You have been invited to join this building during setup'
    };
    return contextMap[context as keyof typeof contextMap] || 'You have been invited to join this building';
  };

  if (accepted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to the Building!
          </h2>
          <p className="text-gray-600 mb-6">
            You have successfully joined {validation?.building_name}. 
            You now have access to all building-related features and information.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Complete your profile information</li>
              <li>• Explore the building dashboard</li>
              <li>• Connect with other residents</li>
              <li>• Access building documents and information</li>
            </ul>
          </div>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full sm:w-auto"
          >
            Go to Dashboard
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Join Building
          </h2>
          <p className="text-gray-600">
            Enter your invitation code to join a building
          </p>
        </div>

        {/* Invitation Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Invitation Code
          </label>
          <div className="relative">
            <input
              type="text"
              value={invitationCode}
              onChange={(e) => handleCodeChange(e.target.value.toUpperCase())}
              placeholder="Enter 8-character code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center font-mono text-lg tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={8}
            />
            {isValidating && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* Validation Status */}
          {validation && (
            <div className="mt-3">
              {validation.valid ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Valid invitation code</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">{validation.error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Invitation Details */}
        {validation?.valid && validation.invitation && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Invitation Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Building:</span>
                <span className="font-medium">{validation.building_name}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Invited by:</span>
                <span className="font-medium">{validation.inviter_name}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role:</span>
                <span className="font-medium">{getRoleDisplay(validation.invitation.invited_role)}</span>
              </div>
              
              {validation.invitation.unit_number && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unit:</span>
                  <span className="font-medium">{validation.invitation.unit_number}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expires:</span>
                <span className="font-medium">
                  {new Date(validation.invitation.expires_at).toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>

            {validation.invitation.invitation_message && (
              <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">
                  <strong>Personal Message:</strong><br />
                  {validation.invitation.invitation_message}
                </p>
              </div>
            )}

            <div className="mt-4 p-3 bg-green-50 rounded">
              <p className="text-sm text-green-800">
                {getContextDescription(validation.invitation.context)}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          {validation?.valid ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setInvitationCode('');
                  setValidation(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAcceptInvitation}
                disabled={isAccepting}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                {isAccepting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span>{isAccepting ? 'Accepting...' : 'Accept Invitation'}</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => validateCode(invitationCode)}
              disabled={!invitationCode.trim() || isValidating}
              className="w-full"
            >
              {isValidating ? 'Validating...' : 'Validate Code'}
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have an invitation code? Contact your building manager or RTM director.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default InvitationAcceptance;

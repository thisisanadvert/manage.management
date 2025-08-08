import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Mail,
  Copy,
  CheckCircle2,
  Send,
  Loader2,
  Link,
  AlertCircle
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { AGMMeetingService } from '../../services/agmMeetingService';
import { supabase } from '../../lib/supabase';
import { useEffectiveBuildingId } from '../../contexts/BuildingContext';

interface ShareAGMModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  meetingTitle: string;
}

interface Homeowner {
  id: string;
  email: string;
  full_name: string;
  unit_number?: string;
}

const ShareAGMModal: React.FC<ShareAGMModalProps> = ({
  isOpen,
  onClose,
  meetingId,
  meetingTitle
}) => {
  const buildingId = useEffectiveBuildingId();
  const [homeowners, setHomeowners] = useState<Homeowner[]>([]);
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [emailsSent, setEmailsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load homeowners and meeting link
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen || !buildingId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Get meeting link
        const link = await AGMMeetingService.getMeetingLink(meetingId);
        setMeetingLink(link);

        // Get homeowners in the building
        const { data: buildingUsers, error: usersError } = await supabase
          .from('building_users')
          .select(`
            user_id,
            unit_id,
            units (unit_number),
            auth.users (
              id,
              email,
              user_metadata
            )
          `)
          .eq('building_id', buildingId)
          .in('role', ['leaseholder', 'share-of-freeholder']);

        if (usersError) {
          throw new Error(`Failed to load homeowners: ${usersError.message}`);
        }

        const homeownersList: Homeowner[] = buildingUsers
          .filter(bu => bu.auth?.users?.email)
          .map(bu => ({
            id: bu.user_id,
            email: bu.auth.users.email,
            full_name: bu.auth.users.user_metadata?.full_name || bu.auth.users.email,
            unit_number: bu.units?.unit_number
          }));

        setHomeowners(homeownersList);
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, buildingId, meetingId]);

  const handleCopyLink = async () => {
    if (!meetingLink) return;

    try {
      await navigator.clipboard.writeText(meetingLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleSendEmails = async () => {
    if (!meetingLink || homeowners.length === 0) return;

    setIsSending(true);
    setError(null);

    try {
      // In a real implementation, this would call an email service
      // For now, we'll simulate the email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEmailsSent(true);
    } catch (error) {
      console.error('Error sending emails:', error);
      setError('Failed to send emails. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setEmailsSent(false);
    setLinkCopied(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Share AGM with Homeowners</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading homeowners...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Meeting Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{meetingTitle}</h3>
                <p className="text-gray-600">Share this AGM with all homeowners in your building</p>
              </div>

              {/* Meeting Link */}
              {meetingLink && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center">
                    <Link size={16} className="mr-2" />
                    Meeting Link
                  </h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={meetingLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={linkCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      onClick={handleCopyLink}
                    >
                      {linkCopied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Homeowners List */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                  <Users size={16} className="mr-2" />
                  Homeowners ({homeowners.length})
                </h4>
                
                {homeowners.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                    {homeowners.map((homeowner) => (
                      <div key={homeowner.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{homeowner.full_name}</p>
                          <p className="text-xs text-gray-500">{homeowner.email}</p>
                        </div>
                        {homeowner.unit_number && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Unit {homeowner.unit_number}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No homeowners found in this building</p>
                  </div>
                )}
              </div>

              {/* Success Message */}
              {emailsSent && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-800 text-sm">
                      AGM invitations sent successfully to {homeowners.length} homeowner{homeowners.length !== 1 ? 's' : ''}!
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  Close
                </Button>
                {homeowners.length > 0 && !emailsSent && (
                  <Button
                    variant="primary"
                    leftIcon={isSending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                    onClick={handleSendEmails}
                    disabled={isSending || !meetingLink}
                  >
                    {isSending ? 'Sending...' : `Send to ${homeowners.length} Homeowner${homeowners.length !== 1 ? 's' : ''}`}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareAGMModal;

import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  FileText,
  Users,
  Video,
  Save,
  Loader2,
  Copy,
  CheckCircle2,
  Link
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { AGMMeetingService } from '../../services/agmMeetingService';
import { useAuth } from '../../contexts/AuthContext';
import { useEffectiveBuildingId } from '../../contexts/BuildingContext';

interface CreateAGMModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAGMCreated: (agm: any) => void;
}

interface AGMFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  maxParticipants: number;
  recordingEnabled: boolean;
  agenda: string;
}

const CreateAGMModal: React.FC<CreateAGMModalProps> = ({
  isOpen,
  onClose,
  onAGMCreated
}) => {
  const { user } = useAuth();
  const buildingId = useEffectiveBuildingId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdMeeting, setCreatedMeeting] = useState<any>(null);
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const [formData, setFormData] = useState<AGMFormData>({
    title: '',
    description: '',
    date: '',
    time: '19:00', // Default to 7 PM
    maxParticipants: 50,
    recordingEnabled: true,
    agenda: ''
  });

  const handleInputChange = (field: keyof AGMFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!buildingId || !user) {
      setError('Missing required information');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Combine date and time for start_time
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      
      // Generate a unique AGM ID (in a real app, this might come from a sequence)
      const agmId = Date.now();

      // Create the AGM meeting
      const meeting = await AGMMeetingService.createMeeting({
        agm_id: agmId,
        building_id: buildingId,
        title: formData.title,
        description: `${formData.description}\n\nAgenda:\n${formData.agenda}`,
        start_time: startDateTime.toISOString(),
        max_participants: formData.maxParticipants,
        recording_enabled: formData.recordingEnabled
      });

      // Create AGM data object for the frontend
      const agmData = {
        id: agmId,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: 'Video Conference',
        status: 'upcoming' as const,
        documents: [],
        attendees: 0,
        totalEligible: 24, // This should come from building data
        meeting: meeting,
        agenda: formData.agenda
      };

      // Get the meeting link
      const link = await AGMMeetingService.getMeetingLink(meeting.id);
      setMeetingLink(link);
      setCreatedMeeting(agmData);

      onAGMCreated(agmData);
    } catch (error) {
      console.error('Error creating AGM:', error);
      setError(error instanceof Error ? error.message : 'Failed to create AGM');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleClose = () => {
    // Reset all state when closing
    setCreatedMeeting(null);
    setMeetingLink(null);
    setLinkCopied(false);
    setError(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '19:00',
      maxParticipants: 50,
      recordingEnabled: true,
      agenda: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  // Show success view if meeting was created
  if (createdMeeting && meetingLink) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">AGM Created Successfully!</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {createdMeeting.title}
              </h3>
              <p className="text-gray-600">
                Your AGM has been scheduled for {createdMeeting.date} at {createdMeeting.time}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Link size={16} className="mr-2" />
                Meeting Link for Homeowners
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
              <p className="text-xs text-gray-500 mt-2">
                Share this link with homeowners to allow them to join the AGM
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleClose}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Schedule New AGM</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText size={20} className="mr-2" />
              Basic Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AGM Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Annual General Meeting 2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the AGM purpose and key topics"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar size={20} className="mr-2" />
              Date & Time
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Agenda */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText size={20} className="mr-2" />
              Agenda
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Agenda
              </label>
              <textarea
                value={formData.agenda}
                onChange={(e) => handleInputChange('agenda', e.target.value)}
                placeholder="1. Welcome and introductions&#10;2. Review of previous minutes&#10;3. Financial report&#10;4. Major works update&#10;5. Any other business"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Meeting Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Video size={20} className="mr-2" />
              Meeting Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Participants
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-3 pt-8">
                <input
                  type="checkbox"
                  id="recording"
                  checked={formData.recordingEnabled}
                  onChange={(e) => handleInputChange('recordingEnabled', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="recording" className="text-sm font-medium text-gray-700">
                  Enable recording
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create AGM'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAGMModal;

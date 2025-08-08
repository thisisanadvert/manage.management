import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  Video,
  PhoneOff,
  Settings,
  UserPlus,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { AGMMeetingControlsProps } from '../../types/agm';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const AGMMeetingControls: React.FC<AGMMeetingControlsProps> = ({
  meeting,
  isHost,
  participantCount,
  onStartMeeting,
  onEndMeeting,
  onToggleRecording,
  className = ''
}) => {
  const [meetingDuration, setMeetingDuration] = useState<string>('00:00');
  const [isRecording, setIsRecording] = useState(meeting.recording_enabled);
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Calculate meeting duration
  useEffect(() => {
    if (meeting.status !== 'active' || !meeting.actual_start_time) {
      return;
    }

    const updateDuration = () => {
      const startTime = new Date(meeting.actual_start_time!);
      const now = new Date();
      const diffMs = now.getTime() - startTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      
      setMeetingDuration(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      );
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [meeting.status, meeting.actual_start_time]);

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    onToggleRecording?.();
  };

  const handleCopyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/agm/join/${meeting.room_name}`;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const getMeetingStatusColor = () => {
    switch (meeting.status) {
      case 'active':
        return 'success';
      case 'scheduled':
        return 'accent';
      case 'ended':
        return 'gray';
      case 'cancelled':
        return 'error';
      default:
        return 'gray';
    }
  };

  const getMeetingStatusText = () => {
    switch (meeting.status) {
      case 'active':
        return 'Live';
      case 'scheduled':
        return 'Scheduled';
      case 'ended':
        return 'Ended';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className={className}>
      <div className="space-y-4">
        {/* Meeting Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge variant={getMeetingStatusColor()} size="lg">
              {getMeetingStatusText()}
            </Badge>
            <div className="flex items-center text-sm text-gray-600">
              <Clock size={16} className="mr-1" />
              <span>{meetingDuration}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users size={16} className="mr-1" />
              <span>{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {isHost && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<UserPlus size={16} />}
                onClick={() => setShowInviteLink(!showInviteLink)}
              >
                Invite
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Settings size={16} />}
              >
                Settings
              </Button>
            </div>
          )}
        </div>

        {/* Invite Link Section */}
        {showInviteLink && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Invite Participants</h4>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={`${window.location.origin}/agm/join/${meeting.room_name}`}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white"
              />
              <Button
                variant="outline"
                size="sm"
                leftIcon={linkCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                onClick={handleCopyInviteLink}
              >
                {linkCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this link with participants to join the meeting
            </p>
          </div>
        )}

        {/* Meeting Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {meeting.status === 'scheduled' && isHost && (
              <Button
                variant="primary"
                leftIcon={<Video size={16} />}
                onClick={onStartMeeting}
              >
                Start Meeting
              </Button>
            )}
            
            {meeting.status === 'active' && isHost && (
              <>
                <Button
                  variant={isRecording ? 'warning' : 'outline'}
                  size="sm"
                  leftIcon={<Video size={16} />}
                  onClick={handleToggleRecording}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
                
                <Button
                  variant="warning"
                  size="sm"
                  leftIcon={<PhoneOff size={16} />}
                  onClick={onEndMeeting}
                >
                  End Meeting
                </Button>
              </>
            )}
          </div>

          {/* Meeting Info */}
          <div className="text-sm text-gray-500">
            Room: <span className="font-mono">{meeting.room_name}</span>
          </div>
        </div>

        {/* Recording Status */}
        {isRecording && meeting.status === 'active' && (
          <div className="flex items-center justify-center p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
              <span className="text-sm font-medium">Recording in progress</span>
            </div>
          </div>
        )}

        {/* Meeting Description */}
        {meeting.description && (
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 mb-1">Meeting Description</h4>
            <p>{meeting.description}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AGMMeetingControls;

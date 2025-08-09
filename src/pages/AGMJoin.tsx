import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Video,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import JitsiMeetingRoom from '../components/agm/JitsiMeetingRoom';
import { AGMLinkService } from '../services/agmLinkService';
import { AGMMeetingService } from '../services/agmMeetingService';
import { useAuth } from '../contexts/AuthContext';
import { AGMMeeting, AGMLink } from '../types/agm';

const AGMJoin: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<AGMMeeting | null>(null);
  const [link, setLink] = useState<AGMLink | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Validate the link and load meeting data
  useEffect(() => {
    const validateAndLoadMeeting = async () => {
      if (!token) {
        setError('Invalid meeting link');
        setIsLoading(false);
        return;
      }

      try {
        const validation = await AGMLinkService.validateLinkAccess(token, user?.id);
        
        if (!validation.isValid) {
          setError(validation.reason || 'Invalid meeting link');
          setIsLoading(false);
          return;
        }

        setMeeting(validation.meeting!);
        setLink(validation.link!);
      } catch (error) {
        console.error('Error validating meeting link:', error);
        setError('Failed to validate meeting link');
      } finally {
        setIsLoading(false);
      }
    };

    validateAndLoadMeeting();
  }, [token, user?.id]);

  const handleJoinMeeting = async () => {
    if (!meeting || !link || !user) return;

    setIsJoining(true);
    setError(null);

    try {
      // Increment link usage
      await AGMLinkService.incrementLinkUsage(link.id);

      // Join the meeting as a participant
      await AGMMeetingService.joinMeeting({
        meeting_id: meeting.id,
        display_name: user.user_metadata?.full_name || user.email || 'Anonymous',
        email: user.email,
        role: 'participant'
      });

      setHasJoined(true);
    } catch (error) {
      console.error('Error joining meeting:', error);
      setError(error instanceof Error ? error.message : 'Failed to join meeting');
    } finally {
      setIsJoining(false);
    }
  };

  const handleMeetingEnd = () => {
    setHasJoined(false);
    navigate('/dashboard');
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Validating meeting link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              variant="primary"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="p-6">
            <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Meeting Not Found</h2>
            <p className="text-gray-600 mb-4">The meeting you're looking for could not be found.</p>
            <Button
              variant="primary"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // If user has joined, show the meeting room
  if (hasJoined) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <JitsiMeetingRoom
          meeting={meeting}
          userDisplayName={user?.user_metadata?.full_name || user?.email || 'Anonymous'}
          userEmail={user?.email}
          isHost={user?.id === meeting.host_id} // Check if user is the actual host of THIS meeting
          onMeetingEnd={handleMeetingEnd}
          onError={(error) => setError(error.message)}
        />
      </div>
    );
  }

  const { date, time } = formatDateTime(meeting.start_time || new Date().toISOString());

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <div className="p-8">
          {/* Meeting Header */}
          <div className="text-center mb-8">
            <div className="bg-primary-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Video className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{meeting.title}</h1>
            {meeting.description && (
              <p className="text-gray-600">{meeting.description}</p>
            )}
          </div>

          {/* Meeting Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <Calendar className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Date</p>
              <p className="text-sm text-gray-600">{date}</p>
            </div>
            <div className="text-center">
              <Clock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Time</p>
              <p className="text-sm text-gray-600">{time}</p>
            </div>
            <div className="text-center">
              <Users className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Participants</p>
              <p className="text-sm text-gray-600">{meeting.participants_count} joined</p>
            </div>
          </div>

          {/* Meeting Status */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              {meeting.status === 'scheduled' && (
                <>
                  <Clock className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="text-amber-700 font-medium">Meeting is scheduled</span>
                </>
              )}
              {meeting.status === 'active' && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-700 font-medium">Meeting is active</span>
                </>
              )}
              {meeting.status === 'ended' && (
                <>
                  <AlertCircle className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700 font-medium">Meeting has ended</span>
                </>
              )}
            </div>
          </div>

          {/* Join Button */}
          {meeting.status === 'active' || meeting.status === 'scheduled' ? (
            <div className="text-center">
              <Button
                variant="primary"
                size="lg"
                leftIcon={isJoining ? <Loader2 size={20} className="animate-spin" /> : <Video size={20} />}
                onClick={handleJoinMeeting}
                disabled={isJoining || !user}
                className="w-full md:w-auto"
              >
                {isJoining ? 'Joining...' : 'Join Meeting'}
              </Button>
              {!user && (
                <p className="text-sm text-gray-500 mt-2">
                  Please sign in to join the meeting
                </p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">This meeting is no longer available to join.</p>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Return to Dashboard
              </Button>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AGMJoin;

import React, { useEffect, useRef, useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { JitsiMeetingRoomProps, JitsiMeetExternalAPI } from '../../types/agm';
import Button from '../ui/Button';
import Card from '../ui/Card';
import AGMMeetingControls from './AGMMeetingControls';
import AGMParticipantList from './AGMParticipantList';

// Declare global JitsiMeetExternalAPI
declare global {
  interface Window {
    JitsiMeetExternalAPI: typeof JitsiMeetExternalAPI;
  }
}

// Define the Jitsi constructor type
interface JitsiMeetExternalAPIConstructor {
  new (domain: string, options: Record<string, unknown>): JitsiMeetExternalAPI;
}

const JitsiMeetingRoom: React.FC<JitsiMeetingRoomProps> = ({
  meeting,
  userDisplayName,
  userEmail,
  isHost,
  onMeetingEnd,
  onParticipantJoined,
  onParticipantLeft,
  onError,
  className = ''
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiMeetExternalAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(true); // Start muted for AGMs
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  // Load Jitsi Meet External API script
  useEffect(() => {
    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        setIsJitsiLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => {
        setIsJitsiLoaded(true);
      };
      script.onerror = () => {
        setError('Failed to load Jitsi Meet. Please check your internet connection.');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    loadJitsiScript();
  }, []);

  // Initialize Jitsi Meet when script is loaded
  useEffect(() => {
    if (!isJitsiLoaded || !jitsiContainerRef.current || apiRef.current) {
      return;
    }

    try {
      const domain = 'meet.jit.si';
      const options = {
        roomName: meeting.room_name,
        width: '100%',
        height: 600,
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: true, // AGM best practice
          startWithVideoMuted: false,
          enableWelcomePage: false,
          requireDisplayName: true,
          prejoinPageEnabled: false,
          enableNoisyMicDetection: true,
          disableAudioLevels: false,
          channelLastN: 20, // Limit video streams for performance
          enableLayerSuspension: true,
          p2p: {
            enabled: false // Disable P2P for larger meetings
          },
          analytics: {
            disabled: true // Privacy for AGMs
          },
          remoteVideoMenu: {
            disabled: false
          },
          disableRemoteMute: !isHost, // Only hosts can mute others
          enableClosePage: false
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
          ].filter(button => {
            // Remove certain buttons for non-hosts
            if (!isHost && ['recording', 'livestreaming', 'mute-everyone'].includes(button)) {
              return false;
            }
            return true;
          }),
          SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
          VIDEO_LAYOUT_FIT: 'both',
          filmStripOnly: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          HIDE_INVITE_MORE_HEADER: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          DISABLE_PRESENCE_STATUS: false,
          MOBILE_APP_PROMO: false,
          CONNECTION_INDICATOR_DISABLED: false,
          VIDEO_QUALITY_LABEL_DISABLED: false,
          RECENT_LIST_ENABLED: false,
          AUTO_PIN_LATEST_SCREEN_SHARE: true,
          DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
          DISABLE_FOCUS_INDICATOR: false,
          TILE_VIEW_MAX_COLUMNS: 5
        },
        userInfo: {
          displayName: userDisplayName,
          email: userEmail
        }
      };

      // Apply custom Jitsi config if provided
      if (meeting.jitsi_config) {
        Object.assign(options, meeting.jitsi_config);
      }

      const JitsiAPI = window.JitsiMeetExternalAPI as JitsiMeetExternalAPIConstructor;
      const api = new JitsiAPI(domain, options);
      apiRef.current = api;

      // Set up event listeners
      api.addEventListeners({
        readyToClose: () => {
          handleMeetingEnd();
        },
        participantJoined: (participant: Record<string, unknown>) => {
          setParticipantCount(prev => prev + 1);
          onParticipantJoined?.(participant);
        },
        participantLeft: (participant: Record<string, unknown>) => {
          setParticipantCount(prev => Math.max(0, prev - 1));
          onParticipantLeft?.(participant);
        },
        videoConferenceJoined: () => {
          setIsLoading(false);
          setParticipantCount(1); // Current user joined
        },
        videoConferenceLeft: () => {
          handleMeetingEnd();
        },
        audioMuteStatusChanged: (event: { muted: boolean }) => {
          setIsAudioMuted(event.muted);
        },
        videoMuteStatusChanged: (event: { muted: boolean }) => {
          setIsVideoMuted(event.muted);
        },
        endpointTextMessageReceived: () => {
          // Handle chat messages if needed
        },
        errorOccurred: (error: { message?: string }) => {
          console.error('Jitsi error:', error);
          setError(`Meeting error: ${error.message || 'Unknown error'}`);
          onError?.(new Error(error.message || 'Jitsi meeting error'));
        }
      });

      // Set moderator status for hosts
      if (isHost) {
        api.executeCommand('toggleLobby', false); // Disable lobby for AGMs
      }

    } catch (err) {
      console.error('Failed to initialize Jitsi Meet:', err);
      setError('Failed to initialize video meeting. Please try again.');
      setIsLoading(false);
      onError?.(err as Error);
    }

    // Cleanup function
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [isJitsiLoaded, meeting.room_name, userDisplayName, userEmail, isHost]);

  const handleMeetingEnd = () => {
    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }
    onMeetingEnd?.();
  };

  const toggleAudio = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleVideo');
    }
  };

  const endMeeting = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
    }
  };

  if (error) {
    return (
      <Card className={`${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Meeting Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              variant="primary" 
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Meeting Controls */}
      <AGMMeetingControls
        meeting={meeting}
        isHost={isHost}
        participantCount={participantCount}
        onEndMeeting={handleMeetingEnd}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Meeting Area */}
        <div className="lg:col-span-3">
          <Card>
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
                    <p className="text-gray-600">Connecting to meeting...</p>
                  </div>
                </div>
              )}
              <div
                ref={jitsiContainerRef}
                className="w-full"
                style={{ minHeight: '600px' }}
              />
            </div>
          </Card>

          {/* Quick Controls */}
          <Card className="mt-4">
            <div className="flex items-center justify-center space-x-4 p-4">
              <Button
                variant="outline"
                size="sm"
                leftIcon={isAudioMuted ? <MicOff size={16} /> : <Mic size={16} />}
                onClick={toggleAudio}
                disabled={isLoading}
              >
                {isAudioMuted ? 'Unmute' : 'Mute'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={isVideoMuted ? <VideoOff size={16} /> : <Video size={16} />}
                onClick={toggleVideo}
                disabled={isLoading}
              >
                {isVideoMuted ? 'Start Video' : 'Stop Video'}
              </Button>
              <Button
                variant="warning"
                size="sm"
                leftIcon={<PhoneOff size={16} />}
                onClick={endMeeting}
                disabled={isLoading}
              >
                Leave Meeting
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar with Participant List */}
        <div className="lg:col-span-1">
          <AGMParticipantList
            meetingId={meeting.id}
            isHost={isHost}
          />
        </div>
      </div>
    </div>
  );
};

export default JitsiMeetingRoom;

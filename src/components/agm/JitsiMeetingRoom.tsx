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

    let connectionTimeout: NodeJS.Timeout;

    const initializeJitsi = async () => {
      // Check for media permissions early to provide better error messages
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } catch (permissionError) {
        console.warn('Media permission check failed:', permissionError);
        // Continue anyway - Jitsi will handle this gracefully
      }

      const domain = 'meet.jit.si';

      // Create a completely unique room name to avoid any lobby persistence
      const timestamp = new Date().getTime();
      const sessionId = Math.random().toString(36).substring(2, 8);
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

      // Use a format that's less likely to trigger lobby: no hyphens, add random elements
      let roomName = `agm${dateStr}${sessionId}${timestamp.toString().slice(-6)}`;

      console.log('Using unique room name:', roomName, 'for meeting:', meeting.room_name);

      const options = {
        roomName: roomName,
        width: '100%',
        height: 600,
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: true, // AGM best practice
          startWithVideoMuted: false,
          enableWelcomePage: false,
          requireDisplayName: true,
          prejoinPageEnabled: false,
          enableNoisyMicDetection: false, // Disable to avoid issues
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
          enableClosePage: false,
          // Add these to fix common issues
          disableDeepLinking: true,
          disableInviteFunctions: false,
          doNotStoreRoom: true,
          enableEmailInStats: false,
          enableUserRolesBasedOnToken: false,
          enableFeaturesBasedOnToken: false,
          // Lobby and moderation settings - multiple approaches to ensure lobby is disabled
          enableLobby: false, // Disable lobby for AGMs
          enableModeratedMode: false, // Disable moderated mode
          enableAutoModeration: false,
          disableLobbyPassword: true,
          lobbyEnabled: false, // Alternative lobby setting
          moderatedRoomServiceUrl: '', // Disable moderated room service
          // Additional security and access settings
          enableGuestDomain: true,
          enableNoAudioSignal: false,
          // Force disable lobby at multiple levels
          disableModeratorIndicator: false,
          hideDisplayName: false,
          // Room creation settings
          createRoom: true,
          openBridgeChannel: true
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'chat', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'tileview'
          ].concat(isHost ? ['recording', 'mute-everyone'] : []),
          SETTINGS_SECTIONS: ['devices', 'language'].concat(isHost ? ['moderator'] : []),
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
          TILE_VIEW_MAX_COLUMNS: 5,
          // Additional settings to reduce errors
          DISABLE_RINGING: true,
          DISABLE_POLYFILLS: false,
          OPTIMAL_BROWSERS: ['chrome', 'chromium', 'firefox', 'safari', 'edge'],
          UNSUPPORTED_BROWSERS: []
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

      console.log('Initializing Jitsi with options:', {
        roomName: options.roomName,
        domain,
        userDisplayName,
        userEmail
      });

      const JitsiAPI = window.JitsiMeetExternalAPI as JitsiMeetExternalAPIConstructor;
      const api = new JitsiAPI(domain, options);
      apiRef.current = api;

      // Set a timeout to catch hanging connections
      connectionTimeout = setTimeout(() => {
        if (isLoading) {
          setError('Connection timeout. Please check your internet connection and try again.');
          setIsLoading(false);
        }
      }, 30000); // 30 second timeout

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
        participantKickedOut: (participant: Record<string, unknown>) => {
          console.log('Participant was kicked out:', participant);
          if (participant.id === 'local') {
            setError('You were removed from the meeting by the host.');
          }
        },
        knockingParticipant: (participant: Record<string, unknown>) => {
          console.log('Participant knocking:', participant);
          // Auto-admit participants for AGMs (if host)
          if (isHost) {
            setTimeout(() => {
              api.executeCommand('answerKnockingParticipant', participant.id, true);
            }, 500);
          }
        },
        videoConferenceJoined: () => {
          clearTimeout(connectionTimeout);
          setIsLoading(false);
          setError(null); // Clear any previous errors
          setParticipantCount(1); // Current user joined
          console.log('Successfully joined Jitsi meeting:', meeting.room_name);
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
        errorOccurred: (errorEvent: any) => {
          clearTimeout(connectionTimeout);
          console.error('Jitsi error:', errorEvent);

          let errorMsg = 'Meeting error occurred';

          // Handle nested error structure - the actual error is in errorEvent.error
          const actualError = errorEvent.error || errorEvent;
          const errorCode = actualError.name || actualError.error || actualError.message || errorEvent.name || errorEvent.error || errorEvent.message;

          console.log('Error code extracted:', errorCode);

          if (errorCode) {
            switch (errorCode) {
              case 'connection.passwordRequired':
                errorMsg = 'This meeting requires a password';
                break;
              case 'connection.connectionDropped':
                errorMsg = 'Connection was lost. Please rejoin the meeting.';
                break;
              case 'conference.max_users':
                errorMsg = 'Meeting is full. Maximum participants reached.';
                break;
              case 'conference.authenticationRequired':
                errorMsg = 'Authentication required to join this meeting';
                break;
              case 'conference.connectionError.membersOnly':
                errorMsg = 'Meeting lobby is enabled. Attempting to create a new room automatically...';

                // Auto-retry with a new room name after 2 seconds
                console.log('Lobby error detected, will auto-retry with new room in 2 seconds...');
                setTimeout(() => {
                  console.log('Auto-retrying with new room...');
                  // Dispose current API and trigger re-initialization
                  if (apiRef.current) {
                    apiRef.current.dispose();
                    apiRef.current = null;
                  }
                  // Clear error to trigger re-initialization
                  setError(null);
                  setIsLoading(true);
                }, 2000);
                break;
              case 'connection.otherError':
                errorMsg = 'Connection error. Please check your internet and try again.';
                break;
              case 'gum.permission_denied':
                errorMsg = 'Camera/microphone access denied. Please allow permissions and refresh.';
                break;
              default:
                errorMsg = `Meeting error: ${errorCode}`;
            }
          }

          setError(errorMsg);
          setIsLoading(false);
          onError?.(new Error(errorMsg));
        },
        connectionFailed: (event: any) => {
          clearTimeout(connectionTimeout);
          console.error('Connection failed:', event);
          setError('Failed to connect to the meeting. Please check your internet connection and try again.');
          setIsLoading(false);
        },
        conferenceError: (event: any) => {
          clearTimeout(connectionTimeout);
          console.error('Conference error:', event);
          setError('Conference connection error. Please try rejoining the meeting.');
          setIsLoading(false);
        }
      });

      // Multiple attempts to disable lobby with different strategies
      const disableLobbyAttempts = [500, 1000, 2000, 3000, 5000];

      disableLobbyAttempts.forEach((delay, index) => {
        setTimeout(() => {
          try {
            console.log(`Lobby disable attempt ${index + 1} at ${delay}ms...`);

            // Try multiple commands that might disable lobby
            api.executeCommand('toggleLobby', false);
            api.executeCommand('setPassword', '');

            // Try alternative commands
            if (api.executeCommand) {
              try {
                api.executeCommand('setLobbyEnabled', false);
                api.executeCommand('setModerationEnabled', false);
              } catch (altError) {
                console.log('Alternative lobby commands not available:', altError);
              }
            }

            if (isHost && index === 0) {
              console.log('Setting host privileges...');
              api.executeCommand('setVideoQuality', 720);
            }

            console.log(`Lobby disable attempt ${index + 1} completed`);
          } catch (e) {
            console.error(`Lobby disable attempt ${index + 1} failed:`, e);
          }
        }, delay);
      });

    };

    // Call the async initialization function
    initializeJitsi().catch((err) => {
      console.error('Failed to initialize Jitsi Meet:', err);
      setError('Failed to initialize video meeting. Please try again.');
      setIsLoading(false);
      onError?.(err as Error);
    });

    // Cleanup function
    return () => {
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
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

  const retryConnection = () => {
    setError(null);
    setIsLoading(true);
    // The useEffect will trigger again and reinitialize Jitsi
  };

  if (error) {
    return (
      <Card className={`${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Meeting Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={retryConnection}
              >
                Try Again
              </Button>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
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

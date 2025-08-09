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
    activeJitsiInstances: Set<string>;
  }
}

// Global instance tracker to prevent multiple instances
if (!window.activeJitsiInstances) {
  window.activeJitsiInstances = new Set();
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
  const instanceIdRef = useRef<string>(`instance_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);
  const [isLoading, setIsLoading] = useState(true);
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0); // Track retries for unique room names
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
      const instanceId = instanceIdRef.current;

      // Check if this instance is already active
      if (window.activeJitsiInstances.has(instanceId)) {
        console.log('⚠️ Instance already active, skipping initialization:', instanceId);
        return;
      }

      // Mark this instance as active
      window.activeJitsiInstances.add(instanceId);
      console.log('✅ Marked instance as active:', instanceId);
      console.log('🔢 Total active instances:', window.activeJitsiInstances.size);

      // Check for media permissions early to provide better error messages
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } catch (permissionError) {
        console.warn('Media permission check failed:', permissionError);
        // Continue anyway - Jitsi will handle this gracefully
      }

      const domain = 'meet.jit.si';

      // Use the meeting's room name or create a proper AGM room name
      // This will work with Jitsi's lobby system as intended
      let roomName = meeting.room_name;

      // If no room name exists, create one that's appropriate for AGMs
      if (!roomName) {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        roomName = `AGM-${meeting.building_id}-${timestamp}-${randomId}`;
      }

      console.log('🏢 AGM MEETING SETUP');
      console.log('🏠 Room Name:', roomName);
      console.log('👤 User:', userDisplayName, userEmail);
      console.log('👑 Is Host:', isHost);
      console.log('🔄 Retry Count:', retryCount);
      console.log('🚪 Lobby Strategy:', isHost ?
        (retryCount === 0 ? 'Host creates room first' : 'Host bypass lobby completely') :
        'Participant uses lobby');

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
          enableNoisyMicDetection: false,
          disableAudioLevels: false,
          channelLastN: 20, // Limit video streams for performance
          enableLayerSuspension: true,
          // CONDITIONAL LOBBY CONFIGURATION - hosts create room without lobby restrictions
          lobby: isHost && retryCount === 0 ? {
            autoKnock: false, // Host doesn't need to knock
            enableChat: false // No lobby chat needed for host
          } : !isHost ? {
            autoKnock: true, // Participants auto-knock when joining
            enableChat: true // Allow lobby chat for participants
          } : undefined, // On retry, don't set lobby config for hosts
          enableLobbyChat: !isHost, // Only enable for participants
          // For hosts on retry, aggressively disable lobby
          ...(isHost && retryCount > 0 ? {
            enableLobby: false,
            lobbyEnabled: false,
            autoKnockLobby: false
          } : {}),
          p2p: {
            enabled: false // Disable P2P for larger meetings
          },
          analytics: {
            disabled: true // Privacy for AGMs
          },
          remoteVideoMenu: {
            disabled: false
          },
          // Security settings - only show lobby controls to hosts
          securityUi: {
            hideLobbyButton: !isHost, // Only show lobby button for hosts
            disableLobbyPassword: !isHost // Only hosts can set passwords
          },
          disableRemoteMute: !isHost, // Only hosts can mute others
          enableClosePage: false,
          disableDeepLinking: true,
          disableInviteFunctions: false,
          doNotStoreRoom: true,
          enableEmailInStats: false,
          // Proper AGM settings
          disableModeratorIndicator: false,
          enableGuestDomain: true,
          enableNoAudioSignal: false,
          disablePolls: false,
          disableReactions: false,
          disableProfile: false
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'chat', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'tileview'
          ].concat(isHost ? ['recording', 'mute-everyone', 'security'] : []),
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
          // ENABLE LOBBY UI ELEMENTS FOR PROPER AGM MANAGEMENT
          ENABLE_LOBBY_CHAT: true,
          ENABLE_LOBBY_SOUNDS: true,
          HIDE_LOBBY_BUTTON: false, // Show lobby button for hosts
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
          email: userEmail,
          id: userEmail?.replace(/[^a-zA-Z0-9]/g, '') || 'user',
          avatarURL: undefined
        },
        // Set JWT token for proper authentication if host
        jwt: isHost ? undefined : undefined // We'll implement proper JWT later if needed
      };

      // Apply custom Jitsi config if provided
      if (meeting.jitsi_config) {
        Object.assign(options, meeting.jitsi_config);
      }

      console.log('🎬 INITIALIZING JITSI MEETING');
      console.log('🏠 Domain:', domain);
      console.log('🏢 Room Name:', options.roomName);
      console.log('👤 User:', userDisplayName, userEmail);
      console.log('👑 Is Host:', isHost);
      console.log('⚙️ AGM Lobby Config:', {
        lobbyAutoKnock: options.configOverwrite.lobby.autoKnock,
        lobbyChat: options.configOverwrite.lobby.enableChat,
        enableLobbyChat: options.configOverwrite.enableLobbyChat,
        securityUi: options.configOverwrite.securityUi,
        isHost: isHost
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

          // If host, enable lobby after joining to control subsequent participants
          if (isHost) {
            setTimeout(() => {
              try {
                console.log('🚪 Host enabling lobby for participant control...');
                api.executeCommand('toggleLobby', true);
                console.log('✅ Lobby enabled for incoming participants');
              } catch (e) {
                console.log('⚠️ Could not enable lobby:', e);
              }
            }, 2000); // Wait 2 seconds after joining
          }
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
                if (isHost) {
                  errorMsg = 'Room creation issue. Please try again to create the meeting room as host.';
                  console.log('Host unable to create room - will retry with different configuration');
                } else {
                  errorMsg = 'This meeting has a lobby. Please wait for the host to admit you, or contact the meeting organizer.';
                  console.log('Participant waiting in lobby - this is expected');
                }
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

      // Set up proper lobby management for AGMs
      if (isHost) {
        // Host setup - enable lobby management features
        setTimeout(() => {
          try {
            console.log('🏠 Setting up host lobby management...');
            // Hosts can manage lobby, set video quality, etc.
            api.executeCommand('setVideoQuality', 720);
            console.log('✅ Host privileges configured');
          } catch (e) {
            console.error('❌ Host setup failed:', e);
          }
        }, 1000);
      } else {
        // Participant setup - they'll wait in lobby if needed
        console.log('👥 Participant joining - will wait in lobby if required');
      }

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
      const instanceId = instanceIdRef.current;

      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }

      // Remove this instance from active tracking
      if (window.activeJitsiInstances.has(instanceId)) {
        window.activeJitsiInstances.delete(instanceId);
        console.log('🧹 Removed instance from tracking:', instanceId);
        console.log('🔢 Remaining active instances:', window.activeJitsiInstances.size);
      }
    };
  }, [isJitsiLoaded, meeting.room_name, userDisplayName, userEmail, isHost, retryCount]);

  const handleMeetingEnd = () => {
    const instanceId = instanceIdRef.current;

    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }

    // Remove this instance from active tracking
    if (window.activeJitsiInstances.has(instanceId)) {
      window.activeJitsiInstances.delete(instanceId);
      console.log('🧹 Meeting ended - removed instance from tracking:', instanceId);
      console.log('🔢 Remaining active instances:', window.activeJitsiInstances.size);
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
    console.log('🔄 Manual retry initiated - disposing current API and creating new room');

    const currentInstanceId = instanceIdRef.current;

    // Properly dispose of current API instance
    if (apiRef.current) {
      try {
        apiRef.current.dispose();
        console.log('✅ Previous API instance disposed');
      } catch (e) {
        console.log('⚠️ Error disposing API:', e);
      }
      apiRef.current = null;
    }

    // Remove current instance from tracking
    if (window.activeJitsiInstances.has(currentInstanceId)) {
      window.activeJitsiInstances.delete(currentInstanceId);
      console.log('🧹 Removed old instance from tracking during retry:', currentInstanceId);
    }

    // Create a completely new instance ID for the retry
    instanceIdRef.current = `instance_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    console.log('🆔 Created new instance ID for retry:', instanceIdRef.current);

    // Clear the container
    if (jitsiContainerRef.current) {
      jitsiContainerRef.current.innerHTML = '';
    }

    // Increment retry count for unique room name
    setRetryCount(prev => prev + 1);

    // Reset state and trigger re-initialization with new room
    setError(null);
    setIsLoading(true);

    console.log('🚀 Retry will create new room with fresh timestamp and retry count');
    console.log('🔢 Active instances before retry:', window.activeJitsiInstances.size);
    // The useEffect will trigger again and reinitialize Jitsi with a new room name
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

/**
 * AGM (Annual General Meeting) Types
 * TypeScript interfaces for AGM meetings and video conferencing integration
 */

// ============================================================================
// AGM Meeting Types
// ============================================================================

export type AGMMeetingStatus = 'scheduled' | 'active' | 'ended' | 'cancelled';

export type ParticipantRole = 'host' | 'moderator' | 'participant';

export interface AGMMeeting {
  id: string;
  agm_id: number;
  building_id: string;
  room_name: string;
  host_id: string;
  title: string;
  description?: string;
  status: AGMMeetingStatus;
  start_time?: string;
  end_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  participants_count: number;
  max_participants: number;
  recording_enabled: boolean;
  recording_url?: string;
  meeting_password?: string;
  jitsi_config?: JitsiConfig;
  created_at: string;
  updated_at: string;
}

export interface AGMMeetingParticipant {
  id: string;
  meeting_id: string;
  user_id?: string;
  display_name: string;
  email?: string;
  role: ParticipantRole;
  joined_at?: string;
  left_at?: string;
  duration_minutes: number;
  is_anonymous: boolean;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Jitsi Meet Configuration Types
// ============================================================================

export interface JitsiConfig {
  roomName: string;
  width?: string | number;
  height?: string | number;
  parentNode?: HTMLElement;
  configOverwrite?: JitsiConfigOverwrite;
  interfaceConfigOverwrite?: JitsiInterfaceConfig;
  jwt?: string;
  onload?: () => void;
  invitees?: Array<{ id: string; name: string; avatar?: string }>;
  devices?: {
    audioInput?: string;
    audioOutput?: string;
    videoInput?: string;
  };
  userInfo?: {
    displayName?: string;
    email?: string;
  };
}

export interface JitsiConfigOverwrite {
  startWithAudioMuted?: boolean;
  startWithVideoMuted?: boolean;
  enableWelcomePage?: boolean;
  enableUserRolesBasedOnToken?: boolean;
  enableFeaturesBasedOnToken?: boolean;
  requireDisplayName?: boolean;
  prejoinPageEnabled?: boolean;
  enableNoisyMicDetection?: boolean;
  resolution?: number;
  constraints?: {
    video?: {
      aspectRatio?: number;
      height?: { ideal?: number; max?: number; min?: number };
    };
  };
  disableAudioLevels?: boolean;
  channelLastN?: number;
  enableLayerSuspension?: boolean;
  p2p?: {
    enabled?: boolean;
    stunServers?: Array<{ urls: string }>;
  };
  analytics?: {
    disabled?: boolean;
  };
  remoteVideoMenu?: {
    disabled?: boolean;
  };
  disableRemoteMute?: boolean;
  enableClosePage?: boolean;
}

export interface JitsiInterfaceConfig {
  TOOLBAR_BUTTONS?: string[];
  SETTINGS_SECTIONS?: string[];
  VIDEO_LAYOUT_FIT?: string;
  filmStripOnly?: boolean;
  SHOW_JITSI_WATERMARK?: boolean;
  SHOW_WATERMARK_FOR_GUESTS?: boolean;
  SHOW_BRAND_WATERMARK?: boolean;
  BRAND_WATERMARK_LINK?: string;
  SHOW_POWERED_BY?: boolean;
  SHOW_PROMOTIONAL_CLOSE_PAGE?: boolean;
  RANDOM_AVATAR_URL_PREFIX?: boolean;
  RANDOM_AVATAR_URL_SUFFIX?: boolean;
  FILM_STRIP_MAX_HEIGHT?: number;
  ENABLE_FEEDBACK_ANIMATION?: boolean;
  DISABLE_VIDEO_BACKGROUND?: boolean;
  HIDE_INVITE_MORE_HEADER?: boolean;
  DISABLE_JOIN_LEAVE_NOTIFICATIONS?: boolean;
  DISABLE_PRESENCE_STATUS?: boolean;
  MOBILE_APP_PROMO?: boolean;
  MAXIMUM_ZOOMING_COEFFICIENT?: number;
  SUPPORT_URL?: string;
  CONNECTION_INDICATOR_DISABLED?: boolean;
  VIDEO_QUALITY_LABEL_DISABLED?: boolean;
  RECENT_LIST_ENABLED?: boolean;
  OPTIMAL_BROWSERS?: string[];
  UNSUPPORTED_BROWSERS?: string[];
  AUTO_PIN_LATEST_SCREEN_SHARE?: boolean;
  DISABLE_DOMINANT_SPEAKER_INDICATOR?: boolean;
  DISABLE_FOCUS_INDICATOR?: boolean;
  DISABLE_LOCAL_VIDEO_FLIP?: boolean;
  DISABLE_POLYFILLS?: boolean;
  DISABLE_RINGING?: boolean;
  AUDIO_LEVEL_PRIMARY_COLOR?: string;
  AUDIO_LEVEL_SECONDARY_COLOR?: string;
  POLICY_LOGO?: Record<string, unknown>;
  LOCAL_THUMBNAIL_RATIO?: number;
  REMOTE_THUMBNAIL_RATIO?: number;
  LIVE_STREAMING_HELP_LINK?: string;
  MOBILE_DOWNLOAD_LINK_ANDROID?: string;
  MOBILE_DOWNLOAD_LINK_IOS?: string;
  APP_NAME?: string;
  NATIVE_APP_NAME?: string;
  PROVIDER_NAME?: string;
  LANG_DETECTION?: boolean;
  INVITATION_POWERED_BY?: boolean;
  AUTHENTICATION_ENABLE?: boolean;
  REMOTECONTROL_HOVERED?: boolean;
  TILE_VIEW_MAX_COLUMNS?: number;
}

// ============================================================================
// Jitsi API Event Types
// ============================================================================

export interface JitsiMeetExternalAPI {
  addEventListeners: (events: { [key: string]: (...args: unknown[]) => void }) => void;
  removeEventListeners: (events: string[]) => void;
  executeCommand: (command: string, ...args: unknown[]) => void;
  executeCommands: (commands: { [command: string]: unknown }) => void;
  getParticipantsInfo: () => Array<{
    participantId: string;
    displayName: string;
    formattedDisplayName: string;
    role: string;
  }>;
  isAudioMuted: () => Promise<boolean>;
  isVideoMuted: () => Promise<boolean>;
  dispose: () => void;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface JitsiMeetingRoomProps {
  meeting: AGMMeeting;
  userDisplayName: string;
  userEmail?: string;
  isHost: boolean;
  onMeetingEnd?: () => void;
  onParticipantJoined?: (participant: Record<string, unknown>) => void;
  onParticipantLeft?: (participant: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export interface AGMMeetingControlsProps {
  meeting: AGMMeeting;
  isHost: boolean;
  participantCount: number;
  onStartMeeting?: () => void;
  onEndMeeting?: () => void;
  onToggleRecording?: () => void;
  className?: string;
}

// ============================================================================
// Service Types
// ============================================================================

export interface CreateAGMMeetingRequest {
  agm_id: number;
  building_id: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  max_participants?: number;
  recording_enabled?: boolean;
  meeting_password?: string;
}

export interface UpdateAGMMeetingRequest {
  title?: string;
  description?: string;
  status?: AGMMeetingStatus;
  start_time?: string;
  end_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  participants_count?: number;
  recording_url?: string;
}

export interface JoinMeetingRequest {
  meeting_id: string;
  display_name: string;
  email?: string;
  role?: ParticipantRole;
  is_anonymous?: boolean;
}

// ============================================================================
// AGM Data Types (from existing frontend)
// ============================================================================

export interface AGMData {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'completed';
  documents: Array<{
    name: string;
    type: string;
  }>;
  attendees: number;
  totalEligible: number;
  recording?: string;
  minutes?: string;
  decisions?: string[];
}

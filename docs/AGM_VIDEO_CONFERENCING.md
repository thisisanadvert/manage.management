# AGM Video Conferencing Integration

This document describes the Jitsi Meet video conferencing integration for Annual General Meetings (AGMs) in the Manage.Management platform.

## Overview

The AGM video conferencing feature allows RTM/RMC directors to host virtual AGMs directly within the platform using Jitsi Meet's free cloud service. No external signups or additional software are required.

## Features

### Core Functionality
- **One-click meeting creation** for AGM hosts
- **Secure room generation** using building ID and AGM ID
- **Role-based access control** (hosts vs participants)
- **Real-time participant tracking** and management
- **Meeting recording capabilities** (for hosts)
- **Integrated participant list** with join/leave tracking
- **Meeting duration tracking** and statistics

### User Experience
- **No external signups required** - uses free meet.jit.si service
- **Responsive design** - works on desktop, tablet, and mobile
- **Integrated UI** - seamlessly embedded in AGM workflow
- **British English** - consistent with platform language
- **Accessibility features** - keyboard navigation and screen reader support

## Architecture

### Database Schema

#### `agm_meetings` Table
```sql
- id (UUID, Primary Key)
- agm_id (Integer) - References frontend AGM data
- building_id (UUID) - References buildings table
- room_name (VARCHAR) - Unique Jitsi room identifier
- host_id (UUID) - References auth.users
- title (VARCHAR) - Meeting title
- description (TEXT) - Meeting description
- status (ENUM) - scheduled, active, ended, cancelled
- start_time, end_time (TIMESTAMPTZ) - Scheduled times
- actual_start_time, actual_end_time (TIMESTAMPTZ) - Actual times
- participants_count (INTEGER) - Current participant count
- max_participants (INTEGER) - Maximum allowed participants
- recording_enabled (BOOLEAN) - Recording preference
- recording_url (TEXT) - URL to recording (if available)
- meeting_password (VARCHAR) - Optional meeting password
- jitsi_config (JSONB) - Custom Jitsi configuration
```

#### `agm_meeting_participants` Table
```sql
- id (UUID, Primary Key)
- meeting_id (UUID) - References agm_meetings
- user_id (UUID) - References auth.users (nullable for anonymous)
- display_name (VARCHAR) - Participant display name
- email (VARCHAR) - Participant email
- role (ENUM) - host, moderator, participant
- joined_at, left_at (TIMESTAMPTZ) - Join/leave timestamps
- duration_minutes (INTEGER) - Calculated participation duration
- is_anonymous (BOOLEAN) - Whether participant is anonymous
- user_agent (TEXT) - Browser/device information
- ip_address (INET) - IP address for audit purposes
```

### Components

#### `JitsiMeetingRoom`
Main component that embeds Jitsi Meet iframe and handles:
- Jitsi External API initialization
- Event handling (join, leave, errors)
- Audio/video controls
- Meeting lifecycle management

#### `AGMMeetingControls`
Meeting management interface providing:
- Meeting status display
- Start/end meeting controls
- Recording controls (for hosts)
- Invite link generation
- Participant count display

#### `AGMParticipantList`
Real-time participant management showing:
- Active participants with roles
- Previously joined participants
- Participation duration tracking
- Host controls for participant management

### Services

#### `AGMMeetingService`
Core service handling:
- Meeting CRUD operations
- Participant management
- Room name generation
- Permission checking
- Database interactions

## Configuration

### Jitsi Meet Settings
The integration uses optimised settings for AGM meetings:

```typescript
{
  // Audio muted on join (AGM best practice)
  startWithAudioMuted: true,
  startWithVideoMuted: false,
  
  // Streamlined experience
  enableWelcomePage: false,
  requireDisplayName: true,
  prejoinPageEnabled: false,
  
  // Performance optimisations
  channelLastN: 20, // Limit video streams
  enableLayerSuspension: true,
  p2p: { enabled: false }, // Disable P2P for larger meetings
  
  // Privacy settings
  analytics: { disabled: true },
  
  // Host controls
  disableRemoteMute: !isHost // Only hosts can mute others
}
```

### Interface Customisation
```typescript
{
  // Toolbar buttons (filtered by role)
  TOOLBAR_BUTTONS: [
    'microphone', 'camera', 'desktop', 'chat',
    'recording', 'raisehand', 'tileview', 'invite'
  ],
  
  // Branding
  SHOW_JITSI_WATERMARK: false,
  SHOW_POWERED_BY: false,
  
  // Layout
  TILE_VIEW_MAX_COLUMNS: 5,
  AUTO_PIN_LATEST_SCREEN_SHARE: true
}
```

## Security

### Row Level Security (RLS)
All database tables use RLS policies ensuring:
- **Building-based access control** - users can only access meetings for their buildings
- **Role-based permissions** - directors can manage meetings, others can participate
- **Host privileges** - meeting hosts have full control over their meetings
- **Super admin access** - frankie@manage.management has full access for support

### Data Protection
- **IP address logging** for audit purposes
- **User agent tracking** for security monitoring
- **Anonymous participation** support for external attendees
- **Secure room names** generated using building and AGM identifiers

## Usage

### For RTM/RMC Directors (Hosts)
1. Navigate to AGMs page
2. Find upcoming AGM
3. Click "Start Video Meeting" button
4. Meeting room is created automatically
5. Share invite link with participants
6. Manage meeting using integrated controls
7. End meeting when complete

### For Participants
1. Receive invite link from host
2. Click link to join meeting
3. Enter display name
4. Join meeting directly in browser
5. Participate using Jitsi controls

## Technical Requirements

### Dependencies
- `@jitsi/react-sdk` - Official Jitsi React integration
- Existing Supabase setup for database operations
- Modern browser with WebRTC support

### Browser Compatibility
- Chrome 74+
- Firefox 70+
- Safari 12+
- Edge 79+

### Network Requirements
- Stable internet connection
- WebRTC support (enabled by default in modern browsers)
- No additional firewall configuration required (uses HTTPS)

## Monitoring and Analytics

### Meeting Metrics
- Participant count tracking
- Meeting duration calculation
- Join/leave event logging
- Recording status monitoring

### Audit Trail
- Meeting creation/deletion events
- Participant join/leave tracking
- Host action logging
- Error event recording

## Troubleshooting

### Common Issues
1. **Meeting won't start**: Check user permissions and building access
2. **Audio/video issues**: Verify browser permissions for microphone/camera
3. **Connection problems**: Check internet connectivity and WebRTC support
4. **Participant can't join**: Verify invite link and room availability

### Error Handling
- Graceful fallback for Jitsi loading failures
- User-friendly error messages
- Automatic retry mechanisms
- Comprehensive error logging

## Future Enhancements

### Planned Features
- **Calendar integration** for scheduled meetings
- **Email notifications** for meeting invites
- **Meeting templates** for recurring AGMs
- **Advanced recording management**
- **Integration with AGM voting system**
- **Mobile app support**

### Potential Integrations
- **Outlook/Google Calendar** sync
- **Zoom/Teams** as alternative providers
- **AI meeting transcription**
- **Automated meeting minutes generation**

## Support

For technical support or feature requests related to AGM video conferencing:
- Contact: frankie@manage.management
- Documentation: This file and inline code comments
- Testing: See `src/components/agm/__tests__/` for test examples

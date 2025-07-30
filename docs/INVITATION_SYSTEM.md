# User Invitation System Documentation

## Overview

The User Invitation System is a comprehensive solution for inviting users to join buildings and participate in various building management activities. It supports multiple contexts including general building invitations, leaseholder surveys, RTM company formation, and director recruitment.

## Architecture

### Database Schema

The system uses three main tables:

1. **`building_invitations`** - Core invitation management
2. **`user_building_roles`** - Enhanced user-building associations with role-based permissions
3. **`invitation_responses`** - Audit trail for invitation lifecycle

### Key Features

- **Unique invitation codes** - 8-character alphanumeric codes
- **Role-based permissions** - Different access levels based on user roles
- **Context-aware invitations** - Tailored for different use cases
- **Expiration management** - Automatic expiry of old invitations
- **Audit trail** - Complete tracking of invitation lifecycle
- **Integration with existing components** - Seamless integration with RTM tools

## User Roles and Permissions

### Role Types
- `rtm_director` - RTM company directors (full permissions)
- `rmc_director` - RMC directors (full permissions)
- `leaseholder` - Standard building residents (basic access)
- `freeholder` - Building owners (maintenance permissions)
- `stakeholder` - Other interested parties (limited access)
- `management_company` - Professional management companies (full permissions)
- `pending` - Users awaiting role assignment

### Permission Matrix
| Role | Invite Users | Manage Finances | Manage Maintenance | View Documents |
|------|-------------|----------------|-------------------|----------------|
| RTM Director | ✅ | ✅ | ✅ | ✅ |
| RMC Director | ✅ | ✅ | ✅ | ✅ |
| Management Company | ✅ | ✅ | ✅ | ✅ |
| Freeholder | ❌ | ❌ | ✅ | ✅ |
| Leaseholder | ❌ | ❌ | ❌ | ✅ |
| Stakeholder | ❌ | ❌ | ❌ | ✅ |

## Invitation Contexts

### 1. General Building Invitations
- **Context**: `general`
- **Purpose**: Standard building membership
- **Default Role**: `leaseholder`
- **Usage**: Building Setup page, general user management

### 2. Leaseholder Survey
- **Context**: `leaseholder_survey`
- **Purpose**: RTM eligibility survey participation
- **Default Role**: `leaseholder`
- **Usage**: RTM Timeline - Leaseholder Survey component

### 3. Company Formation
- **Context**: `company_formation`
- **Purpose**: RTM company director recruitment
- **Default Role**: `rtm_director`
- **Usage**: RTM Timeline - Company Formation component

### 4. Director Invitation
- **Context**: `director_invitation`
- **Purpose**: Experienced director recruitment
- **Default Role**: `rtm_director` or `rmc_director`
- **Usage**: Specialised director recruitment

### 5. Building Setup
- **Context**: `building_setup`
- **Purpose**: Initial building configuration
- **Default Role**: Based on inviter's discretion
- **Usage**: Building Setup page during initial setup

## Components

### Core Components

#### 1. InvitationService (`src/services/invitationService.ts`)
Central service handling all invitation operations:
- `createInvitation()` - Create new invitations
- `validateInvitation()` - Validate invitation codes
- `acceptInvitation()` - Accept invitations and create user roles
- `revokeInvitation()` - Revoke pending invitations
- `getBuildingInvitations()` - List building invitations
- `getBuildingUsers()` - List building users with roles

#### 2. InviteUserModal (`src/components/invitations/InviteUserModal.tsx`)
Reusable modal for creating invitations:
- Context-aware form fields
- Role selection with descriptions
- Personal message support
- Expiration date configuration
- Success state with invitation code display

#### 3. UserManagementList (`src/components/invitations/UserManagementList.tsx`)
Comprehensive user and invitation management:
- Active users display with roles and permissions
- Pending invitations with status tracking
- Invitation revocation
- Statistics dashboard
- Permission indicators

#### 4. InvitationAcceptance (`src/components/invitations/InvitationAcceptance.tsx`)
User-facing invitation acceptance interface:
- Code validation with real-time feedback
- Invitation details display
- Acceptance workflow
- Success confirmation

### Integration Points

#### 1. Building Setup Page (`src/pages/BuildingSetup.tsx`)
- **New Feature**: User Management tab
- **Functionality**: 
  - Tabbed interface (Building Information | User Management)
  - Full user management capabilities
  - Context-aware invitations for building setup

#### 2. RTM Leaseholder Survey (`src/components/rtm/LeaseholderSurvey.tsx`)
- **New Feature**: "Invite Leaseholders" button
- **Functionality**:
  - Survey-specific invitations
  - Automatic addition to survey participant list
  - Context data for survey tracking

#### 3. RTM Company Formation (`src/components/rtm/RTMCompanyFormation.tsx`)
- **New Feature**: "Invite Directors" button
- **Functionality**:
  - Director-specific invitations
  - Automatic addition to directors list
  - Company formation context data

#### 4. Join Building Page (`src/pages/JoinBuilding.tsx`)
- **New Feature**: Standalone invitation acceptance page
- **Route**: `/join`
- **Functionality**:
  - Public access (logged in and non-logged in users)
  - URL parameter support (`/join?code=ABC12345`)
  - Authentication flow integration
  - Help and guidance section

## Database Migration

### Migration File: `supabase/migrations/20250730000002_create_invitation_system.sql`

Key features:
- **Row Level Security (RLS)** enabled on all tables
- **Policies** for building-based access control
- **Indexes** for performance optimisation
- **Triggers** for automatic timestamp updates
- **Functions** for invitation code generation and expiry management

### Security Policies

1. **Directors can manage invitations** - Only users with director roles and invite permissions can create/manage invitations
2. **Building-based access** - Users can only see invitations for buildings they're associated with
3. **Public invitation validation** - Anyone can validate invitation codes (required for acceptance flow)
4. **User role management** - Users can manage their own roles, directors can manage building roles

## Usage Examples

### Creating an Invitation

```typescript
const invitationService = InvitationService.getInstance();

const invitation: CreateInvitationRequest = {
  building_id: 'building-uuid',
  email: 'user@example.com',
  invited_role: 'leaseholder',
  context: 'general',
  first_name: 'John',
  last_name: 'Smith',
  unit_number: 'Flat 1A',
  expires_in_days: 7
};

const result = await invitationService.createInvitation(invitation, currentUserId);
if (result.data) {
  console.log('Invitation code:', result.data.invitation_code);
}
```

### Validating and Accepting an Invitation

```typescript
// Validate
const validation = await invitationService.validateInvitation('ABC12345');
if (validation.valid) {
  // Accept
  const result = await invitationService.acceptInvitation('ABC12345', userId);
  if (result.success) {
    // User is now part of the building
  }
}
```

### Using the Invite Modal

```tsx
<InviteUserModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onInvite={handleCreateInvitation}
  buildingId={buildingId}
  context="leaseholder_survey"
  defaultRole="leaseholder"
  title="Invite Leaseholders to Survey"
  description="Invite leaseholders to participate in the RTM eligibility survey"
/>
```

## Security Considerations

1. **Invitation Code Security**: 8-character codes provide sufficient entropy while remaining user-friendly
2. **Expiration Management**: Automatic expiry prevents indefinite access via old codes
3. **Role-Based Access**: Only authorised users can create invitations
4. **Building Isolation**: Users can only invite to buildings they have permissions for
5. **Audit Trail**: Complete tracking of invitation lifecycle for compliance

## Future Enhancements

1. **Email Integration**: Automatic email sending with invitation codes
2. **Bulk Invitations**: CSV upload for multiple invitations
3. **Custom Expiry Rules**: Role-based or context-based expiry periods
4. **Invitation Templates**: Pre-configured invitation messages
5. **Analytics Dashboard**: Invitation success rates and user adoption metrics

## Testing

The system has been tested with:
- ✅ TypeScript compilation
- ✅ Build process integration
- ✅ Component integration
- ✅ Database schema validation

## Deployment Notes

1. **Database Migration**: Run the migration file to create required tables and functions
2. **Environment Variables**: No additional environment variables required
3. **Dependencies**: All dependencies are already included in the project
4. **Backwards Compatibility**: System is fully backwards compatible with existing functionality

## Support

For questions or issues with the invitation system:
1. Check the component documentation in the respective files
2. Review the database schema and policies
3. Test invitation flow in development environment
4. Contact the development team for assistance

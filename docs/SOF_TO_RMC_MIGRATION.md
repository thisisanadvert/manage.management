# SOF to RMC Director Migration Documentation

## Overview
This document outlines the changes made to update the user type terminology from "Share of Freehold Director" to "Resident Management Company (RMC) Director" and the functional differences implemented.

## Terminology Changes

### Before
- **User Type ID**: `sof-director`
- **Display Name**: "Share of Freehold Director"
- **Route Base**: `/sof`

### After
- **User Type ID**: `rmc-director`
- **Display Name**: "Resident Management Company (RMC) Director"
- **Route Base**: `/rmc`

## Database Schema Considerations

### Current Database State
The database migrations contain the old `sof-director` enum values in several places:

1. **User Role Enum**: Multiple migration files define `user_role` enum with `sof-director`
2. **Building Admin Functions**: Functions like `is_building_admin()` reference `sof-director`
3. **Onboarding Functions**: SOF-specific onboarding functions use `sof-director`
4. **Demo Data**: Demo documents and users reference `sof@demo.com` and `sof-director`

### Migration Strategy

#### Option 1: Database Migration (Recommended for Production)
```sql
-- Update the user_role enum
ALTER TYPE user_role RENAME VALUE 'sof-director' TO 'rmc-director';

-- Update existing user records
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data, 
  '{role}', 
  '"rmc-director"'
) 
WHERE raw_user_meta_data->>'role' = 'sof-director';

-- Update building_users table
UPDATE building_users 
SET role = 'rmc-director' 
WHERE role = 'sof-director';

-- Update any other tables that reference the old role
```

#### Option 2: Backward Compatibility (Current Implementation)
The frontend code has been updated to use `rmc-director`, but the database can continue to accept both values during a transition period. This requires:

1. Updating enum definitions to include both values
2. Mapping old values to new display names in the frontend
3. Gradual migration of existing users

### Functions Requiring Updates

1. **`is_building_admin()`**: Update to reference `rmc-director` instead of `sof-director`
2. **`create_sof_onboarding_steps()`**: Rename to `create_rmc_onboarding_steps()`
3. **`handle_new_sof_signup()`**: Rename to `handle_new_rmc_signup()`

## Functional Differences Implemented

### RTM Director (`rtm-director`)
- ✅ Full access to RTM formation tools
- ✅ Access to all building management features
- ✅ Can access `/rtm` routes and RTM-specific components

### RMC Director (`rmc-director`)
- ❌ **No access to RTM formation tools** (they already own the freehold)
- ✅ Access to Share Certificates management
- ✅ Access to all other building management features
- ✅ Can access `/rmc` routes

### Access Control Implementation

#### Navigation (Sidebar)
```typescript
// RTM Formation - Only RTM directors
{
  name: 'RTM Formation',
  href: `${baseRoute}/rtm`,
  icon: Scale,
  roles: ['rtm-director'] // Removed 'rmc-director'
}

// Share Certificates - Only RMC directors
{
  name: 'Share Certificates',
  href: `${baseRoute}/shares`,
  icon: Share2,
  roles: ['rmc-director'] // Specific to RMC
}
```

#### Dashboard Quick Actions
```typescript
// RTM tools only for RTM directors
if (userRole === 'rtm-director') {
  baseActions.push({
    title: 'RTM Formation',
    description: 'Access RTM formation tools',
    icon: Scale,
    color: 'success',
    onClick: () => navigate(`/${basePath}/rtm`),
  });
}

// Share Certificates for RMC directors
if (userRole === 'rmc-director') {
  baseActions.push({
    title: 'Share Certificates',
    description: 'Manage share certificates',
    icon: Scale,
    color: 'primary',
    onClick: () => navigate(`/${basePath}/shares`),
  });
}
```

## Files Updated

### Core Type Definitions
- `src/contexts/AuthContext.tsx`
- `src/utils/userUtils.ts`
- `src/App.tsx`

### User Interface Components
- `src/components/landing/RoleSelector.tsx`
- `src/pages/Signup.tsx`
- `src/pages/auth/Signup.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/dashboard/DashboardWidgets.tsx`

### Development Tools
- `src/components/dev/DevUserSwitcher.tsx`

### Marketing Content
- `src/pages/Landing.tsx`

## Testing Checklist

### ✅ Completed
- [x] User type definitions updated
- [x] Navigation restrictions implemented
- [x] Dashboard quick actions updated
- [x] Role display names updated
- [x] Registration flows updated
- [x] Route definitions updated
- [x] Dev tools updated

### 🔄 Requires Database Migration
- [ ] Database enum values updated
- [ ] Existing user records migrated
- [ ] Database functions updated
- [ ] Demo data updated

### 🧪 Manual Testing Required
- [ ] RMC director cannot access RTM formation tools
- [ ] RTM director retains full RTM access
- [ ] Both user types can access all other features
- [ ] Registration flow works with new terminology
- [ ] Super admin can switch between user types

## Rollback Plan

If issues arise, the changes can be rolled back by:

1. Reverting the frontend code changes
2. Updating route definitions back to `/sof`
3. Restoring old display names and role mappings

The database changes should be planned carefully and tested in a staging environment before production deployment.

## Next Steps

1. **Test the current implementation** with the live application
2. **Plan database migration** for production deployment
3. **Update documentation** and user guides with new terminology
4. **Communicate changes** to existing users
5. **Monitor for any issues** after deployment

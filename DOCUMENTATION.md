# Manage.Management Platform Documentation

## Overview

Manage.Management is a comprehensive property management platform designed to facilitate communication and management between RTM directors, leaseholders, and management companies. The platform provides role-specific features and access controls through a modern React-based web application.

## Architecture

### Tech Stack
- Frontend: React 18 with TypeScript
- Styling: Tailwind CSS
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- State Management: React Context
- Routing: React Router v6
- Icons: Lucide React
- Charts: Recharts

### Environment Support
- Production: Full feature set
- Demo: Restricted feature set with demo data

## User Roles & Permissions

### RTM Director
- **Access Level**: Building-wide administrative access
- **Permissions**:
  - Create/manage announcements
  - Initiate and manage polls
  - Financial oversight
  - Document management
  - Issue management
  - Supplier network access
- **Database Tables**:
  - Full access to `buildings` they manage
  - Full access to `announcements`, `polls`, `issues`
  - Read access to `building_users`

### Leaseholder
- **Access Level**: Unit-specific access
- **Permissions**:
  - View announcements
  - Participate in polls
  - Report issues
  - Access documents
  - View financial information
- **Database Tables**:
  - Read access to `buildings` they belong to
  - Read access to `announcements`, `polls`
  - Create/read access to `issues`
  - Read access to their unit in `units`

### Management Company
- **Access Level**: Building-wide operational access
- **Permissions**:
  - Create/manage announcements
  - Financial management
  - Issue resolution
  - Document management
  - Supplier management
- **Database Tables**:
  - Read access to `buildings` they manage
  - Full access to `announcements`, `issues`
  - Read access to `polls`
  - Read access to `building_users`

## Database Schema

### Core Tables

#### buildings
```sql
CREATE TABLE buildings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  total_units integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### units
```sql
CREATE TABLE units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  unit_number text NOT NULL,
  floor_plan_type text,
  square_footage numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### building_users
```sql
CREATE TABLE building_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  user_id uuid REFERENCES auth.users(id),
  role text NOT NULL,
  unit_id uuid REFERENCES units(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(building_id, user_id)
);
```

### Feature Tables

#### issues
```sql
CREATE TABLE issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL,
  reported_by uuid REFERENCES auth.users(id),
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### announcements
```sql
CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  posted_by uuid REFERENCES auth.users(id),
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### polls
```sql
CREATE TABLE polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  required_majority integer NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled with specific policies:

1. **Building Access**
   - Users can only access buildings they belong to
   - Verified through `building_users` table

2. **Unit Access**
   - Leaseholders can only access their assigned units
   - RTM directors and management can access all units in their buildings

3. **Announcement Control**
   - RTM directors and management can create/edit
   - All users can view announcements for their buildings

4. **Poll Management**
   - RTM directors can create/manage polls
   - All users can view and vote in polls for their buildings

### Authentication Flow

1. User signs up/logs in through Supabase Auth
2. Role and metadata stored in `auth.users`
3. Building association created in `building_users`
4. Access controlled through RLS policies

## Feature Flags

Feature flags are managed through the `environments.ts` configuration:

```typescript
interface EnvironmentConfig {
  isDemo: boolean;
  apiUrl: string;
  features: {
    supplierNetwork: boolean;
    rtmFormation: boolean;
    documentStorage: boolean;
  };
}
```

## Development Guidelines

1. **State Management**
   - Use React Context for global state
   - Keep component state local when possible
   - Use custom hooks for shared logic

2. **Component Structure**
   - Maintain clear separation of concerns
   - Use TypeScript interfaces for props
   - Follow atomic design principles

3. **Styling**
   - Use Tailwind CSS utility classes
   - Maintain consistent spacing/color schemes
   - Follow mobile-first responsive design

4. **Error Handling**
   - Implement proper error boundaries
   - Use try/catch for async operations
   - Provide user-friendly error messages

5. **Testing**
   - Write unit tests for critical functions
   - Test component rendering and interactions
   - Verify RLS policies work as expected

## Deployment

The application supports two deployment environments:

1. **Production**
   - Full feature set
   - Strict security policies
   - Production database

2. **Demo**
   - Limited feature set
   - Demo data
   - Separate database instance
   - Accessible through `/demo` path prefix

## Future Considerations

1. **Planned Features**
   - Document storage and sharing
   - Advanced financial reporting
   - Mobile application
   - Integration with property management software

2. **Scalability**
   - Consider caching strategies
   - Optimize database queries
   - Implement rate limiting

3. **Security Enhancements**
   - Two-factor authentication
   - Audit logging
   - Enhanced access controls
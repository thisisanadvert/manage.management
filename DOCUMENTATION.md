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

## MRI Qube Integration

### Overview
The MRI Qube integration provides seamless synchronisation between our platform and the MRI Qube property management system via the Vaultre API. This integration enables automatic data flow for properties, financial transactions, budgets, invoices, maintenance work orders, and compliance documents.

### Key Features
- **OAuth 2.0 Authentication**: Secure token-based authentication with automatic refresh
- **Real-time Synchronisation**: Configurable sync frequencies from real-time to manual
- **Comprehensive Data Coverage**: Properties, units, tenancies, transactions, budgets, invoices, maintenance, and documents
- **Conflict Resolution**: Intelligent handling of data discrepancies between systems
- **Audit Logging**: Complete audit trail of all sync operations and data changes
- **Error Handling**: Robust error tracking and retry mechanisms

### Architecture

#### Services
- **`mriQubeService.ts`**: Core API integration service with OAuth 2.0 authentication
- **`mriSyncService.ts`**: Synchronisation engine with configurable intervals and conflict resolution

#### Database Schema
The integration uses 13 dedicated tables with proper relationships and RLS policies:

**Core Tables:**
- `mri_properties`: Building/property data from MRI
- `mri_units`: Individual unit information
- `mri_tenancies`: Leaseholder and tenancy data
- `mri_contacts`: Contact information for tenants, owners, directors
- `mri_transactions`: Financial transactions and payments
- `mri_budgets`: Service charge budgets and forecasts
- `mri_invoices`: Supplier invoices and approvals
- `mri_maintenance`: Work orders and maintenance requests
- `mri_documents`: Compliance and legal documents

**Management Tables:**
- `mri_auth_tokens`: Secure OAuth token storage
- `mri_sync_configs`: Per-building sync configuration
- `mri_sync_status`: Sync operation tracking
- `mri_sync_errors`: Error logging and resolution
- `mri_audit_log`: Complete audit trail

#### Security
- **Row Level Security (RLS)**: Building-based access control for all MRI tables
- **Role-based Permissions**: RTM/RMC directors, management companies, and homeowners have appropriate access levels
- **Encrypted Storage**: API credentials stored securely with encryption at rest
- **Audit Logging**: All MRI data changes tracked with user attribution

### Configuration

#### Environment Variables
```bash
# MRI Qube Integration via Vaultre API
VITE_MRI_API_BASE_URL=https://api.vaultre.com.au
VITE_MRI_CLIENT_ID=your_mri_client_id_here
VITE_MRI_CLIENT_SECRET=your_mri_client_secret_here
VITE_MRI_ENVIRONMENT=sandbox
```

#### Sync Frequencies
- **Real-time**: Every 15 minutes (for critical data like transactions)
- **Hourly**: Every hour (for frequently changing data)
- **Daily**: Once per day (for regular updates)
- **Weekly**: Once per week (for less critical data)
- **Monthly**: Once per month (for static data)
- **Manual**: Only when triggered manually

### Components

#### Frontend Components
- **`MRIConnectionStatus`**: Displays API connection status and health
- **`MRISyncDashboard`**: Comprehensive sync status and control dashboard
- **`MRIConfigurationModal`**: Settings and configuration interface
- **`MRIDataSourceIndicator`**: Shows when data originates from MRI Qube
- **`MRIFinancialDashboard`**: Enhanced financial dashboard with MRI data integration
- **`MRISection20Tracker`**: Section 20 compliance tracking with MRI diary integration

#### Settings Page
- **`MRIIntegrationSettings`**: Complete settings page with tabs for overview, sync settings, security, and advanced configuration

### Usage

#### Initial Setup
1. Configure API credentials in environment variables
2. Run database migrations to create MRI tables
3. Configure sync settings per building via the settings page
4. Test connection and perform initial sync

#### Daily Operations
- Automatic synchronisation based on configured frequencies
- Real-time status monitoring via the sync dashboard
- Error tracking and resolution through the admin interface
- Data source indicators show which data comes from MRI vs local sources

#### Financial Integration
- Combined financial dashboard showing both local and MRI data
- Budget vs actual reporting with MRI budget integration
- Section 20 compliance tracking using MRI work orders and diary
- Service charge management with MRI transaction data

### API Rate Limiting
- **Requests per minute**: 60
- **Requests per hour**: 1,000
- **Burst limit**: 10 concurrent requests
- **Retry logic**: Exponential backoff with maximum 3 retries
- **Timeout handling**: 30-second request timeout with connection pooling

### Error Handling
- **Validation Errors**: Data format and structure validation
- **API Errors**: Network and authentication error handling
- **Database Errors**: Transaction rollback and data integrity protection
- **Mapping Errors**: Field mapping and transformation error tracking

### Monitoring & Troubleshooting
- **Connection Status**: Real-time API connection monitoring
- **Sync Status**: Per-entity sync status tracking
- **Error Logs**: Detailed error logging with retry counts
- **Performance Metrics**: Sync duration and throughput monitoring
- **Audit Trail**: Complete history of all sync operations

### Testing
Comprehensive test suite covering:
- **Unit Tests**: Individual service method testing
- **Integration Tests**: End-to-end sync workflow testing
- **Error Scenarios**: Network failures, authentication errors, data conflicts
- **Performance Tests**: Rate limiting and timeout handling

### Troubleshooting Guide

#### Common Issues

**Connection Failures**
- Verify API credentials are correctly configured
- Check network connectivity to Vaultre API
- Ensure environment variables are properly set
- Test connection using the built-in connection test

**Sync Errors**
- Review sync error logs in the admin dashboard
- Check data format compatibility between systems
- Verify building and property ID mappings
- Ensure sufficient API rate limit headroom

**Authentication Issues**
- Refresh OAuth tokens manually if needed
- Verify client credentials with MRI support
- Check token expiry and refresh logic
- Review audit logs for authentication failures

**Data Discrepancies**
- Compare data between MRI and local systems
- Check sync timestamps and frequencies
- Review conflict resolution settings
- Manually trigger sync for specific entities

#### Support Resources
- MRI Qube API documentation
- Vaultre API support portal
- Internal troubleshooting guides
- Error code reference documentation
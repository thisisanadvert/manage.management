import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import RTMDashboard from './pages/dashboards/RTMDashboard';
import LeaseholderDashboard from './pages/dashboards/LeaseholderDashboard';
import ManagementDashboard from './pages/dashboards/ManagementDashboard';
import IssuesManagement from './pages/IssuesManagement';
import Finances from './pages/Finances';
import Documents from './pages/Documents';
import Announcements from './pages/Announcements';
import Voting from './pages/Voting';
import AGMs from './pages/AGMs';
import RTMManagement from './pages/RTMManagement';
import ShareCertificates from './pages/ShareCertificates';
import SupplierNetwork from './pages/SupplierNetwork';
import LegalTemplates from './pages/LegalTemplates';
import DirectorSupport from './pages/DirectorSupport';
import ComplianceMonitoringDashboard from './components/compliance/ComplianceMonitoringDashboard';
import LegalResourcesDashboard from './components/legal/LegalResourcesDashboard';
import LegalAccuracyDashboard from './components/legal/LegalAccuracyDashboard';
import UserImpersonationDashboard from './components/admin/UserImpersonationDashboard';
import { useAuth } from './contexts/AuthContext';
import FormPersistenceService from './services/formPersistenceService';


import BuildingDetails from './pages/BuildingDetails';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import MRIIntegrationSettings from './pages/MRIIntegrationSettings';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import SetupPassword from './pages/auth/SetupPassword';
import DebugReset from './pages/auth/DebugReset';
import VerifyReset from './pages/auth/VerifyReset';
import SupabaseConfig from './pages/auth/SupabaseConfig';
import EmailDiagnostic from './pages/auth/EmailDiagnostic';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import AuthRedirectHandler from './components/auth/AuthRedirectHandler';
import BuildingSetup from './pages/BuildingSetup';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import Help from './pages/Help';
import RTMResources from './pages/RTMResources';
import About from './pages/About';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import LeaseholderRights from './pages/LeaseholderRights';
import RTMQualify from './pages/RTMQualify';
import IssueManagement from './pages/features/IssueManagement';
import FinancialTracking from './pages/features/FinancialTracking';
import DocumentManagement from './pages/features/DocumentManagement';
import VotingSystem from './pages/features/VotingSystem';
import CommunicationHub from './pages/features/CommunicationHub';
import PageLoader from './components/ui/PageLoader';

// Helper function to get the correct base path for a user role
function getRoleBasePath(role?: string): string {
  switch (role) {
    case 'rtm-director':
      return '/rtm';
    case 'rmc-director':
      return '/rmc';
    case 'leaseholder':
      return '/leaseholder';
    case 'shareholder':
      return '/shareholder';
    case 'management-company':
      return '/management';
    case 'super-admin':
      return '/rtm';
    default:
      console.warn('Unknown or missing role:', role, 'redirecting to building setup');
      return '/building-setup';
  }
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function RoleBasedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user } = useAuth();
  const location = useLocation();

  console.log('🔐 RoleBasedRoute Check:', {
    currentPath: location.pathname,
    userRole: user?.role,
    userEmail: user?.email,
    allowedRoles,
    hasRole: !!user?.role,
    isAllowed: user?.role && allowedRoles.includes(user.role),
    isSuperAdmin: user?.email === 'frankie@manage.management'
  });

  // Special handling for frankie@manage.management - always allow access
  if (user?.email === 'frankie@manage.management') {
    console.log('✅ RoleBasedRoute - Super admin access granted for frankie@manage.management');
    return <>{children}</>;
  }

  // Check if user has required role
  if (!user?.role || !allowedRoles.includes(user.role)) {
    console.log('❌ RoleBasedRoute - Access denied. User role:', user?.role, 'Allowed roles:', allowedRoles);

    let redirectPath = '/login';
    if (user?.role) {
      // Handle role-based redirects with proper mapping
      redirectPath = getRoleBasePath(user.role);
    } else {
      console.warn('No role found for user in RoleBasedRoute');
      redirectPath = '/building-setup';
    }

    console.log('🔄 RoleBasedRoute redirecting to:', redirectPath);
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  console.log('✅ RoleBasedRoute - Access granted!');
  return <>{children}</>;
}

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Initialize form persistence service
  React.useEffect(() => {
    const formPersistenceService = FormPersistenceService.getInstance();
    formPersistenceService.initialize();
  }, []);

  // Show loading screen while auth is initializing
  if (loading) {
    return <PageLoader message="Initializing..." />;
  }

  // Prevent landing page access for logged-in users
  if (user && (location.pathname === '/' || location.pathname === '/pricing')) {
    let basePath: string;

    console.log('App.tsx redirect - User role:', user.role, 'Full user:', user);

    switch (user.role) {
      case 'rtm-director':
        basePath = '/rtm';
        break;
      case 'rmc-director':
        basePath = '/rmc';
        break;
      case 'leaseholder':
        basePath = '/leaseholder';
        break;
      case 'shareholder':
        basePath = '/shareholder';
        break;
      case 'management-company':
        basePath = '/management';
        break;
      case 'super-admin':
        basePath = '/rtm';
        break;
      default:
        console.warn('Unknown or missing role in App.tsx:', user.role, 'redirecting to building setup');
        basePath = '/building-setup';
        break;
    }

    console.log('App.tsx redirecting to:', basePath);
    return <Navigate to={basePath} replace />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={!user ? (
        <>
          <AuthRedirectHandler />
          <Landing />
        </>
      ) : <Navigate to={getRoleBasePath(user.role)} replace />} />
      <Route path="/pricing" element={!user ? <Pricing /> : <Navigate to={getRoleBasePath(user.role)} replace />} />

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to={getRoleBasePath(user.role)} replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/setup-password" element={<SetupPassword />} />
      <Route path="/debug-reset" element={<DebugReset />} />
      <Route path="/verify-reset" element={<VerifyReset />} />
      <Route path="/supabase-config" element={<SupabaseConfig />} />
      <Route path="/verify-reset" element={<VerifyReset />} />

      {/* Legal routes */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />

      {/* Public info pages */}
      <Route path="/help" element={<Help />} />
      <Route path="/rtm-resources" element={<RTMResources />} />
      <Route path="/about" element={<About />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:postId" element={<Blog />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/leaseholder-rights" element={<LeaseholderRights />} />

      {/* RTM Qualification Lead Magnet */}
      <Route path="/qualify" element={<RTMQualify />} />

      {/* Feature pages */}
      <Route path="/features/issue-management" element={<IssueManagement />} />
      <Route path="/features/financial-tracking" element={<FinancialTracking />} />
      <Route path="/features/document-management" element={<DocumentManagement />} />
      <Route path="/features/voting-system" element={<VotingSystem />} />
      <Route path="/features/communication-hub" element={<CommunicationHub />} />

      {/* User account pages - accessible when logged in */}
      <Route path="/profile" element={
        <PrivateRoute>
          <MainLayout>
            <Profile />
          </MainLayout>
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </PrivateRoute>
      } />
      
      {/* Profile and Settings routes */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Profile />} />
      </Route>

      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Settings />} />
        <Route path="mri-integration" element={
          <RoleBasedRoute allowedRoles={['rtm-director', 'rmc-director', 'super-admin']}>
            <MRIIntegrationSettings />
          </RoleBasedRoute>
        } />
        <Route path="mri-integration-debug" element={<MRIIntegrationSettings />} />
      </Route>
      
      {/* RTM Director Routes */}
      <Route
        path="/rtm/*"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={['rtm-director', 'super-admin']}>
              <MainLayout />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<RTMDashboard />} />
        <Route path="issues" element={<IssuesManagement />} />
        <Route path="finances" element={<Finances />} />
        <Route path="documents" element={<Documents />} />
        <Route path="building-setup" element={<BuildingSetup />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="voting" element={<Voting />} />
        <Route path="agms" element={<AGMs />} />
        <Route path="rtm" element={<RTMManagement />} />
        <Route path="suppliers" element={<SupplierNetwork />} />
        <Route path="legal-templates" element={<LegalTemplates />} />
        <Route path="director-support" element={<DirectorSupport />} />
        <Route path="compliance" element={<ComplianceMonitoringDashboard />} />
        <Route path="legal-resources" element={<LegalResourcesDashboard />} />
        <Route path="legal-accuracy" element={<LegalAccuracyDashboard />} />
        <Route path="user-impersonation" element={<UserImpersonationDashboard />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* RMC Director Routes */}
      <Route
        path="/rmc/*"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={['rmc-director', 'super-admin']}>
              <MainLayout />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<RTMDashboard />} />
        <Route path="issues" element={<IssuesManagement />} />
        <Route path="finances" element={<Finances />} />
        <Route path="documents" element={<Documents />} />
        <Route path="building-setup" element={<BuildingSetup />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="voting" element={<Voting />} />
        <Route path="agms" element={<AGMs />} />
        <Route path="shares" element={<ShareCertificates />} />
        <Route path="suppliers" element={<SupplierNetwork />} />
        <Route path="legal-templates" element={<LegalTemplates />} />
        <Route path="director-support" element={<DirectorSupport />} />
        <Route path="compliance" element={<ComplianceMonitoringDashboard />} />
        <Route path="legal-resources" element={<LegalResourcesDashboard />} />
        <Route path="legal-accuracy" element={<LegalAccuracyDashboard />} />
        <Route path="user-impersonation" element={<UserImpersonationDashboard />} />
        <Route path="reports" element={<Reports />} />
      </Route>



      {/* Shareholder Routes */}
      <Route
        path="/shareholder/*"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={['shareholder', 'super-admin']}>
              <MainLayout />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<LeaseholderDashboard />} />
        <Route path="issues" element={<IssuesManagement />} />
        <Route path="finances" element={<Finances />} />
        <Route path="documents" element={<Documents />} />
        <Route path="building-setup" element={<BuildingSetup />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="voting" element={<Voting />} />
        <Route path="agms" element={<AGMs />} />
        <Route path="user-impersonation" element={<UserImpersonationDashboard />} />
      </Route>

      {/* Leaseholder Routes */}
      <Route
        path="/leaseholder/*"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={['leaseholder']}>
              <MainLayout />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<LeaseholderDashboard />} />
        <Route path="issues" element={<IssuesManagement />} />
        <Route path="finances" element={<Finances />} />
        <Route path="documents" element={<Documents />} />
        <Route path="building-setup" element={<BuildingSetup />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="voting" element={<Voting />} />
        <Route path="agms" element={<AGMs />} />
        <Route path="user-impersonation" element={<UserImpersonationDashboard />} />
      </Route>

      {/* Management Company Routes */}
      <Route
        path="/management/*"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={['management-company']}>
              <MainLayout />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<ManagementDashboard />} />
        <Route path="issues" element={<IssuesManagement />} />
        <Route path="finances" element={<Finances />} />
        <Route path="documents" element={<Documents />} />
        <Route path="building-setup" element={<BuildingSetup />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="voting" element={<Voting />} />
        <Route path="agms" element={<AGMs />} />
        <Route path="suppliers" element={<SupplierNetwork />} />
        <Route path="building/:buildingId" element={<BuildingDetails />} />
        <Route path="building/:buildingId/issues" element={<IssuesManagement />} />
        <Route path="building/:buildingId/finances" element={<Finances />} />
        <Route path="building/:buildingId/agms" element={<AGMs />} />
        <Route path="user-impersonation" element={<UserImpersonationDashboard />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Catch-all route for auth redirects */}
      <Route path="*" element={
        user ? (
          // If user is logged in but on unknown route, redirect to their dashboard
          <Navigate to={getRoleBasePath(user.role)} replace />
        ) : (
          // If not logged in, show 404 with auth redirect handler
          <>
            <AuthRedirectHandler />
            <NotFound />
          </>
        )
      } />
    </Routes>
  );
}

export default App;
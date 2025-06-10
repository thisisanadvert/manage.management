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
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import SetupPassword from './pages/auth/SetupPassword';
import DebugReset from './pages/auth/DebugReset';
import VerifyReset from './pages/auth/VerifyReset';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import BuildingSetup from './pages/BuildingSetup';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import Help from './pages/Help';
import RTMResources from './pages/RTMResources';
import About from './pages/About';
import RTMQualify from './pages/RTMQualify';
import IssueManagement from './pages/features/IssueManagement';
import FinancialTracking from './pages/features/FinancialTracking';
import DocumentManagement from './pages/features/DocumentManagement';
import VotingSystem from './pages/features/VotingSystem';
import CommunicationHub from './pages/features/CommunicationHub';
import PageLoader from './components/ui/PageLoader';
import { useAuth } from './contexts/AuthContext';

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

  if (!user?.role || !allowedRoles.includes(user.role)) {
    let redirectPath = '/login';
    if (user?.role) {
      // Handle super-admin role specially
      if (user.role === 'super-admin') {
        redirectPath = '/rtm'; // Default to RTM dashboard for super admin
      } else {
        redirectPath = `/${user.role.split('-')[0]}`;
      }
    }
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading screen while auth is initializing
  if (loading) {
    return <PageLoader message="Initializing..." />;
  }

  // Prevent landing page access for logged-in users
  if (user && (location.pathname === '/' || location.pathname === '/pricing')) {
    let basePath = 'rtm'; // Default fallback
    if (user.role === 'super-admin') {
      basePath = 'rtm'; // Super admin goes to RTM dashboard
    } else if (user.role) {
      basePath = user.role.split('-')[0];
    }
    return <Navigate to={`/${basePath}`} replace />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={!user ? <Landing /> : <Navigate to={`/${user.role === 'super-admin' ? 'rtm' : user.role?.split('-')[0]}`} replace />} />
      <Route path="/pricing" element={!user ? <Pricing /> : <Navigate to={`/${user.role === 'super-admin' ? 'rtm' : user.role?.split('-')[0]}`} replace />} />
      
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to={`/${user.role === 'super-admin' ? 'rtm' : user.role?.split('-')[0]}`} replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/setup-password" element={<SetupPassword />} />
      <Route path="/debug-reset" element={<DebugReset />} />
      <Route path="/verify-reset" element={<VerifyReset />} />
      <Route path="/verify-reset" element={<VerifyReset />} />

      {/* Legal routes */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />

      {/* Public info pages */}
      <Route path="/help" element={<Help />} />
      <Route path="/rtm-resources" element={<RTMResources />} />
      <Route path="/about" element={<About />} />

      {/* RTM Qualification Lead Magnet */}
      <Route path="/qualify" element={<RTMQualify />} />

      {/* Feature pages */}
      <Route path="/features/issue-management" element={<IssueManagement />} />
      <Route path="/features/financial-tracking" element={<FinancialTracking />} />
      <Route path="/features/document-management" element={<DocumentManagement />} />
      <Route path="/features/voting-system" element={<VotingSystem />} />
      <Route path="/features/communication-hub" element={<CommunicationHub />} />
      
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
      </Route>

      {/* SOF Director Routes */}
      <Route
        path="/sof/*"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={['sof-director', 'super-admin']}>
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
        <Route path="shares" element={<ShareCertificates />} />
        <Route path="suppliers" element={<SupplierNetwork />} />
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
      </Route>

      {/* 404 page for unknown routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
import React from 'react';
import {
  Building2,
  AlertTriangle,
  Wallet,
  FileText,
  BellRing,
  Vote,
  Calendar,
  Plus,
  ArrowRight,
  Shield,
  BookOpen
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import OnboardingWizard from '../../components/onboarding/OnboardingWizard';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../../hooks/useDashboardData';
import {
  StatsOverview,
  ActionItems,
  RecentActivityWidget,
  QuickActions
} from '../../components/dashboard/DashboardWidgets';
import LegalGuidanceTooltip from '../../components/legal/LegalGuidanceTooltip';
import ComplianceStatusIndicator from '../../components/legal/ComplianceStatusIndicator';
import ComplianceMonitoringService from '../../services/complianceMonitoringService';

const RTMDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOnboarded, setIsOnboarded] = useState(!!user?.metadata?.onboardingComplete);
  const dashboardData = useDashboardData();

  // Get compliance monitoring data
  const monitoringService = ComplianceMonitoringService.getInstance();
  const complianceSummary = monitoringService.getComplianceSummary();
  const criticalAlerts = monitoringService.getUnacknowledgedAlerts().filter(a => a.severity === 'critical');

  // If user hasn't completed onboarding, show the onboarding wizard
  if (!isOnboarded) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.metadata?.firstName || 'Director'}</h1>
            <p className="text-gray-600 mt-1">Let's get your building set up</p>
          </div>
        </div>

        <OnboardingWizard />
      </div>
    );
  }

  // Show loading state
  if (dashboardData.loading) {
    return (
      <div className="space-y-6 pb-16 lg:pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.metadata?.firstName || 'Director'}</h1>
            <p className="text-gray-600 mt-1">Loading your dashboard...</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.metadata?.firstName || 'Director'}</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with {user?.metadata?.buildingName || 'your building'}</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
      
      {/* Dashboard Stats Overview */}
      <StatsOverview stats={dashboardData.stats} />

      {/* Action Items */}
      <ActionItems actionItems={dashboardData.actionItems} />

      {/* Enhanced Building Overview */}
      <Card className="bg-gradient-to-br from-primary-800 to-primary-900 rounded-xl p-6 text-white overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Building Info */}
            <div className="flex items-start space-x-4 flex-1">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <Building2 size={32} />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{user?.metadata?.buildingName || 'Your Building'}</h1>
                <p className="text-primary-200 text-sm">{user?.metadata?.buildingAddress || 'Add your building address'}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-xs px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">RTM Director</span>
                  <span className="text-xs px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                    {user?.metadata?.unitNumber ? `Unit ${user.metadata.unitNumber}` : 'Add unit number'}
                  </span>
                  <span className="text-xs px-3 py-1 bg-green-500/30 rounded-full backdrop-blur-sm">
                    RTM Active
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:w-auto w-full">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
                <div className="text-lg font-bold">{dashboardData.stats.totalUnits}</div>
                <div className="text-xs text-primary-200">Total Units</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
                <div className="text-lg font-bold">{dashboardData.stats.openIssues}</div>
                <div className="text-xs text-primary-200">Open Issues</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
                <div className="text-lg font-bold">£{(dashboardData.stats.totalBudget / 1000).toFixed(0)}k</div>
                <div className="text-xs text-primary-200">Annual Budget</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
                <div className="text-lg font-bold">{dashboardData.stats.complianceItems}</div>
                <div className="text-xs text-primary-200">Compliance</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => navigate(`/${user?.role?.split('-')[0]}/building-setup`)}
            >
              <Building2 size={16} className="mr-2" />
              Manage Building
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => navigate(`/${user?.role?.split('-')[0]}/issues`)}
            >
              <AlertTriangle size={16} className="mr-2" />
              Manage Issues
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => navigate(`/${user?.role?.split('-')[0]}/finances`)}
            >
              <Wallet size={16} className="mr-2" />
              View Finances
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => navigate(`/${user?.role?.split('-')[0]}/documents`)}
            >
              <FileText size={16} className="mr-2" />
              Documents
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Legal Compliance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Legal Compliance</h3>
              <LegalGuidanceTooltip
                title="RTM Legal Compliance"
                guidance={{
                  basic: "As an RTM director, you have legal obligations under the Commonhold and Leasehold Reform Act 2002. This includes proper consultation procedures, financial management, and meeting statutory requirements.",
                  intermediate: "Key obligations include Section 20 consultations for major works, proper accounting procedures, AGM requirements, and maintaining statutory registers.",
                  advanced: "Detailed compliance includes adherence to RTM company articles, proper notice procedures, consultation requirements under LTA 1985, and potential liability under company law."
                }}
                framework="CLRA_2002"
                mandatory={true}
                externalResources={[
                  {
                    title: "LEASE RTM Guidance",
                    url: "https://www.lease-advice.org/advice-guide/right-to-manage/",
                    type: "lease",
                    description: "Comprehensive guide to RTM legal requirements"
                  }
                ]}
              />
            </div>
          </div>
          <ComplianceStatusIndicator
            status="compliant"
            title="Overall Status"
            description="All key requirements are being met"
            lastReviewed={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
            size="md"
          />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Legal Resources</h3>
            </div>
          </div>
          <div className="space-y-3">
            <a
              href="https://www.lease-advice.org"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="font-medium text-blue-900">LEASE</div>
              <div className="text-sm text-blue-700">Leasehold Advisory Service</div>
            </a>
            <a
              href="https://www.gov.uk/right-to-manage-your-building"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="font-medium text-green-900">Gov.uk RTM Guide</div>
              <div className="text-sm text-green-700">Official government guidance</div>
            </a>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Compliance Monitoring</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/compliance')}
            >
              View All
            </Button>
          </div>

          {/* Compliance Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-600">{complianceSummary.totalDeadlines}</div>
              <div className="text-xs text-blue-700">Active</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded">
              <div className="text-lg font-bold text-orange-600">{complianceSummary.dueSoonDeadlines}</div>
              <div className="text-xs text-orange-700">Due Soon</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="text-lg font-bold text-red-600">{complianceSummary.overdueDeadlines}</div>
              <div className="text-xs text-red-700">Overdue</div>
            </div>
          </div>

          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-800">Critical Alerts</h4>
              {criticalAlerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="font-medium text-red-900">{alert.title}</div>
                  <div className="text-sm text-red-700">{alert.message}</div>
                </div>
              ))}
            </div>
          )}

          {criticalAlerts.length === 0 && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <div className="font-medium text-green-800">All compliance requirements up to date</div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivityWidget activities={dashboardData.recentActivity} />
        </div>

        {/* Right Column - Quick Actions */}
        <div>
          <QuickActions userRole={user?.role || 'rtm-director'} />
        </div>
      </div>
    </div>
  );
};

export default RTMDashboard;
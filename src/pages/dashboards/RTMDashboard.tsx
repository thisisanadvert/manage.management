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
  BookOpen,
  CheckCircle2 // Success icon for compliance status
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

      {/* Building Overview - Moved to top */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"></div>
        <div className="relative p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Building2 size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.metadata?.buildingName || 'Central Park'}</h2>
                <p className="text-blue-100">{user?.metadata?.buildingAddress || 'Central Park, London'}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs px-3 py-1 bg-blue-500/30 rounded-full backdrop-blur-sm">
                    RTM Director
                  </span>
                  <span className="text-xs px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                    {user?.metadata?.unitNumber ? `Unit ${user.metadata.unitNumber}` : 'Unit Penthouse'}
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
                <div className="text-xs text-blue-200">Total Units</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
                <div className="text-lg font-bold">{dashboardData.stats.openIssues}</div>
                <div className="text-xs text-blue-200">Open Issues</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
                <div className="text-lg font-bold">£{(dashboardData.stats.totalBudget / 1000).toFixed(0)}k</div>
                <div className="text-xs text-blue-200">Annual Budget</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
                <div className="text-lg font-bold">{dashboardData.stats.complianceItems}</div>
                <div className="text-xs text-blue-200">Compliance</div>
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

      {/* RTM-Specific Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Action Items & RTM Tools */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Items */}
          <ActionItems actionItems={dashboardData.actionItems} />

          {/* RTM Formation Tools */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">RTM Formation Tools</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/rtm/rtm')}
              >
                View All Tools
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                   onClick={() => navigate('/rtm/rtm?view=eligibility')}>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Eligibility Check</h4>
                    <p className="text-sm text-gray-600">Verify RTM qualification</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                   onClick={() => navigate('/rtm/rtm?view=formation')}>
                <div className="flex items-center space-x-3">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Company Formation</h4>
                    <p className="text-sm text-gray-600">Set up RTM company</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                   onClick={() => navigate('/rtm/rtm?view=notices')}>
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-orange-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Legal Notices</h4>
                    <p className="text-sm text-gray-600">Generate required notices</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                   onClick={() => navigate('/rtm/legal-templates')}>
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Legal Guidance</h4>
                    <p className="text-sm text-gray-600">Expert advice & templates</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Quick Actions & Resources */}
        <div className="space-y-6">
          <QuickActions userRole={user?.role || 'rtm-director'} />

          {/* Legal Compliance Overview */}
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
      </div>
    </div>
  );
};

export default RTMDashboard;
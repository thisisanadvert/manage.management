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
  ArrowRight
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

const RTMDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOnboarded, setIsOnboarded] = useState(!!user?.metadata?.onboardingComplete);
  const dashboardData = useDashboardData();

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

      {/* Building Overview */}
      <Card className="bg-primary-800 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white/10 rounded-lg">
              <Building2 size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.metadata?.buildingName || 'Your Building'}</h1>
              <p className="text-primary-200">{user?.metadata?.buildingAddress || 'Add your building address'}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm px-2 py-0.5 bg-white/20 rounded-full">RTM Director</span>
                <span className="text-sm px-2 py-0.5 bg-white/20 rounded-full">
                  {user?.metadata?.unitNumber ? `Unit ${user.metadata.unitNumber}` : 'Add unit number'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => navigate(`/${user?.role?.split('-')[0]}/documents`)}
            >
              View Documents
            </Button>
            <Button 
              variant="accent" 
              rightIcon={<ArrowRight size={16} />}
              onClick={() => navigate(`/${user?.role?.split('-')[0]}/issues`)}
            >
              Manage Issues
            </Button>
          </div>
        </div>
      </Card>
      
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
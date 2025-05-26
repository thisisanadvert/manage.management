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
import { Card } from '../../components/ui/Card';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import OnboardingWizard from '../../components/onboarding/OnboardingWizard';
import { useNavigate } from 'react-router-dom';

const RTMDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOnboarded, setIsOnboarded] = useState(!!user?.metadata?.onboardingComplete);

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

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your building management dashboard</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          className="flex flex-col items-center justify-center h-24 border border-gray-200 bg-white"
          variant="ghost"
          leftIcon={<AlertTriangle className="h-6 w-6 text-warning-600" />}
          onClick={() => navigate(`/${user?.role?.split('-')[0]}/issues`)}
        >
          <span className="mt-2">Manage Issues</span>
        </Button>
        <Button 
          className="flex flex-col items-center justify-center h-24 border border-gray-200 bg-white"
          variant="ghost"
          leftIcon={<Wallet className="h-6 w-6 text-primary-600" />}
          onClick={() => navigate(`/${user?.role?.split('-')[0]}/finances`)}
        >
          <span className="mt-2">Financial Management</span>
        </Button>
        <Button 
          className="flex flex-col items-center justify-center h-24 border border-gray-200 bg-white"
          variant="ghost"
          leftIcon={<FileText className="h-6 w-6 text-secondary-600" />}
          onClick={() => navigate(`/${user?.role?.split('-')[0]}/documents`)}
        >
          <span className="mt-2">Documents</span>
        </Button>
        <Button 
          className="flex flex-col items-center justify-center h-24 border border-gray-200 bg-white"
          variant="ghost"
          leftIcon={<BellRing className="h-6 w-6 text-accent-600" />}
          onClick={() => navigate(`/${user?.role?.split('-')[0]}/announcements`)}
        >
          <span className="mt-2">Announcements</span>
        </Button>
      </div>

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
      
      {/* Empty States with Call to Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Issues</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/${user?.role?.split('-')[0]}/issues`)}
            >
              View All
            </Button>
          </div>
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No issues reported yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage maintenance issues for your building
            </p>
            <Button 
              variant="primary" 
              className="mt-4"
              leftIcon={<Plus size={16} />}
              onClick={() => navigate(`/${user?.role?.split('-')[0]}/issues`)}
            >
              Report First Issue
            </Button>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Announcements</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/${user?.role?.split('-')[0]}/announcements`)}
            >
              View All
            </Button>
          </div>
          <div className="text-center py-8">
            <BellRing className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No announcements yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Keep residents informed with important updates
            </p>
            <Button 
              variant="primary" 
              className="mt-4"
              leftIcon={<Plus size={16} />}
              onClick={() => navigate(`/${user?.role?.split('-')[0]}/announcements`)}
            >
              Create Announcement
            </Button>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Polls</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/${user?.role?.split('-')[0]}/voting`)}
            >
              View All
            </Button>
          </div>
          <div className="text-center py-8">
            <Vote className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No active polls</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create polls to make collective decisions
            </p>
            <Button 
              variant="primary" 
              className="mt-4"
              leftIcon={<Plus size={16} />}
              onClick={() => navigate(`/${user?.role?.split('-')[0]}/voting`)}
            >
              Create Poll
            </Button>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/${user?.role?.split('-')[0]}/agms`)}
            >
              View All
            </Button>
          </div>
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No upcoming events</h3>
            <p className="mt-1 text-sm text-gray-500">
              Schedule and manage building meetings and events
            </p>
            <Button 
              variant="primary" 
              className="mt-4"
              leftIcon={<Plus size={16} />}
              onClick={() => navigate(`/${user?.role?.split('-')[0]}/agms`)}
            >
              Schedule Event
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RTMDashboard;
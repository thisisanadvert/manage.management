import { useState } from 'react';
import { 
  Building2, 
  AlertTriangle, 
  MessageSquare,
  Vote,
  Clock,
  CheckCircle2,
  BellRing,
  FileText,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import CreateIssueModal from '../../components/modals/CreateIssueModal';
import OnboardingWizard from '../../components/onboarding/OnboardingWizard';
import { useAuth } from '../../contexts/AuthContext';

const LeaseholderDashboard = () => {
  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOnboarded, setIsOnboarded] = useState(!!user?.metadata?.onboardingComplete);

  // If user hasn't completed onboarding, show the onboarding wizard
  if (!isOnboarded) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.metadata?.firstName || 'Leaseholder'}</h1>
            <p className="text-gray-600 mt-1">Let's get you set up</p>
          </div>
        </div>
        
        <OnboardingWizard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Building Overview */}
      <div className="bg-primary-800 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white/10 rounded-lg">
              <Building2 size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.metadata?.buildingName || 'Your Building'}</h1>
              <p className="text-primary-200">{user?.metadata?.unitNumber ? `Unit ${user.metadata.unitNumber}` : 'Add unit number'}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm px-2 py-0.5 bg-white/20 rounded-full">Leaseholder</span>
                <span className="text-sm px-2 py-0.5 bg-white/20 rounded-full">2 bed apartment</span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10"
            >
              My Documents
            </Button>
            <Button 
              variant="accent" 
              rightIcon={<ArrowUpRight size={16} />}
            >
              Contact RTM
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          className="flex flex-col items-center justify-center h-24 border border-gray-200 bg-white"
          variant="ghost"
          leftIcon={<AlertTriangle className="h-6 w-6 text-warning-600" />}
          onClick={() => setIsCreateIssueModalOpen(true)}
        >
          <span className="mt-2">Report Issue</span>
        </Button>
        <Button 
          className="flex flex-col items-center justify-center h-24 border border-gray-200 bg-white"
          variant="ghost"
          leftIcon={<Vote className="h-6 w-6 text-primary-600" />}
          onClick={() => navigate('/leaseholder/voting')}
        >
          <span className="mt-2">Active Votes</span>
        </Button>
        <Button 
          className="flex flex-col items-center justify-center h-24 border border-gray-200 bg-white"
          variant="ghost"
          leftIcon={<FileText className="h-6 w-6 text-secondary-600" />}
          onClick={() => navigate('/leaseholder/finances')}
        >
          <span className="mt-2">Finances</span>
        </Button>
        <Button 
          className="flex flex-col items-center justify-center h-24 border border-gray-200 bg-white"
          variant="ghost"
          leftIcon={<MessageSquare className="h-6 w-6 text-accent-600" />}
          onClick={() => navigate('/leaseholder/announcements')}
        >
          <span className="mt-2">Announcements</span>
        </Button>
      </div>

      {/* Active Issues */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Active Issues</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/leaseholder/issues')}
          >
            View All
          </Button>
        </div>
        <div className="text-center py-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No active issues</h3>
          <p className="mt-1 text-sm text-gray-500">
            Report maintenance issues for your building
          </p>
          <Button 
            variant="primary" 
            className="mt-4"
            leftIcon={<AlertTriangle size={16} />}
            onClick={() => setIsCreateIssueModalOpen(true)}
          >
            Report New Issue
          </Button>
        </div>
      </Card>

      {/* Announcements */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Announcements</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/leaseholder/announcements')}
          >
            View All
          </Button>
        </div>
        <div className="text-center py-8">
          <BellRing className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No announcements yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Check back later for important building updates
          </p>
        </div>
      </Card>

      {/* Active Polls */}
      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Active Polls</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/leaseholder/voting')}
          >
            View All
          </Button>
        </div>
        <div className="text-center py-8">
          <Vote className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No active polls</h3>
          <p className="mt-1 text-sm text-gray-500">
            Participate in building decisions when polls are created
          </p>
          <Button 
            variant="primary" 
            className="mt-4"
            onClick={() => navigate('/leaseholder/voting')}
          >
            View Polls
          </Button>
        </div>
      </Card>

      {/* Important Updates */}
      <Card className="lg:col-span-2">
        <h2 className="text-lg font-semibold mb-4">Important Updates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-success-50 rounded-lg border border-success-100">
            <CheckCircle2 className="h-6 w-6 text-success-600 mb-2" />
            <h3 className="font-medium">Service Charge</h3>
            <p className="text-sm text-gray-600 mt-1">No payments due</p>
          </div>
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
            <BellRing className="h-6 w-6 text-primary-600 mb-2" />
            <h3 className="font-medium">Next Meeting</h3>
            <p className="text-sm text-gray-600 mt-1">No meetings scheduled</p>
          </div>
          <div className="p-4 bg-warning-50 rounded-lg border border-warning-100">
            <FileText className="h-6 w-6 text-warning-600 mb-2" />
            <h3 className="font-medium">Documents</h3>
            <p className="text-sm text-gray-600 mt-1">No new documents</p>
          </div>
        </div>
      </Card>

      <CreateIssueModal
        isOpen={isCreateIssueModalOpen}
        onClose={() => setIsCreateIssueModalOpen(false)}
      />
    </div>
  );
};

export default LeaseholderDashboard;
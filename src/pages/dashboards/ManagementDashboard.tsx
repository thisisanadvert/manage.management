import { 
  Building2, 
  ArrowUpRight, 
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  BarChart4,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  Plus
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import OnboardingWizard from '../../components/onboarding/OnboardingWizard';
import { useNavigate } from 'react-router-dom';

const ManagementDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOnboarded, setIsOnboarded] = useState(!!user?.metadata?.onboardingComplete);
  
  // If user hasn't completed onboarding, show the onboarding wizard
  if (!isOnboarded) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.metadata?.firstName || 'Manager'}</h1>
            <p className="text-gray-600 mt-1">Let's get your account set up</p>
          </div>
        </div>
        
        <OnboardingWizard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Management Overview */}
      <div className="bg-primary-800 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white/10 rounded-lg">
              <Building2 size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Property Management Portal</h1>
              <p className="text-primary-200">Managing {user?.metadata?.buildingName || 'your properties'}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm px-2 py-0.5 bg-white/20 rounded-full">Management Company</span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10"
            >
              Reports
            </Button>
            <Button 
              variant="accent" 
              rightIcon={<ArrowUpRight size={16} />}
            >
              Add Property
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search properties..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
          </div>
          <Button 
            variant="outline"
            leftIcon={<Filter size={16} />}
          >
            Filter
          </Button>
        </div>
      </Card>

      {/* Properties Grid */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Properties</h2>
          <Button 
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
          >
            Add Property
          </Button>
        </div>
        <div className="text-center py-8">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No properties added yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add properties to start managing them
          </p>
          <Button 
            variant="primary" 
            className="mt-4"
            leftIcon={<Plus size={16} />}
          >
            Add First Property
          </Button>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No recent activity</h3>
            <p className="mt-1 text-sm text-gray-500">
              Activity will appear here as you manage properties
            </p>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-semibold mb-4">Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary-50 rounded-lg">
                <Users className="h-6 w-6 text-primary-600 mb-2" />
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-gray-600">Total Units</div>
              </div>
              <div className="p-4 bg-warning-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-warning-600 mb-2" />
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-gray-600">Open Issues</div>
              </div>
              <div className="p-4 bg-success-50 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-success-600 mb-2" />
                <div className="text-2xl font-bold">0%</div>
                <div className="text-sm text-gray-600">Collection Rate</div>
              </div>
              <div className="p-4 bg-accent-50 rounded-lg">
                <BarChart4 className="h-6 w-6 text-accent-600 mb-2" />
                <div className="text-2xl font-bold">£0</div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold mb-4">Support Contact</h2>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Phone size={16} className="text-gray-500 mr-2" />
                <span>020 1234 5678</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail size={16} className="text-gray-500 mr-2" />
                <span>support@managementco.com</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagementDashboard;
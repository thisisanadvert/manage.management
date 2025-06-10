import React, { useState } from 'react';
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
  Plus,
  Wallet,
  Calendar,
  FileText,
  TrendingUp,
  Eye,
  Edit,
  MoreVertical,
  ArrowRight
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import OnboardingWizard from '../../components/onboarding/OnboardingWizard';
import { useNavigate } from 'react-router-dom';

interface Building {
  id: string;
  name: string;
  address: string;
  units: number;
  occupancy: number;
  openIssues: number;
  urgentIssues: number;
  monthlyRevenue: number;
  collectionRate: number;
  lastInspection: Date;
  status: 'active' | 'pending' | 'maintenance';
}

const ManagementDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOnboarded, setIsOnboarded] = useState(!!user?.metadata?.onboardingComplete);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'pending' | 'maintenance'>('all');
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);

  // Demo buildings data - in real app this would come from API
  const [buildings] = useState<Building[]>([
    {
      id: '1',
      name: 'Riverside Apartments',
      address: '123 Thames Street, London SE1 9RT',
      units: 24,
      occupancy: 22,
      openIssues: 3,
      urgentIssues: 1,
      monthlyRevenue: 12500,
      collectionRate: 95,
      lastInspection: new Date('2024-01-15'),
      status: 'active'
    },
    {
      id: '2',
      name: 'Victoria Court',
      address: '45 Victoria Road, Manchester M1 4BT',
      units: 18,
      occupancy: 18,
      openIssues: 1,
      urgentIssues: 0,
      monthlyRevenue: 9800,
      collectionRate: 100,
      lastInspection: new Date('2024-01-20'),
      status: 'active'
    },
    {
      id: '3',
      name: 'Garden View Flats',
      address: '78 Garden Lane, Birmingham B2 5HG',
      units: 12,
      occupancy: 10,
      openIssues: 5,
      urgentIssues: 2,
      monthlyRevenue: 6200,
      collectionRate: 83,
      lastInspection: new Date('2024-01-10'),
      status: 'maintenance'
    }
  ]);

  // If user hasn't completed onboarding, show the onboarding wizard
  if (!isOnboarded) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.metadata?.firstName || 'Manager'}</h1>
            <p className="text-gray-600 mt-1">Let's get your portfolio set up</p>
          </div>
        </div>

        <OnboardingWizard />
      </div>
    );
  }

  // Calculate portfolio totals
  const portfolioStats = buildings.reduce((acc, building) => ({
    totalUnits: acc.totalUnits + building.units,
    totalOccupied: acc.totalOccupied + building.occupancy,
    totalIssues: acc.totalIssues + building.openIssues,
    totalUrgent: acc.totalUrgent + building.urgentIssues,
    totalRevenue: acc.totalRevenue + building.monthlyRevenue,
    avgCollectionRate: acc.avgCollectionRate + building.collectionRate
  }), { totalUnits: 0, totalOccupied: 0, totalIssues: 0, totalUrgent: 0, totalRevenue: 0, avgCollectionRate: 0 });

  portfolioStats.avgCollectionRate = buildings.length > 0 ? portfolioStats.avgCollectionRate / buildings.length : 0;

  // Filter buildings
  const filteredBuildings = buildings.filter(building => {
    const matchesSearch = building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         building.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || building.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Portfolio Overview Header */}
      <Card className="bg-gradient-to-br from-primary-800 to-primary-900 rounded-xl p-6 text-white overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Company Info */}
            <div className="flex items-start space-x-4 flex-1">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <Building2 size={32} />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">Property Management Portfolio</h1>
                <p className="text-primary-200 text-sm">
                  {user?.metadata?.companyName || 'Your Management Company'}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-xs px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                    Management Company
                  </span>
                  <span className="text-xs px-3 py-1 bg-blue-500/30 rounded-full backdrop-blur-sm">
                    {buildings.length} Properties
                  </span>
                </div>
              </div>
            </div>

            {/* Portfolio Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:w-auto w-full">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
                <div className="text-lg font-bold">{portfolioStats.totalUnits}</div>
                <div className="text-xs text-primary-200">Total Units</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
                <div className="text-lg font-bold">{portfolioStats.totalIssues}</div>
                <div className="text-xs text-primary-200">Open Issues</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
                <div className="text-lg font-bold">£{(portfolioStats.totalRevenue / 1000).toFixed(0)}k</div>
                <div className="text-xs text-primary-200">Monthly Revenue</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
                <div className="text-lg font-bold">{portfolioStats.avgCollectionRate.toFixed(0)}%</div>
                <div className="text-xs text-primary-200">Avg Collection</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => navigate('/management/issues')}
            >
              <AlertTriangle size={16} className="mr-2" />
              All Issues
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => navigate('/management/finances')}
            >
              <Wallet size={16} className="mr-2" />
              Finances
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => navigate('/management/agms')}
            >
              <Calendar size={16} className="mr-2" />
              AGMs
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => setShowAddBuildingModal(true)}
            >
              <Plus size={16} className="mr-2" />
              Add Building
            </Button>
          </div>
        </div>
      </Card>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search buildings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'pending', 'maintenance'].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter as any)}
                className="capitalize"
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Buildings Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Buildings ({filteredBuildings.length})
          </h2>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowAddBuildingModal(true)}
          >
            Add Building
          </Button>
        </div>

        {filteredBuildings.length === 0 ? (
          <Card className="p-8">
            <div className="text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                {searchTerm || selectedFilter !== 'all' ? 'No buildings match your filters' : 'No buildings added yet'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first building to start managing your portfolio'
                }
              </p>
              {!searchTerm && selectedFilter === 'all' && (
                <Button
                  variant="primary"
                  className="mt-4"
                  leftIcon={<Plus size={16} />}
                  onClick={() => setShowAddBuildingModal(true)}
                >
                  Add First Building
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBuildings.map((building) => (
              <Card key={building.id} className="hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Building Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{building.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {building.address}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={building.status === 'active' ? 'success' :
                                building.status === 'pending' ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {building.status}
                      </Badge>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Building Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-blue-600">Occupancy</span>
                      </div>
                      <div className="mt-1">
                        <div className="text-lg font-bold text-blue-900">
                          {building.occupancy}/{building.units}
                        </div>
                        <div className="text-xs text-blue-700">
                          {Math.round((building.occupancy / building.units) * 100)}%
                        </div>
                      </div>
                    </div>

                    <div className={`rounded-lg p-3 ${
                      building.urgentIssues > 0 ? 'bg-red-50' : 'bg-green-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <AlertTriangle className={`h-4 w-4 ${
                          building.urgentIssues > 0 ? 'text-red-600' : 'text-green-600'
                        }`} />
                        <span className={`text-xs ${
                          building.urgentIssues > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          Issues
                        </span>
                      </div>
                      <div className="mt-1">
                        <div className={`text-lg font-bold ${
                          building.urgentIssues > 0 ? 'text-red-900' : 'text-green-900'
                        }`}>
                          {building.openIssues}
                        </div>
                        <div className={`text-xs ${
                          building.urgentIssues > 0 ? 'text-red-700' : 'text-green-700'
                        }`}>
                          {building.urgentIssues} urgent
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Monthly Revenue</span>
                      <span className="text-sm font-bold text-gray-900">
                        £{building.monthlyRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Collection Rate</span>
                      <span className={`text-xs font-medium ${
                        building.collectionRate >= 95 ? 'text-green-600' :
                        building.collectionRate >= 85 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {building.collectionRate}%
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/management/building/${building.id}`)}
                      leftIcon={<Eye className="h-4 w-4" />}
                    >
                      View
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/management/building/${building.id}/issues`)}
                      leftIcon={<AlertTriangle className="h-4 w-4" />}
                    >
                      Issues
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Actions */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Priority Actions</h2>
          <div className="space-y-3">
            {portfolioStats.totalUrgent > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <h3 className="font-medium text-red-900">Urgent Issues Require Attention</h3>
                      <p className="text-sm text-red-700">
                        {portfolioStats.totalUrgent} urgent issues across your portfolio
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/management/issues?filter=urgent')}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    View Issues
                  </Button>
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">Upcoming AGMs</h3>
                    <p className="text-sm text-blue-700">
                      Schedule and manage annual general meetings
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/management/agms')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Manage AGMs
                </Button>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-900">Financial Overview</h3>
                    <p className="text-sm text-green-700">
                      Review collection rates and financial performance
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/management/finances')}
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  View Finances
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Portfolio Summary */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Portfolio Summary</h2>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Buildings</span>
                <span className="text-lg font-bold text-gray-900">{buildings.length}</span>
              </div>
              <div className="text-xs text-gray-600">
                {buildings.filter(b => b.status === 'active').length} active, {' '}
                {buildings.filter(b => b.status === 'maintenance').length} in maintenance
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Total Units</span>
                <span className="text-lg font-bold text-gray-900">{portfolioStats.totalUnits}</span>
              </div>
              <div className="text-xs text-gray-600">
                {portfolioStats.totalOccupied} occupied ({Math.round((portfolioStats.totalOccupied / portfolioStats.totalUnits) * 100)}%)
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Monthly Revenue</span>
                <span className="text-lg font-bold text-gray-900">
                  £{portfolioStats.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-gray-600">
                Avg collection: {portfolioStats.avgCollectionRate.toFixed(1)}%
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate('/management/reports')}
              leftIcon={<TrendingUp className="h-4 w-4" />}
            >
              View Detailed Reports
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManagementDashboard;
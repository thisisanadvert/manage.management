import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  AlertTriangle,
  Users,
  Wallet,
  Calendar,
  FileText,
  MapPin,
  Phone,
  Mail,
  Edit,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const BuildingDetails = () => {
  const { buildingId } = useParams();
  const navigate = useNavigate();

  // Demo building data - in real app this would come from API
  const building = {
    id: buildingId,
    name: 'Riverside Apartments',
    address: '123 Thames Street, London SE1 9RT',
    units: 24,
    occupancy: 22,
    openIssues: 3,
    urgentIssues: 1,
    monthlyRevenue: 12500,
    collectionRate: 95,
    lastInspection: new Date('2024-01-15'),
    status: 'active',
    managementFee: 2500,
    yearBuilt: 2018,
    propertyType: 'Residential Apartments',
    contactPerson: 'Sarah Johnson',
    contactEmail: 'sarah.johnson@riverside.com',
    contactPhone: '020 7123 4567'
  };

  const recentActivity = [
    {
      id: '1',
      type: 'issue',
      title: 'Heating system maintenance',
      description: 'Annual boiler service completed',
      date: new Date('2024-01-20'),
      status: 'completed'
    },
    {
      id: '2',
      type: 'payment',
      title: 'Service charge collection',
      description: 'Monthly service charges collected',
      date: new Date('2024-01-18'),
      status: 'completed'
    },
    {
      id: '3',
      type: 'issue',
      title: 'Lift maintenance required',
      description: 'Routine lift inspection due',
      date: new Date('2024-01-15'),
      status: 'pending'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'issue': return AlertTriangle;
      case 'payment': return Wallet;
      case 'meeting': return Calendar;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/management')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Portfolio
        </Button>
      </div>

      {/* Building Overview */}
      <Card className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
        </div>
        
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex items-start space-x-4 flex-1">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <Building2 size={32} />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{building.name}</h1>
                <p className="text-blue-200 text-sm flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {building.address}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {building.propertyType}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Built {building.yearBuilt}
                  </Badge>
                  <Badge 
                    variant={building.status === 'active' ? 'success' : 'warning'}
                    className="bg-white/20 text-white border-white/30"
                  >
                    {building.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
                <div className="text-lg font-bold">{building.units}</div>
                <div className="text-xs text-blue-200">Total Units</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
                <div className="text-lg font-bold">{building.occupancy}</div>
                <div className="text-xs text-blue-200">Occupied</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
                <div className="text-lg font-bold">{building.openIssues}</div>
                <div className="text-xs text-blue-200">Open Issues</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-center">
                <div className="text-lg font-bold">£{(building.monthlyRevenue / 1000).toFixed(0)}k</div>
                <div className="text-xs text-blue-200">Monthly Revenue</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => navigate(`/management/building/${buildingId}/issues`)}
            >
              <AlertTriangle size={16} className="mr-2" />
              Manage Issues
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => navigate(`/management/building/${buildingId}/finances`)}
            >
              <Wallet size={16} className="mr-2" />
              Finances
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => navigate(`/management/building/${buildingId}/agms`)}
            >
              <Calendar size={16} className="mr-2" />
              AGMs
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <Edit size={16} className="mr-2" />
              Edit Details
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Performance */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Financial Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-900">
                  £{building.monthlyRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-green-700">Monthly Revenue</div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <span className="text-xs text-blue-600">Collection</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {building.collectionRate}%
                </div>
                <div className="text-sm text-blue-700">Collection Rate</div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  <span className="text-xs text-purple-600">Fee</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  £{building.managementFee.toLocaleString()}
                </div>
                <div className="text-sm text-purple-700">Management Fee</div>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className={`p-1 rounded-full ${getStatusColor(activity.status)}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {activity.date.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                      <Badge variant="outline" size="sm" className="mt-1">
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-700">Primary Contact</div>
                <div className="text-sm text-gray-900">{building.contactPerson}</div>
              </div>
              <div className="flex items-center text-sm">
                <Mail size={16} className="text-gray-500 mr-2" />
                <span>{building.contactEmail}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone size={16} className="text-gray-500 mr-2" />
                <span>{building.contactPhone}</span>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Occupancy Rate</span>
                <span className="text-sm font-medium">
                  {Math.round((building.occupancy / building.units) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Vacant Units</span>
                <span className="text-sm font-medium">{building.units - building.occupancy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Inspection</span>
                <span className="text-sm font-medium">
                  {building.lastInspection.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Urgent Issues</span>
                <span className={`text-sm font-medium ${
                  building.urgentIssues > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {building.urgentIssues}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BuildingDetails;

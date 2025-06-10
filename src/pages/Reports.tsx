import React, { useState } from 'react';
import {
  BarChart4,
  TrendingUp,
  Download,
  Calendar,
  Building2,
  Wallet,
  Users,
  AlertTriangle,
  FileText,
  Filter
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedBuilding, setSelectedBuilding] = useState('all');

  const reportTypes = [
    {
      id: 'financial',
      title: 'Financial Performance',
      description: 'Revenue, expenses, and collection rates',
      icon: Wallet,
      color: 'bg-green-100 text-green-600',
      available: true
    },
    {
      id: 'occupancy',
      title: 'Occupancy Report',
      description: 'Unit occupancy and vacancy trends',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      available: true
    },
    {
      id: 'maintenance',
      title: 'Maintenance Summary',
      description: 'Issues, repairs, and maintenance costs',
      icon: AlertTriangle,
      color: 'bg-yellow-100 text-yellow-600',
      available: true
    },
    {
      id: 'compliance',
      title: 'Compliance Report',
      description: 'Safety certificates and regulatory compliance',
      icon: FileText,
      color: 'bg-purple-100 text-purple-600',
      available: false
    }
  ];

  const recentReports = [
    {
      id: '1',
      name: 'Monthly Financial Summary - January 2024',
      type: 'Financial',
      generated: new Date('2024-01-31'),
      size: '2.3 MB'
    },
    {
      id: '2',
      name: 'Occupancy Report - Q4 2023',
      type: 'Occupancy',
      generated: new Date('2024-01-15'),
      size: '1.8 MB'
    },
    {
      id: '3',
      name: 'Maintenance Summary - December 2023',
      type: 'Maintenance',
      generated: new Date('2024-01-05'),
      size: '3.1 MB'
    }
  ];

  const buildings = [
    { id: 'all', name: 'All Buildings' },
    { id: '1', name: 'Riverside Apartments' },
    { id: '2', name: 'Victoria Court' },
    { id: '3', name: 'Garden View Flats' }
  ];

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate and download detailed reports for your portfolio</p>
        </div>
        <Button variant="primary" leftIcon={<Download className="h-4 w-4" />}>
          Export All Data
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Building
            </label>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Types */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportTypes.map((report) => (
            <Card
              key={report.id}
              className={`hover:shadow-lg transition-shadow ${
                !report.available ? 'opacity-60' : 'cursor-pointer'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${report.color}`}>
                    <report.icon className="h-6 w-6" />
                  </div>
                  {!report.available && (
                    <Badge variant="secondary" size="sm">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                </div>
                <Button
                  variant={report.available ? 'primary' : 'outline'}
                  size="sm"
                  className="w-full"
                  disabled={!report.available}
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Generate Report
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Reports</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="space-y-3">
          {recentReports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{report.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{report.type}</span>
                    <span>•</span>
                    <span>{report.generated.toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
              >
                Download
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600">Buildings</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">£28.5k</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">54</div>
              <div className="text-sm text-gray-600">Total Units</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">92%</div>
              <div className="text-sm text-gray-600">Avg Collection</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;

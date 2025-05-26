import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Share2, 
  Building2, 
  User,
  Calendar,
  FileText,
  ChevronRight,
  Download,
  PieChart,
  Users,
  Home,
  Scale
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const ShareCertificates = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const certificates = [
    {
      id: 'SC-001',
      holder: 'Sarah Foster',
      unit: '3A',
      sharePercentage: 25,
      certificateNumber: 'SC-001',
      issuedDate: '2024-02-15',
      status: 'active',
      type: 'Original Issue'
    },
    {
      id: 'SC-002',
      holder: 'Robert Thompson',
      unit: '2A',
      sharePercentage: 35,
      certificateNumber: 'SC-002',
      issuedDate: '2024-02-15',
      status: 'active',
      type: 'Original Issue'
    },
    {
      id: 'SC-003',
      holder: 'Lisa Parker',
      unit: '1B',
      sharePercentage: 40,
      certificateNumber: 'SC-003',
      issuedDate: '2024-02-15',
      status: 'active',
      type: 'Original Issue'
    }
  ];

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Share Certificates</h1>
          <p className="text-gray-600 mt-1">Manage share of freehold ownership distribution</p>
        </div>
        <Button 
          leftIcon={<Plus size={16} />}
          variant="primary"
        >
          Issue New Certificate
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary-50">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Share2 className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-primary-600">Total Shares</p>
              <h3 className="text-xl font-bold text-primary-900">100%</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-secondary-50">
          <div className="flex items-center">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <Users className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Shareholders</p>
              <h3 className="text-xl font-bold text-secondary-900">3</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-accent-50">
          <div className="flex items-center">
            <div className="p-3 bg-accent-100 rounded-lg">
              <Home className="h-6 w-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-accent-600">Units</p>
              <h3 className="text-xl font-bold text-accent-900">24</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-success-50">
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-lg">
              <Scale className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-success-600">Status</p>
              <h3 className="text-xl font-bold text-success-900">Verified</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Share Distribution Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Share Distribution</h2>
          <Button 
            variant="outline"
            size="sm"
            leftIcon={<Download size={16} />}
          >
            Export
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <PieChart className="h-48 w-48 text-gray-300" />
          </div>

          <div className="space-y-4">
            {certificates.map(cert => (
              <div key={cert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">{cert.holder}</div>
                    <div className="text-sm text-gray-500">Unit {cert.unit}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{cert.sharePercentage}%</div>
                  <div className="text-sm text-gray-500">{cert.certificateNumber}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search certificates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
            />
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            >
              <option value="all">All Certificates</option>
              <option value="active">Active</option>
              <option value="transferred">Transferred</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button 
              variant="outline"
              leftIcon={<Filter size={16} />}
            >
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Certificates List */}
      <div className="space-y-4">
        {certificates.map((cert) => (
          <Card key={cert.id} hoverable className="animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary-100">
                <Share2 className="h-5 w-5 text-primary-600" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="primary" size="sm">{cert.type}</Badge>
                  <Badge variant="success" size="sm">{cert.status}</Badge>
                  <span className="text-sm text-gray-500">{cert.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">{cert.holder}</h3>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">Unit {cert.unit}</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Building2 size={14} />
                    <span>{cert.sharePercentage}% ownership</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Issued {cert.issuedDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText size={14} />
                    <span>Certificate #{cert.certificateNumber}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  leftIcon={<Download size={16} />}
                >
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ShareCertificates;
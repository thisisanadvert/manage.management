import React, { useState } from 'react';
import { Plus, Search, Filter, UserCheck, Star, MapPin, Phone, Mail, ExternalLink, ThumbsUp, ThumbsDown, MessageSquare, BriefcaseIcon, AlertTriangle, CheckCircle2, Calendar, FileText, X, PenTool as Tool, Building2, Wrench, Zap, Droplet, Shield, Brush } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const SupplierNetwork = () => {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const suppliers = [
    {
      id: 1,
      name: 'Apex Property Services',
      description: 'Full-service property maintenance company specializing in residential buildings.',
      category: 'Building',
      rating: 4.8,
      reviews: 45,
      verified: true,
      contact: {
        email: 'info@apexservices.com',
        phone: '020 1234 5678',
        website: 'www.apexservices.com',
        address: 'London, 2.3 miles'
      },
      services: [
        'General maintenance',
        'Renovations',
        'Emergency repairs'
      ]
    },
    {
      id: 2,
      name: 'FlowFix Plumbing',
      description: 'Professional plumbing services with 24/7 emergency callout.',
      category: 'Plumbing',
      rating: 4.9,
      reviews: 32,
      verified: true,
      contact: {
        email: 'service@flowfix.com',
        phone: '020 2345 6789',
        website: 'www.flowfix.com',
        address: 'London, 1.8 miles'
      },
      services: [
        'Emergency plumbing',
        'Leak repairs',
        'Bathroom installation'
      ]
    },
    {
      id: 3,
      name: 'Bright Spark Electricians',
      description: 'NICEIC registered electricians for all electrical work.',
      category: 'Electrical',
      rating: 4.7,
      reviews: 28,
      verified: true,
      contact: {
        email: 'info@brightspark.com',
        phone: '020 3456 7890',
        website: 'www.brightspark.com',
        address: 'London, 3.1 miles'
      },
      services: [
        'Electrical installations',
        'Safety inspections',
        'Emergency repairs'
      ]
    },
    {
      id: 4,
      name: 'Clean Slate Services',
      description: 'Commercial cleaning specialists for residential buildings.',
      category: 'Cleaning',
      rating: 4.6,
      reviews: 36,
      verified: true,
      contact: {
        email: 'info@cleanslate.com',
        phone: '020 4567 8901',
        website: 'www.cleanslate.com',
        address: 'London, 1.4 miles'
      },
      services: [
        'Regular cleaning',
        'Deep cleaning',
        'Window cleaning'
      ]
    },
    {
      id: 5,
      name: 'LockTight Security',
      description: 'Security systems and access control specialists.',
      category: 'Security',
      rating: 4.9,
      reviews: 41,
      verified: true,
      contact: {
        email: 'info@locktight.com',
        phone: '020 5678 9012',
        website: 'www.locktight.com',
        address: 'London, 4.2 miles'
      },
      services: [
        'Access control',
        'CCTV installation',
        'Security audits'
      ]
    },
    {
      id: 6,
      name: 'Green Horizons Landscaping',
      description: 'Professional garden maintenance and landscaping.',
      category: 'Garden',
      rating: 4.5,
      reviews: 24,
      verified: false,
      contact: {
        email: 'info@greenhorizons.com',
        phone: '020 6789 0123',
        website: 'www.greenhorizons.com',
        address: 'London, 3.7 miles'
      },
      services: [
        'Garden maintenance',
        'Landscaping',
        'Tree surgery'
      ]
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'building':
        return <Building2 size={20} />;
      case 'plumbing':
        return <Droplet size={20} />;
      case 'electrical':
        return <Zap size={20} />;
      case 'cleaning':
        return <Brush size={20} />;
      case 'security':
        return <Shield size={20} />;
      case 'garden':
        return <Tool size={20} />;
      default:
        return <Wrench size={20} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'building':
        return 'primary';
      case 'plumbing':
        return 'accent';
      case 'electrical':
        return 'warning';
      case 'cleaning':
        return 'success';
      case 'security':
        return 'error';
      case 'garden':
        return 'secondary';
      default:
        return 'gray';
    }
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Network</h1>
          <p className="text-gray-600 mt-1">Find and manage trusted building maintenance suppliers</p>
        </div>
        <Button 
          leftIcon={<Plus size={16} />}
          variant="primary"
        >
          Add Supplier
        </Button>
      </div>

      {/* Beta Notice */}
      <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <BriefcaseIcon className="h-5 w-5 text-accent-600" />
          <div>
            <h3 className="font-medium text-accent-900">Supplier Network (Beta)</h3>
            <p className="text-sm text-accent-700">
              We're working on integrating with Checkatrade for verified supplier information.
            </p>
          </div>
          <Badge variant="accent">Beta</Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search suppliers..." 
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
              <option value="all">All Categories</option>
              <option value="building">Building</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="cleaning">Cleaning</option>
              <option value="security">Security</option>
              <option value="garden">Garden</option>
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

      {/* Suppliers List */}
      <div className="space-y-4">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} hoverable className="animate-slide-up">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg bg-${getCategoryColor(supplier.category)}-100`}>
                {getCategoryIcon(supplier.category)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getCategoryColor(supplier.category)} size="sm">
                    {supplier.category}
                  </Badge>
                  {supplier.verified && (
                    <Badge variant="success" size="sm">Verified</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">{supplier.name}</h3>
                  <div className="flex items-center text-warning-500">
                    <Star size={16} className="fill-current" />
                    <span className="ml-1 text-sm">{supplier.rating}</span>
                    <span className="ml-1 text-sm text-gray-500">({supplier.reviews})</span>
                  </div>
                </div>

                <p className="mt-1 text-gray-600">{supplier.description}</p>

                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Services:</h4>
                  <div className="flex flex-wrap gap-2">
                    {supplier.services.map((service, index) => (
                      <Badge key={index} variant="gray" size="sm">{service}</Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{supplier.contact.address}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone size={14} />
                    <span>{supplier.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail size={14} />
                    <span>{supplier.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ExternalLink size={14} />
                    <a href={`https://${supplier.contact.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      {supplier.contact.website}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  variant="primary" 
                  size="sm"
                >
                  Contact
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  View Profile
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SupplierNetwork;
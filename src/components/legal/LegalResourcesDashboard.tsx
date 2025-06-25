import React, { useState, useEffect } from 'react';
import { ExternalLink, Search, Filter, BookOpen, AlertTriangle, Calendar, Tag, Bell } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import LegalResourcesService, { ExternalLegalResource, LegalUpdate } from '../../services/legalResourcesService';

interface LegalResourcesDashboardProps {
  framework?: string;
  category?: string;
}

const LegalResourcesDashboard: React.FC<LegalResourcesDashboardProps> = ({ framework, category }) => {
  const [activeTab, setActiveTab] = useState<'resources' | 'updates' | 'search'>('resources');
  const [resources, setResources] = useState<ExternalLegalResource[]>([]);
  const [updates, setUpdates] = useState<LegalUpdate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedFramework, setSelectedFramework] = useState<string>(framework || 'all');

  const resourcesService = LegalResourcesService.getInstance();

  useEffect(() => {
    loadResources();
    loadUpdates();
  }, [selectedType, selectedFramework, framework, category]);

  const loadResources = () => {
    let filteredResources = resourcesService.getAllResources();

    if (framework) {
      filteredResources = resourcesService.getResourcesByFramework(framework);
    } else if (selectedFramework !== 'all') {
      filteredResources = resourcesService.getResourcesByFramework(selectedFramework);
    }

    if (category) {
      filteredResources = filteredResources.filter(r => r.category === category);
    }

    if (selectedType !== 'all') {
      filteredResources = filteredResources.filter(r => r.type === selectedType);
    }

    setResources(filteredResources);
  };

  const loadUpdates = () => {
    let filteredUpdates = resourcesService.getRecentUpdates();

    if (framework) {
      filteredUpdates = resourcesService.getUpdatesByFramework(framework);
    } else if (selectedFramework !== 'all') {
      filteredUpdates = resourcesService.getUpdatesByFramework(selectedFramework);
    }

    setUpdates(filteredUpdates);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const searchResults = resourcesService.searchResources(searchQuery);
      setResources(searchResults);
      setActiveTab('search');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lease': return 'bg-blue-100 text-blue-800';
      case 'government': return 'bg-green-100 text-green-800';
      case 'tpi': return 'bg-purple-100 text-purple-800';
      case 'fpra': return 'bg-orange-100 text-orange-800';
      case 'legislation': return 'bg-red-100 text-red-800';
      case 'guidance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderResources = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Types</option>
          <option value="lease">LEASE</option>
          <option value="government">Government</option>
          <option value="tpi">TPI</option>
          <option value="fpra">FPRA</option>
          <option value="legislation">Legislation</option>
          <option value="guidance">Guidance</option>
        </select>

        <select
          value={selectedFramework}
          onChange={(e) => setSelectedFramework(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Frameworks</option>
          <option value="LTA_1985">LTA 1985</option>
          <option value="CLRA_2002">CLRA 2002</option>
          <option value="BSA_2022">BSA 2022</option>
          <option value="LFRA_2024">LFRA 2024</option>
          <option value="GDPR_2018">GDPR 2018</option>
        </select>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <Card key={resource.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={getTypeColor(resource.type)}>
                {resource.type.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {resource.framework}
              </Badge>
              {resource.priority === 'high' && (
                <Badge variant="error">High Priority</Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Updated: {resource.lastUpdated.toLocaleDateString('en-GB')}
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<ExternalLink className="h-4 w-4" />}
                onClick={() => window.open(resource.url, '_blank')}
              >
                Visit
              </Button>
            </div>

            {/* Tags */}
            {resource.tags.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-1">
                  {resource.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{resource.tags.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {resources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );

  const renderUpdates = () => (
    <div className="space-y-6">
      {updates.map((update) => (
        <Card key={update.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{update.title}</h3>
                <Badge className={getImpactColor(update.impact)}>
                  {update.impact} impact
                </Badge>
                {update.actionRequired && (
                  <Badge variant="warning">Action Required</Badge>
                )}
              </div>
              <p className="text-gray-600 mb-3">{update.summary}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Published: {update.publishedDate.toLocaleDateString('en-GB')}</span>
                </div>
                {update.effectiveDate && (
                  <div className="flex items-center space-x-1">
                    <Bell className="h-4 w-4" />
                    <span>Effective: {update.effectiveDate.toLocaleDateString('en-GB')}</span>
                  </div>
                )}
                <Badge variant="outline">{update.framework}</Badge>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-700 mb-3">{update.fullContent}</p>
            <div className="text-xs text-gray-500">
              Source: {update.source}
            </div>
          </div>
        </Card>
      ))}

      {updates.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No updates found</h3>
          <p className="text-gray-600">No recent legal updates for the selected criteria.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Legal Resources</h2>
          <p className="text-gray-600 mt-1">
            Access external legal resources and stay updated with latest changes
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search legal resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <Button variant="primary" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'resources', label: 'External Resources' },
            { id: 'updates', label: 'Legal Updates' },
            { id: 'search', label: 'Search Results' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.id === 'updates' && updates.filter(u => u.actionRequired).length > 0 && (
                <Badge variant="error" className="ml-2">
                  {updates.filter(u => u.actionRequired).length}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {(activeTab === 'resources' || activeTab === 'search') && renderResources()}
      {activeTab === 'updates' && renderUpdates()}
    </div>
  );
};

export default LegalResourcesDashboard;

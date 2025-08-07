import React, { useState } from 'react';
import { FileText, Search, Filter, BookOpen, Download, Eye, Scale, Users, Building2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { LEGAL_TEMPLATES, getTemplatesByRole } from '../data/legalTemplates';
import { LegalTemplate, TemplateCategory } from '../types/legal';
import LegalTemplateGenerator from '../components/legal/LegalTemplateGenerator';
import LegalGuidanceTooltip from '../components/legal/LegalGuidanceTooltip';

const LegalTemplates: React.FC = () => {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [showGenerator, setShowGenerator] = useState(false);

  // Get templates available to current user
  console.log('Current user role:', user?.role);
  console.log('All templates:', LEGAL_TEMPLATES.length);
  const availableTemplates = user?.role ? getTemplatesByRole(user.role) : LEGAL_TEMPLATES;
  console.log('Available templates for role:', availableTemplates.length, availableTemplates.map(t => t.id));

  // Check specifically for Register of Members template
  const registerTemplate = LEGAL_TEMPLATES.find(t => t.id === 'register-of-members');
  console.log('Register of Members template found:', registerTemplate ? 'YES' : 'NO');
  if (registerTemplate) {
    console.log('Register template roles:', registerTemplate.applicableRoles);
    console.log('User role matches:', registerTemplate.applicableRoles.includes(user?.role as any));
  }

  // Filter templates based on search and category
  const filteredTemplates = availableTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  console.log('Filtered templates:', filteredTemplates.length, filteredTemplates.map(t => t.id));
  console.log('Selected category:', selectedCategory);
  console.log('Search term:', searchTerm);

  const categories: Array<{ id: TemplateCategory | 'all'; label: string; icon: React.ReactNode }> = [
    { id: 'all', label: 'All Templates', icon: <FileText className="h-4 w-4" /> },
    { id: 'section_20_consultation', label: 'Section 20 Consultations', icon: <Users className="h-4 w-4" /> },
    { id: 'service_charge_demand', label: 'Service Charge Demands', icon: <Scale className="h-4 w-4" /> },
    { id: 'rtm_notice', label: 'RTM Notices', icon: <Building2 className="h-4 w-4" /> },
    { id: 'agm_notice', label: 'AGM Notices', icon: <FileText className="h-4 w-4" /> },
    { id: 'meeting_minutes', label: 'Meeting Minutes', icon: <FileText className="h-4 w-4" /> },
    { id: 'privacy_notice', label: 'Privacy Notices', icon: <FileText className="h-4 w-4" /> },
    { id: 'company_documents', label: 'Company Documents', icon: <Building2 className="h-4 w-4" /> }
  ];

  const getCategoryColor = (category: TemplateCategory): string => {
    switch (category) {
      case 'section_20_consultation':
        return 'bg-blue-100 text-blue-800';
      case 'service_charge_demand':
        return 'bg-green-100 text-green-800';
      case 'rtm_notice':
        return 'bg-purple-100 text-purple-800';
      case 'agm_notice':
        return 'bg-orange-100 text-orange-800';
      case 'meeting_minutes':
        return 'bg-gray-100 text-gray-800';
      case 'privacy_notice':
        return 'bg-red-100 text-red-800';
      case 'company_documents':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTemplateSelect = (template: LegalTemplate) => {
    console.log('Template selected:', template.id, template.title);
    console.log('Template applicable roles:', template.applicableRoles);
    console.log('Current user role:', user?.role);
    setSelectedTemplate(template);
    setShowGenerator(true);
  };

  const handleGenerateComplete = (content: string, variables: Record<string, any>) => {
    console.log('Template generated:', { content, variables });
    // Here you could save the generated document or show a success message
  };

  if (showGenerator && selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Generate Legal Document</h1>
            <p className="text-gray-600 mt-1">
              Create a legally compliant document using our template system
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowGenerator(false)}
          >
            Back to Templates
          </Button>
        </div>

        <LegalTemplateGenerator
          template={selectedTemplate}
          onGenerate={handleGenerateComplete}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Legal Template Library</h1>
            <p className="text-gray-600 mt-1">
              Access legally compliant templates for UK property management
            </p>
          </div>
          <LegalGuidanceTooltip
            title="Legal Template Library"
            guidance={{
              basic: "These templates are designed to help you comply with UK property law. Always ensure you understand your legal obligations before using any template.",
              intermediate: "Templates are based on current legislation including LTA 1985, CLRA 2002, and other relevant acts. Review and customise as needed for your specific circumstances.",
              advanced: "While these templates provide a solid foundation, complex situations may require legal advice. Consider consulting a property law specialist for unusual circumstances."
            }}
            framework="LTA_1985"
            externalResources={[
              {
                title: "LEASE Template Guidance",
                url: "https://www.lease-advice.org/advice-guide/",
                type: "lease",
                description: "Official guidance on using legal templates"
              }
            ]}
          />
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {template.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>
                <div className="flex items-center space-x-2 mb-3">
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  <span className="text-xs text-gray-500">v{template.version}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Updated: {template.lastUpdated.toLocaleDateString('en-GB')}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Eye className="h-4 w-4" />}
                  onClick={() => handleTemplateSelect(template)}
                >
                  Preview
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<FileText className="h-4 w-4" />}
                  onClick={() => handleTemplateSelect(template)}
                >
                  Use Template
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or category filter.
          </p>
        </Card>
      )}
    </div>
  );
};

export default LegalTemplates;

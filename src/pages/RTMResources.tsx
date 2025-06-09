import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, FileText, Scale, Building, Users, BookOpen } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Footer from '../components/layout/Footer';

const RTMResources = () => {
  const navigate = useNavigate();

  const governmentResources = [
    {
      title: 'Right to Manage - GOV.UK',
      description: 'Official government guidance on Right to Manage applications and requirements',
      url: 'https://www.gov.uk/right-to-manage-your-building',
      icon: <Building className="h-5 w-5" />
    },
    {
      title: 'Leasehold Advisory Service (LEASE)',
      description: 'Free advice and guidance for leaseholders and RTM companies',
      url: 'https://www.lease-advice.org/',
      icon: <Scale className="h-5 w-5" />
    },
    {
      title: 'Companies House',
      description: 'Register your RTM company and file annual returns',
      url: 'https://www.gov.uk/government/organisations/companies-house',
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: 'Property Tribunal',
      description: 'First-tier Tribunal (Property Chamber) for leasehold disputes',
      url: 'https://www.gov.uk/courts-tribunals/first-tier-tribunal-property-chamber',
      icon: <Scale className="h-5 w-5" />
    }
  ];

  const legalResources = [
    {
      title: 'Commonhold and Leasehold Reform Act 2002',
      description: 'The primary legislation governing Right to Manage',
      url: 'https://www.legislation.gov.uk/ukpga/2002/15/contents',
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: 'RTM Regulations 2003',
      description: 'Detailed regulations for RTM company formation and procedures',
      url: 'https://www.legislation.gov.uk/uksi/2003/1987/contents/made',
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: 'Service Charges (Consultation Requirements) Regulations',
      description: 'Legal requirements for consulting leaseholders on major works',
      url: 'https://www.legislation.gov.uk/uksi/2003/1987/contents/made',
      icon: <Users className="h-5 w-5" />
    }
  ];

  const professionalBodies = [
    {
      title: 'Association of Residential Managing Agents (ARMA)',
      description: 'Professional body for residential property management',
      url: 'https://arma.org.uk/',
      icon: <Building className="h-5 w-5" />
    },
    {
      title: 'Institute of Residential Property Management (IRPM)',
      description: 'Professional qualifications and standards for property managers',
      url: 'https://www.irpm.org.uk/',
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      title: 'Royal Institution of Chartered Surveyors (RICS)',
      description: 'Professional standards and guidance for property professionals',
      url: 'https://www.rics.org/',
      icon: <Scale className="h-5 w-5" />
    }
  ];

  const practicalGuides = [
    {
      title: 'RTM Company Formation Checklist',
      description: 'Step-by-step guide to setting up your RTM company',
      type: 'PDF Guide'
    },
    {
      title: 'Service Charge Budget Template',
      description: 'Excel template for creating annual service charge budgets',
      type: 'Excel Template'
    },
    {
      title: 'AGM Meeting Template',
      description: 'Template agenda and documents for Annual General Meetings',
      type: 'Document Pack'
    },
    {
      title: 'Contractor Procurement Guide',
      description: 'Best practices for selecting and managing building contractors',
      type: 'PDF Guide'
    }
  ];

  const ResourceCard = ({ resource, showType = false }: { resource: any, showType?: boolean }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-primary-100 rounded-lg text-primary-600 flex-shrink-0">
          {resource.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {resource.title}
          </h3>
          <p className="text-gray-600 mb-4">
            {resource.description}
          </p>
          {showType && (
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded mb-2">
              {resource.type}
            </span>
          )}
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              Visit Resource
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/80 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
            >
              ← Back to Home
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => navigate('/signup')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-16 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-2xl">
              <BookOpen className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            RTM Resources
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Essential resources, guides, and links for Right to Manage companies and directors
          </p>
        </div>
      </div>

      {/* Government Resources */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Government Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {governmentResources.map((resource, index) => (
              <ResourceCard key={index} resource={resource} />
            ))}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Legal Framework
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {legalResources.map((resource, index) => (
              <ResourceCard key={index} resource={resource} />
            ))}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Professional Bodies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {professionalBodies.map((resource, index) => (
              <ResourceCard key={index} resource={resource} />
            ))}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Practical Guides & Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {practicalGuides.map((resource, index) => (
              <ResourceCard key={index} resource={resource} showType={true} />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Streamline Your RTM Management?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Use these resources alongside our platform to manage your building more effectively
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/signup')}
          >
            Get Started with Manage.Management
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RTMResources;

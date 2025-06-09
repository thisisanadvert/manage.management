import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, Search, ArrowRight, Shield, FolderOpen, Upload, Users } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Footer from '../../components/layout/Footer';

const DocumentManagement = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <FolderOpen className="h-6 w-6" />,
      title: 'Organised Storage',
      description: 'Keep all building documents organised with smart categorisation and tagging systems'
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Quick Access',
      description: 'Find any document instantly with powerful search and filtering capabilities'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure Sharing',
      description: 'Share documents securely with residents and contractors with permission controls'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Version Control',
      description: 'Track document versions and maintain audit trails for all changes and updates'
    }
  ];

  const features = [
    'Drag-and-drop document upload',
    'Smart categorisation (Legal, Financial, Insurance, etc.)',
    'Advanced search and filtering',
    'Version history and tracking',
    'Secure sharing with permissions',
    'Digital signatures and approvals',
    'Automatic backup and sync',
    'Mobile access and viewing'
  ];

  const documentTypes = [
    { name: 'Legal Documents', count: '12', color: 'bg-blue-50 text-blue-600' },
    { name: 'Financial Records', count: '8', color: 'bg-green-50 text-green-600' },
    { name: 'Insurance Papers', count: '5', color: 'bg-purple-50 text-purple-600' },
    { name: 'Maintenance Records', count: '15', color: 'bg-orange-50 text-orange-600' },
    { name: 'Admin Documents', count: '7', color: 'bg-gray-50 text-gray-600' }
  ];

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
      <div className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-100 rounded-2xl">
                <FileText className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Document Management
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Securely store, organise, and share all your building documents. From legal papers to maintenance records, keep everything accessible and organised.
            </p>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => navigate('/signup')}
            >
              Start Organising Documents
            </Button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Document Management?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform how you handle building documentation with secure, organised, and accessible storage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Everything You Need
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our document management system includes all the tools you need to keep your building's paperwork organised and accessible.
              </p>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Categories</h3>
                </div>
                <div className="space-y-3">
                  {documentTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <FolderOpen className="h-5 w-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{type.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${type.color}`}>
                        {type.count} files
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Upload className="h-4 w-4" />
                    <span>Drag & drop to upload new documents</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Organise Your Building Documents?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join building managers who trust our platform to keep their important documents secure and accessible.
          </p>
          <Button
            variant="secondary"
            size="lg"
            rightIcon={<ArrowRight size={16} />}
            onClick={() => navigate('/signup')}
          >
            Get Started Today
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DocumentManagement;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, ArrowRight, Building2, Users, Wrench } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Footer from '../../components/layout/Footer';

const IssueManagement = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: 'Quick Reporting',
      description: 'Report issues instantly with photos, location details, and priority levels'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Progress Tracking',
      description: 'Monitor issue resolution from report to completion with real-time updates'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Stakeholder Communication',
      description: 'Keep all parties informed with automated notifications and updates'
    },
    {
      icon: <Wrench className="h-6 w-6" />,
      title: 'Contractor Management',
      description: 'Assign issues to trusted contractors and track their progress'
    }
  ];

  const features = [
    'Photo and document attachments',
    'Priority-based categorization',
    'Automated status updates',
    'Contractor assignment and tracking',
    'Resident communication tools',
    'Issue history and analytics'
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
      <div className="pt-32 pb-16 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary-100 rounded-2xl">
                <AlertTriangle className="h-12 w-12 text-primary-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Issue Management
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Streamline maintenance requests, track repairs, and keep your building running smoothly with our comprehensive issue management system.
            </p>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => navigate('/signup')}
            >
              Start Managing Issues
            </Button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Issue Management?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform how you handle building maintenance with tools designed for efficiency and transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary-100 rounded-lg text-primary-600">
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
                Our issue management system includes all the tools you need to handle maintenance requests efficiently and transparently.
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
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-medium text-gray-900">Elevator Issue - Unit 3A</div>
                    <div className="text-sm text-gray-500">Reported 2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="font-medium text-gray-900">Plumbing Repair - Unit 1B</div>
                    <div className="text-sm text-gray-500">In progress</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium text-gray-900">Lighting Fixed - Lobby</div>
                    <div className="text-sm text-gray-500">Completed yesterday</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Streamline Your Building Management?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of building managers who trust our platform to keep their properties running smoothly.
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

export default IssueManagement;

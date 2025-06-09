import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Shield, 
  Users, 
  ArrowRight, 
  CheckCircle2,
  Building,
  FileText,
  Vote,
  MessageSquare,
  BarChart4,
  Clock,
  Heart,
  Newspaper,
  Scale,
  Home
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Footer from '../components/layout/Footer';
import RoleSelector from '../components/landing/RoleSelector';
import { testSignupFlow, testDatabasePolicies } from '../utils/testSignup';

const Landing = () => {
  const navigate = useNavigate();

  const runTests = async () => {
    console.log('🚀 Running development tests...');
    await testSignupFlow();
    await testDatabasePolicies();
  };

  const features = [
    {
      title: 'Document Management',
      description: 'Securely store and share important building documents and records.',
      icon: FileText,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Voting System',
      description: 'Conduct polls and make collective decisions efficiently.',
      icon: Vote,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Communication Hub',
      description: 'Keep everyone informed with announcements and updates.',
      icon: MessageSquare,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Financial Tracking',
      description: 'Monitor service charges and building finances transparently.',
      icon: BarChart4,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      title: 'Maintenance Scheduling',
      description: 'Plan and track building maintenance and repairs.',
      icon: Clock,
      color: 'bg-red-100 text-red-600'
    },
    {
      title: 'Supplier Network',
      description: 'Access trusted suppliers for building services.',
      icon: Heart,
      color: 'bg-pink-100 text-pink-600'
    }
  ];

  const newsItems = [
    {
      category: 'Feature Update',
      date: 'May 3, 2025',
      title: 'New Financial Dashboard',
      description: 'We\'ve launched an improved financial dashboard with enhanced reporting capabilities and real-time tracking of service charges.'
    },
    {
      category: 'Community',
      date: 'May 1, 2025',
      title: 'RTM Success Stories',
      description: 'Read how buildings across the UK are successfully managing their properties with our platform.'
    },
    {
      category: 'Compliance',
      date: 'April 28, 2025',
      title: 'Updated Safety Guidelines',
      description: 'Stay compliant with the latest building safety regulations and management requirements.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a
                href="https://manage.management"
                className="text-lg font-bold text-primary-800 pixel-font"
              >
                Manage.Management
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="https://manage.management"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Home
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/pricing')}
              >
                Pricing
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/10 to-secondary-500/10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Property Management,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                Simplified
              </span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              The complete platform for residential building management, designed for RTM directors, Share of Freehold directors, and homeowners.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 px-4">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight size={16} />}
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/pricing')}
                className="w-full sm:w-auto"
              >
                View Pricing
              </Button>
              {import.meta.env.DEV && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={runTests}
                  className="w-full sm:w-auto"
                >
                  🧪 Run Tests
                </Button>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-16 sm:mt-20 lg:mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12 px-4">
              Everything you need to manage your building
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                  >
                    <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Latest Updates Section */}
          <div className="mt-16 sm:mt-20 lg:mt-24">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 px-4">Latest Updates</h2>
              <p className="mt-4 text-base sm:text-lg text-gray-600 px-4">Stay informed about the latest changes in property management</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {newsItems.map((item, index) => (
                <Card key={index} hoverable className="h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="primary">{item.category}</Badge>
                      <span className="text-sm text-gray-500">{item.date}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 flex-grow">{item.description}</p>
                    <Button
                      variant="ghost"
                      className="mt-4"
                      rightIcon={<ArrowRight size={16} />}
                    >
                      Read More
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Role-based Features Section */}
      <RoleSelector />

      <Footer />
    </div>
  );
};

export default Landing;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Building, Target, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Footer from '../components/layout/Footer';

const About = () => {
  const navigate = useNavigate();

  const timeline = [
    {
      year: 'June 2025',
      title: 'Platform Soft Launch',
      description: 'Manage.Management launches with core features for RTM companies and Share of Freehold directors'
    },
    {
      year: 'March 2025',
      title: 'Beta Testing',
      description: 'Extensive testing with real RTM companies and building managers across the UK'
    },
    {
      year: 'January 2025',
      title: 'Development Begins',
      description: 'Started building the platform after identifying gaps in existing property management solutions'
    },
    {
      year: 'December 2024',
      title: 'Market Research',
      description: 'Conducted interviews with RTM directors and building managers to understand their challenges'
    }
  ];

  const values = [
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Community First',
      description: 'We believe in empowering building communities to manage themselves effectively and transparently'
    },
    {
      icon: <Building className="h-6 w-6" />,
      title: 'Simplicity',
      description: 'Complex property management made simple through intuitive design and clear workflows'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Transparency',
      description: 'Every decision, expense, and communication should be clear and accessible to all stakeholders'
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: 'Built for Homeowners',
      description: 'Created by people who understand the challenges of building management firsthand'
    }
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
              onClick={() => window.location.href = 'https://app.manage.management'}
            >
              ← Back to App
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
      <div className="pt-32 pb-16 bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Manage.Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            We're on a mission to simplify building management for RTM companies, Share of Freehold directors, and homeowners across the UK.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Manage.Management was born out of a simple frustration: home ownership under building management shouldn't be this complicated.
                </p>
                <p>
                  After experiencing first-hand the challenges of owning a property within a managed residential building – from keeping track of service charges expenditure to coordinating essential maintenance – we realised that existing solutions were either overly complex, prohibitively expensive, or simply not designed with the unique needs of UK residential buildings in mind.
                </p>
                <p>
                  Felipe, a Share of Freeholder, and Frankie, a Leaseholder, both encountered these hurdles in their own homes. Their shared experiences highlighted just how much the sector needed a fresh approach.
                </p>
                <p>
                  So, we set out to create a platform that makes building management accessible, transparent, and efficient for everyone involved – from RTM directors managing their first building, to experienced property managers overseeing multiple developments.
                </p>
                <p>
                  Proudly built in Bournemouth with a genuine passion for homeowners across the UK, our platform blends modern technology with a deep understanding of UK property law and building management best practices.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white rounded-full shadow-lg">
                    <Building className="h-12 w-12 text-primary-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Made in Bournemouth
                </h3>
                <p className="text-gray-600">
                  Proudly developed on the south coast of England, bringing seaside innovation to property management across the UK.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary-100 rounded-lg text-primary-600">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600">
              From idea to platform
            </p>
          </div>

          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xs text-center leading-tight">
                    {item.year}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Community
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Be part of the future of building management in the UK
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

export default About;

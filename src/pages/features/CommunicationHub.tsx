import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, CheckCircle2, Bell, ArrowRight, Users, Megaphone, Mail, Calendar } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Footer from '../../components/layout/Footer';

const CommunicationHub = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <Megaphone className="h-6 w-6" />,
      title: 'Building Announcements',
      description: 'Keep all residents informed with important updates, notices, and building news'
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: 'Smart Notifications',
      description: 'Automated alerts for important events, deadlines, and building activities'
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Community Discussion',
      description: 'Enable residents to communicate and collaborate on building matters'
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Multi-channel Delivery',
      description: 'Reach residents via email, SMS, and in-app notifications for maximum engagement'
    }
  ];

  const features = [
    'Targeted announcement distribution',
    'Emergency notification system',
    'Resident discussion forums',
    'Event calendar and reminders',
    'Read receipt tracking',
    'Multi-language support',
    'Mobile push notifications',
    'Integration with building systems'
  ];

  const communicationTypes = [
    { 
      title: 'Emergency Alerts', 
      description: 'Immediate notifications for urgent building matters',
      icon: '🚨',
      color: 'bg-red-50 border-red-200'
    },
    { 
      title: 'General Announcements', 
      description: 'Regular updates about building activities and news',
      icon: '📢',
      color: 'bg-blue-50 border-blue-200'
    },
    { 
      title: 'Maintenance Notices', 
      description: 'Scheduled maintenance and service disruptions',
      icon: '🔧',
      color: 'bg-orange-50 border-orange-200'
    },
    { 
      title: 'Community Events', 
      description: 'Social events and building community activities',
      icon: '🎉',
      color: 'bg-green-50 border-green-200'
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
      <div className="pt-32 pb-16 bg-gradient-to-br from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-indigo-100 rounded-2xl">
                <MessageSquare className="h-12 w-12 text-indigo-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Communication Hub
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Keep your building community connected and informed. From emergency alerts to community events, ensure everyone stays in the loop with our comprehensive communication platform.
            </p>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => navigate('/signup')}
            >
              Start Communicating Better
            </Button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Communication Hub?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Build stronger building communities with tools designed to keep everyone connected and informed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
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

      {/* Communication Types */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Every Type of Communication
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From urgent alerts to community celebrations, our platform handles all your building communication needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {communicationTypes.map((type, index) => (
              <Card key={index} className={`p-6 border-2 ${type.color}`}>
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{type.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {type.title}
                    </h3>
                    <p className="text-gray-600">
                      {type.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Complete Communication Suite
              </h3>
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
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Announcements</h4>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-red-600 font-semibold">Emergency</span>
                      <span className="text-sm text-gray-500">2 hours ago</span>
                    </div>
                    <p className="text-gray-700">Lift temporarily out of service - engineers on site</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-blue-600 font-semibold">General</span>
                      <span className="text-sm text-gray-500">1 day ago</span>
                    </div>
                    <p className="text-gray-700">AGM scheduled for next month - agenda attached</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-green-600 font-semibold">Community</span>
                      <span className="text-sm text-gray-500">3 days ago</span>
                    </div>
                    <p className="text-gray-700">Summer BBQ event - Sunday 2pm in the garden</p>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-sm text-gray-500">📱 All residents notified via app & email</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Connect Your Building Community?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join building managers who trust our platform to keep their communities informed and engaged.
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

export default CommunicationHub;

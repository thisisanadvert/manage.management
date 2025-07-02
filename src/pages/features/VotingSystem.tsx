import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Vote, CheckCircle2, Users, ArrowRight, BarChart3, Clock, Shield, FileCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Footer from '../../components/layout/Footer';

const VotingSystem = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <Vote className="h-6 w-6" />,
      title: 'Democratic Decisions',
      description: 'Enable fair and transparent voting on all building matters with secure digital ballots'
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Real-time Results',
      description: 'Track voting progress and see results instantly with automatic vote counting'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Flexible Timing',
      description: 'Set voting periods that work for everyone with automated reminders and notifications'
    },
    {
      icon: <FileCheck className="h-6 w-6" />,
      title: 'Audit Trail',
      description: 'Maintain complete records of all votes and decisions for compliance and transparency'
    }
  ];

  const features = [
    'Multiple voting types (Yes/No, Multiple choice, Ranked)',
    'Secure anonymous voting options',
    'Automated reminder notifications',
    'Real-time progress tracking',
    'Quorum management and validation',
    'Detailed voting analytics',
    'Export results for records',
    'Integration with AGM processes'
  ];

  const pollTypes = [
    { name: 'Supplier Selection', description: 'Choose contractors and service providers', icon: '🏗️' },
    { name: 'Budget Approval', description: 'Vote on annual budgets and major expenses', icon: '💰' },
    { name: 'Policy Changes', description: 'Decide on building rules and regulations', icon: '📋' },
    { name: 'Major Works', description: 'Approve significant building improvements', icon: '🔨' },
    { name: 'AGM Resolutions', description: 'Formal voting during annual meetings', icon: '📊' }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-purple-100 rounded-2xl">
                <Vote className="h-12 w-12 text-purple-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Voting System
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Make collective decisions efficiently with our secure digital voting platform. From budget approvals to contractor selection, engage all stakeholders in the decision-making process.
            </p>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => navigate('/signup')}
            >
              Start Democratic Voting
            </Button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Voting System?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Empower your building community with fair, transparent, and efficient decision-making tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
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

      {/* Poll Types Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vote on What Matters
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform supports various types of polls and voting scenarios for all your building decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {pollTypes.map((poll, index) => (
              <Card key={index} className="p-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">{poll.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {poll.name}
                  </h3>
                  <p className="text-gray-600">
                    {poll.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Complete Voting Features
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
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Active Poll: Lift Maintenance Contract</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Eligible Voters</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Votes Cast</span>
                    <span className="font-semibold text-green-600">18</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    75% participation • 6 days remaining
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span>Option A: Apex Lifts Ltd</span>
                      <span className="font-semibold text-green-600">12 votes</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>Option B: Elite Elevators</span>
                      <span className="font-semibold text-gray-600">6 votes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Democratise Your Building Decisions?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join building communities using our platform to make fair, transparent decisions together.
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

export default VotingSystem;

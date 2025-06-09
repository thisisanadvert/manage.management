import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Book, MessageCircle, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Footer from '../components/layout/Footer';

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of using Manage.Management',
      articles: [
        'Setting up your building profile',
        'Inviting residents to the platform',
        'Understanding user roles and permissions',
        'First-time login guide'
      ]
    },
    {
      title: 'Issue Management',
      description: 'How to report and track building issues',
      articles: [
        'Reporting a new issue',
        'Adding photos and documents',
        'Tracking issue progress',
        'Communicating with contractors'
      ]
    },
    {
      title: 'Financial Management',
      description: 'Managing building finances and service charges',
      articles: [
        'Setting up service charges',
        'Tracking expenses and budgets',
        'Generating financial reports',
        'Managing reserve funds'
      ]
    },
    {
      title: 'Communication',
      description: 'Keeping residents informed and engaged',
      articles: [
        'Creating announcements',
        'Setting up voting polls',
        'Managing building documents',
        'Email notifications settings'
      ]
    }
  ];

  const faqs = [
    {
      question: 'How do I add new residents to my building?',
      answer: 'You can invite new residents by going to the Building Settings page and clicking "Invite Residents". Enter their email addresses and select their role (leaseholder, shareholder, etc.). They\'ll receive an invitation email to join the platform.'
    },
    {
      question: 'Can residents report issues directly?',
      answer: 'Yes! Residents can report issues directly through the platform. They can add photos, describe the problem, and specify the location. Building managers will be notified immediately and can track the issue through to resolution.'
    },
    {
      question: 'How do service charge calculations work?',
      answer: 'Service charges are calculated based on your building\'s setup. You can set fixed amounts per unit, percentage-based charges, or custom allocations. The system automatically calculates individual charges and generates statements for residents.'
    },
    {
      question: 'Is my building data secure?',
      answer: 'Absolutely. We use enterprise-grade security with encrypted data storage, secure authentication, and regular security audits. Your building data is protected and only accessible to authorized users in your building.'
    },
    {
      question: 'Can I export financial reports?',
      answer: 'Yes, you can export financial reports in PDF and Excel formats. This includes service charge statements, expense reports, budget summaries, and audit trails for your records or accountant.'
    },
    {
      question: 'How do I set up voting for building decisions?',
      answer: 'Go to the Voting section and click "Create New Poll". Choose your poll type (yes/no, multiple choice, etc.), set the voting period, and invite participants. Results are automatically calculated and can be exported for your records.'
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-100 rounded-2xl">
              <Book className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Help Centre
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to your questions and learn how to make the most of Manage.Management
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Help Categories */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Browse by Category
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>
                <ul className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex} className="flex items-center text-sm text-gray-600 hover:text-primary-600 cursor-pointer">
                      <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
                      {article}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-2xl">
              <MessageCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Still Need Help?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={16} />}
            >
              Contact Support
            </Button>
            <Button
              variant="outline"
              size="lg"
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Help;

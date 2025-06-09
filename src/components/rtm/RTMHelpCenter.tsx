import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, ExternalLink, Book, FileText, Phone, Mail, MessageCircle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
}

interface HelpResource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'template' | 'video' | 'external';
  url: string;
  category: string;
}

const RTMHelpCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'What is the minimum number of flats required for RTM?',
      answer: 'A building must contain at least 2 flats to qualify for Right to Manage. There is no maximum limit, but buildings with more flats may have more complex requirements.',
      category: 'eligibility',
      helpful: 45,
      notHelpful: 3
    },
    {
      id: '2',
      question: 'Can we proceed with RTM if some leaseholders don\'t want to participate?',
      answer: 'Yes, you don\'t need 100% participation. However, you need at least 50% of qualifying leaseholders to participate in the RTM claim. Non-participating leaseholders will still benefit from RTM but won\'t be involved in decision-making.',
      category: 'eligibility',
      helpful: 38,
      notHelpful: 7
    },
    {
      id: '3',
      question: 'How long does the RTM process typically take?',
      answer: 'The complete RTM process typically takes 6-12 months from initial assessment to taking control of management. This includes company formation (1-2 months), notice periods (3 months minimum), and handover arrangements.',
      category: 'timeline',
      helpful: 52,
      notHelpful: 2
    },
    {
      id: '4',
      question: 'What costs are involved in forming an RTM company?',
      answer: 'Typical costs include: Company formation (£12-50), legal advice (£1,000-3,000), notice service costs (£200-500), and ongoing management costs. The current managing agent may also charge reasonable costs for handover.',
      category: 'costs',
      helpful: 41,
      notHelpful: 5
    },
    {
      id: '5',
      question: 'Can the landlord challenge our RTM claim?',
      answer: 'Yes, the landlord can serve a counter-notice within one month of receiving your claim notice. They can only challenge on specific legal grounds, such as the building not qualifying or procedural errors in your claim.',
      category: 'legal',
      helpful: 33,
      notHelpful: 4
    },
    {
      id: '6',
      question: 'Do we need to appoint a professional managing agent after RTM?',
      answer: 'No, it\'s not mandatory. You can choose to self-manage or appoint a professional managing agent. Many RTM companies start with self-management and later appoint professionals as needed.',
      category: 'management',
      helpful: 29,
      notHelpful: 8
    }
  ];

  const helpResources: HelpResource[] = [
    {
      id: '1',
      title: 'RTM Eligibility Checklist',
      description: 'Complete checklist to verify if your building qualifies for Right to Manage',
      type: 'template',
      url: '/downloads/rtm-eligibility-checklist.pdf',
      category: 'eligibility'
    },
    {
      id: '2',
      title: 'Sample RTM Articles of Association',
      description: 'Template articles of association specifically for RTM companies',
      type: 'template',
      url: '/downloads/rtm-articles-template.pdf',
      category: 'formation'
    },
    {
      id: '3',
      title: 'RTM Claim Notice Template',
      description: 'Legally compliant template for serving RTM claim notices',
      type: 'template',
      url: '/downloads/rtm-claim-notice-template.pdf',
      category: 'notices'
    },
    {
      id: '4',
      title: 'Government RTM Guidance',
      description: 'Official government guidance on Right to Manage procedures',
      type: 'external',
      url: 'https://www.gov.uk/right-to-manage-your-building',
      category: 'legal'
    },
    {
      id: '5',
      title: 'RTM Process Video Guide',
      description: 'Step-by-step video walkthrough of the entire RTM process',
      type: 'video',
      url: '/videos/rtm-process-guide',
      category: 'overview'
    },
    {
      id: '6',
      title: 'Managing Agent Handover Checklist',
      description: 'Comprehensive checklist for managing the handover process',
      type: 'template',
      url: '/downloads/handover-checklist.pdf',
      category: 'handover'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'formation', label: 'Company Formation' },
    { id: 'notices', label: 'Notices & Legal' },
    { id: 'timeline', label: 'Timeline & Process' },
    { id: 'costs', label: 'Costs & Fees' },
    { id: 'management', label: 'Management' },
    { id: 'legal', label: 'Legal Issues' }
  ];

  const filteredFAQs = faqItems.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredResources = helpResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'guide': return <Book className="h-4 w-4" />;
      case 'template': return <FileText className="h-4 w-4" />;
      case 'video': return <MessageCircle className="h-4 w-4" />;
      case 'external': return <ExternalLink className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">RTM Help Center</h3>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Quick Contact */}
      <Card>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Need Personal Help?</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
              <Phone className="h-5 w-5 text-blue-600" />
              <div>
                <h5 className="font-medium text-gray-900">Phone Support</h5>
                <p className="text-sm text-gray-600">0800 123 4567</p>
                <p className="text-xs text-gray-500">Mon-Fri 9am-5pm</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
              <Mail className="h-5 w-5 text-green-600" />
              <div>
                <h5 className="font-medium text-gray-900">Email Support</h5>
                <p className="text-sm text-gray-600">rtm@manage.management</p>
                <p className="text-xs text-gray-500">Response within 24hrs</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              <div>
                <h5 className="font-medium text-gray-900">Live Chat</h5>
                <p className="text-sm text-gray-600">Chat with an expert</p>
                <p className="text-xs text-gray-500">Available now</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Frequently Asked Questions */}
      <Card>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Frequently Asked Questions
            {filteredFAQs.length !== faqItems.length && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredFAQs.length} of {faqItems.length})
              </span>
            )}
          </h4>
          
          <div className="space-y-3">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFAQ === faq.id ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                
                {expandedFAQ === faq.id && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-700 mb-3">{faq.answer}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Was this helpful?</span>
                        <button className="flex items-center space-x-1 hover:text-green-600">
                          <span>👍</span>
                          <span>{faq.helpful}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-red-600">
                          <span>👎</span>
                          <span>{faq.notHelpful}</span>
                        </button>
                      </div>
                      <span className="text-xs text-gray-400 capitalize">
                        {faq.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {filteredFAQs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No FAQs found matching your search criteria.
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Help Resources */}
      <Card>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Help Resources
            {filteredResources.length !== helpResources.length && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredResources.length} of {helpResources.length})
              </span>
            )}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-600 mt-1">
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">{resource.title}</h5>
                    <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 capitalize">
                        {resource.category} • {resource.type}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={resource.type === 'external' ? <ExternalLink size={14} /> : undefined}
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        {resource.type === 'external' ? 'Visit' : 'Download'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredResources.length === 0 && (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No resources found matching your search criteria.
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Legal Disclaimer */}
      <Card>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Important Legal Notice</h4>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Disclaimer:</strong> The information provided in this help center is for general guidance only and should not be considered as legal advice. 
              RTM procedures can be complex and may vary depending on your specific circumstances. We strongly recommend seeking professional legal advice 
              before proceeding with any RTM claim, especially for complex buildings or where disputes may arise.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Professional Support:</strong> If you need professional legal or surveying advice for your RTM claim, 
              we can connect you with qualified specialists who have experience with Right to Manage procedures.
            </p>
            <Button variant="outline" className="mt-3" size="sm">
              Find Professional Help
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RTMHelpCenter;

import React from 'react';
import { Shield, FileText, Scale, AlertTriangle, CheckCircle2, ExternalLink, Book, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const LeaseholderRights = () => {
  const keyRights = [
    {
      title: 'Service Charge Information',
      description: 'You have the right to see detailed breakdowns of service charges and challenge unreasonable costs.',
      icon: FileText,
      details: [
        'Request annual service charge accounts',
        'See invoices and receipts for work done',
        'Challenge charges through tribunal if necessary',
        'Receive advance notice of major works over £250'
      ]
    },
    {
      title: 'Right to Manage (RTM)',
      description: 'Take control of your building management without proving fault with current management.',
      icon: Users,
      details: [
        'Form an RTM company with other leaseholders',
        'Take over management functions',
        'No need to prove fault with current manager',
        'Requires support from majority of qualifying leaseholders'
      ]
    },
    {
      title: 'Major Works Consultation',
      description: 'Landlords must consult you before carrying out major works or long-term agreements.',
      icon: AlertTriangle,
      details: [
        'Consultation required for works over £250 per leaseholder',
        'Right to nominate contractors',
        'Minimum 30-day consultation periods',
        'Right to make observations and objections'
      ]
    },
    {
      title: 'Information Rights',
      description: 'Access to important documents and information about your building and lease.',
      icon: Book,
      details: [
        'Copy of your lease and building insurance policy',
        'Details of landlord and managing agent',
        'Service charge accounts and supporting documents',
        'Information about planned major works'
      ]
    }
  ];

  const resources = [
    {
      title: 'Leasehold Advisory Service (LEASE)',
      description: 'Free advice on leasehold and commonhold law',
      url: 'https://www.lease-advice.org',
      type: 'Government Service'
    },
    {
      title: 'First-tier Tribunal (Property Chamber)',
      description: 'Resolve disputes about service charges and other leasehold matters',
      url: 'https://www.gov.uk/courts-tribunals/first-tier-tribunal-property-chamber',
      type: 'Legal'
    },
    {
      title: 'Citizens Advice',
      description: 'General advice on housing and legal rights',
      url: 'https://www.citizensadvice.org.uk',
      type: 'Support'
    },
    {
      title: 'GOV.UK Leasehold Property Guide',
      description: 'Official government guidance on leasehold rights',
      url: 'https://www.gov.uk/leasehold-property',
      type: 'Government'
    }
  ];

  const commonIssues = [
    {
      issue: 'High Service Charges',
      solution: 'Request detailed breakdown, challenge unreasonable charges through tribunal',
      urgency: 'medium'
    },
    {
      issue: 'Poor Building Maintenance',
      solution: 'Report issues formally, consider RTM if problems persist',
      urgency: 'high'
    },
    {
      issue: 'Lack of Consultation',
      solution: 'Know your consultation rights, object to works without proper consultation',
      urgency: 'high'
    },
    {
      issue: 'Unreasonable Ground Rent',
      solution: 'Check lease terms, consider ground rent reduction or enfranchisement',
      urgency: 'low'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Leaseholder Rights Guide
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding your rights as a leaseholder is crucial for protecting your investment 
              and ensuring fair treatment from landlords and managing agents.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Key Rights */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Your Key Rights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {keyRights.map((right, index) => {
              const Icon = right.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-start mb-4">
                    <div className="bg-primary-100 p-3 rounded-lg mr-4">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{right.title}</h3>
                      <p className="text-gray-600">{right.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {right.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Common Issues */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Common Issues & Solutions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {commonIssues.map((item, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{item.issue}</h3>
                  <Badge 
                    variant={item.urgency === 'high' ? 'warning' : item.urgency === 'medium' ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    {item.urgency} priority
                  </Badge>
                </div>
                <p className="text-gray-600">{item.solution}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Helpful Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-gray-600 mb-3">{resource.description}</p>
                    <Badge variant="secondary" size="sm">{resource.type}</Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ExternalLink size={14} />}
                  onClick={() => window.open(resource.url, '_blank')}
                >
                  Visit Resource
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-primary-50 rounded-lg p-8">
          <Scale className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Need Help with Your Rights?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            If you're facing issues with your landlord or managing agent, don't hesitate to seek help. 
            Understanding and exercising your rights is key to fair treatment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary">
              Get Free Advice
            </Button>
            <Button variant="outline">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaseholderRights;

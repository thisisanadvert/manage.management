import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart4, CheckCircle2, PoundSterling, ArrowRight, TrendingUp, Calculator, FileText, Shield } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Footer from '../../components/layout/Footer';

const FinancialTracking = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <PoundSterling className="h-6 w-6" />,
      title: 'Service Charge Management',
      description: 'Calculate, track, and collect service charges with complete transparency for all residents'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Budget Planning',
      description: 'Create annual budgets, monitor spending, and maintain healthy reserve funds'
    },
    {
      icon: <Calculator className="h-6 w-6" />,
      title: 'Expense Tracking',
      description: 'Record all building expenses with receipts, categorisation, and approval workflows'
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Financial Reporting',
      description: 'Generate professional reports for AGMs, audits, and regulatory compliance'
    }
  ];

  const features = [
    'Automated service charge calculations',
    'Reserve fund management and tracking',
    'Expense categorisation and approval',
    'Professional financial statements',
    'Budget vs actual reporting',
    'Audit trail for all transactions',
    'Integration with accounting software',
    'Quarterly and annual reporting'
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
      <div className="pt-32 pb-16 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-100 rounded-2xl">
                <BarChart4 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Financial Tracking
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Manage your building's finances with confidence. Track service charges, monitor budgets, and maintain complete financial transparency for all stakeholders.
            </p>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => navigate('/signup')}
            >
              Start Managing Finances
            </Button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Financial Management?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Streamline your building's financial operations with tools designed for transparency and compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-lg text-green-600">
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
                Complete Financial Control
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our financial tracking system provides everything you need to manage your building's finances professionally and transparently.
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="font-medium text-gray-900">Service Charges Collected</span>
                    <span className="text-green-600 font-bold">£24,500</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="font-medium text-gray-900">Reserve Fund</span>
                    <span className="text-blue-600 font-bold">£15,200</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                    <span className="font-medium text-gray-900">Monthly Expenses</span>
                    <span className="text-orange-600 font-bold">£3,800</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <span className="font-medium text-gray-900">Budget Remaining</span>
                    <span className="text-purple-600 font-bold">£8,400</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Building's Finances?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join building managers who trust our platform to maintain transparent and compliant financial records.
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

export default FinancialTracking;

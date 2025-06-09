import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Shield,
  Clock,
  Building2
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface QualifySignupPromptProps {
  qualificationData: any;
  eligibilityResult: 'eligible' | 'maybe' | 'not-eligible' | null;
  onComplete: (contactInfo: { name: string; email: string; phone?: string }) => void;
  onBack: () => void;
}

const QualifySignupPrompt: React.FC<QualifySignupPromptProps> = ({
  qualificationData,
  eligibilityResult,
  onComplete,
  onBack
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onComplete({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined
    });
    
    setIsSubmitting(false);
  };

  const isFormValid = formData.name.trim() && formData.email.trim() && formData.email.includes('@');

  const getResultMessage = () => {
    switch (eligibilityResult) {
      case 'eligible':
        return {
          title: 'Excellent! Your Building Qualifies for RTM',
          subtitle: 'Get instant access to our complete RTM formation toolkit',
          benefits: [
            'Full eligibility assessment with detailed report',
            'Professional leaseholder survey templates',
            'Step-by-step company formation guidance',
            'Legal notice generators and compliance tools'
          ]
        };
      case 'maybe':
        return {
          title: 'Your Building Has RTM Potential',
          subtitle: 'Access tools to strengthen your RTM case and address requirements',
          benefits: [
            'Detailed analysis of your specific situation',
            'Action plan to meet RTM requirements',
            'Alternative management options guidance',
            'Expert support to improve your chances'
          ]
        };
      case 'not-eligible':
        return {
          title: 'Explore Your Management Options',
          subtitle: 'While RTM may not be suitable now, we can help you find alternatives',
          benefits: [
            'Alternative management solutions',
            'Guidance on improving your situation',
            'Tools for engaging with current management',
            'Future RTM preparation strategies'
          ]
        };
      default:
        return {
          title: 'Access Your Complete RTM Toolkit',
          subtitle: 'Professional tools and guidance for your property management journey',
          benefits: [
            'Complete RTM formation toolkit',
            'Expert guidance and support',
            'Legal compliance tools',
            'Professional templates and documents'
          ]
        };
    }
  };

  const result = getResultMessage();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
          <Building2 className="h-8 w-8 text-primary-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{result.title}</h2>
          <p className="text-gray-600 mt-2">{result.subtitle}</p>
        </div>
      </div>

      {/* What You'll Get */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 text-center">
            What You'll Get Instant Access To:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Signup Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Create Your Free Account
            </h3>
            <p className="text-gray-600 text-sm">
              Your qualification data will be saved to your profile
            </p>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your email address"
              />
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your phone number"
              />
              <p className="text-xs text-gray-500 mt-1">
                For priority support and important updates
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-xs text-gray-600">Secure & Private</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-gray-600">14-Day Free Trial</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
                <span className="text-xs text-gray-600">No Credit Card</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!isFormValid || isSubmitting}
            rightIcon={<ArrowRight size={16} />}
          >
            {isSubmitting ? 'Creating Account...' : 'Get Instant Access'}
          </Button>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-primary-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>
          </p>
        </form>
      </Card>

      {/* Back Button */}
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={onBack}
          leftIcon={<ArrowLeft size={16} />}
        >
          Back to Results
        </Button>
      </div>

      {/* Summary of Captured Data */}
      {qualificationData && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="text-center space-y-2">
            <h4 className="font-medium text-gray-900">Your Assessment Summary</h4>
            <div className="text-sm text-gray-600">
              {qualificationData.totalFlats} flats • {qualificationData.leaseLength} years remaining • {' '}
              {Math.round((qualificationData.interestedLeaseholders / qualificationData.totalFlats) * 100)}% participation
            </div>
            <p className="text-xs text-gray-500">
              This data will be saved to your profile for easy access
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QualifySignupPrompt;

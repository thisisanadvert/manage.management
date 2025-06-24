import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  Calendar, 
  FileText,
  Star,
  Shield,
  Clock,
  Heart
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LightEligibilityChecker from '../components/qualify/LightEligibilityChecker';
import ToolPreview from '../components/qualify/ToolPreview';
import QualifySignupPrompt from '../components/qualify/QualifySignupPrompt';

interface QualificationData {
  totalFlats: number;
  leaseLength: number;
  interestedLeaseholders: number;
  managementIssues: string;
  contactInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
}

const RTMQualify = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'intro' | 'checker' | 'preview' | 'signup'>('intro');
  const [qualificationData, setQualificationData] = useState<QualificationData | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<'eligible' | 'maybe' | 'not-eligible' | null>(null);

  // Load any existing data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('rtm_qualification_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setQualificationData(parsed);
        if (parsed.totalFlats && parsed.leaseLength) {
          setCurrentStep('preview');
        }
      } catch (error) {
        console.error('Error loading saved qualification data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (qualificationData) {
      localStorage.setItem('rtm_qualification_data', JSON.stringify(qualificationData));
    }
  }, [qualificationData]);

  const handleEligibilityComplete = (data: QualificationData, result: 'eligible' | 'maybe' | 'not-eligible') => {
    setQualificationData(data);
    setEligibilityResult(result);
    setCurrentStep('preview');
  };

  const handleSignupComplete = (contactInfo: { name: string; email: string; phone?: string }) => {
    const updatedData = {
      ...qualificationData!,
      contactInfo
    };
    setQualificationData(updatedData);
    localStorage.setItem('rtm_qualification_data', JSON.stringify(updatedData));
    
    // Redirect to signup with pre-filled data
    navigate('/signup', { 
      state: { 
        qualificationData: updatedData,
        source: 'rtm-qualify'
      } 
    });
  };

  const renderIntro = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium">
          <Building2 className="h-4 w-4" />
          <span>Free RTM Qualification Check</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Could Your Building Qualify for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">
            Right to Manage?
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Take our quick 2-minute assessment to discover if your building qualifies for RTM and see exactly what tools you'll need to make it happen.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight size={16} />}
            onClick={() => setCurrentStep('checker')}
          >
            Start Free Assessment
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setCurrentStep('preview')}
          >
            See RTM Tools
          </Button>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="text-center p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">UK Legal Compliance</h3>
          <p className="text-sm text-gray-600">
            All tools follow current RTM legislation and requirements
          </p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Expert Guidance</h3>
          <p className="text-sm text-gray-600">
            Step-by-step guidance through the entire RTM process
          </p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Save Time & Money</h3>
          <p className="text-sm text-gray-600">
            Avoid expensive legal consultations with our guided tools
          </p>
        </Card>
      </div>

      {/* Social Proof */}
      <div className="bg-gray-50 rounded-xl p-8 max-w-4xl mx-auto">
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
            ))}
          </div>
          <blockquote className="text-lg text-gray-700 italic">
            "The RTM qualification tool helped us understand exactly what we needed to do. 
            We successfully formed our RTM company and took control of our building management!"
          </blockquote>
          <div className="text-sm text-gray-600">
            <strong>Basilio B.</strong> - RTM Director, London
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'intro':
        return renderIntro();
      case 'checker':
        return (
          <LightEligibilityChecker 
            onComplete={handleEligibilityComplete}
            onBack={() => setCurrentStep('intro')}
          />
        );
      case 'preview':
        return (
          <ToolPreview 
            eligibilityResult={eligibilityResult}
            qualificationData={qualificationData}
            onSignup={() => setCurrentStep('signup')}
            onBack={() => setCurrentStep('checker')}
          />
        );
      case 'signup':
        return (
          <QualifySignupPrompt 
            qualificationData={qualificationData}
            eligibilityResult={eligibilityResult}
            onComplete={handleSignupComplete}
            onBack={() => setCurrentStep('preview')}
          />
        );
      default:
        return renderIntro();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <a
                href="https://manage.management"
                className="text-lg font-bold text-primary-800 pixel-font"
              >
                Manage.Management
              </a>
            </div>
            <div className="flex items-center space-x-4">
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
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderCurrentStep()}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-1 mb-4">
            <span>Made in Bournemouth with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>for homeowners across the UK</span>
          </div>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="/privacy" className="hover:text-white">Privacy Policy</a>
            <a href="/terms" className="hover:text-white">Terms of Service</a>
            <a href="/help" className="hover:text-white">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RTMQualify;

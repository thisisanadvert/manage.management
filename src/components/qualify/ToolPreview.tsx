import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Building2,
  Users,
  FileText,
  Calendar,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Star,
  Lock,
  Unlock
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface ToolPreviewProps {
  eligibilityResult: 'eligible' | 'maybe' | 'not-eligible' | null;
  qualificationData: any;
  onSignup: () => void;
  onBack: () => void;
}

const ToolPreview: React.FC<ToolPreviewProps> = ({ 
  eligibilityResult, 
  qualificationData, 
  onSignup, 
  onBack 
}) => {
  const getEligibilityStatus = () => {
    switch (eligibilityResult) {
      case 'eligible':
        return {
          icon: <CheckCircle2 className="h-8 w-8 text-green-600" />,
          title: 'Great News! Your Building Likely Qualifies',
          subtitle: 'Based on your answers, your building meets the basic RTM requirements',
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'maybe':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-amber-600" />,
          title: 'Possible RTM Qualification',
          subtitle: 'Your building may qualify, but you\'ll need to address some requirements',
          color: 'amber',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        };
      case 'not-eligible':
        return {
          icon: <XCircle className="h-8 w-8 text-red-600" />,
          title: 'Current Requirements Not Met',
          subtitle: 'Don\'t worry - our tools can help you explore alternatives',
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: <Building2 className="h-8 w-8 text-blue-600" />,
          title: 'RTM Formation Tools',
          subtitle: 'Professional tools to guide your Right to Manage journey',
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
    }
  };

  const rtmTools = [
    {
      id: 'eligibility',
      title: 'Full Eligibility Assessment',
      description: 'Comprehensive 8-point eligibility check with detailed legal requirements',
      icon: <CheckCircle2 className="h-5 w-5" />,
      features: ['UK legal compliance', 'Detailed requirements check', 'Next steps guidance'],
      preview: true
    },
    {
      id: 'survey',
      title: 'Leaseholder Survey Tool',
      description: 'Professional survey templates and participation tracking',
      icon: <Users className="h-5 w-5" />,
      features: ['Email templates', 'Response tracking', 'Participation analytics'],
      preview: false
    },
    {
      id: 'formation',
      title: 'RTM Company Formation',
      description: 'Step-by-step company formation with legal document generation',
      icon: <Building2 className="h-5 w-5" />,
      features: ['Company name generator', 'Articles of association', 'Director management'],
      preview: false
    },
    {
      id: 'notices',
      title: 'Legal Notice Generator',
      description: 'Generate compliant RTM claim notices and track service',
      icon: <FileText className="h-5 w-5" />,
      features: ['Statutory notices', 'Service tracking', 'Legal compliance'],
      preview: false
    },
    {
      id: 'timeline',
      title: 'RTM Process Timeline',
      description: 'Visual timeline with milestones and deadline tracking',
      icon: <Calendar className="h-5 w-5" />,
      features: ['Progress tracking', 'Key deadlines', 'Task management'],
      preview: false
    },
    {
      id: 'help',
      title: 'Expert Help Center',
      description: 'Comprehensive guides, FAQs, and professional support',
      icon: <HelpCircle className="h-5 w-5" />,
      features: ['Legal guidance', 'Template library', 'Expert support'],
      preview: false
    }
  ];

  const status = getEligibilityStatus();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Results Header */}
      <div className="text-center space-y-6">
        <div className={`inline-flex items-center space-x-4 ${status.bgColor} ${status.borderColor} border-2 rounded-xl p-6`}>
          {status.icon}
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gray-900">{status.title}</h2>
            <p className="text-gray-600">{status.subtitle}</p>
          </div>
        </div>

        {eligibilityResult && qualificationData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg border p-4">
              <div className="text-2xl font-bold text-gray-900">{qualificationData.totalFlats}</div>
              <div className="text-sm text-gray-600">Total Flats</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-2xl font-bold text-gray-900">{qualificationData.leaseLength}</div>
              <div className="text-sm text-gray-600">Years Remaining</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((qualificationData.interestedLeaseholders / qualificationData.totalFlats) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Participation</div>
            </div>
          </div>
        )}
      </div>

      {/* Tools Preview */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Complete RTM Formation Toolkit
          </h3>
          <p className="text-gray-600">
            Professional tools that guide you through every step of the RTM process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rtmTools.map((tool) => (
            <Card key={tool.id} className="relative overflow-hidden">
              {!tool.preview && (
                <div className="absolute top-4 right-4">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${tool.preview ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{tool.title}</h4>
                      {tool.preview && (
                        <Badge variant="success" size="sm">Preview Available</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                  </div>
                </div>

                <ul className="space-y-1">
                  {tool.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {tool.preview ? (
                  <div className="flex items-center text-sm text-green-600">
                    <Unlock className="h-4 w-4 mr-1" />
                    <span>Available in preview</span>
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-gray-500">
                    <Lock className="h-4 w-4 mr-1" />
                    <span>Unlock with full access</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Value Proposition */}
      <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-gray-900">
            Why Choose Our RTM Formation Tools?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary-600">£2,000+</div>
              <div className="text-sm text-gray-600">Average savings vs legal fees</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary-600">6-12 months</div>
              <div className="text-sm text-gray-600">Typical RTM formation time</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary-600">95%</div>
              <div className="text-sm text-gray-600">Success rate with our tools</div>
            </div>
          </div>

          <div className="flex justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
            ))}
          </div>
          <p className="text-sm text-gray-600 italic">
            "Saved us thousands in legal fees and made the whole process straightforward"
          </p>
        </div>
      </Card>

      {/* CTA Section */}
      <Card className="bg-gray-900 text-white">
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold">
            Ready to Access Your Complete RTM Toolkit?
          </h3>
          <p className="text-gray-300">
            Sign up now to unlock all tools and continue your RTM journey with expert guidance
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={onSignup}
              rightIcon={<ArrowRight size={16} />}
            >
              Unlock Full Access
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onBack}
              leftIcon={<ArrowLeft size={16} />}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Retake Assessment
            </Button>
          </div>

          <div className="text-xs text-gray-400">
            Free 14-day trial • No credit card required • Cancel anytime
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ToolPreview;

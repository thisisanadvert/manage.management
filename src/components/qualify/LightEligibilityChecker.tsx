import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface LightEligibilityData {
  totalFlats: number;
  leaseLength: number;
  interestedLeaseholders: number;
  managementIssues: string;
}

interface LightEligibilityCheckerProps {
  onComplete: (data: LightEligibilityData, result: 'eligible' | 'maybe' | 'not-eligible') => void;
  onBack: () => void;
}

const LightEligibilityChecker: React.FC<LightEligibilityCheckerProps> = ({ onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<LightEligibilityData>({
    totalFlats: 0,
    leaseLength: 0,
    interestedLeaseholders: 0,
    managementIssues: ''
  });

  const questions = [
    {
      id: 'totalFlats',
      title: 'How many flats are in your building?',
      subtitle: 'Include all residential flats',
      icon: <Building2 className="h-6 w-6" />,
      type: 'number' as const,
      placeholder: 'e.g., 12',
      min: 1,
      max: 500,
      helpText: 'RTM requires at least 2 flats in the building'
    },
    {
      id: 'leaseLength',
      title: 'How many years are left on most leases?',
      subtitle: 'Approximate remaining lease length',
      icon: <Calendar className="h-6 w-6" />,
      type: 'number' as const,
      placeholder: 'e.g., 85',
      min: 0,
      max: 999,
      helpText: 'RTM requires at least 21 years remaining on leases'
    },
    {
      id: 'interestedLeaseholders',
      title: 'How many leaseholders are interested in RTM?',
      subtitle: 'Including yourself',
      icon: <Users className="h-6 w-6" />,
      type: 'number' as const,
      placeholder: 'e.g., 8',
      min: 1,
      max: 500,
      helpText: 'You need at least 50% of leaseholders to participate'
    },
    {
      id: 'managementIssues',
      title: 'What\'s your main reason for considering RTM?',
      subtitle: 'Select the option that best describes your situation',
      icon: <AlertTriangle className="h-6 w-6" />,
      type: 'select' as const,
      options: [
        { value: 'poor-maintenance', label: 'Poor building maintenance' },
        { value: 'high-costs', label: 'Excessive service charges' },
        { value: 'lack-communication', label: 'Lack of communication from management' },
        { value: 'slow-repairs', label: 'Slow response to repairs' },
        { value: 'want-control', label: 'Want more control over building decisions' },
        { value: 'other', label: 'Other reasons' }
      ],
      helpText: 'This helps us understand your priorities'
    }
  ];

  const currentQuestionData = questions[currentQuestion];

  const handleInputChange = (value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [currentQuestionData.id]: currentQuestionData.type === 'number' ? Number(value) : value
    }));
  };

  const isCurrentQuestionValid = () => {
    const value = formData[currentQuestionData.id as keyof LightEligibilityData];
    if (currentQuestionData.type === 'number') {
      return value > 0;
    }
    return value && value.toString().trim() !== '';
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate eligibility and complete
      const result = calculateEligibility();
      onComplete(formData, result);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      onBack();
    }
  };

  const calculateEligibility = (): 'eligible' | 'maybe' | 'not-eligible' => {
    const { totalFlats, leaseLength, interestedLeaseholders } = formData;
    
    // Basic requirements check
    if (totalFlats < 2) return 'not-eligible';
    if (leaseLength < 21) return 'not-eligible';
    
    // Calculate participation rate
    const participationRate = (interestedLeaseholders / totalFlats) * 100;
    
    if (participationRate < 50) return 'not-eligible';
    if (participationRate >= 75) return 'eligible';
    
    return 'maybe'; // 50-74% participation
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(getProgressPercentage())}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-8">
        <div className="space-y-6">
          {/* Question Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
              {currentQuestionData.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentQuestionData.title}
              </h2>
              <p className="text-gray-600 mt-2">
                {currentQuestionData.subtitle}
              </p>
            </div>
          </div>

          {/* Input Field */}
          <div className="space-y-4">
            {currentQuestionData.type === 'number' ? (
              <div>
                <input
                  type="number"
                  value={formData[currentQuestionData.id as keyof LightEligibilityData] || ''}
                  onChange={(e) => handleInputChange(e.target.value)}
                  min={currentQuestionData.min}
                  max={currentQuestionData.max}
                  placeholder={currentQuestionData.placeholder}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center"
                  autoFocus
                />
              </div>
            ) : (
              <div className="space-y-3">
                {currentQuestionData.options?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange(option.value)}
                    className={`w-full p-4 text-left border rounded-lg transition-colors ${
                      formData.managementIssues === option.value
                        ? 'border-primary-500 bg-primary-50 text-primary-900'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 {currentQuestionData.helpText}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          leftIcon={<ArrowLeft size={16} />}
        >
          {currentQuestion === 0 ? 'Back' : 'Previous'}
        </Button>

        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!isCurrentQuestionValid()}
          rightIcon={<ArrowRight size={16} />}
        >
          {currentQuestion === questions.length - 1 ? 'Get Results' : 'Next'}
        </Button>
      </div>

      {/* Question Indicators */}
      <div className="flex justify-center space-x-2">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentQuestion
                ? 'bg-primary-600'
                : index < currentQuestion
                ? 'bg-primary-300'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default LightEligibilityChecker;

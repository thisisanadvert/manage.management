import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  className = '' 
}) => {
  const requirements: PasswordRequirement[] = [
    {
      label: 'At least 8 characters',
      test: (pwd) => pwd.length >= 8,
      met: password.length >= 8
    },
    {
      label: 'Uppercase letter (A-Z)',
      test: (pwd) => /[A-Z]/.test(pwd),
      met: /[A-Z]/.test(password)
    },
    {
      label: 'Lowercase letter (a-z)',
      test: (pwd) => /[a-z]/.test(pwd),
      met: /[a-z]/.test(password)
    },
    {
      label: 'Number (0-9)',
      test: (pwd) => /\d/.test(pwd),
      met: /\d/.test(password)
    },
    {
      label: 'Special character (!@#$%^&*)',
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  ];

  const metRequirements = requirements.filter(req => req.met).length;
  const totalRequirements = requirements.length;
  const strengthPercentage = (metRequirements / totalRequirements) * 100;

  const getStrengthColor = () => {
    if (strengthPercentage < 40) return 'bg-error-500';
    if (strengthPercentage < 80) return 'bg-warning-500';
    return 'bg-success-500';
  };

  const getStrengthLabel = () => {
    if (strengthPercentage < 40) return 'Weak';
    if (strengthPercentage < 80) return 'Good';
    return 'Strong';
  };

  const getStrengthTextColor = () => {
    if (strengthPercentage < 40) return 'text-error-600';
    if (strengthPercentage < 80) return 'text-warning-600';
    return 'text-success-600';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      {password.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Password Strength</span>
            <span className={`text-sm font-medium ${getStrengthTextColor()}`}>
              {getStrengthLabel()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${strengthPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Requirements List */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h4>
        <div className="space-y-1">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center text-sm">
              <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mr-2 ${
                req.met ? 'bg-success-100' : 'bg-gray-100'
              }`}>
                {req.met ? (
                  <CheckCircle2 className="w-3 h-3 text-success-600" />
                ) : (
                  <X className="w-3 h-3 text-gray-400" />
                )}
              </div>
              <span className={req.met ? 'text-success-700' : 'text-gray-600'}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;

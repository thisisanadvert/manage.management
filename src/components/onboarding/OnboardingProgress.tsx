import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current?: boolean;
}

interface OnboardingProgressProps {
  steps: OnboardingStep[];
  currentStep: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ steps, currentStep }) => {

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = step.completed;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div key={step.id} className="flex items-start space-x-4">
              {/* Step indicator */}
              <div className="flex-shrink-0 mt-1">
                {isCompleted ? (
                  <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Circle className="w-5 h-5 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className={`text-lg font-medium ${
                  isCompleted ? 'text-success-700' :
                  isCurrent ? 'text-primary-700' :
                  'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className={`text-sm mt-1 ${
                  isCompleted ? 'text-success-600' :
                  isCurrent ? 'text-primary-600' :
                  'text-gray-400'
                }`}>
                  {step.description}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-4 mt-10 w-0.5 h-8 bg-gray-200"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress;
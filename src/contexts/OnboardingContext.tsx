import React, { createContext, useContext } from 'react';
import { useOnboarding, OnboardingStep } from '../hooks/useOnboarding';

interface OnboardingContextType {
  steps: OnboardingStep[];
  loading: boolean;
  markStepComplete: (stepName: string) => Promise<void>;
  getStepStatus: (stepName: string) => {
    completed: boolean;
    completedAt: Date | null;
  };
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const onboarding = useOnboarding();

  return (
    <OnboardingContext.Provider value={onboarding}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  return context;
};
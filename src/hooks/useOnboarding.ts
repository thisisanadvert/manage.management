import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type OnboardingStep = {
  id: string;
  name: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt: Date | null;
  requiredFeature?: string;
  route?: string;
};

// Demo onboarding steps
const demoSteps: OnboardingStep[] = [
  {
    id: 'profile',
    name: 'profile',
    title: 'Complete Your Profile',
    description: 'Add your personal information and preferences.',
    completed: true,
    completedAt: new Date(),
    route: '/profile'
  },
  {
    id: 'documents',
    name: 'documents',
    title: 'Upload Documents',
    description: 'Upload required documentation for your property.',
    completed: true,
    completedAt: new Date(),
    route: '/documents'
  },
  {
    id: 'building',
    name: 'building',
    title: 'Building Setup',
    description: 'Complete your building information and settings.',
    completed: true,
    completedAt: new Date(),
    route: '/settings'
  }
];

export const useOnboarding = () => {
  const { user } = useAuth();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadSteps = async () => {
      // For demo users, return demo steps
      if (user.email?.endsWith('@demo.com')) {
        setSteps(demoSteps);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('onboarding_steps')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setSteps(data || []);
      } catch (error) {
        console.error('Error loading onboarding steps:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSteps();
  }, [user?.id]);

  const markStepComplete = async (stepName: string) => {
    if (!user?.id) return;

    // For demo users, just update state
    if (user.email?.endsWith('@demo.com')) {
      setSteps(steps.map(step => 
        step.name === stepName 
          ? { ...step, completed: true, completedAt: new Date() }
          : step
      ));
      return;
    }

    try {
      const { error } = await supabase
        .from('onboarding_steps')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('step_name', stepName);

      if (error) throw error;

      setSteps(steps.map(step => 
        step.name === stepName 
          ? { ...step, completed: true, completedAt: new Date() }
          : step
      ));
    } catch (error) {
      console.error('Error updating step:', error);
    }
  };

  const getStepStatus = (stepName: string) => {
    const step = steps.find(s => s.name === stepName);
    return {
      completed: step?.completed || false,
      completedAt: step?.completedAt || null
    };
  };

  return {
    steps,
    loading,
    markStepComplete,
    getStepStatus
  };
};
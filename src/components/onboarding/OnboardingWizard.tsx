import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Building2, 
  User, 
  FileText, 
  Wallet, 
  Users, 
  ArrowRight, 
  ChevronRight 
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import BuildingSetupModal from '../modals/BuildingSetupModal';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  route: string;
}

const OnboardingWizard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [showBuildingSetupModal, setShowBuildingSetupModal] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  // Function to mark a step as complete
  const markStepComplete = async (stepId: string) => {
    if (!user) return;
    
    try {
      // Update the step in the database
      const { error } = await supabase
        .from('onboarding_steps')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('step_name', stepId);
        
      if (error) throw error;
      
      // Update local state
      setSteps(steps.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      ));
      setCompletedSteps(prev => prev + 1);
      
    } catch (error) {
      console.error('Error marking step as complete:', error);
    }
  };
  
  const handleStepAction = (step: OnboardingStep) => {
    if (step.id === 'building') {
      setActiveStepId(step.id);
      setShowBuildingSetupModal(true);
    } else {
      navigate(step.route);
    }
  };
  
  const handleBuildingSetupComplete = () => {
    if (activeStepId) {
      markStepComplete(activeStepId);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Define steps based on user role
    const baseSteps: OnboardingStep[] = [
      {
        id: 'profile',
        title: 'Complete Your Profile',
        description: 'Add your personal information and contact details',
        icon: User,
        completed: false,
        route: '/profile'
      },
      {
        id: 'building',
        title: 'Building Information',
        description: 'Add details about your building',
        icon: Building2,
        completed: false,
        route: `/${user.role?.split('-')[0]}/building-setup`
      },
      {
        id: 'documents',
        title: 'Upload Documents',
        description: 'Add important building documents',
        icon: FileText,
        completed: false,
        route: `/${user.role?.split('-')[0]}/documents`
      }
    ];

    // Add role-specific steps
    if (user.role === 'rtm-director' || user.role === 'sof-director') {
      baseSteps.push({
        id: 'finances',
        title: 'Financial Setup',
        description: 'Configure your financial information',
        icon: Wallet,
        completed: false,
        route: `/${user.role?.split('-')[0]}/finances`
      });
      
      baseSteps.push({
        id: 'members',
        title: 'Invite Members',
        description: 'Add other residents to your building',
        icon: Users,
        completed: false,
        route: `/${user.role?.split('-')[0]}/members`
      });
    }

    // Check which steps are completed
    const checkCompletedSteps = async () => {
      setLoading(true);
      try {
        // Check profile completion
        const profileComplete = !!(user.metadata?.firstName && user.metadata?.lastName);
        
        // Get building ID from user metadata or from building_users table
        let buildingId = user.metadata?.buildingId;
        
        if (!buildingId) {
          // Try to find the building ID from the building_users table
          const { data: buildingUserData, error: buildingUserError } = await supabase
            .from('building_users')
            .select('building_id')
            .eq('user_id', user.id)
            .single();
            
          if (!buildingUserError && buildingUserData) {
            buildingId = buildingUserData.building_id;
            
            // Update user metadata with the building ID
            await supabase.auth.updateUser({
              data: { buildingId: buildingId }
            });
          }
        }
        
        // Check building setup completion with the retrieved building ID
        let buildingComplete = false;
        if (buildingId) {
          const { data: buildingData } = await supabase
            .from('buildings')
            .select('*')
            .eq('id', buildingId)
            .single();
          
          buildingComplete = !!(buildingData?.name && buildingData?.address);
        }
        
        // Check documents
        let documentsComplete = false;
        if (buildingId) {
          const { data: documents } = await supabase
            .from('onboarding_documents')
            .select('id')
            .eq('building_id', buildingId);
          
          documentsComplete = documents && documents.length > 0;
        }
        
        // Check finances (for directors)
        let financesComplete = true;
        if (user.role === 'rtm-director' || user.role === 'sof-director') {
          if (buildingId) {
            const { data: financialSetup } = await supabase
              .from('financial_setup')
              .select('id')
              .eq('building_id', buildingId);
            
            financesComplete = financialSetup && financialSetup.length > 0;
          } else {
            financesComplete = false;
          }
        }

        // Check members (for directors)
        let membersComplete = true;
        if (user.role === 'rtm-director' || user.role === 'sof-director') {
          if (buildingId) {
            const { data: members } = await supabase
              .from('building_users')
              .select('id')
              .eq('building_id', buildingId)
              .neq('user_id', user.id);
            
            membersComplete = members && members.length > 0;
          } else {
            membersComplete = false;
          }
        }

        // Update steps with completion status
        const updatedSteps = baseSteps.map(step => {
          if (step.id === 'profile') return { ...step, completed: profileComplete };
          if (step.id === 'building') return { ...step, completed: buildingComplete };
          if (step.id === 'documents') return { ...step, completed: documentsComplete };
          if (step.id === 'finances') return { ...step, completed: financesComplete };
          if (step.id === 'members') return { ...step, completed: membersComplete };
          return step;
        });

        setSteps(updatedSteps);
        setCompletedSteps(updatedSteps.filter(step => step.completed).length);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkCompletedSteps();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const progress = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;
  const nextIncompleteStep = steps.find(step => !step.completed);

  return (
    <Card className="mb-8">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Welcome to Manage.Management</h2>
          <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
            {progress}% Complete
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-primary-600 h-2 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center p-4 rounded-lg border ${
                step.completed 
                  ? 'border-success-500 bg-success-50' 
                  : index === steps.findIndex(s => !s.completed)
                    ? 'border-primary-500 bg-primary-50 animate-border-pulse'
                    : 'border-gray-200'
              }`}
            >
              <div className={`p-2 rounded-full ${
                step.completed 
                  ? 'bg-success-100 text-success-600' 
                  : index === steps.findIndex(s => !s.completed) ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {step.completed ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
              </div>
              
              <div className="ml-4 flex-1">
                <h3 className="font-medium text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
              
              <Button
                variant={step.completed ? "outline" : "primary"}
                size="sm"
                rightIcon={step.completed ? <ChevronRight size={16} /> : <ArrowRight size={16} />}
                onClick={() => handleStepAction(step)}
              >
                {step.completed ? 'View' : 'Complete'}
              </Button>
            </div>
          ))}
        </div>
        
        {nextIncompleteStep && (
          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => handleStepAction(nextIncompleteStep)}
            >
              Continue Setup
            </Button>
          </div>
        )}
        
        {completedSteps === steps.length && (
          <div className="mt-6 bg-success-50 p-4 rounded-lg border border-success-100">
            <div className="flex items-center">
              <CheckCircle2 size={24} className="text-success-500 mr-3" />
              <div className="flex-1">
                <h3 className="font-medium text-success-700">Setup Complete!</h3>
                <p className="text-sm text-success-600">
                  You've completed all the onboarding steps. Your building is now fully set up.
                </p>
              </div>
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  // Update user metadata to mark onboarding as complete
                  supabase.auth.updateUser({
                    data: { onboardingComplete: true }
                  }).then(() => {
                    const basePath = user?.role?.split('-')[0];
                    navigate(`/${basePath}`);
                  });
                }}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <BuildingSetupModal 
        isOpen={showBuildingSetupModal}
        onClose={() => setShowBuildingSetupModal(false)}
        onSetupComplete={handleBuildingSetupComplete}
      />
    </Card>
  );
};

export default OnboardingWizard;
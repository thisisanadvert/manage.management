import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Calendar, 
  Home, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface BuildingSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: () => void;
}

interface BuildingSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: () => void;
}

const BuildingSetupModal = ({ isOpen, onClose, onSetupComplete }: BuildingSetupModalProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.metadata?.buildingName || '',
    address: user?.metadata?.buildingAddress || '',
    totalUnits: 0,
    buildingAge: 0,
    buildingType: '',
    serviceChargeFrequency: 'Quarterly',
    managementStructure: user?.role?.includes('rtm') ? 'rtm' : 'share-of-freehold'
  });

  // Fetch existing building data if available
  useEffect(() => {
    const fetchBuildingData = async () => {
      if (!user?.metadata?.buildingId) return;
      
      try {
        const { data, error } = await supabase
          .from('buildings')
          .select('*')
          .eq('id', user.metadata.buildingId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setFormData({
            name: data.name || user?.metadata?.buildingName || '',
            address: data.address || user?.metadata?.buildingAddress || '',
            totalUnits: data.total_units || 1,
            buildingAge: data.building_age || 0,
            buildingType: data.building_type || '',
            serviceChargeFrequency: data.service_charge_frequency || 'Quarterly',
            managementStructure: data.management_structure || (user?.role?.includes('rtm') ? 'rtm' : 'share-of-freehold')
          });
        }
      } catch (error) {
        console.error('Error fetching building data:', error);
      }
    };
    
    if (isOpen) {
      fetchBuildingData();
    }
  }, [isOpen, user?.metadata?.buildingId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalUnits' || name === 'buildingAge' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Get the building ID from user metadata or from building_users table
      let buildingId = user?.metadata?.buildingId;
      
      if (!buildingId && user?.id) {
        // Try to find the building ID from the building_users table
        const { data: buildingUserData, error: buildingUserError } = await supabase
          .from('building_users')
          .select('building_id')
          .eq('user_id', user?.id)
          .single();
          
        if (buildingUserError && buildingUserError.code !== 'PGRST116') {
          throw new Error('Error finding your building: ' + buildingUserError.message);
        }
        
        if (buildingUserData) {
          buildingId = buildingUserData.building_id;
          
          // Update user metadata with the building ID
          await supabase.auth.updateUser({
            data: { buildingId: buildingId }
          });
        } else {
          // If no building found, create a new one
          const { data: newBuilding, error: newBuildingError } = await supabase
            .from('buildings')
            .insert([
              {
                name: formData.name,
                address: formData.address,
                total_units: formData.totalUnits,
                building_age: formData.buildingAge,
                building_type: formData.buildingType,
                service_charge_frequency: formData.serviceChargeFrequency,
                management_structure: formData.managementStructure
              }
            ])
            .select();
            
          if (newBuildingError) throw newBuildingError;
          
          if (newBuilding && newBuilding.length > 0) {
            buildingId = newBuilding[0].id;
            
            // Create building_users entry
            const { error: buildingUserError } = await supabase
              .from('building_users')
              .insert([
                {
                  building_id: buildingId,
                  user_id: user.id,
                  role: user.role
                }
              ]);
              
            if (buildingUserError) throw buildingUserError;
            
            // Update user metadata with the building ID
            await supabase.auth.updateUser({
              data: { buildingId: buildingId }
            });
          }
        }
      }
      
      if (!buildingId) throw new Error('Could not find or create a building. Please contact support.');

      const { data, error } = await supabase
        .from('buildings')
        .update({
          name: formData.name,
          address: formData.address,
          total_units: formData.totalUnits,
          building_age: formData.buildingAge,
          building_type: formData.buildingType,
          service_charge_frequency: formData.serviceChargeFrequency,
          management_structure: formData.managementStructure
        })
        .eq('id', buildingId)
        .select();

      if (error) throw error;

      // Update onboarding steps if they exist
      const { error: stepsError } = await supabase
        .from('onboarding_steps')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('step_name', 'building');

      if (stepsError) console.error('Error updating onboarding step:', stepsError);

      setSuccess(true);
      setTimeout(() => {
        onSetupComplete();
        onClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message);
      console.error('Building setup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div className="flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900">Building Setup</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {success ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-4 rounded-full bg-success-100 p-4">
                  <CheckCircle2 className="h-8 w-8 text-success-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Setup Complete!</h3>
                <p className="text-center text-gray-600">
                  Your building information has been saved successfully.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-4 rounded-md bg-error-50 p-4 text-sm text-error-500 flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-primary-800 font-medium">Why is this information important?</h3>
                      <p className="text-primary-700 text-sm mt-1">
                        Providing accurate building information helps us customize your dashboard and provide relevant features for your specific building type.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Building Name
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building2 size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., Waterside Apartments"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        The name of your building or development
                      </p>
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Building Address
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., 123 Riverside Drive, London SE1"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Full address of the building
                      </p>
                    </div>

                    <div>
                      <label htmlFor="totalUnits" className="block text-sm font-medium text-gray-700">
                        Total Units
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Home size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id="totalUnits"
                          name="totalUnits"
                          value={formData.totalUnits}
                          onChange={handleChange}
                          min="1"
                          required
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., 24"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Total number of units in your building
                      </p>
                    </div>

                    <div>
                      <label htmlFor="buildingAge" className="block text-sm font-medium text-gray-700">
                        Building Age (years)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id="buildingAge"
                          name="buildingAge"
                          value={formData.buildingAge}
                          onChange={handleChange}
                          min="0"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., 25"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Approximate age of the building in years
                      </p>
                    </div>

                    <div>
                      <label htmlFor="buildingType" className="block text-sm font-medium text-gray-700">
                        Building Type
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building2 size={16} className="text-gray-400" />
                        </div>
                        <select
                          id="buildingType"
                          name="buildingType"
                          value={formData.buildingType}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Select Building Type</option>
                          <option value="apartment-block">Apartment Block/Flats</option>
                          <option value="converted-house">Converted House/Period Conversion</option>
                          <option value="mixed-use">Mixed Use Development</option>
                          <option value="mansion-block">Mansion Block</option>
                          <option value="townhouse">Townhouse/Terraced</option>
                          <option value="detached">Detached Building</option>
                          <option value="semi-detached">Semi-Detached Building</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Type of building structure
                      </p>
                    </div>

                    <div>
                      <label htmlFor="serviceChargeFrequency" className="block text-sm font-medium text-gray-700">
                        Service Charge Frequency
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={16} className="text-gray-400" />
                        </div>
                        <select
                          id="serviceChargeFrequency"
                          name="serviceChargeFrequency"
                          value={formData.serviceChargeFrequency}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly (Most Common)</option>
                          <option value="Bi-Annually">Bi-Annually</option>
                          <option value="Annually">Annually</option>
                        </select>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        How often service charges are collected
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                  >
                    Save Building Information
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingSetupModal;
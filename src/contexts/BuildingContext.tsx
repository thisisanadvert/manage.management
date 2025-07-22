import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface Building {
  id: string;
  name: string;
  address: string;
  total_units?: number;
  building_type?: string;
  management_structure?: string;
}

interface BuildingContextType {
  // Building data
  buildings: Building[];
  selectedBuildingId: string | null;
  selectedBuilding: Building | null;
  
  // Loading states
  isLoadingBuildings: boolean;
  
  // Actions
  setSelectedBuildingId: (buildingId: string | null) => void;
  refreshBuildings: () => Promise<void>;
  
  // Helper functions
  getBuildingById: (buildingId: string) => Building | undefined;
  isManagementCompany: boolean;
}

const BuildingContext = createContext<BuildingContextType | undefined>(undefined);

export function BuildingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(false);

  const isManagementCompany = user?.role === 'management-company';

  // Get selected building object
  const selectedBuilding = selectedBuildingId 
    ? buildings.find(b => b.id === selectedBuildingId) || null 
    : null;

  // Fetch buildings for management companies
  const fetchBuildings = async () => {
    console.log('🏢 BuildingContext: fetchBuildings called', {
      isManagementCompany,
      userId: user?.id,
      userEmail: user?.email
    });

    if (!isManagementCompany || !user?.id) {
      console.log('🏢 BuildingContext: Early return - not management company or no user ID');
      setBuildings([]);
      return;
    }

    setIsLoadingBuildings(true);
    try {
      console.log('🏢 BuildingContext: Fetching buildings for user:', {
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        isManagementCompany
      });

      // Skip auth.users check as it might have RLS issues
      console.log('🏢 BuildingContext: Current user details:', {
        id: user.id,
        email: user.email,
        role: user.role
      });

      // First, let's test if we can query buildings at all
      const { data: allBuildings, error: allBuildingsError } = await supabase
        .from('buildings')
        .select('id, name')
        .limit(5);

      console.log('🏢 BuildingContext: All buildings test:', { allBuildings, allBuildingsError });

      // Check all building_users for this user (any role)
      const { data: allBuildingUsers, error: allBuildingUsersError } = await supabase
        .from('building_users')
        .select('building_id, role, user_id')
        .eq('user_id', user.id);

      console.log('🏢 BuildingContext: All building users for this user:', { allBuildingUsers, allBuildingUsersError });

      // Get buildings where the user is a management company
      const { data: buildingUsers, error: buildingUsersError } = await supabase
        .from('building_users')
        .select('building_id')
        .eq('user_id', user.id)
        .eq('role', 'management-company');

      console.log('🏢 BuildingContext: Management company building users:', { buildingUsers, buildingUsersError });

      if (buildingUsersError) {
        console.error('Error fetching building users:', buildingUsersError);
        return;
      }

      if (buildingUsers && buildingUsers.length > 0) {
        const buildingIds = buildingUsers.map(bu => bu.building_id);
        console.log('🏢 BuildingContext: Building IDs to fetch:', buildingIds);

        const { data: buildingsData, error: buildingsError } = await supabase
          .from('buildings')
          .select('id, name, address, total_units, building_type, management_structure')
          .in('id', buildingIds)
          .order('name');

        console.log('🏢 BuildingContext: Buildings data result:', { buildingsData, buildingsError });

        if (buildingsError) {
          console.error('🏢 BuildingContext: Error fetching buildings:', {
            error: buildingsError,
            message: buildingsError.message,
            details: buildingsError.details,
            hint: buildingsError.hint,
            code: buildingsError.code
          });
          return;
        }

        setBuildings(buildingsData || []);

        // Auto-select first building if none selected and buildings exist
        if (buildingsData && buildingsData.length > 0 && !selectedBuildingId) {
          setSelectedBuildingId(buildingsData[0].id);
          console.log('🏢 BuildingContext: Auto-selected first building:', buildingsData[0].id);
        }
      } else {
        console.log('🏢 BuildingContext: No buildings found for management company');
        setBuildings([]);
      }
    } catch (error) {
      console.error('🏢 BuildingContext: Error fetching buildings:', error);
    } finally {
      setIsLoadingBuildings(false);
    }
  };

  // Fetch buildings when user changes or component mounts
  useEffect(() => {
    console.log('🏢 BuildingContext: useEffect triggered', {
      isManagementCompany,
      userId: user?.id,
      userRole: user?.role
    });

    if (isManagementCompany) {
      fetchBuildings();
    } else {
      // For non-management users, clear buildings and use their default building
      console.log('🏢 BuildingContext: Non-management user, setting default building');
      setBuildings([]);
      setSelectedBuildingId(user?.metadata?.buildingId || null);
    }
  }, [user?.id, user?.role, isManagementCompany]);

  // Helper function to get building by ID
  const getBuildingById = (buildingId: string): Building | undefined => {
    return buildings.find(b => b.id === buildingId);
  };

  // Refresh buildings function
  const refreshBuildings = async () => {
    await fetchBuildings();
  };

  const contextValue: BuildingContextType = {
    buildings,
    selectedBuildingId,
    selectedBuilding,
    isLoadingBuildings,
    setSelectedBuildingId,
    refreshBuildings,
    getBuildingById,
    isManagementCompany
  };

  return (
    <BuildingContext.Provider value={contextValue}>
      {children}
    </BuildingContext.Provider>
  );
}

export function useBuilding() {
  const context = useContext(BuildingContext);
  if (context === undefined) {
    throw new Error('useBuilding must be used within a BuildingProvider');
  }
  return context;
}

// Helper hook to get the effective building ID for any user type
export function useEffectiveBuildingId(): string | null {
  const { user } = useAuth();
  const { selectedBuildingId, isManagementCompany } = useBuilding();

  if (isManagementCompany) {
    return selectedBuildingId;
  } else {
    return user?.metadata?.buildingId || null;
  }
}

import { supabase } from '../lib/supabase';

export interface BuildingAssociation {
  buildingId: string;
  isNewBuilding: boolean;
}

/**
 * Ensures a user has a valid building association
 * This function will:
 * 1. Check if the user has a building ID in metadata
 * 2. If not, check the building_users table
 * 3. If still not found, create a new building
 * 4. Update user metadata with the building ID
 */
export async function ensureBuildingAssociation(
  user: any
): Promise<BuildingAssociation | null> {
  if (!user?.id) {
    console.error('No user provided to ensureBuildingAssociation');
    return null;
  }

  try {
    let buildingId = user?.metadata?.buildingId;
    let isNewBuilding = false;

    console.log('Ensuring building association for user:', user.id);
    console.log('Initial building ID from metadata:', buildingId);

    // Step 1: Check if we have a building ID in metadata
    if (buildingId) {
      // Verify the building actually exists
      const { data: buildingExists, error: buildingCheckError } = await supabase
        .from('buildings')
        .select('id')
        .eq('id', buildingId)
        .single();

      if (!buildingCheckError && buildingExists) {
        console.log('Building exists in database:', buildingId);
        return { buildingId, isNewBuilding: false };
      } else {
        console.log('Building ID in metadata does not exist in database, clearing it');
        buildingId = undefined;
      }
    }

    // Step 2: Check building_users table
    if (!buildingId) {
      console.log('Checking building_users table for user association...');
      const { data: buildingUserData, error: buildingUserError } = await supabase
        .from('building_users')
        .select('building_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (buildingUserError) {
        console.error('Error fetching building from building_users:', buildingUserError);
        // If it's a recursion error, skip this step
        if (!buildingUserError.message?.includes('infinite recursion')) {
          throw buildingUserError;
        }
      } else if (buildingUserData) {
        buildingId = buildingUserData.building_id;
        console.log('Found building ID from building_users:', buildingId);

        // Verify this building exists
        const { data: buildingExists, error: buildingCheckError } = await supabase
          .from('buildings')
          .select('id')
          .eq('id', buildingId)
          .single();

        if (buildingCheckError || !buildingExists) {
          console.log('Building from building_users does not exist, will create new one');
          buildingId = undefined;
        }
      }
    }

    // Step 3: Create a new building if none found
    if (!buildingId) {
      console.log('No valid building found, creating new building...');
      
      const managementStructure = user?.role?.includes('rtm') 
        ? 'rtm' 
        : user?.role?.includes('sof') 
        ? 'share-of-freehold' 
        : 'landlord-managed';

      const { data: newBuilding, error: newBuildingError } = await supabase
        .from('buildings')
        .insert({
          name: user?.metadata?.buildingName || 'My Building',
          address: user?.metadata?.buildingAddress || 'Address not set',
          total_units: 1,
          management_structure: managementStructure,
          created_by: user.id
        })
        .select()
        .single();

      if (newBuildingError) {
        console.error('Error creating building:', newBuildingError);
        throw new Error('Failed to create building: ' + newBuildingError.message);
      }

      buildingId = newBuilding.id;
      isNewBuilding = true;
      console.log('Created new building with ID:', buildingId);

      // Create building_users entry
      const { error: buildingUserError } = await supabase
        .from('building_users')
        .insert({
          building_id: buildingId,
          user_id: user.id,
          role: user.role
        });

      if (buildingUserError) {
        console.error('Error creating building_users entry:', buildingUserError);
        // Don't throw here as the building was created successfully
      }
    }

    // Step 4: Update user metadata with the building ID
    if (buildingId && buildingId !== user?.metadata?.buildingId) {
      console.log('Updating user metadata with building ID:', buildingId);
      await supabase.auth.updateUser({
        data: {
          ...user?.metadata,
          buildingId
        }
      });
    }

    return { buildingId, isNewBuilding };
  } catch (error) {
    console.error('Error in ensureBuildingAssociation:', error);
    return null;
  }
}

/**
 * Validates that a building ID exists in the database
 */
export async function validateBuildingExists(buildingId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('buildings')
      .select('id')
      .eq('id', buildingId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error validating building exists:', error);
    return false;
  }
}

/**
 * Gets the user's building ID, ensuring it's valid
 */
export async function getUserBuildingId(user: any): Promise<string | null> {
  const association = await ensureBuildingAssociation(user);
  return association?.buildingId || null;
}

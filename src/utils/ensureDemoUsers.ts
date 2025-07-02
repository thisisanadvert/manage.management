/**
 * Utility to ensure demo users exist for impersonation testing
 */

import { supabase } from '../lib/supabase';

export interface DemoUser {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  password: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    email: 'rtm@demo.com',
    role: 'rtm-director',
    firstName: 'Robert',
    lastName: 'Thompson',
    password: 'demo123'
  },
  {
    email: 'rmc@demo.com',
    role: 'rmc-director',
    firstName: 'Rachel',
    lastName: 'Mitchell',
    password: 'demo123'
  },
  {
    email: 'leaseholder@demo.com',
    role: 'leaseholder',
    firstName: 'Lisa',
    lastName: 'Parker',
    password: 'demo123'
  },
  {
    email: 'shareholder@demo.com',
    role: 'shareholder',
    firstName: 'Sam',
    lastName: 'Foster',
    password: 'demo123'
  },
  {
    email: 'management@demo.com',
    role: 'management-company',
    firstName: 'Mark',
    lastName: 'Anderson',
    password: 'demo123'
  }
];

/**
 * Check if demo users exist and create them if they don't
 */
export const ensureDemoUsersExist = async (): Promise<{
  success: boolean;
  message: string;
  usersCreated: number;
  usersFound: number;
}> => {
  try {
    console.log('🔍 Checking for demo users...');
    
    // Check which demo users already exist
    const { data: existingUsers, error: checkError } = await supabase
      .from('auth.users')
      .select('email, id, raw_user_meta_data')
      .in('email', DEMO_USERS.map(u => u.email));

    if (checkError) {
      console.error('Error checking existing users:', checkError);
      return {
        success: false,
        message: `Failed to check existing users: ${checkError.message}`,
        usersCreated: 0,
        usersFound: 0
      };
    }

    const existingEmails = existingUsers?.map(u => u.email) || [];
    const missingUsers = DEMO_USERS.filter(u => !existingEmails.includes(u.email));
    
    console.log(`📊 Found ${existingEmails.length} existing demo users`);
    console.log(`📊 Missing ${missingUsers.length} demo users`);

    if (missingUsers.length === 0) {
      return {
        success: true,
        message: 'All demo users already exist',
        usersCreated: 0,
        usersFound: existingEmails.length
      };
    }

    // Create missing demo users
    let usersCreated = 0;
    for (const user of missingUsers) {
      try {
        console.log(`👤 Creating demo user: ${user.email}`);
        
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              isDemo: true,
              onboardingComplete: true
            }
          }
        });

        if (signupError) {
          console.error(`❌ Failed to create ${user.email}:`, signupError);
          continue;
        }

        if (signupData.user) {
          console.log(`✅ Created demo user: ${user.email}`);
          usersCreated++;
          
          // Try to link to demo building if it exists
          await linkUserToBuilding(signupData.user.id, user.role);
        }
      } catch (error) {
        console.error(`❌ Error creating ${user.email}:`, error);
      }
    }

    return {
      success: true,
      message: `Created ${usersCreated} demo users, found ${existingEmails.length} existing`,
      usersCreated,
      usersFound: existingEmails.length
    };

  } catch (error) {
    console.error('❌ Error ensuring demo users exist:', error);
    return {
      success: false,
      message: `Failed to ensure demo users: ${error}`,
      usersCreated: 0,
      usersFound: 0
    };
  }
};

/**
 * Link a user to the demo building
 */
const linkUserToBuilding = async (userId: string, role: string): Promise<void> => {
  try {
    // Check if demo building exists
    const { data: demoBuilding } = await supabase
      .from('buildings')
      .select('id')
      .eq('name', 'Central Park')
      .single();

    if (!demoBuilding) {
      console.log('⚠️ Demo building not found, skipping building link');
      return;
    }

    // Link user to building
    const { error: linkError } = await supabase
      .from('building_users')
      .insert({
        building_id: demoBuilding.id,
        user_id: userId,
        role: role
      });

    if (linkError) {
      console.error('❌ Failed to link user to building:', linkError);
    } else {
      console.log(`✅ Linked user to demo building`);
    }
  } catch (error) {
    console.error('❌ Error linking user to building:', error);
  }
};

/**
 * Get demo user credentials for testing
 */
export const getDemoUserCredentials = (): Array<{ email: string; password: string; role: string }> => {
  return DEMO_USERS.map(user => ({
    email: user.email,
    password: user.password,
    role: user.role
  }));
};

/**
 * Test function to verify demo users can be found by impersonation search
 */
export const testDemoUserSearch = async (): Promise<{
  success: boolean;
  message: string;
  usersFound: number;
}> => {
  try {
    console.log('🔍 Testing demo user search...');
    
    // Try to search for demo users
    const { data: searchResults, error: searchError } = await supabase
      .from('auth.users')
      .select(`
        id,
        email,
        raw_user_meta_data,
        building_users(
          building_id,
          buildings(name)
        )
      `)
      .in('email', DEMO_USERS.map(u => u.email));

    if (searchError) {
      return {
        success: false,
        message: `Search failed: ${searchError.message}`,
        usersFound: 0
      };
    }

    const foundUsers = searchResults?.length || 0;
    console.log(`📊 Found ${foundUsers} demo users in search`);
    
    if (foundUsers > 0) {
      console.log('👥 Demo users found:', searchResults?.map(u => u.email));
    }

    return {
      success: true,
      message: `Found ${foundUsers} demo users`,
      usersFound: foundUsers
    };

  } catch (error) {
    return {
      success: false,
      message: `Test failed: ${error}`,
      usersFound: 0
    };
  }
};

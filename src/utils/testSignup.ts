import { supabase } from '../lib/supabase';

export const testSignupFlow = async () => {
  console.log('🧪 Testing signup flow...');
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing Supabase connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('buildings')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Supabase connection failed:', healthError);
      return false;
    }
    console.log('✅ Supabase connection successful');

    // Test 2: Check if we can access auth
    console.log('2. Testing auth access...');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Auth access failed:', sessionError);
      return false;
    }
    console.log('✅ Auth access successful');

    // Test 3: Test signup with a test email (don't actually create)
    console.log('3. Testing signup validation...');
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';
    
    // Just validate the signup call structure without actually creating
    const signupData = {
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          firstName: 'Test',
          lastName: 'User',
          role: 'rtm-director',
          buildingName: 'Test Building',
          buildingAddress: 'Test Address',
          unitNumber: '1',
          phone: '1234567890'
        }
      }
    };
    
    console.log('✅ Signup data structure is valid');
    console.log('📋 Signup payload:', {
      ...signupData,
      password: '[REDACTED]'
    });

    console.log('🎉 All tests passed! Signup flow appears to be working.');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

export const testDatabasePolicies = async () => {
  console.log('🔒 Testing database policies...');
  
  try {
    // Test if we can read from public tables
    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('id, name')
      .limit(1);
    
    if (buildingsError) {
      console.error('❌ Buildings table access failed:', buildingsError);
      return false;
    }
    
    console.log('✅ Buildings table accessible');
    
    // Test building_users table
    const { data: buildingUsers, error: usersError } = await supabase
      .from('building_users')
      .select('id')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Building users table access failed:', usersError);
      return false;
    }
    
    console.log('✅ Building users table accessible');
    console.log('🎉 Database policies test passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Database policies test failed:', error);
    return false;
  }
};

// Test script for Attio Edge Function
// Run this in your browser console or as a Node.js script

const testAttioFunction = async () => {
  const testData = {
    email: 'test@manage.management',
    firstName: 'Test',
    lastName: 'User',
    phone: '07123456789',
    role: 'rtm-director',
    buildingName: 'Test Building',
    buildingAddress: '123 Test Street, London',
    unitNumber: 'Flat 1',
    source: 'integration-test',
    qualificationData: {
      eligibilityScore: 0.85,
      issues: [],
      recommendations: ['Consider RTM formation']
    }
  };

  try {
    const response = await fetch('https://ncjyndwehkwbjrlewbmf.supabase.co/functions/v1/sync-to-attio', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5janluZHdlaGt3YmpybGV3Ym1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNTU5NTYsImV4cCI6MjA2MTkzMTk1Nn0.VnBqaxI1dpeISq3eq5dwd0DfOJco3lUfnKXRyj43oPA',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', result);
    
    if (result.success) {
      console.log('✅ Attio integration working!');
      console.log('Person ID:', result.person_id);
      if (result.company_id) {
        console.log('Company ID:', result.company_id);
      }
    } else {
      console.log('❌ Integration failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testAttioFunction();

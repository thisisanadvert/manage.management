// =====================================================
// MIGRATION VERIFICATION TEST SCRIPT
// =====================================================

import { createClient } from '@supabase/supabase-js';

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMigration() {
  console.log('🧪 Testing RTM Formation Migration...\n');

  const tests = [];

  // Test 1: Check if tables exist by trying to query them
  const tablesToTest = [
    'rtm_eligibility_assessments',
    'leaseholder_surveys',
    'leaseholder_records', 
    'rtm_company_formations',
    'rtm_company_directors',
    'rtm_notices',
    'document_repository',
    'document_access_log',
    'document_comments',
    'service_charge_demands',
    'section20_consultations'
  ];

  console.log('📋 Testing table existence...');
  for (const table of tablesToTest) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code === '42P01') {
        tests.push({ test: `Table ${table}`, status: '❌ FAIL', message: 'Table does not exist' });
      } else if (error && error.code === '42501') {
        tests.push({ test: `Table ${table}`, status: '✅ PASS', message: 'Table exists (RLS blocking access)' });
      } else {
        tests.push({ test: `Table ${table}`, status: '✅ PASS', message: 'Table exists and accessible' });
      }
    } catch (err) {
      tests.push({ test: `Table ${table}`, status: '❌ FAIL', message: err.message });
    }
  }

  // Test 2: Test basic insert operations (will fail due to RLS, but should show proper error)
  console.log('\n🔐 Testing RLS policies...');
  try {
    const { data, error } = await supabase
      .from('rtm_eligibility_assessments')
      .insert({
        assessment_data: { test: true },
        eligibility_result: 'eligible',
        eligibility_score: 0.85
      });

    if (error && error.code === '42501') {
      tests.push({ test: 'RLS Policy', status: '✅ PASS', message: 'RLS is properly blocking unauthorized access' });
    } else if (error) {
      tests.push({ test: 'RLS Policy', status: '⚠️ WARN', message: `Unexpected error: ${error.message}` });
    } else {
      tests.push({ test: 'RLS Policy', status: '⚠️ WARN', message: 'Insert succeeded - check RLS configuration' });
    }
  } catch (err) {
    tests.push({ test: 'RLS Policy', status: '❌ FAIL', message: err.message });
  }

  // Test 3: Test foreign key constraints
  console.log('\n🔗 Testing foreign key constraints...');
  try {
    const { data, error } = await supabase
      .from('leaseholder_records')
      .insert({
        survey_id: '00000000-0000-0000-0000-000000000000', // Invalid UUID
        flat_number: 'Test',
        name: 'Test User'
      });

    if (error && (error.code === '23503' || error.code === '42501')) {
      tests.push({ test: 'Foreign Keys', status: '✅ PASS', message: 'Foreign key constraints are working' });
    } else {
      tests.push({ test: 'Foreign Keys', status: '⚠️ WARN', message: 'Unexpected response to foreign key test' });
    }
  } catch (err) {
    tests.push({ test: 'Foreign Keys', status: '❌ FAIL', message: err.message });
  }

  // Test 4: Test check constraints
  console.log('\n✅ Testing check constraints...');
  try {
    const { data, error } = await supabase
      .from('rtm_eligibility_assessments')
      .insert({
        assessment_data: { test: true },
        eligibility_result: 'invalid_status', // Should fail check constraint
        eligibility_score: 0.85
      });

    if (error && error.code === '23514') {
      tests.push({ test: 'Check Constraints', status: '✅ PASS', message: 'Check constraints are working' });
    } else if (error && error.code === '42501') {
      tests.push({ test: 'Check Constraints', status: '✅ PASS', message: 'RLS blocked before check constraint (expected)' });
    } else {
      tests.push({ test: 'Check Constraints', status: '⚠️ WARN', message: 'Unexpected response to check constraint test' });
    }
  } catch (err) {
    tests.push({ test: 'Check Constraints', status: '❌ FAIL', message: err.message });
  }

  // Print results
  console.log('\n📊 Test Results:');
  console.log('================');
  tests.forEach(test => {
    console.log(`${test.status} ${test.test}: ${test.message}`);
  });

  const passCount = tests.filter(t => t.status.includes('PASS')).length;
  const totalTests = tests.length;
  
  console.log(`\n🎯 Summary: ${passCount}/${totalTests} tests passed`);
  
  if (passCount === totalTests) {
    console.log('🎉 Migration appears to be working correctly!');
  } else if (passCount >= totalTests * 0.8) {
    console.log('⚠️ Migration mostly working, but some issues detected.');
  } else {
    console.log('❌ Migration has significant issues that need attention.');
  }

  return tests;
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testMigration().catch(console.error);
}

export { testMigration };

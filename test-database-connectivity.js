/**
 * Database Connectivity Test
 * Tests the current state of database tables and data storage
 */

import { createClient } from '@supabase/supabase-js';

// Note: In production, these would come from environment variables
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test tables for each section
const testTables = {
  finances: [
    'transactions',
    'service_charge_payments', 
    'reserve_fund_transactions',
    'major_works_projects',
    'budget_items',
    'budget_periods'
  ],
  documents: [
    'document_repository',
    'document_access_log',
    'document_comments',
    'onboarding_documents'
  ],
  voting: [
    'polls',
    'poll_options',
    'poll_votes',
    'poll_attachments',
    'poll_comments'
  ],
  rtm_formation: [
    'rtm_eligibility_assessments',
    'leaseholder_surveys',
    'leaseholder_records',
    'rtm_company_formations',
    'rtm_company_directors',
    'rtm_notices'
  ]
};

async function testTableExists(tableName) {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      return { exists: false, error: error.message };
    }

    return { 
      exists: true, 
      recordCount: count || 0,
      hasData: (count || 0) > 0
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

async function testSection(sectionName, tables) {
  console.log(`\n🔍 Testing ${sectionName.toUpperCase()} section:`);
  
  const results = [];
  let connectedTables = 0;
  let totalRecords = 0;

  for (const tableName of tables) {
    const result = await testTableExists(tableName);
    results.push({ tableName, ...result });
    
    if (result.exists) {
      connectedTables++;
      totalRecords += result.recordCount || 0;
      console.log(`  ✅ ${tableName} - ${result.recordCount} records`);
    } else {
      console.log(`  ❌ ${tableName} - MISSING (${result.error})`);
    }
  }

  const status = connectedTables === tables.length ? 'CONNECTED' : 
                 connectedTables > 0 ? 'PARTIALLY CONNECTED' : 'MISSING';

  console.log(`  📊 Status: ${status} (${connectedTables}/${tables.length} tables, ${totalRecords} total records)`);

  return {
    section: sectionName,
    status,
    connectedTables,
    totalTables: tables.length,
    totalRecords,
    results
  };
}

async function runDatabaseConnectivityTest() {
  console.log('🚀 Starting Database Connectivity Test...');
  console.log('=====================================');

  const sectionResults = [];

  // Test each section
  for (const [sectionName, tables] of Object.entries(testTables)) {
    const result = await testSection(sectionName, tables);
    sectionResults.push(result);
  }

  // Generate summary
  console.log('\n📋 SUMMARY REPORT:');
  console.log('==================');

  let totalTables = 0;
  let totalConnected = 0;
  let totalRecords = 0;

  sectionResults.forEach(section => {
    totalTables += section.totalTables;
    totalConnected += section.connectedTables;
    totalRecords += section.totalRecords;
    
    const statusIcon = section.status === 'CONNECTED' ? '✅' : 
                      section.status === 'PARTIALLY CONNECTED' ? '⚠️' : '❌';
    
    console.log(`${statusIcon} ${section.section.toUpperCase()}: ${section.status}`);
  });

  console.log(`\n📊 Overall: ${totalConnected}/${totalTables} tables connected, ${totalRecords} total records`);

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('===================');

  const criticalSections = sectionResults.filter(s => s.status === 'MISSING');
  const partialSections = sectionResults.filter(s => s.status === 'PARTIALLY CONNECTED');

  if (criticalSections.length > 0) {
    console.log('🔴 CRITICAL: Run the database migration immediately:');
    console.log('   supabase/migrations/20250716000002_complete_data_storage_system.sql');
    console.log('');
    criticalSections.forEach(section => {
      console.log(`   - ${section.section.toUpperCase()} section has no database tables`);
    });
  }

  if (partialSections.length > 0) {
    console.log('🟡 WARNING: Some sections need enhancement:');
    partialSections.forEach(section => {
      console.log(`   - ${section.section.toUpperCase()} section is partially connected`);
    });
  }

  if (totalConnected === totalTables) {
    console.log('🟢 EXCELLENT: All sections are properly connected to the database!');
  }

  console.log('\n🔧 NEXT STEPS:');
  console.log('==============');
  console.log('1. Run the migration: supabase db push');
  console.log('2. Update components to use new data services');
  console.log('3. Test data operations in each section');
  console.log('4. Migrate any existing form persistence data');

  return sectionResults;
}

// Export for use in other files
export { runDatabaseConnectivityTest, testTableExists };

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDatabaseConnectivityTest()
    .then(() => {
      console.log('\n✅ Database connectivity test completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Database connectivity test failed:', error);
      process.exit(1);
    });
}

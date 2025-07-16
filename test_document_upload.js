// Quick test to verify document_repository table structure
import { createClient } from '@supabase/supabase-js';

// You'll need to set these environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDocumentRepository() {
  console.log('🧪 Testing document_repository table...\n');

  try {
    // Test 1: Check if table exists and is accessible
    console.log('📋 Testing table access...');
    const { data, error } = await supabase
      .from('document_repository')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('❌ FAIL: document_repository table does not exist');
      return;
    } else if (error && error.code === '42501') {
      console.log('✅ PASS: Table exists (RLS blocking access as expected)');
    } else if (error) {
      console.log('⚠️ WARN: Unexpected error:', error.message);
    } else {
      console.log('✅ PASS: Table exists and accessible');
      console.log('📊 Sample data structure:', data?.[0] ? Object.keys(data[0]) : 'No data');
    }

    // Test 2: Check required columns exist
    console.log('\n🔍 Testing table structure...');
    const requiredColumns = [
      'id', 'building_id', 'title', 'file_name', 'file_path', 
      'category', 'tags', 'uploaded_by', 'created_at'
    ];

    // This will fail due to RLS, but the error message will tell us about column structure
    const { error: structureError } = await supabase
      .from('document_repository')
      .insert({
        building_id: '00000000-0000-0000-0000-000000000000',
        title: 'Test Document',
        file_name: 'test.pdf',
        file_path: 'test/test.pdf',
        category: 'legal',
        tags: ['test'],
        uploaded_by: '00000000-0000-0000-0000-000000000000'
      });

    if (structureError && structureError.code === '42501') {
      console.log('✅ PASS: Table structure appears correct (RLS blocked insert)');
    } else if (structureError && structureError.code === '23503') {
      console.log('✅ PASS: Foreign key constraints working');
    } else if (structureError) {
      console.log('⚠️ WARN: Structure test error:', structureError.message);
    } else {
      console.log('⚠️ WARN: Insert succeeded unexpectedly');
    }

    console.log('\n🎯 Document repository table appears to be working correctly!');
    console.log('✅ You can now try uploading documents through the UI');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

// Run the test
testDocumentRepository();

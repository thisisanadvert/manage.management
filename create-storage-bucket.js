#!/usr/bin/env node

/**
 * Script to create the 'documents' storage bucket in Supabase
 * Run this with: node create-storage-bucket.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read environment variables from .env file
let supabaseUrl, supabaseServiceKey;
try {
  const envFile = readFileSync('.env', 'utf8');
  const envVars = {};
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim().replace(/['"]/g, '');
    }
  });

  supabaseUrl = envVars.VITE_SUPABASE_URL;
  supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
} catch (error) {
  console.error('❌ Could not read .env file:', error.message);
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY:', supabaseServiceKey ? '✅' : '❌');
  console.error('\nPlease check your .env file or environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDocumentsBucket() {
  console.log('🚀 Creating documents storage bucket...\n');

  try {
    // First, check if bucket already exists
    console.log('🔍 Checking if documents bucket exists...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }

    const existingBucket = buckets?.find(bucket => bucket.id === 'documents');
    
    if (existingBucket) {
      console.log('✅ Documents bucket already exists!');
      console.log('📊 Bucket details:', {
        id: existingBucket.id,
        name: existingBucket.name,
        public: existingBucket.public,
        created_at: existingBucket.created_at
      });
      return;
    }

    // Create the bucket
    console.log('📦 Creating documents bucket...');
    const { data, error } = await supabase.storage.createBucket('documents', {
      public: false,
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'text/csv'
      ],
      fileSizeLimit: 52428800 // 50MB
    });

    if (error) {
      console.error('❌ Error creating bucket:', error.message);
      
      // If it's a permission error, suggest manual creation
      if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        console.log('\n💡 Manual Creation Required:');
        console.log('   1. Go to your Supabase dashboard');
        console.log('   2. Navigate to Storage');
        console.log('   3. Click "Create bucket"');
        console.log('   4. Name it "documents"');
        console.log('   5. Set it to Private (not public)');
        console.log('   6. Save the bucket');
      }
      return;
    }

    console.log('✅ Documents bucket created successfully!');
    console.log('📊 Bucket data:', data);

    // Test upload permissions
    console.log('\n🧪 Testing bucket access...');
    const testFile = new Blob(['test content'], { type: 'text/plain' });
    const testPath = 'test/test-file.txt';
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(testPath, testFile);

    if (uploadError) {
      console.log('⚠️ Upload test failed (this might be due to RLS policies):', uploadError.message);
      console.log('   This is normal if RLS policies are in place.');
    } else {
      console.log('✅ Upload test successful!');
      
      // Clean up test file
      await supabase.storage.from('documents').remove([testPath]);
      console.log('🧹 Test file cleaned up');
    }

    console.log('\n🎉 Setup complete! You can now upload documents through the UI.');

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

// Run the script
createDocumentsBucket();

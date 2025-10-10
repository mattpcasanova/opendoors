#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 OpenDoors Environment Setup');
console.log('================================');

const envPath = path.join(process.cwd(), '.env');

// Check if .env file exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for required variables
  const hasSupabaseUrl = envContent.includes('EXPO_PUBLIC_SUPABASE_URL=');
  const hasSupabaseKey = envContent.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY=');
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('✅ Supabase environment variables are set');
  } else {
    console.log('❌ Missing Supabase environment variables');
    console.log('Please add the following to your .env file:');
    console.log('');
    console.log('EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here');
    console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here');
  }
} else {
  console.log('❌ .env file not found');
  console.log('Creating .env template...');
  
  const envTemplate = `# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Example:
# EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env template file');
  console.log('Please edit .env with your actual Supabase credentials');
}

console.log('');
console.log('📋 Next steps:');
console.log('1. Make sure your .env file has the correct Supabase credentials');
console.log('2. Restart your development server: npx expo start --clear');
console.log('3. If you still get network errors, check your Supabase project status');

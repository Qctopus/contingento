#!/usr/bin/env node

/**
 * Environment Setup Troubleshooter
 * Run this if you're getting "DATABASE_URL not found" errors
 * 
 * Usage: node scripts/fix-env-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Environment Setup Troubleshooter\n');
console.log('=' .repeat(60));

// Check 1: Is there an .env file?
const envFiles = ['.env.local', '.env', '.env.development.local', '.env.development'];
let foundEnvFile = null;

console.log('\n📁 Checking for environment files...\n');

envFiles.forEach(fileName => {
  const filePath = path.join(process.cwd(), fileName);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ Found: ${fileName}`);
    foundEnvFile = fileName;
  } else {
    console.log(`  ❌ Missing: ${fileName}`);
  }
});

if (!foundEnvFile) {
  console.log('\n❌ NO ENVIRONMENT FILE FOUND!\n');
  console.log('📝 Quick Fix:\n');
  console.log('  1. Copy the example file:');
  console.log('     Windows PowerShell:  Copy-Item env.example .env.local');
  console.log('     Mac/Linux:           cp env.example .env.local\n');
  console.log('  2. Edit .env.local with your actual database URL');
  console.log('  3. Get a free database from: https://neon.tech\n');
  console.log('  4. Restart your dev server: npm run dev\n');
  process.exit(1);
}

// Check 2: Does it have DATABASE_URL?
console.log(`\n📄 Reading ${foundEnvFile}...\n`);
const envContent = fs.readFileSync(path.join(process.cwd(), foundEnvFile), 'utf8');
const hasDbUrl = envContent.includes('DATABASE_URL');

if (!hasDbUrl) {
  console.log('❌ DATABASE_URL not found in your .env file!\n');
  console.log('📝 Add this line to your .env file:\n');
  console.log('DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"\n');
  process.exit(1);
} else {
  console.log('  ✅ DATABASE_URL is present');
}

// Check 3: Is it commented out?
const lines = envContent.split('\n');
const dbUrlLine = lines.find(line => line.trim().startsWith('DATABASE_URL'));

if (dbUrlLine && dbUrlLine.trim().startsWith('#')) {
  console.log('  ⚠️  WARNING: DATABASE_URL is commented out (starts with #)');
  console.log('     Remove the # at the beginning of the line\n');
}

// Check 4: Is it the example value?
if (envContent.includes('your_postgresql_connection_string') || 
    envContent.includes('user:password@localhost')) {
  console.log('  ⚠️  WARNING: You\'re still using the example DATABASE_URL\n');
  console.log('     You need to replace it with your actual database connection string\n');
  console.log('  🆓 Get a free PostgreSQL database:\n');
  console.log('     • Neon (easiest):    https://neon.tech');
  console.log('     • Supabase:          https://supabase.com');
  console.log('     • Railway:           https://railway.app\n');
}

// Check 5: Runtime environment check
console.log('\n🔍 Checking if Node.js can see DATABASE_URL...\n');

if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  console.log('  ✅ DATABASE_URL is loaded in Node.js environment');
  console.log(`  ℹ️  Starts with: ${dbUrl.substring(0, 20)}...`);
  
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    console.log('  ✅ Format looks correct (PostgreSQL)\n');
  } else {
    console.log('  ❌ Format looks wrong. Should start with postgresql://\n');
  }
} else {
  console.log('  ❌ DATABASE_URL not loaded in Node.js environment\n');
  console.log('  This means Next.js can\'t see it either!\n');
  console.log('  🔧 Possible fixes:\n');
  console.log('     1. Make sure file is named .env.local (not .env.txt)');
  console.log('     2. Make sure file is in the root directory');
  console.log('     3. Restart your terminal completely');
  console.log('     4. Restart your dev server (npm run dev)\n');
}

// Final recommendations
console.log('=' .repeat(60));
console.log('\n✅ NEXT STEPS:\n');

if (foundEnvFile && hasDbUrl && process.env.DATABASE_URL) {
  console.log('  Your environment looks good! Try running:\n');
  console.log('  1. npx prisma generate');
  console.log('  2. npx prisma migrate dev');
  console.log('  3. node scripts/verify-db-connection.js');
  console.log('  4. npm run dev\n');
} else {
  console.log('  1. Fix the issues above');
  console.log('  2. Restart your terminal');
  console.log('  3. Run: npm run dev\n');
  console.log('  📖 Full guide: See SETUP_FOR_COLLABORATORS.md\n');
}

console.log('=' .repeat(60));




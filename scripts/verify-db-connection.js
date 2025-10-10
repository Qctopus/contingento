#!/usr/bin/env node

/**
 * Verify PostgreSQL Database Connection
 * 
 * This script tests if your DATABASE_URL is correctly configured
 * Run: node scripts/verify-db-connection.js
 */

const { PrismaClient } = require('@prisma/client')

const DATABASE_URL = process.env.DATABASE_URL

async function verifyConnection() {
  console.log('🔍 Verifying Database Connection...\n')
  console.log('=' .repeat(60))
  
  // Check if DATABASE_URL exists
  if (!DATABASE_URL) {
    console.log('❌ ERROR: DATABASE_URL environment variable not set!')
    console.log('\n💡 Fix: Set DATABASE_URL in your environment')
    console.log('   PowerShell: $env:DATABASE_URL="your-connection-string"')
    console.log('   Bash:       export DATABASE_URL="your-connection-string"')
    process.exit(1)
  }
  
  console.log('✅ DATABASE_URL is set')
  
  // Check if it's PostgreSQL
  if (DATABASE_URL.startsWith('file:') || DATABASE_URL.endsWith('.db')) {
    console.log('❌ ERROR: DATABASE_URL looks like SQLite!')
    console.log('   Current: ' + DATABASE_URL.substring(0, 50) + '...')
    console.log('\n💡 Fix: Use a PostgreSQL connection string')
    console.log('   Example: postgresql://user:pass@host:5432/db?sslmode=require')
    process.exit(1)
  }
  
  if (!DATABASE_URL.startsWith('postgresql://') && !DATABASE_URL.startsWith('postgres://')) {
    console.log('⚠️  WARNING: DATABASE_URL doesn\'t start with postgresql://')
    console.log('   Current: ' + DATABASE_URL.substring(0, 50) + '...')
  } else {
    console.log('✅ DATABASE_URL is PostgreSQL format')
  }
  
  // Check for sslmode
  if (!DATABASE_URL.includes('sslmode=require')) {
    console.log('⚠️  WARNING: DATABASE_URL missing ?sslmode=require')
    console.log('   This is required for most cloud databases (Neon, Supabase, Railway)')
    console.log('   Add ?sslmode=require to the end of your URL')
  } else {
    console.log('✅ SSL mode is configured')
  }
  
  console.log('\n📡 Testing connection...')
  
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  })
  
  try {
    // Try to connect
    await prisma.$connect()
    console.log('✅ Successfully connected to database!')
    
    // Check if tables exist
    console.log('\n📊 Checking database schema...')
    
    try {
      const parishCount = await prisma.parish.count()
      console.log(`✅ Parish table exists (${parishCount} records)`)
      
      const businessTypeCount = await prisma.businessType.count()
      console.log(`✅ BusinessType table exists (${businessTypeCount} records)`)
      
      const strategyCount = await prisma.riskMitigationStrategy.count()
      console.log(`✅ Strategy table exists (${strategyCount} records)`)
      
      if (parishCount === 0 || businessTypeCount === 0 || strategyCount === 0) {
        console.log('\n⚠️  WARNING: Some tables are empty!')
        console.log('   Run migrations and seed: npx prisma migrate deploy && npx prisma db seed')
      } else {
        console.log('\n🎉 Database is fully configured and has data!')
      }
    } catch (schemaError) {
      console.log('❌ Database tables missing!')
      console.log('   Error: ' + schemaError.message)
      console.log('\n💡 Fix: Run migrations to create tables')
      console.log('   Command: npx prisma migrate deploy')
    }
    
  } catch (error) {
    console.log('❌ Failed to connect to database!')
    console.log('   Error: ' + error.message)
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Possible causes:')
      console.log('   - Database host is incorrect or unreachable')
      console.log('   - Database is not running')
      console.log('   - Firewall blocking connection')
    } else if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Fix: Check your username and password in DATABASE_URL')
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n💡 Fix: Database name in URL is incorrect or database doesn\'t exist')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ Database verification complete!')
  console.log('\nYou can now deploy to Vercel with confidence! 🚀')
}

// Run verification
verifyConnection().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})


#!/usr/bin/env node

/**
 * Test Vercel Deployment Connection
 * 
 * This script tests if your Vercel deployment can connect to the database
 * Run: node scripts/test-vercel-connection.js YOUR_VERCEL_URL
 */

const fetch = require('node-fetch')

const VERCEL_URL = process.argv[2] || 'http://localhost:3000'

async function testEndpoint(url, name) {
  console.log(`\n🔍 Testing ${name}...`)
  console.log(`   URL: ${url}`)
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log(`   ✅ SUCCESS (${response.status})`)
      console.log(`   📦 Data preview:`, JSON.stringify(data).substring(0, 100) + '...')
      return true
    } else {
      console.log(`   ❌ FAILED (${response.status})`)
      console.log(`   Error:`, data)
      return false
    }
  } catch (error) {
    console.log(`   ❌ ERROR:`, error.message)
    return false
  }
}

async function runTests() {
  console.log('🚀 Testing Vercel Deployment Connection')
  console.log('=' .repeat(50))
  console.log(`Base URL: ${VERCEL_URL}`)
  
  const tests = [
    {
      url: `${VERCEL_URL}/api/admin2/parishes`,
      name: 'Parishes API'
    },
    {
      url: `${VERCEL_URL}/api/admin2/business-types`,
      name: 'Business Types API'
    },
    {
      url: `${VERCEL_URL}/api/admin2/strategies`,
      name: 'Strategies API'
    },
    {
      url: `${VERCEL_URL}/api/admin2/multipliers`,
      name: 'Multipliers API'
    }
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.name)
    if (result) {
      passed++
    } else {
      failed++
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log('\n' + '='.repeat(50))
  console.log(`📊 Results: ${passed} passed, ${failed} failed`)
  
  if (failed > 0) {
    console.log('\n❌ DEPLOYMENT HAS ISSUES')
    console.log('\n💡 Common fixes:')
    console.log('   1. Set DATABASE_URL in Vercel environment variables')
    console.log('   2. Ensure database allows connections from Vercel')
    console.log('   3. Run migrations: npx prisma migrate deploy')
    console.log('   4. Check Vercel function logs for detailed errors')
    console.log('\n📖 See VERCEL_DEPLOYMENT_FIX.md for detailed troubleshooting')
    process.exit(1)
  } else {
    console.log('\n✅ ALL TESTS PASSED - Deployment is working!')
    process.exit(0)
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})


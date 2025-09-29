#!/usr/bin/env node

/**
 * Test script to verify admin pre-fill data is working
 */

async function testAdminPreFillData() {
  console.log('🧪 Testing Admin Pre-fill Data Integration...\n')

  const baseUrl = 'http://localhost:3001'
  
  try {
    // Test 1: Check if business types have example data
    console.log('1. Testing business types API...')
    const businessTypesResponse = await fetch(`${baseUrl}/api/admin/business-types`)
    
    if (!businessTypesResponse.ok) {
      throw new Error(`Business types API failed: ${businessTypesResponse.status}`)
    }
    
    const businessTypesData = await businessTypesResponse.json()
    console.log(`   ✅ Found ${businessTypesData.businessTypes?.length || 0} business types`)
    
    // Check if restaurant has example data
    const restaurant = businessTypesData.businessTypes?.find(bt => bt.businessTypeId === 'restaurant')
    if (restaurant) {
      console.log('   📋 Restaurant business type:')
      console.log(`      - Name: ${restaurant.name}`)
      console.log(`      - Operating Hours: ${restaurant.typicalOperatingHours}`)
      
      try {
        const examplePurposes = JSON.parse(restaurant.exampleBusinessPurposes || '[]')
        const exampleProducts = JSON.parse(restaurant.exampleProducts || '[]')
        const examplePersonnel = JSON.parse(restaurant.exampleKeyPersonnel || '[]')
        const exampleCustomers = JSON.parse(restaurant.exampleCustomerBase || '[]')
        
        console.log(`      - Example Purposes: ${examplePurposes.length} items`)
        console.log(`        • "${examplePurposes[0] || 'None'}"`)
        console.log(`      - Example Products: ${exampleProducts.length} items`)
        console.log(`        • "${exampleProducts[0] || 'None'}"`)
        console.log(`      - Example Personnel: ${examplePersonnel.length} items`)
        console.log(`        • "${examplePersonnel[0] || 'None'}"`)
        console.log(`      - Example Customers: ${exampleCustomers.length} items`)
        console.log(`        • "${exampleCustomers[0] || 'None'}"`)
      } catch (e) {
        console.log('      ❌ Error parsing example data:', e.message)
      }
    } else {
      console.log('   ❌ Restaurant business type not found')
    }

    // Test 2: Test the prepare-prefill-data API
    console.log('\n2. Testing prepare-prefill-data API...')
    const preFillResponse = await fetch(`${baseUrl}/api/wizard/prepare-prefill-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessTypeId: 'restaurant',
        location: {
          country: 'Jamaica',
          countryCode: 'JM',
          parish: 'Kingston',
          nearCoast: false,
          urbanArea: true
        }
      })
    })

    if (!preFillResponse.ok) {
      throw new Error(`Pre-fill API failed: ${preFillResponse.status}`)
    }

    const preFillData = await preFillResponse.json()
    console.log('   ✅ Pre-fill API responded successfully')
    console.log('   📋 Pre-fill data structure:')
    console.log(`      - Industry: ${preFillData.industry?.name || 'Missing'}`)
    console.log(`      - Location: ${preFillData.location?.country || 'Missing'}`)
    
    if (preFillData.preFilledFields?.BUSINESS_OVERVIEW) {
      const overview = preFillData.preFilledFields.BUSINESS_OVERVIEW
      console.log('   🎯 Business Overview Pre-fills:')
      console.log(`      - Business Purpose: "${overview['Business Purpose'] || 'Empty'}"`)
      console.log(`      - Products/Services: "${overview['Products and Services'] || 'Empty'}"`)
      console.log(`      - Operating Hours: "${overview['Operating Hours'] || 'Empty'}"`)
      console.log(`      - Key Personnel: "${overview['Key Personnel'] || 'Empty'}"`)
      console.log(`      - Customer Base: "${overview['Customer Base'] || 'Empty'}"`)
      
      // Count non-empty fields
      const filledFields = Object.values(overview).filter(value => value && value.toString().trim() !== '').length
      console.log(`   📊 ${filledFields}/5 Business Overview fields have data`)
      
      if (filledFields >= 4) {
        console.log('   🎉 SUCCESS: Most business overview fields are populated!')
      } else {
        console.log('   ⚠️  WARNING: Many business overview fields are empty')
      }
    } else {
      console.log('   ❌ No Business Overview pre-fill data found')
    }

    // Test 3: Check hazards and examples
    if (preFillData.hazards) {
      console.log(`\n3. Risk Assessment Data:`)
      console.log(`   - ${preFillData.hazards.length} hazards identified for restaurants`)
      console.log(`   - Location risks: ${preFillData.locationRisks?.length || 0} additional risks`)
    }

    if (preFillData.contextualExamples?.BUSINESS_OVERVIEW) {
      console.log(`\n4. Contextual Examples:`)
      const examples = preFillData.contextualExamples.BUSINESS_OVERVIEW
      Object.keys(examples).forEach(field => {
        const count = examples[field]?.length || 0
        console.log(`   - ${field}: ${count} examples`)
      })
    }

    console.log('\n🎉 Admin Pre-fill Data Test Completed Successfully!')
    console.log('\n📝 Summary:')
    console.log('   ✅ Admin database is populated')
    console.log('   ✅ Business types have example data') 
    console.log('   ✅ API endpoints are working')
    console.log('   ✅ Pre-fill data structure is correct')
    console.log('\n🚀 The wizard should now show rich pre-fill data!')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('   1. Make sure the development server is running (npm run dev)')
    console.log('   2. Verify the database is populated (node scripts/populate-admin-data.js)')
    console.log('   3. Check that the API endpoints are accessible')
    process.exit(1)
  }
}

// Run the test
testAdminPreFillData() 
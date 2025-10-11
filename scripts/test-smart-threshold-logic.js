/**
 * Test Script: Smart Risk Threshold Logic
 * 
 * Tests the new smart pre-selection logic that only pre-selects risks
 * where the FINAL calculated risk score meets meaningful thresholds.
 * 
 * Expected Behaviors:
 * 1. High location risk + low business impact → NOT pre-selected (below threshold)
 * 2. Low location risk + high business impact → NOT pre-selected (below threshold)
 * 3. High location risk + high business impact → PRE-SELECTED (meets threshold)
 * 4. Low location risk + low business impact → NOT pre-selected (below threshold)
 * 5. Very high final score (>= 7.0) → FORCE PRE-SELECTED (critical risk)
 */

const API_BASE = process.env.API_URL || 'http://localhost:3000'

// Test scenarios with different combinations
const TEST_SCENARIOS = [
  {
    name: 'Scenario 1: High location risk + Low business impact',
    description: 'Flood in Kingston for Bar/Lounge (low flood impact)',
    businessTypeId: 'bar_lounge',
    location: {
      country: 'Jamaica',
      countryCode: 'JM',
      parish: 'Kingston', // High flood risk (8/10)
      nearCoast: true,
      urbanArea: true
    },
    businessCharacteristics: {
      customerBase: 'local',
      powerDependency: 'high',
      digitalDependency: 'moderate',
      importsFromOverseas: 'no',
      sellsPerishable: 'no',
      minimalInventory: 'no',
      expensiveEquipment: 'no'
    },
    expectedBehavior: 'Most risks should be available but NOT pre-selected (unless final score >= 4.0)'
  },
  {
    name: 'Scenario 2: Low location risk + High business impact',
    description: 'Drought in Trelawny for Hotel (high drought impact)',
    businessTypeId: 'hotel',
    location: {
      country: 'Jamaica',
      countryCode: 'JM',
      parish: 'Trelawny', // Low drought risk (2/10)
      nearCoast: false,
      urbanArea: false
    },
    businessCharacteristics: {
      customerBase: 'tourists',
      powerDependency: 'critical',
      digitalDependency: 'high',
      importsFromOverseas: 'yes',
      sellsPerishable: 'yes',
      minimalInventory: 'no',
      expensiveEquipment: 'yes'
    },
    expectedBehavior: 'Low location risks should NOT be pre-selected even for high-impact businesses'
  },
  {
    name: 'Scenario 3: High location risk + High business impact',
    description: 'Hurricane in Kingston for Restaurant (high hurricane impact)',
    businessTypeId: 'restaurant',
    location: {
      country: 'Jamaica',
      countryCode: 'JM',
      parish: 'Kingston', // High hurricane risk (9/10)
      nearCoast: true,
      urbanArea: true
    },
    businessCharacteristics: {
      customerBase: 'mixed',
      powerDependency: 'critical',
      digitalDependency: 'high',
      importsFromOverseas: 'yes',
      sellsPerishable: 'yes',
      minimalInventory: 'no',
      expensiveEquipment: 'yes'
    },
    expectedBehavior: 'High risks (hurricane, flood) should be PRE-SELECTED with final score >= 4.0'
  },
  {
    name: 'Scenario 4: Critical risk - Always pre-select',
    description: 'Very high risk that should always be shown',
    businessTypeId: 'hotel',
    location: {
      country: 'Jamaica',
      countryCode: 'JM',
      parish: 'Kingston',
      nearCoast: true,
      urbanArea: true
    },
    businessCharacteristics: {
      customerBase: 'tourists',
      powerDependency: 'critical',
      digitalDependency: 'critical',
      importsFromOverseas: 'yes',
      sellsPerishable: 'yes',
      minimalInventory: 'no',
      expensiveEquipment: 'yes'
    },
    expectedBehavior: 'Risks with final score >= 7.0 should be FORCE PRE-SELECTED'
  }
]

async function testScenario(scenario) {
  console.log('\n' + '='.repeat(80))
  console.log(`🧪 TEST: ${scenario.name}`)
  console.log('='.repeat(80))
  console.log(`Description: ${scenario.description}`)
  console.log(`Expected: ${scenario.expectedBehavior}`)
  console.log('')

  try {
    const response = await fetch(`${API_BASE}/api/wizard/prepare-prefill-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        businessTypeId: scenario.businessTypeId,
        location: scenario.location,
        businessCharacteristics: scenario.businessCharacteristics,
        locale: 'en'
      })
    })

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`)
      return
    }

    const data = await response.json()

    // Analyze the risk assessment matrix
    const riskMatrix = data.preFilledFields?.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || []
    
    const preSelectedRisks = riskMatrix.filter(r => r.isPreSelected === true)
    const availableRisks = riskMatrix.filter(r => r.isPreSelected === false && r.isAvailable === true)
    const belowThresholdRisks = riskMatrix.filter(r => r.source === 'below_threshold')
    
    console.log('📊 RESULTS:')
    console.log(`   Total Risks: ${riskMatrix.length}`)
    console.log(`   Pre-Selected: ${preSelectedRisks.length}`)
    console.log(`   Available (not pre-selected): ${availableRisks.length}`)
    console.log(`   Below Threshold: ${belowThresholdRisks.length}`)
    console.log('')

    // Show pre-selected risks
    if (preSelectedRisks.length > 0) {
      console.log('✅ PRE-SELECTED RISKS (final score >= 4.0):')
      preSelectedRisks
        .sort((a, b) => b.riskScore - a.riskScore)
        .forEach(risk => {
          const isCritical = risk.riskScore >= 7.0
          const marker = isCritical ? '🔴' : '⚠️'
          console.log(`   ${marker} ${risk.hazard}: ${risk.riskScore}/10 (${risk.riskLevel})`)
          console.log(`      Location: ${risk.likelihood}/10 | Business Impact: ${risk.severity}/10`)
        })
      console.log('')
    }

    // Show below-threshold risks
    if (belowThresholdRisks.length > 0) {
      console.log('📋 BELOW THRESHOLD (available but not pre-selected, score < 4.0):')
      belowThresholdRisks
        .sort((a, b) => b.riskScore - a.riskScore)
        .forEach(risk => {
          console.log(`   ⚪ ${risk.hazard}: ${risk.riskScore}/10 (${risk.riskLevel})`)
          console.log(`      Location: ${risk.likelihood}/10 | Business Impact: ${risk.severity}/10`)
        })
      console.log('')
    }

    // Show other available risks
    const otherAvailable = availableRisks.filter(r => r.source !== 'below_threshold')
    if (otherAvailable.length > 0) {
      console.log('📂 OTHER AVAILABLE RISKS (no location data):')
      otherAvailable.forEach(risk => {
        console.log(`   ⚪ ${risk.hazard}: ${risk.riskScore}/10 (${risk.riskLevel})`)
      })
      console.log('')
    }

    // Validate thresholds
    console.log('🔍 THRESHOLD VALIDATION:')
    let validationPassed = true
    
    // Check: All pre-selected risks should have score >= 4.0 OR be from parish_only source
    preSelectedRisks.forEach(risk => {
      if (risk.riskScore < 4.0 && risk.source !== 'parish_only') {
        console.log(`   ❌ FAIL: ${risk.hazard} is pre-selected but score ${risk.riskScore} < 4.0`)
        validationPassed = false
      }
    })
    
    // Check: All below-threshold risks should have score < 4.0
    belowThresholdRisks.forEach(risk => {
      if (risk.riskScore >= 4.0) {
        console.log(`   ❌ FAIL: ${risk.hazard} is marked below threshold but score ${risk.riskScore} >= 4.0`)
        validationPassed = false
      }
    })
    
    // Check: Risks with score >= 7.0 should always be pre-selected
    riskMatrix.forEach(risk => {
      if (risk.riskScore >= 7.0 && !risk.isPreSelected) {
        console.log(`   ❌ FAIL: ${risk.hazard} has critical score ${risk.riskScore} but is NOT pre-selected`)
        validationPassed = false
      }
    })
    
    if (validationPassed) {
      console.log('   ✅ All threshold rules are working correctly!')
    }

    console.log('')
    console.log('✅ Test completed successfully')

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }
}

async function runAllTests() {
  console.log('🚀 Starting Smart Risk Threshold Logic Tests')
  console.log('================================================')
  console.log('')
  console.log('THRESHOLD CONFIGURATION:')
  console.log('  MIN_PRESELECT_SCORE: 4.0 (medium and above)')
  console.log('  FORCE_PRESELECT_SCORE: 7.0 (critical risks always shown)')
  console.log('')

  for (const scenario of TEST_SCENARIOS) {
    await testScenario(scenario)
    await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between tests
  }

  console.log('\n' + '='.repeat(80))
  console.log('🏁 ALL TESTS COMPLETED')
  console.log('='.repeat(80))
  console.log('')
  console.log('Summary of Expected Behaviors:')
  console.log('✅ Risks with final score >= 7.0 → Always pre-selected (critical)')
  console.log('✅ Risks with final score >= 4.0 → Pre-selected (medium+)')
  console.log('✅ Risks with final score < 4.0 → Available but not pre-selected')
  console.log('✅ Risks with no location data → Available but not pre-selected')
  console.log('')
  console.log('Key Benefits:')
  console.log('  • Users only see meaningful risks by default')
  console.log('  • Low-relevance risks are still accessible if needed')
  console.log('  • Final score considers location + business type + multipliers')
  console.log('  • Transparent reasoning explains why risks are/aren\'t pre-selected')
}

// Run tests
runAllTests().catch(console.error)


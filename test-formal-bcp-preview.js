/**
 * Browser Console Test Script for Formal BCP Preview
 * 
 * Run this in your browser console (F12) while on the Business Plan Review page
 * to verify the data flow is working correctly.
 */

console.log('🔍 Starting Formal BCP Preview Data Verification...\n')

// Test 1: Check wizardFormData exists
console.log('TEST 1: Checking wizardFormData in localStorage...')
const formDataRaw = localStorage.getItem('wizardFormData')
if (!formDataRaw) {
  console.error('❌ FAIL: wizardFormData not found in localStorage')
  console.log('   → Please complete the wizard first')
} else {
  console.log('✅ PASS: wizardFormData found')
  
  const formData = JSON.parse(formDataRaw)
  
  // Test 2: Check strategies exist
  console.log('\nTEST 2: Checking strategies in formData...')
  const strategies = formData.STRATEGIES?.['Business Continuity Strategies'] || []
  if (strategies.length === 0) {
    console.error('❌ FAIL: No strategies found in formData')
    console.log('   → Please select strategies in the wizard')
  } else {
    console.log(`✅ PASS: Found ${strategies.length} strategies`)
    
    // Test 3: Check strategies have costs
    console.log('\nTEST 3: Checking strategy cost calculations...')
    const strategiesWithCosts = strategies.filter(s => s.calculatedCostLocal && s.calculatedCostLocal > 0)
    console.log(`   Strategies with calculatedCostLocal: ${strategiesWithCosts.length}/${strategies.length}`)
    
    if (strategiesWithCosts.length === 0) {
      console.warn('⚠️  WARNING: No strategies have calculated costs')
      console.log('   → This is normal if you just navigated to review page')
      console.log('   → Wait a few seconds for cost calculation to complete')
      console.log('   → Then refresh this test')
    } else {
      console.log('✅ PASS: Strategies have calculated costs')
      
      // Show sample strategy
      console.log('\n📊 Sample Strategy Details:')
      console.table({
        'Name': strategiesWithCosts[0].name || strategiesWithCosts[0].smeTitle,
        'Cost (Local)': strategiesWithCosts[0].calculatedCostLocal,
        'Currency Symbol': strategiesWithCosts[0].currencySymbol,
        'Currency Code': strategiesWithCosts[0].currencyCode,
        'Estimated Hours': strategiesWithCosts[0].estimatedTotalHours || 'N/A',
        'Applicable Risks': strategiesWithCosts[0].applicableRisks?.length || 0
      })
      
      // Test 4: Calculate total investment
      console.log('\nTEST 4: Calculating total investment...')
      const totalInvestment = strategiesWithCosts.reduce((sum, s) => sum + (s.calculatedCostLocal || 0), 0)
      const currencySymbol = strategiesWithCosts[0].currencySymbol || 'J$'
      const currencyCode = strategiesWithCosts[0].currencyCode || 'JMD'
      console.log(`✅ Total Investment: ${currencySymbol}${totalInvestment.toLocaleString()} ${currencyCode}`)
      
      // Test 5: Check each strategy
      console.log('\nTEST 5: Detailed Strategy Report:')
      console.log('─'.repeat(80))
      strategies.forEach((s, idx) => {
        const hasCost = s.calculatedCostLocal && s.calculatedCostLocal > 0
        const costDisplay = hasCost 
          ? `${s.currencySymbol}${Math.round(s.calculatedCostLocal).toLocaleString()}`
          : 'Cost TBD'
        
        // Format timeline like the preview does
        const hasTime = s.estimatedTotalHours && s.estimatedTotalHours > 0
        let timeDisplay = 'TBD'
        if (hasTime) {
          const hours = s.estimatedTotalHours
          if (hours < 8) timeDisplay = `~${hours}h`
          else if (hours < 40) timeDisplay = `~${Math.round(hours / 8)} days`
          else if (hours < 160) timeDisplay = `~${Math.round(hours / 40)} weeks`
          else timeDisplay = `~${Math.round(hours / 160)} months`
        } else if (s.timeToImplement) {
          timeDisplay = s.timeToImplement
        }
        
        const costStatus = hasCost ? '✅' : '⚠️'
        const timeStatus = hasTime ? '✅' : '⚠️'
        console.log(`${costStatus}${timeStatus} ${idx + 1}. ${s.name || s.smeTitle}`)
        console.log(`   Cost: ${costDisplay} | Time: ${timeDisplay} | Risks: ${s.applicableRisks?.length || 0} | Steps: ${s.actionSteps?.length || 0}`)
      })
      console.log('─'.repeat(80))
    }
  }
  
  // Test 6: Check prefill data for country code
  console.log('\nTEST 6: Checking country code detection...')
  const prefillDataRaw = localStorage.getItem('bcp-prefill-data')
  if (!prefillDataRaw) {
    console.warn('⚠️  WARNING: bcp-prefill-data not found')
    console.log('   → Country code may fall back to address parsing')
  } else {
    const prefillData = JSON.parse(prefillDataRaw)
    const countryCode = prefillData.location?.countryCode
    const country = prefillData.location?.country
    
    if (countryCode) {
      console.log(`✅ PASS: Country detected`)
      console.table({
        'Country': country,
        'Country Code': countryCode
      })
      
      // Map to expected currency
      const currencyMap = {
        'BB': { code: 'BBD', symbol: 'Bds$' },
        'JM': { code: 'JMD', symbol: 'J$' },
        'TT': { code: 'TTD', symbol: 'TT$' },
        'BS': { code: 'BSD', symbol: 'B$' }
      }
      const expectedCurrency = currencyMap[countryCode] || currencyMap['JM']
      console.log(`   Expected Currency: ${expectedCurrency.symbol}${expectedCurrency.code}`)
      
      // Compare with strategy currencies
      if (strategies.length > 0 && strategiesWithCosts.length > 0) {
        const actualCurrency = {
          symbol: strategiesWithCosts[0].currencySymbol,
          code: strategiesWithCosts[0].currencyCode
        }
        
        if (actualCurrency.symbol === expectedCurrency.symbol && actualCurrency.code === expectedCurrency.code) {
          console.log('✅ PASS: Strategy costs match expected currency')
        } else {
          console.error('❌ FAIL: Currency mismatch!')
          console.log(`   Expected: ${expectedCurrency.symbol}${expectedCurrency.code}`)
          console.log(`   Actual: ${actualCurrency.symbol}${actualCurrency.code}`)
        }
      }
    } else {
      console.warn('⚠️  WARNING: Country code not in prefill data')
    }
  }
  
  // Test 7: Check risks
  console.log('\nTEST 7: Checking risk-strategy matching...')
  const risks = formData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || []
  const selectedRisks = risks.filter(r => r.isSelected !== false)
  console.log(`   Total Risks: ${risks.length}`)
  console.log(`   Selected Risks: ${selectedRisks.length}`)
  
  if (selectedRisks.length > 0 && strategies.length > 0) {
    console.log('\n   Risk-Strategy Mapping:')
    selectedRisks.forEach((risk, idx) => {
      const riskName = risk.hazardName || risk.Hazard || 'Unnamed'
      const riskId = risk.hazardId || riskName
      
      // Find strategies that apply to this risk
      const applicableStrategies = strategies.filter(s => {
        if (!s.applicableRisks) return false
        return s.applicableRisks.some(ar => {
          const arLower = ar.toLowerCase().replace(/_/g, ' ')
          const riskIdLower = riskId.toLowerCase().replace(/_/g, ' ')
          const riskNameLower = riskName.toLowerCase().replace(/_/g, ' ')
          return arLower === riskIdLower || arLower === riskNameLower || 
                 riskNameLower.includes(arLower) || arLower.includes(riskNameLower)
        })
      })
      
      const status = applicableStrategies.length > 0 ? '✅' : '⚠️'
      console.log(`   ${status} ${idx + 1}. ${riskName}: ${applicableStrategies.length} strategies`)
    })
  }
}

console.log('\n' + '='.repeat(80))
console.log('🎯 VERIFICATION COMPLETE')
console.log('='.repeat(80))

// Provide recommendations
console.log('\n📋 RECOMMENDATIONS:')
if (!formDataRaw) {
  console.log('1. Complete the wizard and select strategies')
} else {
  const formData = JSON.parse(formDataRaw)
  const strategies = formData.STRATEGIES?.['Business Continuity Strategies'] || []
  const strategiesWithCosts = strategies.filter(s => s.calculatedCostLocal > 0)
  
  if (strategies.length === 0) {
    console.log('1. Go back and select strategies in the wizard')
  } else if (strategiesWithCosts.length === 0) {
    console.log('1. Wait a few seconds for cost calculation to complete')
    console.log('2. Refresh this page')
    console.log('3. Re-run this test')
  } else {
    console.log('✅ All checks passed! Your preview should display correctly.')
    console.log('\nExpected preview display:')
    const totalInvestment = strategiesWithCosts.reduce((sum, s) => sum + (s.calculatedCostLocal || 0), 0)
    const currencySymbol = strategiesWithCosts[0].currencySymbol || 'J$'
    const currencyCode = strategiesWithCosts[0].currencyCode || 'JMD'
    console.log(`- Total Investment: ${currencySymbol}${totalInvestment.toLocaleString()} ${currencyCode}`)
    console.log(`- Number of Strategies: ${strategies.length}`)
    console.log(`- Currency: ${currencySymbol}${currencyCode}`)
  }
}

console.log('\n💡 TIP: Check browser console for [BusinessPlanReview] and [FormalBCPPreview] logs')
console.log('    to see the complete data flow trace.\n')


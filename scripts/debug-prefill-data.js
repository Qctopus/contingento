/**
 * DEBUG PREFILL DATA - See what's in the prefill data
 * 
 * Run this in browser console to diagnose the "No Risks Loaded" issue
 */

(function debugPrefillData() {
  console.log('=' .repeat(80))
  console.log('PREFILL DATA DEBUG')
  console.log('='.repeat(80))
  
  const preFillDataStr = localStorage.getItem('bcp-prefill-data')
  const industrySelected = localStorage.getItem('bcp-industry-selected')
  
  console.log('\n1. Industry Selected Flag:', industrySelected)
  
  if (!preFillDataStr) {
    console.log('\n❌ NO PREFILL DATA FOUND IN LOCALSTORAGE')
    console.log('This means the industry selector didn\'t save the data properly.')
    console.log('\nTo fix:')
    console.log('1. Go back to start of wizard')
    console.log('2. Re-select industry and location')
    console.log('3. Make sure you complete ALL industry selector steps')
    return
  }
  
  const preFillData = JSON.parse(preFillDataStr)
  
  console.log('\n2. PreFill Data Structure:')
  console.log('Keys:', Object.keys(preFillData))
  
  console.log('\n3. Industry:', preFillData.industry)
  console.log('\n4. Location:', preFillData.location)
  
  console.log('\n5. HAZARDS (This is what Risk Assessment needs):')
  if (preFillData.hazards) {
    console.log(`   ✅ Hazards array exists with ${preFillData.hazards.length} items`)
    if (preFillData.hazards.length > 0) {
      console.log('   First hazard:', preFillData.hazards[0])
      console.log('   All hazard IDs:', preFillData.hazards.map((h) => h.hazardId || h.hazardName))
    } else {
      console.log('   ❌ Hazards array is EMPTY')
    }
  } else {
    console.log('   ❌ Hazards array is MISSING')
  }
  
  console.log('\n6. PreFilled Fields:')
  if (preFillData.preFilledFields) {
    console.log('   Keys:', Object.keys(preFillData.preFilledFields))
    
    if (preFillData.preFilledFields.RISK_ASSESSMENT) {
      console.log('\n   RISK_ASSESSMENT section:')
      console.log('   Keys:', Object.keys(preFillData.preFilledFields.RISK_ASSESSMENT))
      
      const matrix = preFillData.preFilledFields.RISK_ASSESSMENT['Risk Assessment Matrix']
      if (matrix) {
        console.log(`   ✅ Risk Assessment Matrix exists with ${matrix.length} items`)
        if (matrix.length > 0) {
          console.log('   First risk:', matrix[0])
        }
      } else {
        console.log('   ❌ Risk Assessment Matrix is missing')
      }
    } else {
      console.log('   ❌ RISK_ASSESSMENT section is missing from preFilledFields')
    }
  } else {
    console.log('   ❌ preFilledFields is missing')
  }
  
  console.log('\n7. Recommended Strategies:')
  if (preFillData.recommendedStrategies) {
    console.log(`   ✅ ${preFillData.recommendedStrategies.length} strategies`)
  } else {
    console.log('   ❌ Missing')
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('DIAGNOSIS:')
  console.log('='.repeat(80))
  
  if (!preFillData.hazards || preFillData.hazards.length === 0) {
    console.log('\n❌ PROBLEM FOUND: hazards array is missing or empty')
    console.log('\nThis means the /api/wizard/prepare-prefill-data API')
    console.log('either wasn\'t called or didn\'t return hazards properly.')
    console.log('\nPOSSIBLE CAUSES:')
    console.log('1. No business type/industry selected')
    console.log('2. No location data provided')
    console.log('3. API error during prefill data generation')
    console.log('4. Database missing risk vulnerability data for this industry')
    console.log('\nSOLUTION:')
    console.log('1. Clear data: localStorage.clear(); location.reload()')
    console.log('2. Start wizard again')
    console.log('3. Select industry AND location carefully')
    console.log('4. Complete all 3 industry selector steps')
    console.log('5. Check browser console for API errors')
  } else {
    console.log('\n✅ Hazards data looks good!')
    console.log('If you still see "No Risks Loaded", the issue might be:')
    console.log('1. Component not reading preFillData correctly')
    console.log('2. React state not updating')
    console.log('3. Try refreshing the page')
  }
  
  console.log('\n' + '='.repeat(80))
  
  return {
    hasPreFillData: !!preFillDataStr,
    hasHazards: !!(preFillData.hazards && preFillData.hazards.length > 0),
    hazardCount: preFillData.hazards?.length || 0,
    industry: preFillData.industry?.name,
    location: preFillData.location?.parish || preFillData.location?.country
  }
})()










/**
 * DEBUG SCRIPT - Check Review Page Data
 * 
 * Run this in browser console on the Review page to see what data is available
 */

console.log('='.repeat(80))
console.log('DEBUG: Review Page Data Analysis')
console.log('='.repeat(80))

// Get formData from localStorage
const formDataRaw = localStorage.getItem('wizardFormData')
if (!formDataRaw) {
  console.error('❌ No wizardFormData found in localStorage!')
} else {
  const formData = JSON.parse(formDataRaw)
  
  console.log('\n📋 FORM DATA STRUCTURE:')
  console.log('Keys:', Object.keys(formData))
  
  // Check strategies
  console.log('\n🎯 STRATEGIES DATA:')
  const strategies = formData.STRATEGIES?.['Business Continuity Strategies']
  if (!strategies) {
    console.error('❌ No strategies found in formData.STRATEGIES')
  } else {
    console.log('✅ Found', strategies.length, 'strategies')
    
    strategies.forEach((s, idx) => {
      console.log(`\n--- Strategy ${idx + 1}: ${s.name || s.smeTitle} ---`)
      console.log('  ID:', s.id)
      console.log('  Category:', s.category)
      console.log('  Applicable Risks:', s.applicableRisks)
      console.log('  Has calculatedCostLocal:', !!s.calculatedCostLocal, s.calculatedCostLocal)
      console.log('  Has currencySymbol:', !!s.currencySymbol, s.currencySymbol)
      console.log('  timeToImplement:', s.timeToImplement)
      console.log('  implementationTime:', s.implementationTime)
      console.log('  Action Steps:', s.actionSteps?.length || 0)
      
      if (s.actionSteps && s.actionSteps.length > 0) {
        console.log('  First Action:', s.actionSteps[0].smeAction || s.actionSteps[0].title)
        console.log('  Has Cost Items:', s.actionSteps.some(a => a.costItems && a.costItems.length > 0))
      }
    })
  }
  
  // Check risks
  console.log('\n🚨 RISKS DATA:')
  const risks = formData.RISK_ASSESSMENT?.['Risk Assessment Matrix']
  if (!risks) {
    console.error('❌ No risks found')
  } else {
    console.log('✅ Total risks:', risks.length)
    
    const selectedRisks = risks.filter(r => r.isSelected !== false)
    console.log('✅ Selected risks:', selectedRisks.length)
    
    const highPriorityRisks = selectedRisks.filter(r => {
      const score = parseFloat(r.riskScore || r['Risk Score'] || 0)
      return score >= 6
    })
    console.log('✅ High priority risks (score >= 6):', highPriorityRisks.length)
    
    console.log('\nHigh Priority Risks:')
    highPriorityRisks.forEach(r => {
      console.log(`  - ${r.hazardName || r.Hazard} (ID: ${r.hazardId}, Score: ${r.riskScore})`)
    })
    
    console.log('\nAll Selected Risks:')
    selectedRisks.forEach(r => {
      const score = parseFloat(r.riskScore || r['Risk Score'] || 0)
      const priority = score >= 8 ? 'EXTREME' : score >= 6 ? 'HIGH' : score >= 4 ? 'MEDIUM' : 'LOW'
      console.log(`  - ${r.hazardName || r.Hazard} (${priority}, Score: ${score})`)
    })
  }
  
  // Check location
  console.log('\n🌍 LOCATION DATA:')
  const address = formData.PLAN_INFORMATION?.['Business Address'] || ''
  console.log('Address:', address)
  const country = address.split(',').pop()?.trim()
  console.log('Detected Country:', country)
  
  // Match strategies to risks
  console.log('\n🔗 STRATEGY-RISK MATCHING:')
  if (strategies && risks) {
    const highPriorityRisks = risks.filter(r => {
      const score = parseFloat(r.riskScore || r['Risk Score'] || 0)
      return r.isSelected !== false && score >= 6
    })
    
    console.log(`Checking ${strategies.length} strategies against ${highPriorityRisks.length} high-priority risks...`)
    
    let matchedCount = 0
    highPriorityRisks.forEach(risk => {
      const riskId = risk.hazardId
      const riskName = risk.hazardName || risk.Hazard
      const matchingStrategies = strategies.filter(s => 
        s.applicableRisks?.includes(riskId)
      )
      
      console.log(`\n  Risk: ${riskName} (${riskId})`)
      console.log(`    Matching strategies: ${matchingStrategies.length}`)
      matchingStrategies.forEach(s => {
        console.log(`      - ${s.name || s.smeTitle}`)
        matchedCount++
      })
    })
    
    console.log(`\n  Total strategy-risk matches: ${matchedCount}`)
    console.log(`  Strategies NOT matched to high-priority risks: ${strategies.length - new Set(strategies.filter(s => highPriorityRisks.some(r => s.applicableRisks?.includes(r.hazardId)))).size}`)
  }
}

console.log('\n' + '='.repeat(80))
console.log('Copy the output above and share it for debugging')
console.log('='.repeat(80))


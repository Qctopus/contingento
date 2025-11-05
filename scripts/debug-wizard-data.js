/**
 * DEBUG SCRIPT - See what's actually in the wizard
 * 
 * Run this in the browser console to see the current wizard data structure
 */

(function debugWizardData() {
  console.log('='.repeat(80))
  console.log('WIZARD DATA DEBUG')
  console.log('='.repeat(80))
  
  // Get current data
  const draftData = localStorage.getItem('bcp-draft')
  const industrySelected = localStorage.getItem('bcp-industry-selected')
  const preFillData = localStorage.getItem('bcp-prefill-data')
  
  console.log('\n📦 1. BCP-DRAFT (Main form data):')
  if (draftData) {
    const parsed = JSON.parse(draftData)
    console.log('Keys:', Object.keys(parsed))
    console.log('Full data:', parsed)
    
    // Show structure for each section
    Object.keys(parsed).forEach(sectionKey => {
      console.log(`\n  ${sectionKey}:`)
      const section = parsed[sectionKey]
      if (Array.isArray(section)) {
        console.log(`    Type: Array with ${section.length} items`)
        if (section.length > 0) {
          console.log(`    First item:`, section[0])
        }
      } else if (typeof section === 'object' && section !== null) {
        console.log(`    Type: Object with keys:`, Object.keys(section))
        Object.entries(section).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            console.log(`      "${key}": Array[${value.length}]`, value.length > 0 ? value[0] : '')
          } else if (typeof value === 'object') {
            console.log(`      "${key}": Object`, value)
          } else {
            const preview = typeof value === 'string' && value.length > 50 
              ? value.substring(0, 50) + '...' 
              : value
            console.log(`      "${key}": ${typeof value}`, preview)
          }
        })
      } else {
        console.log(`    Type: ${typeof section}`, section)
      }
    })
  } else {
    console.log('  NO DATA FOUND')
  }
  
  console.log('\n📦 2. INDUSTRY-SELECTED:', industrySelected)
  console.log('\n📦 3. PREFILL-DATA:', preFillData ? 'EXISTS' : 'NOT FOUND')
  
  console.log('\n' + '='.repeat(80))
  console.log('To clear all data: localStorage.clear(); location.reload()')
  console.log('='.repeat(80))
  
  return {
    hasDraft: !!draftData,
    hasIndustry: !!industrySelected,
    hasPreFill: !!preFillData,
    sections: draftData ? Object.keys(JSON.parse(draftData)) : []
  }
})()








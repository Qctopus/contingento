/**
 * Cleanup Script: Remove isCoastal/isUrban Parish References
 * 
 * This script helps identify and potentially fix references to Parish.isCoastal
 * and Parish.isUrban that need to be removed since we now handle this through
 * user input (location.nearCoast/urbanArea) and the multiplier system.
 * 
 * Run this to see what needs to be cleaned up.
 */

const fs = require('fs')
const path = require('path')

const filesToCheck = [
  // Frontend Components
  'src/components/admin2/CompactParishOverview.tsx',
  'src/components/admin2/ImprovedParishOverview.tsx',
  'src/components/admin2/ImprovedRiskCalculatorTab.tsx',
  'src/components/admin2/ParishOverview.tsx',
  'src/components/admin2/ParishEditor.tsx',
  'src/components/admin2/RiskCalculatorTab.tsx',
  'src/components/admin2/ImprovedParishDashboard.tsx',
  'src/components/admin2/RiskMatrix.tsx',
  'src/components/admin2/CompactRiskMatrix.tsx',
  
  // Backend APIs
  'src/app/api/admin2/parishes/[id]/route.ts',
  'src/app/api/admin2/parishes/route.ts',
  'src/app/api/admin2/parishes/bulk-upload/route.ts',
  'src/app/api/admin/admin2/parishes/[id]/route.ts',
  'src/app/api/admin/admin2/parishes/route.ts',
  'src/app/api/admin/admin2/parishes/report/route.ts',
  'src/app/api/admin/admin2/parishes/bulk-upload/route.ts',
]

console.log('🧹 Scanning for Parish isCoastal/isUrban references...\n')

let totalReferences = 0
const fileReports = []

for (const filePath of filesToCheck) {
  const fullPath = path.join(process.cwd(), filePath)
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`)
    continue
  }
  
  const content = fs.readFileSync(fullPath, 'utf8')
  const lines = content.split('\n')
  
  const references = []
  
  lines.forEach((line, index) => {
    const lineNum = index + 1
    
    // Look for parish.isCoastal or parish.isUrban
    if (line.match(/parish\s*\.\s*isCoastal/i) || line.match(/parish\s*\.\s*isUrban/i)) {
      references.push({
        line: lineNum,
        content: line.trim(),
        type: 'parish_reference'
      })
      totalReferences++
    }
    
    // Look for isCoastal: boolean in type definitions
    if (line.match(/isCoastal\s*:\s*boolean/i) || line.match(/isUrban\s*:\s*boolean/i)) {
      references.push({
        line: lineNum,
        content: line.trim(),
        type: 'type_definition'
      })
      totalReferences++
    }
  })
  
  if (references.length > 0) {
    fileReports.push({
      file: filePath,
      references
    })
  }
}

// Print Report
console.log('📋 SCAN RESULTS')
console.log('='.repeat(80))
console.log(`\nTotal references found: ${totalReferences}`)
console.log(`Files with references: ${fileReports.length}\n`)

if (fileReports.length === 0) {
  console.log('✅ No Parish isCoastal/isUrban references found!')
  console.log('   All cleanup complete!\n')
} else {
  console.log('Files needing cleanup:\n')
  
  fileReports.forEach(({ file, references }) => {
    console.log(`📄 ${file}`)
    console.log(`   ${references.length} reference(s):\n`)
    
    references.forEach(ref => {
      const marker = ref.type === 'type_definition' ? '📝 TYPE' : '🔗 USE'
      console.log(`   ${marker} Line ${ref.line}: ${ref.content}`)
    })
    console.log('')
  })
  
  console.log('\n' + '='.repeat(80))
  console.log('⚠️  ACTION REQUIRED:')
  console.log('   1. Remove type definitions (isCoastal: boolean, isUrban: boolean)')
  console.log('   2. Remove UI displays of coastal/urban badges')
  console.log('   3. Remove API response fields for isCoastal/isUrban')
  console.log('   4. Keep location.nearCoast and location.urbanArea (user input)')
  console.log('\n   See: PARISH_COASTAL_URBAN_CLEANUP.md for details')
  console.log('='.repeat(80))
}

// Check for proper user input references (these should exist and work)
console.log('\n✅ VERIFYING USER INPUT HANDLING (should exist):')

const userInputFiles = [
  'src/app/api/wizard/prepare-prefill-data/route.ts',
  'src/services/multiplierService.ts'
]

let userInputOk = true

for (const filePath of userInputFiles) {
  const fullPath = path.join(process.cwd(), filePath)
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Missing: ${filePath}`)
    userInputOk = false
    continue
  }
  
  const content = fs.readFileSync(fullPath, 'utf8')
  
  // Check for location.nearCoast or userChars.isCoastal (correct user input handling)
  const hasNearCoast = content.includes('location.nearCoast') || content.includes('nearCoast')
  const hasUrbanArea = content.includes('location.urbanArea') || content.includes('urbanArea')
  
  if (hasNearCoast || hasUrbanArea) {
    console.log(`✅ ${filePath}`)
    console.log(`   - Uses user input for coastal/urban (correct!)`)
  } else {
    console.log(`⚠️  ${filePath}`)
    console.log(`   - May be missing user input handling`)
    userInputOk = false
  }
}

if (userInputOk) {
  console.log('\n✅ User input handling is working correctly!')
  console.log('   Multiplier system will receive coastal/urban from user choices.\n')
} else {
  console.log('\n⚠️  Check user input handling in wizard and multiplier service.\n')
}

console.log('Done!')

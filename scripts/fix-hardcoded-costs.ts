import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

// Context-aware replacement function
function getContextAwareReplacement(text: string, match: string, fieldName: string): string {
  // For simple cost fields, use generic replacement
  if (fieldName === 'estimatedCostJMD' || fieldName === 'costEstimateJMD') {
    return 'See cost breakdown'
  }
  
  // Check context around the match
  const beforeMatch = text.substring(0, text.indexOf(match)).toLowerCase()
  const afterMatch = text.substring(text.indexOf(match) + match.length).toLowerCase()
  
  // For savings comparisons
  if (beforeMatch.includes('save') || beforeMatch.includes('avoid') || beforeMatch.includes('vs')) {
    return 'significant costs'
  }
  
  // For loss/damage descriptions
  if (beforeMatch.includes('lost') || beforeMatch.includes('damage') || beforeMatch.includes('loss')) {
    return 'substantial losses'
  }
  
  // For cost descriptions
  if (beforeMatch.includes('cost') || beforeMatch.includes('price')) {
    return 'affordable amounts'
  }
  
  // For investment/expense descriptions
  if (beforeMatch.includes('invest') || beforeMatch.includes('spend') || beforeMatch.includes('pay')) {
    return 'reasonable amounts'
  }
  
  // Default
  return 'significant amounts'
}

// Regex patterns and their replacements
const COST_PATTERNS = [
  {
    pattern: /JMD\s*\$?\s*[\d,]+(-[\d,]+)?/gi,
    description: 'JMD currency codes'
  },
  {
    pattern: /USD\s*\$?\s*[\d,]+(-[\d,]+)?/gi,
    description: 'USD currency codes'
  },
  {
    pattern: /TTD\s*\$?\s*[\d,]+(-[\d,]+)?/gi,
    description: 'TTD currency codes'
  },
  {
    pattern: /BBD\s*\$?\s*[\d,]+(-[\d,]+)?/gi,
    description: 'BBD currency codes'
  },
  {
    pattern: /XCD\s*\$?\s*[\d,]+(-[\d,]+)?/gi,
    description: 'XCD currency codes'
  },
  {
    pattern: /HTG\s*[\d,]+(-[\d,]+)?/gi,
    description: 'HTG currency codes'
  },
  {
    pattern: /DOP\s*[\d,]+(-[\d,]+)?/gi,
    description: 'DOP currency codes'
  },
  {
    pattern: /BSD\s*\$?\s*[\d,]+(-[\d,]+)?/gi,
    description: 'BSD currency codes'
  },
  {
    pattern: /J\$\s*[\d,]+(-[\d,]+)?/gi,
    description: 'Jamaica dollar symbols'
  },
  {
    pattern: /Bds\$\s*[\d,]+(-[\d,]+)?/gi,
    description: 'Barbados dollar symbols'
  },
  {
    pattern: /TT\$\s*[\d,]+(-[\d,]+)?/gi,
    description: 'Trinidad dollar symbols'
  },
  {
    pattern: /EC\$\s*[\d,]+(-[\d,]+)?/gi,
    description: 'Eastern Caribbean dollar symbols'
  },
  {
    pattern: /RD\$\s*[\d,]+(-[\d,]+)?/gi,
    description: 'Dominican peso symbols'
  },
  {
    pattern: /B\$\s*[\d,]+(-[\d,]+)?/gi,
    description: 'Bahamas dollar symbols'
  },
  {
    pattern: /\$\s*[\d,]+(-[\d,]+)?(?!\w)/gi,
    description: 'Generic dollar amounts'
  }
]

interface UpdateRecord {
  table: 'Strategy' | 'ActionStep'
  id: string
  name: string
  field: string
  oldValue: string
  newValue: string
  removedCosts: string[]
}

async function fixHardcodedCosts(dryRun: boolean = true) {
  console.log(dryRun ? '🔍 DRY RUN MODE - No changes will be made\n' : '⚠️  LIVE UPDATE MODE - Database will be modified\n')
  
  const updates: UpdateRecord[] = []
  
  // Fix strategies
  console.log('📋 Processing RiskMitigationStrategy table...\n')
  const strategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      id: true,
      strategyId: true,
      name: true,
      realWorldExample: true,
      lowBudgetAlternative: true,
      diyApproach: true,
      estimatedDIYSavings: true,
      costEstimateJMD: true
    }
  })
  
  for (const strategy of strategies) {
    const dbUpdates: any = {}
    
    const fields = [
      'realWorldExample',
      'lowBudgetAlternative', 
      'diyApproach',
      'estimatedDIYSavings',
      'costEstimateJMD'
    ]
    
    for (const field of fields) {
      const original = strategy[field as keyof typeof strategy] as string | null
      if (!original) continue
      
      let updated = original
      let hasChanges = false
      const removedCosts: string[] = []
      
      // Apply all fix patterns with context-aware replacement
      for (const fix of COST_PATTERNS) {
        const matches = updated.match(fix.pattern)
        if (matches) {
          removedCosts.push(...matches)
          // Replace each match with context-aware text
          for (const match of matches) {
            const replacement = getContextAwareReplacement(updated, match, field)
            updated = updated.replace(match, replacement)
          }
          hasChanges = true
        }
      }
      
      if (hasChanges) {
        // Clean up formatting issues
        updated = updated
          .replace(/\s+/g, ' ')  // Multiple spaces to single
          .replace(/\s+\./g, '.') // Space before period
          .replace(/\s+,/g, ',')  // Space before comma
          .trim()
        
        updates.push({
          table: 'Strategy',
          id: strategy.strategyId || strategy.id,
          name: strategy.name || 'Unnamed Strategy',
          field,
          oldValue: original,
          newValue: updated,
          removedCosts: [...new Set(removedCosts)]
        })
        
        dbUpdates[field] = updated
      }
    }
    
    // Update if changes found
    if (Object.keys(dbUpdates).length > 0 && !dryRun) {
      await prisma.riskMitigationStrategy.update({
        where: { id: strategy.id },
        data: dbUpdates
      })
    }
  }
  
  // Fix action steps
  console.log('📋 Processing ActionStep table...\n')
  const actionSteps = await prisma.actionStep.findMany({
    select: {
      id: true,
      stepId: true,
      title: true,
      smeAction: true,
      freeAlternative: true,
      lowTechOption: true,
      estimatedCostJMD: true,
      whyThisStepMatters: true,
      whatHappensIfSkipped: true
    }
  })
  
  for (const step of actionSteps) {
    const dbUpdates: any = {}
    
    const fields = [
      'smeAction',
      'freeAlternative',
      'lowTechOption',
      'estimatedCostJMD',
      'whyThisStepMatters',
      'whatHappensIfSkipped'
    ]
    
    for (const field of fields) {
      const original = step[field as keyof typeof step] as string | null
      if (!original) continue
      
      let updated = original
      let hasChanges = false
      const removedCosts: string[] = []
      
      // Apply all fix patterns with context-aware replacement  
      for (const fix of COST_PATTERNS) {
        const matches = updated.match(fix.pattern)
        if (matches) {
          removedCosts.push(...matches)
          // Replace each match with context-aware text
          for (const match of matches) {
            const replacement = getContextAwareReplacement(updated, match, field)
            updated = updated.replace(match, replacement)
          }
          hasChanges = true
        }
      }
      
      if (hasChanges) {
        updated = updated
          .replace(/\s+/g, ' ')
          .replace(/\s+\./g, '.')
          .replace(/\s+,/g, ',')
          .trim()
        
        updates.push({
          table: 'ActionStep',
          id: step.stepId || step.id,
          name: step.title || 'Unnamed Step',
          field,
          oldValue: original,
          newValue: updated,
          removedCosts: [...new Set(removedCosts)]
        })
        
        dbUpdates[field] = updated
      }
    }
    
    if (Object.keys(dbUpdates).length > 0 && !dryRun) {
      await prisma.actionStep.update({
        where: { id: step.id },
        data: dbUpdates
      })
    }
  }
  
  // Report results
  console.log('═'.repeat(80))
  console.log(`\n📊 ${dryRun ? 'Would update' : 'Updated'} ${updates.length} fields\n`)
  
  if (updates.length === 0) {
    console.log('✅ No hardcoded costs found! Database is already clean.\n')
    await prisma.$disconnect()
    return
  }
  
  // Print detailed changes
  console.log('📝 DETAILED CHANGES:\n')
  console.log('═'.repeat(80))
  
  for (const update of updates) {
    console.log(`\nTable: ${update.table}`)
    console.log(`ID: ${update.id}`)
    console.log(`Name: ${update.name}`)
    console.log(`Field: ${update.field}`)
    console.log(`Removed costs: ${update.removedCosts.join(', ')}`)
    console.log(`\nBEFORE:`)
    console.log(`  ${update.oldValue.substring(0, 150)}${update.oldValue.length > 150 ? '...' : ''}`)
    console.log(`\nAFTER:`)
    console.log(`  ${update.newValue.substring(0, 150)}${update.newValue.length > 150 ? '...' : ''}`)
    console.log('─'.repeat(80))
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    mode: dryRun ? 'DRY_RUN' : 'LIVE',
    totalUpdates: updates.length,
    updates
  }
  
  const filename = `fix-hardcoded-costs-${dryRun ? 'preview' : 'applied'}-${Date.now()}.json`
  fs.writeFileSync(filename, JSON.stringify(report, null, 2))
  
  console.log(`\n💾 Full report saved to: ${filename}\n`)
  
  if (dryRun) {
    console.log('ℹ️  This was a DRY RUN. To apply changes, run:')
    console.log('   npx tsx scripts/fix-hardcoded-costs.ts --live\n')
  } else {
    console.log('✅ Database has been updated!')
    console.log('⚠️  Review the changes in the UI to ensure quality.')
    console.log('💡 Some fields may need manual editing for better readability.\n')
  }
  
  await prisma.$disconnect()
}

// Run in dry-run mode unless --live flag is passed
const isDryRun = !process.argv.includes('--live')
fixHardcodedCosts(isDryRun).catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})


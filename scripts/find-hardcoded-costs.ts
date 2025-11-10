import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

// Regex patterns to find hardcoded costs
const COST_PATTERNS = [
  /JMD\s*\$?\s*[\d,]+(-[\d,]+)?/gi,          // JMD 300,000 or JMD $300,000
  /USD\s*\$?\s*[\d,]+(-[\d,]+)?/gi,          // USD $500
  /TTD\s*\$?\s*[\d,]+(-[\d,]+)?/gi,          // TTD $1,000
  /BBD\s*\$?\s*[\d,]+(-[\d,]+)?/gi,          // BBD $750
  /XCD\s*\$?\s*[\d,]+(-[\d,]+)?/gi,          // XCD $500
  /HTG\s*[\d,]+(-[\d,]+)?/gi,                // HTG 50,000
  /DOP\s*[\d,]+(-[\d,]+)?/gi,                // DOP 25,000
  /BSD\s*\$?\s*[\d,]+(-[\d,]+)?/gi,          // BSD $1,200
  /J\$\s*[\d,]+(-[\d,]+)?/gi,                // J$ 300,000
  /Bds\$\s*[\d,]+(-[\d,]+)?/gi,              // Bds$ 450
  /TT\$\s*[\d,]+(-[\d,]+)?/gi,               // TT$ 1,500
  /EC\$\s*[\d,]+(-[\d,]+)?/gi,               // EC$ 750
  /RD\$\s*[\d,]+(-[\d,]+)?/gi,               // RD$ 5,000
  /B\$\s*[\d,]+(-[\d,]+)?/gi,                // B$ 1,200 (Bahamas)
  /\$\s*[\d,]+(-[\d,]+)?(?!\w)/gi,          // $1,500 or $1,500-3,000 (not followed by word)
]

interface HardcodedCostMatch {
  table: 'Strategy' | 'ActionStep'
  id: string
  recordName: string
  field: string
  content: string
  matches: string[]
}

async function findHardcodedCosts() {
  console.log('🔍 Searching for hardcoded costs in database...\n')
  
  const issues: HardcodedCostMatch[] = []
  
  // Search in RiskMitigationStrategy table
  console.log('📋 Scanning RiskMitigationStrategy table...')
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
    const fields = [
      { name: 'realWorldExample', value: strategy.realWorldExample },
      { name: 'lowBudgetAlternative', value: strategy.lowBudgetAlternative },
      { name: 'diyApproach', value: strategy.diyApproach },
      { name: 'estimatedDIYSavings', value: strategy.estimatedDIYSavings },
      { name: 'costEstimateJMD', value: strategy.costEstimateJMD }
    ]
    
    for (const field of fields) {
      if (!field.value) continue
      
      const matches: string[] = []
      for (const pattern of COST_PATTERNS) {
        const found = field.value.match(pattern)
        if (found) {
          matches.push(...found)
        }
      }
      
      if (matches.length > 0) {
        issues.push({
          table: 'Strategy',
          id: strategy.strategyId || strategy.id,
          recordName: strategy.name || 'Unnamed Strategy',
          field: field.name,
          content: field.value,
          matches: [...new Set(matches)] // unique matches
        })
      }
    }
  }
  
  // Search in ActionStep table
  console.log('📋 Scanning ActionStep table...')
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
    const fields = [
      { name: 'smeAction', value: step.smeAction },
      { name: 'freeAlternative', value: step.freeAlternative },
      { name: 'lowTechOption', value: step.lowTechOption },
      { name: 'estimatedCostJMD', value: step.estimatedCostJMD },
      { name: 'whyThisStepMatters', value: step.whyThisStepMatters },
      { name: 'whatHappensIfSkipped', value: step.whatHappensIfSkipped }
    ]
    
    for (const field of fields) {
      if (!field.value) continue
      
      const matches: string[] = []
      for (const pattern of COST_PATTERNS) {
        const found = field.value.match(pattern)
        if (found) {
          matches.push(...found)
        }
      }
      
      if (matches.length > 0) {
        issues.push({
          table: 'ActionStep',
          id: step.stepId || step.id,
          recordName: step.title || 'Unnamed Step',
          field: field.name,
          content: field.value,
          matches: [...new Set(matches)]
        })
      }
    }
  }
  
  // Report findings
  console.log(`\n📊 Found ${issues.length} fields with hardcoded costs\n`)
  
  if (issues.length === 0) {
    console.log('✅ No hardcoded costs found! Database is clean.\n')
    await prisma.$disconnect()
    return
  }
  
  // Group by table and field
  const byTable = issues.reduce((acc, issue) => {
    if (!acc[issue.table]) acc[issue.table] = {}
    if (!acc[issue.table][issue.field]) acc[issue.table][issue.field] = []
    acc[issue.table][issue.field].push(issue)
    return acc
  }, {} as Record<string, Record<string, HardcodedCostMatch[]>>)
  
  // Print summary
  console.log('📋 SUMMARY BY TABLE AND FIELD:\n')
  for (const [table, fields] of Object.entries(byTable)) {
    console.log(`${table}:`)
    for (const [fieldName, items] of Object.entries(fields)) {
      console.log(`  ${fieldName}: ${items.length} occurrences`)
    }
    console.log()
  }
  
  // Count by currency type
  const byCurrency: Record<string, number> = {}
  for (const issue of issues) {
    for (const match of issue.matches) {
      const currency = match.match(/^[A-Z]{3}|^[A-Z]+\$/)?.[0] || '$'
      byCurrency[currency] = (byCurrency[currency] || 0) + 1
    }
  }
  
  console.log('💰 CURRENCY BREAKDOWN:\n')
  for (const [currency, count] of Object.entries(byCurrency).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${currency}: ${count} occurrences`)
  }
  
  // Print detailed findings
  console.log('\n\n📝 DETAILED FINDINGS:\n')
  console.log('═'.repeat(80))
  
  for (const issue of issues) {
    console.log(`\nTable: ${issue.table}`)
    console.log(`ID: ${issue.id}`)
    console.log(`Name: ${issue.recordName}`)
    console.log(`Field: ${issue.field}`)
    console.log(`Hardcoded costs: ${issue.matches.join(', ')}`)
    console.log(`\nContent:`)
    console.log(`  ${issue.content.substring(0, 200)}${issue.content.length > 200 ? '...' : ''}`)
    console.log('─'.repeat(80))
  }
  
  // Export to JSON for reference
  const report = {
    timestamp: new Date().toISOString(),
    totalIssues: issues.length,
    summary: byTable,
    currencyBreakdown: byCurrency,
    details: issues
  }
  
  fs.writeFileSync(
    'hardcoded-costs-report.json',
    JSON.stringify(report, null, 2)
  )
  
  console.log('\n💾 Full report saved to: hardcoded-costs-report.json')
  console.log('📄 Import this file into a spreadsheet for tracking manual fixes\n')
  
  await prisma.$disconnect()
}

findHardcodedCosts().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})






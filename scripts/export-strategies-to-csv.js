const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// Helper to parse multilingual JSON or return plain string
function parseMultilingual(value) {
  if (!value) return { en: '', es: '', fr: '' }
  
  try {
    const parsed = JSON.parse(value)
    if (parsed.en !== undefined || parsed.es !== undefined || parsed.fr !== undefined) {
      return {
        en: parsed.en || '',
        es: parsed.es || '',
        fr: parsed.fr || ''
      }
    }
  } catch {}
  
  // Plain string - treat as English only
  return { en: value, es: '', fr: '' }
}

// Helper to parse multilingual array
function parseMultilingualArray(value) {
  if (!value) return { en: [], es: [], fr: [] }
  
  try {
    const parsed = JSON.parse(value)
    
    // Check if multilingual format
    if (parsed.en || parsed.es || parsed.fr) {
      return {
        en: Array.isArray(parsed.en) ? parsed.en : [],
        es: Array.isArray(parsed.es) ? parsed.es : [],
        fr: Array.isArray(parsed.fr) ? parsed.fr : []
      }
    }
    
    // Plain array - treat as English only
    if (Array.isArray(parsed)) {
      return { en: parsed, es: [], fr: [] }
    }
  } catch {}
  
  return { en: [], es: [], fr: [] }
}

// Escape CSV values
function escapeCsv(value) {
  if (!value) return ''
  const str = String(value)
  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

async function exportStrategies() {
  console.log('📊 Exporting strategies to CSV...\n')
  
  // Fetch all strategies with action steps
  const strategies = await prisma.riskMitigationStrategy.findMany({
    include: {
      actionSteps: {
        orderBy: { sortOrder: 'asc' }
      }
    },
    orderBy: { strategyId: 'asc' }
  })
  
  console.log(`Found ${strategies.length} strategies\n`)
  
  // === STRATEGY CSV ===
  const strategyCsvLines = []
  
  // Header
  strategyCsvLines.push([
    'strategyId',
    'name',
    'category',
    'smeTitle_EN',
    'smeTitle_ES',
    'smeTitle_FR',
    'smeSummary_EN',
    'smeSummary_ES',
    'smeSummary_FR',
    'realWorldExample_EN',
    'realWorldExample_ES',
    'realWorldExample_FR',
    'lowBudgetAlternative_EN',
    'lowBudgetAlternative_ES',
    'lowBudgetAlternative_FR',
    'diyApproach_EN',
    'diyApproach_ES',
    'diyApproach_FR',
    'benefitsBullets_EN',
    'benefitsBullets_ES',
    'benefitsBullets_FR',
    'helpfulTips_EN',
    'helpfulTips_ES',
    'helpfulTips_FR',
    'commonMistakes_EN',
    'commonMistakes_ES',
    'commonMistakes_FR',
    'successMetrics_EN',
    'successMetrics_ES',
    'successMetrics_FR',
    'implementationCost',
    'costEstimateJMD',
    'effectiveness',
    'priority',
    'selectionTier'
  ].map(escapeCsv).join(','))
  
  // Data rows
  for (const strategy of strategies) {
    const smeTitle = parseMultilingual(strategy.smeTitle)
    const smeSummary = parseMultilingual(strategy.smeSummary)
    const realWorldExample = parseMultilingual(strategy.realWorldExample)
    const lowBudget = parseMultilingual(strategy.lowBudgetAlternative)
    const diy = parseMultilingual(strategy.diyApproach)
    
    const benefits = parseMultilingualArray(strategy.benefitsBullets)
    const tips = parseMultilingualArray(strategy.helpfulTips)
    const mistakes = parseMultilingualArray(strategy.commonMistakes)
    const metrics = parseMultilingualArray(strategy.successMetrics)
    
    strategyCsvLines.push([
      strategy.strategyId,
      strategy.name,
      strategy.category,
      smeTitle.en,
      smeTitle.es,
      smeTitle.fr,
      smeSummary.en,
      smeSummary.es,
      smeSummary.fr,
      realWorldExample.en,
      realWorldExample.es,
      realWorldExample.fr,
      lowBudget.en,
      lowBudget.es,
      lowBudget.fr,
      diy.en,
      diy.es,
      diy.fr,
      benefits.en.join(' | '),
      benefits.es.join(' | '),
      benefits.fr.join(' | '),
      tips.en.join(' | '),
      tips.es.join(' | '),
      tips.fr.join(' | '),
      mistakes.en.join(' | '),
      mistakes.es.join(' | '),
      mistakes.fr.join(' | '),
      metrics.en.join(' | '),
      metrics.es.join(' | '),
      metrics.fr.join(' | '),
      strategy.implementationCost,
      strategy.costEstimateJMD,
      strategy.effectiveness,
      strategy.priority,
      strategy.selectionTier
    ].map(escapeCsv).join(','))
  }
  
  // Write strategy CSV
  const strategyPath = path.join(process.cwd(), 'data', 'strategies-export.csv')
  fs.mkdirSync(path.dirname(strategyPath), { recursive: true })
  fs.writeFileSync(strategyPath, strategyCsvLines.join('\n'), 'utf8')
  console.log(`✅ Exported ${strategies.length} strategies to: ${strategyPath}`)
  
  // === ACTION STEPS CSV ===
  const actionStepCsvLines = []
  
  // Header
  actionStepCsvLines.push([
    'stepId',
    'strategyId',
    'phase',
    'sortOrder',
    'title_EN',
    'title_ES',
    'title_FR',
    'description_EN',
    'description_ES',
    'description_FR',
    'whyThisStepMatters_EN',
    'whyThisStepMatters_ES',
    'whyThisStepMatters_FR',
    'whatHappensIfSkipped_EN',
    'whatHappensIfSkipped_ES',
    'whatHappensIfSkipped_FR',
    'howToKnowItsDone_EN',
    'howToKnowItsDone_ES',
    'howToKnowItsDone_FR',
    'exampleOutput_EN',
    'exampleOutput_ES',
    'exampleOutput_FR',
    'freeAlternative_EN',
    'freeAlternative_ES',
    'freeAlternative_FR',
    'lowTechOption_EN',
    'lowTechOption_ES',
    'lowTechOption_FR',
    'commonMistakesForStep_EN',
    'commonMistakesForStep_ES',
    'commonMistakesForStep_FR',
    'estimatedMinutes',
    'difficultyLevel'
  ].map(escapeCsv).join(','))
  
  // Data rows
  let totalSteps = 0
  for (const strategy of strategies) {
    for (const step of strategy.actionSteps) {
      const title = parseMultilingual(step.title)
      const description = parseMultilingual(step.description)
      const whyMatters = parseMultilingual(step.whyThisStepMatters)
      const ifSkipped = parseMultilingual(step.whatHappensIfSkipped)
      const howDone = parseMultilingual(step.howToKnowItsDone)
      const exampleOut = parseMultilingual(step.exampleOutput)
      const freeAlt = parseMultilingual(step.freeAlternative)
      const lowTech = parseMultilingual(step.lowTechOption)
      const stepMistakes = parseMultilingualArray(step.commonMistakesForStep)
      
      actionStepCsvLines.push([
        step.stepId,
        strategy.strategyId,
        step.phase,
        step.sortOrder || 0,
        title.en,
        title.es,
        title.fr,
        description.en,
        description.es,
        description.fr,
        whyMatters.en,
        whyMatters.es,
        whyMatters.fr,
        ifSkipped.en,
        ifSkipped.es,
        ifSkipped.fr,
        howDone.en,
        howDone.es,
        howDone.fr,
        exampleOut.en,
        exampleOut.es,
        exampleOut.fr,
        freeAlt.en,
        freeAlt.es,
        freeAlt.fr,
        lowTech.en,
        lowTech.es,
        lowTech.fr,
        stepMistakes.en.join(' | '),
        stepMistakes.es.join(' | '),
        stepMistakes.fr.join(' | '),
        step.estimatedMinutes,
        step.difficultyLevel
      ].map(escapeCsv).join(','))
      
      totalSteps++
    }
  }
  
  // Write action steps CSV
  const actionStepsPath = path.join(process.cwd(), 'data', 'action-steps-export.csv')
  fs.writeFileSync(actionStepsPath, actionStepCsvLines.join('\n'), 'utf8')
  console.log(`✅ Exported ${totalSteps} action steps to: ${actionStepsPath}`)
  
  console.log('\n📊 Export complete!')
  console.log('\n💡 Usage:')
  console.log('  1. Open CSV files in Excel/Google Sheets')
  console.log('  2. Edit translations in ES and FR columns')
  console.log('  3. For array fields (benefits, tips, etc.), separate items with " | "')
  console.log('  4. Save and run import-strategies-from-csv.js to update database')
  
  await prisma.$disconnect()
}

exportStrategies().catch((error) => {
  console.error('Export failed:', error)
  prisma.$disconnect()
  process.exit(1)
})















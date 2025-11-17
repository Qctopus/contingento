import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to parse multilingual JSON
function parseMultilingual(value: any): Record<'en' | 'es' | 'fr', string> {
  if (!value) return { en: '', es: '', fr: '' }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object') {
        return { en: parsed.en || '', es: parsed.es || '', fr: parsed.fr || '' }
      }
      return { en: value, es: '', fr: '' }
    } catch {
      return { en: value, es: '', fr: '' }
    }
  }
  return value || { en: '', es: '', fr: '' }
}

// Helper to create multilingual JSON string
const ml = (en: string, es: string, fr: string) => JSON.stringify({ en, es, fr })

// Helper to create multilingual array JSON string
const mlArray = (items: Array<{ en: string; es: string; fr: string }>) => {
  return JSON.stringify({
    en: items.map(i => i.en),
    es: items.map(i => i.es),
    fr: items.map(i => i.fr)
  })
}

// Check if text is dummy/placeholder
function isDummyText(text: string): boolean {
  if (!text) return true
  const lower = text.toLowerCase()
  
  // Legitimate step titles that contain "step" but aren't dummy
  const legitimatePatterns = [
    'install',
    'set up',
    'create',
    'test',
    'maintain',
    'secure',
    'protect',
    'prepare',
    'document',
    'elevate',
    'configure',
    'establish'
  ]
  
  // If it contains legitimate action words, it's probably real
  if (legitimatePatterns.some(pattern => lower.includes(pattern))) {
    return false
  }
  
  const dummyPatterns = [
    'placeholder',
    'dummy',
    'example text',
    'lorem ipsum',
    'todo:',
    'tbd:',
    'to be determined',
    'coming soon',
    'data backup step 1',
    'data backup step 2',
    'communication step 1',
    'communication step 2',
    'action step' // Only if it's JUST "action step" without other context
  ]
  
  // Check if it matches dummy patterns AND is short/obviously placeholder
  const matchesDummy = dummyPatterns.some(pattern => lower === pattern || lower.includes(pattern))
  return matchesDummy && text.length < 80
}

// Check if action step needs updating
function needsUpdate(step: any): {
  needsUpdate: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  
  const title = parseMultilingual(step.title)
  const description = parseMultilingual(step.description)
  const smeAction = parseMultilingual(step.smeAction)
  
  // Check for dummy text
  if (isDummyText(title.en) || isDummyText(description.en)) {
    reasons.push('Contains dummy/placeholder text')
  }
  
  // Check for missing multilingual content
  if (!title.es || !title.fr || !description.es || !description.fr) {
    reasons.push('Missing multilingual content (ES/FR)')
  }
  
  // Check for missing guidance fields
  if (!step.whyThisStepMatters) reasons.push('Missing whyThisStepMatters')
  if (!step.whatHappensIfSkipped) reasons.push('Missing whatHappensIfSkipped')
  if (!step.howToKnowItsDone) reasons.push('Missing howToKnowItsDone')
  if (!step.resources) reasons.push('Missing resources')
  if (!step.timeframe) reasons.push('Missing timeframe')
  if (!step.difficultyLevel) reasons.push('Missing difficultyLevel')
  if (!step.responsibility) reasons.push('Missing responsibility')
  
  // Check for wrong phase
  if (!['before', 'during', 'after'].includes(step.phase)) {
    reasons.push(`Wrong phase: ${step.phase} (should be before/during/after)`)
  }
  
  return {
    needsUpdate: reasons.length > 0,
    reasons
  }
}

// Check if strategy needs updating
function strategyNeedsUpdate(strategy: any): {
  needsUpdate: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  
  const name = parseMultilingual(strategy.name)
  const description = parseMultilingual(strategy.description)
  
  // Check for missing multilingual content
  if (!name.es || !name.fr || !description.es || !description.fr) {
    reasons.push('Missing multilingual content (ES/FR)')
  }
  
  // Check for missing guidance fields
  if (!strategy.smeTitle) reasons.push('Missing smeTitle')
  if (!strategy.smeSummary) reasons.push('Missing smeSummary')
  if (!strategy.benefitsBullets) reasons.push('Missing benefitsBullets')
  if (!strategy.realWorldExample) reasons.push('Missing realWorldExample')
  if (!strategy.helpfulTips) reasons.push('Missing helpfulTips')
  if (!strategy.commonMistakes) reasons.push('Missing commonMistakes')
  if (!strategy.successMetrics) reasons.push('Missing successMetrics')
  if (!strategy.lowBudgetAlternative) reasons.push('Missing lowBudgetAlternative')
  
  // Check for missing action steps
  if (strategy.actionSteps.length === 0) {
    reasons.push('No action steps')
  }
  
  // Check action steps for cost items
  const stepsWithoutCosts = strategy.actionSteps.filter((step: any) => 
    !step.itemCosts || step.itemCosts.length === 0
  )
  if (stepsWithoutCosts.length > 0) {
    reasons.push(`${stepsWithoutCosts.length} action step(s) without cost items`)
  }
  
  return {
    needsUpdate: reasons.length > 0,
    reasons
  }
}

async function auditStrategies() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   STRATEGY AUDIT & UPDATE SCRIPT                             ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')
  
  try {
    // Get all strategies with their action steps and cost items
    const strategies = await prisma.riskMitigationStrategy.findMany({
      where: { isActive: true },
      include: {
        actionSteps: {
          where: { isActive: true },
          include: {
            itemCosts: {
              include: {
                item: true
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    console.log(`📊 Found ${strategies.length} strategies to audit\n`)
    console.log('═'.repeat(65))
    console.log('')
    
    let strategiesNeedingUpdate = 0
    let stepsNeedingUpdate = 0
    const issues: Array<{ strategy: string; step?: string; issues: string[] }> = []
    
    for (const strategy of strategies) {
      const name = parseMultilingual(strategy.name)
      const strategyCheck = strategyNeedsUpdate(strategy)
      
      if (strategyCheck.needsUpdate) {
        strategiesNeedingUpdate++
        issues.push({
          strategy: name.en || strategy.strategyId,
          issues: strategyCheck.reasons
        })
        console.log(`⚠️  Strategy: ${name.en || strategy.strategyId}`)
        console.log(`   Issues: ${strategyCheck.reasons.join(', ')}`)
        console.log(`   Action Steps: ${strategy.actionSteps.length}`)
        console.log('')
      }
      
      // Check each action step
      for (const step of strategy.actionSteps) {
        const stepCheck = needsUpdate(step)
        if (stepCheck.needsUpdate) {
          stepsNeedingUpdate++
          const stepTitle = parseMultilingual(step.title)
          issues.push({
            strategy: name.en || strategy.strategyId,
            step: stepTitle.en || step.stepId,
            issues: stepCheck.reasons
          })
          console.log(`   ⚠️  Step: ${stepTitle.en || step.stepId}`)
          console.log(`      Issues: ${stepCheck.reasons.join(', ')}`)
          console.log(`      Cost Items: ${step.itemCosts?.length || 0}`)
          console.log('')
        }
      }
    }
    
    console.log('═'.repeat(65))
    console.log('')
    console.log(`📈 Summary:`)
    console.log(`   Total Strategies: ${strategies.length}`)
    console.log(`   Strategies Needing Update: ${strategiesNeedingUpdate}`)
    console.log(`   Action Steps Needing Update: ${stepsNeedingUpdate}`)
    console.log(`   Total Issues Found: ${issues.length}`)
    console.log('')
    
    // Show detailed breakdown
    if (issues.length > 0) {
      console.log('📋 Detailed Issues:')
      console.log('')
      
      const strategyIssues = issues.filter(i => !i.step)
      const stepIssues = issues.filter(i => i.step)
      
      if (strategyIssues.length > 0) {
        console.log('Strategies:')
        strategyIssues.forEach(issue => {
          console.log(`  • ${issue.strategy}`)
          issue.issues.forEach(i => console.log(`    - ${i}`))
        })
        console.log('')
      }
      
      if (stepIssues.length > 0) {
        console.log('Action Steps:')
        stepIssues.forEach(issue => {
          console.log(`  • ${issue.strategy} > ${issue.step}`)
          issue.issues.forEach(i => console.log(`    - ${i}`))
        })
        console.log('')
      }
    }
    
    return { strategies, issues, strategiesNeedingUpdate, stepsNeedingUpdate }
    
  } catch (error) {
    console.error('\n❌ Error during audit:')
    console.error(error)
    throw error
  }
}

async function main() {
  try {
    const auditResult = await auditStrategies()
    
    console.log('═'.repeat(65))
    console.log('✅ Audit complete!')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Review the issues above')
    console.log('  2. Run update script to fix issues automatically')
    console.log('  3. Or manually update strategies through admin interface')
    console.log('')
    
  } catch (error) {
    console.error('\n❌ Fatal error:')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export { auditStrategies, needsUpdate, strategyNeedsUpdate }


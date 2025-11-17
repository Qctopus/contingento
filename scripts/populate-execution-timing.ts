import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Keywords that indicate DURING crisis actions
const DURING_KEYWORDS = [
  'activate', 'immediately', 'when occurs', 'during emergency',
  'if struck', 'upon notification', 'as soon as', 'first response',
  'evacuate', 'secure', 'emergency procedures', 'alert team',
  'when happens', 'if emergency', 'during crisis', 'during disaster',
  'when storm', 'when fire', 'when flood', 'when earthquake',
  'call 911', 'call emergency', 'emergency services', 'first responders',
  'take shelter', 'seek shelter', 'move to', 'go to safe',
  'turn off', 'shut off', 'switch to', 'use backup',
  'monitor', 'watch for', 'stay alert', 'listen for'
]

// Keywords that indicate AFTER crisis actions
const AFTER_KEYWORDS = [
  'after', 'assess damage', 'file claim', 'recovery',
  'restore', 'rebuild', 'resume operations', 'repair',
  'clean up', 'replace', 'investigate', 'debrief',
  'lessons learned', 'post-incident', 'document damage',
  'contact insurance', 'insurance claim', 'claim form',
  'reopen', 'reopening', 're-open', 'inspect for damage',
  'photograph damage', 'take photos', 'document',
  'notify customers', 'inform clients', 'update stakeholders'
]

// Keywords that indicate BEFORE crisis actions (default for prevention)
const BEFORE_KEYWORDS = [
  'install', 'purchase', 'buy', 'set up', 'establish',
  'create', 'develop', 'train', 'prepare', 'plan',
  'before', 'advance', 'proactive', 'prevention',
  'maintenance', 'regular', 'schedule', 'practice',
  'drill', 'test', 'review', 'update', 'identify',
  'designate', 'assign', 'document', 'establish procedures'
]

async function populateExecutionTiming() {
  console.log('🚀 Starting execution timing population...\n')
  
  const strategies = await prisma.riskMitigationStrategy.findMany({
    where: { isActive: true },
    include: { 
      actionSteps: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  })
  
  console.log(`📊 Found ${strategies.length} active strategies\n`)
  
  let updated = 0
  let alreadySet = 0
  let byTiming = {
    before_crisis: 0,
    during_crisis: 0,
    after_crisis: 0
  }
  
  for (const strategy of strategies) {
    console.log(`\n📋 Strategy: ${strategy.name}`)
    console.log(`   Category: ${strategy.category}`)
    console.log(`   Steps: ${strategy.actionSteps.length}`)
    
    if (strategy.actionSteps.length === 0) {
      console.log('   ⚠️  No action steps to process')
      continue
    }
    
    for (const step of strategy.actionSteps) {
      // Skip if already set
      if (step.executionTiming) {
        console.log(`   ⏭️  ${step.stepId}: Already set to ${step.executionTiming}`)
        alreadySet++
        continue
      }
      
      const stepPhase = (step.phase || '').toLowerCase()
      const strategyCategory = (strategy.category || '').toLowerCase()
      const smeAction = (step.smeAction || '').toLowerCase()
      const description = (step.description || '').toLowerCase()
      
      const textToCheck = `${smeAction} ${description}`
      
      let executionTiming: string
      
      // PRIORITY 1: Check for DURING keywords (highest priority)
      if (
        DURING_KEYWORDS.some(keyword => textToCheck.includes(keyword)) ||
        (strategyCategory === 'response' && stepPhase === 'immediate')
      ) {
        executionTiming = 'during_crisis'
      }
      // PRIORITY 2: Check for AFTER keywords
      else if (
        AFTER_KEYWORDS.some(keyword => textToCheck.includes(keyword)) ||
        strategyCategory === 'recovery'
      ) {
        executionTiming = 'after_crisis'
      }
      // PRIORITY 3: Default to BEFORE (preparation)
      else {
        executionTiming = 'before_crisis'
      }
      
      // Update the step
      await prisma.actionStep.update({
        where: { id: step.id },
        data: { executionTiming }
      })
      
      byTiming[executionTiming as keyof typeof byTiming]++
      updated++
      
      console.log(`   ✅ ${step.stepId}: ${executionTiming}`)
      console.log(`      Action: ${(step.smeAction || step.description)?.substring(0, 60)}...`)
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ MIGRATION COMPLETE')
  console.log('='.repeat(60))
  console.log(`\n📊 Summary:`)
  console.log(`   Updated: ${updated} action steps`)
  console.log(`   Already set: ${alreadySet} action steps`)
  console.log(`\n⏰ Timing breakdown:`)
  console.log(`   🛡️  BEFORE Crisis: ${byTiming.before_crisis} steps`)
  console.log(`   🚨 DURING Crisis: ${byTiming.during_crisis} steps`)
  console.log(`   🔄 AFTER Crisis: ${byTiming.after_crisis} steps`)
  
  // Show strategies with no DURING actions (potential gaps)
  console.log('\n⚠️  Strategies needing DURING actions:')
  for (const strategy of strategies) {
    const duringCount = strategy.actionSteps.filter(s => 
      s.executionTiming === 'during_crisis'
    ).length
    
    if (duringCount === 0 && strategy.actionSteps.length > 0) {
      console.log(`   ❌ ${strategy.name} (${strategy.actionSteps.length} steps, 0 DURING)`)
    }
  }
  
  console.log('\n✅ Done!')
}

populateExecutionTiming()
  .catch(console.error)
  .finally(() => prisma.$disconnect())











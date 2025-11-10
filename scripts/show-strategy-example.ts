/**
 * Show Example Strategy with Full Content
 * Demonstrates what the improved data looks like
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function showExample() {
  console.log('📋 EXAMPLE: Emergency Response Plan Strategy\n')
  console.log('='.repeat(70))
  
  const strategy = await prisma.riskMitigationStrategy.findUnique({
    where: { strategyId: 'emergency_response_plan' },
    include: {
      actionSteps: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }
    }
  })
  
  if (!strategy) {
    console.log('Strategy not found')
    return
  }
  
  console.log('\n🎯 STRATEGY DETAILS')
  console.log('-'.repeat(70))
  console.log(`Name: ${strategy.name}`)
  console.log(`SME Title: ${strategy.smeTitle}`)
  console.log(`Category: ${strategy.category}`)
  console.log(`Selection Tier: ${strategy.selectionTier}`)
  console.log(`\nSummary: ${strategy.smeSummary}`)
  
  console.log('\n\n📝 ACTION STEPS')
  console.log('-'.repeat(70))
  
  for (const step of strategy.actionSteps) {
    console.log(`\n[${step.sortOrder}] ${step.stepId}`)
    console.log(`    Execution Timing: ${step.executionTiming}`)
    console.log(`    Title: ${step.title}`)
    console.log(`    \n    SME Action:\n    ${step.smeAction?.substring(0, 200)}...`)
    console.log(`    \n    Why This Matters: ${step.whyThisStepMatters?.substring(0, 150)}...`)
    console.log(`    \n    What Happens If Skipped: ${step.whatHappensIfSkipped?.substring(0, 150)}...`)
    console.log(`    \n    Timeframe: ${step.timeframe}`)
    console.log(`    Estimated Minutes: ${step.estimatedMinutes}`)
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('✅ This strategy will appear in the DURING section of Action Workbook')
  console.log('='.repeat(70))
  
  await prisma.$disconnect()
}

showExample()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })


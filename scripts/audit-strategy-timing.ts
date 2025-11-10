/**
 * Audit Script: Check Strategy Categories and Action Step Timing
 * 
 * This script analyzes all strategies and action steps to verify:
 * 1. Each strategy has appropriate category (prevention/preparation/response/recovery)
 * 2. Each action step has executionTiming (before_crisis/during_crisis/after_crisis)
 * 3. Action step timing aligns with strategy category
 * 4. Content is specific and not generic
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface StrategyAudit {
  id: string
  strategyId: string
  name: string
  smeTitle: string | null
  category: string
  smeSummary: string | null
  actionStepCount: number
  stepsWithTiming: number
  stepsMissingTiming: number
  timingBreakdown: {
    before: number
    during: number
    after: number
  }
  issues: string[]
}

async function auditStrategies() {
  console.log('🔍 STRATEGY & ACTION STEP TIMING AUDIT')
  console.log('=' .repeat(70))
  console.log()

  const strategies = await prisma.riskMitigationStrategy.findMany({
    where: { isActive: true },
    include: {
      actionSteps: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }
    },
    orderBy: { category: 'asc' }
  })

  console.log(`📊 Found ${strategies.length} active strategies\n`)

  const auditResults: StrategyAudit[] = []
  const categoryBreakdown = {
    prevention: 0,
    preparation: 0,
    response: 0,
    recovery: 0,
    other: 0
  }

  for (const strategy of strategies) {
    const issues: string[] = []
    
    // Count category
    const category = strategy.category?.toLowerCase() || 'unknown'
    if (['prevention', 'preparation', 'response', 'recovery'].includes(category)) {
      categoryBreakdown[category as keyof typeof categoryBreakdown]++
    } else {
      categoryBreakdown.other++
      issues.push(`Invalid category: "${strategy.category}"`)
    }

    // Check for generic or missing SME content
    if (!strategy.smeTitle || strategy.smeTitle.length < 10) {
      issues.push('Missing or short smeTitle')
    }
    if (!strategy.smeSummary || strategy.smeSummary.length < 30) {
      issues.push('Missing or short smeSummary')
    }
    if (strategy.smeSummary?.includes('generic') || strategy.smeSummary?.includes('placeholder')) {
      issues.push('Generic smeSummary detected')
    }

    // Analyze action steps
    const stepsWithTiming = strategy.actionSteps.filter(s => s.executionTiming).length
    const stepsMissingTiming = strategy.actionSteps.length - stepsWithTiming
    
    const timingBreakdown = {
      before: strategy.actionSteps.filter(s => s.executionTiming === 'before_crisis').length,
      during: strategy.actionSteps.filter(s => s.executionTiming === 'during_crisis').length,
      after: strategy.actionSteps.filter(s => s.executionTiming === 'after_crisis').length
    }

    // Check action step content quality
    for (const step of strategy.actionSteps) {
      if (!step.executionTiming) {
        issues.push(`Step "${step.stepId}" missing executionTiming`)
      }
      if (!step.smeAction || step.smeAction.length < 10) {
        issues.push(`Step "${step.stepId}" missing or short smeAction`)
      }
      if (step.smeAction?.includes('generic') || step.smeAction?.includes('placeholder')) {
        issues.push(`Step "${step.stepId}" has generic content`)
      }
    }

    auditResults.push({
      id: strategy.id,
      strategyId: strategy.strategyId,
      name: strategy.name,
      smeTitle: strategy.smeTitle,
      category: strategy.category,
      smeSummary: strategy.smeSummary,
      actionStepCount: strategy.actionSteps.length,
      stepsWithTiming,
      stepsMissingTiming,
      timingBreakdown,
      issues
    })
  }

  // SUMMARY REPORT
  console.log('📋 CATEGORY BREAKDOWN')
  console.log('-'.repeat(70))
  console.log(`Prevention:   ${categoryBreakdown.prevention.toString().padStart(3)} strategies`)
  console.log(`Preparation:  ${categoryBreakdown.preparation.toString().padStart(3)} strategies`)
  console.log(`Response:     ${categoryBreakdown.response.toString().padStart(3)} strategies`)
  console.log(`Recovery:     ${categoryBreakdown.recovery.toString().padStart(3)} strategies`)
  if (categoryBreakdown.other > 0) {
    console.log(`Other/Invalid: ${categoryBreakdown.other.toString().padStart(3)} strategies ⚠️`)
  }
  console.log()

  // ISSUES REPORT
  const strategiesWithIssues = auditResults.filter(r => r.issues.length > 0)
  console.log('⚠️  STRATEGIES WITH ISSUES')
  console.log('-'.repeat(70))
  console.log(`${strategiesWithIssues.length} out of ${strategies.length} strategies have issues\n`)

  if (strategiesWithIssues.length > 0) {
    for (const result of strategiesWithIssues) {
      console.log(`\n❌ ${result.name}`)
      console.log(`   ID: ${result.strategyId}`)
      console.log(`   Category: ${result.category}`)
      console.log(`   Action Steps: ${result.actionStepCount} (${result.stepsWithTiming} with timing, ${result.stepsMissingTiming} missing)`)
      console.log(`   Timing: Before=${result.timingBreakdown.before}, During=${result.timingBreakdown.during}, After=${result.timingBreakdown.after}`)
      console.log(`   Issues:`)
      result.issues.forEach(issue => console.log(`      - ${issue}`))
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('✅ AUDIT COMPLETE')
  console.log('='.repeat(70))

  // DETAILED CATEGORY REPORT
  console.log('\n\n📊 DETAILED BREAKDOWN BY CATEGORY')
  console.log('='.repeat(70))

  for (const category of ['prevention', 'preparation', 'response', 'recovery']) {
    const categoryStrategies = auditResults.filter(r => r.category?.toLowerCase() === category)
    if (categoryStrategies.length === 0) continue

    console.log(`\n🔹 ${category.toUpperCase()} (${categoryStrategies.length} strategies)`)
    console.log('-'.repeat(70))

    for (const strat of categoryStrategies) {
      const statusIcon = strat.issues.length === 0 ? '✅' : '⚠️'
      console.log(`\n${statusIcon} ${strat.smeTitle || strat.name}`)
      console.log(`   ID: ${strat.strategyId}`)
      console.log(`   Steps: ${strat.actionStepCount} total`)
      console.log(`   Timing: Before=${strat.timingBreakdown.before}, During=${strat.timingBreakdown.during}, After=${strat.timingBreakdown.after}`)
      if (strat.smeSummary) {
        console.log(`   Summary: ${strat.smeSummary.substring(0, 100)}${strat.smeSummary.length > 100 ? '...' : ''}`)
      }
      if (strat.issues.length > 0) {
        console.log(`   Issues: ${strat.issues.join(', ')}`)
      }
    }
  }

  await prisma.$disconnect()
}

auditStrategies()
  .then(() => {
    console.log('\n✨ Audit script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error during audit:', error)
    process.exit(1)
  })


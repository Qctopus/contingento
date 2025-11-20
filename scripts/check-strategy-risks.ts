import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkStrategyRisks() {
  console.log('🔍 Checking Strategy Risk Assignments...\n')

  const strategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      strategyId: true,
      name: true,
      applicableRisks: true,
      _count: {
        select: {
          actionSteps: true
        }
      }
    },
    orderBy: {
      strategyId: 'asc'
    }
  })

  console.log('📋 Strategy Risk Coverage Analysis:')
  console.log('═'.repeat(80))

  // Check for missing applicableRisks
  const missingRisks = []
  const duplicatePowerStrategies = []

  strategies.forEach(strategy => {
    const name = JSON.parse(strategy.name as string).en || 'Unknown'
    const applicableRisks = strategy.applicableRisks ? JSON.parse(strategy.applicableRisks as string) : []

    console.log(`\n🎯 ${strategy.strategyId}`)
    console.log(`   Name: ${name}`)
    console.log(`   Action Steps: ${strategy._count.actionSteps}`)

    if (applicableRisks.length === 0) {
      console.log(`   ❌ NO RISKS ASSIGNED!`)
      missingRisks.push(strategy.strategyId)
    } else {
      console.log(`   ✅ Risks: ${applicableRisks.join(', ')}`)
    }

    // Check for duplicate power strategies
    if (strategy.strategyId.includes('power')) {
      duplicatePowerStrategies.push({
        id: strategy.strategyId,
        name,
        steps: strategy._count.actionSteps,
        risks: applicableRisks
      })
    }
  })

  console.log('\n' + '═'.repeat(80))
  console.log('🚨 ISSUES FOUND:')
  console.log('═'.repeat(80))

  // Report missing risks
  if (missingRisks.length > 0) {
    console.log(`\n❌ STRATEGIES WITH NO RISK ASSIGNMENT (${missingRisks.length}):`)
    missingRisks.forEach(id => console.log(`   ✗ ${id}`))
  } else {
    console.log(`\n✅ All strategies have risk assignments`)
  }

  // Report duplicate power strategies
  if (duplicatePowerStrategies.length > 1) {
    console.log(`\n⚡ DUPLICATE POWER STRATEGIES (${duplicatePowerStrategies.length}):`)
    duplicatePowerStrategies.forEach(strategy => {
      console.log(`   • ${strategy.id}: ${strategy.name} (${strategy.steps} steps)`)
      console.log(`     Risks: ${strategy.risks.join(', ')}`)
    })
    console.log(`\n💡 RECOMMENDATION: Keep the one with more action steps`)
  }

  console.log('\n' + '═'.repeat(80))
  console.log('🎯 ACTION REQUIRED:')
  console.log('═'.repeat(80))

  if (missingRisks.length > 0 || duplicatePowerStrategies.length > 1) {
    console.log('1. Delete duplicate power strategy (keep the comprehensive one)')
    console.log('2. Ensure all strategies have applicableRisks assigned')
    console.log('3. Test action workbook risk-strategy matching')
  } else {
    console.log('✅ No issues found - all strategies properly configured')
  }
}

async function main() {
  try {
    await checkStrategyRisks()
  } catch (error) {
    console.error('❌ Error checking strategy risks:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}



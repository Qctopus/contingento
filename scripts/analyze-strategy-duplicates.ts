import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeStrategyDuplicates() {
  console.log('🔍 Analyzing Strategy Duplicates & Overlaps...\n')

  const strategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      id: true,
      strategyId: true,
      name: true,
      description: true,
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

  console.log('📋 Current Strategies Analysis:')
  console.log('═'.repeat(80))

  // Group by risk type
  const byRisk = new Map<string, any[]>()

  strategies.forEach(strategy => {
    const name = JSON.parse(strategy.name as string).en || 'Unknown'
    const description = JSON.parse(strategy.description as string).en || ''
    const applicableRisks = strategy.applicableRisks ? JSON.parse(strategy.applicableRisks as string) : []

    console.log(`\n🎯 ${strategy.strategyId}`)
    console.log(`   Name: ${name}`)
    console.log(`   Action Steps: ${strategy._count.actionSteps}`)
    console.log(`   Risks: ${applicableRisks.join(', ') || 'Not specified'}`)
    console.log(`   Description: ${description.substring(0, 100)}...`)

    // Group by primary risk
    const primaryRisk = applicableRisks[0] || 'general'
    if (!byRisk.has(primaryRisk)) {
      byRisk.set(primaryRisk, [])
    }
    byRisk.get(primaryRisk)!.push(strategy)
  })

  console.log('\n' + '═'.repeat(80))
  console.log('🚨 POTENTIAL DUPLICATES & OVERLAPS:')
  console.log('═'.repeat(80))

  // Check for obvious duplicates
  const duplicates = [
    {
      issue: 'FIRE PROTECTION DUPLICATE',
      strategies: ['fire_comprehensive', 'fire_protection_comprehensive'],
      analysis: 'Both cover fire prevention and response. fire_protection_comprehensive is newer and more comprehensive.'
    },
    {
      issue: 'POWER OUTAGE DUPLICATE',
      strategies: ['power_outage_protection', 'power_resilience_comprehensive'],
      analysis: 'Both cover power outages. power_resilience_comprehensive has more action steps and is more comprehensive.'
    },
    {
      issue: 'COMMUNICATION OVERLAP',
      strategies: ['communication_comprehensive'],
      analysis: 'Emergency communication should be integrated into other risk-specific strategies, not standalone.'
    },
    {
      issue: 'DATA PROTECTION OVERLAP',
      strategies: ['data_protection_comprehensive'],
      analysis: 'Data protection overlaps with cyber_security_comprehensive. Should be consolidated.'
    }
  ]

  duplicates.forEach((dup, index) => {
    console.log(`\n${index + 1}. ${dup.issue}`)
    dup.strategies.forEach(stratId => {
      const strat = strategies.find(s => s.strategyId === stratId)
      if (strat) {
        const name = JSON.parse(strat.name as string).en
        console.log(`   - ${stratId}: ${name} (${strat._count.actionSteps} steps)`)
      }
    })
    console.log(`   📋 Analysis: ${dup.analysis}`)
  })

  console.log('\n' + '═'.repeat(80))
  console.log('🎯 RECOMMENDED CLEANUP:')
  console.log('═'.repeat(80))

  const toKeep = [
    'hurricane_comprehensive',
    'flood_protection_comprehensive',
    'fire_protection_comprehensive', // Keep the newer, more comprehensive one
    'cyber_security_comprehensive',
    'earthquake_protection_comprehensive',
    'drought_protection_comprehensive',
    'supply_chain_protection_comprehensive',
    'power_resilience_comprehensive' // Keep the more comprehensive power strategy
  ]

  const toDelete = [
    'fire_comprehensive', // Older, less comprehensive
    'power_outage_protection', // Less comprehensive
    'communication_comprehensive', // Should be integrated
    'data_protection_comprehensive' // Overlaps with cyber security
  ]

  console.log('\n✅ KEEP (Most Comprehensive):')
  toKeep.forEach(id => {
    const strat = strategies.find(s => s.strategyId === id)
    if (strat) {
      const name = JSON.parse(strat.name as string).en
      console.log(`   ✓ ${id}: ${name} (${strat._count.actionSteps} steps)`)
    }
  })

  console.log('\n❌ DELETE (Duplicates/Overlaps):')
  toDelete.forEach(id => {
    const strat = strategies.find(s => s.strategyId === id)
    if (strat) {
      const name = JSON.parse(strat.name as string).en
      console.log(`   ✗ ${id}: ${name} (${strat._count.actionSteps} steps)`)
    }
  })

  console.log(`\n📊 Result: ${toKeep.length} strategies kept, ${toDelete.length} strategies to delete`)
  console.log(`   Total after cleanup: ${toKeep.length} comprehensive strategies`)

  return { toKeep, toDelete }
}

async function main() {
  try {
    await analyzeStrategyDuplicates()
  } catch (error) {
    console.error('❌ Error analyzing strategies:', error)
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


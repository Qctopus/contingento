import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Create Simple Risk → Strategy Mapping
 * Instead of complex string matching, create direct 1:1 mappings
 * Each major risk type gets exactly one comprehensive strategy
 */

const RISK_STRATEGY_MAPPING = {
  // Direct 1:1 mappings - no fuzzy matching
  'hurricane': 'hurricane_comprehensive',
  'flood': 'flood_protection_comprehensive',
  'flooding': 'flood_protection_comprehensive',
  'earthquake': 'earthquake_protection_comprehensive',
  'fire': 'fire_protection_comprehensive',
  'power_outage': 'power_resilience_comprehensive',
  'cyber_attack': 'cyber_security_comprehensive',
  'drought': 'drought_protection_comprehensive',
  'supply_chain_disruption': 'supply_chain_protection_comprehensive',
  'pandemic': 'supply_chain_protection_comprehensive',
  'theft': 'theft_protection_comprehensive',
  'chemical_spill': 'chemical_hazard_protection',
  'economic_downturn': 'economic_downturn_protection',
  'civil_unrest': 'civil_unrest_protection'
}

async function createSimpleRiskStrategyMapping() {
  console.log('🔗 Creating Simple Risk → Strategy Mapping...\n')

  // Update each strategy to have ONLY its primary risk in applicableRisks
  for (const [riskType, strategyId] of Object.entries(RISK_STRATEGY_MAPPING)) {
    console.log(`🎯 ${riskType} → ${strategyId}`)

    try {
      await prisma.riskMitigationStrategy.update({
        where: { strategyId },
        data: {
          applicableRisks: JSON.stringify([riskType]), // Only the primary risk
          priorityTier: 'essential' // Make all primary strategies essential
        }
      })
      console.log(`   ✅ Updated ${strategyId}`)
    } catch (error) {
      console.log(`   ❌ Failed to update ${strategyId}: ${error}`)
    }
  }

  // Update remaining strategies to have empty applicableRisks (not primary)
  const allStrategies = await prisma.riskMitigationStrategy.findMany({
    select: { strategyId: true }
  })

  const primaryStrategies = new Set(Object.values(RISK_STRATEGY_MAPPING))
  const nonPrimaryStrategies = allStrategies.filter(s => !primaryStrategies.has(s.strategyId))

  console.log(`\n📋 Updating ${nonPrimaryStrategies.length} non-primary strategies...`)

  for (const strategy of nonPrimaryStrategies) {
    await prisma.riskMitigationStrategy.update({
      where: { strategyId: strategy.strategyId },
      data: {
        applicableRisks: JSON.stringify([]), // No direct risk mapping
        priorityTier: 'optional' // Not auto-selected
      }
    })
    console.log(`   📝 ${strategy.strategyId} → optional (no direct risk mapping)`)
  }

  console.log('\n✅ Simple Risk-Strategy Mapping Complete!')
  console.log('\n🎯 New Logic:')
  console.log('   1. Risk above threshold? → Show linked strategy')
  console.log('   2. No complex string matching')
  console.log('   3. Direct 1:1 risk → strategy lookup')
  console.log('   4. Essential strategies auto-selected')
  console.log('   5. Optional strategies available but not auto-selected')

  console.log('\n📊 Mapping Summary:')
  console.log(`   ${Object.keys(RISK_STRATEGY_MAPPING).length} risk types → ${new Set(Object.values(RISK_STRATEGY_MAPPING)).size} primary strategies`)
}

async function testSimpleMapping() {
  console.log('\n🧪 Testing Simple Risk-Strategy Mapping...\n')

  const userSelectedRisks = [
    'hurricane', 'flood', 'earthquake', 'fire', 'power_outage',
    'cyber_attack', 'drought', 'supply_chain_disruption', 'pandemic',
    'theft', 'chemical_spill', 'economic_downturn'
  ]

  console.log(`User selected ${userSelectedRisks.length} risks above threshold:`)
  userSelectedRisks.forEach(risk => console.log(`   • ${risk}`))

  // Test direct lookup (new simple logic)
  const matchedStrategies = new Set<string>()

  for (const risk of userSelectedRisks) {
    const strategyId = RISK_STRATEGY_MAPPING[risk as keyof typeof RISK_STRATEGY_MAPPING]
    if (strategyId) {
      matchedStrategies.add(strategyId)
    }
  }

  console.log(`\n✅ Direct lookup result: ${matchedStrategies.size} strategies`)

  matchedStrategies.forEach(strategyId => {
    console.log(`   • ${strategyId}`)
  })

  // Check that these strategies exist and are marked as essential
  const strategies = await prisma.riskMitigationStrategy.findMany({
    where: {
      strategyId: { in: Array.from(matchedStrategies) }
    },
    select: {
      strategyId: true,
      priorityTier: true,
      applicableRisks: true
    }
  })

  console.log(`\n📋 Strategy Details:`)
  strategies.forEach(strategy => {
    const risks = JSON.parse(strategy.applicableRisks || '[]')
    console.log(`   ${strategy.strategyId}: ${strategy.priorityTier} tier, risks: ${risks.join(', ')}`)
  })

  console.log(`\n🎉 Result: ${userSelectedRisks.length} risks → ${matchedStrategies.size} essential strategies`)
  console.log(`   No complex matching logic needed!`)
}

async function main() {
  try {
    await createSimpleRiskStrategyMapping()
    await testSimpleMapping()
  } catch (error) {
    console.error('❌ Error creating simple risk-strategy mapping:', error)
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



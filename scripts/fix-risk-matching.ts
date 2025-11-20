import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Fix Risk-Strategy Matching by Adding Common Risk Names
 * Users select risks like "flood", "pandemic" but strategies have "flooding", "pandemic_impact"
 */

async function fixRiskMatching() {
  console.log('🔧 Fixing Risk-Strategy Matching...\n')

  // Add "pandemic" to supply chain strategy
  console.log('📦 Adding "pandemic" to supply chain strategy...')
  await prisma.riskMitigationStrategy.update({
    where: { strategyId: 'supply_chain_protection_comprehensive' },
    data: {
      applicableRisks: JSON.stringify([
        'supply_chain_disruption',
        'supplier_failure',
        'transportation_delay',
        'geopolitical_event',
        'pandemic',  // Add this
        'pandemic_impact',
        'port_closure',
        'fuel_shortage'
      ])
    }
  })

  // Add "flood" to flood protection strategy
  console.log('🌊 Adding "flood" to flood protection strategy...')
  await prisma.riskMitigationStrategy.update({
    where: { strategyId: 'flood_protection_comprehensive' },
    data: {
      applicableRisks: JSON.stringify([
        'flooding',  // Keep existing
        'flood',     // Add this
        'tropical_storm',
        'heavy_rain',
        'storm_surge'
      ])
    }
  })

  // Add more common variations
  console.log('⚡ Adding common power outage variations...')
  await prisma.riskMitigationStrategy.update({
    where: { strategyId: 'power_resilience_comprehensive' },
    data: {
      applicableRisks: JSON.stringify([
        'power_outage',     // Keep existing
        'power_failure',    // Add common variation
        'blackout',         // Add common variation
        'hurricane',
        'equipment_failure',
        'infrastructure_damage'
      ])
    }
  })

  console.log('🦠 Adding pandemic variations to supply chain...')
  // Already done above

  console.log('🏭 Adding business interruption to economic downturn...')
  await prisma.riskMitigationStrategy.update({
    where: { strategyId: 'economic_downturn_protection' },
    data: {
      applicableRisks: JSON.stringify([
        'economic_downturn',    // Keep existing
        'economic_downturn',    // Keep existing
        'recession',            // Keep existing
        'financial_crisis',     // Keep existing
        'market_downturn',      // Keep existing
        'economic_slowdown',    // Keep existing
        'business_slump',       // Keep existing
        'business_interruption' // Add this common term
      ])
    }
  })

  console.log('\n✅ Risk matching fixes applied!')
  console.log('📋 Added common risk name variations:')
  console.log('   • "pandemic" → supply_chain_protection_comprehensive')
  console.log('   • "flood" → flood_protection_comprehensive')
  console.log('   • "power_failure", "blackout" → power_resilience_comprehensive')
  console.log('   • "business_interruption" → economic_downturn_protection')
}

async function testFixedMatching() {
  console.log('\n🧪 Testing Fixed Risk Matching...\n')

  const userSelectedRisks = [
    'fire', 'pandemic', 'drought', 'flood', 'earthquake',
    'cyber_attack', 'theft', 'chemical_spill', 'hurricane',
    'supply_chain_disruption', 'power_outage', 'economic_downturn'
  ]

  // Get strategies
  const strategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      strategyId: true,
      applicableRisks: true
    }
  })

  // Create risk variants
  const allRiskVariants = new Set<string>()
  userSelectedRisks.forEach(risk => {
    allRiskVariants.add(risk)
    allRiskVariants.add(risk.toLowerCase())
    allRiskVariants.add(risk.replace(/[_-]/g, ''))
    allRiskVariants.add(risk.replace(/[_-]/g, '_'))
  })

  // Filter strategies
  const matchingStrategies = strategies.filter(strategy => {
    const applicableRisks = JSON.parse(strategy.applicableRisks || '[]')
    return applicableRisks.some((appRisk: string) => {
      if (!appRisk) return false
      const normalizedAppRisk = appRisk.toLowerCase().replace(/[_-]/g, '')
      return Array.from(allRiskVariants).some(variant => {
        const normalizedVariant = variant.toLowerCase().replace(/[_-]/g, '')
        return normalizedAppRisk === normalizedVariant ||
               appRisk.toLowerCase() === variant.toLowerCase() ||
               appRisk === variant
      })
    })
  })

  console.log(`User selected ${userSelectedRisks.length} risks → ${matchingStrategies.length} matching strategies`)

  const unmatched = userSelectedRisks.filter(userRisk => {
    return !matchingStrategies.some(strategy => {
      const applicableRisks = JSON.parse(strategy.applicableRisks || '[]')
      return applicableRisks.some((risk: string) =>
        risk.toLowerCase() === userRisk.toLowerCase() ||
        risk.replace(/[_-]/g, '') === userRisk.replace(/[_-]/g, '')
      )
    })
  })

  if (unmatched.length > 0) {
    console.log(`❌ Still unmatched: ${unmatched.join(', ')}`)
  } else {
    console.log('✅ All user risks now have matching strategies!')
  }

  // Check priority tiers for auto-selection
  const allStrategies = await prisma.riskMitigationStrategy.findMany({
    select: { strategyId: true, priorityTier: true }
  })

  const autoSelected = allStrategies.filter(s =>
    s.priorityTier === 'essential' || s.priorityTier === 'recommended'
  )

  console.log(`🤖 Auto-selected strategies: ${autoSelected.length} (essential + recommended)`)
}

async function main() {
  try {
    await fixRiskMatching()
    await testFixedMatching()
  } catch (error) {
    console.error('❌ Error fixing risk matching:', error)
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



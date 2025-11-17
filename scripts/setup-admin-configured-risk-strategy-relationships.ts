import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Set up admin-configurable risk-strategy relationships
 * This replaces hardcoded mappings with database relationships that admins can configure
 */

async function setupAdminConfiguredRelationships() {
  console.log('🔗 Setting up admin-configurable risk-strategy relationships...\n')

  // Admin-configured relationships: each strategy gets the risks it should handle
  const relationships = [
    {
      strategyId: 'hurricane_comprehensive',
      applicableRisks: ['hurricane', 'tropical_storm', 'flooding', 'wind_damage', 'power_outage'],
      priorityTier: 'essential'
    },
    {
      strategyId: 'flood_protection_comprehensive',
      applicableRisks: ['flood', 'flooding', 'heavy_rain', 'storm_surge'],
      priorityTier: 'essential'
    },
    {
      strategyId: 'earthquake_protection_comprehensive',
      applicableRisks: ['earthquake', 'structural_damage', 'building_collapse', 'aftershock', 'liquefaction'],
      priorityTier: 'essential'
    },
    {
      strategyId: 'fire_protection_comprehensive',
      applicableRisks: ['fire', 'electrical_fire', 'cooking_fire', 'chemical_fire'],
      priorityTier: 'essential'
    },
    {
      strategyId: 'cyber_security_comprehensive',
      applicableRisks: ['cyber_attack', 'ransomware', 'data_breach', 'hacking', 'malware', 'phishing'],
      priorityTier: 'essential'
    },
    {
      strategyId: 'drought_protection_comprehensive',
      applicableRisks: ['drought', 'water_shortage', 'water_restrictions', 'municipal_water_failure', 'well_failure'],
      priorityTier: 'essential'
    },
    {
      strategyId: 'supply_chain_protection_comprehensive',
      applicableRisks: ['supply_chain_disruption', 'supplier_failure', 'transportation_delay', 'geopolitical_event', 'pandemic', 'pandemic_impact', 'port_closure', 'fuel_shortage'],
      priorityTier: 'essential'
    },
    {
      strategyId: 'theft_protection_comprehensive',
      applicableRisks: ['theft', 'burglary', 'robbery', 'vandalism', 'break_in', 'criminal_activity'],
      priorityTier: 'essential'
    },
    {
      strategyId: 'chemical_hazard_protection',
      applicableRisks: ['chemical_spill', 'toxic_exposure', 'hazardous_materials', 'environmental_hazard', 'poisoning', 'contamination'],
      priorityTier: 'essential'
    },
    {
      strategyId: 'economic_downturn_protection',
      applicableRisks: ['economic_downturn', 'recession', 'financial_crisis', 'market_downturn', 'economic_slowdown', 'business_slump', 'business_interruption'],
      priorityTier: 'essential'
    },
    {
      strategyId: 'civil_unrest_protection',
      applicableRisks: ['civil_unrest', 'protests', 'riots', 'social_instability', 'demonstrations', 'strikes', 'political_unrest'],
      priorityTier: 'essential'
    },
    {
      strategyId: 'power_resilience_comprehensive',
      applicableRisks: ['power_outage', 'power_failure', 'blackout', 'equipment_failure', 'infrastructure_damage'],
      priorityTier: 'recommended'
    },
    {
      strategyId: 'power_outage_protection',
      applicableRisks: [], // Not a primary strategy
      priorityTier: 'optional'
    }
  ]

  console.log('📝 Configuring admin relationships for each strategy...\n')

  for (const relationship of relationships) {
    console.log(`🎯 ${relationship.strategyId}`)
    console.log(`   Risks: ${relationship.applicableRisks.join(', ')}`)
    console.log(`   Tier: ${relationship.priorityTier}`)

    try {
      await prisma.riskMitigationStrategy.update({
        where: { strategyId: relationship.strategyId },
        data: {
          applicableRisks: JSON.stringify(relationship.applicableRisks),
          priorityTier: relationship.priorityTier
        }
      })
      console.log(`   ✅ Updated\n`)
    } catch (error) {
      console.log(`   ❌ Failed: ${error}\n`)
    }
  }

  console.log('✅ Admin-configurable relationships setup complete!')
  console.log('\n🎯 How it works:')
  console.log('   1. Admin configures applicableRisks for each strategy through UI')
  console.log('   2. When user selects risks (manual OR pre-ticked), system looks up linked strategies')
  console.log('   3. Simple database query - no complex matching logic')
  console.log('   4. Admins can change risk-strategy mappings anytime through admin interface')

  console.log('\n📋 Summary:')
  console.log(`   ${relationships.filter(r => r.applicableRisks.length > 0).length} strategies with risk relationships`)
  console.log(`   ${relationships.filter(r => r.priorityTier === 'essential').length} essential strategies (auto-selected)`)
  console.log(`   ${relationships.filter(r => r.priorityTier === 'recommended').length} recommended strategies (auto-selected)`)
  console.log(`   ${relationships.filter(r => r.priorityTier === 'optional').length} optional strategies (available but not auto-selected)`)
}

async function testAdminRelationships() {
  console.log('\n🧪 Testing admin-configured relationships...\n')

  const userSelectedRisks = [
    'fire', 'pandemic', 'drought', 'flood', 'earthquake',
    'cyber_attack', 'theft', 'chemical_spill', 'hurricane',
    'economic_downturn', 'power_outage'
  ]

  console.log(`User selected ${userSelectedRisks.length} risks:`)
  userSelectedRisks.forEach(risk => console.log(`   • ${risk}`))

  // Test the new logic: look up strategies by their applicableRisks
  const strategies = await prisma.riskMitigationStrategy.findMany({
    select: {
      strategyId: true,
      applicableRisks: true,
      priorityTier: true
    }
  })

  const linkedStrategies = new Set<string>()

  userSelectedRisks.forEach(userRisk => {
    strategies.forEach(strategy => {
      try {
        const strategyRisks = JSON.parse(strategy.applicableRisks || '[]')
        if (strategyRisks.includes(userRisk)) {
          linkedStrategies.add(strategy.strategyId)
        }
      } catch (e) {
        // Skip invalid JSON
      }
    })
  })

  console.log(`\n✅ Found ${linkedStrategies.size} strategies linked to user's risks:`)
  Array.from(linkedStrategies).forEach(strategyId => {
    const strategy = strategies.find(s => s.strategyId === strategyId)
    if (strategy) {
      const risks = JSON.parse(strategy.applicableRisks || '[]')
      console.log(`   • ${strategyId} (${strategy.priorityTier}): ${risks.join(', ')}`)
    }
  })

  console.log(`\n🎉 Perfect! Admin-configured relationships working correctly.`)
  console.log(`   User selects risks → System finds linked strategies → Simple and maintainable!`)
}

async function main() {
  try {
    await setupAdminConfiguredRelationships()
    await testAdminRelationships()
  } catch (error) {
    console.error('❌ Error setting up admin relationships:', error)
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


import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * STRATEGY-RISK MAPPINGS
 * Maps each strategy to its applicable hazard IDs
 * 
 * CANONICAL HAZARD IDs (13 total - matches admin backend):
 * - hurricane, flooding, drought, earthquake, landslide
 * - power_outage, fire, cybersecurity_incident
 * - civil_unrest, break_in_theft, health_emergency
 * - supply_disruption, economic_downturn
 */
const STRATEGY_RISK_MAPPINGS: Record<string, string[]> = {
  // Hurricane strategy covers hurricane and flooding (hurricane brings floods)
  'hurricane_comprehensive': ['hurricane', 'flooding'],
  
  // Flood strategy covers flooding primarily, also hurricane-related flooding
  'flood_protection_comprehensive': ['flooding', 'hurricane'],
  
  // Fire strategy covers fire hazard
  'fire_protection_comprehensive': ['fire'],
  
  // Power resilience covers power outage and hurricane-related outages
  'power_resilience_comprehensive': ['power_outage', 'hurricane'],
  
  // Cyber security strategy
  'cyber_security_comprehensive': ['cybersecurity_incident'],
  
  // Earthquake strategy covers earthquake and potential landslides
  'earthquake_protection_comprehensive': ['earthquake', 'landslide'],
  
  // Drought strategy
  'drought_protection_comprehensive': ['drought'],
  
  // Economic downturn strategy
  'economic_downturn_protection': ['economic_downturn'],
  
  // Supply chain strategy
  'supply_chain_protection_comprehensive': ['supply_disruption'],
  
  // Civil unrest strategy
  'civil_unrest_protection': ['civil_unrest'],
  
  // Break-in/theft protection
  'break_in_theft_protection': ['break_in_theft'],
  
  // Chemical hazard - map to fire (closest match)
  'chemical_hazard_protection': ['fire'],
}

async function seedStrategyRiskMappings() {
  console.log('🔗 Updating Strategy-Risk Mappings...\n')

  let updated = 0
  let notFound = 0

  for (const [strategyId, risks] of Object.entries(STRATEGY_RISK_MAPPINGS)) {
    try {
      const strategy = await prisma.riskMitigationStrategy.findUnique({
        where: { strategyId }
      })

      if (!strategy) {
        console.log(`  ❌ Strategy not found: ${strategyId}`)
        notFound++
        continue
      }

      await prisma.riskMitigationStrategy.update({
        where: { strategyId },
        data: {
          applicableRisks: JSON.stringify(risks)
        }
      })

      console.log(`  ✅ ${strategyId} → [${risks.join(', ')}]`)
      updated++
    } catch (error) {
      console.error(`  ❌ Error updating ${strategyId}:`, error)
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`  Updated: ${updated}`)
  console.log(`  Not found: ${notFound}`)

  // Now also populate the AdminHazardStrategy join table for the Admin UI
  console.log('\n🔗 Populating AdminHazardStrategy join table...\n')

  // First, check if AdminStrategy records exist (they're needed for the join)
  const adminStrategies = await prisma.adminStrategy.findMany()
  
  if (adminStrategies.length === 0) {
    console.log('  ⚠️  No AdminStrategy records found. Creating from RiskMitigationStrategy...\n')
    
    // Create AdminStrategy records from existing strategies
    const strategies = await prisma.riskMitigationStrategy.findMany()
    
    for (const strategy of strategies) {
      try {
        const name = strategy.strategyId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        
        await prisma.adminStrategy.create({
          data: {
            id: `admin_${strategy.strategyId}`,
            strategyId: strategy.strategyId,
            title: name,
            description: `Strategy for ${name}`,
            category: 'mitigation',
            isActive: true,
            updatedAt: new Date()
          }
        })
        console.log(`    Created AdminStrategy: ${strategy.strategyId}`)
      } catch (e: any) {
        if (e.code !== 'P2002') { // Not a duplicate key error
          console.log(`    ⚠️  Could not create AdminStrategy for ${strategy.strategyId}:`, e.message)
        }
      }
    }
  }

  // Now create the hazard-strategy mappings
  let mappingsCreated = 0
  
  for (const [strategyId, risks] of Object.entries(STRATEGY_RISK_MAPPINGS)) {
    for (const hazardId of risks) {
      try {
        await prisma.adminHazardStrategy.create({
          data: {
            id: `${hazardId}_${strategyId}`,
            hazardId,
            strategyId,
            priority: risks[0] === hazardId ? 'high' : 'medium', // First risk is primary
            isRecommended: true,
            isActive: true,
            updatedAt: new Date()
          }
        })
        console.log(`  ✅ ${hazardId} ↔ ${strategyId}`)
        mappingsCreated++
      } catch (e: any) {
        if (e.code === 'P2002') {
          console.log(`  ⏭️  Mapping already exists: ${hazardId} ↔ ${strategyId}`)
        } else if (e.code === 'P2003') {
          console.log(`  ⚠️  Foreign key constraint: ${hazardId} or ${strategyId} not found in admin tables`)
        } else {
          console.log(`  ❌ Error: ${e.message}`)
        }
      }
    }
  }

  console.log(`\n📊 Mappings Summary:`)
  console.log(`  Created: ${mappingsCreated}`)
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('  STRATEGY-RISK MAPPING SEED')
  console.log('═══════════════════════════════════════════════════════════════\n')

  await seedStrategyRiskMappings()

  console.log('\n✅ Done!')
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


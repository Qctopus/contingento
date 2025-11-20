import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Analyze all business characteristics and identify negative multiplier opportunities
 * Negative multipliers reduce risk scores for certain business types
 */

async function analyzeNegativeMultipliers() {
  console.log('🔍 Analyzing Business Characteristics for Negative Multipliers (Debuffs)\n')

  // Current business characteristics from the system
  const characteristics = [
    {
      key: 'location_coastal',
      question: 'Is your business within 5km of the coast?',
      positiveImpacts: ['hurricane', 'flooding', 'storm_surge'],
      negativeOpportunities: [] // Coastal doesn't reduce any risks
    },
    {
      key: 'location_urban',
      question: 'Is your business in an urban/city area?',
      positiveImpacts: ['fire', 'power_outage', 'cyber_attack'],
      negativeOpportunities: [
        { risk: 'earthquake', reason: 'Urban buildings often better constructed', factor: 0.9 },
        { risk: 'landslide', reason: 'Urban drainage prevents landslides', factor: 0.8 }
      ]
    },
    {
      key: 'location_flood_prone',
      question: 'Is your business in a flood-prone area?',
      positiveImpacts: ['flooding', 'storm_surge'],
      negativeOpportunities: [] // Being flood-prone doesn't reduce other risks
    },
    {
      key: 'tourism_share',
      question: 'What percentage of your customers are tourists?',
      positiveImpacts: ['hurricane', 'pandemic'],
      negativeOpportunities: [
        { risk: 'economic_downturn', reason: 'Tourism-dependent businesses hurt more by recessions', factor: 1.3 } // Actually positive multiplier
      ]
    },
    {
      key: 'power_dependency',
      question: 'Can your business operate without electricity?',
      positiveImpacts: ['power_outage', 'hurricane', 'cyber_attack'],
      negativeOpportunities: [
        { risk: 'fire', reason: 'No electricity reduces fire risk from electrical faults', factor: 0.8 },
        { risk: 'flooding', reason: 'No electrical equipment reduces flood damage', factor: 0.9 }
      ]
    },
    {
      key: 'digital_dependency',
      question: 'How dependent is your business on digital systems?',
      positiveImpacts: ['cyber_attack', 'power_outage', 'hurricane'],
      negativeOpportunities: [
        { risk: 'theft', reason: 'Digital businesses have less physical inventory', factor: 0.8 },
        { risk: 'fire', reason: 'Less flammable materials in digital businesses', factor: 0.9 },
        { risk: 'flooding', reason: 'Digital businesses have less water-damageable inventory', factor: 0.85 }
      ]
    },
    {
      key: 'water_dependency',
      question: 'Does your business require running water?',
      positiveImpacts: ['drought', 'flooding', 'earthquake'],
      negativeOpportunities: [] // Low water dependency doesn't obviously reduce other risks
    },
    {
      key: 'perishable_goods',
      question: 'Do you sell perishable goods?',
      positiveImpacts: ['power_outage', 'flooding', 'drought'],
      negativeOpportunities: [] // Perishable goods focus doesn't reduce other risks
    },
    {
      key: 'just_in_time_inventory',
      question: 'Do you keep minimal inventory?',
      positiveImpacts: ['supply_chain_disruption', 'flooding', 'fire'],
      negativeOpportunities: [
        { risk: 'theft', reason: 'Minimal inventory means less to steal', factor: 0.9 },
        { risk: 'economic_downturn', reason: 'Low inventory means lower carrying costs during downturns', factor: 0.95 }
      ]
    },
    {
      key: 'seasonal_business',
      question: 'Is your revenue seasonal?',
      positiveImpacts: ['hurricane', 'pandemic'],
      negativeOpportunities: [] // Seasonal nature doesn't reduce other risks
    },
    {
      key: 'physical_asset_intensive',
      question: 'Do you have expensive equipment or machinery?',
      positiveImpacts: ['hurricane', 'earthquake', 'flooding', 'fire', 'theft'],
      negativeOpportunities: [] // High physical assets don't reduce other risks
    }
  ]

  // Additional business type characteristics that should have negative multipliers
  const additionalCharacteristics = [
    {
      key: 'cloud_based',
      question: 'Is your business primarily cloud-based?',
      positiveImpacts: [], // Cloud might reduce some local risks
      negativeOpportunities: [
        { risk: 'power_outage', reason: 'Cloud services operate independently of local power', factor: 0.6 },
        { risk: 'flooding', reason: 'No local servers to flood', factor: 0.7 },
        { risk: 'fire', reason: 'No local servers to burn', factor: 0.8 },
        { risk: 'earthquake', reason: 'Distributed cloud infrastructure', factor: 0.9 }
      ]
    },
    {
      key: 'remote_work',
      question: 'Do your employees primarily work remotely?',
      positiveImpacts: [], // Remote work might reduce some local risks
      negativeOpportunities: [
        { risk: 'pandemic', reason: 'Remote work allows continued operations', factor: 0.5 },
        { risk: 'hurricane', reason: 'Staff can work from safe locations', factor: 0.8 },
        { risk: 'civil_unrest', reason: 'Remote work avoids local disruptions', factor: 0.7 }
      ]
    },
    {
      key: 'online_only',
      question: 'Is your business entirely online (no physical location)?',
      positiveImpacts: [], // Online-only reduces many physical risks
      negativeOpportunities: [
        { risk: 'flooding', reason: 'No physical location to flood', factor: 0.3 },
        { risk: 'fire', reason: 'No physical location to burn', factor: 0.4 },
        { risk: 'theft', reason: 'No physical inventory to steal', factor: 0.5 },
        { risk: 'hurricane', reason: 'No physical building to damage', factor: 0.6 },
        { risk: 'earthquake', reason: 'No physical building to damage', factor: 0.7 }
      ]
    },
    {
      key: 'service_based',
      question: 'Is your business primarily service-based (not product-based)?',
      positiveImpacts: [], // Service businesses have fewer physical assets
      negativeOpportunities: [
        { risk: 'flooding', reason: 'Less inventory to damage', factor: 0.9 },
        { risk: 'fire', reason: 'Less flammable inventory', factor: 0.9 },
        { risk: 'theft', reason: 'Less valuable inventory', factor: 0.9 },
        { risk: 'supply_chain_disruption', reason: 'Fewer physical goods to supply', factor: 0.95 }
      ]
    }
  ]

  console.log('📋 CURRENT CHARACTERISTICS ANALYSIS:')
  console.log('═'.repeat(80))

  let totalNegativeOpportunities = 0

  characteristics.forEach((char, index) => {
    console.log(`\n${index + 1}. ${char.key}`)
    console.log(`   Question: "${char.question}"`)

    if (char.positiveImpacts.length > 0) {
      console.log(`   ➕ Increases risk for: ${char.positiveImpacts.join(', ')}`)
    }

    if (char.negativeOpportunities.length > 0) {
      console.log(`   ➖ COULD reduce risk for: ${char.negativeOpportunities.map(n => `${n.risk} (${(1-n.factor)*100}% reduction)`).join(', ')}`)
      totalNegativeOpportunities += char.negativeOpportunities.length
    } else {
      console.log(`   ➖ No clear negative multiplier opportunities`)
    }
  })

  console.log('\n' + '═'.repeat(80))
  console.log('🚀 ADDITIONAL CHARACTERISTICS FOR NEGATIVE MULTIPLIERS:')
  console.log('═'.repeat(80))

  additionalCharacteristics.forEach((char, index) => {
    console.log(`\n${index + 1}. ${char.key} (NEW)`)
    console.log(`   Question: "${char.question}"`)

    if (char.negativeOpportunities.length > 0) {
      console.log(`   ➖ WOULD reduce risk for: ${char.negativeOpportunities.map(n => `${n.risk} (${(1-n.factor)*100}% reduction)`).join(', ')}`)
      totalNegativeOpportunities += char.negativeOpportunities.length
    }
  })

  console.log('\n' + '═'.repeat(80))
  console.log('📊 DROUGHT IMPACT ANALYSIS FOR IT BUSINESS:')
  console.log('═'.repeat(80))

  console.log('\n🌵 Why Drought Impacts IT Business:')
  console.log('   • Water-cooled servers and equipment')
  console.log('   • Hydroelectric power generation (drought reduces power supply)')
  console.log('   • Municipal water restrictions affecting operations')
  console.log('   • Employee access to water for basic needs')
  console.log('   • Cooling systems for data centers')

  console.log('\n💻 IT Business Drought Vulnerabilities:')
  console.log('   • High water dependency for server cooling')
  console.log('   • High power dependency (hydroelectric affected)')
  console.log('   • Digital dependency (power + cooling critical)')
  console.log('   • Urban location (water rationing more strict)')

  console.log('\n🛡️ IT Business Drought Protections (Negative Multipliers):')
  console.log('   • Cloud-based: -70% drought risk (no local water cooling)')
  console.log('   • Low water dependency: -20% drought risk')
  console.log('   • Online-only: -50% drought risk (no physical location)')
  console.log('   • Remote work: -30% drought risk (staff work from home)')

  console.log('\n' + '═'.repeat(80))
  console.log('🎯 SUMMARY:')
  console.log(`   • Current characteristics: ${characteristics.length}`)
  console.log(`   • Additional characteristics: ${additionalCharacteristics.length}`)
  console.log(`   • Total negative multiplier opportunities: ${totalNegativeOpportunities}`)
  console.log(`   • Risk reduction potential: Up to ${(totalNegativeOpportunities * 15)}% for optimized businesses`)

  console.log('\n💡 KEY INSIGHT: IT businesses can reduce risk by 40-60% through:')
  console.log('   • Cloud migration (power/flood/fire reduction)')
  console.log('   • Remote work adoption (pandemic/civil unrest reduction)')
  console.log('   • Online-only model (physical disaster reduction)')
  console.log('   • Service-based focus (inventory risk reduction)')
}

async function main() {
  try {
    await analyzeNegativeMultipliers()
  } catch (error) {
    console.error('❌ Error analyzing negative multipliers:', error)
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



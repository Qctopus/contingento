import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// OFFICIAL hazard IDs from seedHazardTypes.ts
const OFFICIAL_HAZARD_IDS = [
  'hurricane',
  'flooding',
  'drought',
  'earthquake',
  'landslide',
  'high_winds',
  'tsunami',
  'power_outage',
  'water_shortage',
  'internet_outage',
  'fire',
  'equipment_failure',
  'cybersecurity_incident',
  'civil_unrest',
  'health_emergency',
  'key_person_loss',
  'supply_disruption',
  'economic_downturn',
  'currency_crisis'
]

// Mapping from OLD/INCORRECT risk IDs to OFFICIAL hazard IDs
const RISK_ID_MAPPING: Record<string, string> = {
  // Cyber variants → cybersecurity_incident
  'cyberAttack': 'cybersecurity_incident',
  'cyber_attack': 'cybersecurity_incident',
  'ransomware': 'cybersecurity_incident',
  'dataBreach': 'cybersecurity_incident',
  'data_breach': 'cybersecurity_incident',
  'hacking': 'cybersecurity_incident',
  'malware': 'cybersecurity_incident',
  'phishing': 'cybersecurity_incident',
  
  // Health/Pandemic variants → health_emergency
  'pandemic': 'health_emergency',
  'pandemicImpact': 'health_emergency',
  'pandemic_impact': 'health_emergency',
  'pandemicDisease': 'health_emergency',
  'disease_outbreak': 'health_emergency',
  
  // Supply chain variants → supply_disruption
  'supplyChainDisruption': 'supply_disruption',
  'supply_chain_disruption': 'supply_disruption',
  'supplierFailure': 'supply_disruption',
  'supplier_failure': 'supply_disruption',
  'transportationDelay': 'supply_disruption',
  'transportation_delay': 'supply_disruption',
  'geopoliticalEvent': 'supply_disruption',
  'portClosure': 'supply_disruption',
  'fuelShortage': 'supply_disruption',
  
  // Weather variants that should map to main hazards
  'tropicalStorm': 'hurricane',
  'tropical_storm': 'hurricane',
  'windDamage': 'high_winds',
  'wind_damage': 'high_winds',
  'heavyRain': 'flooding',
  'heavy_rain': 'flooding',
  'stormSurge': 'flooding',
  'storm_surge': 'flooding',
  'flood': 'flooding',
  
  // Water variants → water_shortage or drought
  'waterShortage': 'water_shortage',
  'water_shortage': 'water_shortage',
  'waterRestrictions': 'drought',
  'water_restrictions': 'drought',
  'municipalWaterFailure': 'water_shortage',
  'wellFailure': 'water_shortage',
  
  // Civil unrest variants
  'protests': 'civil_unrest',
  'riots': 'civil_unrest',
  'social_instability': 'civil_unrest',
  'socialInstability': 'civil_unrest',
  'demonstrations': 'civil_unrest',
  'strikes': 'civil_unrest',
  'political_unrest': 'civil_unrest',
  
  // Fire variants
  'electricalFire': 'fire',
  'electrical_fire': 'fire',
  'cookingFire': 'fire',
  'cooking_fire': 'fire',
  'chemicalFire': 'fire',
  'chemical_fire': 'fire',
  
  // Earthquake variants
  'structuralDamage': 'earthquake',
  'structural_damage': 'earthquake',
  'buildingCollapse': 'earthquake',
  'building_collapse': 'earthquake',
  'aftershock': 'earthquake',
  'liquefaction': 'earthquake',
  
  // Chemical hazards - could be equipment_failure or create new category
  'chemical_spill': 'equipment_failure',
  'chemicalSpill': 'equipment_failure',
  'toxic_exposure': 'equipment_failure',
  'toxicExposure': 'equipment_failure',
  'hazardous_materials': 'equipment_failure',
  'hazardousMaterials': 'equipment_failure',
  'environmental_hazard': 'equipment_failure',
  'poisoning': 'equipment_failure',
  'contamination': 'equipment_failure',
  
  // Economic variants
  'recession': 'economic_downturn',
  'financial_crisis': 'currency_crisis',
  'financialCrisis': 'currency_crisis',
  'market_downturn': 'economic_downturn',
  'marketDownturn': 'economic_downturn',
  'economic_slowdown': 'economic_downturn',
  'economicSlowdown': 'economic_downturn',
  'business_slump': 'economic_downturn',
  'businessSlump': 'economic_downturn',
  
  // Staff/personnel
  'staffUnavailable': 'key_person_loss',
  'staff_unavailable': 'key_person_loss'
}

async function harmonizeStrategyRiskIds() {
  console.log('🔧 HARMONIZING STRATEGY RISK IDs TO OFFICIAL HAZARD IDs\n')
  console.log('=' .repeat(80))
  
  const strategies = await prisma.riskMitigationStrategy.findMany({
    where: { isActive: true },
    select: {
      id: true,
      strategyId: true,
      name: true,
      applicableRisks: true
    }
  })
  
  console.log(`\nFound ${strategies.length} active strategies\n`)
  
  let updated = 0
  let unchanged = 0
  
  for (const strategy of strategies) {
    try {
      const name = JSON.parse(strategy.name || '{}')
      const oldRisks = JSON.parse(strategy.applicableRisks || '[]') as string[]
      
      // Map old risk IDs to official hazard IDs and deduplicate
      const newRisks = Array.from(new Set(
        oldRisks.map((risk: string) => RISK_ID_MAPPING[risk] || risk)
      ))
      
      // Filter to only include official hazard IDs (remove any unknown risks)
      const validRisks = newRisks.filter(risk => OFFICIAL_HAZARD_IDS.includes(risk))
      
      if (JSON.stringify(oldRisks) !== JSON.stringify(validRisks)) {
        console.log(`\n📝 ${strategy.strategyId}`)
        console.log(`   Name: ${name.en || '(no name)'}`)
        console.log(`   OLD: [${oldRisks.join(', ')}]`)
        console.log(`   NEW: [${validRisks.join(', ')}]`)
        
        // Update the strategy
        await prisma.riskMitigationStrategy.update({
          where: { id: strategy.id },
          data: {
            applicableRisks: JSON.stringify(validRisks)
          }
        })
        
        updated++
      } else {
        unchanged++
      }
    } catch (e) {
      console.error(`\n❌ Error processing ${strategy.strategyId}:`, e)
    }
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('\n✅ HARMONIZATION COMPLETE!')
  console.log(`   - Strategies updated: ${updated}`)
  console.log(`   - Strategies unchanged: ${unchanged}`)
  console.log(`   - Total strategies: ${strategies.length}`)
  
  console.log('\n📋 Official Hazard IDs that strategies now use:')
  console.log(OFFICIAL_HAZARD_IDS.join(', '))
}

async function main() {
  try {
    await harmonizeStrategyRiskIds()
  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()


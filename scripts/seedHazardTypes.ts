import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CARIBBEAN_HAZARD_TYPES = [
  // NATURAL HAZARDS - Weather
  {
    hazardId: 'hurricane',
    name: 'Hurricane / Tropical Storm',
    category: 'natural',
    description: 'Major tropical cyclone with sustained winds over 74 mph, heavy rain, storm surge, and flooding',
    defaultFrequency: 'possible',
    defaultImpact: 'major',
    seasonalPattern: 'june-november',
    peakMonths: JSON.stringify(['8', '9', '10']),
    warningTime: 'days',
    geographicScope: 'regional',
    cascadingRisks: JSON.stringify(['power_outage', 'flooding', 'infrastructure_damage', 'supply_disruption']),
    isActive: true
  },
  {
    hazardId: 'flooding',
    name: 'Flooding',
    category: 'natural',
    description: 'Overflow of water onto normally dry land from heavy rain, storm surge, or river overflow',
    defaultFrequency: 'possible',
    defaultImpact: 'major',
    seasonalPattern: 'may-november',
    peakMonths: JSON.stringify(['5', '6', '9', '10']),
    warningTime: 'hours',
    geographicScope: 'localized',
    cascadingRisks: JSON.stringify(['infrastructure_damage', 'contaminated_water', 'disease_outbreak']),
    isActive: true
  },
  {
    hazardId: 'drought',
    name: 'Drought',
    category: 'natural',
    description: 'Extended period of abnormally low rainfall leading to water shortage',
    defaultFrequency: 'possible',
    defaultImpact: 'moderate',
    seasonalPattern: 'january-april',
    peakMonths: JSON.stringify(['2', '3', '4']),
    warningTime: 'weeks',
    geographicScope: 'regional',
    cascadingRisks: JSON.stringify(['drought', 'crop_failure', 'power_outage']),
    isActive: true
  },
  {
    hazardId: 'earthquake',
    name: 'Earthquake',
    category: 'natural',
    description: 'Sudden ground shaking caused by tectonic plate movement',
    defaultFrequency: 'unlikely',
    defaultImpact: 'major',
    seasonalPattern: 'year-round',
    peakMonths: null,
    warningTime: 'none',
    geographicScope: 'regional',
    cascadingRisks: JSON.stringify(['structural_damage', 'fire', 'power_outage', 'landslide']),
    isActive: true
  },
  {
    hazardId: 'landslide',
    name: 'Landslide / Mudslide',
    category: 'natural',
    description: 'Movement of rock, earth, or debris down a slope, often triggered by heavy rain',
    defaultFrequency: 'possible',
    defaultImpact: 'major',
    seasonalPattern: 'may-november',
    peakMonths: JSON.stringify(['5', '6', '9', '10']),
    warningTime: 'hours',
    geographicScope: 'localized',
    cascadingRisks: JSON.stringify(['infrastructure_damage', 'road_blockage']),
    isActive: true
  },

  // TECHNOLOGICAL HAZARDS
  {
    hazardId: 'power_outage',
    name: 'Power Outage',
    category: 'technological',
    description: 'Loss of electrical power supply due to grid failure, weather, or equipment malfunction',
    defaultFrequency: 'likely',
    defaultImpact: 'moderate',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify(['8', '9', '10']),
    warningTime: 'minutes',
    geographicScope: 'localized',
    cascadingRisks: JSON.stringify(['refrigeration_failure', 'communication_loss', 'business_interruption']),
    isActive: true
  },
  {
    hazardId: 'fire',
    name: 'Fire',
    category: 'technological',
    description: 'Uncontrolled fire within or near business premises',
    defaultFrequency: 'unlikely',
    defaultImpact: 'major',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify(['1', '2', '3', '4']),
    warningTime: 'minutes',
    geographicScope: 'localized',
    cascadingRisks: JSON.stringify(['structural_damage', 'smoke_damage', 'business_closure']),
    isActive: true
  },
  {
    hazardId: 'cybersecurity_incident',
    name: 'Cybersecurity Incident / Data Breach',
    category: 'technological',
    description: 'Cyberattack, ransomware, data theft, or IT system compromise',
    defaultFrequency: 'possible',
    defaultImpact: 'major',
    seasonalPattern: 'year-round',
    peakMonths: null,
    warningTime: 'none',
    geographicScope: 'individual',
    cascadingRisks: JSON.stringify(['data_loss', 'reputation_damage', 'financial_loss']),
    isActive: true
  },

  // HUMAN/SOCIAL HAZARDS
  {
    hazardId: 'civil_unrest',
    name: 'Civil Unrest / Protests',
    category: 'human',
    description: 'Social disturbances, protests, or civil unrest affecting business operations',
    defaultFrequency: 'unlikely',
    defaultImpact: 'moderate',
    seasonalPattern: 'year-round',
    peakMonths: null,
    warningTime: 'hours',
    geographicScope: 'localized',
    cascadingRisks: JSON.stringify(['business_interruption', 'property_damage', 'supply_disruption']),
    isActive: true
  },
  {
    hazardId: 'break_in_theft',
    name: 'Break-ins & Theft',
    category: 'human',
    description: 'Criminal activity targeting business property or assets including break-ins, theft, and vandalism',
    defaultFrequency: 'possible',
    defaultImpact: 'minor',
    seasonalPattern: 'year-round',
    peakMonths: null,
    warningTime: 'none',
    geographicScope: 'localized',
    cascadingRisks: JSON.stringify(['inventory_loss', 'property_damage', 'business_interruption']),
    isActive: true
  },
  {
    hazardId: 'health_emergency',
    name: 'Health Emergency / Pandemic',
    category: 'health',
    description: 'Disease outbreak, pandemic, or public health crisis',
    defaultFrequency: 'unlikely',
    defaultImpact: 'major',
    seasonalPattern: 'year-round',
    peakMonths: null,
    warningTime: 'days',
    geographicScope: 'regional',
    cascadingRisks: JSON.stringify(['staff_shortage', 'supply_disruption', 'business_closure', 'customer_loss']),
    isActive: true
  },

  // ECONOMIC/BUSINESS HAZARDS
  {
    hazardId: 'supply_disruption',
    name: 'Supply Chain Disruption',
    category: 'economic',
    description: 'Interruption in supply of critical goods or materials',
    defaultFrequency: 'possible',
    defaultImpact: 'moderate',
    seasonalPattern: 'year-round',
    peakMonths: null,
    warningTime: 'days',
    geographicScope: 'regional',
    cascadingRisks: JSON.stringify(['inventory_shortage', 'business_interruption', 'customer_loss']),
    isActive: true
  },
  {
    hazardId: 'economic_downturn',
    name: 'Economic Downturn / Tourism Decline',
    category: 'economic',
    description: 'Significant reduction in customer demand or economic activity',
    defaultFrequency: 'possible',
    defaultImpact: 'major',
    seasonalPattern: 'year-round',
    peakMonths: null,
    warningTime: 'weeks',
    geographicScope: 'regional',
    cascadingRisks: JSON.stringify(['revenue_loss', 'staff_reduction', 'business_closure']),
    isActive: true
  }
]

async function seedHazardTypes() {
  console.log('⚠️  Seeding Caribbean hazard types...\n')
  
  let created = 0
  let updated = 0
  
  for (const hazard of CARIBBEAN_HAZARD_TYPES) {
    const existing = await prisma.adminHazardType.findUnique({
      where: { hazardId: hazard.hazardId }
    })
    
    if (existing) {
      await prisma.adminHazardType.update({
        where: { hazardId: hazard.hazardId },
        data: hazard
      })
      console.log(`  ↻ Updated: ${hazard.name}`)
      updated++
    } else {
      await prisma.adminHazardType.create({ data: hazard })
      console.log(`  ✓ Created: ${hazard.name}`)
      created++
    }
  }
  
  console.log(`\n✅ Hazard Types Summary:`)
  console.log(`   - New hazards created: ${created}`)
  console.log(`   - Existing hazards updated: ${updated}`)
  console.log(`   - Total hazards: ${CARIBBEAN_HAZARD_TYPES.length}`)
  
  // Group by category
  const byCategory = CARIBBEAN_HAZARD_TYPES.reduce((acc, h) => {
    acc[h.category] = (acc[h.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  console.log(`\n📊 Hazards by Category:`)
  Object.entries(byCategory).forEach(([category, count]) => {
    console.log(`   - ${category}: ${count} hazards`)
  })
}

// Run if called directly
if (require.main === module) {
  seedHazardTypes()
    .then(() => {
      console.log('\n🎉 Hazard types seeded successfully!')
      prisma.$disconnect()
    })
    .catch((e) => {
      console.error('\n❌ Seeding failed:', e)
      prisma.$disconnect()
      process.exit(1)
    })
}

export { seedHazardTypes, CARIBBEAN_HAZARD_TYPES }










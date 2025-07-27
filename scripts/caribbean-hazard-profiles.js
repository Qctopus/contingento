const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const caribbeanHazards = [
  // Natural Hazards
  {
    hazardId: 'hurricane',
    name: 'Hurricane/Tropical Storm',
    category: 'natural',
    description: 'Tropical cyclones with sustained winds of 74 mph or greater, bringing heavy rainfall, storm surge, and flooding',
    defaultFrequency: 'likely',
    defaultImpact: 'major',
    seasonalPattern: 'june-november',
    peakMonths: JSON.stringify(['8', '9', '10']),
    warningTime: 'days',
    geographicScope: 'multi-island',
    cascadingRisks: JSON.stringify(['flooding', 'power_outage', 'communication_failure', 'transportation_disruption', 'supply_chain_disruption'])
  },
  {
    hazardId: 'flooding',
    name: 'Flooding',
    category: 'natural',
    description: 'Excessive water accumulation causing property damage and business disruption',
    defaultFrequency: 'likely',
    defaultImpact: 'moderate',
    seasonalPattern: 'june-november',
    peakMonths: JSON.stringify(['9', '10', '11']),
    warningTime: 'hours',
    geographicScope: 'localized',
    cascadingRisks: JSON.stringify(['power_outage', 'transportation_disruption', 'supply_chain_disruption'])
  },
  {
    hazardId: 'earthquake',
    name: 'Earthquake',
    category: 'natural',
    description: 'Sudden shaking of the ground caused by seismic waves',
    defaultFrequency: 'possible',
    defaultImpact: 'major',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'none',
    geographicScope: 'regional',
    cascadingRisks: JSON.stringify(['tsunami', 'power_outage', 'communication_failure', 'structural_damage', 'transportation_disruption'])
  },
  {
    hazardId: 'tsunami',
    name: 'Tsunami',
    category: 'natural',
    description: 'Series of ocean waves caused by underwater earthquakes or volcanic eruptions',
    defaultFrequency: 'rare',
    defaultImpact: 'catastrophic',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'minutes',
    geographicScope: 'coastal',
    cascadingRisks: JSON.stringify(['flooding', 'power_outage', 'communication_failure', 'transportation_disruption'])
  },
  {
    hazardId: 'volcanic_eruption',
    name: 'Volcanic Eruption',
    category: 'natural',
    description: 'Explosive release of magma, gases, and ash from volcanic vents',
    defaultFrequency: 'rare',
    defaultImpact: 'catastrophic',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'days',
    geographicScope: 'regional',
    cascadingRisks: JSON.stringify(['ash_fall', 'power_outage', 'communication_failure', 'transportation_disruption', 'air_quality_issues'])
  },
  {
    hazardId: 'drought',
    name: 'Drought',
    category: 'natural',
    description: 'Extended period of below-average precipitation causing water shortages',
    defaultFrequency: 'possible',
    defaultImpact: 'moderate',
    seasonalPattern: 'december-may',
    peakMonths: JSON.stringify(['2', '3', '4']),
    warningTime: 'weeks',
    geographicScope: 'island-wide',
    cascadingRisks: JSON.stringify(['water_shortage', 'agricultural_loss', 'power_outage'])
  },
  {
    hazardId: 'landslide',
    name: 'Landslide',
    category: 'natural',
    description: 'Downward movement of soil and rock on slopes',
    defaultFrequency: 'unlikely',
    defaultImpact: 'moderate',
    seasonalPattern: 'june-november',
    peakMonths: JSON.stringify(['9', '10']),
    warningTime: 'hours',
    geographicScope: 'localized',
    cascadingRisks: JSON.stringify(['transportation_disruption', 'power_outage'])
  },

  // Technological Hazards
  {
    hazardId: 'power_outage',
    name: 'Power Outage',
    category: 'technological',
    description: 'Loss of electrical power affecting business operations and critical systems',
    defaultFrequency: 'likely',
    defaultImpact: 'moderate',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'minutes',
    geographicScope: 'localized',
    cascadingRisks: JSON.stringify(['communication_failure', 'refrigeration_loss', 'security_system_failure'])
  },
  {
    hazardId: 'communication_failure',
    name: 'Communication System Failure',
    category: 'technological',
    description: 'Disruption of phone, internet, and data communication systems',
    defaultFrequency: 'possible',
    defaultImpact: 'moderate',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'minutes',
    geographicScope: 'localized',
    cascadingRisks: JSON.stringify(['business_disruption', 'customer_service_failure'])
  },
  {
    hazardId: 'cyber_attack',
    name: 'Cyber Attack',
    category: 'technological',
    description: 'Malicious attempt to damage, disrupt, or gain unauthorized access to computer systems',
    defaultFrequency: 'possible',
    defaultImpact: 'major',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'none',
    geographicScope: 'global',
    cascadingRisks: JSON.stringify(['data_breach', 'financial_loss', 'reputation_damage'])
  },
  {
    hazardId: 'equipment_failure',
    name: 'Critical Equipment Failure',
    category: 'technological',
    description: 'Breakdown of essential machinery or systems required for business operations',
    defaultFrequency: 'likely',
    defaultImpact: 'moderate',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'hours',
    geographicScope: 'localized',
    cascadingRisks: JSON.stringify(['production_stoppage', 'service_disruption'])
  },

  // Human Hazards
  {
    hazardId: 'civil_unrest',
    name: 'Civil Unrest',
    category: 'human',
    description: 'Social disturbances, protests, or riots affecting business operations and safety',
    defaultFrequency: 'unlikely',
    defaultImpact: 'moderate',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'hours',
    geographicScope: 'localized',
    cascadingRisks: JSON.stringify(['transportation_disruption', 'supply_chain_disruption', 'security_concerns'])
  },
  {
    hazardId: 'strike_action',
    name: 'Labor Strike',
    category: 'human',
    description: 'Work stoppage by employees affecting business operations and service delivery',
    defaultFrequency: 'unlikely',
    defaultImpact: 'moderate',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'days',
    geographicScope: 'localized',
    cascadingRisks: JSON.stringify(['production_stoppage', 'service_disruption', 'reputation_damage'])
  },
  {
    hazardId: 'terrorism',
    name: 'Terrorism',
    category: 'human',
    description: 'Violent acts intended to create fear and disrupt society',
    defaultFrequency: 'rare',
    defaultImpact: 'catastrophic',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'none',
    geographicScope: 'localized',
    cascadingRisks: JSON.stringify(['civil_unrest', 'transportation_disruption', 'security_concerns'])
  },

  // Environmental Hazards
  {
    hazardId: 'air_quality_issues',
    name: 'Air Quality Issues',
    category: 'environmental',
    description: 'Poor air quality due to pollution, volcanic ash, or other contaminants',
    defaultFrequency: 'possible',
    defaultImpact: 'minor',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'hours',
    geographicScope: 'regional',
    cascadingRisks: JSON.stringify(['health_concerns', 'business_disruption'])
  },
  {
    hazardId: 'water_shortage',
    name: 'Water Shortage',
    category: 'environmental',
    description: 'Insufficient water supply affecting business operations and sanitation',
    defaultFrequency: 'possible',
    defaultImpact: 'moderate',
    seasonalPattern: 'december-may',
    peakMonths: JSON.stringify(['3', '4', '5']),
    warningTime: 'weeks',
    geographicScope: 'island-wide',
    cascadingRisks: JSON.stringify(['business_disruption', 'health_concerns'])
  },

  // Economic Hazards
  {
    hazardId: 'economic_recession',
    name: 'Economic Recession',
    category: 'economic',
    description: 'Period of economic decline affecting business revenue and customer demand',
    defaultFrequency: 'unlikely',
    defaultImpact: 'major',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'months',
    geographicScope: 'global',
    cascadingRisks: JSON.stringify(['revenue_decline', 'customer_loss', 'supply_chain_disruption'])
  },
  {
    hazardId: 'supply_chain_disruption',
    name: 'Supply Chain Disruption',
    category: 'economic',
    description: 'Interruption in the flow of goods and services from suppliers',
    defaultFrequency: 'likely',
    defaultImpact: 'moderate',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'days',
    geographicScope: 'global',
    cascadingRisks: JSON.stringify(['production_stoppage', 'customer_dissatisfaction', 'revenue_loss'])
  },
  {
    hazardId: 'currency_fluctuation',
    name: 'Currency Fluctuation',
    category: 'economic',
    description: 'Significant changes in exchange rates affecting import/export costs',
    defaultFrequency: 'likely',
    defaultImpact: 'minor',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'days',
    geographicScope: 'global',
    cascadingRisks: JSON.stringify(['cost_increases', 'profit_margin_erosion'])
  },

  // Additional Cascading Hazards
  {
    hazardId: 'transportation_disruption',
    name: 'Transportation Disruption',
    category: 'technological',
    description: 'Interruption of road, air, or sea transportation affecting business operations',
    defaultFrequency: 'likely',
    defaultImpact: 'moderate',
    seasonalPattern: 'june-november',
    peakMonths: JSON.stringify(['8', '9', '10']),
    warningTime: 'hours',
    geographicScope: 'regional',
    cascadingRisks: JSON.stringify(['supply_chain_disruption', 'employee_absenteeism'])
  },
  {
    hazardId: 'structural_damage',
    name: 'Structural Damage',
    category: 'natural',
    description: 'Physical damage to buildings and infrastructure',
    defaultFrequency: 'unlikely',
    defaultImpact: 'major',
    seasonalPattern: 'june-november',
    peakMonths: JSON.stringify(['8', '9', '10']),
    warningTime: 'minutes',
    geographicScope: 'localized',
    cascadingRisks: JSON.stringify(['business_disruption', 'relocation_required'])
  },
  {
    hazardId: 'ash_fall',
    name: 'Volcanic Ash Fall',
    category: 'natural',
    description: 'Deposition of volcanic ash affecting air quality and visibility',
    defaultFrequency: 'rare',
    defaultImpact: 'moderate',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'hours',
    geographicScope: 'regional',
    cascadingRisks: JSON.stringify(['air_quality_issues', 'transportation_disruption'])
  }
]

async function populateCaribbeanHazards() {
  try {
    console.log('🌪️ Populating Caribbean-specific hazard profiles...')
    
    for (const hazard of caribbeanHazards) {
      await prisma.adminHazardType.upsert({
        where: { hazardId: hazard.hazardId },
        update: {
          name: hazard.name,
          category: hazard.category,
          description: hazard.description,
          defaultFrequency: hazard.defaultFrequency,
          defaultImpact: hazard.defaultImpact,
          seasonalPattern: hazard.seasonalPattern,
          peakMonths: hazard.peakMonths,
          warningTime: hazard.warningTime,
          geographicScope: hazard.geographicScope,
          cascadingRisks: hazard.cascadingRisks,
          isActive: true
        },
        create: {
          hazardId: hazard.hazardId,
          name: hazard.name,
          category: hazard.category,
          description: hazard.description,
          defaultFrequency: hazard.defaultFrequency,
          defaultImpact: hazard.defaultImpact,
          seasonalPattern: hazard.seasonalPattern,
          peakMonths: hazard.peakMonths,
          warningTime: hazard.warningTime,
          geographicScope: hazard.geographicScope,
          cascadingRisks: hazard.cascadingRisks,
          isActive: true
        }
      })
      
      console.log(`✅ Created/Updated: ${hazard.name}`)
    }
    
    console.log('\n🎯 Caribbean hazard profiles successfully populated!')
    console.log(`📊 Total hazards: ${caribbeanHazards.length}`)
    
    // Display summary by category
    const categoryCounts = caribbeanHazards.reduce((acc, hazard) => {
      acc[hazard.category] = (acc[hazard.category] || 0) + 1
      return acc
    }, {})
    
    console.log('\n📈 Hazard Distribution:')
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} hazards`)
    })
    
  } catch (error) {
    console.error('❌ Error populating Caribbean hazards:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateCaribbeanHazards() 
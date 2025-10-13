const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const missingHazards = [
  {
    hazardId: 'fire',
    name: 'Fire',
    category: 'technological',
    description: 'Uncontrolled fire causing property damage, injury, and business disruption',
    defaultFrequency: 'possible',
    defaultImpact: 'major',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]), // No seasonal pattern
    warningTime: 'minutes',
    geographicScope: 'localized',
    cascadingRisks: JSON.stringify(['property_damage', 'business_disruption', 'data_loss', 'injury'])
  },
  {
    hazardId: 'pandemic',
    name: 'Pandemic/Epidemic',
    category: 'health',
    description: 'Widespread disease outbreak affecting staff availability, customer access, and business operations',
    defaultFrequency: 'unlikely',
    defaultImpact: 'major',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'weeks',
    geographicScope: 'global',
    cascadingRisks: JSON.stringify(['staff_shortage', 'supply_chain_disruption', 'economic_recession', 'customer_loss'])
  },
  {
    hazardId: 'financial_crisis',
    name: 'Financial Crisis',
    category: 'economic',
    description: 'Severe cash flow problems, inability to pay bills, or insolvency risk',
    defaultFrequency: 'possible',
    defaultImpact: 'catastrophic',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'weeks',
    geographicScope: 'business-specific',
    cascadingRisks: JSON.stringify(['business_closure', 'staff_layoffs', 'credit_loss', 'reputation_damage'])
  },
  {
    hazardId: 'data_breach',
    name: 'Data Breach',
    category: 'technological',
    description: 'Unauthorized access to sensitive business or customer data',
    defaultFrequency: 'possible',
    defaultImpact: 'major',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'none',
    geographicScope: 'business-specific',
    cascadingRisks: JSON.stringify(['reputation_damage', 'financial_loss', 'legal_liability', 'customer_loss'])
  },
  {
    hazardId: 'staff_shortage',
    name: 'Staff Shortage/Absenteeism',
    category: 'human',
    description: 'Insufficient staff to maintain normal operations due to illness, resignation, or other factors',
    defaultFrequency: 'likely',
    defaultImpact: 'moderate',
    seasonalPattern: 'year-round',
    peakMonths: JSON.stringify([]),
    warningTime: 'days',
    geographicScope: 'business-specific',
    cascadingRisks: JSON.stringify(['service_disruption', 'customer_dissatisfaction', 'revenue_loss'])
  }
]

async function main() {
  console.log('🔥 Adding missing hazard types to database...\n')
  
  for (const hazard of missingHazards) {
    try {
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
      
      console.log(`✅ Added/Updated: ${hazard.name} (${hazard.hazardId})`)
    } catch (error) {
      console.error(`❌ Error with ${hazard.hazardId}:`, error.message)
    }
  }
  
  console.log('\n🎉 Missing hazards successfully added!')
  console.log(`📊 Added ${missingHazards.length} hazard types`)
  
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})



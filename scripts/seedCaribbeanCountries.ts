import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CARIBBEAN_COUNTRIES = [
  {
    country: 'Jamaica',
    countryCode: 'JM',
    parish: null
  },
  {
    country: 'Haiti',
    countryCode: 'HT',
    parish: null
  },
  {
    country: 'Bahamas',
    countryCode: 'BS',
    parish: null
  },
  {
    country: 'Dominican Republic',
    countryCode: 'DO',
    parish: null
  },
  {
    country: 'Trinidad and Tobago',
    countryCode: 'TT',
    parish: null
  },
  {
    country: 'Barbados',
    countryCode: 'BB',
    parish: null
  },
  {
    country: 'Saint Lucia',
    countryCode: 'LC',
    parish: null
  },
  {
    country: 'Grenada',
    countryCode: 'GD',
    parish: null
  },
  {
    country: 'Saint Vincent and the Grenadines',
    countryCode: 'VC',
    parish: null
  },
  {
    country: 'Antigua and Barbuda',
    countryCode: 'AG',
    parish: null
  },
  {
    country: 'Dominica',
    countryCode: 'DM',
    parish: null
  },
  {
    country: 'Saint Kitts and Nevis',
    countryCode: 'KN',
    parish: null
  }
]

const DEFAULT_MULTIPLIERS = {
  'JM': { // Jamaica - baseline
    construction: 1.00,
    equipment: 1.00,
    service: 1.00,
    supplies: 1.00,
    currency: 'JMD',
    currencySymbol: 'J$',
    exchangeRateUSD: 157.50,
    confidenceLevel: 'high',
    dataSource: 'Central Bank of Jamaica'
  },
  'HT': { // Haiti - cheaper labor, expensive equipment
    construction: 0.70,
    equipment: 1.15,
    service: 0.50,
    supplies: 0.85,
    currency: 'HTG',
    currencySymbol: 'G',
    exchangeRateUSD: 132.00,
    confidenceLevel: 'medium',
    dataSource: 'World Bank estimate'
  },
  'BS': { // Bahamas - island premium
    construction: 1.45,
    equipment: 1.30,
    service: 1.65,
    supplies: 1.25,
    currency: 'BSD',
    currencySymbol: 'B$',
    exchangeRateUSD: 1.00,
    confidenceLevel: 'high',
    dataSource: 'Central Bank of Bahamas'
  },
  'DO': { // Dominican Republic - moderate
    construction: 0.75,
    equipment: 0.95,
    service: 0.65,
    supplies: 0.90,
    currency: 'DOP',
    currencySymbol: 'RD$',
    exchangeRateUSD: 58.50,
    confidenceLevel: 'high',
    dataSource: 'Central Bank of Dominican Republic'
  },
  'TT': { // Trinidad & Tobago - slightly higher
    construction: 1.15,
    equipment: 1.10,
    service: 1.25,
    supplies: 1.05,
    currency: 'TTD',
    currencySymbol: 'TT$',
    exchangeRateUSD: 6.80,
    confidenceLevel: 'high',
    dataSource: 'Central Bank of Trinidad and Tobago'
  },
  'BB': { // Barbados - high costs
    construction: 1.35,
    equipment: 1.20,
    service: 1.45,
    supplies: 1.15,
    currency: 'BBD',
    currencySymbol: 'Bds$',
    exchangeRateUSD: 2.00,
    confidenceLevel: 'high',
    dataSource: 'Central Bank of Barbados'
  },
  'LC': { // Saint Lucia
    construction: 1.25,
    equipment: 1.15,
    service: 1.30,
    supplies: 1.10,
    currency: 'XCD',
    currencySymbol: 'EC$',
    exchangeRateUSD: 2.70,
    confidenceLevel: 'medium',
    dataSource: 'Eastern Caribbean Central Bank'
  },
  'GD': { // Grenada
    construction: 1.20,
    equipment: 1.15,
    service: 1.25,
    supplies: 1.10,
    currency: 'XCD',
    currencySymbol: 'EC$',
    exchangeRateUSD: 2.70,
    confidenceLevel: 'medium',
    dataSource: 'Eastern Caribbean Central Bank'
  },
  'VC': { // Saint Vincent
    construction: 1.15,
    equipment: 1.10,
    service: 1.20,
    supplies: 1.05,
    currency: 'XCD',
    currencySymbol: 'EC$',
    exchangeRateUSD: 2.70,
    confidenceLevel: 'medium',
    dataSource: 'Eastern Caribbean Central Bank'
  },
  'AG': { // Antigua and Barbuda
    construction: 1.30,
    equipment: 1.20,
    service: 1.40,
    supplies: 1.15,
    currency: 'XCD',
    currencySymbol: 'EC$',
    exchangeRateUSD: 2.70,
    confidenceLevel: 'medium',
    dataSource: 'Eastern Caribbean Central Bank'
  },
  'DM': { // Dominica
    construction: 1.10,
    equipment: 1.10,
    service: 1.15,
    supplies: 1.05,
    currency: 'XCD',
    currencySymbol: 'EC$',
    exchangeRateUSD: 2.70,
    confidenceLevel: 'medium',
    dataSource: 'Eastern Caribbean Central Bank'
  },
  'KN': { // Saint Kitts and Nevis
    construction: 1.25,
    equipment: 1.15,
    service: 1.35,
    supplies: 1.10,
    currency: 'XCD',
    currencySymbol: 'EC$',
    exchangeRateUSD: 2.70,
    confidenceLevel: 'medium',
    dataSource: 'Eastern Caribbean Central Bank'
  }
}

async function seedCaribbeanCountries() {
  console.log('🌴 Seeding Caribbean countries...\n')
  
  let countriesCreated = 0
  let countriesExisted = 0
  
  // 1. Create countries in AdminLocation
  for (const countryData of CARIBBEAN_COUNTRIES) {
    const existing = await prisma.adminLocation.findFirst({
      where: {
        countryCode: countryData.countryCode,
        parish: null
      }
    })
    
    if (existing) {
      console.log(`  ⏭️  ${countryData.country} (${countryData.countryCode}) already exists`)
      countriesExisted++
    } else {
      await prisma.adminLocation.create({
        data: {
          country: countryData.country,
          countryCode: countryData.countryCode,
          parish: null,
          isCoastal: true,
          isUrban: false,
          isActive: true
        }
      })
      console.log(`  ✓ Created ${countryData.country} (${countryData.countryCode})`)
      countriesCreated++
    }
  }
  
  console.log(`\n✅ Countries: ${countriesCreated} created, ${countriesExisted} already existed`)
  
  // 2. Create country multipliers
  console.log('\n💰 Creating country multipliers...\n')
  
  let multipliersCreated = 0
  let multipliersUpdated = 0
  
  for (const [countryCode, multiplierData] of Object.entries(DEFAULT_MULTIPLIERS)) {
    const existing = await prisma.countryCostMultiplier.findUnique({
      where: { countryCode }
    })
    
    if (existing) {
      await prisma.countryCostMultiplier.update({
        where: { countryCode },
        data: {
          ...multiplierData,
          lastUpdated: new Date()
        }
      })
      console.log(`  ↻ Updated multipliers for ${countryCode} (${multiplierData.currency})`)
      multipliersUpdated++
    } else {
      await prisma.countryCostMultiplier.create({
        data: {
          countryCode,
          ...multiplierData
        }
      })
      console.log(`  ✓ Created multipliers for ${countryCode} (${multiplierData.currency})`)
      multipliersCreated++
    }
  }
  
  console.log(`\n✅ Multipliers: ${multipliersCreated} created, ${multipliersUpdated} updated`)
  
  console.log('\n🎉 Caribbean countries and multipliers seeded successfully!')
  console.log(`\n📊 Summary:`)
  console.log(`   - ${CARIBBEAN_COUNTRIES.length} countries available`)
  console.log(`   - ${Object.keys(DEFAULT_MULTIPLIERS).length} currency configurations`)
  console.log(`   - Ready for multi-currency cost calculations!`)
}

// Run if called directly
if (require.main === module) {
  seedCaribbeanCountries()
    .then(() => {
      console.log('\n✅ Seeding completed!')
      prisma.$disconnect()
    })
    .catch((e) => {
      console.error('\n❌ Seeding failed:', e)
      prisma.$disconnect()
      process.exit(1)
    })
}

export { seedCaribbeanCountries }


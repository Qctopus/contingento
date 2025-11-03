import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const DEFAULT_COST_ITEMS = [
  {
    itemId: 'hurricane_shutters_std',
    name: 'Hurricane Shutters (Standard)',
    description: 'Roll-down aluminum shutters for standard windows',
    category: 'construction',
    baseUSD: 450,
    baseUSDMin: 350,
    baseUSDMax: 550,
    unit: 'per window',
    complexity: 'medium',
    tags: JSON.stringify(['hurricane', 'windows', 'protection'])
  },
  {
    itemId: 'plywood_boards',
    name: 'Plywood Boards (Hurricane Protection)',
    description: '3/4" plywood with fasteners for window protection',
    category: 'construction',
    baseUSD: 90,
    baseUSDMin: 70,
    baseUSDMax: 110,
    unit: 'per window',
    complexity: 'simple',
    tags: JSON.stringify(['hurricane', 'windows', 'budget'])
  },
  {
    itemId: 'generator_5kw',
    name: 'Backup Generator (5kW Diesel)',
    description: 'Portable diesel generator with automatic transfer switch',
    category: 'equipment',
    baseUSD: 2800,
    baseUSDMin: 2400,
    baseUSDMax: 3200,
    unit: 'per unit',
    complexity: 'complex',
    tags: JSON.stringify(['power', 'generator', 'backup'])
  },
  {
    itemId: 'generator_fuel',
    name: 'Generator Fuel (50L Diesel)',
    description: 'Diesel fuel for backup generator',
    category: 'supplies',
    baseUSD: 100,
    unit: 'per tank',
    complexity: 'simple',
    tags: JSON.stringify(['power', 'fuel', 'supplies'])
  },
  {
    itemId: 'installation_service',
    name: 'Professional Installation Service',
    description: 'Labor costs for professional installation',
    category: 'service',
    baseUSD: 200,
    baseUSDMin: 150,
    baseUSDMax: 250,
    unit: 'per job',
    complexity: 'simple',
    tags: JSON.stringify(['installation', 'labor', 'service'])
  },
  {
    itemId: 'emergency_food_2wk',
    name: 'Emergency Food Supplies (2 weeks)',
    description: 'Non-perishable food supplies for 2 weeks',
    category: 'supplies',
    baseUSD: 300,
    unit: 'per person',
    complexity: 'simple',
    tags: JSON.stringify(['food', 'emergency', 'supplies'])
  },
  {
    itemId: 'water_storage_tank',
    name: 'Water Storage Tank (200L)',
    description: 'Food-grade plastic water storage tank',
    category: 'equipment',
    baseUSD: 180,
    baseUSDMin: 150,
    baseUSDMax: 220,
    unit: 'per tank',
    complexity: 'simple',
    tags: JSON.stringify(['water', 'storage', 'emergency'])
  },
  {
    itemId: 'first_aid_kit_commercial',
    name: 'Commercial First Aid Kit',
    description: 'Comprehensive first aid kit for business use',
    category: 'supplies',
    baseUSD: 85,
    baseUSDMin: 65,
    baseUSDMax: 105,
    unit: 'per kit',
    complexity: 'simple',
    tags: JSON.stringify(['medical', 'emergency', 'safety'])
  },
  {
    itemId: 'fire_extinguisher',
    name: 'Fire Extinguisher (ABC Type)',
    description: '5kg ABC dry powder fire extinguisher',
    category: 'equipment',
    baseUSD: 45,
    baseUSDMin: 35,
    baseUSDMax: 55,
    unit: 'per unit',
    complexity: 'simple',
    tags: JSON.stringify(['fire', 'safety', 'emergency'])
  },
  {
    itemId: 'backup_data_system',
    name: 'Cloud Backup System (Annual)',
    description: 'Cloud-based data backup service subscription',
    category: 'service',
    baseUSD: 240,
    baseUSDMin: 180,
    baseUSDMax: 300,
    unit: 'per year',
    complexity: 'medium',
    tags: JSON.stringify(['data', 'backup', 'technology'])
  }
]

export const DEFAULT_COUNTRY_MULTIPLIERS = [
  {
    countryCode: 'JM',
    construction: 1.00,
    equipment: 1.00,
    service: 1.00,
    supplies: 1.00,
    currency: 'JMD',
    currencySymbol: 'J$',
    exchangeRateUSD: 157.50,
    confidenceLevel: 'high',
    dataSource: 'Manual'
  },
  {
    countryCode: 'HT',
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
  {
    countryCode: 'BS',
    construction: 1.45,
    equipment: 1.30,
    service: 1.65,
    supplies: 1.25,
    currency: 'BSD',
    currencySymbol: 'B$',
    exchangeRateUSD: 1.00,
    confidenceLevel: 'high',
    dataSource: 'Manual'
  },
  {
    countryCode: 'DO',
    construction: 0.75,
    equipment: 0.95,
    service: 0.65,
    supplies: 0.90,
    currency: 'DOP',
    currencySymbol: 'RD$',
    exchangeRateUSD: 58.50,
    confidenceLevel: 'high',
    dataSource: 'Manual'
  },
  {
    countryCode: 'TT',
    construction: 1.15,
    equipment: 1.10,
    service: 1.25,
    supplies: 1.05,
    currency: 'TTD',
    currencySymbol: 'TT$',
    exchangeRateUSD: 6.80,
    confidenceLevel: 'high',
    dataSource: 'Manual'
  },
  {
    countryCode: 'BB',
    construction: 1.35,
    equipment: 1.20,
    service: 1.45,
    supplies: 1.15,
    currency: 'BBD',
    currencySymbol: 'Bds$',
    exchangeRateUSD: 2.00,
    confidenceLevel: 'high',
    dataSource: 'Manual'
  }
]

export async function seedCurrencyData() {
  console.log('🌍 Seeding currency management data...')
  
  // 1. Seed cost items
  console.log('\n📦 Creating cost items...')
  for (const item of DEFAULT_COST_ITEMS) {
    try {
      await prisma.costItem.upsert({
        where: { itemId: item.itemId },
        update: item,
        create: item
      })
      console.log(`  ✓ ${item.name}`)
    } catch (error) {
      console.error(`  ✗ Failed to create ${item.name}:`, error)
    }
  }
  console.log(`✅ Created ${DEFAULT_COST_ITEMS.length} cost items`)
  
  // 2. Seed country multipliers (only for countries that exist in AdminLocation)
  console.log('\n🌍 Creating country multipliers...')
  const countries = await prisma.adminLocation.findMany({
    where: { parish: null }, // Only country-level entries
    select: { countryCode: true }
  })
  
  const countryCodes = countries.map(c => c.countryCode)
  console.log(`Found countries: ${countryCodes.join(', ')}`)
  
  let multiplierCount = 0
  for (const multiplier of DEFAULT_COUNTRY_MULTIPLIERS) {
    if (countryCodes.includes(multiplier.countryCode)) {
      try {
        await prisma.countryCostMultiplier.upsert({
          where: { countryCode: multiplier.countryCode },
          update: multiplier,
          create: multiplier
        })
        console.log(`  ✓ ${multiplier.countryCode} (${multiplier.currency})`)
        multiplierCount++
      } catch (error) {
        console.error(`  ✗ Failed to create ${multiplier.countryCode}:`, error)
      }
    } else {
      console.log(`  ⊘ Skipped ${multiplier.countryCode} (country not in AdminLocation)`)
    }
  }
  console.log(`✅ Created ${multiplierCount} country multipliers`)
  
  console.log('\n✅ Currency data seeding complete!')
}

// If running directly
if (require.main === module) {
  seedCurrencyData()
    .then(() => {
      console.log('\n🎉 Seeding completed successfully!')
      prisma.$disconnect()
    })
    .catch((e) => {
      console.error('\n❌ Seeding failed:', e)
      prisma.$disconnect()
      process.exit(1)
    })
}


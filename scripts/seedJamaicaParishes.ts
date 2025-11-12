import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const JAMAICA_PARISHES = [
  {
    name: 'Kingston',
    region: 'Surrey',
    countryCode: 'JM',
    population: 89057,
    area: 22.0,
    coordinates: '17.9714,-76.7931'
  },
  {
    name: 'Saint Andrew',
    region: 'Surrey',
    countryCode: 'JM',
    population: 573369,
    area: 455.0,
    coordinates: '18.0179,-76.7099'
  },
  {
    name: 'Saint Thomas',
    region: 'Surrey',
    countryCode: 'JM',
    population: 93902,
    area: 743.0,
    coordinates: '17.9500,-76.3500'
  },
  {
    name: 'Portland',
    region: 'Surrey',
    countryCode: 'JM',
    population: 82183,
    area: 814.0,
    coordinates: '18.1667,-76.4167'
  },
  {
    name: 'Saint Mary',
    region: 'Middlesex',
    countryCode: 'JM',
    population: 113615,
    area: 611.0,
    coordinates: '18.3667,-76.9167'
  },
  {
    name: 'Saint Ann',
    region: 'Middlesex',
    countryCode: 'JM',
    population: 172362,
    area: 1213.0,
    coordinates: '18.4333,-77.2000'
  },
  {
    name: 'Trelawny',
    region: 'Middlesex',
    countryCode: 'JM',
    population: 75558,
    area: 875.0,
    coordinates: '18.3500,-77.6000'
  },
  {
    name: 'Saint James',
    region: 'Cornwall',
    countryCode: 'JM',
    population: 183811,
    area: 595.0,
    coordinates: '18.4667,-77.9167'
  },
  {
    name: 'Hanover',
    region: 'Cornwall',
    countryCode: 'JM',
    population: 69533,
    area: 450.0,
    coordinates: '18.4167,-78.1333'
  },
  {
    name: 'Westmoreland',
    region: 'Cornwall',
    countryCode: 'JM',
    population: 144817,
    area: 807.0,
    coordinates: '18.2500,-78.1500'
  },
  {
    name: 'Saint Elizabeth',
    region: 'Cornwall',
    countryCode: 'JM',
    population: 150205,
    area: 1212.0,
    coordinates: '18.0500,-77.7500'
  },
  {
    name: 'Manchester',
    region: 'Middlesex',
    countryCode: 'JM',
    population: 189797,
    area: 830.0,
    coordinates: '18.0500,-77.5000'
  },
  {
    name: 'Clarendon',
    region: 'Middlesex',
    countryCode: 'JM',
    population: 245103,
    area: 1196.0,
    coordinates: '17.9500,-77.2500'
  },
  {
    name: 'Saint Catherine',
    region: 'Middlesex',
    countryCode: 'JM',
    population: 516218,
    area: 1192.0,
    coordinates: '18.0000,-77.0000'
  }
]

async function seedParishes() {
  console.log('🏝️  Seeding Jamaica parishes...\n')
  
  let created = 0
  let skipped = 0
  
  for (const parish of JAMAICA_PARISHES) {
    const existing = await prisma.parish.findFirst({
      where: {
        name: parish.name,
        countryCode: parish.countryCode
      }
    })
    
    if (existing) {
      console.log(`  ⊘ Skipped: ${parish.name} (already exists)`)
      skipped++
    } else {
      await prisma.parish.create({
        data: parish
      })
      console.log(`  ✓ Created: ${parish.name} (${parish.region}, Pop: ${parish.population.toLocaleString()})`)
      created++
    }
  }
  
  console.log(`\n✅ Parishes: ${created} created, ${skipped} already existed`)
  console.log(`\n🎉 Jamaica parishes seeded successfully!`)
}

seedParishes()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })





import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting simple seed...')

    const businessType = await prisma.adminBusinessType.upsert({
        where: { businessTypeId: 'retail' },
        update: {},
        create: {
            businessTypeId: 'retail',
            name: 'Retail Store',
            localName: 'Retail Store',
            category: 'retail',
            description: 'Shops selling goods to consumers',
            exampleBusinessPurposes: 'Selling clothes, electronics, groceries',
            exampleProducts: 'Clothing, food, gadgets',
            essentialFunctions: 'Sales, inventory management',
            isActive: true
        }
    })
    console.log('✅ Created business type:', businessType.name)

    const location = await prisma.adminLocation.upsert({
        where: { countryCode_parish: { countryCode: 'JM', parish: 'Kingston' } },
        update: {},
        create: {
            country: 'Jamaica',
            countryCode: 'JM',
            parish: 'Kingston',
            isCoastal: true,
            isUrban: true,
            isActive: true
        }
    })
    console.log('✅ Created location:', location.parish)

    const hazard = await prisma.adminHazardType.upsert({
        where: { hazardId: 'hurricane' },
        update: {},
        create: {
            hazardId: 'hurricane',
            name: 'Hurricane',
            category: 'natural',
            defaultFrequency: 'likely',
            defaultImpact: 'major',
            isActive: true
        }
    })
    console.log('✅ Created hazard:', hazard.name)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

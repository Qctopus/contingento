import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
    console.log('Testing AdminHazardType...')
    try {
        const hazards = await prisma.adminHazardType.findMany({
            select: {
                hazardId: true,
                name: true,
                category: true
            }
        })
        console.log(`Found ${hazards.length} hazards`)
        hazards.forEach(h => console.log(`- ${h.hazardId} (${h.category})`))
    } catch (e) {
        console.error('Error fetching hazards:', e)
    }

    console.log('\nTesting RiskMitigationStrategy for Fire/Earthquake...')
    try {
        const strategies = await prisma.riskMitigationStrategy.findMany({
            where: {
                OR: [
                    { primaryRisk: { in: ['fire', 'earthquake'] } },
                    { secondaryRisks: { contains: 'fire' } },
                    { secondaryRisks: { contains: 'earthquake' } }
                ]
            },
            select: {
                strategyId: true,
                smeTitle: true,
                name: true,
                selectionTier: true,
                primaryRisk: true,
                secondaryRisks: true
            }
        })
        console.log(`Found ${strategies.length} strategies for Fire/Earthquake`)
        strategies.forEach(s => console.log(`- ${s.strategyId} (Primary: ${s.primaryRisk}, Secondary: ${s.secondaryRisks})`))
    } catch (e) {
        console.error('Error fetching strategies:', e)
    }

    await prisma.$disconnect()
}

test()

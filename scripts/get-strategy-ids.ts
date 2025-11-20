import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getStrategyIds() {
    const strategies = await prisma.riskMitigationStrategy.findMany({
        select: {
            id: true,
            strategyId: true
        }
    })

    console.log('Strategy IDs in database:')
    strategies.forEach(s => {
        console.log(`  ${s.strategyId}`)
    })

    await prisma.$disconnect()
}

getStrategyIds().catch(console.error)

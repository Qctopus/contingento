import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMissingStrategies() {
    console.log('🔍 CHECKING STRATEGIES FOR MANUALLY SELECTED RISKS\n')

    const risksToCheck = [
        'earthquake',
        'economic_downturn',
        'power_outage',
        'flooding',
        'landslide',
        'break_in_theft'
    ]

    for (const riskId of risksToCheck) {
        console.log(`\n--- Risk: "${riskId}" ---`)

        const strategies = await prisma.riskMitigationStrategy.findMany({
            where: {
                OR: [
                    { primaryRisk: riskId },
                    { secondaryRisks: { contains: riskId } }
                ]
            },
            select: {
                strategyId: true,
                name: true,
                primaryRisk: true,
                secondaryRisks: true
            }
        })

        if (strategies.length > 0) {
            console.log(`✅ FOUND ${strategies.length} strategies:`)
            strategies.forEach(s => {
                const isPrimary = s.primaryRisk === riskId
                console.log(`   - ${s.strategyId} (${s.name})`)
                console.log(`     Primary: ${s.primaryRisk}, Secondary: ${s.secondaryRisks}`)
                console.log(`     Relationship: ${isPrimary ? 'PRIMARY' : 'SECONDARY'}`)
            })
        } else {
            console.log(`❌ NO STRATEGIES FOUND`)
            console.log(`   This risk needs strategies added to the database`)
        }
    }

    await prisma.$disconnect()
}

checkMissingStrategies()

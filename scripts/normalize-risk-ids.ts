import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function normalizeRiskId(id: string): string {
    return id
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .toLowerCase()
        .replace(/[\s-]+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
}

async function normalizeRiskIds() {
    console.log('🚀 Starting risk ID normalization...')

    // Get all strategies
    const strategies = await prisma.riskMitigationStrategy.findMany()
    console.log(`Found ${strategies.length} strategies to check.`)

    let updatedCount = 0

    for (const strategy of strategies) {
        if (strategy.applicableRisks) {
            try {
                let risks: string[] = []

                // Parse existing risks
                if (typeof strategy.applicableRisks === 'string') {
                    risks = JSON.parse(strategy.applicableRisks)
                } else if (Array.isArray(strategy.applicableRisks)) {
                    risks = strategy.applicableRisks as string[]
                }

                if (!Array.isArray(risks)) {
                    console.warn(`⚠️ Strategy ${strategy.strategyId} has invalid applicableRisks format`)
                    continue
                }

                // Normalize risks
                const normalizedRisks = risks.map((risk: string) => normalizeRiskId(risk))

                // Check if any changes needed
                const needsUpdate = JSON.stringify(risks) !== JSON.stringify(normalizedRisks)

                if (needsUpdate) {
                    await prisma.riskMitigationStrategy.update({
                        where: { strategyId: strategy.strategyId },
                        data: { applicableRisks: JSON.stringify(normalizedRisks) }
                    })

                    console.log(`✅ Updated ${strategy.strategyId}: ${JSON.stringify(risks)} → ${JSON.stringify(normalizedRisks)}`)
                    updatedCount++
                }
            } catch (e) {
                console.error(`❌ Failed to update ${strategy.strategyId}:`, e)
            }
        }
    }

    console.log(`✅ Risk ID normalization complete. Updated ${updatedCount} strategies.`)
}

normalizeRiskIds()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

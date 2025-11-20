import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugStrategyLinks() {
    console.log('🔍 DEBUGGING STRATEGY-RISK LINKS\n')

    // Get all strategies with their risk links
    const strategies = await prisma.riskMitigationStrategy.findMany({
        select: {
            strategyId: true,
            name: true,
            primaryRisk: true,
            secondaryRisks: true,
            applicableRisks: true
        }
    })

    console.log(`Found ${strategies.length} total strategies\n`)

    // Group by primary risk
    const byPrimaryRisk: Record<string, any[]> = {}

    strategies.forEach(s => {
        const primary = s.primaryRisk || 'none'
        if (!byPrimaryRisk[primary]) byPrimaryRisk[primary] = []
        byPrimaryRisk[primary].push(s)
    })

    console.log('📊 Strategies grouped by PRIMARY RISK:')
    Object.entries(byPrimaryRisk).forEach(([risk, strats]) => {
        console.log(`\n${risk}: ${strats.length} strategies`)
        strats.forEach(s => {
            console.log(`  - ${s.strategyId}`)
            console.log(`    Secondary: ${s.secondaryRisks}`)
            console.log(`    Applicable (legacy): ${s.applicableRisks}`)
        })
    })

    // Check specific problematic risks
    const problematicRisks = ['earthquake', 'economic_downturn', 'flooding', 'landslide', 'power_outage']

    console.log('\n\n🔍 CHECKING PROBLEMATIC RISKS:')
    for (const riskId of problematicRisks) {
        console.log(`\n--- ${riskId} ---`)

        const matchingStrats = strategies.filter(s => {
            const hasPrimary = s.primaryRisk === riskId

            let hasSecondary = false
            if (s.secondaryRisks) {
                try {
                    const secRisks = typeof s.secondaryRisks === 'string'
                        ? (s.secondaryRisks.startsWith('[') ? JSON.parse(s.secondaryRisks) : [s.secondaryRisks])
                        : s.secondaryRisks
                    hasSecondary = Array.isArray(secRisks) && secRisks.includes(riskId)
                } catch (e) { }
            }

            return hasPrimary || hasSecondary
        })

        if (matchingStrats.length > 0) {
            console.log(`✅ ${matchingStrats.length} strategies found:`)
            matchingStrats.forEach(s => console.log(`   - ${s.strategyId} (primary: ${s.primaryRisk})`))
        } else {
            console.log(`❌ NO STRATEGIES FOUND`)
        }
    }

    await prisma.$disconnect()
}

debugStrategyLinks()

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debug() {
    console.log('🔍 DEBUGGING STRATEGY MATCHING (DIRECT MATCHING)\n')

    // 1. Fetch Strategies
    const strategies = await prisma.riskMitigationStrategy.findMany({
        select: {
            strategyId: true,
            primaryRisk: true,
            secondaryRisks: true
        }
    })
    console.log(`Fetched ${strategies.length} strategies.`)

    // 2. Define Test Hazards (Standardized snake_case IDs)
    const testHazards = [
        'fire',
        'earthquake',
        'power_outage',
        'flooding',
        'hurricane',
        'cybersecurity_incident'
    ]

    console.log('\n🧪 Testing Hazard Matching:')

    for (const hazardId of testHazards) {
        console.log(`\n--- Hazard: "${hazardId}" ---`)

        const matches = strategies.filter(s => {
            // Direct match on primary risk
            const hasPrimary = s.primaryRisk === hazardId

            // Direct match on secondary risks
            let hasSecondary = false
            if (s.secondaryRisks) {
                try {
                    // Handle both string (JSON) and potential array
                    const secRisks = typeof s.secondaryRisks === 'string'
                        ? (s.secondaryRisks.startsWith('[') ? JSON.parse(s.secondaryRisks) : [s.secondaryRisks])
                        : s.secondaryRisks

                    if (Array.isArray(secRisks)) {
                        hasSecondary = secRisks.includes(hazardId)
                    } else if (typeof secRisks === 'string') {
                        hasSecondary = secRisks === hazardId
                    }
                } catch (e) {
                    console.log(`Error parsing secondaryRisks for ${s.strategyId}`)
                }
            }

            return hasPrimary || hasSecondary
        })

        if (matches.length > 0) {
            console.log(`✅ MATCHED ${matches.length} strategies:`)
            // Show first 5 matches only to keep output clean
            matches.slice(0, 5).forEach(m => console.log(`   - ${m.strategyId} (Primary: ${m.primaryRisk})`))
            if (matches.length > 5) console.log(`   ... and ${matches.length - 5} more`)
        } else {
            console.log(`❌ NO MATCHES`)
        }
    }

    await prisma.$disconnect()
}

debug()

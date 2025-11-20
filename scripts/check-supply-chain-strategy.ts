import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSupplyChainStrategy() {
    console.log('🔍 CHECKING SUPPLY CHAIN STRATEGY RISK ASSOCIATIONS\n')

    // Find supply chain strategies
    const supplyChainStrategies = await prisma.riskMitigationStrategy.findMany({
        where: {
            OR: [
                { strategyId: { contains: 'supply' } },
                { name: { contains: 'Supply Chain' } }
            ]
        },
        select: {
            strategyId: true,
            name: true,
            primaryRisk: true,
            secondaryRisks: true,
            applicableRisks: true
        }
    })

    console.log(`Found ${supplyChainStrategies.length} supply chain strategies:\n`)

    supplyChainStrategies.forEach(s => {
        console.log(`Strategy: ${s.strategyId}`)
        console.log(`  Name: ${s.name}`)
        console.log(`  Primary Risk: ${s.primaryRisk}`)
        console.log(`  Secondary Risks: ${s.secondaryRisks}`)
        console.log(`  Applicable Risks (legacy): ${s.applicableRisks}`)

        // Parse secondary risks if it's a JSON string
        if (s.secondaryRisks) {
            try {
                const parsed = typeof s.secondaryRisks === 'string'
                    ? JSON.parse(s.secondaryRisks)
                    : s.secondaryRisks
                console.log(`  Parsed Secondary Risks:`, parsed)
            } catch (e) {
                console.log(`  Error parsing secondary risks`)
            }
        }
        console.log('')
    })

    // Check if health_emergency is in any strategy
    const healthStrategies = await prisma.riskMitigationStrategy.findMany({
        where: {
            OR: [
                { primaryRisk: 'health_emergency' },
                { secondaryRisks: { contains: 'health_emergency' } }
            ]
        },
        select: {
            strategyId: true,
            name: true,
            primaryRisk: true,
            secondaryRisks: true
        }
    })

    console.log(`\n\nStrategies linked to health_emergency: ${healthStrategies.length}`)
    healthStrategies.forEach(s => {
        console.log(`  - ${s.strategyId}: ${s.name}`)
        console.log(`    Primary: ${s.primaryRisk}, Secondary: ${s.secondaryRisks}`)
    })

    await prisma.$disconnect()
}

checkSupplyChainStrategy()

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditHazards() {
    console.log('🔍 CURRENT HAZARDS IN DATABASE:\n')

    const hazards = await prisma.adminHazardType.findMany({
        select: {
            hazardId: true,
            name: true,
            category: true
        },
        orderBy: {
            hazardId: 'asc'
        }
    })

    console.log(`Total: ${hazards.length} hazards\n`)

    hazards.forEach(h => {
        console.log(`  ${h.hazardId.padEnd(30)} → ${h.name.padEnd(40)} [${h.category}]`)
    })

    console.log('\n\n📋 STRATEGIES AND THEIR REQUIRED HAZARDS:\n')

    const strategies = await prisma.riskMitigationStrategy.findMany({
        select: {
            strategyId: true,
            primaryRisk: true,
            secondaryRisks: true
        }
    })

    const allRequiredHazards = new Set<string>()

    strategies.forEach(s => {
        if (s.primaryRisk) allRequiredHazards.add(s.primaryRisk)
        if (s.secondaryRisks) {
            const secondary = JSON.parse(s.secondaryRisks)
            secondary.forEach((h: string) => allRequiredHazards.add(h))
        }
    })

    console.log('Hazards required by strategies:')
    Array.from(allRequiredHazards).sort().forEach(h => {
        const exists = hazards.find(hz => hz.hazardId === h)
        console.log(`  ${h.padEnd(30)} ${exists ? '✅ EXISTS' : '❌ MISSING'}`)
    })

    console.log('\n\n⚠️ HAZARDS WITHOUT STRATEGIES:\n')

    hazards.forEach(h => {
        if (!allRequiredHazards.has(h.hazardId)) {
            console.log(`  ${h.hazardId.padEnd(30)} → ${h.name}`)
        }
    })

    await prisma.$disconnect()
}

auditHazards().catch(console.error)

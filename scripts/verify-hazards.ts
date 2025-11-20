import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyHazards() {
    console.log('📊 HAZARD VERIFICATION REPORT\n')
    console.log('='.repeat(80) + '\n')

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

    console.log(`Total Hazards in Database: ${hazards.length}\n`)

    // Check for required hazards
    const requiredByStrategies = [
        'break_in_theft', 'civil_unrest', 'cybersecurity_incident',
        'drought', 'earthquake', 'economic_downturn', 'fire',
        'flooding', 'hurricane', 'power_outage', 'supply_disruption',
        'water_shortage', 'chemical_spill'
    ]

    console.log('✅ Hazards REQUIRED by strategies:\n')
    requiredByStrategies.forEach(id => {
        const exists = hazards.find(h => h.hazardId === id)
        console.log(`  ${id.padEnd(30)} ${exists ? '✅' : '❌ MISSING!'}`)
    })

    console.log('\n📋 Hazards to KEEP (no strategy yet):\n')
    const keepNoStrategy = ['landslide', 'health_emergency']
    keepNoStrategy.forEach(id => {
        const exists = hazards.find(h => h.hazardId === id)
        console.log(`  ${id.padEnd(30)} ${exists ? '✅' : '❌ MISSING!'}`)
    })

    console.log('\n❌ Hazards that SHOULD BE REMOVED:\n')
    const shouldRemove = ['high_winds', 'tsunami', 'internet_outage', 'key_person_loss']
    shouldRemove.forEach(id => {
        const exists = hazards.find(h => h.hazardId === id)
        console.log(`  ${id.padEnd(30)} ${exists ? '⚠️ STILL EXISTS!' : '✅ Removed'}`)
    })

    console.log('\n\n📝 ALL HAZARDS IN DATABASE:\n')
    hazards.forEach(h => {
        console.log(`  ${h.hazardId.padEnd(30)} → ${h.name.padEnd(45)} [${h.category}]`)
    })

    await prisma.$disconnect()
}

verifyHazards().catch(console.error)

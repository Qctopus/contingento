import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listHazards() {
    console.log('🔍 LISTING HAZARD IDs\n')
    const hazards = await prisma.adminHazardType.findMany({
        select: { hazardId: true, name: true }
    })

    console.log('Found hazards:')
    hazards.forEach(h => console.log(`- "${h.hazardId}" (${h.name})`))

    await prisma.$disconnect()
}

listHazards()

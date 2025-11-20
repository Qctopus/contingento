import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const hazards = await prisma.adminHazardType.findMany()
    console.log('Hazards in DB:', hazards.map(h => h.hazardId))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

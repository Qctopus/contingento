import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const hazards = await prisma.adminHazardType.findMany({
        where: {
            OR: [
                { hazardId: { contains: 'power' } },
                { name: { contains: 'power' } },
                { name: { contains: 'Power' } }
            ]
        }
    })
    console.log('Power related hazards:', hazards)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

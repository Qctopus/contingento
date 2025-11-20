import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupHazards() {
    console.log('🧹 Cleaning up AdminHazardType database...\n')

    // 1. Remove standalone hazards that don't have strategies and user wants removed
    const hazardsToRemove = [
        'high_winds',        // Only secondary to hurricane
        'tsunami',           // User said discard
        'internet_outage',   // User said discard  
        'key_person_loss',   // User said discard
    ]

    console.log('📋 Removing unnecessary hazards:\n')
    for (const hazardId of hazardsToRemove) {
        try {
            const result = await prisma.adminHazardType.delete({
                where: { hazardId }
            })
            console.log(`✅ Removed: ${hazardId}`)
        } catch (error: any) {
            if (error.code === 'P2025') {
                console.log(`⚠️  Not found (already removed): ${hazardId}`)
            } else {
                console.error(`❌ Error removing ${hazardId}:`, error.message)
            }
        }
    }

    // 2. Ensure break_in_theft exists and is properly configured
    console.log('\n📋 Ensuring break_in_theft is properly configured:\n')

    try {
        const breakInExists = await prisma.adminHazardType.findUnique({
            where: { hazardId: 'break_in_theft' }
        })

        if (!breakInExists) {
            await prisma.adminHazardType.create({
                data: {
                    hazardId: 'break_in_theft',
                    name: 'Break-ins & Theft',
                    category: 'human',
                    description: 'Unauthorized entry and theft of property or assets',
                    defaultFrequency: 'possible',
                    defaultImpact: 'moderate',
                    isActive: true
                }
            })
            console.log('✅ Created break_in_theft hazard')
        } else {
            console.log('✅ break_in_theft already exists')
        }
    } catch (error: any) {
        console.error('❌ Error with break_in_theft:', error.message)
    }

    // 3. Ensure civil_unrest exists (for Security Threats mapping)
    console.log('\n📋 Ensuring civil_unrest exists:\n')

    try {
        const civilUnrestExists = await prisma.adminHazardType.findUnique({
            where: { hazardId: 'civil_unrest' }
        })

        if (!civilUnrestExists) {
            await prisma.adminHazardType.create({
                data: {
                    hazardId: 'civil_unrest',
                    name: 'Civil Unrest / Protests',
                    category: 'human',
                    description: 'Social disorder, protests, and public disturbances',
                    defaultFrequency: 'unlikely',
                    defaultImpact: 'moderate',
                    isActive: true
                }
            })
            console.log('✅ Created civil_unrest hazard')
        } else {
            console.log('✅ civil_unrest already exists')
        }
    } catch (error: any) {
        console.error('❌ Error with civil_unrest:', error.message)
    }

    // 4. Ensure landslide and health_emergency exist (user wants to keep)
    console.log('\n📋 Ensuring landslide and health_emergency exist:\n')

    const essentialHazards = [
        {
            hazardId: 'landslide',
            name: 'Landslide / Mudslide',
            category: 'natural',
            description: 'Slope failure and mass movement of earth',
            defaultFrequency: 'unlikely',
            defaultImpact: 'major'
        },
        {
            hazardId: 'health_emergency',
            name: 'Health Emergency / Pandemic',
            category: 'health',
            description: 'Public health emergencies and disease outbreaks',
            defaultFrequency: 'rare',
            defaultImpact: 'catastrophic'
        }
    ]

    for (const hazard of essentialHazards) {
        try {
            await prisma.adminHazardType.upsert({
                where: { hazardId: hazard.hazardId },
                update: {},
                create: {
                    ...hazard,
                    isActive: true
                }
            })
            console.log(`✅ Ensured ${hazard.hazardId} exists`)
        } catch (error: any) {
            console.error(`❌ Error with ${hazard.hazardId}:`, error.message)
        }
    }

    // 5. Show final hazard list
    console.log('\n\n📊 FINAL HAZARD LIST:\n')

    const finalHazards = await prisma.adminHazardType.findMany({
        select: {
            hazardId: true,
            name: true,
            category: true
        },
        orderBy: {
            category: 'asc',
            name: 'asc'
        }
    })

    let currentCategory = ''
    finalHazards.forEach(h => {
        if (h.category !== currentCategory) {
            currentCategory = h.category
            console.log(`\n  📁 ${currentCategory.toUpperCase()}:`)
        }
        console.log(`     ${h.hazardId.padEnd(30)} → ${h.name}`)
    })

    console.log(`\n  TOTAL: ${finalHazards.length} hazards`)
    console.log('\n✨ Cleanup complete!')

    await prisma.$disconnect()
}

cleanupHazards().catch(console.error)

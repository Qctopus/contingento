import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function phase1_discovery() {
    console.log('='.repeat(80))
    console.log('PHASE 1: DATABASE DISCOVERY & VALIDATION')
    console.log('='.repeat(80))
    console.log()

    // 1. Check AdminStrategy system usage
    console.log('📋 CHECKING ADMIN STRATEGY SYSTEM (potentially deprecated):\n')

    try {
        const adminStrategyCount = await prisma.adminStrategy.count()
        const adminHazardStrategyCount = await prisma.adminHazardStrategy.count()
        const adminActionPlanCount = await prisma.adminActionPlan.count()
        const adminHazardActionPlanCount = await prisma.adminHazardActionPlan.count()

        console.log(`  AdminStrategy records: ${adminStrategyCount}`)
        console.log(`  AdminHazardStrategy records: ${adminHazardStrategyCount}`)
        console.log(`  AdminActionPlan records: ${adminActionPlanCount}`)
        console.log(`  AdminHazardActionPlan records: ${adminHazardActionPlanCount}`)

        if (adminStrategyCount === 0 && adminHazardStrategyCount === 0 &&
            adminActionPlanCount === 0 && adminHazardActionPlanCount === 0) {
            console.log(`\n  ✅ All tables EMPTY - SAFE TO REMOVE`)
        } else {
            console.log(`\n  ⚠️  Tables contain data - REVIEW before removal`)
        }
    } catch (error: any) {
        console.log(`  ❌ Error: ${error.message}`)
    }

    // 2. Check Location systems
    console.log('\n\n📍 CHECKING LOCATION SYSTEMS:\n')

    try {
        const adminLocationCount = await prisma.adminLocation.count()
        const adminLocationHazardCount = await prisma.adminLocationHazard.count()
        const parishCount = await prisma.parish.count()
        const parishRiskCount = await prisma.parishRisk.count()
        const countryCount = await prisma.country.count()
        const adminUnitCount = await prisma.adminUnit.count()
        const adminUnitRiskCount = await prisma.adminUnitRisk.count()

        console.log('  AdminLocation System:')
        console.log(`    AdminLocation: ${adminLocationCount} records`)
        console.log(`    AdminLocationHazard: ${adminLocationHazardCount} records`)

        console.log('\n  Parish System (LEGACY):')
        console.log(`    Parish: ${parishCount} records`)
        console.log(`    Parish Risk: ${parishRiskCount} records`)

        console.log('\n  AdminUnit System (NEW):')
        console.log(`    Country: ${countryCount} records`)
        console.log(`    AdminUnit: ${adminUnitCount} records`)
        console.log(`    AdminUnitRisk: ${adminUnitRiskCount} records`)

        if (adminLocationCount > 0 && parishCount === 0) {
            console.log('\n  ✅ AdminLocation is active, Parish is empty')
        } else if (parishCount > 0 && adminLocationCount === 0) {
            console.log('\n  ⚠️  Parish has data, AdminLocation empty - migration needed')
        } else if (adminLocationCount > 0 && parishCount > 0) {
            console.log('\n  ⚠️  BOTH systems have data - need to compare and consolidate')
        }
    } catch (error: any) {
        console.log(`  ❌ Error: ${error.message}`)
    }

    // 3. Check active systems
    console.log('\n\n✅ CHECKING ACTIVE SYSTEMS (should have data):\n')

    try {
        const hazardCount = await prisma.adminHazardType.count()
        const strategyCount = await prisma.riskMitigationStrategy.count()
        const actionStepCount = await prisma.actionStep.count()
        const businessTypeCount = await prisma.adminBusinessType.count()

        console.log(`  AdminHazardType: ${hazardCount} records`)
        console.log(`  RiskMitigationStrategy: ${strategyCount} records`)
        console.log(`  ActionStep: ${actionStepCount} records`)
        console.log(`  AdminBusinessType: ${businessTypeCount} records`)

        if (strategyCount === 0) {
            console.log('\n  ❌ WARNING: No strategies found - wizard will not work!')
        }
    } catch (error: any) {
        console.log(`  ❌ Error: ${error.message}`)
    }

    // 4. Check for orphaned relationships
    console.log('\n\n🔗 CHECKING FOREIGN KEY INTEGRITY:\n')

    try {
        const strategies = await prisma.riskMitigationStrategy.findMany({
            select: {
                strategyId: true,
                primaryRisk: true,
                secondaryRisks: true
            }
        })

        const hazards = await prisma.adminHazardType.findMany({
            select: { hazardId: true }
        })

        const hazardIds = new Set(hazards.map(h => h.hazardId))

        let orphanedPrimary = 0
        let orphanedSecondary = 0

        for (const strategy of strategies) {
            if (strategy.primaryRisk && !hazardIds.has(strategy.primaryRisk)) {
                console.log(`  ❌ Strategy ${strategy.strategyId} has invalid primaryRisk: ${strategy.primaryRisk}`)
                orphanedPrimary++
            }

            if (strategy.secondaryRisks) {
                try {
                    const secondary = JSON.parse(strategy.secondaryRisks)
                    for (const hazardId of secondary) {
                        if (!hazardIds.has(hazardId)) {
                            console.log(`  ❌ Strategy ${strategy.strategyId} has invalid secondaryRisk: ${hazardId}`)
                            orphanedSecondary++
                        }
                    }
                } catch (e) {
                    // Ignore JSON parse errors
                }
            }
        }

        if (orphanedPrimary === 0 && orphanedSecondary === 0) {
            console.log('  ✅ All strategy risk references are valid')
        } else {
            console.log(`\n  ⚠️  Found ${orphanedPrimary} orphaned primary risks, ${orphanedSecondary} orphaned secondary risks`)
        }
    } catch (error: any) {
        console.log(`  ❌ Error: ${error.message}`)
    }

    // Summary
    console.log('\n\n' + '='.repeat(80))
    console.log('DISCOVERY COMPLETE - Review findings above')
    console.log('='.repeat(80))

    await prisma.$disconnect()
}

phase1_discovery().catch(console.error)

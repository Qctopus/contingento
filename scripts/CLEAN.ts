import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// CANONICAL RISK IDS - This is the single source of truth
// All IDs should be snake_case
const CANONICAL_RISK_IDS: Record<string, string> = {
    // Natural Hazards
    'hurricane': 'hurricane',
    'Hurricane': 'hurricane',
    'flood': 'flood',
    'Flood': 'flood',
    'flooding': 'flood',  // Map "flooding" to canonical "flood"
    'Flooding': 'flood',
    'earthquake': 'earthquake',
    'Earthquake': 'earthquake',
    'drought': 'drought',
    'Drought': 'drought',
    'landslide': 'landslide',
    'Landslide': 'landslide',

    // Technical Hazards
    'power_outage': 'power_outage',
    'powerOutage': 'power_outage',
    'PowerOutage': 'power_outage',
    'fire': 'fire',
    'Fire': 'fire',

    // Human/Social Hazards
    'cyber_attack': 'cyber_attack',
    'cyberAttack': 'cyber_attack',
    'CyberAttack': 'cyber_attack',
    'terrorism': 'terrorism',
    'Terrorism': 'terrorism',
    'pandemic': 'pandemic',
    'pandemicDisease': 'pandemic',
    'PandemicDisease': 'pandemic',
    'economic_downturn': 'economic_downturn',
    'economicDownturn': 'economic_downturn',
    'EconomicDownturn': 'economic_downturn',
    'supply_chain_disruption': 'supply_chain_disruption',
    'supplyChainDisruption': 'supply_chain_disruption',
    'SupplyChainDisruption': 'supply_chain_disruption',
    'civil_unrest': 'civil_unrest',
    'civilUnrest': 'civil_unrest',
    'CivilUnrest': 'civil_unrest',
    'theft': 'theft',
    'Theft': 'theft',
    'crime': 'crime',
    'Crime': 'crime'
}

// Get the canonical ID for any variation
function getCanonicalId(riskId: string): string {
    // Check explicit mapping first
    if (CANONICAL_RISK_IDS[riskId]) {
        return CANONICAL_RISK_IDS[riskId]
    }

    // Fallback to normalization
    const normalized = riskId
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .toLowerCase()
        .replace(/[\s-]+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')

    return normalized
}

async function fixRiskIdInconsistencies() {
    console.log('🔧 FIXING RISK ID INCONSISTENCIES\n')
    console.log('='.repeat(80))

    // 1. Fix RiskMitigationStrategy applicableRisks
    console.log('\n📋 STEP 1: Fixing Strategy applicableRisks...\n')

    const strategies = await prisma.riskMitigationStrategy.findMany()
    let strategiesFixed = 0

    for (const strategy of strategies) {
        if (strategy.applicableRisks) {
            try {
                const risks = JSON.parse(strategy.applicableRisks)
                const fixedRisks = risks.map((risk: string) => getCanonicalId(risk))

                // Check if any changes were made
                const hasChanges = JSON.stringify(risks) !== JSON.stringify(fixedRisks)

                if (hasChanges) {
                    await prisma.riskMitigationStrategy.update({
                        where: { strategyId: strategy.strategyId },
                        data: { applicableRisks: JSON.stringify(fixedRisks) }
                    })

                    console.log(`✅ Fixed ${strategy.strategyId}:`)
                    console.log(`   Before: ${risks.join(', ')}`)
                    console.log(`   After:  ${fixedRisks.join(', ')}`)
                    strategiesFixed++
                }
            } catch (e) {
                console.error(`❌ Failed to fix ${strategy.strategyId}: ${e}`)
            }
        }
    }

    console.log(`\n✅ Fixed ${strategiesFixed} strategies`)

    // 2. Fix BusinessRiskVulnerability riskType
    console.log('\n📋 STEP 2: Fixing BusinessRiskVulnerability risk types...\n')

    const vulnerabilities = await prisma.businessRiskVulnerability.findMany()
    let vulnerabilitiesFixed = 0

    for (const vuln of vulnerabilities) {
        const canonical = getCanonicalId(vuln.riskType)
        if (canonical !== vuln.riskType) {
            // Check if canonical already exists
            const existing = await prisma.businessRiskVulnerability.findFirst({
                where: {
                    businessTypeId: vuln.businessTypeId,
                    riskType: canonical
                }
            })

            if (existing) {
                // Duplicate exists, delete the non-canonical one
                await prisma.businessRiskVulnerability.delete({
                    where: { id: vuln.id }
                })
                console.log(`🗑️ Deleted duplicate non-canonical vulnerability ${vuln.id}: ${vuln.riskType} (Canonical ${canonical} exists)`)
            } else {
                // No duplicate, safe to update
                await prisma.businessRiskVulnerability.update({
                    where: { id: vuln.id },
                    data: { riskType: canonical }
                })
                console.log(`✅ Fixed vulnerability ${vuln.id}: ${vuln.riskType} → ${canonical}`)
            }
            vulnerabilitiesFixed++
        }
    }

    console.log(`\n✅ Fixed ${vulnerabilitiesFixed} vulnerabilities`)

    // 3. Fix AdminUnitRisk riskProfileJson
    console.log('\n📋 STEP 3: Fixing AdminUnitRisk riskProfileJson...\n')

    const adminUnitRisks = await prisma.adminUnitRisk.findMany({
        include: { adminUnit: true }
    })
    let adminUnitsFixed = 0

    for (const aur of adminUnitRisks) {
        if (aur.riskProfileJson) {
            try {
                const profile = JSON.parse(aur.riskProfileJson)
                let hasChanges = false
                const newProfile: Record<string, any> = {}

                for (const [key, value] of Object.entries(profile)) {
                    const canonicalKey = getCanonicalId(key)
                    if (canonicalKey !== key) {
                        hasChanges = true
                    }
                    newProfile[canonicalKey] = value
                }

                if (hasChanges) {
                    await prisma.adminUnitRisk.update({
                        where: { id: aur.id },
                        data: { riskProfileJson: JSON.stringify(newProfile) }
                    })
                    console.log(`✅ Fixed AdminUnitRisk for ${aur.adminUnit?.name || aur.id}`)
                    adminUnitsFixed++
                }
            } catch (e) {
                console.error(`❌ Failed to fix AdminUnitRisk ${aur.id}: ${e}`)
            }
        }
    }

    console.log(`\n✅ Fixed ${adminUnitsFixed} admin units`)

    // 4. Display final report
    console.log('\n' + '='.repeat(80))
    console.log('📊 FINAL REPORT:')
    console.log('='.repeat(80))
    console.log(`\nStrategies fixed: ${strategiesFixed}`)
    console.log(`Vulnerabilities fixed: ${vulnerabilitiesFixed}`)
    console.log(`Admin Units fixed: ${adminUnitsFixed}`)
    console.log(`\n✅ Database risk IDs are now consistent!`)

    // 5. Verify canonical IDs are being used
    console.log('\n🔍 VERIFICATION: Checking for non-canonical IDs...\n')

    const canonicalIds = new Set(Object.values(CANONICAL_RISK_IDS))

    // Check strategies
    const allStrategyRisks = new Set<string>()
    for (const strategy of strategies) {
        if (strategy.applicableRisks) {
            try {
                const risks = JSON.parse(strategy.applicableRisks)
                risks.forEach((risk: string) => allStrategyRisks.add(risk))
            } catch { }
        }
    }

    const nonCanonicalInStrategies = Array.from(allStrategyRisks).filter(
        risk => !canonicalIds.has(risk) && risk !== 'all_hazards'
    )

    if (nonCanonicalInStrategies.length > 0) {
        console.log('⚠️ Non-canonical IDs found in strategies:', nonCanonicalInStrategies)
    } else {
        console.log('✅ All strategy risk IDs are canonical!')
    }

    console.log('\n✅ Fix complete!')
}

fixRiskIdInconsistencies()
    .catch(error => {
        console.error('Fatal error:', error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
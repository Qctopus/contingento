import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Starting Database Audit...')

    const issues: string[] = []
    const warnings: string[] = []

    // 1. Audit Business Types
    console.log('\n📋 Auditing Business Types...')
    const businessTypes = await prisma.businessType.findMany({
        include: { riskVulnerabilities: true }
    })

    for (const bt of businessTypes) {
        // Check Multilingual Fields
        checkMultilingual(bt.name, `BusinessType ${bt.businessTypeId} name`, issues, warnings)
        checkMultilingual(bt.description, `BusinessType ${bt.businessTypeId} description`, issues, warnings)

        // Check Vulnerabilities
        if (bt.riskVulnerabilities.length === 0) {
            warnings.push(`⚠️ BusinessType ${bt.businessTypeId} has no risk vulnerabilities defined.`)
        }
    }

    // 2. Audit Strategies
    console.log('\n🛡️ Auditing Strategies...')
    const strategies = await prisma.riskMitigationStrategy.findMany({
        include: {
            actionSteps: {
                include: { itemCosts: true }
            },
            itemCosts: true
        }
    })

    for (const strat of strategies) {
        checkMultilingual(strat.name, `Strategy ${strat.strategyId} name`, issues, warnings)
        checkMultilingual(strat.description, `Strategy ${strat.strategyId} description`, issues, warnings)
        checkJson(strat.benefitsBullets, `Strategy ${strat.strategyId} benefitsBullets`, issues)

        if (strat.actionSteps.length === 0) {
            warnings.push(`⚠️ Strategy ${strat.strategyId} has no action steps.`)
        }

        // Check Costs
        let hasCosts = strat.itemCosts.length > 0
        for (const step of strat.actionSteps) {
            if (step.itemCosts.length > 0) hasCosts = true
        }

        if (!hasCosts && strat.selectionTier !== 'optional') {
            warnings.push(`⚠️ Strategy ${strat.strategyId} (${strat.selectionTier}) has no associated costs (items).`)
        }
    }

    // 3. Audit Cost Items
    console.log('\n💰 Auditing Cost Items...')
    const costItems = await prisma.costItem.findMany()
    for (const item of costItems) {
        checkMultilingual(item.name, `CostItem ${item.itemId} name`, issues, warnings)

        if (item.baseUSD <= 0) {
            issues.push(`❌ CostItem ${item.itemId} has invalid baseUSD: ${item.baseUSD}`)
        }
    }

    // 4. Audit Locations (AdminUnit vs Parish)
    console.log('\n📍 Auditing Locations...')
    const adminUnits = await prisma.adminUnit.findMany({ include: { adminUnitRisk: true } })
    const parishes = await prisma.parish.findMany({ include: { parishRisk: true } })

    console.log(`   Found ${adminUnits.length} AdminUnits and ${parishes.length} Parishes.`)

    if (adminUnits.length === 0 && parishes.length > 0) {
        warnings.push(`⚠️ Using legacy Parish model only. AdminUnit table is empty. Migration might be needed.`)
    }

    // Check for missing risk profiles
    for (const unit of adminUnits) {
        if (!unit.adminUnitRisk) {
            warnings.push(`⚠️ AdminUnit ${unit.name} has no risk profile.`)
        }
    }

    // 5. Audit Risk Multipliers
    console.log('\n✖️ Auditing Risk Multipliers...')
    const multipliers = await prisma.riskMultiplier.findMany()
    for (const mult of multipliers) {
        checkMultilingual(mult.wizardQuestion, `Multiplier ${mult.name} question`, issues, warnings)

        if (mult.multiplierFactor < 0) {
            issues.push(`❌ Multiplier ${mult.name} has negative factor: ${mult.multiplierFactor}`)
        }
    }

    // Report
    const report: string[] = []
    report.push('='.repeat(50))
    report.push('🏁 AUDIT COMPLETE')
    report.push('='.repeat(50))

    if (issues.length > 0) {
        report.push(`\n❌ FOUND ${issues.length} CRITICAL ISSUES:`)
        issues.forEach(i => report.push(i))
    } else {
        report.push('\n✅ No critical issues found.')
    }

    if (warnings.length > 0) {
        report.push(`\n⚠️ FOUND ${warnings.length} WARNINGS:`)
        warnings.forEach(w => report.push(w))
    } else {
        report.push('\n✅ No warnings found.')
    }

    fs.writeFileSync('audit_results.txt', report.join('\n'))
    console.log('Audit results written to audit_results.txt')
}

function checkMultilingual(jsonStr: string | null, context: string, issues: string[], warnings: string[]) {
    if (!jsonStr) return // Optional fields might be null

    try {
        const obj = JSON.parse(jsonStr)
        if (!obj.en) {
            issues.push(`❌ ${context} missing English translation.`)
        }
        if (!obj.es) {
            warnings.push(`⚠️ ${context} missing Spanish translation.`)
        }
        if (!obj.fr) {
            warnings.push(`⚠️ ${context} missing French translation.`)
        }
    } catch (e) {
        issues.push(`❌ ${context} has invalid JSON.`)
    }
}

function checkJson(jsonStr: string | null, context: string, issues: string[]) {
    if (!jsonStr) return
    try {
        JSON.parse(jsonStr)
    } catch (e) {
        issues.push(`❌ ${context} has invalid JSON.`)
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

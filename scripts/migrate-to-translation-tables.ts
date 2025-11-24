import { PrismaClient } from '../src/generated/client'

const prisma = new PrismaClient()

async function migrateBusinessTypes() {
    console.log('Migrating BusinessTypes...')
    const businessTypes = await prisma.businessType.findMany()

    for (const bt of businessTypes) {
        const name = parseJson(bt.name)
        const description = parseJson(bt.description)
        const exampleBusinessPurposes = parseJson(bt.exampleBusinessPurposes)
        const exampleProducts = parseJson(bt.exampleProducts)
        const exampleKeyPersonnel = parseJson(bt.exampleKeyPersonnel)
        const exampleCustomerBase = parseJson(bt.exampleCustomerBase)
        const minimumEquipment = parseJson(bt.minimumEquipment)

        for (const locale of ['en', 'es', 'fr']) {
            const data = {
                businessTypeId: bt.id,
                locale,
                name: extractLocale(name, locale),
                description: extractLocale(description, locale),
                exampleBusinessPurposes: extractArrayLocale(exampleBusinessPurposes, locale),
                exampleProducts: extractArrayLocale(exampleProducts, locale),
                exampleKeyPersonnel: extractArrayLocale(exampleKeyPersonnel, locale),
                exampleCustomerBase: extractArrayLocale(exampleCustomerBase, locale),
                minimumEquipment: extractArrayLocale(minimumEquipment, locale),
            }

            // Only create if we have at least a name
            if (data.name) {
                await prisma.businessTypeTranslation.upsert({
                    where: {
                        businessTypeId_locale: {
                            businessTypeId: bt.id,
                            locale
                        }
                    },
                    update: data,
                    create: data
                })
            }
        }
    }
}

async function migrateStrategies() {
    console.log('Migrating Strategies...')
    const strategies = await prisma.riskMitigationStrategy.findMany()

    for (const s of strategies) {
        const name = parseJson(s.name)
        const description = parseJson(s.description)
        const smeTitle = parseJson(s.smeTitle)
        const smeSummary = parseJson(s.smeSummary)
        const realWorldExample = parseJson(s.realWorldExample)
        const whyImportant = parseJson(s.whyImportant)
        const benefitsBullets = parseJson(s.benefitsBullets)
        const helpfulTips = parseJson(s.helpfulTips)
        const commonMistakes = parseJson(s.commonMistakes)
        const successMetrics = parseJson(s.successMetrics)
        const lowBudgetAlternative = parseJson(s.lowBudgetAlternative)

        for (const locale of ['en', 'es', 'fr']) {
            const data = {
                strategyId: s.id,
                locale,
                name: extractLocale(name, locale),
                description: extractLocale(description, locale),
                smeTitle: extractLocale(smeTitle, locale),
                smeSummary: extractLocale(smeSummary, locale),
                realWorldExample: extractLocale(realWorldExample, locale),
                whyImportant: extractLocale(whyImportant, locale),
                benefitsBullets: extractArrayLocale(benefitsBullets, locale),
                helpfulTips: extractArrayLocale(helpfulTips, locale),
                commonMistakes: extractArrayLocale(commonMistakes, locale),
                successMetrics: extractArrayLocale(successMetrics, locale),
                lowBudgetAlternative: extractLocale(lowBudgetAlternative, locale),
            }

            if (data.name) {
                await prisma.strategyTranslation.upsert({
                    where: {
                        strategyId_locale: {
                            strategyId: s.id,
                            locale
                        }
                    },
                    update: data,
                    create: data
                })
            }
        }
    }
}

async function migrateActionSteps() {
    console.log('Migrating ActionSteps...')
    const steps = await prisma.actionStep.findMany()

    for (const step of steps) {
        const title = parseJson(step.title)
        const description = parseJson(step.description)
        const smeAction = parseJson(step.smeAction)
        const timeframe = parseJson(step.timeframe)
        const whyThisStepMatters = parseJson(step.whyThisStepMatters)
        const howToKnowItsDone = parseJson(step.howToKnowItsDone)
        const whatHappensIfSkipped = parseJson(step.whatHappensIfSkipped)
        const exampleOutput = parseJson(step.exampleOutput)
        const freeAlternative = parseJson(step.freeAlternative)
        const lowTechOption = parseJson(step.lowTechOption)
        const commonMistakesForStep = parseJson(step.commonMistakesForStep)

        for (const locale of ['en', 'es', 'fr']) {
            const data = {
                actionStepId: step.id,
                locale,
                title: extractLocale(title, locale),
                description: extractLocale(description, locale),
                smeAction: extractLocale(smeAction, locale),
                timeframe: extractLocale(timeframe, locale),
                whyThisStepMatters: extractLocale(whyThisStepMatters, locale),
                howToKnowItsDone: extractLocale(howToKnowItsDone, locale),
                whatHappensIfSkipped: extractLocale(whatHappensIfSkipped, locale),
                exampleOutput: extractLocale(exampleOutput, locale),
                freeAlternative: extractLocale(freeAlternative, locale),
                lowTechOption: extractLocale(lowTechOption, locale),
                commonMistakesForStep: extractArrayLocale(commonMistakesForStep, locale),
            }

            if (data.title) {
                await prisma.actionStepTranslation.upsert({
                    where: {
                        actionStepId_locale: {
                            actionStepId: step.id,
                            locale
                        }
                    },
                    update: data,
                    create: data
                })
            }
        }
    }
}

async function migrateRiskMultipliers() {
    console.log('Migrating RiskMultipliers...')
    const multipliers = await prisma.riskMultiplier.findMany()

    for (const m of multipliers) {
        // name and description might be simple strings in Admin, but let's check
        const name = parseJson(m.name)
        const description = parseJson(m.description)
        const reasoning = parseJson(m.reasoning)
        const wizardQuestion = parseJson(m.wizardQuestion)
        const wizardHelpText = parseJson(m.wizardHelpText)
        const wizardAnswerOptions = parseJson(m.wizardAnswerOptions)

        for (const locale of ['en', 'es', 'fr']) {
            const data = {
                riskMultiplierId: m.id,
                locale,
                name: extractLocale(name, locale),
                description: extractLocale(description, locale),
                reasoning: extractLocale(reasoning, locale),
                wizardQuestion: extractLocale(wizardQuestion, locale),
                wizardHelpText: extractLocale(wizardHelpText, locale),
                wizardAnswerOptions: extractArrayLocale(wizardAnswerOptions, locale)
            }

            if (data.name) {
                await prisma.riskMultiplierTranslation.upsert({
                    where: {
                        riskMultiplierId_locale: {
                            riskMultiplierId: m.id,
                            locale
                        }
                    },
                    update: data,
                    create: data
                })
            }
        }
    }
}

async function migrateHazards() {
    console.log('Migrating Hazards...')
    const hazards = await prisma.adminHazardType.findMany()

    for (const h of hazards) {
        const name = parseJson(h.name)
        const description = parseJson(h.description)

        for (const locale of ['en', 'es', 'fr']) {
            const data = {
                hazardId: h.id,
                locale,
                name: extractLocale(name, locale),
                description: extractLocale(description, locale),
            }

            if (data.name) {
                await prisma.hazardTranslation.upsert({
                    where: {
                        hazardId_locale: {
                            hazardId: h.id,
                            locale
                        }
                    },
                    update: data,
                    create: data
                })
            }
        }
    }
}

// Helper functions
function parseJson(field: any) {
    if (!field) return null
    if (typeof field === 'string') {
        try {
            // Try to parse as JSON
            const parsed = JSON.parse(field)
            // If it's a string after parsing (e.g. JSON string "foo"), it might be just a string
            // But we expect objects {en: "..."} or arrays ["..."]
            return parsed
        } catch {
            return { en: field } // Assume English if not JSON
        }
    }
    return field
}

function extractLocale(data: any, locale: string): string {
    if (!data) return ''
    if (typeof data === 'string') return locale === 'en' ? data : ''
    if (data[locale]) return data[locale]
    return data.en || ''
}

function extractArrayLocale(data: any, locale: string): any {
    if (!data) return []
    if (Array.isArray(data)) {
        // If it's an array of strings, assume it's English or shared
        // But if it's an array of objects with locales?
        // The schema says: exampleBusinessPurposes String? // JSON array: [{ en, fr, es }]
        // Wait, schema comment says: JSON array: [{ en, fr, es }]
        // But implementation plan says: exampleBusinessPurposes Json? // ["purpose1", "purpose2"]

        // Let's look at the data structure.
        // If the input is [{en: "p1", es: "p1_es"}, {en: "p2", es: "p2_es"}]
        // We want ["p1", "p2"] for en.

        if (data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0])) {
            return data.map((item: any) => item[locale] || item.en || '').filter((s: string) => s !== '')
        }

        // If it's just ["p1", "p2"], return it for en, empty for others?
        // Or maybe return it for all?
        // Let's assume if it's simple strings, it's English.
        return locale === 'en' ? data : []
    }
    if (data[locale]) return data[locale]
    return data.en || []
}

async function main() {
    try {
        await migrateBusinessTypes()
        await migrateStrategies()
        await migrateActionSteps()
        await migrateRiskMultipliers()
        await migrateHazards()
        console.log('Migration completed successfully.')
    } catch (e) {
        console.error('Migration failed:', e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()

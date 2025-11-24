import { PrismaClient } from '@prisma/client'
import type { Locale } from '@/i18n/config'

const prisma = new PrismaClient()

export class MultilingualDataService {
    constructor(private prismaClient: PrismaClient = prisma, private locale: Locale = 'en') { }

    async getBusinessTypes() {
        const businessTypes = await this.prismaClient.businessType.findMany({
            where: { isActive: true },
            include: {
                translations: {
                    where: { locale: this.locale }
                },
                riskVulnerabilities: true
            }
        })

        return businessTypes.map(bt => {
            const translation = bt.translations[0] || {}
            return {
                ...bt,
                name: translation.name || '',
                description: translation.description || '',
                exampleBusinessPurposes: translation.exampleBusinessPurposes || [],
                exampleProducts: translation.exampleProducts || [],
                exampleKeyPersonnel: translation.exampleKeyPersonnel || [],
                exampleCustomerBase: translation.exampleCustomerBase || [],
                minimumEquipment: translation.minimumEquipment || [],
                translations: undefined
            }
        })
    }

    async getBusinessType(id: string) {
        const bt = await this.prismaClient.businessType.findUnique({
            where: { businessTypeId: id },
            include: {
                translations: { where: { locale: this.locale } },
                riskVulnerabilities: true
            }
        })

        if (!bt) return null

        const translation = bt.translations[0] || {}
        return {
            ...bt,
            name: translation.name || '',
            description: translation.description || '',
            exampleBusinessPurposes: translation.exampleBusinessPurposes || [],
            exampleProducts: translation.exampleProducts || [],
            exampleKeyPersonnel: translation.exampleKeyPersonnel || [],
            exampleCustomerBase: translation.exampleCustomerBase || [],
            minimumEquipment: translation.minimumEquipment || [],
            translations: undefined
        }
    }

    async getStrategies(filters?: {
        risks?: string[],
        businessTypes?: string[]
    }) {
        const where: any = { isActive: true }

        if (filters?.risks) {
            where.applicableRisks = {
                array_contains: filters.risks
            }
        }

        const strategies = await this.prismaClient.riskMitigationStrategy.findMany({
            where,
            include: {
                translations: {
                    where: { locale: this.locale }
                },
                actionSteps: {
                    orderBy: {
                        sortOrder: 'asc'
                    },
                    include: {
                        translations: {
                            where: { locale: this.locale }
                        },
                        itemCosts: {
                            include: {
                                item: true
                            }
                        }
                    }
                }
            }
        })

        return strategies.map(strategy => {
            const t = strategy.translations[0] || {}
            return {
                ...strategy,
                name: t.name || '',
                description: t.description || '',
                smeTitle: t.smeTitle || '',
                smeSummary: t.smeSummary || '',
                benefitsBullets: t.benefitsBullets || [],
                helpfulTips: t.helpfulTips || [],
                commonMistakes: t.commonMistakes || [],
                successMetrics: t.successMetrics || [],
                realWorldExample: t.realWorldExample || '',
                whyImportant: t.whyImportant || '',
                lowBudgetAlternative: t.lowBudgetAlternative || '',

                actionSteps: strategy.actionSteps.map(step => {
                    const st = step.translations[0] || {}
                    return {
                        ...step,
                        title: st.title || '',
                        description: st.description || '',
                        smeAction: st.smeAction || '',
                        timeframe: st.timeframe || '',
                        whyThisStepMatters: st.whyThisStepMatters || '',
                        howToKnowItsDone: st.howToKnowItsDone || '',
                        whatHappensIfSkipped: st.whatHappensIfSkipped || '',
                        exampleOutput: st.exampleOutput || '',
                        freeAlternative: st.freeAlternative || '',
                        lowTechOption: st.lowTechOption || '',
                        commonMistakesForStep: st.commonMistakesForStep || [],
                        translations: undefined
                    }
                }),
                translations: undefined
            }
        })
    }

    async getRiskMultipliers() {
        const multipliers = await this.prismaClient.riskMultiplier.findMany({
            where: { isActive: true },
            include: {
                translations: {
                    where: { locale: this.locale }
                }
            }
        })

        return multipliers.map(m => {
            const t = m.translations[0] || {}
            return {
                ...m,
                name: t.name || m.name, // Fallback to admin name if no translation
                description: t.description || m.description,
                reasoning: t.reasoning || m.reasoning,
                wizardQuestion: t.wizardQuestion || '',
                wizardHelpText: t.wizardHelpText || '',
                wizardAnswerOptions: t.wizardAnswerOptions || [],
                translations: undefined
            }
        })
    }

    // Admin method to get all translations for editing
    async getStrategyWithAllTranslations(strategyId: string) {
        return await this.prismaClient.riskMitigationStrategy.findUnique({
            where: { id: strategyId },
            include: {
                translations: true,
                actionSteps: {
                    include: {
                        translations: true
                    }
                }
            }
        })
    }

    // Admin method to update translations
    async updateStrategyTranslations(
        strategyId: string,
        translations: Record<Locale, any>
    ) {
        const updates = Object.entries(translations).map(([locale, data]) =>
            this.prismaClient.strategyTranslation.upsert({
                where: {
                    strategyId_locale: {
                        strategyId,
                        locale
                    }
                },
                update: data,
                create: {
                    strategyId,
                    locale,
                    ...data
                }
            })
        )

        return await this.prismaClient.$transaction(updates)
    }
}

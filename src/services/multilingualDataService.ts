import { PrismaClient } from '@prisma/client'
import type { Locale } from '@/i18n/config'

const prisma = new PrismaClient()

export class MultilingualDataService {
    constructor(private prismaClient: PrismaClient = prisma, private locale: Locale = 'en') { }

    async getBusinessTypes() {
        const businessTypes = await this.prismaClient.businessType.findMany({
            where: { isActive: true },
            include: {
                BusinessTypeTranslation: {
                    where: { locale: this.locale }
                },
                BusinessRiskVulnerability: true
            }
        })

        return businessTypes.map(bt => {
            const translation = bt.BusinessTypeTranslation?.[0] || {}
            return {
                ...bt,
                name: translation.name || '',
                description: translation.description || '',
                exampleBusinessPurposes: translation.exampleBusinessPurposes || [],
                exampleProducts: translation.exampleProducts || [],
                exampleKeyPersonnel: translation.exampleKeyPersonnel || [],
                exampleCustomerBase: translation.exampleCustomerBase || [],
                minimumEquipment: translation.minimumEquipment || [],
                BusinessTypeTranslation: undefined,
                BusinessRiskVulnerability: undefined
            }
        })
    }

    async getBusinessType(id: string) {
        const bt = await this.prismaClient.businessType.findUnique({
            where: { businessTypeId: id },
            include: {
                BusinessTypeTranslation: { where: { locale: this.locale } },
                BusinessRiskVulnerability: true
            }
        })

        if (!bt) return null

        const translation = bt.BusinessTypeTranslation?.[0] || {}
        return {
            ...bt,
            name: translation.name || '',
            description: translation.description || '',
            exampleBusinessPurposes: translation.exampleBusinessPurposes || [],
            exampleProducts: translation.exampleProducts || [],
            exampleKeyPersonnel: translation.exampleKeyPersonnel || [],
            exampleCustomerBase: translation.exampleCustomerBase || [],
            minimumEquipment: translation.minimumEquipment || [],
            BusinessTypeTranslation: undefined,
            BusinessRiskVulnerability: undefined
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
                StrategyTranslation: {
                    where: { locale: this.locale }
                },
                ActionStep: {
                    orderBy: {
                        sortOrder: 'asc'
                    },
                    include: {
                        ActionStepTranslation: {
                            where: { locale: this.locale }
                        },
                        ActionStepItemCost: {
                            include: {
                                CostItem: true
                            }
                        }
                    }
                }
            }
        })

        return strategies.map(strategy => {
            const t = strategy.StrategyTranslation?.[0] || {}
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

                actionSteps: (strategy.ActionStep || []).map(step => {
                    const st = step.ActionStepTranslation?.[0] || {}
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
                        // Keep cost items for cost calculation
                        itemCosts: (step.ActionStepItemCost || []).map((ic: any) => ({
                            id: ic.id,
                            itemId: ic.itemId,
                            quantity: ic.quantity || 1,
                            customNotes: ic.customNotes,
                            item: ic.CostItem ? {
                                itemId: ic.CostItem.itemId,
                                name: ic.CostItem.name,
                                description: ic.CostItem.description,
                                category: ic.CostItem.category,
                                baseUSD: ic.CostItem.baseUSD,
                                baseUSDMin: ic.CostItem.baseUSDMin,
                                baseUSDMax: ic.CostItem.baseUSDMax,
                                unit: ic.CostItem.unit,
                                complexity: ic.CostItem.complexity
                            } : null
                        })),
                        ActionStepTranslation: undefined,
                        ActionStepItemCost: undefined
                    }
                }),
                StrategyTranslation: undefined,
                ActionStep: undefined
            }
        })
    }

    async getRiskMultipliers() {
        const multipliers = await this.prismaClient.riskMultiplier.findMany({
            where: { isActive: true },
            include: {
                RiskMultiplierTranslation: {
                    where: { locale: this.locale }
                }
            }
        })

        return multipliers.map(m => {
            const t = m.RiskMultiplierTranslation?.[0] || {}
            return {
                ...m,
                name: t.name || '',
                description: t.description || '',
                reasoning: t.reasoning || '',
                wizardQuestion: t.wizardQuestion || '',
                wizardHelpText: t.wizardHelpText || '',
                wizardAnswerOptions: t.wizardAnswerOptions || [],
                RiskMultiplierTranslation: undefined
            }
        })
    }

    // Admin method to get all translations for editing
    async getStrategyWithAllTranslations(strategyId: string) {
        return await this.prismaClient.riskMitigationStrategy.findUnique({
            where: { id: strategyId },
            include: {
                StrategyTranslation: true,
                ActionStep: {
                    include: {
                        ActionStepTranslation: true
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

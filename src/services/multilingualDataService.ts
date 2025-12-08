import { PrismaClient } from '@prisma/client'
import type { Locale } from '@/i18n/config'
import { locales } from '@/i18n/config'
import { 
  withTranslation, 
  withAllTranslations, 
  extractTranslation,
  getMissingTranslations 
} from '@/lib/db/translationHelpers'

const prisma = new PrismaClient()

export class MultilingualDataService {
    constructor(private prismaClient: PrismaClient = prisma, private locale: Locale = 'en') { }

    async getBusinessTypes() {
        const businessTypes = await this.prismaClient.businessType.findMany({
            where: { isActive: true },
            include: {
                BusinessTypeTranslation: withTranslation(this.locale),
                BusinessRiskVulnerability: true
            }
        })

        return businessTypes.map(bt => {
            const translation = extractTranslation(bt.BusinessTypeTranslation, this.locale) || {}
            return {
                ...bt,
                name: (translation as any).name || '',
                description: (translation as any).description || '',
                exampleBusinessPurposes: (translation as any).exampleBusinessPurposes || [],
                exampleProducts: (translation as any).exampleProducts || [],
                exampleKeyPersonnel: (translation as any).exampleKeyPersonnel || [],
                exampleCustomerBase: (translation as any).exampleCustomerBase || [],
                minimumEquipment: (translation as any).minimumEquipment || [],
                BusinessTypeTranslation: undefined,
                BusinessRiskVulnerability: undefined
            }
        })
    }

    async getBusinessType(id: string) {
        const bt = await this.prismaClient.businessType.findUnique({
            where: { businessTypeId: id },
            include: {
                BusinessTypeTranslation: withTranslation(this.locale),
                BusinessRiskVulnerability: true
            }
        })

        if (!bt) return null

        const translation = extractTranslation(bt.BusinessTypeTranslation, this.locale) || {}
        return {
            ...bt,
            name: (translation as any).name || '',
            description: (translation as any).description || '',
            exampleBusinessPurposes: (translation as any).exampleBusinessPurposes || [],
            exampleProducts: (translation as any).exampleProducts || [],
            exampleKeyPersonnel: (translation as any).exampleKeyPersonnel || [],
            exampleCustomerBase: (translation as any).exampleCustomerBase || [],
            minimumEquipment: (translation as any).minimumEquipment || [],
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
                StrategyTranslation: withTranslation(this.locale),
                ActionStep: {
                    orderBy: {
                        sortOrder: 'asc'
                    },
                    include: {
                        ActionStepTranslation: withTranslation(this.locale),
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
            const t = extractTranslation(strategy.StrategyTranslation, this.locale) || {} as any
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
                    const st = extractTranslation(step.ActionStepTranslation, this.locale) || {} as any
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
                RiskMultiplierTranslation: withTranslation(this.locale)
            }
        })

        return multipliers.map(m => {
            const t = extractTranslation(m.RiskMultiplierTranslation, this.locale) || {} as any
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
                StrategyTranslation: withAllTranslations,
                ActionStep: {
                    include: {
                        ActionStepTranslation: withAllTranslations
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

    // Admin method to get missing translations for a strategy
    async getStrategyMissingTranslations(strategyId: string) {
        const strategy = await this.prismaClient.riskMitigationStrategy.findUnique({
            where: { id: strategyId },
            include: {
                StrategyTranslation: { select: { locale: true } },
                ActionStep: {
                    include: {
                        ActionStepTranslation: { select: { locale: true } }
                    }
                }
            }
        })

        if (!strategy) return null

        return {
            strategyId,
            strategyMissing: getMissingTranslations(strategy.StrategyTranslation),
            actionStepsMissing: strategy.ActionStep.map(step => ({
                stepId: step.stepId,
                missing: getMissingTranslations(step.ActionStepTranslation)
            })).filter(s => s.missing.length > 0)
        }
    }
}

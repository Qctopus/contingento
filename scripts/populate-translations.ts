
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateLegacyToTranslation() {
  console.log('🚀 Starting migration of legacy data to translation tables...')

  try {
    // 1. Migrate Business Types
    console.log('\n🏢 Migrating Business Types...')
    const businessTypes = await prisma.businessType.findMany({
      include: { BusinessTypeTranslation: true }
    })

    for (const bt of businessTypes) {
      const hasEnTranslation = bt.BusinessTypeTranslation.some(t => t.locale === 'en')
      
      if (!hasEnTranslation) {
        console.log(`   - Migrating ${bt.businessTypeId}...`)
        await prisma.businessTypeTranslation.create({
          data: {
            businessTypeId: bt.id,
            locale: 'en',
            name: bt.name || bt.businessTypeId,
            description: bt.description,
            exampleBusinessPurposes: bt.exampleBusinessPurposes ? JSON.parse(bt.exampleBusinessPurposes) : [],
            exampleProducts: bt.exampleProducts ? JSON.parse(bt.exampleProducts) : [],
            exampleKeyPersonnel: bt.exampleKeyPersonnel ? JSON.parse(bt.exampleKeyPersonnel) : [],
            exampleCustomerBase: bt.exampleCustomerBase ? JSON.parse(bt.exampleCustomerBase) : [],
            minimumEquipment: bt.minimumEquipment ? JSON.parse(bt.minimumEquipment) : []
          }
        })
      } else {
        // console.log(`   - Skipped ${bt.businessTypeId} (already has EN translation)`)
      }
    }

    // 2. Migrate Strategies
    console.log('\n🛡️ Migrating Strategies...')
    // Note: Strategy schema in legacy might differ, checking field existence
    // Based on previous analysis, Strategy table has: name, description, smeTitle, etc.
    const strategies = await prisma.riskMitigationStrategy.findMany({
        include: { StrategyTranslation: true }
    })

    for (const strategy of strategies) {
        const hasEnTranslation = strategy.StrategyTranslation.some(t => t.locale === 'en')
        
        if (!hasEnTranslation) {
            console.log(`   - Migrating strategy ${strategy.strategyId}...`)
            await prisma.strategyTranslation.create({
                data: {
                    strategyId: strategy.id,
                    locale: 'en',
                    name: (strategy as any).name || 'Untitled Strategy', // casting as any if types outdated
                    description: (strategy as any).description || '',
                    smeTitle: (strategy as any).smeTitle,
                    smeSummary: (strategy as any).smeSummary,
                    benefitsBullets: (strategy as any).benefitsBullets, // It's JSON in main table? Schema says Json?
                    helpfulTips: (strategy as any).helpfulTips,
                    commonMistakes: (strategy as any).commonMistakes,
                    successMetrics: (strategy as any).successMetrics,
                    realWorldExample: (strategy as any).realWorldExample,
                    whyImportant: (strategy as any).whyImportant,
                    lowBudgetAlternative: (strategy as any).lowBudgetAlternative,
                    diyApproach: (strategy as any).diyApproach,
                    bcpTemplateText: (strategy as any).bcpTemplateText
                }
            })
        }
    }

    // 3. Migrate Action Steps
    console.log('\n👣 Migrating Action Steps...')
    // Fetch batches to avoid memory issues if many
    const actionSteps = await prisma.actionStep.findMany({
        include: { ActionStepTranslation: true },
        // where: { ActionStepTranslation: { none: {} } } // Only those without translations? 
        // No, we need to check for specific locale 'en'
    })

    let stepCount = 0
    for (const step of actionSteps) {
        const hasEnTranslation = step.ActionStepTranslation.some(t => t.locale === 'en')
        
        if (!hasEnTranslation) {
            // console.log(`   - Migrating step ${step.stepId}...`)
            // We need to get the data from the step itself. 
            // The type definition might hide legacy fields if schema.prisma was updated but DB still has columns.
            // We cast to 'any' to access potential legacy fields if they exist in the runtime object
            const legacyStep = step as any
            
            await prisma.actionStepTranslation.create({
                data: {
                    actionStepId: step.id,
                    locale: 'en',
                    title: legacyStep.title || 'Untitled Step', // Legacy column might be 'title' or 'action'
                    description: legacyStep.description || legacyStep.action,
                    smeAction: legacyStep.smeAction,
                    timeframe: legacyStep.timeframe,
                    whyThisStepMatters: legacyStep.whyThisStepMatters,
                    howToKnowItsDone: legacyStep.howToKnowItsDone,
                    whatHappensIfSkipped: legacyStep.whatHappensIfSkipped,
                    exampleOutput: legacyStep.exampleOutput,
                    freeAlternative: legacyStep.freeAlternative,
                    lowTechOption: legacyStep.lowTechOption,
                    commonMistakesForStep: legacyStep.commonMistakesForStep
                }
            })
            stepCount++
        }
    }
    console.log(`   - Migrated ${stepCount} action steps.`)

    console.log('\n✅ Migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateLegacyToTranslation()




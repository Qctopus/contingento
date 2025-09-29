/**
 * Migration script to populate ActionStep table with data from strategy templates
 * This moves action steps from the templates file into the database for proper relational structure
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateActionSteps() {
  try {
    console.log('🔄 Starting action steps migration...')

    // Import strategy templates - using dynamic import for ES modules
    const { strategyTemplates } = await import('../src/services/strategyTemplates.ts')
    
    console.log(`📋 Found ${strategyTemplates.length} strategy templates`)

    let totalActionSteps = 0
    let createdActionSteps = 0
    let updatedStrategies = 0

    for (const template of strategyTemplates) {
      try {
        // Find the corresponding strategy in the database
        const strategy = await prisma.riskMitigationStrategy.findUnique({
          where: { strategyId: template.id }
        })

        if (!strategy) {
          console.log(`⚠️  Strategy not found in DB: ${template.id} - ${template.name}`)
          continue
        }

        // Update strategy with additional fields from template
        await prisma.riskMitigationStrategy.update({
          where: { id: strategy.id },
          data: {
            smeDescription: template.simplifiedDescription || null,
            whyImportant: template.whyImportant || null,
            helpfulTips: JSON.stringify(template.helpfulTips || []),
            commonMistakes: JSON.stringify(template.commonMistakes || []),
            successMetrics: JSON.stringify(template.successMetrics || [])
          }
        })
        updatedStrategies++

        // Delete existing action steps for this strategy (in case we're re-running)
        await prisma.actionStep.deleteMany({
          where: { strategyId: strategy.id }
        })

        // Create action steps from template
        if (template.implementationSteps && template.implementationSteps.length > 0) {
          for (let i = 0; i < template.implementationSteps.length; i++) {
            const step = template.implementationSteps[i]
            
            await prisma.actionStep.create({
              data: {
                strategyId: strategy.id,
                stepId: `step_${i + 1}`,
                phase: step.phase || 'immediate',
                title: step.title || `Step ${i + 1}`,
                description: step.description || '',
                smeAction: step.title || step.description || '',
                timeframe: step.timeframe || '',
                responsibility: step.responsibility || '',
                estimatedCost: step.estimatedCost || '',
                estimatedCostJMD: step.estimatedCost || '',
                resources: JSON.stringify(step.resources || []),
                checklist: JSON.stringify(step.checklist || []),
                sortOrder: i
              }
            })
            createdActionSteps++
          }
          totalActionSteps += template.implementationSteps.length
        }

        console.log(`✅ Migrated ${template.implementationSteps?.length || 0} action steps for: ${template.name}`)

      } catch (error) {
        console.error(`❌ Error migrating strategy ${template.id}:`, error.message)
      }
    }

    console.log('\n📊 Migration Summary:')
    console.log(`   Strategies updated: ${updatedStrategies}`)
    console.log(`   Total action steps: ${totalActionSteps}`)
    console.log(`   Action steps created: ${createdActionSteps}`)
    console.log('\n✅ Action steps migration completed!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
if (require.main === module) {
  migrateActionSteps()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = { migrateActionSteps }

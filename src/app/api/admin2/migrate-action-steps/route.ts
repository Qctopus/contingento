import { NextRequest, NextResponse } from 'next/server'
import { 
  getPrismaClient, 
  withDatabase, 
  createSuccessResponse, 
  handleApiError
} from '@/lib/admin2/api-utils'
import { strategyTemplates } from '@/services/strategyTemplates'

export async function POST(request: NextRequest) {
  try {
    const result = await withDatabase(async () => {
      const prisma = getPrismaClient()
      
      console.log('🔄 Starting action steps migration...')
      console.log(`📋 Found ${strategyTemplates.length} strategy templates`)

      // First, let's check what strategies exist in the database
      const allStrategies = await prisma.riskMitigationStrategy.findMany()
      console.log(`🗃️  Found ${allStrategies.length} strategies in database:`)
      allStrategies.forEach(s => console.log(`    ${s.strategyId} - ${s.name}`))

      let totalActionSteps = 0
      let createdActionSteps = 0
      let updatedStrategies = 0

      for (const template of strategyTemplates) {
        try {
          console.log(`🔍 Looking for strategy: ${template.id}`)
          
          // Find the corresponding strategy in the database
          const strategy = await prisma.riskMitigationStrategy.findUnique({
            where: { strategyId: template.id }
          })

          if (!strategy) {
            console.log(`⚠️  Strategy not found in DB: ${template.id} - ${template.name}`)
            continue
          }
          
          console.log(`✅ Found strategy in DB: ${strategy.strategyId} (${strategy.id})`)

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
          console.error(`❌ Error migrating strategy ${template.id}:`, error)
        }
      }

      return {
        strategiesUpdated: updatedStrategies,
        totalActionSteps,
        actionStepsCreated: createdActionSteps
      }
    }, 'POST /api/admin2/migrate-action-steps')

    console.log('\n📊 Migration Summary:')
    console.log(`   Strategies updated: ${result.strategiesUpdated}`)
    console.log(`   Total action steps: ${result.totalActionSteps}`)
    console.log(`   Action steps created: ${result.actionStepsCreated}`)
    console.log('\n✅ Action steps migration completed!')

    return createSuccessResponse({
      message: 'Action steps migration completed successfully',
      details: result
    })

  } catch (error) {
    return handleApiError(error, 'Failed to migrate action steps')
  }
}

/**
 * Migration Script: Convert Legacy Strategies to Cost Items Structure
 * 
 * This script converts any existing strategies that use text-based costs
 * to the new structured cost items approach.
 * 
 * Usage: npx ts-node scripts/migrate-strategies-to-cost-items.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapping of common cost text to cost item IDs
const COST_TEXT_TO_ITEMS: Record<string, { itemId: string; quantity: number }[]> = {
  // Generator related
  'generator': [
    { itemId: 'generator_5kw_diesel', quantity: 1 }
  ],
  'backup generator': [
    { itemId: 'generator_5kw_diesel', quantity: 1 }
  ],
  'generator system': [
    { itemId: 'generator_5kw_diesel', quantity: 1 },
    { itemId: 'generator_fuel_diesel', quantity: 2 }
  ],
  
  // Hurricane protection
  'hurricane shutters': [
    { itemId: 'hurricane_shutters_accordion', quantity: 4 }
  ],
  'storm shutters': [
    { itemId: 'hurricane_shutters_accordion', quantity: 4 }
  ],
  'plywood boards': [
    { itemId: 'plywood_hurricane_boards', quantity: 6 }
  ],
  
  // Water systems
  'water tank': [
    { itemId: 'water_tank_500l', quantity: 1 }
  ],
  'water storage': [
    { itemId: 'water_tank_500l', quantity: 1 }
  ],
  
  // Fire safety
  'fire extinguisher': [
    { itemId: 'fire_extinguisher_10lb', quantity: 2 }
  ],
  'smoke detector': [
    { itemId: 'smoke_detector_commercial', quantity: 5 }
  ],
  
  // Security
  'security camera': [
    { itemId: 'security_camera_4ch', quantity: 1 }
  ],
  'alarm system': [
    { itemId: 'alarm_system_basic', quantity: 1 }
  ],
  
  // Emergency supplies
  'emergency supplies': [
    { itemId: 'emergency_food_2weeks', quantity: 5 },
    { itemId: 'first_aid_kit_commercial', quantity: 1 }
  ],
  'first aid': [
    { itemId: 'first_aid_kit_commercial', quantity: 1 }
  ],
  
  // Services
  'installation': [
    { itemId: 'installation_professional', quantity: 1 }
  ],
  'training': [
    { itemId: 'training_emergency_response', quantity: 1 }
  ]
}

async function migrateStrategies() {
  console.log('🔄 Starting migration of strategies to cost items structure...\n')
  
  try {
    // Get all active strategies
    const strategies = await prisma.riskMitigationStrategy.findMany({
      where: { isActive: true },
      include: {
        actionSteps: {
          where: { isActive: true }
        }
      }
    })
    
    console.log(`📊 Found ${strategies.length} strategies to review\n`)
    
    let strategiesUpdated = 0
    let stepsWithCostItems = 0
    let stepsSkipped = 0
    
    for (const strategy of strategies) {
      console.log(`🛡️  Strategy: ${strategy.name}`)
      
      let strategyHasUpdates = false
      
      for (const step of strategy.actionSteps) {
        // Check if step already has cost items
        const existingCostItems = await prisma.actionStepItemCost.findMany({
          where: { actionStepId: step.id }
        })
        
        if (existingCostItems.length > 0) {
          console.log(`   ✓ Step already has ${existingCostItems.length} cost items - skipping`)
          stepsSkipped++
          continue
        }
        
        // Try to find cost items from description or cost field (if it existed)
        const stepText = (step.description || step.title || '').toLowerCase()
        let itemsToAdd: { itemId: string; quantity: number }[] = []
        
        // Try to match against our mapping
        for (const [keyword, items] of Object.entries(COST_TEXT_TO_ITEMS)) {
          if (stepText.includes(keyword)) {
            itemsToAdd = items
            break
          }
        }
        
        if (itemsToAdd.length > 0) {
          console.log(`   + Adding ${itemsToAdd.length} cost item(s) to step: ${step.title || step.description}`)
          
          for (const item of itemsToAdd) {
            try {
              await prisma.actionStepItemCost.create({
                data: {
                  actionStepId: step.id,
                  itemId: item.itemId,
                  quantity: item.quantity,
                  customNotes: 'Auto-migrated from legacy cost field'
                }
              })
              stepsWithCostItems++
              strategyHasUpdates = true
            } catch (error) {
              console.error(`   ⚠️  Error adding cost item ${item.itemId}:`, error)
            }
          }
        } else {
          console.log(`   ⚠️  No cost items found for step: ${step.title || step.description}`)
        }
      }
      
      if (strategyHasUpdates) {
        strategiesUpdated++
      }
      
      console.log('') // Blank line between strategies
    }
    
    console.log('\n✅ Migration complete!')
    console.log(`   - Strategies reviewed: ${strategies.length}`)
    console.log(`   - Strategies updated: ${strategiesUpdated}`)
    console.log(`   - Steps with new cost items: ${stepsWithCostItems}`)
    console.log(`   - Steps skipped (already had items): ${stepsSkipped}`)
    console.log('\n💡 Note: Some steps may not have been auto-migrated.')
    console.log('   Please review strategies in the admin panel and add cost items manually where needed.')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
if (require.main === module) {
  migrateStrategies()
    .then(() => {
      console.log('\n🎉 Migration script completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error)
      process.exit(1)
    })
}

export { migrateStrategies }







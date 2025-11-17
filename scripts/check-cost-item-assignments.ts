/**
 * Check and Fix Cost Item Assignments
 * 
 * This script checks cost items assigned to strategies and identifies incorrect assignments
 * (e.g., generators assigned to data backup strategies)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Define which cost items should NOT be in which strategies
const INVALID_ASSIGNMENTS: Record<string, string[]> = {
  // Data backup strategies should NOT have generators or UPS
  'data_backup_comprehensive': ['generator_5kw_diesel', 'generator_3kw_gasoline', 'generator_10kw_diesel', 'ups_battery_backup_1kw'],
  'data_backup_system': ['generator_5kw_diesel', 'generator_3kw_gasoline', 'generator_10kw_diesel', 'ups_battery_backup_1kw'],
  'data_protection_comprehensive': ['generator_5kw_diesel', 'generator_3kw_gasoline', 'generator_10kw_diesel'],
  
  // Fire safety should NOT have generators or data backup items
  'fire_safety_basic': ['generator_5kw_diesel', 'generator_3kw_gasoline', 'generator_10kw_diesel', 'data_backup_cloud', 'external_hard_drive_2tb'],
  
  // Communication strategies should NOT have generators (unless specifically for powering radios)
  'emergency_communication': ['generator_5kw_diesel', 'generator_3kw_gasoline', 'generator_10kw_diesel'],
}

// Define which cost items SHOULD be in which strategies
const EXPECTED_ASSIGNMENTS: Record<string, string[]> = {
  'data_backup_comprehensive': ['data_backup_cloud', 'external_hard_drive_2tb'],
  'data_backup_system': ['data_backup_cloud', 'external_hard_drive_2tb'],
  'data_protection_comprehensive': ['data_backup_cloud', 'external_hard_drive_2tb'],
  'fire_safety_basic': ['fire_extinguisher_10lb', 'smoke_detector_commercial'],
  'emergency_communication': ['satellite_phone', 'two_way_radios_6pack'],
  'power_backup': ['generator_5kw_diesel', 'generator_3kw_gasoline', 'generator_10kw_diesel', 'ups_battery_backup_1kw'],
}

async function main() {
  console.log('🔍 Checking Cost Item Assignments...\n')
  
  // Get all strategies to check
  const allStrategyIds = [...new Set([...Object.keys(INVALID_ASSIGNMENTS), ...Object.keys(EXPECTED_ASSIGNMENTS)])]
  
  const strategies = await prisma.riskMitigationStrategy.findMany({
    where: {
      strategyId: { in: allStrategyIds }
    },
    include: {
      actionSteps: {
        include: {
          itemCosts: {
            include: {
              item: true
            }
          }
        }
      }
    }
  })
  
  let totalIssues = 0
  let totalFixed = 0
  
  for (const strategy of strategies) {
    const invalidItems = INVALID_ASSIGNMENTS[strategy.strategyId] || []
    const expectedItems = EXPECTED_ASSIGNMENTS[strategy.strategyId] || []
    
    console.log(`\n📋 Strategy: ${strategy.strategyId}`)
    console.log(`   Name: ${strategy.smeTitle || strategy.name}`)
    
    let strategyHasIssues = false
    
    for (const step of strategy.actionSteps) {
      const stepItems = step.itemCosts.map(ic => ic.item.itemId)
      const invalidInStep = stepItems.filter(itemId => invalidItems.includes(itemId))
      
      if (invalidInStep.length > 0) {
        strategyHasIssues = true
        totalIssues += invalidInStep.length
        
        console.log(`\n   ⚠️  Step: ${step.stepId}`)
        console.log(`      Title: ${typeof step.title === 'string' ? step.title : JSON.parse(step.title || '{}').en || 'N/A'}`)
        console.log(`      ❌ Invalid items found: ${invalidInStep.join(', ')}`)
        
        // Remove invalid items
        for (const itemId of invalidInStep) {
          const itemCost = step.itemCosts.find(ic => ic.item.itemId === itemId)
          if (itemCost) {
            await prisma.actionStepItemCost.delete({
              where: { id: itemCost.id }
            })
            console.log(`      ✓ Removed: ${itemId}`)
            totalFixed++
          }
        }
      }
    }
    
    // Check for missing expected items
    if (expectedItems.length > 0) {
      const allStepItems = strategy.actionSteps.flatMap(step => step.itemCosts.map(ic => ic.item.itemId))
      const missingItems = expectedItems.filter(itemId => !allStepItems.includes(itemId))
      
      if (missingItems.length > 0) {
        console.log(`\n   ⚠️  Missing expected items: ${missingItems.join(', ')}`)
        console.log(`      Note: These items should be added to appropriate action steps`)
      }
    }
    
    if (!strategyHasIssues) {
      console.log(`   ✅ No invalid items found`)
    }
  }
  
  console.log(`\n\n📊 Summary:`)
  console.log(`   Issues found: ${totalIssues}`)
  console.log(`   Items removed: ${totalFixed}`)
  
  if (totalFixed > 0) {
    console.log(`\n✅ Fixed ${totalFixed} incorrect cost item assignments!`)
    console.log(`\n💡 Tip: Review the strategies above to ensure cost items make sense for each strategy type.`)
  } else {
    console.log(`\n✅ No issues found - all assignments look correct!`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())


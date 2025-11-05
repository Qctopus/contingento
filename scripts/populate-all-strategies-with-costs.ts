/**
 * Populate All Strategies with Cost Items
 * 
 * This script intelligently adds cost items to all action steps in all strategies
 * based on text analysis and context matching.
 * 
 * Usage: npx ts-node scripts/populate-all-strategies-with-costs.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Comprehensive mapping of keywords to cost items with context
const COST_ITEM_MAPPING = {
  // ============================================================================
  // GENERATORS & POWER
  // ============================================================================
  'generator': {
    patterns: [
      { keywords: ['buy generator', 'purchase generator', 'install generator', 'generator system'], items: [{ itemId: 'generator_5kw_diesel', quantity: 1 }] },
      { keywords: ['small generator', '3kw', 'portable generator', 'basic generator'], items: [{ itemId: 'generator_3kw_gasoline', quantity: 1 }] },
      { keywords: ['large generator', '10kw', 'commercial generator'], items: [{ itemId: 'generator_10kw_diesel', quantity: 1 }] },
      { keywords: ['fuel', 'diesel', 'gasoline for generator'], items: [{ itemId: 'generator_fuel_diesel', quantity: 2 }] },
    ]
  },
  'power': {
    patterns: [
      { keywords: ['backup power', 'emergency power', 'power backup'], items: [{ itemId: 'generator_5kw_diesel', quantity: 1 }] },
      { keywords: ['solar', 'solar power', 'solar panel', 'renewable'], items: [{ itemId: 'solar_battery_backup_3kw', quantity: 1 }] },
      { keywords: ['ups', 'battery backup', 'uninterruptible'], items: [{ itemId: 'ups_battery_backup_1kw', quantity: 1 }] },
    ]
  },
  
  // ============================================================================
  // HURRICANE/STORM PROTECTION
  // ============================================================================
  'hurricane': {
    patterns: [
      { keywords: ['hurricane shutters', 'storm shutters', 'aluminum shutters'], items: [{ itemId: 'hurricane_shutters_accordion', quantity: 4 }] },
      { keywords: ['plywood', 'boards', 'temporary protection'], items: [{ itemId: 'plywood_hurricane_boards', quantity: 6 }] },
      { keywords: ['roof strap', 'roof reinforcement', 'secure roof'], items: [{ itemId: 'roof_hurricane_straps', quantity: 1 }] },
      { keywords: ['door reinforcement', 'secure door'], items: [{ itemId: 'door_reinforcement_kit', quantity: 2 }] },
    ]
  },
  
  // ============================================================================
  // WATER & FLOOD
  // ============================================================================
  'water': {
    patterns: [
      { keywords: ['water tank', 'water storage', 'store water'], items: [{ itemId: 'water_tank_500l', quantity: 1 }] },
      { keywords: ['large water tank', '1000', 'big tank'], items: [{ itemId: 'water_tank_1000l', quantity: 1 }] },
      { keywords: ['water filter', 'purification', 'purify water'], items: [{ itemId: 'water_filter_gravity', quantity: 1 }] },
      { keywords: ['water tablets', 'purification tablets'], items: [{ itemId: 'water_purification_tablets', quantity: 2 }] },
    ]
  },
  'flood': {
    patterns: [
      { keywords: ['sandbag', 'sand bag', 'flood barrier'], items: [{ itemId: 'sandbags_100pack', quantity: 1 }] },
      { keywords: ['portable barrier', 'water barrier'], items: [{ itemId: 'flood_barrier_portable', quantity: 2 }] },
      { keywords: ['pump', 'sump pump', 'water pump', 'remove water'], items: [{ itemId: 'sump_pump_submersible', quantity: 1 }] },
    ]
  },
  
  // ============================================================================
  // EMERGENCY SUPPLIES
  // ============================================================================
  'emergency': {
    patterns: [
      { keywords: ['emergency supplies', 'emergency kit', 'survival'], items: [
        { itemId: 'emergency_food_2weeks', quantity: 3 },
        { itemId: 'first_aid_kit_commercial', quantity: 1 }
      ]},
      { keywords: ['emergency food', 'food supply', 'rations'], items: [{ itemId: 'emergency_food_2weeks', quantity: 3 }] },
      { keywords: ['first aid', 'medical kit', 'first-aid'], items: [{ itemId: 'first_aid_kit_commercial', quantity: 1 }] },
      { keywords: ['flashlight', 'torch', 'emergency light'], items: [{ itemId: 'flashlights_batteries_pack', quantity: 1 }] },
      { keywords: ['radio', 'emergency radio', 'communication'], items: [{ itemId: 'emergency_radio_crank', quantity: 1 }] },
    ]
  },
  
  // ============================================================================
  // FIRE SAFETY
  // ============================================================================
  'fire': {
    patterns: [
      { keywords: ['fire extinguisher', 'extinguisher'], items: [{ itemId: 'fire_extinguisher_10lb', quantity: 2 }] },
      { keywords: ['smoke detector', 'smoke alarm'], items: [{ itemId: 'smoke_detector_commercial', quantity: 5 }] },
      { keywords: ['fire suppression', 'automatic fire'], items: [{ itemId: 'fire_suppression_system', quantity: 1 }] },
    ]
  },
  
  // ============================================================================
  // SECURITY
  // ============================================================================
  'security': {
    patterns: [
      { keywords: ['security camera', 'cctv', 'surveillance'], items: [{ itemId: 'security_camera_4ch', quantity: 1 }] },
      { keywords: ['alarm', 'alarm system', 'security alarm'], items: [{ itemId: 'alarm_system_basic', quantity: 1 }] },
      { keywords: ['security grille', 'window bars', 'grilles'], items: [{ itemId: 'security_grilles_window', quantity: 4 }] },
    ]
  },
  
  // ============================================================================
  // PROFESSIONAL SERVICES
  // ============================================================================
  'installation': {
    patterns: [
      { keywords: ['install', 'installation', 'professional install', 'contractor'], items: [{ itemId: 'installation_professional', quantity: 1 }] },
    ]
  },
  'training': {
    patterns: [
      { keywords: ['training', 'train staff', 'staff training', 'employee training'], items: [{ itemId: 'training_emergency_response', quantity: 1 }] },
    ]
  },
  'consultation': {
    patterns: [
      { keywords: ['consultation', 'assess', 'assessment', 'risk assessment'], items: [{ itemId: 'consultation_risk_assessment', quantity: 1 }] },
    ]
  },
  'maintenance': {
    patterns: [
      { keywords: ['maintenance', 'annual maintenance', 'service contract'], items: [{ itemId: 'maintenance_annual', quantity: 1 }] },
    ]
  },
  
  // ============================================================================
  // TECHNOLOGY & DATA
  // ============================================================================
  'backup': {
    patterns: [
      { keywords: ['data backup', 'cloud backup', 'backup service'], items: [{ itemId: 'data_backup_cloud', quantity: 1 }] },
      { keywords: ['external hard drive', 'hard drive', 'local backup'], items: [{ itemId: 'external_hard_drive_2tb', quantity: 1 }] },
    ]
  },
  'communication': {
    patterns: [
      { keywords: ['satellite phone', 'sat phone'], items: [{ itemId: 'satellite_phone', quantity: 1 }] },
      { keywords: ['two-way radio', 'walkie talkie', 'radio communication'], items: [{ itemId: 'two_way_radios_6pack', quantity: 1 }] },
    ]
  }
}

// Helper function to match text to cost items
function matchTextToCostItems(text: string): Array<{ itemId: string; quantity: number }> {
  const lowerText = text.toLowerCase()
  const matches: Array<{ itemId: string; quantity: number }> = []
  
  // Check each category
  for (const [category, config] of Object.entries(COST_ITEM_MAPPING)) {
    for (const pattern of config.patterns) {
      // Check if any keyword matches
      const hasMatch = pattern.keywords.some(keyword => lowerText.includes(keyword))
      
      if (hasMatch) {
        matches.push(...pattern.items)
        break // Only match once per category
      }
    }
  }
  
  // Remove duplicates
  const uniqueMatches = new Map<string, number>()
  for (const match of matches) {
    if (uniqueMatches.has(match.itemId)) {
      // Keep the higher quantity
      uniqueMatches.set(match.itemId, Math.max(uniqueMatches.get(match.itemId)!, match.quantity))
    } else {
      uniqueMatches.set(match.itemId, match.quantity)
    }
  }
  
  return Array.from(uniqueMatches.entries()).map(([itemId, quantity]) => ({ itemId, quantity }))
}

async function populateStrategiesWithCosts() {
  console.log('🎯 Starting to populate all strategies with cost items...\n')
  
  try {
    // Get all active strategies with their action steps
    const strategies = await prisma.riskMitigationStrategy.findMany({
      where: { isActive: true },
      include: {
        actionSteps: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    })
    
    console.log(`📊 Found ${strategies.length} strategies to process\n`)
    
    let strategiesUpdated = 0
    let stepsUpdated = 0
    let costItemsAdded = 0
    let stepsSkipped = 0
    
    for (const strategy of strategies) {
      console.log(`\n🛡️  Strategy: ${strategy.name}`)
      console.log(`   Category: ${strategy.category}`)
      console.log(`   Action Steps: ${strategy.actionSteps.length}`)
      
      let strategyHasUpdates = false
      
      for (const step of strategy.actionSteps) {
        // Check if step already has cost items
        const existingCostItems = await prisma.actionStepItemCost.findMany({
          where: { actionStepId: step.id }
        })
        
        if (existingCostItems.length > 0) {
          console.log(`   ✓ Step "${step.title || step.description}" already has ${existingCostItems.length} cost items`)
          stepsSkipped++
          continue
        }
        
        // Combine title and description for matching
        const fullText = `${step.title || ''} ${step.description || ''} ${step.smeAction || ''}`
        
        // Find matching cost items
        const matches = matchTextToCostItems(fullText)
        
        if (matches.length > 0) {
          console.log(`   + Step: "${step.title || step.description}"`)
          
          for (const match of matches) {
            try {
              // Verify cost item exists
              const costItem = await prisma.costItem.findUnique({
                where: { itemId: match.itemId }
              })
              
              if (!costItem) {
                console.log(`     ⚠️  Cost item ${match.itemId} not found - skipping`)
                continue
              }
              
              await prisma.actionStepItemCost.create({
                data: {
                  actionStepId: step.id,
                  itemId: match.itemId,
                  quantity: match.quantity,
                  customNotes: 'Auto-populated from intelligent text matching'
                }
              })
              
              console.log(`     ✓ Added: ${costItem.name} (×${match.quantity})`)
              costItemsAdded++
              strategyHasUpdates = true
            } catch (error: any) {
              if (error.code === 'P2002') {
                console.log(`     • Item already exists: ${match.itemId}`)
              } else {
                console.error(`     ⚠️  Error adding ${match.itemId}:`, error.message)
              }
            }
          }
          
          stepsUpdated++
        } else {
          console.log(`   ⚠️  No matches for: "${step.title || step.description}"`)
        }
      }
      
      if (strategyHasUpdates) {
        strategiesUpdated++
      }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ Population complete!')
    console.log('='.repeat(60))
    console.log(`📊 Summary:`)
    console.log(`   - Strategies processed: ${strategies.length}`)
    console.log(`   - Strategies updated: ${strategiesUpdated}`)
    console.log(`   - Action steps updated: ${stepsUpdated}`)
    console.log(`   - Cost items added: ${costItemsAdded}`)
    console.log(`   - Steps skipped (already had items): ${stepsSkipped}`)
    console.log('\n💡 Recommendation:')
    console.log('   Review strategies in the admin panel and manually add cost items')
    console.log('   for any steps that were not auto-matched.')
    
  } catch (error) {
    console.error('\n❌ Population failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run population
if (require.main === module) {
  populateStrategiesWithCosts()
    .then(() => {
      console.log('\n🎉 Script completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error)
      process.exit(1)
    })
}

export { populateStrategiesWithCosts }



/**
 * Migrate Strategy Types and Fix Content Issues
 * 
 * This script:
 * 1. Assigns strategyType to all existing strategies
 * 2. Moves misplaced action steps to correct phases (where applicable)
 * 3. Fixes specific content issues (e.g., Hurricane strategy)
 * 4. Recalculates all costs and times
 * 
 * Run with: npx tsx scripts/migrate-strategy-types-and-content.ts
 */

import { PrismaClient, Prisma } from '@prisma/client'
import { costCalculationService } from '../src/services/costCalculationService'

const prisma = new PrismaClient()
const costService = costCalculationService

// ============================================================================
// STRATEGY TYPE CLASSIFICATION RULES
// ============================================================================

const STRATEGY_TYPE_RULES = {
  // Prevention strategies (implement BEFORE crisis to reduce impact)
  prevention: [
    'hurricane_preparation',
    'hurricane_comprehensive',
    'hurricane_property_protection',
    'cybersecurity_baseline',
    'cybersecurity',
    'fire_detection',
    'fire_prevention',
    'flood_prevention',
    'backup_power',
    'equipment_backup',
    'insurance_coverage',
    'staff_training',
    'maintenance_program',
    'supplier_diversification',
    'financial_reserves',
    'communication_backup',
    'data_backup',
    'physical_security',
    'supply_chain_diversification',
    'cross_training'
  ],
  
  // Response strategies (execute DURING crisis)
  response: [
    'emergency_response',
    'crisis_communication',
    'evacuation_procedures',
    'emergency_operations',
    'incident_command',
    'emergency_protocols',
    'crisis_response'
  ],
  
  // Recovery strategies (execute AFTER crisis)
  recovery: [
    'business_recovery',
    'financial_recovery',
    'post_crisis_communication',
    'insurance_claims',
    'damage_assessment',
    'operations_restoration',
    'business_restoration'
  ]
}

// ============================================================================
// MAIN MIGRATION FUNCTIONS
// ============================================================================

async function migrateStrategyTypes() {
  console.log('🔄 Starting strategy type migration...\n')
  
  const strategies = await prisma.riskMitigationStrategy.findMany({
    include: {
      actionSteps: {
        include: {
          itemCosts: {
            include: {
              item: true
            }
          }
        },
        orderBy: {
          sortOrder: 'asc'
        }
      }
    }
  })
  
  console.log(`📊 Found ${strategies.length} strategies to process\n`)
  
  let updatedCount = 0
  let errorCount = 0
  let costsCalculated = 0
  
  const typeStats = {
    prevention: 0,
    response: 0,
    recovery: 0
  }
  
  for (const strategy of strategies) {
    try {
      // Determine strategy type
      let strategyType = 'prevention' // default
      
      for (const [type, ids] of Object.entries(STRATEGY_TYPE_RULES)) {
        if (ids.includes(strategy.strategyId)) {
          strategyType = type
          typeStats[type as keyof typeof typeStats]++
          break
        }
      }
      
      // If not found in rules, use default and increment prevention count
      if (!STRATEGY_TYPE_RULES.prevention.includes(strategy.strategyId) &&
          !STRATEGY_TYPE_RULES.response.includes(strategy.strategyId) &&
          !STRATEGY_TYPE_RULES.recovery.includes(strategy.strategyId)) {
        typeStats.prevention++
      }
      
      // Calculate costs if action steps exist
      let costData: {
        calculatedCostUSD?: Prisma.Decimal
        calculatedCostLocal?: Prisma.Decimal
        currencyCode?: string
        currencySymbol?: string
        estimatedTotalHours?: number
      } = {}
      
      if (strategy.actionSteps.length > 0) {
        try {
          const costResult = await costService.calculateStrategyCost(
            strategy.actionSteps.map(step => ({
              id: step.id,
              title: step.title,
              smeAction: step.smeAction || undefined,
              phase: step.phase,
              costItems: step.itemCosts.map(ci => ({
                id: ci.id,
                actionStepId: ci.actionStepId,
                itemId: ci.itemId,
                quantity: ci.quantity,
                item: ci.item
              }))
            })),
            'US' // Default to USD as specified
          )
          
          costData = {
            calculatedCostUSD: new Prisma.Decimal(costResult.totalUSD),
            calculatedCostLocal: new Prisma.Decimal(costResult.localCurrency.amount),
            currencyCode: costResult.localCurrency.code,
            currencySymbol: costResult.localCurrency.symbol,
            estimatedTotalHours: costResult.calculatedHours
          }
          
          costsCalculated++
        } catch (costError) {
          console.warn(`   ⚠️  Could not calculate cost for ${strategy.strategyId}: ${costError instanceof Error ? costError.message : 'Unknown error'}`)
          // Continue without cost data
        }
      }
      
      // Update strategy
      await prisma.riskMitigationStrategy.update({
        where: { id: strategy.id },
        data: {
          strategyType,
          ...costData
        }
      })
      
      updatedCount++
      
      // Display name (try to get from multilingual field)
      let displayName = strategy.strategyId
      try {
        const nameObj = typeof strategy.name === 'string' ? JSON.parse(strategy.name) : strategy.name
        displayName = nameObj.en || strategy.strategyId
      } catch {
        displayName = strategy.strategyId
      }
      
      const costDisplay = costData.calculatedCostUSD 
        ? `${costData.currencySymbol}${Number(costData.calculatedCostUSD).toFixed(0)}`
        : '$0'
      const timeDisplay = costData.estimatedTotalHours 
        ? `${costData.estimatedTotalHours}h`
        : '0h'
      
      const typeIcon = {
        prevention: '🛡️',
        response: '⚡',
        recovery: '🔄'
      }[strategyType] || '📋'
      
      console.log(`${typeIcon} ${displayName.substring(0, 50).padEnd(50)} | ${costDisplay.padStart(10)} | ${timeDisplay.padStart(6)}`)
      
    } catch (error) {
      errorCount++
      console.error(`❌ Error updating ${strategy.strategyId}:`, error instanceof Error ? error.message : 'Unknown error')
    }
  }
  
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📊 Migration Summary:`)
  console.log(`   ✅ Updated: ${updatedCount} strategies`)
  console.log(`   💰 Costs calculated: ${costsCalculated} strategies`)
  console.log(`   ❌ Errors: ${errorCount} strategies`)
  
  console.log(`\n📈 Strategy Type Distribution:`)
  console.log(`   🛡️  Prevention: ${typeStats.prevention} strategies`)
  console.log(`   ⚡ Response: ${typeStats.response} strategies`)
  console.log(`   🔄 Recovery: ${typeStats.recovery} strategies`)
  console.log(`${'='.repeat(80)}\n`)
}

async function fixHurricaneStrategy() {
  console.log('🌀 Fixing Hurricane Preparation strategy...\n')
  
  // Find hurricane strategy (try multiple possible IDs)
  const possibleIds = ['hurricane_preparation', 'hurricane_comprehensive', 'hurricane_property_protection']
  let hurricaneStrategy = null
  
  for (const id of possibleIds) {
    hurricaneStrategy = await prisma.riskMitigationStrategy.findUnique({
      where: { strategyId: id },
      include: { 
        actionSteps: {
          include: {
            itemCosts: true
          }
        } 
      }
    })
    if (hurricaneStrategy) break
  }
  
  if (!hurricaneStrategy) {
    console.log('❌ Hurricane strategy not found (tried:', possibleIds.join(', '), ')')
    console.log('   Skipping hurricane-specific fixes\n')
    return
  }
  
  console.log(`✅ Found hurricane strategy: ${hurricaneStrategy.strategyId}`)
  console.log(`   Current action steps: ${hurricaneStrategy.actionSteps.length}`)
  
  // Define correct action steps structure
  // Note: We're being conservative and only fixing obvious issues
  // Most strategies will be reviewed manually by admins
  
  const correctActionSteps = [
    {
      stepId: 'hurricane_insurance',
      phase: 'immediate',
      executionTiming: null, // Preparation only, not crisis action
      title: 'Get Hurricane Insurance',
      description: 'Purchase business interruption insurance that covers hurricane damage',
      smeAction: 'Contact your insurance agent to add hurricane coverage to your policy',
      estimatedMinutes: 180,
      sortOrder: 1
    },
    {
      stepId: 'emergency_supplies',
      phase: 'immediate',
      executionTiming: 'before_crisis', // Also part of 24h preparation
      title: 'Stock Emergency Supplies',
      description: 'Build emergency kit with water, flashlights, batteries, first aid supplies',
      smeAction: 'Buy water bottles (5 gallons), flashlights, batteries, first aid kit, and store in waterproof container',
      estimatedMinutes: 120,
      sortOrder: 2
    },
    {
      stepId: 'install_shutters',
      phase: 'short_term',
      executionTiming: null, // Installation is preparation, not crisis action
      title: 'Install Hurricane Shutters or Get Plywood',
      description: 'Install permanent hurricane shutters or purchase plywood sheets to board up windows',
      smeAction: 'Hire contractor to install metal shutters OR buy plywood sheets and mounting hardware',
      estimatedMinutes: 480, // 8 hours
      sortOrder: 3
    },
    {
      stepId: 'secure_property',
      phase: null, // This is NOT an implementation action
      executionTiming: 'before_crisis', // This is ONLY a crisis action
      title: 'Secure Property (24-48 Hours Before)',
      description: 'Close hurricane shutters, move inventory away from windows, secure outdoor items',
      smeAction: 'Board up all windows, bring outdoor signs inside, move stock away from windows to interior',
      estimatedMinutes: 120,
      sortOrder: 4
    },
    {
      stepId: 'shelter_in_place',
      phase: null, // Not an implementation action
      executionTiming: 'during_crisis',
      title: 'Stay in Safe Room',
      description: 'Remain in interior room away from windows during the storm',
      smeAction: 'Stay in interior room, monitor weather radio/phone, do NOT go outside until all-clear',
      estimatedMinutes: 0, // Duration varies
      sortOrder: 5
    },
    {
      stepId: 'assess_damage',
      phase: null, // Not an implementation action
      executionTiming: 'after_crisis',
      title: 'Assess and Document Damage',
      description: 'Wait for all-clear, then photograph all damage and contact insurance within 48 hours',
      smeAction: 'Take photos of ALL damage (interior, exterior, equipment), call insurance company to file claim',
      estimatedMinutes: 240, // 4 hours
      sortOrder: 6
    }
  ]
  
  console.log(`   Replacing with ${correctActionSteps.length} corrected action steps...\n`)
  
  // Delete existing action steps (preserve cost items will cascade delete)
  await prisma.actionStep.deleteMany({
    where: { strategyId: hurricaneStrategy.id }
  })
  
  // Create corrected action steps
  for (const step of correctActionSteps) {
    await prisma.actionStep.create({
      data: {
        strategyId: hurricaneStrategy.id,
        stepId: step.stepId,
        phase: step.phase || 'immediate', // Prisma requires non-null, use default
        executionTiming: step.executionTiming,
        title: step.title,
        description: step.description,
        smeAction: step.smeAction,
        estimatedMinutes: step.estimatedMinutes,
        sortOrder: step.sortOrder
      }
    })
  }
  
  console.log(`✅ Created ${correctActionSteps.length} corrected action steps`)
  
  // Recalculate costs
  const updatedSteps = await prisma.actionStep.findMany({
    where: { strategyId: hurricaneStrategy.id },
    include: {
      itemCosts: {
        include: { item: true }
      }
    }
  })
  
  if (updatedSteps.length > 0) {
    try {
      const costResult = await costService.calculateStrategyCost(
        updatedSteps.map(step => ({
          id: step.id,
          title: step.title,
          phase: step.phase,
          costItems: step.itemCosts.map(ci => ({
            id: ci.id,
            actionStepId: ci.actionStepId,
            itemId: ci.itemId,
            quantity: ci.quantity,
            item: ci.item
          }))
        })),
        'US'
      )
      
      await prisma.riskMitigationStrategy.update({
        where: { id: hurricaneStrategy.id },
        data: {
          strategyType: 'prevention',
          calculatedCostUSD: new Prisma.Decimal(costResult.totalUSD),
          calculatedCostLocal: new Prisma.Decimal(costResult.localCurrency.amount),
          currencyCode: costResult.localCurrency.code,
          currencySymbol: costResult.localCurrency.symbol,
          estimatedTotalHours: costResult.calculatedHours
        }
      })
      
      console.log(`✅ Recalculated costs: ${costResult.localCurrency.symbol}${costResult.localCurrency.amount.toFixed(0)} (${costResult.calculatedHours}h)\n`)
    } catch (error) {
      console.warn(`⚠️  Could not recalculate costs:`, error instanceof Error ? error.message : 'Unknown error')
    }
  }
}

async function displayStrategyReport() {
  console.log('📋 Strategy Content Report\n')
  console.log('='.repeat(80))
  
  const strategies = await prisma.riskMitigationStrategy.findMany({
    include: {
      actionSteps: {
        orderBy: { sortOrder: 'asc' }
      }
    },
    orderBy: {
      strategyType: 'asc'
    }
  })
  
  // Group by type
  const byType: Record<string, typeof strategies> = {
    prevention: [],
    response: [],
    recovery: []
  }
  
  strategies.forEach(s => {
    const type = s.strategyType || 'prevention'
    if (!byType[type]) byType[type] = []
    byType[type].push(s)
  })
  
  for (const [type, strats] of Object.entries(byType)) {
    if (strats.length === 0) continue
    
    const icon = {
      prevention: '🛡️',
      response: '⚡',
      recovery: '🔄'
    }[type] || '📋'
    
    console.log(`\n${icon} ${type.toUpperCase()} STRATEGIES (${strats.length})`)
    console.log('-'.repeat(80))
    
    for (const strategy of strats) {
      const implSteps = strategy.actionSteps.filter(s => s.phase).length
      const beforeSteps = strategy.actionSteps.filter(s => s.executionTiming === 'before_crisis').length
      const duringSteps = strategy.actionSteps.filter(s => s.executionTiming === 'during_crisis').length
      const afterSteps = strategy.actionSteps.filter(s => s.executionTiming === 'after_crisis').length
      
      console.log(`\n  ${strategy.strategyId}`)
      console.log(`    Implementation steps: ${implSteps}  |  Crisis: Before=${beforeSteps} During=${duringSteps} After=${afterSteps}`)
      console.log(`    Cost: ${strategy.currencySymbol || '$'}${Number(strategy.calculatedCostLocal || 0).toFixed(0)}  |  Time: ${strategy.estimatedTotalHours || 0}h`)
    }
  }
  
  console.log('\n' + '='.repeat(80) + '\n')
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(80))
  console.log('  Strategy Type & Content Migration Script')
  console.log('  Purpose: Classify strategies and fix content issues')
  console.log('='.repeat(80) + '\n')
  
  try {
    // Phase 1: Migrate all strategy types and calculate costs
    await migrateStrategyTypes()
    
    // Phase 2: Fix specific content issues
    await fixHurricaneStrategy()
    
    // Phase 3: Display final report
    await displayStrategyReport()
    
    console.log('✅ Migration complete!\n')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    throw error
  }
}

main()
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


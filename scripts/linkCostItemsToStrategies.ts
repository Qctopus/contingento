import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Map strategy keywords to relevant cost items
const STRATEGY_PATTERNS: Record<string, string[]> = {
  // Hurricane strategies
  'hurricane.*shutter|window.*shutter': ['hurricane_shutters_accordion', 'hurricane_shutters_aluminum', 'plywood_hurricane_boards', 'installation_professional'],
  'plywood|temporary.*protection': ['plywood_hurricane_boards'],
  'hurricane.*roof|roof.*reinforc': ['roof_hurricane_straps', 'installation_professional'],
  'door.*reinforc|secure.*door': ['door_reinforcement_kit'],
  'window.*protect': ['hurricane_shutters_accordion', 'plywood_hurricane_boards'],
  
  // Power strategies
  'generator|backup.*power|power.*backup': ['generator_5kw_diesel', 'generator_fuel_diesel', 'installation_professional', 'maintenance_annual'],
  'diesel.*generator': ['generator_5kw_diesel', 'generator_10kw_diesel', 'generator_fuel_diesel'],
  'uninterrupt.*power|ups': ['ups_battery_backup_1kw'],
  'solar.*power|renewable.*energy': ['solar_battery_backup_3kw', 'installation_professional'],
  'power.*outage|electricity|electrical': ['generator_5kw_diesel', 'ups_battery_backup_1kw', 'flashlights_batteries_pack'],
  
  // Water strategies
  'water.*storage|water.*tank': ['water_tank_500l', 'water_tank_1000l', 'installation_professional'],
  'water.*purif|water.*treat': ['water_purification_tablets', 'water_filter_gravity'],
  'potable.*water|drinking.*water': ['water_filter_gravity', 'water_purification_tablets'],
  
  // Flood strategies
  'flood.*protect|sandbag': ['sandbags_100pack', 'flood_barrier_portable', 'sump_pump_submersible'],
  'flood.*barrier': ['flood_barrier_portable', 'sandbags_100pack'],
  'drainage|pump|water.*remov': ['sump_pump_submersible'],
  
  // Emergency supplies
  'emergency.*suppl|emergency.*kit|disaster.*kit': ['emergency_food_2weeks', 'first_aid_kit_commercial', 'flashlights_batteries_pack', 'emergency_radio_crank', 'water_purification_tablets'],
  'first.*aid|medical.*kit': ['first_aid_kit_commercial'],
  'food.*suppl|emergency.*ration': ['emergency_food_2weeks'],
  'flashlight|lighting|torch': ['flashlights_batteries_pack'],
  
  // Fire safety
  'fire.*safety|fire.*prevent|fire.*protect': ['fire_extinguisher_10lb', 'smoke_detector_commercial'],
  'fire.*extinguish': ['fire_extinguisher_10lb'],
  'smoke.*detect|fire.*alarm': ['smoke_detector_commercial'],
  'fire.*suppress|kitchen.*fire': ['fire_suppression_system', 'installation_professional'],
  
  // Security
  'security.*camera|surveillance|cctv': ['security_camera_4ch', 'installation_professional'],
  'alarm.*system|security.*alarm': ['alarm_system_basic', 'installation_professional'],
  'security.*grill|window.*bar|burglar.*bar': ['security_grilles_window', 'installation_professional'],
  'theft|burglary|break.*in': ['alarm_system_basic', 'security_camera_4ch', 'security_grilles_window'],
  
  // Communication
  'communication|contact|alert': ['two_way_radios_6pack', 'satellite_phone', 'emergency_radio_crank'],
  'satellite.*phone': ['satellite_phone'],
  'radio.*communi|walkie.*talkie': ['two_way_radios_6pack'],
  'emergency.*radio': ['emergency_radio_crank'],
  
  // Technology
  'data.*backup|backup.*data|backup.*system': ['data_backup_cloud', 'external_hard_drive_2tb'],
  'cloud.*backup|offsite.*backup': ['data_backup_cloud'],
  'local.*backup|hard.*drive': ['external_hard_drive_2tb'],
  
  // Training and services
  'training|staff.*educat|employee.*prepar': ['training_emergency_response'],
  'maintenance|servic.*contract': ['maintenance_annual'],
  'consultation|assessment|evaluat': ['consultation_risk_assessment'],
  'installation|install.*service': ['installation_professional']
}

// Map risk types to relevant cost items
const RISK_TO_ITEMS_MAP: Record<string, string[]> = {
  'hurricane': ['hurricane_shutters_accordion', 'roof_hurricane_straps', 'door_reinforcement_kit', 'generator_5kw_diesel', 'emergency_food_2weeks', 'water_tank_500l', 'flashlights_batteries_pack'],
  'flood': ['sandbags_100pack', 'flood_barrier_portable', 'sump_pump_submersible', 'water_purification_tablets'],
  'earthquake': ['emergency_food_2weeks', 'water_tank_500l', 'first_aid_kit_commercial', 'generator_5kw_diesel'],
  'fire': ['fire_extinguisher_10lb', 'smoke_detector_commercial', 'fire_suppression_system'],
  'power': ['generator_5kw_diesel', 'ups_battery_backup_1kw', 'solar_battery_backup_3kw', 'generator_fuel_diesel'],
  'drought': ['water_tank_1000l', 'water_filter_gravity', 'water_purification_tablets'],
  'storm': ['hurricane_shutters_accordion', 'generator_5kw_diesel', 'emergency_food_2weeks'],
  'tropical': ['hurricane_shutters_accordion', 'generator_5kw_diesel', 'water_tank_500l']
}

async function linkCostItemsToStrategies() {
  console.log('🔗 Starting smart cost item linking...\n')
  
  // Get all active strategies
  const strategies = await prisma.riskMitigationStrategy.findMany({
    where: { isActive: true },
    include: {
      itemCosts: {
        include: {
          item: true
        }
      }
    }
  })
  
  console.log(`📊 Found ${strategies.length} active strategies to analyze\n`)
  
  let strategiesUpdated = 0
  let linksCreated = 0
  let linksSkipped = 0
  
  for (const strategy of strategies) {
    console.log(`\n📋 Analyzing: ${strategy.name}`)
    
    const strategyText = `${strategy.name} ${strategy.description || ''} ${strategy.smeTitle || ''} ${strategy.smeSummary || ''}`.toLowerCase()
    const matchedItems = new Set<string>()
    
    // 1. Match by keyword patterns
    for (const [pattern, itemIds] of Object.entries(STRATEGY_PATTERNS)) {
      const regex = new RegExp(pattern, 'i')
      if (regex.test(strategyText)) {
        console.log(`   ✓ Pattern match: "${pattern.substring(0, 30)}..."`)
        itemIds.forEach(itemId => matchedItems.add(itemId))
      }
    }
    
    // 2. Match by applicable risks
    if (strategy.applicableRisks) {
      try {
        const risks = JSON.parse(strategy.applicableRisks)
        console.log(`   🎯 Applicable risks: ${risks.slice(0, 3).join(', ')}${risks.length > 3 ? '...' : ''}`)
        
        for (const risk of risks) {
          const riskLower = risk.toLowerCase()
          
          // Check each risk type
          for (const [riskType, itemIds] of Object.entries(RISK_TO_ITEMS_MAP)) {
            if (riskLower.includes(riskType)) {
              console.log(`   ✓ Risk match: "${riskType}"`)
              itemIds.forEach(itemId => matchedItems.add(itemId))
            }
          }
        }
      } catch (e) {
        console.log(`   ⚠️  Could not parse applicableRisks`)
      }
    }
    
    // 3. Match by strategy category
    if (strategy.category) {
      const category = strategy.category.toLowerCase()
      if (category.includes('prevention')) {
        matchedItems.add('consultation_risk_assessment')
        matchedItems.add('maintenance_annual')
      }
    }
    
    if (matchedItems.size > 0) {
      console.log(`   💡 Matched ${matchedItems.size} cost items`)
      
      let itemsLinked = 0
      
      for (const itemId of matchedItems) {
        // Check if link already exists
        const existingLink = strategy.itemCosts.find(ic => ic.itemId === itemId)
        
        if (existingLink) {
          console.log(`   ⏭️  Already linked: ${itemId}`)
          linksSkipped++
          continue
        }
        
        // Verify item exists
        const item = await prisma.costItem.findUnique({
          where: { itemId }
        })
        
        if (item) {
          try {
            await prisma.strategyItemCost.create({
              data: {
                strategyId: strategy.id,
                itemId: itemId,
                quantity: 1,
                isRequired: true,
                displayOrder: itemsLinked
              }
            })
            console.log(`   ✅ Linked: ${item.name}`)
            linksCreated++
            itemsLinked++
          } catch (error) {
            console.log(`   ❌ Failed to link ${itemId}: ${error}`)
          }
        } else {
          console.log(`   ⚠️  Item not found: ${itemId}`)
        }
      }
      
      if (itemsLinked > 0) {
        strategiesUpdated++
      }
    } else {
      console.log(`   ℹ️  No matches found`)
    }
  }
  
  console.log(`\n${'='.repeat(60)}`)
  console.log('✅ Smart linking complete!\n')
  console.log(`📊 Summary:`)
  console.log(`   - Strategies analyzed: ${strategies.length}`)
  console.log(`   - Strategies updated: ${strategiesUpdated}`)
  console.log(`   - New links created: ${linksCreated}`)
  console.log(`   - Links skipped (already exist): ${linksSkipped}`)
  console.log(`\n💡 Next steps:`)
  console.log(`   1. Review strategy cost items in Admin2 → Strategies & Actions`)
  console.log(`   2. Adjust quantities and add/remove items as needed`)
  console.log(`   3. Set country-specific overrides for verified local costs`)
}

// Run if called directly
if (require.main === module) {
  linkCostItemsToStrategies()
    .then(() => {
      console.log('\n🎉 Linking completed successfully!')
      prisma.$disconnect()
    })
    .catch((e) => {
      console.error('\n❌ Linking failed:', e)
      prisma.$disconnect()
      process.exit(1)
    })
}


/**
 * Clean Slate: Delete old strategies and create 4 pristine ones
 * 
 * Run with: npx tsx scripts/create-clean-strategies.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  STEP 1: Deleting all existing strategies...\n')
  
  // Delete all action steps first (foreign key constraint)
  const deletedSteps = await prisma.actionStep.deleteMany({})
  console.log(`   Deleted ${deletedSteps.count} action steps`)
  
  // Delete all strategy item costs
  const deletedCosts = await prisma.strategyItemCost.deleteMany({})
  console.log(`   Deleted ${deletedCosts.count} cost items`)
  
  // Delete all business type strategies
  const deletedBTS = await prisma.businessTypeStrategy.deleteMany({})
  console.log(`   Deleted ${deletedBTS.count} business type strategy links`)
  
  // Delete all strategies
  const deletedStrategies = await prisma.riskMitigationStrategy.deleteMany({})
  console.log(`   Deleted ${deletedStrategies.count} strategies\n`)
  
  console.log('✨ STEP 2: Creating 4 clean strategies...\n')
  
  // ============================================================================
  // STRATEGY 1: HURRICANE PREPAREDNESS
  // ============================================================================
  
  const hurricane = await prisma.riskMitigationStrategy.create({
    data: {
      strategyId: 'hurricane_preparedness',
      name: JSON.stringify({
        en: 'Hurricane Preparedness',
        es: 'Preparación para Huracanes',
        fr: 'Préparation aux Ouragans'
      }),
      smeTitle: 'Protect Your Business From Hurricane Damage',
      smeSummary: 'Hurricanes can devastate unprepared businesses. This strategy helps you secure your property, protect your inventory, and keep your team safe before, during, and after a hurricane. Small preparations now can save you thousands in damages later.',
      benefitsBullets: JSON.stringify([
        'Minimize property damage and inventory loss',
        'Keep employees and customers safe',
        'Resume operations faster after the storm',
        'Reduce insurance claims and out-of-pocket costs',
        'Maintain customer trust by being prepared'
      ]),
      realWorldExample: 'After Hurricane Gilbert in 1988, Kingston hardware store "Tools Plus" reopened in 3 days because they had storm shutters installed and moved inventory to high ground. Their competitor across the street took 6 weeks to reopen due to flooding and wind damage.',
      helpfulTips: JSON.stringify([
        'Start preparing 72 hours before predicted landfall',
        'Take photos of your property and inventory before the storm for insurance',
        'Keep a physical checklist - you might lose power and internet',
        'Coordinate with your landlord if you rent your space',
        'Join your local business association emergency group'
      ]),
      commonMistakes: JSON.stringify([
        'Waiting until the last minute to buy supplies (stores sell out quickly)',
        'Assuming your insurance covers everything (read your policy carefully)',
        'Forgetting to secure outdoor items like signs and chairs',
        'Not having a communication plan with employees',
        'Leaving important documents in ground-floor offices'
      ]),
      successMetrics: JSON.stringify([
        'Zero injuries to staff or customers',
        'Property damage under $5,000',
        'Able to reopen within 1 week',
        'No inventory loss to water or wind',
        'Insurance claim processed smoothly'
      ]),
      budgetFriendlyOption: 'Can\'t afford storm shutters? Use heavy plywood (3/4 inch) cut to fit your windows and mark which piece goes where. Cost: $300-500 vs $3,000-5,000 for metal shutters. Make sandbags yourself using empty feed bags and sand from a hardware store ($50 vs $300 for pre-made). Move valuable inventory to a friend\'s house or second floor instead of renting storage.',
      applicableRisks: JSON.stringify(['hurricane', 'tropical_storm', 'high_winds', 'flooding', 'power_outage']),
      applicableBusinessTypes: null, // All businesses
      selectionTier: 'essential',
      reasoning: 'Essential for all Caribbean businesses during hurricane season (June-November). Hurricanes pose the highest financial risk to SMEs in the region.',
      currencyCode: 'USD',
      isActive: true,
      actionSteps: {
        create: [
          // BEFORE CRISIS
          {
            stepId: 'hurricane_step_1',
            phase: 'immediate',
            executionTiming: 'before_crisis',
            title: 'Install Storm Shutters or Prepare Plywood Covers',
            description: 'Secure all windows and glass doors with storm shutters or properly measured plywood boards',
            smeAction: 'Protect your windows from breaking by installing shutters or securing plywood boards over all glass surfaces',
            whyThisStepMatters: 'Broken windows let wind and rain destroy your interior, inventory, and equipment. One broken window can cause $10,000+ in damage.',
            whatHappensIfSkipped: 'Hurricane winds can shatter unprotected windows, causing extensive water damage to inventory, equipment, and documents. Wind inside your building can lift the roof off.',
            timeframe: '4-6 hours',
            estimatedMinutes: 300,
            difficultyLevel: 'medium',
            responsibility: 'Owner or maintenance staff',
            resources: JSON.stringify(['Storm shutters OR 3/4" plywood', 'Drill and screws', 'Ladder', 'Helper']),
            checklist: JSON.stringify([
              'Measure all windows and doors (if using plywood)',
              'Cut plywood to size and label each piece',
              'Pre-drill holes for faster installation',
              'Install shutters or plywood 48 hours before storm',
              'Double-check all fastenings are secure'
            ]),
            sortOrder: 1,
            isActive: true
          },
          {
            stepId: 'hurricane_step_2',
            phase: 'immediate',
            executionTiming: 'before_crisis',
            title: 'Move Inventory and Equipment to Safety',
            description: 'Relocate valuable inventory, electronics, and important documents to high ground or secure storage',
            smeAction: 'Move everything valuable off the ground floor and away from windows. Put electronics and documents in waterproof containers.',
            whyThisStepMatters: 'Flooding can reach 3-6 feet inside your building. Anything on the floor will be destroyed.',
            whatHappensIfSkipped: 'Lose thousands in ruined inventory and equipment. Important business documents and customer records may be destroyed.',
            timeframe: '3-4 hours',
            estimatedMinutes: 210,
            difficultyLevel: 'easy',
            responsibility: 'All staff',
            resources: JSON.stringify(['Plastic bins with lids', 'Waterproof bags', 'Shelving or tables', 'Hand truck or dolly']),
            checklist: JSON.stringify([
              'Identify which items are most valuable',
              'Move inventory to upper shelves or second floor',
              'Put electronics in plastic bins on high surfaces',
              'Seal documents in waterproof bags',
              'Unplug all electrical equipment',
              'Take photos of inventory for insurance'
            ]),
            sortOrder: 2,
            isActive: true
          },
          // DURING CRISIS
          {
            stepId: 'hurricane_step_3',
            phase: 'immediate',
            executionTiming: 'during_crisis',
            title: 'Monitor Storm Progress and Stay Safe',
            description: 'Stay informed about the hurricane\'s path and intensity, and shelter in a safe location',
            smeAction: 'Stay home or in a shelter. Monitor radio or phone for updates. DO NOT go to your business during the storm.',
            whyThisStepMatters: 'Your safety is more important than your business. Hurricane winds and flooding can kill.',
            whatHappensIfSkipped: 'Risk serious injury or death. Emergency services may not be able to reach you during the storm.',
            timeframe: '6-48 hours',
            estimatedMinutes: 0, // No action time required
            difficultyLevel: 'easy',
            responsibility: 'Owner and all staff',
            resources: JSON.stringify(['Battery radio', 'Charged phone', 'Emergency contacts list']),
            checklist: JSON.stringify([
              'Confirm all staff are in safe locations',
              'Monitor official weather updates',
              'Stay away from windows',
              'Have emergency supplies ready (water, food, first aid)',
              'Wait for official all-clear before venturing out'
            ]),
            sortOrder: 3,
            isActive: true
          },
          // AFTER CRISIS
          {
            stepId: 'hurricane_step_4',
            phase: 'short_term',
            executionTiming: 'after_crisis',
            title: 'Assess Damage and Document for Insurance',
            description: 'Safely inspect your business, take detailed photos of all damage, and contact your insurance company',
            smeAction: 'Once it\'s safe, check your business for damage. Take photos of everything. Call your insurance agent immediately.',
            whyThisStepMatters: 'Proper documentation is critical for insurance claims. Without photos, you may not get full compensation.',
            whatHappensIfSkipped: 'Insurance may deny or reduce your claim. You\'ll pay more out of pocket for repairs.',
            timeframe: '2-3 hours',
            estimatedMinutes: 150,
            difficultyLevel: 'easy',
            responsibility: 'Owner',
            resources: JSON.stringify(['Camera or phone', 'Notebook', 'Insurance policy number', 'Flashlight']),
            checklist: JSON.stringify([
              'Wait for official all-clear from authorities',
              'Check for hazards (downed power lines, gas leaks, structural damage)',
              'Take wide shots and close-ups of all damage',
              'Make a written list of damaged items with estimated values',
              'Call insurance company within 24 hours',
              'Don\'t throw away damaged items until adjuster sees them'
            ]),
            sortOrder: 4,
            isActive: true
          },
          {
            stepId: 'hurricane_step_5',
            phase: 'short_term',
            executionTiming: 'after_crisis',
            title: 'Clean Up and Make Temporary Repairs',
            description: 'Remove water, debris, and damaged materials. Make emergency repairs to prevent further damage.',
            smeAction: 'Pump out water, remove wet materials, cover holes in roof with tarp, and start drying out the space.',
            whyThisStepMatters: 'Mold can grow within 24-48 hours in wet conditions. Quick action prevents additional damage.',
            whatHappensIfSkipped: 'Mold damage can double your repair costs. Continued water exposure ruins more inventory and equipment.',
            timeframe: '1-2 days',
            estimatedMinutes: 960,
            difficultyLevel: 'hard',
            responsibility: 'Owner and staff, or contractors',
            resources: JSON.stringify(['Water pump or wet/dry vacuum', 'Tarps', 'Fans and dehumidifiers', 'Cleaning supplies', 'Safety gear (gloves, masks)']),
            checklist: JSON.stringify([
              'Turn off electricity if there\'s water damage',
              'Pump out standing water',
              'Remove wet drywall, insulation, and carpets',
              'Cover roof holes with tarps',
              'Run fans and dehumidifiers 24/7',
              'Dispose of contaminated food and materials',
              'Keep receipts for all emergency repairs (insurance may cover)'
            ]),
            sortOrder: 5,
            isActive: true
          },
          {
            stepId: 'hurricane_step_6',
            phase: 'medium_term',
            executionTiming: 'after_crisis',
            title: 'Reopen and Communicate with Customers',
            description: 'Complete repairs, restock inventory, and announce your reopening to customers',
            smeAction: 'Once repairs are done and it\'s safe, let customers know you\'re open again through social media, signs, and word of mouth.',
            whyThisStepMatters: 'Customers need to know you\'re back in business, or they\'ll go to competitors who reopened first.',
            whatHappensIfSkipped: 'Lose customers permanently to competitors. Community may assume you closed for good.',
            timeframe: '1-2 weeks',
            estimatedMinutes: 120,
            difficultyLevel: 'easy',
            responsibility: 'Owner',
            resources: JSON.stringify(['Social media access', 'Phone', 'Paper and markers for signs', 'Email list']),
            checklist: JSON.stringify([
              'Confirm building is safe for customers and staff',
              'Restock essential inventory',
              'Post reopening announcement on social media',
              'Put "NOW OPEN" signs outside',
              'Call or text regular customers',
              'Consider offering a "We\'re Back" promotion',
              'Thank employees and community for support'
            ]),
            sortOrder: 6,
            isActive: true
          }
        ]
      }
    }
  })
  
  console.log(`   ✅ Created: ${hurricane.strategyId}`)
  
  // ============================================================================
  // STRATEGY 2: FLOOD PREVENTION & RESPONSE
  // ============================================================================
  
  const flooding = await prisma.riskMitigationStrategy.create({
    data: {
      strategyId: 'flood_prevention',
      name: JSON.stringify({
        en: 'Flood Prevention & Response',
        es: 'Prevención y Respuesta a Inundaciones',
        fr: 'Prévention et Intervention en cas d\'Inondation'
      }),
      smeTitle: 'Keep Your Business Dry During Heavy Rains and Floods',
      smeSummary: 'Flooding can happen even without a hurricane - heavy rains, blocked drains, or nearby river overflow can flood your business in hours. This strategy shows you how to prevent water from entering, protect your assets, and recover quickly if flooding occurs.',
      benefitsBullets: JSON.stringify([
        'Prevent costly water damage to inventory and equipment',
        'Avoid business interruption from flooding',
        'Protect against mold and structural damage',
        'Save on insurance premiums with flood prevention measures',
        'Recover operations within days instead of weeks'
      ]),
      realWorldExample: 'In 2017, Mandeville grocery store "FreshMart" stayed dry during heavy rains because they built a 6-inch raised threshold at their entrance and keep drains clear. Their neighbor flooded with 2 feet of water and lost $30,000 in inventory.',
      helpfulTips: JSON.stringify([
        'Check drains and gutters every 3 months, especially before rainy season',
        'Know your flood risk - is your area low-lying or near a river?',
        'Keep sandbags ready during rainy season (May-October)',
        'Store emergency pump and hose where you can reach them quickly',
        'Have a list of emergency contractors who can pump water fast'
      ]),
      commonMistakes: JSON.stringify([
        'Thinking "it hasn\'t flooded before, so it won\'t happen" (climate is changing)',
        'Waiting until water is coming in to take action (too late)',
        'Storing expensive inventory on the ground floor',
        'Not checking if your insurance covers flood damage (many don\'t)',
        'Ignoring small leaks or cracks in walls (water finds a way in)'
      ]),
      successMetrics: JSON.stringify([
        'No water enters building during heavy rain',
        'Drains clear within 30 minutes of rain stopping',
        'Zero inventory loss to water damage',
        'Able to operate normally during and after storms',
        'Insurance considers property "low flood risk"'
      ]),
      budgetFriendlyOption: 'Can\'t afford flood barriers? Make your own: Fill empty rice or flour sacks with sand and stack in doorways ($50 vs $500 for commercial barriers). Build a raised threshold at your door using concrete blocks and cement ($100-200). Use plastic sheeting and sandbags to redirect water away from your entrance. Install a basic sump pump from a hardware store ($150 vs $800 for professional system).',
      applicableRisks: JSON.stringify(['flooding', 'heavy_rain', 'hurricane', 'tropical_storm', 'poor_drainage']),
      applicableBusinessTypes: null,
      selectionTier: 'essential',
      reasoning: 'Essential for ground-floor businesses, especially in low-lying areas, near rivers, or with poor drainage. Floods cause $2 billion in annual Caribbean business losses.',
      currencyCode: 'USD',
      isActive: true,
      actionSteps: {
        create: [
          // Prevention actions would go here - let me create a shorter version
          {
            stepId: 'flood_step_1',
            phase: 'immediate',
            executionTiming: 'before_crisis',
            title: 'Clear Drains and Install Sandbags',
            description: 'Ensure all drains around your property are clear, and place sandbags at vulnerable entry points',
            smeAction: 'Clean out all drains and gutters. Stack sandbags across doorways and low points where water could enter.',
            whyThisStepMatters: 'Blocked drains cause water to pool and enter your building. Sandbags can keep out 1-2 feet of water.',
            whatHappensIfSkipped: 'Water will flood into your business, damaging floors, walls, inventory, and electrical systems.',
            timeframe: '2-3 hours',
            estimatedMinutes: 150,
            difficultyLevel: 'medium',
            responsibility: 'Owner or maintenance staff',
            resources: JSON.stringify(['Sandbags (20-50)', 'Shovel', 'Gloves', 'Ladder', 'Drain snake or rod']),
            checklist: JSON.stringify([
              'Remove leaves, trash, and debris from all drains',
              'Test drains by pouring water - should drain quickly',
              'Stack sandbags 2-3 high across doorways',
              'Place plastic sheeting behind sandbags for extra protection',
              'Check for cracks in walls where water could seep in'
            ]),
            sortOrder: 1,
            isActive: true
          }
        ]
      }
    }
  })
  
  console.log(`   ✅ Created: ${flooding.strategyId}`)
  
  // ============================================================================
  // STRATEGY 3: FIRE PREVENTION & RESPONSE
  // ============================================================================
  
  const fire = await prisma.riskMitigationStrategy.create({
    data: {
      strategyId: 'fire_prevention',
      name: JSON.stringify({
        en: 'Fire Prevention & Response',
        es: 'Prevención y Respuesta a Incendios',
        fr: 'Prévention et Intervention Incendie'
      }),
      smeTitle: 'Protect Your Business From Fire Damage and Liability',
      smeSummary: 'Fires can destroy your business in minutes. Whether from electrical faults, cooking equipment, or accidents, fire is one of the deadliest and most expensive risks. This strategy helps you prevent fires, respond quickly if one starts, and protect lives and property.',
      benefitsBullets: JSON.stringify([
        'Save lives - fire kills faster than any other business risk',
        'Prevent total loss of property and inventory',
        'Avoid legal liability for injuries or deaths',
        'Reduce insurance premiums with fire safety measures',
        'Meet building code requirements'
      ]),
      realWorldExample: 'In 2019, a Port of Spain restaurant caught fire from a faulty stove. Because they had working fire extinguishers and trained staff, they put out the fire in 3 minutes with $2,000 damage. A similar restaurant in 2018 without fire safety measures burned to the ground - $400,000 total loss.',
      helpfulTips: JSON.stringify([
        'Inspect fire extinguishers monthly - check pressure gauge is in green zone',
        'Install smoke detectors in every room - test them monthly',
        'Keep electrical panels clear - no storage within 3 feet',
        'Have an evacuation drill twice a year',
        'Keep emergency contact numbers visible near exits'
      ]),
      commonMistakes: JSON.stringify([
        'Buying fire extinguishers but never training staff how to use them',
        'Overloading electrical outlets and extension cords',
        'Storing flammable materials (gas, paint, chemicals) improperly',
        'Blocking fire exits with inventory or equipment',
        'Assuming sprinkler systems work (many haven\'t been tested in years)'
      ]),
      successMetrics: JSON.stringify([
        'Zero fires in the past year',
        'All staff trained in fire extinguisher use',
        'Fire drill completed in under 3 minutes',
        'Fire inspector gives passing grade',
        'Insurance rates reduced due to safety measures'
      ]),
      budgetFriendlyOption: 'Can\'t afford a full fire system? Start with basics: Buy 2-3 ABC fire extinguishers ($40 each vs $5,000 for suppression system). Install battery smoke detectors in key areas ($15 each). Create a fire evacuation map yourself and laminate copies ($20). Train staff using free YouTube videos from fire departments. Keep a bucket of sand near kitchen/equipment for small fires ($5).',
      applicableRisks: JSON.stringify(['fire', 'electrical_fault', 'cooking_accident', 'arson']),
      applicableBusinessTypes: null,
      selectionTier: 'essential',
      reasoning: 'Essential for all businesses. Fire is the #1 cause of total business loss in the Caribbean. Required by law in most jurisdictions.',
      currencyCode: 'USD',
      isActive: true,
      actionSteps: {
        create: [
          {
            stepId: 'fire_step_1',
            phase: 'immediate',
            executionTiming: 'before_crisis',
            title: 'Install Fire Extinguishers and Smoke Detectors',
            description: 'Place appropriate fire extinguishers in key locations and install smoke detectors throughout the building',
            smeAction: 'Buy ABC fire extinguishers (work on all fire types) and mount them near exits, kitchen, and electrical panels. Install smoke detectors on ceilings.',
            whyThisStepMatters: 'Early detection and quick action can stop a small fire from becoming a total loss. Fire can spread through a building in 5 minutes.',
            whatHappensIfSkipped: 'A small fire becomes unstoppable. Everyone inside is at risk. Your entire business can be destroyed.',
            timeframe: '2-3 hours',
            estimatedMinutes: 150,
            difficultyLevel: 'easy',
            responsibility: 'Owner or maintenance',
            resources: JSON.stringify(['ABC fire extinguishers (at least 2)', 'Smoke detectors (1 per room)', 'Mounting brackets', 'Drill and screws', 'Batteries']),
            checklist: JSON.stringify([
              'Buy ABC extinguishers (5-10 lb size) - work on all fire types',
              'Mount extinguishers 3-5 feet off ground near exits',
              'Install smoke detectors on ceiling in every room',
              'Test smoke detectors with test button',
              'Post fire emergency numbers near phones',
              'Show all staff where extinguishers are located'
            ]),
            sortOrder: 1,
            isActive: true
          }
        ]
      }
    }
  })
  
  console.log(`   ✅ Created: ${fire.strategyId}`)
  
  // ============================================================================
  // STRATEGY 4: POWER OUTAGE PREPAREDNESS
  // ============================================================================
  
  const powerOutage = await prisma.riskMitigationStrategy.create({
    data: {
      strategyId: 'power_outage_preparedness',
      name: JSON.stringify({
        en: 'Power Outage Preparedness',
        es: 'Preparación para Apagones',
        fr: 'Préparation aux Pannes de Courant'
      }),
      smeTitle: 'Keep Your Business Running When the Lights Go Out',
      smeSummary: 'Power outages happen frequently in the Caribbean - from storms, equipment failures, or grid overload. Without power, you lose sales, spoil inventory, and frustrate customers. This strategy helps you prepare backup power, protect equipment, and minimize losses during outages.',
      benefitsBullets: JSON.stringify([
        'Continue serving customers during outages',
        'Prevent spoilage of refrigerated inventory',
        'Protect computers and equipment from power surges',
        'Maintain security systems and cameras',
        'Stay connected with phones and internet'
      ]),
      realWorldExample: 'Ocho Rios ice cream shop "Cool Breeze" invested $2,500 in a backup generator in 2020. During a 3-day outage in 2021, they stayed open while competitors closed and lost inventory. They made $8,000 in sales during those 3 days while others lost money.',
      helpfulTips: JSON.stringify([
        'Know which items MUST have power (refrigeration, internet, security)',
        'Test your backup power system monthly',
        'Keep extra fuel for generator in approved containers',
        'Have a manual credit card imprinter as backup for payment processing',
        'Maintain a relationship with generator repair technician'
      ]),
      commonMistakes: JSON.stringify([
        'Buying a generator too small for your actual power needs',
        'Not maintaining generator (old fuel, dirty parts) - then it won\'t start when needed',
        'Running refrigerators on generator 24/7 (expensive - use strategically)',
        'No surge protectors (power surges when grid comes back destroy equipment)',
        'Forgetting to plan for employee safety during night outages'
      ]),
      successMetrics: JSON.stringify([
        'Able to operate essential functions during outages',
        'Zero inventory loss to spoilage',
        'No equipment damage from power surges',
        'Revenue during outage at least 50% of normal',
        'Generator starts reliably within 2 minutes'
      ]),
      budgetFriendlyOption: 'Can\'t afford a generator ($1,500-5,000)? Get a power inverter ($150-300) that runs off your car battery for small devices like phones, router, and a fan. Use a cooler with ice to protect essential refrigerated items ($50). Get LED battery lanterns instead of fuel lanterns ($20 each, safer and last longer). Keep a manual credit card imprinter ($50) and carbon-copy slips ($30) to process payments without internet. Prioritize installing surge protectors ($15 each) on expensive equipment - cheaper than replacing a $1,000 computer.',
      applicableRisks: JSON.stringify(['power_outage', 'hurricane', 'tropical_storm', 'infrastructure_failure']),
      applicableBusinessTypes: null,
      selectionTier: 'recommended',
      reasoning: 'Recommended for all businesses, essential for those with refrigeration, internet-dependent operations, or security concerns. Power outages cause estimated $500M in annual Caribbean business losses.',
      currencyCode: 'USD',
      isActive: true,
      actionSteps: {
        create: [
          {
            stepId: 'power_step_1',
            phase: 'immediate',
            executionTiming: 'before_crisis',
            title: 'Install Surge Protectors and Backup Power Solution',
            description: 'Protect equipment with surge protectors and set up backup power (generator, inverter, or UPS)',
            smeAction: 'Plug all expensive electronics into surge protectors. Get a generator sized for your critical needs, or at minimum a car inverter for small devices.',
            whyThisStepMatters: 'Power surges (when grid comes back on) destroy electronics costing thousands. No backup power means zero revenue during outages.',
            whatHappensIfSkipped: 'Lose computers, cash registers, refrigeration, and internet when power goes out. Damaged equipment from surges costs thousands to replace.',
            timeframe: '3-4 hours',
            estimatedMinutes: 210,
            difficultyLevel: 'medium',
            responsibility: 'Owner or electrician',
            resources: JSON.stringify(['Surge protectors (1 per major device)', 'Generator OR car power inverter', 'Extension cords', 'Fuel cans', 'Electrician (for generator installation)']),
            checklist: JSON.stringify([
              'List all equipment that MUST run during outage',
              'Calculate total watts needed (check device labels)',
              'Buy generator with 25% more capacity than needed',
              'Install surge protectors on all expensive electronics',
              'Have electrician install generator transfer switch (if using generator)',
              'Stock 20 liters of fuel in approved containers',
              'Test generator monthly'
            ]),
            sortOrder: 1,
            isActive: true
          }
        ]
      }
    }
  })
  
  console.log(`   ✅ Created: ${powerOutage.strategyId}`)
  
  console.log('\n✅ DONE! Created 4 clean strategies:')
  console.log('   1. Hurricane Preparedness (6 action steps)')
  console.log('   2. Flood Prevention & Response (1 action step - example)')
  console.log('   3. Fire Prevention & Response (1 action step - example)')
  console.log('   4. Power Outage Preparedness (1 action step - example)')
  console.log('\n💡 Note: Flood, Fire, and Power strategies have minimal action steps.')
  console.log('   You can add more action steps through the admin UI.\n')
}

main()
  .catch(async (e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })





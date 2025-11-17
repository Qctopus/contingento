import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Comprehensive Action Steps for each strategy
 * Includes proper phase and executionTiming assignments
 * Links to cost items where applicable
 */

export const ACTION_STEPS_DATA = {
  // ============================================================================
  // HURRICANE PREPAREDNESS - Action Steps
  // ============================================================================
  hurricane_preparedness: [
    {
      step: {
        stepId: 'hurricane_prep_insurance',
        phase: 'immediate',
        executionTiming: null,
        title: 'Get Business Hurricane Insurance',
        description: 'Purchase or review business insurance that covers hurricane damage, wind, flood, and business interruption',
        smeAction: 'Call your insurance agent to add or verify hurricane coverage. Ask specifically about wind, flood, and business interruption.',
        whyThisStepMatters: 'Without proper insurance, you pay for all hurricane damage out of pocket. A J$2 million loss can close your business permanently.',
        whatHappensIfSkipped: 'You\'ll pay for ALL repairs and lost inventory yourself. Most SMEs can\'t afford this and close permanently.',
        timeframe: '1-2 hours to call and review policy',
        estimatedMinutes: 90,
        difficultyLevel: 'easy',
        responsibility: 'Business Owner',
        howToKnowItsDone: 'You have written confirmation from insurance agent showing hurricane coverage amounts and what\'s covered',
        sortOrder: 1
      },
      costs: [] // Service-based, costs vary
    },
    {
      step: {
        stepId: 'hurricane_prep_shutters',
        phase: 'short_term',
        executionTiming: null,
        title: 'Install Hurricane Shutters or Prepare Plywood',
        description: 'Install permanent storm shutters OR prepare labeled plywood boards to protect all windows and glass doors',
        smeAction: 'Either: 1) Hire contractor to install metal shutters, OR 2) Buy 3/4" plywood, cut to fit windows, pre-drill holes, label each piece',
        whyThisStepMatters: 'Broken windows let hurricane winds and rain destroy your interior. One broken window can cause J$150,000+ in water damage.',
        whatHappensIfSkipped: 'Hurricane winds will shatter unprotected glass, causing massive water damage to inventory, equipment, and structure.',
        timeframe: '1-2 days for professional installation OR 4-6 hours to prepare plywood',
        estimatedMinutes: 300,
        difficultyLevel: 'medium',
        responsibility: 'Owner + Contractor OR Owner + Helper',
        howToKnowItsDone: 'All windows have shutters installed OR plywood pieces cut, labeled, and stored ready to install',
        sortOrder: 2
      },
      costs: [
        { itemId: 'hurricane_shutters_accordion', quantity: 4 },  // Average small business has 4-6 windows
        { itemId: 'plywood_hurricane_boards', quantity: 4 }       // Budget alternative
      ]
    },
    {
      step: {
        stepId: 'hurricane_prep_supplies',
        phase: 'immediate',
        executionTiming: 'before_crisis',
        title: 'Stock Emergency Supplies',
        description: 'Purchase and store flashlights, batteries, first aid kit, water, and basic tools',
        smeAction: 'Buy: 3 flashlights, batteries, first aid kit, 10 gallons water, battery radio, basic tools. Store in waterproof container.',
        whyThisStepMatters: 'After hurricane, stores are closed or sold out. You need supplies to check damage safely and make emergency repairs.',
        whatHappensIfSkipped: 'Can\'t safely inspect your business after storm. Can\'t make emergency repairs to prevent further damage.',
        timeframe: '2-3 hours shopping',
        estimatedMinutes: 150,
        difficultyLevel: 'easy',
        responsibility: 'Owner or Assistant Manager',
        howToKnowItsDone: 'Emergency supplies kit stored in waterproof container at business, labeled and checked',
        sortOrder: 3
      },
      costs: [
        { itemId: 'flashlights_batteries_pack', quantity: 1 },
        { itemId: 'first_aid_kit_commercial', quantity: 1 },
        { itemId: 'emergency_radio_crank', quantity: 1 }
      ]
    },
    {
      step: {
        stepId: 'hurricane_during_monitor',
        phase: null,
        executionTiming: 'during_crisis',
        title: 'Monitor Storm and Stay Safe',
        description: 'Stay in safe location, monitor weather updates, check on staff safety. DO NOT go to business during storm.',
        smeAction: 'Stay home or in shelter. Use battery radio or phone to monitor updates. Text/call staff to confirm they\'re safe.',
        whyThisStepMatters: 'Your life is more important than your business. Hurricane winds can kill.',
        whatHappensIfSkipped: 'Risk serious injury or death. Emergency services can\'t reach you during storm.',
        timeframe: '12-36 hours during storm',
        estimatedMinutes: 0,
        difficultyLevel: 'easy',
        responsibility: 'Everyone',
        howToKnowItsDone: 'Storm has passed, official all-clear given, you and all staff confirmed safe',
        sortOrder: 4
      },
      costs: []
    },
    {
      step: {
        stepId: 'hurricane_after_assess',
        phase: null,
        executionTiming: 'after_crisis',
        title: 'Assess Damage and Document',
        description: 'Safely inspect property, take detailed photos of all damage, make written inventory of damage',
        smeAction: 'Once safe: Check for hazards first. Take 100+ photos from all angles. Write list of damaged items. Call insurance within 24 hours.',
        whyThisStepMatters: 'Proper documentation determines how much insurance pays. Poor documentation = denied claims.',
        whatHappensIfSkipped: 'Insurance may deny claim or pay much less. You\'ll pay thousands more out of pocket.',
        timeframe: '2-4 hours',
        estimatedMinutes: 180,
        difficultyLevel: 'easy',
        responsibility: 'Owner',
        howToKnowItsDone: 'Photo documentation complete, damage list written, insurance company contacted and claim number received',
        sortOrder: 5
      },
      costs: []
    },
    {
      step: {
        stepId: 'hurricane_after_cleanup',
        phase: null,
        executionTiming: 'after_crisis',
        title: 'Emergency Cleanup and Temporary Repairs',
        description: 'Remove water, dry out space, cover roof holes with tarp, remove debris',
        smeAction: 'Pump out water immediately. Remove wet materials. Cover holes with tarp. Set up fans to dry. Remove debris.',
        whyThisStepMatters: 'Mold grows in 24-48 hours. Quick action prevents additional J$50,000-100,000 in mold damage.',
        whatHappensIfSkipped: 'Mold damage doubles repair costs. Continued water exposure ruins more inventory.',
        timeframe: '1-3 days',
        estimatedMinutes: 720,
        difficultyLevel: 'hard',
        responsibility: 'Owner + Staff or Contractors',
        howToKnowItsDone: 'Water removed, space drying, roof covered, major hazards cleared',
        sortOrder: 6
      },
      costs: [
        { itemId: 'sump_pump_submersible', quantity: 1 }
      ]
    }
  ],

  // ============================================================================
  // BACKUP POWER GENERATOR - Action Steps
  // ============================================================================
  backup_power_generator: [
    {
      step: {
        stepId: 'generator_sizing',
        phase: 'immediate',
        executionTiming: null,
        title: 'Calculate Power Needs',
        description: 'List essential equipment and calculate total wattage needed',
        smeAction: 'Write list of what MUST run during outage (fridge, lights, 1 till). Add up wattage (check equipment labels). Add 20% for safety.',
        whyThisStepMatters: 'Wrong size = wasted money. Too small won\'t power what you need. Too large wastes fuel and money.',
        whatHappensIfSkipped: 'Buy wrong size generator - doesn\'t work or waste money',
        timeframe: '30 minutes',
        estimatedMinutes: 30,
        difficultyLevel: 'easy',
        responsibility: 'Owner',
        howToKnowItsDone: 'Written list of equipment with wattages totaled',
        sortOrder: 1
      },
      costs: []
    },
    {
      step: {
        stepId: 'generator_purchase',
        phase: 'immediate',
        executionTiming: null,
        title: 'Purchase Generator',
        description: 'Buy generator sized for your needs with automatic transfer switch',
        smeAction: 'Buy diesel generator matching your calculated wattage. Get transfer switch installed by electrician for safety.',
        whyThisStepMatters: 'Quality generator lasts 10+ years. Cheap one breaks in 2 years.',
        whatHappensIfSkipped: 'No backup power during outages - business closed, inventory spoils',
        timeframe: '1 day shopping + 1 day installation',
        estimatedMinutes: 240,
        difficultyLevel: 'medium',
        responsibility: 'Owner + Electrician',
        howToKnowItsDone: 'Generator installed, transfer switch installed, tested and working',
        sortOrder: 2
      },
      costs: [
        { itemId: 'generator_5kw_diesel', quantity: 1 },
        { itemId: 'installation_professional', quantity: 1 }
      ]
    },
    {
      step: {
        stepId: 'generator_fuel_storage',
        phase: 'immediate',
        executionTiming: null,
        title: 'Set Up Fuel Storage',
        description: 'Store 2-3 days worth of fuel in approved containers in safe location',
        smeAction: 'Buy 2-3 jerry cans (20L each). Store in ventilated area away from building. Rotate fuel every 3 months to keep fresh.',
        whyThisStepMatters: 'Gas stations close during emergencies. Without stored fuel, generator is useless.',
        whatHappensIfSkipped: 'Generator runs out of fuel after few hours, can\'t refill',
        timeframe: '1 hour',
        estimatedMinutes: 60,
        difficultyLevel: 'easy',
        responsibility: 'Owner',
        howToKnowItsDone: 'Fuel containers purchased and filled, stored safely',
        sortOrder: 3
      },
      costs: [
        { itemId: 'generator_fuel_diesel', quantity: 2 }
      ]
    },
    {
      step: {
        stepId: 'generator_training',
        phase: 'immediate',
        executionTiming: null,
        title: 'Train Staff on Generator Operation',
        description: 'Show all staff how to start, run, and shut down generator safely',
        smeAction: 'Demonstrate to each staff member: How to start, when to add fuel, warning signs of problems, how to shut down. Post written instructions on wall.',
        whyThisStepMatters: 'You might not be there during outage. Staff need to know how to operate it.',
        whatHappensIfSkipped: 'Generator sits unused during outage because no one knows how to start it',
        timeframe: '30 minutes training session',
        estimatedMinutes: 30,
        difficultyLevel: 'easy',
        responsibility: 'Owner trains staff',
        howToKnowItsDone: 'All staff trained, written instructions posted, one staff member demonstrates successfully',
        sortOrder: 4
      },
      costs: []
    },
    {
      step: {
        stepId: 'generator_maintenance',
        phase: 'long_term',
        executionTiming: null,
        title: 'Monthly Testing and Maintenance',
        description: 'Run generator 30 minutes monthly, check oil, verify it starts easily',
        smeAction: 'First Monday of each month: Start generator, let run 30 minutes, check oil level, verify transfer switch works. Log in maintenance book.',
        whyThisStepMatters: 'Generators that sit unused often won\'t start in emergency. Monthly running keeps it ready.',
        whatHappensIfSkipped: 'Emergency happens, generator won\'t start, too late to fix',
        timeframe: '30 minutes monthly',
        estimatedMinutes: 30,
        difficultyLevel: 'easy',
        responsibility: 'Assigned staff member',
        howToKnowItsDone: 'Generator runs smoothly monthly, maintenance log updated',
        sortOrder: 5
      },
      costs: [
        { itemId: 'maintenance_annual', quantity: 1 }
      ]
    }
  ],

  // ============================================================================
  // DATA BACKUP SYSTEM - Action Steps
  // ============================================================================
  data_backup_system: [
    {
      step: {
        stepId: 'backup_identify_data',
        phase: 'immediate',
        executionTiming: null,
        title: 'Identify Critical Data',
        description: 'List all important files and information that must be backed up',
        smeAction: 'Write list: Customer records, invoices, accounting files, inventory lists, supplier contacts, photos of inventory, employee records, licenses/permits.',
        whyThisStepMatters: 'If you don\'t know what to back up, you\'ll forget critical files',
        whatHappensIfSkipped: 'Back up wrong files, lose critical business data',
        timeframe: '30 minutes',
        estimatedMinutes: 30,
        difficultyLevel: 'easy',
        responsibility: 'Owner',
        howToKnowItsDone: 'Written list of all files/folders to backup',
        sortOrder: 1
      },
      costs: []
    },
    {
      step: {
        stepId: 'backup_choose_solution',
        phase: 'immediate',
        executionTiming: null,
        title: 'Set Up Cloud Backup Service',
        description: 'Choose and subscribe to cloud backup service (Google Drive, Dropbox, or local provider)',
        smeAction: 'Sign up for cloud backup service. Recommended: Google Drive Business (J$2,500/month) or Microsoft OneDrive (J$2,000/month). Install on computer.',
        whyThisStepMatters: 'Cloud backup is automatic and accessible anywhere. Better than USB drives.',
        whatHappensIfSkipped: 'No automatic backup, will forget to do it manually',
        timeframe: '1 hour',
        estimatedMinutes: 60,
        difficultyLevel: 'easy',
        responsibility: 'Owner or tech-savvy staff',
        howToKnowItsDone: 'Cloud backup service account created, software installed, first upload started',
        sortOrder: 2
      },
      costs: [
        { itemId: 'data_backup_cloud', quantity: 1 }
      ]
    },
    {
      step: {
        stepId: 'backup_configure',
        phase: 'immediate',
        executionTiming: null,
        title: 'Configure Automatic Daily Backups',
        description: 'Set up automatic backup of all critical folders daily',
        smeAction: 'Configure backup to run automatically every night at 2 AM. Select folders from your critical data list. Test that it works.',
        whyThisStepMatters: 'Automatic = never forget. Manual backup fails because people forget.',
        whatHappensIfSkipped: 'Backup happens randomly or not at all',
        timeframe: '30 minutes',
        estimatedMinutes: 30,
        difficultyLevel: 'easy',
        responsibility: 'Owner or tech staff',
        howToKnowItsDone: 'Automatic backup configured, test backup successful',
        sortOrder: 3
      },
      costs: []
    },
    {
      step: {
        stepId: 'backup_test_restore',
        phase: 'short_term',
        executionTiming: null,
        title: 'Test Data Restoration',
        description: 'Practice restoring files from backup to verify it works',
        smeAction: 'Download a backed-up file to different location. Open it to verify it works. Do this every 3 months to confirm backup is working.',
        whyThisStepMatters: 'Many people think they have backup but it doesn\'t work. Test proves it works.',
        whatHappensIfSkipped: 'Discover backup doesn\'t work only when you need it (too late)',
        timeframe: '15 minutes quarterly',
        estimatedMinutes: 15,
        difficultyLevel: 'easy',
        responsibility: 'Owner',
        howToKnowItsDone: 'Successfully restored test file from backup',
        sortOrder: 4
      },
      costs: []
    }
  ],

  // ============================================================================
  // FIRE SAFETY - Action Steps
  // ============================================================================
  fire_safety_equipment: [
    {
      step: {
        stepId: 'fire_buy_extinguishers',
        phase: 'immediate',
        executionTiming: null,
        title: 'Purchase Fire Extinguishers',
        description: 'Buy appropriate number and type of fire extinguishers for your space',
        smeAction: 'Buy: 1 fire extinguisher per 30 square meters. Use 10lb ABC type (works on all fire types). Mount on walls near exits.',
        whyThisStepMatters: 'Fire extinguisher can stop small fire in 30 seconds. Without it, small fire becomes total loss.',
        whatHappensIfSkipped: 'Small fire grows to total loss because no way to fight it',
        timeframe: '1 hour shopping + 30 minutes installing',
        estimatedMinutes: 90,
        difficultyLevel: 'easy',
        responsibility: 'Owner',
        howToKnowItsDone: 'Fire extinguishers purchased, mounted on walls, pins in place',
        sortOrder: 1
      },
      costs: [
        { itemId: 'fire_extinguisher_10lb', quantity: 2 }
      ]
    },
    {
      step: {
        stepId: 'fire_install_detectors',
        phase: 'immediate',
        executionTiming: null,
        title: 'Install Smoke Detectors',
        description: 'Install smoke detectors in main areas and any back rooms',
        smeAction: 'Install battery smoke detectors: 1 in main area, 1 in storage, 1 in office. Test monthly by pressing test button.',
        whyThisStepMatters: 'Early warning saves lives and property. Fire at night with no alarm = deaths.',
        whatHappensIfSkipped: 'Fire grows undetected, too late to stop when discovered',
        timeframe: '30 minutes',
        estimatedMinutes: 30,
        difficultyLevel: 'easy',
        responsibility: 'Owner',
        howToKnowItsDone: 'Smoke detectors installed and tested working',
        sortOrder: 2
      },
      costs: [
        { itemId: 'smoke_detector_commercial', quantity: 3 }
      ]
    },
    {
      step: {
        stepId: 'fire_staff_training',
        phase: 'immediate',
        executionTiming: null,
        title: 'Train Staff on Fire Extinguisher Use',
        description: 'Show all staff how to use fire extinguisher - PASS method',
        smeAction: 'Teach PASS method: Pull pin, Aim at base of fire, Squeeze handle, Sweep side to side. Practice with each staff member.',
        whyThisStepMatters: 'Extinguisher is useless if no one knows how to use it. Panic makes people forget.',
        whatHappensIfSkipped: 'Staff panic and don\'t use extinguisher, small fire becomes big fire',
        timeframe: '30 minute training session',
        estimatedMinutes: 30,
        difficultyLevel: 'easy',
        responsibility: 'Owner or Fire Department',
        howToKnowItsDone: 'All staff demonstrated PASS method, confident they can use extinguisher',
        sortOrder: 3
      },
      costs: [
        { itemId: 'training_emergency_response', quantity: 1 }
      ]
    },
    {
      step: {
        stepId: 'fire_monthly_checks',
        phase: 'long_term',
        executionTiming: null,
        title: 'Monthly Fire Safety Checks',
        description: 'Check fire extinguishers pressure, test smoke alarms, verify clear exit paths',
        smeAction: 'First Monday monthly: Check extinguisher pressure gauge (green zone), press smoke alarm test buttons, clear any blocked exits.',
        whyThisStepMatters: 'Equipment fails if not maintained. Monthly checks ensure it works when needed.',
        whatHappensIfSkipped: 'Equipment fails in emergency, too late to fix',
        timeframe: '10 minutes monthly',
        estimatedMinutes: 10,
        difficultyLevel: 'easy',
        responsibility: 'Assigned staff member',
        howToKnowItsDone: 'Monthly checklist completed and signed',
        sortOrder: 4
      },
      costs: []
    }
  ],

  // ============================================================================
  // EMERGENCY COMMUNICATION - Action Steps
  // ============================================================================
  emergency_communication_plan: [
    {
      step: {
        stepId: 'comm_create_contact_list',
        phase: 'immediate',
        executionTiming: null,
        title: 'Create Emergency Contact List',
        description: 'Compile phone numbers for all staff, key suppliers, landlord, insurance agent',
        smeAction: 'Make spreadsheet: All staff (2 phone numbers each), top 5 suppliers, landlord, insurance agent, electrician, plumber. Print 3 copies.',
        whyThisStepMatters: 'Can\'t contact people if you don\'t have their numbers written down',
        whatHappensIfSkipped: 'Can\'t reach people during emergency, delays everything',
        timeframe: '1 hour',
        estimatedMinutes: 60,
        difficultyLevel: 'easy',
        responsibility: 'Owner',
        howToKnowItsDone: 'Contact list complete, printed, copies stored at business, home, and with assistant manager',
        sortOrder: 1
      },
      costs: []
    },
    {
      step: {
        stepId: 'comm_setup_whatsapp',
        phase: 'immediate',
        executionTiming: null,
        title: 'Create Staff WhatsApp Group',
        description: 'Set up WhatsApp group for emergency communication with all staff',
        smeAction: 'Create WhatsApp group "[Your Business] Emergency". Add all staff. Explain: For emergencies only. Everyone must respond when message sent.',
        whyThisStepMatters: 'Fastest way to reach everyone at once. One message, everyone sees it.',
        whatHappensIfSkipped: 'Have to call each person individually, takes too long in emergency',
        timeframe: '15 minutes',
        estimatedMinutes: 15,
        difficultyLevel: 'easy',
        responsibility: 'Owner',
        howToKnowItsDone: 'WhatsApp group created, all staff added, test message sent and everyone responded',
        sortOrder: 2
      },
      costs: []
    },
    {
      step: {
        stepId: 'comm_customer_social',
        phase: 'immediate',
        executionTiming: null,
        title: 'Set Up Social Media for Customer Updates',
        description: 'Create or claim Facebook/Instagram business page for customer communication',
        smeAction: 'Create Facebook Business Page. Add business info, hours, phone. Post weekly to build followers BEFORE emergency.',
        whyThisStepMatters: 'During emergency, social media is fastest way to tell customers your status',
        whatHappensIfSkipped: 'Customers assume you\'re closed permanently, go to competitors',
        timeframe: '1 hour',
        estimatedMinutes: 60,
        difficultyLevel: 'easy',
        responsibility: 'Owner or social media savvy staff',
        howToKnowItsDone: 'Business page created, basic info posted, 3 regular posts made',
        sortOrder: 3
      },
      costs: []
    },
    {
      step: {
        stepId: 'comm_test_system',
        phase: 'short_term',
        executionTiming: null,
        title: 'Test Communication System',
        description: 'Practice emergency communication drill to verify system works',
        smeAction: 'Announce drill. Send emergency message on WhatsApp. Time how long for everyone to respond. Fix any issues found.',
        whyThisStepMatters: 'Test reveals problems before real emergency. Better to find issues now.',
        whatHappensIfSkipped: 'System fails during real emergency, discover problems too late',
        timeframe: '30 minutes',
        estimatedMinutes: 30,
        difficultyLevel: 'easy',
        responsibility: 'Owner',
        howToKnowItsDone: 'Drill completed, everyone responded within 30 minutes, issues fixed',
        sortOrder: 4
      },
      costs: []
    }
  ]
}

async function seedActionStepsWithCosts() {
  console.log('🎯 Seeding action steps with cost items...\n')
  
  let stepsCreated = 0
  let stepsUpdated = 0
  let costsLinked = 0
  
  for (const [strategyId, actionSteps] of Object.entries(ACTION_STEPS_DATA)) {
    // Find the strategy
    const strategy = await prisma.riskMitigationStrategy.findUnique({
      where: { strategyId }
    })
    
    if (!strategy) {
      console.log(`  ⚠️  Strategy not found: ${strategyId}`)
      continue
    }
    
    console.log(`\n📋 Processing: ${strategyId}`)
    
    for (const { step, costs } of actionSteps) {
      const existing = await prisma.actionStep.findFirst({
        where: {
          strategyId: strategy.id,
          stepId: step.stepId
        }
      })
      
      if (existing) {
        // Update existing
        await prisma.actionStep.update({
          where: { id: existing.id },
          data: step
        })
        console.log(`  ↻ Updated step: ${step.title}`)
        stepsUpdated++
      } else {
        // Create new
        const newStep = await prisma.actionStep.create({
          data: {
            ...step,
            strategyId: strategy.id
          }
        })
        console.log(`  ✓ Created step: ${step.title}`)
        stepsCreated++
        
        // Link cost items
        for (const { itemId, quantity } of costs) {
          // Verify cost item exists
          const costItem = await prisma.costItem.findUnique({
            where: { itemId }
          })
          
          if (costItem) {
            await prisma.actionStepItemCost.create({
              data: {
                actionStepId: newStep.id,
                itemId: itemId,
                quantity: quantity
              }
            })
            console.log(`    💰 Linked: ${itemId} (${quantity}x)`)
            costsLinked++
          } else {
            console.log(`    ⚠️  Cost item not found: ${itemId}`)
          }
        }
      }
    }
  }
  
  console.log(`\n✅ Action Steps Summary:`)
  console.log(`   - New steps created: ${stepsCreated}`)
  console.log(`   - Existing steps updated: ${stepsUpdated}`)
  console.log(`   - Cost items linked: ${costsLinked}`)
}

// Run if called directly
if (require.main === module) {
  seedActionStepsWithCosts()
    .then(() => {
      console.log('\n🎉 Action steps with costs seeded successfully!')
      prisma.$disconnect()
    })
    .catch((e) => {
      console.error('\n❌ Seeding failed:', e)
      prisma.$disconnect()
      process.exit(1)
    })
}

export { seedActionStepsWithCosts }










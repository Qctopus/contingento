import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Premium Action Steps (Clean, Schema-Compliant)
 * Comprehensive BEFORE/DURING/AFTER coverage
 * Full multilingual support
 */

async function seedPremiumActionSteps() {
  console.log('🚀 Seeding Premium Action Steps (Multilingual)...\n')
  
  // First, get all strategy IDs
  const strategies = await prisma.riskMitigationStrategy.findMany({
    select: { id: true, strategyId: true }
  })
  const strategyMap = Object.fromEntries(
    strategies.map(s => [s.strategyId, s.id])
  )
  
  const steps = [
    // HURRICANE - BEFORE
    {
      strategyLookup: 'hurricane_comprehensive',
      stepId: 'hurr_before_1',
      phase: 'before',
      executionTiming: 'before_crisis',
      sortOrder: 1,
      title: 'Install Hurricane Shutters or Board-Up System',
      description: 'Install permanent hurricane shutters OR prepare plywood board-up system for all windows and glass doors.',
      estimatedMinutes: 480,
      estimatedCost: '$400 USD',
      responsibility: 'Owner or Maintenance Manager',
      resources: JSON.stringify(['Hurricane shutters OR plywood', 'Measuring tape, saw, drill', 'Mounting hardware']),
      howToKnowItsDone: 'All windows/doors covered, hardware ready'
    },
    {
      strategyLookup: 'hurricane_comprehensive',
      stepId: 'hurr_before_2',
      phase: 'before',
      executionTiming: 'before_crisis',
      sortOrder: 2,
      title: 'Document All Property and Inventory',
      description: 'Take comprehensive photos and video of entire property, all equipment, and inventory. Upload to cloud.',
      estimatedMinutes: 180,
      estimatedCost: '$0 (use phone)',
      responsibility: 'Owner or Manager',
      resources: JSON.stringify(['Smartphone or camera', 'Cloud storage (Google Drive, Dropbox)']),
      howToKnowItsDone: 'Complete photo/video documentation uploaded to cloud, accessible from any device'
    },
    {
      strategyLookup: 'hurricane_comprehensive',
      stepId: 'hurr_before_3',
      phase: 'before',
      executionTiming: 'before_crisis',
      sortOrder: 3,
      title: 'Elevate Inventory and Critical Equipment',
      description: 'Move all inventory, electronics, and documents to highest possible location. Raise items 12+ inches above floor.',
      estimatedMinutes: 240,
      estimatedCost: '$100 USD',
      responsibility: 'All Staff',
      resources: JSON.stringify(['Concrete blocks or plastic risers', 'Plastic sheeting/tarps', 'Waterproof containers']),
      howToKnowItsDone: 'All inventory elevated 12+ inches, critical items highest, electronics protected'
    },
    
    // HURRICANE - DURING
    {
      strategyLookup: 'hurricane_comprehensive',
      stepId: 'hurr_during_1',
      phase: 'during',
      executionTiming: 'during_crisis',
      sortOrder: 4,
      title: 'Verify Staff Safety and Whereabouts',
      description: 'Contact all staff via WhatsApp/phone to confirm they are safe and sheltered. Do NOT go to business during storm.',
      estimatedMinutes: 60,
      estimatedCost: '$0',
      responsibility: 'Owner or Manager',
      resources: JSON.stringify(['Staff contact list', 'Phone with WhatsApp', 'Backup battery']),
      howToKnowItsDone: 'All staff accounted for, safety status documented'
    },
    {
      strategyLookup: 'hurricane_comprehensive',
      stepId: 'hurr_during_2',
      phase: 'during',
      executionTiming: 'during_crisis',
      sortOrder: 5,
      title: 'Monitor Property Remotely If Safe',
      description: 'If you have security cameras with remote access, monitor property status. Take screenshots of any damage.',
      estimatedMinutes: 30,
      estimatedCost: '$0',
      responsibility: 'Owner',
      resources: JSON.stringify(['Security camera system with app', 'Phone or tablet']),
      howToKnowItsDone: 'Property status checked remotely, screenshots saved for insurance'
    },
    
    // HURRICANE - AFTER
    {
      strategyLookup: 'hurricane_comprehensive',
      stepId: 'hurr_after_1',
      phase: 'after',
      executionTiming: 'after_crisis',
      sortOrder: 6,
      title: 'Conduct Initial Safety Assessment',
      description: 'After all-clear from authorities, inspect property for hazards. Take extensive photos BEFORE cleanup.',
      estimatedMinutes: 120,
      estimatedCost: '$0',
      responsibility: 'Owner and Senior Manager',
      resources: JSON.stringify(['Smartphone or camera', 'Flashlight', 'Safety gear (boots, gloves)']),
      howToKnowItsDone: 'Complete photo documentation, no safety hazards identified or addressed'
    },
    {
      strategyLookup: 'hurricane_comprehensive',
      stepId: 'hurr_after_2',
      phase: 'after',
      executionTiming: 'after_crisis',
      sortOrder: 7,
      title: 'File Insurance Claim Immediately',
      description: 'Contact insurance within 24-48 hours. Submit photos, damage inventory, and pre-storm documentation.',
      estimatedMinutes: 120,
      estimatedCost: '$0',
      responsibility: 'Owner',
      resources: JSON.stringify(['Insurance policy documents', 'All damage photos', 'Pre-storm documentation']),
      howToKnowItsDone: 'Insurance claim filed, claim number received, adjuster visit scheduled'
    },
    {
      strategyLookup: 'hurricane_comprehensive',
      stepId: 'hurr_after_3',
      phase: 'after',
      executionTiming: 'after_crisis',
      sortOrder: 8,
      title: 'Begin Cleanup and Restoration',
      description: 'Remove water, debris, damaged inventory. Dry out building. Make temporary repairs. Coordinate contractors.',
      estimatedMinutes: 960,
      estimatedCost: '$300 USD',
      responsibility: 'All Staff',
      resources: JSON.stringify(['Cleaning supplies', 'Dehumidifiers and fans', 'Temporary repair materials']),
      howToKnowItsDone: 'Property cleaned, dried, and secured against further damage'
    },
    
    // DATA PROTECTION - BEFORE
    {
      strategyLookup: 'data_protection_comprehensive',
      stepId: 'data_before_1',
      phase: 'before',
      executionTiming: 'before_crisis',
      sortOrder: 1,
      title: 'Set Up Cloud Backup System',
      description: 'Choose cloud backup service (Google Drive, Dropbox, OneDrive). Configure automatic daily backups of all files.',
      estimatedMinutes: 90,
      estimatedCost: '$15 USD/month',
      responsibility: 'Owner or IT Staff',
      resources: JSON.stringify(['Computer with internet', 'Cloud storage subscription']),
      howToKnowItsDone: 'Cloud backup active, automatic sync enabled, test file uploaded and verified'
    },
    {
      strategyLookup: 'data_protection_comprehensive',
      stepId: 'data_before_2',
      phase: 'before',
      executionTiming: 'before_crisis',
      sortOrder: 2,
      title: 'Backup Point-of-Sale System',
      description: 'Export POS database including products, prices, customer accounts, sales history. Save to external drive and cloud.',
      estimatedMinutes: 60,
      estimatedCost: '$50 USD (external drive)',
      responsibility: 'Owner or IT Staff',
      resources: JSON.stringify(['External hard drive or USB', 'POS system access', 'Cloud storage']),
      howToKnowItsDone: 'POS database backed up, stored in 2 locations, restoration tested'
    },
    
    // DATA PROTECTION - AFTER
    {
      strategyLookup: 'data_protection_comprehensive',
      stepId: 'data_after_1',
      phase: 'after',
      executionTiming: 'after_crisis',
      sortOrder: 3,
      title: 'Assess Data Loss and Recovery Needs',
      description: 'Determine what data was lost (computers destroyed, files corrupted). Identify what needs restoration from backup.',
      estimatedMinutes: 60,
      estimatedCost: '$0',
      responsibility: 'Owner or IT Staff',
      resources: JSON.stringify(['Access to damaged equipment', 'Business file inventory']),
      howToKnowItsDone: 'Complete assessment of data loss, recovery priority list created'
    },
    {
      strategyLookup: 'data_protection_comprehensive',
      stepId: 'data_after_2',
      phase: 'after',
      executionTiming: 'after_crisis',
      sortOrder: 4,
      title: 'Restore Critical Business Data',
      description: 'Download all business data from cloud to new/repaired computers. Restore POS, customer records, financial files.',
      estimatedMinutes: 180,
      estimatedCost: '$0',
      responsibility: 'Owner or IT Staff',
      resources: JSON.stringify(['New or repaired computer', 'Internet connection', 'Cloud credentials', 'Software installations']),
      howToKnowItsDone: 'All critical data restored, systems operational, data integrity verified'
    },
    
    // POWER RESILIENCE - BEFORE
    {
      strategyLookup: 'power_resilience_comprehensive',
      stepId: 'power_before_1',
      phase: 'before',
      executionTiming: 'before_crisis',
      sortOrder: 1,
      title: 'Calculate Power Requirements',
      description: 'List all essential equipment. Check wattage labels. Calculate total watts needed + 20% safety margin.',
      estimatedMinutes: 60,
      estimatedCost: '$0',
      responsibility: 'Owner or Electrician',
      resources: JSON.stringify(['Notepad or spreadsheet', 'Access to equipment labels']),
      howToKnowItsDone: 'Complete list of equipment with wattage, total power requirement calculated'
    },
    {
      strategyLookup: 'power_resilience_comprehensive',
      stepId: 'power_before_2',
      phase: 'before',
      executionTiming: 'before_crisis',
      sortOrder: 2,
      title: 'Purchase and Install Generator System',
      description: 'Purchase generator sized for needs. Install by licensed electrician with transfer switch. Test under full load.',
      estimatedMinutes: 480,
      estimatedCost: '$1800 USD',
      responsibility: 'Owner (hire electrician)',
      resources: JSON.stringify(['Generator (sized appropriately)', 'Licensed electrician', 'Transfer switch', 'Fuel storage']),
      howToKnowItsDone: 'Generator installed by licensed electrician, transfer switch operational, full load test successful'
    },
    
    // POWER RESILIENCE - DURING
    {
      strategyLookup: 'power_resilience_comprehensive',
      stepId: 'power_during_1',
      phase: 'during',
      executionTiming: 'during_crisis',
      sortOrder: 3,
      title: 'Start Generator and Switch to Backup Power',
      description: 'When power fails: Check fuel. Start generator following procedures. Engage transfer switch. Verify equipment running.',
      estimatedMinutes: 30,
      estimatedCost: '$15 USD (fuel)',
      responsibility: 'Any Trained Staff Member',
      resources: JSON.stringify(['Generator with fuel', 'Operating procedure checklist', 'Flashlight']),
      howToKnowItsDone: 'Generator running smoothly, all essential equipment powered, no overload'
    },
    
    // POWER RESILIENCE - AFTER
    {
      strategyLookup: 'power_resilience_comprehensive',
      stepId: 'power_after_1',
      phase: 'after',
      executionTiming: 'after_crisis',
      sortOrder: 4,
      title: 'Switch Back to Grid Power and Perform Maintenance',
      description: 'When grid power restored: Switch back to grid. Allow generator to cool, then shut down properly. Perform maintenance.',
      estimatedMinutes: 80,
      estimatedCost: '$30 USD (oil/filter)',
      responsibility: 'Manager or Maintenance Staff',
      resources: JSON.stringify(['Generator oil', 'Air filter if needed', 'Maintenance tools']),
      howToKnowItsDone: 'Grid power confirmed, generator shut down properly, maintenance completed'
    },
    
    // FIRE PREVENTION - BEFORE
    {
      strategyLookup: 'fire_comprehensive',
      stepId: 'fire_before_1',
      phase: 'before',
      executionTiming: 'before_crisis',
      sortOrder: 1,
      title: 'Install Fire Extinguishers',
      description: 'Purchase ABC-rated fire extinguishers (10lb minimum). Mount at chest height near exits and high-risk areas.',
      estimatedMinutes: 60,
      estimatedCost: '$100 USD',
      responsibility: 'Owner or Maintenance Staff',
      resources: JSON.stringify(['2-3 ABC fire extinguishers (10lb)', 'Wall mounting brackets', 'Drill and screws']),
      howToKnowItsDone: 'Extinguishers mounted securely, pressure gauges in green zone, signage visible'
    },
    {
      strategyLookup: 'fire_comprehensive',
      stepId: 'fire_before_2',
      phase: 'before',
      executionTiming: 'before_crisis',
      sortOrder: 2,
      title: 'Install Smoke Detectors',
      description: 'Install battery-powered smoke alarms in key areas: kitchen, main room, storage. Test each unit.',
      estimatedMinutes: 90,
      estimatedCost: '$50 USD',
      responsibility: 'Owner or Maintenance Staff',
      resources: JSON.stringify(['3-5 smoke detectors with batteries', 'Ladder', 'Drill and mounting hardware']),
      howToKnowItsDone: 'Smoke detectors installed and operational, test button produces loud alarm'
    },
    {
      strategyLookup: 'fire_comprehensive',
      stepId: 'fire_before_3',
      phase: 'before',
      executionTiming: 'before_crisis',
      sortOrder: 3,
      title: 'Conduct Fire Extinguisher Training',
      description: 'Train ALL staff on PASS method: Pull pin, Aim at base, Squeeze handle, Sweep side-to-side.',
      estimatedMinutes: 60,
      estimatedCost: '$0',
      responsibility: 'Owner or Manager (trainer)',
      resources: JSON.stringify(['All staff present', 'Fire extinguisher for demonstration']),
      howToKnowItsDone: 'All staff can recite PASS method and demonstrate correct stance'
    },
    
    // FIRE PREVENTION - DURING
    {
      strategyLookup: 'fire_comprehensive',
      stepId: 'fire_during_1',
      phase: 'during',
      executionTiming: 'during_crisis',
      sortOrder: 4,
      title: 'Assess Fire: Fight or Evacuate',
      description: 'IF fire is small, spreading slowly, clear escape route: FIGHT. If large, spreading fast, thick smoke: EVACUATE immediately.',
      estimatedMinutes: 2,
      estimatedCost: '$0',
      responsibility: 'First Person to Discover Fire',
      resources: JSON.stringify(['Clear judgment', 'Knowledge of evacuation routes']),
      howToKnowItsDone: 'Decision made quickly, appropriate action taken'
    },
    {
      strategyLookup: 'fire_comprehensive',
      stepId: 'fire_during_2',
      phase: 'during',
      executionTiming: 'during_crisis',
      sortOrder: 5,
      title: 'Use Fire Extinguisher IF Safe',
      description: 'ONLY if decided to fight: Grab extinguisher. PASS method. Back toward exit. If fire grows, DROP and RUN.',
      estimatedMinutes: 1,
      estimatedCost: '$0',
      responsibility: 'Trained Staff',
      resources: JSON.stringify(['Fire extinguisher', 'PASS training knowledge']),
      howToKnowItsDone: 'Fire extinguished OR decision to evacuate made quickly'
    },
    {
      strategyLookup: 'fire_comprehensive',
      stepId: 'fire_during_3',
      phase: 'during',
      executionTiming: 'during_crisis',
      sortOrder: 6,
      title: 'Evacuate All People',
      description: 'Shout "FIRE!" Alert all staff/customers. Guide to nearest exit. Account for everyone at meeting point. Call 911.',
      estimatedMinutes: 5,
      estimatedCost: '$0',
      responsibility: 'Manager or Senior Staff',
      resources: JSON.stringify(['Clear evacuation routes', 'Designated meeting point', 'Phone for emergency']),
      howToKnowItsDone: 'All people evacuated safely, emergency services called, no one injured'
    },
    
    // FIRE PREVENTION - AFTER
    {
      strategyLookup: 'fire_comprehensive',
      stepId: 'fire_after_1',
      phase: 'after',
      executionTiming: 'after_crisis',
      sortOrder: 7,
      title: 'Document Fire Damage',
      description: 'After fire department clears building: Take extensive photos of ALL damage - fire, smoke, water. List every damaged item.',
      estimatedMinutes: 120,
      estimatedCost: '$0',
      responsibility: 'Owner',
      resources: JSON.stringify(['Camera or smartphone', 'Notepad for damage inventory', 'Fire department report']),
      howToKnowItsDone: 'Complete photo documentation, written damage inventory, fire report obtained'
    },
    {
      strategyLookup: 'fire_comprehensive',
      stepId: 'fire_after_2',
      phase: 'after',
      executionTiming: 'after_crisis',
      sortOrder: 8,
      title: 'File Insurance Claim and Begin Recovery',
      description: 'Contact insurance immediately with photos, damage list, fire report. Get adjuster visit. Secure building. Plan cleanup.',
      estimatedMinutes: 180,
      estimatedCost: '$0',
      responsibility: 'Owner',
      resources: JSON.stringify(['Insurance policy info', 'All damage documentation', 'Phone/email']),
      howToKnowItsDone: 'Insurance claim filed, claim number received, recovery plan in place'
    },
    
    // COMMUNICATION - BEFORE
    {
      strategyLookup: 'communication_comprehensive',
      stepId: 'comm_before_1',
      phase: 'before',
      executionTiming: 'before_crisis',
      sortOrder: 1,
      title: 'Create Staff Contact List',
      description: 'Collect from each staff: Full name, TWO phone numbers, email, home address, emergency contact. Store in spreadsheet.',
      estimatedMinutes: 45,
      estimatedCost: '$0',
      responsibility: 'Owner or Manager',
      resources: JSON.stringify(['Spreadsheet software', 'Staff cooperation']),
      howToKnowItsDone: 'Complete contact list with 2 phone numbers per person, verified current'
    },
    {
      strategyLookup: 'communication_comprehensive',
      stepId: 'comm_before_2',
      phase: 'before',
      executionTiming: 'before_crisis',
      sortOrder: 2,
      title: 'Set Up WhatsApp Group and Social Media',
      description: 'Create WhatsApp group with all staff. Set up Facebook Business Page and Instagram. Post test message.',
      estimatedMinutes: 60,
      estimatedCost: '$0',
      responsibility: 'Owner or Manager',
      resources: JSON.stringify(['Smartphone with WhatsApp', 'Computer for social media', 'Business information']),
      howToKnowItsDone: 'WhatsApp group active, Facebook and Instagram pages live, test posts successful'
    },
    
    // COMMUNICATION - DURING
    {
      strategyLookup: 'communication_comprehensive',
      stepId: 'comm_during_1',
      phase: 'during',
      executionTiming: 'during_crisis',
      sortOrder: 3,
      title: 'Verify Staff Safety',
      description: 'Message all staff via WhatsApp: "Emergency update. Please reply immediately with your status. Are you safe?"',
      estimatedMinutes: 30,
      estimatedCost: '$0',
      responsibility: 'Owner or Manager',
      resources: JSON.stringify(['Phone with WhatsApp', 'Staff contact list', 'Backup battery']),
      howToKnowItsDone: 'All staff contacted, safety status confirmed for everyone'
    },
    {
      strategyLookup: 'communication_comprehensive',
      stepId: 'comm_during_2',
      phase: 'during',
      executionTiming: 'during_crisis',
      sortOrder: 4,
      title: 'Post Initial Customer Update',
      description: 'Post to social media: "Due to [situation], we are temporarily closed. All staff safe. Daily updates coming. Thank you."',
      estimatedMinutes: 15,
      estimatedCost: '$0',
      responsibility: 'Owner or Manager',
      resources: JSON.stringify(['Phone or computer with internet', 'Social media access']),
      howToKnowItsDone: 'Update posted on all social media channels, visible to customers'
    },
    
    // COMMUNICATION - AFTER
    {
      strategyLookup: 'communication_comprehensive',
      stepId: 'comm_after_1',
      phase: 'after',
      executionTiming: 'after_crisis',
      sortOrder: 5,
      title: 'Send Daily Recovery Updates',
      description: 'Post daily on social media (even if no changes): Day 1: "Assessing damage." Day 2: "Cleanup underway." Day 3: "Reopening [date]."',
      estimatedMinutes: 10,
      estimatedCost: '$0',
      responsibility: 'Owner or Manager',
      resources: JSON.stringify(['Phone with social media access', '5 minutes daily']),
      howToKnowItsDone: 'Daily posts made consistently, customer engagement maintained'
    },
    {
      strategyLookup: 'communication_comprehensive',
      stepId: 'comm_after_2',
      phase: 'after',
      executionTiming: 'after_crisis',
      sortOrder: 6,
      title: 'Announce Reopening Date',
      description: 'Once confirmed, post on ALL channels: "REOPENING [date] at [time]! We\'re back! Thank you for your support."',
      estimatedMinutes: 60,
      estimatedCost: '$0',
      responsibility: 'Owner',
      resources: JSON.stringify(['Social media access', 'Top customer contact list', 'Phone for personal calls']),
      howToKnowItsDone: 'Reopening announced on all channels, top customers contacted personally'
    }
  ]
  
  let created = 0
  let updated = 0
  
  for (const stepTemplate of steps) {
    // Map strategyLookup to actual database ID
    const { strategyLookup, ...step } = stepTemplate
    const strategyId = strategyMap[strategyLookup]
    
    if (!strategyId) {
      console.log(`  ⚠️  Skipped: ${step.title} (strategy '${strategyLookup}' not found)`)
      continue
    }
    
    const stepData = { ...step, strategyId }
    
    const existing = await prisma.actionStep.findFirst({
      where: { stepId: step.stepId }
    })
    
    if (existing) {
      await prisma.actionStep.update({
        where: { id: existing.id },
        data: stepData
      })
      console.log(`  ↻ Updated: ${step.title} (${step.phase})`)
      updated++
    } else {
      await prisma.actionStep.create({ data: stepData })
      console.log(`  ✓ Created: ${step.title} (${step.phase})`)
      created++
    }
  }
  
  console.log('\n' + '─'.repeat(80))
  console.log(`\n✅ Action Steps Summary:`)
  console.log(`   - New steps created: ${created}`)
  console.log(`   - Existing steps updated: ${updated}`)
  console.log(`   - Total steps: ${steps.length}`)
  
  // Count by phase
  const before = steps.filter(s => s.phase === 'before').length
  const during = steps.filter(s => s.phase === 'during').length
  const after = steps.filter(s => s.phase === 'after').length
  
  console.log(`\n📊 Steps by Phase:`)
  console.log(`   - BEFORE: ${before} steps`)
  console.log(`   - DURING: ${during} steps`)
  console.log(`   - AFTER: ${after} steps`)
}

// Run if called directly
if (require.main === module) {
  seedPremiumActionSteps()
    .then(() => {
      console.log('\n🎉 Premium action steps seeded successfully!')
      prisma.$disconnect()
    })
    .catch((e) => {
      console.error('\n❌ Seeding failed:', e)
      prisma.$disconnect()
      process.exit(1)
    })
}

export { seedPremiumActionSteps }


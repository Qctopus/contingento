/**
 * SME-Enhanced Strategy Population Script
 * Populates existing strategies with comprehensive SME-focused content for Caribbean businesses
 * 
 * Usage: npx ts-node scripts/populate-sme-enhanced-strategies.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to safely stringify JSON
const toJSON = (obj: any): string => JSON.stringify(obj)

// Sample data with REAL Caribbean context
const ENHANCED_STRATEGIES = [
  {
    strategyId: 'emergency_contact_list',
    updates: {
      // SME-Focused Content
      smeTitle: "Keep Your Team Connected in Any Emergency",
      smeSummary: "A simple contact list can save your business when disaster strikes. Know who to call, how to reach them, and have backup ways to communicate when phones or internet go down.",
      benefitsBullets: toJSON([
        "Reach your staff quickly when you need to close or reopen",
        "Contact suppliers faster to secure emergency stock",
        "Keep customers informed through WhatsApp or text",
        "Coordinate with family members during crisis"
      ]),
      realWorldExample: "When Hurricane Beryl hit Negril in 2024, Miss Claudette's gift shop was able to reopen in 3 days because she had everyone's contact info saved offline. Her WhatsApp group helped coordinate cleanup, and she called her suppliers in Kingston early to secure stock before others. Meanwhile, shops without contact lists took 2+ weeks to get organized.",
      
      // Implementation Details
      costEstimateJMD: "Free (just need phone/paper)",
      estimatedTotalHours: 2,
      complexityLevel: "simple",
      quickWinIndicator: true,
      
      // Wizard Integration
      defaultSelected: true,
      selectionTier: "essential",
      requiredForRisks: toJSON(['hurricane', 'flood', 'earthquake', 'power_outage']),
      
      // Resource-Limited SME Support
      lowBudgetAlternative: "Write contacts on waterproof paper (laminate at any print shop for JMD 200). Keep one copy at home, one in your cash register.",
      diyApproach: "Use your phone's contact app to create a group called 'Business Emergency'. Add everyone, then screenshot the list. Print it out and keep in your bag.",
      estimatedDIYSavings: "Save JMD 5,000 - no need to buy contact management software",
      
      // BCP Integration
      bcpSectionMapping: "Emergency Contacts",
      bcpTemplateText: "Our emergency contact system includes updated phone numbers, WhatsApp contacts, and email addresses for all staff, key suppliers, and emergency services. We maintain both digital and physical copies, with backup contacts for each person. During emergencies, we use our WhatsApp group 'Business Team' for quick coordination.",
      
      // Personalization
      industryVariants: toJSON({
        retail: "Include supplier contacts for your top 10 products - when emergencies hit, inventory runs out fast",
        food: "Add health inspector and JPS emergency line - food businesses need these for reopening",
        tourism: "Include guest contact list and travel insurance companies - tourists need special care during emergencies",
        services: "Add your accountant and bank manager - you may need emergency financial decisions"
      }),
      businessSizeGuidance: toJSON({
        solo: "Keep it simple - just 10-15 key contacts. Focus on suppliers, landlord, and 2-3 customers who depend on you",
        small: "Create three lists: Team (5-10 people), Suppliers (top 5), Services (JPS, NWC, insurance). Share with your manager",
        medium: "Build a full emergency directory organized by department. Assign someone to update it quarterly"
      })
    },
    actionSteps: [
      {
        stepId: 'step_1',
        updates: {
          whyThisStepMatters: "If you don't have everyone's contact info saved properly, you'll waste precious hours hunting people down when every minute counts",
          whatHappensIfSkipped: "When Hurricane comes, your staff won't know if they should come to work. You can't reach suppliers. Customers think you're closed. You lose business to competitors who got organized faster.",
          estimatedMinutes: 30,
          difficultyLevel: "easy",
          howToKnowItsDone: "You have at least 2 contact methods (phone + WhatsApp or email) for each key person, and you've tested that the numbers actually work",
          exampleOutput: "A simple spreadsheet or phone note with: Name | Role | Mobile | WhatsApp | Email | Backup Contact",
          dependsOnSteps: toJSON([]),
          isOptional: false,
          freeAlternative: "Use Google Contacts (free) or just your phone's contact app - no special software needed",
          lowTechOption: "Write it in a small notebook. Keep one copy at home, one at work. Update with pen when numbers change.",
          commonMistakesForStep: toJSON([
            "Only collecting phone numbers - phones die! Get WhatsApp and email too",
            "Not testing the numbers - 30% of collected numbers are wrong or outdated",
            "Forgetting backup contacts - if someone's phone is off, you need their family number",
            "Not writing down customer contacts - loyal customers want to know when you reopen"
          ]),
          videoTutorialUrl: null,
          externalResourceUrl: "https://www.odpem.org.jm/emergency-preparedness"
        }
      },
      {
        stepId: 'step_2',
        updates: {
          whyThisStepMatters: "During emergencies, internet and cloud services often fail. If your contact list is only on your laptop or in the cloud, you're stuck",
          whatHappensIfSkipped: "The one time you desperately need your contact list, your phone battery will be dead, internet will be down, or your laptop got wet. No contacts = no business.",
          estimatedMinutes: 20,
          difficultyLevel: "easy",
          howToKnowItsDone: "You have the contact list in at least 3 places: your phone, a printout in a plastic bag, and a photo/PDF someone else in your family has",
          exampleOutput: "Printed list laminated or in plastic sleeve, PDF on phone, photo in WhatsApp chat with trusted person",
          dependsOnSteps: toJSON(['step_1']),
          isOptional: false,
          freeAlternative: "Take a photo of your handwritten list. Send to yourself on WhatsApp 'Saved Messages' AND to a family member",
          lowTechOption: "Print or write two copies. Keep one at work, one at home. Laminate for JMD 200 at any print shop to make waterproof.",
          commonMistakesForStep: toJSON([
            "Only keeping digital copy - power outages kill that plan",
            "Not keeping copy at home - if your shop floods, you lose everything there",
            "Using fancy apps that need internet - simple works better in crisis",
            "Never updating the backup copies - they get outdated fast"
          ])
        }
      }
    ]
  },
  
  {
    strategyId: 'basic_insurance_review',
    updates: {
      // SME-Focused Content
      smeTitle: "Protect Your Business Investment with the Right Insurance",
      smeSummary: "Most Caribbean SMEs are underinsured or have the wrong coverage. A simple insurance review can mean the difference between rebuilding or closing forever after a disaster.",
      benefitsBullets: toJSON([
        "Know exactly what's covered before disaster strikes",
        "Avoid paying for coverage you don't actually need",
        "Get claims paid faster with proper documentation",
        "Sleep better knowing you can rebuild if worst happens"
      ]),
      realWorldExample: "Tony's Beach Bar in Ocho Rios learned the hard way - he had 'standard property insurance' but it didn't cover hurricane damage to his outdoor seating (where 60% of customers sat). After Hurricane Ian, insurance paid for the building but nothing else. Cost him JMD 800,000 out-of-pocket. His neighbor Jennifer had reviewed her policy and added business interruption coverage - she got paid for 3 months of lost income while rebuilding.",
      
      costEstimateJMD: "JMD 2,000 for review (or free if you do it yourself)",
      estimatedTotalHours: 3,
      complexityLevel: "moderate",
      quickWinIndicator: false,
      
      defaultSelected: true,
      selectionTier: "essential",
      requiredForRisks: toJSON(['hurricane', 'flood', 'fire', 'earthquake']),
      
      lowBudgetAlternative: "Review it yourself using the checklist below. Call your insurance agent with questions - most will review for free hoping you'll upgrade coverage",
      diyApproach: "Get your policy document. Read it. Write down what's NOT covered. Compare with what could actually destroy your business. Make a list of gaps. Call three insurance companies for quotes to fill the gaps.",
      estimatedDIYSavings: "Save JMD 15,000 - 40,000 per year by dropping unnecessary coverage and adding only what you need",
      
      bcpSectionMapping: "Risk Management & Insurance",
      bcpTemplateText: "We maintain comprehensive business insurance covering property damage, business interruption, and liability. Our policy is reviewed annually to ensure adequate coverage for our current business value and identified risks. We keep both digital and physical copies of insurance documents in our emergency kit, along with photos of all insured property and equipment.",
      
      industryVariants: toJSON({
        retail: "Make sure your coverage includes inventory - most shop insurance doesn't cover stock automatically!",
        food: "You need special coverage for refrigeration breakdown and spoiled food. Standard policies don't cover this",
        tourism: "Get liability insurance for guest injuries - one slip-and-fall can bankrupt you without it",
        services: "Professional liability (errors & omissions) is critical if you give advice or handle money"
      }),
      businessSizeGuidance: toJSON({
        solo: "Minimum: Property + Business Interruption for 3 months expenses. Skip expensive extras like cyber insurance unless you handle credit cards",
        small: "Add employer liability if you have staff. Consider equipment breakdown coverage if you rely on specific machines",
        medium: "Full package: property, interruption, liability, workers comp. Also budget for annual policy review with professional"
      })
    },
    actionSteps: [
      {
        stepId: 'step_1',
        updates: {
          whyThisStepMatters: "You can't remember what you're covered for in an emergency. Having documents ready means claims get processed in weeks instead of months",
          whatHappensIfSkipped: "After disaster, you'll discover major gaps in coverage. By then it's too late - you're paying out of pocket while competitors with good insurance bounce back",
          estimatedMinutes: 45,
          difficultyLevel: "easy",
          howToKnowItsDone: "You have digital photos of: your policy document, every page of coverage details, your agent's contact info, and recent photos of your property/equipment",
          exampleOutput: "Folder on your phone called 'Business Insurance' with photos of all documents, plus a one-page summary you wrote of what's covered and what's not",
          dependsOnSteps: toJSON([]),
          isOptional: false,
          freeAlternative: "Take photos with your phone. Upload to your email so they're in the cloud. Done.",
          lowTechOption: "Make photocopies. Keep one set at home in plastic bag. Give one set to family member you trust.",
          commonMistakesForStep: toJSON([
            "Only keeping paper copy at your business - it burns/floods with everything else",
            "Never reading the full policy - 'I thought I was covered' is not an argument that works",
            "Not photographing your property BEFORE disaster - claims are denied without proof",
            "Losing your agent's contact info - good luck filing claims when you can't reach them"
          ]),
          externalResourceUrl: "https://www.jmmb.com/jm/insurance-tips"
        }
      }
    ]
  },
  
  {
    strategyId: 'backup_power_system',
    updates: {
      smeTitle: "Keep Operating When the Lights Go Out",
      smeSummary: "Power outages are the #1 business disruptor in the Caribbean. Having backup power isn't luxury - it's survival. Even a small battery can keep your essentials running.",
      benefitsBullets: toJSON([
        "Stay open when competitors close during outages",
        "Protect refrigerated goods from spoiling",
        "Keep your POS system and internet router running",
        "Maintain security cameras and alarm systems"
      ]),
      realWorldExample: "Chen's Supermarket in Kingston installed a JMD 80,000 backup system (generator + battery) in 2023. During the frequent brownouts in 2024, while other shops closed, Chen stayed open. He calculates he made an extra JMD 200,000 that year just from being the 'only shop open' during outages. The system paid for itself in 5 months.",
      
      costEstimateJMD: "JMD 35,000 (basic battery backup) - JMD 150,000 (full generator setup)",
      estimatedTotalHours: 8,
      complexityLevel: "moderate",
      quickWinIndicator: false,
      
      defaultSelected: false,
      selectionTier: "recommended",
      requiredForRisks: toJSON(['power_outage', 'hurricane']),
      
      lowBudgetAlternative: "Start with a JMD 15,000 UPS (uninterruptible power supply) from Courts. It won't run refrigerators but will keep your router, POS, and lights running for 2-3 hours. Add one unit every few months as cash allows.",
      diyApproach: "For under JMD 35,000: Buy a car battery + inverter + charger. This DIY setup can power your essential devices. YouTube has tutorials. Get an electrician to set up safely (JMD 10,000 install fee)",
      estimatedDIYSavings: "Save JMD 50,000 - 80,000 vs professional generator installation, but spend JMD 10k on electrician for safety",
      
      bcpSectionMapping: "Business Continuity Resources",
      bcpTemplateText: "Our business maintains a backup power system capable of supporting essential operations during power outages up to 8 hours. The system includes [generator/battery backup/UPS] units that power our point-of-sale system, refrigeration units, internet connectivity, and security cameras. We test the backup system monthly and maintain a service contract with [service provider].",
      
      industryVariants: toJSON({
        retail: "Priority: Cash register/POS + Lights + Internet. You can live without AC but not without making sales",
        food: "MUST HAVE: Refrigeration backup. One 8-hour outage can spoil JMD 50,000 worth of food. Generator is not optional for you",
        tourism: "Guests expect AC and hot water. Budget for hotel-grade backup. Consider it part of your 'brand promise'",
        services: "If your work is computer-based: Decent UPS for each computer station (JMD 12,000 each). Full generator only if you can't send staff home"
      }),
      businessSizeGuidance: toJSON({
        solo: "Start small: One JMD 12,000 UPS to keep your POS and router alive during short outages",
        small: "Mid-range: JMD 80,000 whole-business backup system. Powers essentials for 6-8 hours. Pays for itself first year",
        medium: "Full generator with auto-transfer switch. Budget JMD 200,000 - 350,000. Consider 3-year financing to spread cost"
      })
    },
    actionSteps: [
      {
        stepId: 'step_1',
        updates: {
          whyThisStepMatters: "You need to know EXACTLY how much power you need before buying anything. Most SMEs overbuy (waste money) or underbuy (system doesn't work when needed)",
          whatHappensIfSkipped: "You buy a generator that's too small to run your refrigerators. Or too big, costing 3x what you needed. Either way, money wasted.",
          estimatedMinutes: 60,
          difficultyLevel: "medium",
          howToKnowItsDone: "You have a list of every device you MUST keep running, its wattage, and total watts needed. You know this because you looked at the labels or measured with a watt meter (JMD 2,000 from Courts)",
          exampleOutput: "Simple table: Cash Register 120W, Fridge 800W, 4 LED lights 40W, Router 15W, Security Camera 8W = Total 983W = Need 1500W backup minimum (add 50% safety margin)",
          dependsOnSteps: toJSON([]),
          isOptional: false,
          freeAlternative: "Check wattage on device labels or in manuals. Google '[device name] power consumption' for items without labels. Use calculator on phone to add up.",
          lowTechOption: "Count your essential devices. Fridges use about 800W, lights 10-40W each, routers 15W, computers 200-400W. Add 50% for safety and round up.",
          commonMistakesForStep: toJSON([
            "Forgetting about startup surge - refrigerators need 3x their running wattage to start!",
            "Not planning for future growth - buy 30% bigger than current needs",
            "Including 'nice to have' devices - backup power is for ESSENTIALS only",
            "Confusing watts and VA (volt-amps) - they're different! Use watts for calculations"
          ])
        }
      },
      {
        stepId: 'step_2',
        updates: {
          whyThisStepMatters: "A backup power system is a serious investment. Bad choice = wasted money. Research helps you find reliable options that fit your budget",
          whatHappensIfSkipped: "You buy the first system you see. It breaks in 6 months. Or it's Chinese junk that catches fire. Or you paid 2x market price because you didn't shop around.",
          estimatedMinutes: 120,
          difficultyLevel: "medium",
          howToKnowItsDone: "You've compared at least 3 options (generator, UPS system, or DIY battery setup), gotten written quotes from 2+ suppliers, and checked reviews from other business owners",
          exampleOutput: "Comparison spreadsheet: Option A (generator) JMD 150k, Option B (UPS system) JMD 80k, Option C (DIY) JMD 35k. Listed pros/cons for each. Have quotes in hand.",
          dependsOnSteps: toJSON(['step_1']),
          isOptional: false,
          freeAlternative: "Ask other business owners in your area what they use. Join 'Caribbean SME Business Owners' Facebook group and ask for recommendations. Free advice worth thousands.",
          lowTechOption: "Visit Courts, Megamart, and your local electrician. Ask each: 'Based on my wattage needs (from step 1), what do you recommend?' Compare their answers.",
          commonMistakesForStep: toJSON([
            "Buying based on price alone - cheap generators break constantly",
            "Not checking fuel costs - generator that uses JMD 1,500/day in gas might cost more than power outages",
            "Ignoring noise levels - loud generators annoy neighbors and customers",
            "Not asking about warranty and local service - Chinese brands have no Jamaica support"
          ]),
          videoTutorialUrl: "https://youtube.com/watch?v=power-backup-caribbean",
          externalResourceUrl: "https://www.digicelgroup.com/jm/en/business/power-solutions.html"
        }
      }
    ]
  }
]

async function populateSMEStrategies() {
  console.log('🚀 Starting SME-Enhanced Strategy Population...\n')
  
  let successCount = 0
  let errorCount = 0
  
  for (const strategyData of ENHANCED_STRATEGIES) {
    try {
      console.log(`📝 Processing strategy: ${strategyData.strategyId}`)
      
      // Find the strategy
      const strategy = await prisma.riskMitigationStrategy.findUnique({
        where: { strategyId: strategyData.strategyId },
        include: { actionSteps: true }
      })
      
      if (!strategy) {
        console.log(`  ⚠️  Strategy '${strategyData.strategyId}' not found in database - skipping`)
        errorCount++
        continue
      }
      
      // Update strategy
      await prisma.riskMitigationStrategy.update({
        where: { id: strategy.id },
        data: strategyData.updates
      })
      
      console.log(`  ✅ Updated strategy fields`)
      
      // Update action steps
      if (strategyData.actionSteps) {
        for (const stepData of strategyData.actionSteps) {
          const step = strategy.actionSteps.find(s => s.stepId === stepData.stepId)
          
          if (step) {
            await prisma.actionStep.update({
              where: { id: step.id },
              data: stepData.updates
            })
            console.log(`    ✓ Updated action step: ${stepData.stepId}`)
          } else {
            console.log(`    ⚠️  Action step '${stepData.stepId}' not found - skipping`)
          }
        }
      }
      
      successCount++
      console.log(`  ✅ Completed ${strategyData.strategyId}\n`)
      
    } catch (error) {
      console.error(`  ❌ Error processing ${strategyData.strategyId}:`, error)
      errorCount++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 POPULATION SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully updated: ${successCount} strategies`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`📝 Total processed: ${ENHANCED_STRATEGIES.length}`)
  console.log('='.repeat(60))
  
  if (successCount > 0) {
    console.log('\n🎉 SME-enhanced content has been added to your strategies!')
    console.log('💡 Next steps:')
    console.log('   1. Review strategies in admin interface')
    console.log('   2. Test wizard to see new SME-focused content')
    console.log('   3. Add more strategies using this template\n')
  }
}

// Run the population
populateSMEStrategies()
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



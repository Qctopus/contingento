/**
 * SME-Enhanced Strategy Population Script
 * Populates existing strategies with comprehensive SME-focused content for Caribbean businesses
 * 
 * Usage: node scripts/populate-sme-enhanced-strategies.js
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to safely stringify JSON
const toJSON = (obj) => JSON.stringify(obj)

// Sample data with REAL Caribbean context - mapped to EXISTING strategies in the database
const ENHANCED_STRATEGIES = [
  {
    strategyId: 'hurricane_preparation',
    updates: {
      // SME-Focused Content  
      smeTitle: "Protect Your Business from Hurricane Damage",
      smeSummary: "Hurricane season comes every year in the Caribbean. Being prepared means less damage, faster reopening, and protecting the business you've worked hard to build.",
      benefitsBullets: toJSON([
        "Reduce property damage and inventory loss",
        "Reopen faster than competitors after the storm",
        "Protect expensive equipment and stock",
        "Keep your family and staff safe during the hurricane"
      ]),
      realWorldExample: "When Hurricane Beryl hit Negril in 2024, hardware stores that had shutters and moved stock away from windows were open within days. Those that didn't prepare had weeks of cleanup and thousands in damage. One shop owner said: 'The shutters I bought for JMD 30,000 saved me JMD 200,000 in broken glass and water damage.'",
      
      // Implementation Details
      costEstimateJMD: "JMD 15,000-80,000 (shutters, supplies, securing)",
      estimatedTotalHours: 8,
      complexityLevel: "moderate",
      quickWinIndicator: false,
      
      // Wizard Integration
      defaultSelected: true,
      selectionTier: "essential",
      requiredForRisks: toJSON(["hurricane", "flood", "wind_damage"]),
      
      // Resource-Limited SME Support
      lowBudgetAlternative: "DIY plywood shutters (JMD 5,000-10,000) work almost as well as metal ones. Tape can't stop a hurricane, but plastic sheeting inside windows (JMD 1,500) catches glass if they break.",
      diyApproach: "1) Buy plywood sheets and hinges (JMD 8,000). 2) Cut to fit your windows. 3) Paint with exterior paint (JMD 2,000). 4) Install simple hinges so they fold down when not needed. Total DIY cost: ~JMD 12,000 vs JMD 50,000+ for professional metal shutters.",
      estimatedDIYSavings: "JMD 30,000-40,000 compared to professional installation",
      
      // BCP Document Integration
      bcpSectionMapping: "hurricane_preparedness",
      bcpTemplateText: "Hurricane Preparation Checklist:\n✓ Shutters installed or plywood ready\n✓ Critical equipment moved to safe location\n✓ Inventory documented with photos\n✓ Important documents in waterproof container\n✓ Emergency supplies stocked (water, flashlights, first aid)\n✓ Staff contact list updated",
      
      // Personalization
      industryVariants: toJSON({
        "restaurant": "Protect fridges/freezers, move perishables if power expected out, secure outdoor furniture",
        "retail": "Move expensive merchandise away from windows, document inventory with photos for insurance",
        "tourism": "Secure boats/equipment, board up guest areas, move valuables to storm-safe room",
        "services": "Backup computer equipment, move important files to cloud, secure office furniture"
      }),
      businessSizeGuidance: toJSON({
        "micro": "Focus on protecting your most valuable stock and equipment. DIY solutions OK.",
        "small": "Invest in proper shutters for main areas. Consider hurricane insurance if you can afford it.",
        "medium": "Professional preparation, backup generator, comprehensive insurance coverage"
      }),
      
      // Guidance
      helpfulTips: toJSON([
        "Start preparing 72 hours before expected landfall - don't wait until the last day",
        "Take photos/videos of your shop before the storm for insurance claims",
        "Fill containers with water BEFORE the storm - you'll need it after",
        "Move your vehicle to higher ground if possible - flooding damages cars too"
      ]),
      commonMistakes: toJSON([
        "Taping windows - doesn't work and wastes time. Use shutters or plywood.",
        "Waiting until day before to board up - supplies sell out fast",
        "Not documenting inventory - hard to claim insurance without proof",
        "Leaving heavy items on high shelves - they become projectiles in strong winds",
        "Not testing generator before the storm - too late to fix it after"
      ]),
      successMetrics: toJSON([
        "Windows and doors secured 24 hours before storm",
        "Valuable inventory moved to interior safe zone",
        "Photos of inventory and property condition taken",
        "Emergency supplies (water, food, flashlights) stocked for 3+ days"
      ])
    },
    actionSteps: []
  },
  
  {
    strategyId: 'financial_resilience',
    updates: {
      // SME-Focused Content
      smeTitle: "Build a Financial Safety Net for Your Business",
      smeSummary: "Having emergency money and good financial habits means you can survive when disaster forces you to close temporarily. It's the difference between reopening and closing for good.",
      benefitsBullets: toJSON([
        "Pay rent and utilities when business is closed",
        "Keep key employees from leaving during shutdown",
        "Buy emergency supplies without using personal money",
        "Restart operations faster than competitors"
      ]),
      realWorldExample: "When COVID-19 shut down restaurants in 2020, those with 2-3 months savings kept their premises and reopened strong. A bar owner in Portmore: 'My emergency fund paid 3 months rent. My neighbor had no savings - he lost his lease and his business is gone.'",
      
      // Implementation Details
      costEstimateJMD: "Target: 1-3 months operating expenses",
      estimatedTotalHours: 6,
      complexityLevel: "moderate",
      quickWinIndicator: true,
      
      // Wizard Integration
      defaultSelected: true,
      selectionTier: "essential",
      requiredForRisks: toJSON(["hurricane", "pandemic", "economic_crisis", "all_hazards"]),
      
      // Resource-Limited SME Support
      lowBudgetAlternative: "Start with just JMD 10,000 - even one week of rent is better than nothing. Add JMD 2,000-5,000 per month when you can.",
      diyApproach: "Open a separate savings account (many banks need only JMD 1,000 to start). Every week when you close the till, put 5-10% of profit into this account. Don't touch it except for genuine emergencies.",
      estimatedDIYSavings: "Avoid expensive emergency loans (often 20-30% interest) when crisis hits",
      
      // BCP Document Integration
      bcpSectionMapping: "financial_preparedness",
      bcpTemplateText: "Emergency Fund: JMD [amount]\nMonthly savings target: JMD [amount]\nStored at: [bank name]\nOnly used for: Rent during closures, emergency repairs, critical restocking",
      
      // Personalization
      industryVariants: toJSON({
        "restaurant": "Target 3+ months (covers rent, equipment repairs, restart inventory)",
        "retail": "Target 2 months (covers rent + minimum restock)",
        "tourism": "Target 4 months (accounts for seasonal closures)",
        "services": "Target 2 months (mainly fixed costs)"
      }),
      businessSizeGuidance: toJSON({
        "micro": "JMD 50,000-100,000 (1 month basic expenses)",
        "small": "JMD 200,000-400,000 (2 months operating)",
        "medium": "JMD 800,000-1.5M (3 months full costs)"
      }),
      
      // Guidance
      helpfulTips: toJSON([
        "Start small - JMD 5,000/month adds up to JMD 60,000 in a year",
        "Treat it like a bill you owe yourself - save first, not last",
        "Keep in separate account so you're not tempted to spend it",
        "Review and adjust your target as your business grows"
      ]),
      commonMistakes: toJSON([
        "Setting unrealistic goals and giving up",
        "Keeping emergency cash where you can easily spend it",
        "Using the fund for non-emergencies",
        "Not rebuilding fund after you use it",
        "Storing all cash at business (theft/fire risk)"
      ]),
      successMetrics: toJSON([
        "Fund covers at least 2 weeks of fixed expenses",
        "Making regular monthly deposits",
        "Fund in separate, secure account",
        "Haven't needed emergency loan in past year"
      ])
    },
    actionSteps: []
  },

  {
    strategyId: 'cybersecurity_protection',
    updates: {
      // SME-Focused Content
      smeTitle: "Protect Your Business from Hackers and Data Loss",
      smeSummary: "Your customer list, sales records, and business data are valuable. Scammers want to steal it or lock you out. Simple, free protections keep your business safe.",
      benefitsBullets: toJSON([
        "Protect customer information and business records",
        "Prevent hackers from stealing your money",
        "Avoid ransomware locking you out of your own files",
        "Keep your business reputation safe"
      ]),
      realWorldExample: "A Kingston boutique owner clicked a fake invoice email. Hackers locked all her files and demanded USD 500 to unlock them. She had no backups and lost 2 years of sales records and customer data. Meanwhile, her friend who used strong passwords and cloud backups was never successfully attacked.",
      
      // Implementation Details
      costEstimateJMD: "JMD 0-2,000/month (mostly free tools)",
      estimatedTotalHours: 3,
      complexityLevel: "simple",
      quickWinIndicator: true,
      
      // Wizard Integration
      defaultSelected: true,
      selectionTier: "essential",
      requiredForRisks: toJSON(["cyber_attack", "data_breach", "theft"]),
      
      // Resource-Limited SME Support
      lowBudgetAlternative: "100% free: Use strong passwords, enable 2-factor authentication on banking/email (free), back up to free Google Drive or Dropbox. Total cost: JMD 0.",
      diyApproach: "1) Change all business passwords to strong ones (use a phrase you remember). 2) Turn on 2-step verification for email/banking (takes 5 min). 3) Set up free cloud backup for important files (15 min). 4) Never click links in unexpected emails.",
      estimatedDIYSavings: "Avoid JMD 50,000-500,000 in ransom demands or data recovery costs",
      
      // BCP Document Integration
      bcpSectionMapping: "cybersecurity",
      bcpTemplateText: "Cybersecurity Basics:\n✓ All accounts use strong, unique passwords\n✓ 2-factor authentication enabled on banking/email\n✓ Daily backup to cloud storage\n✓ Antivirus software installed and updated\n✓ Staff trained not to click suspicious links",
      
      // Personalization
      industryVariants: toJSON({
        "restaurant": "Protect POS system, online ordering accounts, customer payment info",
        "retail": "Secure online store, customer database, supplier payment credentials",
        "tourism": "Protect booking system, customer credit card data, website login",
        "services": "Secure client files, email accounts, online banking credentials"
      }),
      businessSizeGuidance: toJSON({
        "micro": "Focus on strong passwords, 2-factor auth, and free cloud backup",
        "small": "Add paid antivirus (JMD 1,500/month) and regular backups",
        "medium": "Consider IT security service (JMD 15,000+/month) and employee training"
      }),
      
      // Guidance
      helpfulTips: toJSON([
        "Use a passphrase you can remember: 'MyShopOpenedInJune2020!' is strong",
        "Enable 2-step verification on ALL accounts that offer it - especially banking",
        "Back up your important files weekly - set a phone reminder",
        "If email looks suspicious, call the person to verify before clicking anything"
      ]),
      commonMistakes: toJSON([
        "Using same password for everything - one breach compromises all accounts",
        "Clicking links in emails without checking sender carefully",
        "No backup - ransomware locks your files with no recovery option",
        "Sharing business passwords via WhatsApp or text (not secure)",
        "Never updating software - old software has security holes"
      ]),
      successMetrics: toJSON([
        "All critical accounts have unique, strong passwords",
        "2-factor authentication enabled on banking and email",
        "Weekly backups running automatically",
        "Can identify and ignore phishing emails"
      ])
    },
    actionSteps: []
  },

  {
    strategyId: 'backup_power',
    updates: {
      smeTitle: "Keep Your Business Running When the Power Goes Out",
      smeSummary: "Power outages are common in the Caribbean - from storms to grid failures. Having backup power means you can keep serving customers, protect perishables, and maintain security when others go dark.",
      benefitsBullets: toJSON([
        "Stay open and making money during power outages",
        "Protect refrigerated inventory from spoiling",
        "Keep security systems and cameras running",
        "Maintain internet and payment processing"
      ]),
      realWorldExample: "A pharmacy in May Pen installed a JMD 180,000 generator in 2023. During a 3-day outage in July, they were the only pharmacy open in the area. They made JMD 450,000 in extra sales while competitors lost inventory to spoilage. The generator paid for itself in one weekend.",
      
      costEstimateJMD: "JMD 50,000-250,000 (depending on solution)",
      estimatedTotalHours: 12,
      complexityLevel: "moderate",
      quickWinIndicator: false,
      
      defaultSelected: false,
      selectionTier: "recommended",
      requiredForRisks: toJSON(["power_outage", "hurricane"]),
      
      lowBudgetAlternative: "Start with a small inverter (JMD 15,000) and car batteries (JMD 10,000 each) to power essentials like cash register, internet router, and a few lights. Total: JMD 35,000-50,000.",
      diyApproach: "Buy an inverter that matches your key equipment wattage. Connect to deep-cycle batteries (car batteries work). Charge batteries when power is on. Switch over manually during outages. Can power lights, router, POS system for 2-4 hours.",
      estimatedDIYSavings: "JMD 100,000-150,000 compared to professional generator installation",
      
      bcpSectionMapping: "power_backup",
      bcpTemplateText: "Backup Power Plan:\n✓ Generator or inverter system installed\n✓ Fuel supply for 72 hours (generators)\n✓ Testing schedule: monthly\n✓ Critical equipment list maintained\n✓ Transfer switch or manual procedure documented",
      
      industryVariants: toJSON({
        "restaurant": "CRITICAL for refrigeration - losing a freezer of meat/fish costs thousands. Generator minimum 5kW for fridge, freezer, lights.",
        "retail": "Important for POS systems and lights during business hours. Small inverter may suffice if no refrigeration.",
        "services": "Need internet and computers running. Inverter + battery can handle office equipment for hours.",
        "tourism": "Essential for guest comfort, security, and reputation. Consider whole-facility backup power."
      }),
      businessSizeGuidance: toJSON({
        "micro": "JMD 35,000-50,000 for inverter + batteries. Powers essentials only.",
        "small": "JMD 80,000-180,000 for small generator. Covers critical operations.",
        "medium": "JMD 200,000+ for proper generator with auto-switch. Full facility backup."
      }),
      
      helpfulTips: toJSON([
        "Calculate your minimum power needs - don't oversize and waste money",
        "Generators need monthly testing - run them for 30 min even if no outage",
        "Store generator fuel safely away from building. Gasoline goes bad after 6 months - add stabilizer",
        "Inverter systems are silent and don't need fuel - better for small businesses"
      ]),
      commonMistakes: toJSON([
        "Buying generator too small - won't run your equipment",
        "Never testing it - finds out it's broken during the emergency",
        "No transfer switch - risking backfeeding and electrocution",
        "Storing generator without fuel/oil - can't use it when needed"
      ]),
      successMetrics: toJSON([
        "Can power essential operations for 8+ hours",
        "Generator tested monthly and starts reliably",
        "Staff trained on safe operation",
        "Fuel supply for 72 hours minimum"
      ])
    },
    actionSteps: []
  },

  {
    strategyId: 'flood_prevention',
    updates: {
      smeTitle: "Stop Flood Water from Destroying Your Business",
      smeSummary: "Flash floods can ruin inventory, damage equipment, and close your business for weeks. Simple flood prevention saves thousands in losses and gets you back in business faster.",
      benefitsBullets: toJSON([
        "Protect inventory and equipment from water damage",
        "Avoid weeks of cleanup and repairs",
        "Maintain business operations during heavy rains",
        "Reduce insurance costs with prevention measures"
      ]),
      realWorldExample: "A small grocery in Old Harbour had flooding every rainy season - losing JMD 80,000-100,000 in damaged stock each time. They spent JMD 45,000 on drainage improvements and raised shelving. Haven't had flood damage in 2 years, saving JMD 160,000+.",
      
      costEstimateJMD: "JMD 15,000-80,000 (drainage and barriers)",
      estimatedTotalHours: 16,
      complexityLevel: "moderate",
      quickWinIndicator: false,
      
      defaultSelected: false,
      selectionTier: "recommended",
      requiredForRisks: toJSON(["flood", "hurricane"]),
      
      lowBudgetAlternative: "DIY sandbags (JMD 5,000 for bags and sand) and raised pallets for inventory (JMD 8,000). Move stock during flood warnings. Total: JMD 15,000-20,000.",
      diyApproach: "1) Clear drainage gutters yourself (free). 2) Build raised platforms from concrete blocks and plywood (JMD 12,000). 3) Fill sandbags during dry season and store them (JMD 5,000). 4) Create emergency stock-moving plan.",
      estimatedDIYSavings: "JMD 40,000-60,000 compared to professional drainage work",
      
      bcpSectionMapping: "flood_preparedness",
      bcpTemplateText: "Flood Prevention:\n✓ Drainage systems clear and functional\n✓ Critical inventory stored above 2ft from ground\n✓ Sandbags/flood barriers staged and ready\n✓ Emergency contact for drainage service\n✓ Insurance policy covers flood damage",
      
      industryVariants: toJSON({
        "restaurant": "Elevate freezers and fridges on blocks. Have plan to move perishables to higher ground quickly.",
        "retail": "Store expensive inventory on upper shelves. Document everything for insurance with photos.",
        "services": "Elevate computers and equipment. Back up data to cloud before storm season.",
        "manufacturing": "Protect machinery and raw materials. May need industrial drainage solutions."
      }),
      businessSizeGuidance: toJSON({
        "micro": "Focus on cheap barriers (sandbags) and raised storage. DIY solutions work well.",
        "small": "Invest in proper drainage. Raised shelving throughout. Sandbag supply on hand.",
        "medium": "Professional drainage assessment. Automated pumps. Comprehensive barrier system."
      }),
      
      helpfulTips: toJSON([
        "Check your drains BEFORE rainy season, not during a storm",
        "Know where water enters your building and focus prevention there first",
        "Take photos of your inventory before flood season for insurance",
        "Have sandbags filled and ready - can't do it once rain starts"
      ]),
      commonMistakes: toJSON([
        "Waiting until it's raining to prepare - too late then",
        "Blocking drains with garbage - makes flooding worse",
        "Leaving inventory on the floor - first thing to get damaged",
        "No insurance or wrong kind - can't recover losses"
      ]),
      successMetrics: toJSON([
        "Critical inventory stored >2ft from ground level",
        "Drainage clear and tested before rainy season",
        "Flood barriers accessible and ready to deploy",
        "Emergency response plan practiced with staff"
      ])
    },
    actionSteps: []
  },

  {
    strategyId: 'supply_chain_diversification',
    updates: {
      smeTitle: "Never Run Out of Stock Because One Supplier Failed",
      smeSummary: "Relying on one supplier is risky - if they have problems, you're out of business. Having backup suppliers means you can keep serving customers no matter what happens.",
      benefitsBullets: toJSON([
        "Stay in business when main supplier has problems",
        "Negotiate better prices with multiple options",
        "Reduce delivery delays and stockouts",
        "Adapt quickly to supply disruptions"
      ]),
      realWorldExample: "A restaurant in Mandeville lost their main chicken supplier during COVID shutdowns. They had no backup and couldn't serve half their menu for a month, losing JMD 300,000 in revenue. Now they have 3 suppliers - when one runs out, they call the next.",
      
      costEstimateJMD: "JMD 2,000-10,000 (relationship building)",
      estimatedTotalHours: 8,
      complexityLevel: "simple",
      quickWinIndicator: true,
      
      defaultSelected: false,
      selectionTier: "recommended",
      requiredForRisks: toJSON(["supply_chain", "pandemic", "economic_crisis"]),
      
      lowBudgetAlternative: "Free - just build relationships! Visit 2-3 alternative suppliers, get their contact info, make small orders to establish accounts. Keep list updated. Cost: JMD 0 plus time.",
      diyApproach: "1) List your top 10 critical supplies. 2) Find 2-3 suppliers for each (Google, ask other businesses). 3) Visit them, get pricing, place test order. 4) Keep spreadsheet with contacts, prices, delivery times. Update quarterly.",
      estimatedDIYSavings: "Free to implement - saves thousands when supply chain breaks",
      
      bcpSectionMapping: "supply_chain",
      bcpTemplateText: "Supply Chain Backup:\n✓ Critical supplies identified (top 10 items)\n✓ 2-3 suppliers per critical item\n✓ Supplier contact list maintained and tested quarterly\n✓ Alternative products identified where possible\n✓ Inventory buffer for critical items",
      
      industryVariants: toJSON({
        "restaurant": "Multiple suppliers for key ingredients. Alternative menu items if supply fails. Local farmers as backup for produce.",
        "retail": "Diversify brands - if you can't get Brand A, you can offer Brand B. Multiple wholesalers in contact list.",
        "services": "Backup suppliers for parts/materials. Alternative vendors for critical services. Local options where possible.",
        "manufacturing": "Multiple suppliers for raw materials. Alternative materials that work. Larger inventory buffer."
      }),
      businessSizeGuidance: toJSON({
        "micro": "Focus on top 3-5 critical items. Simple contact list. Personal relationships work well.",
        "small": "Backup for top 10 items. Formal supplier agreements. Quarterly relationship maintenance.",
        "medium": "Full supply chain mapping. Contracts with multiple tiers. Supply chain manager role."
      }),
      
      helpfulTips: toJSON([
        "Don't wait for emergency - build supplier relationships NOW while you don't need them",
        "Order small amounts from backup suppliers quarterly to keep relationship active",
        "Ask other business owners who they use - word of mouth is best in Caribbean",
        "Keep supplier list with prices - helps you negotiate better deals too"
      ]),
      commonMistakes: toJSON([
        "Only calling backup supplier during emergency - they may not help first-time customers",
        "Not updating supplier list - contacts go stale, people leave, businesses close",
        "Assuming backup supplier has stock - check their reliability before you need them",
        "Burning bridges with old suppliers - you might need them again"
      ]),
      successMetrics: toJSON([
        "2-3 active suppliers for each critical item",
        "Tested backup suppliers in last 6 months",
        "Can source critical items within 48 hours from alternatives",
        "Staff knows backup supplier contacts and procedures"
      ])
    },
    actionSteps: []
  },

  {
    strategyId: 'earthquake_preparedness',
    updates: {
      smeTitle: "Protect Your Business and Staff from Earthquake Damage",
      smeSummary: "Jamaica is in an earthquake zone - a big one could happen any time. Simple preparation can save lives, protect inventory, and get you back in business faster.",
      benefitsBullets: toJSON([
        "Protect staff and customers from injury",
        "Prevent inventory from falling and breaking",
        "Secure expensive equipment from damage",
        "Reopen faster after a quake"
      ]),
      realWorldExample: "After the 2020 earthquake, a shop in Port Antonio had thousands in broken glass and fallen shelves - closed for 2 weeks. Their neighbor who secured shelves to walls reopened next day with minimal damage. JMD 25,000 in securing saved JMD 200,000+ in losses.",
      
      costEstimateJMD: "JMD 8,000-40,000 (securing and supplies)",
      estimatedTotalHours: 6,
      complexityLevel: "simple",
      quickWinIndicator: true,
      
      defaultSelected: false,
      selectionTier: "recommended",
      requiredForRisks: toJSON(["earthquake"]),
      
      lowBudgetAlternative: "DIY securing with basic hardware (JMD 8,000-12,000). Wall brackets for shelves, museum putty for valuables, non-slip mats. Emergency kit with basic supplies (JMD 5,000).",
      diyApproach: "1) Buy L-brackets and screws (JMD 3,000). 2) Secure tall shelves and cabinets to walls (weekend project). 3) Use non-slip shelf liner (JMD 2,000). 4) Move heavy items to low shelves. 5) Assemble emergency kit (flashlight, first aid, water).",
      estimatedDIYSavings: "JMD 20,000-30,000 vs professional securing service",
      
      bcpSectionMapping: "earthquake_preparedness",
      bcpTemplateText: "Earthquake Readiness:\n✓ Heavy furniture secured to walls\n✓ Fragile items stored on low shelves\n✓ Emergency kit (first aid, flashlight, water)\n✓ Staff know drop-cover-hold procedure\n✓ Post-quake inspection checklist ready\n✓ Emergency contact list posted",
      
      industryVariants: toJSON({
        "restaurant": "Secure fridges, freezers, and shelving. Heavy pots on low shelves. Gas shutoff training. Emergency food safety plan.",
        "retail": "Secure display shelves. Fragile items on low shelves. Glass cases anchored. Quick inventory protection plan.",
        "services": "Secure computers and servers. Backup power for data. Document scanning program. Cloud backups essential.",
        "tourism": "Guest safety paramount. Emergency procedures posted. Evacuation plan. First aid kits accessible."
      }),
      businessSizeGuidance: toJSON({
        "micro": "Focus on drop-cover-hold training and basic securing. DIY most work. JMD 10,000-15,000.",
        "small": "Secure all major furniture and equipment. Professional assessment recommended. JMD 25,000-40,000.",
        "medium": "Full structural assessment. Professional securing. Comprehensive emergency plans. JMD 100,000+."
      }),
      
      helpfulTips: toJSON([
        "Secure top-heavy furniture first - biggest danger in earthquake",
        "Practice drop-cover-hold with staff quarterly - must be automatic",
        "Keep shoes near exits - glass everywhere after quake",
        "Have flashlights with batteries ready - power will be out"
      ]),
      commonMistakes: toJSON([
        "Thinking 'it won't happen here' - Jamaica IS earthquake country",
        "Running outside during quake - injuries from falling objects. Drop-cover-hold indoors!",
        "Not securing water heaters and gas lines - can cause fires",
        "No emergency plan - chaos and injuries in the panic"
      ]),
      successMetrics: toJSON([
        "All tall furniture secured to walls",
        "Staff trained on earthquake procedures",
        "Emergency kit stocked and accessible",
        "Post-earthquake inspection plan ready"
      ])
    },
    actionSteps: []
  },

  {
    strategyId: 'fire_detection_suppression',
    updates: {
      smeTitle: "Catch Fires Early Before They Destroy Your Business",
      smeSummary: "Fire can destroy a business in minutes. Early detection and quick suppression can be the difference between minor damage and total loss. Simple systems are affordable and save lives.",
      benefitsBullets: toJSON([
        "Get warned early when fire starts",
        "Stop small fires before they spread",
        "Protect staff and customers from injury",
        "Reduce insurance costs with proper systems"
      ]),
      realWorldExample: "A bakery in Spanish Town had a small electrical fire at 6 AM. Their smoke alarm (JMD 3,000) woke the owner living upstairs. He put it out with a fire extinguisher (JMD 5,000) before it spread. JMD 8,000 in safety equipment saved a JMD 2 million business.",
      
      costEstimateJMD: "JMD 5,000-50,000 (basic to comprehensive)",
      estimatedTotalHours: 4,
      complexityLevel: "simple",
      quickWinIndicator: true,
      
      defaultSelected: false,
      selectionTier: "essential",
      requiredForRisks: toJSON(["fire"]),
      
      lowBudgetAlternative: "Basic smoke alarms (JMD 2,000-3,000 each - need 2-3) plus fire extinguishers (JMD 4,500 each - need 2). Total: JMD 15,000-20,000. Test monthly.",
      diyApproach: "1) Buy smoke alarms for each room (JMD 2,500 each). 2) Install on ceiling away from vents. 3) Buy ABC fire extinguishers (JMD 4,500 each). 4) Mount near exits and kitchen. 5) Train everyone how to use them. 6) Test alarms monthly.",
      estimatedDIYSavings: "DIY is cheapest option - professional monitoring adds JMD 8,000-15,000/year",
      
      bcpSectionMapping: "fire_safety",
      bcpTemplateText: "Fire Safety:\n✓ Smoke alarms in all rooms (tested monthly)\n✓ Fire extinguishers accessible and serviced yearly\n✓ Staff trained on extinguisher use\n✓ Evacuation plan posted and practiced\n✓ Fire department number posted\n✓ Electrical systems inspected annually",
      
      industryVariants: toJSON({
        "restaurant": "CRITICAL - kitchen fires common. Need fire suppression over stoves. Extra extinguishers in kitchen. Monthly hood cleaning.",
        "retail": "Smoke alarms and extinguishers. Watch for electrical overload from displays and AC units.",
        "services": "Focus on electrical fire prevention. Surge protectors. Regular electrical inspection.",
        "manufacturing": "Industry-specific suppression. May need sprinklers. Fire marshal inspection required."
      }),
      businessSizeGuidance: toJSON({
        "micro": "JMD 15,000-20,000 for basic alarms and extinguishers. DIY installation fine.",
        "small": "JMD 30,000-50,000 for comprehensive detection. Consider monitored system.",
        "medium": "JMD 100,000+ for full suppression system with monitoring. Professional installation required."
      }),
      
      helpfulTips: toJSON([
        "Test smoke alarms EVERY MONTH - set phone reminder",
        "Keep extinguishers near exits, not deep inside building",
        "PASS method: Pull pin, Aim low, Squeeze handle, Sweep side to side",
        "If fire is bigger than wastebasket, evacuate and call fire department"
      ]),
      commonMistakes: toJSON([
        "Dead batteries in smoke alarms - test them!",
        "Fire extinguisher never inspected - may not work when needed",
        "No one knows how to use extinguisher - panic in emergency",
        "Blocking fire exits with inventory - traps people inside",
        "Extension cords overloaded - major fire cause in Caribbean businesses"
      ]),
      successMetrics: toJSON([
        "Working smoke alarm in every room",
        "Fire extinguisher within 20ft of any point",
        "All staff trained on fire safety",
        "Monthly testing documented"
      ])
    },
    actionSteps: []
  },

  {
    strategyId: 'health_safety_protocols',
    updates: {
      smeTitle: "Keep Your Business Safe from Health Emergencies",
      smeSummary: "COVID taught us that health emergencies can shut down businesses overnight. Having protocols ready means you can stay open safely and keep customers confident.",
      benefitsBullets: toJSON([
        "Stay open during health crises",
        "Protect staff and customers from illness",
        "Build customer trust with visible safety",
        "Adapt quickly to new health requirements"
      ]),
      realWorldExample: "Restaurants that quickly adapted to COVID protocols (masks, sanitizer, spacing) stayed in business. Those that resisted or were slow lost customers and many closed permanently. One cafe in Kingston invested JMD 30,000 in safety measures and kept 90% of revenue during lockdown.",
      
      costEstimateJMD: "JMD 8,000-30,000 (supplies and setup)",
      estimatedTotalHours: 4,
      complexityLevel: "simple",
      quickWinIndicator: true,
      
      defaultSelected: false,
      selectionTier: "recommended",
      requiredForRisks: toJSON(["pandemic", "health_emergency"]),
      
      lowBudgetAlternative: "Basic hygiene setup: Hand sanitizer dispenser (JMD 3,000), bulk sanitizer refills (JMD 2,000/gallon), soap, simple signage you print yourself. Total: JMD 8,000-12,000.",
      diyApproach: "1) Buy hand sanitizer and dispensers (JMD 5,000). 2) Make signage on computer and print (JMD 500). 3) Create cleaning schedule and assign roles (free). 4) Train staff on protocols (1 hour). 5) Document everything in simple manual.",
      estimatedDIYSavings: "DIY protocols cost JMD 10,000-15,000 vs JMD 50,000+ for consultants",
      
      bcpSectionMapping: "health_safety",
      bcpTemplateText: "Health & Safety Protocols:\n✓ Hand sanitizer at all entry points\n✓ Enhanced cleaning schedule implemented\n✓ Staff health screening procedures\n✓ PPE supplies stocked (masks, gloves)\n✓ Social distancing markers where needed\n✓ Ventilation improvements where possible",
      
      industryVariants: toJSON({
        "restaurant": "Extra focus on food safety, staff hygiene, contactless payments. Kitchen protocols critical.",
        "retail": "Customer-facing protocols, regular surface cleaning, queue management, contactless options.",
        "services": "Client interaction protocols, workspace cleaning, appointment spacing, virtual options.",
        "tourism": "Comprehensive protocols for guest safety, visible cleaning, health declarations, isolation plans."
      }),
      businessSizeGuidance: toJSON({
        "micro": "Basic hygiene setup. Simple protocols. Can adapt quickly. JMD 8,000-15,000.",
        "small": "More comprehensive protocols. Staff training important. JMD 20,000-30,000.",
        "medium": "Full health & safety program. May need dedicated role. Professional assessment. JMD 50,000+."
      }),
      
      helpfulTips: toJSON([
        "Make protocols visible - customers want to SEE you're being safe",
        "Train staff thoroughly - they're your front line",
        "Stay updated on government requirements - they change",
        "Document everything - shows you're serious and protects legally"
      ]),
      commonMistakes: toJSON([
        "Theater instead of real protection - customers notice fake safety",
        "Not training staff - they don't follow protocols they don't understand",
        "Waiting for government mandate - be proactive to keep customer trust",
        "No supplies backup - running out of sanitizer looks terrible",
        "Not communicating protocols - customers don't know what you're doing"
      ]),
      successMetrics: toJSON([
        "Written health protocols in place",
        "All staff trained on procedures",
        "Supplies stocked for 30+ days",
        "Zero health-related customer complaints"
      ])
    },
    actionSteps: []
  },

  {
    strategyId: 'water_conservation',
    updates: {
      smeTitle: "Store Water So You Can Keep Operating During Shortages",
      smeSummary: "Water disruptions happen regularly in parts of Jamaica - from drought to burst mains. Having water stored means you can keep your business running when taps run dry.",
      benefitsBullets: toJSON([
        "Continue operations during water outages",
        "Maintain hygiene and sanitation",
        "Protect staff and customers from disruption",
        "Reduce water bills with efficiency measures"
      ]),
      realWorldExample: "During 2023 water shortage, a restaurant in Portmore with a 500-gallon tank (JMD 45,000) stayed open while competitors closed. They served limited menu but still made JMD 180,000 over 5 days that others lost. Tank paid for itself in one shortage.",
      
      costEstimateJMD: "JMD 12,000-80,000 (storage and efficiency)",
      estimatedTotalHours: 8,
      complexityLevel: "simple",
      quickWinIndicator: false,
      
      defaultSelected: false,
      selectionTier: "optional",
      requiredForRisks: toJSON(["drought", "water_shortage"]),
      
      lowBudgetAlternative: "Large plastic drums (JMD 3,000-5,000 each). Buy 3-5 and keep filled. Add water purification tablets (JMD 1,500). Basic collection system. Total: JMD 15,000-25,000.",
      diyApproach: "1) Buy food-grade plastic drums (JMD 5,000 each x 3 = JMD 15,000). 2) Install where you can fill them easily. 3) Keep filled and covered. 4) Rotate water monthly. 5) Have hand pump or siphon to access (JMD 2,000). Add bleach for long storage.",
      estimatedDIYSavings: "JMD 30,000-50,000 compared to professional tank installation",
      
      bcpSectionMapping: "water_backup",
      bcpTemplateText: "Water Backup Plan:\n✓ Storage capacity for 3+ days operations\n✓ Tanks clean and properly maintained\n✓ Water rotation schedule\n✓ Distribution system for accessing stored water\n✓ Water conservation measures implemented\n✓ Alternative water sources identified",
      
      industryVariants: toJSON({
        "restaurant": "CRITICAL - need water for cooking, cleaning, hygiene. Minimum 300 gallons storage. May need water delivery service backup.",
        "retail": "Important for bathrooms and cleaning. 100-200 gallons sufficient for most.",
        "services": "Focus on drinking water and bathrooms. 50-100 gallons adequate unless water-intensive service.",
        "manufacturing": "Depends on process. May need substantial storage or alternative water source."
      }),
      businessSizeGuidance: toJSON({
        "micro": "JMD 15,000-25,000 for basic drum storage. 100-200 gallons minimum.",
        "small": "JMD 40,000-60,000 for proper tank. 300-500 gallons recommended.",
        "medium": "JMD 100,000+ for large tanks or multiple systems. 1000+ gallons. Professional installation."
      }),
      
      helpfulTips: toJSON([
        "Size storage for 3-5 days minimum operations, not full capacity",
        "Keep tanks covered - mosquitoes breed in open water",
        "Rotate stored water monthly - prevents stagnation and algae",
        "Know water delivery services BEFORE emergency - get their numbers now"
      ]),
      commonMistakes: toJSON([
        "Buying tank but never filling it - useless in emergency",
        "Open containers - mosquito breeding and contamination",
        "No way to access water - need pump or tap on tanks",
        "Letting water sit for months - goes stale and unsafe",
        "Undersizing storage - runs out quickly during shortage"
      ]),
      successMetrics: toJSON([
        "Storage for 3+ days minimum operations",
        "Water rotated regularly and fresh",
        "Staff know how to access stored water",
        "Conservation measures reduce daily usage by 20%"
      ])
    },
    actionSteps: []
  },

  {
    strategyId: 'security_communication_unrest',
    updates: {
      smeTitle: "Keep Your Business Safe During Security Incidents",
      smeSummary: "Civil unrest, protests, or security incidents can happen suddenly. Having a security and communication plan keeps your staff safe and protects your property.",
      benefitsBullets: toJSON([
        "Protect staff during security incidents",
        "Secure property and inventory quickly",
        "Communicate effectively during crisis",
        "Make good decisions under pressure"
      ]),
      realWorldExample: "During 2021 protest activity in Kingston, businesses with quick-close procedures and staff communication plans shut down safely in 15 minutes when others scrambled. One shop that closed quickly had zero damage while neighbor lost JMD 90,000 to broken windows and theft.",
      
      costEstimateJMD: "JMD 10,000-60,000 (security measures)",
      estimatedTotalHours: 6,
      complexityLevel: "moderate",
      quickWinIndicator: false,
      
      defaultSelected: false,
      selectionTier: "optional",
      requiredForRisks: toJSON(["civil_unrest", "security_threat"]),
      
      lowBudgetAlternative: "Free WhatsApp group for staff alerts. Basic security checklist (free to create). Simple grilles for doors/windows (JMD 15,000-25,000). Good locks (JMD 3,000-5,000). Total: JMD 20,000-30,000.",
      diyApproach: "1) Create WhatsApp group with all staff (free). 2) Write quick-close procedure (30 min). 3) Identify safe room in building (free). 4) Install good locks and bars on most vulnerable entry points (JMD 15,000). 5) Practice closing routine monthly.",
      estimatedDIYSavings: "DIY security basics cost JMD 20,000-30,000 vs JMD 100,000+ for full security system",
      
      bcpSectionMapping: "security_response",
      bcpTemplateText: "Security Response Plan:\n✓ Staff communication system (WhatsApp group)\n✓ Quick-close procedure (under 15 minutes)\n✓ Security contacts (police, security company)\n✓ Safe area identified inside building\n✓ Basic security measures (locks, lights, grilles)\n✓ Staff trained on security awareness",
      
      industryVariants: toJSON({
        "restaurant": "Focus on closing kitchen safely (gas off, etc). Secure alcohol inventory. Multiple exits known.",
        "retail": "Protect cash and high-value inventory. Quick procedure to secure and leave. Shutter/grille for storefront.",
        "services": "Secure client data and equipment. Lock and leave procedures. Work-from-home backup plan.",
        "tourism": "Guest safety paramount. Lockdown procedures. Safe room for guests. Security service on speed dial."
      }),
      businessSizeGuidance: toJSON({
        "micro": "Basic locks, communication, procedures. DIY most of it. JMD 15,000-25,000.",
        "small": "Add security bars, better doors, possibly alarm. JMD 40,000-60,000.",
        "medium": "Professional security system, CCTV, security service contract. JMD 150,000+"
      }),
      
      helpfulTips: toJSON([
        "Practice your quick-close procedure - should take under 15 minutes",
        "Don't be a hero - property can be replaced, people can't",
        "Monitor local news and social media for early warnings",
        "Have multiple communication methods - phone lines may be down"
      ]),
      commonMistakes: toJSON([
        "No communication plan - can't reach staff during incident",
        "Never practiced closing - takes too long in emergency",
        "Trying to protect property over personal safety - not worth it",
        "No relationship with police/security - don't know who to call",
        "Keeping too much cash on premises - makes you a target"
      ]),
      successMetrics: toJSON([
        "All staff in communication group",
        "Can secure and evacuate in under 15 minutes",
        "Security measures in place at key entry points",
        "Practiced emergency procedures quarterly"
      ])
    },
    actionSteps: []
  }
]

async function main() {
  console.log('🚀 Starting SME-Enhanced Strategy Population...\n')
  
  let strategiesUpdated = 0
  let actionStepsUpdated = 0
  
  for (const strategyData of ENHANCED_STRATEGIES) {
    try {
      // Find existing strategy
      const existingStrategy = await prisma.riskMitigationStrategy.findUnique({
        where: { strategyId: strategyData.strategyId },
        include: { actionSteps: true }
      })
      
      if (!existingStrategy) {
        console.log(`⚠️  Strategy '${strategyData.strategyId}' not found, skipping...`)
        continue
      }
      
      // Update strategy with new SME-focused fields
      await prisma.riskMitigationStrategy.update({
        where: { strategyId: strategyData.strategyId },
        data: strategyData.updates
      })
      
      strategiesUpdated++
      console.log(`✅ Updated strategy: ${existingStrategy.name}`)
      
      // Update action steps if provided
      if (strategyData.actionSteps && strategyData.actionSteps.length > 0) {
        for (const stepData of strategyData.actionSteps) {
          const existingStep = existingStrategy.actionSteps.find(
            s => s.stepId === stepData.stepId
          )
          
          if (existingStep) {
            await prisma.actionStep.update({
              where: { id: existingStep.id },
              data: stepData.updates
            })
            actionStepsUpdated++
            console.log(`  ✓ Updated action step: ${existingStep.title}`)
          }
        }
      }
      
      console.log() // blank line between strategies
      
    } catch (error) {
      console.error(`❌ Error updating strategy '${strategyData.strategyId}':`, error)
    }
  }
  
  console.log('\n📊 Summary:')
  console.log(`✅ Strategies updated: ${strategiesUpdated}`)
  console.log(`✅ Action steps updated: ${actionStepsUpdated}`)
  console.log('\n🎉 SME-Enhanced strategy population complete!')
  console.log('\n💡 Next steps:')
  console.log('1. Run the wizard and select a business type + location')
  console.log('2. Check that strategies show rich SME content (benefits, examples, tips)')
  console.log('3. Verify action steps show difficulty, time estimates, and alternatives')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())


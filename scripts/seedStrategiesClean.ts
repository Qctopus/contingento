import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * CLEAN Caribbean BCP Strategies - No Fixed Categories or Times!
 * 
 * Key Principles:
 * - NO strategy "type" or "category" (prevention/response/recovery)
 * - NO fixed implementation time
 * - Times and costs are CALCULATED from action steps
 * - One strategy can span BEFORE, DURING, and AFTER phases
 * - Action steps define the actual timing and phasing
 */

const CLEAN_STRATEGIES = [
  {
    strategyId: 'hurricane_comprehensive',
    name: JSON.stringify({
      en: 'Hurricane Protection & Recovery',
      es: 'Protección y Recuperación de Huracanes',
      fr: 'Protection et Récupération contre les Ouragans'
    }),
    description: JSON.stringify({
      en: 'Complete hurricane preparation, crisis response, and recovery procedures for Caribbean businesses',
      es: 'Preparación completa para huracanes, respuesta a crisis y procedimientos de recuperación para negocios caribeños',
      fr: 'Préparation complète aux ouragans, réponse aux crises et procédures de récupération pour les entreprises caribéennes'
    }),
    smeTitle: 'Protect Your Business From Hurricane Damage',
    smeSummary: 'Hurricanes can devastate unprepared businesses. This comprehensive strategy covers everything: installing shutters BEFORE the storm, staying safe DURING it, and recovering quickly AFTER. Action steps guide you through each phase with clear, affordable steps.',
    benefitsBullets: JSON.stringify([
      'Minimize property damage and inventory loss',
      'Keep employees and customers safe',
      'Resume operations faster than competitors',
      'Reduce insurance claims and out-of-pocket costs',
      'Maintain customer trust through preparedness'
    ]),
    realWorldExample: 'After Hurricane Gilbert (1988), Kingston hardware store "Tools Plus" reopened in 3 days. They had storm shutters, moved inventory high, and knew exactly what to do. Competitor across street: 6 weeks closed, lost most customers. The difference? Following all three phases: before, during, after.',
    helpfulTips: JSON.stringify([
      'Start BEFORE phase preparations in June (start of hurricane season)',
      'Review your plan every June and November',
      'Take "before" photos annually for insurance',
      'Keep physical printed checklist (power/internet fail)',
      'Practice your plan - don\'t wait for real hurricane'
    ]),
    commonMistakes: JSON.stringify([
      'Only doing BEFORE steps, ignoring DURING and AFTER',
      'Waiting for hurricane warning to start (too late)',
      'Not documenting damage properly for insurance',
      'Trying to reopen too quickly without safety checks',
      'Forgetting to check on staff wellbeing first'
    ]),
    lowBudgetAlternative: 'Can\'t afford professional shutters? Phase 1: Plywood boards (J$10,000-25,000). Phase 2: One room at a time. Phase 3: DIY sandbags from feed bags. You don\'t need everything at once - build protection over time.',
    applicableRisks: JSON.stringify(['hurricane', 'tropical_storm', 'high_winds', 'flooding']),
    applicableBusinessTypes: null, // All businesses
    selectionTier: 'essential',
    isActive: true
  },

  {
    strategyId: 'backup_power',
    name: JSON.stringify({
      en: 'Backup Power Solutions',
      es: 'Soluciones de Energía de Respaldo',
      fr: 'Solutions d\'Alimentation de Secours'
    }),
    description: JSON.stringify({
      en: 'Generator or battery systems to maintain critical operations during power outages',
      es: 'Sistemas de generador o batería para mantener operaciones críticas durante cortes de energía',
      fr: 'Systèmes de générateur ou de batterie pour maintenir les opérations critiques pendant les pannes de courant'
    }),
    smeTitle: 'Keep Your Business Running When Power Fails',
    smeSummary: 'Power outages can close your business and spoil inventory worth thousands. Backup power keeps refrigerators, lights, and payment systems running. This strategy covers choosing the right system, installing it, maintaining it, and using it effectively.',
    benefitsBullets: JSON.stringify([
      'Prevent refrigerated inventory spoilage',
      'Stay open when competitors are dark',
      'Keep security systems operational',
      'Process customer payments during outages',
      'Protect sensitive electronic equipment'
    ]),
    realWorldExample: 'Spanish Town pharmacy "HealthCare Plus" invested J$280,000 in a backup generator. During 3-day outage (August 2023), they were the ONLY pharmacy open. Sales that month: +340%. Saved inventory: J$150,000. Generator paid for itself in one month.',
    helpfulTips: JSON.stringify([
      'Calculate essentials only - smaller = cheaper to buy and run',
      'Test monthly (30 minutes) - generators fail from sitting idle',
      'Keep 3 days of fuel minimum (gas stations close too)',
      'Train ALL staff to start it (you might not be there)',
      'Check oil every 50 hours of use'
    ]),
    commonMistakes: JSON.stringify([
      'Buying too small - calculate wattage needs first',
      'Never testing it - won\'t start when needed',
      'Running indoors (carbon monoxide kills)',
      'Forgetting fuel expires (rotate every 3 months)',
      'Not having written startup instructions posted'
    ]),
    lowBudgetAlternative: 'Start small: 3kW gasoline generator (J$90,000-120,000) powers ONE fridge, lights, and one till. That\'s enough to stay open. Upgrade later as business grows. Consider sharing a generator with neighboring business.',
    applicableRisks: JSON.stringify(['power_outage', 'hurricane', 'equipment_failure']),
    applicableBusinessTypes: JSON.stringify(['grocery_store', 'pharmacy', 'restaurant', 'medical_clinic', 'bakery']),
    selectionTier: 'recommended',
    isActive: true
  },

  {
    strategyId: 'data_backup',
    name: JSON.stringify({
      en: 'Business Data Protection',
      es: 'Protección de Datos Comerciales',
      fr: 'Protection des Données Commerciales'
    }),
    description: JSON.stringify({
      en: 'Automatic backup of customer records, financial data, and business information',
      es: 'Respaldo automático de registros de clientes, datos financieros e información comercial',
      fr: 'Sauvegarde automatique des dossiers clients, des données financières et des informations commerciales'
    }),
    smeTitle: 'Never Lose Your Business Records',
    smeSummary: 'One fire, flood, or theft can wipe out years of customer records and financial data. Cloud backup (J$2,000-5,000/month) automatically protects everything. If disaster strikes, restore your records from any phone or computer within hours.',
    benefitsBullets: JSON.stringify([
      'Recover from computer failure immediately',
      'Access records from anywhere after disaster',
      'Protect customer contacts and history',
      'Meet legal/tax record requirements',
      'Restore operations in hours not months'
    ]),
    realWorldExample: 'Montego Bay boutique "Island Style" lost everything in 2022 fire - except data. Cloud backup (J$2,500/month) saved all customer contacts, supplier info, and 3 years of sales history. Reopened new location in 3 weeks. Called every regular customer. Lost building, kept business.',
    helpfulTips: JSON.stringify([
      'Set automatic daily backups - don\'t rely on memory',
      'Test restoration quarterly (download and open test file)',
      'Backup point-of-sale database AND settings',
      'Take monthly photos of inventory (insurance proof)',
      'Store at least one backup outside your building'
    ]),
    commonMistakes: JSON.stringify([
      'Only backing up once - need daily automatic',
      'Keeping backup drive IN the building (fire destroys both)',
      'Never testing if backup works (discover too late)',
      'Forgetting to backup POS system database',
      'No password protection on backup'
    ]),
    lowBudgetAlternative: 'FREE: Email important files to yourself weekly. Or use free Google Drive (15GB). Basic: USB drive (J$3,000) copy weekly, store at home. These work! Upgrade to automatic cloud when affordable.',
    applicableRisks: JSON.stringify(['fire', 'flooding', 'theft_vandalism', 'equipment_failure', 'cybersecurity_incident']),
    applicableBusinessTypes: null,
    selectionTier: 'essential',
    isActive: true
  },

  {
    strategyId: 'fire_safety',
    name: JSON.stringify({
      en: 'Fire Prevention & Response',
      es: 'Prevención y Respuesta a Incendios',
      fr: 'Prévention et Intervention Incendie'
    }),
    description: JSON.stringify({
      en: 'Fire extinguishers, smoke detectors, and procedures to prevent and respond to fires',
      es: 'Extintores, detectores de humo y procedimientos para prevenir y responder a incendios',
      fr: 'Extincteurs, détecteurs de fumée et procédures pour prévenir et répondre aux incendies'
    }),
    smeTitle: 'Stop Small Fires Before They Destroy Everything',
    smeSummary: 'Most business fires start small. With J$10,000-20,000 in equipment and 30 minutes of training, you can stop a small fire before it destroys your business. Fire extinguisher installed properly can save J$4 million in losses.',
    benefitsBullets: JSON.stringify([
      'Stop small fires in 30 seconds',
      'Get early warning to evacuate safely',
      'Reduce fire insurance premiums',
      'Meet fire safety regulations',
      'Protect staff and customer lives'
    ]),
    realWorldExample: 'Half Way Tree restaurant "Tasty Bites" had kitchen oil fire (2021). Staff used extinguisher immediately (cost: J$8,500). Fire out in 30 seconds. Damage: J$15,000. Restaurant next door, no extinguisher: completely burned. J$4M loss. Never reopened. 30 seconds made J$4 million difference.',
    helpfulTips: JSON.stringify([
      'Mount extinguisher near EXIT (escape if fire grows)',
      'Mount at chest height (faster to grab)',
      'Test smoke alarms monthly (press button)',
      'Train ALL staff on PASS method (Pull-Aim-Squeeze-Sweep)',
      'Replace extinguishers every 5 years'
    ]),
    commonMistakes: JSON.stringify([
      'Having extinguisher but no one knows how to use it',
      'Putting extinguisher too far from fire risk areas',
      'Not checking pressure gauge monthly (may be empty)',
      'Forgetting smoke alarm battery changes',
      'No clear evacuation route marked'
    ]),
    lowBudgetAlternative: 'Minimum: One 10lb extinguisher near highest risk area (J$6,500) + battery smoke alarms (J$2,000 each). Total: J$10,500 basic protection. Watch free YouTube videos for PASS method training. Add more extinguishers as you can afford.',
    applicableRisks: JSON.stringify(['fire', 'equipment_failure', 'electrical_hazard']),
    applicableBusinessTypes: null,
    selectionTier: 'essential',
    isActive: true
  },

  {
    strategyId: 'flood_protection',
    name: JSON.stringify({
      en: 'Flood Defense Measures',
      es: 'Medidas de Defensa contra Inundaciones',
      fr: 'Mesures de Défense contre les Inondations'
    }),
    description: JSON.stringify({
      en: 'Protect inventory and equipment from flood damage through elevation, barriers, and drainage',
      es: 'Proteger inventario y equipo contra daños por inundación mediante elevación, barreras y drenaje',
      fr: 'Protéger les stocks et équipements contre les dommages causés par les inondations grâce à l\'élévation, aux barrières et au drainage'
    }),
    smeTitle: 'Stop Floodwater From Ruining Your Inventory',
    smeSummary: 'Six inches of water can destroy tens of thousands in inventory. Simple flood protection - raised shelving, sandbags, knowing your risk - can save your business. Most flood damage is preventable with preparation.',
    benefitsBullets: JSON.stringify([
      'Protect ground-level inventory from water',
      'Keep electronics and equipment dry and safe',
      'Reduce cleanup costs and downtime',
      'Lower insurance claims frequency',
      'Reopen same day after minor flooding'
    ]),
    realWorldExample: 'Port Antonio shop "Caribbean Goods" flooded twice (J$200,000 damage each time). Spent J$35,000 on raised shelving + keep 50 sandbags ready. 2023 heavy rains: water came in, stayed below shelves. Zero inventory loss. Swept water out, reopened same day.',
    helpfulTips: JSON.stringify([
      'Ask neighbors: how high did last flood reach?',
      'Raise inventory 12 inches above highest flood mark',
      'Pre-fill sandbags - stack near entrance for fast deployment',
      'Have push broom and squeegee ready for quick water removal',
      'Move expensive items higher when heavy rain forecast'
    ]),
    commonMistakes: JSON.stringify([
      'Waiting until flooding starts (too late to act)',
      'Storing expensive inventory directly on floor',
      'Not knowing where water enters building',
      'Empty sandbags stored away (takes too long to fill)',
      'No plan for rapid inventory elevation'
    ]),
    lowBudgetAlternative: 'DIY: Make sandbags from empty sugar/flour bags (free from bakery) + dirt/sand. Build raised platforms: concrete blocks (J$200 each) + plywood (J$3,500) = 12-inch lift. Total: J$15,000-20,000 vs J$60,000 commercial systems.',
    applicableRisks: JSON.stringify(['flooding', 'hurricane', 'heavy_rain', 'storm_surge']),
    applicableBusinessTypes: JSON.stringify(['grocery_store', 'pharmacy', 'retail', 'warehouse', 'restaurant']),
    selectionTier: 'recommended',
    isActive: true
  },

  {
    strategyId: 'emergency_communication',
    name: JSON.stringify({
      en: 'Emergency Communication Plan',
      es: 'Plan de Comunicación de Emergencia',
      fr: 'Plan de Communication d\'Urgence'
    }),
    description: JSON.stringify({
      en: 'System to contact staff and customers during and after emergencies',
      es: 'Sistema para contactar personal y clientes durante y después de emergencias',
      fr: 'Système pour contacter le personnel et les clients pendant et après les urgences'
    }),
    smeTitle: 'Stay Connected During Emergencies',
    smeSummary: 'When disaster hits, you need to know staff are safe and tell customers when you\'ll reopen. Simple communication plan (WhatsApp group, printed contacts, backup numbers) ensures everyone stays informed. Customers buy from businesses that communicate.',
    benefitsBullets: JSON.stringify([
      'Quickly verify all staff are safe',
      'Inform customers about closure/reopening',
      'Coordinate team response and recovery',
      'Maintain customer relationships during closure',
      'Contact suppliers and service providers'
    ]),
    realWorldExample: 'During COVID lockdowns (2020), May Pen bakery "Fresh Bread Daily" used WhatsApp to update customers daily at 6 AM. Available items, takeaway only. Sales dropped only 30% vs 80% for silent competitors. Customer feedback: "We buy from you because you keep us informed."',
    helpfulTips: JSON.stringify([
      'Test your system quarterly - actually call everyone',
      'Have 2 phone numbers per person (backup contact)',
      'Designate someone to update social media',
      'Keep customer contact list updated',
      'Include suppliers and landlord in plan'
    ]),
    commonMistakes: JSON.stringify([
      'Only one phone number per staff member',
      'No backup if you\'re unavailable',
      'Never updating contact info when staff changes',
      'No customer communication plan (they assume closed)',
      'Not testing until real emergency'
    ]),
    lowBudgetAlternative: 'Completely FREE. Create WhatsApp group (all staff). Print contact list (3 copies: business, home, assistant). Facebook page (free) for customer updates. Phone tree: you call 2, each calls 2 = everyone in 10 minutes. Zero cost, massive benefit.',
    applicableRisks: JSON.stringify(['hurricane', 'health_emergency', 'civil_unrest', 'power_outage', 'flooding']),
    applicableBusinessTypes: null,
    selectionTier: 'essential',
    isActive: true
  }
]

async function seedStrategiesClean() {
  console.log('🛡️  Seeding CLEAN Caribbean BCP strategies (no fixed categories/times)...\n')
  
  let created = 0
  let updated = 0
  
  for (const strategy of CLEAN_STRATEGIES) {
    const existing = await prisma.riskMitigationStrategy.findUnique({
      where: { strategyId: strategy.strategyId }
    })
    
    if (existing) {
      await prisma.riskMitigationStrategy.update({
        where: { strategyId: strategy.strategyId },
        data: strategy
      })
      const nameObj = JSON.parse(strategy.name)
      console.log(`  ↻ Updated: ${nameObj.en}`)
      updated++
    } else {
      await prisma.riskMitigationStrategy.create({ data: strategy })
      const nameObj = JSON.parse(strategy.name)
      console.log(`  ✓ Created: ${nameObj.en}`)
      created++
    }
  }
  
  console.log(`\n✅ Clean Strategies Summary:`)
  console.log(`   - New strategies created: ${created}`)
  console.log(`   - Existing strategies updated: ${updated}`)
  console.log(`   - Total strategies: ${CLEAN_STRATEGIES.length}`)
  console.log(`\n📝 Note: Times and costs will be calculated from action steps!`)
}

// Run if called directly
if (require.main === module) {
  seedStrategiesClean()
    .then(() => {
      console.log('\n🎉 Clean strategies seeded successfully!')
      prisma.$disconnect()
    })
    .catch((e) => {
      console.error('\n❌ Seeding failed:', e)
      prisma.$disconnect()
      process.exit(1)
    })
}

export { seedStrategiesClean, CLEAN_STRATEGIES }










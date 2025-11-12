import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Comprehensive Risk Mitigation Strategies for Caribbean SMEs
 * Multilingual support: English, Spanish, French
 * Focus: Mom-and-pop shops, small businesses, practical and affordable solutions
 */

const COMPREHENSIVE_STRATEGIES = [
  // ============================================================================
  // PREVENTION STRATEGIES (Implement BEFORE crisis)
  // ============================================================================
  
  {
    strategyId: 'hurricane_preparedness',
    name: JSON.stringify({
      en: 'Hurricane Preparedness',
      es: 'Preparación para Huracanes',
      fr: 'Préparation aux Ouragans'
    }),
    description: JSON.stringify({
      en: 'Comprehensive hurricane preparation including property protection, inventory security, and emergency supplies',
      es: 'Preparación integral para huracanes incluyendo protección de propiedad, seguridad de inventario y suministros de emergencia',
      fr: 'Préparation complète aux ouragans incluant protection de la propriété, sécurité des stocks et fournitures d\'urgence'
    }),
    smeTitle: 'Protect Your Business From Hurricane Damage',
    smeSummary: 'Hurricanes can devastate unprepared businesses. Small preparations now—like securing windows and moving inventory—can save you thousands in damages. This strategy guides you through protecting your property before, responding during, and recovering after a hurricane.',
    benefitsBullets: JSON.stringify([
      'Minimize property damage and inventory loss',
      'Keep employees and customers safe',
      'Resume operations faster after the storm',
      'Reduce insurance claims and out-of-pocket costs',
      'Maintain customer trust by being prepared'
    ]),
    realWorldExample: 'After Hurricane Gilbert in 1988, Kingston hardware store "Tools Plus" reopened in 3 days because they had storm shutters installed and moved inventory to high ground. Their competitor across the street took 6 weeks to reopen due to flooding and wind damage, losing most of their customer base.',
    applicableRisks: JSON.stringify(['hurricane', 'tropical_storm', 'high_winds', 'flooding']),
    applicableBusinessTypes: null, // All businesses
    selectionTier: 'essential',
    implementationCost: 'medium',
    costEstimateJMD: 'J$50,000-150,000 (shutters) OR J$10,000-25,000 (plywood option)',
    timeToImplement: 'days',
    complexityLevel: 'moderate',
    effectiveness: 9,
    priority: 'critical',
    quickWinIndicator: false,
    lowBudgetAlternative: 'Can\'t afford storm shutters? Use heavy plywood (3/4 inch) cut to fit your windows. Cost: J$10,000-25,000 vs J$100,000+ for metal shutters. Make sandbags yourself using empty feed bags and sand from hardware store. Move inventory to a friend\'s second floor instead of renting storage.',
    helpfulTips: JSON.stringify([
      'Start preparing 72 hours before predicted landfall',
      'Take photos of your property and inventory BEFORE the storm for insurance',
      'Keep a physical printed checklist - you\'ll lose power and internet',
      'Join your local business association emergency network',
      'Know which windows face prevailing winds - protect those first'
    ]),
    commonMistakes: JSON.stringify([
      'Waiting until the last minute to buy supplies (stores sell out fast)',
      'Assuming insurance covers everything (read your policy NOW)',
      'Forgetting to secure outdoor items like signs and equipment',
      'Not having a communication plan with staff',
      'Leaving important documents in ground-floor offices'
    ]),
    isActive: true
  },

  {
    strategyId: 'backup_power_generator',
    name: JSON.stringify({
      en: 'Backup Power System',
      es: 'Sistema de Energía de Respaldo',
      fr: 'Système d\'Alimentation de Secours'
    }),
    description: JSON.stringify({
      en: 'Generator or battery backup system to maintain operations during power outages',
      es: 'Generador o sistema de batería de respaldo para mantener operaciones durante cortes de energía',
      fr: 'Générateur ou système de batterie de secours pour maintenir les opérations pendant les pannes de courant'
    }),
    smeTitle: 'Keep Your Business Running During Power Outages',
    smeSummary: 'Power outages can force you to close, spoil refrigerated goods, and lose sales. A backup generator keeps your refrigerators, lights, and payment systems running. Even a small generator can save you thousands by preventing spoilage and keeping customers able to shop.',
    benefitsBullets: JSON.stringify([
      'Prevent food/medicine spoilage (save $1,000s)',
      'Keep payment systems and tills working',
      'Stay open when competitors are closed',
      'Protect refrigerated inventory',
      'Maintain security systems during outages'
    ]),
    realWorldExample: 'In August 2023, Spanish Town pharmacy "HealthCare Plus" was the only pharmacy open during a 3-day outage. Their J$280,000 generator paid for itself in one month from customers who couldn\'t get medications elsewhere. They also saved J$150,000 in refrigerated inventory.',
    applicableRisks: JSON.stringify(['power_outage', 'hurricane', 'equipment_failure']),
    applicableBusinessTypes: JSON.stringify(['grocery_store', 'pharmacy', 'restaurant', 'medical_clinic', 'bakery']),
    selectionTier: 'recommended',
    implementationCost: 'high',
    costEstimateJMD: 'J$120,000-500,000 (depending on size)',
    timeToImplement: 'days',
    complexityLevel: 'moderate',
    effectiveness: 9,
    priority: 'high',
    quickWinIndicator: false,
    lowBudgetAlternative: 'Start with a small 3kW gasoline generator (J$90,000-120,000) to power essentials only: one refrigerator, lights, and one till. Upgrade later. Use power strips to make switching easier. Keep 2 jerry cans of fuel on hand (rotate every 3 months).',
    helpfulTips: JSON.stringify([
      'Size your generator for essentials only (cheaper and uses less fuel)',
      'Keep 2-3 days of fuel stored safely',
      'Test your generator monthly (run for 30 minutes)',
      'Have an electrician install a transfer switch (safer)',
      'Post instructions so any staff member can start it'
    ]),
    commonMistakes: JSON.stringify([
      'Buying generator too small - won\'t power what you need',
      'Buying generator too large - waste money on fuel',
      'Not testing it regularly - won\'t start when you need it',
      'Running indoors (carbon monoxide poisoning)',
      'Forgetting to maintain it (change oil every 100 hours)'
    ]),
    isActive: true
  },

  {
    strategyId: 'data_backup_system',
    name: JSON.stringify({
      en: 'Data Backup & Protection',
      es: 'Respaldo y Protección de Datos',
      fr: 'Sauvegarde et Protection des Données'
    }),
    description: JSON.stringify({
      en: 'Regular backup of business data, customer records, and financial information',
      es: 'Respaldo regular de datos comerciales, registros de clientes e información financiera',
      fr: 'Sauvegarde régulière des données commerciales, des dossiers clients et des informations financières'
    }),
    smeTitle: 'Never Lose Your Business Records Again',
    smeSummary: 'One flood, fire, or computer crash can wipe out years of customer records, invoices, and financial data. Simple cloud backup costs less than J$3,000/month and automatically protects everything. If disaster strikes, you can recover your business records from any phone or computer.',
    benefitsBullets: JSON.stringify([
      'Recover from computer failure or theft immediately',
      'Access records from anywhere if building is damaged',
      'Protect customer contacts and sales history',
      'Save accounting records for tax and legal requirements',
      'Restore operations quickly after disaster'
    ]),
    realWorldExample: 'Montego Bay clothing boutique "Island Style" lost everything in a 2022 fire - except their data. Because they used cloud backup (J$2,500/month), they had all customer contacts, supplier info, and 3 years of sales records. They reopened in a new location within 3 weeks and contacted all their regular customers.',
    applicableRisks: JSON.stringify(['fire', 'flooding', 'theft_vandalism', 'equipment_failure', 'cybersecurity_incident']),
    applicableBusinessTypes: null, // All businesses
    selectionTier: 'essential',
    implementationCost: 'low',
    costEstimateJMD: 'J$2,000-5,000/month for cloud backup',
    timeToImplement: 'hours',
    complexityLevel: 'simple',
    effectiveness: 10,
    priority: 'critical',
    quickWinIndicator: true,
    lowBudgetAlternative: 'FREE option: Email important files to yourself weekly (invoices, customer list, inventory). Or use free Google Drive (15GB). Basic backup: Buy USB drive (J$3,000) and copy files weekly, store at home. Upgrade to automatic cloud backup when you can afford it.',
    helpfulTips: JSON.stringify([
      'Set up automatic daily backups - don\'t rely on remembering',
      'Test restoring files quarterly to make sure backup works',
      'Back up point-of-sale system settings and product database',
      'Take monthly photos of inventory for insurance',
      'Keep at least one backup outside your business location'
    ]),
    commonMistakes: JSON.stringify([
      'Only backing up once - need automatic daily backups',
      'Keeping backup drive in same building (fire/flood destroys both)',
      'Never testing if backup actually works',
      'Forgetting to backup POS system and accounting software',
      'Not protecting backup with password'
    ]),
    isActive: true
  },

  {
    strategyId: 'fire_safety_equipment',
    name: JSON.stringify({
      en: 'Fire Safety & Detection',
      es: 'Seguridad y Detección de Incendios',
      fr: 'Sécurité et Détection d\'Incendie'
    }),
    description: JSON.stringify({
      en: 'Fire extinguishers, smoke detectors, and emergency response procedures',
      es: 'Extintores, detectores de humo y procedimientos de respuesta de emergencia',
      fr: 'Extincteurs, détecteurs de fumée et procédures d\'intervention d\'urgence'
    }),
    smeTitle: 'Prevent Small Fires From Destroying Your Business',
    smeSummary: 'Most business fires start small - an electrical short, a kitchen accident, or a cigarette. With J$10,000-20,000 in basic fire equipment and 30 minutes of training, you can stop a small fire before it destroys your business. Fire damage can cost hundreds of thousands or force permanent closure.',
    benefitsBullets: JSON.stringify([
      'Stop small fires before they spread',
      'Get early warning to evacuate safely',
      'Reduce fire insurance premiums',
      'Meet safety regulations',
      'Protect staff and customers from injury'
    ]),
    realWorldExample: 'In 2021, Half Way Tree restaurant "Tasty Bites" had an oil fire in the kitchen. Their staff used the fire extinguisher immediately (cost: J$8,500) and put it out in 30 seconds. Total damage: J$15,000. The restaurant next door without an extinguisher burned completely - J$4 million loss and never reopened.',
    applicableRisks: JSON.stringify(['fire', 'equipment_failure']),
    applicableBusinessTypes: null, // All businesses
    selectionTier: 'essential',
    implementationCost: 'low',
    costEstimateJMD: 'J$10,000-25,000 for basic setup',
    timeToImplement: 'hours',
    complexityLevel: 'simple',
    effectiveness: 9,
    priority: 'critical',
    quickWinIndicator: true,
    lowBudgetAlternative: 'Minimum: One 10lb fire extinguisher near your most fire-prone area (kitchen, electrical panel) - J$6,500. Add battery smoke detectors - J$2,000 each. Total: J$10,500 for basic protection. Watch free YouTube videos to learn how to use extinguisher (PASS method: Pull, Aim, Squeeze, Sweep).',
    helpfulTips: JSON.stringify([
      'Put extinguisher near exit so you can escape if fire grows',
      'Mount at chest height - faster to grab than floor level',
      'Test smoke alarms monthly (press test button)',
      'Replace extinguishers every 5 years',
      'Train ALL staff how to use extinguisher (30 minute session)'
    ]),
    commonMistakes: JSON.stringify([
      'Buying extinguisher but never training staff how to use it',
      'Putting extinguisher too far from likely fire locations',
      'Not checking pressure gauge monthly (may be empty)',
      'Forgetting to replace smoke alarm batteries',
      'Not having clear evacuation route marked'
    ]),
    isActive: true
  },

  {
    strategyId: 'flood_protection',
    name: JSON.stringify({
      en: 'Flood Protection Measures',
      es: 'Medidas de Protección contra Inundaciones',
      fr: 'Mesures de Protection contre les Inondations'
    }),
    description: JSON.stringify({
      en: 'Sandbags, flood barriers, drainage improvements, and inventory elevation',
      es: 'Sacos de arena, barreras contra inundaciones, mejoras de drenaje y elevación de inventario',
      fr: 'Sacs de sable, barrières anti-inondation, améliorations du drainage et élévation des stocks'
    }),
    smeTitle: 'Stop Floodwater From Ruining Your Inventory',
    smeSummary: 'Even 6 inches of water can destroy tens of thousands of dollars in inventory, electronics, and equipment. Simple flood protection—sandbags, raised shelving, and knowing your flood risk—can save your business. Most flood damage is preventable with preparation.',
    benefitsBullets: JSON.stringify([
      'Protect inventory from water damage',
      'Keep electronics and equipment safe',
      'Reduce cleanup costs and downtime',
      'Lower insurance claims',
      'Reopen faster after heavy rain'
    ]),
    realWorldExample: 'Port Antonio shop "Caribbean Goods" is in a flood-prone area. After flooding twice (J$200,000 damage each time), they spent J$35,000 on raised shelving and keep 50 sandbags ready. In 2023 heavy rains, water came in but stayed below shelf level. Zero inventory loss. Shop reopened same day after sweeping water out.',
    applicableRisks: JSON.stringify(['flooding', 'hurricane', 'heavy_rain']),
    applicableBusinessTypes: JSON.stringify(['grocery_store', 'pharmacy', 'retail', 'warehouse']),
    selectionTier: 'recommended',
    implementationCost: 'low',
    costEstimateJMD: 'J$20,000-60,000 for basic protection',
    timeToImplement: 'days',
    complexityLevel: 'simple',
    effectiveness: 8,
    priority: 'high',
    quickWinIndicator: true,
    lowBudgetAlternative: 'DIY Solution: Make your own sandbags using empty sugar/flour bags (free from bakery) filled with dirt/sand. Cost: J$5,000 for 100 bags. Build simple raised platforms using concrete blocks (J$200 each) and plywood sheets (J$3,500) to lift inventory 12 inches off floor. Total: J$15,000-20,000.',
    helpfulTips: JSON.stringify([
      'Know your flood risk - ask neighbors and check with ODPEM',
      'Keep inventory minimum 12 inches above highest previous flood level',
      'Pre-fill sandbags and stack near entrance (deploy in 15 minutes)',
      'Have push broom and squeegee ready for fast water removal',
      'Move expensive items to higher shelves when heavy rain forecast'
    ]),
    commonMistakes: JSON.stringify([
      'Waiting until flooding starts to prepare (too late)',
      'Storing inventory directly on floor in flood-prone areas',
      'Not knowing where water enters your building',
      'Empty sandbags stored away (takes too long to fill during emergency)',
      'No plan for rapid inventory relocation'
    ]),
    isActive: true
  },

  {
    strategyId: 'supplier_diversification',
    name: JSON.stringify({
      en: 'Multiple Supplier Relationships',
      es: 'Relaciones con Múltiples Proveedores',
      fr: 'Relations avec Plusieurs Fournisseurs'
    }),
    description: JSON.stringify({
      en: 'Maintain backup suppliers for critical products to avoid supply chain disruptions',
      es: 'Mantener proveedores de respaldo para productos críticos para evitar interrupciones en la cadena de suministro',
      fr: 'Maintenir des fournisseurs de secours pour les produits critiques afin d\'éviter les ruptures de la chaîne d\'approvisionnement'
    }),
    smeTitle: 'Never Run Out of Stock Due to Supplier Problems',
    smeSummary: 'Relying on one supplier is risky. If they have problems (shipping delays, price increases, going out of business), you can\'t serve customers. Having 2-3 suppliers for your top products costs nothing extra but ensures you can always restock. Lost sales from empty shelves hurt more than finding backup suppliers.',
    benefitsBullets: JSON.stringify([
      'Always have product available even if main supplier fails',
      'Negotiate better prices with supplier competition',
      'Maintain customer trust with consistent stock',
      'Reduce vulnerability to shipping delays',
      'Continue operating when others can\'t get supplies'
    ]),
    realWorldExample: 'Ocho Rios corner shop "Daily Needs" lost their main supplier when that company went bankrupt in 2022. They had no backup - shelves were half-empty for 2 months and lost 40% of customers. Nearby competitor "Corner Store" had 3 suppliers. When one failed, they switched to the others within 2 days. No disruption, gained customers.',
    applicableRisks: JSON.stringify(['supply_disruption', 'economic_downturn', 'transportation_issues']),
    applicableBusinessTypes: JSON.stringify(['grocery_store', 'pharmacy', 'restaurant', 'retail', 'convenience_store']),
    selectionTier: 'recommended',
    implementationCost: 'low',
    costEstimateJMD: 'Free (just time to build relationships)',
    timeToImplement: 'weeks',
    complexityLevel: 'simple',
    effectiveness: 8,
    priority: 'medium',
    quickWinIndicator: true,
    lowBudgetAlternative: 'This IS the budget option! Costs nothing but time. Start with your top 10 products. Find 1-2 alternative suppliers for each (ask other shop owners, check online, visit wholesalers). Keep their contacts in your phone. Order small test quantities to verify quality. Build relationships before you urgently need them.',
    helpfulTips: JSON.stringify([
      'Identify your 10 most critical products (biggest sellers, hardest to replace)',
      'Find at least 2 suppliers for each',
      'Order small amounts from backup suppliers occasionally to maintain relationship',
      'Keep backup supplier contact info where staff can find it',
      'Split orders between suppliers sometimes to keep all relationships active'
    ]),
    commonMistakes: JSON.stringify([
      'Only finding backup supplier after main one fails (panic ordering)',
      'Never ordering from backup suppliers (they won\'t prioritize you)',
      'Not checking backup supplier quality before emergency',
      'Assuming all suppliers have same products and pricing',
      'Not keeping updated contact information'
    ]),
    isActive: true
  },

  {
    strategyId: 'financial_cash_reserve',
    name: JSON.stringify({
      en: 'Emergency Cash Reserve',
      es: 'Reserva de Efectivo de Emergencia',
      fr: 'Réserve de Trésorerie d\'Urgence'
    }),
    description: JSON.stringify({
      en: 'Savings fund to cover expenses during business interruptions',
      es: 'Fondo de ahorro para cubrir gastos durante interrupciones del negocio',
      fr: 'Fonds d\'épargne pour couvrir les dépenses pendant les interruptions d\'activité'
    }),
    smeTitle: 'Have Money Set Aside for Emergencies',
    smeSummary: 'When disaster hits or business is slow, you still need to pay rent, utilities, and staff. Having 1-3 months of expenses saved can mean the difference between surviving tough times and closing permanently. Start small - even J$10,000/month saved adds up to J$120,000 in a year.',
    benefitsBullets: JSON.stringify([
      'Pay bills during closure or slow periods',
      'Make repairs after disaster without debt',
      'Avoid high-interest emergency loans',
      'Keep staff employed during tough times',
      'Restock quickly after disruption'
    ]),
    realWorldExample: 'COVID-19 closed "Sunshine Restaurant" in Negril for 4 months. They had J$600,000 saved (3 months expenses). They paid rent, kept 2 key staff on partial salary, and reopened when allowed. Similar restaurant with no savings closed permanently - couldn\'t afford rent and lost the location.',
    applicableRisks: JSON.stringify(['economic_downturn', 'health_emergency', 'hurricane', 'supply_disruption']),
    applicableBusinessTypes: null, // All businesses
    selectionTier: 'essential',
    implementationCost: 'variable',
    costEstimateJMD: 'Goal: 1-3 months operating expenses',
    timeToImplement: 'months',
    complexityLevel: 'simple',
    effectiveness: 9,
    priority: 'high',
    quickWinIndicator: false,
    lowBudgetAlternative: 'Start tiny: Save J$5,000-10,000 per month. Even J$5,000/month = J$60,000 in a year. Keep in separate bank account you don\'t touch. Auto-transfer on payday so you don\'t forget. Consider partnering with another business owner to create shared emergency fund (collective savings).',
    helpfulTips: JSON.stringify([
      'Calculate your monthly fixed costs (rent, utilities, minimum staff)',
      'Start with goal of 1 month expenses, then build to 3 months',
      'Automate transfers to savings so you don\'t forget',
      'Keep money in separate account - don\'t mix with operating funds',
      'Only use for true emergencies - not for new equipment or renovations'
    ]),
    commonMistakes: JSON.stringify([
      'Keeping emergency money mixed with operating cash (you\'ll spend it)',
      'Setting goal too high initially (then never starting)',
      'Using emergency fund for non-emergencies',
      'Not having clear definition of what counts as "emergency"',
      'Giving up if you have to dip into fund - rebuild it again'
    ]),
    isActive: true
  },

  // ============================================================================
  // RESPONSE STRATEGIES (Execute DURING crisis)
  // ============================================================================

  {
    strategyId: 'emergency_communication_plan',
    name: JSON.stringify({
      en: 'Emergency Communication System',
      es: 'Sistema de Comunicación de Emergencia',
      fr: 'Système de Communication d\'Urgence'
    }),
    description: JSON.stringify({
      en: 'Plan to contact staff, customers, and suppliers during emergencies',
      es: 'Plan para contactar personal, clientes y proveedores durante emergencias',
      fr: 'Plan pour contacter le personnel, les clients et les fournisseurs pendant les urgences'
    }),
    smeTitle: 'Stay Connected With Staff and Customers During Emergencies',
    smeSummary: 'When disaster strikes, you need to check if staff are safe, tell customers when you\'ll reopen, and contact suppliers. A simple communication plan (phone tree, WhatsApp group, backup contacts) ensures everyone stays informed. Customers appreciate knowing your status.',
    benefitsBullets: JSON.stringify([
      'Quickly check if all staff are safe',
      'Inform customers about closure/reopening',
      'Coordinate response and recovery with team',
      'Maintain customer relationships during closure',
      'Contact suppliers and service providers'
    ]),
    realWorldExample: 'During 2020 COVID lockdowns, May Pen bakery "Fresh Bread Daily" used WhatsApp to tell customers they were open for takeaway only. They posted daily at 6 AM with available items. Sales dropped only 30% vs 80% for competitors who went silent. Customers said "We buy from you because you keep us informed."',
    applicableRisks: JSON.stringify(['hurricane', 'health_emergency', 'civil_unrest', 'power_outage']),
    applicableBusinessTypes: null, // All businesses
    selectionTier: 'essential',
    implementationCost: 'low',
    costEstimateJMD: 'Free to J$5,000 (mostly planning)',
    timeToImplement: 'hours',
    complexityLevel: 'simple',
    effectiveness: 8,
    priority: 'high',
    quickWinIndicator: true,
    lowBudgetAlternative: 'FREE solution: Create WhatsApp group with all staff. Make list of staff phone numbers in 3 places: your phone, paper in safe at home, give copy to assistant manager. Create Facebook business page (free) to update customers. Set up phone tree: you call 2 people, each calls 2 more people. Everyone contacted in 10 minutes.',
    helpfulTips: JSON.stringify([
      'Test your system quarterly - actually call everyone',
      'Have backup contact for each person (spouse, parent)',
      'Designate someone to update social media',
      'Keep customer contact list updated',
      'Include suppliers and landlord in communication plan'
    ]),
    commonMistakes: JSON.stringify([
      'Only having one phone number per person',
      'No designated backup if you\'re unavailable',
      'Forgetting to update contact info when staff changes',
      'No plan for customers - they assume you\'re closed permanently',
      'Not testing system until actual emergency'
    ]),
    isActive: true
  },

  {
    strategyId: 'evacuation_safety_procedure',
    name: JSON.stringify({
      en: 'Emergency Evacuation Procedures',
      es: 'Procedimientos de Evacuación de Emergencia',
      fr: 'Procédures d\'Évacuation d\'Urgence'
    }),
    description: JSON.stringify({
      en: 'Clear procedures for safe evacuation during fire, earthquake, or other immediate threats',
      es: 'Procedimientos claros para evacuación segura durante incendios, terremotos u otras amenazas inmediatas',
      fr: 'Procédures claires pour l\'évacuation en toute sécurité pendant un incendie, un tremblement de terre ou d\'autres menaces immédiates'
    }),
    smeTitle: 'Get Everyone Out Safely in an Emergency',
    smeSummary: 'In a fire, earthquake, or other emergency, every second counts. A simple evacuation plan (2 exits, meeting spot outside, someone does head count) can prevent deaths and injuries. It takes 30 minutes to create and practice. Your staff and customers\' lives are worth that time.',
    benefitsBullets: JSON.stringify([
      'Prevent deaths and injuries during emergencies',
      'Reduce panic with clear procedures',
      'Account for everyone quickly',
      'Meet legal safety requirements',
      'Give staff confidence they can handle emergencies'
    ]),
    realWorldExample: 'In 2019, Kingston shop "Downtown Deals" had a gas leak. Their practiced evacuation took 45 seconds - all 8 staff and 12 customers out safely. Shop across the street had no plan when similar leak happened in 2020. Chaos, injuries, one person hospitalized. Fire Department praised first shop, fined second shop J$50,000.',
    applicableRisks: JSON.stringify(['fire', 'earthquake', 'gas_leak', 'civil_unrest', 'building_emergency']),
    applicableBusinessTypes: null, // All businesses
    selectionTier: 'essential',
    implementationCost: 'low',
    costEstimateJMD: 'Free (just planning and training)',
    timeToImplement: 'hours',
    complexityLevel: 'simple',
    effectiveness: 10,
    priority: 'critical',
    quickWinIndicator: true,
    lowBudgetAlternative: 'Completely FREE. 1) Identify 2 exits (front and back). 2) Choose outdoor meeting spot 50 feet away. 3) Assign one person to do head count. 4) Practice twice a year (takes 5 minutes). Print simple diagram and post by door. Optional: Buy glow-in-dark EXIT signs (J$2,000 each).',
    helpfulTips: JSON.stringify([
      'Practice evacuation twice per year (new staff learn)',
      'Time your evacuation - aim for under 2 minutes',
      'Assign specific person to help elderly/disabled customers',
      'Don\'t let anyone go back inside for phones/purses',
      'Post evacuation map near entrance where customers see it'
    ]),
    commonMistakes: JSON.stringify([
      'Planning evacuation but never practicing (staff won\'t remember)',
      'Only one exit (what if it\'s blocked?)',
      'No designated meeting spot (can\'t confirm everyone is out)',
      'Not accounting for customers - only planning for staff',
      'Locking back exit for security (defeats purpose)'
    ]),
    isActive: true
  },

  // ============================================================================
  // RECOVERY STRATEGIES (Execute AFTER crisis)
  // ============================================================================

  {
    strategyId: 'insurance_claims_process',
    name: JSON.stringify({
      en: 'Insurance Claim & Documentation',
      es: 'Reclamo de Seguro y Documentación',
      fr: 'Réclamation d\'Assurance et Documentation'
    }),
    description: JSON.stringify({
      en: 'Systematic process for documenting damage and filing insurance claims',
      es: 'Proceso sistemático para documentar daños y presentar reclamos de seguro',
      fr: 'Processus systématique pour documenter les dommages et déposer des réclamations d\'assurance'
    }),
    smeTitle: 'Get Your Insurance Money Quickly After Damage',
    smeSummary: 'Good documentation and fast action can mean the difference between full insurance payment and denial. Taking photos, making lists, and contacting your agent within 48 hours maximizes your claim. Many businesses lose thousands because they didn\'t document properly or waited too long.',
    benefitsBullets: JSON.stringify([
      'Get maximum insurance payout',
      'Speed up claim processing',
      'Avoid claim denials',
      'Prove value of lost inventory',
      'Get repairs funded faster'
    ]),
    realWorldExample: 'After 2022 flooding, Portmore shop "Style & Grace" got J$850,000 insurance payment in 3 weeks because owner took 200+ photos, had inventory list with receipts, and called agent within 6 hours. Neighbor shop got only J$200,000 (took weeks, no documentation). Both had similar damage. Documentation made J$650,000 difference.',
    applicableRisks: JSON.stringify(['hurricane', 'flooding', 'fire', 'theft_vandalism', 'earthquake']),
    applicableBusinessTypes: null, // All businesses
    selectionTier: 'recommended',
    implementationCost: 'low',
    costEstimateJMD: 'Free (just proper documentation)',
    timeToImplement: 'hours',
    complexityLevel: 'simple',
    effectiveness: 9,
    priority: 'high',
    quickWinIndicator: true,
    lowBudgetAlternative: 'FREE but critical. BEFORE disaster: Take photos of your property monthly, keep receipts for major purchases, know your insurance policy number. AFTER disaster: 1) Photos of everything damaged (200+ photos better than 20). 2) Written list with values. 3) Call agent within 24 hours. 4) Don\'t clean up until adjuster visits.',
    helpfulTips: JSON.stringify([
      'Take BEFORE photos monthly (proves condition before damage)',
      'Keep insurance policy and agent contact in 3 places',
      'Read your policy NOW so you know what\'s covered',
      'Take photos from multiple angles and distances',
      'Save receipts for major inventory and equipment purchases'
    ]),
    commonMistakes: JSON.stringify([
      'Cleaning up before adjuster sees damage (can\'t verify extent)',
      'Not taking enough photos',
      'Waiting days to contact insurance (looks less urgent)',
      'Throwing away damaged items (adjuster needs to see them)',
      'Not knowing what your policy covers (assume wrong)'
    ]),
    isActive: true
  },

  {
    strategyId: 'business_recovery_reopening',
    name: JSON.stringify({
      en: 'Business Recovery & Reopening',
      es: 'Recuperación y Reapertura del Negocio',
      fr: 'Récupération et Réouverture de l\'Entreprise'
    }),
    description: JSON.stringify({
      en: 'Systematic approach to cleaning up, making repairs, restocking, and reopening',
      es: 'Enfoque sistemático para limpiar, hacer reparaciones, reabastecer y reabrir',
      fr: 'Approche systématique pour nettoyer, effectuer des réparations, réapprovisionner et rouvrir'
    }),
    smeTitle: 'Reopen Your Business Quickly After Disaster',
    smeSummary: 'The faster you reopen, the less money you lose and the more customers you keep. Systematic recovery (priorities first, work in phases, communicate progress) gets you back to business in days or weeks instead of months. Every day closed is lost income and customers going elsewhere.',
    benefitsBullets: JSON.stringify([
      'Minimize lost revenue from closure',
      'Retain customers who might switch to competitors',
      'Keep staff employed',
      'Show community your business survived',
      'Start earning money again quickly'
    ]),
    realWorldExample: 'After Hurricane Dean in 2007, Mandeville restaurant "Chicken Palace" reopened in 8 days. They: 1) Fixed roof immediately (tarp first day). 2) Cleaned and sanitized (3 days). 3) Got limited menu items (suppliers prioritized them because they called first). 4) Opened with 50% seating. Full reopening in 3 weeks. Competitors took 6-8 weeks.',
    applicableRisks: JSON.stringify(['hurricane', 'flooding', 'fire', 'equipment_failure']),
    applicableBusinessTypes: null, // All businesses
    selectionTier: 'essential',
    implementationCost: 'variable',
    costEstimateJMD: 'Depends on damage',
    timeToImplement: 'days_to_weeks',
    complexityLevel: 'moderate',
    effectiveness: 9,
    priority: 'critical',
    quickWinIndicator: false,
    lowBudgetAlternative: 'Phase 1 (Safety): Fix critical issues only - roof leaks, electrical hazards, water removal. Phase 2 (Basic Operations): Get minimum equipment working and essential inventory. Phase 3 (Limited Reopening): Open with reduced hours/services while finishing repairs. Full repairs can wait - cash flow from limited operations funds remaining work.',
    helpfulTips: JSON.stringify([
      'Prioritize work that lets you reopen partially',
      'Communicate reopening date on social media as soon as you know',
      'Consider limited hours or reduced services to reopen faster',
      'Contact suppliers immediately - they serve first-callers first',
      'Thank loyal customers publicly when you reopen'
    ]),
    commonMistakes: JSON.stringify([
      'Trying to fix everything before reopening (takes too long)',
      'Not telling customers your reopening plan (they assume you\'re closed)',
      'Waiting for insurance money before starting repairs',
      'Spending too much on non-essential cosmetic repairs initially',
      'Not asking staff to help with cleanup (they want to reopen too)'
    ]),
    isActive: true
  }
]

async function seedComprehensiveStrategies() {
  console.log('🛡️  Seeding comprehensive Caribbean SME strategies...\n')
  
  let created = 0
  let updated = 0
  
  for (const strategy of COMPREHENSIVE_STRATEGIES) {
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
  
  console.log(`\n✅ Strategies Summary:`)
  console.log(`   - New strategies created: ${created}`)
  console.log(`   - Existing strategies updated: ${updated}`)
  console.log(`   - Total strategies: ${COMPREHENSIVE_STRATEGIES.length}`)
}

// Run if called directly
if (require.main === module) {
  seedComprehensiveStrategies()
    .then(() => {
      console.log('\n🎉 Comprehensive strategies seeded successfully!')
      prisma.$disconnect()
    })
    .catch((e) => {
      console.error('\n❌ Seeding failed:', e)
      prisma.$disconnect()
      process.exit(1)
    })
}

export { seedComprehensiveStrategies, COMPREHENSIVE_STRATEGIES }


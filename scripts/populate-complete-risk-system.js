const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ALL 13 RISK TYPES (matching wizard)
const ALL_RISKS = [
  'hurricane', 'earthquake', 'flood', 'drought', 'landslide',
  'fire', 'cyberAttack', 'terrorism', 'pandemicDisease', 'civilUnrest',
  'powerOutage', 'supplyChainDisruption', 'economicDownturn'
]

async function populateCompleteSystem() {
  try {
    console.log('\n🔄 Populating Complete Risk System...\n')

    // 1. POPULATE MULTIPLIERS
    console.log('📊 Creating Multipliers...')
    await populateMultipliers()

    // 2. POPULATE STRATEGIES
    console.log('\n🛡️  Creating Strategies...')
    await populateStrategies()

    console.log('\n✅ Complete Risk System populated successfully!\n')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function populateMultipliers() {
  // Clear existing
  await prisma.riskMultiplier.deleteMany({})

  const multipliers = [
    // LOCATION-BASED MULTIPLIERS
    {
      name: 'Coastal Hurricane Risk',
      description: 'Businesses in coastal areas face higher hurricane risk',
      characteristicType: 'location_coastal',
      conditionType: 'boolean',
      thresholdValue: null,
      minValue: null,
      maxValue: null,
      multiplierFactor: 1.3,
      applicableHazards: JSON.stringify(['hurricane', 'flood']),
      reasoning: 'Coastal locations are directly exposed to hurricanes and storm surge',
      priority: 1,
      isActive: true
    },
    {
      name: 'Urban Infrastructure Dependency',
      description: 'Urban businesses depend on infrastructure that can fail',
      characteristicType: 'location_urban',
      conditionType: 'boolean',
      multiplierFactor: 1.2,
      applicableHazards: JSON.stringify(['powerOutage', 'civilUnrest', 'fire']),
      reasoning: 'Urban areas have infrastructure dependencies and higher population density',
      priority: 2,
      isActive: true
    },
    {
      name: 'Flood-Prone Area',
      description: 'Areas with high flood risk',
      characteristicType: 'location_flood_prone',
      conditionType: 'boolean',
      multiplierFactor: 1.4,
      applicableHazards: JSON.stringify(['flood', 'hurricane']),
      reasoning: 'Known flood-prone areas face severe flood risk',
      priority: 1,
      isActive: true
    },

    // TOURISM-BASED MULTIPLIERS
    {
      name: 'High Tourism Dependency',
      description: 'Businesses heavily dependent on tourism',
      characteristicType: 'tourism_share',
      conditionType: 'threshold',
      thresholdValue: 50,
      multiplierFactor: 1.25,
      applicableHazards: JSON.stringify(['pandemicDisease', 'hurricane', 'civilUnrest', 'economicDownturn']),
      reasoning: 'Tourism-dependent businesses suffer when travel is disrupted',
      priority: 2,
      isActive: true
    },

    // POWER DEPENDENCY MULTIPLIERS
    {
      name: 'Critical Power Dependency',
      description: 'Cannot operate without electricity',
      characteristicType: 'power_dependency',
      conditionType: 'threshold',
      thresholdValue: 80,
      multiplierFactor: 1.5,
      applicableHazards: JSON.stringify(['powerOutage', 'hurricane', 'flood']),
      reasoning: 'Businesses that cannot operate without power face severe disruption',
      priority: 1,
      isActive: true
    },
    {
      name: 'Moderate Power Dependency',
      description: 'Can partially operate without electricity',
      characteristicType: 'power_dependency',
      conditionType: 'range',
      minValue: 40,
      maxValue: 79,
      multiplierFactor: 1.2,
      applicableHazards: JSON.stringify(['powerOutage']),
      reasoning: 'Partial power dependency means reduced operations during outages',
      priority: 3,
      isActive: true
    },

    // DIGITAL DEPENDENCY MULTIPLIERS
    {
      name: 'Essential Digital Systems',
      description: 'Business critically depends on digital systems',
      characteristicType: 'digital_dependency',
      conditionType: 'threshold',
      thresholdValue: 80,
      multiplierFactor: 1.4,
      applicableHazards: JSON.stringify(['cyberAttack', 'powerOutage']),
      reasoning: 'Digital-dependent businesses are vulnerable to cyber and power risks',
      priority: 1,
      isActive: true
    },

    // SUPPLY CHAIN MULTIPLIERS
    {
      name: 'Complex Supply Chain',
      description: 'Complex or international supply chains',
      characteristicType: 'supply_chain_complex',
      conditionType: 'boolean',
      multiplierFactor: 1.3,
      applicableHazards: JSON.stringify(['supplyChainDisruption', 'hurricane', 'pandemicDisease']),
      reasoning: 'Complex supply chains are more vulnerable to disruption',
      priority: 2,
      isActive: true
    },
    {
      name: 'Perishable Goods Handling',
      description: 'Sells or stores perishable goods',
      characteristicType: 'perishable_goods',
      conditionType: 'boolean',
      multiplierFactor: 1.35,
      applicableHazards: JSON.stringify(['powerOutage', 'supplyChainDisruption']),
      reasoning: 'Perishable goods spoil quickly without power or timely delivery',
      priority: 1,
      isActive: true
    },
    {
      name: 'Just-in-Time Inventory',
      description: 'Minimal inventory, order as needed',
      characteristicType: 'just_in_time_inventory',
      conditionType: 'boolean',
      multiplierFactor: 1.25,
      applicableHazards: JSON.stringify(['supplyChainDisruption', 'hurricane']),
      reasoning: 'JIT businesses cannot buffer against supply disruptions',
      priority: 2,
      isActive: true
    },

    // SEASONAL MULTIPLIERS
    {
      name: 'Seasonal Business Pattern',
      description: 'Revenue concentrated in certain seasons',
      characteristicType: 'seasonal_business',
      conditionType: 'boolean',
      multiplierFactor: 1.2,
      applicableHazards: JSON.stringify(['hurricane', 'economicDownturn']),
      reasoning: 'Seasonal businesses cannot recover if peak season is disrupted',
      priority: 3,
      isActive: true
    },

    // PHYSICAL ASSET MULTIPLIERS
    {
      name: 'High-Value Equipment',
      description: 'Expensive equipment that can be damaged',
      characteristicType: 'physical_asset_intensive',
      conditionType: 'boolean',
      multiplierFactor: 1.3,
      applicableHazards: JSON.stringify(['hurricane', 'flood', 'fire', 'earthquake']),
      reasoning: 'Expensive equipment is costly to replace after damage',
      priority: 2,
      isActive: true
    },
    {
      name: 'Building Ownership',
      description: 'Owns the business building',
      characteristicType: 'own_building',
      conditionType: 'boolean',
      multiplierFactor: 1.25,
      applicableHazards: JSON.stringify(['hurricane', 'flood', 'fire', 'earthquake']),
      reasoning: 'Building owners bear full repair costs',
      priority: 3,
      isActive: true
    }
  ]

  for (const mult of multipliers) {
    await prisma.riskMultiplier.create({ data: mult })
    console.log(`  ✅ ${mult.name}`)
  }

  console.log(`\n  Created ${multipliers.length} multipliers`)
}

async function populateStrategies() {
  // Clear existing
  await prisma.riskMitigationStrategy.deleteMany({})
  await prisma.actionStep.deleteMany({})

  const strategies = [
    // ============ HURRICANE STRATEGIES ============
    {
      strategy: {
        strategyId: 'hurricane_preparation',
        name: JSON.stringify({
          en: 'Hurricane Preparedness & Property Protection',
          es: 'Preparación para Huracanes y Protección de Propiedades',
          fr: 'Préparation aux Ouragans et Protection des Propriétés'
        }),
        category: 'prevention',
        description: JSON.stringify({
          en: 'Protect your building and assets before hurricane season',
          es: 'Proteja su edificio y activos antes de la temporada de huracanes',
          fr: 'Protégez votre bâtiment et vos actifs avant la saison des ouragans'
        }),
        implementationCost: 'medium',
        effectiveness: 8,
        applicableRisks: JSON.stringify(['hurricane']),
        applicableBusinessTypes: JSON.stringify(['all']),
        isActive: true
      },
      actionSteps: [
        {
          phase: 'immediate',
          action: 'Install hurricane shutters on all windows',
          smeAction: JSON.stringify({
            en: 'Get metal shutters or plywood boards to cover windows',
            es: 'Instale persianas metálicas o tablas de madera contrachapada para cubrir ventanas',
            fr: 'Installez des volets métalliques ou des planches de contreplaqué pour couvrir les fenêtres'
          }),
          estimatedCost: '$500-$2000',
          timeToComplete: '1-2 weeks',
          sortOrder: 1
        },
        {
          phase: 'immediate',
          action: 'Create emergency supply kit',
          smeAction: JSON.stringify({
            en: 'Stock water, flashlights, batteries, first aid kit, important documents in waterproof bag',
            es: 'Almacene agua, linternas, baterías, botiquín, documentos importantes en bolsa impermeable',
            fr: 'Stockez de l\'eau, des lampes de poche, des piles, une trousse de premiers soins, des documents importants dans un sac étanche'
          }),
          estimatedCost: '$100-$300',
          timeToComplete: '1 day',
          sortOrder: 2
        },
        {
          phase: 'short_term',
          action: 'Secure outdoor equipment and signage',
          smeAction: JSON.stringify({
            en: 'Tie down or bring inside anything that wind can blow away',
            es: 'Asegure o lleve adentro cualquier cosa que el viento pueda volar',
            fr: 'Attachez ou rentrez tout ce que le vent peut emporter'
          }),
          estimatedCost: '$50-$200',
          timeToComplete: '1 week',
          sortOrder: 3
        },
        {
          phase: 'medium_term',
          action: 'Purchase business interruption insurance',
          smeAction: JSON.stringify({
            en: 'Get insurance that pays you while business is closed after hurricane',
            es: 'Obtenga seguro que le pague mientras el negocio esté cerrado después del huracán',
            fr: 'Obtenez une assurance qui vous paie pendant que l\'entreprise est fermée après l\'ouragan'
          }),
          estimatedCost: '$500-$2000/year',
          timeToComplete: '1 month',
          sortOrder: 4
        }
      ]
    },

    // ============ POWER OUTAGE STRATEGIES ============
    {
      strategy: {
        strategyId: 'backup_power',
        name: JSON.stringify({
          en: 'Backup Power & Energy Independence',
          es: 'Energía de Respaldo e Independencia Energética',
          fr: 'Alimentation de Secours et Indépendance Énergétique'
        }),
        category: 'prevention',
        description: JSON.stringify({
          en: 'Ensure business continuity during power outages',
          es: 'Asegurar la continuidad del negocio durante apagones',
          fr: 'Assurer la continuité des activités pendant les pannes de courant'
        }),
        implementationCost: 'high',
        effectiveness: 9,
        applicableRisks: JSON.stringify(['powerOutage']),
        applicableBusinessTypes: JSON.stringify(['all']),
        isActive: true
      },
      actionSteps: [
        {
          phase: 'short_term',
          action: 'Purchase backup generator',
          smeAction: JSON.stringify({
            en: 'Buy generator that can run fridge, lights, and cash register',
            es: 'Compre generador que pueda funcionar con nevera, luces y caja registradora',
            fr: 'Achetez un générateur pouvant alimenter le réfrigérateur, les lumières et la caisse enregistreuse'
          }),
          estimatedCost: '$800-$3000',
          timeToComplete: '2 weeks',
          sortOrder: 1
        },
        {
          phase: 'immediate',
          action: 'Stock fuel for generator',
          smeAction: JSON.stringify({
            en: 'Keep 20-40 gallons of gasoline or diesel in safe containers',
            es: 'Mantenga 20-40 galones de gasolina o diésel en recipientes seguros',
            fr: 'Gardez 20-40 gallons d\'essence ou de diesel dans des conteneurs sécurisés'
          }),
          estimatedCost: '$100-$200',
          timeToComplete: '1 day',
          sortOrder: 2
        },
        {
          phase: 'medium_term',
          action: 'Install solar panels with battery backup',
          smeAction: JSON.stringify({
            en: 'Get solar panels that work even when main power is out',
            es: 'Instale paneles solares que funcionen incluso cuando no haya electricidad principal',
            fr: 'Installez des panneaux solaires qui fonctionnent même lorsque l\'alimentation principale est coupée'
          }),
          estimatedCost: '$5000-$15000',
          timeToComplete: '2-3 months',
          sortOrder: 3
        }
      ]
    },

    // ============ FLOOD STRATEGIES ============
    {
      strategy: {
        strategyId: 'flood_prevention',
        name: JSON.stringify({
          en: 'Flood Prevention & Drainage Management',
          es: 'Prevención de Inundaciones y Gestión de Drenaje',
          fr: 'Prévention des Inondations et Gestion du Drainage'
        }),
        category: 'prevention',
        description: JSON.stringify({
          en: 'Protect premises from flooding and water damage',
          es: 'Proteger locales contra inundaciones y daños por agua',
          fr: 'Protéger les locaux contre les inondations et les dégâts des eaux'
        }),
        implementationCost: 'medium',
        effectiveness: 7,
        applicableRisks: JSON.stringify(['flood']),
        applicableBusinessTypes: JSON.stringify(['all']),
        isActive: true
      },
      actionSteps: [
        {
          phase: 'immediate',
          action: 'Elevate valuable equipment',
          smeAction: JSON.stringify({
            en: 'Put expensive equipment on shelves or platforms at least 2 feet off ground',
            es: 'Coloque equipo costoso en estantes o plataformas al menos 2 pies del suelo',
            fr: 'Placez l\'équipement coûteux sur des étagères ou des plates-formes à au moins 2 pieds du sol'
          }),
          estimatedCost: '$100-$500',
          timeToComplete: '1 week',
          sortOrder: 1
        },
        {
          phase: 'short_term',
          action: 'Install flood barriers at doors',
          smeAction: JSON.stringify({
            en: 'Get sandbags or flood gates to block water from entering doors',
            es: 'Obtenga sacos de arena o compuertas contra inundaciones para bloquear el agua',
            fr: 'Procurez-vous des sacs de sable ou des vannes anti-inondation pour bloquer l\'eau'
          }),
          estimatedCost: '$200-$1000',
          timeToComplete: '2 weeks',
          sortOrder: 2
        },
        {
          phase: 'medium_term',
          action: 'Improve drainage around building',
          smeAction: JSON.stringify({
            en: 'Clear drains, add French drains, slope ground away from building',
            es: 'Limpie drenajes, agregue drenajes franceses, incline el terreno lejos del edificio',
            fr: 'Nettoyez les drains, ajoutez des drains français, inclinez le sol loin du bâtiment'
          }),
          estimatedCost: '$500-$3000',
          timeToComplete: '1-2 months',
          sortOrder: 3
        }
      ]
    },

    // ============ FIRE STRATEGIES ============
    {
      strategy: {
        strategyId: 'fire_detection_suppression',
        name: JSON.stringify({
          en: 'Fire Detection & Suppression Systems',
          es: 'Sistemas de Detección y Supresión de Incendios',
          fr: 'Systèmes de Détection et de Suppression d\'Incendie'
        }),
        category: 'prevention',
        description: JSON.stringify({
          en: 'Early detection and quick response to fire incidents',
          es: 'Detección temprana y respuesta rápida a incidentes de incendio',
          fr: 'Détection précoce et réponse rapide aux incidents d\'incendie'
        }),
        implementationCost: 'medium',
        effectiveness: 9,
        applicableRisks: JSON.stringify(['fire']),
        applicableBusinessTypes: JSON.stringify(['all']),
        isActive: true
      },
      actionSteps: [
        {
          phase: 'immediate',
          action: 'Install smoke detectors',
          smeAction: JSON.stringify({
            en: 'Put smoke alarms in every room, test monthly, change batteries yearly',
            es: 'Instale alarmas de humo en cada habitación, pruebe mensualmente, cambie baterías anualmente',
            fr: 'Installez des détecteurs de fumée dans chaque pièce, testez mensuellement, changez les piles annuellement'
          }),
          estimatedCost: '$100-$300',
          timeToComplete: '1 day',
          sortOrder: 1
        },
        {
          phase: 'immediate',
          action: 'Purchase fire extinguishers',
          smeAction: JSON.stringify({
            en: 'Get ABC fire extinguishers, mount near exits and kitchen, train staff to use',
            es: 'Obtenga extintores ABC, monte cerca de salidas y cocina, capacite al personal',
            fr: 'Procurez-vous des extincteurs ABC, montez près des sorties et de la cuisine, formez le personnel'
          }),
          estimatedCost: '$50-$200',
          timeToComplete: '1 week',
          sortOrder: 2
        },
        {
          phase: 'short_term',
          action: 'Create fire evacuation plan',
          smeAction: JSON.stringify({
            en: 'Mark two exits from each room, practice evacuation drill monthly',
            es: 'Marque dos salidas de cada habitación, practique simulacro de evacuación mensualmente',
            fr: 'Marquez deux sorties de chaque pièce, pratiquez des exercices d\'évacuation mensuellement'
          }),
          estimatedCost: '$0-$50',
          timeToComplete: '1 week',
          sortOrder: 3
        },
        {
          phase: 'medium_term',
          action: 'Install sprinkler system',
          smeAction: JSON.stringify({
            en: 'Install automatic water sprinklers that activate when they sense heat',
            es: 'Instale rociadores automáticos de agua que se activen al detectar calor',
            fr: 'Installez des gicleurs automatiques qui s\'activent lorsqu\'ils détectent de la chaleur'
          }),
          estimatedCost: '$2000-$10000',
          timeToComplete: '2-3 months',
          sortOrder: 4
        }
      ]
    },

    // ============ CYBER ATTACK STRATEGIES ============
    {
      strategy: {
        strategyId: 'cybersecurity_protection',
        name: JSON.stringify({
          en: 'Cybersecurity & Data Protection',
          es: 'Ciberseguridad y Protección de Datos',
          fr: 'Cybersécurité et Protection des Données'
        }),
        category: 'prevention',
        description: JSON.stringify({
          en: 'Protect digital systems and customer data from cyber threats',
          es: 'Proteger sistemas digitales y datos de clientes contra amenazas cibernéticas',
          fr: 'Protéger les systèmes numériques et les données clients contre les cybermenaces'
        }),
        implementationCost: 'low',
        effectiveness: 8,
        applicableRisks: JSON.stringify(['cyberAttack']),
        applicableBusinessTypes: JSON.stringify(['all']),
        isActive: true
      },
      actionSteps: [
        {
          phase: 'immediate',
          action: 'Install antivirus software',
          smeAction: JSON.stringify({
            en: 'Buy antivirus software for all computers, keep it updated automatically',
            es: 'Compre software antivirus para todas las computadoras, manténgalo actualizado automáticamente',
            fr: 'Achetez un logiciel antivirus pour tous les ordinateurs, maintenez-le à jour automatiquement'
          }),
          estimatedCost: '$50-$200/year',
          timeToComplete: '1 day',
          sortOrder: 1
        },
        {
          phase: 'immediate',
          action: 'Use strong passwords',
          smeAction: JSON.stringify({
            en: 'Create passwords with 12+ characters, mix of letters, numbers, symbols. Use password manager.',
            es: 'Cree contraseñas con más de 12 caracteres, mezcla de letras, números, símbolos. Use gestor de contraseñas.',
            fr: 'Créez des mots de passe de plus de 12 caractères, mélange de lettres, chiffres, symboles. Utilisez un gestionnaire de mots de passe.'
          }),
          estimatedCost: '$0-$50/year',
          timeToComplete: '1 day',
          sortOrder: 2
        },
        {
          phase: 'short_term',
          action: 'Backup data regularly',
          smeAction: JSON.stringify({
            en: 'Copy all important files to external hard drive or cloud weekly',
            es: 'Copie todos los archivos importantes a disco duro externo o nube semanalmente',
            fr: 'Copiez tous les fichiers importants sur disque dur externe ou cloud chaque semaine'
          }),
          estimatedCost: '$100-$300',
          timeToComplete: '1 week',
          sortOrder: 3
        },
        {
          phase: 'short_term',
          action: 'Train staff on email security',
          smeAction: JSON.stringify({
            en: 'Teach staff not to click links in suspicious emails, verify requests for money',
            es: 'Enseñe al personal a no hacer clic en enlaces en correos sospechosos, verificar solicitudes de dinero',
            fr: 'Apprenez au personnel à ne pas cliquer sur les liens dans les e-mails suspects, vérifiez les demandes d\'argent'
          }),
          estimatedCost: '$0-$100',
          timeToComplete: '1 week',
          sortOrder: 4
        }
      ]
    },

    // ============ SUPPLY CHAIN DISRUPTION STRATEGIES ============
    {
      strategy: {
        strategyId: 'supply_chain_diversification',
        name: JSON.stringify({
          en: 'Supply Chain Diversification',
          es: 'Diversificación de Cadena de Suministro',
          fr: 'Diversification de la Chaîne d\'Approvisionnement'
        }),
        category: 'prevention',
        description: JSON.stringify({
          en: 'Reduce dependency on single suppliers and maintain buffer stock',
          es: 'Reducir dependencia de proveedores únicos y mantener inventario de reserva',
          fr: 'Réduire la dépendance aux fournisseurs uniques et maintenir un stock tampon'
        }),
        implementationCost: 'medium',
        effectiveness: 7,
        applicableRisks: JSON.stringify(['supplyChainDisruption']),
        applicableBusinessTypes: JSON.stringify(['retail', 'hospitality', 'manufacturing']),
        isActive: true
      },
      actionSteps: [
        {
          phase: 'short_term',
          action: 'Identify backup suppliers',
          smeAction: JSON.stringify({
            en: 'Find 2-3 backup suppliers for critical items, get their contact info and prices',
            es: 'Encuentre 2-3 proveedores de respaldo para artículos críticos, obtenga su información de contacto y precios',
            fr: 'Trouvez 2-3 fournisseurs de secours pour les articles critiques, obtenez leurs coordonnées et leurs prix'
          }),
          estimatedCost: '$0-$50',
          timeToComplete: '2 weeks',
          sortOrder: 1
        },
        {
          phase: 'short_term',
          action: 'Increase safety stock',
          smeAction: JSON.stringify({
            en: 'Keep extra inventory of items that are hard to get or critical for business',
            es: 'Mantenga inventario extra de artículos difíciles de conseguir o críticos para el negocio',
            fr: 'Conservez un inventaire supplémentaire d\'articles difficiles à obtenir ou critiques pour l\'entreprise'
          }),
          estimatedCost: '$500-$5000',
          timeToComplete: '1 month',
          sortOrder: 2
        },
        {
          phase: 'medium_term',
          action: 'Build local supplier relationships',
          smeAction: JSON.stringify({
            en: 'Find local suppliers who can provide items faster during emergencies',
            es: 'Encuentre proveedores locales que puedan proporcionar artículos más rápido durante emergencias',
            fr: 'Trouvez des fournisseurs locaux qui peuvent fournir des articles plus rapidement en cas d\'urgence'
          }),
          estimatedCost: '$0-$100',
          timeToComplete: '2-3 months',
          sortOrder: 3
        }
      ]
    },

    // ============ PANDEMIC STRATEGIES ============
    {
      strategy: {
        strategyId: 'health_safety_protocols',
        name: JSON.stringify({
          en: 'Health & Safety Protocols',
          es: 'Protocolos de Salud y Seguridad',
          fr: 'Protocoles de Santé et Sécurité'
        }),
        category: 'prevention',
        description: JSON.stringify({
          en: 'Implement health measures to protect staff and customers during disease outbreaks',
          es: 'Implementar medidas de salud para proteger personal y clientes durante brotes de enfermedades',
          fr: 'Mettre en œuvre des mesures de santé pour protéger le personnel et les clients lors d\'épidémies'
        }),
        implementationCost: 'low',
        effectiveness: 7,
        applicableRisks: JSON.stringify(['pandemicDisease']),
        applicableBusinessTypes: JSON.stringify(['all']),
        isActive: true
      },
      actionSteps: [
        {
          phase: 'immediate',
          action: 'Stock health supplies',
          smeAction: JSON.stringify({
            en: 'Buy masks, hand sanitizer, disinfectant spray, thermometer',
            es: 'Compre máscaras, desinfectante de manos, spray desinfectante, termómetro',
            fr: 'Achetez des masques, du désinfectant pour les mains, un spray désinfectant, un thermomètre'
          }),
          estimatedCost: '$100-$500',
          timeToComplete: '1 week',
          sortOrder: 1
        },
        {
          phase: 'short_term',
          action: 'Create sick leave policy',
          smeAction: JSON.stringify({
            en: 'Tell staff to stay home when sick, don\'t penalize them for illness',
            es: 'Diga al personal que se quede en casa cuando esté enfermo, no los penalice por enfermedad',
            fr: 'Dites au personnel de rester à la maison lorsqu\'il est malade, ne les pénalisez pas pour maladie'
          }),
          estimatedCost: '$0',
          timeToComplete: '1 week',
          sortOrder: 2
        },
        {
          phase: 'short_term',
          action: 'Implement social distancing measures',
          smeAction: JSON.stringify({
            en: 'Space out tables, mark floors for 6-foot distance, limit number of customers',
            es: 'Espacie las mesas, marque pisos para distancia de 6 pies, limite el número de clientes',
            fr: 'Espacez les tables, marquez les sols pour une distance de 6 pieds, limitez le nombre de clients'
          }),
          estimatedCost: '$50-$300',
          timeToComplete: '1 week',
          sortOrder: 3
        }
      ]
    },

    // ============ ECONOMIC DOWNTURN STRATEGIES ============
    {
      strategy: {
        strategyId: 'financial_resilience',
        name: JSON.stringify({
          en: 'Financial Resilience & Cash Management',
          es: 'Resiliencia Financiera y Gestión de Efectivo',
          fr: 'Résilience Financière et Gestion de Trésorerie'
        }),
        category: 'response',
        description: JSON.stringify({
          en: 'Build financial reserves and manage costs during economic hardship',
          es: 'Construir reservas financieras y gestionar costos durante dificultades económicas',
          fr: 'Constituer des réserves financières et gérer les coûts pendant les difficultés économiques'
        }),
        implementationCost: 'low',
        effectiveness: 6,
        applicableRisks: JSON.stringify(['economicDownturn']),
        applicableBusinessTypes: JSON.stringify(['all']),
        isActive: true
      },
      actionSteps: [
        {
          phase: 'immediate',
          action: 'Build emergency savings',
          smeAction: JSON.stringify({
            en: 'Save enough money to cover 3-6 months of basic business expenses',
            es: 'Ahorre suficiente dinero para cubrir 3-6 meses de gastos comerciales básicos',
            fr: 'Épargnez suffisamment d\'argent pour couvrir 3-6 mois de dépenses commerciales de base'
          }),
          estimatedCost: 'Variable',
          timeToComplete: '3-12 months',
          sortOrder: 1
        },
        {
          phase: 'short_term',
          action: 'Reduce non-essential expenses',
          smeAction: JSON.stringify({
            en: 'Cut spending that isn\'t critical - subscriptions, luxury items, excess inventory',
            es: 'Reduzca gastos que no son críticos - suscripciones, artículos de lujo, inventario excesivo',
            fr: 'Réduisez les dépenses non critiques - abonnements, articles de luxe, inventaire excessif'
          }),
          estimatedCost: '$0',
          timeToComplete: '1 month',
          sortOrder: 2
        },
        {
          phase: 'short_term',
          action: 'Negotiate with suppliers',
          smeAction: JSON.stringify({
            en: 'Ask suppliers for better prices, longer payment terms, or bulk discounts',
            es: 'Pida a los proveedores mejores precios, plazos de pago más largos o descuentos por volumen',
            fr: 'Demandez aux fournisseurs de meilleurs prix, des délais de paiement plus longs ou des remises en gros'
          }),
          estimatedCost: '$0',
          timeToComplete: '2 weeks',
          sortOrder: 3
        }
      ]
    },

    // ============ EARTHQUAKE STRATEGIES ============
    {
      strategy: {
        strategyId: 'earthquake_preparedness',
        name: JSON.stringify({
          en: 'Earthquake Preparedness & Structural Safety',
          es: 'Preparación para Terremotos y Seguridad Estructural',
          fr: 'Préparation aux Tremblements de Terre et Sécurité Structurelle'
        }),
        category: 'prevention',
        description: JSON.stringify({
          en: 'Secure building and equipment to minimize earthquake damage',
          es: 'Asegurar edificio y equipo para minimizar daños por terremoto',
          fr: 'Sécuriser le bâtiment et l\'équipement pour minimiser les dommages sismiques'
        }),
        implementationCost: 'medium',
        effectiveness: 6,
        applicableRisks: JSON.stringify(['earthquake']),
        applicableBusinessTypes: JSON.stringify(['all']),
        isActive: true
      },
      actionSteps: [
        {
          phase: 'immediate',
          action: 'Secure heavy equipment',
          smeAction: JSON.stringify({
            en: 'Bolt shelves, equipment, and furniture to walls so they don\'t tip over',
            es: 'Atornille estantes, equipo y muebles a las paredes para que no se vuelquen',
            fr: 'Boulonnez les étagères, l\'équipement et les meubles aux murs pour qu\'ils ne basculent pas'
          }),
          estimatedCost: '$100-$500',
          timeToComplete: '1 week',
          sortOrder: 1
        },
        {
          phase: 'short_term',
          action: 'Identify safe zones',
          smeAction: JSON.stringify({
            en: 'Mark sturdy tables or doorways where staff should take cover during shaking',
            es: 'Marque mesas resistentes o marcos de puertas donde el personal debe cubrirse durante temblores',
            fr: 'Marquez les tables solides ou les encadrements de portes où le personnel doit se mettre à l\'abri pendant les secousses'
          }),
          estimatedCost: '$0-$50',
          timeToComplete: '1 day',
          sortOrder: 2
        },
        {
          phase: 'medium_term',
          action: 'Building structural assessment',
          smeAction: JSON.stringify({
            en: 'Hire engineer to check if building needs reinforcement for earthquake safety',
            es: 'Contrate ingeniero para verificar si el edificio necesita refuerzo para seguridad sísmica',
            fr: 'Embauchez un ingénieur pour vérifier si le bâtiment nécessite un renforcement pour la sécurité sismique'
          }),
          estimatedCost: '$500-$2000',
          timeToComplete: '1-2 months',
          sortOrder: 3
        }
      ]
    },

    // ============ DROUGHT STRATEGIES ============
    {
      strategy: {
        strategyId: 'water_conservation',
        name: JSON.stringify({
          en: 'Water Conservation & Storage',
          es: 'Conservación y Almacenamiento de Agua',
          fr: 'Conservation et Stockage de l\'Eau'
        }),
        category: 'prevention',
        description: JSON.stringify({
          en: 'Ensure water availability during drought periods',
          es: 'Asegurar disponibilidad de agua durante períodos de sequía',
          fr: 'Assurer la disponibilité de l\'eau pendant les périodes de sécheresse'
        }),
        implementationCost: 'medium',
        effectiveness: 6,
        applicableRisks: JSON.stringify(['drought']),
        applicableBusinessTypes: JSON.stringify(['hospitality', 'agriculture', 'manufacturing']),
        isActive: true
      },
      actionSteps: [
        {
          phase: 'short_term',
          action: 'Install water storage tanks',
          smeAction: JSON.stringify({
            en: 'Buy large water tanks to store water when available',
            es: 'Compre tanques de agua grandes para almacenar agua cuando esté disponible',
            fr: 'Achetez de grands réservoirs d\'eau pour stocker l\'eau quand elle est disponible'
          }),
          estimatedCost: '$500-$3000',
          timeToComplete: '2 weeks',
          sortOrder: 1
        },
        {
          phase: 'medium_term',
          action: 'Install water-efficient fixtures',
          smeAction: JSON.stringify({
            en: 'Replace toilets, faucets with low-flow models that use less water',
            es: 'Reemplace inodoros, grifos con modelos de bajo flujo que usan menos agua',
            fr: 'Remplacez les toilettes, robinets par des modèles à faible débit qui utilisent moins d\'eau'
          }),
          estimatedCost: '$300-$2000',
          timeToComplete: '1 month',
          sortOrder: 2
        }
      ]
    },

    // ============ CIVIL UNREST STRATEGIES ============
    {
      strategy: {
        strategyId: 'security_communication_unrest',
        name: JSON.stringify({
          en: 'Security & Communication During Unrest',
          es: 'Seguridad y Comunicación Durante Disturbios',
          fr: 'Sécurité et Communication Pendant les Troubles'
        }),
        category: 'response',
        description: JSON.stringify({
          en: 'Protect staff and property during civil disturbances',
          es: 'Proteger personal y propiedad durante disturbios civiles',
          fr: 'Protéger le personnel et la propriété pendant les troubles civils'
        }),
        implementationCost: 'low',
        effectiveness: 6,
        applicableRisks: JSON.stringify(['civilUnrest', 'terrorism']),
        applicableBusinessTypes: JSON.stringify(['all']),
        isActive: true
      },
      actionSteps: [
        {
          phase: 'immediate',
          action: 'Create emergency communication plan',
          smeAction: JSON.stringify({
            en: 'Set up WhatsApp group to quickly tell all staff when to close or stay home',
            es: 'Configure grupo de WhatsApp para avisar rápidamente a todo el personal cuándo cerrar o quedarse en casa',
            fr: 'Configurez un groupe WhatsApp pour informer rapidement tout le personnel quand fermer ou rester à la maison'
          }),
          estimatedCost: '$0',
          timeToComplete: '1 day',
          sortOrder: 1
        },
        {
          phase: 'short_term',
          action: 'Install security cameras',
          smeAction: JSON.stringify({
            en: 'Put cameras at entrances and areas with expensive items, connect to phone',
            es: 'Coloque cámaras en entradas y áreas con artículos costosos, conecte al teléfono',
            fr: 'Placez des caméras aux entrées et dans les zones avec des articles coûteux, connectez au téléphone'
          }),
          estimatedCost: '$300-$1500',
          timeToComplete: '2 weeks',
          sortOrder: 2
        },
        {
          phase: 'immediate',
          action: 'Establish closing procedures',
          smeAction: JSON.stringify({
            en: 'Plan how to quickly secure and close business if situation becomes unsafe',
            es: 'Planifique cómo asegurar y cerrar rápidamente el negocio si la situación se vuelve insegura',
            fr: 'Planifiez comment sécuriser et fermer rapidement l\'entreprise si la situation devient dangereuse'
          }),
          estimatedCost: '$0',
          timeToComplete: '1 day',
          sortOrder: 3
        }
      ]
    }
  ]

  for (const strat of strategies) {
    const createdStrategy = await prisma.riskMitigationStrategy.create({
      data: strat.strategy
    })
    
    console.log(`  ✅ ${JSON.parse(strat.strategy.name).en}`)
    
    // Create action steps for this strategy
    for (let i = 0; i < strat.actionSteps.length; i++) {
      const step = strat.actionSteps[i]
      await prisma.actionStep.create({
        data: {
          stepId: `${createdStrategy.strategyId}_step_${i + 1}`,
          title: step.action,
          description: step.action,
          phase: step.phase,
          smeAction: step.smeAction,
          timeframe: step.timeToComplete,
          estimatedCost: step.estimatedCost,
          sortOrder: step.sortOrder,
          strategyId: createdStrategy.id
        }
      })
    }
    console.log(`     → Created ${strat.actionSteps.length} action steps`)
  }

  console.log(`\n  Created ${strategies.length} strategies with action steps`)
}

populateCompleteSystem()


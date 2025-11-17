import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Comprehensive Risk Multiplier Seed Script
 * Creates multipliers that adjust risk scores based on business characteristics
 * Uses simple, user-friendly language for SME owners
 */

interface MultiplierData {
  name: string
  description: string
  characteristicType: string
  conditionType: 'boolean' | 'threshold' | 'range'
  thresholdValue?: number | null
  minValue?: number | null
  maxValue?: number | null
  multiplierFactor: number
  applicableHazards: string[]
  priority: number
  reasoning: string
  wizardQuestion: {
    en: string
    es: string
    fr: string
  }
  wizardAnswerOptions?: Array<{
    label: {
      en: string
      es: string
      fr: string
    }
    value: number | boolean
  }>
  wizardHelpText: {
    en: string
    es: string
    fr: string
  }
}

const MULTIPLIERS: MultiplierData[] = [
  // ============================================================================
  // LOCATION-BASED MULTIPLIERS (Priority 1-3)
  // ============================================================================
  
  {
    name: 'Coastal Location',
    description: 'Business is located within 5km of the coast, increasing exposure to hurricanes, storm surge, and flooding',
    characteristicType: 'location_coastal',
    conditionType: 'boolean',
    multiplierFactor: 1.3,
    applicableHazards: ['hurricane', 'flood'],
    priority: 1,
    reasoning: 'Coastal businesses face direct storm surge, higher wind speeds, and coastal flooding during hurricanes and storms',
    wizardQuestion: {
      en: 'Is your business located near the coast (within 5km)?',
      es: '¿Está su negocio ubicado cerca de la costa (dentro de 5 km)?',
      fr: 'Votre entreprise est-elle située près de la côte (dans un rayon de 5 km)?'
    },
    wizardAnswerOptions: [
      {
        label: {
          en: 'Yes, within 5km of the coast',
          es: 'Sí, dentro de 5 km de la costa',
          fr: 'Oui, dans un rayon de 5 km de la côte'
        },
        value: true
      },
      {
        label: {
          en: 'No, more than 5km from the coast',
          es: 'No, más de 5 km de la costa',
          fr: 'Non, à plus de 5 km de la côte'
        },
        value: false
      }
    ],
    wizardHelpText: {
      en: 'Coastal businesses face higher risks from hurricanes, storm surge, and flooding. This helps us calculate your actual risk level.',
      es: 'Los negocios costeros enfrentan mayores riesgos por huracanes, marejadas ciclónicas e inundaciones. Esto nos ayuda a calcular su nivel de riesgo real.',
      fr: 'Les entreprises côtières sont exposées à des risques plus élevés d\'ouragans, de marées de tempête et d\'inondations. Cela nous aide à calculer votre niveau de risque réel.'
    }
  },

  {
    name: 'Urban Location',
    description: 'Business is located in an urban or city area, affecting flood, fire, and infrastructure risks',
    characteristicType: 'location_urban',
    conditionType: 'boolean',
    multiplierFactor: 1.2,
    applicableHazards: ['flood', 'fire', 'civilUnrest', 'powerOutage'],
    priority: 2,
    reasoning: 'Urban areas have denser infrastructure, drainage challenges, higher fire risk, and more complex power grids',
    wizardQuestion: {
      en: 'Is your business located in a city or urban area?',
      es: '¿Está su negocio ubicado en una ciudad o área urbana?',
      fr: 'Votre entreprise est-elle située dans une ville ou une zone urbaine?'
    },
    wizardAnswerOptions: [
      {
        label: {
          en: 'Yes, in a city or urban area',
          es: 'Sí, en una ciudad o área urbana',
          fr: 'Oui, dans une ville ou une zone urbaine'
        },
        value: true
      },
      {
        label: {
          en: 'No, in a rural or suburban area',
          es: 'No, en un área rural o suburbana',
          fr: 'Non, dans une zone rurale ou suburbaine'
        },
        value: false
      }
    ],
    wizardHelpText: {
      en: 'Urban businesses may face different risks like flooding from poor drainage, higher fire risk, and power grid issues.',
      es: 'Los negocios urbanos pueden enfrentar diferentes riesgos como inundaciones por drenaje deficiente, mayor riesgo de incendio y problemas de red eléctrica.',
      fr: 'Les entreprises urbaines peuvent être confrontées à différents risques comme les inondations dues à un mauvais drainage, un risque d\'incendie plus élevé et des problèmes de réseau électrique.'
    }
  },

  {
    name: 'Flood-Prone Area',
    description: 'Business is located in a known flood-prone area based on location risk assessment',
    characteristicType: 'location_flood_prone',
    conditionType: 'boolean',
    multiplierFactor: 1.4,
    applicableHazards: ['flood', 'hurricane'],
    priority: 3,
    reasoning: 'Businesses in flood-prone areas face significantly higher flood risk, especially during hurricanes and heavy rainfall',
    wizardQuestion: {
      en: 'Is your business in a flood-prone area?',
      es: '¿Está su negocio en un área propensa a inundaciones?',
      fr: 'Votre entreprise est-elle située dans une zone sujette aux inondations?'
    },
    wizardAnswerOptions: [
      {
        label: {
          en: 'Yes, in a flood-prone area',
          es: 'Sí, en un área propensa a inundaciones',
          fr: 'Oui, dans une zone sujette aux inondations'
        },
        value: true
      },
      {
        label: {
          en: 'No, not in a flood-prone area',
          es: 'No, no en un área propensa a inundaciones',
          fr: 'Non, pas dans une zone sujette aux inondations'
        },
        value: false
      }
    ],
    wizardHelpText: {
      en: 'If your area has a history of flooding or is in a low-lying area, your flood risk is higher. We use location data to help identify this.',
      es: 'Si su área tiene historial de inundaciones o está en una zona baja, su riesgo de inundación es mayor. Usamos datos de ubicación para ayudar a identificar esto.',
      fr: 'Si votre région a des antécédents d\'inondations ou se trouve dans une zone basse, votre risque d\'inondation est plus élevé. Nous utilisons les données de localisation pour aider à identifier cela.'
    }
  },

  // ============================================================================
  // TOURISM DEPENDENCY MULTIPLIERS (Priority 4-5)
  // ============================================================================

  {
    name: 'Tourism Dependency',
    description: 'Business derives revenue from tourists, with varying levels of dependency affecting vulnerability',
    characteristicType: 'tourism_share',
    conditionType: 'threshold',
    thresholdValue: 70,
    multiplierFactor: 1.5,
    applicableHazards: ['economicDownturn', 'pandemicDisease', 'supplyChainDisruption', 'civilUnrest'],
    priority: 4,
    reasoning: 'Tourism-dependent businesses are vulnerable to travel restrictions, economic downturns, and global crises',
    wizardQuestion: {
      en: 'What percentage of your customers are tourists?',
      es: '¿Qué porcentaje de sus clientes son turistas?',
      fr: 'Quel pourcentage de vos clients sont des touristes?'
    },
    wizardAnswerOptions: [
      {
        label: {
          en: 'Mainly tourists (80%+)',
          es: 'Principalmente turistas (80%+)',
          fr: 'Principalement des touristes (80%+)'
        },
        value: 85
      },
      {
        label: {
          en: 'Mix of tourists and locals (40-60%)',
          es: 'Mezcla de turistas y locales (40-60%)',
          fr: 'Mélange de touristes et de locaux (40-60%)'
        },
        value: 50
      },
      {
        label: {
          en: 'Mainly local customers (less than 20%)',
          es: 'Principalmente clientes locales (menos del 20%)',
          fr: 'Principalement des clients locaux (moins de 20%)'
        },
        value: 10
      }
    ],
    wizardHelpText: {
      en: 'If most of your customers are tourists, your business is more vulnerable when travel stops or the economy slows down.',
      es: 'Si la mayoría de sus clientes son turistas, su negocio es más vulnerable cuando se detiene el turismo o la economía se desacelera.',
      fr: 'Si la plupart de vos clients sont des touristes, votre entreprise est plus vulnérable lorsque les voyages s\'arrêtent ou que l\'économie ralentit.'
    }
  },

  // ============================================================================
  // OPERATIONAL DEPENDENCY MULTIPLIERS (Priority 6-8)
  // ============================================================================

  {
    name: 'High Digital Dependency',
    description: 'Business cannot operate without digital systems (computers, POS, internet) - 80% or more dependency',
    characteristicType: 'digital_dependency',
    conditionType: 'threshold',
    thresholdValue: 80,
    multiplierFactor: 1.4,
    applicableHazards: ['cyberAttack', 'powerOutage', 'supplyChainDisruption'],
    priority: 6,
    reasoning: 'Businesses heavily dependent on digital systems face severe disruption from cyber attacks, power outages, and internet failures',
    wizardQuestion: {
      en: 'How dependent is your business on computers and internet?',
      es: '¿Qué tan dependiente es su negocio de computadoras e internet?',
      fr: 'Dans quelle mesure votre entreprise dépend-elle des ordinateurs et d\'Internet?'
    },
    wizardAnswerOptions: [
      {
        label: {
          en: 'Cannot operate without them (Essential)',
          es: 'No puedo operar sin ellos (Esencial)',
          fr: 'Impossible de fonctionner sans eux (Essentiel)'
        },
        value: 95
      },
      {
        label: {
          en: 'Very helpful but can work without (Helpful)',
          es: 'Muy útil pero puedo trabajar sin ellos (Útil)',
          fr: 'Très utile mais peut fonctionner sans (Utile)'
        },
        value: 50
      },
      {
        label: {
          en: 'Rarely use computers (Not used)',
          es: 'Rara vez uso computadoras (No usado)',
          fr: 'Utilise rarement les ordinateurs (Non utilisé)'
        },
        value: 10
      }
    ],
    wizardHelpText: {
      en: 'If you need computers and internet to run your business, you\'re at higher risk from cyber attacks and power outages.',
      es: 'Si necesita computadoras e internet para operar su negocio, tiene mayor riesgo de ataques cibernéticos y cortes de energía.',
      fr: 'Si vous avez besoin d\'ordinateurs et d\'Internet pour faire fonctionner votre entreprise, vous êtes plus exposé aux cyberattaques et aux pannes d\'électricité.'
    }
  },

  {
    name: 'High Power Dependency',
    description: 'Business cannot operate without electricity - 80% or more dependency',
    characteristicType: 'power_dependency',
    conditionType: 'threshold',
    thresholdValue: 80,
    multiplierFactor: 1.3,
    applicableHazards: ['powerOutage', 'hurricane', 'flood'],
    priority: 7,
    reasoning: 'Businesses that require electricity to operate face severe disruption during power outages, which are common during hurricanes and floods',
    wizardQuestion: {
      en: 'Can your business operate without electricity?',
      es: '¿Puede su negocio operar sin electricidad?',
      fr: 'Votre entreprise peut-elle fonctionner sans électricité?'
    },
    wizardAnswerOptions: [
      {
        label: {
          en: 'Cannot operate without electricity',
          es: 'No puedo operar sin electricidad',
          fr: 'Impossible de fonctionner sans électricité'
        },
        value: 95
      },
      {
        label: {
          en: 'Can operate partially without electricity',
          es: 'Puedo operar parcialmente sin electricidad',
          fr: 'Peut fonctionner partiellement sans électricité'
        },
        value: 50
      },
      {
        label: {
          en: 'Can operate fully without electricity',
          es: 'Puedo operar completamente sin electricidad',
          fr: 'Peut fonctionner complètement sans électricité'
        },
        value: 10
      }
    ],
    wizardHelpText: {
      en: 'If you need electricity to run your business, power outages from storms or grid failures can shut you down completely.',
      es: 'Si necesita electricidad para operar su negocio, los cortes de energía por tormentas o fallas de red pueden cerrarlo por completo.',
      fr: 'Si vous avez besoin d\'électricité pour faire fonctionner votre entreprise, les pannes d\'électricité dues aux tempêtes ou aux pannes de réseau peuvent vous fermer complètement.'
    }
  },

  {
    name: 'High Water Dependency',
    description: 'Business requires running water to operate - 80% or more dependency (restaurants, hotels, etc.)',
    characteristicType: 'water_dependency',
    conditionType: 'threshold',
    thresholdValue: 80,
    multiplierFactor: 1.3,
    applicableHazards: ['drought', 'powerOutage'],
    priority: 8,
    reasoning: 'Water-dependent businesses face critical risks during droughts and power outages that affect water pumps',
    wizardQuestion: {
      en: 'Do you need running water to operate your business?',
      es: '¿Necesita agua corriente para operar su negocio?',
      fr: 'Avez-vous besoin d\'eau courante pour faire fonctionner votre entreprise?'
    },
    wizardAnswerOptions: [
      {
        label: {
          en: 'Yes, essential for operations (Restaurant, hotel, etc.)',
          es: 'Sí, esencial para las operaciones (Restaurante, hotel, etc.)',
          fr: 'Oui, essentiel pour les opérations (Restaurant, hôtel, etc.)'
        },
        value: true
      },
      {
        label: {
          en: 'No, water is not critical',
          es: 'No, el agua no es crítica',
          fr: 'Non, l\'eau n\'est pas critique'
        },
        value: false
      }
    ],
    wizardHelpText: {
      en: 'Businesses like restaurants and hotels that need running water face serious problems during water shortages or power outages.',
      es: 'Los negocios como restaurantes y hoteles que necesitan agua corriente enfrentan problemas serios durante la escasez de agua o cortes de energía.',
      fr: 'Les entreprises comme les restaurants et les hôtels qui ont besoin d\'eau courante sont confrontées à de graves problèmes pendant les pénuries d\'eau ou les pannes d\'électricité.'
    }
  },

  // ============================================================================
  // SUPPLY CHAIN MULTIPLIERS (Priority 9-10)
  // ============================================================================

  {
    name: 'Complex Supply Chain',
    description: 'Business has complex supply chain with international suppliers, minimal inventory, or perishable goods',
    characteristicType: 'supply_chain_complex',
    conditionType: 'boolean',
    multiplierFactor: 1.4,
    applicableHazards: ['supplyChainDisruption', 'economicDownturn', 'pandemicDisease'],
    priority: 9,
    reasoning: 'Complex supply chains with international suppliers or minimal inventory are highly vulnerable to disruptions',
    wizardQuestion: {
      en: 'Does your business have any of these supply chain characteristics?',
      es: '¿Su negocio tiene alguna de estas características de cadena de suministro?',
      fr: 'Votre entreprise a-t-elle l\'une de ces caractéristiques de chaîne d\'approvisionnement?'
    },
    wizardAnswerOptions: [
      {
        label: {
          en: 'Import goods from overseas',
          es: 'Importo productos del extranjero',
          fr: 'Importer des produits d\'outre-mer'
        },
        value: true
      },
      {
        label: {
          en: 'Keep minimal inventory (order as needed)',
          es: 'Mantengo inventario mínimo (pido según necesidad)',
          fr: 'Garder un inventaire minimal (commander selon les besoins)'
        },
        value: true
      },
      {
        label: {
          en: 'Sell perishable goods (food, flowers, etc.)',
          es: 'Vendo productos perecederos (alimentos, flores, etc.)',
          fr: 'Vendre des produits périssables (aliments, fleurs, etc.)'
        },
        value: true
      }
    ],
    wizardHelpText: {
      en: 'Select any option that applies to your business. If you import goods, keep minimal stock, or sell perishable items, supply chain problems can shut down your business quickly.',
      es: 'Seleccione cualquier opción que se aplique a su negocio. Si importa productos, mantiene poco inventario o vende artículos perecederos, los problemas de cadena de suministro pueden cerrar su negocio rápidamente.',
      fr: 'Sélectionnez toute option qui s\'applique à votre entreprise. Si vous importez des produits, gardez peu de stock ou vendez des articles périssables, les problèmes de chaîne d\'approvisionnement peuvent fermer votre entreprise rapidement.'
    }
  },

  {
    name: 'Just-in-Time Inventory',
    description: 'Business keeps minimal inventory and orders supplies as needed',
    characteristicType: 'just_in_time_inventory',
    conditionType: 'boolean',
    multiplierFactor: 1.5,
    applicableHazards: ['supplyChainDisruption', 'economicDownturn'],
    priority: 10,
    reasoning: 'Minimal inventory means immediate impact from supply disruptions - no buffer stock to rely on',
    wizardQuestion: {
      en: 'Do you keep minimal inventory (order supplies as needed)?',
      es: '¿Mantiene inventario mínimo (pide suministros según necesidad)?',
      fr: 'Gardez-vous un inventaire minimal (commandez les fournitures selon les besoins)?'
    },
    wizardAnswerOptions: [
      {
        label: {
          en: 'Yes, I keep minimal inventory',
          es: 'Sí, mantengo inventario mínimo',
          fr: 'Oui, je garde un inventaire minimal'
        },
        value: true
      },
      {
        label: {
          en: 'No, I keep adequate stock',
          es: 'No, mantengo stock adecuado',
          fr: 'Non, je garde un stock adéquat'
        },
        value: false
      }
    ],
    wizardHelpText: {
      en: 'If you keep very little stock and order as needed, any supply chain problem immediately affects your business.',
      es: 'Si mantiene muy poco inventario y pide según necesidad, cualquier problema de cadena de suministro afecta inmediatamente su negocio.',
      fr: 'Si vous gardez très peu de stock et commandez selon les besoins, tout problème de chaîne d\'approvisionnement affecte immédiatement votre entreprise.'
    }
  },

  // ============================================================================
  // PHYSICAL ASSET MULTIPLIERS (Priority 11-13)
  // ============================================================================

  {
    name: 'Physical Asset Intensive',
    description: 'Business has expensive equipment, machinery, or physical assets',
    characteristicType: 'physical_asset_intensive',
    conditionType: 'boolean',
    multiplierFactor: 1.2,
    applicableHazards: ['fire', 'hurricane', 'flood', 'earthquake'],
    priority: 11,
    reasoning: 'Businesses with expensive equipment face higher potential losses from physical damage during disasters',
    wizardQuestion: {
      en: 'Do you have expensive equipment or machinery?',
      es: '¿Tiene equipos o maquinaria costosos?',
      fr: 'Avez-vous des équipements ou des machines coûteux?'
    },
    wizardAnswerOptions: [
      {
        label: {
          en: 'Yes, I have expensive equipment',
          es: 'Sí, tengo equipos costosos',
          fr: 'Oui, j\'ai des équipements coûteux'
        },
        value: true
      },
      {
        label: {
          en: 'No, I don\'t have expensive equipment',
          es: 'No, no tengo equipos costosos',
          fr: 'Non, je n\'ai pas d\'équipements coûteux'
        },
        value: false
      }
    ],
    wizardHelpText: {
      en: 'Expensive equipment increases your potential losses if damaged by fire, floods, or storms.',
      es: 'Los equipos costosos aumentan sus pérdidas potenciales si son dañados por incendios, inundaciones o tormentas.',
      fr: 'Les équipements coûteux augmentent vos pertes potentielles s\'ils sont endommagés par le feu, les inondations ou les tempêtes.'
    }
  },

  {
    name: 'Own Building',
    description: 'Business owns the building/premises where it operates',
    characteristicType: 'own_building',
    conditionType: 'boolean',
    multiplierFactor: 1.1,
    applicableHazards: ['hurricane', 'flood', 'fire', 'earthquake'],
    priority: 12,
    reasoning: 'Property owners face direct physical damage risks and repair costs',
    wizardQuestion: {
      en: 'Do you own your business premises?',
      es: '¿Es dueño de las instalaciones de su negocio?',
      fr: 'Possédez-vous les locaux de votre entreprise?'
    },
    wizardAnswerOptions: [
      {
        label: {
          en: 'Yes, I own my business premises',
          es: 'Sí, soy dueño de mis instalaciones',
          fr: 'Oui, je possède mes locaux'
        },
        value: true
      },
      {
        label: {
          en: 'No, I rent my business premises',
          es: 'No, alquilo mis instalaciones',
          fr: 'Non, je loue mes locaux'
        },
        value: false
      }
    ],
    wizardHelpText: {
      en: 'If you own your building, you\'re responsible for repairs and face direct losses from physical damage.',
      es: 'Si es dueño de su edificio, es responsable de las reparaciones y enfrenta pérdidas directas por daños físicos.',
      fr: 'Si vous possédez votre bâtiment, vous êtes responsable des réparations et subissez des pertes directes dues aux dommages physiques.'
    }
  },

  {
    name: 'Significant Inventory',
    description: 'Business maintains large inventory of goods',
    characteristicType: 'significant_inventory',
    conditionType: 'boolean',
    multiplierFactor: 1.2,
    applicableHazards: ['fire', 'flood', 'hurricane', 'supplyChainDisruption'],
    priority: 13,
    reasoning: 'Large inventory increases potential losses from physical damage and supply chain disruptions',
    wizardQuestion: {
      en: 'Do you keep significant inventory (large stock of goods)?',
      es: '¿Mantiene inventario significativo (gran cantidad de productos)?',
      fr: 'Gardez-vous un inventaire important (grand stock de produits)?'
    },
    wizardAnswerOptions: [
      {
        label: {
          en: 'Yes, I keep significant inventory',
          es: 'Sí, mantengo inventario significativo',
          fr: 'Oui, je garde un inventaire important'
        },
        value: true
      },
      {
        label: {
          en: 'No, I keep minimal or moderate inventory',
          es: 'No, mantengo inventario mínimo o moderado',
          fr: 'Non, je garde un inventaire minimal ou modéré'
        },
        value: false
      }
    ],
    wizardHelpText: {
      en: 'Large inventory means more goods at risk from fires, floods, or supply problems.',
      es: 'Un inventario grande significa más productos en riesgo por incendios, inundaciones o problemas de suministro.',
      fr: 'Un grand inventaire signifie plus de produits à risque d\'incendies, d\'inondations ou de problèmes d\'approvisionnement.'
    }
  },

  // ============================================================================
  // SEASONAL BUSINESS MULTIPLIER (Priority 14)
  // ============================================================================

  {
    name: 'Seasonal Business',
    description: 'Business has seasonal revenue concentrated in certain months',
    characteristicType: 'seasonal_business',
    conditionType: 'boolean',
    multiplierFactor: 1.2,
    applicableHazards: ['economicDownturn', 'hurricane', 'supplyChainDisruption'],
    priority: 14,
    reasoning: 'Seasonal businesses have less time to recover from disruptions, especially if they occur during peak season',
    wizardQuestion: {
      en: 'Is your revenue seasonal (concentrated in certain months)?',
      es: '¿Sus ingresos son estacionales (concentrados en ciertos meses)?',
      fr: 'Vos revenus sont-ils saisonniers (concentrés sur certains mois)?'
    },
    wizardAnswerOptions: [
      {
        label: {
          en: 'Yes, my revenue is seasonal',
          es: 'Sí, mis ingresos son estacionales',
          fr: 'Oui, mes revenus sont saisonniers'
        },
        value: true
      },
      {
        label: {
          en: 'No, my revenue is steady year-round',
          es: 'No, mis ingresos son constantes durante todo el año',
          fr: 'Non, mes revenus sont stables toute l\'année'
        },
        value: false
      }
    ],
    wizardHelpText: {
      en: 'If most of your revenue comes in certain months, disruptions during peak season can be devastating.',
      es: 'Si la mayoría de sus ingresos provienen de ciertos meses, las interrupciones durante la temporada alta pueden ser devastadoras.',
      fr: 'Si la plupart de vos revenus proviennent de certains mois, les perturbations pendant la haute saison peuvent être dévastatrices.'
    }
  }
]

async function seedRiskMultipliers() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   SEED RISK MULTIPLIERS                                        ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')
  console.log('Creating risk multipliers with user-friendly language...')
  console.log('')

  let created = 0
  let updated = 0
  let skipped = 0

  for (const multiplierData of MULTIPLIERS) {
    try {
      // Check if multiplier already exists (by name)
      const existing = await prisma.riskMultiplier.findFirst({
        where: { name: multiplierData.name }
      })

      const data = {
        name: multiplierData.name,
        description: multiplierData.description,
        characteristicType: multiplierData.characteristicType,
        conditionType: multiplierData.conditionType,
        thresholdValue: multiplierData.thresholdValue ?? null,
        minValue: multiplierData.minValue ?? null,
        maxValue: multiplierData.maxValue ?? null,
        multiplierFactor: multiplierData.multiplierFactor,
        applicableHazards: JSON.stringify(multiplierData.applicableHazards),
        priority: multiplierData.priority,
        reasoning: multiplierData.reasoning,
        wizardQuestion: JSON.stringify(multiplierData.wizardQuestion),
        wizardAnswerOptions: multiplierData.wizardAnswerOptions && multiplierData.wizardAnswerOptions.length > 0
          ? JSON.stringify(multiplierData.wizardAnswerOptions)
          : null,
        wizardHelpText: JSON.stringify(multiplierData.wizardHelpText),
        isActive: true,
        createdBy: 'seed_script'
      }

      if (existing) {
        await prisma.riskMultiplier.update({
          where: { id: existing.id },
          data
        })
        console.log(`  ↻ Updated: ${multiplierData.name} (Priority ${multiplierData.priority})`)
        updated++
      } else {
        await prisma.riskMultiplier.create({ data })
        console.log(`  ✓ Created: ${multiplierData.name} (Priority ${multiplierData.priority})`)
        created++
      }
    } catch (error) {
      console.error(`  ❌ Error with ${multiplierData.name}:`, error)
      skipped++
    }
  }

  console.log('')
  console.log('═'.repeat(65))
  console.log('✅ SEEDING SUMMARY')
  console.log('═'.repeat(65))
  console.log(`  Created: ${created}`)
  console.log(`  Updated: ${updated}`)
  console.log(`  Skipped: ${skipped}`)
  console.log(`  Total: ${MULTIPLIERS.length}`)
  console.log('')
  console.log('✅ Risk multipliers seeded successfully!')
  console.log('')
  console.log('Multipliers cover:')
  console.log('  📍 Location factors (coastal, urban, flood-prone)')
  console.log('  🏖️  Tourism dependency (high, moderate)')
  console.log('  ⚡ Operational dependencies (digital, power, water)')
  console.log('  🚛 Supply chain factors (complex, JIT)')
  console.log('  🏭 Physical assets (equipment, building, inventory)')
  console.log('  📅 Seasonal business patterns')
  console.log('')
}

async function main() {
  try {
    await seedRiskMultipliers()
  } catch (error) {
    console.error('\n❌ Error seeding risk multipliers:')
    console.error(error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seedRiskMultipliers, MULTIPLIERS }


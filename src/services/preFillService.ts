import { LocationData, PreFillData, IndustryProfile, HazardRiskLevel } from '../data/types'
import { getIndustryProfile } from '../data/industryProfiles'
import { calculateLocationRisk } from '../data/hazardMappings'
import { 
  generateSmartActionPlans 
} from './actionPlanService'

// Localized location terms
const getLocationTerms = (locale: string) => {
  const terms = {
    en: {
      coastalArea: 'coastal area',
      inlandArea: 'inland area'
    },
    fr: {
      coastalArea: 'zone côtière',
      inlandArea: 'zone intérieure'
    },
    es: {
      coastalArea: 'área costera',
      inlandArea: 'área interior'
    }
  }
  return terms[locale as keyof typeof terms] || terms.en
}

// Get localized examples from translation system
const getLocalizedExamples = (industryId: string, locale: string, translations: any) => {
  const industryTranslations = translations?.industryProfiles?.[industryId]
  if (!industryTranslations) return null
  
  return {
    businessPurpose: industryTranslations.businessPurpose || [],
    productsServices: industryTranslations.productsServices || [],
    uniqueSellingPoints: industryTranslations.uniqueSellingPoints || [],
    keyPersonnel: industryTranslations.keyPersonnel || [],
    minimumResourcesExamples: industryTranslations.minimumResourcesExamples || [],
    customerBase: industryTranslations.customerBase || []
  }
}

// Get localized example texts
const getGeneralLocalizedExamples = (locale: string) => {
  const examples = {
    en: {
      essentialFunctions: [
        'Customer service and sales - Direct customer interactions and sales transactions - Critical - 0-2h - Staff, payment system, basic inventory',
        'Inventory management - Managing and tracking stock levels - Important - 8-24h - Inventory tracking system, staff',
        'Supplier relationships - Maintaining relationships with key suppliers - Important - 1-3d - Communication systems, supplier contacts'
      ],
      riskAssessment: [
        'Select hazards relevant to your location and business type',
        'Consider both natural disasters and human-caused risks',
        'Include location-specific risks like coastal flooding or urban crime'
      ]
    },
    fr: {
      essentialFunctions: [
        'Service client et ventes - Interactions directes avec les clients et transactions de vente - Critique - 0-2h - Personnel, système de paiement, inventaire de base',
        'Gestion des stocks - Gestion et suivi des niveaux de stock - Important - 8-24h - Système de suivi des stocks, personnel',
        'Relations fournisseurs - Maintien des relations avec les fournisseurs clés - Important - 1-3j - Systèmes de communication, contacts fournisseurs'
      ],
      riskAssessment: [
        'Sélectionnez les dangers pertinents pour votre emplacement et votre type d\'entreprise',
        'Considérez à la fois les catastrophes naturelles et les risques causés par l\'homme',
        'Incluez les risques spécifiques à l\'emplacement comme les inondations côtières ou la criminalité urbaine'
      ]
    },
    es: {
      essentialFunctions: [
        'Servicio al cliente y ventas - Interacciones directas con clientes y transacciones de venta - Crítico - 0-2h - Personal, sistema de pago, inventario básico',
        'Gestión de inventario - Gestión y seguimiento de niveles de stock - Importante - 8-24h - Sistema de seguimiento de inventario, personal',
        'Relaciones con proveedores - Mantener relaciones con proveedores clave - Importante - 1-3d - Sistemas de comunicación, contactos de proveedores'
      ],
      riskAssessment: [
        'Seleccione peligros relevantes para su ubicación y tipo de negocio',
        'Considere tanto desastres naturales como riesgos causados por humanos',
        'Incluya riesgos específicos de la ubicación como inundaciones costeras o crimen urbano'
      ]
    }
  }
  return examples[locale as keyof typeof examples] || examples.en
}

// Helper function to replace placeholders in text with location data
const localizePlaceholders = (text: string, location: LocationData, locale: string): string => {
  const locationTerms = getLocationTerms(locale)
  return text
    .replace(/\[NEIGHBORHOOD\]/g, location.parish || location.region || 'local area')
    .replace(/\[AREA\]/g, location.nearCoast ? locationTerms.coastalArea : locationTerms.inlandArea)
    .replace(/\[ISLAND\]/g, location.country)
}

// Get localized field names based on locale
const getLocalizedFieldNames = (locale: string) => {
  const fieldNames = {
    en: {
      businessPurpose: 'Business Purpose',
      productsAndServices: 'Products and Services',
      keyPersonnelInvolved: 'Key Personnel Involved',
      operatingHours: 'Operating Hours',
      minimumResourceRequirements: 'Minimum Resource Requirements',
      customerBase: 'Customer Base',
      businessFunctions: 'Business Functions',
      potentialHazards: 'Potential Hazards',
      riskAssessmentMatrix: 'Risk Assessment Matrix',
      businessFunction: 'Business Function',
      description: 'Description',
      priorityLevel: 'Priority Level',
      maximumAcceptableDowntime: 'Maximum Acceptable Downtime',
      criticalResourcesNeeded: 'Critical Resources Needed'
    },
    fr: {
      businessPurpose: 'But de l\'Entreprise',
      productsAndServices: 'Produits et Services',
      keyPersonnelInvolved: 'Personnel Clé Impliqué',
      operatingHours: 'Heures d\'Ouverture',
      minimumResourceRequirements: 'Ressources Minimales Nécessaires',
      customerBase: 'Base de Clientèle',
      businessFunctions: 'Fonctions de l\'Entreprise',
      potentialHazards: 'Dangers Potentiels',
      riskAssessmentMatrix: 'Matrice d\'Évaluation des Risques',
      businessFunction: 'Fonction de l\'Entreprise',
      description: 'Description',
      priorityLevel: 'Niveau de Priorité',
      maximumAcceptableDowntime: 'Temps d\'Arrêt Maximum Acceptable',
      criticalResourcesNeeded: 'Ressources Critiques Nécessaires'
    },
    es: {
      businessPurpose: 'Propósito del Negocio',
      productsAndServices: 'Productos y Servicios',
      keyPersonnelInvolved: 'Personal Clave Involucrado',
      operatingHours: 'Horarios de Operación',
      minimumResourceRequirements: 'Requisitos Mínimos de Recursos',
      customerBase: 'Base de Clientes',
      businessFunctions: 'Funciones del Negocio',
      potentialHazards: 'Peligros Potenciales',
      riskAssessmentMatrix: 'Matriz de Evaluación de Riesgos',
      businessFunction: 'Función del Negocio',
      description: 'Descripción',
      priorityLevel: 'Nivel de Prioridad',
      maximumAcceptableDowntime: 'Tiempo Máximo de Inactividad Aceptable',
      criticalResourcesNeeded: 'Recursos Críticos Necesarios'
    }
  }
  return fieldNames[locale as keyof typeof fieldNames] || fieldNames.en
}

// Get localized business function examples
const getLocalizedBusinessFunctions = (locale: string) => {
  const functions = {
    en: {
      customerService: {
        function: 'Customer service and sales',
        description: 'Direct customer interactions and sales transactions',
        priority: 'critical',
        downtime: '0-2h',
        resources: 'Staff, payment system, basic inventory'
      },
      inventoryManagement: {
        function: 'Inventory management',
        description: 'Managing and tracking stock levels',
        priority: 'important',
        downtime: '8-24h',
        resources: 'Inventory tracking system, staff'
      },
      supplierRelationships: {
        function: 'Supplier relationships',
        description: 'Maintaining relationships with key suppliers',
        priority: 'important',
        downtime: '1-3d',
        resources: 'Communication systems, supplier contacts'
      }
    },
    fr: {
      customerService: {
        function: 'Service client et ventes',
        description: 'Interactions directes avec les clients et transactions de vente',
        priority: 'critical',
        downtime: '0-2h',
        resources: 'Personnel, système de paiement, inventaire de base'
      },
      inventoryManagement: {
        function: 'Gestion des stocks',
        description: 'Gestion et suivi des niveaux de stock',
        priority: 'important',
        downtime: '8-24h',
        resources: 'Système de suivi des stocks, personnel'
      },
      supplierRelationships: {
        function: 'Relations fournisseurs',
        description: 'Maintien des relations avec les fournisseurs clés',
        priority: 'important',
        downtime: '1-3j',
        resources: 'Systèmes de communication, contacts fournisseurs'
      }
    },
    es: {
      customerService: {
        function: 'Servicio al cliente y ventas',
        description: 'Interacciones directas con clientes y transacciones de venta',
        priority: 'critical',
        downtime: '0-2h',
        resources: 'Personal, sistema de pago, inventario básico'
      },
      inventoryManagement: {
        function: 'Gestión de inventario',
        description: 'Gestión y seguimiento de niveles de stock',
        priority: 'important',
        downtime: '8-24h',
        resources: 'Sistema de seguimiento de inventario, personal'
      },
      supplierRelationships: {
        function: 'Relaciones con proveedores',
        description: 'Mantener relaciones con proveedores clave',
        priority: 'important',
        downtime: '1-3d',
        resources: 'Sistemas de comunicación, contactos de proveedores'
      }
    }
  }
  return functions[locale as keyof typeof functions] || functions.en
}

// Get localized strategy templates
const getLocalizedStrategies = (locale: string) => {
  const strategies = {
    en: {
      implementPrevention: 'Implement prevention measures for',
      retail: {
        prevention: [
          'Implement backup power systems for refrigeration and POS systems',
          'Establish relationships with multiple suppliers to avoid stock shortages',
          'Install security systems and proper lighting for crime prevention'
        ]
      },
      hospitality: {
        prevention: [
          'Maintain emergency food and water supplies for extended operations',
          'Install commercial-grade generators for kitchen equipment',
          'Develop supplier diversification to ensure consistent food supply'
        ]
      },
      services: {
        prevention: [
          'Backup equipment storage in secure, climate-controlled location',
          'Digital appointment system with cloud-based backup',
          'Flexible scheduling system to accommodate weather disruptions'
        ]
      },
      coastal: {
        prevention: 'Install storm shutters and flood barriers',
        response: 'Evacuate equipment to higher ground when storm warnings issued'
      },
      urban: {
        prevention: 'Coordinate with neighboring businesses for mutual aid agreements',
        response: 'Utilize alternative transportation routes during traffic disruptions'
      }
    },
    fr: {
      implementPrevention: 'Mettre en œuvre des mesures de prévention pour',
      retail: {
        prevention: [
          'Implémenter des systèmes d\'alimentation de secours pour la réfrigération et les systèmes de PDV',
          'Établir des relations avec plusieurs fournisseurs pour éviter les pénuries de stock',
          'Installer des systèmes de sécurité et un éclairage approprié pour la prévention du crime'
        ]
      },
      hospitality: {
        prevention: [
          'Maintenir des provisions d\'urgence de nourriture et d\'eau pour des opérations prolongées',
          'Installer des générateurs de qualité commerciale pour l\'équipement de cuisine',
          'Développer la diversification des fournisseurs pour assurer un approvisionnement alimentaire constant'
        ]
      },
      services: {
        prevention: [
          'Stockage d\'équipement de secours dans un endroit sécurisé et climatisé',
          'Système de rendez-vous numérique avec sauvegarde cloud',
          'Système de planification flexible pour accommoder les perturbations météorologiques'
        ]
      },
      coastal: {
        prevention: 'Installer des volets anti-tempête et des barrières d\'inondation',
        response: 'Évacuer l\'équipement vers un terrain plus élevé quand des avertissements de tempête sont émis'
      },
      urban: {
        prevention: 'Coordonner avec les entreprises voisines pour des accords d\'aide mutuelle',
        response: 'Utiliser des routes de transport alternatives pendant les perturbations de trafic'
      }
    },
    es: {
      implementPrevention: 'Implementar medidas de prevención para',
      retail: {
        prevention: [
          'Implementar sistemas de energía de respaldo para refrigeración y sistemas de PDV',
          'Establecer relaciones con múltiples proveedores para evitar escasez de stock',
          'Instalar sistemas de seguridad e iluminación adecuada para prevención del crimen'
        ]
      },
      hospitality: {
        prevention: [
          'Mantener suministros de emergencia de comida y agua para operaciones extendidas',
          'Instalar generadores de grado comercial para equipo de cocina',
          'Desarrollar diversificación de proveedores para asegurar suministro constante de alimentos'
        ]
      },
      services: {
        prevention: [
          'Almacenamiento de equipo de respaldo en ubicación segura y con clima controlado',
          'Sistema de citas digital con respaldo en la nube',
          'Sistema de programación flexible para acomodar interrupciones del clima'
        ]
      },
      coastal: {
        prevention: 'Instalar contraventanas de tormenta y barreras de inundación',
        response: 'Evacuar equipo a terreno más alto cuando se emitan advertencias de tormenta'
      },
      urban: {
        prevention: 'Coordinar con negocios vecinos para acuerdos de ayuda mutua',
        response: 'Utilizar rutas de transporte alternativas durante interrupciones de tráfico'
      }
    }
  }
  return strategies[locale as keyof typeof strategies] || strategies.en
}

// Generate contextual business examples based on location
const generateContextualExamples = (industry: IndustryProfile, location: LocationData, locale: string = 'en', translations: any) => {
  const fieldNames = getLocalizedFieldNames(locale)
  const examples: { [stepId: string]: { [fieldName: string]: string[] } } = {}

  // Get localized examples from translation system
  const localizedExamples = getLocalizedExamples(industry.id, locale, translations)
  
  if (localizedExamples) {
    // Business Overview step examples - using translated examples
    examples['BUSINESS_OVERVIEW'] = {
      [fieldNames.businessPurpose]: localizedExamples.businessPurpose.map((purpose: string) => 
        localizePlaceholders(purpose, location, locale)
      ),
      [fieldNames.productsAndServices]: localizedExamples.productsServices.map((service: string) => 
        localizePlaceholders(service, location, locale)
      ),
      [fieldNames.keyPersonnelInvolved]: localizedExamples.keyPersonnel,
      [fieldNames.customerBase]: localizedExamples.customerBase.map((base: string) => 
        localizePlaceholders(base, location, locale)
      ),
      [fieldNames.minimumResourceRequirements]: localizedExamples.minimumResourcesExamples,
      [fieldNames.operatingHours]: [industry.typicalOperatingHours]
    }
  } else {
    // Fallback to English examples if translations not available
    examples['BUSINESS_OVERVIEW'] = {
      [fieldNames.businessPurpose]: industry.examples.businessPurpose.map(purpose => 
        localizePlaceholders(purpose, location, locale)
      ),
      [fieldNames.productsAndServices]: industry.examples.productsServices.map(service => 
        localizePlaceholders(service, location, locale)
      ),
      [fieldNames.keyPersonnelInvolved]: industry.examples.keyPersonnel,
      [fieldNames.customerBase]: industry.examples.customerBase.map(base => 
        localizePlaceholders(base, location, locale)
      ),
      [fieldNames.minimumResourceRequirements]: industry.examples.minimumResourcesExamples,
      [fieldNames.operatingHours]: [industry.typicalOperatingHours]
    }
  }

  // Essential Functions examples
  const generalLocalizedExamples = getGeneralLocalizedExamples(locale)
  examples['ESSENTIAL_FUNCTIONS'] = {
    [fieldNames.businessFunctions]: generalLocalizedExamples.essentialFunctions
  }

  // Risk Assessment examples
  examples['RISK_ASSESSMENT'] = {
    [fieldNames.potentialHazards]: generalLocalizedExamples.riskAssessment,
    // Add the auto-generated matrix here
    [fieldNames.riskAssessmentMatrix]: generateRiskAssessmentMatrix(location, industry)
  }

  return examples
}

// Helper function to determine risk score from likelihood and severity
const calculateRiskScore = (likelihood: string, severity: string): number => {
  const likelihoodMap: { [key: string]: number } = {
    'almost_certain': 4,
    'likely': 3,
    'possible': 2,
    'unlikely': 1
  }
  const severityMap: { [key: string]: number } = {
    'catastrophic': 4,
    'major': 3,
    'moderate': 2,
    'minor': 1
  }
  return likelihoodMap[likelihood] * severityMap[severity]
}

// Convert numeric risk score to a qualitative level
const getRiskLevel = (score: number): string => {
  if (score >= 12) return 'Extreme'
  if (score >= 8) return 'High'
  if (score >= 4) return 'Medium'
  return 'Low'
}

// Automatically generate a risk assessment matrix based on location and industry
const generateRiskAssessmentMatrix = (
  location: LocationData, 
  industry: IndustryProfile
): any[] => {
  const locationHazards = calculateLocationRisk(
    location.countryCode, 
    location.parish, 
    location.nearCoast, 
    location.urbanArea
  )

  const industryHazards: HazardRiskLevel[] = industry.vulnerabilities.map(vuln => ({
    hazardId: vuln.hazardId,
    riskLevel: vuln.defaultRiskLevel,
    hazardName: vuln.hazardId.replace(/_/g, ' '), // Provide default hazardName
    frequency: 'possible', // Provide default frequency
    impact: 'moderate', // Provide default impact
  }))

  const combinedHazards: HazardRiskLevel[] = [...locationHazards, ...industryHazards]
  const uniqueHazards = combinedHazards.reduce((acc: HazardRiskLevel[], current) => {
    if (!acc.find(item => item.hazardId === current.hazardId)) {
      acc.push(current)
    }
    return acc
  }, [])

  // Define default likelihood and severity based on risk level
  const riskMappings: { [key: string]: { likelihood: string, severity: string } } = {
    'very_high': { likelihood: 'almost_certain', severity: 'catastrophic' },
    'high': { likelihood: 'likely', severity: 'major' },
    'medium': { likelihood: 'possible', severity: 'moderate' },
    'low': { likelihood: 'unlikely', severity: 'minor' }
  }

  return uniqueHazards.map(hazard => {
    const { likelihood, severity } = riskMappings[hazard.riskLevel] || riskMappings.low
    const riskScore = calculateRiskScore(likelihood, severity)
    const riskLevel = getRiskLevel(riskScore)
    
    return {
      hazard: hazard.hazardId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      likelihood,
      severity,
      riskScore,
      riskLevel
    }
  })
}

// Generate formatted text for action plans
const generateFormattedActionPlanText = (actionPlans: any[]): { 
  prevention: string, 
  response: string, 
  recovery: string,
  implementationPriority: string,
  budgetResources: string,
  implementationTeam: string,
  resourceRequirements: string,
  responsibleParties: string,
  reviewSchedule: string,
  testingPlan: any[]
} => {
  if (!actionPlans || actionPlans.length === 0) {
    return { 
      prevention: '', 
      response: '', 
      recovery: '',
      implementationPriority: '',
      budgetResources: '',
      implementationTeam: '',
      resourceRequirements: '',
      responsibleParties: '',
      reviewSchedule: '',
      testingPlan: []
    }
  }

  const formatSection = (title: string, items: any[], taskField = 'task', detailField = 'responsible') => {
    if (!items || items.length === 0) return ''
    let text = `**${title}**\n`
    text += items.map(item => `- ${item[taskField]} (${detailField}: ${item[detailField]})`).join('\n')
    return text + '\n\n'
  }

  const formatReductionMeasures = (title: string, items: string[]) => {
    if (!items || items.length === 0) return ''
    let text = `**${title}**\n`
    text += items.map(item => `- ${item}`).join('\n')
    return text + '\n\n'
  }

  let preventionText = ''
  let responseText = ''
  let recoveryText = ''

  actionPlans.forEach(plan => {
    preventionText += `**For ${plan.hazard} (${plan.riskLevel} Risk):**\n`
    preventionText += formatReductionMeasures('Long-term Prevention & Risk Reduction', plan.longTermReduction)
    
    responseText += `**For ${plan.hazard} (${plan.riskLevel} Risk):**\n`
    responseText += formatSection('Immediate Actions (0-24 hours)', plan.immediateActions)
    responseText += formatSection('Short-term Actions (1-7 days)', plan.shortTermActions)
    
    recoveryText += `**For ${plan.hazard} (${plan.riskLevel} Risk):**\n`
    recoveryText += formatSection('Medium-term Actions (1-4 weeks)', plan.mediumTermActions, 'task', 'responsible')
  })

  // Generate Implementation Priority based on risk levels
  const highRiskPlans = actionPlans.filter(p => p.riskLevel.toLowerCase().includes('high') || p.riskLevel.toLowerCase().includes('extreme'))
  const mediumRiskPlans = actionPlans.filter(p => p.riskLevel.toLowerCase().includes('medium'))
  
  let implementationPriority = '**Implementation Priority (Risk-Based):**\n\n'
  implementationPriority += '**Phase 1 (Immediate - 0-30 days):**\n'
  highRiskPlans.forEach(plan => {
    implementationPriority += `- ${plan.hazard} response preparations (${plan.riskLevel} risk)\n`
  })
  implementationPriority += '\n**Phase 2 (Short-term - 1-6 months):**\n'
  mediumRiskPlans.forEach(plan => {
    implementationPriority += `- ${plan.hazard} prevention measures (${plan.riskLevel} risk)\n`
  })
  implementationPriority += '\n**Phase 3 (Long-term - 6+ months):**\n'
  actionPlans.forEach(plan => {
    implementationPriority += `- Long-term risk reduction for ${plan.hazard}\n`
  })

  // Generate Budget Resources estimation
  let budgetResources = '**Estimated Budget Requirements:**\n\n'
  budgetResources += '**Immediate Implementation (Phase 1):**\n'
  budgetResources += '- Emergency supplies and equipment: $2,000 - $5,000\n'
  budgetResources += '- Staff training and preparation: $500 - $1,500\n'
  budgetResources += '- Communication systems: $500 - $2,000\n\n'
  budgetResources += '**Medium-term Implementation (Phase 2):**\n'
  budgetResources += '- Infrastructure improvements: $5,000 - $15,000\n'
  budgetResources += '- Technology upgrades: $2,000 - $8,000\n'
  budgetResources += '- Insurance and contracts: $1,000 - $3,000\n\n'
  budgetResources += '**Long-term Investment (Phase 3):**\n'
  budgetResources += '- Major structural improvements: $10,000 - $50,000\n'
  budgetResources += '- Advanced systems and automation: $5,000 - $20,000\n'
  budgetResources += '**Total Estimated Range: $26,000 - $104,500**'

  // Generate Implementation Team structure
  let implementationTeam = '**Implementation Team Structure:**\n\n'
  implementationTeam += '**BCP Coordinator (Primary):**\n'
  implementationTeam += '- Plan Manager or Business Owner\n'
  implementationTeam += '- Overall responsibility for implementation\n'
  implementationTeam += '- Coordinates all phases and team members\n\n'
  implementationTeam += '**Operations Team:**\n'
  implementationTeam += '- Assistant Manager or Senior Staff\n'
  implementationTeam += '- Handles day-to-day implementation tasks\n'
  implementationTeam += '- Manages supply procurement and logistics\n\n'
  implementationTeam += '**Emergency Response Team:**\n'
  implementationTeam += '- All staff members with assigned roles\n'
  implementationTeam += '- Regular training and drill participation\n'
  implementationTeam += '- Specific responsibilities during emergencies'

  // Generate Resource Requirements
  let resourceRequirements = '**Critical Resource Requirements:**\n\n'
  const allResources = new Set()
  actionPlans.forEach(plan => {
    plan.resourcesNeeded?.forEach((resource: string) => allResources.add(resource))
  })
  Array.from(allResources).forEach(resource => {
    resourceRequirements += `- ${resource}\n`
  })

  // Generate Responsible Parties
  let responsibleParties = '**Responsibility Assignment:**\n\n'
  responsibleParties += '**Plan Manager:**\n'
  responsibleParties += '- Overall plan oversight and updates\n'
  responsibleParties += '- Stakeholder communication\n'
  responsibleParties += '- Resource allocation decisions\n\n'
  responsibleParties += '**Operations Team:**\n'
  responsibleParties += '- Daily implementation tasks\n'
  responsibleParties += '- Equipment maintenance and checks\n'
  responsibleParties += '- Staff coordination\n\n'
  responsibleParties += '**All Staff:**\n'
  responsibleParties += '- Individual emergency role training\n'
  responsibleParties += '- Procedure familiarization\n'
  responsibleParties += '- Regular drill participation'

  // Generate Review Schedule
  let reviewSchedule = '**Business Continuity Plan Review Schedule:**\n\n'
  reviewSchedule += '**Monthly Reviews (Ongoing):**\n'
  reviewSchedule += '- Contact information updates\n'
  reviewSchedule += '- Supply inventory checks\n'
  reviewSchedule += '- Equipment functionality tests\n\n'
  reviewSchedule += '**Quarterly Reviews:**\n'
  reviewSchedule += '- Full plan walkthrough\n'
  reviewSchedule += '- Staff training refreshers\n'
  reviewSchedule += '- Risk assessment updates\n\n'
  reviewSchedule += '**Annual Reviews:**\n'
  reviewSchedule += '- Complete plan revision\n'
  reviewSchedule += '- Major risk reassessment\n'
  reviewSchedule += '- Stakeholder feedback integration\n\n'
  reviewSchedule += '**Next Scheduled Review:** ' + new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString()

  // Generate Testing Plan
  const testingPlan = [
    {
      'Scenario': 'Power Outage Simulation',
      'Frequency': 'Quarterly',
      'Duration': '2 hours',
      'Participants': 'All staff',
      'Success Criteria': 'Business continues with backup systems within 30 minutes'
    },
    {
      'Scenario': 'Communication System Failure',
      'Frequency': 'Semi-annually',
      'Duration': '1 hour',
      'Participants': 'Management team',
      'Success Criteria': 'Alternative communication established within 15 minutes'
    },
    {
      'Scenario': 'Key Staff Unavailability',
      'Frequency': 'Annually',
      'Duration': '4 hours',
      'Participants': 'Backup staff',
      'Success Criteria': 'Essential functions maintained with substitute personnel'
    }
  ]

  // Add hazard-specific testing scenarios
  highRiskPlans.forEach(plan => {
    testingPlan.push({
      'Scenario': `${plan.hazard} Response Drill`,
      'Frequency': 'Semi-annually',
      'Duration': '3 hours',
      'Participants': 'All staff',
      'Success Criteria': `${plan.hazard} procedures executed successfully within target timeframes`
    })
  })
  
  return { 
    prevention: preventionText, 
    response: responseText, 
    recovery: recoveryText,
    implementationPriority,
    budgetResources,
    implementationTeam,
    resourceRequirements,
    responsibleParties,
    reviewSchedule,
    testingPlan
  }
}

// Generate auto-selected strategies based on action plans and business type
const generateAutoSelectedStrategies = (actionPlans: any[], businessType: string): {
  prevention: string[],
  response: string[],
  recovery: string[]
} => {
  const strategies = {
    prevention: [] as string[],
    response: [] as string[],
    recovery: [] as string[]
  }

  // Base strategies for all businesses
  strategies.prevention.push('insurance', 'employee_training', 'emergency_supplies')
  strategies.response.push('emergency_team', 'safety_procedures', 'emergency_communication')
  strategies.recovery.push('damage_assessment', 'business_resumption', 'lessons_learned')

  // Add strategies based on detected hazards
  const hazardTypes = actionPlans.map(plan => plan.hazard.toLowerCase())
  
  if (hazardTypes.some(h => h.includes('power') || h.includes('outage'))) {
    strategies.prevention.push('maintenance')
    strategies.response.push('essential_operations')
    strategies.recovery.push('equipment_replacement')
  }
  
  if (hazardTypes.some(h => h.includes('hurricane') || h.includes('storm') || h.includes('flood'))) {
    strategies.prevention.push('building_upgrades')
    strategies.response.push('closure_procedures')
    strategies.recovery.push('facility_repair')
  }
  
  if (hazardTypes.some(h => h.includes('cyber') || h.includes('data'))) {
    strategies.prevention.push('cybersecurity', 'data_backup')
    strategies.response.push('alternative_locations')
    strategies.recovery.push('reputation_management')
  }

  // Business type specific strategies
  if (businessType === 'retail') {
    strategies.prevention.push('physical_security', 'supplier_diversity')
    strategies.response.push('emergency_inventory', 'customer_continuity')
    strategies.recovery.push('customer_retention', 'supplier_restoration')
  } else if (businessType === 'hospitality' || businessType === 'tourism') {
    strategies.prevention.push('community_partnerships')
    strategies.response.push('media_management', 'customer_continuity')
    strategies.recovery.push('customer_retention', 'reputation_management')
  } else if (businessType === 'services') {
    strategies.prevention.push('data_backup', 'supplier_diversity')
    strategies.response.push('remote_work', 'alternative_locations')
    strategies.recovery.push('employee_support', 'customer_retention')
  }

  return strategies
}

// Main function to generate all pre-fill data
export const generatePreFillData = (
  industryId: string,
  location: LocationData,
  locale: string = 'en',
  translations: any = null
): PreFillData | null => {
  const industry = getIndustryProfile(industryId)
  if (!industry) return null

  const contextualExamples = generateContextualExamples(industry, location, locale, translations)
  
  const riskMatrix = generateRiskAssessmentMatrix(location, industry)
  const businessOverview = {
    'Business Purpose': industry.examples.businessPurpose[0],
    'Products & Services': industry.examples.productsServices[0]
  }

  const actionPlans = generateSmartActionPlans({
    BUSINESS_OVERVIEW: businessOverview,
    RISK_ASSESSMENT: { 'Risk Assessment Matrix': riskMatrix }
  })
  
  const formattedPlans = generateFormattedActionPlanText(actionPlans)
  const autoSelectedStrategies = generateAutoSelectedStrategies(actionPlans, industry.category)

  return {
    industry,
    location,
    hazards: riskMatrix, // Use the generated matrix
    preFilledFields: {
      BUSINESS_OVERVIEW: {
        'Business Purpose': contextualExamples.BUSINESS_OVERVIEW?.['Business Purpose']?.[0] || '',
        'Products and Services': contextualExamples.BUSINESS_OVERVIEW?.['Products and Services']?.[0] || '',
        'Key Personnel Involved': contextualExamples.BUSINESS_OVERVIEW?.['Key Personnel Involved']?.[0] || '',
        'Operating Hours': contextualExamples.BUSINESS_OVERVIEW?.['Operating Hours']?.[0] || '',
        'Minimum Resource Requirements': contextualExamples.BUSINESS_OVERVIEW?.['Minimum Resource Requirements']?.[0] || '',
        'Customer Base': contextualExamples.BUSINESS_OVERVIEW?.['Customer Base']?.[0] || ''
      },
      ESSENTIAL_FUNCTIONS: {
        'Business Functions': Object.values(getLocalizedBusinessFunctions(locale)).map(bf => {
          return `${bf.function} - ${bf.description} - Priority: ${bf.priority}, Downtime: ${bf.downtime}, Resources: ${bf.resources}`
        }).join('\n\n')
      },
      RISK_ASSESSMENT: {
        'Risk Assessment Matrix': riskMatrix,
      },
      STRATEGIES: {
        'Business Continuity Strategies': [
          ...autoSelectedStrategies.prevention,
          ...autoSelectedStrategies.response, 
          ...autoSelectedStrategies.recovery
        ],
        'Long-term Risk Reduction Measures': formattedPlans.prevention
      },
      ACTION_PLAN: {
        'Smart Action Plan Generator': actionPlans,
        'Implementation Priority': formattedPlans.implementationPriority,
        'Budget and Resource Requirements': formattedPlans.budgetResources,
        'Implementation Team Structure': formattedPlans.implementationTeam,
        'Resource Requirements': formattedPlans.resourceRequirements,
        'Responsible Parties': formattedPlans.responsibleParties,
        'Review and Update Schedule': formattedPlans.reviewSchedule,
        'Testing and Drill Plan': formattedPlans.testingPlan
      }
    },
    contextualExamples,
    recommendedStrategies: { prevention: [], response: [], recovery: [] }, // This is now handled by the formatted plans
  }
}

// Helper function to merge pre-fill data with existing form data
export const mergePreFillData = (existingData: any, preFillData: PreFillData) => {
  const mergedData = { ...existingData }

  Object.keys(preFillData.preFilledFields).forEach(stepId => {
    if (!mergedData[stepId]) {
      mergedData[stepId] = {}
    }

    Object.keys(preFillData.preFilledFields[stepId]).forEach(fieldName => {
      // Only pre-fill if the field is empty
      if (!mergedData[stepId][fieldName] || mergedData[stepId][fieldName] === '') {
        mergedData[stepId][fieldName] = preFillData.preFilledFields[stepId][fieldName]
      }
    })
  })

  return mergedData
}

// Helper function to check if a field was pre-filled
export const isFieldPreFilled = (
  stepId: string,
  fieldName: string,
  currentValue: any,
  preFillData: PreFillData | null
): boolean => {
  if (!preFillData || !preFillData.preFilledFields[stepId] || !preFillData.preFilledFields[stepId][fieldName]) {
    return false
  }
  const preFillValue = preFillData.preFilledFields[stepId][fieldName]

  if (currentValue === preFillValue) {
    return true
  }

  // Handle case where pre-fill is an array of objects (like risk matrix)
  if (Array.isArray(preFillValue) && Array.isArray(currentValue)) {
    // A simple JSON.stringify comparison is sufficient for this use case
    return JSON.stringify(preFillValue) === JSON.stringify(currentValue)
  }
  
  // For risk matrix, check if it's an array and has items
  if (fieldName.toLowerCase().includes('matrix')) {
    return Array.isArray(preFillValue) && preFillValue.length > 0
  }
  
  return preFillValue && preFillValue.trim() !== ''
} 
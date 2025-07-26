import { LocationData, PreFillData, IndustryProfile } from '../data/types'
import { getIndustryProfile } from '../data/industryProfiles'
import { calculateLocationRisk } from '../data/hazardMappings'

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
    [fieldNames.potentialHazards]: generalLocalizedExamples.riskAssessment
  }

  return examples
}

// Generate recommended strategies based on identified risks and industry
const generateRecommendedStrategies = (industry: IndustryProfile, hazards: any[], location: LocationData, locale: string = 'en') => {
  const strategies = {
    prevention: [] as string[],
    response: [] as string[],
    recovery: [] as string[]
  }

  const localizedStrategies = getLocalizedStrategies(locale)

  // Industry-specific prevention strategies
  switch (industry.category) {
    case 'retail':
      strategies.prevention.push(...localizedStrategies.retail.prevention)
      break
    case 'hospitality':
      strategies.prevention.push(...localizedStrategies.hospitality.prevention)
      break
    case 'services':
      strategies.prevention.push(...localizedStrategies.services.prevention)
      break
  }

  // Location-specific strategies
  if (location.nearCoast) {
    strategies.prevention.push(localizedStrategies.coastal.prevention)
    strategies.response.push(localizedStrategies.coastal.response)
  }

  if (location.urbanArea) {
    strategies.prevention.push(localizedStrategies.urban.prevention)
    strategies.response.push(localizedStrategies.urban.response)
  }

  // Hazard-specific strategies
  hazards.forEach(hazard => {
    switch (hazard.hazardId) {
      case 'hurricane':
        strategies.prevention.push('Secure outdoor signage and equipment before storm season')
        strategies.response.push('Activate storm closure procedures and secure premises')
        strategies.recovery.push('Assess structural damage before reopening operations')
        break
      case 'power_outage':
        strategies.prevention.push('Install surge protectors and backup power systems')
        strategies.response.push('Switch to manual processes and backup communications')
        strategies.recovery.push('Check all electronic equipment before resuming normal operations')
        break
      case 'flash_flood':
        strategies.prevention.push('Elevate critical equipment and inventory above flood levels')
        strategies.response.push('Move inventory to higher levels and cease electrical operations')
        strategies.recovery.push('Thoroughly dry and disinfect affected areas before reopening')
        break
    }
  })

  return strategies
}

// Main function to generate pre-fill data
export const generatePreFillData = (
  industryId: string,
  location: LocationData,
  locale: string = 'en',
  translations: any = null
): PreFillData | null => {
  const industry = getIndustryProfile(industryId)
  if (!industry) return null

  const fieldNames = getLocalizedFieldNames(locale)
  const businessFunctions = getLocalizedBusinessFunctions(locale)

  // Get localized examples from translation system
  const localizedExamples = getLocalizedExamples(industryId, locale, translations)

  // Calculate location-based hazards
  const locationHazards = calculateLocationRisk(
    location.countryCode,
    location.parish,
    location.nearCoast,
    location.urbanArea
  )

  // Combine industry and location hazards
  const allHazards = [
    ...locationHazards,
    // Add industry-specific hazards that might not be location-based
    ...industry.commonHazards
      .filter(hazardName => !locationHazards.some(h => h.hazardId === hazardName))
      .map(hazardName => ({
        hazardId: hazardName,
        hazardName: hazardName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        riskLevel: 'medium' as const,
        frequency: 'possible' as const,
        impact: 'moderate' as const
      }))
  ]

  // Generate pre-filled form fields using localized examples
  const preFilledFields: { [stepId: string]: { [fieldName: string]: any } } = {}

  // Business Overview pre-fills - using localized field names and examples
  const businessOverviewData: any = {}
  
  if (localizedExamples) {
    Object.assign(businessOverviewData, {
      [fieldNames.businessPurpose]: localizedExamples.businessPurpose[0] ? 
        localizePlaceholders(localizedExamples.businessPurpose[0], location, locale) : '',
      [fieldNames.productsAndServices]: localizedExamples.productsServices[0] ? 
        localizePlaceholders(localizedExamples.productsServices[0], location, locale) : '',
      [fieldNames.keyPersonnelInvolved]: localizedExamples.keyPersonnel[0] || '',
      [fieldNames.operatingHours]: industry.typicalOperatingHours,
      [fieldNames.minimumResourceRequirements]: localizedExamples.minimumResourcesExamples[0] || '',
      [fieldNames.customerBase]: localizedExamples.customerBase[0] ? 
        localizePlaceholders(localizedExamples.customerBase[0], location, locale) : '',
    })
  } else {
    // Fallback to English examples
    Object.assign(businessOverviewData, {
      [fieldNames.businessPurpose]: industry.examples.businessPurpose[0] ? 
        localizePlaceholders(industry.examples.businessPurpose[0], location, locale) : '',
      [fieldNames.productsAndServices]: industry.examples.productsServices[0] ? 
        localizePlaceholders(industry.examples.productsServices[0], location, locale) : '',
      [fieldNames.keyPersonnelInvolved]: industry.examples.keyPersonnel[0] || '',
      [fieldNames.operatingHours]: industry.typicalOperatingHours,
      [fieldNames.minimumResourceRequirements]: industry.examples.minimumResourcesExamples[0] || '',
      [fieldNames.customerBase]: industry.examples.customerBase[0] ? 
        localizePlaceholders(industry.examples.customerBase[0], location, locale) : '',
    })
  }
  
  // Add business type and location data in the exact format needed
  businessOverviewData['Industry Type'] = industry.id
  businessOverviewData['business_type'] = industry.id
  businessOverviewData['Country'] = location.country
  businessOverviewData['Parish'] = location.parish || ''
  businessOverviewData['Near Coast'] = location.nearCoast
  businessOverviewData['Urban Area'] = location.urbanArea
  
  preFilledFields['BUSINESS_OVERVIEW'] = businessOverviewData

  // Risk Assessment pre-fills
  preFilledFields['RISK_ASSESSMENT'] = {
    [fieldNames.potentialHazards]: allHazards.map(hazard => hazard.hazardId),
    [fieldNames.riskAssessmentMatrix]: allHazards.map(hazard => ({
      hazard: hazard.hazardId,
      likelihood: hazard.frequency === 'rare' ? '1' : 
                  hazard.frequency === 'unlikely' ? '2' : 
                  hazard.frequency === 'possible' ? '3' : 
                  hazard.frequency === 'likely' ? '4' : 
                  hazard.frequency === 'almost_certain' ? '4' : '',
      severity: hazard.impact === 'minimal' ? '1' : 
                hazard.impact === 'minor' ? '2' : 
                hazard.impact === 'moderate' ? '3' : 
                hazard.impact === 'major' ? '4' : 
                hazard.impact === 'catastrophic' ? '4' : '',
      riskLevel: '',
      riskScore: 0,
      planningMeasures: `${getLocalizedStrategies(locale).implementPrevention} ${hazard.hazardId.replace(/_/g, ' ')}`
    }))
  }

  // Essential Functions pre-fills
  preFilledFields['ESSENTIAL_FUNCTIONS'] = {
    [fieldNames.businessFunctions]: [
      {
        [fieldNames.businessFunction]: businessFunctions.customerService.function,
        [fieldNames.description]: businessFunctions.customerService.description,
        [fieldNames.priorityLevel]: businessFunctions.customerService.priority,
        [fieldNames.maximumAcceptableDowntime]: businessFunctions.customerService.downtime,
        [fieldNames.criticalResourcesNeeded]: businessFunctions.customerService.resources
      },
      {
        [fieldNames.businessFunction]: businessFunctions.inventoryManagement.function,
        [fieldNames.description]: businessFunctions.inventoryManagement.description,
        [fieldNames.priorityLevel]: businessFunctions.inventoryManagement.priority,
        [fieldNames.maximumAcceptableDowntime]: businessFunctions.inventoryManagement.downtime,
        [fieldNames.criticalResourcesNeeded]: businessFunctions.inventoryManagement.resources
      },
      {
        [fieldNames.businessFunction]: businessFunctions.supplierRelationships.function,
        [fieldNames.description]: businessFunctions.supplierRelationships.description,
        [fieldNames.priorityLevel]: businessFunctions.supplierRelationships.priority,
        [fieldNames.maximumAcceptableDowntime]: businessFunctions.supplierRelationships.downtime,
        [fieldNames.criticalResourcesNeeded]: businessFunctions.supplierRelationships.resources
      }
    ]
  }

  // Generate contextual examples
  const contextualExamples = generateContextualExamples(industry, location, locale, translations)

  // Generate recommended strategies
  const recommendedStrategies = generateRecommendedStrategies(industry, allHazards, location, locale)

  // Store the generated data for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[PreFill Service]: Pre-fill data generated', {
      industryId,
      location: location.parish,
      locale,
      fieldsGenerated: Object.keys(preFilledFields).length,
      examplesGenerated: Object.keys(contextualExamples).length
    })
  }

  return {
    industry,
    location,
    hazards: allHazards,
    preFilledFields,
    contextualExamples,
    recommendedStrategies
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
  if (!preFillData?.preFilledFields[stepId]?.[fieldName]) return false
  
  const preFillValue = preFillData.preFilledFields[stepId][fieldName]
  
  // Handle different value types
  if (Array.isArray(preFillValue) && Array.isArray(currentValue)) {
    return JSON.stringify(preFillValue) === JSON.stringify(currentValue)
  }
  
  return preFillValue === currentValue
} 
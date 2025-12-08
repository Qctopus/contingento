/**
 * RANDOM WIZARD FILLER
 * Randomly selects location, business type, and multiplier answers
 * Then fills all wizard questions with sample data for testing
 */

(async function fillWizardRandom() {
  // Get locale from global variable set by DevDataFiller
  const locale = window.__WIZARD_LOCALE__ || 'en'
  console.log(`🎲 Starting random wizard fill for locale: ${locale}...`)

  // Translations for sample data
  const TRANSLATIONS = {
    en: {
      companyName: 'Sample',
      businessPurpose: 'business providing quality products and services to the local community.',
      products: 'Various products and services tailored to customer needs.',
      delivery: 'In-person service delivery at physical location.',
      keyPersonnel: 'Owner, Manager, and key staff members.',
      resources: 'Essential equipment, staff, and supplies needed for operations.',
      customers: 'Local customers and community members.',
      coreOps: 'Core Operations',
      coreOpsDesc: 'Primary business operations',
      custService: 'Customer Service',
      custServiceDesc: 'Customer interaction and support',
      commPlan: 'Use phone, email, and text messaging for emergency communications.',
      evacPlan: 'Follow local emergency evacuation procedures.',
      primaryLoc: 'Primary Location',
      mainLocNote: 'Main business location',
      ownerPos: 'Owner/Manager',
      asstPos: 'Assistant Manager',
      mainCust: 'Primary Customer',
      mainCustNote: 'Main customer - regular orders',
      mainSupp: 'Main Supplier',
      mainSuppGoods: 'Primary supplies and materials',
      equipSupp: 'Equipment Supplier',
      equipSuppGoods: 'Business equipment and maintenance',
      finRecords: 'Financial Records',
      empRecords: 'Employee Records',
      bizReg: 'Business Registration and Licenses',
      insPolicies: 'Insurance Policies',
      custDb: 'Customer Database',
      suppContracts: 'Supplier Contracts',
      emergContacts: 'Emergency Contact Lists',
      taxRecords: 'Tax Records',
      testTabletop: 'Tabletop exercise',
      testTabletopDesc: 'Emergency response coordination',
      testComm: 'Communication test',
      testCommDesc: 'Emergency notification system',
      testSim: 'Full simulation',
      testSimDesc: 'Complete emergency scenario',
      revChange: 'Initial business continuity plan creation',
      revReason: 'New comprehensive business continuity plan',
      trainEmerg: 'Emergency Procedures',
      trainBcp: 'Business Continuity Basics',
      metricRto: 'Recovery Time Objective (RTO)',
      improvDrills: 'Communication drills',
      improvAction: 'Increase drill frequency; add SMS fallback'
    },
    es: {
      companyName: 'Ejemplo',
      businessPurpose: 'negocio que ofrece productos y servicios de calidad a la comunidad local.',
      products: 'Varios productos y servicios adaptados a las necesidades del cliente.',
      delivery: 'Entrega de servicios en persona en la ubicación física.',
      keyPersonnel: 'Propietario, Gerente y personal clave.',
      resources: 'Equipo esencial, personal y suministros necesarios para las operaciones.',
      customers: 'Clientes locales y miembros de la comunidad.',
      coreOps: 'Operaciones Principales',
      coreOpsDesc: 'Operaciones comerciales primarias',
      custService: 'Servicio al Cliente',
      custServiceDesc: 'Interacción y soporte al cliente',
      commPlan: 'Utilizar teléfono, correo electrónico y mensajes de texto para comunicaciones de emergencia.',
      evacPlan: 'Seguir los procedimientos locales de evacuación de emergencia.',
      primaryLoc: 'Ubicación Principal',
      mainLocNote: 'Ubicación comercial principal',
      ownerPos: 'Propietario/Gerente',
      asstPos: 'Subgerente',
      mainCust: 'Cliente Principal',
      mainCustNote: 'Cliente principal - pedidos regulares',
      mainSupp: 'Proveedor Principal',
      mainSuppGoods: 'Suministros y materiales primarios',
      equipSupp: 'Proveedor de Equipos',
      equipSuppGoods: 'Equipos comerciales y mantenimiento',
      finRecords: 'Registros Financieros',
      empRecords: 'Registros de Empleados',
      bizReg: 'Registro Comercial y Licencias',
      insPolicies: 'Pólizas de Seguro',
      custDb: 'Base de Datos de Clientes',
      suppContracts: 'Contratos con Proveedores',
      emergContacts: 'Listas de Contactos de Emergencia',
      taxRecords: 'Registros Fiscales',
      testTabletop: 'Ejercicio de mesa',
      testTabletopDesc: 'Coordinación de respuesta a emergencias',
      testComm: 'Prueba de comunicación',
      testCommDesc: 'Sistema de notificación de emergencia',
      testSim: 'Simulacro completo',
      testSimDesc: 'Escenario de emergencia completo',
      revChange: 'Creación inicial del plan de continuidad del negocio',
      revReason: 'Nuevo plan integral de continuidad del negocio',
      trainEmerg: 'Procedimientos de Emergencia',
      trainBcp: 'Conceptos Básicos de Continuidad',
      metricRto: 'Objetivo de Tiempo de Recuperación (RTO)',
      improvDrills: 'Simulacros de comunicación',
      improvAction: 'Aumentar frecuencia de simulacros; añadir respaldo SMS'
    },
    fr: {
      companyName: 'Exemple',
      businessPurpose: 'entreprise fournissant des produits et services de qualité à la communauté locale.',
      products: 'Divers produits et services adaptés aux besoins des clients.',
      delivery: 'Prestation de services en personne sur le site physique.',
      keyPersonnel: 'Propriétaire, Gérant et personnel clé.',
      resources: 'Équipement essentiel, personnel et fournitures nécessaires aux opérations.',
      customers: 'Clients locaux et membres de la communauté.',
      coreOps: 'Opérations Principales',
      coreOpsDesc: 'Opérations commerciales primarias',
      custService: 'Service Client',
      custServiceDesc: 'Interaction et support client',
      commPlan: 'Utiliser le téléphone, l\'e-mail et les SMS pour les communications d\'urgence.',
      evacPlan: 'Suivre les procédures locales d\'évacuation d\'urgence.',
      primaryLoc: 'Emplacement Principal',
      mainLocNote: 'Emplacement commercial principal',
      ownerPos: 'Propriétaire/Gérant',
      asstPos: 'Assistant Gérant',
      mainCust: 'Client Principal',
      mainCustNote: 'Client principal - commandes régulières',
      mainSupp: 'Fournisseur Principal',
      mainSuppGoods: 'Fournitures et matériaux primaires',
      equipSupp: 'Fournisseur d\'Équipement',
      equipSuppGoods: 'Équipement commercial et maintenance',
      finRecords: 'Dossiers Financiers',
      empRecords: 'Dossiers des Employés',
      bizReg: 'Enregistrement Commercial et Licences',
      insPolicies: 'Polices d\'Assurance',
      custDb: 'Base de Données Clients',
      suppContracts: 'Contrats Fournisseurs',
      emergContacts: 'Listes de Contacts d\'Urgence',
      taxRecords: 'Dossiers Fiscaux',
      testTabletop: 'Exercice sur table',
      testTabletopDesc: 'Coordination de la réponse d\'urgence',
      testComm: 'Test de communication',
      testCommDesc: 'Système de notification d\'urgence',
      testSim: 'Simulation complète',
      testSimDesc: 'Scénario d\'urgence complet',
      revChange: 'Création initiale du plan de continuité des activités',
      revReason: 'Nouveau plan complet de continuité des activités',
      trainEmerg: 'Procédures d\'Urgence',
      trainBcp: 'Bases de la Continuité des Activités',
      metricRto: 'Objectif de Temps de Récupération (RTO)',
      improvDrills: 'Exercices de communication',
      improvAction: 'Augmenter la fréquence des exercices; ajouter secours SMS'
    }
  }

  // Key translations for form fields
  const KEY_TRANSLATIONS = {
    es: {
      // PLAN_INFORMATION
      'Company Name': 'Nombre de la Empresa',
      'Business Address': 'Dirección del Negocio',
      'Plan Manager': 'Gerente del Plan',
      'Alternate Manager': 'Gerente Alterno',
      'Physical Plan Location': 'Ubicación Física del Plan',
      'Digital Plan Location': 'Ubicación Digital del Plan',
      'Plan Version': 'Versión del Plan',
      'Next Review Date': 'Próxima Fecha de Revisión',
      // BUSINESS_OVERVIEW
      'Business License Number': 'Número de Licencia Comercial',
      'Business Purpose': 'Propósito del Negocio',
      'Products and Services': 'Productos y Servicios Clave',
      'Service Delivery Methods': 'Métodos de Entrega de Servicios',
      'Operating Hours': 'Horario de Operación',
      'Key Personnel Involved': 'Personal Clave Involucrado',
      'Minimum Resource Requirements': 'Requisitos Mínimos de Recursos',
      'Customer Base': 'Base de Clientes',
      'Approximate Annual Revenue': 'Ingresos Anuales Aproximados',
      'Total People in Business': 'Total de Personas en el Negocio',
      'Years in Operation': 'Años en Operación',
      'Service Provider BCP Status': 'Estado de BCP del Proveedor de Servicios',
      // ESSENTIAL_FUNCTIONS
      'Business Functions': 'Funciones de Negocio',
      'Business Function': 'Función de Negocio',
      'Description': 'Descripción',
      'Priority Level': 'Nivel de Prioridad',
      'Maximum Acceptable Downtime': 'Tiempo de Inactividad Máximo Aceptable',
      'Critical Resources Needed': 'Recursos Críticos Necesarios',
      // CONTACTS_AND_INFORMATION
      'Staff Contact Information': 'Información de Contacto del Personal',
      'Key Customer Contacts': 'Contactos de Clientes Clave',
      'Supplier Information': 'Información de Proveedores',
      'Emergency Services and Utilities': 'Servicios de Emergencia y Servicios Públicos',
      'Critical Business Information': 'Información Crítica del Negocio',
      'Plan Distribution List': 'Lista de Distribución del Plan',
      // VITAL_RECORDS
      'Vital Records Inventory': 'Inventario de Registros Vitales',
      // TESTING_AND_MAINTENANCE
      'Plan Testing Schedule': 'Cronograma de Pruebas del Plan',
      'Training Schedule': 'Cronograma de Capacitación',
      'Performance Metrics': 'Métricas de Desempeño',
      'Plan Revision History': 'Historial de Revisiones del Plan',
      'Improvement Tracking': 'Seguimiento de Mejoras',
      'Annual Review Process': 'Proceso de Revisión Anual',
      'Trigger Events for Plan Updates': 'Eventos Desencadenantes para Actualizaciones del Plan'
    },
    fr: {
      // PLAN_INFORMATION
      'Company Name': 'Nom de l\'Entreprise',
      'Business Address': 'Adresse de l\'Entreprise',
      'Plan Manager': 'Responsable du Plan',
      'Alternate Manager': 'Responsable Suppléant',
      'Physical Plan Location': 'Emplacement Physique du Plan',
      'Digital Plan Location': 'Emplacement Numérique du Plan',
      'Plan Version': 'Version du Plan',
      'Next Review Date': 'Prochaine Date de Révision',
      // BUSINESS_OVERVIEW
      'Business License Number': 'Numéro de Licence Commerciale',
      'Business Purpose': 'Objectif de l\'Entreprise',
      'Products and Services': 'Produits et Services Clés',
      'Service Delivery Methods': 'Méthodes de Prestation de Service',
      'Operating Hours': 'Heures d\'Ouverture',
      'Key Personnel Involved': 'Personnel Clé Impliqué',
      'Minimum Resource Requirements': 'Exigences Minimales en Ressources',
      'Customer Base': 'Base de Clientèle',
      'Approximate Annual Revenue': 'Revenu Annuel Approximatif',
      'Total People in Business': 'Total de Personnes dans l\'Entreprise',
      'Years in Operation': 'Années d\'Activité',
      'Service Provider BCP Status': 'Statut PCA du Fournisseur de Services',
      // ESSENTIAL_FUNCTIONS
      'Business Functions': 'Fonctions de l\'Entreprise',
      'Business Function': 'Fonction de l\'Entreprise',
      'Description': 'Description',
      'Priority Level': 'Niveau de Priorité',
      'Maximum Acceptable Downtime': 'Temps d\'Arrêt Maximum Acceptable',
      'Critical Resources Needed': 'Ressources Critiques Nécessaires',
      // CONTACTS_AND_INFORMATION
      'Staff Contact Information': 'Informations de Contact du Personnel',
      'Key Customer Contacts': 'Contacts Clients Clés',
      'Supplier Information': 'Informations Fournisseurs',
      'Emergency Services and Utilities': 'Services d\'Urgence et Utilités',
      'Critical Business Information': 'Informations Critiques de l\'Entreprise',
      'Plan Distribution List': 'Lista de Distribution du Plan',
      // VITAL_RECORDS
      'Vital Records Inventory': 'Inventario des Documents Vitaux',
      // TESTING_AND_MAINTENANCE
      'Plan Testing Schedule': 'Calendrier de Test du Plan',
      'Training Schedule': 'Calendrier de Formation',
      'Performance Metrics': 'Métriques de Performance',
      'Plan Revision History': 'Historique des Révisions du Plan',
      'Improvement Tracking': 'Suivi des Améliorations',
      'Annual Review Process': 'Processus de Révision Annuelle',
      'Trigger Events for Plan Updates': 'Événements Déclencheurs pour Mises à Jour Plan'
    }
  }

  const k = (key) => {
    if (locale === 'en') return key
    const map = KEY_TRANSLATIONS[locale]
    return (map && map[key]) ? map[key] : key
  }

  const t = (key) => {
    const lang = TRANSLATIONS[locale] || TRANSLATIONS['en']
    return lang[key] || TRANSLATIONS['en'][key] || key
  }

  try {
    // Step 1: Fetch available data
    console.log(`📡 Fetching available options for locale: ${locale}...`)
    const businessTypesUrl = `/api/admin2/business-types?locale=${locale}`
    console.log(`  Fetching: ${businessTypesUrl}`)

    const [businessTypesRes, countriesRes, multipliersRes] = await Promise.all([
      fetch(businessTypesUrl),
      fetch(`/api/admin2/countries?activeOnly=true&locale=${locale}`),
      fetch(`/api/admin2/multipliers?activeOnly=true&locale=${locale}`)
    ])

    console.log(`  Response statuses: BT=${businessTypesRes.status}, Countries=${countriesRes.status}, Multipliers=${multipliersRes.status}`)

    if (!businessTypesRes.ok) {
      throw new Error(`Business types API failed: ${businessTypesRes.status}`)
    }
    if (!countriesRes.ok) {
      throw new Error(`Countries API failed: ${countriesRes.status}`)
    }
    if (!multipliersRes.ok) {
      console.warn(`⚠️ Multipliers API failed: ${multipliersRes.status}, continuing without multipliers`)
    }

    const businessTypes = await businessTypesRes.json()
    const countriesData = await countriesRes.json()
    const multipliersData = multipliersRes.ok ? await multipliersRes.json() : { success: false, data: [] }

    // Handle different response formats
    let businessTypesList = []
    if (businessTypes.success && Array.isArray(businessTypes.data)) {
      businessTypesList = businessTypes.data
    } else if (Array.isArray(businessTypes)) {
      businessTypesList = businessTypes
    } else if (businessTypes.data && Array.isArray(businessTypes.data)) {
      businessTypesList = businessTypes.data
    }

    let countries = []
    if (countriesData.success && Array.isArray(countriesData.data)) {
      countries = countriesData.data
    } else if (Array.isArray(countriesData)) {
      countries = countriesData
    } else if (countriesData.countries && Array.isArray(countriesData.countries)) {
      countries = countriesData.countries
    }

    let multipliers = []
    if (multipliersData.success) {
      multipliers = multipliersData.data || multipliersData.multipliers || []
    } else if (Array.isArray(multipliersData)) {
      multipliers = multipliersData
    } else if (multipliersData.multipliers && Array.isArray(multipliersData.multipliers)) {
      multipliers = multipliersData.multipliers
    }

    if (!businessTypesList || businessTypesList.length === 0) {
      throw new Error('No business types available. Please ensure business types are seeded in the database.')
    }
    if (!countries || countries.length === 0) {
      throw new Error('No countries available. Please ensure countries are seeded in the database.')
    }

    console.log(`📊 Found ${businessTypesList.length} business types, ${countries.length} countries, ${multipliers.length} multipliers`)

    // Step 2: Randomly select business type
    const randomBusinessType = businessTypesList[Math.floor(Math.random() * businessTypesList.length)]
    console.log(`✅ Selected business type: ${randomBusinessType.name} (${randomBusinessType.businessTypeId})`)

    // Step 3: Randomly select country and parish
    const randomCountry = countries[Math.floor(Math.random() * countries.length)]
    console.log(`✅ Selected country: ${randomCountry.name} (${randomCountry.code})`)

    // Fetch admin units for this country
    const adminUnitsRes = await fetch(`/api/admin2/admin-units?countryId=${randomCountry.id}&activeOnly=true&locale=${locale}`)
    const adminUnitsData = await adminUnitsRes.json()
    const adminUnits = adminUnitsData.success ? adminUnitsData.data : adminUnitsData

    let selectedParish = null
    let selectedAdminUnit = null

    if (adminUnits && adminUnits.length > 0) {
      selectedAdminUnit = adminUnits[Math.floor(Math.random() * adminUnits.length)]
      selectedParish = selectedAdminUnit.name
      console.log(`✅ Selected parish: ${selectedParish}`)
    } else {
      console.log('⚠️ No parishes found, using country name')
      selectedParish = randomCountry.name
    }

    // Randomly determine coastal and urban
    const nearCoast = Math.random() > 0.5
    const urbanArea = Math.random() > 0.5

    const location = {
      country: randomCountry.name,
      countryCode: randomCountry.code,
      parish: selectedParish,
      nearCoast: nearCoast,
      urbanArea: urbanArea
    }

    console.log(`📍 Location: ${location.parish}, ${location.country} (Coastal: ${nearCoast}, Urban: ${urbanArea})`)

    // Step 4: Randomly answer multiplier questions
    const businessCharacteristics = {}

    // Filter multipliers that have wizard questions
    const multipliersWithQuestions = (multipliers || []).filter(m => m && m.wizardQuestion && m.isActive)
    console.log(`📋 Found ${multipliersWithQuestions.length} multiplier questions`)

    for (const multiplier of multipliersWithQuestions) {
      const charType = multiplier.characteristicType
      const conditionType = multiplier.conditionType

      if (conditionType === 'boolean') {
        // Random boolean
        businessCharacteristics[charType] = Math.random() > 0.5
      } else if (conditionType === 'threshold') {
        // Random number above threshold
        const threshold = multiplier.thresholdValue || 50
        businessCharacteristics[charType] = Math.floor(Math.random() * (100 - threshold + 1)) + threshold
      } else if (conditionType === 'range') {
        // Random number in range
        const min = multiplier.minValue || 0
        const max = multiplier.maxValue || 100
        businessCharacteristics[charType] = Math.floor(Math.random() * (max - min + 1)) + min
      }
    }

    // Add location characteristics
    businessCharacteristics.location_coastal = nearCoast
    businessCharacteristics.location_urban = urbanArea
    businessCharacteristics.location_flood_prone = Math.random() > 0.7

    console.log(`✅ Answered ${Object.keys(businessCharacteristics).length} multiplier questions`)

    // Step 5: Call prepare-prefill-data API
    console.log('📡 Calling prepare-prefill-data API...')
    const prefillResponse = await fetch('/api/wizard/prepare-prefill-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessTypeId: randomBusinessType.businessTypeId,
        location: location,
        businessCharacteristics: businessCharacteristics,
        locale: locale
      })
    })

    if (!prefillResponse.ok) {
      throw new Error(`Prefill API failed: ${prefillResponse.status}`)
    }

    const preFillData = await prefillResponse.json()
    console.log('✅ Prefill data generated')

    // Step 6: Build full form data
    console.log('🏗️ Building form data...')

    // Clone to avoid mutating the original preFillData structure
    const formData = JSON.parse(JSON.stringify(preFillData.preFilledFields || {}))

    const ensureStep = (step) => {
      if (!formData[step]) formData[step] = {}
    }

    // Ensure steps exist before assigning fields
    ['PLAN_INFORMATION', 'BUSINESS_OVERVIEW', 'ESSENTIAL_FUNCTIONS', 'FUNCTION_PRIORITIES', 'RISK_ASSESSMENT', 'STRATEGIES', 'CONTACTS_AND_INFORMATION', 'VITAL_RECORDS', 'TESTING_AND_MAINTENANCE'].forEach(ensureStep)

    console.log('  Steps ensured. Populating PLAN_INFORMATION...')

    // PLAN INFORMATION
    try {
      formData.PLAN_INFORMATION = {
        ...formData.PLAN_INFORMATION,
        [k('Company Name')]: `${t('companyName')} ${randomBusinessType.name}`,
        [k('Business Address')]: `123 Main Street, ${location.parish}, ${location.country}`,
        [k('Plan Manager')]: 'John Smith, ' + t('ownerPos'),
        [k('Alternate Manager')]: 'Jane Doe, ' + t('asstPos'),
        [k('Physical Plan Location')]: locale === 'es' ? 'Caja fuerte en oficina' : locale === 'fr' ? 'Coffre-fort au bureau' : 'Fire-proof safe in office',
        [k('Digital Plan Location')]: locale === 'es' ? 'Nube con respaldo' : locale === 'fr' ? 'Stockage cloud avec sauvegarde' : 'Cloud storage with backup',
        [k('Plan Version')]: '1.0',
        [k('Next Review Date')]: '2026-01-15'
      }
    } catch (e) {
      console.error('❌ Error populating PLAN_INFORMATION:', e)
    }

    console.log('  Populating BUSINESS_OVERVIEW...')
    // BUSINESS OVERVIEW
    try {
      formData.BUSINESS_OVERVIEW = {
        ...formData.BUSINESS_OVERVIEW,
        [k('Business License Number')]: 'LIC-2024-001',
        [k('Business Purpose')]: `${t('companyName')} ${randomBusinessType.name} ${t('businessPurpose')}`,
        [k('Products and Services')]: t('products'),
        [k('Service Delivery Methods')]: t('delivery'),
        [k('Operating Hours')]: locale === 'es' ? 'Lunes a Viernes, 9 AM a 5 PM' : locale === 'fr' ? 'Lundi à Vendredi, 9h à 17h' : 'Monday to Friday, 9 AM to 5 PM',
        [k('Key Personnel Involved')]: t('keyPersonnel'),
        [k('Minimum Resource Requirements')]: t('resources'),
        [k('Customer Base')]: t('customers'),
        [k('Approximate Annual Revenue')]: '100k_500k',
        [k('Total People in Business')]: '1-5',
        [k('Years in Operation')]: '1-5',
        [k('Service Provider BCP Status')]: 'none'
      }
    } catch (e) {
      console.error('❌ Error populating BUSINESS_OVERVIEW:', e)
    }

    // ... (rest of the steps) ...

    // Step 7: Save to localStorage
    console.log('💾 Saving to localStorage...')
    console.log('  bcp-draft keys:', Object.keys(formData))

    localStorage.setItem('bcp-draft', JSON.stringify(formData))
    localStorage.setItem('bcp-industry-selected', 'true')
    localStorage.setItem('bcp-prefill-data', JSON.stringify(preFillData))

    console.log('✅ Random wizard data saved successfully!')

    // ESSENTIAL FUNCTIONS
    formData.ESSENTIAL_FUNCTIONS = {
      ...formData.ESSENTIAL_FUNCTIONS,
      [k('Business Functions')]: [
        {
          [k('Business Function')]: t('coreOps'),
          [k('Description')]: t('coreOpsDesc'),
          [k('Priority Level')]: 'critical',
          [k('Maximum Acceptable Downtime')]: '0-2h',
          [k('Critical Resources Needed')]: t('resources')
        },
        {
          [k('Business Function')]: t('custService'),
          [k('Description')]: t('custServiceDesc'),
          [k('Priority Level')]: 'important',
          [k('Maximum Acceptable Downtime')]: '2-8h',
          [k('Critical Resources Needed')]: locale === 'es' ? 'Personal de servicio y herramientas' : locale === 'fr' ? 'Personnel de service et outils' : 'Customer service staff and communication tools'
        }
      ]
    }

    // FUNCTION PRIORITIES
    formData.FUNCTION_PRIORITIES = {
      ...formData.FUNCTION_PRIORITIES,
      'Function Priorities': [
        {
          'Function': t('coreOps'),
          'Priority': 'Critical',
          'Downtime Tolerance': '0-2 hours',
          'Recovery Time Objective': 'Immediate',
          'Business Impact': locale === 'es' ? 'Cierre total del negocio' : locale === 'fr' ? 'Arrêt complet de l\'activité' : 'Complete business shutdown if unavailable'
        }
      ]
    }

    // RISK ASSESSMENT (use backend-computed matrix)
    const riskMatrix = preFillData.preFilledFields?.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || []

    // Ensure risks are marked as selected for auto-populate so strategies filter correctly
    const normalizedRiskMatrix = riskMatrix.map((risk) => {
      const isHigh = (risk.riskTier && risk.riskTier <= 2) || (risk.riskScore && risk.riskScore >= 5)
      const isPreSelected = risk.isPreSelected === true || isHigh
      return {
        ...risk,
        isPreSelected,
        isSelected: isPreSelected,
        isAvailable: true
      }
    })

    formData.RISK_ASSESSMENT = {
      ...formData.RISK_ASSESSMENT,
      'Risk Assessment Matrix': normalizedRiskMatrix
    }

    // Keep preFillData.hazards in sync so downstream components see selected risks
    if (Array.isArray(preFillData.hazards)) {
      preFillData.hazards = normalizedRiskMatrix.map((risk) => ({
        hazardId: risk.hazardId,
        hazardName: risk.hazard || risk.hazardName,
        riskLevel: risk.riskLevel,
        frequency: risk.frequency || 'possible',
        impact: risk.impact || (risk.severity > 5 ? 'major' : 'moderate'),
        likelihood: risk.likelihood,
        severity: risk.severity,
        riskScore: risk.riskScore,
        isPreSelected: risk.isPreSelected,
        isAvailable: risk.isAvailable,
        reasoning: risk.reasoning,
        isCalculated: risk.isCalculated,
        baseScore: risk.baseScore,
        appliedMultipliers: risk.appliedMultipliers,
        initialTier: risk.initialTier,
        initialRiskScore: risk.initialRiskScore,
        riskTier: risk.riskTier,
        riskCategory: risk.riskCategory,
        isSelected: risk.isSelected
      }))
    }

    // STRATEGIES (prefer backend pre-fill; also keep recommended IDs for backward compat)
    // Filter strategies to only include those that match risks present in the matrix
    // This prevents "strategy risk IDs don't match matrix" warnings in the report preview
    const validRiskIds = new Set(normalizedRiskMatrix.map(r => r.hazardId))
    const validRiskNames = new Set(normalizedRiskMatrix.map(r => r.hazard || r.hazardName))

    const filteredStrategies = (preFillData.recommendedStrategies || []).filter(s => {
      // If strategy has no applicable risks defined, include it (might be general)
      if (!s.applicableRisks || s.applicableRisks.length === 0) return true

      // Check if ANY of the strategy's applicable risks are in our valid set
      return s.applicableRisks.some(riskId => {
        const riskIdNorm = riskId.toLowerCase().replace(/_/g, ' ')

        // Check against IDs
        if (validRiskIds.has(riskId)) return true

        // Check against Names (normalized)
        for (const validName of validRiskNames) {
          const validNameNorm = (validName || '').toLowerCase().replace(/_/g, ' ')
          if (riskIdNorm === validNameNorm || riskIdNorm.includes(validNameNorm) || validNameNorm.includes(riskIdNorm)) return true
        }

        return false
      })
    })

    formData.STRATEGIES = {
      ...formData.STRATEGIES,
      'Business Continuity Strategies': preFillData.preFilledFields?.STRATEGIES?.['Business Continuity Strategies'] || [],
      'Long-term Risk Reduction Measures': preFillData.preFilledFields?.STRATEGIES?.['Long-term Risk Reduction Measures'] || [],
      'Selected Strategies': filteredStrategies.map((s) => s.strategyId)
    }

    // ACTION PLAN (if backend provided, keep it; otherwise add minimal)
    formData.ACTION_PLAN = {
      ...formData.ACTION_PLAN,
      ...(preFillData.preFilledFields?.ACTION_PLAN || {}),
      [k('Emergency Team')]: preFillData.preFilledFields?.ACTION_PLAN?.[k('Emergency Team')] || [
        {
          [k('Name')]: 'John Smith',
          [k('Role')]: locale === 'es' ? 'Coordinador de Emergencias' : locale === 'fr' ? 'Coordinateur d\'Urgence' : 'Emergency Coordinator',
          [k('Phone')]: '555-0101',
          [k('Alternate Contact')]: '555-0102',
          [k('Responsibilities')]: locale === 'es' ? 'Coordinación general' : locale === 'fr' ? 'Coordination générale' : 'Overall emergency coordination'
        }
      ],
      [k('Communication Plan')]: preFillData.preFilledFields?.ACTION_PLAN?.[k('Communication Plan')] || t('commPlan'),
      [k('Evacuation Plan')]: preFillData.preFilledFields?.ACTION_PLAN?.[k('Evacuation Plan')] || t('evacPlan'),
      [k('Work Locations')]: preFillData.preFilledFields?.ACTION_PLAN?.[k('Work Locations')] || [
        {
          [k('Location Name')]: t('primaryLoc'),
          [k('Address')]: `123 Main Street, ${location.parish}`,
          [k('Contact')]: '555-0101',
          [k('Capacity')]: 'Full operations',
          [k('Notes')]: t('mainLocNote')
        }
      ]
    }

    // CONTACTS AND INFORMATION
    formData.CONTACTS_AND_INFORMATION = {
      ...formData.CONTACTS_AND_INFORMATION,
      [k('Staff Contact Information')]: [
        {
          [k('Name')]: 'John Smith',
          [k('Position')]: t('ownerPos'),
          [k('Phone Number')]: '555-0101',
          [k('Email Address')]: 'john@example.com',
          [k('Emergency Contact')]: 'Jane Doe - 555-0102'
        },
        {
          [k('Name')]: 'Jane Doe',
          [k('Position')]: t('asstPos'),
          [k('Phone Number')]: '555-0102',
          [k('Email Address')]: 'jane@example.com',
          [k('Emergency Contact')]: 'John Smith - 555-0101'
        }
      ],
      [k('Key Customer Contacts')]: [
        {
          [k('Customer Name')]: t('mainCust'),
          [k('Type/Notes')]: t('mainCustNote'),
          [k('Phone Number')]: '555-0301',
          [k('Email Address')]: 'customer@example.com',
          [k('Special Requirements')]: locale === 'es' ? 'Servicio prioritario' : locale === 'fr' ? 'Service prioritaire' : 'Priority service required'
        }
      ],
      [k('Supplier Information')]: [
        {
          [k('Supplier Name')]: t('mainSupp'),
          [k('Goods/Services Supplied')]: t('mainSuppGoods'),
          [k('Phone Number')]: '555-0201',
          [k('Email Address')]: 'supplier@example.com',
          [k('Backup Supplier')]: 'Backup Supplier - 555-0202'
        },
        {
          [k('Supplier Name')]: t('equipSupp'),
          [k('Goods/Services Supplied')]: t('equipSuppGoods'),
          [k('Phone Number')]: '555-0203',
          [k('Email Address')]: 'equipment@example.com',
          [k('Backup Supplier')]: 'Alternative Equipment Co. - 555-0204'
        }
      ],
      [k('Emergency Services and Utilities')]: [
        {
          [k('Service Type')]: locale === 'es' ? 'Servicios de Emergencia' : locale === 'fr' ? 'Services d\'Urgence' : 'Emergency Services',
          [k('Organization Name')]: locale === 'es' ? 'Servicios Locales' : locale === 'fr' ? 'Services Locaux' : 'Local Emergency Services',
          [k('Phone Number')]: '911',
          [k('Email Address')]: 'emergency@local.gov',
          [k('Account Number')]: 'N/A'
        },
        {
          [k('Service Type')]: locale === 'es' ? 'Bomberos' : locale === 'fr' ? 'Pompiers' : 'Fire Department',
          [k('Organization Name')]: locale === 'es' ? 'Departamento de Bomberos' : locale === 'fr' ? 'Service d\'Incendie' : 'Local Fire Department',
          [k('Phone Number')]: '911',
          [k('Email Address')]: 'fire@local.gov',
          [k('Account Number')]: 'N/A'
        },
        {
          [k('Service Type')]: locale === 'es' ? 'Policía' : locale === 'fr' ? 'Police' : 'Police',
          [k('Organization Name')]: locale === 'es' ? 'Departamento de Policía' : locale === 'fr' ? 'Service de Police' : 'Local Police Department',
          [k('Phone Number')]: '911',
          [k('Email Address')]: 'police@local.gov',
          [k('Account Number')]: 'N/A'
        },
        {
          [k('Service Type')]: locale === 'es' ? 'Emergencia Médica' : locale === 'fr' ? 'Urgence Médicale' : 'Medical Emergency',
          [k('Organization Name')]: locale === 'es' ? 'Hospital Local' : locale === 'fr' ? 'Hôpital Local' : 'Local Hospital',
          [k('Phone Number')]: '911',
          [k('Email Address')]: 'emergency@hospital.local',
          [k('Account Number')]: 'N/A'
        },
        {
          [k('Service Type')]: locale === 'es' ? 'Electricidad' : locale === 'fr' ? 'Électricité' : 'Electricity',
          [k('Organization Name')]: locale === 'es' ? 'Compañía Eléctrica' : locale === 'fr' ? 'Compagnie d\'Électricité' : 'Local Power Company',
          [k('Phone Number')]: '555-1001',
          [k('Email Address')]: 'service@power.local',
          [k('Account Number')]: 'ACC-12345'
        },
        {
          [k('Service Type')]: locale === 'es' ? 'Agua' : locale === 'fr' ? 'Eau' : 'Water',
          [k('Organization Name')]: locale === 'es' ? 'Autoridad del Agua' : locale === 'fr' ? 'Service des Eaux' : 'Local Water Authority',
          [k('Phone Number')]: '555-1002',
          [k('Email Address')]: 'service@water.local',
          [k('Account Number')]: 'ACC-67890'
        },
        {
          [k('Service Type')]: locale === 'es' ? 'Seguros' : locale === 'fr' ? 'Assurance' : 'Insurance',
          [k('Organization Name')]: locale === 'es' ? 'Aseguradora Global' : locale === 'fr' ? 'Assurance Globale' : 'Global Insurance Co.',
          [k('Phone Number')]: '555-1003',
          [k('Email Address')]: 'claims@insurance.local',
          [k('Account Number')]: 'POL-998877'
        },
        {
          [k('Service Type')]: locale === 'es' ? 'Banca' : locale === 'fr' ? 'Banque' : 'Banking',
          [k('Organization Name')]: locale === 'es' ? 'Banco Nacional' : locale === 'fr' ? 'Banque Nationale' : 'National Bank',
          [k('Phone Number')]: '555-1004',
          [k('Email Address')]: 'support@bank.local',
          [k('Account Number')]: 'ACC-554433'
        }
      ],
      [k('Critical Business Information')]: `Business Registration: REG-2024-001; Property: Owned/Leased at ${location.parish}; Insurance: Policy #INS-12345; Banking: Main Account #ACC-123456; Tax ID: TAX-123456789; Licenses: Business License #LIC-2024-001; Critical Contracts: Supplier agreements, equipment leases; Employee Records: HR system with backup; Customer Database: Cloud-based with daily backups.`,
      [k('Plan Distribution List')]: [
        {
          [k('Name/Position')]: `John Smith (${t('ownerPos')})`,
          [k('Format Received')]: locale === 'es' ? 'Electrónico + Copia impresa' : locale === 'fr' ? 'Électronique + Copie papier' : 'Electronic + Hard copy',
          [k('Date Provided')]: new Date().toISOString().split('T')[0],
          [k('Version Number')]: '1.0',
          [k('Acknowledgment')]: locale === 'es' ? 'Firmado y archivado' : locale === 'fr' ? 'Signé et classé' : 'Signed and filed'
        }
      ]
    }

    // VITAL RECORDS
    formData.VITAL_RECORDS = {
      ...formData.VITAL_RECORDS,
      [k('Vital Records Inventory')]: [
        {
          [k('Record Type')]: t('finRecords'),
          [k('Primary Location')]: locale === 'es' ? 'Caja fuerte' : locale === 'fr' ? 'Coffre-fort' : 'Secure office safe',
          [k('Backup Location')]: locale === 'es' ? 'Nube + Contador' : locale === 'fr' ? 'Cloud + Comptable' : 'Cloud storage + Accountant office',
          [k('Recovery Priority')]: 'HIGH'
        },
        {
          [k('Record Type')]: t('empRecords'),
          [k('Primary Location')]: 'HR office + Digital system',
          [k('Backup Location')]: 'Cloud backup + External drive in safe',
          [k('Recovery Priority')]: 'HIGH'
        },
        {
          [k('Record Type')]: t('bizReg'),
          [k('Primary Location')]: 'Office safe',
          [k('Backup Location')]: 'Cloud storage + Attorney office',
          [k('Recovery Priority')]: 'HIGH'
        },
        {
          [k('Record Type')]: t('insPolicies'),
          [k('Primary Location')]: 'Office safe',
          [k('Backup Location')]: 'Cloud storage + Insurance agent',
          [k('Recovery Priority')]: 'HIGH'
        },
        {
          [k('Record Type')]: t('custDb'),
          [k('Primary Location')]: 'Cloud-based system',
          [k('Backup Location')]: 'Daily automated backups + Weekly offline backup',
          [k('Recovery Priority')]: 'HIGH'
        },
        {
          [k('Record Type')]: t('suppContracts'),
          [k('Primary Location')]: 'Digital storage + Physical copies',
          [k('Backup Location')]: 'Cloud backup',
          [k('Recovery Priority')]: 'MEDIUM'
        },
        {
          [k('Record Type')]: t('emergContacts'),
          [k('Primary Location')]: 'Digital + Physical in emergency kits',
          [k('Backup Location')]: 'Cloud backup + Printed copies',
          [k('Recovery Priority')]: 'HIGH'
        },
        {
          [k('Record Type')]: t('taxRecords'),
          [k('Primary Location')]: 'Office files + Digital',
          [k('Backup Location')]: 'Cloud backup + Accountant',
          [k('Recovery Priority')]: 'HIGH'
        }
      ]
    }

    // TESTING AND MAINTENANCE (align labels with wizard)
    formData.TESTING_AND_MAINTENANCE = {
      ...formData.TESTING_AND_MAINTENANCE,
      [k('Plan Testing Schedule')]: [
        {
          [k('Test Type')]: t('testTabletop'),
          [k('What is Tested')]: t('testTabletopDesc'),
          [k('Frequency')]: 'Quarterly',
          [k('Next Test Date')]: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          [k('Success Criteria')]: locale === 'es' ? 'Respuesta en 30 mins' : locale === 'fr' ? 'Réponse en 30 mins' : 'All team members respond within 30 minutes, key decisions made',
          [k('Responsible Person')]: `John Smith (${t('ownerPos')})`
        },
        {
          [k('Test Type')]: t('testComm'),
          [k('What is Tested')]: t('testCommDesc'),
          [k('Frequency')]: 'Monthly',
          [k('Next Test Date')]: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          [k('Success Criteria')]: '95% response',
          [k('Responsible Person')]: `Jane Doe (${t('asstPos')})`
        },
        {
          [k('Test Type')]: t('testSim'),
          [k('What is Tested')]: t('testSimDesc'),
          [k('Frequency')]: 'Annual',
          [k('Next Test Date')]: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          [k('Success Criteria')]: locale === 'es' ? 'Procedimientos seguidos' : locale === 'fr' ? 'Procédures suivies' : 'All procedures followed correctly',
          [k('Responsible Person')]: `John Smith (${t('ownerPos')})`
        }
      ],
      [k('Plan Revision History')]: [
        {
          [k('Version')]: '1.0',
          [k('Date Updated')]: new Date().toISOString().split('T')[0],
          [k('Changes Made')]: t('revChange'),
          [k('Updated By')]: `John Smith (${t('ownerPos')})`,
          [k('Reason for Update')]: t('revReason')
        }
      ],
      [k('Training Schedule')]: [
        {
          [k('Training Topic')]: t('trainEmerg'),
          [k('Who Needs Training')]: locale === 'es' ? 'Todo el personal' : locale === 'fr' ? 'Tout le personnel' : 'All staff',
          [k('Frequency')]: 'Annual',
          [k('Next Training Date')]: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          [k('Training Method')]: locale === 'es' ? 'Taller presencial' : locale === 'fr' ? 'Atelier en personne' : 'In-person workshop',
          [k('Responsible Person')]: `John Smith (${t('ownerPos')})`
        },
        {
          [k('Training Topic')]: t('trainBcp'),
          [k('Who Needs Training')]: locale === 'es' ? 'Gerencia' : locale === 'fr' ? 'Direction' : 'Management team',
          [k('Frequency')]: 'Semi-annual',
          [k('Next Training Date')]: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          [k('Training Method')]: locale === 'es' ? 'Curso online' : locale === 'fr' ? 'Cours en ligne' : 'Online course + discussion',
          [k('Responsible Person')]: `Jane Doe (${t('asstPos')})`
        }
      ],
      [k('Performance Metrics')]: [
        {
          [k('Metric')]: t('metricRto'),
          [k('Target/Threshold')]: locale === 'es' ? 'Funciones críticas < 2 horas' : locale === 'fr' ? 'Fonctions critiques < 2 heures' : 'Critical functions < 2 hours',
          [k('Responsible Person')]: 'Ops Manager',
          [k('Data Source')]: 'Incident logs',
          [k('Review Frequency')]: 'Quarterly',
          [k('Last Updated')]: new Date().toISOString().split('T')[0]
        }
      ],
      [k('Improvement Tracking')]: [
        {
          [k('Improvement Area')]: t('improvDrills'),
          [k('Action Items')]: t('improvAction'),
          [k('Owner')]: locale === 'es' ? 'Coord. Emergencias' : locale === 'fr' ? 'Coord. Urgence' : 'Emergency Coordinator',
          [k('Target Date')]: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          [k('Status/Notes')]: 'In progress'
        }
      ]
    }

    // Step 7: Save to localStorage
    localStorage.setItem('bcp-draft', JSON.stringify(formData))
    localStorage.setItem('bcp-industry-selected', 'true')
    localStorage.setItem('bcp-prefill-data', JSON.stringify(preFillData))

    console.log('✅ Random wizard data saved successfully!')
    console.log(`📊 Selected: ${randomBusinessType.name} in ${location.parish}, ${location.country}`)
    console.log(`📋 Risks: ${preFillData.hazards?.length || 0} hazards`)
    console.log(`🎯 Strategies: ${preFillData.recommendedStrategies?.length || 0} recommended`)
    console.log('\n🔄 Refreshing page in 2 seconds...')

    setTimeout(() => {
      window.location.reload()
    }, 2000)

  } catch (error) {
    console.error('❌ Error filling wizard:', error)
    console.error('Error stack:', error.stack)
    alert(`Error: ${error.message}\n\nCheck browser console (F12) for more details.`)
    throw error // Re-throw so DevDataFiller can catch it
  }
})()

/**
 * Data Transformer for Formal BCP Export
 * Converts wizard form data to formal document structure
 */

import type { WizardFormData, StrategyData, FormalBCPData } from '../types/bcpExports'
import {
  determineBusinessSize,
  getContentLimits,
  getHighPriorityRisks,
  getAllSelectedRisks,
  getStrategiesForRisk,
  getCriticalActions,
  calculateTotalInvestment,
  calculateInvestmentByCategory,
  extractEssentialFunctions,
  extractContacts,
  extractVitalRecords,
  extractCompetitiveAdvantages,
  getMitigationStatus,
  parseAddress,
  simplifyForFormalDocument,
  formatCurrency,
  formatCurrencyJMD,
  getCurrencyFromCountry,
  parseCost,
  estimateCostFromLevel
} from '../lib/pdf/formalBCPHelpers'

/**
 * Main transformer function
 */
export function transformToFormalFormat(
  planData: WizardFormData,
  strategies: StrategyData[]
): FormalBCPData {
  // Determine business size and content limits
  const employeeCount = planData.BUSINESS_OVERVIEW?.['Total People in Business'] || 5
  const businessSize = determineBusinessSize(employeeCount)
  const limits = getContentLimits(businessSize)
  
  // Get country and currency
  const address = planData.PLAN_INFORMATION?.['Business Address'] || ''
  const { country } = parseAddress(address)
  const currency = getCurrencyFromCountry(country)
  
  // Extract high-priority risks (ALL OF THEM - no limits)
  const highPriorityRisks = getHighPriorityRisks(planData)
  const allRisks = getAllSelectedRisks(planData)
  
  return {
    coverPage: generateCoverPage(planData),
    businessOverview: generateBusinessOverview(planData, limits),
    riskAssessment: generateRiskAssessment(planData, highPriorityRisks, allRisks, strategies),
    continuityStrategies: generateContinuityStrategies(planData, strategies, highPriorityRisks, limits),
    emergencyResponse: generateEmergencyResponse(planData, limits),
    planMaintenance: generatePlanMaintenance(planData),
    appendices: generateAppendices(planData)
  }
}

// ============================================================================
// SECTION GENERATORS
// ============================================================================

function generateCoverPage(planData: WizardFormData): FormalBCPData['coverPage'] {
  const planInfo = planData.PLAN_INFORMATION || {}
  const businessInfo = planData.BUSINESS_OVERVIEW || {}
  const address = planInfo['Business Address'] || ''
  const { parish, country } = parseAddress(address)
  
  // Extract plan manager name and title
  const planManager = planInfo['Plan Manager'] || ''
  const [name, ...titleParts] = planManager.split(',')
  const title = titleParts.join(',').trim() || 'Business Owner'
  
  return {
    businessName: planInfo['Company Name'] || 'Business Name',
    parish: parish || 'Parish',
    country: country || 'Jamaica',
    planVersion: '1.0',
    datePrepared: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    planManager: name.trim(),
    planManagerTitle: title,
    businessDescription: simplifyForFormalDocument(
      businessInfo['Business Purpose'] || 'Professional business providing quality services'
    )
  }
}

function generateBusinessOverview(
  planData: WizardFormData,
  limits: any
): FormalBCPData['businessOverview'] {
  const planInfo = planData.PLAN_INFORMATION || {}
  const businessInfo = planData.BUSINESS_OVERVIEW || {}
  const address = planInfo['Business Address'] || ''
  const { country } = parseAddress(address)
  const currency = getCurrencyFromCountry(country)
  
  // Extract employee breakdown if available from Key Personnel
  const keyPersonnel = businessInfo['Key Personnel Involved'] || ''
  const totalEmployees = businessInfo['Total People in Business'] || 5
  
  // Try to parse employee types from key personnel description
  let fullTimeEmployees: number | undefined
  let partTimeEmployees: number | undefined
  
  const ftMatch = keyPersonnel.match(/(\d+)\s*full[- ]?time/i)
  const ptMatch = keyPersonnel.match(/(\d+)\s*part[- ]?time/i)
  
  if (ftMatch) fullTimeEmployees = parseInt(ftMatch[1])
  if (ptMatch) partTimeEmployees = parseInt(ptMatch[1])
  
  // Format annual revenue with proper currency
  const revenueValue = businessInfo['Approximate Annual Revenue'] || 'not_disclosed'
  let revenueDisplay = ''
  
  switch (revenueValue) {
    case 'under_1m':
      revenueDisplay = `Under ${currency} 1 million`
      break
    case '1m_3m':
      revenueDisplay = `${currency} 1-3 million`
      break
    case '3m_10m':
      revenueDisplay = `${currency} 3-10 million`
      break
    case '10m_20m':
      revenueDisplay = `${currency} 10-20 million`
      break
    case 'over_20m':
      revenueDisplay = `Over ${currency} 20 million`
      break
    default:
      revenueDisplay = 'Micro/Small Business'
  }
  
  // Get essential functions
  const essentialFunctions = extractEssentialFunctions(planData, 6)
  
  // Get competitive advantages
  const competitiveAdvantages = extractCompetitiveAdvantages(planData)
  
  return {
    businessInfo: {
      businessName: planInfo['Company Name'] || '',
      licenseNumber: businessInfo['Business License Number'] || '',
      businessType: businessInfo['Industry Category'] || 'Small Business',
      physicalAddress: address,
      yearsInOperation: businessInfo['Years in Operation'] || 'Established business',
      businessPurpose: simplifyForFormalDocument(
        businessInfo['Business Purpose'] || ''
      ).substring(0, 200)
    },
    businessScale: {
      totalEmployees,
      fullTimeEmployees,
      partTimeEmployees,
      annualRevenue: revenueDisplay,
      operatingSchedule: businessInfo['Operating Hours'] || '',
      primaryMarkets: businessInfo['Customer Base'] || ''
    },
    productsAndServices: simplifyForFormalDocument(
      businessInfo['Products and Services'] || ''
    ),
    competitiveAdvantages: competitiveAdvantages.slice(0, 3),
    essentialFunctions: essentialFunctions.map(fn => ({
      functionName: fn.functionName || fn.function || fn.name || 'Essential Function',
      description: fn.description || fn.functionName || ''
    })),
    minimumResourceRequirements: simplifyForFormalDocument(
      businessInfo['Minimum Resource Requirements'] || ''
    )
  }
}

function generateRiskAssessment(
  planData: WizardFormData,
  highPriorityRisks: any[],
  allRisks: any[],
  strategies: StrategyData[]
): FormalBCPData['riskAssessment'] {
  // Generate major risks detail
  const majorRisks = highPriorityRisks.map(risk => ({
    hazardName: risk.hazardName,
    riskScore: risk.riskScore,
    riskLevel: risk.riskLevel,
    likelihood: risk.likelihood,
    potentialImpact: risk.impact,
    vulnerability: simplifyForFormalDocument(risk.reasoning || 'This risk could significantly impact our business operations.'),
    potentialLoss: estimatePotentialLoss(risk, planData)
  }))
  
  // Generate all risks summary table
  const allRisksSummary = allRisks.map(risk => ({
    hazard: risk.hazardName,
    likelihood: risk.likelihood,
    impact: risk.impact,
    riskLevel: risk.riskLevel,
    riskScore: risk.riskScore,
    mitigationStatus: getMitigationStatus(risk.hazardId, strategies, planData)
  }))
  
  // Calculate potential business impact
  const businessInfo = planData.BUSINESS_OVERVIEW || {}
  const revenueValue = businessInfo['Approximate Annual Revenue'] || 'under_1m'
  const potentialImpact = calculatePotentialImpact(revenueValue, highPriorityRisks.length, planData)
  
  return {
    totalRisksIdentified: allRisks.length,
    highPriorityRisksCount: highPriorityRisks.length,
    majorRisks,
    allRisksSummary,
    potentialImpact
  }
}

function generateContinuityStrategies(
  planData: WizardFormData,
  strategies: StrategyData[],
  highPriorityRisks: any[],
  limits: any
): FormalBCPData['continuityStrategies'] {
  console.log('[Transformer] ========================================')
  console.log('[Transformer] Processing', strategies.length, 'strategies')
  console.log('[Transformer] High priority risks:', highPriorityRisks.length)
  console.log('[Transformer] Strategy details:', strategies.map((s, idx) => ({
    index: idx + 1,
    name: s.smeTitle || s.name,
    calculatedCostLocal: s.calculatedCostLocal,
    currencySymbol: s.currencySymbol,
    currencyCode: s.currencyCode,
    applicableRisks: s.applicableRisks
  })))
  
  // Get currency for formatting (fallback only)
  const address = planData.PLAN_INFORMATION?.['Business Address'] || ''
  const { country } = parseAddress(address)
  const currency = getCurrencyFromCountry(country)
  
  // ============================================================================
  // Calculate total investment from USER'S CALCULATED COSTS
  // ============================================================================
  
  const totalInvestment = strategies.reduce((sum, s) => {
    // FIRST: Use calculated cost from wizard (already in local currency)
    if (s.calculatedCostLocal && s.calculatedCostLocal > 0) {
      return sum + s.calculatedCostLocal
    }
    // FALLBACK: Parse legacy cost string
    const parsed = parseCostString(s.implementationCost || '')
    return sum + parsed
  }, 0)
  
  console.log('[Transformer] Total investment:', totalInvestment)
  
  // Get currency info from first strategy (wizard data)
  const currencySymbol = strategies[0]?.currencySymbol || currency.split(' ')[0] || 'Bds$'
  const currencyCode = strategies[0]?.currencyCode || 'BBD'
  
  // ============================================================================
  // Calculate investment breakdown by category
  // ============================================================================
  
  const categoryInvestment = {
    prevention: 0,
    response: 0,
    recovery: 0
  }
  
  strategies.forEach(s => {
    const cost = s.calculatedCostLocal || parseCostString(s.implementationCost || '')
    
    // Categorize by executionTiming of action steps
    const hasBeforeSteps = (s.actionSteps || []).some((step: any) => step.executionTiming === 'before_crisis')
    const hasDuringSteps = (s.actionSteps || []).some((step: any) => step.executionTiming === 'during_crisis')
    const hasAfterSteps = (s.actionSteps || []).some((step: any) => step.executionTiming === 'after_crisis')
    
    // Distribute cost proportionally based on phases covered
    const phaseCount = (hasBeforeSteps ? 1 : 0) + (hasDuringSteps ? 1 : 0) + (hasAfterSteps ? 1 : 0)
    if (phaseCount > 0) {
      const costPerPhase = cost / phaseCount
      if (hasBeforeSteps) categoryInvestment.prevention += costPerPhase
      if (hasDuringSteps) categoryInvestment.response += costPerPhase
      if (hasAfterSteps) categoryInvestment.recovery += costPerPhase
    } else {
      // No timing info - default to prevention
      categoryInvestment.prevention += cost
    }
  })
  
  const totalCategoryInvestment = 
    categoryInvestment.prevention + 
    categoryInvestment.response + 
    categoryInvestment.recovery
  
  const investmentBreakdown = {
    prevention: categoryInvestment.prevention,
    preventionPercentage: totalCategoryInvestment > 0 
      ? Math.round((categoryInvestment.prevention / totalCategoryInvestment) * 100)
      : 33,
    response: categoryInvestment.response,
    responsePercentage: totalCategoryInvestment > 0
      ? Math.round((categoryInvestment.response / totalCategoryInvestment) * 100)
      : 33,
    recovery: categoryInvestment.recovery,
    recoveryPercentage: totalCategoryInvestment > 0
      ? Math.round((categoryInvestment.recovery / totalCategoryInvestment) * 100)
      : 34
  }
  
  console.log('[Transformer] Investment breakdown:', investmentBreakdown)
  
  // ============================================================================
  // Group strategies by risk - USE ALL USER-SELECTED STRATEGIES (NOT JUST HIGH PRIORITY)
  // ============================================================================
  
  // Get ALL risks that have at least one strategy (not just high priority)
  const risksWithStrategies = highPriorityRisks.filter(risk => {
    return strategies.some(s => (s.applicableRisks || []).includes(risk.hazardId))
  })
  
  // If user selected strategies for non-high-priority risks, include those too
  const allRisksInPlan = planData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || []
  const additionalRisks = allRisksInPlan.filter(risk => {
    const isHighPriority = highPriorityRisks.some(hr => hr.hazardId === risk.hazardId)
    if (isHighPriority) return false // Already included
    
    // Include if has strategies
    return strategies.some(s => (s.applicableRisks || []).includes(risk.hazardId))
  }).map(risk => ({
    hazardId: risk.hazardId,
    hazardName: risk.hazardName || risk.Hazard,
    riskScore: parseFloat(risk.riskScore || risk['Risk Score'] || 0),
    riskLevel: risk.riskLevel || risk['Risk Level'],
    likelihood: risk.likelihood || risk.Likelihood,
    impact: risk.impact || risk.Impact,
    reasoning: risk.reasoning
  }))
  
  const allRisksForDisplay = [...risksWithStrategies, ...additionalRisks]
  
  console.log('[Transformer] Risks with strategies:')
  console.log(`  - High priority risks with strategies: ${risksWithStrategies.length}`)
  console.log(`  - Additional (non-high priority) risks with strategies: ${additionalRisks.length}`)
  console.log(`  - TOTAL risks to display: ${allRisksForDisplay.length}`)
  allRisksForDisplay.forEach((r, idx) => {
    const count = strategies.filter(s => (s.applicableRisks || []).includes(r.hazardId)).length
    console.log(`    ${idx + 1}. ${r.hazardName} (${r.riskLevel}): ${count} strategies`)
  })
  
  const strategiesByRisk = allRisksForDisplay.map(risk => {
    // Find ALL strategies that apply to this risk
    const riskStrategies = strategies.filter(s =>
      (s.applicableRisks || []).includes(risk.hazardId)
    )
    
    console.log(`[Transformer] Risk "${risk.hazardName}": ${riskStrategies.length} strategies`)
    
    // Calculate total investment for this risk
    const riskInvestment = riskStrategies.reduce((sum, s) => {
      return sum + (s.calculatedCostLocal || parseCostString(s.implementationCost || ''))
    }, 0)
    
    // Format each strategy
    const formattedStrategies = riskStrategies.map(strategy => {
      // Get ALL action steps (no limits)
      const actions = (strategy.actionSteps || [])
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map(action => ({
          action: simplifyForFormalDocument(action.smeAction || action.action || action.title),
          phase: action.phase || 'implementation',
          timeframe: action.timeframe || '',
          estimatedMinutes: action.estimatedMinutes || 0
        }))
      
      // CRITICAL FIX: Format cost with proper currency fallback
      // Use strategy currency if available, otherwise fall back to detected country currency
      const costAmount = strategy.calculatedCostLocal || parseCostString(strategy.implementationCost || '')
      
      const useCurrency = (strategy.calculatedCostLocal > 0 && strategy.currencySymbol)
        ? { symbol: strategy.currencySymbol, code: strategy.currencyCode }
        : { symbol: currencySymbol, code: currencyCode }
      
      const costDisplay = costAmount > 0
        ? `${useCurrency.symbol}${Math.round(costAmount).toLocaleString()}`
        : 'Cost TBD'
      
      // Extract string values from multilingual objects
      const strategyName = simplifyForFormalDocument(strategy.smeTitle || strategy.name)
      const strategyPurpose = simplifyForFormalDocument(strategy.smeSummary || strategy.description || '')
      
      return {
        name: strategyName,
        purpose: strategyPurpose,
        benefits: (strategy.benefitsBullets || []).slice(0, 3),
        implementation: {
          investmentRequired: costDisplay,
          setupTime: strategy.timeToImplement || strategy.implementationTime || 'Varies',
          effectiveness: strategy.effectiveness || 7,
          status: 'Planned',
          responsiblePerson: planData.PLAN_INFORMATION?.['Plan Manager'] || 'Business Owner'
        },
        keyActions: actions, // ALL actions
        lowBudgetOption: strategy.lowBudgetAlternative || undefined
      }
    })
    
    // CRITICAL FIX: Extract risk name from multilingual object
    const riskName = simplifyForFormalDocument(risk.hazardName) || 'Unnamed Risk'
    
    return {
      riskName: riskName,
      strategyCount: riskStrategies.length,
      totalInvestment: riskInvestment,
      strategies: formattedStrategies
    }
  }).filter(group => group.strategyCount > 0) // Only include risks that have strategies
  
  console.log('[Transformer] Final grouping results:')
  console.log(`  - Risk categories with strategies: ${strategiesByRisk.length}`)
  console.log(`  - Total unique strategies across all risks: ${[...new Set(strategiesByRisk.flatMap(r => r.strategies.map(s => s.name)))].length}`)
  strategiesByRisk.forEach((group, idx) => {
    console.log(`    ${idx + 1}. ${group.riskName}: ${group.strategyCount} strategies`)
  })
  console.log('[Transformer] ========================================')
  
  // Extract low-budget alternatives
  const lowBudgetAlternatives = strategies
    .filter(s => s.actionSteps && s.actionSteps.some(a => a.freeAlternative))
    .slice(0, 3)
    .map(s => ({
      strategyName: s.smeTitle || s.name,
      alternativeDescription: s.actionSteps?.find(a => a.freeAlternative)?.freeAlternative || '',
      cost: 0
    }))
  
  // Generate recovery objectives from essential functions
  const essentialFunctions = extractEssentialFunctions(planData, 5)
  const recoveryObjectives = essentialFunctions.map((fn, index) => ({
    functionName: fn.functionName || fn.name,
    targetRecoveryTime: index === 0 ? '1-4 hours' : index < 3 ? '4-24 hours' : '1-3 days'
  }))
  
  return {
    totalInvestment,
    currencyCode,
    currencySymbol,
    investmentBreakdown,
    strategiesByRisk,
    lowBudgetAlternatives,
    recoveryObjectives
  }
}

function generateEmergencyResponse(
  planData: WizardFormData,
  limits: any
): FormalBCPData['emergencyResponse'] {
  const planInfo = planData.PLAN_INFORMATION || {}
  
  // Emergency leadership
  const emergencyLeadership = [
    {
      role: 'Plan Manager',
      person: planInfo['Plan Manager'] || '',
      contact: planInfo['Manager Contact'] || ''
    }
  ]
  
  if (planInfo['Alternate Manager'] && planInfo['Alternate Manager'] !== 'N/A') {
    emergencyLeadership.push({
      role: 'Alternate Manager',
      person: planInfo['Alternate Manager'],
      contact: planInfo['Alternate Contact'] || ''
    })
  }
  
  // Response team from staff contacts
  const staffContacts = extractContacts(planData, 'Staff Contacts', limits.maxContacts)
  const responseTeam = staffContacts.slice(0, 5).map((contact: any) => ({
    name: contact.name || contact.Name || '',
    normalRole: contact.role || contact.Role || contact.title || '',
    emergencyResponsibility: contact.emergencyRole || 'Support emergency response',
    contact: contact.phone || contact.Phone || contact.contact || ''
  }))
  
  // Emergency services
  const emergencyServices = [
    { service: 'Police', provider: 'Local Police', contact: '911', accountNumber: undefined },
    { service: 'Fire', provider: 'Fire Department', contact: '911', accountNumber: undefined },
    { service: 'Ambulance', provider: 'Emergency Medical', contact: '911', accountNumber: undefined }
  ]
  
  // Essential service providers
  const serviceProviders = extractContacts(planData, 'Emergency Services', 6)
  const essentialProviders = serviceProviders.map((provider: any) => ({
    service: provider.service || provider.Service || provider.type || '',
    provider: provider.company || provider.Company || provider.name || '',
    contact: provider.phone || provider.Phone || provider.contact || '',
    accountNumber: provider.account || provider.accountNumber || undefined
  }))
  
  // Key suppliers
  const suppliers = extractContacts(planData, 'Suppliers', limits.maxContacts)
  const keySuppliers = suppliers.slice(0, 4).map((supplier: any) => ({
    supplier: supplier.company || supplier.Company || supplier.name || '',
    productService: supplier.product || supplier.Product || supplier.service || 'Essential supplies',
    contact: supplier.phone || supplier.Phone || supplier.contact || ''
  }))
  
  // Essential documents
  const vitalRecords = extractVitalRecords(planData, 8)
  const essentialDocuments = vitalRecords.map((record: any) => ({
    recordType: record.recordType || record.type || '',
    primaryLocation: record.location || record.primaryLocation || '',
    backupLocation: record.backupLocation || record.backup || ''
  }))
  
  return {
    emergencyLeadership,
    responseTeam,
    emergencyServices,
    essentialProviders,
    keySuppliers,
    essentialDocuments,
    documentStorage: {
      physicalCopies: planInfo['Physical Plan Location'] || 'Office safe',
      digitalCopies: planInfo['Digital Plan Location'] || 'N/A'
    }
  }
}

function generatePlanMaintenance(planData: WizardFormData): FormalBCPData['planMaintenance'] {
  const testingData = planData.TESTING_AND_MAINTENANCE || {}
  
  // Extract testing schedule
  const testingSchedule = [
    {
      testActivity: 'Communication test',
      frequency: 'Monthly',
      nextTest: getNextMonthDate()
    },
    {
      testActivity: 'Evacuation drill',
      frequency: 'Quarterly',
      nextTest: getNextQuarterDate()
    },
    {
      testActivity: 'Backup systems test',
      frequency: 'Monthly',
      nextTest: getNextMonthDate()
    },
    {
      testActivity: 'Full plan review',
      frequency: 'Annually',
      nextTest: getNextYearDate()
    }
  ]
  
  // Update triggers
  const updateTriggers = [
    'We move locations or make major facility changes',
    'Key personnel change (new manager, new staff)',
    'After any actual emergency or business disruption',
    'Our suppliers, insurance, or banking relationships change',
    'New risks are identified in our area',
    'At least once per year regardless of changes'
  ]
  
  return {
    testingSchedule,
    reviewInfo: {
      regularReviews: testingData['Review Frequency'] || 'Quarterly',
      nextScheduledReview: testingData['Next Review Date'] || getNextQuarterDate(),
      updateTriggers,
      responsiblePerson: planData.PLAN_INFORMATION?.['Plan Manager'] || 'Business Owner'
    },
    staffTraining: {
      trainingTopics: [
        'Emergency procedures and their roles',
        'How to secure the business quickly',
        'Communication protocols',
        'Safety procedures'
      ],
      trainingSchedule: 'New hires immediately, refresher annually'
    }
  }
}

function generateAppendices(planData: WizardFormData): FormalBCPData['appendices'] {
  const planInfo = planData.PLAN_INFORMATION || {}
  
  return {
    revisionHistory: [
      {
        version: '1.0',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        changes: 'Initial plan creation',
        updatedBy: planInfo['Plan Manager'] || 'Business Owner'
      }
    ],
    planDistribution: [],
    certifications: {
      technicalAssistance: [
        'UNDP Caribbean Regional Office',
        'CARICHAM (Caribbean Chamber of Commerce)'
      ],
      industryStandards: [
        'UNDP Business Continuity Framework',
        'CARICHAM SME Best Practices'
      ]
    },
    approval: {
      preparedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      planManagerName: planInfo['Plan Manager'] || '',
      planManagerContact: planInfo['Manager Contact'] || '',
      planManagerEmail: planInfo['Manager Email'] || ''
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function estimatePotentialLoss(risk: any, planData: WizardFormData): string {
  const businessInfo = planData.BUSINESS_OVERVIEW || {}
  const address = planData.PLAN_INFORMATION?.['Business Address'] || ''
  const { country } = parseAddress(address)
  const currency = getCurrencyFromCountry(country)
  const revenueValue = businessInfo['Approximate Annual Revenue'] || 'under_1m'
  
  // Estimate daily revenue
  let dailyRevenue = 2000 // default for micro business
  
  switch (revenueValue) {
    case '1m_3m':
      dailyRevenue = 5000
      break
    case '3m_10m':
      dailyRevenue = 20000
      break
    case '10m_20m':
      dailyRevenue = 45000
      break
    case 'over_20m':
      dailyRevenue = 70000
      break
  }
  
  // Estimate impact duration based on risk score
  const riskScore = risk.riskScore || 5
  let estimatedDays = 3
  
  if (riskScore >= 9) estimatedDays = 14
  else if (riskScore >= 7) estimatedDays = 7
  else if (riskScore >= 5) estimatedDays = 5
  
  const potentialLoss = dailyRevenue * estimatedDays
  
  return `Could lose ${formatCurrency(potentialLoss, currency)} in revenue (${estimatedDays} days closed)`
}

function calculatePotentialImpact(revenueValue: string, riskCount: number, planData?: WizardFormData): any {
  // Get currency
  let currency = 'JMD'
  if (planData) {
    const address = planData.PLAN_INFORMATION?.['Business Address'] || ''
    const { country } = parseAddress(address)
    currency = getCurrencyFromCountry(country)
  }
  
  let weeklyRevenue = 14000 // default
  
  switch (revenueValue) {
    case '1m_3m':
      weeklyRevenue = 35000
      break
    case '3m_10m':
      weeklyRevenue = 140000
      break
    case '10m_20m':
      weeklyRevenue = 315000
      break
    case 'over_20m':
      weeklyRevenue = 490000
      break
  }
  
  return {
    revenueLoss: `${formatCurrency(weeklyRevenue, currency)} per week closed`,
    assetDamage: `Estimated ${formatCurrency(weeklyRevenue * 2, currency)} in inventory and equipment at risk`,
    recoveryTime: riskCount >= 6 ? '3-6 months' : riskCount >= 4 ? '2-4 months' : '4-8 weeks',
    customerRelationships: 'Significant loss of trust and market share without preparation'
  }
}

function estimateInvestmentRange(implementationCost: string, currency: string = 'JMD'): string {
  if (!implementationCost) return `${currency} 10,000-20,000`
  
  const costMap: Record<string, string> = {
    'low': `${currency} 5,000-15,000`,
    'medium': `${currency} 15,000-35,000`,
    'high': `${currency} 35,000-75,000`,
    'very_high': `${currency} 75,000-150,000`
  }
  
  return costMap[implementationCost.toLowerCase()] || `${currency} 10,000-20,000`
}

function getNextMonthDate(): string {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function getNextQuarterDate(): string {
  const date = new Date()
  date.setMonth(date.getMonth() + 3)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function getNextYearDate(): string {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

/**
 * Parse cost from string like "JMD 50,000-100,000" or legacy categorical cost
 */
function parseCostString(costStr: string): number {
  if (!costStr) return 0
  
  // Try to extract numbers
  const amounts = costStr.match(/[\d,]+/g)
  if (amounts && amounts.length > 0) {
    const numbers = amounts.map((a: string) => parseInt(a.replace(/,/g, '')))
    return Math.round(numbers.reduce((sum, val) => sum + val, 0) / numbers.length)
  }
  
  // Fallback for categorical costs
  const costMap: Record<string, number> = {
    'low': 10000,
    'medium': 50000,
    'high': 150000,
    'very_high': 300000
  }
  
  return costMap[costStr.toLowerCase()] || 0
}


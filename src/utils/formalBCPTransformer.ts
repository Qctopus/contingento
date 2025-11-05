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
  // Get currency for formatting
  const address = planData.PLAN_INFORMATION?.['Business Address'] || ''
  const { country } = parseAddress(address)
  const currency = getCurrencyFromCountry(country)
  
  // Calculate total investment
  const totalInvestment = calculateTotalInvestment(strategies, planData)
  const investmentByCategory = calculateInvestmentByCategory(strategies, planData)
  
  const totalCategoryInvestment = 
    investmentByCategory.prevention + 
    investmentByCategory.response + 
    investmentByCategory.recovery
  
  // Generate strategies grouped by risk (NO LIMITS - show all strategies)
  const strategiesByRisk = highPriorityRisks.map(risk => {
    const riskStrategies = getStrategiesForRisk(
      planData,
      strategies,
      risk.hazardId
    )
    
    const riskInvestment = calculateTotalInvestment(riskStrategies, planData)
    
    const formattedStrategies = riskStrategies.map(strategy => {
      const actions = getCriticalActions(strategy.actionSteps || [], limits.maxActionsPerStrategy)
      
      return {
        name: strategy.smeTitle || strategy.name,
        purpose: simplifyForFormalDocument(strategy.smeSummary || strategy.description || ''),
        benefits: (strategy.benefitsBullets || []).slice(0, 3),
        implementation: {
          investmentRequired: strategy.calculatedCostLocal 
            ? formatCurrency(strategy.calculatedCostLocal, currency)
            : estimateInvestmentRange(strategy.implementationCost, currency),
          setupTime: strategy.implementationTime || 'Varies',
          effectiveness: strategy.effectiveness || 7,
          status: 'Planned',
          responsiblePerson: planData.PLAN_INFORMATION?.['Plan Manager'] || 'Business Owner'
        },
        keyActions: actions.map(action => ({
          action: simplifyForFormalDocument(action.smeAction || action.action || action.title),
          phase: action.phase || 'implementation'
        })),
        lowBudgetOption: action.freeAlternative || undefined
      }
    })
    
    return {
      riskName: risk.hazardName,
      strategyCount: riskStrategies.length,
      totalInvestment: riskInvestment,
      strategies: formattedStrategies
    }
  })
  
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
    investmentBreakdown: {
      prevention: investmentByCategory.prevention,
      preventionPercentage: totalCategoryInvestment > 0 
        ? Math.round((investmentByCategory.prevention / totalCategoryInvestment) * 100)
        : 33,
      response: investmentByCategory.response,
      responsePercentage: totalCategoryInvestment > 0
        ? Math.round((investmentByCategory.response / totalCategoryInvestment) * 100)
        : 33,
      recovery: investmentByCategory.recovery,
      recoveryPercentage: totalCategoryInvestment > 0
        ? Math.round((investmentByCategory.recovery / totalCategoryInvestment) * 100)
        : 34
    },
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


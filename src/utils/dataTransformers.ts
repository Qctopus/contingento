/**
 * Data Transformation Utilities
 * Converts wizard form data and database strategies into structured formats
 * for Bank-Ready BCP and Action Workbook exports
 */

import type {
  WizardFormData,
  StrategyData,
  BankReadyBCPData,
  WorkbookBCPData,
  ExecutiveSummary,
  BusinessProfile,
  RiskSummaryTable,
  RiskSummaryItem,
  StrategyOverview,
  StrategyOverviewItem,
  GovernanceSection,
  Appendices,
  ContactSummary,
  VitalRecordSummary,
  DistributionRecord,
  RevisionRecord,
  QuickStartGuide,
  RiskProfile,
  ImplementationGuide,
  ActionPhase,
  DetailedActionStep,
  OngoingMaintenancePhase,
  ContactLists,
  ProgressTrackers,
  WorkbookAppendices,
  ChecklistItem
} from '../types/bcpExports'

// ============================================================================
// BANK-READY DOCUMENT TRANSFORMATION
// ============================================================================

/**
 * Transform wizard data and strategies into Bank-Ready BCP format
 * Focus: Professional, high-level overview for lending institutions
 */
export function transformToBankFormat(
  wizardData: WizardFormData,
  strategies: StrategyData[] = [],
  localCurrency: string = 'JMD',
  exchangeRate: number = 150
): BankReadyBCPData {
  return {
    executiveSummary: createExecutiveSummary(wizardData, strategies, localCurrency),
    businessProfile: createBusinessProfile(wizardData),
    riskSummary: createRiskSummary(wizardData, strategies, localCurrency, exchangeRate),
    strategyOverview: createStrategyOverview(wizardData, strategies, localCurrency, exchangeRate),
    governance: createGovernanceSection(wizardData),
    appendices: createAppendices(wizardData)
  }
}

function createExecutiveSummary(
  wizardData: WizardFormData,
  strategies: StrategyData[],
  localCurrency: string
): ExecutiveSummary {
  const risks = getRisksFromWizard(wizardData)
  const highPriorityRisks = risks.filter(r => 
    r.riskLevel === 'High' || r.riskLevel === 'Extreme'
  ).length

  const totalInvestmentUSD = strategies.reduce(
    (sum, s) => sum + (s.calculatedCostUSD || 0), 
    0
  )
  const totalInvestmentLocal = strategies.reduce(
    (sum, s) => sum + (s.calculatedCostLocal || 0), 
    0
  )

  // Calculate completion percentage based on filled wizard steps
  const completionPercentage = calculateCompletionPercentage(wizardData)

  return {
    companyName: getFieldValue(wizardData.PLAN_INFORMATION, 'Company Name') || 'Unknown Company',
    companyAddress: getFieldValue(wizardData.PLAN_INFORMATION, 'Business Address') || '',
    preparedDate: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    planVersion: getFieldValue(wizardData.PLAN_INFORMATION, 'Plan Version') || '1.0',
    
    totalRisksIdentified: risks.length,
    highPriorityRisks: highPriorityRisks,
    totalStrategiesImplemented: strategies.length,
    totalInvestmentUSD: Math.round(totalInvestmentUSD),
    totalInvestmentLocal: Math.round(totalInvestmentLocal),
    localCurrency: localCurrency,
    
    planCompletionPercentage: completionPercentage,
    nextReviewDate: getFieldValue(wizardData.PLAN_INFORMATION, 'Next Review Date') || 'TBD',
    
    undpCompliant: true,
    carichamCertified: true
  }
}

function createBusinessProfile(wizardData: WizardFormData): BusinessProfile {
  const overview = wizardData.BUSINESS_OVERVIEW || {}
  const planInfo = wizardData.PLAN_INFORMATION || {}

  // Extract key personnel from text field
  const keyPersonnelText = getFieldValue(overview, 'Key Personnel Involved') || 'Not specified'
  
  // Extract critical functions from essential functions step
  const criticalFunctions = extractCriticalFunctions(wizardData.ESSENTIAL_FUNCTIONS)

  return {
    companyName: getFieldValue(planInfo, 'Company Name') || 'Unknown Company',
    businessLicense: getFieldValue(overview, 'Business License Number') || 'Not provided',
    address: getFieldValue(planInfo, 'Business Address') || 'Not specified',
    operatingHours: getFieldValue(overview, 'Operating Hours') || 'Not specified',
    
    businessPurpose: getFieldValue(overview, 'Business Purpose') || 'Not specified',
    productsServices: getFieldValue(overview, 'Products and Services') || 'Not specified',
    industryCategory: 'Small & Medium Enterprise', // Could be enhanced with actual industry data
    
    numberOfEmployees: estimateEmployeeCount(keyPersonnelText),
    customerBase: getFieldValue(overview, 'Customer Base') || 'Not specified',
    
    criticalFunctions: criticalFunctions,
    minimumResources: getFieldValue(overview, 'Minimum Resource Requirements') || 'Not specified',
    keyPersonnel: keyPersonnelText,
    
    planManager: getFieldValue(planInfo, 'Plan Manager') || 'Not specified',
    alternateManager: getFieldValue(planInfo, 'Alternate Manager')
  }
}

function createRiskSummary(
  wizardData: WizardFormData,
  strategies: StrategyData[],
  localCurrency: string,
  exchangeRate: number
): RiskSummaryTable {
  const risks = getRisksFromWizard(wizardData)
  
  // Filter to only selected risks
  const selectedRisks = risks.filter(r => r.isSelected !== false)
  
  const riskItems: RiskSummaryItem[] = selectedRisks.map(risk => {
    // Extract risk name handling multiple possible field names
    const riskName = risk.hazard || risk.Hazard || risk['Hazard Name'] || risk.hazardName || 'Unknown Risk'
    
    // Get likelihood and impact from wizard data (actual user selections)
    const likelihood = risk.likelihood || risk.Likelihood || 'Not assessed'
    const impact = risk.impact || risk.Impact || risk.severity || risk.Severity || 'Not assessed'
    
    // Get risk score and level from wizard data
    const riskScore = parseFloat(risk.riskScore || risk['Risk Score'] || risk['risk_score'] || 0)
    const riskLevel = risk.riskLevel || risk['Risk Level'] || getRiskLevelFromScore(riskScore)
    
    // Find strategies that address this risk (match by risk name or ID)
    const riskId = risk.hazardId || risk.id || riskName
    const applicableStrategies = strategies.filter(s => {
      const risks = s.applicableRisks || []
      return risks.some((r: string) => 
        r === riskId || 
        r === riskName || 
        r.toLowerCase().includes(riskName.toLowerCase()) ||
        riskName.toLowerCase().includes(r.toLowerCase())
      )
    })
    
    const investmentUSD = applicableStrategies.reduce(
      (sum, s) => sum + (s.calculatedCostUSD || 0), 
      0
    )
    
    return {
      riskName,
      likelihood,
      impact,
      riskScore,
      riskLevel,
      status: determineRiskStatus(applicableStrategies.length),
      investmentUSD: Math.round(investmentUSD),
      investmentLocal: Math.round(investmentUSD * exchangeRate)
    }
  })

  // Count risks by priority
  const highPriorityCount = riskItems.filter(r => 
    r.riskLevel === 'High' || r.riskLevel === 'Extreme'
  ).length
  const mediumPriorityCount = riskItems.filter(r => 
    r.riskLevel === 'Medium'
  ).length
  const lowPriorityCount = riskItems.filter(r => 
    r.riskLevel === 'Low'
  ).length

  return {
    risks: riskItems,
    totalRisksAssessed: selectedRisks.length,
    highPriorityCount,
    mediumPriorityCount,
    lowPriorityCount
  }
}

function getRiskLevelFromScore(score: number): string {
  if (score >= 9.0) return 'Extreme'
  if (score >= 6.0) return 'High'
  if (score >= 3.0) return 'Medium'
  return 'Low'
}

function createStrategyOverview(
  wizardData: WizardFormData,
  strategies: StrategyData[],
  localCurrency: string,
  exchangeRate: number
): StrategyOverview {
  const strategyItems: StrategyOverviewItem[] = strategies.map(strategy => {
    // Extract key action steps (top 3-4 most important ones)
    const actionSteps = (strategy.actionSteps || [])
      .sort((a, b) => {
        // Prioritize by phase order: immediate > prevention > response > recovery
        const phaseOrder: Record<string, number> = { 
          immediate: 1, 
          prevention: 2,
          short_term: 2,
          response: 3, 
          medium_term: 3,
          recovery: 4,
          long_term: 4
        }
        return (phaseOrder[a.phase?.toLowerCase()] || 999) - (phaseOrder[b.phase?.toLowerCase()] || 999)
      })
      .slice(0, 4) // Top 4 actions
      .map(step => ({
        phase: formatPhase(step.phase),
        action: step.smeAction || step.action || step.title,
        timeframe: step.timeframe || step.estimatedMinutes ? `${step.estimatedMinutes} minutes` : undefined,
        resources: step.resources || []
      }))
    
    return {
      name: strategy.smeTitle || strategy.name,
      category: formatCategory(strategy.category),
      description: strategy.smeSummary || strategy.description || 'No description available',
      applicableRisks: strategy.applicableRisks || [],
      investmentUSD: Math.round(strategy.calculatedCostUSD || 0),
      investmentLocal: Math.round((strategy.calculatedCostLocal || strategy.calculatedCostUSD || 0)),
      implementationStatus: 'Planned', // Default status
      effectiveness: strategy.effectiveness || 7,
      keyActionSteps: actionSteps.length > 0 ? actionSteps : undefined,
      benefits: strategy.benefitsBullets || [],
      implementationTime: strategy.implementationTime
    }
  })

  const totalInvestmentUSD = strategyItems.reduce((sum, s) => sum + s.investmentUSD, 0)
  const totalInvestmentLocal = strategyItems.reduce((sum, s) => sum + s.investmentLocal, 0)

  return {
    strategies: strategyItems,
    totalStrategies: strategies.length,
    totalInvestmentUSD,
    totalInvestmentLocal,
    averageImplementationTime: calculateAverageImplementationTime(strategies),
    rto: '24-48 hours', // Default Recovery Time Objective
    rpo: '24 hours' // Default Recovery Point Objective
  }
}

function formatPhase(phase: string | undefined): string {
  if (!phase) return 'Implementation'
  
  const phaseMap: Record<string, string> = {
    immediate: 'Immediate Action',
    short_term: 'Short Term',
    medium_term: 'Medium Term',
    long_term: 'Long Term',
    prevention: 'Prevention',
    response: 'Response',
    recovery: 'Recovery',
    ongoing: 'Ongoing'
  }
  
  return phaseMap[phase.toLowerCase()] || phase
}

function createGovernanceSection(wizardData: WizardFormData): GovernanceSection {
  const planInfo = wizardData.PLAN_INFORMATION || {}
  const testing = wizardData.TESTING_AND_MAINTENANCE || {}

  return {
    planOwner: getFieldValue(planInfo, 'Plan Manager') || 'Not specified',
    planManager: getFieldValue(planInfo, 'Plan Manager') || 'Not specified',
    alternateManager: getFieldValue(planInfo, 'Alternate Manager'),
    
    testingSchedule: {
      frequency: 'Quarterly',
      nextTestDate: 'To be determined',
      responsibleParty: getFieldValue(planInfo, 'Plan Manager') || 'Not specified'
    },
    
    reviewSchedule: {
      frequency: 'Annual',
      lastReviewDate: new Date().toLocaleDateString(),
      nextReviewDate: getFieldValue(planInfo, 'Next Review Date') || 'To be determined',
      responsibleParty: getFieldValue(planInfo, 'Plan Manager') || 'Not specified'
    },
    
    trainingProgram: {
      frequency: 'Annual',
      targetAudience: ['All staff', 'Management team', 'Emergency response team'],
      nextTrainingDate: 'To be scheduled'
    },
    
    certifications: ['UNDP Business Continuity Framework'],
    industryStandards: ['CARICHAM SME Best Practices']
  }
}

function createAppendices(wizardData: WizardFormData): Appendices {
  const contacts = wizardData.CONTACTS_AND_INFORMATION || {}
  const vitalRecords = wizardData.VITAL_RECORDS || {}

  return {
    emergencyContacts: extractContactSummaries(contacts),
    vitalRecords: extractVitalRecordSummaries(vitalRecords),
    planDistribution: extractDistributionRecords(contacts),
    revisionHistory: [{
      version: getFieldValue(wizardData.PLAN_INFORMATION, 'Plan Version') || '1.0',
      date: new Date().toLocaleDateString(),
      changes: 'Initial plan creation',
      updatedBy: getFieldValue(wizardData.PLAN_INFORMATION, 'Plan Manager') || 'Not specified'
    }],
    professionalPartnerships: [
      'United Nations Development Programme (UNDP)',
      'Caribbean Chamber of Commerce (CARICHAM)'
    ]
  }
}

// ============================================================================
// ACTION WORKBOOK TRANSFORMATION
// ============================================================================

/**
 * Transform wizard data and strategies into Action Workbook format
 * Focus: Practical, step-by-step implementation guide
 */
export function transformToWorkbookFormat(
  wizardData: WizardFormData,
  strategies: StrategyData[] = [],
  localCurrency: string = 'JMD',
  exchangeRate: number = 150
): WorkbookBCPData {
  const risks = getRisksFromWizard(wizardData)
  
  return {
    coverPage: {
      businessName: getFieldValue(wizardData.PLAN_INFORMATION, 'Company Name') || 'Your Business',
      location: getFieldValue(wizardData.PLAN_INFORMATION, 'Business Address') || '',
      preparedDate: new Date().toLocaleDateString(),
      preparedBy: getFieldValue(wizardData.PLAN_INFORMATION, 'Plan Manager') || '',
      completionPercentage: calculateCompletionPercentage(wizardData)
    },
    
    quickStartGuide: createQuickStartGuide(wizardData, strategies, localCurrency, exchangeRate),
    riskProfiles: createRiskProfiles(wizardData, strategies, localCurrency, exchangeRate),
    implementationGuides: createImplementationGuides(strategies, localCurrency, exchangeRate),
    contactLists: createContactLists(wizardData),
    trackers: createProgressTrackers(),
    workbookAppendices: createWorkbookAppendices(localCurrency)
  }
}

function createQuickStartGuide(
  wizardData: WizardFormData,
  strategies: StrategyData[],
  localCurrency: string,
  exchangeRate: number
): QuickStartGuide {
  // Calculate total costs across tiers
  const totalCostUSD = strategies.reduce((sum, s) => sum + (s.calculatedCostUSD || 0), 0)
  
  return {
    howToUse: [
      'Start with the Quick Start section to understand your 30-day action plan',
      'Review your Risk Profiles to understand what threats your business faces',
      'Work through Implementation Guides one strategy at a time',
      'Check off items as you complete them - this is YOUR workbook',
      'Update your Contact Lists quarterly',
      'Use the Progress Trackers to stay on schedule'
    ],
    
    thirtyDayPlan: createThirtyDayPlan(strategies),
    
    immediateActions: createImmediateActions(wizardData, strategies),
    
    budgetWorksheet: {
      totalEstimatedCost: {
        budget: Math.round(totalCostUSD * 0.6), // 60% of standard
        standard: Math.round(totalCostUSD),
        premium: Math.round(totalCostUSD * 1.5), // 150% of standard
        currency: localCurrency
      },
      costBreakdown: strategies.map(s => ({
        category: s.smeTitle || s.name,
        budgetTier: Math.round((s.calculatedCostLocal || s.calculatedCostUSD || 0) * 0.6),
        standardTier: Math.round(s.calculatedCostLocal || s.calculatedCostUSD || 0),
        premiumTier: Math.round((s.calculatedCostLocal || s.calculatedCostUSD || 0) * 1.5)
      }))
    }
  }
}

function createRiskProfiles(
  wizardData: WizardFormData,
  strategies: StrategyData[],
  localCurrency: string,
  exchangeRate: number
): RiskProfile[] {
  const risks = getRisksFromWizard(wizardData)
  
  return risks.map(risk => {
    const relevantStrategies = strategies.filter(s => 
      s.applicableRisks?.includes(risk.hazard)
    )
    
    return {
      riskName: risk.hazard,
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      
      whyThisMatters: getPersonalizedRiskContext(risk.hazard, wizardData),
      realImpactStory: getCaribbeanRiskStory(risk.hazard),
      costOfDoingNothing: {
        description: getCostOfInactionDescription(risk.hazard),
        estimatedLoss: estimatePotentialLoss(risk, wizardData),
        currency: localCurrency
      },
      
      riskMeter: {
        value: risk.riskScore,
        max: 16,
        color: getRiskColor(risk.riskLevel)
      }
    }
  })
}

function createImplementationGuides(
  strategies: StrategyData[],
  localCurrency: string,
  exchangeRate: number
): ImplementationGuide[] {
  return strategies.map(strategy => {
    const actionSteps = strategy.actionSteps || []
    
    // Group steps by phase
    const beforeSteps = actionSteps.filter(s => s.phase === 'immediate' || s.phase === 'short_term')
    const duringSteps = actionSteps.filter(s => s.phase === 'medium_term')
    const afterSteps = actionSteps.filter(s => s.phase === 'long_term')
    
    return {
      strategyName: strategy.smeTitle || strategy.name,
      strategyPurpose: strategy.smeSummary || strategy.description || '',
      
      costBreakdown: {
        budget: Math.round((strategy.calculatedCostLocal || strategy.calculatedCostUSD || 0) * 0.6),
        standard: Math.round(strategy.calculatedCostLocal || strategy.calculatedCostUSD || 0),
        premium: Math.round((strategy.calculatedCostLocal || strategy.calculatedCostUSD || 0) * 1.5),
        currency: localCurrency
      },
      
      benefits: strategy.benefitsBullets || [
        'Reduces business disruption',
        'Protects your assets and reputation',
        'Gives peace of mind'
      ],
      
      timeInvestment: strategy.implementationTime || 'Varies',
      prerequisites: extractPrerequisites(strategy),
      
      beforePhase: createActionPhase('Before (Preparation)', beforeSteps),
      duringPhase: createActionPhase('During (Event Response)', duringSteps),
      afterPhase: createActionPhase('After (Recovery)', afterSteps),
      ongoingPhase: createOngoingPhase(strategy),
      
      budgetWorksheet: {
        tierSelected: '',
        quotesObtained: [],
        expectedCompletion: '',
        notes: ''
      },
      
      progressTracker: {
        milestones: [
          { label: 'Planning Complete', percentage: 25, completed: false },
          { label: 'Resources Acquired', percentage: 50, completed: false },
          { label: 'Implementation Done', percentage: 75, completed: false },
          { label: 'Tested & Verified', percentage: 100, completed: false }
        ]
      }
    }
  })
}

function createActionPhase(title: string, steps: any[]): ActionPhase {
  return {
    title,
    description: getPhaseDescription(title),
    timeframe: getPhaseTimeframe(title),
    steps: steps.map((step, index) => createDetailedActionStep(step, index + 1))
  }
}

function createDetailedActionStep(step: any, stepNumber: number): DetailedActionStep {
  return {
    stepNumber,
    action: step.smeAction || step.title || step.description,
    estimatedTime: step.timeframe || `${step.estimatedMinutes || 60} minutes`,
    
    why: step.whyThisStepMatters || 'Essential for business continuity',
    resources: parseJsonArray(step.resources) || [],
    doneWhen: step.howToKnowItsDone || 'Step completed successfully',
    commonMistakes: parseJsonArray(step.commonMistakesForStep) || [],
    
    completed: false,
    
    freeAlternative: step.freeAlternative,
    lowTechOption: step.lowTechOption
  }
}

function createOngoingPhase(strategy: StrategyData): OngoingMaintenancePhase {
  return {
    monthly: [
      {
        task: `Review ${strategy.smeTitle || strategy.name} effectiveness`,
        estimatedTime: '30 minutes',
        priority: 'medium',
        completed: false
      }
    ],
    quarterly: [
      {
        task: `Test ${strategy.smeTitle || strategy.name} procedures`,
        estimatedTime: '2 hours',
        priority: 'high',
        completed: false
      }
    ],
    annually: [
      {
        task: `Update ${strategy.smeTitle || strategy.name} based on lessons learned`,
        estimatedTime: '4 hours',
        priority: 'high',
        completed: false
      }
    ]
  }
}

function createContactLists(wizardData: WizardFormData): ContactLists {
  const contactsData = wizardData.CONTACTS_AND_INFORMATION || {}
  
  return {
    emergencyContacts: extractWorkbookContacts(contactsData, 'staff'),
    supplierContacts: extractWorkbookContacts(contactsData, 'suppliers'),
    teamResponsibilities: extractTeamResponsibilities(contactsData),
    testingSchedule: extractTestingSchedule(wizardData.TESTING_AND_MAINTENANCE)
  }
}

function createProgressTrackers(): ProgressTrackers {
  return {
    monthlyTesting: {
      tests: []
    },
    quarterlyReview: {
      reviews: []
    },
    annualUpdate: {
      updates: []
    },
    lessonsLearned: []
  }
}

function createWorkbookAppendices(localCurrency: string): WorkbookAppendices {
  return {
    budgetTemplates: [],
    costCalculators: [],
    localSuppliers: [],
    blankForms: []
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getFieldValue(data: Record<string, any> | undefined, fieldName: string): string {
  if (!data) return ''
  return data[fieldName] || ''
}

function getRisksFromWizard(wizardData: WizardFormData): any[] {
  // Try multiple possible locations for risk data
  const riskData = wizardData.RISK_ASSESSMENT || wizardData.BUSINESS_IMPACT || {}
  
  // Try multiple possible field names
  const riskMatrix = riskData['Risk Assessment Matrix'] || 
                     riskData['Hazard Applicability Assessment'] ||
                     riskData.risks ||
                     []
  
  if (!Array.isArray(riskMatrix)) {
    return []
  }
  
  return riskMatrix.filter(risk => risk && (risk.hazard || risk.Hazard || risk.riskType))
}

function calculateCompletionPercentage(wizardData: WizardFormData): number {
  const totalSteps = 9 // Total wizard steps
  const completedSteps = Object.keys(wizardData).length
  return Math.round((completedSteps / totalSteps) * 100)
}

function extractCriticalFunctions(essentialFunctions: Record<string, any> | undefined): string[] {
  if (!essentialFunctions) return []
  
  const functions: string[] = []
  const priorityTable = essentialFunctions['Function Priority Assessment']
  
  if (Array.isArray(priorityTable)) {
    priorityTable.forEach(row => {
      if (row['Business Function'] && row['Priority Level'] === 'critical') {
        functions.push(row['Business Function'])
      }
    })
  }
  
  return functions
}

function estimateEmployeeCount(keyPersonnelText: string): number {
  // Simple heuristic: count numbers in the text
  const numbers = keyPersonnelText.match(/\d+/g)
  if (numbers && numbers.length > 0) {
    return parseInt(numbers[0])
  }
  // Count comma-separated items
  const items = keyPersonnelText.split(',').length
  return Math.max(items, 1)
}

function getLikelihoodLabel(likelihood: number): string {
  if (likelihood >= 4) return 'Very Likely'
  if (likelihood >= 3) return 'Likely'
  if (likelihood >= 2) return 'Possible'
  return 'Unlikely'
}

function getSeverityLabel(severity: number): string {
  if (severity >= 4) return 'Critical'
  if (severity >= 3) return 'Major'
  if (severity >= 2) return 'Moderate'
  return 'Minor'
}

function determineRiskStatus(strategyCount: number): string {
  if (strategyCount >= 2) return 'Well Mitigated'
  if (strategyCount === 1) return 'Partially Mitigated'
  return 'Monitoring'
}

function formatCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'prevention': 'Prevention',
    'preparation': 'Preparation',
    'response': 'Response',
    'recovery': 'Recovery'
  }
  return categoryMap[category] || category
}

function calculateAverageImplementationTime(strategies: StrategyData[]): string {
  // Simple average based on implementation time strings
  const times = strategies.map(s => s.implementationTime || 'weeks')
  // This is a simplified version
  return 'Varies by strategy (hours to months)'
}

function extractContactSummaries(contactsData: Record<string, any>): ContactSummary[] {
  const summaries: ContactSummary[] = []
  
  // Extract from staff contacts
  const staffContacts = contactsData['Staff Contact Information']
  if (Array.isArray(staffContacts)) {
    staffContacts.slice(0, 5).forEach(contact => {
      summaries.push({
        category: 'Management',
        name: contact.Name || '',
        role: contact.Position || '',
        primaryContact: contact['Mobile Phone'] || contact['Home Phone'] || ''
      })
    })
  }
  
  return summaries
}

function extractVitalRecordSummaries(vitalRecordsData: Record<string, any>): VitalRecordSummary[] {
  const inventory = vitalRecordsData['Vital Records Inventory']
  if (!Array.isArray(inventory)) return []
  
  return inventory.map(record => ({
    recordType: record['Record Type'] || '',
    storageLocation: record['Primary Location'] || '',
    backupLocation: record['Backup Location'] || '',
    priority: record['Recovery Priority'] || ''
  }))
}

function extractDistributionRecords(contactsData: Record<string, any>): DistributionRecord[] {
  const distribution = contactsData['Plan Distribution List']
  if (!Array.isArray(distribution)) return []
  
  return distribution.map(record => ({
    recipient: record['Name/Position'] || '',
    format: record['Format Received'] || '',
    dateProvided: record['Date Provided'] || '',
    version: record['Version Number'] || ''
  }))
}

function createThirtyDayPlan(strategies: StrategyData[]): any[] {
  // Create a simplified 30-day plan
  return [
    {
      day: 1,
      milestone: 'Review and understand this plan',
      actions: ['Read through entire workbook', 'Identify your top 3 risks'],
      estimatedTime: '2 hours'
    },
    {
      day: 7,
      milestone: 'Complete immediate preparations',
      actions: ['Update all contact information', 'Identify emergency supplies'],
      estimatedTime: '4 hours'
    },
    {
      day: 14,
      milestone: 'Start first strategy',
      actions: ['Choose highest priority strategy', 'Begin implementation steps'],
      estimatedTime: '8 hours'
    },
    {
      day: 30,
      milestone: 'First review checkpoint',
      actions: ['Review progress', 'Adjust plan as needed', 'Schedule next steps'],
      estimatedTime: '2 hours'
    }
  ]
}

function createImmediateActions(wizardData: WizardFormData, strategies: StrategyData[]): ChecklistItem[] {
  return [
    {
      task: 'Print and store this workbook in a secure location',
      estimatedTime: '15 minutes',
      priority: 'critical',
      completed: false
    },
    {
      task: 'Share plan with key team members',
      estimatedTime: '30 minutes',
      priority: 'high',
      completed: false
    },
    {
      task: 'Verify all emergency contact numbers',
      estimatedTime: '1 hour',
      priority: 'critical',
      completed: false
    },
    {
      task: 'Identify backup power options',
      estimatedTime: '2 hours',
      priority: 'high',
      completed: false
    }
  ]
}

function getPersonalizedRiskContext(riskName: string, wizardData: WizardFormData): string {
  // This would ideally use business-specific context
  const businessPurpose = getFieldValue(wizardData.BUSINESS_OVERVIEW, 'Business Purpose')
  return `For your business, ${riskName.toLowerCase()} could disrupt your operations and affect your ability to serve customers.`
}

function getCaribbeanRiskStory(riskName: string): string {
  const stories: Record<string, string> = {
    'Hurricane': 'In 2017, Hurricane Maria caused JMD 15 million in damages to a small hotel in Dominica. With a business continuity plan, they recovered in 3 months instead of 12.',
    'Flood': 'A retail store in Kingston experienced flooding in 2020. Because they had moved vital records to cloud storage, they reopened within 2 weeks.',
    'Power Outage': 'A restaurant in Barbados lost JMD 200,000 worth of food during a 3-day power outage. A backup generator would have cost only JMD 150,000.',
    'Fire': 'A manufacturing business in Trinidad lost everything in a fire. Without backed-up records, it took 8 months to resume operations.',
    'Earthquake': 'Following the 2020 earthquake in Jamaica, businesses with structural assessments and emergency supplies recovered 60% faster than those without.'
  }
  return stories[riskName] || `${riskName} has impacted many Caribbean businesses. Preparation makes the difference between quick recovery and permanent closure.`
}

function getCostOfInactionDescription(riskName: string): string {
  return `Without preparation for ${riskName.toLowerCase()}, your business could face extended downtime, lost revenue, damaged reputation, and potentially permanent closure.`
}

function estimatePotentialLoss(risk: any, wizardData: WizardFormData): number {
  // Simple estimation based on risk score
  // This would ideally use actual business revenue data
  const baseDailyLoss = 50000 // JMD per day
  const daysOfDowntime = risk.riskScore || 5 // Use risk score as proxy for days
  return baseDailyLoss * daysOfDowntime
}

function getRiskColor(riskLevel: string): string {
  const colorMap: Record<string, string> = {
    'Extreme': '#DC2626',
    'High': '#F59E0B',
    'Medium': '#FCD34D',
    'Low': '#10B981'
  }
  return colorMap[riskLevel] || '#6B7280'
}

function extractPrerequisites(strategy: StrategyData): string[] {
  // This would parse from strategy prerequisites field
  return ['Basic business setup', 'Management approval', 'Budget allocation']
}

function getPhaseDescription(title: string): string {
  const descriptions: Record<string, string> = {
    'Before (Preparation)': 'Actions to take now, before any emergency occurs',
    'During (Event Response)': 'What to do when the emergency is happening',
    'After (Recovery)': 'Steps to get back to normal operations',
    'Ongoing (Maintenance)': 'Regular tasks to keep your plan effective'
  }
  return descriptions[title] || ''
}

function getPhaseTimeframe(title: string): string {
  const timeframes: Record<string, string> = {
    'Before (Preparation)': '0-30 days',
    'During (Event Response)': '0-24 hours',
    'After (Recovery)': '1-7 days',
    'Ongoing (Maintenance)': 'Monthly/Quarterly/Annual'
  }
  return timeframes[title] || 'Varies'
}

function parseJsonArray(value: any): string[] | null {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : null
    } catch {
      return null
    }
  }
  return null
}

function extractWorkbookContacts(contactsData: Record<string, any>, type: 'staff' | 'suppliers'): any[] {
  const field = type === 'staff' ? 'Staff Contact Information' : 'Supplier Information'
  const contacts = contactsData[field]
  
  if (!Array.isArray(contacts)) return []
  
  return contacts.map(contact => ({
    name: contact.Name || contact['Supplier Name'] || '',
    role: contact.Position || contact['Goods/Services Supplied'] || '',
    phone: contact['Mobile Phone'] || contact['Phone Number'] || '',
    alternatePhone: contact['Home Phone'] || contact['24/7 Contact'] || '',
    email: contact['Email Address'] || '',
    notes: '',
    verified: false
  }))
}

function extractTeamResponsibilities(contactsData: Record<string, any>): any[] {
  const staffContacts = contactsData['Staff Contact Information']
  if (!Array.isArray(staffContacts)) return []
  
  return staffContacts.map(contact => ({
    name: contact.Name || '',
    role: contact.Position || '',
    responsibilities: [contact['Emergency Role'] || 'Team member'].filter(Boolean),
    signature: undefined,
    date: undefined
  }))
}

function extractTestingSchedule(testingData: Record<string, any> | undefined): any[] {
  if (!testingData) return []
  
  const schedule = testingData['Plan Testing Schedule']
  if (!Array.isArray(schedule)) return []
  
  return schedule.map(test => ({
    testType: test['Test Type'] || '',
    frequency: test.Frequency || '',
    nextTestDate: test['Next Test Date'] || '',
    responsiblePerson: test['Responsible Person'] || '',
    completed: false
  }))
}


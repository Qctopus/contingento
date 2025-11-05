/**
 * Type definitions for Business Continuity Plan Export Formats
 * Supports two distinct export modes: Bank-Ready and Action Workbook
 */

// Export mode type
export type BCPExportMode = 'bank' | 'workbook' | 'formal'

// ============================================================================
// BANK-READY DOCUMENT TYPES
// ============================================================================

/**
 * Bank-Ready BCP Data Structure
 * Professional format for lending institutions, insurance companies, etc.
 */
export interface BankReadyBCPData {
  executiveSummary: ExecutiveSummary
  businessProfile: BusinessProfile
  riskSummary: RiskSummaryTable
  strategyOverview: StrategyOverview
  governance: GovernanceSection
  appendices: Appendices
}

export interface ExecutiveSummary {
  companyName: string
  companyAddress: string
  preparedDate: string
  planVersion: string
  
  // Key metrics
  totalRisksIdentified: number
  highPriorityRisks: number
  totalStrategiesImplemented: number
  totalInvestmentUSD: number
  totalInvestmentLocal: number
  localCurrency: string
  
  // Status
  planCompletionPercentage: number
  lastTestedDate?: string
  nextReviewDate: string
  
  // Compliance
  undpCompliant: boolean
  carichamCertified: boolean
}

export interface BusinessProfile {
  // Basic Information
  companyName: string
  businessLicense: string
  address: string
  operatingHours: string
  
  // Business Details
  businessPurpose: string
  productsServices: string
  industryCategory: string
  
  // Scale
  numberOfEmployees: number
  annualRevenue?: string
  customerBase: string
  
  // Critical Operations
  criticalFunctions: string[]
  minimumResources: string
  keyPersonnel: string
  
  // Management
  planManager: string
  alternateManager?: string
}

export interface RiskSummaryTable {
  risks: RiskSummaryItem[]
  totalRisksAssessed: number
  highPriorityCount: number
  mediumPriorityCount: number
  lowPriorityCount: number
}

export interface RiskSummaryItem {
  riskName: string
  likelihood: string // 'Very Likely', 'Likely', 'Possible', etc.
  impact: string // 'Critical', 'Major', 'Moderate', etc.
  riskScore: number
  riskLevel: string // 'Extreme', 'High', 'Medium', 'Low'
  status: string // 'Mitigated', 'Monitoring', 'Accepted'
  investmentUSD: number
  investmentLocal: number
}

export interface StrategyOverview {
  strategies: StrategyOverviewItem[]
  totalStrategies: number
  totalInvestmentUSD: number
  totalInvestmentLocal: number
  averageImplementationTime: string
  
  // Recovery objectives
  rto: string // Recovery Time Objective
  rpo: string // Recovery Point Objective
}

export interface StrategyOverviewItem {
  name: string
  category: string // 'Prevention', 'Preparation', 'Response', 'Recovery'
  description: string
  applicableRisks: string[]
  investmentUSD: number
  investmentLocal: number
  implementationStatus: string // 'Planned', 'In Progress', 'Complete'
  effectiveness: number // 1-10 scale
  // ADDED: Detailed action steps for banks to review
  keyActionSteps?: {
    phase: string
    action: string
    timeframe?: string
    resources?: string[]
  }[]
  benefits?: string[]
  implementationTime?: string
}

export interface GovernanceSection {
  // Ownership
  planOwner: string
  planManager: string
  alternateManager?: string
  
  // Maintenance Schedule
  testingSchedule: {
    frequency: string
    lastTestDate?: string
    nextTestDate: string
    responsibleParty: string
  }
  
  reviewSchedule: {
    frequency: string
    lastReviewDate: string
    nextReviewDate: string
    responsibleParty: string
  }
  
  // Training
  trainingProgram: {
    frequency: string
    targetAudience: string[]
    lastTrainingDate?: string
    nextTrainingDate: string
  }
  
  // Compliance
  certifications: string[]
  industryStandards: string[]
}

export interface Appendices {
  // Key Contacts (summary only, not detailed procedures)
  emergencyContacts: ContactSummary[]
  
  // Vital Records
  vitalRecords: VitalRecordSummary[]
  
  // Distribution
  planDistribution: DistributionRecord[]
  
  // Revision History
  revisionHistory: RevisionRecord[]
  
  // Professional Partnerships
  professionalPartnerships: string[]
}

export interface ContactSummary {
  category: string // 'Management', 'Emergency Services', 'Key Suppliers'
  name: string
  role: string
  primaryContact: string
}

export interface VitalRecordSummary {
  recordType: string
  storageLocation: string
  backupLocation: string
  priority: string
}

export interface DistributionRecord {
  recipient: string
  format: string
  dateProvided: string
  version: string
}

export interface RevisionRecord {
  version: string
  date: string
  changes: string
  updatedBy: string
}

// ============================================================================
// FORMAL BCP TYPES (for Loan Submissions)
// ============================================================================

/**
 * Formal BCP Data Structure
 * Professional 8-12 page document for bank loan submissions
 */
export interface FormalBCPData {
  // Cover page data
  coverPage: FormalCoverPage
  
  // Section 1: Business Overview (1-2 pages)
  businessOverview: FormalBusinessOverview
  
  // Section 2: Risk Assessment (2 pages)
  riskAssessment: FormalRiskAssessment
  
  // Section 3: Continuity Strategies (3-4 pages)
  continuityStrategies: FormalContinuityStrategies
  
  // Section 4: Emergency Response Procedures (1-2 pages)
  emergencyResponse: FormalEmergencyResponse
  
  // Section 5: Plan Maintenance & Testing (1 page)
  planMaintenance: FormalPlanMaintenance
  
  // Section 6: Appendices (1 page)
  appendices: FormalAppendices
}

export interface FormalCoverPage {
  businessName: string
  parish: string
  country: string
  planVersion: string
  datePrepared: string
  planManager: string
  planManagerTitle: string
  businessDescription: string
}

export interface FormalBusinessOverview {
  // Basic info table
  businessInfo: {
    businessName: string
    licenseNumber: string
    businessType: string
    physicalAddress: string
    yearsInOperation: string
    businessPurpose: string
  }
  
  // Business scale
  businessScale: {
    totalEmployees: number
    fullTimeEmployees?: number
    partTimeEmployees?: number
    annualRevenue: string
    operatingSchedule: string
    primaryMarkets: string
  }
  
  // What we offer
  productsAndServices: string
  competitiveAdvantages: string[]
  
  // Essential operations
  essentialFunctions: {
    functionName: string
    description: string
  }[]
  minimumResourceRequirements: string
}

export interface FormalRiskAssessment {
  // Summary stats
  totalRisksIdentified: number
  highPriorityRisksCount: number
  
  // Major risks (HIGH/EXTREME only)
  majorRisks: FormalRiskItem[]
  
  // Complete risk summary table
  allRisksSummary: {
    hazard: string
    likelihood: string
    impact: string
    riskLevel: string
    riskScore: number
    mitigationStatus: string
  }[]
  
  // Business impact without preparation
  potentialImpact: {
    revenueL oss: string
    assetDamage: string
    recoveryTime: string
    customerRelationships: string
  }
}

export interface FormalRiskItem {
  hazardName: string
  riskScore: number
  riskLevel: string
  likelihood: string
  potentialImpact: string
  vulnerability: string
  potentialLoss: string
}

export interface FormalContinuityStrategies {
  // Investment summary
  totalInvestment: number
  investmentBreakdown: {
    prevention: number
    preventionPercentage: number
    response: number
    responsePercentage: number
    recovery: number
    recoveryPercentage: number
  }
  
  // Strategies grouped by risk
  strategiesByRisk: {
    riskName: string
    strategyCount: number
    totalInvestment: number
    strategies: FormalStrategyItem[]
  }[]
  
  // Alternative approaches (low-budget options)
  lowBudgetAlternatives: {
    strategyName: string
    alternativeDescription: string
    cost: number
  }[]
  
  // Recovery objectives
  recoveryObjectives: {
    functionName: string
    targetRecoveryTime: string
  }[]
}

export interface FormalStrategyItem {
  name: string
  purpose: string
  benefits: string[]
  implementation: {
    investmentRequired: string
    setupTime: string
    effectiveness: number
    status: string
    responsiblePerson: string
  }
  keyActions: {
    action: string
    phase: string
  }[]
  lowBudgetOption?: string
}

export interface FormalEmergencyResponse {
  // Leadership
  emergencyLeadership: {
    role: string
    person: string
    contact: string
  }[]
  
  // Emergency response team
  responseTeam: {
    name: string
    normalRole: string
    emergencyResponsibility: string
    contact: string
  }[]
  
  // Critical contacts
  emergencyServices: {
    service: string
    provider: string
    contact: string
    accountNumber?: string
  }[]
  
  essentialProviders: {
    service: string
    provider: string
    contact: string
    accountNumber?: string
  }[]
  
  keySuppliers: {
    supplier: string
    productService: string
    contact: string
  }[]
  
  // Essential documents
  essentialDocuments: {
    recordType: string
    primaryLocation: string
    backupLocation: string
  }[]
  
  documentStorage: {
    physicalCopies: string
    digitalCopies: string
  }
}

export interface FormalPlanMaintenance {
  // Testing schedule
  testingSchedule: {
    testActivity: string
    frequency: string
    nextTest: string
  }[]
  
  // Plan review
  reviewInfo: {
    regularReviews: string
    nextScheduledReview: string
    updateTriggers: string[]
    responsiblePerson: string
  }
  
  // Staff training
  staffTraining: {
    trainingTopics: string[]
    trainingSchedule: string
  }
}

export interface FormalAppendices {
  // Revision history
  revisionHistory: {
    version: string
    date: string
    changes: string
    updatedBy: string
  }[]
  
  // Plan distribution
  planDistribution: {
    recipient: string
    dateProvided: string
    format: string
  }[]
  
  // Certifications
  certifications: {
    technicalAssistance: string[]
    industryStandards: string[]
  }
  
  // Approval section
  approval: {
    preparedDate: string
    planManagerName: string
    planManagerContact: string
    planManagerEmail: string
  }
}

// ============================================================================
// ACTION WORKBOOK TYPES
// ============================================================================

/**
 * Action Workbook Data Structure
 * Practical implementation guide for business owners
 */
export interface WorkbookBCPData {
  // Cover Page
  coverPage: WorkbookCoverPage
  
  // Quick Start
  quickStartGuide: QuickStartGuide
  
  // Risk Profiles (personalized)
  riskProfiles: RiskProfile[]
  
  // Implementation Guides (detailed step-by-step)
  implementationGuides: ImplementationGuide[]
  
  // Contact Lists (with checkboxes)
  contactLists: ContactLists
  
  // Progress Trackers
  trackers: ProgressTrackers
  
  // Appendices
  workbookAppendices: WorkbookAppendices
}

export interface WorkbookCoverPage {
  businessName: string
  location: string
  preparedDate: string
  preparedBy: string
  completionPercentage: number
}

export interface QuickStartGuide {
  howToUse: string[]
  thirtyDayPlan: ThirtyDayPlanItem[]
  immediateActions: ChecklistItem[]
  budgetWorksheet: BudgetWorksheet
}

export interface ThirtyDayPlanItem {
  day: number
  milestone: string
  actions: string[]
  estimatedTime: string
}

export interface ChecklistItem {
  task: string
  estimatedTime: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  completed: boolean
}

export interface BudgetWorksheet {
  totalEstimatedCost: {
    budget: number
    standard: number
    premium: number
    currency: string
  }
  costBreakdown: {
    category: string
    budgetTier: number
    standardTier: number
    premiumTier: number
  }[]
}

export interface RiskProfile {
  // Risk Identification
  riskName: string
  riskScore: number
  riskLevel: string
  
  // Personalized Context
  whyThisMatters: string // Specific to this business
  realImpactStory: string // Caribbean example
  costOfDoingNothing: {
    description: string
    estimatedLoss: number
    currency: string
  }
  
  // Visual indicator (for PDF rendering)
  riskMeter: {
    value: number
    max: number
    color: string
  }
}

export interface ImplementationGuide {
  // Strategy Overview
  strategyName: string
  strategyPurpose: string
  
  // Cost Breakdown
  costBreakdown: {
    budget: number
    standard: number
    premium: number
    currency: string
  }
  
  // Benefits
  benefits: string[]
  timeInvestment: string
  prerequisites: string[]
  
  // Phase-Organized Checklists
  beforePhase: ActionPhase
  duringPhase: ActionPhase
  afterPhase: ActionPhase
  ongoingPhase: OngoingMaintenancePhase
  
  // Worksheets
  budgetWorksheet: StrategyBudgetWorksheet
  progressTracker: StrategyProgressTracker
}

export interface ActionPhase {
  title: string
  description: string
  timeframe: string
  steps: DetailedActionStep[]
}

export interface DetailedActionStep {
  stepNumber: number
  action: string
  estimatedTime: string
  
  // Context
  why: string // Why this matters
  resources: string[] // What you need
  doneWhen: string // Success criteria
  commonMistakes: string[] // What to avoid
  
  // Checkbox for user
  completed: boolean
  
  // Free/low-cost alternatives
  freeAlternative?: string
  lowTechOption?: string
}

export interface OngoingMaintenancePhase {
  monthly: ChecklistItem[]
  quarterly: ChecklistItem[]
  annually: ChecklistItem[]
}

export interface StrategyBudgetWorksheet {
  tierSelected: string
  quotesObtained: string[]
  expectedCompletion: string
  actualCost?: number
  notes: string
}

export interface StrategyProgressTracker {
  milestones: {
    label: string
    percentage: number
    completed: boolean
    completedDate?: string
  }[]
}

export interface ContactLists {
  emergencyContacts: WorkbookContact[]
  supplierContacts: WorkbookContact[]
  teamResponsibilities: TeamResponsibility[]
  testingSchedule: TestingScheduleItem[]
}

export interface WorkbookContact {
  name: string
  role: string
  phone: string
  alternatePhone?: string
  email: string
  notes: string
  verified: boolean
  lastVerified?: string
}

export interface TeamResponsibility {
  name: string
  role: string
  responsibilities: string[]
  signature?: string
  date?: string
}

export interface TestingScheduleItem {
  testType: string
  frequency: string
  nextTestDate: string
  responsiblePerson: string
  completed: boolean
  lastTestDate?: string
  notes?: string
}

export interface ProgressTrackers {
  // Monthly Testing
  monthlyTesting: MonthlyTestingTracker
  
  // Quarterly Review
  quarterlyReview: QuarterlyReviewTracker
  
  // Annual Update
  annualUpdate: AnnualUpdateTracker
  
  // Lessons Learned
  lessonsLearned: LessonsLearnedLog[]
}

export interface MonthlyTestingTracker {
  tests: {
    testName: string
    completed: boolean
    date?: string
    results: string
    issues: string
  }[]
}

export interface QuarterlyReviewTracker {
  reviews: {
    quarter: string
    year: number
    completed: boolean
    date?: string
    contactsUpdated: boolean
    strategiesReviewed: boolean
    budgetReviewed: boolean
    notes: string
  }[]
}

export interface AnnualUpdateTracker {
  updates: {
    year: number
    completed: boolean
    date?: string
    majorChanges: string[]
    newRisksIdentified: string[]
    strategiesUpdated: string[]
    version: string
  }[]
}

export interface LessonsLearnedLog {
  date: string
  eventType: string // 'Test', 'Real Incident', 'Review'
  whatHappened: string
  whatWorked: string
  whatDidntWork: string
  improvements: string[]
  status: 'Open' | 'In Progress' | 'Completed'
}

export interface WorkbookAppendices {
  // Templates
  budgetTemplates: BudgetTemplate[]
  
  // Cost Calculators
  costCalculators: CostCalculator[]
  
  // Local Supplier Directories
  localSuppliers: LocalSupplierDirectory[]
  
  // Blank Forms
  blankForms: BlankForm[]
}

export interface BudgetTemplate {
  name: string
  description: string
  categories: string[]
  fillableFields: string[]
}

export interface CostCalculator {
  name: string
  description: string
  formula: string
  example: string
}

export interface LocalSupplierDirectory {
  category: string
  suppliers: {
    name: string
    service: string
    phone: string
    location: string
    estimatedCost?: string
  }[]
}

export interface BlankForm {
  formName: string
  purpose: string
  fields: string[]
}

// ============================================================================
// SHARED/UTILITY TYPES
// ============================================================================

/**
 * Common data from wizard that both formats need
 */
export interface WizardFormData {
  PLAN_INFORMATION?: Record<string, any>
  BUSINESS_OVERVIEW?: Record<string, any>
  ESSENTIAL_FUNCTIONS?: Record<string, any>
  RISK_ASSESSMENT?: Record<string, any>
  BUSINESS_IMPACT?: Record<string, any>
  CONTINUITY_STRATEGIES?: Record<string, any>
  CONTACTS_AND_INFORMATION?: Record<string, any>
  VITAL_RECORDS?: Record<string, any>
  TESTING_AND_MAINTENANCE?: Record<string, any>
}

/**
 * Strategy data from database
 */
export interface StrategyData {
  id: string
  strategyId: string
  name: string
  smeTitle?: string
  category: string
  description: string
  smeSummary?: string
  benefitsBullets?: string[]
  implementationCost: string
  implementationTime?: string
  effectiveness: number
  priority: string
  applicableRisks: string[]
  actionSteps?: ActionStepData[]
  calculatedCostUSD?: number
  calculatedCostLocal?: number
}

export interface ActionStepData {
  id: string
  stepId: string
  phase: string
  title: string
  description: string
  smeAction?: string
  timeframe?: string
  estimatedMinutes?: number
  difficultyLevel?: string
  
  // SME Context
  whyThisStepMatters?: string
  whatHappensIfSkipped?: string
  
  // Resources
  resources?: string[]
  checklist?: string[]
  
  // Validation
  howToKnowItsDone?: string
  exampleOutput?: string
  
  // Alternatives
  freeAlternative?: string
  lowTechOption?: string
  
  // Help
  commonMistakesForStep?: string[]
  videoTutorialUrl?: string
}

/**
 * PDF generation options
 */
export interface PDFGenerationOptions {
  mode: BCPExportMode
  includeWatermark?: boolean
  includeBranding?: boolean
  companyLogo?: string
  pageNumbers?: boolean
  tableOfContents?: boolean
}

/**
 * Export result
 */
export interface ExportResult {
  success: boolean
  filename: string
  blob?: Blob
  error?: string
  pageCount?: number
  fileSize?: number
}



Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.BusinessContinuityPlanScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PlanInformationScalarFieldEnum = {
  id: 'id',
  planId: 'planId',
  companyName: 'companyName',
  planManager: 'planManager',
  alternateManager: 'alternateManager',
  physicalPlanLocation: 'physicalPlanLocation',
  digitalPlanLocation: 'digitalPlanLocation'
};

exports.Prisma.BusinessOverviewScalarFieldEnum = {
  id: 'id',
  planId: 'planId',
  businessLicenseNumber: 'businessLicenseNumber',
  businessPurpose: 'businessPurpose',
  productsAndServices: 'productsAndServices',
  serviceDeliveryMethods: 'serviceDeliveryMethods',
  operatingHours: 'operatingHours',
  keyPersonnel: 'keyPersonnel',
  minimumResources: 'minimumResources',
  customerBase: 'customerBase',
  serviceProviderBCP: 'serviceProviderBCP'
};

exports.Prisma.EssentialFunctionScalarFieldEnum = {
  id: 'id',
  planId: 'planId',
  supplyChainManagement: 'supplyChainManagement',
  staffManagement: 'staffManagement',
  technology: 'technology',
  productsServices: 'productsServices',
  infrastructureFacilities: 'infrastructureFacilities',
  sales: 'sales',
  administration: 'administration'
};

exports.Prisma.RiskAssessmentScalarFieldEnum = {
  id: 'id',
  planId: 'planId',
  potentialHazards: 'potentialHazards',
  hazards: 'hazards'
};

exports.Prisma.StrategyScalarFieldEnum = {
  id: 'id',
  planId: 'planId',
  preventionStrategies: 'preventionStrategies',
  responseStrategies: 'responseStrategies',
  recoveryStrategies: 'recoveryStrategies',
  longTermRiskReduction: 'longTermRiskReduction'
};

exports.Prisma.ActionPlanScalarFieldEnum = {
  id: 'id',
  planId: 'planId',
  actionPlanByRisk: 'actionPlanByRisk',
  implementationTimeline: 'implementationTimeline',
  resourceRequirements: 'resourceRequirements',
  responsibleParties: 'responsibleParties',
  reviewUpdateSchedule: 'reviewUpdateSchedule',
  testingAssessmentPlan: 'testingAssessmentPlan'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  currentStep: 'currentStep',
  stepData: 'stepData'
};

exports.Prisma.BusinessProfileScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  name: 'name',
  industry: 'industry',
  size: 'size',
  location: 'location'
};

exports.Prisma.ContactsInformationScalarFieldEnum = {
  id: 'id',
  planId: 'planId',
  staffContactInfo: 'staffContactInfo',
  keyCustomerContacts: 'keyCustomerContacts',
  supplierInformation: 'supplierInformation',
  emergencyServicesUtilities: 'emergencyServicesUtilities',
  criticalBusinessInfo: 'criticalBusinessInfo',
  planDistributionList: 'planDistributionList'
};

exports.Prisma.TestingMaintenanceScalarFieldEnum = {
  id: 'id',
  planId: 'planId',
  planTestingSchedule: 'planTestingSchedule',
  planRevisionHistory: 'planRevisionHistory',
  improvementTracking: 'improvementTracking',
  annualReviewProcess: 'annualReviewProcess',
  triggerEventsForUpdates: 'triggerEventsForUpdates'
};

exports.Prisma.AnonymousSessionScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  businessName: 'businessName',
  displayBusinessName: 'displayBusinessName',
  pin: 'pin',
  email: 'email',
  planData: 'planData',
  shareableId: 'shareableId',
  allowSharing: 'allowSharing',
  createdAt: 'createdAt',
  lastAccessed: 'lastAccessed'
};

exports.Prisma.AdminBusinessTypeScalarFieldEnum = {
  id: 'id',
  businessTypeId: 'businessTypeId',
  name: 'name',
  localName: 'localName',
  category: 'category',
  description: 'description',
  typicalOperatingHours: 'typicalOperatingHours',
  minimumStaff: 'minimumStaff',
  minimumEquipment: 'minimumEquipment',
  minimumUtilities: 'minimumUtilities',
  minimumSpace: 'minimumSpace',
  essentialFunctions: 'essentialFunctions',
  criticalSuppliers: 'criticalSuppliers',
  exampleBusinessPurposes: 'exampleBusinessPurposes',
  exampleProducts: 'exampleProducts',
  exampleKeyPersonnel: 'exampleKeyPersonnel',
  exampleCustomerBase: 'exampleCustomerBase',
  dependencies: 'dependencies',
  vulnerabilityMatrix: 'vulnerabilityMatrix',
  operationalThresholds: 'operationalThresholds',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdminHazardTypeScalarFieldEnum = {
  id: 'id',
  hazardId: 'hazardId',
  name: 'name',
  category: 'category',
  description: 'description',
  defaultFrequency: 'defaultFrequency',
  defaultImpact: 'defaultImpact',
  seasonalPattern: 'seasonalPattern',
  peakMonths: 'peakMonths',
  warningTime: 'warningTime',
  geographicScope: 'geographicScope',
  cascadingRisks: 'cascadingRisks',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdminLocationScalarFieldEnum = {
  id: 'id',
  country: 'country',
  countryCode: 'countryCode',
  parish: 'parish',
  isCoastal: 'isCoastal',
  isUrban: 'isUrban',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdminBusinessTypeHazardScalarFieldEnum = {
  id: 'id',
  businessTypeId: 'businessTypeId',
  hazardId: 'hazardId',
  riskLevel: 'riskLevel',
  frequency: 'frequency',
  impact: 'impact',
  notes: 'notes',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdminLocationHazardScalarFieldEnum = {
  id: 'id',
  locationId: 'locationId',
  hazardId: 'hazardId',
  riskLevel: 'riskLevel',
  frequency: 'frequency',
  impact: 'impact',
  notes: 'notes',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdminStrategyScalarFieldEnum = {
  id: 'id',
  strategyId: 'strategyId',
  title: 'title',
  description: 'description',
  category: 'category',
  reasoning: 'reasoning',
  icon: 'icon',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdminHazardStrategyScalarFieldEnum = {
  id: 'id',
  hazardId: 'hazardId',
  strategyId: 'strategyId',
  businessTypes: 'businessTypes',
  priority: 'priority',
  isRecommended: 'isRecommended',
  notes: 'notes',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdminActionPlanScalarFieldEnum = {
  id: 'id',
  hazardId: 'hazardId',
  resourcesNeeded: 'resourcesNeeded',
  immediateActions: 'immediateActions',
  shortTermActions: 'shortTermActions',
  mediumTermActions: 'mediumTermActions',
  longTermReduction: 'longTermReduction',
  businessTypeModifiers: 'businessTypeModifiers',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdminHazardActionPlanScalarFieldEnum = {
  id: 'id',
  hazardId: 'hazardId',
  actionPlanId: 'actionPlanId',
  businessTypes: 'businessTypes',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdminRiskProfileScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  businessTypeId: 'businessTypeId',
  locationId: 'locationId',
  calculatedRisks: 'calculatedRisks',
  recommendedStrategies: 'recommendedStrategies',
  lastCalculated: 'lastCalculated',
  riskScore: 'riskScore'
};

exports.Prisma.CountryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  region: 'region',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdminUnitScalarFieldEnum = {
  id: 'id',
  name: 'name',
  localName: 'localName',
  type: 'type',
  region: 'region',
  countryId: 'countryId',
  population: 'population',
  area: 'area',
  elevation: 'elevation',
  coordinates: 'coordinates',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isActive: 'isActive'
};

exports.Prisma.ParishScalarFieldEnum = {
  id: 'id',
  name: 'name',
  region: 'region',
  countryCode: 'countryCode',
  population: 'population',
  area: 'area',
  elevation: 'elevation',
  coordinates: 'coordinates',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isActive: 'isActive'
};

exports.Prisma.AdminUnitRiskScalarFieldEnum = {
  id: 'id',
  adminUnitId: 'adminUnitId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastUpdated: 'lastUpdated',
  updatedBy: 'updatedBy',
  hurricaneLevel: 'hurricaneLevel',
  hurricaneNotes: 'hurricaneNotes',
  floodLevel: 'floodLevel',
  floodNotes: 'floodNotes',
  earthquakeLevel: 'earthquakeLevel',
  earthquakeNotes: 'earthquakeNotes',
  droughtLevel: 'droughtLevel',
  droughtNotes: 'droughtNotes',
  landslideLevel: 'landslideLevel',
  landslideNotes: 'landslideNotes',
  powerOutageLevel: 'powerOutageLevel',
  powerOutageNotes: 'powerOutageNotes',
  riskProfileJson: 'riskProfileJson',
  isActive: 'isActive'
};

exports.Prisma.AdminUnitRiskChangeLogScalarFieldEnum = {
  id: 'id',
  adminUnitRiskId: 'adminUnitRiskId',
  riskType: 'riskType',
  oldLevel: 'oldLevel',
  newLevel: 'newLevel',
  oldNotes: 'oldNotes',
  newNotes: 'newNotes',
  changedBy: 'changedBy',
  changeReason: 'changeReason',
  createdAt: 'createdAt'
};

exports.Prisma.ParishRiskScalarFieldEnum = {
  id: 'id',
  parishId: 'parishId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastUpdated: 'lastUpdated',
  updatedBy: 'updatedBy',
  hurricaneLevel: 'hurricaneLevel',
  hurricaneNotes: 'hurricaneNotes',
  floodLevel: 'floodLevel',
  floodNotes: 'floodNotes',
  earthquakeLevel: 'earthquakeLevel',
  earthquakeNotes: 'earthquakeNotes',
  droughtLevel: 'droughtLevel',
  droughtNotes: 'droughtNotes',
  landslideLevel: 'landslideLevel',
  landslideNotes: 'landslideNotes',
  powerOutageLevel: 'powerOutageLevel',
  powerOutageNotes: 'powerOutageNotes',
  riskProfileJson: 'riskProfileJson',
  isActive: 'isActive'
};

exports.Prisma.RiskChangeLogScalarFieldEnum = {
  id: 'id',
  parishRiskId: 'parishRiskId',
  riskType: 'riskType',
  oldLevel: 'oldLevel',
  newLevel: 'newLevel',
  oldNotes: 'oldNotes',
  newNotes: 'newNotes',
  changedBy: 'changedBy',
  changeReason: 'changeReason',
  createdAt: 'createdAt'
};

exports.Prisma.BusinessTypeScalarFieldEnum = {
  id: 'id',
  businessTypeId: 'businessTypeId',
  name: 'name',
  category: 'category',
  subcategory: 'subcategory',
  description: 'description',
  exampleBusinessPurposes: 'exampleBusinessPurposes',
  exampleProducts: 'exampleProducts',
  exampleKeyPersonnel: 'exampleKeyPersonnel',
  exampleCustomerBase: 'exampleCustomerBase',
  minimumEquipment: 'minimumEquipment',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BusinessRiskVulnerabilityScalarFieldEnum = {
  id: 'id',
  businessTypeId: 'businessTypeId',
  riskType: 'riskType',
  vulnerabilityLevel: 'vulnerabilityLevel',
  impactSeverity: 'impactSeverity',
  recoveryTime: 'recoveryTime',
  reasoning: 'reasoning',
  mitigationDifficulty: 'mitigationDifficulty',
  costToRecover: 'costToRecover',
  businessImpactAreas: 'businessImpactAreas',
  criticalDependencies: 'criticalDependencies',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RiskMitigationStrategyScalarFieldEnum = {
  id: 'id',
  strategyId: 'strategyId',
  name: 'name',
  description: 'description',
  smeTitle: 'smeTitle',
  smeSummary: 'smeSummary',
  smeDescription: 'smeDescription',
  whyImportant: 'whyImportant',
  benefitsBullets: 'benefitsBullets',
  realWorldExample: 'realWorldExample',
  calculatedCostUSD: 'calculatedCostUSD',
  calculatedCostLocal: 'calculatedCostLocal',
  currencyCode: 'currencyCode',
  currencySymbol: 'currencySymbol',
  totalEstimatedHours: 'totalEstimatedHours',
  selectionTier: 'selectionTier',
  requiredForRisks: 'requiredForRisks',
  helpfulTips: 'helpfulTips',
  commonMistakes: 'commonMistakes',
  successMetrics: 'successMetrics',
  lowBudgetAlternative: 'lowBudgetAlternative',
  applicableRisks: 'applicableRisks',
  applicableBusinessTypes: 'applicableBusinessTypes',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ActionStepScalarFieldEnum = {
  id: 'id',
  strategyId: 'strategyId',
  stepId: 'stepId',
  phase: 'phase',
  title: 'title',
  description: 'description',
  smeAction: 'smeAction',
  whyThisStepMatters: 'whyThisStepMatters',
  whatHappensIfSkipped: 'whatHappensIfSkipped',
  timeframe: 'timeframe',
  estimatedMinutes: 'estimatedMinutes',
  difficultyLevel: 'difficultyLevel',
  responsibility: 'responsibility',
  estimatedCost: 'estimatedCost',
  estimatedCostJMD: 'estimatedCostJMD',
  resources: 'resources',
  checklist: 'checklist',
  howToKnowItsDone: 'howToKnowItsDone',
  exampleOutput: 'exampleOutput',
  dependsOnSteps: 'dependsOnSteps',
  isOptional: 'isOptional',
  skipConditions: 'skipConditions',
  freeAlternative: 'freeAlternative',
  lowTechOption: 'lowTechOption',
  commonMistakesForStep: 'commonMistakesForStep',
  videoTutorialUrl: 'videoTutorialUrl',
  externalResourceUrl: 'externalResourceUrl',
  sortOrder: 'sortOrder',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BusinessTypeStrategyScalarFieldEnum = {
  id: 'id',
  businessTypeId: 'businessTypeId',
  strategyId: 'strategyId',
  relevanceScore: 'relevanceScore',
  customNotes: 'customNotes',
  isRecommended: 'isRecommended',
  priority: 'priority',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BusinessRiskProfileScalarFieldEnum = {
  id: 'id',
  businessTypeId: 'businessTypeId',
  parishId: 'parishId',
  combinedRisks: 'combinedRisks',
  recommendedStrategies: 'recommendedStrategies',
  overallRiskScore: 'overallRiskScore',
  priorityActions: 'priorityActions',
  calculatedAt: 'calculatedAt',
  calculatedBy: 'calculatedBy',
  isActive: 'isActive'
};

exports.Prisma.RiskMultiplierScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  characteristicType: 'characteristicType',
  conditionType: 'conditionType',
  thresholdValue: 'thresholdValue',
  minValue: 'minValue',
  maxValue: 'maxValue',
  multiplierFactor: 'multiplierFactor',
  applicableHazards: 'applicableHazards',
  wizardQuestion: 'wizardQuestion',
  wizardAnswerOptions: 'wizardAnswerOptions',
  wizardHelpText: 'wizardHelpText',
  isActive: 'isActive',
  priority: 'priority',
  reasoning: 'reasoning',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  createdBy: 'createdBy'
};

exports.Prisma.CostItemScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  name: 'name',
  description: 'description',
  category: 'category',
  baseUSD: 'baseUSD',
  baseUSDMin: 'baseUSDMin',
  baseUSDMax: 'baseUSDMax',
  unit: 'unit',
  complexity: 'complexity',
  notes: 'notes',
  tags: 'tags',
  budgetAlternativeId: 'budgetAlternativeId',
  premiumAlternativeId: 'premiumAlternativeId',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CountryCostMultiplierScalarFieldEnum = {
  id: 'id',
  countryCode: 'countryCode',
  construction: 'construction',
  equipment: 'equipment',
  service: 'service',
  supplies: 'supplies',
  currency: 'currency',
  currencySymbol: 'currencySymbol',
  exchangeRateUSD: 'exchangeRateUSD',
  lastUpdated: 'lastUpdated',
  updatedBy: 'updatedBy',
  dataSource: 'dataSource',
  confidenceLevel: 'confidenceLevel',
  notes: 'notes'
};

exports.Prisma.StrategyItemCostScalarFieldEnum = {
  id: 'id',
  strategyId: 'strategyId',
  itemId: 'itemId',
  quantity: 'quantity',
  customNotes: 'customNotes',
  countryOverrides: 'countryOverrides',
  isRequired: 'isRequired',
  displayOrder: 'displayOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ActionStepItemCostScalarFieldEnum = {
  id: 'id',
  actionStepId: 'actionStepId',
  itemId: 'itemId',
  quantity: 'quantity',
  customNotes: 'customNotes',
  countryOverrides: 'countryOverrides',
  displayOrder: 'displayOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BusinessTypeTranslationScalarFieldEnum = {
  id: 'id',
  businessTypeId: 'businessTypeId',
  locale: 'locale',
  name: 'name',
  description: 'description',
  exampleBusinessPurposes: 'exampleBusinessPurposes',
  exampleProducts: 'exampleProducts',
  exampleKeyPersonnel: 'exampleKeyPersonnel',
  exampleCustomerBase: 'exampleCustomerBase',
  minimumEquipment: 'minimumEquipment',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StrategyTranslationScalarFieldEnum = {
  id: 'id',
  strategyId: 'strategyId',
  locale: 'locale',
  name: 'name',
  description: 'description',
  smeTitle: 'smeTitle',
  smeSummary: 'smeSummary',
  realWorldExample: 'realWorldExample',
  whyImportant: 'whyImportant',
  whenToImplement: 'whenToImplement',
  expectedOutcome: 'expectedOutcome',
  benefitsBullets: 'benefitsBullets',
  helpfulTips: 'helpfulTips',
  commonMistakes: 'commonMistakes',
  successMetrics: 'successMetrics',
  requiredResources: 'requiredResources',
  lowBudgetAlternative: 'lowBudgetAlternative',
  diyApproach: 'diyApproach',
  bcpTemplateText: 'bcpTemplateText',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ActionStepTranslationScalarFieldEnum = {
  id: 'id',
  actionStepId: 'actionStepId',
  locale: 'locale',
  title: 'title',
  description: 'description',
  smeAction: 'smeAction',
  timeframe: 'timeframe',
  whyThisStepMatters: 'whyThisStepMatters',
  howToKnowItsDone: 'howToKnowItsDone',
  whatHappensIfSkipped: 'whatHappensIfSkipped',
  exampleOutput: 'exampleOutput',
  freeAlternative: 'freeAlternative',
  lowTechOption: 'lowTechOption',
  commonMistakesForStep: 'commonMistakesForStep',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.HazardTranslationScalarFieldEnum = {
  id: 'id',
  hazardId: 'hazardId',
  locale: 'locale',
  name: 'name',
  description: 'description',
  impact: 'impact',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RiskMultiplierTranslationScalarFieldEnum = {
  id: 'id',
  riskMultiplierId: 'riskMultiplierId',
  locale: 'locale',
  name: 'name',
  description: 'description',
  reasoning: 'reasoning',
  wizardQuestion: 'wizardQuestion',
  wizardHelpText: 'wizardHelpText',
  wizardAnswerOptions: 'wizardAnswerOptions',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};


exports.Prisma.ModelName = {
  BusinessContinuityPlan: 'BusinessContinuityPlan',
  PlanInformation: 'PlanInformation',
  BusinessOverview: 'BusinessOverview',
  EssentialFunction: 'EssentialFunction',
  RiskAssessment: 'RiskAssessment',
  Strategy: 'Strategy',
  ActionPlan: 'ActionPlan',
  Session: 'Session',
  BusinessProfile: 'BusinessProfile',
  ContactsInformation: 'ContactsInformation',
  TestingMaintenance: 'TestingMaintenance',
  AnonymousSession: 'AnonymousSession',
  AdminBusinessType: 'AdminBusinessType',
  AdminHazardType: 'AdminHazardType',
  AdminLocation: 'AdminLocation',
  AdminBusinessTypeHazard: 'AdminBusinessTypeHazard',
  AdminLocationHazard: 'AdminLocationHazard',
  AdminStrategy: 'AdminStrategy',
  AdminHazardStrategy: 'AdminHazardStrategy',
  AdminActionPlan: 'AdminActionPlan',
  AdminHazardActionPlan: 'AdminHazardActionPlan',
  AdminRiskProfile: 'AdminRiskProfile',
  Country: 'Country',
  AdminUnit: 'AdminUnit',
  Parish: 'Parish',
  AdminUnitRisk: 'AdminUnitRisk',
  AdminUnitRiskChangeLog: 'AdminUnitRiskChangeLog',
  ParishRisk: 'ParishRisk',
  RiskChangeLog: 'RiskChangeLog',
  BusinessType: 'BusinessType',
  BusinessRiskVulnerability: 'BusinessRiskVulnerability',
  RiskMitigationStrategy: 'RiskMitigationStrategy',
  ActionStep: 'ActionStep',
  BusinessTypeStrategy: 'BusinessTypeStrategy',
  BusinessRiskProfile: 'BusinessRiskProfile',
  RiskMultiplier: 'RiskMultiplier',
  CostItem: 'CostItem',
  CountryCostMultiplier: 'CountryCostMultiplier',
  StrategyItemCost: 'StrategyItemCost',
  ActionStepItemCost: 'ActionStepItemCost',
  BusinessTypeTranslation: 'BusinessTypeTranslation',
  StrategyTranslation: 'StrategyTranslation',
  ActionStepTranslation: 'ActionStepTranslation',
  HazardTranslation: 'HazardTranslation',
  RiskMultiplierTranslation: 'RiskMultiplierTranslation'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)

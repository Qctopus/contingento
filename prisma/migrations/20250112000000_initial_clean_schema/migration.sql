-- CreateTable
CREATE TABLE "BusinessContinuityPlan" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessContinuityPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanInformation" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "planManager" TEXT NOT NULL,
    "alternateManager" TEXT,
    "physicalPlanLocation" TEXT NOT NULL,
    "digitalPlanLocation" TEXT,

    CONSTRAINT "PlanInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessOverview" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "businessLicenseNumber" TEXT NOT NULL,
    "businessPurpose" TEXT NOT NULL,
    "productsAndServices" TEXT NOT NULL,
    "serviceDeliveryMethods" TEXT NOT NULL,
    "operatingHours" TEXT NOT NULL,
    "keyPersonnel" TEXT NOT NULL,
    "minimumResources" TEXT NOT NULL,
    "customerBase" TEXT NOT NULL,
    "serviceProviderBCP" TEXT NOT NULL,

    CONSTRAINT "BusinessOverview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EssentialFunction" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "supplyChainManagement" TEXT NOT NULL,
    "staffManagement" TEXT NOT NULL,
    "technology" TEXT NOT NULL,
    "productsServices" TEXT NOT NULL,
    "infrastructureFacilities" TEXT NOT NULL,
    "sales" TEXT NOT NULL,
    "administration" TEXT NOT NULL,

    CONSTRAINT "EssentialFunction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "potentialHazards" TEXT NOT NULL,
    "hazards" TEXT NOT NULL,

    CONSTRAINT "RiskAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "preventionStrategies" TEXT NOT NULL,
    "responseStrategies" TEXT NOT NULL,
    "recoveryStrategies" TEXT NOT NULL,
    "longTermRiskReduction" TEXT NOT NULL,

    CONSTRAINT "Strategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionPlan" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "actionPlanByRisk" TEXT NOT NULL,
    "implementationTimeline" TEXT NOT NULL,
    "resourceRequirements" TEXT NOT NULL,
    "responsibleParties" TEXT NOT NULL,
    "reviewUpdateSchedule" TEXT NOT NULL,
    "testingAssessmentPlan" TEXT NOT NULL,

    CONSTRAINT "ActionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentStep" TEXT NOT NULL,
    "stepData" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactsInformation" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "staffContactInfo" TEXT NOT NULL,
    "keyCustomerContacts" TEXT NOT NULL,
    "supplierInformation" TEXT NOT NULL,
    "emergencyServicesUtilities" TEXT NOT NULL,
    "criticalBusinessInfo" TEXT NOT NULL,
    "planDistributionList" TEXT NOT NULL,

    CONSTRAINT "ContactsInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestingMaintenance" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planTestingSchedule" TEXT NOT NULL,
    "planRevisionHistory" TEXT NOT NULL,
    "improvementTracking" TEXT NOT NULL,
    "annualReviewProcess" TEXT NOT NULL,
    "triggerEventsForUpdates" TEXT NOT NULL,

    CONSTRAINT "TestingMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnonymousSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "displayBusinessName" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "email" TEXT,
    "planData" TEXT NOT NULL,
    "shareableId" TEXT,
    "allowSharing" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnonymousSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminBusinessType" (
    "id" TEXT NOT NULL,
    "businessTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "localName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "typicalOperatingHours" TEXT,
    "minimumStaff" TEXT,
    "minimumEquipment" TEXT,
    "minimumUtilities" TEXT,
    "minimumSpace" TEXT,
    "essentialFunctions" TEXT,
    "criticalSuppliers" TEXT,
    "exampleBusinessPurposes" TEXT,
    "exampleProducts" TEXT,
    "exampleKeyPersonnel" TEXT,
    "exampleCustomerBase" TEXT,
    "dependencies" TEXT,
    "vulnerabilityMatrix" TEXT,
    "operationalThresholds" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminBusinessType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminHazardType" (
    "id" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "defaultFrequency" TEXT NOT NULL,
    "defaultImpact" TEXT NOT NULL,
    "seasonalPattern" TEXT,
    "peakMonths" TEXT,
    "warningTime" TEXT,
    "geographicScope" TEXT,
    "cascadingRisks" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminHazardType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLocation" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "parish" TEXT,
    "isCoastal" BOOLEAN NOT NULL DEFAULT false,
    "isUrban" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminBusinessTypeHazard" (
    "id" TEXT NOT NULL,
    "businessTypeId" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "frequency" TEXT,
    "impact" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminBusinessTypeHazard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLocationHazard" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "frequency" TEXT,
    "impact" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminLocationHazard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminStrategy" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "reasoning" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminHazardStrategy" (
    "id" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "businessTypes" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminHazardStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActionPlan" (
    "id" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "resourcesNeeded" TEXT NOT NULL,
    "immediateActions" TEXT NOT NULL,
    "shortTermActions" TEXT NOT NULL,
    "mediumTermActions" TEXT NOT NULL,
    "longTermReduction" TEXT NOT NULL,
    "businessTypeModifiers" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminActionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminHazardActionPlan" (
    "id" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "actionPlanId" TEXT NOT NULL,
    "businessTypes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminHazardActionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRiskProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessTypeId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "calculatedRisks" TEXT NOT NULL,
    "recommendedStrategies" TEXT NOT NULL,
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "riskScore" INTEGER NOT NULL,

    CONSTRAINT "AdminRiskProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "region" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "localName" TEXT,
    "type" TEXT NOT NULL DEFAULT 'parish',
    "region" TEXT,
    "countryId" TEXT NOT NULL,
    "population" INTEGER NOT NULL DEFAULT 0,
    "area" DOUBLE PRECISION,
    "elevation" DOUBLE PRECISION,
    "coordinates" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AdminUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parish" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'JM',
    "population" INTEGER NOT NULL DEFAULT 0,
    "area" DOUBLE PRECISION,
    "elevation" DOUBLE PRECISION,
    "coordinates" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Parish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUnitRisk" (
    "id" TEXT NOT NULL,
    "adminUnitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT NOT NULL DEFAULT 'system',
    "hurricaneLevel" INTEGER NOT NULL DEFAULT 0,
    "hurricaneNotes" TEXT NOT NULL DEFAULT '',
    "floodLevel" INTEGER NOT NULL DEFAULT 0,
    "floodNotes" TEXT NOT NULL DEFAULT '',
    "earthquakeLevel" INTEGER NOT NULL DEFAULT 0,
    "earthquakeNotes" TEXT NOT NULL DEFAULT '',
    "droughtLevel" INTEGER NOT NULL DEFAULT 0,
    "droughtNotes" TEXT NOT NULL DEFAULT '',
    "landslideLevel" INTEGER NOT NULL DEFAULT 0,
    "landslideNotes" TEXT NOT NULL DEFAULT '',
    "powerOutageLevel" INTEGER NOT NULL DEFAULT 0,
    "powerOutageNotes" TEXT NOT NULL DEFAULT '',
    "riskProfileJson" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AdminUnitRisk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUnitRiskChangeLog" (
    "id" TEXT NOT NULL,
    "adminUnitRiskId" TEXT NOT NULL,
    "riskType" TEXT NOT NULL,
    "oldLevel" INTEGER NOT NULL,
    "newLevel" INTEGER NOT NULL,
    "oldNotes" TEXT NOT NULL DEFAULT '',
    "newNotes" TEXT NOT NULL DEFAULT '',
    "changedBy" TEXT NOT NULL,
    "changeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUnitRiskChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParishRisk" (
    "id" TEXT NOT NULL,
    "parishId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT NOT NULL DEFAULT 'system',
    "hurricaneLevel" INTEGER NOT NULL DEFAULT 0,
    "hurricaneNotes" TEXT NOT NULL DEFAULT '',
    "floodLevel" INTEGER NOT NULL DEFAULT 0,
    "floodNotes" TEXT NOT NULL DEFAULT '',
    "earthquakeLevel" INTEGER NOT NULL DEFAULT 0,
    "earthquakeNotes" TEXT NOT NULL DEFAULT '',
    "droughtLevel" INTEGER NOT NULL DEFAULT 0,
    "droughtNotes" TEXT NOT NULL DEFAULT '',
    "landslideLevel" INTEGER NOT NULL DEFAULT 0,
    "landslideNotes" TEXT NOT NULL DEFAULT '',
    "powerOutageLevel" INTEGER NOT NULL DEFAULT 0,
    "powerOutageNotes" TEXT NOT NULL DEFAULT '',
    "riskProfileJson" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ParishRisk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskChangeLog" (
    "id" TEXT NOT NULL,
    "parishRiskId" TEXT NOT NULL,
    "riskType" TEXT NOT NULL,
    "oldLevel" INTEGER NOT NULL,
    "newLevel" INTEGER NOT NULL,
    "oldNotes" TEXT NOT NULL DEFAULT '',
    "newNotes" TEXT NOT NULL DEFAULT '',
    "changedBy" TEXT NOT NULL,
    "changeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessType" (
    "id" TEXT NOT NULL,
    "businessTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "description" TEXT,
    "typicalRevenue" TEXT,
    "typicalEmployees" TEXT,
    "operatingHours" TEXT,
    "seasonalityFactor" DOUBLE PRECISION DEFAULT 1.0,
    "touristDependency" INTEGER DEFAULT 0,
    "supplyChainComplexity" INTEGER DEFAULT 1,
    "digitalDependency" INTEGER DEFAULT 1,
    "cashFlowPattern" TEXT DEFAULT 'stable',
    "physicalAssetIntensity" INTEGER DEFAULT 3,
    "customerConcentration" INTEGER DEFAULT 3,
    "regulatoryBurden" INTEGER DEFAULT 2,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessRiskVulnerability" (
    "id" TEXT NOT NULL,
    "businessTypeId" TEXT NOT NULL,
    "riskType" TEXT NOT NULL,
    "vulnerabilityLevel" INTEGER NOT NULL DEFAULT 5,
    "impactSeverity" INTEGER NOT NULL DEFAULT 5,
    "recoveryTime" TEXT DEFAULT 'medium',
    "reasoning" TEXT NOT NULL DEFAULT '',
    "mitigationDifficulty" INTEGER DEFAULT 3,
    "costToRecover" TEXT DEFAULT 'medium',
    "businessImpactAreas" TEXT,
    "criticalDependencies" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessRiskVulnerability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskMitigationStrategy" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "smeDescription" TEXT,
    "whyImportant" TEXT,
    "implementationCost" TEXT DEFAULT 'medium',
    "timeToImplement" TEXT DEFAULT 'medium',
    "effectiveness" INTEGER DEFAULT 7,
    "applicableRisks" TEXT NOT NULL,
    "applicableBusinessTypes" TEXT,
    "prerequisites" TEXT,
    "maintenanceRequirement" TEXT DEFAULT 'low',
    "roi" DOUBLE PRECISION DEFAULT 3.0,
    "priority" TEXT DEFAULT 'medium',
    "helpfulTips" TEXT,
    "commonMistakes" TEXT,
    "successMetrics" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskMitigationStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionStep" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "phase" TEXT NOT NULL DEFAULT 'immediate',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "smeAction" TEXT,
    "timeframe" TEXT,
    "responsibility" TEXT,
    "estimatedCost" TEXT,
    "estimatedCostJMD" TEXT,
    "resources" TEXT,
    "checklist" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessTypeStrategy" (
    "id" TEXT NOT NULL,
    "businessTypeId" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "relevanceScore" INTEGER DEFAULT 7,
    "customNotes" TEXT,
    "isRecommended" BOOLEAN DEFAULT true,
    "priority" TEXT DEFAULT 'medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessTypeStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessRiskProfile" (
    "id" TEXT NOT NULL,
    "businessTypeId" TEXT NOT NULL,
    "parishId" TEXT NOT NULL,
    "combinedRisks" TEXT NOT NULL,
    "recommendedStrategies" TEXT NOT NULL,
    "overallRiskScore" INTEGER NOT NULL,
    "priorityActions" TEXT,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculatedBy" TEXT DEFAULT 'system',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BusinessRiskProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskMultiplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "characteristicType" TEXT NOT NULL,
    "conditionType" TEXT NOT NULL,
    "thresholdValue" DOUBLE PRECISION,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "multiplierFactor" DOUBLE PRECISION NOT NULL,
    "applicableHazards" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "reasoning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "RiskMultiplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanInformation_planId_key" ON "PlanInformation"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessOverview_planId_key" ON "BusinessOverview"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "EssentialFunction_planId_key" ON "EssentialFunction"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "RiskAssessment_planId_key" ON "RiskAssessment"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "Strategy_planId_key" ON "Strategy"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "ActionPlan_planId_key" ON "ActionPlan"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProfile_sessionId_key" ON "BusinessProfile"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactsInformation_planId_key" ON "ContactsInformation"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "TestingMaintenance_planId_key" ON "TestingMaintenance"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousSession_sessionId_key" ON "AnonymousSession"("sessionId");

-- CreateIndex
CREATE INDEX "AnonymousSession_businessName_idx" ON "AnonymousSession"("businessName");

-- CreateIndex
CREATE INDEX "AnonymousSession_shareableId_idx" ON "AnonymousSession"("shareableId");

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousSession_businessName_pin_key" ON "AnonymousSession"("businessName", "pin");

-- CreateIndex
CREATE UNIQUE INDEX "AdminBusinessType_businessTypeId_key" ON "AdminBusinessType"("businessTypeId");

-- CreateIndex
CREATE INDEX "AdminBusinessType_category_idx" ON "AdminBusinessType"("category");

-- CreateIndex
CREATE INDEX "AdminBusinessType_dependencies_idx" ON "AdminBusinessType"("dependencies");

-- CreateIndex
CREATE UNIQUE INDEX "AdminHazardType_hazardId_key" ON "AdminHazardType"("hazardId");

-- CreateIndex
CREATE INDEX "AdminHazardType_category_idx" ON "AdminHazardType"("category");

-- CreateIndex
CREATE INDEX "AdminHazardType_seasonalPattern_idx" ON "AdminHazardType"("seasonalPattern");

-- CreateIndex
CREATE INDEX "AdminHazardType_geographicScope_idx" ON "AdminHazardType"("geographicScope");

-- CreateIndex
CREATE INDEX "AdminLocation_countryCode_idx" ON "AdminLocation"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "AdminLocation_countryCode_parish_key" ON "AdminLocation"("countryCode", "parish");

-- CreateIndex
CREATE INDEX "AdminBusinessTypeHazard_businessTypeId_idx" ON "AdminBusinessTypeHazard"("businessTypeId");

-- CreateIndex
CREATE INDEX "AdminBusinessTypeHazard_hazardId_idx" ON "AdminBusinessTypeHazard"("hazardId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminBusinessTypeHazard_businessTypeId_hazardId_key" ON "AdminBusinessTypeHazard"("businessTypeId", "hazardId");

-- CreateIndex
CREATE INDEX "AdminLocationHazard_locationId_idx" ON "AdminLocationHazard"("locationId");

-- CreateIndex
CREATE INDEX "AdminLocationHazard_hazardId_idx" ON "AdminLocationHazard"("hazardId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminLocationHazard_locationId_hazardId_key" ON "AdminLocationHazard"("locationId", "hazardId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminStrategy_strategyId_key" ON "AdminStrategy"("strategyId");

-- CreateIndex
CREATE INDEX "AdminStrategy_category_idx" ON "AdminStrategy"("category");

-- CreateIndex
CREATE INDEX "AdminHazardStrategy_hazardId_idx" ON "AdminHazardStrategy"("hazardId");

-- CreateIndex
CREATE INDEX "AdminHazardStrategy_strategyId_idx" ON "AdminHazardStrategy"("strategyId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminHazardStrategy_hazardId_strategyId_key" ON "AdminHazardStrategy"("hazardId", "strategyId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminActionPlan_hazardId_key" ON "AdminActionPlan"("hazardId");

-- CreateIndex
CREATE INDEX "AdminHazardActionPlan_hazardId_idx" ON "AdminHazardActionPlan"("hazardId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminHazardActionPlan_hazardId_actionPlanId_key" ON "AdminHazardActionPlan"("hazardId", "actionPlanId");

-- CreateIndex
CREATE INDEX "AdminRiskProfile_businessTypeId_idx" ON "AdminRiskProfile"("businessTypeId");

-- CreateIndex
CREATE INDEX "AdminRiskProfile_locationId_idx" ON "AdminRiskProfile"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminRiskProfile_businessTypeId_locationId_key" ON "AdminRiskProfile"("businessTypeId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_code_idx" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_isActive_idx" ON "Country"("isActive");

-- CreateIndex
CREATE INDEX "AdminUnit_countryId_idx" ON "AdminUnit"("countryId");

-- CreateIndex
CREATE INDEX "AdminUnit_type_idx" ON "AdminUnit"("type");

-- CreateIndex
CREATE INDEX "AdminUnit_region_idx" ON "AdminUnit"("region");

-- CreateIndex
CREATE INDEX "AdminUnit_isActive_idx" ON "AdminUnit"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUnit_countryId_name_key" ON "AdminUnit"("countryId", "name");

-- CreateIndex
CREATE INDEX "Parish_region_idx" ON "Parish"("region");

-- CreateIndex
CREATE INDEX "Parish_countryCode_idx" ON "Parish"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUnitRisk_adminUnitId_key" ON "AdminUnitRisk"("adminUnitId");

-- CreateIndex
CREATE INDEX "AdminUnitRisk_adminUnitId_idx" ON "AdminUnitRisk"("adminUnitId");

-- CreateIndex
CREATE INDEX "AdminUnitRiskChangeLog_adminUnitRiskId_idx" ON "AdminUnitRiskChangeLog"("adminUnitRiskId");

-- CreateIndex
CREATE INDEX "AdminUnitRiskChangeLog_riskType_idx" ON "AdminUnitRiskChangeLog"("riskType");

-- CreateIndex
CREATE INDEX "AdminUnitRiskChangeLog_createdAt_idx" ON "AdminUnitRiskChangeLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ParishRisk_parishId_key" ON "ParishRisk"("parishId");

-- CreateIndex
CREATE INDEX "ParishRisk_parishId_idx" ON "ParishRisk"("parishId");

-- CreateIndex
CREATE INDEX "RiskChangeLog_parishRiskId_idx" ON "RiskChangeLog"("parishRiskId");

-- CreateIndex
CREATE INDEX "RiskChangeLog_riskType_idx" ON "RiskChangeLog"("riskType");

-- CreateIndex
CREATE INDEX "RiskChangeLog_createdAt_idx" ON "RiskChangeLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessType_businessTypeId_key" ON "BusinessType"("businessTypeId");

-- CreateIndex
CREATE INDEX "BusinessType_category_idx" ON "BusinessType"("category");

-- CreateIndex
CREATE INDEX "BusinessType_businessTypeId_idx" ON "BusinessType"("businessTypeId");

-- CreateIndex
CREATE INDEX "BusinessRiskVulnerability_businessTypeId_idx" ON "BusinessRiskVulnerability"("businessTypeId");

-- CreateIndex
CREATE INDEX "BusinessRiskVulnerability_riskType_idx" ON "BusinessRiskVulnerability"("riskType");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessRiskVulnerability_businessTypeId_riskType_key" ON "BusinessRiskVulnerability"("businessTypeId", "riskType");

-- CreateIndex
CREATE UNIQUE INDEX "RiskMitigationStrategy_strategyId_key" ON "RiskMitigationStrategy"("strategyId");

-- CreateIndex
CREATE INDEX "RiskMitigationStrategy_category_idx" ON "RiskMitigationStrategy"("category");

-- CreateIndex
CREATE INDEX "RiskMitigationStrategy_strategyId_idx" ON "RiskMitigationStrategy"("strategyId");

-- CreateIndex
CREATE INDEX "ActionStep_strategyId_idx" ON "ActionStep"("strategyId");

-- CreateIndex
CREATE INDEX "ActionStep_phase_idx" ON "ActionStep"("phase");

-- CreateIndex
CREATE UNIQUE INDEX "ActionStep_strategyId_stepId_key" ON "ActionStep"("strategyId", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessTypeStrategy_businessTypeId_strategyId_key" ON "BusinessTypeStrategy"("businessTypeId", "strategyId");

-- CreateIndex
CREATE INDEX "BusinessRiskProfile_businessTypeId_idx" ON "BusinessRiskProfile"("businessTypeId");

-- CreateIndex
CREATE INDEX "BusinessRiskProfile_parishId_idx" ON "BusinessRiskProfile"("parishId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessRiskProfile_businessTypeId_parishId_key" ON "BusinessRiskProfile"("businessTypeId", "parishId");

-- CreateIndex
CREATE INDEX "RiskMultiplier_characteristicType_idx" ON "RiskMultiplier"("characteristicType");

-- CreateIndex
CREATE INDEX "RiskMultiplier_isActive_idx" ON "RiskMultiplier"("isActive");

-- CreateIndex
CREATE INDEX "RiskMultiplier_priority_idx" ON "RiskMultiplier"("priority");

-- AddForeignKey
ALTER TABLE "PlanInformation" ADD CONSTRAINT "PlanInformation_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessOverview" ADD CONSTRAINT "BusinessOverview_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssentialFunction" ADD CONSTRAINT "EssentialFunction_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionPlan" ADD CONSTRAINT "ActionPlan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactsInformation" ADD CONSTRAINT "ContactsInformation_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestingMaintenance" ADD CONSTRAINT "TestingMaintenance_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminBusinessTypeHazard" ADD CONSTRAINT "AdminBusinessTypeHazard_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "AdminBusinessType"("businessTypeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminBusinessTypeHazard" ADD CONSTRAINT "AdminBusinessTypeHazard_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "AdminHazardType"("hazardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLocationHazard" ADD CONSTRAINT "AdminLocationHazard_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "AdminLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLocationHazard" ADD CONSTRAINT "AdminLocationHazard_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "AdminHazardType"("hazardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminHazardStrategy" ADD CONSTRAINT "AdminHazardStrategy_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "AdminHazardType"("hazardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminHazardStrategy" ADD CONSTRAINT "AdminHazardStrategy_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "AdminStrategy"("strategyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionPlan" ADD CONSTRAINT "AdminActionPlan_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "AdminHazardType"("hazardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminHazardActionPlan" ADD CONSTRAINT "AdminHazardActionPlan_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "AdminHazardType"("hazardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminHazardActionPlan" ADD CONSTRAINT "AdminHazardActionPlan_actionPlanId_fkey" FOREIGN KEY ("actionPlanId") REFERENCES "AdminActionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRiskProfile" ADD CONSTRAINT "AdminRiskProfile_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "AdminBusinessType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRiskProfile" ADD CONSTRAINT "AdminRiskProfile_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "AdminLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUnit" ADD CONSTRAINT "AdminUnit_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUnitRisk" ADD CONSTRAINT "AdminUnitRisk_adminUnitId_fkey" FOREIGN KEY ("adminUnitId") REFERENCES "AdminUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUnitRiskChangeLog" ADD CONSTRAINT "AdminUnitRiskChangeLog_adminUnitRiskId_fkey" FOREIGN KEY ("adminUnitRiskId") REFERENCES "AdminUnitRisk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParishRisk" ADD CONSTRAINT "ParishRisk_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "Parish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskChangeLog" ADD CONSTRAINT "RiskChangeLog_parishRiskId_fkey" FOREIGN KEY ("parishRiskId") REFERENCES "ParishRisk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessRiskVulnerability" ADD CONSTRAINT "BusinessRiskVulnerability_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "BusinessType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionStep" ADD CONSTRAINT "ActionStep_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "RiskMitigationStrategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessTypeStrategy" ADD CONSTRAINT "BusinessTypeStrategy_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "BusinessType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessTypeStrategy" ADD CONSTRAINT "BusinessTypeStrategy_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "RiskMitigationStrategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessRiskProfile" ADD CONSTRAINT "BusinessRiskProfile_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "BusinessType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessRiskProfile" ADD CONSTRAINT "BusinessRiskProfile_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "Parish"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- CreateTable
CREATE TABLE "BusinessType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessTypeId" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "description" TEXT,
    "typicalRevenue" TEXT,
    "typicalEmployees" TEXT,
    "operatingHours" TEXT,
    "seasonalityFactor" REAL DEFAULT 1.0,
    "touristDependency" INTEGER DEFAULT 0,
    "supplyChainComplexity" INTEGER DEFAULT 1,
    "digitalDependency" INTEGER DEFAULT 1,
    "cashFlowPattern" TEXT DEFAULT 'stable',
    "physicalAssetIntensity" INTEGER DEFAULT 3,
    "customerConcentration" INTEGER DEFAULT 3,
    "regulatoryBurden" INTEGER DEFAULT 2,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BusinessRiskVulnerability" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    
    CONSTRAINT "BusinessRiskVulnerability_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "BusinessType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RiskMitigationStrategy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategyId" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "implementationCost" TEXT DEFAULT 'medium',
    "implementationTime" TEXT DEFAULT 'medium',
    "effectiveness" INTEGER DEFAULT 7,
    "applicableRisks" TEXT NOT NULL,
    "applicableBusinessTypes" TEXT,
    "prerequisites" TEXT,
    "maintenanceRequirement" TEXT DEFAULT 'low',
    "roi" REAL DEFAULT 3.0,
    "priority" TEXT DEFAULT 'medium',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BusinessTypeStrategy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessTypeId" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "relevanceScore" INTEGER DEFAULT 7,
    "customNotes" TEXT,
    "isRecommended" BOOLEAN DEFAULT true,
    "priority" TEXT DEFAULT 'medium',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    
    CONSTRAINT "BusinessTypeStrategy_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "BusinessType" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BusinessTypeStrategy_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "RiskMitigationStrategy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessRiskProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessTypeId" TEXT NOT NULL,
    "parishId" TEXT NOT NULL,
    "combinedRisks" TEXT NOT NULL,
    "recommendedStrategies" TEXT NOT NULL,
    "overallRiskScore" INTEGER NOT NULL,
    "priorityActions" TEXT,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculatedBy" TEXT DEFAULT 'system',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    
    CONSTRAINT "BusinessRiskProfile_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "BusinessType" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BusinessRiskProfile_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "Parish" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraints
CREATE UNIQUE INDEX "BusinessRiskVulnerability_businessTypeId_riskType_key" ON "BusinessRiskVulnerability"("businessTypeId", "riskType");
CREATE UNIQUE INDEX "BusinessTypeStrategy_businessTypeId_strategyId_key" ON "BusinessTypeStrategy"("businessTypeId", "strategyId");
CREATE UNIQUE INDEX "BusinessRiskProfile_businessTypeId_parishId_key" ON "BusinessRiskProfile"("businessTypeId", "parishId");

-- Create indexes for performance
CREATE INDEX "BusinessType_category_idx" ON "BusinessType"("category");
CREATE INDEX "BusinessType_businessTypeId_idx" ON "BusinessType"("businessTypeId");
CREATE INDEX "BusinessRiskVulnerability_businessTypeId_idx" ON "BusinessRiskVulnerability"("businessTypeId");
CREATE INDEX "BusinessRiskVulnerability_riskType_idx" ON "BusinessRiskVulnerability"("riskType");
CREATE INDEX "RiskMitigationStrategy_category_idx" ON "RiskMitigationStrategy"("category");
CREATE INDEX "RiskMitigationStrategy_strategyId_idx" ON "RiskMitigationStrategy"("strategyId");
CREATE INDEX "BusinessRiskProfile_businessTypeId_idx" ON "BusinessRiskProfile"("businessTypeId");
CREATE INDEX "BusinessRiskProfile_parishId_idx" ON "BusinessRiskProfile"("parishId");











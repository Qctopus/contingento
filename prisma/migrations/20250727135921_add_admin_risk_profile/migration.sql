/*
  Warnings:

  - You are about to drop the column `planLocation` on the `PlanInformation` table. All the data in the column will be lost.
  - Added the required column `physicalPlanLocation` to the `PlanInformation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "AnonymousSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "displayBusinessName" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "email" TEXT,
    "planData" TEXT NOT NULL,
    "shareableId" TEXT,
    "allowSharing" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AdminBusinessType" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdminHazardType" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdminLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "country" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "parish" TEXT,
    "isCoastal" BOOLEAN NOT NULL DEFAULT false,
    "isUrban" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdminBusinessTypeHazard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessTypeId" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "frequency" TEXT,
    "impact" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdminBusinessTypeHazard_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "AdminBusinessType" ("businessTypeId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AdminBusinessTypeHazard_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "AdminHazardType" ("hazardId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminLocationHazard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationId" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "frequency" TEXT,
    "impact" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdminLocationHazard_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "AdminLocation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AdminLocationHazard_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "AdminHazardType" ("hazardId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminStrategy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "reasoning" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdminHazardStrategy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hazardId" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "businessTypes" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdminHazardStrategy_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "AdminHazardType" ("hazardId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AdminHazardStrategy_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "AdminStrategy" ("strategyId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminActionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hazardId" TEXT NOT NULL,
    "resourcesNeeded" TEXT NOT NULL,
    "immediateActions" TEXT NOT NULL,
    "shortTermActions" TEXT NOT NULL,
    "mediumTermActions" TEXT NOT NULL,
    "longTermReduction" TEXT NOT NULL,
    "businessTypeModifiers" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdminActionPlan_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "AdminHazardType" ("hazardId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminHazardActionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hazardId" TEXT NOT NULL,
    "actionPlanId" TEXT NOT NULL,
    "businessTypes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdminHazardActionPlan_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "AdminHazardType" ("hazardId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AdminHazardActionPlan_actionPlanId_fkey" FOREIGN KEY ("actionPlanId") REFERENCES "AdminActionPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminRiskProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "businessTypeId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "calculatedRisks" TEXT NOT NULL,
    "recommendedStrategies" TEXT NOT NULL,
    "lastCalculated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "riskScore" INTEGER NOT NULL,
    CONSTRAINT "AdminRiskProfile_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "AdminBusinessType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AdminRiskProfile_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "AdminLocation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlanInformation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "planManager" TEXT NOT NULL,
    "alternateManager" TEXT,
    "physicalPlanLocation" TEXT NOT NULL,
    "digitalPlanLocation" TEXT,
    CONSTRAINT "PlanInformation_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessContinuityPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PlanInformation" ("alternateManager", "companyName", "id", "planId", "planManager") SELECT "alternateManager", "companyName", "id", "planId", "planManager" FROM "PlanInformation";
DROP TABLE "PlanInformation";
ALTER TABLE "new_PlanInformation" RENAME TO "PlanInformation";
CREATE UNIQUE INDEX "PlanInformation_planId_key" ON "PlanInformation"("planId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

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

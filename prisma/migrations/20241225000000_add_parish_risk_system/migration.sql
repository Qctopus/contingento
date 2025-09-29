-- CreateTable
CREATE TABLE "ParishRisk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parishId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT NOT NULL DEFAULT 'system',
    
    -- Risk levels (0-10 scale)
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
    
    -- Metadata
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    
    CONSTRAINT "ParishRisk_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "Parish" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Parish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'JM',
    "isCoastal" BOOLEAN NOT NULL DEFAULT false,
    "isUrban" BOOLEAN NOT NULL DEFAULT false,
    "population" INTEGER NOT NULL DEFAULT 0,
    "area" REAL,
    "elevation" REAL,
    "coordinates" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "RiskChangeLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parishRiskId" TEXT NOT NULL,
    "riskType" TEXT NOT NULL,
    "oldLevel" INTEGER NOT NULL,
    "newLevel" INTEGER NOT NULL,
    "oldNotes" TEXT NOT NULL DEFAULT '',
    "newNotes" TEXT NOT NULL DEFAULT '',
    "changedBy" TEXT NOT NULL,
    "changeReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "RiskChangeLog_parishRiskId_fkey" FOREIGN KEY ("parishRiskId") REFERENCES "ParishRisk" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraint
CREATE UNIQUE INDEX "ParishRisk_parishId_key" ON "ParishRisk"("parishId");

-- Create indexes for performance
CREATE INDEX "Parish_region_idx" ON "Parish"("region");
CREATE INDEX "Parish_countryCode_idx" ON "Parish"("countryCode");
CREATE INDEX "Parish_isCoastal_idx" ON "Parish"("isCoastal");
CREATE INDEX "Parish_isUrban_idx" ON "Parish"("isUrban");
CREATE INDEX "ParishRisk_parishId_idx" ON "ParishRisk"("parishId");
CREATE INDEX "RiskChangeLog_parishRiskId_idx" ON "RiskChangeLog"("parishRiskId");
CREATE INDEX "RiskChangeLog_riskType_idx" ON "RiskChangeLog"("riskType");
CREATE INDEX "RiskChangeLog_createdAt_idx" ON "RiskChangeLog"("createdAt");





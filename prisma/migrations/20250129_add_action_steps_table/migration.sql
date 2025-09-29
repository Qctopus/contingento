-- Add ActionStep table for proper relational structure

-- CreateTable
CREATE TABLE "ActionStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategyId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL, -- e.g., 'step_1', 'step_2'
    "phase" TEXT NOT NULL DEFAULT 'immediate', -- 'immediate', 'short_term', 'medium_term', 'long_term'
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "smeAction" TEXT, -- Simplified action description for SMEs
    "timeframe" TEXT,
    "responsibility" TEXT,
    "estimatedCost" TEXT,
    "estimatedCostJMD" TEXT,
    "resources" TEXT, -- JSON array of required resources
    "checklist" TEXT, -- JSON array of checklist items
    "sortOrder" INTEGER NOT NULL DEFAULT 0, -- For ordering steps within a strategy
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    
    CONSTRAINT "ActionStep_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "RiskMitigationStrategy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add additional fields to RiskMitigationStrategy for better admin management
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN "smeDescription" TEXT; -- Simplified description for SMEs
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN "whyImportant" TEXT; -- Why this strategy matters
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN "helpfulTips" TEXT; -- JSON array of tips
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN "commonMistakes" TEXT; -- JSON array of common mistakes
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN "successMetrics" TEXT; -- JSON array of success metrics

-- Create indexes for performance
CREATE INDEX "ActionStep_strategyId_idx" ON "ActionStep"("strategyId");
CREATE INDEX "ActionStep_phase_idx" ON "ActionStep"("phase");
CREATE UNIQUE INDEX "ActionStep_strategyId_stepId_key" ON "ActionStep"("strategyId", "stepId");

-- Update the schema to use proper field names
ALTER TABLE "RiskMitigationStrategy" RENAME COLUMN "implementationTime" TO "timeToImplement";

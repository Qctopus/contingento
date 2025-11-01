-- Complete Strategy & Action System Overhaul for Caribbean SMEs
-- Migration adds all new SME-focused fields to RiskMitigationStrategy and ActionStep models

-- ============================================================================
-- RiskMitigationStrategy: Add SME-Focused Fields
-- ============================================================================

-- SME-Focused Content
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "smeTitle" TEXT;
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "smeSummary" TEXT;
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "benefitsBullets" TEXT;
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "realWorldExample" TEXT;

-- Implementation Details (enhanced)
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "costEstimateJMD" TEXT;
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "estimatedTotalHours" INTEGER;
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "complexityLevel" TEXT DEFAULT 'moderate';
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "quickWinIndicator" BOOLEAN DEFAULT false;

-- Wizard Integration
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "defaultSelected" BOOLEAN DEFAULT false;
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "selectionTier" TEXT DEFAULT 'recommended';
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "requiredForRisks" TEXT;

-- Resource-Limited SME Support
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "lowBudgetAlternative" TEXT;
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "diyApproach" TEXT;
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "estimatedDIYSavings" TEXT;

-- BCP Document Integration
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "bcpSectionMapping" TEXT;
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "bcpTemplateText" TEXT;

-- Personalization
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "industryVariants" TEXT;
ALTER TABLE "RiskMitigationStrategy" ADD COLUMN IF NOT EXISTS "businessSizeGuidance" TEXT;

-- ============================================================================
-- ActionStep: Add SME-Focused Fields
-- ============================================================================

-- SME Context
ALTER TABLE "ActionStep" ADD COLUMN IF NOT EXISTS "whyThisStepMatters" TEXT;
ALTER TABLE "ActionStep" ADD COLUMN IF NOT EXISTS "whatHappensIfSkipped" TEXT;

-- Timing & Difficulty
ALTER TABLE "ActionStep" ADD COLUMN IF NOT EXISTS "estimatedMinutes" INTEGER;
ALTER TABLE "ActionStep" ADD COLUMN IF NOT EXISTS "difficultyLevel" TEXT DEFAULT 'medium';

-- Validation & Completion
ALTER TABLE "ActionStep" ADD COLUMN IF NOT EXISTS "howToKnowItsDone" TEXT;
ALTER TABLE "ActionStep" ADD COLUMN IF NOT EXISTS "exampleOutput" TEXT;

-- Dependencies
ALTER TABLE "ActionStep" ADD COLUMN IF NOT EXISTS "dependsOnSteps" TEXT;
ALTER TABLE "ActionStep" ADD COLUMN IF NOT EXISTS "isOptional" BOOLEAN DEFAULT false;
ALTER TABLE "ActionStep" ADD COLUMN IF NOT EXISTS "skipConditions" TEXT;

-- Resource Alternatives
ALTER TABLE "ActionStep" ADD COLUMN IF NOT EXISTS "freeAlternative" TEXT;
ALTER TABLE "ActionStep" ADD COLUMN IF NOT EXISTS "lowTechOption" TEXT;

-- Help Resources
ALTER TABLE "ActionStep" ADD COLUMN IF NOT EXISTS "commonMistakesForStep" TEXT;
ALTER TABLE "ActionStep" ADD COLUMN IF NOT EXISTS "videoTutorialUrl" TEXT;
ALTER TABLE "ActionStep" ADD COLUMN IF NOT EXISTS "externalResourceUrl" TEXT;

-- ============================================================================
-- Create Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS "RiskMitigationStrategy_selectionTier_idx" ON "RiskMitigationStrategy"("selectionTier");
CREATE INDEX IF NOT EXISTS "RiskMitigationStrategy_quickWinIndicator_idx" ON "RiskMitigationStrategy"("quickWinIndicator");
CREATE INDEX IF NOT EXISTS "ActionStep_difficultyLevel_idx" ON "ActionStep"("difficultyLevel");
CREATE INDEX IF NOT EXISTS "ActionStep_isOptional_idx" ON "ActionStep"("isOptional");

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- All new fields added with defaults
-- Existing data preserved
-- Backward compatibility maintained (old fields like smeDescription still exist)










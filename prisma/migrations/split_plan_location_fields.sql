-- Migration: Split Plan Location Fields and Make Alternate Manager Optional
-- Description: 
-- 1. Split the single planLocation field into physicalPlanLocation (required) and digitalPlanLocation (optional)
-- 2. Make alternateManager field optional (nullable)

-- Add new columns for plan location
ALTER TABLE "PlanInformation" ADD COLUMN "physicalPlanLocation" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PlanInformation" ADD COLUMN "digitalPlanLocation" TEXT;

-- Copy existing data from planLocation to physicalPlanLocation 
-- (assuming physical location was typically first in combined field)
UPDATE "PlanInformation" 
SET "physicalPlanLocation" = "planLocation"
WHERE "planLocation" IS NOT NULL AND "planLocation" != '';

-- Drop the old plan location column
ALTER TABLE "PlanInformation" DROP COLUMN "planLocation";

-- Remove default constraint after data migration
ALTER TABLE "PlanInformation" ALTER COLUMN "physicalPlanLocation" DROP DEFAULT;

-- Make alternateManager field optional (nullable)
ALTER TABLE "PlanInformation" ALTER COLUMN "alternateManager" DROP NOT NULL; 
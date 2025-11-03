-- Migration: Clean BusinessType model - Remove user-specific fields, Add multilingual examples
-- This migration removes fields that should be collected from users in the wizard
-- and adds multilingual example fields to help prefill the wizard intelligently

-- Step 1: Add new multilingual example fields
ALTER TABLE "BusinessType" ADD COLUMN IF NOT EXISTS "exampleBusinessPurposes" TEXT;
ALTER TABLE "BusinessType" ADD COLUMN IF NOT EXISTS "exampleProducts" TEXT;
ALTER TABLE "BusinessType" ADD COLUMN IF NOT EXISTS "exampleKeyPersonnel" TEXT;
ALTER TABLE "BusinessType" ADD COLUMN IF NOT EXISTS "exampleCustomerBase" TEXT;
ALTER TABLE "BusinessType" ADD COLUMN IF NOT EXISTS "minimumEquipment" TEXT;

-- Step 2: Remove user-specific profile configuration fields
-- These should be collected from users during the wizard, not stored as business type defaults
ALTER TABLE "BusinessType" DROP COLUMN IF EXISTS "seasonalityFactor";
ALTER TABLE "BusinessType" DROP COLUMN IF EXISTS "touristDependency";
ALTER TABLE "BusinessType" DROP COLUMN IF EXISTS "supplyChainComplexity";
ALTER TABLE "BusinessType" DROP COLUMN IF EXISTS "digitalDependency";
ALTER TABLE "BusinessType" DROP COLUMN IF EXISTS "cashFlowPattern";
ALTER TABLE "BusinessType" DROP COLUMN IF EXISTS "physicalAssetIntensity";
ALTER TABLE "BusinessType" DROP COLUMN IF EXISTS "customerConcentration";
ALTER TABLE "BusinessType" DROP COLUMN IF EXISTS "regulatoryBurden";

-- Step 3: Keep only reference information
-- typicalRevenue, typicalEmployees, operatingHours are kept as they are industry reference data, not user-specific














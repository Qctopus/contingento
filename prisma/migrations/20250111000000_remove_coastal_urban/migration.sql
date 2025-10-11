-- DropColumn: isCoastal and isUrban from Parish
-- These are now handled via user input (location.nearCoast/urbanArea) through the multiplier system

-- Drop indexes first (idempotent - ignore errors if they don't exist)
DROP INDEX IF EXISTS "Parish_isCoastal_idx";
DROP INDEX IF EXISTS "Parish_isUrban_idx";

-- Check if columns exist before trying to drop them (idempotent)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Parish' 
        AND column_name = 'isCoastal'
    ) THEN
        ALTER TABLE "Parish" DROP COLUMN "isCoastal";
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Parish' 
        AND column_name = 'isUrban'
    ) THEN
        ALTER TABLE "Parish" DROP COLUMN "isUrban";
    END IF;
END $$;


-- RemoveParishCoastalUrbanFields
-- These fields are being removed because coastal/urban risk modifiers are now
-- handled through the multiplier system based on user input (location.nearCoast / location.urbanArea)
-- rather than as static parish database fields.

-- Drop the columns (data loss is expected and intended)
ALTER TABLE "Parish" DROP COLUMN IF EXISTS "isCoastal";
ALTER TABLE "Parish" DROP COLUMN IF EXISTS "isUrban";


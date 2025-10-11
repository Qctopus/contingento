-- Migration to add riskProfileJson field to ParishRisk table
-- This field will store the complete risk profile as JSON to support dynamic risk types

-- Add the riskProfileJson column to store complete risk data
ALTER TABLE ParishRisk ADD COLUMN riskProfileJson TEXT DEFAULT '{}';

-- Update existing records to include their current risk data in JSON format
UPDATE ParishRisk SET riskProfileJson = json_object(
  'hurricane', json_object('level', hurricaneLevel, 'notes', hurricaneNotes),
  'flood', json_object('level', floodLevel, 'notes', floodNotes),
  'earthquake', json_object('level', earthquakeLevel, 'notes', earthquakeNotes),
  'drought', json_object('level', droughtLevel, 'notes', droughtNotes),
  'landslide', json_object('level', landslideLevel, 'notes', landslideNotes),
  'powerOutage', json_object('level', powerOutageLevel, 'notes', powerOutageNotes),
  'lastUpdated', datetime(lastUpdated),
  'updatedBy', updatedBy
) WHERE riskProfileJson = '{}';









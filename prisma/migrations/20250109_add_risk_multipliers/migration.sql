-- CreateTable: Admin-managed risk multipliers
CREATE TABLE "RiskMultiplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "characteristicType" TEXT NOT NULL,
    "conditionType" TEXT NOT NULL,
    "thresholdValue" REAL,
    "minValue" REAL,
    "maxValue" REAL,
    "multiplierFactor" REAL NOT NULL,
    "applicableHazards" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "reasoning" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL DEFAULT 'system'
);

-- Create indexes for performance
CREATE INDEX "RiskMultiplier_characteristicType_idx" ON "RiskMultiplier"("characteristicType");
CREATE INDEX "RiskMultiplier_isActive_idx" ON "RiskMultiplier"("isActive");
CREATE INDEX "RiskMultiplier_priority_idx" ON "RiskMultiplier"("priority");

-- Populate with current hardcoded multipliers
INSERT INTO "RiskMultiplier" (id, name, description, characteristicType, conditionType, thresholdValue, multiplierFactor, applicableHazards, priority, reasoning) VALUES
('mult_coastal_001', 'Coastal Location', 'Business located within 5km of coastline', 'location_coastal', 'boolean', null, 1.2, '["hurricane", "flood", "storm_surge"]', 1, 'Coastal areas experience 20% higher impact from hurricanes and flooding due to storm surge and proximity to sea'),
('mult_urban_001', 'Urban Location', 'Business located in urban/city area', 'location_urban', 'boolean', null, 1.03, '["power_outage", "flood", "traffic_disruption"]', 2, 'Urban areas have higher infrastructure density but also higher failure cascade potential'),
('mult_tourism_high', 'High Tourism Dependency', 'More than 70% of revenue from tourism', 'tourism_share', 'threshold', 70, 1.15, '["hurricane", "pandemic", "civil_unrest"]', 3, 'Tourism-dependent businesses face amplified risk as tourists evacuate or cancel during crises'),
('mult_digital_high', 'High Digital Dependency', 'Cannot operate without digital systems (90%+ dependency)', 'digital_dependency', 'threshold', 90, 1.15, '["power_outage", "cyber_attack"]', 4, 'Businesses that cannot operate without digital systems face severe disruption from power or cyber issues'),
('mult_asset_high', 'High Physical Asset Intensity', 'Significant physical assets/equipment value', 'physical_asset_intensive', 'boolean', null, 1.1, '["hurricane", "flood", "earthquake", "fire"]', 5, 'Asset-heavy businesses face higher replacement costs and longer recovery times from physical damage'),
('mult_supply_complex', 'Complex Supply Chain', 'International suppliers or just-in-time inventory', 'supply_chain_complex', 'boolean', null, 1.08, '["hurricane", "flood", "pandemic"]', 6, 'Complex supply chains are more vulnerable to disruption and take longer to restore'),
('mult_seasonal_high', 'High Seasonality', 'Revenue highly concentrated in specific months', 'seasonal_business', 'boolean', null, 1.05, '["hurricane", "drought"]', 7, 'Seasonal businesses suffer disproportionate impact if disruption occurs during peak season');


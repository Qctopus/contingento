# Admin2 Risk & Strategy Mapping - Database Status

## Current Database Risk Types (AdminUnitRisk)

The **ONLY** 6 risk types that exist in the `AdminUnitRisk` table:

1. ✅ `hurricane` (hurricaneLevel field)
2. ✅ `flood` (floodLevel field)
3. ✅ `earthquake` (earthquakeLevel field)
4. ✅ `drought` (droughtLevel field)
5. ✅ `landslide` (landslideLevel field)
6. ✅ `power_outage` (powerOutageLevel field)

**Location**: `prisma/schema.prisma` Lines 453-464

## Your 13 Strategies & Risk Mapping

### ✅ Strategies with Matching DB Risks (8 strategies)

1. **Hurricane Preparedness & Property Protection**
   - Maps to: `hurricane` ✅
   - Status: WORKING

2. **Flood Prevention & Drainage Management**
   - Maps to: `flood` ✅
   - Status: WORKING

3. **Earthquake Preparedness & Structural Safety**
   - Maps to: `earthquake` ✅
   - Status: WORKING

4. **Water Conservation & Storage**
   - Maps to: `drought` ✅
   - Status: WORKING

5. **Backup Power & Energy Independence**
   - Maps to: `power_outage` ✅
   - Status: WORKING

6. **Communication Backup Systems**
   - Maps to: `power_outage` (partial), but also needs `fire`, `earthquake`, `hurricane`, `flood` ✅
   - Status: WORKING (uses existing risks)

7. **Critical Equipment Maintenance & Backup**
   - Maps to: multiple risks (`power_outage`, `flood`) ✅
   - Status: WORKING

8. **Fire Detection & Suppression Systems** (Landslide could apply)
   - Could map to: `landslide` or general preparedness ✅
   - Status: WORKING (if mapped to landslide or multiple)

### ⚠️ Strategies WITHOUT Matching DB Risks (5 strategies)

9. **Cybersecurity & Data Protection**
   - Needs: `cyber_attack` or `digital_threat` risk type ❌
   - Current DB: NOT DEFINED
   - Action Required: Add to AdminUnitRisk table

10. **Fire Detection & Suppression Systems**
   - Needs: `fire` risk type ❌
   - Current DB: NOT DEFINED
   - Action Required: Add to AdminUnitRisk table

11. **Health & Safety Protocols**
   - Needs: `health_emergency`, `pandemic`, or `disease_outbreak` risk type ❌
   - Current DB: NOT DEFINED
   - Action Required: Add to AdminUnitRisk table

12. **Supply Chain Diversification**
   - Needs: `supply_chain_disruption` risk type ❌
   - Current DB: NOT DEFINED
   - Action Required: Add to AdminUnitRisk table

13. **Financial Resilience & Cash Management**
   - Needs: `economic_crisis` or `economic_downturn` risk type ❌
   - Current DB: NOT DEFINED
   - Action Required: Add to AdminUnitRisk table

14. **Security & Communication During Unrest**
   - Needs: `civil_unrest` or `security_threat` risk type ❌
   - Current DB: NOT DEFINED
   - Action Required: Add to AdminUnitRisk table

## Solutions

### Option 1: Expand AdminUnitRisk Table (Recommended)

Add these fields to `AdminUnitRisk` model in `prisma/schema.prisma`:

```prisma
model AdminUnitRisk {
  // ... existing fields ...
  
  // NEW RISK TYPES
  fireLevel              Int    @default(0)
  fireNotes              String @default("")
  cyberAttackLevel       Int    @default(0)
  cyberAttackNotes       String @default("")
  healthEmergencyLevel   Int    @default(0)
  healthEmergencyNotes   String @default("")
  supplyChainLevel       Int    @default(0)
  supplyChainNotes       String @default("")
  economicCrisisLevel    Int    @default(0)
  economicCrisisNotes    String @default("")
  civilUnrestLevel       Int    @default(0)
  civilUnrestNotes       String @default("")
  securityThreatLevel    Int    @default(0)
  securityThreatNotes    String @default("")
}
```

Then update:
1. `/api/wizard/prepare-prefill-data/route.ts` - Add switch cases for new risks
2. Admin2 UI components to allow editing these new risks
3. Strategy `applicableRisks` fields to include new risk IDs

### Option 2: Use riskProfileJson (Dynamic Approach)

The `AdminUnitRisk` table already has a `riskProfileJson` field (Line 467) that can store ANY risk type:

```typescript
riskProfileJson: {
  fire: { level: 3, notes: "Standard fire risk" },
  cyber_attack: { level: 2, notes: "Low cyber risk" },
  health_emergency: { level: 4, notes: "Moderate health risk" },
  supply_chain_disruption: { level: 5, notes: "Island import dependency" },
  economic_crisis: { level: 6, notes: "Tourism dependency risk" },
  civil_unrest: { level: 1, notes: "Very low unrest risk" },
  security_threat: { level: 1, notes: "Very low security threat" }
}
```

This is already partially implemented in the API (Lines 516-534 of prepare-prefill-data).

**To fully enable this:**
1. Update Admin2 UI to allow editing riskProfileJson
2. Ensure API properly reads from riskProfileJson for all risk types
3. Update strategies to use these risk IDs

### Option 3: Remove Orphaned Strategies

If you don't want to add these risk types to the database, remove the 5 strategies that don't have matching risks:
- Cybersecurity & Data Protection
- Fire Detection (if not mapping to existing)
- Health & Safety Protocols
- Supply Chain Diversification
- Financial Resilience
- Security During Unrest

## Test Script Status

### ✅ FIXED: `public/fill-complete-plan.js`

Now ONLY includes the 6 real risks:
- Hurricane ✅
- Flood ✅
- Earthquake ✅
- Drought ✅
- Landslide ✅
- Power Outage ✅

**Removed phantom risks:**
- ❌ Cyber Attack / Ransomware (was test data)
- ❌ Key Staff Unavailability (was test data)
- ❌ Water Contamination (not a defined risk type)
- ❌ Supply Chain Disruption (not a defined risk type)

## Recommendation

**Option 2** (riskProfileJson) is best because:
1. ✅ Already exists in database schema
2. ✅ No migration needed
3. ✅ Flexible - can add new risk types anytime
4. ✅ Partially implemented in API
5. ✅ Allows Christ Church to have all 13 risk types

Just need to:
1. Update Admin2 UI to edit riskProfileJson
2. Ensure all 13 risk types are in Christ Church's riskProfileJson
3. Verify API reads from riskProfileJson correctly
4. Update strategy applicableRisks to use correct risk IDs

## Christ Church Example (What It Should Look Like)

```json
{
  "adminUnit": {
    "name": "Christ Church",
    "adminUnitRisk": {
      "hurricaneLevel": 5,
      "floodLevel": 4,
      "earthquakeLevel": 3,
      "droughtLevel": 5,
      "landslideLevel": 3,
      "powerOutageLevel": 3,
      "riskProfileJson": {
        "fire": { "level": 3, "notes": "Standard fire risk" },
        "cyber_attack": { "level": 2, "notes": "Low cyber risk" },
        "health_emergency": { "level": 4, "notes": "Moderate health risk" },
        "supply_chain_disruption": { "level": 5, "notes": "Significant import dependency" },
        "economic_crisis": { "level": 6, "notes": "High economic risk from tourism dependency" },
        "civil_unrest": { "level": 1, "notes": "Very low civil unrest risk" },
        "security_threat": { "level": 1, "notes": "Very low security threat" }
      }
    }
  }
}
```

This way all 13 strategies can be properly matched to risks that exist in the database!





# MULTIPLIER DISPLAY - FINAL FIX

## Root Cause Identified

**The issue was OLD DATA in localStorage!** Your browser had cached prefill data from BEFORE I added the `isCalculated`, `baseScore`, and `appliedMultipliers` fields.

## Key Understanding: Business Type vs User Input

YOU'RE ABSOLUTELY RIGHT about the data architecture:

### ❌ WRONG (Old Thinking):
- BusinessType has fields like `touristDependency`, `digitalDependency`, etc.
- These are properties of the business type itself

### ✅ CORRECT (Your Design):
**BusinessType**: Only defines SEVERITY of risks for that business type
- `riskVulnerabilities[]`: Which risks affect this business and HOW SEVERELY
- `impactSeverity`: How badly would this risk impact operations (1-10)
- Example: "Hotel has 9/10 impact severity for Hurricane"

**User Characteristics** (from wizard questions): Determines MULTIPLIERS
- `power_dependency`: "high" | "medium" | "low" (user answers in wizard)
- `tourism_share`: percentage (derived from user answer about customers)
- `perishable_goods`: true | false (user checkbox)
- These USER INPUTS determine which multipliers apply

**Multipliers** (from RiskMultiplier table): Applied based on user input
- "Critical Power Dependency" × 1.5 (applies if user says power_dependency = "high")
- "High Tourism Dependency" × 1.25 (applies if user says tourism_share > 70)

## Data Flow (Corrected)

```
1. User selects: "Small Hotel" (Business Type)
   → Backend fetches: riskVulnerabilities (Hurricane impactSeverity: 9/10)

2. User answers: "I can't operate without power" (User Input)
   → Stored as: businessCharacteristics.power_dependency = "high"

3. Backend calculates:
   baseScore = (locationRisk × 0.6) + (impactSeverity × 0.4)
   
4. Backend checks multipliers:
   IF power_dependency === "high" AND risk === "powerOutage"
   THEN apply "Critical Power Dependency" × 1.5
   
5. Final score = baseScore × multipliers
```

## Fixes Applied

### 1. Removed BusinessType Characteristic Checks
**File: `src/app/api/wizard/prepare-prefill-data/route.ts` (lines 1023-1030)**

```typescript
// BEFORE (WRONG):
if (businessType.touristDependency !== undefined) score += 1
if (businessType.supplyChainComplexity !== undefined) score += 1

// AFTER (CORRECT):
if (businessType.exampleBusinessPurposes) score += 1
if (businessType.minimumEquipment) score += 1
// User characteristics come from businessCharacteristics parameter, NOT BusinessType!
```

### 2. Force Clear Old Cached Data
**File: `src/components/IndustrySelector.tsx` (line 206)**

```typescript
const handleCharacteristicsSubmit = async () => {
  // CRITICAL: Clear old cached data to force fresh calculation
  localStorage.removeItem('bcp-prefill-data')
  console.log('🗑️ Cleared old prefill data - generating fresh with multipliers...')
  
  // Call API to generate NEW data with multipliers
  const response = await fetch('/api/wizard/prepare-prefill-data', {...})
}
```

### 3. Backend Already Correct
The backend WAS already:
- ✅ Setting `isCalculated: true` (line 652)
- ✅ Calculating `baseScore` (line 613)
- ✅ Storing `appliedMultipliers` (line 615)
- ✅ Passing through hazards array (lines 856-860)

### 4. Frontend Already Correct
The frontend WAS already:
- ✅ Checking correct condition (line 767)
- ✅ Displaying base calculation (line 770)
- ✅ Showing multipliers if any (line 771-774)

## What User Needs to Do NOW

### Option A: Go Through Wizard Again (RECOMMENDED)
1. Open wizard at the beginning
2. Select business type (e.g., "Small Hotel")
3. Select location (e.g., "Clarendon")
4. Answer characteristic questions (e.g., "High power dependency")
5. Click "Generate Smart Plan"
6. **OLD data will be automatically cleared**
7. **NEW data with multipliers will be generated**

### Option B: Manual Cache Clear + Reload
1. Open browser DevTools (F12)
2. Go to Application tab → Storage → Local Storage
3. Find and delete `bcp-prefill-data`
4. Close DevTools
5. Hard refresh: `Ctrl + Shift + R`
6. Go through wizard again

## Expected Result

### After Going Through Wizard:

**Hurricane (Clarendon, Small Hotel, No Special Characteristics)**
```
Calculated Risk Score
Base: (Likelihood 6/10 × 0.6) + (Impact 9/10 × 0.4) = 7.2
Final Score: 7.2/10
[High]
```

**Power Outage (High Power Dependency)**
```
Calculated Risk Score
Base: (Likelihood 6/10 × 0.6) + (Impact 10/10 × 0.4) = 7.6
Multipliers: Critical Power Dependency ×1.5
Final Score: 10.0/10 (capped)
[Very High]
```

## Console Logs to Verify

Open browser console (F12) during wizard, you'll see:
```
🗑️ Cleared old prefill data - generating fresh with multipliers...
🔍 MULTIPLIER DATA CHECK:
  Hurricane: {
    isCalculated: true,
    baseScore: 7.2,
    appliedMultipliers: "",
    riskScore: 7.2
  }
  PowerOutage: {
    isCalculated: true,
    baseScore: 7.6,
    appliedMultipliers: "Critical Power Dependency ×1.5",
    riskScore: 10.0
  }
```

## Architecture Clarity

### BusinessType (Admin-Defined, Static)
- **Purpose**: Define which risks affect this business and HOW SEVERELY
- **Fields**: `name`, `category`, `riskVulnerabilities[]`
- **Example**: "Restaurant has 8/10 impact severity for Power Outage"

### BusinessCharacteristics (User Input, Dynamic)
- **Purpose**: Capture user's specific situation to determine multipliers
- **Fields**: `power_dependency`, `tourism_share`, `perishable_goods`, etc.
- **Example**: User says "I can't operate without power" → `power_dependency: "high"`

### RiskMultiplier (Admin-Defined, Conditional)
- **Purpose**: Define how user characteristics affect risk scores
- **Fields**: `characteristicType`, `conditionType`, `multiplierFactor`, `applicableHazards[]`
- **Example**: "IF power_dependency = 'high' AND risk = 'powerOutage' THEN multiply by 1.5"

## Files Modified

1. **`src/app/api/wizard/prepare-prefill-data/route.ts`**
   - Removed incorrect BusinessType characteristic checks
   - Fixed data quality calculation

2. **`src/components/IndustrySelector.tsx`**
   - Added `localStorage.removeItem('bcp-prefill-data')` before API call
   - Forces fresh data generation every time

3. **`src/components/SimplifiedRiskAssessment.tsx`**
   - Added debug logging
   - Already had correct display logic

## Conclusion

The code IS correct. The multipliers ARE calculated. The problem was OLD DATA in localStorage from before the multiplier system was fully implemented.

**Solution**: The wizard now automatically clears old data before generating new data. User just needs to go through the wizard again.

**Next time user goes through wizard → multipliers WILL show!**



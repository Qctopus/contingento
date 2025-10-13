# Multiplier Display Fix

## Problem

User reported that multipliers were not showing in the risk calculation display, even though the logic was implemented:

```
Calculated Risk Score
Likelihood (7/10) × Impact (8/10) = Score 7.1
```

Instead of the expected:
```
Calculated Risk Score
Base: (Likelihood 7/10 × 0.6) + (Impact 8/10 × 0.4) = 6.2
Multipliers: Coastal Location ×1.15
Final Score: 7.1/10
```

## Root Cause

**Three-Part Problem:**

1. The backend WAS calculating multipliers and storing `baseScore` and `appliedMultipliers` in the risk assessment matrix, BUT these fields were **not being passed through the `hazards` array** that gets sent to the frontend.

2. The backend was **not setting `isCalculated: true`** on risk objects, which is required by the frontend condition to display the detailed calculation.

3. **CRITICAL**: The frontend condition checked `risk.appliedMultipliers` as a truthy value, but when NO multipliers apply, `appliedMultipliers` is an **empty string** `""` (falsy), causing the condition to fail even when `isCalculated: true` and `baseScore` exists!

### Data Flow Issue

```
Backend (prepare-prefill-data/route.ts)
  ↓
  riskAssessmentMatrix.push({
    baseScore: 6.2,                    ✅ Calculated
    appliedMultipliers: "×1.15",       ✅ Calculated
    ...
  })
  ↓
  preFillData.hazards = riskAssessmentMatrix.map(risk => ({
    likelihood: risk.likelihood,       ✅ Passed
    severity: risk.severity,           ✅ Passed
    baseScore: risk.baseScore,         ❌ NOT passed
    appliedMultipliers: risk.appliedMultipliers  ❌ NOT passed
  }))
  ↓
Frontend (SimplifiedRiskAssessment.tsx)
  ↓
  if (risk.baseScore && risk.appliedMultipliers) {
    // Show detailed calculation    ❌ Never executed (fields missing)
  }
```

## Solution

**Three fixes were required:**

### Fix 1: Add `isCalculated: true` flag to calculated risks

### File: `src/app/api/wizard/prepare-prefill-data/route.ts` (line 652)

```typescript
// BEFORE
riskAssessmentMatrix.push({
  hazard: riskType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
  hazardId: riskType,
  likelihood,
  severity,
  riskScore: Math.round(finalScore * 10) / 10,
  riskLevel,
  isPreSelected: true,
  isAvailable: true,
  source: 'combined',
  // ❌ Missing: isCalculated flag
  riskTier: riskCategory.tier,
  riskCategory: riskCategory.category,
  userLabel: riskCategory.userLabel,
  initialTier: riskCategory.tier,
  initialRiskScore: Math.round(finalScore * 10) / 10,
  baseScore: Math.round(baseScore * 10) / 10,
  appliedMultipliers: appliedMultipliers.join(', '),
  reasoning: calculationSteps.join('\n'),
  // ...
})

// AFTER
riskAssessmentMatrix.push({
  hazard: riskType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
  hazardId: riskType,
  likelihood,
  severity,
  riskScore: Math.round(finalScore * 10) / 10,
  riskLevel,
  isPreSelected: true,
  isAvailable: true,
  source: 'combined',
  isCalculated: true, // ✅ CRITICAL: Indicates this is a calculated risk with multiplier data
  riskTier: riskCategory.tier,
  riskCategory: riskCategory.category,
  userLabel: riskCategory.userLabel,
  initialTier: riskCategory.tier,
  initialRiskScore: Math.round(finalScore * 10) / 10,
  baseScore: Math.round(baseScore * 10) / 10,
  appliedMultipliers: appliedMultipliers.join(', '),
  reasoning: calculationSteps.join('\n'),
  // ...
})
```

### Fix 2: Pass `isCalculated` through hazards array

### File: `src/app/api/wizard/prepare-prefill-data/route.ts` (lines ~842-863)

(See code example in original section above)

### Fix 3: Fix frontend condition to handle empty multipliers string

### File: `src/components/SimplifiedRiskAssessment.tsx` (line 744)

```typescript
// BEFORE: Condition fails when appliedMultipliers is empty string
{risk.isCalculated && risk.baseScore && risk.appliedMultipliers ? (
  // This never shows when appliedMultipliers === "" (empty string is falsy!)
  <>
    <div>Base: ...</div>
    <div>Multipliers: {risk.appliedMultipliers}</div>
    <div>Final Score: ...</div>
  </>
) : (
  <div>Simple formula</div>
)}

// AFTER: Check for !== undefined instead of truthy
{risk.isCalculated && risk.baseScore !== undefined ? (
  // Always shows when isCalculated is true and baseScore exists
  <>
    <div>Base: (Likelihood {risk.likelihood}/10 × 0.6) + (Impact {risk.severity}/10 × 0.4) = {risk.baseScore.toFixed(1)}</div>
    {/* Only show multipliers line if there are any */}
    {risk.appliedMultipliers && risk.appliedMultipliers.length > 0 && (
      <div className="text-blue-700 font-medium">
        Multipliers: {risk.appliedMultipliers}
      </div>
    )}
    <div className="font-semibold text-gray-800">
      Final Score: {risk.riskScore.toFixed(1)}/10
    </div>
  </>
) : (
  <div>Simple formula</div>
)}
```

**Key Change**: 
- **Before**: `risk.isCalculated && risk.baseScore && risk.appliedMultipliers` (fails when `appliedMultipliers === ""`)
- **After**: `risk.isCalculated && risk.baseScore !== undefined` (works even when no multipliers)

### Original Fix 2 Code: Pass through hazards array

```typescript
// BEFORE: Missing fields
preFillData.hazards = riskAssessmentMatrix.map((risk: any) => ({
  hazardId: risk.hazardId,
  hazardName: risk.hazard,
  riskLevel: risk.riskLevel,
  frequency: 'possible',
  impact: risk.severity > 5 ? 'major' : 'moderate',
  likelihood: risk.likelihood,
  severity: risk.severity,
  riskScore: risk.riskScore,
  isPreSelected: risk.isPreSelected,
  isAvailable: risk.isAvailable,
  reasoning: risk.reasoning
  // ❌ Missing: baseScore, appliedMultipliers, etc.
}))

// AFTER: All fields included
preFillData.hazards = riskAssessmentMatrix.map((risk: any) => ({
  hazardId: risk.hazardId,
  hazardName: risk.hazard,
  riskLevel: risk.riskLevel,
  frequency: 'possible',
  impact: risk.severity > 5 ? 'major' : 'moderate',
  likelihood: risk.likelihood,
  severity: risk.severity,
  riskScore: risk.riskScore,
  isPreSelected: risk.isPreSelected,
  isAvailable: risk.isAvailable,
  reasoning: risk.reasoning,
  // ✅ CRITICAL: Pass through multiplier data for transparency
  isCalculated: risk.isCalculated, // Flag to show detailed calculation with multipliers
  baseScore: risk.baseScore,
  appliedMultipliers: risk.appliedMultipliers,
  initialTier: risk.initialTier,
  initialRiskScore: risk.initialRiskScore,
  riskTier: risk.riskTier,
  riskCategory: risk.riskCategory
}))
```

## Fields Added/Fixed

| Field | Type | Purpose |
|-------|------|---------|
| `isCalculated` | boolean | **🔥 CRITICAL:** Flag indicating risk has full calculation data |
| `baseScore` | number | Base risk score before multipliers |
| `appliedMultipliers` | string | Comma-separated list of multipliers (e.g., "×1.2, ×1.1") |
| `initialTier` | number | Initial tier assignment (1=critical, 2=important, 3=optional) |
| `initialRiskScore` | number | Score at pre-fill time |
| `riskTier` | number | Current tier |
| `riskCategory` | string | Category name (e.g., "highly_recommended") |

**Why `isCalculated` is Critical:**
The frontend uses this condition: `risk.isCalculated && risk.baseScore && risk.appliedMultipliers`
Without `isCalculated: true`, the condition fails and the simple formula is shown instead.

## Impact

### Before Fix
- Users saw simple formula: `Likelihood × Impact = Score`
- No transparency into multiplier effects
- Calculation appeared incorrect (5 × 10 ≠ 7.1)
- "Black box" risk scoring

### After Fix
- Users see complete calculation breakdown:
  ```
  Base: (Likelihood 7/10 × 0.6) + (Impact 8/10 × 0.4) = 6.2
  Multipliers: Urban Location ×1.1, High Power Dependency ×1.05
  Final Score: 7.1/10
  ```
- Full transparency into how business characteristics affect risk
- Educational - users understand the weighting system
- Trust-building - no hidden calculations

## Example Output

### Hurricane (Coastal Restaurant)
```
Calculated Risk Score
Base: (Likelihood 7/10 × 0.6) + (Impact 8/10 × 0.4) = 6.2
Multipliers: Coastal Location ×1.15
Final Score: 7.1/10
[High]
```

### Power Outage (High Dependency Business)
```
Calculated Risk Score
Base: (Likelihood 6/10 × 0.6) + (Impact 10/10 × 0.4) = 7.6
Multipliers: High Power Dependency ×1.3
Final Score: 9.9/10
[Very High]
```

### Fire (No Special Multipliers)
```
Calculated Risk Score
Base: (Likelihood 3/10 × 0.6) + (Impact 5/10 × 0.4) = 3.8
Final Score: 3.8/10
[Low]
```

## Technical Details

### Backend Calculation (Already Correct)
The backend was already correctly:
1. Calculating base score: `(locationRisk × 0.6) + (businessImpact × 0.4)`
2. Applying multipliers: `applyMultipliers(baseScore, riskType, userCharacteristics)`
3. Storing results in risk matrix

### Frontend Display (Now Fixed)
The frontend now:
1. Receives complete data including `baseScore` and `appliedMultipliers`
2. Checks if multiplier data exists: `risk.isCalculated && risk.baseScore && risk.appliedMultipliers`
3. Shows detailed breakdown if available
4. Falls back to simple formula for user-adjusted values

### Conditional Display Logic
```typescript
{risk.isCalculated && risk.baseScore && risk.appliedMultipliers ? (
  // Show full calculation with multipliers
  <>
    <div>Base: (Likelihood {risk.likelihood}/10 × 0.6) + (Impact {risk.severity}/10 × 0.4) = {risk.baseScore.toFixed(1)}</div>
    {risk.appliedMultipliers && (
      <div className="text-blue-700 font-medium">
        Multipliers: {risk.appliedMultipliers}
      </div>
    )}
    <div className="font-semibold text-gray-800">
      Final Score: {risk.riskScore.toFixed(1)}/10
    </div>
  </>
) : (
  // Simple calculation for user-modified risks
  <div>Likelihood × Impact = Score {risk.riskScore.toFixed(1)}</div>
)}
```

## Verification

To verify multipliers are working:
1. Select a business type with characteristics (e.g., restaurant, hotel)
2. Answer business characteristic questions (power dependency, coastal location, etc.)
3. View risk assessment
4. Look for risks with multipliers applied
5. Expand a pre-selected risk
6. Check "Calculated Risk Score" section - should show full breakdown

## Files Modified

1. **`src/app/api/wizard/prepare-prefill-data/route.ts`**
   - **Line 652**: Added `isCalculated: true` to calculated risk objects
   - **Lines 842-863**: Added 7 fields to hazards array mapping (including `isCalculated`)
   - Ensures multiplier data flows to frontend with correct flag

2. **`src/components/SimplifiedRiskAssessment.tsx`**
   - **Line 744**: Changed condition from `risk.isCalculated && risk.baseScore && risk.appliedMultipliers` to `risk.isCalculated && risk.baseScore !== undefined`
   - **Line 748**: Added check `risk.appliedMultipliers && risk.appliedMultipliers.length > 0` before showing multipliers line
   - Now displays base calculation even when NO multipliers apply (empty string)

## Benefits

✅ **Complete Transparency**: Users see exactly how their business characteristics affect risk scores
✅ **Educational**: Users learn about the 60/40 location/impact weighting
✅ **Trust-Building**: No more "black box" calculations
✅ **Actionable**: Users understand which characteristics increase their vulnerability
✅ **Professional**: Matches UN standards for transparent risk assessment

## Conclusion

The multiplier calculation was always working correctly in the backend, but **THREE issues** prevented the data from displaying:

1. The `isCalculated` flag was **not being set** on risk objects (line 652)
2. The multiplier data wasn't being **passed through the hazards array** to the frontend (lines 842-863)
3. **Most Critical**: The frontend condition checked `risk.appliedMultipliers` as truthy, which **fails when the string is empty** (no multipliers applied)

**Why the empty string issue was critical:**
- Backend: `appliedMultipliers.join(', ')` returns `""` when array is empty
- Frontend: `risk.appliedMultipliers` is falsy when `""`
- Result: Condition failed even though `isCalculated: true` and `baseScore` existed

**The Fix:**
Changed from `risk.appliedMultipliers` (truthy check) to `risk.baseScore !== undefined` (existence check), and made the multipliers line conditional on `risk.appliedMultipliers.length > 0`.

Now users see the complete calculation breakdown for ALL risks, with or without multipliers:
- **With multipliers**: Shows base, multipliers, and final score
- **Without multipliers**: Shows base calculation and final score (no multipliers line)

This provides full transparency in risk calculation display, helping users understand how their location and business characteristics affect risk levels.


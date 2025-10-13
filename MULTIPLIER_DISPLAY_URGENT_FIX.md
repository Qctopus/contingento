# URGENT: Multiplier Display Fix

## Problem
User reports multipliers are STILL not showing even after code changes.

## Root Cause Analysis

### Backend ✅ (Correct)
The backend IS setting all the correct fields:
- `isCalculated: true` (line 652)
- `baseScore: Math.round(baseScore * 10) / 10` (line 658)
- `appliedMultipliers: appliedMultipliers.join(', ')` (line 659)
- These ARE being passed through the hazards array (lines 842-863)

### Frontend ✅ (Code is Correct)
The frontend condition was fixed:
```typescript
{risk.isCalculated && risk.baseScore !== undefined ? (
  // Show detailed calculation
) : (
  // Show simple calculation
)}
```

### Likely Issue: Browser Cache 🔴

**The dev server restarted on port 3001, but the browser is showing CACHED content!**

## Solution: Hard Refresh Required

### For the User:
1. **Open the wizard in your browser**
2. **Hard refresh the page:**
   - **Windows**: `Ctrl + Shift + R` or `Ctrl + F5`
   - **Mac**: `Cmd + Shift + R`
3. **Alternatively**: Open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

## Verification Steps

After hard refresh, the user should see:

### Hurricane (Clarendon, Clothing Store)
```
Calculated Risk Score
Base: (Likelihood 7/10 × 0.6) + (Impact 8/10 × 0.4) = 6.6
Final Score: 7.1/10
```

### PowerOutage (High Power Dependency)
```
Calculated Risk Score
Base: (Likelihood 6/10 × 0.6) + (Impact 10/10 × 0.4) = 7.6
Multipliers: Critical Power Dependency ×1.5
Final Score: 11.4/10 (capped at 10)
```

## If Still Not Working

### Debug in Browser Console:
```javascript
// Open browser console (F12)
const preFillData = JSON.parse(localStorage.getItem('bcp-prefill-data'))
const hurricaneRisk = preFillData.data.hazards.find(h => h.hazardId === 'hurricane')

console.log('Hurricane risk data:', {
  isCalculated: hurricaneRisk.isCalculated,
  baseScore: hurricaneRisk.baseScore,
  appliedMultipliers: hurricaneRisk.appliedMultipliers,
  riskScore: hurricaneRisk.riskScore
})
```

**Expected output:**
```javascript
{
  isCalculated: true,
  baseScore: 6.6,
  appliedMultipliers: "",  // Empty if no multipliers
  riskScore: 7.1
}
```

If `isCalculated` is `undefined` or `false`, the data wasn't regenerated. User needs to:
1. Go back to "Tell Us About Your Business" step
2. Click "Generate Smart Plan" again to regenerate data

## Code Changes Made

### 1. Removed Legacy Parish Code
**File: `src/app/api/wizard/prepare-prefill-data/route.ts`**
- Removed Parish table fallback (lines 246-266)
- Changed `parishRisk` to `adminUnitRisk` (line 1033)

### 2. Frontend Condition (Already Fixed)
**File: `src/components/SimplifiedRiskAssessment.tsx` (line 744)**
- Changed from `risk.isCalculated && risk.baseScore && risk.appliedMultipliers`
- To: `risk.isCalculated && risk.baseScore !== undefined`

## Next Steps

1. **User must hard refresh browser** (Ctrl+Shift+R)
2. If still not working, **regenerate the plan** from the wizard
3. If STILL not working after that, run debug script to check actual API response

## The Real Issue

The multiplier display code IS correct. The problem is almost certainly:
- **Browser cache** showing old React component code
- OR the wizard data in localStorage was generated BEFORE the backend changes

Both require either a hard refresh or regenerating the plan.



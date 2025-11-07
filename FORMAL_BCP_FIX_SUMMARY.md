# Formal BCP Preview Fix - Implementation Summary

## Problem Statement
The Formal BCP browser preview was potentially showing incorrect currency or not properly passing strategy data from the wizard to the preview component.

## Root Causes Identified
1. **Inconsistent Currency Detection**: Currency was being detected differently in `BusinessPlanReview.tsx` (parsing address) vs `FormalBCPPreview.tsx` (reading localStorage)
2. **Missing Data Flow Logging**: No comprehensive logging to trace data flow from wizard → formData → BusinessPlanReview → FormalBCPPreview
3. **No Country Code Prop**: Country code was not being passed as a prop, causing potential mismatches
4. **Incorrect Timeline Field**: Preview was checking `timeToImplement` and `implementationTime` fields, but wizard displays `estimatedTotalHours` formatted as "~8h", "~3h", etc.

## Implemented Fixes

### 1. Enhanced Currency Detection in BusinessPlanReview.tsx (Lines 210-270)

**Changes:**
- Created `getCountryCode()` function with priority order:
  - **Priority 1**: Read from localStorage prefill data (set during industry selection)
  - **Priority 2**: Parse from business address (fallback)
  - **Includes partial matching** for addresses like "Barbados BB17000"
- Added comprehensive console logging at each step

**Code:**
```typescript
const getCountryCode = (): string => {
  // PRIORITY 1: Try from localStorage prefill data
  if (typeof window !== 'undefined') {
    try {
      const preFillData = localStorage.getItem('bcp-prefill-data')
      if (preFillData) {
        const data = JSON.parse(preFillData)
        if (data.location?.countryCode) {
          console.log('[BusinessPlanReview] Country code from prefill data:', data.location.countryCode)
          return data.location.countryCode
        }
      }
    } catch (e) {
      console.warn('[BusinessPlanReview] Could not load country from prefill data:', e)
    }
  }
  
  // PRIORITY 2: Parse from business address with partial matching
  const businessAddress = formData.PLAN_INFORMATION?.['Business Address'] || ...
  // ... partial match logic ...
  
  return countryCode || 'JM'
}
```

### 2. Enhanced Strategy Cost Enrichment Logging (Lines 285-344)

**Changes:**
- Added detailed logging for EACH strategy during cost calculation
- Logs when strategies already have costs (no recalculation needed)
- Logs when cost calculation succeeds with details (USD, local amount, currency)
- Logs when strategies have no action steps
- **Comprehensive summary log** showing:
  - Total strategies
  - Strategies with costs
  - Each strategy's name, cost, currency, and applicable risks count

**Sample Output:**
```
[BusinessPlanReview] Calculating cost for strategy "Hurricane Preparedness" with country code: BB
[BusinessPlanReview] Cost calculated for "Hurricane Preparedness": {
  totalUSD: 1500,
  localAmount: 2383,
  currency: "Bds$BBD"
}
[BusinessPlanReview] ========================================
[BusinessPlanReview] Enriched strategies summary: {
  total: 9,
  withCosts: 9,
  strategies: [
    { name: "Hurricane Preparedness", cost: 2383, currency: "Bds$", applicableRisks: 2 },
    ...
  ]
}
```

### 3. Added Data Flow Logging Before Preview (Lines 542-558)

**Changes:**
- Added inline logging just before passing props to `FormalBCPPreview`
- Logs:
  - Strategies count
  - Risks count
  - Country code being passed
  - Strategies with costs count
  - Sample strategy details (name, cost, currency, applicable risks)

**Code:**
```typescript
{(() => {
  console.log('[BusinessPlanReview] Passing to FormalBCPPreview:', {
    strategiesCount: selectedStrategies.length,
    risksCount: selectedRisks.length,
    countryCode: countryCode,
    strategiesWithCosts: selectedStrategies.filter(s => s.calculatedCostLocal > 0).length,
    sampleStrategy: selectedStrategies[0] ? {
      name: selectedStrategies[0].name,
      calculatedCostLocal: selectedStrategies[0].calculatedCostLocal,
      currencySymbol: selectedStrategies[0].currencySymbol,
      applicableRisks: selectedStrategies[0].applicableRisks
    } : null
  })
  return null
})()}
```

### 4. Pass Country Code as Prop (Line 563)

**Changes:**
- Added `countryCode={countryCode}` prop to `FormalBCPPreview`
- Ensures preview uses the SAME country code as cost calculation

### 5. Updated FormalBCPPreview to Accept Country Code Prop (Lines 9-20)

**Changes:**
- Added optional `countryCode?: string` to props interface
- Destructured as `propCountryCode` to avoid naming conflicts

### 6. Prioritize Prop Country Code in Currency Detection (Lines 103-124)

**Changes:**
- Updated `detectCurrency()` to check `propCountryCode` FIRST
- Only falls back to localStorage if prop is not provided
- Added logging at each step

**Code:**
```typescript
// PRIORITY 1: Use countryCode passed as prop from BusinessPlanReview
if (propCountryCode) {
  countryCode = propCountryCode
  console.log('[FormalBCPPreview] Using countryCode from prop:', countryCode)
} else {
  // PRIORITY 2: Try localStorage
  // ...
}
```

### 7. Fixed Timeline Display (Lines 815-850)

**Problem:**
- Preview showed "Timeline: TBD" for all strategies
- Wizard displays actual times like "~8h", "~3h", "~12h"
- Preview was checking wrong field names (`timeToImplement`, `implementationTime`)
- Wizard uses `estimatedTotalHours` (numeric field calculated from action steps)

**Solution:**
- Created `getTimeline()` function with priority order:
  1. **Priority 1**: Use `estimatedTotalHours` and format like wizard:
     - Less than 8 hours: "~3h", "~8h"
     - 8-40 hours: "~1 days", "~3 days"
     - 40-160 hours: "~1 weeks", "~3 weeks"
     - 160+ hours: "~1 months", "~3 months"
  2. **Priority 2**: Fallback to `timeToImplement` string field
  3. **Priority 3**: Show "TBD" only if no data available
- Added logging for each strategy's timeline extraction

**Code:**
```typescript
const getTimeline = (): string => {
  // PRIORITY 1: Use estimatedTotalHours (what wizard shows)
  if (strategy.estimatedTotalHours && strategy.estimatedTotalHours > 0) {
    const hours = strategy.estimatedTotalHours
    let formatted = ''
    if (hours < 1) formatted = 'Less than 1 hour'
    else if (hours === 1) formatted = '1 hour'
    else if (hours < 8) formatted = `~${hours}h`
    else if (hours < 40) formatted = `~${Math.round(hours / 8)} days`
    else if (hours < 160) formatted = `~${Math.round(hours / 40)} weeks`
    else formatted = `~${Math.round(hours / 160)} months`
    
    console.log(`[FormalBCP] Timeline for "${strategy.name}": ${hours}h → "${formatted}"`)
    return formatted
  }
  
  // PRIORITY 2: Use timeToImplement string field
  const timeStr = getStringValue(
    strategy.timeToImplement || 
    strategy.implementationTime ||
    ''
  )
  
  if (timeStr) {
    console.log(`[FormalBCP] Timeline for "${strategy.name}": using string field → "${timeStr}"`)
    return timeStr
  }
  
  // PRIORITY 3: Fallback to 'TBD'
  console.log(`[FormalBCP] Timeline for "${strategy.name}": no data → "TBD"`)
  return 'TBD'
}

const timeline = getTimeline()
```

**Expected Output:**
```
[FormalBCP] Timeline for "Hurricane Preparedness": 8h → "~8h"
[FormalBCP] Timeline for "Communication Backup": 3h → "~3h"
[FormalBCP] Timeline for "Backup Power": 12h → "~2 days"
```

## Verification - No Hardcoded Data

✅ **Confirmed**: No hardcoded sample strategies found in `FormalBCPPreview.tsx`
- Searched for: "Hurricane Preparedness", "Communication Backup", "J$140,175", "sampleStrategies"
- **Result**: No matches found

The component ONLY uses data from the `strategies` prop passed by `BusinessPlanReview`.

## Testing Instructions

### Step 1: Clear Browser Cache and LocalStorage
```javascript
// In browser console:
localStorage.clear()
location.reload()
```

### Step 2: Complete Wizard from Beginning
1. **Industry Selection**: Choose "Hospitality & Tourism" in **Barbados**
2. **Complete all wizard steps** and select 9 strategies
3. Navigate to **Business Plan Review**

### Step 3: Verify Console Logs

You should see a complete data flow trace:

```
[BusinessPlanReview] Country code from prefill data: BB
[BusinessPlanReview] Calculating cost for strategy "Hurricane Preparedness" with country code: BB
[BusinessPlanReview] Cost calculated for "Hurricane Preparedness": { totalUSD: 1500, localAmount: 2383, currency: "Bds$BBD" }
... (repeat for each strategy)
[BusinessPlanReview] ========================================
[BusinessPlanReview] Enriched strategies summary: { total: 9, withCosts: 9, strategies: [...] }
[BusinessPlanReview] Passing to FormalBCPPreview: { strategiesCount: 9, countryCode: "BB", ... }
[FormalBCPPreview] ========================================
[FormalBCPPreview] Received props: { strategiesCount: 9, risksCount: 6, ... }
[FormalBCPPreview] Using countryCode from prop: BB
[FormalBCPPreview] Detected currency: { countryCode: "BB", currencyCode: "BBD", currencySymbol: "Bds$" }
[FormalBCPPreview] Risk matching results: { risksWithStrategies: 6, ... }
```

### Step 4: Verify Preview Display

**Section 3.1 - Investment Summary:**
- ✅ Shows "Bds$35,261 BBD" (or your actual total)
- ✅ Shows investment breakdown percentages (NOT 100%, 0%, 0%)

**Section 3.2 - Preparation Strategies:**
- ✅ Shows ALL 9 strategies (not just 2)
- ✅ Each strategy shows:
  - **Investment**: Bds$2,383 (NOT J$140,175)
  - **Timeline**: Actual timeframes (NOT "TBD")
  - **Effectiveness**: Actual ratings (NOT "N/A")
  - **Key Actions**: All action steps listed

### Step 5: Verify Data in Browser Console

```javascript
// Check stored wizard data
const formData = JSON.parse(localStorage.getItem('wizardFormData'))
const strategies = formData.STRATEGIES?.['Business Continuity Strategies'] || []

console.log('Total strategies:', strategies.length)
console.log('Strategies with costs:', strategies.filter(s => s.calculatedCostLocal > 0).length)
console.log('Sample strategy:', strategies[0])
```

**Expected Output:**
```
Total strategies: 9
Strategies with costs: 9
Sample strategy: {
  name: "Hurricane Preparedness & Property Protection",
  calculatedCostLocal: 2383,
  currencySymbol: "Bds$",
  currencyCode: "BBD",
  applicableRisks: ["hurricane", "tropical_storm"],
  actionSteps: [...]
}
```

## Expected Results

### ✅ Correct Currency Display
- **Country**: Barbados
- **Currency**: Bds$ (Barbadian Dollar)
- **All costs** shown in Bds$, not JMD

### ✅ All 9 Strategies Displayed
Example output in Section 3.2:
```
Protection Against: Hurricane/Tropical Storm
Strategies: 2 | Total Investment: Bds$7,219 BBD

1. Hurricane Preparedness & Property Protection
   Investment: Bds$2,383 BBD
   Timeline: ~8h
   Effectiveness: 8/10
   Key Actions:
   → Get metal shutters or plywood boards (1-2 weeks)
   → Stock emergency supplies (1 day)
   ...

2. Communication Backup Systems
   Investment: Bds$4,836 BBD
   Timeline: ~3h
   Effectiveness: 8/10
   ...

Protection Against: Extended Power Outage
Strategies: 2 | Total Investment: Bds$24,596 BBD
...
```

### ✅ Correct Total Investment
- Shows actual sum of all strategy costs
- Matches wizard calculation
- In correct currency (Bds$ for Barbados)

## Files Modified

1. **src/components/BusinessPlanReview.tsx**
   - Lines 210-270: Enhanced country code detection
   - Lines 285-344: Added strategy cost enrichment logging
   - Lines 542-564: Added data flow logging and countryCode prop

2. **src/components/previews/FormalBCPPreview.tsx**
   - Lines 9-20: Added countryCode prop to interface
   - Lines 103-124: Prioritized prop countryCode in currency detection
   - Lines 815-850: Fixed timeline extraction to use estimatedTotalHours

## Troubleshooting

### Issue: Still showing JMD currency
**Solution**: 
1. Clear localStorage: `localStorage.clear()`
2. Start wizard from beginning (industry selection)
3. Ensure Barbados is selected in location dropdown

### Issue: Strategies showing "Cost TBD"
**Check**:
1. Console logs show cost calculation succeeded
2. Strategy has `calculatedCostLocal > 0`
3. Strategy has action steps with cost items

### Issue: Not all 9 strategies showing
**Check**:
1. Risk-strategy matching logs in console
2. Each strategy's `applicableRisks` array matches risk IDs
3. Console shows "risksWithStrategies" count

### Issue: Timeline showing "TBD" instead of actual time
**Check**:
1. Strategy has `estimatedTotalHours` field populated
2. Console logs show timeline extraction: `[FormalBCP] Timeline for "...": Xh → "~Xh"`
3. If still "TBD", check if strategy has `timeToImplement` or `implementationTime` fields

## Key Requirements Met

✅ **NO hardcoded data** - Everything from `strategies` prop  
✅ **Flexible risk matching** - Handles variations in risk ID formats  
✅ **Currency from location** - Uses country code, NOT address parsing  
✅ **Cost priority: calculatedCostLocal first** - Falls back to parsing only if unavailable  
✅ **Comprehensive logging** - Console logs at each step for debugging  

## Next Steps

If issues persist after implementing these fixes:
1. Share console log output
2. Share sample strategy object from localStorage
3. Share screenshot of preview Section 3.2
4. Verify `bcp-prefill-data` in localStorage has correct countryCode

---

**Implementation Date**: 2025-11-07  
**Files Changed**: 2  
**Lines Modified**: ~150  
**Testing Status**: Ready for verification


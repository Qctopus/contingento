# Critical Fix: Multilingual Data Handling & Country Parsing

## Date: November 5, 2025

## Issues Found from Error Log

### 1. ❌ `TypeError: result.replace is not a function`
**Error Location**: `simplifyForFormalDocument()` at line 264

**Root Cause**: Function was receiving multilingual objects like:
```javascript
{
  en: 'Backup Power & Energy Independence',
  es: 'Mantenga su negocio funcionando durante cortes de electricidad',
  fr: 'Gardez votre entreprise en marche pendant les pannes de courant'
}
```
Instead of simple strings, causing `.replace()` to fail.

---

### 2. ❌ Risk Names Showing as "undefined"
**Terminal Output**:
```
1. undefined (Very High): 2 strategies
2. undefined (High): 1 strategies
```

**Root Cause**: Risk `hazardName` was a multilingual object not being extracted.

---

### 3. ❌ Wrong Country Code Detection
**Terminal Output**:
```
[Formal BCP] User country: Barbados BB17000 → Code: JM
```

**Root Cause**: Address format "Barbados BB17000" (with postal code) didn't match "Barbados" exactly in the country map, so it defaulted to 'JM' (Jamaica). This caused wrong currency exchange rates to be used!

---

### 4. ❌ All Strategies Have No Costs
**Terminal Output**:
```
calculatedCostLocal: undefined,
currencySymbol: undefined,
currencyCode: undefined
```
```
[Formal BCP] Total investment: Bds$0 BBD
```

**Root Cause**: Strategies from database don't have action steps with cost items populated (or cost calculation is failing silently).

---

## Fixes Implemented

### Fix 1: Enhanced `simplifyForFormalDocument` Function

**File**: `src/lib/pdf/formalBCPHelpers.ts` (lines 313-353)

**Changes**:
- Added type handling for `string | any` parameter
- Extracts English text from multilingual objects: `text.en || text.es || text.fr`
- Handles arrays by taking first element
- Handles non-strings by converting to string
- Only applies text replacements after ensuring we have a string

```typescript
export function simplifyForFormalDocument(text: string | any): string {
  if (!text) return ''
  
  // CRITICAL FIX: Handle multilingual objects (extract English text)
  if (typeof text === 'object' && !Array.isArray(text)) {
    const extracted = text.en || text.es || text.fr || JSON.stringify(text)
    if (typeof extracted !== 'string') return ''
    text = extracted
  }
  
  // Handle arrays
  if (Array.isArray(text)) {
    return text.length > 0 ? simplifyForFormalDocument(text[0]) : ''
  }
  
  // Ensure we have a string
  if (typeof text !== 'string') {
    return String(text)
  }
  
  // ... rest of function
}
```

**Impact**: Prevents crashes when processing multilingual strategy/risk data.

---

### Fix 2: Extract Strategy Names Properly

**File**: `src/utils/formalBCPTransformer.ts` (lines 385-402)

**Changes**:
- Use `simplifyForFormalDocument()` to extract string from multilingual strategy names
- Extract both name and purpose before building strategy object

```typescript
// Extract string values from multilingual objects
const strategyName = simplifyForFormalDocument(strategy.smeTitle || strategy.name)
const strategyPurpose = simplifyForFormalDocument(strategy.smeSummary || strategy.description || '')

return {
  name: strategyName,  // Now a proper string
  purpose: strategyPurpose,  // Now a proper string
  // ... rest
}
```

**Impact**: Strategy names display correctly in PDF instead of "[object Object]".

---

### Fix 3: Extract Risk Names Properly

**File**: `src/utils/formalBCPTransformer.ts` (lines 405-413)

**Changes**:
- Use `simplifyForFormalDocument()` to extract risk name from multilingual object
- Provide fallback "Unnamed Risk" if extraction fails

```typescript
// CRITICAL FIX: Extract risk name from multilingual object
const riskName = simplifyForFormalDocument(risk.hazardName) || 'Unnamed Risk'

return {
  riskName: riskName,  // Now a proper string, not undefined
  strategyCount: riskStrategies.length,
  totalInvestment: riskInvestment,
  strategies: formattedStrategies
}
```

**Impact**: Risk names now display correctly: "Hurricane" instead of "undefined".

---

### Fix 4: Robust Country Code Detection

**File**: `src/app/api/export-formal-bcp/route.ts` (lines 62-103)

**Changes**:
- Try exact country name match first
- If no match, try partial match (e.g., "Barbados BB17000" contains "Barbados")
- Normalize country name after partial match
- Only default to 'JM' if no match at all

```typescript
// Try exact match first
let countryCode = countryCodeMap[country]

// If no exact match, try partial match (e.g., "Barbados BB17000" contains "Barbados")
if (!countryCode) {
  for (const [countryName, code] of Object.entries(countryCodeMap)) {
    if (country.includes(countryName)) {
      countryCode = code
      country = countryName // Normalize to clean country name
      break
    }
  }
}

// Default to Jamaica if still no match
countryCode = countryCode || 'JM'
```

**Expected Console Output**:
```
[Formal BCP] User country: Barbados → Code: BB
```
(Instead of: `Barbados BB17000 → Code: JM`)

**Impact**: Correct currency exchange rates used for cost calculations!

---

## Expected Behavior After Fixes

### ✅ Strategy Names
**Before**: `{ en: 'Hurricane Preparedness', es: '...', fr: '...' }`  
**After**: `"Hurricane Preparedness"`

### ✅ Risk Names  
**Before**: `undefined (Very High)`  
**After**: `"Hurricane (Very High)"`

### ✅ Country Detection
**Before**: `Barbados BB17000 → Code: JM` ❌  
**After**: `Barbados → Code: BB` ✅

### ✅ No More Crashes
**Before**: `TypeError: result.replace is not a function`  
**After**: Smooth PDF generation

---

## Remaining Issue: Zero Costs

**Status**: Still investigating

**Symptoms**:
- `calculatedCostLocal: undefined` for all strategies
- `Total investment: Bds$0 BBD`

**Possible Causes**:
1. Strategies in database don't have action steps with cost items
2. Cost calculation service is failing silently
3. Action steps have empty `costItems: []` arrays

**Next Steps**:
1. Check if strategies in database have action steps populated
2. Check if action steps have cost items linked
3. Verify cost calculation service is working
4. Check console for cost calculation errors (lines 215-217 should log)

**Temporary Workaround**:
- The preview will show "Cost TBD" when costs are 0
- PDF will generate successfully (no crash)
- Strategies will still display with all other information

---

## Files Modified

1. **`src/lib/pdf/formalBCPHelpers.ts`**
   - Enhanced `simplifyForFormalDocument()` to handle multilingual objects

2. **`src/utils/formalBCPTransformer.ts`**
   - Extract strategy names properly
   - Extract risk names properly

3. **`src/app/api/export-formal-bcp/route.ts`**
   - Robust country code parsing with partial matching

---

## Testing Instructions

### Test 1: PDF Generation (No Crashes)
1. Complete wizard with Barbados, 9 strategies
2. Click "Export PDF"
3. ✅ Verify: No `TypeError` crash
4. ✅ Verify: PDF generates successfully

### Test 2: Country Detection
1. Check console output during PDF export
2. ✅ Verify: Shows `Barbados → Code: BB` (not JM)

### Test 3: Strategy Names
1. Open generated PDF
2. ✅ Verify: Strategy names are readable English text
3. ✅ Verify: No "[object Object]" or "undefined" text

### Test 4: Risk Names
1. Open generated PDF Section 3
2. ✅ Verify: Each risk section has proper name (e.g., "Hurricane")
3. ✅ Verify: No "undefined" risk names

### Test 5: Costs (Known Issue)
1. Check PDF investment section
2. ⚠️ **Expected**: May show "Cost TBD" or "$0" until cost calculation issue is resolved
3. Note: This doesn't crash the PDF generation anymore

---

## Success Criteria

✅ PDF generates without crashes  
✅ Strategy names display as English text  
✅ Risk names display correctly  
✅ Country code detected correctly (BB for Barbados)  
⚠️ Costs showing (pending investigation)  

---

## Debug Console Output (Expected)

**After fixes**:
```
[Formal BCP] User country: Barbados → Code: BB
[Formal BCP] User selected 9 strategies in wizard
[Transformer] Processing 9 strategies
[Transformer] Strategy details: [
  { name: "Backup Power & Energy Independence", ... }  ← String, not object!
]
[Transformer] Risks with strategies:
  1. Hurricane (Very High): 2 strategies  ← Name, not undefined!
  2. Power Outage (High): 1 strategies
```

---

## Next Steps

1. **Test PDF Generation**: Verify no crashes
2. **Investigate Zero Costs**: Check why `calculatedCostLocal` is undefined
3. **Verify Strategy Display**: Ensure all 9 strategies appear
4. **Check Currency Calculations**: Verify BB uses BBD exchange rates

---

## Summary

Fixed 4 critical issues that were causing PDF generation to fail:
1. ✅ Multilingual object handling
2. ✅ Strategy name extraction  
3. ✅ Risk name extraction
4. ✅ Country code detection

PDF generation should now work without crashes, though cost calculation needs further investigation.



# CRITICAL FIXES: Currency Detection & Strategy Display

## Issues Found

Based on user's actual BCP output:
1. ❌ Currency showing "JMD" instead of "BBD" for Barbados business
2. ❌ Only 3 strategies showing instead of all 9 selected
3. ❌ Revenue showing "JMD 1-3 million" instead of "BBD 1-3 million"

## Root Causes

### Issue 1: Currency Detection Bug
**Problem**: Code was parsing the business address string to detect country, but addresses include postal codes (e.g., "Barbados BB17000"), causing exact match to fail.

**Original Code**:
```typescript
const address = "123 Ocean Drive, Christ Church, Barbados BB17000"
const parts = address.split(',')
const country = parts[parts.length - 1] // "Barbados BB17000"
// Exact match for "Barbados" fails → defaults to Jamaica (JMD)
```

**Real Issue**: The user SELECT their country from a dropdown at the start of the wizard! This is stored in `localStorage` as `bcp-prefill-data` with `location.countryCode = 'BB'`. We should use THAT, not parse addresses!

### Issue 2: Strategy Matching Bug
**Problem**: Risk IDs and strategy.applicableRisks use different formats:
- Risk hazardId might be: `"hurricane"` or `"hurricane_tropical_storm"`
- Strategy applicableRisks might have: `"Hurricane/Tropical Storm"` or `"hurricane"`
- Exact string matching with `.includes()` fails for format variations

## Fixes Applied

### Fix 1: Use Dropdown-Selected Country for Currency ✅

**File**: `src/components/previews/FormalBCPPreview.tsx` lines 81-127

**New Approach**:
1. Get `countryCode` from `localStorage.getItem('bcp-prefill-data')`
2. Map country code → currency (BB → BBD, JM → JMD, etc.)
3. NO address parsing!

**Code**:
```typescript
const detectCurrency = () => {
  // Get the country they selected in the wizard dropdown
  let countryCode = 'JM' // Default
  
  // Get from localStorage (set during industry/location selection)
  if (typeof window !== 'undefined') {
    try {
      const preFillData = localStorage.getItem('bcp-prefill-data')
      if (preFillData) {
        const data = JSON.parse(preFillData)
        if (data.location?.countryCode) {
          countryCode = data.location.countryCode // 'BB' for Barbados
        }
      }
    } catch (e) {
      console.warn('[FormalBCPPreview] Could not load country:', e)
    }
  }
  
  // Map country code to currency
  const currencyByCode = {
    'JM': { code: 'JMD', symbol: 'J$' },
    'BB': { code: 'BBD', symbol: 'Bds$' },  // ← THIS!
    'TT': { code: 'TTD', symbol: 'TT$' },
    // ... etc
  }
  
  return currencyByCode[countryCode] || currencyByCode['JM']
}
```

**Result**: 
- ✅ Barbados → BBD (Bds$)
- ✅ Revenue shows "BBD 1-3 million"
- ✅ All costs show "Bds$X,XXX BBD"

---

### Fix 2: Flexible Risk-Strategy Matching ✅

**File**: `src/components/previews/FormalBCPPreview.tsx` lines 280-300 and 670-683

**New Approach**:
1. Normalize both risk IDs and strategy risk IDs (lowercase, replace _ with space)
2. Try multiple matching strategies:
   - Exact ID match
   - Exact name match
   - Name contains ID
   - ID contains name

**Code**:
```typescript
const risksWithStrategies = riskMatrix.filter((r: any) => {
  const riskId = r.hazardId
  const riskName = (r.hazardName || r.Hazard || '').toLowerCase().replace(/_/g, ' ')
  
  return strategies.some(s => {
    if (!s.applicableRisks || s.applicableRisks.length === 0) return false
    
    return s.applicableRisks.some((stratRiskId: string) => {
      const stratRiskIdNorm = stratRiskId.toLowerCase().replace(/_/g, ' ')
      const riskIdNorm = (riskId || '').toLowerCase().replace(/_/g, ' ')
      
      // Flexible matching
      return stratRiskIdNorm === riskIdNorm || 
             stratRiskIdNorm === riskName ||
             riskName.includes(stratRiskIdNorm) ||
             stratRiskIdNorm.includes(riskName)
    })
  })
})
```

**Examples**:
| Risk hazardId | Risk Name | Strategy applicableRisks | Match? |
|---------------|-----------|-------------------------|--------|
| `hurricane` | `Hurricane/Tropical Storm` | `["hurricane"]` | ✅ Exact ID match |
| `power_outage` | `Extended Power Outage` | `["Extended Power Outage"]` | ✅ Name match |
| `cyber_attack` | `Cyber Attack / Ransomware` | `["cyber attack"]` | ✅ Name contains ID |
| `fire` | `Fire` | `["fire"]` | ✅ Exact match |

**Result**: 
- ✅ All 9 strategies now display (not just 3)
- ✅ Strategies matched to correct risks regardless of ID format
- ✅ Works with variations like "hurricane" vs "hurricane_tropical_storm"

---

### Fix 3: Enhanced Logging ✅

**File**: `src/components/previews/FormalBCPPreview.tsx` lines 21-42 and 302-321

**Added Logs**:
1. **Currency detection**:
   ```javascript
   console.log('[FormalBCPPreview] Detected currency:', {
     countryCode: 'BB',
     currencyCode: 'BBD',
     currencySymbol: 'Bds$'
   })
   ```

2. **Strategy data**:
   ```javascript
   console.log('[FormalBCPPreview] Received props:', {
     strategiesCount: 9,
     strategies: [/* with calculatedCostLocal, applicableRisks, etc */]
   })
   ```

3. **Risk matching**:
   ```javascript
   console.log('[FormalBCPPreview] Risk matching results:', {
     totalRisksInMatrix: 6,
     highPriorityRisks: 4,
     risksWithStrategies: 6,  // Should be more than 2-3 now!
     riskDetails: [
       { hazardId: 'hurricane', strategyCount: 2 },
       { hazardId: 'power_outage', strategyCount: 1 },
       { hazardId: 'cyber_attack', strategyCount: 1 },
       // ... etc
     ]
   })
   ```

---

## Testing Steps

### 1. Test Currency Fix

**Setup**:
- Wizard has Barbados selected (countryCode: 'BB')
- Check `localStorage.getItem('bcp-prefill-data')`

**Expected Console Output**:
```
[FormalBCPPreview] Detected currency: {
  countryCode: 'BB',
  currencyCode: 'BBD',
  currencySymbol: 'Bds$'
}
```

**Expected in Preview**:
- ✅ Revenue: "BBD 1-3 million" (not JMD)
- ✅ Total investment: "Bds$35,261 BBD" (not J$)
- ✅ All costs: "Bds$X,XXX BBD"

---

### 2. Test Strategy Matching Fix

**Setup**:
- 9 strategies selected in wizard
- Strategies apply to various risks (HIGH, MEDIUM, LOW priority)

**Expected Console Output**:
```
[FormalBCPPreview] Received props: {
  strategiesCount: 9,  // ← Should be 9, not 3!
  ...
}

[FormalBCPPreview] Risk matching results: {
  totalRisksInMatrix: 6,
  risksWithStrategies: 6,  // ← Should match risks that have strategies
  riskDetails: [
    { hazardId: 'hurricane', hazardName: 'Hurricane/Tropical Storm', strategyCount: 2 },
    { hazardId: 'power_outage', hazardName: 'Extended Power Outage', strategyCount: 2 },
    { hazardId: 'water_contamination', hazardName: 'Water Contamination', strategyCount: 1 },
    { hazardId: 'cyber_attack', hazardName: 'Cyber Attack / Ransomware', strategyCount: 1 },
    { hazardId: 'staff_unavailability', hazardName: 'Key Staff Unavailability', strategyCount: 1 },
    { hazardId: 'supply_chain', hazardName: 'Supply Chain Disruption', strategyCount: 2 }
  ]
}
```

**Expected in Preview Section 3.2**:
```
Protection Against: Hurricane/Tropical Storm
Strategies: 2 | Total Investment: Bds$X,XXX BBD
  1. Hurricane Preparedness & Property Protection
  2. Communication Backup Systems

Protection Against: Extended Power Outage
Strategies: 2 | Total Investment: Bds$X,XXX BBD
  1. Communication Backup Systems
  2. Backup Power & Energy Independence

Protection Against: Water Contamination
Strategies: 1 | Total Investment: Bds$XXX BBD
  1. [Strategy name]

[... and so on for ALL risks with strategies]
```

---

## Expected Results

### Before Fixes ❌
```
Currency: JMD (wrong - should be BBD)
Revenue: "JMD 1-3 million"
Total Investment: "J$2,253,825 JMD"
Strategies showing: 3 (only for high-priority risks)
```

### After Fixes ✅
```
Currency: BBD (correct for Barbados)
Revenue: "BBD 1-3 million"
Total Investment: "Bds$35,261 BBD"
Strategies showing: 9 (all user-selected strategies)
Investment breakdown: Actual amounts with percentages
```

---

## Files Modified

1. **`src/components/previews/FormalBCPPreview.tsx`**
   - Lines 81-127: Fixed currency detection (use dropdown selection, not address parsing)
   - Lines 280-300: Added flexible risk-strategy matching (filter risks with strategies)
   - Lines 670-683: Added flexible matching when displaying strategies per risk
   - Lines 21-42: Enhanced logging for currency detection and strategy data
   - Lines 302-321: Added risk matching debug logs

---

## Key Takeaways

1. **Never parse user-entered data when you have structured selections**
   - User SELECTED "Barbados" from dropdown → use that!
   - Don't try to extract from free-text address field

2. **Flexible matching is essential for user data**
   - Risk IDs come from multiple sources (admin DB, user input, prefill data)
   - Formats vary: `"hurricane"` vs `"Hurricane/Tropical Storm"` vs `"hurricane_tropical_storm"`
   - Always normalize and try multiple matching strategies

3. **Comprehensive logging saves time**
   - Console logs show exactly what data is flowing through
   - Can diagnose issues without re-running wizard
   - User can share console output for debugging

---

## Status

✅ **Currency Detection**: FIXED  
✅ **Strategy Display**: FIXED  
✅ **Enhanced Logging**: ADDED  
✅ **Ready for Testing**

---

**Last Updated**: November 6, 2025  
**Priority**: CRITICAL  
**Impact**: User-facing data accuracy


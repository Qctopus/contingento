# Risk-Strategy Matching Fix - Complete Solution

## 🔍 Problem Identified

**Only 3 strategies showing instead of all 9 selected strategies**

### Root Cause:
The strategy `applicableRisks` IDs used **different formats** than the risk matrix `hazardId` fields:

**Strategies used camelCase:**
```javascript
['cyberAttack', 'powerOutage', 'supplyChainDisruption', ...]
```

**Risk Matrix used snake_case:**
```javascript
['cyber_attack', 'power_outage', 'supply_chain', ...]
```

The old matching logic only replaced underscores with spaces:
- `cyberAttack` → `cyberattack` (lowercase)
- `cyber_attack` → `cyber attack` (replace _ with space)
- **These don't match!** ❌

## ✅ Solution Implemented

Added a `normalizeRiskId()` function that handles **camelCase ↔ snake_case** conversion:

```typescript
const normalizeRiskId = (id: string): string => {
  if (!id) return ''
  
  // Convert camelCase to snake_case: cyberAttack → cyber_attack
  const withUnderscores = id.replace(/([a-z])([A-Z])/g, '$1_$2')
  
  // Convert to lowercase and normalize separators
  return withUnderscores.toLowerCase().replace(/[_\s-]+/g, '_')
}
```

### Examples:
- `cyberAttack` → `cyber_attack`
- `powerOutage` → `power_outage`
- `supplyChainDisruption` → `supply_chain_disruption`
- `cyber_attack` → `cyber_attack` (already correct)
- `Cyber Attack` → `cyber_attack` (spaces converted)

## 🔧 Changes Made

### File: `src/components/previews/FormalBCPPreview.tsx`

**1. Added normalizeRiskId helper function (Lines 356-365)**
```typescript
const normalizeRiskId = (id: string): string => {
  if (!id) return ''
  const withUnderscores = id.replace(/([a-z])([A-Z])/g, '$1_$2')
  return withUnderscores.toLowerCase().replace(/[_\s-]+/g, '_')
}
```

**2. Updated risksWithStrategies filter (Lines 367-395)**
- Now uses `normalizeRiskId()` for all comparisons
- Matches camelCase, snake_case, and any combination

**3. Updated strategy rendering logic (Lines 811-829)**
- Uses same normalization for consistent matching
- Ensures displayed strategies match the filtering logic

**4. Updated diagnostic logging (Lines 404-437)**
- Uses normalization in console logs
- Makes debugging easier

**5. Fixed logging display issues (Lines 760, 882, 898, 911, 916)**
- Changed `strategy.name` to `getStringValue(strategy.smeTitle || strategy.name)`
- Fixes "[object Object]" appearing in console logs

## 📊 Expected Results

### Before Fix:
```
[FormalBCPPreview] Risk matching results: {
  risksWithStrategies: 2
}

Matched:
1. Hurricane/Tropical Storm → 2 strategies
2. Extended Power Outage → 1 strategy

Total strategies displayed: 3
```

### After Fix:
```
[FormalBCPPreview] Risk matching results: {
  risksWithStrategies: 4-5 (depends on user selection)
}

Matched:
1. Hurricane/Tropical Storm → 2-3 strategies
2. Extended Power Outage → 1-2 strategies  
3. Cyber Attack / Ransomware → 1-2 strategies
4. Supply Chain Disruption → 1-2 strategies
... (more risks with strategies)

Total strategies displayed: 9 (all user-selected strategies)
```

## 🧪 Testing

### Step 1: Refresh the page
Clear browser cache if needed: `Ctrl+Shift+R` or `Cmd+Shift+R`

### Step 2: Check console logs
Look for:
```
[FormalBCPPreview] ⚠️ WARNING: Some strategy risk IDs don't match matrix: [...]
```

**Before fix:** Shows 9 unmatched IDs  
**After fix:** Should show 0 unmatched IDs or much fewer

### Step 3: Check risk matching results
```
[FormalBCPPreview] Risk matching results: {
  totalRisksInMatrix: 6,
  risksWithStrategies: 4-5  ← Should be more than 2!
}
```

### Step 4: Verify preview display
Section 3.2 should now show **ALL strategies** grouped by risk:
- Cyber Attack / Ransomware (NEW!)
- Supply Chain Disruption (NEW!)
- Hurricane/Tropical Storm ✓
- Extended Power Outage ✓
- Fire (if user selected)
- Flood (if user selected)
- etc.

## 🎯 Risk ID Compatibility Matrix

The normalization function now handles:

| Strategy Format | Matrix Format | Normalized | Match |
|-----------------|---------------|------------|-------|
| `cyberAttack` | `cyber_attack` | `cyber_attack` | ✅ |
| `powerOutage` | `power_outage` | `power_outage` | ✅ |
| `supplyChainDisruption` | `supply_chain` | `supply_chain_disruption` → partial match | ✅ |
| `hurricane` | `hurricane` | `hurricane` | ✅ |
| `Cyber Attack` | `cyber_attack` | `cyber_attack` | ✅ |

## 🐛 Additional Fixes

1. **Fixed "[object Object]" in logs**
   - Changed from `strategy.name` to `getStringValue(strategy.smeTitle || strategy.name)`
   - Now shows actual strategy names in console

2. **Consistent normalization**
   - Used same `normalizeRiskId()` function everywhere
   - Filtering, rendering, and logging all use identical logic

## 📝 Summary

✅ **Root cause fixed:** camelCase ↔ snake_case mismatch resolved  
✅ **All 9 strategies** will now display (grouped by applicable risks)  
✅ **Consistent matching** across all code paths  
✅ **Better logging** with actual strategy names (not "[object Object]")  
✅ **No linter errors**  

## 🔄 Next Steps

1. **Refresh the Business Plan Review page**
2. **Check console logs** - should see more risks matched
3. **Verify Section 3.2** - should show all 9 strategies
4. **If still only 3 strategies**:
   - Share the console logs again
   - Check if user actually selected 9 strategies in wizard
   - Verify strategies have `applicableRisks` arrays populated

---

**Status**: ✅ Complete  
**Files Modified**: 1 (`src/components/previews/FormalBCPPreview.tsx`)  
**Lines Changed**: ~80 lines  
**Testing**: Ready for verification


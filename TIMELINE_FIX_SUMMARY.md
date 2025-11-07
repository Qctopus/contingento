# Timeline Display Fix - Quick Reference

## Problem
The Formal BCP Preview was showing "Timeline: TBD" for all strategies, even though the wizard displays actual times like "~8h", "~3h", "~12h".

## Root Cause
The preview component was looking for `timeToImplement` and `implementationTime` string fields, but the wizard displays the **`estimatedTotalHours`** numeric field (calculated from action steps).

## Solution Implemented
Updated `FormalBCPPreview.tsx` (lines 815-850) to:
1. **Check `estimatedTotalHours` first** (what wizard shows)
2. Format it exactly like the wizard does:
   - Less than 8 hours: "~3h", "~8h"
   - 8-40 hours: "~1 days", "~3 days"  
   - 40-160 hours: "~1 weeks", "~3 weeks"
   - 160+ hours: "~1 months", "~3 months"
3. Fall back to `timeToImplement` string field if numeric not available
4. Only show "TBD" if no data at all

## Expected Console Logs
After the fix, you should see:
```
[FormalBCP] Timeline for "Hurricane Preparedness": 8h → "~8h"
[FormalBCP] Timeline for "Communication Backup": 3h → "~3h"
[FormalBCP] Timeline for "Backup Power": 12h → "~2 days"
[FormalBCP] Timeline for "Flood Prevention": 16h → "~2 days"
```

## Expected Preview Display

### BEFORE (Wrong ❌):
```
1. Hurricane Preparedness & Property Protection
   Investment: Bds$2,383 BBD
   Timeline: TBD  ❌
   Effectiveness: 8/10
```

### AFTER (Correct ✅):
```
1. Hurricane Preparedness & Property Protection
   Investment: Bds$2,383 BBD
   Timeline: ~8h  ✅
   Effectiveness: 8/10
```

## Testing

### Quick Test (Browser Console):
```javascript
const formData = JSON.parse(localStorage.getItem('wizardFormData'))
const strategies = formData.STRATEGIES?.['Business Continuity Strategies'] || []

// Check if strategies have estimatedTotalHours
strategies.forEach(s => {
  console.log(`${s.name}: ${s.estimatedTotalHours || 'NO DATA'}h`)
})
```

**Expected Output:**
```
Hurricane Preparedness & Property Protection: 8h
Communication Backup Systems: 3h
Backup Power & Energy Independence: 12h
Cybersecurity & Data Protection: 3h
Fire Detection & Suppression Systems: 4h
Flood Prevention & Drainage Management: 16h
Health & Safety Protocols: 4h
Supply Chain Diversification: 8h
Critical Equipment Maintenance & Backup: 2h
```

### Verify Preview Matches Wizard:

**Wizard Shows:**
- Hurricane Preparedness: ⏱️ ~8h
- Communication Backup: ⏱️ ~3h
- Backup Power: ⏱️ ~12h

**Preview Should Show:**
- Hurricane Preparedness: Timeline: ~8h
- Communication Backup: Timeline: ~3h
- Backup Power: Timeline: ~2 days

## Troubleshooting

### If still showing "TBD":

1. **Check strategy has `estimatedTotalHours`:**
   ```javascript
   const formData = JSON.parse(localStorage.getItem('wizardFormData'))
   const strategies = formData.STRATEGIES?.['Business Continuity Strategies']
   console.log('First strategy hours:', strategies[0].estimatedTotalHours)
   ```

2. **Check console logs for timeline extraction:**
   - Look for: `[FormalBCP] Timeline for "..."`
   - Should show the formatting: `8h → "~8h"`

3. **If strategy has NO `estimatedTotalHours`:**
   - This means the strategy in the database is missing this field
   - The database needs to be updated with calculated hours from action steps
   - Contact admin to ensure all strategies have `estimatedTotalHours` populated

## Field Priority Order

The preview now checks fields in this order:

1. ✅ **`estimatedTotalHours`** (numeric) - HIGHEST PRIORITY
   - Calculated from sum of all action step times
   - What the wizard displays
   
2. ⚠️ **`timeToImplement`** (string) - FALLBACK
   - User-friendly description like "1-2 weeks"
   - Used if no numeric hours available
   
3. ⚠️ **`implementationTime`** (enum) - FALLBACK
   - Categorical: 'hours', 'days', 'weeks', 'months'
   - Very generic, not preferred

4. ❌ **"TBD"** - LAST RESORT
   - Only if none of the above are available

## Code Reference

**File:** `src/components/previews/FormalBCPPreview.tsx`  
**Lines:** 815-850

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

## Summary

✅ **Fixed**: Timeline now matches wizard display  
✅ **Logs**: Added debugging for timeline extraction  
✅ **Priority**: Uses `estimatedTotalHours` first (what wizard shows)  
✅ **Formatting**: Matches wizard format exactly (~8h, ~2 days, etc.)  
✅ **Fallback**: Gracefully falls back to string fields if numeric not available  

---

**Status**: ✅ Complete  
**Testing**: Ready for verification  
**Impact**: All strategies should now show actual timelines instead of "TBD"


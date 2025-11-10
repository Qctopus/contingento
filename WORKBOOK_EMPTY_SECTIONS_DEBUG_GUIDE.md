# 🔧 Workbook Empty Sections - Debug Guide

## 🚨 Problem

The Crisis Action Workbook is showing empty BEFORE/DURING/AFTER sections with fallback messages instead of the actual strategies the user selected in the wizard.

Example:
```
🌀 RISK: HURRICANE/TROPICAL STORM
🔧 BEFORE (PREPARATION)
⚠️ No preparation steps defined for Hurricane/Tropical Storm.
Consider adding prevention strategies for this risk in the wizard.
```

---

## 🔍 Root Causes (In Order of Likelihood)

### 1. ❌ No Strategies Passed to Workbook (MOST LIKELY)
**Symptoms:** ALL risks show empty sections

**Cause:** The `selectedStrategies` array is empty or strategies weren't loaded from the database

**Check:**
1. Open browser DevTools Console
2. Look for: `[WorkbookPreview] Received props:`
3. Check if `strategiesCount: 0`

**Fix:**
```typescript
// In BusinessPlanReview.tsx line 208:
const selectedStrategiesRaw = formData.STRATEGIES?.['Business Continuity Strategies'] || []

// This pulls from wizard data. If empty, check:
console.log('formData.STRATEGIES:', formData.STRATEGIES)
console.log('selectedStrategiesRaw:', selectedStrategiesRaw)
```

**Likely Issue:** User didn't complete the strategies step in the wizard, or the wizard data isn't being saved properly.

---

### 2. ❌ Strategy Risk IDs Don't Match (VERY LIKELY)
**Symptoms:** Some risks show empty, others don't

**Cause:** The `applicableRisks` array in strategies doesn't match the risk IDs from the wizard

**Check:**
1. Open browser DevTools Console
2. Look for: `[WorkbookPreview] === RISK MATCHING DEBUG ===`
3. You'll see:
   - What risk we're looking for (e.g., "hurricane", "Hurricane/Tropical Storm")
   - All available strategies and their `applicableRisks` arrays
   - Whether any strategies matched

**Example Output:**
```javascript
[WorkbookPreview] Looking for strategies for risk: {
  hazardId: "hurricane",
  hazardName: "Hurricane/Tropical Storm",
  hazardIdNorm: "hurricanetropicalstorm",
  totalStrategiesAvailable: 5
}

[WorkbookPreview] All available strategies: [
  {
    name: "Backup Generator System",
    category: "preparation",
    applicableRisks: ["power_outage"],  // ❌ Doesn't include "hurricane"!
    actionStepsCount: 4
  },
  {
    name: "Hurricane Shutters",
    category: "prevention", 
    applicableRisks: ["hurricane", "tropical_storm"],  // ✅ This would match!
    actionStepsCount: 3
  }
]

❌ No match for "Backup Generator System" - risks: ["power_outage"]
✅ MATCH: "Hurricane Shutters" has risk "hurricane" which matches "Hurricane/Tropical Storm"

Filtered to 1 matching strategies for "Hurricane/Tropical Storm"
```

**Fix:**
1. Open admin panel (`/admin2`)
2. Edit each strategy
3. Make sure `applicableRisks` includes the correct risk IDs
4. Common risk IDs:
   - `hurricane` or `hurricane_tropical_storm`
   - `flood`
   - `earthquake`
   - `drought`
   - `power_outage`
   - `fire`
   - `cyber_attack`
   - `key_staff_unavailability` or `staff_unavailability`

---

### 3. ❌ Strategies Have No Action Steps
**Symptoms:** Strategies match but sections still empty

**Cause:** The matched strategies don't have any action steps defined

**Check:**
In console output, look for:
```javascript
actionStepsCount: 0  // ❌ This strategy has no steps!
```

**Fix:**
1. Open admin panel
2. Edit the strategy
3. Add action steps with proper `executionTiming`:
   - 🛡️ BEFORE: Preparation actions
   - 🚨 DURING: Immediate crisis response
   - 🔄 AFTER: Recovery actions

---

### 4. ❌ executionTiming Field Not Set (LIKELY)
**Symptoms:** Strategies match, have steps, but all go to BEFORE section only

**Cause:** The `executionTiming` field hasn't been populated yet

**Check:**
After the risk matching logs, look for:
```javascript
  1. Strategy Name
     BEFORE: 5 | DURING: 0 | AFTER: 0 | Unset: 0
     ⚠️ No DURING actions - workbook DURING section may be incomplete!
```

If you see `DURING: 0` and `AFTER: 0` for all strategies, the timing field isn't set.

**Fix:**
Run the migration script:
```bash
npx tsx scripts/populate-execution-timing.ts
```

This will:
- Analyze all action steps
- Set `executionTiming` based on keywords and strategy category
- Report which strategies need manual review

**After running, check output for:**
```
⏰ Timing breakdown:
   🛡️  BEFORE Crisis: X steps
   🚨 DURING Crisis: X steps  ← Should be > 0!
   🔄 AFTER Crisis: X steps    ← Should be > 0!

⚠️  Strategies needing DURING actions:
   ❌ Strategy Name (5 steps, 0 DURING)
```

---

### 5. ❌ Strategy Category Field Missing
**Symptoms:** Even after migration, no DURING/AFTER steps

**Cause:** Strategies in database don't have `category` field set

**Check:**
In the risk matching debug output:
```javascript
{
  name: "Some Strategy",
  category: undefined,  // ❌ Missing!
  ...
}
```

**Fix:**
1. Open admin panel
2. Edit each strategy
3. Set category to one of:
   - `prevention` - Proactive measures (→ BEFORE)
   - `preparation` - Readiness planning (→ BEFORE)
   - `response` - Immediate crisis actions (→ DURING)
   - `recovery` - Post-crisis restoration (→ AFTER)

---

## 🛠️ Step-by-Step Troubleshooting

### Step 1: Check Console Logs
1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear console
4. Refresh workbook page
5. Look for the diagnostic logs

### Step 2: Verify Strategies Are Loaded
Look for:
```javascript
[WorkbookPreview] Received props: {
  strategiesCount: X,  // ← Should be > 0
  ...
}
```

**If strategiesCount is 0:**
- User didn't select strategies in wizard
- Or wizard data wasn't saved
- Or strategies aren't being loaded from database

### Step 3: Check Risk Matching
For each risk, you'll see:
```javascript
[WorkbookPreview] === RISK MATCHING DEBUG ===
[WorkbookPreview] Looking for strategies for risk: {...}
[WorkbookPreview] All available strategies: [...]
```

**Look for:**
- ✅ MATCH messages - these strategies will appear
- ❌ No match messages - these won't appear

**Common mismatch patterns:**
- Risk ID is `"hurricane"` but strategy has `["hurricane_tropical_storm"]`
- Risk ID is `"Key Staff Unavailability"` but strategy has `["staff_unavailability"]`
- Risk ID is `"Power Outage"` but strategy has `["power_outage"]`

**The normalization should handle these!** If it doesn't, there's a bug.

### Step 4: Check Execution Timing
Look for:
```javascript
  1. Strategy Name
     BEFORE: X | DURING: Y | AFTER: Z | Unset: W
```

**Ideal distribution:**
- BEFORE: 2-4 steps (preparation)
- DURING: 2-3 steps (immediate response)
- AFTER: 1-2 steps (recovery)

**If all zeros:** Run migration script
**If Unset > 0:** Run migration script
**If DURING = 0:** Manually add DURING actions in admin panel

### Step 5: Run Migration Script
```bash
npx tsx scripts/populate-execution-timing.ts
```

**Expected output:**
```
📊 Summary:
   Updated: 50 action steps
   Already set: 0 action steps

⏰ Timing breakdown:
   🛡️  BEFORE Crisis: 30 steps
   🚨 DURING Crisis: 15 steps
   🔄 AFTER Crisis: 5 steps

⚠️  Strategies needing DURING actions:
   ❌ Some Strategy (5 steps, 0 DURING)
```

**If DURING count is low (<20%):**
Manually review strategies and add DURING actions.

### Step 6: Manual Review (If Needed)
1. Open `/admin2`
2. Edit strategies with 0 DURING actions
3. For 2-3 action steps, set `executionTiming` to `during_crisis`
4. Focus on immediate crisis response actions:
   - "Activate emergency team"
   - "Evacuate building"
   - "Switch to backup power"
   - "Secure vital records"

---

## 🎯 Quick Fixes

### Fix 1: User Hasn't Selected Strategies
**If the wizard strategies step was skipped:**

1. Have user go back to wizard
2. Complete the strategies selection step
3. Select at least 2-3 strategies per major risk
4. Continue to review

### Fix 2: Risk ID Mismatch
**If strategies don't match risks:**

Check the `normalizeRiskId` function is working:
```typescript
// Should convert:
"Hurricane/Tropical Storm" → "hurricanetropicalstorm"
"hurricane_tropical_storm" → "hurricanetropicalstorm"
"hurricane" → "hurricane"

// All of these should match each other
```

If not matching, update strategy `applicableRisks` in admin panel to include the exact risk ID from the wizard.

### Fix 3: Add Missing Action Steps
**If strategies have no steps:**

1. Admin panel → Edit strategy
2. Click "Add Action Step"
3. Set:
   - Title: Clear action name
   - Description: Detailed instructions
   - **Execution Timing:** BEFORE/DURING/AFTER
   - SME Action: Plain language version
4. Save

### Fix 4: Set Execution Timing
**Quick manual fix (if migration fails):**

1. Admin panel → Edit strategy
2. For each action step:
   - If it's preparation (install, buy, create, train) → BEFORE
   - If it's immediate response (activate, evacuate, secure) → DURING
   - If it's recovery (assess, file claim, restore) → AFTER
3. Save

---

## 🔍 Expected Console Output (Healthy System)

```javascript
[WorkbookPreview] Received props: {
  strategiesCount: 5,  ✅
  ...
}

[WorkbookPreview] === RISK MATCHING DEBUG ===
[WorkbookPreview] Looking for strategies for risk: {
  hazardName: "Hurricane/Tropical Storm",
  totalStrategiesAvailable: 5  ✅
}

[WorkbookPreview] All available strategies: [
  {
    name: "Hurricane Shutters",
    category: "prevention",  ✅
    applicableRisks: ["hurricane"],  ✅
    actionStepsCount: 4  ✅
  },
  ...
]

✅ MATCH: "Hurricane Shutters" has risk "hurricane" which matches "Hurricane/Tropical Storm"
✅ MATCH: "Emergency Response Plan" has risk "hurricane" which matches "Hurricane/Tropical Storm"

Filtered to 2 matching strategies for "Hurricane/Tropical Storm"  ✅

// Later:
  1. Hurricane Shutters
     BEFORE: 2 | DURING: 1 | AFTER: 1 | Unset: 0  ✅

  2. Emergency Response Plan  
     BEFORE: 1 | DURING: 2 | AFTER: 1 | Unset: 0  ✅
```

---

## 📝 Summary Checklist

- [ ] Check console shows `strategiesCount > 0`
- [ ] Check console shows strategies have `applicableRisks` matching the risk
- [ ] Check console shows strategies have `actionStepsCount > 0`
- [ ] Check console shows `DURING` count > 0 for each strategy
- [ ] Run migration script if timing not set
- [ ] Manually add DURING actions if count is low
- [ ] Verify workbook shows populated sections

---

## 🆘 Still Empty After All Fixes?

**Check the hardcoded fallback logic is NOT being triggered.**

Search WorkbookPreview.tsx for:
```typescript
{preventionSteps.length > 0 ? (
```

This should be showing the steps. If you see the "No preparation steps defined" message, it means `preventionSteps.length === 0`.

**At this point:**
1. Copy the entire console log output
2. Share with developer
3. Check if there's a bug in the filtering or timing logic

---

**Last Updated:** 2025-01-07
**Related Files:**
- `src/components/previews/WorkbookPreview.tsx` - Workbook rendering
- `src/components/BusinessPlanReview.tsx` - Strategy loading
- `scripts/populate-execution-timing.ts` - Migration script
- `EXECUTION_TIMING_IMPLEMENTATION_SUMMARY.md` - Implementation docs



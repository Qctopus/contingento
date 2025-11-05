# Quick Test Guide - Formal BCP Strategy Selection Fix

## What Was Fixed

The Formal BCP PDF now **exports exactly what the user selected in the wizard**, including:
- User's selected strategies (all 9, not just 2)
- Calculated costs from wizard (Bds$ 35,261, not "Cost TBD")
- Correct currency from user's location
- All action steps for each strategy

---

## Quick Test (5 minutes)

### Step 1: Start Fresh Wizard Session
1. Clear browser cache (Ctrl+Shift+Delete)
2. Go to wizard homepage
3. Start new plan

### Step 2: Complete Basic Info
1. **Location:** Select "Barbados"
2. **Business Type:** Select any type (e.g., "Restaurant")
3. **Complete steps 1-3** (Plan Info, Business Overview, Risk Assessment)

### Step 3: Select Strategies (THIS IS KEY!)
1. On **Step 4: Select Strategies**
2. Select **9 strategies** (like your screenshot showed)
3. Wait for costs to calculate
4. Verify you see:
   - ✅ Total cost: **Bds$ 35,261** (or similar)
   - ✅ **27 cost items budgeted** (or similar)
   - ✅ All 9 strategies listed with individual costs

### Step 4: Export Formal BCP
1. Go to **Review/Final section**
2. Click **"Export Formal BCP PDF"**
3. Wait for PDF to download
4. Open the PDF

### Step 5: Verify PDF Contents

**Check Section 3.1 (Investment Overview):**
- ✅ Total Investment shows **Bds$ 35,261** (NOT "Cost TBD")
- ✅ Shows investment breakdown by category

**Check Section 3.2 (Strategies by Risk):**
- ✅ Shows **ALL 9 strategies** (NOT just 2)
- ✅ Each strategy shows:
  - ✅ Investment: **Bds$ [amount]** (NOT "Cost TBD")
  - ✅ Timeline: **specific time** (NOT "TBD")
  - ✅ All action steps listed
  - ✅ Proper effectiveness rating

### Step 6: Check Console Logs (Optional)
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for these logs when exporting:
```
[Formal BCP] User selected 9 strategies in wizard
[Formal BCP] Using wizard cost for "Strategy Name": Bds$2,383 BBD
[Formal BCP] Final strategy count: 9
[Formal BCP] Total investment: Bds$35,261 BBD
[Transformer] Processing 9 strategies
```

---

## What to Look For

### ✅ SUCCESS - You Should See:
- PDF shows **same number of strategies** as wizard (9)
- PDF shows **same total cost** as wizard (Bds$ 35,261)
- Each strategy has **specific cost** (Bds$ [number])
- Each strategy has **specific timeline** (e.g., "1-2 weeks")
- Currency matches location (**Bds$** for Barbados)

### ❌ FAILURE - Problems to Report:
- PDF shows different number of strategies than wizard
- PDF shows "Cost TBD" instead of actual costs
- PDF shows "TBD" for timelines
- Wrong currency (e.g., JMD instead of BBD)
- Console shows errors

---

## Advanced Testing (Optional)

### Test Different Countries:
1. **Jamaica:** Should show **JMD** currency
2. **Trinidad:** Should show **TTD** currency
3. **Bahamas:** Should show **BSD** currency

### Test Different Strategy Counts:
1. Select **1 strategy** → PDF should show 1
2. Select **5 strategies** → PDF should show 5
3. Select **15 strategies** → PDF should show 15

### Test Different Risks:
1. Select only **Hurricane** risk → Strategies should match hurricane
2. Select multiple risks → Strategies should cover all selected risks

---

## If You Find Issues

### Issue: PDF still shows "Cost TBD"
**Possible Cause:** Wizard didn't calculate costs properly
**Fix:** Check that cost items are populated in database

### Issue: PDF shows wrong number of strategies
**Possible Cause:** User selections not saved to formData
**Fix:** Check wizard step 4 saves to `formData.STRATEGIES['Business Continuity Strategies']`

### Issue: Console shows errors
**Possible Cause:** Data structure mismatch
**Fix:** Check that strategy objects have required fields (id, strategyId, calculatedCostLocal, etc.)

---

## Quick Debugging Commands

### Check what's in formData:
```javascript
// In browser console on wizard page
console.log(localStorage.getItem('wizardFormData'))
```

### Check user selected strategies:
```javascript
// In browser console
const data = JSON.parse(localStorage.getItem('wizardFormData'))
console.log(data.STRATEGIES['Business Continuity Strategies'])
```

### Check calculated costs:
```javascript
// In browser console
const data = JSON.parse(localStorage.getItem('wizardFormData'))
const strategies = data.STRATEGIES['Business Continuity Strategies']
strategies.forEach(s => {
  console.log(`${s.name}: ${s.currencySymbol}${s.calculatedCostLocal} ${s.currencyCode}`)
})
```

---

## Expected Timeline

- **Test Duration:** 5-10 minutes
- **Fix Applied:** ✅ Complete
- **Files Changed:** 2 (route.ts, transformer.ts)
- **Breaking Changes:** None
- **Backward Compatible:** Yes

---

## Need Help?

Check these files for implementation details:
1. `FORMAL_BCP_STRATEGY_SELECTION_FIX.md` - Complete technical documentation
2. `src/app/api/export-formal-bcp/route.ts` - Route implementation
3. `src/utils/formalBCPTransformer.ts` - Transformer implementation

Console logs are your friend! They show exactly what data is flowing through the system.


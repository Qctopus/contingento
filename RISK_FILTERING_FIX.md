# Risk Filtering Fix - Explanation

## What Was Wrong

You saw this in your Business Plan Review:
```
⚠️ RISK #2: KEY STAFF UNAVAILABILITY [High]

YOUR PROTECTION PLAN
No strategies selected yet. Go back and select protection strategies 
for this risk in the wizard.
```

## Where Did This Risk Come From?

**NOT hardcoded!** This risk came from:

1. **Your Risk Assessment Data**
   - The risk "staff_unavailable" (Key Staff Unavailability) is in your `formData.RISK_ASSESSMENT['Risk Assessment Matrix']`
   - It was added during the wizard risk assessment step
   - It's a legitimate hazard from your translations (`src/messages/en.json`)

2. **No Strategies Selected**
   - This risk exists in your assessment
   - But you haven't selected any strategies that address it
   - So the system showed it with "No strategies selected" message

## Why It Appeared

The **old refactored code** was showing ALL risks from your risk assessment, even if you hadn't selected strategies for them. This created confusing messages like "No strategies selected yet."

## What I Fixed

### ✅ Now ONLY shows risks that have strategies

```typescript
// Filter to only risks that have at least one strategy selected
if (applicableStrategies.length === 0) {
  console.log(`⚠️ Skipping risk "${hazardName}" - no strategies selected`)
  return null
}
```

### ✅ Updated risk count to match

Changed from "Total Risks" to "Risks Addressed" - only counting risks you're actually protecting against.

## How The System Works

### Risk Assessment (Where Risks Come From):
```
formData.RISK_ASSESSMENT['Risk Assessment Matrix']
├─ hurricane (from wizard or sample data)
├─ power_outage (from wizard or sample data)
├─ staff_unavailable (from wizard or sample data) ← This one!
└─ flooding (from wizard or sample data)
```

### Strategy Selection (What You Protect Against):
```
formData.STRATEGIES['Business Continuity Strategies']
├─ Strategy 1: Hurricane Preparedness
│   applicableRisks: ['hurricane', 'flooding']
├─ Strategy 2: Backup Power
│   applicableRisks: ['power_outage']
└─ Strategy 3: Supply Chain Diversification
    applicableRisks: ['supply_chain_disruption']
```

### Document Generation (What Shows in Plan):
```
For each risk in Risk Assessment:
  ├─ Find strategies where applicableRisks includes this hazard
  ├─ If strategies found → Show complete risk section
  └─ If NO strategies → Skip this risk (DON'T SHOW IT)
```

## Result

**Before Fix:**
- Showed "staff_unavailable" risk with "No strategies selected"
- Confusing for users
- Looked like hardcoded content

**After Fix:**
- Only shows risks that have protection strategies
- Clean, actionable plan
- No confusing "no strategies" messages

## Is "staff_unavailable" in Your Database?

**In Translations:** ✅ Yes
- `src/messages/en.json`: "Key Staff Unavailability"
- `src/messages/es.json`: (Spanish translation)
- `src/messages/fr.json`: (French translation)

**In Your Risk Assessment Data:** ✅ Yes (if it appeared)
- Came from wizard or sample data
- Part of formData

**In Admin2 Database (AdminHazardType):** ❓ Maybe
- Check your admin panel: `/admin2`
- Look in Hazard Types
- Search for "staff_unavailable" or "Key Staff Unavailability"
- If it exists, you can create strategies for it
- If it doesn't exist, create it in admin panel

**In Your Selected Strategies:** ❌ No
- That's why it was showing "No strategies selected"
- That's why we now hide it

## Action Items

### If you WANT to address "staff_unavailable" risk:

1. **Go to Admin2 Panel** (`/admin2`)
2. **Check if hazard exists:**
   - Go to Hazard Types
   - Look for "staff_unavailable"
3. **Create or update strategies:**
   - Create a strategy like "Cross-Training & Succession Planning"
   - In the strategy form, add `staff_unavailable` to `applicableRisks`
   - Add action steps (Before/During/After/Ongoing)
4. **Re-run wizard:**
   - Select the new strategy
   - Risk will now appear with full protection plan

### If you DON'T want to address it:

Do nothing! It won't show in the plan anymore since there are no strategies for it.

## Summary

✅ **Fixed:** Risks without strategies no longer appear  
✅ **Fixed:** Risk count only shows protected risks  
✅ **Not Hardcoded:** All risks come from your actual data  
✅ **Database-Driven:** All content from database  
✅ **Clean Output:** Only actionable information shown  

The risk you saw was real data from your risk assessment, not hardcoded. The system now correctly filters it out when there are no protection strategies selected.


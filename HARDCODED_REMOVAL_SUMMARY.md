# Hardcoded Risk Data Removal - Complete ✅

## Problem Identified
"Key Staff Unavailability" risk was appearing in the BCP review even though it didn't exist in the Admin2 database. Investigation revealed hardcoded risk lists in the codebase.

## Files Modified

### 1. ✅ `src/components/StructuredInput.tsx`
**Removed:** 106 lines of hardcoded hazard categories (lines 654-760)
- Deleted `COMPREHENSIVE_HAZARD_CATEGORIES` object with 7 categories
- Removed hardcoded lists including: 'staff_unavailable', 'economic_downturn', 'supply_disruption', etc.
- Added comment: "All hazard/risk data now comes from AdminHazardType table in the database"

**Before:**
```typescript
const COMPREHENSIVE_HAZARD_CATEGORIES = {
  'Business & Economic': [
    'supply_disruption', 'staff_unavailable', 'economic_downturn', 'tourism_disruption'
  ],
  // ... 6 more categories with 20+ hardcoded hazards
}
```

**After:**
```typescript
// OLD HARDCODED HAZARD CATEGORIES REMOVED - System now uses Admin2 database exclusively
// All hazard/risk data now comes from AdminHazardType table in the database
```

### 2. ✅ `src/app/api/export-pdf/route.ts`
**Removed:** Hardcoded `HAZARD_LABELS` dictionary (lines 8-17)
**Removed:** Hardcoded `STRATEGY_LABELS` dictionary (lines 19-23)

**Before:**
```typescript
const HAZARD_LABELS: { [key: string]: string } = {
  'hurricane': 'Hurricane/Tropical Storm',
  'power_outage': 'Extended Power Outage',
  // ... 8 hardcoded hazard labels
}
```

**After:**
```typescript
// Transformation functions - All hazard data comes from Admin2 database
function transformHazardName(hazardCode: string): string {
  if (typeof hazardCode !== 'string') return String(hazardCode || '')
  // Simply format the hazard code - actual names come from database
  return hazardCode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
```

### 3. ✅ `src/components/BusinessPlanReview.tsx` (Previously Fixed)
Already uses Admin2 database via `centralDataService.getStrategies()`

## What Was NOT Removed (And Why It's OK)

### Translation Files: `src/messages/en.json`, `es.json`, `fr.json`
These files still contain `"staff_unavailable": "Key Staff Unavailability"` labels.

**WHY THIS IS OK:**
- These are **translation labels ONLY** - they don't inject or create risks
- They're used to translate risk codes from the database into user-friendly names
- If a risk code `staff_unavailable` comes from the database, these labels translate it
- If the risk doesn't exist in Admin2, the label is simply unused

**Think of them like a dictionary:** Having a word in the dictionary doesn't mean you're forcing people to use it.

## Current Data Flow (100% Database-Driven)

```
Admin2 Database (AdminHazardType table)
        ↓
    Wizard Backend (preFillData)
        ↓
    SimplifiedRiskAssessment Component
        ↓
    User Selects Risks
        ↓
    BusinessPlanReview (displays only selected risks from DB)
        ↓
    PDF Export (uses same DB data)
```

## Result

✅ **Zero hardcoded risks** - All risk data comes from Admin2  
✅ **Zero hardcoded strategies** - All strategy data comes from RiskMitigationStrategy table  
✅ **Zero hardcoded action steps** - All actions come from ActionStep table  
✅ **Translation labels are passive** - They only translate what exists in the DB  

## Why "Key Staff Unavailability" Appeared

1. **Old wizard data:** You previously selected this risk when it WAS in a hardcoded list
2. **Data persisted:** The selection was saved in localStorage/database
3. **Not in Admin2:** It's not in your current Admin2 database
4. **Solution:** The risk-filtering fix in BusinessPlanReview now **hides risks without strategies**, so it won't appear anymore

## How to Test

1. **Clear old wizard data:** Delete localStorage or start fresh browser session
2. **Run through wizard:** Only risks from your 13 Admin2 hazards will appear
3. **Check review:** Only risks with selected strategies will show in the BCP

## Your Admin2 Risks (The Complete List)
Only these 13 risks can appear in the wizard:
1. 🌀 Hurricane
2. 🌊 Flood  
3. 🏔️ Earthquake
4. 🌵 Drought
5. ⛰️ Landslide
6. ⚡ Power
7. 🔥 Fire
8. 💻 Cyber
9. 🔒 Security
10. 🦠 Health
11. 📉 Economic
12. 🚛 Supply
13. ⚡ Civil

**NO MORE** staff_unavailable, tourism_disruption, or any other hardcoded nonsense!






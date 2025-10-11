# Parish isCoastal/isUrban Cleanup - January 2025

## Overview

Remove `isCoastal` and `isUrban` fields from Parish model since these are now handled through the multiplier system based on user input (`location.nearCoast` and `location.urbanArea`).

---

## Why This Change?

**Before:** Parish had static `isCoastal`/`isUrban` boolean fields in database  
**Problem:** This was redundant with user input and created confusion  
**Now:** We use user-provided `location.nearCoast` and `location.urbanArea` which flow through the multiplier system  

**Benefits:**
- ✅ Single source of truth (user input)
- ✅ More accurate (user knows their exact location better than parish-level data)
- ✅ Cleaner database schema
- ✅ Multiplier system handles all coastal/urban risk adjustments

---

## Database Changes

### Schema Update: ✅ DONE
Removed from `prisma/schema.prisma`:
```prisma
model Parish {
  // REMOVED:
  // isCoastal   Boolean  @default(false)
  // isUrban     Boolean  @default(false)
}
```

### Migration File: ✅ CREATED
`prisma/migrations/20250111_remove_parish_coastal_urban/migration.sql`

### Apply Migration:
```bash
# This will drop the columns (data loss expected and intended)
npx prisma db push
# Answer "y" to confirm data loss warning
```

---

## Code References to Remove/Update

### Frontend Components (Admin2):

#### 1. Remove Display of isCoastal/isUrban
Files to update:
- `src/components/admin2/CompactParishOverview.tsx` (lines 36-37, 93-94)
- `src/components/admin2/ImprovedParishOverview.tsx` (lines 33-40)
- `src/components/admin2/ParishOverview.tsx` (lines 33-40)
- `src/components/admin2/RiskMatrix.tsx` (lines 137-144)
- `src/components/admin2/CompactRiskMatrix.tsx` (lines 286-291)

**Change:** Remove the coastal 🏖️ and urban 🏙️ badges/indicators from parish displays.

#### 2. Update Type Definitions
Files to update:
- `src/components/admin2/ImprovedRiskCalculatorTab.tsx` (lines 9-10)
- `src/components/admin2/ParishEditor.tsx` (lines 16-17)
- `src/components/admin2/RiskCalculatorTab.tsx` (lines 9-10)
- `src/components/admin2/RiskMatrix.tsx` (lines 9-10)
- `src/components/admin2/CompactRiskMatrix.tsx` (lines 9-10)

**Change:** Remove `isCoastal: boolean` and `isUrban: boolean` from Parish type interfaces.

#### 3. Remove from Select Options
Files to update:
- `src/components/admin2/ImprovedRiskCalculatorTab.tsx` (lines 520-521, 529-530)
- `src/components/admin2/RiskCalculatorTab.tsx` (lines 321-322)

**Change:** Remove " - Coastal" and " - Urban" suffixes from parish option labels.

#### 4. Update Test Data
File: `src/components/admin2/ImprovedParishDashboard.tsx` (lines 21-22, 39-40)

**Change:** Remove isCoastal and isUrban from mock parish data.

### Backend API Endpoints:

#### 1. Remove from Parish Queries
Files to update:
- `src/app/api/admin2/parishes/[id]/route.ts` (lines 47-48)
- `src/app/api/admin2/parishes/route.ts` (lines 24-25, 70, 84-85)
- `src/app/api/admin/admin2/parishes/[id]/route.ts` (lines 37-38)
- `src/app/api/admin/admin2/parishes/route.ts` (lines 24-25)
- `src/app/api/admin/admin2/parishes/report/route.ts` (lines 30-31, 120-121, 227)

**Change:** Remove isCoastal/isUrban from response objects and calculations.

#### 2. Remove from Bulk Upload
Files to update:
- `src/app/api/admin2/parishes/bulk-upload/route.ts` (lines 13-14, 135-136, 271-272)
- `src/app/api/admin/admin2/parishes/bulk-upload/route.ts` (lines 75-76)

**Change:** Remove isCoastal/isUrban parsing from CSV uploads.

#### 3. Keep User Input Handling (DO NOT REMOVE!)
Files to KEEP as-is:
- `src/app/api/wizard/prepare-prefill-data/route.ts` (lines 124-125, 136-137)
- `src/app/api/wizard/get-field-suggestions/route.ts` (lines 134-135, 167-170, 324-329)

**Why:** These use `location.nearCoast` and `location.urbanArea` from USER INPUT, not Parish fields. This is correct and should remain!

#### 4. Remove from Risk Calculation (AdminLocation context)
File: `src/app/api/admin/risk-calculation/route.ts` (line 37)

**Change:** The `location.isCoastal` check should use AdminLocation model instead (which still has isCoastal for the old admin system).

---

## Important Distinctions

### Two Different Contexts:

#### 1. Parish Model (REMOVING isCoastal/isUrban)
- Old static database fields
- Not accurate enough
- Being removed ✅

#### 2. User Input (KEEPING nearCoast/urbanArea)
- `location.nearCoast` from wizard user input
- `location.urbanArea` from wizard user input
- Flows through multiplier system
- This is correct! Keep it! ✅

### Example:
```typescript
// REMOVE (Parish database fields):
parish.isCoastal ❌
parish.isUrban ❌

// KEEP (User input):
location.nearCoast ✅
location.urbanArea ✅
userChars.isCoastal ✅  // Derived from location.nearCoast
userChars.isUrban ✅    // Derived from location.urbanArea
```

---

## Country Selector Issue

**User Report:** "I don't see a country selector"

**Status:** ✅ Country selector EXISTS and is WORKING

**Location:** `src/components/IndustrySelector.tsx` lines 731-749

**Current Behavior:**
- Country selector dropdown is visible
- Auto-selects Jamaica on load (if available)
- User can change to other countries
- Shows "Choose a country..." placeholder

**Why User Might Not See It:**
- It auto-selects Jamaica, so dropdown appears pre-filled
- This might make it look like it's not changeable

**No Fix Needed:** The UI is working correctly!

---

## Naming Issue: "Jamaica bla bla" vs "Caribbean Business"

**User Report:** "Name is still 'Jamaica bla bla' instead of 'Caribbean Business'"

**Investigation:**
- Business type names are clean: "Restaurant", "Grocery Store", etc.
- Descriptions may mention "Jamaican cuisine" but that's accurate
- Platform name is already "Caribbean Business Continuity Planning Platform"

**Possible Sources:**
1. Business type descriptions mentioning "Jamaican" (accurate for regional context)
2. CSV file names or exports referencing "Jamaica parishes"
3. Console logs during data population

**Files Already Correct:**
- `src/components/admin2/Navigation.tsx` line 17: "Caribbean Business Continuity Planning Platform" ✅
- `src/components/admin2/UNDPHeader.tsx` line 23: "Caribbean Business Continuity Planning Platform" ✅

**Need More Info:** Where specifically is the user seeing "Jamaica bla bla"?

---

## Implementation Checklist

### Database:
- [✅] Remove isCoastal/isUrban from schema.prisma
- [ ] Apply migration (`npx prisma db push` and confirm "y")
- [ ] Regenerate Prisma client (`npx prisma generate`)

### Frontend (Remove Parish isCoastal/isUrban):
- [ ] Update CompactParishOverview.tsx
- [ ] Update ImprovedParishOverview.tsx
- [ ] Update ParishOverview.tsx
- [ ] Update RiskMatrix.tsx
- [ ] Update CompactRiskMatrix.tsx
- [ ] Update ImprovedRiskCalculatorTab.tsx (type + display)
- [ ] Update ParishEditor.tsx (type)
- [ ] Update RiskCalculatorTab.tsx (type + display)
- [ ] Update ImprovedParishDashboard.tsx (test data)

### Backend (Remove Parish isCoastal/isUrban):
- [ ] Update admin2/parishes/[id]/route.ts
- [ ] Update admin2/parishes/route.ts
- [ ] Update admin2/parishes/bulk-upload/route.ts
- [ ] Update admin/admin2/parishes/[id]/route.ts
- [ ] Update admin/admin2/parishes/route.ts
- [ ] Update admin/admin2/parishes/report/route.ts
- [ ] Update admin/admin2/parishes/bulk-upload/route.ts

### Verify User Input Still Works:
- [✅] wizard/prepare-prefill-data/route.ts (location.nearCoast/urbanArea)
- [✅] wizard/get-field-suggestions/route.ts (location.nearCoast/urbanArea)
- [✅] multiplierService.ts (uses user characteristics)

---

## Testing After Changes

### 1. Test Database:
```sql
-- Verify columns are removed
SELECT * FROM "Parish" LIMIT 1;
-- Should NOT have isCoastal or isUrban columns
```

### 2. Test Wizard Flow:
- Go through wizard
- Select coastal location
- Check that location.nearCoast is captured
- Verify multipliers are applied correctly

### 3. Test Admin Panel:
- View parish list (should not show coastal/urban badges)
- Upload parish CSV (should not require isCoastal/isUrban columns)
- View parish details (should not show isCoastal/isUrban)

### 4. Test Risk Calculation:
- Run risk calculator
- Verify multipliers work with user input
- Check console logs for threshold decisions

---

## Rollback Plan (If Needed)

If something breaks:
1. Revert schema.prisma to add fields back
2. Run `npx prisma db push`
3. Re-add the display code
4. Investigate the issue

---

## Summary

**What's Being Removed:**
- Parish database fields: `isCoastal`, `isUrban`
- All UI displays of parish coastal/urban status
- CSV upload columns for parish coastal/urban

**What's Being Kept:**
- User input: `location.nearCoast`, `location.urbanArea`
- Multiplier system using user input
- All risk calculation logic

**Why:**
Single source of truth from user input → multiplier system → accurate risk scores

---

**Status:** READY FOR IMPLEMENTATION
**Date:** January 2025
**Risk:** Low (user input system is separate and working)


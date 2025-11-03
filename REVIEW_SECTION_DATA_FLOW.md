# Business Plan Review Section - Production Data Flow

## ✅ PRODUCTION-READY STATUS

The review section now correctly displays **only user-selected data** from the wizard, with no hardcoded test content appearing in the final output.

## Data Flow Architecture

### 1. User Input → Risk Calculation
```
User fills wizard:
├─ Location data (parish, country, coastal, urban)
├─ Business type data (industry, size, dependencies)
└─ Business characteristics (tourism %, employee count, etc.)

↓

Backend API (/api/wizard/prepare-prefill-data):
├─ Calculates risks from Admin2 parish data
├─ Applies multipliers based on business characteristics
├─ Generates risk assessment matrix with isPreSelected flags
└─ Recommends strategies based on calculated risks
```

### 2. Wizard Risk Assessment
```
SimplifiedRiskAssessment component:
├─ Receives pre-calculated risks from backend
├─ User can review, adjust, select/deselect risks
├─ Each risk has isSelected property (true/false)
└─ Saves ALL risks (selected + unselected) with isSelected flags
```

### 3. Review Section Display
```
BusinessPlanReview component:
├─ Section 2 (Risk Assessment): Shows ONLY risks where isSelected !== false
├─ Section 3 (Strategies): Shows ONLY user-selected strategies
└─ Section 4 (Action Plans): Shows ONLY action plans for selected high-priority risks
```

## Key Filtering Logic

### Risk Filtering (Lines 1135, 1169, 1537-1543)
```typescript
// Only show user-selected risks
.filter((risk: any) => risk.isSelected !== false)
```

**Why `!== false` instead of `=== true`?**
- Backward compatibility: Old data without isSelected property defaults to showing
- Future-proof: Explicitly set to true or undefined both pass
- Only explicitly deselected (false) risks are hidden

### Strategy Filtering
Strategies are filtered naturally - only strategies that the user selected in the wizard are saved to `formData.STRATEGIES['Business Continuity Strategies']`.

### Action Plan Filtering (Lines 1537-1543)
```typescript
const priorityRisks = riskMatrix.filter((r: any) => {
  const level = (r['Risk Level'] || '').toLowerCase()
  const isHighPriority = level.includes('high') || level.includes('extreme')
  const isUserSelected = r.isSelected !== false
  return isHighPriority && isUserSelected
})
```

## Changes Made (Nov 2, 2025)

### 1. Section 2: Risk Assessment
- **Line 1135**: Filter risk portfolio overview to count only selected risks
- **Line 1169**: Filter risk cards to display only selected risks
- **Result**: Dashboard shows accurate counts, no hardcoded test risks

### 2. Section 4: Detailed Action Plans  
- **Line 1537-1543**: Filter to show only high/extreme risks that user selected
- **Result**: No more "Cyber Attack / Ransomware" or "Key Staff Unavailability" unless they exist in admin2 AND user selected them

## Test Scripts vs Production

### Fill Data Scripts (for testing only)
Located in:
- `public/fill-complete-plan.js`
- `scripts/fill-wizard-SIMPLE.js`
- `scripts/fill-wizard-with-sample-data.js`

These scripts are **for development testing only** and can fill the wizard with sample data. However, the review section will now correctly filter this data:
- Only risks with `isSelected !== false` will display
- Only selected strategies will display
- Only action plans for selected risks will display

### Production Flow
In production, users:
1. Enter their location and business type
2. Backend calculates relevant risks from admin2 database
3. User reviews and selects/deselects risks
4. User selects strategies
5. Review section shows ONLY what they selected

## No Hardcoded Content

The following are **NOT hardcoded** in BusinessPlanReview.tsx:
- ✅ Risk names (come from formData or admin2 database)
- ✅ Risk levels (calculated by backend or wizard)
- ✅ Strategies (from admin2 database + user selection)
- ✅ Action steps (from admin2 strategy definitions)

The only "hardcoded" elements are:
- UI labels (section headers, field names)
- Transformation mappings (HAZARD_LABELS for display formatting)
- Layout and styling

## Verification Checklist

To verify production-ready status:

1. ✅ Clear browser localStorage
2. ✅ Start fresh wizard session
3. ✅ Enter location: Christ Church, Barbados
4. ✅ Enter business type: Hospitality & Tourism
5. ✅ Complete wizard with selections
6. ✅ Review section shows ONLY:
   - Risks you selected from Christ Church admin2 data
   - Strategies you selected
   - Action plans for your selected high-priority risks

## Admin2 Database Integration

The system now properly uses:
- Parish-level risk data (Christ Church)
- Business type vulnerabilities (Hospitality & Tourism)
- Risk multipliers (coastal location, tourism dependency, etc.)
- Strategy templates with action steps
- Localized content (en/es/fr)

All displayed in the review section based on **actual user selections**, not hardcoded values.




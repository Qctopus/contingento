# Crisis Action Workbook - Dynamic Data Integration

## Overview
Successfully integrated dynamic data from the wizard into the WorkbookPreview component, making it display actual user data just like the formal BCP version.

## What Was Dynamically Populated

### 1. ✅ Company & Plan Information
**Location:** Cover Page & Headers

- **Company Name** - Pulled from `formData.PLAN_INFORMATION?.['Company Name']`
- **Plan Manager** - Pulled from `formData.PLAN_INFORMATION?.['Plan Manager']`
- **Plan Manager Phone** - Pulled from `formData.PLAN_INFORMATION?.['Plan Manager Phone']`
- **Plan Manager Email** - Pulled from `formData.PLAN_INFORMATION?.['Plan Manager Email']`
- **Current Date** - Dynamically generated for "Last Updated" fields

**Impact:** Cover page and contact lists now show actual business information.

### 2. ✅ Risk Data
**Location:** Quick Reference Page, Risk Action Pages

**Dynamic Fields:**
- Risk names from `risk.hazard` or `risk.Hazard`
- Risk severity levels (`risk.riskLevel`)
- Risk scores (`risk.riskScore`)
- Sorted by severity (highest first)
- Top 3 risks displayed on Quick Reference page
- Risk-specific emojis based on hazard type

**Example Risk Types Handled:**
- 🌀 Hurricane/Tropical Storm
- 🏚️ Earthquake
- 🌊 Flood
- 🔥 Fire
- 💻 Cyber Attack
- ⚡ Power Outage
- 🏥 Pandemic/Health Crisis

**Impact:** Shows actual risks identified in wizard, not generic placeholders.

### 3. ✅ Strategy Data
**Location:** Risk Action Pages, Budget Worksheet

**Dynamic Fields:**
- Strategy names from `strategy.smeTitle` or `strategy.name`
- Strategy descriptions from `strategy.smeSummary`
- Cost data from `strategy.calculatedCostLocal`
- Currency symbols from `strategy.currencySymbol` (defaults to JMD)
- Number of strategies per risk
- Filtering strategies by applicable risk using `strategy.applicableRisks`

**Matching Logic:**
- Flexible risk-to-strategy matching
- Handles multiple risk ID formats
- Case-insensitive matching
- Partial name matching

**Impact:** Shows actual selected strategies with real costs, not placeholders.

### 4. ✅ Action Steps
**Location:** Risk Action Pages (BEFORE section)

**Dynamic Fields:**
- Action step titles from `step.smeAction` or `step.title`
- Action step phases (`immediate`, `short_term`, `medium_term`, `long_term`)
- Checklist items from `step.checklist`
- Cost calculations from `step.costItems`
- Groups steps by phase with appropriate emoji indicators

**Phase Configurations:**
- 🔴 IMMEDIATE (24-48 hours)
- 🟠 SHORT-TERM (1-2 weeks)
- 🟡 MEDIUM-TERM (1-3 months)
- 🟢 LONG-TERM (3+ months)

**Impact:** Displays actual action steps from strategies, organized by timeline.

### 5. ✅ Cost Data
**Location:** Budget Worksheet, Risk Headers

**Dynamic Fields:**
- Individual strategy costs from `strategy.calculatedCostLocal`
- Total investment from `totalInvestment` prop
- Currency symbols from `strategy.currencySymbol`
- Budget tiers calculated at 60%, 100%, 150%
- Cost per action step from `costItems`

**Cost Calculation Logic:**
- Calculates step cost from cost items
- Uses exchange rates when needed
- Handles missing cost data gracefully
- Shows currency-appropriate formatting

**Impact:** Real budgets displayed, not generic "$________" placeholders.

### 6. ✅ Strategy-to-Risk Mapping
**Location:** Throughout Risk Action Pages

**New Helper Function: `getStrategiesForRisk()`**

```typescript
const getStrategiesForRisk = (risk: any): Strategy[] => {
  const hazardName = getStringValue(risk.hazard || risk.Hazard)
  const hazardId = risk.hazardId || hazardName
  
  return strategies.filter((strategy: Strategy) => {
    if (!strategy.applicableRisks || strategy.applicableRisks.length === 0) return false
    
    return strategy.applicableRisks.some((riskId: string) => {
      const riskIdLower = riskId.toLowerCase().replace(/_/g, ' ')
      const hazardNameLower = hazardName.toLowerCase()
      const hazardIdLower = (hazardId || '').toString().toLowerCase()
      
      return riskId === hazardId || 
             riskId === risk.hazard ||
             riskIdLower === hazardNameLower ||
             riskIdLower === hazardIdLower ||
             hazardNameLower.includes(riskIdLower) ||
             riskIdLower.includes(hazardNameLower)
    })
  })
}
```

**Impact:** Each risk page shows only relevant strategies.

### 7. ✅ Multilingual Support
**Location:** All text fields

**Helper Function: `getStringValue()`**

Handles:
- Plain strings
- Multilingual objects `{ en: '...', es: '...', fr: '...' }`
- Fallback to any available language
- Null/undefined values

**Impact:** Works with existing multilingual data structure.

## New TypeScript Interfaces

### ActionStep Interface
```typescript
interface ActionStep {
  id: string
  title: string
  description: string
  smeAction?: string
  phase?: string
  sortOrder: number
  checklist?: string[]
  costItems?: Array<{
    id?: string
    itemId: string
    quantity: number
    notes?: string
    item?: any
  }>
  // ... other fields
}
```

### Strategy Interface
```typescript
interface Strategy {
  id: string
  name: string
  smeTitle?: string
  description: string
  smeSummary?: string
  applicableRisks: string[]
  actionSteps: ActionStep[]
  calculatedCostLocal?: number
  calculatedCostUSD?: number
  currencyCode?: string
  currencySymbol?: string
  // ... other fields
}
```

## Data Flow

```
FormData (from wizard)
    ↓
BusinessPlanReview Component
    ↓
WorkbookPreview Component
    ↓
Extract & Process:
- Company info from formData.PLAN_INFORMATION
- Risks from riskSummary (multiple possible locations)
- Strategies from strategies prop
- Action steps from strategy.actionSteps
- Costs from strategy.calculatedCostLocal & costItems
    ↓
Display in appropriate sections:
- Cover page
- Quick reference
- Contact lists
- Risk pages
- Budget worksheet
```

## Key Helper Functions

### 1. `formatCurrency(amount: number): string`
Formats numbers with thousands separators.

### 2. `calculateStepCost(step: ActionStep): number`
Calculates total cost for an action step from its cost items.

### 3. `getStrategiesForRisk(risk: any): Strategy[]`
Filters strategies applicable to a specific risk.

### 4. `getRiskEmoji(hazard: string): string`
Returns contextual emoji for each risk type.

### 5. `getStringValue(value: any): string`
Safely extracts strings from multilingual objects.

## Examples of Dynamic Content

### Before (Generic)
```
Plan Manager: Not specified
Phone: ______________________________
Cost: $________
Strategy: Review and update emergency procedures
```

### After (Dynamic)
```
Plan Manager: John Smith
Phone: (876) 555-1234
Cost: JMD 45,000
Strategy: Install Hurricane Shutters on All Windows
```

## Fallback Handling

All fields gracefully handle missing data:

- Missing plan manager → "Not specified"
- Missing phone → Shows blank line for filling in
- Missing cost → Shows "$________"
- Missing action steps → Shows message to add steps
- Missing strategies → Shows empty state

## Data Sources Respected

### From formData:
- `PLAN_INFORMATION['Company Name']`
- `PLAN_INFORMATION['Plan Manager']`
- `PLAN_INFORMATION['Plan Manager Phone']`
- `PLAN_INFORMATION['Plan Manager Email']`

### From riskSummary:
- `riskSummary['Risk Assessment Matrix']`
- `riskSummary['Hazard Applicability Assessment']`
- `riskSummary.risks`
- Individual risk fields: `hazard`, `Hazard`, `riskLevel`, `RiskLevel`, `riskScore`

### From strategies prop:
- All strategy fields
- All action step fields
- All cost item data
- Currency information

## Backwards Compatibility

The component maintains full backwards compatibility:

- Works with empty data (shows placeholders)
- Handles old data formats
- Respects multiple field name variations
- Gracefully degrades when data is missing

## Testing Recommendations

### To Verify Dynamic Data:

1. **Complete the wizard** with actual data
2. **Check Cover Page:**
   - Company name displays correctly
   - Plan manager name shows up
   - Emergency contact has phone number

3. **Check Quick Reference Page:**
   - Top 3 risks are actual risks from assessment
   - Risk emojis match risk types
   - Risk severity badges show correctly

4. **Check Risk Action Pages:**
   - Risk names match assessment
   - Action steps are real (not generic)
   - Costs show actual amounts in correct currency
   - Checklist items display

5. **Check Budget Worksheet:**
   - Strategy names list actual strategies
   - Costs match calculated amounts
   - Total adds up correctly
   - Currency symbol is correct (not always JMD)

6. **Check Contact Lists:**
   - Plan manager info is filled in
   - Phone and email display if provided

## Performance Considerations

- Efficient filtering: Strategies filtered per risk, not globally
- Memoization candidate: `getStrategiesForRisk()` could be memoized
- Slice operations: Only first 3 steps shown per phase to limit page length
- Fallback rendering: Quick checks prevent expensive operations on missing data

## Known Limitations

1. **Action Step Phases:** If no steps have phases, all fall into `medium_term`
2. **Currency Exchange:** Uses hardcoded exchange rate of 150 for some calculations
3. **Page Count Calculation:** Simplified (may not be exact in all cases)
4. **Checklist Items:** Limited to 2 items per step for space

## Future Enhancements

Potential improvements for even better dynamic content:

1. **More Contact Types:** Pull additional contacts from formData
2. **Risk Details:** Show likelihood/impact scores
3. **Time Estimates:** Display estimated hours per step
4. **Completion Tracking:** Show which steps are already done
5. **Priority Indicators:** Highlight critical/essential strategies

## Summary

The WorkbookPreview component is now fully dynamic and data-driven:

✅ **Company Information** - Real business details
✅ **Risk Data** - Actual assessed risks  
✅ **Strategy Data** - Real selected strategies
✅ **Action Steps** - Actual implementation steps
✅ **Cost Data** - Real budget calculations
✅ **Contact Info** - Actual plan manager details
✅ **Currency Handling** - Correct currency symbols
✅ **Multilingual** - Works with translated content
✅ **Fallback Handling** - Graceful degradation

**Result:** The workbook now displays personalized, actionable content based on the user's actual wizard inputs, making it a truly practical crisis-ready document.


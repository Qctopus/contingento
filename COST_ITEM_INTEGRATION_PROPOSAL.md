# Cost Item Integration Architecture Proposal

## Executive Summary

**Issue Identified**: The current admin strategy editor has a disconnect between the structured cost items system (CostItem table with base USD pricing, currency multipliers, etc.) and the strategy/action step creation interface (which uses freeform text fields for costs).

**Impact**: Admins are manually typing costs like "JMD 5,000-15,000" instead of selecting structured cost items, which means:
- No automatic currency conversion
- No centralized cost management
- Inconsistent pricing across strategies
- Cannot calculate accurate total strategy costs
- Manual maintenance burden when prices change

**Proposed Solution**: Integrate the cost items library into the strategy and action step editors, allowing admins to select from predefined cost items with automatic pricing calculations.

---

## Current Architecture Analysis

### What EXISTS in the Database Schema

```prisma
// Cost Items Library (Comprehensive, structured)
model CostItem {
  id              String   @id @default(cuid())
  itemId          String   @unique
  name            String   
  category        String   // 'construction' | 'equipment' | 'service' | 'supplies'
  baseUSD         Float    // Base price in USD
  baseUSDMin      Float?   // Price range minimum
  baseUSDMax      Float?   // Price range maximum
  unit            String?  // "per window", "per unit", etc.
  
  // Relations to link items to strategies/steps
  strategyItems   StrategyItemCost[]
  actionStepItems ActionStepItemCost[]
}

// Junction table: Strategy → Cost Items
model StrategyItemCost {
  strategyId      String
  itemId          String
  quantity        Int      @default(1)
  customNotes     String?
  countryOverrides String? // Manual overrides per country
  
  strategy        RiskMitigationStrategy @relation(...)
  item            CostItem @relation(...)
}

// Junction table: Action Step → Cost Items
model ActionStepItemCost {
  actionStepId    String
  itemId          String
  quantity        Int      @default(1)
  customNotes     String?
  countryOverrides String?
  
  actionStep      ActionStep @relation(...)
  item            CostItem @relation(...)
}

// Currency multipliers by country
model CountryCostMultiplier {
  countryCode     String   @unique
  construction    Float    @default(1.0)
  equipment       Float    @default(1.0)
  service         Float    @default(1.0)
  supplies        Float    @default(1.0)
  currency        String
  exchangeRateUSD Float
}
```

**✅ The data model IS designed for structured costing**

### What's MISSING in the Current UI

#### Strategy Editor (StrategyEditor.tsx lines 1080-1088)

**Current Implementation**:
```tsx
<MultiCurrencyInput
  label="Estimated Cost (Multi-Currency) 💰"
  value={stepData.estimatedCostJMD || ''}
  onChange={(value) => setStepData(prev => ({ ...prev, estimatedCostJMD: value }))}
  placeholder="e.g., 5,000 or Free"
/>
```

**Problem**: This is just a text field. Admins manually type "JMD 5,000-15,000" or "Free".

**Missing**:
- ❌ No cost item selector
- ❌ No quantity specification
- ❌ No automatic calculation
- ❌ No link to `ActionStepItemCost` table

#### Strategy-Level Costs

**Currently**: Strategy has `implementationCost: 'low' | 'medium' | 'high' | 'very_high'` (categorical) and `costEstimateJMD: string` (freeform text).

**Missing**:
- ❌ No link to `StrategyItemCost` table
- ❌ No calculated total from action step costs
- ❌ No breakdown by cost item

---

## Proposed Architecture

### 1. Cost Item Selection UI for Action Steps

When editing an action step, admins should be able to:

```
┌─────────────────────────────────────────────────────┐
│ Edit Action Step: Install Hurricane Shutters       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 💰 Cost Items for This Step                        │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ + Add Cost Item from Library                 │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Selected Items:                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 🪟 Hurricane Shutters (Accordion Style)     │   │
│ │    Qty: [4] × $300 USD = $1,200 USD        │   │
│ │    • JMD: $189,000 (@ 157.5 rate)          │   │
│ │    • USD: $1,200                            │   │
│ │    [Edit] [Remove]                          │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 🔧 Professional Installation Service         │   │
│ │    Qty: [1] × $200 USD = $200 USD           │   │
│ │    • JMD: $31,500                           │   │
│ │    • USD: $200                              │   │
│ │    [Edit] [Remove]                          │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ─────────────────────────────────────────────────  │
│ Total Step Cost:                                   │
│   • USD: $1,400                                    │
│   • JMD: J$ 220,500                                │
│   • TTD: TT$ 9,520                                 │
│ ─────────────────────────────────────────────────  │
└─────────────────────────────────────────────────────┘
```

### 2. Cost Item Library Selector Modal

```
┌─────────────────────────────────────────────────────┐
│ Select Cost Items                            [✕]   │
├─────────────────────────────────────────────────────┤
│ Search: [________________]   Category: [All ▼]     │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 🏗️ CONSTRUCTION                              │   │
│ │                                               │   │
│ │ ☐ Hurricane Shutters (Aluminum)              │   │
│ │   $450 USD • JMD 70,875 • per window         │   │
│ │                                               │   │
│ │ ☐ Hurricane Shutters (Accordion) ⭐          │   │
│ │   $300 USD • JMD 47,250 • per window         │   │
│ │                                               │   │
│ │ ☐ Plywood Hurricane Boards                   │   │
│ │   $90 USD • JMD 14,175 • per window          │   │
│ │                                               │   │
│ ├─────────────────────────────────────────────┤   │
│ │ ⚡ EQUIPMENT                                  │   │
│ │                                               │   │
│ │ ☐ Backup Generator (5kW Diesel)              │   │
│ │   $2,800 USD • JMD 441,000 • per unit        │   │
│ │                                               │   │
│ │ ☐ Backup Generator (3kW Gasoline)            │   │
│ │   $800 USD • JMD 126,000 • per unit          │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ [Cancel]                          [Add Selected]   │
└─────────────────────────────────────────────────────┘
```

### 3. Strategy-Level Cost Summary

The strategy overview should show:

```
┌─────────────────────────────────────────────────────┐
│ Strategy: Backup Power & Energy Independence       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 💰 Total Implementation Cost                       │
│                                                     │
│ Immediate Actions:      USD $200   | JMD 31,500   │
│ Short-term Actions:     USD $3,000 | JMD 472,500  │
│ Medium-term Actions:    USD $5,000 | JMD 787,500  │
│ ─────────────────────────────────────────────────  │
│ Total Strategy Cost:    USD $8,200 | JMD 1,291,500│
│                                                     │
│ Cost Breakdown by Item:                            │
│   • 5kW Diesel Generator (1×)      USD $2,800     │
│   • Generator Fuel (4×)            USD $400       │
│   • Installation Service (1×)      USD $200       │
│   • Solar Battery System (1×)      USD $5,000     │
│                                                     │
│ [View Detailed Cost Analysis]                      │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Cost Item Selector Component

**Component**: `ActionStepCostItemSelector.tsx`

**Features**:
- Browse cost items library
- Search and filter by category
- Show prices in multiple currencies (calculated)
- Select items with quantity
- Save to `ActionStepItemCost` table

**Technical Details**:
```tsx
interface ActionStepCostItemSelectorProps {
  actionStep: ActionStep
  selectedItems: ActionStepItemCost[] // Already linked items
  onItemsChange: (items: ActionStepItemCost[]) => void
  countryCode: string // For currency display
}
```

### Phase 2: Cost Calculation Service

**Service**: `costCalculationService.ts`

**Functions**:
```typescript
// Calculate total cost for an action step
calculateActionStepCost(
  actionStepId: string,
  countryCode: string
): Promise<{
  totalUSD: number
  localCurrency: { code: string; amount: number; symbol: string }
  itemBreakdown: Array<{
    itemId: string
    name: string
    quantity: number
    unitPriceUSD: number
    totalUSD: number
    localAmount: number
  }>
}>

// Calculate total cost for a strategy
calculateStrategyCost(
  strategyId: string,
  countryCode: string
): Promise<{
  totalUSD: number
  localCurrency: { code: string; amount: number }
  byPhase: {
    immediate: number
    short_term: number
    medium_term: number
    long_term: number
  }
  itemBreakdown: Array<{...}>
}>
```

### Phase 3: Update Action Step Editor

Modify `StrategyEditor.tsx` action step editor section:

```tsx
// Replace simple text input with structured cost item selector
<ActionStepCostItemSelector
  actionStep={stepData}
  selectedItems={stepData.costItems || []}
  onItemsChange={(items) => setStepData(prev => ({
    ...prev,
    costItems: items
  }))}
  countryCode="JM" // Or detect from user
/>

// Show calculated total
<div className="mt-4 p-4 bg-blue-50 rounded-lg">
  <h4 className="font-medium text-blue-900">Calculated Cost</h4>
  <div className="text-2xl font-bold text-blue-600">
    ${calculatedCost.totalUSD} USD
  </div>
  <div className="text-sm text-blue-700">
    {calculatedCost.localCurrency.symbol} {calculatedCost.localCurrency.amount}
  </div>
</div>
```

### Phase 4: Strategy Cost Summary Dashboard

Create `StrategyCostSummary.tsx` component:

- Shows total strategy cost across all action steps
- Breakdown by phase
- Breakdown by cost item
- Multiple currency views
- Export/print functionality

### Phase 5: API Endpoints

```typescript
// Get cost items for selection
GET /api/admin2/cost-items
  ?category=equipment
  &search=generator
  &countryCode=JM

// Link cost items to action step
POST /api/admin2/action-steps/:stepId/cost-items
{
  items: [
    { itemId: 'generator_5kw_diesel', quantity: 1 },
    { itemId: 'installation_professional', quantity: 1 }
  ]
}

// Calculate strategy cost
GET /api/admin2/strategies/:strategyId/calculate-cost
  ?countryCode=JM

// Returns calculated costs for all action steps
```

---

## Benefits of This Approach

### For Admins

✅ **Centralized Cost Management**: Update a generator price once, affects all strategies using it

✅ **Consistency**: All strategies reference the same cost items, ensuring consistency

✅ **Automatic Currency Conversion**: Costs automatically convert to JMD, TTD, HTG, BBD, etc.

✅ **Structured Data**: Can generate cost reports, analyze pricing trends

✅ **Alternative Options**: Link budget/premium alternatives (e.g., $90 plywood vs $450 aluminum shutters)

### For End Users

✅ **Accurate Pricing**: Real market prices, not rough estimates

✅ **Local Currency**: See costs in their country's currency

✅ **Itemized Breakdown**: See exactly what they're paying for

✅ **Budget Planning**: Calculate total cost before committing

✅ **Alternatives**: See cheaper options if budget is tight

### For System Maintainability

✅ **Single Source of Truth**: Cost items library is the authoritative source

✅ **Easy Updates**: Update exchange rates → all strategies automatically reflect new costs

✅ **Regional Pricing**: Different multipliers for different countries

✅ **Audit Trail**: Track when costs were last updated

---

## Migration Path

### For Existing Strategies

1. **Phase 1 - Dual Mode**:
   - Keep existing text-based costs as fallback
   - Show both text estimate AND calculated cost (if items linked)
   - Warn admins: "⚠️ This strategy uses legacy text-based costing. Consider linking cost items for accurate pricing."

2. **Phase 2 - Gradual Migration**:
   - Admin tool to "Upgrade to Structured Costing"
   - AI-assisted matching: "Your step mentions 'generator' → Suggest: 5kW Diesel Generator?"
   - Bulk update common items

3. **Phase 3 - Full Adoption**:
   - New strategies MUST use cost items
   - Old strategies can continue with legacy mode
   - Eventually deprecate text-based costing

---

## Technical Considerations

### Performance

- **Cache cost calculations**: Don't recalculate on every page load
- **Lazy load cost items**: Only fetch when selector is opened
- **Paginate library**: Don't load all 100+ cost items at once

### Data Integrity

- **Soft delete cost items**: Never hard-delete, mark as `isActive: false`
- **Version cost items**: Track price changes over time
- **Snapshot costs**: When user creates BCP, snapshot current prices (so historical BCPs don't change)

### User Experience

- **Quick add**: Common items (generator, shutters) easily accessible
- **Smart defaults**: Pre-select typical quantities (e.g., 4 windows for shutters)
- **Visual feedback**: Show running total as items are added
- **Validation**: Warn if no cost items selected

---

## Example Workflow

### Current (Problematic)

1. Admin creates strategy "Backup Power"
2. Adds action step "Buy generator"
3. Types "JMD 50,000-200,000" in cost field ❌ (wide range, no structure)
4. User in Trinidad sees "JMD 50,000-200,000" ❌ (wrong currency)
5. Generator price increases ❌ (admin must manually update all strategies)

### Proposed (Structured)

1. Admin creates strategy "Backup Power"
2. Adds action step "Buy generator"
3. Clicks "Add Cost Items"
4. Selects "5kW Diesel Generator (Quantity: 1)"
5. System calculates:
   - Jamaica: JMD 441,000
   - Trinidad: TTD 19,040
   - Haiti: HTG 368,200
6. Generator price increases → Update once in cost items library → All strategies auto-update ✅

---

## Next Steps

### Immediate Action Needed

1. **Confirm Approach**: Does this architecture align with your vision?

2. **Prioritize Phase**: Which should we build first?
   - Option A: Start with action step cost item selector
   - Option B: Start with strategy-level cost summary
   - Option C: Build full system at once

3. **Design Decisions**:
   - Should action steps be REQUIRED to have cost items, or optional?
   - Keep legacy text-based costs as fallback?
   - How to handle custom/unlisted items?

4. **Data Migration**: How to handle 50+ existing strategies?

### Estimated Effort

- **Phase 1 (Cost Item Selector)**: 3-5 days
- **Phase 2 (Calculation Service)**: 2-3 days
- **Phase 3 (Editor Integration)**: 2-3 days
- **Phase 4 (Summary Dashboard)**: 2-3 days
- **Phase 5 (API Endpoints)**: 1-2 days
- **Testing & Refinement**: 2-3 days

**Total**: ~2-3 weeks for full implementation

---

## Questions to Resolve

1. **Granularity**: Should cost items be linked at:
   - Strategy level only?
   - Action step level only?
   - Both? (Current schema supports both)

2. **Flexibility**: What if admin needs custom item not in library?
   - Allow ad-hoc cost items?
   - Require adding to library first?

3. **User Visibility**: Should end users see:
   - Item-by-item breakdown?
   - Just total cost?
   - Configurable by admin?

4. **Currency Selection**: User-facing wizard should show costs in:
   - User's detected country currency?
   - User-selected currency?
   - Multiple currencies?

---

## Conclusion

The current disconnect between the structured cost items system and the freeform text-based costing in the admin UI represents a significant missed opportunity. Implementing proper integration would provide:

- **Accuracy**: Real, structured pricing data
- **Maintainability**: Single source of truth for costs
- **Multi-country Support**: Automatic currency conversion
- **User Trust**: Professional, itemized cost breakdowns

The architecture already exists in the database schema - we just need to build the UI and business logic to use it properly.

**Recommendation**: Proceed with phased implementation, starting with action step cost item selector, then expanding to full strategy cost calculations.



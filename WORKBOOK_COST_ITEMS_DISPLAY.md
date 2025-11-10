# 🎯 Display Cost Items in Workbook (Like Wizard)

## 📋 Current State vs Desired State

### ✅ What Wizard Shows (Good Example)
From your example of "Backup Power & Energy Independence":

```
Step 1: Buy generator that can run fridge, lights, and payment systems

⏱️ 2 week
💰 Bds$6,720 BBD         ← ITEMIZED COST from cost items!
✓ Done when: You will have documented proof
```

**The wizard displays:**
- Individual step costs from `costItems`
- Proper currency (Bds$ for Barbados)
- Aggregated total at strategy level (Bds$19,760 BBD)

### ❌ What Workbook Shows (Missing)
Currently the workbook shows:
- Generic "significant amounts" placeholders
- No actual cost breakdown
- No cost items display

---

## 🔍 Analysis: Where Cost Data Lives

### 1. **Strategy Level Costs** (Aggregated)
```typescript
strategy.calculatedCostLocal  // e.g., 19760
strategy.currencySymbol       // e.g., "Bds$"
strategy.currencyCode         // e.g., "BBD"
```

This is already calculated and passed to the workbook!

### 2. **Action Step Level Costs** (Individual Items)
```typescript
step.costItems = [
  {
    id: "...",
    itemId: "backup_generator_5kw",
    quantity: 1,
    item: {
      name: "5kW Backup Generator",
      baseUSD: 4000,
      unit: "per unit",
      category: "equipment"
    }
  },
  {
    itemId: "fuel_container_20gal",
    quantity: 2,
    item: {
      name: "20-Gallon Fuel Container",
      baseUSD: 50,
      unit: "each"
    }
  }
]
```

**This data exists but is NOT being displayed in the workbook!**

---

## 🛠️ What Needs to Be Added to Workbook

### Location: `src/components/previews/WorkbookPreview.tsx`

**Current action step display** (around line 1240-1280):

```tsx
<div className="mb-4">
  <p className="text-lg font-bold mb-1">
    {step.action}  {/* Just the action text */}
  </p>
  {step.estimatedTime && (
    <div className="text-sm">
      <strong>Time Needed:</strong> {step.estimatedTime}
    </div>
  )}
</div>
```

**Needs to become:**

```tsx
<div className="mb-4">
  <div className="flex items-start gap-4">
    <input type="checkbox" className="w-8 h-8 mt-1" />
    <div className="flex-1">
      <p className="text-lg font-bold mb-1">
        {step.action}
      </p>
      
      {/* Cost Items Breakdown */}
      {step.costItems && step.costItems.length > 0 && (
        <div className="mt-2 bg-green-50 border border-green-200 rounded p-2">
          <div className="text-sm font-bold text-green-900 mb-1">
            💰 What You Need to Buy:
          </div>
          <div className="space-y-1 text-sm">
            {step.costItems.map((costItem, idx) => {
              // Calculate local currency cost
              const baseUSD = costItem.item?.baseUSD || 0
              const quantity = costItem.quantity || 1
              const exchangeRate = getExchangeRate(step.currencyCode) // e.g., 2.0 for BBD
              const localCost = baseUSD * quantity * exchangeRate
              
              return (
                <div key={idx} className="flex justify-between items-start">
                  <span className="flex-1">
                    • {quantity}x {getItemName(costItem.item?.name)}
                    {costItem.item?.unit && (
                      <span className="text-gray-600 text-xs ml-1">
                        ({costItem.item.unit})
                      </span>
                    )}
                  </span>
                  <span className="font-mono font-bold text-green-700 ml-2">
                    {step.currencySymbol || '$'}{localCost.toFixed(0)}
                  </span>
                </div>
              )
            })}
          </div>
          
          {/* Step Total */}
          <div className="mt-2 pt-2 border-t border-green-300 flex justify-between font-bold">
            <span>Step Total:</span>
            <span className="font-mono text-green-800">
              {step.currencySymbol || '$'}{calculateStepTotal(step).toFixed(0)}
            </span>
          </div>
        </div>
      )}
      
      {/* Existing fields */}
      {step.why && (
        <div className="text-sm text-gray-700 mt-2">
          <strong>Why:</strong> {step.why}
        </div>
      )}
      
      {step.estimatedTime && (
        <div className="text-sm mt-1">
          <strong>Time Needed:</strong> {step.estimatedTime}
        </div>
      )}
    </div>
  </div>
</div>
```

---

## 🎯 Required Helper Functions

Add these to `WorkbookPreview.tsx`:

```typescript
// Get exchange rate for country
const getExchangeRate = (currencyCode: string): number => {
  const rates: Record<string, number> = {
    'BBD': 2.0,    // Barbados Dollar
    'JMD': 157.5,  // Jamaican Dollar
    'TTD': 6.8,    // Trinidad & Tobago Dollar
    'BSD': 1.0,    // Bahamian Dollar
    'XCD': 2.7,    // Eastern Caribbean Dollar
    'HTG': 132.0,  // Haitian Gourde
    'DOP': 59.0,   // Dominican Peso
    'USD': 1.0     // US Dollar (base)
  }
  return rates[currencyCode] || 1.0
}

// Get localized item name
const getItemName = (name: any): string => {
  if (typeof name === 'string') return name
  if (typeof name === 'object' && name !== null) {
    return name.en || name.es || name.fr || 'Item'
  }
  return 'Item'
}

// Calculate step total from cost items
const calculateStepTotal = (step: any): number => {
  if (!step.costItems || step.costItems.length === 0) return 0
  
  const exchangeRate = getExchangeRate(step.currencyCode || 'USD')
  
  return step.costItems.reduce((total: number, costItem: any) => {
    const baseUSD = costItem.item?.baseUSD || 0
    const quantity = costItem.quantity || 1
    return total + (baseUSD * quantity * exchangeRate)
  }, 0)
}
```

---

## 📊 Visual Enhancement Ideas

### Option 1: Compact List (For Workbook)
```
💰 What You Need:
• 1x 5kW Backup Generator (per unit) ............ Bds$8,000
• 2x 20-Gallon Fuel Container (each) ........... Bds$200
• 1x Transfer Switch Installation (service) .... Bds$1,200
                                          ─────────────────
                                   TOTAL:  Bds$9,400
```

### Option 2: Table Format (If Space)
```
┌──────────────────────────────┬─────┬──────────┬──────────┐
│ Item                         │ Qty │ Unit     │ Cost     │
├──────────────────────────────┼─────┼──────────┼──────────┤
│ 5kW Backup Generator         │  1  │ per unit │ Bds$8,000│
│ 20-Gallon Fuel Container     │  2  │ each     │ Bds$ 200 │
│ Transfer Switch Installation │  1  │ service  │ Bds$1,200│
├──────────────────────────────┴─────┴──────────┼──────────┤
│                                    STEP TOTAL │ Bds$9,400│
└───────────────────────────────────────────────┴──────────┘
```

### Option 3: Simple Box (Recommended for Print)
```
┌────────────────────────────────────────────┐
│ 💰 SHOPPING LIST FOR THIS STEP            │
├────────────────────────────────────────────┤
│ ☐ 5kW Backup Generator ... Bds$8,000      │
│ ☐ Fuel Containers (2x) .... Bds$200       │
│ ☐ Installation Service .... Bds$1,200     │
├────────────────────────────────────────────┤
│ TOTAL: Bds$9,400                          │
└────────────────────────────────────────────┘
```

---

## 🚀 Implementation Priority

### Phase 1: Basic Cost Display (High Priority)
- [x] Show total strategy cost (already done)
- [ ] Show cost breakdown per step
- [ ] Display cost items with quantities
- [ ] Calculate and show step totals

### Phase 2: Enhanced Details (Medium Priority)
- [ ] Show item categories (equipment/service/supplies)
- [ ] Add budget vs premium alternatives
- [ ] Show DIY savings calculations
- [ ] Add vendor recommendations (if available)

### Phase 3: Interactive Features (Low Priority - Future)
- [ ] Checkboxes next to items to mark as purchased
- [ ] Space to write actual vendor and price paid
- [ ] Budget tracking table at end of workbook

---

## 💡 Key Benefits

**For Users:**
- ✅ Know EXACTLY what to buy and how much to budget
- ✅ Can shop around with specific item specs
- ✅ Can request quotes from suppliers
- ✅ Can compare actual costs to estimates

**For Workbook:**
- ✅ Becomes actionable shopping list
- ✅ More professional and complete
- ✅ Matches wizard presentation (consistency)
- ✅ Useful for loan applications (itemized costs)

---

## 📝 Example: Complete Step with Cost Items

```tsx
STEP 1: PURCHASE BACKUP POWER EQUIPMENT

Action: Buy generator that can run fridge, lights, and payment systems for at least 8 hours

┌─────────────────────────────────────────────────────────┐
│ 💰 SHOPPING LIST                                        │
├─────────────────────────────────────────────────────────┤
│ ☐ 1x Diesel Generator 5kW (Honda/Yamaha) ... Bds$8,000 │
│   • Look for: Auto-start, electric start               │
│   • Where: Hardware stores, generator dealers           │
│                                                         │
│ ☐ 2x Jerry Can 20-Gallon Fuel Container ... Bds$100    │
│   • Metal or approved plastic                          │
│   • Where: Gas stations, hardware stores               │
│                                                         │
│ ☐ 1x Transfer Switch Installation ........... Bds$1,200│
│   • Professional electrician required                  │
│   • Get 2-3 quotes                                     │
├─────────────────────────────────────────────────────────┤
│ STEP TOTAL: Bds$9,300                                  │
│                                                         │
│ 💚 Low Budget Alternative: Start with 2kW inverter     │
│    generator (Bds$2,500) to run essentials only        │
└─────────────────────────────────────────────────────────┘

⏱️ Time Needed: 2 weeks
✓ Done When: Generator installed, tested, and running on transfer switch

WHY THIS MATTERS:
Without backup power, you lose all refrigerated inventory during outages.
A single 24-hour outage can cost thousands in spoiled food.

WHAT HAPPENS IF SKIPPED:
Compete with hundreds of other businesses for limited generator rentals
during emergencies (if any available). Food spoilage costs often exceed
generator purchase cost.
```

---

## 🔧 Quick Fix for Now

**Simplest implementation to add TODAY:**

```tsx
{/* Add after the step action text */}
{step.costItems && step.costItems.length > 0 && (
  <div className="text-sm bg-yellow-50 border-l-4 border-yellow-400 p-2 mt-2">
    <strong>💰 Budget for this step: </strong>
    {step.currencySymbol || '$'}
    {calculateStepTotal(step).toFixed(0)} 
    {step.currencyCode}
  </div>
)}
```

Then progressively enhance it with the full item breakdown.

---

**Next Step:** Implement the basic cost display in WorkbookPreview.tsx following the examples above!



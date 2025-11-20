# 🚫 Hardcoded Costs Removal Guide

## Critical Multi-Currency Issue

Our application serves **7 Caribbean countries** with different currencies:
- 🇯🇲 Jamaica - JMD (J$)
- 🇧🇧 Barbados - BBD (Bds$)
- 🇹🇹 Trinidad - TTD (TT$)
- 🇧🇸 Bahamas - BSD (B$)
- 🇭🇹 Haiti - HTG (G)
- 🇩🇴 Dominican Republic - DOP (RD$)
- 🇬🇩🇱🇨🇻🇨🇩🇲🇦🇬🇰🇳 Eastern Caribbean - XCD (EC$)

**Hardcoded currency amounts break the user experience for all non-Jamaica countries.**

---

## ❌ NEVER Include Hardcoded Costs

### Examples of What NOT to Write:

❌ "JMD 45,000"
❌ "J$ 20,000"
❌ "$500"
❌ "Costs between $1,500-3,000"
❌ "USD 750"
❌ "Bds$ 600"

### ✅ Instead Write:

✅ "See cost breakdown"
✅ "Budget-friendly option"
✅ "Significant savings"
✅ "Cost-effective solution"
✅ "Affordable alternative"
✅ Describe **what's needed**, not the price

---

## Rewriting Examples

### 1. Success Stories (realWorldExample)

**BEFORE (BAD):**
```
A pharmacy in Kingston secured shelves with brackets. During the 2020 earthquake, 
they lost zero inventory while neighboring shops had JMD 300,000 in broken items.
```

**AFTER (GOOD):**
```
A pharmacy in Kingston secured shelves with brackets before the 2020 earthquake. 
While neighboring shops lost significant inventory due to broken glass and fallen 
items, this pharmacy had zero losses because everything was secured.
```

**Pattern:** Keep the impact story, remove specific costs.

---

### 2. Low Budget Alternatives

**BEFORE (BAD):**
```
DIY shelf brackets using angle iron from hardware store (JMD 1,500-3,000) vs 
professional seismic anchoring (JMD 20,000-40,000). Use rope/straps to secure tall items.
```

**AFTER (GOOD):**
```
Use basic shelf brackets from local hardware stores instead of professional seismic 
anchoring systems. Secure tall items with heavy-duty rope or straps. This approach 
provides significant cost savings - see the itemized costs below for comparison.
```

**Pattern:** Describe the approach, mention savings exist, refer to cost items.

---

### 3. DIY Approaches

**BEFORE (BAD):**
```
Buy plywood sheets (JMD 8,000), hinges (JMD 2,000), exterior paint (JMD 2,000). 
Total: JMD 12,000 vs professional metal shutters at JMD 50,000+
```

**AFTER (GOOD):**
```
You'll need plywood sheets, hinges, and exterior paint from your local hardware 
store. This DIY approach costs significantly less than professional metal shutters. 
See the detailed cost breakdown for pricing in your country's currency.
```

**Pattern:** List materials needed, note it's cheaper, point to cost system.

---

### 4. Action Descriptions

**BEFORE (BAD):**
```
Purchase backup generator (JMD 150,000-500,000 depending on size)
```

**AFTER (GOOD):**
```
Purchase backup generator appropriate for your business needs
```

**Pattern:** Keep action simple, let cost items provide pricing.

---

## Why This Matters

### The Technical Issue:
Hardcoded costs are **static text** that doesn't adapt to:
- User's country
- Local currency
- Exchange rates
- Regional price differences
- Economic changes over time

### The User Impact:
A Barbados user seeing "JMD 300,000" will:
- ❌ Be confused (what's JMD?)
- ❌ Not know the BBD equivalent
- ❌ Lose trust in the system
- ❌ Question if content applies to them

### The Solution:
Our **dynamic cost item system**:
- ✅ Calculates costs per country
- ✅ Displays in local currency
- ✅ Uses current exchange rates
- ✅ Applies regional multipliers
- ✅ Updates automatically

---

## How to Show Costs Properly

### Link Cost Items to Action Steps:

```typescript
// Example: Hurricane shutters strategy
{
  smeAction: "Install hurricane shutters on all windows",
  costItems: [
    { 
      itemId: "hurricane_shutters_accordion", 
      quantity: 8,
      description: "Accordion-style hurricane shutters" 
    },
    { 
      itemId: "installation_professional", 
      quantity: 1,
      description: "Professional installation service"
    }
  ]
}
```

This automatically shows:
- **Jamaica:** J$ 45,000
- **Barbados:** Bds$ 675
- **Trinidad:** TT$ 2,250
- **Bahamas:** B$ 540

---

## Content Writing Guidelines

### For Real-World Examples:
- ✅ Focus on the **impact** and **outcome**
- ✅ Use comparisons like "significant," "substantial," "major"
- ✅ Describe **what was lost/saved** without exact amounts
- ❌ Don't mention specific dollar figures

### For Budget Alternatives:
- ✅ Describe the **method** and **materials**
- ✅ Note it's "more affordable," "budget-friendly," "cost-effective"
- ✅ Reference "see cost breakdown" or "check pricing"
- ❌ Don't compare exact costs (e.g., "$500 vs $5,000")

### For DIY Approaches:
- ✅ List **what's needed** (materials, tools, skills)
- ✅ Describe the **process** clearly
- ✅ Mention "significant savings possible"
- ❌ Don't itemize costs in the text

### For Action Steps:
- ✅ Keep instructions **action-focused**
- ✅ Let cost items handle all pricing
- ✅ Use phrases like "as needed" or "appropriate for your business"
- ❌ Don't include cost estimates

---

## Tools for Managing Costs

### Find Hardcoded Costs:
```bash
npx tsx scripts/find-hardcoded-costs.ts
```

Generates `hardcoded-costs-report.json` with:
- All occurrences
- Field locations
- Currency breakdown
- Full text context

### Fix Hardcoded Costs:
```bash
# Preview changes (safe)
npx tsx scripts/fix-hardcoded-costs.ts

# Apply changes (updates database)
npx tsx scripts/fix-hardcoded-costs.ts --live
```

Automatically replaces cost patterns with `[see cost breakdown]`.

---

## Quality Standards

### Before Submitting Strategy Content:

- [ ] No currency codes (JMD, USD, BBD, etc.)
- [ ] No currency symbols (J$, Bds$, $, etc.)
- [ ] No specific dollar amounts
- [ ] Cost items properly linked
- [ ] Text reads naturally without costs
- [ ] Success stories still compelling
- [ ] DIY instructions still clear
- [ ] Budget alternatives still explained

---

## Migration Checklist

When cleaning existing content:

1. **Identify** - Run find script
2. **Review** - Check each occurrence
3. **Categorize**:
   - Simple removal → use automated script
   - Needs rewrite → mark for manual editing
4. **Fix Simple** - Run automated script
5. **Fix Complex** - Manual rewrites
6. **Link Costs** - Add/verify cost items
7. **Test** - Check in UI across countries
8. **Verify** - Run find script again (should be 0)

---

## Common Mistakes to Avoid

### ❌ Don't Replace Cost with Placeholder Text:
**Bad:** "This costs [INSERT COST HERE]"
**Good:** "See cost breakdown below"

### ❌ Don't Use Currency Symbols Without Numbers:
**Bad:** "Costs around $$ (affordable)"
**Good:** "Affordable option available"

### ❌ Don't Reference Jamaica as Default:
**Bad:** "In Jamaica this costs..."
**Good:** "This typically requires..." (let cost system localize)

### ❌ Don't Approximate Costs:
**Bad:** "Around a few hundred dollars"
**Good:** "See detailed pricing"

---

## Testing After Changes

Verify costs display correctly:

1. **Jamaica Test:**
   - Should show J$ prefix
   - Amounts in JMD

2. **Barbados Test:**
   - Should show Bds$ prefix
   - Amounts in BBD

3. **Trinidad Test:**
   - Should show TT$ prefix
   - Amounts in TTD

4. **Other Countries:**
   - Correct currency for each
   - No hardcoded JMD visible

5. **Content Quality:**
   - Stories still make sense
   - Instructions still clear
   - No awkward gaps where costs were removed

---

## Quick Reference

| **Situation** | **Don't Write** | **Do Write** |
|---------------|-----------------|--------------|
| Success story | "saved JMD 300,000" | "avoided significant losses" |
| Budget option | "only $500 vs $5,000" | "much more affordable option" |
| DIY cost | "materials cost $250" | "affordable materials available" |
| Action step | "buy generator ($2,000)" | "purchase backup generator" |
| Comparison | "saves JMD 50,000" | "provides substantial savings" |

---

## Support

**Questions?** Review:
- `CURRENCY_SYSTEM_IMPLEMENTATION.md` - How cost system works
- `COST_ITEM_INTEGRATION_COMPLETE.md` - Linking cost items
- `scripts/README-sample-data.md` - Data structure examples

**Found hardcoded costs?** Run the scripts:
- `find-hardcoded-costs.ts` - Identify issues
- `fix-hardcoded-costs.ts` - Apply fixes

---

**Remember:** Every hardcoded cost confuses non-Jamaica users. Keep content universal, let the system handle localization.















# Multilingual Admin Implementation Guide

## Overview

This guide shows how to update the Strategy and Action Step admin forms to support full multilingual editing for all user-facing content.

## What Was Created

### 1. `MultilingualTextInput.tsx`
- Handles single-line and multi-line text fields
- Shows EN/ES/FR tabs
- Visual indicators for completion
- Stores data as JSON: `{"en": "...", "es": "...", "fr": "..."}`

### 2. `MultilingualArrayInput.tsx`  
- Handles arrays of text items (benefits, tips, mistakes)
- Parallel editing across all 3 languages
- Add/remove/edit items per language
- Warns if item counts don't match

## How to Update StrategyForm.tsx

### Step 1: Add Imports

```tsx
import { MultilingualTextInput } from './MultilingualTextInput'
import { MultilingualArrayInput } from './MultilingualArrayInput'
```

### Step 2: Replace Text Fields with Multilingual Versions

Find each text input in the form and replace with multilingual version:

#### Example 1: Single Line Text Field

**BEFORE:**
```tsx
<input
  type="text"
  value={formData.smeTitle || ''}
  onChange={(e) => setFormData({...formData, smeTitle: e.target.value})}
  className="..."
/>
```

**AFTER:**
```tsx
<MultilingualTextInput
  label="Strategy Title (User-Facing)"
  value={formData.smeTitle || ''}
  onChange={(value) => setFormData({...formData, smeTitle: value})}
  type="text"
  required={true}
  helpText="Benefit-focused title users will see in the wizard"
/>
```

#### Example 2: Multi-Line Text Field

**BEFORE:**
```tsx
<textarea
  value={formData.smeSummary || ''}
  onChange={(e) => setFormData({...formData, smeSummary: e.target.value})}
  className="..."
  rows={4}
/>
```

**AFTER:**
```tsx
<MultilingualTextInput
  label="Strategy Summary (User-Facing)"
  value={formData.smeSummary || ''}
  onChange={(value) => setFormData({...formData, smeSummary: value})}
  type="textarea"
  required={true}
  helpText="2-3 sentence plain language summary for SME owners"
/>
```

#### Example 3: Array Field

**BEFORE:**
```tsx
{/* Benefits */}
<input
  value={newBenefit}
  onChange={(e) => setNewBenefit(e.target.value)}
  placeholder="Add benefit..."
/>
<button onClick={() => {
  if (newBenefit) {
    setFormData({
      ...formData,
      benefitsBullets: [...(formData.benefitsBullets || []), newBenefit]
    })
    setNewBenefit('')
  }
}}>
  Add Benefit
</button>

{/* Display existing benefits */}
{formData.benefitsBullets?.map((benefit, index) => (
  <div key={index}>
    {benefit}
    <button onClick={() => {
      setFormData({
        ...formData,
        benefitsBullets: formData.benefitsBullets.filter((_, i) => i !== index)
      })
    }}>Remove</button>
  </div>
))}
```

**AFTER:**
```tsx
<MultilingualArrayInput
  label="Key Benefits"
  value={formData.benefitsBullets || []}
  onChange={(value) => setFormData({...formData, benefitsBullets: value})}
  required={true}
  helpText="Specific benefits users get from implementing this strategy"
  placeholder="Add benefit..."
  addButtonText="Add Benefit"
/>
```

## Complete Field Replacement List

### Strategy Fields (in StrategyForm.tsx)

Replace these fields with `MultilingualTextInput`:

1. ✅ **smeTitle** (type="text", required)
   - Label: "Strategy Title (User-Facing)"
   - Help: "Benefit-focused title users will see in the wizard"

2. ✅ **smeSummary** (type="textarea", required)
   - Label: "Strategy Summary (User-Facing)"
   - Help: "2-3 sentence plain language summary for SME owners"

3. ✅ **realWorldExample** (type="textarea")
   - Label: "Real World Success Story"
   - Help: "Caribbean business success story with names and outcomes"

4. ✅ **lowBudgetAlternative** (type="textarea")
   - Label: "Low Budget Alternative"
   - Help: "Cheaper approach for cash-constrained SMEs"

5. ✅ **diyApproach** (type="textarea")
   - Label: "DIY Approach"
   - Help: "How to implement without contractors"

6. ✅ **bcpTemplateText** (type="textarea")
   - Label: "BCP Template Text"
   - Help: "Pre-written paragraph for final BCP document"

7. ✅ **whyImportant** (type="textarea") - DEPRECATED but keep for compatibility
   - Label: "Why Important (Legacy)"
   - Help: "Kept for backward compatibility - use benefits instead"

Replace these with `MultilingualArrayInput`:

8. ✅ **benefitsBullets** (required)
   - Label: "Key Benefits"
   - Help: "Specific benefits users get from this strategy"

9. ✅ **helpfulTips**
   - Label: "Helpful Tips"
   - Help: "Practical tips for implementation"

10. ✅ **commonMistakes**
    - Label: "Common Mistakes to Avoid"
    - Help: "Mistakes SMEs often make with this strategy"

11. ✅ **successMetrics**
    - Label: "Success Metrics"
    - Help: "How users know if strategy is working"

### Action Step Fields

For each action step in the form, replace these fields:

Replace with `MultilingualTextInput`:

1. ✅ **title** (type="text", required)
   - Label: "Step Title"

2. ✅ **description** (type="textarea", required)
   - Label: "Step Description"

3. ✅ **whyThisStepMatters** (type="textarea")
   - Label: "Why This Step Matters"

4. ✅ **whatHappensIfSkipped** (type="textarea")
   - Label: "What Happens If Skipped"

5. ✅ **howToKnowItsDone** (type="textarea")
   - Label: "How To Know It's Done"

6. ✅ **exampleOutput** (type="textarea")
   - Label: "Example Output"

7. ✅ **freeAlternative** (type="textarea")
   - Label: "Free Alternative"

8. ✅ **lowTechOption** (type="textarea")
   - Label: "Low-Tech Option"

Replace with `MultilingualArrayInput`:

9. ✅ **commonMistakesForStep**
   - Label: "Common Mistakes for This Step"

## Admin-Only Fields (Keep Single Language)

These fields are for admin use only and don't need translation:

- ✅ **name** - Technical name for admin reference
- ✅ **description** - Technical description for admins
- ✅ **strategyId** - System identifier
- ✅ **category** - Dropdown selection
- ✅ **implementationCost**, **effectiveness**, etc. - Dropdown/numbers

## Implementation Steps

### Phase 1: Strategy Form (Priority 1)

1. Add component imports
2. Replace `smeTitle` field → `MultilingualTextInput`
3. Replace `smeSummary` field → `MultilingualTextInput`
4. Replace `benefitsBullets` → `MultilingualArrayInput`
5. Test: Create new strategy with all 3 languages

### Phase 2: Strategy Form (Priority 2)

6. Replace `realWorldExample` → `MultilingualTextInput`
7. Replace `lowBudgetAlternative` → `MultilingualTextInput`
8. Replace `diyApproach` → `MultilingualTextInput`
9. Replace `helpfulTips` → `MultilingualArrayInput`
10. Test: Edit existing strategy

### Phase 3: Strategy Form (Priority 3)

11. Replace `commonMistakes` → `MultilingualArrayInput`
12. Replace `bcpTemplateText` → `MultilingualTextInput`
13. Replace `whyImportant` (legacy) → `MultilingualTextInput`
14. Test: Verify backward compatibility with existing data

### Phase 4: Action Steps

15. Find action step editor section in StrategyForm
16. Replace all action step text fields with multilingual versions
17. Test: Add new action step with all languages

## Data Migration (Optional)

If you want to convert existing single-language data to multilingual format:

```tsx
// Migration utility function
function migrateSingleToMultilingual(existingValue: string | null | undefined): string {
  if (!existingValue) return JSON.stringify({ en: '', es: '', fr: '' })
  
  // If already multilingual, return as-is
  try {
    const parsed = JSON.parse(existingValue)
    if (parsed.en !== undefined) return existingValue
  } catch {}
  
  // Convert single string to multilingual (put in English)
  return JSON.stringify({
    en: existingValue,
    es: '', // Admin will need to fill
    fr: ''  // Admin will need to fill
  })
}

// Use in initialization:
useEffect(() => {
  if (strategy) {
    setFormData({
      ...strategy,
      smeTitle: migrateSingleToMultilingual(strategy.smeTitle),
      smeSummary: migrateSingleToMultilingual(strategy.smeSummary),
      // ... etc for all multilingual fields
    })
  }
}, [strategy])
```

## Validation

Add validation to ensure all languages are filled for required fields:

```tsx
const validateStrategy = (data: Strategy): string[] => {
  const errors: string[] = []
  
  // Helper to check if all languages are filled
  const isComplete = (value: string): boolean => {
    try {
      const parsed = JSON.parse(value)
      return !!(parsed.en && parsed.es && parsed.fr)
    } catch {
      return false
    }
  }
  
  if (!isComplete(data.smeTitle)) {
    errors.push('Strategy Title must be provided in all 3 languages')
  }
  
  if (!isComplete(data.smeSummary)) {
    errors.push('Strategy Summary must be provided in all 3 languages')
  }
  
  // Check array fields
  try {
    const benefits = JSON.parse(data.benefitsBullets || '[]')
    if (!benefits.en?.length || !benefits.es?.length || !benefits.fr?.length) {
      errors.push('Key Benefits must be provided in all 3 languages')
    }
  } catch {}
  
  return errors
}
```

## Testing Checklist

### After Implementation:

1. ✅ Create new strategy
   - Fill all 3 languages for required fields
   - Save and verify data stored correctly

2. ✅ Edit existing strategy
   - Verify existing single-language data loads
   - Add missing translations
   - Save and verify

3. ✅ Test in wizard (ES)
   - Switch to Spanish
   - Go through wizard
   - Verify Spanish content displays

4. ✅ Test in wizard (FR)
   - Switch to French
   - Go through wizard
   - Verify French content displays

5. ✅ Test array fields
   - Add multiple benefits in each language
   - Verify parallel display
   - Remove items, verify updates

6. ✅ Test validation
   - Try to save without all languages
   - Verify warning shows
   - Fill missing languages, verify saves

## Benefits

### For Admins:
- ✅ Clear visual feedback on translation completion
- ✅ Easy language switching with tabs
- ✅ Item-by-item editing for arrays
- ✅ Validation ensures completeness

### For Users:
- ✅ All content available in their language
- ✅ No English fallbacks needed
- ✅ Professional multilingual experience

### Technical:
- ✅ No database migration required
- ✅ Backward compatible with existing data
- ✅ Gradual rollout possible (field by field)
- ✅ Works with existing `getLocalizedText()` utility

## Example: Before & After

### Before (Single Language):
```
Admin sees:
┌─────────────────────────────┐
│ Strategy Title:             │
│ [Stay Connected]            │  ← English only!
└─────────────────────────────┘

User sees (in Spanish):
"Stay Connected"  ← ❌ Still English!
```

### After (Multilingual):
```
Admin sees:
[EN] [ES] [FR]  ← Language tabs
┌─────────────────────────────┐
│ Strategy Title:        🇬🇧✓🇪🇸✓🇫🇷✓  ← Completion indicators
│ [Stay Connected...]         │
│ (Currently editing: English)│
└─────────────────────────────┘

User sees (in Spanish):
"Manténgase Conectado"  ← ✅ Proper Spanish!
```

## Next Steps

1. ✅ Components created (MultilingualTextInput, MultilingualArrayInput)
2. ⏳ **Update StrategyForm.tsx** (this is the main task)
3. ⏳ Update Action Step inline editor (if separate component)
4. ⏳ Add validation
5. ⏳ Test thoroughly
6. ⏳ Optional: Create migration script for existing data

The components are ready - now just need to replace the fields in StrategyForm.tsx!



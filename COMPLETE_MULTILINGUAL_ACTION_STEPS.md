# Complete Guide: Action Step Multilingual Support

## Quick Reference

You now have fully functional multilingual components that have been successfully integrated for **strategy-level fields**. This guide shows exactly how to complete the **action step fields**.

## Components Ready to Use

- ✅ `src/components/admin2/MultilingualTextInput.tsx`
- ✅ `src/components/admin2/MultilingualArrayInput.tsx`
- ✅ Already imported in `StrategyForm.tsx`

## Action Step Fields to Convert

The action step editor is located in `src/components/admin2/StrategyForm.tsx` starting around line 1022.

### 9 Fields Need Conversion:

| Line # (approx) | Field Name | Current Type | Priority |
|-----------------|------------|--------------|----------|
| ~1070-1095 | `title` or `smeAction` | input/textarea | 🔴 Critical |
| ~1085-1092 | `description` or `action` | textarea | 🔴 Critical |
| ~1106 | `whyThisStepMatters` | textarea | 🟡 High |
| ~1120 | `whatHappensIfSkipped` | textarea | 🟡 High |
| ~1187 | `howToKnowItsDone` | textarea | 🟡 High |
| ~1201 | `exampleOutput` | textarea | 🟡 High |
| ~1224 | `freeAlternative` | textarea | 🟢 Medium |
| ~1238 | `lowTechOption` | textarea | 🟢 Medium |
| ~1326 | `commonMistakesForStep` | array | 🟢 Medium |

## Search & Replace Templates

### Pattern 1: Simple Textarea Field

**Search for pattern like:**
```tsx
<textarea
  value={step.FIELD_NAME || ''}
  onChange={(e) => updateActionStep(index, 'FIELD_NAME', e.target.value)}
  rows={X}
  placeholder="..."
  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
/>
```

**Replace with:**
```tsx
<MultilingualTextInput
  label="FIELD LABEL"
  value={step.FIELD_NAME || ''}
  onChange={(value) => updateActionStep(index, 'FIELD_NAME', value)}
  type="textarea"
  required={true}  // or false for optional fields
  helpText="Help text description"
  placeholder="..."
/>
```

### Pattern 2: Array Field (commonMistakesForStep)

**Search for the entire commonMistakesForStep section** (lines ~1323-1365):
```tsx
<label className="block text-sm font-medium text-gray-700 mb-1">
  Common Mistakes for This Step 🆕
</label>
<div className="space-y-2">
  {(step.commonMistakesForStep || []).map((mistake, mIndex) => (
    // ... existing map/display logic
  ))}
  <div className="flex space-x-2">
    // ... existing add input
  </div>
</div>
```

**Replace with:**
```tsx
<MultilingualArrayInput
  label="Common Mistakes for This Step 🆕"
  value={step.commonMistakesForStep || []}
  onChange={(value) => updateActionStep(index, 'commonMistakesForStep', value)}
  helpText="Step-specific mistakes users often make"
  placeholder="Add a common mistake..."
  addButtonText="Add Mistake"
/>
```

## Specific Field Conversions

### 1. Title/SME Action (Critical - Line ~1070-1085)

```tsx
// Current (find something like this):
<label>Step Title / SME Action</label>
<input
  type="text"
  value={step.title || step.smeAction || ''}
  onChange={(e) => updateActionStep(index, 'title', e.target.value)}
  // or
  onChange={(e) => updateActionStep(index, 'smeAction', e.target.value)}
  className="..."
/>

// Replace with:
<MultilingualTextInput
  label="Step Title (User-Facing)"
  value={step.title || step.smeAction || ''}
  onChange={(value) => updateActionStep(index, 'title', value)}
  type="text"
  required={true}
  helpText="Clear, action-oriented title users will see"
  placeholder="e.g., Create emergency contact list"
/>
```

### 2. Description (Critical - Line ~1082-1092)

```tsx
// Current:
<label>Action Description (Technical)</label>
<textarea
  value={step.action || step.description || ''}
  onChange={(e) => updateActionStep(index, 'description', e.target.value)}
  rows={2}
  className="..."
/>

// Replace with:
<MultilingualTextInput
  label="Action Description"
  value={step.description || step.action || ''}
  onChange={(value) => updateActionStep(index, 'description', value)}
  type="textarea"
  required={true}
  helpText="Detailed step-by-step instructions"
  placeholder="Explain exactly what to do..."
/>
```

### 3. Why This Step Matters (High Priority - Line ~1106)

```tsx
// Current (line ~1102-1113):
<label className="block text-sm font-medium text-gray-700 mb-1">
  Why This Step Matters 🎯
</label>
<textarea
  value={step.whyThisStepMatters || ''}
  onChange={(e) => updateActionStep(index, 'whyThisStepMatters', e.target.value)}
  rows={2}
  placeholder="e.g., 'A proper template ensures you don't forget important information...'"
  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
/>
<p className="text-xs text-gray-500 mt-1">Explain the importance in plain language</p>

// Replace with:
<MultilingualTextInput
  label="Why This Step Matters 🎯"
  value={step.whyThisStepMatters || ''}
  onChange={(value) => updateActionStep(index, 'whyThisStepMatters', value)}
  type="textarea"
  helpText="Explain the importance in plain language"
  placeholder="e.g., 'A proper template ensures you don't forget important information...'"
/>
```

### 4. What Happens If Skipped (High Priority - Line ~1120)

```tsx
// Current (line ~1115-1127):
<label className="block text-sm font-medium text-gray-700 mb-1">
  What Happens If Skipped ⚠️
</label>
<textarea
  value={step.whatHappensIfSkipped || ''}
  onChange={(e) => updateActionStep(index, 'whatHappensIfSkipped', e.target.value)}
  rows={2}
  placeholder="e.g., 'You'll waste time figuring out what info you need during the crisis...'"
  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
/>
<p className="text-xs text-gray-500 mt-1">Consequences of not doing this step</p>

// Replace with:
<MultilingualTextInput
  label="What Happens If Skipped ⚠️"
  value={step.whatHappensIfSkipped || ''}
  onChange={(value) => updateActionStep(index, 'whatHappensIfSkipped', value)}
  type="textarea"
  helpText="Consequences of not doing this step"
  placeholder="e.g., 'You'll waste time figuring out what info you need...'"
/>
```

### 5. How to Know It's Done (High Priority - Line ~1187)

```tsx
// Current (line ~1182-1194):
<label className="block text-sm font-medium text-gray-700 mb-1">
  How to Know It's Done ✅
</label>
<textarea
  value={step.howToKnowItsDone || ''}
  onChange={(e) => updateActionStep(index, 'howToKnowItsDone', e.target.value)}
  rows={2}
  placeholder="e.g., 'Your template has Name, Phone, WhatsApp, Email fields'"
  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
/>
<p className="text-xs text-gray-500 mt-1">Clear completion criteria</p>

// Replace with:
<MultilingualTextInput
  label="How to Know It's Done ✅"
  value={step.howToKnowItsDone || ''}
  onChange={(value) => updateActionStep(index, 'howToKnowItsDone', value)}
  type="textarea"
  helpText="Clear completion criteria"
  placeholder="e.g., 'Your template has Name, Phone, WhatsApp, Email fields'"
/>
```

### 6. Example Output (High Priority - Line ~1201)

```tsx
// Current (line ~1196-1208):
<label className="block text-sm font-medium text-gray-700 mb-1">
  Example Output 📄
</label>
<textarea
  value={step.exampleOutput || ''}
  onChange={(e) => updateActionStep(index, 'exampleOutput', e.target.value)}
  rows={2}
  placeholder="e.g., 'A simple table with columns for Name, Mobile, WhatsApp...'"
  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
/>
<p className="text-xs text-gray-500 mt-1">What the finished result looks like</p>

// Replace with:
<MultilingualTextInput
  label="Example Output 📄"
  value={step.exampleOutput || ''}
  onChange={(value) => updateActionStep(index, 'exampleOutput', value)}
  type="textarea"
  helpText="What the finished result looks like"
  placeholder="e.g., 'A simple table with columns for Name, Mobile, WhatsApp...'"
/>
```

### 7. Free Alternative (Medium Priority - Line ~1224)

```tsx
// Current (line ~1219-1231):
<label className="block text-sm font-medium text-gray-700 mb-1">
  Free Alternative
</label>
<textarea
  value={step.freeAlternative || ''}
  onChange={(e) => updateActionStep(index, 'freeAlternative', e.target.value)}
  rows={2}
  placeholder="e.g., 'Use a simple paper notebook or create a free Google Sheet'"
  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
/>
<p className="text-xs text-gray-500 mt-1">Free or low-cost option</p>

// Replace with:
<MultilingualTextInput
  label="Free Alternative"
  value={step.freeAlternative || ''}
  onChange={(value) => updateActionStep(index, 'freeAlternative', value)}
  type="textarea"
  helpText="Free or low-cost option"
  placeholder="e.g., 'Use a simple paper notebook or create a free Google Sheet'"
/>
```

### 8. Low-Tech Option (Medium Priority - Line ~1238)

```tsx
// Current (line ~1233-1245):
<label className="block text-sm font-medium text-gray-700 mb-1">
  Low-Tech Option
</label>
<textarea
  value={step.lowTechOption || ''}
  onChange={(e) => updateActionStep(index, 'lowTechOption', e.target.value)}
  rows={2}
  placeholder="e.g., 'Draw a simple table in a notebook'"
  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
/>
<p className="text-xs text-gray-500 mt-1">Non-digital alternative</p>

// Replace with:
<MultilingualTextInput
  label="Low-Tech Option"
  value={step.lowTechOption || ''}
  onChange={(value) => updateActionStep(index, 'lowTechOption', value)}
  type="textarea"
  helpText="Non-digital alternative"
  placeholder="e.g., 'Draw a simple table in a notebook'"
/>
```

### 9. Common Mistakes for Step (Medium Priority - Line ~1323-1365)

**This is a larger section with add/remove logic. Replace the entire section:**

```tsx
// Current (the whole section from line ~1319-1365):
<div className="bg-red-50 border border-red-200 rounded-lg p-3">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Common Mistakes for This Step 🆕
  </label>
  <div className="space-y-2">
    {(step.commonMistakesForStep || []).map((mistake, mIndex) => (
      <div key={mIndex} className="flex items-center space-x-2">
        <span className="flex-1 text-sm bg-red-50 p-2 rounded border border-red-200">
          ✗ {mistake}
        </span>
        <button
          type="button"
          onClick={() => {
            const newMistakes = [...(step.commonMistakesForStep || [])]
            newMistakes.splice(mIndex, 1)
            updateActionStep(index, 'commonMistakesForStep', newMistakes)
          }}
          className="text-red-600 hover:text-red-800 text-sm px-2"
        >
          ✕
        </button>
      </div>
    ))}
    <input
      type="text"
      placeholder="Add a common mistake..."
      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          const input = e.target as HTMLInputElement
          if (input.value.trim()) {
            const newMistakes = [...(step.commonMistakesForStep || []), input.value.trim()]
            updateActionStep(index, 'commonMistakesForStep', newMistakes)
            input.value = ''
          }
        }
      }}
    />
  </div>
</div>

// Replace with:
<div className="bg-red-50 border border-red-200 rounded-lg p-3">
  <MultilingualArrayInput
    label="Common Mistakes for This Step 🆕"
    value={step.commonMistakesForStep || []}
    onChange={(value) => updateActionStep(index, 'commonMistakesForStep', value)}
    helpText="Step-specific mistakes users often make"
    placeholder="Add a common mistake..."
    addButtonText="Add Mistake"
  />
</div>
```

## Step-by-Step Implementation

### Phase 1: Critical Fields (Do First)
1. Open `src/components/admin2/StrategyForm.tsx`
2. Search for line ~1070 (Step Title/SME Action field)
3. Replace with `MultilingualTextInput`
4. Search for line ~1082 (Description field)
5. Replace with `MultilingualTextInput`
6. Test: Create new strategy, add action step, verify tabs work

### Phase 2: High Priority Fields
7. Replace `whyThisStepMatters` (~line 1106)
8. Replace `whatHappensIfSkipped` (~line 1120)
9. Replace `howToKnowItsDone` (~line 1187)
10. Replace `exampleOutput` (~line 1201)
11. Test: Verify all fields show EN/ES/FR tabs

### Phase 3: Medium Priority Fields
12. Replace `freeAlternative` (~line 1224)
13. Replace `lowTechOption` (~line 1238)
14. Replace `commonMistakesForStep` (~line 1323-1365)
15. Final test: Complete workflow in all 3 languages

## Testing Checklist

After each replacement:

- [ ] Component renders without errors
- [ ] Can switch between EN/ES/FR tabs
- [ ] Can type text in each language
- [ ] Completion indicators show correctly (🇬🇧✓ 🇪🇸✓ 🇫🇷✓)
- [ ] Data saves correctly
- [ ] Can reload and edit existing data

After all replacements:

- [ ] Create new strategy with action steps in all 3 languages
- [ ] Save and reload - verify all data preserved
- [ ] Test wizard in Spanish - verify action steps show in Spanish
- [ ] Test wizard in French - verify action steps show in French
- [ ] Test with partial translations - verify warnings show

## Expected Result

### Before:
Admin can only edit action steps in one language (English).

### After:
Admin can edit every action step field in all 3 languages with clear visual feedback.

### User Benefit:
When users select Spanish or French in the wizard, they see:
- Strategy titles in their language ✅
- Strategy descriptions in their language ✅
- Benefits in their language ✅
- Action step titles in their language ✅
- Action step instructions in their language ✅
- Tips and examples in their language ✅

**100% multilingual business continuity planning experience!**

---

**Time Estimate:** 30-45 minutes to complete all action step fields  
**Difficulty:** Easy (just find & replace with provided templates)  
**Risk:** Low (changes are additive, existing functionality preserved)



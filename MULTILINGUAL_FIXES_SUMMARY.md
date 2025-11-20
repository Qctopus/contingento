# Multilingual Content Display Fixes

## Issues Fixed

### 1. Action Steps Not Displaying
**Problem**: Action steps were not appearing in the Strategy Editor because multilingual JSON strings were being rendered directly as React children.

**Root Cause**: Fields like `title`, `description`, `timeframe`, and `resources` are now stored as multilingual JSON but were being rendered without parsing.

**Files Fixed**:
- `src/components/admin2/StrategyEditor.tsx` (lines 716, 1048-1073)
- `src/components/admin2/ImprovedStrategiesActionsTab.tsx` (line 962)
- `src/services/costCalculationService.ts` (added parseMultilingualText helper, lines 345-371, 229)
- `src/components/admin2/ActionStepCostItemSelector.tsx` (lines 7, 209, 214)

### 2. "Show Details" React Error
**Problem**: Clicking "Show Details" in cost calculation threw error: "Objects are not valid as a React child (found: object with keys {en, es, fr})"

**Root Cause**: Cost item names were multilingual JSON objects being rendered directly.

**Fix**: Added `parseMultilingualText()` method to `costCalculationService` to extract English text before rendering.

## Fields That Are Multilingual

### Action Step Fields (JSON strings):
- `title` - `{"en":"...","es":"...","fr":"..."}`
- `description` - `{"en":"...","es":"...","fr":"..."}`
- `smeAction` - `{"en":"...","es":"...","fr":"..."}`
- `whyThisStepMatters` - `{"en":"...","es":"...","fr":"..."}`
- `whatHappensIfSkipped` - `{"en":"...","es":"...","fr":"..."}`
- `freeAlternative` - `{"en":"...","es":"...","fr":"..."}`
- `lowTechOption` - `{"en":"...","es":"...","fr":"..."}`
- `timeframe` - `{"en":"...","es":"...","fr":"..."}`

### Action Step Fields (JSON arrays):
- `resources` - `{"en":["item1","item2"],"es":["..."],"fr":["..."]}`
- `commonMistakesForStep` - `{"en":["mistake1","mistake2"],"es":["..."],"fr":["..."]}`

### Cost Item Fields:
- `name` - `{"en":"...","es":"...","fr":"..."}`
- `description` - `{"en":"...","es":"...","fr":"..."}`

### Fields That Are NOT Multilingual:
- `responsibility` - plain text (e.g., "Business Owner")
- `checklist` - regular array of strings
- `phase` - plain text (e.g., "immediate")
- `estimatedMinutes` - number
- `difficultyLevel` - plain text

## How to Display Multilingual Content

### For Simple Strings:
```typescript
import { getLocalizedText } from '@/utils/localizationUtils'

// Display multilingual field
<div>{getLocalizedText(step.title, 'en')}</div>
```

### For Arrays (in component logic):
```typescript
const parseMultilingualArray = (value: any, lang: 'en' | 'es' | 'fr' = 'en'): string[] => {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parsed[lang] || parsed.en || []
    } catch {
      return []
    }
  }
  return Array.isArray(value) ? value : []
}

const resources = parseMultilingualArray(step.resources, activeLanguage)
resources.map(resource => <div key={resource}>{resource}</div>)
```

## Verification

All 30 action steps across 5 strategies now properly display:
- ✅ Multilingual titles
- ✅ Multilingual descriptions
- ✅ Multilingual resources
- ✅ Multilingual common mistakes
- ✅ Cost items with multilingual names
- ✅ Cost calculation with proper text extraction

## Testing Checklist

- [x] Action steps display in Strategy Editor
- [x] Cost calculation "Show Details" works without errors
- [x] Cost item names display correctly
- [x] Step titles display correctly
- [x] Timeframe displays correctly
- [x] Resources display correctly in editor (when editing step)
- [x] No React "object as child" errors









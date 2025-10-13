# Multilingual Strategy & Action Step Analysis

## Current Problem

The admin cannot fully edit all user-facing content in all three languages. Only partial multilingual support exists.

## Root Cause

### Database Schema (Prisma)
All user-facing text fields in `RiskMitigationStrategy` and `ActionStep` are defined as **plain String** types:

```prisma
model RiskMitigationStrategy {
  name                   String   // ❌ Single language only
  description            String   // ❌ Single language only
  smeTitle               String?  // ❌ Single language only
  smeSummary             String?  // ❌ Single language only
  benefitsBullets        String?  // ❌ JSON array, but single language
  realWorldExample       String?  // ❌ Single language only
  lowBudgetAlternative   String?  // ❌ Single language only
  diyApproach            String?  // ❌ Single language only
  bcpTemplateText        String?  // ❌ Single language only
  helpfulTips            String?  // ❌ JSON array, but single language
  commonMistakes         String?  // ❌ JSON array, but single language
  // ... etc
}

model ActionStep {
  title                  String   // ❌ Single language only
  description            String   // ❌ Single language only
  smeAction              String?  // ❌ Single language only
  whyThisStepMatters     String?  // ❌ Single language only
  whatHappensIfSkipped   String?  // ❌ Single language only
  howToKnowItsDone       String?  // ❌ Single language only
  exampleOutput          String?  // ❌ Single language only
  freeAlternative        String?  // ❌ Single language only
  lowTechOption          String?  // ❌ Single language only
  commonMistakesForStep  String?  // ❌ JSON array, but single language
  // ... etc
}
```

### Admin Form
The admin form (`StrategyForm.tsx`) only shows **single text inputs** - no multilingual editing:

```tsx
// Current: Single language input
<textarea
  value={formData.smeTitle}
  onChange={(e) => setFormData({...formData, smeTitle: e.target.value})}
/>

// What we need: Three language tabs
```

### Display Side (Wizard)
The wizard uses `getLocalizedText()` which CAN handle multilingual objects:
```ts
// ✅ This works IF data is structured properly
getLocalizedText(strategy.smeTitle, locale)
// Can handle: "Title" (plain string) OR {"en": "Title", "es": "Título", "fr": "Titre"}
```

## What Users See in Wizard

### Strategy Fields Shown to Users:
1. **name** / **smeTitle** - Main title ⚠️ NEEDS TRANSLATION
2. **smeSummary** / **description** - Description ⚠️ NEEDS TRANSLATION
3. **benefitsBullets** - Array of benefits ⚠️ NEEDS TRANSLATION (each item)
4. **realWorldExample** - Success story ⚠️ NEEDS TRANSLATION
5. **lowBudgetAlternative** - Budget option ⚠️ NEEDS TRANSLATION
6. **diyApproach** - DIY instructions ⚠️ NEEDS TRANSLATION
7. **helpfulTips** - Array of tips ⚠️ NEEDS TRANSLATION (each item)
8. **commonMistakes** - Array of mistakes ⚠️ NEEDS TRANSLATION (each item)
9. **whyImportant** - Legacy field ⚠️ NEEDS TRANSLATION
10. **costEstimateJMD** - Cost estimate (could be multilingual for different currencies)
11. **timeToImplement** - Time description (could be multilingual)
12. **reasoning** - Generated, already handled by API ✅
13. **applicableRisks** - Risk IDs (not user-facing text, just tags)

### Action Step Fields Shown to Users:
1. **title** - Step title ⚠️ NEEDS TRANSLATION
2. **description** / **smeAction** - Step description ⚠️ NEEDS TRANSLATION
3. **whyThisStepMatters** - Importance explanation ⚠️ NEEDS TRANSLATION
4. **whatHappensIfSkipped** - Consequence text ⚠️ NEEDS TRANSLATION
5. **howToKnowItsDone** - Completion criteria ⚠️ NEEDS TRANSLATION
6. **exampleOutput** - Example result ⚠️ NEEDS TRANSLATION
7. **freeAlternative** - Free option ⚠️ NEEDS TRANSLATION
8. **lowTechOption** - Low-tech approach ⚠️ NEEDS TRANSLATION
9. **commonMistakesForStep** - Array of mistakes ⚠️ NEEDS TRANSLATION (each item)
10. **difficultyLevel** - "easy"/"medium"/"hard" (could use translation keys)
11. **estimatedMinutes** - Number (not text, but label could be localized)

## Total Fields Needing Multilingual Support

### Per Strategy: **13 text fields**
### Per Action Step: **9 text fields**

For a strategy with 5 action steps: **13 + (9 × 5) = 58 multilingual text fields!**

## Proposed Solution

### ✅ What Works (No Database Changes)
- Database fields remain `String` type
- Store multilingual content as JSON: `{"en": "...", "es": "...", "fr": "..."}`
- `getLocalizedText()` already handles this
- Backward compatible: Plain strings still work as fallback

### 🔧 What Needs to Change

#### 1. Admin Form - Add Multilingual Editor Component

Create a reusable `MultilingualTextInput` component:

```tsx
<MultilingualTextInput
  label="Strategy Title"
  value={formData.smeTitle}
  onChange={(value) => setFormData({...formData, smeTitle: value})}
  type="text" // or "textarea" or "rich-text"
/>

// Renders as:
[EN] [ES] [FR]  <-- Language tabs
┌────────────────────────┐
│ Enter English text...  │
└────────────────────────┘
```

#### 2. Admin Form - Update All Text Fields

Replace ALL text inputs with multilingual versions:
- Single line text → `MultilingualTextInput type="text"`
- Multi-line text → `MultilingualTextInput type="textarea"`
- Array fields → `MultilingualArrayInput` (for tips, benefits, mistakes)

#### 3. Data Structure

Stored in database as JSON string:
```json
{
  "smeTitle": "{\"en\":\"Stay Connected During Emergencies\",\"es\":\"Manténgase Conectado Durante Emergencias\",\"fr\":\"Restez Connecté Pendant les Urgences\"}",
  "smeSummary": "{\"en\":\"Keep your business running...\",\"es\":\"Mantenga su negocio funcionando...\",\"fr\":\"Gardez votre entreprise en marche...\"}"
}
```

Parsed and used:
```tsx
getLocalizedText(strategy.smeTitle, 'es')
// Returns: "Manténgase Conectado Durante Emergencias"
```

## Implementation Priority

### Phase 1: Core User-Facing Content (Highest Priority)
1. ✅ smeTitle (strategy title users see)
2. ✅ smeSummary (description users see)
3. ✅ benefitsBullets (key benefits list)
4. ✅ title (action step titles)
5. ✅ description (action step descriptions)

### Phase 2: Important Context (High Priority)
6. ✅ realWorldExample (success stories)
7. ✅ whyThisStepMatters (action step importance)
8. ✅ lowBudgetAlternative (budget options)
9. ✅ diyApproach (DIY instructions)
10. ✅ helpfulTips (tips arrays)

### Phase 3: Additional Guidance (Medium Priority)
11. ✅ commonMistakes (mistakes to avoid)
12. ✅ whatHappensIfSkipped (consequences)
13. ✅ howToKnowItsDone (completion criteria)
14. ✅ exampleOutput (example results)
15. ✅ freeAlternative (free options)
16. ✅ lowTechOption (low-tech approaches)

### Phase 4: Admin-Facing Content (Lower Priority)
- name (admin-only technical name - could stay English)
- description (admin-only technical description - could stay English)

## Benefits of This Approach

### ✅ Pros:
1. **No database migration needed** - fields stay as String
2. **Backward compatible** - plain strings still work
3. **Flexible** - can store any JSON structure
4. **Already supported** - `getLocalizedText()` handles it
5. **Gradual rollout** - can update fields incrementally

### ⚠️ Considerations:
1. **Database queries** - can't query JSON content directly (but we rarely do)
2. **Field size** - multilingual content = 3x storage (manageable for text)
3. **Admin UX** - need good tabbed interface for 3 languages
4. **Validation** - need to ensure all 3 languages are filled

## Next Steps

1. Create `MultilingualTextInput` component
2. Create `MultilingualArrayInput` component (for arrays like tips, benefits)
3. Update `StrategyForm.tsx` to use multilingual inputs
4. Update `ActionStepForm` (if separate) or inline editors
5. Add validation to ensure all 3 languages are filled
6. Update existing data migration script (optional - to convert existing content)

## Example Implementation

### MultilingualTextInput Component:
```tsx
const MultilingualTextInput = ({ 
  label, 
  value, 
  onChange, 
  type = 'text',
  required = false 
}) => {
  const [activeTab, setActiveTab] = useState('en')
  
  // Parse JSON or use as plain string
  const parsedValue = useMemo(() => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value
    } catch {
      return { en: value || '', es: '', fr: '' }
    }
  }, [value])
  
  const handleChange = (lang, text) => {
    const updated = { ...parsedValue, [lang]: text }
    onChange(JSON.stringify(updated))
  }
  
  return (
    <div>
      <label>{label}</label>
      <div className="flex gap-2 mb-2">
        <button onClick={() => setActiveTab('en')} 
                className={activeTab === 'en' ? 'active' : ''}>
          🇬🇧 EN
        </button>
        <button onClick={() => setActiveTab('es')}
                className={activeTab === 'es' ? 'active' : ''}>
          🇪🇸 ES
        </button>
        <button onClick={() => setActiveTab('fr')}
                className={activeTab === 'fr' ? 'active' : ''}>
          🇫🇷 FR
        </button>
      </div>
      
      {type === 'textarea' ? (
        <textarea
          value={parsedValue[activeTab] || ''}
          onChange={(e) => handleChange(activeTab, e.target.value)}
          placeholder={`Enter ${activeTab.toUpperCase()} text...`}
        />
      ) : (
        <input
          type="text"
          value={parsedValue[activeTab] || ''}
          onChange={(e) => handleChange(activeTab, e.target.value)}
          placeholder={`Enter ${activeTab.toUpperCase()} text...`}
        />
      )}
      
      {required && (!parsedValue.en || !parsedValue.es || !parsedValue.fr) && (
        <span className="text-red-500">⚠️ All languages required</span>
      )}
    </div>
  )
}
```

This approach gives full multilingual editing capability without database changes!



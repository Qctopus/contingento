# Multilingual Content System Guide

## 📊 Current Multilingual Status

### ✅ Fully Multilingual (EN/ES/FR)

#### Business Types
- `name` - Business type name
- `description` - Business type description
- `exampleBusinessPurposes` - Example purposes for wizard
- `exampleProducts` - Example products/services
- `exampleKeyPersonnel` - Example key personnel roles
- `exampleCustomerBase` - Example customer segments
- `minimumEquipment` - Example minimum equipment

**Admin2 Editor**: `BusinessTypeEditor.tsx` - Has full language switcher

#### Strategies (RiskMitigationStrategy)
- `name` - Strategy name
- `description` - Strategy description
- `smeDescription` - Simplified description for SMEs
- `whyImportant` - Why this strategy matters

**Storage Format**: JSON string `{"en":"...","es":"...","fr":"..."}`

#### Action Steps (ActionStep)
- `title` - Action step title
- `description` - Action step description
- `smeAction` - Simplified action for SMEs

**Storage Format**: JSON string `{"en":"...","es":"...","fr":"..."}`

#### Risk Multipliers (RiskMultiplier)
- `name` - Multiplier name
- `description` - Multiplier description
- `wizardQuestion` - Question shown to users in wizard
- `wizardAnswerOptions` - Answer choices (JSON array with multilingual labels)
- `wizardHelpText` - Additional help text for users
- `reasoning` - Why this multiplier exists

**Storage Format**: JSON string `{"en":"...","es":"...","fr":"..."}`

**Dynamic Behavior**: Only multipliers with `isActive: true` show their questions in the wizard

---

## 🎨 How to Edit Multilingual Content

### Business Types (Working ✅)
1. Go to Admin2 → Business Types
2. Click on a business type to edit
3. Switch between EN/ES/FR tabs
4. Edit examples in each language
5. Auto-saves as you type

### Strategies & Action Steps (Working ✅)

**Current State**:
- Data IS multilingual in database ✅
- Wizard DOES localize content ✅
- Admin2 UI HAS language switcher ✅

**To Edit**:
1. Go to Admin2 → Strategies & Actions
2. Click on a strategy to edit
3. In the "Basic Info" tab: Switch between EN/ES/FR to edit strategy name
4. In the "Descriptions" tab: Switch between EN/ES/FR to edit all descriptions
5. In the "Actions" tab: Click "Edit" on any action step, then switch between EN/ES/FR
6. Auto-saves as you type

**Alternatively, use population script** `scripts/populate-complete-risk-system.js` to bulk update strategies:

```javascript
{
  strategy: {
    strategyId: 'hurricane_preparation',
    name: JSON.stringify({
      en: 'Hurricane Preparedness',
      es: 'Preparación para Huracanes',
      fr: 'Préparation aux Ouragans'
    }),
    description: JSON.stringify({
      en: 'Protect your building before hurricane season',
      es: 'Proteja su edificio antes de la temporada de huracanes',
      fr: 'Protégez votre bâtiment avant la saison des ouragans'
    })
  },
  actionSteps: [
    {
      smeAction: JSON.stringify({
        en: 'Get metal shutters to cover windows',
        es: 'Instale persianas metálicas para cubrir ventanas',
        fr: 'Installez des volets métalliques pour couvrir les fenêtres'
      })
    }
  ]
}
```

---

## 🧙 Wizard Localization (Working ✅)

The wizard API at `/api/wizard/prepare-prefill-data` automatically localizes content based on the `locale` parameter:

```typescript
// Strategies
name: getLocalizedText(strategy.name, locale) 
description: getLocalizedText(strategy.description, locale)

// Action Steps
title: getLocalizedText(step.title, locale)
description: getLocalizedText(step.description, locale)
smeAction: getLocalizedText(step.smeAction, locale)
```

**Helper Function**:
```typescript
function getLocalizedText(jsonString: string, locale: 'en' | 'es' | 'fr'): string {
  try {
    const parsed = JSON.parse(jsonString)
    return parsed[locale] || parsed.en || jsonString
  } catch {
    return jsonString // Fallback to original
  }
}
```

---

## 📝 Adding Translations

### Option 1: Direct Database Update (Advanced)
```javascript
await prisma.riskMitigationStrategy.update({
  where: { strategyId: 'hurricane_preparation' },
  data: {
    name: JSON.stringify({
      en: 'Hurricane Preparedness & Property Protection',
      es: 'Preparación para Huracanes y Protección de Propiedades',
      fr: 'Préparation aux Ouragans et Protection des Propriétés'
    })
  }
})
```

### Option 2: Re-run Population Script (Simple)
Edit `scripts/populate-complete-risk-system.js` with new translations and run:
```bash
node scripts/populate-complete-risk-system.js
```

### Option 3: Admin2 UI (Future Enhancement)
TODO: Update `StrategyEditor.tsx` to include:
- Language switcher tabs (EN/ES/FR)
- Multilingual input fields for name, description
- Multilingual action step editor

---

## 🔄 Localization Flow

```
User selects language → 
Wizard requests prefill data with locale →
API fetches strategies/actions from DB →
API parses JSON and extracts locale-specific text →
User sees content in their language ✨
```

### Example:
**Database** (JSON string):
```json
{
  "name": "{\"en\":\"Fire Detection\",\"es\":\"Detección de Incendios\",\"fr\":\"Détection d'Incendie\"}"
}
```

**Wizard API** (locale=es):
```javascript
const parsed = JSON.parse(strategy.name) // {en: "...", es: "...", fr: "..."}
const localized = parsed.es // "Detección de Incendios"
```

**User Sees**: "Detección de Incendios"

---

## ✅ Verification Checklist

- [x] Business types have multilingual examples
- [x] Admin2 can edit business type examples in all languages
- [x] Strategies have multilingual name and description
- [x] Action steps have multilingual smeAction
- [x] Multipliers have multilingual wizard questions
- [x] Wizard API localizes all content
- [x] Database stores JSON with {en, es, fr}
- [x] Admin2 can edit strategy translations with language switcher
- [x] Admin2 can edit action step translations with language switcher
- [x] Wizard dynamically shows/hides questions based on active multipliers

---

## 🎯 Current User Experience

### English User
1. Selects "en" locale
2. Sees: "Hurricane Preparedness & Property Protection"
3. Action: "Get metal shutters or plywood boards to cover windows"

### Spanish User
1. Selects "es" locale  
2. Sees: "Preparación para Huracanes y Protección de Propiedades"
3. Action: "Instale persianas metálicas o tablas de madera contrachapada"

### French User
1. Selects "fr" locale
2. Sees: "Préparation aux Ouragans et Protection des Propriétés"
3. Action: "Installez des volets métalliques ou des planches de contreplaqué"

---

## 🚀 Future Enhancements

### Priority 1: Translation Management
Create a dedicated translation interface:
- View all untranslated content
- Bulk translation import/export
- Translation quality indicators
- Machine translation suggestions

### Priority 2: Content Validation
- Ensure all 3 languages have content
- Flag missing translations
- Validate JSON format
- Preview in all languages

---

## 📦 Summary

**What's Working**:
- ✅ All data IS multilingual in database
- ✅ Wizard DOES show content in user's language
- ✅ Business types CAN be edited in all languages via Admin2

**All Features Complete**:
- ✅ Admin2 has language switcher UI for all editable content
- ✅ Strategies can be edited in all three languages
- ✅ Action steps can be edited in all three languages
- ✅ Business types can be edited in all three languages
- ✅ Multipliers can be edited in all three languages
- ✅ Multipliers have multilingual wizard questions
- ✅ Wizard dynamically shows questions based on active multipliers

**Bottom Line**: The multilingual system is **100% complete**! Users see content in their language, and admins can control what questions appear in the wizard by activating/deactivating multipliers.


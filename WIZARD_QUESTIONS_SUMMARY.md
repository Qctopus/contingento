# 🎉 Wizard Dynamic Questions - Implementation Complete!

## ✅ What Was Fixed

The "Tell Us About Your Business" section in the wizard now dynamically loads questions from the `RiskMultiplier` database instead of using hardcoded questions.

## 📊 Before vs After

### Before
- **5 hardcoded questions** in `IndustrySelector.tsx`
- Questions couldn't be changed without code updates
- No admin control over wizard content
- Fixed set of questions for all business types

### After
- **7+ dynamic questions** loaded from database
- Fully multilingual (EN/ES/FR)
- Admins can add/remove questions in Admin2 panel
- Questions adapt based on active multipliers
- No code changes needed to modify wizard

## 🔧 Technical Changes

### 1. IndustrySelector.tsx
```typescript
// Added state for multipliers
const [multipliers, setMultipliers] = useState<any[]>([])
const [loadingMultipliers, setLoadingMultipliers] = useState(false)

// Changed businessCharacteristics to accept dynamic fields
const [businessCharacteristics, setBusinessCharacteristics] = useState<Record<string, any>>({
  // ... existing fields ...
})

// Fetch active multipliers on mount
useEffect(() => {
  const loadMultipliers = async () => {
    const response = await fetch('/api/admin2/multipliers?activeOnly=true')
    const result = await response.json()
    const multipliersWithQuestions = result.multipliers.filter(m => m.wizardQuestion)
    setMultipliers(multipliersWithQuestions)
  }
  loadMultipliers()
}, [])
```

### 2. Dynamic Question Rendering
- Parses multilingual JSON from `wizardQuestion` field
- Supports multiple answer formats from `wizardAnswerOptions`
- Shows help text from `wizardHelpText`
- Handles boolean, threshold, and range question types
- Filters out location questions (shown as checkboxes)

### 3. Database Cleanup
- Fixed duplicate `power_dependency` multiplier
- Deactivated "Moderate Power Dependency" (kept Critical)
- All 10 multipliers now have unique characteristic types

## 📋 Current Questions in Wizard

### Location Section (Checkboxes)
1. **Near Coast** - Within 5km of ocean/sea
2. **Urban Area** - In city or densely populated area

### Dynamic Questions from Multipliers
1. **Perishable Goods** - Do you sell food, flowers, etc.?
2. **Digital Systems** - How dependent on computers/internet?
3. **Power Dependency** - Can you operate without electricity?
4. **Inventory Strategy** - Do you keep minimal stock?
5. **Equipment Value** - Do you have expensive machinery?
6. **Tourism Dependency** - What % of customers are tourists?
7. **Seasonality** - Is your revenue seasonal?

**Total: 9 questions** (2 checkboxes + 7 dynamic)

All questions available in:
- 🇬🇧 English
- 🇪🇸 Español  
- 🇫🇷 Français

## 🎯 How It Works

### For Users:
1. Select business type
2. Select location
3. Answer business characteristic questions
4. Questions automatically shown in selected language
5. Answers drive risk multiplier calculations

### For Admins:
1. Go to Admin2 → Risk Multipliers
2. Create/Edit multiplier
3. Fill wizard question fields (EN/ES/FR)
4. Add answer options with multilingual labels
5. Activate multiplier
6. Question appears in wizard automatically!

## 🔄 Adding New Questions

Example: Add "Water Dependency" question

```javascript
// In Admin2 Risk Multipliers tab:
{
  name: "Water Dependency",
  characteristicType: "water_dependency",
  conditionType: "boolean",
  multiplierFactor: 1.3,
  applicableHazards: ["drought", "flood"],
  
  // Wizard fields (multilingual JSON):
  wizardQuestion: {
    en: "Does your business require running water to operate?",
    es: "¿Su negocio requiere agua corriente para operar?",
    fr: "Votre entreprise nécessite-t-elle de l'eau courante pour fonctionner?"
  },
  
  wizardAnswerOptions: [
    {
      value: true,
      label: { en: "Yes", es: "Sí", fr: "Oui" }
    },
    {
      value: false,
      label: { en: "No", es: "No", fr: "Non" }
    }
  ],
  
  wizardHelpText: {
    en: "Consider all water needs: drinking, cleaning, production",
    es: "Considere todas las necesidades de agua: beber, limpiar, producción",
    fr: "Considérez tous les besoins en eau: boire, nettoyer, production"
  },
  
  isActive: true
}
```

Save → Question appears in wizard! ✨

## 🧪 Testing

1. **Start dev server**: `npm run dev` (already running)
2. **Open wizard**: http://localhost:3000 or http://localhost:3000/en
3. **Follow wizard flow**:
   - Select any business type
   - Choose Jamaica → Any parish
   - Proceed to "Tell Us About Your Business"
4. **Verify**:
   - ✅ Location checkboxes appear
   - ✅ 7 dynamic questions appear
   - ✅ Questions numbered 1-7
   - ✅ All have answer options
   - ✅ Questions in correct language

5. **Test language switching**:
   - Change language to Spanish
   - Return to characteristics step
   - ✅ Questions should be in Spanish

## 📂 Files Changed

1. **src/components/IndustrySelector.tsx**
   - Added multiplier fetching logic
   - Replaced hardcoded questions (lines 340-573) with dynamic rendering
   - Added location characteristic mapping

2. **Database**
   - Deactivated duplicate `power_dependency` multiplier
   - 10 active multipliers with unique wizard questions

3. **Documentation**
   - WIZARD_DYNAMIC_QUESTIONS_FIX.md
   - WIZARD_QUESTIONS_SUMMARY.md (this file)

## ✨ Benefits

1. **Admin Control**: Questions managed through Admin2 UI
2. **Multilingual**: Full EN/ES/FR support
3. **Dynamic**: Add/remove without code changes
4. **Flexible**: Supports various question types
5. **Maintainable**: Single source of truth (database)
6. **Scalable**: Easy to add new characteristic types

## 🎨 User Experience

### Before
- Fixed questions regardless of business type
- English only
- No flexibility

### After
- Dynamic questions based on risk multipliers
- Multilingual support
- Admin can customize
- Better user guidance with help text
- Cleaner, more organized layout

## 📊 Impact on Risk Calculations

Each question maps to a `characteristicType` that affects risk multipliers:

- **tourism_share** → Affects pandemic, hurricane, economic risks
- **power_dependency** → Affects power outage, hurricane risks
- **digital_dependency** → Affects cyber attack, power outage risks
- **perishable_goods** → Affects power outage, supply chain risks
- **just_in_time_inventory** → Affects supply chain risks
- **physical_asset_intensive** → Affects physical damage risks
- **seasonal_business** → Affects economic downturn risks

User answers → Business characteristics → Risk multipliers applied → More accurate risk scores!

## 🚀 Next Steps

Consider adding questions for:
- [ ] Water dependency
- [ ] Internet connectivity
- [ ] Supply chain complexity  
- [ ] Customer concentration
- [ ] Staff size/flexibility
- [ ] Insurance coverage
- [ ] Backup systems

All can be added through Admin2 panel without code changes!

---

## 🎉 Status: COMPLETE ✅

The wizard now has fully dynamic, multilingual questions driven by the multiplier system. Users will see 7+ relevant questions that inform their risk calculations, and admins can manage these questions through the Admin2 interface.

**Test it now**: Open http://localhost:3000 and start a new plan!



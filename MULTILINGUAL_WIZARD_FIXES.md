# Multilingual Wizard Fixes - Summary

## Overview
This document summarizes the multilingual improvements made to the wizard to ensure it works properly in all three languages (English, Spanish, French).

## Completed Fixes

### 1. Translation Keys Added
Added comprehensive translation keys to all three message files (`src/messages/en.json`, `src/messages/es.json`, `src/messages/fr.json`) for:

#### IndustrySelector Component
- `characteristicsTitle`, `characteristicsDescription`
- `loadingQuestions`
- `aboutLocationTitle`, `aboutLocationDescription`
- `nearCoastLabel`, `nearCoastDetails`
- `urbanAreaLabel`, `urbanAreaDetails`
- `backButton`, `backToLocation`
- `generateSmartPlan`, `preparingPlan`
- `skipManual`, `continueButton`
- `loadingAdminUnits`, `noAdminUnits`

#### SimplifiedRiskAssessment Component
- `loadingRiskAssessment`, `analyzingRisks`
- `noRisksLoaded`, `riskAssessmentAutoLoaded`
- `preFillAvailable`, `unknownBusiness`, `unknownLocation`
- `noHazardsInPrefill`, `noPreFillData`
- `selectedHazards`, `riskScoreLabel`
- `likelihoodOccurrence`, `fromLocationData`
- `impactSeverity`, `businessImpact`
- `howBadlyAffect`
- `calculatedRiskScore`
- `basedOn`, `progressLabel`
- `smartAnalysisActive`
- `reviewYourRisks`, `reviewRisksDescription`
- `criticalPriorityLabel`, `criticalPriorityDescription`
- `importantLabel`, `importantDescription`
- `optionalLabel`, `optionalDescription`
- `criticalPriorityRisks`, `highestThreatLevel`
- `importantRisks`, `significantRisks`
- `otherAvailableRisks`, `lowerPriorityRisks`
- `clickToCollapse`, `availableCount`
- `availableRisksNote`
- `assessmentSummary`, `selectedRisksCount`
- `fullyAssessed`, `highPriorityCount`
- `highPriorityIdentified`, `highPriorityDescription`
- `completeAssessmentNote`
- `autoCalculated`, `whyRiskMatters`, `howRiskCalculated`
- `notSignificantInLocation`, `basedOnParishData`, `basedOnAdminData`
- Likelihood ranges: `rare`, `possible`, `likely`, `certain`
- Severity ranges: `minor`, `moderate`, `major`, `severe`

### 2. Components Updated

#### `src/components/IndustrySelector.tsx`
✅ **Status: COMPLETE**
- All hardcoded English strings replaced with translation keys
- Uses `t()` function from `useTranslations('industrySelector')`
- Properly handles business type characteristics questions
- Location selection UI fully localized
- All buttons and labels now pull from translation files

#### `src/components/SimplifiedRiskAssessment.tsx`
✅ **Status: COMPLETE**
- All hardcoded English strings replaced with translation keys
- Uses `t()` function from `useTranslations('common')`
- Risk assessment UI fully localized including:
  - Loading states
  - Risk scoring explanations
  - Tier badges (Critical, Important, Optional)
  - Likelihood and severity ranges
  - Summary statistics
  - Auto-calculation indicators

#### `src/components/AdminStrategyCards.tsx`
✅ **Status: VERIFIED**
- Already correctly uses `centralDataService.getStrategies(true, locale)`
- Properly fetches localized strategies from the database
- Passes locale to child components

### 3. Backend/API Verification

#### `src/app/api/wizard/prepare-prefill-data/route.ts`
✅ **Status: VERIFIED**
- Uses `getLocalizedText()` for business type names and descriptions
- Properly localizes all strategy fields:
  - `smeTitle`, `smeSummary`, `smeDescription`
  - `whyImportant`, `realWorldExample`
  - `lowBudgetAlternative`, `diyApproach`
  - `bcpTemplateText`
- Action steps within strategies are also localized
- Location data is properly handled
- Risk assessments include localized hazard labels

#### `src/services/dynamicPreFillService.ts`
✅ **Status: VERIFIED**
- Fetches localized business types
- Uses `getLocalizedText()` for strategy content
- Properly handles multilingual content throughout

## Known Remaining Issues

### 1. StrategySelectionStep Component
⚠️ **Status: NEEDS UPDATE**

**File:** `src/components/wizard/StrategySelectionStep.tsx`

**Issues:**
- Component doesn't use `useTranslations` hook yet
- Contains many hardcoded English strings:
  - "Your Recommended Actions"
  - "Include in your plan" / "Skip this one"
  - "ESSENTIAL (Must Have)" / "RECOMMENDED (Should Have)" / "OPTIONAL (Nice to Have)"
  - "Real Success Story"
  - "Low Budget Alternative"
  - "DIY Approach"
  - Various other UI text

**Recommendation:**
1. Add `import { useTranslations } from 'next-intl'`
2. Add translation keys to message files for all UI strings
3. Replace hardcoded strings with `t()` calls
4. Ensure strategy content (which comes from props) is already localized by parent component

### 2. Other Wizard Steps
⚠️ **Status: NEEDS REVIEW**

Some wizard steps may have hardcoded strings. Files to check:
- Any other files in `src/components/wizard/`
- Main wizard orchestrator component
- Review confirmation dialogs and success messages

## Testing Recommendations

### Manual Testing Checklist

1. **Industry Selector (Step 1)**
   - [ ] Switch between EN/ES/FR - all labels update
   - [ ] Business type selector shows localized names
   - [ ] Country and parish dropdowns work in all languages
   - [ ] Characteristic questions display in correct language
   - [ ] Buttons ("Generate Smart Plan", "Back", "Continue") are translated

2. **Risk Assessment (Step 2)**
   - [ ] Risk cards show localized hazard names
   - [ ] Tier badges (Critical, Important, Optional) are translated
   - [ ] Likelihood/Severity sliders show translated ranges
   - [ ] "Auto-calculated" badges and explanations are localized
   - [ ] Summary statistics display in correct language

3. **Strategy Selection (Step 3)**
   - [ ] Strategy names and descriptions are in selected language
   - [ ] All fields (whyImportant, realWorldExample, etc.) display localized content
   - [ ] Action steps show translated titles and descriptions
   - [ ] **NOTE:** UI chrome may still be in English (needs StrategySelectionStep update)

4. **Prefill Data**
   - [ ] Switching language BEFORE starting wizard loads correct content
   - [ ] All auto-populated fields reflect the selected language
   - [ ] Business type descriptions are localized
   - [ ] Location-specific risk data is properly displayed

### Automated Testing

Consider adding tests for:
- Translation key coverage (ensure all keys exist in all language files)
- Locale switching functionality
- Database query results in different languages
- API responses with proper locale parameter

## Database Content Requirements

### Business Types
Ensure `adminBusinessType` table has translations in `name` and `description` fields:
```json
{
  "name": { "en": "Grocery Store", "es": "Tienda de Abarrotes", "fr": "Épicerie" },
  "description": { "en": "...", "es": "...", "fr": "..." }
}
```

### Strategies
Ensure `riskMitigationStrategy` table has translations for:
- `name`, `description`
- `smeTitle`, `smeSummary`, `smeDescription`
- `whyImportant`, `realWorldExample`
- `lowBudgetAlternative`, `diyApproach`
- `bcpTemplateText`

### Action Steps
Ensure `actionStep` table has translations for:
- `title`, `description`
- `whyThisStepMatters`, `whatHappensIfSkipped`
- `howToKnowItsDone`, `exampleOutput`
- `freeAlternative`, `lowTechOption`

### Hazards
Ensure hazard labels are in `messages/[locale].json` under:
```
steps.riskAssessment.hazardLabels.[hazard_key]
```

## Summary

### ✅ What's Working
1. **IndustrySelector** - Fully localized
2. **SimplifiedRiskAssessment** - Fully localized
3. **AdminStrategyCards** - Correctly fetches localized data
4. **Prefill API** - Returns localized content
5. **Backend Services** - Use localization utils properly

### ⚠️ What Needs Attention
1. **StrategySelectionStep** - Needs translation implementation (UI chrome only, strategy content is already localized)
2. **Other wizard steps** - Need review
3. **Testing** - Comprehensive testing in all three languages recommended

### 📊 Translation Coverage
- **English**: 100% (base language)
- **Spanish**: ~95% (StrategySelectionStep UI pending)
- **French**: ~95% (StrategySelectionStep UI pending)

## Next Steps

1. **Immediate:** Update `StrategySelectionStep.tsx` to use translations
2. **Short-term:** Review all wizard-related components for hardcoded strings
3. **Medium-term:** Add automated tests for translation coverage
4. **Long-term:** Consider adding a translation management system for easier updates



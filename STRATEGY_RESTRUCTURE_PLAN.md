# Strategy Database Restructure Plan

## Current Problem

**Current Structure:**
- Strategies have `category`: 'prevention' | 'preparation' | 'response' | 'recovery'
- This creates separate strategies for each phase
- Example: "Hurricane Preparedness" (prevention), "Emergency Response" (response), "Business Recovery" (recovery)
- Confusing and fragmented

## New Proposed Structure

**New Structure:**
- Strategies represent **complete risk mitigation approaches**
- Each strategy contains action steps for **BEFORE, DURING, and/or AFTER** phases
- `category` field changes to `strategyType`: 'risk_specific' | 'generic'

### Strategy Types

#### 1. Risk-Specific Strategies
**Comprehensive mitigation for ONE specific risk**
- Contains BEFORE/DURING/AFTER steps as appropriate
- Example: "Hurricane Preparedness & Response"
  - BEFORE: Install shutters, secure property, stock supplies
  - DURING: Evacuate if needed, monitor storm, stay safe
  - AFTER: Assess damage, file insurance, clean up safely
  
#### 2. Generic Strategies
**Apply to MULTIPLE risks, focus on one phase**
- Emergency Response Protocols (DURING - applies to all risks)
- Business Recovery & Restoration (AFTER - applies to all risks)
- Financial Resilience (BEFORE/DURING - applies to economic risks)

## New Schema Changes

### RiskMitigationStrategy Model

```prisma
model RiskMitigationStrategy {
  // Core Identification
  id                     String   @id @default(cuid())
  strategyId             String   @unique
  name                   String   // JSON multilingual
  
  // NEW: Strategy Type (replaces category)
  strategyType           String   // 'risk_specific' | 'generic'
  
  // Risk Mapping
  applicableRisks        String   // JSON array - for risk-specific, usually one risk
                                  // for generic, multiple risks
  
  // SME-Focused Content (ALL multilingual JSON)
  smeTitle               String?  // JSON: {en, es, fr}
  smeSummary             String?  // JSON: {en, es, fr}
  benefitsBullets        String?  // JSON array of objects: [{en, es, fr}, ...]
  realWorldExample       String?  // JSON: {en, es, fr}
  
  // Implementation Details
  selectionTier          String?  @default("recommended") // 'essential' | 'recommended' | 'optional'
  implementationCost     String?  @default("medium")
  timeToImplement        String?  @default("medium")
  complexityLevel        String?  @default("moderate")
  effectiveness          Int?     @default(7)
  roi                    Float?   @default(3.0)
  
  // Resource-Limited SME Support (multilingual)
  lowBudgetAlternative   String?  // JSON: {en, es, fr}
  diyApproach            String?  // JSON: {en, es, fr}
  estimatedDIYSavings    String?  // JSON: {en, es, fr}
  
  // Guidance (multilingual JSON arrays)
  helpfulTips            String?  // JSON array of objects: [{en, es, fr}, ...]
  commonMistakes         String?  // JSON array of objects: [{en, es, fr}, ...]
  successMetrics         String?  // JSON array of objects: [{en, es, fr}, ...]
  
  // ... rest of fields remain same
  
  // Relations
  actionSteps            ActionStep[]       // Action steps with executionTiming
  itemCosts              StrategyItemCost[] // Cost items at strategy level
}
```

### ActionStep Model
**No changes needed - already has executionTiming!**

```prisma
model ActionStep {
  // executionTiming field already exists!
  executionTiming   String?  // 'before_crisis' | 'during_crisis' | 'after_crisis'
  
  // All text fields should be multilingual JSON
  title             String   // JSON: {en, es, fr}
  description       String   // JSON: {en, es, fr}
  smeAction         String?  // JSON: {en, es, fr}
  
  whyThisStepMatters    String?  // JSON: {en, es, fr}
  whatHappensIfSkipped  String?  // JSON: {en, es, fr}
  
  freeAlternative   String?  // JSON: {en, es, fr}
  lowTechOption     String?  // JSON: {en, es, fr}
  
  // ... rest remains same
}
```

## Migration Strategy

### Step 1: Add strategyType Column
```sql
ALTER TABLE "RiskMitigationStrategy" 
ADD COLUMN "strategyType" TEXT DEFAULT 'generic';
```

### Step 2: Consolidate Strategies

**Hurricane (risk-specific):**
- Merge: hurricane_preparation + emergency_response (during) + recovery (after)
- Result: "Hurricane Preparedness & Response" with before/during/after steps

**Flood (risk-specific):**
- Merge: flood_prevention + emergency_response (during) + recovery (after)
- Result: "Flood Prevention & Response" with before/during/after steps

**Fire (risk-specific):**
- Merge: fire_detection + emergency_response (during) + recovery (after)
- Result: "Fire Detection & Response" with before/during/after steps

**Power Outage (risk-specific):**
- Keep: backup_power (mostly before, some during)
- Result: "Backup Power & Outage Response" with before/during steps

**Cyber Attack (risk-specific):**
- Keep: cybersecurity_protection (before)
- Add: incident response steps (during), recovery steps (after)
- Result: "Cybersecurity Protection & Incident Response" with all phases

**Generic Strategies (keep separate):**
- Emergency Response Protocols (DURING - all risks)
- Business Recovery & Restoration (AFTER - all risks)
- Financial Resilience (BEFORE/DURING - economic)
- Communication Backup (BEFORE/DURING - multiple risks)

### Step 3: Ensure Multilinguality

Convert all text fields to JSON format:
```json
{
  "en": "English text",
  "es": "Spanish text",
  "fr": "French text"
}
```

Fields to convert:
- name, smeTitle, smeSummary
- benefitsBullets (array of multilingual objects)
- realWorldExample
- lowBudgetAlternative, diyApproach, estimatedDIYSavings
- helpfulTips, commonMistakes, successMetrics (arrays)
- ActionStep: title, description, smeAction
- ActionStep: whyThisStepMatters, whatHappensIfSkipped
- ActionStep: freeAlternative, lowTechOption

## Cost Item Preservation

**No changes needed!**
- ActionStepItemCost links to ActionStep.id
- As long as ActionStep IDs remain stable, costs are preserved
- New consolidated strategies will have same/similar action steps

## Benefits

1. ✅ **Clearer Organization** - One strategy = complete risk mitigation
2. ✅ **Easier to Understand** - User sees "Hurricane" strategy with all phases
3. ✅ **Better Costing** - One cost calculation per complete strategy
4. ✅ **Flexible** - Can have risk-specific OR generic strategies
5. ✅ **Maintains executionTiming** - BEFORE/DURING/AFTER preserved in steps
6. ✅ **Cost Items Safe** - No disruption to cost calculations

## Implementation Checklist

- [ ] Update Prisma schema
- [ ] Create migration SQL
- [ ] Create data consolidation script
- [ ] Ensure multilinguality in all fields
- [ ] Update TypeScript interfaces
- [ ] Update WorkbookPreview to use strategyType
- [ ] Test cost calculations still work
- [ ] Verify all text displays in correct language
- [ ] Update strategy selection UI
- [ ] Run full test suite


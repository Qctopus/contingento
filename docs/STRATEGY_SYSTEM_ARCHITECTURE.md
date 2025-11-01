# Strategy System Architecture
## Technical Overview of the Caribbean SME Strategy Recommendation System

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [Data Flow](#data-flow)
4. [API Layer](#api-layer)
5. [Frontend Components](#frontend-components)
6. [Scoring Algorithm](#scoring-algorithm)
7. [Multilingual Support](#multilingual-support)
8. [Performance Optimizations](#performance-optimizations)
9. [Maintenance Guide](#maintenance-guide)

---

## 🌐 System Overview

The Strategy System is a **recommendation engine** that:
1. Takes business context (location, industry, size, risks)
2. Scores and ranks mitigation strategies
3. Presents personalized, SME-focused content
4. Generates actionable business continuity plans

### Key Design Principles:
- **SME-First**: Content optimized for small Caribbean businesses
- **Caribbean-Specific**: Localized costs, examples, and context
- **Resource-Aware**: Budget and low-tech alternatives always provided
- **Benefit-Driven**: Focuses on business outcomes, not technical process
- **Multilingual**: Full support for English, Spanish, French

---

## 🗄️ Database Schema

### RiskMitigationStrategy Table

```prisma
model RiskMitigationStrategy {
  strategyId      String    @id
  name            String    // Multilingual JSON
  description     String    // Multilingual JSON
  category        String
  
  // SME-Focused Content (NEW)
  smeTitle        String?   // Plain-language title
  smeSummary      String?   // Why this matters (2-3 sentences)
  benefitsBullets String?   // JSON array of key benefits
  realWorldExample String?  // Caribbean success story
  
  // Implementation Details
  implementationCost  String
  costEstimateJMD     String?  // "JMD 15,000-80,000"
  implementationTime  String
  estimatedTotalHours Int?     // Actual hours needed
  effectiveness       Int
  complexityLevel     String?  // simple/moderate/advanced
  
  // Wizard Integration
  quickWinIndicator   Boolean  @default(false)  // Easy wins
  defaultSelected     Boolean  @default(false)  // Auto-selected
  selectionTier       String?  // essential/recommended/optional
  requiredForRisks    String?  // JSON array of risk IDs
  
  // Resource-Limited SME Support
  lowBudgetAlternative String?  // Cheap option
  diyApproach         String?   // Do-it-yourself steps
  estimatedDIYSavings String?   // How much DIY saves
  
  // BCP Document Integration
  bcpSectionMapping   String?   // Which BCP section
  bcpTemplateText     String?   // Template text for BCP
  
  // Personalization
  industryVariants     String?  // JSON: industry-specific guidance
  businessSizeGuidance String?  // JSON: size-specific guidance
  
  // Risk & Business Type Mapping
  applicableRisks         String?  // JSON array
  applicableBusinessTypes String?  // JSON array
  prerequisites           String?  // JSON array
  
  // Guidance
  helpfulTips     String?  // JSON array
  commonMistakes  String?  // JSON array
  successMetrics  String?  // JSON array
  
  // Backward Compatibility (Deprecated)
  smeDescription  String?
  whyImportant    String?
  
  // Relationships
  actionSteps ActionStep[]
  
  // Metadata
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([selectionTier])
  @@index([quickWinIndicator])
}
```

### ActionStep Table

```prisma
model ActionStep {
  stepId      String   @id
  strategyId  String
  strategy    RiskMitigationStrategy @relation(...)
  
  // Basic Info
  phase           String
  title           String?  // Multilingual JSON
  description     String   // Multilingual JSON
  smeAction       String?  // Plain-language action
  sortOrder       Int
  
  // SME Context (NEW)
  whyThisStepMatters    String?  // Why it's important
  whatHappensIfSkipped  String?  // Consequences
  
  // Timing & Difficulty
  timeframe        String?
  estimatedMinutes Int?     // Actual time
  difficultyLevel  String?  // easy/medium/hard
  
  // Resources & Cost
  responsibility     String?
  estimatedCost      String?
  estimatedCostJMD   String?
  resources          String?  // JSON array
  checklist          String?  // JSON array
  
  // Validation & Completion (NEW)
  howToKnowItsDone  String?  // Completion criteria
  exampleOutput     String?  // What finished looks like
  
  // Dependencies (NEW)
  dependsOnSteps    String?  // JSON array of step IDs
  isOptional        Boolean  @default(false)
  skipConditions    String?  // When to skip
  
  // Alternatives for Resource-Limited SMEs (NEW)
  freeAlternative   String?  // Free/low-cost option
  lowTechOption     String?  // Non-digital alternative
  
  // Help Resources (NEW)
  commonMistakesForStep String?  // JSON array
  videoTutorialUrl      String?
  externalResourceUrl   String?
  
  // Backward Compatibility (Deprecated)
  helpVideo String?
  
  // Metadata
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([difficultyLevel])
  @@index([isOptional])
}
```

### Field Groups:

1. **Core Identification**
   - `strategyId`, `name`, `description`, `category`
   - Must be unique, used for lookups

2. **SME Content** (User-Facing)
   - `smeTitle`, `smeSummary`, `benefitsBullets`, `realWorldExample`
   - These display prominently in wizard

3. **Implementation Guidance**
   - `costEstimateJMD`, `estimatedTotalHours`, `complexityLevel`
   - Helps users assess feasibility

4. **Smart Recommendations**
   - `quickWinIndicator`, `selectionTier`, `requiredForRisks`
   - Powers scoring algorithm

5. **Resource Support**
   - `lowBudgetAlternative`, `diyApproach`, `estimatedDIYSavings`
   - Critical for resource-limited SMEs

6. **Personalization**
   - `industryVariants`, `businessSizeGuidance`
   - Customizes advice by context

---

## 🔄 Data Flow

### 1. Wizard Input Collection
```
User completes wizard → Submits form
  ↓
FormData collected:
  - location (country, adminUnit)
  - industry (businessType)
  - businessSize (micro/small/medium)
  - riskProfile (selected hazards)
  - resources (numberOfEmployees, hasCashReserve, etc.)
```

### 2. API Request to `/api/wizard/prepare-prefill-data`
```typescript
POST /api/wizard/prepare-prefill-data
Body: {
  location: { country, adminUnit },
  businessType: string,
  businessSize: string,
  riskProfile: string[],
  resources: { ... }
}
```

### 3. Strategy Retrieval & Scoring
```
1. Fetch all active strategies from database
   ↓
2. For each strategy:
   a. Calculate RELEVANCE_SCORE (matches risk profile?)
   b. Calculate FEASIBILITY_SCORE (can user afford/implement?)
   c. Calculate IMPACT_SCORE (how effective?)
   d. Apply MODIFIERS (quick win, complexity, time)
   ↓
3. Sort strategies by total score
   ↓
4. Assign PRIORITY_TIER (essential/recommended/optional)
```

### 4. Response Transformation
```
1. Transform DB models to API format
   ↓
2. Parse JSON fields (benefitsBullets, industryVariants, etc.)
   ↓
3. Localize text fields
   ↓
4. Include only needed fields
   ↓
5. Return enriched strategy objects
```

### 5. Frontend Rendering
```
StrategySelectionStep component receives strategies
  ↓
Groups by priority tier
  ↓
Renders cards with SME content
  ↓
User selects/deselects strategies
  ↓
Generates BCP document
```

---

## 🔌 API Layer

### Key Endpoints

#### 1. `GET /api/admin2/strategies`
**Purpose**: List all strategies (admin interface)

**Response**:
```typescript
{
  strategies: Strategy[],
  total: number
}
```

**Transformation**: Uses `transformStrategyForApi()` from `src/lib/admin2/transformers.ts`

---

#### 2. `GET /api/admin2/strategies/[id]`
**Purpose**: Get single strategy details

**Response**:
```typescript
{
  strategy: Strategy
}
```

**Includes**: Full strategy with all action steps

---

#### 3. `POST /api/admin2/strategies`
**Purpose**: Create new strategy

**Request Body**:
```typescript
{
  strategyId: string,
  name: string | MultilingualText,
  description: string | MultilingualText,
  smeTitle: string,
  smeSummary: string,
  benefitsBullets: string[],
  // ... all other fields
  actionSteps: ActionStep[]
}
```

**Processing**:
1. Validate required fields
2. Stringify JSON fields (`benefitsBullets`, `industryVariants`, etc.)
3. Create strategy in database
4. Create related action steps
5. Return created strategy

---

#### 4. `PUT /api/admin2/strategies/[id]`
**Purpose**: Update existing strategy

**Same as POST** but updates instead of creates.

**Important**: Must stringify JSON arrays before saving:
```typescript
benefitsBullets: JSON.stringify(formData.benefitsBullets)
```

---

#### 5. `POST /api/wizard/prepare-prefill-data`
**Purpose**: Get personalized strategy recommendations

**Request**:
```typescript
{
  location: { country, adminUnit },
  businessType: string,
  businessSize: string,
  riskProfile: string[],
  resources: {
    numberOfEmployees: number,
    hasCashReserve: boolean,
    hasInternetAccess: boolean,
    // ...
  }
}
```

**Response**:
```typescript
{
  contactInfo: { ... },
  businessInfo: { ... },
  riskAssessment: { ... },
  detailedStrategies: Strategy[]  // Scored and ranked
}
```

**Processing** (see Scoring Algorithm section)

---

## 📊 Scoring Algorithm

Located in: `src/app/api/wizard/prepare-prefill-data/route.ts`

### Components:

#### 1. Relevance Score (0-40 points)
```typescript
const matchingRisks = strategy.applicableRisks.filter(risk => 
  userRiskProfile.includes(risk)
)
const relevanceScore = (matchingRisks.length / strategy.applicableRisks.length) * 40
```

**Logic**: How many of the user's selected risks does this strategy address?

---

#### 2. Feasibility Score (0-30 points)
```typescript
let feasibilityScore = 0

// Cost Feasibility (0-15 points)
if (strategy.complexityLevel === 'simple') {
  feasibilityScore += 15
} else if (strategy.complexityLevel === 'moderate') {
  feasibilityScore += 10
} else if (strategy.complexityLevel === 'advanced') {
  if (resources.numberOfEmployees >= 10) {
    feasibilityScore += 5
  } else {
    feasibilityScore += 0  // Penalty for complex without staff
  }
}

// Time Feasibility (0-15 points)
if (strategy.estimatedTotalHours <= 4) {
  feasibilityScore += 15  // Quick to implement
} else if (strategy.estimatedTotalHours <= 12) {
  feasibilityScore += 10
} else {
  if (resources.numberOfEmployees >= 5) {
    feasibilityScore += 5
  } else {
    feasibilityScore += 2  // Time-intensive without staff
  }
}
```

**Logic**: Can the user actually implement this given their resources?

---

#### 3. Impact Score (0-25 points)
```typescript
const impactScore = (strategy.effectiveness / 10) * 25
```

**Logic**: How effective is this strategy (admin-assigned effectiveness rating)?

---

#### 4. Modifiers (0-10 points)
```typescript
let modifiers = 0

// Quick Win Bonus
if (strategy.quickWinIndicator) {
  modifiers += 5
}

// Other modifiers...
```

**Logic**: Boost strategies that are easy wins.

---

### Priority Tier Assignment

```typescript
// 1. Honor database tier if set
if (strategy.selectionTier) {
  priorityTier = strategy.selectionTier
}

// 2. Force 'essential' if required for user's risks
if (strategy.requiredForRisks?.some(r => userRiskProfile.includes(r))) {
  priorityTier = 'essential'
}

// 3. Score-based assignment (fallback)
if (totalScore >= 75) {
  priorityTier = 'essential'
} else if (totalScore >= 50) {
  priorityTier = 'recommended'
} else {
  priorityTier = 'optional'
}
```

---

## 🎨 Frontend Components

### Key Components:

#### 1. `StrategySelectionStep.tsx`
**Location**: `src/components/wizard/StrategySelectionStep.tsx`

**Purpose**: Main strategy selection interface in wizard

**Key Features**:
- Groups strategies by tier (essential/recommended/optional)
- Displays SME-focused content prominently
- Expandable cards for full details
- Shows real-world examples, DIY options, tips, mistakes

**Rendering Logic**:
```typescript
// Use SME content first, fall back to legacy
const displayTitle = strategy.smeTitle || strategy.name
const displaySummary = strategy.smeSummary || strategy.description

// Show quick win indicator
{strategy.quickWinIndicator && (
  <span className="badge">⚡ Quick Win</span>
)}

// Render benefits bullets
{strategy.benefitsBullets?.map(benefit => (
  <li>{benefit}</li>
))}
```

---

#### 2. `StrategyForm.tsx`
**Location**: `src/components/admin2/StrategyForm.tsx`

**Purpose**: Admin interface for creating/editing strategies

**Key Sections**:
1. **Basic Information** (name, description, category)
2. **SME-Focused Content** (title, summary, benefits, example)
3. **Implementation Details** (cost, time, complexity)
4. **Wizard Integration** (quick win, tier, required risks)
5. **Resource Support** (budget alternatives, DIY)
6. **BCP Integration** (section mapping, template)
7. **Personalization** (industry/size variants)
8. **Guidance** (tips, mistakes, metrics)
9. **Action Steps** (enhanced with SME context)

**State Management**:
```typescript
const [formData, setFormData] = useState<FormData>({
  // All strategy fields
  benefitsBullets: [],  // Array
  industryVariants: {}, // Object
  // ...
})

// Before save: stringify JSON fields
const dataToSave = {
  ...formData,
  benefitsBullets: JSON.stringify(formData.benefitsBullets),
  industryVariants: JSON.stringify(formData.industryVariants),
  // ...
}
```

---

#### 3. `ActionStepForm` (Inline in StrategyForm)
**Purpose**: Create/edit action steps within strategy form

**Enhanced Fields**:
- SME Context (why it matters, what happens if skipped)
- Timing & Difficulty (minutes, difficulty level, optional flag)
- Validation (how to know it's done, example output)
- Budget Alternatives (free alternative, low-tech option)
- Help Resources (video URL, external resource)
- Common Mistakes (array input with add/remove)

---

## 🌐 Multilingual Support

### Multilingual JSON Format

Many fields support multilingual content:
```json
{
  "en": "Emergency Contact List",
  "es": "Lista de Contactos de Emergencia",
  "fr": "Liste des Contacts d'Urgence"
}
```

### Parsing Functions

**Location**: `src/lib/admin2/transformers.ts`

```typescript
function parseMultilingualJSON(value: any): any {
  if (!value) return null
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      // Check if it's multilingual
      if (parsed && typeof parsed === 'object' && ('en' in parsed || 'es' in parsed)) {
        return parsed
      }
      return value
    } catch {
      return value
    }
  }
  return value
}
```

### Localization in Frontend

**Location**: `src/lib/localization.ts`

```typescript
export function getLocalizedText(text: string | MultilingualText, locale: string): string {
  if (!text) return ''
  
  // If it's already a string, return it
  if (typeof text === 'string') {
    // Try to parse if it looks like JSON
    try {
      const parsed = JSON.parse(text)
      if (parsed && typeof parsed === 'object') {
        return parsed[locale] || parsed.en || parsed.es || text
      }
      return text
    } catch {
      return text
    }
  }
  
  // If it's an object, get the locale or fallback
  if (typeof text === 'object') {
    return text[locale] || text.en || text.es || text.fr || ''
  }
  
  return String(text)
}
```

---

## ⚡ Performance Optimizations

### 1. Database Indexes
```prisma
@@index([selectionTier])      // Fast filtering by tier
@@index([quickWinIndicator])  // Fast filtering for quick wins
@@index([difficultyLevel])    // Fast filtering by difficulty
@@index([isOptional])         // Fast filtering optional steps
```

### 2. Query Optimization
```typescript
// Fetch strategies with action steps in one query
const strategies = await prisma.riskMitigationStrategy.findMany({
  where: { isActive: true },
  include: {
    actionSteps: {
      orderBy: { sortOrder: 'asc' }
    }
  }
})
```

### 3. JSON Parsing
Use safe parsing to prevent crashes:
```typescript
function safeJsonParse(value: any, fallback: any = null) {
  if (!value) return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}
```

### 4. Caching Considerations

**Future Enhancement**: Consider caching strategy data since it changes infrequently:
```typescript
// Potential Redis cache
const strategies = await cache.get('strategies:all') ||
  await fetchAndCacheStrategies()
```

---

## 🛠️ Maintenance Guide

### Adding a New Strategy Field

**Step 1**: Update Prisma Schema
```prisma
model RiskMitigationStrategy {
  // ... existing fields
  newField String?
}
```

**Step 2**: Create Migration
```bash
npx prisma migrate dev --name add_new_field
```

**Step 3**: Update TypeScript Types
```typescript
// src/types/admin.ts
export interface Strategy {
  // ... existing fields
  newField?: string
}
```

**Step 4**: Update API Transformer
```typescript
// src/lib/admin2/transformers.ts
export function transformStrategyForApi(strategy: any) {
  return {
    // ... existing fields
    newField: strategy.newField,
  }
}
```

**Step 5**: Update Admin Form
```typescript
// src/components/admin2/StrategyForm.tsx
<input
  value={formData.newField || ''}
  onChange={(e) => setFormData({ ...formData, newField: e.target.value })}
/>
```

**Step 6**: Update Wizard Display (if user-facing)
```typescript
// src/components/wizard/StrategySelectionStep.tsx
{strategy.newField && (
  <div>{strategy.newField}</div>
)}
```

---

### Populating New Strategies

**Script**: `scripts/populate-sme-enhanced-strategies.js`

**Pattern**:
```javascript
{
  strategyId: 'unique_strategy_id',
  updates: {
    smeTitle: "...",
    smeSummary: "...",
    benefitsBullets: toJSON([...]),
    realWorldExample: "...",
    // ... all fields
  },
  actionSteps: []  // Optionally add steps
}
```

**Run**:
```bash
node scripts/populate-sme-enhanced-strategies.js
```

---

### Debugging Common Issues

#### Issue: New fields not showing in wizard
**Check**:
1. Are fields in database? (check with Prisma Studio or SQL query)
2. Is transformer parsing them? (check `transformStrategyForApi`)
3. Is API returning them? (check network tab in browser)
4. Is frontend rendering them? (check component code)

#### Issue: JSON fields showing as strings
**Cause**: Forgot to parse JSON field

**Fix**:
```typescript
// BAD
benefitsBullets: strategy.benefitsBullets  // "['item1','item2']"

// GOOD
benefitsBullets: safeJsonParse(strategy.benefitsBullets, [])  // ['item1','item2']
```

#### Issue: Changes not saving
**Check**:
1. Are you stringifying JSON before save?
   ```typescript
   benefitsBullets: JSON.stringify(formData.benefitsBullets)
   ```
2. Is the field in the Prisma schema?
3. Did you run migrations?

#### Issue: Scoring seems wrong
**Debug**:
```typescript
// Add logging to scoring algorithm
console.log('Strategy:', strategy.smeTitle)
console.log('Relevance Score:', relevanceScore)
console.log('Feasibility Score:', feasibilityScore)
console.log('Impact Score:', impactScore)
console.log('Total:', totalScore)
console.log('Tier:', priorityTier)
```

---

## 📚 Key Files Reference

### Database:
- `prisma/schema.prisma` - Database schema
- `prisma/migrations/` - Migration history

### Backend API:
- `src/app/api/wizard/prepare-prefill-data/route.ts` - Recommendation engine
- `src/app/api/admin2/strategies/route.ts` - List/create strategies
- `src/app/api/admin2/strategies/[id]/route.ts` - Get/update/delete strategy
- `src/lib/admin2/transformers.ts` - DB to API transformation

### Frontend Components:
- `src/components/wizard/StrategySelectionStep.tsx` - User strategy selection
- `src/components/admin2/StrategyForm.tsx` - Admin strategy editor
- `src/components/admin2/StrategiesActionsTab.tsx` - Admin strategy list

### Types:
- `src/types/admin.ts` - Strategy and ActionStep interfaces

### Scripts:
- `scripts/populate-sme-enhanced-strategies.js` - Data population

### Documentation:
- `docs/STRATEGY_CONTENT_GUIDELINES.md` - Content writing guide
- `docs/STRATEGY_SYSTEM_ARCHITECTURE.md` - This document

---

## 🔮 Future Enhancements

### Potential Improvements:

1. **Machine Learning Scoring**
   - Train model on strategy selections
   - Improve recommendations over time

2. **User Feedback Loop**
   - Collect ratings on strategy usefulness
   - Adjust scores based on feedback

3. **Dynamic Cost Estimates**
   - Query current JMD prices from suppliers
   - Update costs automatically

4. **Video Integration**
   - Host tutorial videos
   - Embed in strategy cards

5. **Strategy Dependencies**
   - Model prerequisite relationships
   - Suggest implementation order

6. **Implementation Tracking**
   - Track which strategies SMEs implement
   - Monitor completion progress

7. **A/B Testing**
   - Test different content approaches
   - Optimize for comprehension and action

---

## 📞 Support

For technical questions:
1. Check this documentation
2. Review code comments in key files
3. Check related `.md` files in project root
4. Consult STRATEGY_CONTENT_GUIDELINES.md for content questions

---

**Last Updated**: 2025-01-12  
**Version**: 2.0 (Complete Overhaul)










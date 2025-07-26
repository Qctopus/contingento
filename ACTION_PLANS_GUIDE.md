# Business Continuity Action Plans Matrix - Editing Guide

This guide explains how to edit and customize the business continuity action plans without modifying application logic.

## File Location
**Primary File:** `src/data/actionPlansMatrix.ts`

## Structure Overview

The action plans matrix consists of three main components:

### 1. Base Hazard Action Plans (`HAZARD_ACTION_PLANS`)
Contains action plans for each type of hazard/risk:
- `hurricane` - Hurricane/Tropical Storm actions
- `power_outage` - Extended Power Outage actions
- `cyber_attack` - Cyber Attack/Security Breach actions
- `fire` - Fire Emergency actions
- `earthquake` - Earthquake actions
- `flood` - Flooding actions

### 2. Business Type Modifiers (`BUSINESS_TYPE_MODIFIERS`)
Contains business-specific modifications:
- `tourism` - Hotels, resorts, tour operators
- `retail` - Stores, shops, sales businesses
- `food_service` - Restaurants, catering, food businesses
- `manufacturing` - Production, factory, industrial
- `technology` - Software, IT, tech services

### 3. Business Type Detection (`getBusinessTypeFromFormData`)
Automatically detects business type from form data

## How to Edit Action Plans

### Adding a New Hazard Type

1. **Add to `HAZARD_ACTION_PLANS` object:**
```typescript
'new_hazard': {
  resourcesNeeded: [
    'Resource 1',
    'Resource 2',
    // ... add more resources
  ],
  immediateActions: [
    { 
      task: 'First immediate action', 
      responsible: 'Who does it', 
      duration: '30 minutes', 
      priority: 'high' 
    },
    // ... add more immediate actions
  ],
  shortTermActions: [
    { 
      task: 'First short-term action', 
      responsible: 'Who does it', 
      duration: '2 hours', 
      priority: 'medium' 
    },
    // ... add more short-term actions
  ],
  mediumTermActions: [
    { 
      task: 'First medium-term action', 
      responsible: 'Who does it', 
      duration: '1 week', 
      priority: 'medium' 
    },
    // ... add more medium-term actions
  ],
  longTermReduction: [
    'Long-term prevention measure 1',
    'Long-term prevention measure 2',
    // ... add more prevention measures
  ]
}
```

### Modifying Existing Hazard Actions

1. **Navigate to the hazard in `HAZARD_ACTION_PLANS`**
2. **Edit any section:**
   - `resourcesNeeded` - Array of strings
   - `immediateActions` - Array of ActionItem objects (0-24 hours)
   - `shortTermActions` - Array of ActionItem objects (1-7 days)
   - `mediumTermActions` - Array of ActionItem objects (1-4 weeks)
   - `longTermReduction` - Array of strings (ongoing prevention)

3. **ActionItem format:**
```typescript
{
  task: "What needs to be done",
  responsible: "Who is responsible", 
  duration: "How long it takes",
  priority: "high" | "medium" | "low"
}
```

### Adding a New Business Type

1. **Add to `BUSINESS_TYPE_MODIFIERS` object:**
```typescript
'new_business_type': {
  additionalResources: [
    'Business-specific resource 1',
    'Business-specific resource 2'
  ],
  modifiedActions: {
    immediate: [
      { 
        task: 'Business-specific immediate action', 
        responsible: 'Role', 
        duration: '1 hour', 
        priority: 'high' 
      }
    ],
    shortTerm: [
      { 
        task: 'Business-specific short-term action', 
        responsible: 'Role', 
        duration: '1 day', 
        priority: 'medium' 
      }
    ],
    mediumTerm: [
      { 
        task: 'Business-specific medium-term action', 
        responsible: 'Role', 
        duration: '1 week', 
        priority: 'medium' 
      }
    ]
  },
  specificConsiderations: [
    'Important consideration 1 for this business type',
    'Important consideration 2 for this business type'
  ]
}
```

2. **Update business type detection in `getBusinessTypeFromFormData`:**
```typescript
if (businessDescription.includes('keyword1') || businessDescription.includes('keyword2')) {
  return 'new_business_type'
}
```

### Modifying Existing Business Type Modifiers

1. **Navigate to the business type in `BUSINESS_TYPE_MODIFIERS`**
2. **Edit any section:**
   - `additionalResources` - Extra resources specific to this business type
   - `modifiedActions.immediate` - Additional immediate actions
   - `modifiedActions.shortTerm` - Additional short-term actions  
   - `modifiedActions.mediumTerm` - Additional medium-term actions
   - `specificConsiderations` - Important notes for this business type

## Quick Edit Examples

### Example 1: Add More Hurricane Resources
```typescript
// In HAZARD_ACTION_PLANS['hurricane'].resourcesNeeded, add:
'Satellite communication device',
'Emergency medical supplies',
'Waterproof document storage'
```

### Example 2: Add Tourism-Specific Action
```typescript
// In BUSINESS_TYPE_MODIFIERS['tourism'].modifiedActions.immediate, add:
{ 
  task: 'Coordinate with local tourism emergency response', 
  responsible: 'General Manager', 
  duration: '1 hour', 
  priority: 'high' 
}
```

### Example 3: Create New Business Type for Healthcare
```typescript
'healthcare': {
  additionalResources: [
    'Medical equipment backup power',
    'Patient evacuation procedures',
    'Medical records backup systems',
    'Emergency medical supplies'
  ],
  modifiedActions: {
    immediate: [
      { 
        task: 'Ensure patient safety and medical equipment functionality', 
        responsible: 'Medical Director', 
        duration: '30 minutes', 
        priority: 'high' 
      }
    ]
  },
  specificConsiderations: [
    'Patient safety is the highest priority',
    'Medical equipment requires uninterrupted power',
    'Compliance with healthcare regulations during emergencies'
  ]
}
```

## Testing Your Changes

1. **Save the file** (`src/data/actionPlansMatrix.ts`)
2. **Restart the development server** if running
3. **Navigate to the Business Plan Review section**
4. **Complete a risk assessment** with high/extreme risks
5. **Check the Action Plans section** to see your changes

## Tips for Effective Action Plans

### Good Action Items:
- **Specific**: Clear, actionable tasks
- **Responsible**: Named role or person
- **Timed**: Realistic duration estimates
- **Prioritized**: High/Medium/Low priority

### Resource Lists Should Include:
- **Quantities** where relevant (e.g., "72-hour fuel supply")
- **Specifications** where important (e.g., "Class A fire extinguisher")
- **Cost estimates** for budgeting (e.g., "$5,000 emergency fund")

### Business Type Considerations:
- **Industry regulations** and compliance requirements
- **Sector-specific risks** and vulnerabilities
- **Customer/client impact** considerations
- **Specialized equipment** or procedures

## File Structure Reference

```
src/data/actionPlansMatrix.ts
├── Interfaces (ActionItem, ActionPlan, BusinessTypeModifiers)
├── HAZARD_ACTION_PLANS
│   ├── hurricane
│   ├── power_outage
│   ├── cyber_attack
│   ├── fire
│   ├── earthquake
│   └── flood
├── BUSINESS_TYPE_MODIFIERS
│   ├── tourism
│   ├── retail
│   ├── food_service
│   ├── manufacturing
│   └── technology
└── getBusinessTypeFromFormData()
```

## Need Help?
If you need to add complex logic or modify the application behavior (not just the data), you may need to edit the application code in `src/components/BusinessPlanReview.tsx`.

---

**Remember:** This matrix allows you to update all action plans without touching application logic, making it easy to maintain and customize for different regions, regulations, or business needs! 
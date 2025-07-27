import {
  HAZARD_ACTION_PLANS,
  BUSINESS_TYPE_MODIFIERS,
  getBusinessTypeFromFormData,
} from '../data/actionPlansMatrix'

const normalizeHazardName = (name: string): string => {
  if (!name) return ''
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ') // Replace special chars with spaces
    .replace(/\s+/g, ' ') // Normalize multiple spaces
    .trim()
}

// This function is now centralized here to be used by both the pre-fill service and the StructuredInput component.
export const generateSmartActionPlans = (stepData: any) => {
  if (!stepData) {
    console.warn('generateSmartActionPlans called with no stepData')
    return []
  }

  const businessOverview = stepData.BUSINESS_OVERVIEW || {}
  const riskAssessment = stepData.RISK_ASSESSMENT || {}

  const riskMatrix =
    riskAssessment['Risk Assessment Matrix'] ||
    riskAssessment['riskMatrix'] ||
    riskAssessment['Risk Matrix'] ||
    (Array.isArray(riskAssessment) ? riskAssessment : [])

  if (!riskMatrix || !Array.isArray(riskMatrix) || riskMatrix.length === 0) {
    console.warn('No valid risk matrix found for action plan generation.')
    return []
  }

  // Filter for high and extreme risk hazards (case-insensitive)
  const priorityHazards = riskMatrix.filter((risk: any) => {
    const riskLevel = (
      risk.riskLevel ||
      risk.RiskLevel ||
      risk.risk_level ||
      ''
    ).toLowerCase()
    return riskLevel.includes('high') || riskLevel.includes('extreme')
  })

  const businessType = getBusinessTypeFromFormData({
    BUSINESS_OVERVIEW: businessOverview,
    ...businessOverview,
  })

  const businessModifiers = BUSINESS_TYPE_MODIFIERS[businessType] || {}

  // Generate action plans for each priority hazard
  return priorityHazards.map((risk: any) => {
    const hazardName = risk.hazard || risk.Hazard || ''
    const riskLevel = risk.riskLevel || risk.RiskLevel || 'High'

    const hazardKey = Object.keys(HAZARD_ACTION_PLANS).find((key: string) => {
      const normalizedKey = normalizeHazardName(key)
      const normalizedHazard = normalizeHazardName(hazardName)

      if (normalizedKey === normalizedHazard) return true
      if (
        normalizedKey.includes(normalizedHazard) ||
        normalizedHazard.includes(normalizedKey)
      )
        return true

      const variations: { [key: string]: string[] } = {
        hurricane: ['hurricane', 'tropical storm', 'cyclone', 'typhoon'],
        power_outage: [
          'power outage',
          'power failure',
          'electrical outage',
          'blackout',
          'extended power outage',
        ],
        cyber_attack: [
          'cyber attack',
          'cyber security',
          'cybercrime',
          'hacking',
          'data breach',
        ],
        flood: ['flood', 'flooding', 'flash flood', 'coastal flood', 'river flood'],
        fire: ['fire', 'fire emergency', 'blaze', 'conflagration'],
        earthquake: ['earthquake', 'seismic', 'tremor', 'quake'],
      }

      const keyVariations = variations[key] || []
      return keyVariations.some((variant) =>
        normalizedHazard.includes(normalizeHazardName(variant))
      )
    })

    let actionPlan = hazardKey
      ? JSON.parse(JSON.stringify(HAZARD_ACTION_PLANS[hazardKey])) // Deep copy to prevent mutation
      : {
          resourcesNeeded: [
            'Emergency response team',
            'Communication equipment',
            'Emergency supplies',
            'First aid kit',
            'Backup power source',
          ],
          immediateActions: [
            {
              task: 'Activate emergency response team',
              responsible: 'Management',
              duration: '1 hour',
              priority: 'high',
            },
            {
              task: 'Assess immediate threat level',
              responsible: 'Safety Officer',
              duration: '30 minutes',
              priority: 'high',
            },
            {
              task: 'Notify all staff and stakeholders',
              responsible: 'Communications',
              duration: '1 hour',
              priority: 'high',
            },
          ],
        }

    // Apply business type modifications
    if (businessModifiers.additionalResources) {
      actionPlan.resourcesNeeded = [
        ...actionPlan.resourcesNeeded,
        ...businessModifiers.additionalResources,
      ]
    }
    if (businessModifiers.modifiedActions) {
      if (businessModifiers.modifiedActions.immediate) {
        actionPlan.immediateActions = [
          ...actionPlan.immediateActions,
          ...businessModifiers.modifiedActions.immediate,
        ]
      }
    }

    return {
      hazard: hazardName,
      riskLevel: riskLevel,
      businessType: businessType,
      ...actionPlan,
    }
  })
} 
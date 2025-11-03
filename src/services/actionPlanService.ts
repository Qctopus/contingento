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
  // Return an empty array to disable the automatic generation of action plans.
  // All plan content should come from strategies selected by the user from the admin2 backend.
  return []
} 
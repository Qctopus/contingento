// Business Continuity Action Plans Matrix
// This file contains the comprehensive matrix of actions for different business types and risk scenarios
// Edit this file to update action plans without modifying application logic

export interface ActionItem {
  task: string
  responsible: string
  duration?: string
  priority?: 'high' | 'medium' | 'low'
}

export interface ActionPlan {
  resourcesNeeded: string[]
  immediateActions: ActionItem[]      // 0-24 hours
  shortTermActions: ActionItem[]      // 1-7 days  
  mediumTermActions: ActionItem[]     // 1-4 weeks
  longTermReduction: string[]         // Ongoing prevention
}

export interface BusinessTypeModifiers {
  [businessType: string]: {
    additionalResources?: string[]
    modifiedActions?: {
      immediate?: ActionItem[]
      shortTerm?: ActionItem[]
      mediumTerm?: ActionItem[]
    }
    specificConsiderations?: string[]
  }
}

// Base action plans for each hazard type
export const HAZARD_ACTION_PLANS: { [hazardKey: string]: ActionPlan } = {
  // All hardcoded action plans have been removed as per the requirement to use backend data.
}

// Business type specific modifications to base plans
export const BUSINESS_TYPE_MODIFIERS: BusinessTypeModifiers = {
  // All hardcoded business type modifiers have been removed.
}

// Function to get business type from form data
export function getBusinessTypeFromFormData(formData: any): string {
  const businessPurpose = formData?.BUSINESS_OVERVIEW?.['Business Purpose']?.toLowerCase() || ''
  const productsServices = formData?.BUSINESS_OVERVIEW?.['Products & Services']?.toLowerCase() || ''
  const businessDescription = `${businessPurpose} ${productsServices}`.toLowerCase()

  // Business type detection logic
  if (businessDescription.includes('hotel') || businessDescription.includes('resort') || 
      businessDescription.includes('tour') || businessDescription.includes('tourism') ||
      businessDescription.includes('restaurant') || businessDescription.includes('accommodation')) {
    return 'tourism'
  }
  
  if (businessDescription.includes('retail') || businessDescription.includes('shop') || 
      businessDescription.includes('store') || businessDescription.includes('sales') ||
      businessDescription.includes('customer') || businessDescription.includes('merchandise')) {
    return 'retail'
  }
  
  if (businessDescription.includes('restaurant') || businessDescription.includes('food') || 
      businessDescription.includes('catering') || businessDescription.includes('kitchen') ||
      businessDescription.includes('dining') || businessDescription.includes('culinary')) {
    return 'food_service'
  }
  
  if (businessDescription.includes('manufacturing') || businessDescription.includes('production') || 
      businessDescription.includes('factory') || businessDescription.includes('assembly') ||
      businessDescription.includes('industrial') || businessDescription.includes('processing')) {
    return 'manufacturing'
  }
  
  if (businessDescription.includes('technology') || businessDescription.includes('software') || 
      businessDescription.includes('it ') || businessDescription.includes('tech') ||
      businessDescription.includes('digital') || businessDescription.includes('computer')) {
    return 'technology'
  }
  
  return 'general' // Default fallback
} 
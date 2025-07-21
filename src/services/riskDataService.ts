import { LocationData, HazardRiskLevel } from '../data/types'
import { locationHazards } from '../data/hazardMappings'
import { industryProfiles } from '../data/industryProfiles'

// Use TypeScript data directly instead of loading JSON
function getLocationHazardsData() {
  return {
    countries: locationHazards
  }
}

function getIndustryProfilesData() {
  return {
    industries: industryProfiles
  }
}

// Get location hazards for a specific country
export function getLocationHazards(countryCode: string) {
  const data = getLocationHazardsData()
  return data.countries.find((country: any) => country.countryCode === countryCode)
}

// Get all available countries
export function getAvailableCountries() {
  const data = getLocationHazardsData()
  return data.countries.map((country: any) => ({
    name: country.country,
    code: country.countryCode
  }))
}

// Get parishes for a specific country
export function getCountryParishes(countryCode: string) {
  const location = getLocationHazards(countryCode)
  if (!location || !location.parishSpecific) return []
  return Object.keys(location.parishSpecific)
}

// Calculate location-based risk
export function calculateLocationRisk(
  countryCode: string,
  parish?: string,
  nearCoast: boolean = false,
  urbanArea: boolean = false
): HazardRiskLevel[] {
  const location = getLocationHazards(countryCode)
  if (!location) return []

  let hazards = [...location.baseHazards]

  // Add parish-specific hazards
  if (parish && location.parishSpecific?.[parish]) {
    hazards = [...hazards, ...location.parishSpecific[parish]]
  }

  // Add coastal hazards
  if (nearCoast && location.coastalModifiers) {
    hazards = [...hazards, ...location.coastalModifiers]
  }

  // Add urban hazards
  if (urbanArea && location.urbanModifiers) {
    hazards = [...hazards, ...location.urbanModifiers]
  }

  // Remove duplicates based on hazardId
  const uniqueHazards = hazards.reduce((acc, current) => {
    const existing = acc.find((item: HazardRiskLevel) => item.hazardId === current.hazardId)
    if (!existing) {
      acc.push(current)
    } else {
      // If duplicate, keep the one with higher risk level
      const riskLevels: { [key: string]: number } = { 'low': 1, 'medium': 2, 'high': 3, 'very_high': 4 }
      const currentLevel = riskLevels[current.riskLevel] || 0
      const existingLevel = riskLevels[existing.riskLevel] || 0
      if (currentLevel > existingLevel) {
        const index = acc.indexOf(existing)
        acc[index] = current
      }
    }
    return acc
  }, [] as HazardRiskLevel[])

  return uniqueHazards
}

// Get industry profile by ID
export function getIndustryProfile(id: string) {
  const data = getIndustryProfilesData()
  return data.industries.find((industry: any) => industry.id === id)
}

// Get all industry profiles
export function getAllIndustryProfiles() {
  const data = getIndustryProfilesData()
  return data.industries
}

// Get industries by category
export function getIndustriesByCategory(category: string) {
  const data = getIndustryProfilesData()
  return data.industries.filter((industry: any) => industry.category === category)
}

// Update the risk data from external sources (for admin panel in future)
// Note: These functions would need to be reworked for TypeScript-based data
export async function updateLocationHazards(newData: any) {
  try {
    const response = await fetch('/api/update-location-hazards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    })
    
    if (response.ok) {
      // With TypeScript data, updates would require code changes
      console.warn('Location hazards data is now managed in TypeScript files')
      return true
    }
  } catch (error) {
    console.error('Failed to update location hazards:', error)
  }
  return false
}

export async function updateIndustryProfiles(newData: any) {
  try {
    const response = await fetch('/api/update-industry-profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    })
    
    if (response.ok) {
      // With TypeScript data, updates would require code changes
      console.warn('Industry profiles data is now managed in TypeScript files')
      return true
    }
  } catch (error) {
    console.error('Failed to update industry profiles:', error)
  }
  return false
} 
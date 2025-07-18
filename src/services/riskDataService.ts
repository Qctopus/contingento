import { LocationData, HazardRiskLevel } from '../data/types'

// Load JSON data
let locationHazardsData: any = null
let industryProfilesData: any = null

// Load location hazards from JSON
async function loadLocationHazards() {
  if (!locationHazardsData) {
    try {
      const response = await fetch('/data/json/locationHazards.json')
      locationHazardsData = await response.json()
    } catch (error) {
      console.error('Failed to load location hazards data:', error)
      locationHazardsData = { countries: [] }
    }
  }
  return locationHazardsData
}

// Load industry profiles from JSON
async function loadIndustryProfiles() {
  if (!industryProfilesData) {
    try {
      const response = await fetch('/data/json/industryProfiles.json')
      industryProfilesData = await response.json()
    } catch (error) {
      console.error('Failed to load industry profiles data:', error)
      industryProfilesData = { industries: [] }
    }
  }
  return industryProfilesData
}

// Get location hazards for a specific country
export async function getLocationHazards(countryCode: string) {
  const data = await loadLocationHazards()
  return data.countries.find((country: any) => country.countryCode === countryCode)
}

// Get all available countries
export async function getAvailableCountries() {
  const data = await loadLocationHazards()
  return data.countries.map((country: any) => ({
    name: country.country,
    code: country.countryCode
  }))
}

// Get parishes for a specific country
export async function getCountryParishes(countryCode: string) {
  const location = await getLocationHazards(countryCode)
  if (!location || !location.parishSpecific) return []
  return Object.keys(location.parishSpecific)
}

// Calculate location-based risk
export async function calculateLocationRisk(
  countryCode: string,
  parish?: string,
  nearCoast: boolean = false,
  urbanArea: boolean = false
): Promise<HazardRiskLevel[]> {
  const location = await getLocationHazards(countryCode)
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
export async function getIndustryProfile(id: string) {
  const data = await loadIndustryProfiles()
  return data.industries.find((industry: any) => industry.id === id)
}

// Get all industry profiles
export async function getAllIndustryProfiles() {
  const data = await loadIndustryProfiles()
  return data.industries
}

// Get industries by category
export async function getIndustriesByCategory(category: string) {
  const data = await loadIndustryProfiles()
  return data.industries.filter((industry: any) => industry.category === category)
}

// Update the risk data from external sources (for admin panel in future)
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
      locationHazardsData = null // Clear cache to force reload
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
      industryProfilesData = null // Clear cache to force reload
      return true
    }
  } catch (error) {
    console.error('Failed to update industry profiles:', error)
  }
  return false
} 
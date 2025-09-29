// Service to integrate admin data with user-facing wizard
export interface AdminBusinessType {
  id: string
  businessTypeId: string
  name: string
  localName: string
  category: string
  description?: string
  typicalOperatingHours?: string
  minimumStaff?: string
  minimumEquipment?: string
  minimumUtilities?: string
  minimumSpace?: string
  essentialFunctions?: string
  criticalSuppliers?: string
  dependencies?: string
  isActive: boolean
}

export interface AdminLocation {
  id: string
  country: string
  countryCode: string
  parish?: string
  isCoastal: boolean
  isUrban: boolean
  isActive: boolean
}

export interface AdminHazardType {
  id: string
  hazardId: string
  name: string
  category: string
  description?: string
  defaultFrequency: string
  defaultImpact: string
  seasonalPattern?: string
  peakMonths?: string
  warningTime?: string
  geographicScope?: string
  cascadingRisks?: string
  isActive: boolean
}

export interface AdminStrategy {
  id: string
  strategyId: string
  title: string
  description: string
  category: string
  reasoning?: string
  icon?: string
  isActive: boolean
}

export interface RiskCalculationResult {
  businessTypeId: string
  locationId: string
  calculatedRisks: Array<{
    hazardId: string
    riskLevel: string
    reasoning: string
    seasonalAdjustment: number
    coastalMultiplier: number
    cascadingRisks: string[]
  }>
  recommendedStrategies: Array<{
    strategyId: string
    priority: string
    effectiveness: number
    cost: number
    roi: number
    conflicts: string[]
  }>
  riskScore: number
  lastCalculated: Date
}

class AdminDataService {
  private cache = {
    businessTypes: null as AdminBusinessType[] | null,
    locations: null as AdminLocation[] | null,
    hazards: null as AdminHazardType[] | null,
    strategies: null as AdminStrategy[] | null,
    lastFetch: 0
  }

  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private async fetchWithCache<T>(endpoint: string, cacheKey: keyof typeof this.cache): Promise<T> {
    const now = Date.now()
    
    // Return cached data if still valid
    if (this.cache[cacheKey] && (now - this.cache.lastFetch) < this.CACHE_DURATION) {
      return this.cache[cacheKey] as T
    }

    // Map endpoint names to response property names
    const endpointPropertyMap: Record<string, string> = {
      'business-types': 'businessTypes',
      'locations': 'locations',
      'hazards': 'hazards',
      'strategies': 'strategies'
    }

    try {
      const response = await fetch(`/api/admin/${endpoint}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.status}`)
      }
      
      const data = await response.json()
      const propertyName = endpointPropertyMap[endpoint] || endpoint
      const result = data[propertyName] || data
      
      this.cache[cacheKey] = result
      this.cache.lastFetch = now
      
      return result
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error)
      // Return cached data if available, even if expired
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey] as T
      }
      throw error
    }
  }

  // Fetch all business types from admin system
  async getBusinessTypes(): Promise<AdminBusinessType[]> {
    return this.fetchWithCache<AdminBusinessType[]>('business-types', 'businessTypes')
  }

  // Fetch all locations from admin system
  async getLocations(): Promise<AdminLocation[]> {
    return this.fetchWithCache<AdminLocation[]>('locations', 'locations')
  }

  // Fetch all hazards from admin system
  async getHazards(): Promise<AdminHazardType[]> {
    return this.fetchWithCache<AdminHazardType[]>('hazards', 'hazards')
  }

  // Fetch all strategies from admin system
  async getStrategies(): Promise<AdminStrategy[]> {
    return this.fetchWithCache<AdminStrategy[]>('strategies', 'strategies')
  }

  // Calculate risk profile for business type and location
  async calculateRiskProfile(businessTypeId: string, locationId: string): Promise<RiskCalculationResult> {
    try {
      const response = await fetch('/api/admin/risk-calculation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessTypeId,
          locationId
        })
      })

      if (!response.ok) {
        throw new Error(`Risk calculation failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error calculating risk profile:', error)
      throw error
    }
  }

  // Get business types grouped by category for the wizard
  async getBusinessTypesByCategory(): Promise<Array<{
    category: string
    title: string
    businessTypes: AdminBusinessType[]
  }>> {
    const businessTypes = await this.getBusinessTypes()
    
    const categories = [
      { key: 'hospitality', title: 'Food & Hospitality' },
      { key: 'retail', title: 'Retail & Commerce' },
      { key: 'services', title: 'Professional Services' },
      { key: 'healthcare', title: 'Healthcare' },
      { key: 'manufacturing', title: 'Manufacturing & Production' },
      { key: 'agriculture', title: 'Agriculture & Fishing' },
      { key: 'tourism', title: 'Tourism & Recreation' },
      { key: 'industrial', title: 'Industrial & Environmental' }
    ]

    return categories
      .map(cat => ({
        category: cat.key,
        title: cat.title,
        businessTypes: businessTypes.filter(bt => bt.category === cat.key && bt.isActive)
      }))
      .filter(cat => cat.businessTypes.length > 0)
  }

  // Get locations grouped by country for the wizard
  async getLocationsByCountry(): Promise<Array<{
    country: string
    countryCode: string
    locations: AdminLocation[]
  }>> {
    const locations = await this.getLocations()
    
    const grouped = locations
      .filter(loc => loc.isActive)
      .reduce((acc, location) => {
        const existing = acc.find(group => group.country === location.country)
        if (existing) {
          existing.locations.push(location)
        } else {
          acc.push({
            country: location.country,
            countryCode: location.countryCode,
            locations: [location]
          })
        }
        return acc
      }, [] as Array<{ country: string, countryCode: string, locations: AdminLocation[] }>)

    return grouped.sort((a, b) => a.country.localeCompare(b.country))
  }

  // Get business type details for wizard
  async getBusinessTypeDetails(businessTypeId: string): Promise<AdminBusinessType | null> {
    const businessTypes = await this.getBusinessTypes()
    return businessTypes.find(bt => bt.businessTypeId === businessTypeId) || null
  }

  // Get location details for wizard
  async getLocationDetails(locationId: string): Promise<AdminLocation | null> {
    const locations = await this.getLocations()
    return locations.find(loc => loc.id === locationId) || null
  }

  // Get recommended strategies for a business type and location
  async getRecommendedStrategies(businessTypeId: string, locationId: string): Promise<AdminStrategy[]> {
    try {
      const riskProfile = await this.calculateRiskProfile(businessTypeId, locationId)
      const allStrategies = await this.getStrategies()
      
      // Get the top recommended strategies
      const recommendedStrategyIds = riskProfile.recommendedStrategies
        .filter(strategy => strategy.priority === 'high' || strategy.priority === 'very_high')
        .slice(0, 5)
        .map(strategy => strategy.strategyId)

      return allStrategies.filter(strategy => 
        recommendedStrategyIds.includes(strategy.strategyId)
      )
    } catch (error) {
      console.error('Error getting recommended strategies:', error)
      return []
    }
  }

  // Get critical risks for a business type and location
  async getCriticalRisks(businessTypeId: string, locationId: string): Promise<AdminHazardType[]> {
    try {
      const riskProfile = await this.calculateRiskProfile(businessTypeId, locationId)
      const allHazards = await this.getHazards()
      
      // Get high and very high risk hazards
      const criticalHazardIds = riskProfile.calculatedRisks
        .filter(risk => risk.riskLevel === 'high' || risk.riskLevel === 'very_high')
        .map(risk => risk.hazardId)

      return allHazards.filter(hazard => 
        criticalHazardIds.includes(hazard.hazardId)
      )
    } catch (error) {
      console.error('Error getting critical risks:', error)
      return []
    }
  }

  // Clear cache (useful for testing or when admin data changes)
  clearCache() {
    this.cache = {
      businessTypes: null,
      locations: null,
      hazards: null,
      strategies: null,
      lastFetch: 0
    }
  }
}

// Export singleton instance
export const adminDataService = new AdminDataService() 
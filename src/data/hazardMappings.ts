import { LocationHazards, HazardRiskLevel } from './types'

// Base hazard definitions with standardized risk assessments
const createHazard = (
  id: string,
  name: string,
  riskLevel: 'low' | 'medium' | 'high' | 'very_high',
  frequency: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost_certain',
  impact: 'minimal' | 'minor' | 'moderate' | 'major' | 'catastrophic'
): HazardRiskLevel => ({
  hazardId: id,
  hazardName: name,
  riskLevel,
  frequency,
  impact
})

export const locationHazards: LocationHazards[] = [
  {
    country: 'Jamaica',
    countryCode: 'JM',
    baseHazards: [
      createHazard('hurricane', 'Hurricane/Tropical Storm', 'high', 'likely', 'major'),
      createHazard('earthquake', 'Earthquake', 'medium', 'possible', 'major'),
      createHazard('flash_flood', 'Flash Flooding', 'medium', 'possible', 'moderate'),
      createHazard('drought', 'Drought', 'medium', 'possible', 'moderate'),
      createHazard('power_outage', 'Power Outage', 'high', 'likely', 'minor'),
      createHazard('economic_downturn', 'Economic Downturn', 'medium', 'possible', 'moderate'),
      createHazard('supply_disruption', 'Supply Chain Disruption', 'medium', 'possible', 'moderate'),
      createHazard('crime', 'Crime/Security Issues', 'medium', 'possible', 'minor'),
      createHazard('industrial_accident', 'Industrial Accident', 'medium', 'possible', 'major'),
      createHazard('chemical_spill', 'Chemical Spill', 'low', 'unlikely', 'major'),
      createHazard('environmental_contamination', 'Environmental Contamination', 'medium', 'possible', 'moderate'),
      createHazard('waste_management_failure', 'Waste Management Failure', 'medium', 'possible', 'minor'),
      createHazard('air_pollution', 'Air Pollution Event', 'medium', 'possible', 'moderate'),
      createHazard('water_contamination', 'Water Contamination', 'medium', 'possible', 'major')
    ],
    parishSpecific: {
      'Kingston': [
        createHazard('urban_flooding', 'Urban Flooding', 'high', 'likely', 'moderate'),
        createHazard('traffic_disruption', 'Traffic/Transport Disruption', 'high', 'likely', 'minor')
      ],
      'St. Andrew': [
        createHazard('landslide', 'Landslide', 'medium', 'possible', 'major'),
        createHazard('urban_flooding', 'Urban Flooding', 'medium', 'possible', 'moderate')
      ],
      'Portland': [
        createHazard('landslide', 'Landslide', 'high', 'likely', 'major'),
        createHazard('river_flooding', 'River Flooding', 'medium', 'possible', 'moderate')
      ],
      'St. Thomas': [
        createHazard('landslide', 'Landslide', 'medium', 'possible', 'major'),
        createHazard('river_flooding', 'River Flooding', 'medium', 'possible', 'moderate')
      ],
      'St. Catherine': [
        createHazard('urban_flooding', 'Urban Flooding', 'medium', 'possible', 'moderate'),
        createHazard('industrial_accident', 'Industrial Accident', 'medium', 'possible', 'moderate')
      ],
      'Clarendon': [
        createHazard('drought', 'Drought', 'high', 'likely', 'moderate'),
        createHazard('flash_flood', 'Flash Flooding', 'medium', 'possible', 'moderate')
      ],
      'Manchester': [
        createHazard('landslide', 'Landslide', 'medium', 'possible', 'major'),
        createHazard('drought', 'Drought', 'medium', 'possible', 'moderate')
      ],
      'St. Elizabeth': [
        createHazard('drought', 'Drought', 'high', 'likely', 'moderate'),
        createHazard('flash_flood', 'Flash Flooding', 'low', 'unlikely', 'minor')
      ],
      'Westmoreland': [
        createHazard('coastal_flooding', 'Coastal Flooding', 'high', 'likely', 'moderate'),
        createHazard('hurricane', 'Hurricane/Tropical Storm', 'high', 'likely', 'major')
      ],
      'Hanover': [
        createHazard('coastal_flooding', 'Coastal Flooding', 'medium', 'possible', 'moderate'),
        createHazard('tourism_disruption', 'Tourism Disruption', 'medium', 'possible', 'moderate')
      ],
      'St. James': [
        createHazard('coastal_flooding', 'Coastal Flooding', 'high', 'likely', 'moderate'),
        createHazard('tourism_disruption', 'Tourism Disruption', 'high', 'likely', 'moderate'),
        createHazard('urban_flooding', 'Urban Flooding', 'medium', 'possible', 'moderate')
      ],
      'Trelawny': [
        createHazard('coastal_erosion', 'Coastal Erosion', 'medium', 'possible', 'moderate'),
        createHazard('tourism_disruption', 'Tourism Disruption', 'medium', 'possible', 'moderate')
      ],
      'St. Ann': [
        createHazard('tourism_disruption', 'Tourism Disruption', 'high', 'likely', 'moderate'),
        createHazard('flash_flood', 'Flash Flooding', 'medium', 'possible', 'moderate')
      ],
      'St. Mary': [
        createHazard('flash_flood', 'Flash Flooding', 'high', 'likely', 'moderate'),
        createHazard('landslide', 'Landslide', 'medium', 'possible', 'major')
      ]
    },
    coastalModifiers: [
      createHazard('storm_surge', 'Storm Surge', 'high', 'likely', 'major'),
      createHazard('coastal_erosion', 'Coastal Erosion', 'medium', 'possible', 'moderate'),
      createHazard('tsunami', 'Tsunami', 'low', 'rare', 'catastrophic')
    ],
    urbanModifiers: [
      createHazard('infrastructure_failure', 'Infrastructure Failure', 'medium', 'possible', 'moderate'),
      createHazard('crowd_management', 'Crowd Management Issues', 'low', 'unlikely', 'minor')
    ]
  },
  {
    country: 'Barbados',
    countryCode: 'BB',
    baseHazards: [
      createHazard('hurricane', 'Hurricane/Tropical Storm', 'high', 'likely', 'major'),
      createHazard('drought', 'Drought', 'high', 'likely', 'moderate'),
      createHazard('power_outage', 'Power Outage', 'medium', 'possible', 'minor'),
      createHazard('economic_downturn', 'Economic Downturn', 'medium', 'possible', 'moderate'),
      createHazard('supply_disruption', 'Supply Chain Disruption', 'high', 'likely', 'moderate'),
      createHazard('pandemic', 'Pandemic/Health Crisis', 'medium', 'possible', 'major')
    ],
    parishSpecific: {
      'Christ Church': [
        createHazard('coastal_flooding', 'Coastal Flooding', 'high', 'likely', 'moderate')
      ],
      'St. Michael': [
        createHazard('urban_congestion', 'Urban Congestion/Traffic', 'medium', 'possible', 'minor')
      ],
      'St. John': [
        createHazard('water_shortage', 'Water Shortage', 'medium', 'possible', 'moderate')
      ]
    },
    coastalModifiers: [
      createHazard('storm_surge', 'Storm Surge', 'high', 'likely', 'major'),
      createHazard('coastal_erosion', 'Coastal Erosion', 'high', 'likely', 'moderate'),
      createHazard('sargassum', 'Sargassum Seaweed Impact', 'medium', 'possible', 'minor')
    ],
    urbanModifiers: [
      createHazard('water_shortage', 'Water Shortage', 'medium', 'possible', 'moderate'),
      createHazard('waste_management', 'Waste Management Issues', 'low', 'unlikely', 'minor')
    ]
  },
  {
    country: 'Trinidad and Tobago',
    countryCode: 'TT',
    baseHazards: [
      createHazard('hurricane', 'Hurricane/Tropical Storm', 'medium', 'possible', 'major'),
      createHazard('flash_flood', 'Flash Flooding', 'high', 'likely', 'moderate'),
      createHazard('landslide', 'Landslide', 'medium', 'possible', 'major'),
      createHazard('power_outage', 'Power Outage', 'medium', 'possible', 'minor'),
      createHazard('economic_downturn', 'Economic Downturn', 'medium', 'possible', 'moderate'),
      createHazard('supply_disruption', 'Supply Chain Disruption', 'medium', 'possible', 'moderate'),
      createHazard('crime', 'Crime/Security Issues', 'high', 'likely', 'moderate')
    ],
    parishSpecific: {
      'Port of Spain': [
        createHazard('urban_flooding', 'Urban Flooding', 'high', 'likely', 'moderate'),
        createHazard('traffic_disruption', 'Traffic/Transport Disruption', 'high', 'likely', 'minor')
      ],
      'San Fernando': [
        createHazard('industrial_accident', 'Industrial Accident', 'low', 'unlikely', 'major'),
        createHazard('air_pollution', 'Air Pollution', 'medium', 'possible', 'minor')
      ],
      'Tobago': [
        createHazard('water_shortage', 'Water Shortage', 'medium', 'possible', 'moderate'),
        createHazard('tourism_disruption', 'Tourism Disruption', 'medium', 'possible', 'moderate')
      ]
    },
    coastalModifiers: [
      createHazard('storm_surge', 'Storm Surge', 'medium', 'possible', 'moderate'),
      createHazard('coastal_erosion', 'Coastal Erosion', 'medium', 'possible', 'moderate'),
      createHazard('oil_spill', 'Oil Spill', 'low', 'unlikely', 'major')
    ],
    urbanModifiers: [
      createHazard('infrastructure_failure', 'Infrastructure Failure', 'medium', 'possible', 'moderate'),
      createHazard('industrial_accident', 'Industrial Accident', 'low', 'unlikely', 'major')
    ]
  }
]

export const getLocationHazards = (countryCode: string): LocationHazards | undefined => {
  return locationHazards.find(location => location.countryCode === countryCode)
}

export const calculateLocationRisk = (
  countryCode: string,
  parish?: string,
  nearCoast: boolean = false,
  urbanArea: boolean = false
): HazardRiskLevel[] => {
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
    const existing = acc.find(item => item.hazardId === current.hazardId)
    if (!existing) {
      acc.push(current)
    } else {
      // If duplicate, keep the one with higher risk level
      const riskLevels = { 'low': 1, 'medium': 2, 'high': 3, 'very_high': 4 }
      if (riskLevels[current.riskLevel] > riskLevels[existing.riskLevel]) {
        const index = acc.indexOf(existing)
        acc[index] = current
      }
    }
    return acc
  }, [] as HazardRiskLevel[])

  return uniqueHazards
}

// Helper function to get all available countries
export const getAvailableCountries = () => {
  return locationHazards.map(location => ({
    code: location.countryCode,
    name: location.country
  }))
}

// Helper function to get parishes for a specific country
export const getCountryParishes = (countryCode: string): string[] => {
  const location = getLocationHazards(countryCode)
  return location?.parishSpecific ? Object.keys(location.parishSpecific) : []
} 
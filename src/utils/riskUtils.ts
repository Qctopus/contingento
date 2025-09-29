// Shared risk calculation and display utilities

export const getRiskColor = (level: number): string => {
  if (level >= 8) return 'bg-red-500'
  if (level >= 6) return 'bg-orange-500'
  if (level >= 4) return 'bg-yellow-500'
  if (level >= 2) return 'bg-blue-500'
  return 'bg-green-500'
}

export const getRiskTextColor = (level: number): string => {
  if (level >= 8) return 'text-red-600 bg-red-50 border-red-200'
  if (level >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  if (level >= 4) return 'text-blue-600 bg-blue-50 border-blue-200'
  return 'text-green-600 bg-green-50 border-green-200'
}

export const getRiskLabel = (level: number): string => {
  if (level >= 8) return 'Critical'
  if (level >= 6) return 'High'
  if (level >= 4) return 'Medium'
  if (level >= 2) return 'Low'
  return 'Very Low'
}

export const getRiskIntensity = (level: number): string => {
  if (level >= 8) return 'opacity-100'
  if (level >= 6) return 'opacity-75'
  if (level >= 4) return 'opacity-50'
  return 'opacity-25'
}

export const getCostColor = (cost: string): string => {
  switch (cost) {
    case 'low': return 'text-green-600 bg-green-50'
    case 'medium': return 'text-yellow-600 bg-yellow-50'
    case 'high': return 'text-red-600 bg-red-50'
    case 'very_high': return 'text-red-800 bg-red-100'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'critical': return 'text-red-600 bg-red-50'
    case 'high': return 'text-orange-600 bg-orange-50'
    case 'medium': return 'text-yellow-600 bg-yellow-50'
    case 'low': return 'text-green-600 bg-green-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export const getAverageRiskLevel = (vulnerabilities: number[]): number => {
  const validVulns = vulnerabilities.filter(v => v > 0)
  if (validVulns.length === 0) return 0
  const sum = validVulns.reduce((acc, vuln) => acc + vuln, 0)
  return Math.round(sum / validVulns.length)
}

export const getMaxRiskLevel = (risks: Record<string, any>): number => {
  const levels = Object.keys(risks)
    .filter(key => !['lastUpdated', 'updatedBy'].includes(key))
    .map(key => {
      const risk = risks[key]
      return typeof risk === 'object' && risk !== null && 'level' in risk ? risk.level : 0
    })
  return Math.max(...levels, 0)
}


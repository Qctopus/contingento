/**
 * Time Calculation Utilities
 * Parses action step timeframes and calculates total strategy implementation time
 */

/**
 * Parses a timeframe string and converts to hours
 * Handles formats like: "2 hours", "1-2 days", "1 week", "1 month", "Start this week"
 */
export function parseTimeframeToHours(timeframe: string | undefined | null): number {
  if (!timeframe || typeof timeframe !== 'string') return 0
  
  const lower = timeframe.toLowerCase().trim()
  
  // Handle special cases
  if (lower.includes('start this week') || lower.includes('ongoing') || lower.includes('asap')) {
    return 1 // Assume 1 hour setup time
  }
  
  // Extract numbers - handle ranges like "1-2 days"
  const numberMatch = lower.match(/(\d+)(?:\s*[-to]\s*(\d+))?/)
  if (!numberMatch) return 0
  
  const min = parseInt(numberMatch[1])
  const max = numberMatch[2] ? parseInt(numberMatch[2]) : min
  const avg = (min + max) / 2
  
  // Convert to hours based on unit
  if (lower.includes('minute')) return avg / 60
  if (lower.includes('hour')) return avg
  if (lower.includes('day')) return avg * 8
  if (lower.includes('week')) return avg * 40
  if (lower.includes('month')) return avg * 160
  if (lower.includes('year')) return avg * 1920
  
  return 0
}

/**
 * Calculates total implementation time by summing all action step timeframes
 */
export function calculateStrategyTimeFromSteps(actionSteps: any[]): number {
  if (!actionSteps || actionSteps.length === 0) return 0
  
  const totalHours = actionSteps.reduce((sum, step) => {
    const hours = parseTimeframeToHours(step.timeframe)
    return sum + hours
  }, 0)
  
  return Math.round(totalHours * 10) / 10 // Round to 1 decimal
}

/**
 * Formats hours into human-readable format
 */
export function formatHoursToDisplay(hours: number): string {
  if (hours === 0) return 'TBD'
  if (hours < 1) return 'Less than 1 hour'
  if (hours === 1) return '1 hour'
  if (hours < 8) return `~${Math.round(hours)}h`
  if (hours < 40) {
    const days = Math.round(hours / 8)
    return `~${days} ${days === 1 ? 'day' : 'days'}`
  }
  if (hours < 160) {
    const weeks = Math.round(hours / 40)
    return `~${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
  }
  const months = Math.round(hours / 160)
  return `~${months} ${months === 1 ? 'month' : 'months'}`
}

/**
 * Validates action steps have timeframes and logs warnings
 */
export function validateActionStepTimeframes(strategy: any): void {
  if (!strategy.actionSteps || strategy.actionSteps.length === 0) {
    console.warn(`[Time Validation] Strategy "${strategy.name}" has NO action steps`)
    return
  }
  
  const stepsWithTime = strategy.actionSteps.filter((step: any) => step.timeframe)
  
  if (stepsWithTime.length === 0) {
    console.warn(`[Time Validation] Strategy "${strategy.name}" has ${strategy.actionSteps.length} action steps but NONE have timeframes!`)
  } else if (stepsWithTime.length < strategy.actionSteps.length) {
    console.warn(`[Time Validation] Strategy "${strategy.name}": ${stepsWithTime.length}/${strategy.actionSteps.length} action steps have timeframes`)
  } else {
    console.log(`[Time Validation] Strategy "${strategy.name}": All ${strategy.actionSteps.length} action steps have timeframes ✓`)
  }
}


/**
 * Hook to calculate strategy costs in real-time as user edits action steps
 * 
 * Automatically recalculates costs whenever:
 * - Action steps are added/removed
 * - Cost items are added/removed/modified
 * - Quantities change
 * 
 * Per requirements: Default currency is USD
 */
import { useState, useEffect } from 'react'
import { costCalculationService } from '@/services/costCalculationService'
import type { ActionStep } from '@/types/admin'

interface CostCalculationResult {
  totalUSD: number
  totalLocal: number
  currencyCode: string
  currencySymbol: string
  calculatedHours: number
  isCalculating: boolean
  error: string | null
}

export function useStrategyCostCalculation(
  actionSteps: ActionStep[],
  countryCode: string = 'US' // Default to USD per requirements
): CostCalculationResult {
  const [result, setResult] = useState<CostCalculationResult>({
    totalUSD: 0,
    totalLocal: 0,
    currencyCode: 'USD',
    currencySymbol: '$',
    calculatedHours: 0,
    isCalculating: false,
    error: null
  })

  useEffect(() => {
    const calculateCosts = async () => {
      // Skip if no action steps
      if (!actionSteps || actionSteps.length === 0) {
        setResult(prev => ({
          ...prev,
          totalUSD: 0,
          totalLocal: 0,
          calculatedHours: 0,
          isCalculating: false
        }))
        return
      }

      // Check if any step has cost items
      const hasCostItems = actionSteps.some(
        step => step.costItems && step.costItems.length > 0
      )
      
      // If no cost items, set to $0 (per requirements: show $0, not TBD)
      if (!hasCostItems) {
        setResult(prev => ({
          ...prev,
          totalUSD: 0,
          totalLocal: 0,
          calculatedHours: 0,
          isCalculating: false
        }))
        return
      }

      setResult(prev => ({ ...prev, isCalculating: true, error: null }))

      try {
        const costResult = await costCalculationService.calculateStrategyCost(
          actionSteps.map(step => ({
            id: step.id,
            title: step.title,
            smeAction: step.smeAction,
            phase: step.phase || 'immediate',
            costItems: step.costItems || []
          })),
          countryCode
        )

        setResult({
          totalUSD: costResult.totalUSD,
          totalLocal: costResult.localCurrency.amount,
          currencyCode: costResult.localCurrency.code,
          currencySymbol: costResult.localCurrency.symbol,
          calculatedHours: costResult.calculatedHours,
          isCalculating: false,
          error: null
        })
        
        console.log('💰 Cost calculation complete:', {
          USD: costResult.totalUSD,
          local: costResult.localCurrency.amount,
          currency: costResult.localCurrency.code,
          hours: costResult.calculatedHours
        })
      } catch (error) {
        console.error('❌ Cost calculation error:', error)
        setResult(prev => ({
          ...prev,
          isCalculating: false,
          error: error instanceof Error ? error.message : 'Calculation failed'
        }))
      }
    }

    // Debounce calculation to avoid excessive recalcs
    const timeoutId = setTimeout(calculateCosts, 300)
    
    return () => clearTimeout(timeoutId)
  }, [actionSteps, countryCode])

  return result
}










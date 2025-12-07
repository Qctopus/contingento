'use client'

import { useState, useEffect } from 'react'
import { costCalculationService } from '@/services/costCalculationService'
import type { StrategyCostCalculation } from '@/services/costCalculationService'

interface StrategyCostSummaryProps {
  strategy: {
    id: string
    name: string
    actionSteps: Array<{
      id: string
      title?: string
      smeAction?: string
      action?: string
      phase: string
      costItems?: Array<{
        id?: string
        itemId: string
        quantity: number
        item?: any
      }>
    }>
  }
  countryCode?: string
  showDetailed?: boolean
}

const PHASE_CONFIG = {
  immediate: { name: 'Immediate Actions', icon: '⚡', color: 'red', description: 'Right now (this week)' },
  short_term: { name: 'Short-term Actions', icon: '📅', color: 'orange', description: 'Next 1-4 weeks' },
  medium_term: { name: 'Medium-term Actions', icon: '📊', color: 'yellow', description: 'Next 1-3 months' },
  long_term: { name: 'Long-term Actions', icon: '🎯', color: 'green', description: 'Next 3-12 months' }
} as const

export function StrategyCostSummary({
  strategy,
  countryCode = 'JM',
  showDetailed = true
}: StrategyCostSummaryProps) {
  const [calculation, setCalculation] = useState<StrategyCostCalculation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showBreakdown, setShowBreakdown] = useState(false)

  useEffect(() => {
    calculateCosts()
  }, [strategy.actionSteps, countryCode])

  const calculateCosts = async () => {
    setLoading(true)
    setError('')
    
    try {
      const calc = await costCalculationService.calculateStrategyCost(
        strategy.actionSteps,
        countryCode
      )
      setCalculation(calc)
    } catch (err) {
      console.error('Error calculating strategy costs:', err)
      setError('Failed to calculate costs')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, symbol: string) => {
    return `${symbol} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`
  }

  const getPhaseColor = (phase: string) => {
    const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG]
    return config?.color || 'gray'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  if (!calculation) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <span className="text-4xl mb-2 block">💰</span>
        <p className="text-gray-600">No cost data available</p>
        <p className="text-sm text-gray-500 mt-2">
          Add cost items to action steps to see cost estimates
        </p>
      </div>
    )
  }

  const hasNoCosts = calculation.totalUSD === 0

  if (hasNoCosts) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <span className="text-4xl mb-2 block">💰</span>
        <p className="text-blue-900 font-medium">No costs assigned yet</p>
        <p className="text-sm text-blue-700 mt-2">
          Add cost items to your action steps to calculate total implementation cost
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Cost Summary Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>💰</span>
            <span>Total Implementation Cost</span>
          </h3>
          {showDetailed && (
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showBreakdown ? '▼ Hide Details' : '▶ Show Details'}
            </button>
          )}
        </div>

        {/* Total Cost Display */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">USD Total</div>
            <div className="text-3xl font-bold text-blue-600">
              ${calculation.totalUSD.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </div>
          </div>
          {calculation.localCurrency.code !== 'USD' && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">
                {calculation.localCurrency.code} Total
              </div>
              <div className="text-3xl font-bold text-indigo-600">
                {formatCurrency(calculation.localCurrency.amount, calculation.localCurrency.symbol)}
              </div>
            </div>
          )}
        </div>

        {/* Phase Breakdown */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Cost by Implementation Phase</h4>
          <div className="space-y-2">
            {Object.entries(calculation.byPhase).map(([phase, amount]) => {
              if (amount === 0) return null
              const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG]
              if (!config) return null

              const percentage = (amount / calculation.totalUSD) * 100

              return (
                <div key={phase} className="flex items-center gap-3">
                  <span className="text-xl">{config.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{config.name}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-${config.color}-500 h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {showDetailed && showBreakdown && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {/* Item-by-Item Breakdown */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Cost Items Breakdown</h4>
            <div className="space-y-2">
              {calculation.itemBreakdown.map((item, index) => (
                <div
                  key={`${item.itemId}-${index}`}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {item.quantity}× ${item.unitPriceUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      {item.unit && ` ${item.unit}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ${item.totalUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                    {calculation.localCurrency.code !== 'USD' && (
                      <div className="text-sm text-gray-600">
                        {formatCurrency(item.localAmount, calculation.localCurrency.symbol)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Breakdown */}
          {calculation.stepBreakdown.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Cost by Action Step</h4>
              <div className="space-y-2">
                {calculation.stepBreakdown.map((step, index) => {
                  const phaseConfig = PHASE_CONFIG[step.phase as keyof typeof PHASE_CONFIG]
                  return (
                    <div
                      key={`${step.stepId}-${index}`}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-lg">{phaseConfig?.icon || '📋'}</span>
                        <div>
                          <div className="font-medium text-gray-900">{step.stepTitle}</div>
                          <div className="text-xs text-gray-500">{phaseConfig?.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          ${step.totalUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        {calculation.localCurrency.code !== 'USD' && (
                          <div className="text-sm text-gray-600">
                            {formatCurrency(step.localAmount, calculation.localCurrency.symbol)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600">
          💡 <strong>Note:</strong> Costs are automatically calculated based on selected items and 
          converted to {calculation.localCurrency.code} using current exchange rates and country-specific 
          cost multipliers. These are estimates and actual costs may vary.
        </p>
      </div>
    </div>
  )
}



















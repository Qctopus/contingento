'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { getLocalizedText } from '@/utils/localizationUtils'
import { costCalculationService } from '@/services/costCalculationService'

interface Strategy {
  id: string
  name: string
  description: string
  
  // SME-Focused Content
  smeTitle?: string
  smeSummary?: string
  benefitsBullets?: string[]
  realWorldExample?: string
  
  // Backward compat
  smeDescription?: string
  whyImportant?: string
  
  // Basic info
  category: string
  implementationCost: string
  costEstimateJMD?: string
  timeToImplement?: string
  implementationTime: string
  estimatedTotalHours?: number
  effectiveness: number
  complexityLevel?: string
  quickWinIndicator?: boolean
  
  // Wizard integration
  applicableRisks: string[]
  priorityTier: 'essential' | 'recommended' | 'optional'
  reasoning: string
  requiredForRisks?: string[]
  
  // Resource-limited SME support
  lowBudgetAlternative?: string
  diyApproach?: string
  estimatedDIYSavings?: string
  
  // Guidance
  helpfulTips?: string[]
  commonMistakes?: string[]
  successMetrics?: string[]
  
  // Personalization
  industryVariants?: Record<string, string>
  businessSizeGuidance?: Record<string, string>
  
  actionSteps: ActionStep[]
  costItems?: any[]
}

interface ActionStep {
  id: string
  title: string
  description: string
  whyThisStepMatters?: string
  whatHappensIfSkipped?: string
  estimatedMinutes?: number
  difficultyLevel?: string
  howToKnowItsDone?: string
  exampleOutput?: string
  freeAlternative?: string
  lowTechOption?: string
  commonMistakesForStep?: string[]
  videoTutorialUrl?: string
  phase?: string
  sortOrder: number
  costItems?: Array<{
    id?: string
    itemId: string
    quantity: number
    notes?: string
  }>
}

interface StrategySelectionStepProps {
  strategies: Strategy[]
  selectedStrategies: string[] // IDs of selected strategies
  onStrategyToggle: (strategyId: string) => void
  onContinue: () => void
  countryCode?: string
}

export default function StrategySelectionStep({
  strategies,
  selectedStrategies,
  onStrategyToggle,
  onContinue,
  countryCode = 'JM'
}: StrategySelectionStepProps) {
  const locale = useLocale() as 'en' | 'es' | 'fr'
  const t = useTranslations()
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null)
  const [showUnselectWarning, setShowUnselectWarning] = useState<string | null>(null)
  const [strategyCosts, setStrategyCosts] = useState<Record<string, { amount: number; currency: string; symbol: string }>>({})
  const [currencyInfo, setCurrencyInfo] = useState<{ code: string; symbol: string }>({ code: 'JMD', symbol: 'J$' })
  
  // Load currency info for the selected country
  useEffect(() => {
    async function loadCurrencyInfo() {
      try {
        const multiplier = await costCalculationService.getCountryMultiplier(countryCode)
        if (multiplier) {
          setCurrencyInfo({
            code: multiplier.localCurrency,
            symbol: multiplier.currencySymbol
          })
        }
      } catch (error) {
        console.error('Error loading currency info:', error)
      }
    }
    loadCurrencyInfo()
  }, [countryCode])
  
  // Calculate costs for all strategies
  useEffect(() => {
    async function calculateCosts() {
      const costs: Record<string, { amount: number; currency: string; symbol: string }> = {}
      
      for (const strategy of strategies) {
        if (strategy.actionSteps && strategy.actionSteps.length > 0) {
          try {
            // calculateStrategyCost expects actionSteps array directly
            const result = await costCalculationService.calculateStrategyCost(
              strategy.actionSteps,
              countryCode
            )
            
            // Use the correct property names from StrategyCostCalculation
            const amount = result.localCurrency.amount > 0 ? result.localCurrency.amount : result.totalUSD
            if (typeof amount === 'number' && !isNaN(amount) && amount > 0) {
              costs[strategy.id] = {
                amount,
                currency: result.localCurrency.code,
                symbol: result.localCurrency.symbol
              }
            }
          } catch (error) {
            console.error(`Error calculating cost for strategy ${strategy.id}:`, error)
          }
        }
      }
      
      setStrategyCosts(costs)
    }
    
    if (strategies.length > 0) {
      calculateCosts()
    }
  }, [strategies, countryCode])
  
  // Helper to translate risk names (camelCase to snake_case)
  const translateRisk = (riskName: string) => {
    // Convert camelCase to snake_case
    const snakeCase = riskName.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
    
    // Try to get translation
    const translationKey = `steps.riskAssessment.hazardLabels.${snakeCase}`
    const translation = t(translationKey as any)
    
    // Check if translation was found (it returns the key if not found)
    if (translation && !translation.includes('steps.riskAssessment')) {
      return translation
    }
    
    // Fallback: return formatted risk name
    return riskName.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()
  }
  
  // Helper to translate complexity/difficulty levels
  const translateLevel = (level: string) => {
    const lowerLevel = level.toLowerCase()
    
    // Try different translation paths
    const paths = [
      `common.${lowerLevel}`,
      `common.severityRanges.${lowerLevel}`,
      `priorityLevels.${lowerLevel}`
    ]
    
    for (const path of paths) {
      const translation = t(path as any)
      // Check if we got a real translation (not the key itself)
      if (translation && !translation.includes('.')) {
        return translation
      }
    }
    
    // Fallback to capitalized level
    return lowerLevel.charAt(0).toUpperCase() + lowerLevel.slice(1)
  }
  
  // Helper to translate strategy reasoning
  const translateReasoning = (reasoning: string) => {
    if (!reasoning) return ''
    
    // Templates in different languages
    const templates = {
      en: {
        essential: 'This is essential because you have critical {risk} risk. This strategy directly reduces that danger.',
        extra: 'This adds extra protection for your {risk} risk.',
        recommended: 'We recommend this because it addresses your {risk} risk with proven effectiveness.'
      },
      es: {
        essential: 'Esto es esencial porque tiene riesgo crítico de {risk}. Esta estrategia reduce directamente ese peligro.',
        extra: 'Esto agrega protección adicional para su riesgo de {risk}.',
        recommended: 'Recomendamos esto porque aborda su riesgo de {risk} con efectividad comprobada.'
      },
      fr: {
        essential: 'Ceci est essentiel car vous avez un risque critique de {risk}. Cette stratégie réduit directement ce danger.',
        extra: 'Cela ajoute une protection supplémentaire pour votre risque de {risk}.',
        recommended: 'Nous recommandons ceci car cela traite votre risque de {risk} avec une efficacité prouvée.'
      }
    }
    
    // Detect which template and extract risk
    let templateType: 'essential' | 'extra' | 'recommended' | null = null
    let riskName = ''
    
    if (reasoning.includes('This is essential because')) {
      templateType = 'essential'
      const match = reasoning.match(/critical (\w+) risk/)
      if (match) riskName = match[1]
    } else if (reasoning.includes('This adds extra protection')) {
      templateType = 'extra'
      const match = reasoning.match(/for your (\w+) risk/)
      if (match) riskName = match[1]
    } else if (reasoning.includes('We recommend this')) {
      templateType = 'recommended'
      const match = reasoning.match(/addresses your (\w+) risk/)
      if (match) riskName = match[1]
    }
    
    // If we found a template and risk, translate it
    if (templateType && riskName && templates[locale]) {
      const translatedRisk = translateRisk(riskName)
      return templates[locale][templateType].replace('{risk}', translatedRisk)
    }
    
    // Fallback: return original
    return reasoning
  }

  // Group strategies by tier
  const essential = strategies.filter(s => s.priorityTier === 'essential')
  const recommended = strategies.filter(s => s.priorityTier === 'recommended')
  const optional = strategies.filter(s => s.priorityTier === 'optional')

  // Helper to translate time strings
  const translateTime = (timeStr: string) => {
    if (!timeStr) return timeStr
    
    const translations: Record<string, Record<string, string>> = {
      en: { 
        day: 'day', days: 'days', week: 'week', weeks: 'weeks', 
        month: 'month', months: 'months', h: 'h' 
      },
      es: { 
        day: 'día', days: 'días', week: 'semana', weeks: 'semanas',
        month: 'mes', months: 'meses', h: 'h'
      },
      fr: { 
        day: 'jour', days: 'jours', week: 'semaine', weeks: 'semaines',
        month: 'mois', months: 'mois', h: 'h'
      }
    }
    
    // Handle patterns like "~2 days", "1-2 weeks", "1 day", "1 month"
    let result = timeStr
    Object.entries(translations.en).forEach(([enUnit, enText]) => {
      const pattern = new RegExp(`\\b${enUnit}s?\\b`, 'gi')
      const translatedUnit = translations[locale]?.[enUnit] || enUnit
      result = result.replace(pattern, translatedUnit)
    })
    
    // Fix singular/plural for Spanish and French (e.g., "2 día" -> "2 días")
    if (locale === 'es') {
      result = result.replace(/([2-9]|\d{2,})\s+día\b/g, '$1 días')
      result = result.replace(/([2-9]|\d{2,})\s+semana\b/g, '$1 semanas')
      result = result.replace(/([2-9]|\d{2,})\s+mes\b/g, '$1 meses')
    }
    if (locale === 'fr') {
      result = result.replace(/([2-9]|\d{2,})\s+jour\b/g, '$1 jours')
      result = result.replace(/([2-9]|\d{2,})\s+semaine\b/g, '$1 semaines')
    }
    
    return result
  }

  // Calculate summary stats
  const selectedCount = selectedStrategies.length
  const selectedStrategyObjects = strategies.filter(s => selectedStrategies.includes(s.id))
  const totalTimeRaw = calculateTotalTime(selectedStrategyObjects)
  const totalTime = translateTime(totalTimeRaw)
  const { totalCost, totalCostItems, costByTier } = calculateTotalCostWithItems(
    selectedStrategyObjects, 
    strategyCosts, 
    currencyInfo
  )

  // Handle strategy toggle with warning for essential
  const handleToggle = (strategyId: string, tier: string) => {
    const isSelected = selectedStrategies.includes(strategyId)
    
    // If unchecking essential strategy, show warning
    if (isSelected && tier === 'essential') {
      setShowUnselectWarning(strategyId)
    } else {
      onStrategyToggle(strategyId)
    }
  }

  const confirmUnselect = (strategyId: string) => {
    onStrategyToggle(strategyId)
    setShowUnselectWarning(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📋 {t('steps.strategySelection.headerTitle')}
        </h2>
        <p className="text-gray-600">
          {t('steps.strategySelection.headerDescription', { count: strategies.length })}
        </p>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            {t('steps.strategySelection.selectionInstructions')}
          </p>
        </div>
      </div>

      {/* ESSENTIAL STRATEGIES */}
      {essential.length > 0 && (
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <h3 className="text-lg font-bold text-red-900 mb-1">
              🔴 {t('steps.strategySelection.essentialTitle')}
            </h3>
            <p className="text-sm text-red-800">
              {t('steps.strategySelection.essentialDescription')}
            </p>
          </div>

          {essential.map(strategy => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              isSelected={selectedStrategies.includes(strategy.id)}
              isExpanded={expandedStrategy === strategy.id}
              onToggle={() => handleToggle(strategy.id, 'essential')}
              onExpand={() => setExpandedStrategy(
                expandedStrategy === strategy.id ? null : strategy.id
              )}
              tierColor="red"
              t={t}
              locale={locale}
              translateRisk={translateRisk}
              translateLevel={translateLevel}
              translateReasoning={translateReasoning}
              translateTime={translateTime}
              strategyCosts={strategyCosts}
              currencyInfo={currencyInfo}
              countryCode={countryCode}
            />
          ))}
        </div>
      )}

      {/* RECOMMENDED STRATEGIES */}
      {recommended.length > 0 && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
            <h3 className="text-lg font-bold text-yellow-900 mb-1">
              🟡 {t('steps.strategySelection.recommendedTitle')}
            </h3>
            <p className="text-sm text-yellow-800">
              {t('steps.strategySelection.recommendedDescription')}
            </p>
          </div>

          {recommended.map(strategy => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              isSelected={selectedStrategies.includes(strategy.id)}
              isExpanded={expandedStrategy === strategy.id}
              onToggle={() => handleToggle(strategy.id, 'recommended')}
              onExpand={() => setExpandedStrategy(
                expandedStrategy === strategy.id ? null : strategy.id
              )}
              tierColor="yellow"
              t={t}
              locale={locale}
              translateRisk={translateRisk}
              translateLevel={translateLevel}
              translateReasoning={translateReasoning}
              translateTime={translateTime}
              strategyCosts={strategyCosts}
              currencyInfo={currencyInfo}
              countryCode={countryCode}
            />
          ))}
        </div>
      )}

      {/* OPTIONAL STRATEGIES */}
      {optional.length > 0 && (
        <div className="space-y-4">
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
            <h3 className="text-lg font-bold text-green-900 mb-1">
              🟢 {t('steps.strategySelection.optionalTitle')}
            </h3>
            <p className="text-sm text-green-800">
              {t('steps.strategySelection.optionalDescription')}
            </p>
          </div>

          {optional.map(strategy => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              isSelected={selectedStrategies.includes(strategy.id)}
              isExpanded={expandedStrategy === strategy.id}
              onToggle={() => handleToggle(strategy.id, 'optional')}
              onExpand={() => setExpandedStrategy(
                expandedStrategy === strategy.id ? null : strategy.id
              )}
              tierColor="green"
              t={t}
              locale={locale}
              translateRisk={translateRisk}
              translateLevel={translateLevel}
              translateReasoning={translateReasoning}
              translateTime={translateTime}
              strategyCosts={strategyCosts}
              currencyInfo={currencyInfo}
              countryCode={countryCode}
            />
          ))}
        </div>
      )}

      {/* Summary Panel */}
      <div className="sticky bottom-0 bg-white rounded-lg border-2 border-blue-500 shadow-lg p-6">
        <h3 className="font-bold text-gray-900 mb-4">📊 {t('steps.strategySelection.planSummaryTitle')}</h3>
        
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">✅ {t('steps.strategySelection.essentialStrategies')}</span>
            <span className="font-medium">
              {essential.filter(s => selectedStrategies.includes(s.id)).length} / {essential.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">✅ {t('steps.strategySelection.recommendedStrategies')}</span>
            <span className="font-medium">
              {recommended.filter(s => selectedStrategies.includes(s.id)).length} / {recommended.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">⬜ {t('steps.strategySelection.optionalStrategies')}</span>
            <span className="font-medium">
              {optional.filter(s => selectedStrategies.includes(s.id)).length} / {optional.length}
            </span>
          </div>
        </div>

        <div className="border-t pt-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('steps.strategySelection.totalStrategies')}</span>
            <span className="font-bold text-lg">{selectedCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">⏱️ {t('steps.strategySelection.totalTime')}</span>
            <span className="font-medium">{totalTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">💰 {t('steps.strategySelection.totalCost')}:</span>
            <span className="font-medium">{totalCost}</span>
          </div>
          {totalCostItems > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">📦 Cost Items:</span>
              <span className="font-medium">{totalCostItems} items budgeted</span>
            </div>
          )}
        </div>

        {/* Cost Breakdown by Tier */}
        {(costByTier.essential > 0 || costByTier.recommended > 0 || costByTier.optional > 0) && (
          <div className="border-t pt-4 mb-4">
            <p className="text-xs font-medium text-gray-700 mb-2">💰 Budget Breakdown</p>
            <div className="space-y-1">
              {costByTier.essential > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-red-700">🔴 Essential:</span>
                  <span className="font-medium">{currencyInfo.symbol}{costByTier.essential.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
              {costByTier.recommended > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-yellow-700">🟡 Recommended:</span>
                  <span className="font-medium">{currencyInfo.symbol}{costByTier.recommended.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
              {costByTier.optional > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-green-700">🟢 Optional:</span>
                  <span className="font-medium">{currencyInfo.symbol}{costByTier.optional.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Note: Navigation handled by wizard's universal Next button */}
      </div>

      {/* Warning Modal */}
      {/* Strategy Selection Summary - No duplicate button, wizard handles navigation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6 sticky bottom-0 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
              {selectedStrategies.length}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">
                {selectedStrategies.length} {selectedStrategies.length === 1 ? 'Strategy' : 'Strategies'} Selected
              </div>
              <div className="text-sm text-gray-700">
                {selectedStrategies.length === 0 
                  ? 'Select at least one strategy to continue' 
                  : 'Ready to continue - click Next below'}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 border border-blue-300">
            <div className="text-xs text-gray-600">Action Steps</div>
            <div className="text-2xl font-bold text-blue-600">
              {selectedStrategies.reduce((sum, id) => {
                const strategy = [...essential, ...recommended, ...optional].find(s => s.id === id)
                return sum + (strategy?.actionSteps?.length || 0)
              }, 0)}
            </div>
          </div>
        </div>
      </div>

      {showUnselectWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-bold text-red-900 mb-2">
              ⚠️ {t('steps.strategySelection.unselectWarningTitle')}
            </h3>
            <p className="text-gray-700 mb-4">
              {t('steps.strategySelection.unselectWarningMessage')}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => confirmUnselect(showUnselectWarning)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
              >
                {t('steps.strategySelection.unselectConfirm')}
              </button>
              <button
                onClick={() => setShowUnselectWarning(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded"
              >
                {t('steps.strategySelection.unselectCancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Strategy Card Component
function StrategyCard({ 
  strategy, 
  isSelected, 
  isExpanded, 
  onToggle, 
  onExpand,
  tierColor,
  t,
  locale,
  translateRisk,
  translateLevel,
  translateReasoning,
  translateTime,
  strategyCosts,
  currencyInfo,
  countryCode
}: any) {
  const borderColor = {
    red: 'border-red-200',
    yellow: 'border-yellow-200',
    green: 'border-green-200'
  }[tierColor]

  const checkboxColor = {
    red: 'accent-red-600',
    yellow: 'accent-yellow-600',
    green: 'accent-green-600'
  }[tierColor]
  
  // Use SME-focused title if available, otherwise fall back to regular name
  const displayTitle = getLocalizedText(strategy.smeTitle || strategy.name, locale)
  const displaySummary = getLocalizedText(strategy.smeSummary || strategy.smeDescription || strategy.description, locale)
  
  // Helper to format action step costs
  const [stepCosts, setStepCosts] = useState<Record<string, { amount: number; symbol: string; currency: string }>>({})
  
  // Calculate action step costs when expanded
  useEffect(() => {
    if (isExpanded && strategy.actionSteps?.length > 0) {
      const calculateStepCosts = async () => {
        const costs: Record<string, { amount: number; symbol: string; currency: string }> = {}
        
        for (const step of strategy.actionSteps) {
          if (step.costItems && step.costItems.length > 0) {
            try {
              const result = await costCalculationService.calculateActionStepCost(
                step.id,
                step.costItems as any,
                countryCode // Use country code (e.g., 'JM') not currency code (e.g., 'JMD')
              )
              
              const amount = result.localCurrency.amount > 0 ? result.localCurrency.amount : result.totalUSD
              if (typeof amount === 'number' && !isNaN(amount)) {
                costs[step.id] = {
                  amount,
                  symbol: result.localCurrency.amount > 0 ? result.localCurrency.symbol : '$',
                  currency: result.localCurrency.amount > 0 ? result.localCurrency.code : 'USD'
                }
              }
            } catch (error) {
              console.error(`Error calculating cost for step ${step.id}:`, error)
            }
          }
        }
        
        setStepCosts(costs)
      }
      
      calculateStepCosts()
    }
  }, [isExpanded, strategy.actionSteps, countryCode])

  return (
    <div className={`bg-white border-2 ${borderColor} rounded-lg overflow-hidden`}>
      {/* Main Card Content */}
      <div className="p-4">
        {/* Checkbox and Title */}
        <div className="flex items-start space-x-3 mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className={`mt-1 h-6 w-6 rounded border-gray-300 ${checkboxColor} focus:ring-2 focus:ring-offset-2`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-lg font-bold text-gray-900">
                {displayTitle}
              </h4>
              {/* Quick Win Indicator */}
              {strategy.quickWinIndicator && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">
                  ⚡ {t('steps.strategySelection.quickWin')}
                </span>
              )}
            </div>
            
            {/* SME Summary - Plain Language Description */}
            {displaySummary && (
              <p className="text-sm text-gray-600 mb-3">{displaySummary}</p>
            )}
            
            {/* Why Section - Generated Reasoning */}
            {strategy.reasoning && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">💬 {t('steps.strategySelection.whyLabel')}</p>
                <p className="text-sm text-gray-600">{translateReasoning(strategy.reasoning)}</p>
              </div>
            )}
            
            {/* NEW: Benefits Bullets - Key Benefits */}
            {(() => {
              const benefits = getLocalizedText(strategy.benefitsBullets, locale)
              const benefitsArray = Array.isArray(benefits) ? benefits : (typeof benefits === 'string' && benefits ? [benefits] : [])
              return benefitsArray.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">✅ {t('steps.strategySelection.whatYouGetLabel')}</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {benefitsArray.slice(0, 3).map((benefit: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })()}

            {/* Risk Coverage */}
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 mb-1">📊 {t('steps.strategySelection.protectsAgainstLabel')}</p>
              <div className="flex flex-wrap gap-1">
                {strategy.applicableRisks.slice(0, 4).map((risk: string) => (
                  <span key={risk} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {translateRisk(risk)}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Facts */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-500">⏱️</span>{' '}
                <span className="font-medium">
                  {strategy.estimatedTotalHours ? `~${strategy.estimatedTotalHours}h` : (strategy.timeToImplement || strategy.implementationTime)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">💰</span>{' '}
                <span className="font-medium">
                  {strategyCosts[strategy.id]?.amount 
                    ? `${strategyCosts[strategy.id].symbol}${strategyCosts[strategy.id].amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${strategyCosts[strategy.id].currency}`
                    : 'Cost TBD'
                  }
                </span>
              </div>
              <div>
                <span className="text-gray-500">⭐</span>{' '}
                <span className="font-medium">{strategy.effectiveness}/10</span>
              </div>
              {strategy.complexityLevel && (
                <div>
                  <span className="text-gray-500">🎯</span>{' '}
                  <span className="font-medium capitalize">{translateLevel(strategy.complexityLevel)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={onExpand}
          className="w-full mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center py-2 border-t border-gray-100"
        >
          {isExpanded ? `▲ ${t('steps.strategySelection.hideDetails')}` : `▼ ${t('steps.strategySelection.seeFullDetails')}`}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
          {/* NEW: Real World Example - Caribbean Success Story */}
          {strategy.realWorldExample && (
            <div className="bg-green-50 border-l-4 border-green-500 rounded p-3">
              <h5 className="font-bold text-green-900 mb-2 flex items-center">
                <span className="mr-2">💚</span> {t('steps.strategySelection.realSuccessStory')}
              </h5>
              <p className="text-sm text-green-800">{getLocalizedText(strategy.realWorldExample, locale)}</p>
            </div>
          )}
          
          {/* NEW: Low Budget Alternative */}
          {strategy.lowBudgetAlternative && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded p-3">
              <h5 className="font-bold text-yellow-900 mb-2">💰 {t('steps.strategySelection.lowBudgetAlternative')}</h5>
              <p className="text-sm text-yellow-800">{getLocalizedText(strategy.lowBudgetAlternative, locale)}</p>
              {strategy.estimatedDIYSavings && (
                <p className="text-xs text-yellow-700 mt-1 italic">{getLocalizedText(strategy.estimatedDIYSavings, locale)}</p>
              )}
            </div>
          )}
          
          {/* NEW: DIY Approach */}
          {strategy.diyApproach && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-3">
              <h5 className="font-bold text-blue-900 mb-2">🔧 {t('steps.strategySelection.diyApproach')}</h5>
              <p className="text-sm text-blue-800">{getLocalizedText(strategy.diyApproach, locale)}</p>
            </div>
          )}

          {/* Action Steps - Enhanced with SME Context */}
          {strategy.actionSteps && strategy.actionSteps.length > 0 && (
            <div>
              <h5 className="font-bold text-gray-900 mb-2">📋 {t('steps.strategySelection.whatYouNeedToDo')}</h5>
              <div className="space-y-3">
                {strategy.actionSteps.map((step: any, index: number) => (
                  <div key={step.id} className="bg-white rounded p-3 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        {t('common.actionStep')} {index + 1}: {getLocalizedText(step.title || step.smeAction, locale)}
                      </p>
                      {step.difficultyLevel && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          step.difficultyLevel === 'easy' ? 'bg-green-100 text-green-700' :
                          step.difficultyLevel === 'hard' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {translateLevel(step.difficultyLevel)}
                        </span>
                      )}
                    </div>
                    
                    {/* NEW: Why This Step Matters */}
                    {step.whyThisStepMatters && (
                      <div className="mb-2 pl-3 border-l-2 border-blue-300">
                        <p className="text-xs text-blue-700 font-medium">{t('steps.strategySelection.whyThisMatters')}:</p>
                        <p className="text-xs text-blue-600">{getLocalizedText(step.whyThisStepMatters, locale)}</p>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 mb-2">{getLocalizedText(step.description || step.smeAction, locale)}</p>
                    
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {step.estimatedMinutes && (
                        <span>⏱️ ~{step.estimatedMinutes} min</span>
                      )}
                      {!step.estimatedMinutes && step.timeframe && (
                        <span>⏱️ {translateTime(step.timeframe)}</span>
                      )}
                      {stepCosts[step.id] && stepCosts[step.id].amount !== undefined ? (
                        <span>💰 {stepCosts[step.id].symbol}{stepCosts[step.id].amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} {stepCosts[step.id].currency}</span>
                      ) : step.estimatedCostJMD && (
                        <span>💰 {getLocalizedText(step.estimatedCostJMD, locale)}</span>
                      )}
                    </div>
                    
                    {/* NEW: How to Know It's Done */}
                    {step.howToKnowItsDone && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">✓ {t('steps.strategySelection.doneWhen')}:</span> {getLocalizedText(step.howToKnowItsDone, locale)}
                        </p>
                      </div>
                    )}
                    
                    {/* NEW: Free Alternative */}
                    {step.freeAlternative && (
                      <div className="mt-2 bg-green-50 rounded p-2">
                        <p className="text-xs text-green-700">
                          <span className="font-medium">💸 {t('steps.strategySelection.freeOption')}:</span> {getLocalizedText(step.freeAlternative, locale)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* NEW: Helpful Tips */}
          {(() => {
            const tips = getLocalizedText(strategy.helpfulTips, locale)
            const tipsArray = Array.isArray(tips) ? tips : (typeof tips === 'string' && tips ? [tips] : [])
            return tipsArray.length > 0 && (
              <div className="bg-blue-50 rounded p-3">
                <h5 className="font-bold text-blue-900 mb-2">💡 {t('steps.strategySelection.helpfulTips')}</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  {tipsArray.map((tip: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })()}
          
          {/* NEW: Common Mistakes */}
          {(() => {
            const mistakes = getLocalizedText(strategy.commonMistakes, locale)
            const mistakesArray = Array.isArray(mistakes) ? mistakes : (typeof mistakes === 'string' && mistakes ? [mistakes] : [])
            return mistakesArray.length > 0 && (
              <div className="bg-red-50 rounded p-3">
                <h5 className="font-bold text-red-900 mb-2">⚠️ {t('steps.strategySelection.commonMistakes')}</h5>
                <ul className="text-sm text-red-800 space-y-1">
                  {mistakesArray.map((mistake: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-red-600 mr-2">✗</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })()}

          {/* Legacy: Why Important (backwards compatibility) */}
          {!strategy.benefitsBullets && strategy.whyImportant && (
            <div className="bg-blue-50 rounded p-3">
              <h5 className="font-bold text-blue-900 mb-1">✨ What You'll Get</h5>
              <p className="text-sm text-blue-800">{getLocalizedText(strategy.whyImportant, locale)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Helper functions
function calculateTotalTime(strategies: Strategy[]): string {
  // Simplified - you can make this more sophisticated
  const hours = strategies.reduce((total, s) => {
    const time = s.timeToImplement || s.implementationTime
    
    // Safety check: ensure time is a string before calling .includes()
    if (!time || typeof time !== 'string') {
      // If we have estimatedTotalHours, use that
      if (s.estimatedTotalHours) return total + s.estimatedTotalHours
      // Otherwise default to 1 hour
      return total + 1
    }
    
    if (time.includes('hour')) return total + 2
    if (time.includes('day')) return total + 8
    if (time.includes('week')) return total + 40
    return total + 1
  }, 0)
  
  if (hours < 8) return `~${hours}h`
  if (hours < 40) return `~${Math.round(hours / 8)} ${Math.round(hours / 8) === 1 ? 'day' : 'days'}`
  return `~${Math.round(hours / 40)} ${Math.round(hours / 40) === 1 ? 'week' : 'weeks'}`
}

function calculateTotalCostWithItems(
  strategies: Strategy[], 
  strategyCosts: Record<string, { amount: number; currency: string; symbol: string }>,
  currencyInfo: { code: string; symbol: string }
): { totalCost: string; totalCostItems: number; costByTier: { essential: number; recommended: number; optional: number } } {
  // Use calculated costs from cost items
  let total = 0
  let costItemCount = 0
  const costByTier = { essential: 0, recommended: 0, optional: 0 }
  
  strategies.forEach(strategy => {
    const cost = strategyCosts[strategy.id]
    const amount = cost?.amount || 0
    total += amount
    
    // Add to tier totals
    if (strategy.priorityTier === 'essential') {
      costByTier.essential += amount
    } else if (strategy.priorityTier === 'recommended') {
      costByTier.recommended += amount
    } else if (strategy.priorityTier === 'optional') {
      costByTier.optional += amount
    }
    
    // Count cost items across all action steps
    if (strategy.actionSteps) {
      strategy.actionSteps.forEach(step => {
        if (step.costItems && Array.isArray(step.costItems)) {
          costItemCount += step.costItems.length
        }
      })
    }
  })
  
  let totalCostStr: string
  if (total === 0) {
    totalCostStr = `${currencyInfo.symbol}0 (No cost items assigned)`
  } else {
    // Format with proper currency
    const formatted = total.toLocaleString('en-US', { maximumFractionDigits: 0 })
    totalCostStr = `${currencyInfo.symbol}${formatted} ${currencyInfo.code}`
  }
  
  return { totalCost: totalCostStr, totalCostItems: costItemCount, costByTier }
}


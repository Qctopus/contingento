'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { getLocalizedText } from '@/utils/localizationUtils'

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
}

interface StrategySelectionStepProps {
  strategies: Strategy[]
  selectedStrategies: string[] // IDs of selected strategies
  onStrategyToggle: (strategyId: string) => void
  onContinue: () => void
}

export default function StrategySelectionStep({
  strategies,
  selectedStrategies,
  onStrategyToggle,
  onContinue
}: StrategySelectionStepProps) {
  const locale = useLocale() as 'en' | 'es' | 'fr'
  const t = useTranslations()
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null)
  const [showUnselectWarning, setShowUnselectWarning] = useState<string | null>(null)

  // Group strategies by tier
  const essential = strategies.filter(s => s.priorityTier === 'essential')
  const recommended = strategies.filter(s => s.priorityTier === 'recommended')
  const optional = strategies.filter(s => s.priorityTier === 'optional')

  // Calculate summary stats
  const selectedCount = selectedStrategies.length
  const totalTime = calculateTotalTime(strategies.filter(s => selectedStrategies.includes(s.id)))
  const totalCost = calculateTotalCost(strategies.filter(s => selectedStrategies.includes(s.id)))

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
          📋 {t('strategySelection.headerTitle')}
        </h2>
        <p className="text-gray-600">
          {t('strategySelection.headerDescription', { count: strategies.length })}
        </p>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            {t('strategySelection.selectionInstructions')}
          </p>
        </div>
      </div>

      {/* ESSENTIAL STRATEGIES */}
      {essential.length > 0 && (
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <h3 className="text-lg font-bold text-red-900 mb-1">
              🔴 {t('strategySelection.essentialTitle')}
            </h3>
            <p className="text-sm text-red-800">
              {t('strategySelection.essentialDescription')}
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
            />
          ))}
        </div>
      )}

      {/* RECOMMENDED STRATEGIES */}
      {recommended.length > 0 && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
            <h3 className="text-lg font-bold text-yellow-900 mb-1">
              🟡 {t('strategySelection.recommendedTitle')}
            </h3>
            <p className="text-sm text-yellow-800">
              {t('strategySelection.recommendedDescription')}
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
            />
          ))}
        </div>
      )}

      {/* OPTIONAL STRATEGIES */}
      {optional.length > 0 && (
        <div className="space-y-4">
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
            <h3 className="text-lg font-bold text-green-900 mb-1">
              🟢 {t('strategySelection.optionalTitle')}
            </h3>
            <p className="text-sm text-green-800">
              {t('strategySelection.optionalDescription')}
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
            />
          ))}
        </div>
      )}

      {/* Summary Panel */}
      <div className="sticky bottom-0 bg-white rounded-lg border-2 border-blue-500 shadow-lg p-6">
        <h3 className="font-bold text-gray-900 mb-4">📊 {t('strategySelection.planSummaryTitle')}</h3>
        
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">✅ {t('strategySelection.essentialStrategies')}</span>
            <span className="font-medium">
              {essential.filter(s => selectedStrategies.includes(s.id)).length} / {essential.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">✅ {t('strategySelection.recommendedStrategies')}</span>
            <span className="font-medium">
              {recommended.filter(s => selectedStrategies.includes(s.id)).length} / {recommended.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">⬜ {t('strategySelection.optionalStrategies')}</span>
            <span className="font-medium">
              {optional.filter(s => selectedStrategies.includes(s.id)).length} / {optional.length}
            </span>
          </div>
        </div>

        <div className="border-t pt-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('strategySelection.totalStrategies')}</span>
            <span className="font-bold text-lg">{selectedCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">⏱️ {t('strategySelection.totalTime')}</span>
            <span className="font-medium">{totalTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">💰 Total cost:</span>
            <span className="font-medium">{totalCost}</span>
          </div>
        </div>

        {/* Note: Navigation handled by wizard's universal Next button */}
      </div>

      {/* Warning Modal */}
      {showUnselectWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-bold text-red-900 mb-2">
              ⚠️ {t('strategySelection.unselectWarningTitle')}
            </h3>
            <p className="text-gray-700 mb-4">
              {t('strategySelection.unselectWarningMessage')}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => confirmUnselect(showUnselectWarning)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
              >
                {t('strategySelection.unselectConfirm')}
              </button>
              <button
                onClick={() => setShowUnselectWarning(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded"
              >
                {t('strategySelection.unselectCancel')}
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
  locale
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
                  ⚡ {t('strategySelection.quickWin')}
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
                <p className="text-sm font-medium text-gray-700 mb-1">💬 {t('strategySelection.whyLabel')}</p>
                <p className="text-sm text-gray-600">{strategy.reasoning}</p>
              </div>
            )}
            
            {/* NEW: Benefits Bullets - Key Benefits */}
            {(() => {
              const benefits = getLocalizedText(strategy.benefitsBullets, locale)
              const benefitsArray = Array.isArray(benefits) ? benefits : (typeof benefits === 'string' && benefits ? [benefits] : [])
              return benefitsArray.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">✅ {t('strategySelection.whatYouGetLabel')}</p>
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
              <p className="text-xs font-medium text-gray-500 mb-1">📊 {t('strategySelection.protectsAgainstLabel')}</p>
              <div className="flex flex-wrap gap-1">
                {strategy.applicableRisks.slice(0, 4).map((risk: string) => (
                  <span key={risk} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {risk.replace(/_/g, ' ')}
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
                <span className="font-medium">{getLocalizedText(strategy.costEstimateJMD || strategy.implementationCost, locale)}</span>
              </div>
              <div>
                <span className="text-gray-500">⭐</span>{' '}
                <span className="font-medium">{strategy.effectiveness}/10</span>
              </div>
              {strategy.complexityLevel && (
                <div>
                  <span className="text-gray-500">🎯</span>{' '}
                  <span className="font-medium capitalize">{strategy.complexityLevel}</span>
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
          {isExpanded ? `▲ ${t('strategySelection.hideDetails')}` : `▼ ${t('strategySelection.seeFullDetails')}`}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
          {/* NEW: Real World Example - Caribbean Success Story */}
          {strategy.realWorldExample && (
            <div className="bg-green-50 border-l-4 border-green-500 rounded p-3">
              <h5 className="font-bold text-green-900 mb-2 flex items-center">
                <span className="mr-2">💚</span> {t('strategySelection.realSuccessStory')}
              </h5>
              <p className="text-sm text-green-800">{getLocalizedText(strategy.realWorldExample, locale)}</p>
            </div>
          )}
          
          {/* NEW: Low Budget Alternative */}
          {strategy.lowBudgetAlternative && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded p-3">
              <h5 className="font-bold text-yellow-900 mb-2">💰 {t('strategySelection.lowBudgetAlternative')}</h5>
              <p className="text-sm text-yellow-800">{getLocalizedText(strategy.lowBudgetAlternative, locale)}</p>
              {strategy.estimatedDIYSavings && (
                <p className="text-xs text-yellow-700 mt-1 italic">{getLocalizedText(strategy.estimatedDIYSavings, locale)}</p>
              )}
            </div>
          )}
          
          {/* NEW: DIY Approach */}
          {strategy.diyApproach && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-3">
              <h5 className="font-bold text-blue-900 mb-2">🔧 {t('strategySelection.diyApproach')}</h5>
              <p className="text-sm text-blue-800">{getLocalizedText(strategy.diyApproach, locale)}</p>
            </div>
          )}

          {/* Action Steps - Enhanced with SME Context */}
          {strategy.actionSteps && strategy.actionSteps.length > 0 && (
            <div>
              <h5 className="font-bold text-gray-900 mb-2">📋 What You Need to Do</h5>
              <div className="space-y-3">
                {strategy.actionSteps.map((step: any, index: number) => (
                  <div key={step.id} className="bg-white rounded p-3 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        Step {index + 1}: {getLocalizedText(step.title || step.smeAction, locale)}
                      </p>
                      {step.difficultyLevel && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          step.difficultyLevel === 'easy' ? 'bg-green-100 text-green-700' :
                          step.difficultyLevel === 'hard' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {step.difficultyLevel}
                        </span>
                      )}
                    </div>
                    
                    {/* NEW: Why This Step Matters */}
                    {step.whyThisStepMatters && (
                      <div className="mb-2 pl-3 border-l-2 border-blue-300">
                        <p className="text-xs text-blue-700 font-medium">Why this matters:</p>
                        <p className="text-xs text-blue-600">{getLocalizedText(step.whyThisStepMatters, locale)}</p>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 mb-2">{getLocalizedText(step.description || step.smeAction, locale)}</p>
                    
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {step.estimatedMinutes && (
                        <span>⏱️ ~{step.estimatedMinutes} min</span>
                      )}
                      {!step.estimatedMinutes && step.timeframe && (
                        <span>⏱️ {step.timeframe}</span>
                      )}
                      {step.estimatedCostJMD && (
                        <span>💰 {getLocalizedText(step.estimatedCostJMD, locale)}</span>
                      )}
                    </div>
                    
                    {/* NEW: How to Know It's Done */}
                    {step.howToKnowItsDone && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">✓ Done when:</span> {getLocalizedText(step.howToKnowItsDone, locale)}
                        </p>
                      </div>
                    )}
                    
                    {/* NEW: Free Alternative */}
                    {step.freeAlternative && (
                      <div className="mt-2 bg-green-50 rounded p-2">
                        <p className="text-xs text-green-700">
                          <span className="font-medium">💸 Free option:</span> {getLocalizedText(step.freeAlternative, locale)}
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
                <h5 className="font-bold text-blue-900 mb-2">💡 Helpful Tips</h5>
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
                <h5 className="font-bold text-red-900 mb-2">⚠️ Common Mistakes to Avoid</h5>
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
    if (time.includes('hour')) return total + 2
    if (time.includes('day')) return total + 8
    if (time.includes('week')) return total + 40
    return total + 1
  }, 0)
  
  if (hours < 8) return `~${hours} hours`
  if (hours < 40) return `~${Math.round(hours / 8)} days`
  return `~${Math.round(hours / 40)} weeks`
}

function calculateTotalCost(strategies: Strategy[]): string {
  // Simple cost estimation based on implementation cost
  const costs = strategies.map(s => {
    const cost = s.implementationCost
    if (cost === 'low') return 5000
    if (cost === 'medium') return 15000
    if (cost === 'high') return 40000
    if (cost === 'very_high') return 80000
    return 10000
  })
  
  const total = costs.reduce((sum, c) => sum + c, 0)
  
  if (total < 10000) return `JMD ${total.toLocaleString()}`
  const min = Math.floor(total * 0.7)
  const max = Math.ceil(total * 1.3)
  return `JMD ${min.toLocaleString()}-${max.toLocaleString()}`
}


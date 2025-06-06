'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale, useMessages } from 'next-intl'
import { useLocalizedSteps } from '@/lib/localizedSteps'
import { StructuredInput } from './StructuredInput'
import IndustrySelector from './IndustrySelector'
import { LocationData, PreFillData } from '../data/types'
import { generatePreFillData, mergePreFillData, isFieldPreFilled } from '../services/preFillService'
import { anonymousSessionService } from '@/services/anonymousSessionService'

// Development logging utility
const devLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[BCP Form]: ${message}`, data)
  }
}

interface FormData {
  [key: string]: {
    [key: string]: any
  }
}

export function BusinessContinuityForm() {
  const t = useTranslations()
  const locale = useLocale()
  const messages = useMessages()
  const STEPS = useLocalizedSteps()
  const [formData, setFormData] = useState<FormData>({})
  const [currentStep, setCurrentStep] = useState<string>('PLAN_INFORMATION')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  
  // Industry selection states
  const [showIndustrySelector, setShowIndustrySelector] = useState(false)
  const [preFillData, setPreFillData] = useState<PreFillData | null>(null)
  const [hasSelectedIndustry, setHasSelectedIndustry] = useState(false)
  const [examples, setExamples] = useState<any>({})

  // Check if user should see industry selector on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('bcp-draft')
      const hasIndustrySelection = localStorage.getItem('bcp-industry-selected')
      
      if (savedData) {
        const parsed = JSON.parse(savedData)
        setFormData(parsed)
      }
      
      // Show industry selector if no previous industry selection and no saved data
      if (!hasIndustrySelection && (!savedData || Object.keys(JSON.parse(savedData || '{}')).length === 0)) {
        setShowIndustrySelector(true)
      } else if (hasIndustrySelection) {
        setHasSelectedIndustry(true)
        const preFillDataStored = localStorage.getItem('bcp-prefill-data')
        if (preFillDataStored) {
          setPreFillData(JSON.parse(preFillDataStored))
        }
      }
    } catch (error) {
      console.error('Failed to load saved data:', error)
    }
  }, [])

  // Handle industry selection
  const handleIndustrySelection = (industryId: string, location: LocationData) => {
    const preFillData = generatePreFillData(industryId, location, locale, messages)
    
    if (preFillData) {
      // Merge pre-fill data with any existing form data
      const mergedData = mergePreFillData(formData, preFillData)
      
      devLog('Industry selection complete', { 
        industryId, 
        location, 
        locale,
        preFillDataGenerated: !!preFillData,
        fieldsPreFilled: Object.keys(preFillData.preFilledFields).length
      })
      
      setFormData(mergedData)
      setExamples(preFillData.contextualExamples)
      setPreFillData(preFillData)
      
      // Store selection state
      localStorage.setItem('bcp-industry-selected', 'true')
      localStorage.setItem('bcp-prefill-data', JSON.stringify(preFillData))
      
      setHasSelectedIndustry(true)
    }
    
    setShowIndustrySelector(false)
  }

  // Handle skipping industry selection
  const handleSkipIndustrySelection = () => {
    localStorage.setItem('bcp-industry-selected', 'skipped')
    setShowIndustrySelector(false)
  }

  // Reset to industry defaults function
  const resetToIndustryDefaults = (stepId: string) => {
    if (!preFillData) return
    
    const stepDefaults = preFillData.preFilledFields[stepId]
    if (stepDefaults) {
      setFormData(prev => ({
        ...prev,
        [stepId]: {
          ...prev[stepId],
          ...stepDefaults
        }
      }))
    }
  }

  // Load saved data on component mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('bcp-draft')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        setFormData(parsed)
      }
    } catch (error) {
      console.error('Failed to load saved data:', error)
    }
  }, [])

  // Auto-save functionality with session integration
  useEffect(() => {
    const autoSave = async () => {
      if (Object.keys(formData).length === 0) return
      
      setAutoSaveStatus('saving')
      try {
        // Save to localStorage (existing functionality)
        localStorage.setItem('bcp-draft', JSON.stringify(formData))
        
        // Also save to anonymous session
        anonymousSessionService.savePlanData(formData)
        
        setAutoSaveStatus('saved')
        
        setTimeout(() => {
          setAutoSaveStatus('idle')
        }, 2000)
      } catch (error) {
        console.error('Auto-save failed:', error)
        setAutoSaveStatus('error')
        setTimeout(() => {
          setAutoSaveStatus('idle')
        }, 3000)
      }
    }

    const timeoutId = setTimeout(autoSave, 2000)
    return () => clearTimeout(timeoutId)
  }, [formData])

  const handleInputComplete = (step: string, label: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: {
        ...prev[step],
        [label]: value
      }
    }))
  }

  const handleNext = () => {
    const currentStepData = STEPS[currentStep as keyof typeof STEPS]
    if (currentQuestionIndex < currentStepData.inputs.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Move to next section
      const stepKeys = Object.keys(STEPS)
      const currentStepIndex = stepKeys.indexOf(currentStep)
      if (currentStepIndex < stepKeys.length - 1) {
        setCurrentStep(stepKeys[currentStepIndex + 1])
        setCurrentQuestionIndex(0)
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    } else {
      // Move to previous section
      const stepKeys = Object.keys(STEPS)
      const currentStepIndex = stepKeys.indexOf(currentStep)
      if (currentStepIndex > 0) {
        setCurrentStep(stepKeys[currentStepIndex - 1])
        const previousStepData = STEPS[stepKeys[currentStepIndex - 1] as keyof typeof STEPS]
        setCurrentQuestionIndex(previousStepData.inputs.length - 1)
      }
    }
  }

  const handleStepClick = (step: string) => {
    setCurrentStep(step)
    setCurrentQuestionIndex(0)
  }

  const handleQuestionClick = (step: string, questionIndex: number) => {
    setCurrentStep(step)
    setCurrentQuestionIndex(questionIndex)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/save-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planData: formData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save plan')
      }

      const data = await response.json()
      
      // Clear the draft after successful save
      localStorage.removeItem('bcp-draft')
      
      alert(t('common.success'))
    } catch (error) {
      console.error('Error saving plan:', error)
      alert(t('common.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const exportToPDF = async () => {
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planData: formData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${formData.PLAN_INFORMATION?.['Company Name'] || 'business'}-continuity-plan.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert(t('common.error'))
    }
  }

  const clearDraft = () => {
    if (confirm(t('common.confirmClear'))) {
      localStorage.removeItem('bcp-draft')
      localStorage.removeItem('bcp-industry-selected')
      localStorage.removeItem('bcp-prefill-data')
      setFormData({})
      setCurrentStep('PLAN_INFORMATION')
      setCurrentQuestionIndex(0)
      setPreFillData(null)
      setHasSelectedIndustry(false)
    }
  }

  // Show industry selector if needed
  if (showIndustrySelector) {
    return (
      <IndustrySelector
        onSelection={handleIndustrySelection}
        onSkip={handleSkipIndustrySelection}
      />
    )
  }

  const currentStepData = STEPS[currentStep as keyof typeof STEPS]
  const currentQuestion = currentStepData.inputs[currentQuestionIndex]
  const totalQuestions = Object.values(STEPS).reduce((acc, step) => acc + step.inputs.length, 0)
  const currentQuestionNumber = Object.keys(STEPS)
    .slice(0, Object.keys(STEPS).indexOf(currentStep))
    .reduce((acc, step) => acc + STEPS[step as keyof typeof STEPS].inputs.length, 0) + currentQuestionIndex + 1

  // Check if all questions are answered
  const isComplete = Object.entries(STEPS).every(([step, stepData]) => {
    const stepAnswers = formData[step] || {}
    return stepData.inputs.every(input => {
      const value = stepAnswers[input.label]
      if (input.type === 'checkbox') {
        return Array.isArray(value) && value.length > 0
      }
      if (input.type === 'table') {
        return Array.isArray(value) && value.length > 0
      }
      return value !== undefined && value !== null && value !== ''
    })
  })

  const isQuestionAnswered = (step: string, label: string) => {
    const stepAnswers = formData[step] || {}
    const value = stepAnswers[label]
    return value !== undefined && value !== null && value !== ''
  }

  const getStepCompletion = (step: string) => {
    const stepData = STEPS[step as keyof typeof STEPS]
    const answeredQuestions = stepData.inputs.filter(input => 
      isQuestionAnswered(step, input.label)
    )
    return Math.round((answeredQuestions.length / stepData.inputs.length) * 100)
  }

  // Get current value for display
  const getCurrentValue = () => {
    const stepAnswers = formData[currentStep] || {}
    const currentStepData = STEPS[currentStep as keyof typeof STEPS]
    if (!currentStepData) return undefined
    
    const currentInput = currentStepData.inputs[currentQuestionIndex]
    if (!currentInput) return undefined
    
    const fieldLabel = currentInput.label
    const currentValue = stepAnswers[fieldLabel]
    const hasPreFillData = !!preFillData
    const preFilledStepData = preFillData?.preFilledFields[currentStep]
    
    devLog('Getting current value', {
      currentStep,
      fieldLabel,
      stepAnswers: Object.keys(stepAnswers),
      currentValue: currentValue ? 'has value' : 'no value',
      hasPreFillData,
      preFilledStepData: preFilledStepData ? 'available' : 'none'
    })
    
    return currentValue
  }

  // Check if current field is pre-filled
  const isCurrentFieldPreFilled = isFieldPreFilled(
    currentStep,
    currentQuestion.label,
    getCurrentValue(),
    preFillData
  )

  // Get industry-specific examples if available
  const getIndustryExamples = () => {
    if (preFillData?.contextualExamples?.[currentStep]?.[currentQuestion.label]) {
      return preFillData.contextualExamples[currentStep][currentQuestion.label]
    }
    return currentQuestion.examples
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <div className="w-80 bg-white border-r overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('common.businessContinuityPlan')}</h2>
            {autoSaveStatus === 'saving' && (
              <span className="text-xs text-gray-500">{t('common.saving')}</span>
            )}
            {autoSaveStatus === 'saved' && (
              <span className="text-xs text-green-600">✓ {t('common.saved')}</span>
            )}
            {autoSaveStatus === 'error' && (
              <span className="text-xs text-red-600">{t('common.saveFailed')}</span>
            )}
          </div>

          {/* Industry Information Display */}
          {hasSelectedIndustry && preFillData && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-2">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-blue-900">{t('industrySelector.smartPreFilled')}</span>
              </div>
              <div className="text-xs text-blue-800">
                <div className="font-medium">{preFillData.industry.name}</div>
                <div>{preFillData.location.parish}, {preFillData.location.country}</div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {Object.entries(STEPS).map(([step, stepData]) => {
              const completion = getStepCompletion(step)
              const hasPreFillDefaults = preFillData?.preFilledFields[step]
              return (
                <div key={step} className="space-y-2">
                  <button
                    onClick={() => handleStepClick(step)}
                    className={`w-full text-left px-3 py-3 rounded-lg border transition-colors ${
                      currentStep === step 
                        ? 'bg-primary-50 text-primary-600 border-primary-200' 
                        : 'hover:bg-gray-50 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm">{stepData.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{completion}%</span>
                        {hasPreFillDefaults && (
                          <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {completion === 100 && (
                          <svg className="h-4 w-4 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
                      <div 
                        className="bg-primary-600 h-1 rounded-full transition-all" 
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{stepData.description}</p>
                  </button>
                  
                  {currentStep === step && (
                    <div className="pl-4 space-y-1">
                      {stepData.inputs.map((input, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuestionClick(step, index)}
                          className={`w-full text-left px-3 py-2 text-xs rounded flex items-center transition-colors ${
                            currentQuestionIndex === index
                              ? 'bg-primary-100 text-primary-600'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <span className="flex-1 truncate">{input.label}</span>
                          {isFieldPreFilled(step, input.label, formData[step]?.[input.label], preFillData) && (
                            <svg className="w-3 h-3 text-blue-500 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {isQuestionAnswered(step, input.label) && (
                            <svg
                              className="h-3 w-3 text-green-500 ml-1"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                      
                      {/* Reset to Defaults Button */}
                      {hasPreFillDefaults && currentStep === step && (
                        <button
                          onClick={() => resetToIndustryDefaults(step)}
                          className="w-full mt-2 px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          {t('industrySelector.resetToDefaults')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Action buttons in sidebar */}
          <div className="mt-6 space-y-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm"
            >
              {isSubmitting ? t('common.saving') : t('common.save')}
            </button>
            
            {isComplete && (
              <button
                onClick={exportToPDF}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                {t('common.exportPDF')}
              </button>
            )}
            
            <button
              onClick={clearDraft}
              className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
            >
              {t('common.clearDraft')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-6 py-6">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentStepData.title}
                </h1>
                <p className="text-gray-600 mt-1">{currentStepData.description}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {t('common.question')} {currentQuestionNumber} {t('common.of')} {totalQuestions}
                </div>
                <div className="text-sm text-gray-600">
                  {t('common.step', { 
                    current: Object.keys(STEPS).indexOf(currentStep) + 1, 
                    total: Object.keys(STEPS).length 
                  })}
                </div>
              </div>
            </div>
            
            {/* Overall Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            {/* Pre-fill indicator */}
            {isCurrentFieldPreFilled && (
              <div className="mb-4 flex items-center text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{t('industrySelector.smartPreFilled')}</span>
                <span className="ml-2">{t('industrySelector.preFillIndicator')}</span>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-900">
                {currentQuestion.label}
                {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
              </h2>
              <p className="text-gray-600 leading-relaxed">{currentQuestion.prompt}</p>
            </div>

            {/* Examples */}
            {getIndustryExamples() && getIndustryExamples()!.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  {t('common.examples')}
                  {preFillData?.contextualExamples?.[currentStep]?.[currentQuestion.label] && (
                    <span className="ml-2 text-xs font-normal text-blue-700">({t('industrySelector.industrySpecific')})</span>
                  )}
                </h4>
                <ul>
                  {getIndustryExamples()!.map((example, i) => (
                    <li key={i} className="text-sm text-blue-800 flex items-start mb-1 last:mb-0">
                      <span className="text-blue-400 mr-2">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Input Component */}
            <StructuredInput
              type={currentQuestion.type}
              label={currentQuestion.label}
              required={currentQuestion.required}
              prompt={currentQuestion.prompt}
              examples={getIndustryExamples()}
              options={currentQuestion.options}
              tableColumns={currentQuestion.tableColumns}
              tableRowsPrompt={currentQuestion.tableRowsPrompt}
              priorityOptions={currentQuestion.priorityOptions}
              downtimeOptions={currentQuestion.downtimeOptions}
              {...(currentQuestion.type === 'special_risk_matrix' && {
                likelihoodOptions: (currentQuestion as any).likelihoodOptions,
                severityOptions: (currentQuestion as any).severityOptions,
              })}
              dependsOn={currentQuestion.dependsOn}
              stepData={formData[currentStep]}
              onComplete={(value) => handleInputComplete(currentStep, currentQuestion.label, value)}
              initialValue={getCurrentValue()}
              key={`${currentStep}-${currentQuestion.label}`}
            />

            {/* Current Value Display for debugging */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                <strong>{t('common.currentValue')}:</strong> {JSON.stringify(getCurrentValue(), null, 2)}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 'PLAN_INFORMATION' && currentQuestionIndex === 0}
              className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <svg className="h-4 w-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M15 19l-7-7 7-7" />
              </svg>
              {t('common.previous')}
            </button>

            <div className="flex items-center space-x-4">
              {/* Skip button for optional questions */}
              {!currentQuestion.required && (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {t('common.skipForNow')}
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={
                  currentStep === 'TESTING_AND_MAINTENANCE' && 
                  currentQuestionIndex === currentStepData.inputs.length - 1
                }
                className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {currentStep === 'TESTING_AND_MAINTENANCE' && currentQuestionIndex === currentStepData.inputs.length - 1 
                  ? t('common.completePlan')
                  : t('common.next')
                }
                <svg className="h-4 w-4 ml-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Completion Status */}
          {isComplete && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-green-500 mr-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-medium text-green-900">
                    {t('common.congratulations')}
                  </h3>
                  <p className="text-green-700 mt-1">
                    {t('common.planCompleteDescription')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              {t('common.needHelp')}
              {autoSaveStatus === 'saved' && (
                <span className="block mt-1 text-green-600">
                  ✓ {t('common.automaticallySaved')}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
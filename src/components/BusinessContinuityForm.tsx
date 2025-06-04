'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useLocalizedSteps } from '@/lib/localizedSteps'
import { StructuredInput } from './StructuredInput'

interface FormData {
  [key: string]: {
    [key: string]: any
  }
}

export function BusinessContinuityForm() {
  const t = useTranslations()
  const STEPS = useLocalizedSteps()
  const [formData, setFormData] = useState<FormData>({})
  const [currentStep, setCurrentStep] = useState<string>('PLAN_INFORMATION')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

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

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      if (Object.keys(formData).length === 0) return
      
      setAutoSaveStatus('saving')
      try {
        localStorage.setItem('bcp-draft', JSON.stringify(formData))
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
      setFormData({})
      setCurrentStep('PLAN_INFORMATION')
      setCurrentQuestionIndex(0)
    }
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
      return value !== undefined && value !== ''
    })
  })

  // Check if a specific question is answered
  const isQuestionAnswered = (step: string, label: string) => {
    const stepAnswers = formData[step] || {}
    const value = stepAnswers[label]
    if (value === undefined) return false
    if (Array.isArray(value)) return value.length > 0
    return value !== ''
  }

  // Calculate completion percentage for each step
  const getStepCompletion = (step: string) => {
    const stepData = STEPS[step as keyof typeof STEPS]
    const stepAnswers = formData[step] || {}
    const answeredQuestions = stepData.inputs.filter(input => {
      const value = stepAnswers[input.label]
      if (input.type === 'checkbox' || input.type === 'table') {
        return Array.isArray(value) && value.length > 0
      }
      return value !== undefined && value !== ''
    })
    return Math.round((answeredQuestions.length / stepData.inputs.length) * 100)
  }

  // Get current value for display
  const getCurrentValue = () => {
    const stepAnswers = formData[currentStep] || {}
    return stepAnswers[currentQuestion.label]
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <div className="w-64 bg-white border-r overflow-y-auto">
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
          
          <div className="space-y-3">
            {Object.entries(STEPS).map(([step, stepData]) => {
              const completion = getStepCompletion(step)
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
        <div className="max-w-full mx-auto px-8 py-6">
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
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-900">
                {currentQuestion.label}
                {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
              </h2>
              <p className="text-gray-600 leading-relaxed">{currentQuestion.prompt}</p>
            </div>

            {/* Examples */}
            {currentQuestion.examples && currentQuestion.examples.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-blue-900 mb-2">{t('common.examples')}</h4>
                <ul>
                  {currentQuestion.examples.map((example, i) => (
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
              examples={currentQuestion.examples}
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
'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale, useMessages } from 'next-intl'
import { useLocalizedSteps } from '@/lib/localizedSteps'
import { StructuredInput } from './StructuredInput'
import IndustrySelector from './IndustrySelector'
import { LocationData, PreFillData } from '../data/types'
import { generatePreFillData, mergePreFillData, isFieldPreFilled } from '../services/preFillService'

interface FormData {
  [key: string]: {
    [key: string]: any
  }
}

export function MobileOptimizedForm() {
  const t = useTranslations()
  const locale = useLocale()
  const messages = useMessages()
  const STEPS = useLocalizedSteps()
  const [formData, setFormData] = useState<FormData>({})
  const [currentStep, setCurrentStep] = useState<string>('PLAN_INFORMATION')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isMobile, setIsMobile] = useState(false)
  const [showStepOverview, setShowStepOverview] = useState(false)
  
  // Industry selection states
  const [showIndustrySelector, setShowIndustrySelector] = useState(false)
  const [preFillData, setPreFillData] = useState<PreFillData | null>(null)
  const [hasSelectedIndustry, setHasSelectedIndustry] = useState(false)
  const [examples, setExamples] = useState<any>({})

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load saved data and industry selection
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('bcp-draft')
      const hasIndustrySelection = localStorage.getItem('bcp-industry-selected')
      
      if (savedData) {
        const parsed = JSON.parse(savedData)
        setFormData(parsed)
      }
      
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

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      if (Object.keys(formData).length === 0) return
      
      setAutoSaveStatus('saving')
      try {
        localStorage.setItem('bcp-draft', JSON.stringify(formData))
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus('idle'), 2000)
      } catch (error) {
        console.error('Auto-save failed:', error)
        setAutoSaveStatus('error')
        setTimeout(() => setAutoSaveStatus('idle'), 3000)
      }
    }

    const timeoutId = setTimeout(autoSave, 2000)
    return () => clearTimeout(timeoutId)
  }, [formData])

  const handleIndustrySelection = (industryId: string, location: LocationData) => {
    const preFillData = generatePreFillData(industryId, location, locale, messages)
    
    if (preFillData) {
      const mergedData = mergePreFillData(formData, preFillData)
      setFormData(mergedData)
      setExamples(preFillData.contextualExamples)
      setPreFillData(preFillData)
      
      localStorage.setItem('bcp-industry-selected', 'true')
      localStorage.setItem('bcp-prefill-data', JSON.stringify(preFillData))
      setHasSelectedIndustry(true)
    }
    
    setShowIndustrySelector(false)
  }

  const handleSkipIndustrySelection = () => {
    localStorage.setItem('bcp-industry-selected', 'skipped')
    setShowIndustrySelector(false)
  }

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
      const stepKeys = Object.keys(STEPS)
      const currentStepIndex = stepKeys.indexOf(currentStep)
      if (currentStepIndex > 0) {
        setCurrentStep(stepKeys[currentStepIndex - 1])
        const previousStepData = STEPS[stepKeys[currentStepIndex - 1] as keyof typeof STEPS]
        setCurrentQuestionIndex(previousStepData.inputs.length - 1)
      }
    }
  }

  const exportToPDF = async () => {
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planData: formData }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = 'business-continuity-plan.pdf'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        console.error('Failed to export PDF')
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
    }
  }

  // Calculate progress
  const currentStepData = STEPS[currentStep as keyof typeof STEPS]
  const currentQuestion = currentStepData.inputs[currentQuestionIndex]
  const totalQuestions = Object.values(STEPS).reduce((sum, step) => sum + step.inputs.length, 0)
  const currentQuestionNumber = Object.entries(STEPS).reduce((sum, [stepKey, step]) => {
    if (stepKey === currentStep) {
      return sum + currentQuestionIndex + 1
    }
    return stepKey < currentStep ? sum + step.inputs.length : sum
  }, 0)

  const overallProgress = (currentQuestionNumber / totalQuestions) * 100
  const isComplete = Object.values(STEPS).every(step => 
    step.inputs.every(input => formData[currentStep]?.[input.label])
  )

  if (showIndustrySelector) {
    return (
      <IndustrySelector
        onSelection={handleIndustrySelection}
        onSkip={handleSkipIndustrySelection}
      />
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'mobile-layout' : 'desktop-layout'}`}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowStepOverview(!showStepOverview)}
              className="flex items-center space-x-2 text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="font-medium">Steps</span>
            </button>
            
            <div className="text-center flex-1 mx-4">
              <div className="text-sm font-medium text-gray-900">
                {currentQuestionNumber} / {totalQuestions}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {autoSaveStatus === 'saved' && (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {autoSaveStatus === 'saving' && (
                <svg className="animate-spin w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Step Overview Overlay */}
      {isMobile && showStepOverview && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setShowStepOverview(false)}>
          <div className="bg-white h-full w-80 max-w-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Plan Sections</h3>
                <button 
                  onClick={() => setShowStepOverview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {Object.entries(STEPS).map(([step, stepData], index) => {
                const completion = Math.round(
                  (stepData.inputs.filter(input => formData[step]?.[input.label]).length / stepData.inputs.length) * 100
                )
                const isCurrentStep = currentStep === step
                
                return (
                  <button
                    key={step}
                    onClick={() => {
                      setCurrentStep(step)
                      setCurrentQuestionIndex(0)
                      setShowStepOverview(false)
                    }}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      isCurrentStep 
                        ? 'bg-blue-50 text-blue-600 border-blue-200' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{index + 1}. {stepData.title}</span>
                      <span className="text-xs text-gray-500">{completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all" 
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{stepData.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className={`flex ${isMobile ? 'flex-col' : 'min-h-screen'}`}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Business Continuity Plan</h2>
              
              <div className="space-y-3">
                {Object.entries(STEPS).map(([step, stepData], index) => {
                  const completion = Math.round(
                    (stepData.inputs.filter(input => formData[step]?.[input.label]).length / stepData.inputs.length) * 100
                  )
                  
                  return (
                    <button
                      key={step}
                      onClick={() => setCurrentStep(step)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        currentStep === step 
                          ? 'bg-blue-50 text-blue-600 border-blue-200' 
                          : 'hover:bg-gray-50 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm">{index + 1}. {stepData.title}</h3>
                        <span className="text-xs text-gray-500">{completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all" 
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{stepData.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className={`w-full ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}`}>
            {/* Question Content */}
            <div className={`bg-white rounded-lg shadow-sm border ${isMobile ? 'p-4' : 'p-8'}`}>
              <div className="mb-6">
                <h1 className={`font-bold text-gray-900 mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  {currentQuestion.label}
                  {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                </h1>
                <p className="text-gray-600 leading-relaxed text-sm">{currentQuestion.prompt}</p>
              </div>

              {/* Examples for mobile */}
              {preFillData?.contextualExamples?.[currentStep]?.[currentQuestion.label] && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    {t('common.examples')} ({t('industrySelector.industrySpecific')})
                  </h4>
                  <ul className="space-y-1">
                    {preFillData.contextualExamples[currentStep][currentQuestion.label].map((example: string, i: number) => (
                      <li key={i} className="text-sm text-blue-800 flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Input Component */}
              <StructuredInput
                {...currentQuestion}
                onComplete={(value) => handleInputComplete(currentStep, currentQuestion.label, value)}
                initialValue={formData[currentStep]?.[currentQuestion.label]}
                stepData={formData[currentStep]}
                setUserInteracted={() => {}}
              />
            </div>

            {/* Navigation */}
            <div className={`${isMobile ? 'mt-4' : 'mt-6'} flex justify-between`}>
              <button
                onClick={handlePrevious}
                disabled={currentQuestionNumber === 1}
                className={`${
                  isMobile ? 'px-4 py-3' : 'px-6 py-2'
                } bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>{t('common.previous')}</span>
              </button>

              <div className="flex space-x-3">
                {isComplete && (
                  <button
                    onClick={exportToPDF}
                    className={`${
                      isMobile ? 'px-4 py-3' : 'px-6 py-2'
                    } bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{t('common.exportPDF')}</span>
                  </button>
                )}

                <button
                  onClick={handleNext}
                  disabled={currentQuestionNumber === totalQuestions}
                  className={`${
                    isMobile ? 'px-4 py-3' : 'px-6 py-2'
                  } bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
                >
                  <span>{t('common.next')}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
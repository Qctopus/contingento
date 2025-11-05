'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale, useMessages } from 'next-intl'
import { useLocalizedSteps } from '@/lib/localizedSteps'
import { StructuredInput } from './StructuredInput'
import IndustrySelector from './IndustrySelector'
import { LocationData, PreFillData } from '../data/types'
import { generatePreFillData, mergePreFillData, isFieldPreFilled } from '../services/preFillService'
import { generateDynamicPreFillData } from '../services/dynamicPreFillService'
import { anonymousSessionService } from '@/services/anonymousSessionService'
import { BusinessPlanReview } from './BusinessPlanReview'

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

// Enhanced save state management
interface SaveState {
  status: 'idle' | 'saving' | 'saved' | 'error' | 'retrying'
  lastSaveTime: Date | null
  retryCount: number
  errorMessage: string | null
  hasUnsavedChanges: boolean
}

// Subtle Toast Notification Component
function SaveToast({ 
  saveState, 
  onDismiss 
}: { 
  saveState: SaveState
  onDismiss: () => void
}) {
  const t = useTranslations()
  
  // Only show toast for success confirmations or errors
  if (saveState.status !== 'saved' && saveState.status !== 'error') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className={`rounded-lg shadow-lg border p-3 flex items-center space-x-2 max-w-xs ${
        saveState.status === 'saved' 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        {saveState.status === 'saved' ? (
          <svg className="h-4 w-4 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-4 w-4 text-red-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">
            {saveState.status === 'saved' ? t('common.saved') : t('common.saveFailed')}
          </div>
          {saveState.status === 'error' && saveState.errorMessage && (
            <div className="text-xs opacity-75 truncate">
              {saveState.errorMessage}
            </div>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="h-3 w-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Subtle Save Status Component for Header
function SaveStatus({ 
  saveState, 
  onManualSave 
}: { 
  saveState: SaveState
  onManualSave: () => void
}) {
  const t = useTranslations()
  
  const formatTime = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex items-center space-x-2 text-xs">
      {/* Saving indicator */}
      {(saveState.status === 'saving' || saveState.status === 'retrying') && (
        <div className="flex items-center space-x-1 text-blue-600">
          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>
            {saveState.status === 'retrying' 
              ? `${t('common.retrying')} (${saveState.retryCount}/3)`
              : t('common.saving')
            }
          </span>
        </div>
      )}
      
      {/* Last saved time - only show when idle and saved recently */}
      {saveState.status === 'idle' && saveState.lastSaveTime && (
        <span className="text-gray-500">
          {t('common.lastSaved')}: {formatTime(saveState.lastSaveTime)}
        </span>
      )}
      
      {/* Unsaved changes indicator */}
      {saveState.hasUnsavedChanges && saveState.status === 'idle' && (
        <div className="flex items-center space-x-1 text-orange-600">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
          <span>{t('common.unsavedChanges')}</span>
        </div>
      )}
      
      {/* Error indicator with manual save option */}
      {saveState.status === 'error' && (
        <div className="flex items-center space-x-2">
          <span className="text-red-600">{t('common.saveFailed')}</span>
          <button
            onClick={onManualSave}
            className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs font-medium transition-colors"
          >
            {t('common.retry')}
          </button>
        </div>
      )}
      
      {/* Manual save button - only show when there are unsaved changes */}
      {saveState.hasUnsavedChanges && saveState.status !== 'saving' && saveState.status !== 'retrying' && (
        <button
          onClick={onManualSave}
          className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-2 py-1 rounded text-xs font-medium transition-colors"
        >
          {t('common.saveNow')}
        </button>
      )}
    </div>
  )
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
  
  // Enhanced save state management
  const [saveState, setSaveState] = useState<SaveState>({
    status: 'idle',
    lastSaveTime: null,
    retryCount: 0,
    errorMessage: null,
    hasUnsavedChanges: false
  })
  
  // Toast visibility state
  const [showToast, setShowToast] = useState(false)
  
  // Industry selection states
  const [showIndustrySelector, setShowIndustrySelector] = useState(false)
  const [preFillData, setPreFillData] = useState<PreFillData | null>(null)
  const [hasSelectedIndustry, setHasSelectedIndustry] = useState(false)
  const [examples, setExamples] = useState<any>({})
  const [showReview, setShowReview] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Refs for auto-save management
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastFormDataRef = useRef<string>('')
  const isManualSaveRef = useRef(false)
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastInputValueRef = useRef<Record<string, string>>({})

  // Enhanced auto-save with retry logic
  const performSave = async (isManualSave: boolean = false): Promise<boolean> => {
    if (Object.keys(formData).length === 0) return true
    
    const currentFormDataString = JSON.stringify(formData)
    if (currentFormDataString === lastFormDataRef.current && !isManualSave) {
      return true // No changes to save
    }

    try {
      setSaveState(prev => ({ 
        ...prev, 
        status: prev.retryCount > 0 ? 'retrying' : 'saving',
        errorMessage: null 
      }))

      // Save to localStorage (existing functionality)
      localStorage.setItem('bcp-draft', currentFormDataString)
      
      // Also save to anonymous session with simulated network delay
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
      await anonymousSessionService.savePlanData(formData)
      
      // Update state on successful save
      lastFormDataRef.current = currentFormDataString
      setSaveState(prev => ({
        ...prev,
        status: 'saved',
        lastSaveTime: new Date(),
        retryCount: 0,
        errorMessage: null,
        hasUnsavedChanges: false
      }))

      // Show success toast briefly for manual saves
      if (isManualSave) {
        setShowToast(true)
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
        toastTimeoutRef.current = setTimeout(() => {
          setShowToast(false)
        }, 3000)
      }

      // Auto-hide saved status after 10 seconds
      setTimeout(() => {
        setSaveState(prev => prev.status === 'saved' ? { ...prev, status: 'idle' } : prev)
      }, 10000)

      devLog('Save successful', { isManualSave, dataSize: currentFormDataString.length })
      return true

    } catch (error) {
      console.error('Save failed:', error)
      
      const errorMessage = error instanceof Error ? error.message : t('common.saveFailed')
      
      setSaveState(prev => ({
        ...prev,
        status: 'error',
        errorMessage,
        hasUnsavedChanges: true
      }))

      // Show error toast
      setShowToast(true)
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false)
      }, 5000) // Keep error toast longer

      devLog('Save failed', { error: errorMessage, retryCount: saveState.retryCount })
      return false
    }
  }

  // Auto-save with retry logic
  const scheduleAutoSave = async () => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Mark as having unsaved changes
    setSaveState(prev => ({ ...prev, hasUnsavedChanges: true }))

    // Schedule auto-save after 2 seconds
    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (isManualSaveRef.current) {
        isManualSaveRef.current = false
        return // Skip auto-save if manual save just occurred
      }

      const success = await performSave(false)
      
      if (!success && saveState.retryCount < 3) {
        // Retry with exponential backoff
        const retryDelay = Math.pow(2, saveState.retryCount) * 1000 // 1s, 2s, 4s
        
        setSaveState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }))
        
        setTimeout(async () => {
          await performSave(false)
        }, retryDelay)
        
        devLog('Scheduling retry', { retryCount: saveState.retryCount + 1, retryDelay })
      }
    }, 2000)
  }

  // Manual save function
  const handleManualSave = async () => {
    isManualSaveRef.current = true
    
    // Clear any pending auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    const success = await performSave(true)
    
    if (!success && saveState.retryCount < 3) {
      // For manual saves, retry immediately up to 3 times
      let retryCount = 0
      while (retryCount < 3) {
        retryCount++
        setSaveState(prev => ({ ...prev, retryCount }))
        
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // Progressive delay
        const retrySuccess = await performSave(true)
        
        if (retrySuccess) break
      }
    }
  }

  // Dismiss toast
  const dismissToast = () => {
    setShowToast(false)
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
  }

  // Check if user should see industry selector on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('bcp-draft')
      const hasIndustrySelection = localStorage.getItem('bcp-industry-selected')
      
      if (savedData) {
        const parsed = JSON.parse(savedData)
        setFormData(parsed)
        lastFormDataRef.current = savedData
        setSaveState(prev => ({
          ...prev,
          lastSaveTime: new Date(), // Assume it was saved when loaded
          hasUnsavedChanges: false
        }))
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
      setSaveState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: t('common.loadFailed')
      }))
    }
  }, [t])

  // Auto-save trigger when form data changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      scheduleAutoSave()
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [formData])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])



  // Handle industry selection
  const handleIndustrySelection = (industryId: string, location: LocationData) => {
    devLog('Industry selected', { industryId, location })
    setIsLoading(true)

    // Use the pre-fill data that IndustrySelector already prepared
    setTimeout(async () => {
      try {
        // Get the smart admin data that IndustrySelector prepared
        const storedPreFillData = localStorage.getItem('bcp-prefill-data')
        
        if (storedPreFillData) {
          const data = JSON.parse(storedPreFillData)
          
          // Store industry selection flag
          localStorage.setItem('bcp-industry-selected', 'true')
          
          const mergedData = mergePreFillData({}, data)
          setFormData(mergedData)
          setPreFillData(data)
          devLog('Smart admin pre-fill data loaded and merged', {
            preFillData: data,
            mergedData,
            source: 'admin-api'
          })
        } else {
          // Fallback to dynamic admin data if API call failed
          devLog('No admin pre-fill data found, trying dynamic service')
          try {
            const dynamicData = await generateDynamicPreFillData(industryId, location)
            
            if (dynamicData) {
              // Convert dynamic data to expected format
              const convertedData = {
                industry: { id: industryId, ...dynamicData.businessType },
                location,
                hazards: dynamicData.riskAssessments,
                preFilledFields: dynamicData.preFilledFields,
                contextualExamples: {},
                recommendedStrategies: dynamicData.recommendedStrategies
              }
              
              localStorage.setItem('bcp-industry-selected', 'true')
              localStorage.setItem('bcp-prefill-data', JSON.stringify(convertedData))
              
              const mergedData = mergePreFillData({}, convertedData)
              setFormData(mergedData)
              setPreFillData(convertedData)
              devLog('Dynamic admin pre-fill data loaded and merged', {
                preFillData: convertedData,
                mergedData,
                source: 'dynamic-admin'
              })
            } else {
              throw new Error('Dynamic service returned null')
            }
          } catch (dynamicError) {
            console.warn('Dynamic service failed, using static fallback:', dynamicError)
            // Final fallback to static system
            const locale = 'en'
            const data = await generatePreFillData(industryId, location, locale, messages)
            
            if (data) {
              localStorage.setItem('bcp-industry-selected', 'true')
              localStorage.setItem('bcp-prefill-data', JSON.stringify(data))
              
              const mergedData = mergePreFillData({}, data)
              setFormData(mergedData)
              setPreFillData(data)
              devLog('Static fallback pre-fill data loaded and merged', {
                preFillData: data,
                mergedData,
                source: 'static-fallback'
              })
            }
          }
        }
      } catch (error) {
        console.error('Error loading pre-fill data:', error)
        devLog('Pre-fill data loading failed, using fallback')
        
        // Final fallback to old system
        const locale = 'en'
        const data = await generatePreFillData(industryId, location, locale, messages)
        if (data) {
          localStorage.setItem('bcp-industry-selected', 'true')
          localStorage.setItem('bcp-prefill-data', JSON.stringify(data))
          const mergedData = mergePreFillData({}, data)
          setFormData(mergedData)
          setPreFillData(data)
        }
      }
      
      setIsLoading(false)
      setHasSelectedIndustry(true)
      setShowIndustrySelector(false)
    }, 500)
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
      // COMPLETELY REPLACE step data with defaults (don't merge)
      // This ensures reset actually resets, not just overlays defaults
      setFormData(prev => ({
        ...prev,
        [stepId]: stepDefaults  // Direct replacement, no spreading prev[stepId]
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
      
      setSaveState(prev => ({ ...prev, status: 'saving' }))
      try {
        // Save to localStorage (existing functionality)
        localStorage.setItem('bcp-draft', JSON.stringify(formData))
        
        // Also save to anonymous session
        anonymousSessionService.savePlanData(formData)
        
        setSaveState(prev => ({ ...prev, status: 'saved' }))
        
        setTimeout(() => {
          setSaveState(prev => prev.status === 'saved' ? { ...prev, status: 'idle' } : prev)
        }, 2000)
      } catch (error) {
        console.error('Auto-save failed:', error)
        setSaveState(prev => ({ ...prev, status: 'error' }))
        setTimeout(() => {
          setSaveState(prev => prev.status === 'error' ? { ...prev, status: 'idle' } : prev)
        }, 3000)
      }
    }

    const timeoutId = setTimeout(autoSave, 2000)
    return () => clearTimeout(timeoutId)
  }, [formData])

  const handleInputComplete = (step: string, label: string, value: any) => {
    // Create a unique key for this input
    const inputKey = `${step}:${label}`
    
    // Serialize the value for comparison
    const valueString = JSON.stringify(value)
    
    // Skip if this exact value was just processed
    if (lastInputValueRef.current[inputKey] === valueString) {
      return // Prevent duplicate processing
    }
    
    // CRITICAL FIX: Don't overwrite array data with empty strings
    // This happens when components re-render with empty initialValue
    if (step === 'STRATEGIES' && typeof value === 'string' && value === '') {
      return
    }
    
    // Update the last value ref
    lastInputValueRef.current[inputKey] = valueString
    
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [step]: {
          ...prev[step],
          [label]: value
        }
      }
      
      return updatedData
    })
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
        const nextStep = stepKeys[currentStepIndex + 1]
        setCurrentStep(nextStep)
        setCurrentQuestionIndex(0)
      } else {
        // All steps complete, show review page
        setShowReview(true)
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
      console.log('Saving plan data:', formData)
      
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
        const errorData = await response.json()
        console.error('Save failed with status:', response.status, errorData)
        throw new Error(errorData.details || `Failed to save plan (${response.status})`)
      }

      const data = await response.json()
      console.log('Save successful:', data)
      
      // Clear the draft after successful save
      localStorage.removeItem('bcp-draft')
      
      alert(`${t('common.success')} - Plan saved with ID: ${data.planId}`)
    } catch (error) {
      console.error('Error saving plan:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`${t('common.error')}: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const exportToPDF = async (mode: 'formal' | 'workbook' = 'formal') => {
    try {
      // Determine API endpoint based on mode
      let endpoint = '/api/export-workbook-pdf'
      let suffix = 'bcp-action-workbook'
      
      if (mode === 'formal') {
        endpoint = '/api/export-formal-bcp'
        suffix = 'formal-bcp'
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planData: formData,
          localCurrency: 'JMD',
          exchangeRate: 150
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Determine filename based on mode
      const companyName = formData.PLAN_INFORMATION?.['Company Name'] || 'business'
      a.download = `${companyName}-${suffix}.pdf`
      
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
      setSaveState({
        status: 'idle',
        lastSaveTime: null,
        retryCount: 0,
        errorMessage: null,
        hasUnsavedChanges: false
      })
      lastFormDataRef.current = ''
      setShowToast(false)
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

  // Show review page if all steps are complete
  const handleBackFromReview = () => {
    setShowReview(false)
    // Go to last question of last step
    const stepKeys = Object.keys(STEPS)
    setCurrentStep(stepKeys[stepKeys.length - 1])
    const lastStepData = STEPS[stepKeys[stepKeys.length - 1] as keyof typeof STEPS]
    setCurrentQuestionIndex(lastStepData.inputs.length - 1)
  }
  if (showReview) {
    return (
      <BusinessPlanReview
        formData={formData}
        onBack={handleBackFromReview}
        onExportPDF={exportToPDF}
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
    
    // Handle arrays (like strategies)
    if (Array.isArray(value)) {
      return value.length > 0
    }
    
    return value !== undefined && value !== null && value !== ''
  }

  const getStepCompletion = (step: string) => {
    const stepData = STEPS[step as keyof typeof STEPS]
    
    // Handle custom steps not in STEPS definition (like STRATEGIES, ACTION_PLAN)
    if (!stepData) {
      const stepAnswers = formData[step]
      
      // Debug logging for STRATEGIES step
      if (step === 'STRATEGIES') {
        console.log('📊 Progress Calculation for STRATEGIES:', {
          hasStepData: !!stepAnswers,
          stepAnswers: stepAnswers,
          keys: stepAnswers ? Object.keys(stepAnswers) : [],
          values: stepAnswers ? Object.values(stepAnswers).map(v => 
            Array.isArray(v) ? `Array(${v.length})` : typeof v
          ) : []
        })
      }
      
      if (!stepAnswers || typeof stepAnswers !== 'object') {
        console.log(`⚠️ ${step}: No data or not an object, returning 0%`)
        return 0
      }
      
      // Check if any data exists in this step
      const hasData = Object.keys(stepAnswers).some(key => {
        const value = stepAnswers[key]
        if (Array.isArray(value)) {
          return value.length > 0
        }
        return value !== undefined && value !== null && value !== ''
      })
      
      const percentage = hasData ? 100 : 0
      console.log(`✅ ${step}: ${percentage}% (hasData: ${hasData})`)
      return percentage
    }
    
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
    
    // Removed excessive logging that was causing console spam
    
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
      {/* Subtle Toast Notification - Only when needed */}
      {showToast && (
        <SaveToast 
          saveState={saveState}
          onDismiss={dismissToast}
        />
      )}

      {/* Navigation Sidebar */}
      <div className="w-80 bg-white border-r overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('common.businessContinuityPlan')}</h2>
            {/* Integrated Save Status */}
            <SaveStatus 
              saveState={saveState}
              onManualSave={handleManualSave}
            />
          </div>

          {/* Industry Information Display */}
          {hasSelectedIndustry && preFillData && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-2">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-800">{t('common.industryProfile')}</span>
              </div>
                             <div className="text-xs text-blue-700">
                 <div><strong>{t('common.industry')}:</strong> {preFillData.industry.name}</div>
                 <div><strong>{t('common.location')}:</strong> {preFillData.location.parish}, {preFillData.location.country}</div>
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
              <p className="text-gray-600 leading-relaxed">
                {currentQuestion.prompt}
                {currentQuestion.label === 'Approximate Annual Revenue' && preFillData?.location?.countryCode && (() => {
                  const currencyMap: Record<string, { code: string; symbol: string }> = {
                    'JM': { code: 'JMD', symbol: 'J$' },
                    'TT': { code: 'TTD', symbol: 'TT$' },
                    'BB': { code: 'BBD', symbol: 'Bds$' },
                    'BS': { code: 'BSD', symbol: 'B$' },
                    'HT': { code: 'HTG', symbol: 'G' },
                    'DO': { code: 'DOP', symbol: 'RD$' },
                    'GD': { code: 'XCD', symbol: 'EC$' },
                    'LC': { code: 'XCD', symbol: 'EC$' },
                    'AG': { code: 'XCD', symbol: 'EC$' },
                    'VC': { code: 'XCD', symbol: 'EC$' },
                    'DM': { code: 'XCD', symbol: 'EC$' },
                    'KN': { code: 'XCD', symbol: 'EC$' },
                  }
                  const currency = currencyMap[preFillData.location.countryCode] || { code: 'JMD', symbol: 'J$' }
                  return <span className="block mt-2 text-sm font-medium text-blue-600">💰 Amounts shown are in {currency.code} ({currency.symbol})</span>
                })()}
              </p>
            </div>

            {/* Examples are rendered inside StructuredInput with de-duplication */}

            {/* Input Component */}
            <StructuredInput
              type={currentQuestion.type}
              label={currentQuestion.label}
              required={currentQuestion.required}
              prompt={currentQuestion.prompt}
              examples={getIndustryExamples()}
              placeholder={(currentQuestion as any).placeholder}
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
              preFillData={preFillData}
              onComplete={(value) => handleInputComplete(currentStep, currentQuestion.label, value)}
              initialValue={getCurrentValue()}
              key={`${currentStep}-${currentQuestion.label}`}
            />
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
                onClick={currentStep === 'TESTING_AND_MAINTENANCE' && currentQuestionIndex === currentStepData.inputs.length - 1 
                  ? () => setShowReview(true)
                  : handleNext
                }
                className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
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
            </p>
            {/* Removed old save status display since we have the enhanced indicator */}
          </div>
        </div>
      </div>
    </div>
  )
}
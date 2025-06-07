'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface ResponsiveNavigationProps {
  steps: any
  currentStep: string
  currentQuestionIndex: number
  formData: any
  preFillData: any
  hasSelectedIndustry: boolean
  autoSaveStatus: string
  onStepClick: (step: string) => void
  onQuestionClick: (step: string, index: number) => void
  onResetDefaults: (step: string) => void
  children: React.ReactNode
}

export function ResponsiveNavigation({
  steps,
  currentStep,
  currentQuestionIndex,
  formData,
  preFillData,
  hasSelectedIndustry,
  autoSaveStatus,
  onStepClick,
  onQuestionClick,
  onResetDefaults,
  children
}: ResponsiveNavigationProps) {
  const t = useTranslations('common')
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const getStepCompletion = (step: string) => {
    const stepData = steps[step]
    if (!stepData) return 0
    
    const totalInputs = stepData.inputs.length
    const completedInputs = stepData.inputs.filter((input: any) => {
      const value = formData[step]?.[input.label]
      return value !== undefined && value !== null && value !== ''
    }).length
    
    return Math.round((completedInputs / totalInputs) * 100)
  }

  const isFieldPreFilled = (step: string, label: string, value: any, preFillData: any) => {
    if (!preFillData?.preFilledFields?.[step]?.[label]) return false
    return preFillData.preFilledFields[step][label] === value
  }

  const isQuestionAnswered = (step: string, label: string) => {
    const value = formData[step]?.[label]
    return value !== undefined && value !== null && value !== ''
  }

  const NavigationContent = () => (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('businessContinuityPlan')}</h2>
          {autoSaveStatus === 'saving' && (
            <span className="text-xs text-gray-500">{t('saving')}</span>
          )}
          {autoSaveStatus === 'saved' && (
            <span className="text-xs text-green-600">✓ {t('saved')}</span>
          )}
          {autoSaveStatus === 'error' && (
            <span className="text-xs text-red-600">{t('saveFailed')}</span>
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
          {Object.entries(steps).map(([step, stepData]: [string, any]) => {
            const completion = getStepCompletion(step)
            const hasPreFillDefaults = preFillData?.preFilledFields[step]
            return (
              <div key={step} className="space-y-2">
                <button
                  onClick={() => {
                    onStepClick(step)
                    setIsMobileNavOpen(false)
                  }}
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
                    {stepData.inputs.map((input: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => {
                          onQuestionClick(step, index)
                          setIsMobileNavOpen(false)
                        }}
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
                    
                    {hasPreFillDefaults && currentStep === step && (
                      <button
                        onClick={() => onResetDefaults(step)}
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
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Navigation Sidebar */}
      <div className="hidden lg:block w-80 bg-white border-r overflow-y-auto">
        <NavigationContent />
      </div>

      {/* Mobile Navigation Button */}
      <button
        onClick={() => setIsMobileNavOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white border border-gray-300 rounded-lg shadow-sm"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Navigation Overlay */}
      {isMobileNavOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="lg:hidden fixed left-0 top-0 h-full w-80 bg-white border-r overflow-y-auto z-50 transform transition-transform">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{t('businessContinuityPlan')}</h2>
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <NavigationContent />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
} 
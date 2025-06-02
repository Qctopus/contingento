'use client'

import { useState } from 'react'
import { STEPS } from '@/lib/steps'
import { StructuredInput } from './StructuredInput'

interface FormData {
  [key: string]: {
    [key: string]: any
  }
}

export function BusinessContinuityForm() {
  const [formData, setFormData] = useState<FormData>({})
  const [currentStep, setCurrentStep] = useState<string>('BUSINESS_OVERVIEW')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      alert('Plan saved successfully!')
    } catch (error) {
      console.error('Error saving plan:', error)
      alert('Failed to save plan. Please try again.')
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
      a.download = 'business-continuity-plan.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <div className="w-64 bg-white border-r p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Business Continuity Plan</h2>
        <div className="space-y-4">
          {Object.entries(STEPS).map(([step, stepData]) => (
            <div key={step} className="space-y-2">
              <button
                onClick={() => handleStepClick(step)}
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  currentStep === step ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                }`}
              >
                <h3 className="font-medium">{stepData.title}</h3>
                <p className="text-sm text-gray-500">{stepData.description}</p>
              </button>
              {currentStep === step && (
                <div className="pl-4 space-y-1">
                  {stepData.inputs.map((input, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuestionClick(step, index)}
                      className={`w-full text-left px-3 py-1 text-sm rounded flex items-center ${
                        currentQuestionIndex === index
                          ? 'bg-primary-100 text-primary-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex-1">{input.label}</span>
                      {isQuestionAnswered(step, input.label) && (
                        <svg
                          className="h-4 w-4 text-green-500"
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
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Question {currentQuestionNumber} of {totalQuestions}
              </span>
              <span className="text-sm text-gray-600">
                {currentStepData.title}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-primary-600 rounded-full transition-all duration-300"
                style={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-2">{currentQuestion.label}</h2>
            <p className="text-gray-600 mb-4">{currentQuestion.prompt}</p>
            {currentQuestion.examples && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm font-medium mb-2">Examples:</p>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {currentQuestion.examples.map((example, i) => (
                    <li key={i}>{example}</li>
                  ))}
                </ul>
              </div>
            )}
            <StructuredInput
              {...currentQuestion}
              onComplete={(value) => handleInputComplete(currentStep, currentQuestion.label, value)}
              key={`${currentStep}-${currentQuestion.label}`} // Force re-render on question change
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 'BUSINESS_OVERVIEW' && currentQuestionIndex === 0}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            <div className="space-x-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Progress'}
              </button>
              {isComplete && (
                <button
                  onClick={exportToPDF}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Export to PDF
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={currentStep === 'ACTION_PLAN' && currentQuestionIndex === currentStepData.inputs.length - 1}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
interface ProgressBarProps {
  steps: string[]
  currentStep: number
}

export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div className="border-b p-4">
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = stepNumber < currentStep

          return (
            <div
              key={step}
              className={`flex flex-col items-center ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`}
            >
              <div
                className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  isActive
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : isCompleted
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-gray-300'
                }`}
              >
                {isCompleted ? '✓' : stepNumber}
              </div>
              <span className="text-sm font-medium">{step}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
} 
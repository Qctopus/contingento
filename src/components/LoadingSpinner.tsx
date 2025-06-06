'use client'

import { useTranslations } from 'next-intl'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const t = useTranslations('common')

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} text-primary-600`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <span className={`text-gray-600 ${textSizeClasses[size]}`}>
          {text}
        </span>
      )}
      {!text && (
        <span className={`text-gray-600 ${textSizeClasses[size]}`}>
          {t('loading')}
        </span>
      )}
    </div>
  )
}

// Full page loading component
export function PageLoader() {
  const t = useTranslations('common')
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" text={t('loading')} />
        <p className="mt-4 text-gray-500">
          Please wait while we prepare your business continuity planner...
        </p>
      </div>
    </div>
  )
} 
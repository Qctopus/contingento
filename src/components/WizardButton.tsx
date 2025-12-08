'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export function WizardButton() {
  const t = useTranslations('header')
  const tCommon = useTranslations('common')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleRestartWizard = () => {
    // Clear all wizard-related localStorage data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bcp-industry-selected')
      localStorage.removeItem('bcp-prefill-data')
      localStorage.removeItem('bcp-draft')
      
      // Reload to restart the wizard
      window.location.reload()
    }
  }

  const handleClick = () => {
    // Check if there's existing data that would be lost
    if (typeof window !== 'undefined') {
      const hasDraft = localStorage.getItem('bcp-draft')
      const hasIndustryData = localStorage.getItem('bcp-industry-selected')
      
      if (hasDraft && Object.keys(JSON.parse(hasDraft || '{}')).length > 0) {
        setShowConfirm(true)
      } else {
        handleRestartWizard()
      }
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
      >
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="hidden sm:inline">{t('restartWizard')}</span>
        <span className="sm:hidden">{t('restart')}</span>
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('restartWizardConfirm')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('restartWizardWarning')}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {t('restartWizardMessage')}
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  onClick={handleRestartWizard}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {t('yesRestart')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 
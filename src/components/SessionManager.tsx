'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { anonymousSessionService } from '@/services/anonymousSessionService';
import { SaveOptions, AccessAttempt } from '@/types';

// Note: Session Manager uses both 'sessionManager' and 'header' namespaces

interface SessionManagerProps {
  // Remove onPlanLoaded prop to fix static generation
}

export function SessionManager({}: SessionManagerProps) {
  const t = useTranslations('sessionManager');
  const tHeader = useTranslations('header');
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'save' | 'access'>('save');
  const [sessionSummary, setSessionSummary] = useState<{
    hasSession: boolean;
    isCloudSaved: boolean;
    businessName?: string;
    canShare: boolean;
  }>({
    hasSession: false,
    isCloudSaved: false,
    canShare: false
  });
  
  // Save form state
  const [saveOptions, setSaveOptions] = useState<SaveOptions>({
    saveToCloud: true,
    businessName: '',
    pin: '',
    email: '',
    allowSharing: false
  });
  
  // Access form state
  const [accessAttempt, setAccessAttempt] = useState<AccessAttempt>({
    businessName: '',
    pin: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [shareableLink, setShareableLink] = useState<string | null>(null);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    const summary = anonymousSessionService.getSessionSummary();
    setSessionSummary(summary);
  }, []);

  useEffect(() => {
    if (isClient && isOpen) {
      const summary = anonymousSessionService.getSessionSummary();
      setSessionSummary(summary);
    }
  }, [isClient, isOpen]);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const result = await anonymousSessionService.saveToCloud(saveOptions);
      
      if (result.success) {
        setMessage({ type: 'success', text: t('planSavedSuccessfully') });
        if (result.shareableLink) {
          setShareableLink(result.shareableLink);
        }
        const summary = anonymousSessionService.getSessionSummary();
        setSessionSummary(summary);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save plan' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccess = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const result = await anonymousSessionService.accessSavedPlan(accessAttempt);
      
      if (result.success && result.planData) {
        setMessage({ type: 'success', text: t('planLoadedSuccessfully') });
        
        // Store loaded plan data to localStorage for form to pick up
        if (typeof window !== 'undefined') {
          localStorage.setItem('bcp-draft', JSON.stringify(result.planData));
          // Trigger a page reload to load the new data
          setTimeout(() => {
            window.location.reload();
          }, 1000); // Small delay to show success message
        }
        
        setIsOpen(false);
        const summary = anonymousSessionService.getSessionSummary();
        setSessionSummary(summary);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to access plan' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPlan = () => {
    anonymousSessionService.clearSession();
    window.location.reload(); // Simple way to restart
  };

  // Don't render anything during SSR
  if (!isClient) {
    return null;
  }

  // Compact inline version for header
  if (!isOpen) {
    return (
      <div className="flex items-center space-x-3">
        {/* Status indicator */}
        <div className="flex items-center space-x-2 text-sm">
          {sessionSummary.hasSession ? (
            <>
              <div className={`w-2 h-2 rounded-full ${sessionSummary.isCloudSaved ? 'bg-green-400' : 'bg-orange-400'}`}></div>
              <span className="text-gray-600 dark:text-gray-300 hidden sm:inline">
                {sessionSummary.businessName || tHeader('planDraft')}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                ({sessionSummary.isCloudSaved ? tHeader('saved') : tHeader('local')})
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">{tHeader('noPlan')}</span>
            </>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="hidden sm:inline">{tHeader('managePlan')}</span>
          <span className="sm:hidden">{tHeader('save')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              {t('managePlan')}
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-100 transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Mode Selection */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setMode('save'); setMessage(null); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'save' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
            >
              {t('saveToCloud')}
            </button>
            <button
              onClick={() => { setMode('access'); setMessage(null); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'access' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
            >
              {t('loadPlan')}
            </button>
          </div>

          {/* Save Mode */}
          {mode === 'save' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('businessNameRequired')}
                </label>
                <input
                  type="text"
                  value={saveOptions.businessName}
                  onChange={(e) => setSaveOptions(prev => ({ ...prev, businessName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder={t('enterBusinessName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('sixDigitPinRequired')}
                </label>
                <input
                  type="password"
                  value={saveOptions.pin}
                  onChange={(e) => setSaveOptions(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder={t('pinPlaceholder')}
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('pinHelp')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('emailOptional')}
                </label>
                <input
                  type="email"
                  value={saveOptions.email}
                  onChange={(e) => setSaveOptions(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder={t('emailPlaceholder')}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('emailHelp')}</p>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="allowSharing"
                  checked={saveOptions.allowSharing}
                  onChange={(e) => setSaveOptions(prev => ({ ...prev, allowSharing: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="allowSharing" className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('allowSharing')}
                </label>
              </div>

              <button
                onClick={handleSave}
                disabled={loading || !saveOptions.businessName || !saveOptions.pin || saveOptions.pin.length !== 6}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('saving')}</span>
                  </div>
                ) : (
                  t('saveToCloud')
                )}
              </button>

              {shareableLink && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">{t('shareableLinkCreated')}</p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={shareableLink}
                      readOnly
                      className="flex-1 p-2 text-xs bg-white dark:bg-gray-700 border border-green-300 dark:border-green-600 rounded text-gray-800 dark:text-gray-200"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(shareableLink)}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                    >
                      {t('copy')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Access Mode */}
          {mode === 'access' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('businessName')}
                </label>
                <input
                  type="text"
                  value={accessAttempt.businessName}
                  onChange={(e) => setAccessAttempt(prev => ({ ...prev, businessName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder={t('enterBusinessName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('sixDigitPin')}
                </label>
                <input
                  type="password"
                  value={accessAttempt.pin}
                  onChange={(e) => setAccessAttempt(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder={t('pinPlaceholder')}
                  maxLength={6}
                />
              </div>

              <button
                onClick={handleAccess}
                disabled={loading || !accessAttempt.businessName || !accessAttempt.pin || accessAttempt.pin.length !== 6}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('loading')}</span>
                  </div>
                ) : (
                  t('loadPlan')
                )}
              </button>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={handleNewPlan}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium text-sm transition-colors"
                >
                  {t('startNewPlan')}
                </button>
              </div>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">{t('privacySecurity')}</h4>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• {t('privacyBullet1')}</li>
                  <li>• {t('privacyBullet2')}</li>
                  <li>• {t('privacyBullet3')}</li>
                  <li>• {t('privacyBullet4')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
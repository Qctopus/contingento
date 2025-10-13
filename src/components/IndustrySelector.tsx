'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { LocationData } from '../data/types'
import { centralDataService } from '../services/centralDataService'
import type { BusinessType, Parish, Country, AdminUnit } from '../types/admin'
import type { Locale } from '../i18n/config'

interface IndustrySelectorProps {
  onSelection: (industryId: string, location: LocationData) => void
  onSkip: () => void
}

export default function IndustrySelector({ onSelection, onSkip }: IndustrySelectorProps) {
  const t = useTranslations('industrySelector')
  const locale = useLocale() as Locale
  const [selectedIndustry, setSelectedIndustry] = useState<string>('')
  const [location, setLocation] = useState<LocationData>({
    country: '',
    countryCode: '',
    parish: '',
    region: '',
    nearCoast: false,
    urbanArea: false
  })
  const [currentStep, setCurrentStep] = useState<'industry' | 'location' | 'characteristics'>('industry')
  const [businessCharacteristics, setBusinessCharacteristics] = useState<Record<string, any>>({
    // Legacy fields for backward compatibility
    customerBase: 'mix' as 'mainly_tourists' | 'mix' | 'mainly_locals',
    powerDependency: 'partially' as 'can_operate' | 'partially' | 'cannot_operate',
    digitalDependency: 'helpful' as 'essential' | 'helpful' | 'not_used',
    importsFromOverseas: false,
    sellsPerishable: false,
    minimalInventory: false,
    expensiveEquipment: false
  })
  const [multipliers, setMultipliers] = useState<any[]>([])
  const [loadingMultipliers, setLoadingMultipliers] = useState(false)
  const [businessTypesByCategory, setBusinessTypesByCategory] = useState<Array<{
    category: string
    title: string
    businessTypes: BusinessType[]
  }>>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [adminUnits, setAdminUnits] = useState<AdminUnit[]>([])
  const [selectedCountryId, setSelectedCountryId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [loadingAdminUnits, setLoadingAdminUnits] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [preFillPreview, setPreFillPreview] = useState<any>(null)

  // Load multipliers with wizard questions
  useEffect(() => {
    const loadMultipliers = async () => {
      try {
        setLoadingMultipliers(true)
        const response = await fetch('/api/admin2/multipliers?activeOnly=true')
        const result = await response.json()
        
        if (result.success) {
          // Filter to only multipliers with wizard questions
          const multipliersWithQuestions = result.multipliers.filter((m: any) => m.wizardQuestion)
          setMultipliers(multipliersWithQuestions)
          console.log(`📋 Loaded ${multipliersWithQuestions.length} multiplier questions`)
        }
      } catch (err) {
        console.error('Error loading multipliers:', err)
      } finally {
        setLoadingMultipliers(false)
      }
    }
    
    loadMultipliers()
  }, [])

  // Load business types and countries
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true)
        const [businessTypes, countriesResponse] = await Promise.all([
          centralDataService.getBusinessTypes(true, locale),
          fetch('/api/admin2/countries?activeOnly=true').then(r => r.json())
        ])
        
        // Group business types by category
        const groupedBusinessTypes = businessTypes.reduce((acc, businessType) => {
          const category = businessType.category || 'other'
          let group = acc.find(g => g.category === category)
          if (!group) {
            group = {
              category,
              title: category.charAt(0).toUpperCase() + category.slice(1),
              businessTypes: []
            }
            acc.push(group)
          }
          group.businessTypes.push(businessType)
          return acc
        }, [] as Array<{ category: string; title: string; businessTypes: BusinessType[] }>)
        
        setBusinessTypesByCategory(groupedBusinessTypes)
        
        if (countriesResponse.success && countriesResponse.data.length > 0) {
          setCountries(countriesResponse.data)
          // Auto-select Jamaica if it exists
          const jamaica = countriesResponse.data.find((c: Country) => c.code === 'JM')
          if (jamaica) {
            setSelectedCountryId(jamaica.id)
            setLocation(prev => ({
              ...prev,
              country: jamaica.name,
              countryCode: jamaica.code
            }))
          }
        }
      } catch (err) {
        setError('Failed to load business types and locations')
        console.error('Error loading admin data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [locale])

  // Load admin units when country is selected
  useEffect(() => {
    const loadAdminUnits = async () => {
      if (!selectedCountryId) {
        setAdminUnits([])
        return
      }

      try {
        setLoadingAdminUnits(true)
        const response = await fetch(`/api/admin2/admin-units?countryId=${selectedCountryId}&activeOnly=true`)
        const result = await response.json()
        
        if (result.success) {
          setAdminUnits(result.data)
        }
      } catch (err) {
        console.error('Error loading admin units:', err)
      } finally {
        setLoadingAdminUnits(false)
      }
    }

    loadAdminUnits()
  }, [selectedCountryId])

  // Map admin units to parish format for compatibility
  const parishes = adminUnits.map(unit => ({ 
    name: unit.name, 
    code: unit.id 
  }))

  const handleIndustrySelect = async (industryId: string) => {
    setSelectedIndustry(industryId)
    setCurrentStep('location')
    
    // Fetch risk preview for the selected business type
    try {
      const response = await fetch('/api/wizard/get-smart-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessTypeId: industryId,
          countryCode: location.countryCode || 'JM', // Default to Jamaica
          parish: location.parish,
          nearCoast: location.nearCoast,
          urbanArea: location.urbanArea
        })
      })
      
      if (response.ok) {
        const preview = await response.json()
        setPreFillPreview(preview)
      }
    } catch (error) {
      console.error('Error fetching risk preview:', error)
      // Don't show error to user - preview is optional
    }
  }

  const handleLocationSubmit = () => {
    if (!selectedIndustry || !location.country) return
    // Move to characteristics step
    setCurrentStep('characteristics')
  }
  
  const handleCharacteristicsSubmit = async () => {
    if (!selectedIndustry || !location.country) return
    
    try {
      setSubmitting(true)
      setError(null)
      
      // CRITICAL: Clear old cached data to force fresh calculation with multipliers
      localStorage.removeItem('bcp-prefill-data')
      console.log('🗑️ Cleared old prefill data - generating fresh with multipliers...')
      
      // Call the prepare-prefill-data API with business characteristics
      const response = await fetch('/api/wizard/prepare-prefill-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessTypeId: selectedIndustry,
          location: location,
          businessCharacteristics: businessCharacteristics,
          locale: locale
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to prepare pre-fill data: ${response.status}`)
      }

      const preFillData = await response.json()
      
      // Store in localStorage as required
      localStorage.setItem('bcp-prefill-data', JSON.stringify(preFillData))
      
      console.log('Pre-fill data prepared and stored:', preFillData)
      
      // Call the original selection handler
      onSelection(selectedIndustry, location)
      
    } catch (error) {
      console.error('Error preparing pre-fill data:', error)
      setError('Failed to prepare business data. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCountryChange = (countryId: string) => {
    const country = countries.find(c => c.id === countryId)
    if (country) {
      setSelectedCountryId(countryId)
      setLocation(prev => ({
        ...prev,
        country: country.name,
        countryCode: country.code,
        parish: '', // Reset parish when country changes
        region: ''
      }))
    }
  }

  const canProceed = selectedIndustry && location.country && !submitting

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading business types and locations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="text-red-600 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Characteristics Step - Simple questions for small business owners
  if (currentStep === 'characteristics') {
    // Get selected business type for display
    const selectedBusiness = businessTypesByCategory
      .flatMap(cat => cat.businessTypes)
      .find(bt => bt.businessTypeId === selectedIndustry)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 pt-8">
            <button
              onClick={() => setCurrentStep('location')}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center mx-auto"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('backToLocation') || 'Back to Location'}
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('characteristicsTitle')}
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              {t('characteristicsDescription')}
            </p>
            {selectedBusiness && (
              <p className="text-sm text-gray-500">
                {selectedBusiness.name} • {location.parish ? `${location.parish}, ` : ''}{location.country}
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            {loadingMultipliers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">{t('loadingQuestions')}</p>
              </div>
            ) : (
            <div className="space-y-6">
              {/* Location Characteristics - User Input */}
              <div className="pb-6 border-b border-gray-200 bg-gray-50 p-4 rounded-lg">
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  {t('aboutLocationTitle')}
                </label>
                {/* Removed hardcoded location questions - now handled by Dynamic Multiplier Questions below */}
              </div>

                {/* Dynamic Multiplier Questions (from Admin Panel) */}
                {multipliers
                  .filter(m => m.isActive) // Only show active multipliers
                  .map((multiplier, index) => {
                  const question = (() => {
                    try {
                      const parsed = JSON.parse(multiplier.wizardQuestion)
                      return parsed[locale] || parsed['en'] || multiplier.name
                    } catch {
                      return multiplier.name
                    }
                  })()
                  
                  const helpText = (() => {
                    try {
                      if (multiplier.wizardHelpText) {
                        const parsed = JSON.parse(multiplier.wizardHelpText)
                        return parsed[locale] || parsed['en']
                      }
                    } catch {}
                    return null
                  })()
                  
                  const answerOptions = (() => {
                    try {
                      if (multiplier.wizardAnswerOptions) {
                        return JSON.parse(multiplier.wizardAnswerOptions)
                      }
                    } catch {}
                    return null
                  })()

                  const charType = multiplier.characteristicType
                  const currentValue = businessCharacteristics[charType]
                  
                  return (
                    <div key={multiplier.id} className={`${index < multipliers.length - 1 ? 'pb-6 border-b border-gray-200' : ''}`}>
                      <div className="mb-4">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-700 font-bold text-sm">{index + 1}</span>
                    </div>
                          <label className="flex-1 text-lg font-semibold text-gray-900 pt-1">
                            {question}
                  </label>
                    </div>
                        {helpText && (
                          <div className="ml-11 flex items-start gap-2 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-blue-900">{helpText}</p>
                    </div>
                        )}
              </div>

                      {/* Render different input types based on conditionType */}
                      {multiplier.conditionType === 'boolean' ? (
                        <div className="ml-11 space-y-2">
                          {answerOptions && answerOptions.length > 0 ? (
                            // Use provided answer options
                            answerOptions.map((option: any) => {
                              const label = typeof option.label === 'object' 
                                ? (option.label[locale] || option.label['en']) 
                                : option.label
                              const isSelected = currentValue === option.value
                              
                              return (
                                <label 
                                  key={String(option.value)} 
                                  className={`
                                    group relative flex items-start p-4 rounded-xl cursor-pointer transition-all duration-200
                                    ${isSelected 
                                      ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
                                      : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                    }
                                  `}
                                >
                                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                                      name={charType}
                                      checked={isSelected}
                                      onChange={() => setBusinessCharacteristics(prev => ({ 
                                        ...prev, 
                                        [charType]: option.value 
                                      }))}
                                      className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                    </div>
                                  <div className="ml-4 flex-1">
                                    <div className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                      {label}
                    </div>
                                    {option.description && (
                                      <div className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                                        {option.description}
                    </div>
                                    )}
                </div>
                                  {isSelected && (
                                    <div className="ml-2">
                                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
              </div>
                                  )}
                </label>
                              )
                            })
                          ) : (
                            // Default Yes/No for boolean
                            <>
                              <label className={`
                                group relative flex items-start p-4 rounded-xl cursor-pointer transition-all duration-200
                                ${currentValue === true 
                                  ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
                                  : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                }
                              `}>
                                <div className="flex items-center h-5">
                    <input
                      type="radio"
                                    name={charType}
                                    checked={currentValue === true}
                                    onChange={() => setBusinessCharacteristics(prev => ({ ...prev, [charType]: true }))}
                                    className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  />
                    </div>
                                <div className="ml-4 flex-1">
                                  <div className={`font-semibold ${currentValue === true ? 'text-blue-900' : 'text-gray-900'}`}>
                                    Yes
                    </div>
                    </div>
                                {currentValue === true && (
                                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                  </label>
                              <label className={`
                                group relative flex items-start p-4 rounded-xl cursor-pointer transition-all duration-200
                                ${currentValue === false 
                                  ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
                                  : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                }
                              `}>
                                <div className="flex items-center h-5">
                    <input
                      type="radio"
                                    name={charType}
                                    checked={currentValue === false}
                                    onChange={() => setBusinessCharacteristics(prev => ({ ...prev, [charType]: false }))}
                                    className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  />
                    </div>
                                <div className="ml-4 flex-1">
                                  <div className={`font-semibold ${currentValue === false ? 'text-blue-900' : 'text-gray-900'}`}>
                                    No
                </div>
              </div>
                                {currentValue === false && (
                                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                </label>
                            </>
                          )}
                    </div>
                      ) : multiplier.conditionType === 'threshold' || multiplier.conditionType === 'range' ? (
                        // Threshold/Range questions - show as cards with radio selection (like boolean)
                        <div className="ml-11 space-y-2">
                          {answerOptions && answerOptions.length > 0 ? (
                            answerOptions.map((option: any) => {
                              const label = typeof option.label === 'object' 
                                ? (option.label[locale] || option.label['en']) 
                                : option.label
                              const isSelected = currentValue === option.value
                              
                              return (
                                <label 
                                  key={String(option.value)} 
                                  className={`
                                    group relative flex items-start p-4 rounded-xl cursor-pointer transition-all duration-200
                                    ${isSelected 
                                      ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
                                      : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                    }
                                  `}
                                >
                                  <div className="flex items-center h-5">
                    <input
                                      type="radio"
                                      name={charType}
                                      checked={isSelected}
                                      onChange={() => setBusinessCharacteristics(prev => ({ 
                                        ...prev, 
                                        [charType]: option.value 
                                      }))}
                                      className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                    </div>
                                  <div className="ml-4 flex-1">
                                    <div className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                      {label}
                    </div>
                                    {option.description && (
                                      <div className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                                        {option.description}
                </div>
                                    )}
              </div>
                                  {isSelected && (
                                    <div className="ml-2">
                                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                    </div>
                                  )}
                  </label>
                              )
                            })
                          ) : null}
                    </div>
                      ) : null}
                </div>
                  )
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 mt-8 pt-6 border-t">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentStep('location')}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={submitting}
                >
                  ← {t('backButton')}
                </button>
                <button
                  onClick={handleCharacteristicsSubmit}
                  disabled={submitting}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{t('preparingPlan')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('generateSmartPlan')}</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
              <button
                onClick={onSkip}
                disabled={submitting}
                className="w-full px-6 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                {t('skipManual')}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (currentStep === 'industry') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 pt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('businessTypeTitle')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('businessTypeDescription')}
            </p>
          </div>

          {/* Industry Categories */}
          <div className="space-y-6 mb-8">
            {businessTypesByCategory.map((category) => (
              <div key={category.category} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  {category.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.businessTypes.map((businessType) => (
                    <button
                      key={businessType.businessTypeId}
                      onClick={() => handleIndustrySelect(businessType.businessTypeId)}
                      className={`p-4 rounded-lg border-2 text-left transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        selectedIndustry === businessType.businessTypeId
                          ? 'border-blue-500 bg-blue-100'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="font-medium text-gray-900 mb-1">
                        {businessType.name}
                      </div>
                      {businessType.description && (
                        <div className="text-sm text-gray-600 mb-2 line-clamp-1">
                          {businessType.description}
                        </div>
                      )}
                      {/* Risk Preview */}
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-blue-600">Admin-configured</span>
                        </div>
                        {selectedIndustry === businessType.businessTypeId && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-green-600">Selected</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Skip Option */}
          <div className="text-center">
            <button
              onClick={onSkip}
              className="text-gray-600 hover:text-gray-800 underline"
            >
              {t('skipSetup')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <button
            onClick={() => setCurrentStep('industry')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center mx-auto"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('backToBusiness')}
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('locationTitle')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('locationDescription')}
          </p>
        </div>

        {/* Location Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-6">
            {/* Country Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('countryLabel')} *
              </label>
              <select
                value={selectedCountryId}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">{t('countryPlaceholder')}</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Admin Unit Selection */}
            {selectedCountryId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('parishLabel')}
                </label>
                {loadingAdminUnits ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    {t('loadingAdminUnits')}
                  </div>
                ) : parishes.length > 0 ? (
                  <select
                    value={location.parish}
                    onChange={(e) => {
                      const selectedParish = parishes.find(p => p.name === e.target.value)
                      setLocation(prev => ({ 
                        ...prev, 
                        parish: e.target.value,
                        // Store admin unit ID for API calls
                        adminUnitId: selectedParish?.code || ''
                      }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('parishPlaceholder')}</option>
                    {parishes.map((parish) => (
                      <option key={parish.code} value={parish.name}>
                        {parish.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    {t('noAdminUnits')}
                  </div>
                )}
              </div>
            )}

            {/* Removed: Custom Region field (not used) */}
            {/* Removed: Coastal/Urban checkboxes (moved to characteristics step) */}
          </div>

          {/* Action Buttons - Continue to next step */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => setCurrentStep('industry')}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← {t('backButton')}
            </button>
            <button
              onClick={handleLocationSubmit}
              disabled={!location.country}
              className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                location.country
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>{t('continueButton')}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Selected Industry Summary */}
        {selectedIndustry && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">{t('selectedBusiness')}</h3>
            <p className="text-blue-800">
              {businessTypesByCategory
                .flatMap(cat => cat.businessTypes)
                .find(bt => bt.businessTypeId === selectedIndustry)?.name || selectedIndustry}
            </p>
          </div>
        )}

        {/* Risk Preview */}
        {preFillPreview && (
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-l-orange-400">
            <div className="flex items-center space-x-2 mb-3">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="font-medium text-gray-900">Common Risks for This Business Type</h3>
            </div>
            
            {preFillPreview.risks?.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600 mb-2">
                  Based on admin data, here are the priority risks for your business:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {preFillPreview.risks.slice(0, 6).map((risk: any, index: number) => (
                    <div key={index} className={`flex items-center space-x-2 p-2 rounded text-xs ${
                      risk.finalRiskLevel === 'very_high' ? 'bg-red-100 text-red-800' :
                      risk.finalRiskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                      risk.finalRiskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        risk.finalRiskLevel === 'very_high' ? 'bg-red-500' :
                        risk.finalRiskLevel === 'high' ? 'bg-orange-500' :
                        risk.finalRiskLevel === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      <span className="font-medium">{risk.hazardName}</span>
                      <span className="text-xs opacity-75">({risk.finalRiskLevel})</span>
                    </div>
                  ))}
                </div>
                {preFillPreview.risks.length > 6 && (
                  <div className="text-xs text-gray-500 mt-2">
                    +{preFillPreview.risks.length - 6} more risks identified
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Location Warnings */}
        {(location.nearCoast || location.urbanArea) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h4 className="font-medium text-yellow-900">Location-Specific Considerations</h4>
            </div>
            <div className="space-y-1 text-sm text-yellow-800">
              {location.nearCoast && (
                <div className="flex items-center space-x-2">
                  <span>🌊</span>
                  <span>Coastal location: Increased risk for hurricanes, flooding, and storm surge</span>
                </div>
              )}
              {location.urbanArea && (
                <div className="flex items-center space-x-2">
                  <span>🏙️</span>
                  <span>Urban area: Consider traffic disruption, crime, and supply chain issues</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Quality Preview */}
        {preFillPreview?.metadata && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-green-900">What Will Be Pre-Filled</h4>
            </div>
            <div className="text-sm text-green-800 space-y-1">
              <div>✓ Business overview and essential functions</div>
              <div>✓ Risk assessments with {preFillPreview.risks?.length || 0} identified hazards</div>
              <div>✓ Location-specific risk modifiers</div>
              <div>✓ Industry-standard planning strategies</div>
              {preFillPreview.metadata.locationFound && (
                <div>✓ Parish-specific risk data available</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
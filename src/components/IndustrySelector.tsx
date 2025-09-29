'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { LocationData } from '../data/types'
import { adminDataService, AdminBusinessType, AdminLocation } from '../services/adminDataService'

interface IndustrySelectorProps {
  onSelection: (industryId: string, location: LocationData) => void
  onSkip: () => void
}

export default function IndustrySelector({ onSelection, onSkip }: IndustrySelectorProps) {
  const t = useTranslations('industrySelector')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('')
  const [location, setLocation] = useState<LocationData>({
    country: '',
    countryCode: '',
    parish: '',
    region: '',
    nearCoast: false,
    urbanArea: false
  })
  const [currentStep, setCurrentStep] = useState<'industry' | 'location'>('industry')
  const [businessTypesByCategory, setBusinessTypesByCategory] = useState<Array<{
    category: string
    title: string
    businessTypes: AdminBusinessType[]
  }>>([])
  const [locationsByCountry, setLocationsByCountry] = useState<Array<{
    country: string
    countryCode: string
    locations: AdminLocation[]
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [preFillPreview, setPreFillPreview] = useState<any>(null)

  // Load admin data
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true)
        const [businessTypes, locations] = await Promise.all([
          adminDataService.getBusinessTypesByCategory(),
          adminDataService.getLocationsByCountry()
        ])
        setBusinessTypesByCategory(businessTypes)
        setLocationsByCountry(locations)
      } catch (err) {
        setError('Failed to load business types and locations')
        console.error('Error loading admin data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [])

  const parishes = location.countryCode 
    ? locationsByCountry
        .find(c => c.countryCode === location.countryCode)
        ?.locations.map(loc => ({ name: loc.parish || '', code: loc.id })) || []
    : []

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

  const handleLocationSubmit = async () => {
    if (!selectedIndustry || !location.country) return
    
    try {
      setSubmitting(true)
      setError(null)
      
      // Call the prepare-prefill-data API
      const response = await fetch('/api/wizard/prepare-prefill-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessTypeId: selectedIndustry,
          location: location
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

  const handleCountryChange = (countryCode: string) => {
    const country = locationsByCountry.find(c => c.countryCode === countryCode)
    if (country) {
      setLocation(prev => ({
        ...prev,
        country: country.country,
        countryCode: country.countryCode,
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
                      <div className="text-sm text-gray-600 mb-2">
                        {businessType.localName}
                      </div>
                      {businessType.description && (
                        <div className="text-xs text-gray-500 mb-2 line-clamp-2">
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
                value={location.countryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">{t('countryPlaceholder')}</option>
                {locationsByCountry.map((country) => (
                  <option key={country.countryCode} value={country.countryCode}>
                    {country.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Parish/Region Selection */}
            {parishes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('parishLabel')}
                </label>
                <select
                  value={location.parish}
                  onChange={(e) => setLocation(prev => ({ ...prev, parish: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('parishPlaceholder')}</option>
                  {parishes.map((parish) => (
                    <option key={parish.code} value={parish.code}>
                      {parish.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('regionLabel')}
              </label>
              <input
                type="text"
                value={location.region}
                onChange={(e) => setLocation(prev => ({ ...prev, region: e.target.value }))}
                placeholder={t('regionPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Location Characteristics */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">{t('locationCharacteristics')}</h3>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="nearCoast"
                  checked={location.nearCoast}
                  onChange={(e) => setLocation(prev => ({ ...prev, nearCoast: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <label htmlFor="nearCoast" className="text-sm font-medium text-gray-700">
                    {t('nearCoast')}
                  </label>
                  <p className="text-xs text-gray-500">
                    {t('nearCoastDescription')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="urbanArea"
                  checked={location.urbanArea}
                  onChange={(e) => setLocation(prev => ({ ...prev, urbanArea: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <label htmlFor="urbanArea" className="text-sm font-medium text-gray-700">
                    {t('urbanArea')}
                  </label>
                  <p className="text-xs text-gray-500">
                    {t('urbanAreaDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={handleLocationSubmit}
              disabled={!canProceed || submitting}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition-colors ${
                canProceed && !submitting
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Preparing your plan...</span>
                </div>
              ) : (
                t('generatePlan')
              )}
            </button>
            <button
              onClick={onSkip}
              disabled={submitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {t('skipSetupAction')}
            </button>
          </div>

          {/* Submission Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}
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
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
  const [businessCharacteristics, setBusinessCharacteristics] = useState({
    // Simple yes/no questions instead of sliders
    customerBase: 'mix' as 'mainly_tourists' | 'mix' | 'mainly_locals',
    powerDependency: 'partially' as 'can_operate' | 'partially' | 'cannot_operate',
    digitalDependency: 'helpful' as 'essential' | 'helpful' | 'not_used',
    importsFromOverseas: false,
    sellsPerishable: false,
    minimalInventory: false,
    expensiveEquipment: false
  })
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
              Tell Us About Your Business
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Quick questions to help us calculate your specific risks (takes 30 seconds)
            </p>
            {selectedBusiness && (
              <p className="text-sm text-gray-500">
                {selectedBusiness.name} • {location.parish ? `${location.parish}, ` : ''}{location.country}
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="space-y-6">
              {/* Location Characteristics - User Input */}
              <div className="pb-6 border-b border-gray-200 bg-gray-50 p-4 rounded-lg">
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  About Your Business Location
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  These details help us calculate risks specific to your location
                </p>
                <div className="space-y-3">
                  <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors bg-white">
                    <input
                      type="checkbox"
                      checked={location.nearCoast}
                      onChange={(e) => setLocation(prev => ({ ...prev, nearCoast: e.target.checked }))}
                      className="mt-1 h-4 w-4 text-blue-600 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">My business is near the coast</div>
                      <div className="text-sm text-gray-600">Within 5km of the ocean or sea</div>
                    </div>
                  </label>
                  <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors bg-white">
                    <input
                      type="checkbox"
                      checked={location.urbanArea}
                      onChange={(e) => setLocation(prev => ({ ...prev, urbanArea: e.target.checked }))}
                      className="mt-1 h-4 w-4 text-blue-600 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">My business is in an urban/city area</div>
                      <div className="text-sm text-gray-600">In a city, town center, or densely populated area</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Question 1: Customer Base */}
              <div className="pb-6 border-b border-gray-200">
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  1. Where do most of your customers come from?
                </label>
                <div className="space-y-3">
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" style={{ borderColor: businessCharacteristics.customerBase === 'mainly_tourists' ? '#2563eb' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="customerBase"
                      value="mainly_tourists"
                      checked={businessCharacteristics.customerBase === 'mainly_tourists'}
                      onChange={(e) => setBusinessCharacteristics(prev => ({ ...prev, customerBase: e.target.value as any }))}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">Mainly tourists and visitors</div>
                      <div className="text-sm text-gray-600">Hotels, tours, souvenir shops, vacation rentals</div>
                    </div>
                  </label>
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" style={{ borderColor: businessCharacteristics.customerBase === 'mix' ? '#2563eb' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="customerBase"
                      value="mix"
                      checked={businessCharacteristics.customerBase === 'mix'}
                      onChange={(e) => setBusinessCharacteristics(prev => ({ ...prev, customerBase: e.target.value as any }))}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">Mix of tourists and locals</div>
                      <div className="text-sm text-gray-600">Restaurants, shops, services in tourist areas</div>
                    </div>
                  </label>
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" style={{ borderColor: businessCharacteristics.customerBase === 'mainly_locals' ? '#2563eb' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="customerBase"
                      value="mainly_locals"
                      checked={businessCharacteristics.customerBase === 'mainly_locals'}
                      onChange={(e) => setBusinessCharacteristics(prev => ({ ...prev, customerBase: e.target.value as any }))}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">Mainly local customers</div>
                      <div className="text-sm text-gray-600">Neighborhood stores, pharmacies, local services</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Question 2: Power Dependency */}
              <div className="pb-6 border-b border-gray-200">
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  2. If electricity goes out, can you still serve customers?
                </label>
                <div className="space-y-3">
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" style={{ borderColor: businessCharacteristics.powerDependency === 'can_operate' ? '#2563eb' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="powerDependency"
                      value="can_operate"
                      checked={businessCharacteristics.powerDependency === 'can_operate'}
                      onChange={(e) => setBusinessCharacteristics(prev => ({ ...prev, powerDependency: e.target.value as any }))}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">Yes, we can operate normally</div>
                      <div className="text-sm text-gray-600">Manual systems, no refrigeration needed</div>
                    </div>
                  </label>
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" style={{ borderColor: businessCharacteristics.powerDependency === 'partially' ? '#2563eb' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="powerDependency"
                      value="partially"
                      checked={businessCharacteristics.powerDependency === 'partially'}
                      onChange={(e) => setBusinessCharacteristics(prev => ({ ...prev, powerDependency: e.target.value as any }))}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">Partially (some services affected)</div>
                      <div className="text-sm text-gray-600">Can serve but limited - lights, AC, some equipment</div>
                    </div>
                  </label>
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" style={{ borderColor: businessCharacteristics.powerDependency === 'cannot_operate' ? '#2563eb' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="powerDependency"
                      value="cannot_operate"
                      checked={businessCharacteristics.powerDependency === 'cannot_operate'}
                      onChange={(e) => setBusinessCharacteristics(prev => ({ ...prev, powerDependency: e.target.value as any }))}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">No, we must close</div>
                      <div className="text-sm text-gray-600">Refrigeration, cash registers, cooking equipment, etc.</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Question 3: Digital/Internet Dependency */}
              <div className="pb-6 border-b border-gray-200">
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  3. Does your business need internet or computer systems to operate?
                </label>
                <div className="space-y-3">
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" style={{ borderColor: businessCharacteristics.digitalDependency === 'essential' ? '#2563eb' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="digitalDependency"
                      value="essential"
                      checked={businessCharacteristics.digitalDependency === 'essential'}
                      onChange={(e) => setBusinessCharacteristics(prev => ({ ...prev, digitalDependency: e.target.value as any }))}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">Yes, essential - cannot operate without them</div>
                      <div className="text-sm text-gray-600">Online bookings, credit cards, cloud systems, POS</div>
                    </div>
                  </label>
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" style={{ borderColor: businessCharacteristics.digitalDependency === 'helpful' ? '#2563eb' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="digitalDependency"
                      value="helpful"
                      checked={businessCharacteristics.digitalDependency === 'helpful'}
                      onChange={(e) => setBusinessCharacteristics(prev => ({ ...prev, digitalDependency: e.target.value as any }))}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">Helpful but not essential</div>
                      <div className="text-sm text-gray-600">We use them but can work with manual backup</div>
                    </div>
                  </label>
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" style={{ borderColor: businessCharacteristics.digitalDependency === 'not_used' ? '#2563eb' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="digitalDependency"
                      value="not_used"
                      checked={businessCharacteristics.digitalDependency === 'not_used'}
                      onChange={(e) => setBusinessCharacteristics(prev => ({ ...prev, digitalDependency: e.target.value as any }))}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">No, we don't use them</div>
                      <div className="text-sm text-gray-600">All paper-based, cash only</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Question 4: Supply Chain */}
              <div className="pb-6 border-b border-gray-200">
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  4. Check any that apply to your business:
                </label>
                <div className="space-y-3">
                  <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={businessCharacteristics.importsFromOverseas}
                      onChange={(e) => setBusinessCharacteristics(prev => ({ ...prev, importsFromOverseas: e.target.checked }))}
                      className="mt-1 h-4 w-4 text-blue-600 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">We import supplies from overseas</div>
                      <div className="text-sm text-gray-600">International shipping, customs delays</div>
                    </div>
                  </label>
                  <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={businessCharacteristics.sellsPerishable}
                      onChange={(e) => setBusinessCharacteristics(prev => ({ ...prev, sellsPerishable: e.target.checked }))}
                      className="mt-1 h-4 w-4 text-blue-600 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">We sell fresh or perishable products</div>
                      <div className="text-sm text-gray-600">Food, flowers, medicines that expire</div>
                    </div>
                  </label>
                  <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={businessCharacteristics.minimalInventory}
                      onChange={(e) => setBusinessCharacteristics(prev => ({ ...prev, minimalInventory: e.target.checked }))}
                      className="mt-1 h-4 w-4 text-blue-600 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">We keep minimal stock (order as needed)</div>
                      <div className="text-sm text-gray-600">Just-in-time delivery, small inventory</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Question 5: Physical Assets */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  5. Do you have expensive equipment or machinery to replace if damaged?
                </label>
                <div className="space-y-3">
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" style={{ borderColor: businessCharacteristics.expensiveEquipment ? '#2563eb' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="expensiveEquipment"
                      value="yes"
                      checked={businessCharacteristics.expensiveEquipment}
                      onChange={() => setBusinessCharacteristics(prev => ({ ...prev, expensiveEquipment: true }))}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">Yes, significant machinery or equipment</div>
                      <div className="text-sm text-gray-600">Vehicles, heavy equipment, specialized machinery (over $10,000 to replace)</div>
                    </div>
                  </label>
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" style={{ borderColor: !businessCharacteristics.expensiveEquipment ? '#2563eb' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="expensiveEquipment"
                      value="no"
                      checked={!businessCharacteristics.expensiveEquipment}
                      onChange={() => setBusinessCharacteristics(prev => ({ ...prev, expensiveEquipment: false }))}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">No, mainly services or basic tools</div>
                      <div className="text-sm text-gray-600">Furniture, computers, basic equipment</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-8 pt-6 border-t">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentStep('location')}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={submitting}
                >
                  ← Back
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
                      <span>Preparing your plan...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Smart Plan</span>
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
                Skip and create plan manually
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
                    Loading administrative units...
                  </div>
                ) : parishes.length > 0 ? (
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
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    No administrative units found for this country
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
              ← Back
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
              <span>Continue</span>
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
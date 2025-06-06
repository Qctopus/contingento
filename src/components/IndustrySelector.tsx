'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { LocationData } from '../data/types'
import { industryProfiles } from '../data/industryProfiles'
import { getAvailableCountries, getCountryParishes } from '../data/hazardMappings'

interface IndustrySelectorProps {
  onSelection: (industryId: string, location: LocationData) => void
  onSkip: () => void
}

export default function IndustrySelector({ onSelection, onSkip }: IndustrySelectorProps) {
  const t = useTranslations('industrySelector')
  const tProfiles = useTranslations('industryProfiles')
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

  const countries = getAvailableCountries()
  const parishes = location.countryCode ? getCountryParishes(location.countryCode) : []

  const handleIndustrySelect = (industryId: string) => {
    setSelectedIndustry(industryId)
    setCurrentStep('location')
  }

  const handleLocationSubmit = () => {
    if (selectedIndustry && location.country) {
      onSelection(selectedIndustry, location)
    }
  }

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode)
    if (country) {
      setLocation(prev => ({
        ...prev,
        country: country.name,
        countryCode: country.code,
        parish: '', // Reset parish when country changes
        region: ''
      }))
    }
  }

  const canProceed = selectedIndustry && location.country

  const industryCategories = [
    {
      category: 'retail',
      title: t('retailCommerce'),
      industries: industryProfiles.filter(p => p.category === 'retail')
    },
    {
      category: 'hospitality',
      title: t('foodHospitality'),
      industries: industryProfiles.filter(p => p.category === 'hospitality')
    },
    {
      category: 'services',
      title: t('personalServices'),
      industries: industryProfiles.filter(p => p.category === 'services')
    },
    {
      category: 'tourism',
      title: t('tourismRecreation'),
      industries: industryProfiles.filter(p => p.category === 'tourism')
    },
    {
      category: 'agriculture',
      title: t('agricultureFishing'),
      industries: industryProfiles.filter(p => p.category === 'agriculture')
    },
    {
      category: 'manufacturing',
      title: t('manufacturingProduction'),
      industries: industryProfiles.filter(p => p.category === 'manufacturing')
    }
  ].filter(cat => cat.industries.length > 0)

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
            {industryCategories.map((category) => (
              <div key={category.category} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  {category.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.industries.map((industry) => (
                    <button
                      key={industry.id}
                      onClick={() => handleIndustrySelect(industry.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        selectedIndustry === industry.id
                          ? 'border-blue-500 bg-blue-100'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="font-medium text-gray-900 mb-1">
                        {tProfiles(`${industry.id}.name`)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {tProfiles(`${industry.id}.localName`)}
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
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
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
                    <option key={parish} value={parish}>
                      {parish}
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
              disabled={!canProceed}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition-colors ${
                canProceed
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t('generatePlan')}
            </button>
            <button
              onClick={onSkip}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t('skipSetupAction')}
            </button>
          </div>
        </div>

        {/* Selected Industry Summary */}
        {selectedIndustry && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">{t('selectedBusiness')}</h3>
            <p className="text-blue-800">
              {tProfiles(`${selectedIndustry}.name`)} ({tProfiles(`${selectedIndustry}.localName`)})
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 
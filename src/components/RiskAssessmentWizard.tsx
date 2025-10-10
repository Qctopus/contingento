'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { SimplifiedRiskAssessment } from './SimplifiedRiskAssessment'

interface RiskItem {
  hazard: string
  hazardId?: string
  likelihood: string
  severity: string
  riskLevel: string
  riskScore: number
  planningMeasures: string
  isSelected?: boolean
}

interface RiskAssessmentWizardProps {
  selectedHazards: string[]
  onComplete: (riskMatrix: RiskItem[]) => void
  initialValue?: RiskItem[]
  setUserInteracted?: () => void
  locationData?: {
    country?: string
    countryCode?: string
    parish?: string
    nearCoast?: boolean
    urbanArea?: boolean
  }
  businessData?: {
    industryType?: string
    businessPurpose?: string
    productsServices?: string
  }
  preFillData?: any
}

export function RiskAssessmentWizard({ 
  selectedHazards, 
  onComplete, 
  initialValue, 
  setUserInteracted,
  locationData,
  businessData,
  preFillData
}: RiskAssessmentWizardProps) {
  const [riskItems, setRiskItems] = useState<RiskItem[]>([])
  const t = useTranslations('common')
  const tSteps = useTranslations('steps.riskAssessment')

  // Handle risk assessment updates
  const handleRiskUpdate = useCallback((updatedRisks: RiskItem[]) => {
    setRiskItems(updatedRisks)
    onComplete(updatedRisks)
    if (setUserInteracted) {
      setUserInteracted()
    }
  }, [onComplete, setUserInteracted])

  return (
    <div className="space-y-6">
      <SimplifiedRiskAssessment
        selectedHazards={selectedHazards}
        onComplete={handleRiskUpdate}
        initialValue={initialValue}
        setUserInteracted={setUserInteracted}
        locationData={locationData}
        businessData={businessData}
        preFillData={preFillData}
      />
    </div>
  )
}
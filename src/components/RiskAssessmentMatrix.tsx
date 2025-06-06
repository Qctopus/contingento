'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'

interface RiskItem {
  hazard: string
  likelihood: string
  severity: string
  riskLevel: string
  riskScore: number
  planningMeasures: string
}

interface RiskAssessmentProps {
  selectedHazards: string[]
  onComplete: (riskMatrix: RiskItem[]) => void
  initialValue?: RiskItem[]
  setUserInteracted?: () => void
}

interface RiskLevelDistribution {
  Extreme: number;
  High: number;
  Medium: number;
  Low: number;
}

export function RiskAssessmentMatrix({ selectedHazards, onComplete, initialValue, setUserInteracted }: RiskAssessmentProps) {
  const [riskItems, setRiskItems] = useState<RiskItem[]>([])
  const [activeRisk, setActiveRisk] = useState<number | null>(null)
  const t = useTranslations('common')
  const tSteps = useTranslations('steps.riskAssessment')

  // Define a mapping of common hazard IDs for reverse lookup
  const hazardMappings: Record<string, string> = {
    'earthquake': 'earthquake',
    'hurricane': 'hurricane', 
    'coastal_flood': 'coastal_flood',
    'flash_flood': 'flash_flood',
    'landslide': 'landslide',
    'tsunami': 'tsunami',
    'volcanic': 'volcanic',
    'drought': 'drought',
    'epidemic': 'epidemic',
    'pandemic': 'pandemic',
    'power_outage': 'power_outage',
    'telecom_failure': 'telecom_failure',
    'cyber_attack': 'cyber_attack',
    'fire': 'fire',
    'crime': 'crime',
    'civil_disorder': 'civil_disorder',
    'terrorism': 'terrorism',
    'supply_disruption': 'supply_disruption',
    'staff_unavailable': 'staff_unavailable',
    'economic_downturn': 'economic_downturn',
    'urban_flooding': 'urban_flooding',
    'traffic_disruption': 'traffic_disruption',
    'storm_surge': 'storm_surge',
    'coastal_erosion': 'coastal_erosion',
    'infrastructure_failure': 'infrastructure_failure',
    'crowd_management': 'crowd_management',
    'river_flooding': 'river_flooding',
    'urban_congestion': 'urban_congestion',
    'water_shortage': 'water_shortage',
    'industrial_accident': 'industrial_accident',
    'air_pollution': 'air_pollution',
    'tourism_disruption': 'tourism_disruption',
    'oil_spill': 'oil_spill',
    'sargassum': 'sargassum',
    'waste_management': 'waste_management'
  }

  // Get localized likelihood options
  const getLikelihoodOptions = () => [
    { value: '1', label: t('veryUnlikely'), description: t('veryUnlikelyDesc'), color: 'bg-green-100 text-green-800' },
    { value: '2', label: t('unlikely'), description: t('unlikelyDesc'), color: 'bg-yellow-100 text-yellow-800' },
    { value: '3', label: t('likely'), description: t('likelyDesc'), color: 'bg-orange-100 text-orange-800' },
    { value: '4', label: t('veryLikely'), description: t('veryLikelyDesc'), color: 'bg-red-100 text-red-800' },
  ]

  // Get localized severity options
  const getSeverityOptions = () => [
    { value: '1', label: t('insignificant'), description: t('insignificantDesc'), color: 'bg-green-100 text-green-800' },
    { value: '2', label: t('minor'), description: t('minorDesc'), color: 'bg-yellow-100 text-yellow-800' },
    { value: '3', label: t('serious'), description: t('seriousDesc'), color: 'bg-orange-100 text-orange-800' },
    { value: '4', label: t('major'), description: t('majorDesc'), color: 'bg-red-100 text-red-800' },
  ]

  // Get localized hazard label
  const getHazardLabel = (hazardKey: string): string => {
    try {
      const translatedLabel = tSteps(`hazardLabels.${hazardKey}`)
      
      // Check if we got a valid translation (not just the key back)
      if (translatedLabel && translatedLabel !== `hazardLabels.${hazardKey}` && translatedLabel !== `steps.riskAssessment.hazardLabels.${hazardKey}`) {
        return translatedLabel
      }
      
      // If translation failed, fall back to formatted key
      return hazardKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    } catch (error) {
      // Fallback to formatted key if translation doesn't exist
      return hazardKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  // Initialize risk items when selectedHazards or initialValue changes
  useEffect(() => {
    if (selectedHazards.length === 0) {
      setRiskItems([])
      onComplete([])
      return
    }

    // Create a map of existing risk items by both hazard ID and translated label
    const existingRisksMap = new Map<string, RiskItem>()
    if (initialValue && Array.isArray(initialValue)) {
      initialValue.forEach(item => {
        // Map by both the current hazard name and potential hazard ID
        existingRisksMap.set(item.hazard, item)
        
        // Also try to map by the hazard ID if the current hazard is already a translated label
        const possibleHazardId = Object.keys(hazardMappings).find(key => {
          const translatedLabel = tSteps(`hazardLabels.${key}`)
          return translatedLabel === item.hazard
        })
        if (possibleHazardId) {
          existingRisksMap.set(possibleHazardId, item)
        }
      })
    }

    // Create risk items for all selected hazards
    const newRiskItems = selectedHazards.map(hazardKey => {
      const hazardLabel = getHazardLabel(hazardKey)
      
      // Use existing data if available (check both by key and by label)
      const existingItem = existingRisksMap.get(hazardKey) || existingRisksMap.get(hazardLabel)
      
      if (existingItem) {
        // Update the hazard field to use the translated label and recalculate risk level
        const updatedItem = {
          ...existingItem,
          hazard: hazardLabel
        }
        
        // Recalculate risk level if likelihood and severity are present
        if (updatedItem.likelihood && updatedItem.severity) {
          const { level, score } = calculateRiskLevel(updatedItem.likelihood, updatedItem.severity)
          updatedItem.riskLevel = level
          updatedItem.riskScore = score
          
          console.log(`Pre-populated risk calculated for ${hazardLabel}:`, {
            likelihood: updatedItem.likelihood,
            severity: updatedItem.severity,
            calculatedLevel: level,
            calculatedScore: score
          })
        }
        
        return updatedItem
      }
      
      return {
        hazard: hazardLabel,
        likelihood: '',
        severity: '',
        riskLevel: '',
        riskScore: 0,
        planningMeasures: '',
      }
    })

    setRiskItems(newRiskItems)
  }, [selectedHazards, initialValue, tSteps, t])

  // Recalculate risk levels when translation function changes (language switching)
  useEffect(() => {
    setRiskItems(prevItems => 
      prevItems.map(item => {
        if (item.likelihood && item.severity) {
          const { level, score } = calculateRiskLevel(item.likelihood, item.severity)
          return {
            ...item,
            riskLevel: level,
            riskScore: score
          }
        }
        return item
      })
    )
  }, [t])

  // Notify parent of changes using useCallback to prevent unnecessary re-renders
  const notifyParent = useCallback((items: RiskItem[]) => {
    onComplete(items)
  }, [onComplete])

  // Call parent when risk items change - debounced to prevent excessive calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      notifyParent(riskItems)
    }, 100) // Small delay to batch updates
    
    return () => clearTimeout(timeoutId)
  }, [riskItems, notifyParent])

  const calculateRiskLevel = (likelihood: string, severity: string): { level: string; score: number; color: string } => {
    const l = parseInt(likelihood) || 0
    const s = parseInt(severity) || 0
    const score = l * s
    
    if (score >= 12) return { level: t('extremeRisk'), score, color: 'bg-red-600 text-white' }
    if (score >= 8) return { level: t('highRisk'), score, color: 'bg-red-500 text-white' }
    if (score >= 3) return { level: t('mediumRisk'), score, color: 'bg-yellow-500 text-white' }
    if (score >= 1) return { level: t('lowRisk'), score, color: 'bg-green-500 text-white' }
    return { level: '', score: 0, color: 'bg-gray-200 text-gray-600' }
  }

  const updateRiskItem = useCallback((index: number, field: keyof RiskItem, value: string) => {
    if (setUserInteracted) {
      setUserInteracted()
    }
    
    setRiskItems(prevItems => {
      const updatedItems = [...prevItems]
      const currentItem = { ...updatedItems[index] }
      
      // Handle string fields
      if (field === 'hazard' || field === 'likelihood' || field === 'severity' || field === 'riskLevel' || field === 'planningMeasures') {
        currentItem[field] = value
      }
      
      // Recalculate risk level if likelihood or severity changed
      if (field === 'likelihood' || field === 'severity') {
        const newLikelihood = field === 'likelihood' ? value : currentItem.likelihood
        const newSeverity = field === 'severity' ? value : currentItem.severity
        
        if (newLikelihood && newSeverity) {
          const { level, score } = calculateRiskLevel(newLikelihood, newSeverity)
          currentItem.riskLevel = level
          currentItem.riskScore = score
          
          // Debug log to help identify issues
          console.log(`Risk updated for ${currentItem.hazard}:`, {
            likelihood: newLikelihood,
            severity: newSeverity,
            calculatedLevel: level,
            calculatedScore: score
          })
        } else {
          // Clear risk level if either likelihood or severity is missing
          currentItem.riskLevel = ''
          currentItem.riskScore = 0
        }
      }
      
      updatedItems[index] = currentItem
      return updatedItems
    })
  }, [setUserInteracted, t])

  const getRiskLevelColor = (riskLevel: string): string => {
    if (riskLevel === t('extremeRisk')) return 'bg-red-600 text-white'
    if (riskLevel === t('highRisk')) return 'bg-red-500 text-white'
    if (riskLevel === t('mediumRisk')) return 'bg-yellow-500 text-white'
    if (riskLevel === t('lowRisk')) return 'bg-green-500 text-white'
    if (riskLevel === t('incomplete') || riskLevel === 'Incomplete') return 'bg-gray-400 text-white'
    return 'bg-gray-200 text-gray-600'
  }

  const getCompletedRisks = () => {
    return riskItems.filter(item => item.likelihood && item.severity)
  }

  const getRiskDistribution = (): { [key: string]: number } => {
    const distribution: { [key: string]: number } = {}
    const riskLevels = [t('extremeRisk'), t('highRisk'), t('mediumRisk'), t('lowRisk')]
    
    // Initialize with translated risk levels
    riskLevels.forEach(level => {
      distribution[level] = 0
    })
    
    // Add category for incomplete assessments
    distribution[t('incomplete') || 'Incomplete'] = 0
    
    riskItems.forEach(item => {
      // Count items that have both likelihood and severity selected as assessed
      if (item.likelihood && item.severity) {
        // Use the calculated risk level directly since it's already translated
        const riskLevel = item.riskLevel
        if (riskLevel && riskLevel.trim() !== '') {
          // Find the matching distribution key
          const matchingKey = riskLevels.find(level => level === riskLevel)
          if (matchingKey) {
            distribution[matchingKey]++
          } else {
            // Fallback: if exact match fails, try to find by content
            const fallbackKey = riskLevels.find(level => 
              level.toLowerCase().includes(riskLevel.toLowerCase()) || 
              riskLevel.toLowerCase().includes(level.toLowerCase())
            )
            if (fallbackKey) {
              distribution[fallbackKey]++
            }
          }
        }
      } else {
        // Count incomplete assessments (missing likelihood or severity)
        distribution[t('incomplete') || 'Incomplete']++
      }
    })
    
    return distribution
  }

  // Helper function to get hazard key from translated label
  const getHazardKey = (hazardLabel: string): string => {
    const foundKey = Object.keys(hazardMappings).find(key => {
      const translatedLabel = tSteps(`hazardLabels.${key}`)
      return translatedLabel === hazardLabel || key === hazardLabel
    })
    return foundKey || hazardLabel.toLowerCase().replace(/\s+/g, '_')
  }

  // Get risk-specific strategy recommendations
  const getRiskStrategies = (hazardKey: string, riskLevel: string, riskScore: number): {
    prevention: string[];
    response: string[];
    recovery: string[];
  } => {
    const strategies = {
      prevention: [] as string[],
      response: [] as string[],
      recovery: [] as string[]
    };

    const actualHazardKey = getHazardKey(hazardKey)
    const isHighRisk = riskScore >= 8

    // Hurricane/Tropical Storm strategies
    if (actualHazardKey.includes('hurricane') || actualHazardKey.includes('storm')) {
      strategies.prevention = [
        "Install storm shutters or plywood covers for windows",
        "Secure outdoor equipment, signs, and furniture",
        "Maintain emergency supplies (food, water, batteries for 7+ days)",
        "Review and update insurance coverage annually",
        "Create detailed evacuation procedures for staff and customers"
      ]
      strategies.response = [
        "Monitor weather alerts and activate emergency team 48-72 hours before impact",
        "Implement orderly closure procedures and secure all equipment",
        "Establish communication with staff, customers, and suppliers",
        "Move to safe locations and avoid travel during the storm",
        "Document any damage with photos for insurance claims"
      ]
      strategies.recovery = [
        "Conduct safety assessment before reopening - check for structural damage",
        "File insurance claims immediately with documentation",
        "Communicate reopening timeline to customers and suppliers",
        "Prioritize critical repairs and equipment replacement",
        "Review and update emergency procedures based on lessons learned"
      ]
    }

    // Power Outage strategies
    else if (actualHazardKey.includes('power')) {
      strategies.prevention = [
        "Install backup generator sized for critical operations",
        "Use Uninterruptible Power Supply (UPS) for computers and POS systems",
        "Maintain emergency lighting and flashlights",
        "Keep battery-powered radio for updates",
        "Develop manual procedures for key processes"
      ]
      strategies.response = [
        "Switch to backup power immediately and test all systems",
        "Implement manual cash handling and record-keeping procedures",
        "Contact utility company to report outage and get estimated repair time",
        "Preserve refrigerated items by keeping doors closed",
        "Use battery-powered communication devices"
      ]
      strategies.recovery = [
        "Test all electrical equipment before full restart",
        "Check for data loss and restore from backups if needed",
        "Reconcile manual transactions with electronic systems",
        "Assess impact on perishable inventory",
        "Evaluate backup power performance and upgrade if necessary"
      ]
    }

    // Fire strategies
    else if (actualHazardKey.includes('fire')) {
      strategies.prevention = [
        "Install smoke detectors and fire alarms throughout premises",
        "Maintain fire extinguishers and train staff on proper use",
        "Keep emergency exits clear and properly marked",
        "Regular electrical system inspections and maintenance",
        "Store flammable materials safely and away from heat sources"
      ]
      strategies.response = [
        "Evacuate all people immediately - do not fight large fires",
        "Call fire department (911) immediately",
        "Use fire extinguisher only for small, contained fires",
        "Meet at predetermined assembly point for headcount",
        "Do not re-enter building until authorized by fire department"
      ]
      strategies.recovery = [
        "Wait for official clearance before entering damaged areas",
        "Document all damage thoroughly for insurance claims",
        "Secure premises against weather and unauthorized entry",
        "Contact restoration specialists for smoke and water damage",
        "Communicate with customers about service interruption and reopening plans"
      ]
    }

    // Crime/Theft strategies
    else if (actualHazardKey.includes('crime') || actualHazardKey.includes('theft')) {
      strategies.prevention = [
        "Install security cameras and adequate lighting",
        "Use secure cash handling procedures - limit cash on hand",
        "Install quality locks and consider security system with monitoring",
        "Train staff on robbery prevention and response procedures",
        "Maintain good visibility into premises from outside"
      ]
      strategies.response = [
        "Comply with demands if confronted - personal safety is priority",
        "Call police (911) as soon as it's safe to do so",
        "Preserve crime scene and avoid touching anything",
        "Provide detailed description of suspects and events to police",
        "Offer support to any staff or customers who witnessed the incident"
      ]
      strategies.recovery = [
        "File police report and provide all available evidence",
        "Contact insurance company to report the loss",
        "Consider counseling services for affected staff",
        "Review and improve security measures based on the incident",
        "Communicate with customers to restore confidence in business safety"
      ]
    }

    // Cyber Attack strategies
    else if (actualHazardKey.includes('cyber') || actualHazardKey.includes('internet')) {
      strategies.prevention = [
        "Use strong passwords and enable two-factor authentication",
        "Keep all software and systems updated with latest security patches",
        "Train staff to recognize phishing emails and suspicious links",
        "Regular data backups stored offline or in secure cloud storage",
        "Install reputable antivirus/anti-malware software"
      ]
      strategies.response = [
        "Disconnect affected systems from internet immediately",
        "Change all passwords, especially for admin and financial accounts",
        "Contact IT support or cybersecurity expert for assistance",
        "Document the attack and preserve evidence",
        "Notify customers if their data may have been compromised"
      ]
      strategies.recovery = [
        "Restore systems from clean backups after thorough security scan",
        "Monitor accounts and credit reports for suspicious activity",
        "Update security policies and staff training based on the incident",
        "Consider cyber insurance claims if coverage exists",
        "Communicate transparently with customers about steps taken to improve security"
      ]
    }

    // Flood strategies
    else if (actualHazardKey.includes('flood')) {
      strategies.prevention = [
        "Elevate critical equipment and inventory above potential flood levels",
        "Install sump pumps and backup power for drainage systems",
        "Maintain flood barriers (sandbags, flood gates) and know how to deploy them",
        "Review flood insurance coverage - standard business insurance may not cover floods",
        "Develop relationships with suppliers outside flood-prone areas"
      ]
      strategies.response = [
        "Monitor weather and flood warnings closely",
        "Evacuate to higher ground if flooding is imminent",
        "Shut off electricity and gas if water is approaching electrical systems",
        "Move inventory, equipment, and important documents to higher levels",
        "Avoid driving or walking through flood waters"
      ]
      strategies.recovery = [
        "Do not enter building until it's been declared safe",
        "Document all damage with photos before cleanup begins",
        "Contact specialized flood restoration services quickly to prevent mold",
        "File flood insurance claims promptly",
        "Consider relocating or elevating critical operations for future protection"
      ]
    }

    // Supply Chain Disruption strategies
    else if (actualHazardKey.includes('supply')) {
      strategies.prevention = [
        "Diversify suppliers across different geographic regions",
        "Maintain strategic inventory of critical items",
        "Develop relationships with backup suppliers",
        "Monitor supplier financial health and business continuity plans",
        "Consider local suppliers to reduce transportation dependencies"
      ]
      strategies.response = [
        "Contact all suppliers immediately to assess impact and timeline",
        "Activate backup suppliers and expedite orders if necessary",
        "Communicate transparently with customers about potential delays",
        "Prioritize critical products/services and adjust offerings temporarily",
        "Explore alternative products or temporary substitutions"
      ]
      strategies.recovery = [
        "Gradually restore normal supply relationships as disruption resolves",
        "Evaluate supplier performance during the crisis",
        "Adjust inventory levels based on lessons learned",
        "Strengthen relationships with suppliers who performed well",
        "Update supplier diversification strategy to improve resilience"
      ]
    }

    // Staff Unavailability strategies
    else if (actualHazardKey.includes('staff')) {
      strategies.prevention = [
        "Cross-train employees in multiple roles and responsibilities",
        "Maintain updated contact information for all staff and backup workers",
        "Develop relationships with temporary staffing agencies",
        "Document all critical procedures and processes clearly",
        "Consider remote work capabilities where feasible"
      ]
      strategies.response = [
        "Assess which staff are available and reassign responsibilities",
        "Contact temporary staffing agencies for immediate assistance",
        "Prioritize essential functions and reduce non-critical services temporarily",
        "Implement remote work arrangements if possible",
        "Communicate with customers about any service limitations"
      ]
      strategies.recovery = [
        "Gradually restore full service levels as staff return",
        "Conduct debriefing with staff about the experience",
        "Update cross-training programs based on gaps identified",
        "Recognize and support staff who took on additional responsibilities",
        "Review and improve flexible work policies"
      ]
    }

    // Economic Downturn strategies
    else if (actualHazardKey.includes('economic')) {
      strategies.prevention = [
        "Maintain emergency cash reserves (3-6 months operating expenses)",
        "Diversify customer base to reduce dependence on single market segment",
        "Monitor economic indicators and customer payment patterns",
        "Maintain flexible cost structure with variable expenses where possible",
        "Strengthen customer relationships and loyalty programs"
      ]
      strategies.response = [
        "Implement cost reduction measures while preserving core capabilities",
        "Focus on cash flow management and collect receivables promptly",
        "Communicate with customers to understand their changing needs",
        "Explore new markets, products, or services that meet current demand",
        "Negotiate with suppliers and landlords for temporary payment adjustments"
      ]
      strategies.recovery = [
        "Gradually restore full operations as economic conditions improve",
        "Invest in growth opportunities that emerged during the downturn",
        "Rebuild cash reserves to prepare for future economic cycles",
        "Evaluate which cost reductions should be maintained permanently",
        "Strengthen market position gained during competitor difficulties"
      ]
    }

    // Generic strategies for unspecified risks
    if (strategies.prevention.length === 0) {
      strategies.prevention = [
        "Conduct regular risk assessments and update emergency procedures",
        "Maintain comprehensive insurance coverage appropriate for your business",
        "Train staff on emergency procedures and communication protocols",
        "Keep emergency contact lists and important documents easily accessible",
        "Establish relationships with local emergency services and business continuity resources"
      ]
      strategies.response = [
        "Activate emergency response team and communication procedures",
        "Ensure safety of all staff and customers as top priority",
        "Document the incident and any damage for insurance and learning purposes",
        "Communicate with stakeholders about the situation and expected timeline",
        "Implement alternative procedures to maintain critical business functions"
      ]
      strategies.recovery = [
        "Assess damage and prioritize restoration of critical business functions",
        "File insurance claims and work with adjusters promptly",
        "Communicate recovery timeline and progress to customers and suppliers",
        "Review and update emergency procedures based on lessons learned",
        "Consider improvements to make business more resilient to similar events"
      ]
    }

    // Add high-risk specific recommendations
    if (isHighRisk) {
      strategies.prevention.unshift("⚠️ HIGH PRIORITY: This risk requires immediate attention and comprehensive preparation")
      strategies.response.unshift("🚨 CRITICAL: Activate emergency procedures immediately when this risk materializes")
      strategies.recovery.unshift("🔄 URGENT: Fast recovery is essential - have specialized services pre-identified")
    }

    return strategies
  }

  if (selectedHazards.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <svg className="h-12 w-12 text-blue-400 mx-auto mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-blue-900 mb-2">{t('noHazardsSelected')}</h3>
        <p className="text-blue-700">{t('selectHazardsPrompt')}</p>
      </div>
    )
  }

  const distribution = getRiskDistribution()
  const completedRisks = getCompletedRisks()
  const likelihoodOptions = getLikelihoodOptions()
  const severityOptions = getSeverityOptions()

  return (
    <div className="space-y-6">
      {/* Risk Assessment Overview */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{t('riskOverview')}</h3>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{t('assessmentProgress')}</span>
            <span className="text-sm font-medium">{completedRisks.length} {t('of')} {riskItems.length} {t('completed')}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${riskItems.length > 0 ? (completedRisks.length / riskItems.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(distribution).map(([level, count]) => {
            const isIncomplete = level === t('incomplete') || level === 'Incomplete'
            const isHighPriority = level === t('extremeRisk') || level === t('highRisk')
            return (
              <div key={level} className={`text-center ${isHighPriority && count > 0 ? 'ring-2 ring-red-300 ring-opacity-50 rounded-lg p-2' : ''}`}>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(level)}`}>
                  {count}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {isIncomplete ? (level + ' ' + t('assessments')) : (level + ' ' + t('riskText'))}
                </div>
                {isHighPriority && count > 0 && (
                  <div className="text-xs text-red-600 font-semibold mt-1">
                    {level === t('extremeRisk') ? '🚨 Urgent!' : '⚠️ Priority'}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* High Priority Alert */}
        {(distribution[t('extremeRisk')] > 0 || distribution[t('highRisk')] > 0) && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-red-600 text-lg">🚨</span>
              <h4 className="text-sm font-semibold text-red-900">Priority Risk Alert</h4>
            </div>
            <p className="text-sm text-red-800">
              You have {distribution[t('extremeRisk')] + distribution[t('highRisk')]} high-priority risk(s) that require immediate attention. 
              Review the recommended strategies and develop comprehensive mitigation plans for these risks first.
            </p>
          </div>
        )}
      </div>

      {/* Risk Matrix Visual */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{t('riskMatrix')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white rounded-lg overflow-hidden text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2"></th>
                <th className="p-2 font-medium text-center">{t('insignificant')}</th>
                <th className="p-2 font-medium text-center">{t('minor')}</th>
                <th className="p-2 font-medium text-center">{t('serious')}</th>
                <th className="p-2 font-medium text-center">{t('major')}</th>
                <th className="p-2 font-medium text-center">{t('severity')}</th>
              </tr>
            </thead>
            <tbody>
              {[4, 3, 2, 1].map(likelihood => (
                <tr key={likelihood}>
                  <td className="p-2 font-medium text-center align-middle">
                    {likelihoodOptions.find(opt => opt.value === likelihood.toString())?.label || `(${likelihood})`}
                  </td>
                  {[1, 2, 3, 4].map(severity => {
                    const score = likelihood * severity
                    const { level, color } = calculateRiskLevel(likelihood.toString(), severity.toString())
                    return (
                      <td key={`${likelihood}-${severity}`} className={`p-3 text-center font-medium rounded ${color}`}> 
                        {level}<br/>({score})
                      </td>
                    )
                  })}
                  <td className="p-2 font-medium text-center align-middle rotate-90">{likelihood === 4 ? t('likelihood') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Risk Assessments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('individualRiskAssessments')}</h3>
        
        {riskItems.map((risk, index) => {
          const isActive = activeRisk === index
          const isCompleted = risk.likelihood && risk.severity
          const isHighRisk = risk.riskScore >= 8
          const isExtremeRisk = risk.riskScore >= 12
          
          return (
            <div key={`${risk.hazard}-${index}`} className={`bg-white border rounded-lg transition-all duration-200 ${
              isActive ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md'
            } ${isExtremeRisk ? 'border-red-300' : isHighRisk ? 'border-orange-300' : ''}`}>
              <button
                onClick={() => setActiveRisk(isActive ? null : index)}
                className="w-full p-4 text-left flex items-center justify-between"
                type="button"
              >
                <div className="flex items-center space-x-3">
                  {/* Status Indicator */}
                  <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                  
                  {/* Hazard Name */}
                  <h4 className="font-medium">{risk.hazard}</h4>
                  
                  {/* Risk Level Badge */}
                  {risk.riskLevel && (
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(risk.riskLevel)}`}>
                        {risk.riskLevel} ({risk.riskScore})
                      </span>
                      
                      {/* High Priority Visual Indicators */}
                      {isExtremeRisk && (
                        <div className="flex items-center space-x-1">
                          <span className="text-red-600 text-sm" title="Extreme Risk - Immediate Action Required">🚨</span>
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-semibold">URGENT</span>
                        </div>
                      )}
                      {isHighRisk && !isExtremeRisk && (
                        <div className="flex items-center space-x-1">
                          <span className="text-orange-600 text-sm" title="High Risk - Priority Action Needed">⚠️</span>
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full font-semibold">HIGH</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <svg 
                  className={`h-5 w-5 text-gray-400 transition-transform ${isActive ? 'rotate-180' : ''}`} 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isActive && (
                <div className="px-4 pb-4 space-y-4 border-t">
                  {/* Likelihood Assessment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('likelihoodAssessment')}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {likelihoodOptions.map(option => (
                        <div 
                          key={`likelihood-${index}-${option.value}`} 
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${risk.likelihood === option.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            updateRiskItem(index, 'likelihood', option.value)
                          }}
                        >
                          <input
                            type="radio"
                            name={`likelihood-${risk.hazard.replace(/\s+/g, '')}-${index}`}
                            value={option.value}
                            checked={risk.likelihood === option.value}
                            onChange={() => {}} // Controlled by parent div click
                            className="h-4 w-4 text-primary-600 mr-3 focus:ring-primary-500 pointer-events-none"
                            readOnly
                          />
                          <div className="pointer-events-none">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Severity Assessment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('severityAssessment')}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {severityOptions.map(option => (
                        <div 
                          key={`severity-${index}-${option.value}`} 
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${risk.severity === option.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            updateRiskItem(index, 'severity', option.value)
                          }}
                        >
                          <input
                            type="radio"
                            name={`severity-${risk.hazard.replace(/\s+/g, '')}-${index}`}
                            value={option.value}
                            checked={risk.severity === option.value}
                            onChange={() => {}} // Controlled by parent div click
                            className="h-4 w-4 text-primary-600 mr-3 focus:ring-primary-500 pointer-events-none"
                            readOnly
                          />
                          <div className="pointer-events-none">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Level Display */}
                  {risk.likelihood && risk.severity && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">{t('calculatedRiskLevel')}</div>
                      <div className={`inline-flex items-center px-4 py-2 rounded-full font-medium ${getRiskLevelColor(risk.riskLevel)}`}>
                        {risk.riskLevel} {t('riskText')} ({t('riskScore')}: {risk.riskScore})
                      </div>
                    </div>
                  )}

                  {/* Risk-Specific Strategy Recommendations */}
                  {risk.likelihood && risk.severity && (
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-gray-700 mb-3">Recommended Strategies for {risk.hazard}:</div>
                      {(() => {
                        const strategies = getRiskStrategies(risk.hazard, risk.riskLevel, risk.riskScore)
                        return (
                          <div className="space-y-3">
                            {/* Prevention Strategies */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <h5 className="text-sm font-semibold text-blue-900 mb-2">🛡️ Prevention (Before)</h5>
                              <ul className="text-xs text-blue-800 space-y-1">
                                {strategies.prevention.slice(0, 3).map((strategy, i) => (
                                  <li key={`prev-${i}`} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{strategy}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Response Strategies */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                              <h5 className="text-sm font-semibold text-orange-900 mb-2">⚡ Response (During)</h5>
                              <ul className="text-xs text-orange-800 space-y-1">
                                {strategies.response.slice(0, 3).map((strategy, i) => (
                                  <li key={`resp-${i}`} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{strategy}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Recovery Strategies */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <h5 className="text-sm font-semibold text-green-900 mb-2">🔄 Recovery (After)</h5>
                              <ul className="text-xs text-green-800 space-y-1">
                                {strategies.recovery.slice(0, 3).map((strategy, i) => (
                                  <li key={`rec-${i}`} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{strategy}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {/* Planning Measures */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('planningMeasures')}
                    </label>
                    {risk.likelihood && risk.severity && (
                      <p className="text-xs text-blue-600 mb-2">
                        💡 Use the recommended strategies above as a starting point for your planning measures
                      </p>
                    )}
                    <textarea
                      value={risk.planningMeasures}
                      onChange={(e) => updateRiskItem(index, 'planningMeasures', e.target.value)}
                      placeholder={risk.likelihood && risk.severity 
                        ? "Based on the strategies above, describe your specific implementation plan..." 
                        : t('planningMeasuresPlaceholder')
                      }
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('planningMeasuresHelp')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary and Recommendations */}
      {completedRisks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">{t('assessmentSummary')}</h3>
          
          <div className="space-y-3">
            {distribution[t('extremeRisk')] > 0 && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <svg className="h-5 w-5 text-red-500 mr-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-800">
                  <strong>{t('extremePriority')}</strong> {t('extremePriorityText', { count: distribution[t('extremeRisk')] })}
                </span>
              </div>
            )}
            
            {distribution[t('highRisk')] > 0 && (
              <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <svg className="h-5 w-5 text-orange-500 mr-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-orange-800">
                  <strong>{t('highPriority')}</strong> {t('highPriorityText', { count: distribution[t('highRisk')] })}
                </span>
              </div>
            )}
            
            <div className="text-sm text-blue-800">
              <p className="mb-2">
                <strong>{t('nextSteps')}</strong> {t('nextStepsText')}
              </p>
              <p>
                {t('ongoingProcess')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
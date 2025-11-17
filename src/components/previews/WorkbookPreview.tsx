/**
 * Action Workbook - Practical Crisis Prevention & Response Guide
 * 
 * A print-friendly, grab-and-go workbook that business owners can:
 * - Use to implement prevention strategies BEFORE a crisis
 * - Pull out and follow DURING an emergency
 * - Reference for recovery steps AFTER an incident
 * 
 * DATA SOURCES:
 * - formData: All wizard-entered information
 * - strategies: Database strategies with action steps and costs
 * - riskSummary: Risk assessment results
 */

import React from 'react'
import { calculateStrategyTimeFromSteps, formatHoursToDisplay } from '@/utils/timeCalculation'

interface ActionStep {
  id: string
  title: string
  description: string
  smeAction?: string
  timeframe?: string
  sortOrder: number
  costItems?: Array<{
    itemId: string
    quantity: number
    notes?: string
    item?: any
  }>
}

interface Strategy {
  id: string
  name: string
  smeTitle?: string
  description: string
  smeSummary?: string
  priorityLevel?: string // 'essential' | 'recommended' | 'optional'
  applicableRisks: string[]
  actionSteps: ActionStep[]
  calculatedCostLocal?: number
  calculatedCostUSD?: number
  currencyCode?: string
  currencySymbol?: string
  calculatedHours?: number
}

interface WorkbookPreviewProps {
  formData: any
  riskSummary?: any
  strategies: Strategy[]
  totalInvestment: number
}

export const WorkbookPreview: React.FC<WorkbookPreviewProps> = ({
  formData,
  riskSummary,
  strategies,
  totalInvestment
}) => {
  
  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  const getStringValue = (value: any): string => {
    if (!value) return ''
    
    // If it's a string, check if it's a JSON string that needs parsing
    if (typeof value === 'string') {
      // Try to parse as JSON if it looks like multilingual content
      if (value.startsWith('{') && (value.includes('"en":') || value.includes('"es":') || value.includes('"fr":'))) {
        try {
          const parsed = JSON.parse(value)
          // If parsed successfully, extract English (or first available language)
          if (typeof parsed === 'object' && parsed !== null) {
            return parsed.en || parsed.es || parsed.fr || ''
          }
        } catch {
          // If parsing fails, return original string
        }
      }
      return value
    }
    
    // If it's already an object with language keys
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (value.en || value.es || value.fr) {
        return value.en || value.es || value.fr || ''
      }
    }
    
    return String(value)
  }
  
  const getRiskEmoji = (hazard: string): string => {
    const h = hazard.toLowerCase()
    if (h.includes('hurricane') || h.includes('tropical') || h.includes('storm')) return '🌀'
    if (h.includes('earthquake')) return '🏚️'
    if (h.includes('flood')) return '🌊'
    if (h.includes('fire')) return '🔥'
    if (h.includes('cyber') || h.includes('data')) return '💻'
    if (h.includes('power') || h.includes('outage')) return '⚡'
    if (h.includes('pandemic') || h.includes('health') || h.includes('disease')) return '🏥'
    if (h.includes('supply') || h.includes('shortage')) return '📦'
    return '⚠️'
  }
  
  const getRiskSeverityBadge = (score: number) => {
    if (score >= 20) return { label: 'EXTREME', color: 'bg-red-600 text-white' }
    if (score >= 15) return { label: 'HIGH', color: 'bg-orange-500 text-white' }
    if (score >= 10) return { label: 'MEDIUM', color: 'bg-yellow-500 text-white' }
    return { label: 'LOW', color: 'bg-green-500 text-white' }
  }
  
  const formatCurrency = (amount: number, symbol: string = '$') => {
    return `${symbol}${amount.toLocaleString()}`
  }

  // ============================================================================
  // DATA EXTRACTION
  // ============================================================================
  
  // Basic business information
  const companyName = getStringValue(formData.PLAN_INFORMATION?.['Company Name'] || formData.BUSINESS_OVERVIEW?.['Company Name'] || 'Your Business')
  const businessAddress = getStringValue(formData.PLAN_INFORMATION?.['Business Address'] || formData.BUSINESS_OVERVIEW?.['Business Address'] || '')
  const planManager = getStringValue(formData.PLAN_INFORMATION?.['Plan Manager'] || 'Not specified')
  const planManagerPhone = getStringValue(formData.PLAN_INFORMATION?.['Phone'] || 
                                          formData.PLAN_INFORMATION?.['Manager Contact'] ||
                                          formData.PLAN_INFORMATION?.['Phone Number'] || '')
  const planManagerEmail = getStringValue(formData.PLAN_INFORMATION?.['Email'] || 
                                         formData.PLAN_INFORMATION?.['Manager Email'] || '')
  const alternateManager = getStringValue(formData.PLAN_INFORMATION?.['Alternate Manager'] || '')
  const alternateContact = getStringValue(formData.PLAN_INFORMATION?.['Alternate Contact'] || '')
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  
  // Currency information
  const currencySymbol = strategies[0]?.currencySymbol || '$'
  const currencyCode = strategies[0]?.currencyCode || 'USD'
  
  // Risk data - Only include risks that have been ticked (isSelected === true)
  const riskMatrix = riskSummary?.['Risk Assessment Matrix'] ||
                     riskSummary?.['Hazard Applicability Assessment'] ||
                     riskSummary?.risks ||
                     formData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] ||
                     []

  const risks = Array.isArray(riskMatrix) ? riskMatrix.filter((r: any) => {
    // Include risks that are selected (isSelected !== false), following dataTransformers.ts pattern
    if (r.isSelected === false) return false
    // Must have hazard information
    return r && (r.hazard || r.Hazard || r.hazardName || r.riskType)
  }) : []
  
  // Sort risks by severity (highest first)
  const sortedRisks = [...risks].sort((a, b) => {
    const scoreA = a.riskScore || a['Risk Score'] || 0
    const scoreB = b.riskScore || b['Risk Score'] || 0
    return scoreB - scoreA
  })
  
  // Contacts data
  const contactsAndInfo = formData.CONTACTS_AND_INFORMATION || {}
  const staffContactsRaw = contactsAndInfo['Staff Contact Information'] || []
  const emergencyServicesAndUtilities = contactsAndInfo['Emergency Services and Utilities'] || []
  const suppliersRaw = contactsAndInfo['Supplier Information'] || []
  
  // Emergency contacts (police, fire, ambulance)
  const emergencyContacts = emergencyServicesAndUtilities.filter((c: any) => {
    const serviceType = (c['Service Type'] || c.serviceType || c.type || '').toLowerCase()
    return serviceType.includes('police') || serviceType.includes('fire') || 
           serviceType.includes('ambulance') || serviceType.includes('medical') ||
           serviceType.includes('emergency')
  })
  
  // Utilities contacts (electricity, water, internet)
  const utilitiesContacts = emergencyServicesAndUtilities.filter((c: any) => {
    const serviceType = (c['Service Type'] || c.serviceType || c.type || '').toLowerCase()
    return serviceType.includes('electric') || serviceType.includes('water') || 
           serviceType.includes('internet') || serviceType.includes('phone') ||
           serviceType.includes('gas') || serviceType.includes('utility')
  })
  
  // Insurance & Banking
  const insuranceContacts = emergencyServicesAndUtilities.filter((c: any) => {
    const serviceType = (c['Service Type'] || c.serviceType || c.type || '').toLowerCase()
    return serviceType.includes('insurance')
  })
  
  const bankingContacts = emergencyServicesAndUtilities.filter((c: any) => {
    const serviceType = (c['Service Type'] || c.serviceType || c.type || '').toLowerCase()
    return serviceType.includes('bank') || serviceType.includes('financial')
  })
  
  // Vital records
  const vitalRecords = formData.VITAL_RECORDS?.['Vital Records Inventory'] || 
                      formData.VITAL_RECORDS?.['Records Inventory'] || []
  
  // Essential Functions - extract from various possible structures
  const essentialFunctionsRaw = formData.ESSENTIAL_FUNCTIONS?.['Functions'] || 
                                formData.ESSENTIAL_FUNCTIONS?.['Business Functions'] ||
                                formData.ESSENTIAL_FUNCTIONS || []
  
  const essentialFunctions = Array.isArray(essentialFunctionsRaw) 
    ? essentialFunctionsRaw.map((fn: any) => ({
        name: getStringValue(fn.name || fn.functionName || fn.function || fn['Business Function'] || 'Function'),
        description: getStringValue(fn.description || fn.Description || ''),
        priority: fn.priority || fn['Priority Level'] || 'medium',
        maxDowntime: fn.maxDowntime || fn['Maximum Acceptable Downtime'] || 'TBD',
        resources: fn.resources || fn['Critical Resources Needed'] || ''
      }))
    : []
  
  // Business details
  const businessInfo = formData.BUSINESS_OVERVIEW || {}
  const businessPurpose = getStringValue(businessInfo['Business Purpose'] || '')
  const productsServices = getStringValue(businessInfo['Products and Services'] || businessInfo['Key Products/Services'] || '')
  const operatingHours = getStringValue(businessInfo['Operating Hours'] || '')
  const totalEmployees = businessInfo['Total People in Business'] || businessInfo['Number of Employees'] || ''
  
  // Helper to parse applicableRisks (can be string or array)
  const parseApplicableRisks = (risks: any): string[] => {
    if (!risks) return []
    if (Array.isArray(risks)) return risks
    if (typeof risks === 'string') {
      try {
        const parsed = JSON.parse(risks)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  }
  
  // Helper to safely parse JSON fields (resources, checklist, etc.)
  const safeParseJson = (value: any): any[] => {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        // Handle multilingual objects
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          if (parsed.en) {
            // It's a multilingual object, extract the English value
            return [parsed.en]
          }
          // If it's an object with array values (like {en: [...], es: [...]})
          if (parsed.en && Array.isArray(parsed.en)) {
            return parsed.en
          }
        }
        return Array.isArray(parsed) ? parsed : []
      } catch {
        // If parsing fails, try to extract from multilingual format
        if (value.includes('"en"')) {
          try {
            const match = value.match(/"en"\s*:\s*\[(.*?)\]/)
            if (match) {
              return JSON.parse(`[${match[1]}]`)
            }
          } catch {}
        }
        return []
      }
    }
    return []
  }
  
  // Helper function to determine if step is before/during/after (used throughout)
  const getStepTiming = (step: any): 'before' | 'during' | 'after' | null => {
    // Check executionTiming first (primary field)
    if (step.executionTiming === 'before_crisis') return 'before'
    if (step.executionTiming === 'during_crisis') return 'during'
    if (step.executionTiming === 'after_crisis') return 'after'
    
    // Fallback to phase field - handle both old and new phase values
    const phase = (step.phase || '').toLowerCase()
    if (phase === 'before' || phase === 'immediate' || phase === 'short_term' || phase === 'prevention') return 'before'
    if (phase === 'during' || phase === 'medium_term' || phase === 'response') return 'during'
    if (phase === 'after' || phase === 'long_term' || phase === 'recovery') return 'after'
    
    // Check timeframe field for keywords (e.g., "Before emergency" = before)
    const timeframe = getStringValue(step.timeframe || '').toLowerCase()
    if (timeframe.includes('before') || timeframe.includes('preparation') || timeframe.includes('prevent')) return 'before'
    if (timeframe.includes('during') || timeframe.includes('emergency') || timeframe.includes('crisis') || timeframe.includes('storm')) return 'during'
    if (timeframe.includes('after') || timeframe.includes('recover') || timeframe.includes('restore') || timeframe.includes('all-clear')) return 'after'
    
    // Additional fallback: check step content for keywords
    const stepText = ((step.smeAction || step.title || step.description || '') + ' ' + (step.whyThisStepMatters || '')).toLowerCase()
    if (stepText.includes('during') || stepText.includes('emergency') || stepText.includes('crisis') || stepText.includes('evacuate') || stepText.includes('activate')) {
      return 'during'
    }
    if (stepText.includes('after') || stepText.includes('recover') || stepText.includes('restore') || stepText.includes('assess damage')) {
      return 'after'
    }
    
    // Default to before (preparation)
    return 'before'
  }
  
  // Categorize strategies by type (risk-specific vs generic)
  // Generic strategies: have 'all_hazards' in applicableRisks or empty applicableRisks
  const genericStrategies = strategies.filter(s => {
    const applicableRisks = parseApplicableRisks(s.applicableRisks)
    const isGeneric = applicableRisks.length === 0 || applicableRisks.includes('all_hazards')
    
    // Debug logging
    if (isGeneric) {
      console.log('[WorkbookPreview] Generic strategy found:', {
        name: getStringValue(s.smeTitle || s.name),
        applicableRisksRaw: s.applicableRisks,
        applicableRisksParsed: applicableRisks
      })
    }
    
    return isGeneric
  })
  
  // Risk-specific strategies: apply to specific risks (not all_hazards)
  const riskSpecificStrategies = strategies.filter(s => {
    const applicableRisks = parseApplicableRisks(s.applicableRisks)
    const isRiskSpecific = applicableRisks.length > 0 && !applicableRisks.includes('all_hazards')
    
    // Debug logging
    if (isRiskSpecific) {
      console.log('[WorkbookPreview] Risk-specific strategy found:', {
        name: getStringValue(s.smeTitle || s.name),
        applicableRisksRaw: s.applicableRisks,
        applicableRisksParsed: applicableRisks
      })
    }
    
    return isRiskSpecific
  })
  
  console.log('[WorkbookPreview] Strategy categorization:', {
    total: strategies.length,
    generic: genericStrategies.length,
    riskSpecific: riskSpecificStrategies.length,
    genericNames: genericStrategies.map(s => getStringValue(s.smeTitle || s.name)),
    riskSpecificNames: riskSpecificStrategies.map(s => getStringValue(s.smeTitle || s.name))
  })
  
  // Essential vs Optional strategies
  const essentialStrategies = strategies.filter(s => s.priorityLevel === 'essential')
  const recommendedStrategies = strategies.filter(s => s.priorityLevel === 'recommended')
  const optionalStrategies = strategies.filter(s => s.priorityLevel === 'optional')

  console.log('[WorkbookPreview] Data loaded:', {
    companyName,
    risksCount: risks.length,
    strategiesCount: strategies.length,
    riskSpecificCount: riskSpecificStrategies.length,
    genericCount: genericStrategies.length,
    staffContactsCount: staffContactsRaw.length,
    emergencyContactsCount: emergencyContacts.length
  })
  
  console.log('[WorkbookPreview] Strategy details:', 
    strategies.map(s => ({
      name: getStringValue(s.name || s.smeTitle),
      strategyType: s.strategyType,
      applicableRisksRaw: s.applicableRisks,
      applicableRisksParsed: parseApplicableRisks(s.applicableRisks),
      beforeSteps: s.actionSteps?.filter((step: any) => step.executionTiming === 'before_crisis').length || 0,
      duringSteps: s.actionSteps?.filter((step: any) => step.executionTiming === 'during_crisis').length || 0,
      afterSteps: s.actionSteps?.filter((step: any) => step.executionTiming === 'after_crisis').length || 0
    }))
  )

  // ============================================================================
  // RENDER WORKBOOK
  // ============================================================================
  
  return (
    <div className="bg-white print:shadow-none" style={{ maxWidth: '8.5in', margin: '0 auto' }}>
      
      {/* ====================================================================== */}
      {/* COVER PAGE */}
      {/* ====================================================================== */}
      <div className="border-4 border-blue-600 p-8 text-center bg-white page-break-after">
        <div className="mb-8">
          <div className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">Business Continuity</div>
          <h1 className="text-5xl font-black mb-6 text-gray-900" style={{ fontSize: '3rem', lineHeight: '1.1' }}>
            ACTION WORKBOOK
          </h1>
          <div className="text-3xl font-bold text-blue-600 mb-4" style={{ fontSize: '2rem' }}>
            {companyName}
          </div>
          {businessAddress && (
            <div className="text-lg text-gray-600 mb-8">{businessAddress}</div>
          )}
        </div>

        {/* Emergency Contact Box */}
        <div className="border-4 border-red-500 bg-red-50 p-6 mb-8 text-left">
          <h2 className="text-2xl font-black mb-4 text-red-900 text-center">
            🚨 EMERGENCY CONTACTS
          </h2>
          <div className="space-y-3 text-lg">
            {emergencyContacts.length > 0 ? (
              emergencyContacts.slice(0, 3).map((contact: any, idx: number) => (
                <div key={idx} className="flex justify-between border-b-2 border-red-200 pb-2">
                  <span className="font-bold">
                    {getStringValue(contact['Service Type'] || contact.serviceType || 'Emergency')}:
                  </span>
                  <span className="font-mono">
                    {getStringValue(contact['Phone Number'] || contact.phoneNumber || contact.phone || '___-___-____')}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex justify-between border-b-2 border-red-200 pb-2">
                <span className="font-bold">Emergency Services:</span>
                <span className="font-mono">___-___-____</span>
              </div>
            )}
            <div className="flex justify-between border-b-2 border-red-200 pb-2">
              <span className="font-bold">Plan Manager ({planManager}):</span>
              <span className="font-mono">{planManagerPhone || planManagerEmail || '___-___-____'}</span>
            </div>
            {alternateManager && alternateManager !== 'N/A' && alternateContact && (
              <div className="flex justify-between border-b-2 border-red-200 pb-2">
                <span className="font-bold">Alternate Manager ({alternateManager}):</span>
                <span className="font-mono">{alternateContact}</span>
              </div>
            )}
          </div>
          <div className="mt-6 p-4 bg-yellow-100 border-2 border-yellow-600 rounded">
            <p className="text-xl font-bold text-center text-yellow-900">
              IF EMERGENCY IN PROGRESS → TURN TO PAGE 2
            </p>
          </div>
        </div>

        {/* What This Workbook Contains */}
        <div className="border-2 border-gray-300 p-6 text-left mb-8">
          <h2 className="text-2xl font-black mb-4 text-gray-900">📋 What's Inside</h2>
          <div className="space-y-2 text-base">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span><strong>Quick Reference Guide</strong> - Emergency decision flowchart</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span><strong>Risk Action Plans</strong> - What to do BEFORE, DURING & AFTER each risk</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span><strong>Implementation Checklists</strong> - Track your prevention work</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span><strong>Contact Directory</strong> - All key contacts in one place</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">5.</span>
              <span><strong>Document Locator</strong> - Where to find critical records</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">6.</span>
              <span><strong>Incident Log</strong> - Templates for recording events</span>
            </div>
          </div>
        </div>

        {/* Document Info */}
        <div className="border-t-2 border-gray-300 pt-6 text-left">
          <div className="grid grid-cols-2 gap-4 text-base mb-4">
            <div>
              <span className="font-bold text-gray-700">Plan Manager:</span><br/>
              <span>{planManager}</span>
            </div>
            <div>
              <span className="font-bold text-gray-700">Contact:</span><br/>
              <span>{planManagerPhone || planManagerEmail || 'See staff directory'}</span>
            </div>
            <div>
              <span className="font-bold text-gray-700">Date Created:</span><br/>
              <span>{currentDate}</span>
            </div>
            <div>
              <span className="font-bold text-gray-700">Next Review:</span><br/>
              <span>Quarterly or after any incident</span>
            </div>
          </div>
          <div className="text-sm text-gray-500 text-center pt-4 border-t border-gray-200">
            UNDP x CARICHAM Business Continuity Planning Initiative
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* PAGE 1: QUICK REFERENCE GUIDE - Emergency Decision Tree */}
      {/* ====================================================================== */}
      <div className="p-8 page-break-after">
        <div className="border-4 border-red-600 p-4 mb-6">
          <h1 className="text-4xl font-black text-center text-red-900">
            ⚡ QUICK REFERENCE GUIDE
          </h1>
          <p className="text-center text-lg mt-2 text-red-700">
            Use this page when an emergency is happening NOW
          </p>
        </div>

        {/* Business Critical Information Box */}
        {(businessPurpose || productsServices || essentialFunctions.length > 0) && (
          <div className="border-4 border-blue-500 bg-blue-50 p-4 mb-6">
            <h2 className="text-2xl font-black text-blue-900 mb-3">🏢 OUR BUSINESS</h2>
            {businessPurpose && (
              <div className="mb-2">
                <span className="font-bold text-blue-900">Purpose: </span>
                <span className="text-blue-800">{businessPurpose}</span>
              </div>
            )}
            {productsServices && (
              <div className="mb-2">
                <span className="font-bold text-blue-900">What We Do: </span>
                <span className="text-blue-800">{productsServices}</span>
              </div>
            )}
            {operatingHours && (
              <div className="mb-2">
                <span className="font-bold text-blue-900">Operating Hours: </span>
                <span className="text-blue-800">{operatingHours}</span>
              </div>
            )}
            {totalEmployees && (
              <div className="mb-2">
                <span className="font-bold text-blue-900">Team Size: </span>
                <span className="text-blue-800">{totalEmployees} people</span>
              </div>
            )}
            {essentialFunctions.length > 0 && (
              <div className="mt-3 pt-3 border-t-2 border-blue-300">
                <div className="font-bold text-blue-900 mb-2">Critical Operations (Must Restore First):</div>
                <ul className="space-y-1 text-sm text-blue-800">
                  {essentialFunctions.slice(0, 5).map((fn: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">{idx + 1}.</span>
                      <div>
                        <span className="font-semibold">{fn.name}</span>
                        {fn.maxDowntime && fn.maxDowntime !== 'TBD' && (
                          <span className="ml-2 text-xs text-blue-600">(Restore within: {fn.maxDowntime})</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {/* Step 1: Ensure Safety */}
          <div className="border-4 border-red-500 bg-red-50 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black">1</div>
              <h2 className="text-2xl font-black text-red-900">ENSURE SAFETY FIRST</h2>
            </div>
            <ul className="space-y-2 text-lg ml-16">
              <li className="flex items-start gap-2">
                <span className="text-red-600">▶</span>
                <span>Evacuate if building is unsafe (fire, structural damage, flooding)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">▶</span>
                <span>Account for all staff and visitors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">▶</span>
                <span>Call emergency services if anyone is injured: <strong className="font-mono">
                  {emergencyContacts[0] ? getStringValue(emergencyContacts[0]['Phone Number'] || emergencyContacts[0].phoneNumber) : '911 or local emergency number'}
                </strong></span>
              </li>
            </ul>
          </div>

          {/* Step 2: Assess the Situation */}
          <div className="border-4 border-orange-500 bg-orange-50 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black">2</div>
              <h2 className="text-2xl font-black text-orange-900">ASSESS THE SITUATION</h2>
            </div>
            <ul className="space-y-2 text-lg ml-16">
              <li className="flex items-start gap-2">
                <span className="text-orange-600">▶</span>
                <span>What type of emergency is this? (Check risk sections for specific guidance)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600">▶</span>
                <span>Can business operations continue safely?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600">▶</span>
                <span>What resources are compromised? (power, water, equipment, data, etc.)</span>
              </li>
            </ul>
          </div>

          {/* Step 3: Activate Response */}
          <div className="border-4 border-yellow-500 bg-yellow-50 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black">3</div>
              <h2 className="text-2xl font-black text-yellow-900">ACTIVATE RESPONSE PLAN</h2>
            </div>
            <ul className="space-y-2 text-lg ml-16">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">▶</span>
                <span>Notify Plan Manager: <strong>{planManager} - {planManagerPhone || planManagerEmail}</strong>
                {alternateManager && alternateManager !== 'N/A' && alternateContact && ` (Backup: ${alternateManager} - ${alternateContact})`}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">▶</span>
                <span>Alert staff using contact list (see Contact Directory section)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">▶</span>
                <span>Turn to the specific RISK section for detailed DURING/AFTER actions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">▶</span>
                <span>Begin recording events in Incident Log (back of workbook)</span>
              </li>
            </ul>
          </div>

          {/* Step 4: Protect Critical Operations */}
          <div className="border-4 border-blue-500 bg-blue-50 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black">4</div>
              <h2 className="text-2xl font-black text-blue-900">PROTECT CRITICAL OPERATIONS</h2>
            </div>
            <ul className="space-y-2 text-lg ml-16">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">▶</span>
                <span>Secure vital records and backup data (see Document Locator)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">▶</span>
                <span>Contact insurance provider immediately: {insuranceContacts.length > 0 ? (
                  <strong className="font-mono">
                    {getStringValue(insuranceContacts[0]['Phone Number'] || insuranceContacts[0].phoneNumber)}
                  </strong>
                ) : '(see Insurance contacts)'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">▶</span>
                <span>Document all damage with photos/videos for insurance claims</span>
              </li>
            </ul>
          </div>

          {/* Quick Risk Finder */}
          <div className="border-2 border-gray-400 bg-gray-50 p-4 mt-6">
            <h3 className="text-xl font-black mb-3 text-gray-900">📍 Find Your Risk Section:</h3>
            <div className="grid grid-cols-2 gap-2 text-base">
              {sortedRisks.slice(0, 6).map((risk: any, idx: number) => {
                const hazardName = getStringValue(risk.hazard || risk.Hazard || 'Risk')
                const emoji = getRiskEmoji(hazardName)
                const pageNum = 3 + idx // Approximate page number
                return (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-300 pb-1">
                    <span>{emoji} {hazardName}</span>
                    <span className="font-mono text-gray-600">Page ~{pageNum}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* SECTION 2: GENERAL RISK MITIGATION & PREVENTION STRATEGIES */}
      {/* Complete generic strategies (all phases) - shown once */}
      {/* ====================================================================== */}
      {genericStrategies.length > 0 ? (
        <div className="p-8 page-break-after">
          <div className="border-4 border-green-600 p-4 mb-6">
            <h1 className="text-4xl font-black text-green-900 mb-2">
              🛡️ GENERAL RISK MITIGATION & PREVENTION
            </h1>
            <p className="text-lg text-gray-700">
              These strategies protect your business from ALL types of emergencies. Complete these once, and they'll help you prepare for, respond to, and recover from any risk.
            </p>
          </div>

          {genericStrategies.map((strategy, sIdx) => {
            const stratName = getStringValue(strategy.smeTitle || strategy.name)
            const stratDesc = getStringValue(strategy.smeSummary || strategy.description)
            const stratCost = strategy.calculatedCostLocal || 0
            const stratTime = strategy.calculatedHours 
              ? formatHoursToDisplay(strategy.calculatedHours)
              : calculateStrategyTimeFromSteps(strategy.actionSteps) 
                ? formatHoursToDisplay(calculateStrategyTimeFromSteps(strategy.actionSteps))
                : 'TBD'
            const isEssential = strategy.priorityLevel === 'essential'
            
            // Group steps by phase
            const beforeSteps = strategy.actionSteps?.filter((step: any) => getStepTiming(step) === 'before') || []
            const duringSteps = strategy.actionSteps?.filter((step: any) => getStepTiming(step) === 'during') || []
            const afterSteps = strategy.actionSteps?.filter((step: any) => getStepTiming(step) === 'after') || []
            
            return (
              <div key={sIdx} className="border-4 border-green-500 bg-green-50 p-6 mb-6 page-break-after">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-2xl font-black text-green-900">
                    {isEssential && <span className="text-red-600">⚠️ ESSENTIAL: </span>}
                    {stratName}
                  </h2>
                  <div className="text-right text-sm ml-4">
                    <div className="font-bold text-green-900">{formatCurrency(stratCost, currencySymbol)}</div>
                    <div className="text-gray-600">{stratTime}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-4">{stratDesc}</p>
                
                {/* BEFORE: Prevention & Preparation */}
                {beforeSteps.length > 0 && (
                  <div className="mb-6">
                    <div className="bg-blue-600 text-white p-3 mb-3">
                      <h3 className="text-xl font-black">🛡️ BEFORE: Prevention & Preparation</h3>
                      <p className="text-sm mt-1">Do these things NOW to reduce risk and prepare for potential impact</p>
                    </div>
                    
                    <div className="ml-4">
                      <ol className="space-y-3">
                        {beforeSteps.map((step: any, stepIdx: number) => {
                          const stepText = getStringValue(step.smeAction || step.title || step.description)
                          const stepTime = getStringValue(step.timeframe)
                          const whyMatters = getStringValue(step.whyThisStepMatters)
                          const whatHappensIfSkipped = getStringValue(step.whatHappensIfSkipped)
                          const responsibility = getStringValue(step.responsibility)
                          const howToKnowDone = getStringValue(step.howToKnowItsDone)
                          const freeAlternative = getStringValue(step.freeAlternative)
                          const lowTechOption = getStringValue(step.lowTechOption)
                          const exampleOutput = getStringValue(step.exampleOutput)
                          const resources = safeParseJson(step.resources)
                          const commonMistakes = safeParseJson(step.commonMistakesForStep)
                          
                          return (
                            <li key={stepIdx} className="mb-4">
                              {/* Action Step Card */}
                              <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
                                {/* Header */}
                                <div className="bg-blue-50 border-b border-gray-200 px-4 py-3">
                                  <div className="flex items-start gap-3">
                                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                                      {stepIdx + 1}
                                    </span>
                                    <div className="flex-1">
                                      <div className="font-bold text-gray-900 text-base leading-tight">{stepText}</div>
                                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-600">
                                        {stepTime && (
                                          <span className="flex items-center gap-1">
                                            <span className="text-sm">⏱️</span> {stepTime}
                                          </span>
                                        )}
                                        {responsibility && (
                                          <span className="flex items-center gap-1">
                                            <span className="text-sm">👤</span> {responsibility}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="px-4 py-3 space-y-3">
                                  {/* Why This Matters */}
                                  {whyMatters && (
                                    <div className="bg-blue-50 border-l-4 border-blue-400 pl-3 py-2">
                                      <div className="flex items-start gap-2">
                                        <span className="text-blue-600 font-bold text-sm">💡 WHY:</span>
                                        <div className="text-sm text-gray-800 leading-relaxed">{whyMatters}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* What Happens If Skipped */}
                                  {whatHappensIfSkipped && (
                                    <div className="bg-red-50 border-l-4 border-red-400 pl-3 py-2">
                                      <div className="flex items-start gap-2">
                                        <span className="text-red-600 font-bold text-sm">⚠️ IF SKIPPED:</span>
                                        <div className="text-sm text-red-800 leading-relaxed">{whatHappensIfSkipped}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* How to Know It's Done */}
                                  {howToKnowDone && (
                                    <div className="bg-green-50 border-l-4 border-green-400 pl-3 py-2">
                                      <div className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold text-sm">✓ DONE WHEN:</span>
                                        <div className="text-sm text-green-800 leading-relaxed">{howToKnowDone}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Example */}
                                  {exampleOutput && (
                                    <div className="bg-gray-50 border border-gray-200 rounded p-3">
                                      <div className="flex items-start gap-2">
                                        <span className="text-gray-600 font-bold text-sm">📄 EXAMPLE:</span>
                                        <div className="text-sm text-gray-700 italic leading-relaxed">{exampleOutput}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Alternatives */}
                                  {(freeAlternative || lowTechOption) && (
                                    <div className="border-t border-gray-200 pt-3">
                                      <div className="text-xs font-semibold text-gray-700 mb-2">💰 ALTERNATIVES:</div>
                                      <div className="space-y-2">
                                        {freeAlternative && (
                                          <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border-l-2 border-yellow-300">
                                            <strong>Free/Low-Cost:</strong> {freeAlternative}
                                          </div>
                                        )}
                                        {lowTechOption && (
                                          <div className="text-xs text-gray-600 bg-purple-50 p-2 rounded border-l-2 border-purple-300">
                                            <strong>Low-Tech:</strong> {lowTechOption}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </li>
                          )
                        })}
                      </ol>
                    </div>
                  </div>
                )}
                
                {/* DURING: Emergency Response */}
                {duringSteps.length > 0 && (
                  <div className="mb-6">
                    <div className="bg-red-600 text-white p-3 mb-3">
                      <h3 className="text-xl font-black">🚨 DURING: Emergency Response</h3>
                      <p className="text-sm mt-1">Follow these steps when this emergency is happening NOW</p>
                    </div>
                    
                    <div className="ml-4">
                      <ol className="space-y-3">
                        {duringSteps.map((step: any, stepIdx: number) => {
                          const stepText = getStringValue(step.smeAction || step.title || step.description)
                          const stepTime = getStringValue(step.timeframe)
                          const whyMatters = getStringValue(step.whyThisStepMatters)
                          const whatHappensIfSkipped = getStringValue(step.whatHappensIfSkipped)
                          const responsibility = getStringValue(step.responsibility)
                          const howToKnowDone = getStringValue(step.howToKnowItsDone)
                          const freeAlternative = getStringValue(step.freeAlternative)
                          const lowTechOption = getStringValue(step.lowTechOption)
                          const exampleOutput = getStringValue(step.exampleOutput)

                          return (
                            <li key={stepIdx} className="mb-4">
                              {/* Action Step Card */}
                              <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
                                {/* Header */}
                                <div className="bg-red-50 border-b border-gray-200 px-4 py-3">
                                  <div className="flex items-start gap-3">
                                    <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                                      {stepIdx + 1}
                                    </span>
                                    <div className="flex-1">
                                      <div className="font-bold text-gray-900 text-base leading-tight">{stepText}</div>
                                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-600">
                                        {stepTime && (
                                          <span className="flex items-center gap-1">
                                            <span className="text-sm">⏱️</span> {stepTime}
                                          </span>
                                        )}
                                        {responsibility && (
                                          <span className="flex items-center gap-1">
                                            <span className="text-sm">👤</span> {responsibility}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="px-4 py-3 space-y-3">
                                  {/* Why This Matters */}
                                  {whyMatters && (
                                    <div className="bg-red-50 border-l-4 border-red-400 pl-3 py-2">
                                      <div className="flex items-start gap-2">
                                        <span className="text-red-600 font-bold text-sm">💡 WHY:</span>
                                        <div className="text-sm text-gray-800 leading-relaxed">{whyMatters}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* What Happens If Skipped */}
                                  {whatHappensIfSkipped && (
                                    <div className="bg-orange-50 border-l-4 border-orange-400 pl-3 py-2">
                                      <div className="flex items-start gap-2">
                                        <span className="text-orange-600 font-bold text-sm">⚠️ IF SKIPPED:</span>
                                        <div className="text-sm text-orange-800 leading-relaxed">{whatHappensIfSkipped}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* How to Know It's Done */}
                                  {howToKnowDone && (
                                    <div className="bg-green-50 border-l-4 border-green-400 pl-3 py-2">
                                      <div className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold text-sm">✓ DONE WHEN:</span>
                                        <div className="text-sm text-green-800 leading-relaxed">{howToKnowDone}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Example */}
                                  {exampleOutput && (
                                    <div className="bg-gray-50 border border-gray-200 rounded p-3">
                                      <div className="flex items-start gap-2">
                                        <span className="text-gray-600 font-bold text-sm">📄 EXAMPLE:</span>
                                        <div className="text-sm text-gray-700 italic leading-relaxed">{exampleOutput}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Alternatives */}
                                  {(freeAlternative || lowTechOption) && (
                                    <div className="border-t border-gray-200 pt-3">
                                      <div className="text-xs font-semibold text-gray-700 mb-2">💰 ALTERNATIVES:</div>
                                      <div className="space-y-2">
                                        {freeAlternative && (
                                          <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border-l-2 border-yellow-300">
                                            <strong>Free/Low-Cost:</strong> {freeAlternative}
                                          </div>
                                        )}
                                        {lowTechOption && (
                                          <div className="text-xs text-gray-600 bg-purple-50 p-2 rounded border-l-2 border-purple-300">
                                            <strong>Low-Tech:</strong> {lowTechOption}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </li>
                          )
                        })}
                      </ol>
                    </div>
                  </div>
                )}
                
                {/* AFTER: Recovery & Return */}
                {afterSteps.length > 0 && (
                  <div className="mb-6">
                    <div className="bg-green-600 text-white p-3 mb-3">
                      <h3 className="text-xl font-black">🔄 AFTER: Recovery & Return</h3>
                      <p className="text-sm mt-1">Steps to restore operations and get back to business</p>
                    </div>
                    
                    <div className="ml-4">
                      <ol className="space-y-3">
                        {afterSteps.map((step: any, stepIdx: number) => {
                          const stepText = getStringValue(step.smeAction || step.title || step.description)
                          const stepTime = getStringValue(step.timeframe)
                          const whyMatters = getStringValue(step.whyThisStepMatters)
                          const whatHappensIfSkipped = getStringValue(step.whatHappensIfSkipped)
                          const responsibility = getStringValue(step.responsibility)
                          const howToKnowDone = getStringValue(step.howToKnowItsDone)
                          const freeAlternative = getStringValue(step.freeAlternative)
                          const lowTechOption = getStringValue(step.lowTechOption)
                          const exampleOutput = getStringValue(step.exampleOutput)

                          return (
                            <li key={stepIdx} className="mb-4">
                              {/* Action Step Card */}
                              <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
                                {/* Header */}
                                <div className="bg-green-50 border-b border-gray-200 px-4 py-3">
                                  <div className="flex items-start gap-3">
                                    <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                                      {stepIdx + 1}
                                    </span>
                                    <div className="flex-1">
                                      <div className="font-bold text-gray-900 text-base leading-tight">{stepText}</div>
                                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-600">
                                        {stepTime && (
                                          <span className="flex items-center gap-1">
                                            <span className="text-sm">⏱️</span> {stepTime}
                                          </span>
                                        )}
                                        {responsibility && (
                                          <span className="flex items-center gap-1">
                                            <span className="text-sm">👤</span> {responsibility}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="px-4 py-3 space-y-3">
                                  {/* Why This Matters */}
                                  {whyMatters && (
                                    <div className="bg-green-50 border-l-4 border-green-400 pl-3 py-2">
                                      <div className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold text-sm">💡 WHY:</span>
                                        <div className="text-sm text-gray-800 leading-relaxed">{whyMatters}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* What Happens If Skipped */}
                                  {whatHappensIfSkipped && (
                                    <div className="bg-red-50 border-l-4 border-red-400 pl-3 py-2">
                                      <div className="flex items-start gap-2">
                                        <span className="text-red-600 font-bold text-sm">⚠️ IF SKIPPED:</span>
                                        <div className="text-sm text-red-800 leading-relaxed">{whatHappensIfSkipped}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* How to Know It's Done */}
                                  {howToKnowDone && (
                                    <div className="bg-green-50 border-l-4 border-green-400 pl-3 py-2">
                                      <div className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold text-sm">✓ DONE WHEN:</span>
                                        <div className="text-sm text-green-800 leading-relaxed">{howToKnowDone}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Example */}
                                  {exampleOutput && (
                                    <div className="bg-gray-50 border border-gray-200 rounded p-3">
                                      <div className="flex items-start gap-2">
                                        <span className="text-gray-600 font-bold text-sm">📄 EXAMPLE:</span>
                                        <div className="text-sm text-gray-700 italic leading-relaxed">{exampleOutput}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Alternatives */}
                                  {(freeAlternative || lowTechOption) && (
                                    <div className="border-t border-gray-200 pt-3">
                                      <div className="text-xs font-semibold text-gray-700 mb-2">💰 ALTERNATIVES:</div>
                                      <div className="space-y-2">
                                        {freeAlternative && (
                                          <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border-l-2 border-yellow-300">
                                            <strong>Free/Low-Cost:</strong> {freeAlternative}
                                          </div>
                                        )}
                                        {lowTechOption && (
                                          <div className="text-xs text-gray-600 bg-purple-50 p-2 rounded border-l-2 border-purple-300">
                                            <strong>Low-Tech:</strong> {lowTechOption}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </li>
                          )
                        })}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : null}

      {/* ====================================================================== */}
      {/* SECTION 3: RISK-SPECIFIC ACTION PLANS */}
      {/* For each risk: BEFORE (prevention), DURING (response), AFTER (recovery) */}
      {/* ====================================================================== */}
      {(() => {
        return sortedRisks.map((risk: any, riskIdx: number) => {
          // Reset seen strategies for each risk (allow strategies to show under multiple risks)
          const seenStrategyIds = new Set<string>()
          const hazardId = risk.hazardId || risk.id
          const hazardName = getStringValue(risk.hazard || risk.Hazard || 'Risk')
          const riskScore = risk.riskScore || risk['Risk Score'] || 0
          const likelihood = risk.likelihood || risk.Likelihood || 'Unknown'
          const impact = risk.impact || risk.Impact || 'Unknown'
          const vulnerability = getStringValue(risk.vulnerability || risk.Vulnerability || '')
          const emoji = getRiskEmoji(hazardName)
          const severityBadge = getRiskSeverityBadge(riskScore)
          
          // Helper function to normalize risk identifiers for matching
          const normalizeRiskIdentifier = (id: string): string => {
            if (!id) return ''
            return id.toString()
              // Convert camelCase to snake_case (PowerOutage → power_outage)
              .replace(/([a-z])([A-Z])/g, '$1_$2')
              .toLowerCase()
              .replace(/[_\s-]+/g, '_')
              .replace(/[^a-z0-9_]/g, '')
              .replace(/_+/g, '_') // collapse multiple underscores
              .replace(/^_|_$/g, '') // remove leading/trailing underscores
              .trim()
          }
          
          // SIMPLE APPROACH: Use admin-configured risk-strategy relationships
          const matchingStrategies = riskSpecificStrategies.filter(s => {
            // Check if this strategy's applicableRisks includes the current hazard
            const applicableRisks = parseApplicableRisks(s.applicableRisks)
            const strategyId = s.id || s.strategyId || ''

            // Skip if already shown or no applicable risks configured
            if (seenStrategyIds.has(strategyId) || applicableRisks.length === 0) return false

            // Check if strategy applies to this specific risk (admin-configured)
            const matchesThisRisk = applicableRisks.some((riskId: string) =>
              riskId === hazardId || riskId === hazardName?.toLowerCase().replace(/\s+/g, '_')
            )

            if (matchesThisRisk) {
              seenStrategyIds.add(strategyId)
              return true
            }

            return false
          })
        
        // Extract steps by execution timing from matching strategies (using getStepTiming defined above)
        // CRITICAL: Ensure we only include risk-specific strategies (exclude generic ones)
        const beforeStrategies = matchingStrategies
          .filter(s => {
            const applicableRisks = parseApplicableRisks(s.applicableRisks)
            return applicableRisks.length > 0 && !applicableRisks.includes('all_hazards')
          })
          .map(s => ({
            ...s,
            actionSteps: s.actionSteps?.filter((step: any) => getStepTiming(step) === 'before') || []
          }))
          .filter(s => s.actionSteps.length > 0)
        
        const duringStrategies = matchingStrategies
          .filter(s => {
            const applicableRisks = parseApplicableRisks(s.applicableRisks)
            return applicableRisks.length > 0 && !applicableRisks.includes('all_hazards')
          })
          .map(s => ({
            ...s,
            actionSteps: s.actionSteps?.filter((step: any) => getStepTiming(step) === 'during') || []
          }))
          .filter(s => s.actionSteps.length > 0)
        
        const afterStrategies = matchingStrategies
          .filter(s => {
            const applicableRisks = parseApplicableRisks(s.applicableRisks)
            return applicableRisks.length > 0 && !applicableRisks.includes('all_hazards')
          })
          .map(s => ({
            ...s,
            actionSteps: s.actionSteps?.filter((step: any) => getStepTiming(step) === 'after') || []
          }))
          .filter(s => s.actionSteps.length > 0)
        
        return (
          <div key={riskIdx} className="p-8 page-break-after">
            {/* Risk Header */}
            <div className="border-4 border-gray-800 p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-4xl font-black text-gray-900">
                  {emoji} {hazardName}
                </h1>
                <div className={`px-4 py-2 rounded text-xl font-black ${severityBadge.color}`}>
                  {severityBadge.label}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-base mt-4 border-t-2 border-gray-300 pt-4">
                <div>
                  <span className="font-bold text-gray-700">Risk Score:</span> {typeof riskScore === 'number' ? riskScore.toFixed(1) : riskScore}/10
                </div>
                <div>
                  <span className="font-bold text-gray-700">Likelihood:</span> {likelihood}
                </div>
                <div>
                  <span className="font-bold text-gray-700">Impact:</span> {impact}
                </div>
              </div>
              {vulnerability && (
                <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
                  <span className="font-bold text-gray-700">Why This Matters to Us:</span> {vulnerability}
                </div>
              )}
            </div>

            {/* BEFORE: Prevention & Preparation */}
            <div className="mb-6">
              <div className="bg-blue-600 text-white p-3 mb-3">
                <h2 className="text-2xl font-black">🛡️ BEFORE: Prevention & Preparation</h2>
                <p className="text-sm mt-1">Do these things NOW to reduce risk and prepare for potential impact</p>
              </div>
              
              {beforeStrategies.length > 0 ? (
                <div className="space-y-4">
                  {beforeStrategies
                    .filter(strategy => {
                      // CRITICAL: Exclude generic strategies from risk-specific sections
                      const applicableRisks = parseApplicableRisks(strategy.applicableRisks)
                      return applicableRisks.length > 0 && !applicableRisks.includes('all_hazards')
                    })
                    .map((strategy, sIdx) => {
                    const stratName = getStringValue(strategy.smeTitle || strategy.name)
                    const stratDesc = getStringValue(strategy.smeSummary || strategy.description)
                    const stratCost = strategy.calculatedCostLocal || 0
                    const stratTime = strategy.calculatedHours 
                      ? formatHoursToDisplay(strategy.calculatedHours)
                      : calculateStrategyTimeFromSteps(strategy.actionSteps) 
                        ? formatHoursToDisplay(calculateStrategyTimeFromSteps(strategy.actionSteps))
                        : 'TBD'
                    const isEssential = strategy.priorityLevel === 'essential'
                    
                    return (
                      <div key={sIdx} className={`border-2 ${isEssential ? 'border-red-400 bg-red-50' : 'border-blue-300 bg-blue-50'} p-4`}>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900 flex-1">
                            {isEssential && <span className="text-red-600">⚠️ ESSENTIAL: </span>}
                            {stratName}
                          </h3>
                          <div className="text-right text-sm ml-4">
                            <div className="font-bold text-blue-900">{formatCurrency(stratCost, currencySymbol)}</div>
                            <div className="text-gray-600">{stratTime}</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{stratDesc}</p>
                        
                        {/* Action Steps */}
                        {strategy.actionSteps && strategy.actionSteps.length > 0 && (
                          <div className="ml-4">
                            <div className="font-bold text-sm text-gray-800 mb-2">Action Steps:</div>
                            <ol className="space-y-3">
                              {strategy.actionSteps
                                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                                .map((step, stepIdx) => {
                                  const stepText = getStringValue(step.smeAction || step.title || step.description)
                                  const stepTime = getStringValue(step.timeframe)
                                  const whyMatters = getStringValue(step.whyThisStepMatters)
                                  const resources = safeParseJson(step.resources)
                                  const checklist = safeParseJson(step.checklist)
                                  const commonMistakes = safeParseJson(step.commonMistakesForStep)
                                  const howToKnowDone = getStringValue(step.howToKnowItsDone)
                                  const responsibility = getStringValue(step.responsibility)
                                  const whatHappensIfSkipped = getStringValue(step.whatHappensIfSkipped)
                                  const freeAlternative = getStringValue(step.freeAlternative)
                                  const lowTechOption = getStringValue(step.lowTechOption)
                                  const exampleOutput = getStringValue(step.exampleOutput)
                                  
                                  return (
                                    <li key={stepIdx} className="border-l-4 border-blue-400 pl-3 pb-2">
                                      <div className="flex items-start gap-2 mb-1">
                                        <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                          {stepIdx + 1}
                                        </span>
                                        <div className="flex-1">
                                          <div className="font-semibold text-gray-900">{stepText}</div>
                                          {stepTime && (
                                            <div className="text-xs text-gray-600 mt-0.5">
                                              ⏱️ {stepTime}
                                              {responsibility && ` • Responsible: ${responsibility}`}
                                            </div>
                                          )}
                                          {whyMatters && (
                                            <div className="text-xs text-blue-700 mt-1 italic">
                                              💡 Why: {whyMatters}
                                            </div>
                                          )}
                                          {whatHappensIfSkipped && (
                                            <div className="text-xs text-orange-700 mt-1">
                                              ⚠️ If skipped: {whatHappensIfSkipped}
                                            </div>
                                          )}
                                          {howToKnowDone && (
                                            <div className="text-xs text-green-700 mt-1">
                                              ✓ Done when: {howToKnowDone}
                                            </div>
                                          )}
                                          {exampleOutput && (
                                            <div className="text-xs text-gray-600 mt-1 italic">
                                              📄 Example: {exampleOutput}
                                            </div>
                                          )}
                                          {resources.length > 0 && (
                                            <div className="text-xs text-gray-600 mt-1">
                                              📦 Resources needed: {resources.map((r: any) => getStringValue(r)).join(', ')}
                                            </div>
                                          )}
                                          {checklist.length > 0 && (
                                            <div className="mt-2 ml-4">
                                              <div className="text-xs font-semibold text-gray-700 mb-1">Checklist:</div>
                                              <ul className="space-y-0.5">
                                                {checklist.map((item: any, cIdx: number) => (
                                                  <li key={cIdx} className="text-xs text-gray-600 flex items-start gap-1">
                                                    <span className="text-gray-400">□</span>
                                                    <span>{getStringValue(item)}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          {commonMistakes.length > 0 && (
                                            <div className="mt-2 ml-4">
                                              <div className="text-xs font-semibold text-red-700 mb-1">⚠️ Avoid:</div>
                                              <ul className="space-y-0.5">
                                                {commonMistakes.map((mistake: any, mIdx: number) => (
                                                  <li key={mIdx} className="text-xs text-red-600">
                                                    • {getStringValue(mistake)}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          {freeAlternative && (
                                            <div className="mt-2 ml-4 p-2 bg-green-50 border-l-2 border-green-400">
                                              <div className="text-xs font-semibold text-green-700 mb-1">💰 Free/Low-Cost Option:</div>
                                              <div className="text-xs text-green-800">{freeAlternative}</div>
                                            </div>
                                          )}
                                          {lowTechOption && (
                                            <div className="mt-2 ml-4 p-2 bg-blue-50 border-l-2 border-blue-400">
                                              <div className="text-xs font-semibold text-blue-700 mb-1">🔧 Low-Tech Option:</div>
                                              <div className="text-xs text-blue-800">{lowTechOption}</div>
                                            </div>
                                          )}
                                        </div>
                                        <span className="flex-shrink-0 w-6 h-6 border-2 border-gray-400 rounded mt-1"></span>
                                      </div>
                                    </li>
                                  )
                                })}
                            </ol>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="border-2 border-gray-300 bg-gray-50 p-4 text-center text-gray-600">
                  No specific prevention strategies assigned for this risk yet.<br/>
                  Review general preparedness measures in the Implementation Checklist section.
                </div>
              )}
            </div>

            {/* DURING: Emergency Response */}
            <div className="mb-6">
              <div className="bg-red-600 text-white p-3 mb-3">
                <h2 className="text-2xl font-black">🚨 DURING: Emergency Response</h2>
                <p className="text-sm mt-1">Follow these steps when this emergency is happening NOW</p>
              </div>
              
              {duringStrategies.length > 0 ? (
                <div className="space-y-4">
                  {duringStrategies
                    .filter(strategy => {
                      // CRITICAL: Exclude generic strategies from risk-specific sections
                      const applicableRisks = parseApplicableRisks(strategy.applicableRisks)
                      return applicableRisks.length > 0 && !applicableRisks.includes('all_hazards')
                    })
                    .map((strategy, sIdx) => {
                    const stratName = getStringValue(strategy.smeTitle || strategy.name)
                    const stratDesc = getStringValue(strategy.smeSummary || strategy.description)
                    
                    return (
                      <div key={sIdx} className="border-2 border-red-400 bg-red-50 p-4">
                        <h3 className="text-lg font-bold text-red-900 mb-2">{stratName}</h3>
                        <p className="text-sm text-gray-700 mb-3">{stratDesc}</p>
                        
                        {/* Action Steps */}
                        {strategy.actionSteps && strategy.actionSteps.length > 0 && (
                          <div className="ml-4">
                            <ol className="space-y-3">
                              {strategy.actionSteps
                                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                                .map((step, stepIdx) => {
                                  const stepText = getStringValue(step.smeAction || step.title || step.description)
                                  const stepTime = getStringValue(step.timeframe)
                                  const whyMatters = getStringValue(step.whyThisStepMatters)
                                  const whatHappensIfSkipped = getStringValue(step.whatHappensIfSkipped)
                                  const resources = safeParseJson(step.resources)
                                  const checklist = safeParseJson(step.checklist)
                                  const commonMistakes = safeParseJson(step.commonMistakesForStep)
                                  const responsibility = getStringValue(step.responsibility)
                                  
                                  return (
                                    <li key={stepIdx} className="border-l-4 border-red-400 pl-3 pb-2">
                                      <div className="flex items-start gap-2 mb-1">
                                        <span className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                          {stepIdx + 1}
                                        </span>
                                        <div className="flex-1">
                                          <div className="font-semibold text-gray-900">{stepText}</div>
                                          {stepTime && (
                                            <div className="text-xs text-gray-600 mt-0.5">
                                              ⏱️ {stepTime}
                                              {responsibility && ` • Responsible: ${responsibility}`}
                                            </div>
                                          )}
                                          {whyMatters && (
                                            <div className="text-xs text-red-700 mt-1 italic">💡 {whyMatters}</div>
                                          )}
                                          {whatHappensIfSkipped && (
                                            <div className="text-xs text-orange-700 mt-1">⚠️ If skipped: {whatHappensIfSkipped}</div>
                                          )}
                                          {resources.length > 0 && (
                                            <div className="text-xs text-gray-600 mt-1">
                                              📦 Need: {resources.map((r: any) => getStringValue(r)).join(', ')}
                                            </div>
                                          )}
                                          {checklist.length > 0 && (
                                            <div className="mt-2 ml-4">
                                              <div className="text-xs font-semibold text-gray-700 mb-1">Checklist:</div>
                                              <ul className="space-y-0.5">
                                                {checklist.map((item: any, cIdx: number) => (
                                                  <li key={cIdx} className="text-xs text-gray-600 flex items-start gap-1">
                                                    <span className="text-gray-400">□</span>
                                                    <span>{getStringValue(item)}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          {commonMistakes.length > 0 && (
                                            <div className="mt-2 ml-4">
                                              <div className="text-xs font-semibold text-red-700 mb-1">⚠️ Avoid:</div>
                                              <ul className="space-y-0.5">
                                                {commonMistakes.map((mistake: any, mIdx: number) => (
                                                  <li key={mIdx} className="text-xs text-red-600">• {getStringValue(mistake)}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </li>
                                  )
                                })}
                            </ol>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="border-2 border-gray-300 bg-gray-50 p-4">
                  <div className="font-bold text-gray-800 mb-2">General Emergency Response:</div>
                  <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                    <li>Ensure all staff and visitors are safe - evacuate if necessary</li>
                    <li>Contact emergency services if needed: {emergencyContacts[0] ? getStringValue(emergencyContacts[0]['Phone Number'] || emergencyContacts[0].phoneNumber) : '911'}</li>
                    <li>Alert Plan Manager: {planManager} - {planManagerPhone || planManagerEmail}
                    {alternateManager && alternateManager !== 'N/A' && alternateContact && ` (Backup: ${alternateManager})`}
                    </li>
                    <li>Communicate with staff using contact list</li>
                    <li>Document the situation (photos, notes, timeline)</li>
                    <li>Contact insurance provider as soon as safe to do so</li>
                    <li>Begin recording in Incident Log</li>
                  </ol>
                </div>
              )}
            </div>

            {/* AFTER: Recovery */}
            <div className="mb-6">
              <div className="bg-green-600 text-white p-3 mb-3">
                <h2 className="text-2xl font-black">🔄 AFTER: Recovery & Return</h2>
                <p className="text-sm mt-1">Steps to restore operations and get back to business</p>
              </div>
              
              {afterStrategies.length > 0 ? (
                <div className="space-y-4">
                  {afterStrategies
                    .filter(strategy => {
                      // CRITICAL: Exclude generic strategies from risk-specific sections
                      const applicableRisks = parseApplicableRisks(strategy.applicableRisks)
                      return applicableRisks.length > 0 && !applicableRisks.includes('all_hazards')
                    })
                    .map((strategy, sIdx) => {
                    const stratName = getStringValue(strategy.smeTitle || strategy.name)
                    const stratDesc = getStringValue(strategy.smeSummary || strategy.description)
                    const stratCost = strategy.calculatedCostLocal || 0
                    
                    return (
                      <div key={sIdx} className="border-2 border-green-400 bg-green-50 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-green-900 flex-1">{stratName}</h3>
                          {stratCost > 0 && (
                            <div className="text-sm font-bold text-green-900 ml-4">
                              {formatCurrency(stratCost, currencySymbol)}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{stratDesc}</p>
                        
                        {/* Action Steps */}
                        {strategy.actionSteps && strategy.actionSteps.length > 0 && (
                          <div className="ml-4">
                            <ol className="space-y-3">
                              {strategy.actionSteps
                                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                                .map((step, stepIdx) => {
                                  const stepText = getStringValue(step.smeAction || step.title || step.description)
                                  const stepTime = getStringValue(step.timeframe)
                                  const whyMatters = getStringValue(step.whyThisStepMatters)
                                  const whatHappensIfSkipped = getStringValue(step.whatHappensIfSkipped)
                                  const resources = safeParseJson(step.resources)
                                  const checklist = safeParseJson(step.checklist)
                                  const commonMistakes = safeParseJson(step.commonMistakesForStep)
                                  const howToKnowDone = getStringValue(step.howToKnowItsDone)
                                  const responsibility = getStringValue(step.responsibility)
                                  const exampleOutput = getStringValue(step.exampleOutput)
                                  const freeAlternative = getStringValue(step.freeAlternative)
                                  const lowTechOption = getStringValue(step.lowTechOption)
                                  
                                  return (
                                    <li key={stepIdx} className="border-l-4 border-green-400 pl-3 pb-2">
                                      <div className="flex items-start gap-2 mb-1">
                                        <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                          {stepIdx + 1}
                                        </span>
                                        <div className="flex-1">
                                          <div className="font-semibold text-gray-900">{stepText}</div>
                                          {stepTime && (
                                            <div className="text-xs text-gray-600 mt-0.5">
                                              ⏱️ {stepTime}
                                              {responsibility && ` • Responsible: ${responsibility}`}
                                            </div>
                                          )}
                                          {whyMatters && (
                                            <div className="text-xs text-green-700 mt-1 italic">💡 {whyMatters}</div>
                                          )}
                                          {whatHappensIfSkipped && (
                                            <div className="text-xs text-orange-700 mt-1">⚠️ If skipped: {whatHappensIfSkipped}</div>
                                          )}
                                          {howToKnowDone && (
                                            <div className="text-xs text-green-700 mt-1">✓ {howToKnowDone}</div>
                                          )}
                                          {exampleOutput && (
                                            <div className="text-xs text-gray-600 mt-1 italic">📄 Example: {exampleOutput}</div>
                                          )}
                                          {resources.length > 0 && (
                                            <div className="text-xs text-gray-600 mt-1">
                                              📦 Need: {resources.map((r: any) => getStringValue(r)).join(', ')}
                                            </div>
                                          )}
                                          {checklist.length > 0 && (
                                            <div className="mt-2 ml-4">
                                              <div className="text-xs font-semibold text-gray-700 mb-1">Checklist:</div>
                                              <ul className="space-y-0.5">
                                                {checklist.map((item: any, cIdx: number) => (
                                                  <li key={cIdx} className="text-xs text-gray-600 flex items-start gap-1">
                                                    <span className="text-gray-400">□</span>
                                                    <span>{getStringValue(item)}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          {commonMistakes.length > 0 && (
                                            <div className="mt-2 ml-4">
                                              <div className="text-xs font-semibold text-red-700 mb-1">⚠️ Avoid:</div>
                                              <ul className="space-y-0.5">
                                                {commonMistakes.map((mistake: any, mIdx: number) => (
                                                  <li key={mIdx} className="text-xs text-red-600">• {getStringValue(mistake)}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          {freeAlternative && (
                                            <div className="mt-2 ml-4 p-2 bg-green-50 border-l-2 border-green-400">
                                              <div className="text-xs font-semibold text-green-700 mb-1">💰 Free/Low-Cost Option:</div>
                                              <div className="text-xs text-green-800">{freeAlternative}</div>
                                            </div>
                                          )}
                                          {lowTechOption && (
                                            <div className="mt-2 ml-4 p-2 bg-blue-50 border-l-2 border-blue-400">
                                              <div className="text-xs font-semibold text-blue-700 mb-1">🔧 Low-Tech Option:</div>
                                              <div className="text-xs text-blue-800">{lowTechOption}</div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </li>
                                  )
                                })}
                            </ol>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="border-2 border-gray-300 bg-gray-50 p-4">
                  <div className="font-bold text-gray-800 mb-2">General Recovery Steps:</div>
                  <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                    <li>Assess and document all damage thoroughly</li>
                    <li>File insurance claims with documentation</li>
                    <li>Determine timeline for repairs/replacements</li>
                    <li>Communicate status updates to customers and stakeholders</li>
                    <li>Restore critical systems first, then supporting systems</li>
                    <li>Conduct lessons-learned meeting and update this plan</li>
                    <li>Thank staff and recognize their efforts</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Related Contacts for This Risk */}
            <div className="border-2 border-gray-400 bg-gray-50 p-4">
              <h3 className="font-bold text-gray-900 mb-2">📞 Key Contacts for {hazardName}:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-semibold">Emergency:</span> {emergencyContacts[0] ? getStringValue(emergencyContacts[0]['Phone Number'] || emergencyContacts[0].phoneNumber) : 'See contacts'}
                </div>
                <div>
                  <span className="font-semibold">Plan Manager:</span> {planManagerPhone || planManagerEmail}
                  {alternateManager && alternateManager !== 'N/A' && alternateContact && (
                    <div className="mt-0.5 text-xs">
                      <span className="font-semibold">Alternate:</span> {alternateContact}
                    </div>
                  )}
                </div>
                {insuranceContacts[0] && (
                  <div>
                    <span className="font-semibold">Insurance:</span> {getStringValue(insuranceContacts[0]['Phone Number'] || insuranceContacts[0].phoneNumber)}
                  </div>
                )}
                {utilitiesContacts[0] && (
                  <div>
                    <span className="font-semibold">Utilities:</span> {getStringValue(utilitiesContacts[0]['Phone Number'] || utilitiesContacts[0].phoneNumber)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
        })
      })()}

      {/* ====================================================================== */}
      {/* SECTION 4: ESSENTIAL FUNCTIONS RECOVERY PRIORITIES */}
      {/* Critical operations that must be restored first */}
      {/* ====================================================================== */}
      {essentialFunctions.length > 0 && (
        <div className="p-8 page-break-after">
          <div className="border-4 border-purple-600 p-4 mb-6">
            <h1 className="text-4xl font-black text-purple-900">
              ⚡ ESSENTIAL FUNCTIONS RECOVERY PLAN
            </h1>
            <p className="text-lg mt-2 text-purple-700">
              These are our most critical operations - Restore these FIRST after any disruption
            </p>
          </div>

          <div className="space-y-4">
            {essentialFunctions.map((fn: any, idx: number) => {
              const priorityColor = fn.priority === 'critical' ? 'bg-red-100 border-red-400' :
                                   fn.priority === 'high' ? 'bg-orange-100 border-orange-400' :
                                   'bg-yellow-100 border-yellow-400'
              const priorityLabel = fn.priority === 'critical' ? '🔴 CRITICAL' :
                                   fn.priority === 'high' ? '🟠 HIGH' :
                                   '🟡 MEDIUM'
              
              return (
                <div key={idx} className={`border-4 ${priorityColor} p-4`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-black">{idx + 1}.</span>
                        <h3 className="text-xl font-black text-gray-900">{fn.name}</h3>
                        <span className="text-sm font-bold px-2 py-1 rounded bg-white">{priorityLabel}</span>
                      </div>
                      {fn.description && (
                        <p className="text-sm text-gray-700 mt-1">{fn.description}</p>
                      )}
                    </div>
                    {fn.maxDowntime && fn.maxDowntime !== 'TBD' && (
                      <div className="ml-4 text-right">
                        <div className="text-xs font-semibold text-gray-600">Max Downtime</div>
                        <div className="text-lg font-black text-red-600">{fn.maxDowntime}</div>
                      </div>
                    )}
                  </div>
                  {fn.resources && (
                    <div className="mt-3 pt-3 border-t-2 border-gray-300">
                      <div className="text-xs font-semibold text-gray-700 mb-1">Critical Resources Needed:</div>
                      <div className="text-sm text-gray-800">{fn.resources}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-6 border-2 border-purple-300 bg-purple-50 p-4">
            <h3 className="font-black text-purple-900 mb-2">📋 Recovery Priority Guide:</h3>
            <ul className="space-y-1 text-sm text-purple-800">
              <li><strong>🔴 CRITICAL:</strong> Restore immediately (0-2 hours) - Business cannot operate without these</li>
              <li><strong>🟠 HIGH:</strong> Restore within 4-8 hours - Significant impact if delayed</li>
              <li><strong>🟡 MEDIUM:</strong> Restore within 24-48 hours - Important but not immediately critical</li>
            </ul>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* SECTION 4: IMPLEMENTATION CHECKLIST */}
      {/* Track progress on prevention strategies */}
      {/* ====================================================================== */}
      <div className="p-8 page-break-after">
        <div className="border-4 border-blue-600 p-4 mb-6">
          <h1 className="text-4xl font-black text-blue-900">
            ✅ IMPLEMENTATION CHECKLIST
          </h1>
          <p className="text-lg mt-2 text-blue-700">
            Track your progress on prevention strategies - Check off as you complete each item
          </p>
        </div>

        {/* Budget Summary */}
        <div className="border-2 border-gray-400 bg-blue-50 p-4 mb-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-black text-blue-900">{strategies.length}</div>
              <div className="text-sm text-gray-700">Total Strategies</div>
            </div>
            <div>
              <div className="text-2xl font-black text-red-600">{essentialStrategies.length}</div>
              <div className="text-sm text-gray-700">Essential</div>
            </div>
            <div>
              <div className="text-2xl font-black text-orange-600">{recommendedStrategies.length}</div>
              <div className="text-sm text-gray-700">Recommended</div>
            </div>
            <div>
              <div className="text-2xl font-black text-blue-900">{formatCurrency(totalInvestment, currencySymbol)}</div>
              <div className="text-sm text-gray-700">Total Budget ({currencyCode})</div>
            </div>
          </div>
        </div>

        {/* Essential Strategies */}
        {essentialStrategies.length > 0 && (
          <div className="mb-6">
            <div className="bg-red-600 text-white p-3 mb-3">
              <h2 className="text-2xl font-black">⚠️ ESSENTIAL STRATEGIES - Do These First!</h2>
            </div>
            <div className="space-y-3">
              {essentialStrategies.map((strategy, idx) => {
                const stratName = getStringValue(strategy.smeTitle || strategy.name)
                const stratCost = strategy.calculatedCostLocal || 0
                const stratTime = strategy.calculatedHours 
                  ? formatHoursToDisplay(strategy.calculatedHours)
                  : calculateStrategyTimeFromSteps(strategy.actionSteps)
                    ? formatHoursToDisplay(calculateStrategyTimeFromSteps(strategy.actionSteps))
                    : 'TBD'
                const stepCount = strategy.actionSteps?.length || 0
                
                return (
                  <div key={idx} className="border-2 border-red-400 bg-white p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 border-4 border-red-600 rounded flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{stratName}</div>
                        <div className="text-sm text-gray-600">
                          {stepCount} steps • {stratTime} • {formatCurrency(stratCost, currencySymbol)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recommended Strategies */}
        {recommendedStrategies.length > 0 && (
          <div className="mb-6">
            <div className="bg-orange-500 text-white p-3 mb-3">
              <h2 className="text-2xl font-black">📋 RECOMMENDED STRATEGIES</h2>
            </div>
            <div className="space-y-3">
              {recommendedStrategies.map((strategy, idx) => {
                const stratName = getStringValue(strategy.smeTitle || strategy.name)
                const stratCost = strategy.calculatedCostLocal || 0
                const stratTime = strategy.calculatedHours 
                  ? formatHoursToDisplay(strategy.calculatedHours)
                  : calculateStrategyTimeFromSteps(strategy.actionSteps)
                    ? formatHoursToDisplay(calculateStrategyTimeFromSteps(strategy.actionSteps))
                    : 'TBD'
                const stepCount = strategy.actionSteps?.length || 0
                
                return (
                  <div key={idx} className="border-2 border-orange-300 bg-white p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 border-4 border-orange-500 rounded flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{stratName}</div>
                        <div className="text-sm text-gray-600">
                          {stepCount} steps • {stratTime} • {formatCurrency(stratCost, currencySymbol)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Optional Strategies */}
        {optionalStrategies.length > 0 && (
          <div className="mb-6">
            <div className="bg-gray-500 text-white p-3 mb-3">
              <h2 className="text-2xl font-black">💡 OPTIONAL ENHANCEMENTS</h2>
            </div>
            <div className="space-y-3">
              {optionalStrategies.map((strategy, idx) => {
                const stratName = getStringValue(strategy.smeTitle || strategy.name)
                const stratCost = strategy.calculatedCostLocal || 0
                const stratTime = strategy.calculatedHours 
                  ? formatHoursToDisplay(strategy.calculatedHours)
                  : calculateStrategyTimeFromSteps(strategy.actionSteps)
                    ? formatHoursToDisplay(calculateStrategyTimeFromSteps(strategy.actionSteps))
                    : 'TBD'
                const stepCount = strategy.actionSteps?.length || 0
                
                return (
                  <div key={idx} className="border-2 border-gray-300 bg-white p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 border-4 border-gray-400 rounded flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{stratName}</div>
                        <div className="text-sm text-gray-600">
                          {stepCount} steps • {stratTime} • {formatCurrency(stratCost, currencySymbol)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Progress Tracker */}
        <div className="border-4 border-blue-600 bg-blue-50 p-4 mt-6">
          <h3 className="text-xl font-black text-blue-900 mb-3">📊 Track Your Progress:</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-gray-400 rounded flex-shrink-0"></div>
              <span>Not Started</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-gray-400 rounded flex-shrink-0 relative">
                <div className="absolute inset-0 bg-yellow-400 opacity-50"></div>
              </div>
              <span>In Progress (shade in partially)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-gray-400 rounded flex-shrink-0 relative">
                <div className="absolute inset-1">
                  <svg className="w-full h-full" viewBox="0 0 20 20">
                    <path d="M3 10 L8 15 L17 4" stroke="green" strokeWidth="3" fill="none"/>
                  </svg>
                </div>
              </div>
              <span>Completed (check it off!)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* SECTION 5: CONTACT DIRECTORY */}
      {/* All contacts organized by category */}
      {/* ====================================================================== */}
      <div className="p-8 page-break-after">
        <div className="border-4 border-green-600 p-4 mb-6">
          <h1 className="text-4xl font-black text-green-900">
            📞 CONTACT DIRECTORY
          </h1>
          <p className="text-lg mt-2 text-green-700">
            All key contacts in one place - Keep this information current!
          </p>
        </div>

        {/* Emergency Services */}
        {emergencyContacts.length > 0 && (
          <div className="mb-6">
            <div className="bg-red-600 text-white p-2 mb-2">
              <h2 className="text-xl font-black">🚨 EMERGENCY SERVICES</h2>
            </div>
            <div className="border-2 border-red-300 bg-red-50">
              <table className="w-full">
                <thead className="bg-red-100">
                  <tr>
                    <th className="text-left p-2 text-sm font-bold border-b border-red-300">Service</th>
                    <th className="text-left p-2 text-sm font-bold border-b border-red-300">Organization</th>
                    <th className="text-left p-2 text-sm font-bold border-b border-red-300">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencyContacts.map((contact: any, idx: number) => (
                    <tr key={idx} className="border-b border-red-200">
                      <td className="p-2 text-sm font-semibold">
                        {getStringValue(contact['Service Type'] || contact.serviceType || 'Emergency')}
                      </td>
                      <td className="p-2 text-sm">
                        {getStringValue(contact['Organization Name'] || contact.organizationName || contact.name)}
                      </td>
                      <td className="p-2 text-sm font-mono font-bold">
                        {getStringValue(contact['Phone Number'] || contact.phoneNumber || contact.phone)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Staff Contacts */}
        {staffContactsRaw.length > 0 && (
          <div className="mb-6">
            <div className="bg-blue-600 text-white p-2 mb-2">
              <h2 className="text-xl font-black">👥 STAFF CONTACTS</h2>
            </div>
            <div className="border-2 border-blue-300">
              <table className="w-full text-xs">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="text-left p-2 font-bold border-b border-blue-300">Name</th>
                    <th className="text-left p-2 font-bold border-b border-blue-300">Position</th>
                    <th className="text-left p-2 font-bold border-b border-blue-300">Phone</th>
                    <th className="text-left p-2 font-bold border-b border-blue-300">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {staffContactsRaw.map((contact: any, idx: number) => (
                    <tr key={idx} className="border-b border-blue-200">
                      <td className="p-2 font-semibold">
                        {getStringValue(contact.Name || contact.name)}
                      </td>
                      <td className="p-2">
                        {getStringValue(contact.Position || contact.position || contact.Role || contact.role)}
                      </td>
                      <td className="p-2 font-mono">
                        {getStringValue(contact['Mobile Phone'] || contact.Phone || contact.phone)}
                      </td>
                      <td className="p-2">
                        {getStringValue(contact['Email Address'] || contact.Email || contact.email)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Utilities */}
        {utilitiesContacts.length > 0 && (
          <div className="mb-6">
            <div className="bg-yellow-600 text-white p-2 mb-2">
              <h2 className="text-xl font-black">⚡ UTILITIES & ESSENTIAL SERVICES</h2>
            </div>
            <div className="border-2 border-yellow-300">
              <table className="w-full text-xs">
                <thead className="bg-yellow-100">
                  <tr>
                    <th className="text-left p-2 font-bold border-b border-yellow-300">Service</th>
                    <th className="text-left p-2 font-bold border-b border-yellow-300">Provider</th>
                    <th className="text-left p-2 font-bold border-b border-yellow-300">Phone</th>
                    <th className="text-left p-2 font-bold border-b border-yellow-300">Account #</th>
                  </tr>
                </thead>
                <tbody>
                  {utilitiesContacts.map((contact: any, idx: number) => (
                    <tr key={idx} className="border-b border-yellow-200">
                      <td className="p-2 font-semibold">
                        {getStringValue(contact['Service Type'] || contact.serviceType || contact.service)}
                      </td>
                      <td className="p-2">
                        {getStringValue(contact['Organization Name'] || contact.organizationName || contact.provider)}
                      </td>
                      <td className="p-2 font-mono">
                        {getStringValue(contact['Phone Number'] || contact.phoneNumber || contact.phone)}
                      </td>
                      <td className="p-2 font-mono">
                        {getStringValue(contact['Account Number'] || contact.accountNumber || contact.account)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Suppliers */}
        {suppliersRaw.length > 0 && (
          <div className="mb-6">
            <div className="bg-purple-600 text-white p-2 mb-2">
              <h2 className="text-xl font-black">📦 KEY SUPPLIERS</h2>
            </div>
            <div className="border-2 border-purple-300">
              <table className="w-full text-xs">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="text-left p-2 font-bold border-b border-purple-300">Supplier</th>
                    <th className="text-left p-2 font-bold border-b border-purple-300">Contact</th>
                    <th className="text-left p-2 font-bold border-b border-purple-300">Product/Service</th>
                    <th className="text-left p-2 font-bold border-b border-purple-300">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliersRaw.map((supplier: any, idx: number) => (
                    <tr key={idx} className="border-b border-purple-200">
                      <td className="p-2 font-semibold">
                        {getStringValue(supplier.Name || supplier.name || supplier['Supplier Name'])}
                      </td>
                      <td className="p-2">
                        {getStringValue(supplier['Contact Person'] || supplier.contactPerson || supplier.contact)}
                      </td>
                      <td className="p-2">
                        {getStringValue(supplier.Service || supplier.service || supplier['Goods/Services Supplied'])}
                      </td>
                      <td className="p-2 font-mono">
                        {getStringValue(supplier.Phone || supplier.phone || supplier['Phone Number'])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Insurance & Banking */}
        {(insuranceContacts.length > 0 || bankingContacts.length > 0) && (
          <div className="mb-6">
            <div className="bg-green-600 text-white p-2 mb-2">
              <h2 className="text-xl font-black">💼 INSURANCE & BANKING</h2>
            </div>
            <div className="border-2 border-green-300">
              <table className="w-full text-xs">
                <thead className="bg-green-100">
                  <tr>
                    <th className="text-left p-2 font-bold border-b border-green-300">Type</th>
                    <th className="text-left p-2 font-bold border-b border-green-300">Company/Bank</th>
                    <th className="text-left p-2 font-bold border-b border-green-300">Phone</th>
                    <th className="text-left p-2 font-bold border-b border-green-300">Account/Policy #</th>
                  </tr>
                </thead>
                <tbody>
                  {insuranceContacts.map((contact: any, idx: number) => (
                    <tr key={`ins-${idx}`} className="border-b border-green-200">
                      <td className="p-2 font-semibold">
                        {getStringValue(contact['Service Type'] || contact.serviceType || 'Insurance')}
                      </td>
                      <td className="p-2">
                        {getStringValue(contact['Organization Name'] || contact.organizationName || contact.company)}
                      </td>
                      <td className="p-2 font-mono">
                        {getStringValue(contact['Phone Number'] || contact.phoneNumber || contact.phone)}
                      </td>
                      <td className="p-2 font-mono">
                        {getStringValue(contact['Account Number'] || contact.accountNumber || contact.policy)}
                      </td>
                    </tr>
                  ))}
                  {bankingContacts.map((contact: any, idx: number) => (
                    <tr key={`bank-${idx}`} className="border-b border-green-200">
                      <td className="p-2 font-semibold">
                        {getStringValue(contact['Service Type'] || contact.serviceType || 'Banking')}
                      </td>
                      <td className="p-2">
                        {getStringValue(contact['Organization Name'] || contact.organizationName || contact.bank)}
                      </td>
                      <td className="p-2 font-mono">
                        {getStringValue(contact['Phone Number'] || contact.phoneNumber || contact.phone)}
                      </td>
                      <td className="p-2 font-mono">
                        {getStringValue(contact['Account Number'] || contact.accountNumber || contact.account)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================== */}
      {/* SECTION 6: DOCUMENT LOCATOR */}
      {/* Where to find vital records */}
      {/* ====================================================================== */}
      <div className="p-8 page-break-after">
        <div className="border-4 border-orange-600 p-4 mb-6">
          <h1 className="text-4xl font-black text-orange-900">
            📂 DOCUMENT LOCATOR
          </h1>
          <p className="text-lg mt-2 text-orange-700">
            Critical records location guide - Know where everything is stored and backed up
          </p>
        </div>

        {vitalRecords.length > 0 ? (
          <div className="space-y-3">
            {vitalRecords.map((record: any, idx: number) => {
              const recordType = getStringValue(record['Record Type'] || record.recordType || record.name || 'Document')
              const location = getStringValue(record.Location || record.location || record.storageLocation || 'Not specified')
              const backupLocation = getStringValue(record['Backup Location'] || record.backupLocation || 'Not specified')
              const updateFreq = getStringValue(record['Update Frequency'] || record.updateFrequency || record.backupFrequency || 'As needed')
              
              return (
                <div key={idx} className="border-2 border-orange-300 bg-white">
                  <div className="bg-orange-100 p-2 font-bold text-gray-900 border-b border-orange-300">
                    {recordType}
                  </div>
                  <div className="p-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-gray-700 mb-1">Primary Location:</div>
                      <div className="text-gray-900">{location}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700 mb-1">Backup Location:</div>
                      <div className="text-gray-900">{backupLocation}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700 mb-1">Update Frequency:</div>
                      <div className="text-gray-900">{updateFreq}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="border-2 border-gray-300 bg-gray-50 p-6 text-center">
            <p className="text-gray-600 mb-4">
              No vital records have been catalogued yet. Use the table below to document where your critical records are stored.
            </p>
            <div className="border-2 border-gray-400">
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="text-left p-2 border-b border-gray-400">Record Type</th>
                    <th className="text-left p-2 border-b border-gray-400">Primary Location</th>
                    <th className="text-left p-2 border-b border-gray-400">Backup Location</th>
                    <th className="text-left p-2 border-b border-gray-400">Update Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {['Insurance Policies', 'Financial Records', 'Property Documents', 'Employee Records', 'Contracts'].map((recordType, idx) => (
                    <tr key={idx} className="border-b border-gray-300">
                      <td className="p-2 font-semibold">{recordType}</td>
                      <td className="p-2 bg-gray-100">_________________</td>
                      <td className="p-2 bg-gray-100">_________________</td>
                      <td className="p-2 bg-gray-100">_________________</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Best Practices Reminder */}
        <div className="border-2 border-orange-400 bg-orange-50 p-4 mt-6">
          <h3 className="font-black text-orange-900 mb-3">💡 Document Protection Best Practices:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-orange-600">✓</span>
              <span>Keep digital copies in secure cloud storage (not just on one computer)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600">✓</span>
              <span>Store physical copies in a fireproof safe or off-site location</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600">✓</span>
              <span>Update records regularly - at least quarterly or after major changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600">✓</span>
              <span>Test your backups - make sure you can actually access them when needed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600">✓</span>
              <span>Share backup location info with your Plan Manager and key staff</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* SECTION 7: INCIDENT LOG TEMPLATE */}
      {/* Blank forms for recording emergencies */}
      {/* ====================================================================== */}
      <div className="p-8 page-break-after">
        <div className="border-4 border-gray-700 p-4 mb-6">
          <h1 className="text-4xl font-black text-gray-900">
            📝 INCIDENT LOG
          </h1>
          <p className="text-lg mt-2 text-gray-700">
            Use this form to record events during an emergency - Critical for insurance claims and lessons learned
          </p>
        </div>

        {/* Incident Log Form */}
        <div className="border-2 border-gray-400 p-4 mb-6">
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 mb-2">Incident Details:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Incident Type:</label>
                <div className="border-b-2 border-gray-400 h-8 mt-1"></div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Date & Time Started:</label>
                <div className="border-b-2 border-gray-400 h-8 mt-1"></div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Reported By:</label>
                <div className="border-b-2 border-gray-400 h-8 mt-1"></div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Plan Manager Notified:</label>
                <div className="border-b-2 border-gray-400 h-8 mt-1"></div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-bold text-gray-900 mb-2">Initial Assessment:</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">What happened?</label>
                <div className="border-2 border-gray-400 min-h-[60px] mt-1 p-2"></div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Impact on operations:</label>
                <div className="border-2 border-gray-400 min-h-[60px] mt-1 p-2"></div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Injuries or safety concerns:</label>
                <div className="border-2 border-gray-400 min-h-[60px] mt-1 p-2"></div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-bold text-gray-900 mb-2">Timeline of Events:</h3>
            <div className="border-2 border-gray-400">
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="text-left p-2 border-b border-gray-400 w-32">Time</th>
                    <th className="text-left p-2 border-b border-gray-400">Action Taken / Event Observed</th>
                    <th className="text-left p-2 border-b border-gray-400 w-40">By Whom</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                    <tr key={row} className="border-b border-gray-300">
                      <td className="p-2 h-10"></td>
                      <td className="p-2 h-10"></td>
                      <td className="p-2 h-10"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-bold text-gray-900 mb-2">Damage Assessment:</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">Property/equipment damaged:</label>
                <div className="border-2 border-gray-400 min-h-[60px] mt-1 p-2"></div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Estimated costs (if known):</label>
                <div className="border-2 border-gray-400 h-10 mt-1 p-2"></div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <label className="font-semibold text-gray-700">Photos taken?</label>
                <span className="flex items-center gap-2">
                  <input type="checkbox" className="w-5 h-5" /> Yes
                </span>
                <span className="flex items-center gap-2">
                  <input type="checkbox" className="w-5 h-5" /> No
                </span>
                <label className="font-semibold text-gray-700 ml-4">Insurance contacted?</label>
                <span className="flex items-center gap-2">
                  <input type="checkbox" className="w-5 h-5" /> Yes
                </span>
                <span className="flex items-center gap-2">
                  <input type="checkbox" className="w-5 h-5" /> No
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-bold text-gray-900 mb-2">Recovery Actions:</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">Immediate steps taken:</label>
                <div className="border-2 border-gray-400 min-h-[60px] mt-1 p-2"></div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">When can operations resume?</label>
                <div className="border-2 border-gray-400 h-10 mt-1 p-2"></div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Incident Closed:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Date & Time:</label>
                <div className="border-b-2 border-gray-400 h-8 mt-1"></div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Closed By:</label>
                <div className="border-b-2 border-gray-400 h-8 mt-1"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Reminders */}
        <div className="border-2 border-red-400 bg-red-50 p-4">
          <h3 className="font-black text-red-900 mb-3">⚠️ Important Reminders:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">!</span>
              <span><strong>Take photos/videos</strong> of all damage before cleanup - essential for insurance claims</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">!</span>
              <span><strong>Keep all receipts</strong> for emergency purchases, repairs, temporary accommodations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">!</span>
              <span><strong>Don't throw away</strong> damaged items until insurance adjuster has seen them</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">!</span>
              <span><strong>Contact insurance within 24 hours</strong> to start claims process</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">!</span>
              <span><strong>After incident is resolved:</strong> Schedule lessons-learned meeting and update this workbook</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* FINAL PAGE: NOTES & UPDATES */}
      {/* ====================================================================== */}
      <div className="p-8">
        <div className="border-4 border-blue-600 p-4 mb-6">
          <h1 className="text-4xl font-black text-blue-900">
            📋 NOTES & UPDATES
          </h1>
          <p className="text-lg mt-2 text-blue-700">
            Use this space to track changes, lessons learned, and action items
          </p>
        </div>

        <div className="border-2 border-gray-400">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left p-2 border-b-2 border-gray-400 w-32">Date</th>
                <th className="text-left p-2 border-b-2 border-gray-400">Note / Update / Action Item</th>
                <th className="text-left p-2 border-b-2 border-gray-400 w-32">Updated By</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(20)].map((_, idx) => (
                <tr key={idx} className="border-b border-gray-300">
                  <td className="p-2 h-12"></td>
                  <td className="p-2 h-12"></td>
                  <td className="p-2 h-12"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t-2 border-gray-400 text-center text-sm text-gray-600">
          <p className="mb-2">
            <strong>{companyName}</strong> - Business Continuity Action Workbook
          </p>
          <p className="mb-2">
            Plan Manager: {planManager} | Phone: {planManagerPhone || planManagerEmail}
          </p>
          <p className="mb-4">
            Last Updated: {currentDate} | Next Review: Quarterly or after any incident
          </p>
          <p className="text-xs text-gray-500">
            UNDP x CARICHAM Business Continuity Planning Initiative
          </p>
        </div>
      </div>

    </div>
  )
}

export default WorkbookPreview

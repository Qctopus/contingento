/**
 * API Route: Export Formal Business Continuity Plan PDF
 * 
 * Generates an 8-12 page professional document suitable for:
 * - Bank loan applications (JMD 500K - 10M)
 * - Insurance renewals
 * - Proving business preparedness to investors
 * - Business partner requirements
 * 
 * Target: Caribbean small business owners (micro to medium)
 */

import { NextResponse } from 'next/server'
import { centralDataService } from '../../../services/centralDataService'
import { transformToFormalFormat } from '../../../utils/formalBCPTransformer'
import { generateFormalBCPPDF } from '../../../lib/pdf/formalBCPGenerator'
import { costCalculationService } from '../../../services/costCalculationService'
import type { WizardFormData, StrategyData } from '../../../types/bcpExports'

export async function POST(req: Request) {
  try {
    const { planData } = await req.json()

    if (!planData) {
      return NextResponse.json(
        { error: 'No plan data provided' },
        { status: 400 }
      )
    }

    console.log('[Formal BCP] Starting PDF generation...')

    // ============================================================================
    // STEP 1: Extract user's selected HIGH/EXTREME risks
    // ============================================================================
    
    const riskMatrix = planData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || []
    
    // Get only HIGH and EXTREME risks that user selected
    const highPriorityRisks = riskMatrix
      .filter((r: any) => {
        const isSelected = r.isSelected !== false // undefined or true = selected
        const riskScore = parseFloat(r.riskScore || r['Risk Score'] || 0)
        const isHighPriority = riskScore >= 6.0 // HIGH = 6.0-7.9, EXTREME = 8.0+
        return isSelected && isHighPriority
      })
    
    // Extract the hazard IDs (e.g., ["hurricane", "power_outage", "flooding"])
    const userRiskIds = highPriorityRisks.map((r: any) => 
      r.hazardId || r.id || r.Hazard?.toLowerCase().replace(/\s+/g, '_')
    )
    
    console.log('[Formal BCP] User has', userRiskIds.length, 'high-priority risks:', userRiskIds)
    
    // ============================================================================
    // STEP 2: Get user's country for cost calculation
    // ============================================================================
    
    const businessAddress = planData.PLAN_INFORMATION?.['Business Address'] || 
                           planData.BUSINESS_OVERVIEW?.['Business Address'] || ''
    
    // Extract country from address (last part after comma)
    const addressParts = businessAddress.split(',').map((s: string) => s.trim())
    const country = addressParts[addressParts.length - 1] || 'Jamaica'
    
    // Map country to country code
    const countryCodeMap: Record<string, string> = {
      'Jamaica': 'JM',
      'Barbados': 'BB',
      'Trinidad': 'TT',
      'Trinidad and Tobago': 'TT',
      'Bahamas': 'BS',
      'Haiti': 'HT',
      'Dominican Republic': 'DO',
      'Grenada': 'GD',
      'Saint Lucia': 'LC',
      'Antigua': 'AG',
      'Antigua and Barbuda': 'AG',
      'Saint Vincent': 'VC',
      'Saint Vincent and the Grenadines': 'VC',
      'Dominica': 'DM',
      'Saint Kitts': 'KN',
      'Saint Kitts and Nevis': 'KN',
    }
    
    const countryCode = countryCodeMap[country] || 'JM'
    
    console.log('[Formal BCP] User country:', country, '→ Code:', countryCode)

    // ============================================================================
    // STEP 3: Get user's selected strategies from wizard
    // ============================================================================
    
    console.log('[Formal BCP] Extracting user-selected strategies from formData...')
    
    // Get the strategies the user selected in the wizard
    const userSelectedStrategies = planData.STRATEGIES?.['Business Continuity Strategies'] || []
    
    console.log('[Formal BCP] User selected', userSelectedStrategies.length, 'strategies in wizard')
    
    if (userSelectedStrategies.length === 0) {
      console.warn('[Formal BCP] No strategies selected by user - document will be incomplete')
    }
    
    let strategies: StrategyData[] = []
    
    if (userSelectedStrategies.length > 0) {
      try {
        // Check if user selections already have full data (from wizard)
        const strategiesNeedEnrichment = userSelectedStrategies.some((s: any) => 
          !s.actionSteps || s.actionSteps.length === 0
        )
        
        if (strategiesNeedEnrichment) {
          console.log('[Formal BCP] Enriching strategies with full database data...')
          
          // Get strategy IDs from user selections
          const strategyIds = userSelectedStrategies
            .map((s: any) => s.id || s.strategyId)
            .filter(Boolean)
          
          if (strategyIds.length > 0) {
            console.log('[Formal BCP] Querying database for strategy IDs:', strategyIds)
            
            const dbStrategies = await centralDataService.getStrategies()
            
            // Filter to only user-selected strategies
            const selectedDbStrategies = dbStrategies.filter((s: any) => 
              strategyIds.includes(s.id) || strategyIds.includes(s.strategyId)
            )
            
            console.log('[Formal BCP] Loaded', selectedDbStrategies.length, 'strategies from database')
            
            // Merge database data with user selections (preserve user's calculated costs)
            const applicableStrategies = userSelectedStrategies.map((userStrategy: any) => {
              const dbStrategy = selectedDbStrategies.find((db: any) => 
                db.id === userStrategy.id || db.strategyId === userStrategy.strategyId
              )
              
              if (dbStrategy) {
                // Use database data but keep user's calculated costs
                return {
                  ...dbStrategy,
                  // Preserve user's cost calculations from wizard
                  calculatedCostUSD: userStrategy.calculatedCostUSD,
                  calculatedCostLocal: userStrategy.calculatedCostLocal,
                  currencyCode: userStrategy.currencyCode,
                  currencySymbol: userStrategy.currencySymbol,
                  // Parse JSON fields
                  benefitsBullets: parseJsonField(dbStrategy.benefitsBullets),
                  actionSteps: (dbStrategy.actionSteps || []).map((step: any) => ({
                    ...step,
                    resources: parseJsonField(step.resources),
                    checklist: parseJsonField(step.checklist),
                    commonMistakesForStep: parseJsonField(step.commonMistakesForStep)
                  }))
                }
              } else {
                // Use user strategy as-is if not found in database
                console.warn('[Formal BCP] Strategy not found in database:', userStrategy.strategyId)
                return userStrategy
              }
            })
            
            // ============================================================================
            // STEP 4: Calculate costs ONLY for strategies without costs
            // ============================================================================
            
            for (const strategy of applicableStrategies) {
              // Skip if strategy already has calculated costs from wizard
              if (strategy.calculatedCostLocal && strategy.calculatedCostLocal > 0) {
                console.log(`[Formal BCP] Using wizard cost for "${strategy.name}": ${strategy.currencySymbol}${Math.round(strategy.calculatedCostLocal).toLocaleString()} ${strategy.currencyCode}`)
                continue
              }
              
              // Calculate cost for strategies without wizard costs
              try {
                // Get action steps with cost items
                const actionSteps = (strategy.actionSteps || []).map((step: any) => ({
                  id: step.id,
                  stepId: step.stepId,
                  sortOrder: step.sortOrder,
                  phase: step.phase,
                  title: step.title,
                  smeAction: step.smeAction,
                  action: step.smeAction || step.action || step.title,
                  description: step.description,
                  timeframe: step.timeframe,
                  estimatedMinutes: step.estimatedMinutes,
                  difficultyLevel: step.difficultyLevel,
                  whyThisStepMatters: step.whyThisStepMatters,
                  whatHappensIfSkipped: step.whatHappensIfSkipped,
                  howToKnowItsDone: step.howToKnowItsDone,
                  resources: parseJsonField(step.resources),
                  checklist: parseJsonField(step.checklist),
                  commonMistakesForStep: parseJsonField(step.commonMistakesForStep),
                  freeAlternative: step.freeAlternative,
                  lowTechOption: step.lowTechOption,
                  videoTutorialUrl: step.videoTutorialUrl,
                  exampleOutput: step.exampleOutput,
                  costItems: step.costItems || []
                }))
                
                // Calculate strategy cost in user's currency
                const costCalc = await costCalculationService.calculateStrategyCost(
                  actionSteps,
                  countryCode
                )
                
                strategy.calculatedCostUSD = costCalc.totalUSD
                strategy.calculatedCostLocal = costCalc.localCurrency.amount
                strategy.currencyCode = costCalc.localCurrency.code
                strategy.currencySymbol = costCalc.localCurrency.symbol
                
                console.log(`[Formal BCP] Calculated cost for "${strategy.name}": ${strategy.currencySymbol}${Math.round(strategy.calculatedCostLocal).toLocaleString()} ${strategy.currencyCode}`)
              } catch (costError) {
                console.error(`[Formal BCP] Cost calculation failed for strategy ${strategy.id}:`, costError)
                // Continue without costs - better than failing completely
                strategy.calculatedCostUSD = 0
                strategy.calculatedCostLocal = 0
              }
            }
            
            // ============================================================================
            // STEP 5: Transform to format expected by transformer
            // ============================================================================
            
            strategies = applicableStrategies
              .sort((a: any, b: any) => {
                // Sort by priority first (essential > high > medium > low)
                const priorityOrder: Record<string, number> = { 
                  essential: 4, critical: 4, high: 3, medium: 2, low: 1 
                }
                const aPriority = priorityOrder[a.priority?.toLowerCase()] || 0
                const bPriority = priorityOrder[b.priority?.toLowerCase()] || 0
                if (bPriority !== aPriority) return bPriority - aPriority
                
                // Then by effectiveness
                return (b.effectiveness || 7) - (a.effectiveness || 7)
              })
              .map((s: any) => ({
                id: s.id,
                strategyId: s.strategyId,
                name: s.name,
                smeTitle: s.smeTitle,
                description: s.description,
                smeSummary: s.smeSummary,
                category: s.category,
                applicableRisks: parseJsonField(s.applicableRisks),
                
                // Benefits and examples
                benefitsBullets: parseJsonField(s.benefitsBullets),
                realWorldExample: s.realWorldExample,
                lowBudgetAlternative: s.lowBudgetAlternative,
                diyApproach: s.diyApproach,
                
                // Implementation details
                implementationCost: s.implementationCost,
                timeToImplement: s.timeToImplement,
                implementationTime: s.implementationTime || s.timeToImplement,
                effectiveness: s.effectiveness || 7,
                priority: s.priority,
                
                // Calculated costs (from wizard)
                calculatedCostUSD: s.calculatedCostUSD || 0,
                calculatedCostLocal: s.calculatedCostLocal || 0,
                currencyCode: s.currencyCode,
                currencySymbol: s.currencySymbol,
                
                // Action steps with full details (ALL of them, not limited)
                actionSteps: (s.actionSteps || [])
                  .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((step: any) => ({
                    id: step.id,
                    stepId: step.stepId,
                    sortOrder: step.sortOrder,
                    phase: step.phase,
                    
                    // Action descriptions
                    title: step.title,
                    smeAction: step.smeAction,
                    action: step.smeAction || step.action || step.title,
                    description: step.description,
                    
                    // Timing and difficulty
                    timeframe: step.timeframe,
                    estimatedMinutes: step.estimatedMinutes,
                    difficultyLevel: step.difficultyLevel,
                    
                    // Guidance
                    whyThisStepMatters: step.whyThisStepMatters,
                    whatHappensIfSkipped: step.whatHappensIfSkipped,
                    howToKnowItsDone: step.howToKnowItsDone,
                    
                    // Resources and checklists
                    resources: parseJsonField(step.resources),
                    checklist: parseJsonField(step.checklist),
                    commonMistakesForStep: parseJsonField(step.commonMistakesForStep),
                    
                    // Alternatives
                    freeAlternative: step.freeAlternative,
                    lowTechOption: step.lowTechOption,
                    
                    // Cost items
                    costItems: step.costItems,
                    
                    // Media
                    videoTutorialUrl: step.videoTutorialUrl,
                    exampleOutput: step.exampleOutput
                  }))
              }))
            
            console.log('[Formal BCP] Transformed strategies with full data')
          } else {
            // No valid IDs, use user strategies as-is
            console.warn('[Formal BCP] No valid strategy IDs found, using user selections as-is')
            strategies = userSelectedStrategies
          }
        } else {
          // User strategies already have full data from wizard
          console.log('[Formal BCP] Using user-selected strategies from wizard (already complete)')
          strategies = userSelectedStrategies.map((s: any) => ({
            ...s,
            // Ensure JSON fields are parsed
            benefitsBullets: Array.isArray(s.benefitsBullets) 
              ? s.benefitsBullets 
              : parseJsonField(s.benefitsBullets),
            applicableRisks: Array.isArray(s.applicableRisks)
              ? s.applicableRisks
              : parseJsonField(s.applicableRisks),
            actionSteps: (s.actionSteps || []).map((step: any) => ({
              ...step,
              resources: Array.isArray(step.resources) 
                ? step.resources 
                : parseJsonField(step.resources),
              checklist: Array.isArray(step.checklist) 
                ? step.checklist 
                : parseJsonField(step.checklist),
              commonMistakesForStep: Array.isArray(step.commonMistakesForStep)
                ? step.commonMistakesForStep
                : parseJsonField(step.commonMistakesForStep)
            }))
          }))
        }
        
        console.log('[Formal BCP] Final strategy count:', strategies.length)
        
        // Log cost summary
        const totalCost = strategies.reduce((sum: number, s: any) => 
          sum + (s.calculatedCostLocal || 0), 0
        )
        const currencyCode = strategies[0]?.currencyCode || 'BBD'
        const currencySymbol = strategies[0]?.currencySymbol || 'Bds$'
        
        console.log(`[Formal BCP] Total investment: ${currencySymbol}${totalCost.toLocaleString()} ${currencyCode}`)
        
      } catch (error) {
        console.error('[Formal BCP] Failed to load strategies:', error)
        // Fallback to user selections without enrichment
        strategies = userSelectedStrategies
      }
    } else {
      console.warn('[Formal BCP] No strategies selected by user - document will be incomplete')
    }

    // Transform wizard data to formal format
    console.log('[Formal BCP] Transforming data to formal format...')
    const formalData = transformToFormalFormat(
      planData as WizardFormData,
      strategies
    )

    console.log('[Formal BCP] Formal data prepared:', {
      businessName: formalData.coverPage.businessName,
      highPriorityRisks: formalData.riskAssessment.highPriorityRisksCount,
      totalInvestment: formalData.continuityStrategies.totalInvestment,
      strategiesByRisk: formalData.continuityStrategies.strategiesByRisk.length
    })

    // Generate PDF
    console.log('[Formal BCP] Generating PDF...')
    const pdfBlob = await generateFormalBCPPDF(formalData)

    // Convert blob to buffer
    const arrayBuffer = await pdfBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate filename
    const companyName = planData.PLAN_INFORMATION?.['Company Name'] || 'business'
    const sanitizedName = companyName
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
      .substring(0, 50)
    const filename = `${sanitizedName}-formal-bcp.pdf`

    console.log('[Formal BCP] PDF generated successfully:', {
      filename,
      size: buffer.length
    })

    // Return PDF with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('[Formal BCP] Error generating PDF:', error)
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('[Formal BCP] Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate formal BCP PDF', 
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Please ensure all required wizard steps are completed'
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse JSON field (handles both string and array)
 */
function parseJsonField(value: any): any {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

/**
 * Estimate cost from implementation cost string
 */
function estimateCostFromString(cost: string): number {
  if (!cost) return 10000
  
  const costMap: Record<string, number> = {
    'low': 5000,
    'medium': 20000,
    'high': 50000,
    'very_high': 100000
  }
  
  // Try to extract number from string
  const match = cost.match(/(\d+[,.]?\d*)/)
  if (match) {
    return parseInt(match[1].replace(/[,.]/g, ''))
  }
  
  // Fallback to level mapping
  return costMap[cost?.toLowerCase()] || 10000
}

/**
 * Allowed HTTP methods
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


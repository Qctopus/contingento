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

    // Load strategies from database
    let strategies: StrategyData[] = []
    try {
      const dbStrategies = await centralDataService.getStrategies()
      
      // Filter to user-selected strategies if available
      const selectedStrategyIds = new Set<string>()
      
      // Check multiple possible locations for selected strategies
      const selectedStrategies = 
        planData.STRATEGIES?.['Business Continuity Strategies'] ||
        planData.CONTINUITY_STRATEGIES?.selectedStrategies ||
        planData.CONTINUITY_STRATEGIES?.strategies ||
        []
      
      selectedStrategies.forEach((s: any) => {
        if (s.id) selectedStrategyIds.add(s.id)
        if (s.strategyId) selectedStrategyIds.add(s.strategyId)
      })

      console.log('[Formal BCP] Selected strategy IDs:', Array.from(selectedStrategyIds))

      strategies = dbStrategies
        .filter((s: any) => 
          selectedStrategyIds.size === 0 || 
          selectedStrategyIds.has(s.id) || 
          selectedStrategyIds.has(s.strategyId)
        )
        .map((s: any) => ({
          id: s.id,
          strategyId: s.strategyId,
          name: s.name,
          smeTitle: s.smeTitle,
          category: s.category,
          description: s.description,
          smeSummary: s.smeSummary,
          benefitsBullets: parseJsonField(s.benefitsBullets),
          implementationCost: s.implementationCost,
          implementationTime: s.implementationTime,
          effectiveness: s.effectiveness || 7,
          priority: s.priority,
          applicableRisks: parseJsonField(s.applicableRisks),
          actionSteps: (s.actionSteps || []).map((step: any) => ({
            id: step.id,
            stepId: step.stepId,
            phase: step.phase,
            title: step.title,
            description: step.description,
            smeAction: step.smeAction,
            action: step.smeAction || step.action || step.title,
            timeframe: step.timeframe,
            estimatedMinutes: step.estimatedMinutes,
            difficultyLevel: step.difficultyLevel,
            whyThisStepMatters: step.whyThisStepMatters,
            whatHappensIfSkipped: step.whatHappensIfSkipped,
            resources: parseJsonField(step.resources),
            checklist: parseJsonField(step.checklist),
            howToKnowItsDone: step.howToKnowItsDone,
            exampleOutput: step.exampleOutput,
            freeAlternative: step.freeAlternative,
            lowTechOption: step.lowTechOption,
            commonMistakesForStep: parseJsonField(step.commonMistakesForStep),
            videoTutorialUrl: step.videoTutorialUrl
          })),
          calculatedCostUSD: s.calculatedCostUSD || estimateCostFromString(s.implementationCost),
          calculatedCostLocal: s.calculatedCostLocal || (estimateCostFromString(s.implementationCost) * 150) // JMD exchange rate
        }))

      console.log('[Formal BCP] Loaded strategies:', strategies.length)
    } catch (error) {
      console.error('[Formal BCP] Failed to load strategies:', error)
      // Continue with empty strategies - plan will still generate with available data
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


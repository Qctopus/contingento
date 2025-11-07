/**
 * API Route: Export Business Continuity Action Workbook PDF
 * 
 * Generates a practical, step-by-step implementation guide for:
 * - Business owners
 * - Managers
 * - Operations teams
 * 
 * Features checkboxes, worksheets, and progress trackers
 */

import { NextResponse } from 'next/server'
import { centralDataService } from '../../../services/centralDataService'
import { transformToWorkbookFormat } from '../../../utils/dataTransformers'
import { generateWorkbookPDF } from '../../../lib/pdf/workbookGenerator'
import type { WizardFormData, StrategyData } from '../../../types/bcpExports'

export async function POST(req: Request) {
  try {
    const { planData, localCurrency = 'JMD', exchangeRate = 150 } = await req.json()

    if (!planData) {
      return NextResponse.json(
        { error: 'No plan data provided' },
        { status: 400 }
      )
    }

    // Load strategies from database
    let strategies: StrategyData[] = []
    try {
      const dbStrategies = await centralDataService.getStrategies()
      
      // Filter to user-selected strategies if available
      const selectedStrategyIds = planData.CONTINUITY_STRATEGIES?.selectedStrategies?.map(
        (s: any) => s.id || s.strategyId
      ) || []

      strategies = dbStrategies
        .filter((s: any) => selectedStrategyIds.length === 0 || selectedStrategyIds.includes(s.id))
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
          actionSteps: s.actionSteps?.map((step: any) => ({
            id: step.id,
            stepId: step.stepId,
            phase: step.phase,
            title: step.title,
            description: step.description,
            smeAction: step.smeAction,
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
          })) || [],
          calculatedCostUSD: s.calculatedCostUSD || estimateCostFromString(s.implementationCost),
          calculatedCostLocal: s.calculatedCostLocal || (estimateCostFromString(s.implementationCost) * exchangeRate)
        }))
    } catch (error) {
      console.error('Failed to load strategies for workbook:', error)
      // Continue with empty strategies - workbook will still generate with available data
    }

    // Transform wizard data to workbook format
    const workbookData = transformToWorkbookFormat(
      planData as WizardFormData,
      strategies,
      localCurrency,
      exchangeRate
    )

    // Generate PDF
    const pdfBlob = await generateWorkbookPDF(workbookData)

    // Convert blob to buffer
    const arrayBuffer = await pdfBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate filename
    const companyName = planData.PLAN_INFORMATION?.['Company Name'] || 'business'
    const sanitizedName = companyName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
    const filename = `${sanitizedName}-bcp-action-workbook.pdf`

    // Return PDF with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Error generating action workbook PDF:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate workbook', 
        details: error instanceof Error ? error.message : 'Unknown error'
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
  if (!value) return null
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }
  return null
}

/**
 * Estimate cost from implementation cost string
 */
function estimateCostFromString(cost: string): number {
  const costMap: Record<string, number> = {
    'low': 500,
    'medium': 2000,
    'high': 5000,
    'very_high': 10000
  }
  return costMap[cost?.toLowerCase()] || 1000
}




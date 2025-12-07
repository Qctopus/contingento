/**
 * API Route: Export Word Document (Formal BCP or Action Workbook)
 * Generates a docx on the server to avoid client-side bundling issues.
 */

import { NextResponse } from 'next/server'
import { centralDataService } from '@/services/centralDataService'
import { buildWordBuffer, WordExportOptions } from '@/utils/wordDocBuilder'
import type { Locale } from '@/i18n/config'

export async function POST(req: Request) {
  try {
    const { planData, mode = 'formal', locale = 'en', strategies: strategiesFromClient, risks: risksFromClient } = await req.json()

    if (!planData) {
      return NextResponse.json({ error: 'No plan data provided' }, { status: 400 })
    }

    // ------------------------------------------------------------------------
    // Strategies
    // Priority: client-provided (from review page) -> planData selection -> DB
    // ------------------------------------------------------------------------
    const planSelected = planData.CONTINUITY_STRATEGIES?.selectedStrategies || planData.CONTINUITY_STRATEGIES?.strategies || []

    let dbStrategies: any[] = []
    try {
      dbStrategies = await centralDataService.getStrategies()
    } catch (err) {
      console.error('[export-word] Failed to load strategies from DB:', err)
    }

    const mergeWithDb = (arr: any[]) => {
      return arr.map((sel: any) => {
        const match = dbStrategies.find((db) => db.id === sel?.id || db.strategyId === sel?.strategyId)
        return match ? { ...match, ...sel } : sel
      })
    }

    let strategies: any[] = []
    if (Array.isArray(strategiesFromClient) && strategiesFromClient.length > 0) {
      strategies = mergeWithDb(strategiesFromClient)
    } else if (Array.isArray(planSelected) && planSelected.length > 0) {
      strategies = mergeWithDb(planSelected)
    } else {
      strategies = dbStrategies
    }

    // Risks from client or plan data
    let risks = Array.isArray(risksFromClient) && risksFromClient.length > 0
      ? risksFromClient
      : (planData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || []).filter((r: any) => r.isSelected || risksFromClient === undefined)

    const buffer = await buildWordBuffer({
      formData: planData,
      strategies,
      risks,
      locale: (locale || 'en') as Locale,
      mode
    } as WordExportOptions)

    const companyName = planData.PLAN_INFORMATION?.['Company Name'] || 'business'
    const sanitizedName = companyName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
    const filename = `${sanitizedName}-${mode === 'formal' ? 'formal-bcp' : 'action-workbook'}.docx`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    })
  } catch (error) {
    console.error('[export-word] Error generating Word document:', error)
    return NextResponse.json(
      { error: 'Failed to generate Word document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


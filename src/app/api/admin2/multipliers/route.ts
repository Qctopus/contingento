import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET all multipliers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'
    const locale = searchParams.get('locale') || 'en'

    const multipliers = await prisma.riskMultiplier.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        RiskMultiplierTranslation: {
          where: { locale }
        }
      } as any, // Cast to any to bypass type check since we can't regenerate client
      orderBy: [
        { priority: 'asc' }
      ]
    })

    console.log(`📊 Retrieved ${multipliers.length} risk multipliers`)

    // Helper function to safely parse JSON fields
    const parseJsonField = (value: string | null | undefined): any => {
      if (!value) return null
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }

    // Transform the data to flatten translations
    const flattenedMultipliers = multipliers.map((multiplier: any) => {
      // Get translation for current locale
      // Get translation for current locale - since we filter in the query, it should be the first one
      const translation = multiplier.RiskMultiplierTranslation?.[0] || {}

      return {
        ...multiplier,
        // All translatable fields come from translation table only
        name: translation.name || '',
        description: translation.description || '',
        reasoning: translation.reasoning || '',
        wizardQuestion: translation.wizardQuestion || null,
        wizardHelpText: translation.wizardHelpText || null,
        wizardAnswerOptions: translation.wizardAnswerOptions || null,
        applicableHazards: parseJsonField(multiplier.applicableHazards) || [],
        // Remove the raw translation array from the response
        RiskMultiplierTranslation: undefined
      }
    })

    return NextResponse.json({
      success: true,
      data: flattenedMultipliers
    })
  } catch (error) {
    console.error('❌ Error fetching multipliers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch multipliers' },
      { status: 500 }
    )
  }
}

// POST - Create new multiplier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      characteristicType,
      conditionType,
      thresholdValue,
      minValue,
      maxValue,
      multiplierFactor,
      applicableHazards,
      priority,
      reasoning,
      isActive = true,
      createdBy = 'admin',
      wizardQuestion,
      wizardHelpText,
      wizardAnswerOptions
    } = body

    // Validation
    if (!name || !description || !characteristicType || !conditionType || !multiplierFactor || !applicableHazards) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare base data (non-translatable fields only)
    const baseData: any = {
      characteristicType,
      conditionType,
      thresholdValue,
      minValue,
      maxValue,
      multiplierFactor,
      applicableHazards: typeof applicableHazards === 'object' ? JSON.stringify(applicableHazards) : applicableHazards,
      priority: priority || 0,
      isActive,
      createdBy
    }

    // Prepare translation data
    const translationData = {
      locale: 'en', // Default to English for now
      name,
      description,
      reasoning,
      wizardQuestion: typeof wizardQuestion === 'object' ? JSON.stringify(wizardQuestion) : wizardQuestion,
      wizardHelpText: typeof wizardHelpText === 'object' ? JSON.stringify(wizardHelpText) : wizardHelpText,
      wizardAnswerOptions: (Array.isArray(wizardAnswerOptions) || typeof wizardAnswerOptions === 'object') ? JSON.stringify(wizardAnswerOptions) : wizardAnswerOptions
    }

    const multiplier = await prisma.riskMultiplier.create({
      data: {
        ...baseData,
        RiskMultiplierTranslation: {
          create: translationData
        }
      },
      include: {
        RiskMultiplierTranslation: true
      } as any
    })

    console.log(`✅ Created multiplier: ${name}`)

    // Helper function to safely parse JSON fields
    const parseJsonField = (value: string | null | undefined): any => {
      if (!value) return null
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }

    // Get the created translation
    const createdTranslation: any = multiplier.RiskMultiplierTranslation?.[0] || {}

    return NextResponse.json({
      success: true,
      data: {
        ...multiplier,
        applicableHazards: parseJsonField(multiplier.applicableHazards) || [],
        wizardQuestion: parseJsonField(createdTranslation.wizardQuestion),
        wizardAnswerOptions: parseJsonField(createdTranslation.wizardAnswerOptions),
        wizardHelpText: parseJsonField(createdTranslation.wizardHelpText),
        RiskMultiplierTranslation: undefined
      }
    })
  } catch (error) {
    console.error('❌ Error creating multiplier:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create multiplier' },
      { status: 500 }
    )
  }
}

// PATCH - Update multiplier
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Multiplier ID required' },
        { status: 400 }
      )
    }

    // Separate base updates and translation updates
    const baseUpdates: any = {}
    const translationUpdates: any = {}
    const translationFields = ['wizardQuestion', 'wizardHelpText', 'wizardAnswerOptions', 'name', 'description', 'reasoning']

    Object.keys(updates).forEach(key => {
      if (translationFields.includes(key)) {
        let value = updates[key]
        if (key === 'wizardQuestion' && typeof value === 'object') value = JSON.stringify(value)
        if (key === 'wizardHelpText' && typeof value === 'object') value = JSON.stringify(value)
        if (key === 'wizardAnswerOptions' && (Array.isArray(value) || typeof value === 'object')) value = JSON.stringify(value)

        translationUpdates[key] = value
        // Translatable fields NO LONGER go to base table
      } else if (key === 'applicableHazards') {
        baseUpdates[key] = Array.isArray(updates[key]) ? JSON.stringify(updates[key]) : updates[key]
      } else {
        baseUpdates[key] = updates[key]
      }
    })

    // Update base multiplier
    const multiplier = await prisma.riskMultiplier.update({
      where: { id },
      data: baseUpdates,
      include: {
        RiskMultiplierTranslation: true
      } as any
    })

    // Update or create translation for 'en'
    if (Object.keys(translationUpdates).length > 0) {
      const existingTranslation = multiplier.RiskMultiplierTranslation?.find((t: any) => t.locale === 'en' || t.language === 'en')

      if (existingTranslation) {
        await prisma.riskMultiplierTranslation.update({
          where: { id: existingTranslation.id },
          data: translationUpdates
        })
      } else {
        await prisma.riskMultiplierTranslation.create({
          data: {
            riskMultiplierId: id,
            locale: 'en',
            name: updates.name || '',
            description: updates.description || '',
            ...translationUpdates
          }
        })
      }
    }

    // Fetch updated data
    const updatedMultiplier = await prisma.riskMultiplier.findUnique({
      where: { id },
      include: {
        RiskMultiplierTranslation: true
      } as any
    })

    const translationName = updatedMultiplier?.RiskMultiplierTranslation?.find((t: any) => t.locale === 'en')?.name || 'unknown'
    console.log(`✅ Updated multiplier: ${translationName}`)

    // Helper function to safely parse JSON fields
    const parseJsonField = (value: string | null | undefined): any => {
      if (!value) return null
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }

    const finalTranslation: any = updatedMultiplier?.RiskMultiplierTranslation?.find((t: any) => t.locale === 'en' || t.language === 'en') || {}

    return NextResponse.json({
      success: true,
      data: {
        ...updatedMultiplier,
        applicableHazards: parseJsonField(updatedMultiplier?.applicableHazards) || [],
        wizardQuestion: parseJsonField(finalTranslation.wizardQuestion),
        wizardAnswerOptions: parseJsonField(finalTranslation.wizardAnswerOptions),
        wizardHelpText: parseJsonField(finalTranslation.wizardHelpText),
        RiskMultiplierTranslation: undefined
      }
    })
  } catch (error) {
    console.error('❌ Error updating multiplier:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update multiplier' },
      { status: 500 }
    )
  }
}

// DELETE - Delete multiplier
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Multiplier ID required' },
        { status: 400 }
      )
    }

    await prisma.riskMultiplier.delete({
      where: { id }
    })

    console.log(`✅ Deleted multiplier: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Multiplier deleted'
    })
  } catch (error) {
    console.error('❌ Error deleting multiplier:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete multiplier' },
      { status: 500 }
    )
  }
}





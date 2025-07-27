import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const hazards = await prisma.adminHazardType.findMany({
      where: { isActive: true },
      include: {
        businessTypeHazards: {
          include: {
            businessType: true
          }
        },
        locationHazards: {
          include: {
            location: true
          }
        },
        hazardStrategies: {
          include: {
            strategy: true
          }
        },
        hazardActionPlans: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ hazards })
  } catch (error) {
    console.error('Error fetching hazards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hazards' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate cascading risks if provided
    if (body.cascadingRisks) {
      try {
        const cascadingRisks = JSON.parse(body.cascadingRisks)
        if (!Array.isArray(cascadingRisks)) {
          return NextResponse.json(
            { error: 'cascadingRisks must be a JSON array' },
            { status: 400 }
          )
        }
        
        // Validate that all referenced hazardIds exist
        const existingHazards = await prisma.adminHazardType.findMany({
          where: { hazardId: { in: cascadingRisks } },
          select: { hazardId: true }
        })
        
        const existingHazardIds = existingHazards.map(h => h.hazardId)
        const invalidHazardIds = cascadingRisks.filter(id => !existingHazardIds.includes(id))
        
        if (invalidHazardIds.length > 0) {
          return NextResponse.json(
            { error: `Invalid hazard IDs in cascadingRisks: ${invalidHazardIds.join(', ')}` },
            { status: 400 }
          )
        }
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Invalid JSON in cascadingRisks field' },
          { status: 400 }
        )
      }
    }
    
    // Validate peakMonths if provided
    if (body.peakMonths) {
      try {
        const peakMonths = JSON.parse(body.peakMonths)
        if (!Array.isArray(peakMonths)) {
          return NextResponse.json(
            { error: 'peakMonths must be a JSON array' },
            { status: 400 }
          )
        }
        
        // Validate month numbers (1-12)
        const validMonths = peakMonths.every(month => 
          typeof month === 'string' && /^([1-9]|1[0-2])$/.test(month)
        )
        
        if (!validMonths) {
          return NextResponse.json(
            { error: 'peakMonths must contain valid month numbers (1-12)' },
            { status: 400 }
          )
        }
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Invalid JSON in peakMonths field' },
          { status: 400 }
        )
      }
    }
    
    const hazard = await prisma.adminHazardType.create({
      data: {
        hazardId: body.hazardId,
        name: body.name,
        category: body.category,
        description: body.description,
        defaultFrequency: body.defaultFrequency,
        defaultImpact: body.defaultImpact,
        seasonalPattern: body.seasonalPattern,
        peakMonths: body.peakMonths,
        warningTime: body.warningTime,
        geographicScope: body.geographicScope,
        cascadingRisks: body.cascadingRisks,
      }
    })

    return NextResponse.json({ hazard }, { status: 201 })
  } catch (error) {
    console.error('Error creating hazard:', error)
    return NextResponse.json(
      { error: 'Failed to create hazard' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    const hazard = await prisma.adminHazardType.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ hazard })
  } catch (error) {
    console.error('Error updating hazard:', error)
    return NextResponse.json(
      { error: 'Failed to update hazard' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // Soft delete
    await prisma.adminHazardType.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting hazard:', error)
    return NextResponse.json(
      { error: 'Failed to delete hazard' },
      { status: 500 }
    )
  }
} 
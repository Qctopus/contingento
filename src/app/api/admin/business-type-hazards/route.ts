import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessTypeId = searchParams.get('businessTypeId')
    
    if (businessTypeId) {
      // Get mappings for specific business type
      const mappings = await prisma.adminBusinessTypeHazard.findMany({
        where: {
          businessTypeId,
          isActive: true
        },
        include: {
          hazard: true,
          businessType: true
        }
      })
      return NextResponse.json({ mappings })
    } else {
      // Get all mappings
      const mappings = await prisma.adminBusinessTypeHazard.findMany({
        where: { isActive: true },
        include: {
          hazard: true,
          businessType: true
        },
        orderBy: [
          { businessTypeId: 'asc' },
          { hazardId: 'asc' }
        ]
      })
      return NextResponse.json({ mappings })
    }
  } catch (error) {
    console.error('Error fetching business type hazard mappings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mappings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const mapping = await prisma.adminBusinessTypeHazard.create({
      data: {
        businessTypeId: body.businessTypeId,
        hazardId: body.hazardId,
        riskLevel: body.riskLevel,
        frequency: body.frequency,
        impact: body.impact,
        notes: body.notes
      },
      include: {
        hazard: true,
        businessType: true
      }
    })

    return NextResponse.json({ mapping }, { status: 201 })
  } catch (error) {
    console.error('Error creating business type hazard mapping:', error)
    return NextResponse.json(
      { error: 'Failed to create mapping' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    const mapping = await prisma.adminBusinessTypeHazard.update({
      where: { id },
      data: updateData,
      include: {
        hazard: true,
        businessType: true
      }
    })

    return NextResponse.json({ mapping })
  } catch (error) {
    console.error('Error updating business type hazard mapping:', error)
    return NextResponse.json(
      { error: 'Failed to update mapping' },
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
    await prisma.adminBusinessTypeHazard.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting business type hazard mapping:', error)
    return NextResponse.json(
      { error: 'Failed to delete mapping' },
      { status: 500 }
    )
  }
} 
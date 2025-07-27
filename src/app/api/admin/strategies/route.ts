import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const strategies = await prisma.adminStrategy.findMany({
      where: { isActive: true },
      include: {
        hazardStrategies: {
          include: {
            hazard: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { title: 'asc' }
      ]
    })

    return NextResponse.json({ strategies })
  } catch (error) {
    console.error('Error fetching strategies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch strategies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const strategy = await prisma.adminStrategy.create({
      data: {
        strategyId: body.strategyId,
        title: body.title,
        description: body.description,
        category: body.category,
        reasoning: body.reasoning,
        icon: body.icon
      }
    })

    return NextResponse.json({ strategy }, { status: 201 })
  } catch (error) {
    console.error('Error creating strategy:', error)
    return NextResponse.json(
      { error: 'Failed to create strategy' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    const strategy = await prisma.adminStrategy.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ strategy })
  } catch (error) {
    console.error('Error updating strategy:', error)
    return NextResponse.json(
      { error: 'Failed to update strategy' },
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
    await prisma.adminStrategy.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting strategy:', error)
    return NextResponse.json(
      { error: 'Failed to delete strategy' },
      { status: 500 }
    )
  }
} 
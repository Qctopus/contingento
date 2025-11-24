import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET all countries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const countries = await prisma.country.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        _count: {
          select: { AdminUnit: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ success: true, data: countries })
  } catch (error) {
    console.error('Error fetching countries:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch countries' },
      { status: 500 }
    )
  }
}

// POST - Create a new country
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, code, region } = body

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'Name and code are required' },
        { status: 400 }
      )
    }

    const country = await prisma.country.create({
      data: {
        name,
        code: code.toUpperCase(),
        region,
        isActive: true
      },
      include: {
        _count: {
          select: { AdminUnit: true }
        }
      }
    })

    return NextResponse.json({ success: true, data: country }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating country:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Country code already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create country' },
      { status: 500 }
    )
  }
}

// PUT - Update a country
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, code, region, isActive } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Country ID is required' },
        { status: 400 }
      )
    }

    const country = await prisma.country.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code: code.toUpperCase() }),
        ...(region !== undefined && { region }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        _count: {
          select: { AdminUnit: true }
        }
      }
    })

    return NextResponse.json({ success: true, data: country })
  } catch (error: any) {
    console.error('Error updating country:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Country code already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update country' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a country
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Country ID is required' },
        { status: 400 }
      )
    }

    await prisma.country.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Country deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting country:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete country' },
      { status: 500 }
    )
  }
}


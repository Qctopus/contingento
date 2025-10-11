import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET admin units (optionally filtered by country)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const countryId = searchParams.get('countryId')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const where: any = {}
    if (countryId) where.countryId = countryId
    if (activeOnly) where.isActive = true

    const adminUnits = await prisma.adminUnit.findMany({
      where,
      include: {
        country: true,
        adminUnitRisk: true
      },
      orderBy: [
        { country: { name: 'asc' } },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ success: true, data: adminUnits })
  } catch (error) {
    console.error('Error fetching admin units:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin units' },
      { status: 500 }
    )
  }
}

// POST - Create a new admin unit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, localName, type, region, countryId, population, area, elevation, coordinates } = body

    if (!name || !countryId) {
      return NextResponse.json(
        { success: false, error: 'Name and countryId are required' },
        { status: 400 }
      )
    }

    // Check if country exists
    const country = await prisma.country.findUnique({
      where: { id: countryId }
    })

    if (!country) {
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      )
    }

    const adminUnit = await prisma.adminUnit.create({
      data: {
        name,
        localName,
        type: type || 'parish',
        region,
        countryId,
        population: population || 0,
        area,
        elevation,
        coordinates,
        isActive: true
      },
      include: {
        country: true,
        adminUnitRisk: true
      }
    })

    // Create associated risk record
    await prisma.adminUnitRisk.create({
      data: {
        adminUnitId: adminUnit.id,
        updatedBy: 'system'
      }
    })

    // Fetch the admin unit with the newly created risk record
    const adminUnitWithRisk = await prisma.adminUnit.findUnique({
      where: { id: adminUnit.id },
      include: {
        country: true,
        adminUnitRisk: true
      }
    })

    return NextResponse.json({ success: true, data: adminUnitWithRisk }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating admin unit:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'An admin unit with this name already exists in this country' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create admin unit' },
      { status: 500 }
    )
  }
}

// PUT - Update an admin unit
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, localName, type, region, population, area, elevation, coordinates, isActive } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Admin unit ID is required' },
        { status: 400 }
      )
    }

    const adminUnit = await prisma.adminUnit.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(localName !== undefined && { localName }),
        ...(type && { type }),
        ...(region !== undefined && { region }),
        ...(population !== undefined && { population }),
        ...(area !== undefined && { area }),
        ...(elevation !== undefined && { elevation }),
        ...(coordinates !== undefined && { coordinates }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        country: true,
        adminUnitRisk: true
      }
    })

    return NextResponse.json({ success: true, data: adminUnit })
  } catch (error: any) {
    console.error('Error updating admin unit:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Admin unit not found' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'An admin unit with this name already exists in this country' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update admin unit' },
      { status: 500 }
    )
  }
}

// DELETE - Delete an admin unit
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Admin unit ID is required' },
        { status: 400 }
      )
    }

    await prisma.adminUnit.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Admin unit deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting admin unit:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Admin unit not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete admin unit' },
      { status: 500 }
    )
  }
}


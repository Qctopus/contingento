import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const businessTypes = await prisma.adminBusinessType.findMany({
      where: { isActive: true },
      include: {
        businessTypeHazards: {
          include: {
            hazard: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ businessTypes })
  } catch (error) {
    console.error('Error fetching business types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business types' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const businessType = await prisma.adminBusinessType.create({
      data: {
        businessTypeId: body.businessTypeId,
        name: body.name,
        localName: body.localName,
        category: body.category,
        description: body.description,
        typicalOperatingHours: body.typicalOperatingHours,
        minimumStaff: body.minimumStaff,
        minimumEquipment: body.minimumEquipment ? JSON.stringify(body.minimumEquipment) : null,
        minimumUtilities: body.minimumUtilities ? JSON.stringify(body.minimumUtilities) : null,
        minimumSpace: body.minimumSpace,
        essentialFunctions: body.essentialFunctions ? JSON.stringify(body.essentialFunctions) : null,
        criticalSuppliers: body.criticalSuppliers ? JSON.stringify(body.criticalSuppliers) : null,
        exampleBusinessPurposes: body.exampleBusinessPurposes ? JSON.stringify(body.exampleBusinessPurposes) : null,
        exampleProducts: body.exampleProducts ? JSON.stringify(body.exampleProducts) : null,
        exampleKeyPersonnel: body.exampleKeyPersonnel ? JSON.stringify(body.exampleKeyPersonnel) : null,
        exampleCustomerBase: body.exampleCustomerBase ? JSON.stringify(body.exampleCustomerBase) : null,
      }
    })

    return NextResponse.json({ businessType }, { status: 201 })
  } catch (error) {
    console.error('Error creating business type:', error)
    return NextResponse.json(
      { error: 'Failed to create business type' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    // Process JSON fields
    const processedData: any = { ...updateData }
    const jsonFields = ['minimumEquipment', 'minimumUtilities', 'essentialFunctions', 'criticalSuppliers', 'exampleBusinessPurposes', 'exampleProducts', 'exampleKeyPersonnel', 'exampleCustomerBase']
    
    jsonFields.forEach(field => {
      if (processedData[field] !== undefined) {
        processedData[field] = processedData[field] ? JSON.stringify(processedData[field]) : null
      }
    })

    const businessType = await prisma.adminBusinessType.update({
      where: { id },
      data: processedData
    })

    return NextResponse.json({ businessType })
  } catch (error) {
    console.error('Error updating business type:', error)
    return NextResponse.json(
      { error: 'Failed to update business type' },
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
    await prisma.adminBusinessType.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting business type:', error)
    return NextResponse.json(
      { error: 'Failed to delete business type' },
      { status: 500 }
    )
  }
} 
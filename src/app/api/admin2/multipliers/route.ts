import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET all multipliers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'
    
    const multipliers = await prisma.riskMultiplier.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [
        { priority: 'asc' },
        { name: 'asc' }
      ]
    })
    
    console.log(`📊 Retrieved ${multipliers.length} risk multipliers`)
    
    return NextResponse.json({
      success: true,
      multipliers: multipliers.map(m => ({
        ...m,
        applicableHazards: JSON.parse(m.applicableHazards)
      }))
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
      createdBy = 'admin'
    } = body
    
    // Validation
    if (!name || !description || !characteristicType || !conditionType || !multiplierFactor || !applicableHazards) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const multiplier = await prisma.riskMultiplier.create({
      data: {
        name,
        description,
        characteristicType,
        conditionType,
        thresholdValue,
        minValue,
        maxValue,
        multiplierFactor,
        applicableHazards: JSON.stringify(applicableHazards),
        priority: priority || 0,
        reasoning,
        isActive,
        createdBy
      }
    })
    
    console.log(`✅ Created multiplier: ${name}`)
    
    return NextResponse.json({
      success: true,
      multiplier: {
        ...multiplier,
        applicableHazards: JSON.parse(multiplier.applicableHazards)
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
    
    // Convert applicableHazards to JSON string if it's an array
    if (updates.applicableHazards && Array.isArray(updates.applicableHazards)) {
      updates.applicableHazards = JSON.stringify(updates.applicableHazards)
    }
    
    const multiplier = await prisma.riskMultiplier.update({
      where: { id },
      data: updates
    })
    
    console.log(`✅ Updated multiplier: ${multiplier.name}`)
    
    return NextResponse.json({
      success: true,
      multiplier: {
        ...multiplier,
        applicableHazards: JSON.parse(multiplier.applicableHazards)
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




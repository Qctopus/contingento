import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get single cost item
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.costItem.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            strategyItems: true,
            actionStepItems: true
          }
        }
      }
    })
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
    
    return NextResponse.json({ item })
  } catch (error) {
    console.error('Failed to fetch cost item:', error)
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 })
  }
}

// PUT - Update cost item
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()
    
    const item = await prisma.costItem.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        baseUSD: parseFloat(data.baseUSD),
        baseUSDMin: data.baseUSDMin ? parseFloat(data.baseUSDMin) : null,
        baseUSDMax: data.baseUSDMax ? parseFloat(data.baseUSDMax) : null,
        unit: data.unit,
        complexity: data.complexity,
        notes: data.notes,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({ item })
  } catch (error) {
    console.error('Failed to update cost item:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

// DELETE - Soft delete cost item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.costItem.update({
      where: { id: params.id },
      data: { isActive: false }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete cost item:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}


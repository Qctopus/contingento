import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get cost items for a strategy
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const items = await prisma.strategyItemCost.findMany({
      where: { strategyId: params.id },
      include: {
        item: true
      },
      orderBy: { displayOrder: 'asc' }
    })
    
    return NextResponse.json({ items })
  } catch (error) {
    console.error('Failed to fetch strategy cost items:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

// POST - Update cost items for a strategy
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { items } = await req.json()
    
    // Delete existing links
    await prisma.strategyItemCost.deleteMany({
      where: { strategyId: params.id }
    })
    
    // Create new links
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      await prisma.strategyItemCost.create({
        data: {
          strategyId: params.id,
          itemId: item.itemId,
          quantity: item.quantity || 1,
          customNotes: item.customNotes || null,
          countryOverrides: item.countryOverrides ? JSON.stringify(item.countryOverrides) : null,
          isRequired: item.isRequired !== false,
          displayOrder: i
        }
      })
    }
    
    return NextResponse.json({ success: true, count: items.length })
  } catch (error) {
    console.error('Failed to update strategy cost items:', error)
    return NextResponse.json({ error: 'Failed to update items' }, { status: 500 })
  }
}


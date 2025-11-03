import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List all cost items
export async function GET(req: NextRequest) {
  try {
    const items = await prisma.costItem.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            strategyItems: true,
            actionStepItems: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json({ items })
  } catch (error) {
    console.error('Failed to fetch cost items:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

// POST - Create new cost item
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    const item = await prisma.costItem.create({
      data: {
        itemId: data.itemId,
        name: data.name,
        description: data.description,
        category: data.category,
        baseUSD: parseFloat(data.baseUSD),
        baseUSDMin: data.baseUSDMin ? parseFloat(data.baseUSDMin) : null,
        baseUSDMax: data.baseUSDMax ? parseFloat(data.baseUSDMax) : null,
        unit: data.unit,
        complexity: data.complexity || 'medium',
        notes: data.notes,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        budgetAlternativeId: data.budgetAlternativeId,
        premiumAlternativeId: data.premiumAlternativeId
      }
    })
    
    return NextResponse.json({ item })
  } catch (error) {
    console.error('Failed to create cost item:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}


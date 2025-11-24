import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List all cost items or get by itemId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get('itemId')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // If itemId is provided, fetch specific item
    if (itemId) {
      const item = await prisma.costItem.findUnique({
        where: { itemId }
      })
      return NextResponse.json({ items: item ? [item] : [] })
    }

    // Build where clause for filtering
    const where: any = { isActive: true }
    if (category) {
      where.category = category
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const items = await prisma.costItem.findMany({
      where,
      include: {
        _count: {
          select: {
            ActionStepItemCost: true,
            StrategyItemCost: true
          }
        } as any
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


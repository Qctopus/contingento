import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List all country multipliers OR get by countryCode
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const countryCode = searchParams.get('countryCode')
    
    // If countryCode is provided, return single multiplier
    if (countryCode) {
      const multiplier = await prisma.countryCostMultiplier.findUnique({
        where: { countryCode }
      })
      
      if (!multiplier) {
        return NextResponse.json(
          { error: 'Country multiplier not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(multiplier)
    }
    
    // Otherwise, list all multipliers
    const multipliers = await prisma.countryCostMultiplier.findMany({
      orderBy: { countryCode: 'asc' }
    })
    
    // Get country names from AdminLocation
    const countryNames: Record<string, string> = {}
    const countries = await prisma.adminLocation.findMany({
      where: { 
        parish: null,
        countryCode: { in: multipliers.map(m => m.countryCode) }
      },
      select: { countryCode: true, country: true }
    })
    
    countries.forEach(c => {
      countryNames[c.countryCode] = c.country
    })
    
    // Enrich multipliers with country names
    const enrichedMultipliers = multipliers.map(m => ({
      ...m,
      country: {
        name: countryNames[m.countryCode] || m.countryCode
      }
    }))
    
    return NextResponse.json({ multipliers: enrichedMultipliers })
  } catch (error) {
    console.error('Failed to fetch multipliers:', error)
    return NextResponse.json({ error: 'Failed to fetch multipliers' }, { status: 500 })
  }
}

// POST - Create new country multiplier (auto-sync from AdminLocation)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    const multiplier = await prisma.countryCostMultiplier.create({
      data: {
        countryCode: data.countryCode,
        construction: data.construction || 1.0,
        equipment: data.equipment || 1.0,
        service: data.service || 1.0,
        supplies: data.supplies || 1.0,
        currency: data.currency,
        currencySymbol: data.currencySymbol,
        exchangeRateUSD: parseFloat(data.exchangeRateUSD),
        dataSource: data.dataSource,
        confidenceLevel: data.confidenceLevel || 'medium',
        notes: data.notes
      }
    })
    
    return NextResponse.json({ multiplier })
  } catch (error) {
    console.error('Failed to create multiplier:', error)
    return NextResponse.json({ error: 'Failed to create multiplier' }, { status: 500 })
  }
}


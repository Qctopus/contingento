import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const parishes = await prisma.parish.findMany({
      where: { isActive: true },
      include: {
        parishRisk: true
      },
      orderBy: [
        { region: 'asc' },
        { name: 'asc' }
      ]
    })

    // Transform data for frontend
    const transformedParishes = parishes.map(parish => ({
      id: parish.id,
      name: parish.name,
      region: parish.region,
      population: parish.population,
      riskProfile: {
        hurricane: {
          level: parish.ParishRisk?.hurricaneLevel || 0,
          notes: parish.ParishRisk?.hurricaneNotes || ''
        },
        flood: {
          level: parish.ParishRisk?.floodLevel || 0,
          notes: parish.ParishRisk?.floodNotes || ''
        },
        earthquake: {
          level: parish.ParishRisk?.earthquakeLevel || 0,
          notes: parish.ParishRisk?.earthquakeNotes || ''
        },
        drought: {
          level: parish.ParishRisk?.droughtLevel || 0,
          notes: parish.ParishRisk?.droughtNotes || ''
        },
        landslide: {
          level: parish.ParishRisk?.landslideLevel || 0,
          notes: parish.ParishRisk?.landslideNotes || ''
        },
        powerOutage: {
          level: parish.ParishRisk?.powerOutageLevel || 0,
          notes: parish.ParishRisk?.powerOutageNotes || ''
        },
        lastUpdated: parish.ParishRisk?.lastUpdated.toISOString() || new Date().toISOString(),
        updatedBy: parish.ParishRisk?.updatedBy || 'system'
      }
    }))

    return NextResponse.json(transformedParishes)
  } catch (error) {
    console.error('Error fetching parishes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch parishes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, region, population } = data

    if (!name || !region) {
      return NextResponse.json(
        { error: 'Name and region are required' },
        { status: 400 }
      )
    }

    // Create parish
    const parish = await prisma.parish.create({
      data: {
        name,
        region,
        population: population || 0
      }
    })

    // Create initial risk profile
    await prisma.parishRisk.create({
      data: {
        parishId: parish.id,
        updatedBy: 'admin'
      }
    })

    return NextResponse.json({ success: true, id: parish.id })
  } catch (error) {
    console.error('Error creating parish:', error)
    return NextResponse.json(
      { error: 'Failed to create parish' },
      { status: 500 }
    )
  }
}


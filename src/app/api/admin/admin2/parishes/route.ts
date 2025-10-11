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
          level: parish.parishRisk?.hurricaneLevel || 0,
          notes: parish.parishRisk?.hurricaneNotes || ''
        },
        flood: {
          level: parish.parishRisk?.floodLevel || 0,
          notes: parish.parishRisk?.floodNotes || ''
        },
        earthquake: {
          level: parish.parishRisk?.earthquakeLevel || 0,
          notes: parish.parishRisk?.earthquakeNotes || ''
        },
        drought: {
          level: parish.parishRisk?.droughtLevel || 0,
          notes: parish.parishRisk?.droughtNotes || ''
        },
        landslide: {
          level: parish.parishRisk?.landslideLevel || 0,
          notes: parish.parishRisk?.landslideNotes || ''
        },
        powerOutage: {
          level: parish.parishRisk?.powerOutageLevel || 0,
          notes: parish.parishRisk?.powerOutageNotes || ''
        },
        lastUpdated: parish.parishRisk?.lastUpdated.toISOString() || new Date().toISOString(),
        updatedBy: parish.parishRisk?.updatedBy || 'system'
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


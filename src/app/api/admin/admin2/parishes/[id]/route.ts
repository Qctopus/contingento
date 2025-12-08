import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const parish = await prisma.parish.findUnique({
      where: { id: params.id },
      include: {
        parishRisk: {
          include: {
            changeLogs: {
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        }
      }
    })

    if (!parish) {
      return NextResponse.json(
        { error: 'Parish not found' },
        { status: 404 }
      )
    }

    // Transform data for frontend
    const transformedParish = {
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
      },
      changeHistory: parish.ParishRisk?.changeLogs || []
    }

    return NextResponse.json(transformedParish)
  } catch (error) {
    console.error('Error fetching parish:', error)
    return NextResponse.json(
      { error: 'Failed to fetch parish' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { riskProfile, updatedBy = 'admin' } = data

    // Get current parish and risk data for comparison
    const currentParish = await prisma.parish.findUnique({
      where: { id: params.id },
      include: { ParishRisk: true }
    })

    if (!currentParish) {
      return NextResponse.json(
        { error: 'Parish not found' },
        { status: 404 }
      )
    }

    // Prepare risk updates
    const riskUpdates = {
      hurricaneLevel: riskProfile.hurricane.level,
      hurricaneNotes: riskProfile.hurricane.notes,
      floodLevel: riskProfile.flood.level,
      floodNotes: riskProfile.flood.notes,
      earthquakeLevel: riskProfile.earthquake.level,
      earthquakeNotes: riskProfile.earthquake.notes,
      droughtLevel: riskProfile.drought.level,
      droughtNotes: riskProfile.drought.notes,
      landslideLevel: riskProfile.landslide.level,
      landslideNotes: riskProfile.landslide.notes,
      powerOutageLevel: riskProfile.powerOutage.level,
      powerOutageNotes: riskProfile.powerOutage.notes,
      lastUpdated: new Date(),
      updatedBy
    }

    // Create change logs for modified risks
    const changeLogs = []
    if (currentParish.ParishRisk) {
      const riskTypes = [
        { key: 'hurricane', levelField: 'hurricaneLevel', notesField: 'hurricaneNotes' },
        { key: 'flood', levelField: 'floodLevel', notesField: 'floodNotes' },
        { key: 'earthquake', levelField: 'earthquakeLevel', notesField: 'earthquakeNotes' },
        { key: 'drought', levelField: 'droughtLevel', notesField: 'droughtNotes' },
        { key: 'landslide', levelField: 'landslideLevel', notesField: 'landslideNotes' },
        { key: 'powerOutage', levelField: 'powerOutageLevel', notesField: 'powerOutageNotes' }
      ]

      for (const riskType of riskTypes) {
        const oldLevel = currentParish.ParishRisk[riskType.levelField as keyof typeof currentParish.ParishRisk] as number
        const newLevel = riskUpdates[riskType.levelField as keyof typeof riskUpdates] as number
        const oldNotes = currentParish.ParishRisk[riskType.notesField as keyof typeof currentParish.ParishRisk] as string
        const newNotes = riskUpdates[riskType.notesField as keyof typeof riskUpdates] as string

        if (oldLevel !== newLevel || oldNotes !== newNotes) {
          changeLogs.push({
            parishRiskId: currentParish.ParishRisk.id,
            riskType: riskType.key,
            oldLevel,
            newLevel,
            oldNotes: oldNotes || '',
            newNotes: newNotes || '',
            changedBy: updatedBy
          })
        }
      }
    }

    // Update or create parish risk
    const parishRisk = await prisma.parishRisk.upsert({
      where: { parishId: params.id },
      update: riskUpdates,
      create: {
        parishId: params.id,
        ...riskUpdates
      }
    })

    // Create change log entries
    if (changeLogs.length > 0) {
      await prisma.riskChangeLog.createMany({
        data: changeLogs
      })
    }

    return NextResponse.json({ success: true, id: parishRisk.id })
  } catch (error) {
    console.error('Error updating parish:', error)
    return NextResponse.json(
      { error: 'Failed to update parish' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.parish.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting parish:', error)
    return NextResponse.json(
      { error: 'Failed to delete parish' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the parish first to verify it exists
    const parish = await prisma.parish.findUnique({
      where: { id: params.id }
    })

    if (!parish) {
      return NextResponse.json(
        { error: 'Parish not found' },
        { status: 404 }
      )
    }

    // Get the parish risk to get change logs
    const parishRisk = await prisma.parishRisk.findUnique({
      where: { parishId: params.id },
      include: {
        changeLogs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!parishRisk) {
      return NextResponse.json([])
    }

    // Format the change logs for frontend
    const formattedChangeLogs = parishRisk.changeLogs.map(log => ({
      id: log.id,
      riskType: log.riskType,
      oldLevel: log.oldLevel,
      newLevel: log.newLevel,
      oldNotes: log.oldNotes,
      newNotes: log.newNotes,
      changedBy: log.changedBy,
      changedAt: log.createdAt.toISOString(),
      summary: `${log.riskType.charAt(0).toUpperCase() + log.riskType.slice(1)} risk changed from ${log.oldLevel} to ${log.newLevel}`
    }))

    return NextResponse.json(formattedChangeLogs)
  } catch (error) {
    console.error('Error fetching parish change history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch change history' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

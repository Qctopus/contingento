import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// PUT - Update admin unit risk data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminUnitId, riskProfile, updatedBy } = body

    if (!adminUnitId || !riskProfile) {
      return NextResponse.json(
        { success: false, error: 'adminUnitId and riskProfile are required' },
        { status: 400 }
      )
    }

    // Check if admin unit exists
    const adminUnit = await prisma.adminUnit.findUnique({
      where: { id: adminUnitId },
      include: { adminUnitRisk: true }
    })

    if (!adminUnit) {
      return NextResponse.json(
        { success: false, error: 'Admin unit not found' },
        { status: 404 }
      )
    }

    // Prepare risk data
    const riskData: any = {
      lastUpdated: new Date(),
      updatedBy: updatedBy || 'system'
    }

    // Map standard risk fields
    if (riskProfile.hurricane) {
      riskData.hurricaneLevel = riskProfile.hurricane.level || 0
      riskData.hurricaneNotes = riskProfile.hurricane.notes || ''
    }
    if (riskProfile.flood) {
      riskData.floodLevel = riskProfile.flood.level || 0
      riskData.floodNotes = riskProfile.flood.notes || ''
    }
    if (riskProfile.earthquake) {
      riskData.earthquakeLevel = riskProfile.earthquake.level || 0
      riskData.earthquakeNotes = riskProfile.earthquake.notes || ''
    }
    if (riskProfile.drought) {
      riskData.droughtLevel = riskProfile.drought.level || 0
      riskData.droughtNotes = riskProfile.drought.notes || ''
    }
    if (riskProfile.landslide) {
      riskData.landslideLevel = riskProfile.landslide.level || 0
      riskData.landslideNotes = riskProfile.landslide.notes || ''
    }
    if (riskProfile.powerOutage) {
      riskData.powerOutageLevel = riskProfile.powerOutage.level || 0
      riskData.powerOutageNotes = riskProfile.powerOutage.notes || ''
    }

    // Store complete risk profile as JSON for dynamic risks
    riskData.riskProfileJson = JSON.stringify(riskProfile)

    // Update or create risk record
    let adminUnitRisk
    if (adminUnit.adminUnitRisk) {
      // Log changes for audit trail
      const oldRisk = adminUnit.adminUnitRisk
      const changeLogs = []

      // Check each risk type for changes
      const riskTypes = ['hurricane', 'flood', 'earthquake', 'drought', 'landslide', 'powerOutage']
      for (const riskType of riskTypes) {
        const levelField = `${riskType}Level` as keyof typeof oldRisk
        const oldLevel = oldRisk[levelField] as number || 0
        const newLevel = riskData[levelField] || 0

        if (oldLevel !== newLevel) {
          changeLogs.push({
            adminUnitRiskId: oldRisk.id,
            riskType,
            oldLevel,
            newLevel,
            oldNotes: (oldRisk as any)[`${riskType}Notes`] || '',
            newNotes: riskData[`${riskType}Notes`] || '',
            changedBy: updatedBy || 'system',
            changeReason: 'Risk assessment update'
          })
        }
      }

      // Create change log entries
      if (changeLogs.length > 0) {
        await prisma.adminUnitRiskChangeLog.createMany({
          data: changeLogs
        })
      }

      adminUnitRisk = await prisma.adminUnitRisk.update({
        where: { id: oldRisk.id },
        data: riskData
      })
    } else {
      adminUnitRisk = await prisma.adminUnitRisk.create({
        data: {
          adminUnitId,
          ...riskData
        }
      })
    }

    return NextResponse.json({ success: true, data: adminUnitRisk })
  } catch (error: any) {
    console.error('Error updating admin unit risk:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update admin unit risk' },
      { status: 500 }
    )
  }
}

// GET - Get risk change history for an admin unit
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminUnitId = searchParams.get('adminUnitId')

    if (!adminUnitId) {
      return NextResponse.json(
        { success: false, error: 'adminUnitId is required' },
        { status: 400 }
      )
    }

    const adminUnit = await prisma.adminUnit.findUnique({
      where: { id: adminUnitId },
      include: {
        adminUnitRisk: {
          include: {
            changeLogs: {
              orderBy: { createdAt: 'desc' },
              take: 50
            }
          }
        }
      }
    })

    if (!adminUnit) {
      return NextResponse.json(
        { success: false, error: 'Admin unit not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: adminUnit.adminUnitRisk })
  } catch (error) {
    console.error('Error fetching admin unit risk history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch risk history' },
      { status: 500 }
    )
  }
}


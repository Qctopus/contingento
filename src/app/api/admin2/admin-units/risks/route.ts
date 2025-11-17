import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// PUT - Update admin unit risk profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminUnitId, riskData } = body

    if (!adminUnitId || !riskData) {
      return NextResponse.json(
        { success: false, error: 'Admin unit ID and risk data are required' },
        { status: 400 }
      )
    }

    // Check if admin unit exists
    const adminUnit = await prisma.adminUnit.findUnique({
      where: { id: adminUnitId }
    })

    if (!adminUnit) {
      return NextResponse.json(
        { success: false, error: 'Admin unit not found' },
        { status: 404 }
      )
    }

    // Check if risk profile exists
    const existingRisk = await prisma.adminUnitRisk.findUnique({
      where: { adminUnitId }
    })

    let updatedRisk
    if (existingRisk) {
      // Update existing risk profile
      updatedRisk = await prisma.adminUnitRisk.update({
        where: { adminUnitId },
        data: {
          hurricaneLevel: riskData.hurricaneLevel || 0,
          hurricaneNotes: riskData.hurricaneNotes || '',
          floodLevel: riskData.floodLevel || 0,
          floodNotes: riskData.floodNotes || '',
          earthquakeLevel: riskData.earthquakeLevel || 0,
          earthquakeNotes: riskData.earthquakeNotes || '',
          droughtLevel: riskData.droughtLevel || 0,
          droughtNotes: riskData.droughtNotes || '',
          landslideLevel: riskData.landslideLevel || 0,
          landslideNotes: riskData.landslideNotes || '',
          powerOutageLevel: riskData.powerOutageLevel || 0,
          powerOutageNotes: riskData.powerOutageNotes || '',
          riskProfileJson: riskData.riskProfileJson || '{}',
          lastUpdated: new Date(),
          updatedBy: riskData.updatedBy || 'admin'
        }
      })

      // Log the change
      await prisma.adminUnitRiskChangeLog.create({
        data: {
          adminUnitRiskId: updatedRisk.id,
          riskType: 'multiple',
          oldLevel: 0,
          newLevel: 0,
          oldNotes: 'Bulk update',
          newNotes: 'Risk profile updated',
          changedBy: riskData.updatedBy || 'admin',
          changeReason: 'Risk profile edit via admin panel'
        }
      })
    } else {
      // Create new risk profile
      updatedRisk = await prisma.adminUnitRisk.create({
        data: {
          adminUnitId,
          hurricaneLevel: riskData.hurricaneLevel || 0,
          hurricaneNotes: riskData.hurricaneNotes || '',
          floodLevel: riskData.floodLevel || 0,
          floodNotes: riskData.floodNotes || '',
          earthquakeLevel: riskData.earthquakeLevel || 0,
          earthquakeNotes: riskData.earthquakeNotes || '',
          droughtLevel: riskData.droughtLevel || 0,
          droughtNotes: riskData.droughtNotes || '',
          landslideLevel: riskData.landslideLevel || 0,
          landslideNotes: riskData.landslideNotes || '',
          powerOutageLevel: riskData.powerOutageLevel || 0,
          powerOutageNotes: riskData.powerOutageNotes || '',
          riskProfileJson: riskData.riskProfileJson || '{}',
          lastUpdated: new Date(),
          updatedBy: riskData.updatedBy || 'admin'
        }
      })
    }

    return NextResponse.json({ success: true, data: updatedRisk })
  } catch (error: any) {
    console.error('Error updating admin unit risks:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to update admin unit risks' },
      { status: 500 }
    )
  }
}




























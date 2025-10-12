import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Export admin units as CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const countryId = searchParams.get('countryId')

    if (!countryId) {
      return NextResponse.json(
        { success: false, error: 'Country ID is required' },
        { status: 400 }
      )
    }

    const adminUnits = await prisma.adminUnit.findMany({
      where: {
        countryId,
        isActive: true
      },
      include: {
        adminUnitRisk: true
      },
      orderBy: { name: 'asc' }
    })

    // Create CSV headers
    const headers = [
      'ID',
      'Unit Name',
      'Local Name',
      'Type',
      'Region',
      'Population',
      'Hurricane Level',
      'Hurricane Notes',
      'Flood Level',
      'Flood Notes',
      'Earthquake Level',
      'Earthquake Notes',
      'Drought Level',
      'Drought Notes',
      'Landslide Level',
      'Landslide Notes',
      'Power Outage Level',
      'Power Outage Notes'
    ]

    // Create CSV rows
    const rows = adminUnits.map(unit => [
      unit.id,
      unit.name,
      unit.localName || '',
      unit.type,
      unit.region || '',
      unit.population.toString(),
      unit.adminUnitRisk?.hurricaneLevel?.toString() || '0',
      unit.adminUnitRisk?.hurricaneNotes || '',
      unit.adminUnitRisk?.floodLevel?.toString() || '0',
      unit.adminUnitRisk?.floodNotes || '',
      unit.adminUnitRisk?.earthquakeLevel?.toString() || '0',
      unit.adminUnitRisk?.earthquakeNotes || '',
      unit.adminUnitRisk?.droughtLevel?.toString() || '0',
      unit.adminUnitRisk?.droughtNotes || '',
      unit.adminUnitRisk?.landslideLevel?.toString() || '0',
      unit.adminUnitRisk?.landslideNotes || '',
      unit.adminUnitRisk?.powerOutageLevel?.toString() || '0',
      unit.adminUnitRisk?.powerOutageNotes || ''
    ])

    // Escape and quote CSV fields properly
    const escapeCSV = (field: string) => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`
      }
      return field
    }

    // Generate CSV content
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n')

    // Return CSV as response
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="admin-units-export.csv"`
      }
    })
  } catch (error) {
    console.error('Error exporting admin units:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export admin units' },
      { status: 500 }
    )
  }
}



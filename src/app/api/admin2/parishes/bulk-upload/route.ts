import { NextRequest, NextResponse } from 'next/server'
import { 
  getPrismaClient, 
  withDatabase, 
  createSuccessResponse, 
  handleApiError,
  createErrorResponse
} from '@/lib/admin2/api-utils'

interface CSVParishData {
  parishName: string
  region: string
  population: number
  hurricaneLevel: number
  hurricaneNotes: string
  floodLevel: number
  floodNotes: string
  earthquakeLevel: number
  earthquakeNotes: string
  droughtLevel: number
  droughtNotes: string
  landslideLevel: number
  landslideNotes: string
  powerOutageLevel: number
  powerOutageNotes: string
  area?: number
  elevation?: number
  coordinates?: string
}

function parseCSVRow(row: string): string[] {
  const result: string[] = []
  let inQuotes = false
  let current = ''
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function validateRiskLevel(level: any): number {
  const parsed = parseInt(String(level))
  if (isNaN(parsed) || parsed < 0 || parsed > 10) {
    return 0
  }
  return parsed
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const replaceAll = formData.get('replaceAll') === 'true'
    
    if (!file) {
      return createErrorResponse('No file provided', 400)
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return createErrorResponse('CSV file must contain at least a header row and one data row', 400)
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const expectedHeaders = [
      'Parish Name', 'Region', 'Is Coastal', 'Is Urban', 'Population',
      'Hurricane Risk', 'Hurricane Notes', 'Flood Risk', 'Flood Notes',
      'Earthquake Risk', 'Earthquake Notes', 'Drought Risk', 'Drought Notes',
      'Landslide Risk', 'Landslide Notes', 'Power Outage Risk', 'Power Outage Notes',
      'Area', 'Elevation', 'Coordinates'
    ]

    // Validate required headers
    const requiredHeaders = ['Parish Name', 'Region']
    const missingHeaders = requiredHeaders.filter(h => !header.includes(h))
    if (missingHeaders.length > 0) {
      return createErrorResponse(`Missing required headers: ${missingHeaders.join(', ')}`, 400)
    }

    let processed = 0
    let updated = 0
    let created = 0
    const errors: string[] = []
    const warnings: string[] = []

    const result = await withDatabase(async () => {
      const prisma = getPrismaClient()

      // If replaceAll is true, we'll replace all data
      if (replaceAll) {
        console.log('🔄 Bulk upload: Replacing all parish data')
        warnings.push('All existing parish data will be replaced with CSV data')
      }

      // Process each data row
      for (let i = 1; i < lines.length; i++) {
        try {
          const row = parseCSVRow(lines[i])
          if (row.length < requiredHeaders.length) {
            errors.push(`Row ${i + 1}: Insufficient columns`)
            continue
          }

          const rowData: any = {}
          header.forEach((h, index) => {
            const value = row[index]?.trim().replace(/"/g, '') || ''
            rowData[h] = value
          })

          // Validate and convert data
          const parishName = rowData['Parish Name']
          if (!parishName) {
            errors.push(`Row ${i + 1}: Parish Name is required`)
            continue
          }

          const parishData = {
            name: parishName,
            region: rowData['Region'] || '',
            population: parseInt(rowData['Population']) || 0,
            area: rowData['Area'] ? parseFloat(rowData['Area']) : undefined,
            elevation: rowData['Elevation'] ? parseFloat(rowData['Elevation']) : undefined,
            coordinates: rowData['Coordinates'] || undefined
          }

          // Risk profile data
          const riskData = {
            hurricaneLevel: validateRiskLevel(rowData['Hurricane Risk']),
            hurricaneNotes: rowData['Hurricane Notes'] || '',
            floodLevel: validateRiskLevel(rowData['Flood Risk']),
            floodNotes: rowData['Flood Notes'] || '',
            earthquakeLevel: validateRiskLevel(rowData['Earthquake Risk']),
            earthquakeNotes: rowData['Earthquake Notes'] || '',
            droughtLevel: validateRiskLevel(rowData['Drought Risk']),
            droughtNotes: rowData['Drought Notes'] || '',
            landslideLevel: validateRiskLevel(rowData['Landslide Risk']),
            landslideNotes: rowData['Landslide Notes'] || '',
            powerOutageLevel: validateRiskLevel(rowData['Power Outage Risk']),
            powerOutageNotes: rowData['Power Outage Notes'] || '',
            riskProfileJson: JSON.stringify({
              hurricane: { level: validateRiskLevel(rowData['Hurricane Risk']), notes: rowData['Hurricane Notes'] || '' },
              flood: { level: validateRiskLevel(rowData['Flood Risk']), notes: rowData['Flood Notes'] || '' },
              earthquake: { level: validateRiskLevel(rowData['Earthquake Risk']), notes: rowData['Earthquake Notes'] || '' },
              drought: { level: validateRiskLevel(rowData['Drought Risk']), notes: rowData['Drought Notes'] || '' },
              landslide: { level: validateRiskLevel(rowData['Landslide Risk']), notes: rowData['Landslide Notes'] || '' },
              powerOutage: { level: validateRiskLevel(rowData['Power Outage Risk']), notes: rowData['Power Outage Notes'] || '' }
            }),
            lastUpdated: new Date(),
            updatedBy: 'csv-upload'
          }

          // Find existing parish by name
          const existingParish = await prisma.parish.findFirst({
            where: { name: parishName },
            include: { parishRisk: true }
          })

          if (existingParish) {
            // Update existing parish
            await prisma.parish.update({
              where: { id: existingParish.id },
              data: parishData
            })

            // Update or create parish risk
            if (existingParish.parishRisk) {
              await prisma.parishRisk.update({
                where: { id: existingParish.parishRisk.id },
                data: riskData
              })
            } else {
              await prisma.parishRisk.create({
                data: {
                  ...riskData,
                  parishId: existingParish.id
                }
              })
            }
            updated++
          } else {
            // Create new parish with risk profile
            const newParish = await prisma.parish.create({
              data: parishData
            })

            await prisma.parishRisk.create({
              data: {
                ...riskData,
                parishId: newParish.id
              }
            })
            created++
          }

          processed++
        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error)
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      return { processed, updated, created, errors, warnings }
    }, 'POST /api/admin2/parishes/bulk-upload')

    const summary = {
      success: true,
      message: `Processed ${result.processed} parishes: ${result.created} created, ${result.updated} updated`,
      details: {
        totalProcessed: result.processed,
        created: result.created,
        updated: result.updated,
        errors: result.errors,
        warnings: result.warnings
      }
    }

    console.log('🏝️ Parish bulk upload completed:', summary)
    return createSuccessResponse(summary)

  } catch (error) {
    return handleApiError(error, 'Failed to process parish bulk upload')
  }
}

export async function GET() {
  try {
    const parishes = await withDatabase(async () => {
      const prisma = getPrismaClient()
      return await prisma.parish.findMany({
        where: { isActive: true },
        include: { parishRisk: true },
        orderBy: [
          { region: 'asc' },
          { name: 'asc' }
        ]
      })
    }, 'GET /api/admin2/parishes/bulk-upload')

    // Generate CSV headers
    const csvHeaders = [
      'Parish Name', 'Region', 'Population',
      'Hurricane Risk', 'Hurricane Notes', 'Flood Risk', 'Flood Notes',
      'Earthquake Risk', 'Earthquake Notes', 'Drought Risk', 'Drought Notes',
      'Landslide Risk', 'Landslide Notes', 'Power Outage Risk', 'Power Outage Notes',
      'Area', 'Elevation', 'Coordinates'
    ]

    // Generate CSV rows
    const csvRows = parishes.map(parish => {
      const risk = parish.parishRisk
      return [
        parish.name,
        parish.region,
        parish.population,
        risk?.hurricaneLevel || 0,
        risk?.hurricaneNotes || '',
        risk?.floodLevel || 0,
        risk?.floodNotes || '',
        risk?.earthquakeLevel || 0,
        risk?.earthquakeNotes || '',
        risk?.droughtLevel || 0,
        risk?.droughtNotes || '',
        risk?.landslideLevel || 0,
        risk?.landslideNotes || '',
        risk?.powerOutageLevel || 0,
        risk?.powerOutageNotes || '',
        parish.area || '',
        parish.elevation || '',
        parish.coordinates || ''
      ].map(field => `"${field || ''}"`).join(',')
    })

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="jamaica_parishes_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    return handleApiError(error, 'Failed to export parishes')
  }
}

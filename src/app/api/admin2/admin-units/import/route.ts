import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - Import admin units from CSV
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const replaceAll = formData.get('replaceAll') === 'true'
    const countryId = formData.get('countryId') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!countryId) {
      return NextResponse.json(
        { success: false, error: 'Country ID is required' },
        { status: 400 }
      )
    }

    // Read CSV file
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, error: 'CSV file must contain headers and at least one data row' },
        { status: 400 }
      )
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const dataRows = lines.slice(1)

    // Helper function to parse CSV row
    const parseCSVRow = (row: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < row.length; i++) {
        const char = row[i]
        
        if (char === '"') {
          if (inQuotes && row[i + 1] === '"') {
            current += '"'
            i++ // Skip next quote
          } else {
            inQuotes = !inQuotes
          }
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

    let created = 0
    let updated = 0
    const errors: string[] = []

    // If replaceAll, delete existing units for this country
    if (replaceAll) {
      await prisma.adminUnit.deleteMany({
        where: { countryId }
      })
    }

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      try {
        const rowNum = i + 2 // Account for header row and 0-based index
        const values = parseCSVRow(dataRows[i])
        
        if (values.length < 6) {
          errors.push(`Row ${rowNum}: Insufficient columns`)
          continue
        }

        const [
          id, name, localName, type, region, population,
          hurricaneLevel, hurricaneNotes,
          floodLevel, floodNotes,
          earthquakeLevel, earthquakeNotes,
          droughtLevel, droughtNotes,
          landslideLevel, landslideNotes,
          powerOutageLevel, powerOutageNotes
        ] = values

        if (!name || !type) {
          errors.push(`Row ${rowNum}: Missing required fields (name, type)`)
          continue
        }

        // Check if unit exists
        const existingUnit = id ? await prisma.adminUnit.findUnique({
          where: { id },
          include: { adminUnitRisk: true }
        }) : null

        if (existingUnit) {
          // Update existing unit
          await prisma.adminUnit.update({
            where: { id },
            data: {
              name,
              localName: localName || null,
              type,
              region: region || null,
              population: parseInt(population) || 0
            }
          })

          // Update or create risk profile
          if (existingUnit.adminUnitRisk) {
            await prisma.adminUnitRisk.update({
              where: { adminUnitId: id },
              data: {
                hurricaneLevel: parseInt(hurricaneLevel) || 0,
                hurricaneNotes: hurricaneNotes || '',
                floodLevel: parseInt(floodLevel) || 0,
                floodNotes: floodNotes || '',
                earthquakeLevel: parseInt(earthquakeLevel) || 0,
                earthquakeNotes: earthquakeNotes || '',
                droughtLevel: parseInt(droughtLevel) || 0,
                droughtNotes: droughtNotes || '',
                landslideLevel: parseInt(landslideLevel) || 0,
                landslideNotes: landslideNotes || '',
                powerOutageLevel: parseInt(powerOutageLevel) || 0,
                powerOutageNotes: powerOutageNotes || '',
                lastUpdated: new Date(),
                updatedBy: 'csv-import'
              }
            })
          } else {
            await prisma.adminUnitRisk.create({
              data: {
                adminUnitId: id,
                hurricaneLevel: parseInt(hurricaneLevel) || 0,
                hurricaneNotes: hurricaneNotes || '',
                floodLevel: parseInt(floodLevel) || 0,
                floodNotes: floodNotes || '',
                earthquakeLevel: parseInt(earthquakeLevel) || 0,
                earthquakeNotes: earthquakeNotes || '',
                droughtLevel: parseInt(droughtLevel) || 0,
                droughtNotes: droughtNotes || '',
                landslideLevel: parseInt(landslideLevel) || 0,
                landslideNotes: landslideNotes || '',
                powerOutageLevel: parseInt(powerOutageLevel) || 0,
                powerOutageNotes: powerOutageNotes || '',
                updatedBy: 'csv-import'
              }
            })
          }

          updated++
        } else {
          // Create new unit
          const newUnit = await prisma.adminUnit.create({
            data: {
              name,
              localName: localName || null,
              type,
              region: region || null,
              countryId,
              population: parseInt(population) || 0,
              isActive: true
            }
          })

          // Create risk profile
          await prisma.adminUnitRisk.create({
            data: {
              adminUnitId: newUnit.id,
              hurricaneLevel: parseInt(hurricaneLevel) || 0,
              hurricaneNotes: hurricaneNotes || '',
              floodLevel: parseInt(floodLevel) || 0,
              floodNotes: floodNotes || '',
              earthquakeLevel: parseInt(earthquakeLevel) || 0,
              earthquakeNotes: earthquakeNotes || '',
              droughtLevel: parseInt(droughtLevel) || 0,
              droughtNotes: droughtNotes || '',
              landslideLevel: parseInt(landslideLevel) || 0,
              landslideNotes: landslideNotes || '',
              powerOutageLevel: parseInt(powerOutageLevel) || 0,
              powerOutageNotes: powerOutageNotes || '',
              updatedBy: 'csv-import'
            }
          })

          created++
        }
      } catch (error: any) {
        errors.push(`Row ${i + 2}: ${error.message}`)
      }
    }

    const message = replaceAll 
      ? `Import completed: ${created} units created. ${errors.length > 0 ? `${errors.length} errors encountered.` : ''}`
      : `Import completed: ${created} created, ${updated} updated. ${errors.length > 0 ? `${errors.length} errors encountered.` : ''}`

    return NextResponse.json({
      success: true,
      message,
      details: {
        created,
        updated,
        errors: errors.slice(0, 10) // Return first 10 errors only
      }
    })
  } catch (error: any) {
    console.error('Error importing admin units:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to import admin units' },
      { status: 500 }
    )
  }
}











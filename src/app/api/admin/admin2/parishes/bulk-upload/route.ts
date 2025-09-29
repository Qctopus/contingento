import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must contain at least a header row and one data row' },
        { status: 400 }
      )
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const expectedHeaders = [
      'Parish Name', 'Region', 'Coastal', 'Urban', 'Population',
      'Hurricane Level', 'Hurricane Notes', 'Flood Level', 'Flood Notes',
      'Earthquake Level', 'Earthquake Notes', 'Drought Level', 'Drought Notes',
      'Landslide Level', 'Landslide Notes', 'Power Outage Level', 'Power Outage Notes'
    ]

    // Validate headers
    const missingHeaders = expectedHeaders.filter(h => !header.includes(h))
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Missing required headers: ${missingHeaders.join(', ')}` },
        { status: 400 }
      )
    }

    let processed = 0
    let updated = 0
    let created = 0
    const errors: string[] = []

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      try {
        const row = parseCSVRow(lines[i])
        if (row.length < expectedHeaders.length) {
          errors.push(`Row ${i + 1}: Insufficient columns`)
          continue
        }

        const rowData: any = {}
        header.forEach((h, index) => {
          rowData[h] = row[index]?.trim().replace(/"/g, '') || ''
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
          isCoastal: rowData['Coastal']?.toLowerCase() === 'true',
          isUrban: rowData['Urban']?.toLowerCase() === 'true',
          population: parseInt(rowData['Population']) || 0
        }

        // Validate risk levels
        const riskData = {
          hurricaneLevel: validateRiskLevel(rowData['Hurricane Level'], 'Hurricane Level', i + 1, errors),
          hurricaneNotes: rowData['Hurricane Notes'] || '',
          floodLevel: validateRiskLevel(rowData['Flood Level'], 'Flood Level', i + 1, errors),
          floodNotes: rowData['Flood Notes'] || '',
          earthquakeLevel: validateRiskLevel(rowData['Earthquake Level'], 'Earthquake Level', i + 1, errors),
          earthquakeNotes: rowData['Earthquake Notes'] || '',
          droughtLevel: validateRiskLevel(rowData['Drought Level'], 'Drought Level', i + 1, errors),
          droughtNotes: rowData['Drought Notes'] || '',
          landslideLevel: validateRiskLevel(rowData['Landslide Level'], 'Landslide Level', i + 1, errors),
          landslideNotes: rowData['Landslide Notes'] || '',
          powerOutageLevel: validateRiskLevel(rowData['Power Outage Level'], 'Power Outage Level', i + 1, errors),
          powerOutageNotes: rowData['Power Outage Notes'] || '',
          updatedBy: 'Bulk Upload'
        }

        // Skip row if validation errors
        if (errors.length > processed) {
          processed++
          continue
        }

        // Find existing parish or create new one
        let parish = await prisma.parish.findFirst({
          where: { name: parishName }
        })

        if (parish) {
          // Update existing parish
          await prisma.parish.update({
            where: { id: parish.id },
            data: parishData
          })

          // Update or create risk profile
          await prisma.parishRisk.upsert({
            where: { parishId: parish.id },
            update: riskData,
            create: {
              parishId: parish.id,
              ...riskData
            }
          })
          updated++
        } else {
          // Create new parish
          parish = await prisma.parish.create({
            data: parishData
          })

          // Create risk profile
          await prisma.parishRisk.create({
            data: {
              parishId: parish.id,
              ...riskData
            }
          })
          created++
        }

        processed++
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Processing error'}`)
        processed++
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      updated,
      created,
      errors
    })

  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk upload' },
      { status: 500 }
    )
  }
}

function parseCSVRow(row: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

function validateRiskLevel(value: string, fieldName: string, rowNum: number, errors: string[]): number {
  const num = parseInt(value)
  if (isNaN(num) || num < 0 || num > 10) {
    errors.push(`Row ${rowNum}: ${fieldName} must be a number between 0-10`)
    return 0
  }
  return num
}


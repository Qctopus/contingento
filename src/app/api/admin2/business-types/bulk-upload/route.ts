import { NextRequest, NextResponse } from 'next/server'
import {
  getPrismaClient,
  withDatabase,
  createSuccessResponse,
  handleApiError,
  createErrorResponse
} from '@/lib/admin2/api-utils'

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

function validateNumericField(value: any, min: number = 0, max: number = 10, defaultValue: number = 0): number {
  const parsed = parseFloat(String(value))
  if (isNaN(parsed) || parsed < min || parsed > max) {
    return defaultValue
  }
  return parsed
}

function parseJsonField(value: string): any[] {
  if (!value || value.trim() === '') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Try parsing as semicolon-separated values
    return value.split(';').map(v => v.trim()).filter(v => v)
  }
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
      'Business Type ID', 'Name', 'Category', 'Subcategory', 'Description',
      'Typical Revenue', 'Typical Employees', 'Operating Hours',
      'Seasonality Factor', 'Tourist Dependency', 'Supply Chain Complexity',
      'Digital Dependency', 'Cash Flow Pattern', 'Physical Asset Intensity',
      'Customer Concentration', 'Regulatory Burden',
      // Risk vulnerabilities
      'Hurricane Vulnerability', 'Hurricane Recovery Impact',
      'Flood Vulnerability', 'Flood Recovery Impact',
      'Earthquake Vulnerability', 'Earthquake Recovery Impact',
      'Drought Vulnerability', 'Drought Recovery Impact',
      'Landslide Vulnerability', 'Landslide Recovery Impact',
      'Power Outage Vulnerability', 'Power Outage Recovery Impact',
      // Additional data
      'Essential Utilities', 'Typical Equipment', 'Key Supplier Types', 'Maximum Downtime'
    ]

    // Validate required headers
    const requiredHeaders = ['Business Type ID', 'Name', 'Category']
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

      if (replaceAll) {
        console.log('🔄 Bulk upload: Replacing all business type data')
        warnings.push('All existing business type data will be replaced with CSV data')
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

          // Validate required fields
          const businessTypeId = rowData['Business Type ID']
          const name = rowData['Name']
          const category = rowData['Category']

          if (!businessTypeId || !name || !category) {
            errors.push(`Row ${i + 1}: Business Type ID, Name, and Category are required`)
            continue
          }

          // Prepare business type data
          const businessTypeData = {
            businessTypeId,
            name,
            category,
            subcategory: rowData['Subcategory'] || null,
            description: rowData['Description'] || null,
            typicalRevenue: rowData['Typical Revenue'] || null,
            typicalEmployees: rowData['Typical Employees'] || null,
            operatingHours: rowData['Operating Hours'] || null,
            seasonalityFactor: validateNumericField(rowData['Seasonality Factor'], 0.1, 3.0, 1.0),
            touristDependency: validateNumericField(rowData['Tourist Dependency'], 0, 10, 0),
            supplyChainComplexity: validateNumericField(rowData['Supply Chain Complexity'], 1, 10, 1),
            digitalDependency: validateNumericField(rowData['Digital Dependency'], 1, 10, 1),
            cashFlowPattern: rowData['Cash Flow Pattern'] || 'stable',
            physicalAssetIntensity: validateNumericField(rowData['Physical Asset Intensity'], 1, 10, 3),
            customerConcentration: validateNumericField(rowData['Customer Concentration'], 1, 10, 3),
            regulatoryBurden: validateNumericField(rowData['Regulatory Burden'], 1, 10, 2),
          }

          // Find existing business type
          const existingBusinessType = await prisma.businessType.findFirst({
            where: { businessTypeId },
            include: { BusinessRiskVulnerability: true }
          })

          let businessType
          if (existingBusinessType) {
            // Update existing business type
            businessType = await prisma.businessType.update({
              where: { id: existingBusinessType.id },
              data: businessTypeData
            })

            // Delete existing vulnerabilities and recreate
            await prisma.businessRiskVulnerability.deleteMany({
              where: { businessTypeId: existingBusinessType.id }
            })
            updated++
          } else {
            // Create new business type
            businessType = await prisma.businessType.create({
              data: businessTypeData
            })
            created++
          }

          // Create risk vulnerabilities
          const riskTypes = ['hurricane', 'flood', 'earthquake', 'drought', 'landslide', 'powerOutage']
          for (const riskType of riskTypes) {
            const vulnerabilityKey = `${riskType.charAt(0).toUpperCase() + riskType.slice(1)} Vulnerability`
            const recoveryKey = `${riskType.charAt(0).toUpperCase() + riskType.slice(1)} Recovery Impact`

            const vulnerabilityLevel = validateNumericField(rowData[vulnerabilityKey], 1, 10, 5)
            const impactSeverity = validateNumericField(rowData[recoveryKey], 1, 10, 5)

            if (vulnerabilityLevel > 0 || impactSeverity > 0) {
              await prisma.businessRiskVulnerability.create({
                data: {
                  businessTypeId: businessType.id,
                  riskType,
                  vulnerabilityLevel,
                  impactSeverity,
                  reasoning: `Imported from CSV - ${riskType} risk profile`,
                  recoveryTime: 'medium',
                  mitigationDifficulty: Math.ceil((vulnerabilityLevel + impactSeverity) / 2),
                  costToRecover: impactSeverity >= 8 ? 'high' : impactSeverity >= 6 ? 'medium' : 'low',
                  businessImpactAreas: JSON.stringify(['operations', 'supply_chain']),
                  criticalDependencies: JSON.stringify(['power', 'water'])
                }
              })
            }
          }

          processed++
        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error)
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      return { processed, updated, created, errors, warnings }
    }, 'POST /api/admin2/business-types/bulk-upload')

    const summary = {
      success: true,
      message: `Processed ${result.processed} business types: ${result.created} created, ${result.updated} updated`,
      details: {
        totalProcessed: result.processed,
        created: result.created,
        updated: result.updated,
        errors: result.errors,
        warnings: result.warnings
      }
    }

    console.log('🏢 Business types bulk upload completed:', summary)
    return createSuccessResponse(summary)

  } catch (error) {
    return handleApiError(error, 'Failed to process business types bulk upload')
  }
}

export async function GET() {
  try {
    const businessTypes = await withDatabase(async () => {
      const prisma = getPrismaClient()
      return await prisma.businessType.findMany({
        where: { isActive: true },
        include: { BusinessRiskVulnerability: true },
        orderBy: [
          { category: 'asc' },
          { businessTypeId: 'asc' }
        ]
      })
    }, 'GET /api/admin2/business-types/bulk-upload')

    // Generate CSV headers
    const csvHeaders = [
      'Business Type ID', 'Name', 'Category', 'Subcategory', 'Description',
      'Typical Revenue', 'Typical Employees', 'Operating Hours',
      'Seasonality Factor', 'Tourist Dependency', 'Supply Chain Complexity',
      'Digital Dependency', 'Cash Flow Pattern', 'Physical Asset Intensity',
      'Customer Concentration', 'Regulatory Burden',
      // Risk vulnerabilities
      'Hurricane Vulnerability', 'Hurricane Recovery Impact',
      'Flood Vulnerability', 'Flood Recovery Impact',
      'Earthquake Vulnerability', 'Earthquake Recovery Impact',
      'Drought Vulnerability', 'Drought Recovery Impact',
      'Landslide Vulnerability', 'Landslide Recovery Impact',
      'Power Outage Vulnerability', 'Power Outage Recovery Impact',
      // Additional data
      'Essential Utilities', 'Typical Equipment', 'Key Supplier Types', 'Maximum Downtime'
    ]

    // Generate CSV rows
    const csvRows = businessTypes.map(bt => {
      // Create vulnerability map for easy lookup
      const vulnMap: { [key: string]: any } = {}
      bt.BusinessRiskVulnerability.forEach(vuln => {
        vulnMap[vuln.riskType] = vuln
      })

      return [
        bt.businessTypeId,
        bt.name,
        bt.category,
        bt.subcategory || '',
        bt.description || '',
        bt.typicalRevenue || '',
        bt.typicalEmployees || '',
        bt.operatingHours || '',
        bt.seasonalityFactor || 1.0,
        bt.touristDependency || 0,
        bt.supplyChainComplexity || 1,
        bt.digitalDependency || 1,
        bt.cashFlowPattern || 'stable',
        bt.physicalAssetIntensity || 3,
        bt.customerConcentration || 3,
        bt.regulatoryBurden || 2,
        // Risk vulnerabilities
        vulnMap.hurricane?.vulnerabilityLevel || 0,
        vulnMap.hurricane?.impactSeverity || 0,
        vulnMap.flood?.vulnerabilityLevel || 0,
        vulnMap.flood?.impactSeverity || 0,
        vulnMap.earthquake?.vulnerabilityLevel || 0,
        vulnMap.earthquake?.impactSeverity || 0,
        vulnMap.drought?.vulnerabilityLevel || 0,
        vulnMap.drought?.impactSeverity || 0,
        vulnMap.landslide?.vulnerabilityLevel || 0,
        vulnMap.landslide?.impactSeverity || 0,
        vulnMap.powerOutage?.vulnerabilityLevel || 0,
        vulnMap.powerOutage?.impactSeverity || 0,
        // Additional data (these would need to be added to the schema if needed)
        '', // Essential Utilities
        '', // Typical Equipment
        '', // Key Supplier Types
        ''  // Maximum Downtime
      ].map(field => `"${field || ''}"`).join(',')
    })

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="business_types_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    return handleApiError(error, 'Failed to export business types')
  }
}

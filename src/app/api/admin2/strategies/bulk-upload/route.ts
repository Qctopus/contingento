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

function validateNumericField(value: any, min: number = 1, max: number = 10, defaultValue: number = 5): number {
  const parsed = parseFloat(String(value))
  if (isNaN(parsed) || parsed < min || parsed > max) {
    return defaultValue
  }
  return parsed
}

function parseArrayField(value: string): string[] {
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
      'Data Type', 'Strategy ID', 'Strategy Name', 'Strategy Category', 'Strategy Priority', 
      'Strategy Description', 'SME Description', 'Why Important', 'Implementation Cost', 
      'Time to Implement', 'Effectiveness', 'ROI', 'Applicable Risks', 'Business Types',
      'Action Step ID', 'Action Step Phase', 'Action Step Description', 'SME Action',
      'Action Step Timeframe', 'Action Step Responsibility', 'Action Step Cost', 
      'Action Step Resources', 'Action Step Checklist'
    ]

    // Validate required headers
    const requiredHeaders = ['Data Type', 'Strategy ID', 'Strategy Name']
    const missingHeaders = requiredHeaders.filter(h => !header.includes(h))
    if (missingHeaders.length > 0) {
      return createErrorResponse(`Missing required headers: ${missingHeaders.join(', ')}`, 400)
    }

    let processed = 0
    let strategiesUpdated = 0
    let strategiesCreated = 0
    let actionStepsProcessed = 0
    const errors: string[] = []
    const warnings: string[] = []
    const strategiesMap = new Map() // Track strategies by ID

    const result = await withDatabase(async () => {
      const prisma = getPrismaClient()

      if (replaceAll) {
        console.log('🔄 Bulk upload: Replacing all strategy data')
        warnings.push('All existing strategy data will be replaced with CSV data')
        // Delete existing strategies and action plans
        await prisma.riskMitigationStrategy.deleteMany()
      }

      // First pass: collect all strategies
      for (let i = 1; i < lines.length; i++) {
        try {
          const row = parseCSVRow(lines[i])
          if (row.length < requiredHeaders.length) continue

          const rowData: any = {}
          header.forEach((h, index) => {
            const value = row[index]?.trim().replace(/"/g, '') || ''
            rowData[h] = value
          })

          const dataType = rowData['Data Type']
          const strategyId = rowData['Strategy ID']

          if (dataType === 'Strategy' && strategyId && !strategiesMap.has(strategyId)) {
            const strategyName = rowData['Strategy Name']
            const category = rowData['Strategy Category']

            if (!strategyName || !category) {
              errors.push(`Row ${i + 1}: Strategy Name and Category are required for strategy rows`)
              continue
            }

            const strategyData = {
              strategyId,
              name: strategyName,
              category,
              description: rowData['Strategy Description'] || '',
              implementationCost: rowData['Implementation Cost'] || 'medium',
              timeToImplement: rowData['Time to Implement'] || 'medium', 
              effectiveness: validateNumericField(rowData['Effectiveness'], 1, 10, 7),
              applicableRisks: JSON.stringify(parseArrayField(rowData['Applicable Risks'])),
              applicableBusinessTypes: parseArrayField(rowData['Business Types']).length > 0 
                ? JSON.stringify(parseArrayField(rowData['Business Types'])) 
                : null,
              priority: rowData['Strategy Priority'] || 'medium',
              roi: validateNumericField(rowData['ROI'], 0.1, 20, 3.0),
              prerequisites: '[]',
              maintenanceRequirement: 'low'
            }

            strategiesMap.set(strategyId, {
              data: strategyData,
              actionSteps: [],
              smeDescription: rowData['SME Description'] || '',
              whyImportant: rowData['Why Important'] || ''
            })
          }
        } catch (error) {
          console.error(`Error in first pass for row ${i + 1}:`, error)
        }
      }

      // Second pass: collect action steps and create/update strategies
      for (let i = 1; i < lines.length; i++) {
        try {
          const row = parseCSVRow(lines[i])
          if (row.length < requiredHeaders.length) continue

          const rowData: any = {}
          header.forEach((h, index) => {
            const value = row[index]?.trim().replace(/"/g, '') || ''
            rowData[h] = value
          })

          const dataType = rowData['Data Type']
          const strategyId = rowData['Strategy ID']

          if (dataType === 'Action Step' && strategyId && strategiesMap.has(strategyId)) {
            const actionStepData = {
              id: rowData['Action Step ID'] || `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              phase: rowData['Action Step Phase'] || 'immediate',
              action: rowData['Action Step Description'] || '',
              smeAction: rowData['SME Action'] || rowData['Action Step Description'] || '',
              timeframe: rowData['Action Step Timeframe'] || '',
              responsibility: rowData['Action Step Responsibility'] || '',
              cost: rowData['Action Step Cost'] || '',
              estimatedCostJMD: rowData['Action Step Cost'] || '',
              resources: parseArrayField(rowData['Action Step Resources']),
              checklist: parseArrayField(rowData['Action Step Checklist'])
            }

            strategiesMap.get(strategyId).actionSteps.push(actionStepData)
            actionStepsProcessed++
          }

          processed++
        } catch (error) {
          console.error(`Error in second pass for row ${i + 1}:`, error)
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Create/update strategies and their action steps in database
      for (const [strategyId, strategyInfo] of strategiesMap.entries()) {
        try {
          const existingStrategy = await prisma.riskMitigationStrategy.findFirst({
            where: { strategyId }
          })

          let dbStrategy
          if (existingStrategy) {
            // Update existing strategy
            dbStrategy = await prisma.riskMitigationStrategy.update({
              where: { id: existingStrategy.id },
              data: strategyInfo.data
            })
            
            // Delete existing action steps for this strategy
            await prisma.actionStep.deleteMany({
              where: { strategyId: existingStrategy.id }
            })
            
            strategiesUpdated++
          } else {
            // Create new strategy
            dbStrategy = await prisma.riskMitigationStrategy.create({
              data: strategyInfo.data
            })
            strategiesCreated++
          }

          // Create action steps for this strategy
          if (strategyInfo.actionSteps && strategyInfo.actionSteps.length > 0) {
            for (let i = 0; i < strategyInfo.actionSteps.length; i++) {
              const actionStep = strategyInfo.actionSteps[i]
              
              await prisma.actionStep.create({
                data: {
                  strategyId: dbStrategy.id,
                  stepId: actionStep.id || `step_${i + 1}`,
                  phase: actionStep.phase || 'immediate',
                  title: actionStep.smeAction || actionStep.action || `Step ${i + 1}`,
                  description: actionStep.action || '',
                  smeAction: actionStep.smeAction || actionStep.action || '',
                  timeframe: actionStep.timeframe || '',
                  responsibility: actionStep.responsibility || '',
                  estimatedCost: actionStep.cost || '',
                  estimatedCostJMD: actionStep.estimatedCostJMD || actionStep.cost || '',
                  resources: JSON.stringify(actionStep.resources || []),
                  checklist: JSON.stringify(actionStep.checklist || []),
                  sortOrder: i
                }
              })
            }
          }

        } catch (error) {
          console.error(`Error creating/updating strategy ${strategyId}:`, error)
          errors.push(`Strategy ${strategyId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      return { 
        processed, 
        strategiesCreated, 
        strategiesUpdated, 
        actionStepsProcessed,
        errors, 
        warnings 
      }
    }, 'POST /api/admin2/strategies/bulk-upload')

    const summary = {
      success: true,
      message: `Processed ${strategiesMap.size} strategies (${result.strategiesCreated} created, ${result.strategiesUpdated} updated) with ${result.actionStepsProcessed} action steps`,
      details: {
        totalRowsProcessed: result.processed,
        strategiesCreated: result.strategiesCreated,
        strategiesUpdated: result.strategiesUpdated,
        actionStepsProcessed: result.actionStepsProcessed,
        errors: result.errors,
        warnings: result.warnings
      }
    }

    console.log('🛡️ Strategies bulk upload completed:', summary)
    return createSuccessResponse(summary)

  } catch (error) {
    return handleApiError(error, 'Failed to process strategies bulk upload')
  }
}

export async function GET() {
  try {
    // Get strategies from database first
    const strategiesResult = await withDatabase(async () => {
      const prisma = getPrismaClient()
      
      // Get all strategies
      const strategies = await prisma.riskMitigationStrategy.findMany({
        where: { isActive: true },
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      })

      // Get all action steps
      const actionSteps = await prisma.actionStep.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      })

      // Combine them
      return strategies.map(strategy => ({
        ...strategy,
        actionSteps: actionSteps.filter(step => step.strategyId === strategy.id)
      }))
    }, 'GET /api/admin2/strategies/bulk-upload')

    const strategies = strategiesResult

    // Generate CSV headers
    const csvHeaders = [
      'Data Type', 'Strategy ID', 'Strategy Name', 'Strategy Category', 'Strategy Priority', 
      'Strategy Description', 'SME Description', 'Why Important', 'Implementation Cost', 
      'Time to Implement', 'Effectiveness', 'ROI', 'Applicable Risks', 'Business Types',
      'Action Step ID', 'Action Step Phase', 'Action Step Description', 'SME Action',
      'Action Step Timeframe', 'Action Step Responsibility', 'Action Step Cost', 
      'Action Step Resources', 'Action Step Checklist'
    ]

    const csvRows: string[] = []

    // Generate CSV rows
    strategies.forEach(strategy => {
      // Parse strategy data
      const applicableRisks = strategy.applicableRisks ? JSON.parse(strategy.applicableRisks) : []
      const businessTypes = strategy.applicableBusinessTypes ? JSON.parse(strategy.applicableBusinessTypes) : []

      // Add strategy row
      csvRows.push([
        'Strategy',
        strategy.strategyId,
        strategy.name,
        strategy.category,
        strategy.priority || 'medium',
        strategy.description,
        strategy.smeDescription || '', // SME Description from database
        strategy.whyImportant || '', // Why Important from database
        strategy.implementationCost,
        strategy.timeToImplement,
        strategy.effectiveness.toString(),
        strategy.roi?.toString() || '3.0',
        Array.isArray(applicableRisks) ? applicableRisks.join(';') : '',
        Array.isArray(businessTypes) ? businessTypes.join(';') : '',
        '', '', '', '', '', '', '', '', '' // Empty action step columns
      ].map(field => `"${field || ''}"`).join(','))

      // Add action step rows from database
      if (strategy.actionSteps && strategy.actionSteps.length > 0) {
        strategy.actionSteps.forEach((step: any) => {
          const resources = step.resources ? JSON.parse(step.resources) : []
          const checklist = step.checklist ? JSON.parse(step.checklist) : []
          
          csvRows.push([
            'Action Step',
            strategy.strategyId,
            strategy.name,
            '', '', '', '', '', '', '', '', '', '', '', // Empty strategy columns
            step.stepId,
            step.phase || 'immediate',
            step.description || '',
            step.smeAction || step.title || '',
            step.timeframe || '',
            step.responsibility || '',
            step.estimatedCostJMD || step.estimatedCost || '',
            Array.isArray(resources) ? resources.join(';') : '',
            Array.isArray(checklist) ? checklist.join(';') : ''
          ].map(field => `"${field || ''}"`).join(','))
        })
      }
    })

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="strategies_and_actions_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    return handleApiError(error, 'Failed to export strategies')
  }
}

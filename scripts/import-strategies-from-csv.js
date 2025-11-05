const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// Helper to create multilingual JSON
function toMultilingual(en, es, fr) {
  return JSON.stringify({
    en: en || '',
    es: es || '',
    fr: fr || ''
  })
}

// Helper to create multilingual array
function toMultilingualArray(enStr, esStr, frStr) {
  const enArray = enStr ? enStr.split(' | ').map(s => s.trim()).filter(Boolean) : []
  const esArray = esStr ? esStr.split(' | ').map(s => s.trim()).filter(Boolean) : []
  const frArray = frStr ? frStr.split(' | ').map(s => s.trim()).filter(Boolean) : []
  
  return JSON.stringify({
    en: enArray,
    es: esArray,
    fr: frArray
  })
}

// Parse CSV line handling quoted values
function parseCsvLine(line) {
  const values = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  // Add last field
  values.push(current)
  
  return values
}

// Parse CSV file
function parseCsv(content) {
  const lines = content.split('\n').filter(line => line.trim())
  const headers = parseCsvLine(lines[0])
  const rows = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    const row = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    rows.push(row)
  }
  
  return rows
}

async function importStrategies() {
  console.log('📥 Importing strategies from CSV...\n')
  
  const strategiesPath = path.join(process.cwd(), 'data', 'strategies-export.csv')
  const actionStepsPath = path.join(process.cwd(), 'data', 'action-steps-export.csv')
  
  // Check files exist
  if (!fs.existsSync(strategiesPath)) {
    console.error('❌ strategies-export.csv not found in data/ folder')
    console.log('Run export-strategies-to-csv.js first')
    return
  }
  
  // === IMPORT STRATEGIES ===
  console.log('Reading strategies CSV...')
  const strategiesContent = fs.readFileSync(strategiesPath, 'utf8')
  const strategyRows = parseCsv(strategiesContent)
  
  console.log(`Found ${strategyRows.length} strategies to import\n`)
  
  let strategiesUpdated = 0
  let strategiesSkipped = 0
  
  for (const row of strategyRows) {
    try {
      const strategyId = row.strategyId
      
      if (!strategyId) {
        console.log('⚠️  Skipping row with no strategyId')
        strategiesSkipped++
        continue
      }
      
      // Check if strategy exists
      const existing = await prisma.riskMitigationStrategy.findUnique({
        where: { strategyId }
      })
      
      if (!existing) {
        console.log(`⚠️  Strategy '${strategyId}' not found in database, skipping...`)
        strategiesSkipped++
        continue
      }
      
      // Build update data
      const updateData = {
        name: row.name || existing.name,
        category: row.category || existing.category,
        
        // Multilingual fields
        smeTitle: toMultilingual(row.smeTitle_EN, row.smeTitle_ES, row.smeTitle_FR),
        smeSummary: toMultilingual(row.smeSummary_EN, row.smeSummary_ES, row.smeSummary_FR),
        realWorldExample: toMultilingual(
          row.realWorldExample_EN,
          row.realWorldExample_ES,
          row.realWorldExample_FR
        ),
        lowBudgetAlternative: toMultilingual(
          row.lowBudgetAlternative_EN,
          row.lowBudgetAlternative_ES,
          row.lowBudgetAlternative_FR
        ),
        diyApproach: toMultilingual(
          row.diyApproach_EN,
          row.diyApproach_ES,
          row.diyApproach_FR
        ),
        
        // Multilingual arrays
        benefitsBullets: toMultilingualArray(
          row.benefitsBullets_EN,
          row.benefitsBullets_ES,
          row.benefitsBullets_FR
        ),
        helpfulTips: toMultilingualArray(
          row.helpfulTips_EN,
          row.helpfulTips_ES,
          row.helpfulTips_FR
        ),
        commonMistakes: toMultilingualArray(
          row.commonMistakes_EN,
          row.commonMistakes_ES,
          row.commonMistakes_FR
        ),
        successMetrics: toMultilingualArray(
          row.successMetrics_EN,
          row.successMetrics_ES,
          row.successMetrics_FR
        ),
        
        // Other fields
        implementationCost: row.implementationCost || existing.implementationCost,
        costEstimateJMD: row.costEstimateJMD || existing.costEstimateJMD,
        effectiveness: row.effectiveness ? parseInt(row.effectiveness) : existing.effectiveness,
        priority: row.priority || existing.priority,
        selectionTier: row.selectionTier || existing.selectionTier
      }
      
      // Update strategy
      await prisma.riskMitigationStrategy.update({
        where: { strategyId },
        data: updateData
      })
      
      strategiesUpdated++
      console.log(`✅ Updated: ${strategyId}`)
      
    } catch (error) {
      console.error(`❌ Error updating ${row.strategyId}:`, error.message)
    }
  }
  
  console.log(`\n✅ Strategies: ${strategiesUpdated} updated, ${strategiesSkipped} skipped\n`)
  
  // === IMPORT ACTION STEPS ===
  if (fs.existsSync(actionStepsPath)) {
    console.log('Reading action steps CSV...')
    const actionStepsContent = fs.readFileSync(actionStepsPath, 'utf8')
    const actionStepRows = parseCsv(actionStepsContent)
    
    console.log(`Found ${actionStepRows.length} action steps to import\n`)
    
    let stepsUpdated = 0
    let stepsCreated = 0
    let stepsSkipped = 0
    
    for (const row of actionStepRows) {
      try {
        const stepId = row.stepId
        const strategyId = row.strategyId
        
        if (!stepId || !strategyId) {
          console.log('⚠️  Skipping row with missing stepId or strategyId')
          stepsSkipped++
          continue
        }
        
        // Find strategy
        const strategy = await prisma.riskMitigationStrategy.findUnique({
          where: { strategyId }
        })
        
        if (!strategy) {
          console.log(`⚠️  Strategy '${strategyId}' not found for step '${stepId}', skipping...`)
          stepsSkipped++
          continue
        }
        
        // Build step data
        const stepData = {
          stepId,
          phase: row.phase || 'immediate',
          sortOrder: row.sortOrder ? parseInt(row.sortOrder) : 0,
          
          // Multilingual fields
          title: toMultilingual(row.title_EN, row.title_ES, row.title_FR),
          description: toMultilingual(
            row.description_EN,
            row.description_ES,
            row.description_FR
          ),
          whyThisStepMatters: toMultilingual(
            row.whyThisStepMatters_EN,
            row.whyThisStepMatters_ES,
            row.whyThisStepMatters_FR
          ),
          whatHappensIfSkipped: toMultilingual(
            row.whatHappensIfSkipped_EN,
            row.whatHappensIfSkipped_ES,
            row.whatHappensIfSkipped_FR
          ),
          howToKnowItsDone: toMultilingual(
            row.howToKnowItsDone_EN,
            row.howToKnowItsDone_ES,
            row.howToKnowItsDone_FR
          ),
          exampleOutput: toMultilingual(
            row.exampleOutput_EN,
            row.exampleOutput_ES,
            row.exampleOutput_FR
          ),
          freeAlternative: toMultilingual(
            row.freeAlternative_EN,
            row.freeAlternative_ES,
            row.freeAlternative_FR
          ),
          lowTechOption: toMultilingual(
            row.lowTechOption_EN,
            row.lowTechOption_ES,
            row.lowTechOption_FR
          ),
          commonMistakesForStep: toMultilingualArray(
            row.commonMistakesForStep_EN,
            row.commonMistakesForStep_ES,
            row.commonMistakesForStep_FR
          ),
          
          // Other fields
          estimatedMinutes: row.estimatedMinutes ? parseInt(row.estimatedMinutes) : null,
          difficultyLevel: row.difficultyLevel || 'medium'
        }
        
        // Check if step exists
        const existing = await prisma.actionStep.findFirst({
          where: {
            strategyId: strategy.id,
            stepId
          }
        })
        
        if (existing) {
          // Update
          await prisma.actionStep.update({
            where: { id: existing.id },
            data: stepData
          })
          stepsUpdated++
          console.log(`  ✓ Updated step: ${stepId}`)
        } else {
          // Create
          await prisma.actionStep.create({
            data: {
              ...stepData,
              strategyId: strategy.id
            }
          })
          stepsCreated++
          console.log(`  ✓ Created step: ${stepId}`)
        }
        
      } catch (error) {
        console.error(`❌ Error with step ${row.stepId}:`, error.message)
      }
    }
    
    console.log(`\n✅ Action Steps: ${stepsUpdated} updated, ${stepsCreated} created, ${stepsSkipped} skipped`)
  } else {
    console.log('⚠️  action-steps-export.csv not found, skipping action steps import')
  }
  
  console.log('\n🎉 Import complete!')
  console.log('\n💡 Verify changes:')
  console.log('  - Check admin panel to see updated translations')
  console.log('  - Test wizard in Spanish and French')
  
  await prisma.$disconnect()
}

importStrategies().catch((error) => {
  console.error('Import failed:', error)
  prisma.$disconnect()
  process.exit(1)
})















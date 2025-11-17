import { PrismaClient } from '@prisma/client'
import { auditStrategies } from './audit-and-update-strategies'

const prisma = new PrismaClient()

// Helper to create multilingual JSON string
const ml = (en: string, es: string, fr: string) => JSON.stringify({ en, es, fr })

// Helper to create multilingual array JSON string
const mlArray = (items: Array<{ en: string; es: string; fr: string }>) => {
  return JSON.stringify({
    en: items.map(i => i.en),
    es: items.map(i => i.es),
    fr: items.map(i => i.fr)
  })
}

// Map old phases to new phases
function mapPhase(oldPhase: string): 'before' | 'during' | 'after' {
  const phaseMap: Record<string, 'before' | 'during' | 'after'> = {
    'immediate': 'before',
    'short_term': 'before',
    'medium_term': 'during',
    'long_term': 'after',
    'before': 'before',
    'during': 'during',
    'after': 'after'
  }
  return phaseMap[oldPhase] || 'before'
}

// Get cost items that might be relevant for a step
async function getRelevantCostItems(stepTitle: string, stepDescription: string): Promise<string[]> {
  const text = `${stepTitle} ${stepDescription}`.toLowerCase()
  const costItems: string[] = []
  
  // Map keywords to cost item IDs
  // IMPORTANT: Order matters - more specific matches first to avoid false positives
  
  // Data backup (check BEFORE power backup to avoid false positives)
  if ((text.includes('data backup') || text.includes('cloud backup') || text.includes('backup data') || 
       text.includes('backup system') || text.includes('backup service') || text.includes('backup files')) &&
      !text.includes('power backup') && !text.includes('backup power') && !text.includes('backup generator')) {
    costItems.push('data_backup_cloud')
    costItems.push('external_hard_drive_2tb')
  }
  
  // Power backup / generators (check for power-related backup, not data backup)
  if ((text.includes('generator') || text.includes('backup power') || text.includes('power backup') || 
       text.includes('emergency power') || text.includes('backup generator')) &&
      !text.includes('data backup') && !text.includes('cloud backup') && !text.includes('backup data')) {
    costItems.push('generator_5kw_diesel')
    costItems.push('ups_battery_backup_1kw')
  }
  
  // Hurricane protection
  if (text.includes('hurricane') || text.includes('shutter') || text.includes('plywood')) {
    costItems.push('plywood_hurricane_boards')
    costItems.push('hurricane_shutters_aluminum')
  }
  
  // Water storage
  if (text.includes('water') || text.includes('tank')) {
    costItems.push('water_tank_500l')
  }
  
  // Fire safety
  if (text.includes('fire') || text.includes('extinguisher')) {
    costItems.push('fire_extinguisher_10lb')
  }
  
  // Security
  if (text.includes('security') || text.includes('camera') || text.includes('alarm')) {
    costItems.push('security_camera_4ch')
  }
  
  // Check which items actually exist
  const existingItems = await prisma.costItem.findMany({
    where: { itemId: { in: costItems } },
    select: { itemId: true }
  })
  
  return existingItems.map(item => item.itemId)
}

// Add default guidance content if missing
function getDefaultGuidance(field: string, stepTitle: string): string {
  const title = stepTitle.toLowerCase()
  
  switch (field) {
    case 'whyThisStepMatters':
      return ml(
        `This step is critical for protecting your business. ${title.includes('hurricane') ? 'Proper preparation prevents costly damage.' : title.includes('backup') ? 'Data loss can shut down your business permanently.' : 'Taking action now saves time and money later.'}`,
        `Este paso es crítico para proteger su negocio. ${title.includes('hurricane') ? 'La preparación adecuada previene daños costosos.' : title.includes('backup') ? 'La pérdida de datos puede cerrar su negocio permanentemente.' : 'Actuar ahora ahorra tiempo y dinero más tarde.'}`,
        `Cette étape est critique pour protéger votre entreprise. ${title.includes('hurricane') ? 'Une préparation adéquate prévient les dommages coûteux.' : title.includes('backup') ? 'La perte de données peut fermer votre entreprise définitivement.' : 'Agir maintenant économise temps et argent plus tard.'}`
      )
    case 'whatHappensIfSkipped':
      return ml(
        `If you skip this step, your business may face significant risks including financial losses, operational delays, or complete shutdown.`,
        `Si omite este paso, su negocio puede enfrentar riesgos significativos incluyendo pérdidas financieras, retrasos operativos o cierre completo.`,
        `Si vous ignorez cette étape, votre entreprise peut faire face à des risques importants incluant pertes financières, retards opérationnels ou fermeture complète.`
      )
    case 'howToKnowItsDone':
      return ml(
        `You'll know this step is complete when you can verify the work has been done and documented.`,
        `Sabrá que este paso está completo cuando pueda verificar que el trabajo se ha realizado y documentado.`,
        `Vous saurez que cette étape est terminée lorsque vous pourrez vérifier que le travail a été fait et documenté.`
      )
    default:
      return ''
  }
}

async function fixActionStep(step: any) {
  const updates: any = {}
  let needsUpdate = false
  
  // Fix phase
  if (!['before', 'during', 'after'].includes(step.phase)) {
    updates.phase = mapPhase(step.phase)
    needsUpdate = true
  }
  
  // Parse multilingual fields
  let title = step.title
  let description = step.description
  let smeAction = step.smeAction
  
  try {
    if (typeof title === 'string') {
      const parsed = JSON.parse(title)
      title = parsed
    }
    if (typeof description === 'string') {
      const parsed = JSON.parse(description)
      description = parsed
    }
    if (typeof smeAction === 'string' && smeAction) {
      const parsed = JSON.parse(smeAction)
      smeAction = parsed
    }
  } catch (e) {
    // Not JSON, keep as is
  }
  
  // Ensure multilingual content exists
  if (!title.es || !title.fr) {
    if (typeof title === 'string') {
      title = { en: title, es: title, fr: title }
    } else {
      title = { en: title.en || '', es: title.es || title.en || '', fr: title.fr || title.en || '' }
    }
    updates.title = JSON.stringify(title)
    needsUpdate = true
  }
  
  if (!description.es || !description.fr) {
    if (typeof description === 'string') {
      description = { en: description, es: description, fr: description }
    } else {
      description = { en: description.en || '', es: description.es || description.en || '', fr: description.fr || description.en || '' }
    }
    updates.description = JSON.stringify(description)
    needsUpdate = true
  }
  
  // Add missing guidance fields
  if (!step.whyThisStepMatters) {
    updates.whyThisStepMatters = getDefaultGuidance('whyThisStepMatters', title.en || '')
    needsUpdate = true
  }
  
  if (!step.whatHappensIfSkipped) {
    updates.whatHappensIfSkipped = getDefaultGuidance('whatHappensIfSkipped', title.en || '')
    needsUpdate = true
  }
  
  if (!step.howToKnowItsDone) {
    updates.howToKnowItsDone = getDefaultGuidance('howToKnowItsDone', title.en || '')
    needsUpdate = true
  }
  
  // Add missing basic fields
  if (!step.timeframe) {
    updates.timeframe = ml('1-2 hours', '1-2 horas', '1-2 heures')
    needsUpdate = true
  }
  
  if (!step.difficultyLevel) {
    updates.difficultyLevel = 'medium'
    needsUpdate = true
  }
  
  if (!step.responsibility) {
    updates.responsibility = 'Owner/Manager'
    needsUpdate = true
  }
  
  if (!step.resources) {
    updates.resources = mlArray([
      { en: 'Basic tools', es: 'Herramientas básicas', fr: 'Outils de base' }
    ])
    needsUpdate = true
  }
  
  // Update if needed
  if (needsUpdate) {
    await prisma.actionStep.update({
      where: { id: step.id },
      data: updates
    })
    return true
  }
  
  return false
}

async function fixStrategy(strategy: any) {
  const updates: any = {}
  let needsUpdate = false
  
  // Parse multilingual fields
  let name = strategy.name
  let description = strategy.description
  
  try {
    if (typeof name === 'string') {
      const parsed = JSON.parse(name)
      name = parsed
    }
    if (typeof description === 'string') {
      const parsed = JSON.parse(description)
      description = parsed
    }
  } catch (e) {
    // Not JSON, keep as is
  }
  
  // Ensure multilingual content exists
  if (!name.es || !name.fr) {
    if (typeof name === 'string') {
      name = { en: name, es: name, fr: name }
    } else {
      name = { en: name.en || '', es: name.es || name.en || '', fr: name.fr || name.en || '' }
    }
    updates.name = JSON.stringify(name)
    needsUpdate = true
  }
  
  if (!description.es || !description.fr) {
    if (typeof description === 'string') {
      description = { en: description, es: description, fr: description }
    } else {
      description = { en: description.en || '', es: description.es || description.en || '', fr: description.fr || description.en || '' }
    }
    updates.description = JSON.stringify(description)
    needsUpdate = true
  }
  
  // Add missing guidance fields with defaults
  if (!strategy.smeTitle) {
    updates.smeTitle = name.en || strategy.strategyId
    needsUpdate = true
  }
  
  if (!strategy.smeSummary) {
    updates.smeSummary = description.en || ''
    needsUpdate = true
  }
  
  if (!strategy.benefitsBullets) {
    updates.benefitsBullets = mlArray([
      { en: 'Protects your business from risks', es: 'Protege su negocio de riesgos', fr: 'Protège votre entreprise des risques' },
      { en: 'Reduces potential losses', es: 'Reduce pérdidas potenciales', fr: 'Réduit les pertes potentielles' }
    ])
    needsUpdate = true
  }
  
  if (!strategy.realWorldExample) {
    updates.realWorldExample = ml(
      'A Caribbean business implemented this strategy and saw significant improvements.',
      'Un negocio del Caribe implementó esta estrategia y vio mejoras significativas.',
      'Une entreprise des Caraïbes a mis en œuvre cette stratégie et a vu des améliorations significatives.'
    )
    needsUpdate = true
  }
  
  if (!strategy.helpfulTips) {
    updates.helpfulTips = mlArray([
      { en: 'Start early and plan ahead', es: 'Comience temprano y planifique con anticipación', fr: 'Commencez tôt et planifiez à l\'avance' },
      { en: 'Review and update regularly', es: 'Revise y actualice regularmente', fr: 'Révisez et mettez à jour régulièrement' }
    ])
    needsUpdate = true
  }
  
  if (!strategy.commonMistakes) {
    updates.commonMistakes = mlArray([
      { en: 'Waiting too long to start', es: 'Esperar demasiado para comenzar', fr: 'Attendre trop longtemps pour commencer' },
      { en: 'Not following through completely', es: 'No seguir completamente', fr: 'Ne pas suivre complètement' }
    ])
    needsUpdate = true
  }
  
  if (!strategy.successMetrics) {
    updates.successMetrics = mlArray([
      { en: 'Strategy implemented successfully', es: 'Estrategia implementada exitosamente', fr: 'Stratégie mise en œuvre avec succès' },
      { en: 'All action steps completed', es: 'Todos los pasos de acción completados', fr: 'Toutes les étapes d\'action terminées' }
    ])
    needsUpdate = true
  }
  
  if (!strategy.lowBudgetAlternative) {
    updates.lowBudgetAlternative = ml(
      'There are cost-effective alternatives available. Start with the most critical steps first.',
      'Hay alternativas rentables disponibles. Comience con los pasos más críticos primero.',
      'Il existe des alternatives rentables. Commencez par les étapes les plus critiques.'
    )
    needsUpdate = true
  }
  
  // Update if needed
  if (needsUpdate) {
    await prisma.riskMitigationStrategy.update({
      where: { id: strategy.id },
      data: updates
    })
    return true
  }
  
  return false
}

async function addCostItemsToStep(step: any) {
  // Skip if already has cost items
  if (step.itemCosts && step.itemCosts.length > 0) {
    return false
  }
  
  const stepTitle = typeof step.title === 'string' ? step.title : JSON.parse(step.title).en || ''
  const stepDescription = typeof step.description === 'string' ? step.description : JSON.parse(step.description).en || ''
  
  const relevantItems = await getRelevantCostItems(stepTitle, stepDescription)
  
  if (relevantItems.length === 0) {
    return false
  }
  
  // Add cost items
  for (let i = 0; i < relevantItems.length; i++) {
    try {
      await prisma.actionStepItemCost.create({
        data: {
          actionStepId: step.id,
          itemId: relevantItems[i],
          quantity: 1,
          displayOrder: i
        }
      })
    } catch (e) {
      // Item might already be linked or doesn't exist, skip
      console.log(`    ⚠️  Could not link cost item: ${relevantItems[i]}`)
    }
  }
  
  return relevantItems.length > 0
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   FIX ALL STRATEGIES SCRIPT                                   ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')
  
  try {
    // First audit
    console.log('📊 Auditing strategies...\n')
    const auditResult = await auditStrategies()
    
    console.log('\n🔧 Starting fixes...\n')
    console.log('═'.repeat(65))
    console.log('')
    
    let strategiesFixed = 0
    let stepsFixed = 0
    let costItemsAdded = 0
    
    // Fix each strategy
    for (const strategy of auditResult.strategies) {
      const name = typeof strategy.name === 'string' ? strategy.name : JSON.parse(strategy.name).en || strategy.strategyId
      console.log(`🛡️  Strategy: ${name}`)
      
      // Fix strategy
      const strategyFixed = await fixStrategy(strategy)
      if (strategyFixed) {
        strategiesFixed++
        console.log(`   ✓ Strategy updated`)
      }
      
      // Fix each action step
      for (const step of strategy.actionSteps) {
        const stepTitle = typeof step.title === 'string' ? step.title : JSON.parse(step.title).en || step.stepId
        const stepFixed = await fixActionStep(step)
        if (stepFixed) {
          stepsFixed++
          console.log(`   ✓ Step updated: ${stepTitle.substring(0, 50)}...`)
        }
        
        // Add cost items if missing
        const itemsAdded = await addCostItemsToStep(step)
        if (itemsAdded) {
          costItemsAdded++
          console.log(`   ✓ Cost items added to step`)
        }
      }
      
      console.log('')
    }
    
    console.log('═'.repeat(65))
    console.log('')
    console.log(`✅ Fixes complete!`)
    console.log(`   Strategies fixed: ${strategiesFixed}`)
    console.log(`   Action steps fixed: ${stepsFixed}`)
    console.log(`   Cost items added: ${costItemsAdded}`)
    console.log('')
    
  } catch (error) {
    console.error('\n❌ Error during fixes:')
    console.error(error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}


const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Action step translations
const actionStepTranslations = {
  // Hurricane Preparation
  'Get metal shutters or plywood boards to cover w...': {
    en: 'Get metal shutters or plywood boards to cover windows',
    es: 'Instale persianas metálicas o tablas de madera contrachapada para cubrir ventanas',
    fr: 'Installez des volets métalliques ou des panneaux de contreplaqué pour couvrir les fenêtres'
  },
  'Stock water, flashlights, batteries, first aid ...': {
    en: 'Stock water, flashlights, batteries, first aid kit, important documents in waterproof bag',
    es: 'Almacene agua, linternas, baterías, botiquín, documentos importantes en bolsa impermeable',
    fr: 'Stockez eau, lampes de poche, piles, trousse premiers soins, documents importants dans sac étanche'
  },
  'Tie down or bring inside anything that wind can...': {
    en: 'Tie down or bring inside anything that wind can blow away',
    es: 'Asegure o lleve adentro cualquier cosa que el viento pueda volar',
    fr: 'Attachez ou rentrez tout ce que le vent peut emporter'
  },
  'Get insurance that pays you while business is c...': {
    en: 'Get insurance that pays you while business is closed after hurricane',
    es: 'Obtenga seguro que le pague mientras el negocio esté cerrado después del huracán',
    fr: 'Obtenez une assurance qui vous paie pendant que l\'entreprise est fermée après l\'ouragan'
  },
  // Flood
  'Put expensive equipment on shelves or platforms...': {
    en: 'Put expensive equipment on shelves or platforms at least 2 feet off the ground',
    es: 'Coloque equipo costoso en estantes o plataformas al menos 2 pies del suelo',
    fr: 'Placez l\'équipement coûteux sur des étagères ou plateformes à au moins 2 pieds du sol'
  }
}

async function fixActionStepTitles() {
  console.log('Fixing action step translations...\n')
  
  const allSteps = await prisma.actionStep.findMany()
  let fixed = 0
  
  for (const step of allSteps) {
    try {
      let titleObj = typeof step.title === 'string' ? JSON.parse(step.title) : step.title
      
      // Check if EN title matches any of our patterns
      const enTitle = titleObj.en || ''
      const matchKey = Object.keys(actionStepTranslations).find(key => 
        enTitle.includes(key.replace('...', '')) || enTitle.startsWith(key.split('...')[0])
      )
      
      if (matchKey) {
        const translations = actionStepTranslations[matchKey]
        console.log(`Fixing step ${step.stepId}:`)
        console.log(`  EN: ${translations.en}`)
        console.log(`  ES: ${translations.es}`)
        console.log(`  FR: ${translations.fr}`)
        
        await prisma.actionStep.update({
          where: { id: step.id },
          data: {
            title: JSON.stringify(translations)
          }
        })
        fixed++
      } else if (titleObj.es === titleObj.en || titleObj.fr === titleObj.en) {
        console.log(`⚠️  Step ${step.stepId} needs manual translation:`)
        console.log(`    EN: ${titleObj.en}`)
      }
    } catch (error) {
      console.error(`Error processing step ${step.id}:`, error.message)
    }
  }
  
  console.log(`\n✅ Fixed ${fixed} action step titles`)
}

async function main() {
  await fixActionStepTitles()
  await prisma.$disconnect()
}

main().catch(console.error)


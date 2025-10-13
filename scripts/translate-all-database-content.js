const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Comprehensive action step translations
const actionStepTranslations = {
  // Health & Safety Protocols
  'Buy masks, hand sanitizer, disinfectant spray, ...': {
    en: 'Buy masks, hand sanitizer, disinfectant spray, and cleaning supplies',
    es: 'Compre mascarillas, desinfectante de manos, spray desinfectante y suministros de limpieza',
    fr: 'Achetez masques, désinfectant pour les mains, spray désinfectant et fournitures de nettoyage'
  },
  'Tell staff to stay home when sick, don\'t penali...': {
    en: 'Tell staff to stay home when sick, don\'t penalize sick days during outbreaks',
    es: 'Indique al personal quedarse en casa cuando esté enfermo, no penalice los días de enfermedad durante brotes',
    fr: 'Dites au personnel de rester à la maison quand malade, ne pénalisez pas les jours de maladie pendant les épidémies'
  },
  'Space out tables, mark floors for 6-foot distan...': {
    en: 'Space out tables, mark floors for 6-foot distancing, install hand sanitizer stations',
    es: 'Separe mesas, marque pisos para distanciamiento de 6 pies, instale estaciones de desinfectante',
    fr: 'Espacez les tables, marquez les sols pour distanciation de 6 pieds, installez stations désinfectant'
  },
  
  // Water Conservation
  'Buy large water tanks to store water when avail...': {
    en: 'Buy large water tanks to store water when available for use during shortages',
    es: 'Compre tanques grandes de agua para almacenar cuando esté disponible para usar durante escasez',
    fr: 'Achetez grands réservoirs d\'eau pour stocker quand disponible pour utiliser pendant pénuries'
  },
  'Replace toilets, faucets with low-flow models t...': {
    en: 'Replace toilets, faucets with low-flow models to reduce water consumption',
    es: 'Reemplace inodoros, grifos con modelos de bajo flujo para reducir consumo de agua',
    fr: 'Remplacez toilettes, robinets par modèles à faible débit pour réduire consommation d\'eau'
  },
  
  // Financial Resilience
  'Save enough money to cover 3-6 months of basic ...': {
    en: 'Save enough money to cover 3-6 months of basic expenses (rent, utilities, key staff)',
    es: 'Ahorre suficiente dinero para cubrir 3-6 meses de gastos básicos (alquiler, servicios, personal clave)',
    fr: 'Économisez assez d\'argent pour couvrir 3-6 mois de dépenses de base (loyer, services, personnel clé)'
  },
  'Cut spending that isn\'t critical - subscription...': {
    en: 'Cut spending that isn\'t critical - subscriptions, luxury items, unnecessary services',
    es: 'Reduzca gastos que no sean críticos - suscripciones, artículos de lujo, servicios innecesarios',
    fr: 'Réduisez dépenses non critiques - abonnements, articles de luxe, services inutiles'
  },
  'Ask suppliers for better prices, longer payment...': {
    en: 'Ask suppliers for better prices, longer payment terms, or bulk discounts',
    es: 'Solicite a proveedores mejores precios, plazos de pago más largos o descuentos por volumen',
    fr: 'Demandez aux fournisseurs meilleurs prix, délais paiement plus longs ou remises en gros'
  },
  
  // Earthquake
  'Bolt shelves, equipment, and furniture to walls...': {
    en: 'Bolt shelves, equipment, and furniture to walls to prevent falling during shaking',
    es: 'Atornille estantes, equipos y muebles a paredes para evitar caídas durante temblores',
    fr: 'Boulonnez étagères, équipement et meubles aux murs pour éviter chutes pendant secousses'
  },
  'Mark sturdy tables or doorways where staff shou...': {
    en: 'Mark sturdy tables or doorways where staff should take cover during earthquake',
    es: 'Marque mesas resistentes o marcos de puertas donde el personal debe cubrirse durante terremoto',
    fr: 'Marquez tables solides ou cadres de portes où personnel doit se couvrir pendant tremblement de terre'
  },
  'Hire engineer to check if building needs reinfo...': {
    en: 'Hire engineer to check if building needs reinforcement for earthquake safety',
    es: 'Contrate ingeniero para verificar si edificio necesita refuerzo para seguridad sísmica',
    fr: 'Embauchez ingénieur pour vérifier si bâtiment nécessite renforcement pour sécurité sismique'
  },
  
  // Fire Detection
  'Put smoke alarms in every room, test monthly, c...': {
    en: 'Put smoke alarms in every room, test monthly, change batteries yearly',
    es: 'Coloque alarmas de humo en cada habitación, pruebe mensualmente, cambie baterías anualmente',
    fr: 'Installez détecteurs fumée dans chaque pièce, testez mensuellement, changez piles annuellement'
  },
  'Get ABC fire extinguishers, mount near exits an...': {
    en: 'Get ABC fire extinguishers, mount near exits and kitchen, train staff how to use',
    es: 'Obtenga extintores ABC, monte cerca de salidas y cocina, capacite al personal en su uso',
    fr: 'Obtenez extincteurs ABC, montez près sorties et cuisine, formez personnel à utilisation'
  },
  'Mark two exits from each room, practice evacuat...': {
    en: 'Mark two exits from each room, practice evacuation routes monthly',
    es: 'Marque dos salidas de cada habitación, practique rutas de evacuación mensualmente',
    fr: 'Marquez deux sorties de chaque pièce, pratiquez routes évacuation mensuellement'
  },
  'Install automatic water sprinklers that activat...': {
    en: 'Install automatic water sprinklers that activate when smoke detected',
    es: 'Instale rociadores automáticos de agua que se activen cuando se detecte humo',
    fr: 'Installez gicleurs automatiques eau qui s\'activent quand fumée détectée'
  },
  
  // Cybersecurity
  'Buy antivirus software for all computers, keep ...': {
    en: 'Buy antivirus software for all computers, keep updated automatically',
    es: 'Compre software antivirus para todas las computadoras, mantenga actualizado automáticamente',
    fr: 'Achetez logiciel antivirus pour tous ordinateurs, maintenez à jour automatiquement'
  },
  'Purchase antivirus protection from reputable pr...': {
    en: 'Purchase antivirus protection from reputable providers and keep it updated',
    es: 'Compre protección antivirus de proveedores confiables y manténgala actualizada',
    fr: 'Achetez protection antivirus de fournisseurs réputés et maintenez-la à jour'
  },
  'Create passwords with 12+ characters, mix of le...': {
    en: 'Create passwords with 12+ characters, mix of letters, numbers, symbols, change every 90 days',
    es: 'Cree contraseñas con 12+ caracteres, mezcla de letras, números, símbolos, cambie cada 90 días',
    fr: 'Créez mots de passe avec 12+ caractères, mélange lettres, nombres, symboles, changez chaque 90 jours'
  },
  'Copy all important files to external hard drive...': {
    en: 'Copy all important files to external hard drive or cloud storage, update weekly',
    es: 'Copie todos los archivos importantes a disco duro externo o almacenamiento en nube, actualice semanalmente',
    fr: 'Copiez tous fichiers importants sur disque dur externe ou stockage cloud, mettez à jour hebdomadairement'
  },
  'Teach staff not to click links in suspicious em...': {
    en: 'Teach staff not to click links in suspicious emails or download unknown attachments',
    es: 'Enseñe al personal a no hacer clic en enlaces de correos sospechosos o descargar archivos desconocidos',
    fr: 'Enseignez personnel à ne pas cliquer liens dans emails suspects ou télécharger pièces jointes inconnues'
  },
  
  // Security & Communication
  'Set up WhatsApp group to quickly tell all staff...': {
    en: 'Set up WhatsApp group to quickly tell all staff about security threats or unrest',
    es: 'Configure grupo de WhatsApp para informar rápidamente a todo el personal sobre amenazas de seguridad o disturbios',
    fr: 'Configurez groupe WhatsApp pour informer rapidement tout personnel menaces sécurité ou troubles'
  },
  'Put cameras at entrances and areas with expensi...': {
    en: 'Put cameras at entrances and areas with expensive equipment, store footage for 30 days',
    es: 'Coloque cámaras en entradas y áreas con equipo costoso, almacene grabaciones por 30 días',
    fr: 'Placez caméras aux entrées et zones avec équipement coûteux, stockez enregistrements 30 jours'
  },
  'Plan how to quickly secure and close business i...': {
    en: 'Plan how to quickly secure and close business if civil unrest starts nearby',
    es: 'Planifique cómo asegurar y cerrar rápidamente el negocio si comienzan disturbios civiles cerca',
    fr: 'Planifiez comment sécuriser et fermer rapidement entreprise si troubles civils commencent à proximité'
  },
  
  // Backup Power
  'Buy generator that can run fridge, lights, and ...': {
    en: 'Buy generator that can run fridge, lights, and payment systems for at least 8 hours',
    es: 'Compre generador que pueda funcionar refrigerador, luces y sistemas de pago por al menos 8 horas',
    fr: 'Achetez générateur qui peut faire fonctionner réfrigérateur, lumières et systèmes paiement pendant au moins 8 heures'
  },
  'Keep 20-40 gallons of gasoline or diesel in saf...': {
    en: 'Keep 20-40 gallons of gasoline or diesel in safe metal containers for generator',
    es: 'Mantenga 20-40 galones de gasolina o diesel en contenedores metálicos seguros para generador',
    fr: 'Gardez 20-40 gallons essence ou diesel dans conteneurs métalliques sûrs pour générateur'
  },
  'Get solar panels that work even when main power...': {
    en: 'Get solar panels that work even when main power grid is down',
    es: 'Obtenga paneles solares que funcionen incluso cuando la red eléctrica principal esté caída',
    fr: 'Obtenez panneaux solaires qui fonctionnent même quand réseau électrique principal est en panne'
  },
  
  // Supply Chain
  'Find 2-3 backup suppliers for critical items, g...': {
    en: 'Find 2-3 backup suppliers for critical items, get price quotes and contact info',
    es: 'Encuentre 2-3 proveedores de respaldo para artículos críticos, obtenga cotizaciones y datos de contacto',
    fr: 'Trouvez 2-3 fournisseurs de secours pour articles critiques, obtenez devis et coordonnées'
  },
  'Keep extra inventory of items that are hard to ...': {
    en: 'Keep extra inventory of items that are hard to get or take long to deliver',
    es: 'Mantenga inventario extra de artículos difíciles de conseguir o que tardan en entregarse',
    fr: 'Gardez inventaire supplémentaire articles difficiles obtenir ou qui prennent du temps à livrer'
  },
  'Find local suppliers who can provide items fast...': {
    en: 'Find local suppliers who can provide items faster than overseas suppliers',
    es: 'Encuentre proveedores locales que puedan proporcionar artículos más rápido que proveedores extranjeros',
    fr: 'Trouvez fournisseurs locaux qui peuvent fournir articles plus rapidement que fournisseurs étrangers'
  },
  
  // Flood Prevention
  'Get sandbags or flood gates to block water from...': {
    en: 'Get sandbags or flood gates to block water from entering building',
    es: 'Obtenga sacos de arena o compuertas para bloquear entrada de agua al edificio',
    fr: 'Obtenez sacs de sable ou barrières anti-inondation pour bloquer entrée eau dans bâtiment'
  },
  'Clear drains, add French drains, slope ground a...': {
    en: 'Clear drains, add French drains, slope ground away from building to divert water',
    es: 'Limpie drenajes, agregue drenajes franceses, incline suelo lejos del edificio para desviar agua',
    fr: 'Nettoyez drains, ajoutez drains français, inclinez sol loin du bâtiment pour détourner eau'
  }
}

// Cost translations for common patterns
const costPatterns = [
  {
    pattern: /\(shutters, supplies, securing\)/gi,
    translations: {
      en: '(shutters, supplies, securing)',
      es: '(persianas, suministros, aseguramiento)',
      fr: '(volets, fournitures, sécurisation)'
    }
  },
  {
    pattern: /\(supplies and setup\)/gi,
    translations: {
      en: '(supplies and setup)',
      es: '(suministros e instalación)',
      fr: '(fournitures et installation)'
    }
  },
  {
    pattern: /\(depending on solution\)/gi,
    translations: {
      en: '(depending on solution)',
      es: '(según la solución)',
      fr: '(selon la solution)'
    }
  },
  {
    pattern: /\(drainage and barriers\)/gi,
    translations: {
      en: '(drainage and barriers)',
      es: '(drenaje y barreras)',
      fr: '(drainage et barrières)'
    }
  },
  {
    pattern: /\(relationship building\)/gi,
    translations: {
      en: '(relationship building)',
      es: '(construcción de relaciones)',
      fr: '(construction de relations)'
    }
  }
]

async function translateActionSteps() {
  console.log('🔄 Translating action step titles...\n')
  
  const allSteps = await prisma.actionStep.findMany()
  let fixed = 0
  
  for (const step of allSteps) {
    try {
      let titleObj = typeof step.title === 'string' ? JSON.parse(step.title) : step.title
      
      // Check if ES or FR is same as EN (needs translation)
      if (titleObj.es === titleObj.en || titleObj.fr === titleObj.en) {
        const enTitle = titleObj.en || ''
        
        // Try to find matching translation
        let found = false
        for (const [pattern, translations] of Object.entries(actionStepTranslations)) {
          if (enTitle.includes(pattern.replace('...', '').substring(0, 30))) {
            console.log(`✅ Translating: ${step.stepId}`)
            console.log(`   EN: ${translations.en}`)
            console.log(`   ES: ${translations.es}`)
            console.log(`   FR: ${translations.fr}\n`)
            
            await prisma.actionStep.update({
              where: { id: step.id },
              data: { title: JSON.stringify(translations) }
            })
            
            fixed++
            found = true
            break
          }
        }
        
        if (!found && titleObj.es === titleObj.en) {
          console.log(`⚠️  No translation for: ${step.stepId}`)
          console.log(`   EN: ${enTitle}\n`)
        }
      }
    } catch (error) {
      console.error(`❌ Error processing step ${step.id}:`, error.message)
    }
  }
  
  console.log(`\n✅ Translated ${fixed} action step titles\n`)
}

async function translateCostFields() {
  console.log('🔄 Translating strategy cost fields...\n')
  
  const strategies = await prisma.riskMitigationStrategy.findMany()
  let fixed = 0
  
  for (const strategy of strategies) {
    try {
      const cost = strategy.costEstimateJMD
      if (!cost) continue
      
      // Check if cost is already multilingual
      if (cost.startsWith('{')) continue
      
      // Check if cost has parenthetical notes that need translation
      let hasPattern = false
      const translations = { en: cost, es: cost, fr: cost }
      
      for (const { pattern, translations: trans } of costPatterns) {
        if (pattern.test(cost)) {
          translations.en = cost.replace(pattern, trans.en)
          translations.es = cost.replace(pattern, trans.es)
          translations.fr = cost.replace(pattern, trans.fr)
          hasPattern = true
          break
        }
      }
      
      if (hasPattern) {
        const name = typeof strategy.name === 'string' ? JSON.parse(strategy.name).en : 'Unknown'
        console.log(`✅ Translating cost for: ${name}`)
        console.log(`   EN: ${translations.en}`)
        console.log(`   ES: ${translations.es}`)
        console.log(`   FR: ${translations.fr}\n`)
        
        await prisma.riskMitigationStrategy.update({
          where: { id: strategy.id },
          data: {
            costEstimateJMD: JSON.stringify(translations)
          }
        })
        
        fixed++
      }
    } catch (error) {
      console.error(`❌ Error processing strategy ${strategy.id}:`, error.message)
    }
  }
  
  console.log(`\n✅ Translated ${fixed} cost fields\n`)
}

async function main() {
  console.log('🌍 Comprehensive Database Translation\n')
  console.log('=====================================\n')
  
  await translateActionSteps()
  await translateCostFields()
  
  console.log('✅ Translation complete!')
  await prisma.$disconnect()
}

main().catch(console.error)


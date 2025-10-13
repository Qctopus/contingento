const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Translate cost fields that aren't multilingual yet
const costTranslations = {
  'Target: 1-3 months operating expenses': {
    en: 'Target: 1-3 months operating expenses',
    es: 'Objetivo: 1-3 meses de gastos operativos',
    fr: 'Objectif: 1-3 mois de dépenses opérationnelles'
  },
  'JMD 30,000-40,000 compared to professional installation': {
    en: 'JMD 30,000-40,000 compared to professional installation',
    es: 'JMD 30,000-40,000 comparado con instalación profesional',
    fr: 'JMD 30,000-40,000 comparé à installation professionnelle'
  },
  'Avoid expensive emergency loans (often 20-30% interest) when crisis hits': {
    en: 'Avoid expensive emergency loans (often 20-30% interest) when crisis hits',
    es: 'Evite préstamos de emergencia costosos (a menudo 20-30% interés) cuando golpea crisis',
    fr: 'Évitez prêts urgence coûteux (souvent 20-30% intérêt) quand crise frappe'
  }
}

// Translate lowBudgetAlternative fields
const budgetAltTranslations = {
  'comm_backup_comm': {
    en: 'Start with free WhatsApp groups (JMD 0) and basic printed contact lists (JMD 500 lamination). Add backup SIM cards (JMD 500 each) before investing in expensive equipment.',
    es: 'Comience con grupos gratuitos de WhatsApp (JMD 0) y listas de contacto impresas básicas (JMD 500 laminación). Agregue tarjetas SIM de respaldo (JMD 500 cada una) antes de invertir en equipo costoso.',
    fr: 'Commencez avec groupes WhatsApp gratuits (JMD 0) et listes contact imprimées de base (JMD 500 laminage). Ajoutez cartes SIM secours (JMD 500 chacune) avant investir équipement coûteux.'
  },
  'financial_resilience': {
    en: 'Start by saving just JMD 5,000 per week in a separate account. In 3 months you\'ll have JMD 60,000 emergency fund - enough for basic repairs or 1 week of expenses.',
    es: 'Comience ahorrando solo JMD 5,000 por semana en una cuenta separada. En 3 meses tendrá JMD 60,000 fondo de emergencia - suficiente para reparaciones básicas o 1 semana de gastos.',
    fr: 'Commencez en économisant seulement JMD 5,000 par semaine dans compte séparé. En 3 mois vous aurez JMD 60,000 fonds urgence - suffisant pour réparations de base ou 1 semaine dépenses.'
  }
}

async function fixCostFields() {
  console.log('🔄 Translating strategy cost fields...\n')
  
  const strategies = await prisma.riskMitigationStrategy.findMany()
  let fixed = 0
  
  for (const strategy of strategies) {
    try {
      let updated = {}
      
      // Fix costEstimateJMD if it matches a pattern
      if (strategy.costEstimateJMD && !strategy.costEstimateJMD.startsWith('{')) {
        for (const [pattern, translations] of Object.entries(costTranslations)) {
          if (strategy.costEstimateJMD.includes(pattern)) {
            updated.costEstimateJMD = JSON.stringify(translations)
            console.log(`✅ Translating cost for ${strategy.name.substring(0, 50)}...`)
            break
          }
        }
      }
      
      // Fix lowBudgetAlternative
      if (strategy.lowBudgetAlternative && typeof strategy.lowBudgetAlternative === 'string' && !strategy.lowBudgetAlternative.startsWith('{')) {
        const strategyId = strategy.id.includes('comm_backup') ? 'comm_backup_comm' : 
                          strategy.id.includes('financial') ? 'financial_resilience' : null
        
        if (strategyId && budgetAltTranslations[strategyId]) {
          updated.lowBudgetAlternative = JSON.stringify(budgetAltTranslations[strategyId])
          console.log(`✅ Translating budget alternative for ${strategy.name.substring(0, 50)}...`)
        }
      }
      
      if (Object.keys(updated).length > 0) {
        await prisma.riskMitigationStrategy.update({
          where: { id: strategy.id },
          data: updated
        })
        fixed++
      }
    } catch (error) {
      console.error(`❌ Error processing strategy ${strategy.id}:`, error.message)
    }
  }
  
  console.log(`\n✅ Fixed ${fixed} strategy fields`)
}

async function main() {
  await fixCostFields()
  await prisma.$disconnect()
}

main().catch(console.error)


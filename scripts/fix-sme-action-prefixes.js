const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const smeActionTranslations = {
  'comm_backup_step_2': {
    en: 'Set up WhatsApp broadcast groups for emergency communication',
    es: 'Configurar grupos de difusión WhatsApp para comunicación de emergencia',
    fr: 'Configurer groupes de diffusion WhatsApp pour communication d\'urgence'
  },
  'comm_backup_step_3': {
    en: 'Buy portable WiFi hotspot from Digicel or Flow for backup internet',
    es: 'Comprar hotspot WiFi portátil de Digicel o Flow para internet de respaldo',
    fr: 'Acheter hotspot WiFi portable de Digicel ou Flow pour internet de secours'
  },
  'equip_maint_step_2': {
    en: 'Set weekly cleaning schedule: filters, visual checks, listen for unusual sounds',
    es: 'Establecer horario de limpieza semanal: filtros, verificaciones visuales, escuchar sonidos inusuales',
    fr: 'Établir horaire nettoyage hebdomadaire: filtres, vérifications visuelles, écouter sons inhabituels'
  },
  'comm_backup_step_4': {
    en: 'Purchase walkie-talkies for staff communication when phones don\'t work',
    es: 'Comprar walkie-talkies para comunicación del personal cuando los teléfonos no funcionan',
    fr: 'Acheter walkie-talkies pour communication personnel quand téléphones ne fonctionnent pas'
  },
  'equip_maint_step_1': {
    en: 'List all business-critical equipment with brand, model, age, and warranty info',
    es: 'Listar todo el equipo crítico del negocio con marca, modelo, edad e información de garantía',
    fr: 'Lister tout équipement critique entreprise avec marque, modèle, âge et info garantie'
  },
  'equip_maint_step_5': {
    en: 'Set aside JMD 5,000-10,000 monthly for future equipment replacement',
    es: 'Reservar JMD 5,000-10,000 mensualmente para futura reemplazo de equipo',
    fr: 'Réserver JMD 5,000-10,000 mensuellement pour futur remplacement équipement'
  }
}

async function main() {
  console.log('Fixing smeAction [ES] and [FR] prefixes...\n')
  
  for (const [stepId, translations] of Object.entries(smeActionTranslations)) {
    const step = await prisma.actionStep.findFirst({
      where: { stepId }
    })
    
    if (step) {
      console.log(`✅ Fixing ${stepId}`)
      console.log(`   EN: ${translations.en}`)
      console.log(`   ES: ${translations.es}`)
      console.log(`   FR: ${translations.fr}\n`)
      
      await prisma.actionStep.update({
        where: { id: step.id },
        data: {
          smeAction: JSON.stringify(translations)
        }
      })
    }
  }
  
  console.log('✅ All smeAction fields fixed!')
  await prisma.$disconnect()
}

main().catch(console.error)


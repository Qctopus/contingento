import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to create multilingual JSON string
const ml = (en: string, es: string, fr: string) => JSON.stringify({ en, es, fr })

// Parse multilingual content
function parseMultilingual(value: any): Record<'en' | 'es' | 'fr', string> {
  if (!value) return { en: '', es: '', fr: '' }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object') {
        return { en: parsed.en || '', es: parsed.es || '', fr: parsed.fr || '' }
      }
      return { en: value, es: '', fr: '' }
    } catch {
      return { en: value, es: '', fr: '' }
    }
  }
  return value || { en: '', es: '', fr: '' }
}

// Check if text is dummy/placeholder
function isDummyText(text: string): boolean {
  if (!text) return true
  const lower = text.toLowerCase()
  const dummyPatterns = [
    'data backup step',
    'communication step',
    'step 1',
    'step 2',
    'step 3',
    'step 4',
    'action step',
    'description here',
    'enter description',
    'add description',
    'brief description',
    'detailed description',
    'placeholder',
    'dummy',
    'example',
    'todo',
    'tbd',
    'complete action step' // This is our fallback placeholder
  ]
  return dummyPatterns.some(pattern => lower.includes(pattern)) && text.length < 200
}

// Generate proper content based on step context
function generateProperContent(step: any, strategyName: string, allSteps: any[]): {
  title: Record<'en' | 'es' | 'fr', string>
  description: Record<'en' | 'es' | 'fr', string>
  smeAction: Record<'en' | 'es' | 'fr', string>
} {
  const stepTitle = parseMultilingual(step.title).en.toLowerCase()
  const strategyLower = strategyName.toLowerCase()
  const stepNumber = step.sortOrder || 0
  const strategySteps = allSteps.filter(s => s.strategyId === step.strategyId).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  
  // Data Backup steps
  if (strategyLower.includes('data') || strategyLower.includes('backup')) {
    if (stepTitle.includes('step 1') || stepTitle.includes('backup step 1')) {
      return {
        title: {
          en: 'Set Up Cloud Backup System',
          es: 'Configurar Sistema de Respaldo en la Nube',
          fr: 'Configurer Système de Sauvegarde Cloud'
        },
        description: {
          en: 'Configure automatic cloud backup using Google Drive, Dropbox, or a dedicated backup service. Set up daily automatic sync for critical business files including customer records, financial data, inventory, and invoices.',
          es: 'Configure respaldo automático en la nube usando Google Drive, Dropbox o un servicio de respaldo dedicado. Configure sincronización automática diaria para archivos comerciales críticos incluyendo registros de clientes, datos financieros, inventario y facturas.',
          fr: 'Configurez sauvegarde cloud automatique avec Google Drive, Dropbox ou service sauvegarde dédié. Configurez synchronisation automatique quotidienne pour fichiers commerciaux critiques incluant dossiers clients, données financières, inventaire et factures.'
        },
        smeAction: {
          en: 'Sign up for Google Drive (free 15GB). Install sync app on your computer. Drag your important folders into Google Drive folder - they\'ll backup automatically.',
          es: 'Regístrese en Google Drive (15GB gratis). Instale aplicación de sincronización en su computadora. Arrastre sus carpetas importantes a la carpeta de Google Drive - se respaldarán automáticamente.',
          fr: 'Inscrivez-vous Google Drive (15GB gratuit). Installez app synchro sur ordinateur. Faites glisser dossiers importants dans dossier Google Drive - ils sauvegarderont automatiquement.'
        }
      }
    }
    if (stepTitle.includes('step 2') || stepTitle.includes('backup step 2')) {
      return {
        title: {
          en: 'Create Local Backup System',
          es: 'Crear Sistema de Respaldo Local',
          fr: 'Créer Système de Sauvegarde Local'
        },
        description: {
          en: 'Set up weekly backup to external hard drive or USB drives. Keep 2-3 drives rotating - one at business, one at owner\'s home, one updating. This provides fast recovery and protects against internet/cloud service outages.',
          es: 'Configure respaldo semanal a disco duro externo o unidades USB. Mantenga 2-3 unidades rotando - una en el negocio, una en casa del propietario, una actualizándose. Esto proporciona recuperación rápida y protege contra cortes de internet/servicio en la nube.',
          fr: 'Configurez sauvegarde hebdomadaire sur disque dur externe ou clés USB. Gardez 2-3 disques en rotation - un à entreprise, un chez propriétaire, un en mise à jour. Cela fournit récupération rapide et protège contre pannes internet/service cloud.'
        },
        smeAction: {
          en: 'Buy 2 USB drives. Every Friday, copy all important files to one drive. Take it home. Next Friday, bring it back and use the other drive.',
          es: 'Compre 2 unidades USB. Todos los viernes, copie todos los archivos importantes a una unidad. Llévela a casa. El próximo viernes, tráigala de vuelta y use la otra unidad.',
          fr: 'Achetez 2 clés USB. Chaque vendredi, copiez tous fichiers importants sur une clé. Ramenez-la à maison. Vendredi prochain, rapportez-la et utilisez autre clé.'
        }
      }
    }
  }
  
  // Communication steps
  if (strategyLower.includes('communication') || strategyLower.includes('contact')) {
    if (stepTitle.includes('step 1') || stepTitle.includes('communication step 1')) {
      return {
        title: {
          en: 'Create Comprehensive Contact List',
          es: 'Crear Lista de Contactos Completa',
          fr: 'Créer Liste Contacts Complète'
        },
        description: {
          en: 'Compile all critical contact information: staff (names, mobile, home phone, email, emergency contact), key customers (especially regulars/VIPs), suppliers (electrician, plumber, generator repair, insurance agent), emergency services (police, fire, ambulance), and utilities.',
          es: 'Compile toda la información de contacto crítica: personal (nombres, móvil, teléfono de casa, correo, contacto de emergencia), clientes clave (especialmente regulares/VIP), proveedores (electricista, plomero, reparación de generadores, agente de seguros), servicios de emergencia (policía, bomberos, ambulancia), y servicios públicos.',
          fr: 'Compilez toutes informations contact critiques: personnel (noms, mobile, téléphone maison, email, contact urgence), clients clés (surtout réguliers/VIP), fournisseurs (électricien, plombier, réparation générateur, agent assurance), services urgence (police, pompiers, ambulance), et services publics.'
        },
        smeAction: {
          en: 'Make a spreadsheet with everyone\'s name and phone numbers. Get staff to fill in their info. Look up emergency numbers online. Save multiple copies.',
          es: 'Haga una hoja de cálculo con el nombre y números de teléfono de todos. Pida al personal que complete su información. Busque números de emergencia en línea. Guarde múltiples copias.',
          fr: 'Faites une feuille calcul avec nom et numéros téléphone de tous. Demandez personnel remplir leurs infos. Cherchez numéros urgence en ligne. Sauvegardez plusieurs copies.'
        }
      }
    }
    if (stepTitle.includes('step 2') || stepTitle.includes('communication step 2')) {
      return {
        title: {
          en: 'Set Up Communication Channels',
          es: 'Configurar Canales de Comunicación',
          fr: 'Configurer Canaux Communication'
        },
        description: {
          en: 'Create WhatsApp group for all staff members. Set up email distribution list for customers. Establish backup communication methods (SMS, phone tree) in case internet is down.',
          es: 'Cree grupo de WhatsApp para todos los miembros del personal. Configure lista de distribución de correo para clientes. Establezca métodos de comunicación de respaldo (SMS, árbol telefónico) en caso de que internet esté caído.',
          fr: 'Créez groupe WhatsApp pour tous membres personnel. Configurez liste distribution email pour clients. Établissez méthodes communication secours (SMS, arbre téléphonique) au cas où internet serait coupé.'
        },
        smeAction: {
          en: 'Create WhatsApp group, add all staff. Test it by sending a message. Save emergency numbers in your phone contacts.',
          es: 'Cree grupo de WhatsApp, agregue todo el personal. Pruébelo enviando un mensaje. Guarde números de emergencia en los contactos de su teléfono.',
          fr: 'Créez groupe WhatsApp, ajoutez tout personnel. Testez-le en envoyant message. Sauvegardez numéros urgence dans contacts téléphone.'
        }
      }
    }
  }
  
  // Fire prevention steps
  if (strategyLower.includes('fire')) {
    if (stepTitle.includes('smoke') || stepTitle.includes('detector')) {
      return {
        title: {
          en: 'Install Smoke Detectors Throughout Business',
          es: 'Instalar Detectores de Humo en Todo el Negocio',
          fr: 'Installer Détecteurs Fumée dans Toute Entreprise'
        },
        description: {
          en: 'Install smoke detectors in all areas of your business including storage rooms, kitchen areas, offices, and main work areas. Test monthly and replace batteries annually. Ensure detectors are interconnected so all sound when one detects smoke.',
          es: 'Instale detectores de humo en todas las áreas de su negocio incluyendo almacenes, áreas de cocina, oficinas y áreas de trabajo principales. Pruebe mensualmente y reemplace baterías anualmente. Asegúrese de que los detectores estén interconectados para que todos suenen cuando uno detecte humo.',
          fr: 'Installez détecteurs fumée dans toutes zones entreprise incluant entrepôts, zones cuisine, bureaux et zones travail principales. Testez mensuellement et remplacez piles annuellement. Assurez détecteurs interconnectés pour que tous sonnent quand un détecte fumée.'
        },
        smeAction: {
          en: 'Buy smoke detectors for each room. Install them on ceilings following manufacturer instructions. Test each one by pressing the test button.',
          es: 'Compre detectores de humo para cada habitación. Instálelos en techos siguiendo instrucciones del fabricante. Pruebe cada uno presionando el botón de prueba.',
          fr: 'Achetez détecteurs fumée pour chaque pièce. Installez-les plafonds suivant instructions fabricant. Testez chacun en appuyant bouton test.'
        }
      }
    }
  }
  
  // Hurricane steps
  if (strategyLower.includes('hurricane')) {
    if (stepTitle.includes('shutter') || stepTitle.includes('board')) {
      return {
        title: {
          en: 'Install Hurricane Shutters or Board-Up System',
          es: 'Instalar Contraventanas o Sistema de Tablas',
          fr: 'Installer Volets Anticycloniques ou Système Planches'
        },
        description: {
          en: 'Install hurricane shutters, plywood panels, or impact-resistant coverings on all windows and glass doors. Secure outdoor signs, furniture, and equipment that could become projectiles. Reinforce doors and roof attachments.',
          es: 'Instale persianas para huracanes, paneles de madera contrachapada o cubiertas resistentes a impactos en todas las ventanas y puertas de vidrio. Asegure letreros, muebles y equipos al aire libre que podrían convertirse en proyectiles. Refuerce puertas y accesorios de techo.',
          fr: 'Installez volets anti-ouragan, panneaux contreplaqué ou couvertures résistantes aux impacts sur toutes fenêtres et portes vitrées. Sécurisez enseignes, meubles et équipements extérieurs pouvant devenir projectiles. Renforcez portes et fixations toit.'
        },
        smeAction: {
          en: 'Cover all windows with shutters or plywood. Bring everything outside inside. Check that doors can withstand strong winds.',
          es: 'Cubra todas las ventanas con persianas o madera contrachapada. Traiga todo lo que esté afuera adentro. Verifique que las puertas puedan resistir vientos fuertes.',
          fr: 'Couvrez toutes fenêtres avec volets ou contreplaqué. Rentrez tout ce qui est dehors. Vérifiez que portes peuvent résister vents forts.'
        }
      }
    }
  }
  
  // Handle "Complete Action Step" placeholders based on step number and strategy
  if (stepTitle.includes('complete action step')) {
    // Data Backup - additional steps
    if (strategyLower.includes('data') || strategyLower.includes('backup')) {
      if (stepNumber === 3) {
        return {
          title: {
            en: 'Test Backup Restoration',
            es: 'Probar Restauración de Respaldo',
            fr: 'Tester Restauration Sauvegarde'
          },
          description: {
            en: 'Regularly test that you can restore files from your backups. This ensures your backup system actually works when you need it.',
            es: 'Pruebe regularmente que puede restaurar archivos desde sus respaldos. Esto asegura que su sistema de respaldo realmente funciona cuando lo necesita.',
            fr: 'Testez régulièrement que vous pouvez restaurer fichiers depuis vos sauvegardes. Cela assure que votre système sauvegarde fonctionne vraiment quand vous en avez besoin.'
          },
          smeAction: {
            en: 'Once a month, pick a file and try to restore it from backup. Make sure it works.',
            es: 'Una vez al mes, elija un archivo e intente restaurarlo desde el respaldo. Asegúrese de que funcione.',
            fr: 'Une fois par mois, choisissez un fichier et essayez de le restaurer depuis sauvegarde. Assurez-vous que ça fonctionne.'
          }
        }
      }
      if (stepNumber === 4) {
        return {
          title: {
            en: 'Secure Backup Access',
            es: 'Asegurar Acceso a Respaldo',
            fr: 'Sécuriser Accès Sauvegarde'
          },
          description: {
            en: 'Protect your backup systems with strong passwords and two-factor authentication. Ensure only authorized personnel can access backups.',
            es: 'Proteja sus sistemas de respaldo con contraseñas fuertes y autenticación de dos factores. Asegúrese de que solo personal autorizado pueda acceder a los respaldos.',
            fr: 'Protégez vos systèmes sauvegarde avec mots de passe forts et authentification deux facteurs. Assurez que seul personnel autorisé peut accéder sauvegardes.'
          },
          smeAction: {
            en: 'Use strong passwords for cloud accounts. Enable two-factor authentication if available.',
            es: 'Use contraseñas fuertes para cuentas en la nube. Habilite autenticación de dos factores si está disponible.',
            fr: 'Utilisez mots de passe forts pour comptes cloud. Activez authentification deux facteurs si disponible.'
          }
        }
      }
    }
    
    // Communication - additional steps
    if (strategyLower.includes('communication')) {
      if (stepNumber === 3) {
        return {
          title: {
            en: 'Test Communication Systems',
            es: 'Probar Sistemas de Comunicación',
            fr: 'Tester Systèmes Communication'
          },
          description: {
            en: 'Regularly test your communication channels to ensure they work. Send test messages through WhatsApp, email, and SMS to verify all staff can be reached.',
            es: 'Pruebe regularmente sus canales de comunicación para asegurar que funcionan. Envíe mensajes de prueba a través de WhatsApp, correo electrónico y SMS para verificar que todo el personal pueda ser contactado.',
            fr: 'Testez régulièrement vos canaux communication pour assurer qu\'ils fonctionnent. Envoyez messages test via WhatsApp, email et SMS pour vérifier que tout personnel peut être joint.'
          },
          smeAction: {
            en: 'Send a test message to all staff once a month. Make sure everyone responds.',
            es: 'Envíe un mensaje de prueba a todo el personal una vez al mes. Asegúrese de que todos respondan.',
            fr: 'Envoyez message test à tout personnel une fois par mois. Assurez que tous répondent.'
          }
        }
      }
      if (stepNumber >= 4) {
        return {
          title: {
            en: 'Maintain Updated Contact Information',
            es: 'Mantener Información de Contacto Actualizada',
            fr: 'Maintenir Informations Contact Actualisées'
          },
          description: {
            en: 'Review and update contact lists quarterly or whenever staff changes. Remove old contacts and add new ones. Verify all phone numbers and email addresses still work.',
            es: 'Revise y actualice listas de contactos trimestralmente o cuando cambie el personal. Elimine contactos antiguos y agregue nuevos. Verifique que todos los números de teléfono y direcciones de correo aún funcionen.',
            fr: 'Révisez et mettez à jour listes contacts trimestriellement ou quand personnel change. Supprimez anciens contacts et ajoutez nouveaux. Vérifiez que tous numéros téléphone et adresses email fonctionnent encore.'
          },
          smeAction: {
            en: 'Every 3 months, check your contact list. Update any changed numbers or emails.',
            es: 'Cada 3 meses, revise su lista de contactos. Actualice cualquier número o correo cambiado.',
            fr: 'Tous 3 mois, vérifiez votre liste contacts. Mettez à jour numéros ou emails changés.'
          }
        }
      }
    }
  }
  
  // Default fallback - try to generate based on step number
  const stepNum = stepNumber + 1
  return {
    title: {
      en: `Action Step ${stepNum}`,
      es: `Paso de Acción ${stepNum}`,
      fr: `Étape Action ${stepNum}`
    },
    description: {
      en: `Complete this action step as part of your ${strategyName} strategy. Follow the guidance provided and ensure all requirements are met.`,
      es: `Complete este paso de acción como parte de su estrategia ${strategyName}. Siga la guía proporcionada y asegúrese de que se cumplan todos los requisitos.`,
      fr: `Complétez cette étape action dans le cadre de votre stratégie ${strategyName}. Suivez guidance fournie et assurez que toutes exigences sont remplies.`
    },
    smeAction: {
      en: `Follow the instructions for step ${stepNum} and complete it according to your business needs.`,
      es: `Siga las instrucciones para el paso ${stepNum} y complételo según las necesidades de su negocio.`,
      fr: `Suivez instructions pour étape ${stepNum} et complétez-la selon besoins entreprise.`
    }
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   FIX DUMMY ACTION STEPS SCRIPT                              ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')
  
  try {
    // Get all action steps
    const steps = await prisma.actionStep.findMany({
      where: { isActive: true },
      include: {
        strategy: {
          select: { name: true, strategyId: true }
        }
      }
    })
    
    console.log(`📊 Found ${steps.length} action steps to check\n`)
    console.log('═'.repeat(65))
    console.log('')
    
    let fixed = 0
    
    for (const step of steps) {
      const title = parseMultilingual(step.title)
      const description = parseMultilingual(step.description)
      const strategyName = parseMultilingual(step.strategy.name).en || step.strategy.strategyId
      
      if (isDummyText(title.en) || isDummyText(description.en)) {
        console.log(`🔧 Fixing: ${strategyName} > ${title.en}`)
        
        const properContent = generateProperContent(step, strategyName, steps)
        
        await prisma.actionStep.update({
          where: { id: step.id },
          data: {
            title: JSON.stringify(properContent.title),
            description: JSON.stringify(properContent.description),
            smeAction: JSON.stringify(properContent.smeAction)
          }
        })
        
        console.log(`   ✓ Updated to: ${properContent.title.en}`)
        fixed++
      }
    }
    
    console.log('')
    console.log('═'.repeat(65))
    console.log('')
    console.log(`✅ Fixed ${fixed} action steps with dummy text`)
    console.log('')
    
  } catch (error) {
    console.error('\n❌ Error:')
    console.error(error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}


/**
 * Fix Strategy Categories and Action Step Content
 * 
 * This script:
 * 1. Fixes invalid "resilience" category → proper category
 * 2. Adds missing smeAction content for action steps
 * 3. Recategorizes some prevention strategies to better balance before/during/after
 * 4. Enhances action steps with proper executionTiming
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixStrategies() {
  console.log('🔧 FIXING STRATEGY CATEGORIES AND CONTENT')
  console.log('='.repeat(70))
  console.log()

  // ============================================================================
  // FIX 1: Change "resilience" to proper category
  // ============================================================================
  console.log('📝 Fix 1: Updating invalid "resilience" categories...\n')
  
  // Equipment Maintenance should be "preparation" (done before crisis)
  await prisma.riskMitigationStrategy.update({
    where: { strategyId: 'equipment_maintenance' },
    data: {
      category: 'preparation',
      smeSummary: JSON.stringify({
        en: "Keep your critical equipment running with regular maintenance and backup systems. Prevent breakdowns before they happen and have backup options ready when equipment fails.",
        es: "Mantenga su equipo crítico funcionando con mantenimiento regular y sistemas de respaldo. Prevenga averías antes de que sucedan y tenga opciones de respaldo listas cuando el equipo falle.",
        fr: "Maintenez votre équipement critique en fonctionnement avec un entretien régulier et des systèmes de secours. Prévenez les pannes avant qu'elles ne se produisent et ayez des options de secours prêtes lorsque l'équipement tombe en panne."
      })
    }
  })
  console.log('   ✅ equipment_maintenance → preparation')

  // Communication Backup should also be "preparation"
  await prisma.riskMitigationStrategy.update({
    where: { strategyId: 'communication_backup' },
    data: {
      category: 'preparation',
      smeSummary: JSON.stringify({
        en: "Stay connected with customers and staff during emergencies. Set up backup communication systems so you never lose contact even if primary systems fail.",
        es: "Manténgase conectado con clientes y personal durante emergencias. Configure sistemas de comunicación de respaldo para nunca perder contacto incluso si los sistemas principales fallan.",
        fr: "Restez connecté avec les clients et le personnel pendant les urgences. Configurez des systèmes de communication de secours pour ne jamais perdre le contact même si les systèmes principaux tombent en panne."
      })
    }
  })
  console.log('   ✅ communication_backup → preparation')

  // ============================================================================
  // FIX 2: Add missing smeAction content for cybersecurity steps
  // ============================================================================
  console.log('\n📝 Fix 2: Adding missing smeAction content...\n')
  
  const cyberStrategy = await prisma.riskMitigationStrategy.findUnique({
    where: { strategyId: 'cybersecurity_protection' },
    include: { actionSteps: { orderBy: { sortOrder: 'asc' } } }
  })

  if (cyberStrategy) {
    for (const step of cyberStrategy.actionSteps) {
      let smeAction = step.smeAction
      
      // Fix cyber_step_1
      if (step.stepId === 'cyber_step_1' && (!smeAction || smeAction.length < 10)) {
        smeAction = JSON.stringify({
          en: "Install antivirus software on all computers and devices. Update it automatically every day to catch new threats.",
          es: "Instale software antivirus en todas las computadoras y dispositivos. Actualícelo automáticamente todos los días para detectar nuevas amenazas.",
          fr: "Installez un logiciel antivirus sur tous les ordinateurs et appareils. Mettez-le à jour automatiquement chaque jour pour détecter les nouvelles menaces."
        })
        
        await prisma.actionStep.update({
          where: { id: step.id },
          data: {
            smeAction,
            whyThisStepMatters: "Viruses and malware can steal customer data, lock your files for ransom, or shut down your systems completely. Antivirus software is your first line of defense.",
            whatHappensIfSkipped: "Without antivirus protection, hackers can easily install malicious software that steals passwords, credit card numbers, and customer information. You could face lawsuits, fines, and lose customer trust.",
            timeframe: "1-2 hours",
            estimatedMinutes: 90
          }
        })
        console.log('   ✅ Fixed cyber_step_1 smeAction')
      }
      
      // Fix cyber_step_2
      if (step.stepId === 'cyber_step_2' && (!smeAction || smeAction.length < 10)) {
        smeAction = JSON.stringify({
          en: "Create strong passwords (12+ characters, mix of letters, numbers, symbols) for all accounts. Use a password manager like LastPass or Bitwarden to remember them securely.",
          es: "Cree contraseñas fuertes (12+ caracteres, mezcla de letras, números, símbolos) para todas las cuentas. Use un administrador de contraseñas como LastPass o Bitwarden para recordarlas de forma segura.",
          fr: "Créez des mots de passe forts (12+ caractères, mélange de lettres, chiffres, symboles) pour tous les comptes. Utilisez un gestionnaire de mots de passe comme LastPass ou Bitwarden pour les mémoriser en toute sécurité."
        })
        
        await prisma.actionStep.update({
          where: { id: step.id },
          data: {
            smeAction,
            whyThisStepMatters: "Weak passwords like '12345' or 'password' are the #1 way hackers break into business accounts. Strong passwords stop 80% of cyberattacks.",
            whatHappensIfSkipped: "Hackers use automated tools to guess weak passwords in seconds. They can access your business accounts, steal money, delete files, or impersonate your business to scam customers.",
            timeframe: "2-3 hours",
            estimatedMinutes: 150,
            freeAlternative: "Use a free password manager like Bitwarden. Write down a master password on paper and keep it in a safe place."
          }
        })
        console.log('   ✅ Fixed cyber_step_2 smeAction')
      }
    }
  }

  // ============================================================================
  // FIX 3: Recategorize some strategies for better balance
  // ============================================================================
  console.log('\n📝 Fix 3: Rebalancing strategy categories...\n')
  
  // Hurricane Preparedness has AFTER steps, so it should be mixed (keep as prevention but ensure steps are properly timed)
  const hurricaneStrat = await prisma.riskMitigationStrategy.findUnique({
    where: { strategyId: 'hurricane_preparation' },
    include: { actionSteps: { orderBy: { sortOrder: 'asc' } } }
  })
  
  if (hurricaneStrat) {
    // Update step timing based on content
    for (const step of hurricaneStrat.actionSteps) {
      const description = (step.description || '').toLowerCase()
      const smeAction = (step.smeAction || '').toLowerCase()
      const text = `${description} ${smeAction}`
      
      let timing = step.executionTiming || 'before_crisis'
      
      if (text.includes('after') || text.includes('inspect') || text.includes('assess damage') || text.includes('claim')) {
        timing = 'after_crisis'
      } else if (text.includes('during') || text.includes('when storm') || text.includes('evacuate')) {
        timing = 'during_crisis'
      }
      
      if (timing !== step.executionTiming) {
        await prisma.actionStep.update({
          where: { id: step.id },
          data: { executionTiming: timing }
        })
        console.log(`   ✅ Updated ${step.stepId} timing: ${step.executionTiming} → ${timing}`)
      }
    }
  }

  // ============================================================================
  // FIX 4: Add RECOVERY content to existing strategies
  // ============================================================================
  console.log('\n📝 Fix 4: Adding recovery action steps to key strategies...\n')
  
  // Add recovery steps to fire detection (what to do after a fire)
  const fireStrat = await prisma.riskMitigationStrategy.findUnique({
    where: { strategyId: 'fire_detection_suppression' },
    include: { actionSteps: true }
  })
  
  if (fireStrat) {
    const maxSortOrder = Math.max(...fireStrat.actionSteps.map(s => s.sortOrder), 0)
    
    // Check if recovery step already exists
    const hasRecoveryStep = fireStrat.actionSteps.some(s => 
      s.executionTiming === 'after_crisis' || 
      (s.smeAction || '').toLowerCase().includes('after')
    )
    
    if (!hasRecoveryStep) {
      await prisma.actionStep.create({
        data: {
          strategyId: fireStrat.id,
          stepId: 'fire_step_5',
          phase: 'medium_term',
          executionTiming: 'after_crisis',
          title: JSON.stringify({
            en: "Post-Fire Recovery & Restoration",
            es: "Recuperación y Restauración Post-Incendio",
            fr: "Récupération et Restauration Après Incendie"
          }),
          description: JSON.stringify({
            en: "Document damage, work with insurance, and safely restore operations after a fire incident",
            es: "Documentar daños, trabajar con el seguro y restaurar operaciones de manera segura después de un incendio",
            fr: "Documenter les dommages, travailler avec l'assurance et restaurer les opérations en toute sécurité après un incendie"
          }),
          smeAction: JSON.stringify({
            en: "Take photos/videos of ALL damage before cleaning up. Contact insurance within 24 hours. Don't throw away damaged items until adjuster sees them. Get professional inspection before reopening - don't risk electrical or structural hazards.",
            es: "Tome fotos/videos de TODOS los daños antes de limpiar. Contacte al seguro dentro de 24 horas. No tire artículos dañados hasta que el ajustador los vea. Obtenga inspección profesional antes de reabrir - no arriesgue peligros eléctricos o estructurales.",
            fr: "Prenez des photos/vidéos de TOUS les dommages avant de nettoyer. Contactez l'assurance dans les 24 heures. Ne jetez pas les articles endommagés jusqu'à ce que l'expert les voie. Obtenez une inspection professionnelle avant de rouvrir - ne risquez pas de dangers électriques ou structurels."
          }),
          whyThisStepMatters: "Proper documentation and professional assessment are critical for insurance claims and safety. Rushing to reopen without inspection can put people at risk and void your insurance coverage.",
          whatHappensIfSkipped: "Without proper documentation, insurance may deny your claim or pay only a fraction of actual damages. Reopening too soon can cause injuries from smoke damage, electrical hazards, or structural weakness.",
          timeframe: "1-2 weeks",
          estimatedMinutes: 4800,
          sortOrder: maxSortOrder + 1,
          isActive: true
        }
      })
      console.log('   ✅ Added recovery step to fire_detection_suppression')
    }
  }

  // Add recovery steps to flood prevention
  const floodStrat = await prisma.riskMitigationStrategy.findUnique({
    where: { strategyId: 'flood_prevention' },
    include: { actionSteps: true }
  })
  
  if (floodStrat) {
    const maxSortOrder = Math.max(...floodStrat.actionSteps.map(s => s.sortOrder), 0)
    
    const hasRecoveryStep = floodStrat.actionSteps.some(s => 
      s.executionTiming === 'after_crisis' || 
      (s.smeAction || '').toLowerCase().includes('after')
    )
    
    if (!hasRecoveryStep) {
      await prisma.actionStep.create({
        data: {
          strategyId: floodStrat.id,
          stepId: 'flood_step_4',
          phase: 'medium_term',
          executionTiming: 'after_crisis',
          title: JSON.stringify({
            en: "Post-Flood Cleanup & Restoration",
            es: "Limpieza y Restauración Post-Inundación",
            fr: "Nettoyage et Restauration Après Inondation"
          }),
          description: JSON.stringify({
            en: "Safely clean up flood damage, prevent mold, and restore business operations",
            es: "Limpie de manera segura los daños por inundación, prevenga moho y restaure las operaciones comerciales",
            fr: "Nettoyez en toute sécurité les dommages causés par les inondations, prévenez la moisissure et restaurez les opérations commerciales"
          }),
          smeAction: JSON.stringify({
            en: "Document ALL damage with photos before cleanup. Remove standing water ASAP (within 24-48 hours to prevent mold). Discard porous items (carpets, drywall) that got soaked. Hire professionals for electrical and structural inspection before reopening. Clean and disinfect all surfaces that touched floodwater.",
            es: "Documente TODOS los daños con fotos antes de limpiar. Elimine el agua estancada lo antes posible (dentro de 24-48 horas para prevenir moho). Deseche artículos porosos (alfombras, paneles de yeso) que se empaparon. Contrate profesionales para inspección eléctrica y estructural antes de reabrir. Limpie y desinfecte todas las superficies que tocaron el agua de inundación.",
            fr: "Documentez TOUS les dommages avec des photos avant le nettoyage. Enlevez l'eau stagnante dès que possible (dans les 24-48 heures pour prévenir la moisissure). Jetez les articles poreux (tapis, plaques de plâtre) qui ont été trempés. Engagez des professionnels pour une inspection électrique et structurelle avant de rouvrir. Nettoyez et désinfectez toutes les surfaces qui ont touché l'eau d'inondation."
          }),
          whyThisStepMatters: "Mold can start growing in 24-48 hours after flooding and cause serious health problems. Contaminated floodwater carries bacteria and chemicals that make people sick. Damaged electrical systems can cause fires or electrocution.",
          whatHappensIfSkipped: "Mold will spread throughout your building, making it unsafe and potentially requiring complete demolition. Staff and customers can get sick from contaminated surfaces. Electrical hazards can cause fires or injuries.",
          timeframe: "1-3 weeks",
          estimatedMinutes: 9600,
          sortOrder: maxSortOrder + 1,
          isActive: true
        }
      })
      console.log('   ✅ Added recovery step to flood_prevention')
    }
  }

  // ============================================================================
  // FIX 5: Create dedicated RESPONSE and RECOVERY strategies
  // ============================================================================
  console.log('\n📝 Fix 5: Creating dedicated response and recovery strategies...\n')
  
  // Check if emergency response strategy exists
  const emergencyResponseExists = await prisma.riskMitigationStrategy.findUnique({
    where: { strategyId: 'emergency_response_plan' }
  })
  
  if (!emergencyResponseExists) {
    const emergencyResponse = await prisma.riskMitigationStrategy.create({
      data: {
        strategyId: 'emergency_response_plan',
        name: JSON.stringify({
          en: "Emergency Response Protocols",
          es: "Protocolos de Respuesta de Emergencia",
          fr: "Protocoles de Réponse d'Urgence"
        }),
        smeTitle: JSON.stringify({
          en: "Know Exactly What To Do When Disaster Strikes",
          es: "Sepa Exactamente Qué Hacer Cuando Ocurre un Desastre",
          fr: "Sachez Exactement Quoi Faire Lorsqu'une Catastrophe Survient"
        }),
        category: 'response',
        description: JSON.stringify({
          en: "Step-by-step procedures for responding to emergencies as they happen, protecting people and assets",
          es: "Procedimientos paso a paso para responder a emergencias cuando ocurren, protegiendo personas y activos",
          fr: "Procédures étape par étape pour répondre aux urgences au fur et à mesure qu'elles se produisent, en protégeant les personnes et les actifs"
        }),
        smeSummary: JSON.stringify({
          en: "Have a clear plan ready so you and your team know exactly what to do in any emergency - no panic, no confusion, just fast action to protect lives and your business.",
          es: "Tenga un plan claro listo para que usted y su equipo sepan exactamente qué hacer en cualquier emergencia - sin pánico, sin confusión, solo acción rápida para proteger vidas y su negocio.",
          fr: "Ayez un plan clair prêt afin que vous et votre équipe sachiez exactement quoi faire en cas d'urgence - pas de panique, pas de confusion, juste une action rapide pour protéger les vies et votre entreprise."
        }),
        applicableRisks: JSON.stringify(['hurricane', 'earthquake', 'fire', 'flood', 'civil_unrest', 'pandemic']),
        selectionTier: 'essential',
        implementationCost: 'low',
        timeToImplement: 'days',
        complexityLevel: 'simple',
        effectiveness: 9,
        isActive: true
      }
    })
    
    // Add action steps for emergency response
    await prisma.actionStep.createMany({
      data: [
        {
          strategyId: emergencyResponse.id,
          stepId: 'emergency_step_1',
          phase: 'immediate',
          executionTiming: 'during_crisis',
          title: JSON.stringify({
            en: "Ensure Immediate Safety",
            es: "Asegurar Seguridad Inmediata",
            fr: "Assurer la Sécurité Immédiate"
          }),
          description: JSON.stringify({
            en: "Evacuate if building is unsafe, account for all people, call emergency services if needed",
            es: "Evacuar si el edificio no es seguro, contabilizar a todas las personas, llamar a servicios de emergencia si es necesario",
            fr: "Évacuer si le bâtiment n'est pas sûr, comptabiliser toutes les personnes, appeler les services d'urgence si nécessaire"
          }),
          smeAction: JSON.stringify({
            en: "Get everyone out if there's fire, structural damage, flooding, or violence. Meet at designated safe spot. Count everyone. Call 911 or local emergency number if anyone is hurt or in danger. Don't go back inside until officials say it's safe.",
            es: "Saque a todos si hay fuego, daño estructural, inundación o violencia. Reúnase en el lugar seguro designado. Cuente a todos. Llame al 911 o número de emergencia local si alguien está herido o en peligro. No regrese adentro hasta que los oficiales digan que es seguro.",
            fr: "Faites sortir tout le monde s'il y a un incendie, des dommages structurels, des inondations ou de la violence. Rendez-vous au point de sécurité désigné. Comptez tout le monde. Appelez le 911 ou le numéro d'urgence local si quelqu'un est blessé ou en danger. Ne retournez pas à l'intérieur tant que les autorités ne disent pas que c'est sûr."
          }),
          whyThisStepMatters: "Lives come first - always. A business can be rebuilt, but people cannot be replaced. Quick evacuation and accounting for everyone prevents injuries and deaths.",
          whatHappensIfSkipped: "People can be trapped, injured, or killed if you don't evacuate quickly. You may not realize someone is missing until it's too late.",
          timeframe: "Immediate (minutes)",
          estimatedMinutes: 15,
          sortOrder: 1,
          isActive: true
        },
        {
          strategyId: emergencyResponse.id,
          stepId: 'emergency_step_2',
          phase: 'immediate',
          executionTiming: 'during_crisis',
          title: JSON.stringify({
            en: "Activate Communication Plan",
            es: "Activar Plan de Comunicación",
            fr: "Activer le Plan de Communication"
          }),
          description: JSON.stringify({
            en: "Alert staff, notify key stakeholders, document the situation",
            es: "Alertar al personal, notificar a las partes interesadas clave, documentar la situación",
            fr: "Alerter le personnel, notifier les parties prenantes clés, documenter la situation"
          }),
          smeAction: JSON.stringify({
            en: "Call/text all staff using emergency contact list. Inform Plan Manager immediately. Start group chat or phone tree. Tell customers you're closed (social media, phone message). Start writing down everything that happens with times - this is critical for insurance.",
            es: "Llame/envíe mensajes de texto a todo el personal usando la lista de contactos de emergencia. Informe al Gerente del Plan inmediatamente. Inicie un chat grupal o árbol telefónico. Diga a los clientes que está cerrado (redes sociales, mensaje telefónico). Comience a anotar todo lo que sucede con las horas - esto es crítico para el seguro.",
            fr: "Appelez/envoyez un SMS à tout le personnel en utilisant la liste de contacts d'urgence. Informez immédiatement le gestionnaire du plan. Démarrez un chat de groupe ou une chaîne téléphonique. Informez les clients que vous êtes fermé (médias sociaux, message téléphonique). Commencez à noter tout ce qui se passe avec les heures - c'est essentiel pour l'assurance."
          }),
          whyThisStepMatters: "Staff need to know what's happening to stay safe and coordinate response. Customers need to know you're closed to avoid showing up. Documentation is essential for insurance claims and learning from the incident.",
          whatHappensIfSkipped: "Staff may unknowingly come to work and enter a dangerous situation. Customers get frustrated showing up to a closed business. Without documentation, you'll forget critical details that insurance needs.",
          timeframe: "Within 1 hour",
          estimatedMinutes: 60,
          sortOrder: 2,
          isActive: true
        },
        {
          strategyId: emergencyResponse.id,
          stepId: 'emergency_step_3',
          phase: 'immediate',
          executionTiming: 'during_crisis',
          title: JSON.stringify({
            en: "Protect Assets & Document Damage",
            es: "Proteger Activos y Documentar Daños",
            fr: "Protéger les Actifs et Documenter les Dommages"
          }),
          description: JSON.stringify({
            en: "Secure valuable items, take photos/videos of damage, contact insurance",
            es: "Asegurar artículos valiosos, tomar fotos/videos de daños, contactar al seguro",
            fr: "Sécuriser les objets de valeur, prendre des photos/vidéos des dommages, contacter l'assurance"
          }),
          smeAction: JSON.stringify({
            en: "If safe to do so: take photos/videos of ALL damage from multiple angles. Grab critical documents (cash, checks, hard drives, contracts). Lock doors and secure premises. Call insurance company ASAP - they need to know within 24-48 hours. Don't throw anything away until adjuster sees it.",
            es: "Si es seguro hacerlo: tome fotos/videos de TODOS los daños desde múltiples ángulos. Tome documentos críticos (efectivo, cheques, discos duros, contratos). Cierre puertas y asegure las instalaciones. Llame a la compañía de seguros lo antes posible - necesitan saber dentro de 24-48 horas. No tire nada hasta que el ajustador lo vea.",
            fr: "Si c'est sûr de le faire: prenez des photos/vidéos de TOUS les dommages sous plusieurs angles. Prenez les documents critiques (argent liquide, chèques, disques durs, contrats). Verrouillez les portes et sécurisez les locaux. Appelez la compagnie d'assurance dès que possible - ils doivent savoir dans les 24-48 heures. Ne jetez rien jusqu'à ce que l'expert le voie."
          }),
          whyThisStepMatters: "Insurance claims require detailed proof of damage. Without photos, they may deny or underpay your claim. Securing premises prevents theft and additional damage. Early notification to insurance is often required by policy.",
          whatHappensIfSkipped: "You may lose tens of thousands in insurance claims without proper documentation. Looters can steal from damaged buildings. Late notification can void your insurance coverage entirely.",
          timeframe: "Within 6 hours",
          estimatedMinutes: 180,
          sortOrder: 3,
          isActive: true
        }
      ]
    })
    console.log('   ✅ Created emergency_response_plan strategy with 3 action steps')
  }

  // Create business recovery strategy
  const recoveryExists = await prisma.riskMitigationStrategy.findUnique({
    where: { strategyId: 'business_recovery_restoration' }
  })
  
  if (!recoveryExists) {
    const recovery = await prisma.riskMitigationStrategy.create({
      data: {
        strategyId: 'business_recovery_restoration',
        name: JSON.stringify({
          en: "Business Recovery & Restoration",
          es: "Recuperación y Restauración de Negocios",
          fr: "Récupération et Restauration des Affaires"
        }),
        smeTitle: JSON.stringify({
          en: "Get Your Business Back Up and Running After Disaster",
          es: "Ponga su Negocio en Funcionamiento Después del Desastre",
          fr: "Remettez Votre Entreprise en Marche Après une Catastrophe"
        }),
        category: 'recovery',
        description: JSON.stringify({
          en: "Systematic process for restoring operations, filing claims, and rebuilding after a crisis",
          es: "Proceso sistemático para restaurar operaciones, presentar reclamos y reconstruir después de una crisis",
          fr: "Processus systématique pour restaurer les opérations, déposer des réclamations et reconstruire après une crise"
        }),
        smeSummary: JSON.stringify({
          en: "Recover faster and stronger with a clear roadmap for getting back to business. Know what to do first, how to work with insurance, and how to rebuild better than before.",
          es: "Recupérese más rápido y más fuerte con una hoja de ruta clara para volver a los negocios. Sepa qué hacer primero, cómo trabajar con el seguro y cómo reconstruir mejor que antes.",
          fr: "Récupérez plus rapidement et plus fort avec une feuille de route claire pour reprendre les affaires. Sachez quoi faire en premier, comment travailler avec l'assurance et comment reconstruire mieux qu'avant."
        }),
        applicableRisks: JSON.stringify(['hurricane', 'earthquake', 'fire', 'flood', 'civil_unrest']),
        selectionTier: 'essential',
        implementationCost: 'medium',
        timeToImplement: 'weeks',
        complexityLevel: 'moderate',
        effectiveness: 8,
        isActive: true
      }
    })
    
    // Add action steps for recovery
    await prisma.actionStep.createMany({
      data: [
        {
          strategyId: recovery.id,
          stepId: 'recovery_step_1',
          phase: 'short_term',
          executionTiming: 'after_crisis',
          title: JSON.stringify({
            en: "Complete Damage Assessment",
            es: "Evaluación Completa de Daños",
            fr: "Évaluation Complète des Dommages"
          }),
          description: JSON.stringify({
            en: "Document all damage thoroughly for insurance and recovery planning",
            es: "Documente todos los daños minuciosamente para el seguro y la planificación de recuperación",
            fr: "Documentez tous les dommages en détail pour l'assurance et la planification de la récupération"
          }),
          smeAction: JSON.stringify({
            en: "Walk through entire premises with camera/phone - video everything. Make detailed list of damaged items with purchase dates and costs. Take close-ups of serial numbers on equipment. Get professional estimates for repairs. Create folder with all documentation for insurance adjuster.",
            es: "Recorra todas las instalaciones con cámara/teléfono - grabe todo en video. Haga una lista detallada de artículos dañados con fechas de compra y costos. Tome primeros planos de números de serie en equipos. Obtenga estimaciones profesionales para reparaciones. Cree una carpeta con toda la documentación para el ajustador de seguros.",
            fr: "Parcourez tout les locaux avec appareil photo/téléphone - filmez tout. Faites une liste détaillée des articles endommagés avec les dates d'achat et les coûts. Prenez des gros plans des numéros de série sur les équipements. Obtenez des estimations professionnelles pour les réparations. Créez un dossier avec toute la documentation pour l'expert en assurance."
          }),
          whyThisStepMatters: "Insurance adjusters need detailed proof to approve claims. Professional estimates give you realistic recovery timeline and costs. Organized documentation speeds up claims process by weeks.",
          whatHappensIfSkipped: "Insurance may deny parts of your claim or severely underpay. You won't know true cost of recovery or how long it will take. Disorganized documentation delays claims for months.",
          timeframe: "2-3 days",
          estimatedMinutes: 1440,
          sortOrder: 1,
          isActive: true
        },
        {
          strategyId: recovery.id,
          stepId: 'recovery_step_2',
          phase: 'medium_term',
          executionTiming: 'after_crisis',
          title: JSON.stringify({
            en: "Establish Temporary Operations",
            es: "Establecer Operaciones Temporales",
            fr: "Établir des Opérations Temporaires"
          }),
          description: JSON.stringify({
            en: "Set up temporary workspace to maintain revenue during repairs",
            es: "Configure espacio de trabajo temporal para mantener ingresos durante reparaciones",
            fr: "Configurez un espace de travail temporaire pour maintenir les revenus pendant les réparations"
          }),
          smeAction: JSON.stringify({
            en: "Find temporary space if your building is unusable (borrow space, work from home, rent short-term). Notify customers of temporary location/hours via social media, signs, phone message. Move salvaged equipment to temp location. Start serving customers again ASAP - even limited service keeps revenue flowing and customers loyal.",
            es: "Encuentre espacio temporal si su edificio es inutilizable (pida prestado espacio, trabaje desde casa, alquile a corto plazo). Notifique a los clientes de la ubicación/horarios temporales a través de redes sociales, letreros, mensaje telefónico. Mueva el equipo salvado a la ubicación temporal. Comience a atender clientes nuevamente lo antes posible - incluso un servicio limitado mantiene el flujo de ingresos y la lealtad del cliente.",
            fr: "Trouvez un espace temporaire si votre bâtiment est inutilisable (empruntez de l'espace, travaillez à domicile, louez à court terme). Informez les clients de l'emplacement/horaires temporaires via les médias sociaux, les panneaux, le message téléphonique. Déplacez l'équipement sauvé vers l'emplacement temporaire. Recommencez à servir les clients dès que possible - même un service limité maintient les revenus et la fidélité des clients."
          }),
          whyThisStepMatters: "Months without revenue can bankrupt a business even with insurance payout. Customers who find alternatives during closure may never come back. Temporary operations keep your business alive.",
          whatHappensIfSkipped: "You lose ALL revenue for months. Customers go to competitors and may not return. Staff seek other jobs. Business may fail before repairs are complete.",
          timeframe: "1-2 weeks",
          estimatedMinutes: 2400,
          sortOrder: 2,
          isActive: true
        },
        {
          strategyId: recovery.id,
          stepId: 'recovery_step_3',
          phase: 'long_term',
          executionTiming: 'after_crisis',
          title: JSON.stringify({
            en: "Rebuild and Improve",
            es: "Reconstruir y Mejorar",
            fr: "Reconstruire et Améliorer"
          }),
          description: JSON.stringify({
            en: "Restore permanent operations with improvements to prevent future disasters",
            es: "Restaure operaciones permanentes con mejoras para prevenir futuros desastres",
            fr: "Restaurez les opérations permanentes avec des améliorations pour prévenir les catastrophes futures"
          }),
          smeAction: JSON.stringify({
            en: "Work with contractors to rebuild better than before - higher shelves, better drainage, fire-resistant materials, backup power. Update your business continuity plan with lessons learned. Thank staff and customers for their patience. Have a reopening celebration - let everyone know you're back and stronger!",
            es: "Trabaje con contratistas para reconstruir mejor que antes - estantes más altos, mejor drenaje, materiales resistentes al fuego, energía de respaldo. Actualice su plan de continuidad comercial con las lecciones aprendidas. Agradezca al personal y a los clientes por su paciencia. Tenga una celebración de reapertura - ¡hágale saber a todos que está de vuelta y más fuerte!",
            fr: "Travaillez avec des entrepreneurs pour reconstruire mieux qu'avant - étagères plus hautes, meilleur drainage, matériaux ignifuges, alimentation de secours. Mettez à jour votre plan de continuité des affaires avec les leçons apprises. Remerciez le personnel et les clients pour leur patience. Organisez une célébration de réouverture - faites savoir à tous que vous êtes de retour et plus fort!"
          }),
          whyThisStepMatters: "This is your chance to build back better and more resilient. Lessons learned prevent the same disaster from happening again. Celebrating reopening rebuilds customer confidence and community support.",
          whatHappensIfSkipped: "You'll just recreate the same vulnerabilities that caused damage this time. Staff and customers won't feel confident in your recovery. You miss the opportunity to show resilience and strength.",
          timeframe: "1-6 months",
          estimatedMinutes: 9600,
          sortOrder: 3,
          isActive: true
        }
      ]
    })
    console.log('   ✅ Created business_recovery_restoration strategy with 3 action steps')
  }

  console.log('\n' + '='.repeat(70))
  console.log('✅ ALL FIXES COMPLETE')
  console.log('='.repeat(70))
  console.log('\nChanges made:')
  console.log('  • Fixed 2 strategies with invalid "resilience" category')
  console.log('  • Added missing smeAction content for cybersecurity steps')
  console.log('  • Updated hurricane step timing')
  console.log('  • Added recovery steps to fire and flood strategies')
  console.log('  • Created dedicated emergency response strategy (3 steps)')
  console.log('  • Created dedicated business recovery strategy (3 steps)')
  console.log('\nRun audit script again to verify all issues are resolved.')

  await prisma.$disconnect()
}

fixStrategies()
  .then(() => {
    console.log('\n✨ Fix script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error during fix:', error)
    process.exit(1)
  })


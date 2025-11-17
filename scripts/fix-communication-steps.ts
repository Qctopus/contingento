import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ml = (en: string, es: string, fr: string) => JSON.stringify({ en, es, fr })

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   FIX COMMUNICATION STRATEGY STEPS                          ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')
  
  try {
    const strategy = await prisma.riskMitigationStrategy.findFirst({
      where: { strategyId: 'communication_comprehensive' },
      include: {
        actionSteps: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    })
    
    if (!strategy) {
      console.log('Strategy not found')
      await prisma.$disconnect()
      return
    }
    
    console.log(`Fixing steps for: ${strategy.strategyId}\n`)
    
    // Fix step 4 (during phase) - make it about testing during crisis
    const step4 = strategy.actionSteps.find(s => s.stepId === 'comm_during_2')
    if (step4) {
      await prisma.actionStep.update({
        where: { id: step4.id },
        data: {
          title: ml(
            'Activate Emergency Communication During Crisis',
            'Activar Comunicación de Emergencia Durante Crisis',
            'Activer Communication Urgence Pendant Crise'
          ),
          description: ml(
            'When a crisis occurs, immediately activate your communication channels. Send alerts to all staff via WhatsApp, email, and SMS. Use your contact list to reach key personnel and coordinate response.',
            'Cuando ocurre una crisis, active inmediatamente sus canales de comunicación. Envíe alertas a todo el personal vía WhatsApp, correo electrónico y SMS. Use su lista de contactos para contactar personal clave y coordinar respuesta.',
            'Quand crise survient, activez immédiatement vos canaux communication. Envoyez alertes à tout personnel via WhatsApp, email et SMS. Utilisez votre liste contacts pour joindre personnel clé et coordonner réponse.'
          ),
          smeAction: ml(
            'Send a message to your WhatsApp group immediately. Call key staff members. Use your contact list to notify everyone.',
            'Envíe un mensaje a su grupo de WhatsApp inmediatamente. Llame a miembros clave del personal. Use su lista de contactos para notificar a todos.',
            'Envoyez message à votre groupe WhatsApp immédiatement. Appelez membres clés personnel. Utilisez votre liste contacts pour notifier tous.'
          ),
          phase: 'during' // Ensure it's set correctly
        }
      })
      console.log('✓ Updated step 4: comm_during_2')
    }
    
    // Fix step 5 (after phase) - make it about immediate post-crisis communication
    const step5 = strategy.actionSteps.find(s => s.stepId === 'comm_after_1')
    if (step5) {
      await prisma.actionStep.update({
        where: { id: step5.id },
        data: {
          title: ml(
            'Notify Stakeholders After Crisis',
            'Notificar a Interesados Después de Crisis',
            'Notifier Parties Prenantes Après Crise'
          ),
          description: ml(
            'Immediately after a crisis passes, notify all stakeholders including customers, suppliers, and partners about your business status. Provide updates on reopening timeline and any service disruptions.',
            'Inmediatamente después de que pase una crisis, notifique a todos los interesados incluyendo clientes, proveedores y socios sobre el estado de su negocio. Proporcione actualizaciones sobre el cronograma de reapertura y cualquier interrupción del servicio.',
            'Immédiatement après qu\'une crise passe, notifiez toutes parties prenantes incluant clients, fournisseurs et partenaires sur statut entreprise. Fournissez mises à jour sur calendrier réouverture et perturbations service.'
          ),
          smeAction: ml(
            'Send messages to customers letting them know what happened and when you\'ll reopen. Update your social media and website if possible.',
            'Envíe mensajes a clientes informándoles qué pasó y cuándo reabrirá. Actualice sus redes sociales y sitio web si es posible.',
            'Envoyez messages à clients les informant ce qui s\'est passé et quand vous rouvrirez. Mettez à jour réseaux sociaux et site web si possible.'
          ),
          phase: 'after' // Ensure it's set correctly
        }
      })
      console.log('✓ Updated step 5: comm_after_1')
    }
    
    // Fix step 6 (after phase) - keep as maintenance but make it distinct
    const step6 = strategy.actionSteps.find(s => s.stepId === 'comm_after_2')
    if (step6) {
      await prisma.actionStep.update({
        where: { id: step6.id },
        data: {
          title: ml(
            'Review and Update Communication Plan',
            'Revisar y Actualizar Plan de Comunicación',
            'Réviser et Mettre à Jour Plan Communication'
          ),
          description: ml(
            'After the crisis, review what worked and what didn\'t in your communication efforts. Update contact lists, fix any communication gaps, and improve your plan for next time.',
            'Después de la crisis, revise qué funcionó y qué no en sus esfuerzos de comunicación. Actualice listas de contactos, corrija cualquier brecha de comunicación y mejore su plan para la próxima vez.',
            'Après crise, révisez ce qui a fonctionné et ce qui n\'a pas dans vos efforts communication. Mettez à jour listes contacts, corrigez lacunes communication et améliorez votre plan pour prochaine fois.'
          ),
          smeAction: ml(
            'Look back at what happened. Update any contact information that changed. Fix any problems you found.',
            'Revise lo que pasó. Actualice cualquier información de contacto que cambió. Corrija cualquier problema que encontró.',
            'Regardez ce qui s\'est passé. Mettez à jour informations contact changées. Corrigez problèmes trouvés.'
          ),
          phase: 'after' // Ensure it's set correctly
        }
      })
      console.log('✓ Updated step 6: comm_after_2')
    }
    
    // Ensure all phases are correct (before/during/after)
    for (const step of strategy.actionSteps) {
      if (!['before', 'during', 'after'].includes(step.phase)) {
        const phaseMap: Record<string, 'before' | 'during' | 'after'> = {
          'immediate': 'before',
          'short_term': 'before',
          'medium_term': 'during',
          'long_term': 'after'
        }
        const newPhase = phaseMap[step.phase] || 'before'
        
        await prisma.actionStep.update({
          where: { id: step.id },
          data: { phase: newPhase }
        })
        console.log(`✓ Fixed phase for step ${step.stepId}: ${step.phase} → ${newPhase}`)
      }
    }
    
    console.log('\n✅ All communication steps fixed!')
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


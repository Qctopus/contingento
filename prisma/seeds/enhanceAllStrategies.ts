import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to create multilingual JSON
const ml = (en: string, es: string, fr: string) => JSON.stringify({ en, es, fr })

// Helper to create multilingual array
const mlArray = (items: Array<{ en: string; es: string; fr: string }>) => {
  return JSON.stringify({
    en: items.map(i => i.en),
    es: items.map(i => i.es),
    fr: items.map(i => i.fr)
  })
}

// Helper to add cost items to an action step
async function addCostItems(actionStepId: string, itemIds: string[]) {
  await prisma.actionStepItemCost.deleteMany({
    where: { actionStepId }
  })
  
  for (let i = 0; i < itemIds.length; i++) {
    try {
      await prisma.actionStepItemCost.create({
        data: {
          actionStepId,
          itemId: itemIds[i],
          quantity: 1,
          displayOrder: i
        }
      })
    } catch (e) {
      // Item may not exist, skip
    }
  }
}

// Process a single action step
async function enhanceStep(
  stepId: string,
  data: {
    title: ReturnType<typeof ml>
    description: ReturnType<typeof ml>
    smeAction: ReturnType<typeof ml>
    whyThisStepMatters: ReturnType<typeof ml>
    whatHappensIfSkipped: ReturnType<typeof ml>
    resources: ReturnType<typeof mlArray>
    commonMistakesForStep: ReturnType<typeof mlArray>
    freeAlternative?: ReturnType<typeof ml>
    lowTechOption?: ReturnType<typeof ml>
    timeframe: ReturnType<typeof ml>
    estimatedMinutes: number
    difficultyLevel: string
    costItems: string[]
  }
) {
  const step = await prisma.actionStep.findFirst({
    where: { stepId }
  })
  
  if (!step) {
    console.log(`  ⚠️  Step ${stepId} not found`)
    return
  }
  
  await prisma.actionStep.update({
    where: { id: step.id },
    data: {
      title: data.title,
      description: data.description,
      smeAction: data.smeAction,
      whyThisStepMatters: data.whyThisStepMatters,
      whatHappensIfSkipped: data.whatHappensIfSkipped,
      resources: data.resources,
      commonMistakesForStep: data.commonMistakesForStep,
      freeAlternative: data.freeAlternative,
      lowTechOption: data.lowTechOption,
      timeframe: data.timeframe,
      estimatedMinutes: data.estimatedMinutes,
      difficultyLevel: data.difficultyLevel
    }
  })
  
  await addCostItems(step.id, data.costItems)
  console.log(`  ✓ Enhanced: ${stepId}`)
}

async function main() {
  console.log('🚀 Enhancing ALL Strategies with Multilingual Content...\n')
  
  // ============================================================================
  // 1. HURRICANE PROTECTION & RECOVERY
  // ============================================================================
  console.log('🌀 Hurricane Protection & Recovery...')
  
  const hurricane = await prisma.riskMitigationStrategy.findUnique({
    where: { strategyId: 'hurricane_comprehensive' }
  })
  
  if (hurricane) {
    await prisma.riskMitigationStrategy.update({
      where: { id: hurricane.id },
      data: {
        helpfulTips: mlArray([
          { en: 'Start prep 72 hours before expected landfall', es: 'Comience la preparación 72 horas antes del impacto esperado', fr: 'Commencez la préparation 72 heures avant l\'impact prévu' },
          { en: 'Business insurance likely does NOT cover flooding - get separate flood insurance', es: 'El seguro comercial probablemente NO cubre inundaciones - obtenga seguro contra inundaciones por separado', fr: 'L\'assurance entreprise ne couvre probablement PAS les inondations - obtenez une assurance inondation séparée' },
          { en: 'Document EVERYTHING with photos before storm', es: 'Documente TODO con fotos antes de la tormenta', fr: 'Documentez TOUT avec des photos avant la tempête' }
        ]),
        commonMistakes: mlArray([
          { en: 'Waiting until warning to prepare - supplies sell out', es: 'Esperar hasta la advertencia para prepararse - los suministros se agotan', fr: 'Attendre l\'avertissement pour se préparer - les fournitures sont épuisées' },
          { en: 'Leaving electronics on ground floor', es: 'Dejar electrónicos en planta baja', fr: 'Laisser l\'électronique au rez-de-chaussée' }
        ])
      }
    })
    
    await enhanceStep('hurr_before_1', {
      title: ml('Install Hurricane Shutters or Board-Up System', 'Instalar Contraventanas o Sistema de Tablas', 'Installer des Volets Anticycloniques'),
      description: ml('Install permanent hurricane shutters OR prepare plywood system for all windows. Test before season.', 'Instale contraventanas permanentes O prepare sistema de madera contrachapada. Pruebe antes de la temporada.', 'Installez des volets permanents OU préparez un système de contreplaqué. Testez avant la saison.'),
      smeAction: ml('Protect windows from hurricane winds', 'Proteja ventanas de vientos de huracán', 'Protégez les fenêtres des vents d\'ouragan'),
      whyThisStepMatters: ml('Broken windows let rain destroy inventory. One broken window can cause $10,000+ damage.', 'Ventanas rotas permiten que lluvia destruya inventario. Una ventana rota puede causar más de $10,000 en daños.', 'Les fenêtres brisées laissent la pluie détruire l\'inventaire. Une fenêtre peut causer plus de 10 000$ de dégâts.'),
      whatHappensIfSkipped: ml('Flying glass is dangerous and rain floods business. Insurance may not pay.', 'Vidrio volador es peligroso y lluvia inunda negocio. Seguro puede no pagar.', 'Le verre volant est dangereux et la pluie inonde l\'entreprise. L\'assurance peut ne pas payer.'),
      resources: mlArray([
        { en: 'Hurricane shutters OR plywood (3/4" thick)', es: 'Contraventanas O madera contrachapada (3/4")', fr: 'Volets OU contreplaqué (3/4")' },
        { en: 'Drill, saw, measuring tape', es: 'Taladro, sierra, cinta métrica', fr: 'Perceuse, scie, mètre ruban' }
      ]),
      commonMistakesForStep: mlArray([
        { en: 'Waiting until warning - stores sell out', es: 'Esperar hasta advertencia - tiendas se agotan', fr: 'Attendre l\'avertissement - magasins épuisés' },
        { en: 'Using thin plywood - won\'t hold', es: 'Usar madera delgada - no resistirá', fr: 'Utiliser contreplaqué fin - ne tiendra pas' }
      ]),
      freeAlternative: ml('Use heavy plywood, cut to fit, store labeled', 'Use madera pesada, corte a medida, almacene etiquetada', 'Utilisez contreplaqué lourd, coupé sur mesure, stockez étiqueté'),
      timeframe: ml('2-4 weeks before season', '2-4 semanas antes de temporada', '2-4 semaines avant saison'),
      estimatedMinutes: 480,
      difficultyLevel: 'medium',
      costItems: ['hurricane_shutters_aluminum', 'hurricane_shutters_accordion', 'plywood_hurricane_boards', 'installation_service_professional']
    })
    
    await enhanceStep('hurr_before_2', {
      title: ml('Document All Property and Inventory', 'Documentar Propiedad e Inventario', 'Documenter Propriété et Inventaire'),
      description: ml('Take comprehensive photos/video of entire property, equipment, inventory. Upload to cloud immediately.', 'Tome fotos/videos completos de toda propiedad, equipo, inventario. Suba a nube inmediatamente.', 'Prenez photos/vidéos complètes de propriété, équipement, inventaire. Téléchargez sur cloud immédiatement.'),
      smeAction: ml('Photo and video everything you own', 'Fotografíe y grabe todo lo que posee', 'Photographiez et filmez tout ce que vous possédez'),
      whyThisStepMatters: ml('Without proof, insurance pays little. Photos worth thousands.', 'Sin prueba, seguro paga poco. Fotos valen miles.', 'Sans preuve, assurance paie peu. Photos valent des milliers.'),
      whatHappensIfSkipped: ml('Can\'t prove what was damaged. Claims denied/reduced.', 'No puede probar daños. Reclamos denegados/reducidos.', 'Ne peut prouver dommages. Réclamations refusées/réduites.'),
      resources: mlArray([
        { en: 'Smartphone or camera', es: 'Teléfono o cámara', fr: 'Smartphone ou appareil photo' },
        { en: 'Cloud storage (Google Drive, Dropbox)', es: 'Almacenamiento en nube (Google Drive, Dropbox)', fr: 'Stockage cloud (Google Drive, Dropbox)' }
      ]),
      commonMistakesForStep: mlArray([
        { en: 'Taking only few photos - need comprehensive', es: 'Tomar solo pocas fotos - necesita completo', fr: 'Prendre seulement quelques photos - besoin complet' },
        { en: 'Storing only on phone - backup to cloud', es: 'Almacenar solo en teléfono - respalde en nube', fr: 'Stocker uniquement sur téléphone - sauvegardez sur cloud' }
      ]),
      freeAlternative: ml('Use free Google Drive/Dropbox. Video walkthrough with phone.', 'Use Google Drive/Dropbox gratis. Video recorrido con teléfono.', 'Utilisez Google Drive/Dropbox gratuit. Visite vidéo avec téléphone.'),
      timeframe: ml('1-2 hours, before season', '1-2 horas, antes de temporada', '1-2 heures, avant saison'),
      estimatedMinutes: 90,
      difficultyLevel: 'easy',
      costItems: ['cloud_backup_service']
    })
    
    await enhanceStep('hurr_before_3', {
      title: ml('Elevate Inventory and Equipment', 'Elevar Inventario y Equipo', 'Élever Inventaire et Équipement'),
      description: ml('Move inventory, electronics, documents to highest location. Raise 12+ inches off floor. Cover with waterproof material.', 'Mueva inventario, electrónica, documentos a ubicación más alta. Eleve 12+ pulgadas del piso. Cubra con material impermeable.', 'Déplacez inventaire, électronique, documents au plus haut. Élevez 12+ pouces du sol. Couvrez avec matériel imperméable.'),
      smeAction: ml('Move everything valuable up high', 'Mueva todo valioso a altura', 'Déplacez tout ce qui a de la valeur en hauteur'),
      whyThisStepMatters: ml('2 inches of water destroys thousands in inventory. Elevation saves your business.', '2 pulgadas de agua destruyen miles en inventario. Elevación salva su negocio.', '2 pouces d\'eau détruisent des milliers en inventaire. L\'élévation sauve votre entreprise.'),
      whatHappensIfSkipped: ml('Flooding ruins inventory, electronics, documents. Total loss possible.', 'Inundación arruina inventario, electrónica, documentos. Pérdida total posible.', 'L\'inondation ruine inventaire, électronique, documents. Perte totale possible.'),
      resources: mlArray([
        { en: 'Concrete blocks or plastic risers', es: 'Bloques de concreto o elevadores plásticos', fr: 'Blocs béton ou rehausseurs plastique' },
        { en: 'Heavy plastic sheeting or tarps', es: 'Láminas plásticas pesadas o lonas', fr: 'Bâches plastique épaisses' }
      ]),
      commonMistakesForStep: mlArray([
        { en: 'Assuming won\'t flood - elevate anyway', es: 'Asumir no inundará - eleve de todos modos', fr: 'Supposer pas d\'inondation - élevez quand même' },
        { en: 'Using cardboard boxes - dissolve instantly', es: 'Usar cajas de cartón - se disuelven instantáneamente', fr: 'Utiliser boîtes carton - se dissolvent instantanément' }
      ]),
      freeAlternative: ml('Stack on tables, shelves. Use trash bags for waterproofing.', 'Apile en mesas, estantes. Use bolsas de basura para impermeabilizar.', 'Empilez sur tables, étagères. Utilisez sacs poubelle pour imperméabiliser.'),
      timeframe: ml('24-48 hours before storm', '24-48 horas antes de tormenta', '24-48 heures avant tempête'),
      estimatedMinutes: 180,
      difficultyLevel: 'medium',
      costItems: ['sandbags_100pack']
    })
    
    await enhanceStep('hurr_during_1', {
      title: ml('Verify Staff Safety', 'Verificar Seguridad del Personal', 'Vérifier Sécurité du Personnel'),
      description: ml('Contact all staff to confirm safety. Do NOT go to business during storm. Keep written log of contacts.', 'Contacte personal para confirmar seguridad. NO vaya al negocio durante tormenta. Mantenga registro escrito.', 'Contactez personnel pour confirmer sécurité. N\'allez PAS à l\'entreprise pendant tempête. Tenez registre écrit.'),
      smeAction: ml('Check that all employees are safe', 'Verifique que todos los empleados estén seguros', 'Vérifiez que tous les employés sont en sécurité'),
      whyThisStepMatters: ml('Your team is your most important asset. Legal duty to care for them.', 'Su equipo es su activo más importante. Deber legal de cuidarlos.', 'Votre équipe est votre actif le plus important. Devoir légal de les protéger.'),
      whatHappensIfSkipped: ml('Don\'t know if staff are safe. Legal liability if something happens.', 'No sabe si personal está seguro. Responsabilidad legal si algo sucede.', 'Ne savez pas si personnel est en sécurité. Responsabilité légale si quelque chose arrive.'),
      resources: mlArray([
        { en: 'Staff contact list with WhatsApp', es: 'Lista contactos personal con WhatsApp', fr: 'Liste contacts personnel avec WhatsApp' },
        { en: 'Charged phone with backup battery', es: 'Teléfono cargado con batería respaldo', fr: 'Téléphone chargé avec batterie secours' }
      ]),
      commonMistakesForStep: mlArray([
        { en: 'Going to check business - extremely dangerous', es: 'Ir a revisar negocio - extremadamente peligroso', fr: 'Aller vérifier entreprise - extrêmement dangereux' },
        { en: 'Not having emergency contacts', es: 'No tener contactos de emergencia', fr: 'Ne pas avoir contacts d\'urgence' }
      ]),
      freeAlternative: ml('Create free WhatsApp group for all staff', 'Cree grupo WhatsApp gratis para personal', 'Créez groupe WhatsApp gratuit pour personnel'),
      timeframe: ml('During storm, every 6 hours', 'Durante tormenta, cada 6 horas', 'Pendant tempête, toutes les 6 heures'),
      estimatedMinutes: 30,
      difficultyLevel: 'easy',
      costItems: ['satellite_phone', 'two_way_radios_6pack']
    })
    
    await enhanceStep('hurr_during_2', {
      title: ml('Monitor Property Remotely', 'Monitorear Propiedad Remotamente', 'Surveiller Propriété à Distance'),
      description: ml('If cameras with remote access, monitor from shelter. Screenshot damage. DO NOT leave shelter.', 'Si cámaras con acceso remoto, monitoree desde refugio. Capture daños. NO deje refugio.', 'Si caméras avec accès distant, surveillez depuis abri. Capturez dommages. NE quittez PAS abri.'),
      smeAction: ml('Watch security cameras if possible', 'Mire cámaras de seguridad si es posible', 'Regardez caméras de sécurité si possible'),
      whyThisStepMatters: ml('Real-time damage evidence valuable for insurance. Shows when damage occurred.', 'Evidencia de daños en tiempo real valiosa para seguro. Muestra cuándo ocurrió daño.', 'Preuve de dommages en temps réel précieuse pour assurance. Montre quand dommage est survenu.'),
      whatHappensIfSkipped: ml('Miss opportunity for live damage documentation.', 'Pierde oportunidad de documentación de daños en vivo.', 'Manquez opportunité documentation dommages en direct.'),
      resources: mlArray([
        { en: 'Security camera system with cloud recording', es: 'Sistema cámaras con grabación en nube', fr: 'Système caméras avec enregistrement cloud' },
        { en: 'Phone/tablet with camera app', es: 'Teléfono/tableta con app de cámara', fr: 'Téléphone/tablette avec app caméra' }
      ]),
      commonMistakesForStep: mlArray([
        { en: 'Leaving shelter to check - never worth risk', es: 'Dejar refugio para revisar - nunca vale riesgo', fr: 'Quitter abri pour vérifier - ne vaut jamais risque' },
        { en: 'Cameras only recording locally - flood destroys DVR', es: 'Cámaras grabando solo localmente - inundación destruye DVR', fr: 'Caméras enregistrant localement - inondation détruit DVR' }
      ]),
      freeAlternative: ml('Not essential - focus on safety first', 'No esencial - concéntrese en seguridad primero', 'Pas essentiel - concentrez-vous sur sécurité d\'abord'),
      timeframe: ml('During storm, if safe', 'Durante tormenta, si es seguro', 'Pendant tempête, si sécuritaire'),
      estimatedMinutes: 60,
      difficultyLevel: 'easy',
      costItems: ['security_camera_system_4ch', 'ups_battery_backup_1kw']
    })
    
    await enhanceStep('hurr_after_1', {
      title: ml('Initial Safety Assessment', 'Evaluación Inicial de Seguridad', 'Évaluation Initiale de Sécurité'),
      description: ml('After official all-clear, inspect for hazards. Photo ALL damage BEFORE touching anything.', 'Después de visto bueno oficial, inspeccione peligros. Fotografíe TODO daño ANTES de tocar nada.', 'Après feu vert officiel, inspectez dangers. Photographiez TOUS dommages AVANT de toucher.'),
      smeAction: ml('Carefully check property for dangers and damage', 'Revise cuidadosamente propiedad por peligros y daños', 'Vérifiez soigneusement propriété pour dangers et dommages'),
      whyThisStepMatters: ml('First photos are critical for insurance. Can\'t go back in time.', 'Primeras fotos son críticas para seguro. No puede retroceder en tiempo.', 'Premières photos critiques pour assurance. Ne peut revenir en arrière.'),
      whatHappensIfSkipped: ml('Insurance may deny claim without damage documentation.', 'Seguro puede denegar reclamo sin documentación de daños.', 'Assurance peut refuser réclamation sans documentation dommages.'),
      resources: mlArray([
        { en: 'Camera/phone fully charged', es: 'Cámara/teléfono completamente cargado', fr: 'Appareil photo/téléphone chargé' },
        { en: 'Flashlight and batteries', es: 'Linterna y baterías', fr: 'Lampe de poche et piles' },
        { en: 'Safety gear: boots, gloves, hard hat', es: 'Equipo seguridad: botas, guantes, casco', fr: 'Équipement sécurité: bottes, gants, casque' }
      ]),
      commonMistakesForStep: mlArray([
        { en: 'Starting cleanup before photos - insurance denial', es: 'Comenzar limpieza antes de fotos - denegación seguro', fr: 'Commencer nettoyage avant photos - refus assurance' },
        { en: 'Going too early - wait for official all-clear', es: 'Ir demasiado temprano - espere visto bueno oficial', fr: 'Y aller trop tôt - attendez feu vert officiel' }
      ]),
      timeframe: ml('Immediately after all-clear', 'Inmediatamente después de visto bueno', 'Immédiatement après feu vert'),
      estimatedMinutes: 120,
      difficultyLevel: 'medium',
      costItems: ['flashlights_batteries_5pack', 'first_aid_kit_commercial']
    })
    
    await enhanceStep('hurr_after_2', {
      title: ml('File Insurance Claim', 'Presentar Reclamo de Seguro', 'Déposer Réclamation Assurance'),
      description: ml('Contact insurance within 24-48 hours. Submit all photos and documentation. Request adjuster visit.', 'Contacte seguro dentro de 24-48 horas. Envíe todas fotos y documentación. Solicite visita ajustador.', 'Contactez assurance dans 24-48 heures. Soumettez toutes photos et documentation. Demandez visite expert.'),
      smeAction: ml('Call insurance company right away', 'Llame compañía de seguros de inmediato', 'Appelez compagnie d\'assurance tout de suite'),
      whyThisStepMatters: ml('Delays can cause claim denials. Fast filing gets faster payment.', 'Retrasos pueden causar denegaciones. Presentación rápida obtiene pago más rápido.', 'Retards peuvent causer refus. Dépôt rapide obtient paiement plus rapide.'),
      whatHappensIfSkipped: ml('May miss deadline, lose coverage. Payment delayed months.', 'Puede perder plazo, perder cobertura. Pago retrasado meses.', 'Peut manquer délai, perdre couverture. Paiement retardé mois.'),
      resources: mlArray([
        { en: 'Insurance policy with claim number', es: 'Póliza seguro con número reclamo', fr: 'Police assurance avec numéro réclamation' },
        { en: 'All damage photos organized', es: 'Todas fotos daños organizadas', fr: 'Toutes photos dommages organisées' }
      ]),
      commonMistakesForStep: mlArray([
        { en: 'Waiting weeks to file - many policies have limits', es: 'Esperar semanas para presentar - muchas pólizas tienen límites', fr: 'Attendre semaines pour déposer - beaucoup de polices ont limites' },
        { en: 'Accepting first offer - adjusters start low', es: 'Aceptar primera oferta - ajustadores comienzan bajo', fr: 'Accepter première offre - experts commencent bas' }
      ]),
      timeframe: ml('Within 24-48 hours', 'Dentro de 24-48 horas', 'Dans 24-48 heures'),
      estimatedMinutes: 90,
      difficultyLevel: 'medium',
      costItems: []
    })
    
    await enhanceStep('hurr_after_3', {
      title: ml('Begin Cleanup and Restoration', 'Comenzar Limpieza y Restauración', 'Commencer Nettoyage et Restauration'),
      description: ml('Remove standing water immediately. Dispose contaminated items. Dry with fans/dehumidifiers. Make temporary repairs.', 'Elimine agua estancada inmediatamente. Deseche artículos contaminados. Seque con ventiladores/deshumidificadores. Haga reparaciones temporales.', 'Éliminez eau stagnante immédiatement. Jetez articles contaminés. Séchez avec ventilateurs/déshumidificateurs. Faites réparations temporaires.'),
      smeAction: ml('Pump out water, dry everything, start repairs', 'Bombee agua, seque todo, comience reparaciones', 'Pompez eau, séchez tout, commencez réparations'),
      whyThisStepMatters: ml('Mold starts in 24-48 hours. Very expensive to remediate.', 'Moho comienza en 24-48 horas. Muy costoso de remediar.', 'Moisissures commencent en 24-48 heures. Très coûteux à assainir.'),
      whatHappensIfSkipped: ml('Mold spreads, makes property uninhabitable. Could lose building.', 'Moho se propaga, hace propiedad inhabitable. Podría perder edificio.', 'Moisissures se propagent, rendent propriété inhabitable. Pourrait perdre bâtiment.'),
      resources: mlArray([
        { en: 'Submersible pump for water removal', es: 'Bomba sumergible para remover agua', fr: 'Pompe submersible pour retirer eau' },
        { en: 'Fans and dehumidifiers (rent if needed)', es: 'Ventiladores y deshumidificadores (alquile si necesario)', fr: 'Ventilateurs et déshumidificateurs (louez si nécessaire)' },
        { en: 'Safety gear: boots, gloves, masks', es: 'Equipo seguridad: botas, guantes, mascarillas', fr: 'Équipement sécurité: bottes, gants, masques' }
      ]),
      commonMistakesForStep: mlArray([
        { en: 'Waiting for adjuster - mold won\'t wait', es: 'Esperar ajustador - moho no esperará', fr: 'Attendre expert - moisissures n\'attendront pas' },
        { en: 'Not wearing protection - floodwater toxic', es: 'No usar protección - agua inundación tóxica', fr: 'Ne pas porter protection - eau inondation toxique' }
      ]),
      timeframe: ml('Immediately, within 24 hours', 'Inmediatamente, dentro de 24 horas', 'Immédiatement, dans 24 heures'),
      estimatedMinutes: 480,
      difficultyLevel: 'hard',
      costItems: ['submersible_pump', 'generator_3kw_gasoline', 'installation_service_professional']
    })
  }
  
  console.log('\n✅ All strategies enhanced with multilingual content!')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Error:', e)
    prisma.$disconnect()
    process.exit(1)
  })












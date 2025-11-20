import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Add Missing Strategies for Unmatched Risks
 * - Theft/Burglary Protection
 * - Chemical Hazard Protection
 * - Pandemic/Business Interruption (if needed)
 */

async function addMissingStrategies() {
  console.log('➕ Adding Missing Strategies for Unmatched Risks...\n')

  // ============================================================================
  // THEFT/BURGLARY PROTECTION STRATEGY
  // ============================================================================

  console.log('🏠 Adding Theft/Burglary Protection Strategy...')

  await upsertStrategy({
    strategyId: 'theft_protection_comprehensive',
    name: ml(
      'Theft & Burglary Protection',
      'Protección contra Robo y Allanamiento',
      'Protection contre le Vol et le Cambriolage'
    ),
    description: ml(
      'Complete security system to prevent theft, burglary, and unauthorized access to protect inventory, equipment, and cash from criminal activity.',
      'Sistema completo de seguridad para prevenir robo, allanamiento y acceso no autorizado para proteger inventario, equipo y efectivo de actividades criminales.',
      'Système de sécurité complet pour prévenir le vol, le cambriolage et l\'accès non autorisé pour protéger inventaire, équipement et espèces des activités criminelles.'
    ),
    smeTitle: ml(
      'Security: Protect Your Business from Theft',
      'Seguridad: Proteja Su Negocio del Robo',
      'Sécurité: Protégez Votre Entreprise du Vol'
    ),
    smeSummary: ml(
      'Theft and burglary can wipe out your profits overnight. Criminals target small businesses because they know security is often weak. This strategy helps you secure your premises, protect your inventory, and deter thieves with multiple layers of protection.',
      'El robo y allanamiento pueden eliminar sus ganancias de la noche a la mañana. Los criminales apuntan a pequeñas empresas porque saben que la seguridad a menudo es débil. Esta estrategia le ayuda a asegurar sus instalaciones, proteger su inventario y disuadir a los ladrones con múltiples capas de protección.',
      'Le vol et le cambriolage peuvent anéantir vos profits du jour au lendemain. Les criminels ciblent les petites entreprises car ils savent que la sécurité est souvent faible. Cette stratégie vous aide à sécuriser vos locaux, protéger votre inventaire et dissuader les voleurs avec plusieurs couches de protection.'
    ),
    benefitsBullets: mlArray([
      { en: 'Reduce theft losses by 80% with proper security measures', es: 'Reduzca pérdidas por robo en 80% con medidas de seguridad apropiadas', fr: 'Réduisez pertes par vol de 80% avec mesures de sécurité appropriées' },
      { en: 'Lower insurance premiums with proven security systems', es: 'Baje primas de seguro con sistemas de seguridad probados', fr: 'Baissez primes d\'assurance avec systèmes de sécurité prouvés' },
      { en: 'Deter criminals with visible security measures', es: 'Disuada criminales con medidas de seguridad visibles', fr: 'Dissuadez criminels avec mesures de sécurité visibles' },
      { en: 'Quick recovery with documented inventory procedures', es: 'Recuperación rápida con procedimientos de inventario documentados', fr: 'Récupération rapide avec procédures inventaire documentées' }
    ]),
    realWorldExample: ml(
      'A small retail shop in Kingston installed security cameras and reinforced doors after a break-in. The visible security deterred thieves, and when a second attempt was made, the cameras provided evidence that led to the arrest of the suspects.',
      'Una pequeña tienda minorista en Kingston instaló cámaras de seguridad y puertas reforzadas después de un allanamiento. La seguridad visible disuadió a los ladrones, y cuando se hizo un segundo intento, las cámaras proporcionaron evidencia que llevó al arresto de los sospechosos.',
      'Une petite boutique de Kingston a installé caméras de sécurité et portes renforcées après un cambriolage. La sécurité visible a dissuadé les voleurs, et lorsqu\'une deuxième tentative a été faite, les caméras ont fourni des preuves qui ont conduit à l\'arrestation des suspects.'
    ),
    lowBudgetAlternative: ml(
      'Use dummy cameras and security signs instead of real systems. Reinforce doors with deadbolts. Keep inventory locked in secure cabinets.',
      'Use cámaras falsas y letreros de seguridad en lugar de sistemas reales. Refuerce puertas con cerraduras de seguridad. Mantenga inventario cerrado en gabinetes seguros.',
      'Utilisez caméras factices et panneaux de sécurité au lieu de systèmes réels. Renforcez portes avec verrous de sécurité. Gardez inventaire verrouillé dans armoires sécurisées.'
    ),
    selectionTier: 'essential',
    applicableRisks: JSON.stringify(['theft', 'burglary', 'robbery', 'vandalism', 'break_in', 'criminal_activity']),
    applicableBusinessTypes: JSON.stringify(['retail', 'restaurant', 'hospitality', 'professional_services', 'manufacturing']),
    helpfulTips: mlArray([
      { en: 'Install motion-activated lights around the perimeter', es: 'Instale luces activadas por movimiento alrededor del perímetro', fr: 'Installez lumières activées par mouvement autour du périmètre' },
      { en: 'Keep cash and valuables in a secure safe during off-hours', es: 'Mantenga efectivo y objetos de valor en una caja fuerte segura fuera de horas', fr: 'Gardez espèces et objets de valeur dans un coffre-fort sécurisé en dehors des heures' },
      { en: 'Use different door locks and change combinations regularly', es: 'Use cerraduras de puerta diferentes y cambie combinaciones regularmente', fr: 'Utilisez différents verrous de porte et changez combinaisons régulièrement' }
    ]),
    commonMistakes: mlArray([
      { en: 'Leaving valuables visible through windows', es: 'Dejando objetos de valor visibles a través de ventanas', fr: 'Laissant objets de valeur visibles à travers fenêtres' },
      { en: 'Not securing inventory and equipment overnight', es: 'No asegurando inventario y equipo durante la noche', fr: 'Ne pas sécuriser inventaire et équipement pendant la nuit' },
      { en: 'Using the same locks/keys for years', es: 'Usando las mismas cerraduras/llaves por años', fr: 'Utilisant mêmes serrures/clés pendant des années' }
    ]),
    successMetrics: mlArray([
      { en: 'Security cameras cover all entry points and high-value areas', es: 'Cámaras de seguridad cubren todos los puntos de entrada y áreas de alto valor', fr: 'Caméras de sécurité couvrent tous points d\'entrée et zones haute valeur' },
      { en: 'All doors and windows have reinforced locks', es: 'Todas las puertas y ventanas tienen cerraduras reforzadas', fr: 'Toutes portes et fenêtres ont verrous renforcés' },
      { en: 'Daily inventory checks prevent undetected theft', es: 'Verificaciones diarias de inventario previenen robo no detectado', fr: 'Vérifications inventaire quotidiennes préviennent vol non détecté' }
    ])
  })

  // Theft Protection Action Steps
  await upsertActionStep('theft_protection_comprehensive', 'theft_step_01_physical_security', {
    phase: 'before',
    title: ml('Install Physical Security Measures', 'Instale Medidas de Seguridad Física', 'Installez Mesures de Sécurité Physique'),
    description: ml('Reinforce doors, windows, and locks to prevent unauthorized entry and deter burglars.', 'Refuerce puertas, ventanas y cerraduras para prevenir entrada no autorizada y disuadir a los ladrones.', 'Renforcez portes, fenêtres et serrures pour prévenir entrée non autorisée et dissuader cambrioleurs.'),
    smeAction: ml('Install deadbolts, reinforce doors, and use window security bars. Make it hard for thieves to break in.', 'Instale cerraduras de seguridad, refuerce puertas y use barras de seguridad en ventanas. Haga difícil que los ladrones entren.', 'Installez verrous de sécurité, renforcez portes et utilisez barres de sécurité fenêtres. Rendez difficile entrée voleurs.'),
    whyThisStepMatters: ml('Most burglars look for easy targets. Strong physical barriers can prevent 90% of break-ins.', 'La mayoría de los ladrones buscan objetivos fáciles. Barreras físicas fuertes pueden prevenir 90% de allanamientos.', 'La plupart cambrioleurs cherchent cibles faciles. Barrières physiques solides peuvent prévenir 90% cambriolages.'),
    whatHappensIfSkipped: ml('Thieves can easily break in and steal everything overnight.', 'Los ladrones pueden entrar fácilmente y robar todo durante la noche.', 'Voleurs peuvent facilement entrer et voler tout pendant la nuit.'),
    timeframe: ml('1-2 weeks', '1-2 semanas', '1-2 semaines'),
    estimatedMinutes: 600,
    difficultyLevel: 'medium',
    responsibility: ml('Owner/Manager', 'Propietario/Gerente', 'Propriétaire/Gérant'),
    resources: mlArray([
      { en: 'Deadbolts, security bars, reinforced doors', es: 'Cerraduras de seguridad, barras de seguridad, puertas reforzadas', fr: 'Verrous de sécurité, barres de sécurité, portes renforcées' }
    ]),
    checklist: mlArray([
      { en: 'Install deadbolts on all exterior doors', es: 'Instale cerraduras de seguridad en todas las puertas exteriores', fr: 'Installez verrous de sécurité sur toutes portes extérieures' },
      { en: 'Add security bars or films to ground-floor windows', es: 'Agregue barras de seguridad o películas a ventanas del piso inferior', fr: 'Ajoutez barres de sécurité ou films aux fenêtres rez-de-chaussée' },
      { en: 'Reinforce door frames to prevent kicking in', es: 'Refuerce marcos de puertas para prevenir patadas', fr: 'Renforcez cadres portes pour éviter coups de pied' }
    ]),
    howToKnowItsDone: ml('All entry points are secured and require significant force to breach.', 'Todos los puntos de entrada están asegurados y requieren fuerza significativa para violar.', 'Tous points d\'entrée sont sécurisés et nécessitent force significative pour violation.'),
    sortOrder: 1
  }, [])

  await upsertActionStep('theft_protection_comprehensive', 'theft_step_02_surveillance', {
    phase: 'before',
    title: ml('Install Surveillance Systems', 'Instale Sistemas de Vigilancia', 'Installez Systèmes de Surveillance'),
    description: ml('Add cameras, motion sensors, and alarms to detect and deter criminal activity.', 'Agregue cámaras, sensores de movimiento y alarmas para detectar y disuadir actividad criminal.', 'Ajoutez caméras, capteurs mouvement et alarmes pour détecter et dissuader activité criminelle.'),
    smeAction: ml('Install visible cameras at entrances and high-value areas. Connect to a monitoring system or smartphone alerts.', 'Instale cámaras visibles en entradas y áreas de alto valor. Conecte a un sistema de monitoreo o alertas de smartphone.', 'Installez caméras visibles aux entrées et zones haute valeur. Connectez à système surveillance ou alertes smartphone.'),
    whyThisStepMatters: ml('Visible cameras deter 60% of potential burglars. Footage provides evidence for police and insurance.', 'Cámaras visibles disuaden 60% de ladrones potenciales. Las grabaciones proporcionan evidencia para policía y seguro.', 'Caméras visibles dissuadent 60% cambrioleurs potentiels. Images fournissent preuves pour police et assurance.'),
    whatHappensIfSkipped: ml('Crimes go undetected and unpunished, encouraging more theft.', 'Los crímenes pasan desapercibidos y sin castigo, alentando más robo.', 'Crimes passent inaperçus et impunis, encourageant plus vol.'),
    timeframe: ml('1 week', '1 semana', '1 semaine'),
    estimatedMinutes: 300,
    difficultyLevel: 'easy',
    responsibility: ml('Owner/Manager', 'Propietario/Gerente', 'Propriétaire/Gérant'),
    resources: mlArray([
      { en: 'Security cameras, motion sensors, alarm system', es: 'Cámaras de seguridad, sensores de movimiento, sistema de alarma', fr: 'Caméras de sécurité, capteurs mouvement, système alarme' }
    ]),
    checklist: mlArray([
      { en: 'Install cameras covering all entry points', es: 'Instale cámaras cubriendo todos los puntos de entrada', fr: 'Installez caméras couvrant tous points d\'entrée' },
      { en: 'Add motion-activated lights', es: 'Agregue luces activadas por movimiento', fr: 'Ajoutez lumières activées par mouvement' },
      { en: 'Test alarm system and camera recording', es: 'Pruebe sistema de alarma y grabación de cámara', fr: 'Testez système alarme et enregistrement caméra' }
    ]),
    howToKnowItsDone: ml('Cameras are operational and alarms are tested. Footage is accessible and stored securely.', 'Las cámaras están operativas y las alarmas probadas. Las grabaciones son accesibles y almacenadas de forma segura.', 'Caméras opérationnelles et alarmes testées. Images accessibles et stockées sécuritairement.'),
    sortOrder: 2
  }, [])

  await upsertActionStep('theft_protection_comprehensive', 'theft_step_03_inventory_control', {
    phase: 'short_term',
    title: ml('Implement Inventory Control Procedures', 'Implemente Procedimientos de Control de Inventario', 'Implémentez Procédures Contrôle Inventaire'),
    description: ml('Establish daily inventory checks and secure storage to detect theft early and prevent losses.', 'Establezca verificaciones diarias de inventario y almacenamiento seguro para detectar robo temprano y prevenir pérdidas.', 'Établissez vérifications inventaire quotidiennes et stockage sécurisé pour détecter vol tôt et prévenir pertes.'),
    smeAction: ml('Count inventory daily, lock valuables in safes, and track who has access to different areas.', 'Cuente inventario diariamente, cierre objetos de valor en cajas fuertes y rastree quién tiene acceso a diferentes áreas.', 'Comptabilisez inventaire quotidiennement, verrouillez objets valeur dans coffres et suivez qui accès différentes zones.'),
    whyThisStepMatters: ml('Small thefts compound over time. Daily checks catch problems early before they become major losses.', 'Robos pequeños se acumulan con el tiempo. Las verificaciones diarias capturan problemas temprano antes de que se conviertan en pérdidas importantes.', 'Petits vols s\'accumulent temps. Vérifications quotidiennes attrapent problèmes tôt avant devenir pertes majeures.'),
    whatHappensIfSkipped: ml('Employee theft and shrinkage go undetected, costing thousands annually.', 'Robo de empleados y contracción pasan desapercibidos, costando miles anualmente.', 'Vol employés et shrinkage passent inaperçus, coûtant milliers annuellement.'),
    timeframe: ml('Ongoing', 'Continuo', 'Continu'),
    estimatedMinutes: 60,
    difficultyLevel: 'easy',
    responsibility: ml('Owner/Manager with staff', 'Propietario/Gerente con personal', 'Propriétaire/Gérant avec personnel'),
    resources: mlArray([
      { en: 'Inventory sheets, secure storage cabinets, access logs', es: 'Hojas de inventario, gabinetes de almacenamiento seguro, registros de acceso', fr: 'Feuilles inventaire, armoires stockage sécurisé, registres accès' }
    ]),
    checklist: mlArray([
      { en: 'Conduct daily opening and closing inventory counts', es: 'Realice conteos de inventario diarios de apertura y cierre', fr: 'Effectuez comptages inventaire quotidiens ouverture et fermeture' },
      { en: 'Secure cash and valuables in safes overnight', es: 'Asegure efectivo y objetos de valor en cajas fuertes durante la noche', fr: 'Sécurisez espèces et objets valeur dans coffres-fort pendant nuit' },
      { en: 'Limit access to inventory storage areas', es: 'Limite acceso a áreas de almacenamiento de inventario', fr: 'Limitez accès aux zones stockage inventaire' }
    ]),
    howToKnowItsDone: ml('Daily inventory matches sales records. No unexplained discrepancies in stock.', 'El inventario diario coincide con los registros de ventas. No hay discrepancias inexplicables en el stock.', 'Inventaire quotidien correspond registres ventes. Pas de discrepancies inexplicables stock.'),
    sortOrder: 3
  }, [])

  console.log('  ✓ Theft Protection strategy complete with 3 action steps (2 before, 1 short_term)')

  // ============================================================================
  // CHEMICAL HAZARD PROTECTION STRATEGY
  // ============================================================================

  console.log('\n⚠️ Adding Chemical Hazard Protection Strategy...')

  await upsertStrategy({
    strategyId: 'chemical_hazard_protection',
    name: ml(
      'Chemical Hazard Protection & Response',
      'Protección contra Riesgos Químicos y Respuesta',
      'Protection contre Risques Chimiques et Réponse'
    ),
    description: ml(
      'Complete system for handling, storing, and responding to chemical hazards including spills, leaks, and toxic exposures to protect workers, customers, and the environment.',
      'Sistema completo para manejar, almacenar y responder a riesgos químicos incluyendo derrames, fugas y exposiciones tóxicas para proteger trabajadores, clientes y el medio ambiente.',
      'Système complet pour gérer, stocker et répondre aux risques chimiques incluant déversements, fuites et expositions toxiques pour protéger travailleurs, clients et environnement.'
    ),
    smeTitle: ml(
      'Chemical Safety: Handle Hazards Safely',
      'Seguridad Química: Maneje Peligros de Forma Segura',
      'Sécurité Chimique: Gérez Dangers en Sécurité'
    ),
    smeSummary: ml(
      'Chemicals can cause fires, poisoning, and environmental damage. Many businesses use cleaning products, pesticides, or fuel that can be dangerous if mishandled. This strategy helps you store chemicals safely, respond to spills, and protect everyone from chemical hazards.',
      'Los productos químicos pueden causar incendios, envenenamiento y daño ambiental. Muchas empresas usan productos de limpieza, pesticidas o combustible que pueden ser peligrosos si se manipulan mal. Esta estrategia le ayuda a almacenar productos químicos de forma segura, responder a derrames y proteger a todos de peligros químicos.',
      'Les produits chimiques peuvent causer incendios, empoisonnement et dommages environnementaux. Beaucoup entreprises utilisent produits nettoyage, pesticides ou carburant pouvant être dangereux mal manipulés. Cette stratégie aide stocker produits chimiques sécuritairement, répondre déversements et protéger tous dangers chimiques.'
    ),
    benefitsBullets: mlArray([
      { en: 'Prevent chemical accidents that can close your business', es: 'Prevenga accidentes químicos que pueden cerrar su negocio', fr: 'Prévention accidents chimiques pouvant fermer entreprise' },
      { en: 'Avoid expensive cleanup and environmental fines', es: 'Evite costosas limpiezas y multas ambientales', fr: 'Évitez coûteux nettoyages et amendes environnementales' },
      { en: 'Protect employee health and customer safety', es: 'Proteja salud de empleados y seguridad de clientes', fr: 'Protégez santé employés et sécurité clients' },
      { en: 'Comply with chemical storage and handling regulations', es: 'Cumpla con regulaciones de almacenamiento y manejo químico', fr: 'Conformez réglementations stockage et manipulation chimique' }
    ]),
    realWorldExample: ml(
      'A restaurant in Montego Bay had a cleaning chemical spill that created toxic fumes. Because they had spill response training and proper ventilation, they evacuated safely and contained the spill before it caused serious harm or business closure.',
      'Un restaurante en Montego Bay tuvo un derrame de productos químicos de limpieza que creó humos tóxicos. Debido a que tenían capacitación en respuesta a derrames y ventilación apropiada, evacuaron de forma segura y contuvieron el derrame antes de que causara daño grave o cierre del negocio.',
      'Un restaurant à Montego Bay a eu déversement produits chimiques nettoyage créant fumées toxiques. Comme ils avaient formation réponse déversement et ventilation appropriée, ils évacuèrent sécuritairement et contenèrent déversement avant causer dommage grave ou fermeture entreprise.'
    ),
    lowBudgetAlternative: ml(
      'Use spill-absorbing materials like cat litter or sawdust. Store chemicals in clearly labeled containers. Create ventilation with fans instead of expensive systems.',
      'Use materiales absorbentes de derrames como arena para gatos o aserrín. Almacene productos químicos en contenedores claramente etiquetados. Cree ventilación con ventiladores en lugar de sistemas costosos.',
      'Utilisez matériaux absorbants déversement comme litière chat ou sciure. Stockez produits chimiques contenants clairement étiquetés. Créez ventilation ventilateurs au lieu systèmes coûteux.'
    ),
    selectionTier: 'essential',
    applicableRisks: JSON.stringify(['chemical_spill', 'toxic_exposure', 'hazardous_materials', 'environmental_hazard', 'poisoning', 'contamination']),
    applicableBusinessTypes: JSON.stringify(['restaurant', 'hospitality', 'retail', 'manufacturing', 'agriculture']),
    helpfulTips: mlArray([
      { en: 'Store incompatible chemicals separately to prevent reactions', es: 'Almacene productos químicos incompatibles por separado para prevenir reacciones', fr: 'Stockez produits chimiques incompatibles séparément pour éviter réactions' },
      { en: 'Keep Safety Data Sheets (SDS) for all chemicals accessible', es: 'Mantenga Hojas de Datos de Seguridad (SDS) para todos los productos químicos accesibles', fr: 'Gardez Fiches Données Sécurité (SDS) tous produits chimiques accessibles' },
      { en: 'Train staff to recognize chemical hazard signs and symptoms', es: 'Capacite al personal para reconocer signos y síntomas de peligro químico', fr: 'Formez personnel reconnaître signes et symptômes danger chimique' }
    ]),
    commonMistakes: mlArray([
      { en: 'Storing chemicals near food or cleaning supplies', es: 'Almacenando productos químicos cerca de comida o suministros de limpieza', fr: 'Stockant produits chimiques près nourriture ou fournitures nettoyage' },
      { en: 'Using wrong type of extinguisher on chemical fires', es: 'Usando tipo incorrecto de extintor en incendios químicos', fr: 'Utilisant mauvais type extincteur sur feux chimiques' },
      { en: 'Not having spill cleanup materials readily available', es: 'No teniendo materiales de limpieza de derrames fácilmente disponibles', fr: 'Ne pas avoir matériaux nettoyage déversement facilement disponibles' }
    ]),
    successMetrics: mlArray([
      { en: 'All chemicals properly labeled and stored', es: 'Todos los productos químicos correctamente etiquetados y almacenados', fr: 'Tous produits chimiques correctement étiquetés et stockés' },
      { en: 'Spill response materials accessible within 30 seconds', es: 'Materiales de respuesta a derrames accesibles dentro de 30 segundos', fr: 'Matériaux réponse déversement accessibles en 30 secondes' },
      { en: 'Staff trained in chemical hazard recognition and response', es: 'Personal capacitado en reconocimiento y respuesta a peligros químicos', fr: 'Personnel formé reconnaissance et réponse dangers chimiques' }
    ])
  })

  // Chemical Hazard Action Steps
  await upsertActionStep('chemical_hazard_protection', 'chemical_step_01_safe_storage', {
    phase: 'before',
    title: ml('Establish Safe Chemical Storage', 'Establezca Almacenamiento Seguro de Productos Químicos', 'Établissez Stockage Sécurisé Produits Chimiques'),
    description: ml('Create proper storage areas for chemicals, separating incompatible materials and ensuring ventilation.', 'Cree áreas de almacenamiento apropiadas para productos químicos, separando materiales incompatibles y asegurando ventilación.', 'Créez zones stockage appropriées produits chimiques, séparant matériaux incompatibles et assurant ventilation.'),
    smeAction: ml('Designate a secure, well-ventilated area for chemical storage. Keep different types of chemicals separated.', 'Designe un área segura, bien ventilada para almacenamiento químico. Mantenga diferentes tipos de productos químicos separados.', 'Désignez zone sécurisée, bien ventilée stockage chimique. Gardez différents types produits chimiques séparés.'),
    whyThisStepMatters: ml('Improper chemical storage can cause fires, explosions, or toxic releases that harm people and close businesses.', 'Almacenamiento inadecuado de productos químicos puede causar incendios, explosiones o liberaciones tóxicas que dañan personas y cierran negocios.', 'Stockage inadéquat produits chimiques peut causer incendios, explosions ou libérations toxiques blessant gens et fermant entreprises.'),
    whatHappensIfSkipped: ml('Chemical reactions, fires, or leaks cause injuries, environmental damage, and business closure.', 'Reacciones químicas, incendios o fugas causan lesiones, daño ambiental y cierre del negocio.', 'Réactions chimiques, incendios ou fuites causent blessures, dommages environnementaux et fermeture entreprise.'),
    timeframe: ml('1-2 weeks', '1-2 semanas', '1-2 semaines'),
    estimatedMinutes: 480,
    difficultyLevel: 'medium',
    responsibility: ml('Owner/Manager', 'Propietario/Gerente', 'Propriétaire/Gérant'),
    resources: mlArray([
      { en: 'Chemical storage cabinets, ventilation fans, spill pallets', es: 'Gabinetes de almacenamiento químico, ventiladores, pallets para derrames', fr: 'Armoires stockage chimique, ventilateurs, palettes déversement' }
    ]),
    checklist: mlArray([
      { en: 'Designate separate storage for flammable, corrosive, and toxic chemicals', es: 'Designe almacenamiento separado para químicos inflamables, corrosivos y tóxicos', fr: 'Désignez stockage séparé produits chimiques inflammables, corrosifs et toxiques' },
      { en: 'Install proper ventilation and spill containment', es: 'Instale ventilación apropiada y contención de derrames', fr: 'Installez ventilation appropriée et confinement déversement' },
      { en: 'Label all containers with contents and hazard warnings', es: 'Etiquete todos los contenedores con contenido y advertencias de peligro', fr: 'Étiquetez tous contenants contenu et avertissements danger' }
    ]),
    howToKnowItsDone: ml('All chemicals are stored in approved containers in designated areas with proper ventilation.', 'Todos los productos químicos están almacenados en contenedores aprobados en áreas designadas con ventilación apropiada.', 'Tous produits chimiques stockés contenants approuvés zones désignées ventilation appropriée.'),
    sortOrder: 1
  }, [])

  await upsertActionStep('chemical_hazard_protection', 'chemical_step_02_spill_response', {
    phase: 'before',
    title: ml('Prepare Spill Response Equipment', 'Prepare Equipo de Respuesta a Derrames', 'Préparez Équipement Réponse Déversement'),
    description: ml('Assemble spill cleanup kits and train staff in chemical spill response procedures.', 'Reúna kits de limpieza de derrames y capacite al personal en procedimientos de respuesta a derrames químicos.', 'Assemblez trousses nettoyage déversement et formez personnel procédures réponse déversement chimique.'),
    smeAction: ml('Create spill cleanup kits with absorbents, gloves, and neutralizers. Train staff how to respond safely.', 'Cree kits de limpieza de derrames con absorbentes, guantes y neutralizadores. Capacite al personal cómo responder de forma segura.', 'Créez trousses nettoyage déversement absorbants, gants et neutralisants. Formez personnel répondre sécuritairement.'),
    whyThisStepMatters: ml('Quick response to chemical spills prevents injuries, environmental damage, and regulatory fines.', 'Respuesta rápida a derrames químicos previene lesiones, daño ambiental y multas regulatorias.', 'Réponse rapide déversements chimiques empêche blessures, dommages environnementaux et amendes réglementaires.'),
    whatHappensIfSkipped: ml('Spills spread uncontrollably, causing harm and requiring expensive professional cleanup.', 'Los derrames se propagan incontrolablemente, causando daño y requiriendo limpieza profesional costosa.', 'Déversements se propagent incontrolablement, causant dommage et nécessitant nettoyage professionnel coûteux.'),
    timeframe: ml('1 week', '1 semana', '1 semaine'),
    estimatedMinutes: 300,
    difficultyLevel: 'easy',
    responsibility: ml('Owner/Manager with staff', 'Propietario/Gerente con personal', 'Propriétaire/Gérant avec personnel'),
    resources: mlArray([
      { en: 'Spill kits, PPE (gloves, goggles), neutralizing agents', es: 'Kits de derrames, EPP (guantes, goggles), agentes neutralizadores', fr: 'Trousse déversement, EPI (gants, lunettes), agents neutralisants' }
    ]),
    checklist: mlArray([
      { en: 'Assemble spill kits for different chemical types', es: 'Reúna kits de derrames para diferentes tipos químicos', fr: 'Assemblez trousses déversement différents types chimiques' },
      { en: 'Store spill equipment in accessible locations', es: 'Almacene equipo de derrames en ubicaciones accesibles', fr: 'Stockez équipement déversement endroits accessibles' },
      { en: 'Train staff in spill response and first aid', es: 'Capacite al personal en respuesta a derrames y primeros auxilios', fr: 'Formez personnel réponse déversement et premiers soins' }
    ]),
    howToKnowItsDone: ml('Spill kits are assembled and staff can demonstrate proper response procedures.', 'Los kits de derrames están ensamblados y el personal puede demostrar procedimientos de respuesta apropiados.', 'Trousse déversement assemblées et personnel peut démontrer procédures réponse appropriées.'),
    sortOrder: 2
  }, [])

  await upsertActionStep('chemical_hazard_protection', 'chemical_step_03_monitor_usage', {
    phase: 'short_term',
    title: ml('Monitor Chemical Usage & Safety', 'Monitoree Uso de Productos Químicos y Seguridad', 'Surveillez Usage Produits Chimiques et Sécurité'),
    description: ml('Regularly inspect chemical storage, check expiration dates, and review safety procedures.', 'Inspeccione regularmente almacenamiento químico, verifique fechas de expiración y revise procedimientos de seguridad.', 'Inspectez régulièrement stockage chimique, vérifiez dates expiration et revoyez procédures sécurité.'),
    smeAction: ml('Check chemical storage weekly, rotate stock to use oldest first, and review safety procedures monthly.', 'Verifique almacenamiento químico semanalmente, rote stock para usar más antiguo primero y revise procedimientos de seguridad mensualmente.', 'Vérifiez stockage chimique hebdomadairement, tournez stock utiliser plus ancien premier et revoyez procédures sécurité mensuellement.'),
    whyThisStepMatters: ml('Chemical containers degrade over time, and safety procedures need regular reinforcement to prevent accidents.', 'Los contenedores químicos se degradan con el tiempo, y los procedimientos de seguridad necesitan refuerzo regular para prevenir accidentes.', 'Contenants chimiques se dégradent temps, et procédures sécurité nécessitent renforcement régulier prévenir accidents.'),
    whatHappensIfSkipped: ml('Expired or degraded chemicals cause accidents, and staff forget safety procedures.', 'Productos químicos expirados o degradados causan accidentes, y el personal olvida procedimientos de seguridad.', 'Produits chimiques expirés ou dégradés causent accidents, et personnel oublie procédures sécurité.'),
    timeframe: ml('Ongoing', 'Continuo', 'Continu'),
    estimatedMinutes: 60,
    difficultyLevel: 'easy',
    responsibility: ml('Owner/Manager', 'Propietario/Gerente', 'Propriétaire/Gérant'),
    resources: mlArray([
      { en: 'Inspection checklist, expiration date tracker', es: 'Lista de inspección, rastreador de fecha de expiración', fr: 'Liste inspection, traqueur date expiration' }
    ]),
    checklist: mlArray([
      { en: 'Weekly inspection of chemical storage areas', es: 'Inspección semanal de áreas de almacenamiento químico', fr: 'Inspection hebdomadaire zones stockage chimique' },
      { en: 'Check expiration dates and container integrity', es: 'Verifique fechas de expiración e integridad del contenedor', fr: 'Vérifiez dates expiration et intégrité contenant' },
      { en: 'Review and practice spill response procedures', es: 'Revise y practique procedimientos de respuesta a derrames', fr: 'Revoyez et pratiquez procédures réponse déversement' }
    ]),
    howToKnowItsDone: ml('All chemicals are within expiration dates, containers are intact, and procedures are current.', 'Todos los productos químicos están dentro de fechas de expiración, contenedores están intactos y procedimientos están actualizados.', 'Tous produits chimiques dates expiration, contenants intacts et procédures jour.'),
    sortOrder: 3
  }, [])

  console.log('  ✓ Chemical Hazard Protection strategy complete with 3 action steps (2 before, 1 short_term)')

  // ============================================================================
  // UPDATE SUPPLY CHAIN STRATEGY TO INCLUDE PANDEMIC
  // ============================================================================

  console.log('\n🔄 Updating Supply Chain Strategy to include Pandemic...')

  // Update the existing supply chain strategy to include pandemic in applicableRisks
  await prisma.riskMitigationStrategy.update({
    where: { strategyId: 'supply_chain_protection_comprehensive' },
    data: {
      applicableRisks: JSON.stringify(['supply_chain_disruption', 'supplier_failure', 'transportation_delay', 'geopolitical_event', 'pandemic_impact', 'port_closure', 'fuel_shortage'])
    }
  })

  console.log('  ✓ Supply Chain Strategy updated to include pandemic risks')

  console.log('\n✅ All Missing Strategies Added Successfully!')
  console.log(`📊 Added: 2 new comprehensive strategies`)
  console.log(`📊 Updated: 1 existing strategy`)
  console.log(`📊 Total new action steps: 6`)
}

// Helper function for multilingual strings
const ml = (en: string, es: string, fr: string) => JSON.stringify({ en, es, fr })
const mlArray = (items: Array<{ en: string; es: string; fr: string }>) => {
  return JSON.stringify({
    en: items.map(i => i.en),
    es: items.map(i => i.es),
    fr: items.map(i => i.fr)
  })
}

// Helper function to upsert strategies (copied from main file)
async function upsertStrategy(data: any) {
  const strategy = await prisma.riskMitigationStrategy.upsert({
    where: { strategyId: data.strategyId },
    update: {
      name: data.name,
      description: data.description,
      smeTitle: data.smeTitle,
      smeSummary: data.smeSummary,
      benefitsBullets: data.benefitsBullets,
      realWorldExample: data.realWorldExample,
      lowBudgetAlternative: data.lowBudgetAlternative,
      selectionTier: data.selectionTier || 'recommended',
      applicableRisks: data.applicableRisks || JSON.stringify([]),
      applicableBusinessTypes: data.applicableBusinessTypes,
      helpfulTips: data.helpfulTips,
      commonMistakes: data.commonMistakes,
      successMetrics: data.successMetrics,
    },
    create: {
      strategyId: data.strategyId,
      name: data.name,
      description: data.description,
      smeTitle: data.smeTitle,
      smeSummary: data.smeSummary,
      benefitsBullets: data.benefitsBullets,
      realWorldExample: data.realWorldExample,
      lowBudgetAlternative: data.lowBudgetAlternative,
      selectionTier: data.selectionTier || 'recommended',
      applicableRisks: data.applicableRisks || JSON.stringify([]),
      applicableBusinessTypes: data.applicableBusinessTypes,
      helpfulTips: data.helpfulTips,
      commonMistakes: data.commonMistakes,
      successMetrics: data.successMetrics,
      isActive: true
    }
  })

  console.log(`  ✓ Strategy: ${data.strategyId}`)
  return strategy
}

// Helper function to upsert action steps
async function upsertActionStep(strategyId: string, stepId: string, data: any, costItems: string[] = []) {
  const strategy = await prisma.riskMitigationStrategy.findUnique({
    where: { strategyId }
  })

  if (!strategy) {
    console.log(`    ⚠️  Strategy ${strategyId} not found, skipping step`)
    return null
  }

  const step = await prisma.actionStep.upsert({
    where: {
      strategyId_stepId: {
        strategyId: strategy.id,
        stepId
      }
    },
    update: data,
    create: {
      ...data,
      stepId,
      strategyId: strategy.id,
      isActive: true
    }
  })

  // Link cost items if provided
  if (costItems.length > 0) {
    // Clear existing associations
    await prisma.actionStepItemCost.deleteMany({
      where: { actionStepId: step.id }
    })

    // Add new associations
    for (let i = 0; i < costItems.length; i++) {
      try {
        await prisma.actionStepItemCost.create({
          data: {
            actionStepId: step.id,
            itemId: costItems[i],
            quantity: 1,
            displayOrder: i
          }
        })
        console.log(`    ✓ Linked cost item: ${costItems[i]}`)
      } catch (e) {
        console.log(`    ⚠️  Cost item not found: ${costItems[i]}`)
      }
    }
  }

  console.log(`    ✓ Step: ${stepId}`)
  return step
}

async function main() {
  try {
    await addMissingStrategies()
  } catch (error) {
    console.error('❌ Error adding missing strategies:', error)
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



import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Premium Action Steps for Caribbean BCP Strategies
 * - Comprehensive BEFORE/DURING/AFTER coverage
 * - Realistic time estimates and costs
 * - Full multilingual support (EN, ES, FR)
 * - Practical, specific guidance
 */

const PREMIUM_ACTION_STEPS = [
  // ============================================================================
  // HURRICANE COMPREHENSIVE PROTECTION - Action Steps
  // ============================================================================
  {
    strategyId: 'hurricane_comprehensive',
    stepId: 'hurricane_comp_before_1',
    phase: 'before',
    executionTiming: 'before_crisis',
    sortOrder: 1,
    title: JSON.stringify({
      en: 'Install Hurricane Shutters or Board-Up System',
      es: 'Instalar Contraventanas o Sistema de Tablas',
      fr: 'Installer Volets Ouragan ou Système de Planches'
    }),
    description: JSON.stringify({
      en: 'Install permanent hurricane shutters OR prepare plywood board-up system for all windows and glass doors. Measure, cut, label each piece, store with mounting hardware.',
      es: 'Instalar contraventanas permanentes O preparar sistema de tablas de madera contrachapada para todas las ventanas y puertas de vidrio. Medir, cortar, etiquetar cada pieza, almacenar con herrajes de montaje.',
      fr: 'Installer volets ouragan permanents OU préparer système de planches contreplaqué pour toutes fenêtres et portes vitrées. Mesurer, couper, étiqueter chaque pièce, stocker avec quincaillerie de montage.'
    }),
    estimatedMinutes: 480,
    estimatedCost: '$400 USD',
    resources: JSON.stringify([
      { en: 'Hurricane shutters OR 3/4" marine plywood', es: 'Contraventanas O madera contrachapada marina 3/4"', fr: 'Volets ouragan OU contreplaqué marine 3/4"' },
      { en: 'Measuring tape, saw, drill', es: 'Cinta métrica, sierra, taladro', fr: 'Mètre ruban, scie, perceuse' },
      { en: 'Mounting hardware (bolts/anchors)', es: 'Herrajes de montaje (pernos/anclajes)', fr: 'Quincaillerie montage (boulons/ancrages)' },
      { en: 'Waterproof marker for labeling', es: 'Marcador impermeable para etiquetar', fr: 'Marqueur imperméable pour étiquetage' }
    ]),
    howToKnowItsDone: JSON.stringify({
      en: 'All windows/doors covered, shutters roll smoothly OR plywood pieces cut, labeled, hardware ready',
      es: 'Todas ventanas/puertas cubiertas, contraventanas ruedan suavemente O piezas de madera cortadas, etiquetadas, herrajes listos',
      fr: 'Toutes fenêtres/portes couvertes, volets roulent facilement OU pièces contreplaqué coupées, étiquetées, quincaillerie prête'
    }),
    exampleOutput: 'Photos of installed shutters or labeled plywood system with storage location',
    responsibility: 'Owner or Maintenance Manager'
  },
  {
    strategyId: 'hurricane_comprehensive',
    phase: 'before',
    sortOrder: 2,
    title: JSON.stringify({
      en: 'Document All Property and Inventory',
      es: 'Documentar Toda Propiedad e Inventario',
      fr: 'Documenter Tous Biens et Stocks'
    }),
    description: JSON.stringify({
      en: 'Take comprehensive photos and video of entire property, all equipment, and full inventory. Include serial numbers, receipts, and value estimates. Upload to cloud storage.',
      es: 'Tomar fotos y video completos de toda la propiedad, todo el equipo y el inventario completo. Incluir números de serie, recibos y estimaciones de valor. Subir a almacenamiento en la nube.',
      fr: 'Prendre photos et vidéo complètes de toute propriété, tout équipement et stocks complets. Inclure numéros de série, reçus et estimations de valeur. Téléverser vers stockage cloud.'
    }),
    estimatedMinutes: 180,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Smartphone or camera', es: 'Teléfono inteligente o cámara', fr: 'Smartphone ou appareil photo' },
      { en: 'Free cloud storage (Google Drive, Dropbox)', es: 'Almacenamiento en nube gratuito (Google Drive, Dropbox)', fr: 'Stockage cloud gratuit (Google Drive, Dropbox)' },
      { en: 'Inventory list or spreadsheet', es: 'Lista de inventario u hoja de cálculo', fr: 'Liste inventaire ou feuille de calcul' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Complete photo/video documentation uploaded to cloud, accessible from any device',
      es: 'Documentación completa de fotos/video subida a la nube, accesible desde cualquier dispositivo',
      fr: 'Documentation complète photos/vidéo téléversée vers cloud, accessible depuis tout appareil'
    }),
    documentationRequired: 'Confirmation email from cloud storage with uploaded files',
    responsibleRole: 'Owner or Manager'
  },
  {
    strategyId: 'hurricane_comprehensive',
    phase: 'before',
    sortOrder: 3,
    title: JSON.stringify({
      en: 'Elevate Inventory and Critical Equipment',
      es: 'Elevar Inventario y Equipo Crítico',
      fr: 'Élever Stocks et Équipement Critique'
    }),
    description: JSON.stringify({
      en: 'Move all inventory, electronics, and important documents to highest possible location. Use concrete blocks and shelving to raise items 12+ inches above floor. Focus on highest-value items first.',
      es: 'Mover todo inventario, electrónica y documentos importantes a la ubicación más alta posible. Usar bloques de concreto y estanterías para elevar artículos 12+ pulgadas sobre el piso. Enfocarse primero en artículos de mayor valor.',
      fr: 'Déplacer tous stocks, électronique et documents importants vers emplacement le plus élevé possible. Utiliser blocs béton et étagères pour élever articles 30+ cm au-dessus sol. Se concentrer d\'abord sur articles de plus grande valeur.'
    }),
    estimatedMinutes: 240,
    estimatedCostUSD: 100,
    requiredResources: JSON.stringify([
      { en: 'Concrete blocks or plastic risers', es: 'Bloques de concreto o elevadores de plástico', fr: 'Blocs béton ou rehausseurs plastique' },
      { en: 'Plastic sheeting or tarps', es: 'Láminas de plástico o lonas', fr: 'Bâches plastique ou toiles' },
      { en: 'Waterproof containers for documents', es: 'Contenedores impermeables para documentos', fr: 'Conteneurs étanches pour documents' },
      { en: 'Staff to help move items', es: 'Personal para ayudar a mover artículos', fr: 'Personnel pour aider à déplacer articles' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'All inventory elevated 12+ inches, critical items highest, electronics protected with plastic sheeting',
      es: 'Todo inventario elevado 12+ pulgadas, artículos críticos más arriba, electrónica protegida con láminas de plástico',
      fr: 'Tous stocks élevés 30+ cm, articles critiques en haut, électronique protégée avec bâches plastique'
    }),
    documentationRequired: 'Photos showing elevated inventory and protected equipment',
    responsibleRole: 'All Staff (coordinated by Manager)'
  },
  {
    strategyId: 'hurricane_comprehensive',
    phase: 'during',
    sortOrder: 4,
    title: JSON.stringify({
      en: 'Verify Staff Safety and Whereabouts',
      es: 'Verificar Seguridad y Paradero del Personal',
      fr: 'Vérifier Sécurité et Localisation du Personnel'
    }),
    description: JSON.stringify({
      en: 'Contact all staff via WhatsApp, phone, or text to confirm they are safe and sheltered. Document who checked in, who needs assistance. Do NOT go to business during storm.',
      es: 'Contactar a todo el personal vía WhatsApp, teléfono o mensaje de texto para confirmar que están seguros y refugiados. Documentar quién se registró, quién necesita asistencia. NO ir al negocio durante la tormenta.',
      fr: 'Contacter tout personnel via WhatsApp, téléphone ou texto pour confirmer qu\'ils sont en sécurité et abrités. Documenter qui s\'est signalé, qui a besoin d\'aide. NE PAS aller au commerce pendant tempête.'
    }),
    estimatedMinutes: 60,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Staff contact list (printed copy)', es: 'Lista de contactos del personal (copia impresa)', fr: 'Liste contacts personnel (copie imprimée)' },
      { en: 'Phone with WhatsApp', es: 'Teléfono con WhatsApp', fr: 'Téléphone avec WhatsApp' },
      { en: 'Backup battery/power bank', es: 'Batería de respaldo/power bank', fr: 'Batterie secours/power bank' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'All staff accounted for, safety status documented',
      es: 'Todo personal contabilizado, estado de seguridad documentado',
      fr: 'Tout personnel recensé, statut sécurité documenté'
    }),
    documentationRequired: 'Staff safety checklist with check-in times',
    responsibleRole: 'Owner or Manager'
  },
  {
    strategyId: 'hurricane_comprehensive',
    phase: 'during',
    sortOrder: 5,
    title: JSON.stringify({
      en: 'Monitor Property Remotely If Safe',
      es: 'Monitorear Propiedad Remotamente Si Es Seguro',
      fr: 'Surveiller Propriété à Distance Si Sécuritaire'
    }),
    description: JSON.stringify({
      en: 'If you have security cameras with remote access, monitor property status. Take screenshots of any damage in progress. Do NOT leave shelter to check on business.',
      es: 'Si tiene cámaras de seguridad con acceso remoto, monitorear estado de propiedad. Tomar capturas de pantalla de cualquier daño en progreso. NO salir del refugio para verificar el negocio.',
      fr: 'Si vous avez caméras sécurité avec accès distant, surveiller état propriété. Prendre captures d\'écran de tout dommage en cours. NE PAS quitter abri pour vérifier commerce.'
    }),
    estimatedMinutes: 30,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Security camera system with app', es: 'Sistema de cámaras de seguridad con aplicación', fr: 'Système caméras sécurité avec application' },
      { en: 'Phone or tablet', es: 'Teléfono o tableta', fr: 'Téléphone ou tablette' },
      { en: 'Internet connection (if available)', es: 'Conexión a internet (si está disponible)', fr: 'Connexion internet (si disponible)' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Property status checked remotely, screenshots saved for insurance if damage observed',
      es: 'Estado de propiedad verificado remotamente, capturas guardadas para seguro si se observa daño',
      fr: 'État propriété vérifié à distance, captures sauvegardées pour assurance si dommages observés'
    }),
    documentationRequired: 'Screenshots or notes on property condition during storm',
    responsibleRole: 'Owner'
  },
  {
    strategyId: 'hurricane_comprehensive',
    phase: 'after',
    sortOrder: 6,
    title: JSON.stringify({
      en: 'Conduct Initial Safety Assessment',
      es: 'Realizar Evaluación Inicial de Seguridad',
      fr: 'Effectuer Évaluation Sécurité Initiale'
    }),
    description: JSON.stringify({
      en: 'After all-clear from authorities, inspect property for structural damage, downed power lines, gas leaks, flooding. Take extensive photos BEFORE cleanup. Document every damaged item.',
      es: 'Después del visto bueno de las autoridades, inspeccionar propiedad en busca de daños estructurales, cables eléctricos caídos, fugas de gas, inundaciones. Tomar fotos extensivas ANTES de limpiar. Documentar cada artículo dañado.',
      fr: 'Après autorisation des autorités, inspecter propriété pour dommages structurels, lignes électriques tombées, fuites gaz, inondations. Prendre photos extensives AVANT nettoyage. Documenter chaque article endommagé.'
    }),
    estimatedMinutes: 120,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Smartphone or camera', es: 'Teléfono inteligente o cámara', fr: 'Smartphone ou appareil photo' },
      { en: 'Flashlight (power likely out)', es: 'Linterna (energía probablemente fuera)', fr: 'Lampe torche (électricité probablement coupée)' },
      { en: 'Safety gear (boots, gloves)', es: 'Equipo de seguridad (botas, guantes)', fr: 'Équipement sécurité (bottes, gants)' },
      { en: 'Notepad for damage list', es: 'Libreta para lista de daños', fr: 'Bloc-notes pour liste dommages' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Complete photo documentation of all damage, no safety hazards identified or addressed',
      es: 'Documentación fotográfica completa de todo daño, ningún peligro de seguridad identificado o abordado',
      fr: 'Documentation photographique complète de tous dommages, aucun danger sécurité identifié ou traité'
    }),
    documentationRequired: 'Comprehensive damage photos and written damage inventory',
    responsibleRole: 'Owner and Senior Manager'
  },
  {
    strategyId: 'hurricane_comprehensive',
    phase: 'after',
    sortOrder: 7,
    title: JSON.stringify({
      en: 'File Insurance Claim Immediately',
      es: 'Presentar Reclamo de Seguro Inmediatamente',
      fr: 'Déposer Réclamation Assurance Immédiatement'
    }),
    description: JSON.stringify({
      en: 'Contact insurance company within 24-48 hours. Submit photos, damage inventory, and pre-storm documentation. Request adjuster visit. Get claim number and timeline.',
      es: 'Contactar compañía de seguros dentro de 24-48 horas. Enviar fotos, inventario de daños y documentación pre-tormenta. Solicitar visita de ajustador. Obtener número de reclamo y cronograma.',
      fr: 'Contacter compagnie assurance dans 24-48 heures. Soumettre photos, inventaire dommages et documentation pré-tempête. Demander visite d\'expert. Obtenir numéro réclamation et échéancier.'
    }),
    estimatedMinutes: 120,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Insurance policy documents', es: 'Documentos de póliza de seguro', fr: 'Documents police assurance' },
      { en: 'All damage photos and inventory', es: 'Todas las fotos e inventario de daños', fr: 'Toutes photos et inventaire dommages' },
      { en: 'Pre-storm documentation', es: 'Documentación pre-tormenta', fr: 'Documentation pré-tempête' },
      { en: 'Phone and email', es: 'Teléfono y correo electrónico', fr: 'Téléphone et courriel' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Insurance claim filed, claim number received, adjuster visit scheduled',
      es: 'Reclamo de seguro presentado, número de reclamo recibido, visita de ajustador programada',
      fr: 'Réclamation assurance déposée, numéro réclamation reçu, visite expert planifiée'
    }),
    documentationRequired: 'Insurance claim number and submission confirmation',
    responsibleRole: 'Owner'
  },
  {
    strategyId: 'hurricane_comprehensive',
    phase: 'after',
    sortOrder: 8,
    title: JSON.stringify({
      en: 'Begin Cleanup and Restoration',
      es: 'Iniciar Limpieza y Restauración',
      fr: 'Commencer Nettoyage et Restauration'
    }),
    description: JSON.stringify({
      en: 'Remove water, debris, damaged inventory. Dry out building to prevent mold. Make temporary repairs to prevent further damage. Coordinate with contractors for major repairs.',
      es: 'Quitar agua, escombros, inventario dañado. Secar edificio para prevenir moho. Hacer reparaciones temporales para prevenir más daños. Coordinar con contratistas para reparaciones mayores.',
      fr: 'Enlever eau, débris, stocks endommagés. Sécher bâtiment pour prévenir moisissures. Effectuer réparations temporaires pour prévenir dommages supplémentaires. Coordonner avec entrepreneurs pour réparations majeures.'
    }),
    estimatedMinutes: 960,
    estimatedCostUSD: 300,
    requiredResources: JSON.stringify([
      { en: 'Cleaning supplies, mops, buckets', es: 'Suministros de limpieza, trapeadores, cubos', fr: 'Fournitures nettoyage, vadrouilles, seaux' },
      { en: 'Dehumidifiers and fans', es: 'Deshumidificadores y ventiladores', fr: 'Déshumidificateurs et ventilateurs' },
      { en: 'Temporary repair materials', es: 'Materiales de reparación temporal', fr: 'Matériaux réparation temporaire' },
      { en: 'All available staff', es: 'Todo el personal disponible', fr: 'Tout personnel disponible' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Property cleaned, dried, and secured against further damage',
      es: 'Propiedad limpia, seca y asegurada contra más daños',
      fr: 'Propriété nettoyée, séchée et sécurisée contre dommages supplémentaires'
    }),
    documentationRequired: 'Photos of completed cleanup and temporary repairs',
    responsibleRole: 'All Staff (coordinated by Manager)'
  },
  {
    strategyId: 'hurricane_comprehensive',
    phase: 'after',
    sortOrder: 9,
    title: JSON.stringify({
      en: 'Communicate Reopening Plans to Customers',
      es: 'Comunicar Planes de Reapertura a Clientes',
      fr: 'Communiquer Plans Réouverture aux Clients'
    }),
    description: JSON.stringify({
      en: 'Use social media, WhatsApp, phone calls to inform customers when you will reopen. Post daily updates even if still closed. Build anticipation for reopening.',
      es: 'Usar redes sociales, WhatsApp, llamadas telefónicas para informar clientes cuándo reabrirá. Publicar actualizaciones diarias incluso si aún está cerrado. Crear anticipación para reapertura.',
      fr: 'Utiliser réseaux sociaux, WhatsApp, appels téléphoniques pour informer clients quand vous rouvrirez. Publier mises à jour quotidiennes même si encore fermé. Créer anticipation pour réouverture.'
    }),
    estimatedMinutes: 30,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Social media access', es: 'Acceso a redes sociales', fr: 'Accès réseaux sociaux' },
      { en: 'Customer contact list', es: 'Lista de contactos de clientes', fr: 'Liste contacts clients' },
      { en: 'Phone', es: 'Teléfono', fr: 'Téléphone' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Reopening announcement posted on all channels, key customers contacted directly',
      es: 'Anuncio de reapertura publicado en todos los canales, clientes clave contactados directamente',
      fr: 'Annonce réouverture publiée sur tous canaux, clients clés contactés directement'
    }),
    documentationRequired: 'Screenshots of social media posts and key customer confirmations',
    responsibleRole: 'Owner or Manager'
  },

  // ============================================================================
  // DATA PROTECTION - Action Steps
  // ============================================================================
  {
    strategyId: 'data_protection_comprehensive',
    phase: 'before',
    sortOrder: 1,
    title: JSON.stringify({
      en: 'Set Up Cloud Backup System',
      es: 'Configurar Sistema de Respaldo en la Nube',
      fr: 'Configurer Système Sauvegarde Cloud'
    }),
    description: JSON.stringify({
      en: 'Choose cloud backup service (Google Drive, Dropbox, OneDrive). Create account, install software, configure automatic daily backups of all business files.',
      es: 'Elegir servicio de respaldo en la nube (Google Drive, Dropbox, OneDrive). Crear cuenta, instalar software, configurar respaldos automáticos diarios de todos los archivos comerciales.',
      fr: 'Choisir service sauvegarde cloud (Google Drive, Dropbox, OneDrive). Créer compte, installer logiciel, configurer sauvegardes automatiques quotidiennes de tous fichiers commerciaux.'
    }),
    estimatedMinutes: 90,
    estimatedCostUSD: 15,
    requiredResources: JSON.stringify([
      { en: 'Computer with internet', es: 'Computadora con internet', fr: 'Ordinateur avec internet' },
      { en: 'Cloud storage subscription', es: 'Suscripción de almacenamiento en la nube', fr: 'Abonnement stockage cloud' },
      { en: 'Credit card for payment', es: 'Tarjeta de crédito para pago', fr: 'Carte crédit pour paiement' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Cloud backup active, automatic sync enabled, test file uploaded and verified',
      es: 'Respaldo en la nube activo, sincronización automática habilitada, archivo de prueba subido y verificado',
      fr: 'Sauvegarde cloud active, synchronisation automatique activée, fichier test téléversé et vérifié'
    }),
    documentationRequired: 'Screenshot of successful backup configuration',
    responsibleRole: 'Owner or IT Staff'
  },
  {
    strategyId: 'data_protection_comprehensive',
    phase: 'before',
    sortOrder: 2,
    title: JSON.stringify({
      en: 'Create Comprehensive Business File Inventory',
      es: 'Crear Inventario Completo de Archivos Comerciales',
      fr: 'Créer Inventaire Complet Fichiers Commerciaux'
    }),
    description: JSON.stringify({
      en: 'List all critical files: customer database, financial records, inventory lists, supplier contracts, employee records. Identify where each is stored.',
      es: 'Listar todos los archivos críticos: base de datos de clientes, registros financieros, listas de inventario, contratos de proveedores, registros de empleados. Identificar dónde se almacena cada uno.',
      fr: 'Lister tous fichiers critiques: base données clients, registres financiers, listes stocks, contrats fournisseurs, dossiers employés. Identifier où chacun est stocké.'
    }),
    estimatedMinutes: 120,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Spreadsheet software', es: 'Software de hoja de cálculo', fr: 'Logiciel tableur' },
      { en: 'Access to all business systems', es: 'Acceso a todos los sistemas comerciales', fr: 'Accès à tous systèmes commerciaux' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Complete inventory of all critical business files and their locations',
      es: 'Inventario completo de todos los archivos comerciales críticos y sus ubicaciones',
      fr: 'Inventaire complet de tous fichiers commerciaux critiques et leurs emplacements'
    }),
    documentationRequired: 'Business file inventory spreadsheet',
    responsibleRole: 'Owner or Manager'
  },
  {
    strategyId: 'data_protection_comprehensive',
    phase: 'before',
    sortOrder: 3,
    title: JSON.stringify({
      en: 'Backup Point-of-Sale System',
      es: 'Respaldar Sistema Punto de Venta',
      fr: 'Sauvegarder Système Point de Vente'
    }),
    description: JSON.stringify({
      en: 'Export POS database including products, prices, customer accounts, sales history. Save to external drive and upload to cloud. Test restoration on backup device.',
      es: 'Exportar base de datos POS incluyendo productos, precios, cuentas de clientes, historial de ventas. Guardar en unidad externa y subir a la nube. Probar restauración en dispositivo de respaldo.',
      fr: 'Exporter base données PDV incluant produits, tarifs, comptes clients, historique ventes. Sauvegarder sur disque externe et téléverser vers cloud. Tester restauration sur appareil secours.'
    }),
    estimatedMinutes: 60,
    estimatedCostUSD: 50,
    requiredResources: JSON.stringify([
      { en: 'External hard drive or USB', es: 'Disco duro externo o USB', fr: 'Disque dur externe ou USB' },
      { en: 'POS system access', es: 'Acceso al sistema POS', fr: 'Accès système PDV' },
      { en: 'Cloud storage', es: 'Almacenamiento en la nube', fr: 'Stockage cloud' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'POS database backed up, stored in 2 locations (external drive + cloud), restoration tested',
      es: 'Base de datos POS respaldada, almacenada en 2 ubicaciones (unidad externa + nube), restauración probada',
      fr: 'Base données PDV sauvegardée, stockée en 2 emplacements (disque externe + cloud), restauration testée'
    }),
    documentationRequired: 'POS backup verification and test restoration log',
    responsibleRole: 'Owner or IT Staff'
  },
  {
    strategyId: 'data_protection_comprehensive',
    phase: 'during',
    sortOrder: 4,
    title: JSON.stringify({
      en: 'Verify Backup Systems Are Running',
      es: 'Verificar que Sistemas de Respaldo Estén Funcionando',
      fr: 'Vérifier que Systèmes Sauvegarde Fonctionnent'
    }),
    description: JSON.stringify({
      en: 'Check cloud backup status remotely. Verify all systems synced before disaster. Confirm data is accessible from any device.',
      es: 'Verificar estado de respaldo en la nube remotamente. Verificar que todos los sistemas se sincronizaron antes del desastre. Confirmar que los datos son accesibles desde cualquier dispositivo.',
      fr: 'Vérifier état sauvegarde cloud à distance. Vérifier que tous systèmes synchronisés avant catastrophe. Confirmer que données accessibles depuis tout appareil.'
    }),
    estimatedMinutes: 15,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Phone or computer', es: 'Teléfono o computadora', fr: 'Téléphone ou ordinateur' },
      { en: 'Internet connection', es: 'Conexión a internet', fr: 'Connexion internet' },
      { en: 'Cloud storage credentials', es: 'Credenciales de almacenamiento en la nube', fr: 'Identifiants stockage cloud' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Backup status verified, data accessible remotely',
      es: 'Estado de respaldo verificado, datos accesibles remotamente',
      fr: 'État sauvegarde vérifié, données accessibles à distance'
    }),
    documentationRequired: 'Backup status screenshot',
    responsibleRole: 'Owner'
  },
  {
    strategyId: 'data_protection_comprehensive',
    phase: 'after',
    sortOrder: 5,
    title: JSON.stringify({
      en: 'Assess Data Loss and Recovery Needs',
      es: 'Evaluar Pérdida de Datos y Necesidades de Recuperación',
      fr: 'Évaluer Perte Données et Besoins Récupération'
    }),
    description: JSON.stringify({
      en: 'Determine what data was lost (computers destroyed, files corrupted). Identify what needs to be restored from backup.',
      es: 'Determinar qué datos se perdieron (computadoras destruidas, archivos corruptos). Identificar qué necesita ser restaurado del respaldo.',
      fr: 'Déterminer quelles données perdues (ordinateurs détruits, fichiers corrompus). Identifier ce qui doit être restauré depuis sauvegarde.'
    }),
    estimatedMinutes: 60,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Access to damaged equipment', es: 'Acceso a equipo dañado', fr: 'Accès équipement endommagé' },
      { en: 'Business file inventory', es: 'Inventario de archivos comerciales', fr: 'Inventaire fichiers commerciaux' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Complete assessment of data loss, recovery priority list created',
      es: 'Evaluación completa de pérdida de datos, lista de prioridad de recuperación creada',
      fr: 'Évaluation complète perte données, liste priorité récupération créée'
    }),
    documentationRequired: 'Data loss assessment and recovery priority list',
    responsibleRole: 'Owner or IT Staff'
  },
  {
    strategyId: 'data_protection_comprehensive',
    phase: 'after',
    sortOrder: 6,
    title: JSON.stringify({
      en: 'Restore Critical Business Data',
      es: 'Restaurar Datos Comerciales Críticos',
      fr: 'Restaurer Données Commerciales Critiques'
    }),
    description: JSON.stringify({
      en: 'Download all business data from cloud to new or repaired computers. Restore POS database, customer records, financial files. Verify all data intact.',
      es: 'Descargar todos los datos comerciales de la nube a computadoras nuevas o reparadas. Restaurar base de datos POS, registros de clientes, archivos financieros. Verificar que todos los datos estén intactos.',
      fr: 'Télécharger toutes données commerciales depuis cloud vers ordinateurs neufs ou réparés. Restaurer base données PDV, dossiers clients, fichiers financiers. Vérifier toutes données intactes.'
    }),
    estimatedMinutes: 180,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'New or repaired computer', es: 'Computadora nueva o reparada', fr: 'Ordinateur neuf ou réparé' },
      { en: 'Internet connection', es: 'Conexión a internet', fr: 'Connexion internet' },
      { en: 'Cloud storage credentials', es: 'Credenciales de almacenamiento en la nube', fr: 'Identifiants stockage cloud' },
      { en: 'Software installations (POS, etc.)', es: 'Instalaciones de software (POS, etc.)', fr: 'Installations logicielles (PDV, etc.)' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'All critical data restored, systems operational, data integrity verified',
      es: 'Todos los datos críticos restaurados, sistemas operativos, integridad de datos verificada',
      fr: 'Toutes données critiques restaurées, systèmes opérationnels, intégrité données vérifiée'
    }),
    documentationRequired: 'Data restoration completion checklist',
    responsibleRole: 'Owner or IT Staff'
  },

  // ============================================================================
  // POWER RESILIENCE - Action Steps
  // ============================================================================
  {
    strategyId: 'power_resilience_comprehensive',
    phase: 'before',
    sortOrder: 1,
    title: JSON.stringify({
      en: 'Calculate Power Requirements',
      es: 'Calcular Requisitos de Energía',
      fr: 'Calculer Besoins en Énergie'
    }),
    description: JSON.stringify({
      en: 'List all essential equipment (refrigerators, freezers, lights, POS, router). Check wattage labels. Calculate total watts needed + 20% safety margin.',
      es: 'Listar todo el equipo esencial (refrigeradores, congeladores, luces, POS, router). Verificar etiquetas de vataje. Calcular vatios totales necesarios + 20% margen de seguridad.',
      fr: 'Lister tout équipement essentiel (réfrigérateurs, congélateurs, lumières, PDV, routeur). Vérifier étiquettes puissance. Calculer watts totaux nécessaires + 20% marge sécurité.'
    }),
    estimatedMinutes: 60,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Notepad or spreadsheet', es: 'Libreta u hoja de cálculo', fr: 'Bloc-notes ou tableur' },
      { en: 'Access to equipment labels', es: 'Acceso a etiquetas de equipo', fr: 'Accès étiquettes équipement' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Complete list of equipment with wattage, total power requirement calculated',
      es: 'Lista completa de equipo con vataje, requisito total de energía calculado',
      fr: 'Liste complète équipement avec puissance, besoin total énergie calculé'
    }),
    documentationRequired: 'Power requirement calculation worksheet',
    responsibleRole: 'Owner or Electrician'
  },
  {
    strategyId: 'power_resilience_comprehensive',
    phase: 'before',
    sortOrder: 2,
    title: JSON.stringify({
      en: 'Purchase and Install Generator System',
      es: 'Comprar e Instalar Sistema Generador',
      fr: 'Acheter et Installer Système Générateur'
    }),
    description: JSON.stringify({
      en: 'Purchase generator sized for calculated needs (diesel recommended for longer runtime). Install by licensed electrician with transfer switch for safety. Test under full load.',
      es: 'Comprar generador dimensionado para necesidades calculadas (diésel recomendado para tiempo de ejecución más largo). Instalar por electricista licenciado con interruptor de transferencia para seguridad. Probar bajo carga completa.',
      fr: 'Acheter générateur dimensionné pour besoins calculés (diesel recommandé pour durée fonctionnement plus longue). Installer par électricien licencié avec commutateur transfert pour sécurité. Tester sous charge complète.'
    }),
    estimatedMinutes: 480,
    estimatedCostUSD: 1800,
    requiredResources: JSON.stringify([
      { en: 'Generator (sized appropriately)', es: 'Generador (dimensionado apropiadamente)', fr: 'Générateur (dimensionné appropriément)' },
      { en: 'Licensed electrician', es: 'Electricista licenciado', fr: 'Électricien licencié' },
      { en: 'Transfer switch', es: 'Interruptor de transferencia', fr: 'Commutateur de transfert' },
      { en: 'Fuel storage container', es: 'Contenedor de almacenamiento de combustible', fr: 'Conteneur stockage carburant' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Generator installed by licensed electrician, transfer switch operational, full load test successful',
      es: 'Generador instalado por electricista licenciado, interruptor de transferencia operativo, prueba de carga completa exitosa',
      fr: 'Générateur installé par électricien licencié, commutateur transfert opérationnel, test charge complète réussi'
    }),
    documentationRequired: 'Installation certificate and load test results',
    responsibleRole: 'Owner (hire electrician)'
  },
  {
    strategyId: 'power_resilience_comprehensive',
    phase: 'before',
    sortOrder: 3,
    title: JSON.stringify({
      en: 'Create Generator Operating Procedures',
      es: 'Crear Procedimientos de Operación del Generador',
      fr: 'Créer Procédures Fonctionnement Générateur'
    }),
    description: JSON.stringify({
      en: 'Write clear step-by-step instructions for: checking fuel, starting generator, switching power, shutting down. Post laminated copy at generator. Train all staff.',
      es: 'Escribir instrucciones paso a paso claras para: verificar combustible, arrancar generador, cambiar energía, apagar. Colocar copia laminada en el generador. Capacitar a todo el personal.',
      fr: 'Écrire instructions étape par étape claires pour: vérifier carburant, démarrer générateur, changer alimentation, arrêter. Afficher copie laminée au générateur. Former tout personnel.'
    }),
    estimatedMinutes: 120,
    estimatedCostUSD: 5,
    requiredResources: JSON.stringify([
      { en: 'Computer and printer', es: 'Computadora e impresora', fr: 'Ordinateur et imprimante' },
      { en: 'Lamination sheet or plastic sleeve', es: 'Hoja de laminación o funda de plástico', fr: 'Feuille de plastification ou pochette plastique' },
      { en: 'Generator manual', es: 'Manual del generador', fr: 'Manuel générateur' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Operating procedures written, posted at generator, all staff trained and can demonstrate startup',
      es: 'Procedimientos de operación escritos, colocados en el generador, todo el personal capacitado y puede demostrar el arranque',
      fr: 'Procédures fonctionnement écrites, affichées au générateur, tout personnel formé et peut démontrer démarrage'
    }),
    documentationRequired: 'Generator operating procedures document and staff training log',
    responsibleRole: 'Owner or Manager'
  },
  {
    strategyId: 'power_resilience_comprehensive',
    phase: 'during',
    sortOrder: 4,
    title: JSON.stringify({
      en: 'Start Generator and Switch to Backup Power',
      es: 'Arrancar Generador y Cambiar a Energía de Respaldo',
      fr: 'Démarrer Générateur et Passer Alimentation Secours'
    }),
    description: JSON.stringify({
      en: 'When power fails: Check fuel level. Start generator following procedures. Engage transfer switch. Verify essential equipment running. Monitor fuel consumption.',
      es: 'Cuando falla la energía: Verificar nivel de combustible. Arrancar generador siguiendo procedimientos. Activar interruptor de transferencia. Verificar que el equipo esencial esté funcionando. Monitorear consumo de combustible.',
      fr: 'Quand électricité tombe: Vérifier niveau carburant. Démarrer générateur en suivant procédures. Enclencher commutateur transfert. Vérifier équipement essentiel fonctionne. Surveiller consommation carburant.'
    }),
    estimatedMinutes: 30,
    estimatedCostUSD: 15,
    requiredResources: JSON.stringify([
      { en: 'Generator with fuel', es: 'Generador con combustible', fr: 'Générateur avec carburant' },
      { en: 'Operating procedure checklist', es: 'Lista de verificación de procedimientos de operación', fr: 'Liste vérification procédures fonctionnement' },
      { en: 'Flashlight (if during nighttime)', es: 'Linterna (si es durante la noche)', fr: 'Lampe torche (si pendant nuit)' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Generator running smoothly, all essential equipment powered, no overload conditions',
      es: 'Generador funcionando suavemente, todo el equipo esencial alimentado, sin condiciones de sobrecarga',
      fr: 'Générateur fonctionne bien, tout équipement essentiel alimenté, pas de conditions surcharge'
    }),
    documentationRequired: 'Generator startup log with time and fuel level',
    responsibleRole: 'Any Trained Staff Member'
  },
  {
    strategyId: 'power_resilience_comprehensive',
    phase: 'during',
    sortOrder: 5,
    title: JSON.stringify({
      en: 'Monitor Generator and Refuel as Needed',
      es: 'Monitorear Generador y Reabastecer Según Sea Necesario',
      fr: 'Surveiller Générateur et Ravitailler Si Nécessaire'
    }),
    description: JSON.stringify({
      en: 'Check generator every 2-3 hours: fuel level, oil level, temperature, strange sounds. Refuel when tank reaches 1/4 full. Keep spare fuel available.',
      es: 'Verificar generador cada 2-3 horas: nivel de combustible, nivel de aceite, temperatura, sonidos extraños. Reabastecer cuando el tanque llegue a 1/4 lleno. Mantener combustible de repuesto disponible.',
      fr: 'Vérifier générateur toutes 2-3 heures: niveau carburant, niveau huile, température, bruits étranges. Ravitailler quand réservoir atteint 1/4 plein. Garder carburant secours disponible.'
    }),
    estimatedMinutes: 15,
    estimatedCostUSD: 25,
    requiredResources: JSON.stringify([
      { en: 'Fuel containers (approved type)', es: 'Contenedores de combustible (tipo aprobado)', fr: 'Conteneurs carburant (type approuvé)' },
      { en: 'Funnel for safe refueling', es: 'Embudo para reabastecimiento seguro', fr: 'Entonnoir pour ravitaillement sécuritaire' },
      { en: 'Flashlight for nighttime checks', es: 'Linterna para verificaciones nocturnas', fr: 'Lampe torche pour vérifications nocturnes' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Generator maintained throughout outage, no overheating or mechanical issues',
      es: 'Generador mantenido durante todo el corte, sin sobrecalentamiento o problemas mecánicos',
      fr: 'Générateur entretenu pendant toute panne, pas de surchauffe ou problèmes mécaniques'
    }),
    documentationRequired: 'Generator monitoring log (time, fuel level, observations)',
    responsibleRole: 'Manager or Designated Staff'
  },
  {
    strategyId: 'power_resilience_comprehensive',
    phase: 'after',
    sortOrder: 6,
    title: JSON.stringify({
      en: 'Switch Back to Grid Power',
      es: 'Cambiar de Vuelta a Energía de la Red',
      fr: 'Revenir Alimentation Réseau'
    }),
    description: JSON.stringify({
      en: 'When grid power restored: Switch transfer switch back to grid. Allow generator to cool for 5 minutes under no load, then shut down properly. Check all equipment functioning.',
      es: 'Cuando se restablezca la energía de la red: Cambiar interruptor de transferencia de vuelta a la red. Permitir que el generador se enfríe durante 5 minutos sin carga, luego apagar correctamente. Verificar que todo el equipo funcione.',
      fr: 'Quand électricité réseau rétablie: Ramener commutateur transfert vers réseau. Laisser générateur refroidir 5 minutes sans charge, puis arrêter correctement. Vérifier tout équipement fonctionne.'
    }),
    estimatedMinutes: 20,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Operating procedure checklist', es: 'Lista de verificación de procedimientos de operación', fr: 'Liste vérification procédures fonctionnement' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Grid power confirmed stable, generator properly shut down, all equipment on grid power',
      es: 'Energía de red confirmada estable, generador apagado correctamente, todo el equipo con energía de red',
      fr: 'Électricité réseau confirmée stable, générateur arrêté correctement, tout équipement sur électricité réseau'
    }),
    documentationRequired: 'Generator shutdown log',
    responsibleRole: 'Manager or Trained Staff'
  },
  {
    strategyId: 'power_resilience_comprehensive',
    phase: 'after',
    sortOrder: 7,
    title: JSON.stringify({
      en: 'Perform Generator Maintenance',
      es: 'Realizar Mantenimiento del Generador',
      fr: 'Effectuer Maintenance Générateur'
    }),
    description: JSON.stringify({
      en: 'After extended use: Check and change oil if needed. Clean/replace air filter. Inspect for damage or wear. Refill fuel tank. Test restart. Log hours of use.',
      es: 'Después de uso prolongado: Verificar y cambiar aceite si es necesario. Limpiar/reemplazar filtro de aire. Inspeccionar daños o desgaste. Rellenar tanque de combustible. Probar reinicio. Registrar horas de uso.',
      fr: 'Après utilisation prolongée: Vérifier et changer huile si nécessaire. Nettoyer/remplacer filtre air. Inspecter dommages ou usure. Remplir réservoir carburant. Tester redémarrage. Consigner heures utilisation.'
    }),
    estimatedMinutes: 60,
    estimatedCostUSD: 30,
    requiredResources: JSON.stringify([
      { en: 'Generator oil', es: 'Aceite de generador', fr: 'Huile générateur' },
      { en: 'Air filter (if replacement needed)', es: 'Filtro de aire (si se necesita reemplazo)', fr: 'Filtre air (si remplacement nécessaire)' },
      { en: 'Maintenance tools', es: 'Herramientas de mantenimiento', fr: 'Outils maintenance' },
      { en: 'Maintenance log book', es: 'Libro de registro de mantenimiento', fr: 'Carnet entretien' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Generator maintenance completed, oil changed if needed, test start successful, ready for next use',
      es: 'Mantenimiento del generador completado, aceite cambiado si es necesario, arranque de prueba exitoso, listo para el próximo uso',
      fr: 'Maintenance générateur terminée, huile changée si nécessaire, test démarrage réussi, prêt pour prochaine utilisation'
    }),
    documentationRequired: 'Maintenance log entry with date, hours of use, work performed',
    responsibleRole: 'Owner or Maintenance Staff'
  },

  // ============================================================================
  // FIRE PREVENTION - Action Steps
  // ============================================================================
  {
    strategyId: 'fire_comprehensive',
    phase: 'before',
    sortOrder: 1,
    title: JSON.stringify({
      en: 'Install Fire Extinguishers',
      es: 'Instalar Extintores de Incendios',
      fr: 'Installer Extincteurs Incendie'
    }),
    description: JSON.stringify({
      en: 'Purchase ABC-rated fire extinguishers (10lb minimum). Mount at chest height near exits and high-risk areas (kitchen, electrical panel). Ensure visible and unobstructed.',
      es: 'Comprar extintores con clasificación ABC (mínimo 10 lb). Montar a altura del pecho cerca de salidas y áreas de alto riesgo (cocina, panel eléctrico). Asegurar que sean visibles y sin obstrucciones.',
      fr: 'Acheter extincteurs classés ABC (minimum 4,5 kg). Monter à hauteur poitrine près sorties et zones à haut risque (cuisine, panneau électrique). Assurer visibilité et absence d\'obstruction.'
    }),
    estimatedMinutes: 60,
    estimatedCostUSD: 100,
    requiredResources: JSON.stringify([
      { en: '2-3 ABC fire extinguishers (10lb)', es: '2-3 extintores ABC (10 lb)', fr: '2-3 extincteurs ABC (4,5 kg)' },
      { en: 'Wall mounting brackets', es: 'Soportes de montaje en pared', fr: 'Supports muraux' },
      { en: 'Drill and screws', es: 'Taladro y tornillos', fr: 'Perceuse et vis' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Extinguishers mounted securely at recommended locations, pressure gauges in green zone, signage visible',
      es: 'Extintores montados de forma segura en ubicaciones recomendadas, manómetros en zona verde, señalización visible',
      fr: 'Extincteurs montés solidement aux emplacements recommandés, manomètres en zone verte, signalisation visible'
    }),
    documentationRequired: 'Photos of installed extinguishers with locations noted',
    responsibleRole: 'Owner or Maintenance Staff'
  },
  {
    strategyId: 'fire_comprehensive',
    phase: 'before',
    sortOrder: 2,
    title: JSON.stringify({
      en: 'Install Smoke Detectors',
      es: 'Instalar Detectores de Humo',
      fr: 'Installer Détecteurs de Fumée'
    }),
    description: JSON.stringify({
      en: 'Install battery-powered smoke alarms in key areas: near kitchen, main room, storage areas. Test each unit. Replace batteries immediately if needed.',
      es: 'Instalar alarmas de humo a batería en áreas clave: cerca de cocina, sala principal, áreas de almacenamiento. Probar cada unidad. Reemplazar baterías inmediatamente si es necesario.',
      fr: 'Installer détecteurs fumée à piles dans zones clés: près cuisine, salle principale, zones stockage. Tester chaque unité. Remplacer piles immédiatement si nécessaire.'
    }),
    estimatedMinutes: 90,
    estimatedCostUSD: 50,
    requiredResources: JSON.stringify([
      { en: '3-5 smoke detectors with batteries', es: '3-5 detectores de humo con baterías', fr: '3-5 détecteurs fumée avec piles' },
      { en: 'Ladder', es: 'Escalera', fr: 'Échelle' },
      { en: 'Drill and mounting hardware', es: 'Taladro y herrajes de montaje', fr: 'Perceuse et quincaillerie montage' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Smoke detectors installed and operational, test button produces loud alarm',
      es: 'Detectores de humo instalados y operativos, botón de prueba produce alarma fuerte',
      fr: 'Détecteurs fumée installés et opérationnels, bouton test produit alarme forte'
    }),
    documentationRequired: 'Smoke detector installation and test log',
    responsibleRole: 'Owner or Maintenance Staff'
  },
  {
    strategyId: 'fire_comprehensive',
    phase: 'before',
    sortOrder: 3,
    title: JSON.stringify({
      en: 'Conduct Fire Extinguisher Training',
      es: 'Realizar Capacitación en Extintores',
      fr: 'Effectuer Formation Extincteurs'
    }),
    description: JSON.stringify({
      en: 'Train ALL staff on PASS method: Pull pin, Aim at base of fire, Squeeze handle, Sweep side-to-side. Practice with expired extinguisher if available. Emphasize when to fight vs evacuate.',
      es: 'Capacitar a TODO el personal en método PASS: Tirar pasador, Apuntar a base del fuego, Apretar manija, Barrer lado a lado. Practicar con extintor vencido si está disponible. Enfatizar cuándo combatir vs evacuar.',
      fr: 'Former TOUT personnel méthode PASS: Tirer goupille, Viser base feu, Presser poignée, Balayer côté à côté. Pratiquer avec extincteur expiré si disponible. Insister quand combattre vs évacuer.'
    }),
    estimatedMinutes: 60,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'All staff present', es: 'Todo el personal presente', fr: 'Tout personnel présent' },
      { en: 'Fire extinguisher for demonstration', es: 'Extintor para demostración', fr: 'Extincteur pour démonstration' },
      { en: 'Training video (optional, free on YouTube)', es: 'Video de capacitación (opcional, gratis en YouTube)', fr: 'Vidéo formation (optionnelle, gratuite sur YouTube)' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'All staff can recite PASS method and demonstrate correct extinguisher stance',
      es: 'Todo el personal puede recitar método PASS y demostrar postura correcta con extintor',
      fr: 'Tout personnel peut réciter méthode PASS et démontrer posture correcte avec extincteur'
    }),
    documentationRequired: 'Training attendance sheet with signatures',
    responsibleRole: 'Owner or Manager (trainer)'
  },
  {
    strategyId: 'fire_comprehensive',
    phase: 'during',
    sortOrder: 4,
    title: JSON.stringify({
      en: 'Assess Fire and Decide: Fight or Evacuate',
      es: 'Evaluar Incendio y Decidir: Combatir o Evacuar',
      fr: 'Évaluer Feu et Décider: Combattre ou Évacuer'
    }),
    description: JSON.stringify({
      en: 'IF fire is small (trash can size), spreading slowly, you have clear escape route, and extinguisher nearby: FIGHT. If fire larger, spreading fast, smoke thick, or blocking exits: EVACUATE immediately.',
      es: 'SI el fuego es pequeño (tamaño bote de basura), propagándose lentamente, tiene ruta de escape despejada y extintor cercano: COMBATIR. Si el fuego es más grande, se propaga rápido, humo espeso o bloqueando salidas: EVACUAR inmediatamente.',
      fr: 'SI feu petit (taille poubelle), se propage lentement, vous avez voie sortie dégagée et extincteur proche: COMBATTRE. Si feu plus grand, se propage vite, fumée épaisse ou bloque sorties: ÉVACUER immédiatement.'
    }),
    estimatedMinutes: 2,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Clear judgment', es: 'Juicio claro', fr: 'Jugement clair' },
      { en: 'Knowledge of evacuation routes', es: 'Conocimiento de rutas de evacuación', fr: 'Connaissance voies évacuation' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Decision made quickly (within seconds), appropriate action taken',
      es: 'Decisión tomada rápidamente (en segundos), acción apropiada tomada',
      fr: 'Décision prise rapidement (en secondes), action appropriée prise'
    }),
    documentationRequired: 'Incident report describing fire size and decision',
    responsibleRole: 'First Person to Discover Fire'
  },
  {
    strategyId: 'fire_comprehensive',
    phase: 'during',
    sortOrder: 5,
    title: JSON.stringify({
      en: 'Use Fire Extinguisher IF Safe',
      es: 'Usar Extintor SI Es Seguro',
      fr: 'Utiliser Extincteur SI Sécuritaire'
    }),
    description: JSON.stringify({
      en: 'ONLY if decided to fight: Grab extinguisher. Pull pin. Aim at BASE of fire (not flames). Squeeze handle. Sweep side to side. Back toward exit. If fire grows, DROP extinguisher and RUN.',
      es: 'SOLO si decidió combatir: Agarrar extintor. Tirar pasador. Apuntar a BASE del fuego (no llamas). Apretar manija. Barrer lado a lado. Retroceder hacia salida. Si el fuego crece, SOLTAR extintor y CORRER.',
      fr: 'SEULEMENT si décidé de combattre: Prendre extincteur. Tirer goupille. Viser BASE du feu (pas flammes). Presser poignée. Balayer côté à côté. Reculer vers sortie. Si feu grandit, LÂCHER extincteur et COURIR.'
    }),
    estimatedMinutes: 1,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Fire extinguisher', es: 'Extintor', fr: 'Extincteur' },
      { en: 'PASS training knowledge', es: 'Conocimiento de entrenamiento PASS', fr: 'Connaissance formation PASS' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Fire extinguished OR decision to evacuate made quickly if fire grows',
      es: 'Fuego extinguido O decisión de evacuar tomada rápidamente si el fuego crece',
      fr: 'Feu éteint OU décision d\'évacuer prise rapidement si feu grandit'
    }),
    documentationRequired: 'Incident report with outcome',
    responsibleRole: 'Person with Extinguisher (trained staff)'
  },
  {
    strategyId: 'fire_comprehensive',
    phase: 'during',
    sortOrder: 6,
    title: JSON.stringify({
      en: 'Evacuate All People',
      es: 'Evacuar a Todas las Personas',
      fr: 'Évacuer Toutes les Personnes'
    }),
    description: JSON.stringify({
      en: 'Shout "FIRE!" Alert all staff and customers. Guide everyone to nearest safe exit. Account for all people at meeting point. Call 911/fire brigade immediately. DO NOT RE-ENTER.',
      es: 'Gritar "¡FUEGO!" Alertar a todo el personal y clientes. Guiar a todos hacia la salida segura más cercana. Contabilizar a todas las personas en punto de reunión. Llamar a 911/bomberos inmediatamente. NO RE-ENTRAR.',
      fr: 'Crier "FEU!" Alerter tout personnel et clients. Guider tous vers sortie sûre la plus proche. Compter toutes personnes au point rassemblement. Appeler 911/pompiers immédiatement. NE PAS RE-ENTRER.'
    }),
    estimatedMinutes: 5,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Clear evacuation routes', es: 'Rutas de evacuación despejadas', fr: 'Voies évacuation dégagées' },
      { en: 'Designated meeting point', es: 'Punto de reunión designado', fr: 'Point rassemblement désigné' },
      { en: 'Phone to call emergency services', es: 'Teléfono para llamar servicios de emergencia', fr: 'Téléphone pour appeler services urgence' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'All people evacuated safely, emergency services called, no one injured',
      es: 'Todas las personas evacuadas de forma segura, servicios de emergencia llamados, nadie herido',
      fr: 'Toutes personnes évacuées en sécurité, services urgence appelés, personne blessée'
    }),
    documentationRequired: 'Evacuation report with people accounted for',
    responsibleRole: 'Manager or Senior Staff'
  },
  {
    strategyId: 'fire_comprehensive',
    phase: 'after',
    sortOrder: 7,
    title: JSON.stringify({
      en: 'Document Fire Damage',
      es: 'Documentar Daños por Incendio',
      fr: 'Documenter Dommages Incendie'
    }),
    description: JSON.stringify({
      en: 'After fire department clears building as safe: Take extensive photos and video of ALL damage - fire, smoke, water. List every damaged item. Save fire report from fire brigade.',
      es: 'Después de que el departamento de bomberos declare el edificio seguro: Tomar fotos y video extensivos de TODO el daño - fuego, humo, agua. Listar cada artículo dañado. Guardar reporte de bomberos.',
      fr: 'Après que pompiers déclarent bâtiment sécuritaire: Prendre photos et vidéo extensives de TOUS dommages - feu, fumée, eau. Lister chaque article endommagé. Garder rapport pompiers.'
    }),
    estimatedMinutes: 120,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Camera or smartphone', es: 'Cámara o teléfono inteligente', fr: 'Appareil photo ou smartphone' },
      { en: 'Notepad for damage inventory', es: 'Libreta para inventario de daños', fr: 'Bloc-notes pour inventaire dommages' },
      { en: 'Fire department clearance/report', es: 'Autorización/reporte del departamento de bomberos', fr: 'Autorisation/rapport pompiers' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Complete photo and video documentation, written damage inventory, fire report obtained',
      es: 'Documentación completa de fotos y video, inventario escrito de daños, reporte de bomberos obtenido',
      fr: 'Documentation complète photos et vidéo, inventaire écrit dommages, rapport pompiers obtenu'
    }),
    documentationRequired: 'Fire damage photo/video archive and damage inventory list',
    responsibleRole: 'Owner'
  },
  {
    strategyId: 'fire_comprehensive',
    phase: 'after',
    sortOrder: 8,
    title: JSON.stringify({
      en: 'File Insurance Claim and Begin Recovery',
      es: 'Presentar Reclamo de Seguro y Comenzar Recuperación',
      fr: 'Déposer Réclamation Assurance et Commencer Récupération'
    }),
    description: JSON.stringify({
      en: 'Contact insurance immediately with photos, damage list, fire report. Get adjuster visit scheduled. Secure building to prevent further damage. Plan cleanup and repairs.',
      es: 'Contactar seguro inmediatamente con fotos, lista de daños, reporte de bomberos. Programar visita de ajustador. Asegurar edificio para prevenir más daños. Planificar limpieza y reparaciones.',
      fr: 'Contacter assurance immédiatement avec photos, liste dommages, rapport pompiers. Programmer visite expert. Sécuriser bâtiment pour prévenir dommages supplémentaires. Planifier nettoyage et réparations.'
    }),
    estimatedMinutes: 180,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Insurance policy information', es: 'Información de póliza de seguro', fr: 'Informations police assurance' },
      { en: 'All fire damage documentation', es: 'Toda la documentación de daños por incendio', fr: 'Toute documentation dommages incendie' },
      { en: 'Phone/email for insurance contact', es: 'Teléfono/email para contacto con seguro', fr: 'Téléphone/courriel pour contact assurance' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Insurance claim filed, claim number received, recovery plan in place',
      es: 'Reclamo de seguro presentado, número de reclamo recibido, plan de recuperación establecido',
      fr: 'Réclamation assurance déposée, numéro réclamation reçu, plan récupération en place'
    }),
    documentationRequired: 'Insurance claim confirmation and recovery timeline',
    responsibleRole: 'Owner'
  },

  // ============================================================================
  // COMMUNICATION - Action Steps
  // ============================================================================
  {
    strategyId: 'communication_comprehensive',
    phase: 'before',
    sortOrder: 1,
    title: JSON.stringify({
      en: 'Create Staff Contact List',
      es: 'Crear Lista de Contactos del Personal',
      fr: 'Créer Liste Contacts Personnel'
    }),
    description: JSON.stringify({
      en: 'Collect from each staff member: Full name, TWO phone numbers (primary mobile + backup), email, home address, emergency contact. Store in spreadsheet.',
      es: 'Recopilar de cada miembro del personal: Nombre completo, DOS números de teléfono (móvil principal + respaldo), correo electrónico, dirección de casa, contacto de emergencia. Almacenar en hoja de cálculo.',
      fr: 'Collecter de chaque membre personnel: Nom complet, DEUX numéros téléphone (mobile principal + secours), courriel, adresse domicile, contact urgence. Stocker dans tableur.'
    }),
    estimatedMinutes: 45,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Spreadsheet software', es: 'Software de hoja de cálculo', fr: 'Logiciel tableur' },
      { en: 'Staff cooperation', es: 'Cooperación del personal', fr: 'Coopération personnel' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Complete contact list with 2 phone numbers per person, verified current',
      es: 'Lista de contactos completa con 2 números de teléfono por persona, verificados actuales',
      fr: 'Liste contacts complète avec 2 numéros téléphone par personne, vérifiés à jour'
    }),
    documentationRequired: 'Staff contact list spreadsheet',
    responsibleRole: 'Owner or Manager'
  },
  {
    strategyId: 'communication_comprehensive',
    phase: 'before',
    sortOrder: 2,
    title: JSON.stringify({
      en: 'Set Up WhatsApp Group and Social Media',
      es: 'Configurar Grupo de WhatsApp y Redes Sociales',
      fr: 'Configurer Groupe WhatsApp et Réseaux Sociaux'
    }),
    description: JSON.stringify({
      en: 'Create WhatsApp group with all staff. Set up Facebook Business Page and Instagram if not already active. Post test message to each platform.',
      es: 'Crear grupo de WhatsApp con todo el personal. Configurar Página de Facebook Business e Instagram si no están activos ya. Publicar mensaje de prueba en cada plataforma.',
      fr: 'Créer groupe WhatsApp avec tout personnel. Configurer Page Facebook Business et Instagram si pas déjà actifs. Publier message test sur chaque plateforme.'
    }),
    estimatedMinutes: 60,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Smartphone with WhatsApp', es: 'Teléfono inteligente con WhatsApp', fr: 'Smartphone avec WhatsApp' },
      { en: 'Computer for social media setup', es: 'Computadora para configurar redes sociales', fr: 'Ordinateur pour configuration réseaux sociaux' },
      { en: 'Business information (name, address, hours)', es: 'Información del negocio (nombre, dirección, horarios)', fr: 'Informations commerce (nom, adresse, heures)' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'WhatsApp group active with all staff, Facebook and Instagram pages live, test posts successful',
      es: 'Grupo de WhatsApp activo con todo el personal, páginas de Facebook e Instagram en vivo, publicaciones de prueba exitosas',
      fr: 'Groupe WhatsApp actif avec tout personnel, pages Facebook et Instagram en ligne, publications test réussies'
    }),
    documentationRequired: 'Screenshots of active WhatsApp group and social media pages',
    responsibleRole: 'Owner or Manager'
  },
  {
    strategyId: 'communication_comprehensive',
    phase: 'before',
    sortOrder: 3,
    title: JSON.stringify({
      en: 'Designate Backup Communicator',
      es: 'Designar Comunicador de Respaldo',
      fr: 'Désigner Communicateur Secours'
    }),
    description: JSON.stringify({
      en: 'Identify one trusted person (assistant manager, senior staff) as backup. Give them access to contact lists, social media accounts, key stakeholder contacts. Train them on communication procedures.',
      es: 'Identificar una persona de confianza (asistente gerente, personal senior) como respaldo. Darles acceso a listas de contactos, cuentas de redes sociales, contactos clave. Capacitarlos en procedimientos de comunicación.',
      fr: 'Identifier une personne de confiance (assistant gérant, personnel senior) comme secours. Leur donner accès listes contacts, comptes réseaux sociaux, contacts clés. Les former aux procédures communication.'
    }),
    estimatedMinutes: 30,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Backup communicator (staff member)', es: 'Comunicador de respaldo (miembro del personal)', fr: 'Communicateur secours (membre personnel)' },
      { en: 'Contact list copies', es: 'Copias de lista de contactos', fr: 'Copies liste contacts' },
      { en: 'Social media login credentials', es: 'Credenciales de inicio de sesión en redes sociales', fr: 'Identifiants connexion réseaux sociaux' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Backup communicator designated, trained, and has access to all necessary accounts and lists',
      es: 'Comunicador de respaldo designado, capacitado y tiene acceso a todas las cuentas y listas necesarias',
      fr: 'Communicateur secours désigné, formé et a accès à tous comptes et listes nécessaires'
    }),
    documentationRequired: 'Backup communicator designation and training confirmation',
    responsibleRole: 'Owner'
  },
  {
    strategyId: 'communication_comprehensive',
    phase: 'during',
    sortOrder: 4,
    title: JSON.stringify({
      en: 'Verify Staff Safety',
      es: 'Verificar Seguridad del Personal',
      fr: 'Vérifier Sécurité Personnel'
    }),
    description: JSON.stringify({
      en: 'Message all staff via WhatsApp: "Emergency update: [situation]. Please reply immediately with your status and location. Are you safe?" Track who responds. Call those who don\'t reply.',
      es: 'Mensajear a todo el personal vía WhatsApp: "Actualización de emergencia: [situación]. Por favor responda inmediatamente con su estado y ubicación. ¿Está seguro?" Rastrear quién responde. Llamar a quienes no respondan.',
      fr: 'Envoyer message tout personnel via WhatsApp: "Mise à jour urgence: [situation]. Veuillez répondre immédiatement avec votre statut et localisation. Êtes-vous en sécurité?" Suivre qui répond. Appeler ceux qui ne répondent pas.'
    }),
    estimatedMinutes: 30,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Phone with WhatsApp and contacts', es: 'Teléfono con WhatsApp y contactos', fr: 'Téléphone avec WhatsApp et contacts' },
      { en: 'Staff contact list', es: 'Lista de contactos del personal', fr: 'Liste contacts personnel' },
      { en: 'Backup battery/power bank', es: 'Batería de respaldo/power bank', fr: 'Batterie secours/power bank' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'All staff contacted, safety status confirmed for everyone',
      es: 'Todo el personal contactado, estado de seguridad confirmado para todos',
      fr: 'Tout personnel contacté, statut sécurité confirmé pour tous'
    }),
    documentationRequired: 'Staff safety check log with response times',
    responsibleRole: 'Owner or Manager (or backup communicator)'
  },
  {
    strategyId: 'communication_comprehensive',
    phase: 'during',
    sortOrder: 5,
    title: JSON.stringify({
      en: 'Post Initial Customer Update',
      es: 'Publicar Actualización Inicial para Clientes',
      fr: 'Publier Mise à Jour Initiale Clients'
    }),
    description: JSON.stringify({
      en: 'Post to Facebook, Instagram: "[Business name] update: Due to [situation], we are temporarily closed. All staff are safe. We will update you daily on our reopening plans. Thank you for your patience."',
      es: 'Publicar en Facebook, Instagram: "Actualización de [nombre del negocio]: Debido a [situación], estamos temporalmente cerrados. Todo el personal está seguro. Los actualizaremos diariamente sobre nuestros planes de reapertura. Gracias por su paciencia."',
      fr: 'Publier sur Facebook, Instagram: "Mise à jour [nom commerce]: En raison de [situation], nous sommes temporairement fermés. Tout personnel est en sécurité. Nous vous tiendrons informés quotidiennement sur nos plans réouverture. Merci pour votre patience."'
    }),
    estimatedMinutes: 15,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Phone or computer with internet', es: 'Teléfono o computadora con internet', fr: 'Téléphone ou ordinateur avec internet' },
      { en: 'Social media access', es: 'Acceso a redes sociales', fr: 'Accès réseaux sociaux' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Update posted on all social media channels, visible to customers',
      es: 'Actualización publicada en todos los canales de redes sociales, visible para clientes',
      fr: 'Mise à jour publiée sur tous canaux réseaux sociaux, visible pour clients'
    }),
    documentationRequired: 'Screenshots of social media posts',
    responsibleRole: 'Owner or Manager'
  },
  {
    strategyId: 'communication_comprehensive',
    phase: 'after',
    sortOrder: 6,
    title: JSON.stringify({
      en: 'Send Daily Recovery Updates',
      es: 'Enviar Actualizaciones Diarias de Recuperación',
      fr: 'Envoyer Mises à Jour Quotidiennes Récupération'
    }),
    description: JSON.stringify({
      en: 'Post daily on social media (even if no big changes): Day 1: "Assessing damage." Day 2: "Cleanup underway." Day 3: "Expecting to reopen [date]." Keep customers engaged.',
      es: 'Publicar diariamente en redes sociales (incluso si no hay grandes cambios): Día 1: "Evaluando daños." Día 2: "Limpieza en curso." Día 3: "Esperamos reabrir [fecha]." Mantener clientes comprometidos.',
      fr: 'Publier quotidiennement sur réseaux sociaux (même si pas grands changements): Jour 1: "Évaluation dommages." Jour 2: "Nettoyage en cours." Jour 3: "Prévoyons rouvrir [date]." Garder clients engagés.'
    }),
    estimatedMinutes: 10,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Phone with social media access', es: 'Teléfono con acceso a redes sociales', fr: 'Téléphone avec accès réseaux sociaux' },
      { en: '5 minutes daily', es: '5 minutos diarios', fr: '5 minutes quotidiennes' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Daily posts made consistently, customer engagement maintained',
      es: 'Publicaciones diarias hechas consistentemente, compromiso de clientes mantenido',
      fr: 'Publications quotidiennes faites régulièrement, engagement clients maintenu'
    }),
    documentationRequired: 'Archive of daily social media posts',
    responsibleRole: 'Owner or Manager'
  },
  {
    strategyId: 'communication_comprehensive',
    phase: 'after',
    sortOrder: 7,
    title: JSON.stringify({
      en: 'Announce Reopening Date',
      es: 'Anunciar Fecha de Reapertura',
      fr: 'Annoncer Date Réouverture'
    }),
    description: JSON.stringify({
      en: 'Once reopening confirmed, post on ALL channels: "REOPENING [date] at [time]! We\'re back! Thank you for your support. [Special offer if applicable]." Call top 20 customers personally.',
      es: 'Una vez confirmada la reapertura, publicar en TODOS los canales: "¡REABRIENDO [fecha] a las [hora]! ¡Estamos de vuelta! Gracias por su apoyo. [Oferta especial si aplica]." Llamar personalmente a los 20 mejores clientes.',
      fr: 'Une fois réouverture confirmée, publier sur TOUS canaux: "RÉOUVERTURE [date] à [heure]! Nous sommes de retour! Merci pour votre soutien. [Offre spéciale si applicable]." Appeler personnellement 20 meilleurs clients.'
    }),
    estimatedMinutes: 60,
    estimatedCostUSD: 0,
    requiredResources: JSON.stringify([
      { en: 'Social media access', es: 'Acceso a redes sociales', fr: 'Accès réseaux sociaux' },
      { en: 'Top customer contact list', es: 'Lista de contactos de mejores clientes', fr: 'Liste contacts meilleurs clients' },
      { en: 'Phone for personal calls', es: 'Teléfono para llamadas personales', fr: 'Téléphone pour appels personnels' }
    ]),
    verificationCriteria: JSON.stringify({
      en: 'Reopening announced on all channels, top customers contacted personally, positive response from customers',
      es: 'Reapertura anunciada en todos los canales, mejores clientes contactados personalmente, respuesta positiva de clientes',
      fr: 'Réouverture annoncée sur tous canaux, meilleurs clients contactés personnellement, réponse positive de clients'
    }),
    documentationRequired: 'Reopening announcement posts and customer contact log',
    responsibleRole: 'Owner'
  }
]

async function seedPremiumActionSteps() {
  console.log('🚀 Seeding Premium Action Steps...\n')
  
  let created = 0
  let updated = 0
  
  for (const step of PREMIUM_ACTION_STEPS) {
    // Try to find existing step by stepId
    const existing = await prisma.actionStep.findFirst({
      where: {
        stepId: step.stepId
      }
    })
    
    const titleObj = JSON.parse(step.title)
    
    if (existing) {
      await prisma.actionStep.update({
        where: { id: existing.id },
        data: step
      })
      console.log(`  ↻ Updated: ${titleObj.en} (${step.phase})`)
      updated++
    } else {
      await prisma.actionStep.create({ data: step })
      console.log(`  ✓ Created: ${titleObj.en} (${step.phase})`)
      created++
    }
  }
  
  console.log('\n' + '─'.repeat(80))
  console.log(`\n✅ Action Steps Summary:`)
  console.log(`   - New steps created: ${created}`)
  console.log(`   - Existing steps updated: ${updated}`)
  console.log(`   - Total steps: ${PREMIUM_ACTION_STEPS.length}`)
  console.log(`   - Languages per step: 3 (EN, ES, FR)`)
  
  // Count by phase
  const before = PREMIUM_ACTION_STEPS.filter(s => s.phase === 'before').length
  const during = PREMIUM_ACTION_STEPS.filter(s => s.phase === 'during').length
  const after = PREMIUM_ACTION_STEPS.filter(s => s.phase === 'after').length
  
  console.log(`\n📊 Steps by Phase:`)
  console.log(`   - BEFORE: ${before} steps`)
  console.log(`   - DURING: ${during} steps`)
  console.log(`   - AFTER: ${after} steps`)
}

// Run if called directly
if (require.main === module) {
  seedPremiumActionSteps()
    .then(() => {
      console.log('\n🎉 Premium action steps seeded successfully!')
      prisma.$disconnect()
    })
    .catch((e) => {
      console.error('\n❌ Seeding failed:', e)
      prisma.$disconnect()
      process.exit(1)
    })
}

export { seedPremiumActionSteps }


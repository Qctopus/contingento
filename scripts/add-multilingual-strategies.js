const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Helper function to create multilingual JSON
function toMultilingual(en, es, fr) {
  return JSON.stringify({ en, es, fr })
}

// Helper for JSON arrays
function toJSON(array) {
  return JSON.stringify(array)
}

const MULTILINGUAL_STRATEGIES = [
  {
    strategyId: 'hurricane_preparation',
    updates: {
      // Multilingual titles and summaries
      smeTitle: toMultilingual(
        "Protect Your Business from Hurricane Damage",
        "Protege Tu Negocio del Daño de Huracanes",
        "Protégez Votre Entreprise des Dégâts d'Ouragan"
      ),
      smeSummary: toMultilingual(
        "Hurricane season comes every year in the Caribbean. Being prepared means less damage, faster reopening, and protecting the business you've worked hard to build.",
        "La temporada de huracanes llega cada año en el Caribe. Estar preparado significa menos daños, reapertura más rápida y proteger el negocio que tanto te ha costado construir.",
        "La saison des ouragans arrive chaque année dans les Caraïbes. Être préparé signifie moins de dégâts, une réouverture plus rapide et protéger l'entreprise que vous avez travaillé si dur à bâtir."
      ),
      
      realWorldExample: toMultilingual(
        "When Hurricane Beryl hit Negril in 2024, hardware stores that had shutters and moved stock away from windows were open within days. Those that didn't prepare had weeks of cleanup and thousands in damage. One shop owner said: 'The shutters I bought for JMD 30,000 saved me JMD 200,000 in broken glass and water damage.'",
        "Cuando el huracán Beryl azotó Negril en 2024, las ferreterías que tenían persianas y movieron el inventario lejos de las ventanas abrieron en días. Las que no se prepararon tuvieron semanas de limpieza y miles en daños. Un dueño de tienda dijo: 'Las persianas que compré por JMD 30,000 me ahorraron JMD 200,000 en vidrios rotos y daños por agua.'",
        "Lorsque l'ouragan Beryl a frappé Negril en 2024, les quincailleries qui avaient des volets et avaient déplacé leurs stocks loin des fenêtres ont rouvert en quelques jours. Celles qui ne se sont pas préparées ont eu des semaines de nettoyage et des milliers de dégâts. Un propriétaire de magasin a dit : 'Les volets que j'ai achetés pour 30 000 JMD m'ont économisé 200 000 JMD en verre cassé et dégâts d'eau.'"
      ),
      
      lowBudgetAlternative: toMultilingual(
        "DIY plywood shutters (JMD 5,000-10,000) work almost as well as metal ones. Tape can't stop a hurricane, but plastic sheeting inside windows (JMD 1,500) catches glass if they break.",
        "Persianas de contrachapado hechas en casa (JMD 5,000-10,000) funcionan casi tan bien como las de metal. La cinta no puede detener un huracán, pero el plástico dentro de las ventanas (JMD 1,500) atrapa el vidrio si se rompen.",
        "Les volets en contreplaqué faits maison (5 000-10 000 JMD) fonctionnent presque aussi bien que ceux en métal. Le ruban ne peut pas arrêter un ouragan, mais une bâche en plastique à l'intérieur des fenêtres (1 500 JMD) attrape le verre s'il se brise."
      ),
      
      diyApproach: toMultilingual(
        "1) Buy plywood sheets and hinges (JMD 8,000). 2) Cut to fit your windows. 3) Paint with exterior paint (JMD 2,000). 4) Install simple hinges so they fold down when not needed. Total DIY cost: ~JMD 12,000 vs JMD 50,000+ for professional metal shutters.",
        "1) Compra láminas de contrachapado y bisagras (JMD 8,000). 2) Corta para que encajen en tus ventanas. 3) Pinta con pintura exterior (JMD 2,000). 4) Instala bisagras simples para que se plieguen cuando no se necesiten. Costo total casero: ~JMD 12,000 vs JMD 50,000+ por persianas metálicas profesionales.",
        "1) Achetez des feuilles de contreplaqué et des charnières (8 000 JMD). 2) Découpez pour s'adapter à vos fenêtres. 3) Peignez avec de la peinture extérieure (2 000 JMD). 4) Installez des charnières simples pour qu'ils se replient quand ils ne sont pas nécessaires. Coût total DIY : ~12 000 JMD vs 50 000+ JMD pour des volets métalliques professionnels."
      )
    }
  },
  
  {
    strategyId: 'financial_resilience',
    updates: {
      smeTitle: toMultilingual(
        "Build a Cash Reserve for When Disaster Strikes",
        "Construye una Reserva de Efectivo para Cuando Llegue el Desastre",
        "Constituez une Réserve de Trésorerie pour les Catastrophes"
      ),
      smeSummary: toMultilingual(
        "When disaster hits, banks may close, customers disappear, and bills still need paying. Having cash saved means you can survive the crisis and reopen when others can't.",
        "Cuando llega el desastre, los bancos pueden cerrar, los clientes desaparecen y las facturas aún necesitan pagarse. Tener efectivo ahorrado significa que puedes sobrevivir la crisis y reabrir cuando otros no pueden.",
        "Lorsqu'une catastrophe frappe, les banques peuvent fermer, les clients disparaissent et les factures doivent toujours être payées. Avoir des économies signifie que vous pouvez survivre à la crise et rouvrir quand d'autres ne le peuvent pas."
      ),
      
      realWorldExample: toMultilingual(
        "After Hurricane Gilbert in 1988, businesses with 3+ months of cash reserves survived the 6-8 week recovery period. Those without reserves had to close permanently. In 2020, COVID-19 proved the same lesson - businesses with savings survived, those living paycheck-to-paycheck closed.",
        "Después del huracán Gilbert en 1988, los negocios con 3+ meses de reservas de efectivo sobrevivieron el período de recuperación de 6-8 semanas. Los que no tenían reservas tuvieron que cerrar permanentemente. En 2020, COVID-19 probó la misma lección - los negocios con ahorros sobrevivieron, los que vivían de quincena en quincena cerraron.",
        "Après l'ouragan Gilbert en 1988, les entreprises avec 3+ mois de réserves de trésorerie ont survécu à la période de récupération de 6-8 semaines. Celles sans réserves ont dû fermer définitivement. En 2020, la COVID-19 a prouvé la même leçon - les entreprises avec des économies ont survécu, celles vivant au jour le jour ont fermé."
      ),
      
      lowBudgetAlternative: toMultilingual(
        "Start small: Put JMD 5,000 per week in a separate account. Don't touch it. In 6 months you'll have JMD 120,000 - enough for basic survival during crisis. Any amount is better than nothing.",
        "Empieza pequeño: Pon JMD 5,000 por semana en una cuenta separada. No lo toques. En 6 meses tendrás JMD 120,000 - suficiente para supervivencia básica durante la crisis. Cualquier cantidad es mejor que nada.",
        "Commencez petit : Mettez 5 000 JMD par semaine dans un compte séparé. N'y touchez pas. Dans 6 mois, vous aurez 120 000 JMD - assez pour une survie de base pendant la crise. N'importe quel montant vaut mieux que rien."
      ),
      
      diyApproach: toMultilingual(
        "1) Open separate savings account (free at most banks). 2) Calculate monthly fixed costs (rent, utilities, key staff). 3) Set goal for 3 months of costs. 4) Transfer 10-15% of revenue weekly (automatic if possible). 5) Don't touch unless real emergency. 6) Start with just 1 month goal if 3 months seems impossible.",
        "1) Abre cuenta de ahorros separada (gratis en la mayoría de bancos). 2) Calcula costos fijos mensuales (alquiler, servicios, personal clave). 3) Establece meta de 3 meses de costos. 4) Transfiere 10-15% de ingresos semanalmente (automático si es posible). 5) No toques a menos que sea emergencia real. 6) Empieza con meta de 1 mes si 3 meses parece imposible.",
        "1) Ouvrez un compte d'épargne séparé (gratuit dans la plupart des banques). 2) Calculez les coûts fixes mensuels (loyer, services publics, personnel clé). 3) Fixez un objectif de 3 mois de coûts. 4) Transférez 10-15% du chiffre d'affaires hebdomadairement (automatique si possible). 5) N'y touchez pas sauf urgence réelle. 6) Commencez avec un objectif d'1 mois si 3 mois semble impossible."
      )
    }
  },
  
  {
    strategyId: 'cybersecurity_protection',
    updates: {
      smeTitle: toMultilingual(
        "Protect Your Business from Hackers and Scammers",
        "Protege Tu Negocio de Hackers y Estafadores",
        "Protégez Votre Entreprise des Hackers et Escrocs"
      ),
      smeSummary: toMultilingual(
        "Cyber criminals target small businesses because they think you don't have protection. One successful attack can wipe out your bank account, steal customer data, or lock you out of your own systems.",
        "Los ciberdelincuentes atacan a pequeñas empresas porque piensan que no tienes protección. Un ataque exitoso puede vaciar tu cuenta bancaria, robar datos de clientes o bloquearte de tus propios sistemas.",
        "Les cybercriminels ciblent les petites entreprises car ils pensent que vous n'avez pas de protection. Une attaque réussie peut vider votre compte bancaire, voler les données des clients ou vous bloquer de vos propres systèmes."
      ),
      
      realWorldExample: toMultilingual(
        "A Kingston restaurant owner clicked a fake NCB email link in 2023. Scammers drained JMD 380,000 from the business account overnight. Another business in Montego Bay had all their files encrypted by ransomware - lost customer records, invoices, everything. Both could have been prevented with basic cybersecurity.",
        "Un dueño de restaurante en Kingston hizo clic en un enlace falso de correo de NCB en 2023. Los estafadores vaciaron JMD 380,000 de la cuenta comercial durante la noche. Otro negocio en Montego Bay tuvo todos sus archivos encriptados por ransomware - perdió registros de clientes, facturas, todo. Ambos podrían haberse prevenido con ciberseguridad básica.",
        "Un propriétaire de restaurant à Kingston a cliqué sur un faux lien email NCB en 2023. Les escrocs ont vidé 380 000 JMD du compte professionnel du jour au lendemain. Une autre entreprise à Montego Bay a eu tous ses fichiers cryptés par un rançongiciel - perdu les dossiers clients, factures, tout. Les deux auraient pu être évités avec une cybersécurité de base."
      ),
      
      lowBudgetAlternative: toMultilingual(
        "Free solutions: Use Google Drive (15GB free) for backups. Enable 2-factor authentication on all accounts (free). Use strong passwords (write them in a notebook, not on computer). Free antivirus like AVG or Avast. Total cost: JMD 0.",
        "Soluciones gratuitas: Usa Google Drive (15GB gratis) para respaldos. Activa autenticación de 2 factores en todas las cuentas (gratis). Usa contraseñas fuertes (escríbelas en un cuaderno, no en la computadora). Antivirus gratuito como AVG o Avast. Costo total: JMD 0.",
        "Solutions gratuites : Utilisez Google Drive (15 Go gratuits) pour les sauvegardes. Activez l'authentification à 2 facteurs sur tous les comptes (gratuit). Utilisez des mots de passe forts (écrivez-les dans un carnet, pas sur l'ordinateur). Antivirus gratuit comme AVG ou Avast. Coût total : 0 JMD."
      ),
      
      diyApproach: toMultilingual(
        "1) Change all passwords to strong ones (12+ characters, mix of letters/numbers/symbols). 2) Enable 2-factor authentication on bank and email (takes 5 minutes). 3) Set up automatic backups to cloud (Google Drive/Dropbox free accounts). 4) Install free antivirus. 5) Train staff: Never click links in unexpected emails, verify requests by phone, use strong passwords.",
        "1) Cambia todas las contraseñas a fuertes (12+ caracteres, mezcla de letras/números/símbolos). 2) Activa autenticación de 2 factores en banco y correo (toma 5 minutos). 3) Configura respaldos automáticos a la nube (cuentas gratuitas Google Drive/Dropbox). 4) Instala antivirus gratuito. 5) Capacita al personal: Nunca hacer clic en enlaces de correos inesperados, verificar solicitudes por teléfono, usar contraseñas fuertes.",
        "1) Changez tous les mots de passe en mots de passe forts (12+ caractères, mélange de lettres/chiffres/symboles). 2) Activez l'authentification à 2 facteurs sur la banque et l'email (prend 5 minutes). 3) Configurez des sauvegardes automatiques vers le cloud (comptes gratuits Google Drive/Dropbox). 4) Installez un antivirus gratuit. 5) Formez le personnel : Ne jamais cliquer sur des liens dans des emails inattendus, vérifier les demandes par téléphone, utiliser des mots de passe forts."
      )
    }
  },
  
  {
    strategyId: 'backup_power',
    updates: {
      smeTitle: toMultilingual(
        "Keep Your Business Running When the Power Goes Out",
        "Mantén Tu Negocio Funcionando Cuando Se Va la Luz",
        "Gardez Votre Entreprise en Marche lors des Pannes de Courant"
      ),
      smeSummary: toMultilingual(
        "Power outages are common in the Caribbean - from storms to grid failures. Having backup power means you can keep serving customers, protect perishables, and maintain security when others go dark.",
        "Los apagones son comunes en el Caribe - desde tormentas hasta fallas en la red. Tener energía de respaldo significa que puedes seguir atendiendo clientes, proteger perecederos y mantener seguridad cuando otros se quedan a oscuras.",
        "Les pannes de courant sont courantes dans les Caraïbes - des tempêtes aux défaillances du réseau. Avoir une alimentation de secours signifie que vous pouvez continuer à servir les clients, protéger les denrées périssables et maintenir la sécurité quand d'autres sont dans le noir."
      ),
      
      realWorldExample: toMultilingual(
        "A pharmacy in May Pen installed a JMD 180,000 generator in 2023. During a 3-day outage in July, they were the only pharmacy open in the area. They made JMD 450,000 in extra sales while competitors lost inventory to spoilage. The generator paid for itself in one weekend.",
        "Una farmacia en May Pen instaló un generador de JMD 180,000 en 2023. Durante un apagón de 3 días en julio, fueron la única farmacia abierta en el área. Ganaron JMD 450,000 en ventas adicionales mientras los competidores perdieron inventario por deterioro. El generador se pagó solo en un fin de semana.",
        "Une pharmacie à May Pen a installé un générateur de 180 000 JMD en 2023. Pendant une panne de 3 jours en juillet, c'était la seule pharmacie ouverte dans la région. Ils ont gagné 450 000 JMD en ventes supplémentaires pendant que les concurrents perdaient des stocks en détérioration. Le générateur s'est remboursé en un week-end."
      ),
      
      lowBudgetAlternative: toMultilingual(
        "Start with a small inverter (JMD 15,000) and car batteries (JMD 10,000 each) to power essentials like cash register, internet router, and a few lights. Total: JMD 35,000-50,000.",
        "Comienza con un inversor pequeño (JMD 15,000) y baterías de carro (JMD 10,000 cada una) para alimentar elementos esenciales como caja registradora, router de internet y algunas luces. Total: JMD 35,000-50,000.",
        "Commencez avec un petit onduleur (15 000 JMD) et des batteries de voiture (10 000 JMD chacune) pour alimenter l'essentiel comme la caisse enregistreuse, le routeur internet et quelques lumières. Total : 35 000-50 000 JMD."
      ),
      
      diyApproach: toMultilingual(
        "Buy an inverter that matches your key equipment wattage. Connect to deep-cycle batteries (car batteries work). Charge batteries when power is on. Switch over manually during outages. Can power lights, router, POS system for 2-4 hours.",
        "Compra un inversor que coincida con el vataje de tu equipo clave. Conéctalo a baterías de ciclo profundo (las baterías de carro funcionan). Carga las baterías cuando haya electricidad. Cambia manualmente durante los apagones. Puede alimentar luces, router, sistema POS por 2-4 horas.",
        "Achetez un onduleur qui correspond à la puissance de votre équipement clé. Connectez-le à des batteries à décharge profonde (les batteries de voiture fonctionnent). Chargez les batteries quand il y a du courant. Basculez manuellement pendant les pannes. Peut alimenter les lumières, le routeur, le système POS pendant 2-4 heures."
      )
    }
  },
  
  {
    strategyId: 'flood_prevention',
    updates: {
      smeTitle: toMultilingual(
        "Stop Flood Water from Destroying Your Business",
        "Evita que el Agua de Inundación Destruya Tu Negocio",
        "Empêchez l'Eau d'Inondation de Détruire Votre Entreprise"
      ),
      smeSummary: toMultilingual(
        "Flash floods can ruin inventory, damage equipment, and close your business for weeks. Simple flood prevention saves thousands in losses and gets you back in business faster.",
        "Las inundaciones repentinas pueden arruinar el inventario, dañar equipos y cerrar tu negocio por semanas. La prevención simple de inundaciones ahorra miles en pérdidas y te hace volver al negocio más rápido.",
        "Les crues soudaines peuvent ruiner l'inventaire, endommager l'équipement et fermer votre entreprise pendant des semaines. Une prévention simple des inondations économise des milliers en pertes et vous remet en affaires plus rapidement."
      ),
      
      realWorldExample: toMultilingual(
        "A small grocery in Old Harbour had flooding every rainy season - losing JMD 80,000-100,000 in damaged stock each time. They spent JMD 45,000 on drainage improvements and raised shelving. Haven't had flood damage in 2 years, saving JMD 160,000+.",
        "Un pequeño colmado en Old Harbour tenía inundaciones cada temporada de lluvias - perdiendo JMD 80,000-100,000 en inventario dañado cada vez. Gastaron JMD 45,000 en mejoras de drenaje y estanterías elevadas. No han tenido daños por inundación en 2 años, ahorrando JMD 160,000+.",
        "Une petite épicerie à Old Harbour avait des inondations chaque saison des pluies - perdant 80 000-100 000 JMD en stock endommagé à chaque fois. Ils ont dépensé 45 000 JMD en améliorations de drainage et étagères surélevées. Pas de dégâts d'inondation depuis 2 ans, économisant 160 000+ JMD."
      ),
      
      lowBudgetAlternative: toMultilingual(
        "DIY sandbags (JMD 5,000 for bags and sand) and raised pallets for inventory (JMD 8,000). Move stock during flood warnings. Total: JMD 15,000-20,000.",
        "Sacos de arena caseros (JMD 5,000 por sacos y arena) y paletas elevadas para inventario (JMD 8,000). Mueve el inventario durante alertas de inundación. Total: JMD 15,000-20,000.",
        "Sacs de sable DIY (5 000 JMD pour sacs et sable) et palettes surélevées pour l'inventaire (8 000 JMD). Déplacez le stock lors des alertes d'inondation. Total : 15 000-20 000 JMD."
      ),
      
      diyApproach: toMultilingual(
        "1) Clear drainage gutters yourself (free). 2) Build raised platforms from concrete blocks and plywood (JMD 12,000). 3) Fill sandbags during dry season and store them (JMD 5,000). 4) Create emergency stock-moving plan.",
        "1) Limpia los desagües tú mismo (gratis). 2) Construye plataformas elevadas con bloques de concreto y contrachapado (JMD 12,000). 3) Llena sacos de arena durante la temporada seca y guárdalos (JMD 5,000). 4) Crea un plan de emergencia para mover inventario.",
        "1) Nettoyez les gouttières vous-même (gratuit). 2) Construisez des plateformes surélevées avec des blocs de béton et du contreplaqué (12 000 JMD). 3) Remplissez des sacs de sable pendant la saison sèche et stockez-les (5 000 JMD). 4) Créez un plan d'urgence pour déplacer le stock."
      )
    }
  },
  
  {
    strategyId: 'supply_chain_diversification',
    updates: {
      smeTitle: toMultilingual(
        "Never Run Out of Stock Because One Supplier Failed",
        "Nunca Te Quedes Sin Inventario Porque Un Proveedor Falló",
        "Ne Manquez Jamais de Stock à Cause d'un Fournisseur Défaillant"
      ),
      smeSummary: toMultilingual(
        "Relying on one supplier is risky - if they have problems, you're out of business. Having backup suppliers means you can keep serving customers no matter what happens.",
        "Depender de un solo proveedor es arriesgado - si tienen problemas, te quedas sin negocio. Tener proveedores de respaldo significa que puedes seguir atendiendo clientes pase lo que pase.",
        "Dépendre d'un seul fournisseur est risqué - s'ils ont des problèmes, vous êtes hors service. Avoir des fournisseurs de secours signifie que vous pouvez continuer à servir les clients quoi qu'il arrive."
      ),
      
      realWorldExample: toMultilingual(
        "A restaurant in Mandeville lost their main chicken supplier during COVID shutdowns. They had no backup and couldn't serve half their menu for a month, losing JMD 300,000 in revenue. Now they have 3 suppliers - when one runs out, they call the next.",
        "Un restaurante en Mandeville perdió su proveedor principal de pollo durante los cierres de COVID. No tenían respaldo y no pudieron servir la mitad de su menú por un mes, perdiendo JMD 300,000 en ingresos. Ahora tienen 3 proveedores - cuando uno se queda sin existencias, llaman al siguiente.",
        "Un restaurant à Mandeville a perdu son principal fournisseur de poulet pendant les fermetures COVID. Ils n'avaient pas de secours et ne pouvaient servir la moitié de leur menu pendant un mois, perdant 300 000 JMD de revenus. Maintenant ils ont 3 fournisseurs - quand l'un est en rupture, ils appellent le suivant."
      ),
      
      lowBudgetAlternative: toMultilingual(
        "Free - just build relationships! Visit 2-3 alternative suppliers, get their contact info, make small orders to establish accounts. Keep list updated. Cost: JMD 0 plus time.",
        "Gratis - ¡solo construye relaciones! Visita 2-3 proveedores alternativos, obtén su información de contacto, haz pedidos pequeños para establecer cuentas. Mantén la lista actualizada. Costo: JMD 0 más tiempo.",
        "Gratuit - construisez simplement des relations ! Visitez 2-3 fournisseurs alternatifs, obtenez leurs coordonnées, faites de petites commandes pour établir des comptes. Gardez la liste à jour. Coût : 0 JMD plus le temps."
      ),
      
      diyApproach: toMultilingual(
        "1) List your top 10 critical supplies. 2) Find 2-3 suppliers for each (Google, ask other businesses). 3) Visit them, get pricing, place test order. 4) Keep spreadsheet with contacts, prices, delivery times. Update quarterly.",
        "1) Enumera tus 10 suministros críticos principales. 2) Encuentra 2-3 proveedores para cada uno (Google, pregunta a otros negocios). 3) Visítalos, obtén precios, haz pedido de prueba. 4) Mantén hoja de cálculo con contactos, precios, tiempos de entrega. Actualiza trimestralmente.",
        "1) Listez vos 10 fournitures critiques principales. 2) Trouvez 2-3 fournisseurs pour chacune (Google, demandez à d'autres entreprises). 3) Visitez-les, obtenez les prix, passez une commande test. 4) Gardez une feuille de calcul avec contacts, prix, délais de livraison. Mettez à jour trimestriellement."
      )
    }
  },
  
  {
    strategyId: 'earthquake_preparedness',
    updates: {
      smeTitle: toMultilingual(
        "Protect Your Business and Staff from Earthquake Damage",
        "Protege Tu Negocio y Personal de Daños por Terremotos",
        "Protégez Votre Entreprise et Votre Personnel des Tremblements de Terre"
      ),
      smeSummary: toMultilingual(
        "Jamaica is in an earthquake zone - a big one could happen any time. Simple preparation can save lives, protect inventory, and get you back in business faster.",
        "Jamaica está en una zona sísmica - uno grande podría ocurrir en cualquier momento. La preparación simple puede salvar vidas, proteger inventario y hacerte volver al negocio más rápido.",
        "La Jamaïque est dans une zone sismique - un gros pourrait arriver à tout moment. Une préparation simple peut sauver des vies, protéger l'inventaire et vous remettre en affaires plus rapidement."
      ),
      
      realWorldExample: toMultilingual(
        "After the 2020 earthquake, a shop in Port Antonio had thousands in broken glass and fallen shelves - closed for 2 weeks. Their neighbor who secured shelves to walls reopened next day with minimal damage. JMD 25,000 in securing saved JMD 200,000+ in losses.",
        "Después del terremoto de 2020, una tienda en Port Antonio tuvo miles en vidrios rotos y estantes caídos - cerrada por 2 semanas. Su vecino que aseguró estantes a las paredes reabrió al día siguiente con daño mínimo. JMD 25,000 en aseguramiento ahorraron JMD 200,000+ en pérdidas.",
        "Après le tremblement de terre de 2020, un magasin à Port Antonio avait des milliers en verre cassé et étagères tombées - fermé pendant 2 semaines. Leur voisin qui avait sécurisé les étagères aux murs a rouvert le lendemain avec des dégâts minimes. 25 000 JMD de sécurisation ont économisé 200 000+ JMD de pertes."
      ),
      
      lowBudgetAlternative: toMultilingual(
        "DIY securing with basic hardware (JMD 8,000-12,000). Wall brackets for shelves, museum putty for valuables, non-slip mats. Emergency kit with basic supplies (JMD 5,000).",
        "Aseguramiento casero con ferretería básica (JMD 8,000-12,000). Soportes de pared para estantes, masilla de museo para objetos valiosos, tapetes antideslizantes. Kit de emergencia con suministros básicos (JMD 5,000).",
        "Sécurisation DIY avec quincaillerie de base (8 000-12 000 JMD). Supports muraux pour étagères, pâte à modeler pour objets de valeur, tapis antidérapants. Kit d'urgence avec fournitures de base (5 000 JMD)."
      ),
      
      diyApproach: toMultilingual(
        "1) Buy L-brackets and screws (JMD 3,000). 2) Secure tall shelves and cabinets to walls (weekend project). 3) Use non-slip shelf liner (JMD 2,000). 4) Move heavy items to low shelves. 5) Assemble emergency kit (flashlight, first aid, water).",
        "1) Compra escuadras y tornillos (JMD 3,000). 2) Asegura estantes altos y gabinetes a las paredes (proyecto de fin de semana). 3) Usa forro antideslizante para estantes (JMD 2,000). 4) Mueve artículos pesados a estantes bajos. 5) Ensambla kit de emergencia (linterna, primeros auxilios, agua).",
        "1) Achetez des équerres et vis (3 000 JMD). 2) Sécurisez les grandes étagères et armoires aux murs (projet de week-end). 3) Utilisez un revêtement antidérapant pour étagères (2 000 JMD). 4) Déplacez les objets lourds sur des étagères basses. 5) Assemblez un kit d'urgence (lampe de poche, premiers soins, eau)."
      )
    }
  },
  
  {
    strategyId: 'fire_detection_suppression',
    updates: {
      smeTitle: toMultilingual(
        "Catch Fires Early Before They Destroy Your Business",
        "Detecta Incendios Temprano Antes de que Destruyan Tu Negocio",
        "Détectez les Incendies Tôt Avant qu'ils Ne Détruisent Votre Entreprise"
      ),
      smeSummary: toMultilingual(
        "Fire can destroy a business in minutes. Early detection and quick suppression can be the difference between minor damage and total loss. Simple systems are affordable and save lives.",
        "El fuego puede destruir un negocio en minutos. La detección temprana y supresión rápida pueden ser la diferencia entre daño menor y pérdida total. Los sistemas simples son asequibles y salvan vidas.",
        "Le feu peut détruire une entreprise en minutes. La détection précoce et la suppression rapide peuvent faire la différence entre des dégâts mineurs et une perte totale. Les systèmes simples sont abordables et sauvent des vies."
      ),
      
      realWorldExample: toMultilingual(
        "A bakery in Spanish Town had a small electrical fire at 6 AM. Their smoke alarm (JMD 3,000) woke the owner living upstairs. He put it out with a fire extinguisher (JMD 5,000) before it spread. JMD 8,000 in safety equipment saved a JMD 2 million business.",
        "Una panadería en Spanish Town tuvo un pequeño incendio eléctrico a las 6 AM. Su alarma de humo (JMD 3,000) despertó al dueño que vivía arriba. Lo apagó con un extintor (JMD 5,000) antes de que se propagara. JMD 8,000 en equipo de seguridad salvaron un negocio de JMD 2 millones.",
        "Une boulangerie à Spanish Town a eu un petit incendie électrique à 6h du matin. Leur détecteur de fumée (3 000 JMD) a réveillé le propriétaire vivant à l'étage. Il l'a éteint avec un extincteur (5 000 JMD) avant qu'il ne se propage. 8 000 JMD d'équipement de sécurité ont sauvé une entreprise de 2 millions JMD."
      ),
      
      lowBudgetAlternative: toMultilingual(
        "Basic smoke alarms (JMD 2,000-3,000 each - need 2-3) plus fire extinguishers (JMD 4,500 each - need 2). Total: JMD 15,000-20,000. Test monthly.",
        "Alarmas de humo básicas (JMD 2,000-3,000 cada una - necesitas 2-3) más extintores (JMD 4,500 cada uno - necesitas 2). Total: JMD 15,000-20,000. Prueba mensualmente.",
        "Détecteurs de fumée de base (2 000-3 000 JMD chacun - besoin de 2-3) plus extincteurs (4 500 JMD chacun - besoin de 2). Total : 15 000-20 000 JMD. Testez mensuellement."
      ),
      
      diyApproach: toMultilingual(
        "1) Buy smoke alarms for each room (JMD 2,500 each). 2) Install on ceiling away from vents. 3) Buy ABC fire extinguishers (JMD 4,500 each). 4) Mount near exits and kitchen. 5) Train everyone how to use them. 6) Test alarms monthly.",
        "1) Compra alarmas de humo para cada habitación (JMD 2,500 cada una). 2) Instala en el techo lejos de ventilaciones. 3) Compra extintores ABC (JMD 4,500 cada uno). 4) Monta cerca de salidas y cocina. 5) Capacita a todos en cómo usarlos. 6) Prueba alarmas mensualmente.",
        "1) Achetez des détecteurs de fumée pour chaque pièce (2 500 JMD chacun). 2) Installez au plafond loin des ventilations. 3) Achetez des extincteurs ABC (4 500 JMD chacun). 4) Montez près des sorties et de la cuisine. 5) Formez tout le monde à les utiliser. 6) Testez les alarmes mensuellement."
      )
    }
  },
  
  {
    strategyId: 'health_safety_protocols',
    updates: {
      smeTitle: toMultilingual(
        "Keep Your Business Safe from Health Emergencies",
        "Mantén Tu Negocio Seguro de Emergencias de Salud",
        "Gardez Votre Entreprise en Sécurité face aux Urgences Sanitaires"
      ),
      smeSummary: toMultilingual(
        "COVID taught us that health emergencies can shut down businesses overnight. Having protocols ready means you can stay open safely and keep customers confident.",
        "COVID nos enseñó que las emergencias de salud pueden cerrar negocios de la noche a la mañana. Tener protocolos listos significa que puedes permanecer abierto de forma segura y mantener la confianza de los clientes.",
        "La COVID nous a appris que les urgences sanitaires peuvent fermer les entreprises du jour au lendemain. Avoir des protocoles prêts signifie que vous pouvez rester ouvert en toute sécurité et garder la confiance des clients."
      ),
      
      realWorldExample: toMultilingual(
        "Restaurants that quickly adapted to COVID protocols (masks, sanitizer, spacing) stayed in business. Those that resisted or were slow lost customers and many closed permanently. One cafe in Kingston invested JMD 30,000 in safety measures and kept 90% of revenue during lockdown.",
        "Los restaurantes que se adaptaron rápidamente a los protocolos COVID (mascarillas, desinfectante, distanciamiento) permanecieron en el negocio. Los que se resistieron o fueron lentos perdieron clientes y muchos cerraron permanentemente. Un café en Kingston invirtió JMD 30,000 en medidas de seguridad y mantuvo el 90% de ingresos durante el confinamiento.",
        "Les restaurants qui se sont rapidement adaptés aux protocoles COVID (masques, désinfectant, distanciation) sont restés en affaires. Ceux qui ont résisté ou ont été lents ont perdu des clients et beaucoup ont fermé définitivement. Un café à Kingston a investi 30 000 JMD dans des mesures de sécurité et a conservé 90% du chiffre d'affaires pendant le confinement."
      ),
      
      lowBudgetAlternative: toMultilingual(
        "Basic hygiene setup: Hand sanitizer dispenser (JMD 3,000), bulk sanitizer refills (JMD 2,000/gallon), soap, simple signage you print yourself. Total: JMD 8,000-12,000.",
        "Configuración básica de higiene: Dispensador de desinfectante de manos (JMD 3,000), recargas de desinfectante a granel (JMD 2,000/galón), jabón, señalización simple que imprimes tú mismo. Total: JMD 8,000-12,000.",
        "Configuration d'hygiène de base : Distributeur de désinfectant pour les mains (3 000 JMD), recharges de désinfectant en vrac (2 000 JMD/gallon), savon, signalisation simple que vous imprimez vous-même. Total : 8 000-12 000 JMD."
      ),
      
      diyApproach: toMultilingual(
        "1) Buy hand sanitizer and dispensers (JMD 5,000). 2) Make signage on computer and print (JMD 500). 3) Create cleaning schedule and assign roles (free). 4) Train staff on protocols (1 hour). 5) Document everything in simple manual.",
        "1) Compra desinfectante de manos y dispensadores (JMD 5,000). 2) Haz señalización en computadora e imprime (JMD 500). 3) Crea calendario de limpieza y asigna roles (gratis). 4) Capacita al personal en protocolos (1 hora). 5) Documenta todo en manual simple.",
        "1) Achetez du désinfectant et des distributeurs (5 000 JMD). 2) Créez de la signalisation sur ordinateur et imprimez (500 JMD). 3) Créez un calendrier de nettoyage et assignez des rôles (gratuit). 4) Formez le personnel aux protocoles (1 heure). 5) Documentez tout dans un manuel simple."
      )
    }
  },
  
  {
    strategyId: 'water_conservation',
    updates: {
      smeTitle: toMultilingual(
        "Store Water So You Can Keep Operating During Shortages",
        "Almacena Agua para Seguir Operando Durante Escasez",
        "Stockez de l'Eau pour Continuer à Fonctionner Pendant les Pénuries"
      ),
      smeSummary: toMultilingual(
        "Water disruptions happen regularly in parts of Jamaica - from drought to burst mains. Having water stored means you can keep your business running when taps run dry.",
        "Las interrupciones de agua ocurren regularmente en partes de Jamaica - desde sequía hasta tuberías rotas. Tener agua almacenada significa que puedes mantener tu negocio funcionando cuando los grifos se sequen.",
        "Les perturbations d'eau se produisent régulièrement dans certaines parties de la Jamaïque - de la sécheresse aux conduites éclatées. Avoir de l'eau stockée signifie que vous pouvez garder votre entreprise en marche quand les robinets sont à sec."
      ),
      
      realWorldExample: toMultilingual(
        "During 2023 water shortage, a restaurant in Portmore with a 500-gallon tank (JMD 45,000) stayed open while competitors closed. They served limited menu but still made JMD 180,000 over 5 days that others lost. Tank paid for itself in one shortage.",
        "Durante la escasez de agua de 2023, un restaurante en Portmore con un tanque de 500 galones (JMD 45,000) permaneció abierto mientras los competidores cerraron. Sirvieron un menú limitado pero aún así ganaron JMD 180,000 en 5 días que otros perdieron. El tanque se pagó solo en una escasez.",
        "Pendant la pénurie d'eau de 2023, un restaurant à Portmore avec un réservoir de 500 gallons (45 000 JMD) est resté ouvert alors que les concurrents fermaient. Ils ont servi un menu limité mais ont quand même gagné 180 000 JMD sur 5 jours que d'autres ont perdus. Le réservoir s'est remboursé en une pénurie."
      ),
      
      lowBudgetAlternative: toMultilingual(
        "Large plastic drums (JMD 3,000-5,000 each). Buy 3-5 and keep filled. Add water purification tablets (JMD 1,500). Basic collection system. Total: JMD 15,000-25,000.",
        "Tambores plásticos grandes (JMD 3,000-5,000 cada uno). Compra 3-5 y manténlos llenos. Añade tabletas de purificación de agua (JMD 1,500). Sistema básico de recolección. Total: JMD 15,000-25,000.",
        "Grands fûts en plastique (3 000-5 000 JMD chacun). Achetez-en 3-5 et gardez-les remplis. Ajoutez des comprimés de purification d'eau (1 500 JMD). Système de collecte de base. Total : 15 000-25 000 JMD."
      ),
      
      diyApproach: toMultilingual(
        "1) Buy food-grade plastic drums (JMD 5,000 each x 3 = JMD 15,000). 2) Install where you can fill them easily. 3) Keep filled and covered. 4) Rotate water monthly. 5) Have hand pump or siphon to access (JMD 2,000). Add bleach for long storage.",
        "1) Compra tambores plásticos grado alimenticio (JMD 5,000 cada uno x 3 = JMD 15,000). 2) Instala donde puedas llenarlos fácilmente. 3) Mantén llenos y cubiertos. 4) Rota el agua mensualmente. 5) Ten bomba manual o sifón para acceder (JMD 2,000). Añade cloro para almacenamiento largo.",
        "1) Achetez des fûts en plastique de qualité alimentaire (5 000 JMD chacun x 3 = 15 000 JMD). 2) Installez où vous pouvez les remplir facilement. 3) Gardez remplis et couverts. 4) Faites tourner l'eau mensuellement. 5) Ayez une pompe manuelle ou siphon pour accéder (2 000 JMD). Ajoutez de l'eau de javel pour un stockage long."
      )
    }
  },
  
  {
    strategyId: 'security_communication_unrest',
    updates: {
      smeTitle: toMultilingual(
        "Keep Your Business Safe During Security Incidents",
        "Mantén Tu Negocio Seguro Durante Incidentes de Seguridad",
        "Gardez Votre Entreprise en Sécurité pendant les Incidents de Sécurité"
      ),
      smeSummary: toMultilingual(
        "Civil unrest, protests, or security incidents can happen suddenly. Having a security and communication plan keeps your staff safe and protects your property.",
        "Disturbios civiles, protestas o incidentes de seguridad pueden ocurrir repentinamente. Tener un plan de seguridad y comunicación mantiene a tu personal seguro y protege tu propiedad.",
        "Les troubles civils, manifestations ou incidents de sécurité peuvent survenir soudainement. Avoir un plan de sécurité et de communication garde votre personnel en sécurité et protège votre propriété."
      ),
      
      realWorldExample: toMultilingual(
        "During 2021 protest activity in Kingston, businesses with quick-close procedures and staff communication plans shut down safely in 15 minutes when others scrambled. One shop that closed quickly had zero damage while neighbor lost JMD 90,000 to broken windows and theft.",
        "Durante la actividad de protestas de 2021 en Kingston, los negocios con procedimientos de cierre rápido y planes de comunicación del personal cerraron de forma segura en 15 minutos cuando otros se apresuraban. Una tienda que cerró rápidamente no tuvo daños mientras el vecino perdió JMD 90,000 en ventanas rotas y robo.",
        "Pendant l'activité de protestation de 2021 à Kingston, les entreprises avec des procédures de fermeture rapide et des plans de communication du personnel ont fermé en toute sécurité en 15 minutes pendant que d'autres se bousculaient. Un magasin qui a fermé rapidement n'a eu aucun dégât tandis que le voisin a perdu 90 000 JMD en vitres cassées et vol."
      ),
      
      lowBudgetAlternative: toMultilingual(
        "Free WhatsApp group for staff alerts. Basic security checklist (free to create). Simple grilles for doors/windows (JMD 15,000-25,000). Good locks (JMD 3,000-5,000). Total: JMD 20,000-30,000.",
        "Grupo de WhatsApp gratuito para alertas del personal. Lista de verificación de seguridad básica (gratis de crear). Rejas simples para puertas/ventanas (JMD 15,000-25,000). Buenos candados (JMD 3,000-5,000). Total: JMD 20,000-30,000.",
        "Groupe WhatsApp gratuit pour les alertes du personnel. Liste de contrôle de sécurité de base (gratuit à créer). Grilles simples pour portes/fenêtres (15 000-25 000 JMD). Bonnes serrures (3 000-5 000 JMD). Total : 20 000-30 000 JMD."
      ),
      
      diyApproach: toMultilingual(
        "1) Create WhatsApp group with all staff (free). 2) Write quick-close procedure (30 min). 3) Identify safe room in building (free). 4) Install good locks and bars on most vulnerable entry points (JMD 15,000). 5) Practice closing routine monthly.",
        "1) Crea grupo de WhatsApp con todo el personal (gratis). 2) Escribe procedimiento de cierre rápido (30 min). 3) Identifica habitación segura en el edificio (gratis). 4) Instala buenos candados y barras en los puntos de entrada más vulnerables (JMD 15,000). 5) Practica rutina de cierre mensualmente.",
        "1) Créez un groupe WhatsApp avec tout le personnel (gratuit). 2) Écrivez une procédure de fermeture rapide (30 min). 3) Identifiez une pièce sûre dans le bâtiment (gratuit). 4) Installez de bonnes serrures et barres sur les points d'entrée les plus vulnérables (15 000 JMD). 5) Pratiquez la routine de fermeture mensuellement."
      )
    }
  }
]

async function main() {
  console.log('🌐 Adding multilingual content to strategies...\n')
  
  let updated = 0
  
  for (const strategy of MULTILINGUAL_STRATEGIES) {
    try {
      const existing = await prisma.riskMitigationStrategy.findUnique({
        where: { strategyId: strategy.strategyId }
      })
      
      if (!existing) {
        console.log(`⚠️  Strategy '${strategy.strategyId}' not found, skipping...`)
        continue
      }
      
      await prisma.riskMitigationStrategy.update({
        where: { strategyId: strategy.strategyId },
        data: strategy.updates
      })
      
      updated++
      console.log(`✅ Updated: ${strategy.strategyId}`)
      
    } catch (error) {
      console.error(`❌ Error updating ${strategy.strategyId}:`, error.message)
    }
  }
  
  console.log(`\n🎉 Added multilingual content to ${updated} strategies!`)
  
  await prisma.$disconnect()
}

main().catch(console.error)


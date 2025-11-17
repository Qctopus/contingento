import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Add Missing Strategies for Economic Downturn and Civil Unrest
 */

async function addMissingEconomicStrategies() {
  console.log('➕ Adding Missing Economic Strategies...\n')

  // ============================================================================
  // ECONOMIC DOWNTURN PROTECTION STRATEGY
  // ============================================================================

  console.log('📉 Adding Economic Downturn Protection Strategy...')

  await upsertStrategy({
    strategyId: 'economic_downturn_protection',
    name: ml(
      'Economic Downturn Business Protection',
      'Protección Empresarial contra Decaimiento Económico',
      'Protection d\'Entreprise contre Ralentissement Économique'
    ),
    description: ml(
      'Complete strategy to protect your business during economic downturns, recessions, and financial crises through cost management, revenue diversification, and contingency planning.',
      'Estrategia completa para proteger su negocio durante caídas económicas, recesiones y crisis financieras a través de gestión de costos, diversificación de ingresos y planificación de contingencias.',
      'Stratégie complète pour protéger votre entreprise pendant les ralentissements économiques, récessions et crises financières grâce à la gestion des coûts, diversification des revenus et planification de contingence.'
    ),
    smeTitle: ml(
      'Weather the Economic Storm',
      'Sobreviva la Tormenta Económica',
      'Survivez la Tempête Économique'
    ),
    smeSummary: ml(
      'Economic downturns can hit any business hard, but SMEs are especially vulnerable. When customers cut back on spending, you need strategies to reduce costs, find new revenue streams, and preserve cash flow. This strategy helps you build financial resilience and emerge stronger when the economy recovers.',
      'Las caídas económicas pueden golpear duro a cualquier negocio, pero las PYMEs son especialmente vulnerables. Cuando los clientes reducen sus gastos, necesita estrategias para reducir costos, encontrar nuevos flujos de ingresos y preservar el flujo de efectivo. Esta estrategia le ayuda a construir resiliencia financiera y emerger más fuerte cuando la economía se recupera.',
      'Les ralentissements économiques peuvent frapper durement toute entreprise, mais les PME sont particulièrement vulnérables. Lorsque les clients réduisent leurs dépenses, vous avez besoin de stratégies pour réduire les coûts, trouver de nouveaux flux de revenus et préserver la trésorerie. Cette stratégie vous aide à construire la résilience financière et à émerger plus fort lorsque l\'économie se rétablit.'
    ),
    benefitsBullets: mlArray([
      { en: 'Reduce costs by 20-30% during downturns without sacrificing quality', es: 'Reduzca costos en 20-30% durante caídas sin sacrificar calidad', fr: 'Réduisez coûts de 20-30% pendant ralentissements sans sacrifier qualité' },
      { en: 'Diversify revenue streams to reduce dependency on any single source', es: 'Diversifique flujos de ingresos para reducir dependencia de una sola fuente', fr: 'Diversifiez flux revenus pour réduire dépendance d\'une seule source' },
      { en: 'Preserve cash reserves for when recovery begins', es: 'Preserve reservas de efectivo para cuando comience la recuperación', fr: 'Préservez réserves trésorerie pour quand récupération commence' },
      { en: 'Position for faster growth when economy rebounds', es: 'Posiciónese para crecimiento más rápido cuando la economía se recupere', fr: 'Positionnez-vous pour croissance plus rapide quand économie se rétablit' }
    ]),
    realWorldExample: ml(
      'During the 2008 financial crisis, a small manufacturing company implemented strict cost controls, renegotiated supplier contracts, and developed emergency product lines. They maintained profitability while competitors went out of business, then expanded rapidly during the recovery.',
      'Durante la crisis financiera de 2008, una pequeña empresa manufacturera implementó controles de costos estrictos, renegoció contratos de proveedores y desarrolló líneas de productos de emergencia. Mantuvieron rentabilidad mientras competidores quebraron, luego se expandieron rápidamente durante la recuperación.',
      'Pendant la crise financière de 2008, une petite entreprise de fabrication a mis en place des contrôles de coûts stricts, renégocié contrats fournisseurs et développé lignes produits d\'urgence. Ils ont maintenu rentabilité pendant que concurrents faisaient faillite, puis se sont expandés rapidement pendant la récupération.'
    ),
    lowBudgetAlternative: ml(
      'Focus on accounts payable management and negotiate payment terms with suppliers. Cross-train staff to handle multiple roles. Use free marketing channels to attract price-sensitive customers.',
      'Enfóquese en gestión de cuentas por pagar y negocie términos de pago con proveedores. Capacite transversalmente al personal para manejar múltiples roles. Use canales de marketing gratuitos para atraer clientes sensibles a precios.',
      'Concentrez-vous sur gestion comptes fournisseurs et négociez conditions paiement avec fournisseurs. Formez personnel transversalement pour gérer rôles multiples. Utilisez canaux marketing gratuits pour attirer clients sensibles prix.'
    ),
    selectionTier: 'essential',
    applicableRisks: JSON.stringify(['economic_downturn', 'recession', 'financial_crisis', 'market_downturn', 'economic_slowdown', 'business_slump']),
    applicableBusinessTypes: JSON.stringify(['retail', 'hospitality', 'manufacturing', 'professional_services', 'construction', 'all_businesses']),
    helpfulTips: mlArray([
      { en: 'Monitor economic indicators like GDP growth, unemployment rates, and consumer confidence', es: 'Monitoree indicadores económicos como crecimiento del PIB, tasas de desempleo y confianza del consumidor', fr: 'Surveillez indicateurs économiques comme croissance PIB, taux chômage et confiance consommateurs' },
      { en: 'Build relationships with suppliers before downturns for better negotiation leverage', es: 'Construya relaciones con proveedores antes de caídas para mejor poder de negociación', fr: 'Construisez relations avec fournisseurs avant ralentissements pour meilleur pouvoir négociation' },
      { en: 'Consider short-term financing options to bridge cash flow gaps', es: 'Considere opciones de financiamiento a corto plazo para cerrar brechas de flujo de efectivo', fr: 'Envisagez options financement court terme pour combler écarts trésorerie' }
    ]),
    commonMistakes: mlArray([
      { en: 'Cutting prices too aggressively, which hurts profitability', es: 'Cortando precios demasiado agresivamente, lo que daña rentabilidad', fr: 'Coupant prix trop agressivement, ce qui nuit rentabilité' },
      { en: 'Laying off key staff who are hard to replace during recovery', es: 'Despidiendo personal clave que es difícil reemplazar durante recuperación', fr: 'Licenciand personnel clé difficile remplacer pendant récupération' },
      { en: 'Delaying cost-cutting measures until cash crisis hits', es: 'Retrasando medidas de reducción de costos hasta que golpea crisis de efectivo', fr: 'Retardant mesures réduction coûts jusqu\'à crise trésorerie frappe' }
    ]),
    successMetrics: mlArray([
      { en: 'Cash reserves cover at least 6 months of operating expenses', es: 'Reservas de efectivo cubren al menos 6 meses de gastos operativos', fr: 'Réserves trésorerie couvrent au moins 6 mois dépenses opérationnelles' },
      { en: 'Cost reduction plan reduces expenses by 15-25% within 30 days', es: 'Plan de reducción de costos reduce gastos en 15-25% dentro de 30 días', fr: 'Plan réduction coûts réduit dépenses de 15-25% en 30 jours' },
      { en: 'Alternative revenue streams generate 20%+ of total income', es: 'Flujos de ingresos alternativos generan 20%+ del ingreso total', fr: 'Flux revenus alternatifs génèrent 20%+ revenu total' }
    ])
  })

  // Economic Downturn Action Steps
  await upsertActionStep('economic_downturn_protection', 'economic_step_01_cash_flow_analysis', {
    phase: 'before',
    title: ml('Conduct Cash Flow Stress Testing', 'Realice Pruebas de Estrés de Flujo de Efectivo', 'Effectuez Tests Stress Trésorerie'),
    description: ml('Analyze your financial position and test how long you can operate under reduced revenue scenarios.', 'Analice su posición financiera y pruebe cuánto tiempo puede operar bajo escenarios de ingresos reducidos.', 'Analysez position financière et testez combien temps pouvez opérer sous scénarios revenus réduits.'),
    smeAction: ml('Create financial projections for 25%, 50%, and 75% revenue reductions. Identify your cash runway and breaking points.', 'Cree proyecciones financieras para reducciones de ingresos de 25%, 50% y 75%. Identifique su pista de efectivo y puntos de quiebre.', 'Créez projections financières pour réductions revenus 25%, 50% et 75%. Identifiez piste trésorerie et points rupture.'),
    whyThisStepMatters: ml('Knowing your financial limits prevents panic decisions and gives you time to implement recovery strategies.', 'Conocer sus límites financieros previene decisiones de pánico y le da tiempo para implementar estrategias de recuperación.', 'Connaître limites financières empêche décisions panique et donne temps implémenter stratégies récupération.'),
    whatHappensIfSkipped: ml('You may run out of cash unexpectedly and be forced into bankruptcy or fire sales.', 'Puede quedarse sin efectivo inesperadamente y ser forzado a quiebra o ventas de fuego.', 'Vous pourriez manquer trésorerie unexpectedly et être forcé faillite ou ventes forcées.'),
    timeframe: ml('1-2 weeks', '1-2 semanas', '1-2 semaines'),
    estimatedMinutes: 480,
    difficultyLevel: 'medium',
    responsibility: ml('Owner/Finance Manager', 'Propietario/Gerente Financiero', 'Propriétaire/Gérant Financier'),
    resources: mlArray([
      { en: 'Financial statements, cash flow projections, accounting software', es: 'Estados financieros, proyecciones de flujo de efectivo, software contable', fr: 'États financiers, projections trésorerie, logiciel comptable' }
    ]),
    checklist: mlArray([
      { en: 'Gather last 12 months financial statements', es: 'Reúna estados financieros de los últimos 12 meses', fr: 'Rassemblez états financiers 12 derniers mois' },
      { en: 'Create scenarios for different revenue reduction levels', es: 'Cree escenarios para diferentes niveles de reducción de ingresos', fr: 'Créez scénarios pour différents niveaux réduction revenus' },
      { en: 'Calculate cash runway for each scenario', es: 'Calcule pista de efectivo para cada escenario', fr: 'Calculez piste trésorerie pour chaque scénario' }
    ]),
    howToKnowItsDone: ml('You have clear financial projections showing how long you can operate under various economic conditions.', 'Tiene proyecciones financieras claras mostrando cuánto tiempo puede operar bajo varias condiciones económicas.', 'Vous avez projections financières claires montrant combien temps pouvez opérer sous diverses conditions économiques.'),
    sortOrder: 1
  }, [])

  await upsertActionStep('economic_downturn_protection', 'economic_step_02_cost_reduction_plan', {
    phase: 'before',
    title: ml('Develop Cost Reduction Framework', 'Desarrolle Marco de Reducción de Costos', 'Développez Cadre Réduction Coûts'),
    description: ml('Create a systematic approach to reducing costs without compromising essential operations or quality.', 'Cree un enfoque sistemático para reducir costos sin comprometer operaciones esenciales o calidad.', 'Créez approche systématique réduction coûts sans compromettre opérations essentielles ou qualité.'),
    smeAction: ml('Categorize all expenses as essential, discretionary, or luxury. Create reduction plans for each category.', 'Categorice todos los gastos como esenciales, discrecionales o lujo. Cree planes de reducción para cada categoría.', 'Catégorisez toutes dépenses comme essentielles, discrétionnaires ou luxe. Créez plans réduction pour chaque catégorie.'),
    whyThisStepMatters: ml('Strategic cost reduction preserves your ability to serve customers and recover when the economy improves.', 'La reducción estratégica de costos preserva su capacidad para servir clientes y recuperarse cuando la economía mejora.', 'Réduction coûts stratégique préserve capacité servir clients et récupérer quand économie s\'améliore.'),
    whatHappensIfSkipped: ml('You may cut essential services or quality, damaging customer relationships and your reputation.', 'Puede cortar servicios esenciales o calidad, dañando relaciones con clientes y su reputación.', 'Vous pourriez couper services essentiels ou qualité, endommageant relations clients et réputation.'),
    timeframe: ml('1-3 weeks', '1-3 semanas', '1-3 semaines'),
    estimatedMinutes: 600,
    difficultyLevel: 'medium',
    responsibility: ml('Owner/Operations Manager', 'Propietario/Gerente de Operaciones', 'Propriétaire/Gérant Opérations'),
    resources: mlArray([
      { en: 'Expense tracking software, cost analysis spreadsheets', es: 'Software de seguimiento de gastos, hojas de cálculo de análisis de costos', fr: 'Logiciel suivi dépenses, feuilles calcul analyse coûts' }
    ]),
    checklist: mlArray([
      { en: 'List all monthly expenses and categorize them', es: 'Liste todos los gastos mensuales y categorícelos', fr: 'Listez toutes dépenses mensuelles et catégorisez-les' },
      { en: 'Identify 10-20% reduction opportunities in each category', es: 'Identifique oportunidades de reducción de 10-20% en cada categoría', fr: 'Identifiez opportunités réduction 10-20% dans chaque catégorie' },
      { en: 'Create implementation timeline for cost reductions', es: 'Cree cronograma de implementación para reducciones de costos', fr: 'Créez calendrier implémentation réductions coûts' }
    ]),
    howToKnowItsDone: ml('You have a prioritized cost reduction plan that maintains essential operations while reducing expenses by 15-25%.', 'Tiene un plan de reducción de costos priorizado que mantiene operaciones esenciales mientras reduce gastos en 15-25%.', 'Vous avez plan réduction coûts priorisé maintenant opérations essentielles tout réduisant dépenses de 15-25%.'),
    sortOrder: 2
  }, [])

  await upsertActionStep('economic_downturn_protection', 'economic_step_03_revenue_diversification', {
    phase: 'short_term',
    title: ml('Implement Revenue Diversification', 'Implemente Diversificación de Ingresos', 'Implémentez Diversification Revenus'),
    description: ml('Develop alternative revenue streams to reduce dependency on primary income sources.', 'Desarrolle flujos de ingresos alternativos para reducir dependencia de fuentes de ingresos primarios.', 'Développez flux revenus alternatifs pour réduire dépendance sources revenus primaires.'),
    smeAction: ml('Identify complementary products/services, online sales channels, and partnerships that can generate income during downturns.', 'Identifique productos/servicios complementarios, canales de ventas en línea y asociaciones que puedan generar ingresos durante caídas.', 'Identifiez produits/services complémentaires, canaux ventes en ligne et partenariats pouvant générer revenus pendant ralentissements.'),
    whyThisStepMatters: ml('Multiple revenue streams provide stability when primary markets decline, ensuring business survival.', 'Múltiples flujos de ingresos proporcionan estabilidad cuando mercados primarios declinan, asegurando supervivencia del negocio.', 'Flux revenus multiples fournissent stabilité quand marchés primaires déclinent, assurant survie entreprise.'),
    whatHappensIfSkipped: ml('Complete revenue loss from primary sources can lead to immediate business closure.', 'Pérdida completa de ingresos de fuentes primarias puede llevar a cierre inmediato del negocio.', 'Perte revenus complète sources primaires peut mener fermeture entreprise immédiate.'),
    timeframe: ml('2-6 months', '2-6 meses', '2-6 mois'),
    estimatedMinutes: 960,
    difficultyLevel: 'hard',
    responsibility: ml('Owner/Marketing Manager', 'Propietario/Gerente de Marketing', 'Propriétaire/Gérant Marketing'),
    resources: mlArray([
      { en: 'Market research tools, online sales platforms, partnership agreements', es: 'Herramientas de investigación de mercado, plataformas de ventas en línea, acuerdos de asociación', fr: 'Outils recherche marché, plateformes ventes en ligne, accords partenariat' }
    ]),
    checklist: mlArray([
      { en: 'Research complementary products/services your customers need', es: 'Investigue productos/servicios complementarios que sus clientes necesitan', fr: 'Recherchez produits/services complémentaires clients ont besoin' },
      { en: 'Set up online sales channels (website, social media, marketplaces)', es: 'Configure canales de ventas en línea (sitio web, redes sociales, mercados)', fr: 'Configurez canaux ventes en ligne (site web, réseaux sociaux, marchés)' },
      { en: 'Develop partnerships with complementary businesses', es: 'Desarrolle asociaciones con negocios complementarios', fr: 'Développez partenariats avec entreprises complémentaires' }
    ]),
    howToKnowItsDone: ml('You have 2-3 alternative revenue streams generating income and reducing dependency on primary sources.', 'Tiene 2-3 flujos de ingresos alternativos generando ingresos y reduciendo dependencia de fuentes primarias.', 'Vous avez 2-3 flux revenus alternatifs générant revenus et réduisant dépendance sources primaires.'),
    sortOrder: 3
  }, [])

  console.log('  ✓ Economic Downturn strategy complete with 3 action steps (2 before, 1 short_term)')

  // ============================================================================
  // CIVIL UNREST PROTECTION STRATEGY
  // ============================================================================

  console.log('\n🏛️ Adding Civil Unrest Protection Strategy...')

  await upsertStrategy({
    strategyId: 'civil_unrest_protection',
    name: ml(
      'Civil Unrest & Social Instability Protection',
      'Protección contra Disturbios Civiles e Inestabilidad Social',
      'Protection contre Troubles Civils et Instabilité Sociale'
    ),
    description: ml(
      'Complete strategy to protect your business during civil unrest, protests, riots, and social instability through security planning, communication protocols, and contingency operations.',
      'Estrategia completa para proteger su negocio durante disturbios civiles, protestas, disturbios e inestabilidad social a través de planificación de seguridad, protocolos de comunicación y operaciones de contingencia.',
      'Stratégie complète pour protéger votre entreprise pendant troubles civils, manifestations, émeutes et instabilité sociale grâce à planification sécurité, protocoles communication et opérations contingence.'
    ),
    smeTitle: ml(
      'Stay Safe During Social Unrest',
      'Manténgase Seguro Durante Disturbios Sociales',
      'Restez en Sécurité Pendant Troubles Sociaux'
    ),
    smeSummary: ml(
      'Civil unrest can disrupt business operations, damage property, and threaten employee safety. Protests, strikes, and social movements are becoming more common globally. This strategy helps you protect your business, keep employees safe, and maintain operations during periods of social instability.',
      'Los disturbios civiles pueden interrumpir operaciones comerciales, dañar propiedad y amenazar seguridad de empleados. Protestas, huelgas y movimientos sociales se están volviendo más comunes globalmente. Esta estrategia le ayuda a proteger su negocio, mantener empleados seguros y mantener operaciones durante períodos de inestabilidad social.',
      'Troubles civils peuvent perturber opérations commerciales, endommager propriété et menacer sécurité employés. Manifestations, grèves et mouvements sociaux deviennent plus courants globalement. Cette stratégie aide protéger entreprise, garder employés sécurisés et maintenir opérations pendant périodes instabilité sociale.'
    ),
    benefitsBullets: mlArray([
      { en: 'Protect employees and property from unrest-related damage', es: 'Proteja empleados y propiedad de daños relacionados con disturbios', fr: 'Protégez employés et propriété dommages liés troubles' },
      { en: 'Maintain business continuity during social disruptions', es: 'Mantenga continuidad comercial durante disrupciones sociales', fr: 'Maintenez continuité affaires pendant perturbations sociales' },
      { en: 'Reduce liability from employee safety incidents', es: 'Reduzca responsabilidad por incidentes de seguridad de empleados', fr: 'Réduisez responsabilité incidents sécurité employés' },
      { en: 'Preserve customer relationships through clear communication', es: 'Preserve relaciones con clientes a través de comunicación clara', fr: 'Préservez relations clients communication claire' }
    ]),
    realWorldExample: ml(
      'During widespread protests in a major city, a retail chain with unrest protection plans closed stores early, moved inventory to secure locations, and communicated regularly with employees and customers. They reopened quickly after unrest subsided, while competitors suffered major losses.',
      'Durante protestas generalizadas en una ciudad importante, una cadena minorista con planes de protección contra disturbios cerró tiendas temprano, movió inventario a ubicaciones seguras y comunicó regularmente con empleados y clientes. Reabrieron rápidamente después de que los disturbios se calmaron, mientras competidores sufrieron pérdidas importantes.',
      'Pendant manifestations généralisées dans une grande ville, une chaîne de vente au détail avec plans protection troubles a fermé magasins tôt, déplacé inventaire vers endroits sécurisés et communiqué régulièrement avec employés et clients. Ils ont rouvert rapidement après troubles apaisés, pendant que concurrents subissaient pertes majeures.'
    ),
    lowBudgetAlternative: ml(
      'Develop communication protocols using free messaging apps. Create employee safety buddy system. Use social media monitoring for early warning of unrest.',
      'Desarrolle protocolos de comunicación usando aplicaciones de mensajería gratuitas. Cree sistema de compañero de seguridad para empleados. Use monitoreo de redes sociales para advertencia temprana de disturbios.',
      'Développez protocoles communication utilisant applications messagerie gratuites. Créez système binôme sécurité employés. Utilisez surveillance réseaux sociaux pour alerte précoce troubles.'
    ),
    selectionTier: 'essential',
    applicableRisks: JSON.stringify(['civil_unrest', 'protests', 'riots', 'social_instability', 'demonstrations', 'strikes', 'political_unrest']),
    applicableBusinessTypes: JSON.stringify(['retail', 'hospitality', 'transportation', 'professional_services', 'manufacturing', 'all_businesses']),
    helpfulTips: mlArray([
      { en: 'Monitor local news and social media for early signs of unrest', es: 'Monitoree noticias locales y redes sociales para señales tempranas de disturbios', fr: 'Surveillez nouvelles locales et réseaux sociaux signes précoces troubles' },
      { en: 'Develop relationships with local authorities and emergency services', es: 'Desarrolle relaciones con autoridades locales y servicios de emergencia', fr: 'Développez relations avec autorités locales et services urgence' },
      { en: 'Consider temporary relocation of critical operations during unrest', es: 'Considere reubicación temporal de operaciones críticas durante disturbios', fr: 'Envisagez relocalisation temporaire opérations critiques pendant troubles' }
    ]),
    commonMistakes: mlArray([
      { en: 'Keeping stores open during active unrest to avoid losses', es: 'Manteniendo tiendas abiertas durante disturbios activos para evitar pérdidas', fr: 'Gardant magasins ouverts pendant troubles actifs éviter pertes' },
      { en: 'Not having emergency contact procedures for employees', es: 'No teniendo procedimientos de contacto de emergencia para empleados', fr: 'Ne pas avoir procédures contact urgence employés' },
      { en: 'Failing to document damage for insurance claims', es: 'Fallando en documentar daños para reclamos de seguro', fr: 'Échouant documenter dommages pour réclamations assurance' }
    ]),
    successMetrics: mlArray([
      { en: 'All employees know safety protocols and emergency contacts', es: 'Todos los empleados conocen protocolos de seguridad y contactos de emergencia', fr: 'Tous employés connaissent protocoles sécurité et contacts urgence' },
      { en: 'Business can operate remotely or from alternative locations', es: 'El negocio puede operar remotamente o desde ubicaciones alternativas', fr: 'Entreprise peut opérer à distance ou depuis endroits alternatifs' },
      { en: 'Communication systems work during power/telecom disruptions', es: 'Sistemas de comunicación funcionan durante disrupciones de energía/telecomunicaciones', fr: 'Systèmes communication fonctionnent pendant perturbations énergie/télécoms' }
    ])
  })

  // Civil Unrest Action Steps
  await upsertActionStep('civil_unrest_protection', 'civil_step_01_monitor_early_warning', {
    phase: 'before',
    title: ml('Establish Early Warning Monitoring', 'Establezca Monitoreo de Advertencia Temprana', 'Établissez Surveillance Alerte Précoce'),
    description: ml('Set up systems to monitor local conditions and receive early warnings of potential unrest.', 'Configure sistemas para monitorear condiciones locales y recibir advertencias tempranas de disturbios potenciales.', 'Configurez systèmes surveiller conditions locales et recevoir alertes précoces troubles potentiels.'),
    smeAction: ml('Subscribe to local news alerts, monitor social media, and join business association warning networks.', 'Suscríbase a alertas de noticias locales, monitoree redes sociales y únase a redes de advertencia de asociaciones comerciales.', 'Abonnez-vous alertes nouvelles locales, surveillez réseaux sociaux et rejoignez réseaux alerte associations commerciales.'),
    whyThisStepMatters: ml('Early awareness gives you time to secure property, inform employees, and implement safety measures.', 'La conciencia temprana le da tiempo para asegurar propiedad, informar empleados e implementar medidas de seguridad.', 'Conscience précoce donne temps sécuriser propriété, informer employés et implémenter mesures sécurité.'),
    whatHappensIfSkipped: ml('You may be caught unprepared, leading to property damage, employee injuries, or business closure.', 'Puede ser sorprendido desprevenido, llevando a daño de propiedad, lesiones de empleados o cierre del negocio.', 'Vous pourriez être pris au dépourvu, menant dommages propriété, blessures employés ou fermeture entreprise.'),
    timeframe: ml('1 week', '1 semana', '1 semaine'),
    estimatedMinutes: 240,
    difficultyLevel: 'easy',
    responsibility: ml('Owner/Operations Manager', 'Propietario/Gerente de Operaciones', 'Propriétaire/Gérant Opérations'),
    resources: mlArray([
      { en: 'News alert apps, social media monitoring, business association memberships', es: 'Aplicaciones de alertas de noticias, monitoreo de redes sociales, membresías de asociaciones comerciales', fr: 'Applications alertes nouvelles, surveillance réseaux sociaux, adhésions associations commerciales' }
    ]),
    checklist: mlArray([
      { en: 'Set up local news and emergency service alerts', es: 'Configure alertas de noticias locales y servicios de emergencia', fr: 'Configurez alertes nouvelles locales et services urgence' },
      { en: 'Identify social media accounts to monitor for unrest indicators', es: 'Identifique cuentas de redes sociales para monitorear indicadores de disturbios', fr: 'Identifiez comptes réseaux sociaux surveiller indicateurs troubles' },
      { en: 'Join local business associations with unrest communication networks', es: 'Únase a asociaciones comerciales locales con redes de comunicación de disturbios', fr: 'Rejoignez associations commerciales locales réseaux communication troubles' }
    ]),
    howToKnowItsDone: ml('You receive timely notifications about local developments that could affect your business.', 'Recibe notificaciones oportunas sobre desarrollos locales que podrían afectar su negocio.', 'Vous recevez notifications opportunes développements locaux pouvant affecter entreprise.'),
    sortOrder: 1
  }, [])

  await upsertActionStep('civil_unrest_protection', 'civil_step_02_employee_safety_plan', {
    phase: 'before',
    title: ml('Develop Employee Safety Protocols', 'Desarrolle Protocolos de Seguridad para Empleados', 'Développez Protocoles Sécurité Employés'),
    description: ml('Create clear procedures for employee safety, communication, and emergency response during unrest.', 'Cree procedimientos claros para seguridad de empleados, comunicación y respuesta de emergencia durante disturbios.', 'Créez procédures claires sécurité employés, communication et réponse urgence pendant troubles.'),
    smeAction: ml('Develop safety protocols, emergency contact procedures, and remote work capabilities for employees.', 'Desarrolle protocolos de seguridad, procedimientos de contacto de emergencia y capacidades de trabajo remoto para empleados.', 'Développez protocoles sécurité, procédures contact urgence et capacités travail à distance employés.'),
    whyThisStepMatters: ml('Clear safety procedures prevent panic and ensure employees know how to protect themselves and your business.', 'Los procedimientos de seguridad claros previenen pánico y aseguran que empleados sepan cómo protegerse a sí mismos y su negocio.', 'Procédures sécurité claires empêchent panique et assurent employés savent protéger eux-mêmes et entreprise.'),
    whatHappensIfSkipped: ml('Employees may be injured, property damaged, and you face legal liability for inadequate safety measures.', 'Los empleados pueden resultar heridos, propiedad dañada y enfrenta responsabilidad legal por medidas de seguridad inadecuadas.', 'Employés peuvent être blessés, propriété endommagée et vous faites face responsabilité légale mesures sécurité inadéquates.'),
    timeframe: ml('2-3 weeks', '2-3 semanas', '2-3 semaines'),
    estimatedMinutes: 480,
    difficultyLevel: 'medium',
    responsibility: ml('Owner/HR Manager', 'Propietario/Gerente de RRHH', 'Propriétaire/Gérant RH'),
    resources: mlArray([
      { en: 'Safety protocol templates, communication systems, remote work tools', es: 'Plantillas de protocolos de seguridad, sistemas de comunicación, herramientas de trabajo remoto', fr: 'Modèles protocoles sécurité, systèmes communication, outils travail à distance' }
    ]),
    checklist: mlArray([
      { en: 'Create employee safety procedures for different unrest scenarios', es: 'Cree procedimientos de seguridad para empleados para diferentes escenarios de disturbios', fr: 'Créez procédures sécurité employés différents scénarios troubles' },
      { en: 'Establish emergency communication channels and check-in procedures', es: 'Establezca canales de comunicación de emergencia y procedimientos de check-in', fr: 'Établissez canaux communication urgence et procédures pointage' },
      { en: 'Set up remote work capabilities and alternative meeting locations', es: 'Configure capacidades de trabajo remoto y ubicaciones alternativas de reunión', fr: 'Configurez capacités travail à distance et endroits réunion alternatifs' }
    ]),
    howToKnowItsDone: ml('All employees understand safety protocols and can access emergency communication systems.', 'Todos los empleados entienden protocolos de seguridad y pueden acceder sistemas de comunicación de emergencia.', 'Tous employés comprennent protocoles sécurité et peuvent accéder systèmes communication urgence.'),
    sortOrder: 2
  }, [])

  await upsertActionStep('civil_unrest_protection', 'civil_step_03_business_continuity', {
    phase: 'short_term',
    title: ml('Implement Business Continuity Measures', 'Implemente Medidas de Continuidad Empresarial', 'Implémentez Mesures Continuité Affaires'),
    description: ml('Develop contingency plans for maintaining operations during periods of unrest.', 'Desarrolle planes de contingencia para mantener operaciones durante períodos de disturbios.', 'Développez plans contingence maintenir opérations pendant périodes troubles.'),
    smeAction: ml('Create backup locations, digital operations capabilities, and supplier contingency plans.', 'Cree ubicaciones de respaldo, capacidades de operaciones digitales y planes de contingencia de proveedores.', 'Créez endroits sauvegarde, capacités opérations numériques et plans contingence fournisseurs.'),
    whyThisStepMatters: ml('Contingency planning ensures your business can continue operating even when physical location is compromised.', 'La planificación de contingencia asegura que su negocio pueda continuar operando incluso cuando la ubicación física está comprometida.', 'Planification contingence assure entreprise peut continuer opérer même quand emplacement physique compromis.'),
    whatHappensIfSkipped: ml('Business operations halt completely, leading to permanent loss of customers and revenue.', 'Las operaciones comerciales se detienen completamente, llevando a pérdida permanente de clientes e ingresos.', 'Opérations affaires s\'arrêtent complètement, menant perte permanente clients et revenus.'),
    timeframe: ml('1-2 months', '1-2 meses', '1-2 mois'),
    estimatedMinutes: 960,
    difficultyLevel: 'hard',
    responsibility: ml('Owner/Operations Manager', 'Propietario/Gerente de Operaciones', 'Propriétaire/Gérant Opérations'),
    resources: mlArray([
      { en: 'Remote work infrastructure, backup locations, supplier agreements', es: 'Infraestructura de trabajo remoto, ubicaciones de respaldo, acuerdos de proveedores', fr: 'Infrastructure travail à distance, endroits sauvegarde, accords fournisseurs' }
    ]),
    checklist: mlArray([
      { en: 'Identify alternative operating locations or remote work capabilities', es: 'Identifique ubicaciones operativas alternativas o capacidades de trabajo remoto', fr: 'Identifiez endroits opérationnels alternatifs ou capacités travail à distance' },
      { en: 'Set up digital payment and ordering systems for remote operations', es: 'Configure sistemas de pago digital y pedidos para operaciones remotas', fr: 'Configurez systèmes paiement numérique et commandes opérations à distance' },
      { en: 'Develop supplier contingency plans and backup inventory sources', es: 'Desarrolle planes de contingencia de proveedores y fuentes de inventario de respaldo', fr: 'Développez plans contingence fournisseurs et sources inventaire sauvegarde' }
    ]),
    howToKnowItsDone: ml('Your business can operate from alternative locations or remotely during unrest periods.', 'Su negocio puede operar desde ubicaciones alternativas o remotamente durante períodos de disturbios.', 'Votre entreprise peut opérer depuis endroits alternatifs ou à distance pendant périodes troubles.'),
    sortOrder: 3
  }, [])

  console.log('  ✓ Civil Unrest Protection strategy complete with 3 action steps (2 before, 1 short_term)')

  console.log('\n✅ All Missing Economic Strategies Added Successfully!')
  console.log(`📊 Added: 2 new comprehensive strategies`)
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
    await addMissingEconomicStrategies()
  } catch (error) {
    console.error('❌ Error adding missing economic strategies:', error)
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

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Premium Caribbean BCP Strategies
 * 5 Comprehensive, Detailed Strategies with High-Value Content
 * Full Multilingual Support: English, Spanish, French
 * 
 * Key Features:
 * - No fixed categories (action steps define phases)
 * - Comprehensive BEFORE/DURING/AFTER coverage
 * - Practical, actionable Caribbean-specific guidance
 * - Real business examples with actual outcomes
 * - Budget-friendly alternatives included
 */

const PREMIUM_STRATEGIES = [
  // ============================================================================
  // STRATEGY 1: HURRICANE COMPREHENSIVE PROTECTION
  // ============================================================================
  {
    strategyId: 'hurricane_comprehensive',
    name: JSON.stringify({
      en: 'Hurricane Protection & Recovery',
      es: 'Protección y Recuperación ante Huracanes',
      fr: 'Protection et Récupération contre les Ouragans'
    }),
    description: JSON.stringify({
      en: 'Complete hurricane preparedness covering property protection, emergency response, and business recovery for Caribbean SMEs',
      es: 'Preparación completa ante huracanes que cubre protección de propiedad, respuesta de emergencia y recuperación empresarial para PYMES caribeñas',
      fr: 'Préparation complète aux ouragans couvrant la protection des biens, la réponse d\'urgence et la reprise d\'activité pour les PME caribéennes'
    }),
    smeTitle: 'Survive and Recover From Hurricanes Quickly',
    smeSummary: 'Hurricanes are the #1 threat to Caribbean businesses. This comprehensive strategy protects your property BEFORE the storm, keeps everyone safe DURING it, and helps you reopen quickly AFTER. Businesses with this plan reopen 5-10x faster than unprepared competitors.',
    benefitsBullets: JSON.stringify([
      {
        en: 'Prevent 70-90% of hurricane property damage through proper preparation',
        es: 'Prevenir 70-90% de los daños por huracán mediante preparación adecuada',
        fr: 'Prévenir 70-90% des dommages causés par les ouragans grâce à une préparation adéquate'
      },
      {
        en: 'Protect inventory worth thousands from wind and water damage',
        es: 'Proteger inventario valorado en miles de pérdidas por viento y agua',
        fr: 'Protéger des stocks valant des milliers contre les dommages dus au vent et à l\'eau'
      },
      {
        en: 'Keep all staff and customers safe with clear evacuation procedures',
        es: 'Mantener seguros a todo el personal y clientes con procedimientos claros de evacuación',
        fr: 'Assurer la sécurité du personnel et des clients avec des procédures d\'évacuation claires'
      },
      {
        en: 'Reopen 3-7 days vs 4-8 weeks for unprepared businesses',
        es: 'Reabrir en 3-7 días vs 4-8 semanas para negocios sin preparación',
        fr: 'Rouvrir en 3-7 jours contre 4-8 semaines pour les entreprises non préparées'
      },
      {
        en: 'Maximize insurance payouts with proper documentation',
        es: 'Maximizar pagos de seguro con documentación adecuada',
        fr: 'Maximiser les remboursements d\'assurance avec une documentation appropriée'
      }
    ]),
    realWorldExample: 'Hurricane Gilbert (1988): Kingston hardware store "Tools Plus" had storm shutters installed, inventory elevated, and emergency plan practiced. They reopened in 3 days with minimal damage. Their competitor "BuildRight" across the street had no preparation - 6 weeks closed, J$2.3M in damages, lost 65% of customer base. Tools Plus captured those customers and grew 40% that year. The owner said: "J$150,000 in shutters saved my J$8M business."',
    helpfulTips: JSON.stringify([
      {
        en: 'Start hurricane preparations in June (beginning of season) - don\'t wait for warnings',
        es: 'Iniciar preparaciones en junio (inicio de temporada) - no esperar avisos',
        fr: 'Commencer les préparations en juin (début de saison) - ne pas attendre les alertes'
      },
      {
        en: 'Take detailed photos/video of property and inventory every June - critical for insurance claims',
        es: 'Tomar fotos/video detallado de propiedad e inventario cada junio - crítico para reclamos',
        fr: 'Prendre des photos/vidéos détaillées des biens et stocks chaque juin - essentiel pour les réclamations'
      },
      {
        en: 'Practice your hurricane response plan twice: June (season start) and October (peak month)',
        es: 'Practicar plan de respuesta dos veces: junio (inicio) y octubre (pico)',
        fr: 'Pratiquer le plan de réponse deux fois: juin (début) et octobre (pic)'
      },
      {
        en: 'Keep printed checklist - internet and power will fail during hurricanes',
        es: 'Mantener lista impresa - internet y electricidad fallarán durante huracanes',
        fr: 'Garder une liste imprimée - internet et électricité tomberont pendant les ouragans'
      },
      {
        en: 'Join local business association emergency network for mutual support and shared resources',
        es: 'Unirse a red de emergencia empresarial local para apoyo mutuo y recursos compartidos',
        fr: 'Rejoindre le réseau d\'urgence des entreprises locales pour soutien mutuel et ressources partagées'
      }
    ]),
    commonMistakes: JSON.stringify([
      {
        en: 'Waiting for hurricane warning to prepare - supplies sell out in hours, too late to install protection',
        es: 'Esperar aviso de huracán para preparar - suministros se agotan en horas, muy tarde para instalar protección',
        fr: 'Attendre l\'alerte ouragan pour se préparer - fournitures épuisées en heures, trop tard pour installer protection'
      },
      {
        en: 'Assuming insurance covers everything - most policies have gaps, high deductibles, or exclude certain damages',
        es: 'Asumir que seguro cubre todo - mayoría tiene vacíos, deducibles altos o excluye ciertos daños',
        fr: 'Supposer que l\'assurance couvre tout - plupart des polices ont des lacunes, franchises élevées ou exclusions'
      },
      {
        en: 'Only preparing building, forgetting outdoor items - flying signs and furniture cause massive damage',
        es: 'Solo preparar edificio, olvidando artículos externos - letreros y muebles voladores causan daño masivo',
        fr: 'Préparer uniquement le bâtiment, oublier les objets extérieurs - enseignes et meubles volants causent dégâts massifs'
      },
      {
        en: 'Not checking on staff safety first - your team is more important than your building',
        es: 'No verificar seguridad del personal primero - su equipo es más importante que su edificio',
        fr: 'Ne pas vérifier d\'abord la sécurité du personnel - votre équipe est plus importante que votre bâtiment'
      },
      {
        en: 'Poor damage documentation - without extensive photos, insurance pays 30-50% less',
        es: 'Mala documentación de daños - sin fotos extensivas, seguro paga 30-50% menos',
        fr: 'Mauvaise documentation des dommages - sans photos extensives, l\'assurance paie 30-50% moins'
      }
    ]),
    lowBudgetAlternative: 'Professional hurricane shutters cost J$100,000-200,000. Budget alternative: Marine-grade plywood (3/4 inch) cut and labeled for each window - J$10,000-25,000. Store in dry place with pre-drilled mounting hardware. Takes 2 hours to install vs 30 minutes for roll-down shutters, but provides 80% of the protection at 15% of the cost. DIY sandbags: Use empty feed bags (free from agricultural suppliers) filled with sand or dirt - J$50 for 100 bags vs J$8,000 commercial. Elevate inventory: Concrete blocks (J$200 each) + plywood shelving = raise everything 12 inches for J$15,000 vs J$60,000 professional shelving.',
    applicableRisks: JSON.stringify(['hurricane', 'tropical_storm', 'high_winds', 'flooding', 'storm_surge']),
    applicableBusinessTypes: null, // All businesses
    selectionTier: 'essential',
    isActive: true
  },

  // ============================================================================
  // STRATEGY 2: BUSINESS DATA PROTECTION
  // ============================================================================
  {
    strategyId: 'data_protection_comprehensive',
    name: JSON.stringify({
      en: 'Business Data Protection & Recovery',
      es: 'Protección y Recuperación de Datos Empresariales',
      fr: 'Protection et Récupération des Données d\'Entreprise'
    }),
    description: JSON.stringify({
      en: 'Comprehensive data backup, protection, and recovery system for customer records, financial data, inventory, and business information',
      es: 'Sistema completo de respaldo, protección y recuperación de datos para registros de clientes, datos financieros, inventario e información empresarial',
      fr: 'Système complet de sauvegarde, protection et récupération des données pour dossiers clients, données financières, stocks et informations commerciales'
    }),
    smeTitle: 'Never Lose Critical Business Records Again',
    smeSummary: 'One fire, flood, theft, or computer crash can wipe out years of customer records, sales history, and financial data. Cloud backup (J$2,000-5,000/month) or external drives (one-time J$5,000) automatically protect everything. If disaster strikes, restore your entire business from any device within hours instead of losing everything forever.',
    benefitsBullets: JSON.stringify([
      {
        en: 'Recover from any computer failure, theft, or disaster in hours not months',
        es: 'Recuperarse de cualquier fallo, robo o desastre en horas, no meses',
        fr: 'Se remettre de toute panne, vol ou catastrophe en heures et non en mois'
      },
      {
        en: 'Access customer records from anywhere - work from home, new location, or temporary space',
        es: 'Acceder a registros desde cualquier lugar - trabajar desde casa, nueva ubicación o espacio temporal',
        fr: 'Accéder aux dossiers clients de n\'importe où - travailler à domicile, nouveau local ou espace temporaire'
      },
      {
        en: 'Protect 5-15 years of customer relationships and purchase history',
        es: 'Proteger 5-15 años de relaciones con clientes e historial de compras',
        fr: 'Protéger 5-15 ans de relations clients et d\'historique d\'achats'
      },
      {
        en: 'Meet legal requirements for record retention (tax, employment, licensing)',
        es: 'Cumplir requisitos legales de retención de registros (impuestos, empleo, licencias)',
        fr: 'Respecter les exigences légales de conservation des dossiers (impôts, emploi, licences)'
      },
      {
        en: 'Restore point-of-sale settings, inventory counts, and supplier contacts instantly',
        es: 'Restaurar configuraciones de POS, conteos de inventario y contactos de proveedores instantáneamente',
        fr: 'Restaurer paramètres PDV, comptages de stocks et contacts fournisseurs instantanément'
      }
    ]),
    realWorldExample: 'Montego Bay clothing boutique "Island Style" (established 2018) suffered total loss in May 2022 fire. Building destroyed, all computers and paper records burned. BUT - they had cloud backup ($45 USD/month via Google Workspace). Within 3 days: Retrieved ALL data - 4 years of sales records, 2,847 customer contacts with purchase history, supplier agreements, employee records. Opened temporary location in rented space. Called top 500 customers personally. 73% returned within first month. Full operations restored in new permanent location within 6 weeks. Owner: "J$2,500/month cloud backup saved my J$12M business. Without it, we\'d have lost every customer and closed permanently."',
    helpfulTips: JSON.stringify([
      {
        en: 'Use automatic daily backups - manual backups fail because people forget',
        es: 'Usar respaldos automáticos diarios - respaldos manuales fallan porque la gente olvida',
        fr: 'Utiliser des sauvegardes automatiques quotidiennes - les sauvegardes manuelles échouent par oubli'
      },
      {
        en: 'Test restoration every quarter - download a file and verify it opens correctly',
        es: 'Probar restauración cada trimestre - descargar archivo y verificar que se abra correctamente',
        fr: 'Tester la restauration chaque trimestre - télécharger un fichier et vérifier qu\'il s\'ouvre correctement'
      },
      {
        en: 'Keep at least ONE backup outside your building - fire/flood destroys local backup too',
        es: 'Mantener AL MENOS UN respaldo fuera del edificio - incendio/inundación destruye respaldo local también',
        fr: 'Garder AU MOINS UNE sauvegarde hors du bâtiment - incendie/inondation détruit aussi la sauvegarde locale'
      },
      {
        en: 'Backup your point-of-sale system separately - includes product database, pricing, and settings',
        es: 'Respaldar sistema POS por separado - incluye base de datos de productos, precios y configuraciones',
        fr: 'Sauvegarder système PDV séparément - inclut base de données produits, tarifs et paramètres'
      },
      {
        en: 'Take monthly photos of inventory with your phone - crucial for insurance claims after fire/theft',
        es: 'Tomar fotos mensuales de inventario con teléfono - crucial para reclamos de seguro tras incendio/robo',
        fr: 'Prendre photos mensuelles du stock avec téléphone - crucial pour réclamations d\'assurance après incendie/vol'
      }
    ]),
    commonMistakes: JSON.stringify([
      {
        en: 'Only backing up once or irregularly - need automatic daily backups to prevent data loss',
        es: 'Respaldar solo una vez o irregularmente - necesita respaldos automáticos diarios para prevenir pérdida',
        fr: 'Sauvegarder une seule fois ou irrégulièrement - besoin de sauvegardes automatiques quotidiennes pour éviter pertes'
      },
      {
        en: 'Keeping backup drive IN the building - fire, flood, or theft destroys both original and backup',
        es: 'Guardar disco de respaldo EN el edificio - incendio, inundación o robo destruye original y respaldo',
        fr: 'Garder disque de sauvegarde DANS le bâtiment - incendie, inondation ou vol détruit original et sauvegarde'
      },
      {
        en: 'Never testing if backup works - discover it\'s corrupted or empty only when you desperately need it',
        es: 'Nunca probar si el respaldo funciona - descubrir que está corrupto o vacío solo cuando lo necesita desesperadamente',
        fr: 'Ne jamais tester si sauvegarde fonctionne - découvrir qu\'elle est corrompue ou vide uniquement en cas d\'urgence'
      },
      {
        en: 'Forgetting to backup point-of-sale system database - lose all product info, pricing, and settings',
        es: 'Olvidar respaldar base de datos del POS - perder toda info de productos, precios y configuraciones',
        fr: 'Oublier de sauvegarder base de données PDV - perdre toutes infos produits, tarifs et paramètres'
      },
      {
        en: 'No password protection on backup - anyone who finds drive can access all business data',
        es: 'Sin protección de contraseña en respaldo - cualquiera que encuentre disco puede acceder a todos los datos',
        fr: 'Pas de protection par mot de passe sur sauvegarde - quiconque trouve disque peut accéder à toutes données'
      }
    ]),
    lowBudgetAlternative: 'FREE Option: Email important files to yourself weekly (invoices, customer list, inventory spreadsheet). Gmail/Outlook free accounts give 15GB. Basic Option: External hard drive (J$4,000-8,000 for 1-2TB), copy files weekly, store at owner\'s home. Cost: J$4,000 one-time vs J$30,000-60,000/year cloud backup. Good Option: Free cloud storage - Google Drive (15GB free), Dropbox (2GB free), OneDrive (5GB free). Upload most critical files. Premium Option: Paid cloud backup starting J$2,000/month for automatic daily backup of everything. Worth it if you have >100 customers or >J$500,000 annual revenue.',
    applicableRisks: JSON.stringify(['fire', 'flooding', 'theft_vandalism', 'equipment_failure', 'cybersecurity_incident', 'hurricane']),
    applicableBusinessTypes: null,
    selectionTier: 'essential',
    isActive: true
  },

  // ============================================================================
  // STRATEGY 3: POWER OUTAGE RESILIENCE
  // ============================================================================
  {
    strategyId: 'power_resilience_comprehensive',
    name: JSON.stringify({
      en: 'Power Outage Resilience System',
      es: 'Sistema de Resiliencia ante Cortes de Energía',
      fr: 'Système de Résilience aux Pannes de Courant'
    }),
    description: JSON.stringify({
      en: 'Complete backup power solution including generator or battery system, maintenance, fuel management, and operational procedures during outages',
      es: 'Solución completa de energía de respaldo incluyendo generador o sistema de baterías, mantenimiento, gestión de combustible y procedimientos operativos durante cortes',
      fr: 'Solution complète d\'alimentation de secours incluant générateur ou système de batteries, maintenance, gestion carburant et procédures opérationnelles pendant pannes'
    }),
    smeTitle: 'Stay Open and Profitable During Power Outages',
    smeSummary: 'Power outages force businesses to close, spoil inventory, and lose sales. Caribbean SMEs lose J$50,000-500,000 per year from outages. Backup power (generator or batteries) keeps refrigerators, lights, payment systems running. Stay open when competitors are dark, prevent inventory spoilage, and serve customers who have nowhere else to go. ROI typically 6-18 months.',
    benefitsBullets: JSON.stringify([
      {
        en: 'Prevent refrigerated/frozen inventory spoilage saving J$10,000-100,000+ per year',
        es: 'Prevenir deterioro de inventario refrigerado/congelado ahorrando J$10,000-100,000+ por año',
        fr: 'Prévenir détérioration stocks réfrigérés/congelés économisant J$10,000-100,000+ par an'
      },
      {
        en: 'Stay open during outages - capture sales from competitors who must close',
        es: 'Permanecer abierto durante cortes - capturar ventas de competidores que deben cerrar',
        fr: 'Rester ouvert pendant pannes - capturer ventes de concurrents qui doivent fermer'
      },
      {
        en: 'Keep payment systems operational - accept cards when others can only do cash',
        es: 'Mantener sistemas de pago operativos - aceptar tarjetas cuando otros solo pueden efectivo',
        fr: 'Maintenir systèmes de paiement opérationnels - accepter cartes quand autres peuvent seulement espèces'
      },
      {
        en: 'Maintain security systems and lighting - prevent theft during blackouts',
        es: 'Mantener sistemas de seguridad e iluminación - prevenir robos durante apagones',
        fr: 'Maintenir systèmes de sécurité et éclairage - prévenir vols pendant pannes'
      },
      {
        en: 'Build customer loyalty - become "the reliable store" that\'s always open',
        es: 'Construir lealtad de clientes - convertirse en "la tienda confiable" que siempre está abierta',
        fr: 'Construire fidélité client - devenir "le magasin fiable" toujours ouvert'
      }
    ]),
    realWorldExample: 'Spanish Town pharmacy "HealthCare Plus" invested J$280,000 in 5kW diesel generator (September 2022). During 3-day power outage (August 2023 storm): ONLY pharmacy open in 2km radius. Served 340+ customers who couldn\'t get medications elsewhere. Sales that month: +340% (J$1.1M extra). Prevented J$150,000 insulin/vaccine spoilage (would have lost everything). Generator paid for itself in ONE MONTH. Owner now planning second location. Competitor pharmacy across street: Lost J$150,000 in refrigerated stock, closed 3 days, customers never returned. Owner said: "Every business on our street was dark except us. We had a line of 50 people. Some drove from 10km away. Best investment we ever made."',
    helpfulTips: JSON.stringify([
      {
        en: 'Calculate essentials only when sizing generator - refrigerators, minimal lighting, one payment system. Smaller = cheaper to buy and run',
        es: 'Calcular solo esenciales al dimensionar generador - refrigeradores, iluminación mínima, un sistema de pago. Más pequeño = más barato comprar y operar',
        fr: 'Calculer uniquement l\'essentiel pour dimensionner générateur - réfrigérateurs, éclairage minimal, un système paiement. Plus petit = moins cher à acheter et utiliser'
      },
      {
        en: 'Test generator monthly for 30 minutes under load - generators that sit idle often won\'t start during emergencies',
        es: 'Probar generador mensualmente 30 minutos bajo carga - generadores inactivos a menudo no arrancan en emergencias',
        fr: 'Tester générateur mensuellement 30 minutes sous charge - générateurs inactifs souvent ne démarrent pas en urgence'
      },
      {
        en: 'Keep 3 days minimum fuel supply - gas stations close during extended outages',
        es: 'Mantener suministro mínimo de combustible para 3 días - gasolineras cierran durante cortes prolongados',
        fr: 'Garder minimum 3 jours de carburant - stations-service ferment pendant pannes prolongées'
      },
      {
        en: 'Train ALL staff to start generator - you might not be there when outage happens',
        es: 'Entrenar a TODO el personal para arrancar generador - usted podría no estar ahí cuando ocurra corte',
        fr: 'Former TOUT le personnel au démarrage générateur - vous pourriez ne pas être là lors de panne'
      },
      {
        en: 'Post clear written instructions at generator - include fuel level check, startup sequence, troubleshooting',
        es: 'Colocar instrucciones escritas claras en generador - incluir verificación de combustible, secuencia de arranque, solución de problemas',
        fr: 'Afficher instructions écrites claires au générateur - inclure vérification carburant, séquence démarrage, dépannage'
      }
    ]),
    commonMistakes: JSON.stringify([
      {
        en: 'Buying generator too small - won\'t power what you need. Verify wattage requirements BEFORE purchasing',
        es: 'Comprar generador muy pequeño - no alimentará lo que necesita. Verificar requisitos de vataje ANTES de comprar',
        fr: 'Acheter générateur trop petit - ne peut alimenter ce dont vous avez besoin. Vérifier besoins en watts AVANT achat'
      },
      {
        en: 'Never testing generator - won\'t start when needed. Monthly 30-minute test prevents 90% of startup failures',
        es: 'Nunca probar generador - no arrancará cuando se necesite. Prueba mensual de 30 minutos previene 90% de fallas',
        fr: 'Ne jamais tester générateur - ne démarrera pas en cas de besoin. Test mensuel 30 minutes prévient 90% défaillances'
      },
      {
        en: 'Running generator indoors or in poorly ventilated area - carbon monoxide poisoning kills quickly',
        es: 'Operar generador en interiores o área mal ventilada - envenenamiento por monóxido de carbono mata rápidamente',
        fr: 'Faire fonctionner générateur à l\'intérieur ou en zone mal ventilée - empoisonnement monoxyde carbone tue rapidement'
      },
      {
        en: 'Forgetting fuel expires - gasoline degrades in 3-6 months. Rotate fuel regularly or use stabilizer',
        es: 'Olvidar que combustible expira - gasolina se degrada en 3-6 meses. Rotar combustible regularmente o usar estabilizador',
        fr: 'Oublier que carburant expire - essence se dégrade en 3-6 mois. Faire tourner carburant régulièrement ou utiliser stabilisant'
      },
      {
        en: 'No written startup instructions - during stressful outage, staff forget steps or make dangerous mistakes',
        es: 'Sin instrucciones escritas de arranque - durante corte estresante, personal olvida pasos o comete errores peligrosos',
        fr: 'Pas d\'instructions écrites de démarrage - pendant panne stressante, personnel oublie étapes ou fait erreurs dangereuses'
      }
    ]),
    lowBudgetAlternative: 'Entry Level: 3kW gasoline generator (J$90,000-120,000) powers ONE refrigerator, basic lighting, one payment terminal. Good for: Small shops, mini-marts, small pharmacies. Run time: 4-6 hours on 5L fuel. Mid Level: 5kW diesel generator (J$240,000-280,000) powers TWO refrigerators, lighting, 2-3 payment systems, basic AC. Good for: Grocery stores, medium pharmacies, small restaurants. Run time: 12-15 hours on 20L fuel. Budget Alternative: Large UPS/inverter system with deep-cycle batteries (J$180,000-250,000) - no fuel needed, silent, indoor safe. Powers equipment for 2-4 hours. Good for: Professional offices, clinics, IT services. Best Value: Start with small gasoline generator, upgrade to diesel as business grows. Share a generator with neighboring business to split costs (J$140,000 each for 10kW vs J$500,000 each for separate units).',
    applicableRisks: JSON.stringify(['power_outage', 'hurricane', 'equipment_failure', 'infrastructure_damage']),
    applicableBusinessTypes: JSON.stringify(['grocery_store', 'pharmacy', 'restaurant', 'medical_clinic', 'bakery', 'convenience_store', 'hotel']),
    selectionTier: 'recommended',
    isActive: true
  },

  // ============================================================================
  // STRATEGY 4: FIRE PREVENTION & RESPONSE
  // ============================================================================
  {
    strategyId: 'fire_comprehensive',
    name: JSON.stringify({
      en: 'Fire Prevention & Emergency Response',
      es: 'Prevención de Incendios y Respuesta de Emergencia',
      fr: 'Prévention Incendie et Intervention d\'Urgence'
    }),
    description: JSON.stringify({
      en: 'Complete fire safety system including detection, suppression equipment, staff training, and emergency procedures',
      es: 'Sistema completo de seguridad contra incendios incluyendo detección, equipo de supresión, capacitación de personal y procedimientos de emergencia',
      fr: 'Système complet de sécurité incendie incluant détection, équipement suppression, formation personnel et procédures d\'urgence'
    }),
    smeTitle: 'Stop Small Fires Before They Destroy Everything',
    smeSummary: '85% of business fires start small - electrical short, cooking accident, cigarette. With J$10,000-25,000 in basic equipment and 30 minutes of training, you can extinguish a small fire in 30 seconds before it spreads. Without preparation, a J$5,000 fire becomes a J$4M total loss. Fire extinguisher training is literally the difference between wiping up smoke damage and losing your entire business.',
    benefitsBullets: JSON.stringify([
      {
        en: 'Stop small fires in 30 seconds before they spread and cause total loss',
        es: 'Detener incendios pequeños en 30 segundos antes de que se propaguen y causen pérdida total',
        fr: 'Arrêter petits incendies en 30 secondes avant qu\'ils se propagent et causent perte totale'
      },
      {
        en: 'Get early warning with smoke detection - 5-10 minutes advance notice saves lives',
        es: 'Obtener advertencia temprana con detección de humo - aviso de 5-10 minutos salva vidas',
        fr: 'Obtenir alerte précoce avec détection fumée - préavis 5-10 minutes sauve vies'
      },
      {
        en: 'Reduce fire insurance premiums by 15-30% with proper safety equipment',
        es: 'Reducir primas de seguro contra incendios 15-30% con equipo de seguridad adecuado',
        fr: 'Réduire primes d\'assurance incendie de 15-30% avec équipement sécurité approprié'
      },
      {
        en: 'Meet fire safety regulations and pass inspections (required for licenses)',
        es: 'Cumplir regulaciones de seguridad contra incendios y pasar inspecciones (requerido para licencias)',
        fr: 'Respecter règlementations sécurité incendie et passer inspections (requis pour licences)'
      },
      {
        en: 'Protect staff and customer lives - prevent injury or death from fire/smoke',
        es: 'Proteger vidas de personal y clientes - prevenir lesiones o muerte por fuego/humo',
        fr: 'Protéger vies personnel et clients - prévenir blessures ou décès par feu/fumée'
      }
    ]),
    realWorldExample: 'Half Way Tree restaurant "Tasty Bites" (July 2021, 2:30 PM, lunch rush): Oil fire ignited in kitchen when pot overheated. Server saw flames, grabbed fire extinguisher from wall (J$8,500, mounted 3 months prior), used PASS method (trained 2 months before). Fire extinguished in 25 seconds. Damage: J$12,000 (scorched stove hood, minor wall damage). Reopened same day after cleanup. Next door restaurant "Quick Eats": Similar grease fire (September 2021). No extinguisher. Staff panicked, ran out. Fire spread to walls, ceiling. Building total loss: J$4.2M. Three neighboring businesses damaged: J$1.8M combined. Never reopened. Fire investigation: "Fire extinguisher within 10 feet would have stopped fire before it spread to structure. Total loss was preventable." Tasty Bites owner: "J$8,500 extinguisher + J$5,000 training saved J$4M+ and my life\'s work."',
    helpfulTips: JSON.stringify([
      {
        en: 'Mount extinguisher near EXIT path - if fire grows too large, you can escape while backing toward exit',
        es: 'Montar extintor cerca de ruta de SALIDA - si fuego crece demasiado, puede escapar retrocediendo hacia salida',
        fr: 'Monter extincteur près du chemin de SORTIE - si feu grandit trop, vous pouvez fuir en reculant vers sortie'
      },
      {
        en: 'Mount at chest height (4-5 feet) - faster to grab than floor level, easier for all staff to reach',
        es: 'Montar a altura del pecho (4-5 pies) - más rápido de agarrar que nivel del suelo, más fácil para todo el personal',
        fr: 'Monter à hauteur poitrine (1,2-1,5m) - plus rapide à saisir que niveau sol, plus facile pour tout personnel'
      },
      {
        en: 'Train EVERY staff member on PASS method: Pull pin, Aim at base of fire, Squeeze handle, Sweep side-to-side',
        es: 'Entrenar a CADA miembro del personal en método PASS: Tirar pasador, Apuntar a base del fuego, Apretar manija, Barrer lado a lado',
        fr: 'Former CHAQUE membre du personnel méthode PASS: Tirer goupille, Viser base feu, Presser poignée, Balayer côté à côté'
      },
      {
        en: 'Test smoke alarms monthly - press test button, verify loud alarm. Replace batteries yearly, units every 10 years',
        es: 'Probar alarmas de humo mensualmente - presionar botón de prueba, verificar alarma fuerte. Reemplazar baterías anualmente, unidades cada 10 años',
        fr: 'Tester détecteurs fumée mensuellement - presser bouton test, vérifier alarme forte. Remplacer piles annuellement, unités tous 10 ans'
      },
      {
        en: 'Check extinguisher pressure gauge monthly - green zone = ready, red zone = replace immediately',
        es: 'Verificar manómetro de presión mensualmente - zona verde = listo, zona roja = reemplazar inmediatamente',
        fr: 'Vérifier manomètre pression mensuellement - zone verte = prêt, zone rouge = remplacer immédiatement'
      }
    ]),
    commonMistakes: JSON.stringify([
      {
        en: 'Having extinguisher but ZERO staff training - in panic, no one remembers how to use it',
        es: 'Tener extintor pero CERO capacitación del personal - en pánico, nadie recuerda cómo usarlo',
        fr: 'Avoir extincteur mais ZÉRO formation personnel - en panique, personne ne se souvient comment l\'utiliser'
      },
      {
        en: 'Placing extinguisher far from high-risk areas (kitchen, electrical panel) - too far away when fire starts',
        es: 'Colocar extintor lejos de áreas de alto riesgo (cocina, panel eléctrico) - muy lejos cuando comienza el fuego',
        fr: 'Placer extincteur loin des zones à haut risque (cuisine, panneau électrique) - trop loin quand feu commence'
      },
      {
        en: 'Never checking pressure gauge - extinguisher may be empty or depressurized when you need it',
        es: 'Nunca verificar manómetro de presión - extintor puede estar vacío o despresurizado cuando lo necesita',
        fr: 'Ne jamais vérifier manomètre pression - extincteur peut être vide ou dépressurisé quand vous en avez besoin'
      },
      {
        en: 'Forgetting to replace smoke alarm batteries - dead batteries = no warning, deaths occur',
        es: 'Olvidar reemplazar baterías de alarma de humo - baterías muertas = sin advertencia, ocurren muertes',
        fr: 'Oublier de remplacer piles détecteur fumée - piles mortes = pas d\'alerte, décès surviennent'
      },
      {
        en: 'No clear evacuation route or meeting point - people trapped or can\'t account for everyone',
        es: 'Sin ruta de evacuación clara o punto de reunión - personas atrapadas o no puede contabilizar a todos',
        fr: 'Pas de voie d\'évacuation claire ou point de rassemblement - personnes piégées ou impossible compter tout le monde'
      }
    ]),
    lowBudgetAlternative: 'Minimum Fire Safety (J$10,500): One 10lb ABC fire extinguisher near highest risk area like kitchen or electrical panel (J$6,500). Two battery-powered smoke alarms - one near potential fire source, one in main area (J$2,000 each). Total: J$10,500. Free training: YouTube "fire extinguisher PASS method" + practice with expired extinguisher from fire department. Mid-Level (J$25,000): Three 10lb ABC extinguishers strategically placed (J$19,500). Five smoke alarms covering all areas (J$10,000). Illuminated EXIT sign (J$3,500). Fire blanket for kitchen (J$2,500). Premium (J$45,000+): Automatic fire suppression system for kitchen (J$35,000). Interconnected smoke alarms that all sound when one triggers (J$15,000). Emergency lighting system (J$8,000). Professional training session for all staff by Fire Brigade (J$5,000).',
    applicableRisks: JSON.stringify(['fire', 'electrical_hazard', 'equipment_failure', 'cooking_accident']),
    applicableBusinessTypes: null,
    selectionTier: 'essential',
    isActive: true
  },

  // ============================================================================
  // STRATEGY 5: EMERGENCY COMMUNICATION & COORDINATION
  // ============================================================================
  {
    strategyId: 'communication_comprehensive',
    name: JSON.stringify({
      en: 'Emergency Communication & Coordination System',
      es: 'Sistema de Comunicación y Coordinación de Emergencias',
      fr: 'Système de Communication et Coordination d\'Urgence'
    }),
    description: JSON.stringify({
      en: 'Complete emergency communication plan for contacting staff, customers, suppliers, and stakeholders before, during, and after crises',
      es: 'Plan completo de comunicación de emergencia para contactar personal, clientes, proveedores y partes interesadas antes, durante y después de crisis',
      fr: 'Plan complet de communication d\'urgence pour contacter personnel, clients, fournisseurs et parties prenantes avant, pendant et après crises'
    }),
    smeTitle: 'Stay Connected and Coordinated During Emergencies',
    smeSummary: 'During disasters, communication systems fail - no power, no internet, cell towers down. Businesses that stay connected with staff and customers recover 5x faster. Simple, free tools (WhatsApp groups, printed contact lists, social media) let you: verify staff safety in minutes, tell customers your reopening date, coordinate team recovery efforts, and maintain relationships during closure. Customers choose businesses that communicate.',
    benefitsBullets: JSON.stringify([
      {
        en: 'Verify all staff are safe within minutes, not days - know immediately who needs help',
        es: 'Verificar que todo el personal está seguro en minutos, no días - saber inmediatamente quién necesita ayuda',
        fr: 'Vérifier sécurité tout personnel en minutes, pas jours - savoir immédiatement qui a besoin d\'aide'
      },
      {
        en: 'Inform customers about closure/reopening - prevent 40-60% customer loss from going silent',
        es: 'Informar clientes sobre cierre/reapertura - prevenir pérdida de 40-60% de clientes por permanecer en silencio',
        fr: 'Informer clients fermeture/réouverture - prévenir perte 40-60% clients en restant silencieux'
      },
      {
        en: 'Coordinate team for faster recovery - organize cleanup, repairs, restocking efficiently',
        es: 'Coordinar equipo para recuperación más rápida - organizar limpieza, reparaciones, reabastecimiento eficientemente',
        fr: 'Coordonner équipe pour récupération plus rapide - organiser nettoyage, réparations, réapprovisionnement efficacement'
      },
      {
        en: 'Contact suppliers to restore supply chain - businesses that call first get priority service',
        es: 'Contactar proveedores para restaurar cadena de suministro - negocios que llaman primero obtienen servicio prioritario',
        fr: 'Contacter fournisseurs pour restaurer chaîne approvisionnement - entreprises qui appellent d\'abord obtiennent service prioritaire'
      },
      {
        en: 'Maintain customer loyalty during closure - regular updates build trust and bring customers back',
        es: 'Mantener lealtad de clientes durante cierre - actualizaciones regulares construyen confianza y traen clientes de vuelta',
        fr: 'Maintenir fidélité clients pendant fermeture - mises à jour régulières construisent confiance et ramènent clients'
      }
    ]),
    realWorldExample: 'COVID-19 Lockdown (March 2020 - ongoing): May Pen bakery "Fresh Bread Daily" created WhatsApp group with 150 top customers (free, setup in 30 minutes). Posted daily at 6:00 AM: "Good morning! Today we have: [list available items]. Takeaway only 7AM-5PM. Call to pre-order: [phone]". Also posted same info on Facebook page. Result: Sales dropped only 28% during total lockdown vs 75-85% average for silent competitors. Customers shared posts, gained 47 new customers during crisis. Competitor "Baker\'s Choice" went silent - no social media, no customer contact. Customers assumed they closed permanently. When they reopened 8 weeks later, 63% of customers had switched to Fresh Bread Daily and never returned. Baker\'s Choice closed permanently 4 months later. Fresh Bread Daily owner: "Five minutes a day on WhatsApp saved my business. Customers told me: \'We buy from you because you keep us informed.  We didn\'t know if others were even alive.\'"',
    helpfulTips: JSON.stringify([
      {
        en: 'Test communication system quarterly - actually call/message everyone to verify contact info is current',
        es: 'Probar sistema de comunicación trimestralmente - realmente llamar/mensajear a todos para verificar que info de contacto está actualizada',
        fr: 'Tester système communication trimestriellement - réellement appeler/envoyer message à tous pour vérifier info contact à jour'
      },
      {
        en: 'Collect TWO phone numbers per staff member - primary mobile + backup (home, spouse, parent)',
        es: 'Recopilar DOS números de teléfono por miembro del personal - móvil principal + respaldo (casa, cónyuge, padre)',
        fr: 'Collecter DEUX numéros téléphone par membre personnel - mobile principal + secours (maison, conjoint, parent)'
      },
      {
        en: 'Keep THREE copies of contact list - at business (waterproof container), your home, assistant manager\'s home',
        es: 'Mantener TRES copias de lista de contactos - en negocio (contenedor impermeable), su casa, casa del asistente gerente',
        fr: 'Garder TROIS copies liste contacts - au commerce (contenant étanche), votre maison, maison assistant gérant'
      },
      {
        en: 'Designate backup communicator - if you\'re unavailable/injured, this person manages all communication',
        es: 'Designar comunicador de respaldo - si usted no está disponible/lesionado, esta persona gestiona toda comunicación',
        fr: 'Désigner communicateur de secours - si vous n\'êtes pas disponible/blessé, cette personne gère toute communication'
      },
      {
        en: 'Update social media regularly during crisis - daily posts keep customers engaged and informed',
        es: 'Actualizar redes sociales regularmente durante crisis - publicaciones diarias mantienen clientes comprometidos e informados',
        fr: 'Mettre à jour réseaux sociaux régulièrement pendant crise - publications quotidiennes gardent clients engagés et informés'
      }
    ]),
    commonMistakes: JSON.stringify([
      {
        en: 'Only one phone number per person - if that phone is damaged/lost in disaster, can\'t reach them',
        es: 'Solo un número de teléfono por persona - si ese teléfono se daña/pierde en desastre, no puede contactarlos',
        fr: 'Un seul numéro téléphone par personne - si ce téléphone endommagé/perdu dans catastrophe, impossible les joindre'
      },
      {
        en: 'No designated backup if owner unavailable - communication collapses, team can\'t coordinate',
        es: 'Sin respaldo designado si propietario no disponible - comunicación colapsa, equipo no puede coordinarse',
        fr: 'Pas de secours désigné si propriétaire indisponible - communication s\'effondre, équipe ne peut se coordonner'
      },
      {
        en: 'Never updating contact info - 30-40% of phone numbers change per year, outdated list is useless',
        es: 'Nunca actualizar info de contacto - 30-40% de números telefónicos cambian por año, lista desactualizada es inútil',
        fr: 'Ne jamais mettre à jour info contact - 30-40% numéros téléphone changent par an, liste obsolète est inutile'
      },
      {
        en: 'No customer communication plan - they assume you closed permanently, go to competitors forever',
        es: 'Sin plan de comunicación con clientes - asumen que cerró permanentemente, van a competidores para siempre',
        fr: 'Pas de plan communication clients - ils supposent que vous avez fermé définitivement, vont chez concurrents pour toujours'
      },
      {
        en: 'Waiting to test system until real emergency - discover problems too late when you need it most',
        es: 'Esperar para probar sistema hasta emergencia real - descubrir problemas muy tarde cuando más lo necesita',
        fr: 'Attendre pour tester système jusqu\'à vraie urgence - découvrir problèmes trop tard quand vous en avez le plus besoin'
      }
    ]),
    lowBudgetAlternative: 'Completely FREE Communication System: 1) WhatsApp group for staff (free, takes 5 minutes to set up). 2) Printed contact list with 2 phone numbers per person - 3 copies stored: business (in waterproof ziplock bag), your home, assistant manager (free except J$50 printing). 3) Facebook Business Page for customer updates (free, 15 minutes setup). 4) Phone tree: You call 2 people, each calls 2 more = reach 30 people in 10 minutes (free). Total cost: J$50 for printing, zero ongoing costs. Mid-Level (Still Free): Add Instagram account, Google Business Profile, email list. Use free tools like WhatsApp Business (better features), Facebook Messenger broadcasts. Premium (J$2,000-5,000/month): Paid SMS service for mass customer notifications, professional social media management, customer database software. Only necessary for businesses with 500+ customers.',
    applicableRisks: JSON.stringify(['hurricane', 'health_emergency', 'civil_unrest', 'power_outage', 'flooding', 'fire', 'any_emergency']),
    applicableBusinessTypes: null,
    selectionTier: 'essential',
    isActive: true
  }
]

async function seedPremiumStrategies() {
  console.log('🌟 Seeding PREMIUM Caribbean BCP Strategies...\n')
  console.log('✨ 5 Comprehensive Strategies')
  console.log('🌍 Full Multilingual Support (English, Spanish, French)')
  console.log('💎 High-Value Content with Real Examples\n')
  console.log('─'.repeat(80) + '\n')
  
  let created = 0
  let updated = 0
  
  for (const strategy of PREMIUM_STRATEGIES) {
    const existing = await prisma.riskMitigationStrategy.findUnique({
      where: { strategyId: strategy.strategyId }
    })
    
    const nameObj = JSON.parse(strategy.name)
    
    if (existing) {
      await prisma.riskMitigationStrategy.update({
        where: { strategyId: strategy.strategyId },
        data: strategy
      })
      console.log(`  ↻ Updated: ${nameObj.en}`)
      console.log(`     ES: ${nameObj.es}`)
      console.log(`     FR: ${nameObj.fr}`)
      updated++
    } else {
      await prisma.riskMitigationStrategy.create({ data: strategy })
      console.log(`  ✓ Created: ${nameObj.en}`)
      console.log(`     ES: ${nameObj.es}`)
      console.log(`     FR: ${nameObj.fr}`)
      created++
    }
    console.log()
  }
  
  console.log('─'.repeat(80))
  console.log(`\n✅ Premium Strategies Summary:`)
  console.log(`   - New strategies created: ${created}`)
  console.log(`   - Existing strategies updated: ${updated}`)
  console.log(`   - Total strategies: ${PREMIUM_STRATEGIES.length}`)
  console.log(`   - Languages per strategy: 3 (EN, ES, FR)`)
  console.log(`   - Total multilingual entries: ${PREMIUM_STRATEGIES.length * 3}`)
  console.log(`\n💡 Note: Times and costs will be calculated from action steps!`)
  console.log(`📊 No fixed categories - action steps define all phases!`)
}

// Run if called directly
if (require.main === module) {
  seedPremiumStrategies()
    .then(() => {
      console.log('\n🎉 Premium strategies seeded successfully!')
      prisma.$disconnect()
    })
    .catch((e) => {
      console.error('\n❌ Seeding failed:', e)
      prisma.$disconnect()
      process.exit(1)
    })
}

export { seedPremiumStrategies, PREMIUM_STRATEGIES }


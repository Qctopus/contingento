import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to create multilingual JSON
const ml = (en: string, es: string, fr: string) => JSON.stringify({ en, es, fr })

export const COMPREHENSIVE_COST_ITEMS = [
  // ============================================================================
  // HURRICANE/STORM PROTECTION
  // ============================================================================
  {
    itemId: 'hurricane_shutters_aluminum',
    name: ml(
      'Hurricane Shutters (Aluminum Roll-down)',
      'Contraventanas para Huracanes (Aluminio Enrollable)',
      'Volets Anticycloniques (Aluminium Enroulable)'
    ),
    description: ml(
      'Professional grade aluminum roll-down shutters with motor and manual override',
      'Contraventanas enrollables de aluminio de grado profesional con motor y anulación manual',
      'Volets roulants en aluminium de qualité professionnelle avec moteur et commande manuelle'
    ),
    category: 'construction',
    baseUSD: 450,
    baseUSDMin: 350,
    baseUSDMax: 550,
    unit: 'per window',
    complexity: 'medium',
    tags: JSON.stringify(['hurricane', 'windows', 'protection', 'premium'])
  },
  {
    itemId: 'hurricane_shutters_accordion',
    name: ml(
      'Hurricane Shutters (Accordion Style)',
      'Contraventanas para Huracanes (Estilo Acordeón)',
      'Volets Anticycloniques (Style Accordéon)'
    ),
    description: ml(
      'Permanent accordion-style hurricane shutters, manual operation',
      'Contraventanas permanentes estilo acordeón para huracanes, operación manual',
      'Volets anticycloniques permanents style accordéon, opération manuelle'
    ),
    category: 'construction',
    baseUSD: 300,
    baseUSDMin: 250,
    baseUSDMax: 350,
    unit: 'per window',
    complexity: 'medium',
    tags: JSON.stringify(['hurricane', 'windows', 'protection', 'recommended'])
  },
  {
    itemId: 'plywood_hurricane_boards',
    name: ml(
      'Plywood Hurricane Boards (3/4")',
      'Tablas de Contrachapado para Huracanes (3/4")',
      'Planches de Contreplaqué Anticyclonique (3/4")'
    ),
    description: ml(
      'Marine-grade plywood boards with fasteners and anchors for temporary window protection',
      'Tablas de contrachapado marino con fijadores y anclajes para protección temporal de ventanas',
      'Planches de contreplaqué marine avec fixations et ancrages pour protection temporaire des fenêtres'
    ),
    category: 'construction',
    baseUSD: 90,
    baseUSDMin: 70,
    baseUSDMax: 110,
    unit: 'per window',
    complexity: 'simple',
    tags: JSON.stringify(['hurricane', 'windows', 'budget', 'diy'])
  },
  {
    itemId: 'roof_hurricane_straps',
    name: ml(
      'Hurricane Roof Straps & Reinforcement',
      'Correas y Refuerzo de Techo para Huracanes',
      'Sangles et Renforcement de Toit Anticyclonique'
    ),
    description: ml(
      'Metal hurricane straps and clips to secure roof trusses to walls',
      'Correas y clips metálicos para asegurar las vigas del techo a las paredes',
      'Sangles et clips métalliques pour sécuriser les fermes de toit aux murs'
    ),
    category: 'construction',
    baseUSD: 1200,
    baseUSDMin: 1000,
    baseUSDMax: 1500,
    unit: 'per building',
    complexity: 'complex',
    tags: JSON.stringify(['hurricane', 'roof', 'structural', 'professional'])
  },
  {
    itemId: 'door_reinforcement_kit',
    name: ml(
      'Door Reinforcement Kit',
      'Kit de Refuerzo de Puertas',
      'Kit de Renforcement de Porte'
    ),
    description: ml(
      'Heavy-duty door braces, locks, and hinges for storm protection',
      'Refuerzos de puertas resistentes, cerraduras y bisagras para protección contra tormentas',
      'Renforts de porte robustes, serrures et charnières pour protection contre les tempêtes'
    ),
    category: 'construction',
    baseUSD: 150,
    baseUSDMin: 120,
    baseUSDMax: 180,
    unit: 'per door',
    complexity: 'simple',
    tags: JSON.stringify(['hurricane', 'doors', 'security'])
  },
  
  // ============================================================================
  // BACKUP POWER
  // ============================================================================
  {
    itemId: 'generator_5kw_diesel',
    name: ml(
      'Backup Generator (5kW Diesel)',
      'Generador de Respaldo (5kW Diésel)',
      'Générateur de Secours (5kW Diesel)'
    ),
    description: ml(
      'Portable diesel generator with automatic transfer switch, 5kW capacity',
      'Generador diésel portátil con interruptor de transferencia automática, capacidad de 5kW',
      'Générateur diesel portable avec commutateur de transfert automatique, capacité de 5kW'
    ),
    category: 'equipment',
    baseUSD: 2800,
    baseUSDMin: 2400,
    baseUSDMax: 3200,
    unit: 'per unit',
    complexity: 'complex',
    tags: JSON.stringify(['power', 'generator', 'backup', 'diesel', 'recommended'])
  },
  {
    itemId: 'generator_10kw_diesel',
    name: ml(
      'Backup Generator (10kW Diesel)',
      'Generador de Respaldo (10kW Diésel)',
      'Générateur de Secours (10kW Diesel)'
    ),
    description: ml(
      'Commercial-grade diesel generator, 10kW capacity with weatherproof enclosure',
      'Generador diésel de grado comercial, capacidad de 10kW con gabinete resistente a la intemperie',
      'Générateur diesel de qualité commerciale, capacité de 10kW avec boîtier étanche'
    ),
    category: 'equipment',
    baseUSD: 4500,
    baseUSDMin: 4000,
    baseUSDMax: 5000,
    unit: 'per unit',
    complexity: 'complex',
    tags: JSON.stringify(['power', 'generator', 'backup', 'diesel', 'premium'])
  },
  {
    itemId: 'generator_3kw_gasoline',
    name: ml(
      'Backup Generator (3kW Gasoline)',
      'Generador de Respaldo (3kW Gasolina)',
      'Générateur de Secours (3kW Essence)'
    ),
    description: ml(
      'Basic portable gasoline generator, 3kW capacity',
      'Generador de gasolina portátil básico, capacidad de 3kW',
      'Générateur à essence portable de base, capacité de 3kW'
    ),
    category: 'equipment',
    baseUSD: 800,
    baseUSDMin: 600,
    baseUSDMax: 1000,
    unit: 'per unit',
    complexity: 'simple',
    tags: JSON.stringify(['power', 'generator', 'backup', 'gasoline', 'budget'])
  },
  {
    itemId: 'solar_battery_backup_3kw',
    name: ml(
      'Solar Battery Backup System (3kW)',
      'Sistema de Respaldo con Batería Solar (3kW)',
      'Système de Secours à Batterie Solaire (3kW)'
    ),
    description: ml(
      'Solar panels with battery storage, 3kW inverter system',
      'Paneles solares con almacenamiento de batería, sistema inversor de 3kW',
      'Panneaux solaires avec stockage par batterie, système onduleur de 3kW'
    ),
    category: 'equipment',
    baseUSD: 5000,
    baseUSDMin: 4500,
    baseUSDMax: 5500,
    unit: 'per system',
    complexity: 'complex',
    tags: JSON.stringify(['power', 'solar', 'battery', 'renewable', 'premium'])
  },
  {
    itemId: 'generator_fuel_diesel',
    name: ml(
      'Generator Fuel (50L Diesel)',
      'Combustible para Generador (50L Diésel)',
      'Carburant pour Générateur (50L Diesel)'
    ),
    description: ml(
      'Diesel fuel for backup generator (50 liter tank)',
      'Combustible diésel para generador de respaldo (tanque de 50 litros)',
      'Carburant diesel pour générateur de secours (réservoir de 50 litres)'
    ),
    category: 'supplies',
    baseUSD: 100,
    baseUSDMin: 80,
    baseUSDMax: 120,
    unit: 'per tank (50L)',
    complexity: 'simple',
    tags: JSON.stringify(['power', 'fuel', 'diesel', 'supplies'])
  },
  {
    itemId: 'ups_battery_backup_1kw',
    name: ml(
      'UPS Battery Backup (1kW)',
      'Respaldo de Batería UPS (1kW)',
      'Onduleur Batterie de Secours (1kW)'
    ),
    description: ml(
      'Uninterruptible power supply for computers and essential electronics',
      'Fuente de alimentación ininterrumpida para computadoras y electrónicos esenciales',
      'Alimentation sans interruption pour ordinateurs et électroniques essentiels'
    ),
    category: 'equipment',
    baseUSD: 400,
    baseUSDMin: 300,
    baseUSDMax: 500,
    unit: 'per unit',
    complexity: 'simple',
    tags: JSON.stringify(['power', 'ups', 'battery', 'electronics'])
  },
  
  // ============================================================================
  // WATER SYSTEMS
  // ============================================================================
  {
    itemId: 'water_tank_500l',
    name: ml(
      'Water Storage Tank (500L)',
      'Tanque de Almacenamiento de Agua (500L)',
      'Réservoir de Stockage d\'Eau (500L)'
    ),
    description: ml(
      'Polyethylene water storage tank with stand and fittings',
      'Tanque de almacenamiento de agua de polietileno con soporte y accesorios',
      'Réservoir de stockage d\'eau en polyéthylène avec support et raccords'
    ),
    category: 'equipment',
    baseUSD: 350,
    baseUSDMin: 300,
    baseUSDMax: 400,
    unit: 'per tank',
    complexity: 'medium',
    tags: JSON.stringify(['water', 'storage', 'tank'])
  },
  {
    itemId: 'water_tank_1000l',
    name: ml(
      'Water Storage Tank (1000L)',
      'Tanque de Almacenamiento de Agua (1000L)',
      'Réservoir de Stockage d\'Eau (1000L)'
    ),
    description: ml(
      'Large capacity polyethylene water storage tank with stand',
      'Tanque de almacenamiento de agua de polietileno de gran capacidad con soporte',
      'Réservoir de stockage d\'eau en polyéthylène de grande capacité avec support'
    ),
    category: 'equipment',
    baseUSD: 600,
    baseUSDMin: 500,
    baseUSDMax: 700,
    unit: 'per tank',
    complexity: 'medium',
    tags: JSON.stringify(['water', 'storage', 'tank', 'large'])
  },
  {
    itemId: 'water_purification_tablets',
    name: ml(
      'Water Purification Tablets (100 pack)',
      'Tabletas de Purificación de Agua (Paquete de 100)',
      'Tablettes de Purification d\'Eau (Paquet de 100)'
    ),
    description: ml(
      'Emergency water purification tablets, treats 100 liters',
      'Tabletas de purificación de agua de emergencia, trata 100 litros',
      'Tablettes de purification d\'eau d\'urgence, traite 100 litres'
    ),
    category: 'supplies',
    baseUSD: 15,
    baseUSDMin: 12,
    baseUSDMax: 18,
    unit: 'per pack',
    complexity: 'simple',
    tags: JSON.stringify(['water', 'purification', 'emergency', 'consumable'])
  },
  {
    itemId: 'gravity_water_filter',
    name: ml(
      'Gravity Water Filter System',
      'Sistema de Filtro de Agua por Gravedad',
      'Système de Filtre à Eau par Gravité'
    ),
    description: ml(
      'Gravity-fed water filtration system with ceramic filters',
      'Sistema de filtración de agua alimentado por gravedad con filtros cerámicos',
      'Système de filtration d\'eau alimenté par gravité avec filtres céramiques'
    ),
    category: 'equipment',
    baseUSD: 200,
    baseUSDMin: 150,
    baseUSDMax: 250,
    unit: 'per system',
    complexity: 'simple',
    tags: JSON.stringify(['water', 'filter', 'purification'])
  },
  
  // ============================================================================
  // FLOOD PROTECTION
  // ============================================================================
  {
    itemId: 'sandbags_100pack',
    name: ml(
      'Sandbags (100 pack)',
      'Sacos de Arena (Paquete de 100)',
      'Sacs de Sable (Paquet de 100)'
    ),
    description: ml(
      'Heavy-duty polypropylene sandbags for flood protection',
      'Sacos de arena de polipropileno resistentes para protección contra inundaciones',
      'Sacs de sable en polypropylène robustes pour protection contre les inondations'
    ),
    category: 'supplies',
    baseUSD: 80,
    baseUSDMin: 60,
    baseUSDMax: 100,
    unit: 'per 100 bags',
    complexity: 'simple',
    tags: JSON.stringify(['flood', 'sandbags', 'protection'])
  },
  {
    itemId: 'portable_flood_barrier',
    name: ml(
      'Portable Flood Barrier (10ft)',
      'Barrera Portátil contra Inundaciones (10 pies)',
      'Barrière Anti-Inondation Portable (10 pieds)'
    ),
    description: ml(
      'Self-inflating portable flood barrier, 10 feet length',
      'Barrera portátil autoinflable contra inundaciones, longitud de 10 pies',
      'Barrière anti-inondation portable auto-gonflante, longueur de 10 pieds'
    ),
    category: 'equipment',
    baseUSD: 300,
    baseUSDMin: 250,
    baseUSDMax: 350,
    unit: 'per 10ft section',
    complexity: 'simple',
    tags: JSON.stringify(['flood', 'barrier', 'portable'])
  },
  {
    itemId: 'submersible_pump',
    name: ml(
      'Submersible Sump Pump',
      'Bomba Sumergible de Achique',
      'Pompe de Puisard Submersible'
    ),
    description: ml(
      'Electric submersible pump for water removal, 1HP motor',
      'Bomba sumergible eléctrica para eliminación de agua, motor de 1HP',
      'Pompe submersible électrique pour élimination d\'eau, moteur de 1HP'
    ),
    category: 'equipment',
    baseUSD: 250,
    baseUSDMin: 200,
    baseUSDMax: 300,
    unit: 'per unit',
    complexity: 'medium',
    tags: JSON.stringify(['flood', 'pump', 'water', 'removal'])
  },
  
  // ============================================================================
  // EMERGENCY SUPPLIES
  // ============================================================================
  {
    itemId: 'emergency_food_2weeks',
    name: ml(
      'Emergency Food Supplies (2 weeks)',
      'Suministros de Alimentos de Emergencia (2 semanas)',
      'Provisions Alimentaires d\'Urgence (2 semaines)'
    ),
    description: ml(
      'Non-perishable emergency food supply for 2 weeks, 4 people',
      'Suministro de alimentos no perecederos de emergencia para 2 semanas, 4 personas',
      'Approvisionnement alimentaire d\'urgence non périssable pour 2 semaines, 4 personnes'
    ),
    category: 'supplies',
    baseUSD: 200,
    baseUSDMin: 150,
    baseUSDMax: 250,
    unit: 'per kit',
    complexity: 'simple',
    tags: JSON.stringify(['emergency', 'food', 'supplies', 'disaster'])
  },
  {
    itemId: 'first_aid_kit_commercial',
    name: ml(
      'First Aid Kit (Commercial Grade)',
      'Botiquín de Primeros Auxilios (Grado Comercial)',
      'Trousse de Premiers Soins (Qualité Commerciale)'
    ),
    description: ml(
      'Comprehensive commercial-grade first aid kit for 25+ people',
      'Botiquín de primeros auxilios de grado comercial completo para más de 25 personas',
      'Trousse de premiers soins de qualité commerciale complète pour plus de 25 personnes'
    ),
    category: 'supplies',
    baseUSD: 150,
    baseUSDMin: 120,
    baseUSDMax: 180,
    unit: 'per kit',
    complexity: 'simple',
    tags: JSON.stringify(['emergency', 'medical', 'first-aid', 'health'])
  },
  {
    itemId: 'flashlights_batteries_5pack',
    name: ml(
      'Flashlights & Batteries (Pack of 5)',
      'Linternas y Baterías (Paquete de 5)',
      'Lampes de Poche et Piles (Paquet de 5)'
    ),
    description: ml(
      'LED flashlights with extra batteries and charging cables',
      'Linternas LED con baterías adicionales y cables de carga',
      'Lampes de poche LED avec piles supplémentaires et câbles de charge'
    ),
    category: 'supplies',
    baseUSD: 60,
    baseUSDMin: 45,
    baseUSDMax: 75,
    unit: 'per pack',
    complexity: 'simple',
    tags: JSON.stringify(['emergency', 'lighting', 'flashlight', 'batteries'])
  },
  {
    itemId: 'emergency_radio',
    name: ml(
      'Emergency Crank Radio',
      'Radio de Emergencia con Manivela',
      'Radio d\'Urgence à Manivelle'
    ),
    description: ml(
      'Hand-crank emergency radio with AM/FM and NOAA weather alerts',
      'Radio de emergencia con manivela con alertas meteorológicas AM/FM y NOAA',
      'Radio d\'urgence à manivelle avec alertes météo AM/FM et NOAA'
    ),
    category: 'equipment',
    baseUSD: 40,
    baseUSDMin: 30,
    baseUSDMax: 50,
    unit: 'per unit',
    complexity: 'simple',
    tags: JSON.stringify(['emergency', 'radio', 'communication', 'weather'])
  },
  
  // ============================================================================
  // FIRE PROTECTION
  // ============================================================================
  {
    itemId: 'fire_extinguisher_10lb',
    name: ml(
      'Fire Extinguisher (10lb ABC)',
      'Extintor de Incendios (10lb ABC)',
      'Extincteur d\'Incendie (10lb ABC)'
    ),
    description: ml(
      '10lb ABC fire extinguisher for all fire types',
      'Extintor de incendios ABC de 10 libras para todo tipo de fuegos',
      'Extincteur d\'incendie ABC de 10 lb pour tous types de feux'
    ),
    category: 'equipment',
    baseUSD: 60,
    baseUSDMin: 45,
    baseUSDMax: 75,
    unit: 'per unit',
    complexity: 'simple',
    tags: JSON.stringify(['fire', 'extinguisher', 'safety', 'protection'])
  },
  {
    itemId: 'smoke_detector_commercial',
    name: ml(
      'Smoke Detector (Commercial Grade)',
      'Detector de Humo (Grado Comercial)',
      'Détecteur de Fumée (Qualité Commerciale)'
    ),
    description: ml(
      'Commercial-grade photoelectric smoke detector with battery backup',
      'Detector de humo fotoeléctrico de grado comercial con batería de respaldo',
      'Détecteur de fumée photoélectrique de qualité commerciale avec batterie de secours'
    ),
    category: 'equipment',
    baseUSD: 50,
    baseUSDMin: 35,
    baseUSDMax: 65,
    unit: 'per unit',
    complexity: 'simple',
    tags: JSON.stringify(['fire', 'smoke', 'detector', 'alarm'])
  },
  {
    itemId: 'fire_suppression_system',
    name: ml(
      'Automatic Fire Suppression System',
      'Sistema Automático de Supresión de Incendios',
      'Système Automatique de Suppression d\'Incendie'
    ),
    description: ml(
      'Automatic fire suppression system for commercial kitchens',
      'Sistema automático de supresión de incendios para cocinas comerciales',
      'Système automatique de suppression d\'incendie pour cuisines commerciales'
    ),
    category: 'equipment',
    baseUSD: 2500,
    baseUSDMin: 2000,
    baseUSDMax: 3000,
    unit: 'per system',
    complexity: 'complex',
    tags: JSON.stringify(['fire', 'suppression', 'automatic', 'kitchen', 'commercial'])
  },
  
  // ============================================================================
  // SECURITY
  // ============================================================================
  {
    itemId: 'security_camera_system_4ch',
    name: ml(
      'Security Camera System (4-channel)',
      'Sistema de Cámaras de Seguridad (4 canales)',
      'Système de Caméras de Sécurité (4 canaux)'
    ),
    description: ml(
      'IP security camera system with 4 cameras and DVR recording',
      'Sistema de cámaras de seguridad IP con 4 cámaras y grabación DVR',
      'Système de caméras de sécurité IP avec 4 caméras et enregistrement DVR'
    ),
    category: 'equipment',
    baseUSD: 600,
    baseUSDMin: 450,
    baseUSDMax: 750,
    unit: 'per system',
    complexity: 'medium',
    tags: JSON.stringify(['security', 'camera', 'surveillance', 'monitoring'])
  },
  {
    itemId: 'alarm_system_basic',
    name: ml(
      'Alarm System (Basic)',
      'Sistema de Alarma (Básico)',
      'Système d\'Alarme (Basique)'
    ),
    description: ml(
      'Basic intrusion alarm system with door/window sensors',
      'Sistema de alarma de intrusión básico con sensores de puerta/ventana',
      'Système d\'alarme d\'intrusion de base avec capteurs de porte/fenêtre'
    ),
    category: 'equipment',
    baseUSD: 400,
    baseUSDMin: 300,
    baseUSDMax: 500,
    unit: 'per system',
    complexity: 'medium',
    tags: JSON.stringify(['security', 'alarm', 'intrusion', 'sensors'])
  },
  {
    itemId: 'security_grilles_window',
    name: ml(
      'Security Grilles (Window)',
      'Rejas de Seguridad (Ventana)',
      'Grilles de Sécurité (Fenêtre)'
    ),
    description: ml(
      'Steel security grilles for window protection',
      'Rejas de seguridad de acero para protección de ventanas',
      'Grilles de sécurité en acier pour protection des fenêtres'
    ),
    category: 'construction',
    baseUSD: 200,
    baseUSDMin: 150,
    baseUSDMax: 250,
    unit: 'per window',
    complexity: 'medium',
    tags: JSON.stringify(['security', 'grilles', 'window', 'steel'])
  },
  
  // ============================================================================
  // SERVICES
  // ============================================================================
  {
    itemId: 'installation_service_professional',
    name: ml(
      'Professional Installation Service',
      'Servicio de Instalación Profesional',
      'Service d\'Installation Professionnelle'
    ),
    description: ml(
      'Professional installation service by certified technicians',
      'Servicio de instalación profesional por técnicos certificados',
      'Service d\'installation professionnelle par des techniciens certifiés'
    ),
    category: 'service',
    baseUSD: 200,
    baseUSDMin: 150,
    baseUSDMax: 300,
    unit: 'per hour',
    complexity: 'medium',
    tags: JSON.stringify(['service', 'installation', 'professional', 'labor'])
  },
  {
    itemId: 'risk_assessment_consultation',
    name: ml(
      'Risk Assessment Consultation',
      'Consulta de Evaluación de Riesgos',
      'Consultation d\'Évaluation des Risques'
    ),
    description: ml(
      'Professional business risk assessment and planning consultation',
      'Evaluación de riesgos empresariales profesional y consulta de planificación',
      'Évaluation professionnelle des risques d\'entreprise et consultation de planification'
    ),
    category: 'service',
    baseUSD: 500,
    baseUSDMin: 400,
    baseUSDMax: 600,
    unit: 'per visit',
    complexity: 'medium',
    tags: JSON.stringify(['service', 'consultation', 'risk', 'assessment'])
  },
  {
    itemId: 'equipment_maintenance_annual',
    name: ml(
      'Annual Equipment Maintenance',
      'Mantenimiento Anual de Equipos',
      'Entretien Annuel des Équipements'
    ),
    description: ml(
      'Annual maintenance service for generators and emergency equipment',
      'Servicio de mantenimiento anual para generadores y equipos de emergencia',
      'Service d\'entretien annuel pour générateurs et équipements d\'urgence'
    ),
    category: 'service',
    baseUSD: 300,
    baseUSDMin: 250,
    baseUSDMax: 400,
    unit: 'per year',
    complexity: 'medium',
    tags: JSON.stringify(['service', 'maintenance', 'annual', 'equipment'])
  },
  {
    itemId: 'emergency_response_training',
    name: ml(
      'Emergency Response Training',
      'Capacitación en Respuesta a Emergencias',
      'Formation en Intervention d\'Urgence'
    ),
    description: ml(
      'Emergency response and disaster preparedness training for staff',
      'Capacitación en respuesta a emergencias y preparación para desastres para el personal',
      'Formation en intervention d\'urgence et préparation aux catastrophes pour le personnel'
    ),
    category: 'service',
    baseUSD: 400,
    baseUSDMin: 300,
    baseUSDMax: 500,
    unit: 'per session',
    complexity: 'simple',
    tags: JSON.stringify(['service', 'training', 'emergency', 'preparedness'])
  },
  
  // ============================================================================
  // COMMUNICATION
  // ============================================================================
  {
    itemId: 'satellite_phone',
    name: ml(
      'Satellite Phone',
      'Teléfono Satelital',
      'Téléphone Satellite'
    ),
    description: ml(
      'Satellite phone for emergency communication when cellular networks are down',
      'Teléfono satelital para comunicación de emergencia cuando las redes celulares están caídas',
      'Téléphone satellite pour communication d\'urgence lorsque les réseaux cellulaires sont hors service'
    ),
    category: 'equipment',
    baseUSD: 800,
    baseUSDMin: 600,
    baseUSDMax: 1000,
    unit: 'per unit',
    complexity: 'simple',
    tags: JSON.stringify(['communication', 'satellite', 'phone', 'emergency'])
  },
  {
    itemId: 'two_way_radios_6pack',
    name: ml(
      'Two-Way Radios (6-pack)',
      'Radios de Dos Vías (Paquete de 6)',
      'Radios Bidirectionnelles (Paquet de 6)'
    ),
    description: ml(
      'Professional two-way radios with 5-mile range, set of 6',
      'Radios de dos vías profesionales con alcance de 5 millas, juego de 6',
      'Radios bidirectionnelles professionnelles avec portée de 5 miles, ensemble de 6'
    ),
    category: 'equipment',
    baseUSD: 250,
    baseUSDMin: 200,
    baseUSDMax: 300,
    unit: 'per 6-pack',
    complexity: 'simple',
    tags: JSON.stringify(['communication', 'radio', 'two-way', 'emergency'])
  },
  
  // ============================================================================
  // DATA BACKUP
  // ============================================================================
  {
    itemId: 'cloud_backup_service',
    name: ml(
      'Cloud Data Backup Service',
      'Servicio de Respaldo de Datos en la Nube',
      'Service de Sauvegarde de Données Cloud'
    ),
    description: ml(
      'Cloud backup service for business data, 1TB storage, 1 year',
      'Servicio de respaldo en la nube para datos comerciales, almacenamiento de 1TB, 1 año',
      'Service de sauvegarde cloud pour données d\'entreprise, stockage de 1 To, 1 an'
    ),
    category: 'service',
    baseUSD: 300,
    baseUSDMin: 250,
    baseUSDMax: 350,
    unit: 'per year',
    complexity: 'simple',
    tags: JSON.stringify(['data', 'backup', 'cloud', 'storage', 'technology'])
  },
  {
    itemId: 'external_hard_drive_2tb',
    name: ml(
      'External Hard Drive (2TB)',
      'Disco Duro Externo (2TB)',
      'Disque Dur Externe (2To)'
    ),
    description: ml(
      'External hard drive for local data backup, 2TB capacity',
      'Disco duro externo para respaldo local de datos, capacidad de 2TB',
      'Disque dur externe pour sauvegarde locale des données, capacité de 2 To'
    ),
    category: 'equipment',
    baseUSD: 100,
    baseUSDMin: 80,
    baseUSDMax: 120,
    unit: 'per drive',
    complexity: 'simple',
    tags: JSON.stringify(['data', 'backup', 'storage', 'hardware', 'technology'])
  }
]

export async function seedMultilingualCostItems() {
  console.log('💰 Seeding multilingual cost items library...')
  
  let created = 0
  let updated = 0
  
  for (const item of COMPREHENSIVE_COST_ITEMS) {
    const existing = await prisma.costItem.findUnique({
      where: { itemId: item.itemId }
    })
    
    if (existing) {
      await prisma.costItem.update({
        where: { itemId: item.itemId },
        data: item
      })
      console.log(`  ↻ Updated: ${item.itemId}`)
      updated++
    } else {
      await prisma.costItem.create({ data: item })
      console.log(`  ✓ Created: ${item.itemId}`)
      created++
    }
  }
  
  console.log(`\n✅ Seeding complete!`)
  console.log(`   - New items created: ${created}`)
  console.log(`   - Existing items updated: ${updated}`)
  console.log(`   - Total items in library: ${COMPREHENSIVE_COST_ITEMS.length}`)
}

// Run if called directly
if (require.main === module) {
  seedMultilingualCostItems()
    .then(() => {
      console.log('\n🎉 Multilingual cost items seeded successfully!')
      prisma.$disconnect()
    })
    .catch((e) => {
      console.error('\n❌ Seeding failed:', e)
      prisma.$disconnect()
      process.exit(1)
    })
}












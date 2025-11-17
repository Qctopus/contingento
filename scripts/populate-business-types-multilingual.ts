import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Populate Business Types with comprehensive multilingual content
 * Adds descriptions, examples, and equipment lists in English, Spanish, and French
 */

interface MultilingualContent {
  en: string
  es: string
  fr: string
}

interface BusinessTypeData {
  businessTypeId: string
  description: MultilingualContent
  exampleBusinessPurposes: MultilingualContent[]
  exampleProducts: MultilingualContent[]
  exampleKeyPersonnel: MultilingualContent[]
  exampleCustomerBase: MultilingualContent[]
  minimumEquipment: MultilingualContent[]
}

const BUSINESS_TYPE_CONTENT: Record<string, BusinessTypeData> = {
  restaurant: {
    businessTypeId: 'restaurant',
    description: {
      en: 'Full-service restaurant offering sit-down dining with table service',
      es: 'Restaurante de servicio completo que ofrece comida con servicio de mesa',
      fr: 'Restaurant à service complet offrant une restauration assise avec service de table'
    },
    exampleBusinessPurposes: [
      { en: 'Provide quality dining experiences', es: 'Proporcionar experiencias gastronómicas de calidad', fr: 'Offrir des expériences culinaires de qualité' },
      { en: 'Serve local and international cuisine', es: 'Servir cocina local e internacional', fr: 'Servir une cuisine locale et internationale' },
      { en: 'Host events and celebrations', es: 'Organizar eventos y celebraciones', fr: 'Organiser des événements et célébrations' }
    ],
    exampleProducts: [
      { en: 'Meals and entrees', es: 'Comidas y platos principales', fr: 'Repas et plats principaux' },
      { en: 'Beverages (alcoholic and non-alcoholic)', es: 'Bebidas (alcohólicas y no alcohólicas)', fr: 'Boissons (alcoolisées et non alcoolisées)' },
      { en: 'Desserts and appetizers', es: 'Postres y aperitivos', fr: 'Desserts et apéritifs' }
    ],
    exampleKeyPersonnel: [
      { en: 'Chef / Head cook', es: 'Chef / Cocinero principal', fr: 'Chef / Cuisinier principal' },
      { en: 'Wait staff / Servers', es: 'Personal de servicio / Meseros', fr: 'Personnel de service / Serveurs' },
      { en: 'Kitchen assistants', es: 'Asistentes de cocina', fr: 'Assistants de cuisine' }
    ],
    exampleCustomerBase: [
      { en: 'Local residents', es: 'Residentes locales', fr: 'Résidents locaux' },
      { en: 'Tourists and visitors', es: 'Turistas y visitantes', fr: 'Touristes et visiteurs' },
      { en: 'Business professionals', es: 'Profesionales de negocios', fr: 'Professionnels des affaires' }
    ],
    minimumEquipment: [
      { en: 'Commercial kitchen equipment', es: 'Equipamiento de cocina comercial', fr: 'Équipement de cuisine commercial' },
      { en: 'Refrigeration units', es: 'Unidades de refrigeración', fr: 'Unités de réfrigération' },
      { en: 'POS system', es: 'Sistema de punto de venta', fr: 'Système de point de vente' },
      { en: 'Dining furniture', es: 'Mobiliario de comedor', fr: 'Mobilier de salle à manger' }
    ]
  },
  fast_food: {
    businessTypeId: 'fast_food',
    description: {
      en: 'Quick service restaurant offering fast, affordable meals',
      es: 'Restaurante de servicio rápido que ofrece comidas rápidas y asequibles',
      fr: 'Restaurant de restauration rapide offrant des repas rapides et abordables'
    },
    exampleBusinessPurposes: [
      { en: 'Provide quick meals for busy customers', es: 'Proporcionar comidas rápidas para clientes ocupados', fr: 'Fournir des repas rapides pour les clients pressés' },
      { en: 'Offer affordable food options', es: 'Ofrecer opciones de comida asequibles', fr: 'Offrir des options alimentaires abordables' }
    ],
    exampleProducts: [
      { en: 'Burgers and sandwiches', es: 'Hamburguesas y sándwiches', fr: 'Hamburgers et sandwichs' },
      { en: 'Fried foods', es: 'Alimentos fritos', fr: 'Aliments frits' },
      { en: 'Soft drinks and juices', es: 'Refrescos y jugos', fr: 'Boissons gazeuses et jus' }
    ],
    exampleKeyPersonnel: [
      { en: 'Cashier', es: 'Cajero', fr: 'Caissier' },
      { en: 'Kitchen staff', es: 'Personal de cocina', fr: 'Personnel de cuisine' },
      { en: 'Manager', es: 'Gerente', fr: 'Gérant' }
    ],
    exampleCustomerBase: [
      { en: 'Students', es: 'Estudiantes', fr: 'Étudiants' },
      { en: 'Working professionals', es: 'Profesionales trabajadores', fr: 'Professionnels actifs' },
      { en: 'Families', es: 'Familias', fr: 'Familles' }
    ],
    minimumEquipment: [
      { en: 'Deep fryers', es: 'Freidoras', fr: 'Friteuses' },
      { en: 'Grills and griddles', es: 'Parrillas y planchas', fr: 'Grills et plaques' },
      { en: 'POS system', es: 'Sistema de punto de venta', fr: 'Système de point de vente' },
      { en: 'Refrigeration', es: 'Refrigeración', fr: 'Réfrigération' }
    ]
  },
  hotel: {
    businessTypeId: 'hotel',
    description: {
      en: 'Accommodation facility providing rooms and hospitality services',
      es: 'Instalación de alojamiento que proporciona habitaciones y servicios de hospitalidad',
      fr: 'Établissement d\'hébergement offrant des chambres et des services d\'hospitalité'
    },
    exampleBusinessPurposes: [
      { en: 'Provide comfortable accommodation', es: 'Proporcionar alojamiento cómodo', fr: 'Fournir un hébergement confortable' },
      { en: 'Host tourists and business travelers', es: 'Alojar turistas y viajeros de negocios', fr: 'Accueillir des touristes et des voyageurs d\'affaires' },
      { en: 'Offer hospitality services', es: 'Ofrecer servicios de hospitalidad', fr: 'Offrir des services d\'hospitalité' }
    ],
    exampleProducts: [
      { en: 'Room accommodations', es: 'Alojamientos en habitaciones', fr: 'Hébergements en chambres' },
      { en: 'Breakfast and meals', es: 'Desayunos y comidas', fr: 'Petits-déjeuners et repas' },
      { en: 'Event hosting', es: 'Organización de eventos', fr: 'Organisation d\'événements' }
    ],
    exampleKeyPersonnel: [
      { en: 'Front desk staff', es: 'Personal de recepción', fr: 'Personnel de réception' },
      { en: 'Housekeeping', es: 'Servicio de limpieza', fr: 'Service de ménage' },
      { en: 'Maintenance staff', es: 'Personal de mantenimiento', fr: 'Personnel de maintenance' }
    ],
    exampleCustomerBase: [
      { en: 'Tourists', es: 'Turistas', fr: 'Touristes' },
      { en: 'Business travelers', es: 'Viajeros de negocios', fr: 'Voyageurs d\'affaires' },
      { en: 'Local guests', es: 'Huéspedes locales', fr: 'Clients locaux' }
    ],
    minimumEquipment: [
      { en: 'Furnished rooms', es: 'Habitaciones amuebladas', fr: 'Chambres meublées' },
      { en: 'Air conditioning units', es: 'Unidades de aire acondicionado', fr: 'Unités de climatisation' },
      { en: 'Laundry facilities', es: 'Instalaciones de lavandería', fr: 'Installations de blanchisserie' },
      { en: 'Security systems', es: 'Sistemas de seguridad', fr: 'Systèmes de sécurité' }
    ]
  },
  grocery_store: {
    businessTypeId: 'grocery_store',
    description: {
      en: 'Retail store selling food, beverages, and household items',
      es: 'Tienda minorista que vende alimentos, bebidas y artículos para el hogar',
      fr: 'Magasin de détail vendant des aliments, des boissons et des articles ménagers'
    },
    exampleBusinessPurposes: [
      { en: 'Provide essential food and household items', es: 'Proporcionar alimentos esenciales y artículos para el hogar', fr: 'Fournir des aliments essentiels et des articles ménagers' },
      { en: 'Serve local community needs', es: 'Atender las necesidades de la comunidad local', fr: 'Répondre aux besoins de la communauté locale' }
    ],
    exampleProducts: [
      { en: 'Fresh produce', es: 'Productos frescos', fr: 'Produits frais' },
      { en: 'Packaged foods', es: 'Alimentos envasados', fr: 'Aliments emballés' },
      { en: 'Household supplies', es: 'Suministros para el hogar', fr: 'Fournitures ménagères' }
    ],
    exampleKeyPersonnel: [
      { en: 'Store manager', es: 'Gerente de tienda', fr: 'Gérant de magasin' },
      { en: 'Cashiers', es: 'Cajeros', fr: 'Caissiers' },
      { en: 'Stock clerks', es: 'Empleados de almacén', fr: 'Employés d\'entrepôt' }
    ],
    exampleCustomerBase: [
      { en: 'Local residents', es: 'Residentes locales', fr: 'Résidents locaux' },
      { en: 'Families', es: 'Familias', fr: 'Familles' },
      { en: 'Small businesses', es: 'Pequeñas empresas', fr: 'Petites entreprises' }
    ],
    minimumEquipment: [
      { en: 'Refrigeration units', es: 'Unidades de refrigeración', fr: 'Unités de réfrigération' },
      { en: 'Shelving and display units', es: 'Estanterías y unidades de exhibición', fr: 'Étagères et unités d\'exposition' },
      { en: 'POS system', es: 'Sistema de punto de venta', fr: 'Système de point de vente' },
      { en: 'Shopping carts', es: 'Carritos de compras', fr: 'Chariots de courses' }
    ]
  },
  pharmacy: {
    businessTypeId: 'pharmacy',
    description: {
      en: 'Retail pharmacy dispensing prescription medications and health products',
      es: 'Farmacia minorista que dispensa medicamentos con receta y productos de salud',
      fr: 'Pharmacie de détail distribuant des médicaments sur ordonnance et des produits de santé'
    },
    exampleBusinessPurposes: [
      { en: 'Dispense prescription medications', es: 'Dispensar medicamentos con receta', fr: 'Dispenser des médicaments sur ordonnance' },
      { en: 'Provide health and wellness products', es: 'Proporcionar productos de salud y bienestar', fr: 'Fournir des produits de santé et de bien-être' },
      { en: 'Offer health consultations', es: 'Ofrecer consultas de salud', fr: 'Offrir des consultations de santé' }
    ],
    exampleProducts: [
      { en: 'Prescription medications', es: 'Medicamentos con receta', fr: 'Médicaments sur ordonnance' },
      { en: 'Over-the-counter medicines', es: 'Medicamentos de venta libre', fr: 'Médicaments en vente libre' },
      { en: 'Health and beauty products', es: 'Productos de salud y belleza', fr: 'Produits de santé et beauté' }
    ],
    exampleKeyPersonnel: [
      { en: 'Licensed pharmacist', es: 'Farmacéutico licenciado', fr: 'Pharmacien agréé' },
      { en: 'Pharmacy technicians', es: 'Técnicos de farmacia', fr: 'Techniciens en pharmacie' },
      { en: 'Sales staff', es: 'Personal de ventas', fr: 'Personnel de vente' }
    ],
    exampleCustomerBase: [
      { en: 'Patients with prescriptions', es: 'Pacientes con recetas', fr: 'Patients avec ordonnances' },
      { en: 'Health-conscious consumers', es: 'Consumidores conscientes de la salud', fr: 'Consommateurs soucieux de leur santé' },
      { en: 'Local residents', es: 'Residentes locales', fr: 'Résidents locaux' }
    ],
    minimumEquipment: [
      { en: 'Prescription storage', es: 'Almacenamiento de recetas', fr: 'Stockage des ordonnances' },
      { en: 'Refrigeration for medications', es: 'Refrigeración para medicamentos', fr: 'Réfrigération pour médicaments' },
      { en: 'Pharmacy management system', es: 'Sistema de gestión de farmacia', fr: 'Système de gestion de pharmacie' },
      { en: 'Security systems', es: 'Sistemas de seguridad', fr: 'Systèmes de sécurité' }
    ]
  },
  bar_nightclub: {
    businessTypeId: 'bar_nightclub',
    description: {
      en: 'Entertainment venue serving alcoholic beverages and hosting events',
      es: 'Lugar de entretenimiento que sirve bebidas alcohólicas y organiza eventos',
      fr: 'Lieu de divertissement servant des boissons alcoolisées et organisant des événements'
    },
    exampleBusinessPurposes: [
      { en: 'Provide entertainment and social gathering space', es: 'Proporcionar espacio de entretenimiento y reunión social', fr: 'Fournir un espace de divertissement et de rassemblement social' },
      { en: 'Serve alcoholic beverages', es: 'Servir bebidas alcohólicas', fr: 'Servir des boissons alcoolisées' }
    ],
    exampleProducts: [
      { en: 'Alcoholic beverages', es: 'Bebidas alcohólicas', fr: 'Boissons alcoolisées' },
      { en: 'Bar snacks', es: 'Aperitivos de bar', fr: 'Snacks de bar' },
      { en: 'Event hosting', es: 'Organización de eventos', fr: 'Organisation d\'événements' }
    ],
    exampleKeyPersonnel: [
      { en: 'Bartenders', es: 'Cantineros', fr: 'Barmans' },
      { en: 'Security staff', es: 'Personal de seguridad', fr: 'Personnel de sécurité' },
      { en: 'DJ / Entertainment', es: 'DJ / Entretenimiento', fr: 'DJ / Divertissement' }
    ],
    exampleCustomerBase: [
      { en: 'Tourists', es: 'Turistas', fr: 'Touristes' },
      { en: 'Local residents', es: 'Residentes locales', fr: 'Résidents locaux' },
      { en: 'Young adults', es: 'Adultos jóvenes', fr: 'Jeunes adultes' }
    ],
    minimumEquipment: [
      { en: 'Bar equipment', es: 'Equipamiento de bar', fr: 'Équipement de bar' },
      { en: 'Sound system', es: 'Sistema de sonido', fr: 'Système de son' },
      { en: 'Refrigeration', es: 'Refrigeración', fr: 'Réfrigération' },
      { en: 'Security cameras', es: 'Cámaras de seguridad', fr: 'Caméras de sécurité' }
    ]
  },
  convenience_store: {
    businessTypeId: 'convenience_store',
    description: {
      en: 'Small retail store offering everyday items and quick purchases',
      es: 'Pequeña tienda minorista que ofrece artículos cotidianos y compras rápidas',
      fr: 'Petit magasin de détail offrant des articles quotidiens et des achats rapides'
    },
    exampleBusinessPurposes: [
      { en: 'Provide quick access to everyday items', es: 'Proporcionar acceso rápido a artículos cotidianos', fr: 'Fournir un accès rapide aux articles quotidiens' },
      { en: 'Serve neighborhood convenience needs', es: 'Atender las necesidades de conveniencia del vecindario', fr: 'Répondre aux besoins de commodité du quartier' }
    ],
    exampleProducts: [
      { en: 'Snacks and beverages', es: 'Aperitivos y bebidas', fr: 'Snacks et boissons' },
      { en: 'Basic groceries', es: 'Comestibles básicos', fr: 'Épicerie de base' },
      { en: 'Personal care items', es: 'Artículos de cuidado personal', fr: 'Articles de soins personnels' }
    ],
    exampleKeyPersonnel: [
      { en: 'Store owner / Manager', es: 'Propietario / Gerente de tienda', fr: 'Propriétaire / Gérant du magasin' },
      { en: 'Cashier', es: 'Cajero', fr: 'Caissier' }
    ],
    exampleCustomerBase: [
      { en: 'Neighborhood residents', es: 'Residentes del vecindario', fr: 'Résidents du quartier' },
      { en: 'Passing customers', es: 'Clientes de paso', fr: 'Clients de passage' },
      { en: 'Tourists', es: 'Turistas', fr: 'Touristes' }
    ],
    minimumEquipment: [
      { en: 'Refrigeration', es: 'Refrigeración', fr: 'Réfrigération' },
      { en: 'Shelving', es: 'Estanterías', fr: 'Étagères' },
      { en: 'POS system', es: 'Sistema de punto de venta', fr: 'Système de point de vente' },
      { en: 'Security system', es: 'Sistema de seguridad', fr: 'Système de sécurité' }
    ]
  },
  clothing_store: {
    businessTypeId: 'clothing_store',
    description: {
      en: 'Retail store selling clothing, accessories, and fashion items',
      es: 'Tienda minorista que vende ropa, accesorios y artículos de moda',
      fr: 'Magasin de détail vendant des vêtements, accessoires et articles de mode'
    },
    exampleBusinessPurposes: [
      { en: 'Sell clothing and fashion accessories', es: 'Vender ropa y accesorios de moda', fr: 'Vendre des vêtements et accessoires de mode' },
      { en: 'Provide fashion retail services', es: 'Proporcionar servicios minoristas de moda', fr: 'Fournir des services de vente au détail de mode' }
    ],
    exampleProducts: [
      { en: 'Clothing items', es: 'Artículos de ropa', fr: 'Articles de vêtements' },
      { en: 'Shoes and accessories', es: 'Zapatos y accesorios', fr: 'Chaussures et accessoires' },
      { en: 'Fashion accessories', es: 'Accesorios de moda', fr: 'Accessoires de mode' }
    ],
    exampleKeyPersonnel: [
      { en: 'Store manager', es: 'Gerente de tienda', fr: 'Gérant de magasin' },
      { en: 'Sales associates', es: 'Asociados de ventas', fr: 'Associés de vente' },
      { en: 'Cashiers', es: 'Cajeros', fr: 'Caissiers' }
    ],
    exampleCustomerBase: [
      { en: 'Fashion-conscious consumers', es: 'Consumidores conscientes de la moda', fr: 'Consommateurs soucieux de la mode' },
      { en: 'Tourists', es: 'Turistas', fr: 'Touristes' },
      { en: 'Local residents', es: 'Residentes locales', fr: 'Résidents locaux' }
    ],
    minimumEquipment: [
      { en: 'Clothing racks', es: 'Perchas de ropa', fr: 'Portants à vêtements' },
      { en: 'Display cases', es: 'Vitrinas', fr: 'Vitrines' },
      { en: 'POS system', es: 'Sistema de punto de venta', fr: 'Système de point de vente' },
      { en: 'Fitting rooms', es: 'Probadores', fr: 'Cabines d\'essayage' }
    ]
  },
  hardware_store: {
    businessTypeId: 'hardware_store',
    description: {
      en: 'Retail store selling tools, building materials, and home improvement supplies',
      es: 'Tienda minorista que vende herramientas, materiales de construcción y suministros para mejoras del hogar',
      fr: 'Magasin de détail vendant des outils, des matériaux de construction et des fournitures de rénovation'
    },
    exampleBusinessPurposes: [
      { en: 'Supply building and construction materials', es: 'Suministrar materiales de construcción', fr: 'Fournir des matériaux de construction' },
      { en: 'Provide tools and hardware', es: 'Proporcionar herramientas y ferretería', fr: 'Fournir des outils et de la quincaillerie' }
    ],
    exampleProducts: [
      { en: 'Tools and equipment', es: 'Herramientas y equipamiento', fr: 'Outils et équipement' },
      { en: 'Building materials', es: 'Materiales de construcción', fr: 'Matériaux de construction' },
      { en: 'Paint and supplies', es: 'Pintura y suministros', fr: 'Peinture et fournitures' }
    ],
    exampleKeyPersonnel: [
      { en: 'Store manager', es: 'Gerente de tienda', fr: 'Gérant de magasin' },
      { en: 'Sales staff', es: 'Personal de ventas', fr: 'Personnel de vente' },
      { en: 'Warehouse staff', es: 'Personal de almacén', fr: 'Personnel d\'entrepôt' }
    ],
    exampleCustomerBase: [
      { en: 'Contractors', es: 'Contratistas', fr: 'Entrepreneurs' },
      { en: 'Homeowners', es: 'Propietarios de viviendas', fr: 'Propriétaires' },
      { en: 'DIY enthusiasts', es: 'Entusiastas del bricolaje', fr: 'Passionnés de bricolage' }
    ],
    minimumEquipment: [
      { en: 'Shelving and storage', es: 'Estanterías y almacenamiento', fr: 'Étagères et stockage' },
      { en: 'Tool displays', es: 'Exhibiciones de herramientas', fr: 'Expositions d\'outils' },
      { en: 'POS system', es: 'Sistema de punto de venta', fr: 'Système de point de vente' },
      { en: 'Loading equipment', es: 'Equipamiento de carga', fr: 'Équipement de chargement' }
    ]
  },
  electronics_store: {
    businessTypeId: 'electronics_store',
    description: {
      en: 'Retail store selling electronic devices, appliances, and technology products',
      es: 'Tienda minorista que vende dispositivos electrónicos, electrodomésticos y productos tecnológicos',
      fr: 'Magasin de détail vendant des appareils électroniques, des électroménagers et des produits technologiques'
    },
    exampleBusinessPurposes: [
      { en: 'Sell electronic devices and appliances', es: 'Vender dispositivos electrónicos y electrodomésticos', fr: 'Vendre des appareils électroniques et électroménagers' },
      { en: 'Provide technology solutions', es: 'Proporcionar soluciones tecnológicas', fr: 'Fournir des solutions technologiques' }
    ],
    exampleProducts: [
      { en: 'Mobile phones and tablets', es: 'Teléfonos móviles y tabletas', fr: 'Téléphones portables et tablettes' },
      { en: 'Computers and accessories', es: 'Computadoras y accesorios', fr: 'Ordinateurs et accessoires' },
      { en: 'Home appliances', es: 'Electrodomésticos', fr: 'Électroménagers' }
    ],
    exampleKeyPersonnel: [
      { en: 'Store manager', es: 'Gerente de tienda', fr: 'Gérant de magasin' },
      { en: 'Sales representatives', es: 'Representantes de ventas', fr: 'Représentants commerciaux' },
      { en: 'Technical support', es: 'Soporte técnico', fr: 'Support technique' }
    ],
    exampleCustomerBase: [
      { en: 'Tech-savvy consumers', es: 'Consumidores conocedores de tecnología', fr: 'Consommateurs avertis en technologie' },
      { en: 'Businesses', es: 'Empresas', fr: 'Entreprises' },
      { en: 'Students', es: 'Estudiantes', fr: 'Étudiants' }
    ],
    minimumEquipment: [
      { en: 'Display cases', es: 'Vitrinas', fr: 'Vitrines' },
      { en: 'Security systems', es: 'Sistemas de seguridad', fr: 'Systèmes de sécurité' },
      { en: 'POS system', es: 'Sistema de punto de venta', fr: 'Système de point de vente' },
      { en: 'Testing equipment', es: 'Equipamiento de prueba', fr: 'Équipement de test' }
    ]
  },
  accounting_firm: {
    businessTypeId: 'accounting_firm',
    description: {
      en: 'Professional services firm providing accounting, bookkeeping, and financial services',
      es: 'Firma de servicios profesionales que proporciona servicios contables, de teneduría de libros y financieros',
      fr: 'Cabinet de services professionnels fournissant des services comptables, de tenue de livres et financiers'
    },
    exampleBusinessPurposes: [
      { en: 'Provide accounting and bookkeeping services', es: 'Proporcionar servicios contables y de teneduría de libros', fr: 'Fournir des services comptables et de tenue de livres' },
      { en: 'Offer tax preparation and financial consulting', es: 'Ofrecer preparación de impuestos y consultoría financiera', fr: 'Offrir la préparation des impôts et le conseil financier' }
    ],
    exampleProducts: [
      { en: 'Accounting services', es: 'Servicios contables', fr: 'Services comptables' },
      { en: 'Tax preparation', es: 'Preparación de impuestos', fr: 'Préparation des impôts' },
      { en: 'Financial consulting', es: 'Consultoría financiera', fr: 'Conseil financier' }
    ],
    exampleKeyPersonnel: [
      { en: 'Certified accountant', es: 'Contador certificado', fr: 'Comptable agréé' },
      { en: 'Bookkeeper', es: 'Tenedor de libros', fr: 'Teneur de livres' },
      { en: 'Tax preparer', es: 'Preparador de impuestos', fr: 'Préparateur d\'impôts' }
    ],
    exampleCustomerBase: [
      { en: 'Small businesses', es: 'Pequeñas empresas', fr: 'Petites entreprises' },
      { en: 'Individual taxpayers', es: 'Contribuyentes individuales', fr: 'Contribuables individuels' },
      { en: 'Self-employed professionals', es: 'Profesionales autónomos', fr: 'Professionnels indépendants' }
    ],
    minimumEquipment: [
      { en: 'Computers and software', es: 'Computadoras y software', fr: 'Ordinateurs et logiciels' },
      { en: 'Accounting software', es: 'Software contable', fr: 'Logiciel comptable' },
      { en: 'Filing systems', es: 'Sistemas de archivo', fr: 'Systèmes de classement' },
      { en: 'Office furniture', es: 'Mobiliario de oficina', fr: 'Mobilier de bureau' }
    ]
  },
  law_firm: {
    businessTypeId: 'law_firm',
    description: {
      en: 'Legal services firm providing legal advice and representation',
      es: 'Firma de servicios legales que proporciona asesoramiento y representación legal',
      fr: 'Cabinet d\'avocats fournissant des conseils juridiques et une représentation'
    },
    exampleBusinessPurposes: [
      { en: 'Provide legal representation', es: 'Proporcionar representación legal', fr: 'Fournir une représentation juridique' },
      { en: 'Offer legal advice and consultation', es: 'Ofrecer asesoramiento y consulta legal', fr: 'Offrir des conseils et consultations juridiques' }
    ],
    exampleProducts: [
      { en: 'Legal services', es: 'Servicios legales', fr: 'Services juridiques' },
      { en: 'Legal consultation', es: 'Consulta legal', fr: 'Consultation juridique' },
      { en: 'Document preparation', es: 'Preparación de documentos', fr: 'Préparation de documents' }
    ],
    exampleKeyPersonnel: [
      { en: 'Attorneys / Lawyers', es: 'Abogados', fr: 'Avocats' },
      { en: 'Paralegals', es: 'Asistentes legales', fr: 'Parajuristes' },
      { en: 'Legal secretary', es: 'Secretaria legal', fr: 'Secrétaire juridique' }
    ],
    exampleCustomerBase: [
      { en: 'Individuals', es: 'Individuos', fr: 'Particuliers' },
      { en: 'Businesses', es: 'Empresas', fr: 'Entreprises' },
      { en: 'Organizations', es: 'Organizaciones', fr: 'Organisations' }
    ],
    minimumEquipment: [
      { en: 'Computers and legal software', es: 'Computadoras y software legal', fr: 'Ordinateurs et logiciels juridiques' },
      { en: 'Legal library', es: 'Biblioteca legal', fr: 'Bibliothèque juridique' },
      { en: 'Filing systems', es: 'Sistemas de archivo', fr: 'Systèmes de classement' },
      { en: 'Office furniture', es: 'Mobiliario de oficina', fr: 'Mobilier de bureau' }
    ]
  },
  real_estate_agency: {
    businessTypeId: 'real_estate_agency',
    description: {
      en: 'Agency facilitating property sales, rentals, and real estate transactions',
      es: 'Agencia que facilita ventas de propiedades, alquileres y transacciones inmobiliarias',
      fr: 'Agence facilitant les ventes de propriétés, les locations et les transactions immobilières'
    },
    exampleBusinessPurposes: [
      { en: 'Facilitate property sales and purchases', es: 'Facilitar ventas y compras de propiedades', fr: 'Faciliter les ventes et achats de propriétés' },
      { en: 'Manage property rentals', es: 'Gestionar alquileres de propiedades', fr: 'Gérer les locations de propriétés' }
    ],
    exampleProducts: [
      { en: 'Property listings', es: 'Listados de propiedades', fr: 'Annonces immobilières' },
      { en: 'Real estate services', es: 'Servicios inmobiliarios', fr: 'Services immobiliers' },
      { en: 'Property management', es: 'Gestión de propiedades', fr: 'Gestion immobilière' }
    ],
    exampleKeyPersonnel: [
      { en: 'Real estate agents', es: 'Agentes inmobiliarios', fr: 'Agents immobiliers' },
      { en: 'Property manager', es: 'Administrador de propiedades', fr: 'Gestionnaire de propriétés' },
      { en: 'Administrative staff', es: 'Personal administrativo', fr: 'Personnel administratif' }
    ],
    exampleCustomerBase: [
      { en: 'Property buyers', es: 'Compradores de propiedades', fr: 'Acheteurs de propriétés' },
      { en: 'Property sellers', es: 'Vendedores de propiedades', fr: 'Vendeurs de propriétés' },
      { en: 'Renters', es: 'Inquilinos', fr: 'Locataires' }
    ],
    minimumEquipment: [
      { en: 'Computers and MLS system', es: 'Computadoras y sistema MLS', fr: 'Ordinateurs et système MLS' },
      { en: 'Property photography equipment', es: 'Equipamiento de fotografía de propiedades', fr: 'Équipement de photographie immobilière' },
      { en: 'Office furniture', es: 'Mobiliario de oficina', fr: 'Mobilier de bureau' },
      { en: 'Marketing materials', es: 'Materiales de marketing', fr: 'Matériel marketing' }
    ]
  },
  insurance_agency: {
    businessTypeId: 'insurance_agency',
    description: {
      en: 'Agency selling insurance policies and providing insurance services',
      es: 'Agencia que vende pólizas de seguro y proporciona servicios de seguros',
      fr: 'Agence vendant des polices d\'assurance et fournissant des services d\'assurance'
    },
    exampleBusinessPurposes: [
      { en: 'Sell insurance policies', es: 'Vender pólizas de seguro', fr: 'Vendre des polices d\'assurance' },
      { en: 'Provide insurance consultation', es: 'Proporcionar consultoría de seguros', fr: 'Fournir des conseils en assurance' }
    ],
    exampleProducts: [
      { en: 'Insurance policies', es: 'Pólizas de seguro', fr: 'Polices d\'assurance' },
      { en: 'Insurance consultation', es: 'Consulta de seguros', fr: 'Consultation d\'assurance' },
      { en: 'Claims processing', es: 'Procesamiento de reclamos', fr: 'Traitement des réclamations' }
    ],
    exampleKeyPersonnel: [
      { en: 'Insurance agents', es: 'Agentes de seguros', fr: 'Agents d\'assurance' },
      { en: 'Claims adjuster', es: 'Ajustador de reclamos', fr: 'Expert en sinistres' },
      { en: 'Administrative staff', es: 'Personal administrativo', fr: 'Personnel administratif' }
    ],
    exampleCustomerBase: [
      { en: 'Individual policyholders', es: 'Asegurados individuales', fr: 'Assurés individuels' },
      { en: 'Businesses', es: 'Empresas', fr: 'Entreprises' },
      { en: 'Property owners', es: 'Propietarios', fr: 'Propriétaires' }
    ],
    minimumEquipment: [
      { en: 'Computers and insurance software', es: 'Computadoras y software de seguros', fr: 'Ordinateurs et logiciel d\'assurance' },
      { en: 'Office furniture', es: 'Mobiliario de oficina', fr: 'Mobilier de bureau' },
      { en: 'Filing systems', es: 'Sistemas de archivo', fr: 'Systèmes de classement' },
      { en: 'Communication equipment', es: 'Equipamiento de comunicación', fr: 'Équipement de communication' }
    ]
  },
  hair_salon: {
    businessTypeId: 'hair_salon',
    description: {
      en: 'Beauty salon providing hair cutting, styling, and beauty services',
      es: 'Salón de belleza que proporciona servicios de corte de cabello, peinado y belleza',
      fr: 'Salon de beauté offrant des services de coupe de cheveux, coiffure et beauté'
    },
    exampleBusinessPurposes: [
      { en: 'Provide hair cutting and styling services', es: 'Proporcionar servicios de corte y peinado', fr: 'Fournir des services de coupe et de coiffure' },
      { en: 'Offer beauty and grooming services', es: 'Ofrecer servicios de belleza y cuidado personal', fr: 'Offrir des services de beauté et de toilettage' }
    ],
    exampleProducts: [
      { en: 'Haircuts and styling', es: 'Cortes y peinados', fr: 'Coupes et coiffures' },
      { en: 'Hair coloring', es: 'Coloración de cabello', fr: 'Coloration des cheveux' },
      { en: 'Beauty treatments', es: 'Tratamientos de belleza', fr: 'Traitements de beauté' }
    ],
    exampleKeyPersonnel: [
      { en: 'Hair stylists', es: 'Estilistas', fr: 'Coiffeurs' },
      { en: 'Barbers', es: 'Barberos', fr: 'Barbiers' },
      { en: 'Receptionist', es: 'Recepcionista', fr: 'Réceptionniste' }
    ],
    exampleCustomerBase: [
      { en: 'Local residents', es: 'Residentes locales', fr: 'Résidents locaux' },
      { en: 'Tourists', es: 'Turistas', fr: 'Touristes' },
      { en: 'Professionals', es: 'Profesionales', fr: 'Professionnels' }
    ],
    minimumEquipment: [
      { en: 'Hair styling equipment', es: 'Equipamiento de peinado', fr: 'Équipement de coiffure' },
      { en: 'Styling chairs', es: 'Sillas de peinado', fr: 'Chaises de coiffure' },
      { en: 'Hair dryers', es: 'Secadores de cabello', fr: 'Sèche-cheveux' },
      { en: 'Washing stations', es: 'Estaciones de lavado', fr: 'Stations de lavage' }
    ]
  },
  spa_wellness: {
    businessTypeId: 'spa_wellness',
    description: {
      en: 'Wellness center offering spa treatments, massages, and relaxation services',
      es: 'Centro de bienestar que ofrece tratamientos de spa, masajes y servicios de relajación',
      fr: 'Centre de bien-être offrant des traitements de spa, massages et services de relaxation'
    },
    exampleBusinessPurposes: [
      { en: 'Provide relaxation and wellness services', es: 'Proporcionar servicios de relajación y bienestar', fr: 'Fournir des services de relaxation et de bien-être' },
      { en: 'Offer spa treatments and massages', es: 'Ofrecer tratamientos de spa y masajes', fr: 'Offrir des traitements de spa et des massages' }
    ],
    exampleProducts: [
      { en: 'Massage services', es: 'Servicios de masaje', fr: 'Services de massage' },
      { en: 'Facial treatments', es: 'Tratamientos faciales', fr: 'Traitements faciaux' },
      { en: 'Body treatments', es: 'Tratamientos corporales', fr: 'Traitements corporels' }
    ],
    exampleKeyPersonnel: [
      { en: 'Massage therapists', es: 'Terapeutas de masaje', fr: 'Massothérapeutes' },
      { en: 'Estheticians', es: 'Esteticistas', fr: 'Esthéticiennes' },
      { en: 'Receptionist', es: 'Recepcionista', fr: 'Réceptionniste' }
    ],
    exampleCustomerBase: [
      { en: 'Tourists', es: 'Turistas', fr: 'Touristes' },
      { en: 'Local residents', es: 'Residentes locales', fr: 'Résidents locaux' },
      { en: 'Wellness enthusiasts', es: 'Entusiastas del bienestar', fr: 'Passionnés de bien-être' }
    ],
    minimumEquipment: [
      { en: 'Massage tables', es: 'Mesas de masaje', fr: 'Tables de massage' },
      { en: 'Spa equipment', es: 'Equipamiento de spa', fr: 'Équipement de spa' },
      { en: 'Treatment rooms', es: 'Salas de tratamiento', fr: 'Salles de traitement' },
      { en: 'Relaxation areas', es: 'Áreas de relajación', fr: 'Espaces de détente' }
    ]
  },
  gym_fitness: {
    businessTypeId: 'gym_fitness',
    description: {
      en: 'Fitness center providing exercise equipment and fitness training',
      es: 'Centro de fitness que proporciona equipamiento de ejercicio y entrenamiento físico',
      fr: 'Centre de fitness offrant des équipements d\'exercice et des entraînements'
    },
    exampleBusinessPurposes: [
      { en: 'Provide fitness and exercise facilities', es: 'Proporcionar instalaciones de fitness y ejercicio', fr: 'Fournir des installations de fitness et d\'exercice' },
      { en: 'Offer fitness training and classes', es: 'Ofrecer entrenamiento físico y clases', fr: 'Offrir des entraînements et des cours de fitness' }
    ],
    exampleProducts: [
      { en: 'Gym membership', es: 'Membresía de gimnasio', fr: 'Adhésion au gymnase' },
      { en: 'Fitness classes', es: 'Clases de fitness', fr: 'Cours de fitness' },
      { en: 'Personal training', es: 'Entrenamiento personal', fr: 'Entraînement personnel' }
    ],
    exampleKeyPersonnel: [
      { en: 'Fitness trainers', es: 'Entrenadores físicos', fr: 'Entraîneurs de fitness' },
      { en: 'Gym manager', es: 'Gerente de gimnasio', fr: 'Gérant du gymnase' },
      { en: 'Front desk staff', es: 'Personal de recepción', fr: 'Personnel de réception' }
    ],
    exampleCustomerBase: [
      { en: 'Fitness enthusiasts', es: 'Entusiastas del fitness', fr: 'Passionnés de fitness' },
      { en: 'Local residents', es: 'Residentes locales', fr: 'Résidents locaux' },
      { en: 'Athletes', es: 'Atletas', fr: 'Athlètes' }
    ],
    minimumEquipment: [
      { en: 'Exercise equipment', es: 'Equipamiento de ejercicio', fr: 'Équipement d\'exercice' },
      { en: 'Cardio machines', es: 'Máquinas cardiovasculares', fr: 'Machines cardio' },
      { en: 'Weight training equipment', es: 'Equipamiento de entrenamiento con pesas', fr: 'Équipement d\'entraînement en force' },
      { en: 'Locker rooms', es: 'Vestuarios', fr: 'Vestiaires' }
    ]
  },
  laundromat: {
    businessTypeId: 'laundromat',
    description: {
      en: 'Self-service laundry facility with washing and drying machines',
      es: 'Instalación de lavandería de autoservicio con máquinas de lavado y secado',
      fr: 'Laverie libre-service avec machines à laver et sécher'
    },
    exampleBusinessPurposes: [
      { en: 'Provide laundry services', es: 'Proporcionar servicios de lavandería', fr: 'Fournir des services de blanchisserie' },
      { en: 'Offer dry cleaning services', es: 'Ofrecer servicios de limpieza en seco', fr: 'Offrir des services de nettoyage à sec' }
    ],
    exampleProducts: [
      { en: 'Washing services', es: 'Servicios de lavado', fr: 'Services de lavage' },
      { en: 'Drying services', es: 'Servicios de secado', fr: 'Services de séchage' },
      { en: 'Dry cleaning', es: 'Limpieza en seco', fr: 'Nettoyage à sec' }
    ],
    exampleKeyPersonnel: [
      { en: 'Attendant', es: 'Atendente', fr: 'Préposé' },
      { en: 'Dry cleaning operator', es: 'Operador de limpieza en seco', fr: 'Opérateur de nettoyage à sec' }
    ],
    exampleCustomerBase: [
      { en: 'Local residents', es: 'Residentes locales', fr: 'Résidents locaux' },
      { en: 'Students', es: 'Estudiantes', fr: 'Étudiants' },
      { en: 'Tourists', es: 'Turistas', fr: 'Touristes' }
    ],
    minimumEquipment: [
      { en: 'Washing machines', es: 'Lavadoras', fr: 'Machines à laver' },
      { en: 'Dryers', es: 'Secadoras', fr: 'Sécheuses' },
      { en: 'Dry cleaning equipment', es: 'Equipamiento de limpieza en seco', fr: 'Équipement de nettoyage à sec' },
      { en: 'Change machine', es: 'Máquina de cambio', fr: 'Distributeur de monnaie' }
    ]
  },
  auto_repair: {
    businessTypeId: 'auto_repair',
    description: {
      en: 'Automotive repair shop providing vehicle maintenance and repair services',
      es: 'Taller de reparación automotriz que proporciona servicios de mantenimiento y reparación de vehículos',
      fr: 'Atelier de réparation automobile offrant des services d\'entretien et de réparation de véhicules'
    },
    exampleBusinessPurposes: [
      { en: 'Provide vehicle repair and maintenance', es: 'Proporcionar reparación y mantenimiento de vehículos', fr: 'Fournir la réparation et l\'entretien de véhicules' },
      { en: 'Offer automotive diagnostic services', es: 'Ofrecer servicios de diagnóstico automotriz', fr: 'Offrir des services de diagnostic automobile' }
    ],
    exampleProducts: [
      { en: 'Vehicle repairs', es: 'Reparaciones de vehículos', fr: 'Réparations de véhicules' },
      { en: 'Maintenance services', es: 'Servicios de mantenimiento', fr: 'Services d\'entretien' },
      { en: 'Parts and supplies', es: 'Repuestos y suministros', fr: 'Pièces et fournitures' }
    ],
    exampleKeyPersonnel: [
      { en: 'Mechanics', es: 'Mecánicos', fr: 'Mécaniciens' },
      { en: 'Service advisor', es: 'Asesor de servicio', fr: 'Conseiller de service' },
      { en: 'Parts manager', es: 'Gerente de repuestos', fr: 'Gérant de pièces' }
    ],
    exampleCustomerBase: [
      { en: 'Vehicle owners', es: 'Propietarios de vehículos', fr: 'Propriétaires de véhicules' },
      { en: 'Fleet operators', es: 'Operadores de flotas', fr: 'Exploitants de flottes' },
      { en: 'Commercial vehicles', es: 'Vehículos comerciales', fr: 'Véhicules commerciaux' }
    ],
    minimumEquipment: [
      { en: 'Lift equipment', es: 'Equipamiento de elevación', fr: 'Équipement de levage' },
      { en: 'Diagnostic tools', es: 'Herramientas de diagnóstico', fr: 'Outils de diagnostic' },
      { en: 'Hand tools', es: 'Herramientas manuales', fr: 'Outils manuels' },
      { en: 'Parts storage', es: 'Almacenamiento de repuestos', fr: 'Stockage de pièces' }
    ]
  },
  car_wash: {
    businessTypeId: 'car_wash',
    description: {
      en: 'Car wash facility providing vehicle cleaning and detailing services',
      es: 'Instalación de lavado de autos que proporciona servicios de limpieza y detallado de vehículos',
      fr: 'Lave-auto offrant des services de nettoyage et de finition de véhicules'
    },
    exampleBusinessPurposes: [
      { en: 'Provide vehicle cleaning services', es: 'Proporcionar servicios de limpieza de vehículos', fr: 'Fournir des services de nettoyage de véhicules' },
      { en: 'Offer detailing and waxing', es: 'Ofrecer detallado y encerado', fr: 'Offrir la finition et le cirage' }
    ],
    exampleProducts: [
      { en: 'Car wash services', es: 'Servicios de lavado de autos', fr: 'Services de lavage de voitures' },
      { en: 'Detailing services', es: 'Servicios de detallado', fr: 'Services de finition' },
      { en: 'Waxing and polishing', es: 'Encerado y pulido', fr: 'Cirage et polissage' }
    ],
    exampleKeyPersonnel: [
      { en: 'Car wash attendants', es: 'Atendentes de lavado', fr: 'Préposés au lavage' },
      { en: 'Detailers', es: 'Detalladores', fr: 'Finisseurs' }
    ],
    exampleCustomerBase: [
      { en: 'Vehicle owners', es: 'Propietarios de vehículos', fr: 'Propriétaires de véhicules' },
      { en: 'Fleet operators', es: 'Operadores de flotas', fr: 'Exploitants de flottes' },
      { en: 'Tourists', es: 'Turistas', fr: 'Touristes' }
    ],
    minimumEquipment: [
      { en: 'Washing equipment', es: 'Equipamiento de lavado', fr: 'Équipement de lavage' },
      { en: 'Water system', es: 'Sistema de agua', fr: 'Système d\'eau' },
      { en: 'Vacuum cleaners', es: 'Aspiradoras', fr: 'Aspirateurs' },
      { en: 'Detailing supplies', es: 'Suministros de detallado', fr: 'Fournitures de finition' }
    ]
  },
  general_contractor: {
    businessTypeId: 'general_contractor',
    description: {
      en: 'Construction contractor managing building and renovation projects',
      es: 'Contratista de construcción que gestiona proyectos de construcción y renovación',
      fr: 'Entrepreneur général gérant des projets de construction et de rénovation'
    },
    exampleBusinessPurposes: [
      { en: 'Manage construction projects', es: 'Gestionar proyectos de construcción', fr: 'Gérer des projets de construction' },
      { en: 'Provide building and renovation services', es: 'Proporcionar servicios de construcción y renovación', fr: 'Fournir des services de construction et de rénovation' }
    ],
    exampleProducts: [
      { en: 'Construction services', es: 'Servicios de construcción', fr: 'Services de construction' },
      { en: 'Renovation services', es: 'Servicios de renovación', fr: 'Services de rénovation' },
      { en: 'Project management', es: 'Gestión de proyectos', fr: 'Gestion de projet' }
    ],
    exampleKeyPersonnel: [
      { en: 'Project manager', es: 'Gerente de proyecto', fr: 'Chef de projet' },
      { en: 'Construction workers', es: 'Trabajadores de construcción', fr: 'Ouvriers de construction' },
      { en: 'Site supervisor', es: 'Supervisor de obra', fr: 'Superviseur de chantier' }
    ],
    exampleCustomerBase: [
      { en: 'Homeowners', es: 'Propietarios de viviendas', fr: 'Propriétaires' },
      { en: 'Businesses', es: 'Empresas', fr: 'Entreprises' },
      { en: 'Property developers', es: 'Desarrolladores inmobiliarios', fr: 'Promoteurs immobiliers' }
    ],
    minimumEquipment: [
      { en: 'Construction tools', es: 'Herramientas de construcción', fr: 'Outils de construction' },
      { en: 'Heavy machinery', es: 'Maquinaria pesada', fr: 'Machinerie lourde' },
      { en: 'Safety equipment', es: 'Equipamiento de seguridad', fr: 'Équipement de sécurité' },
      { en: 'Transportation vehicles', es: 'Vehículos de transporte', fr: 'Véhicules de transport' }
    ]
  },
  plumber: {
    businessTypeId: 'plumber',
    description: {
      en: 'Plumbing services provider for installation, repair, and maintenance',
      es: 'Proveedor de servicios de plomería para instalación, reparación y mantenimiento',
      fr: 'Fournisseur de services de plomberie pour l\'installation, la réparation et l\'entretien'
    },
    exampleBusinessPurposes: [
      { en: 'Provide plumbing installation and repair', es: 'Proporcionar instalación y reparación de plomería', fr: 'Fournir l\'installation et la réparation de plomberie' },
      { en: 'Offer emergency plumbing services', es: 'Ofrecer servicios de plomería de emergencia', fr: 'Offrir des services de plomberie d\'urgence' }
    ],
    exampleProducts: [
      { en: 'Plumbing installation', es: 'Instalación de plomería', fr: 'Installation de plomberie' },
      { en: 'Plumbing repairs', es: 'Reparaciones de plomería', fr: 'Réparations de plomberie' },
      { en: 'Maintenance services', es: 'Servicios de mantenimiento', fr: 'Services d\'entretien' }
    ],
    exampleKeyPersonnel: [
      { en: 'Licensed plumber', es: 'Fontanero licenciado', fr: 'Plombier agréé' },
      { en: 'Plumbing assistant', es: 'Asistente de plomería', fr: 'Assistant plombier' }
    ],
    exampleCustomerBase: [
      { en: 'Homeowners', es: 'Propietarios de viviendas', fr: 'Propriétaires' },
      { en: 'Businesses', es: 'Empresas', fr: 'Entreprises' },
      { en: 'Property managers', es: 'Administradores de propiedades', fr: 'Gestionnaires de propriétés' }
    ],
    minimumEquipment: [
      { en: 'Plumbing tools', es: 'Herramientas de plomería', fr: 'Outils de plomberie' },
      { en: 'Pipe cutting equipment', es: 'Equipamiento de corte de tuberías', fr: 'Équipement de coupe de tuyaux' },
      { en: 'Service vehicle', es: 'Vehículo de servicio', fr: 'Véhicule de service' },
      { en: 'Parts inventory', es: 'Inventario de repuestos', fr: 'Inventaire de pièces' }
    ]
  },
  electrician: {
    businessTypeId: 'electrician',
    description: {
      en: 'Electrical services provider for installation, repair, and maintenance',
      es: 'Proveedor de servicios eléctricos para instalación, reparación y mantenimiento',
      fr: 'Fournisseur de services électriques pour l\'installation, la réparation et l\'entretien'
    },
    exampleBusinessPurposes: [
      { en: 'Provide electrical installation and repair', es: 'Proporcionar instalación y reparación eléctrica', fr: 'Fournir l\'installation et la réparation électriques' },
      { en: 'Offer electrical safety inspections', es: 'Ofrecer inspecciones de seguridad eléctrica', fr: 'Offrir des inspections de sécurité électrique' }
    ],
    exampleProducts: [
      { en: 'Electrical installation', es: 'Instalación eléctrica', fr: 'Installation électrique' },
      { en: 'Electrical repairs', es: 'Reparaciones eléctricas', fr: 'Réparations électriques' },
      { en: 'Safety inspections', es: 'Inspecciones de seguridad', fr: 'Inspections de sécurité' }
    ],
    exampleKeyPersonnel: [
      { en: 'Licensed electrician', es: 'Electricista licenciado', fr: 'Électricien agréé' },
      { en: 'Electrical apprentice', es: 'Aprendiz de electricista', fr: 'Apprenti électricien' }
    ],
    exampleCustomerBase: [
      { en: 'Homeowners', es: 'Propietarios de viviendas', fr: 'Propriétaires' },
      { en: 'Businesses', es: 'Empresas', fr: 'Entreprises' },
      { en: 'Contractors', es: 'Contratistas', fr: 'Entrepreneurs' }
    ],
    minimumEquipment: [
      { en: 'Electrical tools', es: 'Herramientas eléctricas', fr: 'Outils électriques' },
      { en: 'Testing equipment', es: 'Equipamiento de prueba', fr: 'Équipement de test' },
      { en: 'Service vehicle', es: 'Vehículo de servicio', fr: 'Véhicule de service' },
      { en: 'Wire and supplies', es: 'Cable y suministros', fr: 'Fil et fournitures' }
    ]
  },
  medical_clinic: {
    businessTypeId: 'medical_clinic',
    description: {
      en: 'Medical facility providing healthcare services and consultations',
      es: 'Instalación médica que proporciona servicios de salud y consultas',
      fr: 'Établissement médical fournissant des services de santé et des consultations'
    },
    exampleBusinessPurposes: [
      { en: 'Provide medical consultations', es: 'Proporcionar consultas médicas', fr: 'Fournir des consultations médicales' },
      { en: 'Offer healthcare services', es: 'Ofrecer servicios de salud', fr: 'Offrir des services de santé' }
    ],
    exampleProducts: [
      { en: 'Medical consultations', es: 'Consultas médicas', fr: 'Consultations médicales' },
      { en: 'Diagnostic services', es: 'Servicios de diagnóstico', fr: 'Services de diagnostic' },
      { en: 'Treatment services', es: 'Servicios de tratamiento', fr: 'Services de traitement' }
    ],
    exampleKeyPersonnel: [
      { en: 'Doctors / Physicians', es: 'Doctores / Médicos', fr: 'Médecins' },
      { en: 'Nurses', es: 'Enfermeras', fr: 'Infirmières' },
      { en: 'Medical assistants', es: 'Asistentes médicos', fr: 'Assistants médicaux' }
    ],
    exampleCustomerBase: [
      { en: 'Patients', es: 'Pacientes', fr: 'Patients' },
      { en: 'Local residents', es: 'Residentes locales', fr: 'Résidents locaux' },
      { en: 'Tourists', es: 'Turistas', fr: 'Touristes' }
    ],
    minimumEquipment: [
      { en: 'Medical equipment', es: 'Equipamiento médico', fr: 'Équipement médical' },
      { en: 'Examination rooms', es: 'Salas de examen', fr: 'Salles d\'examen' },
      { en: 'Medical records system', es: 'Sistema de registros médicos', fr: 'Système de dossiers médicaux' },
      { en: 'Pharmaceutical storage', es: 'Almacenamiento farmacéutico', fr: 'Stockage pharmaceutique' }
    ]
  },
  dental_clinic: {
    businessTypeId: 'dental_clinic',
    description: {
      en: 'Dental facility providing oral healthcare and dental treatments',
      es: 'Instalación dental que proporciona atención de salud oral y tratamientos dentales',
      fr: 'Établissement dentaire fournissant des soins de santé bucco-dentaire et des traitements dentaires'
    },
    exampleBusinessPurposes: [
      { en: 'Provide dental care services', es: 'Proporcionar servicios de atención dental', fr: 'Fournir des services de soins dentaires' },
      { en: 'Offer preventive and restorative treatments', es: 'Ofrecer tratamientos preventivos y restaurativos', fr: 'Offrir des traitements préventifs et restaurateurs' }
    ],
    exampleProducts: [
      { en: 'Dental cleanings', es: 'Limpiezas dentales', fr: 'Nettoyages dentaires' },
      { en: 'Fillings and restorations', es: 'Empastes y restauraciones', fr: 'Plombages et restaurations' },
      { en: 'Dental procedures', es: 'Procedimientos dentales', fr: 'Procédures dentaires' }
    ],
    exampleKeyPersonnel: [
      { en: 'Dentist', es: 'Dentista', fr: 'Dentiste' },
      { en: 'Dental hygienist', es: 'Higienista dental', fr: 'Hygiéniste dentaire' },
      { en: 'Dental assistant', es: 'Asistente dental', fr: 'Assistant dentaire' }
    ],
    exampleCustomerBase: [
      { en: 'Patients', es: 'Pacientes', fr: 'Patients' },
      { en: 'Local residents', es: 'Residentes locales', fr: 'Résidents locaux' },
      { en: 'Children and families', es: 'Niños y familias', fr: 'Enfants et familles' }
    ],
    minimumEquipment: [
      { en: 'Dental chairs', es: 'Sillas dentales', fr: 'Chaises dentaires' },
      { en: 'Dental equipment', es: 'Equipamiento dental', fr: 'Équipement dentaire' },
      { en: 'X-ray equipment', es: 'Equipamiento de rayos X', fr: 'Équipement de radiographie' },
      { en: 'Sterilization equipment', es: 'Equipamiento de esterilización', fr: 'Équipement de stérilisation' }
    ]
  },
  bakery: {
    businessTypeId: 'bakery',
    description: {
      en: 'Bakery producing and selling baked goods, bread, and pastries',
      es: 'Panadería que produce y vende productos horneados, pan y pasteles',
      fr: 'Boulangerie produisant et vendant des produits de boulangerie, du pain et des pâtisseries'
    },
    exampleBusinessPurposes: [
      { en: 'Produce fresh baked goods', es: 'Producir productos horneados frescos', fr: 'Produire des produits de boulangerie frais' },
      { en: 'Sell bread, pastries, and desserts', es: 'Vender pan, pasteles y postres', fr: 'Vendre du pain, des pâtisseries et des desserts' }
    ],
    exampleProducts: [
      { en: 'Fresh bread', es: 'Pan fresco', fr: 'Pain frais' },
      { en: 'Pastries and cakes', es: 'Pasteles y tortas', fr: 'Pâtisseries et gâteaux' },
      { en: 'Cookies and desserts', es: 'Galletas y postres', fr: 'Biscuits et desserts' }
    ],
    exampleKeyPersonnel: [
      { en: 'Baker', es: 'Panadero', fr: 'Boulanger' },
      { en: 'Pastry chef', es: 'Pastelero', fr: 'Pâtissier' },
      { en: 'Sales staff', es: 'Personal de ventas', fr: 'Personnel de vente' }
    ],
    exampleCustomerBase: [
      { en: 'Local residents', es: 'Residentes locales', fr: 'Résidents locaux' },
      { en: 'Restaurants', es: 'Restaurantes', fr: 'Restaurants' },
      { en: 'Tourists', es: 'Turistas', fr: 'Touristes' }
    ],
    minimumEquipment: [
      { en: 'Ovens', es: 'Hornos', fr: 'Fours' },
      { en: 'Mixers', es: 'Batidoras', fr: 'Batteurs' },
      { en: 'Refrigeration', es: 'Refrigeración', fr: 'Réfrigération' },
      { en: 'Display cases', es: 'Vitrinas', fr: 'Vitrines' }
    ]
  },
  farm_agriculture: {
    businessTypeId: 'farm_agriculture',
    description: {
      en: 'Agricultural business producing crops, livestock, or agricultural products',
      es: 'Negocio agrícola que produce cultivos, ganado o productos agrícolas',
      fr: 'Entreprise agricole produisant des cultures, du bétail ou des produits agricoles'
    },
    exampleBusinessPurposes: [
      { en: 'Produce agricultural crops', es: 'Producir cultivos agrícolas', fr: 'Produire des cultures agricoles' },
      { en: 'Raise livestock', es: 'Criar ganado', fr: 'Élever du bétail' },
      { en: 'Supply agricultural products', es: 'Suministrar productos agrícolas', fr: 'Fournir des produits agricoles' }
    ],
    exampleProducts: [
      { en: 'Fresh produce', es: 'Productos frescos', fr: 'Produits frais' },
      { en: 'Livestock', es: 'Ganado', fr: 'Bétail' },
      { en: 'Agricultural products', es: 'Productos agrícolas', fr: 'Produits agricoles' }
    ],
    exampleKeyPersonnel: [
      { en: 'Farm owner / Manager', es: 'Propietario / Gerente de granja', fr: 'Propriétaire / Gérant de ferme' },
      { en: 'Farm workers', es: 'Trabajadores agrícolas', fr: 'Ouvriers agricoles' },
      { en: 'Livestock handlers', es: 'Manejadores de ganado', fr: 'Manipulateurs de bétail' }
    ],
    exampleCustomerBase: [
      { en: 'Local markets', es: 'Mercados locales', fr: 'Marchés locaux' },
      { en: 'Restaurants', es: 'Restaurantes', fr: 'Restaurants' },
      { en: 'Grocery stores', es: 'Tiendas de comestibles', fr: 'Épiceries' }
    ],
    minimumEquipment: [
      { en: 'Farming equipment', es: 'Equipamiento agrícola', fr: 'Équipement agricole' },
      { en: 'Irrigation systems', es: 'Sistemas de riego', fr: 'Systèmes d\'irrigation' },
      { en: 'Storage facilities', es: 'Instalaciones de almacenamiento', fr: 'Installations de stockage' },
      { en: 'Transportation vehicles', es: 'Vehículos de transporte', fr: 'Véhicules de transport' }
    ]
  },
  tutoring_center: {
    businessTypeId: 'tutoring_center',
    description: {
      en: 'Educational center providing tutoring and private lessons',
      es: 'Centro educativo que proporciona tutoría y clases privadas',
      fr: 'Centre éducatif offrant du tutorat et des cours privés'
    },
    exampleBusinessPurposes: [
      { en: 'Provide educational tutoring', es: 'Proporcionar tutoría educativa', fr: 'Fournir du tutorat éducatif' },
      { en: 'Offer test preparation', es: 'Ofrecer preparación para exámenes', fr: 'Offrir la préparation aux examens' }
    ],
    exampleProducts: [
      { en: 'Tutoring sessions', es: 'Sesiones de tutoría', fr: 'Sessions de tutorat' },
      { en: 'Test preparation', es: 'Preparación para exámenes', fr: 'Préparation aux examens' },
      { en: 'Academic support', es: 'Apoyo académico', fr: 'Soutien académique' }
    ],
    exampleKeyPersonnel: [
      { en: 'Tutors', es: 'Tutores', fr: 'Tuteurs' },
      { en: 'Center director', es: 'Director del centro', fr: 'Directeur du centre' },
      { en: 'Administrative staff', es: 'Personal administrativo', fr: 'Personnel administratif' }
    ],
    exampleCustomerBase: [
      { en: 'Students', es: 'Estudiantes', fr: 'Étudiants' },
      { en: 'Parents', es: 'Padres', fr: 'Parents' },
      { en: 'Adult learners', es: 'Estudiantes adultos', fr: 'Apprenants adultes' }
    ],
    minimumEquipment: [
      { en: 'Classroom furniture', es: 'Mobiliario de aula', fr: 'Mobilier de classe' },
      { en: 'Teaching materials', es: 'Materiales de enseñanza', fr: 'Matériel pédagogique' },
      { en: 'Computers', es: 'Computadoras', fr: 'Ordinateurs' },
      { en: 'Whiteboards', es: 'Pizarras', fr: 'Tableaux blancs' }
    ]
  },
  daycare: {
    businessTypeId: 'daycare',
    description: {
      en: 'Childcare facility providing care and early education for children',
      es: 'Instalación de cuidado infantil que proporciona cuidado y educación temprana para niños',
      fr: 'Établissement de garde d\'enfants offrant des soins et une éducation précoce'
    },
    exampleBusinessPurposes: [
      { en: 'Provide childcare services', es: 'Proporcionar servicios de cuidado infantil', fr: 'Fournir des services de garde d\'enfants' },
      { en: 'Offer early childhood education', es: 'Ofrecer educación infantil temprana', fr: 'Offrir une éducation de la petite enfance' }
    ],
    exampleProducts: [
      { en: 'Childcare services', es: 'Servicios de cuidado infantil', fr: 'Services de garde d\'enfants' },
      { en: 'Early education programs', es: 'Programas de educación temprana', fr: 'Programmes d\'éducation précoce' },
      { en: 'After-school care', es: 'Cuidado después de la escuela', fr: 'Garde après l\'école' }
    ],
    exampleKeyPersonnel: [
      { en: 'Childcare providers', es: 'Proveedores de cuidado infantil', fr: 'Fournisseurs de garde d\'enfants' },
      { en: 'Early childhood educators', es: 'Educadores de la primera infancia', fr: 'Éducateurs de la petite enfance' },
      { en: 'Administrator', es: 'Administrador', fr: 'Administrateur' }
    ],
    exampleCustomerBase: [
      { en: 'Working parents', es: 'Padres trabajadores', fr: 'Parents qui travaillent' },
      { en: 'Families', es: 'Familias', fr: 'Familles' },
      { en: 'Single parents', es: 'Padres solteros', fr: 'Parents célibataires' }
    ],
    minimumEquipment: [
      { en: 'Child-safe furniture', es: 'Mobiliario seguro para niños', fr: 'Mobilier sécurisé pour enfants' },
      { en: 'Educational toys', es: 'Juguetes educativos', fr: 'Jouets éducatifs' },
      { en: 'Play equipment', es: 'Equipamiento de juego', fr: 'Équipement de jeu' },
      { en: 'Safety equipment', es: 'Equipamiento de seguridad', fr: 'Équipement de sécurité' }
    ]
  },
  it_services: {
    businessTypeId: 'it_services',
    description: {
      en: 'IT services provider offering computer repair, support, and technology solutions',
      es: 'Proveedor de servicios de TI que ofrece reparación de computadoras, soporte y soluciones tecnológicas',
      fr: 'Fournisseur de services informatiques offrant réparation d\'ordinateurs, support et solutions technologiques'
    },
    exampleBusinessPurposes: [
      { en: 'Provide computer repair services', es: 'Proporcionar servicios de reparación de computadoras', fr: 'Fournir des services de réparation d\'ordinateurs' },
      { en: 'Offer IT support and consulting', es: 'Ofrecer soporte y consultoría de TI', fr: 'Offrir le support et le conseil informatiques' }
    ],
    exampleProducts: [
      { en: 'Computer repairs', es: 'Reparaciones de computadoras', fr: 'Réparations d\'ordinateurs' },
      { en: 'IT support services', es: 'Servicios de soporte de TI', fr: 'Services de support informatique' },
      { en: 'Technology consulting', es: 'Consultoría tecnológica', fr: 'Conseil technologique' }
    ],
    exampleKeyPersonnel: [
      { en: 'IT technicians', es: 'Técnicos de TI', fr: 'Techniciens informatiques' },
      { en: 'IT consultant', es: 'Consultor de TI', fr: 'Consultant informatique' },
      { en: 'Service manager', es: 'Gerente de servicio', fr: 'Gérant de service' }
    ],
    exampleCustomerBase: [
      { en: 'Small businesses', es: 'Pequeñas empresas', fr: 'Petites entreprises' },
      { en: 'Individual customers', es: 'Clientes individuales', fr: 'Clients individuels' },
      { en: 'Home users', es: 'Usuarios domésticos', fr: 'Utilisateurs à domicile' }
    ],
    minimumEquipment: [
      { en: 'Computer repair tools', es: 'Herramientas de reparación de computadoras', fr: 'Outils de réparation d\'ordinateurs' },
      { en: 'Diagnostic software', es: 'Software de diagnóstico', fr: 'Logiciel de diagnostic' },
      { en: 'Testing equipment', es: 'Equipamiento de prueba', fr: 'Équipement de test' },
      { en: 'Parts inventory', es: 'Inventario de repuestos', fr: 'Inventaire de pièces' }
    ]
  },
  web_design: {
    businessTypeId: 'web_design',
    description: {
      en: 'Digital services provider offering web design, development, and digital marketing',
      es: 'Proveedor de servicios digitales que ofrece diseño web, desarrollo y marketing digital',
      fr: 'Fournisseur de services numériques offrant conception web, développement et marketing numérique'
    },
    exampleBusinessPurposes: [
      { en: 'Create websites and web applications', es: 'Crear sitios web y aplicaciones web', fr: 'Créer des sites web et applications web' },
      { en: 'Provide digital marketing services', es: 'Proporcionar servicios de marketing digital', fr: 'Fournir des services de marketing numérique' }
    ],
    exampleProducts: [
      { en: 'Website design', es: 'Diseño de sitios web', fr: 'Conception de sites web' },
      { en: 'Web development', es: 'Desarrollo web', fr: 'Développement web' },
      { en: 'Digital marketing', es: 'Marketing digital', fr: 'Marketing numérique' }
    ],
    exampleKeyPersonnel: [
      { en: 'Web designer', es: 'Diseñador web', fr: 'Concepteur web' },
      { en: 'Web developer', es: 'Desarrollador web', fr: 'Développeur web' },
      { en: 'Digital marketer', es: 'Especialista en marketing digital', fr: 'Spécialiste du marketing numérique' }
    ],
    exampleCustomerBase: [
      { en: 'Small businesses', es: 'Pequeñas empresas', fr: 'Petites entreprises' },
      { en: 'Entrepreneurs', es: 'Emprendedores', fr: 'Entrepreneurs' },
      { en: 'Organizations', es: 'Organizaciones', fr: 'Organisations' }
    ],
    minimumEquipment: [
      { en: 'Computers and software', es: 'Computadoras y software', fr: 'Ordinateurs et logiciels' },
      { en: 'Design software', es: 'Software de diseño', fr: 'Logiciel de conception' },
      { en: 'Development tools', es: 'Herramientas de desarrollo', fr: 'Outils de développement' },
      { en: 'Office space', es: 'Espacio de oficina', fr: 'Espace de bureau' }
    ]
  },
  security_services: {
    businessTypeId: 'security_services',
    description: {
      en: 'Security services provider offering protection and monitoring services',
      es: 'Proveedor de servicios de seguridad que ofrece servicios de protección y monitoreo',
      fr: 'Fournisseur de services de sécurité offrant des services de protection et de surveillance'
    },
    exampleBusinessPurposes: [
      { en: 'Provide security and protection services', es: 'Proporcionar servicios de seguridad y protección', fr: 'Fournir des services de sécurité et de protection' },
      { en: 'Offer security monitoring', es: 'Ofrecer monitoreo de seguridad', fr: 'Offrir la surveillance de sécurité' }
    ],
    exampleProducts: [
      { en: 'Security guard services', es: 'Servicios de guardias de seguridad', fr: 'Services de gardes de sécurité' },
      { en: 'Security monitoring', es: 'Monitoreo de seguridad', fr: 'Surveillance de sécurité' },
      { en: 'Security consulting', es: 'Consultoría de seguridad', fr: 'Conseil en sécurité' }
    ],
    exampleKeyPersonnel: [
      { en: 'Security guards', es: 'Guardias de seguridad', fr: 'Gardiens de sécurité' },
      { en: 'Security supervisor', es: 'Supervisor de seguridad', fr: 'Superviseur de sécurité' },
      { en: 'Operations manager', es: 'Gerente de operaciones', fr: 'Gérant des opérations' }
    ],
    exampleCustomerBase: [
      { en: 'Businesses', es: 'Empresas', fr: 'Entreprises' },
      { en: 'Residential complexes', es: 'Complejos residenciales', fr: 'Ensembles résidentiels' },
      { en: 'Event organizers', es: 'Organizadores de eventos', fr: 'Organisateurs d\'événements' }
    ],
    minimumEquipment: [
      { en: 'Security uniforms', es: 'Uniformes de seguridad', fr: 'Uniforme de sécurité' },
      { en: 'Communication equipment', es: 'Equipamiento de comunicación', fr: 'Équipement de communication' },
      { en: 'Security vehicles', es: 'Vehículos de seguridad', fr: 'Véhicules de sécurité' },
      { en: 'Monitoring equipment', es: 'Equipamiento de monitoreo', fr: 'Équipement de surveillance' }
    ]
  },
  cleaning_services: {
    businessTypeId: 'cleaning_services',
    description: {
      en: 'Professional cleaning services for residential and commercial properties',
      es: 'Servicios profesionales de limpieza para propiedades residenciales y comerciales',
      fr: 'Services de nettoyage professionnels pour propriétés résidentielles et commerciales'
    },
    exampleBusinessPurposes: [
      { en: 'Provide cleaning services', es: 'Proporcionar servicios de limpieza', fr: 'Fournir des services de nettoyage' },
      { en: 'Offer maintenance cleaning', es: 'Ofrecer limpieza de mantenimiento', fr: 'Offrir le nettoyage d\'entretien' }
    ],
    exampleProducts: [
      { en: 'Residential cleaning', es: 'Limpieza residencial', fr: 'Nettoyage résidentiel' },
      { en: 'Commercial cleaning', es: 'Limpieza comercial', fr: 'Nettoyage commercial' },
      { en: 'Deep cleaning services', es: 'Servicios de limpieza profunda', fr: 'Services de nettoyage en profondeur' }
    ],
    exampleKeyPersonnel: [
      { en: 'Cleaning staff', es: 'Personal de limpieza', fr: 'Personnel de nettoyage' },
      { en: 'Supervisor', es: 'Supervisor', fr: 'Superviseur' }
    ],
    exampleCustomerBase: [
      { en: 'Homeowners', es: 'Propietarios de viviendas', fr: 'Propriétaires' },
      { en: 'Businesses', es: 'Empresas', fr: 'Entreprises' },
      { en: 'Property managers', es: 'Administradores de propiedades', fr: 'Gestionnaires de propriétés' }
    ],
    minimumEquipment: [
      { en: 'Cleaning supplies', es: 'Suministros de limpieza', fr: 'Fournitures de nettoyage' },
      { en: 'Cleaning equipment', es: 'Equipamiento de limpieza', fr: 'Équipement de nettoyage' },
      { en: 'Transportation vehicle', es: 'Vehículo de transporte', fr: 'Véhicule de transport' },
      { en: 'Storage for supplies', es: 'Almacenamiento de suministros', fr: 'Stockage des fournitures' }
    ]
  },
  transportation_taxi: {
    businessTypeId: 'transportation_taxi',
    description: {
      en: 'Transportation service providing passenger rides and taxi services',
      es: 'Servicio de transporte que proporciona viajes de pasajeros y servicios de taxi',
      fr: 'Service de transport offrant des trajets de passagers et des services de taxi'
    },
    exampleBusinessPurposes: [
      { en: 'Provide passenger transportation', es: 'Proporcionar transporte de pasajeros', fr: 'Fournir le transport de passagers' },
      { en: 'Offer taxi and ride services', es: 'Ofrecer servicios de taxi y transporte', fr: 'Offrir des services de taxi et de transport' }
    ],
    exampleProducts: [
      { en: 'Taxi rides', es: 'Viajes en taxi', fr: 'Trajets en taxi' },
      { en: 'Airport transfers', es: 'Traslados al aeropuerto', fr: 'Transferts aéroport' },
      { en: 'Scheduled rides', es: 'Viajes programados', fr: 'Trajets programmés' }
    ],
    exampleKeyPersonnel: [
      { en: 'Taxi drivers', es: 'Conductores de taxi', fr: 'Chauffeurs de taxi' },
      { en: 'Dispatcher', es: 'Despachador', fr: 'Répartiteur' }
    ],
    exampleCustomerBase: [
      { en: 'Tourists', es: 'Turistas', fr: 'Touristes' },
      { en: 'Local residents', es: 'Residentes locales', fr: 'Résidents locaux' },
      { en: 'Business travelers', es: 'Viajeros de negocios', fr: 'Voyageurs d\'affaires' }
    ],
    minimumEquipment: [
      { en: 'Vehicles', es: 'Vehículos', fr: 'Véhicules' },
      { en: 'GPS navigation', es: 'Navegación GPS', fr: 'Navigation GPS' },
      { en: 'Communication equipment', es: 'Equipamiento de comunicación', fr: 'Équipement de communication' },
      { en: 'Payment processing', es: 'Procesamiento de pagos', fr: 'Traitement des paiements' }
    ]
  }
}

// Helper function to create multilingual array JSON
function createMultilingualArray(items: MultilingualContent[]): string {
  return JSON.stringify(items)
}

async function populateBusinessTypes() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║   POPULATE BUSINESS TYPES - MULTILINGUAL CONTENT            ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('')

  // Get all existing business types
  const existingTypes = await prisma.businessType.findMany({
    where: { isActive: true }
  })

  console.log(`Found ${existingTypes.length} business types to update\n`)

  let updated = 0
  let skipped = 0

  for (const businessType of existingTypes) {
    const content = BUSINESS_TYPE_CONTENT[businessType.businessTypeId]
    
    if (!content) {
      console.log(`  ⚠️  No content defined for: ${businessType.businessTypeId}`)
      skipped++
      continue
    }

    try {
      await prisma.businessType.update({
        where: { id: businessType.id },
        data: {
          description: JSON.stringify(content.description),
          exampleBusinessPurposes: createMultilingualArray(content.exampleBusinessPurposes),
          exampleProducts: createMultilingualArray(content.exampleProducts),
          exampleKeyPersonnel: createMultilingualArray(content.exampleKeyPersonnel),
          exampleCustomerBase: createMultilingualArray(content.exampleCustomerBase),
          minimumEquipment: createMultilingualArray(content.minimumEquipment)
        }
      })

      const nameObj = JSON.parse(businessType.name)
      console.log(`  ✓ Updated: ${nameObj.en || businessType.businessTypeId}`)
      updated++
    } catch (error) {
      console.error(`  ❌ Error updating ${businessType.businessTypeId}:`, error)
      skipped++
    }
  }

  console.log('\n' + '═'.repeat(65))
  console.log('✅ UPDATE SUMMARY')
  console.log('═'.repeat(65))
  console.log(`  Updated: ${updated}`)
  console.log(`  Skipped: ${skipped}`)
  console.log(`  Total: ${existingTypes.length}`)
  console.log('')
  console.log('✅ Business types populated with multilingual content!')
  console.log('')
  console.log('All business types now include:')
  console.log('  📝 Descriptions (EN, ES, FR)')
  console.log('  🎯 Business purposes examples')
  console.log('  📦 Product examples')
  console.log('  👥 Key personnel examples')
  console.log('  👤 Customer base examples')
  console.log('  🛠️  Minimum equipment lists')
  console.log('')
}

async function main() {
  try {
    await populateBusinessTypes()
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

export { populateBusinessTypes }


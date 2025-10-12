/**
 * Populate Caribbean Business Types - Clean Version
 * 
 * This script populates business types with:
 * - Multilingual example content (EN, ES, FR) for wizard prefill
 * - Risk vulnerabilities (stored separately in BusinessRiskVulnerability)
 * - Reference information (typical revenue, employees, hours)
 * 
 * DOES NOT include user-specific characteristics like:
 * - Tourism dependency (asked in wizard)
 * - Digital dependency (asked in wizard)
 * - Seasonality (asked in wizard)
 * - etc.
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Multilingual business type data
const businessTypes = [
  {
    businessTypeId: 'grocery_mini_mart',
    name: JSON.stringify({
      en: 'Grocery Store / Mini-Mart',
      es: 'Tienda de Comestibles / Mini-Mercado',
      fr: 'Épicerie / Mini-Marché'
    }),
    category: 'retail',
    subcategory: 'convenience_store',
    description: JSON.stringify({
      en: 'Small to medium retail store selling food, beverages, and household items',
      es: 'Tienda minorista pequeña a mediana que vende alimentos, bebidas y artículos para el hogar',
      fr: 'Petit à moyen magasin de détail vendant de la nourriture, des boissons et des articles ménagers'
    }),
    typicalRevenue: 'JMD 5M-20M annually',
    typicalEmployees: '3-10 employees',
    operatingHours: '7:00 AM - 9:00 PM',
    exampleBusinessPurposes: JSON.stringify({
      en: ['Provide essential groceries and household items to the local community', 'Serve as a convenient neighborhood shop for daily needs'],
      es: ['Proporcionar comestibles esenciales y artículos del hogar a la comunidad local', 'Servir como una tienda de barrio conveniente para necesidades diarias'],
      fr: ['Fournir des produits d\'épicerie essentiels et des articles ménagers à la communauté locale', 'Servir de magasin de quartier pratique pour les besoins quotidiens']
    }),
    exampleProducts: JSON.stringify({
      en: ['Fresh produce, canned goods, beverages, snacks, cleaning supplies', 'Basic groceries, cold drinks, bread, milk, local products'],
      es: ['Productos frescos, enlatados, bebidas, bocadillos, productos de limpieza', 'Comestibles básicos, bebidas frías, pan, leche, productos locales'],
      fr: ['Produits frais, conserves, boissons, collations, produits de nettoyage', 'Épicerie de base, boissons froides, pain, lait, produits locaux']
    }),
    exampleKeyPersonnel: JSON.stringify({
      en: ['Store Owner/Manager', 'Cashier/Sales Staff', 'Stock Handler'],
      es: ['Propietario/Gerente de Tienda', 'Cajero/Personal de Ventas', 'Encargado de Inventario'],
      fr: ['Propriétaire/Gérant du Magasin', 'Caissier/Personnel de Vente', 'Responsable des Stocks']
    }),
    exampleCustomerBase: JSON.stringify({
      en: ['Local residents and families', 'Neighborhood walk-in customers', 'Regular daily shoppers'],
      es: ['Residentes locales y familias', 'Clientes del vecindario', 'Compradores diarios regulares'],
      fr: ['Résidents locaux et familles', 'Clients de passage du quartier', 'Acheteurs quotidiens réguliers']
    }),
    minimumEquipment: JSON.stringify({
      en: ['Refrigeration units', 'Shelving and display racks', 'Cash register/POS system', 'Basic security system'],
      es: ['Unidades de refrigeración', 'Estanterías y exhibidores', 'Caja registradora/sistema POS', 'Sistema de seguridad básico'],
      fr: ['Unités de réfrigération', 'Étagères et présentoirs', 'Caisse enregistreuse/système POS', 'Système de sécurité de base']
    }),
    risks: {
      powerOutage: { vulnerability: 9, impact: 9, reasoning: 'Refrigeration critical for perishables' },
      hurricane: { vulnerability: 7, impact: 8, reasoning: 'Physical structure damage, supply chain disruption' },
      flood: { vulnerability: 7, impact: 8, reasoning: 'Inventory damage, temporary closure' },
      supplyChainDisruption: { vulnerability: 8, impact: 9, reasoning: 'Relies heavily on regular deliveries' },
      economicDownturn: { vulnerability: 6, impact: 7, reasoning: 'Essential goods maintain demand but profit margins suffer' }
    }
  },
  {
    businessTypeId: 'restaurant_casual',
    name: JSON.stringify({
      en: 'Restaurant (Casual Dining)',
      es: 'Restaurante (Comida Casual)',
      fr: 'Restaurant (Restauration Décontractée)'
    }),
    category: 'hospitality',
    subcategory: 'casual_dining',
    description: JSON.stringify({
      en: 'Full-service restaurant offering sit-down dining with diverse menu',
      es: 'Restaurante de servicio completo que ofrece comida con menú diverso',
      fr: 'Restaurant avec service complet offrant une restauration assise avec un menu diversifié'
    }),
    typicalRevenue: 'JMD 10M-40M annually',
    typicalEmployees: '10-25 employees',
    operatingHours: '11:00 AM - 10:00 PM',
    exampleBusinessPurposes: JSON.stringify({
      en: ['Provide quality Caribbean cuisine in a comfortable dining atmosphere', 'Serve authentic local dishes to tourists and residents'],
      es: ['Proporcionar cocina caribeña de calidad en un ambiente cómodo', 'Servir platos locales auténticos a turistas y residentes'],
      fr: ['Fournir une cuisine caribéenne de qualité dans une atmosphère de restauration confortable', 'Servir des plats locaux authentiques aux touristes et résidents']
    }),
    exampleProducts: JSON.stringify({
      en: ['Full-service Caribbean meals, beverages, catering services', 'Authentic jerk dishes, seafood, traditional Caribbean cuisine'],
      es: ['Comidas caribeñas de servicio completo, bebidas, servicios de catering', 'Platos jerk auténticos, mariscos, cocina caribeña tradicional'],
      fr: ['Repas caribéens avec service complet, boissons, services de traiteur', 'Plats jerk authentiques, fruits de mer, cuisine caribéenne traditionnelle']
    }),
    exampleKeyPersonnel: JSON.stringify({
      en: ['Head Chef/Cook', 'Restaurant Manager', 'Servers/Waitstaff', 'Kitchen Staff'],
      es: ['Chef Principal/Cocinero', 'Gerente de Restaurante', 'Meseros/Personal de Servicio', 'Personal de Cocina'],
      fr: ['Chef Principal/Cuisinier', 'Gérant du Restaurant', 'Serveurs/Personnel de Service', 'Personnel de Cuisine']
    }),
    exampleCustomerBase: JSON.stringify({
      en: ['Mix of tourists and local diners', 'Families and groups for special occasions', 'Regular local customers'],
      es: ['Mezcla de turistas y comensales locales', 'Familias y grupos para ocasiones especiales', 'Clientes locales regulares'],
      fr: ['Mélange de touristes et de clients locaux', 'Familles et groupes pour occasions spéciales', 'Clients locaux réguliers']
    }),
    minimumEquipment: JSON.stringify({
      en: ['Commercial kitchen equipment', 'Refrigeration and freezers', 'Tables, chairs, dining setup', 'POS system'],
      es: ['Equipo de cocina comercial', 'Refrigeración y congeladores', 'Mesas, sillas, mobiliario', 'Sistema POS'],
      fr: ['Équipement de cuisine commerciale', 'Réfrigération et congélateurs', 'Tables, chaises, aménagement', 'Système POS']
    }),
    risks: {
      powerOutage: { vulnerability: 9, impact: 10, reasoning: 'Cannot cook or preserve food' },
      hurricane: { vulnerability: 7, impact: 8, reasoning: 'Physical damage, tourism drop' },
      pandemicDisease: { vulnerability: 8, impact: 9, reasoning: 'Restrictions on dining, customer fear' },
      waterDependency: { vulnerability: 9, impact: 9, reasoning: 'Critical for food prep and sanitation' },
      supplyChainDisruption: { vulnerability: 7, impact: 8, reasoning: 'Fresh ingredient supply critical' }
    }
  },
  {
    businessTypeId: 'hotel_small',
    name: JSON.stringify({
      en: 'Small Hotel / Guest House',
      es: 'Hotel Pequeño / Casa de Huéspedes',
      fr: 'Petit Hôtel / Maison d\'Hôtes'
    }),
    category: 'hospitality',
    subcategory: 'accommodation',
    description: JSON.stringify({
      en: 'Small accommodation facility providing lodging and basic services',
      es: 'Pequeño establecimiento de alojamiento que proporciona hospedaje y servicios básicos',
      fr: 'Petit établissement d\'hébergement fournissant logement et services de base'
    }),
    typicalRevenue: 'JMD 15M-50M annually',
    typicalEmployees: '8-20 employees',
    operatingHours: '24/7 front desk coverage',
    exampleBusinessPurposes: JSON.stringify({
      en: ['Provide comfortable accommodation for tourists visiting the island', 'Offer a home-away-from-home experience for travelers'],
      es: ['Proporcionar alojamiento cómodo para turistas que visitan la isla', 'Ofrecer una experiencia de hogar lejos del hogar para viajeros'],
      fr: ['Fournir un hébergement confortable pour les touristes visitant l\'île', 'Offrir une expérience de chez-soi pour les voyageurs']
    }),
    exampleProducts: JSON.stringify({
      en: ['Room accommodations, breakfast service, tour arrangements', 'Clean rooms, WiFi, local tourism packages'],
      es: ['Alojamiento en habitaciones, servicio de desayuno, arreglos de tours', 'Habitaciones limpias, WiFi, paquetes turísticos locales'],
      fr: ['Hébergement en chambres, service de petit-déjeuner, arrangements de tours', 'Chambres propres, WiFi, forfaits touristiques locaux']
    }),
    exampleKeyPersonnel: JSON.stringify({
      en: ['Hotel Manager', 'Front Desk Staff', 'Housekeeping Team', 'Maintenance Staff'],
      es: ['Gerente de Hotel', 'Personal de Recepción', 'Equipo de Limpieza', 'Personal de Mantenimiento'],
      fr: ['Gérant d\'Hôtel', 'Personnel de Réception', 'Équipe de Ménage', 'Personnel de Maintenance']
    }),
    exampleCustomerBase: JSON.stringify({
      en: ['International and regional tourists', 'Business travelers', 'Family vacation groups'],
      es: ['Turistas internacionales y regionales', 'Viajeros de negocios', 'Grupos de vacaciones familiares'],
      fr: ['Touristes internationaux et régionaux', 'Voyageurs d\'affaires', 'Groupes de vacances en famille']
    }),
    minimumEquipment: JSON.stringify({
      en: ['Furniture and bedding for all rooms', 'Backup generator', 'Water storage tanks', 'Laundry facilities'],
      es: ['Muebles y ropa de cama para todas las habitaciones', 'Generador de respaldo', 'Tanques de almacenamiento de agua', 'Instalaciones de lavandería'],
      fr: ['Mobilier et literie pour toutes les chambres', 'Générateur de secours', 'Réservoirs de stockage d\'eau', 'Installations de blanchisserie']
    }),
    risks: {
      hurricane: { vulnerability: 9, impact: 10, reasoning: 'Highly exposed, tourism dependent' },
      powerOutage: { vulnerability: 8, impact: 9, reasoning: 'Guest comfort and safety critical' },
      waterDependency: { vulnerability: 9, impact: 10, reasoning: 'Essential for guest services' },
      pandemicDisease: { vulnerability: 10, impact: 10, reasoning: 'Travel restrictions devastate tourism' },
      economicDownturn: { vulnerability: 8, impact: 9, reasoning: 'Discretionary tourism spending drops' }
    }
  },
  {
    businessTypeId: 'retail_clothing',
    name: JSON.stringify({
      en: 'Clothing / Apparel Store',
      es: 'Tienda de Ropa / Prendas de Vestir',
      fr: 'Magasin de Vêtements / Habillement'
    }),
    category: 'retail',
    subcategory: 'apparel',
    description: JSON.stringify({
      en: 'Retail store specializing in clothing and fashion accessories',
      es: 'Tienda minorista especializada en ropa y accesorios de moda',
      fr: 'Magasin de détail spécialisé dans les vêtements et accessoires de mode'
    }),
    typicalRevenue: 'JMD 8M-30M annually',
    typicalEmployees: '3-12 employees',
    operatingHours: '9:00 AM - 7:00 PM',
    exampleBusinessPurposes: JSON.stringify({
      en: ['Provide fashionable and affordable clothing for the local community', 'Offer a curated selection of Caribbean-style apparel'],
      es: ['Proporcionar ropa de moda y asequible para la comunidad local', 'Ofrecer una selección curada de ropa de estilo caribeño'],
      fr: ['Fournir des vêtements à la mode et abordables pour la communauté locale', 'Offrir une sélection soignée de vêtements de style caribéen']
    }),
    exampleProducts: JSON.stringify({
      en: ['Men\'s and women\'s clothing, accessories, shoes', 'Casual wear, beachwear, formal attire, local designs'],
      es: ['Ropa de hombre y mujer, accesorios, zapatos', 'Ropa casual, ropa de playa, ropa formal, diseños locales'],
      fr: ['Vêtements pour hommes et femmes, accessoires, chaussures', 'Vêtements décontractés, vêtements de plage, tenue formelle, designs locaux']
    }),
    exampleKeyPersonnel: JSON.stringify({
      en: ['Store Manager', 'Sales Associates', 'Visual Merchandiser'],
      es: ['Gerente de Tienda', 'Asociados de Ventas', 'Merchandiser Visual'],
      fr: ['Gérant du Magasin', 'Associés de Vente', 'Marchandiseur Visuel']
    }),
    exampleCustomerBase: JSON.stringify({
      en: ['Local shoppers seeking affordable fashion', 'Tourists looking for Caribbean-style clothing', 'Young adults and families'],
      es: ['Compradores locales que buscan moda asequible', 'Turistas que buscan ropa de estilo caribeño', 'Adultos jóvenes y familias'],
      fr: ['Acheteurs locaux à la recherche de mode abordable', 'Touristes à la recherche de vêtements de style caribéen', 'Jeunes adultes et familles']
    }),
    minimumEquipment: JSON.stringify({
      en: ['Display racks and mannequins', 'POS system', 'Security system', 'Storage for inventory'],
      es: ['Estantes de exhibición y maniquíes', 'Sistema POS', 'Sistema de seguridad', 'Almacenamiento para inventario'],
      fr: ['Présentoirs et mannequins', 'Système POS', 'Système de sécurité', 'Stockage pour inventaire']
    }),
    risks: {
      economicDownturn: { vulnerability: 8, impact: 8, reasoning: 'Discretionary spending drops' },
      hurricane: { vulnerability: 6, impact: 7, reasoning: 'Physical damage, inventory loss' },
      supplyChainDisruption: { vulnerability: 7, impact: 7, reasoning: 'Imported goods delays' },
      civilUnrest: { vulnerability: 6, impact: 7, reasoning: 'Looting, vandalism risk' },
      powerOutage: { vulnerability: 4, impact: 5, reasoning: 'Lower dependency than food retail' }
    }
  },
  {
    businessTypeId: 'tour_operator',
    name: JSON.stringify({
      en: 'Tour Operator / Travel Services',
      es: 'Operador Turístico / Servicios de Viaje',
      fr: 'Voyagiste / Services de Voyage'
    }),
    category: 'tourism',
    subcategory: 'tour_services',
    description: JSON.stringify({
      en: 'Business organizing and conducting tours and travel experiences',
      es: 'Negocio que organiza y realiza tours y experiencias de viaje',
      fr: 'Entreprise organisant et réalisant des circuits et expériences de voyage'
    }),
    typicalRevenue: 'JMD 12M-35M annually',
    typicalEmployees: '5-15 employees',
    operatingHours: '8:00 AM - 6:00 PM',
    exampleBusinessPurposes: JSON.stringify({
      en: ['Showcase the island\'s natural beauty and culture to visitors', 'Provide memorable travel experiences and excursions'],
      es: ['Mostrar la belleza natural y la cultura de la isla a los visitantes', 'Proporcionar experiencias de viaje y excursiones memorables'],
      fr: ['Présenter la beauté naturelle et la culture de l\'île aux visiteurs', 'Fournir des expériences de voyage et excursions mémorables']
    }),
    exampleProducts: JSON.stringify({
      en: ['Island tours, beach excursions, cultural experiences', 'Adventure tours, snorkeling trips, heritage site visits'],
      es: ['Tours por la isla, excursiones a la playa, experiencias culturales', 'Tours de aventura, viajes de snorkel, visitas a sitios patrimoniales'],
      fr: ['Tours de l\'île, excursions à la plage, expériences culturelles', 'Tours d\'aventure, sorties snorkeling, visites de sites patrimoniaux']
    }),
    exampleKeyPersonnel: JSON.stringify({
      en: ['Tour Guides', 'Operations Manager', 'Driver/Transportation Staff', 'Booking Coordinator'],
      es: ['Guías Turísticos', 'Gerente de Operaciones', 'Conductor/Personal de Transporte', 'Coordinador de Reservas'],
      fr: ['Guides Touristiques', 'Responsable des Opérations', 'Chauffeur/Personnel de Transport', 'Coordinateur de Réservations']
    }),
    exampleCustomerBase: JSON.stringify({
      en: ['Cruise ship passengers', 'Hotel guests and tourists', 'International visitors'],
      es: ['Pasajeros de cruceros', 'Huéspedes de hoteles y turistas', 'Visitantes internacionales'],
      fr: ['Passagers de croisière', 'Clients d\'hôtels et touristes', 'Visiteurs internationaux']
    }),
    minimumEquipment: JSON.stringify({
      en: ['Tour vehicles/boats', 'Communication equipment', 'Safety gear', 'Booking system/website'],
      es: ['Vehículos/botes de tours', 'Equipo de comunicación', 'Equipo de seguridad', 'Sistema de reservas/sitio web'],
      fr: ['Véhicules/bateaux de tours', 'Équipement de communication', 'Équipement de sécurité', 'Système de réservation/site web']
    }),
    risks: {
      pandemicDisease: { vulnerability: 10, impact: 10, reasoning: 'Completely tourism dependent' },
      hurricane: { vulnerability: 9, impact: 10, reasoning: 'Tourism stops, physical assets damaged' },
      economicDownturn: { vulnerability: 9, impact: 9, reasoning: 'First to be cut from travel budgets' },
      civilUnrest: { vulnerability: 8, impact: 9, reasoning: 'Safety concerns deter tourists' },
      supplyChainDisruption: { vulnerability: 5, impact: 6, reasoning: 'Moderate fuel/supply needs' }
    }
  }
]

async function main() {
  console.log('🚀 Starting Caribbean Business Types Population (Clean Version)...')
  
  try {
    // Clean up existing data
    console.log('🧹 Cleaning up existing business type data...')
    await prisma.businessRiskVulnerability.deleteMany({})
    await prisma.businessType.deleteMany({})
    
    console.log('📝 Creating business types with multilingual content...')
    
    for (const btData of businessTypes) {
      console.log(`\n  Creating: ${JSON.parse(btData.name).en}`)
      
      // Extract risks for separate storage
      const { risks, ...businessTypeData } = btData
      
      // Create business type
      const businessType = await prisma.businessType.create({
        data: businessTypeData
      })
      
      // Create risk vulnerabilities
      console.log(`    Adding ${Object.keys(risks).length} risk vulnerabilities...`)
      for (const [riskType, riskData] of Object.entries(risks)) {
        await prisma.businessRiskVulnerability.create({
          data: {
            businessTypeId: businessType.id,
            riskType,
            vulnerabilityLevel: riskData.vulnerability,
            impactSeverity: riskData.impact,
            reasoning: riskData.reasoning,
            isActive: true
          }
        })
      }
      
      console.log(`    ✅ Created with ${Object.keys(risks).length} risks`)
    }
    
    // Summary
    console.log('\n✨ Population Complete!')
    console.log(`\n📊 Summary:`)
    console.log(`   - Business Types: ${businessTypes.length}`)
    console.log(`   - Total Risk Profiles: ${businessTypes.reduce((sum, bt) => sum + Object.keys(bt.risks).length, 0)}`)
    console.log(`   - Languages Supported: English, Spanish, French`)
    console.log(`\n🎯 Business types now contain:`)
    console.log(`   ✅ Multilingual examples for wizard prefill`)
    console.log(`   ✅ Risk vulnerability baselines`)
    console.log(`   ✅ Reference information (revenue, employees, hours)`)
    console.log(`   ❌ NO user-specific characteristics (collected in wizard)`)
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })



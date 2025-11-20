import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Add Cost Items for Earthquake Protection Strategy
 */

async function addEarthquakeCostItems() {
  console.log('🌋 Adding Earthquake Protection Cost Items...\n')

  // Furniture Straps
  await prisma.costItem.upsert({
    where: { itemId: 'furniture_straps' },
    update: {
      name: JSON.stringify({ en: 'Furniture Straps', es: 'Correas para Muebles', fr: 'Sangles pour Meubles' }),
      description: JSON.stringify({
        en: 'Heavy-duty straps to secure furniture and appliances during earthquakes',
        es: 'Correas resistentes para asegurar muebles y electrodomésticos durante terremotos',
        fr: 'Sangles résistantes pour fixer meubles et appareils pendant les tremblements de terre'
      }),
      category: 'equipment',
      baseUSD: 25.00,
      baseUSDMin: 15.00,
      baseUSDMax: 50.00,
      unit: 'per strap set',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Secure bookshelves, cabinets, and appliances to walls',
        es: 'Asegure estanterías, gabinetes y electrodomésticos a las paredes',
        fr: 'Fixez étagères, armoires et appareils aux murs'
      }),
      tags: JSON.stringify(['earthquake', 'safety', 'securing', 'furniture']),
      isActive: true
    },
    create: {
      itemId: 'furniture_straps',
      name: JSON.stringify({ en: 'Furniture Straps', es: 'Correas para Muebles', fr: 'Sangles pour Meubles' }),
      description: JSON.stringify({
        en: 'Heavy-duty straps to secure furniture and appliances during earthquakes',
        es: 'Correas resistentes para asegurar muebles y electrodomésticos durante terremotos',
        fr: 'Sangles résistantes pour fixer meubles et appareils pendant les tremblements de terre'
      }),
      category: 'equipment',
      baseUSD: 25.00,
      baseUSDMin: 15.00,
      baseUSDMax: 50.00,
      unit: 'per strap set',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Secure bookshelves, cabinets, and appliances to walls',
        es: 'Asegure estanterías, gabinetes y electrodomésticos a las paredes',
        fr: 'Fixez étagères, armoires et appareils aux murs'
      }),
      tags: JSON.stringify(['earthquake', 'safety', 'securing', 'furniture']),
      isActive: true
    }
  })
  console.log('  ✓ Furniture Straps added')

  // Latches for Cabinets
  await prisma.costItem.upsert({
    where: { itemId: 'cabinet_latches' },
    update: {
      name: JSON.stringify({ en: 'Cabinet Latches', es: 'Pestillos para Gabinetes', fr: 'Loquets pour Armoires' }),
      description: JSON.stringify({
        en: 'Child-safety latches that prevent cabinets from opening during shaking',
        es: 'Pestillos de seguridad infantil que impiden que los gabinetes se abran durante sacudidas',
        fr: 'Loquets de sécurité enfant qui empêchent les armoires de s\'ouvrir pendant les secousses'
      }),
      category: 'equipment',
      baseUSD: 8.00,
      baseUSDMin: 5.00,
      baseUSDMax: 15.00,
      unit: 'per latch',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Install on kitchen cabinets, bathroom cabinets, and storage units',
        es: 'Instale en gabinetes de cocina, gabinetes de baño y unidades de almacenamiento',
        fr: 'Installez sur armoires de cuisine, armoires de salle de bain et unités de rangement'
      }),
      tags: JSON.stringify(['earthquake', 'safety', 'cabinets', 'latches']),
      isActive: true
    },
    create: {
      itemId: 'cabinet_latches',
      name: JSON.stringify({ en: 'Cabinet Latches', es: 'Pestillos para Gabinetes', fr: 'Loquets pour Armoires' }),
      description: JSON.stringify({
        en: 'Child-safety latches that prevent cabinets from opening during shaking',
        es: 'Pestillos de seguridad infantil que impiden que los gabinetes se abran durante sacudidas',
        fr: 'Loquets de sécurité enfant qui empêchent les armoires de s\'ouvrir pendant les secousses'
      }),
      category: 'equipment',
      baseUSD: 8.00,
      baseUSDMin: 5.00,
      baseUSDMax: 15.00,
      unit: 'per latch',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Install on kitchen cabinets, bathroom cabinets, and storage units',
        es: 'Instale en gabinetes de cocina, gabinetes de baño y unidades de almacenamiento',
        fr: 'Installez sur armoires de cuisine, armoires de salle de bain et unités de rangement'
      }),
      tags: JSON.stringify(['earthquake', 'safety', 'cabinets', 'latches']),
      isActive: true
    }
  })
  console.log('  ✓ Cabinet Latches added')

  // Flex Connectors for Utilities
  await prisma.costItem.upsert({
    where: { itemId: 'flex_connectors_utilities' },
    update: {
      name: JSON.stringify({ en: 'Flexible Utility Connectors', es: 'Conectores Flexibles para Utilidades', fr: 'Connecteurs Utilitaires Flexibles' }),
      description: JSON.stringify({
        en: 'Flexible connectors for gas, water, and electrical lines to prevent breaks',
        es: 'Conectores flexibles para líneas de gas, agua y electricidad para prevenir roturas',
        fr: 'Connecteurs flexibles pour lignes de gaz, eau et électricité pour éviter les ruptures'
      }),
      category: 'equipment',
      baseUSD: 35.00,
      baseUSDMin: 20.00,
      baseUSDMax: 60.00,
      unit: 'per connector',
      complexity: 'medium',
      notes: JSON.stringify({
        en: 'Install at appliances and where rigid pipes connect to walls',
        es: 'Instale en electrodomésticos y donde las tuberías rígidas se conectan a las paredes',
        fr: 'Installez aux appareils et là où les tuyaux rigides se connectent aux murs'
      }),
      tags: JSON.stringify(['earthquake', 'safety', 'utilities', 'connectors']),
      isActive: true
    },
    create: {
      itemId: 'flex_connectors_utilities',
      name: JSON.stringify({ en: 'Flexible Utility Connectors', es: 'Conectores Flexibles para Utilidades', fr: 'Connecteurs Utilitaires Flexibles' }),
      description: JSON.stringify({
        en: 'Flexible connectors for gas, water, and electrical lines to prevent breaks',
        es: 'Conectores flexibles para líneas de gas, agua y electricidad para prevenir roturas',
        fr: 'Connecteurs flexibles pour lignes de gaz, eau et électricité pour éviter les ruptures'
      }),
      category: 'equipment',
      baseUSD: 35.00,
      baseUSDMin: 20.00,
      baseUSDMax: 60.00,
      unit: 'per connector',
      complexity: 'medium',
      notes: JSON.stringify({
        en: 'Install at appliances and where rigid pipes connect to walls',
        es: 'Instale en electrodomésticos y donde las tuberías rígidas se conectan a las paredes',
        fr: 'Installez aux appareils et là où les tuyaux rigides se connectent aux murs'
      }),
      tags: JSON.stringify(['earthquake', 'safety', 'utilities', 'connectors']),
      isActive: true
    }
  })
  console.log('  ✓ Flexible Utility Connectors added')

  // First Aid Kit
  await prisma.costItem.upsert({
    where: { itemId: 'earthquake_first_aid_kit' },
    update: {
      name: JSON.stringify({ en: 'Earthquake First Aid Kit', es: 'Kit de Primeros Auxilios para Terremotos', fr: 'Trousse de Premiers Soins pour Tremblements de Terre' }),
      description: JSON.stringify({
        en: 'Comprehensive first aid supplies specifically for earthquake injuries',
        es: 'Suministros completos de primeros auxilios específicamente para lesiones por terremotos',
        fr: 'Fournitures complètes de premiers soins spécifiquement pour blessures de tremblements de terre'
      }),
      category: 'equipment',
      baseUSD: 75.00,
      baseUSDMin: 45.00,
      baseUSDMax: 125.00,
      unit: 'per kit',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Include bandages, antiseptics, splints, and emergency medications',
        es: 'Incluya vendajes, antisépticos, férulas y medicamentos de emergencia',
        fr: 'Incluez bandages, antiseptiques, attelles et médicaments d\'urgence'
      }),
      tags: JSON.stringify(['earthquake', 'first_aid', 'emergency', 'medical']),
      isActive: true
    },
    create: {
      itemId: 'earthquake_first_aid_kit',
      name: JSON.stringify({ en: 'Earthquake First Aid Kit', es: 'Kit de Primeros Auxilios para Terremotos', fr: 'Trousse de Premiers Soins pour Tremblements de Terre' }),
      description: JSON.stringify({
        en: 'Comprehensive first aid supplies specifically for earthquake injuries',
        es: 'Suministros completos de primeros auxilios específicamente para lesiones por terremotos',
        fr: 'Fournitures complètes de premiers soins spécifiquement pour blessures de tremblements de terre'
      }),
      category: 'equipment',
      baseUSD: 75.00,
      baseUSDMin: 45.00,
      baseUSDMax: 125.00,
      unit: 'per kit',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Include bandages, antiseptics, splints, and emergency medications',
        es: 'Incluya vendajes, antisépticos, férulas y medicamentos de emergencia',
        fr: 'Incluez bandages, antiseptiques, attelles et médicaments d\'urgence'
      }),
      tags: JSON.stringify(['earthquake', 'first_aid', 'emergency', 'medical']),
      isActive: true
    }
  })
  console.log('  ✓ Earthquake First Aid Kit added')

  console.log('\n✅ Earthquake Protection Cost Items Added Successfully!')
}

async function main() {
  try {
    await addEarthquakeCostItems()
  } catch (error) {
    console.error('❌ Error adding cost items:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { addEarthquakeCostItems }



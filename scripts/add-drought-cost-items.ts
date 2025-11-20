import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Add Cost Items for Drought Protection Strategy
 */

async function addDroughtCostItems() {
  console.log('🏜️ Adding Drought Protection Cost Items...\n')

  // Rainwater Collection System
  await prisma.costItem.upsert({
    where: { itemId: 'rainwater_collection_system' },
    update: {
      name: JSON.stringify({ en: 'Rainwater Collection System', es: 'Sistema de Recolección de Agua de Lluvia', fr: 'Système de Collecte d\'Eau de Pluie' }),
      description: JSON.stringify({
        en: 'Complete system for collecting and storing rainwater including gutters, barrels, and filtration',
        es: 'Sistema completo para recolectar y almacenar agua de lluvia incluyendo canaletas, barriles y filtración',
        fr: 'Système complet pour collecter et stocker eau de pluie incluant gouttières, barils et filtration'
      }),
      category: 'equipment',
      baseUSD: 300.00,
      baseUSDMin: 150.00,
      baseUSDMax: 600.00,
      unit: 'per system',
      complexity: 'medium',
      notes: JSON.stringify({
        en: 'Includes gutters, downspouts, 2-3 barrels, and basic filtration',
        es: 'Incluye canaletas, bajantes, 2-3 barriles y filtración básica',
        fr: 'Inclut gouttières, descentes, 2-3 barils et filtration de base'
      }),
      tags: JSON.stringify(['drought', 'water', 'collection', 'rainwater']),
      isActive: true
    },
    create: {
      itemId: 'rainwater_collection_system',
      name: JSON.stringify({ en: 'Rainwater Collection System', es: 'Sistema de Recolección de Agua de Lluvia', fr: 'Système de Collecte d\'Eau de Pluie' }),
      description: JSON.stringify({
        en: 'Complete system for collecting and storing rainwater including gutters, barrels, and filtration',
        es: 'Sistema completo para recolectar y almacenar agua de lluvia incluyendo canaletas, barriles y filtración',
        fr: 'Système complet pour collecter et stocker eau de pluie incluant gouttières, barils et filtration'
      }),
      category: 'equipment',
      baseUSD: 300.00,
      baseUSDMin: 150.00,
      baseUSDMax: 600.00,
      unit: 'per system',
      complexity: 'medium',
      notes: JSON.stringify({
        en: 'Includes gutters, downspouts, 2-3 barrels, and basic filtration',
        es: 'Incluye canaletas, bajantes, 2-3 barriles y filtración básica',
        fr: 'Inclut gouttières, descentes, 2-3 barils et filtration de base'
      }),
      tags: JSON.stringify(['drought', 'water', 'collection', 'rainwater']),
      isActive: true
    }
  })
  console.log('  ✓ Rainwater Collection System added')

  // Water Storage Tanks
  await prisma.costItem.upsert({
    where: { itemId: 'water_storage_tanks' },
    update: {
      name: JSON.stringify({ en: 'Water Storage Tanks', es: 'Tanques de Almacenamiento de Agua', fr: 'Réservoirs de Stockage d\'Eau' }),
      description: JSON.stringify({
        en: 'Large capacity water storage tanks for emergency water supply',
        es: 'Tanques de gran capacidad para suministro de agua de emergencia',
        fr: 'Réservoirs grande capacité pour approvisionnement eau d\'urgence'
      }),
      category: 'equipment',
      baseUSD: 500.00,
      baseUSDMin: 200.00,
      baseUSDMax: 2000.00,
      unit: 'per tank',
      complexity: 'medium',
      notes: JSON.stringify({
        en: '500-1000 gallon capacity, food-grade plastic',
        es: 'Capacidad de 500-1000 galones, plástico grado alimenticio',
        fr: 'Capacité 500-1000 gallons, plastique alimentaire'
      }),
      tags: JSON.stringify(['drought', 'water', 'storage', 'emergency']),
      isActive: true
    },
    create: {
      itemId: 'water_storage_tanks',
      name: JSON.stringify({ en: 'Water Storage Tanks', es: 'Tanques de Almacenamiento de Agua', fr: 'Réservoirs de Stockage d\'Eau' }),
      description: JSON.stringify({
        en: 'Large capacity water storage tanks for emergency water supply',
        es: 'Tanques de gran capacidad para suministro de agua de emergencia',
        fr: 'Réservoirs grande capacité pour approvisionnement eau d\'urgence'
      }),
      category: 'equipment',
      baseUSD: 500.00,
      baseUSDMin: 200.00,
      baseUSDMax: 2000.00,
      unit: 'per tank',
      complexity: 'medium',
      notes: JSON.stringify({
        en: '500-1000 gallon capacity, food-grade plastic',
        es: 'Capacidad de 500-1000 galones, plástico grado alimenticio',
        fr: 'Capacité 500-1000 gallons, plastique alimentaire'
      }),
      tags: JSON.stringify(['drought', 'water', 'storage', 'emergency']),
      isActive: true
    }
  })
  console.log('  ✓ Water Storage Tanks added')

  // Low-Flow Fixtures
  await prisma.costItem.upsert({
    where: { itemId: 'low_flow_fixtures' },
    update: {
      name: JSON.stringify({ en: 'Low-Flow Plumbing Fixtures', es: 'Accesorios de Plomería de Bajo Flujo', fr: 'Robinets à Débit Réduit' }),
      description: JSON.stringify({
        en: 'Water-saving faucets, showerheads, and toilets that reduce water consumption by 30-50%',
        es: 'Grifos, cabezales de ducha y inodoros ahorradores de agua que reducen el consumo en 30-50%',
        fr: 'Robinets, pommeaux douche et toilettes économes eau réduisant consommation 30-50%'
      }),
      category: 'equipment',
      baseUSD: 150.00,
      baseUSDMin: 80.00,
      baseUSDMax: 300.00,
      unit: 'per fixture set',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Includes faucet aerators, low-flow showerheads, and dual-flush toilets',
        es: 'Incluye aireadores de grifo, cabezales de ducha de bajo flujo e inodoros de doble descarga',
        fr: 'Inclut aérateurs robinet, pommeaux douche débit réduit et toilettes chasse double'
      }),
      tags: JSON.stringify(['drought', 'water', 'conservation', 'fixtures']),
      isActive: true
    },
    create: {
      itemId: 'low_flow_fixtures',
      name: JSON.stringify({ en: 'Low-Flow Plumbing Fixtures', es: 'Accesorios de Plomería de Bajo Flujo', fr: 'Robinets à Débit Réduit' }),
      description: JSON.stringify({
        en: 'Water-saving faucets, showerheads, and toilets that reduce water consumption by 30-50%',
        es: 'Grifos, cabezales de ducha y inodoros ahorradores de agua que reducen el consumo en 30-50%',
        fr: 'Robinets, pommeaux douche et toilettes économes eau réduisant consommation 30-50%'
      }),
      category: 'equipment',
      baseUSD: 150.00,
      baseUSDMin: 80.00,
      baseUSDMax: 300.00,
      unit: 'per fixture set',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Includes faucet aerators, low-flow showerheads, and dual-flush toilets',
        es: 'Incluye aireadores de grifo, cabezales de ducha de bajo flujo e inodoros de doble descarga',
        fr: 'Inclut aérateurs robinet, pommeaux douche débit réduit et toilettes chasse double'
      }),
      tags: JSON.stringify(['drought', 'water', 'conservation', 'fixtures']),
      isActive: true
    }
  })
  console.log('  ✓ Low-Flow Plumbing Fixtures added')

  // Water Recycling System
  await prisma.costItem.upsert({
    where: { itemId: 'greywater_recycling_system' },
    update: {
      name: JSON.stringify({ en: 'Greywater Recycling System', es: 'Sistema de Reciclaje de Agua Gris', fr: 'Système de Recyclage d\'Eau Grise' }),
      description: JSON.stringify({
        en: 'System to collect and treat shower/bath water for reuse in toilets and irrigation',
        es: 'Sistema para recolectar y tratar agua de ducha/baño para reutilización en inodoros y riego',
        fr: 'Système pour collecter et traiter eau douche/bain pour réutilisation toilettes et irrigation'
      }),
      category: 'equipment',
      baseUSD: 800.00,
      baseUSDMin: 400.00,
      baseUSDMax: 1500.00,
      unit: 'per system',
      complexity: 'hard',
      notes: JSON.stringify({
        en: 'Recycles 30-50% of household water. Requires professional installation.',
        es: 'Recicla 30-50% del agua doméstica. Requiere instalación profesional.',
        fr: 'Recycle 30-50% eau domestique. Nécessite installation professionnelle.'
      }),
      tags: JSON.stringify(['drought', 'water', 'recycling', 'greywater']),
      isActive: true
    },
    create: {
      itemId: 'greywater_recycling_system',
      name: JSON.stringify({ en: 'Greywater Recycling System', es: 'Sistema de Reciclaje de Agua Gris', fr: 'Système de Recyclage d\'Eau Grise' }),
      description: JSON.stringify({
        en: 'System to collect and treat shower/bath water for reuse in toilets and irrigation',
        es: 'Sistema para recolectar y tratar agua de ducha/baño para reutilización en inodoros y riego',
        fr: 'Système pour collecter et traiter eau douche/bain pour réutilisation toilettes et irrigation'
      }),
      category: 'equipment',
      baseUSD: 800.00,
      baseUSDMin: 400.00,
      baseUSDMax: 1500.00,
      unit: 'per system',
      complexity: 'hard',
      notes: JSON.stringify({
        en: 'Recycles 30-50% of household water. Requires professional installation.',
        es: 'Recicla 30-50% del agua doméstica. Requiere instalación profesional.',
        fr: 'Recycle 30-50% eau domestique. Nécessite installation professionnelle.'
      }),
      tags: JSON.stringify(['drought', 'water', 'recycling', 'greywater']),
      isActive: true
    }
  })
  console.log('  ✓ Greywater Recycling System added')

  console.log('\n✅ Drought Protection Cost Items Added Successfully!')
}

async function main() {
  try {
    await addDroughtCostItems()
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

export { addDroughtCostItems }



import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Add Cost Items for Fire Protection Strategy
 */

async function addFireProtectionCostItems() {
  console.log('🔥 Adding Fire Protection Cost Items...\n')

  // Smoke Detector Basic
  await prisma.costItem.upsert({
    where: { itemId: 'smoke_detector_basic' },
    update: {
      name: JSON.stringify({ en: 'Basic Smoke Detector', es: 'Detector de Humo Básico', fr: 'Détecteur de Fumée Basique' }),
      description: JSON.stringify({
        en: 'Battery-powered smoke detector with test button',
        es: 'Detector de humo con batería y botón de prueba',
        fr: 'Détecteur de fumée alimenté par batterie avec bouton de test'
      }),
      category: 'equipment',
      baseUSD: 15.00,
      baseUSDMin: 10.00,
      baseUSDMax: 25.00,
      unit: 'per detector',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Install one per room, especially sleeping areas',
        es: 'Instalar uno por habitación, especialmente áreas de dormir',
        fr: 'Installer un par pièce, surtout les zones de couchage'
      }),
      tags: JSON.stringify(['fire', 'safety', 'detection', 'smoke']),
      isActive: true
    },
    create: {
      itemId: 'smoke_detector_basic',
      name: JSON.stringify({ en: 'Basic Smoke Detector', es: 'Detector de Humo Básico', fr: 'Détecteur de Fumée Basique' }),
      description: JSON.stringify({
        en: 'Battery-powered smoke detector with test button',
        es: 'Detector de humo con batería y botón de prueba',
        fr: 'Détecteur de fumée alimenté par batterie avec bouton de test'
      }),
      category: 'equipment',
      baseUSD: 15.00,
      baseUSDMin: 10.00,
      baseUSDMax: 25.00,
      unit: 'per detector',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Install one per room, especially sleeping areas',
        es: 'Instalar uno por habitación, especialmente áreas de dormir',
        fr: 'Installer un par pièce, surtout les zones de couchage'
      }),
      tags: JSON.stringify(['fire', 'safety', 'detection', 'smoke']),
      isActive: true
    }
  })
  console.log('  ✓ Basic Smoke Detector added')

  // Fire Extinguisher ABC
  await prisma.costItem.upsert({
    where: { itemId: 'fire_extinguisher_abc' },
    update: {
      name: JSON.stringify({ en: 'ABC Fire Extinguisher', es: 'Extintor ABC', fr: 'Extincteur ABC' }),
      description: JSON.stringify({
        en: 'Multi-purpose fire extinguisher for wood, paper, electrical, and liquid fires',
        es: 'Extintor multipropósito para fuegos de madera, papel, eléctricos y líquidos',
        fr: 'Extincteur polyvalent pour feux de bois, papier, électriques et liquides'
      }),
      category: 'equipment',
      baseUSD: 45.00,
      baseUSDMin: 30.00,
      baseUSDMax: 80.00,
      unit: 'per extinguisher',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Place near exits, check pressure monthly',
        es: 'Colocar cerca de salidas, verificar presión mensualmente',
        fr: 'Placer près des sorties, vérifier la pression mensuellement'
      }),
      tags: JSON.stringify(['fire', 'safety', 'extinguisher', 'emergency']),
      isActive: true
    },
    create: {
      itemId: 'fire_extinguisher_abc',
      name: JSON.stringify({ en: 'ABC Fire Extinguisher', es: 'Extintor ABC', fr: 'Extincteur ABC' }),
      description: JSON.stringify({
        en: 'Multi-purpose fire extinguisher for wood, paper, electrical, and liquid fires',
        es: 'Extintor multipropósito para fuegos de madera, papel, eléctricos y líquidos',
        fr: 'Extincteur polyvalent pour feux de bois, papier, électriques et liquides'
      }),
      category: 'equipment',
      baseUSD: 45.00,
      baseUSDMin: 30.00,
      baseUSDMax: 80.00,
      unit: 'per extinguisher',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Place near exits, check pressure monthly',
        es: 'Colocar cerca de salidas, verificar presión mensualmente',
        fr: 'Placer près des sorties, vérifier la pression mensuellement'
      }),
      tags: JSON.stringify(['fire', 'safety', 'extinguisher', 'emergency']),
      isActive: true
    }
  })
  console.log('  ✓ ABC Fire Extinguisher added')

  // Fire Blanket
  await prisma.costItem.upsert({
    where: { itemId: 'fire_blanket' },
    update: {
      name: JSON.stringify({ en: 'Fire Blanket', es: 'Manta contra Incendios', fr: 'Couverture Anti-Feu' }),
      description: JSON.stringify({
        en: 'Fire-resistant blanket for smothering small fires and escaping burning person',
        es: 'Manta resistente al fuego para sofocar incendios pequeños y escapar de persona en llamas',
        fr: 'Couverture résistante au feu pour étouffer petits feux et échapper à une personne en feu'
      }),
      category: 'equipment',
      baseUSD: 25.00,
      baseUSDMin: 15.00,
      baseUSDMax: 40.00,
      unit: 'per blanket',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Hang in kitchen or near potential fire sources',
        es: 'Colgar en cocina o cerca de fuentes potenciales de incendio',
        fr: 'Accrocher dans la cuisine ou près de sources potentielles d\'incendie'
      }),
      tags: JSON.stringify(['fire', 'safety', 'blanket', 'kitchen']),
      isActive: true
    },
    create: {
      itemId: 'fire_blanket',
      name: JSON.stringify({ en: 'Fire Blanket', es: 'Manta contra Incendios', fr: 'Couverture Anti-Feu' }),
      description: JSON.stringify({
        en: 'Fire-resistant blanket for smothering small fires and escaping burning person',
        es: 'Manta resistente al fuego para sofocar incendios pequeños y escapar de persona en llamas',
        fr: 'Couverture résistante au feu pour étouffer petits feux et échapper à une personne en feu'
      }),
      category: 'equipment',
      baseUSD: 25.00,
      baseUSDMin: 15.00,
      baseUSDMax: 40.00,
      unit: 'per blanket',
      complexity: 'simple',
      notes: JSON.stringify({
        en: 'Hang in kitchen or near potential fire sources',
        es: 'Colgar en cocina o cerca de fuentes potenciales de incendio',
        fr: 'Accrocher dans la cuisine ou près de sources potentielles d\'incendie'
      }),
      tags: JSON.stringify(['fire', 'safety', 'blanket', 'kitchen']),
      isActive: true
    }
  })
  console.log('  ✓ Fire Blanket added')

  console.log('\n✅ Fire Protection Cost Items Added Successfully!')
}

async function main() {
  try {
    await addFireProtectionCostItems()
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

export { addFireProtectionCostItems }


/**
 * Seed script for HazardTranslation table
 * Populates translations for all hazard types in en, es, and fr locales
 * 
 * Run with: npx tsx scripts/seedHazardTranslations.ts
 */

import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

// Hazard translations for each locale
const HAZARD_TRANSLATIONS: Record<string, { en: { name: string; description: string }; es: { name: string; description: string }; fr: { name: string; description: string } }> = {
  hurricane: {
    en: { name: 'Hurricane / Tropical Storm', description: 'Major tropical cyclone with sustained winds over 74 mph, heavy rain, storm surge, and flooding' },
    es: { name: 'Huracán / Tormenta Tropical', description: 'Ciclón tropical mayor con vientos sostenidos de más de 119 km/h, fuertes lluvias, marejada ciclónica e inundaciones' },
    fr: { name: 'Ouragan / Tempête Tropicale', description: 'Cyclone tropical majeur avec des vents soutenus de plus de 119 km/h, fortes pluies, onde de tempête et inondations' }
  },
  flooding: {
    en: { name: 'Flooding', description: 'Overflow of water onto normally dry land from heavy rain, storm surge, or river overflow' },
    es: { name: 'Inundación', description: 'Desbordamiento de agua sobre tierras normalmente secas por lluvias intensas, marejada ciclónica o desbordamiento de ríos' },
    fr: { name: 'Inondation', description: 'Débordement d\'eau sur des terres normalement sèches dû à de fortes pluies, une onde de tempête ou un débordement de rivière' }
  },
  drought: {
    en: { name: 'Drought', description: 'Extended period of abnormally low rainfall leading to water shortage' },
    es: { name: 'Sequía', description: 'Período prolongado de lluvias anormalmente bajas que provoca escasez de agua' },
    fr: { name: 'Sécheresse', description: 'Période prolongée de précipitations anormalement faibles entraînant une pénurie d\'eau' }
  },
  earthquake: {
    en: { name: 'Earthquake', description: 'Sudden ground shaking caused by tectonic plate movement' },
    es: { name: 'Terremoto', description: 'Sacudida repentina del suelo causada por el movimiento de placas tectónicas' },
    fr: { name: 'Tremblement de Terre', description: 'Secousse soudaine du sol causée par le mouvement des plaques tectoniques' }
  },
  landslide: {
    en: { name: 'Landslide / Mudslide', description: 'Movement of rock, earth, or debris down a slope, often triggered by heavy rain' },
    es: { name: 'Deslizamiento de Tierra', description: 'Movimiento de rocas, tierra o escombros por una pendiente, a menudo provocado por lluvias intensas' },
    fr: { name: 'Glissement de Terrain', description: 'Mouvement de roches, de terre ou de débris sur une pente, souvent déclenché par de fortes pluies' }
  },
  power_outage: {
    en: { name: 'Power Outage', description: 'Loss of electrical power supply due to grid failure, weather, or equipment malfunction' },
    es: { name: 'Corte de Energía', description: 'Pérdida del suministro de energía eléctrica debido a fallas en la red, clima o mal funcionamiento de equipos' },
    fr: { name: 'Panne de Courant', description: 'Perte d\'alimentation électrique due à une défaillance du réseau, aux intempéries ou à un dysfonctionnement d\'équipement' }
  },
  fire: {
    en: { name: 'Fire', description: 'Uncontrolled fire within or near business premises' },
    es: { name: 'Incendio', description: 'Fuego no controlado dentro o cerca de las instalaciones del negocio' },
    fr: { name: 'Incendie', description: 'Feu non contrôlé à l\'intérieur ou près des locaux commerciaux' }
  },
  cybersecurity_incident: {
    en: { name: 'Cybersecurity Incident / Data Breach', description: 'Cyberattack, ransomware, data theft, or IT system compromise' },
    es: { name: 'Incidente de Ciberseguridad / Violación de Datos', description: 'Ciberataque, ransomware, robo de datos o compromiso de sistemas informáticos' },
    fr: { name: 'Incident de Cybersécurité / Violation de Données', description: 'Cyberattaque, rançongiciel, vol de données ou compromission de systèmes informatiques' }
  },
  civil_unrest: {
    en: { name: 'Civil Unrest / Protests', description: 'Social disturbances, protests, or civil unrest affecting business operations' },
    es: { name: 'Disturbios Civiles / Protestas', description: 'Disturbios sociales, protestas o desórdenes civiles que afectan las operaciones del negocio' },
    fr: { name: 'Troubles Civils / Manifestations', description: 'Troubles sociaux, manifestations ou désordres civils affectant les opérations commerciales' }
  },
  break_in_theft: {
    en: { name: 'Break-ins & Theft', description: 'Criminal activity targeting business property or assets including break-ins, theft, and vandalism' },
    es: { name: 'Robos y Hurtos', description: 'Actividad criminal dirigida a la propiedad o activos del negocio, incluyendo allanamientos, robos y vandalismo' },
    fr: { name: 'Cambriolages et Vols', description: 'Activité criminelle ciblant les biens ou actifs de l\'entreprise, y compris les effractions, vols et vandalisme' }
  },
  health_emergency: {
    en: { name: 'Health Emergency / Pandemic', description: 'Disease outbreak, pandemic, or public health crisis' },
    es: { name: 'Emergencia Sanitaria / Pandemia', description: 'Brote de enfermedad, pandemia o crisis de salud pública' },
    fr: { name: 'Urgence Sanitaire / Pandémie', description: 'Épidémie, pandémie ou crise de santé publique' }
  },
  supply_disruption: {
    en: { name: 'Supply Chain Disruption', description: 'Interruption in supply of critical goods or materials' },
    es: { name: 'Interrupción de la Cadena de Suministro', description: 'Interrupción en el suministro de bienes o materiales críticos' },
    fr: { name: 'Perturbation de la Chaîne d\'Approvisionnement', description: 'Interruption de l\'approvisionnement en biens ou matériaux critiques' }
  },
  economic_downturn: {
    en: { name: 'Economic Downturn / Tourism Decline', description: 'Significant reduction in customer demand or economic activity' },
    es: { name: 'Recesión Económica / Declive del Turismo', description: 'Reducción significativa en la demanda de clientes o actividad económica' },
    fr: { name: 'Ralentissement Économique / Déclin du Tourisme', description: 'Réduction significative de la demande des clients ou de l\'activité économique' }
  }
}

async function seedHazardTranslations() {
  console.log('🌐 Seeding hazard translations...\n')

  const locales = ['en', 'es', 'fr'] as const

  let created = 0
  let updated = 0
  let skipped = 0

  // Get all existing hazard types
  const hazards = await prisma.adminHazardType.findMany({
    select: { id: true, hazardId: true }
  })

  console.log(`Found ${hazards.length} hazard types in database\n`)

  for (const hazard of hazards) {
    const translations = HAZARD_TRANSLATIONS[hazard.hazardId]

    if (!translations) {
      console.log(`  ⚠️  No translations defined for: ${hazard.hazardId}`)
      skipped++
      continue
    }

    for (const locale of locales) {
      const translation = translations[locale]

      // Check if translation already exists
      const existing = await prisma.hazardTranslation.findUnique({
        where: {
          hazardId_locale: {
            hazardId: hazard.id,
            locale
          }
        }
      })

      if (existing) {
        // Update existing translation
        await prisma.hazardTranslation.update({
          where: { id: existing.id },
          data: {
            name: translation.name,
            description: translation.description,
            updatedAt: new Date()
          }
        })
        console.log(`  ↻ Updated ${locale}: ${hazard.hazardId}`)
        updated++
      } else {
        // Create new translation
        await prisma.hazardTranslation.create({
          data: {
            id: randomUUID(),
            hazardId: hazard.id,
            locale,
            name: translation.name,
            description: translation.description,
            updatedAt: new Date()
          }
        })
        console.log(`  ✓ Created ${locale}: ${hazard.hazardId}`)
        created++
      }
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Summary:')
  console.log(`   - Translations created: ${created}`)
  console.log(`   - Translations updated: ${updated}`)
  console.log(`   - Hazards skipped (no translation): ${skipped}`)
  console.log('='.repeat(50))
}

// Verify translations
async function verifyTranslations() {
  console.log('\n🔍 Verifying translations...\n')

  const hazards = await prisma.adminHazardType.findMany({
    include: {
      HazardTranslation: true
    }
  })

  const locales = ['en', 'es', 'fr']
  let issues = 0

  for (const hazard of hazards) {
    for (const locale of locales) {
      const hasTranslation = hazard.HazardTranslation.some(t => t.locale === locale)
      if (!hasTranslation) {
        console.log(`  ❌ Missing ${locale} translation for: ${hazard.hazardId}`)
        issues++
      }
    }
  }

  if (issues === 0) {
    console.log('  ✅ All hazards have translations for all locales!')
  } else {
    console.log(`\n  ⚠️  Found ${issues} missing translations`)
  }
}

// Run if called directly
async function main() {
  try {
    await seedHazardTranslations()
    await verifyTranslations()
    console.log('\n🎉 Hazard translations seeded successfully!')
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()



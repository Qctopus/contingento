import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Add Cost Items for Supply Chain Disruption Strategy
 */

async function addSupplyChainCostItems() {
  console.log('🚛 Adding Supply Chain Disruption Cost Items...\n')

  // Emergency Inventory Storage
  await prisma.costItem.upsert({
    where: { itemId: 'emergency_inventory_storage' },
    update: {
      name: JSON.stringify({ en: 'Emergency Inventory Storage', es: 'Almacenamiento de Inventario de Emergencia', fr: 'Stockage Inventaire d\'Urgence' }),
      description: JSON.stringify({
        en: 'Secure storage space for emergency inventory reserves to maintain operations during supply disruptions',
        es: 'Espacio de almacenamiento seguro para reservas de inventario de emergencia para mantener operaciones durante interrupciones de suministro',
        fr: 'Espace stockage sécurisé pour réserves inventaire urgence pour maintenir opérations pendant perturbations approvisionnement'
      }),
      category: 'service',
      baseUSD: 500.00,
      baseUSDMin: 200.00,
      baseUSDMax: 2000.00,
      unit: 'per month',
      complexity: 'medium',
      notes: JSON.stringify({
        en: 'Includes climate-controlled storage and inventory management',
        es: 'Incluye almacenamiento climatizado y gestión de inventario',
        fr: 'Inclut stockage climatisé et gestion inventaire'
      }),
      tags: JSON.stringify(['supply_chain', 'inventory', 'storage', 'emergency']),
      isActive: true
    },
    create: {
      itemId: 'emergency_inventory_storage',
      name: JSON.stringify({ en: 'Emergency Inventory Storage', es: 'Almacenamiento de Inventario de Emergencia', fr: 'Stockage Inventaire d\'Urgence' }),
      description: JSON.stringify({
        en: 'Secure storage space for emergency inventory reserves to maintain operations during supply disruptions',
        es: 'Espacio de almacenamiento seguro para reservas de inventario de emergencia para mantener operaciones durante interrupciones de suministro',
        fr: 'Espace stockage sécurisé pour réserves inventaire urgence pour maintenir opérations pendant perturbations approvisionnement'
      }),
      category: 'service',
      baseUSD: 500.00,
      baseUSDMin: 200.00,
      baseUSDMax: 2000.00,
      unit: 'per month',
      complexity: 'medium',
      notes: JSON.stringify({
        en: 'Includes climate-controlled storage and inventory management',
        es: 'Incluye almacenamiento climatizado y gestión de inventario',
        fr: 'Inclut stockage climatisé et gestion inventaire'
      }),
      tags: JSON.stringify(['supply_chain', 'inventory', 'storage', 'emergency']),
      isActive: true
    }
  })
  console.log('  ✓ Emergency Inventory Storage added')

  // Alternative Supplier Database
  await prisma.costItem.upsert({
    where: { itemId: 'supplier_database_service' },
    update: {
      name: JSON.stringify({ en: 'Supplier Database & Monitoring Service', es: 'Base de Datos de Proveedores y Servicio de Monitoreo', fr: 'Base de Données Fournisseurs et Service Surveillance' }),
      description: JSON.stringify({
        en: 'Database service to track alternative suppliers and monitor supply chain risks',
        es: 'Servicio de base de datos para rastrear proveedores alternativos y monitorear riesgos de cadena de suministro',
        fr: 'Service base données pour suivre fournisseurs alternatifs et surveiller risques chaîne approvisionnement'
      }),
      category: 'service',
      baseUSD: 300.00,
      baseUSDMin: 150.00,
      baseUSDMax: 800.00,
      unit: 'per year',
      complexity: 'medium',
      notes: JSON.stringify({
        en: 'Includes supplier risk assessments and contact management',
        es: 'Incluye evaluaciones de riesgo de proveedores y gestión de contactos',
        fr: 'Inclut évaluations risque fournisseurs et gestion contacts'
      }),
      tags: JSON.stringify(['supply_chain', 'suppliers', 'monitoring', 'database']),
      isActive: true
    },
    create: {
      itemId: 'supplier_database_service',
      name: JSON.stringify({ en: 'Supplier Database & Monitoring Service', es: 'Base de Datos de Proveedores y Servicio de Monitoreo', fr: 'Base de Données Fournisseurs et Service Surveillance' }),
      description: JSON.stringify({
        en: 'Database service to track alternative suppliers and monitor supply chain risks',
        es: 'Servicio de base de datos para rastrear proveedores alternativos y monitorear riesgos de cadena de suministro',
        fr: 'Service base données pour suivre fournisseurs alternatifs et surveiller risques chaîne approvisionnement'
      }),
      category: 'service',
      baseUSD: 300.00,
      baseUSDMin: 150.00,
      baseUSDMax: 800.00,
      unit: 'per year',
      complexity: 'medium',
      notes: JSON.stringify({
        en: 'Includes supplier risk assessments and contact management',
        es: 'Incluye evaluaciones de riesgo de proveedores y gestión de contactos',
        fr: 'Inclut évaluations risque fournisseurs et gestion contacts'
      }),
      tags: JSON.stringify(['supply_chain', 'suppliers', 'monitoring', 'database']),
      isActive: true
    }
  })
  console.log('  ✓ Supplier Database Service added')

  // Local Sourcing Development
  await prisma.costItem.upsert({
    where: { itemId: 'local_sourcing_consultation' },
    update: {
      name: JSON.stringify({ en: 'Local Sourcing Development Consultation', es: 'Consultoría de Desarrollo de Abastecimiento Local', fr: 'Consultation Développement Approvisionnement Local' }),
      description: JSON.stringify({
        en: 'Consultation service to identify and develop local suppliers to reduce supply chain dependency',
        es: 'Servicio de consultoría para identificar y desarrollar proveedores locales para reducir dependencia de cadena de suministro',
        fr: 'Service consultation pour identifier et développer fournisseurs locaux pour réduire dépendance chaîne approvisionnement'
      }),
      category: 'service',
      baseUSD: 2500.00,
      baseUSDMin: 1000.00,
      baseUSDMax: 5000.00,
      unit: 'per project',
      complexity: 'high',
      notes: JSON.stringify({
        en: 'Includes supplier identification, quality assessment, and relationship development',
        es: 'Incluye identificación de proveedores, evaluación de calidad y desarrollo de relaciones',
        fr: 'Inclut identification fournisseurs, évaluation qualité et développement relations'
      }),
      tags: JSON.stringify(['supply_chain', 'local', 'consultation', 'sourcing']),
      isActive: true
    },
    create: {
      itemId: 'local_sourcing_consultation',
      name: JSON.stringify({ en: 'Local Sourcing Development Consultation', es: 'Consultoría de Desarrollo de Abastecimiento Local', fr: 'Consultation Développement Approvisionnement Local' }),
      description: JSON.stringify({
        en: 'Consultation service to identify and develop local suppliers to reduce supply chain dependency',
        es: 'Servicio de consultoría para identificar y desarrollar proveedores locales para reducir dependencia de cadena de suministro',
        fr: 'Service consultation pour identifier et développer fournisseurs locaux pour réduire dépendance chaîne approvisionnement'
      }),
      category: 'service',
      baseUSD: 2500.00,
      baseUSDMin: 1000.00,
      baseUSDMax: 5000.00,
      unit: 'per project',
      complexity: 'high',
      notes: JSON.stringify({
        en: 'Includes supplier identification, quality assessment, and relationship development',
        es: 'Incluye identificación de proveedores, evaluación de calidad y desarrollo de relaciones',
        fr: 'Inclut identification fournisseurs, évaluation qualité et développement relations'
      }),
      tags: JSON.stringify(['supply_chain', 'local', 'consultation', 'sourcing']),
      isActive: true
    }
  })
  console.log('  ✓ Local Sourcing Consultation added')

  // Supply Chain Insurance
  await prisma.costItem.upsert({
    where: { itemId: 'supply_chain_insurance' },
    update: {
      name: JSON.stringify({ en: 'Supply Chain Disruption Insurance', es: 'Seguro de Interrupción de Cadena de Suministro', fr: 'Assurance Perturbation Chaîne Approvisionnement' }),
      description: JSON.stringify({
        en: 'Insurance coverage for supply chain disruptions, delays, and related business losses',
        es: 'Cobertura de seguro para interrupciones de cadena de suministro, demoras y pérdidas comerciales relacionadas',
        fr: 'Couverture assurance pour perturbations chaîne approvisionnement, retards et pertes commerciales connexes'
      }),
      category: 'service',
      baseUSD: 1500.00,
      baseUSDMin: 800.00,
      baseUSDMax: 3000.00,
      unit: 'per year',
      complexity: 'medium',
      notes: JSON.stringify({
        en: 'Covers supplier failures, transportation delays, and inventory losses',
        es: 'Cubre fallas de proveedores, demoras de transporte y pérdidas de inventario',
        fr: 'Couvre défaillances fournisseurs, retards transport et pertes inventaire'
      }),
      tags: JSON.stringify(['supply_chain', 'insurance', 'disruption', 'business_interruption']),
      isActive: true
    },
    create: {
      itemId: 'supply_chain_insurance',
      name: JSON.stringify({ en: 'Supply Chain Disruption Insurance', es: 'Seguro de Interrupción de Cadena de Suministro', fr: 'Assurance Perturbation Chaîne Approvisionnement' }),
      description: JSON.stringify({
        en: 'Insurance coverage for supply chain disruptions, delays, and related business losses',
        es: 'Cobertura de seguro para interrupciones de cadena de suministro, demoras y pérdidas comerciales relacionadas',
        fr: 'Couverture assurance pour perturbations chaîne approvisionnement, retards et pertes commerciales connexes'
      }),
      category: 'service',
      baseUSD: 1500.00,
      baseUSDMin: 800.00,
      baseUSDMax: 3000.00,
      unit: 'per year',
      complexity: 'medium',
      notes: JSON.stringify({
        en: 'Covers supplier failures, transportation delays, and inventory losses',
        es: 'Cubre fallas de proveedores, demoras de transporte y pérdidas de inventario',
        fr: 'Couvre défaillances fournisseurs, retards transport et pertes inventaire'
      }),
      tags: JSON.stringify(['supply_chain', 'insurance', 'disruption', 'business_interruption']),
      isActive: true
    }
  })
  console.log('  ✓ Supply Chain Insurance added')

  console.log('\n✅ Supply Chain Disruption Cost Items Added Successfully!')
}

async function main() {
  try {
    await addSupplyChainCostItems()
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

export { addSupplyChainCostItems }


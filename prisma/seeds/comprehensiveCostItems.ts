import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const COMPREHENSIVE_COST_ITEMS = [
  // ============================================================================
  // HURRICANE/STORM PROTECTION
  // ============================================================================
  {
    itemId: 'hurricane_shutters_aluminum',
    name: 'Hurricane Shutters (Aluminum Roll-down)',
    description: 'Professional grade aluminum roll-down shutters with motor and manual override',
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
    name: 'Hurricane Shutters (Accordion Style)',
    description: 'Permanent accordion-style hurricane shutters, manual operation',
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
    name: 'Plywood Hurricane Boards (3/4")',
    description: 'Marine-grade plywood boards with fasteners and anchors for temporary window protection',
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
    name: 'Hurricane Roof Straps & Reinforcement',
    description: 'Metal hurricane straps and clips to secure roof trusses to walls',
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
    name: 'Door Reinforcement Kit',
    description: 'Heavy-duty door braces, locks, and hinges for storm protection',
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
    name: 'Backup Generator (5kW Diesel)',
    description: 'Portable diesel generator with automatic transfer switch, 5kW capacity',
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
    name: 'Backup Generator (10kW Diesel)',
    description: 'Commercial-grade diesel generator, 10kW capacity with weatherproof enclosure',
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
    name: 'Backup Generator (3kW Gasoline)',
    description: 'Basic portable gasoline generator, 3kW capacity',
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
    name: 'Solar Battery Backup System (3kW)',
    description: 'Solar panels with battery storage, 3kW inverter system',
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
    name: 'Generator Fuel (50L Diesel)',
    description: 'Diesel fuel for backup generator (50 liter tank)',
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
    name: 'UPS Battery Backup (1kW)',
    description: 'Uninterruptible power supply for computers and essential electronics',
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
    name: 'Water Storage Tank (500L)',
    description: 'Polyethylene water storage tank with stand and fittings',
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
    name: 'Water Storage Tank (1000L)',
    description: 'Large capacity polyethylene water storage tank with stand',
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
    name: 'Water Purification Tablets (100 pack)',
    description: 'Emergency water purification tablets, treats 100 liters',
    category: 'supplies',
    baseUSD: 15,
    unit: 'per pack',
    complexity: 'simple',
    tags: JSON.stringify(['water', 'purification', 'emergency'])
  },
  {
    itemId: 'water_filter_gravity',
    name: 'Gravity Water Filter System',
    description: 'Ceramic filter gravity-fed water purification system',
    category: 'equipment',
    baseUSD: 250,
    baseUSDMin: 200,
    baseUSDMax: 300,
    unit: 'per unit',
    complexity: 'simple',
    tags: JSON.stringify(['water', 'filter', 'purification'])
  },
  
  // ============================================================================
  // FLOOD PROTECTION
  // ============================================================================
  {
    itemId: 'sandbags_100pack',
    name: 'Sandbags (100 pack)',
    description: 'Heavy-duty polypropylene sandbags with ties',
    category: 'supplies',
    baseUSD: 80,
    baseUSDMin: 60,
    baseUSDMax: 100,
    unit: 'per 100 bags',
    complexity: 'simple',
    tags: JSON.stringify(['flood', 'sandbags', 'protection'])
  },
  {
    itemId: 'flood_barrier_portable',
    name: 'Portable Flood Barrier (10ft)',
    description: 'Reusable water-activated flood barrier, 10 feet length',
    category: 'equipment',
    baseUSD: 400,
    baseUSDMin: 350,
    baseUSDMax: 450,
    unit: 'per 10ft section',
    complexity: 'simple',
    tags: JSON.stringify(['flood', 'barrier', 'portable', 'reusable'])
  },
  {
    itemId: 'sump_pump_submersible',
    name: 'Submersible Sump Pump',
    description: 'Heavy-duty submersible water pump for flood removal',
    category: 'equipment',
    baseUSD: 300,
    baseUSDMin: 250,
    baseUSDMax: 350,
    unit: 'per pump',
    complexity: 'medium',
    tags: JSON.stringify(['flood', 'pump', 'drainage'])
  },
  
  // ============================================================================
  // EMERGENCY SUPPLIES
  // ============================================================================
  {
    itemId: 'emergency_food_2weeks',
    name: 'Emergency Food Supplies (2 weeks)',
    description: 'Non-perishable emergency food rations for 2 weeks per person',
    category: 'supplies',
    baseUSD: 300,
    baseUSDMin: 250,
    baseUSDMax: 350,
    unit: 'per person',
    complexity: 'simple',
    tags: JSON.stringify(['emergency', 'food', 'supplies', 'rations'])
  },
  {
    itemId: 'first_aid_kit_commercial',
    name: 'First Aid Kit (Commercial Grade)',
    description: 'Comprehensive first aid kit for businesses, 50+ person capacity',
    category: 'supplies',
    baseUSD: 150,
    baseUSDMin: 120,
    baseUSDMax: 180,
    unit: 'per kit',
    complexity: 'simple',
    tags: JSON.stringify(['emergency', 'first-aid', 'medical', 'safety'])
  },
  {
    itemId: 'flashlights_batteries_pack',
    name: 'Flashlights & Batteries (Pack of 5)',
    description: 'LED flashlights with spare batteries, pack of 5 units',
    category: 'supplies',
    baseUSD: 40,
    unit: 'per pack',
    complexity: 'simple',
    tags: JSON.stringify(['emergency', 'lighting', 'flashlight'])
  },
  {
    itemId: 'emergency_radio_crank',
    name: 'Emergency Crank Radio',
    description: 'Hand-crank emergency radio with USB charging port',
    category: 'supplies',
    baseUSD: 35,
    unit: 'per unit',
    complexity: 'simple',
    tags: JSON.stringify(['emergency', 'radio', 'communication'])
  },
  
  // ============================================================================
  // FIRE SAFETY
  // ============================================================================
  {
    itemId: 'fire_extinguisher_10lb',
    name: 'Fire Extinguisher (10lb ABC)',
    description: 'Commercial-grade 10lb ABC fire extinguisher with bracket',
    category: 'equipment',
    baseUSD: 60,
    baseUSDMin: 50,
    baseUSDMax: 70,
    unit: 'per extinguisher',
    complexity: 'simple',
    tags: JSON.stringify(['fire', 'safety', 'extinguisher'])
  },
  {
    itemId: 'smoke_detector_commercial',
    name: 'Smoke Detector (Commercial Grade)',
    description: 'Hardwired smoke detector with battery backup',
    category: 'equipment',
    baseUSD: 40,
    baseUSDMin: 30,
    baseUSDMax: 50,
    unit: 'per detector',
    complexity: 'simple',
    tags: JSON.stringify(['fire', 'safety', 'smoke-detector'])
  },
  {
    itemId: 'fire_suppression_system',
    name: 'Automatic Fire Suppression System',
    description: 'Commercial kitchen fire suppression system with automatic activation',
    category: 'equipment',
    baseUSD: 3500,
    baseUSDMin: 3000,
    baseUSDMax: 4000,
    unit: 'per system',
    complexity: 'complex',
    tags: JSON.stringify(['fire', 'suppression', 'automatic', 'professional'])
  },
  
  // ============================================================================
  // SECURITY
  // ============================================================================
  {
    itemId: 'security_camera_4ch',
    name: 'Security Camera System (4-channel)',
    description: 'DVR with 4 weatherproof cameras, night vision, 1TB storage',
    category: 'equipment',
    baseUSD: 500,
    baseUSDMin: 400,
    baseUSDMax: 600,
    unit: 'per system',
    complexity: 'medium',
    tags: JSON.stringify(['security', 'camera', 'surveillance'])
  },
  {
    itemId: 'alarm_system_basic',
    name: 'Alarm System (Basic)',
    description: 'Basic alarm system with door/window sensors and siren',
    category: 'equipment',
    baseUSD: 400,
    baseUSDMin: 300,
    baseUSDMax: 500,
    unit: 'per system',
    complexity: 'medium',
    tags: JSON.stringify(['security', 'alarm', 'monitoring'])
  },
  {
    itemId: 'security_grilles_window',
    name: 'Security Grilles (Window)',
    description: 'Steel security grilles for windows with locks',
    category: 'construction',
    baseUSD: 200,
    baseUSDMin: 150,
    baseUSDMax: 250,
    unit: 'per window',
    complexity: 'medium',
    tags: JSON.stringify(['security', 'grilles', 'windows', 'bars'])
  },
  
  // ============================================================================
  // PROFESSIONAL SERVICES
  // ============================================================================
  {
    itemId: 'installation_professional',
    name: 'Professional Installation Service',
    description: 'Licensed contractor installation labor',
    category: 'service',
    baseUSD: 200,
    baseUSDMin: 150,
    baseUSDMax: 250,
    unit: 'per job',
    complexity: 'simple',
    tags: JSON.stringify(['installation', 'labor', 'professional'])
  },
  {
    itemId: 'consultation_risk_assessment',
    name: 'Risk Assessment Consultation',
    description: 'Professional risk assessment and planning consultation',
    category: 'service',
    baseUSD: 500,
    baseUSDMin: 400,
    baseUSDMax: 600,
    unit: 'per consultation',
    complexity: 'simple',
    tags: JSON.stringify(['consultation', 'risk', 'assessment', 'professional'])
  },
  {
    itemId: 'maintenance_annual',
    name: 'Annual Equipment Maintenance',
    description: 'Annual maintenance contract for equipment and systems',
    category: 'service',
    baseUSD: 150,
    baseUSDMin: 100,
    baseUSDMax: 200,
    unit: 'per year',
    complexity: 'simple',
    tags: JSON.stringify(['maintenance', 'service', 'annual'])
  },
  {
    itemId: 'training_emergency_response',
    name: 'Emergency Response Training',
    description: 'Staff training session on emergency response procedures',
    category: 'service',
    baseUSD: 300,
    baseUSDMin: 250,
    baseUSDMax: 350,
    unit: 'per session',
    complexity: 'simple',
    tags: JSON.stringify(['training', 'emergency', 'staff', 'education'])
  },
  
  // ============================================================================
  // TECHNOLOGY & COMMUNICATION
  // ============================================================================
  {
    itemId: 'satellite_phone',
    name: 'Satellite Phone',
    description: 'Emergency satellite phone with service plan',
    category: 'equipment',
    baseUSD: 800,
    baseUSDMin: 600,
    baseUSDMax: 1000,
    unit: 'per phone',
    complexity: 'medium',
    tags: JSON.stringify(['communication', 'satellite', 'phone', 'emergency'])
  },
  {
    itemId: 'two_way_radios_6pack',
    name: 'Two-Way Radios (6-pack)',
    description: 'Professional two-way radios with 5-mile range, pack of 6',
    category: 'equipment',
    baseUSD: 300,
    baseUSDMin: 250,
    baseUSDMax: 350,
    unit: 'per 6-pack',
    complexity: 'simple',
    tags: JSON.stringify(['communication', 'radio', 'walkie-talkie'])
  },
  {
    itemId: 'data_backup_cloud',
    name: 'Cloud Data Backup Service',
    description: 'Cloud backup service subscription (1 year)',
    category: 'service',
    baseUSD: 200,
    baseUSDMin: 150,
    baseUSDMax: 250,
    unit: 'per year',
    complexity: 'simple',
    tags: JSON.stringify(['technology', 'backup', 'cloud', 'data'])
  },
  {
    itemId: 'external_hard_drive_2tb',
    name: 'External Hard Drive (2TB)',
    description: 'Rugged external hard drive for local backups',
    category: 'equipment',
    baseUSD: 100,
    baseUSDMin: 80,
    baseUSDMax: 120,
    unit: 'per drive',
    complexity: 'simple',
    tags: JSON.stringify(['technology', 'backup', 'storage', 'hardware'])
  }
]

export async function seedComprehensiveCostItems() {
  console.log('💰 Seeding comprehensive cost items library...')
  
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
      console.log(`  ↻ Updated: ${item.name}`)
      updated++
    } else {
      await prisma.costItem.create({ data: item })
      console.log(`  ✓ Created: ${item.name}`)
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
  seedComprehensiveCostItems()
    .then(() => {
      console.log('\n🎉 Comprehensive cost items seeded successfully!')
      prisma.$disconnect()
    })
    .catch((e) => {
      console.error('\n❌ Seeding failed:', e)
      prisma.$disconnect()
      process.exit(1)
    })
}


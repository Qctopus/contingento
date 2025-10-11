const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateParishesToAdminUnits() {
  console.log('🚀 Starting Parish → Country/AdminUnit migration...\n');

  try {
    // Step 1: Create Jamaica country if it doesn't exist
    console.log('📍 Step 1: Creating Jamaica country...');
    let jamaica = await prisma.country.findUnique({
      where: { code: 'JM' }
    });

    if (!jamaica) {
      jamaica = await prisma.country.create({
        data: {
          name: 'Jamaica',
          code: 'JM',
          region: 'Caribbean',
          isActive: true
        }
      });
      console.log('✅ Created Jamaica country');
    } else {
      console.log('ℹ️  Jamaica country already exists');
    }

    // Step 2: Get all parishes
    console.log('\n📊 Step 2: Fetching parishes...');
    const parishes = await prisma.parish.findMany({
      include: {
        parishRisk: true
      }
    });
    console.log(`Found ${parishes.length} parishes`);

    // Step 3: Migrate each parish to AdminUnit
    console.log('\n🔄 Step 3: Migrating parishes to admin units...');
    let created = 0;
    let skipped = 0;

    for (const parish of parishes) {
      // Check if admin unit already exists
      const existing = await prisma.adminUnit.findFirst({
        where: {
          name: parish.name,
          countryId: jamaica.id
        }
      });

      if (existing) {
        console.log(`  ⏭️  Skipped ${parish.name} (already exists)`);
        skipped++;
        continue;
      }

      // Create admin unit
      const adminUnit = await prisma.adminUnit.create({
        data: {
          name: parish.name,
          type: 'parish',
          region: parish.region,
          countryId: jamaica.id,
          population: parish.population || 0,
          area: parish.area,
          elevation: parish.elevation,
          coordinates: parish.coordinates,
          isActive: parish.isActive
        }
      });

      // Migrate risk data if it exists
      if (parish.parishRisk) {
        await prisma.adminUnitRisk.create({
          data: {
            adminUnitId: adminUnit.id,
            hurricaneLevel: parish.parishRisk.hurricaneLevel,
            hurricaneNotes: parish.parishRisk.hurricaneNotes,
            floodLevel: parish.parishRisk.floodLevel,
            floodNotes: parish.parishRisk.floodNotes,
            earthquakeLevel: parish.parishRisk.earthquakeLevel,
            earthquakeNotes: parish.parishRisk.earthquakeNotes,
            droughtLevel: parish.parishRisk.droughtLevel,
            droughtNotes: parish.parishRisk.droughtNotes,
            landslideLevel: parish.parishRisk.landslideLevel,
            landslideNotes: parish.parishRisk.landslideNotes,
            powerOutageLevel: parish.parishRisk.powerOutageLevel,
            powerOutageNotes: parish.parishRisk.powerOutageNotes,
            riskProfileJson: parish.parishRisk.riskProfileJson,
            lastUpdated: parish.parishRisk.lastUpdated,
            updatedBy: parish.parishRisk.updatedBy
          }
        });
      }

      console.log(`  ✅ Migrated ${parish.name}`);
      created++;
    }

    console.log('\n📈 Migration Summary:');
    console.log(`  Created: ${created} admin units`);
    console.log(`  Skipped: ${skipped} (already existed)`);
    console.log(`  Total:   ${parishes.length} parishes processed`);

    // Step 4: Verify migration
    console.log('\n🔍 Step 4: Verifying migration...');
    const adminUnits = await prisma.adminUnit.findMany({
      where: { countryId: jamaica.id },
      include: { adminUnitRisk: true }
    });
    console.log(`✅ Verified ${adminUnits.length} admin units for Jamaica`);

    console.log('\n✨ Migration completed successfully!');
    console.log('\nℹ️  Note: Parish table is kept for backward compatibility.');
    console.log('   New features should use AdminUnit instead.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateParishesToAdminUnits()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


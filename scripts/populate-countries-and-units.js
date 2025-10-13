const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function populateCountriesAndUnits() {
  console.log('🌍 Populating Countries and Administrative Units...\n');

  try {
    // Step 1: Create Countries
    console.log('📍 Step 1: Creating countries...');
    
    const countries = [
      {
        code: 'JM',
        name: 'Jamaica',
        region: 'Caribbean',
        isActive: true
      },
      {
        code: 'TT',
        name: 'Trinidad and Tobago',
        region: 'Caribbean',
        isActive: true
      },
      {
        code: 'BB',
        name: 'Barbados',
        region: 'Caribbean',
        isActive: true
      }
    ];

    for (const countryData of countries) {
      const existing = await prisma.country.findUnique({
        where: { code: countryData.code }
      });

      if (!existing) {
        await prisma.country.create({ data: countryData });
        console.log(`  ✅ Created ${countryData.name}`);
      } else {
        console.log(`  ℹ️  ${countryData.name} already exists`);
      }
    }

    // Get countries for reference
    const jamaica = await prisma.country.findUnique({ where: { code: 'JM' } });
    const trinidad = await prisma.country.findUnique({ where: { code: 'TT' } });
    const barbados = await prisma.country.findUnique({ where: { code: 'BB' } });

    // Step 2: Create Jamaica Parishes (14 parishes)
    console.log('\n📊 Step 2: Creating Jamaica parishes...');
    
    const jamaicaParishes = [
      { name: 'Kingston', region: 'Kingston Metropolitan', population: 89868, type: 'parish' },
      { name: 'St. Andrew', region: 'Kingston Metropolitan', population: 573369, type: 'parish' },
      { name: 'St. Thomas', region: 'Surrey', population: 93902, type: 'parish' },
      { name: 'Portland', region: 'Surrey', population: 82183, type: 'parish' },
      { name: 'St. Mary', region: 'Middlesex', population: 113615, type: 'parish' },
      { name: 'St. Ann', region: 'Middlesex', population: 175396, type: 'parish' },
      { name: 'Trelawny', region: 'Cornwall', population: 73066, type: 'parish' },
      { name: 'St. James', region: 'Cornwall', population: 183811, type: 'parish' },
      { name: 'Hanover', region: 'Cornwall', population: 69533, type: 'parish' },
      { name: 'Westmoreland', region: 'Cornwall', population: 144817, type: 'parish' },
      { name: 'St. Elizabeth', region: 'Cornwall', population: 150205, type: 'parish' },
      { name: 'Manchester', region: 'Middlesex', population: 190812, type: 'parish' },
      { name: 'Clarendon', region: 'Middlesex', population: 245103, type: 'parish' },
      { name: 'St. Catherine', region: 'Middlesex', population: 516218, type: 'parish' }
    ];

    for (const parishData of jamaicaParishes) {
      const existing = await prisma.adminUnit.findFirst({
        where: {
          name: parishData.name,
          countryId: jamaica.id
        }
      });

      if (!existing) {
        const adminUnit = await prisma.adminUnit.create({
          data: {
            ...parishData,
            countryId: jamaica.id,
            isActive: true
          }
        });

        // Create risk profile with sample data
        await prisma.adminUnitRisk.create({
          data: {
            adminUnitId: adminUnit.id,
            hurricaneLevel: Math.floor(Math.random() * 3) + 6, // 6-8
            hurricaneNotes: 'High risk during hurricane season (June-November)',
            floodLevel: Math.floor(Math.random() * 3) + 4, // 4-6
            floodNotes: 'Moderate to high flood risk during heavy rainfall',
            earthquakeLevel: Math.floor(Math.random() * 2) + 3, // 3-4
            earthquakeNotes: 'Moderate earthquake risk due to proximity to fault lines',
            droughtLevel: Math.floor(Math.random() * 2) + 2, // 2-3
            droughtNotes: 'Low drought risk, occasional dry spells',
            landslideLevel: Math.floor(Math.random() * 3) + 3, // 3-5
            landslideNotes: 'Risk varies by terrain and rainfall',
            powerOutageLevel: Math.floor(Math.random() * 2) + 5, // 5-6
            powerOutageNotes: 'Frequent power outages during storms and peak demand',
            riskProfileJson: JSON.stringify({
              fire: { level: 3, notes: 'Standard fire risk for urban/rural areas' },
              cyberAttack: { level: 2, notes: 'Low cyber risk for most small businesses' },
              terrorism: { level: 1, notes: 'Very low security threat' },
              pandemicDisease: { level: 4, notes: 'Moderate health emergency risk' },
              economicDownturn: { level: 5, notes: 'Economic vulnerability to tourism and exports' },
              supplyChainDisruption: { level: 5, notes: 'Import dependency creates supply chain risks' },
              civilUnrest: { level: 2, notes: 'Low civil unrest risk' }
            }),
            updatedBy: 'system'
          }
        });

        console.log(`  ✅ Created ${parishData.name}`);
      } else {
        console.log(`  ℹ️  ${parishData.name} already exists`);
      }
    }

    // Step 3: Create Trinidad and Tobago Regions
    console.log('\n📊 Step 3: Creating Trinidad and Tobago regions...');
    
    const trinidadRegions = [
      { name: 'Port of Spain', region: 'Western', population: 37074, type: 'municipality' },
      { name: 'San Fernando', region: 'Southern', population: 48838, type: 'municipality' },
      { name: 'Chaguanas', region: 'Central', population: 83516, type: 'municipality' },
      { name: 'Arima', region: 'Eastern', population: 33606, type: 'municipality' },
      { name: 'Point Fortin', region: 'Southern', population: 20235, type: 'municipality' },
      { name: 'Tobago', region: 'Tobago', population: 60874, type: 'island' }
    ];

    for (const regionData of trinidadRegions) {
      const existing = await prisma.adminUnit.findFirst({
        where: {
          name: regionData.name,
          countryId: trinidad.id
        }
      });

      if (!existing) {
        const adminUnit = await prisma.adminUnit.create({
          data: {
            ...regionData,
            countryId: trinidad.id,
            isActive: true
          }
        });

        // Create risk profile
        await prisma.adminUnitRisk.create({
          data: {
            adminUnitId: adminUnit.id,
            hurricaneLevel: Math.floor(Math.random() * 2) + 3, // 3-4 (lower than Jamaica)
            hurricaneNotes: 'Lower hurricane risk, south of hurricane belt',
            floodLevel: Math.floor(Math.random() * 2) + 5, // 5-6
            floodNotes: 'Significant flood risk during rainy season',
            earthquakeLevel: Math.floor(Math.random() * 2) + 2, // 2-3
            earthquakeNotes: 'Low to moderate earthquake risk',
            droughtLevel: Math.floor(Math.random() * 2) + 3, // 3-4
            droughtNotes: 'Moderate drought risk during dry season',
            landslideLevel: Math.floor(Math.random() * 2) + 3, // 3-4
            landslideNotes: 'Moderate landslide risk in hilly areas',
            powerOutageLevel: Math.floor(Math.random() * 2) + 4, // 4-5
            powerOutageNotes: 'Moderate power outage risk',
            riskProfileJson: JSON.stringify({
              fire: { level: 3, notes: 'Standard fire risk' },
              cyberAttack: { level: 3, notes: 'Moderate cyber risk' },
              terrorism: { level: 2, notes: 'Low security threat' },
              pandemicDisease: { level: 4, notes: 'Moderate health risk' },
              economicDownturn: { level: 5, notes: 'Economic risk from energy sector dependency' },
              supplyChainDisruption: { level: 4, notes: 'Moderate supply chain risk' },
              civilUnrest: { level: 2, notes: 'Low civil unrest risk' }
            }),
            updatedBy: 'system'
          }
        });

        console.log(`  ✅ Created ${regionData.name}`);
      } else {
        console.log(`  ℹ️  ${regionData.name} already exists`);
      }
    }

    // Step 4: Create Barbados Parishes
    console.log('\n📊 Step 4: Creating Barbados parishes...');
    
    const barbadosParishes = [
      { name: 'Christ Church', region: 'Southern', population: 54336, type: 'parish' },
      { name: 'St. Michael', region: 'Central', population: 104986, type: 'parish' },
      { name: 'St. George', region: 'Central', population: 19568, type: 'parish' },
      { name: 'St. Philip', region: 'Eastern', population: 25411, type: 'parish' },
      { name: 'St. John', region: 'Eastern', population: 9489, type: 'parish' },
      { name: 'St. Joseph', region: 'Eastern', population: 7074, type: 'parish' },
      { name: 'St. James', region: 'Western', population: 23982, type: 'parish' },
      { name: 'St. Thomas', region: 'Central', population: 12614, type: 'parish' },
      { name: 'St. Peter', region: 'Northern', population: 11809, type: 'parish' },
      { name: 'St. Lucy', region: 'Northern', population: 10583, type: 'parish' },
      { name: 'St. Andrew', region: 'Eastern', population: 6474, type: 'parish' }
    ];

    for (const parishData of barbadosParishes) {
      const existing = await prisma.adminUnit.findFirst({
        where: {
          name: parishData.name,
          countryId: barbados.id
        }
      });

      if (!existing) {
        const adminUnit = await prisma.adminUnit.create({
          data: {
            ...parishData,
            countryId: barbados.id,
            isActive: true
          }
        });

        // Create risk profile
        await prisma.adminUnitRisk.create({
          data: {
            adminUnitId: adminUnit.id,
            hurricaneLevel: Math.floor(Math.random() * 2) + 5, // 5-6
            hurricaneNotes: 'Moderate hurricane risk, particularly August-October',
            floodLevel: Math.floor(Math.random() * 2) + 3, // 3-4
            floodNotes: 'Low to moderate flood risk',
            earthquakeLevel: Math.floor(Math.random() * 2) + 2, // 2-3
            earthquakeNotes: 'Low earthquake risk',
            droughtLevel: Math.floor(Math.random() * 2) + 4, // 4-5
            droughtNotes: 'Moderate drought risk, water scarcity concerns',
            landslideLevel: Math.floor(Math.random() * 2) + 2, // 2-3
            landslideNotes: 'Low landslide risk, relatively flat terrain',
            powerOutageLevel: Math.floor(Math.random() * 2) + 3, // 3-4
            powerOutageNotes: 'Low to moderate power outage risk',
            riskProfileJson: JSON.stringify({
              fire: { level: 3, notes: 'Standard fire risk' },
              cyberAttack: { level: 2, notes: 'Low cyber risk' },
              terrorism: { level: 1, notes: 'Very low security threat' },
              pandemicDisease: { level: 4, notes: 'Moderate health risk' },
              economicDownturn: { level: 6, notes: 'High economic risk from tourism dependency' },
              supplyChainDisruption: { level: 5, notes: 'Significant import dependency' },
              civilUnrest: { level: 1, notes: 'Very low civil unrest risk' }
            }),
            updatedBy: 'system'
          }
        });

        console.log(`  ✅ Created ${parishData.name}`);
      } else {
        console.log(`  ℹ️  ${parishData.name} already exists`);
      }
    }

    // Step 5: Verify results
    console.log('\n🔍 Step 5: Verifying data...');
    
    const countryCount = await prisma.country.count({ where: { isActive: true } });
    const unitCount = await prisma.adminUnit.count({ where: { isActive: true } });
    const riskCount = await prisma.adminUnitRisk.count();

    console.log(`\n📈 Summary:`);
    console.log(`  ✅ ${countryCount} countries created`);
    console.log(`  ✅ ${unitCount} administrative units created`);
    console.log(`  ✅ ${riskCount} risk profiles created`);

    console.log('\n✨ Population completed successfully!');

  } catch (error) {
    console.error('\n❌ Population failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run population
populateCountriesAndUnits()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });




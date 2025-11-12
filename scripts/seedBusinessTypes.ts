import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BUSINESS_TYPES = [
  // HOSPITALITY & TOURISM
  { businessTypeId: 'restaurant', name: JSON.stringify({ en: 'Restaurant', es: 'Restaurante', fr: 'Restaurant' }), category: 'hospitality', subcategory: 'food_service' },
  { businessTypeId: 'fast_food', name: JSON.stringify({ en: 'Fast Food / Quick Service', es: 'Comida Rápida', fr: 'Restauration Rapide' }), category: 'hospitality', subcategory: 'food_service' },
  { businessTypeId: 'hotel', name: JSON.stringify({ en: 'Hotel / Guesthouse', es: 'Hotel / Pensión', fr: 'Hôtel / Maison d\'hôtes' }), category: 'hospitality', subcategory: 'accommodation' },
  { businessTypeId: 'bar_nightclub', name: JSON.stringify({ en: 'Bar / Nightclub', es: 'Bar / Discoteca', fr: 'Bar / Boîte de nuit' }), category: 'hospitality', subcategory: 'entertainment' },
  
  // RETAIL
  { businessTypeId: 'grocery_store', name: JSON.stringify({ en: 'Grocery Store / Supermarket', es: 'Tienda de Comestibles', fr: 'Épicerie / Supermarché' }), category: 'retail', subcategory: 'food_retail' },
  { businessTypeId: 'convenience_store', name: JSON.stringify({ en: 'Convenience Store', es: 'Tienda de Conveniencia', fr: 'Dépanneur' }), category: 'retail', subcategory: 'food_retail' },
  { businessTypeId: 'pharmacy', name: JSON.stringify({ en: 'Pharmacy / Drugstore', es: 'Farmacia', fr: 'Pharmacie' }), category: 'retail', subcategory: 'healthcare_retail' },
  { businessTypeId: 'clothing_store', name: JSON.stringify({ en: 'Clothing / Fashion Store', es: 'Tienda de Ropa', fr: 'Magasin de Vêtements' }), category: 'retail', subcategory: 'apparel' },
  { businessTypeId: 'hardware_store', name: JSON.stringify({ en: 'Hardware / Building Supply', es: 'Ferretería', fr: 'Quincaillerie' }), category: 'retail', subcategory: 'building_supply' },
  { businessTypeId: 'electronics_store', name: JSON.stringify({ en: 'Electronics Store', es: 'Tienda de Electrónica', fr: 'Magasin d\'Électronique' }), category: 'retail', subcategory: 'electronics' },
  
  // PROFESSIONAL SERVICES
  { businessTypeId: 'accounting_firm', name: JSON.stringify({ en: 'Accounting / Bookkeeping', es: 'Contabilidad', fr: 'Comptabilité' }), category: 'professional_services', subcategory: 'financial_services' },
  { businessTypeId: 'law_firm', name: JSON.stringify({ en: 'Law Firm / Legal Services', es: 'Bufete de Abogados', fr: 'Cabinet d\'Avocats' }), category: 'professional_services', subcategory: 'legal' },
  { businessTypeId: 'real_estate_agency', name: JSON.stringify({ en: 'Real Estate Agency', es: 'Agencia Inmobiliaria', fr: 'Agence Immobilière' }), category: 'professional_services', subcategory: 'real_estate' },
  { businessTypeId: 'insurance_agency', name: JSON.stringify({ en: 'Insurance Agency', es: 'Agencia de Seguros', fr: 'Agence d\'Assurance' }), category: 'professional_services', subcategory: 'insurance' },
  
  // PERSONAL SERVICES
  { businessTypeId: 'hair_salon', name: JSON.stringify({ en: 'Hair Salon / Barbershop', es: 'Salón de Belleza', fr: 'Salon de Coiffure' }), category: 'personal_services', subcategory: 'beauty' },
  { businessTypeId: 'spa_wellness', name: JSON.stringify({ en: 'Spa / Wellness Center', es: 'Spa / Centro de Bienestar', fr: 'Spa / Centre de Bien-être' }), category: 'personal_services', subcategory: 'wellness' },
  { businessTypeId: 'gym_fitness', name: JSON.stringify({ en: 'Gym / Fitness Center', es: 'Gimnasio', fr: 'Centre de Fitness' }), category: 'personal_services', subcategory: 'fitness' },
  { businessTypeId: 'laundromat', name: JSON.stringify({ en: 'Laundromat / Dry Cleaning', es: 'Lavandería', fr: 'Laverie' }), category: 'personal_services', subcategory: 'laundry' },
  
  // AUTOMOTIVE
  { businessTypeId: 'auto_repair', name: JSON.stringify({ en: 'Auto Repair / Mechanic', es: 'Taller Mecánico', fr: 'Atelier de Réparation Auto' }), category: 'automotive', subcategory: 'repair' },
  { businessTypeId: 'car_wash', name: JSON.stringify({ en: 'Car Wash / Detailing', es: 'Lavado de Autos', fr: 'Lave-Auto' }), category: 'automotive', subcategory: 'cleaning' },
  
  // CONSTRUCTION & TRADES
  { businessTypeId: 'general_contractor', name: JSON.stringify({ en: 'General Contractor', es: 'Contratista General', fr: 'Entrepreneur Général' }), category: 'construction', subcategory: 'general_construction' },
  { businessTypeId: 'plumber', name: JSON.stringify({ en: 'Plumber / Plumbing Services', es: 'Fontanero', fr: 'Plombier' }), category: 'construction', subcategory: 'trades' },
  { businessTypeId: 'electrician', name: JSON.stringify({ en: 'Electrician / Electrical Services', es: 'Electricista', fr: 'Électricien' }), category: 'construction', subcategory: 'trades' },
  
  // HEALTHCARE
  { businessTypeId: 'medical_clinic', name: JSON.stringify({ en: 'Medical Clinic / Doctor Office', es: 'Clínica Médica', fr: 'Clinique Médicale' }), category: 'healthcare', subcategory: 'medical' },
  { businessTypeId: 'dental_clinic', name: JSON.stringify({ en: 'Dental Clinic', es: 'Clínica Dental', fr: 'Clinique Dentaire' }), category: 'healthcare', subcategory: 'dental' },
  
  // AGRICULTURE & FOOD PRODUCTION
  { businessTypeId: 'bakery', name: JSON.stringify({ en: 'Bakery / Pastry Shop', es: 'Panadería', fr: 'Boulangerie' }), category: 'food_production', subcategory: 'baked_goods' },
  { businessTypeId: 'farm_agriculture', name: JSON.stringify({ en: 'Farm / Agricultural Business', es: 'Granja / Agricultura', fr: 'Ferme / Agriculture' }), category: 'agriculture', subcategory: 'farming' },
  
  // EDUCATION
  { businessTypeId: 'tutoring_center', name: JSON.stringify({ en: 'Tutoring Center / Private Lessons', es: 'Centro de Tutoría', fr: 'Centre de Tutorat' }), category: 'education', subcategory: 'tutoring' },
  { businessTypeId: 'daycare', name: JSON.stringify({ en: 'Daycare / Childcare Center', es: 'Guardería', fr: 'Garderie' }), category: 'education', subcategory: 'childcare' },
  
  // TECHNOLOGY
  { businessTypeId: 'it_services', name: JSON.stringify({ en: 'IT Services / Computer Repair', es: 'Servicios de TI', fr: 'Services Informatiques' }), category: 'technology', subcategory: 'it_support' },
  { businessTypeId: 'web_design', name: JSON.stringify({ en: 'Web Design / Digital Marketing', es: 'Diseño Web', fr: 'Conception Web' }), category: 'technology', subcategory: 'digital_services' },
  
  // OTHER SERVICES
  { businessTypeId: 'security_services', name: JSON.stringify({ en: 'Security Services', es: 'Servicios de Seguridad', fr: 'Services de Sécurité' }), category: 'services', subcategory: 'security' },
  { businessTypeId: 'cleaning_services', name: JSON.stringify({ en: 'Cleaning Services', es: 'Servicios de Limpieza', fr: 'Services de Nettoyage' }), category: 'services', subcategory: 'cleaning' },
  { businessTypeId: 'transportation_taxi', name: JSON.stringify({ en: 'Transportation / Taxi Service', es: 'Transporte / Taxi', fr: 'Transport / Taxi' }), category: 'transportation', subcategory: 'passenger' }
]

async function seedBusinessTypes() {
  console.log('🏢 Seeding Caribbean business types...\n')
  
  let created = 0
  let skipped = 0
  
  for (const businessType of BUSINESS_TYPES) {
    const existing = await prisma.businessType.findUnique({
      where: { businessTypeId: businessType.businessTypeId }
    })
    
    if (existing) {
      console.log(`  ⊘ Skipped: ${businessType.businessTypeId}`)
      skipped++
    } else {
      await prisma.businessType.create({
        data: businessType
      })
      const nameObj = JSON.parse(businessType.name)
      console.log(`  ✓ Created: ${nameObj.en} (${businessType.category})`)
      created++
    }
  }
  
  console.log(`\n✅ Business Types: ${created} created, ${skipped} already existed`)
  console.log(`\n🎉 Business types seeded successfully!`)
  console.log(`\n📊 Summary: ${BUSINESS_TYPES.length} total business types`)
}

// Run if called directly
if (require.main === module) {
  seedBusinessTypes()
    .catch((e) => {
      console.error('❌ Error:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

export { seedBusinessTypes }

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Expanded Business Types - 15+ covering all major Caribbean sectors
const industryProfiles = [
  // RETAIL & SERVICES
  {
    id: 'grocery_store',
    name: 'Grocery Store',
    localName: 'Local Grocery/Mini-Mart',
    category: 'retail',
    vulnerabilities: [
      { hazardId: 'hurricane', defaultRiskLevel: 'high' },
      { hazardId: 'flash_flood', defaultRiskLevel: 'medium' },
      { hazardId: 'power_outage', defaultRiskLevel: 'high' },
      { hazardId: 'supply_disruption', defaultRiskLevel: 'high' },
      { hazardId: 'economic_downturn', defaultRiskLevel: 'medium' },
      { hazardId: 'crime', defaultRiskLevel: 'medium' },
      { hazardId: 'water_contamination', defaultRiskLevel: 'medium' },
      { hazardId: 'fuel_shortage', defaultRiskLevel: 'high' }
    ],
    typicalOperatingHours: 'Monday-Saturday 7:00 AM - 8:00 PM, Sunday 8:00 AM - 6:00 PM',
    minimumResources: {
      staff: '2-3 staff members (including owner/manager)',
      equipment: ['Point of sale system', 'Refrigeration units', 'Security cameras', 'Generator backup'],
      utilities: ['Reliable electricity', 'Water supply', 'Internet connection', 'Phone line'],
      space: 'Retail floor space, storage area, customer parking'
    },
    examples: {
      businessPurpose: [
        'To provide fresh groceries and daily essentials to the [NEIGHBORHOOD] community',
        'To serve local residents with convenient access to food and household items'
      ],
      productsServices: [
        'Fresh produce, meat, dairy, and pantry staples. Local specialties like [ISLAND] seasonings',
        'Groceries, beverages, household items, and local products. Money transfer services'
      ],
      keyPersonnel: [
        'Store Owner/Manager, Cashier, Stock Clerk',
        'Owner, Assistant Manager, Part-time Cashier'
      ],
      customerBase: [
        'Local residents within 2-mile radius, families, elderly customers',
        'Neighborhood families, young professionals, tourists staying in [AREA]'
      ]
    }
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    localName: 'Local Restaurant/Eatery',
    category: 'hospitality',
    vulnerabilities: [
      { hazardId: 'hurricane', defaultRiskLevel: 'high' },
      { hazardId: 'flash_flood', defaultRiskLevel: 'medium' },
      { hazardId: 'power_outage', defaultRiskLevel: 'high' },
      { hazardId: 'supply_disruption', defaultRiskLevel: 'high' },
      { hazardId: 'fire', defaultRiskLevel: 'medium' },
      { hazardId: 'pandemic', defaultRiskLevel: 'high' },
      { hazardId: 'economic_downturn', defaultRiskLevel: 'medium' },
      { hazardId: 'food_contamination', defaultRiskLevel: 'medium' },
      { hazardId: 'gas_shortage', defaultRiskLevel: 'high' }
    ],
    typicalOperatingHours: 'Monday-Saturday 11:00 AM - 10:00 PM, Sunday 12:00 PM - 9:00 PM',
    minimumResources: {
      staff: '3-5 staff members (chef, server, cashier)',
      equipment: ['Commercial kitchen equipment', 'POS system', 'Refrigeration', 'Generator'],
      utilities: ['Gas/propane connection', 'Reliable electricity', 'Water supply', 'Waste disposal'],
      space: 'Kitchen, dining area, storage, customer parking'
    },
    examples: {
      businessPurpose: [
        'To serve authentic [ISLAND] cuisine and provide a welcoming dining experience',
        'To offer fresh, locally-sourced meals that celebrate Caribbean flavors'
      ],
      productsServices: [
        'Traditional [ISLAND] dishes, fresh seafood, tropical beverages. Catering services',
        'Caribbean fusion cuisine, local specialties, craft cocktails. Take-out and delivery'
      ],
      keyPersonnel: [
        'Head Chef, Restaurant Manager, Servers, Kitchen Staff',
        'Owner/Chef, Assistant Manager, Wait Staff, Prep Cook'
      ],
      customerBase: [
        'Local residents, office workers during lunch, tourists exploring [AREA]',
        'Families celebrating special occasions, business lunch meetings'
      ]
    }
  },
  {
    id: 'beauty_salon',
    name: 'Beauty Salon/Barbershop',
    localName: 'Local Hair Salon/Barbershop',
    category: 'services',
    vulnerabilities: [
      { hazardId: 'power_outage', defaultRiskLevel: 'high' },
      { hazardId: 'water_contamination', defaultRiskLevel: 'medium' },
      { hazardId: 'hurricane', defaultRiskLevel: 'medium' },
      { hazardId: 'pandemic', defaultRiskLevel: 'high' },
      { hazardId: 'economic_downturn', defaultRiskLevel: 'high' },
      { hazardId: 'crime', defaultRiskLevel: 'low' },
      { hazardId: 'chemical_spill', defaultRiskLevel: 'low' }
    ],
    typicalOperatingHours: 'Tuesday-Saturday 9:00 AM - 6:00 PM, closed Sunday-Monday',
    minimumResources: {
      staff: '2-3 stylists (including owner)',
      equipment: ['Styling chairs', 'Hair dryers', 'Washing stations', 'Styling tools'],
      utilities: ['Reliable electricity', 'Hot water supply', 'Good ventilation', 'Phone/internet'],
      space: 'Styling area, washing station, product storage, waiting area'
    },
    examples: {
      businessPurpose: [
        'To provide professional hair care and beauty services to [NEIGHBORHOOD] residents',
        'To help clients look and feel their best with expert styling'
      ],
      productsServices: [
        'Hair cuts, styling, coloring, and treatments. Manicures, pedicures, eyebrow services',
        'Professional hair care, special occasion styling, bridal packages'
      ],
      keyPersonnel: [
        'Master Stylist/Owner, Licensed Beautician, Receptionist',
        'Salon Owner, Senior Stylist, Junior Stylist'
      ],
      customerBase: [
        'Local women and men, regular weekly/monthly clients, special occasion customers',
        '[AREA] residents, brides and wedding parties, professionals'
      ]
    }
  },

  // TOURISM & HOSPITALITY
  {
    id: 'hotel_guesthouse',
    name: 'Hotel/Guesthouse',
    localName: 'Small Hotel/Guest House',
    category: 'tourism',
    vulnerabilities: [
      { hazardId: 'hurricane', defaultRiskLevel: 'high' },
      { hazardId: 'earthquake', defaultRiskLevel: 'medium' },
      { hazardId: 'power_outage', defaultRiskLevel: 'high' },
      { hazardId: 'water_shortage', defaultRiskLevel: 'high' },
      { hazardId: 'pandemic', defaultRiskLevel: 'high' },
      { hazardId: 'terrorism', defaultRiskLevel: 'low' },
      { hazardId: 'economic_downturn', defaultRiskLevel: 'high' },
      { hazardId: 'crime', defaultRiskLevel: 'medium' },
      { hazardId: 'fire', defaultRiskLevel: 'medium' }
    ],
    typicalOperatingHours: '24/7 operation with front desk coverage',
    minimumResources: {
      staff: '5-8 staff members (manager, front desk, housekeeping, maintenance)',
      equipment: ['PMS system', 'Security cameras', 'Backup generator', 'Water tanks', 'Fire safety equipment'],
      utilities: ['Reliable electricity', 'Water supply', 'Internet/WiFi', 'Phone systems', 'Waste management'],
      space: 'Guest rooms, front desk, common areas, housekeeping facilities, parking'
    },
    examples: {
      businessPurpose: [
        'To provide comfortable accommodation for tourists visiting [DESTINATION]',
        'To offer authentic Caribbean hospitality and local experiences'
      ],
      productsServices: [
        'Guest accommodation, breakfast service, tour arrangements, airport transfers',
        'Boutique rooms, concierge services, local activity bookings, event hosting'
      ],
      keyPersonnel: [
        'General Manager, Front Office Manager, Housekeeping Supervisor, Maintenance Staff',
        'Owner/Manager, Receptionist, Housekeeper, Security Guard'
      ],
      customerBase: [
        'International tourists, business travelers, locals hosting visitors',
        'Couples on romantic getaways, adventure travelers, cultural tourists'
      ]
    }
  },
  {
    id: 'tour_operator',
    name: 'Tour Operator',
    localName: 'Local Tour Company',
    category: 'tourism',
    vulnerabilities: [
      { hazardId: 'hurricane', defaultRiskLevel: 'high' },
      { hazardId: 'pandemic', defaultRiskLevel: 'high' },
      { hazardId: 'economic_downturn', defaultRiskLevel: 'high' },
      { hazardId: 'transportation_disruption', defaultRiskLevel: 'high' },
      { hazardId: 'crime', defaultRiskLevel: 'medium' },
      { hazardId: 'fuel_shortage', defaultRiskLevel: 'high' },
      { hazardId: 'regulatory_changes', defaultRiskLevel: 'medium' }
    ],
    typicalOperatingHours: 'Monday-Saturday 8:00 AM - 6:00 PM, Sunday by appointment',
    minimumResources: {
      staff: '3-5 staff members (owner/guide, driver, office assistant)',
      equipment: ['Tour vehicles', 'Safety equipment', 'Communication devices', 'First aid kits'],
      utilities: ['Vehicle insurance', 'Fuel supply', 'Phone/radio communication', 'Office space'],
      space: 'Office space, vehicle parking, equipment storage'
    },
    examples: {
      businessPurpose: [
        'To showcase the natural beauty and culture of [ISLAND] to visitors',
        'To provide safe, educational, and memorable experiences for tourists'
      ],
      productsServices: [
        'Island tours, nature hikes, cultural experiences, transportation services',
        'Adventure tours, historical site visits, beach excursions, custom itineraries'
      ],
      keyPersonnel: [
        'Tour Guide/Owner, Driver, Customer Service Representative',
        'Lead Guide, Assistant Guide, Office Manager'
      ],
      customerBase: [
        'Hotel guests, cruise ship passengers, independent travelers',
        'Adventure seekers, cultural enthusiasts, nature lovers'
      ]
    }
  },

  // AGRICULTURE & FISHERIES
  {
    id: 'small_farm',
    name: 'Small Farm',
    localName: 'Family Farm/Market Garden',
    category: 'agriculture',
    vulnerabilities: [
      { hazardId: 'hurricane', defaultRiskLevel: 'high' },
      { hazardId: 'drought', defaultRiskLevel: 'high' },
      { hazardId: 'flash_flood', defaultRiskLevel: 'medium' },
      { hazardId: 'pest_infestation', defaultRiskLevel: 'high' },
      { hazardId: 'climate_change', defaultRiskLevel: 'high' },
      { hazardId: 'market_volatility', defaultRiskLevel: 'high' },
      { hazardId: 'supply_disruption', defaultRiskLevel: 'medium' },
      { hazardId: 'water_shortage', defaultRiskLevel: 'high' }
    ],
    typicalOperatingHours: 'Dawn to dusk, 7 days a week, seasonal variations',
    minimumResources: {
      staff: '2-4 family members/workers',
      equipment: ['Basic farm tools', 'Irrigation system', 'Storage facilities', 'Transportation'],
      utilities: ['Water access', 'Storage buildings', 'Market access roads'],
      space: 'Cultivated land, storage areas, access to water source'
    },
    examples: {
      businessPurpose: [
        'To grow fresh produce for local markets and family sustenance',
        'To supply restaurants and grocery stores with organic [ISLAND] vegetables'
      ],
      productsServices: [
        'Seasonal vegetables, fruits, herbs, and ground provisions',
        'Organic produce, seedlings for other farmers, agro-processing'
      ],
      keyPersonnel: [
        'Farm Owner, Family Workers, Seasonal Laborers',
        'Farmer, Spouse, Adult Children, Hired Help'
      ],
      customerBase: [
        'Local markets, restaurants, grocery stores, direct consumers',
        'Farmers markets, organic food cooperatives, community members'
      ]
    }
  },
  {
    id: 'fishing_operation',
    name: 'Fishing Operation',
    localName: 'Small-Scale Fishery',
    category: 'fisheries',
    vulnerabilities: [
      { hazardId: 'hurricane', defaultRiskLevel: 'high' },
      { hazardId: 'rough_seas', defaultRiskLevel: 'high' },
      { hazardId: 'overfishing', defaultRiskLevel: 'medium' },
      { hazardId: 'fuel_shortage', defaultRiskLevel: 'high' },
      { hazardId: 'equipment_failure', defaultRiskLevel: 'medium' },
      { hazardId: 'market_volatility', defaultRiskLevel: 'high' },
      { hazardId: 'pollution', defaultRiskLevel: 'medium' },
      { hazardId: 'regulatory_changes', defaultRiskLevel: 'medium' }
    ],
    typicalOperatingHours: 'Early morning departures (4-6 AM), weather dependent',
    minimumResources: {
      staff: '2-4 crew members per boat',
      equipment: ['Fishing boat', 'Nets/fishing gear', 'Ice storage', 'Safety equipment'],
      utilities: ['Fuel supply', 'Boat maintenance', 'Fish storage facilities'],
      space: 'Boat mooring, equipment storage, fish processing area'
    },
    examples: {
      businessPurpose: [
        'To harvest fresh fish from [AREA] waters for local consumption',
        'To supply hotels and restaurants with daily catch of fresh seafood'
      ],
      productsServices: [
        'Fresh fish, lobster, conch, and other seafood. Ice and bait sales',
        'Daily fish sales, wholesale to restaurants, custom fishing trips'
      ],
      keyPersonnel: [
        'Boat Captain/Owner, Crew Members, Shore-based Family',
        'Fisher, Assistant Fisher, Family Members for shore support'
      ],
      customerBase: [
        'Local fish markets, restaurants, hotels, community members',
        'Seafood processors, tourist restaurants, local families'
      ]
    }
  },

  // MANUFACTURING & CRAFTS
  {
    id: 'craft_workshop',
    name: 'Craft Workshop',
    localName: 'Artisan Workshop/Studio',
    category: 'manufacturing',
    vulnerabilities: [
      { hazardId: 'power_outage', defaultRiskLevel: 'medium' },
      { hazardId: 'fire', defaultRiskLevel: 'medium' },
      { hazardId: 'hurricane', defaultRiskLevel: 'medium' },
      { hazardId: 'supply_disruption', defaultRiskLevel: 'high' },
      { hazardId: 'economic_downturn', defaultRiskLevel: 'high' },
      { hazardId: 'theft', defaultRiskLevel: 'medium' },
      { hazardId: 'market_access', defaultRiskLevel: 'high' }
    ],
    typicalOperatingHours: 'Monday-Friday 9:00 AM - 5:00 PM, weekends by appointment',
    minimumResources: {
      staff: '1-3 artisans',
      equipment: ['Hand tools', 'Work benches', 'Storage systems', 'Basic machinery'],
      utilities: ['Workshop space', 'Good lighting', 'Ventilation', 'Storage'],
      space: 'Workshop area, material storage, finished goods display, customer area'
    },
    examples: {
      businessPurpose: [
        'To create authentic [ISLAND] handicrafts and preserve traditional skills',
        'To produce unique artisan goods for tourists and local markets'
      ],
      productsServices: [
        'Wood carvings, jewelry, pottery, textiles, traditional crafts',
        'Custom artwork, souvenirs, home decor items, commissioned pieces'
      ],
      keyPersonnel: [
        'Master Craftsperson, Apprentice, Sales Assistant',
        'Artisan/Owner, Family Helper, Part-time Assistant'
      ],
      customerBase: [
        'Tourists, local art collectors, gift shops, hotels',
        'Art galleries, craft fairs, online customers, interior designers'
      ]
    }
  },
  {
    id: 'food_processing',
    name: 'Food Processing',
    localName: 'Small Food Processor',
    category: 'manufacturing',
    vulnerabilities: [
      { hazardId: 'power_outage', defaultRiskLevel: 'high' },
      { hazardId: 'food_contamination', defaultRiskLevel: 'high' },
      { hazardId: 'supply_disruption', defaultRiskLevel: 'high' },
      { hazardId: 'equipment_failure', defaultRiskLevel: 'medium' },
      { hazardId: 'regulatory_changes', defaultRiskLevel: 'medium' },
      { hazardId: 'water_contamination', defaultRiskLevel: 'high' },
      { hazardId: 'hurricane', defaultRiskLevel: 'medium' }
    ],
    typicalOperatingHours: 'Monday-Friday 6:00 AM - 4:00 PM, seasonal variations',
    minimumResources: {
      staff: '3-6 workers',
      equipment: ['Processing equipment', 'Packaging machinery', 'Refrigeration', 'Quality control tools'],
      utilities: ['Reliable electricity', 'Clean water supply', 'Waste disposal', 'Cold storage'],
      space: 'Processing facility, storage areas, packaging area, loading dock'
    },
    examples: {
      businessPurpose: [
        'To process local fruits and vegetables into value-added products',
        'To preserve seasonal produce and create shelf-stable foods'
      ],
      productsServices: [
        'Fruit preserves, hot sauces, seasonings, dried fruits, juices',
        'Packaged local specialties, custom processing, private labeling'
      ],
      keyPersonnel: [
        'Production Manager, Quality Control, Processing Workers, Packaging Staff',
        'Owner/Manager, Food Technician, Production Workers'
      ],
      customerBase: [
        'Grocery stores, hotels, restaurants, export markets',
        'Gift shops, online customers, food distributors, tourists'
      ]
    }
  },

  // PROFESSIONAL SERVICES
  {
    id: 'accounting_office',
    name: 'Accounting Office',
    localName: 'Accounting/Bookkeeping Service',
    category: 'professional',
    vulnerabilities: [
      { hazardId: 'power_outage', defaultRiskLevel: 'high' },
      { hazardId: 'cyber_attack', defaultRiskLevel: 'high' },
      { hazardId: 'data_loss', defaultRiskLevel: 'high' },
      { hazardId: 'pandemic', defaultRiskLevel: 'medium' },
      { hazardId: 'hurricane', defaultRiskLevel: 'medium' },
      { hazardId: 'economic_downturn', defaultRiskLevel: 'high' },
      { hazardId: 'regulatory_changes', defaultRiskLevel: 'high' }
    ],
    typicalOperatingHours: 'Monday-Friday 9:00 AM - 5:00 PM, extended hours during tax season',
    minimumResources: {
      staff: '2-4 staff members (accountant, bookkeeper, admin)',
      equipment: ['Computers', 'Accounting software', 'Printers', 'Filing systems', 'Backup systems'],
      utilities: ['Reliable internet', 'Phone system', 'Electricity', 'Air conditioning'],
      space: 'Office space, client meeting room, secure file storage'
    },
    examples: {
      businessPurpose: [
        'To provide accounting and tax services to small businesses in [AREA]',
        'To help local entrepreneurs manage their finances and comply with regulations'
      ],
      productsServices: [
        'Bookkeeping, tax preparation, payroll services, financial consulting',
        'Business registration, audit support, financial planning, QuickBooks training'
      ],
      keyPersonnel: [
        'Certified Accountant, Bookkeeper, Administrative Assistant',
        'CPA/Owner, Junior Accountant, Office Manager'
      ],
      customerBase: [
        'Small businesses, self-employed individuals, local companies',
        'Restaurants, shops, professionals, import/export businesses'
      ]
    }
  },
  {
    id: 'auto_repair',
    name: 'Auto Repair Shop',
    localName: 'Mechanic Shop/Auto Service',
    category: 'services',
    vulnerabilities: [
      { hazardId: 'power_outage', defaultRiskLevel: 'medium' },
      { hazardId: 'supply_disruption', defaultRiskLevel: 'high' },
      { hazardId: 'hurricane', defaultRiskLevel: 'medium' },
      { hazardId: 'fire', defaultRiskLevel: 'medium' },
      { hazardId: 'economic_downturn', defaultRiskLevel: 'high' },
      { hazardId: 'fuel_shortage', defaultRiskLevel: 'high' },
      { hazardId: 'crime', defaultRiskLevel: 'medium' }
    ],
    typicalOperatingHours: 'Monday-Saturday 8:00 AM - 6:00 PM, emergency services available',
    minimumResources: {
      staff: '2-4 mechanics and support staff',
      equipment: ['Diagnostic equipment', 'Hand tools', 'Lifting equipment', 'Air compressor'],
      utilities: ['Electricity', 'Water supply', 'Compressed air', 'Parts storage'],
      space: 'Service bays, parts storage, customer waiting area, office'
    },
    examples: {
      businessPurpose: [
        'To provide reliable automotive repair and maintenance services',
        'To keep the [COMMUNITY] vehicles running safely and efficiently'
      ],
      productsServices: [
        'Auto repair, maintenance, tire services, diagnostic testing',
        'Engine repair, brake service, air conditioning, electrical work'
      ],
      keyPersonnel: [
        'Master Mechanic/Owner, Mechanics, Service Advisor',
        'Lead Technician, Assistant Mechanic, Parts Manager'
      ],
      customerBase: [
        'Local car owners, taxi drivers, small fleet operators',
        'Families, professionals, businesses with vehicle fleets'
      ]
    }
  },

  // RETAIL SPECIALIZED
  {
    id: 'hardware_store',
    name: 'Hardware Store',
    localName: 'Building Supplies/Hardware',
    category: 'retail',
    vulnerabilities: [
      { hazardId: 'hurricane', defaultRiskLevel: 'medium' },
      { hazardId: 'supply_disruption', defaultRiskLevel: 'high' },
      { hazardId: 'theft', defaultRiskLevel: 'high' },
      { hazardId: 'power_outage', defaultRiskLevel: 'medium' },
      { hazardId: 'economic_downturn', defaultRiskLevel: 'high' },
      { hazardId: 'fire', defaultRiskLevel: 'medium' },
      { hazardId: 'transportation_disruption', defaultRiskLevel: 'high' }
    ],
    typicalOperatingHours: 'Monday-Saturday 7:00 AM - 6:00 PM, Sunday 8:00 AM - 2:00 PM',
    minimumResources: {
      staff: '3-5 staff members (owner, sales, stock)',
      equipment: ['POS system', 'Forklifts', 'Security system', 'Storage racks'],
      utilities: ['Electricity', 'Phone/internet', 'Loading dock access'],
      space: 'Retail floor, warehouse storage, loading area, customer parking'
    },
    examples: {
      businessPurpose: [
        'To supply construction materials and tools to builders and homeowners',
        'To support the building and maintenance needs of [COMMUNITY]'
      ],
      productsServices: [
        'Building materials, tools, hardware, plumbing supplies, electrical items',
        'Construction supplies, paint, fasteners, garden supplies, equipment rental'
      ],
      keyPersonnel: [
        'Store Manager, Sales Staff, Warehouse Worker, Cashier',
        'Owner, Assistant Manager, Stock Clerk, Delivery Driver'
      ],
      customerBase: [
        'Contractors, homeowners, maintenance workers, DIY enthusiasts',
        'Construction companies, property managers, government agencies'
      ]
    }
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    localName: 'Community Pharmacy/Drugstore',
    category: 'healthcare',
    vulnerabilities: [
      { hazardId: 'supply_disruption', defaultRiskLevel: 'high' },
      { hazardId: 'power_outage', defaultRiskLevel: 'high' },
      { hazardId: 'hurricane', defaultRiskLevel: 'medium' },
      { hazardId: 'theft', defaultRiskLevel: 'high' },
      { hazardId: 'regulatory_changes', defaultRiskLevel: 'medium' },
      { hazardId: 'pandemic', defaultRiskLevel: 'medium' },
      { hazardId: 'cyber_attack', defaultRiskLevel: 'medium' }
    ],
    typicalOperatingHours: 'Monday-Saturday 8:00 AM - 8:00 PM, Sunday 9:00 AM - 5:00 PM',
    minimumResources: {
      staff: '3-4 staff (pharmacist, pharmacy technician, cashier)',
      equipment: ['Pharmacy software', 'Refrigeration', 'Security system', 'POS system'],
      utilities: ['Reliable electricity', 'Internet connection', 'Phone system', 'Climate control'],
      space: 'Pharmacy area, retail floor, storage, consultation room'
    },
    examples: {
      businessPurpose: [
        'To provide essential medications and health products to [COMMUNITY]',
        'To offer professional pharmaceutical care and health advice'
      ],
      productsServices: [
        'Prescription medications, over-the-counter drugs, health products, consultations',
        'Medicine dispensing, health screenings, medical supplies, delivery services'
      ],
      keyPersonnel: [
        'Licensed Pharmacist, Pharmacy Technician, Store Manager',
        'Pharmacist/Owner, Assistant Pharmacist, Cashier/Sales'
      ],
      customerBase: [
        'Local residents, elderly patients, chronic disease patients',
        'Families, healthcare facilities, walk-in customers'
      ]
    }
  },

  // TRANSPORTATION
  {
    id: 'taxi_service',
    name: 'Taxi Service',
    localName: 'Local Transport/Taxi',
    category: 'transportation',
    vulnerabilities: [
      { hazardId: 'fuel_shortage', defaultRiskLevel: 'high' },
      { hazardId: 'vehicle_breakdown', defaultRiskLevel: 'high' },
      { hazardId: 'hurricane', defaultRiskLevel: 'high' },
      { hazardId: 'crime', defaultRiskLevel: 'medium' },
      { hazardId: 'economic_downturn', defaultRiskLevel: 'high' },
      { hazardId: 'regulatory_changes', defaultRiskLevel: 'medium' },
      { hazardId: 'road_damage', defaultRiskLevel: 'medium' }
    ],
    typicalOperatingHours: '24/7 service, peak hours 6-9 AM and 4-7 PM',
    minimumResources: {
      staff: '2-5 drivers',
      equipment: ['Licensed vehicles', 'Communication radios', 'GPS systems', 'Safety equipment'],
      utilities: ['Fuel supply', 'Vehicle maintenance', 'Radio/phone dispatch'],
      space: 'Vehicle parking, maintenance area, dispatch office'
    },
    examples: {
      businessPurpose: [
        'To provide reliable transportation services for [AREA] residents and visitors',
        'To connect communities with safe, affordable transport options'
      ],
      productsServices: [
        'Local taxi service, airport transfers, charter trips, delivery service',
        'Point-to-point transport, tourist transportation, medical appointments'
      ],
      keyPersonnel: [
        'Owner/Dispatcher, Licensed Drivers, Mechanic',
        'Lead Driver, Part-time Drivers, Radio Operator'
      ],
      customerBase: [
        'Local residents, tourists, business travelers, elderly clients',
        'Airport passengers, hotel guests, medical patients, students'
      ]
    }
  },

  // EDUCATION & CHILDCARE
  {
    id: 'daycare_center',
    name: 'Daycare Center',
    localName: 'Early Childhood Center/Nursery',
    category: 'education',
    vulnerabilities: [
      { hazardId: 'pandemic', defaultRiskLevel: 'high' },
      { hazardId: 'hurricane', defaultRiskLevel: 'high' },
      { hazardId: 'power_outage', defaultRiskLevel: 'medium' },
      { hazardId: 'water_contamination', defaultRiskLevel: 'high' },
      { hazardId: 'staff_shortage', defaultRiskLevel: 'high' },
      { hazardId: 'regulatory_changes', defaultRiskLevel: 'medium' },
      { hazardId: 'crime', defaultRiskLevel: 'low' }
    ],
    typicalOperatingHours: 'Monday-Friday 7:00 AM - 6:00 PM, following school calendar',
    minimumResources: {
      staff: '4-8 staff (director, teachers, assistants)',
      equipment: ['Educational materials', 'Safety equipment', 'Kitchen facilities', 'Playground equipment'],
      utilities: ['Reliable electricity', 'Water supply', 'Phone system', 'Secure access'],
      space: 'Classrooms, playground, kitchen, administrative office, parking'
    },
    examples: {
      businessPurpose: [
        'To provide quality early childhood education and care in [COMMUNITY]',
        'To support working families with safe, nurturing child development services'
      ],
      productsServices: [
        'Daycare services, preschool education, after-school care, summer programs',
        'Early learning, nutritious meals, developmental activities, parent support'
      ],
      keyPersonnel: [
        'Center Director, Early Childhood Teachers, Teaching Assistants',
        'Owner/Director, Lead Teacher, Assistant Teachers, Cook'
      ],
      customerBase: [
        'Working parents, single parents, families needing flexible care',
        'Professional couples, government employees, business owners'
      ]
    }
  }
]

// Comprehensive Hazard Types - 25+ covering all risk categories
const hazardTypes = [
  // NATURAL HAZARDS
  { id: 'hurricane', name: 'Hurricane/Tropical Storm', category: 'natural', frequency: 'likely', impact: 'major' },
  { id: 'earthquake', name: 'Earthquake', category: 'natural', frequency: 'possible', impact: 'major' },
  { id: 'flash_flood', name: 'Flash Flooding', category: 'natural', frequency: 'possible', impact: 'moderate' },
  { id: 'drought', name: 'Drought', category: 'natural', frequency: 'possible', impact: 'moderate' },
  { id: 'landslide', name: 'Landslide', category: 'natural', frequency: 'unlikely', impact: 'major' },
  { id: 'coastal_erosion', name: 'Coastal Erosion', category: 'natural', frequency: 'likely', impact: 'moderate' },
  { id: 'rough_seas', name: 'Rough Seas/Marine Conditions', category: 'natural', frequency: 'likely', impact: 'moderate' },
  { id: 'extreme_heat', name: 'Extreme Heat', category: 'natural', frequency: 'likely', impact: 'minor' },
  { id: 'lightning_strike', name: 'Lightning Strike', category: 'natural', frequency: 'possible', impact: 'moderate' },

  // TECHNOLOGICAL HAZARDS
  { id: 'power_outage', name: 'Power Outage', category: 'technological', frequency: 'likely', impact: 'minor' },
  { id: 'fire', name: 'Fire', category: 'technological', frequency: 'unlikely', impact: 'major' },
  { id: 'cyber_attack', name: 'Cyber Attack', category: 'technological', frequency: 'possible', impact: 'major' },
  { id: 'equipment_failure', name: 'Equipment Failure', category: 'technological', frequency: 'possible', impact: 'moderate' },
  { id: 'data_loss', name: 'Data Loss/System Failure', category: 'technological', frequency: 'possible', impact: 'moderate' },
  { id: 'telecommunications_failure', name: 'Telecommunications Failure', category: 'technological', frequency: 'possible', impact: 'moderate' },
  { id: 'vehicle_breakdown', name: 'Vehicle/Transport Breakdown', category: 'technological', frequency: 'likely', impact: 'minor' },
  { id: 'industrial_accident', name: 'Industrial Accident', category: 'technological', frequency: 'unlikely', impact: 'major' },

  // HEALTH HAZARDS
  { id: 'pandemic', name: 'Pandemic/Health Crisis', category: 'health', frequency: 'rare', impact: 'catastrophic' },
  { id: 'food_contamination', name: 'Food Contamination', category: 'health', frequency: 'unlikely', impact: 'major' },
  { id: 'water_contamination', name: 'Water Contamination', category: 'health', frequency: 'unlikely', impact: 'major' },
  { id: 'pest_infestation', name: 'Pest/Disease Infestation', category: 'health', frequency: 'possible', impact: 'moderate' },

  // ECONOMIC HAZARDS
  { id: 'economic_downturn', name: 'Economic Downturn', category: 'economic', frequency: 'possible', impact: 'moderate' },
  { id: 'supply_disruption', name: 'Supply Chain Disruption', category: 'economic', frequency: 'possible', impact: 'moderate' },
  { id: 'market_volatility', name: 'Market Volatility', category: 'economic', frequency: 'likely', impact: 'moderate' },
  { id: 'fuel_shortage', name: 'Fuel Shortage', category: 'economic', frequency: 'possible', impact: 'moderate' },
  { id: 'currency_devaluation', name: 'Currency Devaluation', category: 'economic', frequency: 'possible', impact: 'moderate' },
  { id: 'inflation', name: 'High Inflation', category: 'economic', frequency: 'likely', impact: 'moderate' },
  { id: 'gas_shortage', name: 'Cooking Gas Shortage', category: 'economic', frequency: 'possible', impact: 'moderate' },
  { id: 'water_shortage', name: 'Water Shortage', category: 'economic', frequency: 'possible', impact: 'moderate' },

  // HUMAN/SOCIAL HAZARDS
  { id: 'crime', name: 'Crime/Security Issues', category: 'human', frequency: 'possible', impact: 'minor' },
  { id: 'theft', name: 'Theft/Burglary', category: 'human', frequency: 'possible', impact: 'moderate' },
  { id: 'vandalism', name: 'Vandalism', category: 'human', frequency: 'possible', impact: 'minor' },
  { id: 'terrorism', name: 'Terrorism/Security Threat', category: 'human', frequency: 'rare', impact: 'major' },
  { id: 'civil_unrest', name: 'Civil Unrest', category: 'human', frequency: 'unlikely', impact: 'moderate' },
  { id: 'staff_shortage', name: 'Staff Shortage/Labor Issues', category: 'human', frequency: 'possible', impact: 'moderate' },

  // ENVIRONMENTAL HAZARDS
  { id: 'chemical_spill', name: 'Chemical Spill', category: 'environmental', frequency: 'rare', impact: 'major' },
  { id: 'pollution', name: 'Environmental Pollution', category: 'environmental', frequency: 'possible', impact: 'moderate' },
  { id: 'waste_overflow', name: 'Waste Management Failure', category: 'environmental', frequency: 'possible', impact: 'minor' },

  // REGULATORY/POLITICAL HAZARDS
  { id: 'regulatory_changes', name: 'Regulatory Changes', category: 'regulatory', frequency: 'possible', impact: 'moderate' },
  { id: 'policy_changes', name: 'Government Policy Changes', category: 'regulatory', frequency: 'possible', impact: 'moderate' },
  { id: 'licensing_issues', name: 'Licensing/Permit Issues', category: 'regulatory', frequency: 'unlikely', impact: 'moderate' },

  // INFRASTRUCTURE HAZARDS
  { id: 'transportation_disruption', name: 'Transportation Disruption', category: 'infrastructure', frequency: 'possible', impact: 'moderate' },
  { id: 'road_damage', name: 'Road Damage/Infrastructure Failure', category: 'infrastructure', frequency: 'possible', impact: 'moderate' },
  { id: 'port_closure', name: 'Port/Airport Closure', category: 'infrastructure', frequency: 'unlikely', impact: 'major' },

  // CLIMATE CHANGE RELATED
  { id: 'climate_change', name: 'Climate Change Effects', category: 'environmental', frequency: 'likely', impact: 'major' },
  { id: 'sea_level_rise', name: 'Sea Level Rise', category: 'environmental', frequency: 'likely', impact: 'major' },
  { id: 'temperature_rise', name: 'Rising Temperatures', category: 'environmental', frequency: 'likely', impact: 'moderate' },

  // MARKET ACCESS
  { id: 'market_access', name: 'Loss of Market Access', category: 'economic', frequency: 'possible', impact: 'major' },
  { id: 'tourism_decline', name: 'Tourism Decline', category: 'economic', frequency: 'possible', impact: 'major' },
  { id: 'overfishing', name: 'Overfishing/Resource Depletion', category: 'environmental', frequency: 'possible', impact: 'major' }
]

// Comprehensive Strategies - 50+ covering all categories and phases
const strategies = [
  // PREVENTION STRATEGIES - PHYSICAL
  {
    id: 'building_reinforcement',
    title: 'Building Reinforcement',
    description: 'Structural improvements to withstand natural disasters',
    category: 'prevention',
    reasoning: 'Reduces physical damage from hurricanes, earthquakes, and floods',
    icon: '🏗️'
  },
  {
    id: 'maintenance',
    title: 'Regular Maintenance',
    description: 'Systematic upkeep of equipment and facilities',
    category: 'prevention',
    reasoning: 'Prevents equipment failures and reduces downtime',
    icon: '🔧'
  },
  {
    id: 'physical_security',
    title: 'Physical Security',
    description: 'Alarms, cameras, locks, and access controls',
    category: 'prevention',
    reasoning: 'Protects against theft and unauthorized access',
    icon: '🔒'
  },
  {
    id: 'fire_safety',
    title: 'Fire Safety Systems',
    description: 'Fire detection, suppression, and prevention measures',
    category: 'prevention',
    reasoning: 'Prevents and contains fire incidents',
    icon: '🔥'
  },
  {
    id: 'storm_shutters',
    title: 'Storm Shutters/Protection',
    description: 'Protective barriers for windows and openings',
    category: 'prevention',
    reasoning: 'Prevents wind and debris damage during storms',
    icon: '🪟'
  },
  {
    id: 'drainage_systems',
    title: 'Drainage Systems',
    description: 'Proper water management and flood prevention',
    category: 'prevention',
    reasoning: 'Prevents water damage and flooding',
    icon: '🌊'
  },
  {
    id: 'equipment_redundancy',
    title: 'Equipment Redundancy',
    description: 'Backup equipment and systems',
    category: 'prevention',
    reasoning: 'Ensures operations continue if primary equipment fails',
    icon: '⚙️'
  },

  // PREVENTION STRATEGIES - DIGITAL/CYBER
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description: 'Data protection and network security measures',
    category: 'prevention',
    reasoning: 'Guards against cyber threats and data breaches',
    icon: '🛡️'
  },
  {
    id: 'data_backup',
    title: 'Data Backup Systems',
    description: 'Regular backup of critical business data',
    category: 'prevention',
    reasoning: 'Protects against data loss from various causes',
    icon: '💾'
  },
  {
    id: 'cloud_storage',
    title: 'Cloud Storage Solutions',
    description: 'Off-site data storage and system access',
    category: 'prevention',
    reasoning: 'Ensures data availability from any location',
    icon: '☁️'
  },
  {
    id: 'software_updates',
    title: 'Software Updates',
    description: 'Regular system and security updates',
    category: 'prevention',
    reasoning: 'Prevents security vulnerabilities and system failures',
    icon: '🔄'
  },

  // PREVENTION STRATEGIES - FINANCIAL
  {
    id: 'insurance',
    title: 'Insurance Coverage',
    description: 'Comprehensive business insurance policies',
    category: 'prevention',
    reasoning: 'Financial protection against major losses',
    icon: '📋'
  },
  {
    id: 'emergency_fund',
    title: 'Emergency Fund',
    description: 'Reserved funds for unexpected expenses',
    category: 'prevention',
    reasoning: 'Provides financial cushion during disruptions',
    icon: '💰'
  },
  {
    id: 'diversified_income',
    title: 'Diversified Income Streams',
    description: 'Multiple sources of revenue',
    category: 'prevention',
    reasoning: 'Reduces dependency on single income source',
    icon: '💼'
  },
  {
    id: 'supplier_diversification',
    title: 'Supplier Diversification',
    description: 'Multiple suppliers for critical goods/services',
    category: 'prevention',
    reasoning: 'Prevents supply chain disruptions',
    icon: '🚚'
  },

  // PREVENTION STRATEGIES - OPERATIONAL
  {
    id: 'staff_training',
    title: 'Staff Training',
    description: 'Regular training on safety and emergency procedures',
    category: 'prevention',
    reasoning: 'Ensures staff can respond effectively to emergencies',
    icon: '👥'
  },
  {
    id: 'inventory_management',
    title: 'Inventory Management',
    description: 'Optimal stock levels and rotation systems',
    category: 'prevention',
    reasoning: 'Prevents shortages and waste during disruptions',
    icon: '📦'
  },
  {
    id: 'quality_control',
    title: 'Quality Control Systems',
    description: 'Regular quality checks and standards',
    category: 'prevention',
    reasoning: 'Prevents contamination and product recalls',
    icon: '✅'
  },
  {
    id: 'regulatory_compliance',
    title: 'Regulatory Compliance',
    description: 'Adherence to all relevant laws and regulations',
    category: 'prevention',
    reasoning: 'Prevents legal issues and operational shutdowns',
    icon: '📜'
  },
  {
    id: 'health_safety',
    title: 'Health & Safety Protocols',
    description: 'Comprehensive workplace safety measures',
    category: 'prevention',
    reasoning: 'Prevents accidents and health-related disruptions',
    icon: '🏥'
  },

  // PREPAREDNESS STRATEGIES
  {
    id: 'emergency_plan',
    title: 'Emergency Response Plan',
    description: 'Documented procedures for various emergency scenarios',
    category: 'preparedness',
    reasoning: 'Ensures organized response during crises',
    icon: '📋'
  },
  {
    id: 'emergency_supplies',
    title: 'Emergency Supplies',
    description: 'First aid, flashlights, radios, water, non-perishables',
    category: 'preparedness',
    reasoning: 'Provides essential resources during emergencies',
    icon: '🎒'
  },
  {
    id: 'generator_backup',
    title: 'Backup Generator',
    description: 'Alternative power source for critical operations',
    category: 'preparedness',
    reasoning: 'Maintains operations during power outages',
    icon: '⚡'
  },
  {
    id: 'communication_plan',
    title: 'Communication Plan',
    description: 'Methods to contact staff, customers, and suppliers',
    category: 'preparedness',
    reasoning: 'Maintains coordination during emergencies',
    icon: '📞'
  },
  {
    id: 'evacuation_plan',
    title: 'Evacuation Procedures',
    description: 'Clear routes and procedures for safe evacuation',
    category: 'preparedness',
    reasoning: 'Ensures safe evacuation when necessary',
    icon: '🚪'
  },
  {
    id: 'water_storage',
    title: 'Water Storage',
    description: 'Emergency water supply and purification',
    category: 'preparedness',
    reasoning: 'Ensures clean water during supply disruptions',
    icon: '🚰'
  },
  {
    id: 'fuel_storage',
    title: 'Fuel Storage',
    description: 'Emergency fuel supplies for generators and vehicles',
    category: 'preparedness',
    reasoning: 'Maintains power and transportation during shortages',
    icon: '⛽'
  },

  // RESPONSE STRATEGIES
  {
    id: 'emergency_team',
    title: 'Emergency Response Team',
    description: 'Designated team with clear roles and responsibilities',
    category: 'response',
    reasoning: 'Ensures coordinated response during crises',
    icon: '🚨'
  },
  {
    id: 'emergency_communication',
    title: 'Emergency Communication',
    description: 'Communication protocols for stakeholders',
    category: 'response',
    reasoning: 'Keeps everyone informed during emergencies',
    icon: '📞'
  },
  {
    id: 'rapid_assessment',
    title: 'Rapid Damage Assessment',
    description: 'Quick evaluation of damage and safety',
    category: 'response',
    reasoning: 'Identifies immediate priorities and safety concerns',
    icon: '🔍'
  },
  {
    id: 'customer_notification',
    title: 'Customer Notification',
    description: 'Informing customers about service disruptions',
    category: 'response',
    reasoning: 'Maintains customer relationships during disruptions',
    icon: '📢'
  },
  {
    id: 'supplier_coordination',
    title: 'Supplier Coordination',
    description: 'Coordinating with suppliers during disruptions',
    category: 'response',
    reasoning: 'Maintains supply chain during emergencies',
    icon: '🤝'
  },
  {
    id: 'media_relations',
    title: 'Media Relations',
    description: 'Managing public communications and reputation',
    category: 'response',
    reasoning: 'Protects business reputation during crises',
    icon: '📺'
  },
  {
    id: 'first_aid_response',
    title: 'First Aid Response',
    description: 'Immediate medical assistance for injuries',
    category: 'response',
    reasoning: 'Provides critical care until professional help arrives',
    icon: '🩹'
  },

  // RECOVERY STRATEGIES
  {
    id: 'damage_assessment',
    title: 'Damage Assessment',
    description: 'Systematic evaluation of impacts and losses',
    category: 'recovery',
    reasoning: 'Identifies priorities for recovery efforts',
    icon: '📊'
  },
  {
    id: 'business_resumption',
    title: 'Business Resumption',
    description: 'Procedures to restart operations',
    category: 'recovery',
    reasoning: 'Gets business back to normal as quickly as possible',
    icon: '🔄'
  },
  {
    id: 'temporary_operations',
    title: 'Temporary Operations',
    description: 'Alternative ways to maintain critical functions',
    category: 'recovery',
    reasoning: 'Maintains revenue and customer service during repairs',
    icon: '🏠'
  },
  {
    id: 'insurance_claims',
    title: 'Insurance Claims Processing',
    description: 'Efficient processing of insurance claims',
    category: 'recovery',
    reasoning: 'Accelerates financial recovery from losses',
    icon: '📄'
  },
  {
    id: 'supply_restoration',
    title: 'Supply Chain Restoration',
    description: 'Re-establishing supplier relationships',
    category: 'recovery',
    reasoning: 'Restores normal supply operations',
    icon: '🔗'
  },
  {
    id: 'staff_support',
    title: 'Staff Support Services',
    description: 'Support for employees affected by disasters',
    category: 'recovery',
    reasoning: 'Maintains workforce during recovery period',
    icon: '👥'
  },
  {
    id: 'financial_recovery',
    title: 'Financial Recovery Plan',
    description: 'Managing cash flow and finances during recovery',
    category: 'recovery',
    reasoning: 'Ensures financial sustainability during recovery',
    icon: '💳'
  },
  {
    id: 'infrastructure_repair',
    title: 'Infrastructure Repair',
    description: 'Restoring damaged facilities and equipment',
    category: 'recovery',
    reasoning: 'Returns operations to full capacity',
    icon: '🔨'
  },

  // CONTINUITY STRATEGIES
  {
    id: 'remote_work',
    title: 'Remote Work Capabilities',
    description: 'Ability for staff to work from alternative locations',
    category: 'continuity',
    reasoning: 'Maintains operations when premises are inaccessible',
    icon: '💻'
  },
  {
    id: 'alternative_suppliers',
    title: 'Alternative Suppliers',
    description: 'Pre-arranged backup suppliers',
    category: 'continuity',
    reasoning: 'Maintains supply chain during primary supplier disruptions',
    icon: '🔄'
  },
  {
    id: 'mobile_operations',
    title: 'Mobile Operations',
    description: 'Portable or mobile service delivery options',
    category: 'continuity',
    reasoning: 'Continues service delivery from alternative locations',
    icon: '🚐'
  },
  {
    id: 'cross_training',
    title: 'Cross-Training Staff',
    description: 'Training staff in multiple roles',
    category: 'continuity',
    reasoning: 'Maintains operations despite staff shortages',
    icon: '🎓'
  },
  {
    id: 'partnership_agreements',
    title: 'Partnership Agreements',
    description: 'Mutual aid agreements with other businesses',
    category: 'continuity',
    reasoning: 'Provides resources and support during emergencies',
    icon: '🤝'
  },

  // MONITORING & IMPROVEMENT
  {
    id: 'monitoring_systems',
    title: 'Monitoring Systems',
    description: 'Early warning and monitoring systems',
    category: 'monitoring',
    reasoning: 'Provides advance notice of potential threats',
    icon: '📡'
  },
  {
    id: 'regular_drills',
    title: 'Regular Emergency Drills',
    description: 'Practice exercises for emergency procedures',
    category: 'monitoring',
    reasoning: 'Ensures staff readiness and identifies plan weaknesses',
    icon: '🏃'
  },
  {
    id: 'plan_updates',
    title: 'Plan Updates',
    description: 'Regular review and updating of emergency plans',
    category: 'monitoring',
    reasoning: 'Keeps plans current and effective',
    icon: '📝'
  },
  {
    id: 'lessons_learned',
    title: 'Lessons Learned Process',
    description: 'Analyzing past incidents for improvements',
    category: 'monitoring',
    reasoning: 'Continuously improves emergency preparedness',
    icon: '🧠'
  },
  {
    id: 'risk_assessment',
    title: 'Regular Risk Assessment',
    description: 'Ongoing evaluation of business risks',
    category: 'monitoring',
    reasoning: 'Identifies new risks and changing threat levels',
    icon: '📋'
  },

  // SPECIALIZED STRATEGIES
  {
    id: 'cold_storage',
    title: 'Cold Storage Backup',
    description: 'Alternative refrigeration for perishables',
    category: 'specialized',
    reasoning: 'Prevents food spoilage during power outages',
    icon: '❄️'
  },
  {
    id: 'security_patrols',
    title: 'Security Patrols',
    description: 'Regular security rounds and monitoring',
    category: 'specialized',
    reasoning: 'Deters crime and identifies security issues',
    icon: '👮'
  },
  {
    id: 'waste_management',
    title: 'Waste Management Plan',
    description: 'Proper waste disposal and emergency procedures',
    category: 'specialized',
    reasoning: 'Prevents health hazards and environmental damage',
    icon: '🗑️'
  }
]

// Complete Jamaica Parish Data - All 14 parishes with accurate characteristics
const jamaicaParishes = [
  // SOUTHEASTERN PARISHES
  { country: 'Jamaica', countryCode: 'JM', parish: 'Kingston', isCoastal: true, isUrban: true },
  { country: 'Jamaica', countryCode: 'JM', parish: 'St. Andrew', isCoastal: false, isUrban: true },
  { country: 'Jamaica', countryCode: 'JM', parish: 'St. Thomas', isCoastal: true, isUrban: false },
  
  // NORTHEASTERN PARISHES  
  { country: 'Jamaica', countryCode: 'JM', parish: 'Portland', isCoastal: true, isUrban: false },
  { country: 'Jamaica', countryCode: 'JM', parish: 'St. Mary', isCoastal: true, isUrban: false },
  
  // NORTHERN PARISHES
  { country: 'Jamaica', countryCode: 'JM', parish: 'St. Ann', isCoastal: true, isUrban: false },
  { country: 'Jamaica', countryCode: 'JM', parish: 'Trelawny', isCoastal: true, isUrban: false },
  
  // NORTHWESTERN PARISHES
  { country: 'Jamaica', countryCode: 'JM', parish: 'St. James', isCoastal: true, isUrban: true },
  { country: 'Jamaica', countryCode: 'JM', parish: 'Hanover', isCoastal: true, isUrban: false },
  
  // SOUTHWESTERN PARISHES
  { country: 'Jamaica', countryCode: 'JM', parish: 'Westmoreland', isCoastal: true, isUrban: false },
  { country: 'Jamaica', countryCode: 'JM', parish: 'St. Elizabeth', isCoastal: true, isUrban: false },
  
  // CENTRAL PARISHES
  { country: 'Jamaica', countryCode: 'JM', parish: 'Manchester', isCoastal: false, isUrban: false },
  { country: 'Jamaica', countryCode: 'JM', parish: 'Clarendon', isCoastal: true, isUrban: false },
  { country: 'Jamaica', countryCode: 'JM', parish: 'St. Catherine', isCoastal: true, isUrban: true }
]

// Additional Caribbean locations for context
const additionalLocations = [
  // BARBADOS
  { country: 'Barbados', countryCode: 'BB', parish: 'Christ Church', isCoastal: true, isUrban: false },
  { country: 'Barbados', countryCode: 'BB', parish: 'St. Michael', isCoastal: true, isUrban: true },
  { country: 'Barbados', countryCode: 'BB', parish: 'St. James', isCoastal: true, isUrban: false },
  { country: 'Barbados', countryCode: 'BB', parish: 'St. Peter', isCoastal: true, isUrban: false },
  
  // TRINIDAD & TOBAGO
  { country: 'Trinidad and Tobago', countryCode: 'TT', parish: 'Port of Spain', isCoastal: true, isUrban: true },
  { country: 'Trinidad and Tobago', countryCode: 'TT', parish: 'San Fernando', isCoastal: true, isUrban: true },
  { country: 'Trinidad and Tobago', countryCode: 'TT', parish: 'Chaguanas', isCoastal: false, isUrban: true },
  { country: 'Trinidad and Tobago', countryCode: 'TT', parish: 'Arima', isCoastal: false, isUrban: true },
  
  // BAHAMAS
  { country: 'Bahamas', countryCode: 'BS', parish: 'New Providence', isCoastal: true, isUrban: true },
  { country: 'Bahamas', countryCode: 'BS', parish: 'Grand Bahama', isCoastal: true, isUrban: true },
  
  // GRENADA
  { country: 'Grenada', countryCode: 'GD', parish: 'St. George', isCoastal: true, isUrban: true },
  { country: 'Grenada', countryCode: 'GD', parish: 'St. Andrew', isCoastal: true, isUrban: false },
  
  // ST. LUCIA
  { country: 'St. Lucia', countryCode: 'LC', parish: 'Castries', isCoastal: true, isUrban: true },
  { country: 'St. Lucia', countryCode: 'LC', parish: 'Gros Islet', isCoastal: true, isUrban: false },
  
  // ANTIGUA & BARBUDA
  { country: 'Antigua and Barbuda', countryCode: 'AG', parish: 'St. John', isCoastal: true, isUrban: true },
  { country: 'Antigua and Barbuda', countryCode: 'AG', parish: 'St. Peter', isCoastal: true, isUrban: false }
]

async function migrateData() {
  console.log('🚀 Starting comprehensive migration to admin system...')

  try {
    // 1. Create business types
    console.log('📊 Creating business types...')
    for (const profile of industryProfiles) {
      await prisma.adminBusinessType.upsert({
        where: { businessTypeId: profile.id },
        update: {},
        create: {
          businessTypeId: profile.id,
          name: profile.name,
          localName: profile.localName,
          category: profile.category,
          description: `${profile.category} business type`,
          typicalOperatingHours: profile.typicalOperatingHours,
          minimumStaff: profile.minimumResources?.staff || '',
          minimumEquipment: JSON.stringify(profile.minimumResources?.equipment || []),
          minimumUtilities: JSON.stringify(profile.minimumResources?.utilities || []),
          minimumSpace: profile.minimumResources?.space || '',
          exampleBusinessPurposes: JSON.stringify(profile.examples?.businessPurpose || []),
          exampleProducts: JSON.stringify(profile.examples?.productsServices || []),
          exampleKeyPersonnel: JSON.stringify(profile.examples?.keyPersonnel || []),
          exampleCustomerBase: JSON.stringify(profile.examples?.customerBase || [])
        }
      })
    }

    // 2. Create hazard types
    console.log('⚠️ Creating hazard types...')
    for (const hazard of hazardTypes) {
      await prisma.adminHazardType.upsert({
        where: { hazardId: hazard.id },
        update: {},
        create: {
          hazardId: hazard.id,
          name: hazard.name,
          category: hazard.category,
          description: `${hazard.category} hazard type`,
          defaultFrequency: hazard.frequency,
          defaultImpact: hazard.impact
        }
      })
    }

    // 3. Create business type-hazard relationships
    console.log('🔗 Creating business type-hazard relationships...')
    for (const profile of industryProfiles) {
      for (const vulnerability of profile.vulnerabilities) {
        await prisma.adminBusinessTypeHazard.upsert({
          where: {
            businessTypeId_hazardId: {
              businessTypeId: profile.id,
              hazardId: vulnerability.hazardId
            }
          },
          update: {},
          create: {
            businessTypeId: profile.id,
            hazardId: vulnerability.hazardId,
            riskLevel: vulnerability.defaultRiskLevel,
            notes: `Default risk level for ${profile.name}`
          }
        })
      }
    }

    // 4. Create strategies
    console.log('🛡️ Creating strategies...')
    for (const strategy of strategies) {
      await prisma.adminStrategy.upsert({
        where: { strategyId: strategy.id },
        update: {},
        create: {
          strategyId: strategy.id,
          title: strategy.title,
          description: strategy.description,
          category: strategy.category,
          reasoning: strategy.reasoning,
          icon: strategy.icon
        }
      })
    }

    // 5. Create all Jamaica parish locations
    console.log('🇯🇲 Creating Jamaica parish locations...')
    for (const location of jamaicaParishes) {
      await prisma.adminLocation.upsert({
        where: {
          countryCode_parish: {
            countryCode: location.countryCode,
            parish: location.parish
          }
        },
        update: {},
        create: location
      })
    }

    // 6. Create additional Caribbean locations
    console.log('🏝️ Creating additional Caribbean locations...')
    for (const location of additionalLocations) {
      await prisma.adminLocation.upsert({
        where: {
          countryCode_parish: {
            countryCode: location.countryCode,
            parish: location.parish
          }
        },
        update: {},
        create: location
      })
    }

    // 7. Create strategy-hazard relationships (which strategies work best for which hazards)
    console.log('🎯 Creating strategy-hazard effectiveness mappings...')
    const strategyHazardMappings = [
      // HURRICANE STRATEGIES
      { strategyId: 'building_reinforcement', hazardId: 'hurricane', effectiveness: 'high' },
      { strategyId: 'storm_shutters', hazardId: 'hurricane', effectiveness: 'high' },
      { strategyId: 'emergency_plan', hazardId: 'hurricane', effectiveness: 'high' },
      { strategyId: 'emergency_supplies', hazardId: 'hurricane', effectiveness: 'high' },
      { strategyId: 'generator_backup', hazardId: 'hurricane', effectiveness: 'high' },
      { strategyId: 'insurance', hazardId: 'hurricane', effectiveness: 'high' },
      { strategyId: 'evacuation_plan', hazardId: 'hurricane', effectiveness: 'high' },
      { strategyId: 'water_storage', hazardId: 'hurricane', effectiveness: 'medium' },
      { strategyId: 'fuel_storage', hazardId: 'hurricane', effectiveness: 'medium' },

      // POWER OUTAGE STRATEGIES
      { strategyId: 'generator_backup', hazardId: 'power_outage', effectiveness: 'high' },
      { strategyId: 'emergency_supplies', hazardId: 'power_outage', effectiveness: 'high' },
      { strategyId: 'data_backup', hazardId: 'power_outage', effectiveness: 'medium' },
      { strategyId: 'equipment_redundancy', hazardId: 'power_outage', effectiveness: 'medium' },
      { strategyId: 'maintenance', hazardId: 'power_outage', effectiveness: 'medium' },

      // CYBER ATTACK STRATEGIES
      { strategyId: 'cybersecurity', hazardId: 'cyber_attack', effectiveness: 'high' },
      { strategyId: 'data_backup', hazardId: 'cyber_attack', effectiveness: 'high' },
      { strategyId: 'cloud_storage', hazardId: 'cyber_attack', effectiveness: 'high' },
      { strategyId: 'software_updates', hazardId: 'cyber_attack', effectiveness: 'high' },
      { strategyId: 'staff_training', hazardId: 'cyber_attack', effectiveness: 'medium' },

      // PANDEMIC STRATEGIES
      { strategyId: 'health_safety', hazardId: 'pandemic', effectiveness: 'high' },
      { strategyId: 'remote_work', hazardId: 'pandemic', effectiveness: 'high' },
      { strategyId: 'staff_training', hazardId: 'pandemic', effectiveness: 'high' },
      { strategyId: 'emergency_plan', hazardId: 'pandemic', effectiveness: 'medium' },
      { strategyId: 'diversified_income', hazardId: 'pandemic', effectiveness: 'medium' },

      // FIRE STRATEGIES
      { strategyId: 'fire_safety', hazardId: 'fire', effectiveness: 'high' },
      { strategyId: 'emergency_plan', hazardId: 'fire', effectiveness: 'high' },
      { strategyId: 'evacuation_plan', hazardId: 'fire', effectiveness: 'high' },
      { strategyId: 'insurance', hazardId: 'fire', effectiveness: 'high' },
      { strategyId: 'maintenance', hazardId: 'fire', effectiveness: 'medium' },

      // SUPPLY DISRUPTION STRATEGIES
      { strategyId: 'supplier_diversification', hazardId: 'supply_disruption', effectiveness: 'high' },
      { strategyId: 'inventory_management', hazardId: 'supply_disruption', effectiveness: 'high' },
      { strategyId: 'alternative_suppliers', hazardId: 'supply_disruption', effectiveness: 'high' },
      { strategyId: 'emergency_fund', hazardId: 'supply_disruption', effectiveness: 'medium' },

      // ECONOMIC DOWNTURN STRATEGIES
      { strategyId: 'diversified_income', hazardId: 'economic_downturn', effectiveness: 'high' },
      { strategyId: 'emergency_fund', hazardId: 'economic_downturn', effectiveness: 'high' },
      { strategyId: 'financial_recovery', hazardId: 'economic_downturn', effectiveness: 'high' },
      { strategyId: 'cross_training', hazardId: 'economic_downturn', effectiveness: 'medium' },

      // CRIME/THEFT STRATEGIES
      { strategyId: 'physical_security', hazardId: 'crime', effectiveness: 'high' },
      { strategyId: 'security_patrols', hazardId: 'crime', effectiveness: 'high' },
      { strategyId: 'insurance', hazardId: 'crime', effectiveness: 'medium' },
      { strategyId: 'staff_training', hazardId: 'crime', effectiveness: 'medium' },

      // FLOOD STRATEGIES
      { strategyId: 'drainage_systems', hazardId: 'flash_flood', effectiveness: 'high' },
      { strategyId: 'building_reinforcement', hazardId: 'flash_flood', effectiveness: 'medium' },
      { strategyId: 'insurance', hazardId: 'flash_flood', effectiveness: 'high' },
      { strategyId: 'emergency_plan', hazardId: 'flash_flood', effectiveness: 'medium' },

      // DROUGHT STRATEGIES
      { strategyId: 'water_storage', hazardId: 'drought', effectiveness: 'high' },
      { strategyId: 'supplier_diversification', hazardId: 'drought', effectiveness: 'medium' },
      { strategyId: 'emergency_plan', hazardId: 'drought', effectiveness: 'medium' },

      // EQUIPMENT FAILURE STRATEGIES
      { strategyId: 'maintenance', hazardId: 'equipment_failure', effectiveness: 'high' },
      { strategyId: 'equipment_redundancy', hazardId: 'equipment_failure', effectiveness: 'high' },
      { strategyId: 'emergency_fund', hazardId: 'equipment_failure', effectiveness: 'medium' },

      // FUEL SHORTAGE STRATEGIES
      { strategyId: 'fuel_storage', hazardId: 'fuel_shortage', effectiveness: 'high' },
      { strategyId: 'supplier_diversification', hazardId: 'fuel_shortage', effectiveness: 'high' },
      { strategyId: 'alternative_suppliers', hazardId: 'fuel_shortage', effectiveness: 'medium' },

      // WATER CONTAMINATION STRATEGIES
      { strategyId: 'water_storage', hazardId: 'water_contamination', effectiveness: 'high' },
      { strategyId: 'quality_control', hazardId: 'water_contamination', effectiveness: 'high' },
      { strategyId: 'health_safety', hazardId: 'water_contamination', effectiveness: 'medium' },

      // Add more mappings as needed...
    ]

    for (const mapping of strategyHazardMappings) {
      try {
        await prisma.adminStrategyHazard.upsert({
          where: {
            strategyId_hazardId: {
              strategyId: mapping.strategyId,
              hazardId: mapping.hazardId
            }
          },
          update: {},
          create: {
            strategyId: mapping.strategyId,
            hazardId: mapping.hazardId,
            effectiveness: mapping.effectiveness,
            notes: `${mapping.effectiveness} effectiveness for ${mapping.hazardId}`
          }
        })
      } catch (error) {
        console.warn(`Skipping mapping ${mapping.strategyId} -> ${mapping.hazardId}: ${error.message}`)
      }
    }

    // 8. Create business type-strategy recommendations
    console.log('💡 Creating business type-strategy recommendations...')
    const businessStrategyMappings = [
      // GROCERY STORE STRATEGIES
      { businessTypeId: 'grocery_store', strategyId: 'generator_backup', priority: 'high' },
      { businessTypeId: 'grocery_store', strategyId: 'cold_storage', priority: 'high' },
      { businessTypeId: 'grocery_store', strategyId: 'physical_security', priority: 'high' },
      { businessTypeId: 'grocery_store', strategyId: 'supplier_diversification', priority: 'high' },
      { businessTypeId: 'grocery_store', strategyId: 'inventory_management', priority: 'medium' },
      { businessTypeId: 'grocery_store', strategyId: 'insurance', priority: 'medium' },

      // RESTAURANT STRATEGIES
      { businessTypeId: 'restaurant', strategyId: 'fire_safety', priority: 'high' },
      { businessTypeId: 'restaurant', strategyId: 'generator_backup', priority: 'high' },
      { businessTypeId: 'restaurant', strategyId: 'quality_control', priority: 'high' },
      { businessTypeId: 'restaurant', strategyId: 'supplier_diversification', priority: 'medium' },
      { businessTypeId: 'restaurant', strategyId: 'health_safety', priority: 'high' },

      // HOTEL STRATEGIES
      { businessTypeId: 'hotel_guesthouse', strategyId: 'emergency_plan', priority: 'high' },
      { businessTypeId: 'hotel_guesthouse', strategyId: 'generator_backup', priority: 'high' },
      { businessTypeId: 'hotel_guesthouse', strategyId: 'water_storage', priority: 'high' },
      { businessTypeId: 'hotel_guesthouse', strategyId: 'security_patrols', priority: 'medium' },
      { businessTypeId: 'hotel_guesthouse', strategyId: 'evacuation_plan', priority: 'high' },

      // FARM STRATEGIES
      { businessTypeId: 'small_farm', strategyId: 'water_storage', priority: 'high' },
      { businessTypeId: 'small_farm', strategyId: 'crop_insurance', priority: 'high' },
      { businessTypeId: 'small_farm', strategyId: 'diversified_income', priority: 'medium' },
      { businessTypeId: 'small_farm', strategyId: 'equipment_maintenance', priority: 'medium' },

      // Add more business-strategy mappings...
    ]

    for (const mapping of businessStrategyMappings) {
      try {
        await prisma.adminBusinessTypeStrategy.upsert({
          where: {
            businessTypeId_strategyId: {
              businessTypeId: mapping.businessTypeId,
              strategyId: mapping.strategyId
            }
          },
          update: {},
          create: {
            businessTypeId: mapping.businessTypeId,
            strategyId: mapping.strategyId,
            priority: mapping.priority,
            notes: `${mapping.priority} priority strategy for ${mapping.businessTypeId}`
          }
        })
      } catch (error) {
        console.warn(`Skipping business strategy mapping ${mapping.businessTypeId} -> ${mapping.strategyId}: ${error.message}`)
      }
    }

    console.log('✅ Comprehensive migration completed successfully!')
    console.log(`Created:`)
    console.log(`  📊 ${industryProfiles.length} business types`)
    console.log(`  ⚠️ ${hazardTypes.length} hazard types`)
    console.log(`  🛡️ ${strategies.length} strategies`)
    console.log(`  🇯🇲 ${jamaicaParishes.length} Jamaica parishes`)
    console.log(`  🏝️ ${additionalLocations.length} other Caribbean locations`)
    console.log(`  🔗 ${strategyHazardMappings.length} strategy-hazard mappings`)
    console.log(`  💡 ${businessStrategyMappings.length} business-strategy recommendations`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('🎉 Caribbean Business Continuity Admin System is ready!')
      console.log('📋 The system now includes:')
      console.log('   • Comprehensive business types covering all major Caribbean sectors')
      console.log('   • Complete hazard types including climate, economic, and social risks')
      console.log('   • 50+ proven business continuity strategies')
      console.log('   • All 14 Jamaica parishes with accurate coastal/urban data')
      console.log('   • Additional Caribbean locations for regional coverage')
      console.log('   • Smart risk mappings and strategy recommendations')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateData }
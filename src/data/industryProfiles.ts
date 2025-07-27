import { IndustryProfile } from './types'

export const industryProfiles: IndustryProfile[] = [
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
      { hazardId: 'crime', defaultRiskLevel: 'medium' }
    ],
    essentialFunctions: {
      core: [
        'Customer service and sales',
        'Inventory management',
        'Cash handling and payment processing',
        'Product receiving and stocking'
      ],
      support: [
        'Refrigeration and cold storage',
        'Security systems',
        'Supplier relationships',
        'Transportation/delivery'
      ],
      administrative: [
        'Accounting and bookkeeping',
        'Staff scheduling',
        'Vendor payments',
        'Regulatory compliance'
      ]
    },
    criticalSuppliers: [
      'Food distributors and wholesalers',
      'Beverage suppliers',
      'Local farmers and producers',
      'Cleaning and household goods suppliers',
      'Electricity provider',
      'Water utility',
      'Internet/phone service provider'
    ],
    minimumResources: {
      staff: '2-3 staff members (including owner/manager)',
      equipment: ['Point of sale system', 'Refrigeration units', 'Security cameras', 'Generator backup'],
      utilities: ['Reliable electricity', 'Water supply', 'Internet connection', 'Phone line'],
      space: 'Retail floor space, storage area, customer parking'
    },
    typicalOperatingHours: 'Monday-Saturday 7:00 AM - 8:00 PM, Sunday 8:00 AM - 6:00 PM',
    examples: {
      businessPurpose: [
        'To provide fresh groceries and daily essentials to the [NEIGHBORHOOD] community',
        'To serve local residents with convenient access to food and household items',
        'To support local families with affordable groceries and Caribbean specialties'
      ],
      productsServices: [
        'Fresh produce, meat, dairy, and pantry staples. Local specialties like [ISLAND] seasonings and traditional foods',
        'Groceries, beverages, household items, and local products. Money transfer and bill payment services',
        'Daily essentials, frozen foods, snacks, and personal care items. Special orders for community events'
      ],
      uniqueSellingPoints: [
        'Local community focus with personalized service and credit for trusted customers',
        'Extended hours and convenient [AREA] location with fresh local produce',
        'Family-owned business with deep community roots and competitive prices'
      ],
      keyPersonnel: [
        'Store Owner/Manager, Cashier, Stock Clerk',
        'Owner, Assistant Manager, Part-time Cashier',
        'Manager, Senior Cashier, Delivery Driver'
      ],
      minimumResourcesExamples: [
        '2 staff members, basic POS system, 1 refrigeration unit, backup generator',
        'Owner + 1 employee, cash register, refrigerated display, security camera',
        'Manager + cashier, modern POS system, walk-in cooler, delivery vehicle'
      ],
      customerBase: [
        'Local residents within 2-mile radius, families, elderly customers, small businesses',
        'Neighborhood families, young professionals, tourists staying in [AREA]',
        'Community members, local restaurants, visiting relatives of residents'
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
      { hazardId: 'economic_downturn', defaultRiskLevel: 'medium' }
    ],
    essentialFunctions: {
      core: [
        'Food preparation and cooking',
        'Customer service and dining',
        'Order taking and payment processing',
        'Food safety and hygiene'
      ],
      support: [
        'Kitchen equipment operation',
        'Inventory and supply management',
        'Cleaning and sanitation',
        'Marketing and customer relations'
      ],
      administrative: [
        'Staff scheduling and payroll',
        'Vendor payments and ordering',
        'Health permit compliance',
        'Financial management'
      ]
    },
    criticalSuppliers: [
      'Food and beverage distributors',
      'Local farmers and fishermen',
      'Gas/propane suppliers',
      'Cleaning supply companies',
      'Electricity and water utilities',
      'Waste management services'
    ],
    minimumResources: {
      staff: '3-5 staff members (chef, server, cashier)',
      equipment: ['Commercial kitchen equipment', 'POS system', 'Refrigeration', 'Generator'],
      utilities: ['Gas/propane connection', 'Reliable electricity', 'Water supply', 'Waste disposal'],
      space: 'Kitchen, dining area, storage, customer parking'
    },
    typicalOperatingHours: 'Monday-Saturday 11:00 AM - 10:00 PM, Sunday 12:00 PM - 9:00 PM',
    examples: {
      businessPurpose: [
        'To serve authentic [ISLAND] cuisine and provide a welcoming dining experience',
        'To offer fresh, locally-sourced meals that celebrate Caribbean flavors and culture',
        'To create a community gathering place centered around great food and hospitality'
      ],
      productsServices: [
        'Traditional [ISLAND] dishes, fresh seafood, tropical beverages. Catering for special events',
        'Caribbean fusion cuisine, local specialties, craft cocktails. Take-out and delivery services',
        'Home-style cooking, daily specials, vegetarian options. Private dining and party catering'
      ],
      uniqueSellingPoints: [
        'Family recipes passed down through generations with locally-sourced ingredients',
        'Authentic [ISLAND] atmosphere with live music and stunning [AREA] views',
        'Award-winning chef specializing in modern Caribbean cuisine with traditional roots'
      ],
      keyPersonnel: [
        'Head Chef, Restaurant Manager, Servers, Kitchen Staff',
        'Owner/Chef, Assistant Manager, Wait Staff, Prep Cook',
        'Executive Chef, Front Manager, Bartender, Kitchen Team'
      ],
      minimumResourcesExamples: [
        'Chef + 2 servers, basic kitchen setup, 3 tables, take-out counter',
        'Owner + cook + server, full kitchen, 8 dining tables, small bar area',
        'Full kitchen staff, 15 table dining room, bar, outdoor seating area'
      ],
      customerBase: [
        'Local residents, office workers during lunch, tourists exploring [AREA]',
        'Families celebrating special occasions, business lunch meetings, weekend diners',
        'Food enthusiasts, hotel guests, couples seeking romantic dining, local professionals'
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
      { hazardId: 'crime', defaultRiskLevel: 'low' }
    ],
    essentialFunctions: {
      core: [
        'Hair cutting and styling',
        'Beauty treatments and services',
        'Client consultation and booking',
        'Payment processing'
      ],
      support: [
        'Equipment maintenance',
        'Product inventory management',
        'Appointment scheduling',
        'Client relationship management'
      ],
      administrative: [
        'Staff scheduling and payroll',
        'Supply ordering and payments',
        'Licensing compliance',
        'Marketing and promotion'
      ]
    },
    criticalSuppliers: [
      'Professional hair care product distributors',
      'Beauty equipment suppliers',
      'Cleaning and sanitation suppliers',
      'Electricity provider',
      'Water utility',
      'Telephone/internet service'
    ],
    minimumResources: {
      staff: '2-3 stylists (including owner)',
      equipment: ['Styling chairs', 'Hair dryers', 'Washing stations', 'Styling tools', 'Sterilization equipment'],
      utilities: ['Reliable electricity', 'Hot water supply', 'Good ventilation', 'Phone/internet'],
      space: 'Styling area, washing station, product storage, waiting area'
    },
    typicalOperatingHours: 'Tuesday-Saturday 9:00 AM - 6:00 PM, closed Sunday-Monday',
    examples: {
      businessPurpose: [
        'To provide professional hair care and beauty services to [NEIGHBORHOOD] residents',
        'To help clients look and feel their best with expert styling and beauty treatments',
        'To create a relaxing environment where customers can enjoy pampering and self-care'
      ],
      productsServices: [
        'Hair cuts, styling, coloring, and treatments. Manicures, pedicures, and eyebrow services',
        'Professional hair care, special occasion styling, bridal packages. Retail hair products',
        'Full-service salon offering cuts, color, perms, and therapeutic treatments for all hair types'
      ],
      uniqueSellingPoints: [
        'Specialized in Caribbean hair textures with certified stylists and quality products',
        'Personalized service in a comfortable, friendly atmosphere with flexible scheduling',
        'Latest trends and techniques combined with traditional [ISLAND] styling methods'
      ],
      keyPersonnel: [
        'Master Stylist/Owner, Licensed Beautician, Receptionist',
        'Salon Owner, Senior Stylist, Junior Stylist, Part-time Assistant',
        'Head Stylist, Nail Technician, Apprentice Stylist'
      ],
      minimumResourcesExamples: [
        'Owner-stylist + 1 employee, 2 styling stations, basic equipment package',
        '2 stylists, 3 stations, nail area, full product line, appointment system',
        'Full staff of 3, 4 styling stations, washing area, retail section, modern equipment'
      ],
      customerBase: [
        'Local women and men, regular weekly/monthly clients, special occasion customers',
        '[AREA] residents, brides and wedding parties, professionals needing regular maintenance',
        'Community members, tourists, clients celebrating special events, loyal repeat customers'
      ]
    }
  },
  {
    id: 'chemical_processing',
    name: 'Chemical Processing Plant',
    localName: 'Chemical/Petrochemical Facility',
    category: 'industrial',
    vulnerabilities: [
      { hazardId: 'chemical_spill', defaultRiskLevel: 'medium' },
      { hazardId: 'industrial_accident', defaultRiskLevel: 'medium' },
      { hazardId: 'fire', defaultRiskLevel: 'medium' },
      { hazardId: 'environmental_contamination', defaultRiskLevel: 'medium' },
      { hazardId: 'power_outage', defaultRiskLevel: 'high' },
      { hazardId: 'hurricane', defaultRiskLevel: 'high' },
      { hazardId: 'air_pollution', defaultRiskLevel: 'low' }
    ],
    essentialFunctions: {
      core: [
        'Chemical processing and production',
        'Safety monitoring and emergency response',
        'Quality control and testing',
        'Environmental monitoring'
      ],
      support: [
        'Equipment maintenance and repair',
        'Raw material handling and storage',
        'Waste treatment and disposal',
        'Security and access control'
      ],
      administrative: [
        'Regulatory compliance and reporting',
        'Environmental impact assessments',
        'Safety training and certification',
        'Supply chain management'
      ]
    },
    criticalSuppliers: [
      'Raw chemical suppliers',
      'Safety equipment providers',
      'Environmental monitoring services',
      'Waste disposal companies',
      'Emergency response contractors',
      'Specialized maintenance services'
    ],
    minimumResources: {
      staff: '10-15 staff members (operators, safety officer, supervisor)',
      equipment: ['Safety monitoring systems', 'Emergency shutdown systems', 'Personal protective equipment', 'Backup power systems'],
      utilities: ['Reliable electricity', 'Industrial water supply', 'Waste treatment systems', 'Emergency communication'],
      space: 'Processing facility, storage areas, safety zones, administrative offices'
    },
    typicalOperatingHours: '24/7 continuous operation with shift rotations',
    examples: {
      businessPurpose: [
        'To manufacture industrial chemicals safely while protecting the environment and community',
        'To process petrochemical products for regional distribution with zero environmental incidents',
        'To provide essential chemical products for Caribbean industries while maintaining strict safety standards'
      ],
      productsServices: [
        'Industrial chemicals, cleaning agents, and specialty compounds for local industries',
        'Petrochemical products, fuel additives, and polymer materials for regional markets',
        'Chemical processing services, custom formulations, and technical consulting'
      ],
      uniqueSellingPoints: [
        'Advanced safety systems and environmental protection with 24/7 monitoring',
        'Regional expertise in Caribbean climate conditions and regulatory requirements',
        'ISO certified processes with commitment to community safety and environmental stewardship'
      ],
      keyPersonnel: [
        'Plant Manager, Safety Officer, Lead Operator, Environmental Coordinator',
        'Operations Supervisor, Quality Control Manager, Maintenance Lead, Emergency Response Team',
        'Production Manager, Environmental Engineer, Safety Coordinator, Technical Specialists'
      ],
      minimumResourcesExamples: [
        'Core team of 12, basic safety systems, manual monitoring, emergency protocols',
        'Full operational team of 18, automated safety systems, environmental monitoring, backup power',
        'Complete staff of 25, advanced control systems, continuous monitoring, redundant safety systems'
      ],
      customerBase: [
        'Local manufacturing companies, agricultural suppliers, cleaning service providers',
        'Regional industries, shipping companies, construction firms, government facilities',
        'International distributors, specialty manufacturers, research institutions, industrial contractors'
      ]
    }
  },
  {
    id: 'waste_management',
    name: 'Waste Management Facility',
    localName: 'Waste Treatment/Recycling Center',
    category: 'industrial',
    vulnerabilities: [
      { hazardId: 'waste_management_failure', defaultRiskLevel: 'medium' },
      { hazardId: 'environmental_contamination', defaultRiskLevel: 'medium' },
      { hazardId: 'fire', defaultRiskLevel: 'medium' },
      { hazardId: 'water_contamination', defaultRiskLevel: 'low' },
      { hazardId: 'air_pollution', defaultRiskLevel: 'low' },
      { hazardId: 'industrial_accident', defaultRiskLevel: 'medium' }
    ],
    essentialFunctions: {
      core: [
        'Waste collection and sorting',
        'Recycling and processing operations',
        'Environmental monitoring and compliance',
        'Safe disposal of hazardous materials'
      ],
      support: [
        'Fleet maintenance and logistics',
        'Equipment operation and maintenance',
        'Site security and access control',
        'Community relations and education'
      ],
      administrative: [
        'Regulatory compliance and permits',
        'Environmental reporting',
        'Staff safety training',
        'Contract management'
      ]
    },
    criticalSuppliers: [
      'Heavy equipment suppliers',
      'Safety equipment providers',
      'Environmental testing services',
      'Transportation contractors',
      'Hazardous waste disposal specialists',
      'Recycling market buyers'
    ],
    minimumResources: {
      staff: '8-12 staff members (operators, drivers, supervisor, safety coordinator)',
      equipment: ['Collection vehicles', 'Sorting equipment', 'Safety monitoring systems', 'Personal protective equipment'],
      utilities: ['Reliable electricity', 'Water for operations', 'Communication systems', 'Emergency equipment'],
      space: 'Processing facility, storage areas, vehicle depot, administrative building'
    },
    typicalOperatingHours: 'Monday-Saturday 6:00 AM - 6:00 PM, Emergency response 24/7',
    examples: {
      businessPurpose: [
        'To provide comprehensive waste management services while protecting public health and environment',
        'To promote recycling and sustainable waste practices in [AREA] communities',
        'To safely manage industrial and municipal waste with focus on environmental protection'
      ],
      productsServices: [
        'Municipal waste collection, recycling services, and hazardous waste disposal',
        'Commercial waste management, construction debris removal, and electronic waste recycling',
        'Industrial waste treatment, environmental remediation services, and sustainability consulting'
      ],
      uniqueSellingPoints: [
        'Licensed facility with advanced environmental controls and community commitment',
        'Comprehensive recycling programs reducing landfill waste by 60%',
        'Emergency response capability with specialized equipment for hazardous material incidents'
      ],
      keyPersonnel: [
        'Facility Manager, Environmental Officer, Operations Supervisor, Safety Coordinator',
        'Plant Supervisor, Fleet Manager, Quality Control Inspector, Community Liaison',
        'General Manager, Environmental Engineer, Maintenance Lead, Emergency Response Team'
      ],
      minimumResourcesExamples: [
        'Basic team of 8, manual sorting, 2 collection vehicles, standard safety equipment',
        'Operational team of 12, semi-automated sorting, 4 vehicles, environmental monitoring',
        'Full team of 18, automated systems, 6+ vehicles, advanced monitoring and safety systems'
      ],
      customerBase: [
        'Municipal governments, local businesses, residential communities, schools',
        'Commercial properties, construction companies, manufacturing facilities, hotels',
        'Industrial clients, government facilities, healthcare institutions, large corporations'
      ]
    }
  },
  {
    id: 'water_treatment',
    name: 'Water Treatment Plant',
    localName: 'Water/Wastewater Treatment Facility',
    category: 'industrial',
    vulnerabilities: [
      { hazardId: 'water_contamination', defaultRiskLevel: 'medium' },
      { hazardId: 'chemical_spill', defaultRiskLevel: 'low' },
      { hazardId: 'power_outage', defaultRiskLevel: 'high' },
      { hazardId: 'equipment_failure', defaultRiskLevel: 'medium' },
      { hazardId: 'environmental_contamination', defaultRiskLevel: 'medium' },
      { hazardId: 'hurricane', defaultRiskLevel: 'high' }
    ],
    essentialFunctions: {
      core: [
        'Water purification and treatment',
        'Quality monitoring and testing',
        'Distribution system management',
        'Emergency water supply provision'
      ],
      support: [
        'Equipment maintenance and calibration',
        'Chemical storage and handling',
        'Pump station operations',
        'System monitoring and control'
      ],
      administrative: [
        'Regulatory compliance and reporting',
        'Water quality documentation',
        'Staff certification management',
        'Emergency response coordination'
      ]
    },
    criticalSuppliers: [
      'Water treatment chemical suppliers',
      'Laboratory testing services',
      'Equipment maintenance contractors',
      'Emergency generator services',
      'Specialized repair services',
      'Water quality monitoring equipment'
    ],
    minimumResources: {
      staff: '6-10 certified operators (water treatment operators, lab technician, supervisor)',
      equipment: ['Treatment systems', 'Testing equipment', 'Emergency generators', 'Monitoring systems'],
      utilities: ['Reliable electricity', 'Raw water source', 'Chemical storage', 'Communication systems'],
      space: 'Treatment facility, laboratory, chemical storage, control room'
    },
    typicalOperatingHours: '24/7 continuous operation with operator coverage',
    examples: {
      businessPurpose: [
        'To provide safe, clean drinking water to [AREA] communities meeting all health standards',
        'To treat wastewater protecting public health and environmental quality in [REGION]',
        'To ensure reliable water supply during emergencies and maintain community health standards'
      ],
      productsServices: [
        'Potable water treatment, distribution system management, and water quality monitoring',
        'Wastewater treatment, environmental compliance, and effluent quality management',
        'Emergency water services, system maintenance, and community health protection'
      ],
      uniqueSellingPoints: [
        'State-of-the-art treatment technology exceeding Caribbean health standards',
        'Certified operators with emergency response capability and backup systems',
        'Community-focused service with transparent water quality reporting and education'
      ],
      keyPersonnel: [
        'Plant Supervisor, Senior Operator, Lab Technician, Maintenance Specialist',
        'Operations Manager, Certified Operators (2-3), Quality Control Coordinator',
        'Plant Manager, Senior Staff (4-5), Environmental Specialist, Emergency Coordinator'
      ],
      minimumResourcesExamples: [
        'Core team of 6, basic treatment systems, manual monitoring, standard backup power',
        'Operational team of 8, automated systems, continuous monitoring, enhanced backup systems',
        'Full team of 12, advanced treatment technology, redundant systems, comprehensive emergency plans'
      ],
      customerBase: [
        'Municipal water systems, residential communities, local businesses, government facilities',
        'Regional water authorities, industrial clients, healthcare facilities, educational institutions',
        'Multi-community systems, large industrial users, emergency services, tourism facilities'
      ]
    }
  }
]

export const getIndustryProfile = (id: string): IndustryProfile | undefined => {
  return industryProfiles.find(profile => profile.id === id)
}

export const getIndustriesByCategory = (category: string): IndustryProfile[] => {
  return industryProfiles.filter(profile => profile.category === category)
} 
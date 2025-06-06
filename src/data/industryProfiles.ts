import { IndustryProfile } from './types'

export const industryProfiles: IndustryProfile[] = [
  {
    id: 'grocery_store',
    name: 'Grocery Store',
    localName: 'Local Grocery/Mini-Mart',
    category: 'retail',
    commonHazards: ['hurricane', 'flash_flood', 'power_outage', 'supply_disruption', 'economic_downturn', 'crime'],
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
    commonHazards: ['hurricane', 'flash_flood', 'power_outage', 'supply_disruption', 'fire', 'pandemic', 'economic_downturn'],
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
    name: 'Beauty Salon',
    localName: 'Hair Salon/Beauty Parlour',
    category: 'services',
    commonHazards: ['hurricane', 'power_outage', 'flash_flood', 'economic_downturn', 'supply_disruption', 'staff_unavailable'],
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
  }
]

export const getIndustryProfile = (id: string): IndustryProfile | undefined => {
  return industryProfiles.find(profile => profile.id === id)
}

export const getIndustriesByCategory = (category: string): IndustryProfile[] => {
  return industryProfiles.filter(profile => profile.category === category)
} 
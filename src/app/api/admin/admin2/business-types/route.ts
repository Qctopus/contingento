import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mock data for typical Jamaica SME business types (fallback)
const mockBusinessTypes = [
  {
    id: '1',
    businessTypeId: 'restaurant',
    name: 'Restaurant',
    category: 'hospitality',
    subcategory: 'Food Service',
    description: 'Local restaurants serving Jamaican cuisine and international food',
    typicalRevenue: 'JMD 5M-25M annually',
    typicalEmployees: '8-25 employees',
    operatingHours: '11:00 AM - 11:00 PM',
    seasonalityFactor: 1.3,
    touristDependency: 7,
    supplyChainComplexity: 6,
    digitalDependency: 4,
    cashFlowPattern: 'seasonal',
    physicalAssetIntensity: 6,
    customerConcentration: 4,
    regulatoryBurden: 5,
    riskVulnerabilities: [
      { riskType: 'hurricane', vulnerabilityLevel: 8, impactSeverity: 9 },
      { riskType: 'powerOutage', vulnerabilityLevel: 9, impactSeverity: 8 },
      { riskType: 'flood', vulnerabilityLevel: 6, impactSeverity: 7 }
    ],
    strategies: []
  },
  {
    id: '2',
    businessTypeId: 'grocery_store',
    name: 'Grocery Store',
    category: 'retail',
    subcategory: 'Food Retail',
    description: 'Small to medium grocery stores and supermarkets',
    typicalRevenue: 'JMD 10M-50M annually',
    typicalEmployees: '6-20 employees',
    operatingHours: '7:00 AM - 10:00 PM',
    seasonalityFactor: 1.1,
    touristDependency: 3,
    supplyChainComplexity: 8,
    digitalDependency: 5,
    cashFlowPattern: 'stable',
    physicalAssetIntensity: 7,
    customerConcentration: 2,
    regulatoryBurden: 4,
    riskVulnerabilities: [
      { riskType: 'powerOutage', vulnerabilityLevel: 10, impactSeverity: 9 },
      { riskType: 'hurricane', vulnerabilityLevel: 7, impactSeverity: 8 },
      { riskType: 'flood', vulnerabilityLevel: 5, impactSeverity: 6 }
    ],
    strategies: []
  },
  {
    id: '3',
    businessTypeId: 'small_hotel',
    name: 'Small Hotel/Guesthouse',
    category: 'hospitality',
    subcategory: 'Accommodation',
    description: 'Boutique hotels, guesthouses, and bed & breakfasts',
    typicalRevenue: 'JMD 8M-40M annually',
    typicalEmployees: '5-15 employees',
    operatingHours: '24/7',
    seasonalityFactor: 1.8,
    touristDependency: 9,
    supplyChainComplexity: 4,
    digitalDependency: 6,
    cashFlowPattern: 'seasonal',
    physicalAssetIntensity: 8,
    customerConcentration: 6,
    regulatoryBurden: 6,
    riskVulnerabilities: [
      { riskType: 'hurricane', vulnerabilityLevel: 9, impactSeverity: 10 },
      { riskType: 'powerOutage', vulnerabilityLevel: 8, impactSeverity: 9 },
      { riskType: 'flood', vulnerabilityLevel: 7, impactSeverity: 8 }
    ],
    strategies: []
  },
  {
    id: '4',
    businessTypeId: 'auto_repair',
    name: 'Auto Repair Shop',
    category: 'services',
    subcategory: 'Automotive',
    description: 'Vehicle maintenance and repair services',
    typicalRevenue: 'JMD 3M-15M annually',
    typicalEmployees: '3-10 employees',
    operatingHours: '7:00 AM - 6:00 PM',
    seasonalityFactor: 1.0,
    touristDependency: 2,
    supplyChainComplexity: 7,
    digitalDependency: 3,
    cashFlowPattern: 'stable',
    physicalAssetIntensity: 6,
    customerConcentration: 3,
    regulatoryBurden: 3,
    riskVulnerabilities: [
      { riskType: 'powerOutage', vulnerabilityLevel: 6, impactSeverity: 5 },
      { riskType: 'hurricane', vulnerabilityLevel: 5, impactSeverity: 6 },
      { riskType: 'flood', vulnerabilityLevel: 4, impactSeverity: 7 }
    ],
    strategies: []
  },
  {
    id: '5',
    businessTypeId: 'beauty_salon',
    name: 'Beauty Salon/Barbershop',
    category: 'services',
    subcategory: 'Personal Care',
    description: 'Hair salons, barbershops, and beauty services',
    typicalRevenue: 'JMD 2M-8M annually',
    typicalEmployees: '2-8 employees',
    operatingHours: '9:00 AM - 7:00 PM',
    seasonalityFactor: 1.2,
    touristDependency: 4,
    supplyChainComplexity: 3,
    digitalDependency: 2,
    cashFlowPattern: 'stable',
    physicalAssetIntensity: 4,
    customerConcentration: 2,
    regulatoryBurden: 2,
    riskVulnerabilities: [
      { riskType: 'powerOutage', vulnerabilityLevel: 8, impactSeverity: 6 },
      { riskType: 'hurricane', vulnerabilityLevel: 4, impactSeverity: 5 },
      { riskType: 'flood', vulnerabilityLevel: 3, impactSeverity: 4 }
    ],
    strategies: []
  },
  {
    id: '6',
    businessTypeId: 'craft_vendor',
    name: 'Craft Vendor/Artisan',
    category: 'retail',
    subcategory: 'Handicrafts',
    description: 'Local artisans selling crafts, artwork, and handmade goods',
    typicalRevenue: 'JMD 1M-5M annually',
    typicalEmployees: '1-5 employees',
    operatingHours: 'Variable',
    seasonalityFactor: 2.0,
    touristDependency: 9,
    supplyChainComplexity: 2,
    digitalDependency: 1,
    cashFlowPattern: 'volatile',
    physicalAssetIntensity: 2,
    customerConcentration: 8,
    regulatoryBurden: 1,
    riskVulnerabilities: [
      { riskType: 'hurricane', vulnerabilityLevel: 6, impactSeverity: 8 },
      { riskType: 'drought', vulnerabilityLevel: 7, impactSeverity: 6 },
      { riskType: 'powerOutage', vulnerabilityLevel: 2, impactSeverity: 3 }
    ],
    strategies: []
  }
]

export async function GET() {
  try {
    // Try to fetch from database first
    const businessTypes = await prisma.businessType.findMany({
      where: { isActive: true },
      include: {
        BusinessRiskVulnerability: true
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    if (businessTypes.length > 0) {
      // Transform database data to match frontend expectations
      const transformedBusinessTypes = businessTypes.map(bt => ({
        id: bt.id,
        businessTypeId: bt.businessTypeId,
        name: bt.name,
        category: bt.category,
        subcategory: bt.subcategory,
        description: bt.description,
        typicalRevenue: bt.typicalRevenue,
        typicalEmployees: bt.typicalEmployees,
        operatingHours: bt.operatingHours,
        seasonalityFactor: bt.seasonalityFactor,
        touristDependency: bt.touristDependency || 0,
        supplyChainComplexity: bt.supplyChainComplexity || 0,
        digitalDependency: bt.digitalDependency || 0,
        cashFlowPattern: bt.cashFlowPattern,
        physicalAssetIntensity: bt.physicalAssetIntensity,
        customerConcentration: bt.customerConcentration,
        regulatoryBurden: bt.regulatoryBurden,
        riskVulnerabilities: bt.BusinessRiskVulnerability.map(rv => ({
          riskType: rv.riskType,
          vulnerabilityLevel: rv.vulnerabilityLevel,
          impactSeverity: rv.impactSeverity
        })),
        strategies: []
      }))

      return NextResponse.json(transformedBusinessTypes)
    } else {
      // Fallback to mock data if database is empty
      console.log('No business types found in database, using mock data')
      return NextResponse.json(mockBusinessTypes)
    }
  } catch (error) {
    console.error('Error fetching business types:', error)
    // Fallback to mock data on error
    return NextResponse.json(mockBusinessTypes)
  } finally {
    await prisma.$disconnect()
  }
}


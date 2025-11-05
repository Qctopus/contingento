/**
 * CLEAN WIZARD FILLER
 * 
 * This script fills the wizard EXACTLY as a user would:
 * 1. Sets industry and location (triggers database loading of risks/strategies)
 * 2. Fills business info sections with sample data
 * 3. Does NOT hardcode risks or strategies
 * 4. Lets the wizard components load everything from the database
 * 
 * Usage:
 * 1. Open wizard in browser
 * 2. Press F12 to open console
 * 3. Copy and paste this entire script
 * 4. Press Enter
 */

(function fillWizardClean() {
  console.log('🎯 Filling wizard with CLEAN data (no hardcoded risks/strategies)...')
  
  // Basic business information only - risks/strategies come from database
  const formData = {
    
    BUSINESS_PROFILE: {
      'Business Name': 'Caribbean Resort & Spa Ltd.',
      'Business Address': '123 Ocean Drive, Christ Church, Barbados BB17000',
      'Owner/Manager Name': 'Sarah Johnson',
      'Position/Title': 'General Manager',
      'Contact Phone': '+1 (246) 555-0123',
      'Contact Email': 'sjohnson@caribbeanresort.bb',
      'Emergency Contact Name': 'Michael Chen',
      'Emergency Contact Phone': '+1 (246) 555-0124',
      'Business Purpose': 'Caribbean Resort & Spa Ltd. provides luxury beachfront accommodation, fine dining experiences, full-service spa treatments, and water sports activities to international tourists seeking authentic Caribbean hospitality. Our mission is to deliver exceptional guest experiences while maintaining sustainable operations and contributing to the local Barbadian community through employment and partnerships with local suppliers.',
      'Key Products/Services': '150 luxury rooms and suites with ocean or garden views; Three restaurants (fine dining, casual beachfront grill, poolside bar); Full-service spa with 8 treatment rooms offering massages, facials, and wellness programs; Water sports center with kayaking, paddleboarding, snorkeling, and diving; Conference and event facilities for up to 200 guests; Wedding planning and coordination services; Guided island tours and excursions; 24-hour concierge and guest services.',
      'Number of Employees': '60 (45 full-time, 15 part-time seasonal)',
      'Years in Operation': '12'
    },
    
    CONTACTS: {
      'Staff Contacts': [
        { 'Name': 'Sarah Johnson', 'Position': 'General Manager', 'Phone': '+1 (246) 555-0123', 'Email': 'sjohnson@caribbeanresort.bb' },
        { 'Name': 'Michael Chen', 'Position': 'Operations Manager', 'Phone': '+1 (246) 555-0124', 'Email': 'mchen@caribbeanresort.bb' },
        { 'Name': 'Patricia Williams', 'Position': 'Finance Director', 'Phone': '+1 (246) 555-0125', 'Email': 'pwilliams@caribbeanresort.bb' },
        { 'Name': 'David Martinez', 'Position': 'Marketing Director', 'Phone': '+1 (246) 555-0126', 'Email': 'dmartinez@caribbeanresort.bb' },
        { 'Name': 'Lisa Thompson', 'Position': 'Executive Chef', 'Phone': '+1 (246) 555-0127', 'Email': 'lthompson@caribbeanresort.bb' }
      ],
      'Emergency Services and Utilities': [
        { 'Service': 'Fire Department', 'Phone': '911', 'Contact Person': 'Christ Church Fire Station', 'Address': '100 Fire Station Road, Christ Church' },
        { 'Service': 'Police', 'Phone': '211', 'Contact Person': 'Christ Church Police', 'Address': '50 Police Road, Christ Church' },
        { 'Service': 'Ambulance', 'Phone': '511', 'Contact Person': 'Queen Elizabeth Hospital', 'Address': 'Martindales Road, St. Michael' },
        { 'Service': 'Barbados Light & Power', 'Phone': '1 (246) 628-7000', 'Contact Person': 'Emergency Outage Line', 'Email': 'customerservice@blpc.com.bb' },
        { 'Service': 'Barbados Water Authority', 'Phone': '1 (246) 434-4300', 'Contact Person': 'Emergency Water Line', 'Email': 'bwa@caribsurf.com' },
        { 'Service': 'Insurance (Property)', 'Phone': '1 (246) 555-8000', 'Contact Person': 'Caribbean Insurance Ltd.', 'Email': 'claims@caribinsurance.bb' }
      ],
      'Supplier Information': [
        { 'Name': 'Caribbean Food Distributors', 'Phone': '+1 (246) 555-2001', 'Email': 'orders@caribfood.bb', 'Service': 'Daily produce and dry goods', 'Address': '25 Industrial Park, St. Michael' },
        { 'Name': 'Atlantic Linen Services', 'Phone': '+1 (246) 555-2002', 'Email': 'service@atlanticlinens.bb', 'Service': 'Daily linen and towel service', 'Address': '12 Laundry Lane, Christ Church' },
        { 'Name': 'Island Power Solutions', 'Phone': '+1 (246) 555-2003', 'Email': 'support@islandpower.bb', 'Service': 'Generator maintenance and fuel', 'Address': '88 Power Road, St. Philip' },
        { 'Name': 'TechCare IT Solutions', 'Phone': '+1 (246) 555-2004', 'Email': '24x7@techcare.bb', 'Service': '24/7 IT support and systems', 'Address': '5 Tech Park, Warrens' }
      ],
      'Key Customer Contacts': [
        { 'Name': 'Elite Travel Partners', 'Phone': '+1 (246) 555-3001', 'Email': 'bookings@elitetravel.com', 'Service': 'Major booking partner (30% of reservations)' },
        { 'Name': 'Caribbean Wedding Planners', 'Phone': '+1 (246) 555-3002', 'Email': 'events@caribweddings.bb', 'Service': 'Destination wedding coordinator' },
        { 'Name': 'Global Corporate Retreats', 'Phone': '+1 (246) 555-3003', 'Email': 'corporate@globalretreats.com', 'Service': 'Corporate group bookings' }
      ]
    },
    
    TESTING: {
      'Testing Schedule': [
        { 'Test Name': 'Tabletop exercise', 'Frequency': 'Quarterly', 'Last Completed': '2024-10-15', 'Notes': 'Walk through emergency scenarios with management team' },
        { 'Test Name': 'Fire drill', 'Frequency': 'Bi-annual', 'Last Completed': '2024-09-20', 'Notes': 'Full property evacuation drill with all staff and guests' },
        { 'Test Name': 'Emergency response procedures', 'Frequency': 'Quarterly for all staff', 'Last Completed': '2024-11-01', 'Notes': 'Training on emergency contacts, evacuation routes, guest safety' },
        { 'Test Name': 'First aid and CPR certification', 'Frequency': 'Annual certification', 'Last Completed': '2024-08-15', 'Notes': 'All managers and key staff certified in first aid' }
      ],
      'Improvements Needed': [
        { 'Issue': 'Last fire drill evacuation took 12 minutes (target: under 10)', 'Priority': 'High', 'Due Date': '2025-01-30' },
        { 'Issue': 'Three supplier contacts were outdated during annual verification', 'Priority': 'Medium', 'Due Date': '2024-12-15' },
        { 'Issue': 'Backup generator #2 failed to start during monthly test', 'Priority': 'Critical', 'Due Date': '2024-12-01' }
      ]
    }
  }
  
  // Industry and location settings - this is what triggers the database loading
  const preFillData = {
    industry: {
      id: 'hospitality_tourism',
      name: 'Hospitality & Tourism',
      businessTypeId: 'hotel_resort'
    },
    location: {
      country: 'Barbados',
      countryCode: 'BB',
      parish: 'Christ Church',
      nearCoast: true,
      urbanArea: true,
      adminLevel2: 'Christ Church'
    },
    businessCharacteristics: {
      employeeCount: '50-100',
      annualRevenue: '1m-5m',
      hasPhysicalLocation: true,
      hasOnlinePresence: true,
      hasInventory: true,
      dependsOnSupplyChain: true,
      hasCustomerData: true,
      usesCloudServices: true,
      isCoastal: true
    },
    // NO hardcoded hazards - let the wizard load from database
    hazards: [],
    // NO hardcoded strategies - let the wizard load from database
    recommendedStrategies: [],
    // Empty preFilledFields - let wizard components do their job
    preFilledFields: {}
  }
  
  try {
    // Clear any old data first
    localStorage.removeItem('bcp-draft')
    localStorage.removeItem('bcp-prefill-data')
    localStorage.removeItem('bcp-industry-selected')
    
    // Save the clean data
    localStorage.setItem('bcp-draft', JSON.stringify(formData))
    localStorage.setItem('bcp-prefill-data', JSON.stringify(preFillData))
    localStorage.setItem('bcp-industry-selected', 'true')
    
    console.log('✅ CLEAN DATA SAVED!')
    console.log('')
    console.log('📦 What was saved:')
    console.log('  ✅ Business Profile (Caribbean Resort & Spa Ltd.)')
    console.log('  ✅ Contacts (Staff, Emergency, Suppliers, Customers)')
    console.log('  ✅ Testing Schedule and Improvements')
    console.log('  ✅ Industry: Hospitality & Tourism')
    console.log('  ✅ Location: Christ Church, Barbados (coastal)')
    console.log('')
    console.log('🔄 What happens next:')
    console.log('  1. Refresh the page')
    console.log('  2. Wizard will LOAD RISKS from database based on:')
    console.log('     - Industry: Hospitality & Tourism')
    console.log('     - Location: Christ Church, Barbados (coastal)')
    console.log('     - Business characteristics')
    console.log('  3. You select which risks apply')
    console.log('  4. Wizard will LOAD STRATEGIES from database')
    console.log('  5. You select which strategies to implement')
    console.log('  6. Final plan shows ONLY what you selected')
    console.log('')
    console.log('⚠️ NO HARDCODED RISKS OR STRATEGIES!')
    console.log('   Everything comes from the admin database.')
    console.log('')
    console.log('🔄 Refreshing page in 2 seconds...')
    
    setTimeout(() => window.location.reload(), 2000)
    
    return {
      success: true,
      message: 'Clean data loaded - wizard will load risks/strategies from database'
    }
  } catch (error) {
    console.error('❌ Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})()



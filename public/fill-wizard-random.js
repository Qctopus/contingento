/**
 * RANDOM WIZARD FILLER
 * Randomly selects location, business type, and multiplier answers
 * Then fills all wizard questions with sample data for testing
 */

(async function fillWizardRandom() {
  console.log('🎲 Starting random wizard fill...')
  
  try {
    // Step 1: Fetch available data
    console.log('📡 Fetching available options...')
    const [businessTypesRes, countriesRes, multipliersRes] = await Promise.all([
      fetch('/api/admin2/business-types'),
      fetch('/api/admin2/countries?activeOnly=true'),
      fetch('/api/admin2/multipliers?activeOnly=true')
    ])
    
    if (!businessTypesRes.ok) {
      throw new Error(`Business types API failed: ${businessTypesRes.status}`)
    }
    if (!countriesRes.ok) {
      throw new Error(`Countries API failed: ${countriesRes.status}`)
    }
    if (!multipliersRes.ok) {
      console.warn(`⚠️ Multipliers API failed: ${multipliersRes.status}, continuing without multipliers`)
    }
    
    const businessTypes = await businessTypesRes.json()
    const countriesData = await countriesRes.json()
    const multipliersData = multipliersRes.ok ? await multipliersRes.json() : { success: false, data: [] }
    
    console.log('📊 API Responses:', {
      businessTypes: businessTypes,
      countriesData: countriesData,
      multipliersData: multipliersData
    })
    
    // Handle different response formats
    let businessTypesList = []
    if (businessTypes.success && Array.isArray(businessTypes.data)) {
      businessTypesList = businessTypes.data
    } else if (Array.isArray(businessTypes)) {
      businessTypesList = businessTypes
    } else if (businessTypes.data && Array.isArray(businessTypes.data)) {
      businessTypesList = businessTypes.data
    }
    
    let countries = []
    if (countriesData.success && Array.isArray(countriesData.data)) {
      countries = countriesData.data
    } else if (Array.isArray(countriesData)) {
      countries = countriesData
    } else if (countriesData.countries && Array.isArray(countriesData.countries)) {
      countries = countriesData.countries
    }
    
    let multipliers = []
    if (multipliersData.success) {
      multipliers = multipliersData.data || multipliersData.multipliers || []
    } else if (Array.isArray(multipliersData)) {
      multipliers = multipliersData
    } else if (multipliersData.multipliers && Array.isArray(multipliersData.multipliers)) {
      multipliers = multipliersData.multipliers
    }
    
    if (!businessTypesList || businessTypesList.length === 0) {
      throw new Error('No business types available. Please ensure business types are seeded in the database.')
    }
    if (!countries || countries.length === 0) {
      throw new Error('No countries available. Please ensure countries are seeded in the database.')
    }
    
    console.log(`📊 Found ${businessTypesList.length} business types, ${countries.length} countries, ${multipliers.length} multipliers`)
    
    // Step 2: Randomly select business type
    const randomBusinessType = businessTypesList[Math.floor(Math.random() * businessTypesList.length)]
    console.log(`✅ Selected business type: ${randomBusinessType.name} (${randomBusinessType.businessTypeId})`)
    
    // Step 3: Randomly select country and parish
    const randomCountry = countries[Math.floor(Math.random() * countries.length)]
    console.log(`✅ Selected country: ${randomCountry.name} (${randomCountry.code})`)
    
    // Fetch admin units for this country
    const adminUnitsRes = await fetch(`/api/admin2/admin-units?countryId=${randomCountry.id}&activeOnly=true`)
    const adminUnitsData = await adminUnitsRes.json()
    const adminUnits = adminUnitsData.success ? adminUnitsData.data : adminUnitsData
    
    let selectedParish = null
    let selectedAdminUnit = null
    
    if (adminUnits && adminUnits.length > 0) {
      selectedAdminUnit = adminUnits[Math.floor(Math.random() * adminUnits.length)]
      selectedParish = selectedAdminUnit.name
      console.log(`✅ Selected parish: ${selectedParish}`)
    } else {
      console.log('⚠️ No parishes found, using country name')
      selectedParish = randomCountry.name
    }
    
    // Randomly determine coastal and urban
    const nearCoast = Math.random() > 0.5
    const urbanArea = Math.random() > 0.5
    
    const location = {
      country: randomCountry.name,
      countryCode: randomCountry.code,
      parish: selectedParish,
      nearCoast: nearCoast,
      urbanArea: urbanArea
    }
    
    console.log(`📍 Location: ${location.parish}, ${location.country} (Coastal: ${nearCoast}, Urban: ${urbanArea})`)
    
    // Step 4: Randomly answer multiplier questions
    const businessCharacteristics = {}
    
    // Filter multipliers that have wizard questions
    const multipliersWithQuestions = (multipliers || []).filter(m => m && m.wizardQuestion && m.isActive)
    console.log(`📋 Found ${multipliersWithQuestions.length} multiplier questions`)
    
    for (const multiplier of multipliersWithQuestions) {
      const charType = multiplier.characteristicType
      const conditionType = multiplier.conditionType
      
      if (conditionType === 'boolean') {
        // Random boolean
        businessCharacteristics[charType] = Math.random() > 0.5
      } else if (conditionType === 'threshold') {
        // Random number above threshold
        const threshold = multiplier.thresholdValue || 50
        businessCharacteristics[charType] = Math.floor(Math.random() * (100 - threshold + 1)) + threshold
      } else if (conditionType === 'range') {
        // Random number in range
        const min = multiplier.minValue || 0
        const max = multiplier.maxValue || 100
        businessCharacteristics[charType] = Math.floor(Math.random() * (max - min + 1)) + min
      }
    }
    
    // Add location characteristics
    businessCharacteristics.location_coastal = nearCoast
    businessCharacteristics.location_urban = urbanArea
    businessCharacteristics.location_flood_prone = Math.random() > 0.7
    
    console.log(`✅ Answered ${Object.keys(businessCharacteristics).length} multiplier questions`)
    
    // Step 5: Call prepare-prefill-data API
    console.log('📡 Calling prepare-prefill-data API...')
    const prefillResponse = await fetch('/api/wizard/prepare-prefill-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessTypeId: randomBusinessType.businessTypeId,
        location: location,
        businessCharacteristics: businessCharacteristics,
        locale: 'en'
      })
    })
    
    if (!prefillResponse.ok) {
      throw new Error(`Prefill API failed: ${prefillResponse.status}`)
    }
    
    const preFillData = await prefillResponse.json()
    console.log('✅ Prefill data generated')
    
    // Step 6: Fill all wizard questions with sample data
    const formData = {
      PLAN_INFORMATION: {
        'Company Name': `Sample ${randomBusinessType.name}`,
        'Business Address': `123 Main Street, ${location.parish}, ${location.country}`,
        'Plan Manager': 'John Smith, Owner',
        'Alternate Manager': 'Jane Doe, Manager',
        'Physical Plan Location': 'Fire-proof safe in office',
        'Digital Plan Location': 'Cloud storage with backup',
        'Plan Version': '1.0',
        'Next Review Date': '2026-01-15'
      },
      
      BUSINESS_OVERVIEW: {
        'Business License Number': 'LIC-2024-001',
        'Business Purpose': `Sample ${randomBusinessType.name} business providing quality products and services to the local community.`,
        'Products and Services': 'Various products and services tailored to customer needs.',
        'Service Delivery Methods': 'In-person service delivery at physical location.',
        'Operating Hours': 'Monday to Friday, 9 AM to 5 PM',
        'Key Personnel Involved': 'Owner, Manager, and key staff members.',
        'Minimum Resource Requirements': 'Essential equipment, staff, and supplies needed for operations.',
        'Customer Base': 'Local customers and community members.',
        'Approximate Annual Revenue': '100k_500k',
        'Total People in Business': '1-5',
        'Years in Operation': '1-5',
        'Service Provider BCP Status': 'none'
      },
      
      ESSENTIAL_FUNCTIONS: {
        'Business Functions': [
          {
            'Business Function': 'Core Operations',
            'Description': 'Primary business operations',
            'Priority Level': 'critical',
            'Maximum Acceptable Downtime': '0-2h',
            'Critical Resources Needed': 'Essential staff and equipment'
          },
          {
            'Business Function': 'Customer Service',
            'Description': 'Customer interaction and support',
            'Priority Level': 'important',
            'Maximum Acceptable Downtime': '2-8h',
            'Critical Resources Needed': 'Customer service staff and communication tools'
          }
        ]
      },
      
      FUNCTION_PRIORITIES: {
        'Function Priorities': [
          {
            'Function': 'Core Operations',
            'Priority': 'Critical',
            'Downtime Tolerance': '0-2 hours',
            'Recovery Time Objective': 'Immediate',
            'Business Impact': 'Complete business shutdown if unavailable'
          }
        ]
      },
      
      RISK_ASSESSMENT: {
        'Risk Assessment Matrix': preFillData.preFilledFields?.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || []
      },
      
      STRATEGIES: {
        'Selected Strategies': preFillData.recommendedStrategies?.map((s) => s.strategyId) || [],
        'Long Term Plan': 'Continue monitoring and improving business continuity plans.'
      },
      
      ACTION_PLAN: {
        'Emergency Team': [
          {
            'Name': 'John Smith',
            'Role': 'Emergency Coordinator',
            'Phone': '555-0101',
            'Alternate Contact': '555-0102',
            'Responsibilities': 'Overall emergency coordination'
          }
        ],
        'Communication Plan': 'Use phone, email, and text messaging for emergency communications.',
        'Evacuation Plan': 'Follow local emergency evacuation procedures.',
        'Work Locations': [
          {
            'Location Name': 'Primary Location',
            'Address': `123 Main Street, ${location.parish}`,
            'Contact': '555-0101',
            'Capacity': 'Full operations',
            'Notes': 'Main business location'
          }
        ]
      },
      
      CONTACTS_AND_INFORMATION: {
        'Staff Contact Information': [
          {
            'Name': 'John Smith',
            'Position': 'Owner/Manager',
            'Phone Number': '555-0101',
            'Email Address': 'john@example.com',
            'Emergency Contact': 'Jane Doe - 555-0102'
          },
          {
            'Name': 'Jane Doe',
            'Position': 'Assistant Manager',
            'Phone Number': '555-0102',
            'Email Address': 'jane@example.com',
            'Emergency Contact': 'John Smith - 555-0101'
          }
        ],
        'Key Customer Contacts': [
          {
            'Customer Name': 'Primary Customer',
            'Type/Notes': 'Main customer - regular orders',
            'Phone Number': '555-0301',
            'Email Address': 'customer@example.com',
            'Special Requirements': 'Priority service required'
          }
        ],
        'Supplier Information': [
          {
            'Supplier Name': 'Main Supplier',
            'Goods/Services Supplied': 'Primary supplies and materials',
            'Phone Number': '555-0201',
            'Email Address': 'supplier@example.com',
            'Backup Supplier': 'Backup Supplier - 555-0202'
          },
          {
            'Supplier Name': 'Equipment Supplier',
            'Goods/Services Supplied': 'Business equipment and maintenance',
            'Phone Number': '555-0203',
            'Email Address': 'equipment@example.com',
            'Backup Supplier': 'Alternative Equipment Co. - 555-0204'
          }
        ],
        'Emergency Services and Utilities': [
          {
            'Service Type': 'Emergency Services',
            'Organization Name': 'Local Emergency Services',
            'Phone Number': '911',
            'Email Address': 'emergency@local.gov',
            'Account Number': 'N/A'
          },
          {
            'Service Type': 'Fire Department',
            'Organization Name': 'Local Fire Department',
            'Phone Number': '911',
            'Email Address': 'fire@local.gov',
            'Account Number': 'N/A'
          },
          {
            'Service Type': 'Police',
            'Organization Name': 'Local Police Department',
            'Phone Number': '911',
            'Email Address': 'police@local.gov',
            'Account Number': 'N/A'
          },
          {
            'Service Type': 'Medical Emergency',
            'Organization Name': 'Local Hospital',
            'Phone Number': '911',
            'Email Address': 'emergency@hospital.local',
            'Account Number': 'N/A'
          },
          {
            'Service Type': 'Electricity',
            'Organization Name': 'Local Power Company',
            'Phone Number': '555-1001',
            'Email Address': 'service@power.local',
            'Account Number': 'ACC-12345'
          },
          {
            'Service Type': 'Water',
            'Organization Name': 'Local Water Authority',
            'Phone Number': '555-1002',
            'Email Address': 'service@water.local',
            'Account Number': 'ACC-67890'
          }
        ],
        'Critical Business Information': `Business Registration: REG-2024-001; Property: Owned/Leased at ${location.parish}; Insurance: Policy #INS-12345; Banking: Main Account #ACC-123456; Tax ID: TAX-123456789; Licenses: Business License #LIC-2024-001; Critical Contracts: Supplier agreements, equipment leases; Employee Records: HR system with backup; Customer Database: Cloud-based with daily backups.`,
        'Plan Distribution List': [
          {
            'Name/Position': 'John Smith (Owner)',
            'Format Received': 'Electronic + Hard copy',
            'Date Provided': new Date().toISOString().split('T')[0],
            'Version Number': '1.0',
            'Acknowledgment': 'Signed and filed'
          }
        ]
      },
      
      VITAL_RECORDS: {
        'Vital Records Inventory': [
          {
            'Record Type': 'Financial Records',
            'Primary Location': 'Secure office safe',
            'Backup Location': 'Cloud storage + Accountant office',
            'Recovery Priority': 'HIGH'
          },
          {
            'Record Type': 'Employee Records',
            'Primary Location': 'HR office + Digital system',
            'Backup Location': 'Cloud backup + External drive in safe',
            'Recovery Priority': 'HIGH'
          },
          {
            'Record Type': 'Business Registration and Licenses',
            'Primary Location': 'Office safe',
            'Backup Location': 'Cloud storage + Attorney office',
            'Recovery Priority': 'HIGH'
          },
          {
            'Record Type': 'Insurance Policies',
            'Primary Location': 'Office safe',
            'Backup Location': 'Cloud storage + Insurance agent',
            'Recovery Priority': 'HIGH'
          },
          {
            'Record Type': 'Customer Database',
            'Primary Location': 'Cloud-based system',
            'Backup Location': 'Daily automated backups + Weekly offline backup',
            'Recovery Priority': 'HIGH'
          },
          {
            'Record Type': 'Supplier Contracts',
            'Primary Location': 'Digital storage + Physical copies',
            'Backup Location': 'Cloud backup',
            'Recovery Priority': 'MEDIUM'
          },
          {
            'Record Type': 'Emergency Contact Lists',
            'Primary Location': 'Digital + Physical in emergency kits',
            'Backup Location': 'Cloud backup + Printed copies',
            'Recovery Priority': 'HIGH'
          },
          {
            'Record Type': 'Tax Records',
            'Primary Location': 'Office files + Digital',
            'Backup Location': 'Accountant office + Cloud storage',
            'Recovery Priority': 'HIGH'
          }
        ]
      },
      
      TESTING_AND_MAINTENANCE: {
        'Plan Testing Schedule': [
          {
            'Test Type': 'Tabletop exercise',
            'What is Tested': 'Emergency response coordination',
            'Frequency': 'Quarterly',
            'Next Test Date': new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            'Success Criteria': 'All team members respond within 30 minutes, key decisions made',
            'Responsible Person': 'John Smith (Owner)'
          },
          {
            'Test Type': 'Communication test',
            'What is Tested': 'Emergency notification system',
            'Frequency': 'Monthly',
            'Next Test Date': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            'Success Criteria': '95% of staff respond within 20 minutes',
            'Responsible Person': 'Jane Doe (Assistant Manager)'
          },
          {
            'Test Type': 'Full simulation',
            'What is Tested': 'Complete emergency scenario',
            'Frequency': 'Annual',
            'Next Test Date': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            'Success Criteria': 'All procedures followed correctly',
            'Responsible Person': 'John Smith (Owner)'
          }
        ],
        'Plan Revision History': [
          {
            'Version': '1.0',
            'Date Updated': new Date().toISOString().split('T')[0],
            'Changes Made': 'Initial business continuity plan creation',
            'Updated By': 'John Smith (Owner)',
            'Reason for Update': 'New comprehensive business continuity plan'
          }
        ],
        'Training Schedule': [
          {
            'Training Topic': 'Emergency Procedures',
            'Who Needs Training': 'All staff',
            'Frequency': 'Annual',
            'Next Training Date': new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            'Training Method': 'In-person workshop',
            'Responsible Person': 'John Smith (Owner)'
          },
          {
            'Training Topic': 'Business Continuity Basics',
            'Who Needs Training': 'Management team',
            'Frequency': 'Semi-annual',
            'Next Training Date': new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            'Training Method': 'Online course + discussion',
            'Responsible Person': 'Jane Doe (Assistant Manager)'
          }
        ],
        'Metrics and KPIs': 'Track recovery time objectives (RTO), recovery point objectives (RPO), business impact assessments, plan effectiveness, staff response times, and testing completion rates.',
        'Improvement Plan': 'Regular review after each test to identify gaps and improvements. Update procedures based on lessons learned. Ensure all staff are aware of changes.',
        'Review Process': 'Annual comprehensive review of business continuity plan. Quarterly review of testing results and metrics. Monthly review of contact information updates.'
      }
    }
    
    // Step 7: Save to localStorage
    localStorage.setItem('bcp-draft', JSON.stringify(formData))
    localStorage.setItem('bcp-industry-selected', 'true')
    localStorage.setItem('bcp-prefill-data', JSON.stringify(preFillData))
    
    console.log('✅ Random wizard data saved successfully!')
    console.log(`📊 Selected: ${randomBusinessType.name} in ${location.parish}, ${location.country}`)
    console.log(`📋 Risks: ${preFillData.hazards?.length || 0} hazards`)
    console.log(`🎯 Strategies: ${preFillData.recommendedStrategies?.length || 0} recommended`)
    console.log('\n🔄 Refreshing page in 2 seconds...')
    
    setTimeout(() => {
      window.location.reload()
    }, 2000)
    
  } catch (error) {
    console.error('❌ Error filling wizard:', error)
    console.error('Error stack:', error.stack)
    alert(`Error: ${error.message}\n\nCheck browser console (F12) for more details.`)
    throw error // Re-throw so DevDataFiller can catch it
  }
})()


// Simple test script for PDF generation
const testPDFGeneration = async () => {
  const samplePlanData = {
    PLAN_INFORMATION: {
      'Company Name': 'Test Tourism Company',
      'Plan Version': '1.0',
      'Date Created': '2024-01-15',
      'Last Updated': '2024-01-15',
      'Approved By': 'John Doe, General Manager',
      'Next Review Date': '2024-07-15'
    },
    BUSINESS_OVERVIEW: {
      'Business Purpose': 'Tourism resort and restaurant services',
      'Products & Services': 'Hotel accommodation, dining services, tour operations',
      'Key Markets': 'International tourists, business travelers',
      'Annual Revenue': '$2.5 million',
      'Number of Employees': '45',
      'Business Location': 'Coastal resort area, Caribbean'
    },
    ESSENTIAL_FUNCTIONS: {
      'Guest Services': ['Front desk operations', 'Housekeeping services', 'Guest relations'],
      'Food and Beverage': ['Restaurant operations', 'Kitchen services', 'Bar services'],
      'Tour Operations': ['Tour booking', 'Transportation coordination', 'Guide services'],
      'Administrative': ['Accounting', 'Human resources', 'Inventory management']
    },
    RISK_ASSESSMENT: {
      'Risk Assessment Matrix': [
        {
          hazard: 'hurricane',
          Hazard: 'Hurricane/Tropical Storm',
          likelihood: 'High',
          severity: 'High',
          riskLevel: 'High',
          RiskLevel: 'High',
          riskScore: 'High'
        },
        {
          hazard: 'power_outage',
          Hazard: 'Extended Power Outage',
          likelihood: 'Medium',
          severity: 'High',
          riskLevel: 'High',
          RiskLevel: 'High',
          riskScore: 'High'
        },
        {
          hazard: 'cyber_attack',
          Hazard: 'Cyber Attack',
          likelihood: 'Medium',
          severity: 'Medium',
          riskLevel: 'Medium',
          RiskLevel: 'Medium',
          riskScore: 'Medium'
        }
      ]
    },
    STRATEGIES: {
      'Prevention Strategies (Before Emergencies)': [
        'Install hurricane shutters and reinforcements',
        'Maintain emergency generator and fuel supply',
        'Implement cybersecurity protocols and training',
        'Establish supplier backup agreements'
      ],
      'Response Strategies (During Emergencies)': [
        'Activate emergency response team',
        'Implement guest evacuation procedures',
        'Switch to backup power systems',
        'Coordinate with local emergency services'
      ],
      'Recovery Strategies (After Emergencies)': [
        'Assess damage and prioritize repairs',
        'Communicate with guests and stakeholders',
        'Coordinate insurance claims processing',
        'Implement phased business resumption'
      ],
      'Long-term Risk Reduction Measures': [
        'Upgrade building to hurricane-resistant standards',
        'Invest in renewable energy backup systems',
        'Develop mutual aid agreements with other hotels',
        'Create comprehensive staff training programs'
      ]
    },
    CONTACTS_AND_INFORMATION: {
      'Staff Contact Information': [
        { Name: 'John Doe', Position: 'General Manager', Phone: '555-0101', Email: 'john@testhotel.com' },
        { Name: 'Jane Smith', Position: 'Operations Manager', Phone: '555-0102', Email: 'jane@testhotel.com' },
        { Name: 'Bob Johnson', Position: 'Maintenance Chief', Phone: '555-0103', Email: 'bob@testhotel.com' }
      ],
      'Emergency Services and Utilities': [
        { Service: 'Police', Contact: '911', Phone: '555-0911' },
        { Service: 'Fire Department', Contact: '911', Phone: '555-0912' },
        { Service: 'Electric Company', Contact: 'Power Corp', Phone: '555-0201' }
      ]
    },
    TESTING_AND_MAINTENANCE: {
      'Plan Testing Schedule': [
        { Test: 'Evacuation Drill', Frequency: 'Quarterly', LastConducted: '2024-01-10', NextDue: '2024-04-10' },
        { Test: 'Communication Test', Frequency: 'Monthly', LastConducted: '2024-01-15', NextDue: '2024-02-15' }
      ]
    }
  }

  try {
    console.log('Testing PDF generation...')
    
    const response = await fetch('http://localhost:3000/api/export-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planData: samplePlanData })
    })

    if (response.ok) {
      const blob = await response.blob()
      console.log('✅ PDF generated successfully!')
      console.log(`PDF size: ${blob.size} bytes`)
      console.log('Content type:', response.headers.get('content-type'))
      
      // Save the PDF file
      if (typeof window !== 'undefined') {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'test-business-continuity-plan.pdf'
        a.click()
        window.URL.revokeObjectURL(url)
        console.log('PDF downloaded as test-business-continuity-plan.pdf')
      }
      
    } else {
      const errorText = await response.text()
      console.error('❌ PDF generation failed:', response.status, errorText)
    }
  } catch (error) {
    console.error('❌ Error testing PDF generation:', error)
  }
}

// Export for Node.js or run in browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testPDFGeneration
} else {
  // Run the test
  testPDFGeneration()
} 
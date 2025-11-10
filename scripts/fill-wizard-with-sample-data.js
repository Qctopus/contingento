/**
 * Wizard Sample Data Filler - Console Script Version
 * 
 * ⚠️ NOTE: For development, it's easier to use the purple "Fill with Sample Data" 
 * button in the bottom-left corner of the wizard (only visible in dev mode).
 * 
 * This script fills the Business Continuity Planning wizard with realistic sample data
 * for testing and previewing the final review document.
 * 
 * IMPORTANT: This script fills a COMPLETE business continuity plan with all sections
 * including risks, strategies, and action plans. This simulates a fully completed wizard
 * so you can test and refine the final review document appearance and content.
 * 
 * Usage:
 * 1. Open the wizard in your browser
 * 2. Open the browser console (F12)
 * 3. Copy and paste this entire script into the console
 * 4. Press Enter to execute
 * 5. Refresh the page to see the wizard filled with sample data
 * 
 * What Gets Filled:
 * - Plan Information, Business Overview, Essential Functions
 * - Risk Assessment Matrix (6 risks with detailed mitigation measures)
 * - Prevention, Response, Recovery Strategies + Long-term Risk Reduction
 * - Action Plan (Emergency Response Team, Communication, Evacuation, Work Locations)
 * - Contacts (Staff, Suppliers, Customers, Emergency Services)
 * - Vital Records Inventory
 * - Testing and Maintenance (Schedules, Training, Metrics, Improvements)
 */

(function fillWizardWithSampleData() {
  console.log('🎯 Starting to fill wizard with sample data...');

  // Sample Business Continuity Plan Data
  const sampleData = {
    PLAN_INFORMATION: {
      'Company Name': 'Caribbean Resort & Spa Ltd.',
      'Business Address': '123 Ocean Drive, Bridgetown, Barbados',
      'Plan Version': '1.0',
      'Date of Plan': '2025-01-15',
      'Next Review Date': '2026-01-15',
      'Plan Manager': 'Sarah Johnson',
      'Plan Manager Phone': '+1-246-555-0100',
      'Plan Manager Email': 'sarah.johnson@caribbeanresort.com',
      'Alternate Manager': 'Michael Chen',
      'Alternate Manager Phone': '+1-246-555-0101',
      'Alternate Manager Email': 'michael.chen@caribbeanresort.com',
      'Digital Plan Location': 'SharePoint > Business Continuity > BCP_v1.0.pdf',
      'Physical Plan Location': 'Main Office Safe, Copy in Emergency Kit'
    },

    BUSINESS_OVERVIEW: {
      'Business Purpose': 'Caribbean Resort & Spa Ltd. provides luxury accommodation, fine dining, spa services, and water sports activities to international tourists. Our mission is to deliver exceptional Caribbean hospitality experiences while maintaining sustainable operations and contributing to the local community.',
      'Products & Services': 'We offer 150 luxury rooms and suites, three restaurants (fine dining, casual beachfront, and poolside bar), full-service spa with 8 treatment rooms, water sports center (kayaking, paddleboarding, snorkeling), conference facilities for up to 200 guests, wedding and event planning services, and guided island tours.',
      'Target Markets': 'Our primary markets include North American tourists (60%), European travelers (25%), and regional Caribbean visitors (15%). We focus on couples, families, and corporate groups seeking premium experiences.',
      'Key Competitive Advantages': 'Beachfront location with private beach access, award-winning restaurant with celebrity chef, certified eco-friendly operations, multilingual staff, strong relationships with local tour operators, and excellent online reviews (4.8/5.0 average).'
    },

    ESSENTIAL_FUNCTIONS: {
      'Guest Services': [
        'Front desk and reception',
        'Room service and housekeeping',
        'Concierge services'
      ],
      'Food & Beverage': [
        'Restaurant operations',
        'Bar service',
        'Kitchen and food preparation',
        'Inventory management and ordering'
      ],
      'Facilities & Maintenance': [
        'Building maintenance and repairs',
        'Pool and beach maintenance',
        'HVAC systems operation',
        'Water supply and plumbing',
        'Electrical power systems'
      ],
      'IT & Communications': [
        'Reservation system',
        'Payment processing',
        'WiFi and internet services',
        'Phone systems',
        'Website and online booking'
      ],
      'Finance & Administration': [
        'Payroll processing',
        'Accounts payable/receivable',
        'Financial reporting',
        'Regulatory compliance',
        'Insurance management'
      ],
      'Staff Management': [
        'Staff scheduling',
        'Employee training',
        'Performance management',
        'Health and safety compliance'
      ]
    },

    FUNCTION_PRIORITIES: {
      'Function Priority Assessment': [
        {
          'Function': 'Guest check-in and room access',
          'Priority': 'Critical (1-4 hours)',
          'Maximum Downtime': 'Less than 4 hours',
          'Notes': 'Cannot operate without ability to check guests in and provide room access'
        },
        {
          'Function': 'Payment processing',
          'Priority': 'Critical (1-4 hours)',
          'Maximum Downtime': 'Less than 4 hours',
          'Notes': 'Essential for revenue generation and guest services'
        },
        {
          'Function': 'Food service operations',
          'Priority': 'Critical (1-4 hours)',
          'Maximum Downtime': '4-8 hours',
          'Notes': 'Guests require meals, especially those on all-inclusive packages'
        },
        {
          'Function': 'Reservation system',
          'Priority': 'High (1-2 days)',
          'Maximum Downtime': '1-2 days',
          'Notes': 'Can manage bookings manually for short period'
        },
        {
          'Function': 'Spa services',
          'Priority': 'Medium (3-7 days)',
          'Maximum Downtime': '3-7 days',
          'Notes': 'Supplementary service, can reschedule appointments'
        }
      ]
    },

    RISK_ASSESSMENT: {
      'Risk Assessment Matrix': [
        { 'Hazard': 'Hurricane/Tropical Storm', 'Likelihood': 'Likely (7-8)', 'Severity': 'Catastrophic (9-10)', 'Risk Level': 'Very High', 'Recommended Actions': 'Install hurricane shutters on all windows and glass doors; Maintain 72-hour emergency supply kit including water, food, first aid, flashlights, batteries; Establish guest and staff evacuation procedures and assembly points; Ensure backup power generation capacity for critical systems; Secure outdoor furniture and equipment; Establish agreements with mainland hotels for guest relocation; Train staff on hurricane preparedness annually before season' },
        { 'Hazard': 'Extended Power Outage', 'Likelihood': 'Possible (4-6)', 'Severity': 'Major (7-8)', 'Risk Level': 'High', 'Recommended Actions': 'Maintain three backup generators with capacity for critical operations (refrigeration, elevators, emergency lighting, water pumps); Keep minimum 72-hour fuel reserve on-site with agreements for emergency fuel delivery; Install battery backup systems for reservation and payment systems; Develop manual procedures for check-in, billing, and essential services; Test generators monthly and under load quarterly' },
        { 'Hazard': 'Water Contamination', 'Likelihood': 'Unlikely (2-3)', 'Severity': 'Major (7-8)', 'Risk Level': 'Medium', 'Recommended Actions': 'Implement daily water quality testing protocols; Maintain relationships with bottled water suppliers for emergency bulk delivery; Install backup water purification system; Store minimum 48-hour supply of bottled water for guests and kitchen; Develop protocols for guest communication in case of water advisory; Train staff on waterborne illness prevention' },
        { 'Hazard': 'Cyber Attack / Ransomware', 'Likelihood': 'Possible (4-6)', 'Severity': 'Major (7-8)', 'Risk Level': 'High', 'Recommended Actions': 'Implement enterprise-grade firewall and intrusion detection systems; Conduct daily automated backups of all systems to offline and cloud storage; Train staff quarterly on phishing and social engineering prevention; Maintain cyber insurance coverage; Develop incident response plan with IT security consultant; Keep printed backup of critical guest reservations and contact information' },
        { 'Hazard': 'Supply Chain Disruption', 'Likelihood': 'Possible (4-6)', 'Severity': 'Moderate (4-6)', 'Risk Level': 'Medium', 'Recommended Actions': 'Diversify critical suppliers (identify 2-3 vendors for food, linen, beverages); Maintain 10-14 day inventory of non-perishable essentials; Establish relationships with local farmers and producers as backup; Document all supplier contact information and order procedures; Review supplier business continuity plans annually; Consider bulk purchasing agreements with neighboring hotels for emergency sharing' }
      ]
    },

    STRATEGIES: {
      'Prevention Strategies (Before Emergencies)': [
        'maintenance',
        'physical_security',
        'cybersecurity',
        'insurance',
        'employee_training',
        'supplier_diversity',
        'financial_reserves',
        'data_backup',
        'building_upgrades',
        'emergency_supplies',
        'risk_monitoring'
      ],
      'Response Strategies (During Emergencies)': [
        'emergency_team',
        'safety_procedures',
        'emergency_communication',
        'alternative_locations',
        'emergency_inventory',
        'customer_continuity',
        'emergency_services',
        'closure_procedures',
        'essential_operations'
      ],
      'Recovery Strategies (After Emergencies)': [
        'damage_assessment',
        'insurance_claims',
        'business_resumption',
        'employee_support',
        'customer_retention',
        'supplier_restoration',
        'reputation_management',
        'facility_repair',
        'equipment_replacement',
        'lessons_learned'
      ],
      'Long-term Risk Reduction Measures': 'We are committed to continuously improving our resilience through multi-year investments including: (1) Upgrading building infrastructure to meet enhanced hurricane standards with impact-resistant windows and reinforced roof systems; (2) Establishing formal partnerships with Barbados Department of Emergency Management and local emergency services for coordinated response; (3) Conducting comprehensive emergency response drills annually including full property evacuation, hurricane scenario, and cyber incident response; (4) Maintaining insurance coverage at 125% of replacement value including business interruption for 12 months; (5) Developing redundant critical relationships with backup suppliers in multiple Caribbean locations and North America; (6) Implementing fully redundant IT systems with primary and backup cloud providers in different geographic regions; (7) Creating detailed emergency response playbooks for each identified risk with role-specific action checklists; (8) Fostering a culture of preparedness through regular staff training, emergency awareness programs, and recognition of preparedness initiatives.'
    },

    ACTION_PLAN: {
      'Emergency Response Team': [
        { 'Name': 'Sarah Johnson', 'Position': 'Incident Commander', 'Phone': '+1-246-555-0100', 'Email': 'sarah.johnson@caribbeanresort.com', 'Responsibilities': 'Overall emergency coordination, final decision-making authority, external communications with government and media, resource allocation approval' },
        { 'Name': 'Michael Chen', 'Position': 'Operations Chief', 'Phone': '+1-246-555-0101', 'Email': 'michael.chen@caribbeanresort.com', 'Responsibilities': 'Guest and staff safety coordination, facility operations during emergency, staff deployment and task assignments, liaison with emergency services' },
        { 'Name': 'Patricia Williams', 'Position': 'Finance/Admin Chief', 'Phone': '+1-246-555-0102', 'Email': 'patricia.williams@caribbeanresort.com', 'Responsibilities': 'Emergency financial resources and purchasing authority, insurance claims coordination, vendor payment arrangements, financial tracking and reporting' },
        { 'Name': 'David Martinez', 'Position': 'Communications Officer', 'Phone': '+1-246-555-0103', 'Email': 'david.martinez@caribbeanresort.com', 'Responsibilities': 'Internal communications to staff, guest information and updates, media relations and public statements, social media monitoring and response' },
        { 'Name': 'Robert Taylor', 'Position': 'Facilities/Logistics Officer', 'Phone': '+1-246-555-0107', 'Email': 'robert.taylor@caribbeanresort.com', 'Responsibilities': 'Building systems assessment and repair coordination, generator and backup power management, equipment and supplies logistics, contractor coordination' },
        { 'Name': 'James Rodriguez', 'Position': 'IT/Systems Officer', 'Phone': '+1-246-555-0105', 'Email': 'james.rodriguez@caribbeanresort.com', 'Responsibilities': 'IT systems recovery and restoration, data backup verification and recovery, cybersecurity incident response, technical support for emergency operations' }
      ],
      'Emergency Communication Plan': 'In an emergency, communication will be initiated by the Incident Commander or designated alternate through the following sequence: (1) Emergency Response Team activated via group text and phone call tree within 15 minutes; (2) All staff notified via text message alert system and phone calls to department heads; (3) Guests informed through in-room announcements, lobby notices, and room-by-room contact by staff; (4) Key suppliers and partners contacted via email and phone; (5) External stakeholders (booking agencies, corporate clients) notified within 4 hours via email with status updates every 12 hours; (6) Media inquiries handled exclusively by Communications Officer with approved talking points; (7) Government authorities notified as required. Backup communication methods include: satellite phone, WhatsApp groups, hotel radio system, and physical messenger if telecommunications fail.',
      'Evacuation Procedures': 'Guest and staff evacuation will be ordered only by the Incident Commander in consultation with emergency services. Evacuation assembly points: Primary - North parking lot (away from ocean); Secondary - Employee parking area; Tertiary - Public beach access road 500m north. Procedures: (1) Alarm activation and PA announcement with clear instructions; (2) Department heads conduct floor-by-floor sweep of assigned areas; (3) Staff assist mobility-impaired guests and verify rooms are clear; (4) Guest accountability verified against registration system at assembly point; (5) Staff accountability verified by department heads; (6) Emergency services briefed on building status and missing persons; (7) No re-entry until authorized by Incident Commander and emergency services. Special considerations: Medical assistance available at assembly point, transportation arranged for guest relocation if needed.',
      'Alternative Work Locations': 'If the property is unusable, essential operations will relocate to: Primary - Sister property "Palm Grove Resort" 5km inland (pre-arranged agreement for office space and facilities); Secondary - Shared office space at "Business Center Bridgetown" with internet and phone systems; Temporary - Remote work for administrative staff using cloud-based systems and laptops from emergency kits. Critical functions will be prioritized: (1) Guest reservation system and incoming booking management; (2) Insurance claims processing; (3) Supplier coordination and ordering; (4) Staff communication and payroll. Each department head has assigned workspace and resources list at alternative locations in their emergency manual.'
    },

    CONTACTS_AND_INFORMATION: {
      'Staff Contact Information': [
        {
          'Name': 'Sarah Johnson',
          'Position': 'General Manager',
          'Phone': '+1-246-555-0100',
          'Email': 'sarah.johnson@caribbeanresort.com',
          'Emergency Contact': '+1-246-555-9100'
        },
        {
          'Name': 'Michael Chen',
          'Position': 'Operations Manager',
          'Phone': '+1-246-555-0101',
          'Email': 'michael.chen@caribbeanresort.com',
          'Emergency Contact': '+1-246-555-9101'
        },
        {
          'Name': 'Patricia Williams',
          'Position': 'Finance Director',
          'Phone': '+1-246-555-0102',
          'Email': 'patricia.williams@caribbeanresort.com',
          'Emergency Contact': '+1-246-555-9102'
        },
        {
          'Name': 'David Martinez',
          'Position': 'Marketing Director',
          'Phone': '+1-246-555-0103',
          'Email': 'david.martinez@caribbeanresort.com',
          'Emergency Contact': '+1-246-555-9103'
        },
        {
          'Name': 'Lisa Thompson',
          'Position': 'Head Chef',
          'Phone': '+1-246-555-0104',
          'Email': 'lisa.thompson@caribbeanresort.com',
          'Emergency Contact': '+1-246-555-9104'
        }
      ],
      'Supplier Information': [
        {
          'Name': 'Caribbean Food Distributors',
          'Contact Person': 'John Smith',
          'Phone': '+1-246-555-2000',
          'Email': 'orders@caribbeanfood.com',
          'Service': 'Food and beverage supplies'
        },
        {
          'Name': 'Island Power Solutions',
          'Contact Person': 'Maria Rodriguez',
          'Phone': '+1-246-555-2001',
          'Email': 'service@islandpower.com',
          'Service': 'Generator maintenance and fuel'
        },
        {
          'Name': 'TechCare IT Services',
          'Contact Person': 'James Brown',
          'Phone': '+1-246-555-2002',
          'Email': 'support@techcare.com',
          'Service': 'IT systems and support'
        },
        {
          'Name': 'Atlantic Linen Services',
          'Contact Person': 'Emma Davis',
          'Phone': '+1-246-555-2003',
          'Email': 'orders@atlanticlinen.com',
          'Service': 'Linen and laundry services'
        }
      ],
      'Key Customer Contacts': [
        {
          'Name': 'Luxury Travel Partners',
          'Contact Person': 'Robert Anderson',
          'Phone': '+1-305-555-3000',
          'Email': 'robert.anderson@luxurytravel.com',
          'Relationship': 'Major booking agency - 30% of annual bookings'
        },
        {
          'Name': 'Global Events Corp',
          'Contact Person': 'Jennifer Lee',
          'Phone': '+1-212-555-3001',
          'Email': 'jennifer.lee@globalevents.com',
          'Relationship': 'Corporate event organizer - regular conferences'
        },
        {
          'Name': 'Caribbean Weddings Ltd',
          'Contact Person': 'Amanda Foster',
          'Phone': '+1-246-555-3002',
          'Email': 'amanda@caribbeanweddings.com',
          'Relationship': 'Wedding planner - 15 events per year'
        }
      ],
      'Emergency Services and Utilities': [
        {
          'Name': 'Barbados Emergency Services',
          'Phone': '211',
          'Service': 'Police, Fire, Ambulance'
        },
        {
          'Name': 'Queen Elizabeth Hospital',
          'Phone': '+1-246-436-6450',
          'Service': 'Emergency medical services',
          'Address': 'Martindales Road, St. Michael'
        },
        {
          'Name': 'Barbados Light & Power',
          'Phone': '+1-246-626-7000',
          'Service': 'Electric utility',
          'Emergency': '+1-246-626-7777'
        },
        {
          'Name': 'Barbados Water Authority',
          'Phone': '+1-246-434-4200',
          'Service': 'Water utility',
          'Emergency': '+1-246-228-7700'
        },
        {
          'Name': 'Department of Emergency Management',
          'Phone': '+1-246-511-4200',
          'Service': 'Government emergency coordination',
          'Email': 'info@dem.gov.bb'
        }
      ],
      'Plan Distribution List': [
        {
          'Name': 'Sarah Johnson',
          'Position': 'General Manager',
          'Format': 'Digital + Physical',
          'Date Received': '2025-01-15'
        },
        {
          'Name': 'Michael Chen',
          'Position': 'Operations Manager',
          'Format': 'Digital + Physical',
          'Date Received': '2025-01-15'
        },
        {
          'Name': 'All Department Heads',
          'Position': 'Management Team',
          'Format': 'Digital',
          'Date Received': '2025-01-15'
        },
        {
          'Name': 'Board of Directors',
          'Position': 'Governance',
          'Format': 'Digital',
          'Date Received': '2025-01-15'
        }
      ]
    },

    VITAL_RECORDS: {
      'Vital Records Inventory': [
        {
          'Record Type': 'Property insurance policies',
          'Location': 'Safe in General Manager office + Digital SharePoint',
          'Backup Location': 'Attorney office + Cloud backup',
          'Responsible Person': 'Patricia Williams',
          'Update Frequency': 'Annual renewal'
        },
        {
          'Record Type': 'Business liability insurance',
          'Location': 'Safe + Digital SharePoint',
          'Backup Location': 'Attorney office + Cloud backup',
          'Responsible Person': 'Patricia Williams',
          'Update Frequency': 'Annual renewal'
        },
        {
          'Record Type': 'Guest reservation database',
          'Location': 'Cloud-based system (AWS)',
          'Backup Location': 'Daily automated backups to separate cloud region',
          'Responsible Person': 'IT Manager',
          'Update Frequency': 'Real-time'
        },
        {
          'Record Type': 'Employee records and contracts',
          'Location': 'HR system + Digital SharePoint',
          'Backup Location': 'Cloud backup',
          'Responsible Person': 'HR Manager',
          'Update Frequency': 'As needed'
        },
        {
          'Record Type': 'Financial records and accounts',
          'Location': 'Accounting system + Physical files',
          'Backup Location': 'Cloud backup + Accountant office',
          'Responsible Person': 'Finance Director',
          'Update Frequency': 'Daily'
        },
        {
          'Record Type': 'Building permits and licenses',
          'Location': 'Safe + Digital copies',
          'Backup Location': 'Attorney office',
          'Responsible Person': 'General Manager',
          'Update Frequency': 'As renewed'
        },
        {
          'Record Type': 'Supplier contracts',
          'Location': 'Digital SharePoint',
          'Backup Location': 'Cloud backup',
          'Responsible Person': 'Operations Manager',
          'Update Frequency': 'As updated'
        },
        {
          'Record Type': 'Emergency contact lists',
          'Location': 'Digital SharePoint + Physical emergency kits',
          'Backup Location': 'Cloud + Multiple physical copies',
          'Responsible Person': 'All managers',
          'Update Frequency': 'Quarterly'
        }
      ]
    },

    TESTING_AND_MAINTENANCE: {
      'Plan Testing Schedule': [
        {
          'Test Type': 'Tabletop exercise',
          'Frequency': 'Quarterly',
          'Next Date': '2025-04-15',
          'Responsible': 'Emergency Response Team',
          'Participants': 'All department heads'
        },
        {
          'Test Type': 'Fire drill and evacuation',
          'Frequency': 'Bi-annual',
          'Next Date': '2025-03-01',
          'Responsible': 'Safety Officer',
          'Participants': 'All staff and guests'
        },
        {
          'Test Type': 'IT system failover test',
          'Frequency': 'Quarterly',
          'Next Date': '2025-02-15',
          'Responsible': 'IT Manager',
          'Participants': 'IT team + Operations'
        },
        {
          'Test Type': 'Full-scale emergency simulation',
          'Frequency': 'Annual',
          'Next Date': '2025-06-01',
          'Responsible': 'General Manager',
          'Participants': 'Entire organization'
        },
        {
          'Test Type': 'Communication system test',
          'Frequency': 'Monthly',
          'Next Date': '2025-02-01',
          'Responsible': 'Communications Lead',
          'Participants': 'Emergency Response Team'
        }
      ],
      'Training Schedule': [
        {
          'Training Topic': 'Emergency response procedures',
          'Frequency': 'Quarterly for all staff',
          'Next Date': '2025-04-01',
          'Duration': '2 hours',
          'Trainer': 'External emergency management expert'
        },
        {
          'Training Topic': 'First aid and CPR',
          'Frequency': 'Annual certification',
          'Next Date': '2025-05-15',
          'Duration': '1 day',
          'Trainer': 'Red Cross certified instructor'
        },
        {
          'Training Topic': 'Hurricane preparedness',
          'Frequency': 'Annual (before hurricane season)',
          'Next Date': '2025-05-01',
          'Duration': '3 hours',
          'Trainer': 'Dept. of Emergency Management'
        },
        {
          'Training Topic': 'Cybersecurity awareness',
          'Frequency': 'Quarterly',
          'Next Date': '2025-03-01',
          'Duration': '1 hour',
          'Trainer': 'IT Security Consultant'
        }
      ],
      'Performance Metrics': [
        {
          'Metric': 'Emergency response time',
          'Target': 'Under 15 minutes',
          'Measurement Method': 'Time stamps during drills',
          'Review Frequency': 'After each drill'
        },
        {
          'Metric': 'Staff training completion rate',
          'Target': '100% participation',
          'Measurement Method': 'Training attendance records',
          'Review Frequency': 'Quarterly'
        },
        {
          'Metric': 'System backup success rate',
          'Target': '99.9% successful backups',
          'Measurement Method': 'Automated backup logs',
          'Review Frequency': 'Weekly'
        },
        {
          'Metric': 'Recovery time for critical systems',
          'Target': 'Under 4 hours',
          'Measurement Method': 'Failover test results',
          'Review Frequency': 'Quarterly'
        }
      ],
      'Improvement Tracking': [
        {
          'Issue Identified': 'Slow evacuation during last fire drill',
          'Action Required': 'Install additional emergency exit signs',
          'Responsible': 'Facilities Manager',
          'Due Date': '2025-02-28',
          'Status': 'In Progress'
        },
        {
          'Issue Identified': 'Outdated contact information for suppliers',
          'Action Required': 'Verify and update all supplier contacts',
          'Responsible': 'Operations Manager',
          'Due Date': '2025-01-31',
          'Status': 'Completed'
        },
        {
          'Issue Identified': 'Insufficient backup generator fuel',
          'Action Required': 'Increase fuel storage capacity by 50%',
          'Responsible': 'Facilities Manager',
          'Due Date': '2025-03-31',
          'Status': 'Pending'
        }
      ],
      'Annual Review Process': 'The Business Continuity Plan will be comprehensively reviewed annually by the General Manager and Emergency Response Team. This review will include: assessment of all risks and their current mitigation status, update of all contact information and resource lists, incorporation of lessons learned from drills and actual incidents, alignment with any changes in business operations or structure, review of insurance coverage adequacy, validation of technology and system dependencies, and confirmation that all training requirements have been met.',
      'Trigger Events for Plan Updates': 'The plan will be updated immediately upon occurrence of: significant changes in business operations or facilities, actual activation of the plan during an emergency, major changes in key personnel, acquisition of new properties or assets, changes in regulatory requirements, significant supplier or vendor changes, major technology system upgrades, or identification of gaps during testing or drills.'
    }
  };

  // Industry and location pre-fill data
  const preFillData = {
    industry: {
      id: 'hospitality_tourism',
      name: 'Hospitality & Tourism'
    },
    location: {
      country: 'Barbados',
      countryCode: 'BB',
      parish: 'Christ Church',
      nearCoast: true,
      urbanArea: true
    },
    preFilledFields: sampleData,
    contextualExamples: {},
    recommendedStrategies: []
  };

  try {
    // Save to localStorage
    localStorage.setItem('bcp-draft', JSON.stringify(sampleData));
    localStorage.setItem('bcp-industry-selected', 'true');
    localStorage.setItem('bcp-prefill-data', JSON.stringify(preFillData));
    
    console.log('✅ Complete sample plan saved to localStorage!');
    console.log('📊 Data includes:');
    console.log('  - Company: Caribbean Resort & Spa Ltd.');
    console.log('  - Industry: Hospitality & Tourism');
    console.log('  - Location: Christ Church, Barbados');
    console.log('  - ' + Object.keys(sampleData).length + ' completed sections');
    console.log('  - 6 Risk assessments with detailed actions');
    console.log('  - 32 Selected strategies across prevention/response/recovery');
    console.log('  - Emergency Response Team with 6 members');
    console.log('  - Emergency communication, evacuation, and work location plans');
    console.log('');
    console.log('🔄 Please refresh the page to see the wizard filled with sample data');
    console.log('📄 Navigate through all steps and review the final Business Plan document');
    
    return {
      success: true,
      message: 'Sample data loaded successfully',
      sections: Object.keys(sampleData)
    };
  } catch (error) {
    console.error('❌ Error saving sample data:', error);
    return {
      success: false,
      error: error.message
    };
  }
})();


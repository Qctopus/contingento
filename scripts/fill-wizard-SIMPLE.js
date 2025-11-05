/**
 * SIMPLE WIZARD FILLER - Fills wizard with complete sample data
 * 
 * This creates sample data EXACTLY as the wizard would save it.
 * 
 * Usage:
 * 1. Open wizard in browser
 * 2. Open console (F12)
 * 3. Paste this script and press Enter
 * 4. Refresh page
 */

(function fillWizard() {
  console.log('🎯 Filling wizard with sample data...')
  
  // This is EXACTLY how the wizard stores data
  const formData = {
    
    // STEP 1: Plan Information
    PLAN_INFORMATION: {
      'Company Name': 'Caribbean Resort & Spa Ltd.',
      'Business Address': '123 Ocean Drive, Christ Church, Barbados BB17000',
      'Plan Manager': 'Sarah Johnson, General Manager',
      'Alternate Manager': 'Michael Chen, Operations Manager',
      'Physical Plan Location': 'Fire-proof safe in General Manager office, backup copy in emergency kit',
      'Digital Plan Location': 'Company SharePoint > Business Continuity > BCP_Current.pdf with cloud backup',
      'Plan Version': '1.0',
      'Next Review Date': '2026-01-15'
    },
    
    // STEP 2: Business Overview
    BUSINESS_OVERVIEW: {
      'Business Purpose': 'Caribbean Resort & Spa Ltd. provides luxury beachfront accommodation, fine dining experiences, full-service spa treatments, and water sports activities to international tourists seeking authentic Caribbean hospitality. Our mission is to deliver exceptional guest experiences while maintaining sustainable operations and contributing to the local Barbadian community through employment and partnerships with local suppliers.',
      'Products & Services': '150 luxury rooms and suites with ocean or garden views; Three restaurants (fine dining, casual beachfront grill, poolside bar); Full-service spa with 8 treatment rooms offering massages, facials, and wellness programs; Water sports center with kayaking, paddleboarding, snorkeling, and diving; Conference and event facilities for up to 200 guests; Wedding planning and coordination services; Guided island tours and excursions; 24-hour concierge and guest services.',
      'Target Markets': 'Primary market (60%): North American tourists aged 35-65 seeking luxury vacation experiences; Secondary market (25%): European travelers, particularly from UK, Germany, and France; Tertiary market (15%): Regional Caribbean visitors and destination wedding couples. We focus on couples, families with teenagers, and corporate groups seeking premium experiences.',
      'Key Competitive Advantages': 'Prime beachfront location with 500 meters of private white-sand beach; Award-winning restaurant with celebrity chef Marcus Williams; Eco-certified operations with solar panels and water conservation programs; Multilingual staff fluent in English, Spanish, French, and German; Strategic partnerships with major international tour operators; Exceptional online reputation with 4.8/5.0 rating across major travel platforms; Recently renovated facilities (2023) maintaining Caribbean charm with modern amenities; Strong community relationships and locally-sourced products supporting Barbadian businesses.'
    },
    
    // STEP 3: Essential Functions  
    ESSENTIAL_FUNCTIONS: {
      'Guest Services': [
        'front_desk',
        'room_service',
        'concierge',
        'housekeeping'
      ],
      'Food & Beverage': [
        'restaurant_operations',
        'bar_service',
        'kitchen_food_prep',
        'inventory_ordering'
      ],
      'Facilities & Maintenance': [
        'building_maintenance',
        'pool_beach_maintenance',
        'hvac',
        'water_supply',
        'electrical_power'
      ],
      'IT & Communications': [
        'reservation_system',
        'payment_processing',
        'wifi_internet',
        'phone_systems',
        'website_booking'
      ],
      'Finance & Administration': [
        'payroll',
        'accounts',
        'financial_reporting',
        'compliance',
        'insurance'
      ],
      'Security & Safety': [
        'guest_security',
        'property_security',
        'emergency_response',
        'safety_procedures'
      ]
    },
    
    // STEP 4: Function Priorities
    FUNCTION_PRIORITIES: {
      'Business Function Priorities': [
        { 'Function': 'Guest check-in and room access systems', 'Priority': 'Critical (1-4 hours)', 'Maximum Downtime': 'Less than 4 hours', 'Notes': 'Cannot operate hotel without ability to check guests in and provide secure room access. Manual backup procedures available but very limited.' },
        { 'Function': 'Payment processing and billing systems', 'Priority': 'Critical (1-4 hours)', 'Maximum Downtime': '4 hours', 'Notes': 'Essential for revenue generation. Can use manual credit card imprinters for short period but not sustainable.' },
        { 'Function': 'Food service operations (kitchen and restaurants)', 'Priority': 'Critical (1-4 hours)', 'Maximum Downtime': '8 hours', 'Notes': 'Guests require meals, especially all-inclusive package guests. Can arrange limited cold meals if needed.' },
        { 'Function': 'Water supply and sewage systems', 'Priority': 'Critical (1-4 hours)', 'Maximum Downtime': '6 hours', 'Notes': 'Absolutely essential for health and safety. No operation possible without functional water and sewage.' },
        { 'Function': 'Electrical power supply', 'Priority': 'Critical (1-4 hours)', 'Maximum Downtime': '12 hours', 'Notes': 'Backup generators for critical systems. Can operate on reduced power but guest comfort compromised.' },
        { 'Function': 'Reservation and booking system', 'Priority': 'High (1-2 days)', 'Maximum Downtime': '1-2 days', 'Notes': 'Can manage bookings manually for short period using backup spreadsheets and phone calls.' },
        { 'Function': 'Housekeeping and room turnover', 'Priority': 'High (1-2 days)', 'Maximum Downtime': '2 days', 'Notes': 'Essential for guest satisfaction but can prioritize occupied rooms if staff limited.' },
        { 'Function': 'Spa and wellness center operations', 'Priority': 'Medium (3-7 days)', 'Maximum Downtime': '5 days', 'Notes': 'Important revenue center but appointments can be rescheduled. Not essential for basic hotel operations.' },
        { 'Function': 'Water sports and recreation equipment', 'Priority': 'Medium (3-7 days)', 'Maximum Downtime': '7 days', 'Notes': 'Guest amenity but not core service. Can arrange alternative activities if needed.' }
      ]
    },
    
    // STEP 5: Risk Assessment
    RISK_ASSESSMENT: {
      'Risk Assessment Matrix': [
        { 'Hazard': 'Hurricane/Tropical Storm', 'Likelihood': 'Likely (7-8)', 'Severity': 'Catastrophic (9-10)', 'Risk Level': 'Very High', 'Recommended Actions': 'Install hurricane shutters on all windows and glass doors; Maintain 72-hour emergency supply kit including water, food, first aid, flashlights, batteries; Establish guest and staff evacuation procedures and assembly points; Ensure backup power generation capacity for critical systems; Secure outdoor furniture and equipment; Establish agreements with mainland hotels for guest relocation; Train staff on hurricane preparedness annually before season' },
        { 'Hazard': 'Extended Power Outage', 'Likelihood': 'Possible (4-6)', 'Severity': 'Major (7-8)', 'Risk Level': 'High', 'Recommended Actions': 'Maintain three backup generators with capacity for critical operations (refrigeration, elevators, emergency lighting, water pumps); Keep minimum 72-hour fuel reserve on-site with agreements for emergency fuel delivery; Install battery backup systems for reservation and payment systems; Develop manual procedures for check-in, billing, and essential services; Test generators monthly and under load quarterly' },
        { 'Hazard': 'Water Contamination', 'Likelihood': 'Unlikely (2-3)', 'Severity': 'Major (7-8)', 'Risk Level': 'Medium', 'Recommended Actions': 'Implement daily water quality testing protocols; Maintain relationships with bottled water suppliers for emergency bulk delivery; Install backup water purification system; Store minimum 48-hour supply of bottled water for guests and kitchen; Develop protocols for guest communication in case of water advisory; Train staff on waterborne illness prevention' },
        { 'Hazard': 'Cyber Attack / Ransomware', 'Likelihood': 'Possible (4-6)', 'Severity': 'Major (7-8)', 'Risk Level': 'High', 'Recommended Actions': 'Implement enterprise-grade firewall and intrusion detection systems; Conduct daily automated backups of all systems to offline and cloud storage; Train staff quarterly on phishing and social engineering prevention; Maintain cyber insurance coverage; Develop incident response plan with IT security consultant; Keep printed backup of critical guest reservations and contact information' },
        { 'Hazard': 'Key Staff Unavailability', 'Likelihood': 'Likely (7-8)', 'Severity': 'Moderate (4-6)', 'Risk Level': 'High', 'Recommended Actions': 'Cross-train all department supervisors on critical operations; Document all standard operating procedures with step-by-step guides; Maintain current contact list for temporary staffing agencies; Develop succession planning for all key positions; Keep updated emergency contact information for all staff; Establish relationships with other hotels for staff sharing in emergencies' },
        { 'Hazard': 'Supply Chain Disruption', 'Likelihood': 'Possible (4-6)', 'Severity': 'Moderate (4-6)', 'Risk Level': 'Medium', 'Recommended Actions': 'Diversify critical suppliers (identify 2-3 vendors for food, linen, beverages); Maintain 10-14 day inventory of non-perishable essentials; Establish relationships with local farmers and producers as backup; Document all supplier contact information and order procedures; Review supplier business continuity plans annually; Consider bulk purchasing agreements with neighboring hotels for emergency sharing' }
      ]
    },
    
    // STEP 6: Strategies
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
    
    // STEP 7: Action Plan
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
    
    // STEP 8: Contacts
    CONTACTS_AND_INFORMATION: {
      'Staff Contact Information': [
        { 'Name': 'Sarah Johnson', 'Position': 'General Manager', 'Phone': '+1-246-555-0100', 'Email': 'sarah.johnson@caribbeanresort.com', 'Emergency Contact': '+1-246-555-9100' },
        { 'Name': 'Michael Chen', 'Position': 'Operations Manager', 'Phone': '+1-246-555-0101', 'Email': 'michael.chen@caribbeanresort.com', 'Emergency Contact': '+1-246-555-9101' },
        { 'Name': 'Patricia Williams', 'Position': 'Finance Director', 'Phone': '+1-246-555-0102', 'Email': 'patricia.williams@caribbeanresort.com', 'Emergency Contact': '+1-246-555-9102' },
        { 'Name': 'David Martinez', 'Position': 'Marketing & Communications Director', 'Phone': '+1-246-555-0103', 'Email': 'david.martinez@caribbeanresort.com', 'Emergency Contact': '+1-246-555-9103' },
        { 'Name': 'Lisa Thompson', 'Position': 'Executive Chef', 'Phone': '+1-246-555-0104', 'Email': 'lisa.thompson@caribbeanresort.com', 'Emergency Contact': '+1-246-555-9104' }
      ],
      'Supplier Information': [
        { 'Name': 'Caribbean Food Distributors', 'Contact Person': 'John Smith', 'Phone': '+1-246-555-2000', 'Email': 'orders@caribbeanfood.com', 'Service': 'Food and beverage supplies, daily deliveries' },
        { 'Name': 'Island Power Solutions', 'Contact Person': 'Maria Rodriguez', 'Phone': '+1-246-555-2001', 'Email': 'service@islandpower.com', 'Service': 'Generator maintenance, emergency fuel delivery' },
        { 'Name': 'TechCare IT Services', 'Contact Person': 'James Brown', 'Phone': '+1-246-555-2002', 'Email': 'support@techcare.com', 'Service': 'IT systems, network support, 24/7 emergency' },
        { 'Name': 'Atlantic Linen Services', 'Contact Person': 'Emma Davis', 'Phone': '+1-246-555-2003', 'Email': 'orders@atlanticlinen.com', 'Service': 'Linen and towel services, laundry' }
      ],
      'Key Customer Contacts': [
        { 'Name': 'Luxury Travel Partners', 'Contact Person': 'Robert Anderson', 'Phone': '+1-305-555-3000', 'Email': 'robert.anderson@luxurytravel.com', 'Relationship': 'Major booking agency - 30% of annual bookings' },
        { 'Name': 'Global Events Corp', 'Contact Person': 'Jennifer Lee', 'Phone': '+1-212-555-3001', 'Email': 'jennifer.lee@globalevents.com', 'Relationship': 'Corporate event organizer - regular conferences' },
        { 'Name': 'Caribbean Weddings Ltd', 'Contact Person': 'Amanda Foster', 'Phone': '+1-246-555-3002', 'Email': 'amanda@caribbeanweddings.com', 'Relationship': 'Wedding planner - 15 events per year' }
      ],
      'Emergency Services and Utilities': [
        { 'Name': 'Barbados Emergency Services', 'Phone': '211', 'Service': 'Police, Fire, Ambulance - 24/7 emergency dispatch' },
        { 'Name': 'Queen Elizabeth Hospital', 'Phone': '+1-246-436-6450', 'Service': 'Emergency medical services', 'Address': 'Martindales Road, St. Michael' },
        { 'Name': 'Barbados Light & Power', 'Phone': '+1-246-626-7000', 'Service': 'Electric utility', 'Emergency': '+1-246-626-7777' },
        { 'Name': 'Barbados Water Authority', 'Phone': '+1-246-434-4200', 'Service': 'Water utility', 'Emergency': '+1-246-228-7700' },
        { 'Name': 'Department of Emergency Management', 'Phone': '+1-246-511-4200', 'Service': 'Government emergency coordination', 'Email': 'info@dem.gov.bb' }
      ]
    },
    
    // STEP 9: Vital Records
    VITAL_RECORDS: {
      'Vital Records Inventory': [
        { 'Record Type': 'Property insurance policies', 'Location': 'Safe in General Manager office + Digital SharePoint', 'Backup Location': 'Attorney office + Cloud backup', 'Responsible Person': 'Patricia Williams, Finance Director', 'Update Frequency': 'Annual renewal plus any major changes' },
        { 'Record Type': 'Business liability insurance', 'Location': 'Safe + Digital SharePoint', 'Backup Location': 'Attorney office + Cloud backup', 'Responsible Person': 'Patricia Williams, Finance Director', 'Update Frequency': 'Annual renewal' },
        { 'Record Type': 'Guest reservation database', 'Location': 'Cloud-based system (AWS)', 'Backup Location': 'Daily automated backups to separate cloud region', 'Responsible Person': 'James Rodriguez, IT Manager', 'Update Frequency': 'Real-time, continuous backups' },
        { 'Record Type': 'Employee records and contracts', 'Location': 'HR system + Digital SharePoint', 'Backup Location': 'Cloud backup', 'Responsible Person': 'HR Manager', 'Update Frequency': 'As needed when hiring/changes occur' },
        { 'Record Type': 'Financial records and accounts', 'Location': 'Accounting system + Physical files in safe', 'Backup Location': 'Cloud backup + Accountant office', 'Responsible Person': 'Patricia Williams, Finance Director', 'Update Frequency': 'Daily' },
        { 'Record Type': 'Building permits and licenses', 'Location': 'Safe + Digital copies SharePoint', 'Backup Location': 'Attorney office', 'Responsible Person': 'Sarah Johnson, General Manager', 'Update Frequency': 'As renewed or when regulations change' },
        { 'Record Type': 'Supplier contracts and agreements', 'Location': 'Digital SharePoint contracts folder', 'Backup Location': 'Cloud backup', 'Responsible Person': 'Michael Chen, Operations Manager', 'Update Frequency': 'As contracts updated or renewed' },
        { 'Record Type': 'Emergency contact lists', 'Location': 'Digital SharePoint + Physical in emergency kits', 'Backup Location': 'Cloud + Multiple physical copies', 'Responsible Person': 'All department managers', 'Update Frequency': 'Quarterly review and update' }
      ]
    },
    
    // STEP 10: Testing and Maintenance
    TESTING_AND_MAINTENANCE: {
      'Plan Testing Schedule': [
        { 'Test Type': 'Tabletop exercise - Hurricane scenario', 'Frequency': 'Quarterly', 'Next Date': '2025-04-15', 'Responsible': 'Emergency Response Team', 'Participants': 'All department heads and supervisors' },
        { 'Test Type': 'Fire drill and full evacuation', 'Frequency': 'Bi-annual', 'Next Date': '2025-03-01', 'Responsible': 'Safety Officer / Fire Marshal', 'Participants': 'All staff and guests present' },
        { 'Test Type': 'IT system failover test', 'Frequency': 'Quarterly', 'Next Date': '2025-02-15', 'Responsible': 'IT Manager', 'Participants': 'IT team + Operations + Finance' },
        { 'Test Type': 'Full-scale emergency simulation', 'Frequency': 'Annual', 'Next Date': '2025-06-01', 'Responsible': 'General Manager', 'Participants': 'Entire organization with external observers' },
        { 'Test Type': 'Communication system test', 'Frequency': 'Monthly', 'Next Date': '2025-02-01', 'Responsible': 'Communications Officer', 'Participants': 'Emergency Response Team members' }
      ],
      'Training Schedule': [
        { 'Training Topic': 'Emergency response procedures', 'Frequency': 'Quarterly for all staff', 'Next Date': '2025-04-01', 'Duration': '2 hours', 'Trainer': 'External emergency management expert' },
        { 'Training Topic': 'First aid and CPR certification', 'Frequency': 'Annual certification', 'Next Date': '2025-05-15', 'Duration': '1 full day', 'Trainer': 'Red Cross certified instructor' },
        { 'Training Topic': 'Hurricane preparedness', 'Frequency': 'Annual (before hurricane season)', 'Next Date': '2025-05-01', 'Duration': '3 hours', 'Trainer': 'Dept. of Emergency Management' },
        { 'Training Topic': 'Cybersecurity awareness', 'Frequency': 'Quarterly', 'Next Date': '2025-03-01', 'Duration': '1 hour online', 'Trainer': 'IT Security Consultant' }
      ],
      'Performance Metrics': [
        { 'Metric': 'Emergency response time', 'Target': 'Under 15 minutes', 'Measurement Method': 'Time stamps during drills and actual events', 'Review Frequency': 'After each drill or incident' },
        { 'Metric': 'Staff training completion rate', 'Target': '100% participation', 'Measurement Method': 'Training attendance records', 'Review Frequency': 'Quarterly review of completion rates' },
        { 'Metric': 'System backup success rate', 'Target': '99.9% successful backups', 'Measurement Method': 'Automated backup logs reviewed', 'Review Frequency': 'Weekly automated reports' },
        { 'Metric': 'Recovery time for critical systems', 'Target': 'Under 4 hours', 'Measurement Method': 'Failover test results', 'Review Frequency': 'Quarterly during system tests' }
      ],
      'Improvement Tracking': [
        { 'Issue Identified': 'Slow evacuation during last fire drill (8 minutes, target 5)', 'Action Required': 'Install additional emergency exit signs and glow strips', 'Responsible': 'Facilities Manager', 'Due Date': '2025-02-28', 'Status': 'In Progress' },
        { 'Issue Identified': 'Outdated contact information for 3 suppliers discovered', 'Action Required': 'Verify and update all supplier contacts quarterly', 'Responsible': 'Operations Manager', 'Due Date': '2025-01-31', 'Status': 'Completed' },
        { 'Issue Identified': 'Backup generator fuel capacity insufficient for 72 hours', 'Action Required': 'Increase fuel storage capacity by 50%', 'Responsible': 'Facilities Manager', 'Due Date': '2025-03-31', 'Status': 'Pending budget approval' }
      ],
      'Annual Review Process': 'The Business Continuity Plan will undergo comprehensive annual review led by the General Manager with participation from the Emergency Response Team and all department heads. The review process includes: (1) Assessment of all identified risks and evaluation of mitigation effectiveness; (2) Complete update of all contact information, supplier lists, and emergency service details; (3) Integration of lessons learned from drills, tests, and any actual emergency activations; (4) Alignment with changes in business operations, facilities, staffing, or organizational structure; (5) Review and update of insurance coverage to ensure adequacy; (6) Validation of technology dependencies and system recovery procedures; (7) Confirmation that all training requirements have been met and certifications are current; (8) Review of testing results and performance metrics against established targets; (9) Update of vital records inventory and backup procedures; (10) Final approval and distribution of updated plan to all stakeholders.',
      'Trigger Events for Plan Updates': 'In addition to the annual review, the Business Continuity Plan will be updated immediately upon occurrence of any of the following trigger events: (1) Significant changes in business operations, services offered, or facilities (e.g., new building, major renovation, service expansion); (2) Actual activation of the plan during a real emergency, followed by post-incident review and lessons learned integration; (3) Major changes in key personnel, particularly Emergency Response Team members or department heads; (4) Acquisition of new properties, assets, or business units; (5) Changes in applicable laws, regulations, or industry standards affecting business continuity requirements; (6) Significant changes to supplier relationships, especially critical vendors; (7) Major technology system upgrades, replacements, or cloud service migrations; (8) Identification of significant gaps, weaknesses, or failures during testing, drills, or audits; (9) Changes in the risk environment (e.g., new threats identified, changes in regional disaster patterns); (10) Organizational restructuring or changes in reporting relationships affecting emergency response; (11) Changes in insurance coverage or requirements from insurers; (12) Feedback or recommendations from external auditors, consultants, or regulatory bodies.'
    }
  }
  
  // Pre-fill data (for industry-based features)
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
    preFilledFields: {},
    contextualExamples: {},
    recommendedStrategies: []
  }
  
  // Save to localStorage
  try {
    localStorage.setItem('bcp-draft', JSON.stringify(formData))
    localStorage.setItem('bcp-industry-selected', 'true')
    localStorage.setItem('bcp-prefill-data', JSON.stringify(preFillData))
    
    console.log('✅ Sample data saved successfully!')
    console.log('📊 Sections filled:', Object.keys(formData).length)
    console.log('  - PLAN_INFORMATION')
    console.log('  - BUSINESS_OVERVIEW')
    console.log('  - ESSENTIAL_FUNCTIONS')
    console.log('  - FUNCTION_PRIORITIES')
    console.log('  - RISK_ASSESSMENT (6 risks)')
    console.log('  - STRATEGIES (32 strategies + long-term)')
    console.log('  - ACTION_PLAN (team, communication, evacuation, locations)')
    console.log('  - CONTACTS_AND_INFORMATION (staff, suppliers, customers, emergency)')
    console.log('  - VITAL_RECORDS (8 record types)')
    console.log('  - TESTING_AND_MAINTENANCE (schedules, metrics, improvements)')
    console.log('\n🔄 Refreshing page in 2 seconds...')
    console.log('📄 After refresh, navigate through the wizard to see the filled data')
    console.log('   Go to the last step to see the complete Business Plan Review document')
    
    setTimeout(() => {
      window.location.reload()
    }, 2000)
    
    return { success: true, sections: Object.keys(formData) }
  } catch (error) {
    console.error('❌ Error:', error)
    return { success: false, error: error.message }
  }
})()








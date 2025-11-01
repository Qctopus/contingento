/**
 * COMPLETE PLAN FILLER - FIXED VERSION
 * Uses EXACT field names that the wizard expects
 */

(function fillCompletePlan() {
  console.log('🎯 Filling COMPLETE plan with CORRECT field names...')
  
  const formData = {
    
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
    
    BUSINESS_OVERVIEW: {
      'Business License Number': 'BRB-TOURISM-2023-05678',
      'Business Purpose': 'Caribbean Resort & Spa Ltd. provides luxury beachfront accommodation, fine dining experiences, full-service spa treatments, and water sports activities to international tourists seeking authentic Caribbean hospitality. Our mission is to deliver exceptional guest experiences while maintaining sustainable operations and contributing to the local Barbadian community through employment and partnerships with local suppliers.',
      'Products and Services': '150 luxury rooms and suites with ocean or garden views; Three restaurants (fine dining, casual beachfront grill, poolside bar); Full-service spa with 8 treatment rooms offering massages, facials, and wellness programs; Water sports center with kayaking, paddleboarding, snorkeling, and diving; Conference and event facilities for up to 200 guests; Wedding planning and coordination services; Guided island tours and excursions; 24-hour concierge and guest services.',
      'Service Delivery Methods': 'Physical resort location with 150 rooms on 5 acres of beachfront property. Services delivered on-site at the resort. Online booking through our website and major travel platforms (Booking.com, Expedia). Phone reservations via our call center. Partnerships with luxury travel agencies and tour operators for package bookings. Catering and event services can be provided off-site for special occasions.',
      'Operating Hours': '24/7 guest services and security. Restaurant: Breakfast 7-11 AM, Lunch 12-3 PM, Dinner 6-11 PM daily. Spa: 9 AM to 8 PM daily. Water sports: 8 AM to 6 PM daily (weather permitting). Reception and concierge: 24 hours. Peak season December-April with extended spa and restaurant hours.',
      'Key Personnel Involved': 'Sarah Johnson (General Manager), Michael Chen (Operations Manager), Patricia Williams (Finance Director), David Martinez (Marketing Director), Lisa Thompson (Executive Chef - 15 years experience), James Rodriguez (IT Manager), Robert Taylor (Facilities Manager), Maria Santos (Spa Director), 45 full-time staff, 15 part-time seasonal staff. Key suppliers: Caribbean Food Distributors (daily produce), Island Power Solutions (generator maintenance), Atlantic Linen Services (daily linen), TechCare IT (24/7 support).',
      'Minimum Resource Requirements': 'Minimum 25 staff (10 housekeeping, 5 front desk, 5 kitchen, 3 maintenance, 2 security). Essential equipment: Reservation system, payment processing, 2 backup generators, water supply and treatment, WiFi network, kitchen equipment (refrigeration, stoves), laundry facilities. Critical records: Guest reservations database, employee contact list, supplier agreements, insurance policies, property deeds, financial accounts access.',
      'Customer Base': 'Primary: North American tourists aged 35-65 seeking luxury Caribbean vacations (60% of bookings, average stay 5-7 nights). Secondary: European travelers from UK, Germany, France (25%, average 10-14 nights). Tertiary: Regional Caribbean business travelers and weekend guests (10%). Special: Destination wedding couples and groups (5%, high-value bookings). VIP clients include repeat guests (loyalty program with 500 members), corporate retreat groups, and celebrity guests requiring privacy.',
      'Service Provider BCP Status': 'partial'
    },
    
    ESSENTIAL_FUNCTIONS: {
      'Business Functions': [
        { 'Business Function': 'Guest check-in and room access systems', 'Description': 'Electronic key card system, reservation database, room assignment, check-in/out processing', 'Priority Level': 'critical', 'Maximum Acceptable Downtime': '0-2h', 'Critical Resources Needed': 'Reservation system, key card programmer, front desk staff (2 min), backup manual check-in procedures' },
        { 'Business Function': 'Payment processing and billing', 'Description': 'Credit card processing, cash handling, billing system, accounts receivable', 'Priority Level': 'critical', 'Maximum Acceptable Downtime': '0-2h', 'Critical Resources Needed': 'Payment terminals (3), internet connection, backup manual card imprinters, cash registers, finance staff' },
        { 'Business Function': 'Food service operations', 'Description': 'Kitchen operations, meal preparation, restaurant service, food safety', 'Priority Level': 'critical', 'Maximum Acceptable Downtime': '2-8h', 'Critical Resources Needed': 'Kitchen equipment, refrigeration, chef + 2 cooks minimum, food inventory, gas/electricity, water supply' },
        { 'Business Function': 'Water supply and sewage systems', 'Description': 'Municipal water supply, backup water storage, sewage treatment, pool water circulation', 'Priority Level': 'critical', 'Maximum Acceptable Downtime': '0-2h', 'Critical Resources Needed': '50,000 gallon backup water tank, water pumps, sewage system, maintenance staff, water treatment chemicals' },
        { 'Business Function': 'Electrical power supply', 'Description': 'Main power grid, backup generators, emergency lighting, critical system power', 'Priority Level': 'critical', 'Maximum Acceptable Downtime': '2-8h', 'Critical Resources Needed': '3 backup generators (total 500kW), fuel tank (5000 gallon), UPS systems for IT, electrician on call' },
        { 'Business Function': 'Housekeeping and room turnover', 'Description': 'Room cleaning, linen service, laundry operations, room preparation for new guests', 'Priority Level': 'important', 'Maximum Acceptable Downtime': '8-24h', 'Critical Resources Needed': 'Housekeeping staff (10 min), cleaning supplies, linen inventory, laundry equipment, external laundry backup' },
        { 'Business Function': 'Reservation and booking system', 'Description': 'Online bookings, phone reservations, availability management, booking confirmations', 'Priority Level': 'important', 'Maximum Acceptable Downtime': '8-24h', 'Critical Resources Needed': 'Reservation software, internet, phone system, front desk staff, backup manual reservation log' },
        { 'Business Function': 'Internet and WiFi services', 'Description': 'Guest WiFi, business operations internet, VoIP phone system, online payment processing', 'Priority Level': 'important', 'Maximum Acceptable Downtime': '8-24h', 'Critical Resources Needed': 'Primary ISP (fiber 500Mbps), backup ISP (cable 100Mbps), WiFi access points (25), network switches, IT support' },
        { 'Business Function': 'Security and guest safety', 'Description': '24/7 security personnel, CCTV monitoring, access control, emergency response', 'Priority Level': 'critical', 'Maximum Acceptable Downtime': '0-2h', 'Critical Resources Needed': 'Security staff (2 on duty 24/7), CCTV system, security radios, guest safe system, emergency lighting' },
        { 'Business Function': 'Spa and wellness center', 'Description': 'Massage therapy, facial treatments, wellness programs, spa reception', 'Priority Level': 'useful', 'Maximum Acceptable Downtime': '3-7d', 'Critical Resources Needed': 'Spa therapists (4), treatment rooms (8), massage tables, spa products, booking system' },
        { 'Business Function': 'Water sports and recreation', 'Description': 'Kayaks, paddleboards, snorkel equipment, beach services, equipment maintenance', 'Priority Level': 'useful', 'Maximum Acceptable Downtime': '3-7d', 'Critical Resources Needed': 'Water sports staff (2), equipment inventory, safety equipment, beach facility, weather monitoring' }
      ]
    },
    
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
    
    RISK_ASSESSMENT: {
      // Selected hazards - array of hazard ID strings (needed for API calls)
      'Potential Hazards': ['hurricane', 'power_outage', 'water_contamination', 'cyber_attack', 'staff_loss', 'supply_chain'],
      // Full risk assessment matrix with details AND backend calculation data
      'Risk Assessment Matrix': [
        { 
          'Hazard': 'Hurricane/Tropical Storm', 
          'Likelihood': 'Likely (7-8)', 
          'Severity': 'Catastrophic (9-10)', 
          'Risk Level': 'Very High', 
          'Recommended Actions': 'Install hurricane shutters on all windows and glass doors; Maintain 72-hour emergency supply kit including water, food, first aid, flashlights, batteries; Establish guest and staff evacuation procedures and assembly points; Ensure backup power generation capacity for critical systems; Secure outdoor furniture and equipment; Establish agreements with mainland hotels for guest relocation; Train staff on hurricane preparedness annually before season',
          hazardId: 'hurricane',
          isPreSelected: true,
          riskTier: 1,
          initialTier: 1,
          riskScore: 8.5,
          initialRiskScore: 8.5,
          baseScore: 7.8,
          reasoning: 'Coastal location in Caribbean hurricane zone with historical hurricane impacts'
        },
        { 
          'Hazard': 'Extended Power Outage', 
          'Likelihood': 'Possible (4-6)', 
          'Severity': 'Major (7-8)', 
          'Risk Level': 'High', 
          'Recommended Actions': 'Maintain three backup generators with capacity for critical operations (refrigeration, elevators, emergency lighting, water pumps); Keep minimum 72-hour fuel reserve on-site with agreements for emergency fuel delivery; Install battery backup systems for reservation and payment systems; Develop manual procedures for check-in, billing, and essential services; Test generators monthly and under load quarterly',
          hazardId: 'power_outage',
          isPreSelected: true,
          riskTier: 1,
          initialTier: 1,
          riskScore: 7.2,
          initialRiskScore: 7.2,
          baseScore: 6.5,
          reasoning: 'Island infrastructure vulnerabilities during storms'
        },
        { 
          'Hazard': 'Water Contamination', 
          'Likelihood': 'Unlikely (2-3)', 
          'Severity': 'Major (7-8)', 
          'Risk Level': 'Medium', 
          'Recommended Actions': 'Implement daily water quality testing protocols; Maintain relationships with bottled water suppliers for emergency bulk delivery; Install backup water purification system; Store minimum 48-hour supply of bottled water for guests and kitchen; Develop protocols for guest communication in case of water advisory; Train staff on waterborne illness prevention',
          hazardId: 'water_contamination',
          isPreSelected: true,
          riskTier: 2,
          initialTier: 2,
          riskScore: 5.5,
          initialRiskScore: 5.5,
          baseScore: 5.0,
          reasoning: 'Potential for water supply issues after natural disasters'
        },
        { 
          'Hazard': 'Cyber Attack / Ransomware', 
          'Likelihood': 'Possible (4-6)', 
          'Severity': 'Major (7-8)', 
          'Risk Level': 'High', 
          'Recommended Actions': 'Implement enterprise-grade firewall and intrusion detection systems; Conduct daily automated backups of all systems to offline and cloud storage; Train staff quarterly on phishing and social engineering prevention; Maintain cyber insurance coverage; Develop incident response plan with IT security consultant; Keep printed backup of critical guest reservations and contact information',
          hazardId: 'cyber_attack',
          isPreSelected: true,
          riskTier: 1,
          initialTier: 1,
          riskScore: 7.0,
          initialRiskScore: 7.0,
          baseScore: 6.2,
          reasoning: 'Hospitality industry increasingly targeted, high data volumes'
        },
        { 
          'Hazard': 'Key Staff Unavailability', 
          'Likelihood': 'Likely (7-8)', 
          'Severity': 'Moderate (4-6)', 
          'Risk Level': 'High', 
          'Recommended Actions': 'Cross-train all department supervisors on critical operations; Document all standard operating procedures with step-by-step guides; Maintain current contact list for temporary staffing agencies; Develop succession planning for all key positions; Keep updated emergency contact information for all staff; Establish relationships with other hotels for staff sharing in emergencies',
          hazardId: 'staff_loss',
          isPreSelected: true,
          riskTier: 1,
          initialTier: 1,
          riskScore: 7.5,
          initialRiskScore: 7.5,
          baseScore: 6.8,
          reasoning: 'Service-dependent industry with specialized staff requirements'
        },
        { 
          'Hazard': 'Supply Chain Disruption', 
          'Likelihood': 'Possible (4-6)', 
          'Severity': 'Moderate (4-6)', 
          'Risk Level': 'Medium', 
          'Recommended Actions': 'Diversify critical suppliers (identify 2-3 vendors for food, linen, beverages); Maintain 10-14 day inventory of non-perishable essentials; Establish relationships with local farmers and producers as backup; Document all supplier contact information and order procedures; Review supplier business continuity plans annually; Consider bulk purchasing agreements with neighboring hotels for emergency sharing',
          hazardId: 'supply_chain',
          isPreSelected: true,
          riskTier: 2,
          initialTier: 2,
          riskScore: 5.8,
          initialRiskScore: 5.8,
          baseScore: 5.2,
          reasoning: 'Island location dependent on imports for food and supplies'
        }
      ]
    },
    
    // NOTE: STRATEGIES will be auto-loaded from the admin database based on risks
    // The wizard will auto-select strategies based on the risk profile
    // This happens dynamically in the AdminStrategyCards component
    
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
        { 'Name': 'Sarah Johnson', 'Position': 'General Manager', 'Phone Number': '+1-246-555-0100', 'Email Address': 'sarah.johnson@caribbeanresort.com', 'Emergency Contact': 'Husband: +1-246-555-9100' },
        { 'Name': 'Michael Chen', 'Position': 'Operations Manager', 'Phone Number': '+1-246-555-0101', 'Email Address': 'michael.chen@caribbeanresort.com', 'Emergency Contact': 'Wife: +1-246-555-9101' },
        { 'Name': 'Patricia Williams', 'Position': 'Finance Director', 'Phone Number': '+1-246-555-0102', 'Email Address': 'patricia.williams@caribbeanresort.com', 'Emergency Contact': 'Sister: +1-246-555-9102' },
        { 'Name': 'David Martinez', 'Position': 'Marketing Director', 'Phone Number': '+1-246-555-0103', 'Email Address': 'david.martinez@caribbeanresort.com', 'Emergency Contact': 'Mother: +1-246-555-9103' },
        { 'Name': 'Lisa Thompson', 'Position': 'Executive Chef', 'Phone Number': '+1-246-555-0104', 'Email Address': 'lisa.thompson@caribbeanresort.com', 'Emergency Contact': 'Partner: +1-246-555-9104' }
      ],
      'Key Customer Contacts': [
        { 'Customer Name': 'Luxury Travel Partners', 'Type/Notes': 'Major booking agency - 30% of annual bookings', 'Phone Number': '+1-305-555-3000', 'Email Address': 'robert.anderson@luxurytravel.com', 'Special Requirements': 'Weekly booking reports, priority support hotline' },
        { 'Customer Name': 'Global Events Corp', 'Type/Notes': 'Corporate event organizer - regular conferences', 'Phone Number': '+1-212-555-3001', 'Email Address': 'jennifer.lee@globalevents.com', 'Special Requirements': '24-hour event coordination, AV equipment' },
        { 'Customer Name': 'Caribbean Weddings Ltd', 'Type/Notes': 'Wedding planner - 15 events per year', 'Phone Number': '+1-246-555-3002', 'Email Address': 'amanda@caribbeanweddings.com', 'Special Requirements': 'Dedicated wedding coordinator, custom catering' }
      ],
      'Supplier Information': [
        { 'Supplier Name': 'Caribbean Food Distributors', 'Goods/Services Supplied': 'Fresh produce, seafood, meats - daily deliveries', 'Phone Number': '+1-246-555-2000', 'Email Address': 'orders@caribbeanfood.com', 'Backup Supplier': 'Island Fresh Foods (+1-246-555-2010)' },
        { 'Supplier Name': 'Island Power Solutions', 'Goods/Services Supplied': 'Generator maintenance, emergency fuel delivery', 'Phone Number': '+1-246-555-2001', 'Email Address': 'service@islandpower.com', 'Backup Supplier': 'Emergency Power Services (+1-246-555-2011)' },
        { 'Supplier Name': 'TechCare IT Services', 'Goods/Services Supplied': 'IT systems, network support, 24/7 emergency', 'Phone Number': '+1-246-555-2002', 'Email Address': 'support@techcare.com', 'Backup Supplier': 'Barbados IT Solutions (+1-246-555-2012)' },
        { 'Supplier Name': 'Atlantic Linen Services', 'Goods/Services Supplied': 'Linen, towels, uniforms - daily service', 'Phone Number': '+1-246-555-2003', 'Email Address': 'orders@atlanticlinen.com', 'Backup Supplier': 'Caribbean Laundry Co. (+1-246-555-2013)' }
      ],
      'Emergency Services and Utilities': [
        { 'Service Type': 'Emergency Services', 'Organization Name': 'Barbados Emergency Services', 'Phone Number': '211 (Emergency Dispatch)', 'Email Address': 'N/A', 'Account Number': 'N/A' },
        { 'Service Type': 'Hospital', 'Organization Name': 'Queen Elizabeth Hospital', 'Phone Number': '+1-246-436-6450', 'Email Address': 'emergency@qeh.gov.bb', 'Account Number': 'N/A' },
        { 'Service Type': 'Electricity', 'Organization Name': 'Barbados Light & Power', 'Phone Number': '+1-246-626-7000 / Emergency: 626-7777', 'Email Address': 'customer@blpc.com.bb', 'Account Number': 'BLP-RESORT-05678' },
        { 'Service Type': 'Water', 'Organization Name': 'Barbados Water Authority', 'Phone Number': '+1-246-434-4200 / Emergency: 228-7700', 'Email Address': 'service@bwa.gov.bb', 'Account Number': 'BWA-COMMERCIAL-12345' },
        { 'Service Type': 'Emergency Management', 'Organization Name': 'Department of Emergency Management', 'Phone Number': '+1-246-511-4200', 'Email Address': 'info@dem.gov.bb', 'Account Number': 'Registered Business' },
        { 'Service Type': 'Insurance', 'Organization Name': 'Guardian General Insurance', 'Phone Number': '+1-246-462-2000 / Claims: 462-2100', 'Email Address': 'claims@guardian.bb', 'Account Number': 'Policy GGI-COM-789456' }
      ],
      'Critical Business Information': 'Business Registration: BRB-TOURISM-2023-05678 (Barbados Corporate Affairs); Property Deed: Lot 23-45, Christ Church (stored in safe + attorney office); Insurance Policies: Guardian General - Property GL-789456, Liability GL-789457, Business Interruption GL-789458 (all in safe + digital); Banking: FirstCaribbean International Bank - Main Account #123456789, Payroll Account #123456790; Tax ID: VAT123456789; Tourism Authority License: TL-2023-567 (renewed annually); Food Safety Certificates: Health Ministry Certificate #FS-2024-123 (kitchen + restaurants); Liquor Licenses: LL-2024-789 for all 3 restaurants/bars; Critical Vendor Contracts: Food supplier (3-year), Linen service (2-year), IT support (annual) - all in SharePoint + physical copies in safe; Employee Records: HR system (BambooHR) + backup external drive in safe; Guest Database: Cloud-based (AWS) with daily backups to separate region + weekly offline backup; Software Licenses: Reservation system, accounting (QuickBooks), payroll (ADP) - license keys in password manager; WiFi/Internet: Primary fiber 500Mbps (Flow), Backup cable 100Mbps (Digicel); Phone System: VoIP through TechCare IT, backup landlines for emergency.',
      'Plan Distribution List': [
        { 'Name/Position': 'Sarah Johnson (General Manager)', 'Format Received': 'Electronic + Hard copy', 'Date Provided': '2025-01-15', 'Version Number': '1.0', 'Acknowledgment': 'Signed and filed' },
        { 'Name/Position': 'Michael Chen (Operations Manager)', 'Format Received': 'Electronic + Hard copy', 'Date Provided': '2025-01-15', 'Version Number': '1.0', 'Acknowledgment': 'Signed and filed' },
        { 'Name/Position': 'Emergency Response Team (All 6 members)', 'Format Received': 'Electronic', 'Date Provided': '2025-01-15', 'Version Number': '1.0', 'Acknowledgment': 'Email confirmation received' },
        { 'Name/Position': 'All Department Heads', 'Format Received': 'Electronic', 'Date Provided': '2025-01-16', 'Version Number': '1.0', 'Acknowledgment': 'Distributed via SharePoint' },
        { 'Name/Position': 'Guardian General Insurance', 'Format Received': 'Electronic', 'Date Provided': '2025-01-20', 'Version Number': '1.0', 'Acknowledgment': 'Submitted with policy renewal' },
        { 'Name/Position': 'Board of Directors', 'Format Received': 'Electronic', 'Date Provided': '2025-01-22', 'Version Number': '1.0', 'Acknowledgment': 'Approved at board meeting' }
      ]
    },
    
    VITAL_RECORDS: {
      'Vital Records Inventory': [
        { 'Record Type': 'Property insurance policies', 'Primary Location': 'Safe in General Manager office + Digital SharePoint', 'Backup Location': 'Attorney office (physical) + AWS Cloud (digital)', 'Recovery Priority': 'HIGH' },
        { 'Record Type': 'Business liability insurance', 'Primary Location': 'Safe + Digital SharePoint', 'Backup Location': 'Attorney office + AWS Cloud', 'Recovery Priority': 'HIGH' },
        { 'Record Type': 'Guest reservation database', 'Primary Location': 'Cloud-based system (AWS US-East)', 'Backup Location': 'Daily automated backups to AWS EU-West + Weekly offline backup', 'Recovery Priority': 'HIGH' },
        { 'Record Type': 'Employee records and contracts', 'Primary Location': 'BambooHR system + Digital SharePoint', 'Backup Location': 'External encrypted drive in safe + AWS Cloud', 'Recovery Priority': 'HIGH' },
        { 'Record Type': 'Financial records and accounts', 'Primary Location': 'QuickBooks Online + Physical files in safe', 'Backup Location': 'QuickBooks automatic cloud backup + Accountant office copies', 'Recovery Priority': 'HIGH' },
        { 'Record Type': 'Building permits and licenses', 'Primary Location': 'Safe + Digital copies SharePoint', 'Backup Location': 'Attorney office + Government archives', 'Recovery Priority': 'HIGH' },
        { 'Record Type': 'Supplier contracts and agreements', 'Primary Location': 'Digital SharePoint contracts folder', 'Backup Location': 'AWS Cloud backup + Physical copies in safe', 'Recovery Priority': 'MEDIUM' },
        { 'Record Type': 'Emergency contact lists', 'Primary Location': 'Digital SharePoint + Physical in emergency kits (3 locations)', 'Backup Location': 'Cloud backup + Each manager has printed copy', 'Recovery Priority': 'HIGH' }
      ]
    },
    
    TESTING_AND_MAINTENANCE: {
      'Plan Testing Schedule': [
        { 'Test Type': 'Tabletop exercise', 'What is Tested': 'Hurricane scenario - full emergency response team coordination', 'Frequency': 'Quarterly', 'Next Test Date': '2025-04-15', 'Success Criteria': 'All team members respond within 30 min, key decisions made', 'Responsible Person': 'Sarah Johnson (GM)' },
        { 'Test Type': 'Fire drill', 'What is Tested': 'Full property evacuation - all staff and guests', 'Frequency': 'Bi-annual', 'Next Test Date': '2025-03-01', 'Success Criteria': 'Complete evacuation under 10 minutes, 100% accountability', 'Responsible Person': 'Robert Taylor (Facilities)' },
        { 'Test Type': 'IT failover', 'What is Tested': 'Reservation system and network redundancy', 'Frequency': 'Quarterly', 'Next Test Date': '2025-02-15', 'Success Criteria': 'Backup systems online within 15 minutes, no data loss', 'Responsible Person': 'James Rodriguez (IT)' },
        { 'Test Type': 'Full simulation', 'What is Tested': 'Complete emergency scenario with external observers', 'Frequency': 'Annual', 'Next Test Date': '2025-06-01', 'Success Criteria': 'Pass external audit, all procedures followed correctly', 'Responsible Person': 'Sarah Johnson + External auditor' },
        { 'Test Type': 'Communication', 'What is Tested': 'Emergency notification system for all staff', 'Frequency': 'Monthly', 'Next Test Date': '2025-02-01', 'Success Criteria': '95% staff respond within 20 minutes', 'Responsible Person': 'David Martinez (Comms)' }
      ],
      'Plan Revision History': [
        { 'Version': '1.0', 'Date Updated': '2025-01-15', 'Changes Made': 'Initial business continuity plan creation and approval', 'Updated By': 'Sarah Johnson (General Manager)', 'Reason for Update': 'New comprehensive business continuity plan required for insurance and best practices' },
        { 'Version': '1.1', 'Date Updated': 'Planned for 2025-04-01', 'Changes Made': 'Updates based on Q1 tabletop exercise findings', 'Updated By': 'Emergency Response Team', 'Reason for Update': 'Incorporating lessons learned from quarterly testing' },
        { 'Version': '2.0', 'Date Updated': 'Planned for 2026-01-15', 'Changes Made': 'Annual comprehensive review and update', 'Updated By': 'Sarah Johnson + All Department Heads', 'Reason for Update': 'Annual review cycle per plan maintenance schedule' }
      ],
      'Improvement Tracking': [
        { 'Issue Identified': 'Last fire drill evacuation took 12 minutes (target: under 10)', 'Improvement Action': 'Install additional emergency exit signs and glow-in-dark floor strips in hallways', 'Priority Level': 'High', 'Target Completion': '2025-02-28', 'Status': 'In Progress - Materials ordered' },
        { 'Issue Identified': 'Three supplier contacts were outdated during annual verification', 'Improvement Action': 'Implement quarterly supplier contact verification process', 'Priority Level': 'Medium', 'Target Completion': '2025-01-31', 'Status': 'Completed - Process documented' },
        { 'Issue Identified': 'Backup generator #2 failed to start during monthly test', 'Improvement Action': 'Increase generator maintenance frequency and fuel storage capacity', 'Priority Level': 'High', 'Target Completion': '2025-03-31', 'Status': 'Pending - Budget approval needed' },
        { 'Issue Identified': 'Staff unfamiliar with manual check-in procedures during IT test', 'Improvement Action': 'Create laminated quick reference cards and conduct hands-on training', 'Priority Level': 'High', 'Target Completion': '2025-02-15', 'Status': 'In Progress - Cards being designed' }
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
      'Annual Review Process': 'The Business Continuity Plan will undergo comprehensive annual review led by the General Manager with participation from the Emergency Response Team and all department heads. The review process includes: (1) Assessment of all identified risks and evaluation of mitigation effectiveness; (2) Complete update of all contact information, supplier lists, and emergency service details; (3) Integration of lessons learned from drills, tests, and any actual emergency activations; (4) Alignment with changes in business operations, facilities, staffing, or organizational structure; (5) Review and update of insurance coverage to ensure adequacy; (6) Validation of technology dependencies and system recovery procedures; (7) Confirmation that all training requirements have been met and certifications are current; (8) Review of testing results and performance metrics against established targets; (9) Update of vital records inventory and backup procedures; (10) Final approval and distribution of updated plan to all stakeholders.',
      'Trigger Events for Plan Updates': 'In addition to the annual review, the Business Continuity Plan will be updated immediately upon occurrence of any of the following trigger events: (1) Significant changes in business operations, services offered, or facilities (e.g., new building, major renovation, service expansion); (2) Actual activation of the plan during a real emergency, followed by post-incident review and lessons learned integration; (3) Major changes in key personnel, particularly Emergency Response Team members or department heads; (4) Acquisition of new properties, assets, or business units; (5) Changes in applicable laws, regulations, or industry standards affecting business continuity requirements; (6) Significant changes to supplier relationships, especially critical vendors; (7) Major technology system upgrades, replacements, or cloud service migrations; (8) Identification of significant gaps, weaknesses, or failures during testing, drills, or audits; (9) Changes in the risk environment (e.g., new threats identified, changes in regional disaster patterns); (10) Organizational restructuring or changes in reporting relationships affecting emergency response; (11) Changes in insurance coverage or requirements from insurers; (12) Feedback or recommendations from external auditors, consultants, or regulatory bodies.'
    }
  }
  
  const preFillData = {
    industry: { id: 'hospitality_tourism', name: 'Hospitality & Tourism' },
    location: { country: 'Barbados', countryCode: 'BB', parish: 'Christ Church', nearCoast: true, urbanArea: true },
    businessCharacteristics: { employeeCount: '10-50', annualRevenue: '500k-1m', hasPhysicalLocation: true, hasOnlinePresence: true, hasInventory: true, dependsOnSupplyChain: true, hasCustomerData: true, usesCloudServices: true },
    
    // CRITICAL: Hazards array that SimplifiedRiskAssessment looks for
    hazards: [
      {
        hazardId: 'hurricane',
        hazardName: 'Hurricane/Tropical Storm',
        riskLevel: 'very_high',
        frequency: 'likely',
        impact: 'catastrophic',
        likelihood: 8,
        severity: 9,
        riskScore: 8.5,
        isPreSelected: true,
        isAvailable: true,
        reasoning: 'Coastal location in Caribbean hurricane zone with historical hurricane impacts',
        isCalculated: true,
        riskTier: 1,
        riskCategory: 'Natural Disaster'
      },
      {
        hazardId: 'power_outage',
        hazardName: 'Extended Power Outage',
        riskLevel: 'high',
        frequency: 'possible',
        impact: 'major',
        likelihood: 5,
        severity: 8,
        riskScore: 6.5,
        isPreSelected: true,
        isAvailable: true,
        reasoning: 'Island infrastructure vulnerabilities during storms',
        isCalculated: true,
        riskTier: 1,
        riskCategory: 'Infrastructure'
      },
      {
        hazardId: 'water_contamination',
        hazardName: 'Water Contamination',
        riskLevel: 'medium',
        frequency: 'unlikely',
        impact: 'major',
        likelihood: 3,
        severity: 7,
        riskScore: 5.0,
        isPreSelected: true,
        isAvailable: true,
        reasoning: 'Potential for water supply issues after natural disasters',
        isCalculated: true,
        riskTier: 2,
        riskCategory: 'Utilities'
      },
      {
        hazardId: 'cyber_attack',
        hazardName: 'Cyber Attack / Ransomware',
        riskLevel: 'high',
        frequency: 'possible',
        impact: 'major',
        likelihood: 5,
        severity: 7,
        riskScore: 6.0,
        isPreSelected: true,
        isAvailable: true,
        reasoning: 'Hospitality industry increasingly targeted, high data volumes',
        isCalculated: true,
        riskTier: 1,
        riskCategory: 'Technology'
      },
      {
        hazardId: 'staff_loss',
        hazardName: 'Key Staff Unavailability',
        riskLevel: 'high',
        frequency: 'likely',
        impact: 'moderate',
        likelihood: 7,
        severity: 6,
        riskScore: 6.5,
        isPreSelected: true,
        isAvailable: true,
        reasoning: 'Service-dependent industry with specialized staff requirements',
        isCalculated: true,
        riskTier: 1,
        riskCategory: 'Operational'
      },
      {
        hazardId: 'supply_chain',
        hazardName: 'Supply Chain Disruption',
        riskLevel: 'medium',
        frequency: 'possible',
        impact: 'moderate',
        likelihood: 5,
        severity: 5,
        riskScore: 5.0,
        isPreSelected: true,
        isAvailable: true,
        reasoning: 'Island location dependent on imports for food and supplies',
        isCalculated: true,
        riskTier: 2,
        riskCategory: 'Supply Chain'
      }
    ],
    
    // Pre-filled fields including risk assessment
    // NOTE: STRATEGIES intentionally left empty - will be auto-loaded from admin database
    preFilledFields: {
      RISK_ASSESSMENT: formData.RISK_ASSESSMENT
      // STRATEGIES not included - AdminStrategyCards will load from database based on risks
    },
    
    contextualExamples: {},
    
    // Recommended strategies will be auto-generated by the API based on risks
    // Leave empty so AdminStrategyCards component loads strategies from database
    // It will auto-select strategies based on: risks, industry, location
    recommendedStrategies: []
  }
  
  try {
    localStorage.setItem('bcp-draft', JSON.stringify(formData))
    localStorage.setItem('bcp-industry-selected', 'true')
    localStorage.setItem('bcp-prefill-data', JSON.stringify(preFillData))
    
    console.log('✅ COMPLETE PLAN SAVED with CORRECT field names!')
    console.log('\n📊 FormData (bcp-draft):')
    console.log('  ✅ Business Overview (9 fields including license)')
    console.log('  ✅ Essential Functions (11 detailed functions)')
    console.log('  ✅ Risk Assessment (6 risks with tier/selection data)')
    console.log('  ✅ Action Plan, Contacts, Vital Records, Testing')
    console.log('  ⚠️ Strategies NOT in formData - will auto-load from database')
    console.log('\n📦 PreFillData (bcp-prefill-data):')
    console.log('  ✅ Industry: Hospitality & Tourism')
    console.log('  ✅ Location: Christ Church, Barbados')
    console.log('  ✅ 6 Hazards with full backend calculation data')
    console.log('  ✅ Risk Tiers: 4 Tier-1 (Highly Recommended), 2 Tier-2 (Recommended)')
    console.log('  ⚠️ Strategies will be loaded from admin database (not pre-filled)')
    console.log('\n🎯 Risk Categorization:')
    console.log('  - Hurricane: TIER 1 (score 8.5) - Very High')
    console.log('  - Power Outage: TIER 1 (score 7.2) - High')
    console.log('  - Cyber Attack: TIER 1 (score 7.0) - High')
    console.log('  - Staff Loss: TIER 1 (score 7.5) - High')
    console.log('  - Water Contamination: TIER 2 (score 5.5) - Medium')
    console.log('  - Supply Chain: TIER 2 (score 5.8) - Medium')
    console.log('\n🎲 How Strategies Work:')
    console.log('  1. AdminStrategyCards will load strategies from database')
    console.log('  2. Auto-select based on risks, industry, and location')
    console.log('  3. You can manually select/deselect any strategy')
    console.log('  4. Selections will be saved as Strategy objects (not IDs)')
    console.log('\n🔄 Refreshing in 2 seconds...')
    
    setTimeout(() => window.location.reload(), 2000)
    
    return { success: true }
  } catch (error) {
    console.error('❌ Error:', error)
    return { success: false, error: error.message }
  }
})()


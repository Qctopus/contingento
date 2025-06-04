// Explicit type definitions for input configurations
type TextInput = {
  type: 'text';
  label: string;
  required: boolean;
  prompt: string;
  examples?: string[];
  options?: never;
  tableColumns?: never;
  tableRowsPrompt?: never;
  priorityOptions?: never;
  downtimeOptions?: never;
  dependsOn?: never;
};

type RadioInput = {
  type: 'radio';
  label: string;
  required: boolean;
  prompt: string;
  options: { label: string; value: string }[];
  examples?: string[];
  tableColumns?: never;
  tableRowsPrompt?: never;
  priorityOptions?: never;
  downtimeOptions?: never;
  dependsOn?: never;
};

type CheckboxInput = {
  type: 'checkbox';
  label: string;
  required: boolean; // Explicitly ensure this is part of the type
  prompt: string;
  options: { label: string; value: string }[];
  examples?: string[];
  tableColumns?: never;
  tableRowsPrompt?: never;
  priorityOptions?: never;
  downtimeOptions?: never;
  dependsOn?: never;
};

type TableInput = {
  type: 'table';
  label: string;
  required: boolean;
  prompt: string;
  tableColumns: string[];
  tableRowsPrompt?: string;
  examples?: string[];
  options?: never;
  priorityOptions?: { label: string; value: string }[];
  downtimeOptions?: { label: string; value: string }[];
  dependsOn?: string;
};

type SpecialRiskMatrixInput = {
  type: 'special_risk_matrix';
  label: string;
  required: boolean;
  prompt: string;
  examples?: string[];
  options?: never;
  tableColumns?: never;
  tableRowsPrompt?: never;
  priorityOptions?: never;
  downtimeOptions?: never;
  dependsOn?: never;
};

export type InputConfig = TextInput | RadioInput | CheckboxInput | TableInput | SpecialRiskMatrixInput;

type StepConfig = {
  title: string;
  description: string;
  inputs: InputConfig[];
};

export type StepsCollection = {
  readonly [key: string]: StepConfig;
};

export const STEPS: StepsCollection = {
  PLAN_INFORMATION: {
    title: 'Plan Information',
    description: 'Let\'s start by setting up the basic information for your business continuity plan.',
    inputs: [
      {
        type: 'text',
        label: 'Company Name',
        required: true,
        prompt: 'What is your company name?',
        examples: ['ABC Store', 'Caribbean Delights', 'Island Services Ltd.'],
      },
      {
        type: 'text',
        label: 'Plan Manager',
        required: true,
        prompt: 'Who is the person responsible for this business continuity plan? This should be someone with authority to make decisions.',
        examples: ['John Smith, Owner', 'Maria Rodriguez, Operations Manager', 'David Thompson, General Manager'],
      },
      {
        type: 'text',
        label: 'Alternate Manager',
        required: true,
        prompt: 'Who is the alternate person responsible if the main manager is unavailable?',
        examples: ['Sarah Johnson, Assistant Manager', 'Michael Brown, Supervisor', 'Lisa Williams, Senior Staff'],
      },
      {
        type: 'text',
        label: 'Plan Location',
        required: true,
        prompt: 'Where will copies of this business continuity plan be stored? Include both physical and digital locations.',
        examples: [
          'Fire-proof cabinet in office; Electronic version on company server',
          'Manager\'s office safe; Cloud storage with backup on external drive',
          'Reception desk locked drawer; Google Drive shared folder'
        ],
      },
    ],
  },

  BUSINESS_OVERVIEW: {
    title: 'Business Overview',
    description: 'Now let\'s understand your business operations in detail.',
    inputs: [
      {
        type: 'text',
        label: 'Business License Number',
        required: true,
        prompt: 'What is your business license number? This is usually found on your business registration documents.',
        examples: ['BL-12345', 'REG-2023-789', 'LIC-456789'],
      },
      {
        type: 'text',
        label: 'Business Purpose',
        required: true,
        prompt: 'What is the main purpose of your business? Think about why you started this business and what problem it solves for your customers.',
        examples: [
          'To provide fresh local produce to the community of St. George\'s',
          'To offer affordable home repair services throughout Barbados',
          'To create authentic Caribbean cuisine for tourists and locals in Montego Bay',
        ],
      },
      {
        type: 'text',
        label: 'Products and Services',
        required: true,
        prompt: 'What products and services do you provide? What makes your business special or unique?',
        examples: [
          'We sell fresh fruits, vegetables, and local spices. Our specialty is homemade hot sauce made from local scotch bonnet peppers.',
          'We provide plumbing and electrical services. What makes us special is our 24/7 emergency service and same-day repairs.',
          'We offer authentic Caribbean cuisine with a modern twist. Our specialty is our family recipe for jerk chicken passed down three generations.',
        ],
      },
      {
        type: 'text',
        label: 'Service Delivery Methods',
        required: true,
        prompt: 'How and where do you provide your products and services? Consider your physical location, delivery methods, and any online presence.',
        examples: [
          'Physical store in downtown Kingston with delivery to nearby parishes. Customers can order through our website or WhatsApp.',
          'We operate from our workshop but provide services at customer locations. We have a mobile service van for emergency calls.',
          'Restaurant in Bridgetown with takeout and delivery. We also cater for events and have a food truck for festivals.',
        ],
      },
      {
        type: 'text',
        label: 'Operating Hours',
        required: true,
        prompt: 'What are your operating hours and days? Include any seasonal variations or special hours.',
        examples: [
          'Monday to Saturday, 8 AM to 6 PM. Closed on Sundays and public holidays. Extended hours during Carnival season.',
          '24/7 for emergency services. Regular business hours Monday to Friday, 9 AM to 5 PM.',
          'Tuesday to Sunday, 11 AM to 10 PM. Extended hours during tourist season (December to April).',
        ],
      },
      {
        type: 'text',
        label: 'Key Personnel Involved',
        required: true,
        prompt: 'Who are the key people involved in running your business? Include employees, key suppliers, and contractors.',
        examples: [
          '3 full-time employees, 2 part-time staff, main supplier (Caribbean Foods Ltd), delivery contractor',
          'Owner-operator, 1 assistant, apprentice electrician, regular parts supplier (Island Hardware)',
          'Head chef, 2 cooks, 3 servers, manager, local farmers for produce, seafood supplier',
        ],
      },
      {
        type: 'text',
        label: 'Minimum Resource Requirements',
        required: true,
        prompt: 'What are the absolute minimum resources (personnel, equipment, records) needed to keep your business running?',
        examples: [
          '1 cashier, cash register, refrigeration for perishables, basic inventory, customer payment records',
          '1 qualified technician, basic tool kit, work van, customer contact list, licensing documents',
          '1 cook, basic kitchen equipment, core menu ingredients, customer seating for 20, food safety certificates',
        ],
      },
      {
        type: 'text',
        label: 'Customer Base',
        required: true,
        prompt: 'Who are your customers? Describe your main customer groups and any special customers who depend on you.',
        examples: [
          'Local families, small restaurants, elderly customers who rely on delivery service, tourists',
          'Homeowners in suburban areas, small businesses, property management companies, emergency service calls',
          'Tourists (60%), local residents (30%), special events and catering clients (10%)',
        ],
      },
      {
        type: 'radio',
        label: 'Service Provider BCP Status',
        required: true,
        prompt: 'Do your main service providers (suppliers, vendors, contractors) have business continuity plans in place?',
        options: [
          { label: 'Yes - Most of our key suppliers have shared their BCPs with us', value: 'yes' },
          { label: 'No - We haven\'t asked our suppliers about their BCPs', value: 'no' },
          { label: 'Partially - Some suppliers have BCPs, others don\'t', value: 'partial' },
          { label: 'Unknown - We\'re not sure if our suppliers have BCPs', value: 'unknown' },
        ],
      },
    ],
  },

  ESSENTIAL_FUNCTIONS: {
    title: 'Essential Business Functions',
    description: 'Let\'s identify and prioritize the key functions that keep your business running.',
    inputs: [
      {
        type: 'checkbox',
        label: 'Supply Chain Management Functions',
        required: false,
        prompt: 'Which supply chain management functions are essential to your business? Select all that apply.',
        options: [
          { label: 'Ordering supplies from vendors', value: 'ordering_supplies' },
          { label: 'Receiving and inspecting goods', value: 'goods_receiving' },
          { label: 'Storage and warehouse management', value: 'storage' },
          { label: 'Inventory management and stocking', value: 'stocking' },
          { label: 'Procurement and vendor management', value: 'procurement' },
          { label: 'Quality control and inspection', value: 'quality_control' },
        ],
        examples: [
          'A grocery store: Ordering supplies, Goods receiving, Storage, Stocking',
          'A restaurant: Ordering supplies, Goods receiving, Storage, Quality control',
          'A service business: Procurement only',
        ],
      },
      {
        type: 'checkbox',
        label: 'Staff Management Functions',
        required: false,
        prompt: 'Which staff-related functions are essential to your business? Select all that apply.',
        options: [
          { label: 'Staff recruitment and hiring', value: 'recruitment' },
          { label: 'Payroll processing and payments', value: 'payroll' },
          { label: 'Day-to-day supervision and management', value: 'supervision' },
          { label: 'Health and safety compliance', value: 'health_safety' },
          { label: 'Training and skills development', value: 'training' },
          { label: 'Performance management', value: 'performance' },
        ],
        examples: [
          'Small family business: Supervision, Health and safety',
          'Growing business: All functions',
          'Seasonal business: Recruitment, Payroll, Supervision, Training',
        ],
      },
      {
        type: 'checkbox',
        label: 'Technology Functions',
        required: false,
        prompt: 'Which technology functions are essential to your business? Select all that apply.',
        options: [
          { label: 'Website maintenance and updates', value: 'website' },
          { label: 'Online security and data protection', value: 'security' },
          { label: 'Internet and telecommunications', value: 'internet' },
          { label: 'Point of sale (POS) systems', value: 'pos_systems' },
          { label: 'Online payment processing', value: 'payment_processing' },
          { label: 'Data backup and recovery', value: 'data_backup' },
          { label: 'Social media and online presence', value: 'social_media' },
        ],
        examples: [
          'Online store: All functions',
          'Local shop: Internet, POS systems, Payment processing',
          'Service business: Website, Internet, Data backup',
        ],
      },
      {
        type: 'checkbox',
        label: 'Product and Service Delivery',
        required: false,
        prompt: 'Which product/service functions are essential to your business? Select all that apply.',
        options: [
          { label: 'Product design and development', value: 'design' },
          { label: 'Manufacturing and production', value: 'production' },
          { label: 'Quality assurance and testing', value: 'quality_assurance' },
          { label: 'Packaging and preparation', value: 'packing' },
          { label: 'Transportation and delivery', value: 'transport' },
          { label: 'Service delivery to customers', value: 'service_delivery' },
          { label: 'Project planning and management', value: 'project_management' },
          { label: 'Project monitoring and evaluation', value: 'monitoring' },
        ],
        examples: [
          'Manufacturing: Design, Production, Quality assurance, Packing, Transport',
          'Service business: Service delivery, Project management, Monitoring',
          'Retail: Packing, Transport, Service delivery',
        ],
      },
      {
        type: 'checkbox',
        label: 'Sales and Marketing Functions',
        required: false,
        prompt: 'Which sales and marketing functions are essential to your business? Select all that apply.',
        options: [
          { label: 'Advertising and promotion', value: 'advertising' },
          { label: 'Sales transactions and cash management', value: 'sales_management' },
          { label: 'Online sales platforms', value: 'online_sales' },
          { label: 'Customer service and support', value: 'customer_service' },
          { label: 'Quotations and estimates', value: 'quotations' },
          { label: 'Phone and call center operations', value: 'call_center' },
          { label: 'Customer relationship management', value: 'crm' },
          { label: 'Invoicing and billing', value: 'invoicing' },
        ],
        examples: [
          'Retail store: Advertising, Sales management, Customer service, Invoicing',
          'Online business: Online sales, Customer service, Call center, CRM',
          'Service business: Advertising, Customer service, Quotations, Invoicing',
        ],
      },
      {
        type: 'checkbox',
        label: 'Administrative Functions',
        required: false,
        prompt: 'Which administrative functions are essential to your business? Select all that apply.',
        options: [
          { label: 'Appointment scheduling and bookings', value: 'bookings' },
          { label: 'Accounting and financial management', value: 'accounting' },
          { label: 'Payroll administration', value: 'payroll_admin' },
          { label: 'Licensing and certifications', value: 'licensing' },
          { label: 'Government and regulatory reporting', value: 'reporting' },
          { label: 'Reception and telephone services', value: 'reception' },
          { label: 'Asset and equipment maintenance', value: 'asset_maintenance' },
          { label: 'Record keeping and filing', value: 'record_keeping' },
          { label: 'Data entry and management', value: 'data_entry' },
          { label: 'Office and asset security', value: 'security' },
        ],
        examples: [
          'Small business: Accounting, Record keeping, Security',
          'Medical practice: Bookings, Reception, Record keeping, Licensing',
          'Manufacturing: Accounting, Asset maintenance, Security, Reporting',
        ],
      },
      {
        type: 'checkbox',
        label: 'Infrastructure and Facilities',
        required: false,
        prompt: 'Which infrastructure and facilities functions are essential to your business? Select all that apply.',
        options: [
          { label: 'Building access and security', value: 'building_access' },
          { label: 'Building maintenance and repairs', value: 'building_maintenance' },
          { label: 'Electrical power supply', value: 'power' },
          { label: 'Water supply and plumbing', value: 'water' },
          { label: 'Air conditioning and ventilation', value: 'hvac' },
          { label: 'Waste management and disposal', value: 'waste_management' },
          { label: 'Parking and transportation access', value: 'parking' },
        ],
        examples: [
          'Restaurant: All functions',
          'Office: Building access, Power, Water, HVAC',
          'Manufacturing: All functions plus specialized equipment',
        ],
      },
      {
        type: 'table',
        label: 'Function Priority Assessment',
        prompt: 'For each business function you selected above, indicate its priority level and maximum acceptable downtime.',
        required: true,
        tableColumns: ['Business Function', 'Priority Level', 'Maximum Downtime', 'Notes'],
        tableRowsPrompt: 'Based on the functions you selected above, we\'ll create rows for each one. For each function, consider: Can your business survive without this function? For how long?',
        examples: [
          'Sales Management - High Priority - 2 hours - Need to process customer payments',
          'Staff Recruitment - Low Priority - 2 weeks - Can delay hiring during emergencies',
          'Power Supply - High Priority - 30 minutes - Refrigeration and POS systems critical',
        ],
        priorityOptions: [
          { label: 'High (must be restored immediately)', value: 'high' },
          { label: 'Medium (can wait a few days)', value: 'medium' },
          { label: 'Low (can wait a few weeks)', value: 'low' },
        ],
        downtimeOptions: [
          { label: 'Less than 1 hour', value: '<1hour' },
          { label: '1-4 hours', value: '1-4hours' },
          { label: '1-2 days', value: '1-2days' },
          { label: '3-7 days', value: '3-7days' },
          { label: '1-2 weeks', value: '1-2weeks' },
          { label: 'More than 2 weeks', value: '>2weeks' },
        ],
        dependsOn: 'ESSENTIAL_FUNCTIONS', // Example, adjust if needed
      },
    ],
  },

  RISK_ASSESSMENT: {
    title: 'Risk Assessment',
    description: 'Let\'s identify and assess the risks that could disrupt your business operations.',
    inputs: [
      {
        type: 'checkbox',
        label: 'Potential Hazards',
        required: false,
        prompt: 'Select all hazards that may affect your business. Consider both natural disasters and human-caused risks that are relevant to your location and industry.',
        options: [
          { label: 'Earthquake', value: 'earthquake' },
          { label: 'Hurricane/Tropical Storm', value: 'hurricane' },
          { label: 'Coastal Flooding', value: 'coastal_flood' },
          { label: 'Flash Flooding', value: 'flash_flood' },
          { label: 'Landslide', value: 'landslide' },
          { label: 'Tsunami', value: 'tsunami' },
          { label: 'Volcanic Activity', value: 'volcanic' },
          { label: 'Drought', value: 'drought' },
          { label: 'Epidemic (local disease outbreak)', value: 'epidemic' },
          { label: 'Pandemic (widespread disease)', value: 'pandemic' },
          { label: 'Extended Power Outage', value: 'power_outage' },
          { label: 'Telecommunications Failure', value: 'telecom_failure' },
          { label: 'Internet/Cyber Attacks', value: 'cyber_attack' },
          { label: 'Fire', value: 'fire' },
          { label: 'Crime/Theft/Break-in', value: 'crime' },
          { label: 'Civil Disorder/Unrest', value: 'civil_disorder' },
          { label: 'Terrorism', value: 'terrorism' },
          { label: 'Supply Chain Disruption', value: 'supply_disruption' },
          { label: 'Key Staff Unavailability', value: 'staff_unavailable' },
          { label: 'Economic Downturn', value: 'economic_downturn' },
        ],
        examples: [
          'Coastal business: Hurricane, Coastal flooding, Tsunami, Power outage',
          'Technology business: Power outage, Cyber attack, Telecom failure',
          'Retail business: Crime, Fire, Power outage, Supply disruption',
        ],
      },
      {
        type: 'special_risk_matrix',
        label: 'Risk Assessment Matrix',
        prompt: 'For each hazard you selected, assess the likelihood and potential severity of impact on your business.',
        required: true,
        examples: [
          'Hurricane - Likely (3) - Serious (3) - High (9) - Purchase insurance, prepare shutters, secure inventory',
          'Power Outage - Very Likely (4) - Minor (2) - Medium (8) - Install backup generator, UPS for computers',
          'Fire - Unlikely (2) - Major (4) - Medium (8) - Install fire alarms, sprinkler system, fire extinguishers',
        ],
      },
    ],
  },

  STRATEGIES: {
    title: 'Business Continuity Strategies',
    description: 'Now let\'s develop comprehensive strategies to prevent, respond to, and recover from the risks you\'ve identified.',
    inputs: [
      {
        type: 'checkbox',
        label: 'Prevention Strategies (Before Emergencies)',
        required: false,
        prompt: 'Which prevention strategies will you implement to reduce the likelihood or impact of risks? Select all that apply.',
        options: [
          { label: 'Regular maintenance of equipment and facilities', value: 'maintenance' },
          { label: 'Physical security systems (alarms, cameras, locks)', value: 'physical_security' },
          { label: 'Cybersecurity measures and data protection', value: 'cybersecurity' },
          { label: 'Comprehensive insurance coverage', value: 'insurance' },
          { label: 'Employee training and emergency preparedness', value: 'employee_training' },
          { label: 'Supplier diversification and backup suppliers', value: 'supplier_diversity' },
          { label: 'Financial reserves and emergency funds', value: 'financial_reserves' },
          { label: 'Regular data backup and off-site storage', value: 'data_backup' },
          { label: 'Building modifications for disaster resistance', value: 'building_upgrades' },
          { label: 'Emergency supplies and equipment stockpiling', value: 'emergency_supplies' },
          { label: 'Regular risk assessments and plan updates', value: 'risk_monitoring' },
          { label: 'Community partnerships and mutual aid agreements', value: 'community_partnerships' },
        ],
        examples: [
          'Retail store: Physical security, Insurance, Employee training, Emergency supplies',
          'Technology business: Cybersecurity, Data backup, Employee training, Financial reserves',
          'Restaurant: Maintenance, Insurance, Emergency supplies, Building upgrades',
        ],
      },
      {
        type: 'checkbox',
        label: 'Response Strategies (During Emergencies)',
        required: false,
        prompt: 'Which response strategies will you implement during an emergency? Select all that apply.',
        options: [
          { label: 'Emergency response team activation', value: 'emergency_team' },
          { label: 'Staff and customer safety procedures', value: 'safety_procedures' },
          { label: 'Emergency communication plan', value: 'emergency_communication' },
          { label: 'Alternative work locations', value: 'alternative_locations' },
          { label: 'Remote work and virtual operations', value: 'remote_work' },
          { label: 'Emergency inventory and supply management', value: 'emergency_inventory' },
          { label: 'Customer service continuity procedures', value: 'customer_continuity' },
          { label: 'Media and public relations management', value: 'media_management' },
          { label: 'Emergency financial procedures', value: 'emergency_finance' },
          { label: 'Coordination with emergency services', value: 'emergency_services' },
          { label: 'Temporary closure and securing procedures', value: 'closure_procedures' },
          { label: 'Essential services only operations', value: 'essential_operations' },
        ],
        examples: [
          'Service business: Emergency team, Remote work, Customer continuity, Emergency communication',
          'Retail business: Safety procedures, Emergency inventory, Closure procedures, Emergency services',
          'Manufacturing: Emergency team, Alternative locations, Essential operations, Emergency finance',
        ],
      },
      {
        type: 'checkbox',
        label: 'Recovery Strategies (After Emergencies)',
        required: false,
        prompt: 'Which recovery strategies will help you restore normal operations after an emergency? Select all that apply.',
        options: [
          { label: 'Damage assessment and documentation', value: 'damage_assessment' },
          { label: 'Insurance claims and financial recovery', value: 'insurance_claims' },
          { label: 'Business resumption and restart procedures', value: 'business_resumption' },
          { label: 'Employee support and counseling programs', value: 'employee_support' },
          { label: 'Customer retention and win-back strategies', value: 'customer_retention' },
          { label: 'Supplier relationship restoration', value: 'supplier_restoration' },
          { label: 'Marketing and reputation management', value: 'reputation_management' },
          { label: 'Financial assistance and loan applications', value: 'financial_assistance' },
          { label: 'Facility repair and reconstruction', value: 'facility_repair' },
          { label: 'Equipment replacement and upgrades', value: 'equipment_replacement' },
          { label: 'Lessons learned and plan improvements', value: 'lessons_learned' },
          { label: 'Community support and collaboration', value: 'community_support' },
        ],
        examples: [
          'Small business: Insurance claims, Business resumption, Customer retention, Financial assistance',
          'Service business: Employee support, Customer retention, Reputation management, Lessons learned',
          'Manufacturing: Damage assessment, Facility repair, Equipment replacement, Supplier restoration',
        ],
      },
      {
        type: 'text',
        label: 'Long-term Risk Reduction Measures',
        required: true,
        prompt: 'What long-term measures will you implement to reduce future risks? Consider climate adaptation, sustainable practices, and building resilience over time.',
        examples: [
          'Install solar panels for energy independence, relocate critical equipment above flood levels, diversify supply chains across multiple islands',
          'Implement sustainable waste management, use local suppliers to reduce transportation risks, build stronger community partnerships',
          'Invest in climate-resilient building materials, develop staff cross-training programs, establish emergency fund equivalent to 3 months operating costs',
        ],
      },
    ],
  },

  ACTION_PLAN: {
    title: 'Implementation Action Plan',
    description: 'Finally, let\'s create a detailed action plan to implement your business continuity strategies.',
    inputs: [
      {
        type: 'table',
        label: 'Action Plan by Risk Level',
        prompt: 'For your highest-priority risks, create specific action plans with timelines and responsibilities.',
        required: true,
        tableColumns: ['Hazard/Risk', 'Immediate Actions (0-24 hours)', 'Short-term Actions (1-7 days)', 'Medium-term Actions (1-4 weeks)', 'Responsible Person'],
        tableRowsPrompt: 'We\'ll focus on your high and medium-risk hazards. For each one, think about what needs to happen immediately, in the first week, and in the first month.',
        examples: [
          'Hurricane - Secure building, activate emergency team - Contact staff and customers, assess damage - File insurance claims, resume operations - Operations Manager',
          'Power Outage - Switch to backup power, secure cash registers - Contact utility company, implement manual processes - Evaluate backup power needs, order equipment - Facility Manager',
        ],
      },
      {
        type: 'text',
        label: 'Implementation Timeline',
        required: true,
        prompt: 'What is your overall timeline for implementing this business continuity plan? Consider your business cycles, budget constraints, and priority risks.',
        examples: [
          'Phase 1 (Immediate - 1 month): Implement high-priority prevention measures and emergency procedures. Phase 2 (1-3 months): Complete staff training and backup system installation. Phase 3 (3-6 months): Finalize all strategies and conduct first full test.',
          'Start implementation immediately with hurricane season approaching. Complete critical measures within 6 weeks, full implementation within 3 months.',
          'Begin after the busy season ends in April. Implement high-priority items by June, complete full plan by December before next tourist season.',
        ],
      },
      {
        type: 'text',
        label: 'Resource Requirements',
        required: true,
        prompt: 'What resources (financial, human, technical) will you need to implement your plan? Be specific about costs and personnel time.',
        examples: [
          'Budget: $15,000 for security system ($8,000), generator ($5,000), training ($2,000). Personnel: 20 hours/week from manager for 2 months, 4 hours/week from each staff member.',
          'Financial: $25,000 total - IT infrastructure ($15,000), insurance increases ($3,000/year), emergency supplies ($2,000), training ($5,000). Human: IT consultant (40 hours), management time (2 days/week for 3 months).',
          'Equipment budget: $10,000 for backup systems. Training budget: $3,000 for staff certification. Time investment: 1 day per week from department heads for 4 months.',
        ],
      },
      {
        type: 'text',
        label: 'Responsible Parties and Roles',
        required: true,
        prompt: 'Who will be responsible for implementing and maintaining different aspects of the plan? Assign specific roles and backup responsibilities.',
        examples: [
          'Plan Coordinator: General Manager (backup: Operations Supervisor). IT Systems: IT Manager (backup: External consultant). Staff Training: HR Manager (backup: Senior Supervisor). Emergency Response: Operations Manager (backup: Assistant Manager).',
          'Overall Implementation: Business Owner (backup: Office Manager). Risk Prevention: Facility Manager (backup: Maintenance Staff). Communication: Customer Service Manager (backup: Reception Staff). Financial: Accountant (backup: Office Manager).',
          'Business Continuity Team: 3 senior staff members with rotating leadership. Department Implementation: Each department head responsible for their area. External Relations: Marketing Manager for media, Admin Manager for government/insurance.',
        ],
      },
      {
        type: 'text',
        label: 'Review and Update Schedule',
        required: true,
        prompt: 'How often will you review and update your business continuity plan? Include regular reviews and trigger events for updates.',
        examples: [
          'Quarterly reviews of risk assessment and contact information. Annual comprehensive plan update. Immediate review after any emergency event or significant business change.',
          'Monthly check-ins during hurricane season (June-November). Bi-annual full reviews in January and July. Update plan whenever we change suppliers, move locations, or change key staff.',
          'Ongoing monitoring: Monthly risk assessment updates. Formal reviews: Quarterly team meetings. Major updates: Annually and after any emergency event, business expansion, or regulatory changes.',
        ],
      },
      {
        type: 'table',
        label: 'Testing and Assessment Plan',
        prompt: 'How will you test your business continuity plan to ensure it works effectively?',
        required: true,
        tableColumns: ['Test Type', 'Frequency', 'Participants', 'Success Criteria', 'Responsible Person'],
        tableRowsPrompt: 'Plan different types of tests to validate your business continuity plan.',
        examples: [
          'Communication Test - Monthly - All staff - Everyone receives and responds to emergency message within 2 hours - Communications Manager',
          'Evacuation Drill - Quarterly - All staff and customers - Building evacuated safely within 5 minutes - Safety Officer',
          'Backup System Test - Monthly - IT staff - All systems switch to backup power/internet successfully - IT Manager',
          'Full Plan Exercise - Annually - All key staff - Complete scenario exercise completed successfully - Plan Coordinator',
        ],
      },
    ],
  },

  CONTACTS_AND_INFORMATION: {
    title: 'Contacts and Critical Information',
    description: 'Let\'s compile all the important contact information and details you\'ll need during an emergency.',
    inputs: [
      {
        type: 'table',
        label: 'Staff Contact Information',
        prompt: 'Provide contact information for all staff members.',
        required: true,
        tableColumns: ['Name', 'Position', 'Phone Number', 'Email Address', 'Emergency Contact'],
        tableRowsPrompt: 'Include all employees, managers, and key personnel who would need to be contacted during an emergency.',
        examples: [
          'John Smith - Manager - 876-555-0123 - j.smith@company.com - Wife: 876-555-0124',
          'Maria Rodriguez - Cashier - 876-555-0125 - m.rodriguez@company.com - Sister: 876-555-0126',
          'David Thompson - Cook - 876-555-0127 - d.thompson@company.com - Mother: 876-555-0128',
        ],
      },
      {
        type: 'table',
        label: 'Key Customer Contacts',
        prompt: 'List your most important customers who would need special attention during an emergency.',
        required: false,
        tableColumns: ['Customer Name', 'Type/Notes', 'Phone Number', 'Email Address', 'Special Requirements'],
        tableRowsPrompt: 'Focus on customers who depend on you for essential services or have special needs.',
        examples: [
          'Mrs. James - Elderly customer (home delivery) - 876-555-0130 - - Relies on weekly grocery delivery',
          'Paradise Resort - Major client - 876-555-0131 - orders@paradiseresort.com - Daily fresh produce delivery',
          'City Hospital - Emergency supplies - 876-555-0132 - procurement@cityhospital.gov - Critical medical supplies',
        ],
      },
      {
        type: 'table',
        label: 'Supplier Information',
        prompt: 'List your main suppliers and at least one backup supplier for key goods/services.',
        required: true,
        tableColumns: ['Supplier Name', 'Goods/Services Supplied', 'Phone Number', 'Email Address', 'Backup Supplier'],
        tableRowsPrompt: 'Include primary suppliers and identify backup options for critical supplies.',
        examples: [
          'Caribbean Foods Ltd - Fresh produce - 876-555-0140 - orders@caribbeanfoods.com - Island Fresh Co.',
          'Island Hardware - Tools & supplies - 876-555-0141 - sales@islandhardware.com - Tools & More Ltd.',
          'Power Solutions Inc - Generator maintenance - 876-555-0142 - service@powersolutions.com - Electric Pro Services',
        ],
      },
      {
        type: 'table',
        label: 'Emergency Services and Utilities',
        prompt: 'Compile contact information for emergency services and utility providers.',
        required: true,
        tableColumns: ['Service Type', 'Organization Name', 'Phone Number', 'Email Address', 'Account Number'],
        tableRowsPrompt: 'Include all essential services you might need to contact during an emergency.',
        examples: [
          'Police - Royal Police Force - 911 / 876-555-0150 - - N/A',
          'Fire Department - Kingston Fire Brigade - 911 / 876-555-0151 - - N/A',
          'Electricity - Jamaica Public Service - 876-555-0152 - customer@jps.com.jm - Account: JPS123456',
          'Water - National Water Commission - 876-555-0153 - service@nwc.com.jm - Account: NWC789012',
          'Internet - Flow Jamaica - 876-555-0154 - support@flow.com - Account: FLOW345678',
          'Insurance - Guardian Life - 876-555-0155 - claims@guardian.com - Policy: GL901234',
        ],
      },
      {
        type: 'text',
        label: 'Critical Business Information',
        required: true,
        prompt: 'Provide other critical business information needed during emergencies.',
        examples: [
          'Business License: BL-2023-0456, Insurance Policy: GL-789012 (Guardian Life), Bank Account: Scotia Bank #123456789, Critical Records Location: Fireproof safe in manager office, Backup Records: Cloud storage (Google Drive) + external drive at owner home',
          'Registration Number: REG-2022-0789, Insurance: Sagicor Policy #SG-456789, Banking: First Caribbean #987654321, Important Documents: Safety deposit box at bank, Digital Copies: Dropbox account shared with accountant',
        ],
      },
      {
        type: 'table',
        label: 'Plan Distribution List',
        prompt: 'Track who has received copies of this business continuity plan.',
        required: true,
        tableColumns: ['Name/Position', 'Format Received', 'Date Provided', 'Version Number', 'Acknowledgment'],
        tableRowsPrompt: 'Document everyone who should have access to the plan.',
        examples: [
          'John Smith (Manager) - Electronic + Hard copy - 2024-01-15 - Version 1.0 - Signed',
          'Maria Rodriguez (Assistant Manager) - Electronic - 2024-01-15 - Version 1.0 - Email confirmed',
          'Guardian Life Insurance - Electronic - 2024-01-20 - Version 1.0 - Submitted with application',
        ],
      },
    ],
  },

  TESTING_AND_MAINTENANCE: {
    title: 'Testing and Maintenance',
    description: 'Establish procedures for keeping your business continuity plan current and effective.',
    inputs: [
      {
        type: 'table',
        label: 'Plan Testing Schedule',
        prompt: 'Create a schedule for regularly testing different aspects of your business continuity plan.',
        required: true,
        tableColumns: ['Test Type', 'What is Tested', 'Frequency', 'Next Test Date', 'Responsible Person'],
        tableRowsPrompt: 'Plan different types of tests to ensure your plan works when needed.',
        examples: [
          'Communication Test - Emergency contact procedures - Monthly - 2024-02-15 - Office Manager',
          'Backup Systems - Generator and backup power - Quarterly - 2024-03-15 - Maintenance Staff',
          'Evacuation Drill - Emergency evacuation procedures - Semi-annually - 2024-06-15 - Safety Officer',
          'Full Plan Exercise - Complete emergency scenario - Annually - 2024-12-15 - General Manager',
        ],
      },
      {
        type: 'table',
        label: 'Plan Revision History',
        prompt: 'Track changes and updates to your business continuity plan over time.',
        required: true,
        tableColumns: ['Version', 'Date Updated', 'Changes Made', 'Updated By', 'Reason for Update'],
        tableRowsPrompt: 'Start with Version 1.0 and plan for future updates.',
        examples: [
          'Version 1.0 - 2024-01-15 - Initial plan creation - John Smith (Manager) - New business continuity plan',
          'Version 1.1 - 2024-03-15 - Updated supplier contacts - Maria Rodriguez - Supplier changed phone numbers',
          'Version 2.0 - 2024-07-15 - Major revision after hurricane drill - John Smith (Manager) - Lessons learned from testing',
        ],
      },
      {
        type: 'table',
        label: 'Improvement Tracking',
        prompt: 'Track improvements and action items identified through testing and real events.',
        required: true,
        tableColumns: ['Issue Identified', 'Improvement Action', 'Priority Level', 'Target Completion', 'Status'],
        tableRowsPrompt: 'Use this to track ongoing improvements to your plan.',
        examples: [
          'Staff took too long to respond to emergency call - Improve staff training on emergency procedures - High - 2024-02-28 - In Progress',
          'Backup generator failed to start - Schedule monthly generator testing and maintenance - High - 2024-01-30 - Completed',
          'Customer contact list was outdated - Implement quarterly customer contact review - Medium - 2024-03-31 - Planned',
        ],
      },
      {
        type: 'text',
        label: 'Annual Review Process',
        required: true,
        prompt: 'Describe your process for conducting comprehensive annual reviews of the business continuity plan.',
        examples: [
          'Every January: 1) Review all contact information and update as needed, 2) Assess new risks based on previous year events, 3) Update insurance and financial information, 4) Review staff training needs, 5) Update emergency supplies inventory, 6) Schedule year\'s testing activities.',
          'Annual review meeting in December with all key staff: Review past year\'s incidents and tests, update risk assessment based on climate/business changes, verify all contact information, assess budget for next year\'s improvements, plan training schedule, update emergency supply lists.',
          'Comprehensive annual review process: 1) Stakeholder feedback collection, 2) Risk environment assessment, 3) Plan effectiveness evaluation, 4) Resource requirement review, 5) Training program assessment, 6) Communication system evaluation, 7) Documentation updates.',
        ],
      },
      {
        type: 'text',
        label: 'Trigger Events for Plan Updates',
        required: true,
        prompt: 'What events or changes would trigger an immediate update to your business continuity plan?',
        examples: [
          'Immediate updates required for: 1) Any actual emergency or disaster affecting the business, 2) Changes in key staff or management, 3) Moving to new location or major facility changes, 4) Changes in major suppliers or service providers, 5) New significant risks identified, 6) Changes in insurance coverage or legal requirements.',
          'Plan updates triggered by: Major staff changes, location moves, new equipment/technology, supplier changes, insurance policy changes, government regulation changes, community emergency plan updates, lessons learned from actual emergencies.',
          'Update triggers: Business expansion or downsizing, new technology implementation, changes in customer base, regulatory changes, natural disaster events (even if business not directly affected), changes in local emergency services, merger or acquisition activities.',
        ],
      },
    ],
  },
};
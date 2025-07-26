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
  reasonForUpdateOptions?: never;
  improvementStatusOptions?: never;
  businessFunctionOptions?: never;
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
  reasonForUpdateOptions?: never;
  improvementStatusOptions?: never;
  businessFunctionOptions?: never;
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
  reasonForUpdateOptions?: never;
  improvementStatusOptions?: never;
  businessFunctionOptions?: never;
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
  reasonForUpdateOptions?: { label: string; value: string }[];
  improvementStatusOptions?: { label: string; value: string }[];
  businessFunctionOptions?: { label: string; value: string }[];
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
  reasonForUpdateOptions?: never;
  improvementStatusOptions?: never;
  businessFunctionOptions?: never;
  dependsOn?: never;
};

type SpecialSmartActionPlanInput = {
  type: 'special_smart_action_plan';
  label: string;
  required: boolean;
  prompt: string;
  examples?: string[];
  options?: never;
  tableColumns?: never;
  tableRowsPrompt?: never;
  priorityOptions?: never;
  downtimeOptions?: never;
  reasonForUpdateOptions?: never;
  improvementStatusOptions?: never;
  businessFunctionOptions?: never;
  dependsOn?: never;
};

export type InputConfig = TextInput | RadioInput | CheckboxInput | TableInput | SpecialRiskMatrixInput | SpecialSmartActionPlanInput;

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
        label: 'Business Address',
        required: true,
        prompt: 'What is your complete business address including street, city, and country?',
        examples: ['45 Harbor View Plaza, Bridgetown, Barbados', '123 Main Street, Kingston, Jamaica', '67 Independence Avenue, Port of Spain, Trinidad'],
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
        required: false,
        prompt: 'Who is the alternate person responsible if the main manager is unavailable? This field is optional - if you don\'t have an alternate manager, you can leave this blank or enter "N/A". Consider designating a trusted employee, family member, or business partner who can make basic decisions during emergencies.',
        examples: [
          'Sarah Johnson, Assistant Manager', 
          'Michael Brown, Supervisor', 
          'Lisa Williams, Senior Staff',
          'N/A - Will rely on main manager only',
          'Will designate when business grows',
          'Emergency contact: Local business association'
        ],
      },
      {
        type: 'text',
        label: 'Physical Plan Location',
        required: true,
        prompt: 'Where will physical copies of this business continuity plan be stored? Choose secure, accessible locations that multiple people can access.',
        examples: [
          'Fire-proof cabinet in manager\'s office',
          'Security safe in reception area',
          'Locked filing cabinet in administration office',
          'Safety deposit box at local bank'
        ],
      },
      {
        type: 'text',
        label: 'Digital Plan Location',
        required: false,
        prompt: 'Where will digital copies be stored? This is optional - if you don\'t have reliable internet or digital storage, you can skip this field.',
        examples: [
          'Company server with daily backups',
          'Google Drive shared with management team',
          'Cloud storage with backup on external drive',
          'Email copies sent to key personnel'
        ],
      },
      {
        type: 'text',
        label: 'Plan Version',
        required: true,
        prompt: 'What version number should this plan be? Start with 1.0 for your first plan.',
        examples: ['1.0', '1.1', '2.0'],
      },
      {
        type: 'text',
        label: 'Next Review Date',
        required: true,
        prompt: 'When should this plan be reviewed next? Consider your business cycles and risk environment.',
        examples: ['January 2026', 'June 2025', 'December 2025'],
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
          { label: 'Critical - Business cannot function without this', value: 'critical' },
          { label: 'High - Significant impact if disrupted', value: 'high' },
          { label: 'Medium - Moderate impact, can wait a few days', value: 'medium' },
          { label: 'Low - Minimal impact, can wait weeks', value: 'low' },
        ],
        downtimeOptions: [
          { label: 'Less than 1 hour', value: '<1hour' },
          { label: '1-4 hours', value: '1-4hours' },
          { label: '1-2 days', value: '1-2days' },
          { label: '3-7 days', value: '3-7days' },
          { label: '1-2 weeks', value: '1-2weeks' },
          { label: 'More than 2 weeks', value: '>2weeks' },
        ],
        businessFunctionOptions: [
          { label: 'Sales and Customer Service', value: 'sales_customer_service' },
          { label: 'Production/Manufacturing', value: 'production' },
          { label: 'Supply Chain Management', value: 'supply_chain' },
          { label: 'Financial Management', value: 'financial' },
          { label: 'Human Resources', value: 'human_resources' },
          { label: 'Information Technology', value: 'information_technology' },
          { label: 'Marketing and Communications', value: 'marketing' },
          { label: 'Administration', value: 'administration' },
          { label: 'Quality Control', value: 'quality_control' },
          { label: 'Research and Development', value: 'research_development' },
          { label: 'Facilities Management', value: 'facilities' },
          { label: 'Regulatory Compliance', value: 'compliance' },
          { label: 'Transportation/Logistics', value: 'transportation' },
          { label: 'Other (please specify)', value: 'other' }
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
        type: 'table',
        label: 'Hazard Applicability Assessment',
        prompt: 'Review each potential hazard and mark whether it applies to your business and location.',
        required: true,
        tableColumns: ['Hazard', 'Applicable', 'Likelihood', 'Severity', 'Risk Level'],
        tableRowsPrompt: 'Consider both natural disasters and human-caused risks that are relevant to your location and industry.',
        examples: [
          'Hurricane - Yes - Likely (3) - Major (4) - High (12)',
          'Earthquake - Yes - Very Unlikely (1) - Major (4) - Medium (4)',
          'Cyber Attack - Yes - Likely (3) - Serious (3) - High (9)',
          'Volcanic Activity - No - N/A - N/A - N/A',
        ],
      },
      {
        type: 'special_risk_matrix',
        label: 'Risk Assessment Matrix',
        prompt: 'For each applicable hazard, assess the likelihood and potential severity of impact on your business.',
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
    title: 'Smart Action Plan',
    description: 'Based on your business type and risk assessment, we\'ve generated a customized action plan. All fields are automatically completed.',
    inputs: [
      {
        type: 'special_smart_action_plan' as const,
        label: 'Smart Action Plan Generator',
        required: true,
        prompt: 'We\'ve analyzed your business type and high-priority risks to create a complete action plan with implementation details, budget estimates, and team assignments.',
        examples: [
          'Action plans are automatically generated based on your risk assessment',
          'Implementation priority is set based on risk levels (Extreme → High → Medium)',
          'Budget estimates and team assignments are customized for your business type',
          'All fields are completed automatically - no manual input required',
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
        prompt: 'Provide complete contact information for all staff members including emergency roles.',
        required: true,
        tableColumns: ['Name', 'Position', 'Mobile Phone', 'Home Phone', 'Email Address', 'Emergency Contact', 'Emergency Role'],
        tableRowsPrompt: 'Include all employees, managers, and key personnel who would need to be contacted during an emergency.',
        examples: [
          'John Smith - General Manager - 876-555-0120 - 876-555-0121 - j.smith@company.com - Wife: 876-555-0122 - Decision Authority',
          'Maria Rodriguez - Assistant Manager - 876-555-0123 - 876-555-0124 - m.rodriguez@company.com - Husband: 876-555-0125 - Operations Lead',
          'David Thompson - Head Cashier - 876-555-0126 - 876-555-0127 - d.thompson@company.com - Sister: 876-555-0128 - Customer Service Lead',
        ],
      },
      {
        type: 'table',
        label: 'Key Customer Contacts',
        prompt: 'List your most important customers who would need special attention during an emergency, including their specific needs.',
        required: false,
        tableColumns: ['Customer Name', 'Type/Notes', 'Primary Contact', 'Phone Number', 'Email Address', 'Special Requirements', 'Priority Level'],
        tableRowsPrompt: 'Focus on customers who depend on you for essential services or have special needs.',
        examples: [
          'Mrs. James - Elderly customer (home delivery) - Mrs. James - 876-555-0130 - - Relies on weekly grocery delivery - CRITICAL',
          'Paradise Resort - Major client - John Doe - 876-555-0131 - orders@paradiseresort.com - Daily fresh produce delivery - HIGH',
          'City Hospital - Emergency supplies - Jane Smith - 876-555-0132 - procurement@cityhospital.gov - Critical medical supplies - CRITICAL',
        ],
      },
      {
        type: 'table',
        label: 'Supplier Information',
        prompt: 'List your main suppliers with complete contact information including account numbers for faster service.',
        required: true,
        tableColumns: ['Supplier Name', 'Goods/Services Supplied', 'Phone Number', '24/7 Contact', 'Email Address', 'Account Number', 'Backup Supplier'],
        tableRowsPrompt: 'Include primary suppliers and identify backup options for critical supplies.',
        examples: [
          'Caribbean Foods Ltd - Fresh produce - 876-555-0140 - 876-555-0141 - orders@caribbeanfoods.com - ACC-2024-001 - Island Fresh Co.',
          'Island Hardware - Tools & supplies - 876-555-0142 - 876-555-0143 - sales@islandhardware.com - HW-789 - Tools & More Ltd.',
          'Power Solutions Inc - Generator maintenance - 876-555-0144 - 876-555-0145 - service@powersolutions.com - PS-456 - Electric Pro Services',
        ],
      },
      {
        type: 'table',
        label: 'Emergency Services and Utilities',
        prompt: 'Compile complete contact information for emergency services and utility providers with account numbers.',
        required: true,
        tableColumns: ['Service Type', 'Organization Name', 'Phone Number', '24/7 Emergency', 'Email Address', 'Account Number'],
        tableRowsPrompt: 'Include all essential services you might need to contact during an emergency.',
        examples: [
          'Police - Royal Police Force - 911 - 911 - - N/A',
          'Fire Department - Kingston Fire Brigade - 911 - 911 - - N/A',
          'Medical Emergency - Ambulance Service - 511 - 511 - - N/A',
          'Electricity - Jamaica Public Service - 876-555-0152 - 876-555-0153 - customer@jps.com.jm - JPS123456',
          'Water - National Water Commission - 876-555-0154 - 876-555-0155 - service@nwc.com.jm - NWC789012',
          'Internet - Flow Jamaica - 876-555-0156 - 876-555-0157 - support@flow.com - FLOW345678',
          'Insurance - Guardian Life - 876-555-0158 - 876-555-0159 - claims@guardian.com - GL901234',
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

  VITAL_RECORDS: {
    title: 'Vital Records Inventory',
    description: 'Let\'s identify and document the location of critical business records needed for recovery.',
    inputs: [
      {
        type: 'table',
        label: 'Vital Records Inventory',
        prompt: 'List your most important business records, where they are stored, and where backups are kept.',
        required: true,
        tableColumns: ['Record Type', 'Primary Location', 'Backup Location', 'Recovery Priority'],
        tableRowsPrompt: 'Think about the documents you would need to restart your business after a disaster.',
        examples: [
          'Client Contracts - SharePoint - AWS Cloud - HIGH',
          'Financial Records - QuickBooks Cloud - Local backup - HIGH',
          'Insurance Policies - Fireproof safe - Digital copies - HIGH',
          'Employee Records - HR System - Secure offsite - MEDIUM',
          'Software Licenses - Password manager - Printed copies - HIGH',
        ],
        priorityOptions: [
          { label: 'Critical - Needed immediately for business operations', value: 'critical' },
          { label: 'High - Important for business recovery', value: 'high' },
          { label: 'Medium - Helpful but can wait a few days', value: 'medium' },
          { label: 'Low - Nice to have but not essential', value: 'low' },
        ],
      },
    ],
  },

  TESTING_AND_MAINTENANCE: {
    title: 'Testing and Maintenance',
    description: 'Establish comprehensive procedures for keeping your business continuity plan current and effective.',
    inputs: [
      {
        type: 'table',
        label: 'Plan Testing Schedule',
        prompt: 'Create a comprehensive schedule for regularly testing different aspects of your business continuity plan.',
        required: true,
        tableColumns: ['Test Type', 'What is Tested', 'Frequency', 'Next Test Date', 'Success Criteria', 'Responsible Person'],
        tableRowsPrompt: 'Plan different types of tests to ensure your plan works when needed.',
        examples: [
          'Communication Test - Emergency contact procedures - Monthly - 2025-02-15 - All staff respond within 2 hours - Office Manager',
          'Backup Systems - Generator and backup power - Quarterly - 2025-03-15 - Systems run for 8+ hours without issues - Maintenance Staff',
          'Evacuation Drill - Emergency evacuation procedures - Semi-annually - 2025-06-15 - Building evacuated in under 5 minutes - Safety Officer',
          'Data Backup Test - Critical data recovery - Monthly - 2025-02-28 - All data restored successfully - IT Manager',
          'Supplier Contact Test - Alternative supplier activation - Quarterly - 2025-04-15 - Backup suppliers respond within 4 hours - Procurement Manager',
          'Full Plan Exercise - Complete emergency scenario - Annually - 2025-12-15 - All procedures executed successfully - General Manager',
        ],
      },
      {
        type: 'table',
        label: 'Training Schedule',
        prompt: 'Plan regular training sessions to ensure all staff understand their roles in the business continuity plan.',
        required: true,
        tableColumns: ['Training Type', 'Target Audience', 'Frequency', 'Next Training Date', 'Training Provider', 'Completion Criteria'],
        tableRowsPrompt: 'Include both general awareness training and role-specific training.',
        examples: [
          'BCP Overview - All staff - Annually - 2025-03-01 - General Manager - All staff complete training module',
          'Emergency Response - Management team - Semi-annually - 2025-02-15 - External consultant - Role-play exercises completed',
          'Fire Safety - All staff - Annually - 2025-04-01 - Fire department - Fire drill participation',
          'Data Recovery - IT staff - Quarterly - 2025-02-01 - IT Manager - Successful data recovery demonstration',
          'Customer Communication - Customer service staff - Semi-annually - 2025-05-01 - Communications Manager - Crisis communication scenarios',
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
        reasonForUpdateOptions: [
          { label: 'Annual review and update', value: 'annual_review' },
          { label: 'Post-incident analysis', value: 'post_incident' },
          { label: 'Business change (new location, services, etc.)', value: 'business_change' },
          { label: 'Regulatory requirement change', value: 'regulatory_change' },
          { label: 'Staff feedback and suggestions', value: 'staff_feedback' },
          { label: 'Risk assessment update', value: 'risk_update' },
          { label: 'Technology upgrade', value: 'technology_upgrade' },
          { label: 'Other (please specify)', value: 'other' }
        ],
      },
      {
        type: 'table',
        label: 'Performance Metrics',
        prompt: 'Define key performance indicators to measure the effectiveness of your business continuity plan.',
        required: true,
        tableColumns: ['Metric Name', 'Target Value', 'Measurement Method', 'Review Frequency', 'Current Status', 'Responsible Person'],
        tableRowsPrompt: 'Include both quantitative and qualitative measures of plan effectiveness.',
        examples: [
          'Emergency Response Time - Under 30 minutes - Drill timing records - Monthly - Not yet measured - Emergency Coordinator',
          'Staff Contact Success Rate - 95% within 2 hours - Communication test results - Monthly - Not yet measured - HR Manager',
          'Data Recovery Time - Under 4 hours - Backup test records - Quarterly - Not yet measured - IT Manager',
          'Customer Notification Time - Under 1 hour - Communication logs - Per incident - Not yet measured - Customer Service Manager',
          'Business Resumption Time - Under 48 hours - Incident records - Per incident - Not yet measured - Operations Manager',
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
        priorityOptions: [
          { label: 'Critical - Business cannot function without this', value: 'critical' },
          { label: 'High - Significant impact if disrupted', value: 'high' },
          { label: 'Medium - Moderate impact, can wait a few days', value: 'medium' },
          { label: 'Low - Minimal impact, can wait weeks', value: 'low' },
        ],
        improvementStatusOptions: [
          { label: 'Not Started', value: 'not_started' },
          { label: 'In Planning', value: 'planning' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'On Hold', value: 'on_hold' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' }
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
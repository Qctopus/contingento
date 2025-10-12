interface StrategyTemplate {
  id: string
  name: string
  category: 'prevention' | 'preparation' | 'response' | 'recovery'
  description: string
  simplifiedDescription: string
  whyImportant: string
  applicableBusinessTypes: string[]
  applicableRisks: string[]
  cost: 'low' | 'medium' | 'high'
  timeToImplement: string
  effectiveness: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  implementationSteps: Array<{
    title: string
    description: string
    phase: 'immediate' | 'short_term' | 'medium_term' | 'long_term'
    timeframe: string
    responsibility: string
    resources: string[]
    estimatedCost: string
    checklist?: string[]
  }>
  helpfulTips: string[]
  commonMistakes: string[]
  successMetrics: string[]
  prerequisites: string[]
  maintenanceRequired: boolean
  roi: number
}

export const strategyTemplates: StrategyTemplate[] = [
  // PREVENTION STRATEGIES
  {
    id: 'backup_generator',
    name: 'Backup Power Generator',
    category: 'prevention',
    description: 'Install a backup generator to maintain power during outages',
    simplifiedDescription: 'Get a backup generator so your business can keep running when the power goes out',
    whyImportant: 'Power outages happen often in Jamaica, especially during storms. Without power, most businesses have to close and lose money. A generator keeps your lights on, your refrigeration working, and your customers happy.',
    applicableBusinessTypes: ['restaurant', 'grocery_store', 'pharmacy', 'gas_station', 'beauty_salon', 'hardware_store'],
    applicableRisks: ['hurricane', 'flood', 'powerOutage'],
    cost: 'medium',
    timeToImplement: '2-4 weeks',
    effectiveness: 9,
    priority: 'high',
    implementationSteps: [
      {
        title: 'Calculate Your Power Needs',
        description: 'Figure out how much electricity your most important equipment uses.',
        phase: 'immediate',
        timeframe: '1-2 days',
        responsibility: 'Business Owner',
        resources: ['Electric bills', 'Equipment manuals', 'Calculator'],
        estimatedCost: 'Free',
        checklist: [
          'List all essential equipment (lights, refrigerators, computers, etc.)',
          'Check wattage on each piece of equipment',
          'Add up total wattage needed',
          'Add 20% extra for safety margin'
        ]
      },
      {
        title: 'Get Generator Quotes',
        description: 'Contact at least 3 suppliers to compare generator prices and installation costs.',
        phase: 'immediate',
        timeframe: '3-5 days',
        responsibility: 'Business Owner',
        resources: ['Phone', 'Internet', 'Power requirements list'],
        estimatedCost: 'Free',
        checklist: [
          'Search for generator dealers in your area',
          'Call at least 3 different suppliers',
          'Ask for written quotes including installation',
          'Check if they provide maintenance services',
          'Ask about warranty and parts availability'
        ]
      },
      {
        title: 'Choose and Order Generator',
        description: 'Select the best generator option and place your order.',
        phase: 'short_term',
        timeframe: '1 week',
        responsibility: 'Business Owner',
        resources: ['Quotes', 'Budget', 'Credit card or cash'],
        estimatedCost: 'JMD $150,000 - $500,000',
        checklist: [
          'Compare all quotes carefully',
          'Check supplier reputation and reviews',
          'Verify generator can handle your power needs',
          'Confirm installation date and timeline',
          'Order fuel storage if needed'
        ]
      },
      {
        title: 'Install and Test Generator',
        description: 'Have the generator professionally installed and test it thoroughly.',
        phase: 'short_term',
        timeframe: '1-2 days',
        responsibility: 'Professional Contractor',
        resources: ['Generator', 'Installation team', 'Fuel'],
        estimatedCost: 'Usually included in purchase',
        checklist: [
          'Schedule installation during slow business hours',
          'Ensure proper ventilation and safety clearances',
          'Test generator with actual business load',
          'Train staff on how to start and stop generator',
          'Get instruction manual and warranty paperwork'
        ]
      },
      {
        title: 'Create Maintenance Schedule',
        description: 'Set up regular maintenance to keep your generator reliable.',
        phase: 'medium_term',
        timeframe: 'Ongoing',
        responsibility: 'Business Owner',
        resources: ['Calendar', 'Maintenance log', 'Supplier contact'],
        estimatedCost: 'JMD $5,000 - $15,000 per year',
        checklist: [
          'Schedule monthly test runs',
          'Check fuel levels regularly',
          'Arrange annual professional servicing',
          'Keep spare oil and filters on hand',
          'Document all maintenance activities'
        ]
      }
    ],
    helpfulTips: [
      'Buy a generator slightly larger than your minimum needs - you might add equipment later',
      'Consider diesel generators for businesses that run long hours - they\'re more fuel efficient',
      'Install a transfer switch so you don\'t have to plug things in manually during an outage',
      'Keep enough fuel for at least 3 days of operation',
      'Some insurance companies give discounts for businesses with backup power'
    ],
    commonMistakes: [
      'Buying a generator that\'s too small for your actual needs',
      'Not getting proper permits for installation',
      'Forgetting to test the generator regularly - it might not work when you need it',
      'Installing the generator too close to the building (carbon monoxide danger)',
      'Not training employees on how to use the generator safely'
    ],
    successMetrics: [
      'Generator starts within 30 seconds during outages',
      'Can run essential equipment for at least 8 hours',
      'Passes monthly test runs without issues',
      'Business can stay open during neighborhood power outages'
    ],
    prerequisites: ['Stable location for generator', 'Access to fuel supply', 'Electrical panel access'],
    maintenanceRequired: true,
    roi: 3.5
  },

  {
    id: 'emergency_cash_fund',
    name: 'Emergency Cash Reserve',
    category: 'preparation',
    description: 'Set aside money to cover expenses during business disruptions',
    simplifiedDescription: 'Save money in a special account to pay bills when your business has to close temporarily',
    whyImportant: 'When emergencies happen, you still need to pay rent, electricity, and employee wages even if you can\'t open. Without emergency money, many businesses fail after just one major disruption. This fund keeps you alive until you can reopen.',
    applicableBusinessTypes: ['all'],
    applicableRisks: ['hurricane', 'flood', 'earthquake', 'drought', 'landslide', 'powerOutage'],
    cost: 'high',
    timeToImplement: '3-12 months',
    effectiveness: 10,
    priority: 'critical',
    implementationSteps: [
      {
        title: 'Calculate Monthly Business Expenses',
        description: 'Add up all your fixed monthly costs that continue even when closed.',
        phase: 'immediate',
        timeframe: '1 day',
        responsibility: 'Business Owner',
        resources: ['Recent bills', 'Bank statements', 'Calculator'],
        estimatedCost: 'Free',
        checklist: [
          'List rent or mortgage payments',
          'Add utility bills (even minimum charges)',
          'Include loan payments',
          'Add insurance premiums',
          'Include employee wages you\'d still pay',
          'Don\'t forget licenses and permits'
        ]
      },
      {
        title: 'Set Savings Target',
        description: 'Decide how much emergency money you need and when you want to have it saved.',
        phase: 'immediate',
        timeframe: '1 day',
        responsibility: 'Business Owner',
        resources: ['Monthly expense calculation', 'Business goals'],
        estimatedCost: 'Free',
        checklist: [
          'Multiply monthly expenses by 3 for minimum fund',
          'Consider 6 months expenses for better protection',
          'Set a realistic timeline to save this amount',
          'Decide how much to save each month',
          'Choose where to keep the emergency fund'
        ]
      },
      {
        title: 'Open Separate Savings Account',
        description: 'Create a dedicated account just for emergency funds - don\'t mix with daily business money.',
        phase: 'immediate',
        timeframe: '1-2 days',
        responsibility: 'Business Owner',
        resources: ['Bank documents', 'Initial deposit'],
        estimatedCost: 'Bank fees only',
        checklist: [
          'Choose a bank account with easy access but separate from daily operations',
          'Look for accounts with good interest rates',
          'Set up the account in your business name',
          'Get a separate debit card or checkbook',
          'Make your first deposit to start the fund'
        ]
      },
      {
        title: 'Set Up Automatic Savings',
        description: 'Arrange to automatically transfer money to your emergency fund every week or month.',
        phase: 'short_term',
        timeframe: '1 week',
        responsibility: 'Business Owner',
        resources: ['Bank access', 'Business checking account'],
        estimatedCost: 'Free',
        checklist: [
          'Calculate how much to save weekly or monthly',
          'Set up automatic transfer from business checking',
          'Choose a day when you usually have good cash flow',
          'Start with a smaller amount if needed',
          'Review and adjust the amount quarterly'
        ]
      },
      {
        title: 'Monitor and Protect the Fund',
        description: 'Keep track of your savings progress and resist the temptation to use the money for other things.',
        phase: 'long_term',
        timeframe: 'Ongoing',
        responsibility: 'Business Owner',
        resources: ['Monthly bank statements', 'Spreadsheet or app'],
        estimatedCost: 'Free',
        checklist: [
          'Check fund balance monthly',
          'Only use for true emergencies',
          'Replenish fund after using it',
          'Consider increasing target as business grows',
          'Review fund adequacy annually'
        ]
      }
    ],
    helpfulTips: [
      'Start small - even JMD $5,000 per month adds up to significant protection',
      'Consider this fund as insurance you pay to yourself',
      'Keep the money in Jamaica dollars to avoid currency risk during emergencies',
      'Some banks offer business savings accounts with better interest rates',
      'Document the fund in your business plan - it shows lenders you\'re responsible'
    ],
    commonMistakes: [
      'Using emergency funds for non-emergency business expenses',
      'Not saving consistently - skipping months when business is slow',
      'Keeping all emergency money in one bank (diversify for safety)',
      'Setting unrealistic savings targets that discourage you',
      'Not distinguishing between "want to have" and "need to have" expenses'
    ],
    successMetrics: [
      'Fund covers 3-6 months of essential expenses',
      'Consistent monthly contributions for at least 6 months',
      'Money remains untouched except for true emergencies',
      'Fund balance grows steadily toward target'
    ],
    prerequisites: ['Business bank account', 'Basic expense tracking', 'Monthly budget'],
    maintenanceRequired: true,
    roi: 10.0
  },

  {
    id: 'customer_communication_system',
    name: 'Customer Emergency Communication',
    category: 'preparation',
    description: 'Set up ways to quickly contact customers during emergencies',
    simplifiedDescription: 'Create a contact list and system to let customers know if you\'re open, closed, or have special hours during emergencies',
    whyImportant: 'During emergencies, customers don\'t know if you\'re open or closed. They might go to competitors instead of waiting to find out. Good communication keeps customers coming back and helps you reopen faster with their support.',
    applicableBusinessTypes: ['restaurant', 'grocery_store', 'pharmacy', 'beauty_salon', 'hardware_store', 'gas_station', 'retail_store'],
    applicableRisks: ['hurricane', 'flood', 'earthquake', 'powerOutage'],
    cost: 'low',
    timeToImplement: '1-2 weeks',
    effectiveness: 8,
    priority: 'medium',
    implementationSteps: [
      {
        title: 'Collect Customer Contact Information',
        description: 'Start gathering phone numbers and social media contacts from your regular customers.',
        phase: 'immediate',
        timeframe: '1 week',
        responsibility: 'Business Owner',
        resources: ['Customer receipt book', 'Phone', 'Simple form'],
        estimatedCost: 'Free',
        checklist: [
          'Create a simple sign-up form for customers',
          'Ask for phone numbers when customers make purchases',
          'Offer small discounts for providing contact info',
          'Use a notebook or simple app to track contacts',
          'Ask permission to contact them about business hours'
        ]
      },
      {
        title: 'Set Up Social Media Accounts',
        description: 'Create business Facebook and Instagram accounts to reach customers quickly.',
        phase: 'immediate',
        timeframe: '2-3 days',
        responsibility: 'Business Owner',
        resources: ['Smartphone', 'Internet access', 'Business photos'],
        estimatedCost: 'Free',
        checklist: [
          'Create Facebook business page with correct address and hours',
          'Set up Instagram business account',
          'Post photos of your business and products',
          'Include phone number and location in profiles',
          'Learn how to post updates quickly'
        ]
      },
      {
        title: 'Create Emergency Message Templates',
        description: 'Write standard messages ahead of time for different emergency situations.',
        phase: 'short_term',
        timeframe: '2-3 days',
        responsibility: 'Business Owner',
        resources: ['Computer or phone', 'Template examples'],
        estimatedCost: 'Free',
        checklist: [
          'Write message for "Closed due to storm"',
          'Create message for "Open with limited hours"',
          'Draft message for "Reopening after emergency"',
          'Include important details like hours and phone number',
          'Keep messages simple and clear'
        ]
      },
      {
        title: 'Set Up WhatsApp Business',
        description: 'Create a WhatsApp Business account to send quick updates to customer groups.',
        phase: 'short_term',
        timeframe: '1 day',
        responsibility: 'Business Owner',
        resources: ['Smartphone', 'Customer phone numbers'],
        estimatedCost: 'Free',
        checklist: [
          'Download WhatsApp Business app',
          'Set up business profile with hours and location',
          'Create broadcast lists for different customer groups',
          'Add customers to appropriate lists (ask permission first)',
          'Test sending messages to small groups'
        ]
      },
      {
        title: 'Practice Emergency Communication',
        description: 'Test your communication system and train staff on how to use it.',
        phase: 'medium_term',
        timeframe: '1 day',
        responsibility: 'Business Owner',
        resources: ['All communication accounts', 'Staff'],
        estimatedCost: 'Free',
        checklist: [
          'Send test messages to staff and family first',
          'Time how long it takes to update all platforms',
          'Train employees to help with social media posts',
          'Create simple instructions for emergency posting',
          'Update contact lists monthly'
        ]
      }
    ],
    helpfulTips: [
      'Use simple language in your messages - people are stressed during emergencies',
      'Post updates frequently, even if there\'s no change in your status',
      'Include estimated reopening times if you know them',
      'Share helpful community information to show you care about customers',
      'Thank customers for their patience and loyalty'
    ],
    commonMistakes: [
      'Only posting once and forgetting to update customers',
      'Using complicated language or technical terms',
      'Not asking permission before adding customers to WhatsApp groups',
      'Forgetting to update business hours on Google Maps',
      'Not having backup plans if internet is down'
    ],
    successMetrics: [
      'Contact list includes at least 50 regular customers',
      'Can post updates to all platforms in under 15 minutes',
      'Customers ask fewer questions about hours during emergencies',
      'Social media followers increase month over month'
    ],
    prerequisites: ['Smartphone or computer', 'Basic internet skills', 'Customer relationships'],
    maintenanceRequired: true,
    roi: 4.0
  },

  {
    id: 'inventory_protection',
    name: 'Inventory Protection System',
    category: 'prevention',
    description: 'Protect your valuable inventory from water damage, theft, and other emergency risks',
    simplifiedDescription: 'Move important products to safe places and use waterproof storage to protect inventory during storms and floods',
    whyImportant: 'Your inventory is often your biggest investment. During floods or storms, water can destroy thousands of dollars of products in minutes. Protecting inventory means you can reopen faster and don\'t lose money replacing everything.',
    applicableBusinessTypes: ['grocery_store', 'pharmacy', 'hardware_store', 'retail_store', 'beauty_salon'],
    applicableRisks: ['flood', 'hurricane'],
    cost: 'medium',
    timeToImplement: '1-3 weeks',
    effectiveness: 8,
    priority: 'high',
    implementationSteps: [
      {
        title: 'Identify Most Valuable Inventory',
        description: 'Make a list of your most expensive and important products that need the most protection.',
        phase: 'immediate',
        timeframe: '1-2 days',
        responsibility: 'Business Owner',
        resources: ['Inventory list', 'Calculator', 'Notebook'],
        estimatedCost: 'Free',
        checklist: [
          'List products worth more than JMD $1,000 each',
          'Identify items that are hard to replace quickly',
          'Note products that are easily damaged by water',
          'Include items with expiration dates',
          'Calculate total value of priority inventory'
        ]
      },
      {
        title: 'Find Higher Storage Areas',
        description: 'Identify shelves, rooms, or areas at least 3 feet above floor level for emergency storage.',
        phase: 'immediate',
        timeframe: '1 day',
        responsibility: 'Business Owner',
        resources: ['Measuring tape', 'Storage area map'],
        estimatedCost: 'Free',
        checklist: [
          'Measure height of existing shelves',
          'Look for upstairs storage areas',
          'Check if you can add higher shelves',
          'Identify areas away from windows',
          'Make sure high areas can support weight'
        ]
      },
      {
        title: 'Buy Waterproof Storage Containers',
        description: 'Purchase plastic bins, waterproof bags, or containers to protect valuable inventory.',
        phase: 'short_term',
        timeframe: '3-5 days',
        responsibility: 'Business Owner',
        resources: ['Budget', 'Transportation', 'Inventory measurements'],
        estimatedCost: 'JMD $5,000 - $20,000',
        checklist: [
          'Buy containers slightly larger than needed',
          'Choose clear containers to see contents easily',
          'Get containers with tight-fitting lids',
          'Include moisture absorber packets',
          'Label each container clearly'
        ]
      },
      {
        title: 'Create Emergency Moving Plan',
        description: 'Write down exactly what goes where and who does what when a storm warning comes.',
        phase: 'short_term',
        timeframe: '2-3 days',
        responsibility: 'Business Owner',
        resources: ['Priority inventory list', 'Storage area map', 'Staff contact list'],
        estimatedCost: 'Free',
        checklist: [
          'List which products go in which containers',
          'Assign specific tasks to each employee',
          'Set time limits for moving everything',
          'Include backup plans if some staff can\'t come',
          'Post the plan where everyone can see it'
        ]
      },
      {
        title: 'Practice Emergency Inventory Protection',
        description: 'Run through your plan with staff to make sure it works and everyone knows what to do.',
        phase: 'medium_term',
        timeframe: '2-3 hours',
        responsibility: 'Business Owner',
        resources: ['Full staff', 'All storage containers', 'Practice inventory'],
        estimatedCost: 'Staff time only',
        checklist: [
          'Time how long it takes to secure all priority inventory',
          'Test if containers fit in designated storage areas',
          'Make sure all staff understand their roles',
          'Identify and fix problems with the plan',
          'Practice at least twice per year'
        ]
      }
    ],
    helpfulTips: [
      'Start with your most expensive items first when emergency warnings come',
      'Keep some empty containers ready for quick packing',
      'Take photos of inventory before storms for insurance claims',
      'Consider renting a small storage unit for your most valuable items',
      'Build good relationships with suppliers for quick restocking after emergencies'
    ],
    commonMistakes: [
      'Waiting until the storm warning to start moving inventory',
      'Not involving staff in planning - they need to know the system',
      'Storing too much weight on high shelves that could collapse',
      'Forgetting to protect electronic items like computers and cash registers',
      'Not updating the plan when you get new types of inventory'
    ],
    successMetrics: [
      'Can secure priority inventory in under 2 hours with available staff',
      'Zero water damage to protected inventory during last flood/storm',
      'All containers remain dry and accessible after emergencies',
      'Staff can execute plan without constant supervision'
    ],
    prerequisites: ['Detailed inventory records', 'Staff cooperation', 'Storage space identification'],
    maintenanceRequired: true,
    roi: 5.0
  },

  // RESPONSE STRATEGIES
  {
    id: 'emergency_contacts_response',
    name: 'Emergency Response Contact System',
    category: 'response',
    description: 'Have important phone numbers ready to call during emergencies',
    simplifiedDescription: 'Keep a list of important phone numbers in easy reach so you can quickly call for help during emergencies',
    whyImportant: 'During emergencies, you need help fast but might not remember important numbers. Having contacts ready saves precious time and could prevent damage from getting worse. Quick response often means the difference between small problems and big disasters.',
    applicableBusinessTypes: ['all'],
    applicableRisks: ['hurricane', 'flood', 'earthquake', 'powerOutage'],
    cost: 'low',
    timeToImplement: '1-2 days',
    effectiveness: 7,
    priority: 'high',
    implementationSteps: [
      {
        title: 'Collect Emergency Service Numbers',
        description: 'Write down phone numbers for police, fire department, ambulance, and utility companies.',
        phase: 'immediate',
        timeframe: '2-3 hours',
        responsibility: 'Business Owner',
        resources: ['Phone book', 'Internet', 'Notebook'],
        estimatedCost: 'Free',
        checklist: [
          'Police station (local and 119)',
          'Fire department (local and 110)',
          'Hospital/ambulance service',
          'Electric company emergency line',
          'Water company emergency line',
          'Gas company emergency line'
        ]
      },
      {
        title: 'Gather Business-Specific Contacts',
        description: 'Collect numbers for insurance, landlord, suppliers, and other business contacts you\'d need during emergencies.',
        phase: 'immediate',
        timeframe: '1-2 hours',
        responsibility: 'Business Owner',
        resources: ['Business documents', 'Insurance papers', 'Supplier contacts'],
        estimatedCost: 'Free',
        checklist: [
          'Insurance company and agent',
          'Landlord or property management',
          'Key suppliers and vendors',
          'Bank manager and after-hours number',
          'Security company (if you have one)',
          'Generator service company'
        ]
      },
      {
        title: 'Create Emergency Contact Cards',
        description: 'Make wallet-sized cards with all important numbers that you and key staff can carry.',
        phase: 'immediate',
        timeframe: '1 hour',
        responsibility: 'Business Owner',
        resources: ['Cardstock or thick paper', 'Printer or neat handwriting', 'Laminator or clear tape'],
        estimatedCost: 'JMD $500',
        checklist: [
          'Print numbers in large, clear text',
          'Include your business name and address',
          'Laminate cards to protect from water',
          'Make copies for each key staff member',
          'Test that all numbers work before finalizing'
        ]
      },
      {
        title: 'Post Numbers in Key Locations',
        description: 'Put emergency contact lists where staff can easily find them during stressful situations.',
        phase: 'immediate',
        timeframe: '30 minutes',
        responsibility: 'Business Owner',
        resources: ['Contact lists', 'Clear tape or magnets', 'Protective covers'],
        estimatedCost: 'JMD $200',
        checklist: [
          'Post by main phone in office',
          'Put copy by cash register',
          'Place one in break room or staff area',
          'Keep copy in emergency supply kit',
          'Protect lists from water damage'
        ]
      },
      {
        title: 'Train Staff on Emergency Calling',
        description: 'Make sure all staff know when to call which numbers and what information to give.',
        phase: 'short_term',
        timeframe: '1 hour',
        responsibility: 'Business Owner',
        resources: ['Staff meeting time', 'Contact lists', 'Practice scenarios'],
        estimatedCost: 'Staff time only',
        checklist: [
          'Explain when to call each type of emergency service',
          'Practice giving clear business address and location',
          'Teach staff to stay calm and speak clearly',
          'Role-play different emergency scenarios',
          'Review contact list monthly in staff meetings'
        ]
      }
    ],
    helpfulTips: [
      'Program important numbers into your mobile phone with clear labels',
      'Include backup contact numbers when available',
      'Write down the specific information each service will need (exact address, account numbers)',
      'Keep one contact list in your car in case you\'re away when emergency happens',
      'Update phone numbers whenever you get new bills or notices'
    ],
    commonMistakes: [
      'Only keeping contacts in one place that could get damaged',
      'Not checking if numbers still work after company mergers or changes',
      'Forgetting to include account numbers with utility companies',
      'Making text too small to read during stressful situations',
      'Not training staff on what information to give to emergency services'
    ],
    successMetrics: [
      'All staff can locate contact list in under 30 seconds',
      'Contact information is current and accurate',
      'Staff can clearly communicate business location and emergency details',
      'Response time to emergencies improves due to quick contact'
    ],
    prerequisites: ['Basic phone skills', 'Knowledge of business address and key details'],
    maintenanceRequired: true,
    roi: 3.0
  },

  // RECOVERY STRATEGIES
  {
    id: 'rapid_cleanup_plan',
    name: 'Rapid Cleanup and Reopening Plan',
    category: 'recovery',
    description: 'Organized plan to clean up quickly and reopen your business after emergencies',
    simplifiedDescription: 'Have a step-by-step plan to clean up damage and get back to business as fast as possible after storms or floods',
    whyImportant: 'The faster you reopen, the less money you lose and the more customers stay loyal. Businesses that reopen quickly often gain customers from competitors who take longer. A good cleanup plan can save weeks of downtime.',
    applicableBusinessTypes: ['all'],
    applicableRisks: ['hurricane', 'flood', 'earthquake'],
    cost: 'low',
    timeToImplement: '1 week',
    effectiveness: 8,
    priority: 'medium',
    implementationSteps: [
      {
        title: 'Create Cleanup Supply Kit',
        description: 'Gather cleaning supplies, tools, and safety equipment you\'ll need after damage.',
        phase: 'immediate',
        timeframe: '1-2 days',
        responsibility: 'Business Owner',
        resources: ['Budget for supplies', 'Storage space', 'Hardware store access'],
        estimatedCost: 'JMD $10,000 - $25,000',
        checklist: [
          'Bleach and disinfectants for flood cleanup',
          'Mops, brooms, buckets, and cleaning cloths',
          'Rubber gloves, boots, and masks',
          'Trash bags and disposal containers',
          'Basic tools (hammer, screwdriver, pliers)',
          'Flashlights and batteries',
          'Camera for documenting damage'
        ]
      },
      {
        title: 'Identify Cleanup Contractors',
        description: 'Find reliable contractors for water removal, electrical work, and major repairs before you need them.',
        phase: 'immediate',
        timeframe: '2-3 days',
        responsibility: 'Business Owner',
        resources: ['Phone book', 'Internet', 'Recommendations from other businesses'],
        estimatedCost: 'Free research time',
        checklist: [
          'Water removal/drying service companies',
          'Electricians who do emergency work',
          'Plumbers for water and sewage problems',
          'General contractors for structural repairs',
          'Glass companies for window replacement',
          'Get contact numbers and check references'
        ]
      },
      {
        title: 'Document Your Business Layout',
        description: 'Take photos and videos of your business in normal condition for insurance and restoration reference.',
        phase: 'immediate',
        timeframe: '2-3 hours',
        responsibility: 'Business Owner',
        resources: ['Camera or smartphone', 'Storage for photos'],
        estimatedCost: 'Free',
        checklist: [
          'Photograph each room from multiple angles',
          'Take close-ups of expensive equipment and fixtures',
          'Video walkthrough explaining what everything is',
          'Store photos safely offsite (cloud storage or safe)',
          'Include photos of inventory and stock'
        ]
      },
      {
        title: 'Create Step-by-Step Cleanup Process',
        description: 'Write down exactly what to do first, second, third after damage occurs.',
        phase: 'short_term',
        timeframe: '3-4 hours',
        responsibility: 'Business Owner',
        resources: ['Computer or notebook', 'Cleanup research', 'Insurance guidance'],
        estimatedCost: 'Free',
        checklist: [
          '1. Ensure building is safe to enter',
          '2. Document all damage with photos',
          '3. Call insurance company immediately',
          '4. Remove standing water and wet materials',
          '5. Disinfect all surfaces',
          '6. Check and repair utilities',
          '7. Test equipment before reopening',
          '8. Notify customers of reopening'
        ]
      },
      {
        title: 'Train Staff on Cleanup Procedures',
        description: 'Teach employees how to help with cleanup safely and efficiently.',
        phase: 'medium_term',
        timeframe: '2 hours',
        responsibility: 'Business Owner',
        resources: ['Staff meeting time', 'Cleanup plan', 'Safety equipment'],
        estimatedCost: 'Staff time only',
        checklist: [
          'Show staff where cleanup supplies are stored',
          'Teach safety procedures for handling contaminated water',
          'Assign specific tasks to each person',
          'Explain when to call professionals vs. DIY',
          'Practice key procedures during slow business times'
        ]
      }
    ],
    helpfulTips: [
      'Start cleanup immediately after it\'s safe - mold grows fast in Jamaica\'s climate',
      'Take lots of photos before and during cleanup for insurance claims',
      'Prioritize getting electricity and water working first',
      'Clean from top to bottom (ceiling to floor) to avoid re-contaminating cleaned areas',
      'Don\'t try to save money on safety - proper protective equipment prevents injuries'
    ],
    commonMistakes: [
      'Starting cleanup before building safety is confirmed',
      'Not documenting damage thoroughly before cleanup begins',
      'Trying to save items that should be thrown away for health reasons',
      'Not calling insurance company quickly enough',
      'Rushing to reopen before everything is properly cleaned and safe'
    ],
    successMetrics: [
      'Can begin safe cleanup within 24 hours of damage',
      'Complete basic cleanup and damage assessment within 3 days',
      'Reopen within 1 week for minor damage incidents',
      'All staff know their cleanup roles and safety procedures'
    ],
    prerequisites: ['Basic understanding of business insurance', 'Storage space for supplies', 'Staff cooperation'],
    maintenanceRequired: true,
    roi: 6.0
  }
]

// Helper functions for template selection
export function getTemplatesForBusinessType(businessType: string): StrategyTemplate[] {
  return strategyTemplates.filter(template => 
    template.applicableBusinessTypes.includes('all') || 
    template.applicableBusinessTypes.includes(businessType)
  )
}

export function getTemplatesForRiskType(riskType: string): StrategyTemplate[] {
  return strategyTemplates.filter(template =>
    template.applicableRisks.includes(riskType)
  )
}

export function getTemplatesByCategory(category: 'prevention' | 'preparation' | 'response' | 'recovery'): StrategyTemplate[] {
  return strategyTemplates.filter(template => template.category === category)
}

export function getTemplatesByPriority(priority: 'critical' | 'high' | 'medium' | 'low'): StrategyTemplate[] {
  return strategyTemplates.filter(template => template.priority === priority)
}

export function getRecommendedTemplates(
  businessType: string, 
  riskProfile: string[], 
  businessSize: 'micro' | 'small' | 'medium' = 'small'
): StrategyTemplate[] {
  let templates = strategyTemplates.filter(template =>
    (template.applicableBusinessTypes.includes('all') || template.applicableBusinessTypes.includes(businessType)) &&
    riskProfile.some(risk => template.applicableRisks.includes(risk))
  )

  // Adjust recommendations based on business size
  if (businessSize === 'micro') {
    templates = templates.filter(template => template.cost !== 'high')
  }

  // Sort by priority and effectiveness
  return templates.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    const aPriority = priorityOrder[a.priority]
    const bPriority = priorityOrder[b.priority]
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority
    }
    
    return b.effectiveness - a.effectiveness
  })
}












// Business Continuity Action Plans Matrix
// This file contains the comprehensive matrix of actions for different business types and risk scenarios
// Edit this file to update action plans without modifying application logic

export interface ActionItem {
  task: string
  responsible: string
  duration?: string
  priority?: 'high' | 'medium' | 'low'
}

export interface ActionPlan {
  resourcesNeeded: string[]
  immediateActions: ActionItem[]      // 0-24 hours
  shortTermActions: ActionItem[]      // 1-7 days  
  mediumTermActions: ActionItem[]     // 1-4 weeks
  longTermReduction: string[]         // Ongoing prevention
}

export interface BusinessTypeModifiers {
  [businessType: string]: {
    additionalResources?: string[]
    modifiedActions?: {
      immediate?: ActionItem[]
      shortTerm?: ActionItem[]
      mediumTerm?: ActionItem[]
    }
    specificConsiderations?: string[]
  }
}

// Base action plans for each hazard type
export const HAZARD_ACTION_PLANS: { [hazardKey: string]: ActionPlan } = {
  'hurricane': {
    resourcesNeeded: [
      'Generator fuel (72 hours supply)',
      'Emergency cash fund ($5,000-$10,000)',
      'Staff emergency contact list',
      'Backup mobile devices and chargers',
      'Plywood/shutters for windows',
      'Emergency food and water (3-day supply)',
      'Battery-powered radios',
      'First aid kit',
      'Flashlights and batteries',
      'Plastic sheeting and duct tape'
    ],
    immediateActions: [
      { task: 'Activate emergency response team', responsible: 'Business Manager', duration: '1 hour', priority: 'high' },
      { task: 'Secure building (install shutters, move equipment)', responsible: 'Maintenance Team', duration: '4-8 hours', priority: 'high' },
      { task: 'Ensure all inventory secured and elevated', responsible: 'Operations Team', duration: '2-4 hours', priority: 'high' },
      { task: 'Test generator and fuel levels', responsible: 'Maintenance Team', duration: '30 minutes', priority: 'high' },
      { task: 'Notify staff and customers of potential closure', responsible: 'Management', duration: '2 hours', priority: 'high' },
      { task: 'Backup all critical data to off-site location', responsible: 'IT/Admin', duration: '2 hours', priority: 'high' },
      { task: 'Withdraw emergency cash for operations', responsible: 'Finance', duration: '1 hour', priority: 'medium' },
      { task: 'Document pre-storm facility condition (photos/video)', responsible: 'Management', duration: '1 hour', priority: 'medium' }
    ],
    shortTermActions: [
      { task: 'Monitor weather updates and warnings continuously', responsible: 'Management', duration: 'Ongoing', priority: 'high' },
      { task: 'Coordinate with staff on safety and availability', responsible: 'HR Manager', duration: 'Daily', priority: 'high' },
      { task: 'Secure additional emergency supplies if needed', responsible: 'Operations Team', duration: '2-4 hours', priority: 'medium' },
      { task: 'Contact insurance company to report potential exposure', responsible: 'Finance Manager', duration: '1 hour', priority: 'medium' },
      { task: 'Coordinate with suppliers on delivery delays', responsible: 'Supply Chain Manager', duration: '2 hours', priority: 'medium' },
      { task: 'Update emergency contact information', responsible: 'HR Manager', duration: '1 hour', priority: 'low' }
    ],
    mediumTermActions: [
      { task: 'Conduct comprehensive damage assessment', responsible: 'Management Team', duration: '1-2 days', priority: 'high' },
      { task: 'File detailed insurance claims with documentation', responsible: 'Finance Manager', duration: '3-5 days', priority: 'high' },
      { task: 'Plan phased business reopening strategy', responsible: 'Management Team', duration: '2-3 days', priority: 'high' },
      { task: 'Coordinate repairs with vetted contractors', responsible: 'Facilities Manager', duration: '1-2 weeks', priority: 'medium' },
      { task: 'Review and adjust business operations for recovery', responsible: 'Operations Manager', duration: '1 week', priority: 'medium' },
      { task: 'Communicate recovery timeline to stakeholders', responsible: 'Management', duration: '2 days', priority: 'medium' }
    ],
    longTermReduction: [
      'Install impact-resistant windows and doors',
      'Upgrade building to meet or exceed hurricane building codes',
      'Establish mutual aid agreements with other businesses',
      'Increase insurance coverage for hurricane-specific damage',
      'Create elevated storage areas for critical inventory',
      'Install permanent backup generator with auto-transfer switch',
      'Develop partnerships with out-of-area suppliers',
      'Implement quarterly hurricane preparedness drills'
    ]
  },

  'power_outage': {
    resourcesNeeded: [
      'Backup generator (appropriate capacity)',
      'Uninterruptible Power Supply (UPS) units',
      'Battery-powered emergency lighting',
      'Manual cash registers or calculators',
      'Two-way radios or satellite phones',
      'Generator fuel (72-hour supply)',
      'Extension cords and power strips',
      'Battery banks for devices',
      'Emergency lighting systems',
      'Manual documentation supplies'
    ],
    immediateActions: [
      { task: 'Activate backup generator immediately', responsible: 'Maintenance Team', duration: '15 minutes', priority: 'high' },
      { task: 'Switch to manual processes for critical operations', responsible: 'Operations Team', duration: '30 minutes', priority: 'high' },
      { task: 'Contact utility company to report outage and get ETA', responsible: 'Facilities Manager', duration: '15 minutes', priority: 'high' },
      { task: 'Secure cash registers and valuable electronic items', responsible: 'Operations Team', duration: '30 minutes', priority: 'high' },
      { task: 'Implement emergency lighting in critical areas', responsible: 'Maintenance Team', duration: '20 minutes', priority: 'high' },
      { task: 'Assess which operations can continue without power', responsible: 'Operations Manager', duration: '30 minutes', priority: 'medium' }
    ],
    shortTermActions: [
      { task: 'Monitor generator fuel levels every 4 hours', responsible: 'Maintenance Team', duration: 'Ongoing', priority: 'high' },
      { task: 'Coordinate with utility company on restoration timeline', responsible: 'Facilities Manager', duration: 'Every 2 hours', priority: 'high' },
      { task: 'Implement reduced operations to conserve power', responsible: 'Operations Manager', duration: '1 hour', priority: 'medium' },
      { task: 'Update customers on service availability and limitations', responsible: 'Customer Service', duration: '2 hours', priority: 'medium' },
      { task: 'Source additional fuel for extended outages', responsible: 'Maintenance Team', duration: '2-4 hours', priority: 'medium' }
    ],
    mediumTermActions: [
      { task: 'Evaluate backup power system performance', responsible: 'Facilities Manager', duration: '1 day', priority: 'high' },
      { task: 'Order additional generator equipment if deficiencies found', responsible: 'Maintenance Team', duration: '2-3 days', priority: 'medium' },
      { task: 'Review and update power outage procedures', responsible: 'Operations Manager', duration: '3 days', priority: 'medium' },
      { task: 'Document lessons learned and cost impacts', responsible: 'Management', duration: '1 week', priority: 'low' },
      { task: 'Conduct post-incident training with staff', responsible: 'HR Manager', duration: '1 week', priority: 'low' }
    ],
    longTermReduction: [
      'Install permanent backup generator system with auto-transfer',
      'Upgrade electrical infrastructure for better reliability',
      'Implement energy-efficient systems to reduce power needs',
      'Consider solar power backup systems with battery storage',
      'Establish agreements with multiple fuel suppliers',
      'Install surge protection for all critical equipment',
      'Create redundant power sources for essential operations',
      'Regular maintenance contracts for backup power systems'
    ]
  },

  'cyber_attack': {
    resourcesNeeded: [
      'Incident response team contact list',
      'Digital forensic analysis tools',
      'Clean backup systems and data',
      'Alternative communication channels',
      'Legal counsel and cyber security expert contacts',
      'Cyber insurance policy and claim forms',
      'Offline documentation and procedures',
      'Secure workstation for incident response',
      'Network isolation tools',
      'Emergency communication templates'
    ],
    immediateActions: [
      { task: 'Isolate affected systems immediately (disconnect from network)', responsible: 'IT Manager', duration: '5 minutes', priority: 'high' },
      { task: 'Activate cyber incident response plan', responsible: 'IT Manager', duration: '15 minutes', priority: 'high' },
      { task: 'Document all actions taken with timestamps', responsible: 'All Response Team', duration: 'Ongoing', priority: 'high' },
      { task: 'Contact cyber insurance provider immediately', responsible: 'Finance Manager', duration: '30 minutes', priority: 'high' },
      { task: 'Notify law enforcement if required by regulation', responsible: 'Management', duration: '1 hour', priority: 'high' },
      { task: 'Preserve digital evidence and affected systems', responsible: 'IT Team', duration: '2 hours', priority: 'high' }
    ],
    shortTermActions: [
      { task: 'Implement comprehensive containment measures', responsible: 'IT Team', duration: '4-8 hours', priority: 'high' },
      { task: 'Begin restoration from verified clean backups', responsible: 'IT Team', duration: '8-24 hours', priority: 'high' },
      { task: 'Conduct initial impact assessment', responsible: 'IT Manager', duration: '4 hours', priority: 'high' },
      { task: 'Coordinate with external cyber security experts', responsible: 'Management', duration: '2 hours', priority: 'medium' },
      { task: 'Notify affected customers and stakeholders', responsible: 'Management', duration: '6 hours', priority: 'medium' },
      { task: 'Set up alternative business operations', responsible: 'Operations Manager', duration: '8 hours', priority: 'medium' }
    ],
    mediumTermActions: [
      { task: 'Complete comprehensive forensic analysis', responsible: 'External Experts', duration: '1-2 weeks', priority: 'high' },
      { task: 'Implement enhanced security measures and patches', responsible: 'IT Team', duration: '1 week', priority: 'high' },
      { task: 'Provide detailed incident reports to stakeholders', responsible: 'Management', duration: '3-5 days', priority: 'medium' },
      { task: 'Review and update all cybersecurity policies', responsible: 'IT Manager', duration: '2 weeks', priority: 'medium' },
      { task: 'Conduct staff training on new security measures', responsible: 'HR & IT', duration: '1 week', priority: 'medium' }
    ],
    longTermReduction: [
      'Implement advanced cybersecurity monitoring (SOC)',
      'Conduct monthly security awareness training for all staff',
      'Upgrade firewall and intrusion detection systems',
      'Implement multi-factor authentication across all systems',
      'Regular penetration testing and vulnerability assessments',
      'Establish data encryption for all sensitive information',
      'Create air-gapped backup systems',
      'Develop cyber insurance coverage and incident response retainer'
    ]
  },

  'fire': {
    resourcesNeeded: [
      'Fire extinguishers (Class A, B, C)',
      'Fire suppression system',
      'Emergency evacuation maps and procedures',
      'Backup location for temporary operations',
      'Fire insurance policy documentation',
      'Emergency contact lists (fire dept, insurance)',
      'Critical document backups (fireproof safe)',
      'Emergency lighting and exit signs',
      'Smoke detectors and fire alarms',
      'Fire blankets and safety equipment'
    ],
    immediateActions: [
      { task: 'Evacuate all personnel to designated safe area', responsible: 'All Staff', duration: '2-5 minutes', priority: 'high' },
      { task: 'Call fire department and emergency services', responsible: 'First Available Person', duration: 'Immediate', priority: 'high' },
      { task: 'Conduct headcount to account for all staff and visitors', responsible: 'Floor Wardens', duration: '5 minutes', priority: 'high' },
      { task: 'Secure perimeter and prevent unauthorized re-entry', responsible: 'Management', duration: '15 minutes', priority: 'high' },
      { task: 'Contact insurance company to report incident', responsible: 'Management', duration: '1 hour', priority: 'high' },
      { task: 'Coordinate with fire department incident commander', responsible: 'Senior Manager', duration: 'Ongoing', priority: 'high' }
    ],
    shortTermActions: [
      { task: 'Coordinate with fire investigation team', responsible: 'Management', duration: '1-2 days', priority: 'high' },
      { task: 'Document damage with photos/video for insurance', responsible: 'Management', duration: '4 hours', priority: 'high' },
      { task: 'Arrange temporary alternative work location', responsible: 'Facilities Manager', duration: '24 hours', priority: 'high' },
      { task: 'Notify customers of service disruption and alternatives', responsible: 'Customer Service', duration: '4 hours', priority: 'medium' },
      { task: 'Secure damaged property and remaining assets', responsible: 'Security/Management', duration: '8 hours', priority: 'medium' },
      { task: 'Contact employees about work arrangements', responsible: 'HR Manager', duration: '8 hours', priority: 'medium' }
    ],
    mediumTermActions: [
      { task: 'File comprehensive insurance claims with documentation', responsible: 'Finance Manager', duration: '1 week', priority: 'high' },
      { task: 'Develop facility restoration or relocation plan', responsible: 'Management Team', duration: '1 week', priority: 'high' },
      { task: 'Coordinate with contractors for repairs/reconstruction', responsible: 'Facilities Manager', duration: '2-4 weeks', priority: 'medium' },
      { task: 'Review and improve fire safety procedures', responsible: 'Safety Manager', duration: '2 weeks', priority: 'medium' },
      { task: 'Establish timeline for full business resumption', responsible: 'Management', duration: '1 week', priority: 'medium' }
    ],
    longTermReduction: [
      'Install comprehensive sprinkler system throughout facility',
      'Upgrade fire detection and alarm systems',
      'Conduct monthly fire safety training and evacuation drills',
      'Improve electrical systems and eliminate fire hazards',
      'Establish off-site data backup and storage systems',
      'Create fire-resistant storage for critical documents',
      'Install fire-resistant building materials where possible',
      'Develop mutual aid agreements with nearby businesses'
    ]
  },

  'earthquake': {
    resourcesNeeded: [
      'Emergency supplies (72-hour kit)',
      'Structural assessment tools',
      'Heavy lifting/rescue equipment',
      'First aid supplies and AED',
      'Emergency communication devices',
      'Earthquake insurance documentation',
      'Backup power and lighting',
      'Water and food supplies',
      'Structural engineer contact information',
      'Emergency cash reserves'
    ],
    immediateActions: [
      { task: 'Ensure all personnel safety and account for everyone', responsible: 'All Staff', duration: '10 minutes', priority: 'high' },
      { task: 'Conduct initial safety assessment of building structure', responsible: 'Facilities Manager', duration: '30 minutes', priority: 'high' },
      { task: 'Shut off utilities if damage suspected (gas, water, electricity)', responsible: 'Maintenance Team', duration: '15 minutes', priority: 'high' },
      { task: 'Contact emergency services if injuries or major damage', responsible: 'Management', duration: '5 minutes', priority: 'high' },
      { task: 'Establish safe area away from damaged structures', responsible: 'Floor Wardens', duration: '10 minutes', priority: 'high' },
      { task: 'Check for and assist injured personnel', responsible: 'First Aid Trained Staff', duration: '20 minutes', priority: 'high' }
    ],
    shortTermActions: [
      { task: 'Arrange professional structural inspection', responsible: 'Facilities Manager', duration: '4-8 hours', priority: 'high' },
      { task: 'Document all damage with photos/video', responsible: 'Management', duration: '2-4 hours', priority: 'high' },
      { task: 'Contact insurance company to report earthquake damage', responsible: 'Finance Manager', duration: '2 hours', priority: 'high' },
      { task: 'Coordinate with local emergency management', responsible: 'Management', duration: 'Ongoing', priority: 'medium' },
      { task: 'Check on employee welfare and housing situation', responsible: 'HR Manager', duration: '1 day', priority: 'medium' }
    ],
    mediumTermActions: [
      { task: 'Complete detailed structural and safety assessment', responsible: 'Licensed Engineer', duration: '3-5 days', priority: 'high' },
      { task: 'File earthquake insurance claims with full documentation', responsible: 'Finance Manager', duration: '1 week', priority: 'high' },
      { task: 'Coordinate repairs with qualified contractors', responsible: 'Facilities Manager', duration: '2-6 weeks', priority: 'medium' },
      { task: 'Establish alternative operations if building unusable', responsible: 'Management', duration: '1 week', priority: 'medium' },
      { task: 'Review and update earthquake preparedness procedures', responsible: 'Safety Manager', duration: '2 weeks', priority: 'low' }
    ],
    longTermReduction: [
      'Retrofit building to meet current seismic building codes',
      'Secure heavy equipment and shelving to prevent tipping',
      'Install automatic gas shut-off valves',
      'Conduct regular earthquake preparedness drills',
      'Establish off-site backup facilities and data storage',
      'Improve earthquake insurance coverage',
      'Create emergency supply caches in multiple locations',
      'Train staff in earthquake response and first aid'
    ]
  },

  'flood': {
    resourcesNeeded: [
      'Water pumps and generators',
      'Sandbags and flood barriers',
      'Waterproof storage containers',
      'Flood insurance documentation',
      'Emergency supplies above flood level',
      'Water testing kits',
      'Dehumidifiers and fans',
      'Protective clothing and boots',
      'Documentation in waterproof containers',
      'Alternative transportation arrangements'
    ],
    immediateActions: [
      { task: 'Move critical equipment and inventory to higher ground', responsible: 'Operations Team', duration: '2-4 hours', priority: 'high' },
      { task: 'Shut off electrical power to affected areas', responsible: 'Maintenance Team', duration: '30 minutes', priority: 'high' },
      { task: 'Evacuate personnel if flooding threatens safety', responsible: 'Management', duration: '1 hour', priority: 'high' },
      { task: 'Contact emergency services and report flood conditions', responsible: 'Management', duration: '15 minutes', priority: 'high' },
      { task: 'Install flood barriers and sandbags where possible', responsible: 'Maintenance Team', duration: '2-3 hours', priority: 'medium' },
      { task: 'Secure important documents in waterproof storage', responsible: 'Admin Team', duration: '1 hour', priority: 'medium' }
    ],
    shortTermActions: [
      { task: 'Monitor water levels and weather forecasts', responsible: 'Management', duration: 'Ongoing', priority: 'high' },
      { task: 'Begin water removal once safe to do so', responsible: 'Maintenance Team', duration: '1-3 days', priority: 'high' },
      { task: 'Document all flood damage with photos/video', responsible: 'Management', duration: '1 day', priority: 'high' },
      { task: 'Contact flood insurance provider', responsible: 'Finance Manager', duration: '4 hours', priority: 'medium' },
      { task: 'Coordinate with local authorities on area conditions', responsible: 'Management', duration: 'Daily', priority: 'medium' }
    ],
    mediumTermActions: [
      { task: 'Conduct comprehensive damage assessment', responsible: 'Management Team', duration: '3-5 days', priority: 'high' },
      { task: 'Begin professional water damage restoration', responsible: 'Restoration Contractors', duration: '1-4 weeks', priority: 'high' },
      { task: 'File detailed flood insurance claims', responsible: 'Finance Manager', duration: '1 week', priority: 'high' },
      { task: 'Test and replace damaged equipment and systems', responsible: 'IT/Maintenance', duration: '2-4 weeks', priority: 'medium' },
      { task: 'Develop temporary operations plan', responsible: 'Operations Manager', duration: '1 week', priority: 'medium' }
    ],
    longTermReduction: [
      'Install flood-resistant building modifications',
      'Elevate critical equipment above potential flood levels',
      'Improve drainage systems around facility',
      'Develop relationships with flood restoration contractors',
      'Enhance flood insurance coverage',
      'Create elevated storage areas for critical inventory',
      'Install flood warning systems and procedures',
      'Establish alternative facilities in non-flood zones'
    ]
  }
}

// Business type specific modifications to base plans
export const BUSINESS_TYPE_MODIFIERS: BusinessTypeModifiers = {
  'tourism': {
    additionalResources: [
      'Guest notification systems',
      'Alternative accommodation arrangements',
      'Tour cancellation procedures',
      'Customer refund policies',
      'Travel advisory communication templates'
    ],
    modifiedActions: {
      immediate: [
        { task: 'Notify all current guests of emergency situation', responsible: 'Front Desk Manager', duration: '1 hour', priority: 'high' },
        { task: 'Activate guest evacuation procedures if necessary', responsible: 'Security/Management', duration: '30 minutes', priority: 'high' },
        { task: 'Coordinate with local tourism authorities', responsible: 'Management', duration: '2 hours', priority: 'medium' }
      ],
      shortTerm: [
        { task: 'Arrange alternative accommodation for displaced guests', responsible: 'Guest Services', duration: '4-8 hours', priority: 'high' },
        { task: 'Cancel upcoming tours and activities', responsible: 'Tour Operations', duration: '2 hours', priority: 'medium' },
        { task: 'Process guest refunds and insurance claims', responsible: 'Finance', duration: '1-2 days', priority: 'medium' }
      ]
    },
    specificConsiderations: [
      'Guest safety is paramount and supersedes business operations',
      'Coordinate with local tourism board and hospitality association',
      'Maintain communication with tour operators and travel agents',
      'Consider seasonal impacts on tourism revenue',
      'Coordinate with transportation providers for guest evacuation'
    ]
  },

  'retail': {
    additionalResources: [
      'Point-of-sale backup systems',
      'Inventory protection supplies',
      'Customer notification systems',
      'Security systems and personnel',
      'Alternative payment processing methods'
    ],
    modifiedActions: {
      immediate: [
        { task: 'Secure all cash registers and payment systems', responsible: 'Store Manager', duration: '30 minutes', priority: 'high' },
        { task: 'Protect high-value inventory and electronics', responsible: 'Operations Team', duration: '1-2 hours', priority: 'high' },
        { task: 'Post customer notices about store status', responsible: 'Customer Service', duration: '30 minutes', priority: 'medium' }
      ],
      shortTerm: [
        { task: 'Implement mobile point-of-sale if possible', responsible: 'IT/Operations', duration: '2-4 hours', priority: 'medium' },
        { task: 'Coordinate with suppliers on delivery delays', responsible: 'Purchasing Manager', duration: '1 day', priority: 'medium' },
        { task: 'Update website and social media with store status', responsible: 'Marketing', duration: '2 hours', priority: 'low' }
      ]
    },
    specificConsiderations: [
      'Inventory protection is critical to minimize losses',
      'Customer notification prevents lost sales and reputation damage',
      'Point-of-sale system backup ensures business continuity',
      'Security measures prevent theft during emergency periods',
      'Supplier coordination minimizes supply chain disruption'
    ]
  },

  'food_service': {
    additionalResources: [
      'Food safety thermometers',
      'Alternative cooking equipment',
      'Refrigeration backup systems',
      'Food spoilage insurance documentation',
      'Health department contact information'
    ],
    modifiedActions: {
      immediate: [
        { task: 'Secure all perishable food inventory', responsible: 'Kitchen Manager', duration: '1 hour', priority: 'high' },
        { task: 'Monitor refrigeration systems and temperatures', responsible: 'Kitchen Staff', duration: 'Ongoing', priority: 'high' },
        { task: 'Contact health department about food safety concerns', responsible: 'Manager', duration: '1 hour', priority: 'medium' }
      ],
      shortTerm: [
        { task: 'Arrange alternative refrigeration if systems fail', responsible: 'Kitchen Manager', duration: '2-4 hours', priority: 'high' },
        { task: 'Document food spoilage for insurance claims', responsible: 'Manager', duration: '1 day', priority: 'medium' },
        { task: 'Coordinate with suppliers for replacement inventory', responsible: 'Purchasing', duration: '1-2 days', priority: 'medium' }
      ]
    },
    specificConsiderations: [
      'Food safety regulations must be maintained even during emergencies',
      'Perishable inventory loss can be significant financial impact',
      'Health department coordination ensures compliance',
      'Alternative cooking methods may be needed for service continuity',
      'Customer health and safety cannot be compromised'
    ]
  },

  'manufacturing': {
    additionalResources: [
      'Industrial safety equipment',
      'Hazardous material containment supplies',
      'Production line backup procedures',
      'Quality control testing equipment',
      'Environmental cleanup materials'
    ],
    modifiedActions: {
      immediate: [
        { task: 'Secure all hazardous materials and chemicals', responsible: 'Safety Manager', duration: '1 hour', priority: 'high' },
        { task: 'Shut down production lines safely', responsible: 'Production Manager', duration: '2 hours', priority: 'high' },
        { task: 'Contact environmental authorities if spill risk', responsible: 'Management', duration: '30 minutes', priority: 'high' }
      ],
      shortTerm: [
        { task: 'Assess production equipment for damage', responsible: 'Maintenance Team', duration: '1-2 days', priority: 'high' },
        { task: 'Coordinate with customers on order delays', responsible: 'Sales Manager', duration: '1 day', priority: 'medium' },
        { task: 'Arrange alternative production if possible', responsible: 'Operations Manager', duration: '2-3 days', priority: 'medium' }
      ]
    },
    specificConsiderations: [
      'Environmental compliance is critical during emergencies',
      'Production equipment damage assessment requires technical expertise',
      'Customer notification prevents supply chain disruptions',
      'Hazardous material handling follows strict safety protocols',
      'Quality control must be maintained in alternative operations'
    ]
  },

  'technology': {
    additionalResources: [
      'Backup servers and cloud infrastructure',
      'Cybersecurity incident response tools',
      'Data recovery systems',
      'Alternative internet connectivity',
      'Remote work setup equipment'
    ],
    modifiedActions: {
      immediate: [
        { task: 'Activate data backup and recovery procedures', responsible: 'IT Manager', duration: '1 hour', priority: 'high' },
        { task: 'Switch to cloud-based backup systems', responsible: 'IT Team', duration: '2 hours', priority: 'high' },
        { task: 'Enable remote work capabilities for staff', responsible: 'IT Support', duration: '2-4 hours', priority: 'medium' }
      ],
      shortTerm: [
        { task: 'Test all backup systems and data integrity', responsible: 'IT Team', duration: '1-2 days', priority: 'high' },
        { task: 'Coordinate with clients on service availability', responsible: 'Account Managers', duration: '1 day', priority: 'medium' },
        { task: 'Implement temporary development environment', responsible: 'Development Team', duration: '2-3 days', priority: 'medium' }
      ]
    },
    specificConsiderations: [
      'Data protection and recovery is business-critical',
      'Client communication about service impacts is essential',
      'Remote work capabilities ensure business continuity',
      'Cybersecurity measures must be maintained during emergencies',
      'Alternative infrastructure may be needed for critical services'
    ]
  }
}

// Function to get business type from form data
export function getBusinessTypeFromFormData(formData: any): string {
  const businessPurpose = formData?.BUSINESS_OVERVIEW?.['Business Purpose']?.toLowerCase() || ''
  const productsServices = formData?.BUSINESS_OVERVIEW?.['Products & Services']?.toLowerCase() || ''
  const businessDescription = `${businessPurpose} ${productsServices}`.toLowerCase()

  // Business type detection logic
  if (businessDescription.includes('hotel') || businessDescription.includes('resort') || 
      businessDescription.includes('tour') || businessDescription.includes('tourism') ||
      businessDescription.includes('restaurant') || businessDescription.includes('accommodation')) {
    return 'tourism'
  }
  
  if (businessDescription.includes('retail') || businessDescription.includes('shop') || 
      businessDescription.includes('store') || businessDescription.includes('sales') ||
      businessDescription.includes('customer') || businessDescription.includes('merchandise')) {
    return 'retail'
  }
  
  if (businessDescription.includes('restaurant') || businessDescription.includes('food') || 
      businessDescription.includes('catering') || businessDescription.includes('kitchen') ||
      businessDescription.includes('dining') || businessDescription.includes('culinary')) {
    return 'food_service'
  }
  
  if (businessDescription.includes('manufacturing') || businessDescription.includes('production') || 
      businessDescription.includes('factory') || businessDescription.includes('assembly') ||
      businessDescription.includes('industrial') || businessDescription.includes('processing')) {
    return 'manufacturing'
  }
  
  if (businessDescription.includes('technology') || businessDescription.includes('software') || 
      businessDescription.includes('it ') || businessDescription.includes('tech') ||
      businessDescription.includes('digital') || businessDescription.includes('computer')) {
    return 'technology'
  }
  
  return 'general' // Default fallback
} 
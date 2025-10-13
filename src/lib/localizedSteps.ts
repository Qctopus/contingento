import { useTranslations } from 'next-intl'
import { type StepsCollection } from './steps'

export function useLocalizedSteps(): StepsCollection {
  const t = useTranslations('steps')

  return {
    PLAN_INFORMATION: {
      title: t('planInformation.title'),
      description: t('planInformation.description'),
      inputs: [
        {
          type: 'text',
          label: t('planInformation.inputs.companyName.label'),
          required: true,
          prompt: t('planInformation.inputs.companyName.prompt'),
          examples: [
            t('planInformation.inputs.companyName.examples.0'),
            t('planInformation.inputs.companyName.examples.1'),
            t('planInformation.inputs.companyName.examples.2'),
          ],
        },
        {
          type: 'text',
          label: 'Business Address',
          required: true,
          prompt: 'What is your complete business address including street, city, and country?',
          examples: [
            '45 Harbor View Plaza, Bridgetown, Barbados',
            '123 Main Street, Kingston, Jamaica', 
            '67 Independence Avenue, Port of Spain, Trinidad'
          ],
        },
        {
          type: 'text',
          label: t('planInformation.inputs.planManager.label'),
          required: true,
          prompt: t('planInformation.inputs.planManager.prompt'),
          examples: [
            t('planInformation.inputs.planManager.examples.0'),
            t('planInformation.inputs.planManager.examples.1'),
            t('planInformation.inputs.planManager.examples.2'),
          ],
        },
        {
          type: 'text',
          label: t('planInformation.inputs.alternateManager.label'),
          required: false,
          prompt: t('planInformation.inputs.alternateManager.prompt'),
          examples: [
            t('planInformation.inputs.alternateManager.examples.0'),
            t('planInformation.inputs.alternateManager.examples.1'),
            t('planInformation.inputs.alternateManager.examples.2'),
            t('planInformation.inputs.alternateManager.examples.3'),
            t('planInformation.inputs.alternateManager.examples.4'),
            t('planInformation.inputs.alternateManager.examples.5'),
          ],
        },
        {
          type: 'text',
          label: t('planInformation.inputs.physicalPlanLocation.label'),
          required: true,
          prompt: t('planInformation.inputs.physicalPlanLocation.prompt'),
          examples: [
            t('planInformation.inputs.physicalPlanLocation.examples.0'),
            t('planInformation.inputs.physicalPlanLocation.examples.1'),
            t('planInformation.inputs.physicalPlanLocation.examples.2'),
            t('planInformation.inputs.physicalPlanLocation.examples.3'),
          ],
        },
        {
          type: 'text',
          label: t('planInformation.inputs.digitalPlanLocation.label'),
          required: false,
          prompt: t('planInformation.inputs.digitalPlanLocation.prompt'),
          examples: [
            t('planInformation.inputs.digitalPlanLocation.examples.0'),
            t('planInformation.inputs.digitalPlanLocation.examples.1'),
            t('planInformation.inputs.digitalPlanLocation.examples.2'),
            t('planInformation.inputs.digitalPlanLocation.examples.3'),
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
      title: t('businessOverview.title'),
      description: t('businessOverview.description'),
      inputs: [
        {
          type: 'text',
          label: t('businessOverview.inputs.businessLicense.label'),
          required: true,
          prompt: t('businessOverview.inputs.businessLicense.prompt'),
          examples: [
            t('businessOverview.inputs.businessLicense.examples.0'),
            t('businessOverview.inputs.businessLicense.examples.1'),
            t('businessOverview.inputs.businessLicense.examples.2'),
          ],
        },
        {
          type: 'text',
          label: t('businessOverview.inputs.businessPurpose.label'),
          required: true,
          prompt: t('businessOverview.inputs.businessPurpose.prompt'),
          examples: [
            t('businessOverview.inputs.businessPurpose.examples.0'),
            t('businessOverview.inputs.businessPurpose.examples.1'),
            t('businessOverview.inputs.businessPurpose.examples.2'),
          ],
        },
        {
          type: 'text',
          label: t('businessOverview.inputs.productsAndServices.label'),
          required: true,
          prompt: t('businessOverview.inputs.productsAndServices.prompt'),
          examples: [
            t('businessOverview.inputs.productsAndServices.examples.0'),
            t('businessOverview.inputs.productsAndServices.examples.1'),
            t('businessOverview.inputs.productsAndServices.examples.2'),
          ],
        },
        {
          type: 'text',
          label: t('businessOverview.inputs.serviceDeliveryMethods.label'),
          required: true,
          prompt: t('businessOverview.inputs.serviceDeliveryMethods.prompt'),
          examples: [
            t('businessOverview.inputs.serviceDeliveryMethods.examples.0'),
            t('businessOverview.inputs.serviceDeliveryMethods.examples.1'),
            t('businessOverview.inputs.serviceDeliveryMethods.examples.2'),
          ],
        },
        {
          type: 'text',
          label: t('businessOverview.inputs.operatingHours.label'),
          required: true,
          prompt: t('businessOverview.inputs.operatingHours.prompt'),
          examples: [
            t('businessOverview.inputs.operatingHours.examples.0'),
            t('businessOverview.inputs.operatingHours.examples.1'),
            t('businessOverview.inputs.operatingHours.examples.2'),
          ],
        },
        {
          type: 'text',
          label: t('businessOverview.inputs.keyPersonnel.label'),
          required: true,
          prompt: t('businessOverview.inputs.keyPersonnel.prompt'),
          examples: [
            t('businessOverview.inputs.keyPersonnel.examples.0'),
            t('businessOverview.inputs.keyPersonnel.examples.1'),
            t('businessOverview.inputs.keyPersonnel.examples.2'),
          ],
        },
        {
          type: 'text',
          label: t('businessOverview.inputs.minimumResources.label'),
          required: true,
          prompt: t('businessOverview.inputs.minimumResources.prompt'),
          examples: [
            t('businessOverview.inputs.minimumResources.examples.0'),
            t('businessOverview.inputs.minimumResources.examples.1'),
            t('businessOverview.inputs.minimumResources.examples.2'),
          ],
        },
        {
          type: 'text',
          label: t('businessOverview.inputs.customerBase.label'),
          required: true,
          prompt: t('businessOverview.inputs.customerBase.prompt'),
          examples: [
            t('businessOverview.inputs.customerBase.examples.0'),
            t('businessOverview.inputs.customerBase.examples.1'),
            t('businessOverview.inputs.customerBase.examples.2'),
          ],
        },
        {
          type: 'radio',
          label: t('businessOverview.inputs.serviceProviderBCP.label'),
          required: true,
          prompt: t('businessOverview.inputs.serviceProviderBCP.prompt'),
          options: [
            { label: t('businessOverview.inputs.serviceProviderBCP.options.0.label'), value: 'yes' },
            { label: t('businessOverview.inputs.serviceProviderBCP.options.1.label'), value: 'no' },
            { label: t('businessOverview.inputs.serviceProviderBCP.options.2.label'), value: 'partial' },
            { label: t('businessOverview.inputs.serviceProviderBCP.options.3.label'), value: 'unknown' },
          ],
        },
      ],
    },

    ESSENTIAL_FUNCTIONS: {
      title: t('essentialFunctions.title'),
      description: t('essentialFunctions.description'),
      inputs: [
        {
          type: 'table',
          label: t('essentialFunctions.inputs.businessFunctions.label'),
          required: true,
          prompt: t('essentialFunctions.inputs.businessFunctions.prompt'),
          tableColumns: [
            t('essentialFunctions.inputs.businessFunctions.tableColumns.0'),
            t('essentialFunctions.inputs.businessFunctions.tableColumns.1'),
            t('essentialFunctions.inputs.businessFunctions.tableColumns.2'),
            t('essentialFunctions.inputs.businessFunctions.tableColumns.3'),
            t('essentialFunctions.inputs.businessFunctions.tableColumns.4'),
          ],
          tableRowsPrompt: t('essentialFunctions.inputs.businessFunctions.tableRowsPromptPartial'),
          priorityOptions: [
            { label: t('essentialFunctions.inputs.businessFunctions.priorityOptions.0.label'), value: 'critical' },
            { label: t('essentialFunctions.inputs.businessFunctions.priorityOptions.1.label'), value: 'important' },
            { label: t('essentialFunctions.inputs.businessFunctions.priorityOptions.2.label'), value: 'useful' },
            { label: t('essentialFunctions.inputs.businessFunctions.priorityOptions.3.label'), value: 'deferrable' },
          ],
          downtimeOptions: [
            { label: t('essentialFunctions.inputs.businessFunctions.downtimeOptions.0.label'), value: '0-2h' },
            { label: t('essentialFunctions.inputs.businessFunctions.downtimeOptions.1.label'), value: '2-8h' },
            { label: t('essentialFunctions.inputs.businessFunctions.downtimeOptions.2.label'), value: '8-24h' },
            { label: t('essentialFunctions.inputs.businessFunctions.downtimeOptions.3.label'), value: '1-3d' },
            { label: t('essentialFunctions.inputs.businessFunctions.downtimeOptions.4.label'), value: '3-7d' },
            { label: t('essentialFunctions.inputs.businessFunctions.downtimeOptions.5.label'), value: '1-2w' },
            { label: t('essentialFunctions.inputs.businessFunctions.downtimeOptions.6.label'), value: '2w+' },
          ],
          examples: [
            t('essentialFunctions.inputs.businessFunctions.examples.0'),
            t('essentialFunctions.inputs.businessFunctions.examples.1'),
            t('essentialFunctions.inputs.businessFunctions.examples.2'),
          ],
        },
      ],
    },

    RISK_ASSESSMENT: {
      title: t('riskAssessment.title'),
      description: t('riskAssessment.description'),
      inputs: [
        {
          type: 'special_risk_matrix',
          label: t('riskAssessment.inputs.riskMatrix.label'),
          prompt: t('riskAssessment.inputs.riskMatrix.prompt'),
          required: true,
          examples: [
            t('riskAssessment.inputs.riskMatrix.examples.0'),
            t('riskAssessment.inputs.riskMatrix.examples.1'),
            t('riskAssessment.inputs.riskMatrix.examples.2'),
          ],
        },
      ],
    },

    STRATEGIES: {
      title: t('strategies.title'),
      description: t('strategies.description'),
      inputs: [
        {
          type: 'special_strategy_cards',
          label: t('strategies.title'),
          required: true,
          prompt: t('steps.strategySelection.selectStrategiesDescription'),
          examples: [
            t('strategies.examples.autoRecommended'),
            t('strategies.examples.prevention'),
            t('strategies.examples.response'),
            t('strategies.examples.recovery')
          ],
        },
      ],
    },

    CONTACTS_AND_INFORMATION: {
      title: t('contactsAndInformation.title'),
      description: t('contactsAndInformation.description'),
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
          label: t('contactsAndInformation.inputs.criticalBusinessInfo.label'),
          required: true,
          prompt: t('contactsAndInformation.inputs.criticalBusinessInfo.prompt'),
          examples: [
            t('contactsAndInformation.inputs.criticalBusinessInfo.examples.0'),
            t('contactsAndInformation.inputs.criticalBusinessInfo.examples.1'),
          ],
        },
        {
          type: 'table',
          label: t('contactsAndInformation.inputs.planDistribution.label'),
          prompt: t('contactsAndInformation.inputs.planDistribution.prompt'),
          required: true,
          tableColumns: [
            t('contactsAndInformation.inputs.planDistribution.tableColumns.0'),
            t('contactsAndInformation.inputs.planDistribution.tableColumns.1'),
            t('contactsAndInformation.inputs.planDistribution.tableColumns.2'),
            t('contactsAndInformation.inputs.planDistribution.tableColumns.3'),
            t('contactsAndInformation.inputs.planDistribution.tableColumns.4'),
          ],
          tableRowsPrompt: t('contactsAndInformation.inputs.planDistribution.tableRowsPrompt'),
          examples: [
            t('contactsAndInformation.inputs.planDistribution.examples.0'),
            t('contactsAndInformation.inputs.planDistribution.examples.1'),
            t('contactsAndInformation.inputs.planDistribution.examples.2'),
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
        },
      ],
    },

    TESTING_AND_MAINTENANCE: {
      title: t('testingAndMaintenance.title'),
      description: t('testingAndMaintenance.description'),
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
          label: t('testingAndMaintenance.inputs.revisionHistory.label'),
          prompt: t('testingAndMaintenance.inputs.revisionHistory.prompt'),
          required: true,
          tableColumns: [
            t('testingAndMaintenance.inputs.revisionHistory.tableColumns.0'),
            t('testingAndMaintenance.inputs.revisionHistory.tableColumns.1'),
            t('testingAndMaintenance.inputs.revisionHistory.tableColumns.2'),
            t('testingAndMaintenance.inputs.revisionHistory.tableColumns.3'),
            t('testingAndMaintenance.inputs.revisionHistory.tableColumns.4'),
          ],
          tableRowsPrompt: t('testingAndMaintenance.inputs.revisionHistory.tableRowsPrompt'),
          examples: [
            t('testingAndMaintenance.inputs.revisionHistory.examples.0'),
            t('testingAndMaintenance.inputs.revisionHistory.examples.1'),
            t('testingAndMaintenance.inputs.revisionHistory.examples.2'),
          ],
        },
        {
          type: 'table',
          label: t('testingAndMaintenance.inputs.improvementTracking.label'),
          prompt: t('testingAndMaintenance.inputs.improvementTracking.prompt'),
          required: true,
          tableColumns: [
            t('testingAndMaintenance.inputs.improvementTracking.tableColumns.0'),
            t('testingAndMaintenance.inputs.improvementTracking.tableColumns.1'),
            t('testingAndMaintenance.inputs.improvementTracking.tableColumns.2'),
            t('testingAndMaintenance.inputs.improvementTracking.tableColumns.3'),
            t('testingAndMaintenance.inputs.improvementTracking.tableColumns.4'),
          ],
          tableRowsPrompt: t('testingAndMaintenance.inputs.improvementTracking.tableRowsPrompt'),
          examples: [
            t('testingAndMaintenance.inputs.improvementTracking.examples.0'),
            t('testingAndMaintenance.inputs.improvementTracking.examples.1'),
            t('testingAndMaintenance.inputs.improvementTracking.examples.2'),
          ],
        },
        {
          type: 'text',
          label: t('testingAndMaintenance.inputs.annualReview.label'),
          required: true,
          prompt: t('testingAndMaintenance.inputs.annualReview.prompt'),
          examples: [
            t('testingAndMaintenance.inputs.annualReview.examples.0'),
            t('testingAndMaintenance.inputs.annualReview.examples.1'),
            t('testingAndMaintenance.inputs.annualReview.examples.2'),
          ],
        },
        {
          type: 'text',
          label: t('testingAndMaintenance.inputs.triggerEvents.label'),
          required: true,
          prompt: t('testingAndMaintenance.inputs.triggerEvents.prompt'),
          examples: [
            t('testingAndMaintenance.inputs.triggerEvents.examples.0'),
            t('testingAndMaintenance.inputs.triggerEvents.examples.1'),
            t('testingAndMaintenance.inputs.triggerEvents.examples.2'),
          ],
        },
      ],
    },
  }
} 
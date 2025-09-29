import { NextRequest, NextResponse } from 'next/server'
import { strategyTemplates } from '@/services/strategyTemplates'

// Convert strategy templates to admin format
const convertTemplateToStrategy = (template: any) => ({
  id: template.id,
  strategyId: template.id,
  name: template.name,
  category: template.category,
  description: template.description,
  applicableRisks: template.applicableRisks,
  implementationCost: template.cost,
  costEstimateJMD: template.cost === 'low' ? 'Under JMD $10,000' : 
                   template.cost === 'medium' ? 'JMD $10,000 - $50,000' : 
                   'Over JMD $50,000',
  implementationTime: template.implementationTime,
  timeToImplement: template.timeToImplement,
  effectiveness: template.effectiveness,
  businessTypes: template.applicableBusinessTypes,
  priority: template.priority,
  helpfulTips: template.helpfulTips,
  commonMistakes: template.commonMistakes,
  successMetrics: template.successMetrics,
  prerequisites: template.prerequisites,
  roi: template.roi,
  actionSteps: template.implementationSteps.map((step: any, index: number) => ({
    id: `${template.id}_step_${index + 1}`,
    phase: step.phase,
    action: step.description,
    timeframe: step.timeframe,
    responsibility: step.responsibility,
    resources: step.resources,
    cost: step.estimatedCost,
    estimatedCostJMD: step.estimatedCost,
    checklist: step.checklist || []
  }))
})

// Legacy mock strategies for backwards compatibility
const mockStrategies = [
  {
    id: '1',
    strategyId: 'backup_generator',
    name: 'Backup Generator System',
    category: 'prevention',
    description: 'Install and maintain backup power generation to ensure business continuity during power outages',
    applicableRisks: ['powerOutage', 'hurricane'],
    implementationCost: 'high',
    implementationTime: 'weeks',
    effectiveness: 9,
    businessTypes: ['hospitality', 'retail', 'services'],
    priority: 'high',
    actionSteps: [
      {
        id: '1-1',
        phase: 'immediate',
        action: 'Assess power requirements and identify critical equipment',
        timeframe: '1-2 days',
        responsibility: 'Business Owner/Manager',
        resources: ['Electrical assessment', 'Equipment audit'],
        cost: 'JMD 20,000-30,000'
      },
      {
        id: '1-2',
        phase: 'short_term',
        action: 'Purchase and install appropriate generator system',
        timeframe: '2-4 weeks',
        responsibility: 'Licensed Electrician',
        resources: ['Generator unit', 'Installation materials', 'Permits'],
        cost: 'JMD 150,000-500,000'
      },
      {
        id: '1-3',
        phase: 'medium_term',
        action: 'Test system monthly and train staff on operation',
        timeframe: 'Ongoing',
        responsibility: 'Maintenance Staff',
        resources: ['Training materials', 'Testing schedule'],
        cost: 'JMD 5,000/month'
      }
    ]
  },
  {
    id: '2',
    strategyId: 'emergency_fund',
    name: 'Emergency Cash Reserve',
    category: 'preparation',
    description: 'Maintain emergency cash reserves to cover 3-6 months of operating expenses during business disruptions',
    applicableRisks: ['hurricane', 'flood', 'earthquake', 'drought'],
    implementationCost: 'medium',
    implementationTime: 'months',
    effectiveness: 8,
    businessTypes: ['hospitality', 'retail', 'services', 'manufacturing'],
    priority: 'critical',
    actionSteps: [
      {
        id: '2-1',
        phase: 'immediate',
        action: 'Calculate monthly operating expenses and set target reserve amount',
        timeframe: '1 week',
        responsibility: 'Accountant/Financial Manager',
        resources: ['Financial records', 'Cash flow analysis'],
        cost: 'JMD 10,000-20,000'
      },
      {
        id: '2-2',
        phase: 'medium_term',
        action: 'Set up dedicated emergency savings account',
        timeframe: '1 month',
        responsibility: 'Business Owner',
        resources: ['Bank account', 'Automatic transfers'],
        cost: 'Account fees'
      },
      {
        id: '2-3',
        phase: 'long_term',
        action: 'Build reserve to target amount through regular contributions',
        timeframe: '12-24 months',
        responsibility: 'Financial Manager',
        resources: ['Monthly savings plan', 'Progress tracking'],
        cost: '10-15% of monthly revenue'
      }
    ]
  },
  {
    id: '3',
    strategyId: 'supplier_diversification',
    name: 'Supplier Diversification Plan',
    category: 'prevention',
    description: 'Establish multiple suppliers for critical materials to reduce supply chain vulnerability',
    applicableRisks: ['hurricane', 'flood', 'drought'],
    implementationCost: 'medium',
    implementationTime: 'weeks',
    effectiveness: 7,
    businessTypes: ['retail', 'hospitality', 'manufacturing'],
    priority: 'medium',
    actionSteps: [
      {
        id: '3-1',
        phase: 'immediate',
        action: 'Identify critical suppliers and single points of failure',
        timeframe: '1 week',
        responsibility: 'Procurement Manager',
        resources: ['Supplier list', 'Dependency analysis'],
        cost: 'Staff time'
      },
      {
        id: '3-2',
        phase: 'short_term',
        action: 'Research and qualify alternative suppliers',
        timeframe: '2-4 weeks',
        responsibility: 'Procurement Team',
        resources: ['Market research', 'Supplier vetting'],
        cost: 'JMD 30,000-50,000'
      },
      {
        id: '3-3',
        phase: 'medium_term',
        action: 'Establish contracts with backup suppliers',
        timeframe: '1-2 months',
        responsibility: 'Management',
        resources: ['Legal review', 'Contract negotiation'],
        cost: 'Legal fees + setup costs'
      }
    ]
  },
  {
    id: '4',
    strategyId: 'evacuation_plan',
    name: 'Emergency Evacuation Procedures',
    category: 'response',
    description: 'Develop and practice emergency evacuation procedures for staff and customers',
    applicableRisks: ['hurricane', 'flood', 'earthquake', 'landslide'],
    implementationCost: 'low',
    implementationTime: 'days',
    effectiveness: 9,
    businessTypes: ['hospitality', 'retail', 'services', 'manufacturing'],
    priority: 'critical',
    actionSteps: [
      {
        id: '4-1',
        phase: 'immediate',
        action: 'Map evacuation routes and identify assembly points',
        timeframe: '1-2 days',
        responsibility: 'Safety Officer/Manager',
        resources: ['Building layout', 'Safety assessment'],
        cost: 'Staff time'
      },
      {
        id: '4-2',
        phase: 'short_term',
        action: 'Create evacuation procedures and train all staff',
        timeframe: '1 week',
        responsibility: 'HR Manager',
        resources: ['Training materials', 'Drills'],
        cost: 'JMD 10,000-20,000'
      },
      {
        id: '4-3',
        phase: 'medium_term',
        action: 'Conduct monthly evacuation drills and update procedures',
        timeframe: 'Ongoing',
        responsibility: 'Safety Committee',
        resources: ['Drill schedule', 'Feedback forms'],
        cost: 'JMD 2,000/month'
      }
    ]
  },
  {
    id: '5',
    strategyId: 'elevated_storage',
    name: 'Elevated Storage System',
    category: 'prevention',
    description: 'Store critical inventory and equipment above potential flood levels',
    applicableRisks: ['flood', 'hurricane'],
    implementationCost: 'medium',
    implementationTime: 'weeks',
    effectiveness: 8,
    businessTypes: ['retail', 'manufacturing'],
    priority: 'high',
    actionSteps: [
      {
        id: '5-1',
        phase: 'immediate',
        action: 'Assess flood risk levels and identify critical items',
        timeframe: '2-3 days',
        responsibility: 'Operations Manager',
        resources: ['Flood risk maps', 'Inventory assessment'],
        cost: 'JMD 5,000-10,000'
      },
      {
        id: '5-2',
        phase: 'short_term',
        action: 'Install elevated shelving and storage systems',
        timeframe: '2-3 weeks',
        responsibility: 'Contractor/Maintenance',
        resources: ['Shelving units', 'Installation labor'],
        cost: 'JMD 50,000-150,000'
      },
      {
        id: '5-3',
        phase: 'medium_term',
        action: 'Relocate critical inventory to elevated storage',
        timeframe: '1 week',
        responsibility: 'Warehouse Staff',
        resources: ['Moving equipment', 'Staff labor'],
        cost: 'JMD 20,000-30,000'
      }
    ]
  },
  {
    id: '6',
    strategyId: 'insurance_review',
    name: 'Comprehensive Insurance Coverage',
    category: 'preparation',
    description: 'Review and update insurance policies to ensure adequate coverage for all identified risks',
    applicableRisks: ['hurricane', 'flood', 'earthquake', 'landslide', 'powerOutage'],
    implementationCost: 'medium',
    implementationTime: 'weeks',
    effectiveness: 7,
    businessTypes: ['hospitality', 'retail', 'services', 'manufacturing'],
    priority: 'high',
    actionSteps: [
      {
        id: '6-1',
        phase: 'immediate',
        action: 'Review current insurance policies and identify gaps',
        timeframe: '1 week',
        responsibility: 'Business Owner/Insurance Broker',
        resources: ['Policy documents', 'Risk assessment'],
        cost: 'Broker consultation fees'
      },
      {
        id: '6-2',
        phase: 'short_term',
        action: 'Obtain quotes for additional coverage needed',
        timeframe: '2-3 weeks',
        responsibility: 'Insurance Broker',
        resources: ['Multiple quotes', 'Coverage comparison'],
        cost: 'Time and analysis'
      },
      {
        id: '6-3',
        phase: 'medium_term',
        action: 'Update policies and ensure adequate coverage limits',
        timeframe: '1 month',
        responsibility: 'Business Owner',
        resources: ['Policy updates', 'Premium payments'],
        cost: 'Increased premiums'
      }
    ]
  },
  {
    id: '7',
    strategyId: 'communication_plan',
    name: 'Emergency Communication System',
    category: 'response',
    description: 'Establish reliable communication channels for emergencies',
    applicableRisks: ['hurricane', 'earthquake', 'powerOutage'],
    implementationCost: 'low',
    implementationTime: 'days',
    effectiveness: 8,
    businessTypes: ['hospitality', 'retail', 'services', 'manufacturing'],
    priority: 'high',
    actionSteps: [
      {
        id: '7-1',
        phase: 'immediate',
        action: 'Create emergency contact lists and communication tree',
        timeframe: '1-2 days',
        responsibility: 'HR Manager',
        resources: ['Contact database', 'Communication structure'],
        cost: 'Staff time'
      },
      {
        id: '7-2',
        phase: 'short_term',
        action: 'Set up multiple communication channels (SMS, email, radio)',
        timeframe: '1 week',
        responsibility: 'IT Manager',
        resources: ['Communication tools', 'Backup systems'],
        cost: 'JMD 20,000-40,000'
      },
      {
        id: '7-3',
        phase: 'medium_term',
        action: 'Test communication systems regularly',
        timeframe: 'Monthly',
        responsibility: 'Emergency Coordinator',
        resources: ['Testing schedule', 'Feedback system'],
        cost: 'JMD 2,000/month'
      }
    ]
  },
  {
    id: '8',
    strategyId: 'business_recovery',
    name: 'Rapid Business Recovery Plan',
    category: 'recovery',
    description: 'Structured plan to quickly restore business operations after a disruption',
    applicableRisks: ['hurricane', 'flood', 'earthquake', 'powerOutage'],
    implementationCost: 'medium',
    implementationTime: 'weeks',
    effectiveness: 9,
    businessTypes: ['hospitality', 'retail', 'services', 'manufacturing'],
    priority: 'critical',
    actionSteps: [
      {
        id: '8-1',
        phase: 'immediate',
        action: 'Assess damage and prioritize recovery activities',
        timeframe: '24-48 hours',
        responsibility: 'Management Team',
        resources: ['Damage assessment forms', 'Priority matrix'],
        cost: 'Staff time'
      },
      {
        id: '8-2',
        phase: 'short_term',
        action: 'Implement temporary operations and restore critical functions',
        timeframe: '1-2 weeks',
        responsibility: 'Operations Manager',
        resources: ['Temporary facilities', 'Essential equipment'],
        cost: 'Rental and setup costs'
      },
      {
        id: '8-3',
        phase: 'medium_term',
        action: 'Restore full operations and implement improvements',
        timeframe: '1-3 months',
        responsibility: 'Management Team',
        resources: ['Repairs', 'Equipment replacement', 'Process improvements'],
        cost: 'Restoration costs'
      }
    ]
  }
]

export async function GET() {
  try {
    // Convert strategy templates to admin format
    const strategies = strategyTemplates.map(convertTemplateToStrategy)
    
    // Add legacy mock strategies for additional variety
    const allStrategies = [...strategies, ...mockStrategies.map((strategy, index) => ({
      ...strategy,
      id: `legacy_${index + 1}`,
      costEstimateJMD: strategy.implementationCost === 'low' ? 'Under JMD $10,000' : 
                       strategy.implementationCost === 'medium' ? 'JMD $10,000 - $50,000' : 
                       'Over JMD $50,000',
      timeToImplement: strategy.implementationTime,
      helpfulTips: [],
      commonMistakes: [],
      successMetrics: [],
      prerequisites: [],
      roi: 3.0,
      actionSteps: strategy.actionSteps.map(step => ({
        ...step,
        estimatedCostJMD: step.cost,
        checklist: []
      }))
    }))]
    
    return NextResponse.json(allStrategies)
  } catch (error) {
    console.error('Error fetching strategies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch strategies' },
      { status: 500 }
    )
  }
}

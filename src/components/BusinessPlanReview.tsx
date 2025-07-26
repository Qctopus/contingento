import React from 'react'
import { 
  HAZARD_ACTION_PLANS, 
  BUSINESS_TYPE_MODIFIERS, 
  getBusinessTypeFromFormData,
  ActionPlan,
  ActionItem
} from '../data/actionPlansMatrix'

interface BusinessPlanReviewProps {
  formData: any
  riskSummary?: any
  onBack: () => void
  onExportPDF: () => void
}

// Enhanced layout components for better space utilization
const CompactCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
    {children}
  </div>
)

const SectionHeader = ({ title, icon }: { title: string, icon?: string }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold text-primary-900 mb-2 flex items-center space-x-2">
      {icon && <span className="text-2xl">{icon}</span>}
      <span>{title}</span>
    </h2>
    <div className="w-full h-px bg-gradient-to-r from-primary-600 to-transparent"></div>
  </div>
)

const InfoGrid = ({ items }: { items: Array<{ label: string, value: any }> }) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map((item, index) => (
      <div key={index} className="bg-gray-50 rounded-lg p-3">
        <dt className="text-sm font-medium text-gray-600 mb-1">{item.label}</dt>
        <dd className="text-sm text-gray-900">{item.value || 'Not specified'}</dd>
      </div>
    ))}
  </div>
)

const CompactTable = ({ 
  data, 
  maxHeight = "300px" 
}: { 
  data: any[], 
  maxHeight?: string 
}) => {
  if (!data || data.length === 0) return <p className="text-gray-500 italic">No data available</p>

  const headers = Object.keys(data[0])
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto" style={{ maxHeight }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {headers.map(header => (
                <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {headers.map(header => (
                  <td key={header} className="px-3 py-2 text-sm text-gray-900">
                    {row[header] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ActionPlanCard = ({ plan }: { plan: any }) => (
  <CompactCard className="border-l-4 border-l-red-500">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{plan.hazard}</h3>
        {plan.businessType && plan.businessType !== 'general' && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-1 inline-block">
            {plan.businessType.replace('_', ' ')} business optimized
          </span>
        )}
      </div>
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        plan.riskLevel.toLowerCase().includes('extreme') 
          ? 'bg-black text-white'
          : 'bg-red-100 text-red-800'
      }`}>
        {plan.riskLevel}
      </span>
    </div>
    
    {/* Business-Specific Considerations - Show All */}
    {plan.specificConsiderations && plan.specificConsiderations.length > 0 && (
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 text-sm mb-2">🎯 Business-Specific Considerations</h4>
        <div className="space-y-1">
          {plan.specificConsiderations.map((consideration: string, idx: number) => (
            <div key={idx} className="text-xs text-blue-800">• {consideration}</div>
          ))}
        </div>
      </div>
    )}
    
    {/* Complete Resource List - Show All */}
    <div className="mb-4">
      <h4 className="font-medium text-gray-800 mb-2">Resources Needed:</h4>
      <div className="bg-yellow-50 rounded p-2 text-sm max-h-40 overflow-y-auto">
        {Array.isArray(plan.resourcesNeeded) && plan.resourcesNeeded
          .filter((resource: any) => resource != null && resource !== '')
          .map((resource: any, idx: number) => (
            <div key={idx} className="text-gray-700">• {String(resource)}</div>
          ))}
      </div>
    </div>

    {/* Complete Action Timeline - Show All Actions */}
    <div className="space-y-4 text-sm">
      {/* Immediate Actions - All */}
      <div>
        <h5 className="font-medium text-red-700 mb-2">Immediate Actions (0-24 hours)</h5>
        <ul className="text-xs text-gray-600 space-y-2 max-h-48 overflow-y-auto">
          {Array.isArray(plan.immediateActions) && plan.immediateActions
            .filter((action: any) => action?.task)
            .map((action: any, idx: number) => (
              <li key={idx} className="flex items-start space-x-2 p-2 bg-red-50 rounded">
                <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                  action.priority === 'high' ? 'bg-red-500' : 
                  action.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></span>
                <div className="flex-1">
                  <div className="font-medium">{String(action.task || '')}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    <span className="font-medium">Responsible:</span> {action.responsible}
                    {action.duration && <span> • <span className="font-medium">Duration:</span> {action.duration}</span>}
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>

      {/* Short-term Actions - All */}
      <div>
        <h5 className="font-medium text-orange-700 mb-2">Short-term Actions (1-7 days)</h5>
        <ul className="text-xs text-gray-600 space-y-2 max-h-48 overflow-y-auto">
          {Array.isArray(plan.shortTermActions) && plan.shortTermActions
            .filter((action: any) => action?.task)
            .map((action: any, idx: number) => (
              <li key={idx} className="flex items-start space-x-2 p-2 bg-orange-50 rounded">
                <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                  action.priority === 'high' ? 'bg-red-500' : 
                  action.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></span>
                <div className="flex-1">
                  <div className="font-medium">{String(action.task || '')}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    <span className="font-medium">Responsible:</span> {action.responsible}
                    {action.duration && <span> • <span className="font-medium">Duration:</span> {action.duration}</span>}
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>

      {/* Medium-term Actions - All */}
      {Array.isArray(plan.mediumTermActions) && plan.mediumTermActions.length > 0 && (
        <div>
          <h5 className="font-medium text-blue-700 mb-2">Medium-term Actions (1-4 weeks)</h5>
          <ul className="text-xs text-gray-600 space-y-2 max-h-48 overflow-y-auto">
            {plan.mediumTermActions
              .filter((action: any) => action?.task)
              .map((action: any, idx: number) => (
                <li key={idx} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                  <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    action.priority === 'high' ? 'bg-red-500' : 
                    action.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></span>
                  <div className="flex-1">
                    <div className="font-medium">{String(action.task || '')}</div>
                    <div className="text-gray-500 text-xs mt-1">
                      <span className="font-medium">Responsible:</span> {action.responsible}
                      {action.duration && <span> • <span className="font-medium">Duration:</span> {action.duration}</span>}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>

    {/* Complete Long-term Reduction - Show All */}
    {plan.longTermReduction && plan.longTermReduction.length > 0 && (
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <h5 className="font-medium text-green-800 text-sm mb-2">Long-term Prevention & Risk Reduction:</h5>
        <div className="text-xs text-green-700 space-y-1 max-h-32 overflow-y-auto">
          {plan.longTermReduction.map((measure: string, idx: number) => (
            <div key={idx} className="flex items-start space-x-2">
              <span className="text-green-600 mt-1">•</span>
              <span>{measure}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </CompactCard>
)

const ContactCard = ({ contacts, title, icon }: { contacts: any[], title: string, icon: string }) => {
  const validContacts = Array.isArray(contacts) ? contacts.filter((c: any) => c && (c.Name || c.name)) : []
  
  return (
    <CompactCard>
      <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
        <span>{icon}</span>
        <span>{title}</span>
        <span className="text-xs text-gray-500">({validContacts.length})</span>
      </h4>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {validContacts.length > 0 ? validContacts
          .map((contact: any, index: number) => (
            <div key={index} className="text-sm bg-gray-50 rounded p-2">
              <div className="font-medium text-gray-900">{contact.Name || contact.name || 'Unknown'}</div>
              <div className="text-gray-600 text-xs">{contact.Position || contact.role || ''}</div>
              <div className="text-gray-500 text-xs">{contact.Phone || contact.phone || ''}</div>
              {contact.Email && (
                <div className="text-gray-500 text-xs">{contact.Email}</div>
              )}
            </div>
          )) : <div className="text-gray-500 text-sm italic">No contacts specified</div>}
      </div>
    </CompactCard>
  )
}

// Data transformation functions (keeping existing ones)
const HAZARD_LABELS: { [key: string]: string } = {
  'earthquake': 'Earthquake',
  'hurricane': 'Hurricane/Tropical Storm',
  'coastal_flood': 'Coastal Flooding',
  'flash_flood': 'Flash Flooding',
  'landslide': 'Landslide',
  'tsunami': 'Tsunami',
  'volcanic': 'Volcanic Activity',
  'drought': 'Drought',
  'epidemic': 'Epidemic (local disease outbreak)',
  'pandemic': 'Pandemic (widespread disease)',
  'power_outage': 'Extended Power Outage',
  'telecom_failure': 'Telecommunications Failure',
  'cyber_attack': 'Internet/Cyber Attacks',
  'fire': 'Fire',
  'crime': 'Crime/Theft/Break-in',
  'civil_disorder': 'Civil Disorder/Unrest',
  'terrorism': 'Terrorism',
  'supply_disruption': 'Supply Chain Disruption',
  'staff_unavailable': 'Key Staff Unavailability',
  'economic_downturn': 'Economic Downturn',
  'chemical_spill': 'Chemical Spill',
  'environmental_contamination': 'Environmental Contamination',
  'air_pollution': 'Air Pollution Event',
  'water_contamination': 'Water Contamination',
  'industrial_accident': 'Industrial Accident',
  'waste_management_failure': 'Waste Management Failure',
  'oil_spill': 'Oil Spill',
  'sargassum': 'Sargassum Seaweed Impact',
  'crowd_management': 'Crowd Management Issues',
  'waste_management': 'Waste Management Issues',
  'storm_surge': 'Storm Surge',
  'coastal_erosion': 'Coastal Erosion',
  'infrastructure_failure': 'Infrastructure Failure'
}

const STRATEGY_LABELS: { [key: string]: string } = {
  // Prevention Strategies
  'maintenance': 'Regular maintenance of equipment and facilities',
  'physical_security': 'Physical security systems (alarms, cameras, locks)',
  'cybersecurity': 'Cybersecurity measures and data protection',
  'insurance': 'Comprehensive insurance coverage',
  'employee_training': 'Employee training and emergency preparedness',
  'supplier_diversity': 'Supplier diversification and backup suppliers',
  'financial_reserves': 'Financial reserves and emergency funds',
  'data_backup': 'Regular data backup and off-site storage',
  'building_upgrades': 'Building modifications for disaster resistance',
  'emergency_supplies': 'Emergency supplies and equipment stockpiling',
  'risk_monitoring': 'Regular risk assessments and plan updates',
  'community_partnerships': 'Community partnerships and mutual aid agreements',
  
  // Response Strategies
  'emergency_team': 'Emergency response team activation',
  'safety_procedures': 'Staff and customer safety procedures',
  'emergency_communication': 'Emergency communication plan',
  'alternative_locations': 'Alternative work locations',
  'remote_work': 'Remote work and virtual operations',
  'emergency_inventory': 'Emergency inventory and supply management',
  'customer_continuity': 'Customer service continuity procedures',
  'media_management': 'Media and public relations management',
  'emergency_finance': 'Emergency financial procedures',
  'emergency_services': 'Coordination with emergency services',
  'closure_procedures': 'Temporary closure and securing procedures',
  'essential_operations': 'Essential services only operations',
  
  // Recovery Strategies
  'damage_assessment': 'Damage assessment and documentation',
  'insurance_claims': 'Insurance claims and financial recovery',
  'business_resumption': 'Business resumption and restart procedures',
  'employee_support': 'Employee support and counseling programs',
  'customer_retention': 'Customer retention and win-back strategies',
  'supplier_restoration': 'Supplier relationship restoration',
  'reputation_management': 'Marketing and reputation management',
  'financial_assistance': 'Financial assistance and loan applications',
  'facility_repair': 'Facility repair and reconstruction',
  'equipment_replacement': 'Equipment replacement and upgrades',
  'lessons_learned': 'Lessons learned and plan improvements',
  'community_support': 'Community support and collaboration'
}

const FUNCTION_LABELS: { [key: string]: string } = {
  // Supply Chain Management
  'ordering_supplies': 'Ordering supplies from vendors',
  'goods_receiving': 'Receiving and inspecting goods',
  'storage': 'Storage and warehouse management',
  'stocking': 'Inventory management and stocking',
  'procurement': 'Procurement and vendor management',
  'quality_control': 'Quality control and inspection',
  
  // Staff Management
  'recruitment': 'Staff recruitment and hiring',
  'payroll': 'Payroll processing and payments',
  'supervision': 'Day-to-day supervision and management',
  'health_safety': 'Health and safety compliance',
  'training': 'Training and skills development',
  'performance': 'Performance management',
  
  // Technology
  'website': 'Website maintenance and updates',
  'online_security': 'Online security and data protection',
  'internet': 'Internet and telecommunications',
  'pos_systems': 'Point of sale (POS) systems',
  'payment_processing': 'Online payment processing',
  'data_backup': 'Data backup and recovery',
  'social_media': 'Social media and online presence',
  
  // Product and Service Delivery
  'design': 'Product design and development',
  'production': 'Manufacturing and production',
  'quality_assurance': 'Quality assurance and testing',
  'packing': 'Packaging and preparation',
  'transport': 'Transportation and delivery',
  'service_delivery': 'Service delivery to customers',
  'project_management': 'Project planning and management',
  'monitoring': 'Project monitoring and evaluation',
  
  // Sales and Marketing
  'advertising': 'Advertising and promotion',
  'sales_management': 'Sales transactions and cash management',
  'online_sales': 'Online sales platforms',
  'customer_service': 'Customer service and support',
  'quotations': 'Quotations and estimates',
  'call_center': 'Phone and call center operations',
  'crm': 'Customer relationship management',
  'invoicing': 'Invoicing and billing',
  
  // Administrative
  'bookings': 'Appointment scheduling and bookings',
  'accounting': 'Accounting and financial management',
  'payroll_admin': 'Payroll administration',
  'licensing': 'Licensing and certifications',
  'reporting': 'Government and regulatory reporting',
  'reception': 'Reception and telephone services',
  'asset_maintenance': 'Asset and equipment maintenance',
  'record_keeping': 'Record keeping and filing',
  'data_entry': 'Data entry and management',
  'office_security': 'Office and asset security',
  
  // Infrastructure and Facilities
  'building_access': 'Building access and security',
  'building_maintenance': 'Building maintenance and repairs',
  'power': 'Electrical power supply',
  'water': 'Water supply and plumbing',
  'hvac': 'Air conditioning and ventilation',
  'waste_management': 'Waste management and disposal',
  'parking': 'Parking and transportation access'
}

function transformStrategyName(strategyCode: any): string {
  if (typeof strategyCode !== 'string') return String(strategyCode || '')
  return STRATEGY_LABELS[strategyCode] || strategyCode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function transformFunctionName(functionCode: any): string {
  if (typeof functionCode !== 'string') {
    // Handle non-string inputs safely
    return String(functionCode || '')
  }
  return FUNCTION_LABELS[functionCode] || functionCode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function transformHazardName(hazardCode: any): string {
  if (typeof hazardCode !== 'string') {
    return String(hazardCode || '')
  }
  return HAZARD_LABELS[hazardCode] || hazardCode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold border-b-2 border-primary-600 pb-2 mb-4 text-primary-900 bg-gradient-to-r from-primary-50 to-primary-100 px-4 py-3 rounded-t-lg">
      {children}
    </h2>
  )
}

function SubSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-primary-800 mt-6 mb-3 border-l-4 border-primary-500 pl-3">
      {children}
    </h3>
  )
}

function InfoCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  )
}

function LabeledField({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <dt className="text-sm font-semibold text-gray-700 mb-1">{label}:</dt>
      <dd className="text-gray-900 bg-gray-50 rounded px-3 py-2 border-l-4 border-primary-200">
        {children}
      </dd>
    </div>
  )
}

function BulletList({ 
  items, 
  title, 
  transformFunction 
}: { 
  items: string[] | any[], 
  title?: string, 
  transformFunction?: (item: string) => string 
}) {
  if (!Array.isArray(items) || items.length === 0) {
    return <span className="text-gray-500 italic">Not specified</span>
  }

  const listItems = items.map(item => {
    let itemText = ''
    if (typeof item === 'string') {
      itemText = item
    } else if (typeof item === 'object' && item.label) {
      itemText = item.label
    } else if (typeof item === 'object' && item.value) {
      itemText = item.value
    } else {
      itemText = item.toString()
    }
    
    // Apply transformation function if provided
    if (transformFunction && itemText) {
      itemText = transformFunction(itemText)
    }
    
    return itemText
  }).filter(item => item && item.trim())

  if (listItems.length === 0) {
    return <span className="text-gray-500 italic">Not specified</span>
  }

  return (
    <div>
      {title && <h4 className="font-medium text-gray-800 mb-2">{title}</h4>}
      <ul className="space-y-2">
        {listItems.map((item, index) => (
          <li key={index} className="flex items-start">
            <span className="text-primary-600 mr-3 mt-1 font-bold">•</span>
            <span className="text-gray-800 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DataTable({ 
  data, 
  title, 
  columns 
}: { 
  data: any[] | any, 
  title?: string, 
  columns?: string[] 
}) {
  // Handle different data formats
  let tableData: any[] = []
  
  if (Array.isArray(data)) {
    tableData = data
  } else if (typeof data === 'object' && data !== null) {
    // Convert object to array of key-value pairs
    tableData = Object.entries(data).map(([key, value]) => ({
      Field: key,
      Value: value
    }))
  }

  if (tableData.length === 0) {
    return <span className="text-gray-500 italic">No data available</span>
  }

  // Generate columns from first row if not provided
  const tableColumns = columns || Object.keys(tableData[0] || {})

  return (
    <div className="overflow-x-auto">
      {title && <h4 className="font-medium text-gray-800 mb-3">{title}</h4>}
      <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-primary-100">
          <tr>
            {tableColumns.map(col => (
              <th key={col} className="border border-gray-300 px-4 py-3 text-left font-semibold text-primary-900 text-sm">
                {col.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase()).replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {tableColumns.map(col => {
                let cellValue = row[col]
                
                // Transform hazard names in the Hazard column
                if (col.toLowerCase().includes('hazard') && typeof cellValue === 'string') {
                  cellValue = transformHazardName(cellValue)
                }
                
                return (
                  <td key={col} className="border border-gray-300 px-4 py-3 text-sm text-gray-800 align-top">
                    {typeof cellValue === 'object' && cellValue !== null 
                      ? JSON.stringify(cellValue, null, 2) 
                      : String(cellValue ?? '-')}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RiskRecommendationsTable({ riskMatrix }: { riskMatrix: any[] }) {
  if (!Array.isArray(riskMatrix) || riskMatrix.length === 0) {
    return <span className="text-gray-500 italic">No risk recommendations available</span>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-red-100">
          <tr>
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-red-900 text-sm w-1/4">
              Hazard
            </th>
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-red-900 text-sm w-1/6">
              Risk Level
            </th>
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-red-900 text-sm w-7/12">
              Recommended Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {riskMatrix.map((risk, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-red-25'}>
              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-800 align-top font-medium">
                {transformHazardName(risk.hazard || risk.Hazard || '-')}
              </td>
              <td className="border border-gray-300 px-4 py-3 text-sm align-top">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  (risk.riskLevel || risk.RiskLevel || '').toLowerCase().includes('extreme') 
                    ? 'bg-black text-white'
                    : (risk.riskLevel || risk.RiskLevel || '').toLowerCase().includes('high') 
                    ? 'bg-red-100 text-red-800'
                    : (risk.riskLevel || risk.RiskLevel || '').toLowerCase().includes('medium')
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {risk.riskLevel || risk.RiskLevel || '-'}
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-800 align-top">
                {risk.planningMeasures || risk['Recommended Actions'] || risk['planningMeasures'] || 'No specific recommendations provided'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RiskSummaryDisplay({ riskSummary }: { riskSummary: any }) {
  if (!riskSummary) {
    return <span className="text-gray-500 italic">Risk summary not available</span>
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-blue-900 mb-3">Risk Portfolio Overview</h4>
      {typeof riskSummary === 'object' ? (
        <div className="space-y-2">
          {Object.entries(riskSummary).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-blue-800 font-medium">
                {key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}:
              </span>
              <span className="text-blue-900">{String(value)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-blue-800">{String(riskSummary)}</p>
      )}
    </div>
  )
}

function TextDisplay({ text, fallback = "Not specified" }: { text: string | undefined | null, fallback?: string }) {
  if (!text || text.trim() === '' || text.toLowerCase().includes('examples')) {
    return <span className="text-gray-500 italic">{fallback}</span>
  }
  
  // Clean up text that might start with "Examples" or contain bullet points from examples
  let cleanText = text
  if (cleanText.toLowerCase().startsWith('examples')) {
    const lines = cleanText.split('\n').filter(line => 
      !line.toLowerCase().includes('examples') && 
      line.trim() !== '' &&
      !line.trim().startsWith('•')
    )
    cleanText = lines.join('. ').trim()
  }
  
  return (
    <span className="text-gray-800 leading-relaxed">
      {cleanText || fallback}
    </span>
  )
}

// Generate hazard-specific action plans using centralized matrix
function generateHazardActionPlans(formData: any, riskAssessment: any): any[] {
  if (!riskAssessment || !riskAssessment['Risk Assessment Matrix']) {
    return []
  }

  const riskMatrix = riskAssessment['Risk Assessment Matrix']
  if (!Array.isArray(riskMatrix)) {
    return []
  }

  // Filter for high and extreme risk hazards
  const priorityHazards = riskMatrix.filter(risk => {
    const riskLevel = (risk.riskLevel || risk.RiskLevel || '').toLowerCase()
    return riskLevel.includes('high') || riskLevel.includes('extreme')
  })

  // Get business type for customization
  const businessType = getBusinessTypeFromFormData(formData)
  const businessModifiers = BUSINESS_TYPE_MODIFIERS[businessType] || {}

  // Generate action plans for each priority hazard
  return priorityHazards.map(risk => {
    const hazardName = transformHazardName(risk.hazard || risk.Hazard || '')
    const riskLevel = risk.riskLevel || risk.RiskLevel || 'High'
    const riskScore = risk.riskScore || 'High'
    
    // Find matching hazard key in action plans matrix
    const hazardKey = Object.keys(HAZARD_ACTION_PLANS).find(key => {
      const planHazardName = transformHazardName(key)
      return planHazardName.toLowerCase().includes(hazardName.toLowerCase()) || 
             hazardName.toLowerCase().includes(planHazardName.toLowerCase())
    })

    // Get base action plan from matrix
    let actionPlan = hazardKey ? { ...HAZARD_ACTION_PLANS[hazardKey] } : {
      resourcesNeeded: ['Emergency supplies', 'Communication systems', 'Backup procedures', 'Staff training materials'],
      immediateActions: [
        { task: 'Activate emergency response procedures', responsible: 'Management', duration: '1 hour', priority: 'high' as const },
        { task: 'Ensure staff and customer safety', responsible: 'All Staff', duration: '30 minutes', priority: 'high' as const },
        { task: 'Assess immediate impact and needs', responsible: 'Management', duration: '2 hours', priority: 'high' as const }
      ],
      shortTermActions: [
        { task: 'Coordinate with emergency services if needed', responsible: 'Management', duration: '4 hours', priority: 'medium' as const },
        { task: 'Implement alternative business processes', responsible: 'Operations Team', duration: '1 day', priority: 'medium' as const },
        { task: 'Update stakeholders on status', responsible: 'Management', duration: '4 hours', priority: 'medium' as const }
      ],
      mediumTermActions: [
        { task: 'Assess damage and recovery needs', responsible: 'Management', duration: '1 week', priority: 'medium' as const },
        { task: 'Implement recovery procedures', responsible: 'Operations Team', duration: '2 weeks', priority: 'medium' as const },
        { task: 'Document lessons learned', responsible: 'Management', duration: '1 week', priority: 'low' as const }
      ],
      longTermReduction: [
        'Implement prevention measures specific to this hazard',
        'Improve monitoring and early warning systems',
        'Strengthen business resilience and backup procedures',
        'Regular training and plan updates'
      ]
    }

    // Apply business type modifications
    if (businessModifiers.additionalResources) {
      actionPlan.resourcesNeeded = [...actionPlan.resourcesNeeded, ...businessModifiers.additionalResources]
    }

    if (businessModifiers.modifiedActions?.immediate) {
      actionPlan.immediateActions = [...actionPlan.immediateActions, ...businessModifiers.modifiedActions.immediate]
    }

    if (businessModifiers.modifiedActions?.shortTerm) {
      actionPlan.shortTermActions = [...actionPlan.shortTermActions, ...businessModifiers.modifiedActions.shortTerm]
    }

    if (businessModifiers.modifiedActions?.mediumTerm) {
      actionPlan.mediumTermActions = [...actionPlan.mediumTermActions, ...businessModifiers.modifiedActions.mediumTerm]
    }

    return {
      hazard: hazardName,
      riskLevel: riskLevel,
      riskScore: riskScore,
      businessType: businessType,
      affectedFunctions: 'All critical business operations',
      specificConsiderations: businessModifiers.specificConsiderations || [],
      ...actionPlan
    }
  })
}

export const BusinessPlanReview: React.FC<BusinessPlanReviewProps> = ({
  formData,
  riskSummary,
  onBack,
  onExportPDF,
}) => {
  const companyName = formData.PLAN_INFORMATION?.['Company Name'] || 'Your Company'
  const businessAddress = formData.PLAN_INFORMATION?.['Business Address'] || 'Business Address Not Specified'
  const planVersion = formData.PLAN_INFORMATION?.['Plan Version'] || '1.0'
  const nextReviewDate = formData.PLAN_INFORMATION?.['Next Review Date'] || 'Not specified'
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="max-w-7xl mx-auto py-6 print:py-2 space-y-6">
      {/* Compact Header */}
      <div className="text-center bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">BUSINESS CONTINUITY PLAN</h1>
        <h2 className="text-lg opacity-90">{companyName}</h2>
        <div className="mt-4 text-sm opacity-80">
          Version {planVersion} • {currentDate}
        </div>
      </div>

      {/* Compact Document Control & Business Info */}
      <div className="grid lg:grid-cols-3 gap-6">
        <CompactCard>
          <h3 className="font-semibold text-gray-900 mb-3">📋 Document Control</h3>
          <InfoGrid items={[
            { label: 'Version', value: planVersion },
            { label: 'Created', value: currentDate },
            { label: 'Next Review', value: nextReviewDate },
            { label: 'Plan Manager', value: formData.PLAN_INFORMATION?.['Plan Manager'] },
            { label: 'Alternate Manager', value: formData.PLAN_INFORMATION?.['Alternate Manager'] },
          ]} />
        </CompactCard>

        <CompactCard className="lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-3">🏢 Business Information</h3>
          <InfoGrid items={[
            { label: 'Company Name', value: companyName },
            { label: 'Business Address', value: businessAddress },
            { label: 'Digital Plan Location', value: formData.PLAN_INFORMATION?.['Digital Plan Location'] },
            { label: 'Physical Plan Location', value: formData.PLAN_INFORMATION?.['Physical Plan Location'] },
          ]} />
        </CompactCard>
      </div>

      {/* Section 1: Business Analysis */}
      <CompactCard>
        <SectionHeader title="SECTION 1: BUSINESS ANALYSIS" icon="📊" />
        
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Business Purpose</h4>
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-800">
              {formData.BUSINESS_OVERVIEW?.['Business Purpose'] || 'Not specified'}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Products & Services</h4>
            <div className="bg-green-50 rounded-lg p-4 text-sm text-gray-800">
              {formData.BUSINESS_OVERVIEW?.['Products & Services'] || 'Not specified'}
            </div>
          </div>
        </div>

        {/* Essential Functions - Complete Display */}
        {formData.ESSENTIAL_FUNCTIONS && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-4">Essential Business Functions</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(formData.ESSENTIAL_FUNCTIONS).map(([category, functions]) => (
                <div key={category} className="bg-gray-50 rounded-lg p-3">
                  <h5 className="font-medium text-gray-800 text-sm mb-2">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </h5>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {Array.isArray(functions) ? functions
                      .filter((func: any) => func != null && func !== '') // Filter out null, undefined, and empty values
                      .map((func: any, idx: number) => (
                        <div key={idx} className="text-xs text-gray-600">
                          • {transformFunctionName(func)}
                        </div>
                      )) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CompactCard>

      {/* Section 3: Risk Assessment - Enhanced Dashboard */}
      <CompactCard>
        <SectionHeader title="SECTION 3: RISK ASSESSMENT" icon="⚠️" />
        
        {formData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] && 
         Array.isArray(formData.RISK_ASSESSMENT['Risk Assessment Matrix']) &&
         formData.RISK_ASSESSMENT['Risk Assessment Matrix'].length > 0 ? (
          <div className="space-y-4">
            {/* Risk Summary Dashboard */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {(() => {
                const risks = formData.RISK_ASSESSMENT['Risk Assessment Matrix']
                const extremeRisks = risks.filter((r: any) => r['Risk Level']?.toLowerCase().includes('extreme')).length
                const highRisks = risks.filter((r: any) => r['Risk Level']?.toLowerCase().includes('high')).length
                const mediumRisks = risks.filter((r: any) => r['Risk Level']?.toLowerCase().includes('medium')).length
                const lowRisks = risks.filter((r: any) => r['Risk Level']?.toLowerCase().includes('low')).length

                return [
                  { label: 'Extreme', count: extremeRisks, color: 'bg-black text-white' },
                  { label: 'High', count: highRisks, color: 'bg-red-500 text-white' },
                  { label: 'Medium', count: mediumRisks, color: 'bg-yellow-500 text-white' },
                  { label: 'Low', count: lowRisks, color: 'bg-green-500 text-white' }
                ].map(risk => (
                  <div key={risk.label} className={`${risk.color} rounded-lg p-4 text-center`}>
                    <div className="text-2xl font-bold">{risk.count}</div>
                    <div className="text-sm opacity-90">{risk.label} Risk</div>
                  </div>
                ))
              })()}
            </div>

            {/* Compact Risk Matrix */}
            <CompactTable 
              data={formData.RISK_ASSESSMENT['Risk Assessment Matrix']} 
              maxHeight="400px"
            />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Risk assessment not completed
          </div>
        )}
      </CompactCard>

      {/* Section 4: Business Continuity Strategies - Compact Layout */}
      <CompactCard>
        <SectionHeader title="SECTION 4: BUSINESS CONTINUITY STRATEGIES" icon="🛡️" />
        
        <div className="grid lg:grid-cols-3 gap-6">
          {[
            { key: 'Prevention Strategies (Before Emergencies)', title: 'Prevention', icon: '🔒', color: 'blue' },
            { key: 'Response Strategies (During Emergencies)', title: 'Response', icon: '🚨', color: 'red' },
            { key: 'Recovery Strategies (After Emergencies)', title: 'Recovery', icon: '🔄', color: 'green' }
          ].map(strategy => (
            <div key={strategy.key} className={`bg-${strategy.color}-50 border border-${strategy.color}-200 rounded-lg p-4`}>
              <h4 className={`font-medium text-${strategy.color}-900 mb-3 flex items-center space-x-2`}>
                <span>{strategy.icon}</span>
                <span>{strategy.title}</span>
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {formData.STRATEGIES?.[strategy.key]
                  ?.filter((item: any) => item != null && item !== '') // Filter out null, undefined, and empty values
                  ?.map((item: any, index: number) => (
                    <div key={index} className={`text-sm text-${strategy.color}-800 bg-white bg-opacity-50 rounded p-2`}>
                      • {transformStrategyName(item)}
                    </div>
                  )) || <div className="text-gray-500 text-sm italic">No strategies specified</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Long-term Risk Reduction */}
        {formData.STRATEGIES?.['Long-term Risk Reduction Measures'] && (
          <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2 flex items-center space-x-2">
              <span>🎯</span>
              <span>Long-term Risk Reduction</span>
            </h4>
            <div className="text-sm text-purple-800">
              {formData.STRATEGIES['Long-term Risk Reduction Measures']}
            </div>
          </div>
        )}
      </CompactCard>

      {/* Section 5: Action Plans */}
      <CompactCard>
        <SectionHeader title="SECTION 5: ACTION PLANS" icon="🚀" />
        
        {(() => {
          const hazardActionPlans = generateHazardActionPlans(formData, formData.RISK_ASSESSMENT)
          
          if (hazardActionPlans.length === 0) {
            return (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No High-Priority Hazards Identified</h3>
                <p className="text-gray-600">
                  Complete your risk assessment with HIGH or EXTREME risk hazards to generate detailed action plans.
                </p>
              </div>
            )
          }

          return (
            <div className="grid gap-6">
              {hazardActionPlans.map((plan, index) => (
                <ActionPlanCard key={index} plan={plan} />
              ))}

              {/* Communication Templates & Recovery Metrics Summary */}
              {hazardActionPlans.length > 0 && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                    <span>📢</span>
                    <span>Communication & Recovery Overview</span>
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-blue-800 mb-1">Emergency Contacts</h5>
                      <p className="text-blue-700">Emergency services, management team, and key stakeholders will be notified according to established protocols.</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-800 mb-1">Recovery Targets</h5>
                      <p className="text-blue-700">Recovery time objectives range from 24-72 hours depending on hazard severity and business impact.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })()}
      </CompactCard>

      {/* Section 6: Testing and Maintenance - Compact Layout */}
      <CompactCard>
        <SectionHeader title="SECTION 6: TESTING AND MAINTENANCE" icon="⚙️" />
        
        {formData.TESTING_AND_MAINTENANCE ? (
          <div className="space-y-6">
            {/* Status Overview Dashboard */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-yellow-800">Initial</div>
                <div className="text-sm text-yellow-600">Plan Status</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-red-800">Pending</div>
                <div className="text-sm text-red-600">Testing Status</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-orange-800">Required</div>
                <div className="text-sm text-orange-600">Training Status</div>
              </div>
            </div>

            {/* Compact Tables */}
            <div className="grid lg:grid-cols-2 gap-6">
              {formData.TESTING_AND_MAINTENANCE['Plan Testing Schedule'] && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Testing Schedule</h4>
                  <CompactTable 
                    data={formData.TESTING_AND_MAINTENANCE['Plan Testing Schedule']} 
                    maxHeight="200px" 
                  />
                </div>
              )}

              {formData.TESTING_AND_MAINTENANCE['Training Schedule'] && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Training Schedule</h4>
                  <CompactTable 
                    data={formData.TESTING_AND_MAINTENANCE['Training Schedule']} 
                    maxHeight="200px" 
                  />
                </div>
              )}

              {formData.TESTING_AND_MAINTENANCE['Performance Metrics'] && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                  <CompactTable 
                    data={formData.TESTING_AND_MAINTENANCE['Performance Metrics']} 
                    maxHeight="200px" 
                  />
                </div>
              )}

              {formData.TESTING_AND_MAINTENANCE['Improvement Tracking'] && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Improvement Tracking</h4>
                  <CompactTable 
                    data={formData.TESTING_AND_MAINTENANCE['Improvement Tracking']} 
                    maxHeight="200px" 
                  />
                </div>
              )}
            </div>

            {/* Compact Info Sections */}
            <div className="grid md:grid-cols-2 gap-4">
              {formData.TESTING_AND_MAINTENANCE['Annual Review Process'] && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Annual Review Process</h4>
                  <div className="text-sm text-green-800">
                    {formData.TESTING_AND_MAINTENANCE['Annual Review Process']}
                  </div>
                </div>
              )}

              {formData.TESTING_AND_MAINTENANCE['Trigger Events for Plan Updates'] && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-2">Trigger Events</h4>
                  <div className="text-sm text-orange-800">
                    {formData.TESTING_AND_MAINTENANCE['Trigger Events for Plan Updates']}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">Testing and maintenance procedures not established</p>
        )}
      </CompactCard>

      {/* Appendix A: Key Contacts - Card Grid Layout */}
      <CompactCard>
        <SectionHeader title="APPENDIX A: KEY CONTACTS" icon="📞" />
        
        {formData.CONTACTS_AND_INFORMATION ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ContactCard 
              contacts={formData.CONTACTS_AND_INFORMATION['Staff Contact Information']}
              title="Staff Contacts"
              icon="👥"
            />
            <ContactCard 
              contacts={formData.CONTACTS_AND_INFORMATION['Supplier Information']}
              title="Critical Vendors"
              icon="🏭"
            />
            <ContactCard 
              contacts={formData.CONTACTS_AND_INFORMATION['Key Customer Contacts']}
              title="Key Clients"
              icon="🤝"
            />
            <ContactCard 
              contacts={formData.CONTACTS_AND_INFORMATION['Emergency Services and Utilities']}
              title="Emergency Services"
              icon="🚨"
            />
          </div>
        ) : (
          <p className="text-gray-500 italic">Contact information not provided</p>
        )}
      </CompactCard>

      {/* Appendix B: Vital Records - Compact Table */}
      <CompactCard>
        <SectionHeader title="APPENDIX B: VITAL RECORDS INVENTORY" icon="📄" />
        
        {formData.VITAL_RECORDS?.['Vital Records Inventory'] ? (
          <CompactTable data={formData.VITAL_RECORDS['Vital Records Inventory']} />
        ) : (
          <div className="text-center py-6 text-gray-500">
            <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="italic">Vital records inventory not completed</p>
          </div>
        )}
      </CompactCard>

      {/* Distribution List - Simplified */}
      <CompactCard>
        <SectionHeader title="DISTRIBUTION LIST" icon="📬" />
        
        {formData.CONTACTS_AND_INFORMATION?.['Plan Distribution List'] ? (
          <CompactTable data={formData.CONTACTS_AND_INFORMATION['Plan Distribution List']} />
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded p-3">
                <div className="font-medium text-gray-900">All Staff</div>
                <div className="text-gray-600">Digital (PDF)</div>
                <div className="text-gray-500 text-xs">{currentDate}</div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="font-medium text-gray-900">Management Team</div>
                <div className="text-gray-600">Digital + Physical</div>
                <div className="text-gray-500 text-xs">{currentDate}</div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="font-medium text-gray-900">Emergency Contacts</div>
                <div className="text-gray-600">Summary Sheet</div>
                <div className="text-gray-500 text-xs">{currentDate}</div>
              </div>
            </div>
          </div>
        )}
      </CompactCard>

      {/* Compact Document Footer */}
      <CompactCard className="bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="text-center py-4">
          <div className="flex items-center justify-center space-x-6 mb-3 text-sm text-gray-700">
            <div>
              <span className="font-medium">Prepared By:</span> {formData.PLAN_INFORMATION?.['Plan Manager'] || 'Plan Manager'}
            </div>
            <div>
              <span className="font-medium">Date:</span> {currentDate}
            </div>
          </div>
          <p className="text-xs text-gray-500 italic max-w-2xl mx-auto">
            This plan is a living document and will be updated regularly to reflect changes in business operations, risks, and best practices.
          </p>
        </div>
      </CompactCard>

      {/* Enhanced Navigation */}
      <div className="flex justify-between items-center mt-8 print:hidden">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium shadow-sm hover:shadow-md flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Form</span>
        </button>
        
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Business Continuity Plan</div>
          <div className="text-xs text-gray-500">{companyName} • {currentDate}</div>
        </div>
        
        <button
          onClick={onExportPDF}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-sm hover:shadow-md flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export PDF</span>
        </button>
      </div>
    </div>
  )
} 
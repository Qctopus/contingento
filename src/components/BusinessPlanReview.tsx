import React, { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { centralDataService } from '../services/centralDataService'
import type { Strategy, ActionStep } from '../types/admin'
import type { Locale } from '../i18n/config'
import { getLocalizedText } from '../utils/localizationUtils'

// Simple SVG icon components for professional display
const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
)

const CurrencyDollarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
)

const BellAlertIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
)

const ArrowPathIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
)

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)

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
                {headers.map(header => {
                  const value = row[header]
                  const displayValue = !value ? '-' : 
                    typeof value === 'string' ? value : 
                    typeof value === 'object' && (value.en || value.es || value.fr) ? (value.en || value.es || value.fr) :
                    String(value)
                  return (
                    <td key={header} className="px-3 py-2 text-sm text-gray-900">
                      {displayValue}
                    </td>
                  )
                })}
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
                  <div className="font-medium">{typeof action.task === 'string' ? action.task : (action.task?.en || action.task?.es || action.task?.fr || '')}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    <span className="font-medium">Responsible:</span> {typeof action.responsible === 'string' ? action.responsible : (action.responsible?.en || action.responsible?.es || action.responsible?.fr || '')}
                    {action.duration && <span> • <span className="font-medium">Duration:</span> {typeof action.duration === 'string' ? action.duration : (action.duration?.en || action.duration?.es || action.duration?.fr || '')}</span>}
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
                  <div className="font-medium">{typeof action.task === 'string' ? action.task : (action.task?.en || action.task?.es || action.task?.fr || '')}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    <span className="font-medium">Responsible:</span> {typeof action.responsible === 'string' ? action.responsible : (action.responsible?.en || action.responsible?.es || action.responsible?.fr || '')}
                    {action.duration && <span> • <span className="font-medium">Duration:</span> {typeof action.duration === 'string' ? action.duration : (action.duration?.en || action.duration?.es || action.duration?.fr || '')}</span>}
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
          {plan.longTermReduction.map((measure: any, idx: number) => {
            const displayMeasure = typeof measure === 'string' ? measure : 
              (typeof measure === 'object' && (measure.en || measure.es || measure.fr)) ? (measure.en || measure.es || measure.fr) :
              String(measure)
            return (
              <div key={idx} className="flex items-start space-x-2">
                <span className="text-green-600 mt-1">•</span>
                <span>{displayMeasure}</span>
              </div>
            )
          })}
        </div>
      </div>
    )}
  </CompactCard>
)

const ContactCard = ({ contacts, title, icon }: { contacts: any[], title: string, icon: string }) => {
  const validContacts = Array.isArray(contacts) ? contacts.filter((c: any) => c && Object.keys(c).length > 0) : []
  
  const iconBadgeColor = icon === 'EMERGENCY' ? 'bg-red-100 text-red-800' : 
                        icon === 'STAFF' ? 'bg-blue-100 text-blue-800' :
                        icon === 'VENDOR' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
  
  return (
    <CompactCard>
      <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2 flex items-center justify-between">
        <span>{title}</span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${iconBadgeColor}`}>{validContacts.length}</span>
      </h4>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {validContacts.length > 0 ? validContacts
          .map((contact: any, index: number) => {
            // Handle different field name variations with multilingual support
            const getFieldString = (field: any) => {
              if (!field) return ''
              return typeof field === 'string' ? field : (field.en || field.es || field.fr || '')
            }
            
            const nameRaw = contact.Name || contact['Name'] || 
                        contact['Supplier Name'] || contact['Customer Name'] || 
                        contact['Organization Name'] || 'Unknown'
            const positionRaw = contact.Position || contact['Type/Notes'] || 
                           contact['Service Type'] || contact['Goods/Services Supplied'] || ''
            const phoneRaw = contact['Phone Number'] || contact.Phone || ''
            const emailRaw = contact['Email Address'] || contact.Email || ''
            const extraRaw = contact['Emergency Contact'] || contact['Backup Supplier'] || 
                         contact['Account Number'] || contact['Special Requirements'] || ''
            
            const name = getFieldString(nameRaw) || 'Unknown'
            const position = getFieldString(positionRaw)
            const phone = getFieldString(phoneRaw)
            const email = getFieldString(emailRaw)
            const extra = getFieldString(extraRaw)
            
            return (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="font-semibold text-gray-900 mb-1">{name}</div>
                {position && (
                  <div className="text-gray-700 text-xs mb-2 pb-2 border-b border-gray-200">{position}</div>
                )}
                <div className="space-y-1">
                  {phone && (
                    <div className="flex items-center text-xs text-gray-600">
                      <span className="font-medium text-gray-500 mr-2">Phone:</span>
                      <span className="font-medium">{phone}</span>
                    </div>
                  )}
                  {email && email !== 'N/A' && (
                    <div className="flex items-center text-xs text-gray-600">
                      <span className="font-medium text-gray-500 mr-2">Email:</span>
                      <span className="break-all">{email}</span>
                    </div>
                  )}
                  {extra && extra !== 'N/A' && (
                    <div className="text-xs text-blue-700 mt-2 pt-2 border-t border-gray-200">
                      {extra}
                    </div>
                  )}
                </div>
              </div>
            )
          }) : <div className="text-gray-500 text-sm italic text-center py-8">No contacts specified</div>}
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
        {listItems.map((item, index) => {
          const displayItem = typeof item === 'string' ? item : 
            (typeof item === 'object' && ((item as any).en || (item as any).es || (item as any).fr)) ? ((item as any).en || (item as any).es || (item as any).fr) :
            String(item)
          return (
            <li key={index} className="flex items-start">
              <span className="text-primary-600 mr-3 mt-1 font-bold">•</span>
              <span className="text-gray-800 leading-relaxed">{displayItem}</span>
            </li>
          )
        })}
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
                      ? (cellValue.en || cellValue.es || cellValue.fr || JSON.stringify(cellValue, null, 2))
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
                  {(() => {
                    const level = risk.riskLevel || risk.RiskLevel || '-'
                    return typeof level === 'string' ? level : (level.en || level.es || level.fr || '-')
                  })()}
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-800 align-top">
                {(() => {
                  const measures = risk.planningMeasures || risk['Recommended Actions'] || risk['planningMeasures'] || 'No specific recommendations provided'
                  return typeof measures === 'string' ? measures : (measures.en || measures.es || measures.fr || 'No specific recommendations provided')
                })()}
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

// NUCLEAR OPTION: GLOBAL SAFE RENDER FUNCTION - HANDLES ALL MULTILINGUAL OBJECTS
function safeRender(value: any, locale: Locale = 'en'): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'object') {
    // Check for multilingual object
    if (value.en || value.es || value.fr) {
      return value[locale] || value.en || value.es || value.fr || ''
    }
    // If it's an array, return empty (shouldn't render arrays directly)
    if (Array.isArray(value)) return ''
    // Otherwise stringify (shouldn't happen but safe fallback)
    return JSON.stringify(value)
  }
  return String(value)
}

// Helper function: Get all action steps for a specific risk/hazard
function getActionStepsForRisk(hazardId: string, strategies: Strategy[], locale: Locale): ActionStep[] {
  return strategies
    .filter(s => s.applicableRisks?.includes(hazardId))
    .flatMap(s => s.actionSteps || [])
}

// Helper function: Group action steps by phase
function groupStepsByPhase(steps: ActionStep[]) {
  return {
    immediate: steps.filter(s => s.phase === 'immediate'),
    short_term: steps.filter(s => s.phase === 'short_term'),
    medium_term: steps.filter(s => s.phase === 'medium_term'),
    long_term: steps.filter(s => s.phase === 'long_term')
  }
}

// Helper function: Get all resources needed from action steps
function aggregateResources(steps: ActionStep[]): string[] {
  const resources = new Set<string>()
  steps.forEach(step => {
    if (step.resources && Array.isArray(step.resources)) {
      step.resources.forEach(r => resources.add(r))
    }
  })
  return Array.from(resources)
}

// Helper function: Get difficulty level badge color
function getDifficultyColor(level?: string): string {
  switch (level) {
    case 'easy': return 'bg-green-100 text-green-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800'
    case 'hard': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Generate hazard-specific action plans using database strategies
function generateHazardActionPlans(formData: any, riskAssessment: any, strategies: Strategy[]): any[] {
  if (!riskAssessment || !riskAssessment['Risk Assessment Matrix']) {
    return []
  }

  const riskMatrix = riskAssessment['Risk Assessment Matrix']
  if (!Array.isArray(riskMatrix)) {
    return []
  }

  // Filter for high and extreme risk hazards
  const priorityHazards = riskMatrix.filter(risk => {
    const riskLevel = (risk['Risk Level'] || risk.riskLevel || risk.RiskLevel || '').toLowerCase()
    return riskLevel.includes('high') || riskLevel.includes('extreme')
  })

  // Generate action plans for each priority hazard
  return priorityHazards.map(risk => {
    const hazardName = transformHazardName(risk['Hazard'] || risk.hazard || risk.Hazard || '')
    const riskLevel = risk['Risk Level'] || risk.riskLevel || risk.RiskLevel || 'High'
    const riskScore = risk.riskScore || risk['Risk Score'] || 'High'
    const hazardId = risk.hazardId || ''
    
    // Find relevant strategies from database
    const relevantStrategies = strategies.filter(strategy => {
      // Check if strategy applies to this risk type
      const strategyName = getLocalizedText(strategy.name, 'en').toLowerCase()
      return strategy.applicableRisks?.includes(hazardId) || 
             strategy.applicableRisks?.includes(risk.hazard) || 
             strategy.applicableRisks?.includes(risk.Hazard) ||
             strategyName.includes(hazardName.toLowerCase())
    })

    // Transform database strategies into action plan format
    const immediateActions = relevantStrategies
      .filter(s => s.actionSteps?.some(step => step.phase === 'immediate'))
      .flatMap(s => s.actionSteps?.filter(step => step.phase === 'immediate').map(step => ({
        task: getLocalizedText(step.smeAction || step.action, 'en') || 'Action required',
        responsible: getLocalizedText(step.responsibility, 'en') || 'Management',
        duration: getLocalizedText(step.timeframe, 'en') || '1 hour',
        priority: s.priority === 'critical' ? 'high' as const : 
                 s.priority === 'high' ? 'high' as const : 'medium' as const
      })) || [])

    const shortTermActions = relevantStrategies
      .filter(s => s.actionSteps?.some(step => step.phase === 'short_term'))
      .flatMap(s => s.actionSteps?.filter(step => step.phase === 'short_term').map(step => ({
        task: getLocalizedText(step.smeAction || step.action, 'en') || 'Action required',
        responsible: getLocalizedText(step.responsibility, 'en') || 'Operations Team',
        duration: getLocalizedText(step.timeframe, 'en') || '1 day',
        priority: s.priority === 'critical' ? 'high' as const : 'medium' as const
      })) || [])

    const mediumTermActions = relevantStrategies
      .filter(s => s.actionSteps?.some(step => step.phase === 'medium_term'))
      .flatMap(s => s.actionSteps?.filter(step => step.phase === 'medium_term').map(step => ({
        task: getLocalizedText(step.smeAction || step.action, 'en') || 'Action required',
        responsible: getLocalizedText(step.responsibility, 'en') || 'Management',
        duration: getLocalizedText(step.timeframe, 'en') || '1 week',
        priority: 'medium' as const
      })) || [])

    const longTermReduction = relevantStrategies
      .filter(s => s.category === 'prevention')
      .map(s => s.description || s.name)

    // Fallback actions if no strategies found
    const fallbackActions = {
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

    return {
      hazard: hazardName,
      riskLevel: riskLevel,
      riskScore: riskScore,
      businessType: 'Database-driven',
      affectedFunctions: 'All critical business operations',
      specificConsiderations: relevantStrategies.map(s => s.whyImportant || s.description).filter(Boolean),
      resourcesNeeded: (() => {
        // Extract resources from strategy action steps - safely handle different types
        const extracted = relevantStrategies.flatMap(s => 
          s.actionSteps?.flatMap(step => step.resources || []) || []
        ).filter(r => r && typeof r === 'string' && r.trim())
        return extracted.length > 0 ? Array.from(new Set(extracted)) : fallbackActions.resourcesNeeded
      })(),
      immediateActions: immediateActions.length > 0 ? immediateActions : fallbackActions.immediateActions,
      shortTermActions: shortTermActions.length > 0 ? shortTermActions : fallbackActions.shortTermActions,
      mediumTermActions: mediumTermActions.length > 0 ? mediumTermActions : fallbackActions.mediumTermActions,
      longTermReduction: longTermReduction.length > 0 ? longTermReduction : fallbackActions.longTermReduction
    }
  })
}

export const BusinessPlanReview: React.FC<BusinessPlanReviewProps> = ({
  formData,
  riskSummary,
  onBack,
  onExportPDF,
}) => {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const locale = useLocale() as Locale

  // Load strategies from database with current locale
  useEffect(() => {
    const loadStrategies = async () => {
      try {
        setLoading(true)
        const data = await centralDataService.getStrategies(true, locale)
        setStrategies(data)
      } catch (error) {
        console.error('Failed to load strategies:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStrategies()
  }, [locale])
  const companyName = (() => {
    const name = formData.PLAN_INFORMATION?.['Company Name'] || 'Your Company'
    return typeof name === 'string' ? name : getLocalizedText(name, locale as Locale) || 'Your Company'
  })()
  const businessAddress = (() => {
    const address = formData.PLAN_INFORMATION?.['Business Address'] || 'Business Address Not Specified'
    return typeof address === 'string' ? address : getLocalizedText(address, locale as Locale) || 'Business Address Not Specified'
  })()
  const planVersion = (() => {
    const version = formData.PLAN_INFORMATION?.['Plan Version'] || '1.0'
    return typeof version === 'string' ? version : getLocalizedText(version, locale as Locale) || '1.0'
  })()
  const nextReviewDate = (() => {
    const date = formData.PLAN_INFORMATION?.['Next Review Date'] || 'Not specified'
    return typeof date === 'string' ? date : getLocalizedText(date, locale as Locale) || 'Not specified'
  })()
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="max-w-7xl mx-auto py-6 print:py-2 space-y-6 print:space-y-4">
      {/* Enhanced Header - Professional UNDP Style */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 mb-8 print:bg-blue-600 print:p-4 print:mb-4 shadow-lg print:shadow-none">
        <h1 className="text-3xl font-bold mb-3 print:text-2xl tracking-wide">BUSINESS CONTINUITY PLAN</h1>
        <h2 className="text-xl opacity-95 font-semibold print:text-lg">{companyName}</h2>
        <div className="mt-4 text-sm opacity-90 flex items-center justify-center space-x-6">
          <span className="bg-white/20 px-3 py-1 rounded">Version {planVersion}</span>
          <span>•</span>
          <span className="bg-white/20 px-3 py-1 rounded">{currentDate}</span>
        </div>
      </div>

      {/* Document Control & Business Info - Professional Design */}
      <div className="grid lg:grid-cols-3 gap-6 print:gap-4 print:break-inside-avoid">
        <CompactCard className="print:break-inside-avoid">
          <h3 className="font-semibold text-gray-900 mb-3 text-lg border-b pb-2">
            Document Control
          </h3>
          <InfoGrid items={[
            { label: 'Version', value: planVersion },
            { label: 'Created', value: currentDate },
            { label: 'Next Review', value: nextReviewDate },
            { label: 'Plan Manager', value: formData.PLAN_INFORMATION?.['Plan Manager'] },
            { label: 'Alternate Manager', value: formData.PLAN_INFORMATION?.['Alternate Manager'] },
          ]} />
        </CompactCard>

        <CompactCard className="lg:col-span-2 print:break-inside-avoid">
          <h3 className="font-semibold text-gray-900 mb-3 text-lg border-b pb-2">
            Business Information
          </h3>
          <InfoGrid items={[
            { label: 'Company Name', value: companyName },
            { label: 'Business Address', value: businessAddress },
            { label: 'Digital Plan Location', value: formData.PLAN_INFORMATION?.['Digital Plan Location'] },
            { label: 'Physical Plan Location', value: formData.PLAN_INFORMATION?.['Physical Plan Location'] },
          ]} />
        </CompactCard>
        </div>

      {/* Section 1: Business Analysis */}
      <CompactCard className="print:break-inside-avoid">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">SECTION 1: BUSINESS ANALYSIS</h2>
          <div className="w-full h-px bg-gradient-to-r from-blue-600 to-transparent"></div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Business Purpose</h4>
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-800">
              {(() => {
                const purpose = formData.BUSINESS_OVERVIEW?.['Business Purpose'] || 'Not specified'
                return typeof purpose === 'string' ? purpose : (purpose.en || purpose.es || purpose.fr || 'Not specified')
              })()}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Products & Services</h4>
            <div className="bg-green-50 rounded-lg p-4 text-sm text-gray-800">
              {(() => {
                const products = formData.BUSINESS_OVERVIEW?.['Products and Services'] || formData.BUSINESS_OVERVIEW?.['Products & Services'] || 'Not specified'
                return typeof products === 'string' ? products : (products.en || products.es || products.fr || 'Not specified')
              })()}
            </div>
            </div>
          </div>

        {/* Essential Functions - Render as Table */}
        {formData.ESSENTIAL_FUNCTIONS?.['Business Functions'] && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-4">Essential Business Functions</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 bg-white rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Business Function</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Description</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Priority Level</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Max Downtime</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Critical Resources</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.ESSENTIAL_FUNCTIONS['Business Functions'].map((func: any, idx: number) => {
                    const getFieldValue = (field: any) => {
                      if (!field) return '-'
                      return typeof field === 'string' ? field : (field.en || field.es || field.fr || '-')
                    }
                    
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium">
                          {getFieldValue(func['Business Function'])}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-gray-700">
                          {getFieldValue(func['Description'])}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            func['Priority Level'] === 'critical' ? 'bg-red-100 text-red-800' :
                            func['Priority Level'] === 'important' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {getFieldValue(func['Priority Level'])}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-gray-700">
                          {getFieldValue(func['Maximum Acceptable Downtime'])}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">
                          {getFieldValue(func['Critical Resources Needed'])}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CompactCard>

      {/* Section 2: Risk Assessment - Professional Display */}
      <CompactCard className="print:break-before-page">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">SECTION 2: RISK ASSESSMENT</h2>
          <div className="w-full h-px bg-gradient-to-r from-blue-600 to-transparent"></div>
        </div>
        
        {formData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] && 
         Array.isArray(formData.RISK_ASSESSMENT['Risk Assessment Matrix']) &&
         formData.RISK_ASSESSMENT['Risk Assessment Matrix'].length > 0 ? (
          <div className="space-y-6">
            {/* Risk Summary Dashboard */}
            <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Portfolio Overview</h3>
              <div className="grid md:grid-cols-4 gap-4">
              {(() => {
                const risks = formData.RISK_ASSESSMENT['Risk Assessment Matrix']
                const extremeRisks = risks.filter((r: any) => r['Risk Level']?.toLowerCase().includes('extreme')).length
                  const highRisks = risks.filter((r: any) => r['Risk Level']?.toLowerCase().includes('high') && !r['Risk Level']?.toLowerCase().includes('extreme')).length
                const mediumRisks = risks.filter((r: any) => r['Risk Level']?.toLowerCase().includes('medium')).length
                const lowRisks = risks.filter((r: any) => r['Risk Level']?.toLowerCase().includes('low')).length
                  const totalRisks = risks.length
                  const priorityRisks = extremeRisks + highRisks

                  return (
                    <>
                      <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                        <div className="text-3xl font-bold text-gray-900">{totalRisks}</div>
                        <div className="text-sm text-gray-600 mt-1">Total Risks Identified</div>
            </div>
                      <div className="bg-black rounded-lg p-4 text-center shadow-sm">
                        <div className="text-3xl font-bold text-white">{extremeRisks}</div>
                        <div className="text-sm text-gray-200 mt-1">EXTREME Priority</div>
                      </div>
                      <div className="bg-red-500 rounded-lg p-4 text-center shadow-sm">
                        <div className="text-3xl font-bold text-white">{highRisks}</div>
                        <div className="text-sm text-white mt-1">HIGH Priority</div>
                      </div>
                      <div className="bg-blue-100 border-2 border-blue-600 rounded-lg p-4 text-center shadow-sm">
                        <div className="text-3xl font-bold text-blue-900">{priorityRisks}</div>
                        <div className="text-sm text-blue-800 mt-1 font-medium">Immediate Attention</div>
                      </div>
                    </>
                  )
              })()}
              </div>
                </div>

            {/* Risk Cards - Professional Display WITH All Available Data */}
            <div className="space-y-4">
              {formData.RISK_ASSESSMENT['Risk Assessment Matrix'].map((risk: any, index: number) => {
                const level = (risk['Risk Level'] || '').toLowerCase()
                const borderColor = level.includes('extreme') ? 'border-black' :
                                  level.includes('high') ? 'border-red-500' :
                                  level.includes('medium') ? 'border-yellow-500' : 'border-green-500'
                const badgeColor = level.includes('extreme') ? 'bg-black text-white' :
                              level.includes('high') ? 'bg-red-500 text-white' :
                              level.includes('medium') ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                
                return (
                  <div key={index} className={`border-l-4 ${borderColor} bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow print:break-inside-avoid`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-xl mb-2">
                          {transformHazardName(risk['Hazard'] || risk.hazard)}
                        </h4>
                        {risk.reasoning && (() => {
                          const reasoning = getLocalizedText(risk.reasoning, locale as Locale)
                          return reasoning ? (
                            <div className="bg-blue-50 border-l-2 border-blue-400 rounded-r p-3 mb-3">
                              <div className="text-xs font-semibold text-blue-900 mb-1">Why This Risk Matters to Your Business:</div>
                              <div className="text-sm text-blue-800 leading-relaxed">
                                {reasoning}
                      </div>
                            </div>
                          ) : null
                        })()}
                        {risk.description && (() => {
                          const description = getLocalizedText(risk.description, locale as Locale)
                          return description ? (
                            <div className="text-sm text-gray-600 leading-relaxed mb-3">
                              {description}
                            </div>
                          ) : null
                        })()}
                      </div>
                      <span className={`${badgeColor} px-4 py-2 rounded-full text-sm font-bold ml-4 whitespace-nowrap shadow-sm`}>
                        {typeof risk['Risk Level'] === 'string' ? risk['Risk Level'] : getLocalizedText(risk['Risk Level'], locale as Locale) || 'High'}
                      </span>
                    </div>
                    
                    {/* Risk Metrics Grid */}
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Likelihood</div>
                        <div className="text-lg font-bold text-gray-900">
                          {typeof risk['Likelihood'] === 'string' ? risk['Likelihood'] : getLocalizedText(risk['Likelihood'], locale as Locale) || '-'}
                        </div>
                        {risk.likelihoodScore && <div className="text-xs text-gray-500 mt-1">Score: {risk.likelihoodScore}</div>}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Impact / Severity</div>
                        <div className="text-lg font-bold text-gray-900">
                          {(() => {
                            const severity = risk['Severity'] || risk['Impact']
                            return typeof severity === 'string' ? severity : getLocalizedText(severity, locale as Locale) || '-'
                          })()}
                        </div>
                        {risk.impactScore && <div className="text-xs text-gray-500 mt-1">Score: {risk.impactScore}</div>}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Overall Risk</div>
                        <div className="text-lg font-bold text-gray-900">{risk.riskScore || risk['Risk Score'] || '-'}</div>
                        {risk.riskLevel && (
                          <div className="text-xs text-gray-500 mt-1">
                            {typeof risk.riskLevel === 'string' ? risk.riskLevel : getLocalizedText(risk.riskLevel, locale as Locale)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Additional Risk Information */}
                    {(risk.vulnerabilities || risk.affectedFunctions || risk.potentialImpact || risk.riskCategory || risk.riskTier) && (
                      <div className="border-t pt-4 space-y-2">
                        {risk.riskCategory && (() => {
                          const category = typeof risk.riskCategory === 'string' 
                            ? risk.riskCategory 
                            : getLocalizedText(risk.riskCategory, locale as Locale)
                          return category ? (
                            <div className="inline-block mr-3">
                              <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium">
                                Category: {category}
                              </span>
                            </div>
                          ) : null
                        })()}
                        {risk.riskTier && (
                          <div className="inline-block">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              risk.riskTier === 1 ? 'bg-red-100 text-red-800' : 
                              risk.riskTier === 2 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}>
                              Tier {risk.riskTier} Priority
                            </span>
                          </div>
                        )}
                        {risk.vulnerabilities && (() => {
                          const vulnerabilities = getLocalizedText(risk.vulnerabilities, locale as Locale)
                          return vulnerabilities ? (
                            <div className="mt-2">
                              <div className="text-xs font-semibold text-gray-700 mb-1">Vulnerabilities:</div>
                              <div className="text-sm text-gray-600">{vulnerabilities}</div>
                            </div>
                          ) : null
                        })()}
                        {risk.affectedFunctions && (() => {
                          const affectedFunctions = getLocalizedText(risk.affectedFunctions, locale as Locale)
                          return affectedFunctions ? (
                            <div>
                              <div className="text-xs font-semibold text-gray-700 mb-1">Affected Business Functions:</div>
                              <div className="text-sm text-gray-600">{affectedFunctions}</div>
                            </div>
                          ) : null
                        })()}
                        {risk.potentialImpact && (() => {
                          const potentialImpact = getLocalizedText(risk.potentialImpact, locale as Locale)
                          return potentialImpact ? (
                            <div>
                              <div className="text-xs font-semibold text-gray-700 mb-1">Potential Impact:</div>
                              <div className="text-sm text-gray-600">{potentialImpact}</div>
                            </div>
                          ) : null
                        })()}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Note about action plans */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Note:</span> Detailed response strategies and action plans for each high-priority risk are provided in Section 4: Action Plans.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Risk assessment not completed
                </div>
              )}
      </CompactCard>

      {/* Section 3: Business Continuity Strategies - Enhanced Display */}
      <CompactCard className="print:break-before-page">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">SECTION 3: BUSINESS CONTINUITY STRATEGIES</h2>
          <div className="w-full h-px bg-gradient-to-r from-blue-600 to-transparent"></div>
        </div>
        
        {(() => {
          // Get selected strategies - they're stored as full strategy objects
          console.log('🔍 DEBUG STRATEGIES:', {
            hasSTRATEGIES: !!formData.STRATEGIES,
            STRATEGIESKeys: formData.STRATEGIES ? Object.keys(formData.STRATEGIES) : [],
            STRATEGIESValue: formData.STRATEGIES,
            selectedStrategiesRaw: formData.STRATEGIES?.['Business Continuity Strategies'],
            isArray: Array.isArray(formData.STRATEGIES?.['Business Continuity Strategies']),
            length: formData.STRATEGIES?.['Business Continuity Strategies']?.length || 0,
            firstItem: formData.STRATEGIES?.['Business Continuity Strategies']?.[0]
          })
          
          const selectedStrategies = formData.STRATEGIES?.['Business Continuity Strategies'] || []
          console.log('📋 Selected strategies after extraction:', {
            count: selectedStrategies.length,
            isArray: Array.isArray(selectedStrategies),
            firstStrategy: selectedStrategies[0]
          })
          
          if (!Array.isArray(selectedStrategies) || selectedStrategies.length === 0) {
            return (
              <div className="text-center py-8 text-gray-500 italic">
                No business continuity strategies have been selected yet.
              </div>
            )
          }
          
          // Group strategies by category
          const strategyCategories: Record<string, any[]> = {
            'prevention': [],
            'preparation': [],
            'response': [],
            'recovery': []
          }
          
          selectedStrategies.forEach((strategy: any) => {
            const category = (strategy.category || 'response').toLowerCase()
            if (strategyCategories[category]) {
              strategyCategories[category].push(strategy)
            } else {
              strategyCategories['response'].push(strategy)
            }
          })
          
          const categoryConfig = [
            { key: 'prevention', title: 'Prevention (Before Emergencies)', icon: ShieldCheckIcon, borderColor: 'border-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-900' },
            { key: 'preparation', title: 'Preparation (Getting Ready)', icon: CheckCircleIcon, borderColor: 'border-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-900' },
            { key: 'response', title: 'Response (During Emergencies)', icon: BellAlertIcon, borderColor: 'border-red-500', bgColor: 'bg-red-50', textColor: 'text-red-900' },
            { key: 'recovery', title: 'Recovery (After Emergencies)', icon: ArrowPathIcon, borderColor: 'border-green-500', bgColor: 'bg-green-50', textColor: 'text-green-900' }
          ]
          
          return (
            <div className="space-y-8">
              {/* Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Strategy Overview</h3>
                    <p className="text-sm text-gray-700 mt-2">
                      {selectedStrategies.length} comprehensive {selectedStrategies.length === 1 ? 'strategy' : 'strategies'} selected to protect your business
                    </p>
                  </div>
                  <div className="text-4xl font-bold text-blue-600">{selectedStrategies.length}</div>
                </div>
              </div>
              
              {/* Strategies by Category - Enhanced Cards */}
                {categoryConfig.map(cat => {
                  const strategies = strategyCategories[cat.key] || []
                  if (strategies.length === 0) return null
                
                const IconComponent = cat.icon
                  
                  return (
                  <div key={cat.key} className="print:break-inside-avoid">
                    <div className="flex items-center space-x-3 mb-4">
                      <IconComponent className="w-6 h-6 text-gray-700" />
                      <h3 className="text-xl font-bold text-gray-900">{cat.title}</h3>
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        {strategies.length}
                      </span>
                    </div>
                    
                    <div className="space-y-6">
                        {strategies.map((strategy: any, index: number) => {
                        const strategyTitle = getLocalizedText(strategy.smeTitle || strategy.name, locale as Locale)
                        const strategySummary = getLocalizedText(strategy.smeSummary || strategy.description, locale as Locale)
                        const benefits = getLocalizedText(strategy.benefitsBullets, locale as Locale) || []
                        const realWorldExample = getLocalizedText(strategy.realWorldExample, locale as Locale)
                        const lowBudgetAlt = getLocalizedText(strategy.lowBudgetAlternative, locale as Locale)
                        const diyApproach = getLocalizedText(strategy.diyApproach, locale as Locale)
                          
                          return (
                          <div key={index} className={`border-l-4 ${cat.borderColor} bg-white rounded-lg p-6 shadow-sm print:break-inside-avoid`}>
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="text-lg font-semibold text-gray-900 flex-1">
                                {strategyTitle}
                              </h4>
                              {strategy.quickWinIndicator && (
                                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ml-4">
                                  Quick Win
                                </span>
                              )}
                            </div>

                            {/* Summary */}
                            <p className="text-sm text-gray-700 leading-relaxed mb-4">
                              {strategySummary}
                            </p>

                            {/* Benefits */}
                            {Array.isArray(benefits) && benefits.length > 0 && (
                              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                <h5 className="text-sm font-semibold text-blue-900 mb-2">Key Benefits:</h5>
                                <ul className="space-y-1">
                                  {benefits.map((benefit: string, idx: number) => (
                                    <li key={idx} className="text-sm text-blue-800 flex items-start">
                                      <span className="text-blue-600 mr-2 mt-0.5">✓</span>
                                      <span>{benefit}</span>
                                    </li>
                                  ))}
                                </ul>
                                </div>
                              )}

                            {/* Implementation Overview */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                                <div className="flex items-center justify-center mb-1">
                                  <CurrencyDollarIcon className="w-4 h-4 text-gray-600 mr-1" />
                                  <div className="text-xs text-gray-600">Investment</div>
                            </div>
                                <div className="font-semibold text-gray-900 text-sm">
                                  {getLocalizedText(strategy.costEstimateJMD || strategy.implementationCost, locale as Locale) || 'To be determined'}
                      </div>
                    </div>
                              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                                <div className="flex items-center justify-center mb-1">
                                  <ClockIcon className="w-4 h-4 mr-1 text-gray-600" />
                                  <div className="text-xs text-gray-600">Time Required</div>
                                </div>
                                <div className="font-semibold text-gray-900 text-sm">
                                  {getLocalizedText(strategy.timeToImplement || strategy.implementationTime, locale as Locale) || 'To be determined'}
                                  {strategy.estimatedTotalHours && ` (${strategy.estimatedTotalHours}h)`}
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                                <div className="text-xs text-gray-600 mb-1">Difficulty</div>
                                <div className={`font-semibold text-sm ${
                                  strategy.complexityLevel === 'simple' ? 'text-green-600' :
                                  strategy.complexityLevel === 'moderate' ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {strategy.complexityLevel === 'simple' ? 'Easy' :
                                   strategy.complexityLevel === 'moderate' ? 'Moderate' :
                                   strategy.complexityLevel === 'advanced' ? 'Advanced' : 'Moderate'}
                                </div>
                              </div>
              </div>
              
                            {/* Real-world example */}
                            {realWorldExample && (
                              <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 mb-4">
                                <h5 className="text-sm font-semibold text-green-900 mb-2">Real Success Story:</h5>
                                <p className="text-sm text-green-800 leading-relaxed">{realWorldExample}</p>
                      </div>
                            )}

                            {/* Budget-friendly options */}
                            {(lowBudgetAlt || diyApproach) && (
                              <div className="border-t pt-4 space-y-3">
                                {lowBudgetAlt && (
                                  <div>
                                    <h5 className="text-sm font-semibold text-gray-900 mb-1">Low-Budget Option:</h5>
                                    <p className="text-sm text-gray-700 leading-relaxed">{lowBudgetAlt}</p>
                  </div>
                                )}
                                {diyApproach && (
                                  <div>
                                    <h5 className="text-sm font-semibold text-gray-900 mb-1">Do It Yourself:</h5>
                                    <p className="text-sm text-gray-700 leading-relaxed">{diyApproach}</p>
                                    {strategy.estimatedDIYSavings && (
                                      <p className="text-xs text-green-600 mt-1 font-medium">
                                        Potential savings: {strategy.estimatedDIYSavings}
                                      </p>
                                    )}
                                  </div>
                                )}
                </div>
              )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </CompactCard>

      {/* Section 4: Detailed Action Plans - Complete Overhaul */}
      <CompactCard className="print:break-before-page">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">SECTION 4: DETAILED ACTION PLANS</h2>
          <div className="w-full h-px bg-gradient-to-r from-blue-600 to-transparent"></div>
        </div>
        
        {(() => {
          // Get high/extreme priority risks
          const riskMatrix = formData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || []
          const priorityRisks = riskMatrix.filter((r: any) => {
            const level = (r['Risk Level'] || '').toLowerCase()
            return level.includes('high') || level.includes('extreme')
          })
          
          if (priorityRisks.length === 0) {
            return (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No High-Priority Hazards Identified</h3>
                <p className="text-gray-600 max-w-lg mx-auto">
                  Complete your risk assessment with HIGH or EXTREME risk hazards to generate detailed action plans.
                </p>
              </div>
            )
          }

          // Get selected strategies
          const selectedStrategies = formData.STRATEGIES?.['Business Continuity Strategies'] || []

          return (
            <div className="space-y-8">
              {/* Action Plans Introduction */}
              <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use These Action Plans</h3>
                <p className="text-sm text-blue-800 leading-relaxed mb-3">
                  This section provides step-by-step action plans for each identified high-priority risk. 
                  Each plan is organized into phases (Immediate, Short-term, Medium-term, and Long-term) with specific actions, 
                  responsibilities, timelines, and resources needed.
                </p>
                <div className="grid md:grid-cols-4 gap-3 text-xs text-blue-900">
                  <div className="bg-white rounded p-2">
                    <div className="font-semibold mb-1">PHASE 1: Immediate</div>
                    <div className="text-blue-700">0-24 hours</div>
                  </div>
                  <div className="bg-white rounded p-2">
                    <div className="font-semibold mb-1">PHASE 2: Short-term</div>
                    <div className="text-blue-700">1-7 days</div>
                  </div>
                  <div className="bg-white rounded p-2">
                    <div className="font-semibold mb-1">PHASE 3: Medium-term</div>
                    <div className="text-blue-700">1-4 weeks</div>
                  </div>
                  <div className="bg-white rounded p-2">
                    <div className="font-semibold mb-1">PHASE 4: Long-term</div>
                    <div className="text-blue-700">1-6 months</div>
                  </div>
                </div>
              </div>

              {/* Risk-Specific Action Plans */}
              {priorityRisks.map((risk: any, riskIndex: number) => {
                const hazardName = transformHazardName(risk['Hazard'] || risk.hazard)
                const riskLevel = risk['Risk Level'] || 'High'
                const hazardId = risk.hazardId || risk.hazard || risk['Hazard']
                
                console.log(`🎯 DEBUG ACTION PLANS for ${hazardName}:`, {
                  hazardId,
                  selectedStrategiesCount: selectedStrategies.length,
                  strategiesFromDB: strategies.length
                })
                
                // Get relevant strategies and their action steps
                const relevantStrategies = selectedStrategies.filter((s: any) => 
                  s.applicableRisks?.includes(hazardId) || 
                  s.applicableRisks?.includes(risk.hazard) ||
                  s.applicableRisks?.includes(risk['Hazard'])
                )
                
                // Collect all action steps from relevant strategies
                const allSteps = relevantStrategies.flatMap((s: any) => s.actionSteps || [])
                const phaseGroups = groupStepsByPhase(allSteps)
                const resources = aggregateResources(allSteps)
                
                return (
                  <div key={riskIndex} className="border rounded-lg bg-white shadow-sm print:break-inside-avoid">
                    {/* Risk Header */}
                    <div className="border-b bg-gradient-to-r from-gray-50 to-white p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-2xl font-bold text-gray-900">{hazardName} Response Plan</h3>
                        <span className={`px-4 py-2 rounded-full text-xs font-bold shadow ${
                          riskLevel.toLowerCase().includes('extreme') ? 'bg-black text-white' : 'bg-red-500 text-white'
                        }`}>
                          {riskLevel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Comprehensive action plan with {allSteps.length} specific steps across all phases
                      </p>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Resources Needed */}
                      {resources.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="text-yellow-600 mr-2">Resources & Equipment Needed:</span>
                  </h4>
                          <div className="grid md:grid-cols-2 gap-2">
                            {resources.map((resource, idx) => (
                              <div key={idx} className="text-sm text-gray-800 flex items-center">
                                <span className="text-yellow-600 mr-2">□</span>
                                {resource}
                    </div>
                            ))}
                    </div>
                    </div>
                      )}

                      {/* PHASE 1: IMMEDIATE ACTIONS */}
                      {phaseGroups.immediate.length > 0 && (
                        <div className="print:break-inside-avoid">
                          <div className="bg-red-50 border-l-4 border-red-600 rounded-r-lg p-4 mb-4">
                            <h4 className="font-bold text-red-900 text-lg">PHASE 1: IMMEDIATE ACTIONS (0-24 hours)</h4>
                            <p className="text-sm text-red-700 mt-1">Critical actions during and immediately after impact</p>
                  </div>

                          <div className="space-y-6 ml-4">
                            {phaseGroups.immediate.map((step: ActionStep, stepIdx: number) => (
                              <div key={stepIdx} className="border-l-2 border-red-300 pl-6 pb-4">
                                <div className="flex items-start mb-3">
                                  <span className="text-2xl font-bold text-red-600 mr-4 -ml-10 bg-white px-2">{stepIdx + 1}</span>
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 text-base mb-2">
                                      {getLocalizedText(step.smeAction || step.action || step.title, locale as Locale)}
                                    </h5>
                                    
                                    {/* Metadata row */}
                                    <div className="flex flex-wrap gap-4 mb-3 text-sm">
                                      {step.timeframe && (() => {
                                        const timeframe = getLocalizedText(step.timeframe, locale as Locale)
                                        return timeframe ? (
                                          <div className="flex items-center text-gray-600">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            <span>{timeframe}</span>
                                            {step.estimatedMinutes && <span className="ml-1">({step.estimatedMinutes} min)</span>}
                                          </div>
                                        ) : null
                                      })()}
                                      {step.responsibility && (() => {
                                        const responsibility = getLocalizedText(step.responsibility, locale as Locale)
                                        return responsibility ? (
                                          <div className="flex items-center text-gray-600">
                                            <UserIcon className="w-4 h-4 mr-1" />
                                            <span>{responsibility}</span>
                                          </div>
                                        ) : null
                                      })()}
                                      {step.difficultyLevel && (
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(step.difficultyLevel)}`}>
                                          {step.difficultyLevel.charAt(0).toUpperCase() + step.difficultyLevel.slice(1)}
                                        </span>
                                      )}
                                    </div>

                                    {/* Why this matters */}
                                    {step.whyThisStepMatters && (() => {
                                      const whyMatters = getLocalizedText(step.whyThisStepMatters, locale as Locale)
                                      return whyMatters ? (
                                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                          <div className="text-xs font-semibold text-blue-900 mb-1">Why This Matters:</div>
                                          <p className="text-sm text-blue-800">{whyMatters}</p>
                                        </div>
                                      ) : null
                                    })()}

                                    {/* What happens if skipped */}
                                    {step.whatHappensIfSkipped && (() => {
                                      const whatHappens = getLocalizedText(step.whatHappensIfSkipped, locale as Locale)
                                      return whatHappens ? (
                                        <div className="bg-yellow-50 rounded-lg p-3 mb-3">
                                          <div className="text-xs font-semibold text-yellow-900 mb-1">If You Skip This:</div>
                                          <p className="text-sm text-yellow-800">{whatHappens}</p>
                                        </div>
                                      ) : null
                                    })()}

                                    {/* Checklist */}
                                    {step.checklist && (() => {
                                      const checklistRaw = step.checklist
                                      const checklist = Array.isArray(checklistRaw) 
                                        ? checklistRaw 
                                        : (typeof checklistRaw === 'object' ? (checklistRaw as any)[locale] || [] : [])
                                      return Array.isArray(checklist) && checklist.length > 0 ? (
                                        <div className="mb-3">
                                          <div className="text-xs font-semibold text-gray-700 mb-2">Action Checklist:</div>
                                          <ul className="space-y-1">
                                            {checklist.map((item: string, i: number) => (
                                              <li key={i} className="text-sm text-gray-700 flex items-start">
                                                <span className="text-gray-400 mr-2">□</span>
                                                <span>{item}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ) : null
                                    })()}

                                    {/* Completion criteria */}
                                    {step.howToKnowItsDone && (() => {
                                      const howToDone = getLocalizedText(step.howToKnowItsDone, locale as Locale)
                                      return howToDone ? (
                                        <div className="bg-green-50 rounded-lg p-3 mb-3">
                                          <div className="text-xs font-semibold text-green-900 mb-1">Done When:</div>
                                          <p className="text-sm text-green-800">{howToDone}</p>
                                        </div>
                                      ) : null
                                    })()}

                                    {/* Cost and alternatives */}
                                    <div className="flex flex-wrap gap-4 text-sm">
                                      {step.estimatedCostJMD && (
                                        <div className="text-gray-700">
                                          <span className="font-medium">Cost:</span> {step.estimatedCostJMD}
                                        </div>
                                      )}
                                      {step.freeAlternative && (() => {
                                        const freeAlt = getLocalizedText(step.freeAlternative, locale as Locale)
                                        return freeAlt ? (
                                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded">
                                            <span className="font-medium">Free option:</span> {freeAlt}
                                          </div>
                                        ) : null
                                      })()}
                                    </div>

                                    {/* Common mistakes */}
                                    {step.commonMistakesForStep && (() => {
                                      const mistakesRaw = step.commonMistakesForStep
                                      const mistakes = Array.isArray(mistakesRaw) 
                                        ? mistakesRaw 
                                        : (typeof mistakesRaw === 'object' ? (mistakesRaw as any)[locale] || [] : [])
                                      return Array.isArray(mistakes) && mistakes.length > 0 ? (
                                        <div className="mt-3 text-sm">
                                          <div className="font-semibold text-red-600 mb-1">Common Mistakes to Avoid:</div>
                                          <ul className="list-disc list-inside text-red-700 space-y-1">
                                            {mistakes.map((mistake: string, i: number) => (
                                              <li key={i}>{mistake}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      ) : null
                                    })()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PHASE 2: SHORT-TERM ACTIONS */}
                      {phaseGroups.short_term.length > 0 && (
                        <div className="print:break-inside-avoid">
                          <div className="bg-orange-50 border-l-4 border-orange-600 rounded-r-lg p-4 mb-4">
                            <h4 className="font-bold text-orange-900 text-lg">PHASE 2: SHORT-TERM ACTIONS (1-7 days)</h4>
                            <p className="text-sm text-orange-700 mt-1">Initial response and stabilization actions</p>
                          </div>

                          <div className="space-y-6 ml-4">
                            {phaseGroups.short_term.map((step: ActionStep, stepIdx: number) => (
                              <div key={stepIdx} className="border-l-2 border-orange-300 pl-6 pb-4">
                                <div className="flex items-start mb-3">
                                  <span className="text-2xl font-bold text-orange-600 mr-4 -ml-10 bg-white px-2">{stepIdx + 1}</span>
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 text-base mb-2">
                                      {getLocalizedText(step.smeAction || step.action || step.title, locale as Locale)}
                                    </h5>
                                    
                                    {/* Same detailed structure as Phase 1 */}
                                    <div className="flex flex-wrap gap-4 mb-3 text-sm">
                                      {step.timeframe && (() => {
                                        const timeframe = getLocalizedText(step.timeframe, locale as Locale)
                                        return timeframe ? (
                                          <div className="flex items-center text-gray-600">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            <span>{timeframe}</span>
                                          </div>
                                        ) : null
                                      })()}
                                      {step.responsibility && (() => {
                                        const responsibility = getLocalizedText(step.responsibility, locale as Locale)
                                        return responsibility ? (
                                          <div className="flex items-center text-gray-600">
                                            <UserIcon className="w-4 h-4 mr-1" />
                                            <span>{responsibility}</span>
                                          </div>
                                        ) : null
                                      })()}
                                      {step.difficultyLevel && (
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(step.difficultyLevel)}`}>
                                          {step.difficultyLevel.charAt(0).toUpperCase() + step.difficultyLevel.slice(1)}
                                        </span>
                                      )}
                                    </div>

                                    {step.whyThisStepMatters && (() => {
                                      const whyMatters = getLocalizedText(step.whyThisStepMatters, locale as Locale)
                                      return whyMatters ? (
                                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                          <div className="text-xs font-semibold text-blue-900 mb-1">Why This Matters:</div>
                                          <p className="text-sm text-blue-800">{whyMatters}</p>
                                        </div>
                                      ) : null
                                    })()}

                                    {step.checklist && (() => {
                                      const checklistRaw = step.checklist
                                      const checklist = Array.isArray(checklistRaw) 
                                        ? checklistRaw 
                                        : (typeof checklistRaw === 'object' ? (checklistRaw as any)[locale] || [] : [])
                                      return Array.isArray(checklist) && checklist.length > 0 ? (
                                        <div className="mb-3">
                                          <div className="text-xs font-semibold text-gray-700 mb-2">Action Checklist:</div>
                                          <ul className="space-y-1">
                                            {checklist.map((item: string, i: number) => (
                                              <li key={i} className="text-sm text-gray-700 flex items-start">
                                                <span className="text-gray-400 mr-2">□</span>
                                                <span>{item}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ) : null
                                    })()}

                                    {step.howToKnowItsDone && (() => {
                                      const howToDone = getLocalizedText(step.howToKnowItsDone, locale as Locale)
                                      return howToDone ? (
                                        <div className="bg-green-50 rounded-lg p-3 mb-3">
                                          <div className="text-xs font-semibold text-green-900 mb-1">Done When:</div>
                                          <p className="text-sm text-green-800">{howToDone}</p>
                                        </div>
                                      ) : null
                                    })()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PHASE 3: MEDIUM-TERM RECOVERY */}
                      {phaseGroups.medium_term.length > 0 && (
                        <div className="print:break-inside-avoid">
                          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg p-4 mb-4">
                            <h4 className="font-bold text-blue-900 text-lg">PHASE 3: MEDIUM-TERM RECOVERY (1-4 weeks)</h4>
                            <p className="text-sm text-blue-700 mt-1">Recovery and restoration activities</p>
                          </div>

                          <div className="space-y-6 ml-4">
                            {phaseGroups.medium_term.map((step: ActionStep, stepIdx: number) => (
                              <div key={stepIdx} className="border-l-2 border-blue-300 pl-6 pb-4">
                                <div className="flex items-start mb-3">
                                  <span className="text-2xl font-bold text-blue-600 mr-4 -ml-10 bg-white px-2">{stepIdx + 1}</span>
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 text-base mb-2">
                                      {getLocalizedText(step.smeAction || step.action || step.title, locale as Locale)}
                                    </h5>
                                    
                                    <div className="flex flex-wrap gap-4 mb-3 text-sm">
                                      {step.timeframe && (() => {
                                        const timeframe = getLocalizedText(step.timeframe, locale as Locale)
                                        return timeframe ? (
                                          <div className="flex items-center text-gray-600">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            <span>{timeframe}</span>
                                          </div>
                                        ) : null
                                      })()}
                                      {step.responsibility && (() => {
                                        const responsibility = getLocalizedText(step.responsibility, locale as Locale)
                                        return responsibility ? (
                                          <div className="flex items-center text-gray-600">
                                            <UserIcon className="w-4 h-4 mr-1" />
                                            <span>{responsibility}</span>
                                          </div>
                                        ) : null
                                      })()}
                                    </div>

                                    {step.whyThisStepMatters && (
                                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                        <div className="text-xs font-semibold text-blue-900 mb-1">Why This Matters:</div>
                                        <p className="text-sm text-blue-800">{step.whyThisStepMatters}</p>
                                      </div>
                                    )}

                                    {step.checklist && step.checklist.length > 0 && (
                                      <div className="mb-3">
                                        <div className="text-xs font-semibold text-gray-700 mb-2">Action Checklist:</div>
                                        <ul className="space-y-1">
                                          {step.checklist.map((item, i) => (
                                            <li key={i} className="text-sm text-gray-700 flex items-start">
                                              <span className="text-gray-400 mr-2">□</span>
                                              <span>{item}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PHASE 4: LONG-TERM PREVENTION */}
                      {phaseGroups.long_term.length > 0 && (
                        <div className="print:break-inside-avoid">
                          <div className="bg-green-50 border-l-4 border-green-600 rounded-r-lg p-4 mb-4">
                            <h4 className="font-bold text-green-900 text-lg">PHASE 4: LONG-TERM PREVENTION (1-6 months)</h4>
                            <p className="text-sm text-green-700 mt-1">Prevention and resilience building for the future</p>
                          </div>

                          <div className="space-y-6 ml-4">
                            {phaseGroups.long_term.map((step: ActionStep, stepIdx: number) => (
                              <div key={stepIdx} className="border-l-2 border-green-300 pl-6 pb-4">
                                <div className="flex items-start mb-3">
                                  <span className="text-2xl font-bold text-green-600 mr-4 -ml-10 bg-white px-2">{stepIdx + 1}</span>
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 text-base mb-2">
                                      {getLocalizedText(step.smeAction || step.action || step.title, locale as Locale)}
                                    </h5>
                                    
                                    <div className="flex flex-wrap gap-4 mb-3 text-sm">
                                      {step.timeframe && (() => {
                                        const timeframe = getLocalizedText(step.timeframe, locale as Locale)
                                        return timeframe ? (
                                          <div className="flex items-center text-gray-600">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            <span>{timeframe}</span>
                                          </div>
                                        ) : null
                                      })()}
                                      {step.responsibility && (() => {
                                        const responsibility = getLocalizedText(step.responsibility, locale as Locale)
                                        return responsibility ? (
                                          <div className="flex items-center text-gray-600">
                                            <UserIcon className="w-4 h-4 mr-1" />
                                            <span>{responsibility}</span>
                                          </div>
                                        ) : null
                                      })()}
                                    </div>

                                    {step.whyThisStepMatters && (
                                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                        <div className="text-xs font-semibold text-blue-900 mb-1">Why This Matters:</div>
                                        <p className="text-sm text-blue-800">{step.whyThisStepMatters}</p>
                                      </div>
                                    )}

                                    {step.checklist && step.checklist.length > 0 && (
                                      <div className="mb-3">
                                        <div className="text-xs font-semibold text-gray-700 mb-2">Action Checklist:</div>
                                        <ul className="space-y-1">
                                          {step.checklist.map((item, i) => (
                                            <li key={i} className="text-sm text-gray-700 flex items-start">
                                              <span className="text-gray-400 mr-2">□</span>
                                              <span>{item}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fallback: Show strategies even if no detailed action steps */}
                      {allSteps.length === 0 && relevantStrategies.length > 0 && (
                        <div className="space-y-4">
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                            <h4 className="font-semibold text-amber-900 mb-3">📋 Recommended Strategies for This Risk</h4>
                            <p className="text-sm text-amber-800 mb-4">
                              While detailed step-by-step action plans are being developed, here are the key strategies selected to address this risk:
                            </p>
                            <div className="space-y-3">
                              {relevantStrategies.map((strategy: any, idx: number) => (
                                <div key={idx} className="bg-white rounded-lg p-4 border border-amber-200">
                                  <div className="font-semibold text-gray-900 mb-2">
                                    {getLocalizedText(strategy.smeTitle || strategy.name, locale as Locale)}
                                  </div>
                                  <div className="text-sm text-gray-700 mb-3">
                                    {getLocalizedText(strategy.smeSummary || strategy.description, locale as Locale)}
                                  </div>
                                  <div className="flex flex-wrap gap-3 text-xs">
                                    {strategy.costEstimateJMD && (() => {
                                      const cost = getLocalizedText(strategy.costEstimateJMD, locale as Locale)
                                      return cost ? (
                                        <div className="bg-blue-50 px-3 py-1 rounded">
                                          <span className="font-medium">Cost:</span> {cost}
                                        </div>
                                      ) : null
                                    })()}
                                    {strategy.timeToImplement && (() => {
                                      const time = getLocalizedText(strategy.timeToImplement, locale as Locale)
                                      return time ? (
                                        <div className="bg-purple-50 px-3 py-1 rounded">
                                          <span className="font-medium">Time:</span> {time}
                                        </div>
                                      ) : null
                                    })()}
                                    {strategy.complexityLevel && (
                                      <div className="bg-gray-50 px-3 py-1 rounded">
                                        <span className="font-medium">Difficulty:</span> {strategy.complexityLevel}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                            <div className="text-sm text-blue-900">
                              <div className="font-semibold mb-2">Next Steps:</div>
                              <ul className="list-disc list-inside space-y-1 text-blue-800">
                                <li>Review each recommended strategy in detail in Section 3</li>
                                <li>Consult with your team on implementation priorities</li>
                                <li>Consider starting with "Quick Win" strategies for immediate results</li>
                                <li>Contact UNDP/CARICHAM for guidance on detailed action planning</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* If no strategies either */}
                      {allSteps.length === 0 && relevantStrategies.length === 0 && (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                          <div className="text-gray-400 mb-3">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h5 className="text-lg font-semibold text-gray-900 mb-2">No Action Plan Data Available</h5>
                          <p className="text-gray-600 max-w-md mx-auto">
                            No specific action steps or strategies are associated with this hazard yet. 
                            Consider consulting with a business continuity expert to develop a detailed response plan.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </CompactCard>

      {/* Section 5: Testing and Maintenance */}
      <CompactCard className="print:break-before-page">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">SECTION 5: TESTING AND MAINTENANCE</h2>
          <div className="w-full h-px bg-gradient-to-r from-blue-600 to-transparent"></div>
        </div>
        
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

      {/* Appendix A: Key Contacts */}
      <CompactCard className="print:break-before-page">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">APPENDIX A: KEY CONTACTS</h2>
          <div className="w-full h-px bg-gradient-to-r from-blue-600 to-transparent"></div>
        </div>
        
        {formData.CONTACTS_AND_INFORMATION ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ContactCard 
              contacts={formData.CONTACTS_AND_INFORMATION['Staff Contact Information']}
              title="Staff Contacts"
              icon="STAFF"
            />
            <ContactCard 
              contacts={formData.CONTACTS_AND_INFORMATION['Supplier Information']}
              title="Critical Vendors"
              icon="VENDOR"
            />
            <ContactCard 
              contacts={formData.CONTACTS_AND_INFORMATION['Key Customer Contacts']}
              title="Key Clients"
              icon="CLIENT"
            />
            <ContactCard 
              contacts={formData.CONTACTS_AND_INFORMATION['Emergency Services and Utilities']}
              title="Emergency Services"
              icon="EMERGENCY"
            />
          </div>
        ) : (
          <p className="text-gray-500 italic">Contact information not provided</p>
        )}
      </CompactCard>

      {/* Appendix B: Vital Records */}
      <CompactCard>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">APPENDIX B: VITAL RECORDS INVENTORY</h2>
          <div className="w-full h-px bg-gradient-to-r from-blue-600 to-transparent"></div>
        </div>
        
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

      {/* Distribution List */}
      <CompactCard>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">DISTRIBUTION LIST</h2>
          <div className="w-full h-px bg-gradient-to-r from-blue-600 to-transparent"></div>
        </div>
        
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

      {/* Enhanced Navigation with Better Visual Design */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg print:hidden mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium shadow-sm hover:shadow-md flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Wizard</span>
            </button>
            
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900 mb-1">Business Continuity Plan</div>
              <div className="text-xs text-gray-500">{companyName} • {currentDate}</div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow-md flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print</span>
              </button>
              <button
                onClick={onExportPDF}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-sm hover:shadow-md flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
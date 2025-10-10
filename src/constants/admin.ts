// Centralized constants for admin2 section

export const BUSINESS_CATEGORIES = [
  'hospitality', 
  'retail', 
  'services',
  'health',
  'manufacturing', 
  'agriculture', 
  'technology'
] as const

export const IMPLEMENTATION_PHASES = [
  { key: 'immediate', name: 'Immediate', description: 'Right now (this week)' },
  { key: 'short_term', name: 'Short-term', description: 'Next 1-4 weeks' },
  { key: 'medium_term', name: 'Medium-term', description: 'Next 1-3 months' },
  { key: 'long_term', name: 'Long-term', description: 'Next 3-12 months' }
] as const

export const COST_OPTIONS = [
  { key: 'low', name: 'Low Cost', jmd: 'Under JMD $10,000', description: 'Minimal investment required' },
  { key: 'medium', name: 'Medium Cost', jmd: 'JMD $10,000 - $50,000', description: 'Moderate investment' },
  { key: 'high', name: 'High Cost', jmd: 'JMD $50,000 - $200,000', description: 'Significant investment' },
  { key: 'very_high', name: 'Very High Cost', jmd: 'Over JMD $200,000', description: 'Major investment required' }
] as const

export const TIME_OPTIONS = [
  { key: 'hours', name: 'Hours', description: 'Can be done in a few hours' },
  { key: 'days', name: 'Days', description: 'Takes a few days to complete' },
  { key: 'weeks', name: 'Weeks', description: 'Takes several weeks' },
  { key: 'months', name: 'Months', description: 'Long-term implementation' }
] as const

export const RESPONSIBILITY_OPTIONS = [
  'Business Owner', 
  'Manager', 
  'Employee', 
  'Family Member', 
  'Professional Contractor', 
  'Insurance Agent', 
  'Government Agency', 
  'Supplier/Vendor'
] as const

export const CASH_FLOW_PATTERNS = [
  'steady',
  'seasonal', 
  'volatile',
  'cyclical'
] as const

export const JAMAICA_REGIONS = [
  'Kingston',
  'Spanish Town',
  'Portmore',
  'Montego Bay',
  'Spanish Town',
  'Mandeville',
  'May Pen',
  'Old Harbour'
] as const







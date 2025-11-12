// CSV utility functions for strategy import/export

export interface StrategyCSV {
  id: string
  strategyId: string
  name: string
  description: string
  smeDescription: string
  whyImportant: string
  applicableRisks: string
  implementationCost: string
  costEstimateJMD: string
  businessTypes: string
  helpfulTips: string
  commonMistakes: string
  successMetrics: string
  prerequisites: string
  roi: number
  actionSteps: string // JSON string of action steps
}

export interface ActionStepCSV {
  strategyId: string
  stepId: string
  phase: string
  action: string
  smeAction: string
  timeframe: string
  responsibility: string
  resources: string
  cost: string
  estimatedCostJMD: string
  checklist: string
  helpVideo?: string
}

export interface BusinessTypeCSV {
  id: string;
  businessTypeId: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  typicalRevenue?: string;
  typicalEmployees?: string;
  operatingHours?: string;
  seasonalityFactor: number;
  touristDependency: number;
  supplyChainComplexity: number;
  digitalDependency: number;
  cashFlowPattern: string;
  physicalAssetIntensity: number;
  customerConcentration: number;
  regulatoryBurden: number;
}

export function exportBusinessTypesToCSV(businessTypes: any[]): string {
  const headers = [
    'id', 'businessTypeId', 'name', 'category', 'subcategory', 'description',
    'typicalRevenue', 'typicalEmployees', 'operatingHours', 'seasonalityFactor',
    'touristDependency', 'supplyChainComplexity', 'digitalDependency',
    'cashFlowPattern', 'physicalAssetIntensity', 'customerConcentration', 'regulatoryBurden'
  ];

  const csvRows = [
    headers.join(','),
    ...businessTypes.map(bt => [
      escapeCSV(bt.id || ''),
      escapeCSV(bt.businessTypeId || ''),
      escapeCSV(bt.name || ''),
      escapeCSV(bt.category || ''),
      escapeCSV(bt.subcategory || ''),
      escapeCSV(bt.description || ''),
      escapeCSV(bt.typicalRevenue || ''),
      escapeCSV(bt.typicalEmployees || ''),
      escapeCSV(bt.operatingHours || ''),
      bt.seasonalityFactor || 0,
      bt.touristDependency || 0,
      bt.supplyChainComplexity || 0,
      bt.digitalDependency || 0,
      escapeCSV(bt.cashFlowPattern || ''),
      bt.physicalAssetIntensity || 0,
      bt.customerConcentration || 0,
      bt.regulatoryBurden || 0,
    ].join(','))
  ];

  return csvRows.join('\n');
}

export function parseBusinessTypesFromCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const businessTypes: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const businessType: any = {};
    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';
      
      switch (header) {
        case 'seasonalityFactor':
        case 'touristDependency':
        case 'supplyChainComplexity':
        case 'digitalDependency':
        case 'physicalAssetIntensity':
        case 'customerConcentration':
        case 'regulatoryBurden':
          businessType[header] = parseFloat(value) || 0;
          break;
        default:
          businessType[header] = value;
      }
    });

    if (businessType.name && businessType.category) {
      businessTypes.push(businessType);
    }
  }

  return businessTypes;
}

export function exportStrategiesAndActionStepsToCSV(strategies: any[]): string {
  const headers = [
    'strategyId', 'name', 'description', 
    'applicableRisks', 'implementationCost', 'costEstimateJMD', 'businessTypes',
    'helpfulTips', 'commonMistakes', 'successMetrics', 
    'prerequisites', 'roi',
    'stepId', 'phase', 'action', 'timeframe',
    'responsibility', 'resources', 'cost', 'estimatedCostJMD_step', 'checklist', 'helpVideo'
  ];

  const csvRows: string[] = [headers.join(',')];

  strategies.forEach(strategy => {
    if (strategy.actionSteps && strategy.actionSteps.length > 0) {
      strategy.actionSteps.forEach((step: any) => {
        const row = [
          escapeCSV(strategy.strategyId || ''),
          escapeCSV(strategy.name || ''),
          escapeCSV(strategy.description || ''),
          escapeCSV(Array.isArray(strategy.applicableRisks) ? strategy.applicableRisks.join(';') : ''),
          escapeCSV(strategy.implementationCost || ''),
          escapeCSV(strategy.costEstimateJMD || ''),
          escapeCSV(Array.isArray(strategy.businessTypes) ? strategy.businessTypes.join(';') : ''),
          escapeCSV(Array.isArray(strategy.helpfulTips) ? strategy.helpfulTips.join(';') : ''),
          escapeCSV(Array.isArray(strategy.commonMistakes) ? strategy.commonMistakes.join(';') : ''),
          escapeCSV(Array.isArray(strategy.successMetrics) ? strategy.successMetrics.join(';') : ''),
          escapeCSV(Array.isArray(strategy.prerequisites) ? strategy.prerequisites.join(';') : ''),
          strategy.roi || 0,
          escapeCSV(step.id || ''),
          escapeCSV(step.phase || ''),
          escapeCSV(step.action || ''),
          escapeCSV(step.timeframe || ''),
          escapeCSV(step.responsibility || ''),
          escapeCSV(Array.isArray(step.resources) ? step.resources.join(';') : ''),
          escapeCSV(step.cost || ''),
          escapeCSV(step.estimatedCostJMD || ''),
          escapeCSV(Array.isArray(step.checklist) ? step.checklist.join(';') : ''),
          escapeCSV(step.helpVideo || '')
        ];
        csvRows.push(row.join(','));
      });
    } else {
      // Strategy with no action steps
      const row = [
        escapeCSV(strategy.strategyId || ''),
        escapeCSV(strategy.name || ''),
        escapeCSV(strategy.description || ''),
        escapeCSV(Array.isArray(strategy.applicableRisks) ? strategy.applicableRisks.join(';') : ''),
        escapeCSV(strategy.implementationCost || ''),
        escapeCSV(strategy.costEstimateJMD || ''),
        escapeCSV(Array.isArray(strategy.businessTypes) ? strategy.businessTypes.join(';') : ''),
        escapeCSV(Array.isArray(strategy.helpfulTips) ? strategy.helpfulTips.join(';') : ''),
        escapeCSV(Array.isArray(strategy.commonMistakes) ? strategy.commonMistakes.join(';') : ''),
        escapeCSV(Array.isArray(strategy.successMetrics) ? strategy.successMetrics.join(';') : ''),
        escapeCSV(Array.isArray(strategy.prerequisites) ? strategy.prerequisites.join(';') : ''),
        strategy.roi || 0,
        '', '', '', '', '', '', '', '', '', '' // Empty fields for action step
      ];
      csvRows.push(row.join(','));
    }
  });

  return csvRows.join('\n');
}

export function exportStrategiesToCSV(strategies: any[]): string {
  const headers = [
    'id', 'strategyId', 'name', 'description', 'smeDescription', 
    'whyImportant', 'applicableRisks', 'implementationCost', 'costEstimateJMD',
    'businessTypes', 'helpfulTips', 'commonMistakes', 'successMetrics', 
    'prerequisites', 'roi', 'actionSteps'
  ]

  const csvRows = [
    headers.join(','),
    ...strategies.map(strategy => [
      escapeCSV(strategy.id || ''),
      escapeCSV(strategy.strategyId || ''),
      escapeCSV(strategy.name || ''),
      escapeCSV(strategy.description || ''),
      escapeCSV(strategy.smeDescription || ''),
      escapeCSV(strategy.whyImportant || ''),
      escapeCSV(Array.isArray(strategy.applicableRisks) ? strategy.applicableRisks.join(';') : ''),
      escapeCSV(strategy.implementationCost || ''),
      escapeCSV(strategy.costEstimateJMD || ''),
      escapeCSV(Array.isArray(strategy.businessTypes) ? strategy.businessTypes.join(';') : ''),
      escapeCSV(Array.isArray(strategy.helpfulTips) ? strategy.helpfulTips.join(';') : ''),
      escapeCSV(Array.isArray(strategy.commonMistakes) ? strategy.commonMistakes.join(';') : ''),
      escapeCSV(Array.isArray(strategy.successMetrics) ? strategy.successMetrics.join(';') : ''),
      escapeCSV(Array.isArray(strategy.prerequisites) ? strategy.prerequisites.join(';') : ''),
      strategy.roi || 0,
      escapeCSV(JSON.stringify(strategy.actionSteps || []))
    ].join(','))
  ]

  return csvRows.join('\n')
}

export function exportActionStepsToCSV(strategies: any[]): string {
  const headers = [
    'strategyId', 'stepId', 'phase', 'action', 'smeAction', 'timeframe',
    'responsibility', 'resources', 'cost', 'estimatedCostJMD', 'checklist', 'helpVideo'
  ]

  const allSteps: any[] = []
  strategies.forEach(strategy => {
    if (strategy.actionSteps && Array.isArray(strategy.actionSteps)) {
      strategy.actionSteps.forEach((step: any) => {
        allSteps.push({
          strategyId: strategy.strategyId,
          stepId: step.id,
          phase: step.phase,
          action: step.action,
          smeAction: step.smeAction,
          timeframe: step.timeframe,
          responsibility: step.responsibility,
          resources: Array.isArray(step.resources) ? step.resources.join(';') : '',
          cost: step.cost,
          estimatedCostJMD: step.estimatedCostJMD,
          checklist: Array.isArray(step.checklist) ? step.checklist.join(';') : '',
          helpVideo: step.helpVideo || ''
        })
      })
    }
  })

  const csvRows = [
    headers.join(','),
    ...allSteps.map(step => [
      escapeCSV(step.strategyId || ''),
      escapeCSV(step.stepId || ''),
      escapeCSV(step.phase || ''),
      escapeCSV(step.action || ''),
      escapeCSV(step.smeAction || ''),
      escapeCSV(step.timeframe || ''),
      escapeCSV(step.responsibility || ''),
      escapeCSV(step.resources || ''),
      escapeCSV(step.cost || ''),
      escapeCSV(step.estimatedCostJMD || ''),
      escapeCSV(step.checklist || ''),
      escapeCSV(step.helpVideo || '')
    ].join(','))
  ]

  return csvRows.join('\n')
}

export function parseStrategiesAndActionStepsFromCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const strategiesMap: { [strategyId: string]: any } = {};

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const rowData: any = {};
    headers.forEach((header, index) => {
      rowData[header] = values[index]?.trim() || '';
    });

    const strategyId = rowData.strategyId;
    if (!strategyId) continue;

    if (!strategiesMap[strategyId]) {
      strategiesMap[strategyId] = {
        id: strategyId,
        strategyId: strategyId,
        name: rowData.name,
        description: rowData.description,
        applicableRisks: rowData.applicableRisks ? rowData.applicableRisks.split(';').map((s: string) => s.trim()).filter((s: string) => s) : [],
        implementationCost: rowData.implementationCost,
        costEstimateJMD: rowData.costEstimateJMD,
        businessTypes: rowData.businessTypes ? rowData.businessTypes.split(';').map((s: string) => s.trim()).filter((s: string) => s) : [],
        helpfulTips: rowData.helpfulTips ? rowData.helpfulTips.split(';').map((s: string) => s.trim()).filter((s: string) => s) : [],
        commonMistakes: rowData.commonMistakes ? rowData.commonMistakes.split(';').map((s: string) => s.trim()).filter((s: string) => s) : [],
        successMetrics: rowData.successMetrics ? rowData.successMetrics.split(';').map((s: string) => s.trim()).filter((s: string) => s) : [],
        prerequisites: rowData.prerequisites ? rowData.prerequisites.split(';').map((s: string) => s.trim()).filter((s: string) => s) : [],
        roi: parseFloat(rowData.roi) || 0,
        actionSteps: [],
      };
    }

    if (rowData.stepId) {
      strategiesMap[strategyId].actionSteps.push({
        id: rowData.stepId,
        phase: rowData.phase,
        action: rowData.action,
        timeframe: rowData.timeframe,
        responsibility: rowData.responsibility,
        resources: rowData.resources ? rowData.resources.split(';').map((s: string) => s.trim()).filter((s: string) => s) : [],
        cost: rowData.cost,
        estimatedCostJMD: rowData.estimatedCostJMD_step,
        checklist: rowData.checklist ? rowData.checklist.split(';').map((s: string) => s.trim()).filter((s: string) => s) : [],
        helpVideo: rowData.helpVideo,
      });
    }
  }

  return Object.values(strategiesMap);
}

export function parseStrategiesFromCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const strategies: any[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length !== headers.length) continue

    const strategy: any = {}
    headers.forEach((header, index) => {
      const value = values[index]?.trim() || ''
      
      switch (header) {
        case 'roi':
          strategy[header] = parseFloat(value) || 0
          break
        case 'applicableRisks':
        case 'businessTypes':
        case 'helpfulTips':
        case 'commonMistakes':
        case 'successMetrics':
        case 'prerequisites':
          strategy[header] = value ? value.split(';').map(s => s.trim()).filter(s => s) : []
          break
        case 'actionSteps':
          try {
            strategy[header] = value ? JSON.parse(value) : []
          } catch {
            strategy[header] = []
          }
          break
        default:
          strategy[header] = value
      }
    })

    if (strategy.name) {
      strategies.push(strategy)
    }
  }

  return strategies
}

export function parseActionStepsFromCSV(csvText: string): { [strategyId: string]: any[] } {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length < 2) return {}

  const headers = lines[0].split(',').map(h => h.trim())
  const stepsByStrategy: { [strategyId: string]: any[] } = {}

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length !== headers.length) continue

    const step: any = {}
    headers.forEach((header, index) => {
      const value = values[index]?.trim() || ''
      
      switch (header) {
        case 'resources':
        case 'checklist':
          step[header] = value ? value.split(';').map(s => s.trim()).filter(s => s) : []
          break
        default:
          step[header] = value
      }
    })

    if (step.strategyId && step.action) {
      if (!stepsByStrategy[step.strategyId]) {
        stepsByStrategy[step.strategyId] = []
      }
      stepsByStrategy[step.strategyId].push(step)
    }
  }

  return stepsByStrategy
}

function escapeCSV(value: string): string {
  if (typeof value !== 'string') return String(value)
  
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}


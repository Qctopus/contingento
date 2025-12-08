/**
 * Word Document Builder - Professional DOCX Generation
 * 
 * Creates beautifully formatted Word documents for:
 * - Formal Business Continuity Plan (bank-ready)
 * - Action Workbook (implementation guide)
 * 
 * CRITICAL DOCX RULES:
 * - Use ShadingType.CLEAR (not SOLID) for colored backgrounds
 * - Use WidthType.DXA with fixed pixel values for tables
 * - Use proper numbering config for bullets/numbered lists
 * - Never use \n - use separate Paragraphs instead
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  ShadingType,
  convertInchesToTwip,
  LevelFormat,
  TableLayoutType
} from 'docx'
import type { Locale } from '@/i18n/config'

import enMessages from '@/messages/en.json'
import esMessages from '@/messages/es.json'
import frMessages from '@/messages/fr.json'

// =============================================================================
// CONSTANTS
// =============================================================================

const COLORS = {
  primary: '1e3a5f',
  secondary: '2563eb',
  success: '16a34a',
  warning: 'd97706',
  danger: 'dc2626',
  gray: {
    50: 'f9fafb',
    100: 'f3f4f6',
    200: 'e5e7eb',
    300: 'd1d5db',
    500: '6b7280',
    700: '374151',
    900: '111827'
  }
}

const TABLE_WIDTH = 9360
const TABLE_WIDTHS = {
  labelValue: [2800, 6560],
  riskTable: [2800, 1400, 1200, 1200, 2760],
  contacts: [2340, 2340, 2340, 2340],
  contacts5: [1872, 1872, 1872, 1872, 1872],
  twoCol: [4680, 4680],
  threeCol: [3120, 3120, 3120]
}

const tableBorder = { style: BorderStyle.SINGLE, size: 8, color: COLORS.gray[300] }
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder }

// =============================================================================
// TYPES
// =============================================================================

export interface WordExportOptions {
  formData: any
  strategies: any[]
  risks?: any[]
  locale: Locale
  mode: 'formal' | 'workbook'
}

// =============================================================================
// TRANSLATION HELPER
// =============================================================================

const getUIText = (key: string, locale: Locale): string => {
  const messages = locale === 'es' ? esMessages : locale === 'fr' ? frMessages : enMessages
  const keys = key.split('.')
  let value: any = messages
  for (const k of keys) {
    if (value && typeof value === 'object') value = value[k]
    else return key
  }
  return typeof value === 'string' ? value : key
}

// =============================================================================
// STRING HELPERS
// =============================================================================

function getString(value: any): string {
  if (!value) return ''
  if (typeof value === 'string') {
    if (value.startsWith('{') && (value.includes('"en"') || value.includes('"es"') || value.includes('"fr"'))) {
      try {
        const parsed = JSON.parse(value)
        return parsed.en || parsed.es || parsed.fr || value
      } catch { return value }
    }
    return value
  }
  if (typeof value === 'object') {
    return value.en || value.es || value.fr || JSON.stringify(value)
  }
  return String(value)
}

function formatHazardName(hazardId: string): string {
  if (!hazardId) return 'Unknown Risk'
  return hazardId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

function getSeverityColor(score: number): { bg: string; text: string; label: string } {
  if (score >= 8) return { bg: 'fee2e2', text: COLORS.danger, label: 'EXTREME' }
  if (score >= 6) return { bg: 'ffedd5', text: 'ea580c', label: 'HIGH' }
  if (score >= 4) return { bg: 'fef9c3', text: COLORS.warning, label: 'MEDIUM' }
  return { bg: 'dcfce7', text: COLORS.success, label: 'LOW' }
}

// =============================================================================
// BUILD NUMBERING CONFIG
// =============================================================================

function buildNumberingConfig(strategyCount: number) {
  const configs: any[] = [
    {
      reference: 'bullet-list',
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: '\u2022',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    }
  ]

  for (let i = 1; i <= Math.max(strategyCount, 20); i++) {
    configs.push({
      reference: `strategy-${i}-actions`,
      levels: [{
        level: 0,
        format: LevelFormat.DECIMAL,
        text: '%1.',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    })
  }

  return configs
}

// =============================================================================
// TABLE HELPERS
// =============================================================================

function createTableCell(
  text: string,
  width: number,
  options: { bold?: boolean; shading?: string; align?: typeof AlignmentType[keyof typeof AlignmentType]; color?: string; size?: number } = {}
): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: cellBorders,
    shading: options.shading ? { fill: options.shading, type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({
      alignment: options.align || AlignmentType.LEFT,
      children: [new TextRun({
        text: text || '-',
        bold: options.bold,
        size: options.size || 20,
        color: options.color,
        font: 'Calibri'
      })]
    })]
  })
}

function createHeaderCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: cellBorders,
    shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 20, color: 'ffffff', font: 'Calibri' })]
    })]
  })
}

// =============================================================================
// SECTION HEADERS
// =============================================================================

function createSectionHeader(number: string, title: string): Paragraph {
  return new Paragraph({
    border: { left: { style: BorderStyle.SINGLE, size: 24, color: COLORS.secondary } },
    shading: { fill: COLORS.gray[100], type: ShadingType.CLEAR },
    spacing: { before: 400, after: 200 },
    indent: { left: 200 },
    children: [
      new TextRun({ text: `${number}  `, bold: true, size: 28, color: COLORS.secondary, font: 'Calibri' }),
      new TextRun({ text: title, bold: true, size: 28, color: COLORS.gray[900], font: 'Calibri' })
    ]
  })
}

function createSubsectionHeader(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 300, after: 150 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: COLORS.gray[300] } },
    children: [new TextRun({ text, bold: true, size: 24, color: COLORS.gray[700], font: 'Calibri' })]
  })
}

// =============================================================================
// INFO TABLE
// =============================================================================

function createInfoTable(rows: [string, string][]): Table {
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: TABLE_WIDTHS.labelValue,
    rows: rows.filter(([, v]) => v && v !== '-' && v !== 'undefined').map(([label, value]) =>
      new TableRow({
        children: [
          createTableCell(label, TABLE_WIDTHS.labelValue[0], { bold: true, shading: COLORS.gray[100] }),
          createTableCell(value, TABLE_WIDTHS.labelValue[1])
        ]
      })
    )
  })
}

// =============================================================================
// RISK CARDS (Enhanced to match React preview)
// =============================================================================

function createRiskCards(riskMatrix: any[], locale: Locale): Paragraph[] {
  if (!riskMatrix || riskMatrix.length === 0) {
    return [new Paragraph({ children: [new TextRun({ text: 'No risks identified.', size: 22, italics: true })] })]
  }

  const paragraphs: Paragraph[] = []

  // Severity legend
  paragraphs.push(new Paragraph({
    shading: { fill: COLORS.gray[100], type: ShadingType.CLEAR },
    spacing: { after: 200 },
    children: [
      new TextRun({ text: 'Severity Levels: ', bold: true, size: 20, font: 'Calibri' }),
      new TextRun({ text: 'EXTREME (≥8.0) ', size: 18, color: COLORS.danger, font: 'Calibri' }),
      new TextRun({ text: 'HIGH (6.0-7.9) ', size: 18, color: 'ea580c', font: 'Calibri' }),
      new TextRun({ text: 'MEDIUM (4.0-5.9) ', size: 18, color: COLORS.warning, font: 'Calibri' }),
      new TextRun({ text: 'LOW (<4.0)', size: 18, color: COLORS.success, font: 'Calibri' })
    ]
  }))

  riskMatrix.forEach((risk: any) => {
    let riskName = getString(risk.Hazard || risk.hazardName || risk['Hazard Name'] || '')
    if (!riskName || riskName.includes('_')) {
      riskName = formatHazardName(riskName || risk.hazardId || 'Unknown Risk')
    }
    const riskScore = parseFloat(risk.riskScore || risk['Risk Score'] || 0)
    const likelihood = getString(risk.likelihood || risk.Likelihood || '')
    const impact = getString(risk.impact || risk.Impact || '')
    const reasoning = getString(risk.reasoning || '')
    const severity = getSeverityColor(riskScore)

    // Risk card header with colored badge
    paragraphs.push(new Paragraph({
      spacing: { before: 250, after: 100 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 8, color: COLORS.gray[300] },
        left: { style: BorderStyle.SINGLE, size: 24, color: severity.text },
        bottom: { style: BorderStyle.SINGLE, size: 8, color: COLORS.gray[300] },
        right: { style: BorderStyle.SINGLE, size: 8, color: COLORS.gray[300] }
      },
      shading: { fill: 'ffffff', type: ShadingType.CLEAR },
      indent: { left: 200 },
      children: [
        new TextRun({ text: severity.label, bold: true, size: 18, color: 'ffffff', font: 'Calibri', shading: { fill: severity.text, type: ShadingType.CLEAR } }),
        new TextRun({ text: `  ${riskName}`, bold: true, size: 24, color: COLORS.gray[900], font: 'Calibri' }),
        new TextRun({ text: `          Risk Score: `, size: 20, color: COLORS.gray[500], font: 'Calibri' }),
        new TextRun({ text: `${riskScore.toFixed(1)}`, bold: true, size: 28, color: severity.text, font: 'Calibri' }),
        new TextRun({ text: ' out of 10', size: 18, color: COLORS.gray[500], font: 'Calibri' })
      ]
    }))

    // Metrics row
    paragraphs.push(new Paragraph({
      indent: { left: 400 },
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Likelihood: ', bold: true, size: 18, color: COLORS.gray[700], font: 'Calibri' }),
        new TextRun({ text: likelihood || 'N/A', size: 18, color: COLORS.gray[600], font: 'Calibri' }),
        new TextRun({ text: '    Impact: ', bold: true, size: 18, color: COLORS.gray[700], font: 'Calibri' }),
        new TextRun({ text: impact || 'N/A', size: 18, color: COLORS.gray[600], font: 'Calibri' })
      ]
    }))

    // Reasoning
    if (reasoning) {
      paragraphs.push(new Paragraph({
        indent: { left: 400 },
        spacing: { after: 150 },
        children: [new TextRun({ text: reasoning, size: 18, color: COLORS.gray[600], italics: true, font: 'Calibri' })]
      }))
    }
  })

  return paragraphs
}

// =============================================================================
// STRATEGY SECTION (Enhanced)
// =============================================================================

function createStrategySection(strategy: any, index: number, locale: Locale): Paragraph[] {
  const name = getString(strategy.smeTitle || strategy.name || `Strategy ${index}`)
  const description = getString(strategy.smeSummary || strategy.description || '')
  const cost = strategy.calculatedCostLocal || 0
  const currencySymbol = strategy.currencySymbol || '$'
  const timeline = getString(strategy.implementationTime || strategy.timeline || '')
  const applicableRisks = strategy.applicableRisks || []

  const paragraphs: Paragraph[] = []

  // Strategy header with number badge
  paragraphs.push(new Paragraph({
    spacing: { before: 400, after: 100 },
    shading: { fill: COLORS.gray[100], type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 24, color: COLORS.secondary } },
    indent: { left: 200 },
    children: [
      new TextRun({ text: `#${index}  `, bold: true, size: 22, color: 'ffffff', font: 'Calibri', shading: { fill: COLORS.secondary, type: ShadingType.CLEAR } }),
      new TextRun({ text: '  ' + name, bold: true, size: 24, color: COLORS.gray[900], font: 'Calibri' }),
      cost > 0 ? new TextRun({ text: `          Investment: ${currencySymbol}${cost.toLocaleString()}`, bold: true, size: 22, color: COLORS.success, font: 'Calibri' }) : new TextRun({})
    ]
  }))

  // Description
  if (description) {
    paragraphs.push(new Paragraph({
      spacing: { after: 150 },
      children: [new TextRun({ text: description, size: 20, color: COLORS.gray[700], font: 'Calibri' })]
    }))
  }

  // Timeline and Protects Against
  if (timeline || applicableRisks.length > 0) {
    const parts: TextRun[] = []
    if (timeline) {
      parts.push(new TextRun({ text: 'Timeline: ', bold: true, size: 18, color: COLORS.gray[700], font: 'Calibri' }))
      parts.push(new TextRun({ text: timeline + '    ', size: 18, color: COLORS.gray[600], font: 'Calibri' }))
    }
    if (applicableRisks.length > 0) {
      parts.push(new TextRun({ text: 'Protects Against: ', bold: true, size: 18, color: COLORS.gray[700], font: 'Calibri' }))
      parts.push(new TextRun({ text: applicableRisks.map((r: string) => formatHazardName(r)).join(', '), size: 18, color: COLORS.secondary, font: 'Calibri' }))
    }
    paragraphs.push(new Paragraph({ spacing: { after: 150 }, children: parts }))
  }

  // Items to Purchase
  const costItems = collectCostItems(strategy)
  if (costItems.length > 0) {
    paragraphs.push(new Paragraph({
      spacing: { before: 100, after: 80 },
      children: [new TextRun({ text: 'Items to Purchase:', bold: true, size: 20, color: COLORS.gray[900], font: 'Calibri' })]
    }))
    costItems.forEach((item: any) => {
      const qty = item.quantity > 1 ? `${item.quantity}x ` : ''
      paragraphs.push(new Paragraph({
        numbering: { reference: 'bullet-list', level: 0 },
        spacing: { after: 40 },
        children: [new TextRun({ text: `${qty}${item.name}`, size: 20, font: 'Calibri' })]
      }))
    })
  }

  // Key Actions
  const actionSteps = strategy.actionSteps || []
  if (actionSteps.length > 0) {
    paragraphs.push(new Paragraph({
      spacing: { before: 150, after: 80 },
      children: [new TextRun({ text: 'Key Actions:', bold: true, size: 20, color: COLORS.gray[900], font: 'Calibri' })]
    }))

    actionSteps.forEach((step: any) => {
      const stepTitle = getString(step.smeAction || step.title || step.description || 'Action step')
      const timeframe = getString(step.timeframe || step.estimatedTime || '')
      paragraphs.push(new Paragraph({
        indent: { left: 400 },
        spacing: { after: 60 },
        children: [
          new TextRun({ text: '→ ', size: 20, color: COLORS.secondary, font: 'Calibri' }),
          new TextRun({ text: stepTitle, size: 20, font: 'Calibri' }),
          timeframe ? new TextRun({ text: ` (${timeframe})`, size: 18, color: COLORS.gray[500], font: 'Calibri' }) : new TextRun({})
        ]
      }))
    })
  }

  return paragraphs
}

function collectCostItems(strategy: any): { name: string; quantity: number }[] {
  const itemMap = new Map<string, { name: string; quantity: number }>()
  strategy.actionSteps?.forEach((step: any) => {
    const costItems = step.costItems || step.itemCosts || []
    costItems.forEach((costItem: any) => {
      const itemName = getString(costItem.item?.name || costItem.costItem?.name || costItem.name || costItem.itemId || 'Item')
      const quantity = costItem.quantity || 1
      const key = itemName.toLowerCase()
      if (itemMap.has(key)) {
        itemMap.get(key)!.quantity += quantity
      } else {
        itemMap.set(key, { name: itemName, quantity })
      }
    })
  })
  return Array.from(itemMap.values())
}

// =============================================================================
// EMERGENCY SERVICES CARDS
// =============================================================================

function createEmergencyServicesCards(contacts: any[]): Paragraph[] {
  if (!contacts || contacts.length === 0) {
    return [new Paragraph({ children: [new TextRun({ text: 'No emergency services listed.', size: 22, italics: true })] })]
  }

  const paragraphs: Paragraph[] = []
  contacts.forEach((contact: any) => {
    const serviceType = getString(contact['Service Type'] || contact.serviceType || 'Service')
    const orgName = getString(contact['Organization Name'] || contact.organizationName || contact.provider || '')
    const phone = getString(contact['Phone Number'] || contact.phoneNumber || contact.phone || '')

    paragraphs.push(new Paragraph({
      spacing: { before: 100, after: 60 },
      shading: { fill: COLORS.gray[100], type: ShadingType.CLEAR },
      border: { left: { style: BorderStyle.SINGLE, size: 16, color: COLORS.danger } },
      indent: { left: 200 },
      children: [
        new TextRun({ text: serviceType, bold: true, size: 22, color: COLORS.gray[900], font: 'Calibri' })
      ]
    }))
    if (orgName) {
      paragraphs.push(new Paragraph({
        indent: { left: 400 },
        children: [new TextRun({ text: orgName, size: 20, color: COLORS.gray[600], font: 'Calibri' })]
      }))
    }
    paragraphs.push(new Paragraph({
      indent: { left: 400 },
      spacing: { after: 100 },
      children: [
        new TextRun({ text: '📞 ', size: 20, font: 'Calibri' }),
        new TextRun({ text: phone || 'N/A', bold: true, size: 20, color: COLORS.primary, font: 'Calibri' })
      ]
    }))
  })

  return paragraphs
}

// =============================================================================
// UTILITIES CARDS
// =============================================================================

function createUtilitiesCards(utilities: any[]): Paragraph[] {
  if (!utilities || utilities.length === 0) {
    return [new Paragraph({ children: [new TextRun({ text: 'No utilities listed.', size: 22, italics: true })] })]
  }

  const paragraphs: Paragraph[] = []
  utilities.forEach((util: any) => {
    const service = getString(util.service || util.Service || util['Service Type'] || 'Service')
    const provider = getString(util.provider || util.Provider || util['Organization Name'] || '')
    const phone = getString(util.phone || util.Phone || util['Phone Number'] || '')
    const account = getString(util.accountNumber || util['Account Number'] || util.account || '')
    const email = getString(util.email || util.Email || '')

    paragraphs.push(new Paragraph({
      spacing: { before: 100 },
      shading: { fill: COLORS.gray[50], type: ShadingType.CLEAR },
      children: [
        new TextRun({ text: 'Service: ', bold: true, size: 20, color: COLORS.gray[700], font: 'Calibri' }),
        new TextRun({ text: service, size: 20, color: COLORS.gray[900], font: 'Calibri' }),
        new TextRun({ text: '     Provider: ', bold: true, size: 20, color: COLORS.gray[700], font: 'Calibri' }),
        new TextRun({ text: provider || 'N/A', bold: true, size: 20, color: COLORS.gray[900], font: 'Calibri' })
      ]
    }))
    paragraphs.push(new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: 'Phone: ', size: 18, color: COLORS.gray[600], font: 'Calibri' }),
        new TextRun({ text: phone || 'N/A', size: 18, font: 'Calibri' }),
        account ? new TextRun({ text: `     Account #: ${account}`, size: 18, color: COLORS.gray[600], font: 'Calibri' }) : new TextRun({}),
        email ? new TextRun({ text: `     Email: ${email}`, size: 18, color: COLORS.gray[600], font: 'Calibri' }) : new TextRun({})
      ]
    }))
  })

  return paragraphs
}

// =============================================================================
// VITAL RECORDS SECTION
// =============================================================================

function createVitalRecordsSection(vitalRecords: any[]): Paragraph[] {
  const defaultRecords = [
    { name: 'Financial Records', backup: 'Cloud storage + Accountant office' },
    { name: 'Employee Records', backup: 'Cloud backup + External drive in safe' },
    { name: 'Business Registration and Licenses', backup: 'Cloud storage + Attorney office' },
    { name: 'Insurance Policies', backup: 'Cloud storage + Insurance agent' },
    { name: 'Customer Database', backup: 'Daily automated backups + Weekly offline backup' },
    { name: 'Supplier Contracts', backup: 'Cloud backup' },
    { name: 'Emergency Contact Lists', backup: 'Cloud backup + Printed copies' },
    { name: 'Tax Records', backup: 'Accountant office + Cloud storage' }
  ]

  const records = vitalRecords && vitalRecords.length > 0 ? vitalRecords : defaultRecords
  const paragraphs: Paragraph[] = []

  records.forEach((record: any) => {
    const name = getString(record.name || record['Record Name'] || record.type || 'Record')
    const backup = getString(record.backup || record['Backup Location'] || record.location || 'Not specified')

    paragraphs.push(new Paragraph({
      spacing: { before: 120, after: 40 },
      shading: { fill: COLORS.gray[100], type: ShadingType.CLEAR },
      children: [new TextRun({ text: `📁 ${name}`, bold: true, size: 22, font: 'Calibri' })]
    }))
    paragraphs.push(new Paragraph({
      indent: { left: 400 },
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Backup Location: ', bold: true, size: 18, color: COLORS.gray[600], font: 'Calibri' }),
        new TextRun({ text: backup, size: 18, color: COLORS.gray[700], font: 'Calibri' })
      ]
    }))
  })

  return paragraphs
}

// =============================================================================
// PLAN MAINTENANCE SECTION
// =============================================================================

function createPlanMaintenanceSection(planManager: string, testingSchedule: any[], trainingPrograms: any[]): Paragraph[] {
  const paragraphs: Paragraph[] = []

  paragraphs.push(new Paragraph({
    spacing: { after: 150 },
    children: [new TextRun({
      text: 'We regularly test our preparedness to ensure this plan works when needed. This plan is reviewed quarterly and updated whenever business circumstances change.',
      size: 22, color: COLORS.gray[700], font: 'Calibri'
    })]
  }))

  // Plan Update Triggers
  paragraphs.push(new Paragraph({
    spacing: { before: 150, after: 100 },
    children: [new TextRun({ text: 'Plan Updates When:', bold: true, size: 22, color: COLORS.gray[900], font: 'Calibri' })]
  }))

  const triggers = [
    'We move locations or make major facility changes',
    'Key personnel change',
    'After any actual emergency or disruption',
    'Suppliers, insurance, or banking relationships change',
    'At least once per year regardless of changes'
  ]
  triggers.forEach(trigger => {
    paragraphs.push(new Paragraph({
      numbering: { reference: 'bullet-list', level: 0 },
      spacing: { after: 40 },
      children: [new TextRun({ text: trigger, size: 20, font: 'Calibri' })]
    }))
  })

  // Responsibility
  paragraphs.push(new Paragraph({
    spacing: { before: 150, after: 100 },
    children: [
      new TextRun({ text: 'Responsibility: ', bold: true, size: 20, color: COLORS.gray[700], font: 'Calibri' }),
      new TextRun({ text: `${planManager || 'Plan Manager'} is responsible for ensuring the plan stays current and conducting regular tests.`, size: 20, color: COLORS.gray[700], font: 'Calibri' })
    ]
  }))

  return paragraphs
}

// =============================================================================
// FREQUENCY HELPER
// =============================================================================

function getFrequencyLabel(freq: string, locale: Locale): string {
  if (!freq) return ''
  const lower = freq.toLowerCase()
  if (lower.includes('quarterly')) return getUIText('bcpPreview.formalBcp.frequency.quarterly', locale)
  if (lower.includes('monthly')) return getUIText('bcpPreview.formalBcp.frequency.monthly', locale)
  if (lower.includes('annual')) return getUIText('bcpPreview.formalBcp.frequency.annual', locale)
  if (lower.includes('semi-annual') || lower.includes('semiannual')) return getUIText('bcpPreview.formalBcp.frequency.semiannual', locale)
  if (lower.includes('weekly')) return getUIText('bcpPreview.formalBcp.frequency.weekly', locale)
  if (lower.includes('daily')) return getUIText('bcpPreview.formalBcp.frequency.daily', locale)
  if (lower.includes('scheduled')) return getUIText('bcpPreview.formalBcp.frequency.asScheduled', locale)
  return getString(freq)
}

// =============================================================================
// TESTING SCHEDULE TABLE
// =============================================================================

function createTestingScheduleTable(testingSchedule: any[], locale: Locale): Table {
  const defaultSchedule = [
    { test: 'Tabletop exercise', frequency: 'Quarterly' },
    { test: 'Communication test', frequency: 'Monthly' },
    { test: 'Full simulation', frequency: 'Annual' }
  ]

  const items = testingSchedule && testingSchedule.length > 0 ? testingSchedule : defaultSchedule
  const rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        createHeaderCell(getUIText('bcpPreview.formalBcp.testType', locale), 6000),
        createHeaderCell(getUIText('bcpPreview.formalBcp.frequency', locale), 3360)
      ]
    })
  ]

  items.forEach((item: any, idx: number) => {
    const test = getString(item.test || item.name || item.type || 'Test')
    const freq = getFrequencyLabel(item.frequency || item.schedule || 'As needed', locale)
    const shade = idx % 2 === 1 ? COLORS.gray[50] : undefined

    rows.push(new TableRow({
      children: [
        createTableCell(test, 6000, { shading: shade }),
        createTableCell(freq, 3360, { shading: 'e0f2fe', color: '0369a1', bold: true })
      ]
    }))
  })

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [6000, 3360],
    rows
  })
}

// =============================================================================
// TRAINING PROGRAMS TABLE
// =============================================================================

function createTrainingProgramsTable(trainingPrograms: any[], locale: Locale): Table {
  const defaultPrograms = [
    { program: 'Emergency Procedures', frequency: 'Annual' },
    { program: 'Business Continuity Basics', frequency: 'Semi-annual' }
  ]

  const items = trainingPrograms && trainingPrograms.length > 0 ? trainingPrograms : defaultPrograms
  const rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        createHeaderCell(getUIText('bcpPreview.formalBcp.trainingProgram', locale), 6000),
        createHeaderCell(getUIText('bcpPreview.formalBcp.frequency', locale), 3360)
      ]
    })
  ]

  items.forEach((item: any, idx: number) => {
    const program = getString(item.program || item.name || item.title || 'Training')
    const freq = getFrequencyLabel(item.frequency || item.schedule || 'As scheduled', locale)
    const shade = idx % 2 === 1 ? COLORS.gray[50] : undefined

    rows.push(new TableRow({
      children: [
        createTableCell(program, 6000, { shading: shade }),
        createTableCell(freq, 3360, { shading: 'dcfce7', color: '166534', bold: true })
      ]
    }))
  })

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [6000, 3360],
    rows
  })
}

// =============================================================================
// CONTACT TABLE (Generic)
// =============================================================================

function createContactTable(contacts: any[], headers: string[], fieldKeys: string[], colWidths?: number[]): Table | Paragraph {
  if (!contacts || contacts.length === 0) {
    return new Paragraph({ children: [new TextRun({ text: 'No contacts listed.', size: 22, italics: true, color: COLORS.gray[500] })] })
  }

  const widths = colWidths || (headers.length === 5 ? TABLE_WIDTHS.contacts5 : TABLE_WIDTHS.contacts)
  const rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: headers.map((h, i) => createHeaderCell(h, widths[i]))
    })
  ]

  contacts.forEach((contact: any, idx: number) => {
    const rowShading = idx % 2 === 1 ? COLORS.gray[50] : undefined
    rows.push(new TableRow({
      children: fieldKeys.map((key, i) => {
        let value = contact[key] || contact[key.toLowerCase()] || ''
        if (!value) {
          const altKeys = [key.replace(/\s/g, ''), key.charAt(0).toLowerCase() + key.slice(1)]
          for (const ak of altKeys) {
            if (contact[ak]) { value = contact[ak]; break }
          }
        }
        return createTableCell(getString(value), widths[i], { shading: rowShading })
      })
    }))
  })

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: widths,
    rows
  })
}

// =============================================================================
// SIGNATURE BLOCK
// =============================================================================

function createSignatureBlock(name: string, date: string): Table {
  const lineCell = (label: string, value: string) => new TableCell({
    width: { size: 4680, type: WidthType.DXA },
    borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
    children: [
      new Paragraph({ spacing: { after: 800 } }),
      new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: COLORS.gray[900] } } }),
      new Paragraph({
        spacing: { before: 100 },
        children: [
          new TextRun({ text: value || '                    ', size: 22, font: 'Calibri' }),
          new TextRun({ text: `  (${label})`, size: 18, color: COLORS.gray[500], font: 'Calibri' })
        ]
      })
    ]
  })

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: TABLE_WIDTHS.twoCol,
    rows: [new TableRow({ children: [lineCell('Plan Manager', name), lineCell('Date', date)] })]
  })
}

// =============================================================================
// MAIN EXPORT FUNCTIONS
// =============================================================================

export function buildWordDocument(options: WordExportOptions): Document {
  return options.mode === 'formal'
    ? generateFormalBCPDocument(options)
    : generateWorkbookDocument(options)
}

export async function buildWordBuffer(options: WordExportOptions): Promise<Buffer> {
  const doc = buildWordDocument(options)
  return await Packer.toBuffer(doc)
}

// =============================================================================
// FORMAL BCP DOCUMENT
// =============================================================================

function generateFormalBCPDocument(options: WordExportOptions): Document {
  const { formData, strategies, locale } = options

  // Extract all data
  const businessName = formData.PLAN_INFORMATION?.['Company Name'] || formData.BUSINESS_PROFILE?.['Business Name'] || 'Business Name'
  const businessAddress = formData.PLAN_INFORMATION?.['Business Address'] || formData.BUSINESS_OVERVIEW?.['Business Address'] || ''
  const planManager = formData.PLAN_INFORMATION?.['Plan Manager'] || ''
  const businessType = getString(formData.BUSINESS_PROFILE?.['Business Type'] || formData.BUSINESS_OVERVIEW?.['Business Type'] || '')
  const businessPurpose = getString(formData.BUSINESS_OVERVIEW?.['Business Purpose'] || '')
  const keyStrengths = getString(formData.BUSINESS_OVERVIEW?.['Key Strengths'] || '')
  const essentialOperations = getString(formData.BUSINESS_OVERVIEW?.['Essential Operations'] || '')
  const yearsInOperation = getString(formData.BUSINESS_PROFILE?.['Years in Operation'] || '')
  const annualRevenue = getString(formData.BUSINESS_PROFILE?.['Annual Revenue'] || '')
  const totalPeople = formData.BUSINESS_OVERVIEW?.['Total People in Business'] || ''

  const currentDate = new Date().toLocaleDateString(
    locale === 'es' ? 'es-ES' : locale === 'fr' ? 'fr-FR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  const riskMatrix = formData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || []
  const emergencyContacts = formData.EMERGENCY_CONTACTS?.['Emergency Services'] || formData.CONTACTS_AND_INFORMATION?.['Emergency Services and Utilities'] || []
  const staffContacts = formData.EMERGENCY_CONTACTS?.['Staff Contact List'] || formData.CONTACTS_AND_INFORMATION?.['Staff Contact Information'] || []
  const utilities = formData.EMERGENCY_CONTACTS?.['Utilities & Essential Services'] || formData.CONTACTS_AND_INFORMATION?.['Emergency Services and Utilities'] || []
  const suppliers = formData.SUPPLIER_DIRECTORY || formData.SUPPLIERS || formData.CONTACTS_AND_INFORMATION?.['Supplier Information'] || []
  const vitalRecords = formData.VITAL_RECORDS?.['Vital Records Inventory'] || formData.VITAL_RECORDS?.['Records Inventory'] || []

  const planManagerPhone = formData.PLAN_INFORMATION?.['Plan Manager Phone'] || formData.PLAN_INFORMATION?.['Contact Phone'] || formData.PLAN_INFORMATION?.['Phone'] || ''
  const planManagerEmail = formData.PLAN_INFORMATION?.['Plan Manager Email'] || formData.PLAN_INFORMATION?.['Contact Email'] || formData.PLAN_INFORMATION?.['Email'] || ''

  const testingSchedule = formData.TESTING_AND_MAINTENANCE?.['Plan Testing Schedule'] || formData.TESTING_AND_MAINTENANCE?.['Testing Schedule'] || formData.TESTING?.['Testing Schedule'] || []
  const trainingPrograms = formData.TESTING_AND_MAINTENANCE?.['Training Schedule'] || formData.TESTING_AND_MAINTENANCE?.['Training Programs'] || formData.TESTING?.['Training Programs'] || []

  return new Document({
    styles: {
      default: { document: { run: { font: 'Calibri', size: 22 } } },
      paragraphStyles: [
        { id: 'Normal', name: 'Normal', run: { font: 'Calibri', size: 22 }, paragraph: { spacing: { after: 120 } } }
      ]
    },
    numbering: { config: buildNumberingConfig(strategies.length) },
    sections: [
      // COVER PAGE
      {
        properties: { page: { margin: { top: convertInchesToTwip(2), right: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1) } } },
        children: [
          new Paragraph({ spacing: { after: 1500 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'BUSINESS CONTINUITY PLAN', size: 24, color: COLORS.gray[500], font: 'Calibri', characterSpacing: 60 })]
          }),
          new Paragraph({ spacing: { after: 400 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'FORMAL BCP', size: 72, bold: true, color: COLORS.primary, font: 'Calibri' })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 24, color: COLORS.secondary } }
          }),
          new Paragraph({ spacing: { after: 600 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: businessName, size: 44, bold: true, color: COLORS.gray[900], font: 'Calibri' })]
          }),
          businessAddress ? new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
            children: [new TextRun({ text: businessAddress, size: 24, color: COLORS.gray[500], font: 'Calibri' })]
          }) : new Paragraph({}),
          new Paragraph({ spacing: { after: 1500 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `Prepared: ${currentDate}`, size: 22, color: COLORS.gray[700], font: 'Calibri' })]
          }),
          planManager ? new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100 },
            children: [new TextRun({ text: `Plan Manager: ${planManager}`, size: 22, color: COLORS.gray[700], font: 'Calibri' })]
          }) : new Paragraph({}),
          new Paragraph({ spacing: { after: 800 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Version 1.0 | Confidential', size: 20, color: COLORS.gray[500], font: 'Calibri' })]
          }),
          new Paragraph({ children: [new PageBreak()] })
        ]
      },
      // MAIN CONTENT
      {
        properties: { page: { margin: { top: convertInchesToTwip(1), right: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1) } } },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: `${businessName} - Business Continuity Plan`, size: 18, color: COLORS.gray[500], font: 'Calibri' })]
            })]
          })
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'Page ', size: 18, font: 'Calibri' }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, font: 'Calibri' })
              ]
            })]
          })
        },
        children: [
          // Section 1: Business Overview
          createSectionHeader('1', 'Business Overview'),
          createSubsectionHeader('1.1 Business Information'),
          createInfoTable([
            ['Business Name', businessName],
            ['Physical Address', businessAddress],
            ['Business Type', businessType],
            ['Years in Operation', yearsInOperation],
            ['Annual Revenue', annualRevenue],
            ['Total People', String(totalPeople)]
          ]),
          businessPurpose ? new Paragraph({
            spacing: { before: 200, after: 150 },
            children: [
              new TextRun({ text: 'Business Purpose: ', bold: true, size: 22, font: 'Calibri' }),
              new TextRun({ text: businessPurpose, size: 22, font: 'Calibri' })
            ]
          }) : new Paragraph({}),
          keyStrengths ? new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({ text: 'Key Strengths: ', bold: true, size: 22, font: 'Calibri' }),
              new TextRun({ text: keyStrengths, size: 22, font: 'Calibri' })
            ]
          }) : new Paragraph({}),
          essentialOperations ? new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({ text: 'Essential Operations: ', bold: true, size: 22, font: 'Calibri' }),
              new TextRun({ text: essentialOperations, size: 22, font: 'Calibri' })
            ]
          }) : new Paragraph({}),
          new Paragraph({ children: [new PageBreak()] }),

          // Section 2: Risk Assessment
          createSectionHeader('2', 'Risk Assessment'),
          new Paragraph({
            spacing: { after: 150 },
            children: [new TextRun({
              text: `We have identified and assessed ${riskMatrix.length} significant risks that could disrupt our business operations.`,
              size: 22, font: 'Calibri'
            })]
          }),
          createSubsectionHeader('2.1 Identified Risks & Mitigation Status'),
          ...createRiskCards(riskMatrix, locale),
          new Paragraph({ children: [new PageBreak()] }),

          // Section 3: Continuity Strategies
          createSectionHeader('3', 'Our Preparation Strategies'),
          new Paragraph({
            spacing: { after: 150 },
            children: [new TextRun({
              text: `These ${strategies.length} strategies were selected based on your business needs, location risks, and operational requirements.`,
              size: 22, color: COLORS.gray[700], font: 'Calibri'
            })]
          }),
          ...strategies.flatMap((strategy, index) => createStrategySection(strategy, index + 1, locale)),
          new Paragraph({ children: [new PageBreak()] }),

          // Section 4: Emergency Response & Contacts
          createSectionHeader('4', 'Emergency Response & Contacts'),
          createSubsectionHeader('4.1 Emergency Leadership'),
          createContactTable(
            [{ Role: 'Plan Manager', Person: planManager || 'Not specified', Contact: [planManagerPhone, planManagerEmail].filter(Boolean).join(' | ') || 'Not specified' }],
            ['Role', 'Person', 'Contact'],
            ['Role', 'Person', 'Contact'],
            [2500, 3430, 3430]
          ),
          createSubsectionHeader('4.2 Staff Contact Roster'),
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: 'Contact information for all team members during emergencies.', size: 20, color: COLORS.gray[600], italics: true, font: 'Calibri' })]
          }),
          createContactTable(staffContacts, ['Name', 'Position', 'Phone', 'Email', 'Emergency Contact'], ['Name', 'Position', 'Phone', 'Email', 'Emergency Contact']),
          createSubsectionHeader('4.3 Emergency Services'),
          ...createEmergencyServicesCards(emergencyContacts),
          createSubsectionHeader('4.4 Utilities & Essential Services'),
          ...createUtilitiesCards(utilities),
          createSubsectionHeader('4.5 Supplier Directory'),
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: `All ${suppliers.length} suppliers listed with complete contact information.`, size: 20, color: COLORS.gray[600], italics: true, font: 'Calibri' })]
          }),
          createContactTable(suppliers, ['Supplier Name', 'Contact Person', 'Product/Service', 'Phone', 'Email'], ['name', 'contact', 'product', 'phone', 'email']),
          new Paragraph({ children: [new PageBreak()] }),

          // Section 5: Vital Records & Data Protection
          createSectionHeader('5', 'Vital Records & Data Protection'),
          new Paragraph({
            spacing: { after: 150 },
            children: [new TextRun({
              text: 'Critical records and data must be protected, backed up regularly, and recoverable quickly to ensure business continuity. The following records are essential to our operations and have established protection and recovery procedures.',
              size: 22, color: COLORS.gray[700], font: 'Calibri'
            })]
          }),
          ...createVitalRecordsSection(vitalRecords),
          new Paragraph({ children: [new PageBreak()] }),

          // Section 6: Plan Maintenance & Testing
          createSectionHeader('6', 'Plan Maintenance & Testing'),
          ...createPlanMaintenanceSection(planManager, testingSchedule, trainingPrograms),
          createSubsectionHeader('6.1 Testing & Exercise Schedule'),
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: 'Scheduled tests to verify preparedness and identify improvements needed.', size: 20, color: COLORS.gray[600], italics: true, font: 'Calibri' })]
          }),
          createTestingScheduleTable(testingSchedule),
          createSubsectionHeader('6.2 Training Programs'),
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: 'Staff training ensures everyone knows their role in emergency response and recovery.', size: 20, color: COLORS.gray[600], italics: true, font: 'Calibri' })]
          }),
          createTrainingProgramsTable(trainingPrograms),
          new Paragraph({ children: [new PageBreak()] }),

          // Section 7: Plan Approval
          createSectionHeader('7', 'Plan Approval'),
          new Paragraph({
            spacing: { before: 200, after: 300 },
            children: [new TextRun({
              text: `This Business Continuity Plan was prepared on ${currentDate} and is approved for implementation:`,
              size: 22, font: 'Calibri'
            })]
          }),
          createSignatureBlock(planManager || 'Plan Manager', currentDate)
        ]
      }
    ]
  })
}

// =============================================================================
// WORKBOOK DOCUMENT
// =============================================================================

function generateWorkbookDocument(options: WordExportOptions): Document {
  const { formData, strategies, locale } = options

  // =============================================================================
  // WORKBOOK-SPECIFIC COLORS (Bold, High-Contrast for Print/Lamination)
  // =============================================================================
  const WB_COLORS = {
    primary: '1d4ed8',      // Bold blue
    before: { bg: 'dbeafe', header: '1d4ed8', text: '1e40af', accent: '3b82f6' },
    during: { bg: 'fef2f2', header: 'dc2626', text: '991b1b', accent: 'ef4444' },
    after: { bg: 'dcfce7', header: '16a34a', text: '166534', accent: '22c55e' },
    emergency: { bg: 'fef2f2', border: 'ef4444', text: '7f1d1d' },
    warning: { bg: 'fef3c7', border: 'd97706', text: '92400e' },
    success: { bg: 'dcfce7', border: '22c55e', text: '166534' },
    gray: { 50: 'f9fafb', 100: 'f3f4f6', 200: 'e5e7eb', 600: '4b5563', 700: '374151', 900: '111827' }
  }

  // =============================================================================
  // DATA EXTRACTION
  // =============================================================================
  const businessName = formData.PLAN_INFORMATION?.['Company Name'] || formData.BUSINESS_PROFILE?.['Business Name'] || 'Your Business'
  const businessAddress = formData.PLAN_INFORMATION?.['Business Address'] || formData.BUSINESS_OVERVIEW?.['Business Address'] || ''
  const planManager = formData.PLAN_INFORMATION?.['Plan Manager'] || 'Plan Manager'
  const planManagerPhone = formData.PLAN_INFORMATION?.['Phone'] || formData.PLAN_INFORMATION?.['Plan Manager Phone'] || ''
  const planManagerEmail = formData.PLAN_INFORMATION?.['Email'] || formData.PLAN_INFORMATION?.['Plan Manager Email'] || ''
  const totalInvestment = strategies.reduce((sum, s) => sum + (s.calculatedCostLocal || 0), 0)
  const currencySymbol = strategies[0]?.currencySymbol || '$'

  const currentDate = new Date().toLocaleDateString(
    locale === 'es' ? 'es-ES' : locale === 'fr' ? 'fr-FR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  // Contacts extraction
  const contactsAndInfo = formData.CONTACTS_AND_INFORMATION || {}
  const emergencyServicesAndUtilities = contactsAndInfo['Emergency Services and Utilities'] || formData.EMERGENCY_CONTACTS?.['Emergency Services'] || []
  const staffContacts = contactsAndInfo['Staff Contact Information'] || formData.EMERGENCY_CONTACTS?.['Staff Contact List'] || []
  const suppliers = contactsAndInfo['Supplier Information'] || formData.SUPPLIER_DIRECTORY || []
  const vitalRecords = formData.VITAL_RECORDS?.['Vital Records Inventory'] || formData.VITAL_RECORDS?.['Records Inventory'] || []

  // Filter contacts by type
  const emergencyContacts = emergencyServicesAndUtilities.filter((c: any) => {
    const type = (c['Service Type'] || c.serviceType || '').toLowerCase()
    return type.includes('police') || type.includes('fire') || type.includes('ambulance') || type.includes('medical') || type.includes('emergency')
  })
  const utilitiesContacts = emergencyServicesAndUtilities.filter((c: any) => {
    const type = (c['Service Type'] || c.serviceType || '').toLowerCase()
    return type.includes('electric') || type.includes('water') || type.includes('internet') || type.includes('gas') || type.includes('utility')
  })
  const insuranceContacts = emergencyServicesAndUtilities.filter((c: any) => {
    const type = (c['Service Type'] || c.serviceType || '').toLowerCase()
    return type.includes('insurance')
  })

  // =============================================================================
  // HELPER: Get step timing
  // =============================================================================
  const getStepTiming = (step: any): 'before' | 'during' | 'after' => {
    if (step.executionTiming === 'before_crisis') return 'before'
    if (step.executionTiming === 'during_crisis') return 'during'
    if (step.executionTiming === 'after_crisis') return 'after'
    const phase = (step.phase || '').toLowerCase()
    if (phase === 'before' || phase === 'immediate' || phase === 'prevention') return 'before'
    if (phase === 'during' || phase === 'response') return 'during'
    if (phase === 'after' || phase === 'recovery') return 'after'
    return 'before'
  }

  // =============================================================================
  // HELPER: Create callout box (Why/Warning/Success)
  // =============================================================================
  const createCalloutBox = (title: string, content: string, colors: { bg: string, border: string, text: string }): Paragraph[] => {
    if (!content) return []
    return [
      new Paragraph({
        spacing: { before: 160, after: 80 },
        indent: { left: 720, right: 360 },
        border: { left: { style: BorderStyle.SINGLE, size: 24, color: colors.border } },
        shading: { fill: colors.bg, type: ShadingType.CLEAR },
        children: [
          new TextRun({ text: title, bold: true, size: 28, color: colors.text, font: 'Arial' })
        ]
      }),
      new Paragraph({
        spacing: { after: 160 },
        indent: { left: 720, right: 360 },
        border: { left: { style: BorderStyle.SINGLE, size: 24, color: colors.border } },
        shading: { fill: colors.bg, type: ShadingType.CLEAR },
        children: [
          new TextRun({ text: content, size: 28, color: colors.text, font: 'Arial' })
        ]
      })
    ]
  }

  // =============================================================================
  // HELPER: Create action step (large, scannable)
  // =============================================================================
  const createActionStep = (step: any, stepNumber: number, phase: 'before' | 'during' | 'after'): Paragraph[] => {
    const paragraphs: Paragraph[] = []
    const phaseColors = WB_COLORS[phase]
    const stepTitle = getString(step.smeAction || step.title || 'Action Step')
    const stepTime = getString(step.timeframe || '')
    const responsibility = getString(step.responsibility || '')
    const whyMatters = getString(step.whyThisStepMatters || '')
    const whatIfSkipped = getString(step.whatHappensIfSkipped || '')
    const howToKnow = getString(step.howToKnowItsDone || '')
    const freeAlt = getString(step.freeAlternative || '')

    // Main step with large checkbox
    paragraphs.push(new Paragraph({
      spacing: { before: 320, after: 160 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: '☐ ', size: 36, color: phaseColors.accent, font: 'Arial' }),
        new TextRun({ text: `${stepNumber}. `, bold: true, size: 32, color: '000000', font: 'Arial' }),
        new TextRun({ text: stepTitle, bold: true, size: 32, color: phaseColors.text, font: 'Arial' })
      ]
    }))

    // Timeframe and Responsibility
    if (stepTime || responsibility) {
      paragraphs.push(new Paragraph({
        spacing: { after: 160 },
        indent: { left: 720 },
        children: [
          stepTime ? new TextRun({ text: `⏱️ ${stepTime}`, size: 28, color: WB_COLORS.gray[600], font: 'Arial' }) : new TextRun({}),
          stepTime && responsibility ? new TextRun({ text: '   •   ', size: 28, color: WB_COLORS.gray[200], font: 'Arial' }) : new TextRun({}),
          responsibility ? new TextRun({ text: `👤 ${responsibility}`, size: 28, color: WB_COLORS.gray[600], font: 'Arial' }) : new TextRun({})
        ]
      }))
    }

    // Why This Matters
    paragraphs.push(...createCalloutBox('💡 Why This Matters:', whyMatters, { bg: phaseColors.bg, border: phaseColors.accent, text: phaseColors.text }))

    // If Skipped warning
    paragraphs.push(...createCalloutBox('⚠️ If Skipped:', whatIfSkipped, WB_COLORS.warning))

    // Done When
    paragraphs.push(...createCalloutBox('✅ Done When:', howToKnow, WB_COLORS.success))

    // Free Alternative
    if (freeAlt) {
      paragraphs.push(...createCalloutBox('💰 Free/Low-Cost Option:', freeAlt, { bg: 'ecfdf5', border: '10b981', text: '065f46' }))
    }

    return paragraphs
  }

  // =============================================================================
  // HELPER: Create phase header
  // =============================================================================
  const createPhaseHeader = (phase: 'before' | 'during' | 'after', forcePageBreak: boolean = false): Paragraph => {
    const config = {
      before: { icon: '🔧', text: 'BEFORE: PREPARATION', color: WB_COLORS.before.header },
      during: { icon: '🚨', text: 'DURING: EMERGENCY RESPONSE', color: WB_COLORS.during.header },
      after: { icon: '🔄', text: 'AFTER: RECOVERY', color: WB_COLORS.after.header }
    }
    const cfg = config[phase]
    return new Paragraph({
      pageBreakBefore: forcePageBreak,
      shading: { fill: cfg.color, type: ShadingType.CLEAR },
      spacing: { before: 480, after: 320 },
      children: [
        new TextRun({ text: `${cfg.icon} ${cfg.text}`, bold: true, size: 36, color: 'ffffff', font: 'Arial' })
      ]
    })
  }

  // =============================================================================
  // HELPER: Create phase description
  // =============================================================================
  const createPhaseDescription = (phase: 'before' | 'during' | 'after'): Paragraph => {
    const descriptions = {
      before: 'Complete these actions NOW to prepare for potential emergencies',
      during: 'Follow these steps IMMEDIATELY when an emergency occurs',
      after: 'Use these steps to restore operations after the emergency passes'
    }
    return new Paragraph({
      spacing: { after: 320 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: descriptions[phase], size: 28, italics: true, color: WB_COLORS.gray[600], font: 'Arial' })
      ]
    })
  }

  // =============================================================================
  // HELPER: Create strategy section (with smart page breaks)
  // =============================================================================
  const createStrategySection = (strategy: any, index: number): Paragraph[] => {
    const paragraphs: Paragraph[] = []
    const name = getString(strategy.smeTitle || strategy.name || 'Strategy')
    const description = getString(strategy.smeSummary || strategy.description || '')
    const cost = strategy.calculatedCostLocal || 0

    // Get steps by phase
    const beforeSteps = (strategy.actionSteps || []).filter((s: any) => getStepTiming(s) === 'before')
    const duringSteps = (strategy.actionSteps || []).filter((s: any) => getStepTiming(s) === 'during')
    const afterSteps = (strategy.actionSteps || []).filter((s: any) => getStepTiming(s) === 'after')

    // Strategy header - ALWAYS starts new page
    paragraphs.push(new Paragraph({
      pageBreakBefore: true,
      shading: { fill: WB_COLORS.primary, type: ShadingType.CLEAR },
      spacing: { after: 240 },
      children: [
        new TextRun({ text: `🛡️ STRATEGY ${index}: ${name.toUpperCase()}`, bold: true, size: 44, color: 'ffffff', font: 'Arial' })
      ]
    }))

    // Investment badge
    if (cost > 0) {
      paragraphs.push(new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun({ text: '💰 Investment: ', bold: true, size: 32, color: WB_COLORS.gray[600], font: 'Arial' }),
          new TextRun({ text: `${currencySymbol}${cost.toLocaleString()}`, bold: true, size: 32, color: '16a34a', font: 'Arial' })
        ]
      }))
    }

    // Description
    if (description) {
      paragraphs.push(new Paragraph({
        spacing: { after: 480, line: 276 },
        children: [
          new TextRun({ text: description, size: 28, color: WB_COLORS.gray[700], font: 'Arial' })
        ]
      }))
    }

    // BEFORE phase
    if (beforeSteps.length > 0) {
      paragraphs.push(createPhaseHeader('before'))
      paragraphs.push(createPhaseDescription('before'))
      beforeSteps.forEach((step: any, i: number) => {
        paragraphs.push(...createActionStep(step, i + 1, 'before'))
      })
    }

    // DURING phase - page break if BEFORE was long
    if (duringSteps.length > 0) {
      const needsPageBreak = beforeSteps.length > 2
      paragraphs.push(createPhaseHeader('during', needsPageBreak))
      paragraphs.push(createPhaseDescription('during'))
      duringSteps.forEach((step: any, i: number) => {
        paragraphs.push(...createActionStep(step, i + 1, 'during'))
      })
    }

    // AFTER phase - page break if DURING was long
    if (afterSteps.length > 0) {
      const needsPageBreak = duringSteps.length > 2
      paragraphs.push(createPhaseHeader('after', needsPageBreak))
      paragraphs.push(createPhaseDescription('after'))
      afterSteps.forEach((step: any, i: number) => {
        paragraphs.push(...createActionStep(step, i + 1, 'after'))
      })
    }

    return paragraphs
  }

  // =============================================================================
  // HELPER: Create contact table with colored header
  // =============================================================================
  const createContactTable = (contacts: any[], headers: string[], fieldKeys: string[], headerColor: string): Table | Paragraph => {
    if (!contacts || contacts.length === 0) {
      return new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun({ text: 'No contacts listed. Add contacts to your plan.', size: 28, italics: true, color: WB_COLORS.gray[600], font: 'Arial' })]
      })
    }
    const colWidth = Math.floor(TABLE_WIDTH / headers.length)
    return new Table({
      width: { size: TABLE_WIDTH, type: WidthType.DXA },
      layout: TableLayoutType.FIXED,
      columnWidths: headers.map(() => colWidth),
      rows: [
        new TableRow({
          tableHeader: true,
          children: headers.map(h => new TableCell({
            width: { size: colWidth, type: WidthType.DXA },
            borders: cellBorders,
            shading: { fill: headerColor, type: ShadingType.CLEAR },
            children: [new Paragraph({
              children: [new TextRun({ text: h, bold: true, size: 28, color: 'ffffff', font: 'Arial' })]
            })]
          }))
        }),
        ...contacts.map((c: any, idx: number) => new TableRow({
          children: fieldKeys.map((k) => {
            const val = getString(c[k] || c[k.toLowerCase()] || c[k.replace(/\s/g, '')] || '')
            return new TableCell({
              width: { size: colWidth, type: WidthType.DXA },
              borders: cellBorders,
              shading: idx % 2 === 1 ? { fill: WB_COLORS.gray[50], type: ShadingType.CLEAR } : undefined,
              children: [new Paragraph({
                children: [new TextRun({ text: val || '—', size: 26, font: 'Arial' })]
              })]
            })
          })
        }))
      ]
    })
  }

  // =============================================================================
  // BUILD DOCUMENT
  // =============================================================================
  return new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 28 } } } },
    numbering: { config: buildNumberingConfig(strategies.length) },
    sections: [
      // =========================================================================
      // COVER PAGE
      // =========================================================================
      {
        properties: {
          page: {
            margin: { top: convertInchesToTwip(0.75), right: convertInchesToTwip(0.75), bottom: convertInchesToTwip(0.75), left: convertInchesToTwip(0.75) }
          }
        },
        children: [
          // Title section
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 160 },
            children: [new TextRun({ text: 'BUSINESS CONTINUITY', size: 32, color: WB_COLORS.primary, font: 'Arial' })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 320 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 24, color: WB_COLORS.primary } },
            children: [new TextRun({ text: 'ACTION WORKBOOK', bold: true, size: 80, color: WB_COLORS.gray[900], font: 'Arial' })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 320 },
            children: [new TextRun({ text: businessName, bold: true, size: 48, color: WB_COLORS.primary, font: 'Arial' })]
          }),
          businessAddress ? new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 480 },
            children: [new TextRun({ text: businessAddress, size: 28, color: WB_COLORS.gray[600], font: 'Arial' })]
          }) : new Paragraph({ spacing: { after: 480 } }),

          // EMERGENCY CONTACTS BOX (Fixed with Table)
          new Table({
            width: { size: TABLE_WIDTH, type: WidthType.DXA },
            rows: [
              // Header
              new TableRow({
                children: [new TableCell({
                  shading: { fill: WB_COLORS.emergency.bg, type: ShadingType.CLEAR },
                  borders: { top: { style: BorderStyle.SINGLE, size: 24, color: WB_COLORS.emergency.border }, left: { style: BorderStyle.SINGLE, size: 24, color: WB_COLORS.emergency.border }, right: { style: BorderStyle.SINGLE, size: 24, color: WB_COLORS.emergency.border }, bottom: { style: BorderStyle.SINGLE, size: 6, color: WB_COLORS.emergency.border } },
                  children: [new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 120, after: 120 },
                    children: [new TextRun({ text: '🚨 EMERGENCY CONTACTS', bold: true, size: 40, color: WB_COLORS.emergency.text, font: 'Arial' })]
                  })]
                })]
              }),
              // Contacts List
              new TableRow({
                children: [new TableCell({
                  shading: { fill: WB_COLORS.emergency.bg, type: ShadingType.CLEAR },
                  borders: { left: { style: BorderStyle.SINGLE, size: 24, color: WB_COLORS.emergency.border }, right: { style: BorderStyle.SINGLE, size: 24, color: WB_COLORS.emergency.border }, bottom: { style: BorderStyle.SINGLE, size: 6, color: WB_COLORS.emergency.border } },
                  children: [
                    ...emergencyContacts.slice(0, 3).map((c: any) => new Paragraph({
                      indent: { left: 400, right: 400 },
                      spacing: { after: 80 },
                      children: [
                        new TextRun({ text: `${getString(c['Service Type'] || 'Emergency')}: `, bold: true, size: 32, font: 'Arial' }),
                        new TextRun({ text: getString(c['Phone Number'] || '___-___-____'), size: 32, font: 'Courier New' })
                      ]
                    })),
                    new Paragraph({
                      indent: { left: 400, right: 400 },
                      spacing: { before: 80, after: 120 },
                      children: [
                        new TextRun({ text: `Plan Manager (${planManager}): `, bold: true, size: 32, font: 'Arial' }),
                        new TextRun({ text: planManagerPhone || planManagerEmail || '___-___-____', size: 32, font: 'Courier New' })
                      ]
                    })
                  ]
                })]
              }),
              // Warning Footer
              new TableRow({
                children: [new TableCell({
                  shading: { fill: WB_COLORS.warning.bg, type: ShadingType.CLEAR },
                  borders: { top: { style: BorderStyle.SINGLE, size: 6, color: WB_COLORS.warning.border }, left: { style: BorderStyle.SINGLE, size: 24, color: WB_COLORS.emergency.border }, right: { style: BorderStyle.SINGLE, size: 24, color: WB_COLORS.emergency.border }, bottom: { style: BorderStyle.SINGLE, size: 24, color: WB_COLORS.emergency.border } },
                  children: [new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 120, after: 120 },
                    children: [new TextRun({ text: '⚠️ IF EMERGENCY IN PROGRESS → TURN TO PAGE 2', bold: true, size: 32, color: WB_COLORS.warning.text, font: 'Arial' })]
                  })]
                })]
              })
            ]
          }),

          // What's Inside
          new Paragraph({
            spacing: { before: 480, after: 240 },
            children: [new TextRun({ text: '📋 What\'s Inside:', bold: true, size: 32, color: WB_COLORS.gray[900], font: 'Arial' })]
          }),
          ...['1. Quick Reference Guide - Emergency decision flowchart',
            '2. Risk & Strategy Action Plans - BEFORE, DURING & AFTER steps',
            '3. Contact Directory - All key contacts in one place',
            '4. Document Locator - Where to find critical records'
          ].map((item, i) => new Paragraph({
            spacing: { after: 120 },
            indent: { left: 360 },
            children: [new TextRun({ text: item, size: 28, font: 'Arial' })]
          })),

          // Footer info
          new Paragraph({ spacing: { after: 480 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Plan Manager: ', bold: true, size: 24, color: WB_COLORS.gray[700], font: 'Arial' }),
              new TextRun({ text: planManager || 'Not specified', size: 24, font: 'Arial' }),
              new TextRun({ text: '     Date: ', bold: true, size: 24, color: WB_COLORS.gray[700], font: 'Arial' }),
              new TextRun({ text: currentDate, size: 24, font: 'Arial' })
            ]
          }),
          new Paragraph({ children: [new PageBreak()] })
        ]
      },

      // =========================================================================
      // QUICK REFERENCE GUIDE
      // =========================================================================
      {
        children: [
          new Paragraph({
            shading: { fill: 'fee2e2', type: ShadingType.CLEAR },
            border: { top: { style: BorderStyle.SINGLE, size: 24, color: WB_COLORS.during.header }, bottom: { style: BorderStyle.SINGLE, size: 24, color: WB_COLORS.during.header } },
            alignment: AlignmentType.CENTER,
            spacing: { after: 320 },
            children: [new TextRun({ text: '⚡ QUICK REFERENCE GUIDE', bold: true, size: 44, color: '991b1b', font: 'Arial' })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 480 },
            children: [new TextRun({ text: 'Use this page when an emergency is happening NOW', size: 28, color: WB_COLORS.during.header, font: 'Arial' })]
          }),

          // Step 1
          new Paragraph({
            shading: { fill: 'fee2e2', type: ShadingType.CLEAR },
            border: { left: { style: BorderStyle.SINGLE, size: 24, color: WB_COLORS.during.header } },
            spacing: { before: 240 },
            children: [new TextRun({ text: '1️⃣  ENSURE SAFETY FIRST', bold: true, size: 32, color: '991b1b', font: 'Arial' })]
          }),
          new Paragraph({ indent: { left: 600 }, children: [new TextRun({ text: '▶ Evacuate if building is unsafe (fire, structural damage, flooding)', size: 28, font: 'Arial' })] }),
          new Paragraph({ indent: { left: 600 }, children: [new TextRun({ text: '▶ Account for all staff and visitors', size: 28, font: 'Arial' })] }),
          new Paragraph({ indent: { left: 600 }, spacing: { after: 240 }, children: [new TextRun({ text: '▶ Call emergency services if anyone is injured', size: 28, font: 'Arial' })] }),

          // Step 2
          new Paragraph({
            shading: { fill: 'ffedd5', type: ShadingType.CLEAR },
            border: { left: { style: BorderStyle.SINGLE, size: 24, color: 'ea580c' } },
            spacing: { before: 240 },
            children: [new TextRun({ text: '2️⃣  ASSESS THE SITUATION', bold: true, size: 32, color: 'c2410c', font: 'Arial' })]
          }),
          new Paragraph({ indent: { left: 600 }, children: [new TextRun({ text: '▶ What type of emergency is this?', size: 28, font: 'Arial' })] }),
          new Paragraph({ indent: { left: 600 }, children: [new TextRun({ text: '▶ Can business operations continue safely?', size: 28, font: 'Arial' })] }),
          new Paragraph({ indent: { left: 600 }, spacing: { after: 240 }, children: [new TextRun({ text: '▶ What resources are compromised? (power, water, equipment, data)', size: 28, font: 'Arial' })] }),

          // Step 3
          new Paragraph({
            shading: { fill: 'fef9c3', type: ShadingType.CLEAR },
            border: { left: { style: BorderStyle.SINGLE, size: 24, color: WB_COLORS.warning.border } },
            spacing: { before: 240 },
            children: [new TextRun({ text: '3️⃣  ACTIVATE RESPONSE PLAN', bold: true, size: 32, color: '92400e', font: 'Arial' })]
          }),
          new Paragraph({
            indent: { left: 600 }, children: [
              new TextRun({ text: `▶ Notify Plan Manager: `, size: 28, font: 'Arial' }),
              new TextRun({ text: `${planManager} - ${planManagerPhone || planManagerEmail}`, bold: true, size: 28, font: 'Arial' })
            ]
          }),
          new Paragraph({ indent: { left: 600 }, children: [new TextRun({ text: '▶ Alert staff using contact list (see Contact Directory)', size: 28, font: 'Arial' })] }),
          new Paragraph({ indent: { left: 600 }, spacing: { after: 240 }, children: [new TextRun({ text: '▶ Turn to specific RISK section for detailed DURING/AFTER actions', size: 28, font: 'Arial' })] }),

          // Step 4
          new Paragraph({
            shading: { fill: 'dbeafe', type: ShadingType.CLEAR },
            border: { left: { style: BorderStyle.SINGLE, size: 24, color: WB_COLORS.before.header } },
            spacing: { before: 240 },
            children: [new TextRun({ text: '4️⃣  PROTECT CRITICAL OPERATIONS', bold: true, size: 32, color: '1e40af', font: 'Arial' })]
          }),
          new Paragraph({ indent: { left: 600 }, children: [new TextRun({ text: '▶ Secure vital records and backup data (see Document Locator)', size: 28, font: 'Arial' })] }),
          new Paragraph({ indent: { left: 600 }, children: [new TextRun({ text: '▶ Contact insurance provider immediately', size: 28, font: 'Arial' })] }),
          new Paragraph({ indent: { left: 600 }, spacing: { after: 320 }, children: [new TextRun({ text: '▶ Document all damage with photos/videos for insurance claims', size: 28, font: 'Arial' })] }),

          new Paragraph({ children: [new PageBreak()] })
        ]
      },

      // =========================================================================
      // STRATEGY SECTIONS (BEFORE / DURING / AFTER)
      // =========================================================================
      {
        properties: {
          page: {
            margin: { top: convertInchesToTwip(0.75), right: convertInchesToTwip(0.5), bottom: convertInchesToTwip(0.75), left: convertInchesToTwip(0.5) }
          }
        },
        children: strategies.flatMap((s, i) => createStrategySection(s, i + 1))
      },

      // =========================================================================
      // CONTACT DIRECTORY
      // =========================================================================
      {
        children: [
          new Paragraph({
            pageBreakBefore: true,
            shading: { fill: 'dcfce7', type: ShadingType.CLEAR },
            border: { top: { style: BorderStyle.SINGLE, size: 24, color: WB_COLORS.success.border }, bottom: { style: BorderStyle.SINGLE, size: 24, color: WB_COLORS.success.border } },
            alignment: AlignmentType.CENTER,
            spacing: { after: 320 },
            children: [new TextRun({ text: '📞 CONTACT DIRECTORY', bold: true, size: 44, color: '166534', font: 'Arial' })]
          }),

          // Emergency Services
          new Paragraph({
            shading: { fill: WB_COLORS.during.header, type: ShadingType.CLEAR },
            spacing: { before: 320, after: 160 },
            children: [new TextRun({ text: '🚨 EMERGENCY SERVICES', bold: true, size: 28, color: 'ffffff', font: 'Arial' })]
          }),
          createContactTable(emergencyContacts, ['Service', 'Organization', 'Phone'], ['Service Type', 'Organization Name', 'Phone Number'], WB_COLORS.during.header),

          // Staff Contacts
          new Paragraph({
            shading: { fill: WB_COLORS.before.header, type: ShadingType.CLEAR },
            spacing: { before: 320, after: 160 },
            children: [new TextRun({ text: '👥 STAFF CONTACTS', bold: true, size: 28, color: 'ffffff', font: 'Arial' })]
          }),
          createContactTable(staffContacts, ['Name', 'Position', 'Phone', 'Email'], ['Name', 'Position', 'Phone', 'Email'], WB_COLORS.before.header),

          // Utilities
          new Paragraph({
            shading: { fill: WB_COLORS.warning.border, type: ShadingType.CLEAR },
            spacing: { before: 320, after: 160 },
            children: [new TextRun({ text: '⚡ UTILITIES & ESSENTIAL SERVICES', bold: true, size: 28, color: 'ffffff', font: 'Arial' })]
          }),
          createContactTable(utilitiesContacts, ['Service', 'Provider', 'Phone', 'Account #'], ['Service Type', 'Organization Name', 'Phone Number', 'Account Number'], WB_COLORS.warning.border),

          // Suppliers
          new Paragraph({
            shading: { fill: '7c3aed', type: ShadingType.CLEAR },
            spacing: { before: 320, after: 160 },
            children: [new TextRun({ text: '📦 KEY SUPPLIERS', bold: true, size: 28, color: 'ffffff', font: 'Arial' })]
          }),
          createContactTable(suppliers, ['Supplier', 'Contact', 'Product/Service', 'Phone'], ['Name', 'Contact Person', 'Service', 'Phone'], '7c3aed'),

          // Insurance
          ...(insuranceContacts.length > 0 ? [
            new Paragraph({
              shading: { fill: WB_COLORS.success.border, type: ShadingType.CLEAR },
              spacing: { before: 320, after: 160 },
              children: [new TextRun({ text: '💼 INSURANCE & BANKING', bold: true, size: 28, color: 'ffffff', font: 'Arial' })]
            }),
            createContactTable(insuranceContacts, ['Type', 'Company', 'Phone', 'Policy #'], ['Service Type', 'Organization Name', 'Phone Number', 'Account Number'], WB_COLORS.success.border)
          ] : []),

          new Paragraph({ children: [new PageBreak()] })
        ]
      },

      // =========================================================================
      // DOCUMENT LOCATOR
      // =========================================================================
      {
        children: [
          new Paragraph({
            shading: { fill: 'ffedd5', type: ShadingType.CLEAR },
            border: { top: { style: BorderStyle.SINGLE, size: 24, color: 'ea580c' }, bottom: { style: BorderStyle.SINGLE, size: 24, color: 'ea580c' } },
            alignment: AlignmentType.CENTER,
            spacing: { after: 320 },
            children: [new TextRun({ text: '📂 DOCUMENT LOCATOR', bold: true, size: 44, color: 'c2410c', font: 'Arial' })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 480 },
            children: [new TextRun({ text: 'Critical records location guide - Know where everything is stored and backed up', size: 28, color: WB_COLORS.gray[600], font: 'Arial' })]
          }),

          ...(vitalRecords.length > 0 ? vitalRecords.map((record: any) => {
            const name = getString(record['Record Type'] || record.recordType || record.name || 'Document')
            const location = getString(record.Location || record.location || 'Not specified')
            const backup = getString(record['Backup Location'] || record.backupLocation || 'Not specified')
            return new Paragraph({
              shading: { fill: WB_COLORS.gray[100], type: ShadingType.CLEAR },
              border: { left: { style: BorderStyle.SINGLE, size: 24, color: 'ea580c' } },
              spacing: { after: 160 },
              children: [
                new TextRun({ text: `📁 ${name}`, bold: true, size: 28, font: 'Arial' }),
                new TextRun({ text: `  |  Location: ${location}  |  Backup: ${backup}`, size: 24, color: WB_COLORS.gray[600], font: 'Arial' })
              ]
            })
          }) : [
            ['Insurance Policies', 'Financial Records', 'Property Documents', 'Employee Records', 'Contracts', 'Tax Records'].map(type =>
              new Paragraph({
                shading: { fill: WB_COLORS.gray[100], type: ShadingType.CLEAR },
                border: { left: { style: BorderStyle.SINGLE, size: 24, color: 'ea580c' } },
                spacing: { after: 120 },
                children: [
                  new TextRun({ text: `📁 ${type}`, bold: true, size: 28, font: 'Arial' }),
                  new TextRun({ text: '  |  Location: _____________  |  Backup: _____________', size: 24, color: WB_COLORS.gray[500], font: 'Arial' })
                ]
              })
            )
          ].flat()),

          // Best practices
          new Paragraph({
            shading: { fill: 'fef3c7', type: ShadingType.CLEAR },
            spacing: { before: 480, after: 160 },
            children: [new TextRun({ text: '💡 Document Protection Best Practices:', bold: true, size: 28, color: '92400e', font: 'Arial' })]
          }),
          ...['Keep digital copies in secure cloud storage', 'Store physical copies in fireproof safe or off-site', 'Update records quarterly or after major changes', 'Test your backups regularly', 'Share backup locations with Plan Manager'].map(tip =>
            new Paragraph({
              indent: { left: 400 },
              spacing: { after: 80 },
              children: [new TextRun({ text: `✓ ${tip}`, size: 28, color: WB_COLORS.gray[700], font: 'Arial' })]
            })
          )
        ]
      }
    ]
  })
}

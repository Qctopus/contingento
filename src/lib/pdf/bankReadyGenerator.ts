/**
 * Bank-Ready Business Continuity Plan PDF Generator
 * 
 * Generates a professional, formal document suitable for:
 * - Lending institutions
 * - Insurance companies  
 * - Investors
 * - Business partners
 * 
 * Format: Clean, concise, formal (10-15 pages)
 */

import { jsPDF } from 'jspdf'
import type { BankReadyBCPData } from '../../types/bcpExports'
import {
  PAGE_LAYOUT,
  BANK_STYLES,
  formatCurrency,
  getRiskLevelColor,
  UNDP_BLUE
} from './pdfStyles'
import {
  PageState,
  checkPageBreak,
  addSectionHeader,
  addSubSectionHeader,
  addTable,
  addBulletList,
  addUNDPFooter,
  addPageNumber,
  addHorizontalLine,
  addMultiLineText
} from './pdfHelpers'

/**
 * Generate Bank-Ready BCP PDF
 */
export async function generateBankReadyPDF(data: BankReadyBCPData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  })

  const state: PageState = {
    currentY: PAGE_LAYOUT.MARGIN_TOP,
    pageNumber: 1
  }

  // Generate cover page
  generateCoverPage(doc, data)

  // Add new page for content
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP

  // Table of Contents (optional, but professional)
  generateTableOfContents(doc, state)

  // SECTION 1: Executive Summary
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  generateExecutiveSummary(doc, state, data)

  // SECTION 2: Business Profile
  checkPageBreak(doc, state, 80, (pageNum) => addFooterWithPageNumber(doc, pageNum))
  generateBusinessProfile(doc, state, data)

  // SECTION 3: Risk Assessment Summary
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  generateRiskSummary(doc, state, data)

  // SECTION 4: Continuity Strategy Overview
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  generateStrategyOverview(doc, state, data)

  // SECTION 5: Governance & Maintenance
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  generateGovernanceSection(doc, state, data)

  // SECTION 6: Appendices
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  generateAppendices(doc, state, data)

  // Add signature page
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  generateSignaturePage(doc, state, data)

  // Return as blob
  return doc.output('blob')
}

// ============================================================================
// COVER PAGE
// ============================================================================

function generateCoverPage(doc: jsPDF, data: BankReadyBCPData): void {
  const centerX = PAGE_LAYOUT.WIDTH / 2

  // UNDP Blue header bar
  doc.setFillColor(UNDP_BLUE.r, UNDP_BLUE.g, UNDP_BLUE.b)
  doc.rect(0, 0, PAGE_LAYOUT.WIDTH, 40, 'F')

  // UNDP Logo area (placeholder - would add actual logo image)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('UNDP', PAGE_LAYOUT.MARGIN_LEFT, 25)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('United Nations Development Programme', PAGE_LAYOUT.MARGIN_LEFT + 25, 25)

  // Main title
  doc.setTextColor(BANK_STYLES.colors.primary.r, BANK_STYLES.colors.primary.g, BANK_STYLES.colors.primary.b)
  doc.setFontSize(28)
  doc.setFont('times', 'bold')
  doc.text('BUSINESS CONTINUITY PLAN', centerX, 80, { align: 'center' })

  // Company name
  doc.setFontSize(20)
  doc.setTextColor(0, 0, 0)
  doc.text(data.executiveSummary.companyName, centerX, 100, { align: 'center' })

  // Divider line
  doc.setDrawColor(BANK_STYLES.colors.primary.r, BANK_STYLES.colors.primary.g, BANK_STYLES.colors.primary.b)
  doc.setLineWidth(0.5)
  doc.line(centerX - 60, 110, centerX + 60, 110)

  // Document information box
  doc.setFontSize(11)
  doc.setFont('times', 'normal')
  doc.setTextColor(60, 60, 60)

  const infoY = 140
  const lineSpacing = 8

  doc.setFont('times', 'bold')
  doc.text('Document Information:', PAGE_LAYOUT.MARGIN_LEFT + 20, infoY)
  doc.setFont('times', 'normal')

  doc.text(`Plan Version: ${data.executiveSummary.planVersion}`, PAGE_LAYOUT.MARGIN_LEFT + 20, infoY + lineSpacing)
  doc.text(`Prepared: ${data.executiveSummary.preparedDate}`, PAGE_LAYOUT.MARGIN_LEFT + 20, infoY + lineSpacing * 2)
  doc.text(`Next Review: ${data.executiveSummary.nextReviewDate}`, PAGE_LAYOUT.MARGIN_LEFT + 20, infoY + lineSpacing * 3)
  doc.text(`Completion: ${data.executiveSummary.planCompletionPercentage}%`, PAGE_LAYOUT.MARGIN_LEFT + 20, infoY + lineSpacing * 4)

  // Compliance badges
  doc.setFontSize(10)
  doc.setFont('helvetica', 'italic')
  const badgeY = 200
  doc.text('✓ UNDP Business Continuity Framework Compliant', centerX, badgeY, { align: 'center' })
  doc.text('✓ CARICHAM SME Best Practices Certified', centerX, badgeY + 7, { align: 'center' })

  // Footer with professional partnerships
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(100, 100, 100)
  doc.text('Prepared in cooperation with', centerX, PAGE_LAYOUT.HEIGHT - 40, { align: 'center' })
  doc.text('United Nations Development Programme (UNDP)', centerX, PAGE_LAYOUT.HEIGHT - 33, { align: 'center' })
  doc.text('and Caribbean Chamber of Commerce (CARICHAM)', centerX, PAGE_LAYOUT.HEIGHT - 26, { align: 'center' })

  // Confidentiality notice
  doc.setFillColor(240, 240, 240)
  doc.rect(PAGE_LAYOUT.MARGIN_LEFT, PAGE_LAYOUT.HEIGHT - 20, PAGE_LAYOUT.CONTENT_WIDTH, 10, 'F')
  doc.setFontSize(8)
  doc.setTextColor(0, 0, 0)
  doc.text('CONFIDENTIAL - For Official Use Only', centerX, PAGE_LAYOUT.HEIGHT - 14, { align: 'center' })
}

// ============================================================================
// TABLE OF CONTENTS
// ============================================================================

function generateTableOfContents(doc: jsPDF, state: PageState): void {
  doc.setFontSize(BANK_STYLES.fontSize.title)
  doc.setFont('times', 'bold')
  doc.setTextColor(BANK_STYLES.colors.primary.r, BANK_STYLES.colors.primary.g, BANK_STYLES.colors.primary.b)
  doc.text('TABLE OF CONTENTS', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)

  state.currentY += 15

  doc.setFontSize(11)
  doc.setFont('times', 'normal')
  doc.setTextColor(0, 0, 0)

  const tocItems = [
    { section: '1', title: 'Executive Summary', page: 3 },
    { section: '2', title: 'Business Profile', page: 4 },
    { section: '3', title: 'Risk Assessment Summary', page: 5 },
    { section: '4', title: 'Continuity Strategy Overview', page: 7 },
    { section: '5', title: 'Governance & Maintenance', page: 9 },
    { section: '6', title: 'Appendices', page: 11 },
    { section: '', title: 'Signature Page', page: 13 }
  ]

  tocItems.forEach(item => {
    const leftText = item.section ? `${item.section}. ${item.title}` : item.title
    doc.text(leftText, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)

    // Dotted line
    const dots = '.'
    const dotsWidth = doc.getTextWidth(dots)
    const textWidth = doc.getTextWidth(leftText)
    const pageNumWidth = doc.getTextWidth(item.page.toString())
    const availableWidth = PAGE_LAYOUT.CONTENT_WIDTH - textWidth - pageNumWidth - 10

    let dotsString = ''
    for (let i = 0; i < Math.floor(availableWidth / dotsWidth); i++) {
      dotsString += dots
    }

    doc.setTextColor(150, 150, 150)
    doc.text(dotsString, PAGE_LAYOUT.MARGIN_LEFT + 5 + textWidth + 2, state.currentY)

    doc.setTextColor(0, 0, 0)
    doc.text(item.page.toString(), PAGE_LAYOUT.WIDTH - PAGE_LAYOUT.MARGIN_RIGHT - 5, state.currentY, { align: 'right' })

    state.currentY += 8
  })

  addUNDPFooter(doc, state.pageNumber)
}

// ============================================================================
// SECTION 1: EXECUTIVE SUMMARY
// ============================================================================

function generateExecutiveSummary(doc: jsPDF, state: PageState, data: BankReadyBCPData): void {
  addSectionHeader(doc, state, 'SECTION 1: EXECUTIVE SUMMARY', {
    fontSize: BANK_STYLES.fontSize.sectionHeader,
    color: BANK_STYLES.colors.primary,
    underline: true,
    spaceAfter: 10
  })

  const summary = data.executiveSummary

  // Opening paragraph
  doc.setFontSize(BANK_STYLES.fontSize.body)
  doc.setFont('times', 'normal')

  const intro = `This Business Continuity Plan has been prepared for ${summary.companyName}, ` +
    `documenting comprehensive risk assessment, mitigation strategies, and operational resilience measures. ` +
    `This plan demonstrates our commitment to business continuity and our preparedness to respond to disruptions.`

  addMultiLineText(doc, intro, PAGE_LAYOUT.MARGIN_LEFT, state.currentY, PAGE_LAYOUT.CONTENT_WIDTH)
  state.currentY += 20

  // Key Metrics Box
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(BANK_STYLES.colors.primary.r, BANK_STYLES.colors.primary.g, BANK_STYLES.colors.primary.b)
  doc.setLineWidth(1)
  doc.roundedRect(PAGE_LAYOUT.MARGIN_LEFT, state.currentY, PAGE_LAYOUT.CONTENT_WIDTH, 55, 3, 3, 'FD')

  doc.setFont('times', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(BANK_STYLES.colors.primary.r, BANK_STYLES.colors.primary.g, BANK_STYLES.colors.primary.b)
  doc.text('KEY PLAN METRICS', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY + 8)

  doc.setFontSize(BANK_STYLES.fontSize.body)
  doc.setTextColor(0, 0, 0)

  const metricsY = state.currentY + 18
  const col1X = PAGE_LAYOUT.MARGIN_LEFT + 8
  const col2X = PAGE_LAYOUT.MARGIN_LEFT + PAGE_LAYOUT.CONTENT_WIDTH / 2 + 5

  // Column 1
  doc.setFont('times', 'bold')
  doc.text('Risks Identified:', col1X, metricsY)
  doc.setFont('times', 'normal')
  doc.text(`${summary.totalRisksIdentified} (${summary.highPriorityRisks} high priority)`, col1X + 35, metricsY)

  doc.setFont('times', 'bold')
  doc.text('Mitigation Strategies:', col1X, metricsY + 8)
  doc.setFont('times', 'normal')
  doc.text(`${summary.totalStrategiesImplemented} implemented`, col1X + 35, metricsY + 8)

  doc.setFont('times', 'bold')
  doc.text('Total Investment:', col1X, metricsY + 16)
  doc.setFont('times', 'normal')
  doc.text(formatCurrency(summary.totalInvestmentUSD, 'USD'), col1X + 35, metricsY + 16)

  // Column 2
  doc.setFont('times', 'bold')
  doc.text('Local Currency:', col2X, metricsY)
  doc.setFont('times', 'normal')
  doc.text(formatCurrency(summary.totalInvestmentLocal, summary.localCurrency), col2X + 35, metricsY)

  doc.setFont('times', 'bold')
  doc.text('Plan Status:', col2X, metricsY + 8)
  doc.setFont('times', 'normal')
  doc.text(`${summary.planCompletionPercentage}% Complete`, col2X + 35, metricsY + 8)

  doc.setFont('times', 'bold')
  doc.text('Next Review:', col2X, metricsY + 16)
  doc.setFont('times', 'normal')
  doc.text(summary.nextReviewDate, col2X + 35, metricsY + 16)

  state.currentY += 65

  // Compliance Statement
  doc.setFont('times', 'italic')
  doc.setFontSize(BANK_STYLES.fontSize.body)
  doc.setTextColor(60, 60, 60)

  const complianceText = 'This plan has been developed in accordance with UNDP Business Continuity Framework ' +
    'and CARICHAM SME Best Practices, ensuring comprehensive coverage of operational resilience requirements.'

  addMultiLineText(doc, complianceText, PAGE_LAYOUT.MARGIN_LEFT, state.currentY, PAGE_LAYOUT.CONTENT_WIDTH)
  state.currentY += 15

  addFooterWithPageNumber(doc, state.pageNumber)
}

// ============================================================================
// SECTION 2: BUSINESS PROFILE
// ============================================================================

function generateBusinessProfile(doc: jsPDF, state: PageState, data: BankReadyBCPData): void {
  addSectionHeader(doc, state, 'SECTION 2: BUSINESS PROFILE', {
    fontSize: BANK_STYLES.fontSize.sectionHeader,
    color: BANK_STYLES.colors.primary,
    underline: true,
    spaceAfter: 10
  })

  const profile = data.businessProfile

  // Basic Information
  addSubSectionHeader(doc, state, '2.1 Company Information')

  doc.setFontSize(BANK_STYLES.fontSize.body)
  doc.setFont('times', 'normal')

  const infoRows: [string, string][] = [
    ['Business Name:', profile.companyName],
    ['Business License:', profile.businessLicense],
    ['Address:', profile.address],
    ['Operating Hours:', profile.operatingHours],
    ['Industry:', profile.industryCategory]
  ]

  infoRows.forEach(([label, value]) => {
    checkPageBreak(doc, state, 10, (pageNum) => addFooterWithPageNumber(doc, pageNum))
    doc.setFont('times', 'bold')
    doc.text(label, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    doc.setFont('times', 'normal')
    doc.text(value, PAGE_LAYOUT.MARGIN_LEFT + 45, state.currentY)
    state.currentY += 7
  })

  state.currentY += 5

  // Business Operations
  addSubSectionHeader(doc, state, '2.2 Business Operations')

  doc.setFont('times', 'bold')
  doc.text('Business Purpose:', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 6
  doc.setFont('times', 'normal')
  const purposeHeight = addMultiLineText(doc, profile.businessPurpose, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY, PAGE_LAYOUT.CONTENT_WIDTH - 5)
  state.currentY += purposeHeight + 8

  checkPageBreak(doc, state, 30, (pageNum) => addFooterWithPageNumber(doc, pageNum))

  doc.setFont('times', 'bold')
  doc.text('Products & Services:', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 6
  doc.setFont('times', 'normal')
  const productsHeight = addMultiLineText(doc, profile.productsServices, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY, PAGE_LAYOUT.CONTENT_WIDTH - 5)
  state.currentY += productsHeight + 8

  // Scale & Capacity
  addSubSectionHeader(doc, state, '2.3 Operational Scale')

  const scaleRows: [string, string][] = [
    ['Number of Employees:', profile.numberOfEmployees.toString()],
    ['Customer Base:', profile.customerBase]
  ]

  scaleRows.forEach(([label, value]) => {
    checkPageBreak(doc, state, 10, (pageNum) => addFooterWithPageNumber(doc, pageNum))
    doc.setFont('times', 'bold')
    doc.text(label, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    doc.setFont('times', 'normal')
    doc.text(value, PAGE_LAYOUT.MARGIN_LEFT + 50, state.currentY)
    state.currentY += 7
  })

  state.currentY += 5

  // Critical Operations
  addSubSectionHeader(doc, state, '2.4 Critical Business Functions')

  doc.setFont('times', 'normal')
  doc.setFontSize(BANK_STYLES.fontSize.body)

  if (profile.criticalFunctions.length > 0) {
    addBulletList(doc, state, profile.criticalFunctions, {
      indent: 10,
      fontSize: BANK_STYLES.fontSize.body,
      lineSpacing: 5
    })
  } else {
    doc.text('Comprehensive operational assessment documented in full plan.', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    state.currentY += 8
  }

  state.currentY += 5

  // Management
  addSubSectionHeader(doc, state, '2.5 Plan Management')

  const mgmtRows: [string, string][] = [
    ['Plan Manager:', profile.planManager],
    ['Alternate Manager:', profile.alternateManager || 'N/A']
  ]

  mgmtRows.forEach(([label, value]) => {
    checkPageBreak(doc, state, 10, (pageNum) => addFooterWithPageNumber(doc, pageNum))
    doc.setFont('times', 'bold')
    doc.text(label, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    doc.setFont('times', 'normal')
    doc.text(value, PAGE_LAYOUT.MARGIN_LEFT + 40, state.currentY)
    state.currentY += 7
  })

  addFooterWithPageNumber(doc, state.pageNumber)
}

// ============================================================================
// SECTION 3: RISK ASSESSMENT SUMMARY
// ============================================================================

function generateRiskSummary(doc: jsPDF, state: PageState, data: BankReadyBCPData): void {
  addSectionHeader(doc, state, 'SECTION 3: RISK ASSESSMENT SUMMARY', {
    fontSize: BANK_STYLES.fontSize.sectionHeader,
    color: BANK_STYLES.colors.primary,
    underline: true,
    spaceAfter: 10
  })

  const riskSummary = data.riskSummary

  // Overview paragraph
  doc.setFontSize(BANK_STYLES.fontSize.body)
  doc.setFont('times', 'normal')

  const overview = `A comprehensive risk assessment has identified ${riskSummary.totalRisksAssessed} potential risks to business operations, ` +
    `of which ${riskSummary.highPriorityCount} are classified as high priority requiring immediate mitigation strategies.`

  addMultiLineText(doc, overview, PAGE_LAYOUT.MARGIN_LEFT, state.currentY, PAGE_LAYOUT.CONTENT_WIDTH)
  state.currentY += 15

  // Risk Distribution Chart (text-based)
  addSubSectionHeader(doc, state, '3.1 Risk Distribution')

  doc.setFontSize(BANK_STYLES.fontSize.body)
  doc.setFont('times', 'normal')

  const distributionY = state.currentY
  doc.text('High Priority:', PAGE_LAYOUT.MARGIN_LEFT + 10, distributionY)
  doc.setFont('times', 'bold')
  doc.text(riskSummary.highPriorityCount.toString(), PAGE_LAYOUT.MARGIN_LEFT + 50, distributionY)

  doc.setFont('times', 'normal')
  doc.text('Medium Priority:', PAGE_LAYOUT.MARGIN_LEFT + 10, distributionY + 7)
  doc.setFont('times', 'bold')
  doc.text(riskSummary.mediumPriorityCount.toString(), PAGE_LAYOUT.MARGIN_LEFT + 50, distributionY + 7)

  doc.setFont('times', 'normal')
  doc.text('Low Priority:', PAGE_LAYOUT.MARGIN_LEFT + 10, distributionY + 14)
  doc.setFont('times', 'bold')
  doc.text(riskSummary.lowPriorityCount.toString(), PAGE_LAYOUT.MARGIN_LEFT + 50, distributionY + 14)

  state.currentY += 25

  // Risk Assessment Table
  addSubSectionHeader(doc, state, '3.2 Risk Assessment Matrix')

  const tableHeaders = ['Risk', 'Likelihood', 'Impact', 'Score', 'Level', 'Status', 'Investment']

  const tableRows = riskSummary.risks.map(risk => [
    risk.riskName.length > 18 ? risk.riskName.substring(0, 15) + '...' : risk.riskName,
    risk.likelihood.substring(0, 10),
    risk.impact.substring(0, 10),
    risk.riskScore.toString(),
    risk.riskLevel,
    risk.status.substring(0, 12),
    formatCurrency(risk.investmentUSD, 'USD')
  ])

  const columnWidths = [35, 22, 22, 13, 18, 25, 35]

  addTable(doc, state, tableHeaders, tableRows, {
    columnWidths,
    headerColor: BANK_STYLES.colors.tableHeader,
    borderColor: BANK_STYLES.colors.tableBorder,
    fontSize: BANK_STYLES.fontSize.small,
    rowHeight: BANK_STYLES.spacing.tableRowHeight
  })

  // Risk Mitigation Investment Summary
  state.currentY += 10
  addSubSectionHeader(doc, state, '3.3 Risk Mitigation Investment')

  const totalInvestment = riskSummary.risks.reduce((sum, risk) => sum + risk.investmentUSD, 0)

  doc.setFontSize(BANK_STYLES.fontSize.body)
  doc.setFont('times', 'normal')
  doc.text(`Total investment in risk mitigation: ${formatCurrency(totalInvestment, 'USD')}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  state.currentY += 8

  doc.setFont('times', 'italic')
  doc.setFontSize(BANK_STYLES.fontSize.small)
  doc.setTextColor(100, 100, 100)
  doc.text('Note: Investment figures include planned and implemented mitigation strategies.', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  doc.setTextColor(0, 0, 0)
  state.currentY += 10

  addFooterWithPageNumber(doc, state.pageNumber)
}

// ============================================================================
// SECTION 4: CONTINUITY STRATEGY OVERVIEW
// ============================================================================

function generateStrategyOverview(doc: jsPDF, state: PageState, data: BankReadyBCPData): void {
  addSectionHeader(doc, state, 'SECTION 4: CONTINUITY STRATEGY OVERVIEW', {
    fontSize: BANK_STYLES.fontSize.sectionHeader,
    color: BANK_STYLES.colors.primary,
    underline: true,
    spaceAfter: 10
  })

  const strategyData = data.strategyOverview

  // Overview
  doc.setFontSize(BANK_STYLES.fontSize.body)
  doc.setFont('times', 'normal')

  const intro = `${strategyData.totalStrategies} continuity strategies have been identified and planned to ensure business resilience. ` +
    `These strategies span prevention, preparation, response, and recovery phases, with a total planned investment of ` +
    `${formatCurrency(strategyData.totalInvestmentUSD, 'USD')}.`

  addMultiLineText(doc, intro, PAGE_LAYOUT.MARGIN_LEFT, state.currentY, PAGE_LAYOUT.CONTENT_WIDTH)
  state.currentY += 15

  // Recovery Objectives
  addSubSectionHeader(doc, state, '4.1 Recovery Objectives')

  doc.setFontSize(BANK_STYLES.fontSize.body)
  doc.setFont('times', 'bold')
  doc.text('Recovery Time Objective (RTO):', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  doc.setFont('times', 'normal')
  doc.text(strategyData.rto, PAGE_LAYOUT.MARGIN_LEFT + 70, state.currentY)
  state.currentY += 8

  doc.setFont('times', 'bold')
  doc.text('Recovery Point Objective (RPO):', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  doc.setFont('times', 'normal')
  doc.text(strategyData.rpo, PAGE_LAYOUT.MARGIN_LEFT + 70, state.currentY)
  state.currentY += 12

  // Strategy Summary - DETAILED view for banks
  addSubSectionHeader(doc, state, '4.2 Strategy Details & Implementation Plan')

  // Show each strategy with its detailed actions
  strategyData.strategies.forEach((strategy, index) => {
    checkPageBreak(doc, state, 60, (pageNum) => addFooterWithPageNumber(doc, pageNum))

    // Strategy header
    doc.setFont('times', 'bold')
    doc.setFontSize(BANK_STYLES.fontSize.body)
    doc.setFillColor(BANK_STYLES.colors.tableHeader.r, BANK_STYLES.colors.tableHeader.g, BANK_STYLES.colors.tableHeader.b)
    doc.rect(PAGE_LAYOUT.MARGIN_LEFT, state.currentY - 4, PAGE_LAYOUT.CONTENT_WIDTH, 8, 'F')
    doc.setTextColor(0, 0, 0)
    doc.text(`${index + 1}. ${strategy.name}`, PAGE_LAYOUT.MARGIN_LEFT + 3, state.currentY)
    state.currentY += 8

    // Category and investment
    doc.setFont('times', 'normal')
    doc.setFontSize(BANK_STYLES.fontSize.small)
    doc.setTextColor(60, 60, 60)
    doc.text(`Category: ${strategy.category} | Investment: ${formatCurrency(strategy.investmentUSD, 'USD')} | Effectiveness: ${strategy.effectiveness}/10`, 
      PAGE_LAYOUT.MARGIN_LEFT + 3, state.currentY)
    state.currentY += 6
    doc.setTextColor(0, 0, 0)

    // Description
    if (strategy.description) {
      doc.setFont('times', 'italic')
      doc.setFontSize(BANK_STYLES.fontSize.small)
      const descLines = doc.splitTextToSize(strategy.description, PAGE_LAYOUT.CONTENT_WIDTH - 10)
      descLines.forEach((line: string) => {
        doc.text(line, PAGE_LAYOUT.MARGIN_LEFT + 3, state.currentY)
        state.currentY += 4
      })
      state.currentY += 2
    }

    // Benefits
    if (strategy.benefits && strategy.benefits.length > 0) {
      doc.setFont('times', 'bold')
      doc.setFontSize(BANK_STYLES.fontSize.small)
      doc.text('Benefits:', PAGE_LAYOUT.MARGIN_LEFT + 3, state.currentY)
      state.currentY += 5

      doc.setFont('times', 'normal')
      strategy.benefits.slice(0, 3).forEach(benefit => {
        doc.text('•', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
        const benefitLines = doc.splitTextToSize(benefit, PAGE_LAYOUT.CONTENT_WIDTH - 15)
        benefitLines.forEach((line: string, idx: number) => {
          doc.text(line, PAGE_LAYOUT.MARGIN_LEFT + 9, state.currentY + (idx * 4))
        })
        state.currentY += (benefitLines.length * 4) + 2
      })
      state.currentY += 2
    }

    // KEY ACTION STEPS - This is what banks need to see!
    if (strategy.keyActionSteps && strategy.keyActionSteps.length > 0) {
      doc.setFont('times', 'bold')
      doc.setFontSize(BANK_STYLES.fontSize.small)
      doc.text('Implementation Actions:', PAGE_LAYOUT.MARGIN_LEFT + 3, state.currentY)
      state.currentY += 5

      strategy.keyActionSteps.forEach((step, stepIdx) => {
        checkPageBreak(doc, state, 15, (pageNum) => addFooterWithPageNumber(doc, pageNum))

        // Step header
        doc.setFont('times', 'bold')
        doc.setFontSize(BANK_STYLES.fontSize.small)
        doc.text(`${stepIdx + 1}.`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
        doc.text(`[${step.phase}]`, PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY)
        state.currentY += 5

        // Action description
        doc.setFont('times', 'normal')
        const actionLines = doc.splitTextToSize(step.action, PAGE_LAYOUT.CONTENT_WIDTH - 20)
        actionLines.forEach((line: string) => {
          doc.text(line, PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY)
          state.currentY += 4
        })

        // Resources needed
        if (step.resources && step.resources.length > 0) {
          doc.setFont('times', 'italic')
          doc.setFontSize(BANK_STYLES.fontSize.footnote)
          doc.setTextColor(80, 80, 80)
          doc.text(`Resources: ${step.resources.join(', ')}`, PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY)
          state.currentY += 4
          doc.setTextColor(0, 0, 0)
        }

        state.currentY += 2
      })
    }

    // Implementation timeline
    if (strategy.implementationTime) {
      doc.setFont('times', 'bold')
      doc.setFontSize(BANK_STYLES.fontSize.small)
      doc.text(`Implementation Timeline: ${strategy.implementationTime}`, PAGE_LAYOUT.MARGIN_LEFT + 3, state.currentY)
      state.currentY += 5
    }

    state.currentY += 5 // Space between strategies
  })

  // Summary note for banks
  state.currentY += 5
  doc.setFont('times', 'italic')
  doc.setFontSize(BANK_STYLES.fontSize.small)
  doc.setTextColor(60, 60, 60)
  const note = 'All strategies have been carefully selected based on risk assessment and include detailed implementation plans with assigned responsibilities and timelines.'
  const noteLines = doc.splitTextToSize(note, PAGE_LAYOUT.CONTENT_WIDTH)
  noteLines.forEach((line: string) => {
    doc.text(line, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    state.currentY += 4
  })
  doc.setTextColor(0, 0, 0)

  // Note: Old category grouping code removed - now showing detailed view above instead

  addFooterWithPageNumber(doc, state.pageNumber)
}

// ============================================================================
// SECTION 5: GOVERNANCE & MAINTENANCE
// ============================================================================

function generateGovernanceSection(doc: jsPDF, state: PageState, data: BankReadyBCPData): void {
  addSectionHeader(doc, state, 'SECTION 5: GOVERNANCE & MAINTENANCE', {
    fontSize: BANK_STYLES.fontSize.sectionHeader,
    color: BANK_STYLES.colors.primary,
    underline: true,
    spaceAfter: 10
  })

  const governance = data.governance

  // Plan Ownership
  addSubSectionHeader(doc, state, '5.1 Plan Ownership & Responsibilities')

  doc.setFontSize(BANK_STYLES.fontSize.body)
  doc.setFont('times', 'bold')
  doc.text('Plan Owner:', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  doc.setFont('times', 'normal')
  doc.text(governance.planOwner, PAGE_LAYOUT.MARGIN_LEFT + 35, state.currentY)
  state.currentY += 7

  doc.setFont('times', 'bold')
  doc.text('Plan Manager:', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  doc.setFont('times', 'normal')
  doc.text(governance.planManager, PAGE_LAYOUT.MARGIN_LEFT + 35, state.currentY)
  state.currentY += 7

  if (governance.alternateManager) {
    doc.setFont('times', 'bold')
    doc.text('Alternate Manager:', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    doc.setFont('times', 'normal')
    doc.text(governance.alternateManager, PAGE_LAYOUT.MARGIN_LEFT + 35, state.currentY)
    state.currentY += 7
  }

  state.currentY += 8

  // Testing Schedule
  addSubSectionHeader(doc, state, '5.2 Testing Schedule')

  doc.setFontSize(BANK_STYLES.fontSize.body)
  doc.setFont('times', 'normal')

  doc.text(`Frequency: ${governance.testingSchedule.frequency}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  state.currentY += 7

  doc.text(`Next Test Date: ${governance.testingSchedule.nextTestDate}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  state.currentY += 7

  doc.text(`Responsible Party: ${governance.testingSchedule.responsibleParty}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  state.currentY += 12

  // Review Schedule
  addSubSectionHeader(doc, state, '5.3 Review & Update Schedule')

  doc.text(`Frequency: ${governance.reviewSchedule.frequency}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  state.currentY += 7

  doc.text(`Last Review: ${governance.reviewSchedule.lastReviewDate}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  state.currentY += 7

  doc.text(`Next Review: ${governance.reviewSchedule.nextReviewDate}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  state.currentY += 7

  doc.text(`Responsible Party: ${governance.reviewSchedule.responsibleParty}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  state.currentY += 12

  // Training Program
  addSubSectionHeader(doc, state, '5.4 Training Program')

  doc.text(`Frequency: ${governance.trainingProgram.frequency}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  state.currentY += 7

  if (governance.trainingProgram.nextTrainingDate) {
    doc.text(`Next Training: ${governance.trainingProgram.nextTrainingDate}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    state.currentY += 7
  }

  doc.text('Target Audience:', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  state.currentY += 6

  governance.trainingProgram.targetAudience.forEach(audience => {
    doc.text(`• ${audience}`, PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY)
    state.currentY += 6
  })

  state.currentY += 8

  // Compliance
  addSubSectionHeader(doc, state, '5.5 Compliance & Standards')

  doc.setFont('times', 'bold')
  doc.text('Certifications:', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  state.currentY += 6

  doc.setFont('times', 'normal')
  governance.certifications.forEach(cert => {
    doc.text(`✓ ${cert}`, PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY)
    state.currentY += 6
  })

  state.currentY += 5

  doc.setFont('times', 'bold')
  doc.text('Industry Standards:', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  state.currentY += 6

  doc.setFont('times', 'normal')
  governance.industryStandards.forEach(standard => {
    doc.text(`✓ ${standard}`, PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY)
    state.currentY += 6
  })

  addFooterWithPageNumber(doc, state.pageNumber)
}

// ============================================================================
// SECTION 6: APPENDICES
// ============================================================================

function generateAppendices(doc: jsPDF, state: PageState, data: BankReadyBCPData): void {
  addSectionHeader(doc, state, 'SECTION 6: APPENDICES', {
    fontSize: BANK_STYLES.fontSize.sectionHeader,
    color: BANK_STYLES.colors.primary,
    underline: true,
    spaceAfter: 10
  })

  const appendices = data.appendices

  // Appendix A: Key Contacts
  addSubSectionHeader(doc, state, 'Appendix A: Key Contact Summary')

  if (appendices.emergencyContacts.length > 0) {
    const contactHeaders = ['Category', 'Name', 'Role', 'Contact']
    const contactRows = appendices.emergencyContacts.map(contact => [
      contact.category,
      contact.name,
      contact.role,
      contact.primaryContact
    ])

    addTable(doc, state, contactHeaders, contactRows, {
      columnWidths: [40, 40, 40, 50],
      fontSize: BANK_STYLES.fontSize.small,
      rowHeight: 7
    })
  } else {
    doc.setFont('times', 'italic')
    doc.setFontSize(BANK_STYLES.fontSize.body)
    doc.text('Detailed contact information available in full operational plan.', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    state.currentY += 10
  }

  // Appendix B: Vital Records
  addSubSectionHeader(doc, state, 'Appendix B: Vital Records Inventory')

  if (appendices.vitalRecords.length > 0) {
    const recordHeaders = ['Record Type', 'Storage Location', 'Backup Location', 'Priority']
    const recordRows = appendices.vitalRecords.slice(0, 10).map(record => [
      record.recordType,
      record.storageLocation.length > 20 ? record.storageLocation.substring(0, 17) + '...' : record.storageLocation,
      record.backupLocation.length > 20 ? record.backupLocation.substring(0, 17) + '...' : record.backupLocation,
      record.priority
    ])

    addTable(doc, state, recordHeaders, recordRows, {
      columnWidths: [45, 45, 45, 35],
      fontSize: BANK_STYLES.fontSize.small,
      rowHeight: 7
    })
  }

  // Appendix C: Plan Distribution
  checkPageBreak(doc, state, 40, (pageNum) => addFooterWithPageNumber(doc, pageNum))
  addSubSectionHeader(doc, state, 'Appendix C: Plan Distribution')

  if (appendices.planDistribution.length > 0) {
    const distHeaders = ['Recipient', 'Format', 'Date', 'Version']
    const distRows = appendices.planDistribution.map(dist => [
      dist.recipient,
      dist.format,
      dist.dateProvided,
      dist.version
    ])

    addTable(doc, state, distHeaders, distRows, {
      columnWidths: [50, 40, 40, 40],
      fontSize: BANK_STYLES.fontSize.small,
      rowHeight: 7
    })
  }

  // Appendix D: Revision History
  checkPageBreak(doc, state, 40, (pageNum) => addFooterWithPageNumber(doc, pageNum))
  addSubSectionHeader(doc, state, 'Appendix D: Revision History')

  const revHeaders = ['Version', 'Date', 'Changes', 'Updated By']
  const revRows = appendices.revisionHistory.map(rev => [
    rev.version,
    rev.date,
    rev.changes.length > 30 ? rev.changes.substring(0, 27) + '...' : rev.changes,
    rev.updatedBy
  ])

  addTable(doc, state, revHeaders, revRows, {
    columnWidths: [25, 30, 70, 45],
    fontSize: BANK_STYLES.fontSize.small,
    rowHeight: 7
  })

  addFooterWithPageNumber(doc, state.pageNumber)
}

// ============================================================================
// SIGNATURE PAGE
// ============================================================================

function generateSignaturePage(doc: jsPDF, state: PageState, data: BankReadyBCPData): void {
  addSectionHeader(doc, state, 'PLAN APPROVAL & SIGNATURES', {
    fontSize: BANK_STYLES.fontSize.sectionHeader,
    color: BANK_STYLES.colors.primary,
    underline: true,
    spaceAfter: 15
  })

  doc.setFontSize(BANK_STYLES.fontSize.body)
  doc.setFont('times', 'normal')

  const approvalText = 'By signing below, the undersigned acknowledge that they have reviewed and approved ' +
    'this Business Continuity Plan and commit to its implementation and maintenance.'

  addMultiLineText(doc, approvalText, PAGE_LAYOUT.MARGIN_LEFT, state.currentY, PAGE_LAYOUT.CONTENT_WIDTH)
  state.currentY += 25

  // Signature blocks
  const signatureBlocks = [
    { title: 'Plan Manager', name: data.governance.planManager },
    { title: 'Alternate Manager', name: data.governance.alternateManager || 'N/A' },
    { title: 'Business Owner', name: 'Business Owner/CEO' }
  ]

  signatureBlocks.forEach((block, index) => {
    if (index > 0) state.currentY += 25

    doc.setFont('times', 'bold')
    doc.text(block.title, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    state.currentY += 8

    doc.setFont('times', 'normal')
    doc.text(`Name: ${block.name}`, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    state.currentY += 12

    // Signature line
    doc.line(PAGE_LAYOUT.MARGIN_LEFT, state.currentY, PAGE_LAYOUT.MARGIN_LEFT + 80, state.currentY)
    state.currentY += 5
    doc.setFont('times', 'italic')
    doc.setFontSize(BANK_STYLES.fontSize.small)
    doc.text('Signature', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    state.currentY += 10

    // Date line
    doc.setFontSize(BANK_STYLES.fontSize.body)
    doc.line(PAGE_LAYOUT.MARGIN_LEFT, state.currentY, PAGE_LAYOUT.MARGIN_LEFT + 40, state.currentY)
    state.currentY += 5
    doc.text('Date', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  })

  addFooterWithPageNumber(doc, state.pageNumber)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function addFooterWithPageNumber(doc: jsPDF, pageNumber: number): void {
  addUNDPFooter(doc, pageNumber, true)
  addPageNumber(doc, pageNumber)
}


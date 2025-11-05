/**
 * Formal Business Continuity Plan PDF Generator
 * 
 * Generates an 8-12 page professional document suitable for:
 * - Bank loan applications
 * - Insurance renewals
 * - Proving business preparedness
 * 
 * Target: Caribbean small business owners
 * Format: Professional, clear, concise
 */

import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import type { FormalBCPData } from '../../types/bcpExports'
import { PAGE_LAYOUT } from './pdfStyles'
import {
  PageState,
  addMultiLineText
} from './pdfHelpers'

// Professional color scheme
const UNDP_BLUE = [41, 84, 121] as const
const DARK_GRAY = [60, 60, 60] as const
const LIGHT_GRAY = [240, 240, 245] as const
const BORDER_GRAY = [200, 200, 200] as const

/**
 * Generate Formal BCP PDF
 */
export async function generateFormalBCPPDF(data: FormalBCPData): Promise<Blob> {
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
  generateCoverPage(doc, data.coverPage)

  // Table of Contents
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  generateTableOfContents(doc, state)

  // Section 1: Business Overview
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  addPageHeader(doc, data.coverPage.businessName)
  generateBusinessOverview(doc, state, data.businessOverview, data.coverPage.businessName)
  addPageFooter(doc, state.pageNumber)

  // Section 2: Risk Assessment
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  addPageHeader(doc, data.coverPage.businessName)
  generateRiskAssessment(doc, state, data.riskAssessment)
  addPageFooter(doc, state.pageNumber)

  // Section 3: Continuity Strategies
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  addPageHeader(doc, data.coverPage.businessName)
  generateContinuityStrategies(doc, state, data.continuityStrategies)
  addPageFooter(doc, state.pageNumber)

  // Section 4: Emergency Response
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  addPageHeader(doc, data.coverPage.businessName)
  generateEmergencyResponse(doc, state, data.emergencyResponse)
  addPageFooter(doc, state.pageNumber)

  // Section 5: Plan Maintenance
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  addPageHeader(doc, data.coverPage.businessName)
  generatePlanMaintenance(doc, state, data.planMaintenance)
  addPageFooter(doc, state.pageNumber)

  // Section 6: Appendices
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  addPageHeader(doc, data.coverPage.businessName)
  generateAppendices(doc, state, data.appendices)
  addPageFooter(doc, state.pageNumber)

  return doc.output('blob')
}

// ============================================================================
// COVER PAGE
// ============================================================================

function generateCoverPage(doc: jsPDF, coverData: FormalBCPData['coverPage']) {
  // Blue header bar
  doc.setFillColor(...UNDP_BLUE)
  doc.rect(0, 0, PAGE_LAYOUT.WIDTH, 60, 'F')

  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  const title = 'BUSINESS CONTINUITY PLAN'
  doc.text(title, PAGE_LAYOUT.WIDTH / 2, 30, { align: 'center' })

  // Business name
  doc.setFontSize(18)
  doc.setFont('helvetica', 'normal')
  doc.text(coverData.businessName, PAGE_LAYOUT.WIDTH / 2, 45, { align: 'center' })

  // Location
  doc.setFontSize(12)
  const location = `${coverData.parish}, ${coverData.country}`
  doc.text(location, PAGE_LAYOUT.WIDTH / 2, 55, { align: 'center' })

  // Decorative line
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.5)
  doc.line(30, 75, PAGE_LAYOUT.WIDTH - 30, 75)

  // Plan details (centered)
  doc.setTextColor(...DARK_GRAY)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  
  let y = 95
  doc.text('Plan Version:', PAGE_LAYOUT.WIDTH / 2 - 25, y)
  doc.setFont('helvetica', 'normal')
  doc.text(coverData.planVersion, PAGE_LAYOUT.WIDTH / 2 + 15, y)

  y += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Date Prepared:', PAGE_LAYOUT.WIDTH / 2 - 25, y)
  doc.setFont('helvetica', 'normal')
  doc.text(coverData.datePrepared, PAGE_LAYOUT.WIDTH / 2 + 15, y)

  y += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Plan Manager:', PAGE_LAYOUT.WIDTH / 2 - 25, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${coverData.planManager}, ${coverData.planManagerTitle}`, PAGE_LAYOUT.WIDTH / 2 + 15, y)

  // Purpose statement (boxed)
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.3)
  doc.rect(30, 130, PAGE_LAYOUT.WIDTH - 60, 40)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(...DARK_GRAY)
  const purposeText = `This plan demonstrates how ${coverData.businessName} prepares for emergencies and maintains operations during disruptions.`
  const purposeLines = doc.splitTextToSize(purposeText, PAGE_LAYOUT.WIDTH - 80)
  purposeLines.forEach((line: string, index: number) => {
    doc.text(line, PAGE_LAYOUT.WIDTH / 2, 140 + (index * 6), { align: 'center' })
  })

  // Footer attribution
  doc.setDrawColor(...BORDER_GRAY)
  doc.line(30, 260, PAGE_LAYOUT.WIDTH - 30, 260)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Prepared with technical support from:', PAGE_LAYOUT.WIDTH / 2, 268, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.text('UNDP Caribbean | CARICHAM Business Support Program', PAGE_LAYOUT.WIDTH / 2, 275, { align: 'center' })

  doc.setDrawColor(...BORDER_GRAY)
  doc.line(30, 280, PAGE_LAYOUT.WIDTH - 30, 280)
}

// ============================================================================
// TABLE OF CONTENTS
// ============================================================================

function generateTableOfContents(doc: jsPDF, state: PageState) {
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK_GRAY)
  doc.text('CONTENTS', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)

  state.currentY += 15

  const contents = [
    { section: '1. Business Overview', page: '3' },
    { section: '2. Risk Assessment', page: '4' },
    { section: '3. Continuity Strategies', page: '5' },
    { section: '4. Emergency Response Procedures', page: '7' },
    { section: '5. Plan Maintenance & Testing', page: '8' },
    { section: '6. Appendices', page: '9' }
  ]

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')

  contents.forEach(item => {
    doc.text(item.section, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    doc.text(item.page, PAGE_LAYOUT.WIDTH - PAGE_LAYOUT.MARGIN_RIGHT - 10, state.currentY)
    
    // Dotted line
    const dots = '.'
    const textWidth = doc.getTextWidth(item.section)
    const pageWidth = doc.getTextWidth(item.page)
    const dotSpace = PAGE_LAYOUT.CONTENT_WIDTH - textWidth - pageWidth - 5
    const dotCount = Math.floor(dotSpace / 2)
    doc.setTextColor(150, 150, 150)
    doc.text(dots.repeat(dotCount), PAGE_LAYOUT.MARGIN_LEFT + textWidth + 2, state.currentY)
    doc.setTextColor(...DARK_GRAY)
    
    state.currentY += 8
  })
}

// ============================================================================
// SECTION 1: BUSINESS OVERVIEW
// ============================================================================

function generateBusinessOverview(
  doc: jsPDF,
  state: PageState,
  overview: FormalBCPData['businessOverview'],
  businessName: string
) {
  addSectionHeader(doc, state, '1. BUSINESS OVERVIEW')

  // 1.1 Business Information
  addSubsectionHeader(doc, state, '1.1 Business Information')
  
  const businessInfoData = [
    ['Business Name', overview.businessInfo.businessName],
    ['License/Registration', overview.businessInfo.licenseNumber],
    ['Business Type', overview.businessInfo.businessType],
    ['Physical Address', overview.businessInfo.physicalAddress],
    ['Years in Operation', overview.businessInfo.yearsInOperation],
    ['Business Purpose', overview.businessInfo.businessPurpose]
  ]

  addSimpleTable(doc, state, businessInfoData)
  state.currentY += 8

  // 1.2 Business Scale
    checkFormalPageBreak(doc, state, 40, businessName)
  addSubsectionHeader(doc, state, '1.2 Business Scale')

  const ftPt = overview.businessScale.fullTimeEmployees && overview.businessScale.partTimeEmployees
    ? `(${overview.businessScale.fullTimeEmployees} full-time, ${overview.businessScale.partTimeEmployees} part-time)`
    : ''

  const scaleData = [
    ['Employees', `${overview.businessScale.totalEmployees} total ${ftPt}`],
    ['Annual Revenue', overview.businessScale.annualRevenue],
    ['Operating Schedule', overview.businessScale.operatingSchedule],
    ['Primary Markets', overview.businessScale.primaryMarkets]
  ]

  addSimpleTable(doc, state, scaleData)
  state.currentY += 8

  // 1.3 What We Offer
    checkFormalPageBreak(doc, state, 40, businessName)
  addSubsectionHeader(doc, state, '1.3 What We Offer')
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const productLines = doc.splitTextToSize(overview.productsAndServices, PAGE_LAYOUT.CONTENT_WIDTH)
  productLines.forEach((line: string) => {
    doc.text(line, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    state.currentY += 5
  })

  if (overview.competitiveAdvantages.length > 0) {
    state.currentY += 3
    doc.setFont('helvetica', 'bold')
    doc.text('Key Strengths:', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    state.currentY += 6
    doc.setFont('helvetica', 'normal')

    overview.competitiveAdvantages.forEach(advantage => {
      doc.text('•', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
      const advLines = doc.splitTextToSize(advantage, PAGE_LAYOUT.CONTENT_WIDTH - 10)
      advLines.forEach((line: string, index: number) => {
        doc.text(line, PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY + (index * 5))
      })
      state.currentY += (advLines.length * 5) + 2
    })
  }

  state.currentY += 5

  // 1.4 Essential Operations
    checkFormalPageBreak(doc, state, 50, businessName)
  addSubsectionHeader(doc, state, '1.4 Essential Operations')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('These functions are critical to keeping our business running:', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 8

  overview.essentialFunctions.slice(0, 6).forEach(fn => {
      checkFormalPageBreak(doc, state, 15, businessName)
    doc.setFont('helvetica', 'bold')
    doc.text(`• ${fn.functionName}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    state.currentY += 5
    doc.setFont('helvetica', 'normal')
    const descLines = doc.splitTextToSize(fn.description, PAGE_LAYOUT.CONTENT_WIDTH - 10)
    descLines.forEach((line: string) => {
      doc.text(line, PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY)
      state.currentY += 5
    })
    state.currentY += 2
  })

  state.currentY += 3
  doc.setFont('helvetica', 'bold')
  doc.text('Minimum Resources to Operate:', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 5
  doc.setFont('helvetica', 'normal')
  const resourceLines = doc.splitTextToSize(overview.minimumResourceRequirements, PAGE_LAYOUT.CONTENT_WIDTH)
  resourceLines.forEach((line: string) => {
    doc.text(line, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    state.currentY += 5
  })
}

// ============================================================================
// SECTION 2: RISK ASSESSMENT
// ============================================================================

function generateRiskAssessment(
  doc: jsPDF,
  state: PageState,
  riskAssessment: FormalBCPData['riskAssessment']
) {
  addSectionHeader(doc, state, '2. RISK ASSESSMENT')

  // 2.1 Risk Identification
  addSubsectionHeader(doc, state, '2.1 Risk Identification')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const identText = `We have identified ${riskAssessment.totalRisksIdentified} significant risks that could disrupt our business operations, including ${riskAssessment.highPriorityRisksCount} high-priority risks requiring immediate attention.`
  const identLines = doc.splitTextToSize(identText, PAGE_LAYOUT.CONTENT_WIDTH)
  identLines.forEach((line: string) => {
    doc.text(line, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    state.currentY += 5
  })

  state.currentY += 8

  // 2.2 Major Risks Analysis
  addSubsectionHeader(doc, state, '2.2 Major Risks Analysis')

  riskAssessment.majorRisks.forEach((risk, index) => {
    checkFormalPageBreak(doc, state, 60, '')
    
    // Risk header
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`RISK: ${risk.hazardName.toUpperCase()}`, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    state.currentY += 8

    // Risk details table
    const riskData = [
      ['Assessment', 'Details'],
      ['Risk Score', `${risk.riskScore.toFixed(1)}/10 (${risk.riskLevel})`],
      ['Likelihood', risk.likelihood],
      ['Potential Impact', risk.potentialImpact],
      ['Our Vulnerability', risk.vulnerability],
      ['Potential Loss', risk.potentialLoss]
    ]

    addDetailedTable(doc, state, riskData)
    state.currentY += 10
  })

  // 2.3 Risk Summary Table
  checkPageBreak(doc, state, 60, '')
  addSubsectionHeader(doc, state, '2.3 Risk Summary Table')

  const summaryHeaders = ['Risk', 'Likelihood', 'Impact', 'Risk Level', 'Status']
  const summaryData = riskAssessment.allRisksSummary.map(r => [
    r.hazard,
    r.likelihood,
    r.impact,
    r.riskLevel,
    r.mitigationStatus
  ])

  addDataTable(doc, state, summaryHeaders, summaryData)

  // 2.4 Business Impact Without Preparation
  checkPageBreak(doc, state, 60, '')
  addSubsectionHeader(doc, state, '2.4 Business Impact Without Preparation')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Without proper preparation, a major disruption could result in:', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 8

  const impacts = [
    `Revenue loss: ${riskAssessment.potentialImpact.revenueLoss}`,
    `Asset damage: ${riskAssessment.potentialImpact.assetDamage}`,
    `Recovery time: ${riskAssessment.potentialImpact.recoveryTime} to return to normal operations`,
    `Customer relationships: ${riskAssessment.potentialImpact.customerRelationships}`
  ]

  impacts.forEach(impact => {
    doc.text('•', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    const impactLines = doc.splitTextToSize(impact, PAGE_LAYOUT.CONTENT_WIDTH - 10)
    impactLines.forEach((line: string, index: number) => {
      doc.text(line, PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY + (index * 5))
    })
    state.currentY += (impactLines.length * 5) + 2
  })

  state.currentY += 5
  doc.setFont('helvetica', 'italic')
  const conclusionLines = doc.splitTextToSize(
    'This plan ensures we can respond quickly and minimize these impacts.',
    PAGE_LAYOUT.CONTENT_WIDTH
  )
  conclusionLines.forEach((line: string) => {
    doc.text(line, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    state.currentY += 5
  })
}

// ============================================================================
// SECTION 3: CONTINUITY STRATEGIES
// ============================================================================

function generateContinuityStrategies(
  doc: jsPDF,
  state: PageState,
  strategies: FormalBCPData['continuityStrategies']
) {
  addSectionHeader(doc, state, '3. CONTINUITY STRATEGIES')

  // 3.1 Investment Summary
  addSubsectionHeader(doc, state, '3.1 Investment Summary')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const totalJMD = `JMD ${strategies.totalInvestment.toLocaleString('en-US')}`
  const summaryText = `We are investing ${totalJMD} in business continuity measures to protect our operations, assets, and ability to serve customers during disruptions.`
  const summaryLines = doc.splitTextToSize(summaryText, PAGE_LAYOUT.CONTENT_WIDTH)
  summaryLines.forEach((line: string) => {
    doc.text(line, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    state.currentY += 5
  })

  state.currentY += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Investment Breakdown:', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 6
  doc.setFont('helvetica', 'normal')

  const breakdown = [
    `Prevention (reduce likelihood): JMD ${strategies.investmentBreakdown.prevention.toLocaleString('en-US')} (${strategies.investmentBreakdown.preventionPercentage}%)`,
    `Response (handle emergencies): JMD ${strategies.investmentBreakdown.response.toLocaleString('en-US')} (${strategies.investmentBreakdown.responsePercentage}%)`,
    `Recovery (restore operations): JMD ${strategies.investmentBreakdown.recovery.toLocaleString('en-US')} (${strategies.investmentBreakdown.recoveryPercentage}%)`
  ]

  breakdown.forEach(item => {
    doc.text('•', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    doc.text(item, PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY)
    state.currentY += 6
  })

  state.currentY += 6

  // 3.2 Our Preparation Strategies
  addSubsectionHeader(doc, state, '3.2 Our Preparation Strategies')

  strategies.strategiesByRisk.forEach((riskGroup, groupIndex) => {
    checkFormalPageBreak(doc, state, 70, '')

    // Risk group header
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(...LIGHT_GRAY)
    doc.rect(PAGE_LAYOUT.MARGIN_LEFT, state.currentY - 4, PAGE_LAYOUT.CONTENT_WIDTH, 8, 'F')
    doc.text(`Protection Against: ${riskGroup.riskName}`, PAGE_LAYOUT.MARGIN_LEFT + 2, state.currentY)
    state.currentY += 6

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Strategies Implemented: ${riskGroup.strategyCount}`, PAGE_LAYOUT.MARGIN_LEFT + 2, state.currentY)
    doc.text(`Total Investment: JMD ${riskGroup.totalInvestment.toLocaleString('en-US')}`, PAGE_LAYOUT.MARGIN_LEFT + 60, state.currentY)
    state.currentY += 8

    // Each strategy
    riskGroup.strategies.forEach((strategy, stratIndex) => {
      checkFormalPageBreak(doc, state, 50, '')

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(`${stratIndex + 1}. ${strategy.name}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
      state.currentY += 6

      doc.setFont('helvetica', 'italic')
      doc.setFontSize(9)
      doc.text('Purpose:', PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY)
      state.currentY += 4
      doc.setFont('helvetica', 'normal')
      const purposeLines = doc.splitTextToSize(strategy.purpose, PAGE_LAYOUT.CONTENT_WIDTH - 15)
      purposeLines.forEach((line: string) => {
        doc.text(line, PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY)
        state.currentY += 4
      })

      state.currentY += 3
      doc.setFont('helvetica', 'italic')
      doc.text('What This Gives Us:', PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY)
      state.currentY += 4
      doc.setFont('helvetica', 'normal')

      strategy.benefits.slice(0, 3).forEach(benefit => {
        doc.text('○', PAGE_LAYOUT.MARGIN_LEFT + 12, state.currentY)
        const benefitLines = doc.splitTextToSize(benefit, PAGE_LAYOUT.CONTENT_WIDTH - 20)
        benefitLines.forEach((line: string, idx: number) => {
          doc.text(line, PAGE_LAYOUT.MARGIN_LEFT + 16, state.currentY + (idx * 4))
        })
        state.currentY += (benefitLines.length * 4) + 2
      })

      state.currentY += 3
      doc.setFont('helvetica', 'italic')
      doc.text('Implementation Details:', PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY)
      state.currentY += 5

      const implDetails = [
        `Investment Required: ${strategy.implementation.investmentRequired}`,
        `Setup Time: ${strategy.implementation.setupTime}`,
        `Effectiveness: ${strategy.implementation.effectiveness}/10`,
        `Status: ${strategy.implementation.status}`,
        `Responsible Person: ${strategy.implementation.responsiblePerson}`
      ]

      doc.setFont('helvetica', 'normal')
      implDetails.forEach(detail => {
        doc.text('•', PAGE_LAYOUT.MARGIN_LEFT + 12, state.currentY)
        doc.text(detail, PAGE_LAYOUT.MARGIN_LEFT + 16, state.currentY)
        state.currentY += 4
      })

      if (strategy.keyActions.length > 0) {
        state.currentY += 3
        doc.setFont('helvetica', 'italic')
        doc.text('Key Actions Taken:', PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY)
        state.currentY += 5
        doc.setFont('helvetica', 'normal')

        strategy.keyActions.slice(0, 3).forEach(action => {
          checkFormalPageBreak(doc, state, 10, '')
          doc.text('✓', PAGE_LAYOUT.MARGIN_LEFT + 12, state.currentY)
          const actionLines = doc.splitTextToSize(action.action, PAGE_LAYOUT.CONTENT_WIDTH - 20)
          actionLines.forEach((line: string, idx: number) => {
            doc.text(line, PAGE_LAYOUT.MARGIN_LEFT + 16, state.currentY + (idx * 4))
          })
          state.currentY += (actionLines.length * 4) + 2
        })
      }

      state.currentY += 6
    })

    state.currentY += 4
  })

  // 3.3 Alternative Approaches (if available)
  if (strategies.lowBudgetAlternatives.length > 0) {
    checkPageBreak(doc, state, 40, '')
    addSubsectionHeader(doc, state, '3.3 Alternative Approaches')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('For businesses with limited budgets, we\'ve also identified these cost-effective alternatives:', 
      PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    state.currentY += 8

    strategies.lowBudgetAlternatives.forEach(alt => {
      doc.setFont('helvetica', 'bold')
      doc.text(`• ${alt.strategyName}:`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
      state.currentY += 5
      doc.setFont('helvetica', 'normal')
      const altLines = doc.splitTextToSize(alt.alternativeDescription, PAGE_LAYOUT.CONTENT_WIDTH - 10)
      altLines.forEach((line: string) => {
        doc.text(line, PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY)
        state.currentY += 4
      })
      state.currentY += 4
    })

    state.currentY += 4
  }

  // 3.4 Recovery Objectives
  if (strategies.recoveryObjectives.length > 0) {
    checkPageBreak(doc, state, 40, '')
    addSubsectionHeader(doc, state, '3.4 Recovery Objectives')

    const recoveryHeaders = ['Function', 'Target Recovery Time']
    const recoveryData = strategies.recoveryObjectives.map(obj => [
      obj.functionName,
      obj.targetRecoveryTime
    ])

    addDataTable(doc, state, recoveryHeaders, recoveryData)
  }
}

// ============================================================================
// SECTION 4: EMERGENCY RESPONSE
// ============================================================================

function generateEmergencyResponse(
  doc: jsPDF,
  state: PageState,
  response: FormalBCPData['emergencyResponse']
) {
  addSectionHeader(doc, state, '4. EMERGENCY RESPONSE PROCEDURES')

  // 4.1 Emergency Leadership
  addSubsectionHeader(doc, state, '4.1 Emergency Leadership')

  const leadershipHeaders = ['Role', 'Person', 'Contact']
  const leadershipData = response.emergencyLeadership.map(leader => [
    leader.role,
    leader.person,
    leader.contact
  ])

  addDataTable(doc, state, leadershipHeaders, leadershipData)
  state.currentY += 6

  // 4.2 Emergency Response Team
  if (response.responseTeam.length > 0) {
    checkPageBreak(doc, state, 50, '')
    addSubsectionHeader(doc, state, '4.2 Emergency Response Team')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Our team is trained to respond to emergencies:', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    state.currentY += 8

    const teamHeaders = ['Name', 'Normal Role', 'Emergency Responsibility', 'Contact']
    const teamData = response.responseTeam.slice(0, 5).map(member => [
      member.name,
      member.normalRole,
      member.emergencyResponsibility,
      member.contact
    ])

    addDataTable(doc, state, teamHeaders, teamData)
    state.currentY += 6
  }

  // 4.3 Critical Contacts
  checkPageBreak(doc, state, 60, '')
  addSubsectionHeader(doc, state, '4.3 Critical Contacts')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Emergency Services', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 6

  const emergencyHeaders = ['Service', 'Provider', 'Contact']
  const emergencyData = response.emergencyServices.map(svc => [
    svc.service,
    svc.provider,
    svc.contact
  ])

  addDataTable(doc, state, emergencyHeaders, emergencyData)
  state.currentY += 8

  // Essential Service Providers
  if (response.essentialProviders.length > 0) {
    checkPageBreak(doc, state, 50, '')
    doc.setFont('helvetica', 'bold')
    doc.text('Essential Service Providers', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    state.currentY += 6

    const providerHeaders = ['Service', 'Provider', 'Contact', 'Account #']
    const providerData = response.essentialProviders.slice(0, 6).map(prov => [
      prov.service,
      prov.provider,
      prov.contact,
      prov.accountNumber || 'N/A'
    ])

    addDataTable(doc, state, providerHeaders, providerData)
    state.currentY += 8
  }

  // Key Suppliers
  if (response.keySuppliers.length > 0) {
    checkPageBreak(doc, state, 50, '')
    doc.setFont('helvetica', 'bold')
    doc.text('Key Suppliers', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    state.currentY += 6

    const supplierHeaders = ['Supplier', 'Product/Service', 'Contact']
    const supplierData = response.keySuppliers.slice(0, 4).map(sup => [
      sup.supplier,
      sup.productService,
      sup.contact
    ])

    addDataTable(doc, state, supplierHeaders, supplierData)
    state.currentY += 8
  }

  // 4.4 Essential Documents
  if (response.essentialDocuments.length > 0) {
    checkFormalPageBreak(doc, state, 60, '')
    addSubsectionHeader(doc, state, '4.4 Essential Documents')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('We maintain backups of all critical business documents:', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    state.currentY += 8

    const docHeaders = ['Record Type', 'Primary Location', 'Backup Location']
    const docData = response.essentialDocuments.slice(0, 8).map(doc => [
      doc.recordType,
      doc.primaryLocation,
      doc.backupLocation
    ])

    addDataTable(doc, state, docHeaders, docData)
    state.currentY += 6

    doc.setFont('helvetica', 'bold')
    doc.text('Document Storage:', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
    state.currentY += 5
    doc.setFont('helvetica', 'normal')
    doc.text(`• Physical copies: ${response.documentStorage.physicalCopies}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    state.currentY += 5
    doc.text(`• Digital copies: ${response.documentStorage.digitalCopies}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  }
}

// ============================================================================
// SECTION 5: PLAN MAINTENANCE
// ============================================================================

function generatePlanMaintenance(
  doc: jsPDF,
  state: PageState,
  maintenance: FormalBCPData['planMaintenance']
) {
  addSectionHeader(doc, state, '5. PLAN MAINTENANCE & TESTING')

  // 5.1 Testing Schedule
  addSubsectionHeader(doc, state, '5.1 Testing Schedule')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('We regularly test our preparedness to ensure this plan works when needed:', 
    PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 8

  const testHeaders = ['Test Activity', 'Frequency', 'Next Test']
  const testData = maintenance.testingSchedule.map(test => [
    test.testActivity,
    test.frequency,
    test.nextTest
  ])

  addDataTable(doc, state, testHeaders, testData)
  state.currentY += 8

  // 5.2 Plan Review & Updates
  addSubsectionHeader(doc, state, '5.2 Plan Review & Updates')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Regular Reviews: This plan is reviewed ${maintenance.reviewInfo.regularReviews.toLowerCase()} to ensure it remains current and effective.`,
    PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 6
  doc.text(`Next Scheduled Review: ${maintenance.reviewInfo.nextScheduledReview}`,
    PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 8

  doc.setFont('helvetica', 'bold')
  doc.text('Plan Updates When:', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 6
  doc.setFont('helvetica', 'normal')

  maintenance.reviewInfo.updateTriggers.forEach(trigger => {
    doc.text('•', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    const triggerLines = doc.splitTextToSize(trigger, PAGE_LAYOUT.CONTENT_WIDTH - 10)
    triggerLines.forEach((line: string, idx: number) => {
      doc.text(line, PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY + (idx * 5))
    })
    state.currentY += (triggerLines.length * 5) + 2
  })

  state.currentY += 4
  doc.setFont('helvetica', 'bold')
  doc.text(`Responsibility: ${maintenance.reviewInfo.responsiblePerson} is responsible for ensuring the plan stays current and conducting regular tests.`,
    PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 10

  // 5.3 Staff Training
  addSubsectionHeader(doc, state, '5.3 Staff Training')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('All staff receive training on:', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 6

  maintenance.staffTraining.trainingTopics.forEach(topic => {
    doc.text('•', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    doc.text(topic, PAGE_LAYOUT.MARGIN_LEFT + 10, state.currentY)
    state.currentY += 5
  })

  state.currentY += 5
  doc.setFont('helvetica', 'bold')
  doc.text(`Training Schedule: ${maintenance.staffTraining.trainingSchedule}`,
    PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
}

// ============================================================================
// SECTION 6: APPENDICES
// ============================================================================

function generateAppendices(
  doc: jsPDF,
  state: PageState,
  appendices: FormalBCPData['appendices']
) {
  addSectionHeader(doc, state, '6. APPENDICES')

  // Appendix A: Plan Revision History
  addSubsectionHeader(doc, state, 'Appendix A: Plan Revision History')

  const revisionHeaders = ['Version', 'Date', 'Changes', 'Updated By']
  const revisionData = appendices.revisionHistory.map(rev => [
    rev.version,
    rev.date,
    rev.changes,
    rev.updatedBy
  ])

  addDataTable(doc, state, revisionHeaders, revisionData)
  state.currentY += 10

  // Appendix B: Plan Distribution
  if (appendices.planDistribution.length > 0) {
    checkPageBreak(doc, state, 40, '')
    addSubsectionHeader(doc, state, 'Appendix B: Plan Distribution')

    const distHeaders = ['Recipient', 'Date Provided', 'Format']
    const distData = appendices.planDistribution.map(dist => [
      dist.recipient,
      dist.dateProvided,
      dist.format
    ])

    addDataTable(doc, state, distHeaders, distData)
    state.currentY += 10
  }

  // Appendix C: Certifications & Support
  checkPageBreak(doc, state, 50, '')
  addSubsectionHeader(doc, state, 'Appendix C: Certifications & Support')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Technical Assistance Provided By:', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 6
  doc.setFont('helvetica', 'normal')

  appendices.certifications.technicalAssistance.forEach(org => {
    doc.text(`• ${org}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    state.currentY += 5
  })

  state.currentY += 5
  doc.setFont('helvetica', 'bold')
  doc.text('Industry Standards Referenced:', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 6
  doc.setFont('helvetica', 'normal')

  appendices.certifications.industryStandards.forEach(standard => {
    doc.text(`• ${standard}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    state.currentY += 5
  })

  // Appendix D: Plan Approval
  checkPageBreak(doc, state, 70, '')
  addSubsectionHeader(doc, state, 'Appendix D: Plan Approval')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const approvalText = `This Business Continuity Plan was prepared on ${appendices.approval.preparedDate} and is approved for implementation:`
  doc.text(approvalText, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 10

  doc.setFont('helvetica', 'bold')
  doc.text('Business Owner/Manager:', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 10

  // Signature line
  doc.setDrawColor(...BORDER_GRAY)
  doc.line(PAGE_LAYOUT.MARGIN_LEFT, state.currentY, PAGE_LAYOUT.MARGIN_LEFT + 80, state.currentY)
  state.currentY += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Signature', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 10

  doc.line(PAGE_LAYOUT.MARGIN_LEFT, state.currentY, PAGE_LAYOUT.MARGIN_LEFT + 80, state.currentY)
  state.currentY += 5
  doc.text('Printed Name & Title', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 10

  doc.line(PAGE_LAYOUT.MARGIN_LEFT, state.currentY, PAGE_LAYOUT.MARGIN_LEFT + 80, state.currentY)
  state.currentY += 5
  doc.text('Date', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 12

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Plan Manager Contact:', PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 6
  doc.setFont('helvetica', 'normal')
  doc.text(appendices.approval.planManagerName, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 5
  doc.text(`${appendices.approval.planManagerContact} | ${appendices.approval.planManagerEmail}`, 
    PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function addSectionHeader(doc: jsPDF, state: PageState, title: string) {
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...UNDP_BLUE)
  doc.text(title, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  
  // Underline
  doc.setDrawColor(...UNDP_BLUE)
  doc.setLineWidth(0.5)
  doc.line(PAGE_LAYOUT.MARGIN_LEFT, state.currentY + 2, 
    PAGE_LAYOUT.MARGIN_LEFT + doc.getTextWidth(title), state.currentY + 2)
  
  doc.setTextColor(...DARK_GRAY)
  state.currentY += 10
}

function addSubsectionHeader(doc: jsPDF, state: PageState, title: string) {
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK_GRAY)
  doc.text(title, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  state.currentY += 7
}

function addSimpleTable(doc: jsPDF, state: PageState, data: string[][]) {
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  data.forEach(row => {
    const [label, value] = row
    doc.setFont('helvetica', 'bold')
    doc.text(`${label}:`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    doc.setFont('helvetica', 'normal')
    
    const valueLines = doc.splitTextToSize(value, PAGE_LAYOUT.CONTENT_WIDTH - 50)
    valueLines.forEach((line: string, idx: number) => {
      doc.text(line, PAGE_LAYOUT.MARGIN_LEFT + 50, state.currentY + (idx * 5))
    })
    
    state.currentY += Math.max(5, valueLines.length * 5)
  })
}

function addDetailedTable(doc: jsPDF, state: PageState, data: string[][]) {
  ;(doc as any).autoTable({
    startY: state.currentY,
    head: [data[0]],
    body: data.slice(1),
    margin: { left: PAGE_LAYOUT.MARGIN_LEFT, right: PAGE_LAYOUT.MARGIN_RIGHT },
    headStyles: {
      fillColor: UNDP_BLUE,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: LIGHT_GRAY
    },
    theme: 'grid'
  })

  state.currentY = (doc as any).lastAutoTable.finalY + 5
}

function addDataTable(doc: jsPDF, state: PageState, headers: string[], data: string[][]) {
  ;(doc as any).autoTable({
    startY: state.currentY,
    head: [headers],
    body: data,
    margin: { left: PAGE_LAYOUT.MARGIN_LEFT, right: PAGE_LAYOUT.MARGIN_RIGHT },
    headStyles: {
      fillColor: UNDP_BLUE,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: LIGHT_GRAY
    },
    theme: 'striped'
  })

  state.currentY = (doc as any).lastAutoTable.finalY + 5
}

function addPageHeader(doc: jsPDF, businessName: string) {
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`${businessName} - Business Continuity Plan`, PAGE_LAYOUT.MARGIN_LEFT, 12)
  
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.3)
  doc.line(PAGE_LAYOUT.MARGIN_LEFT, 15, PAGE_LAYOUT.WIDTH - PAGE_LAYOUT.MARGIN_RIGHT, 15)
}

function addPageFooter(doc: jsPDF, pageNumber: number) {
  const footerY = PAGE_LAYOUT.HEIGHT - 15
  
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.3)
  doc.line(PAGE_LAYOUT.MARGIN_LEFT, footerY - 5, PAGE_LAYOUT.WIDTH - PAGE_LAYOUT.MARGIN_RIGHT, footerY - 5)
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(100, 100, 100)
  doc.text('UNDP in cooperation with CARICHAM', PAGE_LAYOUT.WIDTH / 2, footerY, { align: 'center' })
  
  doc.setFont('helvetica', 'normal')
  doc.text(`Page ${pageNumber}`, PAGE_LAYOUT.WIDTH - PAGE_LAYOUT.MARGIN_RIGHT, footerY, { align: 'right' })
}

function checkFormalPageBreak(doc: jsPDF, state: PageState, requiredSpace: number, businessName: string) {
  if (state.currentY + requiredSpace > PAGE_LAYOUT.MAX_Y) {
    doc.addPage()
    state.pageNumber++
    state.currentY = PAGE_LAYOUT.MARGIN_TOP + 10
    if (businessName) {
      addPageHeader(doc, businessName)
      state.currentY += 10
    }
    addPageFooter(doc, state.pageNumber)
  }
}


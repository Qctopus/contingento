/**
 * Action Workbook PDF Generator
 * 
 * Generates a practical, step-by-step implementation guide for business owners
 * 
 * Features:
 * - Checkboxes throughout
 * - Fill-in sections
 * - Progress trackers
 * - Budget worksheets
 * - Real Caribbean examples
 * 
 * Format: Interactive, printable workbook (20-30 pages)
 */

import { jsPDF } from 'jspdf'
import type { WorkbookBCPData } from '../../types/bcpExports'
import {
  PAGE_LAYOUT,
  WORKBOOK_STYLES,
  formatCurrency,
  getRiskLevelColor
} from './pdfStyles'
import {
  PageState,
  checkPageBreak,
  addSectionHeader,
  addSubSectionHeader,
  addCheckbox,
  addChecklistItem,
  addCalloutBox,
  addBulletList,
  addHorizontalLine,
  addMultiLineText,
  addNumberedList
} from './pdfHelpers'

/**
 * Generate Action Workbook PDF
 */
export async function generateWorkbookPDF(data: WorkbookBCPData): Promise<Blob> {
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
  generateWorkbookCover(doc, data)

  // Quick Start Guide
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  generateQuickStartGuide(doc, state, data)

  // Risk Profiles
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  generateRiskProfiles(doc, state, data)

  // Implementation Guides
  data.implementationGuides.forEach((guide, index) => {
    doc.addPage()
    state.pageNumber++
    state.currentY = PAGE_LAYOUT.MARGIN_TOP
    generateImplementationGuide(doc, state, guide, index + 1)
  })

  // Contact Lists
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  generateContactLists(doc, state, data)

  // Progress Trackers
  doc.addPage()
  state.pageNumber++
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  generateProgressTrackers(doc, state, data)

  return doc.output('blob')
}

// ============================================================================
// COVER PAGE
// ============================================================================

function generateWorkbookCover(doc: jsPDF, data: WorkbookBCPData): void {
  const centerX = PAGE_LAYOUT.WIDTH / 2

  // Header with accent color
  doc.setFillColor(WORKBOOK_STYLES.colors.primary.r, WORKBOOK_STYLES.colors.primary.g, WORKBOOK_STYLES.colors.primary.b)
  doc.rect(0, 0, PAGE_LAYOUT.WIDTH, 50, 'F')

  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('BUSINESS CONTINUITY', centerX, 25, { align: 'center' })
  doc.text('ACTION WORKBOOK', centerX, 38, { align: 'center' })

  // Business name
  doc.setTextColor(WORKBOOK_STYLES.colors.text.r, WORKBOOK_STYLES.colors.text.g, WORKBOOK_STYLES.colors.text.b)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(data.coverPage.businessName, centerX, 70, { align: 'center' })

  // Icon box
  doc.setFillColor(WORKBOOK_STYLES.colors.background.r, WORKBOOK_STYLES.colors.background.g, WORKBOOK_STYLES.colors.background.b)
  doc.roundedRect(PAGE_LAYOUT.MARGIN_LEFT + 30, 85, PAGE_LAYOUT.CONTENT_WIDTH - 60, 60, 5, 5, 'F')

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(WORKBOOK_STYLES.colors.text.r, WORKBOOK_STYLES.colors.text.g, WORKBOOK_STYLES.colors.text.b)
  
  doc.text('📋 Step-by-Step Implementation Guide', centerX, 100, { align: 'center' })
  doc.text('✅ Checklistsfor Every Action', centerX, 110, { align: 'center' })
  doc.text('💰 Budget Worksheets Included', centerX, 120, { align: 'center' })
  doc.text('📊 Progress Trackers', centerX, 130, { align: 'center' })

  // Progress indicator
  doc.setFillColor(WORKBOOK_STYLES.colors.success.r, WORKBOOK_STYLES.colors.success.g, WORKBOOK_STYLES.colors.success.b)
  const progressWidth = (PAGE_LAYOUT.CONTENT_WIDTH - 60) * (data.coverPage.completionPercentage / 100)
  doc.roundedRect(PAGE_LAYOUT.MARGIN_LEFT + 30, 160, PAGE_LAYOUT.CONTENT_WIDTH - 60, 10, 3, 3, 'S')
  doc.roundedRect(PAGE_LAYOUT.MARGIN_LEFT + 30, 160, progressWidth, 10, 3, 3, 'F')
  
  doc.setFontSize(10)
  doc.text(`${data.coverPage.completionPercentage}% Complete`, centerX, 177, { align: 'center' })

  // Prepared info
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Prepared: ${data.coverPage.preparedDate}`, centerX, 195, { align: 'center' })
  doc.text(`Prepared by: ${data.coverPage.preparedBy}`, centerX, 203, { align: 'center' })

  // Call to action box
  doc.setFillColor(WORKBOOK_STYLES.colors.accent.r, WORKBOOK_STYLES.colors.accent.g, WORKBOOK_STYLES.colors.accent.b)
  doc.roundedRect(PAGE_LAYOUT.MARGIN_LEFT, 220, PAGE_LAYOUT.CONTENT_WIDTH, 30, 5, 5, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('START HERE! ➜', centerX, 233, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Turn to the Quick Start Guide on the next page', centerX, 242, { align: 'center' })

  // Footer
  doc.setTextColor(WORKBOOK_STYLES.colors.textLight.r, WORKBOOK_STYLES.colors.textLight.g, WORKBOOK_STYLES.colors.textLight.b)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text('UNDP in cooperation with CARICHAM', centerX, PAGE_LAYOUT.HEIGHT - 15, { align: 'center' })
  doc.text('Your practical guide to business resilience', centerX, PAGE_LAYOUT.HEIGHT - 10, { align: 'center' })
}

// ============================================================================
// QUICK START GUIDE
// ============================================================================

function generateQuickStartGuide(doc: jsPDF, state: PageState, data: WorkbookBCPData): void {
  addSectionHeader(doc, state, '🚀 QUICK START GUIDE', {
    fontSize: WORKBOOK_STYLES.fontSize.sectionHeader,
    color: WORKBOOK_STYLES.colors.primary,
    spaceAfter: 8
  })

  // How to Use This Workbook
  addCalloutBox(doc, state, '💡 How to Use This Workbook', 
    data.quickStartGuide.howToUse.join(' • '), 
    { type: 'tip' }
  )

  // 30-Day Action Plan
  addSubSectionHeader(doc, state, 'Your 30-Day Action Plan')

  doc.setFontSize(WORKBOOK_STYLES.fontSize.body)
  doc.setFont('helvetica', 'normal')

  data.quickStartGuide.thirtyDayPlan.forEach(item => {
    checkPageBreak(doc, state, 25)

    // Day marker
    doc.setFillColor(WORKBOOK_STYLES.colors.primary.r, WORKBOOK_STYLES.colors.primary.g, WORKBOOK_STYLES.colors.primary.b)
    doc.circle(PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY - 2, 3, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(`${item.day}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY, { align: 'center' })

    // Milestone
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(WORKBOOK_STYLES.fontSize.body)
    doc.setFont('helvetica', 'bold')
    doc.text(item.milestone, PAGE_LAYOUT.MARGIN_LEFT + 12, state.currentY)
    state.currentY += 6

    // Actions
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(WORKBOOK_STYLES.fontSize.small)
    item.actions.forEach(action => {
      doc.text(`  • ${action}`, PAGE_LAYOUT.MARGIN_LEFT + 12, state.currentY)
      state.currentY += 5
    })

    doc.setFont('helvetica', 'italic')
    doc.setTextColor(WORKBOOK_STYLES.colors.textLight.r, WORKBOOK_STYLES.colors.textLight.g, WORKBOOK_STYLES.colors.textLight.b)
    doc.text(`Time needed: ${item.estimatedTime}`, PAGE_LAYOUT.MARGIN_LEFT + 12, state.currentY)
    doc.setTextColor(0, 0, 0)
    state.currentY += 10
  })

  // Immediate Actions Checklist
  checkPageBreak(doc, state, 40)
  addSubSectionHeader(doc, state, '⚡ Immediate Actions - Do These First!')

  data.quickStartGuide.immediateActions.forEach(action => {
    checkPageBreak(doc, state, 12)
    addChecklistItem(doc, state, `${action.task} (${action.estimatedTime})`, {
      checked: action.completed,
      indent: 10
    })
  })

  // Budget Summary
  checkPageBreak(doc, state, 50)
  addSubSectionHeader(doc, state, '💰 Budget Planning Worksheet')

  const budget = data.quickStartGuide.budgetWorksheet.totalEstimatedCost

  doc.setFontSize(WORKBOOK_STYLES.fontSize.body)
  doc.setFont('helvetica', 'normal')
  
  const budgetOptions = [
    { tier: 'Budget', amount: budget.budget, desc: 'Basic protection with DIY options' },
    { tier: 'Standard', amount: budget.standard, desc: 'Recommended for most businesses' },
    { tier: 'Premium', amount: budget.premium, desc: 'Comprehensive protection' }
  ]

  budgetOptions.forEach(option => {
    checkPageBreak(doc, state, 15)

    addCheckbox(PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY - 3, 4, false)
    
    doc.setFont('helvetica', 'bold')
    doc.text(`${option.tier}: ${formatCurrency(option.amount, budget.currency)}`, PAGE_LAYOUT.MARGIN_LEFT + 12, state.currentY)
    state.currentY += 5

    doc.setFont('helvetica', 'italic')
    doc.setFontSize(WORKBOOK_STYLES.fontSize.small)
    doc.setTextColor(WORKBOOK_STYLES.colors.textLight.r, WORKBOOK_STYLES.colors.textLight.g, WORKBOOK_STYLES.colors.textLight.b)
    doc.text(option.desc, PAGE_LAYOUT.MARGIN_LEFT + 12, state.currentY)
    doc.setTextColor(0, 0, 0)
    state.currentY += 8
  })

  addPageFooter(doc, state.pageNumber)
}

// ============================================================================
// RISK PROFILES
// ============================================================================

function generateRiskProfiles(doc: jsPDF, state: PageState, data: WorkbookBCPData): void {
  addSectionHeader(doc, state, '⚠️ YOUR RISK PROFILE', {
    fontSize: WORKBOOK_STYLES.fontSize.sectionHeader,
    color: WORKBOOK_STYLES.colors.danger,
    spaceAfter: 8
  })

  addCalloutBox(doc, state, 'Why Understanding Your Risks Matters',
    'Every business faces unique risks. Understanding YOUR specific risks helps you prepare effectively and invest wisely in protection.',
    { type: 'important' }
  )

  data.riskProfiles.forEach((risk, index) => {
    if (index > 0) {
      doc.addPage()
      state.pageNumber++
      state.currentY = PAGE_LAYOUT.MARGIN_TOP
    }

    // Risk name header with color
    const riskColor = getRiskLevelColor(risk.riskLevel)
    doc.setFillColor(riskColor.r, riskColor.g, riskColor.b)
    doc.roundedRect(PAGE_LAYOUT.MARGIN_LEFT, state.currentY, PAGE_LAYOUT.CONTENT_WIDTH, 15, 3, 3, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`${risk.riskName} - ${risk.riskLevel} Risk`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY + 10)
    state.currentY += 20

    // Risk meter
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(1)
    doc.roundedRect(PAGE_LAYOUT.MARGIN_LEFT, state.currentY, PAGE_LAYOUT.CONTENT_WIDTH, 8, 2, 2, 'S')
    
    const meterWidth = (PAGE_LAYOUT.CONTENT_WIDTH * risk.riskMeter.value) / risk.riskMeter.max
    doc.setFillColor(riskColor.r, riskColor.g, riskColor.b)
    doc.roundedRect(PAGE_LAYOUT.MARGIN_LEFT, state.currentY, meterWidth, 8, 2, 2, 'F')
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Risk Score: ${risk.riskScore} / ${risk.riskMeter.max}`, PAGE_LAYOUT.MARGIN_LEFT + PAGE_LAYOUT.CONTENT_WIDTH - 30, state.currentY + 5)
    state.currentY += 15

    // Why this matters
    addSubSectionHeader(doc, state, '📌 Why This Matters to YOUR Business')
    doc.setFontSize(WORKBOOK_STYLES.fontSize.body)
    doc.setFont('helvetica', 'normal')
    addMultiLineText(doc, risk.whyThisMatters, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY, PAGE_LAYOUT.CONTENT_WIDTH - 10)
    state.currentY += 12

    // Real impact story
    addCalloutBox(doc, state, '📖 Real Caribbean Business Story', risk.realImpactStory, { type: 'info' })

    // Cost of doing nothing
    addSubSectionHeader(doc, state, '💸 Cost of Doing Nothing')
    
    doc.setFillColor(254, 242, 242)
    doc.roundedRect(PAGE_LAYOUT.MARGIN_LEFT, state.currentY, PAGE_LAYOUT.CONTENT_WIDTH, 25, 3, 3, 'F')
    
    doc.setFontSize(WORKBOOK_STYLES.fontSize.body)
    doc.setFont('helvetica', 'normal')
    doc.text(risk.costOfDoingNothing.description, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY + 7, {
      maxWidth: PAGE_LAYOUT.CONTENT_WIDTH - 10
    })
    
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(WORKBOOK_STYLES.colors.danger.r, WORKBOOK_STYLES.colors.danger.g, WORKBOOK_STYLES.colors.danger.b)
    doc.setFontSize(12)
    doc.text(`Potential Loss: ${formatCurrency(risk.costOfDoingNothing.estimatedLoss, risk.costOfDoingNothing.currency)}`,
      PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY + 20)
    doc.setTextColor(0, 0, 0)
    state.currentY += 30

    addPageFooter(doc, state.pageNumber)
  })
}

// ============================================================================
// IMPLEMENTATION GUIDES
// ============================================================================

function generateImplementationGuide(doc: jsPDF, state: PageState, guide: any, guideNumber: number): void {
  // Guide header
  addSectionHeader(doc, state, `STRATEGY ${guideNumber}: ${guide.strategyName.toUpperCase()}`, {
    fontSize: WORKBOOK_STYLES.fontSize.sectionHeader,
    color: WORKBOOK_STYLES.colors.primary,
    spaceAfter: 8
  })

  // Purpose
  doc.setFontSize(WORKBOOK_STYLES.fontSize.body)
  doc.setFont('helvetica', 'normal')
  addMultiLineText(doc, guide.strategyPurpose, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY, PAGE_LAYOUT.CONTENT_WIDTH - 10)
  state.currentY += 12

  // Cost breakdown
  addSubSectionHeader(doc, state, '💰 Investment Options')

  const costs = [
    { tier: 'Budget', amount: guide.costBreakdown.budget, icon: '💵' },
    { tier: 'Standard', amount: guide.costBreakdown.standard, icon: '💵💵' },
    { tier: 'Premium', amount: guide.costBreakdown.premium, icon: '💵💵💵' }
  ]

  costs.forEach(cost => {
    addCheckbox(PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY - 3, 4, false)
    doc.text(`${cost.icon} ${cost.tier}: ${formatCurrency(cost.amount, guide.costBreakdown.currency)}`, 
      PAGE_LAYOUT.MARGIN_LEFT + 12, state.currentY)
    state.currentY += 7
  })
  state.currentY += 5

  // Benefits
  addSubSectionHeader(doc, state, '✨ What You Get')
  addBulletList(doc, state, guide.benefits, { indent: 10 })

  // Time investment
  doc.setFont('helvetica', 'italic')
  doc.text(`⏱️ Time needed: ${guide.timeInvestment}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  state.currentY += 12

  // BEFORE phase
  checkPageBreak(doc, state, 40)
  generateActionPhase(doc, state, guide.beforePhase, 'before')

  // DURING phase  
  checkPageBreak(doc, state, 40)
  generateActionPhase(doc, state, guide.duringPhase, 'during')

  // AFTER phase
  checkPageBreak(doc, state, 40)
  generateActionPhase(doc, state, guide.afterPhase, 'after')

  // ONGOING maintenance
  checkPageBreak(doc, state, 40)
  generateOngoingPhase(doc, state, guide.ongoingPhase)

  // Progress tracker
  checkPageBreak(doc, state, 50)
  addSubSectionHeader(doc, state, '📊 Your Progress Tracker')

  guide.progressTracker.milestones.forEach((milestone: any) => {
    checkPageBreak(doc, state, 12)
    addCheckbox(PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY - 3, 4, milestone.completed)
    doc.setFont('helvetica', 'bold')
    doc.text(`${milestone.percentage}% - ${milestone.label}`, PAGE_LAYOUT.MARGIN_LEFT + 12, state.currentY)
    
    if (milestone.completedDate) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(WORKBOOK_STYLES.fontSize.small)
      doc.text(`(Completed: ${milestone.completedDate})`, PAGE_LAYOUT.MARGIN_LEFT + 80, state.currentY)
    }
    state.currentY += 8
  })

  addPageFooter(doc, state.pageNumber)
}

function generateActionPhase(doc: jsPDF, state: PageState, phase: any, phaseType: string): void {
  const phaseIcons: Record<string, string> = {
    'before': '🔧',
    'during': '🚨',
    'after': '🔄'
  }

  const phaseColors: Record<string, any> = {
    'before': WORKBOOK_STYLES.colors.info,
    'during': WORKBOOK_STYLES.colors.warning,
    'after': WORKBOOK_STYLES.colors.success
  }

  const icon = phaseIcons[phaseType] || '📋'
  const color = phaseColors[phaseType] || WORKBOOK_STYLES.colors.primary

  // Phase header
  doc.setFillColor(color.r, color.g, color.b)
  doc.roundedRect(PAGE_LAYOUT.MARGIN_LEFT, state.currentY, PAGE_LAYOUT.CONTENT_WIDTH, 12, 3, 3, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`${icon} ${phase.title}`, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY + 8)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text(`(${phase.timeframe})`, PAGE_LAYOUT.WIDTH - PAGE_LAYOUT.MARGIN_RIGHT - 5, state.currentY + 8, { align: 'right' })
  state.currentY += 17

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(WORKBOOK_STYLES.fontSize.small)
  doc.setFont('helvetica', 'italic')
  addMultiLineText(doc, phase.description, PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY, PAGE_LAYOUT.CONTENT_WIDTH - 10)
  state.currentY += 10

  // Steps
  phase.steps.forEach((step: any) => {
    checkPageBreak(doc, state, 35)

    // Step checkbox and action
    addCheckbox(PAGE_LAYOUT.MARGIN_LEFT + 8, state.currentY - 3, 4, step.completed)
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(WORKBOOK_STYLES.fontSize.body)
    doc.text(`Step ${step.stepNumber}: ${step.action}`, PAGE_LAYOUT.MARGIN_LEFT + 15, state.currentY)
    state.currentY += 6

    // Time estimate
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(WORKBOOK_STYLES.fontSize.small)
    doc.setTextColor(WORKBOOK_STYLES.colors.textLight.r, WORKBOOK_STYLES.colors.textLight.g, WORKBOOK_STYLES.colors.textLight.b)
    doc.text(`⏱️ ${step.estimatedTime}`, PAGE_LAYOUT.MARGIN_LEFT + 15, state.currentY)
    doc.setTextColor(0, 0, 0)
    state.currentY += 6

    // Why
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(WORKBOOK_STYLES.fontSize.small)
    doc.text(`💡 Why: ${step.why}`, PAGE_LAYOUT.MARGIN_LEFT + 15, state.currentY)
    state.currentY += 5

    // Done when
    doc.text(`✅ Done when: ${step.doneWhen}`, PAGE_LAYOUT.MARGIN_LEFT + 15, state.currentY)
    state.currentY += 5

    // Free alternative (if available)
    if (step.freeAlternative) {
      doc.setTextColor(WORKBOOK_STYLES.colors.success.r, WORKBOOK_STYLES.colors.success.g, WORKBOOK_STYLES.colors.success.b)
      doc.text(`💵 Free option: ${step.freeAlternative}`, PAGE_LAYOUT.MARGIN_LEFT + 15, state.currentY)
      doc.setTextColor(0, 0, 0)
      state.currentY += 5
    }

    state.currentY += 8
  })
}

function generateOngoingPhase(doc: jsPDF, state: PageState, ongoing: any): void {
  addSubSectionHeader(doc, state, '🔁 Ongoing Maintenance')

  // Monthly
  if (ongoing.monthly && ongoing.monthly.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(WORKBOOK_STYLES.fontSize.body)
    doc.text('📅 Monthly:', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    state.currentY += 6

    ongoing.monthly.forEach((task: any) => {
      checkPageBreak(doc, state, 10)
      addChecklistItem(doc, state, `${task.task} (${task.estimatedTime})`, {
        checked: task.completed,
        indent: 12
      })
    })
    state.currentY += 5
  }

  // Quarterly
  if (ongoing.quarterly && ongoing.quarterly.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.text('📅 Quarterly:', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    state.currentY += 6

    ongoing.quarterly.forEach((task: any) => {
      checkPageBreak(doc, state, 10)
      addChecklistItem(doc, state, `${task.task} (${task.estimatedTime})`, {
        checked: task.completed,
        indent: 12
      })
    })
    state.currentY += 5
  }

  // Annually
  if (ongoing.annually && ongoing.annually.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.text('📅 Annually:', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
    state.currentY += 6

    ongoing.annually.forEach((task: any) => {
      checkPageBreak(doc, state, 10)
      addChecklistItem(doc, state, `${task.task} (${task.estimatedTime})`, {
        checked: task.completed,
        indent: 12
      })
    })
  }
}

// ============================================================================
// CONTACT LISTS
// ============================================================================

function generateContactLists(doc: jsPDF, state: PageState, data: WorkbookBCPData): void {
  addSectionHeader(doc, state, '📞 CONTACT LISTS', {
    fontSize: WORKBOOK_STYLES.fontSize.sectionHeader,
    color: WORKBOOK_STYLES.colors.primary,
    spaceAfter: 8
  })

  addCalloutBox(doc, state, '⚠️ Keep This Updated!',
    'Verify all contact numbers quarterly. Update immediately when someone leaves or changes their number.',
    { type: 'warning' }
  )

  // Emergency contacts
  addSubSectionHeader(doc, state, '🚨 Emergency Contacts')

  data.contactLists.emergencyContacts.slice(0, 10).forEach(contact => {
    checkPageBreak(doc, state, 20)

    addCheckbox(PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY - 3, 4, contact.verified)
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(WORKBOOK_STYLES.fontSize.body)
    doc.text(contact.name, PAGE_LAYOUT.MARGIN_LEFT + 12, state.currentY)
    state.currentY += 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(WORKBOOK_STYLES.fontSize.small)
    doc.text(`Role: ${contact.role}`, PAGE_LAYOUT.MARGIN_LEFT + 12, state.currentY)
    state.currentY += 5

    doc.text(`Phone: ${contact.phone}`, PAGE_LAYOUT.MARGIN_LEFT + 12, state.currentY)
    if (contact.alternatePhone) {
      doc.text(` | Alt: ${contact.alternatePhone}`, PAGE_LAYOUT.MARGIN_LEFT + 60, state.currentY)
    }
    state.currentY += 5

    if (contact.email) {
      doc.text(`Email: ${contact.email}`, PAGE_LAYOUT.MARGIN_LEFT + 12, state.currentY)
      state.currentY += 5
    }

    // Notes section (fillable)
    doc.setTextColor(WORKBOOK_STYLES.colors.textLight.r, WORKBOOK_STYLES.colors.textLight.g, WORKBOOK_STYLES.colors.textLight.b)
    doc.text('Notes: _______________________________________________', PAGE_LAYOUT.MARGIN_LEFT + 12, state.currentY)
    doc.setTextColor(0, 0, 0)
    state.currentY += 10
  })

  addPageFooter(doc, state.pageNumber)
}

// ============================================================================
// PROGRESS TRACKERS
// ============================================================================

function generateProgressTrackers(doc: jsPDF, state: PageState, data: WorkbookBCPData): void {
  addSectionHeader(doc, state, '📊 PROGRESS TRACKERS', {
    fontSize: WORKBOOK_STYLES.fontSize.sectionHeader,
    color: WORKBOOK_STYLES.colors.primary,
    spaceAfter: 8
  })

  // Monthly testing tracker
  addSubSectionHeader(doc, state, '📅 Monthly Testing Checklist')

  const monthlyTests = [
    'Verify emergency contact numbers',
    'Test backup systems',
    'Check emergency supplies',
    'Review action plans',
    'Update contact lists as needed'
  ]

  monthlyTests.forEach(test => {
    checkPageBreak(doc, state, 10)
    addChecklistItem(doc, state, test, { checked: false, indent: 10 })
  })

  state.currentY += 10

  // Quarterly review tracker
  addSubSectionHeader(doc, state, '📋 Quarterly Review Checklist')

  const quarterlyTasks = [
    'Full communication drill with all staff',
    'Review and update risk assessment',
    'Test all continuity strategies',
    'Update budget and cost estimates',
    'Review supplier relationships',
    'Update vital records inventory'
  ]

  quarterlyTasks.forEach(task => {
    checkPageBreak(doc, state, 10)
    addChecklistItem(doc, state, task, { checked: false, indent: 10 })
  })

  state.currentY += 10

  // Lessons learned log
  checkPageBreak(doc, state, 60)
  addSubSectionHeader(doc, state, '📝 Lessons Learned Log')

  doc.setFontSize(WORKBOOK_STYLES.fontSize.small)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(WORKBOOK_STYLES.colors.textLight.r, WORKBOOK_STYLES.colors.textLight.g, WORKBOOK_STYLES.colors.textLight.b)
  doc.text('Use this space to record what worked and what didn\'t after tests or real events:', PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY)
  doc.setTextColor(0, 0, 0)
  state.currentY += 10

  // Blank log entries
  for (let i = 0; i < 3; i++) {
    checkPageBreak(doc, state, 35)

    doc.setDrawColor(WORKBOOK_STYLES.colors.checkboxBorder.r, WORKBOOK_STYLES.colors.checkboxBorder.g, WORKBOOK_STYLES.colors.checkboxBorder.b)
    doc.roundedRect(PAGE_LAYOUT.MARGIN_LEFT + 5, state.currentY, PAGE_LAYOUT.CONTENT_WIDTH - 10, 30, 2, 2, 'S')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(WORKBOOK_STYLES.fontSize.small)
    doc.text('Date: ________________', PAGE_LAYOUT.MARGIN_LEFT + 8, state.currentY + 5)
    doc.text('Event: _____________________________________________', PAGE_LAYOUT.MARGIN_LEFT + 8, state.currentY + 10)
    doc.text('What worked: _______________________________________', PAGE_LAYOUT.MARGIN_LEFT + 8, state.currentY + 15)
    doc.text('What to improve: ___________________________________', PAGE_LAYOUT.MARGIN_LEFT + 8, state.currentY + 20)
    doc.text('Action taken: ______________________________________', PAGE_LAYOUT.MARGIN_LEFT + 8, state.currentY + 25)

    state.currentY += 35
  }

  addPageFooter(doc, state.pageNumber)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function addPageFooter(doc: jsPDF, pageNumber: number): void {
  const footerY = PAGE_LAYOUT.HEIGHT - 15

  doc.setFontSize(8)
  doc.setTextColor(WORKBOOK_STYLES.colors.textLight.r, WORKBOOK_STYLES.colors.textLight.g, WORKBOOK_STYLES.colors.textLight.b)
  doc.setFont('helvetica', 'italic')

  doc.text('UNDP x CARICHAM | Business Continuity Action Workbook', PAGE_LAYOUT.WIDTH / 2, footerY, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.text(`Page ${pageNumber}`, PAGE_LAYOUT.WIDTH - PAGE_LAYOUT.MARGIN_RIGHT, footerY, { align: 'right' })
}




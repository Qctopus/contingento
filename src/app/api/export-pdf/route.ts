import { NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { centralDataService } from '../../../services/centralDataService'
import type { Strategy } from '../../../types/admin'

// Transformation functions for consistent labeling
const HAZARD_LABELS: { [key: string]: string } = {
  'hurricane': 'Hurricane/Tropical Storm',
  'power_outage': 'Extended Power Outage',
  'cyber_attack': 'Cyber Attack/Security Breach',
  'fire': 'Fire Emergency',
  'earthquake': 'Earthquake',
  'flood': 'Flooding',
  'drought': 'Drought/Water Shortage',
  'volcanic_activity': 'Volcanic Activity'
}

const STRATEGY_LABELS: { [key: string]: string } = {
  'prevention': 'Prevention Strategies',
  'response': 'Response Strategies', 
  'recovery': 'Recovery Strategies'
}

function transformHazardName(hazardCode: string): string {
  if (typeof hazardCode !== 'string') return String(hazardCode || '')
  return HAZARD_LABELS[hazardCode] || hazardCode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function transformStrategyName(strategyCode: string): string {
  if (typeof strategyCode !== 'string') return String(strategyCode || '')
  return STRATEGY_LABELS[strategyCode] || strategyCode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Generate action plans using database strategies
function generateHazardActionPlansForPDF(formData: any, riskAssessment: any, strategies: Strategy[]): any[] {
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

  // Generate action plans for each priority hazard
  return priorityHazards.map(risk => {
    const hazardName = transformHazardName(risk.hazard || risk.Hazard || '')
    const riskLevel = risk.riskLevel || risk.RiskLevel || 'High'
    
    // Find relevant strategies from database
    const relevantStrategies = strategies.filter(strategy => {
      // Check if strategy applies to this risk type
      return strategy.applicableRisks?.includes(risk.hazard) || 
             strategy.applicableRisks?.includes(risk.Hazard) ||
             strategy.name.toLowerCase().includes(hazardName.toLowerCase())
    })

    // Transform database strategies into action plan format
    const immediateActions = relevantStrategies
      .filter(s => s.actionSteps?.some(step => step.phase === 'immediate'))
      .flatMap(s => s.actionSteps?.filter(step => step.phase === 'immediate').map(step => ({
        task: step.smeAction || step.action,
        responsible: step.responsibility || 'Management',
        duration: step.timeframe || '1 hour',
        priority: s.priority === 'critical' ? 'high' as const : 
                 s.priority === 'high' ? 'high' as const : 'medium' as const
      })) || [])

    const shortTermActions = relevantStrategies
      .filter(s => s.actionSteps?.some(step => step.phase === 'short_term'))
      .flatMap(s => s.actionSteps?.filter(step => step.phase === 'short_term').map(step => ({
        task: step.smeAction || step.action,
        responsible: step.responsibility || 'Operations Team',
        duration: step.timeframe || '1 day',
        priority: s.priority === 'critical' ? 'high' as const : 'medium' as const
      })) || [])

    const mediumTermActions = relevantStrategies
      .filter(s => s.actionSteps?.some(step => step.phase === 'medium_term'))
      .flatMap(s => s.actionSteps?.filter(step => step.phase === 'medium_term').map(step => ({
        task: step.smeAction || step.action,
        responsible: step.responsibility || 'Management',
        duration: step.timeframe || '1 week',
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
      businessType: 'Database-driven',
      affectedFunctions: 'All critical business operations',
      specificConsiderations: relevantStrategies.map(s => s.whyImportant || s.description).filter(Boolean),
      resourcesNeeded: relevantStrategies.flatMap(s => 
        s.actionSteps?.map(step => step.resources).filter(Boolean) || []
      ).length > 0 ? 
        Array.from(new Set(relevantStrategies.flatMap(s =>
          s.actionSteps?.map(step => step.resources).filter(Boolean) || []
        ))) : 
        fallbackActions.resourcesNeeded,
      immediateActions: immediateActions.length > 0 ? immediateActions : fallbackActions.immediateActions,
      shortTermActions: shortTermActions.length > 0 ? shortTermActions : fallbackActions.shortTermActions,
      mediumTermActions: mediumTermActions.length > 0 ? mediumTermActions : fallbackActions.mediumTermActions,
      longTermReduction: longTermReduction.length > 0 ? longTermReduction : fallbackActions.longTermReduction
    }
  })
}

export async function POST(req: Request) {
  try {
    const { planData } = await req.json()

    if (!planData) {
      return NextResponse.json(
        { error: 'No plan data provided' },
        { status: 400 }
      )
    }

    // Load strategies from database for action plans
    let strategies: Strategy[] = []
    try {
      strategies = await centralDataService.getStrategies()
    } catch (error) {
      console.error('Failed to load strategies for PDF:', error)
      // Continue with empty strategies - fallback actions will be used
    }

    // Create PDF with professional settings
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    })
    
    // Page setup constants
    const PAGE_WIDTH = 210
    const PAGE_HEIGHT = 297
    const MARGIN_LEFT = 20
    const MARGIN_RIGHT = 20
    const MARGIN_TOP = 20
    const MARGIN_BOTTOM = 25
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
    const MAX_Y = PAGE_HEIGHT - MARGIN_BOTTOM
    
    let currentY = MARGIN_TOP
    let pageNumber = 1
    
    // Helper function to check page break
    const checkPageBreak = (requiredSpace: number = 20) => {
      if (currentY + requiredSpace > MAX_Y) {
        doc.addPage()
        currentY = MARGIN_TOP
        pageNumber++
        addPageFooter(pageNumber)
        return true
      }
      return false
    }
    
    // Add footer to pages
    const addPageFooter = (pageNum: number) => {
      if (pageNum > 1) { // Skip cover page
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        doc.setFont('helvetica', 'normal')
        
        const footerY = PAGE_HEIGHT - 15
        doc.setDrawColor(200, 200, 200)
        doc.line(MARGIN_LEFT, footerY - 5, PAGE_WIDTH - MARGIN_RIGHT, footerY - 5)
        
        // UNDP and CARICHAM attribution
        doc.setFont('helvetica', 'italic')
        doc.text('UNDP in cooperation with CARICHAM', PAGE_WIDTH / 2, footerY, { align: 'center' })
      }
    }
    
    // Company name extraction
    const rawCompanyName = planData.PLAN_INFORMATION?.['Company Name'] || 'Your Company'
    const companyName = rawCompanyName.replace(/^[•\-\*]\s*/, '').trim()

    // Enhanced section header with better styling
    const addSectionHeader = (title: string) => {
      checkPageBreak(25)
      
      currentY += 10
      
      // Gradient-style background
      doc.setFillColor(41, 84, 121)
      doc.rect(MARGIN_LEFT - 5, currentY - 8, CONTENT_WIDTH + 10, 14, 'F')
      
      // Header text with better positioning
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text(title, MARGIN_LEFT, currentY)
      
      // Reset and move down
      doc.setTextColor(33, 33, 33)
      currentY += 20
    }

    // Enhanced subsection header
    const addSubSectionHeader = (title: string) => {
      checkPageBreak(15)
      
      currentY += 8
      
      // Subsection styling
      doc.setFillColor(230, 240, 250)
      doc.rect(MARGIN_LEFT - 2, currentY - 6, CONTENT_WIDTH + 4, 10, 'F')
      
      doc.setTextColor(41, 84, 121)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(title, MARGIN_LEFT, currentY)
      
      doc.setTextColor(33, 33, 33)
      currentY += 12
    }

    // Enhanced text function with better formatting
    const addLabeledText = (label: string, text: string | string[] | null | undefined, options?: {
      fontSize?: number,
      lineSpacing?: number,
      indent?: number,
      isMultiline?: boolean
    }) => {
      if (!text || text === 'undefined' || text === 'null' || text === '') return
      
      const { fontSize = 10, lineSpacing = 5, indent = 0, isMultiline = false } = options || {}
      
      // Handle array inputs
      let textContent = ''
      if (Array.isArray(text)) {
        textContent = text.filter(item => item && item.trim()).join(isMultiline ? '\n• ' : '. ')
        if (isMultiline && textContent) textContent = '• ' + textContent
      } else {
        textContent = text.toString().trim()
      }
      
      if (!textContent) return
      
      checkPageBreak(20)
      
      // Label styling
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(41, 84, 121)
      doc.text(`${label}:`, MARGIN_LEFT + indent, currentY)
      
      // Calculate positioning
      const labelWidth = doc.getTextWidth(`${label}: `)
      
      // Content styling
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(33, 33, 33)
      
      const availableWidth = CONTENT_WIDTH - labelWidth - indent - 5
      const lines = doc.splitTextToSize(textContent, availableWidth)
      
      // Draw text lines
      lines.forEach((line: string, index: number) => {
        if (index === 0) {
          doc.text(line, MARGIN_LEFT + labelWidth + indent, currentY)
        } else {
          currentY += lineSpacing
          checkPageBreak(10)
          doc.text(line, MARGIN_LEFT + labelWidth + indent, currentY)
        }
      })
      
      currentY += lineSpacing + 3
    }

    // Enhanced bullet list with better formatting
    const addBulletList = (items: string[] | any[], title?: string) => {
      if (!Array.isArray(items) || items.length === 0) return
      
      if (title) {
        addSubSectionHeader(title)
      }
      
      const validItems = items.filter(item => item && item.toString().trim())
      
      validItems.forEach((item, index) => {
        checkPageBreak(12)
        
        const itemText = item.toString().trim()
        
        // Bullet point
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(33, 33, 33)
        doc.text('•', MARGIN_LEFT + 5, currentY)
        
        // Item text with proper wrapping
        const availableWidth = CONTENT_WIDTH - 15
        const lines = doc.splitTextToSize(itemText, availableWidth)
        
        lines.forEach((line: string, lineIndex: number) => {
          if (lineIndex === 0) {
            doc.text(line, MARGIN_LEFT + 12, currentY)
          } else {
            currentY += 5
            checkPageBreak(8)
            doc.text(line, MARGIN_LEFT + 12, currentY)
          }
        })
        
        currentY += 8
      })
      
      currentY += 5
    }

    // Enhanced table function with better styling
    const addDataTable = (data: any[] | any, title?: string) => {
      if (!data) return
      
      if (title) {
        addSubSectionHeader(title)
      }
      
      // Convert data to array format
      let tableData: any[] = []
      
      if (Array.isArray(data)) {
        tableData = data.filter(item => item && typeof item === 'object')
      } else if (typeof data === 'object') {
          tableData = Object.entries(data).map(([key, value]) => ({
            Field: key,
          Value: Array.isArray(value) ? value.join(', ') : String(value || '')
        }))
      }
      
      if (tableData.length === 0) return
      
      checkPageBreak(30)
      
      // Get table headers
      const headers = Object.keys(tableData[0])
      
      // Prepare table rows
      const rows: string[][] = tableData.map(item => 
        headers.map(header => {
          const value = item[header]
          if (Array.isArray(value)) {
            return value.join(', ')
          }
          return String(value || '').replace(/^[•\-\*]\s*/, '').trim()
        })
      )
      
      // Create table with enhanced styling
      try {
        (doc as any).autoTable({
          head: [headers],
          body: rows,
          startY: currentY,
          margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
          styles: {
            fontSize: 9,
            cellPadding: 3,
            lineColor: [200, 200, 200],
            lineWidth: 0.5
          },
          headStyles: {
            fillColor: [41, 84, 121],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' }
          },
          didDrawPage: function(data: any) {
            currentY = data.cursor?.y || currentY
          }
        })
        
        currentY = ((doc as any).lastAutoTable?.finalY || currentY) + 10
      } catch (error) {
        console.error('AutoTable error:', error)
        // Fallback: create a simple table manually
        addSimpleTable(headers, rows)
      }
    }

    // Fallback simple table function
    const addSimpleTable = (headers: string[], rows: string[][]) => {
      checkPageBreak(20 + (rows.length * 6))
      
      // Table header
      doc.setFillColor(41, 84, 121)
      doc.rect(MARGIN_LEFT, currentY - 4, CONTENT_WIDTH, 8, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      
      const colWidth = CONTENT_WIDTH / headers.length
      headers.forEach((header, index) => {
        doc.text(header, MARGIN_LEFT + (index * colWidth) + 2, currentY)
      })
      
        currentY += 8
      
      // Table rows
      doc.setTextColor(33, 33, 33)
      doc.setFont('helvetica', 'normal')
      
      rows.forEach((row, rowIndex) => {
        checkPageBreak(8)
        
        // Alternate row background
        if (rowIndex % 2 === 1) {
          doc.setFillColor(245, 245, 245)
          doc.rect(MARGIN_LEFT, currentY - 4, CONTENT_WIDTH, 8, 'F')
        }
        
        row.forEach((cell, colIndex) => {
          const cellText = String(cell || '').substring(0, 30) // Truncate if too long
          doc.text(cellText, MARGIN_LEFT + (colIndex * colWidth) + 2, currentY)
        })
        
        currentY += 6
      })
      
      currentY += 10
    }

    // Add action plan section with enhanced formatting
    const addActionPlanDetails = (plan: any) => {
      checkPageBreak(50)
      
      // Plan header with risk level indicator
      doc.setFillColor(240, 248, 255)
      doc.rect(MARGIN_LEFT - 2, currentY - 6, CONTENT_WIDTH + 4, 12, 'F')
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(33, 33, 33)
      doc.text(plan.hazard, MARGIN_LEFT, currentY)
      
      // Risk level badge
      const riskColor = plan.riskLevel.toLowerCase().includes('extreme') ? [0, 0, 0] : [220, 53, 69]
      doc.setFillColor(riskColor[0], riskColor[1], riskColor[2])
      doc.rect(MARGIN_LEFT + 120, currentY - 6, 25, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.text(plan.riskLevel, MARGIN_LEFT + 122, currentY - 1)
      
      currentY += 15
      
      // Business type indicator
      if (plan.businessType && plan.businessType !== 'general') {
        doc.setTextColor(100, 100, 100)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.text(`Optimized for ${plan.businessType.replace('_', ' ')} business`, MARGIN_LEFT, currentY)
        currentY += 8
      }
      
      // Business-specific considerations
      if (plan.specificConsiderations && plan.specificConsiderations.length > 0) {
        addSubSectionHeader('🎯 Business-Specific Considerations')
        addBulletList(plan.specificConsiderations)
      }
      
      // Resources needed
      if (plan.resourcesNeeded && plan.resourcesNeeded.length > 0) {
        addSubSectionHeader('📋 Resources Needed')
        addBulletList(plan.resourcesNeeded)
      }
      
      // Immediate actions
      if (plan.immediateActions && plan.immediateActions.length > 0) {
        addSubSectionHeader('🚨 Immediate Actions (0-24 hours)')
        plan.immediateActions.forEach((action: any) => {
          checkPageBreak(15)
          
          // Priority indicator
          const priorityColor = action.priority === 'high' ? [220, 53, 69] : 
                              action.priority === 'medium' ? [255, 193, 7] : [40, 167, 69]
          doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2])
          doc.circle(MARGIN_LEFT + 8, currentY - 2, 1.5, 'F')
          
          // Action details
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(33, 33, 33)
          
          const taskLines = doc.splitTextToSize(action.task, CONTENT_WIDTH - 20)
          taskLines.forEach((line: string, index: number) => {
            doc.text(line, MARGIN_LEFT + 15, currentY + (index * 4))
          })
          
          currentY += (taskLines.length * 4) + 2
          
          // Responsibility and duration
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(100, 100, 100)
          doc.setFontSize(8)
          doc.text(`Responsible: ${action.responsible}`, MARGIN_LEFT + 15, currentY)
          if (action.duration) {
            doc.text(`Duration: ${action.duration}`, MARGIN_LEFT + 90, currentY)
          }
          
          currentY += 10
        })
      }
      
      // Short-term actions
      if (plan.shortTermActions && plan.shortTermActions.length > 0) {
        addSubSectionHeader('⏱️ Short-term Actions (1-7 days)')
        plan.shortTermActions.forEach((action: any) => {
          checkPageBreak(15)
          
          const priorityColor = action.priority === 'high' ? [220, 53, 69] : 
                              action.priority === 'medium' ? [255, 193, 7] : [40, 167, 69]
          doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2])
          doc.circle(MARGIN_LEFT + 8, currentY - 2, 1.5, 'F')
          
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(33, 33, 33)
          
          const taskLines = doc.splitTextToSize(action.task, CONTENT_WIDTH - 20)
          taskLines.forEach((line: string, index: number) => {
            doc.text(line, MARGIN_LEFT + 15, currentY + (index * 4))
          })
          
          currentY += (taskLines.length * 4) + 2
          
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(100, 100, 100)
          doc.setFontSize(8)
          doc.text(`Responsible: ${action.responsible}`, MARGIN_LEFT + 15, currentY)
          if (action.duration) {
            doc.text(`Duration: ${action.duration}`, MARGIN_LEFT + 90, currentY)
          }
          
          currentY += 10
        })
      }
      
      // Medium-term actions
      if (plan.mediumTermActions && plan.mediumTermActions.length > 0) {
        addSubSectionHeader('📅 Medium-term Actions (1-4 weeks)')
        plan.mediumTermActions.forEach((action: any) => {
          checkPageBreak(15)
          
          const priorityColor = action.priority === 'high' ? [220, 53, 69] : 
                              action.priority === 'medium' ? [255, 193, 7] : [40, 167, 69]
          doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2])
          doc.circle(MARGIN_LEFT + 8, currentY - 2, 1.5, 'F')
          
          doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
          doc.setTextColor(33, 33, 33)
          
          const taskLines = doc.splitTextToSize(action.task, CONTENT_WIDTH - 20)
          taskLines.forEach((line: string, index: number) => {
            doc.text(line, MARGIN_LEFT + 15, currentY + (index * 4))
          })
          
          currentY += (taskLines.length * 4) + 2
          
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(100, 100, 100)
          doc.setFontSize(8)
          doc.text(`Responsible: ${action.responsible}`, MARGIN_LEFT + 15, currentY)
          if (action.duration) {
            doc.text(`Duration: ${action.duration}`, MARGIN_LEFT + 90, currentY)
          }
          
          currentY += 10
        })
      }
      
      // Long-term prevention
      if (plan.longTermReduction && plan.longTermReduction.length > 0) {
        addSubSectionHeader('🛡️ Long-term Prevention & Risk Reduction')
        addBulletList(plan.longTermReduction)
      }
      
      currentY += 10
    }

    // COVER PAGE
    doc.setFillColor(41, 84, 121)
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F')
    
    // Title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('BUSINESS CONTINUITY PLAN', PAGE_WIDTH / 2, 80, { align: 'center' })
      
      // Company name
    doc.setFontSize(20)
      doc.setFont('helvetica', 'normal')
    doc.text(companyName, PAGE_WIDTH / 2, 110, { align: 'center' })
      
    // Date and version
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    doc.setFontSize(14)
    doc.text(`Generated on ${currentDate}`, PAGE_WIDTH / 2, 140, { align: 'center' })
      
    // UNDP Logo area
      doc.setFontSize(12)
    doc.text('Developed in partnership with', PAGE_WIDTH / 2, 200, { align: 'center' })
    doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
    doc.text('UNDP & CARICHAM', PAGE_WIDTH / 2, 220, { align: 'center' })
    
    // Add second page for content
      doc.addPage()
      currentY = MARGIN_TOP
      pageNumber++
      addPageFooter(pageNumber)
      
    // DOCUMENT CONTROL & HEADER
    addSectionHeader('DOCUMENT CONTROL & INFORMATION')
      
      if (planData.PLAN_INFORMATION) {
      addLabeledText('Company Name', planData.PLAN_INFORMATION['Company Name'])
      addLabeledText('Plan Version', planData.PLAN_INFORMATION['Plan Version'] || '1.0')
      addLabeledText('Date Created', planData.PLAN_INFORMATION['Date Created'] || currentDate)
      addLabeledText('Last Updated', planData.PLAN_INFORMATION['Last Updated'] || currentDate)
      addLabeledText('Approved By', planData.PLAN_INFORMATION['Approved By'])
      addLabeledText('Next Review Date', planData.PLAN_INFORMATION['Next Review Date'])
    }

    // SECTION 1: BUSINESS ANALYSIS
    addSectionHeader('SECTION 1: BUSINESS ANALYSIS')
      
      if (planData.BUSINESS_OVERVIEW) {
      addLabeledText('Business Purpose', planData.BUSINESS_OVERVIEW['Business Purpose'])
      addLabeledText('Products & Services', planData.BUSINESS_OVERVIEW['Products & Services'])
      addLabeledText('Key Markets', planData.BUSINESS_OVERVIEW['Key Markets'])
      addLabeledText('Annual Revenue', planData.BUSINESS_OVERVIEW['Annual Revenue'])
      addLabeledText('Number of Employees', planData.BUSINESS_OVERVIEW['Number of Employees'])
      addLabeledText('Business Location', planData.BUSINESS_OVERVIEW['Business Location'])
    }
    
    // Essential Functions
    if (planData.ESSENTIAL_FUNCTIONS) {
      addSubSectionHeader('Essential Business Functions')
      Object.entries(planData.ESSENTIAL_FUNCTIONS).forEach(([category, functions]) => {
        if (Array.isArray(functions) && functions.length > 0) {
          addBulletList(functions, category.replace(/([A-Z])/g, ' $1').trim())
        }
      })
    }

    // SECTION 2: RISK ASSESSMENT
    addSectionHeader('SECTION 2: RISK ASSESSMENT')
    
    if (planData.RISK_ASSESSMENT) {
      // Risk summary
      if (planData.RISK_ASSESSMENT['Risk Assessment Matrix']) {
        const riskMatrix = planData.RISK_ASSESSMENT['Risk Assessment Matrix']
        const riskSummary = {
          'High Risk': riskMatrix.filter((r: any) => (r.riskLevel || r.RiskLevel || '').toLowerCase().includes('high')).length,
          'Medium Risk': riskMatrix.filter((r: any) => (r.riskLevel || r.RiskLevel || '').toLowerCase().includes('medium')).length,
          'Low Risk': riskMatrix.filter((r: any) => (r.riskLevel || r.RiskLevel || '').toLowerCase().includes('low')).length,
          'Extreme Risk': riskMatrix.filter((r: any) => (r.riskLevel || r.RiskLevel || '').toLowerCase().includes('extreme')).length
        }
        
        addSubSectionHeader('Risk Summary Dashboard')
        Object.entries(riskSummary).forEach(([level, count]) => {
          if (count > 0) {
            addLabeledText(level, `${count} identified risks`)
          }
        })
        
        addDataTable(riskMatrix, 'Complete Risk Assessment Matrix')
      }
    }

    // SECTION 3: BUSINESS CONTINUITY STRATEGIES
    addSectionHeader('SECTION 3: BUSINESS CONTINUITY STRATEGIES')
      
      if (planData.STRATEGIES) {
        const strategies = planData.STRATEGIES
        
      if (strategies['Prevention Strategies (Before Emergencies)']) {
          addBulletList(strategies['Prevention Strategies (Before Emergencies)'], 
          '🔒 Prevention Strategies (Before Emergencies)')
        }
        
      if (strategies['Response Strategies (During Emergencies)']) {
          addBulletList(strategies['Response Strategies (During Emergencies)'], 
          '🚨 Response Strategies (During Emergencies)')
        }
        
      if (strategies['Recovery Strategies (After Emergencies)']) {
          addBulletList(strategies['Recovery Strategies (After Emergencies)'], 
          '🔄 Recovery Strategies (After Emergencies)')
        }
        
        if (strategies['Long-term Risk Reduction Measures']) {
            addBulletList(strategies['Long-term Risk Reduction Measures'], 
          '🛡️ Long-term Risk Reduction Measures')
      }
    }

    // SECTION 4: DETAILED ACTION PLANS
    addSectionHeader('SECTION 4: DETAILED ACTION PLANS')
    
    // Generate action plans using database strategies
    const hazardActionPlans = generateHazardActionPlansForPDF(planData, planData.RISK_ASSESSMENT, strategies)
    
    if (hazardActionPlans.length > 0) {
      const businessType = 'Database-driven'
      
      addSubSectionHeader(`Business Type: ${businessType.replace('_', ' ').toUpperCase()} - Customized Action Plans`)
      
      hazardActionPlans.forEach((plan, index) => {
        if (index > 0) {
          checkPageBreak(60) // Ensure each plan starts on a fresh section
        }
        addActionPlanDetails(plan)
      })
          } else {
      addLabeledText('Action Plans', 'No high-priority risks identified requiring detailed action plans.')
    }

    // SECTION 5: TESTING & MAINTENANCE
    addSectionHeader('SECTION 5: TESTING & MAINTENANCE')
    
    if (planData.TESTING_AND_MAINTENANCE) {
      const testing = planData.TESTING_AND_MAINTENANCE
      
      if (testing['Plan Testing Schedule']) {
        addDataTable(testing['Plan Testing Schedule'], 'Plan Testing Schedule')
      }
      
      if (testing['Plan Revision History']) {
        addDataTable(testing['Plan Revision History'], 'Plan Revision History')
      }
      
      if (testing['Annual Review Process']) {
        addBulletList(testing['Annual Review Process'], 'Annual Review Process')
      }
      
      if (testing['Trigger Events for Plan Updates']) {
        addBulletList(testing['Trigger Events for Plan Updates'], 'Trigger Events for Plan Updates')
      }
      
      if (testing['Improvement Tracking']) {
        addDataTable(testing['Improvement Tracking'], 'Improvement Tracking')
      }
    }

    // SECTION 6: CONTACT INFORMATION
    addSectionHeader('SECTION 6: CONTACT INFORMATION')
      
      if (planData.CONTACTS_AND_INFORMATION) {
        const contacts = planData.CONTACTS_AND_INFORMATION
        
        if (contacts['Staff Contact Information']) {
          addDataTable(contacts['Staff Contact Information'], 'Staff Contact Information')
        }
        
        if (contacts['Key Customer Contacts']) {
          addDataTable(contacts['Key Customer Contacts'], 'Key Customer Contacts')
        }
        
        if (contacts['Supplier Information']) {
          addDataTable(contacts['Supplier Information'], 'Supplier Information')
        }
        
        if (contacts['Emergency Services and Utilities']) {
          addDataTable(contacts['Emergency Services and Utilities'], 'Emergency Services and Utilities')
        }
        
        if (contacts['Key External Contacts']) {
          addDataTable(contacts['Key External Contacts'], 'Key External Contacts')
        }
      }
      
    // SECTION 7: APPENDICES
    addSectionHeader('SECTION 7: APPENDICES')
    
    if (planData.APPENDICES) {
      const appendices = planData.APPENDICES
      
      if (appendices['Vital Records Inventory']) {
        addDataTable(appendices['Vital Records Inventory'], 'Vital Records Inventory')
      }
      
      if (appendices['Insurance Information']) {
        addDataTable(appendices['Insurance Information'], 'Insurance Information')
      }
      
      if (appendices['Emergency Supply Checklist']) {
        addBulletList(appendices['Emergency Supply Checklist'], 'Emergency Supply Checklist')
      }
      
      if (appendices['Communication Templates']) {
        addBulletList(appendices['Communication Templates'], 'Communication Templates')
      }
      
      if (appendices['Recovery Time Objectives']) {
        addDataTable(appendices['Recovery Time Objectives'], 'Recovery Time Objectives')
      }
      
      if (appendices['Plan Distribution List']) {
        addDataTable(appendices['Plan Distribution List'], 'Plan Distribution List')
      }
    }

    // Add page numbers and finalize
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        if (i > 1) { // Skip cover page
          doc.setFontSize(9)
          doc.setTextColor(100, 100, 100)
          doc.setFont('helvetica', 'normal')
          
          const footerY = PAGE_HEIGHT - 15
          
          // Page numbering
          doc.text(`Page ${i} of ${totalPages}`, PAGE_WIDTH - MARGIN_RIGHT - 20, footerY)
          doc.text(companyName, MARGIN_LEFT, footerY)
        }
      }
      
      // Generate PDF
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${companyName.replace(/[^a-zA-Z0-9]/g, '-')}-BCP-${new Date().toISOString().split('T')[0]}.pdf"`,
        },
      })

    } catch (error) {
      console.error('PDF generation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
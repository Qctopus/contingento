import { NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: {
      finalY: number
    }
  }
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

    console.log('Generating PDF for data:', JSON.stringify(planData, null, 2))

    // Create a new PDF document
    const doc = new jsPDF('p', 'mm', 'a4')
    
    // Set initial position and margins
    let y = 20
    const margin = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const maxWidth = pageWidth - (margin * 2)
    const maxContentHeight = pageHeight - 40 // Leave space for header/footer
    
    const companyName = planData.PLAN_INFORMATION?.['Company Name'] || 
                       planData.PLAN_INFORMATION?.['companyName'] ||
                       planData.PLAN_INFORMATION?.['Nom de l\'Entreprise'] ||
                       planData.PLAN_INFORMATION?.['Nombre de la Empresa'] ||
                       'Your Company'

    // Enhanced color scheme
    const colors = {
      primary: [0, 102, 153] as [number, number, number], // Dark blue
      secondary: [51, 153, 204] as [number, number, number], // Light blue
      accent: [255, 126, 0] as [number, number, number], // Orange
      text: [51, 51, 51] as [number, number, number], // Dark gray
      lightGray: [242, 242, 242] as [number, number, number],
      mediumGray: [200, 200, 200] as [number, number, number],
      darkGray: [128, 128, 128] as [number, number, number],
      white: [255, 255, 255] as [number, number, number],
      tableHeader: [240, 248, 255] as [number, number, number], // Alice blue
      tableStripe: [248, 249, 250] as [number, number, number] // Light gray
    }

    // Helper function to check if we need a new page
    const checkPageBreak = (neededSpace: number = 20) => {
      if (y + neededSpace > maxContentHeight) {
        addPageFooter()
        doc.addPage()
        addPageHeader()
        y = 50 // Account for header space
        return true
      }
      return false
    }

    // Helper function to add page header
    const addPageHeader = () => {
      if ((doc as any).internal.getNumberOfPages() > 1) {
        doc.setFillColor(...colors.primary)
        doc.rect(0, 0, pageWidth, 15, 'F')
        
        doc.setTextColor(...colors.white)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('Business Continuity Plan', margin, 10)
        
        const headerText = companyName.length > 40 ? companyName.substring(0, 37) + '...' : companyName
        const headerWidth = doc.getStringUnitWidth(headerText) * 10 / doc.internal.scaleFactor
        doc.text(headerText, pageWidth - margin - headerWidth, 10)
        
        // Reset text color
        doc.setTextColor(...colors.text)
      }
    }

    // Helper function to add page footer
    const addPageFooter = () => {
      const currentDate = new Date().toLocaleDateString()
      const pageNum = (doc as any).internal.getNumberOfPages()
      
      doc.setFontSize(8)
      doc.setTextColor(...colors.darkGray)
      doc.text(`${companyName} - Business Continuity Plan`, margin, pageHeight - 10)
      doc.text(`Page ${pageNum}`, pageWidth - margin - 20, pageHeight - 10)
      doc.text(`Generated: ${currentDate}`, pageWidth - margin - 80, pageHeight - 10)
      
      // Reset text color
      doc.setTextColor(...colors.text)
    }

    // Enhanced text wrapping function
    const wrapText = (text: string, maxWidth: number, fontSize: number = 10): string[] => {
      if (!text) return ['']
      
      doc.setFontSize(fontSize)
      const lines = doc.splitTextToSize(text.toString(), maxWidth)
      return Array.isArray(lines) ? lines : [lines]
    }

    // Helper function to add text with automatic wrapping and page breaks
    const addText = (text: string, x: number, fontSize: number, isBold = false, isTitle = false, textColor: [number, number, number] = colors.text) => {
      if (!text) return y
      
      const lineHeight = fontSize * 0.4
      const lines = wrapText(text, maxWidth - (x - margin), fontSize)
      
      for (let i = 0; i < lines.length; i++) {
        if (checkPageBreak(lineHeight + 5)) {
          // Page was broken, continue from new page
        }
        
        doc.setFontSize(fontSize)
        doc.setFont('helvetica', isBold ? 'bold' : 'normal')
        doc.setTextColor(...textColor)
        
        let textX = x
        if (isTitle) {
          const textWidth = doc.getStringUnitWidth(lines[i]) * fontSize / doc.internal.scaleFactor
          textX = (pageWidth - textWidth) / 2
        }
        
        doc.text(lines[i], textX, y)
        y += lineHeight
      }
      
      return y
    }

    // Helper function to add a section header with background
    const addSectionHeader = (title: string, pageNumber?: string) => {
      checkPageBreak(40)
      y += 10
      
      // Background rectangle
      doc.setFillColor(...colors.primary)
      doc.rect(margin, y - 12, maxWidth, 18, 'F')
      
      // Section title
      doc.setTextColor(...colors.white)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      
      let titleText = title
      if (pageNumber) {
        titleText = `${pageNumber}. ${title}`
      }
      
      doc.text(titleText, margin + 5, y)
      y += 25
      
      // Reset text color
      doc.setTextColor(...colors.text)
    }

    // Helper function to add a subsection header
    const addSubsectionHeader = (title: string) => {
      checkPageBreak(25)
      y += 8
      
      doc.setFillColor(...colors.tableHeader)
      doc.rect(margin, y - 10, maxWidth, 15, 'F')
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...colors.primary)
      doc.text(title, margin + 5, y)
      y += 15
      
      // Reset text color
      doc.setTextColor(...colors.text)
    }

    // Helper function to add regular text
    const addParagraph = (text: string, indent = 0) => {
      if (!text || text.trim() === '') return
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      y = addText(text, margin + indent, 10)
      y += 6
    }

    // Helper function to add key-value pairs with better formatting
    const addKeyValue = (key: string, value: string, indent = 0) => {
      if (!value || value.trim() === '') return
      
      checkPageBreak(20)
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...colors.primary)
      
      const keyText = `${key}:`
      doc.text(keyText, margin + indent, y)
      
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.text)
      
      const keyWidth = doc.getStringUnitWidth(keyText + ' ') * 10 / doc.internal.scaleFactor
      const valueX = margin + indent + keyWidth
      const availableWidth = maxWidth - keyWidth - indent
      
      const lines = wrapText(value, availableWidth, 10)
      
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) {
          checkPageBreak(12)
          doc.text(lines[i], valueX, y)
        } else {
          doc.text(lines[i], valueX, y)
        }
        y += 12
      }
      
      y += 4
    }

    // Enhanced table function using autoTable
    const addTable = (data: any[], title: string, customColumnConfig?: any) => {
      if (!Array.isArray(data) || data.length === 0) return

      addSubsectionHeader(title)
      y += 5

      // Prepare table data
      const processedData = data.map(item => {
        const row: any = {}
        Object.keys(item).forEach(key => {
          const value = item[key]
          if (value !== null && value !== undefined) {
            row[key] = typeof value === 'string' ? value : JSON.stringify(value)
          } else {
            row[key] = ''
          }
        })
        return row
      })

      if (processedData.length === 0) return

      // Get all unique columns
      const allColumns = Array.from(new Set(processedData.flatMap(item => Object.keys(item))))
      
      // Prepare column headers with better formatting
      const columns = allColumns.map(col => ({
        header: col.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .replace(/\s+/g, ' ')
                  .trim(),
        dataKey: col
      }))

      // Prepare table body
      const body = processedData.map(row => 
        allColumns.map(col => row[col] || '')
      )

      try {
        doc.autoTable({
          startY: y,
          head: [columns.map(col => col.header)],
          body: body,
          theme: 'grid',
          styles: {
            fontSize: 9,
            cellPadding: 3,
            textColor: colors.text,
            lineColor: colors.mediumGray,
            lineWidth: 0.1,
            overflow: 'linebreak',
            cellWidth: 'wrap'
          },
          headStyles: {
            fillColor: colors.primary,
            textColor: colors.white,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'left'
          },
          alternateRowStyles: {
            fillColor: colors.tableStripe
          },
          columnStyles: customColumnConfig || {
            // Auto-adjust column widths based on content
          },
          margin: { left: margin, right: margin },
          tableWidth: maxWidth,
          didDrawPage: function() {
            addPageHeader()
          },
          willDrawCell: function(data: any) {
            // Handle long text wrapping
            if (data.cell.text && data.cell.text.length > 0) {
              data.cell.text = data.cell.text.map((text: string) => {
                if (text.length > 50) {
                  return text.substring(0, 47) + '...'
                }
                return text
              })
            }
          }
        })

        y = (doc as any).lastAutoTable.finalY + 10
      } catch (error) {
        console.error('Error creating table:', error)
        // Fallback to simple text if table fails
        addParagraph(`Table data for ${title}: ${JSON.stringify(data).substring(0, 200)}...`)
      }
    }

    // Enhanced list function with better formatting
    const addList = (items: string[], title: string) => {
      if (!Array.isArray(items) || items.length === 0) return

      addSubsectionHeader(title)
      
      items.forEach((item, index) => {
        checkPageBreak(20)
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        
        // Add bullet point
        doc.setTextColor(...colors.accent)
        doc.text('•', margin + 5, y)
        
        // Add item text with proper wrapping
        doc.setTextColor(...colors.text)
        const lines = wrapText(item, maxWidth - 25, 10)
        
        lines.forEach((line: string, lineIndex: number) => {
          if (lineIndex > 0) {
            checkPageBreak(12)
            doc.text(line, margin + 15, y)
          } else {
            doc.text(line, margin + 15, y)
          }
          y += 12
        })
        y += 3
      })
      
      y += 8
    }

    // Create executive summary from plan data
    const createExecutiveSummary = () => {
      const businessOverview = planData.BUSINESS_OVERVIEW || {}
      const riskAssessment = planData.RISK_ASSESSMENT || {}
      const strategies = planData.STRATEGIES || {}
      
      let summary = `This Business Continuity Plan (BCP) has been prepared for ${companyName} using the CARICHAM methodology. `
      
      if (businessOverview['Business Purpose'] || businessOverview['businessPurpose']) {
        const purpose = businessOverview['Business Purpose'] || businessOverview['businessPurpose']
        summary += `The company's primary business purpose is: ${purpose}. `
      }
      
      if (riskAssessment['Potential Hazards'] || riskAssessment['potentialHazards']) {
        const hazards = riskAssessment['Potential Hazards'] || riskAssessment['potentialHazards']
        const hazardCount = Array.isArray(hazards) ? hazards.length : 0
        summary += `This plan addresses ${hazardCount} identified potential hazards and risks that could impact business operations. `
      }
      
      summary += `The plan outlines comprehensive prevention, response, and recovery strategies to ensure business continuity during emergencies and disasters. `
      
      const prevention = strategies['Prevention Strategies (Before Emergencies)'] || strategies['preventionStrategies']
      const response = strategies['Response Strategies (During Emergencies)'] || strategies['responseStrategies'] 
      const recovery = strategies['Recovery Strategies (After Emergencies)'] || strategies['recoveryStrategies']
      
      if (prevention && Array.isArray(prevention)) {
        summary += `It includes ${prevention.length} prevention strategies, `
      }
      
      if (response && Array.isArray(response)) {
        summary += `${response.length} response strategies, `
      }
      
      if (recovery && Array.isArray(recovery)) {
        summary += `and ${recovery.length} recovery strategies. `
      }
      
      summary += `This plan serves as a critical business document for loan applications, insurance purposes, and regulatory compliance, demonstrating the organization's commitment to risk management and business resilience.`
      
      return summary
    }

    try {
      // COVER PAGE
      doc.setFillColor(...colors.primary)
      doc.rect(0, 0, pageWidth, 80, 'F')
      
      // Company logo area (placeholder)
      doc.setFillColor(...colors.white)
      doc.rect(margin, 20, 60, 30, 'F')
      doc.setTextColor(...colors.primary)
      doc.setFontSize(8)
      doc.text('COMPANY', margin + 20, 35)
      doc.text('LOGO', margin + 23, 42)
      
      // Main title
      doc.setTextColor(...colors.white)
      doc.setFontSize(28)
      doc.setFont('helvetica', 'bold')
      y = 35
      y = addText('BUSINESS CONTINUITY PLAN', margin, 28, true, true, colors.white)
      
      // Subtitle
      doc.setFontSize(14)
      doc.setFont('helvetica', 'normal')
      y = 90
      doc.setTextColor(...colors.text)
      y = addText(companyName, margin, 18, true, true)
      
      // Plan details box
      y = 130
      doc.setFillColor(...colors.lightGray)
      doc.rect(margin, y, maxWidth, 70, 'F')
      
      y += 15
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...colors.primary)
      doc.text('Plan Details', margin + 5, y)
      
      y += 15
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.text)
      
      const currentDate = new Date().toLocaleDateString()
      const planManager = planData.PLAN_INFORMATION?.['Plan Manager'] || 
                         planData.PLAN_INFORMATION?.['planManager'] ||
                         planData.PLAN_INFORMATION?.['Responsable du Plan'] ||
                         planData.PLAN_INFORMATION?.['Gerente del Plan'] ||
                         'Not specified'
      
      doc.text(`Prepared by: ${planManager}`, margin + 5, y)
      y += 12
      doc.text(`Date: ${currentDate}`, margin + 5, y)
      y += 12
      doc.text('Methodology: CARICHAM', margin + 5, y)
      y += 12
      doc.text('Status: CONFIDENTIAL - Business Use Only', margin + 5, y)
      
      // Certification statement
      y = 230
      doc.setFillColor(...colors.accent)
      doc.rect(margin, y, maxWidth, 50, 'F')
      
      y += 15
      doc.setTextColor(...colors.white)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('CERTIFICATION', margin + 5, y)
      
      y += 15
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const certText = 'This Business Continuity Plan has been prepared in accordance with international best practices and the CARICHAM methodology for Caribbean small businesses.'
      const certLines = wrapText(certText, maxWidth - 10, 9)
      certLines.forEach((line: string) => {
        doc.text(line, margin + 5, y)
        y += 10
      })

      // TABLE OF CONTENTS PAGE
      doc.addPage()
      addPageHeader()
      y = 60
      
      addSectionHeader('Table of Contents')
      
      const tableOfContents = [
        { title: 'Executive Summary', page: '3' },
        { title: 'Plan Information', page: '4' },
        { title: 'Business Overview', page: '5' },
        { title: 'Essential Business Functions', page: '7' },
        { title: 'Risk Assessment', page: '9' },
        { title: 'Business Continuity Strategies', page: '11' },
        { title: 'Implementation Action Plan', page: '13' },
        { title: 'Contacts and Critical Information', page: '15' },
        { title: 'Testing and Maintenance', page: '17' },
        { title: 'Appendices', page: '19' }
      ]
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      
      tableOfContents.forEach(item => {
        checkPageBreak(15)
        doc.text(item.title, margin + 5, y)
        
        // Dots
        const titleWidth = doc.getStringUnitWidth(item.title) * 11 / doc.internal.scaleFactor
        const pageNumWidth = doc.getStringUnitWidth(item.page) * 11 / doc.internal.scaleFactor
        const availableSpace = maxWidth - titleWidth - pageNumWidth - 20
        const dotCount = Math.floor(availableSpace / 3)
        const dots = '.'.repeat(Math.max(0, dotCount))
        doc.text(dots, margin + 10 + titleWidth, y)
        
        // Page number
        doc.text(item.page, pageWidth - margin - pageNumWidth, y)
        y += 15
      })

      // EXECUTIVE SUMMARY PAGE
      doc.addPage()
      addPageHeader()
      y = 60
      
      addSectionHeader('Executive Summary', '1')
      
      const executiveSummary = createExecutiveSummary()
      addParagraph(executiveSummary)
      
      // Key highlights box
      y += 10
      doc.setFillColor(...colors.lightGray)
      doc.rect(margin, y, maxWidth, 90, 'F')
      
      y += 15
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...colors.primary)
      doc.text('Plan Highlights', margin + 5, y)
      
      y += 15
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.text)
      
      const highlights = [
        '✓ Comprehensive risk assessment completed',
        '✓ Prevention, response, and recovery strategies defined',
        '✓ Clear roles and responsibilities assigned',
        '✓ Testing and maintenance schedule established',
        '✓ Emergency contacts and critical information documented'
      ]
      
      highlights.forEach(highlight => {
        doc.text(highlight, margin + 5, y)
        y += 12
      })

      // PLAN INFORMATION PAGE
      doc.addPage()
      addPageHeader()
      y = 60
      
      addSectionHeader('Plan Information', '2')
      
      if (planData.PLAN_INFORMATION) {
        const planInfo = planData.PLAN_INFORMATION
        addKeyValue('Company Name', planInfo['Company Name'] || planInfo['companyName'] || planInfo['Nom de l\'Entreprise'] || planInfo['Nombre de la Empresa'] || 'Not specified')
        addKeyValue('Plan Manager', planInfo['Plan Manager'] || planInfo['planManager'] || planInfo['Responsable du Plan'] || planInfo['Gerente del Plan'] || 'Not specified')
        const alternateManager = planInfo['Alternate Manager'] || planInfo['alternateManager'] || planInfo['Responsable Alternatif'] || planInfo['Gerente Alterno'] || ''
        addKeyValue('Alternate Manager', alternateManager || 'No alternate manager designated')
        addKeyValue('Physical Plan Location', planInfo['Physical Plan Location'] || planInfo['physicalPlanLocation'] || 'Not specified')
        addKeyValue('Digital Plan Location', planInfo['Digital Plan Location'] || planInfo['digitalPlanLocation'] || 'Not specified')
      }

      // BUSINESS OVERVIEW PAGE
      doc.addPage()
      addPageHeader()
      y = 60
      
      addSectionHeader('Business Overview', '3')
      
      if (planData.BUSINESS_OVERVIEW) {
        const businessOverview = planData.BUSINESS_OVERVIEW
        
        addSubsectionHeader('Business Identity')
        addKeyValue('Business License Number', businessOverview['Business License Number'] || businessOverview['businessLicense'] || 'Not specified')
        addKeyValue('Business Purpose', businessOverview['Business Purpose'] || businessOverview['businessPurpose'] || 'Not specified')
        
        addSubsectionHeader('Products and Services')
        addParagraph(businessOverview['Products and Services'] || businessOverview['productsAndServices'] || 'Not specified')
        
        addSubsectionHeader('Operations')
        addKeyValue('Operating Hours', businessOverview['Operating Hours'] || businessOverview['operatingHours'] || 'Not specified')
        addKeyValue('Service Delivery Methods', businessOverview['Service Delivery Methods'] || businessOverview['serviceDeliveryMethods'] || 'Not specified')
        addKeyValue('Key Personnel', businessOverview['Key Personnel Involved'] || businessOverview['keyPersonnel'] || 'Not specified')
        addKeyValue('Customer Base', businessOverview['Customer Base'] || businessOverview['customerBase'] || 'Not specified')
        
        addSubsectionHeader('Business Dependencies')
        addKeyValue('Minimum Resources Required', businessOverview['Minimum Resource Requirements'] || businessOverview['minimumResources'] || 'Not specified')
        addKeyValue('Service Provider BCP Status', businessOverview['Service Provider BCP Status'] || businessOverview['serviceProviderBCP'] || 'Not specified')
      }

      // ESSENTIAL BUSINESS FUNCTIONS PAGE
      doc.addPage()
      addPageHeader()
      y = 60
      
      addSectionHeader('Essential Business Functions', '4')
      
      if (planData.ESSENTIAL_FUNCTIONS) {
        const functions = planData.ESSENTIAL_FUNCTIONS
        
        // Add function priority assessment table
        if (functions['Function Priority Assessment'] || functions['businessFunctions']) {
          const tableData = functions['Function Priority Assessment'] || functions['businessFunctions']
          addTable(tableData, 'Business Function Analysis')
        }
      }

      // RISK ASSESSMENT PAGE
      doc.addPage()
      addPageHeader()
      y = 60
      
      addSectionHeader('Risk Assessment', '5')
      
      if (planData.RISK_ASSESSMENT) {
        const riskAssessment = planData.RISK_ASSESSMENT
        
        if (riskAssessment['Potential Hazards'] || riskAssessment['potentialHazards']) {
          const hazards = riskAssessment['Potential Hazards'] || riskAssessment['potentialHazards']
          if (Array.isArray(hazards)) {
            addList(hazards, 'Identified Hazards and Risks')
          }
        }
        
        if (riskAssessment['Risk Assessment Matrix'] || riskAssessment['riskMatrix']) {
          const riskMatrix = riskAssessment['Risk Assessment Matrix'] || riskAssessment['riskMatrix']
          addTable(riskMatrix, 'Risk Assessment Matrix')
        }
      }

      // BUSINESS CONTINUITY STRATEGIES PAGE
      doc.addPage()
      addPageHeader()
      y = 60
      
      addSectionHeader('Business Continuity Strategies', '6')
      
      if (planData.STRATEGIES) {
        const strategies = planData.STRATEGIES
        
        if (strategies['Prevention Strategies (Before Emergencies)'] || strategies['preventionStrategies']) {
          const prevention = strategies['Prevention Strategies (Before Emergencies)'] || strategies['preventionStrategies']
          if (Array.isArray(prevention)) {
            addList(prevention, 'Prevention Strategies (Before Emergencies)')
          }
        }
        
        if (strategies['Response Strategies (During Emergencies)'] || strategies['responseStrategies']) {
          const response = strategies['Response Strategies (During Emergencies)'] || strategies['responseStrategies']
          if (Array.isArray(response)) {
            addList(response, 'Response Strategies (During Emergencies)')
          }
        }
        
        if (strategies['Recovery Strategies (After Emergencies)'] || strategies['recoveryStrategies']) {
          const recovery = strategies['Recovery Strategies (After Emergencies)'] || strategies['recoveryStrategies']
          if (Array.isArray(recovery)) {
            addList(recovery, 'Recovery Strategies (After Emergencies)')
          }
        }
        
        if (strategies['Long-term Risk Reduction Measures'] || strategies['longTermMeasures']) {
          addSubsectionHeader('Long-term Risk Reduction Measures')
          addParagraph(strategies['Long-term Risk Reduction Measures'] || strategies['longTermMeasures'])
        }
      }

      // ACTION PLAN PAGE
      doc.addPage()
      addPageHeader()
      y = 60
      
      addSectionHeader('Implementation Action Plan', '7')
      
      if (planData.ACTION_PLAN) {
        const actionPlan = planData.ACTION_PLAN
        
        if (actionPlan['Action Plan by Risk Level'] || actionPlan['actionPlanByRisk']) {
          const actionPlanData = actionPlan['Action Plan by Risk Level'] || actionPlan['actionPlanByRisk']
          addTable(actionPlanData, 'Action Plan by Risk Level')
        }
        
        if (actionPlan['Implementation Timeline'] || actionPlan['implementationTimeline']) {
          addSubsectionHeader('Implementation Timeline')
          addParagraph(actionPlan['Implementation Timeline'] || actionPlan['implementationTimeline'])
        }
        
        if (actionPlan['Resource Requirements'] || actionPlan['resourceRequirements']) {
          addSubsectionHeader('Resource Requirements')
          addParagraph(actionPlan['Resource Requirements'] || actionPlan['resourceRequirements'])
        }
        
        if (actionPlan['Responsible Parties and Roles'] || actionPlan['responsibleParties']) {
          addSubsectionHeader('Responsible Parties and Roles')
          addParagraph(actionPlan['Responsible Parties and Roles'] || actionPlan['responsibleParties'])
        }
        
        if (actionPlan['Review and Update Schedule'] || actionPlan['reviewSchedule']) {
          addSubsectionHeader('Review and Update Schedule')
          addParagraph(actionPlan['Review and Update Schedule'] || actionPlan['reviewSchedule'])
        }
        
        if (actionPlan['Testing and Assessment Plan'] || actionPlan['testingPlan']) {
          const testingData = actionPlan['Testing and Assessment Plan'] || actionPlan['testingPlan']
          addTable(testingData, 'Testing and Assessment Plan')
        }
      }

      // CONTACTS AND CRITICAL INFORMATION PAGE
      doc.addPage()
      addPageHeader()
      y = 60
      
      addSectionHeader('Contacts and Critical Information', '8')
      
      if (planData.CONTACTS_AND_INFORMATION) {
        const contacts = planData.CONTACTS_AND_INFORMATION
        
        if (contacts['Staff Contact Information'] || contacts['staffContacts']) {
          const staffData = contacts['Staff Contact Information'] || contacts['staffContacts']
          addTable(staffData, 'Staff Contact Information')
        }
        
        if (contacts['Key Customer Contacts'] || contacts['keyCustomers']) {
          const customerData = contacts['Key Customer Contacts'] || contacts['keyCustomers']
          addTable(customerData, 'Key Customer Contacts')
        }
        
        if (contacts['Supplier Information'] || contacts['supplierInfo']) {
          const supplierData = contacts['Supplier Information'] || contacts['supplierInfo']
          addTable(supplierData, 'Supplier Information')
        }
        
        if (contacts['Emergency Services and Utilities'] || contacts['emergencyServices']) {
          const emergencyData = contacts['Emergency Services and Utilities'] || contacts['emergencyServices']
          addTable(emergencyData, 'Emergency Services and Utilities')
        }
        
        if (contacts['Critical Business Information'] || contacts['criticalBusinessInfo']) {
          addSubsectionHeader('Critical Business Information')
          addParagraph(contacts['Critical Business Information'] || contacts['criticalBusinessInfo'])
        }
        
        if (contacts['Plan Distribution List'] || contacts['planDistribution']) {
          const distributionData = contacts['Plan Distribution List'] || contacts['planDistribution']
          addTable(distributionData, 'Plan Distribution List')
        }
      }

      // TESTING AND MAINTENANCE PAGE
      doc.addPage()
      addPageHeader()
      y = 60
      
      addSectionHeader('Testing and Maintenance', '9')
      
      if (planData.TESTING_AND_MAINTENANCE) {
        const testing = planData.TESTING_AND_MAINTENANCE
        
        if (testing['Plan Testing Schedule'] || testing['testingSchedule']) {
          const testingData = testing['Plan Testing Schedule'] || testing['testingSchedule']
          addTable(testingData, 'Plan Testing Schedule')
        }
        
        if (testing['Plan Revision History'] || testing['revisionHistory']) {
          const revisionData = testing['Plan Revision History'] || testing['revisionHistory']
          addTable(revisionData, 'Plan Revision History')
        }
        
        if (testing['Improvement Tracking'] || testing['improvementTracking']) {
          const improvementData = testing['Improvement Tracking'] || testing['improvementTracking']
          addTable(improvementData, 'Improvement Tracking')
        }
        
        if (testing['Annual Review Process'] || testing['annualReview']) {
          addSubsectionHeader('Annual Review Process')
          addParagraph(testing['Annual Review Process'] || testing['annualReview'])
        }
        
        if (testing['Trigger Events for Plan Updates'] || testing['triggerEvents']) {
          addSubsectionHeader('Trigger Events for Plan Updates')
          addParagraph(testing['Trigger Events for Plan Updates'] || testing['triggerEvents'])
        }
      }

      // APPENDICES PAGE
      doc.addPage()
      addPageHeader()
      y = 60
      
      addSectionHeader('Appendices', '10')
      
      addSubsectionHeader('Appendix A: CARICHAM Methodology')
      addParagraph('The CARICHAM (Caribbean Risk and Continuity Handbook for Adaptation and Management) methodology provides a systematic approach to business continuity planning specifically designed for Caribbean small and medium enterprises. This methodology considers the unique challenges faced by businesses in the Caribbean region, including natural disasters, climate change impacts, and economic vulnerabilities.')
      
      addSubsectionHeader('Appendix B: Emergency Contact Quick Reference')
      addParagraph('This section serves as a quick reference for emergency contacts during crisis situations. Keep copies in multiple locations including mobile devices, office locations, and with key personnel.')
      
      addSubsectionHeader('Appendix C: Document Control and Revision Log')
      addParagraph('This Business Continuity Plan is a living document that should be regularly reviewed and updated. All revisions must be documented, approved by the Plan Manager, and distributed to relevant stakeholders.')

      // Add final footer to all pages
      const totalPages = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        
        // Only add header for pages after the first (cover page)
        if (i > 1) {
          addPageHeader()
        }
        
        // Add footer to all pages
        const currentDate = new Date().toLocaleDateString()
        doc.setFontSize(8)
        doc.setTextColor(...colors.darkGray)
        
        // Footer content
        if (i === 1) {
          // Different footer for cover page
          const footerText = 'Confidential Business Document'
          const footerWidth = doc.getStringUnitWidth(footerText) * 8 / doc.internal.scaleFactor
          doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 10)
        } else {
          doc.text(`${companyName} - Business Continuity Plan`, margin, pageHeight - 10)
          doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 25, pageHeight - 10)
          doc.text(`Generated: ${currentDate}`, pageWidth - margin - 80, pageHeight - 10)
        }
      }

      // Get the PDF as a buffer
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

      // Return PDF as response
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${companyName.replace(/[^a-zA-Z0-9]/g, '-')}-Business-Continuity-Plan.pdf"`,
        },
      })
    } catch (error) {
      console.error('Error during PDF generation:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in PDF generation route:', error)
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
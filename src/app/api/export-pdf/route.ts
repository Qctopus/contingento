import { NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'

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

    // Color scheme
    const colors = {
      primary: [0, 102, 153] as [number, number, number], // Dark blue
      secondary: [51, 153, 204] as [number, number, number], // Light blue
      accent: [255, 126, 0] as [number, number, number], // Orange
      text: [51, 51, 51] as [number, number, number], // Dark gray
      lightGray: [242, 242, 242] as [number, number, number],
      mediumGray: [200, 200, 200] as [number, number, number],
      darkGray: [128, 128, 128] as [number, number, number]
    }

    // Helper function to check if we need a new page
    const checkPageBreak = (neededSpace: number = 20) => {
      if (y + neededSpace > maxContentHeight) {
        addPageFooter()
        doc.addPage()
        addPageHeader()
        y = 50 // Account for header space
      }
    }

    // Helper function to add page header
    const addPageHeader = () => {
      if ((doc as any).internal.getNumberOfPages() > 1) {
        doc.setFillColor(...colors.primary)
        doc.rect(0, 0, pageWidth, 15, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('Business Continuity Plan', margin, 10)
        doc.text(companyName, pageWidth - margin - doc.getStringUnitWidth(companyName) * 10 / doc.internal.scaleFactor, 10)
        
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

    // Helper function to add text with wrapping and automatic page breaks
    const addText = (text: string, x: number, fontSize: number, isBold = false, isTitle = false, textColor: [number, number, number] = colors.text) => {
      checkPageBreak(fontSize * 2)
      
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      doc.setTextColor(...textColor)
      
      if (isTitle) {
        // Center titles
        const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor
        x = (pageWidth - textWidth) / 2
      }
      
      const lines = doc.splitTextToSize(text, maxWidth - (x - margin))
      
      lines.forEach((line: string, index: number) => {
        if (index > 0) checkPageBreak(fontSize * 0.4)
        doc.text(line, x, y)
        y += fontSize * 0.4
      })
      
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
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      
      let titleText = title
      if (pageNumber) {
        titleText = `${pageNumber}. ${title}`
      }
      
      doc.text(titleText, margin + 5, y)
      y += 15
      
      // Reset text color
      doc.setTextColor(...colors.text)
    }

    // Helper function to add a subsection header
    const addSubsectionHeader = (title: string) => {
      checkPageBreak(25)
      y += 8
      
      doc.setFillColor(...colors.lightGray)
      doc.rect(margin, y - 8, maxWidth, 12, 'F')
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...colors.primary)
      doc.text(title, margin + 3, y)
      y += 10
      
      // Reset text color
      doc.setTextColor(...colors.text)
    }

    // Helper function to add regular text
    const addParagraph = (text: string, indent = 0) => {
      if (!text || text.trim() === '') return
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      y = addText(text, margin + indent, 10)
      y += 4
    }

    // Helper function to add key-value pairs
    const addKeyValue = (key: string, value: string, indent = 0) => {
      if (!value || value.trim() === '') return
      checkPageBreak(15)
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(`${key}:`, margin + indent, y)
      
      doc.setFont('helvetica', 'normal')
      const keyWidth = doc.getStringUnitWidth(`${key}: `) * 10 / doc.internal.scaleFactor
      const lines = doc.splitTextToSize(value, maxWidth - keyWidth - indent)
      
      lines.forEach((line: string, index: number) => {
        if (index > 0) {
          checkPageBreak(12)
          doc.text(line, margin + indent + keyWidth, y)
        } else {
          doc.text(line, margin + indent + keyWidth, y)
        }
        y += 12
      })
      
      y += 2
    }

    // Enhanced table function with better formatting
    const addTable = (data: any[], title: string) => {
      if (!Array.isArray(data) || data.length === 0) return

      addSubsectionHeader(title)
      
      // Get all unique keys from the data
      const allKeys = Array.from(new Set(data.flatMap(item => Object.keys(item))))
      
      if (allKeys.length === 0) return

      // Calculate column widths
      const colWidth = (maxWidth - 10) / allKeys.length
      
      // Table header
      checkPageBreak(50)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      
      // Header background
      doc.setFillColor(...colors.primary)
      doc.rect(margin, y - 8, maxWidth, 15, 'F')
      
      // Header text
      doc.setTextColor(255, 255, 255)
      let currentX = margin + 2
      allKeys.forEach((key) => {
        const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        const truncatedKey = displayKey.length > 15 ? displayKey.substring(0, 12) + '...' : displayKey
        doc.text(truncatedKey, currentX, y)
        currentX += colWidth
      })
      
      y += 18
      
      // Table rows
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.text)
      
      data.forEach((row, rowIndex) => {
        checkPageBreak(20)
        
        // Alternate row colors
        if (rowIndex % 2 === 0) {
          doc.setFillColor(...colors.lightGray)
          doc.rect(margin, y - 8, maxWidth, 15, 'F')
        }
        
        currentX = margin + 2
        allKeys.forEach(key => {
          const value = row[key] || ''
          const displayValue = typeof value === 'string' ? value : JSON.stringify(value)
          
          // Wrap text for long content
          const maxCellWidth = colWidth - 4
          const lines = doc.splitTextToSize(displayValue, maxCellWidth)
          const truncated = lines.length > 2 ? lines.slice(0, 2).join(' ').substring(0, 40) + '...' : lines.join(' ')
          
          doc.text(truncated, currentX, y)
          currentX += colWidth
        })
        
        y += 15
      })
      
      y += 8
    }

    // Enhanced list function
    const addList = (items: string[], title: string) => {
      if (!Array.isArray(items) || items.length === 0) return

      addSubsectionHeader(title)
      
      items.forEach((item, index) => {
        checkPageBreak(15)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        
        // Add bullet point
        doc.setTextColor(...colors.accent)
        doc.text('•', margin + 5, y)
        
        // Add item text
        doc.setTextColor(...colors.text)
        const lines = doc.splitTextToSize(item, maxWidth - 20)
        lines.forEach((line: string, lineIndex: number) => {
          if (lineIndex > 0) checkPageBreak(10)
          doc.text(line, margin + 15, y)
          y += 10
        })
        y += 2
      })
      
      y += 5
    }

    // Create executive summary from plan data
    const createExecutiveSummary = () => {
      const businessOverview = planData.BUSINESS_OVERVIEW || {}
      const riskAssessment = planData.RISK_ASSESSMENT || {}
      const strategies = planData.STRATEGIES || {}
      
      let summary = `This Business Continuity Plan (BCP) has been prepared for ${companyName} using the CARICHAM methodology. `
      
      if (businessOverview['Business Purpose']) {
        summary += `The company's primary business purpose is: ${businessOverview['Business Purpose']}. `
      }
      
      if (riskAssessment['Potential Hazards']) {
        const hazardCount = riskAssessment['Potential Hazards'].length
        summary += `This plan addresses ${hazardCount} identified potential hazards and risks that could impact business operations. `
      }
      
      summary += `The plan outlines comprehensive prevention, response, and recovery strategies to ensure business continuity during emergencies and disasters. `
      
      if (strategies['Prevention Strategies (Before Emergencies)']) {
        const preventionCount = strategies['Prevention Strategies (Before Emergencies)'].length
        summary += `It includes ${preventionCount} prevention strategies, `
      }
      
      if (strategies['Response Strategies (During Emergencies)']) {
        const responseCount = strategies['Response Strategies (During Emergencies)'].length
        summary += `${responseCount} response strategies, `
      }
      
      if (strategies['Recovery Strategies (After Emergencies)']) {
        const recoveryCount = strategies['Recovery Strategies (After Emergencies)'].length
        summary += `and ${recoveryCount} recovery strategies. `
      }
      
      summary += `This plan serves as a critical business document for loan applications, insurance purposes, and regulatory compliance, demonstrating the organization's commitment to risk management and business resilience.`
      
      return summary
    }

    try {
      // COVER PAGE
      doc.setFillColor(...colors.primary)
      doc.rect(0, 0, pageWidth, 80, 'F')
      
      // Company logo area (placeholder)
      doc.setFillColor(255, 255, 255)
      doc.rect(margin, 20, 60, 30, 'F')
      doc.setTextColor(...colors.primary)
      doc.setFontSize(8)
      doc.text('COMPANY', margin + 20, 35)
      doc.text('LOGO', margin + 23, 42)
      
      // Main title
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(28)
      doc.setFont('helvetica', 'bold')
      y = 35
      y = addText('BUSINESS CONTINUITY PLAN', margin, 28, true, true, [255, 255, 255])
      
      // Subtitle
      doc.setFontSize(14)
      doc.setFont('helvetica', 'normal')
      y = 90
      doc.setTextColor(...colors.text)
      y = addText(companyName, margin, 18, true, true)
      
      // Plan details box
      y = 130
      doc.setFillColor(...colors.lightGray)
      doc.rect(margin, y, maxWidth, 60, 'F')
      
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
      y = 220
      doc.setFillColor(...colors.accent)
      doc.rect(margin, y, maxWidth, 40, 'F')
      
      y += 12
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('CERTIFICATION', margin + 5, y)
      
      y += 15
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const certText = 'This Business Continuity Plan has been prepared in accordance with international best practices and the CARICHAM methodology for Caribbean small businesses.'
      const certLines = doc.splitTextToSize(certText, maxWidth - 10)
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
        const pageWidth_calc = doc.getStringUnitWidth(item.page) * 11 / doc.internal.scaleFactor
        const dotCount = Math.floor((maxWidth - titleWidth - pageWidth_calc - 20) / 3)
        const dots = '.'.repeat(dotCount)
        doc.text(dots, margin + 10 + titleWidth, y)
        
        // Page number
        doc.text(item.page, pageWidth - margin - pageWidth_calc, y)
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
      doc.rect(margin, y, maxWidth, 80, 'F')
      
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
        addKeyValue('Alternate Manager', planInfo['Alternate Manager'] || planInfo['alternateManager'] || planInfo['Responsable Alternatif'] || planInfo['Gerente Alterno'] || 'Not specified')
        addKeyValue('Plan Location', planInfo['Plan Location'] || planInfo['planLocation'] || planInfo['Emplacement du Plan'] || planInfo['Ubicación del Plan'] || 'Not specified')
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
          addTable(functions['Function Priority Assessment'] || functions['businessFunctions'], 'Business Function Analysis')
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
          addList(riskAssessment['Potential Hazards'] || riskAssessment['potentialHazards'], 'Identified Hazards and Risks')
        }
        
        if (riskAssessment['Risk Assessment Matrix'] || riskAssessment['riskMatrix']) {
          addTable(riskAssessment['Risk Assessment Matrix'] || riskAssessment['riskMatrix'], 'Risk Assessment Matrix')
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
          addList(strategies['Prevention Strategies (Before Emergencies)'] || strategies['preventionStrategies'], 'Prevention Strategies (Before Emergencies)')
        }
        
        if (strategies['Response Strategies (During Emergencies)'] || strategies['responseStrategies']) {
          addList(strategies['Response Strategies (During Emergencies)'] || strategies['responseStrategies'], 'Response Strategies (During Emergencies)')
        }
        
        if (strategies['Recovery Strategies (After Emergencies)'] || strategies['recoveryStrategies']) {
          addList(strategies['Recovery Strategies (After Emergencies)'] || strategies['recoveryStrategies'], 'Recovery Strategies (After Emergencies)')
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
          addTable(actionPlan['Action Plan by Risk Level'] || actionPlan['actionPlanByRisk'], 'Action Plan by Risk Level')
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
          addTable(actionPlan['Testing and Assessment Plan'] || actionPlan['testingPlan'], 'Testing and Assessment Plan')
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
          addTable(contacts['Staff Contact Information'] || contacts['staffContacts'], 'Staff Contact Information')
        }
        
        if (contacts['Key Customer Contacts'] || contacts['keyCustomers']) {
          addTable(contacts['Key Customer Contacts'] || contacts['keyCustomers'], 'Key Customer Contacts')
        }
        
        if (contacts['Supplier Information'] || contacts['supplierInfo']) {
          addTable(contacts['Supplier Information'] || contacts['supplierInfo'], 'Supplier Information')
        }
        
        if (contacts['Emergency Services and Utilities'] || contacts['emergencyServices']) {
          addTable(contacts['Emergency Services and Utilities'] || contacts['emergencyServices'], 'Emergency Services and Utilities')
        }
        
        if (contacts['Critical Business Information'] || contacts['criticalBusinessInfo']) {
          addSubsectionHeader('Critical Business Information')
          addParagraph(contacts['Critical Business Information'] || contacts['criticalBusinessInfo'])
        }
        
        if (contacts['Plan Distribution List'] || contacts['planDistribution']) {
          addTable(contacts['Plan Distribution List'] || contacts['planDistribution'], 'Plan Distribution List')
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
          addTable(testing['Plan Testing Schedule'] || testing['testingSchedule'], 'Plan Testing Schedule')
        }
        
        if (testing['Plan Revision History'] || testing['revisionHistory']) {
          addTable(testing['Plan Revision History'] || testing['revisionHistory'], 'Plan Revision History')
        }
        
        if (testing['Improvement Tracking'] || testing['improvementTracking']) {
          addTable(testing['Improvement Tracking'] || testing['improvementTracking'], 'Improvement Tracking')
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
          doc.text('Confidential Business Document', pageWidth/2 - 30, pageHeight - 10)
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
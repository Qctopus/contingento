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

    // Create PDF with proper settings
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
    
    // Helper function to check page break
    const checkPageBreak = (requiredSpace: number = 20) => {
      if (currentY + requiredSpace > MAX_Y) {
        doc.addPage()
        currentY = MARGIN_TOP
        addPageFooter(doc.getCurrentPageInfo().pageNumber)
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
    const companyName = planData.PLAN_INFORMATION?.['Company Name'] || 
                       planData.PLAN_INFORMATION?.['companyName'] ||
                       'Your Company'

    // Enhanced header function with proper spacing
    const addSectionHeader = (title: string) => {
      checkPageBreak(25)
      
      // Add spacing before header
      currentY += 10
      
      // Background rectangle
      doc.setFillColor(41, 84, 121)
      doc.rect(MARGIN_LEFT - 5, currentY - 6, CONTENT_WIDTH + 10, 12, 'F')
      
      // Header text
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(title, MARGIN_LEFT, currentY)
      
      // Reset text color and move down
      doc.setTextColor(33, 33, 33)
      currentY += 15
    }

    // Enhanced text function with better line spacing and array handling
    const addLabeledText = (label: string, text: string | string[], options?: {
      fontSize?: number,
      lineSpacing?: number,
      indent?: number
    }) => {
      if (!text || text === 'undefined') return
      
      const { fontSize = 10, lineSpacing = 5, indent = 0 } = options || {}
      
      // Handle array inputs
      let textContent = ''
      if (Array.isArray(text)) {
        textContent = text.filter(item => item && item.trim()).join('. ')
      } else {
        textContent = text.toString()
      }
      
      if (!textContent.trim()) return
      
      checkPageBreak(20)
      
      // Label
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(41, 84, 121)
      doc.text(`${label}:`, MARGIN_LEFT + indent, currentY)
      
      // Calculate label width for text positioning
      const labelWidth = doc.getTextWidth(`${label}: `)
      
      // Content
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(33, 33, 33)
      
      // Split text into lines that fit the available width
      const availableWidth = CONTENT_WIDTH - labelWidth - indent - 5
      const lines = doc.splitTextToSize(textContent, availableWidth)
      
      // Draw each line
      lines.forEach((line: string, index: number) => {
        if (index === 0) {
          // First line goes next to the label
          doc.text(line, MARGIN_LEFT + labelWidth + indent, currentY)
        } else {
          // Subsequent lines are indented
          currentY += lineSpacing
          checkPageBreak(10)
          doc.text(line, MARGIN_LEFT + labelWidth + indent, currentY)
        }
      })
      
      currentY += 8
    }

    // Enhanced table function with better formatting
    const addDataTable = (data: any, title: string, options?: {
      maxRows?: number,
      fontSize?: number
    }) => {
      // Handle different data formats
      let tableData: any[] = []
      
      if (Array.isArray(data)) {
        tableData = data
      } else if (data && typeof data === 'object') {
        // Convert object to array if needed
        tableData = Object.keys(data).map(key => ({
          Field: key,
          Value: data[key]
        }))
      }
      
      if (tableData.length === 0) return
      
      const { maxRows = 50, fontSize = 9 } = options || {}
      
      checkPageBreak(40)
      
      if (title) {
        addSectionHeader(title)
      }
      
      try {
        // Process data - handle various formats
        const processedData = tableData.slice(0, maxRows).map(item => {
          if (!item || typeof item !== 'object') return {}
          
          const row: any = {}
          Object.keys(item).forEach(key => {
            const value = item[key]
            row[key] = value !== null && value !== undefined ? value.toString() : ''
          })
          return row
        }).filter(row => Object.keys(row).length > 0)

        if (processedData.length === 0) {
          addLabeledText('Data', 'No data available')
          return
        }

        // Generate columns
        const columns = Object.keys(processedData[0] || {}).map(key => ({
          header: key.replace(/([A-Z])/g, ' $1').trim()
                     .replace(/^./, str => str.toUpperCase()),
          dataKey: key
        }))

        // Table configuration
        doc.autoTable({
          startY: currentY,
          head: [columns.map(col => col.header)],
          body: processedData.map(row => columns.map(col => row[col.dataKey] || '')),
          theme: 'grid',
          styles: {
            fontSize: fontSize,
            cellPadding: 3,
            textColor: [33, 33, 33],
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            valign: 'middle',
            overflow: 'linebreak'
          },
          headStyles: {
            fillColor: [41, 84, 121],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: fontSize,
            halign: 'center'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          margin: { 
            left: MARGIN_LEFT, 
            right: MARGIN_RIGHT 
          },
          tableWidth: 'auto',
          columnStyles: {
            0: { cellWidth: 'auto' }
          },
          didDrawPage: (data: any) => {
            // Add footer on new pages created by table
            if (data.pageNumber > 1) {
              addPageFooter(doc.getCurrentPageInfo().pageNumber)
            }
          }
        })

        currentY = (doc as any).lastAutoTable.finalY + 10
      } catch (error) {
        console.error('Table generation error:', error)
        addLabeledText('Data', 'Error generating table. Please check the data format.')
      }
    }

    // Enhanced list function
    const addBulletList = (items: string[], title?: string, options?: {
      bulletStyle?: string,
      indent?: number,
      spacing?: number
    }) => {
      if (!Array.isArray(items) || items.length === 0) return
      
      const { bulletStyle = '•', indent = 10, spacing = 6 } = options || {}
      
      if (title) {
        addSectionHeader(title)
      }
      
      items.forEach((item, index) => {
        checkPageBreak(15)
        
        // Bullet point
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(bulletStyle, MARGIN_LEFT + indent, currentY)
        
        // Item text
        const bulletWidth = doc.getTextWidth(bulletStyle + ' ')
        const availableWidth = CONTENT_WIDTH - indent - bulletWidth - 5
        const lines = doc.splitTextToSize(item.toString(), availableWidth)
        
        lines.forEach((line: string, lineIndex: number) => {
          if (lineIndex > 0) {
            currentY += spacing
            checkPageBreak(10)
          }
          doc.text(line, MARGIN_LEFT + indent + bulletWidth, currentY)
        })
        
        currentY += spacing + 2
      })
      
      currentY += 5
    }

    // START PDF GENERATION
    try {
      // PROFESSIONAL COVER PAGE
      // Add background image
      try {
        const coverImg = await fetch('/cover.png').then(res => res.blob())
        const coverDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(coverImg)
        })
        doc.addImage(coverDataUrl, 'PNG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT)
      } catch (error) {
        console.log('Cover image not found, using color background')
        doc.setFillColor(41, 84, 121)
        doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F')
      }
      
      // Add semi-transparent overlay for better text visibility
      doc.setFillColor(255, 255, 255)
      doc.rect(0, 60, PAGE_WIDTH, 180, 'F')
      
      // Add CARICHAM logo (top left)
      try {
        const carichamLogo = await fetch('/caricham.png').then(res => res.blob())
        const carichamDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(carichamLogo)
        })
        doc.addImage(carichamDataUrl, 'PNG', 20, 20, 40, 20)
      } catch (error) {
        console.log('CARICHAM logo not found')
      }
      
      // Add UNDP logo (top right)
      try {
        const undpLogo = await fetch('/UNDP.png').then(res => res.blob())
        const undpDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(undpLogo)
        })
        doc.addImage(undpDataUrl, 'PNG', PAGE_WIDTH - 60, 20, 40, 20)
      } catch (error) {
        console.log('UNDP logo not found')
      }
      
      // Main title
      doc.setTextColor(41, 84, 121)
      doc.setFontSize(36)
      doc.setFont('helvetica', 'bold')
      doc.text('BUSINESS', PAGE_WIDTH / 2, 110, { align: 'center' })
      doc.text('CONTINUITY PLAN', PAGE_WIDTH / 2, 130, { align: 'center' })
      
      // Divider line
      doc.setDrawColor(41, 84, 121)
      doc.setLineWidth(2)
      doc.line(60, 145, PAGE_WIDTH - 60, 145)
      
      // Company name (remove any bullet points)
      doc.setFontSize(24)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(33, 33, 33)
      const cleanCompanyName = companyName.replace(/^[•\-\*]\s*/, '').trim()
      doc.text(cleanCompanyName, PAGE_WIDTH / 2, 170, { align: 'center' })
      
      // Date and additional info
      doc.setFontSize(14)
      doc.setTextColor(100, 100, 100)
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      doc.text(currentDate, PAGE_WIDTH / 2, 190, { align: 'center' })
      
      // Bottom section
      doc.setFontSize(12)
      doc.text('Prepared in accordance with', PAGE_WIDTH / 2, 220, { align: 'center' })
      doc.setFont('helvetica', 'bold')
      doc.text('CARICHAM Business Continuity Framework', PAGE_WIDTH / 2, 230, { align: 'center' })
      
      // Table of Contents
      doc.addPage()
      currentY = MARGIN_TOP
      addPageFooter(2)
      
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(41, 84, 121)
      doc.text('TABLE OF CONTENTS', MARGIN_LEFT, currentY)
      currentY += 15
      
      const sections = [
        { num: '1', title: 'Plan Information', page: 3 },
        { num: '2', title: 'Business Overview', page: 4 },
        { num: '3', title: 'Essential Business Functions', page: 5 },
        { num: '4', title: 'Risk Assessment', page: 6 },
        { num: '5', title: 'Recovery Strategies', page: 7 },
        { num: '6', title: 'Emergency Response Procedures', page: 8 },
        { num: '7', title: 'Contacts and Critical Information', page: 9 },
        { num: '8', title: 'Testing and Maintenance', page: 10 }
      ]
      
      doc.setFontSize(12)
      doc.setTextColor(33, 33, 33)
      sections.forEach(section => {
        doc.setFont('helvetica', 'bold')
        doc.text(section.num, MARGIN_LEFT, currentY)
        doc.setFont('helvetica', 'normal')
        doc.text(section.title, MARGIN_LEFT + 15, currentY)
        doc.text(section.page.toString(), PAGE_WIDTH - MARGIN_RIGHT - 20, currentY)
        
        // Dotted line
        const titleWidth = doc.getTextWidth(section.title)
        const dotsStart = MARGIN_LEFT + 15 + titleWidth + 5
        const dotsEnd = PAGE_WIDTH - MARGIN_RIGHT - 25
        doc.setLineDashPattern([1, 2], 0)
        doc.line(dotsStart, currentY - 1, dotsEnd, currentY - 1)
        doc.setLineDashPattern([], 0)
        
        currentY += 10
      })
      
      // SECTION 1: PLAN INFORMATION
      doc.addPage()
      currentY = MARGIN_TOP
      addPageFooter(3)
      
      addSectionHeader('1. Plan Information')
      
      if (planData.PLAN_INFORMATION) {
        const info = planData.PLAN_INFORMATION
        addLabeledText('Company Name', info['Company Name'] || info['companyName'] || 'Not specified')
        addLabeledText('Plan Manager', info['Plan Manager'] || info['planManager'] || 'Not specified')
        addLabeledText('Alternate Plan Manager', info['Alternate Manager'] || info['alternateManager'] || 'Not designated')
        addLabeledText('Physical Plan Location', info['Physical Plan Location'] || info['physicalPlanLocation'] || 'Not specified')
        addLabeledText('Digital Plan Location', info['Digital Plan Location'] || info['digitalPlanLocation'] || 'Not specified')
      }
      
      // SECTION 2: BUSINESS OVERVIEW
      if (planData.BUSINESS_OVERVIEW) {
        checkPageBreak(30)
        addSectionHeader('2. Business Overview')
        
        const business = planData.BUSINESS_OVERVIEW
        addLabeledText('Business License', business['Business License Number'] || business['businessLicense'] || 'Not specified')
        addLabeledText('Business Purpose', business['Business Purpose'] || business['businessPurpose'] || 'Not specified')
        addLabeledText('Products & Services', business['Products and Services'] || business['productsAndServices'] || 'Not specified')
        addLabeledText('Operating Hours', business['Operating Hours'] || business['operatingHours'] || 'Not specified')
        addLabeledText('Key Personnel', business['Key Personnel Involved'] || business['keyPersonnel'] || 'Not specified')
        addLabeledText('Customer Base', business['Customer Base'] || business['customerBase'] || 'Not specified')
        addLabeledText('Minimum Resources', business['Minimum Resource Requirements'] || business['minimumResources'] || 'Not specified')
      }
      
      // SECTION 3: ESSENTIAL FUNCTIONS
      if (planData.ESSENTIAL_FUNCTIONS) {
        doc.addPage()
        currentY = MARGIN_TOP
        addPageFooter(doc.getCurrentPageInfo().pageNumber)
        
        addSectionHeader('3. Essential Business Functions')
        
        const functions = planData.ESSENTIAL_FUNCTIONS
        
        // Handle Function Priority Assessment table
        if (functions['Function Priority Assessment'] || functions['businessFunctions']) {
          const tableData = functions['Function Priority Assessment'] || functions['businessFunctions']
          addDataTable(tableData, 'Function Priority Assessment')
        }
        
        // Handle other function categories
        const functionCategories = [
          { key: 'Supply Chain Management Functions', title: 'Supply Chain Management' },
          { key: 'Staff Management Functions', title: 'Staff Management' },
          { key: 'Technology Functions', title: 'Technology' },
          { key: 'Product and Service Delivery', title: 'Products & Services' },
          { key: 'Infrastructure and Facilities', title: 'Infrastructure' },
          { key: 'Sales and Marketing Functions', title: 'Sales & Marketing' },
          { key: 'Administrative Functions', title: 'Administration' }
        ]
        
        functionCategories.forEach(category => {
          if (functions[category.key]) {
            const items = functions[category.key]
            if (Array.isArray(items) && items.length > 0) {
              addBulletList(items, category.title)
            }
          }
        })
      }
      
      // SECTION 4: RISK ASSESSMENT
      if (planData.RISK_ASSESSMENT) {
        doc.addPage()
        currentY = MARGIN_TOP
        addPageFooter(doc.getCurrentPageInfo().pageNumber)
        
        addSectionHeader('4. Risk Assessment')
        
        const risk = planData.RISK_ASSESSMENT
        
        if (risk['Potential Hazards'] || risk['potentialHazards']) {
          const hazards = risk['Potential Hazards'] || risk['potentialHazards']
          if (Array.isArray(hazards)) {
            addBulletList(hazards, 'Identified Hazards')
          }
        }
        
        if (risk['Risk Assessment Matrix'] || risk['riskMatrix']) {
          const riskMatrix = risk['Risk Assessment Matrix'] || risk['riskMatrix']
          addDataTable(riskMatrix, 'Risk Assessment Matrix')
        }
      }
      
      // SECTION 5: RECOVERY STRATEGIES
      if (planData.RECOVERY_STRATEGIES || planData.STRATEGIES) {
        doc.addPage()
        currentY = MARGIN_TOP
        addPageFooter(doc.getCurrentPageInfo().pageNumber)
        
        addSectionHeader('5. Recovery Strategies')
        
        const strategies = planData.RECOVERY_STRATEGIES || planData.STRATEGIES
        
        if (strategies['Recovery Time Objectives'] || strategies['rto']) {
          const rtoData = strategies['Recovery Time Objectives'] || strategies['rto']
          addDataTable(rtoData, 'Recovery Time Objectives')
        }
        
        if (strategies['Prevention Strategies (Before Emergencies)'] || strategies['preventionStrategies']) {
          const prevention = strategies['Prevention Strategies (Before Emergencies)'] || strategies['preventionStrategies']
          if (Array.isArray(prevention)) {
            addBulletList(prevention, 'Prevention Strategies')
          }
        }
        
        if (strategies['Response Strategies (During Emergencies)'] || strategies['responseStrategies']) {
          const response = strategies['Response Strategies (During Emergencies)'] || strategies['responseStrategies']
          if (Array.isArray(response)) {
            addBulletList(response, 'Response Strategies')
          }
        }
        
        if (strategies['Recovery Strategies (After Emergencies)'] || strategies['recoveryStrategies']) {
          const recovery = strategies['Recovery Strategies (After Emergencies)'] || strategies['recoveryStrategies']
          if (Array.isArray(recovery)) {
            addBulletList(recovery, 'Recovery Strategies')
          }
        }
        
        if (strategies['Backup and Recovery Procedures'] || strategies['backupProcedures']) {
          const procedures = strategies['Backup and Recovery Procedures'] || strategies['backupProcedures']
          if (typeof procedures === 'string') {
            addLabeledText('Backup Procedures', procedures)
          } else if (Array.isArray(procedures)) {
            addBulletList(procedures, 'Backup and Recovery Procedures')
          }
        }
        
        if (strategies['Long-term Risk Reduction Measures'] || strategies['longTermMeasures']) {
          addLabeledText('Long-term Risk Reduction', strategies['Long-term Risk Reduction Measures'] || strategies['longTermMeasures'])
        }
      }
      
      // SECTION 6: EMERGENCY RESPONSE
      if (planData.EMERGENCY_RESPONSE || planData.ACTION_PLAN) {
        doc.addPage()
        currentY = MARGIN_TOP
        addPageFooter(doc.getCurrentPageInfo().pageNumber)
        
        addSectionHeader('6. Emergency Response Procedures')
        
        const emergency = planData.EMERGENCY_RESPONSE || {}
        const actionPlan = planData.ACTION_PLAN || {}
        
        // Emergency Response fields
        if (emergency['Evacuation Procedures'] || emergency['evacuationProcedures']) {
          addLabeledText('Evacuation Procedures', 
            emergency['Evacuation Procedures'] || emergency['evacuationProcedures'])
        }
        
        if (emergency['Communication Plan'] || emergency['communicationPlan']) {
          addLabeledText('Communication Plan', 
            emergency['Communication Plan'] || emergency['communicationPlan'])
        }
        
        if (emergency['First Response Actions'] || emergency['firstResponse']) {
          const actions = emergency['First Response Actions'] || emergency['firstResponse']
          if (Array.isArray(actions)) {
            addBulletList(actions, 'First Response Actions')
          } else {
            addLabeledText('First Response Actions', actions)
          }
        }
        
        // Action Plan fields
        if (actionPlan['Action Plan by Risk Level'] || actionPlan['actionPlanByRisk']) {
          const actionData = actionPlan['Action Plan by Risk Level'] || actionPlan['actionPlanByRisk']
          addDataTable(actionData, 'Action Plan by Risk Level')
        }
        
        if (actionPlan['Implementation Timeline'] || actionPlan['implementationTimeline']) {
          addLabeledText('Implementation Timeline', 
            actionPlan['Implementation Timeline'] || actionPlan['implementationTimeline'])
        }
        
        if (actionPlan['Resource Requirements'] || actionPlan['resourceRequirements']) {
          addLabeledText('Resource Requirements', 
            actionPlan['Resource Requirements'] || actionPlan['resourceRequirements'])
        }
        
        if (actionPlan['Responsible Parties and Roles'] || actionPlan['responsibleParties']) {
          addLabeledText('Responsible Parties', 
            actionPlan['Responsible Parties and Roles'] || actionPlan['responsibleParties'])
        }
        
        if (actionPlan['Testing and Assessment Plan'] || actionPlan['testingPlan']) {
          const testing = actionPlan['Testing and Assessment Plan'] || actionPlan['testingPlan']
          addDataTable(testing, 'Testing and Assessment Plan')
        }
      }
      
      // SECTION 7: CONTACTS
      if (planData.CONTACTS_AND_INFORMATION) {
        doc.addPage()
        currentY = MARGIN_TOP
        addPageFooter(doc.getCurrentPageInfo().pageNumber)
        
        addSectionHeader('7. Contacts and Critical Information')
        
        const contacts = planData.CONTACTS_AND_INFORMATION
        
        if (contacts['Staff Contact Information'] || contacts['staffContacts']) {
          addDataTable(contacts['Staff Contact Information'] || contacts['staffContacts'], 'Staff Contacts')
        }
        
        if (contacts['Key Customer Contacts'] || contacts['keyCustomers']) {
          addDataTable(contacts['Key Customer Contacts'] || contacts['keyCustomers'], 'Key Customers')
        }
        
        if (contacts['Supplier Information'] || contacts['supplierInfo']) {
          addDataTable(contacts['Supplier Information'] || contacts['supplierInfo'], 'Suppliers')
        }
        
        if (contacts['Emergency Services and Utilities'] || contacts['emergencyServices']) {
          addDataTable(contacts['Emergency Services and Utilities'] || contacts['emergencyServices'], 'Emergency Services')
        }
      }
      
      // SECTION 8: TESTING AND MAINTENANCE
      if (planData.TESTING_AND_MAINTENANCE) {
        doc.addPage()
        currentY = MARGIN_TOP
        addPageFooter(doc.getCurrentPageInfo().pageNumber)
        
        addSectionHeader('8. Testing and Maintenance')
        
        const testing = planData.TESTING_AND_MAINTENANCE
        
        if (testing['Plan Testing Schedule'] || testing['testingSchedule']) {
          addDataTable(testing['Plan Testing Schedule'] || testing['testingSchedule'], 'Testing Schedule')
        }
        
        if (testing['Plan Revision History'] || testing['revisionHistory']) {
          addDataTable(testing['Plan Revision History'] || testing['revisionHistory'], 'Revision History')
        }
        
        addLabeledText('Annual Review Process', 
          testing['Annual Review Process'] || testing['annualReview'] || 'To be established')
        addLabeledText('Update Triggers', 
          testing['Trigger Events for Plan Updates'] || testing['triggerEvents'] || 'To be established')
      }
      
      // Add page numbers and footers to all pages
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
      throw error
    }
  } catch (error) {
    console.error('Export PDF error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
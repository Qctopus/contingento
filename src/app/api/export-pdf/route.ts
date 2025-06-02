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
    const doc = new jsPDF()
    
    // Set initial position and margins
    let y = 20
    const margin = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const maxWidth = pageWidth - (margin * 2)
    const maxContentHeight = pageHeight - 40 // Leave space for footer

    // Helper function to check if we need a new page
    const checkPageBreak = (neededSpace: number = 20) => {
      if (y + neededSpace > maxContentHeight) {
        doc.addPage()
        y = 20
      }
    }

    // Helper function to add text with wrapping and automatic page breaks
    const addText = (text: string, x: number, fontSize: number, isBold = false, isTitle = false) => {
      checkPageBreak(fontSize * 2)
      
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      
      if (isTitle) {
        // Center titles
        const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor
        x = (pageWidth - textWidth) / 2
      }
      
      const lines = doc.splitTextToSize(text, maxWidth)
      
      lines.forEach((line: string, index: number) => {
        if (index > 0) checkPageBreak(fontSize * 0.4)
        doc.text(line, x, y)
        y += fontSize * 0.4
      })
      
      return y
    }

    // Helper function to add a section header
    const addSectionHeader = (title: string) => {
      checkPageBreak(30)
      y += 10
      y = addText(title, margin, 16, true)
      y += 5
      
      // Add underline
      doc.setLineWidth(0.5)
      doc.line(margin, y, pageWidth - margin, y)
      y += 10
    }

    // Helper function to add a subsection header
    const addSubsectionHeader = (title: string) => {
      checkPageBreak(20)
      y += 5
      y = addText(title, margin, 14, true)
      y += 8
    }

    // Helper function to add regular text
    const addParagraph = (text: string, indent = 0) => {
      if (!text || text.trim() === '') return
      y = addText(text, margin + indent, 11)
      y += 5
    }

    // Helper function to add table data
    const addTable = (data: any[], title: string) => {
      if (!Array.isArray(data) || data.length === 0) return

      addSubsectionHeader(title)
      
      // Get all unique keys from the data
      const allKeys = Array.from(new Set(data.flatMap(item => Object.keys(item))))
      
      if (allKeys.length === 0) return

      // Table header
      checkPageBreak(40)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      
      let currentX = margin
      const colWidth = (maxWidth) / allKeys.length
      
      // Draw header background
      doc.setFillColor(240, 240, 240)
      doc.rect(margin, y - 8, maxWidth, 12, 'F')
      
      // Draw header text
      allKeys.forEach((key, index) => {
        const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        doc.text(displayKey, currentX + 2, y)
        currentX += colWidth
      })
      
      y += 12
      
      // Table rows
      doc.setFont('helvetica', 'normal')
      data.forEach((row, rowIndex) => {
        checkPageBreak(15)
        
        // Alternate row colors
        if (rowIndex % 2 === 0) {
          doc.setFillColor(250, 250, 250)
          doc.rect(margin, y - 8, maxWidth, 12, 'F')
        }
        
        currentX = margin
        allKeys.forEach(key => {
          const value = row[key] || ''
          const displayValue = typeof value === 'string' ? value : JSON.stringify(value)
          
          // Truncate long text
          const truncated = displayValue.length > 30 ? displayValue.substring(0, 27) + '...' : displayValue
          doc.text(truncated, currentX + 2, y)
          currentX += colWidth
        })
        
        y += 12
      })
      
      y += 10
    }

    // Helper function to add list items
    const addList = (items: string[], title: string) => {
      if (!Array.isArray(items) || items.length === 0) return

      addSubsectionHeader(title)
      
      items.forEach(item => {
        checkPageBreak(15)
        y = addText(`• ${item}`, margin + 10, 11)
        y += 3
      })
      
      y += 5
    }

    try {
      // TITLE PAGE
      doc.setFillColor(0, 132, 200) // CARICHAM blue
      doc.rect(0, 0, pageWidth, 60, 'F')
      
      doc.setTextColor(255, 255, 255)
      y = 35
      y = addText('Business Continuity Plan', margin, 24, true, true)
      
      y = 80
      doc.setTextColor(0, 0, 0)
      const companyName = planData.PLAN_INFORMATION?.['Company Name'] || 'Your Company'
      y = addText(companyName, margin, 20, true, true)
      
      y = 120
      y = addText('Prepared using the CARICHAM Methodology', margin, 12, false, true)
      
      y = 140
      const currentDate = new Date().toLocaleDateString()
      y = addText(`Generated on: ${currentDate}`, margin, 10, false, true)

      // Add new page for content
      doc.addPage()
      y = 20

      // TABLE OF CONTENTS
      addSectionHeader('Table of Contents')
      
      const tableOfContents = [
        'Plan Information ......................................................... 3',
        'Business Overview ..................................................... 4',
        'Essential Business Functions .......................................... 5',
        'Risk Assessment ....................................................... 7',
        'Business Continuity Strategies ........................................ 8',
        'Action Plan ........................................................... 10',
        'Contacts and Critical Information ..................................... 12',
        'Testing and Maintenance ............................................... 14'
      ]
      
      tableOfContents.forEach(item => {
        addParagraph(item)
      })

      // Add new page for main content
      doc.addPage()
      y = 20

      // 1. PLAN INFORMATION
      addSectionHeader('1. Plan Information')
      
      if (planData.PLAN_INFORMATION) {
        const planInfo = planData.PLAN_INFORMATION
        addParagraph(`Company Name: ${planInfo['Company Name'] || 'Not specified'}`)
        addParagraph(`Plan Manager: ${planInfo['Plan Manager'] || 'Not specified'}`)
        addParagraph(`Alternate Manager: ${planInfo['Alternate Manager'] || 'Not specified'}`)
        addParagraph(`Plan Location: ${planInfo['Plan Location'] || 'Not specified'}`)
      }

      // 2. BUSINESS OVERVIEW
      addSectionHeader('2. Business Overview')
      
      if (planData.BUSINESS_OVERVIEW) {
        const businessOverview = planData.BUSINESS_OVERVIEW
        addSubsectionHeader('Business Details')
        addParagraph(`Business License Number: ${businessOverview['Business License Number'] || 'Not specified'}`)
        addParagraph(`Business Purpose: ${businessOverview['Business Purpose'] || 'Not specified'}`)
        
        addSubsectionHeader('Products and Services')
        addParagraph(businessOverview['Products and Services'] || 'Not specified')
        
        addSubsectionHeader('Service Delivery')
        addParagraph(businessOverview['Service Delivery Methods'] || 'Not specified')
        
        addSubsectionHeader('Operations')
        addParagraph(`Operating Hours: ${businessOverview['Operating Hours'] || 'Not specified'}`)
        addParagraph(`Key Personnel: ${businessOverview['Key Personnel Involved'] || 'Not specified'}`)
        addParagraph(`Minimum Resources: ${businessOverview['Minimum Resource Requirements'] || 'Not specified'}`)
        addParagraph(`Customer Base: ${businessOverview['Customer Base'] || 'Not specified'}`)
        addParagraph(`Service Provider BCP Status: ${businessOverview['Service Provider BCP Status'] || 'Not specified'}`)
      }

      // 3. ESSENTIAL BUSINESS FUNCTIONS
      addSectionHeader('3. Essential Business Functions')
      
      if (planData.ESSENTIAL_FUNCTIONS) {
        const functions = planData.ESSENTIAL_FUNCTIONS
        
        // Add selected functions for each category
        Object.entries(functions).forEach(([category, items]) => {
          if (category !== 'Function Priority Assessment' && Array.isArray(items) && items.length > 0) {
            const displayCategory = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
            addList(items, displayCategory)
          }
        })
        
        // Add priority assessment table
        if (functions['Function Priority Assessment']) {
          addTable(functions['Function Priority Assessment'], 'Function Priority Assessment')
        }
      }

      // 4. RISK ASSESSMENT
      addSectionHeader('4. Risk Assessment')
      
      if (planData.RISK_ASSESSMENT) {
        const riskAssessment = planData.RISK_ASSESSMENT
        
        if (riskAssessment['Potential Hazards']) {
          addList(riskAssessment['Potential Hazards'], 'Identified Hazards')
        }
        
        if (riskAssessment['Risk Assessment Matrix']) {
          addTable(riskAssessment['Risk Assessment Matrix'], 'Risk Assessment Matrix')
        }
      }

      // 5. BUSINESS CONTINUITY STRATEGIES
      addSectionHeader('5. Business Continuity Strategies')
      
      if (planData.STRATEGIES) {
        const strategies = planData.STRATEGIES
        
        if (strategies['Prevention Strategies (Before Emergencies)']) {
          addList(strategies['Prevention Strategies (Before Emergencies)'], 'Prevention Strategies (Before Emergencies)')
        }
        
        if (strategies['Response Strategies (During Emergencies)']) {
          addList(strategies['Response Strategies (During Emergencies)'], 'Response Strategies (During Emergencies)')
        }
        
        if (strategies['Recovery Strategies (After Emergencies)']) {
          addList(strategies['Recovery Strategies (After Emergencies)'], 'Recovery Strategies (After Emergencies)')
        }
        
        if (strategies['Long-term Risk Reduction Measures']) {
          addSubsectionHeader('Long-term Risk Reduction Measures')
          addParagraph(strategies['Long-term Risk Reduction Measures'])
        }
      }

      // 6. ACTION PLAN
      addSectionHeader('6. Action Plan')
      
      if (planData.ACTION_PLAN) {
        const actionPlan = planData.ACTION_PLAN
        
        if (actionPlan['Action Plan by Risk Level']) {
          addTable(actionPlan['Action Plan by Risk Level'], 'Action Plan by Risk Level')
        }
        
        if (actionPlan['Implementation Timeline']) {
          addSubsectionHeader('Implementation Timeline')
          addParagraph(actionPlan['Implementation Timeline'])
        }
        
        if (actionPlan['Resource Requirements']) {
          addSubsectionHeader('Resource Requirements')
          addParagraph(actionPlan['Resource Requirements'])
        }
        
        if (actionPlan['Responsible Parties and Roles']) {
          addSubsectionHeader('Responsible Parties and Roles')
          addParagraph(actionPlan['Responsible Parties and Roles'])
        }
        
        if (actionPlan['Review and Update Schedule']) {
          addSubsectionHeader('Review and Update Schedule')
          addParagraph(actionPlan['Review and Update Schedule'])
        }
        
        if (actionPlan['Testing and Assessment Plan']) {
          addTable(actionPlan['Testing and Assessment Plan'], 'Testing and Assessment Plan')
        }
      }

      // 7. CONTACTS AND CRITICAL INFORMATION
      addSectionHeader('7. Contacts and Critical Information')
      
      if (planData.CONTACTS_AND_INFORMATION) {
        const contacts = planData.CONTACTS_AND_INFORMATION
        
        if (contacts['Staff Contact Information']) {
          addTable(contacts['Staff Contact Information'], 'Staff Contact Information')
        }
        
        if (contacts['Key Customer Contacts']) {
          addTable(contacts['Key Customer Contacts'], 'Key Customer Contacts')
        }
        
        if (contacts['Supplier Information']) {
          addTable(contacts['Supplier Information'], 'Supplier Information')
        }
        
        if (contacts['Emergency Services and Utilities']) {
          addTable(contacts['Emergency Services and Utilities'], 'Emergency Services and Utilities')
        }
        
        if (contacts['Critical Business Information']) {
          addSubsectionHeader('Critical Business Information')
          addParagraph(contacts['Critical Business Information'])
        }
        
        if (contacts['Plan Distribution List']) {
          addTable(contacts['Plan Distribution List'], 'Plan Distribution List')
        }
      }

      // 8. TESTING AND MAINTENANCE
      addSectionHeader('8. Testing and Maintenance')
      
      if (planData.TESTING_AND_MAINTENANCE) {
        const testing = planData.TESTING_AND_MAINTENANCE
        
        if (testing['Plan Testing Schedule']) {
          addTable(testing['Plan Testing Schedule'], 'Plan Testing Schedule')
        }
        
        if (testing['Plan Revision History']) {
          addTable(testing['Plan Revision History'], 'Plan Revision History')
        }
        
        if (testing['Improvement Tracking']) {
          addTable(testing['Improvement Tracking'], 'Improvement Tracking')
        }
        
        if (testing['Annual Review Process']) {
          addSubsectionHeader('Annual Review Process')
          addParagraph(testing['Annual Review Process'])
        }
        
        if (testing['Trigger Events for Plan Updates']) {
          addSubsectionHeader('Trigger Events for Plan Updates')
          addParagraph(testing['Trigger Events for Plan Updates'])
        }
      }

      // Add footer to all pages
      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text(`${companyName} - Business Continuity Plan`, margin, pageHeight - 10)
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10)
        doc.text(`Generated: ${currentDate}`, pageWidth - margin - 80, pageHeight - 10)
      }

      // Get the PDF as a buffer
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

      // Return PDF as response
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${companyName.replace(/[^a-zA-Z0-9]/g, '-')}-business-continuity-plan.pdf"`,
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
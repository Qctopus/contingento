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

    // Create a new PDF document
    const doc = new jsPDF('p', 'mm', 'a4')
    
    // Setup
    let y = 15
    const margin = 15
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const maxWidth = pageWidth - (margin * 2)
    
    const companyName = planData.PLAN_INFORMATION?.['Company Name'] || 
                       planData.PLAN_INFORMATION?.['companyName'] ||
                       'Your Company'

    // Simple header function
    const addHeader = (title: string) => {
      if (y > 250) {
        doc.addPage()
        y = 15
      }
      y += 5
      doc.setFillColor(41, 84, 121)
      doc.rect(margin, y - 5, maxWidth, 10, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(title, margin + 2, y + 2)
      y += 12
      doc.setTextColor(33, 33, 33)
    }

    // Simple text function
    const addText = (label: string, text: string) => {
      if (!text) return
      if (y > 270) {
        doc.addPage()
        y = 15
      }
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(41, 84, 121)
      doc.text(`${label}:`, margin, y)
      
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(33, 33, 33)
      const labelWidth = doc.getStringUnitWidth(`${label}: `) * 9 / doc.internal.scaleFactor
      const lines = doc.splitTextToSize(text.toString(), maxWidth - labelWidth - 5)
      
      for (let i = 0; i < lines.length; i++) {
        if (i === 0) {
          doc.text(lines[i], margin + labelWidth, y)
        } else {
          y += 8
          if (y > 270) {
            doc.addPage()
            y = 15
          }
          doc.text(lines[i], margin + labelWidth, y)
        }
      }
      y += 10
    }

    // Simple table function
    const addTable = (data: any[], title: string) => {
      if (!Array.isArray(data) || data.length === 0) return
      
      if (y > 200) {
        doc.addPage()
        y = 15
      }
      
      addHeader(title)
      
      try {
        const processedData = data.map(item => {
          const row: any = {}
          Object.keys(item).forEach(key => {
            row[key] = item[key] !== null && item[key] !== undefined ? item[key].toString() : ''
          })
          return row
        })

        const columns = Object.keys(processedData[0] || {}).map(col => ({
          header: col.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          dataKey: col
        }))

        doc.autoTable({
          startY: y,
          head: [columns.map(col => col.header)],
          body: processedData.map(row => columns.map(col => row[col.dataKey] || '')),
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 2,
            textColor: [33, 33, 33],
            lineColor: [200, 200, 200],
            lineWidth: 0.1
          },
          headStyles: {
            fillColor: [41, 84, 121],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8
          },
          margin: { left: margin, right: margin },
          tableWidth: maxWidth
        })

        y = (doc as any).lastAutoTable.finalY + 10
      } catch (error) {
        console.error('Table error:', error)
        addText('Table Data', JSON.stringify(data).substring(0, 100) + '...')
      }
    }

    // Simple list function
    const addList = (items: string[], title: string) => {
      if (!Array.isArray(items) || items.length === 0) return
      
      addHeader(title)
      
      items.forEach(item => {
        if (y > 270) {
          doc.addPage()
          y = 15
        }
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text('• ', margin, y)
        const lines = doc.splitTextToSize(item.toString(), maxWidth - 10)
        
        for (let i = 0; i < lines.length; i++) {
          if (i > 0 && y > 270) {
            doc.addPage()
            y = 15
          }
          doc.text(lines[i], margin + 5, y)
          if (i < lines.length - 1) y += 8
        }
        y += 10
      })
    }

    try {
      // COVER PAGE
      doc.setFillColor(41, 84, 121)
      doc.rect(0, 0, pageWidth, 60, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('BUSINESS CONTINUITY PLAN', pageWidth/2, 30, { align: 'center' })
      
      doc.setFontSize(16)
      doc.setFont('helvetica', 'normal')
      doc.text(companyName, pageWidth/2, 45, { align: 'center' })
      
      // Plan details
      y = 80
      doc.setTextColor(33, 33, 33)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Plan Details', margin, y)
      
      y += 15
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const currentDate = new Date().toLocaleDateString()
      doc.text(`Date: ${currentDate}`, margin, y)
      y += 12
      doc.text('Methodology: CARICHAM', margin, y)
      y += 12
      doc.text('Status: CONFIDENTIAL', margin, y)

      // PLAN INFORMATION
      doc.addPage()
      y = 15
      
      addHeader('1. Plan Information')
      
      if (planData.PLAN_INFORMATION) {
        const info = planData.PLAN_INFORMATION
        addText('Company Name', info['Company Name'] || info['companyName'] || 'Not specified')
        addText('Plan Manager', info['Plan Manager'] || info['planManager'] || 'Not specified')
        addText('Alternate Manager', info['Alternate Manager'] || info['alternateManager'] || 'Not designated')
        addText('Physical Plan Location', info['Physical Plan Location'] || info['physicalPlanLocation'] || 'Not specified')
        addText('Digital Plan Location', info['Digital Plan Location'] || info['digitalPlanLocation'] || 'Not specified')
      }

      // BUSINESS OVERVIEW
      addHeader('2. Business Overview')
      
      if (planData.BUSINESS_OVERVIEW) {
        const business = planData.BUSINESS_OVERVIEW
        addText('Business License', business['Business License Number'] || business['businessLicense'] || 'Not specified')
        addText('Business Purpose', business['Business Purpose'] || business['businessPurpose'] || 'Not specified')
        addText('Products & Services', business['Products and Services'] || business['productsAndServices'] || 'Not specified')
        addText('Operating Hours', business['Operating Hours'] || business['operatingHours'] || 'Not specified')
        addText('Key Personnel', business['Key Personnel Involved'] || business['keyPersonnel'] || 'Not specified')
        addText('Customer Base', business['Customer Base'] || business['customerBase'] || 'Not specified')
        addText('Minimum Resources', business['Minimum Resource Requirements'] || business['minimumResources'] || 'Not specified')
      }

      // ESSENTIAL FUNCTIONS
      addHeader('3. Essential Business Functions')
      
      if (planData.ESSENTIAL_FUNCTIONS) {
        const functions = planData.ESSENTIAL_FUNCTIONS
        if (functions['Function Priority Assessment'] || functions['businessFunctions']) {
          const tableData = functions['Function Priority Assessment'] || functions['businessFunctions']
          addTable(tableData, 'Function Priority Assessment')
        }
      }

      // RISK ASSESSMENT
      addHeader('4. Risk Assessment')
      
      if (planData.RISK_ASSESSMENT) {
        const risk = planData.RISK_ASSESSMENT
        
        if (risk['Potential Hazards'] || risk['potentialHazards']) {
          const hazards = risk['Potential Hazards'] || risk['potentialHazards']
          if (Array.isArray(hazards)) {
            addList(hazards, 'Identified Hazards')
          }
        }
        
        if (risk['Risk Assessment Matrix'] || risk['riskMatrix']) {
          const riskMatrix = risk['Risk Assessment Matrix'] || risk['riskMatrix']
          addTable(riskMatrix, 'Risk Assessment Matrix')
        }
      }

      // STRATEGIES
      addHeader('5. Business Continuity Strategies')
      
      if (planData.STRATEGIES) {
        const strategies = planData.STRATEGIES
        
        if (strategies['Prevention Strategies (Before Emergencies)'] || strategies['preventionStrategies']) {
          const prevention = strategies['Prevention Strategies (Before Emergencies)'] || strategies['preventionStrategies']
          if (Array.isArray(prevention)) {
            addList(prevention, 'Prevention Strategies')
          }
        }
        
        if (strategies['Response Strategies (During Emergencies)'] || strategies['responseStrategies']) {
          const response = strategies['Response Strategies (During Emergencies)'] || strategies['responseStrategies']
          if (Array.isArray(response)) {
            addList(response, 'Response Strategies')
          }
        }
        
        if (strategies['Recovery Strategies (After Emergencies)'] || strategies['recoveryStrategies']) {
          const recovery = strategies['Recovery Strategies (After Emergencies)'] || strategies['recoveryStrategies']
          if (Array.isArray(recovery)) {
            addList(recovery, 'Recovery Strategies')
          }
        }
        
        if (strategies['Long-term Risk Reduction Measures'] || strategies['longTermMeasures']) {
          addText('Long-term Risk Reduction', strategies['Long-term Risk Reduction Measures'] || strategies['longTermMeasures'])
        }
      }

      // ACTION PLAN
      addHeader('6. Implementation Action Plan')
      
      if (planData.ACTION_PLAN) {
        const action = planData.ACTION_PLAN
        
        if (action['Action Plan by Risk Level'] || action['actionPlanByRisk']) {
          const actionData = action['Action Plan by Risk Level'] || action['actionPlanByRisk']
          addTable(actionData, 'Action Plan by Risk Level')
        }
        
        addText('Implementation Timeline', action['Implementation Timeline'] || action['implementationTimeline'] || 'Not specified')
        addText('Resource Requirements', action['Resource Requirements'] || action['resourceRequirements'] || 'Not specified')
        addText('Responsible Parties', action['Responsible Parties and Roles'] || action['responsibleParties'] || 'Not specified')
        addText('Review Schedule', action['Review and Update Schedule'] || action['reviewSchedule'] || 'Not specified')
        
        if (action['Testing and Assessment Plan'] || action['testingPlan']) {
          const testing = action['Testing and Assessment Plan'] || action['testingPlan']
          addTable(testing, 'Testing and Assessment Plan')
        }
      }

      // CONTACTS
      if (planData.CONTACTS_AND_INFORMATION) {
        addHeader('7. Contacts and Critical Information')
        const contacts = planData.CONTACTS_AND_INFORMATION
        
        if (contacts['Staff Contact Information'] || contacts['staffContacts']) {
          addTable(contacts['Staff Contact Information'] || contacts['staffContacts'], 'Staff Contacts')
        }
        
        if (contacts['Key Customer Contacts'] || contacts['keyCustomers']) {
          addTable(contacts['Key Customer Contacts'] || contacts['keyCustomers'], 'Key Customers')
        }
        
        if (contacts['Supplier Information'] || contacts['supplierInfo']) {
          addTable(contacts['Supplier Information'] || contacts['supplierInfo'], 'Suppliers')
        }
        
        if (contacts['Emergency Services and Utilities'] || contacts['emergencyServices']) {
          addTable(contacts['Emergency Services and Utilities'] || contacts['emergencyServices'], 'Emergency Services')
        }
      }

      // TESTING AND MAINTENANCE
      if (planData.TESTING_AND_MAINTENANCE) {
        addHeader('8. Testing and Maintenance')
        const testing = planData.TESTING_AND_MAINTENANCE
        
        if (testing['Plan Testing Schedule'] || testing['testingSchedule']) {
          addTable(testing['Plan Testing Schedule'] || testing['testingSchedule'], 'Testing Schedule')
        }
        
        if (testing['Plan Revision History'] || testing['revisionHistory']) {
          addTable(testing['Plan Revision History'] || testing['revisionHistory'], 'Revision History')
        }
        
        addText('Annual Review Process', testing['Annual Review Process'] || testing['annualReview'] || 'To be established')
        addText('Update Triggers', testing['Trigger Events for Plan Updates'] || testing['triggerEvents'] || 'To be established')
      }

      // Add page numbers
      const totalPages = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        if (i > 1) { // Skip cover page
          doc.setFontSize(8)
          doc.setTextColor(108, 117, 125)
          doc.text(`${companyName} - Business Continuity Plan`, margin, pageHeight - 10)
          doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 25, pageHeight - 10)
        }
      }

      // Return PDF
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${companyName.replace(/[^a-zA-Z0-9]/g, '-')}-Business-Continuity-Plan.pdf"`,
        },
      })

    } catch (error) {
      console.error('PDF generation error:', error)
      throw error
    }
  } catch (error) {
    console.error('Route error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
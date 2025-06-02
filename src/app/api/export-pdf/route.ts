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

    // Log the incoming data for debugging
    console.log('Generating PDF for data:', JSON.stringify(planData, null, 2))

    // Create a new PDF document
    const doc = new jsPDF()
    
    // Set initial position
    let y = 20
    const margin = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const maxWidth = pageWidth - (margin * 2)

    // Helper function to add text with wrapping
    const addText = (text: string, x: number, y: number, size: number, isBold = false) => {
      doc.setFontSize(size)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      
      const lines = doc.splitTextToSize(text, maxWidth)
      doc.text(lines, x, y)
      
      return y + (lines.length * size * 0.35)
    }

    try {
      // Add title
      y = addText('Business Continuity Plan', margin, y, 24, true)

      // Business Overview
      y += 20
      y = addText('1. Business Overview', margin, y, 18, true)
      y += 10
      Object.entries(planData.BUSINESS_OVERVIEW || {}).forEach(([key, value]) => {
        if (value) {
          y = addText(`${key}: ${value}`, margin, y, 12)
          y += 5
        }
      })

      // Essential Functions
      y += 10
      y = addText('2. Essential Functions', margin, y, 18, true)
      y += 10
      Object.entries(planData.ESSENTIAL_FUNCTIONS || {}).forEach(([key, value]) => {
        if (value) {
          y = addText(`${key}:`, margin, y, 12, true)
          y += 5
          if (Array.isArray(value)) {
            value.forEach((item) => {
              y = addText(`• ${item}`, margin + 10, y, 10)
              y += 5
            })
          } else {
            y = addText(`• ${value}`, margin + 10, y, 10)
            y += 5
          }
        }
      })

      // Risk Assessment
      y += 10
      y = addText('3. Risk Assessment', margin, y, 18, true)
      y += 10
      Object.entries(planData.RISK_ASSESSMENT || {}).forEach(([key, value]) => {
        if (value) {
          y = addText(`${key}:`, margin, y, 12, true)
          y += 5
          if (Array.isArray(value)) {
            value.forEach((item) => {
              y = addText(`• ${item}`, margin + 10, y, 10)
              y += 5
            })
          } else {
            y = addText(`• ${value}`, margin + 10, y, 10)
            y += 5
          }
        }
      })

      // Strategies
      y += 10
      y = addText('4. Strategies', margin, y, 18, true)
      y += 10
      Object.entries(planData.STRATEGIES || {}).forEach(([key, value]) => {
        if (value) {
          y = addText(`${key}:`, margin, y, 12, true)
          y += 5
          if (Array.isArray(value)) {
            value.forEach((item) => {
              y = addText(`• ${item}`, margin + 10, y, 10)
              y += 5
            })
          } else {
            y = addText(`• ${value}`, margin + 10, y, 10)
            y += 5
          }
        }
      })

      // Action Plan
      y += 10
      y = addText('5. Action Plan', margin, y, 18, true)
      y += 10
      Object.entries(planData.ACTION_PLAN || {}).forEach(([key, value]) => {
        if (value) {
          y = addText(`${key}: ${value}`, margin, y, 12)
          y += 5
        }
      })

      // Get the PDF as a buffer
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

      // Return PDF as response
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="business-continuity-plan.pdf"',
        },
      })
    } catch (error) {
      console.error('Error during PDF generation:', error)
      throw error // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Error in PDF generation route:', error)
    // Log the full error details
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
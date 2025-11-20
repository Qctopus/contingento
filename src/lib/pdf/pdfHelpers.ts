/**
 * PDF Helper Utilities
 * Common functions used by both Bank-Ready and Action Workbook PDF generators
 */

import { jsPDF } from 'jspdf'
import { PAGE_LAYOUT } from './pdfStyles'

// ============================================================================
// PAGE MANAGEMENT
// ============================================================================

export interface PageState {
  currentY: number
  pageNumber: number
}

/**
 * Check if we need a page break and add new page if needed
 */
export function checkPageBreak(
  doc: jsPDF,
  state: PageState,
  requiredSpace: number = 20,
  addFooter?: (pageNum: number) => void
): boolean {
  if (state.currentY + requiredSpace > PAGE_LAYOUT.MAX_Y) {
    doc.addPage()
    state.currentY = PAGE_LAYOUT.MARGIN_TOP
    state.pageNumber++
    
    if (addFooter) {
      addFooter(state.pageNumber)
    }
    
    return true
  }
  return false
}

/**
 * Add a new page and reset position
 */
export function addNewPage(
  doc: jsPDF,
  state: PageState,
  addFooter?: (pageNum: number) => void
): void {
  doc.addPage()
  state.currentY = PAGE_LAYOUT.MARGIN_TOP
  state.pageNumber++
  
  if (addFooter) {
    addFooter(state.pageNumber)
  }
}

// ============================================================================
// TEXT RENDERING
// ============================================================================

/**
 * Add text with automatic wrapping
 */
export function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 1.4
): number {
  const fontSize = doc.getFontSize()
  const lines = doc.splitTextToSize(text, maxWidth)
  
  lines.forEach((line: string, index: number) => {
    doc.text(line, x, y + (index * fontSize * lineHeight / 2.83465)) // Convert to mm
  })
  
  return lines.length * fontSize * lineHeight / 2.83465
}

/**
 * Add multi-line text with word wrapping
 */
export function addMultiLineText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  options?: {
    align?: 'left' | 'center' | 'right' | 'justify'
    lineHeight?: number
  }
): number {
  const lineHeight = options?.lineHeight || 1.4
  const fontSize = doc.getFontSize()
  const lines = doc.splitTextToSize(text, maxWidth)
  
  doc.text(lines, x, y, {
    align: options?.align || 'left',
    maxWidth: maxWidth,
    lineHeightFactor: lineHeight
  })
  
  return lines.length * fontSize * lineHeight / 2.83465
}

// ============================================================================
// SECTION HEADERS
// ============================================================================

/**
 * Add a major section header (e.g., "SECTION 1: EXECUTIVE SUMMARY")
 */
export function addSectionHeader(
  doc: jsPDF,
  state: PageState,
  text: string,
  options?: {
    fontSize?: number
    color?: { r: number, g: number, b: number }
    underline?: boolean
    spaceAfter?: number
  }
): void {
  const fontSize = options?.fontSize || 16
  const spaceAfter = options?.spaceAfter || 8
  
  checkPageBreak(doc, state, 30)
  
  doc.setFontSize(fontSize)
  doc.setFont('helvetica', 'bold')
  
  if (options?.color) {
    doc.setTextColor(options.color.r, options.color.g, options.color.b)
  }
  
  doc.text(text, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  
  if (options?.underline) {
    const textWidth = doc.getTextWidth(text)
    state.currentY += 2
    doc.setDrawColor(options.color?.r || 0, options.color?.g || 0, options.color?.b || 0)
    doc.line(
      PAGE_LAYOUT.MARGIN_LEFT,
      state.currentY,
      PAGE_LAYOUT.MARGIN_LEFT + textWidth,
      state.currentY
    )
  }
  
  state.currentY += fontSize / 2.83465 + spaceAfter
  
  // Reset to default
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
}

/**
 * Add a sub-section header
 */
export function addSubSectionHeader(
  doc: jsPDF,
  state: PageState,
  text: string,
  options?: {
    fontSize?: number
    spaceAfter?: number
  }
): void {
  const fontSize = options?.fontSize || 12
  const spaceAfter = options?.spaceAfter || 5
  
  checkPageBreak(doc, state, 20)
  
  doc.setFontSize(fontSize)
  doc.setFont('helvetica', 'bold')
  doc.text(text, PAGE_LAYOUT.MARGIN_LEFT, state.currentY)
  
  state.currentY += fontSize / 2.83465 + spaceAfter
  
  doc.setFont('helvetica', 'normal')
}

// ============================================================================
// TABLES
// ============================================================================

/**
 * Add a simple table
 */
export function addTable(
  doc: jsPDF,
  state: PageState,
  headers: string[],
  rows: string[][],
  options?: {
    columnWidths?: number[]
    headerColor?: { r: number, g: number, b: number }
    borderColor?: { r: number, g: number, b: number }
    fontSize?: number
    rowHeight?: number
  }
): void {
  const fontSize = options?.fontSize || 10
  const rowHeight = options?.rowHeight || 8
  const cellPadding = 2
  
  // Calculate column widths if not provided
  const columnWidths = options?.columnWidths || 
    headers.map(() => PAGE_LAYOUT.CONTENT_WIDTH / headers.length)
  
  // Check if table fits on current page
  const tableHeight = (rows.length + 1) * rowHeight
  checkPageBreak(doc, state, tableHeight + 10)
  
  doc.setFontSize(fontSize)
  
  // Draw header
  doc.setFillColor(
    options?.headerColor?.r || 240,
    options?.headerColor?.g || 240,
    options?.headerColor?.b || 245
  )
  doc.setDrawColor(
    options?.borderColor?.r || 200,
    options?.borderColor?.g || 200,
    options?.borderColor?.b || 200
  )
  
  let currentX = PAGE_LAYOUT.MARGIN_LEFT
  
  // Header row
  doc.setFont('helvetica', 'bold')
  headers.forEach((header, i) => {
    doc.rect(currentX, state.currentY, columnWidths[i], rowHeight, 'FD')
    doc.text(
      header,
      currentX + cellPadding,
      state.currentY + rowHeight / 2 + 1,
      { baseline: 'middle' }
    )
    currentX += columnWidths[i]
  })
  
  state.currentY += rowHeight
  
  // Data rows
  doc.setFont('helvetica', 'normal')
  doc.setFillColor(255, 255, 255)
  
  rows.forEach((row, rowIndex) => {
    // Check page break for each row
    if (checkPageBreak(doc, state, rowHeight + 5)) {
      // Redraw header on new page
      currentX = PAGE_LAYOUT.MARGIN_LEFT
      doc.setFont('helvetica', 'bold')
      doc.setFillColor(
        options?.headerColor?.r || 240,
        options?.headerColor?.g || 240,
        options?.headerColor?.b || 245
      )
      headers.forEach((header, i) => {
        doc.rect(currentX, state.currentY, columnWidths[i], rowHeight, 'FD')
        doc.text(
          header,
          currentX + cellPadding,
          state.currentY + rowHeight / 2 + 1,
          { baseline: 'middle' }
        )
        currentX += columnWidths[i]
      })
      state.currentY += rowHeight
      doc.setFont('helvetica', 'normal')
      doc.setFillColor(255, 255, 255)
    }
    
    currentX = PAGE_LAYOUT.MARGIN_LEFT
    
    row.forEach((cell, i) => {
      doc.rect(currentX, state.currentY, columnWidths[i], rowHeight, 'S')
      
      // Truncate text if too long
      const maxCellWidth = columnWidths[i] - cellPadding * 2
      const cellText = doc.getTextWidth(cell) > maxCellWidth
        ? cell.substring(0, Math.floor(cell.length * maxCellWidth / doc.getTextWidth(cell))) + '...'
        : cell
      
      doc.text(
        cellText,
        currentX + cellPadding,
        state.currentY + rowHeight / 2 + 1,
        { baseline: 'middle' }
      )
      currentX += columnWidths[i]
    })
    
    state.currentY += rowHeight
  })
  
  state.currentY += 5 // Space after table
}

// ============================================================================
// LISTS
// ============================================================================

/**
 * Add a bulleted list
 */
export function addBulletList(
  doc: jsPDF,
  state: PageState,
  items: string[],
  options?: {
    bullet?: string
    indent?: number
    fontSize?: number
    lineSpacing?: number
  }
): void {
  const bullet = options?.bullet || '•'
  const indent = options?.indent || 10
  const fontSize = options?.fontSize || 10
  const lineSpacing = options?.lineSpacing || 5
  
  doc.setFontSize(fontSize)
  
  items.forEach(item => {
    checkPageBreak(doc, state, 15)
    
    // Add bullet
    doc.text(bullet, PAGE_LAYOUT.MARGIN_LEFT + indent - 5, state.currentY)
    
    // Add text with wrapping
    const maxWidth = PAGE_LAYOUT.CONTENT_WIDTH - indent
    const lines = doc.splitTextToSize(item, maxWidth)
    
    lines.forEach((line: string, index: number) => {
      if (index > 0) checkPageBreak(doc, state, 10)
      doc.text(
        line,
        PAGE_LAYOUT.MARGIN_LEFT + indent,
        state.currentY
      )
      state.currentY += fontSize / 2.83465 * 1.2
    })
    
    state.currentY += lineSpacing
  })
}

/**
 * Add a numbered list
 */
export function addNumberedList(
  doc: jsPDF,
  state: PageState,
  items: string[],
  options?: {
    startNumber?: number
    indent?: number
    fontSize?: number
    lineSpacing?: number
  }
): void {
  const startNumber = options?.startNumber || 1
  const indent = options?.indent || 10
  const fontSize = options?.fontSize || 10
  const lineSpacing = options?.lineSpacing || 5
  
  doc.setFontSize(fontSize)
  
  items.forEach((item, index) => {
    checkPageBreak(doc, state, 15)
    
    const number = `${startNumber + index}.`
    doc.text(number, PAGE_LAYOUT.MARGIN_LEFT + indent - 5, state.currentY)
    
    const maxWidth = PAGE_LAYOUT.CONTENT_WIDTH - indent
    const lines = doc.splitTextToSize(item, maxWidth)
    
    lines.forEach((line: string, lineIndex: number) => {
      if (lineIndex > 0) checkPageBreak(doc, state, 10)
      doc.text(
        line,
        PAGE_LAYOUT.MARGIN_LEFT + indent,
        state.currentY
      )
      state.currentY += fontSize / 2.83465 * 1.2
    })
    
    state.currentY += lineSpacing
  })
}

// ============================================================================
// CHECKBOXES (for Workbook)
// ============================================================================

/**
 * Add a checkbox
 */
export function addCheckbox(
  doc: jsPDF,
  x: number,
  y: number,
  size: number = 4,
  checked: boolean = false
): void {
  // Draw box
  doc.setDrawColor(100, 100, 100)
  doc.setLineWidth(0.5)
  doc.rect(x, y, size, size, 'S')
  
  // Draw check if checked
  if (checked) {
    doc.setFontSize(10)
    doc.text('✓', x + 0.5, y + size - 0.5)
  }
}

/**
 * Add a checklist item
 */
export function addChecklistItem(
  doc: jsPDF,
  state: PageState,
  text: string,
  options?: {
    checked?: boolean
    indent?: number
    fontSize?: number
  }
): void {
  const checked = options?.checked || false
  const indent = options?.indent || 10
  const fontSize = options?.fontSize || 10
  
  checkPageBreak(doc, state, 10)
  
  doc.setFontSize(fontSize)
  
  // Add checkbox
  addCheckbox(
    PAGE_LAYOUT.MARGIN_LEFT + indent - 7,
    state.currentY - 3,
    4,
    checked
  )
  
  // Add text
  const maxWidth = PAGE_LAYOUT.CONTENT_WIDTH - indent
  const lines = doc.splitTextToSize(text, maxWidth)
  
  lines.forEach((line: string, index: number) => {
    if (index > 0) checkPageBreak(doc, state, 10)
    doc.text(
      line,
      PAGE_LAYOUT.MARGIN_LEFT + indent,
      state.currentY
    )
    state.currentY += fontSize / 2.83465 * 1.2
  })
  
  state.currentY += 2
}

// ============================================================================
// BOXES & CALLOUTS
// ============================================================================

/**
 * Add a callout box
 */
export function addCalloutBox(
  doc: jsPDF,
  state: PageState,
  title: string,
  content: string,
  options?: {
    type?: 'info' | 'tip' | 'warning' | 'important'
    icon?: string
  }
): void {
  const type = options?.type || 'info'
  const boxPadding = 5
  const boxWidth = PAGE_LAYOUT.CONTENT_WIDTH
  
  // Calculate box height
  doc.setFontSize(10)
  const contentLines = doc.splitTextToSize(content, boxWidth - boxPadding * 2)
  const boxHeight = (contentLines.length + 2) * 5 + boxPadding * 2
  
  checkPageBreak(doc, state, boxHeight + 5)
  
  // Set colors based on type
  const colors = {
    info: { bg: { r: 239, g: 246, b: 255 }, border: { r: 59, g: 130, b: 246 } },
    tip: { bg: { r: 236, g: 253, b: 245 }, border: { r: 16, g: 185, b: 129 } },
    warning: { bg: { r: 255, g: 251, b: 235 }, border: { r: 245, g: 158, b: 11 } },
    important: { bg: { r: 254, g: 242, b: 242 }, border: { r: 220, g: 38, b: 38 } }
  }
  
  const color = colors[type]
  
  // Draw box
  doc.setFillColor(color.bg.r, color.bg.g, color.bg.b)
  doc.setDrawColor(color.border.r, color.border.g, color.border.b)
  doc.setLineWidth(1)
  doc.roundedRect(
    PAGE_LAYOUT.MARGIN_LEFT,
    state.currentY,
    boxWidth,
    boxHeight,
    2,
    2,
    'FD'
  )
  
  // Add icon and title
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(color.border.r, color.border.g, color.border.b)
  doc.text(
    title,
    PAGE_LAYOUT.MARGIN_LEFT + boxPadding,
    state.currentY + boxPadding + 4
  )
  
  // Add content
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(31, 41, 55)
  
  let contentY = state.currentY + boxPadding + 10
  contentLines.forEach((line: string) => {
    doc.text(line, PAGE_LAYOUT.MARGIN_LEFT + boxPadding, contentY)
    contentY += 5
  })
  
  state.currentY += boxHeight + 8
  
  // Reset colors
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
}

// ============================================================================
// FOOTERS
// ============================================================================

/**
 * Add UNDP/CARICHAM footer
 */
export function addUNDPFooter(
  doc: jsPDF,
  pageNumber: number,
  skipFirstPage: boolean = true
): void {
  if (skipFirstPage && pageNumber === 1) return
  
  const footerY = PAGE_LAYOUT.HEIGHT - 15
  
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'italic')
  
  // Center text
  const text = 'UNDP in cooperation with CARICHAM'
  doc.text(text, PAGE_LAYOUT.WIDTH / 2, footerY, { align: 'center' })
  
  // Add line above footer
  doc.setDrawColor(200, 200, 200)
  doc.line(
    PAGE_LAYOUT.MARGIN_LEFT,
    footerY - 5,
    PAGE_LAYOUT.WIDTH - PAGE_LAYOUT.MARGIN_RIGHT,
    footerY - 5
  )
}

/**
 * Add page number
 */
export function addPageNumber(
  doc: jsPDF,
  pageNumber: number,
  totalPages?: number
): void {
  const footerY = PAGE_LAYOUT.HEIGHT - 10
  
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  
  const pageText = totalPages
    ? `Page ${pageNumber} of ${totalPages}`
    : `Page ${pageNumber}`
  
  doc.text(
    pageText,
    PAGE_LAYOUT.WIDTH - PAGE_LAYOUT.MARGIN_RIGHT,
    footerY,
    { align: 'right' }
  )
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

/**
 * Truncate text to fit width
 */
export function truncateText(
  doc: jsPDF,
  text: string,
  maxWidth: number
): string {
  const textWidth = doc.getTextWidth(text)
  if (textWidth <= maxWidth) return text
  
  const ratio = maxWidth / textWidth
  const truncatedLength = Math.floor(text.length * ratio) - 3
  return text.substring(0, truncatedLength) + '...'
}

/**
 * Add horizontal line separator
 */
export function addHorizontalLine(
  doc: jsPDF,
  state: PageState,
  options?: {
    color?: { r: number, g: number, b: number }
    width?: number
    spaceAfter?: number
  }
): void {
  const color = options?.color || { r: 200, g: 200, b: 200 }
  const width = options?.width || PAGE_LAYOUT.CONTENT_WIDTH
  const spaceAfter = options?.spaceAfter || 5
  
  checkPageBreak(doc, state, 10)
  
  doc.setDrawColor(color.r, color.g, color.b)
  doc.line(
    PAGE_LAYOUT.MARGIN_LEFT,
    state.currentY,
    PAGE_LAYOUT.MARGIN_LEFT + width,
    state.currentY
  )
  
  state.currentY += spaceAfter
}















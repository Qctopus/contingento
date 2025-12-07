/**
 * PDF Style Constants
 * Shared styling definitions for both Bank-Ready and Action Workbook PDFs
 */

// ============================================================================
// PAGE LAYOUT
// ============================================================================

export const PAGE_LAYOUT = {
  WIDTH: 210, // A4 width in mm
  HEIGHT: 297, // A4 height in mm
  MARGIN_LEFT: 20,
  MARGIN_RIGHT: 20,
  MARGIN_TOP: 20,
  MARGIN_BOTTOM: 25,
  get CONTENT_WIDTH() {
    return this.WIDTH - this.MARGIN_LEFT - this.MARGIN_RIGHT
  },
  get MAX_Y() {
    return this.HEIGHT - this.MARGIN_BOTTOM
  }
}

// ============================================================================
// BANK-READY DOCUMENT STYLES
// ============================================================================

export const BANK_STYLES = {
  // Typography
  fonts: {
    heading: 'times',
    body: 'times',
    table: 'helvetica'
  },
  
  // Font sizes
  fontSize: {
    title: 20,
    sectionHeader: 16,
    subheader: 14,
    body: 11,
    small: 9,
    footnote: 8
  },
  
  // Colors (formal, conservative)
  colors: {
    primary: {
      r: 25,
      g: 50,
      b: 100 // Dark blue
    },
    secondary: {
      r: 60,
      g: 60,
      b: 60 // Dark gray
    },
    text: {
      r: 0,
      g: 0,
      b: 0 // Black
    },
    textLight: {
      r: 100,
      g: 100,
      b: 100 // Gray
    },
    tableHeader: {
      r: 240,
      g: 240,
      b: 245 // Light blue-gray
    },
    tableBorder: {
      r: 200,
      g: 200,
      b: 200 // Light gray
    },
    success: {
      r: 34,
      g: 139,
      b: 34 // Forest green
    },
    warning: {
      r: 255,
      g: 140,
      b: 0 // Dark orange
    },
    danger: {
      r: 178,
      g: 34,
      b: 34 // Fire brick red
    }
  },
  
  // Spacing
  spacing: {
    sectionGap: 12,
    paragraphGap: 6,
    lineHeight: 1.4,
    tableRowHeight: 8,
    tableHeaderHeight: 10
  },
  
  // Table styles
  table: {
    borderWidth: 0.5,
    cellPadding: 2,
    headerFontStyle: 'bold',
    bodyFontStyle: 'normal'
  }
}

// ============================================================================
// ACTION WORKBOOK STYLES
// ============================================================================

export const WORKBOOK_STYLES = {
  // Typography
  fonts: {
    heading: 'helvetica',
    body: 'helvetica',
    checkbox: 'zapfdingbats' // For checkbox symbols
  },
  
  // Font sizes
  fontSize: {
    title: 18,
    sectionHeader: 14,
    subheader: 12,
    body: 10,
    small: 8,
    checkbox: 12
  },
  
  // Colors (friendly, encouraging)
  colors: {
    primary: {
      r: 59,
      g: 130,
      b: 246 // Bright blue
    },
    secondary: {
      r: 16,
      g: 185,
      b: 129 // Green
    },
    accent: {
      r: 245,
      g: 158,
      b: 11 // Orange
    },
    text: {
      r: 31,
      g: 41,
      b: 55 // Dark blue-gray
    },
    textLight: {
      r: 107,
      g: 114,
      b: 128 // Gray
    },
    background: {
      r: 249,
      g: 250,
      b: 251 // Very light gray
    },
    checkboxBorder: {
      r: 156,
      g: 163,
      b: 175 // Medium gray
    },
    success: {
      r: 16,
      g: 185,
      b: 129 // Green
    },
    warning: {
      r: 245,
      g: 158,
      b: 11 // Orange
    },
    danger: {
      r: 220,
      g: 38,
      b: 38 // Red
    },
    info: {
      r: 59,
      g: 130,
      b: 246 // Blue
    }
  },
  
  // Spacing
  spacing: {
    sectionGap: 10,
    paragraphGap: 5,
    lineHeight: 1.5,
    checkboxGap: 4,
    bulletIndent: 5
  },
  
  // Checkbox styles
  checkbox: {
    size: 4,
    borderWidth: 0.5,
    checkedSymbol: '✓',
    uncheckedSymbol: ''
  },
  
  // Box styles (for callouts, tips, etc.)
  box: {
    borderWidth: 1,
    borderRadius: 2,
    padding: 4,
    backgroundColor: {
      tip: { r: 236, g: 253, b: 245 }, // Light green
      warning: { r: 255, g: 251, b: 235 }, // Light yellow
      important: { r: 254, g: 242, b: 242 } // Light red
    }
  }
}

// ============================================================================
// SHARED UTILITIES
// ============================================================================

/**
 * Risk level color mapping
 */
export function getRiskLevelColor(level: string): { r: number, g: number, b: number } {
  const levelLower = level.toLowerCase()
  
  if (levelLower.includes('extreme') || levelLower.includes('critical')) {
    return { r: 220, g: 38, b: 38 } // Red
  }
  if (levelLower.includes('high')) {
    return { r: 245, g: 158, b: 11 } // Orange
  }
  if (levelLower.includes('medium') || levelLower.includes('moderate')) {
    return { r: 234, g: 179, b: 8 } // Yellow
  }
  return { r: 16, g: 185, b: 129 } // Green (low)
}

/**
 * Priority level color mapping
 */
export function getPriorityColor(priority: string): { r: number, g: number, b: number } {
  const priorityLower = priority.toLowerCase()
  
  if (priorityLower.includes('critical')) {
    return { r: 220, g: 38, b: 38 } // Red
  }
  if (priorityLower.includes('high')) {
    return { r: 245, g: 158, b: 11 } // Orange
  }
  if (priorityLower.includes('medium')) {
    return { r: 234, g: 179, b: 8 } // Yellow
  }
  return { r: 156, g: 163, b: 175 } // Gray (low)
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/**
 * Wrap text to fit within width
 */
export function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  // Approximate character width (rough estimate)
  const charWidth = fontSize * 0.5
  const maxChars = Math.floor(maxWidth / charWidth)
  
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (testLine.length <= maxChars) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  })
  
  if (currentLine) lines.push(currentLine)
  
  return lines
}

/**
 * Calculate text height
 */
export function calculateTextHeight(
  text: string,
  maxWidth: number,
  fontSize: number,
  lineHeight: number = 1.4
): number {
  const lines = wrapText(text, maxWidth, fontSize)
  return lines.length * fontSize * lineHeight
}

/**
 * UNDP Blue (official brand color)
 */
export const UNDP_BLUE = {
  r: 0,
  g: 153,
  b: 217
}

/**
 * CARICHAM colors
 */
export const CARICHAM_COLORS = {
  primary: {
    r: 0,
    g: 82,
    b: 155
  },
  secondary: {
    r: 0,
    g: 166,
    b: 81
  }
}


















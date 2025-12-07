/**
 * HTML-to-PDF Export Utility
 * 
 * Uses html2pdf.js to convert the preview HTML content to a PDF
 * while preserving the exact styling shown in the browser.
 */

import type { Locale } from '@/i18n/config'

// Import translations for front page
import enMessages from '@/messages/en.json'
import esMessages from '@/messages/es.json'
import frMessages from '@/messages/fr.json'

interface ExportOptions {
  mode: 'formal' | 'workbook'
  businessName: string
  businessAddress?: string
  planManager?: string
  locale?: Locale
}

// Translation helper
const getUIText = (key: string, locale: Locale): string => {
  const messages = locale === 'es' ? esMessages : locale === 'fr' ? frMessages : enMessages
  const keys = key.split('.')
  let value: any = messages
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k]
    } else {
      return key
    }
  }
  return typeof value === 'string' ? value : key
}

/**
 * Export HTML preview to PDF
 * @param elementId - The ID of the HTML element to export
 * @param options - Export options including mode, business name, etc.
 */
export async function exportHtmlToPdf(
  elementId: string,
  options: ExportOptions
): Promise<void> {
  // Dynamically import html2pdf.js (client-side only)
  const html2pdf = (await import('html2pdf.js')).default

  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`)
  }

  const { mode, businessName, businessAddress, planManager, locale = 'en' } = options

  // Create a wrapper with front page
  const wrapper = document.createElement('div')
  wrapper.style.backgroundColor = 'white'

  // Generate front page HTML
  const frontPage = createFrontPage(options)
  wrapper.innerHTML = frontPage

  // Clone the preview content
  const contentClone = element.cloneNode(true) as HTMLElement
  
  // Remove any no-print elements
  contentClone.querySelectorAll('.no-print, .print\\:hidden').forEach(el => el.remove())
  
  // Add page break after front page
  const pageBreak = document.createElement('div')
  pageBreak.style.pageBreakAfter = 'always'
  pageBreak.style.breakAfter = 'page'
  wrapper.appendChild(pageBreak)
  
  // Add the content
  wrapper.appendChild(contentClone)

  // Configure html2pdf options
  const filename = `${businessName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${mode === 'formal' ? 'formal-bcp' : 'action-workbook'}.pdf`

  const pdfOptions = {
    margin: [10, 10, 10, 10], // top, left, bottom, right in mm
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: '.avoid-break'
    }
  }

  try {
    await html2pdf().set(pdfOptions).from(wrapper).save()
  } finally {
    // Cleanup
    wrapper.remove()
  }
}

/**
 * Create the front page HTML for the PDF
 */
function createFrontPage(options: ExportOptions): string {
  const { mode, businessName, businessAddress, planManager, locale = 'en' } = options
  const currentDate = new Date().toLocaleDateString(
    locale === 'es' ? 'es-ES' : locale === 'fr' ? 'fr-FR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  const title = mode === 'formal'
    ? getUIText('bcpPreview.formalBcp.title', locale)
    : getUIText('bcpPreview.workbook.title', locale)

  const bcpTitle = getUIText('wizard.businessContinuityPlan', locale) || 'Business Continuity Plan'

  return `
    <div style="
      width: 210mm;
      min-height: 297mm;
      padding: 40mm 20mm;
      box-sizing: border-box;
      background: linear-gradient(135deg, #1e3a5f 0%, #2a4a7f 100%);
      color: white;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    ">
      <!-- Top decorative line -->
      <div style="
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, transparent, #ffffff, transparent);
        margin-bottom: 60px;
      "></div>

      <!-- Document type label -->
      <div style="
        font-size: 14px;
        letter-spacing: 4px;
        text-transform: uppercase;
        opacity: 0.8;
        margin-bottom: 20px;
      ">${bcpTitle}</div>

      <!-- Main title -->
      <h1 style="
        font-size: 48px;
        font-weight: 700;
        margin: 0 0 40px 0;
        line-height: 1.2;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      ">${title.toUpperCase()}</h1>

      <!-- Business name -->
      <div style="
        font-size: 32px;
        font-weight: 600;
        margin-bottom: 20px;
        padding: 20px 40px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 8px;
        background: rgba(255,255,255,0.1);
      ">${businessName}</div>

      ${businessAddress ? `
        <div style="
          font-size: 18px;
          opacity: 0.9;
          margin-bottom: 40px;
        ">${businessAddress}</div>
      ` : ''}

      <!-- Decorative divider -->
      <div style="
        width: 100px;
        height: 3px;
        background: #ffffff;
        margin: 40px 0;
      "></div>

      <!-- Date and plan manager -->
      <div style="
        font-size: 16px;
        opacity: 0.9;
        margin-top: auto;
      ">
        <div style="margin-bottom: 10px;">
          <strong>${locale === 'es' ? 'Fecha de Preparación' : locale === 'fr' ? 'Date de Préparation' : 'Prepared'}:</strong> ${currentDate}
        </div>
        ${planManager ? `
          <div>
            <strong>${locale === 'es' ? 'Gerente del Plan' : locale === 'fr' ? 'Gestionnaire du Plan' : 'Plan Manager'}:</strong> ${planManager}
          </div>
        ` : ''}
      </div>

      <!-- Version info -->
      <div style="
        margin-top: 40px;
        font-size: 12px;
        opacity: 0.7;
      ">
        Version 1.0 | ${locale === 'es' ? 'Confidencial' : locale === 'fr' ? 'Confidentiel' : 'Confidential'}
      </div>

      <!-- Bottom decorative line -->
      <div style="
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, transparent, #ffffff, transparent);
        margin-top: 60px;
      "></div>
    </div>
  `
}

/**
 * Alternative: Export using browser print dialog (gives user more control)
 * This method opens the print dialog where user can save as PDF
 */
export function exportViaPrint(): void {
  window.print()
}



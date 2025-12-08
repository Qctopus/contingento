/**
 * Word Document Export Utility (client-side)
 * Uses the shared builder to generate the docx and triggers download in browser.
 */

import { Packer } from 'docx'
import { saveAs } from 'file-saver'
import type { Locale } from '@/i18n/config'
import { buildWordDocument, WordExportOptions } from './wordDocBuilder'

/**
 * Main export function - generates and downloads Word document
 */
export async function exportToWord(options: WordExportOptions): Promise<void> {
  const doc = buildWordDocument(options)
  const blob = await Packer.toBlob(doc)

  const businessName = options.formData.PLAN_INFORMATION?.['Company Name'] ||
    options.formData.BUSINESS_PROFILE?.['Business Name'] ||
    'Business'
  const sanitizedName = businessName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  const filename = `${sanitizedName}-${options.mode === 'formal' ? 'formal-bcp' : 'action-workbook'}.docx`

  saveAs(blob, filename)
}

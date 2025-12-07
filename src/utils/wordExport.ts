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

// ============================================================================
// FORMAL BCP DOCUMENT
// ============================================================================

function generateFormalBCPDocument(options: ExportOptions): Document {
  const { formData, strategies, risks = [], locale } = options
  
  const businessName = formData.PLAN_INFORMATION?.['Company Name'] || 
                       formData.BUSINESS_PROFILE?.['Business Name'] || 
                       'Business Name'
  const businessAddress = formData.PLAN_INFORMATION?.['Business Address'] || 
                         formData.BUSINESS_OVERVIEW?.['Business Address'] || ''
  const planManager = formData.PLAN_INFORMATION?.['Plan Manager'] || ''
  const businessType = formData.BUSINESS_PROFILE?.['Business Type'] || 
                       formData.BUSINESS_OVERVIEW?.['Business Type'] || ''
  const businessPurpose = formData.BUSINESS_OVERVIEW?.['Business Purpose'] || ''
  const totalPeople = formData.BUSINESS_OVERVIEW?.['Total People in Business'] || ''
  
  const currentDate = new Date().toLocaleDateString(
    locale === 'es' ? 'es-ES' : locale === 'fr' ? 'fr-FR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  // Get risk matrix
  const riskMatrix = formData.RISK_ASSESSMENT?.['Risk Assessment Matrix'] || []
  
  // Get emergency contacts
  const emergencyContacts = formData.EMERGENCY_CONTACTS?.['Emergency Services'] || []
  const staffContacts = formData.EMERGENCY_CONTACTS?.['Staff Contact List'] || []

  return new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            font: 'Calibri',
            size: 22 // 11pt
          },
          paragraph: {
            spacing: { after: 120 }
          }
        }
      ]
    },
    sections: [
      // Cover Page
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1)
            }
          }
        },
        children: [
          // Cover page content
          new Paragraph({ spacing: { after: 2000 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: getUIText('wizard.businessContinuityPlan', locale) || 'Business Continuity Plan',
                size: 28,
                color: COLORS.gray[500],
                font: 'Calibri'
              })
            ]
          }),
          new Paragraph({ spacing: { after: 400 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: getUIText('bcpPreview.formalBcp.title', locale).toUpperCase(),
                bold: true,
                size: 56,
                color: COLORS.primary,
                font: 'Calibri'
              })
            ]
          }),
          new Paragraph({ spacing: { after: 800 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: businessName,
                bold: true,
                size: 44,
                color: COLORS.gray[900],
                font: 'Calibri'
              })
            ]
          }),
          businessAddress ? new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
            children: [
              new TextRun({
                text: businessAddress,
                size: 24,
                color: COLORS.gray[500],
                font: 'Calibri'
              })
            ]
          }) : new Paragraph({}),
          new Paragraph({ spacing: { after: 2000 } }),
          // Horizontal line
          new Paragraph({
            alignment: AlignmentType.CENTER,
            border: {
              bottom: { color: COLORS.gray[300], space: 1, style: BorderStyle.SINGLE, size: 6 }
            },
            spacing: { after: 400 }
          }),
          new Paragraph({ spacing: { after: 400 } }),
          // Date and plan manager info
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${locale === 'es' ? 'Fecha de Preparación' : locale === 'fr' ? 'Date de Préparation' : 'Prepared'}: ${currentDate}`,
                size: 22,
                color: COLORS.gray[700],
                font: 'Calibri'
              })
            ]
          }),
          planManager ? new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100 },
            children: [
              new TextRun({
                text: `${locale === 'es' ? 'Gerente del Plan' : locale === 'fr' ? 'Gestionnaire du Plan' : 'Plan Manager'}: ${planManager}`,
                size: 22,
                color: COLORS.gray[700],
                font: 'Calibri'
              })
            ]
          }) : new Paragraph({}),
          new Paragraph({ spacing: { after: 1000 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Version 1.0 | ' + (locale === 'es' ? 'Confidencial' : locale === 'fr' ? 'Confidentiel' : 'Confidential'),
                size: 20,
                color: COLORS.gray[500],
                font: 'Calibri'
              })
            ]
          }),
          new Paragraph({ children: [new PageBreak()] })
        ]
      },
      // Main Content
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1)
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${businessName} - Business Continuity Plan`,
                    size: 18,
                    color: COLORS.gray[500],
                    font: 'Calibri'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Page ',
                    size: 18,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    font: 'Calibri'
                  })
                ]
              })
            ]
          })
        },
        children: [
          // Section 1: Business Overview
          createSectionHeader(`1. ${getUIText('bcpPreview.formalBcp.businessOverview', locale)}`),
          
          createSubsectionHeader(`1.1 ${getUIText('bcpPreview.formalBcp.businessInformation', locale)}`),
          createInfoTable([
            [getUIText('bcpPreview.formalBcp.businessName', locale), businessName],
            [getUIText('bcpPreview.formalBcp.physicalAddress', locale), businessAddress],
            [getUIText('bcpPreview.formalBcp.businessType', locale), getString(businessType)],
            [getUIText('bcpPreview.formalBcp.totalPeople', locale), String(totalPeople)]
          ]),
          
          businessPurpose ? new Paragraph({
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({ text: `${getUIText('bcpPreview.formalBcp.businessPurpose', locale)}: `, bold: true, size: 22 }),
              new TextRun({ text: getString(businessPurpose), size: 22 })
            ]
          }) : new Paragraph({}),

          new Paragraph({ children: [new PageBreak()] }),

          // Section 2: Risk Assessment
          createSectionHeader(`2. ${getUIText('bcpPreview.formalBcp.riskAssessment', locale)}`),
          
          createSubsectionHeader(`2.1 ${getUIText('bcpPreview.formalBcp.identifiedRisks', locale)}`),
          
          // Risk table
          ...createRiskTable(riskMatrix, locale),

          new Paragraph({ children: [new PageBreak()] }),

          // Section 3: Continuity Strategies
          createSectionHeader(`3. ${getUIText('bcpPreview.formalBcp.continuityStrategies', locale)}`),
          
          ...strategies.flatMap((strategy, index) => createStrategySection(strategy, index + 1, locale)),

          new Paragraph({ children: [new PageBreak()] }),

          // Section 4: Emergency Response
          createSectionHeader(`4. ${getUIText('bcpPreview.formalBcp.emergencyResponse', locale)}`),
          
          createSubsectionHeader(`4.1 ${getUIText('bcpPreview.formalBcp.emergencyServices', locale)}`),
          ...createContactsTable(emergencyContacts, locale),
          
          staffContacts.length > 0 ? createSubsectionHeader(`4.2 ${getUIText('bcpPreview.formalBcp.staffContactRoster', locale)}`) : new Paragraph({}),
          ...createContactsTable(staffContacts, locale),

          new Paragraph({ children: [new PageBreak()] }),

          // Section 5: Plan Maintenance
          createSectionHeader(`5. ${getUIText('bcpPreview.formalBcp.planMaintenance', locale)}`),
          
          new Paragraph({
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({
                text: locale === 'es' 
                  ? 'Este plan debe ser revisado y actualizado al menos una vez al año, o después de cualquier cambio significativo en el negocio o incidente.'
                  : locale === 'fr'
                  ? 'Ce plan doit être révisé et mis à jour au moins une fois par an, ou après tout changement significatif de l\'entreprise ou incident.'
                  : 'This plan should be reviewed and updated at least annually, or after any significant business change or incident.',
                size: 22
              })
            ]
          }),
          
          createSubsectionHeader(`5.1 ${getUIText('bcpPreview.formalBcp.testingSchedule', locale)}`),
          new Paragraph({
            children: [
              new TextRun({
                text: locale === 'es'
                  ? '• Ejercicio de mesa trimestral\n• Simulacro completo anual\n• Revisión de contactos mensual'
                  : locale === 'fr'
                  ? '• Exercice sur table trimestriel\n• Simulation complète annuelle\n• Révision des contacts mensuelle'
                  : '• Quarterly tabletop exercise\n• Annual full drill\n• Monthly contact verification',
                size: 22
              })
            ]
          }),

          new Paragraph({ spacing: { after: 400 } }),

          // Approval Section
          createSectionHeader(`6. ${getUIText('bcpPreview.formalBcp.planApproval', locale)}`),
          
          createSignatureBlock(planManager || 'Plan Manager', currentDate, locale)
        ]
      }
    ]
  })
}

// ============================================================================
// ACTION WORKBOOK DOCUMENT
// ============================================================================

function generateWorkbookDocument(options: ExportOptions): Document {
  const { formData, strategies, locale } = options
  
  const businessName = formData.PLAN_INFORMATION?.['Company Name'] || 
                       formData.BUSINESS_PROFILE?.['Business Name'] || 
                       'Business Name'
  const businessAddress = formData.PLAN_INFORMATION?.['Business Address'] || ''
  const planManager = formData.PLAN_INFORMATION?.['Plan Manager'] || ''
  
  const currentDate = new Date().toLocaleDateString(
    locale === 'es' ? 'es-ES' : locale === 'fr' ? 'fr-FR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  // Get emergency contacts
  const emergencyContacts = formData.EMERGENCY_CONTACTS?.['Emergency Services'] || []

  // Group strategies by phase
  const beforeStrategies = strategies.filter(s => 
    s.actionSteps?.some((step: any) => step.phase === 'before' || step.phase === 'preparation')
  )
  const duringStrategies = strategies.filter(s => 
    s.actionSteps?.some((step: any) => step.phase === 'during' || step.phase === 'response')
  )
  const afterStrategies = strategies.filter(s => 
    s.actionSteps?.some((step: any) => step.phase === 'after' || step.phase === 'recovery')
  )

  return new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: { font: 'Calibri', size: 22 },
          paragraph: { spacing: { after: 120 } }
        }
      ]
    },
    sections: [
      // Cover Page
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1)
            }
          }
        },
        children: [
          new Paragraph({ spacing: { after: 1500 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: getUIText('bcpPreview.workbook.title', locale).toUpperCase(),
                bold: true,
                size: 60,
                color: COLORS.secondary,
                font: 'Calibri'
              })
            ]
          }),
          new Paragraph({ spacing: { after: 600 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: businessName,
                bold: true,
                size: 40,
                color: COLORS.gray[900],
                font: 'Calibri'
              })
            ]
          }),
          businessAddress ? new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
            children: [
              new TextRun({ text: businessAddress, size: 24, color: COLORS.gray[500] })
            ]
          }) : new Paragraph({}),
          new Paragraph({ spacing: { after: 1000 } }),
          // What's inside box
          new Paragraph({
            alignment: AlignmentType.CENTER,
            shading: { fill: COLORS.gray[100], type: ShadingType.SOLID },
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({
                text: `📋 ${getUIText('bcpPreview.workbook.quickReferenceGuide', locale)}`,
                size: 24
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            shading: { fill: COLORS.gray[100], type: ShadingType.SOLID },
            children: [
              new TextRun({
                text: `✅ ${getUIText('bcpPreview.workbook.implementationChecklists', locale)}`,
                size: 24
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            shading: { fill: COLORS.gray[100], type: ShadingType.SOLID },
            children: [
              new TextRun({
                text: `📞 ${getUIText('bcpPreview.workbook.contactDirectory', locale)}`,
                size: 24
              })
            ]
          }),
          new Paragraph({ spacing: { after: 1000 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${getUIText('bcpPreview.workbook.dateCreated', locale)}: ${currentDate}`,
                size: 22,
                color: COLORS.gray[700]
              })
            ]
          }),
          planManager ? new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${getUIText('bcpPreview.workbook.planManager', locale)}: ${planManager}`,
                size: 22,
                color: COLORS.gray[700]
              })
            ]
          }) : new Paragraph({}),
          new Paragraph({ children: [new PageBreak()] })
        ]
      },
      // Emergency Contacts Page
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            shading: { fill: 'dc2626', type: ShadingType.SOLID },
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: `🚨 ${getUIText('bcpPreview.workbook.emergencyContacts', locale)}`,
                bold: true,
                size: 36,
                color: 'ffffff'
              })
            ]
          }),
          ...createEmergencyContactsSection(emergencyContacts, locale),
          new Paragraph({ children: [new PageBreak()] })
        ]
      },
      // Action Steps by Phase
      {
        children: [
          // BEFORE Section
          new Paragraph({
            shading: { fill: 'fef3c7', type: ShadingType.SOLID },
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `🛡️ ${getUIText('bcpPreview.workbook.beforePreparation', locale)}`,
                bold: true,
                size: 32,
                color: '92400e'
              })
            ]
          }),
          ...strategies.flatMap(strategy => createWorkbookStrategySection(strategy, 'before', locale)),
          
          new Paragraph({ children: [new PageBreak()] }),

          // DURING Section
          new Paragraph({
            shading: { fill: 'fee2e2', type: ShadingType.SOLID },
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `🚨 ${getUIText('bcpPreview.workbook.duringResponse', locale)}`,
                bold: true,
                size: 32,
                color: '991b1b'
              })
            ]
          }),
          ...strategies.flatMap(strategy => createWorkbookStrategySection(strategy, 'during', locale)),

          new Paragraph({ children: [new PageBreak()] }),

          // AFTER Section
          new Paragraph({
            shading: { fill: 'dcfce7', type: ShadingType.SOLID },
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `🔄 ${getUIText('bcpPreview.workbook.afterRecovery', locale)}`,
                bold: true,
                size: 32,
                color: '166534'
              })
            ]
          }),
          ...strategies.flatMap(strategy => createWorkbookStrategySection(strategy, 'after', locale))
        ]
      }
    ]
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createSectionHeader(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    border: {
      bottom: { color: COLORS.secondary, space: 1, style: BorderStyle.SINGLE, size: 12 }
    },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32,
        color: COLORS.primary,
        font: 'Calibri'
      })
    ]
  })
}

function createSubsectionHeader(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26,
        color: COLORS.gray[700],
        font: 'Calibri'
      })
    ]
  })
}

function createInfoTable(rows: [string, string][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.gray[300] },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.gray[300] },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.gray[300] },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.gray[300] },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: COLORS.gray[300] },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLORS.gray[300] }
    },
    rows: rows.map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: COLORS.gray[100], type: ShadingType.SOLID },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: label, bold: true, size: 22 })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: value || '-', size: 22 })
                ]
              })
            ]
          })
        ]
      })
    )
  })
}

function createRiskTable(riskMatrix: any[], locale: Locale): Paragraph[] {
  if (!riskMatrix || riskMatrix.length === 0) {
    return [new Paragraph({ children: [new TextRun({ text: 'No risks identified.', size: 22 })] })]
  }

  const selectedRisks = riskMatrix.filter((r: any) => r.isSelected)
  
  if (selectedRisks.length === 0) {
    return [new Paragraph({ children: [new TextRun({ text: 'No risks selected.', size: 22 })] })]
  }

  return selectedRisks.map((risk: any) => {
    const riskName = getString(risk.Hazard || risk.hazardId || 'Unknown Risk')
    const riskScore = parseFloat(risk.riskScore || risk['Risk Score'] || 0)
    const likelihood = risk.likelihood || risk.Likelihood || '-'
    const impact = risk.impact || risk.Impact || '-'
    
    let severityColor = COLORS.success
    let severityText = 'LOW'
    if (riskScore >= 8) {
      severityColor = COLORS.danger
      severityText = getUIText('bcpPreview.formalBcp.extreme', locale)
    } else if (riskScore >= 6) {
      severityColor = 'f97316' // orange
      severityText = getUIText('bcpPreview.formalBcp.high', locale)
    } else if (riskScore >= 4) {
      severityColor = COLORS.warning
      severityText = getUIText('bcpPreview.formalBcp.medium', locale)
    } else {
      severityText = getUIText('bcpPreview.formalBcp.low', locale)
    }

    return new Paragraph({
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({ text: `• ${riskName}`, bold: true, size: 22 }),
        new TextRun({ text: ` - ${severityText}`, size: 22, color: severityColor }),
        new TextRun({ text: ` (Score: ${riskScore.toFixed(1)})`, size: 20, color: COLORS.gray[500] })
      ]
    })
  })
}

function createStrategySection(strategy: any, index: number, locale: Locale): Paragraph[] {
  const name = getString(strategy.name || strategy.smeTitle || `Strategy ${index}`)
  const description = getString(strategy.description || strategy.smeSummary || '')
  const cost = strategy.calculatedCostLocal || strategy.costEstimateJMD || ''
  const currencySymbol = strategy.currencySymbol || '$'
  
  const paragraphs: Paragraph[] = [
    new Paragraph({
      spacing: { before: 300, after: 100 },
      shading: { fill: COLORS.gray[100], type: ShadingType.SOLID },
      children: [
        new TextRun({
          text: `Strategy ${index}: ${name}`,
          bold: true,
          size: 24,
          color: COLORS.primary
        }),
        cost ? new TextRun({
          text: `  |  Investment: ${currencySymbol}${typeof cost === 'number' ? cost.toLocaleString() : cost}`,
          size: 22,
          color: COLORS.success
        }) : new TextRun({})
      ]
    })
  ]

  if (description) {
    paragraphs.push(new Paragraph({
      spacing: { before: 100, after: 100 },
      children: [new TextRun({ text: description, size: 22 })]
    }))
  }

  // Action steps
  const actionSteps = strategy.actionSteps || []
  if (actionSteps.length > 0) {
    paragraphs.push(new Paragraph({
      spacing: { before: 150 },
      children: [new TextRun({ text: getUIText('bcpPreview.formalBcp.keyActions', locale) + ':', bold: true, size: 22 })]
    }))

    actionSteps.forEach((step: any, stepIndex: number) => {
      const stepTitle = getString(step.title || step.smeAction || `Step ${stepIndex + 1}`)
      paragraphs.push(new Paragraph({
        spacing: { before: 50 },
        children: [
          new TextRun({ text: `   ${stepIndex + 1}. `, size: 22 }),
          new TextRun({ text: stepTitle, size: 22 })
        ]
      }))
    })
  }

  // Cost items
  const costItems = collectCostItems(strategy)
  if (costItems.length > 0) {
    paragraphs.push(new Paragraph({
      spacing: { before: 150 },
      children: [new TextRun({ text: getUIText('bcpPreview.formalBcp.itemsToPurchase', locale) + ':', bold: true, size: 22 })]
    }))

    costItems.forEach((item: any) => {
      const itemName = getString(item.name || item.itemId || 'Item')
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({ text: `   • ${item.quantity > 1 ? `${item.quantity}x ` : ''}${itemName}`, size: 22 })
        ]
      }))
    })
  }

  return paragraphs
}

function createWorkbookStrategySection(strategy: any, phase: string, locale: Locale): Paragraph[] {
  const actionSteps = (strategy.actionSteps || []).filter((step: any) => {
    const stepPhase = step.phase?.toLowerCase() || ''
    if (phase === 'before') return stepPhase === 'before' || stepPhase === 'preparation'
    if (phase === 'during') return stepPhase === 'during' || stepPhase === 'response'
    if (phase === 'after') return stepPhase === 'after' || stepPhase === 'recovery'
    return false
  })

  if (actionSteps.length === 0) return []

  const name = getString(strategy.name || strategy.smeTitle || 'Strategy')
  const paragraphs: Paragraph[] = [
    new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: `▶ ${name}`,
          bold: true,
          size: 26,
          color: COLORS.gray[900]
        })
      ]
    })
  ]

  actionSteps.forEach((step: any, index: number) => {
    const stepTitle = getString(step.title || step.smeAction || `Step ${index + 1}`)
    const stepDesc = getString(step.description || '')
    
    // Checkbox style action item
    paragraphs.push(new Paragraph({
      spacing: { before: 100 },
      children: [
        new TextRun({ text: '☐ ', size: 28 }),
        new TextRun({ text: stepTitle, bold: true, size: 22 })
      ]
    }))

    if (stepDesc) {
      paragraphs.push(new Paragraph({
        indent: { left: 400 },
        children: [new TextRun({ text: stepDesc, size: 20, color: COLORS.gray[700] })]
      }))
    }

    // Why this matters
    if (step.whyThisStepMatters) {
      paragraphs.push(new Paragraph({
        indent: { left: 400 },
        children: [
          new TextRun({ text: `${getUIText('bcpPreview.workbook.whyLabel', locale)}: `, bold: true, size: 20, color: COLORS.secondary }),
          new TextRun({ text: getString(step.whyThisStepMatters), size: 20, color: COLORS.gray[700] })
        ]
      }))
    }
  })

  return paragraphs
}

function createContactsTable(contacts: any[], locale: Locale): Paragraph[] {
  if (!contacts || contacts.length === 0) {
    return [new Paragraph({ children: [new TextRun({ text: 'No contacts listed.', size: 22 })] })]
  }

  return contacts.map((contact: any) => {
    const name = getString(contact['Service Type'] || contact.serviceType || contact.Name || contact.name || 'Contact')
    const phone = getString(contact['Phone Number'] || contact.phoneNumber || contact.phone || '')
    
    return new Paragraph({
      spacing: { before: 50, after: 50 },
      children: [
        new TextRun({ text: `• ${name}`, bold: true, size: 22 }),
        phone ? new TextRun({ text: `: ${phone}`, size: 22 }) : new TextRun({})
      ]
    })
  })
}

function createEmergencyContactsSection(contacts: any[], locale: Locale): Paragraph[] {
  if (!contacts || contacts.length === 0) {
    return [
      new Paragraph({
        spacing: { before: 200 },
        children: [
          new TextRun({ text: '• Police: _______________', size: 28 })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Fire: _______________', size: 28 })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Ambulance: _______________', size: 28 })
        ]
      })
    ]
  }

  return contacts.slice(0, 5).map((contact: any) => {
    const name = getString(contact['Service Type'] || contact.serviceType || 'Service')
    const phone = getString(contact['Phone Number'] || contact.phoneNumber || '_______________')
    
    return new Paragraph({
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({ text: `• ${name}: `, bold: true, size: 28 }),
        new TextRun({ text: phone, size: 28 })
      ]
    })
  })
}

function createSignatureBlock(name: string, date: string, locale: Locale): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NIL },
      bottom: { style: BorderStyle.NIL },
      left: { style: BorderStyle.NIL },
      right: { style: BorderStyle.NIL }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NIL },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.gray[900] },
              left: { style: BorderStyle.NIL },
              right: { style: BorderStyle.NIL }
            },
            children: [
              new Paragraph({ spacing: { after: 600 } })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NIL },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.gray[900] },
              left: { style: BorderStyle.NIL },
              right: { style: BorderStyle.NIL }
            },
            children: [
              new Paragraph({ spacing: { after: 600 } })
            ]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: name, size: 22 }),
                  new TextRun({ text: `\n${locale === 'es' ? 'Gerente del Plan' : locale === 'fr' ? 'Gestionnaire du Plan' : 'Plan Manager'}`, size: 20, color: COLORS.gray[500] })
                ]
              })
            ]
          }),
          new TableCell({
            borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: date, size: 22 }),
                  new TextRun({ text: `\n${locale === 'es' ? 'Fecha' : locale === 'fr' ? 'Date' : 'Date'}`, size: 20, color: COLORS.gray[500] })
                ]
              })
            ]
          })
        ]
      })
    ]
  })
}

function collectCostItems(strategy: any): any[] {
  const itemMap = new Map<string, { name: string; quantity: number }>()
  
  strategy.actionSteps?.forEach((step: any) => {
    const costItems = step.costItems || step.itemCosts || []
    costItems.forEach((costItem: any) => {
      const itemName = getString(
        costItem.item?.name || 
        costItem.costItem?.name || 
        costItem.name || 
        costItem.itemId || 
        'Item'
      )
      const quantity = costItem.quantity || 1
      const key = itemName.toLowerCase()
      
      if (itemMap.has(key)) {
        const existing = itemMap.get(key)!
        existing.quantity += quantity
      } else {
        itemMap.set(key, { name: itemName, quantity })
      }
    })
  })
  
  return Array.from(itemMap.values())
}

function getString(value: any): string {
  if (!value) return ''
  if (typeof value === 'string') {
    // Try to parse as JSON multilingual object
    if (value.startsWith('{') && (value.includes('"en"') || value.includes('"es"') || value.includes('"fr"'))) {
      try {
        const parsed = JSON.parse(value)
        return parsed.en || parsed.es || parsed.fr || value
      } catch {
        return value
      }
    }
    return value
  }
  if (typeof value === 'object') {
    return value.en || value.es || value.fr || JSON.stringify(value)
  }
  return String(value)
}


import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { reportType, selectedRegions, selectedRisks } = await request.json()

    // Fetch parishes data
    const parishes = await prisma.parish.findMany({
      where: {
        isActive: true,
        region: selectedRegions.length > 0 ? { in: selectedRegions } : undefined
      },
      include: {
        parishRisk: true
      },
      orderBy: [
        { region: 'asc' },
        { name: 'asc' }
      ]
    })

    // Transform data
    const transformedParishes = parishes.map(parish => ({
      id: parish.id,
      name: parish.name,
      region: parish.region,
      population: parish.population,
      riskProfile: {
        hurricane: {
          level: parish.ParishRisk?.hurricaneLevel || 0,
          notes: parish.ParishRisk?.hurricaneNotes || ''
        },
        flood: {
          level: parish.ParishRisk?.floodLevel || 0,
          notes: parish.ParishRisk?.floodNotes || ''
        },
        earthquake: {
          level: parish.ParishRisk?.earthquakeLevel || 0,
          notes: parish.ParishRisk?.earthquakeNotes || ''
        },
        drought: {
          level: parish.ParishRisk?.droughtLevel || 0,
          notes: parish.ParishRisk?.droughtNotes || ''
        },
        landslide: {
          level: parish.ParishRisk?.landslideLevel || 0,
          notes: parish.ParishRisk?.landslideNotes || ''
        },
        powerOutage: {
          level: parish.ParishRisk?.powerOutageLevel || 0,
          notes: parish.ParishRisk?.powerOutageNotes || ''
        }
      }
    }))

    // Generate report content based on type
    let reportContent = ''
    const timestamp = new Date().toLocaleDateString()

    if (reportType === 'summary') {
      reportContent = generateSummaryReport(transformedParishes, selectedRisks, timestamp)
    } else if (reportType === 'detailed') {
      reportContent = generateDetailedReport(transformedParishes, selectedRisks, timestamp)
    } else if (reportType === 'matrix') {
      reportContent = generateMatrixReport(transformedParishes, selectedRisks, timestamp)
    }

    // Create simple HTML-to-PDF response
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Jamaica Parish Risk Assessment Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .parish { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .risk-high { color: #dc2626; font-weight: bold; }
        .risk-medium { color: #f59e0b; font-weight: bold; }
        .risk-low { color: #059669; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f8f9fa; }
        .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-box { padding: 15px; border: 1px solid #ddd; border-radius: 5px; text-align: center; }
    </style>
</head>
<body>
    ${reportContent}
</body>
</html>`

    // For a simple implementation, return the HTML content
    // In production, you'd use a PDF generation library like Puppeteer
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="jamaica_parish_risk_report_${reportType}_${timestamp.replace(/\//g, '-')}.html"`
      }
    })

  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

function generateSummaryReport(parishes: any[], selectedRisks: string[], timestamp: string): string {
  const totalParishes = parishes.length
  const totalPopulation = parishes.reduce((sum, p) => sum + p.population, 0)

  // Calculate risk statistics
  const riskStats = selectedRisks.map(risk => {
    const levels = parishes.map(p => p.riskProfile[risk]?.level || 0)
    const avgLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length
    const highRiskCount = levels.filter(level => level >= 8).length
    const maxLevel = Math.max(...levels)
    
    return {
      name: risk.charAt(0).toUpperCase() + risk.slice(1),
      avgLevel: Math.round(avgLevel * 10) / 10,
      highRiskCount,
      maxLevel
    }
  })

  return `
    <div class="header">
        <h1>🏝️ Jamaica Parish Risk Assessment</h1>
        <h2>Executive Summary Report</h2>
        <p>Generated on ${timestamp}</p>
    </div>

    <div class="section">
        <h3>📊 Overview Statistics</h3>
        <div class="summary-stats">
            <div class="stat-box">
                <h4>${totalParishes}</h4>
                <p>Total Parishes</p>
            </div>
            <div class="stat-box">
                <h4>${totalPopulation.toLocaleString()}</h4>
                <p>Total Population</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h3>⚠️ Risk Analysis Summary</h3>
        <table>
            <thead>
                <tr>
                    <th>Risk Type</th>
                    <th>Average Level</th>
                    <th>High Risk Parishes</th>
                    <th>Maximum Level</th>
                </tr>
            </thead>
            <tbody>
                ${riskStats.map(stat => `
                    <tr>
                        <td>${stat.name}</td>
                        <td class="${stat.avgLevel >= 7 ? 'risk-high' : stat.avgLevel >= 5 ? 'risk-medium' : 'risk-low'}">${stat.avgLevel}/10</td>
                        <td>${stat.highRiskCount}</td>
                        <td class="${stat.maxLevel >= 8 ? 'risk-high' : 'risk-medium'}">${stat.maxLevel}/10</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h3>🎯 Key Findings</h3>
        <ul>
            <li><strong>Highest Risk Parish:</strong> ${parishes.reduce((max, p) => {
              const maxRisk = Math.max(...selectedRisks.map(risk => p.riskProfile[risk]?.level || 0))
              const currentMaxRisk = Math.max(...selectedRisks.map(risk => max.riskProfile[risk]?.level || 0))
              return maxRisk > currentMaxRisk ? p : max
            }).name}</li>
            <li><strong>Most Vulnerable Risk:</strong> ${riskStats.reduce((max, stat) => stat.avgLevel > max.avgLevel ? stat : max).name} (Average: ${riskStats.reduce((max, stat) => stat.avgLevel > max.avgLevel ? stat : max).avgLevel}/10)</li>
            <li><strong>Population at Risk:</strong> ${parishes.filter(p => Math.max(...selectedRisks.map(risk => p.riskProfile[risk]?.level || 0)) >= 7).reduce((sum, p) => sum + p.population, 0).toLocaleString()} people in high-risk parishes</li>
        </ul>
    </div>
  `
}

function generateDetailedReport(parishes: any[], selectedRisks: string[], timestamp: string): string {
  const regions = Array.from(new Set(parishes.map(p => p.region)))

  return `
    <div class="header">
        <h1>🏝️ Jamaica Parish Risk Assessment</h1>
        <h2>Detailed Analysis Report</h2>
        <p>Generated on ${timestamp}</p>
    </div>

    ${regions.map(region => {
      const regionParishes = parishes.filter(p => p.region === region)
      return `
        <div class="section">
            <h3>📍 ${region} Region</h3>
            ${regionParishes.map(parish => `
                <div class="parish">
                    <h4>${parish.name} Parish</h4>
                    <p><strong>Population:</strong> ${parish.population.toLocaleString()}</p>
                    
                    <h5>Risk Assessment:</h5>
                    <table>
                        <thead>
                            <tr><th>Risk Type</th><th>Level</th><th>Notes</th></tr>
                        </thead>
                        <tbody>
                            ${selectedRisks.map(risk => {
                              const riskData = parish.riskProfile[risk]
                              const level = riskData?.level || 0
                              const levelClass = level >= 8 ? 'risk-high' : level >= 5 ? 'risk-medium' : 'risk-low'
                              return `
                                <tr>
                                    <td>${risk.charAt(0).toUpperCase() + risk.slice(1)}</td>
                                    <td class="${levelClass}">${level}/10</td>
                                    <td>${riskData?.notes || 'No notes available'}</td>
                                </tr>
                              `
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `).join('')}
        </div>
      `
    }).join('')}
  `
}

function generateMatrixReport(parishes: any[], selectedRisks: string[], timestamp: string): string {
  return `
    <div class="header">
        <h1>🏝️ Jamaica Parish Risk Assessment</h1>
        <h2>Risk Matrix Report</h2>
        <p>Generated on ${timestamp}</p>
    </div>

    <div class="section">
        <h3>🎯 Parish Risk Matrix</h3>
        <table>
            <thead>
                <tr>
                    <th>Parish</th>
                    <th>Region</th>
                    <th>Population</th>
                    ${selectedRisks.map(risk => `<th>${risk.charAt(0).toUpperCase() + risk.slice(1)}</th>`).join('')}
                    <th>Avg Risk</th>
                </tr>
            </thead>
            <tbody>
                ${parishes.map(parish => {
                  const riskLevels = selectedRisks.map(risk => parish.riskProfile[risk]?.level || 0)
                  const avgRisk = Math.round(riskLevels.reduce((sum, level) => sum + level, 0) / riskLevels.length * 10) / 10
                  const avgClass = avgRisk >= 7 ? 'risk-high' : avgRisk >= 5 ? 'risk-medium' : 'risk-low'
                  
                  return `
                    <tr>
                        <td><strong>${parish.name}</strong></td>
                        <td>${parish.region}</td>
                        <td>${parish.population.toLocaleString()}</td>
                        ${selectedRisks.map(risk => {
                          const level = parish.riskProfile[risk]?.level || 0
                          const levelClass = level >= 8 ? 'risk-high' : level >= 5 ? 'risk-medium' : 'risk-low'
                          return `<td class="${levelClass}">${level}</td>`
                        }).join('')}
                        <td class="${avgClass}">${avgRisk}</td>
                    </tr>
                  `
                }).join('')}
            </tbody>
        </table>
    </div>
  `
}


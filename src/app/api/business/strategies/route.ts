import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessData, riskProfile } = body

    if (!businessData) {
      return NextResponse.json({ error: 'Business data is required' }, { status: 400 })
    }

    // Extract risk types from risk profile
    const riskTypes = riskProfile?.map((risk: any) => risk.hazard || risk.riskType) || []
    
    console.log('Risk Calculator API Call:', {
      businessType: businessData.businessType,
      location: businessData.location,
      riskTypes,
      riskProfile: riskProfile?.map((r: any) => ({ hazard: r.hazard || r.riskType, level: r.level }))
    })
    
    // Fetch strategies from admin2 database
    try {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      
      const response = await fetch(`${baseUrl}/api/admin2/strategies`)
      const strategies = response.ok ? await response.json() : []
      
      // Filter strategies based on business type and risk types
      const relevantStrategies = strategies.filter((strategy: any) => {
        const businessTypeMatch = !strategy.businessTypes?.length || 
                                 strategy.businessTypes?.includes(businessData.businessType) ||
                                 strategy.businessTypes?.includes('all')
        
        const riskTypeMatch = !strategy.applicableRisks?.length ||
                             strategy.applicableRisks?.some((risk: string) => 
                               riskTypes.includes(risk)
                             )
        
        return businessTypeMatch && riskTypeMatch
      })

      // Sort by priority and effectiveness
      const sortedStrategies = relevantStrategies.sort((a: any, b: any) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1
        
        if (aPriority !== bPriority) return bPriority - aPriority
        return (b.effectiveness || 5) - (a.effectiveness || 5)
      })

      // Transform strategies for business recommendations
      const recommendedStrategies = sortedStrategies.slice(0, 10).map((strategy: any) => ({
        id: strategy.id,
        strategyId: strategy.strategyId,
        name: strategy.name,
        category: strategy.category,
        description: strategy.smeDescription || strategy.description,
        simplifiedDescription: strategy.smeDescription || strategy.description,
        whyImportant: strategy.whyImportant || 'Important for business protection',
        implementationSteps: strategy.actionSteps?.map((step: any, index: number) => ({
          id: step.id || `${strategy.id}_step_${index + 1}`,
          title: step.smeAction || step.action,
          description: step.smeAction || step.action,
          phase: step.phase,
          timeframe: step.timeframe,
          responsibility: step.responsibility,
          resources: step.resources || [],
          estimatedCost: step.estimatedCostJMD || step.cost,
          completed: false,
          checklist: step.checklist || []
        })) || [],
        cost: strategy.implementationCost,
        costEstimateJMD: strategy.costEstimateJMD || (
          strategy.implementationCost === 'low' ? 'Under JMD $10,000' : 
          strategy.implementationCost === 'medium' ? 'JMD $10,000 - $50,000' : 
          strategy.implementationCost === 'high' ? 'JMD $50,000 - $200,000' :
          'Over JMD $200,000'
        ),
        timeToImplement: strategy.timeToImplement || strategy.implementationTime,
        effectiveness: strategy.effectiveness || 5,
        priority: strategy.priority,
        businessTypes: strategy.businessTypes || [],
        applicableRisks: strategy.applicableRisks || [],
        prerequisites: strategy.prerequisites || [],
        roi: strategy.roi || 3.0,
        successMetrics: strategy.successMetrics || [],
        commonMistakes: strategy.commonMistakes || [],
        helpfulTips: strategy.helpfulTips || [],
        status: 'not_started' as const,
        lastUpdated: new Date().toISOString(),
        implementationProgress: 0
      }))

      return NextResponse.json({
        recommendedStrategies,
        totalCount: recommendedStrategies.length,
        businessType: businessData.businessType,
        location: businessData.location,
        riskTypes,
        recommendations: {
          immediate: recommendedStrategies.filter((s: any) => s.priority === 'critical').length,
          high: recommendedStrategies.filter((s: any) => s.priority === 'high').length,
          medium: recommendedStrategies.filter((s: any) => s.priority === 'medium').length,
          low: recommendedStrategies.filter((s: any) => s.priority === 'low').length
        }
      })
      
    } catch (fetchError) {
      console.error('Failed to fetch strategies from admin2:', fetchError)
      // Fallback to empty recommendations
      return NextResponse.json({
        recommendedStrategies: [],
        totalCount: 0,
        businessType: businessData.businessType,
        location: businessData.location,
        riskTypes,
        recommendations: { immediate: 0, high: 0, medium: 0, low: 0 },
        error: 'Could not load strategies from database'
      })
    }

  } catch (error) {
    console.error('Error generating strategy recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate strategy recommendations' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessType = searchParams.get('businessType')
    const riskType = searchParams.get('riskType')
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')

    // Fetch strategies from admin2 database
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/admin2/strategies`)
    let strategies = response.ok ? await response.json() : []

    // Apply filters
    if (businessType) {
      strategies = strategies.filter((strategy: any) =>
        !strategy.businessTypes?.length || 
        strategy.businessTypes?.includes(businessType) ||
        strategy.businessTypes?.includes('all')
      )
    }

    if (riskType) {
      strategies = strategies.filter((strategy: any) =>
        strategy.applicableRisks?.includes(riskType)
      )
    }

    if (category) {
      strategies = strategies.filter((strategy: any) => strategy.category === category)
    }

    if (priority) {
      strategies = strategies.filter((strategy: any) => strategy.priority === priority)
    }

    return NextResponse.json({
      templates: strategies.map((strategy: any) => ({
        id: strategy.id,
        name: strategy.name,
        category: strategy.category,
        description: strategy.description,
        simplifiedDescription: strategy.smeDescription || strategy.description,
        applicableBusinessTypes: strategy.businessTypes || [],
        applicableRisks: strategy.applicableRisks || [],
        cost: strategy.implementationCost,
        timeToImplement: strategy.timeToImplement,
        effectiveness: strategy.effectiveness,
        priority: strategy.priority,
        roi: strategy.roi
      })),
      totalCount: strategies.length,
      filters: {
        businessType,
        riskType,
        category,
        priority
      }
    })

  } catch (error) {
    console.error('Error fetching strategy templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch strategy templates' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get single country multiplier
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const multiplier = await prisma.countryCostMultiplier.findUnique({
      where: { id: params.id }
    })
    
    if (!multiplier) {
      return NextResponse.json({ error: 'Multiplier not found' }, { status: 404 })
    }
    
    return NextResponse.json({ multiplier })
  } catch (error) {
    console.error('Failed to fetch multiplier:', error)
    return NextResponse.json({ error: 'Failed to fetch multiplier' }, { status: 500 })
  }
}

// PUT - Update country multipliers
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()
    
    const updateData: any = {
      lastUpdated: new Date()
    }
    
    if (data.construction !== undefined) updateData.construction = parseFloat(data.construction)
    if (data.equipment !== undefined) updateData.equipment = parseFloat(data.equipment)
    if (data.service !== undefined) updateData.service = parseFloat(data.service)
    if (data.supplies !== undefined) updateData.supplies = parseFloat(data.supplies)
    if (data.exchangeRateUSD !== undefined) updateData.exchangeRateUSD = parseFloat(data.exchangeRateUSD)
    if (data.currency !== undefined) updateData.currency = data.currency
    if (data.currencySymbol !== undefined) updateData.currencySymbol = data.currencySymbol
    if (data.dataSource !== undefined) updateData.dataSource = data.dataSource
    if (data.confidenceLevel !== undefined) updateData.confidenceLevel = data.confidenceLevel
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.updatedBy !== undefined) updateData.updatedBy = data.updatedBy
    
    const multiplier = await prisma.countryCostMultiplier.update({
      where: { id: params.id },
      data: updateData
    })
    
    return NextResponse.json({ multiplier })
  } catch (error) {
    console.error('Failed to update multiplier:', error)
    return NextResponse.json({ error: 'Failed to update multiplier' }, { status: 500 })
  }
}

// DELETE - Delete country multiplier
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.countryCostMultiplier.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete multiplier:', error)
    return NextResponse.json({ error: 'Failed to delete multiplier' }, { status: 500 })
  }
}


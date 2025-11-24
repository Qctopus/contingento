// API endpoint to clear strategy cache
import { NextResponse } from 'next/server'
import { centralDataService } from '@/services/centralDataService'

export async function POST() {
    try {
        console.log('🔄 API: Clearing strategy cache and forcing refresh')

        // Invalidate cache
        centralDataService.invalidateCache('strategies')

        // Force refresh strategies from database
        const freshStrategies = await centralDataService.getStrategies(true)

        console.log(`✅ API: Refreshed ${freshStrategies.length} strategies from database`)

        return NextResponse.json({
            success: true,
            message: `Strategy cache cleared and ${freshStrategies.length} strategies reloaded`,
            count: freshStrategies.length
        })
    } catch (error: any) {
        console.error('❌ API: Failed to refresh strategies:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

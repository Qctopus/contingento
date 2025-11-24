import { NextRequest, NextResponse } from 'next/server'
import {
  getPrismaClient,
  withDatabase,
  createSuccessResponse,
  handleApiError
} from '@/lib/admin2/api-utils'
import { transformBusinessTypeForApi } from '@/lib/admin2/transformers'
import { localizeBusinessType } from '@/utils/localizationUtils'
import type { Locale } from '@/i18n/config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get locale and raw flag from query parameters
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') as Locale || 'en'
    const raw = searchParams.get('raw') === 'true' // If raw=true, skip localization

    const businessTypes = await withDatabase(async () => {
      const prisma = getPrismaClient()
      return await prisma.businessType.findMany({
        where: { isActive: true },
        include: {
          BusinessRiskVulnerability: true,
          BusinessTypeTranslation: {
            where: { locale }
          }
        },
        orderBy: [
          { category: 'asc' },
          { businessTypeId: 'asc' }
        ]
      })
    }, 'GET /api/admin2/business-types')

    // Transform database data to match frontend expectations
    let transformedBusinessTypes = businessTypes.map(transformBusinessTypeForApi)

    // Only localize if not requesting raw data (for editing, we need full multilingual objects)
    if (!raw) {
      transformedBusinessTypes = transformedBusinessTypes.map(bt => localizeBusinessType(bt, locale))
    }

    console.log(`🏢 Business Types GET API: Successfully fetched ${businessTypes.length} business types (locale: ${locale}, raw: ${raw})`)
    return createSuccessResponse(transformedBusinessTypes)

  } catch (error) {
    return handleApiError(error, 'Failed to fetch business types')
  }
}
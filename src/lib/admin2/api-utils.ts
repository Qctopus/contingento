import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * Shared utilities for Admin2 API routes
 * Provides consistent error handling, response formatting, and database operations
 */

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface ApiResponse<T = any> {
  data?: T
  error?: ApiError
  success: boolean
}

/**
 * Standardized error response creator
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  code?: string,
  details?: any
): NextResponse<ApiResponse> {
  console.error(`API Error (${status}):`, { message, code, details })

  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details
      }
    },
    { status }
  )
}

/**
 * Standardized success response creator
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data
    },
    { status }
  )
}

/**
 * Enhanced error handler that provides appropriate responses for different error types
 */
export function handleApiError(error: unknown, context: string): NextResponse<ApiResponse> {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return createErrorResponse(
          'A record with this data already exists',
          409,
          'DUPLICATE_RECORD',
          error.meta
        )
      case 'P2025':
        return createErrorResponse(
          'Record not found',
          404,
          'NOT_FOUND',
          error.meta
        )
      case 'P2003':
        return createErrorResponse(
          'Foreign key constraint failed',
          400,
          'CONSTRAINT_VIOLATION',
          error.meta
        )
      default:
        return createErrorResponse(
          'Database operation failed',
          500,
          'DATABASE_ERROR',
          { code: error.code, meta: error.meta }
        )
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return createErrorResponse(
      'Invalid data provided',
      400,
      'VALIDATION_ERROR',
      error.message
    )
  }

  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return createErrorResponse(
      'Invalid JSON in request body',
      400,
      'INVALID_JSON'
    )
  }

  // Generic error fallback
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
  return createErrorResponse(
    `${context}: ${errorMessage}`,
    500,
    'INTERNAL_ERROR'
  )
}

/**
 * Safe database operation wrapper with automatic connection management
 */
export async function withDatabase<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    const result = await operation()
    return result
  } catch (error) {
    console.error(`Database operation failed in ${context}:`, error)
    throw error
  } finally {
    // Connection is managed by the global prisma instance
    // No need to disconnect here as it's handled globally
  }
}

/**
 * Parse and validate JSON fields safely
 */
export function safeJsonParse<T>(value: any, fallback: T): T {
  if (!value) return fallback

  // If it's already an object or array, return it
  if (typeof value === 'object') {
    return value as T
  }

  try {
    return JSON.parse(value)
  } catch (error) {
    console.warn('Failed to parse JSON:', value, error)
    return fallback
  }
}

/**
 * Safely stringify JSON with fallback
 */
export function safeJsonStringify(data: any, fallback: string = '{}'): string {
  try {
    return JSON.stringify(data)
  } catch (error) {
    console.warn('Failed to stringify JSON:', data, error)
    return fallback
  }
}

/**
 * Validate required fields in request data
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): string[] {
  const missingFields: string[] = []

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field)
    }
  }

  return missingFields
}

/**
 * Sanitize and validate ID parameter
 */
export function validateId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && /^[a-zA-Z0-9_-]+$/.test(id)
}

/**
 * Get shared Prisma client instance
 */
export function getPrismaClient() {
  return prisma
}

/**
 * Transform dates to ISO strings for API responses
 */
export function transformDatesForApi(obj: any): any {
  if (!obj) return obj

  const transformed = { ...obj }

  // Transform common date fields
  if (transformed.createdAt instanceof Date) {
    transformed.createdAt = transformed.createdAt.toISOString()
  }
  if (transformed.updatedAt instanceof Date) {
    transformed.updatedAt = transformed.updatedAt.toISOString()
  }
  if (transformed.lastUpdated instanceof Date) {
    transformed.lastUpdated = transformed.lastUpdated.toISOString()
  }

  return transformed
}

import { NextResponse } from 'next/server'

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL || 'NOT SET'
  
  return NextResponse.json({
    databaseUrl: databaseUrl.substring(0, 30) + '...', // Show first 30 chars only
    startsWithPostgresql: databaseUrl.startsWith('postgresql://'),
    startsWithFile: databaseUrl.startsWith('file:'),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('DATABASE')).sort()
  })
}


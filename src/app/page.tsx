'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { BusinessContinuityForm } from '@/components/BusinessContinuityForm'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    redirect('/login')
  }

  return <BusinessContinuityForm />
} 
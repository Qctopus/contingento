import { useTranslations } from 'next-intl'
import { BusinessContinuityForm } from '@/components/BusinessContinuityForm'
import { DevDataFiller } from '@/components/DevDataFiller'

export default function HomePage() {
  const t = useTranslations('common')

  return (
    <div>
      <BusinessContinuityForm />
      <DevDataFiller />
    </div>
  )
} 
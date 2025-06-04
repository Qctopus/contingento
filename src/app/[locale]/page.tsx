import { useTranslations } from 'next-intl'
import { BusinessContinuityForm } from '@/components/BusinessContinuityForm'

export default function HomePage() {
  const t = useTranslations('common')

  return (
    <div>
      <BusinessContinuityForm />
    </div>
  )
} 
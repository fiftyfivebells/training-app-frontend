import { useState } from 'react'

import { useUpdatePreferences } from '@/domains/users/hooks/useUpdatePreferences'

import { useOnboarding } from '../context/OnboardingContext'
import { useOnboardingStatus } from '../context/OnboardingStatusContext'

export function useCompleteOnboarding() {
  const { state } = useOnboarding()
  const { markComplete } = useOnboardingStatus()
  const updatePreferences = useUpdatePreferences()
  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const complete = async () => {
    setIsCompleting(true)
    setError(null)
    try {
      await updatePreferences.mutateAsync({
        preferredUnits: state.distanceUnit === 'miles' ? 'imperial' : 'metric',
      })
      await markComplete()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.')
      setIsCompleting(false)
    }
  }

  return { complete, isCompleting, error }
}

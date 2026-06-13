import React, { createContext, useContext } from 'react'

import { useAuthContext } from '@/domains/auth/context/AuthContext'
import { userClient } from '@/domains/users/api/userApi'

interface OnboardingStatusContextValue {
  isComplete: boolean | null
  isLoading: boolean
  markComplete: () => Promise<void>
}

const OnboardingStatusContext = createContext<OnboardingStatusContextValue | undefined>(undefined)

export function OnboardingStatusProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading, refetchUser } = useAuthContext()

  const isComplete = user ? user.onboardingCompleted : null

  const markComplete = async () => {
    await userClient.completeOnboarding()
    await refetchUser()
  }

  return (
    <OnboardingStatusContext.Provider value={{ isComplete, isLoading: authLoading, markComplete }}>
      {children}
    </OnboardingStatusContext.Provider>
  )
}

export function useOnboardingStatus() {
  const ctx = useContext(OnboardingStatusContext)
  if (!ctx) throw new Error('useOnboardingStatus must be used within OnboardingStatusProvider')
  return ctx
}

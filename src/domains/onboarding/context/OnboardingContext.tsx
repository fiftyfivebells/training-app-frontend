import React, { createContext, useContext, useState } from 'react'

import { DEFAULT_ONBOARDING_STATE, type OnboardingState } from '../constants'

interface OnboardingContextValue {
  state: OnboardingState
  update: (partial: Partial<OnboardingState>) => void
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>(DEFAULT_ONBOARDING_STATE)

  const update = (partial: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...partial }))
  }

  return (
    <OnboardingContext.Provider value={{ state, update }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}

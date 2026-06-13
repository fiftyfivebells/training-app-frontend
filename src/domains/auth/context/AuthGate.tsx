import { Redirect, useSegments } from 'expo-router'
import { useAuthContext } from '@/domains/auth/context/AuthContext'
import { useOnboardingStatus } from '@/domains/onboarding/context/OnboardingStatusContext'
import React from 'react'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()
  const { isComplete: onboardingComplete, isLoading: onboardingLoading } = useOnboardingStatus()
  const segments = useSegments()

  if (authLoading || onboardingLoading) return null

  const inAuthGroup = segments[0] === '(auth)'
  const inOnboardingGroup = segments[0] === '(onboarding)'
  const inModalsGroup = segments[0] === '(modals)'

  if (!isAuthenticated) {
    if (!inAuthGroup) return <Redirect href="/(auth)/login" />
    return <>{children}</>
  }

  if (inAuthGroup) {
    if (onboardingComplete === false) return <Redirect href="/(onboarding)/welcome" />
    return <Redirect href="/" />
  }

  if (!onboardingComplete) {
    if (!inOnboardingGroup && !inModalsGroup) return <Redirect href="/(onboarding)/welcome" />
    return <>{children}</>
  }

  if (inOnboardingGroup) return <Redirect href="/" />

  return <>{children}</>
}

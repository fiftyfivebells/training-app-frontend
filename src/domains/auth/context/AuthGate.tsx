import { Redirect, useSegments } from 'expo-router'
import { useAuthContext } from '@/domains/auth/context/AuthContext'
import React from 'react'
import { useTheme } from '@/theme/ThemeProvider'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext()
  const segments = useSegments()

  if (isLoading) return null

  const inAuthGroup = segments[0] === '(auth)'

  if (!isAuthenticated) {
    if (!inAuthGroup) {
      return <Redirect href="/(auth)/login" />
    }
    return <>{children}</>
  }

  if (isAuthenticated && inAuthGroup) {
    return <Redirect href="/(drawer)/" />
  }

  return <>{children}</>
}

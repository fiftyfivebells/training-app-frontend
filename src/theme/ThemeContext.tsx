import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useColorScheme } from 'react-native'

import { darkTokens, lightTokens, type ThemeTokens } from './tokens'

export type AppearancePreference = 'dark' | 'light' | 'system'

const APPEARANCE_KEY = '@basephase/appearancePreference'

type ThemeContextValue = {
  tokens: ThemeTokens
  appearance: AppearancePreference
  setAppearance: (pref: AppearancePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function resolveTokens(
  preference: AppearancePreference,
  systemScheme: 'dark' | 'light' | null | undefined,
): ThemeTokens {
  if (preference === 'light') return lightTokens
  if (preference === 'dark') return darkTokens
  return systemScheme === 'light' ? lightTokens : darkTokens
}

export function BaseThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [appearance, setAppearanceState] = useState<AppearancePreference>('dark')

  useEffect(() => {
    AsyncStorage.getItem(APPEARANCE_KEY)
      .then((stored) => {
        if (stored === 'dark' || stored === 'light' || stored === 'system') {
          setAppearanceState(stored)
        }
      })
      .catch(() => {})
  }, [])

  const setAppearance = useCallback((pref: AppearancePreference) => {
    setAppearanceState(pref)
    AsyncStorage.setItem(APPEARANCE_KEY, pref).catch(() => {})
  }, [])

  const tokens = resolveTokens(appearance, systemScheme)

  const value = useMemo(
    () => ({ tokens, appearance, setAppearance }),
    [tokens, appearance, setAppearance],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTokenContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTokenContext must be used within BaseThemeProvider')
  return ctx
}

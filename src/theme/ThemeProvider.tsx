import React, { createContext, useContext, useState } from 'react'
import type { Theme } from './types'
import { clubhouseTheme } from './clubhouse'

type ThemeContextValue = {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({
  children,
  initial = clubhouseTheme,
}: {
  children: React.ReactNode
  initial?: Theme
}) {
  const [theme, setTheme] = useState(initial)

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
  )
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx.theme
}

export function useSetTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useSetTheme must be used within ThemeProvider')
  return ctx.setTheme
}

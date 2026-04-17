import type { ThemeTokens } from './tokens'
import { useTokenContext } from './ThemeContext'

export function useTheme(): ThemeTokens {
  return useTokenContext().tokens
}

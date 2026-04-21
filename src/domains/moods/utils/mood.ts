import type { MoodCategoryKey } from '@domains/moods/moods.types'

import type { ThemeTokens } from '@/theme/tokens'

const quadrantToToken: Record<MoodCategoryKey, keyof ThemeTokens['colors']['mood']> = {
  'high-pleasant': 'highGood',
  'high-challenging': 'highTough',
  'low-pleasant': 'lowGood',
  'low-challenging': 'lowTough',
}

export function getMoodCategoryColor(theme: ThemeTokens, quadrant: MoodCategoryKey): string {
  return theme.colors.mood[quadrantToToken[quadrant]] || theme.colors.border.default
}

export function getMoodToken(theme: ThemeTokens, quadrant: MoodCategoryKey) {
  const tokenKey = quadrantToToken[quadrant]
  return theme.colors.mood[tokenKey]
}

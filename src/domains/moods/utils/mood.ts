import type { MoodCategoryKey } from '@domains/moods/moods.types'

import type { Theme } from '@/theme/types'

const quadrantToToken: Record<MoodCategoryKey, keyof Theme['semantic']['mood']> = {
  'high-pleasant': 'highGreat',
  'high-challenging': 'highTough',
  'low-pleasant': 'lowGreat',
  'low-challenging': 'lowTough',
}

export function getMoodCategoryColor(theme: Theme, quadrant: MoodCategoryKey): string {
  return getMoodToken(theme, quadrant)?.border ?? theme.semantic.border.default
}

export function getMoodToken(theme: Theme, quadrant: MoodCategoryKey) {
  const tokenKey = quadrantToToken[quadrant]
  return theme.semantic.mood[tokenKey]
}

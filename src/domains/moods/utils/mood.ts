import type { MoodCategoryKey } from '@domains/moods/moods.types'
import { colors } from '@/theme'

export function getMoodCategoryColor(quadrant: MoodCategoryKey): string {
  switch (quadrant) {
    case 'high-pleasant':
      return '#F59E0B'
    case 'high-challenging':
      return '#DC2626'
    case 'low-pleasant':
      return '#3B82F6'
    case 'low-challenging':
      return '#9CA3AF'
    default:
      return colors.stone.DEFAULT
  }
}

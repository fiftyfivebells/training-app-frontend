import { MoodCategoryKey } from './moods.types'

export const moodsKeys = {
  all: ['moods'] as const,
}

export interface MoodCategory {
  key: MoodCategoryKey
  title: string
  description: string
}

export const moodCategories: MoodCategory[] = [
  {
    key: 'high-challenging',
    title: 'High Energy • Challenging',
    description: 'Working hard through the struggle.',
  },
  {
    key: 'high-pleasant',
    title: 'High Energy • Pleasant',
    description: 'Pumped up and thriving.',
  },
  {
    key: 'low-challenging',
    title: 'Low Energy • Challenging',
    description: 'Drained and needing recovery.',
  },
  {
    key: 'low-pleasant',
    title: 'Low Energy • Pleasant',
    description: 'Calm, steady, and optimistic.',
  },
]

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

export const DIM_FILL: Record<MoodCategoryKey, string> = {
  'high-pleasant':    '#1C1E10',
  'high-challenging': '#1E1510',
  'low-pleasant':     '#101C1E',
  'low-challenging':  '#16101E',
}

export const QUADRANT_LABELS: Record<MoodCategoryKey, string> = {
  'high-pleasant':    'HIGH · GOOD',
  'high-challenging': 'HIGH · TOUGH',
  'low-pleasant':     'LOW · GOOD',
  'low-challenging':  'LOW · TOUGH',
}

export const QUADRANT_COLOR_KEY: Record<MoodCategoryKey, 'highGood' | 'highTough' | 'lowGood' | 'lowTough'> = {
  'high-pleasant':    'highGood',
  'high-challenging': 'highTough',
  'low-pleasant':     'lowGood',
  'low-challenging':  'lowTough',
}


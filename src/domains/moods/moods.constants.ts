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

// Log run form — quadrant descriptors
export const QUADRANT_DESCRIPTOR: Record<MoodCategoryKey, string> = {
  'high-pleasant':    'Energized',
  'high-challenging': 'Challenging',
  'low-pleasant':     'Relaxed',
  'low-challenging':  'Heavy',
}

// Hex picker canvas geometry
export const R = 32
export const R_SELECTED = R + 3
export const CANVAS_W = 618
export const CANVAS_H = 470
export const CANVAS_MID_X = CANVAS_W / 2
export const CANVAS_MID_Y = CANVAS_H / 2
export const SCALE_X = (CANVAS_W / 2 - R - 20) / 6   // ≈ 42.8
export const SCALE_Y = (CANVAS_H / 2 - R - 20) / 6   // ≈ 30.5

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

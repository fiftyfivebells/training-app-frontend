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
export const R = 48
export const R_SELECTED = R + 4
export const CANVAS_W = 1200
export const CANVAS_H = 1000
export const CANVAS_MID_X = CANVAS_W / 2
export const CANVAS_MID_Y = CANVAS_H / 2
export const SCALE_X = (CANVAS_W / 2 - R - 20) / 6
export const SCALE_Y = (CANVAS_H / 2 - R - 20) / 6

// Cluster layout - 3-4-3 per quadrant
export const COL = 120
export const ROW = 100

export const CLUSTER_CENTERS: Record<MoodCategoryKey, { x: number; y: number }> = {
  'high-challenging': { x: 300, y: 250 },
  'high-pleasant':    { x: 900, y: 250 },
  'low-challenging':  { x: 300, y: 750 },
  'low-pleasant':     { x: 900, y: 750 },
}

export const CLUSTER_OFFSETS: { dx: number; dy: number }[] = [
  { dx: -COL,     dy: -ROW }, // 0
  { dx: 0,        dy: -ROW }, // 1
  { dx: COL,      dy: -ROW }, // 2
  { dx: -1.5*COL, dy: 0 },    // 3
  { dx: -0.5*COL, dy: 0 },    // 4
  { dx: 0.5*COL,  dy: 0 },    // 5
  { dx: 1.5*COL,  dy: 0 },    // 6
  { dx: -COL,     dy: ROW },  // 7
  { dx: 0,        dy: ROW },  // 8
  { dx: COL,      dy: ROW },  // 9
]

export const SEVERITY_ORDER: Record<MoodCategoryKey, number[]> = {
  'high-pleasant':    [2, 6, 1, 9, 5, 0, 8, 4, 3, 7],
  'high-challenging': [0, 3, 1, 7, 4, 2, 8, 5, 6, 9],
  'low-pleasant':     [9, 6, 8, 2, 5, 7, 1, 4, 0, 3],
  'low-challenging':  [7, 3, 8, 0, 4, 1, 5, 9, 2, 6],
}

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

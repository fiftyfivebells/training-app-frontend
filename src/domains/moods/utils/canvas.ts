import { Skia } from '@shopify/react-native-skia'

import type { Mood, MoodCategoryKey } from '../moods.types'
import {
  CANVAS_MID_X,
  CANVAS_MID_Y,
  CLUSTER_CENTERS,
  CLUSTER_OFFSETS,
  SCALE_X,
  SCALE_Y,
  SEVERITY_ORDER,
} from '../moods.constants'

export type Cell = { x: number; y: number; mood: Mood }

/**
 * Maps moods to a fixed 3-4-3 grid per quadrant.
 * Sorting by intensity ensures severe feelings are in the corners.
 */
export function layoutMoods(moods: Mood[]): Cell[] {
  // Group by quadrant
  const groups: Record<MoodCategoryKey, Mood[]> = {
    'high-pleasant': [],
    'high-challenging': [],
    'low-pleasant': [],
    'low-challenging': [],
  }

  for (const m of moods) {
    groups[m.quadrant].push(m)
  }

  const cells: Cell[] = []

  // Layout each quadrant
  for (const qKey of Object.keys(groups) as MoodCategoryKey[]) {
    const qMoods = groups[qKey]
    const center = CLUSTER_CENTERS[qKey]
    const order = SEVERITY_ORDER[qKey]

    // Sort by intensity (distance from origin) DESC
    const sorted = [...qMoods].sort((a, b) => {
      const distA = a.energyLevel ** 2 + a.experienceQuality ** 2
      const distB = b.energyLevel ** 2 + b.experienceQuality ** 2
      return distB - distA
    })

    // Map to positions 0-9
    sorted.forEach((mood, i) => {
      if (i >= 10) return // Only 10 slots per cluster in design
      const posIdx = order[i]
      const offset = CLUSTER_OFFSETS[posIdx]
      cells.push({
        x: center.x + offset.dx,
        y: center.y + offset.dy,
        mood,
      })
    })
  }

  return cells
}

export function moodToCanvas(mood: Mood): { x: number; y: number } {
  return {
    x: CANVAS_MID_X + mood.energyLevel * SCALE_X,
    y: CANVAS_MID_Y - mood.experienceQuality * SCALE_Y,
  }
}

export function makeHexPath(cx: number, cy: number, r: number) {
  const path = Skia.Path.Make()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i)
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) path.moveTo(x, y)
    else path.lineTo(x, y)
  }
  path.close()
  return path
}

export function makeLinePath(x1: number, y1: number, x2: number, y2: number) {
  const path = Skia.Path.Make()
  path.moveTo(x1, y1)
  path.lineTo(x2, y2)
  return path
}

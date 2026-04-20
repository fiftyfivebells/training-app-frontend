import { Skia } from '@shopify/react-native-skia'

import type { Mood } from '../moods.types'
import { CANVAS_MID_X, CANVAS_MID_Y, SCALE_X, SCALE_Y } from '../moods.constants'

export type Cell = { x: number; y: number; mood: Mood }

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

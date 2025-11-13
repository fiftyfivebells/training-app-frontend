import { MoodResponse } from './api/moodsApi'

export type EnergyLevel = 'high' | 'low'
export type ExperienceQuality = 'pleasant' | 'challenging'

export type MoodCategoryKey =
  | 'high-pleasant'
  | 'high-challenging'
  | 'low-pleasant'
  | 'low-challenging'

export type Mood = {
  id: number
  label: string
  quadrant: MoodCategoryKey
  energyLevel: number
  experienceQuality: number
}

export function moodResponseToMood(mr: MoodResponse): Mood {
  return {
    id: mr.id,
    label: mr.label,
    quadrant: deriveMoodQuadrant(mr.energyLevel, mr.experienceQuality),
    energyLevel: mr.energyLevel,
    experienceQuality: mr.experienceQuality,
  }
}

function deriveMoodQuadrant(
  energyLevel: number,
  experienceQuality: number,
): MoodCategoryKey {
  if (energyLevel > 0 && experienceQuality > 0) return 'high-pleasant'
  else if (energyLevel < 0 && experienceQuality > 0) return 'low-pleasant'
  else if (energyLevel > 0 && experienceQuality < 0) return 'high-challenging'
  else if (energyLevel < 0 && experienceQuality < 0) return 'low-challenging'

  return 'high-pleasant' // matches api, defaults to high-pleasant, but should never reach this
}

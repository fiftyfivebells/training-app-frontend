import type { BlockType } from '../blocks.types'

export type BlockTypeConfig = {
  // New design system fields
  label: string
  accentColor: string
  tagline: string
  bestFor: string
  focus: string
  typicalRange: string
  defaultWeeks: number
  // Legacy fields — kept for compatibility where needed, but with primitive types
  description: string
  completionMessage: string
  recommendedWeeks: [number, number]
}

export const BLOCK_TYPE_CONFIG: Record<BlockType, BlockTypeConfig> = {
  base_building: {
    label: 'Base Building',
    accentColor: '#B8D44A',
    tagline: 'Build your aerobic foundation',
    bestFor: 'Early season, returning from a break, building volume',
    focus: 'High easy volume, long runs, minimal intensity',
    typicalRange: '4–8 weeks',
    defaultWeeks: 6,
    description: 'Patience & Foundation',
    completionMessage: "You've built the foundation. Now it's time to build on it.",
    recommendedWeeks: [4, 12],
  },
  race_specific: {
    label: 'Race Specific',
    accentColor: '#E07840',
    tagline: 'Add quality to your fitness',
    bestFor: 'After base building, building toward a race',
    focus: 'Tempo and speed work alongside easy volume',
    typicalRange: '3–6 weeks',
    defaultWeeks: 4,
    description: 'Structured Suffering',
    completionMessage: 'The hard work is done. You earned every one of those miles.',
    recommendedWeeks: [4, 8],
  },
  peaking: {
    label: 'Peaking',
    accentColor: '#C87941',
    tagline: 'Sharpen for race day',
    bestFor: 'Final phase before a target race',
    focus: 'Race-specific workouts, taper',
    typicalRange: '2–4 weeks',
    defaultWeeks: 3,
    description: 'Sharpen the Edge',
    completionMessage: "You're ready. Trust the work you've put in.",
    recommendedWeeks: [3, 6],
  },
  tapering: {
    label: 'Taper',
    accentColor: '#7B9EB0',
    tagline: 'Less is more',
    bestFor: 'Final 1–3 weeks before a race',
    focus: 'Reduced volume, race-pace strides',
    typicalRange: '1–3 weeks',
    defaultWeeks: 2,
    description: 'Less is More',
    completionMessage: 'The work is done. Time to race.',
    recommendedWeeks: [1, 3],
  },
  recovery: {
    label: 'Recovery',
    accentColor: '#4AC4D4',
    tagline: 'Let your body absorb the work',
    bestFor: 'After a race, after a hard block, when fatigued',
    focus: 'Easy running only, reduced volume',
    typicalRange: '1–3 weeks',
    defaultWeeks: 2,
    description: 'Rest Is Training',
    completionMessage: 'Well rested and ready. The body needed this.',
    recommendedWeeks: [1, 3],
  },
  off_season: {
    label: 'Off Season',
    accentColor: '#9B60B8',
    tagline: 'Rest and recharge',
    bestFor: 'End of season, mental reset, extended recovery',
    focus: 'Unstructured running, cross training, rest',
    typicalRange: '2–6 weeks',
    defaultWeeks: 4,
    description: 'Run for the Joy of It',
    completionMessage: "Another season in the books. Here's to the next one.",
    recommendedWeeks: [4, 12],
  },
}

export const BLOCK_TYPE_ORDER: BlockType[] = [
  'base_building',
  'race_specific',
  'peaking',
  'tapering',
  'recovery',
  'off_season',
]

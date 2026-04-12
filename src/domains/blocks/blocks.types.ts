import type { components } from '@/generated/api/types'

import { autumnRoadTheme } from '@/theme/themes/autumn'
import { clubhouseTheme } from '@/theme/themes/clubhouse'
import { fallTheme } from '@/theme/themes/fall'
import { racebibTheme } from '@/theme/themes/racebib'
import { verdeModernTheme } from '@/theme/themes/verdeModern'
import type { Theme } from '@/theme/types'

export type BlockResponse = components['schemas']['BlockResponse']
export type CreateBlockRequest = components['schemas']['CreateBlockRequest']
export type AffirmationResponse = components['schemas']['AffirmationResponse']

export type BlockType =
  | 'base_building'
  | 'race_specific'
  | 'peaking'
  | 'tapering'
  | 'recovery'
  | 'off_season'

export type BlockStatus = 'active' | 'completed' | 'expired'

export type Block = {
  id: string
  blockType: BlockType
  name: string
  startDate: string
  endDate: string
  status: BlockStatus
  completedAt?: string
  notes?: string
}

export type BlockTypeConfig = {
  label: string
  description: string
  accentColor: string
  theme: Theme
  completionMessage: string
  recommendedWeeks: [number, number]
}

export const BLOCK_TYPE_CONFIG: Record<BlockType, BlockTypeConfig> = {
  base_building: {
    label: 'Base Building',
    description: 'Patience & Foundation',
    accentColor: '#4FAF8F',
    theme: verdeModernTheme,
    completionMessage: "You've built the foundation. Now it's time to build on it.",
    recommendedWeeks: [4, 12],
  },
  race_specific: {
    label: 'Race Specific',
    description: 'Structured Suffering',
    accentColor: '#C0392B',
    theme: racebibTheme,
    completionMessage: "The hard work is done. You earned every one of those miles.",
    recommendedWeeks: [4, 8],
  },
  peaking: {
    label: 'Peaking',
    description: 'Sharpen the Edge',
    accentColor: '#D2691E',
    theme: autumnRoadTheme,
    completionMessage: "You're ready. Trust the work you've put in.",
    recommendedWeeks: [3, 6],
  },
  tapering: {
    label: 'Taper',
    description: 'Less is More',
    accentColor: '#7B9EB0',
    theme: autumnRoadTheme,
    completionMessage: 'The work is done. Time to race.',
    recommendedWeeks: [1, 3],
  },
  recovery: {
    label: 'Recovery',
    description: 'Rest Is Training',
    accentColor: '#7B9E87',
    theme: fallTheme,
    completionMessage: "Well rested and ready. The body needed this.",
    recommendedWeeks: [1, 3],
  },
  off_season: {
    label: 'Off Season',
    description: 'Run for the Joy of It',
    accentColor: '#8B7355',
    theme: clubhouseTheme,
    completionMessage: "Another season in the books. Here's to the next one.",
    recommendedWeeks: [4, 12],
  },
}

const VALID_BLOCK_TYPES = new Set<string>([
  'base_building',
  'race_specific',
  'peaking',
  'tapering',
  'recovery',
  'off_season',
])
const VALID_STATUSES = new Set<string>(['active', 'completed', 'expired'])

export function blockResponseToBlock(r: BlockResponse): Block {
  if (!VALID_BLOCK_TYPES.has(r.blockType)) {
    throw new Error(`Unknown block type from API: ${r.blockType}`)
  }
  if (!VALID_STATUSES.has(r.status)) {
    throw new Error(`Unknown block status from API: ${r.status}`)
  }
  return {
    id: r.id,
    blockType: r.blockType as BlockType,
    name: r.name,
    startDate: r.startDate,
    endDate: r.endDate,
    status: r.status as BlockStatus,
    completedAt: r.completedAt,
    notes: r.notes,
  }
}

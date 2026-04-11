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
  | 'BaseBuilding'
  | 'BuildIntensity'
  | 'PeakRacePrep'
  | 'Recovery'
  | 'OffSeason'

export type BlockStatus = 'active' | 'completed'

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
  BaseBuilding: {
    label: 'Base Building',
    description: 'Patience & Foundation',
    accentColor: '#4FAF8F',
    theme: verdeModernTheme,
    completionMessage: "You've built the foundation. Now it's time to build on it.",
    recommendedWeeks: [4, 12],
  },
  BuildIntensity: {
    label: 'Build Intensity',
    description: 'Structured Suffering',
    accentColor: '#C0392B',
    theme: racebibTheme,
    completionMessage: "The hard work is done. You earned every one of those miles.",
    recommendedWeeks: [4, 8],
  },
  PeakRacePrep: {
    label: 'Peak Race Prep',
    description: 'Sharpen the Edge',
    accentColor: '#D2691E',
    theme: autumnRoadTheme,
    completionMessage: "You're ready. Trust the work you've put in.",
    recommendedWeeks: [3, 6],
  },
  Recovery: {
    label: 'Recovery',
    description: 'Rest Is Training',
    accentColor: '#7B9E87',
    theme: fallTheme,
    completionMessage: "Well rested and ready. The body needed this.",
    recommendedWeeks: [1, 3],
  },
  OffSeason: {
    label: 'Off Season',
    description: 'Run for the Joy of It',
    accentColor: '#8B7355',
    theme: clubhouseTheme,
    completionMessage: "Another season in the books. Here's to the next one.",
    recommendedWeeks: [4, 12],
  },
}

export function blockResponseToBlock(r: BlockResponse): Block {
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

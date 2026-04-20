import type { components } from '@/generated/api/types'

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

// Re-exported from constants/blockTypes.ts for backward compatibility
export type { BlockTypeConfig } from './constants/blockTypes'
export { BLOCK_TYPE_CONFIG } from './constants/blockTypes'

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

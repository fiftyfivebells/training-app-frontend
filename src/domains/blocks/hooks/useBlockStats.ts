import { useMemo } from 'react'

import { useBlockRuns } from './useBlockRuns'

export interface BlockStats {
  runCount: number
  totalDistanceMeters: number
  avgRpe: number
}

export function useBlockStats(blockId: string): { data: BlockStats; isLoading: boolean } {
  const { data: runs, isLoading } = useBlockRuns(blockId)
  const data = useMemo(
    () => ({
      runCount: runs.length,
      totalDistanceMeters: runs.reduce((s, r) => s + r.distanceMeters, 0),
      avgRpe: runs.length
        ? runs.reduce((s, r) => s + r.exertionRating, 0) / runs.length
        : 0,
    }),
    [runs],
  )
  return { data, isLoading }
}

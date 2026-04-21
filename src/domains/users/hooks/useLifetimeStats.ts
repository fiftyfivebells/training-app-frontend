import { useMemo } from 'react'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { useCompletedBlocks } from '@/domains/blocks/hooks/useCompletedBlocks'

export function useLifetimeStats() {
  const { data: runs = [], isLoading: runsLoading } = useRuns()
  const { data: blocks = [], isLoading: blocksLoading } = useCompletedBlocks()

  const stats = useMemo(() => {
    return {
      runCount: runs.length,
      totalDistanceMeters: runs.reduce((sum, r) => sum + r.distanceMeters, 0),
      blockCount: blocks.length,
    }
  }, [runs, blocks])

  return {
    data: stats,
    isLoading: runsLoading || blocksLoading,
  }
}

import { useMemo } from 'react'

import type { RunResponse } from '@/domains/runs/api/runsApi'
import { useRuns } from '@/domains/runs/hooks/useRuns'

export function useBlockRuns(blockId: string): { data: RunResponse[]; isLoading: boolean } {
  const { data: runs = [], isLoading } = useRuns()
  const data = useMemo(
    () =>
      runs
        .filter((r) => r.blockId === blockId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [runs, blockId],
  )
  return { data, isLoading }
}

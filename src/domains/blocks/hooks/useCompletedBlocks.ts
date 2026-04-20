import { useMemo } from 'react'

import { useBlocks } from './useBlocks'
import type { Block } from '../blocks.types'

export function useCompletedBlocks(): { data: Block[]; isLoading: boolean } {
  const { data: blocks = [], isLoading } = useBlocks()
  const data = useMemo(
    () =>
      blocks
        .filter((b) => b.status === 'completed')
        .sort((a, b) => b.endDate.localeCompare(a.endDate)),
    [blocks],
  )
  return { data, isLoading }
}

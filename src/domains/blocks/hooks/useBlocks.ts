import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { blocksClient } from '../api/blocksApi'
import { blocksKeys } from '../blocks.constants'
import { Block, blockResponseToBlock } from '../blocks.types'

export function useBlocks(options?: Omit<UseQueryOptions<Block[]>, 'queryKey' | 'queryFn'>) {
  return useQuery<Block[]>({
    queryKey: blocksKeys.list(),
    queryFn: async () => {
      const responses = await blocksClient.getUserBlocks()
      return responses.map(blockResponseToBlock)
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

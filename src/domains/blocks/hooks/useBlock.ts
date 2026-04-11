import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { blocksClient } from '../api/blocksApi'
import { blocksKeys } from '../blocks.constants'
import { Block, blockResponseToBlock } from '../blocks.types'

export function useBlock(
  blockId: string,
  options?: Omit<UseQueryOptions<Block>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Block>({
    queryKey: blocksKeys.detail(blockId),
    queryFn: async () => {
      const response = await blocksClient.getBlock(blockId)
      return blockResponseToBlock(response)
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

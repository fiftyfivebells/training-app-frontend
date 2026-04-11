import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/error'

import { blocksClient } from '../api/blocksApi'
import { blocksKeys } from '../blocks.constants'
import { Block, blockResponseToBlock } from '../blocks.types'

export function useActiveBlock(
  options?: Omit<UseQueryOptions<Block | null>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Block | null>({
    queryKey: blocksKeys.active(),
    queryFn: async () => {
      try {
        const response = await blocksClient.getActiveBlock()
        return blockResponseToBlock(response)
      } catch (error) {
        if (error instanceof ApiError && error.isNotFound) {
          return null
        }
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

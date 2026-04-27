import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/error'

import { blocksClient } from '../api/blocksApi'
import { blocksKeys } from '../blocks.constants'
import { Block, blockResponseToBlock } from '../blocks.types'

export function useCompleteBlock(
  options?: UseMutationOptions<Block, ApiError, string>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (blockId: string) => {
      const response = await blocksClient.completeBlock(blockId)
      return blockResponseToBlock(response)
    },
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: blocksKeys.all })
      if (options?.onSuccess) {
        return options.onSuccess(data, variables, context, mutation)
      }
    },
  })
}

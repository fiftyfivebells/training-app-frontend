import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/error'

import { blocksClient } from '../api/blocksApi'
import { blocksKeys } from '../blocks.constants'
import { Block, blockResponseToBlock, CreateBlockRequest } from '../blocks.types'

export function useCreateBlock(
  options?: UseMutationOptions<Block, ApiError, CreateBlockRequest>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreateBlockRequest) => {
      const response = await blocksClient.createBlock(body)
      return blockResponseToBlock(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blocksKeys.all })
    },
    ...options,
  })
}

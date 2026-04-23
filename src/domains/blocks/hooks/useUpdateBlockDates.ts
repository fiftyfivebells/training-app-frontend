import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/error'

import { blocksClient } from '../api/blocksApi'
import { blocksKeys } from '../blocks.constants'
import { Block, blockResponseToBlock, UpdateBlockDatesRequest } from '../blocks.types'

type UpdateParams = {
  id: string
  body: UpdateBlockDatesRequest
}

export function useUpdateBlockDates(
  options?: UseMutationOptions<Block, ApiError, UpdateParams>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, body }: UpdateParams) => {
      const response = await blocksClient.updateBlockDates(id, body)
      return blockResponseToBlock(response)
    },
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: blocksKeys.all })
      if (options?.onSuccess) {
        return options.onSuccess(data, variables, context)
      }
    },
  })
}

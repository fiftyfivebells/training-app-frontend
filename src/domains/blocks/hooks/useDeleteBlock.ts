import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/error'

import { blocksClient } from '../api/blocksApi'
import { blocksKeys } from '../blocks.constants'

export function useDeleteBlock(options?: UseMutationOptions<void, ApiError, string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (blockId: string) => blocksClient.deleteBlock(blockId),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.removeQueries({ queryKey: blocksKeys.detail(variables) })
      await queryClient.invalidateQueries({ queryKey: blocksKeys.all })
      if (options?.onSuccess) {
        return options.onSuccess(data, variables, context, mutation)
      }
    },
  })
}

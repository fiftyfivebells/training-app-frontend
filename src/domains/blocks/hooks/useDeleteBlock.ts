import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/error'

import { blocksClient } from '../api/blocksApi'
import { blocksKeys } from '../blocks.constants'

export function useDeleteBlock(options?: UseMutationOptions<void, ApiError, string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (blockId: string) => blocksClient.deleteBlock(blockId),
    onSuccess: (_, blockId) => {
      queryClient.removeQueries({ queryKey: blocksKeys.detail(blockId) })
      queryClient.invalidateQueries({ queryKey: blocksKeys.all })
    },
    ...options,
  })
}

import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/error'

import { runsClient } from '../api/runsApi'
import { runsKeys } from '../constants'

export function useDeleteRun(options?: UseMutationOptions<void, ApiError, string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (runId: string) => runsClient.deleteRun(runId),
    onSuccess: (_, runId) => {
      queryClient.invalidateQueries({ queryKey: runsKeys.lists() })
      queryClient.removeQueries({ queryKey: runsKeys.detail(runId) })
    },
    ...options,
  })
}

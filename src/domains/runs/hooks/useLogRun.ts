import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/error'

import { LogRunRequest, RunResponse, runsClient } from '../api/runsApi'
import { runsKeys } from '../constants'

export function useLogRun(
  options?: UseMutationOptions<RunResponse, ApiError, LogRunRequest>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: LogRunRequest) => runsClient.logRun(body),
    onSuccess: (newRun, vars, ctx, mutation) => {
      queryClient.setQueryData(runsKeys.detail(newRun.id), newRun)
      queryClient.invalidateQueries({
        queryKey: runsKeys.all,
        exact: false,
      })
      options?.onSuccess?.(newRun, vars, ctx, mutation)
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { CompletePendingRunRequest, RunResponse, runsClient } from '../api/runsApi'
import { runsKeys } from '../constants'

export function useCompletePendingRun() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CompletePendingRunRequest }) =>
      runsClient.completePendingRun(id, body),
    onSuccess: (newRun: RunResponse) => {
      queryClient.setQueryData(runsKeys.detail(newRun.id), newRun)
      queryClient.invalidateQueries({ queryKey: runsKeys.all, exact: false })
      queryClient.invalidateQueries({ queryKey: runsKeys.pending() })
    },
  })
}

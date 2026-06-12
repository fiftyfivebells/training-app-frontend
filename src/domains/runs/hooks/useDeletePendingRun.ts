import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { PendingRunResponse } from '../api/runsApi'
import { runsClient } from '../api/runsApi'
import { runsKeys } from '../constants'

export function useDeletePendingRun() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => runsClient.deletePendingRun(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: runsKeys.pending() })
      const previous = queryClient.getQueryData<PendingRunResponse[]>(runsKeys.pending())
      queryClient.setQueryData<PendingRunResponse[]>(
        runsKeys.pending(),
        (old) => old?.filter((r) => r.id !== id) ?? [],
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(runsKeys.pending(), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: runsKeys.pending() })
    },
  })
}

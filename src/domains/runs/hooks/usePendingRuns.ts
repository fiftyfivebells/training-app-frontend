import { useQuery } from '@tanstack/react-query'

import { PendingRunResponse, runsClient } from '../api/runsApi'
import { runsKeys } from '../constants'

export function usePendingRuns() {
  return useQuery<PendingRunResponse[]>({
    queryKey: runsKeys.pending(),
    queryFn: () => runsClient.getPendingRuns(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

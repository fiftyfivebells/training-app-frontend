import { UseBaseQueryOptions, useQuery } from '@tanstack/react-query'

import { RunResponse, runsClient } from '../api/runsApi'
import { runsKeys } from '../constants'

export function useRun(
  runId: string,
  options?: Omit<UseBaseQueryOptions<RunResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<RunResponse>({
    queryKey: runsKeys.detail(runId),
    queryFn: () => runsClient.getRun(runId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

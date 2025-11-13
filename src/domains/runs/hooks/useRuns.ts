import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { RunResponse, runsClient } from '../api/runsApi'
import { runsKeys } from '../constants'

export function useRuns(
  filters?: {
    startDate?: string
    endDate?: string
    moodIds?: string[]
    moodCategories?: string[]
  },
  options?: Omit<UseQueryOptions<RunResponse[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<RunResponse[]>({
    queryKey: runsKeys.list(filters),
    queryFn: () =>
      runsClient.getUserRuns(
        filters?.startDate,
        filters?.endDate,
        filters?.moodIds,
        filters?.moodCategories,
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes TODO: maybe maybe this a config/constant value
    ...options,
  })
}

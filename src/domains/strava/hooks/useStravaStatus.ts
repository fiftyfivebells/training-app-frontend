import { useQuery } from '@tanstack/react-query'

import { stravaClient, StravaStatusResponse } from '../api/stravaClient'
import { stravaKeys } from '../strava.constants'

export function useStravaStatus() {
  return useQuery<StravaStatusResponse>({
    queryKey: stravaKeys.status(),
    queryFn: () => stravaClient.getStatus(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

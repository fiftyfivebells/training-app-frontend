import { useMutation, useQueryClient } from '@tanstack/react-query'

import { stravaClient } from '../api/stravaClient'
import { stravaKeys } from '../strava.constants'

export function useStravaDisconnect() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => stravaClient.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stravaKeys.status() })
    },
  })
}

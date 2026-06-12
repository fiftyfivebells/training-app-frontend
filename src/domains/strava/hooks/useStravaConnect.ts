import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { stravaClient } from '../api/stravaClient'
import { stravaKeys, STRAVA_ERROR_MESSAGES } from '../strava.constants'

export function useStravaConnect() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const redirectUrl = Linking.createURL('profile')
      const { authorizeUrl } = await stravaClient.initiateConnect(redirectUrl)
      const result = await WebBrowser.openAuthSessionAsync(authorizeUrl, redirectUrl)

      if (result.type !== 'success') {
        throw new Error('cancelled')
      }

      const url = new URL(result.url)
      const status = url.searchParams.get('status')
      const reason = url.searchParams.get('reason') ?? 'unknown_error'

      if (status !== 'connected') {
        const message = STRAVA_ERROR_MESSAGES[reason] ?? 'Something went wrong. Please try again.'
        throw new Error(message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stravaKeys.status() })
    },
  })
}

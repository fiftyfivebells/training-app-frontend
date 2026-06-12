import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

import { authClient } from '../api/authClient'

export function useStravaAuth() {
  const signInWithStrava = async (): Promise<string> => {
    const { authorizeUrl } = await authClient.getStravaAuthorizeUrl()
    console.log('Strava authorizeUrl:', authorizeUrl)
    const redirectUri = Linking.createURL('strava-auth')

    const result = await WebBrowser.openAuthSessionAsync(authorizeUrl, redirectUri)

    if (result.type !== 'success') throw new Error('cancelled')

    const url = new URL(result.url)
    const code = url.searchParams.get('code')
    if (!code) throw new Error('No authorization code returned from Strava')

    return code
  }

  return { signInWithStrava }
}

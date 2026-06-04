import Constants from 'expo-constants'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/mobile/authorize'

export function useStravaAuth() {
  const signInWithStrava = async (): Promise<string> => {
    const clientId = Constants.expoConfig?.extra?.stravaClientId as string
    const redirectUri = Linking.createURL('strava-auth')

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      approval_prompt: 'auto',
      scope: 'read,activity:read_all',
    })

    const result = await WebBrowser.openAuthSessionAsync(
      `${STRAVA_AUTH_URL}?${params.toString()}`,
      redirectUri
    )

    if (result.type !== 'success') throw new Error('cancelled')

    const url = new URL(result.url)
    const code = url.searchParams.get('code')
    if (!code) throw new Error('No authorization code returned from Strava')

    return code
  }

  return { signInWithStrava }
}

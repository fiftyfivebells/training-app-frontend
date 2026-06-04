import { GoogleSignin } from '@react-native-google-signin/google-signin'
import Constants from 'expo-constants'

GoogleSignin.configure({
  webClientId: Constants.expoConfig?.extra?.googleOAuthClientIdWeb as string,
  scopes: ['profile', 'email'],
})

// Encapsulates the Google OAuth flow so screens stay library-agnostic.
// Swap the implementation here when switching between dev and production SDKs.
export function useGoogleAuth() {
  const signInWithGoogle = async (): Promise<string> => {
    await GoogleSignin.hasPlayServices()

    const response = await GoogleSignin.signIn()
    if (response.type === 'cancelled') throw new Error('cancelled')

    const { idToken } = await GoogleSignin.getTokens()
    if (!idToken) throw new Error('No ID token returned from Google')

    return idToken
  }

  return { signInWithGoogle, isReady: true }
}

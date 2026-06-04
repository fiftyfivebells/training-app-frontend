import { useAlert } from '@components/ui'

import { useAuthContext } from '../context/AuthContext'
import { useGoogleAuth } from './useGoogleAuth'

export function useGoogleSignIn() {
  const { loginWithGoogle } = useAuthContext()
  const { signInWithGoogle, isReady } = useGoogleAuth()
  const { alert } = useAlert()

  const handlePress = async () => {
    try {
      const idToken = await signInWithGoogle()
      await loginWithGoogle(idToken)
    } catch (err: any) {
      if (err?.message === 'cancelled') return
      alert('Sign In Failed', err?.message || 'Something went wrong. Please try again.')
    }
  }

  return { handlePress, isReady }
}

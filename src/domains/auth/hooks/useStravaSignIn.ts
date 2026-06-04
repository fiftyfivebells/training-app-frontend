import { useAlert } from '@components/ui'

import { useAuthContext } from '../context/AuthContext'
import { useStravaAuth } from './useStravaAuth'

export function useStravaSignIn() {
  const { loginWithStrava } = useAuthContext()
  const { signInWithStrava } = useStravaAuth()
  const { alert } = useAlert()

  const handlePress = async () => {
    try {
      const code = await signInWithStrava()
      await loginWithStrava(code)
    } catch (err: any) {
      if (err?.message === 'cancelled') return
      alert('Sign In Failed', err?.message || 'Something went wrong. Please try again.')
    }
  }

  return { handlePress }
}

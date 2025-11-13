import { getNetworkStateAsync } from 'expo-network'
import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'

import { useAuthContext } from '../context/AuthContext'

const CHECK_SESSION_INTERVAL_MS = 60000 // 60 seconds. TODO: move this somewhere central?

export function useSessionChecker() {
  const { isAuthenticated, refetchUser, logout } = useAuthContext()

  const lastCheck = useRef<number>(0)

  useEffect(() => {
    if (!isAuthenticated) return

    async function validateSession() {
      const now = Date.now()

      if (now - lastCheck.current < CHECK_SESSION_INTERVAL_MS) return

      lastCheck.current = now

      try {
        const state = await getNetworkStateAsync()
        if (!state.isConnected) return // if the session is offline, don't check anything

        await refetchUser()
      } catch (err: any) {
        if (err?.status === 401 || err?.response?.status === 401) {
          await logout()
        }
      }
    }

    validateSession()

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        validateSession()
      }
    })

    const interval = setInterval(validateSession, CHECK_SESSION_INTERVAL_MS)

    return () => {
      sub.remove()
      clearInterval(interval)
    }
  }, [isAuthenticated, refetchUser, logout])
}

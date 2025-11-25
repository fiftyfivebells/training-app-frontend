import { tokenStorage } from '@/domains/auth/utils/tokenStorage'
import { notifyLogout } from '@/domains/auth/context/authEvents'

let refreshPromise: Promise<string | null> | null = null

type RefreshFunction = (refreshToken: string | null) => Promise<{
  accessToken: string
  refreshToken?: string
}>

let _refreshFn: RefreshFunction | null = null

export function configureRefreshFunction(fn: RefreshFunction) {
  _refreshFn = fn
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!_refreshFn) {
    throw new Error('Refresh function not configured')
  }

  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken()
      const result = await _refreshFn(refreshToken)
      await tokenStorage.setAccessToken(result.accessToken)
      if (result.refreshToken) {
        await tokenStorage.setRefreshToken(result.refreshToken)
      }

      return result.accessToken
    } catch (err) {
      notifyLogout()
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

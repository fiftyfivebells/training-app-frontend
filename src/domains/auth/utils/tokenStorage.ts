import {
  deleteSecureValue,
  getSecureValue,
  setSecureValue,
} from '@lib/storage/secureStorage'
import { Platform } from 'react-native'

const ACCESS_TOKEN_KEY = 'auth.accessToken'
const REFRESH_TOKEN_KEY = 'auth.refreshToken'

export const tokenStorage = {
  async setAccessToken(accessToken: string): Promise<void> {
    await setSecureValue(ACCESS_TOKEN_KEY, accessToken)
  },
  async setRefreshToken(refreshToken: string): Promise<void> {
    if (Platform.OS === 'web') return
    await setSecureValue(REFRESH_TOKEN_KEY, refreshToken)
  },
  async getAccessToken(): Promise<string | null> {
    return await getSecureValue(ACCESS_TOKEN_KEY)
  },
  async getRefreshToken(): Promise<string | null> {
    if (Platform.OS === 'web') return null
    return await getSecureValue(REFRESH_TOKEN_KEY)
  },
  async deleteAccessToken(): Promise<void> {
    await deleteSecureValue(ACCESS_TOKEN_KEY)
  },
  async deleteRefreshToken(): Promise<void> {
    if (Platform.OS === 'web') return
    await deleteSecureValue(REFRESH_TOKEN_KEY)
  },
}

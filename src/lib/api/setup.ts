import { authClient } from '@/domains/auth/api/authClient'
import { configureRefreshFunction } from './refreshManager'
import { Platform } from 'react-native'

configureRefreshFunction(async (refreshToken) => {
  if (Platform.OS === 'web') {
    return authClient.refreshWeb()
  } else {
    if (refreshToken == null) {
      throw new Error('Missing refresh token')
    }
    return authClient.refreshMobile({ refreshToken })
  }
})

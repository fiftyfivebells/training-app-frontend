import { ApiError } from '@lib/api/error'
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'

import { authClient } from '../api/authClient'
import { tokenStorage } from '../utils/tokenStorage'

export function useLogout(options?: UseMutationOptions<void, ApiError>) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      const refreshToken = await tokenStorage.getRefreshToken()
      try {
        await authClient.logout(refreshToken)
      } catch {
        // Best-effort: always clear local session even if the API call fails
      }
      await tokenStorage.deleteAccessToken()
      await tokenStorage.deleteRefreshToken()
    },
    onSuccess: () => {
      queryClient.clear()
      router.replace('/(auth)/login')
    },
    ...options,
  })
}

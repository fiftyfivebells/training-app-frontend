import { ApiError } from '@lib/api/error'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { useRouter } from 'expo-router'

import { authClient, CreateUserRequest, SuccessResponse } from '../api/authApi'

export function useRegister(
  options?: UseMutationOptions<SuccessResponse, ApiError, CreateUserRequest>,
) {
  const router = useRouter()

  return useMutation({
    mutationFn: (body: CreateUserRequest) => authClient.registerUser(body),
    onSuccess: (data: SuccessResponse, variables) => {
      console.log('Registration successful:', data.message)

      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: variables.email },
      })
    },
    ...options,
  })
}

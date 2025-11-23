import { ApiError } from '@lib/api/error'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { authClient, AuthResponse, LoginRequest } from '../api/authClient'

export function useLogin(
  options?: Omit<UseMutationOptions<AuthResponse, ApiError, LoginRequest>, 'mutationFn'>,
) {
  return useMutation({
    mutationFn: (body: LoginRequest) => authClient.login(body),
    ...options,
  })
}

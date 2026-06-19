
import { ApiError } from '@lib/api/error'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { authClient, ForgotPasswordRequest, SuccessResponse } from '../api/authClient'

export function useForgotPassword(
  options?: UseMutationOptions<SuccessResponse, ApiError, ForgotPasswordRequest>,
) {
  return useMutation({
    mutationFn: (body: ForgotPasswordRequest) => authClient.forgotPassword(body),
    ...options,
  })
}

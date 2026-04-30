import { ApiError } from '@lib/api/error'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { authClient, ResendVerificationRequest, SuccessResponse } from '../api/authClient'

export function useResendVerification(
  options?: UseMutationOptions<SuccessResponse, ApiError, ResendVerificationRequest>,
) {
  return useMutation({
    mutationFn: (body: ResendVerificationRequest) => authClient.resendVerification(body),
    ...options,
  })
}

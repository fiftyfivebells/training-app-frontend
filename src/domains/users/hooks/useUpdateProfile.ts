import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/error'

import { UpdateProfileRequest, UserResponse, userClient } from '../api/userApi'
import { usersKeys } from '../users.constants'

export function useUpdateProfile(
  options?: UseMutationOptions<UserResponse, ApiError, UpdateProfileRequest>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => userClient.updateProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.me() })
    },
    ...options,
  })
}

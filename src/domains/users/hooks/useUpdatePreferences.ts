import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/error'

import { UpdatePreferencesRequest, UserPreferencesResponse, userClient } from '../api/userApi'
import { usersKeys } from '../users.constants'

export function useUpdatePreferences(
  options?: UseMutationOptions<UserPreferencesResponse, ApiError, UpdatePreferencesRequest>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdatePreferencesRequest) => userClient.updatePreferences(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.preferences() })
    },
    ...options,
  })
}

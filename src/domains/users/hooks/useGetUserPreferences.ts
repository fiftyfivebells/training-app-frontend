import { useQuery } from '@tanstack/react-query'

import { userClient } from '../api/userApi'
import { usersKeys } from '../users.constants'

export function useGetUserPreferences() {
  return useQuery({
    queryKey: usersKeys.preferences(),
    queryFn: () => userClient.getUserPreferences(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

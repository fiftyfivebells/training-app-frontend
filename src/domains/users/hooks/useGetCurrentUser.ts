import { createMappedQueryHook } from '@/lib/hooks/createMappedQueryHook'

import { userClient, UserResponse } from '../api/userApi'
import { usersKeys } from '../users.constants'
import { User, userResponseToUser } from '../users.types'

export const useGetCurrentUser = createMappedQueryHook<
  UserResponse,
  User,
  readonly ['users', 'me']
>(usersKeys.me(), () => userClient.getCurrentUser(), userResponseToUser)

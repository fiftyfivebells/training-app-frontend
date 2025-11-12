import { UseBaseQueryOptions, useQuery } from "@tanstack/react-query";
import { userClient, UserResponse } from "../api/userApi";
import { usersKeys } from "../users.constants";

export function useGetUserById(
  userId: string,
  options?: Omit<UseBaseQueryOptions<UserResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<UserResponse>({
    queryKey: usersKeys.detail(userId),
    queryFn: () => userClient.getUserById(userId),
    staleTime: 5 * 60 * 1000, // TODO: replace with a constant or config value
    ...options
  })
}
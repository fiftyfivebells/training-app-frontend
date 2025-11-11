import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "../constants";
import type { UserResponse } from "../api/authApi";

export function useAuth() {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserResponse>(authKeys.user())

  return {
    user,
    isAuthenticated: !!user,
    isLoading: false
  }
}
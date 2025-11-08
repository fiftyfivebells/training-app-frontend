import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "../constants";

export function useAuth() {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData(authKeys.user())

  return {
    user,
    isAuthenticated: !!user,
    isLoading: false
  }
}
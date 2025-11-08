import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../lib/api/error";
import { useRouter } from "expo-router";
import { tokenStorage } from "../utils/tokenStorage";

export function useLogout(
  options?: UseMutationOptions<void, ApiError, void> 
) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      tokenStorage.deleteAccessToken();
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace("/(auth)/login");
    },
    ...options
  })
}
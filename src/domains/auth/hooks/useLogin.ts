import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { authClient, AuthResponse, LoginRequest } from "../api/authApi";
import { ApiError } from "../../../lib/api/error";
import { authKeys } from "../constants";
import { tokenStorage } from "../utils/tokenStorage";
import { useRouter } from "expo-router";

export function useLogin(
  options?: UseMutationOptions<AuthResponse, ApiError, LoginRequest>
) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: LoginRequest) => authClient.login(body),
    onSuccess: async (data: AuthResponse) => {
      await tokenStorage.setAccessToken(data.accessToken)
      queryClient.setQueryData(authKeys.user(), data.user);

      router.replace('/(tabs)')
    },
    ...options
  })
}
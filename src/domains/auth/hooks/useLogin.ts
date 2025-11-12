import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { authClient, AuthResponse, LoginRequest } from "../api/authApi";
import { ApiError } from "@lib/api/error";

export function useLogin(
  options?: Omit<UseMutationOptions<AuthResponse, ApiError, LoginRequest, unknown>, 'mutationFn'>
) {

  return useMutation({
    mutationFn: (body: LoginRequest) => authClient.login(body),
    ...options
  })
}

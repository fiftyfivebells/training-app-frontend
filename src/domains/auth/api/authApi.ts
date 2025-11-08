import { BaseApiClient } from "../../../lib/api/base"
import type { components } from "../../../generated/api/types"

export type CreateUserRequest = components['schemas']['CreateUserRequest']
export type LoginRequest = components['schemas']['LoginRequest']
export type SuccessResponse = components['schemas']['SuccessResponse']
export type AuthResponse = components['schemas']['AuthResponse']

export class AuthClient extends BaseApiClient {
  private baseAuthRoute = "auth"

  async registerUser(body: CreateUserRequest) {
    return this.post<SuccessResponse>(`${this.baseAuthRoute}/register`, body)
  }

  async login(body: LoginRequest) {
    return this.post<AuthResponse>(`${this.baseAuthRoute}/login`, body)
  }
}

export const authClient = new AuthClient()
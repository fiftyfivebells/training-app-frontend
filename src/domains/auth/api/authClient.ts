import type { components } from '@generated/api/types'
import { BaseApiClient } from '@lib/api/base'

export type CreateUserRequest = components['schemas']['CreateUserRequest']
export type LoginRequest = components['schemas']['LoginRequest']
export type GoogleLoginRequest = components['schemas']['GoogleLoginRequest']
export type StravaLoginRequest = components['schemas']['StravaLoginRequest']
export type StravaAuthorizeResponse = components['schemas']['StravaAuthorizeResponse']
export type RefreshRequest = components['schemas']['RefreshRequest']
export type ResendVerificationRequest = components['schemas']['ResendVerificationRequest']
export type ForgotPasswordRequest = components['schemas']['ForgotPasswordRequest']
export type SuccessResponse = components['schemas']['SuccessResponse']
export type AuthResponse = components['schemas']['AuthResponse']
export type LoginResponse = components['schemas']['LoginResponse']
export type UserResponse = components['schemas']['UserResponse']

export class AuthClient extends BaseApiClient {
  private baseAuthRoute = 'auth'

  async registerUser(body: CreateUserRequest) {
    return this.post<SuccessResponse>(`${this.baseAuthRoute}/register`, body)
  }

  async login(body: LoginRequest) {
    return this.post<AuthResponse>(`${this.baseAuthRoute}/login`, body)
  }

  async loginWithGoogle(body: GoogleLoginRequest) {
    return this.post<LoginResponse>(`${this.baseAuthRoute}/google`, body)
  }

  async getStravaAuthorizeUrl() {
    return this.get<StravaAuthorizeResponse>(`${this.baseAuthRoute}/strava/authorize`)
  }

  async loginWithStrava(body: StravaLoginRequest) {
    return this.post<LoginResponse>(`${this.baseAuthRoute}/strava`, body)
  }

  async refreshMobile(body: RefreshRequest) {
    return this.post<AuthResponse>(`${this.baseAuthRoute}/refresh/mobile`, body)
  }

  async refreshWeb() {
    return this.post<AuthResponse>(`${this.baseAuthRoute}/refresh/web`)
  }

  async resendVerification(body: ResendVerificationRequest) {
    return this.post<SuccessResponse>(`${this.baseAuthRoute}/resend-verification`, body)
  }

  async forgotPassword(body: ForgotPasswordRequest) {
    return this.post<SuccessResponse>(`${this.baseAuthRoute}/forgot-password`, body)
  }

  async logout(refreshToken?: string | null) {
    const headers: Record<string, string> = {}
    if (refreshToken) {
      headers['Cookie'] = `refresh_token=${refreshToken}`
    }
    return this.makeRequest<SuccessResponse>(`${this.baseAuthRoute}/logout`, {
      method: 'POST',
      headers,
    })
  }
}

export const authClient = new AuthClient()

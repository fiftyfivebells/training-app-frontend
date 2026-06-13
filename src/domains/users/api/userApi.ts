import { BaseApiClient } from '@lib/api/base'

import { components } from '@/generated/api/types'

export type UserResponse = components['schemas']['UserResponse']
export type UserPreferencesResponse = components['schemas']['UserPreferencesResponse']
export type UpdateProfileRequest = components['schemas']['UpdateProfileRequest']
export type UpdatePreferencesRequest = components['schemas']['UpdatePreferencesRequest']

export class UserClient extends BaseApiClient {
  private baseUsersRoute = 'users'

  async getCurrentUser(): Promise<UserResponse> {
    return this.get<UserResponse>(`${this.baseUsersRoute}/me`)
  }

  async getUserById(userId: string): Promise<UserResponse> {
    return this.get<UserResponse>(`${this.baseUsersRoute}/${userId}`)
  }

  async getUserPreferences(): Promise<UserPreferencesResponse> {
    return this.get<UserPreferencesResponse>(`${this.baseUsersRoute}/me/preferences`)
  }

  async updateProfile(body: UpdateProfileRequest): Promise<UserResponse> {
    return this.put<UserResponse>(`${this.baseUsersRoute}/me`, body)
  }

  async updatePreferences(body: UpdatePreferencesRequest): Promise<UserPreferencesResponse> {
    return this.put<UserPreferencesResponse>(`${this.baseUsersRoute}/me/preferences`, body)
  }

  async completeOnboarding(): Promise<UserResponse> {
    return this.post<UserResponse>(`${this.baseUsersRoute}/me/complete-onboarding`)
  }
}

export const userClient = new UserClient()

import { components } from "@/generated/api/types"
import { BaseApiClient } from "@lib/api/base"

export type UserResponse = components['schemas']['UserResponse']

export class UserClient extends BaseApiClient {
  private baseUsersRoute = "/users"

  async getCurrentUser(): Promise<UserResponse> {
    return this.get<UserResponse>(`${this.baseUsersRoute}/me`)
  }

  async getUserById(userId: string): Promise<UserResponse> {
    return this.get<UserResponse>(`${this.baseUsersRoute}/${userId}`);
  }
}

export const userClient = new UserClient()
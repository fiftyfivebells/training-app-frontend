import type { components } from '@/generated/api/types'
import { BaseApiClient } from '@/lib/api/base'

export type AuthResponse = components['schemas']['AuthResponse']

export class RefreshClient extends BaseApiClient {
  private baseAuthRoute = 'auth'

  refreshMobile(body: { refreshToken: string }) {
    return this.post<AuthResponse>(`${this.baseAuthRoute}/refresh/mobile`, body)
  }

  refreshWeb() {
    return this.post<AuthResponse>(`${this.baseAuthRoute}/refresh/web`)
  }
}

export const refreshClient = new RefreshClient()

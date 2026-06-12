import type { components } from '@generated/api/types'
import { BaseApiClient } from '@lib/api/base'

export type StravaConnectResponse = components['schemas']['StravaConnectResponse']
export type StravaStatusResponse = components['schemas']['StravaStatusResponse']

class StravaClient extends BaseApiClient {
  private base = 'strava'

  initiateConnect(redirectUri: string): Promise<StravaConnectResponse> {
    return this.post<StravaConnectResponse>(`${this.base}/connect`, { redirectUri })
  }

  getStatus(): Promise<StravaStatusResponse> {
    return this.get<StravaStatusResponse>(`${this.base}/status`)
  }

  disconnect(): Promise<void> {
    return this.delete<void>(this.base)
  }
}

export const stravaClient = new StravaClient()

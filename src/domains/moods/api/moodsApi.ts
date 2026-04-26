import { BaseApiClient } from '@lib/api/base'

import { components } from '@/generated/api/types'

export type MoodResponse = components['schemas']['MoodResponse']

export class MoodClient extends BaseApiClient {
  private baseMoodsRoute = 'moods'

  async getAllMoods(): Promise<MoodResponse[]> {
    return this.get<MoodResponse[]>(this.baseMoodsRoute)
  }
}

export const moodClient = new MoodClient()

import { BaseApiClient } from '@lib/api/base'

import type { components } from '@/generated/api/types'

export type RunResponse = components['schemas']['RunResponse']
export type LogRunRequest = components['schemas']['LogRunRequest']
export type UpdateRunRequest = components['schemas']['UpdateRunRequest']
export type PendingRunResponse = components['schemas']['PendingRunResponse']
export type CompletePendingRunRequest = components['schemas']['CompletePendingRunRequest']

export class RunsClient extends BaseApiClient {
  private baseRunRoute = 'runs'
  private basePendingRunRoute = 'pending-runs'

  async logRun(body: LogRunRequest): Promise<RunResponse> {
    return this.post<RunResponse>(this.baseRunRoute, body)
  }

  async getRun(runId: string): Promise<RunResponse> {
    return this.get<RunResponse>(`${this.baseRunRoute}/${runId}`)
  }

  async getUserRuns(
    startDate?: string,
    endDate?: string,
    moodIds?: string[],
    moodCategories?: string[],
  ): Promise<RunResponse[]> {
    const queryParams = new URLSearchParams()
    if (startDate) queryParams.append('startDate', startDate)
    if (endDate) queryParams.append('endDate', endDate)
    if (moodIds && moodIds.length > 0) {
      moodIds.forEach((id) => {
        queryParams.append('moodIds', id)
      })
    }
    if (moodCategories && moodCategories.length > 0) {
      moodCategories.forEach((category) => {
        queryParams.append('moodCategories', category)
      })
    }

    const queryString = queryParams.toString()
    const path = queryString ? `${this.baseRunRoute}?${queryString}` : this.baseRunRoute

    return this.get<RunResponse[]>(path)
  }

  async updateRun(runId: string, body: UpdateRunRequest): Promise<RunResponse> {
    return this.put<RunResponse>(`${this.baseRunRoute}/${runId}`, body)
  }

  async deleteRun(runId: string): Promise<void> {
    return this.delete<void>(`${this.baseRunRoute}/${runId}`)
  }

  async getPendingRuns(): Promise<PendingRunResponse[]> {
    return this.get<PendingRunResponse[]>(this.basePendingRunRoute)
  }

  async completePendingRun(pendingRunId: string, body: CompletePendingRunRequest): Promise<RunResponse> {
    return this.post<RunResponse>(`${this.basePendingRunRoute}/${pendingRunId}/complete`, body)
  }
}

export const runsClient = new RunsClient()

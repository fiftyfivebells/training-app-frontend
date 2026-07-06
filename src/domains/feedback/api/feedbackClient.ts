import { components } from "@/generated/api/types"
import { BaseApiClient } from "@/lib/api/base"

export type SubmitFeedbackRequest = components['schemas']['SubmitFeedbackRequest']

export class FeedbackClient extends BaseApiClient {
  async submit(body: SubmitFeedbackRequest): Promise<void> {
    console.log(body)
    return this.post<void>('feedback', body)
  }
}
export const feedbackClient = new FeedbackClient()

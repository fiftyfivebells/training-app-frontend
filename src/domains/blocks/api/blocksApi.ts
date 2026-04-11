import { BaseApiClient } from '@lib/api/base'

import type { AffirmationResponse, BlockResponse, CreateBlockRequest } from '../blocks.types'

export class BlocksClient extends BaseApiClient {
  private baseRoute = 'blocks'

  async createBlock(body: CreateBlockRequest): Promise<BlockResponse> {
    return this.post<BlockResponse>(this.baseRoute, body)
  }

  async getUserBlocks(): Promise<BlockResponse[]> {
    return this.get<BlockResponse[]>(this.baseRoute)
  }

  async getActiveBlock(): Promise<BlockResponse> {
    return this.get<BlockResponse>(`${this.baseRoute}/active`)
  }

  async getBlock(blockId: string): Promise<BlockResponse> {
    return this.get<BlockResponse>(`${this.baseRoute}/${blockId}`)
  }

  async completeBlock(blockId: string): Promise<BlockResponse> {
    return this.post<BlockResponse>(`${this.baseRoute}/${blockId}/complete`)
  }

  async deleteBlock(blockId: string): Promise<void> {
    return this.delete<void>(`${this.baseRoute}/${blockId}`)
  }

  async getTodayAffirmation(): Promise<AffirmationResponse> {
    return this.get<AffirmationResponse>(`${this.baseRoute}/affirmation`)
  }
}

export const blocksClient = new BlocksClient()

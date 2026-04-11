import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/error'

import { blocksClient } from '../api/blocksApi'
import { blocksKeys } from '../blocks.constants'
import { AffirmationResponse } from '../blocks.types'

export function useTodayAffirmation(
  options?: Omit<UseQueryOptions<AffirmationResponse | null>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<AffirmationResponse | null>({
    queryKey: blocksKeys.affirmation(),
    queryFn: async () => {
      try {
        return await blocksClient.getTodayAffirmation()
      } catch (error) {
        if (error instanceof ApiError && error.isNotFound) {
          return null
        }
        throw error
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour — affirmation only changes daily
    ...options,
  })
}

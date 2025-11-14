export const runsKeys = {
  all: ['runs'] as const,

  lists: () => [...runsKeys.all, 'list'] as const,

  list: (filters?: {
    startDate?: string
    endDate?: string
    moodIds?: string[]
    moodCategories?: string[]
  }) => [...runsKeys.lists(), JSON.stringify(filters ?? {})] as const,

  details: () => [...runsKeys.all, 'detail'] as const,

  detail: (runId: string) => [...runsKeys.details(), runId] as const,
}

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

export const RUN_TYPE_GROUPS = [
  { label: 'LOW INTENSITY', types: ['Recovery', 'Easy', 'Long'] },
  { label: 'HIGH INTENSITY', types: ['Tempo', 'Speed'] },
] as const

export const RPE_ZONES = [
  { label: 'Easy',     range: [1, 3]  as [number, number] },
  { label: 'Moderate', range: [4, 6]  as [number, number] },
  { label: 'Hard',     range: [7, 8]  as [number, number] },
  { label: 'All-out',  range: [9, 10] as [number, number] },
]

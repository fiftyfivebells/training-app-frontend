import { create } from 'zustand'

import type { TimeRange } from '@/domains/analytics/utils/types'

interface AnalyticsStore {
  timeRange: TimeRange
  setTimeRange: (r: TimeRange) => void
}

export const useAnalyticsStore = create<AnalyticsStore>()((setState) => ({
  timeRange: '8w',
  setTimeRange: (timeRange) => setState({ timeRange }),
}))

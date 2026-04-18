import { useRuns } from './useRuns'

export function useRecentRuns() {
  const query = useRuns()
  return {
    ...query,
    data: query.data?.slice(0, 3) ?? [],
  }
}

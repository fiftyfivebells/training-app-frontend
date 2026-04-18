import { useDistanceUnitPreference } from '@/domains/users/hooks/useDistanceUnitPreference'

export function useDistanceUnit(): { unit: 'km' | 'mi'; loaded: boolean } {
  const { unit, loaded } = useDistanceUnitPreference()
  return {
    unit: unit === 'imperial' ? 'mi' : 'km',
    loaded,
  }
}

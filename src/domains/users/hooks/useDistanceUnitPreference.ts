import { useCallback } from 'react'

import { useGetUserPreferences } from './useGetUserPreferences'
import { useUpdatePreferences } from './useUpdatePreferences'

export type DistanceUnitPreference = 'imperial' | 'metric'

const DEFAULT: DistanceUnitPreference = 'imperial'

function isValidPreference(value: string | undefined): value is DistanceUnitPreference {
  return value === 'imperial' || value === 'metric'
}

export function useDistanceUnitPreference() {
  const { data: prefs, isLoading } = useGetUserPreferences()
  const { mutate } = useUpdatePreferences()

  const unit: DistanceUnitPreference = isValidPreference(prefs?.preferredUnits)
    ? prefs.preferredUnits
    : DEFAULT

  const setUnit = useCallback(
    (newUnit: DistanceUnitPreference) => {
      mutate({ preferredUnits: newUnit })
    },
    [mutate],
  )

  return { unit, setUnit, loaded: !isLoading }
}

import { useCallback, useEffect, useState } from 'react'

import { getSecureValue, setSecureValue } from '@/lib/storage/secureStorage'

export type DistanceUnitPreference = 'imperial' | 'metric'

const STORAGE_KEY = 'preference_distance_unit'
const DEFAULT: DistanceUnitPreference = 'imperial'

function isValidPreference(value: string | null): value is DistanceUnitPreference {
  return value === 'imperial' || value === 'metric'
}

export function useDistanceUnitPreference() {
  const [unit, setUnitState] = useState<DistanceUnitPreference>(DEFAULT)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getSecureValue(STORAGE_KEY).then((stored) => {
      if (isValidPreference(stored)) {
        setUnitState(stored)
      }
      setLoaded(true)
    })
  }, [])

  const setUnit = useCallback((newUnit: DistanceUnitPreference) => {
    setUnitState(newUnit)
    setSecureValue(STORAGE_KEY, newUnit).catch(console.error)
  }, [])

  return { unit, setUnit, loaded }
}

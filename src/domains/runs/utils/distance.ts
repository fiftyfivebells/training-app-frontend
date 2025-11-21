export type DistanceUnit = 'miles' | 'km' | 'meters'

const METERS_PER_MILE = 1609.34

export function calculateMeters(distance: number, units: DistanceUnit): number {
  if (Number.isNaN(distance)) return 0

  if (units === 'meters') return distance
  if (units === 'km') return distance * 1000

  // miles
  return Math.round(distance * METERS_PER_MILE)
}

export function metersToDistanceUnit(distance: number, unit: DistanceUnit): number {
  if (unit === 'meters') return distance
  else if (unit === 'km') return distance / 1000
  else return distance / METERS_PER_MILE
}

export function formatDistance(distanceMeters: number, unit: DistanceUnit): string {
  const total = metersToDistanceUnit(distanceMeters, unit).toFixed(2)

  return `${Number(total)} ${unit}`.trim()
}

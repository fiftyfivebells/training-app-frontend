export type DistanceUnit = 'miles' | 'km' | 'meters'

const METERS_PER_MILE = 1609.34

export function calculateMeters(distance: number, units: DistanceUnit): number {
  if (Number.isNaN(distance)) return 0

  if (units === 'meters') return distance
  if (units === 'km') return distance * 1000

  // miles
  return Math.round(distance * METERS_PER_MILE)
}

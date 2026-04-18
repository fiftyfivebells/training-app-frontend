export type DistanceUnit = 'miles' | 'km' | 'meters'

export const METERS_PER_KM = 1000
export const METERS_PER_MILE = 1609.34

export function parseDistanceInput(input: string, units: DistanceUnit): number {
  const parsed = parseFloat(input)
  if (Number.isNaN(parsed) || parsed < 0) return 0

  return calculateMeters(parsed, units)
}

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

export function formatDistanceDisplay(meters: number, unit: 'km' | 'mi'): string {
  const value = unit === 'km' ? meters / METERS_PER_KM : meters / METERS_PER_MILE
  return `${value.toFixed(1)} ${unit}`
}

export function formatDistanceParts(
  meters: number,
  unit: 'km' | 'mi',
): { value: string; unit: string } {
  const value = unit === 'km' ? meters / METERS_PER_KM : meters / METERS_PER_MILE
  return { value: value.toFixed(1), unit }
}

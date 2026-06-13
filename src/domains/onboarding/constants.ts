export const ONBOARDING_TOTAL_STEPS = 5

export type OnboardingDistanceUnit = 'miles' | 'km'

export type OnboardingPaceFormat = 'min/mi' | 'min/km' | 'mph'

export interface OnboardingState {
  distanceUnit: OnboardingDistanceUnit
  paceFormat: OnboardingPaceFormat
  stravaConnected: boolean
}

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  distanceUnit: 'miles',
  paceFormat: 'min/mi',
  stravaConnected: false,
}

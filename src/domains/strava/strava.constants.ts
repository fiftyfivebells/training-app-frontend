export const stravaKeys = {
  all: ['strava'] as const,
  status: () => [...stravaKeys.all, 'status'] as const,
}

export const STRAVA_ORANGE = '#FC4C02'

export const STRAVA_ERROR_MESSAGES: Record<string, string> = {
  denied: 'You declined access to Strava.',
  insufficient_scope:
    'Base Phase needs access to your Strava activities. Please try again and accept all permissions.',
  missing_params: 'Something went wrong. Please try again.',
  invalid_state: 'Something went wrong. Please try again.',
  exchange_failed: "Couldn't connect to Strava. Please try again.",
}

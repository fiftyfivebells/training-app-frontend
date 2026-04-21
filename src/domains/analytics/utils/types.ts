export type Sentiment = 'positive' | 'warning' | 'neutral'

export type TimeRange = '4w' | '8w' | '12w' | 'all'

export type WeeklyBucket = {
  weekLabel: string
  weekStart: Date
  weekEnd: Date
}

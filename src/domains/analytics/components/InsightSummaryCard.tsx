import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import type { Sentiment } from '@/domains/analytics/utils/types'

export type InsightSummaryCardProps = {
  headline: string
  body: string
  sentiment: Sentiment
}

export function InsightSummaryCard({ headline, body, sentiment }: InsightSummaryCardProps) {
  const { text, mood } = useTheme()

  const bodyColor =
    sentiment === 'positive'
      ? mood.highGood
      : sentiment === 'warning'
        ? mood.lowTough
        : text.secondary

  return (
    <View style={styles.container}>
      <Text style={[styles.headline, { color: text.primary }]}>{headline}</Text>
      <Text style={[styles.body, { color: bodyColor }]}>{body}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  headline: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 20,
    letterSpacing: -0.02 * 20,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'Manrope',
    fontSize: 11,
    lineHeight: 11 * 1.5,
    marginTop: 6,
  },
})

import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import { moodCategories } from '@/domains/moods/moods.constants'
import { getMoodCategoryColor } from '@/domains/moods/utils/mood'
import React, { useMemo } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { Screen } from '@/components/layout/Screen'
import { ThemedText } from '@/components/ui/ThemedText'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { computeMoodAnalytics, type QuadrantBreakdown } from '@/domains/runs/utils/analytics'
import { useTheme } from '@/theme/ThemeProvider'

export function MoodAnalyticsScreen() {
  const theme = useTheme()
  const { data: runs, isLoading: isLoadingRuns } = useRuns()
  const { data: moods, isLoading: isLoadingMoods } = useGetAllMoods()

  const analytics = useMemo(
    () => (runs && moods ? computeMoodAnalytics(runs, moods) : null),
    [runs, moods],
  )

  if (isLoadingRuns || isLoadingMoods || !analytics) {
    return (
      <Screen scroll={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.semantic.button.primary.bg} />
        </View>
      </Screen>
    )
  }

  const topCategory = analytics.topQuadrant
    ? moodCategories.find((c) => c.key === analytics.topQuadrant)
    : null

  return (
    <Screen>
      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: theme.semantic.surface.card,
            borderRadius: theme.radius.lg,
            borderColor: theme.semantic.border.default,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
          },
        ]}
      >
        <ThemedText
          style={{
            fontSize: theme.typography.size.xxxl,
            fontWeight: theme.typography.weights.bold,
            color: theme.semantic.text.primary,
          }}
        >
          {analytics.totalRuns}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: theme.typography.size.md,
            color: theme.semantic.text.secondary,
            marginTop: theme.spacing.xs,
          }}
        >
          total runs
        </ThemedText>
        {topCategory && (
          <ThemedText
            style={{
              fontSize: theme.typography.size.sm,
              color: theme.semantic.text.secondary,
              marginTop: theme.spacing.sm,
            }}
          >
            Most common: {topCategory.title}
          </ThemedText>
        )}
      </View>

      {analytics.totalRuns === 0 ? (
        <ThemedText
          style={{
            fontSize: theme.typography.size.md,
            color: theme.semantic.text.secondary,
            textAlign: 'center',
            marginTop: theme.spacing.xl,
          }}
        >
          Log your first run to see mood patterns here.
        </ThemedText>
      ) : (
        <View>
          <ThemedText
            style={{
              fontSize: theme.typography.size.lg,
              fontWeight: theme.typography.weights.semibold,
              color: theme.semantic.text.primary,
              marginBottom: theme.spacing.md,
            }}
          >
            Mood Breakdown
          </ThemedText>
          {analytics.breakdown.map((row) => (
            <QuadrantRow key={row.key} row={row} />
          ))}
        </View>
      )}
    </Screen>
  )
}

type QuadrantRowProps = {
  row: QuadrantBreakdown
}

function QuadrantRow({ row }: QuadrantRowProps) {
  const theme = useTheme()
  const color = getMoodCategoryColor(theme, row.key)
  const category = moodCategories.find((c) => c.key === row.key)!
  const barWidth = row.count > 0 ? `${Math.max(row.percentage, 2)}%` : '0%'

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <View style={[styles.rowHeader, { marginBottom: theme.spacing.sm }]}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            backgroundColor: color,
            marginRight: theme.spacing.sm,
          }}
        />
        <ThemedText
          style={{
            flex: 1,
            fontSize: theme.typography.size.sm,
            color: theme.semantic.text.primary,
          }}
        >
          {category.title}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: theme.typography.size.sm,
            color: theme.semantic.text.secondary,
          }}
        >
          {row.count} {row.count !== 1 ? 'runs' : 'run'}
        </ThemedText>
      </View>
      <View
        style={[
          styles.barContainer,
          {
            backgroundColor: theme.semantic.surface.card,
            borderRadius: theme.radius.xs,
          },
        ]}
      >
        <View
          style={{
            width: barWidth,
            height: 6,
            backgroundColor: color,
            borderRadius: theme.radius.xs,
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    borderWidth: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barContainer: {
    width: '100%',
    height: 6,
    overflow: 'hidden',
  },
})

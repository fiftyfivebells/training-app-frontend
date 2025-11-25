import { useGetAllMoods } from '@domains/moods/hooks/useGetAllMoods'
import { getMoodCategoryColor } from '@domains/moods/utils/mood'
import { useRouter } from 'expo-router'
import React from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'

import { Screen } from '@/components/layout/Screen'
import { ThemedText } from '@/components/ui/ThemedText'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { useTheme } from '@/theme/ThemeProvider'

import { formatDistance } from '../utils/distance'

export default function RunListScreen() {
  const router = useRouter()
  const { data: runs, isLoading, isError } = useRuns()
  const { data: moods } = useGetAllMoods()
  const theme = useTheme()

  if (isLoading) {
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.semantic.button.primary.bg} />
        </View>
      </Screen>
    )
  }

  if (isError || !runs) {
    return (
      <Screen scroll={false}>
        <ThemedText>Unable to load runs right now.</ThemedText>
      </Screen>
    )
  }

  return (
    <Screen>
      <ThemedText
        style={{
          fontSize: theme.typography.size.xxl,
          fontWeight: theme.typography.weights.bold,
          color: theme.semantic.text.primary,
          marginBottom: theme.spacing.xs,
        }}
      >
        Logbook
      </ThemedText>

      <ThemedText
        style={{
          fontSize: theme.typography.size.md,
          color: theme.semantic.text.secondary,
          marginBottom: theme.spacing.lg,
        }}
      >
        A quiet record of where your legs have taken you.
      </ThemedText>

      <View>
        {runs.map((run, index) => {
          const mood = moods?.find((m) => m.id === run.moodId)
          const moodColor = mood
            ? getMoodCategoryColor(theme, mood.quadrant)
            : theme.semantic.surface.cardAlt
          const isLast = index === runs.length - 1

          return (
            <TouchableOpacity
              key={run.id}
              style={[
                styles.cardWrapper,
                theme.runItem.container,
                !isLast && { marginBottom: theme.spacing.md },
              ]}
              onPress={() => router.push(`/run/${run.id}`)}
            >
              <View style={[theme.runItem.strip(moodColor), styles.moodStrip]} />

              <View style={[styles.card, { padding: theme.spacing.md }]}>
                <View style={[styles.cardHeader, { marginBottom: theme.spacing.xs }]}>
                  <ThemedText
                    style={{
                      fontSize: theme.typography.size.md,
                      fontWeight: theme.typography.weights.semibold,
                      color: theme.semantic.text.primary,
                    }}
                  >
                    {run.date}
                  </ThemedText>

                  {mood && (
                    <ThemedText
                      style={{
                        fontSize: theme.typography.size.sm,
                        color: theme.semantic.text.secondary,
                      }}
                    >
                      {mood.label}
                    </ThemedText>
                  )}
                </View>

                <ThemedText
                  style={{
                    fontSize: theme.typography.size.md,
                    color: theme.semantic.text.secondary,
                  }}
                >
                  {formatDistance(run.distanceMeters, run.distanceUnits)} •{' '}
                  {Math.round(run.durationSeconds / 60)} min
                </ThemedText>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardWrapper: {
    flexDirection: 'row',
    overflow: 'hidden',
  },

  moodStrip: {
    width: 6,
    alignSelf: 'stretch',
  },

  card: {
    flex: 1,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

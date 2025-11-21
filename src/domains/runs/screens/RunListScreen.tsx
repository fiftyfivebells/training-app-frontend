// app/(drawer)/runs.tsx

import React from 'react'
import { useRouter } from 'expo-router'
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'

import { Screen } from '@/components/layout/Screen'
import { ThemedText } from '@/components/ui/ThemedText'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { useGetAllMoods } from '@domains/moods/hooks/useGetAllMoods'
import { getMoodCategoryColor } from '@domains/moods/utils/mood'
import { formatDistance } from '../utils/distance'
import { colors, spacing, typography } from '@/theme'

export default function RunListScreen() {
  const router = useRouter()
  const { data: runs, isLoading, isError } = useRuns()
  const { data: moods } = useGetAllMoods()

  if (isLoading) {
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
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
      <ThemedText style={styles.title}>Logbook</ThemedText>
      <ThemedText style={styles.subtitle}>
        A quiet record of where your legs have taken you.
      </ThemedText>

      <View style={styles.list}>
        {runs.map((run) => {
          const mood = moods?.find((m) => m.id === run.moodId)
          const moodColor = mood ? getMoodCategoryColor(mood.quadrant) : colors.sand

          return (
            <TouchableOpacity
              key={run.id}
              style={styles.cardWrapper}
              onPress={() => router.push(`/run/${run.id}`)}
            >
              <View style={[styles.moodStrip, { backgroundColor: moodColor }]} />
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <ThemedText style={styles.date}>{run.date}</ThemedText>
                  {mood && <ThemedText style={styles.moodLabel}>{mood.label}</ThemedText>}
                </View>

                <ThemedText style={styles.metrics}>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.brown.DEFAULT,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.stone.DEFAULT,
    marginBottom: spacing.lg,
  },

  list: {
    gap: spacing.md,
  },

  cardWrapper: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.sand,
    overflow: 'hidden',
  },
  moodStrip: {
    width: 6,
  },
  card: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.charcoal,
  },
  moodLabel: {
    fontSize: typography.sizes.sm,
    color: colors.stone.DEFAULT,
  },
  metrics: {
    fontSize: typography.sizes.base,
    color: colors.stone.DEFAULT,
  },
})

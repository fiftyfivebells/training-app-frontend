import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import type { MoodCategoryKey } from '@/domains/moods/moods.types'
import type { RunResponse } from '@/domains/runs/api/runsApi'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import { useTheme } from '@/theme/useTheme'

import { formatDistanceDisplay, formatDistanceParts } from '../utils/distance'
import { formatDurationDisplay } from '../utils/duration'
import { formatPace, formatRelativeDays, formatRunDate, generateRunTitle } from '../utils/formatters'
import { RunTypeBadge } from './RunTypeBadge'

const QUADRANT_COLOR_KEY: Record<MoodCategoryKey, 'highGood' | 'highTough' | 'lowGood' | 'lowTough'> = {
  'high-pleasant': 'highGood',
  'high-challenging': 'highTough',
  'low-pleasant': 'lowGood',
  'low-challenging': 'lowTough',
}

type RunRowProps = {
  run: RunResponse
  compact?: boolean
}

export function RunRow({ run, compact = false }: RunRowProps) {
  const { colors } = useTheme()
  const { unit } = useDistanceUnit()
  const { data: moods } = useGetAllMoods()

  const mood = moods?.find((m) => m.id === run.moodId)
  const moodColor = mood ? colors.mood[QUADRANT_COLOR_KEY[mood.quadrant]] : null

  const runType = run.runType
    ? run.runType.charAt(0).toUpperCase() + run.runType.slice(1).toLowerCase()
    : undefined

  const title = generateRunTitle(runType, mood?.label)
  const dateLabel = compact ? formatRelativeDays(run.date) : formatRunDate(run.date)
  const { value: distValue, unit: distUnit } = formatDistanceParts(run.distanceMeters, unit)
  const duration = formatDurationDisplay(run.durationSeconds)
  const pace = formatPace(run.distanceMeters, run.durationSeconds, unit)

  return (
    <TouchableOpacity
      style={[styles.row, compact && styles.rowCompact]}
      onPress={() => router.push(`/runs/${run.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>
          {title}
        </Text>

        {compact ? (
          <>
            <Text style={[styles.timestamp, { color: colors.text.tertiary }]}>{dateLabel}</Text>
            <Text style={[styles.compactStats, { color: colors.text.secondary }]}>
              {formatDistanceDisplay(run.distanceMeters, unit)} · {duration}
            </Text>
          </>
        ) : (
          <>
            <View style={styles.subLine}>
              <Text style={[styles.timestamp, { color: colors.text.tertiary }]}>{dateLabel}</Text>
              {runType && (
                <>
                  <View style={[styles.separatorDot, { backgroundColor: colors.border.default }]} />
                  <RunTypeBadge runType={runType} />
                </>
              )}
            </View>

            <View style={styles.statsLine}>
              <Text>
                <Text style={[styles.statValue, { color: colors.text.primary }]}>{distValue}</Text>
                <Text style={[styles.statUnit, { color: colors.text.tertiary }]}> {distUnit}</Text>
              </Text>
              <Text>
                <Text style={[styles.statValue, { color: colors.text.primary }]}>{duration}</Text>
                <Text style={[styles.statUnit, { color: colors.text.tertiary }]}> dur</Text>
              </Text>
              <Text>
                <Text style={[styles.statValue, { color: colors.text.primary }]}>{pace}</Text>
                <Text style={[styles.statUnit, { color: colors.text.tertiary }]}> /{unit}</Text>
              </Text>
            </View>
          </>
        )}
      </View>

      {mood && moodColor && (
        <View style={[styles.moodContainer, compact && styles.moodContainerCompact]}>
          <View style={[styles.moodDot, { backgroundColor: moodColor }]} />
          <Text style={[styles.moodLabel, { color: colors.text.tertiary }]}>{mood.label}</Text>
        </View>
      )}

      {!compact && (
        <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} style={styles.chevron} />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  rowCompact: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  subLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestamp: {
    fontSize: 11,
    lineHeight: 16,
  },
  separatorDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  statsLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 16,
    marginTop: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.5,
    lineHeight: 22,
  },
  statUnit: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16,
  },
  compactStats: {
    fontSize: 12,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginLeft: 'auto',
  },
  moodContainerCompact: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    marginLeft: 0,
    paddingTop: 2,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moodLabel: {
    fontSize: 11,
    lineHeight: 16,
  },
  chevron: {
    marginTop: 2,
    marginLeft: 4,
  },
})

import { router } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import type { MoodCategoryKey } from '@/domains/moods/moods.types'
import type { RunResponse } from '@/domains/runs/api/runsApi'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import { useTheme } from '@/theme/useTheme'

import { formatDistanceParts } from '../utils/distance'
import { formatDurationDisplay } from '../utils/duration'

const QUADRANT_COLOR_KEY: Record<MoodCategoryKey, 'highGood' | 'highTough' | 'lowGood' | 'lowTough'> = {
  'high-pleasant':    'highGood',
  'high-challenging': 'highTough',
  'low-pleasant':     'lowGood',
  'low-challenging':  'lowTough',
}

const DAY_ABBRS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTH_ABBRS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function parseDateParts(dateString: string): { day: string; date: string } {
  const [year, month, day] = dateString.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return {
    day: DAY_ABBRS[d.getDay()],
    date: `${MONTH_ABBRS[month - 1]} ${day}`,
  }
}

type RunRowProps = {
  run: RunResponse
  compact?: boolean
}

export function RunRow({ run, compact = false }: RunRowProps) {
  const { text, rule, mood } = useTheme()
  const { unit } = useDistanceUnit()
  const { data: moods } = useGetAllMoods()

  const runMood = moods?.find((m) => m.id === run.moodId)
  const moodColor = runMood ? mood[QUADRANT_COLOR_KEY[runMood.quadrant]] : null

  const { value: distValue, unit: distUnit } = formatDistanceParts(run.distanceMeters, unit)
  const duration = formatDurationDisplay(run.durationSeconds)
  const { day, date } = parseDateParts(run.date)

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.row, { borderBottomColor: rule.subtle, borderLeftColor: moodColor ?? 'transparent' }]}
        onPress={() => router.push(`/runs/${run.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.dateColCompact}>
          <Text style={[styles.dayLabelCompact, { color: text.tertiary }]}>{day}</Text>
          <Text style={[styles.dateLabelCompact, { color: text.secondary }]}>{date}</Text>
        </View>
        <View style={styles.content}>
          {runMood ? (
            <Text style={[styles.moodWordCompact, { color: moodColor ?? undefined }]} numberOfLines={1}>
              {runMood.label}.
            </Text>
          ) : (
            <Text style={[styles.fallbackTitle, { color: text.primary }]} numberOfLines={1}>
              Run
            </Text>
          )}
          <Text style={[styles.statsCompact, { color: text.secondary }]}>
            {distValue} {distUnit} · {duration}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      style={[styles.rowFull, { borderBottomColor: rule.default, borderLeftColor: moodColor ?? 'transparent' }]}
      onPress={() => router.push(`/runs/${run.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.dateColFull}>
        <Text style={[styles.dayLabelFull, { color: text.secondary }]}>{day}</Text>
        <Text style={[styles.dateLabelFull, { color: text.secondary }]}>{date}</Text>
      </View>
      <View style={styles.content}>
        {runMood ? (
          <Text style={[styles.moodWordFull, { color: moodColor ?? undefined }]} numberOfLines={1}>
            {runMood.label}.
          </Text>
        ) : (
          <Text style={[styles.fallbackTitle, { color: text.primary }]} numberOfLines={1}>
            Run
          </Text>
        )}
        <View style={styles.statsFull}>
          <Text style={[styles.statsDistValue, { color: text.primary }]}>
            {distValue}
            <Text style={[styles.statsDistUnit, { color: text.secondary }]}> {distUnit}</Text>
          </Text>
          <Text style={[styles.statsSep, { color: text.tertiary }]}>—</Text>
          <Text style={[styles.statsTimeValue, { color: text.primary }]}>{duration}</Text>
        </View>
        {run.notes ? (
          <Text style={[styles.note, { color: text.secondary }]} numberOfLines={1}>
            "{run.notes}"
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  // Compact row (home screen)
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderLeftWidth: 3,
    borderBottomWidth: 1,
    gap: 10,
  },
  dateColCompact: {
    width: 38,
    flexShrink: 0,
    gap: 1,
  },
  dayLabelCompact: {
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.12 * 9,
    lineHeight: 12,
  },
  dateLabelCompact: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 13,
    lineHeight: 15,
  },
  moodWordCompact: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 16,
    letterSpacing: -0.01 * 16,
    lineHeight: 18,
  },
  statsCompact: {
    fontFamily: 'Manrope',
    fontSize: 11,
  },
  // Full row (logbook, block detail)
  rowFull: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderLeftWidth: 3,
    borderBottomWidth: 1,
    gap: 10,
  },
  dateColFull: {
    width: 44,
    flexShrink: 0,
    gap: 2,
  },
  dayLabelFull: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.12 * 10,
    lineHeight: 13,
  },
  dateLabelFull: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 15,
    lineHeight: 17,
  },
  moodWordFull: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 22,
    letterSpacing: -0.01 * 22,
    lineHeight: 24,
    marginBottom: 4,
  },
  statsFull: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  statsDistValue: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 17,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  statsDistUnit: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 11,
  },
  statsSep: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 14,
  },
  statsTimeValue: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 15,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  note: {
    fontFamily: 'Manrope',
    fontSize: 11,
    fontStyle: 'italic',
  },
  // Shared
  content: {
    flex: 1,
    minWidth: 0,
  },
  fallbackTitle: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
})

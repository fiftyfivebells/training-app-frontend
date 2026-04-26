import { Ionicons } from '@expo/vector-icons'
import { format, parseISO } from 'date-fns'
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
  'high-pleasant': 'highGood',
  'high-challenging': 'highTough',
  'low-pleasant': 'lowGood',
  'low-challenging': 'lowTough',
}

type Props = {
  run: RunResponse
}

export function LogbookRunRow({ run }: Props) {
  const { text, mood } = useTheme()
  const { unit } = useDistanceUnit()
  const { data: moods } = useGetAllMoods()

  const runMood = moods?.find((m) => m.id === run.moodId)
  const moodColor = runMood ? mood[QUADRANT_COLOR_KEY[runMood.quadrant]] : null

  const weekday = format(parseISO(run.date), 'EEE').toUpperCase()
  const dayNum = format(parseISO(run.date), 'd')

  const { value: distValue, unit: distUnit } = formatDistanceParts(run.distanceMeters, unit)
  const duration = formatDurationDisplay(run.durationSeconds)

  return (
    <TouchableOpacity
      style={[styles.row, { borderLeftColor: moodColor ?? 'transparent' }]}
      onPress={() => router.push(`/runs/${run.id}`)}
      activeOpacity={0.7}
    >
      {/* Date column */}
      <View style={styles.dateCol}>
        <Text style={[styles.weekday, { color: text.tertiary }]}>{weekday}</Text>
        <Text style={[styles.dayNum, { color: text.primary }]}>{dayNum}</Text>
      </View>

      {/* Body column */}
      <View style={styles.body}>
        <Text
          style={[
            styles.moodWord,
            { color: moodColor ?? text.disabled },
          ]}
          numberOfLines={1}
        >
          {runMood?.label ?? '—'}
        </Text>

        <View style={styles.statsLine}>
          <Text style={[styles.distValue, { color: text.primary }]}>
            {distValue}
            <Text style={[styles.unit, { color: text.tertiary }]}> {distUnit}</Text>
          </Text>
          <Text style={[styles.dividerDot, { color: text.tertiary }]}> · </Text>
          <Text style={[styles.timeValue, { color: text.primary }]}>
            {duration}
          </Text>
        </View>

        {run.notes ? (
          <Text
            style={[styles.note, { color: text.secondary }]}
            numberOfLines={1}
          >
            {run.notes}
          </Text>
        ) : null}
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={14} color={text.tertiary} style={styles.chevron} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderLeftWidth: 3,
  },
  dateCol: {
    width: 44,
    alignItems: 'center',
    paddingLeft: 10,
  },
  weekday: {
    fontFamily: 'Manrope',
    fontSize: 10,
    lineHeight: 14,
  },
  dayNum: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 22,
    lineHeight: 26,
  },
  body: {
    flex: 1,
    paddingLeft: 12,
    gap: 2,
  },
  moodWord: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 22,
    lineHeight: 26,
  },
  statsLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  distValue: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 17,
    lineHeight: 22,
  },
  unit: {
    fontFamily: 'Manrope',
    fontSize: 11,
  },
  dividerDot: {
    fontFamily: 'Manrope',
    fontSize: 11,
  },
  timeValue: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 15,
    lineHeight: 20,
  },
  note: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 11,
    lineHeight: 16,
  },
  chevron: {
    marginRight: 12,
    marginLeft: 4,
  },
})

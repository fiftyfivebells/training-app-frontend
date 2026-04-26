import { format, isAfter, parseISO, startOfWeek } from 'date-fns'
import { router } from 'expo-router'
import { useMemo } from 'react'
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button, Dateline, DoubleRule } from '@/components/ui'
import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import type { MoodCategoryKey } from '@/domains/moods/moods.types'
import { LogbookRunRow } from '@/domains/runs/components/LogbookRunRow'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { formatDistanceParts } from '@/domains/runs/utils/distance'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import { useTheme } from '@/theme/useTheme'

const QUADRANT_COLOR_KEY: Record<MoodCategoryKey, 'highGood' | 'highTough' | 'lowGood' | 'lowTough'> = {
  'high-pleasant': 'highGood',
  'high-challenging': 'highTough',
  'low-pleasant': 'lowGood',
  'low-challenging': 'lowTough',
}

const MOOD_LABELS: Record<'highGood' | 'highTough' | 'lowGood' | 'lowTough', string> = {
  highGood: 'Strong',
  highTough: 'Fired',
  lowGood: 'Easy',
  lowTough: 'Heavy',
}

export function LogbookScreen() {
  const { bg, text, rule, accent, mood, space, radius } = useTheme()
  const insets = useSafeAreaInsets()
  const { data: allMoods } = useGetAllMoods()
  const { data: rawRuns = [], isLoading, isFetching, refetch } = useRuns()
  const { unit } = useDistanceUnit()

  const runs = useMemo(
    () => [...rawRuns].sort((a, b) => b.date.localeCompare(a.date)),
    [rawRuns],
  )

  const thisWeekRuns = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    return runs.filter((r) => {
      const d = parseISO(r.date)
      return isAfter(d, weekStart) || d.getTime() === weekStart.getTime()
    })
  }, [runs])

  const { dominantMoodColor, dominantMoodLabel } = useMemo(() => {
    if (thisWeekRuns.length === 0) {
      return { dominantMoodColor: null, dominantMoodLabel: 'Rest' }
    }
    const counts: Partial<Record<'highGood' | 'highTough' | 'lowGood' | 'lowTough', number>> = {}
    for (const run of thisWeekRuns) {
      const runMood = allMoods?.find((m) => m.id === run.moodId)
      if (!runMood) continue
      const key = QUADRANT_COLOR_KEY[runMood.quadrant]
      counts[key] = (counts[key] ?? 0) + 1
    }
    const top = (Object.entries(counts) as [keyof typeof counts, number][])
      .sort((a, b) => b[1] - a[1])[0]
    if (!top) return { dominantMoodColor: null, dominantMoodLabel: 'Rest' }
    const key = top[0]
    return {
      dominantMoodColor: mood[key],
      dominantMoodLabel: MOOD_LABELS[key],
    }
  }, [thisWeekRuns, allMoods, mood])

  const weeklyTotalMeters = useMemo(
    () => thisWeekRuns.reduce((sum, r) => sum + r.distanceMeters, 0),
    [thisWeekRuns],
  )
  const { value: weeklyValue, unit: weeklyUnit } = formatDistanceParts(weeklyTotalMeters, unit)

  const moodSquares = useMemo(() => {
    const squares: (string | null)[] = Array(5).fill(null)
    const recent = thisWeekRuns.slice(0, 5)
    recent.forEach((run, i) => {
      const runMood = allMoods?.find((m) => m.id === run.moodId)
      if (runMood) {
        squares[i] = mood[QUADRANT_COLOR_KEY[runMood.quadrant]]
      }
    })
    return squares
  }, [thisWeekRuns, allMoods, mood])

  const isEmpty = !isLoading && runs.length === 0

  const monthTitle = format(new Date(), 'MMMM')
  const weekLabel = format(new Date(), "'Wk' w · yyyy")

  return (
    <View style={[styles.screen, { backgroundColor: bg.base }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            paddingHorizontal: space[4],
            paddingBottom: space[3],
            backgroundColor: bg.base,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Dateline>The Logbook</Dateline>
          <Text style={[styles.weekLabel, { color: text.tertiary }]}>{weekLabel}</Text>
        </View>
        <Text style={[styles.monthTitle, { color: text.primary }]}>{monthTitle}</Text>
        <DoubleRule style={styles.doubleRule} />
      </View>

      {/* Week summary strip */}
      {!isEmpty && (
        <View
          style={[
            styles.strip,
            {
              paddingHorizontal: space[4],
              paddingVertical: space[3],
              borderBottomColor: rule.subtle,
            },
          ]}
        >
          <Dateline style={styles.stripLabel}>This week, mostly —</Dateline>
          <Text
            style={[
              styles.dominantMood,
              { color: dominantMoodColor ?? text.tertiary },
            ]}
          >
            {dominantMoodLabel}
          </Text>
          <View style={styles.stripMeta}>
            <Text style={[styles.stripStats, { color: text.secondary }]}>
              {weeklyValue} {weeklyUnit} · {thisWeekRuns.length} {thisWeekRuns.length === 1 ? 'run' : 'runs'}
            </Text>
            <View style={styles.moodBar}>
              {moodSquares.map((color, i) => (
                <View
                  key={i}
                  style={[
                    styles.moodSquare,
                    {
                      backgroundColor: color ?? rule.default,
                      borderRadius: radius.sm,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Empty state */}
      {isEmpty ? (
        <View style={[styles.emptyState, { paddingBottom: insets.bottom + 16 }]}>
          <Text
            style={[
              styles.emptyText,
              { color: text.primary, fontFamily: 'Fraunces_400Regular_Italic' },
            ]}
          >
            Your running story starts with the first step.
          </Text>
          <Button size="lg" onPress={() => router.push('/log')}>
            Log your first run
          </Button>
        </View>
      ) : (
        <FlatList
          data={runs}
          keyExtractor={(run) => run.id}
          renderItem={({ item: run }) => <LogbookRunRow run={run} />}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: rule.subtle }]} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor={accent.default}
            />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekLabel: {
    fontFamily: 'Manrope',
    fontSize: 11,
  },
  monthTitle: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 36,
    letterSpacing: -0.02 * 36,
    lineHeight: 40,
  },
  doubleRule: {
    marginTop: 4,
  },
  strip: {
    borderBottomWidth: 1,
    gap: 4,
  },
  stripLabel: {
    marginBottom: 2,
  },
  dominantMood: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 28,
    lineHeight: 32,
  },
  stripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  stripStats: {
    fontFamily: 'Manrope',
    fontSize: 12,
    lineHeight: 16,
  },
  moodBar: {
    flexDirection: 'row',
    gap: 4,
  },
  moodSquare: {
    width: 8,
    height: 8,
  },
  separator: {
    height: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
})

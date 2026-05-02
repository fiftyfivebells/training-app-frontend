import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { router } from 'expo-router'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Dateline } from '@/components/ui'
import { BLOCK_TYPE_CONFIG } from '@/domains/blocks/constants/blockTypes'
import { useActiveBlock } from '@/domains/blocks/hooks/useActiveBlock'
import { useTodayAffirmation } from '@/domains/blocks/hooks/useTodayAffirmation'
import type { Block } from '@/domains/blocks/blocks.types'
import type { BlockTypeConfig } from '@/domains/blocks/constants/blockTypes'
import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import type { MoodCategoryKey } from '@/domains/moods/moods.types'
import type { RunResponse } from '@/domains/runs/api/runsApi'
import { RunRow } from '@/domains/runs/components/RunRow'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { formatDistanceParts } from '@/domains/runs/utils/distance'
import { computeWeeklyStats } from '@/domains/runs/utils/weeklyStats'
import { useGetCurrentUser } from '@/domains/users/hooks/useGetCurrentUser'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import { useTheme } from '@/theme/useTheme'

// ---------- constants ----------

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const QUADRANT_COLOR_KEY: Record<MoodCategoryKey, 'highGood' | 'highTough' | 'lowGood' | 'lowTough'> = {
  'high-pleasant': 'highGood',
  'high-challenging': 'highTough',
  'low-pleasant': 'lowGood',
  'low-challenging': 'lowTough',
}

const MOOD_WORDS: Record<string, string> = {
  'high-pleasant': 'Strong',
  'high-challenging': 'Fired',
  'low-pleasant': 'Easy',
  'low-challenging': 'Heavy',
}

// ---------- sub-components ----------

type StatCellProps = {
  label: string
  value: string
  unit: string
  dimmed?: boolean
  isLast?: boolean
}

function StatCell({ label, value, unit, dimmed = false, isLast = false }: StatCellProps) {
  const { text, rule } = useTheme()
  return (
    <View
      style={[
        styles.statCell,
        !isLast && { borderRightWidth: 1, borderRightColor: rule.subtle },
      ]}
    >
      <Dateline style={styles.statLabelSpacing}>{label}</Dateline>
      <View style={styles.statValueRow}>
        <Text
          style={[
            styles.statValue,
            { color: dimmed ? text.tertiary : text.primary },
          ]}
        >
          {value}
        </Text>
        <Text style={[styles.statUnit, { color: dimmed ? text.disabled : text.tertiary }]}>
          {unit}
        </Text>
      </View>
    </View>
  )
}

type HeaderBandProps = {
  block: Block
  config: BlockTypeConfig
  currentDay: number
  progressPercent: number
  daysLeft: number
}

function HeaderBand({ block, config, currentDay, progressPercent, daysLeft }: HeaderBandProps) {
  const { text } = useTheme()
  const endDate = format(parseISO(block.endDate), 'MMM d')

  return (
    <View
      style={[
        styles.headerBand,
        {
          backgroundColor: config.accentColor + '12',
          borderBottomColor: config.accentColor + '28',
        },
      ]}
    >
      {/* Left column — Day hero */}
      <View style={styles.bandLeft}>
        <Dateline style={{ color: config.accentColor }}>DAY</Dateline>
        <Text style={[styles.dayNumeral, { color: text.primary }]}>
          {currentDay}
        </Text>
      </View>

      {/* Right column — Block info */}
      <View style={styles.bandRight}>
        <Dateline style={[styles.bandBlockLabel, { color: config.accentColor }]}>
          {config.label}
        </Dateline>
        <Text style={[styles.bandTagline, { color: text.secondary }]}>
          {config.tagline}
        </Text>
        <View style={[styles.bandProgressTrack, { backgroundColor: config.accentColor + '22' }]}>
          <View
            style={[
              styles.bandProgressFill,
              {
                backgroundColor: config.accentColor,
                width: `${Math.round(progressPercent)}%` as `${number}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.bandMeta, { color: text.tertiary }]}>
          {daysLeft} days left · ends {endDate}
        </Text>
      </View>
    </View>
  )
}

function NoBlockPrompt() {
  const { text, rule, accent } = useTheme()
  return (
    <TouchableOpacity
      style={[styles.noBlockPrompt, { borderColor: rule.strong }]}
      onPress={() => router.push('/blocks')}
      activeOpacity={0.7}
    >
      <Text style={[styles.noBlockText, { color: text.tertiary }]}>
        No active training block.
      </Text>
      <Text style={[styles.noBlockCta, { color: accent.default }]}>
        Start one →
      </Text>
    </TouchableOpacity>
  )
}

type AffirmationCardProps = { affirmation: string | undefined }

function AffirmationCard({ affirmation }: AffirmationCardProps) {
  const { bg, text, accent, radius } = useTheme()
  if (!affirmation) return null
  return (
    <View
      style={[
        styles.affirmationCard,
        { backgroundColor: bg.surface, borderColor: bg.elevated, borderRadius: radius.sm },
      ]}
    >
      <Dateline style={[styles.blockLabelSpacing, { color: accent.default }]}>Today</Dateline>
      <Text style={[styles.affirmationText, { color: text.primary }]}>
        {affirmation}
      </Text>
    </View>
  )
}

function BlockFocusRow() {
  const { text, rule } = useTheme()
  const { data: activeBlock } = useActiveBlock()
  const config = activeBlock ? BLOCK_TYPE_CONFIG[activeBlock.blockType] : null
  if (!config) return null

  return (
    <View style={[styles.focusRow, { borderBottomColor: rule.subtle }]}>
      <View style={[styles.focusSpine, { backgroundColor: config.accentColor + '60' }]} />
      <View style={styles.focusContent}>
        <Dateline style={styles.focusLabel}>Block Focus</Dateline>
        <Text style={[styles.focusText, { color: text.secondary }]}>
          {config.focus}
        </Text>
      </View>
    </View>
  )
}

function WeekMoodRow() {
  const { text, rule, mood } = useTheme()
  const { data: runs = [] } = useRuns()
  const { data: moods } = useGetAllMoods()

  const recentRuns = runs.slice(0, 5)

  if (recentRuns.length === 0) return null

  const moodCounts = recentRuns.reduce<Record<string, number>>((acc, run) => {
    if (!moods) return acc
    const runMood = moods.find((m) => m.id === run.moodId)
    if (runMood) acc[runMood.quadrant] = (acc[runMood.quadrant] || 0) + 1
    return acc
  }, {})

  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as MoodCategoryKey | undefined

  return (
    <View style={[styles.moodRow, { borderBottomColor: rule.subtle }]}>
      <View style={styles.moodHeader}>
        <Dateline>This week, mostly —</Dateline>
        {dominantMood && (
          <Text style={[styles.moodWord, { color: mood[QUADRANT_COLOR_KEY[dominantMood]] }]}>
            {MOOD_WORDS[dominantMood]}.
          </Text>
        )}
      </View>
      <View style={styles.moodStripe}>
        {recentRuns.map((run) => {
          const runMood = moods?.find((m) => m.id === run.moodId)
          const segColor = runMood ? mood[QUADRANT_COLOR_KEY[runMood.quadrant]] : rule.default
          return (
            <View
              key={run.id}
              style={[styles.moodSegment, { backgroundColor: segColor }]}
            />
          )
        })}
        {Array.from({ length: Math.max(0, 5 - recentRuns.length) }).map((_, i) => (
          <View key={`ghost-${i}`} style={[styles.moodSegment, { backgroundColor: rule.default }]} />
        ))}
      </View>
    </View>
  )
}

type RecentRunsCardProps = {
  runs: RunResponse[]
}

function RecentRunsCard({ runs }: RecentRunsCardProps) {
  const { text, rule, accent } = useTheme()
  return (
    <View style={[styles.recentRunsCard, { borderTopColor: rule.subtle }]}>
      <View style={styles.recentRunsHeader}>
        <Text style={[styles.recentRunsTitle, { color: text.primary }]}>Recent runs</Text>
        <TouchableOpacity onPress={() => router.navigate('/logbook')}>
          <Text style={[styles.seeAll, { color: text.tertiary }]}>See all</Text>
        </TouchableOpacity>
      </View>
      {runs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: text.tertiary }]}>
            Nothing logged yet.
          </Text>
          <TouchableOpacity onPress={() => router.push('/log')}>
            <Text style={[styles.emptyStateCta, { color: accent.default }]}>
              Log your first run
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        runs.map((run, i) => (
          <View key={run.id}>
            {i > 0 && <View style={[styles.divider, { backgroundColor: rule.subtle }]} />}
            <RunRow run={run} compact />
          </View>
        ))
      )}
    </View>
  )
}

// ---------- main screen ----------

export function HomeScreen() {
  const { bg, text, rule, accent } = useTheme()
  const insets = useSafeAreaInsets()
  const { unit } = useDistanceUnit()

  const { data: user } = useGetCurrentUser()
  const { data: activeBlock } = useActiveBlock()
  const { data: affirmation } = useTodayAffirmation()
  const { data: runs = [] } = useRuns()

  const recentRuns = runs.slice(0, 3)
  const { weeklyDistanceMeters, streak, blockRunCount } = computeWeeklyStats(
    runs,
    activeBlock?.id,
  )

  const initials =
    user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : ''
  const { value: weeklyValue, unit: weeklyUnit } = formatDistanceParts(weeklyDistanceMeters, unit)

  const config = activeBlock ? BLOCK_TYPE_CONFIG[activeBlock.blockType] : null

  let currentDay = 0
  let totalDays = 0
  let progressPercent = 0
  let daysLeft = 0
  if (activeBlock) {
    const today = new Date()
    const start = parseISO(activeBlock.startDate)
    const end = parseISO(activeBlock.endDate)
    currentDay = Math.max(1, differenceInCalendarDays(today, start) + 1)
    totalDays = Math.max(1, differenceInCalendarDays(end, start) + 1)
    progressPercent = Math.min(100, Math.max(0, (currentDay / totalDays) * 100))
    daysLeft = Math.max(0, totalDays - currentDay)
  }

  return (
    <View style={[styles.screen, { backgroundColor: bg.base }]}>
      {/* Header — sticky above scroll */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, backgroundColor: bg.base },
        ]}
      >
        <View>
          <Text style={[styles.greetingSub, { color: text.tertiary }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.greetingName, { color: text.primary }]}>
            {user?.firstName ?? ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.avatarBtn,
            {
              backgroundColor: activeBlock ? `${accent.default}14` : bg.surface,
              borderColor: activeBlock ? `${accent.default}40` : rule.default,
            },
          ]}
          onPress={() => router.push('/(modals)/profile')}
          accessibilityLabel="Profile"
          accessibilityRole="button"
        >
          <Text style={[styles.avatarText, { color: text.secondary }]}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Header band */}
        {activeBlock && config
          ? (
            <HeaderBand
              block={activeBlock}
              config={config}
              currentDay={currentDay}
              progressPercent={progressPercent}
              daysLeft={daysLeft}
            />
          )
          : <NoBlockPrompt />
        }

        {/* 2. Affirmation — only when block + affirmation exist */}
        {activeBlock && affirmation?.affirmation && (
          <AffirmationCard affirmation={affirmation.affirmation} />
        )}

        {/* 3. Block focus — only when block active */}
        {activeBlock && <BlockFocusRow />}

        {/* 4. Stats — always shown */}
        <View style={[styles.statsRow, { borderColor: rule.subtle }]}>
          <StatCell label="THIS WEEK" value={weeklyValue} unit={weeklyUnit} />
          <StatCell
            label="STREAK"
            value={String(streak)}
            unit={streak === 1 ? 'day' : 'days'}
          />
          <StatCell
            label="BLOCK RUNS"
            value={String(blockRunCount)}
            unit="runs"
            dimmed={activeBlock == null}
            isLast
          />
        </View>

        {/* 5. Week mood */}
        <WeekMoodRow />

        {/* 6. Recent runs */}
        <RecentRunsCard runs={recentRuns} />
      </ScrollView>
    </View>
  )
}

// ---------- styles ----------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  greetingSub: {
    fontFamily: 'Manrope',
    fontSize: 12,
    lineHeight: 18,
  },
  greetingName: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 26,
    lineHeight: 29,
    letterSpacing: -0.3,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'ManropeSemiBold',
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  // Header band
  headerBand: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    borderBottomWidth: 1,
  },
  bandLeft: {
    marginRight: 16,
    alignItems: 'flex-start',
  },
  dayNumeral: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 64,
    letterSpacing: -0.04 * 64,
    lineHeight: 64 * 0.88,
  },
  bandRight: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bandBlockLabel: {
    marginBottom: 3,
  },
  bandTagline: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 14,
    lineHeight: 14 * 1.35,
    marginBottom: 9,
  },
  bandProgressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 5,
  },
  bandProgressFill: {
    height: 3,
    borderRadius: 2,
  },
  bandMeta: {
    fontFamily: 'Manrope',
    fontSize: 9,
  },
  // No-block prompt
  noBlockPrompt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 14,
    padding: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 4,
  },
  noBlockText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 14,
  },
  noBlockCta: {
    fontFamily: 'ManropeSemiBold',
    fontSize: 11,
  },
  // Affirmation card
  affirmationCard: {
    marginHorizontal: 16,
    borderWidth: 1,
    padding: 16,
  },
  blockLabelSpacing: {
    marginBottom: 6,
  },
  affirmationText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 14,
    lineHeight: 14 * 1.55,
  },
  // Block focus row
  focusRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: 10,
    paddingRight: 20,
    borderBottomWidth: 1,
  },
  focusSpine: {
    width: 3,
    marginRight: 10,
    borderRadius: 2,
    marginLeft: 20,
  },
  focusContent: {
    flex: 1,
  },
  focusLabel: {
    marginBottom: 2,
  },
  focusText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    lineHeight: 17,
  },
  // Stats row
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  statLabelSpacing: {
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  statValue: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 28,
    lineHeight: 32,
  },
  statUnit: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 11,
  },
  // Mood row
  moodRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  moodWord: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 13,
    letterSpacing: -0.1,
  },
  moodStripe: {
    flexDirection: 'row',
    height: 4,
    gap: 2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  moodSegment: {
    flex: 1,
    borderRadius: 2,
  },
  // Recent runs card
  recentRunsCard: {
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  recentRunsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  recentRunsTitle: {
    fontFamily: 'ManropeSemiBold',
    fontSize: 13,
  },
  seeAll: {
    fontFamily: 'Manrope',
    fontSize: 11,
  },
  divider: {
    height: 1,
  },
  // Empty state
  emptyState: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  emptyStateText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    textAlign: 'center',
  },
  emptyStateCta: {
    fontFamily: 'ManropeSemiBold',
    fontSize: 13,
  },
})

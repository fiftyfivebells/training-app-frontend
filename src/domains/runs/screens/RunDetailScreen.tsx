import { differenceInCalendarDays, parseISO } from 'date-fns'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Ionicons } from '@expo/vector-icons'

import { BLOCK_TYPE_CONFIG } from '@/domains/blocks/blocks.types'
import { useBlock } from '@/domains/blocks/hooks/useBlock'
import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import { DIM_FILL, QUADRANT_LABELS } from '@/domains/moods/moods.constants'
import type { MoodCategoryKey } from '@/domains/moods/moods.types'
import { RunTypeBadge } from '@/domains/runs/components/RunTypeBadge'
import { useDeleteRun } from '@/domains/runs/hooks/useDeleteRun'
import { useRun } from '@/domains/runs/hooks/useRun'
import { formatDistanceParts } from '@/domains/runs/utils/distance'
import { formatDurationDisplay } from '@/domains/runs/utils/duration'
import { formatPace, formatRunDate, generateRunTitle } from '@/domains/runs/utils/formatters'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import type { ThemeTokens } from '@/theme/tokens'
import { useTheme } from '@/theme/useTheme'

const MOOD_BORDER: Record<MoodCategoryKey, string> = {
  'high-pleasant':    'rgba(184,212,74,0.2)',
  'high-challenging': 'rgba(224,120,64,0.2)',
  'low-pleasant':     'rgba(74,196,212,0.2)',
  'low-challenging':  'rgba(155,96,184,0.2)',
}

function rpeZoneLabel(rating: number): string {
  if (rating <= 3) return 'Easy'
  if (rating <= 6) return 'Moderate'
  if (rating <= 8) return 'Hard'
  return 'All-out'
}

function rpeZoneColor(rating: number, colors: ThemeTokens['colors']): string {
  if (rating <= 3) return colors.semantic.successFg
  if (rating <= 6) return colors.semantic.warningFg
  if (rating <= 8) return colors.mood.highTough
  return colors.semantic.errorFg
}

export function RunDetailScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data: run, isLoading } = useRun(id)
  const { data: block } = useBlock(run?.blockId ?? '', { enabled: !!run?.blockId })
  const { data: moods } = useGetAllMoods()
  const { unit } = useDistanceUnit()
  const deleteRun = useDeleteRun()

  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [overflowActive, setOverflowActive] = useState(false)

  const QUAD_COLOR: Record<MoodCategoryKey, string> = {
    'high-pleasant':    colors.mood.highGood,
    'high-challenging': colors.mood.highTough,
    'low-pleasant':     colors.mood.lowGood,
    'low-challenging':  colors.mood.lowTough,
  }

  const mood = moods?.find((m) => m.id === run?.moodId) ?? null
  const quadrantColor = mood ? QUAD_COLOR[mood.quadrant] : colors.text.tertiary

  const dismissDropdown = () => {
    setDropdownVisible(false)
    setOverflowActive(false)
  }

  const handleDeleteConfirm = () => {
    if (!run) return
    Alert.alert('Delete run?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteRun.mutate(run.id, { onSuccess: () => router.back() }),
      },
    ])
  }

  const handleOverflowMenu = () => {
    if (!run) return
    if (Platform.OS === 'ios') {
      setOverflowActive(true)
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit run', 'Delete run'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          setOverflowActive(false)
          if (buttonIndex === 1) router.push(`/runs/${run.id}/edit`)
          if (buttonIndex === 2) handleDeleteConfirm()
        },
      )
    } else {
      setOverflowActive(true)
      setDropdownVisible(true)
    }
  }

  if (isLoading || !run) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background.base }]}>
        <ActivityIndicator color={colors.copper.default} />
      </View>
    )
  }

  const runType = run.runType
    ? run.runType.charAt(0).toUpperCase() + run.runType.slice(1).toLowerCase()
    : undefined
  const title = generateRunTitle(runType, mood?.label)
  const dateLabel = formatRunDate(run.date)
  const { value: distValue, unit: distUnit } = formatDistanceParts(run.distanceMeters, unit)
  const durationStr = formatDurationDisplay(run.durationSeconds)
  const paceStr = formatPace(run.distanceMeters, run.durationSeconds, unit)

  return (
    <View style={[styles.screen, { backgroundColor: colors.background.base }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
          accessibilityLabel="Back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.secondary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.headerDate, { color: colors.text.tertiary }]}>{dateLabel}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.overflowBtn,
            {
              backgroundColor: overflowActive
                ? colors.background.input
                : colors.background.surface,
              borderColor: overflowActive ? colors.copper.default : colors.border.default,
            },
          ]}
          onPress={handleOverflowMenu}
          accessibilityLabel="More options"
          accessibilityRole="button"
        >
          <Ionicons
            name="ellipsis-vertical"
            size={16}
            color={overflowActive ? colors.copper.default : colors.text.secondary}
          />
        </TouchableOpacity>
      </View>

      {Platform.OS === 'android' && dropdownVisible && (
        <TouchableWithoutFeedback onPress={dismissDropdown}>
          <View style={styles.dimOverlay} />
        </TouchableWithoutFeedback>
      )}

      {Platform.OS === 'android' && dropdownVisible && (
        <View
          style={[
            styles.dropdown,
            {
              top: insets.top + 52,
              backgroundColor: colors.background.elevated,
              borderColor: colors.border.default,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.dropdownRow}
            onPress={() => {
              dismissDropdown()
              router.push(`/runs/${run.id}/edit`)
            }}
          >
            <Ionicons name="pencil" size={16} color={colors.text.primary} />
            <Text style={[styles.dropdownLabel, { color: colors.text.primary }]}>Edit run</Text>
          </TouchableOpacity>
          <View style={[styles.dropdownDivider, { backgroundColor: colors.border.subtle }]} />
          <TouchableOpacity
            style={styles.dropdownRow}
            onPress={() => {
              dismissDropdown()
              handleDeleteConfirm()
            }}
          >
            <Ionicons name="trash" size={16} color={colors.semantic.errorFg} />
            <Text style={[styles.dropdownLabel, { color: colors.semantic.errorFg }]}>
              Delete run
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* Mood card */}
        {mood && (
          <View
            style={[
              styles.moodCard,
              {
                backgroundColor: DIM_FILL[mood.quadrant],
                borderColor: MOOD_BORDER[mood.quadrant],
              },
            ]}
          >
            <Text style={[styles.cardSectionLabel, { color: quadrantColor }]}>HOW IT FELT</Text>
            <View style={styles.moodRow}>
              <View style={[styles.moodDot, { backgroundColor: quadrantColor }]} />
              <View style={styles.moodTextCol}>
                <Text style={[styles.moodFeeling, { color: colors.text.primary }]}>
                  {mood.label}
                </Text>
                <Text style={[styles.moodDescription, { color: colors.text.secondary }]}>
                  {mood.description}
                </Text>
                <Text style={[styles.moodQuadrant, { color: colors.text.tertiary }]}>
                  {QUADRANT_LABELS[mood.quadrant]}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Primary stats card */}
        <View
          style={[
            styles.statsCard,
            { backgroundColor: colors.background.surface, borderColor: colors.border.subtle },
          ]}
        >
          <View style={styles.heroRow}>
            <View style={styles.statCol}>
              <Text
                style={[styles.heroValue, { color: colors.text.primary }]}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {distValue}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>
                {distUnit.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border.subtle }]} />
            <View style={styles.statCol}>
              <Text
                style={[styles.heroValue, { color: colors.text.primary }]}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {durationStr}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>DURATION</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border.subtle }]} />
            <View style={styles.statCol}>
              <Text
                style={[styles.heroValue, { color: colors.text.primary }]}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {paceStr}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>
                /{unit.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={[styles.secondaryRow, { borderTopColor: colors.border.subtle }]}>
            <View style={styles.secondaryLeft}>
              <RunTypeBadge runType={runType} />
              <Text style={[styles.runTypeLabel, { color: colors.text.tertiary }]}>run type</Text>
            </View>
            <View style={styles.rpeGroup}>
              <Text style={[styles.rpeHeaderLabel, { color: colors.text.tertiary }]}>RPE</Text>
              <View style={[styles.rpeChip, { backgroundColor: colors.background.input }]}>
                <Text style={[styles.rpeValue, { color: colors.text.primary }]}>
                  {run.exertionRating}
                </Text>
                <Text style={[styles.rpeDenom, { color: colors.text.tertiary }]}>/10</Text>
              </View>
              <Text
                style={[styles.rpeZone, { color: rpeZoneColor(run.exertionRating, colors) }]}
              >
                {rpeZoneLabel(run.exertionRating)}
              </Text>
            </View>
          </View>
        </View>

        {/* Block context row */}
        {run.blockId && block && (
          <TouchableOpacity
            style={[
              styles.blockRow,
              { backgroundColor: colors.background.surface, borderColor: colors.border.subtle },
            ]}
            onPress={() => router.push(`/blocks/${run.blockId}`)}
            accessibilityRole="button"
          >
            <View style={styles.blockLeft}>
              <View
                style={[
                  styles.blockDot,
                  { backgroundColor: BLOCK_TYPE_CONFIG[block.blockType].accentColor },
                ]}
              />
              <View>
                <Text style={[styles.cardSectionLabel, { color: colors.text.tertiary }]}>
                  TRAINING BLOCK
                </Text>
                <Text style={[styles.blockContext, { color: colors.text.primary }]}>
                  {block.status === 'active'
                    ? `${BLOCK_TYPE_CONFIG[block.blockType].label} · Day ${Math.max(
                        1,
                        differenceInCalendarDays(new Date(), parseISO(block.startDate)) + 1,
                      )}`
                    : `${BLOCK_TYPE_CONFIG[block.blockType].label} · Completed`}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}

        {/* Notes card */}
        {run.notes && (
          <View
            style={[
              styles.notesCard,
              { backgroundColor: colors.background.surface, borderColor: colors.border.subtle },
            ]}
          >
            <Text style={[styles.cardSectionLabel, { color: colors.text.tertiary }]}>NOTES</Text>
            <Text style={[styles.notesText, { color: colors.text.secondary }]}>{run.notes}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

// ---------- styles ----------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  headerDate: {
    fontSize: 12,
    marginTop: 1,
  },
  overflowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 50,
  },
  dropdown: {
    position: 'absolute',
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    width: 180,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownDivider: {
    height: 1,
  },
  scrollContent: {
    paddingTop: 8,
    gap: 10,
  },
  // Stats card
  statsCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  heroRow: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  heroValue: {
    fontSize: 42,
    fontWeight: '600',
    letterSpacing: -1.5,
    lineHeight: 42,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 48,
    alignSelf: 'center',
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  secondaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  runTypeLabel: {
    fontSize: 12,
  },
  rpeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rpeHeaderLabel: {
    fontSize: 12,
  },
  rpeChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  rpeValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  rpeDenom: {
    fontSize: 11,
  },
  rpeZone: {
    fontSize: 12,
  },
  // Mood card
  moodCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    padding: 16,
  },
  cardSectionLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  moodDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  moodTextCol: {
    flex: 1,
  },
  moodFeeling: {
    fontSize: 24,
    fontFamily: 'Fraunces_400Regular',
    letterSpacing: -0.3,
    lineHeight: 27,
  },
  moodDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  moodQuadrant: {
    fontSize: 11,
    marginTop: 4,
  },
  // Block row
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    padding: 16,
  },
  blockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  blockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  blockContext: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  // Notes card
  notesCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 22,
  },
})

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

import { useBlock } from '@/domains/blocks/hooks/useBlock'
import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import { QUADRANT_LABELS } from '@/domains/moods/moods.constants'
import type { MoodCategoryKey } from '@/domains/moods/moods.types'
import { useDeleteRun } from '@/domains/runs/hooks/useDeleteRun'
import { useRun } from '@/domains/runs/hooks/useRun'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { formatDistanceParts } from '@/domains/runs/utils/distance'
import { formatDurationDisplay } from '@/domains/runs/utils/duration'
import { formatPace, formatRunDate } from '@/domains/runs/utils/formatters'
import { computeWeeklyStats } from '@/domains/runs/utils/weeklyStats'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import { Dateline, Readout, Rule } from '@/components/ui'
import { useTheme } from '@/theme/useTheme'

export function RunDetailScreen() {
  const { bg, text, rule, accent, mood, moodBg, semantic } = useTheme()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data: run, isLoading } = useRun(id)
  const { data: rawRuns = [] } = useRuns()
  const { data: block } = useBlock(run?.blockId ?? '', { enabled: !!run?.blockId })
  const { data: moods } = useGetAllMoods()
  const { unit } = useDistanceUnit()
  const deleteRun = useDeleteRun()

  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [overflowActive, setOverflowActive] = useState(false)

  const QUAD_COLOR: Record<MoodCategoryKey, string> = {
    'high-pleasant':    mood.highGood,
    'high-challenging': mood.highTough,
    'low-pleasant':     mood.lowGood,
    'low-challenging':  mood.lowTough,
  }

  const QUAD_BG_COLOR: Record<MoodCategoryKey, string> = {
    'high-pleasant':    moodBg.highGood,
    'high-challenging': moodBg.highTough,
    'low-pleasant':     moodBg.lowGood,
    'low-challenging':  moodBg.lowTough,
  }

  const runMood = moods?.find((m) => m.id === run?.moodId) ?? null
  const quadrantColor = runMood ? QUAD_COLOR[runMood.quadrant] : text.tertiary
  const moodBgColor = runMood ? QUAD_BG_COLOR[runMood.quadrant] : null

  const entryIdx = run ? rawRuns.findIndex((r) => r.id === run.id) : -1
  const entryNumber = entryIdx !== -1 ? rawRuns.length - entryIdx : null

  const { weeklyDistanceMeters } = computeWeeklyStats(rawRuns, undefined)

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
      <View style={[styles.loadingScreen, { backgroundColor: bg.base }]}>
        <ActivityIndicator color={accent.default} />
      </View>
    )
  }

  const { value: distValue, unit: distUnit } = formatDistanceParts(run.distanceMeters, unit)
  const durationStr = formatDurationDisplay(run.durationSeconds)
  const paceStr = formatPace(run.distanceMeters, run.durationSeconds, unit)
  const { value: weeklyValue, unit: weeklyUnit } = formatDistanceParts(weeklyDistanceMeters, unit)

  return (
    <View style={[styles.screen, { backgroundColor: bg.base }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityLabel="Back"
          accessibilityRole="button"
        >
          <Text style={[styles.backBtnText, { color: text.secondary }]}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.overflowBtn,
            {
              backgroundColor: overflowActive ? bg.input : bg.surface,
              borderColor: overflowActive ? accent.default : rule.default,
            },
          ]}
          onPress={handleOverflowMenu}
          accessibilityLabel="More options"
          accessibilityRole="button"
        >
          <Ionicons
            name="ellipsis-vertical"
            size={16}
            color={overflowActive ? accent.default : text.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* Android dim overlay */}
      {Platform.OS === 'android' && dropdownVisible && (
        <TouchableWithoutFeedback onPress={dismissDropdown}>
          <View style={styles.dimOverlay} />
        </TouchableWithoutFeedback>
      )}

      {/* Android dropdown */}
      {Platform.OS === 'android' && dropdownVisible && (
        <View
          style={[
            styles.dropdown,
            {
              top: insets.top + 52,
              backgroundColor: bg.elevated,
              borderColor: rule.default,
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
            <Ionicons name="pencil" size={16} color={text.primary} />
            <Text style={[styles.dropdownLabel, { color: text.primary }]}>Edit run</Text>
          </TouchableOpacity>
          <View style={[styles.dropdownDivider, { backgroundColor: rule.subtle }]} />
          <TouchableOpacity
            style={styles.dropdownRow}
            onPress={() => {
              dismissDropdown()
              handleDeleteConfirm()
            }}
          >
            <Ionicons name="trash" size={16} color={semantic.error} />
            <Text style={[styles.dropdownLabel, { color: semantic.error }]}>Delete run</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      >
        {/* Entry + date */}
        <Dateline style={{ marginBottom: 4 }}>ENTRY № {entryNumber ?? '—'}</Dateline>
        <Text style={[styles.dateLabel, { color: text.tertiary }]}>{formatRunDate(run.date)}</Text>

        {/* Mood hero */}
        {runMood ? (
          <>
            <Text style={[styles.heroMoodWord, { color: quadrantColor }]}>
              {runMood.label}.
            </Text>
            <Text style={[styles.heroSubtitle, { color: text.secondary }]}>
              {runMood.description}
            </Text>
            <Rule style={styles.rule} />
            <View
              style={[
                styles.signalStrip,
                { borderColor: quadrantColor, backgroundColor: moodBgColor ?? 'transparent' },
              ]}
            >
              <Dateline style={{ color: quadrantColor }}>
                {QUADRANT_LABELS[runMood.quadrant]}
              </Dateline>
              <Text style={[styles.signalLabel, { color: quadrantColor }]}>
                {runMood.description}
              </Text>
            </View>
            <Rule style={styles.rule} />
          </>
        ) : (
          <>
            <Text style={[styles.noMoodText, { color: text.disabled }]}>No mood logged.</Text>
            <Rule style={styles.rule} />
          </>
        )}

        {/* Primary readouts — Distance + Time */}
        <View style={styles.primaryReadouts}>
          <Readout
            size="lg"
            value={distValue}
            unit={distUnit}
            label="DISTANCE"
            style={styles.readoutCell}
          />
          <Readout
            size="lg"
            value={durationStr}
            label="TIME"
            style={styles.readoutCell}
          />
        </View>

        <Rule style={styles.rule} />

        {/* Secondary readouts — Pace + RPE + Weekly */}
        <View style={styles.secondaryReadouts}>
          <Readout
            size="md"
            value={paceStr}
            unit={`/${unit}`}
            label="PACE"
            style={styles.readoutCell}
          />
          <Readout
            size="md"
            value={String(run.exertionRating)}
            unit="/10"
            label="RPE"
            style={styles.readoutCell}
          />
          <Readout
            size="md"
            value={weeklyValue}
            unit={weeklyUnit}
            label="WEEKLY"
            style={styles.readoutCell}
          />
        </View>

        {/* Block row */}
        {run.blockId && block && (
          <>
            <Rule style={styles.rule} />
            <TouchableOpacity
              style={styles.blockTouchable}
              onPress={() => router.push(`/blocks/${run.blockId}`)}
              accessibilityRole="button"
            >
              <View style={styles.blockMeta}>
                <Dateline>TRAINING BLOCK</Dateline>
                <Text style={[styles.blockName, { color: text.primary }]}>{block.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={text.tertiary} />
            </TouchableOpacity>
          </>
        )}

        {/* Notes */}
        {run.notes && (
          <>
            <Rule style={styles.rule} />
            <View style={styles.notesSection}>
              <Dateline style={{ marginBottom: 6 }}>NOTES</Dateline>
              <Text style={[styles.notesText, { color: text.secondary }]}>{run.notes}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
}

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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 14,
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  dateLabel: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 13,
  },
  heroMoodWord: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 64,
    lineHeight: 68,
    letterSpacing: -1,
    marginTop: 16,
  },
  heroSubtitle: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  noMoodText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 28,
    marginTop: 16,
  },
  rule: {
    marginVertical: 20,
  },
  signalStrip: {
    borderWidth: 1,
    borderRadius: 3,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 2,
  },
  signalLabel: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 12,
  },
  primaryReadouts: {
    flexDirection: 'row',
    gap: 32,
  },
  secondaryReadouts: {
    flexDirection: 'row',
    gap: 16,
  },
  readoutCell: {
    flex: 1,
  },
  blockTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blockMeta: {
    gap: 2,
  },
  blockName: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 17,
  },
  notesSection: {},
  notesText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 15,
    lineHeight: 24,
  },
})

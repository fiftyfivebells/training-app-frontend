import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  ActionSheetIOS,
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

import { RunRow } from '@/domains/runs/components/RunRow'
import { metersToDistanceUnit } from '@/domains/runs/utils/distance'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import { Dateline } from '@/components/ui'
import { useTheme } from '@/theme/useTheme'

import { BLOCK_TYPE_CONFIG } from '../constants/blockTypes'
import { useBlock } from '../hooks/useBlock'
import { useBlockRuns } from '../hooks/useBlockRuns'
import { useBlockStats } from '../hooks/useBlockStats'
import { useCompleteBlock } from '../hooks/useCompleteBlock'
import { useDeleteBlock } from '../hooks/useDeleteBlock'
import { MoodTimelineCard } from '../components/MoodTimelineCard'

export function BlockDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { bg, text, rule, accent, semantic, radius } = useTheme()
  const insets = useSafeAreaInsets()
  const { unit: distUnit } = useDistanceUnit()

  const { data: block, isLoading: blockLoading } = useBlock(id ?? '')
  const { data: blockRuns = [] } = useBlockRuns(id ?? '')
  const { data: stats } = useBlockStats(id ?? '')

  const completeBlock = useCompleteBlock()
  const deleteBlock = useDeleteBlock()

  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [overflowActive, setOverflowActive] = useState(false)

  const dismissDropdown = useCallback(() => {
    setDropdownVisible(false)
    setOverflowActive(false)
  }, [])

  const handleCompleteConfirm = useCallback(() => {
    if (!block) return
    Alert.alert(
      'Finish training block?',
      'This will mark the block as completed and stop its affirmations.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish Block',
          onPress: () => completeBlock.mutate(block.id),
        },
      ],
    )
  }, [block, completeBlock])

  const handleDeleteConfirm = useCallback(() => {
    if (!block) return
    Alert.alert(
      'Delete training block?',
      'This cannot be undone. Runs in this block will not be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBlock.mutate(block.id, { onSuccess: () => router.back() }),
        },
      ],
    )
  }, [block, deleteBlock])

  const handleEdit = useCallback(() => {
    if (!block) return
    router.push({
      pathname: '/(modals)/block-edit',
      params: { id: block.id },
    })
  }, [block])

  const handleOverflowMenu = useCallback(() => {
    if (!block) return
    const isIOS = Platform.OS === 'ios'
    const isActive = block.status === 'active'

    const options = ['Cancel']
    options.push('Edit block')
    if (isActive) options.push('Finish block')
    options.push('Delete block')

    if (isIOS) {
      setOverflowActive(true)
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: options.indexOf('Delete block'),
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          setOverflowActive(false)
          const selected = options[buttonIndex]
          if (selected === 'Edit block') handleEdit()
          if (selected === 'Finish block') handleCompleteConfirm()
          if (selected === 'Delete block') handleDeleteConfirm()
        },
      )
    } else {
      setOverflowActive(true)
      setDropdownVisible(true)
    }
  }, [block, handleEdit, handleCompleteConfirm, handleDeleteConfirm])

  if (blockLoading || !block) {
    return <View style={[styles.screen, { backgroundColor: bg.base }]} />
  }

  const config = BLOCK_TYPE_CONFIG[block.blockType]
  const totalDays = differenceInCalendarDays(parseISO(block.endDate), parseISO(block.startDate)) + 1

  const distValue = stats
    ? Math.round(
        metersToDistanceUnit(
          stats.totalDistanceMeters,
          distUnit === 'mi' ? 'miles' : distUnit,
        ),
      )
    : 0

  return (
    <View style={[styles.screen, { backgroundColor: bg.base }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: bg.base,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={text.secondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text.primary }]}>
          {config.label}
        </Text>
        <TouchableOpacity
          style={styles.overflowBtn}
          onPress={handleOverflowMenu}
          accessibilityLabel="More options"
          accessibilityRole="button"
        >
          <Ionicons
            name="ellipsis-vertical"
            size={22}
            color={text.secondary}
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
              backgroundColor: bg.elevated,
              borderColor: rule.default,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.dropdownRow}
            onPress={() => {
              dismissDropdown()
              handleEdit()
            }}
          >
            <Ionicons name="create-outline" size={16} color={text.primary} />
            <Text style={[styles.dropdownLabel, { color: text.primary }]}>Edit block</Text>
          </TouchableOpacity>
          <View style={[styles.dropdownDivider, { backgroundColor: rule.subtle }]} />

          {block.status === 'active' && (
            <>
              <TouchableOpacity
                style={styles.dropdownRow}
                onPress={() => {
                  dismissDropdown()
                  handleCompleteConfirm()
                }}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color={text.primary} />
                <Text style={[styles.dropdownLabel, { color: text.primary }]}>Finish block</Text>
              </TouchableOpacity>
              <View style={[styles.dropdownDivider, { backgroundColor: rule.subtle }]} />
            </>
          )}
          <TouchableOpacity
            style={styles.dropdownRow}
            onPress={() => {
              dismissDropdown()
              handleDeleteConfirm()
            }}
          >
            <Ionicons name="trash" size={16} color={semantic.error} />
            <Text style={[styles.dropdownLabel, { color: semantic.error }]}>
              Delete block
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity Card */}
        <View
          style={[
            styles.identityCard,
            {
              backgroundColor: bg.surface,
              borderColor: rule.subtle,
              borderLeftColor: config.accentColor,
              borderTopRightRadius: radius.lg,
              borderBottomRightRadius: radius.lg,
            },
          ]}
        >
          <View style={styles.identityTop}>
            <View style={styles.identityTypeRow}>
              <View style={[styles.dot8, { backgroundColor: config.accentColor }]} />
              <Text style={[styles.typeLabel, { color: config.accentColor }]}>
                {config.label.toUpperCase()}
              </Text>
            </View>

            <View
              style={[
                styles.dayCounter,
                {
                  backgroundColor: config.accentColor + '14',
                  borderColor: config.accentColor + '26',
                },
              ]}
            >
              <Text style={[styles.dayNumber, { color: text.primary }]}>
                {totalDays}
              </Text>
              <Text style={[styles.dayLabel, { color: text.tertiary }]}>Days</Text>
            </View>
          </View>

          <Text
            style={[
              styles.tagline,
              { color: text.primary, fontFamily: 'Fraunces_400Regular_Italic' },
            ]}
          >
            {config.tagline}
          </Text>

          {block.status === 'completed' ? (
            <View
              style={[
                styles.completionBadge,
                {
                  backgroundColor: semantic.successBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.completionBadgeText,
                  { color: semantic.success },
                ]}
              >
                Completed · {format(parseISO(block.endDate), 'MMM d')}
              </Text>
            </View>
          ) : (
            <View style={styles.progressMeta}>
              <Text style={[styles.progressMetaText, { color: text.tertiary }]}>
                Ends {format(parseISO(block.endDate), 'MMM d')}
              </Text>
            </View>
          )}

          <View style={styles.progressMeta}>
            <Text style={[styles.progressMetaText, { color: text.tertiary }]}>
              Started {format(parseISO(block.startDate), 'MMM d')}
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCell,
              {
                backgroundColor: bg.surface,
                borderColor: rule.subtle,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: text.primary }]}>
              {stats?.runCount ?? 0}
            </Text>
            <Text style={[styles.statUnit, { color: text.tertiary }]}>Runs</Text>
          </View>

          <View
            style={[
              styles.statCell,
              {
                backgroundColor: bg.surface,
                borderColor: rule.subtle,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: text.primary }]}>
              {distValue}
            </Text>
            <Text style={[styles.statUnit, { color: text.tertiary }]}>
              {distUnit}
            </Text>
          </View>

          <View
            style={[
              styles.statCell,
              {
                backgroundColor: bg.surface,
                borderColor: rule.subtle,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: text.primary }]}>
              {stats && stats.runCount > 0 ? stats.avgRpe.toFixed(1) : '—'}
            </Text>
            <Text style={[styles.statUnit, { color: text.tertiary }]}>Avg RPE</Text>
          </View>
        </View>

        <MoodTimelineCard blockRuns={blockRuns} />

        {/* Runs preview card */}
        <View
          style={[
            styles.runsCard,
            {
              backgroundColor: bg.surface,
              borderColor: rule.subtle,
            },
          ]}
        >
          <View style={styles.runsCardHeader}>
            <Dateline>RUNS THIS BLOCK</Dateline>
            <TouchableOpacity
              onPress={() => router.push(`/blocks/${block.id}/runs`)}
              accessibilityRole="button"
              accessibilityLabel={`See all ${blockRuns.length} runs`}
            >
              <Text style={[styles.seeAll, { color: accent.default }]}>
                See all {blockRuns.length}
              </Text>
            </TouchableOpacity>
          </View>

          {blockRuns.length === 0 ? (
            <Text style={[styles.noRunsText, { color: text.tertiary }]}>
              No runs logged
            </Text>
          ) : (
            blockRuns.slice(0, 3).map((run, index) => (
              <View key={run.id}>
                {index > 0 && (
                  <View
                    style={[styles.divider, { backgroundColor: rule.subtle }]}
                  />
                )}
                <RunRow run={run} />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Manrope',
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    borderRadius: 10,
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
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownDivider: {
    height: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
  identityCard: {
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 3,
    padding: 16,
  },
  identityTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  identityTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot8: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  typeLabel: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.06,
  },
  dayCounter: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'flex-end',
  },
  dayLabel: {
    fontFamily: 'Manrope',
    fontSize: 10,
  },
  dayNumber: {
    fontFamily: 'Manrope',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 26,
  },
  tagline: {
    fontSize: 22,
    lineHeight: 28,
    marginTop: 8,
  },
  completionBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 14,
  },
  completionBadgeText: {
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '500',
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressMetaText: {
    fontFamily: 'Manrope',
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
  },
  statCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Manrope',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  statUnit: {
    fontFamily: 'Manrope',
    fontSize: 10,
    marginTop: 2,
  },
  runsCard: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 8,
  },
  runsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  seeAll: {
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '500',
  },
  noRunsText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    padding: 16,
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
  },
})

import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker'
import { addDays, differenceInDays, format, parseISO } from 'date-fns'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/theme/useTheme'

import { BLOCK_TYPE_CONFIG } from '../constants/blockTypes'
import { useBlock } from '../hooks/useBlock'
import { useBlocks } from '../hooks/useBlocks'
import { useUpdateBlockDates } from '../hooks/useUpdateBlockDates'

function formatStartDate(date: Date, today: Date): string {
  if (date.getTime() === today.getTime()) {
    return `Today, ${format(date, 'MMM d')}`
  }
  return format(date, 'MMM d, yyyy')
}

export function BlockEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  const [isManuallySubmitting, setIsManuallySubmitting] = useState(false)
  const { data: block, isLoading: blockLoading } = useBlock(id ?? '')
  const { data: blocks = [], isLoading: blocksLoading } = useBlocks()

  const { mutate: updateDates, isPending: updatePending } = useUpdateBlockDates({
    onSuccess: () => router.back(),
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to update block. Please try again.')
    },
  })

  const isSubmitting = updatePending || blockLoading || blocksLoading || isManuallySubmitting

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [startDate, setStartDate] = useState<Date>(today)
  const [endDate, setEndDate] = useState<Date>(addDays(today, 28))
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  // Initialize state from block data
  useEffect(() => {
    if (block) {
      setStartDate(parseISO(block.startDate))
      setEndDate(parseISO(block.endDate))
    }
  }, [block])

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }, [])

  const isPendingBlock = useMemo(() => {
    if (!block) return false
    const todayStr = format(today, 'yyyy-MM-dd')
    return block.startDate > todayStr
  }, [block, today])

  const openStartDatePicker = useCallback(() => {
    if (!isPendingBlock) return // Cannot edit start date of active blocks

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: startDate,
        mode: 'date',
        minimumDate: today,
        onChange: (_e, selected) => {
          if (selected) {
            const d = new Date(selected)
            d.setHours(0, 0, 0, 0)
            setStartDate(d)
          }
        },
      })
    } else {
      setShowStartPicker(true)
    }
  }, [startDate, today, isPendingBlock])

  const openEndDatePicker = useCallback(() => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: endDate,
        mode: 'date',
        minimumDate: addDays(startDate, 1),
        onChange: (_e, selected) => {
          if (selected) {
            const d = new Date(selected)
            d.setHours(0, 0, 0, 0)
            setEndDate(d)
          }
        },
      })
    } else {
      setShowEndPicker(true)
    }
  }, [endDate, startDate])

  const performSubmission = useCallback(() => {
    if (!id) return
    setIsManuallySubmitting(true)
    updateDates(
      {
        id,
        body: {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
        },
      },
      {
        onSettled: () => setIsManuallySubmitting(false),
      },
    )
  }, [id, startDate, endDate, updateDates])

  const handleSubmit = useCallback(() => {
    const newStartStr = format(startDate, 'yyyy-MM-dd')
    const newEndStr = format(endDate, 'yyyy-MM-dd')

    // Find overlapping blocks, excluding the current one
    const overlapping = blocks.filter(
      (b) =>
        b.id !== id &&
        b.status === 'active' &&
        b.startDate <= newEndStr &&
        b.endDate >= newStartStr,
    )

    if (overlapping.length > 0) {
      const message =
        overlapping.length > 1
          ? `This change causes overlaps with ${overlapping.length} existing blocks. Updating will end or cancel them. Continue?`
          : `This overlaps with your "${overlapping[0].name}" block. Updating will end it. Continue?`

      Alert.alert('Overlap detected', message, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => performSubmission(),
        },
      ])
    } else {
      performSubmission()
    }
  }, [blocks, id, startDate, endDate, performSubmission])

  if (blockLoading || !block) {
    return <View style={[styles.screen, { backgroundColor: colors.background.base }]} />
  }

  const config = BLOCK_TYPE_CONFIG[block.blockType]

  return (
    <View style={[styles.screen, { backgroundColor: colors.background.base }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.background.base,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          style={styles.backBtn}
        >
          <Ionicons name="close" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Edit Block</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardsSection}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.background.surface,
                borderColor: colors.border.subtle,
                borderLeftColor: config.accentColor,
                opacity: 0.8,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.typeDot, { backgroundColor: config.accentColor }]} />
              <View style={styles.cardTitleCol}>
                <Text style={[styles.cardName, { color: colors.text.primary }]}>
                  {block.name}
                </Text>
                <Text style={[styles.cardTagline, { color: colors.text.tertiary }]}>
                  {config.label}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            onPress={openStartDatePicker}
            disabled={!isPendingBlock || isSubmitting}
            style={[
              styles.fieldBtn,
              {
                backgroundColor: colors.background.surface,
                borderColor: colors.border.subtle,
                opacity: isPendingBlock ? 1 : 0.6,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Start date"
          >
            <Text style={[styles.fieldLabel, { color: colors.text.tertiary }]}>START DATE</Text>
            <Text style={[styles.fieldValue, { color: colors.text.primary }]}>
              {formatStartDate(startDate, today)}
            </Text>
            {!isPendingBlock && (
              <Text style={[styles.lockedNote, { color: colors.text.tertiary }]}>
                Cannot change start date of active block
              </Text>
            )}
            {isPendingBlock && Platform.OS === 'ios' && showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="inline"
                minimumDate={today}
                onChange={(_e, selected) => {
                  if (selected) {
                    const d = new Date(selected)
                    d.setHours(0, 0, 0, 0)
                    setStartDate(d)
                  }
                }}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            onPress={openEndDatePicker}
            disabled={isSubmitting}
            style={[
              styles.fieldBtn,
              {
                backgroundColor: colors.background.surface,
                borderColor: colors.border.subtle,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="End date"
          >
            <Text style={[styles.fieldLabel, { color: colors.text.tertiary }]}>END DATE</Text>
            <Text style={[styles.fieldValue, { color: colors.text.primary }]}>
              {format(endDate, 'MMM d, yyyy')}
            </Text>
            {Platform.OS === 'ios' && showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="inline"
                minimumDate={addDays(startDate, 1)}
                onChange={(_e, selected) => {
                  if (selected) {
                    const d = new Date(selected)
                    d.setHours(0, 0, 0, 0)
                    setEndDate(d)
                  }
                }}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.submitArea}>
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: pressed ? colors.copper.dim : colors.copper.default,
                borderColor: colors.copper.muted,
                opacity: isSubmitting ? 0.6 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Save changes"
          >
            <Ionicons name="checkmark" size={28} color={colors.background.base} />
          </Pressable>
          <Text style={[styles.submitLabel, { color: colors.copper.default }]}>Save changes</Text>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
  },
  cardsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardTitleCol: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  cardTagline: {
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  fieldBtn: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 17,
    fontWeight: '600',
  },
  lockedNote: {
    fontSize: 11,
    marginTop: 8,
    fontStyle: 'italic',
  },
  submitArea: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  submitBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  submitLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
})

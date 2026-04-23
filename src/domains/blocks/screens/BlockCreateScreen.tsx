import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker'
import { addDays, differenceInDays, format } from 'date-fns'
import { router } from 'expo-router'
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

import type { BlockType } from '../blocks.types'
import { BLOCK_TYPE_CONFIG, BLOCK_TYPE_ORDER } from '../constants/blockTypes'
import { useActiveBlock } from '../hooks/useActiveBlock'
import { useBlocks } from '../hooks/useBlocks'
import { useCompleteBlock } from '../hooks/useCompleteBlock'
import { useCreateBlock } from '../hooks/useCreateBlock'

const PRESET_WEEKS = [2, 3, 4, 5, 6, 7, 8, 10, 12]

function formatStartDate(date: Date, today: Date): string {
  if (date.getTime() === today.getTime()) {
    return `Today, ${format(date, 'MMM d')}`
  }
  return format(date, 'MMM d, yyyy')
}

export function BlockCreateScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [isManuallySubmitting, setIsManuallySubmitting] = useState(false)
  const { data: activeBlock, isLoading: activeLoading } = useActiveBlock()
  const { data: blocks = [], isLoading: blocksLoading } = useBlocks()
  const { mutateAsync: completeBlock } = useCompleteBlock()
  const { mutate: createBlock, isPending } = useCreateBlock({
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to create block. Please try again.')
    },
  })

  const isSubmitting = isPending || activeLoading || blocksLoading || isManuallySubmitting

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [selectedType, setSelectedType] = useState<BlockType>('base_building')
  const [startDate, setStartDate] = useState<Date>(today)
  const [durationWeeks, setDurationWeeks] = useState<number>(6)
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null)
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showCustomPicker, setShowCustomPicker] = useState(false)

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }, [])

  const endDate = customEndDate ?? addDays(startDate, durationWeeks * 7)

  const durationLabel = customEndDate
    ? `~${Math.round(differenceInDays(customEndDate, startDate) / 7)} weeks`
    : `${durationWeeks} weeks`

  const onBlockTypeSelect = useCallback((type: BlockType) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setSelectedType(type)
    setDurationWeeks(BLOCK_TYPE_CONFIG[type].defaultWeeks)
    setCustomEndDate(null)
  }, [])

  const onPresetSelect = useCallback((weeks: number) => {
    setDurationWeeks(weeks)
    setCustomEndDate(null)
  }, [])

  const openStartDatePicker = useCallback(() => {
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
            setCustomEndDate(null)
          }
        },
      })
    } else {
      setShowStartPicker(true)
    }
  }, [startDate, today])

  const openCustomDatePicker = useCallback(() => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: customEndDate ?? addDays(startDate, durationWeeks * 7),
        mode: 'date',
        minimumDate: addDays(startDate, 1),
        onChange: (_e, selected) => {
          if (selected) {
            const d = new Date(selected)
            d.setHours(0, 0, 0, 0)
            setCustomEndDate(d)
          }
        },
      })
    } else {
      setShowCustomPicker(true)
    }
  }, [customEndDate, startDate, durationWeeks])

  const performSubmission = useCallback(async () => {
    setIsManuallySubmitting(true)
    try {
      const newStartStr = format(startDate, 'yyyy-MM-dd')
      const newEndStr = format(endDate, 'yyyy-MM-dd')

      // Find ALL active/pending blocks that overlap with this new range
      const overlapping = blocks.filter(
        (b) => b.status === 'active' && b.startDate <= newEndStr && b.endDate >= newStartStr,
      )

      // Complete all of them sequentially
      for (const b of overlapping) {
        await completeBlock(b.id)
      }

      createBlock(
        {
          blockType: selectedType,
          name: `${BLOCK_TYPE_CONFIG[selectedType].label} · ${format(startDate, 'MMM yyyy')}`,
          startDate: newStartStr,
          endDate: format(endDate, 'yyyy-MM-dd'),
        },
        {
          onSuccess: () => router.replace('/blocks'),
          onSettled: () => setIsManuallySubmitting(false),
        },
      )
    } catch (error) {
      setIsManuallySubmitting(false)
      console.error('Failed to create block:', error)
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Failed to prepare for new block. Please try again.',
      )
    }
  }, [blocks, completeBlock, createBlock, selectedType, startDate, endDate])

  const handleSubmit = useCallback(async () => {
    const newStartStr = format(startDate, 'yyyy-MM-dd')
    const newEndStr = format(endDate, 'yyyy-MM-dd')

    // Find overlapping blocks (Active or Pending)
    const overlapping = blocks.filter(
      (b) => b.status === 'active' && b.startDate <= newEndStr && b.endDate >= newStartStr,
    )

    if (overlapping.length > 0) {
      const isPlural = overlapping.length > 1
      const message = isPlural
        ? `This new block overlaps with ${overlapping.length} existing blocks. Starting it will end or cancel them. Continue?`
        : `This overlaps with your "${overlapping[0].name}" block. Starting a new block will end it. Continue?`

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
  }, [blocks, startDate, endDate, performSubmission])

  return (
    <View style={[styles.screen, { backgroundColor: colors.background.base }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            borderBottomColor: colors.border.subtle,
            backgroundColor: colors.background.base,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Dismiss"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          New block
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 48 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Block type cards */}
        <View style={styles.cardsSection}>
          {BLOCK_TYPE_ORDER.map((type) => {
            const config = BLOCK_TYPE_CONFIG[type]
            const isSelected = selectedType === type
            return (
              <TouchableOpacity
                key={type}
                onPress={() => onBlockTypeSelect(type)}
                activeOpacity={0.85}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                style={[
                  styles.card,
                  isSelected
                    ? {
                        backgroundColor: colors.background.surface,
                        borderTopWidth: 1,
                        borderRightWidth: 1,
                        borderBottomWidth: 1,
                        borderLeftWidth: 3,
                        borderColor: colors.copper.default,
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        borderTopRightRadius: 14,
                        borderBottomRightRadius: 14,
                      }
                    : {
                        backgroundColor: colors.background.surface,
                        borderWidth: 1,
                        borderColor: colors.border.subtle,
                        borderRadius: 14,
                      },
                ]}
              >
                {/* Card header — always visible */}
                <View style={styles.cardHeader}>
                  <View
                    style={[styles.typeDot, { backgroundColor: config.accentColor }]}
                  />
                  <View style={styles.cardTitleCol}>
                    <Text style={[styles.cardName, { color: colors.text.primary }]}>
                      {config.label}
                    </Text>
                    <Text style={[styles.cardTagline, { color: colors.text.tertiary }]}>
                      {config.tagline}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      isSelected
                        ? {
                            backgroundColor: colors.copper.default,
                            borderColor: colors.copper.default,
                          }
                        : {
                            backgroundColor: 'transparent',
                            borderColor: colors.border.default,
                          },
                    ]}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={11}
                        color={colors.background.base}
                      />
                    )}
                  </View>
                </View>

                {/* Detail panel — selected only */}
                {isSelected && (
                  <View
                    style={[styles.cardDetail, { borderTopColor: colors.border.subtle }]}
                  >
                    <View style={styles.detailCols}>
                      <View style={styles.detailCol}>
                        <Text
                          style={[styles.detailLabel, { color: colors.text.tertiary }]}
                        >
                          BEST FOR
                        </Text>
                        <Text
                          style={[styles.detailValue, { color: colors.text.secondary }]}
                        >
                          {config.bestFor}
                        </Text>
                      </View>
                      <View style={[styles.detailCol, styles.detailColRight]}>
                        <Text
                          style={[styles.detailLabel, { color: colors.text.tertiary }]}
                        >
                          FOCUS
                        </Text>
                        <Text
                          style={[styles.detailValue, { color: colors.text.secondary }]}
                        >
                          {config.focus}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.typicalRow,
                        { backgroundColor: colors.background.base },
                      ]}
                    >
                      <Text style={[styles.typicalText, { color: colors.text.tertiary }]}>
                        {'Typical: '}
                        <Text
                          style={[styles.typicalRange, { color: colors.copper.default }]}
                        >
                          {config.typicalRange}
                        </Text>
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Start date */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={openStartDatePicker}
            style={[
              styles.dateField,
              {
                backgroundColor: colors.background.surface,
                borderColor: colors.border.subtle,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Start date"
          >
            <Text style={[styles.fieldLabel, { color: colors.text.tertiary }]}>
              Start date
            </Text>
            <Text style={[styles.fieldValue, { color: colors.text.primary }]}>
              {formatStartDate(startDate, today)}
            </Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="spinner"
              minimumDate={today}
              onChange={(_e, selected) => {
                setShowStartPicker(false)
                if (selected) {
                  const d = new Date(selected)
                  d.setHours(0, 0, 0, 0)
                  setStartDate(d)
                  setCustomEndDate(null)
                }
              }}
            />
          )}
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <View style={styles.durationHeader}>
            <Text style={[styles.durationHeaderLabel, { color: colors.text.tertiary }]}>
              Duration
            </Text>
            <Text style={[styles.durationValue, { color: colors.copper.default }]}>
              {durationLabel}
            </Text>
          </View>

          <View style={styles.pillsRow}>
            {PRESET_WEEKS.map((w) => {
              const isActive = durationWeeks === w && !customEndDate
              return (
                <TouchableOpacity
                  key={w}
                  onPress={() => onPresetSelect(w)}
                  style={[
                    styles.pill,
                    isActive
                      ? {
                          backgroundColor: colors.copper.default,
                          borderColor: colors.copper.default,
                        }
                      : {
                          backgroundColor: colors.background.surface,
                          borderColor: colors.border.subtle,
                        },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isActive }}
                  accessibilityLabel={`${w} weeks`}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isActive
                        ? { color: colors.background.base, fontWeight: '600' }
                        : { color: colors.text.tertiary },
                    ]}
                  >
                    {w}w
                  </Text>
                </TouchableOpacity>
              )
            })}

            {/* Custom pill */}
            <TouchableOpacity
              onPress={openCustomDatePicker}
              style={[
                styles.pill,
                styles.customPill,
                customEndDate
                  ? {
                      backgroundColor: colors.copper.subtle,
                      borderColor: colors.copper.default,
                    }
                  : {
                      backgroundColor: colors.copper.subtle,
                      borderColor: colors.copper.muted,
                    },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Custom end date"
            >
              <Ionicons
                name="calendar-outline"
                size={12}
                color={colors.copper.default}
                style={styles.customPillIcon}
              />
              <Text
                style={[
                  styles.pillText,
                  styles.customPillText,
                  { color: colors.copper.default },
                ]}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </View>

          {/* Ends row */}
          <View style={styles.endsRow}>
            <Text style={[styles.endsLabel, { color: colors.text.tertiary }]}>
              {'Ends '}
              <Text style={[styles.endsDate, { color: colors.text.primary }]}>
                {format(endDate, 'MMM d, yyyy')}
              </Text>
            </Text>
            {customEndDate && (
              <TouchableOpacity
                onPress={openCustomDatePicker}
                accessibilityRole="button"
                accessibilityLabel="Change end date"
              >
                <Text style={[styles.changeEndDate, { color: colors.copper.default }]}>
                  Change end date
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {Platform.OS === 'ios' && showCustomPicker && (
            <DateTimePicker
              value={customEndDate ?? addDays(startDate, durationWeeks * 7)}
              mode="date"
              display="spinner"
              minimumDate={addDays(startDate, 1)}
              onChange={(_e, selected) => {
                setShowCustomPicker(false)
                if (selected) {
                  const d = new Date(selected)
                  d.setHours(0, 0, 0, 0)
                  setCustomEndDate(d)
                }
              }}
            />
          )}
        </View>

        {/* Submit */}
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
            accessibilityLabel="Create block"
          >
            <View style={styles.plusIcon}>
              <View style={[styles.plusH, { backgroundColor: colors.background.base }]} />
              <View style={[styles.plusV, { backgroundColor: colors.background.base }]} />
            </View>
          </Pressable>
          <Text style={[styles.submitLabel, { color: colors.copper.default }]}>
            Create block
          </Text>
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
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  // Block type cards
  cardsSection: {
    paddingHorizontal: 16,
    gap: 8,
  },
  card: {
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  typeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
    flexShrink: 0,
  },
  cardTitleCol: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardTagline: {
    fontSize: 11,
    marginTop: 2,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardDetail: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 13,
  },
  detailCols: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailCol: {
    flex: 1,
  },
  detailColRight: {
    marginLeft: 16,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.06,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 12,
    lineHeight: 17,
  },
  typicalRow: {
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  typicalText: {
    fontSize: 11,
  },
  typicalRange: {
    fontSize: 11,
    fontWeight: '500',
  },
  // Start date
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 14,
  },
  // Duration
  durationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  durationHeaderLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  durationValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  pillText: {
    fontSize: 12,
  },
  customPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customPillIcon: {
    marginRight: 4,
  },
  customPillText: {
    fontWeight: '500',
  },
  endsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  endsLabel: {
    fontSize: 11,
  },
  endsDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  changeEndDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  // Submit
  submitArea: {
    alignItems: 'center',
    marginTop: 40,
  },
  submitBtn: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusH: {
    position: 'absolute',
    width: 28,
    height: 3.5,
    borderRadius: 2,
  },
  plusV: {
    position: 'absolute',
    width: 3.5,
    height: 28,
    borderRadius: 2,
  },
  submitLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
})

import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Controller, useController, useForm } from 'react-hook-form'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import type { MoodCategoryKey } from '@/domains/moods/moods.types'
import { MoodGridModal } from '@/domains/moods/components/MoodGridModal'
import { MoodGridTrigger } from '@/domains/moods/components/MoodGridTrigger'
import { Dateline, DoubleRule } from '@/components/ui'
import { useTheme } from '@/theme/useTheme'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import { formatDistanceParts } from '../utils/distance'
import { formatDurationDisplay } from '../utils/duration'
import { formatPace } from '../utils/formatters'
import { formatRunDate } from '../utils/formatters'
import { RpeSelector, RunTypePicker } from '../components'
import { useCompletePendingRun } from '../hooks/useCompletePendingRun'
import { usePendingRuns } from '../hooks/usePendingRuns'

interface FormValues {
  runType: string
  exertionRating: number | null
  moodId: number | null
  notes: string
}

function StatCell({ label, value }: { label: string; value: string }) {
  const { text, rule } = useTheme()
  return (
    <View style={[styles.statCell, { borderRightColor: rule.subtle }]}>
      <Dateline style={styles.statLabel}>{label}</Dateline>
      <Text style={[styles.statValue, { color: text.primary }]}>{value}</Text>
    </View>
  )
}

export function CompletePendingRunScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { bg, text, rule, accent, semantic, radius } = useTheme()
  const insets = useSafeAreaInsets()
  const { unit } = useDistanceUnit()

  const { data: pendingRuns = [] } = usePendingRuns()
  const pendingRun = pendingRuns.find((r) => r.id === id)

  const { data: moods = [] } = useGetAllMoods()
  const [showMoodGrid, setShowMoodGrid] = useState(false)
  const [openQuadrant, setOpenQuadrant] = useState<MoodCategoryKey | null>(null)

  const scrollRef = useRef<ScrollView>(null)
  const fieldPositions = useRef<Partial<Record<string, number>>>({})

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      runType: pendingRun?.runType ?? '',
      exertionRating: null,
      moodId: null,
      notes: '',
    },
  })

  const watchedMoodId = watch('moodId')
  const selectedMood = useMemo(
    () => moods.find((m) => m.id === watchedMoodId) ?? null,
    [watchedMoodId, moods],
  )

  const { mutate: complete, isPending } = useCompletePendingRun()

  const onSubmit = useCallback(
    (values: FormValues) => {
      if (!id) return
      complete(
        {
          id,
          body: {
            moodId: values.moodId!,
            exertionRating: values.exertionRating!,
            notes: values.notes || undefined,
          },
        },
        { onSuccess: () => router.back() },
      )
    },
    [complete, id],
  )

  const handleSubmitPress = handleSubmit(onSubmit, (errs) => {
    const order = ['runType', 'exertionRating', 'moodId']
    for (const field of order) {
      if (errs[field as keyof FormValues] && fieldPositions.current[field] !== undefined) {
        scrollRef.current?.scrollTo({ y: fieldPositions.current[field]! - 16, animated: true })
        break
      }
    }
  })

  const openMoodGrid = useCallback((quadrant: MoodCategoryKey | null) => {
    setOpenQuadrant(quadrant)
    setShowMoodGrid(true)
  }, [])

  // Formatted stat values
  const { value: distValue, unit: distUnit } = pendingRun
    ? formatDistanceParts(pendingRun.distanceMeters, unit)
    : { value: '—', unit: '' }

  const durationLabel = pendingRun ? formatDurationDisplay(pendingRun.durationSeconds) : '—'

  const paceLabel = pendingRun
    ? `${formatPace(pendingRun.distanceMeters, pendingRun.durationSeconds, unit)} /${unit}`
    : '—'

  const dateLabel = pendingRun ? formatRunDate(pendingRun.date) : ''

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: bg.base }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, paddingHorizontal: 16, backgroundColor: bg.base },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <Text style={[styles.headerCancel, { color: text.secondary }]}>Cancel</Text>
          </TouchableOpacity>

          <Dateline style={styles.headerLabel}>FROM STRAVA</Dateline>

          <TouchableOpacity
            onPress={handleSubmitPress}
            disabled={isPending}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <Text style={[styles.headerSave, { color: isPending ? text.tertiary : accent.default }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.screenTitle, { color: text.primary }]}>Log this run.</Text>
        <Text style={[styles.dateLabel, { color: text.secondary }]}>{dateLabel}</Text>
        <DoubleRule style={styles.headerRule} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Strava stats — read-only */}
        <View style={[styles.statsCard, { backgroundColor: bg.surface, borderColor: rule.subtle }]}>
          <Dateline style={styles.statsLabel}>STRAVA DATA</Dateline>
          <View style={styles.statsRow}>
            <StatCell label="DISTANCE" value={`${distValue} ${distUnit}`} />
            <StatCell label="DURATION" value={durationLabel} />
            <View style={[styles.statCell, { borderRightWidth: 0 }]}>
              <Dateline style={styles.statLabel}>PACE</Dateline>
              <Text style={[styles.statValue, { color: text.primary }]}>{paceLabel}</Text>
            </View>
          </View>
        </View>

        {/* Run type — editable */}
        <Controller
          control={control}
          name="runType"
          rules={{ required: 'Select a run type' }}
          render={({ field: { onChange, value } }) => (
            <RunTypePicker
              value={value}
              onChange={onChange}
              hasError={!!errors.runType}
              errorMessage={errors.runType?.message}
              onLayout={(e) => { fieldPositions.current.runType = e.nativeEvent.layout.y }}
            />
          )}
        />

        {/* RPE */}
        <Controller
          control={control}
          name="exertionRating"
          rules={{ validate: (v) => v !== null || 'Select an effort level' }}
          render={({ field: { onChange, value } }) => (
            <RpeSelector
              value={value}
              onChange={onChange}
              hasError={!!errors.exertionRating}
              errorMessage={errors.exertionRating?.message}
              onLayout={(e) => { fieldPositions.current.exertionRating = e.nativeEvent.layout.y }}
            />
          )}
        />

        {/* Notes */}
        <View style={styles.section}>
          <Dateline>Notes</Dateline>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    backgroundColor: bg.input,
                    borderColor: rule.subtle,
                    borderRadius: radius.sm,
                    color: text.primary,
                  },
                ]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                placeholder="How was it?"
                placeholderTextColor={text.tertiary}
              />
            )}
          />
        </View>

        {/* Mood */}
        <Controller
          control={control}
          name="moodId"
          rules={{ validate: (v) => v !== null || 'Select a mood to log your run' }}
          render={() => (
            <View
              style={styles.moodSection}
              onLayout={(e) => { fieldPositions.current.moodId = e.nativeEvent.layout.y }}
            >
              <MoodGridTrigger
                selectedMood={selectedMood}
                onZoneTap={(q) => openMoodGrid(q)}
                onChangeTap={() => openMoodGrid(selectedMood?.quadrant ?? null)}
              />
              {!!errors.moodId && (
                <Text style={[styles.errorText, { color: semantic.error }]}>
                  {errors.moodId.message}
                </Text>
              )}
            </View>
          )}
        />
      </ScrollView>

      <MoodGridModal
        visible={showMoodGrid}
        focusQuadrant={openQuadrant}
        initialMoodId={watchedMoodId}
        onSelect={(m) => { setValue('moodId', m.id); setShowMoodGrid(false) }}
        onDismiss={() => setShowMoodGrid(false)}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { gap: 4 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCancel: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 13 },
  headerLabel: { flex: 1, textAlign: 'center' },
  headerSave: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 13 },
  screenTitle: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 32,
    letterSpacing: -0.02 * 32,
    lineHeight: 35,
  },
  dateLabel: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 15 },
  headerRule: { marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  // Strava stats card
  statsCard: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 14,
    gap: 10,
  },
  statsLabel: {},
  statsRow: {
    flexDirection: 'row',
  },
  statCell: {
    flex: 1,
    borderRightWidth: 1,
    paddingRight: 12,
    marginRight: 12,
    gap: 3,
  },
  statLabel: {},
  statValue: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 18,
    letterSpacing: -0.01 * 18,
  },
  // Form
  section: { gap: 8 },
  notesInput: {
    minHeight: 72,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Fraunces_400Regular_Italic',
    textAlignVertical: 'top',
  },
  moodSection: { gap: 8 },
  errorText: { fontFamily: 'Manrope', fontSize: 12 },
})

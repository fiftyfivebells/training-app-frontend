import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useController, useForm } from 'react-hook-form'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Ionicons } from '@expo/vector-icons'

import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import { QUADRANT_DESCRIPTOR } from '@/domains/moods/moods.constants'
import { useUpdateRun } from '@/domains/runs/hooks/useUpdateRun'
import { useRun } from '@/domains/runs/hooks/useRun'
import { calculateMeters, metersToDistanceUnit } from '@/domains/runs/utils/distance'
import { normalizeDuration, redistributeTime } from '@/domains/runs/utils/duration'
import { formatDateForApi, formatDateLabel, timeOfDay } from '@/domains/runs/utils/datetime'
import { formatPace } from '@/domains/runs/utils/formatters'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import { useDistanceUnitPreference } from '@/domains/users/hooks/useDistanceUnitPreference'
import { useMoodSelectionStore } from '@/store/moodSelectionStore'
import { useTheme } from '@/theme/useTheme'

import {
  DistanceField,
  DurationField,
  MoodWidget,
  RpeSelector,
  RunTypePicker,
} from '../components'

interface FormValues {
  distance: string
  hh: string
  mm: string
  ss: string
  runType: string
  exertionRating: number | null
  moodId: number | null
  notes: string
}

export function EditRunScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data: run, isLoading } = useRun(id)

  const { unit: savedUnit, loaded: unitLoaded } = useDistanceUnit()
  const { setUnit: persistUnit } = useDistanceUnitPreference()
  const [displayUnit, setDisplayUnit] = useState<'km' | 'mi'>(savedUnit)

  // Sync savedUnit once loaded
  useEffect(() => {
    if (unitLoaded) setDisplayUnit(savedUnit)
  }, [unitLoaded, savedUnit])

  const { data: moods = [] } = useGetAllMoods()
  const storeMoodId = useMoodSelectionStore((s) => s.moodId)
  const storeSet = useMoodSelectionStore((s) => s.set)
  const storeClear = useMoodSelectionStore((s) => s.clear)

  const [date, setDate] = useState<Date>(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)

  const scrollRef = useRef<ScrollView>(null)
  const fieldPositions = useRef<Partial<Record<string, number>>>({})
  const hasFetched = useRef(false)

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      distance: '',
      hh: '',
      mm: '',
      ss: '',
      runType: '',
      exertionRating: null,
      moodId: null,
      notes: '',
    },
  })

  // Pre-populate form once both run and unit preference are loaded
  useEffect(() => {
    if (!run || !unitLoaded || hasFetched.current) return
    hasFetched.current = true

    const [ry, rm, rd] = run.date.split('-').map(Number)
    setDate(new Date(ry, rm - 1, rd))

    const { hh, mm, ss } = redistributeTime('', '', String(run.durationSeconds))
    const displayVal = metersToDistanceUnit(
      run.distanceMeters,
      displayUnit === 'mi' ? 'miles' : 'km',
    )

    reset({
      distance: displayVal.toFixed(2),
      hh,
      mm,
      ss,
      runType: run.runType
        ? run.runType.charAt(0).toUpperCase() + run.runType.slice(1).toLowerCase()
        : '',
      exertionRating: run.exertionRating,
      moodId: null, // will be set by store sync below
      notes: run.notes ?? '',
    })

    storeSet(run.moodId)
  }, [run, unitLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync store → RHF whenever mood picker returns a selection
  useEffect(() => {
    setValue('moodId', storeMoodId)
  }, [storeMoodId, setValue])

  const watchedDistance = watch('distance')
  const watchedMoodId = watch('moodId')
  const watchedHH = watch('hh')
  const watchedMM = watch('mm')
  const watchedSS = watch('ss')

  const totalSeconds = useMemo(
    () =>
      (Number(watchedHH) || 0) * 3600 +
      (Number(watchedMM) || 0) * 60 +
      (Number(watchedSS) || 0),
    [watchedHH, watchedMM, watchedSS],
  )

  // useController hooks for hh/mm/ss to avoid nested Controller render props
  const { field: hhField } = useController({
    control,
    name: 'hh',
    rules: { validate: () => totalSeconds > 0 || 'Enter a duration' },
  })
  const { field: mmField } = useController({ control, name: 'mm' })
  const { field: ssField } = useController({ control, name: 'ss' })

  const paceString = useMemo(() => {
    const meters = calculateMeters(
      Number(watchedDistance) || 0,
      displayUnit === 'mi' ? 'miles' : 'km',
    )
    if (meters === 0 || totalSeconds === 0) return `— /${displayUnit}`
    return `${formatPace(meters, totalSeconds, displayUnit)} /${displayUnit}`
  }, [watchedDistance, totalSeconds, displayUnit])

  const titleString = useMemo(() => {
    const tod = timeOfDay()
    if (!watchedMoodId) return `${tod} Run`
    const mood = moods.find((m) => m.id === watchedMoodId)
    if (!mood) return `${tod} Run`
    return `${QUADRANT_DESCRIPTOR[mood.quadrant]} ${tod} Run`
  }, [watchedMoodId, moods])

  const selectedMood = useMemo(
    () => moods.find((m) => m.id === watchedMoodId) ?? null,
    [watchedMoodId, moods],
  )

  const handleDurationBlur = useCallback(() => {
    const { hh, mm, ss } = redistributeTime(watchedHH, watchedMM, watchedSS)
    setValue('hh', hh)
    setValue('mm', mm)
    setValue('ss', ss)
  }, [watchedHH, watchedMM, watchedSS, setValue])

  const handleBack = useCallback(() => {
    storeClear()
    router.back()
  }, [storeClear])

  const { mutate: updateRun, isPending } = useUpdateRun()

  const onSubmit = useCallback(
    (values: FormValues) => {
      const meters = Math.round(
        calculateMeters(Number(values.distance), displayUnit === 'mi' ? 'miles' : 'km'),
      )
      updateRun(
        {
          runId: id,
          body: {
            date: formatDateForApi(date),
            distanceMeters: meters,
            durationSeconds: totalSeconds,
            runType: values.runType,
            exertionRating: values.exertionRating!,
            moodId: values.moodId!,
            notes: values.notes || undefined,
          },
        },
        {
          onSuccess: () => {
            storeClear()
            router.back()
          },
        },
      )
    },
    [updateRun, id, date, displayUnit, totalSeconds, storeClear],
  )

  const handleSubmitPress = handleSubmit(onSubmit, (errs) => {
    const order = ['distance', 'hh', 'runType', 'exertionRating', 'moodId']
    for (const field of order) {
      if (errs[field as keyof FormValues] && fieldPositions.current[field] !== undefined) {
        scrollRef.current?.scrollTo({ y: fieldPositions.current[field]! - 16, animated: true })
        break
      }
    }
  })

  const handleUnitToggle = useCallback(
    (unit: 'km' | 'mi') => {
      if (unit === displayUnit) return
      const current = Number(watchedDistance) || 0
      if (current > 0) {
        const converted = unit === 'mi' ? current / 1.60934 : current * 1.60934
        setValue('distance', converted.toFixed(2))
      }
      setDisplayUnit(unit)
      persistUnit(unit === 'mi' ? 'imperial' : 'metric')
    },
    [displayUnit, watchedDistance, setValue, persistUnit],
  )

  const openDatePicker = useCallback(() => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date,
        mode: 'date',
        maximumDate: new Date(),
        onChange: (_e, selected) => {
          if (selected) setDate(selected)
        },
      })
    } else {
      setShowDatePicker(true)
    }
  }, [date])

  if (isLoading || !run) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background.base }]}>
        <ActivityIndicator color={colors.copper.default} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background.base }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          onPress={handleBack}
          style={styles.backBtn}
          accessibilityLabel="Dismiss"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Edit run</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title preview banner */}
        <View
          style={[
            styles.titleBanner,
            { backgroundColor: colors.background.surface, borderColor: colors.border.subtle },
          ]}
        >
          <Text style={[styles.titleBannerLabel, { color: colors.text.tertiary }]}>
            Saving as{' '}
            <Text style={[styles.titleBannerValue, { color: colors.copper.default }]}>
              {titleString}
            </Text>
          </Text>
        </View>

        {/* Date */}
        <View
          style={styles.section}
          onLayout={(e) => {
            fieldPositions.current.date = e.nativeEvent.layout.y
          }}
        >
          <Text style={[styles.fieldLabel, { color: colors.text.tertiary }]}>DATE</Text>
          <TouchableOpacity
            onPress={openDatePicker}
            style={[
              styles.dateInput,
              { backgroundColor: colors.background.input, borderColor: colors.border.subtle },
            ]}
            accessibilityLabel="Select date"
          >
            <Text style={[styles.dateInputText, { color: colors.text.primary }]}>
              {formatDateLabel(date)}
            </Text>
            <Ionicons name="calendar-outline" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
          {showDatePicker && Platform.OS === 'ios' && (
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(_e, selected) => {
                setShowDatePicker(false)
                if (selected) setDate(selected)
              }}
            />
          )}
        </View>

        {/* Distance + unit */}
        <Controller
          control={control}
          name="distance"
          rules={{ validate: (v) => Number(v) > 0 || 'Enter a distance greater than 0' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <DistanceField
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              hasError={!!errors.distance}
              errorMessage={errors.distance?.message}
              displayUnit={displayUnit}
              onUnitToggle={handleUnitToggle}
              onLayout={(e) => {
                fieldPositions.current.distance = e.nativeEvent.layout.y
              }}
            />
          )}
        />

        {/* Duration + pace */}
        <DurationField
          hh={{ value: hhField.value, onChange: hhField.onChange, onBlur: handleDurationBlur }}
          mm={{ value: mmField.value, onChange: mmField.onChange, onBlur: handleDurationBlur }}
          ss={{ value: ssField.value, onChange: ssField.onChange, onBlur: handleDurationBlur }}
          hhHasError={!!errors.hh}
          hhErrorMessage={errors.hh?.message}
          paceString={paceString}
          onLayout={(e) => {
            fieldPositions.current.hh = e.nativeEvent.layout.y
          }}
        />

        {/* Run type */}
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
              onLayout={(e) => {
                fieldPositions.current.runType = e.nativeEvent.layout.y
              }}
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
              onLayout={(e) => {
                fieldPositions.current.exertionRating = e.nativeEvent.layout.y
              }}
            />
          )}
        />

        {/* Mood */}
        <Controller
          control={control}
          name="moodId"
          rules={{ validate: (v) => v !== null || 'Select a mood to log your run' }}
          render={({ field: { value } }) => (
            <MoodWidget
              value={value}
              selectedMood={selectedMood}
              hasError={!!errors.moodId}
              errorMessage={errors.moodId?.message}
              onLayout={(e) => {
                fieldPositions.current.moodId = e.nativeEvent.layout.y
              }}
            />
          )}
        />

        {/* Notes */}
        <View style={styles.section}>
          <Text style={[styles.fieldLabel, { color: colors.text.tertiary }]}>NOTES</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    backgroundColor: colors.background.input,
                    borderColor: colors.border.subtle,
                    color: colors.text.primary,
                  },
                ]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                placeholder="How did your run feel today?"
                placeholderTextColor={colors.text.tertiary}
                accessibilityLabel="Notes"
              />
            )}
          />
        </View>

        {/* Submit */}
        <View style={styles.submitArea}>
          <Pressable
            onPress={handleSubmitPress}
            disabled={isPending}
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: pressed ? colors.copper.dim : colors.copper.default,
                borderColor: colors.copper.muted,
                opacity: isPending ? 0.6 : 1,
              },
            ]}
            accessibilityLabel="Save changes"
            accessibilityRole="button"
          >
            <Ionicons name="checkmark" size={32} color={colors.background.base} />
          </Pressable>
          <Text style={[styles.submitLabel, { color: colors.copper.default }]}>Save changes</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 24,
  },
  titleBanner: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  titleBannerLabel: {
    fontSize: 11,
    fontFamily: 'System',
  },
  titleBannerValue: {
    fontSize: 11,
    fontFamily: 'Fraunces_400Regular_Italic',
  },
  section: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.6,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  dateInputText: {
    fontSize: 15,
  },
  notesInput: {
    minHeight: 72,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  submitArea: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
  },
  submitBtn: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
})

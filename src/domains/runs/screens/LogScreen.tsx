import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import type { Mood, MoodCategoryKey } from '@/domains/moods/moods.types'
import { MoodGridModal } from '@/domains/moods/components/MoodGridModal'
import { useLogRun } from '@/domains/runs/hooks/useLogRun'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { calculateMeters } from '@/domains/runs/utils/distance'
import { redistributeTime } from '@/domains/runs/utils/duration'
import { formatDateForApi, formatDateLabel } from '@/domains/runs/utils/datetime'
import { formatPace } from '@/domains/runs/utils/formatters'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import { useDistanceUnitPreference } from '@/domains/users/hooks/useDistanceUnitPreference'
import { useTheme } from '@/theme/useTheme'

import { Dateline, DoubleRule } from '@/components/ui'
import {
  DistanceField,
  DurationField,
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

const QUADRANT_COLOR_KEY: Record<MoodCategoryKey, 'highGood' | 'highTough' | 'lowGood' | 'lowTough'> = {
  'high-pleasant': 'highGood',
  'high-challenging': 'highTough',
  'low-pleasant': 'lowGood',
  'low-challenging': 'lowTough',
}

const QUADRANT_CELLS: Array<{
  key: 'highGood' | 'highTough' | 'lowGood' | 'lowTough'
  quadrant: MoodCategoryKey
  label: string
  sublabel: string
}> = [
  { key: 'highTough', quadrant: 'high-challenging', label: 'HIGH · TOUGH', sublabel: 'Hard work & grit' },
  { key: 'highGood',  quadrant: 'high-pleasant',    label: 'HIGH · GOOD',  sublabel: 'Energized & thriving' },
  { key: 'lowTough',  quadrant: 'low-challenging',  label: 'LOW · TOUGH',  sublabel: 'Drained & heavy' },
  { key: 'lowGood',   quadrant: 'low-pleasant',     label: 'LOW · GOOD',   sublabel: 'Calm & restorative' },
]

type MoodSelectedBoxProps = {
  mood: Mood | null
  moodColor: string | null
  moodBgColor: string | null
  onPress: () => void
}

function MoodSelectedBox({ mood, moodColor, moodBgColor, onPress }: MoodSelectedBoxProps) {
  const { text, rule, radius } = useTheme()
  if (!mood || !moodColor || !moodBgColor) {
    return (
      <TouchableOpacity
        style={[styles.moodBox, styles.moodBoxEmpty, { borderColor: rule.strong, borderRadius: radius.sm }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.moodBoxEmptyText, { color: text.tertiary }]}>
          Nothing yet — tap a type below
        </Text>
      </TouchableOpacity>
    )
  }
  return (
    <TouchableOpacity
      style={[
        styles.moodBox,
        styles.moodBoxSelected,
        { borderColor: moodColor, backgroundColor: moodBgColor, borderRadius: radius.sm },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.moodIcon, { borderColor: moodColor, borderRadius: radius.sm }]}>
        <View style={[styles.moodIconInner, { backgroundColor: moodColor, borderRadius: radius.xs }]} />
      </View>
      <View style={styles.moodBoxText}>
        <Text style={[styles.moodBoxWord, { color: moodColor }]}>{mood.label}</Text>
        <Text style={[styles.moodBoxDef, { color: moodColor }]}>{mood.description}</Text>
      </View>
    </TouchableOpacity>
  )
}

export function LogScreen() {
  const { bg, text, rule, accent, mood, moodBg, semantic, radius } = useTheme()
  const insets = useSafeAreaInsets()

  const { unit: savedUnit, loaded: unitLoaded } = useDistanceUnit()
  const { setUnit: persistUnit } = useDistanceUnitPreference()
  const [displayUnit, setDisplayUnit] = useState<'km' | 'mi'>(savedUnit)

  useEffect(() => {
    if (unitLoaded) setDisplayUnit(savedUnit)
  }, [unitLoaded, savedUnit])

  const { data: moods = [] } = useGetAllMoods()
  const { data: rawRuns = [] } = useRuns()

  const [date, setDate] = useState<Date>(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
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

  const watchedDistance = watch('distance')
  const watchedMoodId = watch('moodId')
  const watchedHH = watch('hh')
  const watchedMM = watch('mm')
  const watchedSS = watch('ss')

  const totalSeconds = useMemo(() => {
    return (Number(watchedHH) || 0) * 3600
      + (Number(watchedMM) || 0) * 60
      + (Number(watchedSS) || 0)
  }, [watchedHH, watchedMM, watchedSS])

  const { field: hhField } = useController({
    control,
    name: 'hh',
    rules: { validate: () => totalSeconds > 0 || 'Enter a duration' },
  })
  const { field: mmField } = useController({ control, name: 'mm' })
  const { field: ssField } = useController({ control, name: 'ss' })

  const paceString = useMemo(() => {
    const meters = calculateMeters(Number(watchedDistance) || 0, displayUnit === 'mi' ? 'miles' : 'km')
    if (meters === 0 || totalSeconds === 0) return `— /${displayUnit}`
    return `${formatPace(meters, totalSeconds, displayUnit)} /${displayUnit}`
  }, [watchedDistance, totalSeconds, displayUnit])

  const selectedMood = useMemo(
    () => moods.find((m) => m.id === watchedMoodId) ?? null,
    [watchedMoodId, moods],
  )

  const moodColor = selectedMood ? mood[QUADRANT_COLOR_KEY[selectedMood.quadrant]] : null
  const moodBgColor = selectedMood ? moodBg[QUADRANT_COLOR_KEY[selectedMood.quadrant]] : null

  const handleDurationBlur = useCallback(() => {
    const { hh, mm, ss } = redistributeTime(watchedHH, watchedMM, watchedSS)
    setValue('hh', hh)
    setValue('mm', mm)
    setValue('ss', ss)
  }, [watchedHH, watchedMM, watchedSS, setValue])

  const handleBack = useCallback(() => {
    router.back()
  }, [])

  const { mutate: logRun, isPending } = useLogRun({
    onSuccess: () => {
      router.back()
    },
  })

  const onSubmit = useCallback(
    (values: FormValues) => {
      const meters = Math.round(
        calculateMeters(Number(values.distance), displayUnit === 'mi' ? 'miles' : 'km'),
      )
      logRun({
        date: formatDateForApi(date),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        distanceMeters: meters,
        distanceUnits: displayUnit === 'mi' ? 'miles' : 'km',
        durationSeconds: totalSeconds,
        runType: values.runType,
        exertionRating: values.exertionRating!,
        moodId: values.moodId!,
        notes: values.notes || undefined,
      })
    },
    [logRun, date, displayUnit, totalSeconds],
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

  const openMoodGrid = useCallback((quadrant: MoodCategoryKey | null) => {
    setOpenQuadrant(quadrant)
    setShowMoodGrid(true)
  }, [])

  const entryNumber = rawRuns.length + 1

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: bg.base }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            paddingHorizontal: 16,
            backgroundColor: bg.base,
          },
        ]}
      >
        {/* Row 1: Cancel / ENTRY № N / Save */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            accessibilityLabel="Cancel"
            accessibilityRole="button"
          >
            <Text style={[styles.headerCancel, { color: text.secondary }]}>Cancel</Text>
          </TouchableOpacity>

          <Dateline style={styles.entryLabel}>ENTRY № {entryNumber}</Dateline>

          <TouchableOpacity
            onPress={handleSubmitPress}
            disabled={isPending}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            accessibilityLabel="Save run"
            accessibilityRole="button"
          >
            <Text style={[styles.headerSave, { color: isPending ? text.tertiary : accent.default }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: title */}
        <Text style={[styles.screenTitle, { color: text.primary }]}>Log a run</Text>

        {/* Row 3: tappable date */}
        <TouchableOpacity onPress={openDatePicker} accessibilityLabel="Select date">
          <Text style={[styles.dateLabel, { color: text.secondary }]}>
            {formatDateLabel(date)}
          </Text>
        </TouchableOpacity>

        {/* Row 4: double rule */}
        <DoubleRule style={styles.headerRule} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* iOS date picker — in scroll area to avoid expanding fixed header */}
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
              onLayout={(e) => { fieldPositions.current.distance = e.nativeEvent.layout.y }}
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
          onLayout={(e) => { fieldPositions.current.hh = e.nativeEvent.layout.y }}
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
                accessibilityLabel="Notes"
              />
            )}
          />
        </View>

        {/* Mood — selected box + 2×2 quadrant trigger grid */}
        <Controller
          control={control}
          name="moodId"
          rules={{ validate: (v) => v !== null || 'Select a mood to log your run' }}
          render={() => (
            <View
              style={styles.moodSection}
              onLayout={(e) => { fieldPositions.current.moodId = e.nativeEvent.layout.y }}
            >
              <Dateline>HOW DID IT FEEL?</Dateline>

              <MoodSelectedBox
                mood={selectedMood}
                moodColor={moodColor}
                moodBgColor={moodBgColor}
                onPress={() => openMoodGrid(selectedMood?.quadrant ?? null)}
              />

              <View style={styles.moodGrid}>
                {QUADRANT_CELLS.map((cell) => {
                  const isActive = selectedMood?.quadrant === cell.quadrant
                  return (
                    <TouchableOpacity
                      key={cell.key}
                      style={[
                        styles.moodCell,
                        {
                          backgroundColor: isActive ? moodBg[cell.key] : 'transparent',
                          borderColor: isActive ? mood[cell.key] : rule.default,
                          borderWidth: isActive ? 2 : 1,
                          borderRadius: radius.sm,
                        },
                      ]}
                      onPress={() => openMoodGrid(cell.quadrant)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.moodCellLabel, { color: isActive ? mood[cell.key] : text.tertiary }]}>
                        {cell.label}
                      </Text>
                      <Text style={[styles.moodCellSublabel, { color: isActive ? mood[cell.key] : text.secondary }]}>
                        {cell.sublabel}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              <View style={styles.moodAxisRow}>
                <Text style={[styles.moodAxisLabel, { color: text.tertiary }]}>← TOUGH</Text>
                <Text style={[styles.moodAxisLabel, { color: text.tertiary }]}>GOOD →</Text>
              </View>

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
        initialQuadrant={openQuadrant}
        initialMoodId={watchedMoodId}
        moods={moods}
        onSelect={(m) => { setValue('moodId', m.id); setShowMoodGrid(false) }}
        onDismiss={() => setShowMoodGrid(false)}
      />
    </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCancel: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 14,
    lineHeight: 20,
  },
  entryLabel: {
    flex: 1,
    textAlign: 'center',
  },
  headerSave: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 14,
    lineHeight: 20,
  },
  screenTitle: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 24,
    letterSpacing: -0.02 * 24,
    lineHeight: 28,
  },
  dateLabel: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 13,
    lineHeight: 18,
  },
  headerRule: {
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  section: {
    gap: 8,
  },
  notesInput: {
    minHeight: 72,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Fraunces_400Regular_Italic',
    textAlignVertical: 'top',
  },
  // Mood section
  moodSection: {
    gap: 8,
  },
  moodBox: {
    minHeight: 44,
    justifyContent: 'center',
  },
  moodBoxEmpty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  moodBoxEmptyText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 14,
  },
  moodBoxSelected: {
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moodIcon: {
    width: 36,
    height: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  moodIconInner: {
    width: 10,
    height: 10,
  },
  moodBoxText: {
    flex: 1,
    gap: 2,
  },
  moodBoxWord: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 22,
    lineHeight: 26,
  },
  moodBoxDef: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.04 * 10,
    opacity: 0.85,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodCell: {
    width: '47%',
    padding: 12,
    gap: 4,
  },
  moodCellLabel: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 9,
    letterSpacing: 0.14 * 9,
  },
  moodCellSublabel: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 13,
    lineHeight: 16,
  },
  moodAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  moodAxisLabel: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 9,
    letterSpacing: 0.12 * 9,
  },
  errorText: {
    fontFamily: 'Manrope',
    fontSize: 12,
  },
})

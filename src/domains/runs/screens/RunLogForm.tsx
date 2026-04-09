import type { Mood } from '@domains/moods/moods.types'
import React, { useEffect } from 'react'
import { Animated, ScrollView, StyleSheet, View } from 'react-native'

import { Button, DatePicker, useAlert } from '@/components/ui'
import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

import { TextInput } from 'react-native-gesture-handler'

import { useDistanceUnitPreference } from '@/domains/users/hooks/useDistanceUnitPreference'

import type { LogRunRequest } from '../api/runsApi'
import { DistanceField, DurationField, MoodField, NotesField } from '../components'
import { useLogRun } from '../hooks'
import { formatDateForApi } from '../utils/date'
import { calculateMeters, type DistanceUnit } from '../utils/distance'
import { durationToTotalSeconds, normalizeDuration } from '../utils/duration'

function preferenceToDistanceUnit(pref: 'imperial' | 'metric'): DistanceUnit {
  return pref === 'metric' ? 'km' : 'miles'
}

const calculatePace = (
  distanceStr: string,
  unit: DistanceUnit,
  totalSeconds: number,
): string | null => {
  const d = Number(distanceStr)
  if (!d || totalSeconds === 0) return null

  const miles = unit === 'km' ? d * 0.621371 : unit === 'meters' ? d * 0.000621371 : d

  if (miles === 0) return null

  const secondsPerMile = totalSeconds / miles
  const mins = Math.floor(secondsPerMile / 60)
  const secs = Math.round(secondsPerMile % 60)
  const paddedSecs = secs < 10 ? `0${secs}` : secs.toString()

  return `${mins}:${paddedSecs} / mi`
}

export const RunLogForm: React.FC = () => {
  const { alert } = useAlert()
  const { unit: unitPreference, loaded: prefLoaded } = useDistanceUnitPreference()

  const [date, setDate] = React.useState<Date>(new Date())

  const [distance, setDistance] = React.useState('')
  const [distanceUnit, setDistanceUnit] = React.useState<DistanceUnit>('miles')

  React.useEffect(() => {
    if (prefLoaded) {
      setDistanceUnit(preferenceToDistanceUnit(unitPreference))
    }
  }, [prefLoaded, unitPreference])

  const [durationHours, setDurationHours] = React.useState('')
  const [durationMinutes, setDurationMinutes] = React.useState('')
  const [durationSeconds, setDurationSeconds] = React.useState('')

  const [notes, setNotes] = React.useState('')
  const [selectedMood, setSelectedMood] = React.useState<Mood | null>(null)

  const totalSeconds = durationToTotalSeconds(
    durationHours,
    durationMinutes,
    durationSeconds,
  )
  const normalized = normalizeDuration(totalSeconds)

  const pace = calculatePace(distance, distanceUnit, totalSeconds)

  const distanceRef = React.useRef<TextInput | null>(null)

  const opacity = React.useRef(new Animated.Value(1)).current

  const resetForm = () => {
    setDate(new Date())
    setDistance('')
    setDistanceUnit('miles')
    setDurationHours('')
    setDurationMinutes('')
    setDurationSeconds('')
    setNotes('')
    setSelectedMood(null)
  }

  useEffect(() => {
    const id = setTimeout(() => {
      distanceRef.current?.focus()
    }, 100)

    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!pace) return

    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start()
  }, [pace])

  const logRunMutation = useLogRun({
    onError: (error) => {
      alert('Unable to log run', error.message ?? 'Please try again in a moment.')
    },
  })

  const onSubmit = () => {
    if (!selectedMood) {
      alert('Mood required', 'Please pick a mood for this run.')
      return
    }

    if (!distance.trim()) {
      alert('Distance required', 'Please enter the distance.')
      return
    }

    if (totalSeconds === 0) {
      alert('Time required', 'Please enter the duration.')
      return
    }

    const payload: LogRunRequest = {
      date: formatDateForApi(date),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      distanceMeters: calculateMeters(Number(distance), distanceUnit),
      distanceUnits: distanceUnit,
      durationSeconds: totalSeconds,
      moodId: selectedMood.id,
      notes: notes || undefined,
    }

    logRunMutation.mutate(payload, {
      onSuccess: () => {
        resetForm()
        alert('Nice work!', 'Your run has been logged.')
      },
    })
  }

  const theme = useTheme()

  return (
    <ScrollView
      contentContainerStyle={[
        styles.wrapper,
        {
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
          backgroundColor: theme.semantic.surface.background,
        },
      ]}
    >
      <ThemedText
        style={{
          fontSize: theme.typography.size.xxxl,
          fontWeight: theme.typography.weights.bold,
          color: theme.semantic.text.primary,
          textAlign: 'center',
          marginBottom: theme.spacing.xs,
        }}
      >
        Log a Run
      </ThemedText>
      <ThemedText
        style={{
          fontSize: theme.typography.size.md,
          color: theme.semantic.text.secondary,
          textAlign: 'center',
          marginBottom: theme.spacing.lg,
        }}
      >
        Capture the essentials from your training session and how it felt.
      </ThemedText>
      <View style={[styles.field, { marginBottom: theme.spacing.lg }]}>
        <DatePicker
          label="Date"
          value={date}
          onChange={setDate}
          maximumDate={new Date()}
        />
      </View>
      <View style={[styles.field, { marginBottom: theme.spacing.lg }]}>
        <DistanceField
          distance={distance}
          unit={distanceUnit}
          onChangeDistance={setDistance}
          onChangeUnit={setDistanceUnit}
          inputRef={distanceRef}
        />
      </View>

      <View style={[styles.field, { marginBottom: theme.spacing.lg }]}>
        <DurationField
          hours={durationHours}
          minutes={durationMinutes}
          seconds={durationSeconds}
          onChangeHours={setDurationHours}
          onChangeMinutes={setDurationMinutes}
          onChangeSeconds={setDurationSeconds}
          normalizedLabel={normalized.formatted}
        />

        {
          <Animated.View style={{ opacity: opacity }}>
            <ThemedText
              style={{
                marginTop: theme.spacing.md,
                marginBottom: theme.spacing.lg,
                color: theme.semantic.text.secondary,
                fontWeight: theme.typography.weights.semibold,
                fontSize: theme.typography.size.md,
              }}
            >
              Pace:{' '}
              <ThemedText
                style={{
                  color: theme.semantic.text.secondary,
                  fontWeight: theme.typography.weights.regular,
                }}
              >
                {pace}
              </ThemedText>
            </ThemedText>
          </Animated.View>
        }
      </View>

      <View style={[styles.field, { marginBottom: theme.spacing.lg }]}>
        <NotesField value={notes} onChange={setNotes} />
      </View>
      <View style={{ marginTop: theme.spacing.sm }}>
        <MoodField mood={selectedMood} onChange={setSelectedMood} />
      </View>
      <Button
        onPress={onSubmit}
        loading={logRunMutation.isPending}
        style={[styles.fullWidth, { marginTop: theme.spacing.lg }]}
      >
        Save run
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
  },
  field: {
    width: '100%',
  },
  fullWidth: { width: '100%' },
})

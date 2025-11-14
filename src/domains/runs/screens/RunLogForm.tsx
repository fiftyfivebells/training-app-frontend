import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import type { Mood } from '@domains/moods/moods.types'
import { colors, typography } from '@/theme'
import { Button, DatePicker, useAlert } from '@/components/ui'
import { ThemedText } from '@/components/ui/ThemedText'
import { useLogRun } from '../hooks'
import type { LogRunRequest } from '../api/runsApi'
import { durationToTotalSeconds, normalizeDuration } from '../utils/duration'
import { calculateMeters, type DistanceUnit } from '../utils/distance'
import { formatDateForApi } from '../utils/date'
import { DistanceField, DurationField, MoodField, NotesField } from '../components'

export const RunLogForm: React.FC = () => {
  const { alert } = useAlert()

  // core form state
  const [date, setDate] = React.useState<Date>(new Date())

  const [distance, setDistance] = React.useState('')
  const [distanceUnit, setDistanceUnit] = React.useState<DistanceUnit>('miles')

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

  return (
    <ScrollView contentContainerStyle={styles.wrapper}>
      <ThemedText style={styles.title}>Log a Run</ThemedText>
      <ThemedText style={styles.subtitle}>
        Capture the essentials from your training session and how it felt.
      </ThemedText>

      <View style={styles.field}>
        <DatePicker
          label="Date"
          value={date}
          onChange={setDate}
          maximumDate={new Date()}
        />
      </View>

      <View style={styles.field}>
        <DistanceField
          distance={distance}
          unit={distanceUnit}
          onChangeDistance={setDistance}
          onChangeUnit={setDistanceUnit}
        />
      </View>

      <View style={styles.field}>
        <DurationField
          hours={durationHours}
          minutes={durationMinutes}
          seconds={durationSeconds}
          onChangeHours={setDurationHours}
          onChangeMinutes={setDurationMinutes}
          onChangeSeconds={setDurationSeconds}
          normalizedLabel={normalized.formatted}
        />
      </View>

      <View style={styles.field}>
        <NotesField value={notes} onChange={setNotes} />
      </View>

      <View style={styles.section}>
        <MoodField mood={selectedMood} onChange={setSelectedMood} />
      </View>

      <Button
        title="Save Run"
        onPress={onSubmit}
        loading={logRunMutation.isPending}
        style={styles.submitButton}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 20,
    paddingBottom: 80,
    backgroundColor: colors.cream,
  },
  field: { marginBottom: 20 },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.brown.DEFAULT,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.stone.DEFAULT,
    textAlign: 'center',
  },
  section: { marginTop: 10 },
  submitButton: { width: '100%' },
})

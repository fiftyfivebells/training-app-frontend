import type { Mood } from '@domains/moods/moods.types'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { Button, DatePicker, useAlert } from '@/components/ui'
import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

import type { LogRunRequest } from '../api/runsApi'
import { DistanceField, DurationField, MoodField, NotesField } from '../components'
import { useLogRun } from '../hooks'
import { formatDateForApi } from '../utils/date'
import { calculateMeters, type DistanceUnit } from '../utils/distance'
import { durationToTotalSeconds, normalizeDuration } from '../utils/duration'

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
      </View>

      <View style={[styles.field, { marginBottom: theme.spacing.lg }]}>
        <NotesField value={notes} onChange={setNotes} />
      </View>

      <View style={{ marginTop: theme.spacing.sm }}>
        <MoodField mood={selectedMood} onChange={setSelectedMood} />
      </View>

      <Button
        title="Save Run"
        onPress={onSubmit}
        loading={logRunMutation.isPending}
        style={[styles.fullWidth, { marginTop: theme.spacing.lg }]}
      />
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

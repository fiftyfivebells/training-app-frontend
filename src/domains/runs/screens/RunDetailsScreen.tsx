import { parseISO } from 'date-fns'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native'

import { AppModal } from '@/components/layout/AppModal'
import { ModalHeader } from '@/components/layout/ModalHeader'
import { Button, DatePicker, useAlert } from '@/components/ui'
import { ThemedText } from '@/components/ui/ThemedText'
import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import type { Mood } from '@/domains/moods/moods.types'
import { getMoodToken } from '@/domains/moods/utils/mood'
import type { UpdateRunRequest } from '@/domains/runs/api/runsApi'
import { DistanceField, DurationField, MoodField, NotesField } from '@/domains/runs/components'
import { useDeleteRun } from '@/domains/runs/hooks/useDeleteRun'
import { useRun } from '@/domains/runs/hooks/useRun'
import { useUpdateRun } from '@/domains/runs/hooks/useUpdateRun'
import { formatDateForApi } from '@/domains/runs/utils/datetime'
import {
  calculateMeters,
  formatDistance,
  metersToDistanceUnit,
  type DistanceUnit,
} from '@/domains/runs/utils/distance'
import { durationToTotalSeconds, normalizeDuration } from '@/domains/runs/utils/duration'
import { useTheme } from '@/theme/ThemeProvider'

export default function RunDetailModal() {
  const { runId } = useLocalSearchParams<{ runId: string }>()
  const router = useRouter()
  const { alert } = useAlert()

  const { data: run, isLoading } = useRun(runId)
  const { data: moods } = useGetAllMoods()
  const deleteRun = useDeleteRun()
  const updateRun = useUpdateRun()
  const theme = useTheme()

  const [mode, setMode] = React.useState<'view' | 'edit'>('view')

  // Edit state — initialized via startEditing(), not on mount
  const [editDate, setEditDate] = React.useState<Date>(new Date())
  const [editDistance, setEditDistance] = React.useState('')
  const [editDistanceUnit, setEditDistanceUnit] = React.useState<DistanceUnit>('miles')
  const [editHours, setEditHours] = React.useState('')
  const [editMinutes, setEditMinutes] = React.useState('')
  const [editSeconds, setEditSeconds] = React.useState('')
  const [editNotes, setEditNotes] = React.useState('')
  const [editMood, setEditMood] = React.useState<Mood | null>(null)

  const close = () => {
    router.replace('/runs')
  }

  const startEditing = () => {
    if (!run) return
    const normalized = normalizeDuration(run.durationSeconds)
    setEditDate(parseISO(run.date))
    setEditDistance(metersToDistanceUnit(run.distanceMeters, run.distanceUnits).toFixed(2))
    setEditDistanceUnit(run.distanceUnits)
    setEditHours(normalized.hours)
    setEditMinutes(normalized.minutes)
    setEditSeconds(normalized.seconds)
    setEditNotes(run.notes ?? '')
    setEditMood(moods?.find((m) => m.id === run.moodId) ?? null)
    setMode('edit')
  }

  const onSave = () => {
    if (!editMood) {
      alert('Mood required', 'Please pick a mood for this run.')
      return
    }
    if (!editDistance.trim()) {
      alert('Distance required', 'Please enter the distance.')
      return
    }
    const totalSeconds = durationToTotalSeconds(editHours, editMinutes, editSeconds)
    if (totalSeconds === 0) {
      alert('Time required', 'Please enter the duration.')
      return
    }

    const payload: UpdateRunRequest = {
      date: formatDateForApi(editDate),
      distanceMeters: calculateMeters(Number(editDistance), editDistanceUnit),
      durationSeconds: totalSeconds,
      moodId: editMood.id,
      notes: editNotes || undefined,
    }

    updateRun.mutate(
      { runId, body: payload },
      {
        onSuccess: () => setMode('view'),
        onError: (error) =>
          alert('Unable to save', error.message ?? 'Please try again.'),
      },
    )
  }

  const handleDelete = () => {
    alert('Delete Run?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteRun.mutate(runId, {
            onSuccess: () => {
              router.replace('/runs')
            },
          })
        },
      },
    ])
  }

  const visible = true

  if (isLoading) {
    return (
      <AppModal visible={visible} onClose={close}>
        <ActivityIndicator
          style={{ marginTop: theme.spacing.xl }}
          color={theme.semantic.button.primary.bg}
        />
      </AppModal>
    )
  }

  if (!run) {
    return (
      <AppModal visible={visible} onClose={close}>
        <ModalHeader title="Run Details" onClose={close} />
        <ThemedText>Unable to load this run.</ThemedText>
      </AppModal>
    )
  }

  const mood = moods?.find((m) => m.id === run.moodId)
  const moodToken = mood ? getMoodToken(theme, mood.quadrant) : undefined

  if (mode === 'edit') {
    const editTotalSeconds = durationToTotalSeconds(editHours, editMinutes, editSeconds)
    const normalizedLabel = normalizeDuration(editTotalSeconds).formatted

    return (
      <AppModal visible={visible} onClose={close}>
        <ModalHeader title="Edit Run" onClose={() => setMode('view')} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        >
          <View style={[styles.field, { marginBottom: theme.spacing.lg }]}>
            <DatePicker
              label="Date"
              value={editDate}
              onChange={setEditDate}
              maximumDate={new Date()}
            />
          </View>

          <View style={[styles.field, { marginBottom: theme.spacing.lg }]}>
            <DistanceField
              distance={editDistance}
              unit={editDistanceUnit}
              onChangeDistance={setEditDistance}
              onChangeUnit={setEditDistanceUnit}
            />
          </View>

          <View style={[styles.field, { marginBottom: theme.spacing.lg }]}>
            <DurationField
              hours={editHours}
              minutes={editMinutes}
              seconds={editSeconds}
              onChangeHours={setEditHours}
              onChangeMinutes={setEditMinutes}
              onChangeSeconds={setEditSeconds}
              normalizedLabel={normalizedLabel}
            />
          </View>

          <View style={[styles.field, { marginBottom: theme.spacing.lg }]}>
            <NotesField value={editNotes} onChange={setEditNotes} />
          </View>

          <View style={{ marginBottom: theme.spacing.lg }}>
            <MoodField mood={editMood} onChange={setEditMood} />
          </View>

          <Button
            onPress={onSave}
            loading={updateRun.isPending}
            style={styles.fullWidth}
          >
            Save changes
          </Button>
        </ScrollView>
      </AppModal>
    )
  }

  return (
    <AppModal visible={visible} onClose={close}>
      <ModalHeader title="Run Details" onClose={close} />

      <ThemedText
        style={{
          color: theme.semantic.text.secondary,
          marginBottom: theme.spacing.lg,
        }}
      >
        {run.date}
      </ThemedText>

      {mood && (
        <View
          style={[
            styles.moodBadge,
            {
              borderColor: moodToken?.border ?? theme.semantic.border.default,
              backgroundColor: moodToken?.bg ?? theme.semantic.surface.cardAlt,
              paddingVertical: theme.spacing.xs,
              paddingHorizontal: theme.spacing.md,
              borderRadius: theme.radius.full,
              marginBottom: theme.spacing.lg,
            },
          ]}
        >
          <ThemedText
            style={{
              fontSize: theme.typography.size.sm,
              color: theme.semantic.text.primary,
            }}
          >
            {mood.label}
          </ThemedText>
        </View>
      )}

      <View style={[styles.sectionRow, { marginBottom: theme.spacing.lg }]}>
        <View style={[styles.section, { marginRight: theme.spacing.lg }]}>
          <ThemedText
            style={{
              fontSize: theme.typography.size.sm,
              color: theme.semantic.text.secondary,
              marginBottom: theme.spacing.xs,
            }}
          >
            Distance
          </ThemedText>
          <ThemedText
            style={{
              fontSize: theme.typography.size.lg,
              fontWeight: theme.typography.weights.semibold,
              color: theme.semantic.text.primary,
            }}
          >
            {formatDistance(run.distanceMeters, run.distanceUnits)}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText
            style={{
              fontSize: theme.typography.size.sm,
              color: theme.semantic.text.secondary,
              marginBottom: theme.spacing.xs,
            }}
          >
            Duration
          </ThemedText>
          <ThemedText
            style={{
              fontSize: theme.typography.size.lg,
              fontWeight: theme.typography.weights.semibold,
              color: theme.semantic.text.primary,
            }}
          >
            {normalizeDuration(run.durationSeconds).formatted}
          </ThemedText>
        </View>
      </View>

      {run.notes && (
        <View style={[styles.section, { marginBottom: theme.spacing.lg }]}>
          <ThemedText
            style={{
              fontSize: theme.typography.size.sm,
              color: theme.semantic.text.secondary,
              marginBottom: theme.spacing.xs,
            }}
          >
            Notes
          </ThemedText>
          <ThemedText
            style={{
              lineHeight: theme.typography.size.md * 1.5,
              color: theme.semantic.text.primary,
            }}
          >
            {run.notes}
          </ThemedText>
        </View>
      )}

      <Button
        onPress={startEditing}
        variant="outline"
        style={[styles.fullWidth, { marginBottom: theme.spacing.sm }]}
      >
        Edit run
      </Button>

      <Button
        onPress={handleDelete}
        variant="secondary"
        loading={deleteRun.isPending}
        style={styles.fullWidth}
      >
        Delete run
      </Button>
    </AppModal>
  )
}

const styles = StyleSheet.create({
  moodBadge: {
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  sectionRow: {
    flexDirection: 'row',
  },
  section: {
    flex: 1,
  },
  field: {
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
})

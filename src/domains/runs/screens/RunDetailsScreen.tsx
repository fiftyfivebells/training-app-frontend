import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { AppModal } from '@/components/layout/AppModal'
import { ModalHeader } from '@/components/layout/ModalHeader'
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useRun } from '@/domains/runs/hooks/useRun'
import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import { useDeleteRun } from '@/domains/runs/hooks/useDeleteRun'
import { getMoodCategoryColor } from '@/domains/moods/utils/mood'
import { colors, spacing, typography } from '@/theme'
import { ThemedText } from '@/components/ui/ThemedText'
import { useAlert } from '@/components/ui'
import { formatDistance } from '@/domains/runs/utils/distance'
import { normalizeDuration } from '@/domains/runs/utils/duration'

export default function RunDetailModal() {
  const { runId } = useLocalSearchParams<{ runId: string }>()
  const router = useRouter()
  const { alert } = useAlert()

  const { data: run, isLoading } = useRun(runId!)

  const { data: moods } = useGetAllMoods()
  const deleteRun = useDeleteRun()

  const close = () => router.replace('/runs')

  if (isLoading) {
    return (
      <AppModal onClose={close}>
        <ActivityIndicator style={{ marginTop: 50 }} />
      </AppModal>
    )
  }

  if (!run) {
    return (
      <AppModal onClose={close}>
        <ModalHeader title="Run Details" onClose={close} />
        <ThemedText>Unable to load this run.</ThemedText>
      </AppModal>
    )
  }

  const mood = moods?.find((m) => m.id === run.moodId)
  const moodColor = mood ? getMoodCategoryColor(mood.quadrant) : colors.sand

  const handleDelete = () => {
    alert('Delete Run?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteRun.mutate(runId, {
            onSuccess: () => router.replace('/runs'),
          })
        },
      },
    ])
  }

  return (
    <AppModal onClose={close}>
      <ModalHeader title="Run Details" onClose={close} />

      <ThemedText style={styles.date}>{run.date}</ThemedText>

      {mood && (
        <View
          style={[
            styles.moodBadge,
            { borderColor: moodColor, backgroundColor: `${moodColor}20` },
          ]}
        >
          <ThemedText style={styles.moodText}>{mood.label}</ThemedText>
        </View>
      )}

      <View style={styles.sectionRow}>
        <View style={styles.section}>
          <ThemedText style={styles.label}>Distance</ThemedText>
          <ThemedText style={styles.value}>
            {formatDistance(run.distanceMeters, run.distanceUnits)}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.label}>Duration</ThemedText>
          <ThemedText style={styles.value}>
            {normalizeDuration(run.durationSeconds).formatted}
          </ThemedText>
        </View>
      </View>

      {run.notes && (
        <View style={styles.section}>
          <ThemedText style={styles.label}>Notes</ThemedText>
          <ThemedText style={styles.notes}>{run.notes}</ThemedText>
        </View>
      )}

      <TouchableOpacity onPress={handleDelete} style={styles.delete}>
        <ThemedText style={styles.deleteText}>Delete Run</ThemedText>
      </TouchableOpacity>
    </AppModal>
  )
}

const styles = StyleSheet.create({
  date: {
    color: colors.stone.DEFAULT,
    marginBottom: spacing.lg,
  },
  moodBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  moodText: {
    fontSize: typography.sizes.sm,
    color: colors.charcoal,
  },
  sectionRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  section: {
    flex: 1,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.stone.DEFAULT,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.charcoal,
  },
  notes: {
    lineHeight: typography.sizes.base * 1.5,
    color: colors.charcoal,
  },
  delete: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.brown.DEFAULT,
    borderRadius: 999,
  },
  deleteText: {
    textAlign: 'center',
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
})

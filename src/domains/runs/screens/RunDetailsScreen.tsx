import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'

import { AppModal } from '@/components/layout/AppModal'
import { ModalHeader } from '@/components/layout/ModalHeader'
import { useAlert } from '@/components/ui'
import { ThemedText } from '@/components/ui/ThemedText'
import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import { getMoodToken } from '@/domains/moods/utils/mood'
import { useDeleteRun } from '@/domains/runs/hooks/useDeleteRun'
import { useRun } from '@/domains/runs/hooks/useRun'
import { formatDistance } from '@/domains/runs/utils/distance'
import { normalizeDuration } from '@/domains/runs/utils/duration'
import { useTheme } from '@/theme/ThemeProvider'

export default function RunDetailModal() {
  const { runId } = useLocalSearchParams<{ runId: string }>()
  const router = useRouter()
  const { alert } = useAlert()

  const { data: run, isLoading } = useRun(runId)
  const { data: moods } = useGetAllMoods()
  const deleteRun = useDeleteRun()
  const theme = useTheme()

  const close = () => {
    router.replace('/runs')
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
        <View style={styles.section}>
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

      <TouchableOpacity
        onPress={handleDelete}
        style={[
          theme.buttons.base,
          theme.buttons.variants.secondary.container,
          theme.buttons.sizes.md,
          styles.deleteButton,
          { marginTop: theme.spacing.xl },
        ]}
      >
        <ThemedText
          style={[
            {
              fontWeight: theme.typography.weights.semibold,
              textAlign: 'center',
            },
            theme.buttons.variants.secondary.text,
          ]}
        >
          Delete Run
        </ThemedText>
      </TouchableOpacity>
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
  deleteButton: {
    alignSelf: 'stretch',
  },
})

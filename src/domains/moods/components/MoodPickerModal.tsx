import React from 'react'
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

import type { Mood } from '../moods.types'

type Props = {
  visible: boolean
  onClose: () => void
  moods: Mood[]
  onSelect: (m: Mood) => void
}

export const MoodPickerModal: React.FC<Props> = ({
  visible,
  onClose,
  moods,
  onSelect,
}) => {
  const theme = useTheme()

  return (
    <Modal visible={visible} animationType="slide">
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.semantic.surface.background,
            padding: theme.spacing.lg,
            paddingTop: theme.spacing.xl,
          },
        ]}
      >
        <ThemedText
          style={{
            fontSize: theme.typography.size.xl,
            fontWeight: theme.typography.weights.bold,
            marginBottom: theme.spacing.lg,
            color: theme.semantic.text.primary,
            textAlign: 'center',
          }}
        >
          Choose Your Mood
        </ThemedText>

        <FlatList
          data={moods}
          numColumns={3}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.moodTile,
                {
                  margin: theme.spacing.xs,
                  padding: theme.spacing.md,
                  backgroundColor: theme.semantic.surface.card,
                  borderRadius: theme.radius.md,
                  borderColor: theme.semantic.border.default,
                },
              ]}
              onPress={() => {
                onSelect(item)
                onClose()
              }}
            >
              <ThemedText
                style={{
                  color: theme.semantic.text.primary,
                  fontSize: theme.typography.size.sm,
                }}
              >
                {item.label}
              </ThemedText>
            </Pressable>
          )}
        />

        <Pressable
          onPress={onClose}
          style={[
            styles.closeButton,
            {
              marginTop: theme.spacing.lg,
              padding: theme.spacing.md,
            },
          ]}
        >
          <ThemedText
            style={{
              color: theme.semantic.button.primary.bg,
              fontWeight: theme.typography.weights.semibold,
            }}
          >
            Close
          </ThemedText>
        </Pressable>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    gap: 0,
  },
  moodTile: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
  },
  closeButton: {
    alignSelf: 'center',
  },
})

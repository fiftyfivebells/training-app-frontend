import React from 'react'
import { Modal, View, FlatList, StyleSheet, Pressable } from 'react-native'
import type { Mood } from '../moods.types'
import { colors } from '@/theme/colors'

import { ThemedText } from '@/components/ui/ThemedText'

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
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <ThemedText style={styles.title}>Choose Your Mood</ThemedText>

        <FlatList
          data={moods}
          numColumns={3}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <Pressable
              style={styles.moodTile}
              onPress={() => {
                onSelect(item)
                onClose()
              }}
            >
              <ThemedText style={styles.label}>{item.label}</ThemedText>
            </Pressable>
          )}
        />

        <Pressable onPress={onClose} style={styles.closeButton}>
          <ThemedText style={styles.closeText}>Close</ThemedText>
        </Pressable>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: colors.charcoal,
    textAlign: 'center',
  },
  grid: {
    gap: 12,
  },
  moodTile: {
    flex: 1,
    margin: 6,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.stone.light,
    alignItems: 'center',
  },
  label: {
    color: colors.charcoal,
    fontSize: 14,
  },
  closeButton: {
    marginTop: 20,
    alignSelf: 'center',
    padding: 12,
  },
  closeText: {
    color: colors.primary.DEFAULT,
    fontWeight: '600',
  },
})

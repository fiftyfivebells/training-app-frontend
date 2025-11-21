import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { ThemedText } from '@/components/ui/ThemedText'
import { colors, spacing, typography } from '@/theme'

type Props = {
  title: string
  onClose: () => void
}

export function ModalHeader({ title, onClose }: Props) {
  return (
    <View style={styles.header}>
      <ThemedText style={styles.title}>{title}</ThemedText>

      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Feather name="x" size={28} color={colors.charcoal} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.brown.DEFAULT,
  },
  closeBtn: {
    padding: spacing.xs,
  },
})

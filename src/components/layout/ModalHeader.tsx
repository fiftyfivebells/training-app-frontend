import { Feather } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

type Props = {
  title: string
  onClose: () => void
}

export function ModalHeader({ title, onClose }: Props) {
  const theme = useTheme()

  return (
    <View style={[styles.header, { marginBottom: theme.spacing.lg }]}>
      <ThemedText
        style={{
          fontSize: theme.typography.size.xxl,
          fontWeight: theme.typography.weights.bold,
          color: theme.semantic.text.primary,
        }}
      >
        {title}
      </ThemedText>

      <TouchableOpacity onPress={onClose} style={{ padding: theme.spacing.xs }}>
        <Feather name="x" size={28} color={theme.semantic.text.primary} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})

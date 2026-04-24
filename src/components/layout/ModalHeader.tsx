import { Feather } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/useTheme'

type Props = {
  title: string
  onClose: () => void
}

export function ModalHeader({ title, onClose }: Props) {
  const { bg, text, rule, accent, mood, moodBg, semantic, space } = useTheme()

  return (
    <View style={[styles.header, { marginBottom: space[6] }]}>
      <ThemedText style={styles.title}>
        {title}
      </ThemedText>

      <TouchableOpacity onPress={onClose} style={{ padding: space[1] }}>
        <Feather name="x" size={28} color={text.primary} />
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
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
})

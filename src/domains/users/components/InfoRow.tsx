import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

export function InfoRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme()
  return (
    <View
      style={[
        styles.infoRow,
        {
          paddingVertical: theme.spacing.sm,
          borderBottomColor: theme.semantic.border.default,
        },
      ]}
    >
      <ThemedText
        style={{
          fontSize: theme.typography.size.sm,
          color: theme.semantic.text.secondary,
          flex: 1,
        }}
      >
        {label}
      </ThemedText>
      <ThemedText
        style={{
          fontSize: theme.typography.size.sm,
          fontWeight: theme.typography.weights.medium,
          color: theme.semantic.text.primary,
          flex: 2,
          textAlign: 'right',
        }}
      >
        {value}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
})

import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

export function VerifiedBadge({ verified }: { verified: boolean }) {
  const theme = useTheme()
  const bg = verified ? theme.semantic.mood.lowGreat.bg : theme.semantic.mood.lowTough.bg
  const border = verified
    ? theme.semantic.mood.lowGreat.border
    : theme.semantic.mood.lowTough.border
  const text = verified
    ? theme.semantic.mood.lowGreat.text
    : theme.semantic.mood.lowTough.text

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          borderRadius: theme.radius.full,
          paddingVertical: 2,
          paddingHorizontal: theme.spacing.sm,
        },
      ]}
    >
      <ThemedText
        style={{
          fontSize: theme.typography.size.xs,
          fontWeight: theme.typography.weights.semibold,
          color: text,
        }}
      >
        {verified ? 'Verified' : 'Unverified'}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
  },
})

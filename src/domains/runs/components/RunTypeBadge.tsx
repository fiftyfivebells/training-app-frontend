import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/theme/useTheme'

type RunTypeBadgeProps = {
  runType?: string
}

type BadgeStyle = {
  bg: string
  text: string
  border?: string
}

export function RunTypeBadge({ runType }: RunTypeBadgeProps) {
  const { colors } = useTheme()

  if (!runType) return null

  const normalized = runType.charAt(0).toUpperCase() + runType.slice(1).toLowerCase()

  const styleMap: Record<string, BadgeStyle> = {
    Easy: { bg: colors.semantic.successBg, text: colors.semantic.successFg },
    Recovery: { bg: colors.background.surface, text: colors.text.tertiary, border: colors.border.subtle },
    Long: { bg: colors.background.surface, text: colors.text.tertiary, border: colors.border.subtle },
    Tempo: { bg: '#1E1510', text: colors.mood.highTough },
    Speed: { bg: '#1E1510', text: colors.mood.highTough },
  }

  const style = styleMap[normalized] ?? {
    bg: colors.background.surface,
    text: colors.text.tertiary,
    border: colors.border.subtle,
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: style.bg,
          borderColor: style.border ?? 'transparent',
          borderWidth: style.border ? 1 : 0,
        },
      ]}
    >
      <Text style={[styles.label, { color: style.text }]}>{normalized}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },
})

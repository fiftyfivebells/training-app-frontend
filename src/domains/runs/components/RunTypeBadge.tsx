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
  const { bg, text, rule, accent, mood, moodBg, semantic } = useTheme()

  if (!runType) return null

  const normalized = runType.charAt(0).toUpperCase() + runType.slice(1).toLowerCase()

  const styleMap: Record<string, BadgeStyle> = {
    Easy: { bg: semantic.successBg, text: semantic.success },
    Recovery: { bg: bg.surface, text: text.tertiary, border: rule.subtle },
    Long: { bg: bg.surface, text: text.tertiary, border: rule.subtle },
    Tempo: { bg: '#1E1510', text: mood.highTough },
    Speed: { bg: '#1E1510', text: mood.highTough },
  }

  const style = styleMap[normalized] ?? {
    bg: bg.surface,
    text: text.tertiary,
    border: rule.subtle,
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

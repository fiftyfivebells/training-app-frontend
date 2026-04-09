import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

export function SectionLabel({ children }: { children: string }) {
  const theme = useTheme()
  return (
    <ThemedText
      style={{
        fontSize: theme.typography.size.xs,
        fontWeight: theme.typography.weights.semibold,
        color: theme.semantic.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: theme.spacing.sm,
      }}
    >
      {children}
    </ThemedText>
  )
}

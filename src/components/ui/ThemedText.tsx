import { Text, TextProps, StyleSheet } from 'react-native'
import { typography } from '@/theme/typography'

export function ThemedText({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.text, style]} />
}

const styles = StyleSheet.create({
  text: {
    fontFamily: typography.primary.regular,
    color: '#2D2A26',
    fontSize: typography.sizes.base,
  },
})

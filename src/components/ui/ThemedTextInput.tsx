import { TextInput, TextInputProps, StyleSheet } from 'react-native'
import { typography } from '@/theme/typography'

export function ThemedTextInput({ style, ...props }: TextInputProps) {
  return <TextInput {...props} style={[styles.input, style]} />
}

const styles = StyleSheet.create({
  input: {
    fontFamily: typography.primary.regular,
    fontSize: typography.sizes.base,
    color: '#2D2A26',
  },
})

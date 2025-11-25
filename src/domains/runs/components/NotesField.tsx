import React from 'react'
import { StyleSheet } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { ThemedTextInput } from '@/components/ui/ThemedTextInput'
import { useTheme } from '@/theme/ThemeProvider'

type NotesFieldProps = {
  value: string
  onChange: (value: string) => void
}

export const NotesField: React.FC<NotesFieldProps> = ({ value, onChange }) => {
  const theme = useTheme()

  return (
    <>
      <ThemedText
        style={{
          fontSize: theme.typography.size.sm,
          fontWeight: theme.typography.weights.semibold,
          marginBottom: theme.spacing.xs,
          color: theme.semantic.text.primary,
        }}
      >
        Notes (optional)
      </ThemedText>
      <ThemedTextInput
        style={[
          styles.notesInput,
          {
            borderColor: theme.semantic.border.default,
            backgroundColor: theme.semantic.surface.card,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            fontSize: theme.typography.size.md,
          },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder="Any details about the run..."
        multiline
      />
    </>
  )
}

const styles = StyleSheet.create({
  notesInput: {
    height: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
})

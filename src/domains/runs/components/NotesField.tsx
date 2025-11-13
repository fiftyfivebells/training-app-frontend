import React from 'react'
import { StyleSheet } from 'react-native'
import { ThemedText } from '@/components/ui/ThemedText'
import { ThemedTextInput } from '@/components/ui/ThemedTextInput'
import { colors } from '@/theme'

type NotesFieldProps = {
  value: string
  onChange: (value: string) => void
}

export const NotesField: React.FC<NotesFieldProps> = ({ value, onChange }) => {
  return (
    <>
      <ThemedText style={styles.label}>Notes (optional)</ThemedText>
      <ThemedTextInput
        style={[styles.input, styles.notesInput]}
        value={value}
        onChangeText={onChange}
        placeholder="Any details about the run..."
        multiline
      />
    </>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: colors.charcoal,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.stone.light,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  notesInput: {
    height: 120,
    textAlignVertical: 'top',
  },
})

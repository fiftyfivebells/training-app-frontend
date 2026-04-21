import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { AppearancePreference, useTokenContext } from '@/theme/ThemeContext'

export function AppearanceControl() {
  const { colors } = useTheme()
  const { appearance, setAppearance } = useTokenContext()
  const options: { label: string; value: AppearancePreference }[] = [
    { label: 'Dark', value: 'dark' },
    { label: 'Light', value: 'light' },
    { label: 'System', value: 'system' },
  ]

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background.base, borderColor: colors.border.subtle },
      ]}
    >
      {options.map((opt) => {
        const active = appearance === opt.value
        return (
          <Pressable
            key={opt.value}
            onPress={() => setAppearance(opt.value)}
            style={[
              styles.segment,
              active && { backgroundColor: colors.copper.default },
            ]}
          >
            <Text
              style={[
                styles.label,
                active ? { color: colors.background.base, fontWeight: '600' } : { color: colors.text.tertiary },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    padding: 2,
    gap: 1,
  },
  segment: {
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 11,
  },
})
